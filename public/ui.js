// ─── CONFORT MOBILE ET LISIBILITÉ (S12) ────────────────────────────────────
// Deux petites aides valables sur tous les écrans.

// 1. Clavier du téléphone : empêcher le scrollIntoView('center') qui
//    faisait disparaître la question derrière le haut de l'écran.
//    On adapte la hauteur de l'exercice à la surface visible au-dessus du clavier.
const CHAMPS_EXERCICE = '#mc-input, #pc-ecr-input, #ms-input, #session-input, #xee-input';
const fenetreVisuelle = window.visualViewport;
let hauteurSansClavier = fenetreVisuelle ? fenetreVisuelle.height : window.innerHeight;
let dispositionClavierActive = false;

function actualiserClavierMobile() {
  const champ = document.activeElement;
  const hauteur = fenetreVisuelle ? fenetreVisuelle.height : window.innerHeight;
  const saisieExercice = !!(champ && champ.matches &&
    champ.matches(CHAMPS_EXERCICE) &&
    champ.closest('#view-parcours.active, #view-mission.active, #view-session.active, #view-examen.active'));
  const clavierOuvert = saisieExercice && hauteurSansClavier - hauteur > 140;

  if (!clavierOuvert) {
    document.body.classList.remove('clavier-actif');
    document.body.style.removeProperty('--clavier-vh');
    document.body.style.removeProperty('--clavier-vtop');
    if (!saisieExercice) hauteurSansClavier = Math.max(hauteurSansClavier, hauteur);
    dispositionClavierActive = false;
    return;
  }

  document.body.style.setProperty('--clavier-vh', Math.round(hauteur) + 'px');
  document.body.style.setProperty('--clavier-vtop',
    Math.round(fenetreVisuelle ? fenetreVisuelle.offsetTop : 0) + 'px');
  document.body.classList.add('clavier-actif');
  if (!dispositionClavierActive) {
    // SPEC 95 : Leçon et S'entraîner défilent dans .exo-scroll ; le bouton est
    // dans le pied, juste au-dessus du clavier : seul le champ doit rester visible.
    const zone = champ.closest('#view-parcours, #view-session')?.querySelector('.exo-scroll') ||
      champ.closest('#view-examen')?.querySelector('.ex-body');
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      // L'examen garde sa position de saisie quand le clavier s'ouvre.
      if (champ.id === 'xee-input') montrerChampExamen(champ);
      else if (zone && zone.classList.contains('exo-scroll')) montrerDansZone(zone, champ);
      else {
        if (zone) zone.scrollTop = 0;
        montrerChampSiCache(champ, hauteur);
      }
    });
  }
  dispositionClavierActive = true;
}

// Le champ de l'examen défile dans .ex-body, pas dans la page entière.
function montrerChampExamen(champ) {
  const zone = champ.closest('.ex-body');
  if (!zone) return;
  const r = champ.getBoundingClientRect();
  const visible = zone.getBoundingClientRect();
  const marge = 12;
  if (r.bottom > visible.bottom - marge)
    zone.scrollTop += r.bottom - visible.bottom + marge;
  else if (r.top < visible.top + marge)
    zone.scrollTop += r.top - visible.top - marge;
}

// SPEC 95 : faire défiler la zone de contenu (pas la page) juste assez pour voir le champ.
function montrerDansZone(zone, champ) {
  const r = champ.getBoundingClientRect();
  const visible = zone.getBoundingClientRect();
  const marge = 12;
  if (r.bottom > visible.bottom - marge) zone.scrollTop += r.bottom - visible.bottom + marge;
  else if (r.top < visible.top + marge) zone.scrollTop += r.top - visible.top - marge;
}

function montrerChampSiCache(champ, hauteurVisible) {
  if (!champ || !champ.getBoundingClientRect) return;
  const r = champ.getBoundingClientRect();
  if (r.top < 0 || r.bottom > hauteurVisible) champ.scrollIntoView({ block: 'nearest' });
}

// Fermer le clavier du téléphone (avant d'afficher une correction).
function fermerClavier() {
  const champ = document.activeElement;
  if (champ && (champ.tagName === 'INPUT' || champ.tagName === 'TEXTAREA') && champ.blur) champ.blur();
}

// Le clavier ne s'ouvre jamais tout seul sur téléphone : c'est l'utilisateur qui
// touche le champ. Avec une souris et un vrai clavier (ordinateur), on garde le
// curseur dans le champ pour pouvoir taper tout de suite.
// Spec 35 : la dernière interaction vient-elle du clavier ? (Entrée, Tab…)
// Sert à ne donner le focus au bouton « Continuer » qu'après une saisie au
// clavier : au clic ou au toucher, pas d'anneau de focus non demandé.
let derniereActionClavier = false;
document.addEventListener('keydown', () => { derniereActionClavier = true; }, true);
document.addEventListener('pointerdown', () => { derniereActionClavier = false; }, true);

// Donne le focus au bouton si on vient du clavier (Entrée = continuer).
// Le focus est donné par le code, pas par Tab : pas d'anneau jaune (spec 37).
// Un focus obtenu avec Tab (bouton non marqué) garde son anneau.
function focusApresClavier(bouton) {
  if (!bouton || !derniereActionClavier) return;
  bouton.classList.add('focus-auto');
  bouton.focus({ preventScroll: true });
}

function focusSiClavierPhysique(champ) {
  if (!champ || champ.disabled) return;
  const ordinateur = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (ordinateur) champ.focus({ preventScroll: true });
}

document.addEventListener('focusin', () => requestAnimationFrame(actualiserClavierMobile));
document.addEventListener('focusout', () => requestAnimationFrame(actualiserClavierMobile));
if (fenetreVisuelle) {
  fenetreVisuelle.addEventListener('resize', actualiserClavierMobile);
  fenetreVisuelle.addEventListener('scroll', actualiserClavierMobile);
}
window.addEventListener('resize', actualiserClavierMobile);
window.addEventListener('orientationchange', () => {
  document.body.classList.remove('clavier-actif');
  dispositionClavierActive = false;
  hauteurSansClavier = fenetreVisuelle ? fenetreVisuelle.height : window.innerHeight;
});

// 2. Instrument Serif pour les textes courts seulement. Au-delà de 40
//    caractères, le texte passe en Inter (classe .texte-long dans style.css).
const SELECTEURS_SERIF = '.pc-question-mot, .pc-trou-phrase, .mc-fr, .ms-atoi-fr, .pi-phrase-lu';
const LONGUEUR_MAX_SERIF = 40;

function marquerTextesLongs() {
  document.querySelectorAll(SELECTEURS_SERIF).forEach(el => {
    el.classList.toggle('texte-long', el.textContent.trim().length > LONGUEUR_MAX_SERIF);
  });
}

// Les écrans sont reconstruits par le JS : on vérifie après chaque changement.
new MutationObserver(marquerTextesLongs).observe(document.body, { childList: true, subtree: true });
