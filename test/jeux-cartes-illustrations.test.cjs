'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Cartes Jeux : deux illustrations HD WebP optimisées, sans SVG utilisé',()=>{
  const css=read('public/jeux-univers.css');
  for(const name of ['survie','runner']){
    const pathname='public/art/jeux-'+name+'-card-hd.webp';
    const asset=fs.readFileSync(path.join(root,pathname));
    assert.ok(asset.length>30000 && asset.length<210000,'Image HD optimisée : '+name);
    assert.equal(asset.toString('ascii',0,4),'RIFF');
    assert.equal(asset.toString('ascii',8,12),'WEBP');
    assert.ok(css.includes('art/jeux-'+name+'-card-hd.webp'),'Fond '+name+' non référencé');
    assert.ok(!css.includes('url("art/jeux-'+name+'-card.svg")'),'Ancien SVG encore utilisé pour '+name);
  }
  assert.ok(css.includes('linear-gradient(90deg,rgba(21,16,12'),'masque Survie');
  assert.ok(css.includes('linear-gradient(90deg,rgba(19,14,27'),'masque Runner');
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

test('Assets V1.3 versionnés : l’ancienne présentation n’est pas conservée par le cache',()=>{
  const html=read('public/index.html');
  assert.match(html,/jeux-univers\.css\?v=3/);
  assert.match(html,/runner\.js\?v=4/);
  assert.doesNotMatch(html,/jeux-univers\.css\?v=2/);
});
