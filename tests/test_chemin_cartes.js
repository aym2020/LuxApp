// SPEC 54 — cartes du Chemin, repliées/dépliées, catalogue complet.
// node tests/test_chemin_cartes.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const code = read('public/chemin.js'), css = read('public/style.css');

const escape = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mocks = [
  "statutLecon48 = () => ({ code: 'acquis', libelle: 'Acquise précédemment' });",
  "classePas = () => 'acquis';",
  "iconePas = () => '✓';",
  "ligne2LeconHtml = () => '<span class=\"carte-ligne2\">Acquise précédemment</span>';",
  "actionLeconChemin = () => ({ etape: null, libelle: 'Découvrir' });",
  "etapesLeconHtml = () => '<li class=\"etape\">Une unité</li>';",
  "return { titreLeconChemin, CHEMIN_TITRES_LECONS_COURTS, leconReplieeHtml, leconDeplieeHtml };"
].join('\n');
// Le vrai code construit les cartes ; seules ses dépendances métier sont simulées.
const runtime = new Function('window', 'titreCourt', 'numLecon', 'escHtml', 'ICONES',
  'isParcoursLecon', 'leconTerminee', code + '\n' + mocks)(
    { addEventListener() {} },
    l => l.titre_fr, l => l.id, escape, { chevron: '⌄', fleche: '→' },
    () => true, () => false
  );

const lessons = [];
for (const level of ['A1.1', 'A1.2']) {
  const directory = path.join(root, 'data', 'lecons', level);
  for (const filename of fs.readdirSync(directory)) {
    if (!/^lecon-\d{2}\.json$/.test(filename)) continue;
    lessons.push(JSON.parse(read('data/lecons/' + level + '/' + filename)));
  }
}
lessons.sort((a, b) => a.id - b.id);
assert.deepEqual(lessons.map(l => l.id), [
  ...Array.from({ length: 17 }, (_, i) => i + 1),
  ...Array.from({ length: 8 }, (_, i) => i + 20)
], '25 leçons publiées vérifiées');

for (const lesson of lessons) {
  const collapsed = runtime.leconReplieeHtml(lesson, 0, false, null);
  const expanded = runtime.leconDeplieeHtml(lesson, 0, null, false, false);
  const short = runtime.titreLeconChemin(lesson);
  const original = lesson.titre_fr;
  const header = '<span class="carte-haut"><span class="num">Leçon ' + lesson.id;

  assert.ok(collapsed.includes(header + '</span>'),
    'numéro sur sa ligne, repliée ' + lesson.id);
  assert.ok(collapsed.includes('<span class="titre">' + escape(short) + '</span>'),
    'titre distinct du numéro, repliée ' + lesson.id);
  assert.ok(expanded.includes(header + ' · '),
    'numéro sur sa ligne, dépliée ' + lesson.id);
  assert.ok(expanded.includes('<h3>' + escape(short) + '</h3>'),
    'titre distinct du numéro, dépliée ' + lesson.id);
  assert.ok(collapsed.includes('aria-expanded="false"'));
  assert.ok(expanded.includes('aria-expanded="true"'));
  assert.ok(collapsed.includes('onclick="basculerLeconChemin(' + lesson.id + ')"'));
  assert.ok(expanded.includes('onclick="basculerLeconChemin(' + lesson.id + ')"'));
  assert.ok(collapsed.includes('aria-label="Leçon ' + lesson.id + ', ' + escape(original)),
    'titre original annoncé sur carte repliée ' + lesson.id);
  assert.ok(expanded.includes('aria-label="Leçon ' + lesson.id + ', ' + escape(original)),
    'titre original annoncé sur carte dépliée ' + lesson.id);
  assert.ok(collapsed.includes('title="Leçon ' + lesson.id + ' · ' + escape(original) + '"'));
  assert.ok(expanded.includes('title="Leçon ' + lesson.id + ' · ' + escape(original) + '"'));
  assert.ok(collapsed.includes('Acquise précédemment'), 'statut préservé ' + lesson.id);
  assert.ok(expanded.includes('Découvrir'), 'action préservée ' + lesson.id);
  if (lesson.id !== 5) assert.equal(short, original,
    'aucune nouvelle abréviation pour leçon ' + lesson.id);
}
const lesson5 = lessons.find(l => l.id === 5);
assert.equal(runtime.titreLeconChemin(lesson5), 'Les nombres et le comptage');
assert.equal(lesson5.titre_fr, 'Les nombres et la façon de compter en luxembourgeois');
assert.equal(runtime.titreLeconChemin({ ...lesson5, titre_fr: 'Titre actualisé' }),
  'Titre actualisé', 'raccourci périmé ignoré');
assert.equal(Object.keys(runtime.CHEMIN_TITRES_LECONS_COURTS).length, 1);

assert.ok(css.includes('/* SPEC 54 — Numéro au-dessus du titre'));
assert.ok(css.includes('.chemin .carte-haut,'));
assert.ok(css.includes('flex-direction: column'));
assert.ok(css.includes('flex-wrap: nowrap'));
assert.ok(css.includes('flex: none; /* annule le flex 1 1 8em'));
assert.ok(css.includes('min-height: var(--toucher)'));
assert.ok(!css.includes('.chemin-page { overflow: hidden; }'));

console.log('SPEC 54 : OK — 25 leçons, cartes, accessibilité et intitulés.');
