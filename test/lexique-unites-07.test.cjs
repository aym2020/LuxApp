'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { analyserLecon } = require('../tools/audit-lexique-unites.cjs');
const base = path.resolve(__dirname, '../data/lecons/A1.1/lecon-07.json');
const lecon = JSON.parse(fs.readFileSync(base, 'utf8'));

test('leçon 7 : aucun exercice ne demande un mot de Mot caché situé plus tard', () => {
  assert.deepEqual(analyserLecon(lecon), []);
});
test('Cap Vert est enseigné dans Mot caché unité 2 et absent des exercices unité 1', () => {
  assert.equal(lecon.flashcards.find(c => c.lu === 'Cap Vert').unite, 2);
  for (const type of ['quiz', 'trous', 'ecriture']) {
    assert.ok(!(lecon[type] || []).some(x => x.unite === 1 &&
      /Cap.Vert/i.test([x.fr, x.lu, x.question, x.reponse, x.apres].join(' '))), type);
  }
  assert.ok(!(lecon.cours || []).some(b => b.unite === 1 && /Cap.Vert/i.test(JSON.stringify(b))));
  assert.equal(lecon.ecriture.find(x => x.id === 2024).unite, 2);
});
test('leçon 7 : les questions sur le lexique « + » ne sont pas obligatoires', () => {
  for (const id of [2002, 2004, 2006])
    assert.equal(lecon.quiz.find(q => q.id === id).plus, true);
  for (const id of [2013, 2014])
    assert.equal(lecon.trous.find(q => q.id === id).plus, true);
});
test('leçon 7 : Hierkonft est découvert avant son exercice supplémentaire', () => {
  const mot = lecon.flashcards.find(x => x.lu === 'Hierkonft');
  const exercice = lecon.ecriture.find(x => x.id === 2030);
  assert.ok(mot && mot.plus && mot.unite === exercice.unite && exercice.plus);
  assert.ok(lecon.cours.some(b => b.unite === mot.unite && b.rubrique === 'lexique' &&
    JSON.stringify(b.items).includes('Hierkonft')));
});
test('la règle détecte un pays futur et un mot « + » testé dans le cœur', () => {
  const ancien = structuredClone(lecon);
  ancien.ecriture.find(x => x.id === 2024).unite = 1;
  assert.ok(analyserLecon(ancien).some(e => e.id === 2024 && e.forme === 'Cap Vert'));
  const plus = structuredClone(lecon);
  delete plus.quiz.find(q => q.id === 2002).plus;
  assert.ok(analyserLecon(plus).some(e => e.id === 2002 && e.forme === 'England'));
});
test('les IDs et le nombre des exercices d’origine sont conservés', () => {
  const attendu = { quiz: 20, trous: 16, ecriture: 44 };
  Object.entries(attendu).forEach(([type, count]) => {
    assert.equal(lecon[type].length, count);
    assert.equal(new Set(lecon[type].map(x => x.id)).size, count);
  });
  assert.equal(new Set(lecon.flashcards.map(x => x.id)).size, lecon.flashcards.length);
});
test('le parcours conserve Mot caché avant Quiz, Trous et Écriture', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../public/parcours.js'), 'utf8');
  assert.match(source, /type: 'flashcards'[\s\S]*type: 'quiz'[\s\S]*type: 'trous'[\s\S]*type: 'ecriture'/);
  assert.match(source, /items\.filter\(x => x\.unite === uniteId\)/);
  assert.match(source, /if \(quoi === 'coeur'\) items = items\.filter\(x => !x\.plus\)/);
});
