'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Cartes Jeux SPEC 99 : WebP carré, léger et correctement référencé',()=>{
  const css=read('public/jeux-univers.css');
  for(const name of ['survie','runner']){
    const b=fs.readFileSync(path.join(root,'public/art/jeux-'+name+'-card-portrait.webp'));
    assert.ok(b.length>30000&&b.length<150000,'fichier mobile optimisé : '+name);
    assert.equal(b.toString('ascii',0,4),'RIFF');
    assert.equal(b.toString('ascii',8,12),'WEBP');
    assert.equal(b.toString('ascii',12,16),'VP8 ');
    assert.equal(b.readUInt16LE(26)&0x3fff,1200);
    assert.equal(b.readUInt16LE(28)&0x3fff,1200);
    assert.ok(css.includes('art/jeux-'+name+'-card-portrait.webp'));
    assert.ok(!css.includes('url("art/jeux-'+name+'-card-hd.webp")'));
  }
  assert.ok(css.includes('max-width:88%'));
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

test('Assets SPEC 99 versionnés : l’ancien décor sort du cache',()=>{
  const html=read('public/index.html');
  assert.match(html,/jeux-univers\.css\?v=4/);
  assert.match(html,/runner\.js\?v=([4-9]|\d{2,})\b/); // v4 ou plus récent
  assert.doesNotMatch(html,/jeux-univers\.css\?v=3/);
});
