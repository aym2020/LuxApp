/* SPEC 109 — Lux Match : interface (DÉMO).
   Téléphone + écrans en HTML (lisibles et accessibles), scène 3D chargée à la demande
   (lux-match-3d.js), règles dans lux-match-core.js.
   Parcours : swipe → match → (enquête Pix / Pro / Amis) → look → rendez-vous 3D → résultats.
   Les répliques luxembourgeoises viennent de data/jeux/lux-match/ (brouillons à auditer) :
   la démo l'indique à l'écran. Aucune progression des leçons n'est modifiée. */
'use strict';

const LM_STYLES = [
  { id: 'sportif', nom: 'Sportif' }, { id: 'casual', nom: 'Casual' }, { id: 'loose', nom: 'Loose' },
  { id: 'bcbg', nom: 'BCBG' }, { id: 'creatif', nom: 'Créatif' }
];
const LM_COULEURS = [
  { id: 'schwaarz', fr: 'noir', hex: '#1c1b20' }, { id: 'wäiss', fr: 'blanc', hex: '#f2f0ea' },
  { id: 'blo', fr: 'bleu', hex: '#2f6fd6' }, { id: 'gréng', fr: 'vert', hex: '#2fa35a' },
  { id: 'rout', fr: 'rouge', hex: '#d8343c' }, { id: 'beige', fr: 'beige', hex: '#d9c3a0' }
];
// Pose et fond des « photos » Pix selon leur sujet (rendues en 3D avec le personnage).
const LM_PHOTOS = {
  running: ['Walk', '#2d6b4f'], football: ['Jump', '#2f7a3a'], style_bcbg: ['Victory', '#4a3a1c'],
  urban: ['Idle', '#2a3550'], art: ['PickUp', '#6a2c4a'], color: ['Victory', '#8a2233'],
  voyage: ['Victory', '#2a5f86'], transport: ['Walk', '#4a4060']
};
const LM_ISSUES = {
  nouveau_rdv: { titre: 'NOUVEAU RDV !', texte: 'Elle veut te revoir. Le courant passe… et ton histoire tient la route.' },
  gene_drole: { titre: 'GÊNANT… MAIS DRÔLE', texte: 'Tes inventions t’ont rattrapé, mais vous avez bien ri.' },
  pas_colle: { titre: 'ÇA NE COLLE PAS', texte: 'Sympa, sans plus. Une autre personne, un autre style ?' },
  malaise: { titre: 'MALAISE…', texte: 'Trop de contradictions : elle a préféré partir. Tes mensonges avaient une suite !' }
};
// Effet visuel 3D selon la réaction d'un piège (data : choices[].visual).
const LM_VISUELS = {
  record_scratch: 'scratch', dramatic_zoom: 'zoom', sparkles: 'joie', laugh: 'rire', miss_ball: 'rire',
  suspicious_eyebrow: 'surprise', shrug: 'pas_mal', draw_potato: 'rire', retro_fail: 'rire', teach: 'pas_mal',
  phone_down: 'pas_mal', cold_look: 'froid'
};

const lm = {
  donnees: null, partie: null, ecran: null, app: null,
  rendu3d: null, promesse3d: null, portraits: {},
  aideFr: false, attente: null, boucleBatterie: null, feedbackTimer: null
};

// ─── Utilitaires ────────────────────────────────────────────────────────────

function lmEchapper(texte) {
  return String(texte == null ? '' : texte).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function lmCle(nom) { return typeof storageKey === 'function' ? storageKey(nom) : nom; }
function lmLire(nom, defaut) {
  try { const v = localStorage.getItem(lmCle(nom)); return v == null ? defaut : JSON.parse(v); } catch (_) { return defaut; }
}
function lmEcrire(nom, valeur) {
  try { localStorage.setItem(lmCle(nom), JSON.stringify(valeur)); } catch (_) { /* facultatif */ }
}
function lmBox() { return document.getElementById('lm-jeu'); }
function lmVueActive() {
  const vue = document.getElementById('view-luxmatch');
  return !!vue && vue.classList.contains('active');
}
function lmIcone(nom) {
  const d = {
    retour: '<path d="M15 5l-7 7 7 7"/>', coeur: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    croix: '<path d="M6 6l12 12M18 6L6 18"/>', oeil: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
    tel: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', moi: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4"/>',
    son: '<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>', muet: '<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M17 9l4 6M21 9l-4 6"/>',
    cadenas: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
  }[nom] || '';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
}

// ─── Sons (Web Audio, propres au jeu) ───────────────────────────────────────

const LuxMatchSon = (function () {
  let audio = null;
  const actif = () => lmLire('luxMatchSon', true);
  function preparer() {
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; } }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }
  function note(f, debut, duree, volume, forme, fin) {
    const a = audio, o = a.createOscillator(), g = a.createGain(), t = a.currentTime + debut;
    o.type = forme || 'square'; o.frequency.setValueAtTime(f, t);
    if (fin) o.frequency.exponentialRampToValueAtTime(fin, t + duree);
    g.gain.setValueAtTime(volume, t); g.gain.linearRampToValueAtTime(0, t + duree);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + duree + 0.02);
  }
  const sons = {
    swipe: () => note(500, 0, 0.08, 0.05, 'triangle', 260),
    like: () => { note(660, 0, 0.06, 0.06); note(990, 0.06, 0.12, 0.06); },
    match: () => [523, 659, 784, 1046, 1318].forEach((f, i) => note(f, i * 0.08, 0.14, 0.07)),
    bien: () => { note(988, 0, 0.06, 0.06); note(1319, 0.06, 0.2, 0.06); },
    bof: () => note(330, 0, 0.18, 0.06, 'triangle'),
    faux: () => { note(260, 0, 0.12, 0.08); note(196, 0.12, 0.22, 0.08); },
    scratch: () => note(1400, 0, 0.32, 0.08, 'sawtooth', 90),
    tel: () => { note(1760, 0, 0.04, 0.04); note(2349, 0.05, 0.05, 0.04); },
    vide: () => note(440, 0, 0.5, 0.07, 'square', 60),
    fin: () => [784, 659, 784, 1046].forEach((f, i) => note(f, i * 0.12, 0.16, 0.07))
  };
  function jouer(nom) {
    if (!actif() || !preparer() || !sons[nom]) return;
    try { sons[nom](); } catch (_) { /* le son est un bonus */ }
  }
  return { jouer, preparer, actif };
})();

