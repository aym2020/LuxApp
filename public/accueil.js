// ─── ACCUEIL, BIENVENUE, CHOIX DU NIVEAU, MENU « PLUS » (S7, S9, S13) ───────
// L'accueil répond à deux questions : où j'en suis, et quoi faire maintenant.
//   - en-tête : LuxApp, « Moien ! », série, niveau choisi (puce « A1.1 ▾ ») ;
//   - grande carte : progression du niveau, puis la prochaine étape conseillée
//     avec LE bouton jaune de l'écran ;
//   - deux tuiles : Réviser (état de la révision du jour) et Examens.
// Un profil neuf voit à la place l'écran Bienvenue (choix du niveau).

// ─── ICÔNES (SVG au trait, partagées avec le chemin) ───────────────────────
const ICONES = {
  livre: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/></svg>',
  lecture: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/></svg>',
  fleche: '<svg class="ic fleche" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  revision: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
  toque: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>',
  flamme: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.4 1.3 2.8 2.5 2.8z"/></svg>',
  chevron: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  coche: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  bulle: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  cible: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  loupe: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  alerte: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  reglages: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};

// ─── PLAN DU JOUR (S7) ──────────────────────────────────────────────────────
// Une seule source pour « que faire maintenant ».
//   revision : état de la révision du jour (tuile Réviser)
//   pas      : prochaine étape de leçon dans le niveau choisi (grande carte)
function planDuJour() {
  const dus = resumeRevision(lecons).dus.length; // tous les niveaux (S13)
  noterQuestionsDues(dus);
  const seance = loadSeance();
  const nb = Math.min(dus, TAILLE_SEANCE);
  let revision;
  if (seance) revision = { etat: 'encours', fait: seance.index, total: seance.questions.length };
  else if (revisionFaiteAujourdhui()) revision = { etat: 'fait', reste: dus };
  else if (dus) revision = { etat: 'afaire', total: nb, minutes: Math.max(1, Math.round(nb * 12 / 60)) };
  else revision = { etat: 'rien' };
  return { revision, pas: prochainPas() };
}

// Tuile Réviser et onglet : reprend la séance, sinon en lance une, sinon les plus fragiles.
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

  // Profil neuf : écran Bienvenue avec le choix du niveau.
  if (!aDejaPratique() && !niveauChoisi()) {
    renderBienvenue(box);
    return;
  }

  const plan = planDuJour();
  box.innerHTML = enteteAccueilHtml() + carteParcoursHtml(plan.pas) + tuilesHtml(plan.revision) + synchroHtml();
  feterObjectifDuJour();
}

function enteteAccueilHtml() {
  const serie = serieActuelle();
  return '<div class="ac-ent entre">' +
    '<div><span class="marque"><i></i>LuxApp</span>' +
      '<h1 class="ac-moien">Moien !</h1>' +
      '<div class="ac-sous">Prêt pour ta pause luxembourgeois ?</div></div>' +
    '<div class="ac-droite">' +
      (serie ? '<span class="serie" id="serie" aria-label="Série de ' + serie + ' jours">' + ICONES.flamme + serie + (serie > 1 ? ' jours' : ' jour') + '</span>' : '') +
      '<button class="puce-niveau" id="btn-niveau" aria-haspopup="dialog" onclick="ouvrirPanneauNiveau()">' +
        niveauActif + ICONES.chevron + '</button>' +
    '</div></div>';
}

// Grande carte : progression du niveau + prochaine étape + bouton jaune.
// (id="today" : point d'entrée des tests.)
function carteParcoursHtml(pas) {
  const prog = progressionNiveau(niveauActif);
  let html = '<section class="carte-p entre-2" id="today">' +
    '<div class="ligne-entre"><span class="etiquette or">Ton parcours · ' + niveauActif + '</span>' +
      '<span class="compte"><b>' + prog.terminees + '</b> / ' + prog.nbLecons + ' leçons</span></div>' +
    '<div class="barre" role="progressbar" aria-label="Progression du niveau" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + prog.pourcent + '">' +
      '<i class="remplit" style="width:' + Math.max(prog.pourcent, 2) + '%"></i></div>' +
    '<div class="sep"></div>';

  // Niveau terminé : on propose le suivant (jamais de changement automatique).
  if (!pas) {
    const suivant = niveauSuivant(niveauActif);
    html += '<div class="reprendre-tete">' + ICONES.coche + '<span class="etiquette">Niveau terminé</span></div>' +
      '<h2 class="lecon-titre">Bravo, tu as fini le parcours ' + niveauActif + ' !</h2>' +
      '<p class="ac-texte">Tes révisions continuent, et tu peux rejouer n\'importe quelle leçon.</p>' +
      (suivant
        ? '<button class="btn-jaune" onclick="passerAuNiveau(\'' + suivant + '\')">' + ICONES.lecture + '<span>Passer en ' + suivant + '</span>' + ICONES.fleche + '</button>'
        : '<button class="btn-jaune" onclick="goLessons()">' + ICONES.lecture + '<span>Voir mon chemin</span>' + ICONES.fleche + '</button>');
    return html + '</section>';
  }

  const l = pas.lecon;
  html += '<div class="reprendre-tete">' + ICONES.livre + '<span class="etiquette">' +
      (pas.reprise ? 'Reprendre' : 'Prochaine étape') + '</span></div>' +
    '<div><h2 class="lecon-titre">Leçon ' + l.id + ' · ' + escHtml(titreCourt(l)) + '</h2>' +
      '<div class="lecon-lux">' + escHtml(l.titre) + '</div></div>' +
    '<div class="etape-cours">' + etapesCarteHtml(pas) + '</div>' +
    '<button class="btn-jaune" onclick="suivreProchainPas()">' + ICONES.lecture +
      '<span>' + escHtml(libelleBouton(pas)) + '</span>' + ICONES.fleche + '</button>';
  return html + '</section>';
}

