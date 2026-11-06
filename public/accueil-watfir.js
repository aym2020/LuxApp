/* Watfir 2.2 — habillage de l'accueil uniquement, chargé APRÈS accueil-v21.js.
   Les fonctions de calcul, les destinations, la sauvegarde et les jeux restent en 2.1. */
(function () {
  'use strict';
  const renduV21 = renderAccueil;
  const carteV21 = carteSuiteHtml;

  function familleNiveau(n) { return String(n).split('.')[0]; }
  function niveauxFamille() {
    const niveaux = niveauxDisponibles();
    const famille = familleNiveau(niveauActif);
    const proches = niveaux.filter(n => familleNiveau(n) === famille);
    if (proches.length <= 2) return proches;
    const index = Math.max(0, proches.indexOf(niveauActif));
    return proches.slice(Math.min(index, proches.length - 2), Math.min(index, proches.length - 2) + 2);
  }

  // Maquette V4 : une seule ligne — marque, niveaux, puis le groupe compte (séparateur,
  // compte invité, réglages). Le groupe compte reste d'un bloc : si la ligne ne tient
  // plus (petit écran, grande police), il passe ensemble à la ligne (voir CSS).
  enteteAccueilHtml = function () {
    const sync = etatSynchro();
    const compteInvite = !!ligneCompteHtml();
    const boutons = niveauxFamille().map(n =>
      '<button type="button" class="puce-niv wf-niveau-btn" data-wf-niveau="' + escHtml(n) +
      '" aria-pressed="' + (n === niveauActif) + '">' + escHtml(n) + '</button>'
    ).join('');
    return '<div class="ac-ent wf-entete entre">' +
      '<div class="ac-marque">' +
        '<img class="ac-marque-symbole" src="art/watfir-logo-v4.svg?v=2" alt="" width="80" height="100">' +
        '<div class="wf-marque-texte"><h1 class="ac-titre">Watfir</h1><span class="ac-marque-sous">Lëtzebuergesch</span></div>' +
      '</div>' +
      '<div class="puces-niveau" role="group" aria-label="Niveau actif">' +
        boutons +
        '<button type="button" class="puce-niv wf-niveau-ouvrir" aria-label="Choisir un niveau" ' +
          'aria-haspopup="dialog" aria-expanded="false">' + ICONES.chevron + '</button>' +
      '</div>' +
      '<div class="wf-entete-compte">' +
        (compteInvite
          ? '<span class="wf-entete-sep" aria-hidden="true"></span>' +
            '<button type="button" class="ac-v21-guest" onclick="ouvrirCompteDepuisAccueil(\'signin\')" ' +
            // Le nom lu commence par le mot affiché « Connexion » (commande vocale, WCAG 2.5.3).
            'aria-label="Connexion, mode invité"><span class="wf-invite-mode">Mode invité</span>' +
            '<b>Connexion</b></button>'
          : '') +
        '<button type="button" class="ac-menu" aria-label="' + escHtml(libelleMenuSynchro(sync)) +
          '" onclick="ouvrirPlus()">' + ICONES.reglages +
          '<span class="ac-sync-slot" aria-hidden="true">' + pastilleSynchroHtml(sync) + '</span></button>' +
      '</div>' +
    '</div>';
  };

  // ── Prénom facultatif (Réglages) ──────────────────────────────────────
  // Rangé dans le « choix » déjà synchronisé (niveau.js / cloud.js) :
  // { valeur, maj }, fusionné par « le plus récent gagne ». Aucune nouvelle clé cloud.
  const PRENOM_MAX = 20;
  function lirePrenom() {
    const choix = typeof getChoix === 'function' ? getChoix() : {};
    const p = choix && choix.prenom && choix.prenom.valeur;
    return p ? String(p).trim().slice(0, PRENOM_MAX) : '';
  }
  globalThis.lirePrenom = lirePrenom;

  // Formulaire des Réglages : enregistre (ou efface si vide), puis rafraîchit l'accueil.
  globalThis.enregistrerPrenom = function (event) {
    if (event && event.preventDefault) event.preventDefault();
    const champ = document.getElementById('reglage-prenom');
    if (!champ || typeof getChoix !== 'function' || typeof saveChoix !== 'function') return;
    const valeur = String(champ.value || '').replace(/\s+/g, ' ').trim().slice(0, PRENOM_MAX);
    const choix = getChoix();
    choix.prenom = { valeur: valeur, maj: Date.now() };
    saveChoix(choix);
    if (typeof debounceCloudSave === 'function') debounceCloudSave();
    const statut = document.getElementById('reglage-prenom-statut');
    if (statut) statut.textContent = valeur ? 'Enregistré\u00a0: «\u00a0Moien, ' + valeur + '!\u00a0»' : 'Prénom retiré.';
    if (typeof renderAccueil === 'function') renderAccueil(false);
  };

  // À l'ouverture des Réglages, le champ affiche le prénom enregistré.
  // app.js (qui définit openReglages) est chargé APRÈS ce fichier : on l'enveloppe
  // une fois toute la page chargée.
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof openReglages !== 'function') return;
    const ouvrirReglagesV21 = openReglages;
    openReglages = function () {
      ouvrirReglagesV21.apply(this, arguments);
      const champ = document.getElementById('reglage-prenom');
      if (champ) champ.value = lirePrenom();
      const statut = document.getElementById('reglage-prenom-statut');
      if (statut) statut.textContent = '';
    };
  });

  // ── Hero : « Moien, prénom! », écoute du mot, rubans en plongée ─────────
  // nouveau : appelé sans argument par le moteur pour un premier accueil,
  // avec false pour un utilisateur qui a déjà pratiqué.
  const RUBAN_PLONGEE = 'M-20 20C150 20 230 131 420 131S690 125 800 59S900 2 961 8';
  accrocheHtml = function (nouveau) {
    const prenom = lirePrenom();
    const premiereVisite = nouveau !== false;
    // Les prénoms longs réduisent le titre au lieu de déborder de l'écran.
    const taille = prenom.length > 14 ? ' wf-salut-xs' : prenom.length > 9 ? ' wf-salut-s' : '';
    const titre = prenom
      ? '<span lang="lb">Moien,</span> <span>' + escHtml(prenom) + '<span class="wf-salut-ex">!</span></span>'
      : '<span><span lang="lb">Moien</span><span class="wf-salut-ex">!</span></span>';
    const bonjour = prenom ? 'Bonjour, ' + escHtml(prenom) + '.' : 'Bonjour.';
    const suite = premiereVisite ? 'Ton premier mot. Le reste commence ici.' : 'Prêt pour ta mission ?';
    return '<section class="ac-hero entre-2" aria-label="Bienvenue">' +
      '<div class="ac-hero-texte">' +
        '<h2 class="wf-salut' + taille + '">' + titre + '</h2>' +
        '<div class="wf-hero-ecoute">' +
          '<button type="button" class="wf-hero-ecouter" onclick="jouerAudio(\'moien.mp3\', this)" ' +
            'aria-label="Écouter « Moien »">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>' +
          '<p class="wf-hero-trad"><b>' + bonjour + '</b><small>' + suite + '</small></p>' +
        '</div>' +
      '</div>' +
      // Rubans identitaires : le rouge plonge sous le texte puis remonte ; le cyan suit.
      // Épaisseur et décalage en CSS : mêmes traits à l'écran que sur le portail.
      '<svg class="wf-hero-rubans" viewBox="0 -24 941 260" aria-hidden="true" focusable="false">' +
        '<path class="wf-ruban-rouge" d="' + RUBAN_PLONGEE + '"/>' +
        '<g class="wf-ruban-bas">' +
          '<path class="wf-ruban-filet" d="' + RUBAN_PLONGEE + '"/>' +
          '<path class="wf-ruban-cyan" d="' + RUBAN_PLONGEE + '"/>' +
        '</g>' +
      '</svg>' +
    '</section>';
  };

  // ── État des lieux (§33) : série et niveau en bandes, comme les rubans ──
  // Rouge = régularité (7 jours de la semaine), cyan = avancement (une bande par
  // leçon du niveau). Données réelles 2.1 : semaineEnCours(), serieActuelle(),
  // leconsDuNiveau(). --i fixe l'ordre de l'animation de remplissage.
  const NOMS_JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  function etatJour(j) {
    if (j.valeur === 2) return 'objectif atteint';
    if (j.valeur === 1) return 'pratique commencée';
    return j.futur ? 'à venir' : 'pas de pratique';
  }
  function etatLecon(l) {
    if (leconTerminee(l) || acquiseAncienneVersion(l)) return 'ok';
    return etapesFaites(l) > 0 ? 'demi' : '';
  }
  chiffresHtml = function () {
    const serie = serieActuelle();
    const semaine = semaineEnCours();
    const lecons = leconsDuNiveau(niveauActif);
    const etats = lecons.map(etatLecon);
    const faites = etats.filter(e => e === 'ok').length;
    const jours = serie > 1 ? 'jours' : 'jour';
    const resume = 'Série de ' + serie + ' ' + jours + '. Cette semaine : ' + semaine.map((j, i) =>
      NOMS_JOURS[i] + ' ' + etatJour(j) + (j.aujourdhui ? ' (aujourd’hui)' : '')).join(', ') + '.';
    const bandesJours = semaine.map((j, i) =>
      '<i class="' + (j.valeur === 2 ? 'ok' : j.valeur === 1 ? 'demi' : '') +
      (j.aujourdhui ? ' auj' : '') + '" style="--i:' + i + '"></i>').join('');
    const lettres = semaine.map(j => '<span' + (j.aujourdhui ? ' class="auj"' : '') + '>' + j.lettre + '</span>').join('');
    // L'objectif du jour (progress.js) = au moins une unité terminée aujourd'hui.
    const note = serie > 0 ? '' : '<p class="wf-etat-note">Termine une unité aujourd’hui pour lancer ta série.</p>';
    const bandesLecons = etats.map((e, i) => '<i class="' + e + '" style="--i:' + i + '"></i>').join('');
    return '<section class="ac-chiffres wf-etat entre-2" aria-label="Ta progression">' +
      '<div class="wf-etat-bloc">' +
        '<div class="wf-etat-tete"><span class="wf-etat-lab">Série</span>' +
          '<span id="serie" class="wf-etat-val">' + serie + '<small> ' + jours + '</small></span></div>' +
        '<div class="wf-bandes wf-semaine" role="img" aria-label="' + escHtml(resume) + '">' + bandesJours + '</div>' +
        '<div class="wf-jours" aria-hidden="true">' + lettres + '</div>' + note +
      '</div>' +
      '<div class="wf-etat-bloc">' +
        '<div class="wf-etat-tete"><span class="wf-etat-lab">Niveau ' + escHtml(niveauActif) + '</span>' +
          '<span class="wf-etat-val">' + faites + ' / ' + lecons.length + '<small> leçons</small></span></div>' +
        '<div class="wf-bandes wf-lecons" role="progressbar" aria-label="Leçons terminées en ' + escHtml(niveauActif) + '" ' +
          'aria-valuemin="0" aria-valuemax="' + lecons.length + '" aria-valuenow="' + faites + '" ' +
          'style="--n:' + Math.max(1, lecons.length) + '">' + bandesLecons + '</div>' +
      '</div>' +
    '</section>';
  };

  // Le moteur 2.1 conserve la leçon cible et son clic. En 2.2, le livre dans
  // « Commencer » ferait doublon avec le bouton Étudier : retirer son seul wrapper.
  // Carte allégée : « Commencer » + une seule ligne, titre luxembourgeois de la leçon
  // et sa traduction. Mission et étape restent dans le nom accessible.
  // L'action (onclick) calculée par 2.1 reste identique.
  carteSuiteHtml = function (pas, nouveau) {
    let html = carteV21(pas, nouveau).replace(/<span class="cs-ic">[\s\S]*?<\/span>/, '');
    const l = pas && pas.lecon;
    if (!l) return html; // niveau terminé : carte 2.1 inchangée
    const action = nouveau ? 'Commencer' : 'Continuer';
    const fr = titreCourt(l);
    const ligne = l.titre
      ? '<i class="wf-cta-lux" lang="lb">' + escHtml(l.titre) + '</i> · <span class="wf-cta-fr">' + escHtml(fr) + '</span>'
      : escHtml('Leçon ' + numLecon(l) + ' · ' + fr);
    const mission = l.mission && l.mission.titre ? ' · Mission : ' + l.mission.titre : '';
    const label = action + ' · ' + (l.titre ? l.titre + ' · ' : '') + fr + ' · Leçon ' + numLecon(l) + mission + ' · ' + detailPas(pas);
    return html
      .replace(/<span class="cs-titre">[\s\S]*?<\/span>/, function () { return '<span class="cs-titre">' + ligne + '</span>'; })
      .replace(/<small class="cs-etape"[^>]*>[\s\S]*?<\/small>/, '')
      .replace(/aria-label="[^"]*"/, function () { return 'aria-label="' + escHtml(label) + '"'; });
  };

  // Deux destinations au lieu des quatre raccourcis + « Voir mon chemin ».
  // Étudier ouvre un menu dédié ; Jouer garde la destination 2.1 (ouvrirJeux).
  accesHtml = function () {
    // aria-controls seulement si la feuille existe déjà (elle est créée à la première ouverture) :
    // un attribut qui vise un id absent est invalide pour les lecteurs d'écran.
    const controle = document.getElementById('wf-etudier-dialog') ? ' aria-controls="wf-etudier-dialog"' : '';
    return '<div class="ac-v21-actions">' +
      '<nav class="ac-acces wf-choix-activite entre-3" aria-label="Choisir une activité">' +
        '<button type="button" class="ac-btn wf-activite wf-activite-etudier wf-etudier-trigger" ' +
          'aria-haspopup="dialog" aria-expanded="false"' + controle + '>' +
          '<svg class="ic" viewBox="0 0 40 40" aria-hidden="true" fill="none">' +
            '<path d="M20 10C15 7 9 7 4 9v24c6-2 11-1 16 3 5-4 10-5 16-3V9c-5-2-11-2-16 1Z"/>' +
            '<path d="M20 10v26"/>' +
          '</svg><b>Étudier</b></button>' +
        '<button type="button" class="ac-btn wf-activite wf-activite-jouer" onclick="ouvrirJeux()">' +
          '<svg class="ic" viewBox="0 0 40 40" aria-hidden="true" fill="none">' +
            '<path d="M11 12h18c4 0 6 3 7 7l1.5 7c1 4-3 6-6 3.5L27 26H13l-4.5 3.5C5.5 32 1.5 30 2.5 26L4 19c1-4 3-7 7-7Z"/>' +
            '<path d="M13 16v8m-4-4h8M28 18h.1M31 23h.1"/>' +
          '</svg><b>Jouer</b></button>' +
      '</nav></div>';
  };

  // V21 calcule les mêmes vrais KPI et le même prochain pas.
  // Hero toujours AVANT l'état des lieux ; au premier accueil, le moteur 2.1 ne
  // l'affiche pas : on l'ajoute (bandes vides, série à lancer).
  // Animation des bandes : à chaque ARRIVÉE sur l'accueil (la vue n'est pas encore
  // affichée : menu, bouton Retour, retour d'une leçon) et à chaque CHANGEMENT DE
  // NIVEAU. Pas pendant une synchronisation qui réaffiche l'écran déjà visible.
  let niveauAffiche = null;
  renderAccueil = function (animer) {
    const vue = document.getElementById('view-dashboard');
    const arrivee = !!animer || !vue || !vue.classList.contains('active');
    const autreNiveau = niveauAffiche !== null && niveauAffiche !== niveauActif;
    niveauAffiche = niveauActif;
    renduV21(animer);
    const box = document.getElementById('accueil');
    if (!box) return;
    box.classList.add('wf-accueil');
    const hero = box.querySelector('.ac-hero');
    if (!hero) return;
    const bilan = box.querySelector('.ac-chiffres');
    if (!bilan) hero.insertAdjacentHTML('afterend', chiffresHtml());
    else if (hero.nextElementSibling !== bilan) hero.after(bilan);
    const etat = box.querySelector('.wf-etat');
    if (etat && (arrivee || autreNiveau)) etat.classList.add('wf-etat-anime');
  };

  function feuilleNiveaux() {
    let dialog = document.getElementById('wf-niveaux-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'wf-niveaux-dialog';
    dialog.className = 'wf-niveaux-dialog';
    dialog.setAttribute('aria-labelledby', 'wf-niveaux-titre');
    dialog.innerHTML = '<div class="wf-sheet-content">' +
      '<div class="wf-sheet-handle" aria-hidden="true"></div>' +
      '<div class="wf-sheet-head"><h2 id="wf-niveaux-titre">Choisir un niveau</h2>' +
      '<button type="button" class="wf-sheet-close" aria-label="Fermer le choix de niveau">Fermer ×</button></div>' +
      '<div class="wf-sheet-levels"></div></div>';
    dialog.querySelector('.wf-sheet-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('wf-sheet-open');
      const bouton = document.querySelector('#view-dashboard .wf-niveau-ouvrir');
      if (bouton) { bouton.setAttribute('aria-expanded', 'false'); bouton.focus(); }
      if (typeof programmerGarde === 'function') programmerGarde(); // plus de feuille à fermer
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  function ouvrirNiveaux() {
    const niveaux = niveauxDisponibles();
    if (!niveaux.length) return;
    const dialog = feuilleNiveaux();
    if (dialog.open) return;
    const groupes = [];
    niveaux.forEach(n => { const famille = familleNiveau(n); if (!groupes.includes(famille)) groupes.push(famille); });
    const listing = groupes.map(f => {
      const boutons = niveaux.filter(n => familleNiveau(n) === f).map(n =>
        '<button type="button" class="wf-sheet-level' + (n === niveauActif ? ' is-current' : '') +
        '" data-wf-niveau="' + escHtml(n) + '" aria-pressed="' + (n === niveauActif) +
        '">' + escHtml(n) + '</button>'
      ).join('');
      return '<div class="wf-sheet-row"><span class="wf-sheet-family">' + escHtml(f) +
        '</span><div class="wf-sheet-options">' + boutons + '</div></div>';
    }).join('');
    dialog.querySelector('.wf-sheet-levels').innerHTML = listing;
    dialog.showModal();
    document.body.classList.add('wf-sheet-open');
    const bouton = document.querySelector('#view-dashboard .wf-niveau-ouvrir');
    if (bouton) bouton.setAttribute('aria-expanded', 'true');
    dialog.querySelector('.wf-sheet-close').focus();
    // Bouton Retour du téléphone : une entrée d'historique permet de fermer la feuille
    // sans quitter l'accueil (navigation.js appelle wfFermerNiveaux).
    if (typeof programmerGarde === 'function') programmerGarde();
  }

  // Menu Étudier : les quatre fonctionnalités restent accessibles sans
  // encombrer la home. Même bottom sheet natif et même garde Android que les niveaux.
  function feuilleEtudier() {
    let dialog = document.getElementById('wf-etudier-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'wf-etudier-dialog';
    dialog.className = 'wf-niveaux-dialog wf-etudier-dialog';
    dialog.setAttribute('aria-labelledby', 'wf-etudier-titre');
    dialog.innerHTML =
      '<div class="wf-sheet-content">' +
        '<div class="wf-sheet-handle" aria-hidden="true"></div>' +
        '<div class="wf-sheet-head"><h2 id="wf-etudier-titre">Étudier</h2>' +
          '<button type="button" class="wf-sheet-close" aria-label="Fermer le menu Étudier">Fermer ×</button></div>' +
        '<nav class="wf-etudier-options" aria-label="Activités d’étude">' +
          '<button type="button" class="wf-etudier-option" data-wf-etude="lecons"><b>Les leçons</b><small>Mon parcours et mes unités</small></button>' +
          '<button type="button" class="wf-etudier-option" data-wf-etude="entrainer"><b>S’entraîner</b><small>Révisions libres</small></button>' +
          '<button type="button" class="wf-etudier-option" data-wf-etude="examens"><b>Examens</b><small>Sujets d’évaluation</small></button>' +
          '<button type="button" class="wf-etudier-option" data-wf-etude="erreurs"><b>Mes erreurs</b><small>Revoir les réponses à améliorer</small></button>' +
        '</nav></div>';
    dialog.querySelector('.wf-sheet-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('wf-sheet-open');
      const bouton = document.querySelector('#view-dashboard .wf-etudier-trigger');
      if (bouton) { bouton.setAttribute('aria-expanded', 'false'); bouton.focus(); }
      if (typeof programmerGarde === 'function') programmerGarde();
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  function ouvrirEtudier() {
    const dialog = feuilleEtudier();
    if (dialog.open) return;
    dialog.showModal();
    document.body.classList.add('wf-sheet-open');
    const bouton = document.querySelector('#view-dashboard .wf-etudier-trigger');
    if (bouton) { bouton.setAttribute('aria-controls', 'wf-etudier-dialog'); bouton.setAttribute('aria-expanded', 'true'); }
    dialog.querySelector('[data-wf-etude="lecons"]').focus();
    if (typeof programmerGarde === 'function') programmerGarde();
  }

  const actionsEtudier = {
    lecons: () => goLessons(),
    entrainer: () => openReviewSetup(),
    examens: () => openExamens(),
    erreurs: () => startSession('errors')
  };

  // Les trois actions de contenu et les trois pastilles de niveau peuvent
  // changer de vue, re-render l'accueil ou ouvrir un dialogue immédiatement.
  // Un tap bref ne laisse sinon jamais le temps de voir :active. Intercepter
  // UNIQUEMENT le click utilisateur en capture, maintenir le creux 160 ms, puis
  // rejouer le vrai clic natif : les onclick et routes 2.1 restent inchangés.
  // Le replay non fiable (isTrusted=false) traverse sans délai ni récursion.
  // Les clics programmatiques et les préférences de mouvement réduit restent immédiats.
  let pressionEnCours = false;
  document.addEventListener('click', function (event) {
    if (event.isTrusted === false) return;
    const button = event.target.closest(
      '#view-dashboard .wf-accueil .carte-suite.ac-v21-cta,' +
      '#view-dashboard .wf-accueil .wf-choix-activite .wf-activite,' +
      '#view-dashboard .wf-accueil .puces-niveau .puce-niv'
    );
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    event.preventDefault();
    event.stopPropagation();
    if (pressionEnCours) return; // double tap / double clic : une seule navigation
    pressionEnCours = true;
    button.classList.add('wf-pressing');
    window.setTimeout(function () {
      button.classList.remove('wf-pressing');
      pressionEnCours = false;
      if (button.isConnected) button.click(); // le click synthétique conserve l'action originale
    }, 160);
  }, true);

  // Délégation : renderAccueil() reconstruit le DOM après chaque changement de niveau.
  document.addEventListener('click', function (event) {
    const etudier = event.target.closest('#view-dashboard .wf-etudier-trigger');
    if (etudier) { ouvrirEtudier(); return; }
    const action = event.target.closest('#wf-etudier-dialog [data-wf-etude]');
    if (action) {
      const fn = actionsEtudier[action.getAttribute('data-wf-etude')];
      if (!fn) return;
      const dialogEtude = document.getElementById('wf-etudier-dialog');
      if (dialogEtude && dialogEtude.open) dialogEtude.close();
      fn();
      return;
    }
    const ouverture = event.target.closest('#view-dashboard .wf-niveau-ouvrir');
    if (ouverture) { ouvrirNiveaux(); return; }
    const option = event.target.closest('#view-dashboard .wf-niveau-btn, #wf-niveaux-dialog .wf-sheet-level');
    if (!option) return;
    const niveau = option.getAttribute('data-wf-niveau');
    if (!niveauxDisponibles().includes(niveau)) return;
    const dialog = document.getElementById('wf-niveaux-dialog');
    if (dialog && dialog.open) dialog.close();
    if (niveau !== niveauActif) changerNiveauAccueil(niveau);
  });
})();

// Utilisés par navigation.js : le bouton Retour du téléphone ferme d'abord la feuille des niveaux.
function wfNiveauxOuverts() {
  const dialog = document.getElementById('wf-niveaux-dialog');
  return !!(dialog && dialog.open);
}
function wfFermerNiveaux() {
  if (!wfNiveauxOuverts()) return false;
  document.getElementById('wf-niveaux-dialog').close();
  return true;
}

/* Navigation Android : la feuille Étudier intercepte Retour avant de quitter l'accueil. */
function wfEtudierOuvert() {
  const dialog = document.getElementById('wf-etudier-dialog');
  return !!(dialog && dialog.open);
}
function wfFermerEtudier() {
  if (!wfEtudierOuvert()) return false;
  document.getElementById('wf-etudier-dialog').close();
  return true;
}
