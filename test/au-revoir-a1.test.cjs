'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'data');
const debutants = JSON.parse(fs.readFileSync(path.join(base, 'lecons', 'A1.1', 'lecon-01.json'), 'utf8'));
const variant = /\b(?:Awar|Awuer)\b/iu;
const mainSections = ['scene', 'unites', 'flashcards', 'quiz', 'trous'];

test('A1.1 leçon 1 : les variantes ne sont ni imposées ni mises en scène', () => {
  for (const section of mainSections) {
    assert.doesNotMatch(JSON.stringify(debutants[section]), variant, section);
  }
  const core = debutants.cours.filter(b => !b.plus);
  assert.doesNotMatch(JSON.stringify(core), variant, 'cours principal');
});

test('Les variantes ne sont enseignées que dans le cours complémentaire', () => {
  const optional = debutants.cours.filter(b => b.plus);
  const text = JSON.stringify(optional);
  assert.match(text, /Awar!/u);
  assert.match(text, /Awuer!/u);
  assert.match(text, /Variante d.Awar/u);
});

test('Äddi est enseigné explicitement et reste la réponse de base', () => {
  const fc = debutants.flashcards.find(x => x.id === 2031);
  const q = debutants.quiz.find(x => x.id === 2031);
  const e = debutants.ecriture.find(x => x.id === 2038);
  const h = debutants.trous.find(x => x.id === 2028);
  assert.equal(fc.fr, 'Au revoir !');
  assert.equal(fc.lu, 'Äddi!');
  assert.equal(q.question, 'Äddi!');
  assert.equal(q.reponse, 'Au revoir !');
  assert.equal(e.fr, 'Au revoir !');
  assert.equal(e.lu, 'Äddi!');
  assert.deepEqual(e.alternatives, ['Awar!', 'Awuer!']);
  assert.equal(h.trou, 'Äddi');
});

test('Awar et Awuer ne sont acceptés que comme alternatives en écriture libre', () => {
  const items = debutants.ecriture.filter(q => variant.test(JSON.stringify(q)));
  assert.equal(items.length, 1);
  assert.equal(items[0].id, 2038);
  assert.deepEqual(items[0].alternatives, ['Awar!', 'Awuer!']);

  // Réutiliser la vraie validation de l'app (spec 50), sans la réimplémenter.
  const correction = fs.readFileSync(path.join(__dirname, '..', 'public', 'correction.js'), 'utf8');
  const start = correction.indexOf('function reponseReconnue(');
  const end = correction.indexOf('// Formes correctes autres', start);
  assert.ok(start >= 0 && end > start);
  const fonction = correction.slice(start, end);
  const normalize = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
  const reconnaitre = new Function('normalize', fonction + '; return reponseReconnue;')(normalize);
  for (const rep of ['Äddi!', 'Awar!', 'Awuer!', 'awar', 'AWUER']) {
    assert.ok(reconnaitre(rep, items[0]), 'réponse valide : ' + rep);
  }
  assert.equal(reconnaitre('Moien!', items[0]), null);
  const plusLong = debutants.ecriture.find(q => q.id === 2039);
  assert.equal(reconnaitre('Awar!', plusLong), null);
});

test('Le deuxième exercice pratique une nouvelle phrase avec Äddi sans créer de doublon', () => {
  const a = debutants.flashcards.find(x => x.id === 2032);
  const q = debutants.quiz.find(x => x.id === 2032);
  const e = debutants.ecriture.find(x => x.id === 2039);
  assert.equal(a.lu, 'Äddi, schéinen Dag!');
  assert.equal(q.question, a.lu);
  assert.equal(q.reponse, 'Au revoir, bonne journée !');
  assert.equal(e.fr, q.reponse);
  assert.equal(e.lu, a.lu);
  assert.ok(!q.distracteurs.includes(q.reponse));
  assert.equal(debutants.quiz.filter(x => x.question === q.question).length, 1);
});

test('Les IDs des exercices restent uniques et séquentiels, sans perte de questions', () => {
  for (const [section, count] of [['flashcards', 38],['quiz',38],['trous',34],['ecriture',47]]) {
    const ids = debutants[section].map(x => x.id);
    assert.equal(ids.length, count, section);
    assert.equal(new Set(ids).size, ids.length, section);
    for (let i = 1; i < ids.length; i++) assert.equal(ids[i], ids[i - 1] + 1, section);
  }
  assert.equal(debutants.scene.length, 23);
});

test('Aucun Awar/Awuer imposé dans les autres leçons ou missions A1.1/A1.2', () => {
  for (const level of ['A1.1','A1.2']) {
    const dir = path.join(base, 'lecons', level);
    for (const file of fs.readdirSync(dir).filter(f => /^lecon-\d+\.json$/.test(f))) {
      if (level === 'A1.1' && file === 'lecon-01.json') continue;
      const text = fs.readFileSync(path.join(dir, file), 'utf8');
      assert.doesNotMatch(text, variant, level + '/' + file);
    }
  }
  const scan = dir => {
    for (const item of fs.readdirSync(dir, { withFileTypes:true })) {
      const filename = path.join(dir, item.name);
      if (item.isDirectory()) scan(filename);
      else if (item.name.endsWith('.json')) {
        assert.doesNotMatch(fs.readFileSync(filename,'utf8'), variant, filename);
      }
    }
  };
  scan(path.join(base, 'missions'));
});
