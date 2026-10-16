// Contrôles structurels des six leçons migrées dans le lot 2.
// Lancer : node tests/test_lot2_contenu.js
const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;

const ids = [7, 9, 10, 11, 12, 13];
const types = ['flashcards', 'quiz', 'trous', 'ecriture'];
const limites = { flashcards: [5, 10], quiz: [6, 10], trous: [6, 10], ecriture: [5, 8] };

for (const id of ids) {
  const filename = path.join(__dirname, '..', 'data', 'lecons', 'A1.1', 'lecon-' + String(id).padStart(2, '0') + '.json');
  const l = JSON.parse(fs.readFileSync(filename, 'utf8'));
  assert.equal(l.id, id, 'ID de leçon incorrect : ' + id);
  assert.ok(l.v1 && l.v1.quiz && l.v1.trous && l.v1.ecriture, 'archive V1 absente : ' + id);
  assert.ok(l.mission && l.mission.titre && l.mission.contexte && l.mission.objectif, 'mission manquante : ' + id);
  assert.ok(l.unites.length >= 2 && l.unites.length <= 4, 'nombre d\'unités : ' + id);
  assert.ok(l.scene.length >= 6, 'scène trop courte : ' + id);
  const coeur = l.unites.filter(u => !u.bonus);
  assert.ok(l.scene.filter(r => r.qui === 'toi').length >= 3, 'mission trop peu active : ' + id);
  assert.ok(l.scene.filter(r => r.qui === 'toi').length <= 5, 'mission trop longue : ' + id);
  const idsUnites = new Set(l.unites.map(u => u.id));
  let precedent = 0;
  for (const r of l.scene) {
    assert.ok(idsUnites.has(r.unite), 'réplique sans unité : ' + id);
    assert.ok(r.lu && r.fr && r.qui, 'réplique incomplète : ' + id);
    assert.ok(r.unite >= precedent, 'ordre des unités dans la scène : ' + id);
    precedent = r.unite;
  }
  for (const u of coeur) {
    assert.ok(l.scene.some(r => r.unite === u.id && r.qui === 'toi'), 'unité sans production dans la mission : ' + id + '/' + u.id);
    assert.ok(Array.isArray(u.phrase) && u.phrase.length === 2, 'phrase de l\'unité absente : ' + id + '/' + u.id);
    assert.ok(l.cours.some(b => b.unite === u.id && b.type === 'vocab'), 'vocabulaire du cours absent : ' + id + '/' + u.id);
  }
  for (const t of types) {
    const items = l[t];
    assert.deepEqual(items.map(x => x.id), items.map((_, i) => 2001 + i), 'IDs non séquentiels : ' + id + '/' + t);
    for (const x of items) assert.ok(idsUnites.has(x.unite), 'unité inconnue : ' + id + '/' + t + '/' + x.id);
    for (const u of l.unites) {
      const n = items.filter(x => x.unite === u.id && !x.plus).length;
      const [min, max] = limites[t];
      assert.ok(n >= min && n <= max, 'coeur hors limites : ' + id + '/unité ' + u.id + '/' + t + ' (' + n + ')');
    }
  }
  for (const c of l.flashcards) {
    assert.ok(c.fr && c.lu && !c.lu.includes('/'), 'carte ambiguë : ' + id + '/' + c.id);
    assert.ok(c.lu.length <= 24, 'carte trop longue : ' + id + '/' + c.id);
  }
  for (const q of l.quiz) {
    assert.ok(q.question && q.reponse && Array.isArray(q.distracteurs), 'quiz incomplet : ' + id + '/' + q.id);
    assert.ok(!q.distracteurs.includes(q.reponse), 'bonne réponse dans les distracteurs : ' + id + '/' + q.id);
    assert.equal(new Set(q.distracteurs).size, q.distracteurs.length, 'distracteurs en double : ' + id + '/' + q.id);
  }
  for (const q of l.trous) {
    assert.ok(Array.isArray(q.choix) && q.choix.includes(q.trou), 'réponse absente du trou : ' + id + '/' + q.id);
    assert.equal(new Set(q.choix).size, q.choix.length, 'choix en double : ' + id + '/' + q.id);
  }
  for (const q of l.ecriture) assert.ok(q.fr && q.lu, 'écriture incomplète : ' + id + '/' + q.id);
  console.log('ok : leçon ' + id + ' · ' + l.unites.length + ' unités · ' + l.scene.filter(x => x.qui === 'toi').length + ' répliques à produire');
}
console.log('Lot 2 : six leçons structurellement valides.');
