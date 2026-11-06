/* Watfir 2.2 — portail d'entrée, affiche rétro.
 * node --test test/watfir-portail.test.cjs */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'public/portail.js'),'utf8');
const css=fs.readFileSync(path.join(root,'public/portail-watfir.css'),'utf8');
const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');

function setup(cloud=true) {
  const calls={timers:[],guards:0,dashboard:0,info:0,close:0,pressListeners:[],audio:0};
  const classes=new Set(['hidden']);
  const portal={
    innerHTML:'', scrollTop:0, isConnected:true,
    classList:{
      add(k){classes.add(k)},remove(k){classes.delete(k)},
      contains(k){return classes.has(k)}
    },
    setAttribute(){},
    querySelector(){return null},
    addEventListener(name,fn,capture){
      if(name==='click' && capture===true)calls.pressListeners.push(fn);
    }
  };
  const storage=new Map();
  const doc={
    getElementById(id){return id==='portail-auth'?portal:null},
    body:{
      classList:{add(){},remove(){}},
      contains(){return true}
    }
  };
  const ctx={
    document:doc,
    window:{
      APP_CONFIG:{RECETTE:false,TESTS:false},
      matchMedia(){return {matches:calls.reduceMotion||false}},
      setTimeout(fn,ms){calls.timers.push({fn,ms})}
    },
    localStorage:{
      getItem(k){return storage.has(k)?storage.get(k):null},
      setItem(k,v){storage.set(k,v)},
      removeItem(k){storage.delete(k)}
    },
    isCloudEnabled(){return cloud},
    getProgress(){return {}},
    aDejaPratique(){return false},
    fbAuth:null,
    currentStorageProfile:'anonymous',
    escHtml(s){return String(s)},
    arreterAudio(){calls.audio++},
    programmerGarde(){calls.guards++},
    goDashboard(){calls.dashboard++},
    afficherInfoInvite(){calls.info++}
  };
  vm.runInNewContext(source,ctx,{filename:'portail.js'});
  return {ctx,calls,portal,storage};
}

test('Affiche de bienvenue : un grand Watfir, deux rubans, aucune promesse ni gimmick Moien',()=>{
  const {ctx}=setup();
  const out=ctx.portailContenu('welcome');
  assert.match(out,/pa-bienvenue wf-portail-bienvenue/);
  assert.match(out,/<h1 class="wf-portail-wordmark">Watfir<\/h1>/);
  assert.match(out,/wf-portail-ruban-rouge/);
  assert.match(out,/wf-portail-ruban-cyan/);
  assert.match(out,/lang="lb">Lëtzebuergesch/);
  for(const old of [
    'TA PREMIÈRE EXPRESSION','Moien!','Écouter la prononciation',
    'Leçons courtes','Révisions intelligentes','Examens blancs',
    'LE LUXEMBOURGEOIS, AUTREMENT','Le luxembourgeois, à ta portée.',
    'Quelques minutes par jour'
  ]) assert.ok(!out.includes(old),'ancien slogan/gimmick retiré : '+old);
  assert.doesNotMatch(out,/pa-carte|pa-atouts|bouton-ecouter/);
});

test('CTA de bienvenue : trois destinations métier et mêmes fonctions 2.1',()=>{
  const {ctx}=setup();
  const out=ctx.portailContenu('welcome');
  assert.match(out,/>Commencer<\/strong>/);
  assert.match(out,/wf-portail-demarrer/);
  assert.match(out,/wf-portail-creer/);
  assert.match(out,/wf-portail-connexion/);
  assert.match(out,/portailAction\(&quot;guest&quot;\)/);
  assert.match(out,/portailAction\(&quot;signup&quot;\)/);
  assert.match(out,/portailAction\(&quot;signin&quot;\)/);
  assert.match(out,/wf-portail-chevron/);
  assert.ok(out.indexOf('wf-portail-demarrer')<out.indexOf('wf-portail-creer'));
  assert.ok(out.indexOf('wf-portail-creer')<out.indexOf('wf-portail-connexion'));
});

test('Connexion indisponible : continuer sans compte reste possible, sans bouton compte invalide',()=>{
  const {ctx}=setup(false);
  const out=ctx.portailContenu('welcome');
  assert.match(out,/Connexion momentanément indisponible/);
  assert.match(out,/portailAction\(&quot;guest&quot;\)/);
  assert.doesNotMatch(out,/portailAction\(&quot;signup&quot;\)/);
  assert.doesNotMatch(out,/portailAction\(&quot;signin&quot;\)/);
});

