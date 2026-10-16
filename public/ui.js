// ─── CONFORT MOBILE ET LISIBILITÉ (S12) ────────────────────────────────────
// Deux petites aides valables sur tous les écrans.

// 1. Clavier du téléphone : quand il s'ouvre, le champ actif (et le bouton
//    « Valider » juste en dessous) doit rester visible au-dessus du clavier.
//    visualViewport = la partie de l'écran que le clavier ne cache pas.
function garderChampVisible() {
  const champ = document.activeElement;
  if (!champ || !(champ.tagName === 'INPUT' || champ.tagName === 'TEXTAREA')) return;
  // On centre le champ dans la zone visible : la question reste au-dessus,
  // le bouton « Valider » en dessous.
  champ.scrollIntoView({ block: 'center' });
}

document.addEventListener('focusin', () => setTimeout(garderChampVisible, 300));
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', garderChampVisible);
}

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
