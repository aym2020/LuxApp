// ─── CONFORT MOBILE ET LISIBILITÉ (S12) ────────────────────────────────────
// Deux petites aides valables sur tous les écrans.

// 1. Clavier du téléphone : empêcher le scrollIntoView('center') qui
//    faisait disparaître la question derrière le haut de l'écran.
//    On adapte la hauteur de l'exercice à la surface visible au-dessus du clavier.
const CHAMPS_EXERCICE = '#mc-input, #pc-ecr-input, #ms-input';
const fenetreVisuelle = window.visualViewport;
let hauteurSansClavier = fenetreVisuelle ? fenetreVisuelle.height : window.innerHeight;
let dispositionClavierActive = false;

function actualiserClavierMobile() {
  const champ = document.activeElement;
  const hauteur = fenetreVisuelle ? fenetreVisuelle.height : window.innerHeight;
  const saisieExercice = !!(champ && champ.matches &&
    champ.matches(CHAMPS_EXERCICE) &&
    champ.closest('#view-parcours.active, #view-mission.active'));
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
    const zone = champ.closest('#view-parcours')?.querySelector('.pc-body');
    if (zone) zone.scrollTop = 0;
    window.scrollTo(0, 0);
  }
  dispositionClavierActive = true;
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
