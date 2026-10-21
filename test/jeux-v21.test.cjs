'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const script=read('public/jeux-v21.js'),accueil=read('public/accueil-v21.js'),css=read('public/accueil-v21.css'),html=read('public/index.html'),nav=read('public/navigation.js');
const card=(fr,lu)=>({fr,lu}),lesson=(id,flashcards)=>({id,flashcards});
function make(){
 const store=new Map(),nodes=new Map(),timeouts=[];let tick=1000;
 const element=id=>{
  if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',style:{},disabled:false,
   classList:{contains:cl=>id==='view-survie'&&cl==='active'},setAttribute(){},focus(){},blur(){}});
  return nodes.get(id);
 };
 const ctx={console,lecons:[],getProgress:()=>({}),getLeconVue:()=>false,
  storageKey:x=>'profilA:'+x,
  localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},
  document:{visibilityState:'visible',getElementById:element,querySelector:()=>({disabled:false,textContent:'',setAttribute(){}}),querySelectorAll:()=>[]},
  showView:id=>{ctx.lastView=id},retour:()=>{ctx.lastView='retour'},goLessons:()=>{},
  performance:{now:()=>tick},setInterval:()=>1,clearInterval:()=>{},setTimeout:fn=>timeouts.push(fn)};
 vm.createContext(ctx);vm.runInContext(script,ctx);
 return {ctx,store,element,advance:ms=>tick+=ms,flush:()=>{while(timeouts.length)timeouts.shift()()}};
}
test('Accueil : quatre raccourcis, même rangée et même hauteur',()=>{
 assert.match(accueil,/boutonAcces\('jeux',/);
 assert.match(accueil,/ouvrirJeux\(\)/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/#view-dashboard \.ac-btn\.ac-v21-journey/);
 assert.doesNotMatch(accueil,/jeux-carte|survie-mot/);
});
test('Pages Jeux et Survie, navigation native Android',()=>{
 for(const id of ['view-jeux','view-survie'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/jeux-v21.css\?v=3/);assert.match(html,/jeux-v21.js\?v=2/);
 assert.match(nav,/'view-jeux': 1/);
 assert.match(nav,/else if \(e\.vue === 'view-jeux'\) renderJeuxHub\(\)/);
 assert.match(nav,/case 'view-jeux': ouvrirJeux\(\)/);
});
test('Mots issus uniquement des leçons étudiées, sans Plus, phrases ni doublons',()=>{
 const {ctx}=make();
 ctx.list=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht'),card('salut','Moien'),card('film','Film'),card('Au bureau','Um Büro'),{...card('cher','deier'),plus:true},card('maison','Haus')]),lesson(2,[card('table','Dësch')])];
 ctx.progress={1:{vue:{ouverte:1}}};
 const pool=vm.runInContext('survieMotsDisponibles(list,progress)',ctx);
 assert.deepEqual(Array.from(pool,p=>p.mot),['Haus','Bam','Buch','Këscht','Moien']);
 assert.equal(vm.runInContext('survieMotsDisponibles(list,{}).length',ctx),0);
});
test('Record persistant et isolé par profil sans écrire la progression',()=>{
 const {ctx,store}=make();
 vm.runInContext('survieEnregistrer(8)',ctx);
 assert.equal(vm.runInContext('survieRecord()',ctx),8);
 vm.runInContext('survieEnregistrer(2)',ctx);
 assert.equal(vm.runInContext('survieRecord()',ctx),8);
 assert.ok(store.has('profilA:luxSurvieBest'));
 ctx.storageKey=k=>'profilB:'+k;
 assert.equal(vm.runInContext('survieRecord()',ctx),0);
});
test('Survie : auto-validation, +3 s, mauvaise réponse -3 s et série remise à zéro',()=>{
 const {ctx,element,advance,flush}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht'),card('bonjour','Moien')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 assert.equal(ctx.lastView,'view-survie');
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
 advance(4000);vm.runInContext('survieTick()',ctx);
 assert.equal(vm.runInContext('Math.round(surviePartie.restant)',ctx),26);
 // Associer chaque lettre correcte à une tuile disponible.
 ctx.indices=vm.runInContext('(function(){const p=surviePartie,used=new Set();return Array.from(p.mot.mot).map(c=>{const i=p.tuiles.findIndex((x,j)=>x===c&&!used.has(j));used.add(i);return i})})()',ctx);
 vm.runInContext('indices.forEach(survieLettre)',ctx);
 assert.equal(vm.runInContext('surviePartie.serie',ctx),1);
 assert.equal(vm.runInContext('Math.round(surviePartie.restant)',ctx),29);
 assert.equal(vm.runInContext('surviePartie.gainTexte',ctx),'+3 s');
 assert.match(element('survie-combo').className,/survie-combo-hit/);
 assert.match(element('survie-chrono').className,/survie-time-hit/);
 assert.equal(vm.runInContext('survieRecord()',ctx),1);
 flush();
 // Forcer un ordre de tuiles différent de la solution attendue.
 ctx.bad=vm.runInContext('(function(){const p=surviePartie,ids=p.tuiles.map((_,i)=>i);while(ids.map(i=>p.tuiles[i]).join("")===p.mot.mot){ids.push(ids.shift())}return ids})()',ctx);
 vm.runInContext('bad.forEach(survieLettre)',ctx);
 assert.equal(vm.runInContext('surviePartie.serie',ctx),0);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),26);
 assert.equal(vm.runInContext('survieComboPalier(surviePartie.serie)',ctx),0);
 assert.doesNotMatch(element('survie-combo').className,/survie-combo-hit/);
 flush();
 advance(32000);vm.runInContext('survieTick()',ctx);
 assert.match(element('survie-jeu').innerHTML,/FIN DE PARTIE/);
 assert.equal(vm.runInContext('surviePartie.actif',ctx),false);
 vm.runInContext('demarrerSurvie()',ctx);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
});
test('Timer en pause quand le document est caché',()=>{
 const {ctx,advance}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 ctx.document.visibilityState='hidden';
 advance(30000);vm.runInContext('survieTick()',ctx);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
 ctx.document.visibilityState='visible';vm.runInContext('survieTick()',ctx);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
});

test('Survie : les lettres courtes et les dernières rangées sont centrées, sans grille rigide',()=>{
 const styles=read('public/jeux-v21.css');
 const zone=styles.match(/#view-survie \.survie-tuiles\s*\{([^}]*)\}/);
 assert.ok(zone,'le conteneur des tuiles doit exister');
 assert.match(zone[1],/display:flex/);
 assert.match(zone[1],/flex-wrap:wrap/);
 assert.match(zone[1],/justify-content:center/);
 assert.match(zone[1],/max-width:347px/);
 assert.doesNotMatch(zone[1],/grid-template-columns/);
 assert.match(styles,/#view-survie \.survie-tuile\{flex:0 0 clamp\(44px,13\.2vw,52px\)/);
 assert.match(html,/href="jeux-v21\.css\?v=3"/);
});

test('Combo arcade : paliers progressifs, étincelles, temps bonus et animation réduite',()=>{
 const {ctx}=make();
 ctx.series=[0,2,3,4,5,9,10,20];
 assert.deepEqual(Array.from(vm.runInContext('series.map(survieComboPalier)',ctx)),[0,0,1,1,2,2,3,3]);
 assert.equal(vm.runInContext('survieComboMessage(3)',ctx),'COMBO ×3');
 assert.equal(vm.runInContext('survieComboMessage(5)',ctx),'EN FEU ×5');
 assert.equal(vm.runInContext('survieComboMessage(10)',ctx),'LÉGENDAIRE ×10');
 assert.equal(vm.runInContext('survieGainLabel(3)',ctx),'+3 s');
 assert.equal(vm.runInContext('survieGainLabel(0)',ctx),'CHRONO PLEIN');
 assert.match(script,/SURVIE_BONUS = 3/);
 const css=read('public/jeux-v21.css');
 for(const x of ['data-tier="1"','data-tier="2"','data-tier="3"',
  '.survie-combo-hit #survie-serie','.survie-combo-hit .survie-etincelles i',
  '.survie-time-hit .survie-gain','@keyframes survie-combo-impact',
  '@media(prefers-reduced-motion:reduce)']) assert.ok(css.includes(x),x);
 assert.doesNotMatch(css,/#view-survie \.survie-tuiles\{[^}]*animation/);
});
test('Bonus plafonné : ne pas afficher +3s si la réserve est déjà au maximum',()=>{
 const {ctx,element}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 ctx.ordre=vm.runInContext('(function(){const p=surviePartie,used=new Set();return Array.from(p.mot.mot).map(letter=>{const i=p.tuiles.findIndex((c,j)=>c===letter&&!used.has(j));used.add(i);return i;});})()',ctx);
 vm.runInContext('ordre.forEach(survieLettre)',ctx);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
 assert.equal(vm.runInContext('surviePartie.gainTexte',ctx),'CHRONO PLEIN');
 assert.equal(vm.runInContext('survieRecord()',ctx),1);
 assert.match(element('survie-jeu').innerHTML,/survie-etincelles/);
 assert.match(element('survie-jeu').innerHTML,/survie-combo-cri/);
});
