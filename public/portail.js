// SPEC 63 → 66 — portail de bienvenue, d'inscription et de reconnexion.
// Pas de données utilisateurs envoyées ici.
const PORTAIL_INVITE = 'luxPortailInviteV1'; // ancien choix persistant : nettoyé, jamais utilisé pour masquer l'accueil
const PORTAIL_COMPTE = 'luxPortailCompteConnuV1';
let portailMode = 'welcome';
let portailSurveille = false;
let portailEmail = '';          // SPEC 66 : l'e-mail saisi est gardé entre connexion et inscription
let portailEnvoi = false;       // SPEC 66 : pas de double envoi du formulaire
let portailCarteBloquee = false; // SPEC 66 : pas de retournement pendant l'animation

function portailStocker(k,v) { try { if(v==null) localStorage.removeItem(k); else localStorage.setItem(k,v); } catch (_) {} }
function portailLire(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
function portailVisible() {
  const el = document.getElementById('portail-auth');
  return !!(el && !el.classList.contains('hidden'));
}
// Formulaire affiché par-dessus la bienvenue : Retour y ramène (navigation.js).
function portailFormulaireOuvert() {
  return portailVisible() && portailMode !== 'welcome';
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
  arreterAudio();
  el.classList.add('hidden');
  el.setAttribute('aria-hidden','true');
  document.body.classList.remove('portail-bloque');
  if (typeof programmerGarde === 'function') programmerGarde();
}
function portailBouton(texte,action,style) {
  return '<button type="button" class="pa-bouton '+style+'" onclick="portailAction(&quot;'+action+'&quot;)">'+texte+'</button>';
}
function portailMarque() { return '<div class="pa-marque">Lëtzebuergesch<span class="pa-point"></span></div>'; }

// ─── BIENVENUE (SPEC 66) ────────────────────────────────────────────────────
const PORTAIL_ICONES = {
  lecons: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  revisions: '<path d="M21 12a9 9 0 0 0-15-6.7L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/><path d="M21 21v-5h-5"/>',
  examens: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  son: '<path d="M11 5 6 9H3v6h3l5 4z"/><path class="onde1" d="M15.5 8.5a5 5 0 0 1 0 7"/><path class="onde2" d="M18.5 5.5a9 9 0 0 1 0 13"/>'
};
function portailIcone(nom) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+PORTAIL_ICONES[nom]+'</svg>';
}
// Carte pédagogique : « Moien! » au recto, « Bonjour ! » au verso.
function portailCarte() {
  return '<div class="pa-carte-zone pa-anim" style="--d:3">'+
    '<button type="button" class="pa-carte" aria-pressed="false" onclick="portailRetourner()" '+
      'aria-label="Moien ! Appuie pour découvrir la traduction">'+
      '<span class="pa-carte-in">'+
        '<span class="pa-face recto"><span class="pa-carte-kicker">TA PREMIÈRE EXPRESSION</span>'+
          '<b lang="lb">Moien!</b><small>Appuie pour découvrir</small></span>'+
        '<span class="pa-face verso" aria-hidden="true"><span class="pa-carte-kicker">EN FRANÇAIS</span>'+
          '<b>Bonjour !</b><small>Appuie pour revenir</small></span>'+
      '</span></button>'+
    '<button type="button" class="pa-ecouter" onclick="portailEcouter(this)" aria-label="Écouter la prononciation de « Moien! »">'+
      portailIcone('son')+'<span>Écouter la prononciation</span></button>'+
  '</div>';
}
function portailAtouts() {
  const atout = (couleur,icone,texte) => '<li><span class="pa-atout-ic '+couleur+'">'+portailIcone(icone)+'</span>'+texte+'</li>';
  return '<ul class="pa-atouts pa-anim" style="--d:4">'+
    atout('or','lecons','Leçons courtes')+
    atout('vert','revisions','Révisions intelligentes')+
    atout('bleu','examens','Examens blancs')+
  '</ul>';
}
function portailRetourner() {
  if (portailCarteBloquee) return;
  const carte = document.querySelector('.pa-carte');
  if (!carte) return;
  const verso = !carte.classList.contains('retournee');
  carte.classList.toggle('retournee', verso);
  carte.setAttribute('aria-pressed', verso ? 'true' : 'false');
  carte.setAttribute('aria-label', verso ? 'Bonjour ! Appuie pour revenir à « Moien! »' : 'Moien ! Appuie pour découvrir la traduction');
  carte.querySelector('.recto').setAttribute('aria-hidden', verso ? 'true' : 'false');
  carte.querySelector('.verso').setAttribute('aria-hidden', verso ? 'false' : 'true');
  portailCarteBloquee = true;
  setTimeout(() => { portailCarteBloquee = false; }, animationsReduites() ? 0 : 420);
}
function portailEcouter(bouton) {
  jouerAudio('moien.mp3', bouton); // fichier LOD, jamais lu automatiquement
}

