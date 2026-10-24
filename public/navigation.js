// ─── NAVIGATION : HISTORIQUE ET BOUTON RETOUR ───────────────────────────────
// Règle : « Retour » ramène à l'écran réellement précédent, avec sa position.
//
// On garde une pile d'écrans (pileNav). Trois sortes d'écrans :
//   - niveau 0 : l'accueil (la racine) ;
//   - niveau 1 : les onglets (chemin, réviser, lexique, pièges, examens, réglages) ;
//   - niveau 2 : l'écran d'une leçon (liste des unités, ou leçon classique) ;
//   - les activités (intro, exercice, mission, fin, séance, examen) : une seule
//     à la fois, toujours en haut de la pile. Passer d'une activité à une autre
//     (intro → exercice → fin → unité suivante) remplace l'activité en haut.
// Retour depuis une activité = l'écran de navigation d'où on est parti.
//
// Écrans intermédiaires : quand un même appui affiche deux écrans à la suite
// (ex. ouvrir la leçon puis l'intro de l'unité), seul le dernier est noté.
//
// Bouton Retour du téléphone : l'historique du navigateur contient une entrée
// « garde » par écran précédent (et une de plus si un panneau est ouvert).
// Les gardes sont ajoutées pendant l'appui qui ouvre l'écran. Le bouton Retour
// en retire une : on fait notre propre retour sans en rajouter. Chrome Android
// saute les entrées ajoutées sans appui de l'utilisateur (après un Retour) :
// les remettre ferait quitter l'app au Retour suivant. À l'accueil, sans
// garde, Retour quitte l'app normalement.

const NIVEAU_VUE = {
  'view-dashboard': 0,
  'view-lessons': 1, 'view-review-setup': 1, 'view-lexique': 1, 'view-pieges': 1,
  'view-examens': 1, 'view-reglages': 1, 'view-jeux': 1, 'view-plus': 1,
  'view-plecon': 2, 'view-lecon': 2,
  // L'introduction de mission est un écran à part entière (spec 18) : ce qu'on
  // ouvre depuis elle (unités, mission, 1re unité) s'empile au-dessus, et
  // Retour y ramène.
  'view-msintro': 3
};

// Le navigateur ne replace pas lui-même la page après un Retour : il
// appliquerait, après notre propre placement, la position d'un autre écran (spec 25).
if (window.history && 'scrollRestoration' in history) history.scrollRestoration = 'manual';

let pileNav = [];          // [{ vue, scroll, lecon }]
let pileAvantAppui = null; // la pile au début de l'appui en cours (écrans intermédiaires)
let enRestauration = false;
// Après une actualisation, la page est rechargée sur l'entrée « garde » déjà
// posée (elle reste rattachée à la page) : on ne la rajoute pas (spec 44).
let gardesHistorique = (window.history && history.state && history.state.luxapp === 'garde')
  ? (history.state.n || 1) : 0; // nombre d'entrées « garde » au-dessus de l'entrée de départ
let popsAIgnorer = 0;

function estActivite(vue) {
  return NIVEAU_VUE[vue] === undefined;
}

function leconActuelleId() {
  return typeof pLecon !== 'undefined' && pLecon ? pLecon.id
    : (typeof currentLecon !== 'undefined' && currentLecon ? currentLecon.id : null);
}

