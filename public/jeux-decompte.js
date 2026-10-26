/* SPEC 101 — Compte à rebours « 3, 2, 1, Partez ! » avant Survie et Lux Runner.
   Un seul composant, deux styles : 'survie' (or et feu) et 'runner' (néons).
   Le chrono du jeu ne démarre qu'à la fin du décompte ; s'il est annulé
   (Retour, sortie du jeu), la fonction « fini » n'est jamais appelée.

   Usage : const annuler = jeuDecompte({ conteneur, theme, son, estActif }, fini);
     conteneur : élément positionné (position: relative) qui reçoit le voile ;
     theme     : 'survie' | 'runner' ;
     son       : true pour les bips (réglage son du jeu) ;
     estActif  : fonction, false si le joueur a quitté entre deux étapes. */
'use strict';

const JEU_DECOMPTE_PAS = 700; // ms par étape

let jeuDecompteAudio = null;
function jeuDecompteBip(frequence, duree, volume) {
  if (typeof window === 'undefined') return;
  try {
    if (!jeuDecompteAudio) {
      const Contexte = window.AudioContext || window.webkitAudioContext;
      if (!Contexte) return;
      jeuDecompteAudio = new Contexte();
    }
    const a = jeuDecompteAudio;
    if (a.state === 'suspended' && a.resume) a.resume();
    const t = a.currentTime;
    const o = a.createOscillator(), v = a.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(frequence, t);
    v.gain.setValueAtTime(0.0001, t);
    v.gain.exponentialRampToValueAtTime(volume, t + 0.01);
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
  if (!conteneur || typeof document === 'undefined') { if (fini) fini(); return () => {}; }

  const voile = document.createElement('div');
  voile.className = 'jeu-decompte jeu-decompte-' + theme;
  voile.setAttribute('role', 'status');
  voile.setAttribute('aria-live', 'assertive');
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
    if (i >= etapes.length) { nettoyer(); if (fini) fini(); return; }
    const dernier = i === etapes.length - 1;
    // Un nouvel élément à chaque étape : l'animation CSS repart sans reflow forcé.
    voile.innerHTML = '<span class="jeu-decompte-chiffre' + (dernier ? ' jeu-decompte-go' : '') +
      '" data-etape="' + i + '">' + etapes[i] + '</span>';
    if (opt.son) jeuDecompteBip(dernier ? 880 : 440, dernier ? 0.35 : 0.14, dernier ? 0.12 : 0.09);
    if (dernier && opt.son && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try { navigator.vibrate(30); } catch (_) { /* facultatif */ }
    }
    minuterie = setTimeout(() => etape(i + 1), dernier ? 520 : JEU_DECOMPTE_PAS);
  }
  etape(0);
  return nettoyer;
}
