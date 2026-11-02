/* Tirer pour actualiser : pages autorisées, chargement après navigation.js.
 * node --test test/actualiser.test.cjs */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(path.join(root,'public/actualiser.js'),'utf8');
const pages=JSON.parse(js.match(/const ACTUALISER_PAGES = (\[[\s\S]*?\]);/)[1].replace(/'/g,'"'));

test('Jamais pendant un exercice, une mission, un examen ou un jeu',()=>{
  for (const vue of ['view-parcours','view-mission','view-session','view-examen','view-decouverte','view-lecon',
                     'view-survie','view-runner','view-luxmatch','view-luxdemasque']) {
    assert.ok(!pages.includes(vue), vue);
  }
  assert.ok(pages.includes('view-dashboard'));
});
test('L’accueil est toujours actualisable, les autres pages seulement dans l’app installée',()=>{
  assert.match(js,/if \(vue\.id === 'view-dashboard'\) return true;/);
  assert.match(js,/return actualiserAppInstallee\(\) && ACTUALISER_PAGES\.includes\(vue\.id\);/);
  assert.match(js,/display-mode: standalone/);
});
test('Écouteur non passif uniquement pendant le geste',()=>{
  assert.match(js,/addEventListener\('touchstart'[\s\S]*?\{ passive: true \}\)/);
  assert.match(js,/addEventListener\('touchmove', actualiserGeste, \{ passive: false \}\)/);
  assert.match(js,/removeEventListener\('touchmove', actualiserGeste/);
});
test('Chargé après navigation.js (restauration de l’écran, spec 44)',()=>{
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  assert.ok(html.indexOf('src="navigation.js"')<html.indexOf('src="actualiser.js'));
  assert.match(html,/href="actualiser\.css/);
});
