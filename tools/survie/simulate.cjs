'use strict';
/* SPEC 91 — modèle prospectif headless, distinct du moteur public SPEC 88. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const BASE={start:30,max:30,bonus:3,phases:[0,45,90,135],rates:[1,1.25,1.5,2],breaks:[5,10,15],malus:[3,4,5,6]};
const SKILLS={novice:[.75,3.6,.34],intermediate:[.9,2.65,.23],advanced:[.965,1.8,.16],perfect:[1,1.0,.10]};
const BUILDS={balanced:['secondWind','freeze','shield','letter','lastChance','double','skip'],
 defensive:['shield','lastChance','freeze','secondWind','letter','skip','double'],
 aggressive:['double','letter','secondWind','freeze','skip','shield','lastChance'],
 utility:['letter','skip','freeze','secondWind','shield','lastChance','double']};
const SCENARIOS={baseline:{},strongStorm:{rates:[1,1.35,1.7,2.3]},hardBreak:{malus:[3,5,7,9]},
 extraBonus:{bonus:4},noPowers:{noPowers:true}};
const CD={freeze:[5,5,4],letter:[5,4,3],skip:[6,5,4],shield:[6,5,4],double:[5,4,3]};
function hash(x){return crypto.createHash('sha256').update(String(x)).digest('hex');}
function prng(seed){let state=parseInt(hash(seed).slice(0,8),16);return ()=>{
 state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);
 t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function shuffle(a,seed){a=a.slice();const r=prng(seed);for(let i=a.length-1;i>0;i--){
 const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function vocab(){
 const words=[],luSeen=new Set(),frSeen=new Set(),excluded={};let raw=0;
 for(const level of ['A1.1','A1.2']){
  const dir=path.join(root,'data/lecons',level);
  for(const file of fs.readdirSync(dir).filter(x=>/^lecon-\d+\.json$/.test(x)).sort()){
   const lesson=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
   for(const c of lesson.flashcards||[]){
    raw++;let reason=null;
    if(!c||c.plus||typeof c.lu!=='string'||typeof c.fr!=='string')reason='excluded';
    else{
     const lu=c.lu.normalize('NFC').trim(),fr=c.fr.trim().replace(/[.!?]+$/,'').trim(),len=Array.from(lu).length;
     if(len<3||len>12)reason='length';
     else if(!/^\p{L}+$/u.test(lu))reason='not-word';
     else if(!/^[\p{L}]+(?:[ '-][\p{L}]+){0,2}$/u.test(fr))reason='ambiguous-fr';
     else if(lu.toLocaleLowerCase('lb')===fr.toLocaleLowerCase('fr'))reason='identical';
     else if(luSeen.has(lu.toLocaleLowerCase('lb'))||frSeen.has(fr.toLocaleLowerCase('fr')))reason='duplicate';
     else{luSeen.add(lu.toLocaleLowerCase('lb'));frSeen.add(fr.toLocaleLowerCase('fr'));
      words.push({id:level+'/'+lesson.id+'/'+c.id,lu,fr,length:len});}
    }
    if(reason)excluded[reason]=(excluded[reason]||0)+1;
   }
  }
 }
 const lengths={};for(const w of words)lengths[w.length]=(lengths[w.length]||0)+1;
 return {words,audit:{raw,eligible:words.length,excluded,lengths,corpusHash:hash(JSON.stringify(words))}};
}
function tier(t,p){for(let i=p.phases.length-1;i>=0;i--)if(t>=p.phases[i])return i;return 0;}
function drain(start,duration,p){let cost=0;
 while(duration>1e-7){let i=tier(start,p),next=p.phases[i+1]??Infinity,n=Math.min(duration,next-start);
  if(n<=0)throw Error('Invalid storm');cost+=n*p.rates[i];start+=n;duration-=n;}
 return cost;
}
function penalty(streak,p){let i=0;for(const s of p.breaks)if(streak>=s)i++;return p.malus[i];}
function mult(streak){return streak>=15?3:streak>=10?2:streak>=6?1.5:streak>=3?1.25:1;}
function limits(mode,n){return mode==='arena'?{max:180,draft:true}:n<4?{max:0,draft:false}:
 {max:n<20?45:n<50?90:180,draft:n>=20};}
function wordAt(pool,seed,step,last){
 const target=Math.min(12,4+Math.floor(step/3));let best=[],minimum=9999;
 for(const w of pool){if(pool.length>1&&w.id===last)continue;const d=Math.abs(w.length-target);
  if(d<minimum){best=[w];minimum=d;}else if(d===minimum)best.push(w);}
 return best[Math.floor(prng(seed+':word:'+step)()*best.length)]||pool[0];
}
function simulate({pool,mode='arena',skill='intermediate',build='balanced',scenario='baseline',seed='42',trial=0}){
 if(!pool?.length)throw Error('Empty pool');
 if(!SKILLS[skill]||!BUILDS[build]||!SCENARIOS[scenario])throw Error('Unknown cell');
 const p={...BASE,...SCENARIOS[scenario]},plan=limits(mode,pool.length),bot=SKILLS[skill];
 const r=prng(seed+':player:'+skill+':'+build+':'+trial),powers={},picked=new Set();
 if(!p.noPowers)for(const name of BUILDS[build].slice(0,2))powers[name]={level:1,cd:0};
 const v={time:0,score:0,words:0,errors:0,skips:0,streak:0,upgrades:0,revives:0,
  maxStreak:0,cap:false,death:'',uses:{},moves:0};
 let sec=p.start,elapsed=0,last='',revived=false,streak=0;
 function use(name){powers[name].cd=CD[name][powers[name].level-1];v.uses[name]=(v.uses[name]||0)+1;}
 function revive(){if(powers.lastChance&&!revived){revived=true;sec=[3,5,7][powers.lastChance.level-1];v.revives++;return true;}return false;}
 while(elapsed<plan.max&&v.moves<1200){
  const w=wordAt(pool,seed+':'+mode,v.moves,last);v.moves++;last=w.id;
  const elite=v.moves%13===0&&elapsed>=45,decoy=v.moves%8===0&&elapsed>=45;
  let freeze=0,assist=0,risk=1;
  if(powers.skip&&powers.skip.cd===0&&((elite&&sec<12)||sec<4)){
   use('skip');v.skips++;const dt=Math.min(.35,plan.max-elapsed);
   sec-=drain(elapsed,dt,p);elapsed+=dt;continue;
  }
  if(powers.freeze&&powers.freeze.cd===0&&(sec<12||(tier(elapsed,p)>=2&&sec<18))){
   use('freeze');freeze=[3,4,5][powers.freeze.level-1];
  }
  if(powers.letter&&powers.letter.cd===0&&(elite||w.length>=7)&&sec<24){
   use('letter');assist=[.12,.21,.24][powers.letter.level-1];
  }
  if(powers.double&&powers.double.cd===0&&streak>=5&&!elite){use('double');risk=[2,2.5,3][powers.double.level-1];}
  let speed=(bot[1]+Math.max(0,w.length-4)*bot[2]+(elite?.8:0)+(decoy?.45:0)-(assist?.5:0))*(.83+r()*.34);
  speed=Math.max(.42,speed);
  const dt=Math.min(speed,plan.max-elapsed);
  sec-=drain(elapsed+Math.min(dt,freeze),dt-Math.min(dt,freeze),p);elapsed+=dt;
  if(sec<=0&&!revive()){v.death='timeout';break;}
  if(elapsed>=plan.max){v.cap=true;v.death='real-cap';break;}
  const chance=Math.max(.03,Math.min(1,bot[0]-Math.max(0,w.length-5)*.017-(elite?.11:0)-(decoy?.075:0)+assist));
  if(r()<chance){
   streak++;v.words++;v.maxStreak=Math.max(v.maxStreak,streak);
   sec=Math.min(p.max,sec+p.bonus+(powers.secondWind?[.5,.75,1][powers.secondWind.level-1]:0));
   v.score+=Math.round(10*w.length*mult(streak)*risk*(elite?1.5:1));
   for(const x of Object.values(powers))if(x.cd>0)x.cd--;
   if(plan.draft&&streak>=4&&(streak===4||streak%4===0)&&!picked.has(streak)){
    picked.add(streak);
    const order=BUILDS[build],slots=Object.keys(powers);
    if(slots.length<3&&streak===4){const n=order.find(x=>!powers[x]);if(n){powers[n]={level:1,cd:0};v.upgrades++;}}
    else{const n=order.find(x=>powers[x]&&powers[x].level<3);
     if(n){powers[n].level++;v.upgrades++;}}
   }
  }else{
   v.errors++;let damage=penalty(streak,p)+(risk>1?5:0);
   if(powers.shield&&powers.shield.cd===0){powers.shield.cd=CD.shield[powers.shield.level-1];damage=0;}
   sec-=damage;streak=0;if(sec<=0&&!revive()){v.death='error';break;}
  }
 }
 v.time=+elapsed.toFixed(3);v.streak=streak;
 if(!v.death)v.death=elapsed>=plan.max?'real-cap':'guard';
 v.cap=v.death==='real-cap';return v;
}
function q(sorted,p){const n=(sorted.length-1)*p,i=Math.floor(n),j=Math.ceil(n);return +(sorted[i]+(sorted[j]-sorted[i])*(n-i)).toFixed(2);}
function wilson(success,n){const z=1.96,p=success/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,e=z*Math.sqrt((p*(1-p)+z*z/(4*n))/n)/d;
 return [+(c-e).toFixed(4),+(c+e).toFixed(4)];}
function stats(samples){
 const n=samples.length,cap=samples.filter(x=>x.cap).length;
 const pct=k=>{const a=samples.map(x=>x[k]).sort((a,b)=>a-b);return {p50:q(a,.5),p90:q(a,.9),p99:q(a,.99)};};
 const avg=k=>+(samples.reduce((acc,v)=>acc+v[k],0)/n).toFixed(3);
 const deaths={};for(const s of samples)deaths[s.death]=(deaths[s.death]||0)+1;
 return {n,capCount:cap,capRate:+(cap/n).toFixed(4),capCI95:wilson(cap,n),
  duration:pct('time'),score:pct('score'),streak:pct('maxStreak'),
  meanWords:avg('words'),meanErrors:avg('errors'),meanUpgrades:avg('upgrades'),deaths};
}
function campaign({seed='20261022',runs=1000,modes=['personal10','personal30','personal60','arena'],
 skills=Object.keys(SKILLS),builds=Object.keys(BUILDS),scenarios=Object.keys(SCENARIOS)}={}){
 if(!Number.isInteger(runs)||runs<1||runs>100000)throw Error('runs per cell must be 1..100000');
 const {words,audit}=vocab();if(words.length<4)throw Error('Vocabulary pool too small');
 const pools={arena:words,personal10:shuffle(words,seed+':10').slice(0,10),
  personal30:shuffle(words,seed+':30').slice(0,30),personal60:shuffle(words,seed+':60').slice(0,60)};
 const groups=[],alerts=[];
 for(const mode of modes)for(const skill of skills)for(const build of builds)for(const scenario of scenarios){
  if(!pools[mode])throw Error('Unknown mode '+mode);
  const cases=[];for(let i=0;i<runs;i++)cases.push(simulate({pool:pools[mode],mode:mode==='arena'?'arena':'personal',
   skill,build,scenario,seed,trial:i}));
  groups.push({mode,skill,build,scenario,...stats(cases)});
 }
 if(audit.eligible<200)alerts.push({code:'SMALL_ARENA_CORPUS',eligible:audit.eligible,target:200});
 for(const g of groups)if(g.mode==='arena'&&g.skill==='perfect'&&g.scenario==='baseline'&&g.capRate>.7)
  alerts.push({code:'CAP_TOO_EASY',build:g.build,rate:g.capRate});
 return {schema:'luxapp.survie.sim.v0',version:'0.1',seed,runsPerCell:runs,totalRuns:runs*groups.length,
  corpus:audit,rulesHash:hash(JSON.stringify({BASE,SKILLS,BUILDS,SCENARIOS})),groups,alerts,
  disclaimer:'Synthetic bots and prospective game rules; not human data or production gameplay.'};
}
function brief(x){
 let s='# Survie — rapport destiné aux LLM\n\n**SIMULATIONS SYNTHÉTIQUES, PAS DES JOUEURS RÉELS.**\n\n';
 s+='Seed '+x.seed+' ; '+x.totalRuns+' parties ; '+x.runsPerCell+' /cellule ; '+x.corpus.eligible+' mots ; corpus '+x.corpus.corpusHash+' ; règles '+x.rulesHash+'.\n\n';
 s+='## Alertes\n'+(x.alerts.length?x.alerts.map(a=>'- '+JSON.stringify(a)).join('\n'):'Aucune')+'\n\n';
 s+='| Niveau simulé | Build | Cap atteint | IC95 % | Score p50 | p90 | p99 | Durée p50 |\n|---|---|---:|---|---:|---:|---:|---:|\n';
 for(const c of x.groups.filter(g=>g.mode==='arena'&&g.scenario==='baseline'))
  s+='| '+c.skill+' | '+c.build+' | '+(c.capRate*100).toFixed(1)+'% | '+(c.capCI95[0]*100).toFixed(1)+'–'+(c.capCI95[1]*100).toFixed(1)+'% | '+c.score.p50+' | '+c.score.p90+' | '+c.score.p99+' | '+c.duration.p50+'s |\n';
 s+='\n## Mission LLM\nComparer à skill/build identiques les scénarios (voir summary.json). Identifier domination, mortalité, manque de vocabulaire et biais des bots. Proposer **au maximum 3** changements de paramètres avec prédictions falsifiables, tests A/B et risques. Ne jamais appliquer un patch ou publier un leaderboard à partir de ce rapport.\n';
 return s;
}
function main(argv){
 const d={};for(let i=0;i<argv.length;i++){let k=argv[i];if(!['--runs','--seed','--out'].includes(k)||!argv[i+1])throw Error('Unknown/missing arg '+k);d[k.slice(2)]=argv[++i];}
 const x=campaign({seed:d.seed||'20261022',runs:d.runs===undefined?1000:Number(d.runs)});
 const out=path.resolve(d.out||'survie-sim-report');fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(x,null,2)+'\n');
 fs.writeFileSync(path.join(out,'llm-brief.md'),brief(x));
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({seed:x.seed,totalRuns:x.totalRuns,corpusHash:x.corpus.corpusHash,rulesHash:x.rulesHash},null,2)+'\n');
 console.log(JSON.stringify({totalRuns:x.totalRuns,groups:x.groups.length,eligibleWords:x.corpus.eligible,alerts:x.alerts.length,out}));
}
if(require.main===module){try{main(process.argv.slice(2));}catch(e){console.error(e.stack||e);process.exitCode=1;}}
module.exports={BASE,SKILLS,BUILDS,SCENARIOS,vocab,prng,shuffle,tier,drain,penalty,mult,limits,simulate,stats,campaign,brief,wilson,main};
