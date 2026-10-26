/* SPEC 96 — Lux Runner : identité sonore (V1.1).
   Tout est synthétisé avec Web Audio : aucun fichier, aucune licence externe.
   Indépendant des sons des exercices (jouerFeedbackSon / SurvieFx ne sont pas utilisés).

   - Musique : boucle électronique arcade originale à 128 BPM (grosse caisse,
     charleston, basse, arpège). Couche rythmique supplémentaire dans les 15
     dernières secondes du Sprint.
   - Effets : changement de voie, bon portail, erreur, combo, fin, victoire.
   - Musique et effets se coupent séparément ; choix mémorisés par profil.
   - Le contexte audio n'est créé qu'après un appui (Jouer), suspendu en pause
     ou en arrière-plan, et la musique est arrêtée à la sortie du jeu.

   Programmation de la musique : toutes les 25 ms, on place les notes des
   ~120 ms à venir sur l'horloge audio (pas de décalage même si l'image rame). */
'use strict';

const RunnerAudio = (function () {
  const BPM = 128;
  const DOUBLE = 60 / BPM / 4;           // durée d'une double-croche (s)
  const AVANCE = 0.12;                   // notes programmées à l'avance (s)
  // Basse (fa mineur → ré bémol → mi bémol → do), une note par double-croche.
  const BASSE = [43.65, 0, 43.65, 87.31, 0, 43.65, 0, 87.31, 34.65, 0, 34.65, 69.3, 38.89, 0, 38.89, 77.78,
                 43.65, 0, 43.65, 87.31, 0, 43.65, 0, 87.31, 34.65, 0, 34.65, 69.3, 32.7, 0, 32.7, 65.41];
  const ARPEGE = [349.23, 415.3, 523.25, 622.25, 523.25, 415.3, 349.23, 415.3];

  let audio = null;        // AudioContext unique, réutilisé entre les parties
  let sortie = null;       // gain général du runner
  let busMusique = null;
  let bruit = null;        // tampon de bruit blanc (charleston, souffles)
  let minuterie = null;
  let prochaine = 0;       // heure audio de la prochaine double-croche
  let pas = 0;             // position dans la boucle (0 à 31)
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
      const taille = audio.sampleRate;
      bruit = audio.createBuffer(1, taille, audio.sampleRate);
      const donnees = bruit.getChannelData(0);
      for (let i = 0; i < taille; i++) donnees[i] = Math.random() * 2 - 1;
    }
    if (audio.state === 'suspended' && audio.resume) audio.resume();
    return audio;
  }

  // Note simple : attaque rapide, extinction exponentielle.
  function note(destination, frequence, debut, duree, volume, forme, frequenceFin) {
    const o = audio.createOscillator();
    const v = audio.createGain();
    o.type = forme || 'sine';
    o.frequency.setValueAtTime(frequence, debut);
    if (frequenceFin) o.frequency.exponentialRampToValueAtTime(frequenceFin, debut + duree);
    v.gain.setValueAtTime(0.0001, debut);
    v.gain.exponentialRampToValueAtTime(volume, debut + 0.006);
    v.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
    o.connect(v); v.connect(destination);
    o.start(debut); o.stop(debut + duree + 0.03);
  }
  // Souffle de bruit filtré (charleston, changement de voie, traversée).
  function souffle(destination, debut, duree, volume, frequence, frequenceFin, panoramique) {
    const source = audio.createBufferSource();
    source.buffer = bruit;
    const filtre = audio.createBiquadFilter();
    filtre.type = 'bandpass';
    filtre.Q.value = 1.2;
    filtre.frequency.setValueAtTime(frequence, debut);
    if (frequenceFin) filtre.frequency.exponentialRampToValueAtTime(frequenceFin, debut + duree);
    const v = audio.createGain();
    v.gain.setValueAtTime(0.0001, debut);
    v.gain.exponentialRampToValueAtTime(volume, debut + Math.min(0.03, duree / 3));
    v.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
    source.connect(filtre); filtre.connect(v);
    if (panoramique && audio.createStereoPanner) {
      const pan = audio.createStereoPanner();
      pan.pan.value = panoramique;
      v.connect(pan); pan.connect(destination);
    } else v.connect(destination);
    source.start(debut, Math.random() * 0.5); source.stop(debut + duree + 0.03);
  }

  // ─── Musique ──────────────────────────────────────────────────────────────

  function jouerPas(i, t) {
    const temps = i % 4 === 0;
    if (temps) note(busMusique, 150, t, 0.16, 0.5, 'sine', 45);            // grosse caisse
    if (i % 4 === 2) souffle(busMusique, t, 0.05, 0.09, 8000);              // charleston ouvert
    if (intense && i % 2 === 1) souffle(busMusique, t, 0.03, 0.06, 10000);  // couche rythmique finale
    if (intense && (i === 12 || i === 28)) souffle(busMusique, t, 0.12, 0.12, 1800); // claquement
    const basse = BASSE[i];
    if (basse) note(busMusique, basse * 2, t, DOUBLE * 0.9, 0.16, 'sawtooth');
    if (i % 2 === 0) {
      const arp = ARPEGE[(i / 2) % ARPEGE.length] * (i >= 16 ? 1.5 : 1);
      note(busMusique, arp, t, DOUBLE * 1.6, intense ? 0.05 : 0.035, 'square');
    }
  }

  function programmer() {
    if (!audio || audio.state !== 'running') return;
    while (prochaine < audio.currentTime + AVANCE) {
      jouerPas(pas, prochaine);
      prochaine += DOUBLE;
      pas = (pas + 1) % 32;
    }
  }

  function demarrerMusique() {
    if (!audio || minuterie !== null || !musiqueActive()) return;
    busMusique = audio.createGain();
    busMusique.gain.value = 0.32;
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
  // voie : 0 gauche, 1 centre, 2 droite → son placé dans l'espace stéréo.
  // Retour haptique (Android) : court sur un bon portail, double sur une erreur.
  function vibrer(motif) {
    if (!effetsActifs() || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    try { navigator.vibrate(motif); } catch (_) { /* facultatif */ }
  }
  function changementVoie(voie) {
    effet(t => souffle(sortie, t, 0.12, 0.12, 900, 2400, (voie - 1) * 0.6));
  }
  function bonPortail(serie) {
    vibrer(18);
    effet(t => {
      souffle(sortie, t, 0.22, 0.26, 600, 5000);
      const base = 523.25 * Math.pow(2, Math.min(serie, 8) / 24); // monte avec la série
      note(sortie, base, t + 0.02, 0.14, 0.22, 'triangle');
      note(sortie, base * 1.5, t + 0.09, 0.2, 0.2, 'triangle');
    });
  }
  function erreur() {
    vibrer([45, 40, 70]);
    effet(t => {
      note(sortie, 110, t, 0.3, 0.6, 'sine', 40);
      note(sortie, 196, t, 0.16, 0.18, 'square', 98);
      souffle(sortie, t, 0.2, 0.32, 300, 120);
    });
  }
  function combo(serie) {
    effet(t => {
      const notes = serie >= 10 ? [659.25, 783.99, 987.77, 1318.5] : serie >= 5 ? [659.25, 830.61, 987.77] : [659.25, 987.77];
      notes.forEach((f, i) => note(sortie, f, t + 0.12 + i * 0.07, 0.18, 0.07, 'square'));
    });
  }
  function fin(victoire) {
    arreterMusique();
    effet(t => {
      if (victoire) {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(sortie, f, t + i * 0.11, 0.3, 0.1, 'square'));
        note(sortie, 1046.5, t + 0.48, 0.7, 0.08, 'triangle');
      } else {
        [392, 329.63, 261.63].forEach((f, i) => note(sortie, f, t + i * 0.16, 0.3, 0.09, 'triangle'));
        note(sortie, 98, t + 0.48, 0.6, 0.2, 'sine', 49);
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
    demarrer: demarrer, pause: pause, reprendre: reprendre, arreter: arreter,
    suivreTemps: suivreTemps, changementVoie: changementVoie, bonPortail: bonPortail,
    erreur: erreur, combo: combo, fin: fin,
    musiqueActive: musiqueActive, effetsActifs: effetsActifs,
    basculerMusique: basculerMusique, basculerEffets: basculerEffets,
    musiqueEnCours: function () { return minuterie !== null; }
  };
})();
