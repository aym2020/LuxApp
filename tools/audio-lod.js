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
// CONTEXTE (SPEC 70) → public/audio/lod-phrases/<ID>.m4a + public/audio/lod-contexte.json
//   Mot ou expression sans son direct : phrase d'exemple LOD qui le contient, choisie et traduite
//   à la main dans tools/lod/contextes.json. La phrase complète est toujours affichée avec sa traduction.
//   Le script propose aussi les nouveaux candidats (à relire avant de les ajouter).
// Rapport de couverture par leçon : node tools/lod/audit-audio.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { RACINE, motCarte, phraseCle, rangSens, majuscule, lireIndex, chercherContextes, contientExpression,
  tableDirecte, elementsLecon, lecons } = require('./lod/commun');

const CORRESPONDANCES = path.join(__dirname, 'lod/correspondances.json');
const MIROIR_MOTS = 'https://raw.githubusercontent.com/robertoentringer/lod-mp3-mirror/master/2020-12-18-lod-opendata/';
const SOURCE_PHRASES = 'https://lod.lu/uploads/examples/AAC/'; // {2 premiers caractères}/{ID}.m4a
const DOSSIER_MOTS = path.join(RACINE, 'public/audio/lod');
const DOSSIER_PHRASES = path.join(RACINE, 'public/audio/lod-phrases');
const TABLE_MOTS = path.join(RACINE, 'public/audio/lod.json');
const TABLE_PHRASES = path.join(RACINE, 'public/audio/lod-phrases.json');
const CONTEXTES = path.join(__dirname, 'lod/contextes.json');
const TABLE_CONTEXTE = path.join(RACINE, 'public/audio/lod-contexte.json');

// Cartes « mot caché » et phrases (au moins deux mots) des leçons.
function contenuLecons() {
  const cartes = [];
  const phrases = new Set();
  for (const l of lecons()) {
    for (const c of l.lecon.flashcards || []) cartes.push({ lu: c.lu, fr: c.fr });
    for (const e of elementsLecon(l.lecon)) if (e.lu.split(/\s+/).length >= 2) phrases.add(e.lu);
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

// ─── Contexte ───────────────────────────────────────────────────────────────
function traiterContextes(index, essai) {
  const choix = JSON.parse(fs.readFileSync(CONTEXTES, 'utf8'));
  const refuses = choix['_refusés'] || {};
  const direct = tableDirecte(lireTable(TABLE_MOTS));
  const phrases = lireTable(TABLE_PHRASES);
  const table = {};
  const refus = { 'choix invalide (exemple absent ou ne contenant pas l\'expression)': [], 'traduction manquante': [],
    'téléchargement impossible': [], 'nouveaux candidats à relire': [] };
  const elements = new Set();
  for (const l of lecons()) for (const e of elementsLecon(l.lecon)) elements.add(e.lu);
  for (const lu of elements) {
    if (direct(lu) || phrases[lu]) continue; // le son exact passe toujours avant
    const c = choix[lu];
    if (!c) {
      if (!refuses[lu] && !index.parPhrase[phraseCle(lu)]) {
        const p = chercherContextes(index, lu)[0];
        if (p) refus['nouveaux candidats à relire'].push(lu + ' → ' + p.id + ' « ' + majuscule(p.texte) + ' »');
      }
      continue;
    }
    if (!contientExpression(index, lu, c.id)) { refus['choix invalide (exemple absent ou ne contenant pas l\'expression)'].push(lu + ' → ' + c.id); continue; }
    if (!c.fr) { refus['traduction manquante'].push(lu); continue; }
    const ex = index.utilisables.find(e => e.id === c.id);
    const entree = { son: 'lod-phrases/' + c.id + '.m4a', phrase: majuscule(ex.texte), fr: c.fr };
    if (essai) { table[lu] = entree; continue; }
    if (!telecharger(SOURCE_PHRASES + c.id.slice(0, 2) + '/' + c.id + '.m4a', path.join(DOSSIER_PHRASES, c.id + '.m4a'), estM4a)) {
      refus['téléchargement impossible'].push(lu + ' → ' + c.id);
      continue;
    }
    table[lu] = entree;
  }
  if (!essai) ecrireTable(TABLE_CONTEXTE, table);
  console.log('\nCONTEXTE : ' + Object.keys(choix).filter(k => !k.startsWith('_')).length + ' choix relus, ' +
    Object.keys(table).length + ' avec son' + (essai ? ' (essai)' : ''));
  rapport('Contexte', refus);
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
  traiterContextes(index, essai);
}

main();