// ─── Entrée / sortie ────────────────────────────────────────────────────────

async function lmChargerDonnees() {
  if (lm.donnees) return lm.donnees;
  const r = await fetch('/api/jeux/lux-match');
  if (!r.ok) throw new Error('donnees');
  lm.donnees = await r.json();
  return lm.donnees;
}
// Le moteur 3D est créé une seule fois (préchargé dès l'ouverture du jeu).
function lmObtenir3D() {
  if (!lm.promesse3d) {
    lm.promesse3d = import('./lux-match-3d.js?v=2').then(() => window.LuxMatch3D.creer());
    lm.promesse3d.then(r => { lm.rendu3d = r; }).catch(() => { lm.promesse3d = null; });
  }
  return lm.promesse3d;
}

// Écran de chargement sobre : logo, barre en paliers, étape en cours.
function lmEcranChargement(progres, etape) {
  const box = lmBox();
  if (!box) return;
  if (!box.querySelector('.lm-lancement')) {
    box.innerHTML = '<div class="lm-lancement" role="status" aria-live="polite">' +
      '<div class="lm-lancement-logo">LUX <i>♥</i> MATCH</div>' +
      '<div class="lm-lancement-barre"><i id="lm-lancement-progres"></i></div>' +
      '<p id="lm-lancement-etape"></p></div>';
  }
  const barre = document.getElementById('lm-lancement-progres');
  const texte = document.getElementById('lm-lancement-etape');
  if (barre) barre.style.width = progres + '%';
  if (texte) texte.textContent = etape;
}
async function ouvrirLuxMatch() {
  luxMatchArreter();
  LuxMatchSon.preparer();
  showView('view-luxmatch');
  const debut = performance.now();
  lmEcranChargement(10, 'Connexion au réseau…');
  try { await lmChargerDonnees(); } catch (_) {
    const box = lmBox();
    if (box) box.innerHTML = lmEntete() + '<p class="lm-chargement">Impossible de charger Lux Match. Vérifie ta connexion.</p>';
    return;
  }
  lm.aideFr = lmLire('luxMatchAideFr', true);
  const partie = LuxMatchCore.nouvellePartie(lm.donnees, { parties: lmLire('luxMatchParties', 0) });
  lm.partie = partie;
  lmEcranChargement(40, 'Recherche de profils à proximité…');
  // On attend la 3D et les deux premières photos, 6 s au plus (sinon les initiales s'affichent).
  const premieres = partie.paquet.slice(0, 2).map(id => [LuxMatchCore.profilParId(partie, id), 'Idle', '#3a2a55']);
  const pret = lmObtenir3D().then(() => { lmEcranChargement(75, 'Préparation des photos…'); return lmPreparerImages(premieres); });
  await Promise.race([pret.catch(() => {}), new Promise(r => setTimeout(r, 6000))]);
  if (lm.partie !== partie || !lmVueActive()) return; // l'utilisateur est reparti
  lmEcranChargement(100, 'C’est parti !');
  // Durée minimale courte : l'écran ne clignote pas quand tout est déjà en cache.
  await new Promise(r => setTimeout(r, Math.max(250, 700 - (performance.now() - debut))));
  if (lm.partie !== partie || !lmVueActive()) return;
  lm.app = null;
  lmRendre();
}
function lmNouvellePartie() {
  lm.partie = LuxMatchCore.nouvellePartie(lm.donnees, { parties: lmLire('luxMatchParties', 0) });
  lm.app = null;
  lmRendre();
}
function luxMatchArreter() {
  lmArreterBatterie();
  clearTimeout(lm.feedbackTimer);
  if (lm.rendu3d) lm.rendu3d.detacher();
  lm.partie = null;
  lm.ecran = null;
}

// ─── Rendu par phase ───────────────────────────────────────────────────────

function lmEntete() {
  const son = LuxMatchSon.actif();
  return '<div class="lm-top"><button type="button" class="lm-retour" onclick="lmQuitter()">' + lmIcone('retour') + '<span>Jeux</span></button>' +
    '<span class="lm-logo">LUX <i>♥</i> MATCH <small>DÉMO</small></span>' +
    '<button type="button" class="lm-icone-btn" onclick="lmBasculerSon()" aria-label="' + (son ? 'Couper le son' : 'Activer le son') + '">' + lmIcone(son ? 'son' : 'muet') + '</button></div>';
}
function lmQuitter() { luxMatchArreter(); if (typeof ouvrirJeux === 'function') ouvrirJeux(); }
function lmBasculerSon() { lmEcrire('luxMatchSon', !LuxMatchSon.actif()); const t = document.querySelector('#lm-jeu .lm-top'); if (t) t.outerHTML = lmEntete(); }

function lmRendre() {
  const p = lm.partie, box = lmBox();
  if (!p || !box) return;
  lm.ecran = p.phase;
  if (p.phase !== 'date' && lm.rendu3d && p.phase !== 'look') lm.rendu3d.detacher();
  if (p.phase === 'swipe') lmRendreSwipe(box);
  else if (p.phase === 'match') lmRendreMatch(box);
  else if (p.phase === 'reseaux') lmRendreReseaux(box);
  else if (p.phase === 'look') lmRendreLook(box);
  else if (p.phase === 'date') lmRendreDate(box);
  else lmRendreResultats(box);
}

// Coque de téléphone (décor CSS) autour d'un contenu HTML lisible.
function lmTelephone(contenu, classe) {
  return '<div class="lm-tel ' + (classe || '') + '"><div class="lm-tel-ecran">' +
    '<div class="lm-tel-statut"><span>21:30</span><span class="lm-tel-encoche"></span><span>5G ▮▮▮</span></div>' +
    contenu + '</div></div>';
}

