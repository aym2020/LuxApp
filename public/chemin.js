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
  // Synthèse (spec 48) : leçons terminées, acquises précédemment, réellement commencées.
  const statuts = liste.map(l => statutLecon48(l).code);
  const terminees = statuts.filter(c => c === 'termine' || c === 'mission').length;
  const anciennes = statuts.filter(c => c === 'acquis').length;
  const commencees = statuts.filter(c => c === 'encours').length;
  const enCours = leconEnCours(); // leçon conseillée (≠ commencée)
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
      (terminees || !anciennes ? '<span class="pastille v"><i></i>' + terminees + ' terminée' + (terminees > 1 ? 's' : '') + '</span>' : '') +
      (anciennes ? '<span class="pastille a"><i></i>' + anciennes + ' acquise' + (anciennes > 1 ? 's' : '') + ' précédemment</span>' : '') +
      (commencees ? '<span class="pastille o"><i></i>' + commencees + ' en cours</span>' : '') +
    '</div></div><ol class="chemin">';

  // Les leçons dans leur ordre : une seule carte chacune, dépliée sur place.
  liste.forEach(l => {
    const conseillee = !!(enCours && enCours.id === l.id);
    if (l.id === ouverte) html += leconDeplieeHtml(l, dus(l), anim, conseillee, pulse);
    else html += leconReplieeHtml(l, dus(l), conseillee, anim);
  });

  // 3. Examens, en fin de chemin.
  html += '<li class="pas exam"><span class="rond">' + ICONES.toque + '</span>' +
    '<button class="carte-lecon carte-exam" onclick="openExamens()">' +
      '<span class="num">Fin du parcours</span>' +
      '<h3>Examens ' + niveauActif + '</h3>' +
      '<span class="exam-txt">Entraîne-toi quand tu veux, même avant d\'avoir fini les leçons.</span>' +
      '<span class="lien-bleu">Voir les examens' + ICONES.fleche + '</span>' +
    '</button></li></ol>';

  box.innerHTML = html;
  if (typeof renderLessonsProgress === 'function') renderLessonsProgress();
}

// ─── STATUT D'UNE LEÇON (spec 48) ───────────────────────────────────────────
// Libellés identiques sur tous les écrans (docs/DESIGN_SYSTEM.md § 5 bis).
// code : termine | mission | acquis | encours | nouveau.
// « Recommandée » n'est pas un statut : une leçon conseillée jamais commencée
// reste « À découvrir » (la recommandation, c'est le bouton jaune).
function statutLecon48(l) {
  if (acquiseAncienneVersion(l)) return { code: 'acquis', libelle: 'Acquise précédemment' };
  if (leconTerminee(l)) {
    const r = isParcoursLecon(l) ? resumeLecon(l) : null;
    if (r && r.done < r.total && leconAcquiseParMission(l)) return { code: 'mission', libelle: 'Validée par la mission' };
    return { code: 'termine', libelle: 'Terminée' };
  }
  if (leconVraimentCommencee(l)) return { code: 'encours', libelle: 'En cours' };
  return { code: 'nouveau', libelle: 'À découvrir' };
}

// Une activité a vraiment été faite (réponse, unité, mission, partie en cours).
function leconVraimentCommencee(l) {
  if (isParcoursLecon(l)) return leconCommencee(l);
  return calculateLessonStats(l.id).percent > 0;
}

// Classe de l'étape du chemin (rond, trait) : vert, gris bleuté, or ou neutre.
function classePas(statut, conseillee) {
  if (statut.code === 'termine' || statut.code === 'mission') return 'fait';
  if (statut.code === 'acquis') return 'acquis';
  return conseillee ? 'encours' : 'futur';
}

function iconePas(classe) {
  if (classe === 'fait' || classe === 'acquis') return ICONES.coche;
  return classe === 'encours' ? ICONES.lecture : ICONES.livre;
}

// « 11 questions à réviser » (vide si rien à réviser). Compte réel du moteur.
function texteAReviser(dus) {
  if (!dus) return '';
  return dus + '\u00a0question' + (dus > 1 ? 's' : '') + ' à réviser'; // insécable : « 4 » reste avec « questions »
}

// Résultat d'une leçon terminée : étoiles réellement obtenues, ou « Sans faute ».
function resultatLeconHtml(l) {
  if (isParcoursLecon(l)) {
    if (leconSansFaute(l)) return '<span class="sans-faute">Sans faute</span>';
    return '<span class="etoiles">' + etoilesHtml(resumeLecon(l).stars) + '</span>';
  }
  return '<span class="etoiles">' + etoilesHtml(etoiles(calculateLessonStats(l.id).percent)) + '</span>';
}

