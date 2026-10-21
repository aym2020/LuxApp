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


test('Le bandeau de révision numérique remplace les icônes et garde les destinations réelles',()=>{
  const c=boot();
  const h=c.accesHtml({etat:'afaire',dus:4});
  assert.match(h,/watfir-shortcut-n/);
  assert.match(h,/>01</);
  assert.match(h,/>02</);
  assert.match(h,/>03</);
  assert.doesNotMatch(h,/ICONES\./);
  assert.match(h,/4<\/b>à revoir/);
  for(const call of ['lancerRevision()', 'openExamens()', "startSession('errors')", 'goLessons()']){
    assert.ok(h.includes(call),'Lien manquant : '+call);
  }
  assert.match(h,/Voir mon chemin/);
  assert.match(h,/A1\.1 · Apprends à ton rythme/);
});
test('Le prototype ne peut pas injecter de statistiques fictives ou de contrôle de démonstration',()=>{
  const code=fs.readFileSync(path.join(root,'public','watfir-dev.js'),'utf8');
  assert.doesNotMatch(code,/42\s*%|7 jours|data-mode="progress"|Leçon 6/);
  assert.doesNotMatch(code,/Math\.random/);
  assert.match(code,/const enteteV21 = enteteAccueilHtml;/);
  assert.match(code,/infoRevision\(rev\)/);
});
test('Les chiffres actifs proviennent toujours du moteur réel et les visiteurs débutants ont un hero sans compteur',()=>{
  const c=boot();
  c.progressionNiveau=()=>({pourcent:37,terminees:3,nbLecons:12,anciennes:0});
  c.serieActuelle=()=>9;
  const chiffres=c.chiffresHtml();
  assert.match(chiffres,/37 %/);
  assert.match(chiffres,/9 jours/);
  assert.match(chiffres,/aria-valuenow="37"/);
  assert.doesNotMatch(c.accrocheHtml(true),/37 %|9 jours/);
});
test('L’authentification et le changement de niveau gardent les fonctions d’origine',()=>{
  const c=boot();
  c.isCloudEnabled=()=>true;
  c.fbAuth={currentUser:null};
  const invite=c.enteteAccueilHtml();
  assert.match(invite,/ac-v21-guest/);
  assert.match(invite,/ouvrirCompteDepuisAccueil/);
  assert.match(invite,/changerNiveauAccueil/);
  c.fbAuth={currentUser:{uid:'user-1'}};
  assert.doesNotMatch(c.enteteAccueilHtml(),/ac-v21-guest/);
});
test('Le CSS reproduit les blocs clefs de la maquette et reste limité au dashboard',()=>{
  const css=fs.readFileSync(path.join(root,'public','watfir-dev.css'),'utf8');
  const html=fs.readFileSync(path.join(root,'public','index.html'),'utf8');
  for(const expected of [
    '#view-dashboard .watfir-hero',
    'height: 338px',
    '#view-dashboard .watfir-shortcut-n',
    '#view-dashboard .watfir-actions .ac-acces',
    '#view-dashboard .ac-chiffres',
    'font-size: 20px',
    '@media (max-width: 375px)',
    'prefers-reduced-motion'
  ])assert.ok(css.includes(expected),expected);
  assert.ok(html.indexOf('accueil-v21.css')<html.indexOf('watfir-dev.css'));
  assert.ok(html.indexOf('accueil-v21.js')<html.indexOf('watfir-dev.js'));
  assert.doesNotMatch(css,/\b\d{2,3}vw\s*\*/);
});
