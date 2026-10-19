// SPEC 60 — node tests/test_chemin_amelioration.js
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const source=read('public/parcours.js')+'\n'+read('public/chemin.js');
const lesson={id:20,titre_fr:'Être et avoir au présent',
 unites:[{id:1,titre:'sinn'},{id:2,titre:'hunn'},{id:3,titre:'Questions'}],
 flashcards:[],quiz:[],trous:[],ecriture:[]};
for(const [t,pre] of [['flashcards',10],['quiz',20],['trous',30],['ecriture',40]])
 for(let u=1;u<=3;u++)for(let n=1;n<=2;n++)
 lesson[t].push({id:pre+u*2+n,unite:u,lu:'Ech sinn',fr:'Je suis'});
const best={1:94,2:100,3:88},sansFaute={},snapshots={},started=[];
const elements={};
function element(id){return elements[id] ||= {
 classList:{v:true,contains(k){return k==='hidden'&&this.v;},
 add(k){if(k==='hidden')this.v=true;},remove(k){if(k==='hidden')this.v=false;}},
 innerHTML:'',textContent:'',setAttribute(){},focus(){},querySelector(){return {focus(){}};}};}
const document={activeElement:{focus(){}},addEventListener(){},getElementById:element,
 body:{classList:{add(){},remove(){}}}};
const rt=new Function('window','document','lecons','getUnitBest','getSansFaute',
 'getRattrapageSnapshot','getQuestionStats','getWrongCount','loadRun',
 'escHtml','ICONES','leconAcquiseParMission','getIntroMissionVue','numLecon','started',
 source+'\nstartUnite=(...args)=>started.push(args);'+
 '\nreturn {actionsAmeliorationChemin,boutonAmeliorationChemin,etapesLeconHtml,'+
 'ouvrirAmeliorationChemin,choisirAmeliorationChemin,questionsRevisionErreursUnite};')(
 {addEventListener(){}},document,[lesson],
 (l,u)=>best[u]??null,(l,u)=>!!sansFaute[u],(l,u)=>snapshots[u]||null,
 (l,t,id)=>({wrongTotal:id%2===0?2:0}),(l,t,id)=>id%2===0?1:0,
 ()=>null,s=>String(s),{coche:'✓',bulle:'□',cible:'◎',droite:'→',revision:'↻'},
 ()=>false,()=>true,l=>l.id,started);
assert.equal(rt.actionsAmeliorationChemin(lesson).length,3);
assert.match(rt.boutonAmeliorationChemin(lesson),/3 unités à retravailler/);
assert.ok(!rt.etapesLeconHtml(lesson,null,null,false).includes('chemin-unite-action'));
rt.ouvrirAmeliorationChemin(20);
assert.equal(element('chemin-amelioration-panel').classList.v,false);
const html=element('chemin-amelioration-liste').innerHTML;
assert.match(html,/Défi pour la 3e étoile/);
assert.match(html,/les erreurs exactes ne sont plus disponibles/);
assert.match(html,/Revoir mes erreurs/);
rt.choisirAmeliorationChemin(20,3,'rattrapage');
assert.equal(started.at(-1)[1],'rattrapage');
rt.ouvrirAmeliorationChemin(20);
rt.choisirAmeliorationChemin(20,1,'erreurs');
assert.equal(started.at(-1)[1],'erreurs');
const ts=['flashcards','quiz','trous','ecriture'];
snapshots[1]={signature:ts.map(t=>t+':'+lesson[t].filter(q=>q.unite===1)
 .map(q=>q.id).sort((a,b)=>a-b).join(',')).join('|'),
 basePercent:94,maj:12,steps:ts.map((t,i)=>({type:t,scores:
 Object.fromEntries(lesson[t].filter(q=>q.unite===1).map((q,j)=>[q.id,i===0&&j===1?.5:1]))}))};
assert.equal(rt.questionsRevisionErreursUnite(lesson,1).length,1);
sansFaute[1]=true;sansFaute[2]=true;best[3]=null;
assert.equal(rt.boutonAmeliorationChemin(lesson),'');
assert.ok(read('public/navigation.js').includes('fermerAmeliorationChemin(); return true;'));
console.log('SPEC 60 : OK — compacité, panneau, corrections ciblées, cas historiques, Retour.');
