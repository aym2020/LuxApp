const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lesson = (lvl,n) => JSON.parse(src('data/lecons/'+lvl+'/lecon-'+String(n).padStart(2,'0')+'.json'));
function env(){
  const stats={}, calls=[];
  const c={console,Set,Map,stats,calls,lecons:[lesson('A1.2',27)],
    getStatsStore:()=>stats, leconTerminee:()=>true,
    melanger:x=>x.slice().reverse(),numLecon:l=>l.numero,
    itemsRevision:l=>l.quiz.map(q=>({leconId:l.id,type:'quiz',qid:q.id,q})),
    resumeRevision:()=>({dus:[]}),
    demarrerSession:(mode,title,questions,opts)=>calls.push({mode,title,questions,opts}),
    goLessons:()=>{},cheminLeconOuverte:null};
  vm.createContext(c);vm.runInContext(src('public/defis.js'),c);
  return c;
}
test('12 vrais nouveaux couples inversés pour la leçon 20 et choix sans doublon',()=>{
  const c=env(),result=vm.runInContext('poolDefisLecon(lecons[0])',c);
  assert.equal(result.length,12);
  const seen=new Set();
  for(const it of result){
    assert.equal(it.type,'quiz');
    assert.match(it.qid,/^defi-inverse-v1-20\d{2}$/);
    assert(!seen.has(it.qid));seen.add(it.qid);
    assert.equal(it.q.distracteurs.length,3);
    assert(!it.q.distracteurs.includes(it.q.reponse));
    assert.equal(new Set(it.q.distracteurs).size,3);
    assert(!c.lecons[0].quiz.some(q=>q.question===it.q.question&&q.reponse===it.q.reponse));
  }
});
test('audit du pool pour toutes les leçons A1.1/A1.2 du catalogue',()=>{
  const c=env(),actual=[];
  for(let i=0;i<=17;i++) actual.push(lesson('A1.1',i));
  for(let i=20;i<=27;i++) actual.push(lesson('A1.2',i));
  c.lecons=actual;
  for(const l of actual){
    const out=vm.runInContext('poolDefisLecon(lecons.find(x=>x.id==='+l.id+'))',c);
    assert(out.length<=12);
    const seen=new Set();
    for(const it of out){
      assert(!seen.has(it.qid));seen.add(it.qid);
      assert(!it.q.distracteurs.includes(it.q.reponse));
      assert.equal(new Set(it.q.distracteurs).size,3);
      assert(!l.quiz.some(q=>q.question===it.q.question&&q.reponse===it.q.reponse));
    }
  }
});
test('compteur décrémenté après réponse, et seulement après',()=>{
  const c=env(),id=c.lecons[0].id;
  const pool=vm.runInContext('poolDefisLecon(lecons[0])',c);
  assert.equal(vm.runInContext('defisIneditsRestants(lecons[0]).length',c),12);
  assert.equal(vm.runInContext('itemsDefisDecouverts(lecons[0]).length',c),0);
  c.stats[id]={quiz:{[pool[0].qid]:{attempts:1,lastSeenAt:new Date().toISOString()}}};
  assert.equal(vm.runInContext('defisIneditsRestants(lecons[0]).length',c),11);
  assert.equal(vm.runInContext('itemsDefisDecouverts(lecons[0]).length',c),1);
});
test('session directe (4 nouvelles), puis révision de cette seule leçon',()=>{
  const c=env(),l=c.lecons[0];
  vm.runInContext('lancerDefisLecon(lecons[0].id)',c);
  assert.equal(c.calls.length,1);
  assert.equal(c.calls[0].questions.length,4);
  assert(c.calls[0].questions.every(q=>q.q.defiInedit));
  for(const it of vm.runInContext('poolDefisLecon(lecons[0])',c)){
    (c.stats[l.id] ||= {quiz:{}}).quiz[it.qid]={attempts:1};
  }
  vm.runInContext('lancerDefisLecon(lecons[0].id)',c);
  assert.equal(c.calls.length,2);
  assert.match(c.calls[1].title,/RÉVISER MES ACQUIS/);
  assert(c.calls[1].questions.every(q=>q.leconId===l.id));
});
test('Chemin sans Bilan, le détail le conserve et le CTA passe par les défis',()=>{
  const chemin=src('public/chemin.js'), p=src('public/parcours.js'),html=src('public/index.html');
  assert(!chemin.includes('<li class="bilan"><button'));
  assert(chemin.includes('defisIneditsRestants(l)'));
  assert(chemin.includes('fn: () => lancerDefisLecon(l.id)'));
  assert(p.includes('class="pc-btn pl-resume pl-bilan"'));
  assert(p.includes('!i.q.defiInedit'));
  assert(html.includes('defis.js?v=')&&html.indexOf('defis.js?v=')<html.indexOf('chemin.js?v='));
});
