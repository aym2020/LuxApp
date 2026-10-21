'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const docs=['data/examens/A1.2/expression-01.json','data/examens/A1.2/expression-02.json'].map(p=>JSON.parse(read(p)));
const moduleText=read('public/expression-ecrite.js'),ex=read('public/examens.js'),html=read('public/index.html'),css=read('public/expression-ecrite-v21.css');
const normalize=s=>String(s).normalize('NFD').replace(/[‘’ʼ＇]/g,"'").replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.!?,;:]+/g,'').replace(/\s+/g,' ').trim();
const ctx=vm.createContext({normalize,console});vm.runInContext(moduleText,ctx);
test('deux sujets A1.2 de 70 mots, 13 et 12 phrases, traduction et explication',()=>{
 assert.deepEqual(docs.map(x=>x.format),['expression_ecrite','expression_ecrite']);
 assert.deepEqual(docs.map(x=>x.phrases.length),[13,12]);
 docs.forEach(d=>{assert.equal(d.niveau,'A1.2');assert.equal(d.phrases.map(p=>p.lu).join(' ').split(/\s+/).length,70);d.phrases.forEach((p,i)=>{assert.equal(p.id,i+1);assert.ok(p.fr&&p.lu&&p.note);});});
 assert.equal(docs[0].phrases[0].lu,'De leschte Weekend war ganz gutt.');
 assert.equal(docs[1].phrases[0].lu,"D'lescht Woch hunn ech vill geschafft.");
 assert.equal(docs[0].variante.changements[0].lu,'Meng lescht Vakanz war ganz gutt.');
 assert.equal(docs[0].variante.changements[1].lu,'Et war eng schéi Vakanz.');
});
test('score déterministe, accents tolérés, articles et mots protégés',()=>{
 ctx.p=docs[0].phrases[0];
 assert.equal(vm.runInContext("expressionReconnue('de leschte weekend war ganz gutt!',p)",ctx),true);
 assert.equal(vm.runInContext("expressionReconnue('De Weekend war ganz gutt.',p)",ctx),false);
 assert.equal(vm.runInContext("expressionReconnue('',p)",ctx),false);
 assert.equal(vm.runInContext("expressionReconnue('De leschte Weekend war net gutt.',p)",ctx),false);
 assert.equal(vm.runInContext("expressionScore([{ok:true},{ok:false},null])",ctx),1);
});
test('annales préservées : branchement uniquement pour nouveau format',()=>{
 assert.match(ex,/if \(expressionEstSujet\(ex\)\) return expressionTotal\(ex\)/);
 assert.match(ex,/if \(expressionEstSujet\(exam\)\) \{ expressionStart\(exam\); return; \}/);
 assert.match(ex,/if \(expressionEstSujet\(exam\)\) \{ expressionNext\(\); return; \}/);
 assert.match(moduleText,/saveExamScore\(exam.id,/);
 assert.match(moduleText,/showView\('view-examen-result'\)/);
});
test('écran séquentiel et bilan avec correction, traduction et CSS isolé',()=>{
 assert.match(moduleText,/Phrase suivante/);
 assert.match(moduleText,/Voir le score/);
 assert.match(moduleText,/expressionReveal/);
 assert.doesNotMatch(moduleText,/expressionToggleTraduction|Voir la traduction FR/);
 assert.match(moduleText,/erreursSeulement/);
 assert.match(html,/expression-ecrite.js\?v=1/);
 assert.match(css,/#view-examen \.xee-prompt/);
});

test('parcours réel : question vide, validation, correction, ordre, révélation, score sauvegardé',()=>{
 const nodes=Object.create(null);
 function node(id) {
  if(!nodes[id]) {
   const set=new Set(['hidden']);
   nodes[id]={textContent:'',innerHTML:'',value:'',disabled:false,
    classList:{add:x=>set.add(x),remove:x=>set.delete(x),contains:x=>set.has(x)},
    focus(){this.focused=true},blur(){this.focused=false}};
  }
  return nodes[id];
 }
 const views=[],saved=[];
 ctx.document={getElementById:node};
 ctx.showView=v=>views.push(v);
 ctx.examRemonter=()=>{};
 ctx.saveExamScore=(id,score,total)=>saved.push({id,score,total});
 ctx.examClasse=pct=>pct>=60?'ok':'ko';
 ctx.escHtml=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 ctx.exSujet=docs[0];
 vm.runInContext('expressionStart(exSujet)',ctx);
 assert.equal(views.at(-1),'view-examen');
 assert.equal(node('ex-next').textContent,'Valider');
 assert.match(node('ex-body').innerHTML,/Le week-end dernier était très bien/);
 // Impossible de marquer une phrase vide sans demander explicitement la solution.
 node('xee-input').value='';
 vm.runInContext('expressionNext()',ctx);
 assert.equal(node('xee-warning').classList.contains('hidden'),false);
 assert.equal(node('ex-next').textContent,'Valider');
 // Une bonne phrase : une seule validation comptée.
 node('xee-input').value=docs[0].phrases[0].lu;
 vm.runInContext('expressionNext()',ctx);
 assert.match(node('ex-body').innerHTML,/Juste !/);
 assert.equal(node('ex-next').textContent,'Phrase suivante');
 vm.runInContext('expressionNext()',ctx);
 assert.match(node('ex-body').innerHTML,/J&#39;ai dormi longtemps/);
 // Erreur : aucun point, puis on avance.
 node('xee-input').value='Ech sinn um Weekend';
 vm.runInContext('expressionNext()',ctx);
 assert.match(node('ex-body').innerHTML,/À retenir/);
 vm.runInContext('expressionNext()',ctx);
 // Suite : réponse révélée sur chacune des 9 dernières phrases.
 for(let index=2;index<docs[0].phrases.length;index++) {
  vm.runInContext('expressionReveal()',ctx);
  if(index===docs[0].phrases.length-1) assert.equal(node('ex-next').textContent,'Voir le score');
  vm.runInContext('expressionNext()',ctx);
 }
 assert.equal(views.at(-1),'view-examen-result');
 assert.deepEqual(saved[0],{id:'a12-expression-01-v2',score:1,total:13});
 assert.match(node('exr-body').innerHTML,/Le texte complet/);
 assert.match(node('exr-body').innerHTML,/Meng lescht Vakanz war ganz gutt/);
 assert.match(node('exr-body').innerHTML,/Et war eng schéi Vakanz/);
 // Second sujet : réussite complète => 10/10 et même clé de sauvegarde par id.
 ctx.exSujet=docs[1];vm.runInContext('expressionStart(exSujet)',ctx);
 for(let index=0;index<docs[1].phrases.length;index++){
  node('xee-input').value=docs[1].phrases[index].lu;
  vm.runInContext('expressionNext()',ctx);
  vm.runInContext('expressionNext()',ctx);
 }
 assert.deepEqual(saved[1],{id:'a12-expression-02-v2',score:12,total:12});
 assert.equal(views.at(-1),'view-examen-result');
});