// Portraits rendus en 3D (mis en cache) ; repli : initiale sur dégradé.
function lmCleImage(profil, pose) { return (profil === 'alex' ? 'alex' : profil.id) + ':' + (pose || 'Idle'); }
function lmImage(profil, pose, fond, classe) {
  const cle = lmCleImage(profil, pose);
  const url = lm.portraits[cle];
  const nom = profil === 'alex' ? 'Alex' : profil.name;
  if (url) return '<img class="' + classe + '" src="' + url + '" alt="">';
  return '<div class="' + classe + ' lm-image-attente" data-image="' + lmEchapper(cle) + '"><span>' + lmEchapper(nom[0]) + '</span></div>';
}
// Prépare une liste d'images puis remplace les emplacements en attente.
async function lmPreparerImages(liste) {
  let moteur;
  try { moteur = await lmObtenir3D(); } catch (_) { return; }
  for (const [profil, pose, fond] of liste) {
    // Plus de portraits une fois l'aperçu 3D ou le rendez-vous affiché (même modèles).
    if (!lm.partie || ['swipe', 'match', 'reseaux', 'resultats'].indexOf(lm.partie.phase) < 0) return;
    const cle = lmCleImage(profil, pose);
    if (lm.portraits[cle]) continue;
    try {
      lm.portraits[cle] = await moteur.portrait(profil, pose === 'Idle' ? 'Idle' : pose, fond);
    } catch (_) { continue; }
    document.querySelectorAll('#lm-jeu [data-image="' + cle.replace(/"/g, '') + '"]').forEach(el => {
      const img = document.createElement('img');
      img.className = el.className.replace('lm-image-attente', '').trim();
      img.src = lm.portraits[cle]; img.alt = '';
      el.replaceWith(img);
    });
  }
}

// ── SWIPE
function lmRendreSwipe(box) {
  const p = lm.partie, profil = LuxMatchCore.carteCourante(p);
  const reste = p.paquet.length - p.indexCarte;
  const carte = '<div class="lm-carte" id="lm-carte">' +
      lmImage(profil, 'Idle', '#3a2a55', 'lm-carte-photo') +
      '<div class="lm-carte-infos"><h2>' + lmEchapper(profil.name) + ', <span>' + profil.age + '</span></h2>' +
      '<p class="lm-lu" lang="lb">' + lmEchapper(profil.amis.bioLu) + '</p>' +
      (lm.aideFr ? '<p class="lm-fr">' + lmEchapper(profil.amis.bioFr) + '</p>' : '') +
      '<div class="lm-tags">' + profil.pix.bioLu.split(/[ .]+/).filter(m => m.length > 2).slice(0, 3).map(t => '<span lang="lb">' + lmEchapper(t) + '</span>').join('') + '</div>' +
      '</div><div class="lm-tampon lm-tampon-oui">OUI</div><div class="lm-tampon lm-tampon-non">NON</div></div>';
  box.innerHTML = lmEntete() +
    '<p class="lm-consigne">Swipe à droite si elle te plaît. ' + reste + ' profil' + (reste > 1 ? 's' : '') + ' à proximité.</p>' +
    lmTelephone('<div class="lm-app-match"><div class="lm-app-titre">lux<b>♥</b>match</div>' + carte +
      '<div class="lm-swipe-boutons"><button type="button" class="lm-rond lm-non" onclick="lmSwiper(false)" aria-label="Passer">' + lmIcone('croix') + '</button>' +
      '<button type="button" class="lm-rond lm-oui" onclick="lmSwiper(true)" aria-label="J’aime">' + lmIcone('coeur') + '</button></div></div>') +
    lmBoutonAide();
  lmBrancherSwipe(document.getElementById('lm-carte'));
  lmPreparerImages(p.paquet.slice(p.indexCarte).map(id => [LuxMatchCore.profilParId(p, id), 'Idle', '#3a2a55']));
}
function lmBoutonAide() {
  return '<button type="button" class="lm-aide-fr' + (lm.aideFr ? ' lm-actif' : '') + '" onclick="lmBasculerAide()" aria-pressed="' + lm.aideFr + '">Aide FR ' + (lm.aideFr ? 'activée' : 'désactivée') + '</button>';
}
function lmBasculerAide() {
  lm.aideFr = !lm.aideFr; lmEcrire('luxMatchAideFr', lm.aideFr);
  if (lm.ecran === 'date') { lmMajDialogue(); const b = document.querySelector('#lm-jeu .lm-aide-fr'); if (b) b.outerHTML = lmBoutonAide(); }
  else lmRendre();
}
// Glisser la carte : au-delà de 90 px, la décision est prise.
function lmBrancherSwipe(carte) {
  if (!carte) return;
  let depart = null;
  carte.addEventListener('pointerdown', e => { depart = e.clientX; carte.setPointerCapture(e.pointerId); carte.classList.add('lm-tire'); });
  carte.addEventListener('pointermove', e => {
    if (depart === null) return;
    const dx = e.clientX - depart;
    carte.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 14 + 'deg)';
    carte.classList.toggle('lm-penche-oui', dx > 40); carte.classList.toggle('lm-penche-non', dx < -40);
  });
  const fin = e => {
    if (depart === null) return;
    const dx = e.clientX - depart; depart = null;
    carte.classList.remove('lm-tire');
    if (Math.abs(dx) > 90) lmSwiper(dx > 0);
    else { carte.style.transform = ''; carte.classList.remove('lm-penche-oui', 'lm-penche-non'); }
  };
  carte.addEventListener('pointerup', fin); carte.addEventListener('pointercancel', fin);
}
function lmSwiper(aime) {
  const carte = document.getElementById('lm-carte');
  if (!lm.partie || lm.partie.phase !== 'swipe' || (carte && carte.classList.contains('lm-sortie'))) return;
  LuxMatchSon.jouer(aime ? 'like' : 'swipe');
  if (carte) { carte.classList.add('lm-sortie', aime ? 'lm-sortie-oui' : 'lm-sortie-non'); }
  setTimeout(() => {
    const resultat = LuxMatchCore.swiper(lm.partie, aime);
    if (resultat === 'match') LuxMatchSon.jouer('match');
    lmRendre();
    if (resultat === 'recommence') lmToast('Personne d’autre pour l’instant… on refait un tour !');
  }, 260);
}