// ─── CONTENU DES ÉCRANS ─────────────────────────────────────────────────────
function portailContenu(mode) {
  const cloud = isCloudEnabled();
  if (mode === 'welcome') {
    return '<main class="pa-page pa-bienvenue"><div class="pa-centre">'+
      '<div class="pa-anim" style="--d:0">'+portailMarque()+'</div>'+
      '<h1 class="pa-anim" style="--d:1">Le luxembourgeois, à ta portée.</h1>'+
      '<p class="pa-intro pa-anim" style="--d:2">Quelques minutes par jour pour apprendre à parler luxembourgeois.</p>'+
      portailCarte()+
      portailAtouts()+
      (!cloud?'<p class="pa-indispo" role="status">Connexion momentanément indisponible. Tu peux commencer sans compte.</p>':'')+
      '<div class="pa-actions pa-anim" style="--d:5">'+
        portailBouton('Commencer à apprendre <span aria-hidden="true">→</span>','guest','or')+
        (cloud?portailBouton('Créer un compte','signup','sombre')+
          portailBouton('J’ai déjà un compte','signin','texte'):'')+
      '</div></div></main>';
  }
  const creation = mode === 'signup';
  const importable = !creation && typeof aDejaPratique === 'function' &&
    (aDejaPratique() || Object.keys(getProgress()).length > 0);
  return '<main class="pa-page pa-reconnexion">'+
    '<div class="pa-haut"><button type="button" class="pa-retour" onclick="portailRetourBienvenue()" aria-label="Retour à l’accueil">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg></button>'+
      portailMarque()+'</div>'+
    '<div class="pa-heading"><span class="pa-kicker">'+
    (creation?'CRÉER UN COMPTE':'HEUREUX DE TE REVOIR')+'</span>'+
    '<h1>'+(creation?'Un compte pour<br><em>tes progrès.</em>':'Bon retour !')+'</h1>'+
    '<p>'+(creation?'Sauvegarde tes progrès et retrouve tes leçons sur tes appareils.':
    'Connecte-toi pour retrouver tes leçons et ta progression.')+'</p></div>'+
    (cloud?'<form id="pa-form" novalidate onsubmit="portailSoumettre(event)">'+
      '<label for="pa-email">Adresse e-mail</label><input id="pa-email" type="email" autocomplete="email" placeholder="tonadresse@exemple.com" value="'+escHtml(portailEmail)+'" aria-describedby="pa-erreur-email">'+
      '<p id="pa-erreur-email" class="pa-erreur" role="alert"></p>'+
      '<label for="pa-password">Mot de passe</label><input id="pa-password" type="password" autocomplete="'+
      (creation?'new-password':'current-password')+'" placeholder="'+(creation?'6 caractères minimum':'Ton mot de passe')+'" aria-describedby="pa-erreur-password">'+
      '<p id="pa-erreur-password" class="pa-erreur" role="alert"></p>'+
      (!creation ? '<button class="pa-reset" type="button" onclick="portailReinitialiserMotDePasse()">Mot de passe oublié ?</button>' : '')+
      (importable?'<label class="pa-import"><input type="checkbox" id="pa-import"> Ajouter mes progrès de cet appareil à mon compte</label>':'')+
      '<button class="pa-bouton or" id="pa-envoyer" type="submit">'+(creation?'Créer mon compte':'Me connecter')+'</button>'+
      '<p id="pa-message" class="pa-message" role="status" aria-live="polite"></p></form>':
      '<p class="pa-indispo" role="status">Connexion momentanément indisponible. Tu peux commencer sans compte.</p>')+
    '<div class="pa-actions pa-autres">'+
      '<p class="pa-switch">'+(creation?'Déjà un compte ?':'Pas encore de compte ?')+
      ' <button type="button" onclick="portailAction(&quot;'+
        (creation?'signin':'signup')+'&quot;)">'+
        (creation?'Se connecter':'S’inscrire')+'</button></p>'+
      portailBouton('Continuer sans compte','guest','texte')+
    '</div></main>';
}

