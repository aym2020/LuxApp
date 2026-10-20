// SPEC 79 — audit leçon 0, nouvelle unité 2, audio et compatibilité de progression.
// Lancement : node tests/test_spec79.js
'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const lesson=n=>JSON.parse(read('data/lecons/A1.1/lecon-'+String(n).padStart(2,'0')+'.json'));
const l0=lesson(0),l1=lesson(1),l2=lesson(2),arch=JSON.parse(read('data/archives/lecon-02-unite-02-avant-spec79.json'));
const audio=JSON.parse(read('public/audio/lod.json'));
const sounds=l0.quiz.filter(q=>q.unite===1).map(q=>q.reponse);
assert.equal(sounds.length,20,'un seul exercice de 20 écoutes');
assert.equal(new Set(sounds).size,20,'20 sons différents');
assert.equal(l0.flashcards.length,0,'pas de vocabulaire à mémoriser');
assert.equal(l0.ecriture.length,0,'pas de traduction écrite');
assert.equal(l0.quiz.filter(q=>q.unite===2).length,0);
assert.equal(l0.trous.filter(q=>q.unite===1).length,0);
assert.equal(l0.trous.filter(q=>q.unite===2).length,15);
for(const q of l0.quiz) {
  assert.equal(q.audioMot,q.reponse);
  assert.ok(audio[q.audioMot],q.audioMot+' dans le dictionnaire LOD');
  assert.ok(fs.existsSync(path.join(root,'public/audio',audio[q.audioMot])),q.audioMot+' : MP3 physique');
  assert.equal(q.distracteurs.length,3);
  assert.ok(q.distracteurs.every(d=>sounds.includes(d)&&d!==q.reponse));
}
for(const typ of ['flashcards','quiz','trous','ecriture']){
  const ids=l0[typ].map(x=>x.id).sort((a,b)=>a-b);
  assert.equal(new Set(ids).size,ids.length,typ+' IDs uniques');
  for(let i=1;i<ids.length;i++)assert.equal(ids[i],ids[i-1]+1,typ+' IDs séquentiels');
  if (typ==='quiz') assert.equal(l0[typ].filter(x=>x.unite===1).length,20);
  if (typ==='trous') assert.equal(l0[typ].filter(x=>x.unite===2).length,15);
}
for(const c of l0.cours){
  assert.ok(['regles','lexique','phrases'].includes(c.rubrique),'rubrique SPEC75');
  assert.ok(l0.unites.some(u=>u.id===c.unite),'cours lié à une unité');
}
for(const u of l0.unites){
  for(const typ of ['regles','lexique','phrases'])
    assert.ok(l0.cours.some(c=>c.unite===u.id&&c.rubrique===typ),'couverture '+u.id+'/'+typ);
}
for(const q of l0.quiz.concat(l2.quiz)){
  assert.ok(!q.distracteurs.includes(q.reponse),'réponse non dupliquée');
  assert.equal(new Set(q.distracteurs).size,q.distracteurs.length,'distracteurs uniques');
}
for(const t of l0.trous.concat(l2.trous)){
  assert.ok(t.choix.includes(t.trou), 'bonne réponse présente');
  assert.equal(new Set(t.choix).size,t.choix.length,'choix distincts');
  assert.ok((t.avant+t.trou+t.apres).trim(),'trou substantiel');
}
assert.ok(l0.cours.some(b=>b.titre.includes('United Zoha')),'règle nommée');
assert.ok(l1.unites[0].regle.includes('Gudde Moien')&&l1.unites[0].regle.includes('Gudden Owend'),
  'les exemples suivants sont déjà présents dans la leçon 1');
