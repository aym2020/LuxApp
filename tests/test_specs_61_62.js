// SPEC 61 / SPEC 62 : node tests/test_specs_61_62.js
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function extract(s,name){let i=s.indexOf('function '+name+'(');if(i<0)throw Error(name);
 if(s.slice(i-6,i)==='async ')i-=6;const j=s.indexOf('\n}\n',i);
 if(j<0)throw Error('end '+name);return s.slice(i,j+3);}
(async function(){
const p=src('public/parcours.js'),a=src('public/accueil.js'),app=src('public/app.js');
const tiles=new Function('mc','mcCasesLettres','melanger',
 extract(p,'mcSansAccent')+extract(p,'mcLettreTuile')+extract(p,'mcLettreDansCase')+
 "const LETTRES_INTRUSES='aeinrstuldghm';"+extract(p,'nouvellesTuiles')+
 'return {mcLettreTuile,mcLettreDansCase,nouvellesTuiles};')(
 {cases:'Äddi'.split('').map(ch=>({ch,etat:''}))},()=>({libres:[0,1,2,3]}),x=>x);
assert.equal(tiles.mcLettreTuile('Ä'),'a');assert.equal(tiles.mcLettreTuile('É'),'e');
assert.equal(tiles.mcLettreDansCase('m','M'),'M');
assert.equal(tiles.mcLettreDansCase('k','M'),'K');
assert.equal(tiles.mcLettreDansCase('a','Ä'),'A');
assert.equal(tiles.mcLettreDansCase('e','ë'),'e');
assert.ok(tiles.nouvellesTuiles().every(x=>x.ch===x.ch.toLowerCase()));
assert.ok(p.includes('texte = mcLettreDansCase(parCase[i], c.ch)'));
const guest={progress:{levels:{20:{quiz:{1:3}}}}};
const existing={progress:{levels:{21:{quiz:{2:2}}}}};
let profile='anonymous',imported=[],synced=0,success=true,optin=false;
const inputs={'auth-email':{value:'test@example.com'},'auth-pass':{value:'secret123'},
 'auth-msg':{textContent:''},'auth-import-local':{get checked(){return optin}}};
const auth=new Function('document','getProgressPayload','getCurrentUser','setStorageProfile',
 'mergeLocalAndCloudProgress','applyProgressPayload','syncProgress','updateAuthUI',
 'renderDashboard','renderLessonsProgress','signUp','signIn','currentStorageProfile',
 'friendlyAuthError',extract(app,'handleAuth')+'return handleAuth;')(
 {getElementById:k=>inputs[k]||null},
 ()=>profile==='anonymous'?guest:existing,async()=>({uid:'u'}),v=>profile=v,
 (x,y)=>({joined:[x,y]}),v=>imported.push(v),async()=>{synced++},
 async()=>{},()=>{},()=>{},
 async()=>success?{error:null}:{error:{code:'auth/invalid-credential'}},
 async()=>success?{error:null}:{error:{code:'auth/invalid-credential'}},
 'anonymous',()=> 'Identifiants incorrects');
await auth('signup');assert.equal(profile,'user:u');assert.equal(imported.length,1);
assert.equal(imported[0].joined[1],guest);
profile='anonymous';imported=[];optin=false;
await auth('signin');assert.equal(imported.length,0);
profile='anonymous';imported=[];optin=true;
await auth('signin');assert.equal(imported.length,1);
profile='anonymous';imported=[];success=false;
await auth('signin');assert.equal(profile,'anonymous');assert.equal(imported.length,0);
assert.equal(synced,3);
const form={innerHTML:'',classList:{remove(){}}};
const show=new Function('document','aDejaPratique','getProgress',
 extract(app,'showAuthForm')+'return showAuthForm;')(
 {getElementById:()=>form},()=>true,()=>({}));
show('signin');assert.match(form.innerHTML,/type="checkbox"/);
assert.ok(!form.innerHTML.includes(' checked'));
show('signup');assert.ok(!form.innerHTML.includes('type="checkbox"'));
console.log('SPEC 61-62 : OK — tuiles, case, compte, fusion et consentement.');
})().catch(e=>{console.error(e);process.exitCode=1;});
