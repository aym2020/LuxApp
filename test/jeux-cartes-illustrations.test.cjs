'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Les deux illustrations des cartes sont locales, vectorielles, sans ressource externe',()=>{
  const css=read('public/jeux-univers.css');
  for(const name of ['survie','runner']){
    const file='public/art/jeux-'+name+'-card.svg';
    const svg=read(file);
    assert.match(css,new RegExp('art/jeux-'+name+'-card\\.svg'));
    assert.match(svg,/<svg[^>]+viewBox="0 0 760 450"/);
    assert.doesNotMatch(svg,/<script|https?:\\/\\/|onload=/i);
  }
  assert.match(css,/linear-gradient\\(90deg,rgba\\(23,19,13/);
  assert.match(css,/linear-gradient\\(90deg,rgba\\(19,15,27/);
});
test('Les tuiles M F N de la carte reprennent S U R sans changer le tutoriel',()=>{
  const js=read('public/runner.js'),css=read('public/jeux-univers.css');
  assert.match(js,/function runnerApercuTuiles\\(\\)/);
  assert.match(js,/runnerApercuTuiles\\(\\) \\+\\n    '<div class="jeux-carte-titre"/);
  assert.match(js,/runnerApercuPortails\\(\\) \\+\\n        '<ol class="runner-regles"/);
  assert.match(css,/#view-jeux \\.runner-tuiles/);
  assert.match(css,/width:38px;height:44px/);
  assert.match(css,/runner-tuile\\.runner-f/);
  assert.match(css,/runner-tuile\\.runner-n/);
});
