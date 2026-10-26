'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Cartes Jeux : fonds locaux, lisibles et sans ressources externes',()=>{
  const css=read('public/jeux-univers.css');
  for(const name of ['survie','runner']){
    const svg=read('public/art/jeux-'+name+'-card.svg');
    assert.ok(css.includes('art/jeux-'+name+'-card.svg'),'fond '+name+' non référence');
    assert.ok(svg.startsWith('<svg '),'SVG attendu : '+name);
    assert.ok(svg.includes('viewBox="0 0 760 450"'));
    assert.ok(!svg.includes('<script')&&!svg.includes('xlink:href=')&&!svg.includes('<image '));
  }
  assert.ok(css.includes('linear-gradient(90deg,rgba(23,19,13'),'masque de lisibilité Survie');
  assert.ok(css.includes('linear-gradient(90deg,rgba(19,15,27'),'masque de lisibilité Runner');
});

test('M/F/N : trois tuiles sur la carte et arches intactes dans le tutoriel',()=>{
  const js=read('public/runner.js');
  const css=read('public/jeux-univers.css');
  assert.ok(js.includes('function runnerApercuTuiles()'));
  assert.ok(js.includes('runnerApercuTuiles() +'),'carte du hub');
  assert.ok(js.includes('runnerApercuPortails() +'),'aperçu arches pour préparation');
  assert.ok(js.includes('RUNNER_VOIES.map(g =>'),'un élément par genre');
  assert.ok(css.includes('#view-jeux .runner-tuiles'));
  assert.ok(css.includes('width:38px;height:44px'),'dimensions S/U/R');
  assert.ok(css.includes('.runner-tuile.runner-f'));
  assert.ok(css.includes('.runner-tuile.runner-n'));
});