// Appelée par showView() juste avant de changer d'écran.
function noterNavigation(vue) {
  if (enRestauration) return;

  if (pileAvantAppui) {
    // 2e écran du même appui : le précédent n'était qu'intermédiaire.
    pileNav = pileAvantAppui.slice();
  } else {
    // 1er écran de l'appui : on retient où on en était sur l'écran quitté.
    const haut = pileNav[pileNav.length - 1];
    if (haut) haut.scroll = window.scrollY;
    pileAvantAppui = pileNav.slice();
    Promise.resolve().then(() => { pileAvantAppui = null; majGarde(); });
  }

  const entree = { vue, scroll: 0, lecon: leconActuelleId() };
  const haut = pileNav[pileNav.length - 1];

  // Même écran (réaffichage) : rien de nouveau.
  if (haut && haut.vue === vue && (NIVEAU_VUE[vue] < 2 || haut.lecon === entree.lecon)) {
    haut.lecon = entree.lecon;
    return;
  }

  // Une activité : elle remplace l'activité déjà en haut.
  if (estActivite(vue)) {
    if (haut && estActivite(haut.vue)) pileNav.pop();
    // Une unité lancée (intro d'unité, exercice, fin) : l'introduction de la
    // mission est dépassée, Retour n'y ramène plus (spec 38). La mission
    // (« Tente ta chance ») reste de l'exploration : l'introduction est gardée.
    if (vue !== 'view-mission') oublierIntroMission(entree.lecon);
    pileNav.push(entree);
    return;
  }

  // Un écran de navigation : l'activité en cours se termine.
  if (haut && estActivite(haut.vue)) pileNav.pop();
  // Depuis Plus, les rubriques sont de vrais sous-écrans, pas d'autres onglets.
  // Leur niveau général demeure 1 quand on les ouvre ailleurs dans l'application.
  if (pileNav[pileNav.length - 1]?.vue === 'view-plus' &&
      ['view-lexique', 'view-pieges', 'view-reglages', 'view-examens'].includes(vue)) {
    pileNav.push(entree);
    return;
  }
  const niveau = NIVEAU_VUE[vue];
  // Depuis l'introduction : « Voir les unités » s'empile (exploration).
  const dessus = pileNav[pileNav.length - 1];
  if (vue === 'view-plecon' && dessus && dessus.vue === 'view-msintro' && dessus.lecon === entree.lecon) {
    pileNav.push(entree);
    return;
  }
  // Déjà dans la pile (ex. « Retour à la leçon ») : on y revient.
  const i = pileNav.findIndex(e => e.vue === vue && (niveau < 2 || e.lecon === entree.lecon));
  if (i !== -1) {
    pileNav = pileNav.slice(0, i + 1);
    return;
  }
  // Sinon on garde seulement les écrans de niveau inférieur (un onglet repart de l'accueil).
  pileNav = pileNav.filter(e => NIVEAU_VUE[e.vue] !== undefined && NIVEAU_VUE[e.vue] < niveau);
  if (niveau > 0 && !pileNav.length) pileNav.push({ vue: 'view-dashboard', scroll: 0, lecon: null });
  pileNav.push(entree);
}

// Termine l'appui en cours : le prochain écran affiché est noté comme un
// nouvel écran, pas comme un écran intermédiaire. Pour enchaîner plusieurs
// écrans d'un coup en gardant un historique réel (mode recette, spec 49).
function finAppuiNavigation() {
  pileAvantAppui = null;
}

// Retire de l'historique l'introduction de mission de cette leçon (spec 38) :
// elle est consommée (unité lancée ou leçon validée par la mission). Les
// autres écrans (accueil, chemin, leçon) restent en place.
function oublierIntroMission(leconId) {
  const garder = e => !(e.vue === 'view-msintro' && e.lecon === leconId);
  pileNav = pileNav.filter(garder);
  if (pileAvantAppui) pileAvantAppui = pileAvantAppui.filter(garder);
}

// Nom de l'écran précédent, pour les boutons « ← … ».
function nomEcran(e) {
  if (!e) return 'Accueil';
  const l = e.lecon != null && typeof lecons !== 'undefined' ? lecons.find(x => x.id === e.lecon) : null;
  const noms = {
    'view-dashboard': 'Accueil', 'view-lessons': 'Mon chemin', 'view-review-setup': "S'entraîner",
    'view-lexique': 'Lexique', 'view-pieges': 'Mes pièges', 'view-examens': 'Sujets', 'view-reglages': 'Réglages', 'view-jeux': 'Jeux', 'view-plus': 'Plus'
  };
  if (noms[e.vue]) return noms[e.vue];
  if (e.vue === 'view-msintro') return 'Introduction';
  if (l) return 'Leçon ' + numLecon(l);
  return 'Retour';
}

