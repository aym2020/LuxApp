// SPEC 50 — tests unitaires + intégration ciblée, sans navigateur.
// Usage : node tests/test_reponses_alternatives.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const lesson = JSON.parse(read('data/lecons/A1.1/lecon-01.json'));
const app = read('public/app.js');
const debut = app.indexOf('function normalize(str) {');
const fin = app.indexOf('\n}\n', debut) + 2;
assert.ok(debut >= 0 && fin > debut, 'normalize() introuvable');
const normalize = new Function('return (' + app.slice(debut, fin) + ');')();
const matcher = new Function('normalize', read('public/correction.js') +
  '\nreturn { reponseReconnue, autresReponsesAcceptees };')(normalize);
const ecriture = id => lesson.ecriture.find(x => x.id === id);

for (const [saisie, item, attendu] of [
  ['Moien!', ecriture(2002), 'Moien!'],
  ['GUDDE  MOIEN', ecriture(2002), 'Gudde Moien!'],
  ['moien här kremer', lesson.scene[1], 'Moien, Här Kremer!'],
  ['moien madamm weber', lesson.scene[5], 'Moien, Madamm Weber!'],
  ['gudde moien anna', ecriture(2005), 'Gudde Moien, Anna!'],
  ['Moien!', ecriture(2001), 'Moien!'],
  ['Gudde Moien!', ecriture(2001), null],
  ['Gudden Moien!', ecriture(2002), null],
  ['Äddi!', ecriture(2002), null],
  ['Moien, Madamm Weber!', lesson.scene[1], null]
]) {
  assert.equal(matcher.reponseReconnue(saisie, item), attendu, saisie);
}
assert.deepEqual(matcher.autresReponsesAcceptees(ecriture(2002), 'Moien!'), ['Gudde Moien!']);
 
// SPEC 78 : « Salut ! » en salutation accepte Salut! ou Hallo!
// y compris devant un prénom inchangé. Ne pas appliquer cette variante à l'au revoir.
for (const [id, principale, alternative, fausse] of [
  [2008, 'Salut!', 'Hallo!', 'Äddi!'],
  [2009, 'Salut Pierre!', 'Hallo Pierre!', 'Hallo Jean!'],
  [2010, 'Salut Jean!', 'Hallo Jean!', 'Hallo Pierre!']
]) {
  const q=ecriture(id);
  assert.equal(q.lu, principale);
  assert.deepEqual(q.alternatives, [alternative], 'alternative exacte '+id);
  assert.equal(matcher.reponseReconnue(alternative, q), alternative, 'reconnue '+id);
  assert.equal(matcher.reponseReconnue(principale, q), principale, 'principale '+id);
  assert.equal(matcher.reponseReconnue(fausse, q), null, 'autre sens/prénom refusé '+id);
  assert.deepEqual(matcher.autresReponsesAcceptees(q, alternative), [principale]);
}
assert.equal(matcher.reponseReconnue('Hallo!', ecriture(2001)),null,
  '« Bonjour ! » reste Moien! — aucune équivalence globale');
assert.equal(matcher.reponseReconnue('Hallo!', ecriture(2028)),null,
  'Hallo! ne remplace pas Äddi! pour prendre congé');


// Exécute la véritable validation d'écriture avec seulement ses dépendances DOM simulées.
const champ = { value: '', disabled: false, className: '' };
const documentEcriture = {
  addEventListener() {},
  getElementById(id) { assert.equal(id, 'pc-ecr-input'); return champ; }
};
const ecrHarness = [
  "return function tester(item, texte) {",
  "  pLecon = lesson; pAttente = false; ecrEssais = 0; ecrCoquille = false;",
  "  const appels = { progression: [], feedback: [] };",
  "  trouverItem = () => item;",
  "  etapeCourante = () => ({ queue: [item.id] });",
  "  attentionItem = () => ''; attentionHtml = () => '';",
  "  enregistrer = (...a) => appels.progression.push(a);",
  "  showFeedback = (...a) => appels.feedback.push(a);",
  "  const input = document.getElementById('pc-ecr-input');",
  "  input.value = texte; input.disabled = false; input.className = '';",
  "  ecrValiderPc();",
  "  return { appels, input };",
  "};"
].join('\n');
const ecr = new Function('normalize', 'reponseReconnue', 'autresReponsesAcceptees',
  'lesson', 'document', 'escHtml', 'boutonEcouterHtml',
  read('public/parcours.js') + '\n' + ecrHarness)(
    normalize, matcher.reponseReconnue, matcher.autresReponsesAcceptees,
    lesson, documentEcriture, String, () => ''
  );
