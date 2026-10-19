// SPEC 58 — récupération durable de la 3e étoile et suppression des points V1.
// node tests/test_rattrapage_etoiles.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const parcours = read('public/parcours.js');
const progress = read('public/progress.js');
const cloud = read('public/cloud.js');
const app = read('public/app.js');
const index = read('public/index.html');
const css = read('public/style.css');
const lesson = {
  id:21, titre:'An der Wunneng', unites:[{id:1},{id:2},{id:4,bonus:true}],
  flashcards:[{id:11,unite:1},{id:12,unite:1}],
  quiz:[{id:21,unite:1},{id:22,unite:1}],
  trous:[{id:31,unite:1},{id:32,unite:1}],
  ecriture:[{id:41,unite:1},{id:42,unite:1}]
};
let best = { 1:80 }, stored = {}, writes = [], started = [];
const suffix = [
  'const originalStart = startUnite;',
  'startUnite = (...args) => { started.push(args); };',
  'pLecon = lesson;',
  'return { signatureRattrapage, scoreDetailRattrapage, capturerDetailRattrapage,',
  'detailRattrapageValide, questionsPerduesRattrapage, questionsDefiHistorique,',
  'peutRattraperEtoile, lancerRattrapageEtoile, appliquerResultatRattrapage };'
].join('\n');
const engine = new Function('window','document','getUnitBest','getRattrapageSnapshot',
  'saveUnitBest','saveRattrapageSnapshot','getQuestionStats','getWrongCount',
  'lesson','started',parcours + '\n' + suffix)(
    {addEventListener(){}}, {addEventListener(){}},
    (lid,uid) => best[uid] == null ? null : best[uid],
    (lid,uid) => stored[uid] || null,
    (lid,uid,score) => { best[uid] = Math.max(best[uid] || 0, score); writes.push(score); },
    (lid,uid,snap) => { stored[uid] = {...snap,maj:(stored[uid]?.maj||0)+1}; },
    (lid,type,id) => ({wrongTotal: id%2===0 ? 2 : 0}),
    (lid,type,id) => id%2===0 ? 1 : 0, lesson, started);

const original = [
  { type:'flashcards', scores:{11:1,12:.6}},
  { type:'quiz', scores:{21:1,22:1}},
  { type:'trous', scores:{31:1,32:.6}},
  { type:'ecriture', scores:{41:1,42:.2}}
];
assert.equal(engine.scoreDetailRattrapage(original),80);
const snap = engine.capturerDetailRattrapage(lesson,1,original);
assert.equal(snap.basePercent,80);
stored[1]={...snap,maj:1};
assert.ok(engine.detailRattrapageValide(lesson,1));
assert.deepEqual(engine.questionsPerduesRattrapage(snap),
  ['flashcards:12','trous:32','ecriture:42']);
assert.equal(engine.peutRattraperEtoile(lesson,lesson.unites[0]),true);
engine.lancerRattrapageEtoile(1);
assert.equal(started[0][0],1);
assert.equal(started[0][1],'rattrapage');
assert.deepEqual(started[0][2],['flashcards:12','trous:32','ecriture:42']);
assert.equal(started[0][3].source,'detail');
assert.equal(started[0][3].referenceMaj,1);

// La révision de deux questions fait passer les moyennes 80/100/80/60
// à 100/100/100/60, donc 90 % : la 3e étoile est méritée.
let out=engine.appliquerResultatRattrapage({
  leconId:21,uniteId:1,rattrapage:{source:'detail',referenceMaj:1},
  steps:[
    {type:'flashcards',scores:{12:1}},
    {type:'trous',scores:{32:1}},
    {type:'ecriture',scores:{42:.2}}
  ]
});
assert.equal(out.avant,80);
assert.equal(out.apres,90);
assert.equal(out.ameliore,true);
assert.equal(best[1],90);
assert.equal(stored[1].basePercent,90);
assert.equal(engine.peutRattraperEtoile(lesson,lesson.unites[0]),false);

