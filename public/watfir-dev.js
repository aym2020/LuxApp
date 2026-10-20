/* Watfir — concept Pop Editorial, branche dev uniquement.
   Se superpose à accueil-v21.js : aucune modification du moteur pédagogique. */
(function () {
  'use strict';
  const entete21 = enteteAccueilHtml;

  enteteAccueilHtml = function () {
    return entete21()
      .replace('<h1 class="ac-titre">LuxApp</h1>',
        '<h1 class="ac-titre watfir-wordmark">watfir<span aria-hidden="true">.</span></h1>');
  };

  // Deux éléments séparés : fond WebP local d'un côté, vrais titres HTML de l'autre.
  // Les données réelles de progression et la reprise proviennent toujours d'accueil.js.
  accrocheHtml = function () {
    return '<section class="ac-hero watfir-hero entre-2" aria-label="Bienvenue sur Watfir">' +
      '<div class="ac-hero-image" aria-hidden="true"></div>' +
      '<div class="ac-hero-texte">' +
        '<span class="ac-hero-surtitre">LËTZEBUERGESCH / 001</span>' +
        '<h2>MOIEN<span class="watfir-punctuation">.</span></h2>' +
        '<p>Le luxembourgeois autrement.</p>' +
      '</div></section>';
  };
})();