// ── MATCH
function lmRendreMatch(box) {
  const p = lm.partie, profil = p.profil;
  box.innerHTML = lmEntete() +
    '<div class="lm-match"><div class="lm-match-titre" aria-live="polite">IT’S A<br>MATCH!</div>' +
    '<div class="lm-match-duo">' + lmImage('alex', 'Idle', '#2a3550', 'lm-match-photo lm-g') + '<span class="lm-match-coeur">♥</span>' +
      lmImage(profil, 'Idle', '#3a2a55', 'lm-match-photo lm-d') + '</div>' +
    '<p class="lm-match-texte">Toi et <b>' + lmEchapper(profil.name) + '</b>, rendez-vous ce soir au café.</p>' +
    '<p class="lm-match-astuce">Tu peux y aller direct, ou d’abord jeter un œil à ses réseaux…</p>' +
    '<div class="lm-actions"><button type="button" class="lm-btn lm-btn-or" onclick="lmApresMatch(\'date\')">DATE</button>' +
    '<button type="button" class="lm-btn lm-btn-violet" onclick="lmApresMatch(\'enqueter\')">ENQUÊTER</button></div></div>';
  lmPreparerImages([['alex', 'Idle', '#2a3550'], [profil, 'Idle', '#3a2a55']].concat(lmListePhotos(profil)));
}
function lmListePhotos(profil) {
  return (profil.pix.private ? [] : profil.pix.photos).map(ph => {
    const [pose, fond] = LM_PHOTOS[ph.tag] || ['Idle', '#3a2a55'];
    return [profil, pose, fond];
  });
}
function lmApresMatch(choix) {
  LuxMatchCore.apresMatch(lm.partie, choix);
  lm.app = null;
  lmRendre();
}

// ── RÉSEAUX (préparation : consultation libre)
function lmContenuApps(profil, depuisDate) {
  if (!lm.app) {
    return '<div class="lm-apps"><p class="lm-apps-titre">' + lmEchapper(profil.name) + ' sur les réseaux</p><div class="lm-apps-grille">' +
      [['pix', 'Pix', 'photos'], ['pro', 'Pro', 'travail'], ['amis', 'Amis', 'perso']].map(([id, nom, sous]) =>
        '<button type="button" class="lm-app-icone lm-app-' + id + '" onclick="lmOuvrirApp(\'' + id + '\')"><i>' + nom[0] + '</i><b>' + nom + '</b><small>' + sous + '</small></button>').join('') +
      '</div>' + (depuisDate ? '' : '<p class="lm-apps-note">Réseaux fictifs. Une photo de voyage ne prouve pas une origine !</p>') + '</div>';
  }
  const retour = '<button type="button" class="lm-app-retour" onclick="lmOuvrirApp(null)">' + lmIcone('retour') + ' Apps</button>';
  const fr = texte => lm.aideFr && texte ? '<p class="lm-fr">' + lmEchapper(texte) + '</p>' : '';
  if (lm.app === 'pix') {
    const pix = profil.pix;
    if (pix.private) {
      return retour + '<div class="lm-pix"><div class="lm-pix-tete">' + lmImage(profil, 'Idle', '#3a2a55', 'lm-avatar') +
        '<div><b>@' + lmEchapper(profil.name.toLowerCase()) + '</b><p class="lm-lu" lang="lb">' + lmEchapper(pix.bioLu) + '</p>' + fr(pix.bioFr) + '</div></div>' +
        '<div class="lm-prive">' + lmIcone('cadenas') + '<b>Compte privé</b><span>Ses photos ne sont visibles que par ses abonnés.</span></div></div>';
    }
    return retour + '<div class="lm-pix"><div class="lm-pix-tete">' + lmImage(profil, 'Idle', '#3a2a55', 'lm-avatar') +
      '<div><b>@' + lmEchapper(profil.name.toLowerCase()) + '</b><small>' + pix.followers + ' abonnés</small><p class="lm-lu" lang="lb">' + lmEchapper(pix.bioLu) + '</p>' + fr(pix.bioFr) + '</div></div>' +
      '<div class="lm-pix-grille">' + pix.photos.map(ph => {
        const [pose, fond] = LM_PHOTOS[ph.tag] || ['Idle', '#3a2a55'];
        return '<figure>' + lmImage(profil, pose, fond, 'lm-pix-photo') + '<figcaption>' + lmEchapper(ph.captionFr) + '</figcaption></figure>';
      }).join('') + '</div></div>';
  }
  if (lm.app === 'pro') {
    const pro = profil.pro;
    return retour + '<div class="lm-pro"><div class="lm-pro-banniere"></div>' + lmImage(profil, 'Idle', '#2a3550', 'lm-avatar lm-pro-avatar') +
      '<h3>' + lmEchapper(profil.name) + '</h3><p class="lm-pro-poste">' + lmEchapper(pro.jobFr) + ' · ' + lmEchapper(pro.cityFr) + '</p>' +
      '<dl><dt>Formation</dt><dd>' + lmEchapper(pro.educationFr) + '</dd><dt>Langues</dt><dd lang="lb">' + pro.langs.map(lmEchapper).join(', ') + '</dd></dl></div>';
  }
  const amis = profil.amis;
  return retour + '<div class="lm-amis"><div class="lm-pix-tete">' + lmImage(profil, 'Idle', '#2d4a3a', 'lm-avatar') +
    '<div><b>' + lmEchapper(profil.name) + '</b><p class="lm-lu" lang="lb">' + lmEchapper(amis.bioLu) + '</p>' + fr(amis.bioFr) + '</div></div>' +
    amis.posts.map(post => '<article class="lm-post">' + (post.lu ? '<p class="lm-lu" lang="lb">' + lmEchapper(post.lu) + '</p>' : '') +
      '<p class="lm-fr' + (post.lu ? '' : ' lm-fr-seul') + '">' + lmEchapper(post.fr) + '</p></article>').join('') + '</div>';
}
function lmOuvrirApp(app) {
  lm.app = app;
  if (app) LuxMatchCore.noterApp(lm.partie, app);
  LuxMatchSon.jouer('tel');
  if (lm.ecran === 'date') lmMajTelephoneDate();
  else lmRendre();
}
function lmRendreReseaux(box) {
  const profil = lm.partie.profil;
  box.innerHTML = lmEntete() + '<p class="lm-consigne">Enquête avant le rendez-vous : prends ton temps, ici la batterie ne baisse pas.</p>' +
    lmTelephone('<div class="lm-tel-defile">' + lmContenuApps(profil, false) + '</div>') +
    '<div class="lm-actions"><button type="button" class="lm-btn lm-btn-or" onclick="lmAllerAuLook()">Choisir mon look →</button></div>' + lmBoutonAide();
  lmPreparerImages([[profil, 'Idle', '#3a2a55'], [profil, 'Idle', '#2a3550'], [profil, 'Idle', '#2d4a3a']].concat(lmListePhotos(profil)));
}
function lmAllerAuLook() { lm.partie.phase = 'look'; lm.app = null; lmRendre(); }

