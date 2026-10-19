// SPEC 63 — portail de bienvenue et de reconnexion. Pas de données utilisateurs envoyées ici.
const PORTAIL_INVITE = 'luxPortailInviteV1'; // ancien choix persistant : nettoyé, jamais utilisé pour masquer l'accueil
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
  // Recette visuelle et tests navigateur : pas de portail.
  if (window.APP_CONFIG && (window.APP_CONFIG.RECETTE || window.APP_CONFIG.TESTS)) return;
  if (user) portailCompteConnecte(user);
  else {
    // SPEC 64 : le choix « invité » ne masque plus l'accueil aux prochains lancements.
    // Ne jamais effacer la progression : seul l'ancien drapeau d'UI est nettoyé.
    portailStocker(PORTAIL_INVITE, null);
    if (typeof currentStorageProfile === 'string' &&
        currentStorageProfile.startsWith('user:') && typeof setStorageProfile === 'function')
      setStorageProfile('anonymous');
    portailOuvrir(portailLire(PORTAIL_COMPTE) === 'oui' ? 'signin' : 'welcome');
  }
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
// SPEC 65 : trois atouts de l'app, mêmes icônes et couleurs que les accès de l'accueil.
function portailAtout(couleur,icone,titre,detail) {
  return '<li class="pa-atout"><span class="pa-atout-ic '+couleur+'" aria-hidden="true">'+icone+'</span>'+
    '<span><b>'+titre+'</b><span>'+detail+'</span></span></li>';
}
function portailAtouts() {
  const svg = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>';
  return '<ul class="pa-atouts">'+
    portailAtout('or',svg('<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>'),
      'Leçons courtes','Une notion à la fois, à ton rythme')+
    portailAtout('vert',svg('<path d="M21 12a9 9 0 0 0-15-6.7L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/><path d="M21 21v-5h-5"/>'),
      'Révisions au bon moment','Pour ne rien oublier')+
    portailAtout('bleu',svg('<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>'),
      'Examens blancs','Pour te préparer aux tests officiels')+
    '</ul>';
}
function portailAlerteHtml() {
  return '<div id="pa-alerte" class="pa-alerte hidden" role="dialog" aria-modal="true" aria-labelledby="pa-titre-alerte">'+
    '<div class="pa-voile" onclick="portailFermerAlerte()"></div><section class="pa-feuille">'+
    '<div class="pa-symbole" aria-hidden="true">'+
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'+
    '<path d="M12 21v-9"/><path d="M12 13C7 13 4 10 4 5c5 0 8 3 8 8z"/><path d="M12 11c0-4 3-7 8-7 0 5-3 7-8 7z"/></svg></div>'+
    '<h2 id="pa-titre-alerte">C’est parti !</h2>'+
    '<p>Tu peux commencer les leçons tout de suite, sans compte.</p>'+
    '<div class="pa-risque"><span aria-hidden="true">ⓘ</span><span><strong>Bon à savoir :</strong> ta progression reste sur ce téléphone. Crée un compte quand tu veux pour la garder en sécurité et la retrouver partout.</span></div>'+
    '<div class="pa-actions">'+
    portailBouton('Commencer sans compte','guest-confirm','or')+
    (isCloudEnabled()?portailBouton('Créer un compte','signup','sombre'):'')+
    portailBouton('Retour','guest-back','texte')+'</div></section></div>';
}
function portailContenu(mode) {
  const cloud = isCloudEnabled();
  if (mode === 'welcome') {
    return '<main class="pa-page pa-bienvenue">'+portailMarque()+'<div class="pa-centre">'+
      '<div class="pa-heading"><span class="pa-kicker">WËLLKOMM · BIENVENUE</span>'+
      '<h1>Le luxembourgeois,<br><em>à ta portée.</em></h1>'+
      '<p>Des leçons simples pour progresser à ton rythme, du premier « Moien » aux conversations du quotidien.</p></div>'+
      portailAtouts()+
      (!cloud?'<p class="pa-indispo" role="status">Connexion momentanément indisponible. Tu peux continuer en invité.</p>':'')+
      '<div class="pa-actions">'+(cloud?portailBouton('Créer un compte','signup','or')+
        portailBouton('J’ai déjà un compte','signin','sombre'):'')+
        portailBouton('Continuer sans compte','guest','texte')+'</div></div></main>'+portailAlerteHtml();
  }
  const creation = mode === 'signup';
  const importable = !creation && typeof aDejaPratique === 'function' &&
    (aDejaPratique() || Object.keys(getProgress()).length > 0);
  return '<main class="pa-page pa-reconnexion">'+portailMarque()+
    '<div class="pa-heading"><span class="pa-kicker">'+
    (creation?'CRÉER UN COMPTE':'HEUREUX DE TE REVOIR')+'</span>'+
    '<h1>'+(creation?'Un compte pour<br><em>tes progrès.</em>':'Bon retour !')+'</h1>'+
    '<p>'+(creation?'Sauvegarde tes progrès et retrouve tes leçons sur tes appareils.':
    'Connecte-toi pour retrouver tes leçons et ta progression.')+'</p></div>'+
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
      '<p class="pa-switch">'+(creation?'Déjà un compte ?':'Pas encore de compte ?')+
      ' <button type="button" onclick="portailAction(&quot;'+
        (creation?'signin':'signup')+'&quot;)">'+
        (creation?'Se connecter':'Créer un compte')+'</button></p>'+
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
    // Il ne s'agit que d'une acceptation pour CETTE ouverture. L'accueil
    // « Moien / Bonjour » revient au prochain boot, sans toucher à la progression.
    portailStocker(PORTAIL_INVITE, null);
    portailStocker(PORTAIL_COMPTE, null); // dernier mode choisi = invité
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
