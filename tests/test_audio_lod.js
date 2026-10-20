// SPEC 66 — node tests/test_audio_lod.js
// Chaque son LOD référencé existe, est un MP3, et correspond à une carte des leçons.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const racine = path.join(__dirname, '..');
const sons = JSON.parse(fs.readFileSync(path.join(racine, 'public/audio/lod.json'), 'utf8'));
const mots = new Set();
for (const niveau of fs.readdirSync(path.join(racine, 'data/lecons'))) {
  const dossier = path.join(racine, 'data/lecons', niveau);
  if (!fs.statSync(dossier).isDirectory()) continue;
  for (const f of fs.readdirSync(dossier).filter(n => n.endsWith('.json'))) {
    JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8')).flashcards?.forEach(c => mots.add(c.lu));
  }
}
assert.ok(Object.keys(sons).length > 430, 'sons LOD présents (SPEC 69 : table de correspondance)');
for (const [mot, fichier] of Object.entries(sons)) {
  assert.match(fichier, /^lod\/[A-Z0-9]+\.mp3$/, fichier);
  const debut = fs.readFileSync(path.join(racine, 'public/audio', fichier)).subarray(0, 3);
  assert.ok(debut.toString('latin1') === 'ID3' || (debut[0] === 0xff && (debut[1] & 0xe0) === 0xe0), fichier + ' : MP3 valide');
  assert.ok(mots.has(mot), mot + ' : carte introuvable dans les leçons');
}
assert.equal(sons['Moien!'], 'lod/MOIEN2.mp3', 'Moien! = interjection « bonjour » (MOIEN2)');
const parcours = fs.readFileSync(path.join(racine, 'public/parcours.js'), 'utf8');
assert.ok(parcours.includes('boutonEcouterHtml(card.lu)'), 'bouton Écouter sur la découverte du mot');
// SPEC 68 : bouton aussi sur la correction, en révision, dans le lexique et le cours.
assert.ok((parcours.match(/boutonEcouterHtml\(/g) || []).length >= 6, 'mot caché (3) et écriture (3)');
const app = fs.readFileSync(path.join(racine, 'public/app.js'), 'utf8');
assert.ok((app.match(/boutonEcouterHtml\(/g) || []).length >= 3, 'révision (juste, faux) et tableaux de vocabulaire');
assert.ok(fs.readFileSync(path.join(racine, 'public/revision.js'), 'utf8').includes('boutonEcouterHtml(m.motSeul, true)'), 'lexique');
// SPEC 69 : correspondances manuelles appliquées, phrases LOD (fichiers M4A présents et valides).
const manuels = JSON.parse(fs.readFileSync(path.join(racine, 'tools/lod/correspondances.json'), 'utf8'));
for (const [mot, v] of Object.entries(manuels)) {
  if (mot.startsWith('_') || !mots.has(mot)) continue;
  assert.equal(sons[mot], 'lod/' + v.id + '.mp3', mot + ' : correspondance manuelle appliquée');
}
const phrases = JSON.parse(fs.readFileSync(path.join(racine, 'public/audio/lod-phrases.json'), 'utf8'));
for (const [phrase, fichier] of Object.entries(phrases)) {
  assert.match(fichier, /^lod-phrases\/[0-9a-f]{32}\.m4a$/, phrase);
  const debut = fs.readFileSync(path.join(racine, 'public/audio', fichier)).subarray(4, 8).toString('latin1');
  assert.equal(debut, 'ftyp', fichier + ' : M4A valide');
}
console.log('Audio LOD : OK — ' + Object.keys(sons).length + ' mots, fichiers MP3 valides, tous rattachés à une carte.');

// SPEC 70 — audio contextuel : choix relus valides, règles de recherche, bouton vert menthe.
const commun = require('../tools/lod/commun');
const index = commun.lireIndex();
const choix = JSON.parse(fs.readFileSync(path.join(racine, 'tools/lod/contextes.json'), 'utf8'));
for (const [lu, c] of Object.entries(choix)) {
  if (lu.startsWith('_')) continue;
  assert.ok(commun.contientExpression(index, lu, c.id), lu + ' : l\'exemple ' + c.id + ' contient l\'expression');
  assert.ok(c.fr && c.fr.trim(), lu + ' : traduction française');
  assert.equal(commun.majuscule(index.utilisables.find(e => e.id === c.id).texte), c.lod, lu + ' : texte LOD à jour');
}
const ids = l => commun.chercherContextes(index, l).map(e => e.id);
assert.ok(ids('Gudde Moien!').includes('ee04cddd4072d1d7a63aef7f1c667f6f'), 'énoncé en tête de phrase LOD');
assert.deepEqual(ids('An dir?'), [], '« An dir? » ≠ « Dir Dammen an Dir Hären » (énoncé coupé au milieu)');
assert.deepEqual(ids('Ganz gutt!'), [], 'pas d\'exemple hors A1/A2');
assert.deepEqual(ids('Moien'), [], 'un mot seul : jamais de contexte');
assert.deepEqual(ids('Wéi geet et (Iech)?'), [], 'parties facultatives exclues');
const contexte = JSON.parse(fs.readFileSync(path.join(racine, 'public/audio/lod-contexte.json'), 'utf8'));
for (const [lu, c] of Object.entries(contexte)) {
  assert.match(c.son, /^lod-phrases\/[0-9a-f]{32}\.m4a$/, lu);
  assert.equal(fs.readFileSync(path.join(racine, 'public/audio', c.son)).subarray(4, 8).toString('latin1'), 'ftyp', c.son + ' : M4A valide');
  assert.ok(choix[lu] && c.phrase && c.fr, lu + ' : phrase et traduction affichées');
}
// Bouton : or pour le son exact, menthe pour la phrase, la phrase dévoilée au clic.
const srcDialogue = fs.readFileSync(path.join(racine, 'public/dialogue.js'), 'utf8');
const doc = { addEventListener() {}, createElement: () => ({ classList: { contains: () => false } }) };
const d = new Function('document', 'escHtml', srcDialogue +
  '; return { boutonEcouterHtml, definir(m, c) { sonsLod = m; sonsContexte = c; } };')(doc,
  t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'));
d.definir({ 'Moien!': 'lod/MOIEN2.mp3' }, { 'gudde moien': { son: 'lod-phrases/ee04cddd4072d1d7a63aef7f1c667f6f.m4a', phrase: 'Gudde Moien, Madamm!', fr: 'Bonjour Madame !' } });
assert.ok(!d.boutonEcouterHtml('Moien!').includes('contexte'), 'son direct : bouton or');
const b = d.boutonEcouterHtml('Gudde Moien!');
assert.ok(b.includes('bouton-ecouter contexte') && b.includes('ecouterContexte(this)') && b.includes('aria-expanded="false"'), 'son contextuel : bouton menthe');
assert.ok(b.includes('dans une phrase : « Gudde Moien, Madamm! »') && b.includes('Dans une phrase'), 'la phrase entière est annoncée');
assert.equal(d.boutonEcouterHtml('Bis muer!'), '', 'rien sans son');
assert.ok(/\.bouton-ecouter\.contexte\s*\{[^}]*--couleur-audio-contexte/.test(fs.readFileSync(path.join(racine, 'public/style.css'), 'utf8')), 'couleur menthe');
console.log('Audio contextuel : OK — ' + Object.keys(choix).filter(k => !k.startsWith('_')).length + ' choix relus, ' + Object.keys(contexte).length + ' avec son.');

// SPEC 71 — bulle et écran d'exemples (contexte.js).
const srcContexte = fs.readFileSync(path.join(racine, 'public/contexte.js'), 'utf8');
const docC = Object.assign({}, doc, { activeElement: null });
const fen = { addEventListener() {}, innerWidth: 390, innerHeight: 844 };
const x = new Function('document', 'window', 'escHtml', srcDialogue + ';' + srcContexte +
  '; return { phraseSurlignee, exemplesDuBloc, lienExemplesHtml, definir(c, p) { sonsContexte = c; sonsPhrases = p; } };')(docC, fen,
  t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
assert.equal(x.phraseSurlignee('Gudde Moien, Madamm!', 'Gudde Moien!'), '<strong>Gudde Moien</strong>, Madamm!', 'expression surlignée');
assert.equal(x.phraseSurlignee('Bonjour, wéi geet et Iech?', 'Wéi geet et Iech?'), 'Bonjour, <strong>wéi geet et Iech</strong>?', 'insensible à la casse');
assert.equal(x.phraseSurlignee('A <b>', 'zzz'), 'A &lt;b&gt;', 'texte échappé, rien à surligner');
x.definir({ 'gudde moien': { son: 'lod-phrases/ee04cddd4072d1d7a63aef7f1c667f6f.m4a', phrase: 'Gudde Moien, Madamm!', fr: 'Bonjour Madame !' } },
  { 'merci gläichfalls': 'lod-phrases/0123456789abcdef0123456789abcdef.m4a' });
const ex = x.exemplesDuBloc([['Gudde Moien!', 'Bonjour !'], ['Merci gläichfalls!', 'Merci, pareillement !'], ['Äddi!', 'Au revoir !']]);
assert.deepEqual(ex.map(e => e.contexte), [true, false], 'phrase contextuelle puis phrase exacte ; rien sans son');
assert.ok(x.lienExemplesHtml('Saluer', [['Gudde Moien!', 'Bonjour !'], ['Merci gläichfalls!', 'Merci']]).includes('2 exemples en contexte'), 'lien avec le nombre');
assert.equal(x.lienExemplesHtml('Rien', [['Äddi!', 'Au revoir !']]), '', 'pas de lien sans exemple validé');
const indexHtml = fs.readFileSync(path.join(racine, 'public/index.html'), 'utf8');
assert.ok(indexHtml.indexOf('dialogue.js') < indexHtml.indexOf('contexte.js') && indexHtml.indexOf('contexte.js') < indexHtml.indexOf('app.js'), 'ordre des scripts');
assert.ok(app.includes('lienExemplesHtml(sec.titre, sec.items)'), 'lien sous les blocs de vocabulaire du cours');
const nav = fs.readFileSync(path.join(racine, 'public/navigation.js'), 'utf8');
assert.ok(nav.includes('fermerBulleContexte()') && nav.includes('exemplesOuverts()'), 'Retour du téléphone : bulle puis exemples');
console.log('Contexte (SPEC 71) : OK — bulle, surlignage, exemples par bloc.');
