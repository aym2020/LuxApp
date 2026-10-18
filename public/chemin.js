// ─── MON CHEMIN (S13) : remplace la liste des leçons ───────────────────────
// Une ligne verticale de ronds reliés, pour le niveau choisi (spec 33) :
//   - TOUTES les leçons dans leur ordre (1, 2, 3…), chacune à sa place et sur
//     une seule carte : terminée (verte), conseillée (or) ou à venir ;
//   - UNE seule leçon dépliée à la fois (accordéon) : par défaut la leçon
//     conseillée ; un appui sur une autre leçon la déplie et replie la
//     précédente ; un appui sur la leçon dépliée la replie ;
//   - examens : en fin de chemin, ouverts à tout moment.
// Rien n'est verrouillé : chaque leçon et chaque étape s'ouvre d'un appui.
// Déplier une leçon ne change pas la leçon conseillée.

// Leçon dépliée : undefined = la leçon conseillée, null = toutes repliées, sinon son id.
// Gardée en mémoire : on la retrouve en revenant d'un exercice.
let cheminLeconOuverte;
let cheminArrivee = false; // true à l'ouverture du chemin : l'étape conseillée pulse une fois

// Ancien nom gardé : tout le code appelle renderLessons() pour la liste.
function renderLessons() {
  const box = document.getElementById('lecon-list');
  if (!box) return;

  const liste = leconsActives();
  const terminees = liste.filter(l => leconTerminee(l) && !acquiseAncienneVersion(l));
  const anciennes = liste.filter(acquiseAncienneVersion); // spec 46
  const enCours = leconEnCours();
  const fraicheurs = resumeRevision(liste).parLecon;
  const anim = dernierFini; // étape tout juste finie : animée une seule fois
  dernierFini = null;
  const pulse = cheminArrivee;
  cheminArrivee = false;

  // Leçon dépliée (une leçon d'un autre niveau ne compte pas).
  let ouverte = cheminLeconOuverte === undefined ? (enCours ? enCours.id : null) : cheminLeconOuverte;
  if (ouverte != null && !liste.some(l => l.id === ouverte)) ouverte = enCours ? enCours.id : null;
  const dus = l => (fraicheurs[l.id] ? fraicheurs[l.id].dus : 0);

  // L'en-tête ne s'anime qu'à l'arrivée sur le chemin, jamais quand on
  // déplie ou replie une leçon (il clignotait, spec 33).
  let html = '<div class="chemin-tete' + (pulse ? ' entre' : '') + '">' +
    '<div class="chemin-titre"><h1>Mon chemin</h1><span class="etiquette or">Parcours ' + niveauActif + '</span></div>' +
    '<div class="resume">' +
      (terminees.length || !anciennes.length ? '<span class="pastille v"><i></i>' + terminees.length + ' terminée' + (terminees.length > 1 ? 's' : '') + '</span>' : '') +
      (anciennes.length ? '<span class="pastille a"><i></i>' + anciennes.length + ' acquise' + (anciennes.length > 1 ? 's' : '') + ' · v1</span>' : '') +
      (enCours ? '<span class="pastille o"><i></i>1 en cours</span>' : '') +
    '</div></div><ol class="chemin">';

  // Les leçons dans leur ordre : une seule carte chacune, dépliée sur place.
  liste.forEach(l => {
    const conseillee = !!(enCours && enCours.id === l.id);
    if (l.id === ouverte) html += leconDeplieeHtml(l, dus(l), anim, conseillee, pulse);
    else html += leconReplieeHtml(l, dus(l), conseillee, anim);
  });

  // 3. Examens, en fin de chemin.
  html += '<li class="pas exam"><span class="rond">' + ICONES.toque + '</span>' +
    '<button class="carte-lecon" onclick="openExamens()">' +
      '<span class="num st">Fin du parcours</span>' +
      '<h3>Examens ' + niveauActif + '</h3>' +
      '<span class="exam-txt">Entraîne-toi quand tu veux, même avant d\'avoir fini les leçons.</span>' +
      '<span class="lien-bleu">Voir les examens' + ICONES.fleche + '</span>' +
    '</button></li></ol>';

  box.innerHTML = html;
  if (typeof renderLessonsProgress === 'function') renderLessonsProgress();
}

