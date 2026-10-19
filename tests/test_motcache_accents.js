// SPEC 51 — vérification du véritable moteur des lettres mélangées.
// Lancer : node tests/test_motcache_accents.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const app = read('public/app.js');
const i = app.indexOf('function normalize(str) {');
const end = app.indexOf('\n}\n', i) + 2;
assert.ok(i >= 0 && end > i, 'normalize() absente');
const normalize = new Function('return (' + app.slice(i, end) + ');')();
const elements = {};
function element(id) {
  if (!elements[id]) elements[id] = {
    value: '', innerHTML: '', textContent: '', disabled: false, offsetWidth: 1,
    focus() {}, classList: { add() {}, remove() {}, toggle() {} }
  };
  return elements[id];
}
const document = { getElementById: element, addEventListener() {}, activeElement: null };

// Monte le code métier réel avec uniquement des substituts DOM / progression.
const harness = [
  'pAttente = false;',
  'let sauvegardes = []; let feedbacks = [];',
  'enregistrer = (...a) => sauvegardes.push(a);',
  'showFeedback = (...a) => feedbacks.push(a);',
  "attentionItem = () => null; attentionHtml = () => ''; aideErreurHtml = () => '';",
  'fermerClavier = () => {}; focusSiClavierPhysique = () => {};',
  'return {',
  '  init(word) {',
  '    pLecon = { id: 1, unites: [] };',
  '    mc = { card: { id: 42, lu: word, fr: "exemple" },',
  '      cases: Array.from(word, ch => ({ ch, lettre: estLettre(ch), etat: "" })),',
  '      tuiles: [], choix: [], indices: 0, essais: 0, revele: false };',
  '    mc.tuiles = nouvellesTuiles();',
  '    document.getElementById("mc-input").value = "";',
  '    document.getElementById("mc-input").disabled = false;',
  '    sauvegardes = []; feedbacks = []; renderCases();',
  '  },',
  '  inspect() { return { tuiles: mc.tuiles.map(t => t.ch),',
  '    tuilesRetirees: mc.tuiles.filter(t => t.retiree).length,',
  '    cases: mc.cases.map(c => ({ ...c })),',
  '    html: document.getElementById("mc-cases").innerHTML,',
  '    choix: mc.choix.slice(), indices: mc.indices, essais: mc.essais,',
  '    score: mcScore(), sauvegardes: sauvegardes.slice(), feedbacks: feedbacks.slice(),',
  '    input: document.getElementById("mc-input").value }; },',
  '  poser(ch) {',
  '    const prises = tuilesUtilisees();',
  '    let id = mc.tuiles.findIndex((t,i) => !prises[i] && t.ch === ch);',
  '    if (id < 0) id = mc.tuiles.findIndex((t,i) => !prises[i] && normalize(t.ch) === normalize(ch));',
  '    if (id < 0) throw Error("Tuile introuvable : " + ch);',
  '    mcPoserLettre(id);',
  '  },',
  '  effacer() { mcEffacer(); },',
  '  clavier(texte) { document.getElementById("mc-input").value = texte; mcSaisie(); },',
  '  valider() { mcValider(); },',
  '  indiceSeul(index) {',
  '    mc.cases.forEach((c,i) => { if (c.lettre && i !== index) c.etat = "vert"; });',
  '    mc.tuiles = nouvellesTuiles(); mc.choix = []; renderCases(); mcIndice();',
  '  }',
  '};'
].join('\n');
const jeu = new Function('normalize', 'document', 'escHtml',
  read('public/parcours.js') + '\n' + harness)(normalize, document, String);

for (const word of ['Lëtzebuerg', 'Mëllech', 'Äddi', 'Éislek', 'Schéi', 'Moien!']) {
  jeu.init(word);
  const tiles = jeu.inspect().tuiles;
  assert.ok(tiles.length > 0);
  assert.ok(tiles.every(ch => ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === ch),
    'Une tuile est accentuée : ' + word);
}

