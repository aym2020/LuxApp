/* WATFIR · accueil éditorial, expérimentation limitée à dev.
   Source visuelle : prototype watfir_accueil_exemple.html.
   Chargé après accueil-v21.js. Le moteur métier (accueil.js) reste intact.
   Les états et boutons sont réels : aucune donnée de démo n'est introduite. */
(function () {
  'use strict';

  const enteteV21 = enteteAccueilHtml;

  // Le menu synchronisation/paramètres, les niveaux et l'auth restent ceux de v2.1.
  enteteAccueilHtml = function () {
    return enteteV21().replace(
      '<h1 class="ac-titre">LuxApp</h1>',
      '<h1 class="ac-titre watfir-wordmark">watfir<span aria-hidden="true">.</span></h1>'
    );
  };

  // Fond photographique/graphique local, sans texte incrusté.
  // Toute la typographie de marque reste sélectionnable, zoomable et accessible.
  accrocheHtml = function () {
    return '<section class="ac-hero watfir-hero entre-2" aria-label="Bienvenue sur Watfir">' +
      '<div class="ac-hero-image" aria-hidden="true"></div>' +
      '<div class="ac-hero-texte">' +
        '<span class="ac-hero-surtitre">LËTZEBUERGESCH / 001</span>' +
        '<h2>MOIEN<span class="watfir-punctuation">.</span></h2>' +
        '<p>Le luxembourgeois autrement.</p>' +
      '</div></section>';
  };

  // Navigation réelle, dans le bandeau noir du prototype.
  // L'état de révision reste disponible pour les lecteurs d'écran.
  accesHtml = function (rev) {
    const detailsRevision = infoRevision(rev);
    return '<div class="ac-v21-actions watfir-actions">' +
      '<nav class="ac-acces entre-3" aria-label="Accès rapides">' +
        '<button type="button" class="ac-btn rev" onclick="lancerRevision()">' +
          '<span class="watfir-shortcut-n" aria-hidden="true">01</span>' +
          '<b>Réviser</b>' +
          (detailsRevision ? '<span class="watfir-visually-hidden">' + detailsRevision + '</span>' : '') +
        '</button>' +
        '<button type="button" class="ac-btn exa" onclick="openExamens()">' +
          '<span class="watfir-shortcut-n" aria-hidden="true">02</span>' +
          '<b>Examens</b>' +
        '</button>' +
        '<button type="button" class="ac-btn err" onclick="startSession(\'errors\')" aria-label="Erreurs fréquentes">' +
          '<span class="watfir-shortcut-n" aria-hidden="true">03</span>' +
          '<b>Erreurs</b>' +
        '</button>' +
      '</nav>' +
      '<button type="button" class="ac-btn lecons ac-v21-journey" onclick="goLessons()">' +
        '<b>Voir mon chemin</b>' + ICONES.suite +
      '</button>' +
      '<p class="watfir-footer">' + escHtml(niveauActif) + ' · Apprends à ton rythme.</p>' +
    '</div>';
  };

  // Pas de surcharge des fonctions de progression ou de reprise.
  // accueil-v21.js sait déjà afficher le hero pour les visiteurs débutants et actifs.
})();