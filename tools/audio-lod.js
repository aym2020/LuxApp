// Récupère la prononciation officielle LOD des mots des leçons (cartes « mot caché »).
//
//   node tools/audio-lod.js chemin/vers/new_lod-art.xml [--essai]
//   --essai : rapprochement seul, sans téléchargement ni écriture (pour relire les paires).
//
// Source des sons : miroir des MP3 LOD (un fichier par identifiant d'article LOD).
// Le fichier XML des articles LOD (data.public.lu) donne, pour chaque identifiant,
// le mot, sa catégorie et ses sens en français. Un son n'est gardé que si :
//   1. le mot de la carte (sans article ni ponctuation) est exactement le mot LOD ;
//   2. la traduction française de la carte correspond à un sens LOD de ce mot ;
//   3. un seul article LOD remplit ces deux conditions, ou plusieurs mais avec la
//      même prononciation (même transcription API) ; sinon : ambigu, ignoré.
// Résultat : public/audio/lod/<ID>.mp3 et public/audio/lod.json { "mot de la carte": "lod/<ID>.mp3" }.
// Les refus sont listés à la fin, avec leur raison.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const MIROIR = 'https://raw.githubusercontent.com/robertoentringer/lod-mp3-mirror/master/2020-12-18-lod-opendata/';
const RACINE = path.join(__dirname, '..');
const DOSSIER_SONS = path.join(RACINE, 'public/audio/lod');
const FICHIER_CARTE = path.join(RACINE, 'public/audio/lod.json');

// ─── 1. Lecture du XML LOD ──────────────────────────────────────────────────
function lireLod(fichier) {
  const xml = fs.readFileSync(fichier, 'utf8');
  const parMot = {}; // mot en minuscules → [{ id, lemme, categorie, fr: [traductions] }]
  const morceaux = xml.split('<entry id="').slice(1);
  for (const m of morceaux) {
    const id = m.slice(0, m.indexOf('"'));
    const lemme = (m.match(/<lemma[^>]*>([^<]*)<\/lemma>/) || [])[1];
    if (!lemme) continue;
    const categorie = (m.match(/<partOfSpeech[^>]*>([^<]*)<\/partOfSpeech>/) || [])[1] || '';
    const ipa = (m.match(/<ipa>([^<]*)<\/ipa>/) || [])[1] || '';
    const fr = [];
    const blocsFr = m.match(/<targetLanguage lang="fr">[\s\S]*?<\/targetLanguage>/g) || [];
    for (const bloc of blocsFr) {
      for (const t of bloc.match(/<translation>([^<]*)<\/translation>/g) || []) {
        fr.push(t.replace(/<\/?translation>/g, ''));
      }
    }
    const cle = lemme.toLowerCase();
    (parMot[cle] = parMot[cle] || []).push({ id, lemme, categorie, ipa, fr });
  }
  return parMot;
}

// ─── 2. Normalisation ───────────────────────────────────────────────────────
const ARTICLES_LU = ['den', 'de', 'déi', 'dat', "d'", 'en', 'eng', 'e', 'ee'];
const ARTICLES_FR = ['le', 'la', 'les', "l'", 'un', 'une', 'des', 'du', 'se', "s'"];

