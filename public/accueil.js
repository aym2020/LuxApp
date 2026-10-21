// ─── ACCUEIL ET MENU (V3) ───────────────────────────────────────────────────
// Un seul écran pour tous : la structure ne change pas, seules les infos
// s'adaptent. De haut en bas :
//   - en-tête : « Lëtzebuergesch », bouton menu, puces de niveau (A1.1, A1.2…) ;
//   - nouvel utilisateur : « Prêt à commencer ? » ;
//     sinon : une ligne de chiffres (série, progression, leçons terminées) ;
//   - LA carte « Commencer » / « Continuer » : la prochaine activité conseillée ;
//   - les accès directs : Leçons, Réviser, Examens, Erreurs fréquentes.
// Règle : un bouton = un mot = une destination. Seul ajout permis : un chiffre.

// ─── ICÔNES (SVG au trait, partagées avec le chemin) ───────────────────────
const ICONES = {
  livre: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/></svg>',
  lecture: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/></svg>',
  jouer: '<svg class="ic plein" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
  etincelle: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3l1.9 5.6L18.5 10.5l-5.6 1.9L11 18l-1.9-5.6L3.5 10.5l5.6-1.9z"/><path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>',
  pousse: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21v-9"/><path d="M12 12c0-4.4-3.1-7-7.5-7 0 4.4 3.1 7 7.5 7z"/><path d="M12 10c0-3.6 2.6-6 6.5-6 0 3.6-2.6 6-6.5 6z"/></svg>',
  fleche: '<svg class="ic fleche" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  suite: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
  revision: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
  toque: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>',
  flamme: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.4 1.3 2.8 2.5 2.8z"/></svg>',
  chevron: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  droite: '<svg class="ic droite" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
  coche: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  bulle: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  cible: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  loupe: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  alerte: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  reglages: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};

// ─── PLAN DU JOUR (S7) ──────────────────────────────────────────────────────
// Une seule source pour « que faire maintenant ».
//   revision : état de la révision du jour (bouton Réviser)
//   pas      : prochaine activité de leçon dans le niveau choisi (carte « Continuer »)
function planDuJour() {
  const dus = resumeRevision(lecons).dus.length; // questions déjà vues et à revoir, tous niveaux (S13)
  noterQuestionsDues(dus);
  const seance = loadSeance();
  let revision;
  if (seance) revision = { etat: 'encours', fait: seance.index, total: seance.questions.length };
  else if (revisionFaiteAujourdhui()) revision = { etat: 'fait', reste: dus };
  else if (dus) revision = { etat: 'afaire', dus: dus };
  else revision = { etat: 'rien' };
  return { revision, pas: prochainPas() };
}

// Bouton Réviser : reprend la séance, sinon en lance une, sinon les plus fragiles.
function lancerRevision() {
  if (loadSeance()) { lancerSeance(); return; }
  if (resumeRevision(lecons).dus.length) { nouvelleSeance(); return; }
  lancerPlusFragiles();
}

// ─── ACCUEIL ────────────────────────────────────────────────────────────────
// animer = true quand on arrive sur l'accueil (pas à chaque réaffichage).
function renderAccueil(animer) {
  const box = document.getElementById('accueil');
  if (!box) return;
  box.classList.toggle('anime', !!animer);

  const plan = planDuJour();
  const nouveau = !aDejaPratique();
  // SPEC 77 : seule la première visite en invité nécessite la disposition
  // resserrée sur un écran Android standard. Les autres accueils sont inchangés.
  box.classList.toggle('ac-nouveau-invite',
    nouveau && isCloudEnabled() && !(fbAuth && fbAuth.currentUser));

  let html = enteteAccueilHtml();
  if (nouveau) html += accrocheHtml();
  else html += chiffresHtml();
  html += carteSuiteHtml(plan.pas, nouveau);
  if (nouveau) html += '<div class="ou-choisir entre-3">Ou choisir une autre leçon</div>';
  html += accesHtml(plan.revision); // SPEC 52 : pas de statut cloud sous les boutons

  box.innerHTML = html;
  actualiserStatutSynchro(); // aussi dans la section Réglages
  feterObjectifDuJour();
}

