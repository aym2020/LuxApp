'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const docs=['data/examens/A1.2/expression-01.json','data/examens/A1.2/expression-02.json'].map(p=>JSON.parse(read(p)));
const moduleText=read('public/expression-ecrite.js'),ex=read('public/examens.js'),html=read('public/index.html'),css=read('public/expression-ecrite-v21.css');
const normalize=s=>String(s).normalize('NFD').replace(/[‘’ʼ＇]/g,"'").replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.!?,;:]+/g,'').replace(/\s+/g,' ').trim();
const ctx=vm.createContext({normalize,console});vm.runInContext(moduleText,ctx);
test('deux sujets A1.2 de 70 mots, 11 et 10 phrases, traduction et explication',()=>{
 assert.deepEqual(docs.map(x=>x.format),['expression_ecrite','expression_ecrite']);
 assert.deepEqual(docs.map(x=>x.phrases.length),[11,10]);
 docs.forEach(d=>{assert.equal(d.niveau,'A1.2');assert.equal(d.phrases.map(p=>p.lu).join(' ').split(/\s+/).length,70);d.phrases.forEach((p,i)=>{assert.equal(p.id,i+1);assert.ok(p.fr&&p.lu&&p.note);});});
 assert.equal(docs[0].phrases[0].lu,'De leschte Weekend war ganz schéin.');
 assert.equal(docs[1].phrases[0].lu,"D'lescht Woch hunn ech vill geschafft.");
 assert.equal(docs[0].variante.lu,'Meng lescht Vakanz war ganz schéin.');
});
test('score déterministe, accents tolérés, articles et mots protégés',()=>{
 ctx.p=docs[0].phrases[0];
 assert.equal(vm.runInContext("expressionReconnue('de leschte weekend war ganz schein!',p)",ctx),true);
 assert.equal(vm.runInContext("expressionReconnue('De Weekend war ganz schéin.',p)",ctx),false);
 assert.equal(vm.runInContext("expressionReconnue('',p)",ctx),false);
 assert.equal(vm.runInContext("expressionReconnue('De leschte Weekend war net schéin.',p)",ctx),false);
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
 assert.match(moduleText,/expressionToggleTraduction/);
 assert.match(moduleText,/erreursSeulement/);
 assert.match(html,/expression-ecrite.js\?v=1/);
 assert.match(css,/#view-examen \.xee-prompt/);
});