// ── LOOK
function lmRendreLook(box) {
  const p = lm.partie, look = lm.lookEnCours || { style: null, couleur: null };
  lm.lookEnCours = look;
  box.innerHTML = lmEntete() +
    '<div class="lm-look"><div class="lm-apercu" id="lm-apercu"><span class="lm-apercu-attente">Alex se prépare…</span></div>' +
    '<h2 class="lm-section">Ton look pour ' + lmEchapper(p.profil.name) + '</h2>' +
    '<div class="lm-styles" role="radiogroup" aria-label="Style">' + LM_STYLES.map(s =>
      '<button type="button" role="radio" aria-checked="' + (look.style === s.id) + '" class="lm-choix' + (look.style === s.id ? ' lm-choisi' : '') + '" onclick="lmChoisirStyle(\'' + s.id + '\')">' + s.nom + '</button>').join('') + '</div>' +
    '<div class="lm-couleurs" role="radiogroup" aria-label="Couleur">' + LM_COULEURS.map(c =>
      '<button type="button" role="radio" aria-checked="' + (look.couleur === c.id) + '" class="lm-couleur' + (look.couleur === c.id ? ' lm-choisi' : '') + '" onclick="lmChoisirCouleur(\'' + c.id + '\')">' +
      '<i style="background:' + c.hex + '"></i><span lang="lb">' + lmEchapper(c.id) + '</span>' + (lm.aideFr ? '<small>' + c.fr + '</small>' : '') + '</button>').join('') + '</div>' +
    '<div class="lm-actions"><button type="button" class="lm-btn lm-btn-or" onclick="lmCommencerDate(false)"' + (look.style && look.couleur ? '' : ' disabled') + '>Aller au rendez-vous</button>' +
    '<button type="button" class="lm-btn lm-btn-lien" onclick="lmCommencerDate(true)">Passer (look actuel)</button></div>' +
    '<button type="button" class="lm-btn lm-btn-lien lm-revoir" onclick="lmRevoirReseaux()">' + lmIcone('tel') + ' Revoir ses réseaux</button></div>';
  lmObtenir3D().then(m => m.apercu(document.getElementById('lm-apercu'), look)).then(() => {
    const t = document.querySelector('#lm-apercu .lm-apercu-attente'); if (t) t.remove();
  }).catch(() => {
    const t = document.querySelector('#lm-apercu .lm-apercu-attente'); if (t) t.textContent = 'Aperçu 3D indisponible';
  });
}
function lmRevoirReseaux() { lm.partie.phase = 'reseaux'; lm.partie.enquete = true; lm.app = null; lmRendre(); }
function lmChoisirStyle(id) { lm.lookEnCours.style = id; lmMajLook(); }
function lmChoisirCouleur(id) { lm.lookEnCours.couleur = id; lmMajLook(); }
function lmMajLook() {
  LuxMatchSon.jouer('like');
  const look = lm.lookEnCours;
  document.querySelectorAll('#lm-jeu .lm-styles .lm-choix').forEach((b, i) => {
    const oui = LM_STYLES[i].id === look.style; b.classList.toggle('lm-choisi', oui); b.setAttribute('aria-checked', oui);
  });
  document.querySelectorAll('#lm-jeu .lm-couleurs .lm-couleur').forEach((b, i) => {
    const oui = LM_COULEURS[i].id === look.couleur; b.classList.toggle('lm-choisi', oui); b.setAttribute('aria-checked', oui);
  });
  const bouton = document.querySelector('#lm-jeu .lm-look .lm-btn-or');
  if (bouton) bouton.disabled = !(look.style && look.couleur);
  if (lm.rendu3d) lm.rendu3d.apercu(document.getElementById('lm-apercu'), look).then(() => lm.rendu3d.saluerApercu()).catch(() => {});
}
function lmCommencerDate(passer) {
  const p = lm.partie, look = lm.lookEnCours || {};
  const effet = passer ? LuxMatchCore.choisirLook(p, null, null) : LuxMatchCore.choisirLook(p, look.style, look.couleur);
  p.lookChoisi = passer ? null : { style: look.style, couleur: look.couleur };
  lm.lookEnCours = null;
  LuxMatchCore.commencerDate(p);
  lm.effetLookAAnnoncer = passer ? null : effet;
  lmRendre();
}

