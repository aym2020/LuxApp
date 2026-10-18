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
// Bouton Retour du téléphone : on ajoute UNE entrée « garde » à l'historique du
// navigateur tant qu'il reste un écran précédent (ou un panneau ouvert). Le
// bouton Retour la retire : on fait alors notre propre retour, puis on remet
// la garde si besoin. À l'accueil, sans garde, Retour quitte l'app normalement.

const NIVEAU_VUE = {
  'view-dashboard': 0,
  'view-lessons': 1, 'view-review-setup': 1, 'view-lexique': 1, 'view-pieges': 1,
  'view-examens': 1, 'view-reglages': 1,
  'view-plecon': 2, 'view-lecon': 2,
  // L'introduction de mission est un écran à part entière (spec 18) : ce qu'on
  // ouvre depuis elle (unités, mission, 1re unité) s'empile au-dessus, et
  // Retour y ramène.
  'view-msintro': 3
};

let pileNav = [];          // [{ vue, scroll, lecon }]
let pileAvantAppui = null; // la pile au début de l'appui en cours (écrans intermédiaires)
let enRestauration = false;
let gardeHistorique = false;
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
    pileNav.push(entree);
    return;
  }

  // Un écran de navigation : l'activité en cours se termine.
  if (haut && estActivite(haut.vue)) pileNav.pop();
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

// Nom de l'écran précédent, pour les boutons « ← … ».
function nomEcran(e) {
  if (!e) return 'Accueil';
  const l = e.lecon != null && typeof lecons !== 'undefined' ? lecons.find(x => x.id === e.lecon) : null;
  const noms = {
    'view-dashboard': 'Accueil', 'view-lessons': 'Mon chemin', 'view-review-setup': 'Réviser',
    'view-lexique': 'Lexique', 'view-pieges': 'Mes pièges', 'view-examens': 'Sujets', 'view-reglages': 'Réglages'
  };
  if (noms[e.vue]) return noms[e.vue];
  if (e.vue === 'view-msintro') return 'Introduction';
  if (l) return 'Leçon ' + l.id;
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
  const saved = typeof loadRun === 'function' ? loadRun() : null;
  if (saved && pLecon && saved.leconId === pLecon.id) return saved.uniteId;
  if (quitte.vue === 'view-pintro' && pIntroUnite != null) return pIntroUnite;
  if (quitte.vue === 'view-mission') return 'mission';
  if (quitte.vue === 'view-pfin' && pResultat) return pResultat.uniteId;
  return null;
}

function retour() {
  fermerClavier();
  if (pileNav.length <= 1) {
    goDashboard();
    return;
  }
  const quitte = pileNav.pop();
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
  showView(e.vue);
  enRestauration = false;

  window.scrollTo(0, e.scroll || 0);
  if (e.vue === 'view-plecon' && cible != null) allerALaCarte(cible);
  if (e.vue === 'view-lessons' && cible != null && pLecon) montrerEtapeChemin(pLecon.id, cible);
}

// ─── BOUTON RETOUR DU TÉLÉPHONE (API History) ───────────────────────────────
function superpositionOuverte() {
  const cours = document.getElementById('cours-panel');
  return !!document.querySelector('.panneau') || !!(cours && !cours.classList.contains('hidden'));
}

// Ferme le panneau ouvert, s'il y en a un. Renvoie true si quelque chose a été fermé.
function fermerSuperposition() {
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

// Une seule entrée « garde » dans l'historique du navigateur, quand il y a où revenir.
function majGarde() {
  if (!window.history || !history.pushState) return;
  const besoin = pileNav.length > 1 || superpositionOuverte();
  if (besoin && !gardeHistorique) {
    history.pushState({ luxapp: 'garde' }, '');
    gardeHistorique = true;
  } else if (!besoin && gardeHistorique) {
    gardeHistorique = false;
    popsAIgnorer++;
    history.back();
  }
}

window.addEventListener('popstate', () => {
  if (popsAIgnorer > 0) { popsAIgnorer--; return; }
  gardeHistorique = false; // le navigateur vient de retirer la garde
  if (fermerSuperposition()) { majGarde(); return; }
  retour();
});
