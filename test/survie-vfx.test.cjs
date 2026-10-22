'use strict';
// SPEC 92 étape 1 — gestionnaire d'effets Survie (canvas + sons), testé avec un faux navigateur.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','public','survie-vfx.js'),'utf8');
function faux2d(){
 const f=()=>{};
 return {setTransform:f,clearRect:f,drawImage(){this.dessins++},fillRect:f,save:f,restore:f,translate:f,rotate:f,
  createRadialGradient:()=>({addColorStop:f}),dessins:0,globalAlpha:1,globalCompositeOperation:'source-over',fillStyle:''};
}
function charger({reduit=false}={}){
 const store=new Map(),frames=[],oscillateurs=[];
 const ctx2d=faux2d();
 class FauxAudio{constructor(){this.state='running';this.currentTime=0;this.destination={}}
  createOscillator(){const o={type:'',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}};oscillateurs.push(o);return o}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}}
 const window={devicePixelRatio:3,addEventListener(){},matchMedia:()=>({matches:reduit}),
  requestAnimationFrame:fn=>{frames.push(fn);return frames.length},cancelAnimationFrame:()=>{frames.length=0},AudioContext:FauxAudio};
 const document={createElement:()=>({width:0,height:0,getContext:()=>faux2d()})};
 const ctx={window,document,Math,storageKey:k=>'profilA:'+k,
  localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,v)}};
 vm.createContext(ctx);vm.runInContext(source+';this.SurvieFx=SurvieFx;',ctx);
 const canvas={clientWidth:360,clientHeight:64,width:0,height:0,getContext:()=>ctx2d};
 let temps=0;
 const avancer=(n)=>{for(let i=0;i<n;i++){const fn=frames.shift();if(!fn)return;temps+=16;fn(temps)}};
 return {fx:ctx.SurvieFx,ctx,canvas,ctx2d,frames,avancer,store,oscillateurs};
}
test('Canvas : DPR plafonné à 2, boucle lancée puis arrêtée proprement',()=>{
 const {fx,canvas,frames,avancer}=charger();
 fx.etat({ratio:1,palier:0,urgence:false,secondes:30});
 fx.attacher(canvas);
 assert.equal(canvas.width,720,'360 px × DPR 2 (et non 3)');
 assert.equal(fx.enCours(),true);
 avancer(30);
 assert.ok(fx.nombreParticules()>0,'braises visibles au palier 0');
 fx.arreter();
 assert.equal(fx.enCours(),false);
 assert.equal(fx.nombreParticules(),0);
 assert.equal(frames.length,0);
});
test('Palier 3 prolongé et réussites en rafale : jamais plus de 140 particules',()=>{
 const {fx,canvas,avancer}=charger();
 fx.etat({ratio:1,palier:3,urgence:false,secondes:30});
 fx.attacher(canvas);
 let max=0;
 for(let i=0;i<40;i++){fx.reussite({palier:3,nouveauPalier:true});avancer(10);max=Math.max(max,fx.nombreParticules())}
 assert.ok(max<=140,'max='+max);
 assert.ok(max>60,'le feu du palier 3 est dense');
});
test('Erreur : flammes et étincelles éteintes, fumée et morceau de barre qui tombe',()=>{
 const {fx,canvas,avancer}=charger();
 fx.etat({ratio:0.8,palier:2,urgence:false,secondes:24});
 fx.attacher(canvas);
 avancer(40);
 fx.reussite({palier:2,nouveauPalier:false});
 const avant=fx.nombreParticules();
 fx.erreur({ancienRatio:0.8,nouveauRatio:0.7,serieAvant:6});
 fx.etat({ratio:0.7,palier:0,urgence:false,secondes:21});
 assert.ok(fx.nombreParticules()<avant);
 avancer(1); // la frame dessine fumée et morceau sans erreur
 avancer(120);
 assert.ok(fx.nombreParticules()<40,'retour à quelques braises');
});
test('prefers-reduced-motion : aucun canvas animé',()=>{
 const {fx,canvas,frames}=charger({reduit:true});
 fx.attacher(canvas);
 assert.equal(fx.enCours(),false);
 assert.equal(frames.length,0);
 fx.reussite({palier:1,nouveauPalier:true});
 assert.equal(fx.nombreParticules(),0);
});
test('Son : actif par défaut, coupure mémorisée par profil, aucun oscillateur quand coupé',()=>{
 const {fx,ctx,store,oscillateurs}=charger();
 assert.equal(fx.sonActif(),true);
 fx.lettre(0);fx.reussite({palier:0,nouveauPalier:false});
 const joues=oscillateurs.length;
 assert.equal(joues,4,'1 note de lettre + arpège de 3 notes');
 assert.equal(fx.basculerSon(),false);
 assert.equal(store.get('profilA:luxSurvieSon'),'0');
 fx.lettre(1);fx.erreur({ancienRatio:.5,nouveauRatio:.4,serieAvant:0});
 assert.equal(oscillateurs.length,joues);
 ctx.storageKey=k=>'profilB:'+k;
 assert.equal(fx.sonActif(),true,'autre profil : son actif');
});
test('Chrono critique : un seul battement par seconde',()=>{
 const {fx,oscillateurs}=charger();
 fx.etat({ratio:.15,palier:0,urgence:true,secondes:4});
 fx.etat({ratio:.14,palier:0,urgence:true,secondes:4});
 fx.etat({ratio:.1,palier:0,urgence:true,secondes:3});
 fx.etat({ratio:.5,palier:0,urgence:false,secondes:15});
 assert.equal(oscillateurs.length,2);
});

test('Fin Canvas : extinction unique, dernières braises et arrêt propre',()=>{
 const {fx,canvas,avancer,frames,oscillateurs}=charger();
 fx.etat({ratio:0.4,palier:2,urgence:false,secondes:12});
 fx.attacher(canvas);
 avancer(28);
 fx.etat({ratio:0,palier:2,urgence:false,secondes:0});
 fx.fin();fx.fin();
 const points=fx.nombreParticules(),sons=oscillateurs.length;
 assert.ok(points>0);
 assert.equal(sons,1,'un seul son discret en fin de partie');
 avancer(120);
 assert.equal(fx.nombreParticules(),0,'aucune création de braises après extinction');
 fx.arreter();
 assert.equal(fx.enCours(),false);assert.equal(frames.length,0);
 fx.attacher(canvas); // une nouvelle partie doit pouvoir relancer le moteur
 assert.equal(fx.enCours(),true);
 fx.arreter();
});
