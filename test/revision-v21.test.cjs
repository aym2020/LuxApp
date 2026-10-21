// V2.1 — Contrat statique de l'interface de configuration de révision.
// Exécution : node --test test/revision-v21.test.cjs
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
const accueil21 = fs.readFileSync(path.join(root, 'public/accueil-v21.js'), 'utf8');
const nav = fs.readFileSync(path.join(root, 'public/navigation.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public/revision-v21.css'), 'utf8');

test('le nouveau CSS est chargé et limité à Réviser', () => {
  assert.match(html, /href="revision-v21\.css"/);
  assert.match(css, /#view-review-setup \.rs-v21-section/);
  assert.doesNotMatch(css, /#view-dashboard|#view-lecon|#view-session/);
});

test('tous les identifiants originaux sont conservés, sans doublons', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  for (const id of ['view-review-setup','rs-lecons','rs-types','rs-niveaux',
    'rs-count','rs-focus','rs-count-aleatoire','rs-count-connu','rs-count-difficile',
    'rs-niv-count-1','rs-niv-count-2','rs-niv-count-3']) {
    assert.equal(ids.filter(x => x === id).length, 1, id);
  }
});

test('les valeurs transmises au moteur et les defaults ne changent pas', () => {
  for (const v of ['quiz','trous','ecriture']) assert.match(html, new RegExp('value="'+v+'" checked'));
  for (const v of ['1','2','3']) assert.match(html, new RegExp('type="checkbox" value="'+v+'" checked'));
  assert.match(html, /name="rs-count" value="20" checked/);
  assert.match(html, /name="rs-focus" value="aleatoire" checked/);
  assert.match(js, /getConfiguredReview\(leconIds, types, focus, count, niveaux\)/);
});

test('le sélecteur de leçons est un panneau accessible et réutilise les cases', () => {
  assert.match(html, /id="rs-lecons-panel"[^>]*role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /id="rs-v21-lecons-ouvrir"/);
  assert.match(html, /onclick="toggleAllChecks\('rs-lecons'\)"/);
  assert.match(js, /function ouvrirSelectionLecons\(\)/);
  assert.match(js, /function fermerSelectionLecons\(/);
  assert.match(js, /e\.key === 'Escape'/);
});

test('les résumés dynamiques sont mis à jour après les sélections', () => {
  for(const id of ['rs-v21-total','rs-v21-lecons-resume',
    'rs-v21-niveaux-resume','rs-v21-types-resume','rs-v21-focus-note']) {
    assert.match(html, new RegExp('id="'+id+'"'));
    assert.ok(js.includes("'"+id+"'"), id);
  }
  assert.match(js, /getReviewCounts\(leconIds, types, niveaux\)/);
  assert.match(js, /addEventListener\('change', scheduleReviewRefresh\)/);
});

test('lancement de révision inchangé avec CTA accessible', () => {
  assert.match(html, /class="dash-btn primary" onclick="startConfiguredReview\(\)"/);
  assert.match(js, /function startConfiguredReview\(\)/);
  assert.match(css, /\.rs-v21-footer/);
  assert.match(css, /height:calc\(100dvh - 76px - env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /overflow-y:auto/);
});

test('une leçon seule est conservée dans les paramètres de révision', () => {
  assert.match(js, /const coche = seuleLeconId == null \|\| l\.id === seuleLeconId/);
  assert.match(js, /fermerSelectionLecons\(false\)/);
});

test('S’entraîner ouvre la même configuration depuis l’accueil et la barre du bas', () => {
  assert.match(accueil21, /boutonAcces\('rev',[^\n]*'openReviewSetup\(\)'\)/);
  assert.doesNotMatch(accueil21, /boutonAcces\('rev',[^\n]*'lancerRevision\(\)'\)/);
  assert.match(html, /data-nav="reviser" onclick="openReviewSetup\(\)"/);
  assert.match(html, />S’entraîner<\/button>/);
  assert.match(accueil21, /"S'entraîner"/);
  assert.match(nav, /'view-review-setup': "S'entraîner"/);
  assert.doesNotMatch(accueil21, /boutonAcces\('rev',[^\n]*infoRevision\(rev\)/);
});

test('un tap ne laisse pas de double encadrement des options', () => {
  assert.doesNotMatch(css, /\.rs-check:focus-within/);
  assert.match(css, /@media \(hover:hover\) and \(pointer:fine\)/);
  assert.match(css, /\.rs-check:has\(input:focus-visible\)/);
  assert.match(css, /\.rs-v21-types \{\s*display:flex; flex-direction:row;/);
  assert.match(css, /\.rs-v21-segments \.rs-check:has\(input:checked\)/);
});

test('la configuration et le lancement affichent entraînement sans modifier le moteur', () => {
  assert.match(html, /<h1>Ton entraînement<\/h1>/);
  assert.match(html, /Commencer l’entraînement<\/button>/);
  assert.match(html, /Pour cet entraînement<\/small>/);
  assert.match(js, /demarrerSession\('review', 'ENTRAÎNEMENT', questions/);
  assert.match(js, /getConfiguredReview\(leconIds, types, focus, count, niveaux\)/);
});
