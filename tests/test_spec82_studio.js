// SPEC 82 — une activité sonore, une activité United Zoha, mission sans traduction.
// Exécution locale : node tests/test_spec82_studio.js
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const l=JSON.parse(read('data/lecons/A1.1/lecon-00.json'));
const lod=JSON.parse(read('public/audio/lod.json'));
assert.deepEqual(l.unites.map(x=>x.activiteUnique),['quiz','trous']);
assert.equal(l.quiz.length,20);
assert.equal(l.trous.length,15);
assert.equal(l.flashcards.length,0);
assert.equal(l.ecriture.length,0);
assert.equal(l.mission.defis.length,8);
assert.equal(l.scene.length,0);
assert.deepEqual(l.mission.defis.map(d=>d.type),
  ['audio','audio','audio','verification','verification','verification','completer','completer']);
for(const q of l.quiz){
 assert.equal(q.audioMot,q.reponse);
 assert.equal(q.audioFichier,lod[q.audioMot]);
 assert.ok(lod[q.audioMot] && fs.existsSync(path.join(root,'public/audio',q.audioFichier)));
 assert.equal(q.distracteurs.length,3);
 assert.ok(!q.distracteurs.includes(q.reponse));
}
for(const d of l.mission.defis.filter(d=>d.type==='audio')){
 assert.equal(d.audioFichier,lod[d.audioMot],'la mission réutilise le vrai MP3');
 assert.ok(fs.existsSync(path.join(root,'public/audio',d.audioFichier)));
}
const script=read('public/studio.js'),mission=read('public/mission.js'),
 parcours=read('public/parcours.js'),html=read('public/index.html');
assert.match(html,/src="studio\.js"/);
assert.ok(html.indexOf('src="mission.js"')<html.indexOf('src="studio.js"'));
assert.match(mission,/if \(studioActif\(pLecon\)\) return studioOpenMission\(tentative\)/);
assert.match(parcours,/activiteUnique/);
assert.match(parcours,/const audioDirect = q\.audioFichier/,'le bouton audio est visible sans attendre le lexique');
assert.match(parcours,/aria-label="Écouter le mot à reconnaître"/,'le bouton ne révèle pas la réponse');
assert.match(parcours,/archive82/);
assert.match(read('public/progress.js'),/0-ecoute-v2/);
assert.match(read('public/progress.js'),/0-n-v2/);

const elements=new Map();
function el(id){
 if(!elements.has(id))elements.set(id,{
  innerHTML:'',textContent:'',style:{},scrollTop:0,
  classList:{add(){},remove(){}},
  insertAdjacentHTML(_,value){this.innerHTML+=value;}
 });
 return elements.get(id);
}
let mp3=[],score=[],viesPerdues=0,missionValidee=0;
const contexte={
 pLecon:l,ms:null,dernierFini:null,
 document:{getElementById:el,querySelectorAll:()=>l.mission.defis[contexte.ms.idx].choix.map(()=>({
  disabled:false,classList:{add(){}}
 }))},
 VIES_MISSION:3,
 unitesCoeur:l=>l.unites,
 getUnitBest:()=>null,
 getMissionBest:()=>score.length?Math.max(...score.map(x=>x.percent)):null,
 etiquetteMission:()=> 'MISSION',
 etatPreparationMission:()=> 'Prête à jouer',
 escHtml:x=>String(x),fermerClavier(){},renderEnteteMission(){},majVies(){},showView(){},
 peutTenterSaChance:()=>false,perdreVie(){contexte.ms.vies--;viesPerdues++;},
 arreterAudio(){},jouerAudio(file){mp3.push(file)},sonsLod:lod,
 notifier(){throw new Error('Audio LOD présent : aucun message nécessaire')},
 figerAcquisMission(){},saveMissionBest(id,percent,version){score.push({id,percent,version})},
 missionVersion:l=>l.mission.version,validerLeconParMission(){missionValidee++},
 marquerMissionReussie(){},oublierIntroMission(){},majBoutonsRetour(){},majGarde(){},
 marquerUniteFaite(){},libelleApresMission:()=> 'Continuer',confettis(){}
};
vm.runInNewContext(script,contexte);
assert.equal(contexte.studioActif(l),true);
contexte.studioOpenMission(false);
assert.equal(contexte.ms.idx,0);
assert.equal(el('ms-compteur').textContent,'1 / 8');
assert.ok(el('ms-body').innerHTML.includes('Écouter le mot'));
contexte.studioEcouter({classList:{add(){}}});
assert.deepEqual(mp3,['lod/SCHOUL1.mp3'],'le premier son appelle le vrai fichier LOD');
// Deux bonnes réponses, une erreur (une seule vie) puis cinq bonnes réponses.
for(let i=0;i<8;i++){
 const q=l.mission.defis[i];
 const choice=i===3?q.choix.findIndex(x=>x!==q.reponse):q.choix.indexOf(q.reponse);
 contexte.studioChoisir(choice);
 assert.equal(contexte.ms.resultats[i],i===3?'erreur':'ok');
 // Pas de double pénalité si deux événements se déclenchent.
 contexte.studioChoisir(choice);
 assert.equal(viesPerdues,i>=3?1:0);
 contexte.studioSuivant();
}
assert.equal(contexte.ms.idx,8);
assert.equal(contexte.ms.vies,2);
assert.equal(contexte.ms.bilan.ok,7);
assert.equal(contexte.ms.bilan.total,8);
assert.equal(score.length,1);
assert.equal(score[0].percent,88);
assert.equal(score[0].version,2);
assert.equal(missionValidee,1,'mission validée avec au moins une vie restante');
assert.ok(el('ms-body').innerHTML.includes('7 / 8'));
assert.equal(el('ms-piste').style.width,'100%');
// Une reprise après une réponse déjà enregistrée ne doit pas rejouer l'erreur.
const copie={idx:3,resultats:['ok','ok','ok','erreur'],vies:2,tentative:false};
contexte.studioReprendreMission(copie);
assert.equal(contexte.ms.idx,4);
assert.equal(contexte.ms.vies,2);
// Trois erreurs dans trois défis distincts épuisent les vies et empêchent la validation.
contexte.studioOpenMission(false);
for(let i=0;i<8;i++){
 const q=l.mission.defis[i];
 const index=i<3?q.choix.findIndex(x=>x!==q.reponse):q.choix.indexOf(q.reponse);
 contexte.studioChoisir(index);
 contexte.studioSuivant();
}
assert.equal(contexte.ms.vies,0);
assert.equal(contexte.ms.bilan.ok,5);
assert.equal(missionValidee,1,'une mission sans vie ne valide pas la leçon');
console.log('SPEC 82 : OK — 20 sons, 15 choix N, 8 défis, score, vies, reprise, LOD.');
