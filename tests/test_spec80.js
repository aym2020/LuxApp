// SPEC 80 — audit de la leçon 0 : titres compacts, véritable discrimination audio, terminologie.
'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const lesson=JSON.parse(read('data/lecons/A1.1/lecon-00.json'));
const audio=JSON.parse(read('public/audio/lod.json'));
assert.equal(lesson.titre_fr,'Les bases');
assert.deepEqual(lesson.unites.map(u=>u.titre),['Prononciation','United Zoha']);
assert.ok(lesson.titre_fr.length<18);
assert.ok(lesson.unites.every(u=>u.titre.length<18));
const words=new Set(lesson.flashcards.filter(x=>x.unite===1).map(x=>x.lu));
const questions=lesson.quiz.filter(x=>x.unite===1);
assert.equal(words.size,9);
assert.equal(questions.length,9);
for(const q of questions){
  assert.equal(q.audioMot,q.reponse,'le mot entendu est la réponse attendue');
  assert.ok(words.has(q.reponse),'réponse effectivement enseignée');
  assert.ok(audio[q.audioMot],'un MP3 indexé pour le mot entendu');
  assert.equal(q.distracteurs.length,3);
  assert.equal(new Set(q.distracteurs).size,3,'trois distracteurs différents');
  assert.ok(q.distracteurs.every(d=>words.has(d) && d!==q.reponse),'uniquement d’autres mots étudiés');
}
const regles=lesson.cours.filter(x=>x.type==='callout');
const regleSons=regles.find(x=>x.unite===1);
const regleN=regles.find(x=>x.unite===2);
assert.equal(regleSons.titre,'Les sons essentiels');
assert.ok(regleSons.lignes.length<=3,'consigne facile à scanner');
assert.ok(regleSons.lignes.some(x=>x.includes('Lexique')),'renvoi vers les audios');
assert.ok(regleN.titre.startsWith('United Zoha'));
assert.ok(regleN.lignes.some(x=>x.includes('formes concernées') || x.includes('tous les N')),'pas de règle abusive sur tous les N');
assert.deepEqual(lesson.cours.find(x=>x.type==='tableau'&&x.unite===2).entetes,['Sans N','Avec N']);
assert.ok(lesson.unites[1].pieges.some(x=>x.includes('masculins')),'genre de Auto / Dësch précisé');
assert.ok(!JSON.stringify(lesson).includes('UNITEDZOHA'),'ancien libellé absent');
const other=['A1.1/lecon-02.json','A1.1/lecon-05.json','A1.1/lecon-06.json','A1.1/lecon-08.json','A1.1/lecon-11.json','A1.1/lecon-14.json','A1.2/lecon-23.json','A1.2/lecon-24.json','A1.2/lecon-25.json'];
for(const file of other){
 const content=read('data/lecons/'+file);
 assert.ok(!content.includes('UNITEDZOHA'),'libellé harmonisé : '+file);
}
console.log('SPEC 80 : OK — titres courts, 9 quiz audio discriminants, cours concis et United Zoha.');