for (const formule of ['Moien!', 'Gudde Moien!']) {
  const x = ecr(ecriture(2002), formule);
  assert.equal(x.appels.progression.length, 1, 'un seul enregistrement');
  assert.equal(x.appels.progression[0][1], 1, 'score 100 %');
  assert.equal(x.appels.progression[0][2], true, 'du premier coup');
  assert.equal(x.appels.feedback[0][0], true, 'feedback de succès');
  assert.ok(x.appels.feedback[0][2].includes('Autre formulation correcte'));
  assert.equal(x.input.className, 'ecr-input correct');
}

// Vérifier la vraie écriture de l'unité : aucune perte de vie ou de points.
for (const [id, forme] of [[2008,'Hallo!'],[2009,'Hallo Pierre!'],[2010,'Hallo Jean!']]) {
  const x=ecr(ecriture(id),forme);
  assert.equal(x.appels.progression.length,1,'une progression enregistrée '+id);
  assert.equal(x.appels.progression[0][1],1,'score maximal '+id);
  assert.equal(x.appels.progression[0][2],true,'bonne réponse du premier coup '+id);
  assert.equal(x.appels.feedback[0][0],true,'succès pour '+id);
  assert.ok(x.appels.feedback[0][2].includes('Autre formulation correcte'),
    'afficher Salut comme autre forme');
}

// Exécute la vraie mission et vérifie les vies, l'enregistrement et le dialogue.
const inputMission = { value: '', disabled: false };
const missionHarness = [
  "return function tester(idx, texte) {",
  "  ms = { idx, essais: 0, dernierEssai: '', resultats: [], formesValidees: [], vies: 3, coquille: false };",
  "  const retours = [];",
  "  retourMission = (...a) => retours.push(a);",
  "  document.getElementById('ms-input').value = texte;",
  "  missionValider();",
  "  return { resultats: ms.resultats, formesValidees: ms.formesValidees, vies: ms.vies, retours };",
  "};"
].join('\n');
const mission = new Function('normalize', 'reponseReconnue', 'autresReponsesAcceptees',
  'pLecon', 'document', 'escHtml',
  read('public/mission.js') + '\n' + missionHarness)(
    normalize, matcher.reponseReconnue, matcher.autresReponsesAcceptees,
    lesson, { getElementById: () => inputMission }, String
  );
for (const [i, formule] of [
  [1, 'Moien, Här Kremer!'],
  [3, 'Moien!'],
  [5, 'Moien, Madamm Weber!'],
  [3, 'Gudde Moien!']
]) {
  const x = mission(i, formule);
  assert.equal(x.resultats[i], 'ok');
  assert.equal(x.formesValidees[i], matcher.reponseReconnue(formule, lesson.scene[i]));
  assert.equal(x.vies, 3);
  assert.equal(x.retours[0][0], 'ok');
  assert.ok(x.retours[0][2].includes('Autre formulation correcte'));
}

