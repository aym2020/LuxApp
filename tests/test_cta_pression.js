// SPEC 57 — régression CSS : retour tactile sur les vrais boutons CTA.
// Lancer : node tests/test_cta_pression.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const tokens = read('public/design-tokens.css');
const shared = read('public/components.css');
const style = read('public/style.css');
const html = read('public/index.html');
const home = read('public/accueil.js');
const chemin = read('public/chemin.js');
const parcours = read('public/parcours.js');
const mission = read('public/mission.js');
const docs = read('docs/DESIGN_SYSTEM.md');
const spec = read('docs/specs/SPEC-57.md');

function ruleSection(code, tag) {
  const at = code.indexOf(tag);
  assert.ok(at >= 0, 'règle introuvable : ' + tag);
  return code.slice(at);
}
const css = ruleSection(shared, '/* ══ SPEC 57 : PRESSION TACTILE UNIFIÉE SUR LES CTA');
const allSelectors = [
  '.pc-btn', '.btn-jaune', '.carte-suite', '.ac-btn',
  '.dash-btn.primary', '.ecr-btn-validate', '.session-action.primary', '.ms-envoyer'
];
for (const sel of allSelectors) assert.ok(css.includes(sel), 'CTA couvert : ' + sel);
assert.ok(css.includes(':not(:disabled):not([aria-disabled="true"])'),
  'les CTA désactivés sont exclus de la pression');
assert.ok(css.includes(':active'), 'feedback natif pendant le toucher');
assert.ok(css.includes('touch-action: manipulation'), 'support du toucher mobile');
assert.ok(css.includes('-webkit-tap-highlight-color: transparent'), 'pas de flash natif superposé');
assert.ok(css.includes('transform-origin: center'), 'bouton entier centré');

for (const [token, expected] of [
  ['--cta-pression-echelle', '.975'],
  ['--cta-pression-decalage', '1px'],
  ['--cta-pression-duree', '140ms'],
  ['--cta-pression-luminosite', '.92'],
  ['--cta-pression-ombre', 'inset']
]) {
  assert.ok(tokens.includes(token + ': ' + expected), 'token manquant : ' + token);
  assert.ok(css.includes('var(' + token + ')'), 'token non utilisé : ' + token);
}
assert.ok(css.includes('transform: translateY(var(--cta-pression-decalage)) scale(var(--cta-pression-echelle))'),
  'le bouton s’enfonce à l’appui');
assert.ok(css.includes('filter: brightness(var(--cta-pression-luminosite))'),
  'le bouton s’assombrit pendant la pression');
assert.ok(css.includes('box-shadow: var(--cta-pression-ombre)'),
  'l’ombre intérieure renforce le relief');
assert.ok(css.includes('transition:'), 'retour animé au relâchement');
assert.ok(css.includes(':is(:disabled, [aria-disabled="true"]):active'),
  'protection des CTA désactivés');

// Vérifie la logique conditionnelle : les transitions ne doivent pas dépendre
// d’un déclencheur JS ni d’un état permanent fixé à l’élément.
assert.ok(!css.includes('pointer-events: none'), 'ne jamais casser les clics des CTA');
assert.ok(!css.includes('animation: '), 'pas d’animation autonome qui se rejoue');
assert.ok(!css.includes('@keyframes'), 'pas de répétition de pulsation');
assert.ok(!css.includes('setTimeout'), 'le comportement reste CSS uniquement');
const reduced = ruleSection(css, '@media (prefers-reduced-motion: reduce)');
assert.ok(reduced.includes('transition: none'), 'animations réduites = pas de transition');
assert.ok(reduced.includes('transform: none'), 'animations réduites = pas de déplacement');
assert.ok(reduced.includes('filter: brightness(var(--cta-pression-luminosite))'),
  'un contraste statique continue de confirmer l’appui');
assert.ok(reduced.includes('box-shadow: none'), 'pas d’ombre animée en mouvement réduit');

// Les anciens effets concurrents doivent être absents des CTA ciblés.
assert.ok(!shared.includes('.pc-btn:active { transform: scale(.98); }'));
assert.ok(!style.includes('.carte-suite:active, .ac-btn:active, .puce-niv:active'));
assert.ok(!style.includes('.btn-jaune:active, .carte-lecon:active, .plus-ligne:active'));
assert.ok(!style.includes('.ms-envoyer:active { transform: scale(.94); }'));
assert.ok(style.includes('.puce-niv:active'), 'les puces gardent leur feedback');
assert.ok(style.includes('.carte-lecon:active'), 'les cartes gardent leur feedback');
assert.ok(style.includes('.dash-btn:not(:disabled):not(.primary):active'),
  'bouton dashboard secondaire inchangé');

// Les vrais CTA existent bien dans l’application.
for (const [sel, source] of [
  ['pc-btn primary', parcours],
  ['btn-jaune', chemin],
  ['carte-suite', home],
  ['ac-btn', home],
  ['ecr-btn-validate', html],
  ['dash-btn primary', html],
  ['session-action', read('public/app.js')],
  ['ms-envoyer', mission]
]) {
  assert.ok(source.includes(sel), 'composant réel introuvable : ' + sel);
}
assert.ok(html.indexOf('design-tokens.css') < html.indexOf('components.css'));
assert.ok(html.indexOf('components.css') < html.indexOf('style.css'));
assert.ok(docs.includes('Feedback de pression CTA (SPEC 57)'));
assert.ok(spec.includes('recette tactile Android'));
assert.ok(!shared.includes('addEventListener'), 'aucun code JS ajouté aux styles');

console.log('SPEC 57 : OK — 8 familles de CTA, pression, relâchement, disabled, reduced motion et design system.');