// 2e ligne d'une leçon repliée : statut utile et révisions, seulement s'il y en a.
function ligne2LeconHtml(l, statut, dus) {
  const morceaux = [];
  const faites = etapesFaites(l);
  const avance = isParcoursLecon(l) && faites ? ' · ' + faites + '/' + etapesLecon(l) + ' étapes' : '';
  if (statut.code === 'termine') morceaux.push('<span class="statut-lecon st-termine">Terminée ' + resultatLeconHtml(l) + '</span>');
  else if (statut.code === 'mission') morceaux.push('<span class="statut-lecon st-mission">Validée par la mission</span>');
  else if (statut.code === 'acquis') morceaux.push('<span class="statut-lecon st-acquis">Acquise précédemment' + avance + '</span>');
  else if (statut.code === 'encours') morceaux.push('<span class="statut-lecon st-encours">En cours' + avance + '</span>');
  if (dus) morceaux.push('<span class="a-reviser">' + texteAReviser(dus) + '</span>');
  // Séparés par une espace : la ligne se coupe après « · », jamais avant.
  return morceaux.length ? '<span class="carte-ligne2">' + morceaux.join(' ') + '</span>' : '';
}

// Leçon repliée (spec 48) : grille commune.
//   ligne 1 : numéro et titre (plusieurs lignes possibles) · chevron en haut à droite ;
//   ligne 2 : statut et révisions, seulement si utile (sinon la carte reste compacte).
function leconReplieeHtml(l, dus, conseillee, anim) {
  const statut = statutLecon48(l);
  const classe = classePas(statut, conseillee);
  const vientDeFinir = classe === 'fait' && anim && anim.leconId === l.id && anim.uniteId === 'mission';
  const nomLu = 'Leçon ' + numLecon(l) + ', ' + titreCourt(l) + ', ' + statut.libelle +
    (conseillee ? ', leçon conseillée' : '') + (dus ? ', ' + texteAReviser(dus) : '');
  return '<li class="pas ' + classe + (classe === 'futur' ? '' : ' replie') + '" id="chemin-lecon-' + l.id + '">' +
    '<span class="rond' + (vientDeFinir ? ' vient-de-finir' : '') + '">' + iconePas(classe) + '</span>' +
    '<button class="carte-lecon compacte chemin-lecon" aria-expanded="false" aria-label="' + attrHtml(nomLu) + '" onclick="basculerLeconChemin(' + l.id + ')">' +
      '<span class="carte-haut"><span class="num">Leçon ' + numLecon(l) + '</span>' +
      '<span class="titre">' + escHtml(titreCourt(l)) + '</span></span>' +
      '<span class="chevron-l">' + ICONES.chevron + '</span>' +
      ligne2LeconHtml(l, statut, dus) +
    '</button></li>';
}

