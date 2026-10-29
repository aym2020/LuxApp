'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('public/hors-ligne.js','utf8'),h=fs.readFileSync('public/index.html','utf8');
test('PWA : pas de bandeau, vérification automatique et points sûrs',()=>{
 assert.doesNotMatch(s,/document\.createElement\('div'\)/);
 assert.match(s,/registration|register\('\/sw\.js'/);
 assert.match(s,/horsLigneVerifierMaj/);
 assert.match(s,/visibilitychange/);
 assert.match(s,/controllerchange/);
 assert.match(s,/horsLignePointSur/);
 assert.match(h,/hors-ligne\.js\?v=4/);
 assert.doesNotMatch(h,/id="hl-version"/);
});
