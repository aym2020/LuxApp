// Fonctions partagées par tools/audio-lod.js et tools/lod/audit-audio.js.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const RACINE = path.join(__dirname, '../..');
const INDEX = path.join(__dirname, 'lod-index.json.gz');

// ─── Normalisation ──────────────────────────────────────────────────────────
const ARTICLES_LU = ['den', 'de', 'déi', 'dat', "d'", 'en', 'eng', 'e', 'ee'];
const ARTICLES_FR = ['le', 'la', 'les', "l'", 'un', 'une', 'des', 'du', 'se', "s'"];

function sansAccent(t) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '');
}
// Mot luxembourgeois d'une carte : sans article, ni ponctuation, ni parenthèses ; null si plusieurs mots.
function motCarte(lu) {
  let t = lu.replace(/\(.*?\)/g, ' ').replace(/[!?.,;:«»"]/g, ' ').replace(/’/g, "'").trim().toLowerCase();
  for (const a of ARTICLES_LU) {
    if (a.endsWith("'") ? t.startsWith(a) : t.startsWith(a + ' ')) { t = t.slice(a.length).trim(); break; }
  }
  return t.split(/\s+/).length === 1 ? t : null;
}
// Phrase comparable : minuscules, apostrophes unifiées, sans ponctuation, espaces simples.
function phraseCle(texte) {
  return String(texte).replace(/<[^>]*>/g, ' ').toLowerCase().replace(/[’`]/g, "'")
    .replace(/[.,!?;:«»"…()–—]/g, ' ').replace(/\s+/g, ' ').trim();
}
// Mots français porteurs de sens.
function motsFr(texte) {
  const t = sansAccent(texte.toLowerCase()).replace(/\(.*?\)/g, ' ').replace(/’/g, "'");
  return t.split(/[^a-z']+/).map(m => m.replace(/^(l|d|s|qu|j|n|m|t)'/, ''))
    .filter(m => m.length > 1 && !ARTICLES_FR.includes(m) && !['de', 'et', 'ou', 'a', 'au', 'aux', 'en'].includes(m));
}
// Rang de la 1re traduction LOD qui correspond (0 = sens principal), ou -1.
function rangSens(frCarte, traductionsLod) {
  const carte = motsFr(frCarte);
  return traductionsLod.findIndex(tr => {
    const lod = motsFr(tr);
    return lod.length > 0 && lod.every(m => carte.includes(m));
  });
}
// Texte LOD affiché : première lettre en majuscule (« moien, wéi geet et? » → « Moien, wéi geet et? »).
function majuscule(texte) {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

// ─── Index LOD ──────────────────────────────────────────────────────────────
const RANG_NIVEAU = { A1: 0, A2: 1, '': 2 };
const MOTS_MAX_CONTEXTE = 14; // au-delà, la phrase n'aide plus un débutant

function lireIndex() {
  const { mots, exemples } = JSON.parse(zlib.gunzipSync(fs.readFileSync(INDEX)));
  const parMot = {};
  const parId = {};
  for (const m of mots) {
    const cle = m.lemme.toLowerCase();
    (parMot[cle] = parMot[cle] || []).push(m);
    parId[m.id] = m;
  }
  const parPhrase = {};
  const parMotExemple = {}; // mot → exemples qui le contiennent (recherche contextuelle)
  const utilisables = [];
  for (const e of exemples) {
    // Une partie entre parenthèses est facultative : on ne sait pas si elle est prononcée.
    if (e.texte.includes('(')) continue;
    const cle = phraseCle(e.texte);
    (parPhrase[cle] = parPhrase[cle] || []).push(e);
    const ex = { ...e, cle, nbMots: cle.split(' ').length, niveau: (parId[e.entree] || {}).niveau || '' };
    utilisables.push(ex);
    for (const m of new Set(cle.split(' '))) (parMotExemple[m] = parMotExemple[m] || []).push(ex);
  }
  return { parMot, parId, parPhrase, parMotExemple, nbExemples: exemples.length, utilisables };
}

// Meilleur exemple LOD où l'expression est prononcée telle quelle, ou null.
//   Énoncé complet (« Gudde Moien! », « Wéi geet et Iech? ») : il doit former à lui seul une partie
//   de la phrase LOD, entre deux signes de ponctuation (« Gudde Moien, Madamm, wat kann ech… »).
//   Fragment (« e bësse », « Wat fir eng ») : il peut être au milieu d'une phrase courte.
// Toujours un exemple d'un mot LOD de niveau A1 ou A2 (phrases simples).
// Ce ne sont que des propositions : seules celles de tools/lod/contextes.json (relues, traduites) sont utilisées.
// Ordre : niveau A1, puis A2, puis la phrase la plus courte.
const MOTS_MAX_FRAGMENT = 8;
function segments(texte) {
  return texte.split(/[,.;:!?]+/).map(phraseCle).filter(Boolean);
}
function chercherContextes(index, texte) {
  if (/[()\/…]|\.\.\./.test(texte)) return []; // variantes ou parties facultatives
  const cle = phraseCle(texte);
  const mots = cle.split(' ');
  if (mots.length < 2) return []; // un mot seul : seulement le son direct (risque d'homographe)
  const enonce = /[.!?]\s*$/.test(texte.trim());
  const listes = mots.map(m => index.parMotExemple[m] || []);
  const plusCourte = listes.reduce((a, b) => (b.length < a.length ? b : a));
  const candidats = plusCourte.filter(e => {
    if (e.cle === cle || e.niveau === '' || e.nbMots > MOTS_MAX_CONTEXTE) return false;
    if (enonce) return segments(e.texte).includes(cle);
    return e.nbMots <= MOTS_MAX_FRAGMENT && (' ' + e.cle + ' ').includes(' ' + cle + ' ');
  });
  return candidats.sort((a, b) => RANG_NIVEAU[a.niveau] - RANG_NIVEAU[b.niveau] || a.nbMots - b.nbMots || a.id.localeCompare(b.id));
}
// L'exemple contient-il bien l'expression selon les règles ci-dessus ? (contrôle des choix manuels)
// SPEC 73 : un mot seul (forme fléchie relue à la main, « Kanner », « gedronk ») est accepté
// si l'exemple prononce exactement cette forme, comme mot entier.
function contientExpression(index, texte, idExemple) {
  if (phraseCle(texte).split(' ').length === 1) {
    const ex = index.utilisables.find(e => e.id === idExemple);
    // « d'Këschten » prononce bien « Këschten » : l'article élidé est ignoré.
    return !!ex && ex.cle.split(' ').some(m => m === phraseCle(texte) || m.replace(/^d'/, '') === phraseCle(texte).replace(/^d'/, ''));
  }
  return chercherContextes(index, texte).some(e => e.id === idExemple);
}

// Son direct tel que l'application le trouve (public/dialogue.js : sonDuMot) :
// le texte exact, ou le mot sans article ni ponctuation s'il ne désigne qu'un seul son.
function cleSon(texte) {
  // Note entre parenthèses non prononcée (« de Brudder (pl. d'Bridder) ») : ignorée, comme dans public/dialogue.js.
  let t = String(texte).replace(/<[^>]*>/g, '').replace(/\s*\([^)]*\)/g, ' ').replace(/[!?.,;:«»"]/g, ' ').replace(/’/g, "'").trim().toLowerCase();
  for (const article of ['den ', 'de ', 'déi ', 'dat ', 'en ', 'eng ', 'e ', "d'"]) {
    if (t.startsWith(article)) { t = t.slice(article.length); break; }
  }
  return t.trim().replace(/\s+/g, ' ');
}
function tableDirecte(sons) {
  const simples = {};
  for (const [mot, f] of Object.entries(sons)) {
    const c = cleSon(mot);
    simples[c] = (c in simples && simples[c] !== f) ? null : f;
  }
  return lu => sons[lu] || simples[cleSon(lu)] || null;
}

// ─── Leçons ─────────────────────────────────────────────────────────────────
// Éléments luxembourgeois d'une leçon, sans doublon, avec leur traduction quand elle existe.
function elementsLecon(l) {
  const vus = new Map();
  const ajouter = (lu, fr, source) => {
    if (typeof lu !== 'string' || !lu.trim()) return;
    const t = lu.trim();
    if (!vus.has(t)) vus.set(t, { lu: t, fr: fr || '', source });
  };
  for (const c of l.flashcards || []) ajouter(c.lu, c.fr, 'carte');
  for (const s of l.scene || []) { ajouter(s.lu, s.fr, 'scène'); (s.aide_vocab || []).forEach(a => ajouter(a.lu, a.fr, 'aide')); }
  for (const e of l.ecriture || []) { ajouter(e.lu, e.fr, 'écriture'); (e.aide_vocab || []).forEach(a => ajouter(a.lu, a.fr, 'aide')); }
  for (const b of l.cours || []) {
    if (b.type === 'dialogue') (b.echanges || []).forEach(e => ajouter(e[0], e[1], 'dialogue'));
    if (b.type === 'vocab') (b.items || []).forEach(i => ajouter(i[0], i[1], 'cours'));
  }
  return [...vus.values()];
}
function lecons() {
  const liste = [];
  const base = path.join(RACINE, 'data/lecons');
  for (const niveau of fs.readdirSync(base).sort()) {
    const dossier = path.join(base, niveau);
    if (!fs.statSync(dossier).isDirectory()) continue;
    for (const f of fs.readdirSync(dossier).filter(n => n.endsWith('.json')).sort()) {
      const l = JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8'));
      liste.push({ niveau, fichier: f, id: l.id, titre: l.titre, titre_fr: l.titre_fr, lecon: l });
    }
  }
  return liste;
}

module.exports = { RACINE, motCarte, phraseCle, rangSens, majuscule, lireIndex, chercherContextes, contientExpression, tableDirecte, elementsLecon, lecons };