// Mauvais rattrapage : jamais de régression.
best[1]=80;stored[1]={...snap,maj:20};
out=engine.appliquerResultatRattrapage({
  leconId:21,uniteId:1,rattrapage:{source:'detail',referenceMaj:20},
  steps:[{type:'flashcards',scores:{12:0}}]
});
assert.equal(out.apres,80);
assert.equal(best[1],80);

// Un score mémorisé incompatible avec le cours n'est jamais repris.
assert.equal(engine.detailRattrapageValide({...lesson,flashcards:[...lesson.flashcards,
  {id:13,unite:1}]},1),null);
best[1]=82;
assert.equal(engine.detailRattrapageValide(lesson,1),null);
best[1]=80;

// Ancienne partie sans détail : défi sur questions difficiles + types variés.
stored={};
const keys=engine.questionsDefiHistorique(lesson,1);
assert.equal(keys.length,8);
assert.equal(new Set(keys).size,8);
for(const type of ['flashcards','quiz','trous','ecriture'])
  assert.ok(keys.some(k=>k.startsWith(type+':')));
assert.equal(engine.peutRattraperEtoile(lesson,lesson.unites[0]),true);
engine.lancerRattrapageEtoile(1);
assert.equal(started.at(-1)[3].source,'historique');
out=engine.appliquerResultatRattrapage({
  leconId:21,uniteId:1,rattrapage:{source:'historique'},
  steps:original.map(s=>({type:s.type,
    scores:Object.fromEntries(Object.keys(s.scores).map(id=>[id,1]))}))
});
assert.equal(out.apres,90);
assert.equal(best[1],90);
best[1]=80;
out=engine.appliquerResultatRattrapage({
  leconId:21,uniteId:1,rattrapage:{source:'historique'},
  steps:[
    {type:'flashcards',scores:{11:1,12:0}},
    {type:'quiz',scores:{21:1,22:1}},
    {type:'trous',scores:{31:1,32:1}},
    {type:'ecriture',scores:{41:1,42:1}}
  ]
});
assert.equal(out.apres,80,'un défi raté ne donne pas la 3e étoile');

// Pas de mini-défi injustement facile : au moins 5 questions distinctes.
const short={...lesson,flashcards:[{id:11,unite:1}],quiz:[{id:21,unite:1}],
  trous:[{id:31,unite:1}],ecriture:[{id:41,unite:1}]};
assert.deepEqual(engine.questionsDefiHistorique(short,1),[]);
assert.equal(engine.peutRattraperEtoile(short,short.unites[0]),false);

// Migration cloud et distinction avec les trois points de niveau par question.
assert.ok(progress.includes("RATTRAPAGE_KEY = 'luxRattrapage'"));
assert.ok(progress.includes('storageKey(RATTRAPAGE_KEY)'));
assert.ok(cloud.includes('rattrapage: getRattrapageStore()'));
assert.ok(cloud.includes('mergeRattrapage('));
assert.ok(cloud.includes('saveRattrapageStore(payload.rattrapage)'));
assert.ok(!index.includes('id="session-level"'));
assert.ok(!app.includes("renderLevelDots(document.getElementById('session-level')"));
assert.ok(index.includes('id="quiz-level"'));
assert.ok(index.includes('id="trou-level"'));
assert.ok(app.includes('recordSessionAnswer('));
assert.ok(css.includes('.pl-rattrapage'));
assert.ok(/\.pl-rattrapage\s*\{[^}]*flex-direction:\s*column/.test(css),
  'titre et sous-titre du CTA doivent rester empilés sur mobile');
assert.ok(css.includes('.pf-rattrapage'));
assert.ok(parcours.includes("run.mode === 'rattrapage' ? appliquerResultatRattrapage"));
assert.ok(parcours.includes("if (run.mode === 'unite' || run.mode === 'lecon')"));
assert.ok(parcours.includes('★ Rattraper ma 3e étoile'));
console.log('SPEC 58 : OK — 2→3 étoiles, défi historique, progrès non régressif, cloud, suppression points V1.');
