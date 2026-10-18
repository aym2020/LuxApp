// Vérification structurelle des cinq leçons migrées en A1.2 (lot 4).
// Lancer : node tests/test_lot4_contenu.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ids = [20, 23, 24, 25, 26];
const v1 = {
  20: { quiz: 15, trous: 11, ecriture: 17 },
  23: { quiz: 22, trous: 19, ecriture: 34 },
  24: { quiz: 35, trous: 26, ecriture: 50 },
  25: { quiz: 21, trous: 18, ecriture: 25 },
  26: { quiz: 20, trous: 17, ecriture: 23 }
};
const ranges = {flashcards:[5,10],quiz:[6,10],trous:[6,10],ecriture:[5,8]};
const normalize = x => String(x||'').trim().toLowerCase();
let total=0;

for(const id of ids){
  const file=path.join(__dirname,'..','data','lecons','A1.2','lecon-'+id+'.json');
  const d=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.equal(d.id,id);
  assert.deepEqual(d.v1,v1[id],id+' archive V1');
  assert.ok(d.mission?.titre&&d.mission?.contexte&&d.mission?.objectif,id+' mission');
  assert.ok(d.unites.length>=2&&d.unites.length<=4,id+' units');
  assert.deepEqual(d.unites.map(u=>u.id),d.unites.map((u,i)=>i+1),id+' sequential units');
  let previous=0;
  const replies=d.scene.filter(r=>r.qui==='toi');
  assert.equal(replies.length,10,id+' learner replies (spec 34 : 10)');
  for(const line of d.scene){
    assert.ok(line.lu&&line.fr&&line.qui&&d.unites.some(u=>u.id===line.unite),id+' dialogue line');
    assert.ok(line.unite>=previous,id+' dialogue order');
    previous=line.unite;
  }
  for(const u of d.unites){
    assert.ok(u.titre&&u.regle&&u.exemple&&u.phrase?.length===2&&u.pieges?.length,id+' unit '+u.id);
    assert.ok(replies.some(r=>r.unite===u.id),id+' unit missing from mission '+u.id);
    assert.ok(d.cours.some(b=>b.type==='vocab'&&b.unite===u.id),id+' vocab not in course '+u.id);
    assert.ok(d.cours.some(b=>b.type==='callout'&&b.unite===u.id),id+' rule not in course '+u.id);
  }
  for(const type of Object.keys(ranges)){
    const questions=d[type];
    assert.deepEqual(questions.map(q=>q.id),questions.map((q,i)=>i+2001),id+' '+type+' ids');
    const seen=new Set();
    for(const q of questions){
      assert.ok(d.unites.some(u=>u.id===q.unite),id+' unknown unit '+q.id);
      if(type==='flashcards'){
        assert.ok(q.lu&&q.fr&&!q.lu.includes('/')&&q.lu.length<=24,id+' bad mot caché '+q.id);
        // Le moteur ajoute un espace après article ; d' doit donc faire partie du mot.
        assert.notEqual(q.article,"d'",id+' article apostrophe in mot cache '+q.id);
      }
      if(type==='quiz'){
        assert.ok(q.question&&q.reponse&&Array.isArray(q.distracteurs),id+' quiz incomplete '+q.id);
        assert.ok(!q.distracteurs.includes(q.reponse),id+' correct answer among distractors '+q.id);
        assert.equal(new Set(q.distracteurs).size,q.distracteurs.length,id+' quiz duplicate distractors '+q.id);
      }
      if(type==='trous'){
        assert.ok(q.fr!=null&&q.avant!=null&&q.trou&&q.apres!=null,id+' trou incomplete '+q.id);
        assert.ok(q.choix.includes(q.trou),id+' missing answer choice '+q.id);
        assert.equal(new Set(q.choix).size,q.choix.length,id+' duplicate blanks '+q.id);
      }
      if(type==='ecriture')assert.ok(q.fr&&q.lu,id+' incomplete writing '+q.id);
      if(!q.plus&&type!=='flashcards'){
        const label=normalize(type==='quiz'?q.question:q.fr);
        assert.ok(!seen.has(label),id+' repeated core '+type+' '+label);
        seen.add(label);
      }
    }
    for(const u of d.unites){
      const n=questions.filter(q=>q.unite===u.id&&!q.plus).length;
      const [min,max]=ranges[type];
      assert.ok(n>=min&&n<=max,id+' '+type+' core size in unit '+u.id+': '+n);
    }
    total+=questions.length;
  }
  for(const r of replies){
    const core=d.ecriture.filter(x=>x.unite===r.unite&&!x.plus);
    assert.ok(core.some(x=>r.lu.includes(x.lu)||x.lu.includes(r.lu)),
      id+' mission answer not introduced in core writing: '+r.lu);
  }
  console.log('ok : leçon '+id+' / '+d.unites.length+' unités / '+replies.length+' réponses de mission');
}
console.log('Lot 4 conforme : 5 leçons, '+total+' éléments de révision et de production.');