function sansAccent(t) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '');
}
// Mot luxembourgeois de la carte : sans article, ni ponctuation, ni parenthèses.
function motCarte(lu) {
  let t = lu.replace(/\(.*?\)/g, ' ').replace(/[!?.,;:«»"]/g, ' ').replace(/’/g, "'").trim().toLowerCase();
  for (const a of ARTICLES_LU) {
    if (a.endsWith("'") ? t.startsWith(a) : t.startsWith(a + ' ')) { t = t.slice(a.length).trim(); break; }
  }
  return t.split(/\s+/).length === 1 ? t : null; // un seul mot : LOD n'a de son que par mot
}
// Mots français porteurs de sens, pour comparer la carte et les sens LOD.
function motsFr(texte) {
  const t = sansAccent(texte.toLowerCase()).replace(/\(.*?\)/g, ' ').replace(/’/g, "'");
  return t.split(/[^a-z']+/).map(m => m.replace(/^(l|d|s|qu|j|n|m|t)'/, ''))
    .filter(m => m.length > 1 && !ARTICLES_FR.includes(m) && !['de', 'et', 'ou', 'a', 'au', 'aux', 'en'].includes(m));
}
// Le sens de la carte correspond-il à une traduction LOD ?
// Renvoie le rang de la 1re traduction LOD qui correspond (0 = sens principal), ou -1.
function rangSens(frCarte, traductionsLod) {
  const carte = motsFr(frCarte);
  return traductionsLod.findIndex(tr => {
    const lod = motsFr(tr);
    return lod.length > 0 && lod.every(m => carte.includes(m));
  });
}

// ─── 3. Cartes des leçons ───────────────────────────────────────────────────
function cartesDesLecons() {
  const cartes = [];
  const base = path.join(RACINE, 'data/lecons');
  for (const niveau of fs.readdirSync(base)) {
    const dossier = path.join(base, niveau);
    if (!fs.statSync(dossier).isDirectory()) continue;
    for (const f of fs.readdirSync(dossier).filter(n => n.endsWith('.json'))) {
      const lecon = JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8'));
      for (const c of lecon.flashcards || []) cartes.push({ lu: c.lu, fr: c.fr, lecon: f });
    }
  }
  return cartes;
}

// ─── 4. Rapprochement et téléchargement ─────────────────────────────────────
function telecharger(id) {
  const cible = path.join(DOSSIER_SONS, id + '.mp3');
  if (fs.existsSync(cible)) return true;
  try {
    execFileSync('curl', ['-sSfL', '--max-time', '30', '-o', cible, MIROIR + id + '.mp3']);
    const debut = fs.readFileSync(cible).subarray(0, 3);
    const mp3 = (debut[0] === 0x49 && debut[1] === 0x44 && debut[2] === 0x33) || (debut[0] === 0xff && (debut[1] & 0xe0) === 0xe0);
    if (!mp3) { fs.unlinkSync(cible); return false; }
    return true;
  } catch (e) {
    if (fs.existsSync(cible)) fs.unlinkSync(cible);
    return false;
  }
}

function main() {
  const fichierXml = process.argv[2];
  const essai = process.argv.includes('--essai');
  if (!fichierXml) { console.error('Usage : node tools/audio-lod.js new_lod-art.xml'); process.exit(1); }
  const lod = lireLod(fichierXml);
  if (!essai) fs.mkdirSync(DOSSIER_SONS, { recursive: true });
  const resultat = fs.existsSync(FICHIER_CARTE) ? JSON.parse(fs.readFileSync(FICHIER_CARTE, 'utf8')) : {};
  const refus = { 'expression de plusieurs mots': [], 'mot absent de LOD': [], 'sens différent': [], 'ambigu': [], 'son absent du miroir': [] };
  const vus = new Set();

  for (const c of cartesDesLecons()) {
    if (vus.has(c.lu)) continue;
    vus.add(c.lu);
    const mot = motCarte(c.lu);
    if (!mot) { refus['expression de plusieurs mots'].push(c.lu); continue; }
    const articles = lod[mot] || [];
    if (!articles.length) { refus['mot absent de LOD'].push(c.lu); continue; }
    // Articles dont un sens correspond, le sens principal d'abord.
    const bons = articles.map(a => ({ ...a, rang: rangSens(c.fr, a.fr) }))
      .filter(a => a.rang >= 0).sort((a, b) => a.rang - b.rang);
    if (!bons.length) { refus['sens différent'].push(c.lu + ' (' + c.fr + ')'); continue; }
    // Homographes de même prononciation (ex. « moien » nom et interjection) : un seul son suffit.
    const memePrononciation = bons.every(a => a.ipa && a.ipa === bons[0].ipa);
    if (bons.length > 1 && !memePrononciation) { refus['ambigu'].push(c.lu + ' → ' + bons.map(a => a.id).join(', ')); continue; }
    const id = bons[0].id;
    if (essai) { console.log('OK  ' + c.lu + ' (' + c.fr + ') → ' + id + ' ' + bons[0].categorie + ' [' + bons[0].fr.slice(0, 4).join(' ; ') + ']'); resultat[c.lu] = 'lod/' + id + '.mp3'; continue; }
    if (!telecharger(id)) { refus['son absent du miroir'].push(c.lu + ' → ' + id); continue; }
    resultat[c.lu] = 'lod/' + id + '.mp3';
  }

  const trie = {};
  Object.keys(resultat).sort((a, b) => a.localeCompare(b)).forEach(k => { trie[k] = resultat[k]; });
  if (!essai) fs.writeFileSync(FICHIER_CARTE, JSON.stringify(trie, null, 2) + '\n');
  console.log('Sons validés : ' + Object.keys(trie).length + ' (public/audio/lod.json)');
  for (const [raison, liste] of Object.entries(refus)) {
    console.log('\n' + raison + ' : ' + liste.length);
    liste.slice(0, 15).forEach(x => console.log('  - ' + x));
    if (liste.length > 15) console.log('  … ' + (liste.length - 15) + ' de plus');
  }
}

main();