jeu.init('Lëtzebuerg');
jeu.poser('L'); jeu.poser('e');
assert.ok(jeu.inspect().html.includes('>e</span>'), 'e reste e avant validation');
assert.ok(!jeu.inspect().html.includes('>ë</span>'), 'pas de tréma révélateur avant validation');
jeu.poser('t'); jeu.poser('z'); jeu.poser('e');
assert.ok(jeu.inspect().html.includes('>e</span>'), 'e reste e à sa place');
assert.equal(new Set(jeu.inspect().choix).size, 5, 'doublons distincts');
jeu.effacer();
assert.equal(jeu.inspect().choix.length, 4, 'effacement');

jeu.init('Äddi'); jeu.poser('A');
assert.ok(jeu.inspect().html.includes('>A</span>'), 'A sans tréma avant validation');
assert.ok(!jeu.inspect().html.includes('>Ä</span>'));
jeu.init('Éislek'); jeu.poser('E');
assert.ok(jeu.inspect().html.includes('>E</span>'), 'E sans accent avant validation');
assert.ok(!jeu.inspect().html.includes('>É</span>'));

jeu.init('Mëllech');
jeu.poser('M'); jeu.poser('l');
assert.ok(jeu.inspect().html.includes('>l</span>'));
assert.ok(!jeu.inspect().html.includes('>ë</span>'), 'mauvaise lettre non transformée');

jeu.init('Lëtzebuerg');
jeu.clavier('Le');
assert.ok(jeu.inspect().html.includes('>e</span>'));
assert.ok(!jeu.inspect().html.includes('>ë</span>'));
jeu.clavier('Lë');
assert.equal(jeu.inspect().input, 'Le');
assert.ok(jeu.inspect().html.includes('>e</span>'), 'taper ë reste sans accent avant validation');
assert.ok(!jeu.inspect().html.includes('>ë</span>'));

jeu.init('Mëllech');
jeu.indiceSeul(1);
let s = jeu.inspect();
assert.equal(s.indices, 1);
assert.equal(s.tuilesRetirees, 1);
assert.equal(s.cases[1].etat, 'indice');
assert.ok(s.html.includes('>ë</span>'));
assert.equal(s.score, 6 / 7); // Mëllech comporte sept lettres

jeu.init('Mëllech');
for (const c of 'Mellech') jeu.poser(c);
assert.ok(!jeu.inspect().html.includes('>ë</span>'), 'mot entier non accentué avant validation');
jeu.valider();
s = jeu.inspect();
assert.equal(s.essais, 0);
assert.equal(s.sauvegardes.length, 1);
assert.equal(s.sauvegardes[0][1], 1);
assert.equal(s.sauvegardes[0][2], true);
assert.ok(s.html.includes('>ë</span>'), 'tréma restitué après validation réussie');
assert.ok(s.cases.every(c => !c.lettre || c.etat === 'vert'), 'mot réussi entièrement vert');

// Un essai faux révèle les accents UNIQUEMENT sur les positions figées en vert.
jeu.init('Mëllech');
for (const c of 'Mele') jeu.poser(c); // 3 premières positions correctes, quatrième fausse
assert.ok(!jeu.inspect().html.includes('>ë</span>'), 'pas d’indice gratuit avant Valider');
jeu.valider();
s = jeu.inspect();
assert.equal(s.essais, 1);
assert.equal(s.cases[1].etat, 'vert', 'bonne lettre accentuée figée');
assert.equal(s.cases[3].etat, '', 'mauvaise lettre non figée');
assert.ok(s.html.includes('>ë</span>'), 'accent révélé seulement sur la position juste');
assert.equal(s.sauvegardes.length, 0);

// Les mauvais placements restent pénalisés normalement.
jeu.init('Mëllech');
jeu.poser('M'); jeu.poser('l'); jeu.poser('e');
jeu.valider();
s = jeu.inspect();
assert.equal(s.essais, 1);
assert.equal(s.cases[0].etat, 'vert');
assert.equal(s.cases[1].etat, '');
assert.equal(s.sauvegardes.length, 0);

jeu.init('Gudde Moien!');
for (const c of 'GuddeMoien') jeu.poser(c);
jeu.valider();
s = jeu.inspect();
assert.equal(s.sauvegardes[0][1], 1);
assert.ok(s.html.includes('mc-espace'));
assert.ok(s.html.includes('>!</span>'));

console.log('SPEC 51 : OK — aucune fuite avant validation, accents après correction, tuiles, clavier, indices et score.');
