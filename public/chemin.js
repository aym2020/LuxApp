// ─── MON CHEMIN (S13) : remplace la liste des leçons ───────────────────────
// Une ligne verticale de ronds reliés, pour le niveau choisi :
//   - leçons terminées : UN bloc vert, replié (« Leçons 1 à 7 · Voir ») ;
//   - leçon en cours : dépliée, avec ses unités, sa mission et le bilan
//     (facultatif), et le bouton jaune de l'écran ;
//   - leçons à venir : une ligne chacune, toujours cliquables ;
//   - examens : en fin de chemin, ouverts à tout moment.
// Rien n'est verrouillé : chaque leçon et chaque étape s'ouvre d'un appui.

let cheminFiniesOuvert = false;

// Ancien nom gardé : tout le code appelle renderLessons() pour la liste.
function renderLessons() {
  const box = document.getElementById('lecon-list');
  if (!box) return;

  const liste = leconsActives();
  const terminees = liste.filter(leconTerminee);
  const enCours = leconEnCours();
  const fraicheurs = resumeRevision(liste).parLecon;
  const anim = dernierFini; // étape tout juste finie : animée une seule fois
  dernierFini = null;

  let html = '<div class="chemin-tete entre">' +
    '<span class="etiquette or">Parcours ' + niveauActif + '</span>' +
    '<h1>Mon chemin</h1>' +
    '<div class="resume">' +
      '<span class="pastille v"><i></i>' + terminees.length + ' terminée' + (terminees.length > 1 ? 's' : '') + '</span>' +
      (enCours ? '<span class="pastille o"><i></i>1 en cours</span>' : '') +
    '</div></div><ol class="chemin">';

  // 1. Bloc des leçons terminées.
  if (terminees.length) {
    const leconFinieAnimee = anim && terminees.some(l => l.id === anim.leconId) && anim.uniteId === 'mission';
    html += '<li class="pas fait' + (leconFinieAnimee ? ' trait-anime' : '') + '">' +
      '<span class="rond' + (leconFinieAnimee ? ' vient-de-finir' : '') + '">' + ICONES.coche + '</span>' +
      '<div class="carte-lecon groupe-fini">' +
        '<button class="groupe-tete" aria-expanded="' + cheminFiniesOuvert + '" onclick="basculerTerminees()">' +
          '<span><span class="num st">Terminées</span><b>' + titreGroupe(terminees) + '</b></span>' +
          '<span class="voir">' + (cheminFiniesOuvert ? 'Masquer' : 'Voir') + ICONES.chevron + '</span>' +
        '</button>' +
        (cheminFiniesOuvert ? '<div class="lignes-finies">' + terminees.map(ligneFinieHtml).join('') + '</div>' : '') +
      '</div></li>';
  }

  // 2. Leçon en cours, puis 3. leçons à venir (dans l'ordre du niveau).
  liste.forEach(l => {
    if (leconTerminee(l)) return;
    const dus = fraicheurs[l.id] ? fraicheurs[l.id].dus : 0;
    if (enCours && enCours.id === l.id) html += leconEnCoursHtml(l, dus, anim);
    else html += leconAVenirHtml(l, dus);
  });

  // 4. Examens, en fin de chemin.
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

function titreGroupe(terminees) {
  if (terminees.length === 1) return 'Leçon ' + terminees[0].id;
  return 'Leçons ' + terminees[0].id + ' à ' + terminees[terminees.length - 1].id;
}

function basculerTerminees() {
  cheminFiniesOuvert = !cheminFiniesOuvert;
  renderLessons();
}

// Une leçon terminée dans le bloc déplié : numéro, titre, étoiles.
function ligneFinieHtml(l) {
  return '<button class="ligne-finie chemin-lecon" style="--lc:' + l.couleur + '" onclick="ouvrirLeconDepuisListe(' + l.id + ')">' +
    '<span class="n">' + l.id + '</span><span class="t">' + escHtml(titreCourt(l)) + '</span>' +
    resultatLeconHtml(l) + '</button>';
}

// Étoiles d'une leçon terminée, ou « Sans faute ».
function resultatLeconHtml(l) {
  if (isParcoursLecon(l)) {
    if (leconSansFaute(l)) return '<span class="sans-faute">Sans faute</span>';
    return '<span class="etoiles">' + etoilesHtml(resumeLecon(l).stars) + '</span>';
  }
  return '<span class="etoiles">' + etoilesHtml(etoiles(calculateLessonStats(l.id).percent)) + '</span>';
}

function rafraichirPastille(dus) {
  return dus ? '<span class="pastille-fraicheur">À rafraîchir · ' + dus + '</span>' : '';
}

// Leçon à venir : une ligne, cliquable.
function leconAVenirHtml(l, dus) {
  const faites = etapesFaites(l);
  return '<li class="pas futur"><span class="rond">' + ICONES.livre + '</span>' +
    '<button class="carte-lecon compacte chemin-lecon" style="--lc:' + l.couleur + '" onclick="ouvrirLeconDepuisListe(' + l.id + ')">' +
      '<span class="num"><b>Leçon ' + l.id + '</b></span>' +
      '<span class="titre">' + escHtml(titreCourt(l)) + '</span>' +
      (faites ? '<span class="avance">' + faites + '/' + etapesLecon(l) + '</span>' : '') +
      rafraichirPastille(dus) +
    '</button></li>';
}

// Leçon en cours : dépliée.
function leconEnCoursHtml(l, dus, anim) {
  const pas = prochainPas();
  let html = '<li class="pas encours" id="pas-encours"><span class="rond">' + ICONES.lecture + '</span>' +
    '<div class="carte-lecon chemin-lecon" style="--lc:' + l.couleur + '">' +
      '<span class="num"><b>Leçon ' + l.id + '</b> · <span class="st">En cours</span></span>' +
      '<h3>' + escHtml(titreCourt(l)) + '</h3>' +
      '<span class="lux">' + escHtml(l.titre) + '</span>' + rafraichirPastille(dus);

  if (isParcoursLecon(l)) {
    html += '<ul class="unites">' + etapesEnCoursHtml(l, pas, anim) + '</ul>';
  } else {
    const pct = calculateLessonStats(l.id).percent;
    html += '<p class="v1-txt">Leçon classique : cours, cartes, quiz, trous et écriture.' +
      (pct ? ' Maîtrise : ' + pct + ' %.' : '') + '</p>';
  }

  html += '<button class="btn-jaune" onclick="suivreProchainPas()"><span>' +
      escHtml(pas && pas.lecon.id === l.id ? libelleBouton(pas) : 'Ouvrir la leçon') + '</span>' + ICONES.fleche + '</button>' +
    '<button class="lien-or" onclick="ouvrirLeconDepuisListe(' + l.id + ')">Voir toute la leçon' + ICONES.fleche + '</button>' +
    '</div></li>';
  return html;
}

// Unités du fil, mission, bilan : chacune ouvrable d'un appui.
function etapesEnCoursHtml(l, pas, anim) {
  const run = loadRun();
  const runIci = run && run.leconId === l.id ? run : null;
  // L'étape « actuelle » (anneau doré) : partie en cours, sinon la première non faite.
  let actuelle = null;
  if (runIci) actuelle = runIci.uniteId;
  else if (pas && pas.lecon.id === l.id) actuelle = pas.type === 'mission' ? 'mission' : (pas.unite ? pas.unite.id : null);

  let html = '';
  unitesCoeur(l).forEach(u => {
    const fait = getUnitBest(l.id, u.id) != null;
    let classe = fait ? 'ok' : '';
    if (actuelle === u.id) classe = 'actuelle';
    if (anim && anim.leconId === l.id && anim.uniteId === u.id) classe += ' vient-de-finir';
    html += '<li class="' + classe + '"><button onclick="ouvrirUniteDepuisChemin(' + l.id + ', ' + u.id + ')">' +
      '<span class="etat">' + (fait && actuelle !== u.id ? ICONES.coche : '') + '</span>' +
      '<span class="nom">Unité ' + u.id + ' · ' + escHtml(u.titre) + '</span>' +
      (fait ? '<span class="tag">' + etoilesHtml(etoiles(getUnitBest(l.id, u.id))) + '</span>' : '') +
      '</button></li>';
  });

  if (l.mission && l.scene) {
    const statut = statutMission(l);
    let tag = l.scene.filter(x => repliqueApprise(l, x)).length + '/' + l.scene.length + ' répliques';
    if (statut === 'sansfaute') tag = 'Sans faute';
    else if (statut === 'reussie') tag = 'Réussie';
    else if (statut === 'jouee') tag = 'À rejouer';
    let classe = 'mission' + (statut ? ' ok' : '') + (actuelle === 'mission' ? ' actuelle' : '');
    if (anim && anim.leconId === l.id && anim.uniteId === 'mission') classe += ' vient-de-finir';
    html += '<li class="' + classe + '"><button onclick="ouvrirMissionDepuisChemin(' + l.id + ')">' +
      '<span class="etat">' + ICONES.bulle + '</span>' +
      '<span class="nom">Mission · ' + escHtml(l.mission.titre) + '</span><span class="tag">' + tag + '</span></button></li>';
  }

  html += '<li class="bilan"><button onclick="lancerBilanDepuisChemin(' + l.id + ')">' +
    '<span class="etat">' + ICONES.cible + '</span>' +
    '<span class="nom">Bilan · 10 questions mêlées</span><span class="tag">facultatif</span></button></li>';
  return html;
}

function trouverLecon(id) {
  return lecons.find(x => x.id === id);
}

function ouvrirUniteDepuisChemin(leconId, uniteId) {
  const l = trouverLecon(leconId);
  openParcoursLecon(l);
  const run = loadRun();
  if (run && run.leconId === leconId && run.uniteId === uniteId) reprendreRun();
  else openIntro(uniteId);
}

function ouvrirMissionDepuisChemin(leconId) {
  openParcoursLecon(trouverLecon(leconId));
  openMission();
}

function lancerBilanDepuisChemin(leconId) {
  pLecon = trouverLecon(leconId);
  currentLecon = pLecon;
  lancerBilan();
}

// Le chemin s'ouvre sur la leçon en cours.
function allerALeconEnCours() {
  const el = document.getElementById('pas-encours');
  if (!el || !el.scrollIntoView) return;
  const reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'center' });
}