function ecranPrecedent() {
  return pileNav[pileNav.length - 2] || null;
}

// Les boutons [data-retour] de l'écran affiché disent où ils ramènent.
function majBoutonsRetour(vue) {
  const nom = nomEcran(ecranPrecedent());
  document.querySelectorAll('#' + vue + ' [data-retour]').forEach(b => {
    b.setAttribute('aria-label', 'Retour à ' + nom);
    const texte = b.querySelector('.retour-txt');
    if (texte) texte.textContent = nom;
  });
}

// ─── RETOUR ─────────────────────────────────────────────────────────────────
// Où se placer en revenant d'une activité : l'unité, la mission ou « toute la leçon ».
function cibleDeRetour(quitte) {
  if (!quitte || !estActivite(quitte.vue)) return null;
  // On regarde l'écran réellement quitté (spec 25) : une ancienne partie
  // encore en mémoire ne doit pas décider de la carte.
  if (quitte.vue === 'view-mission') return 'mission';
  if (quitte.vue === 'view-pintro') return pIntroUnite;
  if (quitte.vue === 'view-pfin') return pResultat ? pResultat.uniteId : null;
  if (quitte.vue === 'view-parcours') {
    // La partie qu'on vient de quitter (principale ou libre).
    const saved = (typeof run !== 'undefined' && run) || (typeof loadRun === 'function' ? loadRun() : null);
    if (saved && pLecon && saved.leconId === pLecon.id) return saved.uniteId;
  }
  return null;
}

function retour() {
  fermerClavier();
  // Depuis le résultat d'un examen : toujours la liste des sujets (spec 49),
  // même si l'historique est incomplet.
  const vueActive = document.querySelector('.view.active');
  if (vueActive && vueActive.id === 'view-examen-result') {
    retourSujets();
    majGarde();
    return;
  }
  if (pileNav.length <= 1) {
    goDashboard();
    return;
  }
  const quitte = pileNav[pileNav.length - 1];
  // Depuis un écran de résultat (fin d'étape, d'unité, de rattrapage, de
  // mission) : toujours le chemin principal, la leçon dépliée et cadrée,
  // jamais la liste des unités restée dans l'historique (specs 44-45).
  const finMission = quitte.vue === 'view-mission' && typeof ms !== 'undefined' && ms && ms.bilan;
  if ((quitte.vue === 'view-pfin' && pResultat) || finMission) {
    cheminSurLecon(finMission ? pLecon.id : pResultat.leconId);
    majGarde();
    return;
  }
  pileNav.pop();
  restaurerEcran(pileNav[pileNav.length - 1], cibleDeRetour(quitte));
  majGarde();
}

// Réaffiche un écran de la pile, sans le noter de nouveau, à sa position.
function restaurerEcran(e, cible) {
  if (e.lecon != null && NIVEAU_VUE[e.vue] >= 2) {
    pLecon = lecons.find(x => x.id === e.lecon) || pLecon;
    currentLecon = pLecon;
  }
  enRestauration = true;
  if (e.vue === 'view-dashboard') renderAccueil(false);
  else if (e.vue === 'view-lessons') {
    if (cible != null && pLecon) ouvrirLeconDansChemin(pLecon.id);
    renderLessons();
  } else if (e.vue === 'view-plecon') renderParcoursLecon();
  else if (e.vue === 'view-msintro') renderIntroMission();
  else if (e.vue === 'view-examens') renderExamens(); // meilleur score à jour après un sujet
  else if (e.vue === 'view-jeux') renderJeuxHub(); // record Survie actualisé
  else if (e.vue === 'view-plus') renderPlusPage();
  showView(e.vue);
  enRestauration = false;

  // Un seul placement : sur la carte quittée, sinon à la position retenue.
  if (e.vue === 'view-plecon' && cible != null) allerALaCarte(cible);
  else {
    window.scrollTo(0, e.scroll || 0);
    if (e.vue === 'view-lessons' && cible != null && pLecon) montrerEtapeChemin(pLecon.id, cible);
  }
}

