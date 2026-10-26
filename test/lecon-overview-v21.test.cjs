'use strict';
// node --test test/lecon-overview-v21.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const css = read('public/lecon-v21.css');
const html = read('public/index.html');
const mission = read('public/mission.js');
const parcours = read('public/parcours.js');
function entre(s,debut,fin) {
  const a=s.indexOf(debut), b=s.indexOf(fin,a+debut.length);
  assert.ok(a>=0 && b>a, 'Bornes introuvables: '+debut);
  return s.slice(a,b);
}

test('Périmètre visuel isolé : header plus court et actions secondaires sobres', () => {
  assert.match(html,/href="lecon-v21\.css(?:\?[^"]+)?"/);
  assert.match(css,/url\("art\/hero-luxapp-mobile\.webp"\)/);
  const hero=entre(css,'#view-plecon .pl-head {','#view-plecon .pl-head::before');
  assert.match(hero,/min-height: 188px/);
  assert.match(hero,/padding: 30px 20px 17px/);
  assert.match(css,/#view-plecon .ms-carte.compacte \{\s*gap: 7px;\s*padding: 13px 15px 12px/);
  assert.match(css,/#view-plecon .pl-resume \{/);
  assert.doesNotMatch(css,/#view-dashboard|#view-msintro|#view-pintro|#view-parcours|#view-mission/);
});

test('Mission : seules les répliques du personnage « toi » entrent dans le compteur', () => {
  const extrait=entre(mission,'function missionHtml(l, conseillee)','// État de la mission');
  const l={id:1,mission:{titre:'Premier cours'},scene:[
    {qui:'toi',unite:1},{qui:'prof',unite:1},{qui:'toi',unite:2},{qui:'prof',unite:2}
  ]};
  const env={
    studioActif:()=>false,getMissionBest:()=>null,
    repliqueApprise:(l,x)=>x.unite===1, statutMission:()=>null,
    etiquetteMission:()=> 'MISSION', escHtml:String,
    etatPreparationMission:()=> 'En préparation', peutTenterSaChance:()=>true
  };
  const result=new Function('env','l','with(env){'+extrait+';return missionHtml(l,false)}')(env,l);
  assert.match(result,/1 \/ 2 répliques préparées/);
  assert.match(result,/aria-valuemax="2" aria-valuenow="1"/);
  assert.match(result,/style="width:50%"/);
  assert.match(result,/onclick="voirScenario\(\)"/);
  assert.match(result,/onclick="openMission\(true\)"/);
  assert.match(result,/Tenter la mission →/);
  assert.doesNotMatch(result,/Tenter la mission ·/);
});

test('Bonus disponible, mais aucun raccourci isolé Quiz/Trous/Écriture/Mot caché', () => {
  const extrait=entre(parcours,'function chipsEtapes(uniteId)','function renderParcoursLecon()');
  const env={
    TOUTE_LA_LECON:'all',pLecon:{id:1},
    aDuPlus:()=>true,getPlusFait:()=>false,textePlus:()=> '1 mot'
  };
  const exec=new Function('env','id','with(env){'+extrait+';return chipsEtapes(id)}');
  const result=exec(env,1);
  assert.match(result,/onclick="startUnite\(1, 'plus'\)"/);
  assert.match(result,/\+1 mot/);
  assert.doesNotMatch(result,/startEtapeSeule|Mot caché|Quiz|Trous|Écriture/);
  assert.equal(exec(env,'all'),'');
  assert.match(parcours,/function startEtapeSeule\(uniteId, type\)/);
  assert.match(parcours,/function toutRevoir\(\)/);
});

test('Synthèses compactes : lancement du contenu complet et bilan, sans boutons redondants', () => {
  const extrait=entre(parcours,'function renderParcoursLecon()','// Carte d\'une unité dans l\'écran de la leçon.');
  const nodes={
    'pl-num':{textContent:''},'pl-titre':{textContent:''},
    'pl-sous':{textContent:''},'pl-units':{innerHTML:''}
  };
  const l={id:1,titre:'Moien!',titre_fr:'Salutations',unites:[{id:1}]};
  const env={
    pLecon:l,pLibreIci:null,TOUTE_LA_LECON:'all',loadRun:()=>null,
    resumeRevision:()=>({parLecon:{1:{dus:0,dusParUnite:{}}}}),
    unitesCoeur:()=>[{id:1}],getUnitBest:()=>null,
    numLecon:()=>1,missionHtml:()=>'',carteUniteHtml:()=>'<div>UNITÉ</div>',
    nbItems:()=>157,minutesPour:()=>31,leconComplete:()=>false,
    document:{getElementById:key=>nodes[key]}
  };
  new Function('ctx','with(ctx){'+extrait+';renderParcoursLecon()}')(env);
  const s=nodes['pl-units'].innerHTML;
  assert.match(s,/class="pc-btn pl-resume pl-toute"/);
  assert.match(s,/onclick="startUnite\('all', 'lecon'\)"/);
  assert.match(s,/157 questions · environ 31 min/);
  assert.match(s,/class="pc-btn pl-resume pl-bilan" onclick="lancerBilan\(\)"/);
  assert.match(s,/10 questions mélangées/);
  assert.doesNotMatch(s,/Tout revoir|onclick="toutRevoir|chipsEtapes|startEtapeSeule/);
});

test('Reprise d’une leçon complète entamée toujours possible', () => {
  const extrait=entre(parcours,'function renderParcoursLecon()','// Carte d\'une unité dans l\'écran de la leçon.');
  const nodes={'pl-num':{},'pl-titre':{},'pl-sous':{},'pl-units':{innerHTML:''}};
  const l={id:1,titre:'Leçon',titre_fr:'Cours',unites:[]};
  const env={
    pLecon:l,TOUTE_LA_LECON:'all',loadRun:(libre)=>libre?{leconId:1,uniteId:'all'}:null,
    resumeRevision:()=>({parLecon:{1:{dus:0,dusParUnite:{}}}}),
    unitesCoeur:()=>[],numLecon:()=>1,missionHtml:()=>'',nbItems:()=>80,
    minutesPour:()=>16,leconComplete:()=>false,
    document:{getElementById:key=>nodes[key]}
  };
  new Function('ctx','with(ctx){'+extrait+';renderParcoursLecon()}')(env);
  assert.match(nodes['pl-units'].innerHTML,/onclick="reprendreRun\(true\)"/);
  assert.match(nodes['pl-units'].innerHTML,/Reprendre la leçon complète/);
  assert.match(nodes['pl-units'].innerHTML,/En cours/);
});

test('Sécurité mobile, focus clavier, navigation et CTA pédagogiques conservés', () => {
  assert.match(css,/@media \(max-width: 380px\)/);
  assert.match(css,/min-height: var\(--toucher\)/);
  assert.match(css,/#view-plecon .pl-resume:focus-visible/);
  assert.match(parcours,/onclick="openIntro\(' \+ u\.id \+ '\)"/);
  assert.match(parcours,/onclick="reprendreRun\(\)"/);
  assert.match(parcours,/lancerRattrapageEtoile\(/);
  assert.match(parcours,/lancerRevisionErreursUnite\(/);
  assert.match(parcours,/function lancerBilan\(\)/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css,/#view-plecon \.pl-unit > \.pc-btn\.wide\.pl-action-unite/);
  assert.match(parcours,/Gagner ma 3e étoile/);
  assert.match(parcours,/Questions difficiles · étoiles conservées/);
});