// Étoiles d'une leçon terminée, ou « Sans faute ».
function resultatLeconHtml(l) {
  // Acquise dans l'ancienne version, nouvelles unités pas toutes faites (spec 46) :
  // ni étoiles ni « Terminée » ; l'avancement réel s'il y en a un.
  if (acquiseAncienneVersion(l)) {
    const faites = etapesFaites(l);
    return '<span class="acquise ancienne">Acquise · v1' + (faites ? ' · ' + faites + '/' + etapesLecon(l) : '') + '</span>';
  }
  // Validée par la mission avant la fin des unités (spec 32) : pas d'étoiles inventées.
  const r = isParcoursLecon(l) ? resumeLecon(l) : null;
  if (r && leconAcquiseParMission(l) && r.done < r.total) return '<span class="validee">Validée par la mission</span>';
  if (isParcoursLecon(l)) {
    if (leconSansFaute(l)) return '<span class="sans-faute">Sans faute</span>';
    return '<span class="etoiles">' + etoilesHtml(resumeLecon(l).stars) + '</span>';
  }
  return '<span class="etoiles">' + etoilesHtml(etoiles(calculateLessonStats(l.id).percent)) + '</span>';
}

function rafraichirPastille(dus) {
  return dus ? '<span class="pastille-fraicheur">À rafraîchir · ' + dus + '</span>' : '';
}

// Leçon repliée : une ligne, avec un chevron. Un appui la déplie.
// Terminée : rond vert coché et son résultat (étoiles, « Sans faute » ou « Validée par la mission »).
function leconReplieeHtml(l, dus, conseillee, anim) {
  const fini = leconTerminee(l);
  const faites = etapesFaites(l);
  const vientDeFinir = fini && anim && anim.leconId === l.id && anim.uniteId === 'mission';
  return '<li class="pas ' + (fini ? 'fait replie' : conseillee ? 'encours replie' : 'futur') + '" id="chemin-lecon-' + l.id + '">' +
    '<span class="rond' + (vientDeFinir ? ' vient-de-finir' : '') + '">' + (fini ? ICONES.coche : conseillee ? ICONES.lecture : ICONES.livre) + '</span>' +
    '<button class="carte-lecon compacte chemin-lecon" style="--lc:' + l.couleur + '" aria-expanded="false" onclick="basculerLeconChemin(' + l.id + ')">' +
      '<span class="num"><b>Leçon ' + numLecon(l) + '</b></span>' +
      '<span class="titre">' + escHtml(titreCourt(l)) + '</span>' +
      (fini ? resultatLeconHtml(l) : faites ? '<span class="avance">' + faites + '/' + etapesLecon(l) + '</span>' : '') +
      '<span class="chevron-l">' + ICONES.chevron + '</span>' +
      rafraichirPastille(dus) +
    '</button></li>';
}

