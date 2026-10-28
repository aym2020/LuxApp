'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const l=JSON.parse(read('data/lecons/A1.1/lecon-00.json'));
test('Leçon 0 : aucune régression des anciennes activités',()=>{
 assert.deepEqual(l.unites.map(u=>u.id),[1,2,3]);
 assert.equal(l.quiz.filter(x=>x.unite===1).length,20);
 assert.equal(l.trous.filter(x=>x.unite===2).length,15);
 assert.equal(l.flashcards.length,0);
 assert.equal(l.ecriture.length,0);
 assert.equal(l.mission.defis.length,8);
});
test('Les huit pronoms sont vus avant les huit questions',()=>{
 const u=l.unites[2],questions=l.quiz.filter(q=>q.unite===3);
 assert.equal(u.decouverte.length,8);
 assert.equal(questions.length,8);
 assert.deepEqual(u.decouverte.map(x=>x.pronom),questions.map(x=>x.reponse));
 for(const q of questions){
   assert.equal(q.distracteurs.length,3);
   assert.ok(!q.distracteurs.includes(q.reponse));
   assert.equal(new Set(q.distracteurs).size,3);
 }
 assert.equal(questions.find(x=>x.question==='Il').reponse,'hien');
 assert.equal(questions.filter(x=>x.question.startsWith('Vous')).length,1);
 assert.equal(questions.find(x=>x.question==='Vous').reponse,'Dir');
 assert.ok(!questions.some(q=>q.id===3227));
 assert.equal(questions.find(x=>x.question==='Elle (nom féminin)').reponse,'si');
 assert.equal(questions.find(x=>x.question==='Elle (prénom féminin)').reponse,'hatt');
 assert.equal(questions.find(x=>x.question==='Ils / Elles').reponse,'si');
 for(const rub of ['regles','lexique','phrases'])assert.ok(l.cours.some(c=>c.unite===3&&c.rubrique===rub));
 const l7=JSON.parse(read('data/lecons/A1.1/lecon-07.json'));
 assert.ok(l7.ecriture.some(e=>e.lu==='Vu wou kënnt hien?'));
});
test('Découverte guidée : du premier pronom aux quiz',()=>{
 const el=new Map(),elem=id=>{if(!el.has(id))el.set(id,{textContent:'',innerHTML:'',style:{},disabled:false});return el.get(id)};
 const ctx={pLecon:l,document:{getElementById:elem},escHtml:x=>String(x),arreterAudio(){},fermerClavier(){},showView(){},boutonEcouterHtml:(w)=>'<button>Écouter '+w+'</button>',startUnite(id,mode,filtre,meta,apres){ctx.start={id,mode,apres}}};
 vm.createContext(ctx);vm.runInContext(read('public/decouverte.js'),ctx);
 vm.runInContext('demarrerDecouverte(3)',ctx);
 assert.match(elem('dc-contenu').innerHTML,/dc-pronom/);
 assert.match(elem('dc-contenu').innerHTML,/ech/);
 assert.match(elem('dc-contenu').innerHTML,/Écouter ech/);
 assert.match(elem('dc-titre').textContent,/pronoms/);
 for(let i=0;i<8;i++)vm.runInContext('suivantDecouverte()',ctx);
 assert.equal(ctx.start.id,3);
 assert.equal(ctx.start.mode,'unite');
 assert.equal(ctx.start.apres,true);
});
test('Scores isolés, textes UI et scripts versionnés',()=>{
 const p=read('public/progress.js'),pc=read('public/parcours.js'),st=read('public/studio.js');
 assert.match(p,/0-pronoms-v1/);
 assert.match(pc,/Découvrir les pronoms/);
 assert.match(pc,/8 pronoms à découvrir/);
 assert.match(st,/unitesCoeur\(l\)\.length \+ ' unités préparées/);
 assert.match(read('public/index.html'),/src="decouverte\.js\?v=pronoms02"/);
});

test('Tous les pronoms du lexique ont un vrai MP3 LOD ou Mia',()=>{
 const lod=JSON.parse(read('public/audio/lod.json'));
 const mia=JSON.parse(read('public/audio/mia.json'));
 const words=l.cours.find(x=>x.unite===3&&x.rubrique==='lexique').items.map(x=>x[0]);
 assert.equal(words.length,7);
 for(const word of words){
   const file=lod[word]||mia[word]||mia[word.toLowerCase()];
   assert.ok(file,word+' sans audio indexé');
   assert.match(file,/^(?:lod\/[A-Za-z0-9_-]+|mia\/[a-f0-9]{24})\.mp3$/);
   assert.ok(fs.statSync(path.join(__dirname,'../public/audio',file)).size>500,word+' fichier absent/vide');
 }
});
test('Les anciennes références Mia ne disparaissent pas lors de la génération',()=>{
 const mia=JSON.parse(read('public/audio/mia.json'));
 for(const word of ['Awar, Léa! Schéinen Dag!','Awar, Paul!','Wollekekrazer','e Wollekekrazer','kee Bus'])
   assert.ok(mia[word],word+' référence historique perdue');
});
