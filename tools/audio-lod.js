// Récupère la prononciation officielle LOD des mots et des phrases des leçons.
//
//   node tools/audio-lod.js            → rapprochement + téléchargement des sons manquants
//   node tools/audio-lod.js --essai    → rapprochement seul (rien n'est téléchargé ni écrit)
//
// À relancer après l'ajout de leçons : aucune autre manipulation (l'index LOD est versionné).
// Source : tools/lod/lod-index.json.gz, construit depuis l'export XML des articles LOD
// (tools/lod/construire-index.js, seulement quand le LOD publie une nouvelle version).
//
// MOTS (cartes « mot caché ») → public/audio/lod/<ID>.mp3 + public/audio/lod.json
//   Un son n'est gardé que si :
//   1. le mot de la carte (sans article ni ponctuation) est exactement le mot LOD ;
//   2. la traduction française de la carte correspond à un sens LOD de ce mot,
//      ou le mot figure dans tools/lod/correspondances.json (sens vérifié à la main) ;
//   3. un seul article LOD convient, ou plusieurs avec la même prononciation (même API) ;
//   4. le fichier téléchargé est un MP3 valide.
// PHRASES (dialogues, scènes, écriture, cours) → public/audio/lod-phrases/<ID>.m4a + public/audio/lod-phrases.json
//   Une phrase n'est gardée que si son texte est identique à un exemple enregistré du LOD
//   (seuls la casse, les espaces et la ponctuation sont ignorés) et si le fichier est un M4A valide.
//   Jamais d'enregistrement d'une phrase différente.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const RACINE = path.join(__dirname, '..');
const INDEX = path.join(__dirname, 'lod/lod-index.json.gz');
const CORRESPONDANCES = path.join(__dirname, 'lod/correspondances.json');
const MIROIR_MOTS = 'https://raw.githubusercontent.com/robertoentringer/lod-mp3-mirror/master/2020-12-18-lod-opendata/';
const SOURCE_PHRASES = 'https://lod.lu/uploads/examples/AAC/'; // {2 premiers caractères}/{ID}.m4a
const DOSSIER_MOTS = path.join(RACINE, 'public/audio/lod');
const DOSSIER_PHRASES = path.join(RACINE, 'public/audio/lod-phrases');
const TABLE_MOTS = path.join(RACINE, 'public/audio/lod.json');
const TABLE_PHRASES = path.join(RACINE, 'public/audio/lod-phrases.json');

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

// ─── Données ────────────────────────────────────────────────────────────────
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
  for (const e of exemples) {
    // Une partie entre parenthèses est facultative : on ne sait pas si elle est prononcée.
    if (e.texte.includes('(')) continue;
    const cle = phraseCle(e.texte);
    (parPhrase[cle] = parPhrase[cle] || []).push(e);
  }
  return { parMot, parId, parPhrase };
}

// Cartes « mot caché » et phrases (au moins deux mots) des leçons.
function contenuLecons() {
  const cartes = [];
  const phrases = new Set();
  const ajouter = t => { if (typeof t === 'string' && t.trim().split(/\s+/).length >= 2) phrases.add(t.trim()); };
  const base = path.join(RACINE, 'data/lecons');
  for (const niveau of fs.readdirSync(base)) {
    const dossier = path.join(base, niveau);
    if (!fs.statSync(dossier).isDirectory()) continue;
    for (const f of fs.readdirSync(dossier).filter(n => n.endsWith('.json'))) {
      const l = JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8'));
      for (const c of l.flashcards || []) { cartes.push({ lu: c.lu, fr: c.fr }); ajouter(c.lu); }
      for (const e of l.ecriture || []) { ajouter(e.lu); (e.aide_vocab || []).forEach(a => ajouter(a.lu)); }
      for (const s of l.scene || []) { ajouter(s.lu); (s.aide_vocab || []).forEach(a => ajouter(a.lu)); }
      for (const b of l.cours || []) {
        if (b.type === 'dialogue') (b.echanges || []).forEach(e => ajouter(e[0]));
        if (b.type === 'vocab') (b.items || []).forEach(i => ajouter(i[0]));
      }
    }
  }
  return { cartes, phrases: [...phrases] };
}

// ─── Téléchargement ─────────────────────────────────────────────────────────
function estMp3(debut) {
  return (debut[0] === 0x49 && debut[1] === 0x44 && debut[2] === 0x33) || (debut[0] === 0xff && (debut[1] & 0xe0) === 0xe0);
}
function estM4a(debut) {
  return debut.subarray(4, 8).toString('latin1') === 'ftyp';
}
// Renvoie true si le fichier est présent et valide ; supprime tout fichier invalide.
function telecharger(url, cible, valide) {
  if (fs.existsSync(cible) && valide(fs.readFileSync(cible).subarray(0, 12))) return true;
  try {
    execFileSync('curl', ['-sSfL', '--max-time', '30', '-o', cible, url], { stdio: 'ignore' });
    if (valide(fs.readFileSync(cible).subarray(0, 12))) return true;
  } catch (e) { /* accès refusé ou fichier introuvable */ }
  if (fs.existsSync(cible)) fs.unlinkSync(cible);
  return false;
}
function lireTable(fichier) {
  return fs.existsSync(fichier) ? JSON.parse(fs.readFileSync(fichier, 'utf8')) : {};
}
function ecrireTable(fichier, table) {
  const trie = {};
  Object.keys(table).sort((a, b) => a.localeCompare(b)).forEach(k => { trie[k] = table[k]; });
  fs.writeFileSync(fichier, JSON.stringify(trie, null, 2) + '\n');
}
function rapport(titre, refus) {
  for (const [raison, liste] of Object.entries(refus)) {
    console.log('\n' + titre + ' — ' + raison + ' : ' + liste.length);
    liste.forEach(x => console.log('  - ' + x));
  }
}

