// SPEC 56 — bouton « Valider » d'Erreurs fréquentes.
// Exécute les véritables fonctions de public/app.js sans navigateur.
// node tests/test_session_erreurs_frequentes.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const elements = new Map();
function domElement(id) {
  if (!elements.has(id)) elements.set(id, {
    id, value: '', textContent: '', innerHTML: '', className: '',
    disabled: false, style: {}, children: [],
    classList: {
      add(...cs) { const el = elements.get(id); cs.forEach(c => { if (!el.className.split(/\s+/).includes(c)) el.className += ' ' + c; }); },
      remove(...cs) { const el = elements.get(id); el.className = el.className.split(/\s+/).filter(x => !cs.includes(x)).join(' '); },
      contains(c) { return elements.get(id).className.split(/\s+/).includes(c); },
      toggle() {}
    },
    addEventListener(ev, handler) { this['on' + ev] = handler; },
    appendChild(child) { this.children.push(child); },
    after(child) { this.nextButton = child; },
    focus() {}, blur() {}, scrollIntoView() {}, remove() {}, click() { if (this.onclick) this.onclick(); }
  });
  return elements.get(id);
}
const document = {
  getElementById: domElement,
  createElement: tag => domElement('new-element-' + Math.random()),
  querySelectorAll() { return []; },
  querySelector() { return null; },
  addEventListener() {}
};
let callbacks = [];
const harness = [
  'let updates = [], timerCallbacks = [], rendered = 0;',
  'getFrequentErrors = () => [];',
  'getReviewQuestions = () => [];',
  'getExamQuestions = () => [];',
  'showView = () => {};',
  'renderSessionQ = () => { rendered++; session.answered = false; session.essais = 0; };',
  'updateQuestionProgress = (...args) => updates.push(args);',
  'aideErreur = () => ({ diagnostic: "", attention: "" });',
  'aideErreurHtml = () => "";', // SPEC 94 : même aide qu'en Leçon (diagnostic.js), sans contenu ici
  'afficherVerdictChoix = () => {};', // SPEC 94 : affichage des choix, vérifié dans le navigateur (test_spec94_verdict.py)
  'boutonEcouterHtml = () => "";', // stub du module audio (non chargé dans ce test isolé)
  // SPEC 95 : cadrage et pied d'action mesurés dans le navigateur (test_spec95_exercices.py) ;
  // ici on enregistre seulement le bouton demandé au pied.
  'cadrerFeedback = () => {};',
  'let pied = null;',
  'renderActionExercice = (dock, config) => { pied = config; return null; };',
  'const matcher = s => normalize(s);',
  'reponseReconnue = (s, item) => [item.lu, ...(item.alternatives || [])].find(x => matcher(x) === matcher(s)) || null;',
  'autresReponsesAcceptees = (item, accepted) => [item.lu, ...(item.alternatives || [])].filter(x => matcher(x) !== matcher(accepted));',
  'return {',
  '  start(mode, question) {',
  '    getFrequentErrors = getReviewQuestions = getExamQuestions = () => [question];',
  '    updates = []; timerCallbacks = []; rendered = 0; pied = null;',
  '    startSession(mode);',
  '    return session.options;',
  '  },',
  '  configured(question, cb) {',
  '    updates = []; timerCallbacks = []; rendered = 0; pied = null;',
  '    demarrerSession("review", "RÉVISION", [question], { apresReponse: cb });',
  '  },',
  '  missingOptions() { delete session.options; },',
  '  typed(s) { document.getElementById("session-input").value = s; validateSessionInput(); },',
  '  choice(correct, attention) {',
  '    const btn = document.getElementById("answer-choice");',
  '    btn.className = "choice";',
  '    if (attention) session.questions[session.index].q.attention = attention;',
  '    handleSessionChoice(btn, correct, session.questions[session.index].q.reponse);',
  '  },',
  '  next() { nextSessionQ(); },',
  '  state() { return { updates: updates.slice(), score: session.score, answered: session.answered,',
  '    essais: session.essais, options: session.options, rendered,',
  '    feedback: document.getElementById("session-feedback").innerHTML,',
  '    btn: pied && pied.id === "session-suivante" ? pied : null,', // SPEC 95 : bouton du pied
  '    timers: timerCallbacks.length }; }',
  '};'
].join('\n');
// Pas de boot réseau dans un test isolé des fonctions de session.
const appSource = (read('public/feedback-unifie.js') + '\n' + read('public/app.js')).replace(/\ninit\(\);\n/, '\n');
const running = new Function('document', 'setTimeout', appSource + '\n' + harness)(
  document, cb => { callbacks.push(cb); }
);
const written = { leconId: 1, type: 'ecriture', qid: 2002,
  q: { fr: 'Bonjour ! (le matin)', lu: 'Gudde Moien!', alternatives: ['Moien!'] } };
