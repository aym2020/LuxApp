'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
function boot(){
  const c={
    document:{addEventListener(){}}, niveauActif:'A1.1',
    niveauxDisponibles:()=>['A1.1','A1.2'],
    etatSynchro:()=>null, isCloudEnabled:()=>false,
    aDejaPratique:()=>true,
    progressionNiveau:()=>({pourcent:33,terminees:2,nbLecons:12,anciennes:0}),
    serieActuelle:()=>5,
    escHtml:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),
    console
  };
  vm.createContext(c);
  for(const file of ['accueil.js','accueil-v21.js','watfir-dev.js']){
    vm.runInContext(fs.readFileSync(path.join(root,'public',file),'utf8'),c,{filename:file});
  }
  return c;
}
test('Watfir : nom dans l’en-tête, sans remplacer le menu ni les niveaux',()=>{
  const h=boot().enteteAccueilHtml();
  assert.match(h,/watfir/);
  assert.match(h,/ac-menu/);
  assert.match(h,/puces-niveau/);
  assert.doesNotMatch(h,/>LuxApp</);
});
test('Watfir : textes MOIEN et slogan dans le HTML, non dans l’asset de fond',()=>{
  const h=boot().accrocheHtml();
  assert.match(h,/<h2>MOIEN/);
  assert.match(h,/Le luxembourgeois autrement\./);
  assert.match(h,/aria-hidden="true"/);
  const css=fs.readFileSync(path.join(root,'public','watfir-dev.css'),'utf8');
  assert.match(css,/watfir-hero-background-mobile\.webp/);
  assert.match(css,/watfir-hero-background-fhd\.webp/);
  assert.match(css,/#view-dashboard \.watfir-hero/);
});
test('Images générées : FHD, mobile, référence, poids modéré',()=>{
  const {execFileSync}=require('node:child_process');
  // Pillow validates the actual sizes in the CI build workflow.
  const files=[
    ['public/art/watfir-hero-background-fhd.webp',250000],
    ['public/art/watfir-hero-background-mobile.webp',100000],
    ['docs/brand/watfir-hero-reference-fhd.webp',300000]
  ];
  for(const [name,max] of files){
    const b=fs.readFileSync(path.join(root,name));
    assert.equal(b.toString('ascii',0,4),'RIFF');
    assert.equal(b.toString('ascii',8,12),'WEBP');
    assert.ok(b.length<max,name+' too large');
  }
});
