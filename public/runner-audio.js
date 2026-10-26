/* SPEC 96 — Lux Runner : identité sonore « arcade à l'ancienne » (V2.8).
   Tout est synthétisé avec Web Audio : aucun fichier, aucune licence externe.
   Indépendant des sons des exercices (jouerFeedbackSon / SurvieFx ne sont pas utilisés).

   Palette type console 8 bits, commune à la musique et aux effets :
   - deux ondes « pulse » (rapport cyclique 12,5 % et 25 %), comme les consoles rétro ;
   - une onde triangle pour la basse et les grosses caisses ;
   - un bruit « granuleux » (échantillons tenus) pour la batterie et les chocs ;
   - enveloppes en paliers, sans réverbération.

   - Musique : boucle chiptune originale à 132 BPM, 4 mesures (fa mineur → ré bémol
     → mi bémol → do) : basse triangle, arpège rapide, mélodie, batterie de bruit.
     Couche supplémentaire dans les 15 dernières secondes du Sprint.
   - Effets : changement de voie (blip), bon portail (pièce), erreur (chute),
     combo (power-up), fin (fanfare ou game over).
   - Musique et effets se coupent séparément ; choix mémorisés par profil.
   - Le contexte audio n'est créé qu'après un appui (Jouer), suspendu en pause
     ou en arrière-plan, et la musique est arrêtée à la sortie du jeu.

   Programmation de la musique : toutes les 25 ms, on place les notes des
   ~120 ms à venir sur l'horloge audio (pas de décalage même si l'image rame). */
'use strict';