// ─── ACTUALISATION : GARDER L'ÉCRAN (spec 44) ───────────────────────────────
// Quand la page se ferme (tirer pour actualiser sur Android, F5…), on note
// l'écran affiché dans sessionStorage : propre à cet onglet, effacé à sa
// fermeture, jamais envoyé au cloud. Après le rechargement et la synchro,
// init() rouvre ce même écran une seule fois. Les réponses déjà validées sont
// dans la progression (exercice) ou dans la note (mission en cours).
// Impossible (autre profil, leçon disparue, écran inconnu) → l'accueil, comme avant.
const CLE_NAVIGATION = 'luxNavigation';
const DUREE_NAVIGATION = 12 * 3600 * 1000; // au-delà, on repart de l'accueil
let navigationRestauree = false;


function sauverNavigation() {
  const vue = document.querySelector('.view.active');
  if (!vue) return;
  const haut = pileNav[pileNav.length - 1];
  if (haut) haut.scroll = window.scrollY;
  const enMission = vue.id === 'view-mission' && typeof ms !== 'undefined' && ms && !ms.bilan;
  const etat = {
    profil: currentStorageProfile, // isolation : un autre compte ne reprend jamais cet écran
    quand: Date.now(),
    vue: vue.id,
    scroll: window.scrollY,
    lecon: leconActuelleId(),
    ouverte: typeof cheminLeconOuverte === 'undefined' ? 'defaut' : cheminLeconOuverte,
    unite: typeof pIntroUnite !== 'undefined' ? pIntroUnite : null,
    libre: !!(typeof run !== 'undefined' && run && run.libre),
    mission: enMission ? { idx: ms.idx, essais: ms.essais, dernierEssai: ms.dernierEssai, resultats: ms.resultats,
      formesValidees: ms.formesValidees, tentative: ms.tentative, vies: ms.vies, coquille: ms.coquille } : null,
    decouverte: vue.id === 'view-decouverte' && typeof decouverteActive !== 'undefined' && decouverteActive
      ? { uniteId: decouverteActive.uniteId, index: decouverteActive.index } : null,
    pile: pileNav
  };
  try { sessionStorage.setItem(CLE_NAVIGATION, JSON.stringify(etat)); } catch (e) { /* stockage indisponible */ }
}

window.addEventListener('pagehide', sauverNavigation);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') sauverNavigation();
});

function lireNavigation() {
  try {
    const etat = JSON.parse(sessionStorage.getItem(CLE_NAVIGATION));
    sessionStorage.removeItem(CLE_NAVIGATION); // une seule restauration par chargement
    return etat;
  } catch (e) {
    return null;
  }
}

// Appelée à la fin de init(). Renvoie true si l'écran a été rouvert.
async function restaurerNavigation() {
  if (navigationRestauree) return false;
  const ok = await essayerRestauration();
  navigationRestauree = true; // la garde de l'historique peut maintenant suivre l'écran
  majGarde();
  return ok;
}

async function essayerRestauration() {
  const etat = lireNavigation();
  if (!etat || etat.profil !== currentStorageProfile || etat.vue === 'view-dashboard') return false;
  if (!(Date.now() - etat.quand < DUREE_NAVIGATION)) return false;
  const l = etat.lecon != null ? lecons.find(x => x.id === etat.lecon) : null;
  if (!(await rouvrirEcran(etat, l))) return false;

  // Fin des appuis en cours, puis l'historique d'avant l'actualisation s'il
  // mène bien à cet écran (Retour se comporte comme avant).
  await new Promise(r => setTimeout(r, 0));
  const actif = document.querySelector('.view.active').id;
  const pile = Array.isArray(etat.pile) ? etat.pile : [];
  if (pile.length && pile[pile.length - 1].vue === actif) pileNav = pile;
  majBoutonsRetour(actif);
  return true;
}

