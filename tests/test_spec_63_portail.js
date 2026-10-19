// SPEC 63 — node tests/test_spec_63_portail.js
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const code=read('public/portail.js'),css=read('public/style.css'),html=read('public/index.html');
const store={}; const localStorage={
 getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k]}
};
const nodes={};
function node(id){return nodes[id] ||= {
 id,innerHTML:'',attrs:{},scrollTop:5,
 classList:{states:new Set(['hidden']),contains(k){return this.states.has(k)},
 add(k){this.states.add(k)},remove(k){this.states.delete(k)}},
 setAttribute(k,v){this.attrs[k]=v},
 querySelector(){return {focus(){}}}
};}
const body={classList:{states:new Set,contains(k){return this.states.has(k)},add(k){this.states.add(k)},remove(k){this.states.delete(k)}}};
const document={body,addEventListener(){},getElementById:node};
let cloud=true,signed=false,profile='anonymous',opened=0;
let snapshot=()=>null;
const ctx=new Function('document','window','localStorage','fbAuth','currentStorageProfile',
 'setStorageProfile','isCloudEnabled','aDejaPratique','getProgress','goDashboard',
 'programmerGarde',code+
 '\nreturn {portailInitialiser,portailAction,portailOuvrir,portailCompteConnecte,portailCompteDeconnecte,'+
 'portailVisible,portailAlerteOuverte,portailAfficherAlerte,portailFermerAlerte,portailContenu};')(
 document,{APP_CONFIG:{}},localStorage,{onAuthStateChanged(cb){snapshot=cb;}},
 profile,v=>{profile=v},()=>cloud,()=>false,()=>({}),()=>{opened++},()=>{});
ctx.portailInitialiser(null);
assert.ok(ctx.portailVisible());
assert.match(node('portail-auth').innerHTML,/WËLLKOMM/);
assert.match(node('portail-auth').innerHTML,/Continuer sans compte/);
ctx.portailAction('guest');
assert.ok(ctx.portailAlerteOuverte());
assert.ok(!store.luxPortailInviteV1);
ctx.portailAction('guest-back');
assert.ok(!ctx.portailAlerteOuverte());
ctx.portailAction('guest');ctx.portailAction('guest-confirm');
assert.equal(store.luxPortailInviteV1,undefined);assert.equal(opened,1);
assert.ok(!ctx.portailVisible());
ctx.portailInitialiser(null);
assert.ok(ctx.portailVisible(),'invité : écran Moien/Bonjour à chaque nouveau démarrage');
assert.match(node('portail-auth').innerHTML,/Moien !/);
ctx.portailCompteConnecte({uid:'xyz'});
assert.equal(store.luxPortailCompteConnuV1,'oui');assert.equal(store.luxPortailInviteV1,undefined);
ctx.portailCompteDeconnecte();
ctx.portailInitialiser(null);
assert.match(node('portail-auth').innerHTML,/Bon retour/);
assert.ok(!node('portail-auth').innerHTML.includes('pa-compte-icone'),'pas de décor de profil sur le formulaire');
ctx.portailOuvrir('signup');
assert.match(node('portail-auth').innerHTML,/Un compte pour/);
ctx.portailCompteConnecte({uid:'xyz'});
assert.ok(!ctx.portailVisible());
ctx.portailCompteDeconnecte();cloud=false;ctx.portailOuvrir('signin');
assert.match(node('portail-auth').innerHTML,/Connexion momentanément indisponible/);
assert.ok(!node('portail-auth').innerHTML.includes('id="pa-form"'));
assert.match(css,/\.pa-symbole\s*\{[^}]*place-items:center/);
assert.match(css,/\.pa-bouton\s*\{[^}]*justify-content:center/);
assert.match(css,/\.pa-bouton\s*\{[^}]*text-align:center/);
assert.match(css,/\.pa-symbole\s*\{[^}]*margin:0 auto/);
assert.match(css,/\.pa-bouton\s*\{[^}]*min-height:var\(--hauteur-bouton\)/);
assert.match(css,/\.pa-heading h1 em\s*\{[^}]*color:inherit/);
assert.match(css,/\.pa-bouton\.texte\s*\{[^}]*min-height:var\(--toucher\)/);
assert.match(css,/\.pa-reconnexion \.pa-heading/);
assert.ok(!css.includes('.pa-compte-icone {'),'profil décoratif supprimé');
assert.match(css,/background:var\(--couleur-fond\)/);
assert.ok(!code.includes("portailStocker(PORTAIL_INVITE,'oui')"),'ne plus persister une admission invité');
assert.match(html,/id="portail-auth"/);
assert.match(html,/src="portail.js"/);
assert.ok(!read('public/accueil.js').includes('html += invitationCompteHtml()'));
assert.ok(read('public/navigation.js').includes('portailFermerAlerte()'));
console.log('SPEC 63-64 : OK — bienvenue renouvelée pour invités, UI compacte, authentification et styles cohérents.');
