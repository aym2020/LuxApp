// SPEC 59 — le feedback d’écriture est visible, pas seulement enregistré.
// node tests/test_session_feedback_visible.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const html = read('public/index.html');
const css = read('public/style.css');
const source = ['public/diagnostic.js', 'public/correction.js', 'public/app.js']
  .map(read).join('\n');

const section = html.slice(html.indexOf('id="view-session"'),
  html.indexOf('<!-- ══ EXAMENS', html.indexOf('id="view-session"')));
const question = section.indexOf('id="session-q"');
const feedbackAt = section.indexOf('id="session-feedback"');
const inputAt = section.indexOf('id="session-input-wrap"');
assert.ok(question >= 0 && feedbackAt > question && feedbackAt < inputAt,
  'le feedback est affiché entre la question et le champ, pas sous Valider');
assert.equal((section.match(/id="session-feedback"/g) || []).length, 1);
assert.ok(section.includes('role="status"'));
assert.ok(section.includes('aria-live="polite"'));
assert.ok(section.includes('aria-atomic="true"'));
assert.ok(css.includes('#view-session #session-feedback'));
assert.ok(css.includes('scroll-margin-top'));

const dom = new Map(), scrolls = [], errors = [];
let records = [];
function node(id) {
  if (!dom.has(id)) {
    const n = {
      id, className: '', value: '', innerHTML: '', disabled: false,
      style: {}, focused: false, blurred: false, nextButton: null,
      focus() { this.focused = true; },
      blur() { this.focused = false; this.blurred = true; },
      addEventListener() {},
      scrollIntoView(opts) { scrolls.push({ id: this.id, opts }); },
      after(btn) { this.nextButton = btn; }
    };
    n.classList = {
      add(c) { if (!this.contains(c)) n.className += ' ' + c; },
      remove(c) { n.className = n.className.split(/\s+/).filter(x => x !== c).join(' '); },
      contains(c) { return n.className.split(/\s+/).includes(c); }
    };
    dom.set(id, n);
  }
  return dom.get(id);
}
const document = {
  getElementById: node,
  createElement: tag => ({
    tagName: tag, textContent: '', className: '',
    addEventListener() {}, remove() {}
  }),
  querySelectorAll: () => [],
  addEventListener() {}
};
const suffix = [
  'lecons = [{ id: 1 }];',
  'boutonEcouterHtml = () => "";', // stub audio du test isolé
  'updateQuestionProgress = (lid, type, qid, ok, changeLevel) => {',
  '  const fb = document.getElementById("session-feedback");',
  '  if (!fb.innerHTML || fb.classList.contains("hidden"))',
  '    throw Error("progression modifiée sans feedback visible");',
  '  records.push({ok, changeLevel});',
  '};',
  'session = { mode: "errors", questions: [{',
  '  leconId: 1, type: "ecriture", qid: 101,',
  '  q: { fr: "Bonjour", lu: "Moien!", alternatives: ["Gudde Moien!"] }',
  '}], index: 0, score: 0, answered: false, essais: 0, options: {} };',
  'return {',
  '  validate: validateSessionInput,',
  '  reset(mode = "errors") {',
  '    session.mode = mode; session.score = 0; session.answered = false;',
  '    session.essais = 0;',
  '    const fb = document.getElementById("session-feedback");',
  '    fb.className = "ecr-feedback hidden"; fb.innerHTML = ""; fb.nextButton = null;',
  '    const inp = document.getElementById("session-input");',
  '    inp.disabled = false; inp.blurred = false; inp.value = "";',
  '    document.getElementById("session-input-wrap").className = "ecr-input-wrap";',
  '    records = []; scrolls.length = 0;',
  '  },',
  '  result() { return {',
  '    score: session.score, answered: session.answered, essais: session.essais,',
  '    feedback: document.getElementById("session-feedback").innerHTML,',
  '    visible: !document.getElementById("session-feedback").classList.contains("hidden"),',
  '    blurred: document.getElementById("session-input").blurred,',
  '    inputHidden: document.getElementById("session-input-wrap").classList.contains("hidden"),',
  '    next: !!document.getElementById("session-feedback").nextButton,',
  '    records: records.slice(), scrolls: scrolls.slice()',
  '  }; }',
  '};'
].join('\n');
const run = new Function('document','window','records','scrolls','requestAnimationFrame',
  source + '\n' + suffix)(
  document, {addEventListener(){}}, records, scrolls, fn => fn()
);

// Aucune réponse : pas d'enregistrement ni de correction.
run.reset();
run.validate();
assert.equal(run.result().records.length, 0);
assert.equal(run.result().visible, false);

// Mauvaise réponse au 1er essai : feedback VISIBLE, clavier fermé, retry disponible.
run.reset();
node('session-input').value = 'Äddi!';
run.validate();
let x = run.result();
assert.ok(x.visible && x.feedback.includes('Pas encore'));
assert.equal(x.answered, false);
assert.equal(x.essais, 1);
assert.equal(x.inputHidden, false, 'le champ reste présent pour réessayer');
assert.equal(x.blurred, true);
assert.equal(x.scrolls.length, 1, 'amener le feedback à l’écran');
assert.equal(x.records.length, 1);
assert.equal(x.records[0].ok, false);
assert.equal(x.next, false, 'pas de bouton Suivante avant deuxième essai');

// 2e essai : correction complète, bouton suivant, comptage unique.
node('session-input').value = 'Moien!';
run.validate();
x = run.result();
assert.ok(x.visible && x.feedback.includes('2e essai'));
assert.equal(x.answered, true);
assert.equal(x.score, 0, 'pas de point gagné au second essai');
assert.equal(x.records.length, 1, 'ne jamais compter deux fois');
assert.equal(x.inputHidden, true);
assert.equal(x.next, true);
assert.equal(x.scrolls.length, 2);

// Correct au 1er essai (alternative également acceptée).
run.reset();
node('session-input').value = 'Gudde Moien!';
run.validate();
x = run.result();
assert.equal(x.score, 1);
assert.ok(x.feedback.includes('Correct !'));
assert.ok(x.feedback.includes('Autre formulation correcte'));
assert.equal(x.inputHidden, true);
assert.equal(x.next, true);
assert.equal(x.blurred, true);
assert.equal(x.scrolls.length, 1);
assert.equal(x.records.length, 1);

// Mode examen : une seule correction, sans deuxième essai ni changement de niveau.
run.reset('exam');
node('session-input').value = 'Äddi!';
run.validate();
x = run.result();
assert.equal(x.answered, true);
assert.ok(x.feedback.includes('Réponse :'));
assert.equal(x.inputHidden, true);
assert.equal(x.records.length, 1);
assert.equal(x.records[0].changeLevel, false);
assert.equal(x.next, true);

console.log('SPEC 59 : OK — placement DOM, vrai diagnostic, feedback visible, clavier, 2 essais, examen et score.');