// Titre, bouton menu, puces de niveau.
function enteteAccueilHtml() {
  const puces = niveauxDisponibles().map(n =>
    '<button class="puce-niv" aria-pressed="' + (n === niveauActif) + '" onclick="changerNiveauAccueil(\'' + n + '\')">' + n + '</button>'
  ).join('');
  const etat = etatSynchro();
  return '<div class="ac-ent entre">' +
      '<h1 class="ac-titre">Lëtzebuergesch</h1>' +
      '<button class="ac-menu" aria-label="' + escHtml(libelleMenuSynchro(etat)) +
        '" onclick="ouvrirPlus()">' + ICONES.reglages +
        '<span class="ac-sync-slot" aria-hidden="true">' + pastilleSynchroHtml(etat) + '</span></button>' +
    '</div>' +
    '<div class="puces-niveau entre" role="group" aria-label="Niveau">' + puces + '</div>' +
    ligneCompteHtml();
}

// SPEC 67 : invité → ligne discrète sous les niveaux, vers les écrans de compte du portail.
function ligneCompteHtml() {
  if (!isCloudEnabled() || (fbAuth && fbAuth.currentUser)) return '';
  return '<div class="ac-compte entre">' +
    '<span class="ac-compte-mode">Mode invité</span>' +
    '<span class="ac-compte-liens">' +
      '<button type="button" onclick="ouvrirCompteDepuisAccueil(\'signin\')">Se connecter</button>' +
      '<span aria-hidden="true">·</span>' +
      '<button type="button" class="or" onclick="ouvrirCompteDepuisAccueil(\'signup\')">Créer un compte</button>' +
    '</span></div>';
}

// Le niveau se change librement, jamais automatiquement.
function changerNiveauAccueil(niveau) {
  if (niveau === niveauActif) return;
  choisirNiveau(niveau);
  renderLessons();
  renderAccueil(false);
}

// Nouvel utilisateur : une phrase d'accueil à la place des chiffres.
function accrocheHtml() {
  return '<div class="ac-accroche entre-2">' + ICONES.pousse +
    '<h2>Prêt à commencer ?</h2>' +
    '<p>Apprends le luxembourgeois pas à pas, simplement.</p></div>';
}

// Où j'en suis : trois chiffres sur une ligne.
function chiffresHtml() {
  const prog = progressionNiveau(niveauActif);
  const serie = serieActuelle();
  return '<div class="ac-chiffres entre-2">' +
    '<div class="ac-stat"><b id="serie" class="serie">' + ICONES.flamme + serie + ' j</b><span>Série</span></div>' +
    '<div class="ac-stat"><b>' + prog.pourcent + ' %</b><span>Progression</span></div>' +
    '<div class="ac-stat" aria-label="' + prog.terminees + ' leçons terminées sur ' + prog.nbLecons +
      (prog.anciennes ? ', ' + prog.anciennes + ' acquises précédemment' : '') + '">' +
      '<b>' + prog.terminees + ' / ' + prog.nbLecons + '</b><span>Terminées</span>' +
      (prog.anciennes ? '<small class="ac-acquis" title="' + prog.anciennes +
        ' leçons acquises précédemment">+' + prog.anciennes + ' acquise' +
        (prog.anciennes > 1 ? 's' : '') + '</small>' : '') + '</div>' +
  '</div>';
}

