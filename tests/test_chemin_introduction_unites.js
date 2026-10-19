// SPEC 55 : consultation libre, introduction avant la première action.
// node tests/test_chemin_introduction_unites.js
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const source=['public/parcours.js','public/mission.js','public/chemin.js'].map(read).join('\n');
const harness="\nconst lesson={id:21,titre:\"An der Wunneng\",mission:{titre:\"Le déménagement\"},scene:[{}],\n  unites:[{id:1},{id:2},{id:3},{id:4,bonus:true}]};\nconst legacy={id:90};\nlet seen=new Set(),events=[];\nlecons=[lesson,legacy];\ngetIntroMissionVue=id=>seen.has(id);\nmarquerIntroMissionVue=id=>{seen.add(id);events.push([\"confirmed\",id]);};\nleconCommencee=()=>false;getUnitBest=()=>null;\nmarquerLeconVue=id=>events.push([\"seen\",id]);fermerClavier=()=>{};\nshowView=id=>events.push([\"view\",id]);\nrenderIntroMission=()=>events.push([\"intro\"]);\nrenderParcoursLecon=()=>events.push([\"units\",pLecon.unites.map(u=>u.id)]);\nloadRun=()=>null;itemsUnite=()=>[{id:2002},{id:2003}];\nopenLecon=l=>events.push([\"legacy\",l.id]);\nconst oi=openIntro;\nopenIntro=id=>introMissionAVoir(pLecon)?oi(id):events.push([\"unit\",id]);\nconst os=startUnite;\nstartUnite=(...args)=>introMissionAVoir(pLecon)?os(...args):events.push([\"exercise\",...args]);\nconst om=openMission;\nopenMission=t=>introMissionAVoir(pLecon)&&!t?om(t):events.push([\"mission\",!!t]);\nconst ob=lancerBilan;\nlancerBilan=()=>introMissionAVoir(pLecon)?ob():events.push([\"bilan\"]);\nconst or=toutRevoir;\ntoutRevoir=()=>introMissionAVoir(pLecon)?or():events.push([\"review\"]);\nconst of=rafraichirLecon;\nrafraichirLecon=()=>introMissionAVoir(pLecon)?of():events.push([\"refresh\"]);\nreturn {\n reset(){seen=new Set();events=[];actionApresIntroMission=null;pLecon=lesson;currentLecon=lesson;},\n events(){return events.slice();}, confirmed(){return seen.has(21);}, pending(){return !!actionApresIntroMission;},\n preview(){ouvrirTouteLaLeconDepuisChemin(21);},\n legacy(){ouvrirTouteLaLeconDepuisChemin(90);},\n discover(){ouvrirIntroMission(lesson);},\n normal(){openParcoursLecon(lesson);},\n introUnits(){voirUnitesDepuisIntro();},\n choose(id){openIntro(id);},\n direct(id){ouvrirUniteDepuisChemin(21,id);},\n full(){startUnite(\"all\",\"lecon\");},\n quiz(id){startEtapeSeule(id,\"quiz\");},\n mission(){ouvrirMissionDepuisChemin(21);},\n bilan(){pLecon=lesson;lancerBilan();},\n review(){toutRevoir();},refresh(){rafraichirLecon();},\n confirm(){confirmerIntroMission();}\n};";
const app=new Function('window','document',source+'\n'+harness)(
  {addEventListener(){}},{addEventListener(){}}
);
const has=(type,detail)=>app.events().some(x=>x[0]===type&&(detail===undefined||x[1]===detail));
app.reset();app.preview();
assert.ok(has('view','view-plecon'));
assert.deepEqual(app.events().find(e=>e[0]==='units')[1],[1,2,3,4]);
assert.equal(app.confirmed(),false,'aperçu ne confirme pas la mission');
app.choose(4);assert.ok(has('view','view-msintro'));
assert.equal(has('unit',4),false,'pas de démarrage avant confirmation');
app.confirm();assert.ok(has('unit',4),'le bonus choisi reprend après introduction');
assert.equal(app.confirmed(),true);assert.equal(app.pending(),false);
app.choose(2);assert.ok(has('unit',2),'après validation, accès libre');
app.reset();app.discover();app.confirm();
assert.ok(has('unit',1),'Découvrir continue la première unité');
app.reset();app.normal();assert.ok(has('view','view-msintro'));
app.introUnits();assert.ok(has('view','view-plecon'));
assert.equal(app.confirmed(),false,'Voir les unités ne valide pas');
app.reset();app.direct(4);assert.ok(has('intro'));app.confirm();assert.ok(has('unit',4));
app.reset();app.full();assert.ok(has('intro'));assert.equal(has('exercise'),false);
app.confirm();assert.ok(app.events().some(x=>x[0]==='exercise'&&x[1]==='all'&&x[2]==='lecon'));
app.reset();app.quiz(2);assert.ok(has('intro'));app.confirm();
assert.ok(app.events().some(x=>x[0]==='exercise'&&x[1]===2&&x[2]==='etape'&&x[3].includes('quiz:2002')));
for(const t of ['mission','bilan','review','refresh']){
  app.reset();app[t]();assert.ok(has('view','view-msintro'),t);
  assert.equal(has(t),false,'pas de démarrage anticipé: '+t);
  app.confirm();assert.ok(has(t),'action conservée: '+t);
}
app.reset();app.legacy();assert.ok(has('legacy',90),'ancienne leçon inchangée');
assert.ok(read('public/chemin.js').includes('onclick="ouvrirTouteLaLeconDepuisChemin('));
console.log('SPEC 55 : OK — aperçu, bonus, première introduction, unité choisie, exercices, mission, bilan, reprise.');