// Rouvre l'écran noté. Ce qui n'est pas gardé (une révision, un examen en
// cours, un résultat affiché) rouvre l'écran de départ le plus proche.
async function rouvrirEcran(etat, l) {
  const pause = () => new Promise(r => setTimeout(r, 0));
  const parcours = l && isParcoursLecon(l);
  switch (etat.vue) {
    case 'view-lessons':
      cheminLeconOuverte = etat.ouverte === 'defaut' ? undefined : etat.ouverte;
      renderLessons();
      showView('view-lessons');
      remettreScroll(etat.scroll);
      return true;
    case 'view-review-setup':
    case 'view-session':
      openReviewSetup();
      return true;
    case 'view-jeux': ouvrirJeux(); return true;
    case 'view-survie': ouvrirJeux(); return true; // partie chronométrée non restaurée
    case 'view-lexique': openLexique(); return true;
    case 'view-pieges': openPieges(); return true;
    case 'view-reglages': openReglages(); return true;
    case 'view-plus': ouvrirPlus(); return true;
    case 'view-examens':
    case 'view-examen':
    case 'view-examen-result':
      openExamens();
      return true;
    case 'view-lecon':
      if (!l) return false;
      openLecon(l);
      return true;
    case 'view-msintro':
      if (!parcours) return false;
      ouvrirIntroMission(l);
      return true;
    case 'view-plecon':
    case 'view-pfin':
      if (!parcours) return false;
      openParcoursLecon(l);
      if (etat.vue === 'view-plecon') remettreScroll(etat.scroll);
      return true;
    case 'view-pintro':
      if (!parcours) return false;
      openParcoursLecon(l);
      await pause();
      if (etat.unite != null && trouverUnite(l, etat.unite)) openIntro(etat.unite);
      return true;
    case 'view-decouverte': {
      if (!parcours || l.id !== 0 || !etat.decouverte ||
          !decouvertePour(l, etat.decouverte.uniteId).length) return false;
      openParcoursLecon(l);
      await pause();
      demarrerDecouverte(etat.decouverte.uniteId, etat.decouverte.index);
      return true;
    }
    case 'view-parcours': {
      if (!parcours) return false;
      openParcoursLecon(l);
      const partie = loadRun(etat.libre);
      if (!partie || partie.leconId !== l.id) return true; // plus de partie : la leçon
      await pause();
      reprendreRun(etat.libre);
      return true;
    }
    case 'view-mission':
      if (!parcours || !l.mission || !l.scene) return false;
      openParcoursLecon(l);
      if (!etat.mission) return true; // mission finie : son résultat est déjà enregistré
      await pause();
      reprendreMission(etat.mission);
      return true;
  }
  return false;
}

// Remet la position une fois le rendu stabilisé (polices, images), sauf si
// l'utilisateur a déjà touché l'écran.
function remettreScroll(y) {
  let touche = false;
  const stop = () => { touche = true; };
  ['pointerdown', 'wheel', 'touchmove', 'keydown'].forEach(e => window.addEventListener(e, stop, { once: true, passive: true, capture: true }));
  const placer = () => { if (!touche) window.scrollTo(0, y || 0); };
  placer();
  requestAnimationFrame(() => requestAnimationFrame(placer));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placer);
  setTimeout(placer, 400);
}