// Lignes sous le titre : l'étape conseillée, puis la mission de la leçon.
function etapesCarteHtml(pas) {
  const l = pas.lecon;
  if (pas.type === 'v1') {
    return '<div class="etape"><span class="pt"></span><span>Cours, cartes, quiz, trous et écriture</span></div>';
  }
  let html = '';
  if (pas.type === 'reprise') {
    const run = loadRun();
    html += '<div class="etape"><span class="pt"></span><span><b>' + escHtml(capitale(nomPartie(run.uniteId, run.mode))) + '</b>' +
      ' · étape ' + (run.stepIdx + 1) + ' sur ' + run.steps.length + '</span></div>';
  } else if (pas.type === 'unite') {
    html += '<div class="etape"><span class="pt"></span><span><b>Unité ' + pas.unite.id + '</b> · ' + escHtml(pas.unite.titre) + '</span></div>';
  }
  if (l.mission && l.scene) {
    const apprises = l.scene.filter(x => repliqueApprise(l, x)).length;
    html += '<div class="etape mission"><span class="pt"></span><span>' +
      (pas.type === 'mission' ? '<b>Mission</b> · ' + escHtml(l.mission.titre)
        : 'Mission · ' + escHtml(l.mission.titre) + ' · tu sais dire ' + apprises + ' réplique' + (apprises > 1 ? 's' : '') + ' sur ' + l.scene.length) +
      '</span></div>';
  }
  return html;
}

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

function passerAuNiveau(niveau) {
  choisirNiveau(niveau);
  goDashboard();
}

// Tuiles Réviser (état de la révision du jour) et Examens.
function tuilesHtml(rev) {
  let texte = '', barre = '', badge = '';
  if (rev.etat === 'encours') {
    texte = 'Séance du jour · ' + rev.fait + ' / ' + rev.total;
    barre = '<div class="mini-barre"><i class="remplit" style="width:' + Math.round(rev.fait / rev.total * 100) + '%"></i></div>';
    badge = '<span class="badge">À finir</span>';
  } else if (rev.etat === 'afaire') {
    texte = rev.total + (rev.total > 1 ? ' questions' : ' question') + ' · environ ' + rev.minutes + ' min';
    badge = '<span class="badge">Du jour</span>';
  } else if (rev.etat === 'fait') {
    texte = 'Fait pour aujourd\'hui · réviser encore';
    badge = '<span class="badge fait">' + ICONES.coche + '</span>';
  } else {
    texte = 'Rien à réviser aujourd\'hui · les plus fragiles';
  }
  return '<div class="tuiles entre-3">' +
    '<button class="tuile rev" onclick="lancerRevision()">' +
      '<span class="tuile-haut">' + ICONES.revision + badge + '</span>' +
      '<b>Réviser</b><span class="tuile-txt">' + texte + '</span>' + barre + '</button>' +
    '<button class="tuile exa" onclick="openExamens()">' +
      '<span class="tuile-haut">' + ICONES.toque + '</span>' +
      '<b>Examens</b><span class="tuile-txt">Entraîne-toi quand tu veux, même avant la fin</span></button>' +
    '</div>';
}