const quiz = { leconId: 1, type: 'quiz', qid: 3001,
  q: { question: 'Moien!', reponse: 'Bonjour !', distracteurs: ['Bonsoir'] } };

// La session historique Erreurs fréquentes contient désormais ses options.
assert.deepEqual(running.start('errors', written), {});
running.typed('Moien!');
let x = running.state();
assert.equal(x.score, 1);
assert.equal(x.answered, true);
assert.equal(x.updates.length, 1);
assert.equal(x.updates[0][4], true, 'la progression évolue hors examen');
assert.ok(x.feedback.includes('Juste !'));
assert.ok(x.feedback.includes('Autre formulation correcte'));
assert.ok(x.btn, 'le bouton Suivante est créé');

// Mauvaise première réponse : feedback, deuxième essai, aucune nouvelle erreur comptée.
running.start('errors', written);
running.typed('Äddi!');
x = running.state();
assert.equal(x.essais, 1);
assert.equal(x.answered, false);
assert.equal(x.updates.length, 1);
assert.equal(x.updates[0][3], false);
assert.ok(x.feedback.includes('Pas encore'));
running.typed('Moien!');
x = running.state();
assert.equal(x.answered, true);
assert.equal(x.score, 0, 'le deuxième essai ne donne pas de point supplémentaire');
assert.equal(x.updates.length, 1);
assert.ok(x.feedback.includes('2e essai'));
assert.ok(x.btn);

// Réponse à choix : pas d'exception ni de session bloquée.
running.start('errors', quiz);
running.choice(true);
x = running.state();
assert.equal(x.score, 1);
assert.equal(x.answered, true);
assert.equal(x.updates.length, 1);
assert.ok(x.btn, 'la correction reste visible jusqu’au clic sur Suivante');
assert.equal(x.timers, 0, 'aucune avance automatique du quiz');

// Attention : correction visible et bouton Suivante si choix faux.
running.start('errors', quiz);
running.choice(false, 'Attention au sens de Moien.');
x = running.state();
assert.equal(x.score, 0);
assert.ok(x.feedback.includes('Attention au sens de Moien.'));
assert.ok(x.btn);

// La protection couvre aussi les anciennes sessions révision/examen.
assert.deepEqual(running.start('review', written), {});
running.typed('Gudde Moien!');
assert.equal(running.state().score, 1);
assert.deepEqual(running.start('exam', written), {});
running.typed('Gudde Moien!');
assert.equal(running.state().score, 1);
assert.equal(running.state().updates[0][4], false, 'examen : pas de changement de niveau');

// Le callback des sessions configurées est maintenu (une seule exécution).
let called = 0;
running.configured(written, () => called++);
running.typed('Moien!');
assert.equal(called, 1);
assert.equal(running.state().score, 1);

// Protection supplémentaire contre une session ancienne sans « options ».
running.start('errors', written);
running.missingOptions();
running.typed('Gudde Moien!');
assert.equal(running.state().score, 1, 'absence des options non bloquante');

console.log('SPEC 56 : OK — Valider, choix, 2 essais, examen et callbacks optionnels.');
