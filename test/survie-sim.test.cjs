'use strict';
const test=require('node:test'),a=require('node:assert/strict'),sim=require('../tools/survie/simulate.cjs');
const words=Array.from({length:60},(_,i)=>({id:'w'+i,lu:'W'+i,fr:'Mot '+i,length:3+i%10}));
test('audit corpus réel : empreinte et sommes cohérentes',()=>{
 const c=sim.vocab();a.ok(c.audit.raw>=c.audit.eligible);a.ok(c.audit.eligible>=4);
 a.equal(c.words.length,c.audit.eligible);a.match(c.audit.corpusHash,/^[a-f0-9]{64}$/);
 a.equal(Object.values(c.audit.excluded).reduce((x,y)=>x+y,0)+c.audit.eligible,c.audit.raw);
});
test('tempête déterministe, malus et multiplicateurs',()=>{
 a.equal(sim.BASE.bonus,3);a.equal(sim.BASE.max,30);
 a.equal(sim.drain(0,10,sim.BASE),10);
 a.equal(sim.drain(40,10,sim.BASE),11.25);
 a.equal(sim.drain(135,10,sim.BASE),20);
 a.deepEqual([0,4,5,9,10,14,15].map(x=>sim.penalty(x,sim.BASE)),[3,3,4,4,5,5,6]);
 a.deepEqual([0,3,6,10,15].map(sim.mult),[1,1.25,1.5,2,3]);
});
test('mes mots 10/30/60 vs arène, limites non dépassées',()=>{
 a.equal(sim.limits('personal',10).max,45);a.equal(sim.limits('personal',30).max,90);
 a.equal(sim.limits('personal',60).max,180);a.equal(sim.limits('arena',10).max,180);
 a.equal(sim.limits('personal',3).max,0);
});
test('réexécutions reproductibles et changements de seed',()=>{
 const p={pool:words,mode:'arena',skill:'advanced',build:'balanced',scenario:'baseline',seed:'s',trial:42};
 const first=sim.simulate(p);a.deepEqual(sim.simulate(p),first);
 a.notDeepEqual(sim.simulate({...p,seed:'different'}),first);
 a.ok(first.time<=180&&first.moves<=1200&&first.maxStreak<=first.words);
});
test('profils parfaits et défensifs : partie finie, résurrection max 1',()=>{
 for(const skill of ['novice','intermediate','advanced','perfect'])
 for(const build of Object.keys(sim.BUILDS)){
  const x=sim.simulate({pool:words,mode:'arena',skill,build,scenario:'extraBonus',seed:'extreme'});
  a.ok(x.time<=180,'time cap');a.ok(x.moves<=1200,'turn cap');a.ok(x.revives<=1,'single resurrection');
  a.ok(['error','timeout','real-cap','guard'].includes(x.death));
 }
});
test('campagne multi-cellules, estimations ordonnées, alertes et prompt LLM',()=>{
 const opts={runs:3,seed:'fixture',modes:['personal10','arena'],skills:['novice','perfect'],
  builds:['balanced','defensive'],scenarios:['baseline','hardBreak']};
 const c=sim.campaign(opts),d=sim.campaign(opts);a.deepEqual(c,d);
 a.equal(c.groups.length,16);a.equal(c.totalRuns,48);
 for(const g of c.groups){
  a.equal(g.n,3);a.ok(g.capRate>=0&&g.capRate<=1);
  a.ok(g.capCI95[0]<=g.capCI95[1]);
  a.ok(g.score.p50<=g.score.p90&&g.score.p90<=g.score.p99);
 }
 a.match(sim.brief(c),/SIMULATIONS SYNTHÉTIQUES/);
 a.throws(()=>sim.campaign({runs:0}),/runs/);
});
