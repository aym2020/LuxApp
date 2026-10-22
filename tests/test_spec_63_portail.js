// SPEC 63 — node tests/test_spec_63_portail.js
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const code=read('public/portail.js'),css=read('public/style.css'),html=read('public/index.html');
const store={}; const localStorage={
 getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k]}
};
const nodes={};
function node(id){return nodes[id] ||= {
 id,innerHTML:'',attrs:{},scrollTop:5,value:'',
 classList:{states:new Set(['hidden']),contains(k){return this.states.has(k)},
 add(k){this.states.add(k)},remove(k){this.states.delete(k)}},
 setAttribute(k,v){this.attrs[k]=v},
 querySelector(){return {focus(){},classList:{add(){}}}}
};}
let popup=null, ouverturesPopup=0, focusRetour=0;
const body={classList:{states:new Set,contains(k){return this.states.has(k)},add(k){this.states.add(k)},remove(k){this.states.delete(k)}},
  appendChild(el){popup=el; ouverturesPopup++;el.isConnected=true;}};
const document={body,addEventListener(){},getElementById:node,
  querySelector(sel){return sel==='#view-dashboard .carte-suite'?
    {isConnected:true,focus(){focusRetour++;}}:null;},
  createElement(tag){
    assert.equal(tag,'div');
    const button={events:{},focused:false,addEventListener(type,fn){this.events[type]=fn;},
      focus(){this.focused=true;}};
    return {innerHTML:'',className:'',id:'',isConnected:false,events:{},
      querySelector(sel){return sel==='.pi-compris'?button:null;},
      addEventListener(type,fn){this.events[type]=fn;},
      remove(){this.isConnected=false;popup=null;},
      get button(){return button;}
    };
  }
};
let cloud=true,signed=false,profile='anonymous',opened=0,notes=[];
let snapshot=()=>null;
const escHtml=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const ctx=new Function('document','window','localStorage','fbAuth','currentStorageProfile',
 'setStorageProfile','isCloudEnabled','aDejaPratique','getProgress','goDashboard',
 'programmerGarde','notifier','arreterAudio','escHtml','animationsReduites',code+
 '\nreturn {portailInitialiser,portailAction,portailOuvrir,portailCompteConnecte,portailCompteDeconnecte,'+
 'portailVisible,portailFormulaireOuvert,portailRetourBienvenue,ouvrirCompteDepuisAccueil,portailContenu,portailBasculerMotDePasse,'+
 'afficherInfoInvite,fermerInfoInvite,infoInviteEstOuverte,get mode(){return portailMode}};')(
 document,{APP_CONFIG:{}},localStorage,{onAuthStateChanged(cb){snapshot=cb;}},
 profile,v=>{profile=v},()=>cloud,()=>false,()=>({}),()=>{opened++},()=>{},t=>notes.push(t),()=>{},escHtml,()=>true);
