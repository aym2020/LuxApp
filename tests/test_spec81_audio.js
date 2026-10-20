// SPEC 81 — Régression du lecteur audio : chemins absolus, secours LOD,
// un seul lecteur actif et erreurs non trompeuses. Sans réseau / navigateur.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const base=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(base,'public/dialogue.js'),'utf8');
const chemins=JSON.parse(fs.readFileSync(path.join(base,'public/audio/lod.json'),'utf8'));
const lecon=JSON.parse(fs.readFileSync(path.join(base,'data/lecons/A1.1/lecon-00.json'),'utf8'));
const creees=[],messages=[],avertissements=[];
class AudioFictif {
  constructor(url){this.url=url;this.pauseAppels=0;this.error={code:4};creees.push(this);}
  play(){return Promise.resolve();}
  pause(){this.pauseAppels++;}
}
const player=new Function('document','Audio','console','escHtml','messages',
  src+'\nnotifier=(msg)=>messages.push(msg);\nreturn {sourcesAudio,jouerAudio,arreterAudio};'
)(
  {addEventListener(){}},AudioFictif,
  {warn:(...args)=>avertissements.push(args)},String,messages
);
const bouton=()=>{const etat=new Set();return {etat,classList:{
  add:c=>etat.add(c),remove:c=>etat.delete(c)
}}};
const reset=()=>{player.arreterAudio();creees.length=0;messages.length=0;avertissements.length=0;};
const dossier='https://raw.githubusercontent.com/robertoentringer/lod-mp3-mirror/master/2020-12-18-lod-opendata/';
assert.deepEqual(player.sourcesAudio('lod/WAISS1.mp3'),['/audio/lod/WAISS1.mp3',dossier+'WAISS1.mp3']);
assert.deepEqual(player.sourcesAudio('lod-phrases/abc.m4a'),['/audio/lod-phrases/abc.m4a']);
assert.deepEqual(player.sourcesAudio('../evil.mp3'),[]);
for(const q of lecon.quiz.filter(q=>q.unite===1)){
 const file=chemins[q.audioMot];assert.ok(file,'MP3 LOD indexé pour '+q.audioMot);
 assert.equal(player.sourcesAudio(file).length,2,'second chemin LOD prêt pour '+q.audioMot);
}
reset();
const premier=bouton();player.jouerAudio('lod/WAISS1.mp3',premier);
assert.equal(creees.length,1);
assert.equal(creees[0].url,'/audio/lod/WAISS1.mp3','ne dépend pas de la route courante');
assert.ok(premier.etat.has('joue'));
creees[0].onended();
assert.ok(!premier.etat.has('joue'),'nettoyage après lecture');
assert.deepEqual(messages,[],'aucun message de faux échec');
reset();
const second=bouton();player.jouerAudio('lod/WAISS1.mp3',second);
const ancienne=creees[0], onerrorAncien=ancienne.onerror;
ancienne.onerror();
assert.equal(creees.length,2,'un seul essai de secours');
assert.equal(creees[1].url,dossier+'WAISS1.mp3','le même MP3 LOD depuis son miroir');
assert.equal(messages.length,0,'pas de toast avant échec du secours');
onerrorAncien();
assert.equal(creees.length,2,'ne relance pas le secours en doublon');
creees[1].onended();
assert.ok(!second.etat.has('joue'));
reset();
const troisieme=bouton();player.jouerAudio('lod/WAISS1.mp3',troisieme);
creees[0].onerror();creees[1].onerror();
assert.equal(messages.length,1,'un seul message après les deux échecs');
assert.ok(messages[0].includes('réessaie'));
assert.ok(!troisieme.etat.has('joue'));
reset();
const quatrieme=bouton(),cinquieme=bouton();
player.jouerAudio('lod/WAISS1.mp3',quatrieme);
const vieux=creees[0], ancienErreur=vieux.onerror;
player.jouerAudio('lod/JO1.mp3',cinquieme);
assert.ok(!quatrieme.etat.has('joue'));
ancienErreur();
assert.equal(creees.length,2,'une ancienne erreur ne lance pas de lecture parasite');
assert.equal(messages.length,0);
reset();
player.jouerAudio('lod-phrases/test.m4a',bouton());
creees[0].onerror();
assert.equal(creees.length,1,'pas de miroir MP3 inventé pour les phrases');
assert.equal(messages.length,1);
reset();
console.log('SPEC 81 : OK — 9 sons, URL absolue, miroir, erreurs, annulation et nettoyage.');