assert.match(read('server.js'),/const files = fs\.readdirSync\(dir\).*\.sort\(\)/,'leçon 00 chargée avec le répertoire');
assert.match(read('server.js'),/lecons\.sort\(/,'leçon 0 placée en premier');
const newUnit=l2.unites.find(x=>x.id===2);
assert.ok(newUnit.titre.includes('définis'),'remplacement pédagogique');
assert.ok(newUnit.articleAEcrire,'article obligatoire dans le mot caché');
assert.ok(l2.cours.some(c=>c.unite===2&&c.rubrique==='regles'&&c.titre.includes("de, den, d'")));
for(const typ of ['flashcards','quiz','trous','ecriture']) {
  const nouveau=l2[typ].filter(x=>x.unite===2);
  assert.ok(nouveau.length>=6,typ+' nouveau contenu');
  assert.ok(nouveau.every(x=>x.id>=2701&&x.id<=2799),'nouveaux IDs sans réutilisation');
  assert.ok(arch[typ].length>0,'archive '+typ);
  assert.ok(arch[typ].every(x=>!l2[typ].some(y=>y.id===x.id)),'anciens exercices exclus');
}
assert.equal(l2.mission.version,3,'mission versionnée');
assert.equal(arch.unite.id,2,'ancienne unité archivée');
const arcWords=arch.flashcards.map(x=>x.lu);
assert.ok(arcWords.includes('Telefon')&&arcWords.includes('Dësch'),'archive fidèle');
// L'élision d' ne laisse jamais un espace dans la réponse du mot caché.
const parc=read('public/parcours.js');
assert.match(parc,/card\.article\.endsWith\("'"\)/,'articles élidés collés');
assert.match(parc,/q\.audioMot/,'lecture du quiz audio');
assert.match(parc,/Écouter le mot à reconnaître/,'libellé accessible sans révéler la solution');
assert.match(read('public/style.css'),/\.pc-quiz-audio/,'cible du haut-parleur');
// Extraire les vrais accesseurs de score sans exécuter tout le navigateur.
const p=read('public/progress.js');
function fonction(n){
 const at=p.indexOf('function '+n+'(');assert.ok(at>=0,n+' présent');
 const start=p.indexOf('{',at);let depth=0,end=start;
 for(;end<p.length;end++){if(p[end]==='{')depth++;if(p[end]==='}'&&!--depth)break;}
 return p.slice(at,end+1);
}
let progress={'2':{unites:{'2':97},sansfaute:{'2':1}}};
const api=new Function('getProgress','saveProgress','debounceCloudSave',
  ['cleUniteVersionnee','getUnitBest','saveUnitBest','getSansFaute','saveSansFaute'].map(fonction).join('\n')+
  ';return {cleUniteVersionnee,getUnitBest,saveUnitBest,getSansFaute,saveSansFaute};'
)(()=>progress,p=>{progress=p},()=>{});
assert.equal(api.cleUniteVersionnee(2,2),'2-definis-v1');
assert.equal(api.cleUniteVersionnee(1,2),2);
assert.equal(api.getUnitBest(2,2),null,'ancien score ne valide pas la nouvelle unité');
assert.equal(api.getSansFaute(2,2),false,'ancienne étoile ne valide pas la nouvelle unité');
api.saveUnitBest(2,2,73);api.saveSansFaute(2,2);
assert.equal(progress[2].unites[2],97,'ancien score intact');
assert.equal(progress[2].unites['2-definis-v1'],73,'nouveau score séparé');
assert.equal(progress[2].sansfaute[2],1,'ancienne étoile intacte');
assert.equal(progress[2].sansfaute['2-definis-v1'],1,'nouvelle étoile séparée');
assert.equal(api.getUnitBest(2,2),73);

// Une reprise partiellement remplie ne doit pas charger d'anciennes questions disparues.
const memory=new Map();
const localStorage={
 getItem:k=>memory.get(k)||null,
 setItem:(k,v)=>memory.set(k,String(v))
};
const parcoursSource=read('public/parcours.js');
const runStart=parcoursSource.indexOf('function loadRun(');
assert.ok(runStart>=0,'loadRun présent');
const runBrace=parcoursSource.indexOf('{',runStart);
let runDepth=0,runEnd=runBrace;
for(;runEnd<parcoursSource.length;runEnd++){
 if(parcoursSource[runEnd]==='{')runDepth++;
 if(parcoursSource[runEnd]==='}'&&!--runDepth)break;
}
const load=new Function('localStorage','cleRun','lecons',
  parcoursSource.slice(runStart,runEnd+1)+';return loadRun;'
)(localStorage,()=> 'luxRunPrincipal',[l2]);
const ancien={leconId:2,uniteId:2,steps:[{type:'quiz',queue:[2040],scores:{},total:1}]};
memory.set('luxRunPrincipal',JSON.stringify(ancien));
assert.equal(load(false),null,'ancienne session arrêtée sans crash');
assert.deepEqual(JSON.parse(memory.get('luxRunPrincipal:archive79')),ancien,'session historisée');
assert.equal(JSON.parse(memory.get('luxRunPrincipal')).fini,true,'ancienne session désactivée');
const nouveau={leconId:2,uniteId:2,steps:[{type:'quiz',queue:[2701],scores:{},total:1}]};
memory.set('luxRunPrincipal',JSON.stringify(nouveau));
assert.deepEqual(load(false),nouveau,'session de la nouvelle unité reprenable');
const u2article=l2.flashcards.find(x=>x.unite===2&&x.article==="d'");
assert.ok(u2article&&u2article.lu==="Mapp");
const rendu=new Function('lecon','card',
  "const u=lecon.unites.find(u=>u.id===card.unite);" +
  "return card.article+(card.article.endsWith(\"'\")?'':' ')+card.lu;"
)(l2,u2article);
assert.equal(rendu,"d'Mapp",'article élidé sans espace');

console.log('SPEC 79 : OK — 26 leçons, 20 audios LOD dans la leçon 0, UNIT2 définis, historique préservé.');