ctx.portailInitialiser(null);
assert.ok(ctx.portailVisible());
const accueil=node('portail-auth').innerHTML;
// SPEC 66 : bienvenue centrée, carte Moien!/Bonjour !, audio sur demande, 3 actions sans doublon.
assert.match(accueil,/Le luxembourgeois, à ta portée\./);
assert.match(accueil,/Quelques minutes par jour/);
assert.match(accueil,/class="pa-carte"[^>]*aria-pressed="false"/);
assert.match(accueil,/Moien!/);assert.match(accueil,/Bonjour !/);assert.match(accueil,/Appuie pour découvrir/);
assert.match(accueil,/portailEcouter\(this\)/);
assert.match(accueil,/Révisions intelligentes/);
assert.match(accueil,/Commencer à apprendre/);
assert.match(accueil,/J’ai déjà un compte/);
assert.ok(!accueil.includes('Continuer sans compte'),'fusionné avec « Commencer à apprendre »');
assert.ok(!/test A1/.test(accueil));
assert.ok(!ctx.portailFormulaireOuvert());
// Invité : une seule fenêtre informative, aucun toast trompeur, progression intacte.
ctx.portailAction('guest');
assert.ok(!ctx.portailVisible());assert.equal(opened,1);
assert.deepEqual(notes,[],'ancien toast supprimé');
assert.ok(ctx.infoInviteEstOuverte(),'popup ouvert après le choix invité');
assert.ok(body.classList.contains('pi-bloque'),'pas de scroll derrière la popup');
assert.equal(store.luxInfoInviteVueV2,undefined,'ne pas marquer comprise avant validation');
assert.match(popup.innerHTML,/C’est parti !/);
assert.match(popup.innerHTML,/Apprends sans compte, à ton rythme/);
assert.match(popup.innerHTML,/Progrès enregistrés sur cet appareil/);
assert.match(popup.innerHTML,/Ils peuvent être perdus si les données sont effacées/);
assert.match(popup.innerHTML,/Connecte-toi pour les sauvegarder en ligne/);
assert.match(popup.innerHTML,/class="pi-hero"/,'téléphone animé centré');
assert.match(popup.innerHTML,/class="pi-coche"/,'coche visible');
assert.ok(!popup.innerHTML.includes('<header'),'éviter le conflit avec la règle header globale');
assert.ok(!popup.innerHTML.includes('Mode invité'),'titre remplacé');
assert.match(popup.innerHTML,/role="dialog" aria-modal="true"/);
assert.equal((popup.innerHTML.match(/<button\b/g)||[]).length,1,'un seul bouton');
assert.match(popup.innerHTML,/Compris/);
assert.equal(popup.button.focused,true,'focus sur Compris');
const premierePopup=popup;
premierePopup.button.events.click();
assert.ok(!ctx.infoInviteEstOuverte(),'Compris ferme la fenêtre');
assert.equal(store.luxInfoInviteVueV2,'oui','confirmation mémorisée');
assert.ok(!body.classList.contains('pi-bloque'),'scroll rétabli');
assert.ok(focusRetour>0,'retour du focus à l’accueil');
assert.equal(ctx.afficherInfoInvite(),false,'aucune réouverture après Compris');
assert.equal(ouverturesPopup,1,'une seule apparition');
assert.equal(store.luxPortailInviteV1,undefined);
// Retour Android et Escape ferment aussi la fenêtre sans bloquer la navigation.
delete store.luxInfoInviteVueV2;
assert.ok(ctx.afficherInfoInvite());
const secondePopup=popup;
let escapeIntercepte=false;
secondePopup.events.keydown({key:'Escape',preventDefault(){escapeIntercepte=true;}});
assert.ok(escapeIntercepte);
assert.ok(!ctx.infoInviteEstOuverte());
assert.equal(store.luxInfoInviteVueV2,'oui');
ctx.portailInitialiser(null);
assert.ok(ctx.portailVisible(),'invité : écran de bienvenue à chaque nouveau démarrage');
// Formulaire : Retour ramène à la bienvenue.
ctx.portailAction('signup');
assert.ok(ctx.portailFormulaireOuvert());
assert.match(node('portail-auth').innerHTML,/id="pa-password" type="password" autocomplete="new-password"/);
assert.match(node('portail-auth').innerHTML,/aria-label="Afficher le mot de passe" aria-pressed="false"/);
assert.match(node('portail-auth').innerHTML,/onpointerdown="event.preventDefault\(\)"/);
const boutonOeil={attrs:{},setAttribute(k,v){this.attrs[k]=v}};
const champOeil=node('pa-password');
champOeil.type='password'; champOeil.value='TestSecret42!';
ctx.portailBasculerMotDePasse(boutonOeil);
assert.equal(champOeil.type,'text','œil : montrer le mot de passe');
assert.equal(champOeil.value,'TestSecret42!','valeur de saisie inchangée');
assert.equal(boutonOeil.attrs['aria-pressed'],'true');
assert.equal(boutonOeil.attrs['aria-label'],'Masquer le mot de passe');
ctx.portailBasculerMotDePasse(boutonOeil);
assert.equal(champOeil.type,'password','œil : remasquer le mot de passe');
assert.equal(champOeil.value,'TestSecret42!');
assert.equal(boutonOeil.attrs['aria-pressed'],'false');
assert.equal(boutonOeil.attrs['aria-label'],'Afficher le mot de passe');
assert.match(node('portail-auth').innerHTML,/pa-retour/);
assert.match(node('portail-auth').innerHTML,/pa-erreur-email/);
assert.match(node('portail-auth').innerHTML,/pa-entre-avant|Un compte pour/);
ctx.portailRetourBienvenue();
assert.equal(ctx.mode,'welcome');
// SPEC 67 : depuis l'accueil invité, Retour ferme le portail (retour à l'accueil).
ctx.ouvrirCompteDepuisAccueil('signin');
assert.ok(ctx.portailFormulaireOuvert());
assert.ok(!node('portail-auth').innerHTML.includes('Continuer sans compte'),'déjà invité : pas de « Continuer sans compte »');
ctx.portailAction('signup');
assert.ok(!node('portail-auth').innerHTML.includes('Continuer sans compte'));
ctx.portailRetourBienvenue();
assert.ok(!ctx.portailVisible(),'Retour depuis l’accueil : portail fermé');
ctx.portailOuvrir('signin');
assert.match(node('portail-auth').innerHTML,/Continuer sans compte/,'origine remise à zéro après fermeture');
assert.match(node('portail-auth').innerHTML,/id="pa-password" type="password" autocomplete="current-password"/);
assert.match(node('portail-auth').innerHTML,/class="pa-mdp-oeil"/);
ctx.portailInitialiser(null);
ctx.portailCompteConnecte({uid:'xyz'});
assert.equal(store.luxPortailCompteConnuV1,'oui');assert.equal(store.luxPortailInviteV1,undefined);
ctx.portailCompteDeconnecte();
ctx.portailInitialiser(null);
assert.match(node('portail-auth').innerHTML,/Bon retour/);
assert.match(node('portail-auth').innerHTML,/S’inscrire/);
ctx.portailOuvrir('signup');
assert.match(node('portail-auth').innerHTML,/Un compte pour/);
ctx.portailCompteConnecte({uid:'xyz'});
assert.ok(!ctx.portailVisible());
ctx.portailCompteDeconnecte();cloud=false;ctx.portailOuvrir('signin');
assert.match(node('portail-auth').innerHTML,/Connexion momentanément indisponible/);
assert.ok(!node('portail-auth').innerHTML.includes('id="pa-form"'));
ctx.portailOuvrir('welcome');
assert.ok(!node('portail-auth').innerHTML.includes('J’ai déjà un compte'),'sans cloud : seulement Commencer');
assert.match(css,/#pa-form \.pa-mdp-oeil\s*\{[^}]*width:var\(--toucher\)/);
assert.match(css,/#pa-form \.pa-mdp input:not\(\[type=checkbox\]\)\s*\{[^}]*padding-right:calc/);
assert.match(css,/\.pa-bouton\s*\{[^}]*justify-content:center/);
assert.match(css,/\.pa-bouton\s*\{[^}]*text-align:center/);
assert.match(css,/\.pa-bouton\s*\{[^}]*min-height:60px/,'SPEC 65 : même hauteur que les accès de l’accueil');
assert.match(css,/\.pa-bouton\s*\{[^}]*border-radius:16px/);
assert.match(css,/\.dlg\s*\{[^}]*align-items:center/,'SPEC 66 : dialogue centré');
assert.match(css,/\.dlg-carte\s*\{[^}]*border-radius:24px/);
assert.match(css,/backdrop-filter:blur/);
assert.match(css,/\.pa-carte\.retournee \.pa-carte-in\s*\{[^}]*rotateY\(180deg\)/);
assert.match(css,/prefers-reduced-motion: reduce\)\s*\{[^}]*\.view\.entre-avant/);
assert.ok(!css.includes('.pa-poignee'));
assert.match(css,/\.pa-heading h1 em\s*\{[^}]*color:inherit/);
assert.match(css,/\.pa-bouton\.texte\s*\{[^}]*min-height:var\(--toucher\)/);
assert.match(css,/\.pa-reconnexion \.pa-heading/);
assert.ok(!css.includes('.pa-compte-icone {'),'profil décoratif supprimé');
assert.match(css,/background:var\(--couleur-fond\)/);
assert.ok(!code.includes("portailStocker(PORTAIL_INVITE,'oui')"),'ne plus persister une admission invité');
assert.match(html,/id="portail-auth"/);
assert.match(html,/src="portail.js\?v=pa-oeil-1"/);
assert.ok(!read('public/accueil.js').includes('html += invitationCompteHtml()'));
assert.ok(read('public/accueil.js').includes('ligneCompteHtml()'),'SPEC 67 : ligne de compte sous les niveaux');
assert.ok(read('public/navigation.js').includes('portailRetourBienvenue()'));
assert.ok(read('public/navigation.js').includes('fermerDialogue(false)'));
assert.match(html,/src="dialogue.js"/);
for (const f of ['app.js','examens.js','revision.js']) assert.ok(!/\b(confirm|alert)\(/.test(read('public/'+f)), f+' : plus de fenêtre native');
assert.ok(fs.statSync(path.join(__dirname,'..','public/audio/moien.mp3')).size > 5000,'audio Moien présent');
assert.match(read('public/navigation.js'),/infoInviteEstOuverte\(\)/,'garde pour Retour Android');
assert.match(read('public/navigation.js'),/fermerInfoInvite\(\)/,'fermeture par Retour Android');
assert.match(css,/\.pi-carte\s*\{[^}]*border-radius:24px/s);
assert.match(css,/\.pi-compris\s*\{[^}]*min-height:54px/s);
assert.match(css,/@keyframes pi-apparition/,'apparition animée');
assert.match(css,/@keyframes pi-coche/,'coche animée');
assert.match(css,/@keyframes pi-halo/,'halo temporaire');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'animation réduite accessible');
assert.match(css,/\.pi-carte\s*\{[^}]*text-align:center/s,'carte centrée');
assert.match(css,/\.pi-carte h2\s*\{/,'titre stylé sans header global');
assert.ok(!css.includes('.pi-entete'),'ancienne mise en page verticale supprimée');
console.log('SPEC 63-66 + 76 : OK — bienvenue invitée animée, perte locale, bouton unique, retour Android.');