test('Formulaires existants préservés : email, mot de passe, reset, création',()=>{
  const {ctx}=setup();
  const signup=ctx.portailContenu('signup');
  const signin=ctx.portailContenu('signin');
  assert.match(signup,/id="pa-email"/);
  assert.match(signup,/id="pa-password"/);
  assert.match(signup,/id="pa-envoyer"/);
  assert.match(signup,/Créer mon compte/);
  assert.doesNotMatch(signup,/wf-portail-affiche/);
  assert.match(signin,/id="pa-email"/);
  assert.match(signin,/id="pa-password"/);
  assert.match(signin,/Mot de passe oublié/);
  assert.match(signin,/Me connecter/);
  assert.doesNotMatch(signin,/wf-portail-affiche/);
});

test('Entrée invité : même navigation et aucune modification des clés de progression',()=>{
  const {ctx,calls,storage}=setup();
  // SPEC 76 : la fenêtre d'information a déjà été vue sur cet appareil.
  // La route guest doit fonctionner sans remonter cette fenêtre.
  storage.set('luxInfoInviteVueV2','oui');
  ctx.portailOuvrir('welcome');
  ctx.portailAction('guest');
  assert.equal(calls.dashboard,1);
  assert.ok(calls.audio>=1,'la fermeture arrête un éventuel son précédent');
  assert.match(source,/afficherInfoInvite\(\);/,"l'information invité est toujours prévue");
  assert.equal(storage.get('luxPortailCompteConnuV1'),undefined);
  assert.equal(storage.has('luxPortailInviteV1'),false);
});

test('Bouton 3D : appui visible 160ms avant clic, replay et double clic protégés',()=>{
  const {ctx,calls}=setup();
  ctx.portailOuvrir('welcome');
  assert.equal(calls.pressListeners.length,1);
  ctx.portailOuvrir('welcome');
  assert.equal(calls.pressListeners.length,1,'écouteur installé une seule fois');
  const cl=new Set();
  let clicked=0,prevented=0,stopped=0;
  const button={
    disabled:false,isConnected:true,
    getAttribute(){return null},
    classList:{add(k){cl.add(k)},remove(k){cl.delete(k)}},
    click(){clicked++}
  };
  const e={
    isTrusted:true,
    target:{closest(selector){return selector.includes('wf-portail-demarrer')?button:null}},
    preventDefault(){prevented++},
    stopPropagation(){stopped++}
  };
  calls.pressListeners[0](e);
  calls.pressListeners[0](e);
  assert.equal(prevented,2);
  assert.equal(stopped,2);
  assert.equal(clicked,0);
  assert.equal(calls.timers.length,1,'un seul délai pour le double clic');
  assert.equal(calls.timers[0].ms,160);
  assert.ok(cl.has('wf-pressing'));
  calls.timers[0].fn();
  assert.equal(clicked,1,'le vrai onclick reste exécuté par button.click()');
  assert.equal(cl.has('wf-pressing'),false);
});

test('Créer un compte : même enfoncement 3D et clic original rejoué après 160 ms',()=>{
  const {ctx,calls}=setup();
  ctx.portailOuvrir('welcome');
  const classes=new Set();
  let opened=0;
  const button={
    disabled:false,isConnected:true,getAttribute(){return null},
    classList:{add(k){classes.add(k)},remove(k){classes.delete(k)}},
    click(){opened++;ctx.portailAction('signup')}
  };
  let prevented=0;
  const event={
    isTrusted:true,
    target:{closest(selector){return selector.includes('.wf-portail-creer')?button:null}},
    preventDefault(){prevented++},stopPropagation(){}
  };
  calls.pressListeners[0](event);
  assert.equal(prevented,1);
  assert.ok(classes.has('wf-pressing'));
  assert.equal(opened,0);
  assert.equal(calls.timers.length,1);
  assert.equal(calls.timers[0].ms,160);
  calls.timers[0].fn();
  assert.equal(opened,1,'l’inscription s’ouvre après le relief, une seule fois');
  assert.equal(classes.has('wf-pressing'),false);
});

