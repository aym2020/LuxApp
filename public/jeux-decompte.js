/* SPEC 101 — Compte à rebours « 3, 2, 1, Partez ! » avant Survie et Lux Runner.
   Un seul composant, deux thèmes : 'survie' (or) et 'runner' (couleurs des genres).
   V2 : rythme posé (900 ms par chiffre), disque sombre avec anneau qui se vide,
   police neutre en gras (celle du chrono), apparition et disparition en fondu.

   Le jeu démarre AU MOMENT où « Partez ! » / « GO ! » s'affiche (fini appelé),
   puis le voile s'efface en douceur. S'il est annulé (Retour, sortie du jeu),
   « fini » n'est jamais appelé.

   Usage : const annuler = jeuDecompte({ conteneur, theme, son, estActif }, fini); */
'use strict';

const JEU_DECOMPTE_PAS = 900;     // ms par chiffre
const JEU_DECOMPTE_SORTIE = 700;  // ms d'affichage du « GO » avant de retirer le voile
const JEU_DECOMPTE_COULEURS = {
  survie: ['#f5cf4d', '#f5cf4d', '#f5cf4d', '#f5cf4d'],
  runner: ['#2f8cff', '#ff3d5a', '#22e06b', '#f5cf4d']
};

let jeuDecompteAudio = null;
// À appeler pendant l'appui sur Jouer quand le décompte démarre plus tard (iOS).
function jeuDecompteDebloquer() {
  if (typeof window === 'undefined') return null;
  try {
    if (!jeuDecompteAudio) {
      const Contexte = window.AudioContext || window.webkitAudioContext;
      if (!Contexte) return null;
      jeuDecompteAudio = new Contexte();
    }
    if (jeuDecompteAudio.state === 'suspended' && jeuDecompteAudio.resume) jeuDecompteAudio.resume();
  } catch (_) { return null; }
  return jeuDecompteAudio;
}
function jeuDecompteBip(frequence, duree, volume) {
  const a = jeuDecompteDebloquer();
  if (!a) return;
  try {
    const t = a.currentTime;
    const o = a.createOscillator(), v = a.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(frequence, t);
    v.gain.setValueAtTime(0.0001, t);
    v.gain.exponentialRampToValueAtTime(volume, t + 0.015);
    v.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.connect(v); v.connect(a.destination);
    o.start(t); o.stop(t + duree + 0.02);
  } catch (_) { /* le son est un bonus */ }
}

function jeuDecompte(options, fini) {
  const opt = options || {};
  const conteneur = opt.conteneur;
  const theme = opt.theme === 'runner' ? 'runner' : 'survie';
  const etapes = ['3', '2', '1', theme === 'runner' ? 'GO !' : 'Partez !'];
  const couleurs = JEU_DECOMPTE_COULEURS[theme];
  if (!conteneur || typeof document === 'undefined') { if (fini) fini(); return () => {}; }

  const voile = document.createElement('div');
  voile.className = 'jeu-decompte jeu-decompte-' + theme;
  voile.setAttribute('role', 'status');
  voile.setAttribute('aria-live', 'assertive');
  voile.style.setProperty('--decompte-pas', JEU_DECOMPTE_PAS + 'ms');
  conteneur.appendChild(voile);

  let minuterie = null;
  let termine = false;
  const nettoyer = () => {
    termine = true;
    if (minuterie !== null) clearTimeout(minuterie);
    minuterie = null;
    if (voile.parentNode) voile.parentNode.removeChild(voile);
  };

  function etape(i) {
    if (termine) return;
    if (opt.estActif && !opt.estActif()) { nettoyer(); return; }
    const depart = i === etapes.length - 1;
    // Nouveau contenu à chaque étape : les animations CSS repartent sans reflow forcé.
    voile.innerHTML =
      '<div class="jeu-decompte-disque' + (depart ? ' jeu-decompte-depart' : '') + '" style="--c:' + couleurs[i] + '">' +
        '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="jeu-decompte-fond" cx="60" cy="60" r="54"/>' +
        (depart ? '' : '<circle class="jeu-decompte-anneau" cx="60" cy="60" r="54"/>') + '</svg>' +
        '<span class="jeu-decompte-chiffre">' + etapes[i] + '</span></div>';
    if (opt.son) jeuDecompteBip(depart ? 784 : 523, depart ? 0.4 : 0.16, depart ? 0.1 : 0.07);
    if (depart) {
      if (opt.son && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try { navigator.vibrate(30); } catch (_) { /* facultatif */ }
      }
      if (fini) fini();                       // la partie démarre maintenant
      voile.className += ' jeu-decompte-sortie'; // le voile s'efface pendant le « GO »
      minuterie = setTimeout(nettoyer, JEU_DECOMPTE_SORTIE);
      return;
    }
    minuterie = setTimeout(() => etape(i + 1), JEU_DECOMPTE_PAS);
  }
  etape(0);
  return nettoyer;
}
