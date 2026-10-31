/* SPEC 110 — Lux Démasque : musique et effets (Web Audio), mêmes principes que Lux Match.
   - Un AudioContext créé au premier geste (autoplay mobile), deux bus : effets et musique.
   - Une seule boucle à la fois : « enquete » (fiche, réseaux, carnet) ou « deposition »
     (interrogatoire), même tempo et même tonalité : on passe de l'une à l'autre en fondu.
   - Accents joués une fois : indice, objection, percee (menteur coincé), rate, resolu, clos.
     Objection et percée baissent la musique le temps de l'accent (ducking).
   - Arrière-plan : tout est suspendu ; reprise seulement si Lux Démasque est à l'écran.
   - Fichier absent ou décodage impossible : silence, le jeu continue.
   Réglages : luxDemasqueSon (tout), luxDemasqueMusique (garde les effets). Compositions :
   tools/lux-demasque/musique.py (originales, aucun échantillon). */
'use strict';
const LuxDemasqueSon = (function () {
  const DOSSIER = 'audio/lux-demasque/';
  const PISTES = { enquete: 'dossier-ouvert', deposition: 'deposition' };
  const ACCENTS = { indice: 0.55, objection: 0.9, percee: 0.75, rate: 0.6, resolu: 0.8, clos: 0.6 };
  const VOLUME_MUSIQUE = 0.3;
  let audio = null, busEffets = null, busMusique = null;
  const lire = (nom, defaut) => (typeof ldLire === 'function' ? ldLire(nom, defaut) : defaut);
  const actif = () => lire('luxDemasqueSon', true);
  const musiqueActive = () => lire('luxDemasqueMusique', true);
  function preparer() {
    if (!audio) {
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; }
      busEffets = audio.createGain(); busEffets.connect(audio.destination);
      busMusique = audio.createGain(); busMusique.connect(audio.destination);
    }
    if (audio.state === 'suspended' && !document.hidden) audio.resume();
    return audio;
  }
  function extension() {
    try { return new Audio().canPlayType('audio/ogg; codecs="vorbis"') ? '.ogg' : '.mp3'; } catch (_) { return '.mp3'; }
  }
  const tampons = {};
  function charger(fichier) {
    if (!tampons[fichier]) {
      tampons[fichier] = fetch(DOSSIER + fichier + extension() + '?v=1')
        .then(r => { if (!r.ok) throw new Error('son'); return r.arrayBuffer(); })
        .then(octets => new Promise((ok, ko) => audio.decodeAudioData(octets, ok, ko)));
      tampons[fichier].catch(() => { delete tampons[fichier]; });
    }
    return tampons[fichier];
  }

  // ── Petits clics d'interface (synthèse, aucun fichier)
  function note(f, debut, duree, volume, forme, fin) {
    const t = audio.currentTime + debut, o = audio.createOscillator(), g = audio.createGain();
    o.type = forme || 'square'; o.frequency.setValueAtTime(f, t);
    if (fin) o.frequency.exponentialRampToValueAtTime(fin, t + duree);
    g.gain.setValueAtTime(volume, t); g.gain.linearRampToValueAtTime(0, t + duree);
    o.connect(g); g.connect(busEffets); o.start(t); o.stop(t + duree + 0.02);
  }
  const CLICS = {
    nav: () => note(720, 0, 0.04, 0.035, 'triangle'),
    page: () => { note(880, 0, 0.04, 0.04); note(1320, 0.04, 0.06, 0.035); },
    ouvrir: () => note(420, 0, 0.07, 0.04, 'triangle', 640)
  };
  function clic(nom) {
    if (!actif() || !preparer() || !CLICS[nom]) return;
    try { CLICS[nom](); } catch (_) { /* bonus */ }
  }

  // ── Musique : une boucle au plus
  let voulue = null, courante = null, demande = 0;
  function fondre(piste, duree) {
    const t = audio.currentTime, g = piste.gain.gain;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + duree);
    try { piste.source.stop(t + duree + 0.05); } catch (_) { /* déjà arrêtée */ }
  }
  // nom : 'enquete', 'deposition' ou null. Rappeler avec la même piste ne la relance jamais.
  function musique(nom) {
    voulue = nom && actif() && musiqueActive() ? nom : null;
    if (courante && courante.nom === voulue) return;
    demande++;
    if (courante && audio) { fondre(courante, voulue ? 0.7 : 0.4); courante = null; }
    if (!voulue || !preparer()) return;
    const numero = demande, cible = voulue;
    charger(PISTES[cible]).then(tampon => {
      if (numero !== demande || voulue !== cible || courante) return;
      const t = audio.currentTime, source = audio.createBufferSource(), gain = audio.createGain();
      source.buffer = tampon; source.loop = true;
      gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(VOLUME_MUSIQUE, t + 0.9);
      source.connect(gain); gain.connect(busMusique);
      source.start(t);
      courante = { nom: cible, source, gain };
    }).catch(() => { /* silence */ });
  }
  // ── Accents : une fois, avec ducking éventuel de la musique.
  function accent(nom, options) {
    if (!actif() || !preparer() || !ACCENTS[nom]) return;
    const baisse = options && options.baisse;
    charger(nom).then(tampon => {
      const t = audio.currentTime, source = audio.createBufferSource(), gain = audio.createGain();
      source.buffer = tampon; gain.gain.value = ACCENTS[nom];
      source.connect(gain); gain.connect(busEffets); source.start(t);
      if (baisse) {
        const g = busMusique.gain;
        g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
        g.linearRampToValueAtTime(0.12, t + 0.06); g.setValueAtTime(0.12, t + tampon.duration * 0.85);
        g.linearRampToValueAtTime(1, t + tampon.duration + 0.5);
      }
    }).catch(() => { /* silence */ });
  }
  function precharger() {
    if (!actif() || !preparer()) return;
    Object.keys(ACCENTS).forEach(n => charger(n).catch(() => {}));
    if (musiqueActive()) Object.keys(PISTES).forEach(n => charger(PISTES[n]).catch(() => {}));
  }
  function pisteEnCours() { return courante ? courante.nom : null; }
  function contexte() { return audio; }
  document.addEventListener('visibilitychange', () => {
    if (!audio) return;
    if (document.hidden) audio.suspend();
    else if (typeof ldVueActive === 'function' && ldVueActive() && actif()) audio.resume();
  });
  return { preparer, actif, musiqueActive, musique, accent, clic, precharger, pisteEnCours, contexte };
})();
