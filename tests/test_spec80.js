// SPEC 80 / 82 — leçon 0 : 20 sons LOD, aucune mémorisation, règle du N.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const lesson=JSON.parse(read('data/lecons/A1.1/lecon-00.json'));
const audio=JSON.parse(read('public/audio/lod.json'));
assert.equal(lesson.titre_fr,'Les bases');
assert.deepEqual(lesson.unites.map(u=>u.titre),['Prononciation','United Zoha']);
assert.ok(lesson.titre_fr.length<18);
assert.ok(lesson.unites.every(u=>u.titre.length<18));
assert.deepEqual(lesson.unites.map(u=>u.activiteUnique),['quiz','trous']);
assert.equal(lesson.flashcards.length,0,'aucune mémorisation imposée');
assert.equal(lesson.ecriture.length,0,'aucune traduction imposée');
const questions=lesson.quiz.filter(x=>x.unite===1);
const words=new Set(questions.map(q=>q.reponse));
assert.equal(words.size,20,'20 prononciations différentes');
assert.equal(questions.length,20,'un seul bloc de 20 écoutes');
assert.equal(lesson.quiz.filter(x=>x.unite===2).length,0);
assert.equal(lesson.trous.filter(x=>x.unite===1).length,0);
assert.equal(lesson.trous.filter(x=>x.unite===2).length,15);
for(const q of questions){
  assert.equal(q.audioMot,q.reponse);
  assert.ok(audio[q.audioMot],q.audioMot+' possède un son LOD');
  assert.equal(q.audioFichier,audio[q.audioMot],'chemin MP3 direct pour le quiz');
  assert.ok(fs.existsSync(path.join(root,'public/audio',q.audioFichier)),q.audioMot+' possède un MP3 local');
  assert.equal(q.distracteurs.length,3);
  assert.equal(new Set(q.distracteurs).size,3);
  assert.ok(q.distracteurs.every(d=>words.has(d)&&d!==q.reponse),'distracteurs = vrais mots entendus');
}
const types=new Set(['Gudde','Gudden','e','en','de','den']);
for(const t of lesson.trous){
  assert.ok(t.choix.includes(t.trou));
  assert.ok(t.choix.length===2,'la décision porte seulement sur la forme du N');
  assert.ok(t.choix.every(x=>types.has(x)));
  assert.ok(/lettre suivante/.test(t.fr),'la lettre suivante est annoncée');
}
const regles=lesson.cours.filter(x=>x.type==='callout');
const regleSons=regles.find(x=>x.unite===1);
const regleN=regles.find(x=>x.unite===2);
assert.equal(regleSons.titre,'Les sons essentiels');
assert.ok(regleSons.lignes.some(x=>x.includes('LOD')));
assert.ok(regleSons.lignes.some(x=>x.includes('pas')));
assert.ok(regleN.titre.startsWith('United Zoha'));
assert.ok(regleN.lignes.some(x=>x.includes('ne touche que')));
assert.deepEqual(lesson.cours.find(x=>x.type==='tableau'&&x.unite===2).entetes,['Sans N','Avec N']);
assert.ok(lesson.unites[1].pieges.some(x=>x.includes('masculins')));
assert.ok(!JSON.stringify(lesson).includes('UNITEDZOHA'));
assert.equal(lesson.mission.type,'studio-radio');
assert.equal(lesson.scene.length,0,'aucune scène de traduction');
assert.equal(lesson.mission.defis.length,8);
const rep=lesson.mission.defis;
assert.deepEqual(['audio','verification','completer'].map(t=>rep.filter(d=>d.type===t).length),[3,3,2]);
for(const d of rep){
  assert.ok(d.choix.includes(d.reponse));
  if(d.type==='audio'){
    assert.equal(d.audioFichier,audio[d.audioMot]);
    assert.ok(fs.existsSync(path.join(root,'public/audio',d.audioFichier)));
  }
}
const other=['A1.1/lecon-02.json','A1.1/lecon-05.json','A1.1/lecon-06.json','A1.1/lecon-08.json','A1.1/lecon-11.json','A1.1/lecon-14.json','A1.2/lecon-23.json','A1.2/lecon-24.json','A1.2/lecon-25.json'];
for(const file of other)assert.ok(!read('data/lecons/'+file).includes('UNITEDZOHA'),'libellé harmonisé : '+file);
console.log('SPEC 80/82 : OK — 20 sons, 15 décisions N, 8 défis, sans traduction.');
