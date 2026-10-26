/* SPEC 96 — Lux Runner : les trois portails (rubrique Jeux).
   Un nom luxembourgeois s'affiche ; le joueur choisit la voie Masculin,
   Féminin ou Neutre avant que les portails n'arrivent sur lui.

   Organisation du fichier :
     1. Constantes et données (référentiel RUNNER_MOTS, runner-mots.js)
     2. Règles du jeu, sans DOM (testées dans test/runner.test.cjs)
     3. Records et mots à retravailler (localStorage, par profil)
     4. Écrans HTML : préparation, course, pause, résultats
     5. Boucle d'animation et rendu Canvas 2D (pseudo-3D)
     6. Contrôles : boutons, toucher, glisser, clavier

   Règle fondamentale : le temps de décision EST le trajet jusqu'aux portails.
   Tout dépend de partie.temps (temps de jeu actif, en secondes), jamais du
   nombre d'images affichées. */
'use strict';

// ─── 1. CONSTANTES ──────────────────────────────────────────────────────────
const RUNNER_VOIES = ['m', 'f', 'n']; // gauche, centre, droite
const RUNNER_GENRES = {
  m: { nom: 'Masculin', lettre: 'M', couleur: '#6fb0f2', mot: 'masculin' },
  f: { nom: 'Féminin', lettre: 'F', couleur: '#f18bbb', mot: 'féminin' },
  n: { nom: 'Neutre', lettre: 'N', couleur: '#b18cf0', mot: 'neutre' }
};
const RUNNER_DUREE_SPRINT = 60;     // secondes de jeu actif
const RUNNER_VIES = 3;
const RUNNER_APPROCHE_ENTRAINEMENT = 8;
const RUNNER_APPROCHE_TUTO = 6;
const RUNNER_TUTO_MOTS = 3;
const RUNNER_TUTO_ATTENTE = 0.7;    // tutoriel : le portail attend la réponse à 70 % du trajet
const RUNNER_MIN_PAR_GENRE = 2;     // en dessous : niveau indisponible
const RUNNER_SANS_REPETITION = 4;   // un nom ne revient pas dans les 4 portails suivants
const RUNNER_PRECISION_MIN = 5;     // record de précision : au moins 5 portails
const RUNNER_FEEDBACK_MS = 1600;
const RUNNER_PASSAGE = 0.35;        // durée (s) du portail franchi qui disparaît

let runnerPartie = null;  // partie en cours (null hors course)
let runnerEcran = null;   // 'preparation' | 'course' | 'resultats'

// ─── 2. RÈGLES DU JEU (sans DOM) ────────────────────────────────────────────

// Temps d'approche, fixé au moment où le mot apparaît (SPEC 96 § 3.2).
function runnerApproche(mode, tempsDebut) {
  if (mode === 'entrainement') return RUNNER_APPROCHE_ENTRAINEMENT;
  if (mode === 'tuto') return RUNNER_APPROCHE_TUTO;
  if (tempsDebut < 20) return 6;
  if (tempsDebut < 40) return 5;
  return 4;
}

// 100 points + 25 par bonne réponse consécutive précédente, bonus plafonné à 100.
function runnerPoints(serieAvant) {
  return 100 + Math.min(100, 25 * serieAvant);
}

function runnerNiveau() {
  return typeof niveauActif === 'string' && niveauActif ? niveauActif : 'A1.1';
}

function runnerMotsDuNiveau(niveau) {
  const tous = typeof RUNNER_MOTS === 'undefined' ? [] : RUNNER_MOTS;
  return tous.filter(m => m.level === niveau && RUNNER_GENRES[m.gender]);
}

// Jouable seulement si chaque genre a assez de noms validés : on ne complète
// jamais le tirage avec des mots d'un autre niveau.
function runnerDisponible(mots) {
  return RUNNER_VOIES.every(g => mots.filter(m => m.gender === g).length >= RUNNER_MIN_PAR_GENRE);
}

function runnerMelanger(liste, hasard) {
  const copie = liste.slice();
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1));
    const tmp = copie[i]; copie[i] = copie[j]; copie[j] = tmp;
  }
  return copie;
}

function runnerNouvellePartie(mode, mots, options) {
  const opt = options || {};
  return {
    mode: mode,                       // 'sprint' | 'entrainement' | 'tuto'
    niveau: opt.niveau || 'A1.1',
    mots: mots,
    hasard: opt.hasard || Math.random,
    erreursPassees: opt.erreursPassees || {}, // id → nombre d'erreurs (parties précédentes)
    etat: 'course',                   // 'course' | 'pause' | 'fin'
    temps: 0,
    distance: 0,                      // pour le défilement de la route (visuel)
    vies: RUNNER_VIES,
    score: 0,
    serie: 0,
    maxSerie: 0,
    bons: 0,
    rencontres: 0,
    portail: null,                    // { mot, debut, duree } ou { arrivee: true, debut, duree }
    choix: null,                      // 'm' | 'f' | 'n' | null : rien n'est présélectionné
    sac: [],                          // genres à venir (2 de chaque, mélangés)
    genresRecents: [],
    derniers: [],                     // ids des derniers portails
    vusPartie: new Set(),
    erreurs: [],                      // [{ mot, choix }] dans l'ordre
    bilanMots: {},                    // id → +1 erreur / −1 réussite (sauvé en fin de partie)
    victoire: false,
    finTemps: 0
  };
}

// Genre du prochain portail : sac de 6 (2 × m, f, n) pour un tirage équilibré
// et peu prévisible ; jamais trois fois le même genre d'affilée.
function runnerTirerGenre(p) {
  if (!p.sac.length) p.sac = runnerMelanger(['m', 'm', 'f', 'f', 'n', 'n'], p.hasard);
  const i = p.sac.length - 1;
  const recents = p.genresRecents;
  if (recents.length >= 2 && recents[0] === p.sac[i] && recents[1] === p.sac[i]) {
    const j = p.sac.findIndex(g => g !== p.sac[i]);
    if (j >= 0) { const tmp = p.sac[i]; p.sac[i] = p.sac[j]; p.sac[j] = tmp; }
  }
  const genre = p.sac.pop();
  p.genresRecents = [genre].concat(recents).slice(0, 2);
  return genre;
}

function runnerChoisirMot(p) {
  const genre = runnerTirerGenre(p);
  const duGenre = p.mots.filter(m => m.gender === genre);
  let candidats = duGenre.filter(m => !p.vusPartie.has(m.id) && !p.derniers.includes(m.id));
  if (!candidats.length) {
    // Tous les noms de ce genre sont sortis : nouveau tour, sans les derniers.
    duGenre.forEach(m => p.vusPartie.delete(m.id));
    candidats = duGenre.filter(m => !p.derniers.includes(m.id));
  }
  if (!candidats.length) candidats = duGenre;
  // Les noms ratés (avant ou pendant cette partie) reviennent plus souvent.
  const poids = candidats.map(m => {
    const erreurs = (p.erreursPassees[m.id] || 0) + Math.max(0, p.bilanMots[m.id] || 0);
    return 1 + 2 * Math.min(3, erreurs);
  });
  const total = poids.reduce((a, b) => a + b, 0);
  let tirage = p.hasard() * total;
  for (let i = 0; i < candidats.length; i++) {
    tirage -= poids[i];
    if (tirage < 0) return candidats[i];
  }
  return candidats[candidats.length - 1];
}