// ─── BOUTON RETOUR DU TÉLÉPHONE (API History) ───────────────────────────────
function superpositionOuverte() {
  if (typeof infoInviteEstOuverte === 'function' && infoInviteEstOuverte()) return true; // SPEC 76
  if (typeof dialogueEstOuvert === 'function' && dialogueEstOuvert()) return true; // SPEC 66
  if (typeof portailFormulaireOuvert === 'function' && portailFormulaireOuvert()) return true; // SPEC 66
  if (typeof bulleContexteOuverte === 'function' && (bulleContexteOuverte() || exemplesOuverts())) return true; // SPEC 71
  const amelioration = document.getElementById('chemin-amelioration-panel');
  if (amelioration && !amelioration.classList.contains('hidden')) return true;
  const cours = document.getElementById('cours-panel');
  return !!document.querySelector('.panneau') || !!(cours && !cours.classList.contains('hidden'));
}

// Ferme le panneau ouvert, s'il y en a un. Renvoie true si quelque chose a été fermé.
function fermerSuperposition() {
  if (typeof fermerInfoInvite === 'function' && fermerInfoInvite()) return true; // SPEC 76
  if (typeof dialogueEstOuvert === 'function' && dialogueEstOuvert()) { fermerDialogue(false); return true; }
  // SPEC 66 : inscription ou connexion → retour à la bienvenue.
  if (typeof portailFormulaireOuvert === 'function' && portailFormulaireOuvert()) { portailRetourBienvenue(); return true; }
  // SPEC 71 : la bulle de contexte, puis l'écran d'exemples (au-dessus du panneau Cours).
  if (typeof fermerBulleContexte === 'function' && (fermerBulleContexte() || fermerExemples())) return true;
  const amelioration = document.getElementById('chemin-amelioration-panel');
  if (amelioration && !amelioration.classList.contains('hidden')) { fermerAmeliorationChemin(); return true; }
  if (document.querySelector('.panneau')) { fermerPanneau(); return true; }
  const cours = document.getElementById('cours-panel');
  if (cours && !cours.classList.contains('hidden')) { fermerCours(); return true; }
  return false;
}

// Après l'ouverture ou la fermeture d'un panneau : la garde est mise à jour
// une fois l'appui terminé (jamais au milieu d'un changement d'écran).
function programmerGarde() {
  Promise.resolve().then(majGarde);
}

// Autant d'entrées « garde » dans l'historique du navigateur que d'écrans où revenir.
// Pas avant la fin du démarrage (restauration comprise, spec 44) : sinon la
// garde serait retirée puis remise en même temps, et Retour quitterait l'app.
function majGarde() {
  if (!window.history || !history.pushState || !navigationRestauree) return;
  const besoin = Math.max(0, pileNav.length - 1) + (superpositionOuverte() ? 1 : 0);
  while (gardesHistorique < besoin) {
    gardesHistorique++;
    history.pushState({ luxapp: 'garde', n: gardesHistorique }, '');
  }
  if (gardesHistorique > besoin) {
    // Recette : les préparations enchaînent automatiquement plusieurs écrans.
    // history.go(-N) pouvait remonter au-delà de l'entrée initiale et ouvrir
    // about:blank / l'application précédente dans l'onglet Android.
    // Remettre le compteur logique à jour SANS naviguer dans l'historique réel.
    // Le mode public conserve son comportement de retour ordinaire.
    if (window.APP_CONFIG && window.APP_CONFIG.RECETTE) {
      gardesHistorique = besoin;
      history.replaceState(besoin ? { luxapp: 'garde', n: besoin } : { luxapp: 'racine' }, '');
    } else {
      // Retour en arrière de plusieurs entrées d'un coup : un seul popstate.
      popsAIgnorer++;
      history.go(besoin - gardesHistorique);
      gardesHistorique = besoin;
    }
  }
}

window.addEventListener('popstate', e => {
  if (popsAIgnorer > 0) { popsAIgnorer--; return; }
  // Le navigateur vient de retirer une garde : on lit où on est réellement.
  gardesHistorique = e.state && e.state.luxapp === 'garde' ? (e.state.n || 1) : 0;
  if (fermerSuperposition()) { majGarde(); return; }
  retour();
});