// sens : 'avant' (vers un formulaire) ou 'arriere' (retour à la bienvenue).
function portailOuvrir(mode, sens) {
  const el = document.getElementById('portail-auth');
  if (!el) return;
  const champ = document.getElementById('pa-email');
  if (champ) portailEmail = champ.value.trim();
  portailMode = mode==='signin'||mode==='signup'?mode:'welcome';
  portailEnvoi = false;
  el.innerHTML = portailContenu(portailMode);
  const page = el.querySelector('.pa-page');
  if (sens && page) page.classList.add(sens === 'arriere' ? 'pa-entre-arriere' : 'pa-entre-avant');
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden','false');
  document.body.classList.add('portail-bloque');
  el.scrollTop=0;
  if (typeof programmerGarde === 'function') programmerGarde();
}
function portailRetourBienvenue() {
  portailOuvrir('welcome', 'arriere');
}
function portailAction(action) {
  if(action==='guest'){
    // SPEC 66 : pas de confirmation, le choix est déjà exprimé. Message discret.
    // L'accueil « Moien / Bonjour » revient au prochain lancement (SPEC 64).
    portailStocker(PORTAIL_INVITE, null);
    portailStocker(PORTAIL_COMPTE, null); // dernier mode choisi = invité
    portailFermer();
    if(typeof goDashboard==='function')goDashboard();
    notifier('Ta progression est enregistrée sur cet appareil.');
    return;
  }
  if(action==='signup'||action==='signin')portailOuvrir(action,'avant');
}

// ─── FORMULAIRE ─────────────────────────────────────────────────────────────
function portailErreur(champ, texte) {
  const p = document.getElementById('pa-erreur-' + champ);
  const input = document.getElementById(champ === 'email' ? 'pa-email' : 'pa-password');
  if (p) p.textContent = texte || '';
  if (input) input.setAttribute('aria-invalid', texte ? 'true' : 'false');
}
async function portailReinitialiserMotDePasse() {
  const emailEl=document.getElementById('pa-email');
  const msg=document.getElementById('pa-message');
  if(!emailEl||!msg)return;
  const email=emailEl.value.trim();
  portailErreur('email', '');
  if(!email){portailErreur('email','Saisis ton adresse e-mail pour réinitialiser le mot de passe.');return;}
  if(!fbAuth){msg.textContent='Connexion momentanément indisponible.';return;}
  try {
    await fbAuth.sendPasswordResetEmail(email);
    msg.textContent='Si cette adresse correspond à un compte, un e-mail de réinitialisation a été envoyé.';
  } catch(err) {
    msg.textContent=typeof friendlyAuthError==='function' ? friendlyAuthError(err) :
      'Impossible d’envoyer l’e-mail pour le moment.';
  }
}
async function portailSoumettre(event) {
  event.preventDefault();
  if (portailEnvoi) return; // déjà en cours
  const email = document.getElementById('pa-email').value.trim();
  const pass = document.getElementById('pa-password').value;
  const msg = document.getElementById('pa-message');
  portailErreur('email', '');
  portailErreur('password', '');
  msg.textContent = '';
  let ok = true;
  if (!email) { portailErreur('email', 'Saisis ton adresse e-mail.'); ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { portailErreur('email', 'Adresse e-mail invalide.'); ok = false; }
  if (!pass) { portailErreur('password', 'Saisis ton mot de passe.'); ok = false; }
  else if (portailMode === 'signup' && pass.length < 6) { portailErreur('password', '6 caractères minimum.'); ok = false; }
  if (!ok) return;

  portailEmail = email;
  portailEnvoi = true;
  const bouton = document.getElementById('pa-envoyer');
  const texte = bouton.textContent;
  bouton.disabled = true;
  bouton.classList.add('charge');
  bouton.textContent = portailMode === 'signup' ? 'Création du compte…' : 'Connexion…';
  if (typeof handleAuth === 'function') await handleAuth(portailMode, 'portail');
  portailEnvoi = false;
  if (!document.body.contains(bouton)) return; // connecté : le portail est fermé
  bouton.disabled = false;
  bouton.classList.remove('charge');
  bouton.textContent = texte;
  // L'erreur va sous le champ concerné quand c'est possible.
  const erreur = msg.textContent;
  if (/existe déjà|Email invalide/.test(erreur)) { portailErreur('email', erreur); msg.textContent = ''; }
  else if (/^Mot de passe/.test(erreur)) { portailErreur('password', erreur); msg.textContent = ''; }
}