test('Deux boutons 3D même géométrie : crème uni, sombre bord crème',()=>{
  const cream=css.match(/#portail-auth \.wf-portail-bienvenue \.pa-bouton\.or\.wf-portail-demarrer \{([^}]+)\}/);
  const dark=css.match(/#portail-auth \.wf-portail-bienvenue \.pa-bouton\.sombre\.wf-portail-creer \{([^}]+)\}/);
  assert.ok(cream&&dark);
  for (const rule of [cream[1],dark[1]]) {
    assert.match(rule,/min-height:70px/);
    assert.match(rule,/border-radius:17px/);
    assert.match(rule,/0 6px 0 /,'même tranche 3D 6px');
    assert.match(rule,/transform:translateY\(0\)/);
  }
  assert.match(cream[1],/background:var\(--wf-p-cta-face\)/);
  assert.doesNotMatch(cream[1],/linear-gradient|--wf-p-red|--wf-p-cyan/,'aucune bande rouge ou cyan sur Commencer');
  assert.match(dark[1],/border:1px solid #c3b08b/);
  assert.match(dark[1],/background:#11100e/);
  assert.match(css,/\.wf-portail-creer\.wf-pressing \{[^}]*transform:translateY\(5px\)/);
  assert.match(css,/\.wf-portail-demarrer\.wf-pressing \{[^}]*transform:translateY\(5px\)/);
  assert.match(css,/\.wf-portail-ruban-rouge \{ stroke:var\(--wf-p-red\)/);
  assert.match(css,/\.wf-portail-ruban-cyan \{ stroke:var\(--wf-p-cyan\)/);
});

test('Appui : mouvement réduit, disabled et synthétique ne bloquent pas le clic',()=>{
  const {ctx,calls}=setup();
  ctx.portailOuvrir('welcome');
  const button={disabled:false,isConnected:true,getAttribute(){return null},classList:{add(){},remove(){}}};
  let n=0;
  const e={isTrusted:true,target:{closest(){return button}},preventDefault(){n++},stopPropagation(){}};
  calls.reduceMotion=true;
  calls.pressListeners[0](e);
  calls.reduceMotion=false;
  e.isTrusted=false;
  calls.pressListeners[0](e);
  e.isTrusted=true;
  button.disabled=true;
  calls.pressListeners[0](e);
  assert.equal(n,0);
  assert.equal(calls.timers.length,0);
});

test('CSS isolé : aucune transformation des formulaires d’authentification',()=>{
  assert.match(css,/#portail-auth \.pa-page\.wf-portail-bienvenue/);
  assert.match(css,/\.wf-portail-bienvenue \.wf-portail-affiche/);
  assert.match(css,/\.wf-portail-bienvenue \.pa-bouton\.or\.wf-portail-demarrer/);
  assert.match(css,/\.wf-portail-bienvenue \.pa-bouton\.or\.wf-portail-demarrer\.wf-pressing/);
  assert.match(css,/\.wf-portail-bienvenue \.pa-bouton:focus-visible/);
  assert.match(css,/@media \(hover:hover\) and \(pointer:fine\)/);
  assert.match(css,/@media \(max-width:360px\)/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(css,/\.pa-reconnexion|#pa-form/,'formulaires hors du nouveau design ciblé');
});

test('Wordmark mobile : espacement naturel, pas d’ombre qui épaissit les lettres',()=>{
  const rule=css.match(/#portail-auth \.wf-portail-bienvenue \.wf-portail-wordmark \{([^}]+)\}/);
  assert.ok(rule,'règle de marque isolée sur le portail');
  assert.match(rule[1],/font-kerning:normal/);
  assert.match(rule[1],/letter-spacing:0/,'plus de suivi négatif qui colle « tfir »');
  assert.match(rule[1],/text-shadow:none/,'pas d’ombre baveuse sur fond noir');
  assert.match(rule[1],/'Watfir Logo'/,'même police Fraunces que le header');
  assert.match(css,/\.wf-portail-bienvenue \.wf-portail-wordmark/);
});

test('Charge CSS et JS du portail 2.2 à versions de cache explicites',()=>{
  assert.match(html,/portail-watfir\.css\?v=wf-poster-3/);
  assert.match(html,/portail\.js\?v=wf-poster-2/);
  assert.ok(html.indexOf('style.css')<html.indexOf('portail-watfir.css'));
});