// Lance le trio de portails suivant à l'instant « debut » (temps de jeu).
// Sprint : une séquence qui dépasserait les 60 s n'est pas lancée ;
// l'arche d'arrivée arrive à la place, exactement à 60 s.
function runnerLancerPortail(p, debut) {
  p.choix = null;
  if (p.mode === 'tuto' && p.rencontres >= RUNNER_TUTO_MOTS) {
    p.portail = null;
    runnerFinir(p, true, debut);
    return;
  }
  const duree = runnerApproche(p.mode, debut);
  if (p.mode === 'sprint' && debut + duree > RUNNER_DUREE_SPRINT) {
    const reste = RUNNER_DUREE_SPRINT - debut;
    if (reste <= 0) { p.portail = null; runnerFinir(p, true, RUNNER_DUREE_SPRINT); return; }
    p.portail = { arrivee: true, debut: debut, duree: reste };
    return;
  }
  const mot = runnerChoisirMot(p);
  p.portail = { mot: mot, debut: debut, duree: duree };
  p.vusPartie.add(mot.id);
  p.derniers = [mot.id].concat(p.derniers).slice(0, RUNNER_SANS_REPETITION);
}

// Collision : on valide la DERNIÈRE voie choisie, et seulement maintenant.
function runnerResoudre(p) {
  const mot = p.portail.mot;
  const choix = p.choix;
  p.rencontres++;
  let statut;
  let points = 0;
  if (choix === mot.gender) {
    statut = 'correct';
    points = runnerPoints(p.serie);
    p.score += points;
    p.serie++;
    p.maxSerie = Math.max(p.maxSerie, p.serie);
    p.bons++;
    p.bilanMots[mot.id] = (p.bilanMots[mot.id] || 0) - 1;
  } else {
    statut = choix ? 'faux' : 'absent';
    p.serie = 0;
    if (p.mode === 'sprint') p.vies--;
    p.erreurs.push({ mot: mot, choix: choix });
    p.bilanMots[mot.id] = (p.bilanMots[mot.id] || 0) + 1;
    p.vusPartie.delete(mot.id); // il pourra revenir plus tard dans la partie
  }
  return { statut: statut, mot: mot, choix: choix, points: points, serie: p.serie };
}

function runnerFinir(p, victoire, temps) {
  p.etat = 'fin';
  p.victoire = victoire;
  p.finTemps = temps;
  p.temps = temps;
}

// Fait avancer la partie de dt secondes de jeu. Renvoie les collisions résolues.
// Indépendant des images : 1 × 0,5 s ou 50 × 0,01 s donnent le même résultat.
function runnerAvancer(p, dt) {
  const resultats = [];
  if (!p || p.etat !== 'course' || !(dt > 0)) return resultats;
  if (!p.portail) runnerLancerPortail(p, p.temps);
  let cible = p.temps + dt;
  // Tutoriel : le portail s'arrête à 70 % du trajet tant qu'aucune voie n'est choisie.
  if (p.mode === 'tuto' && p.portail && !p.portail.arrivee && p.choix === null) {
    cible = Math.min(cible, Math.max(p.temps, p.portail.debut + p.portail.duree * RUNNER_TUTO_ATTENTE));
  }
  while (p.etat === 'course' && p.portail && cible >= p.portail.debut + p.portail.duree) {
    const impact = p.portail.debut + p.portail.duree;
    p.distance += (impact - p.temps) / p.portail.duree;
    p.temps = impact;
    if (p.portail.arrivee) { p.portail = null; runnerFinir(p, true, impact); break; }
    const resultat = runnerResoudre(p);
    resultat.temps = impact;
    resultat.duree = p.portail.duree;
    resultats.push(resultat);
    if (p.mode === 'sprint' && p.vies <= 0) { runnerFinir(p, false, impact); break; }
    runnerLancerPortail(p, impact);
    if (p.mode === 'tuto' && p.portail && p.choix === null) {
      cible = Math.min(cible, p.portail.debut + p.portail.duree * RUNNER_TUTO_ATTENTE);
    }
  }
  if (p.etat === 'course' && cible > p.temps) {
    if (p.portail) p.distance += (cible - p.temps) / p.portail.duree;
    p.temps = cible;
  }
  return resultats;
}

function runnerPrecision(p) {
  return p.rencontres ? Math.round(100 * p.bons / p.rencontres) : 0;
}

