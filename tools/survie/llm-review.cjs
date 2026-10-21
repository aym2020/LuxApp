'use strict';
/* LLM reviewer opt-in : ne committe jamais, aucune mutation des paramètres. */
const fs=require('node:fs'),path=require('node:path');
async function main(){
 const file=process.argv[2]||'survie-sim-report/summary.json',out=process.argv[3]||'survie-sim-report/llm-review.md';
 const data=JSON.parse(fs.readFileSync(file,'utf8'));
 fs.mkdirSync(path.dirname(out),{recursive:true});
 if(!process.env.OPENAI_API_KEY||!process.env.SURVIE_LLM_MODEL){
  fs.writeFileSync(out,'# Analyse LLM non activée\n\nLa simulation et son brief sont générés automatiquement. Pour une revue LLM automatique, configurer le secret GitHub OPENAI_API_KEY et la variable SURVIE_LLM_MODEL. Aucune clé n’est stockée dans le dépôt. Aucun paramètre n’a été modifié.\n');
  console.log('LLM reviewer skipped (credentials or model not configured)');return;
 }
 const concise={schema:data.schema,version:data.version,seed:data.seed,totalRuns:data.totalRuns,
  corpus:data.corpus,rulesHash:data.rulesHash,alerts:data.alerts,
  groups:data.groups.map(g=>({mode:g.mode,skill:g.skill,build:g.build,scenario:g.scenario,
   capRate:g.capRate,capCI95:g.capCI95,score:g.score,duration:g.duration,streak:g.streak,
   meanErrors:g.meanErrors,meanWords:g.meanWords,meanUpgrades:g.meanUpgrades}))};
 const instructions='Tu es un analyste game design, statisticien sceptique. Le document fourni est le résultat de bots SYNTHÉTIQUES, pas de joueurs réels. Lis les comparaisons appariées par compétence/build, cherche les déséquilibres et bugs possibles. Rends un court rapport Markdown français avec preuves, incertitudes, AU MAXIMUM 3 ajustements chiffrés et des tests de réfutation. N’écris jamais que le jeu réel est validé. Ne donne aucune instruction de push ni de mise en production.';
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),60000);
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:abort.signal,
   headers:{'Authorization':'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({model:process.env.SURVIE_LLM_MODEL,instructions,
    input:JSON.stringify(concise),max_output_tokens:1800,store:false})});
  if(!response.ok)throw Error('LLM API returned HTTP '+response.status);
  const result=await response.json();
  const text=result.output_text||(result.output||[]).flatMap(x=>(x.content||[])
   .filter(y=>y.type==='output_text').map(y=>y.text)).join('\n');
  if(!text)throw Error('No output text');fs.writeFileSync(out,'# Analyse LLM (suggestions non appliquées)\n\n'+text+'\n');
  console.log('LLM report written');
 }catch(e){fs.writeFileSync(out,'# LLM non disponible\n\nErreur de revue (pas de modification du jeu) : '+String(e.message).slice(0,250)+'\n');
  console.warn('LLM reviewer unavailable:',e.message);}
 finally{clearTimeout(timer);}
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={main};
