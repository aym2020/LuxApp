// Audit reproductible du lot 3, sans dépendance externe.
// Exécution : node tests/test_lot3_contenu.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ids = [14, 15, 16, 17];
const expectedV1 = {
  14: { quiz: 20, trous: 24, ecriture: 39 },
  15: { quiz: 24, trous: 24, ecriture: 34 },
  16: { quiz: 29, trous: 25, ecriture: 45 },
  17: { quiz: 22, trous: 16, ecriture: 28 }
};
const types = ['flashcards', 'quiz', 'trous', 'ecriture'];
const bounds = { flashcards: [5, 10], quiz: [6, 10], trous: [6, 10], ecriture: [5, 8] };
const clean = s => String(s || '').toLowerCase().replace(/<[^>]*>/g, '').trim();
let total = 0;

for (const id of ids) {
  const file = path.join(__dirname, '..', 'data', 'lecons', 'A1.1', 'lecon-' + id + '.json');
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(d.id, id);
  assert.deepEqual(d.v1, expectedV1[id], 'Archive V1 : leçon ' + id);
  assert.ok(d.mission?.titre && d.mission?.contexte && d.mission?.objectif, 'Mission absente : ' + id);
  assert.ok(d.unites.length >= 2 && d.unites.length <= 4, 'Nombre d’unités : ' + id);
  const validUnits = new Set(d.unites.map(u => u.id));
  assert.equal(validUnits.size, d.unites.length, 'Unités uniques : ' + id);
  assert.deepEqual(d.unites.map(u => u.id), d.unites.map((_, i) => i + 1), 'Unités séquentielles : ' + id);

  const replies = d.scene.filter(x => x.qui === 'toi');
  assert.ok(replies.length >= 3 && replies.length <= 5, 'Nombre de réponses dans la mission : ' + id);
  let previous = 0;
  for (const x of d.scene) {
    assert.ok(x.lu && x.fr && x.qui && validUnits.has(x.unite), 'Réplique incomplète : ' + id);
    assert.ok(x.unite >= previous, 'Ordre du dialogue : ' + id);
    previous = x.unite;
  }
  for (const u of d.unites) {
    assert.ok(u.titre && u.regle && Array.isArray(u.phrase) && u.phrase.length === 2, 'Unité incomplète : ' + id + '/' + u.id);
    assert.ok(Array.isArray(u.pieges) && u.pieges.length <= 2 && u.pieges.length > 0, 'Points d’attention : ' + id + '/' + u.id);
    assert.ok(replies.some(x => x.unite === u.id), 'Unité non réutilisée dans la mission : ' + id + '/' + u.id);
    assert.ok(d.cours.some(x => x.unite === u.id && x.type === 'vocab'), 'Cours de vocabulaire absent : ' + id + '/' + u.id);
    assert.ok(d.cours.some(x => x.unite === u.id && x.type === 'callout'), 'Règle du cours absente : ' + id + '/' + u.id);
  }

  for (const type of types) {
    const items = d[type];
    assert.deepEqual(items.map(x => x.id), items.map((_, i) => i + 2001), 'IDs séquentiels : ' + id + '/' + type);
    for (const x of items) {
      assert.ok(validUnits.has(x.unite), 'Unité inconnue : ' + id + '/' + type + '/' + x.id);
      assert.ok(x.plus === undefined || x.plus === true, 'plus incorrect : ' + id + '/' + x.id);
      if (type === 'flashcards') {
        assert.ok(x.fr && x.lu && !x.lu.includes('/') && x.lu.length <= 24, 'Mot caché invalide : ' + id + '/' + x.id);
      }
      if (type === 'quiz') {
        assert.ok(x.question && x.reponse && Array.isArray(x.distracteurs), 'Quiz incomplet : ' + id + '/' + x.id);
        assert.ok(!x.distracteurs.includes(x.reponse), 'Bonne réponse parmi distracteurs : ' + id + '/' + x.id);
        assert.equal(new Set(x.distracteurs).size, x.distracteurs.length, 'Distracteurs doublons : ' + id + '/' + x.id);
      }
      if (type === 'trous') {
        assert.ok(x.fr && x.avant !== undefined && x.apres !== undefined && x.trou, 'Trou incomplet : ' + id + '/' + x.id);
        assert.ok(Array.isArray(x.choix) && x.choix.includes(x.trou), 'Réponse absente des choix : ' + id + '/' + x.id);
        assert.equal(new Set(x.choix).size, x.choix.length, 'Choix doublons : ' + id + '/' + x.id);
      }
      if (type === 'ecriture') assert.ok(x.fr && x.lu, 'Écriture incomplète : ' + id + '/' + x.id);
    }
    for (const u of d.unites) {
      const count = items.filter(x => x.unite === u.id && !x.plus).length;
      const [min, max] = bounds[type];
      assert.ok(count >= min && count <= max, 'Volume du cœur : ' + id + '/' + u.id + '/' + type + ' (' + count + ')');
    }
  }

  for (const u of d.unites) {
    const unitCourse = d.cours.filter(x => x.unite === u.id).map(x => clean(JSON.stringify(x))).join(' ');
    for (const c of d.flashcards.filter(x => x.unite === u.id && !x.plus)) {
      assert.ok(unitCourse.includes(clean(c.lu)), 'Mot non expliqué dans le cours : ' + id + '/' + u.id + ' / ' + c.lu);
    }
  }

  // Ne pas reposer deux fois exactement la même question dans le cœur d'une leçon.
  for (const type of ['quiz', 'trous', 'ecriture']) {
    const label = type === 'quiz' ? 'question' : 'fr';
    const seen = new Set();
    for (const x of d[type].filter(x => !x.plus)) {
      const val = clean(x[label]);
      assert.ok(!seen.has(val), 'Question cœur dupliquée : ' + id + '/' + type + ' : ' + val);
      seen.add(val);
    }
  }

  total += types.reduce((n, t) => n + d[t].length, 0);
  console.log('OK leçon ' + id + ' : ' + d.unites.length + ' unités / ' +
    replies.length + ' répliques à produire / archive V1 / exercices valides');
}
console.log('Lot 3 conforme : 4 leçons, ' + total + ' exercices.');