// Leçon dépliée : l'en-tête (qui la replie), ses étapes, puis LE bouton jaune,
// qui agit sur CETTE leçon.
function leconDeplieeHtml(l, dus, anim, conseillee, pulse) {
  const fini = leconTerminee(l);
  const r = isParcoursLecon(l) ? resumeLecon(l) : null;
  const parMission = fini && r && r.done < r.total && leconAcquiseParMission(l);
  const ancienne = acquiseAncienneVersion(l); // spec 46
  const etat = ancienne ? 'Acquise · v1' : parMission ? 'Validée par la mission' : fini ? 'Terminée' : conseillee ? 'En cours' : etapesFaites(l) ? 'Commencée' : 'À découvrir';
  const deplie = anim && anim.uniteId === 'mission' && anim.leconId !== l.id ? ' deplie' : '';
  const action = actionLeconChemin(l);

  let html = '<li class="pas ' + (fini ? 'fait' : conseillee ? 'encours' : 'futur') + ' ouverte" id="chemin-lecon-' + l.id + '">' +
    '<span class="rond">' + (fini ? ICONES.coche : conseillee ? ICONES.lecture : ICONES.livre) + '</span>' +
    '<div class="carte-lecon chemin-lecon ouvre' + deplie + '" style="--lc:' + l.couleur + '">' +
      '<button class="carte-tete" aria-expanded="true" onclick="basculerLeconChemin(' + l.id + ')">' +
        '<span class="num"><b>Leçon ' + numLecon(l) + '</b> · <span class="st">' + etat + '</span></span>' +
        '<span class="chevron-l">' + ICONES.chevron + '</span>' +
        '<h3>' + escHtml(titreCourt(l)) + '</h3>' +
      '</button>' + rafraichirPastille(dus);

  if (isParcoursLecon(l)) {
    html += '<ul class="unites">' + etapesLeconHtml(l, action.etape, anim, pulse && !fini) + '</ul>';
  } else {
    const pct = calculateLessonStats(l.id).percent;
    html += '<p class="v1-txt">Leçon classique : cours, cartes, quiz, trous et écriture.' +
      (pct ? ' Maîtrise : ' + pct + ' %.' : '') + '</p>';
  }

  html += '<button class="btn-jaune" onclick="lancerActionLecon(' + l.id + ')"><span>' + escHtml(action.libelle) + '</span>' + ICONES.fleche + '</button>' +
    '<button class="lien-or" onclick="ouvrirLeconDepuisListe(' + l.id + ')">Voir toute la leçon' + ICONES.fleche + '</button>' +
    '</div></li>';
  return html;
}

// Ce que fait le bouton jaune d'une leçon dépliée, pour CETTE leçon :
//   etape   : l'étape mise en avant (numéro d'unité, 'mission' ou null) ;
//   libelle : le texte du bouton ;   fn : ce qu'il lance.
function actionLeconChemin(l) {
  // Un seul verbe : l'étape visée est déjà mise en avant dans la liste (spec 17).
  if (!isParcoursLecon(l)) return { etape: null, libelle: 'Ouvrir', fn: () => openLecon(l) };

  const saved = loadRun();
  if (saved && saved.leconId === l.id) {
    return { etape: saved.uniteId, libelle: 'Reprendre', fn: () => ouvrirLeconEtReprendre(l) };
  }
  // Rien de commencé (même si l'introduction a été lue) : « Découvrir » ouvre l'introduction.
  if (l.mission && l.scene && !leconCommencee(l)) {
    return { etape: unitesCoeur(l)[0].id, libelle: 'Découvrir', fn: () => ouvrirIntroMission(l) };
  }
  // Acquise dans l'ancienne version (spec 46) : le nouveau contenu est proposé,
  // jamais obligatoire (la leçon reste acquise et les suivantes restent ouvertes).
  if (acquiseAncienneVersion(l)) {
    const nouvelle = unitesCoeur(l).find(x => getUnitBest(l.id, x.id) == null);
    if (nouvelle) return { etape: nouvelle.id, libelle: 'Faire les nouvelles unités', fn: () => ouvrirUniteDepuisChemin(l.id, nouvelle.id) };
    if (l.mission && l.scene) return { etape: 'mission', libelle: 'Jouer la nouvelle mission', fn: () => ouvrirMissionDepuisChemin(l.id) };
  }
  const deja = leconTerminee(l); // acquise : plus d'unité obligatoire (spec 32)
  const u = deja ? null : unitesCoeur(l).find(x => getUnitBest(l.id, x.id) == null);
  if (u) {
    const aucune = unitesCoeur(l).every(x => getUnitBest(l.id, x.id) == null);
    return { etape: u.id, libelle: aucune ? 'Commencer' : 'Continuer', fn: () => ouvrirUniteDepuisChemin(l.id, u.id) };
  }
  if (!deja && l.mission && l.scene) { // unités faites, mission pas encore réussie
    return { etape: 'mission', libelle: 'Continuer', fn: () => ouvrirMissionDepuisChemin(l.id) };
  }
  return { etape: null, libelle: 'Revoir', fn: () => ouvrirLeconDepuisListe(l.id) };
}