// Leçon dépliée : l'en-tête (qui la replie), ses étapes, puis LE bouton jaune,
// qui agit sur CETTE leçon.
function leconDeplieeHtml(l, dus, anim, conseillee, pulse) {
  const fini = leconTerminee(l);
  const statut = statutLecon48(l);
  const classe = classePas(statut, conseillee);
  const deplie = anim && anim.uniteId === 'mission' && anim.leconId !== l.id ? ' deplie' : '';
  const action = actionLeconChemin(l);

  let html = '<li class="pas ' + classe + ' ouverte" id="chemin-lecon-' + l.id + '">' +
    '<span class="rond">' + iconePas(classe) + '</span>' +
    '<div class="carte-lecon chemin-lecon ouvre' + deplie + '">' +
      '<button class="carte-tete" aria-expanded="true" onclick="basculerLeconChemin(' + l.id + ')">' +
        '<span class="carte-haut"><span class="num">Leçon ' + numLecon(l) + ' · <span class="st st-' + statut.code + '">' + statut.libelle + '</span></span>' +
        '<h3>' + escHtml(titreCourt(l)) + '</h3></span>' +
        '<span class="chevron-l">' + ICONES.chevron + '</span>' +
      '</button>' + (dus ? '<p class="a-reviser">' + texteAReviser(dus) + '</p>' : '');

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
  // Un seul libellé, selon l'état réel (spec 48) : Découvrir, Commencer, Continuer,
  // Reprendre, Faire les nouvelles unités, Revoir.
  if (!isParcoursLecon(l)) {
    const libelle = leconTerminee(l) ? 'Revoir' : leconVraimentCommencee(l) ? 'Continuer' : 'Découvrir';
    return { etape: null, libelle, fn: () => openLecon(l) };
  }

  const saved = loadRun();
  if (saved && saved.leconId === l.id) {
    return { etape: saved.uniteId, libelle: 'Reprendre', fn: () => ouvrirLeconEtReprendre(l) };
  }
  // Rien de commencé : « Découvrir » ouvre l'introduction ; introduction déjà
  // confirmée (« J'ai compris ») : « Commencer » ouvre la 1re unité.
  if (l.mission && l.scene && !leconCommencee(l)) {
    const premiere = unitesCoeur(l)[0];
    if (getIntroMissionVue(l.id)) return { etape: premiere.id, libelle: 'Commencer', fn: () => ouvrirUniteDepuisChemin(l.id, premiere.id) };
    return { etape: premiere.id, libelle: 'Découvrir', fn: () => ouvrirIntroMission(l) };
  }
  // Acquise dans l'ancienne version (spec 46) : le nouveau contenu est proposé,
  // jamais obligatoire (la leçon reste acquise et les suivantes restent ouvertes).
  if (acquiseAncienneVersion(l)) {
    const nouvelle = unitesCoeur(l).find(x => getUnitBest(l.id, x.id) == null);
    if (nouvelle) return { etape: nouvelle.id, libelle: 'Faire les nouvelles unités', fn: () => ouvrirUniteDepuisChemin(l.id, nouvelle.id) };
    if (l.mission && l.scene) return { etape: 'mission', libelle: 'Continuer', fn: () => ouvrirMissionDepuisChemin(l.id) };
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

// SPEC 53 — titres courts réservés à l'affichage du Chemin.
// Chaque entrée contient [titre source attendu, texte raccourci] : si une leçon
// évolue, on ne risque pas d'afficher un raccourci obsolète.
// Les leçons, les cours, les questions et les missions gardent leurs vrais titres.
const CHEMIN_UNITES_COURTES = {
  6: {
    1: ['zwee ou zwou, pluriel en -(e)n', 'zwee / zwou · pluriel -(e)n']
  },
  15: {
    1: ["Demander l'heure, lire les heures pleines", "Demander l'heure · heures pleines"]
  },
  20: {
    1: ['Dans, sur, sous : situer un objet', 'Dans, sur, sous']
  },
  21: {
    2: ['Sur, à côté… au féminin : der', 'Au féminin · der'],
    3: ['Au masculin et au neutre : dem, am, um', 'Masculin/neutre · dem, am, um']
  },
  23: {
    1: ['Présenter les membres de sa famille', 'Présenter sa famille'],
    3: ['La sœur de mon père : désigner un lien familial', 'Les liens familiaux']
  },
  24: {
    2: ["Ce que j'ai fait : passé avec hunn", 'Passé avec hunn']
  },
  27: {
    1: ['sinn : être au présent', 'sinn · être'],
    2: ['hunn : avoir au présent', 'hunn · avoir'],
    3: ['Questions et formes courtes : si, hu', 'Questions et formes courtes']
  }
};

// Toutes les missions A1.1/A1.2 actuellement publiées ont été relues.
// Le libellé complet reste disponible dans aria-label / title et dans la mission.
const CHEMIN_MISSIONS_COURTES = {
  1: ['Premier cours de luxembourgeois', 'Premier cours'],
  2: ['Premier jour au bureau', 'Au bureau'],
  3: ['Aux objets trouvés', 'Objets trouvés'],
  4: ['À la brocante', 'À la brocante'],
  5: ["L'inventaire du bureau", 'Inventaire'],
  6: ['Le déménagement du bureau', 'Déménagement du bureau'],
  7: ['Faire connaissance au centre de langues', 'Au centre de langues'],
  8: ['La fête des voisins', 'Fête des voisins'],
  9: ['Au café des langues', 'Café des langues'],
  10: ['Où habites-tu ?', 'Où habites-tu ?'],
  11: ['Rencontre au forum des métiers', 'Forum des métiers'],
  12: ['Parler de son lieu de travail', 'Lieu de travail'],
  13: ['Faire connaissance avec Marie', 'Rencontre avec Marie'],
  14: ['Faire connaissance : âge et anniversaire', 'Âge et anniversaire'],
  15: ['Lire les horaires du bureau', 'Horaires du bureau'],
  16: ['Raconter la journée de Carla', 'Journée de Carla'],
  17: ['Téléphoner pour un rendez-vous', 'Rendez-vous téléphonique'],
  20: ['Retrouver le ballon', 'Retrouver le ballon'],
  21: ['Le déménagement', 'Déménagement'],
  22: ['La pause café du vendredi', 'Pause café'],
  23: ['Présenter sa famille à Anne', 'Présenter sa famille'],
  24: ["Raconter sa journée d'hier", "Journée d'hier"],
  25: ['Faire ses courses au marché', 'Au marché'],
  26: ["Comprendre une annonce d'emploi", "Offre d'emploi"],
  27: ['Faire connaissance au café', 'Au café']
};

function libelleUniteChemin(lecon, unite) {
  const regle = CHEMIN_UNITES_COURTES[lecon.id] && CHEMIN_UNITES_COURTES[lecon.id][unite.id];
  return regle && regle[0] === unite.titre ? regle[1] : unite.titre;
}

function libelleMissionChemin(lecon) {
  if (!lecon.mission) return '';
  const regle = CHEMIN_MISSIONS_COURTES[lecon.id];
  return regle && regle[0] === lecon.mission.titre ? regle[1] : lecon.mission.titre;
}

// Unités du fil, mission, bilan : chacune ouvrable d'un appui (chevron à droite).
// etapeActuelle : l'étape mise en avant (anneau doré).
function etapesLeconHtml(l, etapeActuelle, anim, pulse) {
  let html = '';
  const libre = loadRun(true); // révision interrompue : signalée, sans déplacer l'anneau doré
  const principal = loadRun(); // partie interrompue : l'unité est « En cours »
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
    const interrompue = !fait && principal && principal.leconId === l.id && principal.uniteId === u.id;
    const nbEtoiles = fait ? etoiles(getUnitBest(l.id, u.id)) : 0;
    // Nom lu par les lecteurs d'écran : titre complet + état utile.
    let nomLu = u.id + ' · ' + u.titre + ', ' + (interrompue ? 'en cours' : actuelle ? 'étape recommandée' : fait ? 'terminée' : parMission ? 'facultative, leçon validée par la mission, non réalisée' : 'à découvrir');
    if (fait) nomLu += ', ' + nbEtoiles + ' étoile' + (nbEtoiles > 1 ? 's' : '') + ' sur 3';
    if (enRevision) nomLu += ', révision en cours';
    let sous = '';
    if (enRevision) sous = '<span class="sous revision">' + ICONES.revision + 'Révision en cours' + (parMission ? ' · validée par la mission' : '') + '</span>';
    else if (interrompue) sous = '<span class="sous en-cours">En cours</span>';
    else if (parMission) sous = '<span class="sous par-mission">Validée par la mission</span>';
    html += '<li class="' + classe + '" id="chemin-u-' + l.id + '-' + u.id + '"><button aria-label="' + attrHtml(nomLu) + '" onclick="ouvrirUniteDepuisChemin(' + l.id + ', ' + u.id + ')">' +
      '<span class="etat">' + ((fait || parMission) && !actuelle ? ICONES.coche : '') + '</span>' +
      '<span class="texte"><span class="nom" title="' + attrHtml(u.titre) + '">' +
        u.id + '&nbsp;·&nbsp;' + escHtml(libelleUniteChemin(l, u)) + '</span></span>' +
      (fait ? '<span class="tag">' + etoilesHtml(nbEtoiles) + '</span>' : '') +
      ICONES.droite + sous +
      '</button></li>';
  });

  if (l.mission && l.scene) {
    // Spec 48 : pas de compteur de découverte (« 0/20 ») ; un résultat seulement
    // après une partie jouée.
    const statut = statutMission(l);
    const resultat = { sansfaute: 'Sans faute', reussie: 'Réussie', jouee: 'À rejouer' }[statut] || '';
    const actuelle = etapeActuelle === 'mission';
    let classe = 'mission' + (statut === 'sansfaute' || statut === 'reussie' ? ' ok' : '') + (actuelle ? ' actuelle' + (pulse ? ' pulse' : '') : '');
    if (anim && anim.leconId === l.id && anim.uniteId === 'mission') classe += ' vient-de-finir';
    const nomLu = 'Mission : ' + l.mission.titre + (resultat ? ', ' + resultat : '');
    html += '<li class="' + classe + '" id="chemin-u-' + l.id + '-mission"><button aria-label="' + attrHtml(nomLu) + '" title="' + attrHtml(nomLu) + '" onclick="ouvrirMissionDepuisChemin(' + l.id + ')">' +
      '<span class="etat">' + ICONES.bulle + '</span>' +
      '<span class="texte"><span class="nom chemin-mission-nom"><strong>Mission</strong>' +
        '<span aria-hidden="true">&nbsp;·&nbsp;</span>' + escHtml(libelleMissionChemin(l)) + '</span></span>' +
      (resultat ? '<span class="tag statut' + (statut === 'jouee' ? ' ko' : ' ok') + '">' + resultat + '</span>' : '') +
      ICONES.droite + '</button></li>';
  }

  // Bilan : une ligne, le caractère optionnel dans le texte (pas de badge).
  html += '<li class="bilan"><button aria-label="Bilan, 10 questions, optionnel" title="Bilan facultatif · 10 questions" onclick="lancerBilanDepuisChemin(' + l.id + ')">' +
    '<span class="etat">' + ICONES.cible + '</span>' +
    '<span class="texte"><span class="nom">Bilan&nbsp;· 10&nbsp;questions</span></span>' +
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