function runnerFormatTemps(secondes) {
  const s = Math.max(0, Math.ceil(secondes - 1e-9));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

// ─── 3. RECORDS ET MOTS À RETRAVAILLER (par profil, par niveau) ─────────────

function runnerCle(nom) {
  return typeof storageKey === 'function' ? storageKey(nom) : nom;
}
function runnerLire(nom) {
  try { return JSON.parse(localStorage.getItem(runnerCle(nom))) || {}; } catch (_) { return {}; }
}
function runnerEcrire(nom, valeur) {
  try { localStorage.setItem(runnerCle(nom), JSON.stringify(valeur)); } catch (_) { /* facultatif */ }
}
function runnerRecords(niveau) {
  const tous = runnerLire('luxRunnerRecords');
  return Object.assign({ score: 0, survie: 0, precision: 0, combo: 0, parties: 0 }, tous[niveau] || {});
}

// Appelée une seule fois en fin de Sprint (jamais à chaque image).
// Renvoie la liste des records battus.
function runnerEnregistrerSprint(p) {
  const tous = runnerLire('luxRunnerRecords');
  const r = runnerRecords(p.niveau);
  const battus = [];
  r.parties++;
  if (p.score > r.score) { r.score = p.score; battus.push('score'); }
  if (p.finTemps > r.survie) { r.survie = Math.round(p.finTemps * 10) / 10; battus.push('survie'); }
  const precision = runnerPrecision(p);
  if (p.rencontres >= RUNNER_PRECISION_MIN && precision > r.precision) { r.precision = precision; battus.push('precision'); }
  if (p.maxSerie > r.combo) { r.combo = p.maxSerie; battus.push('combo'); }
  tous[p.niveau] = r;
  runnerEcrire('luxRunnerRecords', tous);
  return battus;
}

// Mots ratés : +1 par erreur, −1 par réussite. Les plus ratés reviennent plus.
function runnerErreursPassees(niveau) {
  return runnerLire('luxRunnerMots')[niveau] || {};
}
function runnerEnregistrerMots(p) {
  const tous = runnerLire('luxRunnerMots');
  const niveau = Object.assign({}, tous[p.niveau] || {});
  Object.keys(p.bilanMots).forEach(id => {
    const valeur = Math.min(5, Math.max(0, (niveau[id] || 0) + p.bilanMots[id]));
    if (valeur) niveau[id] = valeur; else delete niveau[id];
  });
  tous[p.niveau] = niveau;
  runnerEcrire('luxRunnerMots', tous);
}

function runnerTutoFait() {
  try { return localStorage.getItem(runnerCle('luxRunnerTuto')) === '1'; } catch (_) { return false; }
}
function runnerMarquerTuto() {
  try { localStorage.setItem(runnerCle('luxRunnerTuto'), '1'); } catch (_) { /* facultatif */ }
}

// ─── 4. ÉCRANS ──────────────────────────────────────────────────────────────

function runnerEchapper(texte) {
  return String(texte).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
function runnerIcone(nom) {
  const traits = {
    retour: '<path d="m14 5-7 7 7 7M7 12h13"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    coeur: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    fleche: '<path d="M4 12h16m-7-7 7 7-7 7"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + traits[nom] + '</svg>';
}
// Trois petites arches M / F / N (carte du hub et préparation).
function runnerApercuPortails() {
  return '<div class="runner-apercu" aria-hidden="true">' + RUNNER_VOIES.map(g =>
    '<span class="runner-arche runner-' + g + '"><b>' + RUNNER_GENRES[g].lettre + '</b><small>' +
    RUNNER_GENRES[g].nom + '</small></span>').join('') + '</div>';
}

// Carte affichée dans la rubrique Jeux (appelée par renderJeuxHub).
function runnerCarteHub() {
  const niveau = runnerNiveau();
  const mots = runnerMotsDuNiveau(niveau);
  const dispo = runnerDisponible(mots);
  const record = runnerRecords(niveau).score;
  return '<section class="jeux-carte runner-carte' + (dispo ? '' : ' jeux-carte-verrouillee') + '" aria-labelledby="jeux-runner-titre">' +
    runnerApercuPortails() +
    '<div class="jeux-carte-titre"><h2 id="jeux-runner-titre">Lux Runner</h2>' +
      (dispo ? '' : '<span class="jeux-etat">BIENTÔT</span>') + '</div>' +
    '<p>Apprends les genres en courant : choisis le bon portail avant qu’il n’arrive.</p>' +
    '<div class="jeux-meta"><span>60 secondes · ' + niveau + '</span><span>Record : <b>' + record + '</b></span></div>' +
    (dispo
      ? '<button class="jeux-jouer runner-jouer-hub" type="button" onclick="ouvrirRunner()">Jouer <span aria-hidden="true">→</span></button>'
      : '<p class="jeux-verrou">Pas encore de noms validés pour le niveau ' + niveau + '. Lux Runner arrive bientôt.</p>') +
    '</section>';
}

function ouvrirRunner() {
  runnerArreter();
  const mots = runnerMotsDuNiveau(runnerNiveau());
  if (!runnerDisponible(mots)) { if (typeof renderJeuxHub === 'function') renderJeuxHub(); return; }
  runnerRendrePreparation(false);
  showView('view-runner');
}

function runnerRendrePreparation(apresTuto) {
  const box = document.getElementById('runner-jeu');
  if (!box) return;
  runnerEcran = 'preparation';
  const premiere = !runnerTutoFait();
  const r = runnerRecords(runnerNiveau());
  box.className = 'runner-jeu runner-ecran-preparation';
  const entete = '<div class="runner-top"><button type="button" class="runner-retour" onclick="quitterRunner()">' +
    runnerIcone('retour') + ' Jeux</button><span>LUX RUNNER</span></div>';
  if (premiere) {
    box.innerHTML = entete +
      '<main class="runner-prepa">' +
        '<span class="jeux-kicker">LES TROIS PORTAILS</span>' +
        '<h1>Lux Runner<span>.</span></h1>' +
        runnerApercuPortails() +
        '<ol class="runner-regles"><li>Un mot apparaît.</li><li>Choisis masculin, féminin ou neutre.</li>' +
          '<li>Traverse le bon portail avant qu’il n’arrive !</li></ol>' +
        '<p class="runner-prepa-note">Trois mots pour essayer, sans chrono.</p>' +
      '</main>' +
      '<div class="runner-actions">' +
        '<button type="button" class="jeux-jouer" onclick="demarrerRunner(\'tuto\')">Commencer ' + runnerIcone('fleche') + '</button>' +
        '<button type="button" class="runner-lien" onclick="runnerPasserTuto()">Passer le tutoriel</button>' +
      '</div>';
    return;
  }
  box.innerHTML = entete +
    '<main class="runner-prepa">' +
      '<span class="jeux-kicker">' + (apresTuto ? 'TU ES PRÊT' : 'LES TROIS PORTAILS') + '</span>' +
      '<h1>Lux Runner<span>.</span></h1>' +
      '<p class="runner-prepa-format">60 secondes · 3 vies</p>' +
      runnerApercuPortails() +
      '<div class="runner-prepa-records"><div><span>Record</span><strong>' + r.score + '</strong></div>' +
        '<div><span>Meilleure série</span><strong>' + r.combo + '</strong></div>' +
        '<div><span>Parties</span><strong>' + r.parties + '</strong></div></div>' +
    '</main>' +
    '<div class="runner-actions">' +
      '<button type="button" class="jeux-jouer" onclick="demarrerRunner(\'sprint\')">Jouer ' + runnerIcone('fleche') + '</button>' +
      '<button type="button" class="runner-secondaire" onclick="demarrerRunner(\'entrainement\')">S’entraîner</button>' +
      '<button type="button" class="runner-lien" onclick="demarrerRunner(\'tuto\')">Revoir le tutoriel</button>' +
    '</div>';
}

function runnerPasserTuto() {
  runnerMarquerTuto();
  runnerRendrePreparation(false);
}

function demarrerRunner(mode) {
  const niveau = runnerNiveau();
  const mots = runnerMotsDuNiveau(niveau);
  if (!runnerDisponible(mots)) { ouvrirJeux(); return; }
  runnerArreter();
  runnerPartie = runnerNouvellePartie(mode, mots, {
    niveau: niveau,
    erreursPassees: mode === 'tuto' ? {} : runnerErreursPassees(niveau)
  });
  runnerPartie.affichage = runnerNouvelAffichage();
  runnerRendreCourse();
  const vue = document.getElementById('view-runner');
  if (!vue || !vue.classList.contains('active')) showView('view-runner');
  runnerLancerPortail(runnerPartie, 0);
  runnerMajMot();
  runnerMajHud(true);
  runnerDemarrerBoucle();
}

function runnerRendreCourse() {
  const box = document.getElementById('runner-jeu');
  const p = runnerPartie;
  if (!box || !p) return;
  runnerEcran = 'course';
  box.className = 'runner-jeu runner-ecran-course runner-mode-' + p.mode;
  let hud;
  if (p.mode === 'sprint') {
    hud = '<div class="runner-hud">' +
      '<div class="runner-hud-bloc"><span>TEMPS</span><strong id="runner-chrono">01:00</strong></div>' +
      '<div class="runner-vies" id="runner-vies" role="img" aria-label="3 vies">' +
        [0, 1, 2].map(i => '<i data-vie="' + i + '">' + runnerIcone('coeur') + '</i>').join('') + '</div>' +
      '<div class="runner-hud-bloc runner-hud-score"><span>SCORE</span><strong id="runner-score">0</strong>' +
        '<em id="runner-gain" aria-hidden="true"></em></div></div>' +
      '<div class="runner-piste" role="progressbar" aria-label="Progression vers 60 secondes" aria-valuemin="0" aria-valuemax="60" aria-valuenow="0"><i id="runner-progres"></i></div>';
  } else {
    const titre = p.mode === 'tuto' ? 'TUTORIEL' : 'ENTRAÎNEMENT';
    hud = '<div class="runner-hud">' +
      '<div class="runner-hud-bloc"><span>' + titre + '</span><strong id="runner-compteur">0</strong></div>' +
      (p.mode === 'entrainement'
        ? '<button type="button" class="runner-terminer" onclick="runnerTerminerEntrainement()">Terminer</button>'
        : '') +
      '</div>';
  }
  box.innerHTML =
    '<div class="runner-top runner-top-course"><span>LUX RUNNER · ' + runnerEchapper(p.niveau) + '</span>' +
      '<button type="button" class="runner-pause-btn" onclick="runnerPause()" aria-label="Mettre en pause">' +
      runnerIcone('pause') + '</button></div>' +
    hud +
    '<div class="runner-mot" aria-live="polite"><h1 id="runner-lemme" lang="lb"></h1><p id="runner-traduction"></p></div>' +
    '<div class="runner-scene" id="runner-scene">' +
      '<canvas id="runner-canvas" aria-hidden="true"></canvas>' +
      '<div id="runner-feedback" class="runner-feedback" role="status" aria-live="polite"></div>' +
      '<div id="runner-aide" class="runner-aide" aria-hidden="true"></div>' +
    '</div>' +
    '<div class="runner-voies" role="group" aria-label="Choisir le genre">' +
      RUNNER_VOIES.map((g, i) =>
        '<button type="button" class="runner-voie runner-' + g + '" data-genre="' + g + '" aria-pressed="false" ' +
        'onclick="runnerChoisir(\'' + g + '\')" aria-label="' + RUNNER_GENRES[g].nom + ' (touche ' + (i + 1) + ')">' +
        '<b>' + RUNNER_GENRES[g].lettre + '</b><span>' + RUNNER_GENRES[g].nom + '</span></button>').join('') +
    '</div>' +
    '<div id="runner-pause" class="runner-pause" hidden>' +
      '<div class="runner-pause-carte" role="dialog" aria-modal="true" aria-labelledby="runner-pause-titre">' +
        '<h2 id="runner-pause-titre">Pause</h2><p>Le chrono et les portails sont arrêtés.</p>' +
        '<button type="button" class="jeux-jouer" onclick="runnerReprendre()">Reprendre</button>' +
        '<button type="button" class="runner-secondaire" onclick="runnerQuitterPartie()">Quitter la partie</button>' +
      '</div></div>';
  runnerAttacherScene();
}

// Mot du portail en cours : remplacé seulement quand le portail change.
function runnerMajMot() {
  const p = runnerPartie;
  if (!p) return;
  const lemme = document.getElementById('runner-lemme');
  const trad = document.getElementById('runner-traduction');
  const portail = p.portail;
  if (!lemme || !trad) return;
  if (portail && portail.mot) {
    lemme.textContent = portail.mot.lemma;
    trad.textContent = portail.mot.translation;
    lemme.parentNode.className = 'runner-mot';
  } else if (portail && portail.arrivee) {
    lemme.textContent = 'Arrivée';
    trad.textContent = 'Dernière ligne droite';
    lemme.parentNode.className = 'runner-mot runner-mot-arrivee';
  }
  runnerMajVoies();
}

function runnerMajVoies() {
  const p = runnerPartie;
  if (!p) return;
  const attente = p.mode === 'tuto' && p.choix === null && p.portail && !p.portail.arrivee;
  document.querySelectorAll('#runner-jeu .runner-voie').forEach(b => {
    const choisi = b.getAttribute('data-genre') === p.choix;
    b.setAttribute('aria-pressed', String(choisi));
    b.classList.toggle('runner-voie-choisie', choisi);
  });
  const aide = document.getElementById('runner-aide');
  if (aide) {
    const texte = attente ? 'Touche une voie pour choisir' : '';
    if (aide.textContent !== texte) aide.textContent = texte;
  }
}

// HUD : seules les valeurs qui changent sont écrites (pas de DOM recréé).
function runnerMajHud(force) {
  const p = runnerPartie;
  if (!p) return;
  const a = p.affichage;
  if (p.mode === 'sprint') {
    const texte = runnerFormatTemps(RUNNER_DUREE_SPRINT - p.temps);
    if (force || a.chrono !== texte) {
      a.chrono = texte;
      const chrono = document.getElementById('runner-chrono');
      if (chrono) chrono.textContent = texte;
      const piste = document.querySelector('#runner-jeu .runner-piste');
      if (piste) piste.setAttribute('aria-valuenow', String(Math.floor(p.temps)));
    }
    const progres = document.getElementById('runner-progres');
    if (progres) progres.style.transform = 'scaleX(' + Math.min(1, p.temps / RUNNER_DUREE_SPRINT) + ')';
    if (force || a.vies !== p.vies) {
      a.vies = p.vies;
      const vies = document.getElementById('runner-vies');
      if (vies) {
        vies.setAttribute('aria-label', p.vies + (p.vies > 1 ? ' vies' : ' vie'));
        vies.querySelectorAll('i').forEach((coeur, i) => coeur.classList.toggle('runner-vie-perdue', i >= p.vies));
      }
    }
    if (force || a.score !== p.score) {
      a.score = p.score;
      const score = document.getElementById('runner-score');
      if (score) score.textContent = p.score;
    }
  } else {
    const texte = p.mode === 'tuto'
      ? Math.min(p.rencontres + 1, RUNNER_TUTO_MOTS) + ' / ' + RUNNER_TUTO_MOTS
      : p.bons + ' / ' + p.rencontres;
    if (force || a.compteur !== texte) {
      a.compteur = texte;
      const compteur = document.getElementById('runner-compteur');
      if (compteur) compteur.textContent = texte;
    }
  }
}

// Correction discrète, non bloquante : le mot suivant reste lisible.
function runnerMontrerResultat(r) {
  const p = runnerPartie;
  const box = document.getElementById('runner-feedback');
  const genre = RUNNER_GENRES[r.mot.gender];
  if (box) {
    const debut = r.statut === 'correct' ? 'Correct' : r.statut === 'faux' ? 'Faux' : 'Trop tard';
    box.innerHTML = '<b>' + debut + '</b> · <span lang="lb">' + runnerEchapper(r.mot.articleForm) + '</span> · ' + genre.mot +
      (r.statut === 'absent' ? ' <small>Aucun portail choisi</small>' : '');
    box.className = 'runner-feedback runner-feedback-visible ' + (r.statut === 'correct' ? 'runner-ok' : 'runner-ko');
    if (p.affichage.feedbackTimer) clearTimeout(p.affichage.feedbackTimer);
    p.affichage.feedbackTimer = setTimeout(() => {
      if (box.className.indexOf('runner-feedback-visible') >= 0) box.className = box.className.replace(' runner-feedback-visible', '');
    }, RUNNER_FEEDBACK_MS);
  }
  if (r.statut === 'correct' && p.mode === 'sprint') {
    const gain = document.getElementById('runner-gain');
    const score = document.getElementById('runner-score');
    // Deux classes en alternance : l'animation repart sans reflow forcé.
    const suffixe = p.bons % 2 ? 'a' : 'b';
    if (gain) { gain.textContent = '+' + r.points; gain.className = 'runner-gain-anim-' + suffixe; }
    if (score) score.className = 'runner-score-anim-' + suffixe;
  }
  if (typeof jouerFeedbackSon === 'function') jouerFeedbackSon(r.statut === 'correct' ? 'success' : 'finalFailure');
  runnerEffetCollision(r);
}

function runnerPause() {
  const p = runnerPartie;
  if (!p || p.etat !== 'course') return;
  p.etat = 'pause';
  const voile = document.getElementById('runner-pause');
  if (voile) {
    voile.hidden = false;
    const bouton = voile.querySelector('button');
    if (bouton && bouton.focus) bouton.focus();
  }
}
function runnerReprendre() {
  const p = runnerPartie;
  if (!p || p.etat !== 'pause') return;
  p.etat = 'course';
  p.affichage.dernier = null; // pas de saut de temps à la reprise
  const voile = document.getElementById('runner-pause');
  if (voile) voile.hidden = true;
}
function runnerQuitterPartie() {
  runnerArreter();
  runnerRendrePreparation(false);
}
function quitterRunner() {
  runnerArreter();
  retour();
}
function runnerTerminerEntrainement() {
  const p = runnerPartie;
  if (!p || p.mode !== 'entrainement' || p.etat === 'fin') return;
  runnerFinir(p, true, p.temps);
  runnerFinDePartie();
}

// Arrêt complet : boucle, écouteurs et minuteries (aucune fuite entre parties).
function runnerArreter() {
  const p = runnerPartie;
  if (!p) return;
  if (p.etat !== 'fin') p.etat = 'fin';
  const a = p.affichage;
  if (a) {
    if (a.boucle !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(a.boucle);
    a.boucle = null;
    if (a.feedbackTimer) clearTimeout(a.feedbackTimer);
    if (a.finTimer) clearTimeout(a.finTimer);
    if (a.redimension && typeof window !== 'undefined') window.removeEventListener('resize', a.redimension);
  }
  runnerPartie = null;
}

function runnerFinDePartie() {
  const p = runnerPartie;
  if (!p || p.affichage.finProgrammee) return;
  p.affichage.finProgrammee = true;
  let battus = [];
  if (p.mode === 'sprint') battus = runnerEnregistrerSprint(p);
  if (p.mode !== 'tuto') runnerEnregistrerMots(p);
  if (p.mode === 'tuto') runnerMarquerTuto();
  // Laisser voir l'arrivée ou le dernier trébuchement, sans prolonger le chrono.
  const delai = p.mode === 'entrainement' ? 0 : 900;
  p.affichage.finTimer = setTimeout(() => {
    if (runnerPartie !== p) return;
    const copie = p;
    runnerArreter();
    if (copie.mode === 'tuto') runnerRendrePreparation(true);
    else runnerRendreResultats(copie, battus);
  }, delai);
}

function runnerRendreResultats(p, battus) {
  const box = document.getElementById('runner-jeu');
  if (!box) return;
  runnerEcran = 'resultats';
  const r = runnerRecords(p.niveau);
  const sprint = p.mode === 'sprint';
  const victoire = sprint && p.victoire;
  const titre = !sprint ? 'Entraînement terminé' : victoire ? 'Course terminée !' : 'Plus de vies !';
  const etat = !sprint ? 'ENTRAÎNEMENT' : victoire ? 'ARRIVÉE' : 'FIN DE COURSE';
  const intro = !sprint ? 'Tu as révisé tes genres à ton rythme.'
    : victoire ? 'Tu as franchi la ligne d’arrivée.'
    : 'Tu as tenu ' + runnerFormatTemps(p.finTemps) + '. Les mots ratés t’attendent ci-dessous.';
  const nouveauRecord = battus.indexOf('score') >= 0 && p.score > 0;
  const stats = sprint
    ? [['Score', p.score], [victoire ? 'Temps' : 'Temps de survie', runnerFormatTemps(p.finTemps)],
       ['Bonnes réponses', p.bons + ' / ' + p.rencontres], ['Précision', runnerPrecision(p) + ' %'],
       ['Plus long combo', p.maxSerie], ['Record', r.score]]
    : [['Bonnes réponses', p.bons + ' / ' + p.rencontres], ['Précision', runnerPrecision(p) + ' %'],
       ['Plus longue série', p.maxSerie]];
  // Une ligne par nom raté (le dernier choix est gardé).
  const parMot = {};
  p.erreurs.forEach(e => { parMot[e.mot.id] = e; });
  const erreurs = Object.keys(parMot).map(id => parMot[id]);
  const liste = erreurs.length
    ? '<ul class="runner-erreurs-liste">' + erreurs.map(e => {
        const g = RUNNER_GENRES[e.mot.gender];
        return '<li><div><strong lang="lb">' + runnerEchapper(e.mot.lemma) + '</strong><span>' + runnerEchapper(e.mot.translation) + '</span></div>' +
          '<div class="runner-erreur-correction"><b class="runner-txt-' + e.mot.gender + '">' + g.nom + '</b>' +
          '<span lang="lb">' + runnerEchapper(e.mot.articleForm) + '</span>' +
          '<small>' + (e.choix ? 'Ton choix : ' + RUNNER_GENRES[e.choix].nom : 'Aucun portail choisi') + '</small></div></li>';
      }).join('') + '</ul>'
    : '<p class="runner-sans-erreur">Aucune erreur. Bien joué !</p>';
  box.className = 'runner-jeu runner-ecran-resultats' + (victoire ? ' runner-victoire' : '');
  box.innerHTML =
    '<div class="runner-top"><button type="button" class="runner-retour" onclick="quitterRunner()">' + runnerIcone('retour') +
      ' Jeux</button><span>LUX RUNNER</span></div>' +
    '<div class="runner-resultat-scroll">' +
      '<main class="runner-resultat">' +
        '<span class="jeux-kicker">' + etat + '</span>' +
        '<h1>' + titre + '</h1>' +
        '<p class="runner-resultat-intro">' + intro + '</p>' +
        (nouveauRecord ? '<p class="runner-record"><span aria-hidden="true">✦</span> Nouveau record !</p>' : '') +
        '<dl class="runner-stats">' + stats.map(s => '<div><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>').join('') + '</dl>' +
        '<section id="runner-erreurs" class="runner-erreurs" aria-labelledby="runner-erreurs-titre">' +
          '<h2 id="runner-erreurs-titre">' + (sprint && !victoire ? 'Mots à retravailler' : 'Mes erreurs') +
          (erreurs.length ? ' <span>' + erreurs.length + '</span>' : '') + '</h2>' + liste + '</section>' +
      '</main>' +
    '</div>' +
    '<div class="runner-actions">' +
      '<button type="button" class="jeux-jouer" onclick="demarrerRunner(\'' + p.mode + '\')">Rejouer ' + runnerIcone('fleche') + '</button>' +
      (erreurs.length ? '<button type="button" class="runner-secondaire" onclick="runnerVoirErreurs()">Revoir mes erreurs</button>' : '') +
      '<button type="button" class="runner-lien" onclick="quitterRunner()">Retour aux jeux</button>' +
    '</div>';
}

function runnerVoirErreurs() {
  const section = document.getElementById('runner-erreurs');
  if (!section) return;
  section.classList.add('runner-erreurs-focus');
  if (section.scrollIntoView) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── 5. BOUCLE ET RENDU CANVAS ──────────────────────────────────────────────

function runnerNouvelAffichage() {
  return {
    boucle: null, dernier: null, canvas: null, ctx: null, largeur: 0, hauteur: 0, ratio: 1,
    ville: null, voieX: 1, secousse: 0, eclat: null, particules: [], passe: null,
    feedbackTimer: null, finTimer: null, finProgrammee: false, redimension: null,
    portailAffiche: null, chrono: '', vies: -1, score: -1, compteur: '', glisse: null
  };
}

function runnerMouvementReduit() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function runnerDemarrerBoucle() {
  const p = runnerPartie;
  if (!p || typeof requestAnimationFrame !== 'function') return;
  p.affichage.dernier = null;
  p.affichage.boucle = requestAnimationFrame(runnerImage);
}

function runnerImage(maintenant) {
  const p = runnerPartie;
  if (!p) return;
  const a = p.affichage;
  a.boucle = null;
  const vue = document.getElementById('view-runner');
  if (!vue || !vue.classList.contains('active')) { runnerArreter(); return; } // Retour Android
  // Écart entre deux images, borné : un ralentissement ne fait pas sauter un portail.
  let dt = a.dernier === null ? 0 : (maintenant - a.dernier) / 1000;
  a.dernier = maintenant;
  dt = Math.min(Math.max(dt, 0), 0.1);
  if (p.etat === 'course') {
    const ancien = p.portail;
    const resultats = runnerAvancer(p, dt);
    resultats.forEach(runnerMontrerResultat);
    if (p.portail !== ancien) runnerMajMot();
    runnerMajHud(false);
    if (p.etat === 'fin') runnerFinDePartie();
  }
  runnerMettreAJourEffets(p, p.etat === 'pause' ? 0 : dt);
  runnerDessiner(p);
  if (runnerPartie === p) a.boucle = requestAnimationFrame(runnerImage);
}

function runnerAttacherScene() {
  const p = runnerPartie;
  const canvas = document.getElementById('runner-canvas');
  if (!p || !canvas || !canvas.getContext) return;
  const a = p.affichage;
  a.canvas = canvas;
  a.ctx = canvas.getContext('2d');
  a.redimension = runnerRedimensionner;
  window.addEventListener('resize', a.redimension);
  runnerRedimensionner();
  const scene = document.getElementById('runner-scene');
  if (scene) {
    scene.addEventListener('pointerdown', runnerToucherDebut);
    scene.addEventListener('pointerup', runnerToucherFin);
    scene.addEventListener('pointercancel', () => { if (runnerPartie) runnerPartie.affichage.glisse = null; });
  }
}

function runnerRedimensionner() {
  const p = runnerPartie;
  if (!p || !p.affichage.canvas) return;
  const a = p.affichage;
  const rect = a.canvas.getBoundingClientRect();
  a.ratio = Math.min(2, window.devicePixelRatio || 1);
  a.largeur = Math.max(1, rect.width);
  a.hauteur = Math.max(1, rect.height);
  a.canvas.width = Math.round(a.largeur * a.ratio);
  a.canvas.height = Math.round(a.hauteur * a.ratio);
  a.ville = runnerDessinerVille(a.largeur * 1.3, a.hauteur * 0.2, a.ratio);
}

// Silhouettes de la ville, dessinées une seule fois (pas à chaque image).
function runnerDessinerVille(largeur, hauteur, ratio) {
  if (typeof document === 'undefined' || !document.createElement) return null;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(largeur * ratio));
  c.height = Math.max(1, Math.round(hauteur * ratio));
  const g = c.getContext('2d');
  if (!g) return null;
  g.scale(ratio, ratio);
  // Hasard fixe : la même ville à chaque partie.
  let graine = 7;
  const hasard = () => { graine = (graine * 9301 + 49297) % 233280; return graine / 233280; };
  let x = 0;
  while (x < largeur) {
    const l = 14 + hasard() * 30;
    const h = hauteur * (0.28 + hasard() * 0.6);
    g.fillStyle = hasard() < 0.5 ? '#17150f' : '#1c1913';
    g.fillRect(x, hauteur - h, l, h);
    if (hasard() < 0.18) { // flèche d'église / tour
      g.beginPath();
      g.moveTo(x + l / 2 - 4, hauteur - h);
      g.lineTo(x + l / 2, hauteur - h - 16 - hasard() * 12);
      g.lineTo(x + l / 2 + 4, hauteur - h);
      g.fill();
    }
    for (let fy = hauteur - h + 5; fy < hauteur - 4; fy += 7) {
      for (let fx = x + 3; fx < x + l - 4; fx += 6) {
        if (hasard() < 0.22) {
          g.fillStyle = 'rgba(245,207,77,' + (0.25 + hasard() * 0.45).toFixed(2) + ')';
          g.fillRect(fx, fy, 2, 3);
        }
      }
    }
    x += l + hasard() * 3;
  }
  return c;
}

// Perspective : profondeur d = 1 (horizon) → 0 (ligne du coureur).
// s = 1 à la ligne du coureur, 0 à l'horizon ; > 1 sous le coureur.
const RUNNER_PERSPECTIVE = 3;
function runnerEchelle(d) {
  const brut = 1 / (1 + d * RUNNER_PERSPECTIVE);
  const loin = 1 / (1 + RUNNER_PERSPECTIVE);
  return (brut - loin) / (1 - loin);
}

function runnerGeometrie(a) {
  const W = a.largeur, H = a.hauteur;
  return {
    W: W, H: H, cx: W / 2,
    horizon: H * 0.2,
    ligne: H * 0.84,                       // ligne des portails = position du coureur
    demiLoin: W * 0.035,
    demiPres: Math.min(W * 0.48, H * 0.55)
  };
}
function runnerPoint(geo, d) {
  const s = runnerEchelle(d);
  return {
    s: s,
    y: geo.horizon + (geo.ligne - geo.horizon) * s,
    demi: geo.demiLoin + (geo.demiPres - geo.demiLoin) * s
  };
}
function runnerVoieX(geo, pt, voie) {
  return geo.cx + (voie - 1) * (2 / 3) * pt.demi;
}

function runnerEffetCollision(r) {
  const p = runnerPartie;
  if (!p) return;
  const a = p.affichage;
  const reduit = runnerMouvementReduit();
  const voieBonne = RUNNER_VOIES.indexOf(r.mot.gender);
  a.passe = { debut: r.temps, duree: r.duree, bonne: voieBonne, ok: r.statut === 'correct' };
  if (r.statut === 'correct') {
    const geo = runnerGeometrie(a);
    const pt = runnerPoint(geo, 0);
    const x = runnerVoieX(geo, pt, voieBonne);
    const nombre = reduit ? 6 : 22;
    for (let i = 0; i < nombre; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vitesse = 60 + Math.random() * 140;
      a.particules.push({ x: x, y: geo.ligne - pt.demi * 0.5, vx: Math.cos(angle) * vitesse,
        vy: Math.sin(angle) * vitesse - 60, vie: 0.6, age: 0, couleur: RUNNER_GENRES[r.mot.gender].couleur });
    }
    a.eclat = { voie: voieBonne, age: 0, couleur: RUNNER_GENRES[r.mot.gender].couleur };
  } else {
    if (!reduit) a.secousse = 0.4;
    // Indication du bon portail : sa voie s'éclaire brièvement.
    a.eclat = { voie: voieBonne, age: 0, couleur: RUNNER_GENRES[r.mot.gender].couleur, correction: true };
  }
}

function runnerMettreAJourEffets(p, dt) {
  const a = p.affichage;
  // Le coureur glisse vers la voie choisie (centre si aucun choix).
  const cible = p.choix ? RUNNER_VOIES.indexOf(p.choix) : 1;
  const vitesse = runnerMouvementReduit() ? 1 : Math.min(1, dt * 14);
  a.voieX += (cible - a.voieX) * vitesse;
  if (a.secousse > 0) a.secousse = Math.max(0, a.secousse - dt);
  if (a.eclat) { a.eclat.age += dt; if (a.eclat.age > 0.7) a.eclat = null; }
  a.particules = a.particules.filter(q => {
    q.age += dt;
    q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 260 * dt;
    return q.age < q.vie;
  });
}

function runnerDessiner(p) {
  const a = p.affichage;
  const g = a.ctx;
  if (!g || !a.largeur) return;
  const geo = runnerGeometrie(a);
  g.setTransform(a.ratio, 0, 0, a.ratio, 0, 0);
  // Ciel nocturne et lueur chaude à l'horizon.
  const ciel = g.createLinearGradient(0, 0, 0, geo.horizon);
  ciel.addColorStop(0, '#0f0e0c'); ciel.addColorStop(1, '#221c13');
  g.fillStyle = ciel; g.fillRect(0, 0, geo.W, geo.horizon + 1);
  const halo = g.createRadialGradient(geo.cx, geo.horizon, 0, geo.cx, geo.horizon, geo.W * 0.6);
  halo.addColorStop(0, 'rgba(245,207,77,0.16)'); halo.addColorStop(1, 'rgba(245,207,77,0)');
  g.fillStyle = halo; g.fillRect(0, 0, geo.W, geo.horizon + 1);
  // Ville en parallaxe : légère dérive opposée au coureur.
  if (a.ville) {
    const decalage = (a.voieX - 1) * geo.W * 0.03;
    const villeL = a.ville.width / a.ratio, villeH = a.ville.height / a.ratio;
    g.drawImage(a.ville, -geo.W * 0.15 - decalage, geo.horizon - villeH + 1, villeL, villeH);
  }
  // Sol.
  g.fillStyle = '#0b0a08'; g.fillRect(0, geo.horizon, geo.W, geo.H - geo.horizon);
  // Route : trapèze de l'horizon jusqu'au bas de l'écran.
  const basD = runnerProfondeurBas(geo);
  const haut = runnerPoint(geo, 1), bas = runnerPointBas(geo);
  g.fillStyle = '#1a1916';
  g.beginPath();
  g.moveTo(geo.cx - haut.demi, haut.y); g.lineTo(geo.cx + haut.demi, haut.y);
  g.lineTo(geo.cx + bas.demi, bas.y); g.lineTo(geo.cx - bas.demi, bas.y); g.closePath(); g.fill();
  // Voie choisie mise en évidence.
  if (p.choix) runnerDessinerVoie(g, geo, RUNNER_VOIES.indexOf(p.choix), RUNNER_GENRES[p.choix].couleur, 0.14);
  if (a.eclat) runnerDessinerVoie(g, geo, a.eclat.voie, a.eclat.couleur, (a.eclat.correction ? 0.32 : 0.22) * (1 - a.eclat.age / 0.7));
  // Bords lumineux.
  g.strokeStyle = 'rgba(245,207,77,0.38)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(geo.cx - haut.demi, haut.y); g.lineTo(geo.cx - bas.demi, bas.y);
  g.moveTo(geo.cx + haut.demi, haut.y); g.lineTo(geo.cx + bas.demi, bas.y); g.stroke();
  // Marquages qui défilent à la même vitesse que les portails (un seul système).
  runnerDessinerMarquages(g, geo, p.distance, basD);
  // Portails : le trio franchi (qui disparaît) puis le trio qui arrive.
  if (a.passe) {
    const age = p.temps - a.passe.debut;
    if (age < RUNNER_PASSAGE) runnerDessinerTrio(g, geo, -age / a.passe.duree, 1 - age / RUNNER_PASSAGE, a.passe);
    else a.passe = null;
  }
  const portail = p.portail;
  if (portail) {
    const progres = Math.min(1, Math.max(0, (p.temps - portail.debut) / portail.duree));
    const apparition = Math.min(1, progres / 0.12);
    if (portail.arrivee) runnerDessinerArrivee(g, geo, 1 - progres, apparition);
    else runnerDessinerTrio(g, geo, 1 - progres, apparition, null);
  }
  runnerDessinerCoureur(g, geo, p);
  // Particules de réussite.
  a.particules.forEach(q => {
    g.globalAlpha = Math.max(0, 1 - q.age / q.vie);
    g.fillStyle = q.couleur;
    g.fillRect(q.x - 2, q.y - 2, 4, 4);
  });
  g.globalAlpha = 1;
}

function runnerPointBas(geo) {
  return runnerPointSous(geo, runnerProfondeurBas(geo));
}

function runnerDessinerVoie(g, geo, voie, couleur, alpha) {
  if (alpha <= 0) return;
  const haut = runnerPoint(geo, 1), bas = runnerPointBas(geo);
  const bord = (pt, cote) => geo.cx + ((voie - 1) * 2 / 3 + cote / 3) * pt.demi;
  g.globalAlpha = alpha;
  g.fillStyle = couleur;
  g.beginPath();
  g.moveTo(bord(haut, -1), haut.y); g.lineTo(bord(haut, 1), haut.y);
  g.lineTo(bord(bas, 1), bas.y); g.lineTo(bord(bas, -1), bas.y); g.closePath(); g.fill();
  g.globalAlpha = 1;
}

function runnerDessinerMarquages(g, geo, distance, basD) {
  const pas = 0.1, longueur = 0.05;
  const decalage = (distance % pas + pas) % pas;
  g.fillStyle = 'rgba(246,241,233,0.32)';
  for (let z = 1 - decalage; z > basD - pas; z -= pas) {
    const z2 = Math.max(basD, z - longueur);
    if (z2 >= 1) continue;
    const loin = runnerPointZ(geo, z), pres = runnerPointZ(geo, z2);
    for (const cote of [-1, 1]) {
      const x1 = geo.cx + cote / 3 * loin.demi, x2 = geo.cx + cote / 3 * pres.demi;
      const e1 = Math.max(0.5, 2.2 * loin.s), e2 = Math.max(0.5, 2.2 * pres.s);
      g.beginPath();
      g.moveTo(x1 - e1, loin.y); g.lineTo(x1 + e1, loin.y);
      g.lineTo(x2 + e2, pres.y); g.lineTo(x2 - e2, pres.y); g.closePath(); g.fill();
    }
  }
}

// Trois arches à la profondeur d. passe : trio déjà franchi (bonne voie en évidence).
function runnerDessinerTrio(g, geo, d, opacite, passe) {
  const pt = runnerPointZ(geo, d);
  const largeurVoie = (2 / 3) * pt.demi;
  RUNNER_VOIES.forEach((genre, voie) => {
    const info = RUNNER_GENRES[genre];
    let alpha = opacite;
    if (passe) alpha *= voie === passe.bonne ? 1 : 0.35;
    if (alpha <= 0.01) return;
    const x = runnerVoieX(geo, pt, voie);
    const l = largeurVoie * 0.84, h = largeurVoie * 1.15;
    const pilier = Math.max(2, l * 0.1);
    const base = pt.y, sommet = pt.y - h;
    g.globalAlpha = alpha * (passe ? 0.08 : 0.18);
    g.fillStyle = info.couleur;
    g.fillRect(x - l / 2, sommet, l, h); // voile lumineux dans l'arche
    g.globalAlpha = alpha;
    g.fillRect(x - l / 2, sommet, pilier, h);
    g.fillRect(x + l / 2 - pilier, sommet, pilier, h);
    const bandeau = Math.max(4, h * 0.26);
    g.fillRect(x - l / 2, sommet, l, bandeau);
    if (bandeau > 9) {
      g.fillStyle = '#0f0e0c';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      const taille = Math.round(bandeau * 0.72);
      g.font = '800 ' + taille + 'px Inter, system-ui, sans-serif';
      if (l > taille * 4.6) g.fillText(info.lettre + ' · ' + info.nom.toUpperCase(), x, sommet + bandeau / 2 + 1);
      else g.fillText(info.lettre, x, sommet + bandeau / 2 + 1);
    }
    if (passe && voie === passe.bonne && !passe.ok) { // correction : contour blanc
      g.strokeStyle = '#f6f1e9'; g.lineWidth = 2;
      g.strokeRect(x - l / 2 - 3, sommet - 3, l + 6, h + 6);
    }
  });
  g.globalAlpha = 1;
}

// Sous la ligne du coureur (d < 0), la route continue de s'élargir.
// Pente choisie pour prolonger runnerEchelle sans cassure (≈ 4 en d = 0).
const RUNNER_PENTE_SOUS = 4;
function runnerPointSous(geo, d) {
  const s = 1 - d * RUNNER_PENTE_SOUS;
  return { s: s, y: geo.horizon + (geo.ligne - geo.horizon) * s, demi: geo.demiLoin + (geo.demiPres - geo.demiLoin) * s };
}
// Profondeur qui correspond au bas de l'écran (négative).
function runnerProfondeurBas(geo) {
  const s = (geo.H - geo.horizon) / (geo.ligne - geo.horizon);
  return (1 - s) / RUNNER_PENTE_SOUS;
}
function runnerPointZ(geo, d) {
  return d >= 0 ? runnerPoint(geo, Math.min(1, d)) : runnerPointSous(geo, d);
}

function runnerDessinerArrivee(g, geo, d, opacite) {
  const pt = runnerPoint(geo, d);
  const l = pt.demi * 2 * 0.98, h = pt.demi * 0.9;
  const x = geo.cx - l / 2, sommet = pt.y - h;
  const pilier = Math.max(2, l * 0.03);
  g.globalAlpha = opacite;
  g.fillStyle = '#f5cf4d';
  g.fillRect(x, sommet, pilier, h);
  g.fillRect(x + l - pilier, sommet, pilier, h);
  const bandeau = Math.max(4, h * 0.2);
  // Damier d'arrivée.
  const cases = 16, c = l / cases;
  for (let i = 0; i < cases; i++) {
    g.fillStyle = i % 2 ? '#f5cf4d' : '#0f0e0c';
    g.fillRect(x + i * c, sommet, c, bandeau / 2);
    g.fillStyle = i % 2 ? '#0f0e0c' : '#f5cf4d';
    g.fillRect(x + i * c, sommet + bandeau / 2, c, bandeau / 2);
  }
  if (bandeau > 12) {
    g.fillStyle = '#f5cf4d';
    g.textAlign = 'center'; g.textBaseline = 'bottom';
    g.font = '800 ' + Math.round(bandeau * 0.8) + 'px Inter, system-ui, sans-serif';
    g.fillText('ARRIVÉE', geo.cx, sommet - 4);
  }
  g.globalAlpha = 1;
}

// Coureur vu de dos, simple et contrasté, dans le tiers inférieur.
function runnerDessinerCoureur(g, geo, p) {
  const a = p.affichage;
  const pt = runnerPoint(geo, 0);
  let x = geo.cx + (a.voieX - 1) * (2 / 3) * pt.demi;
  const taille = Math.min(64, geo.H * 0.15);
  const enCourse = p.etat !== 'fin' || !p.victoire;
  const phase = p.temps * 13;
  let rebond = enCourse ? Math.abs(Math.sin(phase)) * taille * 0.05 : 0;
  let bras = Math.sin(phase) * 0.6;
  let inclinaison = 0;
  if (a.secousse > 0) {
    x += Math.sin(a.secousse * 70) * 6 * (a.secousse / 0.4);
    inclinaison = 0.25 * (a.secousse / 0.4);
  }
  if (p.etat === 'fin' && p.victoire && p.mode === 'sprint') { rebond = taille * 0.18; bras = 2.6; } // bras levés
  const pied = geo.ligne + taille * 0.08;
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.beginPath(); g.ellipse(x, pied, taille * 0.28, taille * 0.07, 0, 0, Math.PI * 2); g.fill();
  g.save();
  g.translate(x, pied - rebond);
  g.rotate(inclinaison);
  const t = taille;
  g.strokeStyle = '#f6f1e9'; g.lineCap = 'round';
  // Jambes.
  g.lineWidth = t * 0.11;
  const jambe = Math.sin(phase) * t * 0.12;
  g.beginPath(); g.moveTo(-t * 0.08, -t * 0.42); g.lineTo(-t * 0.1, -t * 0.02 - Math.max(0, jambe));
  g.moveTo(t * 0.08, -t * 0.42); g.lineTo(t * 0.1, -t * 0.02 - Math.max(0, -jambe)); g.stroke();
  // Bras.
  g.lineWidth = t * 0.08;
  g.beginPath();
  g.moveTo(-t * 0.15, -t * 0.72); g.lineTo(-t * 0.26, -t * 0.5 - bras * t * 0.12);
  g.moveTo(t * 0.15, -t * 0.72); g.lineTo(t * 0.26, -t * 0.5 + bras * t * 0.12); g.stroke();
  // Torse.
  g.fillStyle = '#f6f1e9';
  g.beginPath(); g.ellipse(0, -t * 0.62, t * 0.17, t * 0.24, 0, 0, Math.PI * 2); g.fill();
  // Écharpe or (couleur LuxApp) et tête.
  g.fillStyle = '#f5cf4d';
  g.fillRect(-t * 0.15, -t * 0.84, t * 0.3, t * 0.07);
  g.fillStyle = '#e8dfcf';
  g.beginPath(); g.arc(0, -t * 0.96, t * 0.13, 0, Math.PI * 2); g.fill();
  g.restore();
}

// ─── 6. CONTRÔLES ───────────────────────────────────────────────────────────

// Sélectionne une voie ; la réponse ne sera validée qu'à la collision.
function runnerChoisir(genre) {
  const p = runnerPartie;
  if (!p || p.etat !== 'course' || !p.portail || p.portail.arrivee || !RUNNER_GENRES[genre]) return;
  p.choix = genre;
  runnerMajVoies();
}

// Voie voisine (glisser, flèches). Sans choix, on part du centre.
function runnerVoisine(sens) {
  const p = runnerPartie;
  if (!p) return;
  const actuelle = p.choix ? RUNNER_VOIES.indexOf(p.choix) : 1;
  const nouvelle = Math.max(0, Math.min(2, actuelle + sens));
  runnerChoisir(RUNNER_VOIES[nouvelle]);
}

function runnerToucherDebut(e) {
  const p = runnerPartie;
  if (!p) return;
  p.affichage.glisse = { x: e.clientX, y: e.clientY };
}
function runnerToucherFin(e) {
  const p = runnerPartie;
  if (!p || !p.affichage.glisse) return;
  const dx = e.clientX - p.affichage.glisse.x;
  const dy = e.clientY - p.affichage.glisse.y;
  p.affichage.glisse = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { runnerVoisine(dx > 0 ? 1 : -1); return; }
  if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
    // Toucher la route : la voie sous le doigt (tiers de la scène).
    const rect = e.currentTarget.getBoundingClientRect();
    const tiers = Math.floor(3 * (e.clientX - rect.left) / Math.max(1, rect.width));
    runnerChoisir(RUNNER_VOIES[Math.max(0, Math.min(2, tiers))]);
  }
}

function runnerClavier(e) {
  const vue = document.getElementById('view-runner');
  const p = runnerPartie;
  if (!vue || !vue.classList.contains('active') || !p || e.altKey || e.ctrlKey || e.metaKey) return;
  let traite = true;
  if (p.etat === 'course') {
    if (e.key === '1') runnerChoisir('m');
    else if (e.key === '2') runnerChoisir('f');
    else if (e.key === '3') runnerChoisir('n');
    else if (e.key === 'ArrowLeft') runnerVoisine(-1);
    else if (e.key === 'ArrowRight') runnerVoisine(1);
    else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') runnerPause();
    else traite = false;
  } else if (p.etat === 'pause' && (e.key === 'Escape' || e.key === 'p' || e.key === 'P')) {
    runnerReprendre();
  } else traite = false;
  if (traite) { e.preventDefault(); e.stopPropagation(); }
}

// Application en arrière-plan (écran éteint, appel…) : pause automatique.
function runnerVisibilite() {
  if (document.visibilityState === 'hidden') runnerPause();
}

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('keydown', runnerClavier, true);
  document.addEventListener('visibilitychange', runnerVisibilite);
}
