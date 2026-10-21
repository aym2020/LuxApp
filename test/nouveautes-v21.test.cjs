'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('public/nouveautes-v21.js');
const css=read('public/nouveautes-v21.css');
const html=read('public/index.html');
const accueil=read('public/accueil.js');
const parcours=read('public/parcours.js');
const scenario=read('public/scenario-v21.css');
function extraction(s,begin,end){
  const a=s.indexOf(begin),b=s.indexOf(end,a+begin.length);
  assert.ok(a>=0&&b>a,'Fonction introuvable: '+begin);
  return s.slice(a,b);
}
test('Nouveautés est chargé et lié au menu Plus avec version 2.1',()=>{
 assert.match(html,/href="nouveautes-v21\.css"/);
 assert.match(html,/src="nouveautes-v21\.js"/);
 assert.match(accueil,/\[ICONES\.livre, 'Nouveautés', 'Ce qui change avec LuxApp 2\.1', 'ouvrirNouveautes\(\)'\]/);
 assert.match(accueil,/<div class="plus-version">LuxApp <b>2\.1<\/b><\/div>/);
});
test('Six thèmes issus de vrais commits : écran éditorial, pas un changelog brut',()=>{
 assert.match(source,/const LUXAPP_VERSION_21 = '2\.1'/);
 const categories=['ACCUEIL','CHEMIN','LEÇONS','MISSIONS','ENTRAÎNEMENT','CONFORT'];
 for(const category of categories) assert.ok(source.includes("categorie:'"+category+"'"),category);
 const commitIds=[...source.matchAll(/commit:'([0-9a-f]{9})'/g)].map(x=>x[1]);
 assert.equal(commitIds.length,6);
 assert.equal(new Set(commitIds).size,6);
 assert.match(source,/lien|visuel|scénario|série/i);
});
test('Le panneau de nouveautés est lisible, et chaque commit possède un lien externe',()=>{
 let rendered='',title='',classes=[],attr={},heading={};
 const env={
 ouvrirPanneau:(h,t)=>{rendered=h;title=t},
 document:{getElementById:id=>id==='panneau'?{
  classList:{add:c=>classes.push(c)},setAttribute:(k,v)=>attr[k]=v,
  querySelector:()=>heading
 }:null}
 };
 new Function('env','with(env){'+source+';ouvrirNouveautes()}')(env);
 assert.equal(title,'Nouveautés LuxApp 2.1');
 assert.deepEqual(classes,['nv21-panel']);
 assert.equal(attr['aria-labelledby'],'nv21-heading');
 assert.equal(heading.id,'nv21-heading');
 assert.equal((rendered.match(/class="nv21-feature"/g)||[]).length,6);
 assert.equal((rendered.match(/Voir un commit associé/g)||[]).length,6);
 assert.match(rendered,/Retour au menu Plus/);
 assert.match(rendered,/fermerPanneau\(\); ouvrirPlus\(\)/);
 assert.match(rendered,/historique complet/);
 assert.match(rendered,/LuxApp · Version 2\.1/);
});
test('Scénario : unité réellement secondaire par rapport au personnage',()=>{
 const rule=sel=>{const start=scenario.indexOf(sel+' {'),end=scenario.indexOf('}',start);assert.ok(start>=0&&end>start);return scenario.slice(start,end)};
 assert.match(rule('.ms-v21-dialogue .ms-v21-unite'),/font: 650 \.6875rem/);
 assert.match(rule('.ms-v21-dialogue .ms-v21-unite'),/opacity: \.7/);
 assert.match(rule('.ms-v21-dialogue .ms-v21-qui'),/font: 700 \.75rem/);
 assert.match(scenario,/\.ms-v21-dialogue \.ms-v21-ligne\.toi \.ms-v21-qui \{ color: var\(--couleur-action\)/);
});
test('Nouvelle introduction remet systématiquement son défilement interne en haut',()=>{
 const snippet=extraction(parcours,'function openIntro(uniteId) {','// Retour depuis « Avant de commencer »');
 const content={innerHTML:'',scrollTop:3211},cta={innerHTML:''};
 let currentId=1,shown='';
 const env={
 pLecon:{id:1},introMissionAVoir:()=>false,
 trouverUnite:(_,id)=>({id,titre:'Unité '+id,phrase:['Test','Exemple'],regle:'Règle',pieges:['Attention'],phrases:[['Mot','Traduction']]}),
 fermerClavier:()=>{},itemsUnite:()=>[],minutesPour:()=>6,nbItems:()=>24,
 escHtml:String,studioActif:()=>false,decouvertePour:()=>[],
 motsHtml:()=>'',showView:id=>{shown=id},
 document:{getElementById:k=>k==='pi-content'?content:k==='pi-cta'?cta:null}
 };
 new Function('ctx','with(ctx){'+snippet+';openIntro(1); openIntro(2);}')(env);
 assert.equal(shown,'view-pintro');
 assert.equal(content.scrollTop,0);
 assert.match(content.innerHTML,/Unité 2/);
 assert.match(cta.innerHTML,/Commencer/);
});
test('Le correctif scroll ne modifie ni la restauration ni le moteur de progression',()=>{
 const snippet=extraction(parcours,'function openIntro(uniteId) {','// Retour depuis « Avant de commencer »');
 assert.match(snippet,/const introScroll = document\.getElementById\('pi-content'\)/);
 assert.match(snippet,/introScroll\.scrollTop = 0/);
 assert.match(snippet,/showView\('view-pintro'\)/);
 assert.doesNotMatch(snippet,/^\s*(?:window\.scrollTo|setTimeout|startUnite)\(/m);
});
test('CSS Nouveautés : écran défilant, cibles lisibles, animation réduite',()=>{
 assert.match(css,/\.panneau\.nv21-panel \{/);
 assert.match(css,/height: 100dvh/);
 assert.match(css,/\.nv21-panel \.nv21-scroll \{[\s\S]*?overflow-y: auto/);
 assert.match(css, /\.nv21-panel \.nv21-back \{[\s\S]*?min-height: 44px/);
 assert.match(css, /prefers-reduced-motion: reduce/);
});