function lancerActionLecon(leconId) {
  actionLeconChemin(trouverLecon(leconId)).fn();
}

// Unités du fil, mission, bilan : chacune ouvrable d'un appui (chevron à droite).
// etapeActuelle : l'étape mise en avant (anneau doré).
function etapesLeconHtml(l, etapeActuelle, anim, pulse) {
  let html = '';
  const libre = loadRun(true); // révision interrompue : signalée, sans déplacer l'anneau doré
  // 1re réussite d'une unité dans cette leçon (spec 27) : coche, étoiles et halo
  // vert, puis la prochaine unité s'allume. Joué une seule fois (dernierFini est vidé).
  const premiere = !!(anim && anim.premiere && anim.leconId === l.id);
  unitesCoeur(l).forEach(u => {
    const fait = getUnitBest(l.id, u.id) != null;
    const actuelle = etapeActuelle === u.id;
    // Pas jouée mais couverte par la mission réussie (spec 33) : verte, sans étoiles.
    const parMission = !fait && leconAcquiseParMission(l);
    // États : terminée (ok), validée par la mission (ok par-mission), recommandée (actuelle), à découvrir (a-venir).
    let classe = fait ? 'ok' : parMission ? 'ok par-mission' : 'a-venir';
    if (actuelle) classe = 'actuelle' + (pulse || premiere ? ' pulse' : '') + (premiere ? ' apres' : '');
    if (anim && anim.leconId === l.id && anim.uniteId === u.id) classe += ' vient-de-finir' + (premiere ? ' premiere' : '');
    // Spec 29 : le titre a toute la largeur restante ; « Révision en cours »
    // passe dessous (seulement s'il y en a une), les étoiles restent à droite.
    const enRevision = libre && libre.leconId === l.id && libre.uniteId === u.id;
    const nbEtoiles = fait ? etoiles(getUnitBest(l.id, u.id)) : 0;
    // Nom lu par les lecteurs d'écran : titre complet + état utile.
    let nomLu = u.id + ' · ' + u.titre + ', ' + (actuelle ? 'étape recommandée' : fait ? 'terminée' : parMission ? 'validée par la mission, non réalisée' : 'à découvrir');
    if (fait) nomLu += ', ' + nbEtoiles + ' étoile' + (nbEtoiles > 1 ? 's' : '') + ' sur 3';
    if (enRevision) nomLu += ', révision en cours';
    html += '<li class="' + classe + '" id="chemin-u-' + l.id + '-' + u.id + '"><button aria-label="' + attrHtml(nomLu) + '" onclick="ouvrirUniteDepuisChemin(' + l.id + ', ' + u.id + ')">' +
      '<span class="etat">' + ((fait || parMission) && !actuelle ? ICONES.coche : '') + '</span>' +
      '<span class="texte"><span class="nom">' + u.id + '&nbsp;·&nbsp;' + escHtml(u.titre) + '</span></span>' +
      (fait ? '<span class="tag">' + etoilesHtml(nbEtoiles) + '</span>' : '') +
      ICONES.droite +
      (enRevision ? '<span class="sous revision">' + ICONES.revision + 'Révision en cours' + (parMission ? ' · validée par la mission' : '') + '</span>'
        : parMission ? '<span class="sous par-mission">Validée par la mission</span>' : '') +
      '</button></li>';
  });

  if (l.mission && l.scene) {
    const statut = statutMission(l);
    let tag = l.scene.filter(x => repliqueApprise(l, x)).length + '/' + l.scene.length;
    if (statut === 'sansfaute') tag = 'Sans faute';
    else if (statut === 'reussie') tag = 'Réussie';
    else if (statut === 'jouee') tag = 'À rejouer';
    const actuelle = etapeActuelle === 'mission';
    let classe = 'mission' + (statut ? ' ok' : '') + (actuelle ? ' actuelle' + (pulse ? ' pulse' : '') : '');
    if (anim && anim.leconId === l.id && anim.uniteId === 'mission') classe += ' vient-de-finir';
    // Mission et bilan : même structure (spec 30) — texte à gauche, statut discret à droite.
    const nomLu = 'Mission : ' + l.mission.titre + ', ' + tag;
    html += '<li class="' + classe + '" id="chemin-u-' + l.id + '-mission"><button aria-label="' + attrHtml(nomLu) + '" onclick="ouvrirMissionDepuisChemin(' + l.id + ')">' +
      '<span class="etat">' + ICONES.bulle + '</span>' +
      '<span class="texte"><span class="sur">Mission</span><span class="nom">' + escHtml(l.mission.titre) + '</span></span>' +
      '<span class="tag statut">' + tag + '</span>' +
      ICONES.droite + '</button></li>';
  }

  html += '<li class="bilan"><button aria-label="Bilan, 10 questions, facultatif" onclick="lancerBilanDepuisChemin(' + l.id + ')">' +
    '<span class="etat">' + ICONES.cible + '</span>' +
    '<span class="texte"><span class="nom">Bilan&nbsp;· 10&nbsp;questions</span></span><span class="tag statut">Facultatif</span>' +
    ICONES.droite + '</button></li>';
  return html;
}

