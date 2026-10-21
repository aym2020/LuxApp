'use strict';
// LuxApp 2.1 — états des corrections d'exercices (régression du 21/10/2026).
// On exécute les vraies fonctions de parcours.js et app.js sur un faux DOM :
// le test vérifie ce qui est affiché, pas seulement que le code existe.
// node --test test/exercices-etats-v21.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'public');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const parcours = read('parcours.js'), app = read('app.js'), css = read('exercices-v21.css');

// Extrait le texte d'une fonction : de « function nom( » jusqu'à la fonction suivante.
function fonction(source, nom) {
  const debut = source.indexOf('function ' + nom + '(');
  assert.ok(debut >= 0, nom + ' introuvable');
  const fin = source.indexOf('\nfunction ', debut + 10);
  return source.slice(debut, fin);
}

// Faux élément DOM minimal.
function element(id) {
  const el = { id, className: '', innerHTML: '', textContent: '', style: {}, dataset: {}, disabled: false };
  el.classList = {
    add(c) { if (!this.contains(c)) el.className = (el.className + ' ' + c).trim(); },
    remove(...cs) { el.className = el.className.split(/\s+/).filter(x => !cs.includes(x)).join(' '); },
    contains(c) { return el.className.split(/\s+/).includes(c); }
  };
  return el;
}

function fauxDom() {
  const ids = {};
  const get = id => ids[id] || (ids[id] = element(id));
  const erreurs = [get('mc-erreur'), get('pc-ecr-erreur')];
  erreurs.forEach(e => { e.className = 'mc-erreur'; e.innerHTML = '<b>Pas encore</b>'; });
  return {
    ids, get, erreurs,
    document: {
      getElementById: get,
      querySelectorAll: sel => sel.includes('mc-erreur') ? erreurs : (ids.__choix || [])
    }
  };
}

const escHtml = fonction(app, 'escHtml');
const noteHtml = fonction(app, 'noteHtml');

function parcoursAvec(dom) {
  const code = [escHtml, fonction(parcours, 'etatExercice'), fonction(parcours, 'showFeedback'),
    fonction(parcours, 'choisirP'),
    'return { showFeedback, choisirP };'].join('\n');
  return new Function('document', 'fermerClavier', 'focusApresClavier', 'enregistrer',
    'attentionHtml', 'attentionItem', 'rappelHtml', 'reussir', 'echouer', 'pAttente', 'pSuite', code)(
    dom.document, () => {}, () => {}, () => {}, t => t ? 'Attention : ' + t : '', () => '',
    () => '', () => {}, () => {}, false, null);
}

test('le titre transmis par le moteur est affiché (plus de « Bien vu. » générique)', () => {
  const dom = fauxDom();
  const p = parcoursAvec(dom);
  p.showFeedback(true, 'Juste, au 2e essai', '<b>Moien!</b>', () => {});
  const fb = dom.get('pc-feedback');
  assert.match(fb.innerHTML, /Juste, au 2e essai/);
  assert.doesNotMatch(fb.innerHTML, /Bien vu\.|À retenir/);
  assert.ok(fb.classList.contains('ok'));
  p.showFeedback(false, 'La réponse : Stull', '', () => {});
  assert.match(fb.innerHTML, /La réponse : Stull/);
  assert.ok(fb.classList.contains('ko'));
});

test('la correction finale masque le « Pas encore » du premier essai', () => {
  const dom = fauxDom();
  parcoursAvec(dom).showFeedback(true, 'Bien joué !', '', () => {});
  dom.erreurs.forEach(e => assert.ok(e.classList.contains('hidden'), e.id + ' doit être masqué'));
});

test('parcours : après une erreur, le trou montre la bonne réponse en vert', () => {
  const dom = fauxDom();
  dom.ids.__choix = [];
  parcoursAvec(dom).choisirP(element('b'), false, 'Madamm', {}, 'trous');
  assert.equal(dom.get('pc-blank').textContent, 'Madamm');
  assert.equal(dom.get('pc-blank').style.color, 'var(--correct)');
  assert.match(dom.get('pc-feedback').innerHTML, /Pas encore/);
});

test('entraînement : trou vert, titre clair et gras rendu (pas de <b> littéral)', () => {
  const dom = fauxDom();
  const fb = dom.get('session-feedback');
  const code = [escHtml, noteHtml, fonction(app, 'attentionDe'), fonction(app, 'handleSessionChoice'),
    'return handleSessionChoice;'].join('\n');
  const session = { answered: false, index: 0, questions: [{
    type: 'trous', q: { trou: 'Madamm', attention: 'Madame = <b>Madamm</b>' } }] };
  const handle = new Function('document', 'session', 'recordSessionAnswer', 'ajouterBoutonSuivante', code)(
    dom.document, session, () => {}, () => {});
  handle(element('b'), false, 'Madamm');
  assert.equal(dom.get('session-blank').style.color, 'var(--correct)');
  assert.match(fb.innerHTML, /Pas encore/);
  assert.match(fb.innerHTML, /Bonne réponse : <b>Madamm<\/b>/);
  assert.match(fb.innerHTML, /Madame = <b>Madamm<\/b>/);
  assert.doesNotMatch(fb.innerHTML, /&lt;b&gt;/);
});

test('noteHtml garde le gras mais échappe toute autre balise', () => {
  const f = new Function(escHtml + '\n' + noteHtml + '\nreturn noteHtml;')();
  assert.equal(f('a <b>x</b> <i>y</i>'), 'a <b>x</b> &lt;i&gt;y&lt;/i&gt;');
});

test('styles : bandeau collé en bas, états vert/rouge, cases du mot caché conservées', () => {
  const regle = sel => (css.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}')) || [])[1] || '';
  assert.match(regle('#view-parcours .pc-feedback'), /position:sticky;bottom:0;margin-top:auto/);
  assert.match(regle('#view-parcours .pc-feedback.ok'), /var\(--correct\)/);
  assert.match(regle('#view-parcours .pc-feedback.ko'), /var\(--wrong\)/);
  assert.match(css, /#view-parcours \.choice\.wrong, #view-session \.choice\.wrong \{\s*border-color:var\(--wrong\)/);
  // #view-parcours .mc-case est plus spécifique que .mc-case.vert : l'état doit être redéclaré.
  assert.match(regle('#view-parcours .mc-case.vert'), /var\(--correct\)/);
  assert.match(regle('#view-parcours .mc-case.indice'), /var\(--accent\)/);
});
