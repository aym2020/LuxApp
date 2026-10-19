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