// Texte sûr dans un attribut HTML (guillemets compris).
function attrHtml(texte) {
  return escHtml(String(texte)).replace(/"/g, '&quot;');
}

function trouverLecon(id) {
  return lecons.find(x => x.id === id);
}

// ─── ACCORDÉON ──────────────────────────────────────────────────────────────
// Appui sur une leçon : elle se déplie (la précédente se replie), ou se replie.
// La carte touchée reste à la même hauteur à l'écran, puis on la cadre.
function basculerLeconChemin(leconId) {
  const avant = document.getElementById('chemin-lecon-' + leconId);
  const hautAvant = avant ? avant.getBoundingClientRect().top : null;
  const dejaOuverte = !!(avant && avant.classList.contains('ouverte'));
  cheminLeconOuverte = dejaOuverte ? null : leconId;
  renderLessons();

  const apres = document.getElementById('chemin-lecon-' + leconId);
  if (!apres) return;
  // Un seul défilement par appui (spec 33) : la carte touchée reste à la même
  // hauteur, puis, si on vient de l'ouvrir, on la cadre — calculés ensemble.
  const r = apres.getBoundingClientRect();
  const compense = hautAvant != null ? r.top - hautAvant : 0;
  const cadre = dejaOuverte ? 0 : decalageCadrage(r.top - compense, r.bottom - compense);
  if (compense + cadre) window.scrollBy(0, compense + cadre);
}

// Pour revenir d'un exercice : la leçon de l'exercice est dépliée.
function ouvrirLeconDansChemin(leconId) {
  cheminLeconOuverte = leconId;
}

// Hauteur visible au-dessus de la barre du bas.
function basVisibleChemin() {
  const nav = document.getElementById('nav-bas');
  const hautNav = nav && !nav.classList.contains('hidden') ? nav.offsetHeight : 0;
  return window.innerHeight - hautNav - 12;
}

// Montre la carte entière si elle tient, sinon son début (jamais centrée) :
// renvoie de combien défiler pour une carte placée entre top et bottom.
function decalageCadrage(top, bottom) {
  const haut = 12;
  const bas = basVisibleChemin();
  if (bottom - top > bas - haut || top < haut) return top - haut;
  if (bottom > bas) return bottom - bas;
  return 0;
}


// Retour d'un exercice : l'étape quittée doit être visible (au-dessus de la barre du bas).
function montrerEtapeChemin(leconId, etape) {
  const el = document.getElementById('chemin-u-' + leconId + '-' + etape) || document.getElementById('chemin-lecon-' + leconId);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const bas = basVisibleChemin();
  if (r.top < 12) window.scrollBy(0, r.top - 12);
  else if (r.bottom > bas) window.scrollBy(0, r.bottom - bas);
}

// Chemin ouvert sur une leçon, sa carte centrée dans la zone visible (spec 40).
// Carte plus haute que l'écran (leçon dépliée) : son début en haut, sous l'en-tête.
function cadrerLeconChemin(leconId) {
  const el = document.getElementById('chemin-lecon-' + leconId);
  const vue = document.getElementById('view-lessons');
  if (!el || !vue || !vue.classList.contains('active')) return;
  const r = el.getBoundingClientRect();
  const bas = basVisibleChemin();
  const haut = 12;
  const decalage = r.height > bas - haut ? r.top - haut : (r.top + r.bottom) / 2 - (haut + bas) / 2;
  window.scrollTo(0, Math.max(0, window.scrollY + decalage));
}

// Spec 42 : le cadrage est refait une fois le rendu stabilisé (deux images,
// polices chargées, fermeture du clavier du téléphone qui agrandit l'écran),
// sauf si l'utilisateur a lui-même touché ou fait défiler l'écran entre-temps.
let cadrageInterrompu = false;
['pointerdown', 'wheel', 'touchmove', 'keydown'].forEach(evt =>
  window.addEventListener(evt, () => { cadrageInterrompu = true; }, { passive: true, capture: true }));

function centrerLeconChemin(leconId) {
  cadrageInterrompu = false;
  const refaire = () => { if (!cadrageInterrompu) cadrerLeconChemin(leconId); };
  refaire();
  requestAnimationFrame(() => requestAnimationFrame(refaire));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refaire);
  setTimeout(refaire, 400); // clavier refermé : la zone visible a changé
}