// SPEC 44/50 : après rafraîchissement, la réponse validée reste dans le dialogue.
const repriseHarness = [
  "return note => {",
  "  openMission = () => { ms = { idx: 0, essais: 0, dernierEssai: '', resultats: [], formesValidees: [], vies: 3, coquille: false, vues: 0 }; };",
  "  fermerPanneauSansSuite = () => {}; majVies = () => {}; renderMission = () => {};",
  "  reprendreMission(note);",
  "  return { idx: ms.idx, reponses: ms.formesValidees, bulle: bulleJeuHtml(pLecon.scene[3], 3, true) };",
  "};"
].join('\n');
const reprise = new Function(
  'pLecon', 'document', 'ICONES', 'escHtml',
  read('public/mission.js') + '\n' + repriseHarness
)(lesson, {}, { coche: '✓' }, String);
const formesValidees = [];
formesValidees[3] = 'Moien!';
const resultats = [];
resultats[3] = 'ok';
const restaure = reprise({ idx: 3, resultats, formesValidees, vies: 3, essais: 0 });
assert.equal(restaure.idx, 4, 'reprend après la réplique déjà validée');
assert.equal(restaure.reponses[3], 'Moien!');
assert.ok(restaure.bulle.includes('Moien!'), 'montre la formulation acceptée');
assert.ok(!restaure.bulle.includes('Gudde Moien!'), 'ne remplace pas la réponse par la principale');
assert.ok(read('public/navigation.js').includes('formesValidees: ms.formesValidees'),
  'sauvegarde de la forme retenue dans la navigation');

// Révision et ancien onglet d'écriture : même justesse, mêmes points.
const elements = new Map();
function fakeElt(id) {
  if (!elements.has(id)) elements.set(id, {
    value: '', disabled: false, className: '', style: {},
    classList: { remove() {}, add() {} },
    addEventListener() {}, after() {}, focus() {}
  });
  return elements.get(id);
}
const appHarness = [
  "return (mode, item, texte) => {",
  "  lecons = [lesson];",
  "  const progres = [];",
  "  updateQuestionProgress = (...a) => progres.push(a);",
  "  attentionDe = () => '';",
  "  const entree = document.getElementById(mode === 'legacy' ? 'ecr-input' : 'session-input');",
  "  entree.value = texte; entree.disabled = false; entree.className = '';",
  "  if (mode === 'legacy') {",
  "    ecrCards = [{ ...item, _qid: item.id }]; ecrIndex = 0; ecrScore = 0;",
  "    ecrAnswered = false; ecrDirLuFr = false; currentLecon = lesson;",
  "    validateEcriture();",
  "    return { score: ecrScore, progres };",
  "  }",
  "  session = { answered: false, questions: [{ q: item, type: 'ecriture', qid: item.id, leconId: lesson.id }],",
  "    index: 0, mode: 'review', essais: 0, score: 0, options: {} };",
  "  validateSessionInput();",
  "  return { score: session.score, progres };",
  "};"
].join('\n');
const ancienEtRevision = new Function(
  'reponseReconnue', 'autresReponsesAcceptees', 'lesson', 'document', 'escHtml', 'boutonEcouterHtml',
  read('public/app.js') + '\n' + appHarness
)(
  matcher.reponseReconnue, matcher.autresReponsesAcceptees, lesson,
  { getElementById: fakeElt, createElement: fakeElt }, String, () => ''
);
for (const mode of ['legacy', 'review']) {
  for (const texte of ['Moien!', 'Gudde Moien!']) {
    const x = ancienEtRevision(mode, ecriture(2002), texte);
    assert.equal(x.score, 1, 'un point pour ' + mode + ' / ' + texte);
    assert.equal(x.progres.length, 1);
    assert.equal(x.progres[0][3], true, 'première tentative notée correcte');
  }
}

// Les alternatives sont déclarées sur des cas explicites, sans doublons.
for (const item of lesson.ecriture.concat(lesson.scene.filter(x => x.qui === 'toi'))) {
  if (!item.alternatives) continue;
  assert.ok(item.alternatives.length > 0);
  const noms = [item.lu, ...item.alternatives].map(normalize);
  assert.equal(new Set(noms).size, noms.length);
}
assert.equal(ecriture(2001).alternatives, undefined);
assert.equal(lesson.mission.version, 2);
assert.equal(lesson.scene.filter(x => x.qui === 'toi').length, 10);
console.log('SPEC 50 + 78 : OK — Salut!/Hallo! équivalents en salutation, score, prénoms et mission.');
