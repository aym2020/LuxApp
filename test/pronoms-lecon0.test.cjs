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
 const ctx={pLecon:l,document:{getElementById:elem},escHtml:x=>String(x),attrHtml:x=>String(x),ICONE_ECOUTER:'<svg></svg>',arreterAudio(){},fermerClavier(){},showView(){},boutonEcouterHtml:(w)=>'<button>Écouter '+w+'</button>',startUnite(id,mode,filtre,meta,apres){ctx.start={id,mode,apres}}};
 vm.createContext(ctx);vm.runInContext(read('public/decouverte.js'),ctx);
 vm.runInContext('demarrerDecouverte(3)',ctx);
 assert.match(elem('dc-contenu').innerHTML,/dc-pronom/);
 assert.match(elem('dc-contenu').innerHTML,/ech/);
 assert.match(elem('dc-contenu').innerHTML,/Écouter ech/);
 const markup=elem('dc-contenu').innerHTML;
 const mot=markup.indexOf('class="dc-pronom"');
 const traduction=markup.indexOf('class="dc-traduction"');
 const ecouter=markup.indexOf('class="dc-pronom-audio"');
 const exemple=markup.indexOf('>EXEMPLE</div>');
 assert.ok(mot >= 0 && mot < traduction && traduction < ecouter && ecouter < exemple,
   'le mot et la traduction doivent être centrés indépendamment du bouton audio');
 assert.ok(!markup.includes('dc-pronom-ligne'), 'pas de bouton à côté du mot');
 assert.match(elem('dc-titre').textContent,/pronoms/);
 assert.equal(elem('dc-compteur').hidden,true,'compteur droit masqué seulement pour les pronoms');
 assert.equal(elem('dc-etape').textContent,'PRONOM 1 SUR 8');
 for(let i=0;i<8;i++)vm.runInContext('suivantDecouverte()',ctx);
 assert.equal(ctx.start.id,3);
 assert.equal(ctx.start.mode,'unite');
 assert.equal(ctx.start.apres,true);
 vm.runInContext('demarrerDecouverte(2)',ctx);
 assert.equal(elem('dc-compteur').hidden,false,'compteur droit conservé dans United Zoha');
 vm.runInContext('demarrerDecouverte(1)',ctx);
 assert.equal(elem('dc-compteur').hidden,false,'compteur droit conservé dans la découverte des sons');
});
test('Scores isolés, textes UI et scripts versionnés',()=>{
 const p=read('public/progress.js'),pc=read('public/parcours.js'),st=read('public/studio.js');
 assert.match(p,/0-pronoms-v1/);
 assert.match(pc,/Découvrir les pronoms/);
 assert.match(pc,/8 pronoms à découvrir/);
 assert.match(st,/unitesCoeur\(l\)\.length \+ ' unités préparées/);
 assert.match(read('public/index.html'),/src="decouverte\.js\?v=pronoms04"/);
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

test('Découverte : bouton audio centré sur sa propre ligne, sans décaler le pronom',()=>{
 const js=read('public/decouverte.js'),css=read('public/style.css');
 assert.match(js,/class="dc-pronom-audio"/);
 assert.doesNotMatch(js,/dc-pronom-ligne/);
 assert.match(css,/#view-decouverte \.dc-pronom-audio\s*\{[^}]*justify-content:center/);
 assert.match(css,/#view-decouverte \.dc-pronom-audio \.bouton-ecouter\.compact\s*\{[^}]*min-width:44px; min-height:44px/);
 assert.doesNotMatch(css,/#view-decouverte \.dc-pronom-ligne/);
 assert.match(read('public/index.html'),/href="style\.css\?v=pronoms03"/);
});

test('Finitions mobiles : espacement audio, en-tête compact et compteur non redondant',()=>{
 const css=read('public/pronoms-decouverte.css'),html=read('public/index.html');
 const js=read('public/decouverte.js');
 assert.match(js,/compteur\.hidden = pronoms/);
 assert.match(css,/#view-decouverte \.dc-pronom-audio\s*\{\s*margin-bottom:16px/);
 assert.match(css,/#view-decouverte #dc-compteur\[hidden\]\s*\{\s*display:none/);
 assert.match(css,/@media\s*\(max-width:600px\)\s*\{[\s\S]*\.dc-contenant:has\(\.dc-pronom\)\s*\{\s*padding-top:14px/);
 assert.match(css,/\.dc-contenant:has\(\.dc-pronom\) \.dc-ligne\s*\{\s*margin-top:14px/);
 assert.match(html,/href="pronoms-decouverte\.css\?v=1"/);
 assert.match(html,/src="decouverte\.js\?v=pronoms04"/);
});