// ── RENDEZ-VOUS
function lmRendreDate(box) {
  const p = lm.partie;
  box.innerHTML =
    '<div class="lm-date">' +
      '<div class="lm-scene" id="lm-scene"><div class="lm-scene-attente">Le café ouvre ses portes…</div></div>' +
      '<div class="lm-hud">' +
        '<button type="button" class="lm-icone-btn" onclick="lmQuitter()" aria-label="Quitter le rendez-vous">' + lmIcone('retour') + '</button>' +
        '<div class="lm-jauges">' +
          '<div class="lm-jauge lm-jauge-aff"><span>' + lmIcone('coeur') + 'Affinité</span><b id="lm-aff-val">' + p.affinity + '</b><i><em id="lm-aff" style="width:' + p.affinity + '%"></em></i></div>' +
          '<div class="lm-jauge lm-jauge-sus"><span>' + lmIcone('oeil') + 'Suspicion</span><b id="lm-sus-val">' + p.suspicion + '</b><i><em id="lm-sus" style="width:' + p.suspicion + '%"></em></i></div>' +
        '</div>' +
        '<button type="button" class="lm-icone-btn" onclick="lmMoi(true)" aria-label="Mon profil (Alex)">' + lmIcone('moi') + '</button>' +
        '<button type="button" class="lm-tel-btn" id="lm-tel-btn" onclick="lmOuvrirTelephoneDate()" aria-label="Ouvrir le téléphone">' + lmIcone('tel') + '<span id="lm-batterie">' + Math.ceil(p.battery) + '%</span></button>' +
      '</div>' +
      '<div class="lm-demo" aria-hidden="true">DÉMO · textes LU en relecture</div>' +
      '<div class="lm-feedback" id="lm-feedback" aria-live="polite"></div>' +
      '<div class="lm-bas">' +
        '<div class="lm-bulle" id="lm-bulle"></div>' +
        '<div class="lm-reponses" id="lm-reponses"></div>' +
        lmBoutonAide() +
      '</div>' +
      '<div class="lm-panneau" id="lm-tel-date" hidden></div>' +
      '<div class="lm-panneau lm-moi" id="lm-moi" hidden></div>' +
    '</div>';
  const scene = document.getElementById('lm-scene');
  lmObtenir3D().then(m => m.date(scene, p.profil, p.lookChoisi)).then(() => {
    const t = scene.querySelector('.lm-scene-attente'); if (t) t.remove();
    if (lm.rendu3d) lm.rendu3d.reagir('parle');
  }).catch(() => {
    scene.classList.add('lm-scene-2d');
    const t = scene.querySelector('.lm-scene-attente');
    if (t) t.innerHTML = lmImage(p.profil, 'Idle', '#3a2a55', 'lm-scene-portrait');
  });
  lmMajDialogue();
  if (lm.effetLookAAnnoncer) {
    const e = lm.effetLookAAnnoncer; lm.effetLookAAnnoncer = null;
    lmFeedback([{ texte: 'LOOK ' + (e > 0 ? '+' : '') + e + ' ♥', classe: e > 0 ? 'lm-plus' : 'lm-moins' }]);
  }
}
function lmNomSpeaker() { return lm.partie.profil.name; }
function lmMajDialogue() {
  const p = lm.partie, bulle = document.getElementById('lm-bulle'), rep = document.getElementById('lm-reponses');
  if (!bulle || !rep) return;
  const e = p.courant;
  if (!e) { bulle.innerHTML = ''; rep.innerHTML = ''; return; }
  const lu = e.prompt.lu, fr = e.prompt.fr;
  bulle.innerHTML = '<span class="lm-speaker">' + lmEchapper(lmNomSpeaker()) + (e.type === 'piege' ? ' <em>· imprévu !</em>' : e.type === 'rappel' ? ' <em>· elle vérifie…</em>' : '') + '</span>' +
    (lu ? '<p class="lm-lu" lang="lb">' + lmEchapper(lu) + '</p>' : '') +
    ((lm.aideFr || !lu) ? '<p class="lm-fr">' + lmEchapper(fr) + '</p>' : '');
  rep.innerHTML = e.choix.map(c => {
    const texteLu = c.lu || c.luDraft || c.text || '';
    const texteFr = c.fr || c.meaningFr || '';
    const action = !texteLu;
    return '<button type="button" class="lm-reponse' + (action ? ' lm-action' : '') + '" onclick="lmRepondre(\'' + lmEchapper(c.id) + '\')">' +
      (action ? '<span class="lm-fr">' + lmEchapper(texteFr) + '</span>'
        : '<span class="lm-lu" lang="' + (c.text ? 'pt' : 'lb') + '">' + lmEchapper(texteLu) + '</span>' + (lm.aideFr && texteFr ? '<span class="lm-fr">' + lmEchapper(texteFr) + '</span>' : '')) +
      '</button>';
  }).join('');
}
function lmMajJauges() {
  const p = lm.partie;
  const maj = (id, v) => { const b = document.getElementById(id); const t = document.getElementById(id + '-val'); if (b) b.style.width = v + '%'; if (t) t.textContent = v; };
  maj('lm-aff', p.affinity); maj('lm-sus', p.suspicion);
}
// Messages arcade (police pixel) au-dessus de la scène.
function lmFeedback(lignes) {
  const box = document.getElementById('lm-feedback');
  if (!box) return;
  box.innerHTML = lignes.map(l => '<b class="' + l.classe + '">' + lmEchapper(l.texte) + '</b>').join('');
  box.classList.remove('lm-visible'); void box.offsetWidth; box.classList.add('lm-visible');
}
function lmToast(texte) {
  const t = document.createElement('div');
  t.className = 'lm-toast'; t.textContent = texte;
  const box = lmBox(); if (!box) return;
  box.appendChild(t); setTimeout(() => t.remove(), 2600);
}