// LA carte de l'écran : un geste pour commencer ou reprendre.
// (id="today" : point d'entrée des tests.)
function carteSuiteHtml(pas, nouveau) {
  // Niveau terminé : on propose le suivant (jamais de changement automatique).
  if (!pas) {
    const suivant = niveauSuivant(niveauActif);
    const action = suivant ? 'passerAuNiveau(\'' + suivant + '\')' : 'goLessons()';
    return '<section id="today" class="entre-2">' +
      '<button class="carte-suite" onclick="' + action + '">' +
        '<span class="cs-ic">' + ICONES.coche + '</span>' +
        '<span class="cs-txt"><b>Niveau terminé</b>' +
          '<span>Bravo, tu as fini le parcours ' + niveauActif + ' !</span>' +
          '<small>' + (suivant ? 'Passer en ' + suivant : 'Rejouer une leçon') + '</small></span>' +
        '<span class="cs-rond">' + ICONES.suite + '</span>' +
      '</button></section>';
  }

  const l = pas.lecon;
  const titre = nouveau ? 'Commencer' : 'Continuer';
  const detailComplet = detailPas(pas);
  const label = titre + ' · Leçon ' + numLecon(l) + ' · ' + titreCourt(l) + ' · ' + detailComplet;
  return '<section id="today" class="entre-2">' +
    '<button class="carte-suite compacte' + (nouveau ? ' plein' : '') + '"' +
      ' aria-label="' + escHtml(label) + '"' +
      ' onclick="' + (nouveau ? 'commencer()' : 'suivreProchainPas()') + '">' +
      '<span class="cs-txt">' +
        '<span class="cs-kicker">' + titre + '</span>' +
        '<span class="cs-lecon">LEÇON ' + numLecon(l) + '</span>' +
        '<span class="cs-titre">' + escHtml(titreCourt(l)) + '</span>' +
        '<small class="cs-etape" title="' + escHtml(detailComplet) + '">' +
          escHtml(detailPasCourt(pas)) + '</small>' +
      '</span>' +
      '<span class="cs-rond">' + ICONES.suite + '</span>' +
    '</button></section>';
}

// Troisième ligne de la carte : où l'on reprend.
function detailPas(pas) {
  if (pas.type === 'reprise') {
    const run = loadRun();
    const step = run.steps[run.stepIdx];
    // Questions restantes : celles de l'exercice en cours + celles des suivants.
    let reste = step && step.queue ? step.queue.length : 0;
    for (let i = run.stepIdx + 1; i < run.steps.length; i++) reste += run.steps[i].total;
    const nom = step ? etapeInfo(step.type).label : capitale(nomPartie(run.uniteId, run.mode));
    return nom + ' · ' + reste + (reste > 1 ? ' questions restantes' : ' question restante');
  }
  if (pas.type === 'unite') return 'Unité ' + pas.unite.id + ' · ' + pas.unite.titre;
  if (pas.type === 'mission') return 'Mission · ' + pas.lecon.mission.titre;
  return 'Cours, cartes, quiz, trous et écriture';
}

// Résumé de l'étape sur une seule ligne dans la carte (texte complet dans aria-label).
function detailPasCourt(pas) {
  if (pas.type === 'unite' && pas.unite) {
    // Ex. « sinn : être au présent » -> « Unité 1 · sinn ».
    const chapitre = pas.unite.titre.split(/\s*[:·]\s*/)[0].trim();
    return 'Unité ' + pas.unite.id + ' · ' + chapitre;
  }
  return detailPas(pas);
}

// Les quatre accès directs, toujours visibles.
function accesHtml(rev) {
  return '<nav class="ac-acces entre-3" aria-label="Accès directs">' +
    boutonAcces('lecons', ICONES.livre, 'Leçons', '', 'goLessons()') +
    boutonAcces('rev', ICONES.revision, 'Réviser', infoRevision(rev), 'lancerRevision()') +
    boutonAcces('exa', ICONES.toque, 'Examens', '', 'openExamens()') +
    boutonAcces('err', ICONES.cible, 'Erreurs fréquentes', '', 'startSession(\'errors\')') +
  '</nav>';
}

function boutonAcces(classe, icone, titre, info, action) {
  return '<button class="ac-btn ' + classe + '" onclick="' + action + '">' +
    icone + '<b>' + titre + '</b>' + info + ICONES.suite + '</button>';
}