function synchroHtml() {
  const etat = etatSynchro();
  if (!etat) return '';
  return '<div class="point-synchro entre-3' + (etat.ok ? '' : ' attente') + '"><i></i>' + escHtml(etat.texte) + '</div>';
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

// ─── BIENVENUE (premier lancement) ──────────────────────────────────────────
const DESCRIPTION_NIVEAU = { 'A1.1': 'Je commence', 'A1.2': 'J\'ai les bases', 'A2.1': 'Je me débrouille' };
let niveauBienvenue = null;

function renderBienvenue(box) {
  const niveaux = niveauxDisponibles();
  if (!niveauBienvenue) niveauBienvenue = niveaux[0];
  box.innerHTML =
    '<div class="bienv">' +
      '<span class="marque entre"><i></i>LuxApp</span>' +
      '<h1 class="bienv-titre entre">Moien<em> !</em></h1>' +
      '<p class="accroche entre-2">Apprends le luxembourgeois par petites unités, chacune liée à une scène de la vie de tous les jours.</p>' +
      '<section class="carte-p entre-3" id="today">' +
        '<p class="question">Quel niveau travailles-tu ?</p>' +
        '<div class="choix-niveaux">' + niveaux.map(n =>
          '<button class="choix-niv" aria-pressed="' + (n === niveauBienvenue) + '" onclick="choisirBienvenue(\'' + n + '\')">' +
            '<span class="nom">' + n + '</span><span class="det">' + (DESCRIPTION_NIVEAU[n] || '') +
            ' · ' + leconsDuNiveau(n).length + ' leçons</span></button>').join('') + '</div>' +
        '<p class="note">Pas de test : tu pourras changer de niveau à tout moment.</p>' +
        '<button class="btn-jaune" onclick="commencerBienvenue()"><span>C\'est parti</span>' + ICONES.fleche + '</button>' +
      '</section>' +
      '<ul class="trois-pas entre-4">' +
        '<li><span class="pastille-ic or">' + ICONES.livre + '</span><span><b>Des unités courtes</b>Une règle, quatre exercices, terminé.</span></li>' +
        '<li><span class="pastille-ic bleu">' + ICONES.bulle + '</span><span><b>Une mission par leçon</b>Une vraie scène à jouer, comme au bureau ou chez les voisins.</span></li>' +
        '<li><span class="pastille-ic turq">' + ICONES.revision + '</span><span><b>Une révision par jour</b>Ce que tu oublies revient au bon moment.</span></li>' +
      '</ul>' +
    '</div>';
}

function choisirBienvenue(niveau) {
  niveauBienvenue = niveau;
  document.querySelectorAll('.choix-niveaux .choix-niv').forEach(b =>
    b.setAttribute('aria-pressed', b.textContent.indexOf(niveau) === 0));
}

function commencerBienvenue() {
  choisirNiveau(niveauBienvenue || niveauActif);
  const pas = prochainPas();
  if (pas) pas.fn();
  else goDashboard();
}

// Ancien nom, gardé pour les tests et la compatibilité.
function lancerPremierPas() {
  commencerBienvenue();
}

// ─── PANNEAU « MON NIVEAU » ─────────────────────────────────────────────────
function ouvrirPanneauNiveau() {
  let html = '<div class="poignee"></div><h2>Mon niveau</h2>' +
    '<p>Change quand tu veux. Ta révision garde tous les niveaux.</p>';
  niveauxDisponibles().forEach(n => {
    const prog = progressionNiveau(n);
    html += '<button class="choix-niv" aria-pressed="' + (n === niveauActif) + '" onclick="choisirDansPanneau(\'' + n + '\')">' +
      '<span class="nom">' + n + '</span><span class="det">' + prog.terminees + ' / ' + prog.nbLecons + ' leçons terminées</span>' +
      (n === niveauActif ? ICONES.coche : '') + '</button>';
  });
  ouvrirPanneau(html, 'Mon niveau');
}

function choisirDansPanneau(niveau) {
  fermerPanneau();
  if (niveau !== niveauActif) choisirNiveau(niveau);
  renderLessons();
  renderAccueil(true);
}

// ─── MENU « PLUS » (S9) ─────────────────────────────────────────────────────
function ouvrirPlus() {
  const tuiles = [
    [compterUnitesTerminees(), 'unités terminées'],
    [leconsActives().filter(missionReussie).length, 'missions réussies'],
    [totalJours(), 'jours de pratique']
  ];
  const lignes = [
    [ICONES.loupe, 'Lexique', 'Tous les mots du niveau', 'openLexique()'],
    [ICONES.alerte, 'Mes pièges', 'Les points où tu t\'es trompé', 'openPieges()'],
    [ICONES.revision, 'Erreurs fréquentes', 'Les questions qui te résistent', 'startSession(\'errors\')'],
    [ICONES.toque, 'Examens', 'Les sujets ' + niveauActif, 'openExamens()'],
    [ICONES.reglages, 'Réglages', 'Compte, synchronisation, remise à zéro', 'openReglages()']
  ];
  const html = '<div class="poignee"></div><h2>Plus</h2>' +
    '<div class="plus-acquis">' + tuiles.map(t => '<div><b>' + t[0] + '</b><span>' + t[1] + '</span></div>').join('') + '</div>' +
    lignes.map(x => '<button class="plus-ligne" onclick="fermerPanneau(); ' + x[3] + '">' + x[0] +
      '<span><b>' + x[1] + '</b><small>' + x[2] + '</small></span></button>').join('');
  ouvrirPanneau(html, 'Plus');
}

// ─── PANNEAU QUI MONTE DU BAS (commun) ──────────────────────────────────────
function ouvrirPanneau(html, titre) {
  fermerPanneau();
  const voile = document.createElement('div');
  voile.className = 'voile';
  voile.id = 'voile';
  voile.addEventListener('click', fermerPanneau);
  const panneau = document.createElement('div');
  panneau.className = 'panneau';
  panneau.id = 'panneau';
  panneau.setAttribute('role', 'dialog');
  panneau.setAttribute('aria-label', titre);
  panneau.innerHTML = html;
  document.body.append(voile, panneau);
}

function fermerPanneau() {
  ['voile', 'panneau'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
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