function lmRepondre(choixId) {
  const p = lm.partie;
  if (!p || p.phase !== 'date' || !p.courant || lm.attente) return;
  const r = LuxMatchCore.repondre(p, choixId);
  if (!r) return;
  lmMajJauges();
  // Messages : affinité, suspicion, contradiction.
  const lignes = [];
  if (r.contradiction) lignes.push({ texte: 'CONTRADICTION !', classe: 'lm-alerte' });
  if (r.affinity) lignes.push({ texte: (r.affinity > 0 ? '+' : '') + r.affinity + ' ♥', classe: r.affinity > 0 ? 'lm-plus' : 'lm-moins' });
  if (r.suspicion > 0) lignes.push({ texte: 'SUSPICION +' + r.suspicion, classe: 'lm-sus' });
  if (r.suspicion < 0) lignes.push({ texte: 'SUSPICION ' + r.suspicion, classe: 'lm-plus' });
  if (lignes.length) lmFeedback(lignes);
  // Réaction 3D et son.
  let reaction = r.visuel ? LM_VISUELS[r.visuel] : null;
  if (!reaction) reaction = r.contradiction ? 'surprise' : r.affinity >= 6 ? 'joie' : r.affinity > 0 ? 'pas_mal' : r.affinity <= -3 ? 'deception' : null;
  if (lm.rendu3d && reaction) lm.rendu3d.reagir(reaction);
  LuxMatchSon.jouer(r.visuel === 'record_scratch' || r.contradiction ? 'scratch' : r.langue === false ? 'faux' : r.affinity > 0 ? 'bien' : 'bof');
  // Panneau à lire (correction de langue, réaction d'imprévu, contradiction) ou suite automatique.
  const rep = document.getElementById('lm-reponses'), bulle = document.getElementById('lm-bulle');
  const aLire = r.correction || r.reaction || r.finAnticipee;
  if (bulle) bulle.innerHTML = '<span class="lm-speaker">Toi</span><p class="lm-lu" lang="lb">' + lmEchapper(r.choix.lu || r.choix.luDraft || r.choix.text || r.choix.fr) + '</p>';
  if (rep) rep.innerHTML = aLire ? lmHtmlLecture(r) : '';
  if (aLire) { lm.attente = 'lecture'; return; }
  lm.attente = 'auto';
  lm.feedbackTimer = setTimeout(lmContinuer, 1300);
}
function lmHtmlLecture(r) {
  let html = '<div class="lm-lecture">';
  if (r.correction) {
    html += '<p class="lm-correction-titre">Petite faute de luxembourgeois</p>' +
      '<p class="lm-faux" lang="lb">✗ ' + lmEchapper(r.choix.lu) + '</p>' +
      (r.correction.lu ? '<p class="lm-juste" lang="lb">✓ ' + lmEchapper(r.correction.lu) + '</p>' : '') +
      '<p class="lm-fr">' + lmEchapper(r.correction.fr) + '</p>';
  }
  if (r.reaction) {
    const reac = typeof r.reaction === 'string' ? { fr: r.reaction } : r.reaction;
    html += '<p class="lm-reaction">' + (reac.lu ? '<span lang="lb">' + lmEchapper(reac.lu) + '</span>' : '') + '<span class="lm-fr">' + lmEchapper(reac.fr) + '</span></p>';
  }
  if (r.finAnticipee) html += '<p class="lm-reaction"><span class="lm-fr">' + lmEchapper(lm.partie.profil.name) + ' se lève et prend son manteau…</span></p>';
  return html + '<button type="button" class="lm-btn lm-btn-or" onclick="lmContinuer()">Continuer ▸</button></div>';
}
function lmContinuer() {
  clearTimeout(lm.feedbackTimer);
  lm.attente = null;
  const p = lm.partie;
  if (!p || !lmVueActive()) return;
  LuxMatchCore.continuer(p);
  if (p.phase !== 'date') { lmFermerPanneaux(); lmTerminer(); return; }
  lmMajDialogue();
  if (lm.rendu3d) lm.rendu3d.reagir('parle');
}

// Téléphone pendant le date : -5 % par seconde ouverte (temps actif uniquement).
function lmOuvrirTelephoneDate() {
  const p = lm.partie;
  if (!p || p.phase !== 'date') return;
  const evenement = LuxMatchCore.ouvrirTelephone(p);
  if (evenement === 'batterie_vide') { lmToast('Batterie vide : ton téléphone est éteint.'); LuxMatchSon.jouer('vide'); return; }
  LuxMatchSon.jouer('tel');
  if (evenement === 'piege_telephone') lmToast(p.profil.name + ' a remarqué ton téléphone…');
  if (evenement === 'malus_telephone') { lmFeedback([{ texte: '-5 ♥', classe: 'lm-moins' }]); lmMajJauges(); if (lm.rendu3d) lm.rendu3d.reagir('froid'); }
  lm.app = null;
  const panneau = document.getElementById('lm-tel-date');
  if (panneau) panneau.hidden = false;
  lmMajTelephoneDate();
  lmDemarrerBatterie();
}
function lmMajTelephoneDate() {
  const p = lm.partie, panneau = document.getElementById('lm-tel-date');
  if (!panneau || panneau.hidden) return;
  const niveau = Math.ceil(p.battery);
  panneau.innerHTML = '<div class="lm-tel-date-barre' + (niveau < 20 ? ' lm-faible' : '') + '"><span>Batterie <b id="lm-batterie-tel">' + niveau + '%</b></span><i><em id="lm-batterie-jauge" style="width:' + niveau + '%"></em></i></div>' +
    lmTelephone('<div class="lm-tel-defile">' + lmContenuApps(p.profil, true) + '</div>', niveau < 20 ? 'lm-tel-faible' : '') +
    '<button type="button" class="lm-btn lm-btn-or" onclick="lmFermerTelephoneDate()">Ranger le téléphone</button>';
}
function lmFermerTelephoneDate() {
  const p = lm.partie;
  if (p) LuxMatchCore.fermerTelephone(p);
  lmArreterBatterie();
  const panneau = document.getElementById('lm-tel-date');
  if (panneau) panneau.hidden = true;
  lmMajBatterie();
}
function lmDemarrerBatterie() {
  lmArreterBatterie();
  let dernier = performance.now();
  const image = maintenant => {
    const p = lm.partie;
    if (!p || p.phase !== 'date' || !p.telephoneOuvert || !lmVueActive()) { lm.boucleBatterie = null; return; }
    lm.boucleBatterie = requestAnimationFrame(image);
    const dt = (maintenant - dernier) / 1000; dernier = maintenant;
    if (document.hidden) return; // appli masquée : aucune décharge
    if (LuxMatchCore.avancerTemps(p, dt) === 'batterie_vide') {
      LuxMatchSon.jouer('vide');
      lmFermerTelephoneDate();
      lmToast('Plus de batterie ! Il faudra compter sur ta mémoire.');
      return;
    }
    lmMajBatterie();
  };
  lm.boucleBatterie = requestAnimationFrame(image);
}
function lmArreterBatterie() { if (lm.boucleBatterie) cancelAnimationFrame(lm.boucleBatterie); lm.boucleBatterie = null; }
function lmMajBatterie() {
  const p = lm.partie; if (!p) return;
  const niveau = Math.ceil(p.battery);
  const b = document.getElementById('lm-batterie'); if (b) b.textContent = niveau + '%';
  const bt = document.getElementById('lm-batterie-tel'); if (bt) bt.textContent = niveau + '%';
  const j = document.getElementById('lm-batterie-jauge'); if (j) j.style.width = niveau + '%';
  const btn = document.getElementById('lm-tel-btn'); if (btn) { btn.classList.toggle('lm-faible', niveau < 20); btn.classList.toggle('lm-vide', niveau <= 0); }
  const barre = document.querySelector('#lm-tel-date .lm-tel-date-barre'); if (barre) barre.classList.toggle('lm-faible', niveau < 20);
}
// Rappel de son propre profil (hors batterie) : la vérité, pas ce qu'on a raconté.
function lmMoi(ouvrir) {
  const panneau = document.getElementById('lm-moi');
  if (!panneau) return;
  panneau.hidden = !ouvrir;
  if (!ouvrir) return;
  const a = lm.partie.persona;
  panneau.innerHTML = '<div class="lm-moi-carte"><h3>Toi : ' + lmEchapper(a.name) + '</h3><ul>' +
    '<li><span>Âge</span><b>' + a.age + ' ans</b></li><li><span>Origine</span><b lang="lb">' + lmEchapper(a.origin) + '</b></li>' +
    '<li><span>Ville</span><b>' + lmEchapper(a.city) + '</b></li><li><span>Métier</span><b lang="lb">' + lmEchapper(a.job) + '</b></li>' +
    '<li><span>Langue</span><b lang="lb">' + a.languages.map(lmEchapper).join(', ') + '</b></li></ul>' +
    '<p>Ce que tu as raconté pendant le rendez-vous, à toi de t’en souvenir…</p>' +
    '<button type="button" class="lm-btn lm-btn-or" onclick="lmMoi(false)">Fermer</button></div>';
}
function lmFermerPanneaux() { lmFermerTelephoneDate(); lmMoi(false); }