// Chiffre à droite du bouton Réviser (questions déjà étudiées uniquement).
function infoRevision(rev) {
  if (rev.etat === 'encours') return '<span class="ac-info"><b>' + rev.fait + ' / ' + rev.total + '</b>à finir</span>';
  if (rev.etat === 'afaire') return '<span class="ac-info"><b>' + rev.dus + '</b>à revoir</span>';
  if (rev.etat === 'fait') return '<span class="ac-info fait">' + ICONES.coche + 'Fait</span>';
  return '';
}

// Libellé du bouton jaune de la leçon en cours dans le chemin.
function libelleBouton(pas) {
  if (pas.type === 'reprise') return 'Reprendre';
  if (pas.type === 'mission') return 'Jouer la mission';
  if (pas.type === 'v1') return 'Ouvrir la leçon';
  if (!getLeconVue(pas.lecon.id)) return 'Découvrir la leçon';
  return 'Continuer · unité ' + pas.unite.id;
}

function capitale(texte) {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

function suivreProchainPas() {
  const pas = prochainPas();
  if (pas) pas.fn();
}

// Premier geste : le niveau affiché devient le niveau choisi.
function commencer() {
  if (!niveauChoisi()) choisirNiveau(niveauActif);
  suivreProchainPas();
}

function passerAuNiveau(niveau) {
  choisirNiveau(niveau);
  goDashboard();
}

// SPEC 52 : statut cloud uniquement dans la roue dentée, le menu et les réglages.
// La couleur du point suit l'état réel ; pas de point hors connexion.
function libelleMenuSynchro(etat) {
  return etat ? 'Menu · ' + etat.texte : 'Menu';
}

function pastilleSynchroHtml(etat) {
  if (!etat) return '';
  return '<i class="ac-sync-point' + (etat.ok ? '' : ' attente') + '"></i>';
}

function detailSynchroHtml(etat) {
  if (!etat) return ''; // La carte auth explique déjà le mode local.
  return '<span class="point-synchro' + (etat.ok ? '' : ' attente') + '"><i></i>' +
    escHtml(etat.texte) + '</span>';
}

// Appel léger après connexion, sauvegarde ou retour en ligne : ne déplace
// ni l'écran, ni le focus, ni les boutons du tableau de bord.
function actualiserStatutSynchro() {
  const etat = etatSynchro();
  const menu = document.querySelector('#accueil .ac-menu');
  if (menu) {
    menu.setAttribute('aria-label', libelleMenuSynchro(etat));
    const slot = menu.querySelector('.ac-sync-slot');
    if (slot) slot.innerHTML = pastilleSynchroHtml(etat);
  }
  const zone = document.getElementById('reglages-synchro');
  if (zone) zone.innerHTML = detailSynchroHtml(etat);
  const sousTitre = document.querySelector('#panneau [data-synchro-menu]');
  if (sousTitre) sousTitre.textContent = etat ? etat.texte : 'Compte, synchronisation, remise à zéro';
}

// Objectif du jour atteint : la flamme rebondit, une seule fois par jour.
function feterObjectifDuJour() {
  if (getJours()[dayString(0)] !== 2) return;
  let deja = null;
  try { deja = localStorage.getItem('luxObjectifFete'); } catch (e) { /* ignore */ }
  if (deja === dayString(0)) return;
  try { localStorage.setItem('luxObjectifFete', dayString(0)); } catch (e) { /* ignore */ }
  const flamme = document.getElementById('serie');
  if (flamme) flamme.classList.add('bump');
}

// ─── MENU (roue en haut de l'accueil, « Plus » dans la barre du bas) ───────
// Ce qui sert moins souvent : lexique, pièges, réglages.
function ouvrirPlus() {
  // Un deuxième appui rapide sur la roue/Plus n'empile pas de panneaux.
  const dejaOuvert = document.getElementById('panneau');
  if (dejaOuvert && dejaOuvert.getAttribute('aria-label') === 'Plus') return;
  const tuiles = [
    [compterUnitesTerminees(), 'unités terminées'],
    ...(compterAcquisesAncienneVersion() ? [[compterAcquisesAncienneVersion(), 'leçons acquises précédemment']] : []), // spec 46
    [leconsActives().filter(missionReussie).length, 'missions réussies'],
    [totalJours(), 'jours de pratique']
  ];
  const etat = etatSynchro();
  const lignes = [
    [ICONES.loupe, 'Lexique', 'Tous les mots du niveau', 'openLexique()'],
    [ICONES.alerte, 'Mes pièges', 'Les points où tu t\'es trompé', 'openPieges()'],
    [ICONES.reglages, 'Réglages', etat ? etat.texte : 'Compte, synchronisation, remise à zéro', 'openReglages()']
  ];
  const html = '<div class="poignee"></div><h2>Plus</h2>' +
    '<div class="plus-acquis">' + tuiles.map(t => '<div><b>' + t[0] + '</b><span>' + t[1] + '</span></div>').join('') + '</div>' +
    lignes.map(x => '<button class="plus-ligne" onclick="fermerPanneau(); ' + x[3] + '">' + x[0] +
      '<span><b>' + x[1] + '</b><small' + (x[1] === 'Réglages' ? ' data-synchro-menu' : '') +
      '>' + escHtml(x[2]) + '</small></span></button>').join('');
  ouvrirPanneau(html, 'Plus');
}

// ─── PANNEAU QUI MONTE DU BAS (commun) ──────────────────────────────────────
// apresFermeture (facultatif) : appelée une fois quand le panneau se ferme,
// quelle que soit la façon (bouton, voile, Retour du téléphone, Échap).
let panneauApres = null;

function ouvrirPanneau(html, titre, apresFermeture) {
  const precedent = document.getElementById('panneau');
  // Ne pas reconstruire la feuille si l'action est répétée rapidement.
  if (titre === 'Plus' && precedent && precedent.getAttribute('aria-label') === titre) return;
  if (precedent) fermerPanneau();
  panneauApres = apresFermeture || null;
  const voile = document.createElement('div');
  voile.className = 'voile';
  voile.id = 'voile';
  const ouvertA = Date.now();
  voile.addEventListener('click', e => {
    // La feuille recouvre la roue Réglages : le second appui du même geste
    // atteint le voile et refermait immédiatement le panneau (Android).
    // Laisser cette zone neutre tant que le panneau Plus est ouvert.
    const roue = titre === 'Plus'
      ? document.querySelector('#view-dashboard.active .ac-menu')
      : null;
    if (roue && typeof roue.getBoundingClientRect === 'function') {
      const r = roue.getBoundingClientRect();
      if (e.clientX >= r.left - 10 && e.clientX <= r.right + 10 &&
          e.clientY >= r.top - 10 && e.clientY <= r.bottom + 10) return;
    }
    // Ignorer les clics parasites du tout début de l'ouverture.
    if (titre === 'Plus' && Date.now() - ouvertA < 250) return;
    fermerPanneau();
  });
  const panneau = document.createElement('div');
  panneau.className = 'panneau';
  panneau.id = 'panneau';
  panneau.setAttribute('role', 'dialog');
  panneau.setAttribute('aria-label', titre);
  panneau.innerHTML = html;
  document.body.append(voile, panneau);
  programmerGarde();
}

// Ferme le panneau sans lancer sa suite (reprise après actualisation, spec 44).
function fermerPanneauSansSuite() {
  panneauApres = null;
  fermerPanneau();
}

function fermerPanneau() {
  ['voile', 'panneau'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  programmerGarde(); // bouton Retour du téléphone : plus de panneau à fermer
  const apres = panneauApres;
  panneauApres = null;
  if (apres) apres();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') fermerPanneau();
});

// ─── APRÈS UNE SYNCHRONISATION (S8) ─────────────────────────────────────────
// Le niveau choisi ou la séance ont pu changer sur un autre appareil.
function apresSynchro() {
  appliquerNiveauChoisi();
  const vue = document.querySelector('.view.active');
  if (!vue) return;
  if (vue.id === 'view-dashboard') renderAccueil(false);
  if (vue.id === 'view-lessons') renderLessons();
}