// Après « Refaire mes erreurs » : le chemin principal, avec la leçon travaillée
// dépliée (seule) comme après un appui sur sa carte — unités, étoiles,
// « Continuer » — puis cadrée (spec 44, remplace le repli des specs 40-41).
function cheminSurLecon(leconId) {
  cheminLeconOuverte = leconId;
  goLessons();
  centrerLeconChemin(leconId);
}

// ─── OUVRIR UNE ÉTAPE DEPUIS LE CHEMIN ──────────────────────────────────────
function ouvrirUniteDepuisChemin(leconId, uniteId) {
  const l = trouverLecon(leconId);
  cheminLeconOuverte = leconId;
  openParcoursLecon(l);
  const run = loadRun();
  const libre = loadRun(true);
  if (run && run.leconId === leconId && run.uniteId === uniteId) reprendreRun();
  else if (libre && libre.leconId === leconId && libre.uniteId === uniteId) reprendreRun(true); // révision interrompue
  else openIntro(uniteId);
}

function ouvrirLeconEtReprendre(l) {
  cheminLeconOuverte = l.id;
  openParcoursLecon(l);
  reprendreRun();
}

function ouvrirMissionDepuisChemin(leconId) {
  cheminLeconOuverte = leconId;
  openParcoursLecon(trouverLecon(leconId));
  openMission();
}

function lancerBilanDepuisChemin(leconId) {
  cheminLeconOuverte = leconId;
  pLecon = trouverLecon(leconId);
  currentLecon = pLecon;
  lancerBilan();
}