const RunnerAudio = (function () {
  const BPM = 132;
  const DOUBLE = 60 / BPM / 4;           // durée d'une double-croche (s)
  const AVANCE = 0.12;                   // notes programmées à l'avance (s)
  const PAS_BOUCLE = 64;                 // 4 mesures de 16 doubles-croches

  // Notes MIDI → fréquence.
  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  // Une mesure par accord : fondamentale de la basse et notes de l'arpège.
  const ACCORDS = [
    { basse: 41, arpege: [65, 68, 72, 77] }, // fa mineur
    { basse: 37, arpege: [65, 68, 73, 77] }, // ré bémol
    { basse: 39, arpege: [67, 70, 75, 79] }, // mi bémol
    { basse: 36, arpege: [64, 67, 72, 76] }  // do majeur (retour vers fa)
  ];
  // Rythme de basse sur une mesure (0 silence, 1 fondamentale, 2 octave).
  const RYTHME_BASSE = [1, 0, 2, 0, 1, 0, 2, 1, 1, 0, 2, 0, 1, 2, 1, 2];
  // Mélodie en croches (8 par mesure), 0 = silence.
  const MELODIE = [72, 0, 75, 0, 72, 68, 0, 65,  73, 0, 72, 0, 68, 0, 65, 0,
                   70, 0, 72, 0, 75, 0, 72, 70,  67, 0, 64, 0, 67, 0, 72, 0];

  let audio = null;        // AudioContext unique, réutilisé entre les parties
  let sortie = null;       // gain général du runner
  let busMusique = null;
  let bruit = null;        // bruit granuleux (batterie, chocs)
  let ondes = null;        // ondes pulse 12,5 % et 25 %
  let minuterie = null;
  let prochaine = 0;       // heure audio de la prochaine double-croche
  let pas = 0;             // position dans la boucle
  let intense = false;     // couche des 15 dernières secondes

  function cle(nom) { return typeof storageKey === 'function' ? storageKey(nom) : nom; }
  function lireOption(nom) {
    try { return localStorage.getItem(cle(nom)) !== '0'; } catch (_) { return true; }
  }
  function ecrireOption(nom, actif) {
    try { localStorage.setItem(cle(nom), actif ? '1' : '0'); } catch (_) { /* facultatif */ }
  }
  function musiqueActive() { return lireOption('luxRunnerMusique'); }
  function effetsActifs() { return lireOption('luxRunnerEffets'); }

  // Onde « pulse » : série de Fourier d'un signal carré de rapport cyclique donné.
  function ondePulse(rapport) {
    const n = 40;
    const reel = new Float32Array(n), imag = new Float32Array(n);
    for (let k = 1; k < n; k++) reel[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * rapport);
    return audio.createPeriodicWave(reel, imag);
  }

  // Crée le contexte audio (à appeler pendant un appui de l'utilisateur).
  function preparer() {
    if (typeof window === 'undefined') return null;
    if (!audio) {
      const Contexte = window.AudioContext || window.webkitAudioContext;
      if (!Contexte) return null;
      try { audio = new Contexte(); } catch (_) { return null; }
      sortie = audio.createGain();
      sortie.gain.value = 0.8;
      sortie.connect(audio.destination);
      // Bruit tenu par paquets de 6 échantillons : grain « 8 bits ».
      const taille = audio.sampleRate;
      bruit = audio.createBuffer(1, taille, audio.sampleRate);
      const donnees = bruit.getChannelData(0);
      let valeur = 0;
      for (let i = 0; i < taille; i++) {
        if (i % 6 === 0) valeur = Math.random() < 0.5 ? -1 : 1;
        donnees[i] = valeur;
      }
      try { ondes = { fine: ondePulse(0.125), moyenne: ondePulse(0.25) }; } catch (_) { ondes = null; }
    }
    if (audio.state === 'suspended' && audio.resume) audio.resume();
    return audio;
  }

  // Note rétro : volume tenu puis relâché d'un coup (enveloppe en paliers).
  // forme : 'fine' | 'moyenne' (pulse) | 'square' | 'triangle'.
  function note(destination, frequence, debut, duree, volume, forme, frequenceFin) {
    const o = audio.createOscillator();
    const v = audio.createGain();
    const pulse = forme === 'fine' || forme === 'moyenne';
    if (pulse && ondes) o.setPeriodicWave(ondes[forme]);
    else o.type = pulse ? 'square' : (forme || 'square');
    o.frequency.setValueAtTime(frequence, debut);
    if (frequenceFin) o.frequency.exponentialRampToValueAtTime(frequenceFin, debut + duree);
    v.gain.setValueAtTime(volume, debut);
    v.gain.setValueAtTime(volume, debut + duree * 0.6);
    v.gain.linearRampToValueAtTime(volume * 0.45, debut + duree * 0.8);
    v.gain.linearRampToValueAtTime(0, debut + duree);
    o.connect(v); v.connect(destination);
    o.start(debut); o.stop(debut + duree + 0.02);
  }
  // Suite de notes rapides (arpèges, fanfares), à pas fixe.
  function suite(destination, frequences, debut, pasTemps, duree, volume, forme) {
    frequences.forEach((f, i) => note(destination, f, debut + i * pasTemps, duree, volume, forme));
  }
  // Bruit granuleux filtré (batterie, chocs).
  function bruitage(destination, debut, duree, volume, coupure) {
    const source = audio.createBufferSource();
    source.buffer = bruit;
    const filtre = audio.createBiquadFilter();
    filtre.type = 'highpass';
    filtre.frequency.value = coupure || 1000;
    const v = audio.createGain();
    v.gain.setValueAtTime(volume, debut);
    v.gain.linearRampToValueAtTime(0, debut + duree);
    source.connect(filtre); filtre.connect(v); v.connect(destination);
    source.start(debut, Math.random() * 0.5); source.stop(debut + duree + 0.02);
  }

  // ─── Musique ──────────────────────────────────────────────────────────────

  function jouerPas(i, t) {
    const mesure = Math.floor(i / 16), dans = i % 16;
    const accord = ACCORDS[mesure];
    // Batterie : grosse caisse triangle, caisse claire et charleston de bruit.
    if (dans % 4 === 0) note(busMusique, 180, t, 0.09, 0.55, 'triangle', 50);
    if (dans === 4 || dans === 12) bruitage(busMusique, t, 0.11, 0.22, 1200);
    if (dans % 2 === 1 || intense) bruitage(busMusique, t, 0.025, intense ? 0.08 : 0.06, 7000);
    // Basse triangle.
    const b = RYTHME_BASSE[dans];
    if (b) note(busMusique, hz(accord.basse + (b === 2 ? 12 : 0)), t, DOUBLE * 0.85, 0.5, 'triangle');
    // Arpège rapide en pulse fine (une note par double-croche).
    note(busMusique, hz(accord.arpege[dans % 4] + (intense ? 12 : 0)), t, DOUBLE * 0.7, 0.05, 'fine');
    // Mélodie en croches, pulse moyenne ; doublée à l'octave en fin de Sprint.
    if (dans % 2 === 0) {
      const m = MELODIE[i / 2];
      if (m) note(busMusique, hz(m), t, DOUBLE * 1.8, 0.09, 'moyenne');
      if (m && intense) note(busMusique, hz(m + 12), t + 0.01, DOUBLE * 1.6, 0.035, 'fine');
    }
  }

  function programmer() {
    if (!audio || audio.state !== 'running') return;
    while (prochaine < audio.currentTime + AVANCE) {
      jouerPas(pas, prochaine);
      prochaine += DOUBLE;
      pas = (pas + 1) % PAS_BOUCLE;
    }
  }

  function demarrerMusique() {
    if (!audio || minuterie !== null || !musiqueActive()) return;
    busMusique = audio.createGain();
    busMusique.gain.value = 0.3;
    busMusique.connect(sortie);
    prochaine = audio.currentTime + 0.05;
    pas = 0;
    minuterie = setInterval(programmer, 25);
  }

  function arreterMusique() {
    if (minuterie !== null) clearInterval(minuterie);
    minuterie = null;
    if (busMusique && audio) {
      const t = audio.currentTime;
      busMusique.gain.setValueAtTime(busMusique.gain.value, t);
      busMusique.gain.linearRampToValueAtTime(0, t + 0.15);
      const ancien = busMusique;
      setTimeout(() => { try { ancien.disconnect(); } catch (_) { /* déjà déconnecté */ } }, 300);
    }
    busMusique = null;
  }

  // ─── API utilisée par runner.js ──────────────────────────────────────────

  function demarrer() {
    if (!preparer()) return;
    intense = false;
    arreterMusique();
    demarrerMusique();
  }
  function pause() {
    if (audio && audio.state === 'running' && audio.suspend) audio.suspend();
  }
  function reprendre() {
    if (audio && audio.state === 'suspended' && audio.resume) audio.resume();
  }
  function arreter() {
    arreterMusique();
    intense = false;
    reprendre(); // le contexte reste prêt pour la prochaine partie
  }
  // Appelé à chaque image : couche finale pendant les 15 dernières secondes.
  function suivreTemps(tempsRestant) {
    intense = tempsRestant <= 15;
  }

  function effet(fabrique) {
    if (!effetsActifs() || !audio || audio.state !== 'running') return;
    try { fabrique(audio.currentTime); } catch (_) { /* le son est un bonus */ }
  }
  // Retour haptique (Android) : court sur un bon portail, double sur une erreur.
  function vibrer(motif) {
    if (!effetsActifs() || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    try { navigator.vibrate(motif); } catch (_) { /* facultatif */ }
  }
  // voie : 0 gauche, 1 centre, 2 droite. Blip court qui monte (plus aigu vers la droite).
  function changementVoie(voie) {
    effet(t => {
      const base = hz(76 + (voie || 0) * 2);
      note(sortie, base, t, 0.035, 0.07, 'moyenne');
      note(sortie, base * 1.5, t + 0.035, 0.045, 0.06, 'moyenne');
    });
  }
  // Bon portail : « pièce » classique (deux notes), plus aiguë quand la série monte.
  function bonPortail(serie) {
    vibrer(18);
    effet(t => {
      const decalage = Math.min(serie || 0, 8);
      note(sortie, hz(83 + decalage), t, 0.07, 0.13, 'moyenne');
      note(sortie, hz(88 + decalage), t + 0.07, 0.26, 0.13, 'moyenne');
    });
  }
  // Erreur : chute de hauteur « touché » + choc de bruit.
  function erreur() {
    vibrer([45, 40, 70]);
    effet(t => {
      note(sortie, 520, t, 0.32, 0.16, 'square', 70);
      note(sortie, 150, t, 0.14, 0.35, 'triangle', 60);
      bruitage(sortie, t, 0.22, 0.25, 400);
    });
  }
  // Combo : arpège « power-up » qui monte, plus long à chaque palier.
  function combo(serie) {
    effet(t => {
      const montee = serie >= 10 ? [72, 76, 79, 84, 88, 91, 96] : serie >= 5 ? [72, 76, 79, 84, 88] : [72, 76, 79, 84];
      suite(sortie, montee.map(hz), t + 0.2, 0.045, 0.06, 0.07, 'fine');
    });
  }
  // Fin : fanfare de victoire ou « game over » descendant.
  function fin(victoire) {
    arreterMusique();
    effet(t => {
      if (victoire) {
        suite(sortie, [72, 76, 79, 84].map(hz), t, 0.09, 0.09, 0.11, 'moyenne');
        note(sortie, hz(84), t + 0.4, 0.18, 0.11, 'moyenne');
        note(sortie, hz(88), t + 0.6, 0.6, 0.12, 'moyenne');
        note(sortie, hz(48), t + 0.6, 0.6, 0.4, 'triangle');
      } else {
        suite(sortie, [67, 66, 65, 64].map(hz), t, 0.18, 0.17, 0.11, 'moyenne');
        note(sortie, hz(52), t + 0.72, 0.7, 0.12, 'square', hz(40));
        note(sortie, hz(40), t + 0.72, 0.7, 0.4, 'triangle');
      }
    });
  }

  function basculerMusique(enCourse) {
    const actif = !musiqueActive();
    ecrireOption('luxRunnerMusique', actif);
    if (!actif) arreterMusique();
    else if (enCourse && preparer()) demarrerMusique();
    return actif;
  }
  function basculerEffets() {
    const actif = !effetsActifs();
    ecrireOption('luxRunnerEffets', actif);
    return actif;
  }

  return {
    preparer: preparer, demarrer: demarrer, pause: pause, reprendre: reprendre, arreter: arreter,
    suivreTemps: suivreTemps, changementVoie: changementVoie, bonPortail: bonPortail,
    erreur: erreur, combo: combo, fin: fin,
    musiqueActive: musiqueActive, effetsActifs: effetsActifs,
    basculerMusique: basculerMusique, basculerEffets: basculerEffets,
    musiqueEnCours: function () { return minuterie !== null; }
  };
})();
