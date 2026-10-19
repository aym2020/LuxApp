// SPEC 53 : audit du catalogue complet et du rendu « Mon chemin ».
// node tests/test_chemin_libelles.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const cheminCode = read('public/chemin.js');
const style = read('public/style.css');

const expected = [...Array.from({ length: 17 }, (_, i) => i + 1),
  ...Array.from({ length: 8 }, (_, i) => i + 20)];
const lessons = [];
for (const niveau of ['A1.1', 'A1.2']) {
  const directory = path.join(root, 'data', 'lecons', niveau);
  for (const name of fs.readdirSync(directory)) {
    if (!/^lecon-\d{2}\.json$/.test(name)) continue;
    const l = JSON.parse(read('data/lecons/' + niveau + '/' + name));
    lessons.push(l);
  }
}
lessons.sort((a, b) => a.id - b.id);
assert.deepEqual(lessons.map(l => l.id), expected, 'auditer toutes les leçons publiées');

let missionStatus = '';
const common = {
  window: { addEventListener() {} },
  document: { addEventListener() {} },
  ICONES: {
    droite: '<svg class="droite"></svg>', bulle: '<svg class="bulle"></svg>',
    cible: '<svg class="cible"></svg>'
  },
  escHtml: str => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
  unitesCoeur: l => l.unites,
  loadRun: () => null,
  getUnitBest: () => null,
  leconAcquiseParMission: () => false,
  statutMission: () => missionStatus
};
const keys = Object.keys(common);
const test = new Function(...keys,
  cheminCode + '\nreturn { CHEMIN_UNITES_COURTES, CHEMIN_MISSIONS_COURTES, ' +
  'libelleUniteChemin, libelleMissionChemin, etapesLeconHtml };')(
  ...keys.map(k => common[k])
);

assert.equal(Object.keys(test.CHEMIN_MISSIONS_COURTES).length, lessons.length,
  'chaque mission publiée a été relue');
let shorter = 0;
let stages = 0;
for (const l of lessons) {
  assert.ok(l.mission?.titre && l.scene && l.unites.length, 'parcours complet : ' + l.id);
  const expectedMission = test.CHEMIN_MISSIONS_COURTES[l.id];
  assert.ok(expectedMission, 'mission absente de l’audit ' + l.id);
  assert.equal(expectedMission[0], l.mission.titre, 'source mission périmée ' + l.id);
  const shortMission = test.libelleMissionChemin(l);
  assert.ok(shortMission && shortMission.length <= l.mission.titre.length,
    'mission courte et fidèle ' + l.id);
  for (const u of l.unites) {
    stages++;
    const rule = test.CHEMIN_UNITES_COURTES[l.id]?.[u.id];
    if (rule) {
      assert.equal(rule[0], u.titre, 'source d’unité périmée ' + l.id + '/' + u.id);
      const short = test.libelleUniteChemin(l, u);
      assert.ok(short.length <= u.titre.length, 'unité ne doit pas s’allonger');
      shorter++;
    } else {
      assert.equal(test.libelleUniteChemin(l, u), u.titre,
        'unité sans règle inchangée');
    }
  }
  const html = test.etapesLeconHtml(l, null, null, false);
  assert.equal((html.match(/<li class="[^"]*" id="chemin-u-/g) || []).length,
    l.unites.length + 1, 'unités + mission ' + l.id);
  assert.ok(html.includes('aria-label="Mission :'), 'titre entier annoncé');
  assert.ok(html.includes('title="Mission :'), 'titre entier consultable');
  assert.ok(html.includes('<strong>Mission</strong>'), 'mission sur une ligne');
  assert.ok(html.includes('Mission</strong><span aria-hidden="true">&nbsp;·&nbsp;</span>' +
    common.escHtml(shortMission)));
  assert.ok(html.includes('>Bilan&nbsp;· 10&nbsp;questions</span>'));
  assert.ok(!html.includes('questions · Optionnel</span>'), 'pas de label optionnel visible');
  assert.ok(html.includes('aria-label="Bilan, 10 questions, optionnel"'));
  assert.ok(html.includes('onclick="lancerBilanDepuisChemin(' + l.id + ')"'));
  assert.ok(html.includes('onclick="ouvrirMissionDepuisChemin(' + l.id + ')"'));
  l.unites.forEach(u => {
    assert.ok(html.includes('onclick="ouvrirUniteDepuisChemin(' + l.id + ', ' + u.id + ')"'));
    assert.ok(html.includes('title="' + common.escHtml(u.titre) + '"'),
      'titre complet de l’unité accessible');
  });
}

// Les libellés prévus ne peuvent pas être conservés en cas de changement de la source.
const source = lessons.find(l => l.id === 27);
assert.equal(test.libelleMissionChemin(source), 'Au café');
assert.equal(test.libelleUniteChemin(source, source.unites[0]), 'sinn · être');
const altered = { ...source, mission: { titre: 'Une mission différente' } };
assert.equal(test.libelleMissionChemin(altered), 'Une mission différente');
assert.equal(test.libelleUniteChemin(source, { ...source.unites[0], titre: 'Titre nouveau' }),
  'Titre nouveau');
assert.equal(test.libelleUniteChemin({ id: 999 }, { id: 1, titre: 'Sans raccourci' }),
  'Sans raccourci');

// Les statuts de mission continuent d’apparaître.
for (const [status, label] of [
  ['sansfaute', 'Sans faute'], ['reussie', 'Réussie'], ['jouee', 'À rejouer']
]) {
  missionStatus = status;
  assert.ok(test.etapesLeconHtml(source, 'mission', null, false).includes(label),
    'statut mission préservé : ' + label);
}
missionStatus = '';

assert.ok(style.includes('/* SPEC 53 — chemin plus lisible'));
assert.ok(style.includes('.chemin .pas .unites button'));
assert.ok(style.includes('min-height: 44px'));
assert.ok(style.includes('-webkit-line-clamp: 2'));
assert.ok(style.includes('text-overflow: ellipsis'));
assert.ok(style.includes('.chemin .pas.ouverte > .carte-lecon'));
assert.ok(!style.includes('.chemin-page { overflow: hidden; }'));

console.log('SPEC 53 : OK — ' + lessons.length + ' leçons, ' + stages +
  ' unités, ' + shorter + ' intitulés abrégés, 25 missions et bilans préservés.');