// ── RÉSULTATS
function lmTerminer() {
  const p = lm.partie;
  lmEcrire('luxMatchParties', lmLire('luxMatchParties', 0) + 1);
  const record = lmLire('luxMatchRecord', 0);
  p.nouveauRecord = p.fin.score > record;
  if (p.nouveauRecord) lmEcrire('luxMatchRecord', p.fin.score);
  LuxMatchSon.jouer(p.fin.issue === 'nouveau_rdv' ? 'fin' : 'bof');
  if (p.fin.issue === 'nouveau_rdv' && lm.rendu3d) lm.rendu3d.reagir('joie');
  setTimeout(() => { if (lm.partie === p && lmVueActive()) lmRendre(); }, 900);
}
function lmRendreResultats(box) {
  const p = lm.partie, issue = LM_ISSUES[p.fin.issue];
  const expressions = LuxMatchCore.expressionsTravaillees(p);
  box.innerHTML = lmEntete() +
    '<div class="lm-resultats">' +
      '<div class="lm-res-titre lm-res-' + p.fin.issue + '">' + issue.titre + '</div>' +
      lmImage(p.profil, p.fin.issue === 'nouveau_rdv' ? 'Victory' : 'Idle', p.fin.issue === 'nouveau_rdv' ? '#5a2a55' : '#2a2438', 'lm-res-photo') +
      '<p class="lm-res-texte">' + lmEchapper(issue.texte) + '</p>' +
      '<div class="lm-res-stats">' +
        '<div><span>Affinité</span><b>' + p.affinity + '</b></div><div><span>Suspicion</span><b>' + p.suspicion + '</b></div>' +
        '<div><span>Luxembourgeois</span><b>' + p.fin.langue + ' %</b></div></div>' +
      '<div class="lm-res-score"><span>SCORE</span><b>' + p.fin.score + '</b>' + (p.nouveauRecord ? '<em>NOUVEAU RECORD</em>' : '<small>Record ' + lmLire('luxMatchRecord', 0) + '</small>') + '</div>' +
      (expressions.length ? '<h2 class="lm-section">Expressions du rendez-vous</h2><ul class="lm-expressions">' +
        expressions.map(e => '<li' + (e.faute ? ' class="lm-a-revoir"' : '') + '><span class="lm-q" lang="lb">' + lmEchapper(e.question.lu) + '</span>' +
          '<b lang="lb">' + lmEchapper(e.reponse.lu) + '</b><span>' + lmEchapper(e.reponse.fr) + (e.faute ? ' · <em>à revoir</em>' : '') + '</span></li>').join('') + '</ul>' : '') +
      '<div class="lm-actions"><button type="button" class="lm-btn lm-btn-or" onclick="lmNouvellePartie()">Nouveau match</button>' +
      '<button type="button" class="lm-btn lm-btn-lien" onclick="lmQuitter()">Retour aux jeux</button></div>' +
      '<p class="lm-demo-note">Démo : les répliques luxembourgeoises sont des brouillons en cours de vérification (LOD). Ta progression des leçons n’est pas modifiée.</p>' +
    '</div>';
  lmPreparerImages([[p.profil, p.fin.issue === 'nouveau_rdv' ? 'Victory' : 'Idle', p.fin.issue === 'nouveau_rdv' ? '#5a2a55' : '#2a2438']]);
}

// ─── Carte du hub Jeux ─────────────────────────────────────────────────────

// Préchargement discret depuis le hub : code 3D, animations et modèles des profils.
let lmPrechargeLance = false;
function lmPrecharger() {
  if (lmPrechargeLance) return;
  lmPrechargeLance = true;
  const lancer = () => import('./lux-match-3d.js?v=2')
    .then(() => window.LuxMatch3D.precharger(['Casual_Female', 'Casual2_Female', 'Casual3_Female', 'Suit_Female', 'Doctor_Female_Young', 'Casual_Male']))
    .catch(() => { lmPrechargeLance = false; });
  if (typeof requestIdleCallback === 'function') requestIdleCallback(lancer, { timeout: 2500 });
  else setTimeout(lancer, 800);
}
function luxMatchCarteHub() {
  lmPrecharger();
  return '<section class="jeux-carte lm-carte-hub" aria-labelledby="jeux-lm-titre">' +
    '<div class="jeux-decor lm-decor" aria-hidden="true"><span class="lm-decor-tel"></span><span class="lm-decor-coeur">♥</span></div>' +
    '<div class="jeux-carte-titre"><h2 id="jeux-lm-titre">Lux Match</h2><span class="jeux-etat lm-etat-demo">DÉMO</span></div>' +
    '<p>Swipe, enquête et rendez-vous en luxembourgeois. Assume tes mensonges !</p>' +
    '<div class="jeux-meta"><span><strong>≈ 4 min</strong> · A1.1</span><span>Record <b>' + lmLire('luxMatchRecord', 0) + '</b></span></div>' +
    '<button class="jeux-jouer lm-jouer-hub" type="button" onclick="ouvrirLuxMatch()">Jouer <span aria-hidden="true">→</span></button>' +
    '</section>';
}