// ─── Mots ───────────────────────────────────────────────────────────────────
function traiterMots(index, cartes, essai) {
  const manuels = JSON.parse(fs.readFileSync(CORRESPONDANCES, 'utf8'));
  const table = lireTable(TABLE_MOTS);
  const refus = { 'expression de plusieurs mots': [], 'mot absent de LOD': [], 'sens différent': [], 'ambigu': [],
    'correspondance manuelle invalide': [], 'son absent du miroir': [] };
  const vus = new Set();
  let nouveaux = 0;
  for (const c of cartes) {
    if (vus.has(c.lu)) continue;
    vus.add(c.lu);
    const mot = motCarte(c.lu);
    let id = null;
    if (manuels[c.lu]) {
      // Sens vérifié à la main ; on contrôle quand même l'identifiant et le mot.
      const a = index.parId[manuels[c.lu].id];
      if (!a || !mot || a.lemme.toLowerCase() !== mot) { refus['correspondance manuelle invalide'].push(c.lu + ' → ' + manuels[c.lu].id); continue; }
      id = a.id;
    } else {
      if (!mot) { refus['expression de plusieurs mots'].push(c.lu); continue; }
      const articles = index.parMot[mot] || [];
      if (!articles.length) { refus['mot absent de LOD'].push(c.lu); continue; }
      const bons = articles.map(a => ({ ...a, rang: rangSens(c.fr, a.fr) }))
        .filter(a => a.rang >= 0).sort((a, b) => a.rang - b.rang);
      if (!bons.length) { refus['sens différent'].push(c.lu + ' (' + c.fr + ')'); continue; }
      // Homographes de même prononciation : un seul son suffit, le sens principal d'abord.
      const memePrononciation = bons.every(a => a.ipa && a.ipa === bons[0].ipa);
      if (bons.length > 1 && !memePrononciation) { refus['ambigu'].push(c.lu + ' → ' + bons.map(a => a.id).join(', ')); continue; }
      id = bons[0].id;
    }
    const fichier = 'lod/' + id + '.mp3';
    if (essai) { table[c.lu] = fichier; continue; }
    if (!telecharger(MIROIR_MOTS + id + '.mp3', path.join(DOSSIER_MOTS, id + '.mp3'), estMp3)) {
      refus['son absent du miroir'].push(c.lu + ' → ' + id);
      delete table[c.lu];
      continue;
    }
    if (table[c.lu] !== fichier) nouveaux++;
    table[c.lu] = fichier;
  }
  if (!essai) ecrireTable(TABLE_MOTS, table);
  console.log('MOTS : ' + Object.keys(table).length + ' avec son' + (essai ? ' (essai)' : ', dont ' + nouveaux + ' nouveaux'));
  rapport('Mots', refus);
}

// ─── Phrases ────────────────────────────────────────────────────────────────
function traiterPhrases(index, phrases, essai) {
  const table = lireTable(TABLE_PHRASES);
  const refus = { 'ambiguës : plusieurs enregistrements du même texte (le premier est gardé)': [], 'téléchargement impossible': [] };
  let trouvees = 0;
  let absentes = 0;
  for (const p of phrases) {
    const exemples = index.parPhrase[phraseCle(p)];
    if (!exemples) { absentes++; continue; }
    trouvees++;
    if (exemples.length > 1) refus['ambiguës : plusieurs enregistrements du même texte (le premier est gardé)'].push(p);
    const id = exemples[0].id;
    if (essai) { console.log('  trouvée : ' + p + ' → ' + id + ' (« ' + exemples[0].texte + ' »)'); continue; }
    const cible = path.join(DOSSIER_PHRASES, id + '.m4a');
    if (!telecharger(SOURCE_PHRASES + id.slice(0, 2) + '/' + id + '.m4a', cible, estM4a)) {
      refus['téléchargement impossible'].push(p + ' → ' + id);
      delete table[p];
      continue;
    }
    table[p] = 'lod-phrases/' + id + '.m4a';
  }
  if (!essai) ecrireTable(TABLE_PHRASES, table);
  console.log('\nPHRASES : ' + phrases.length + ' dans les leçons, ' + trouvees + ' trouvées dans le LOD, ' +
    absentes + ' non trouvées, ' + Object.keys(table).length + ' avec son' + (essai ? ' (essai)' : ''));
  rapport('Phrases', refus);
}

function main() {
  const essai = process.argv.includes('--essai');
  const index = lireIndex();
  const { cartes, phrases } = contenuLecons();
  if (!essai) {
    fs.mkdirSync(DOSSIER_MOTS, { recursive: true });
    fs.mkdirSync(DOSSIER_PHRASES, { recursive: true });
  }
  traiterMots(index, cartes, essai);
  traiterPhrases(index, phrases, essai);
}

main();
