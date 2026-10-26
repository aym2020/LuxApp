'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Cartes Jeux SPEC 99 : WebP carré, léger et correctement référencé',()=>{
  const css=read('public/jeux-univers.css');
  for(const [name,filename] of [['survie','jeux-survie-card-portrait.webp'],['runner','jeux-runner-card-or-violet.webp']]){
    const b=fs.readFileSync(path.join(root,'public/art',filename));
    assert.ok(b.length>30000&&b.length<150000,'fichier mobile optimisé : '+name);
    assert.equal(b.toString('ascii',0,4),'RIFF');
    assert.equal(b.toString('ascii',8,12),'WEBP');
    assert.equal(b.toString('ascii',12,16),'VP8 ');
    assert.equal(b.readUInt16LE(26)&0x3fff,1200);
    assert.equal(b.readUInt16LE(28)&0x3fff,1200);
    assert.ok(css.includes('art/'+filename));
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
  assert.match(html,/jeux-univers\.css\?v=([5-9]|\d{2,})\b/); // v5 ou plus récent
  assert.match(html,/runner\.js\?v=([4-9]|\d{2,})\b/); // v4 ou plus récent
  assert.doesNotMatch(html,/jeux-univers\.css\?v=4/);
});

test('SPEC 100 — lisibilité renforcée des deux cartes sans changer les WebP',()=>{
  const css=read('public/jeux-univers.css');
  assert.ok(css.includes('rgba(21,16,12,.88)'),'masque gauche Survie');
  assert.ok(css.includes('rgba(19,14,27,.9)'),'masque gauche Runner');
  assert.ok(css.includes('rgba(20,17,12,.66)'),'masque bas Survie');
  assert.ok(css.includes('rgba(19,15,27,.70)'),'masque bas Runner');
  assert.ok(css.includes('color:#f4ede5'),'couleur description');
  assert.ok(css.includes('font-weight:500'),'graisse description');
  assert.ok(css.includes('max-width:88%'),'composition préservée');
  assert.ok(css.includes('art/jeux-survie-card-portrait.webp'));
  assert.ok(css.includes('art/jeux-runner-card-or-violet.webp'));
});

test('SPEC 102 — fond Runner or/violet indépendant des couleurs pédagogiques',()=>{
  const css=read('public/jeux-univers.css'),html=read('public/index.html');
  assert.ok(css.includes('art/jeux-runner-card-or-violet.webp'));
  assert.ok(!css.includes('url("art/jeux-runner-card-portrait.webp")'));
  assert.ok(html.includes('jeux-univers.css?v=8'));
  assert.ok(css.includes('.runner-tuile.runner-f'));
  assert.ok(css.includes('.runner-tuile.runner-n'));
  assert.ok(css.includes('art/jeux-survie-card-portrait.webp'),'Survie non modifié');
});

test('SPEC 103 — cartes compactes lisibles avec records et actions intactes',()=>{
  const css=read('public/jeux-univers.css'),js=read('public/jeux-v21.js');
  const runner=read('public/runner.js'),html=read('public/index.html');
  assert.ok(css.includes('SPEC 103'));
  assert.ok(css.includes('min-height:318px'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr) auto'));
  assert.ok(css.includes('background:rgba(15,12,14,.76)'));
  assert.ok(css.includes('background:rgba(18,13,27,.79)'));
  assert.ok(css.includes('min-height:56px'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(js.includes('Recompose les mots avant la fin du chrono'));
  assert.ok(runner.includes('Trouve le bon genre avant de franchir le portail.'));
  assert.ok(js.includes('onclick="demarrerSurvie()"'));
  assert.ok(runner.includes('onclick="ouvrirRunner()"'));
  assert.ok(js.includes("'<div class=\"jeux-meta\"><span><strong>'+nombre"));
  assert.ok(runner.includes('<strong>60 s</strong>'));
  assert.ok(html.includes('jeux-univers.css?v=8'));
  assert.match(html, /jeux-v21\.js\?v=(1[5-9]|[2-9]\d)/);
  assert.match(html, /runner\.js\?v=(1[6-9]|[2-9]\d)/);
});
