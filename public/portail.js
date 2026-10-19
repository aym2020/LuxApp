// SPEC 63 — portail de bienvenue et de reconnexion. Pas de données utilisateurs envoyées ici.
const PORTAIL_INVITE = 'luxPortailInviteV1';
const PORTAIL_COMPTE = 'luxPortailCompteConnuV1';
let portailMode = 'welcome';
let portailSurveille = false;
function portailStocker(k,v) { try { if(v==null) localStorage.removeItem(k); else localStorage.setItem(k,v); } catch (_) {} }
function portailLire(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
function portailVisible() {
  const el = document.getElementById('portail-auth');
  return !!(el && !el.classList.contains('hidden'));
}
function portailAlerteOuverte() {
  const el = document.getElementById('pa-alerte');
  return portailVisible() && !!(el && !el.classList.contains('hidden'));
}
function portailCompteConnecte(user) {
  if (!user) return;
  portailStocker(PORTAIL_COMPTE, 'oui');
  portailStocker(PORTAIL_INVITE, null);
  portailFermer();
}
function portailCompteDeconnecte() {
  portailStocker(PORTAIL_COMPTE, 'oui');
  portailStocker(PORTAIL_INVITE, null);
}
function portailInitialiser(user) {
  if (window.APP_CONFIG && window.APP_CONFIG.RECETTE) return;
  if (user) portailCompteConnecte(user);
  else if (portailLire(PORTAIL_INVITE) === 'oui') portailFermer();
  else portailOuvrir(portailLire(PORTAIL_COMPTE) === 'oui' ? 'signin' : 'welcome');
  if (!portailSurveille && fbAuth && typeof fbAuth.onAuthStateChanged === 'function') {
    portailSurveille = true;
    fbAuth.onAuthStateChanged(u => {
      if (!u && typeof currentStorageProfile === 'string' &&
          currentStorageProfile.startsWith('user:')) {
        portailCompteDeconnecte();
        setStorageProfile('anonymous');
        portailOuvrir('signin');
      }
    });
  }
}
function portailFermer() {
  const el = document.getElementById('portail-auth');
  if (!el) return;
  el.classList.add('hidden');
  el.setAttribute('aria-hidden','true');
  document.body.classList.remove('portail-bloque');
}
function portailBouton(texte,action,style) {
  return '<button type="button" class="pa-bouton '+style+'" onclick="portailAction(&quot;'+action+'&quot;)">'+texte+'</button>';
}
function portailMarque() { return '<div class="pa-marque">Lëtzebuergesch<span class="pa-point"></span></div>'; }
function portailFleur() {
  return '<div class="pa-scene" aria-hidden="true"><span class="pa-bulle pa-bulle-g">Moien !</span>'+
    '<svg viewBox="0 0 120 150" fill="none"><path d="M60 130V75" stroke="#51D5A9" stroke-width="8" stroke-linecap="round"/>'+
    '<path d="M60 88C33 78 21 53 25 27c25 0 43 17 37 51" stroke="#51D5A9" stroke-width="7"/>'+
    '<path d="M60 70c0-31 15-45 42-44 0 26-10 45-42 49" stroke="#51D5A9" stroke-width="7"/></svg>'+
    '<span class="pa-bulle pa-bulle-d">Bonjour !</span></div>';
}
function portailAlerteHtml() {
  return '<div id="pa-alerte" class="pa-alerte hidden" role="dialog" aria-modal="true" aria-labelledby="pa-titre-alerte">'+
    '<div class="pa-voile" onclick="portailFermerAlerte()"></div><section class="pa-feuille">'+
    '<div class="pa-poignee" aria-hidden="true"></div>'+
    '<div class="pa-symbole" role="img" aria-label="Sauvegarde en ligne non activée">'+
    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'+
    '<path d="M15 17a14 14 0 0 1 25 9 8 8 0 0 1-2 15"/>'+
    '<path d="M11 23a10 10 0 0 0 2 18h19"/><path d="M6 6 42 42" stroke-width="3.5"/></svg></div>'+
    '<h2 id="pa-titre-alerte">Continuer sans compte ?</h2>'+
    '<p>Tu peux découvrir LuxApp librement et commencer les leçons tout de suite.</p>'+
    '<div class="pa-risque"><span aria-hidden="true">ⓘ</span><span>Sans compte, ta progression reste <strong>sur cet appareil uniquement</strong>. Tu risques de la perdre si tu changes de téléphone ou effaces les données.</span></div>'+
    '<div class="pa-actions">'+
    (isCloudEnabled()?portailBouton('Créer un compte pour sauvegarder','signup','or'):'')+
    portailBouton('Continuer en invité','guest-confirm','sombre')+
    portailBouton('Retour','guest-back','texte')+'</div></section></div>';
}
function portailContenu(mode) {
  const cloud = isCloudEnabled();
  if (mode === 'welcome') {
    return '<main class="pa-page pa-bienvenue">'+portailMarque()+
      '<div class="pa-heading"><span class="pa-kicker">WËLLKOMM · BIENVENUE</span>'+
      '<h1>Le luxembourgeois,<br><em>à ta portée.</em></h1>'+
      '<p>Un peu chaque jour, beaucoup de progrès. Découvre la langue à travers des leçons simples et des situations de la vie quotidienne.</p></div>'+
      portailFleur()+'<p class="pa-promise">✓ À ton rythme · Même si tu débutes de zéro</p>'+
      (!cloud?'<p class="pa-indispo" role="status">Connexion momentanément indisponible. Tu peux continuer en invité.</p>':'')+
      '<div class="pa-actions">'+(cloud?portailBouton('Créer mon compte','signup','or')+
        portailBouton('J’ai déjà un compte','signin','sombre'):'')+
        portailBouton('Continuer sans compte','guest','texte')+'</div></main>'+portailAlerteHtml();
  }
  const creation = mode === 'signup';
  const importable = !creation && typeof aDejaPratique === 'function' &&
    (aDejaPratique() || Object.keys(getProgress()).length > 0);
  return '<main class="pa-page pa-reconnexion">'+portailMarque()+
    '<div class="pa-heading"><span class="pa-kicker">'+
    (creation?'BIENVENUE DANS L’AVENTURE':'TON PARCOURS T’ATTEND')+'</span>'+
    '<h1>'+(creation?'Ton parcours<br><em>commence ici.</em>':'Bon retour <em>!</em>')+'</h1>'+
    '<p>'+(creation?'Crée un compte pour retrouver tes leçons et tes progrès sur tes appareils.':
    'Reconnecte-toi pour retrouver tes leçons, tes étoiles et ta progression.')+'</p></div>'+
    '<div class="pa-compte-icone" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="32" cy="24" r="14"/><path d="M7 57c2-12 12-19 25-19s23 7 25 19"/></svg></div>'+
    (cloud?'<form id="pa-form" onsubmit="portailSoumettre(event)">'+
      '<label for="pa-email">Adresse e-mail</label><input id="pa-email" type="email" autocomplete="email" placeholder="tonadresse@exemple.com" required>'+
      '<label for="pa-password">Mot de passe</label><input id="pa-password" type="password" autocomplete="'+
      (creation?'new-password':'current-password')+'" placeholder="'+(creation?'6 caractères minimum':'Ton mot de passe')+'" required minlength="6">'+
      (!creation ? '<button class="pa-reset" type="button" onclick="portailReinitialiserMotDePasse()">Mot de passe oublié ?</button>' : '')+
      (importable?'<label class="pa-import"><input type="checkbox" id="pa-import"> Ajouter mes progrès de cet appareil à mon compte</label>':'')+
      '<button class="pa-bouton or" type="submit">'+(creation?'Créer mon compte':'Me connecter')+'</button>'+
      '<p id="pa-message" class="pa-message" role="status" aria-live="polite"></p></form>':
      '<p class="pa-indispo" role="status">Connexion momentanément indisponible. Tu peux continuer en invité.</p>')+
    '<div class="pa-actions pa-autres">'+
      portailBouton(creation?'J’ai déjà un compte':'Créer un compte',creation?'signin':'signup','sombre')+
      portailBouton('Continuer sans compte','guest','texte')+
    '</div></main>'+portailAlerteHtml();
}
function portailOuvrir(mode) {
  const el = document.getElementById('portail-auth');
  if (!el) return;
  portailMode = mode==='signin'||mode==='signup'?mode:'welcome';
  el.innerHTML = portailContenu(portailMode);
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden','false');
  document.body.classList.add('portail-bloque');
  el.scrollTop=0;
}
function portailAfficherAlerte() {
  const el=document.getElementById('pa-alerte');
  if (!el) return;
  el.classList.remove('hidden');
  const btn=el.querySelector('.pa-bouton');if(btn)btn.focus();
  if(typeof programmerGarde==='function')programmerGarde();
}
function portailFermerAlerte() {
  const el=document.getElementById('pa-alerte');
  if(el)el.classList.add('hidden');
  if(typeof programmerGarde==='function')programmerGarde();
}
function portailAction(action) {
  if(action==='guest'){portailAfficherAlerte();return;}
  if(action==='guest-back'){portailFermerAlerte();return;}
  if(action==='guest-confirm'){
    portailStocker(PORTAIL_INVITE,'oui');
    portailFermer();
    if(typeof goDashboard==='function')goDashboard();
    return;
  }
  if(action==='signup'||action==='signin')portailOuvrir(action);
}
async function portailReinitialiserMotDePasse() {
  const emailEl=document.getElementById('pa-email');
  const msg=document.getElementById('pa-message');
  if(!emailEl||!msg)return;
  const email=emailEl.value.trim();
  if(!email){msg.textContent='Saisis ton adresse e-mail pour réinitialiser le mot de passe.';return;}
  if(!fbAuth){msg.textContent='Connexion momentanément indisponible.';return;}
  try {
    await fbAuth.sendPasswordResetEmail(email);
    msg.textContent='Si cette adresse correspond à un compte, un e-mail de réinitialisation a été envoyé.';
  } catch(err) {
    msg.textContent=typeof friendlyAuthError==='function' ? friendlyAuthError(err) :
      'Impossible d’envoyer l’e-mail pour le moment.';
  }
}
function portailSoumettre(event) {
  event.preventDefault();
  if(typeof handleAuth==='function')void handleAuth(portailMode,'portail');
}
document.addEventListener('keydown',event=>{
  if(portailAlerteOuverte()&&event.key==='Escape'){
    event.preventDefault();portailFermerAlerte();
  }
});
