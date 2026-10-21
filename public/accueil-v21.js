/* LuxApp 2.1 — Accueil V2 validé (maquette HTML).
   Surcouche de présentation uniquement : le moteur dans accueil.js reste inchangé.
   Elle doit être chargée après accueil.js et avant app.js. */
(function () {
  'use strict';

  const enteteOriginal = enteteAccueilHtml;
  const carteOriginale = carteSuiteHtml;
  const renduOriginal = renderAccueil;

  // Conserve logo, roue (et son état de synchronisation), niveaux et auth.
  // Regroupe les niveaux et le lien invité sur UNE ligne comme la maquette.
  enteteAccueilHtml = function () {
    const logo = '<div class="ac-marque">' +
      '<svg class="ac-marque-symbole" viewBox="0 0 40 44" fill="none" aria-hidden="true">' +
      '<path d="M4 40V23h9v17M16 40V14l6-9 7 9v26M31 40V25h5v15M2 40h37M22 2v4M20 21h4M20 30h4M31 18l2-5 3 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg><div><h1 class="ac-titre">LuxApp</h1>' +
      '<span class="ac-marque-sous">Lëtzebuergesch</span></div></div>';
    const original = enteteOriginal();
    const compte = ligneCompteHtml();
    const sansCompte = compte ? original.slice(0, -compte.length) : original;
    const entete = sansCompte.replace('<h1 class="ac-titre">Lëtzebuergesch</h1>', logo);
    const indexNiveaux = entete.indexOf('<div class="puces-niveau entre"');
    if (indexNiveaux === -1) return entete + compte;

    const lienInvite = compte
      ? '<button type="button" class="ac-v21-guest" onclick="ouvrirCompteDepuisAccueil(\'signin\')" ' +
        'aria-label="Mode invité : se connecter">Mode invité <span aria-hidden="true">·</span> <b>Connexion</b></button>'
      : '';
    return entete.slice(0, indexNiveaux) +
      '<div class="ac-v21-controls">' +
        entete.slice(indexNiveaux) + lienInvite +
      '</div>';
  };

  // Hero photographique : l'image (sans texte) reste un asset local WebP.
  accrocheHtml = function (nouveau) {
    if (typeof nouveau !== 'boolean') nouveau = !aDejaPratique();
    const message = nouveau
      ? 'Une nouvelle langue commence ici.'
      : 'Prêt pour quelques minutes de Lëtzebuergesch ?';
    return '<section class="ac-hero entre-2" aria-label="Bienvenue">' +
      '<div class="ac-hero-image" aria-hidden="true"></div>' +
      '<div class="ac-hero-overlay" aria-hidden="true"></div>' +
      '<div class="ac-hero-texte">' +
        '<span class="ac-hero-surtitre">Le luxembourgeois, pas à pas</span>' +
        '<h2>Moien<span class="ac-hero-exclamation">!</span></h2>' +
        '<p>' + message + '</p>' +
      '</div></section>';
  };

  // Bilan éditorial : valeurs réelles, aucune carte, aucune séparation.
  // #serie conserve l'animation de l'objectif du jour.
  chiffresHtml = function () {
    const prog = progressionNiveau(niveauActif);
    const serie = serieActuelle();
    const pct = Math.max(0, Math.min(100, Number(prog.pourcent) || 0));
    const jours = serie === 1 ? 'jour' : 'jours';
    const acquis = prog.anciennes
      ? ' · +' + prog.anciennes + ' acquise' + (prog.anciennes > 1 ? 's' : '') + ' précédemment'
      : '';
    return '<section class="ac-chiffres ac-v21-bilan entre-2" aria-label="Progression et série">' +
      '<div class="ac-v21-bilan-titre">Aujourd’hui</div>' +
      '<div class="ac-v21-bilan-ligne">' +
        '<div class="ac-progress-mesure">' +
          '<div class="ac-v21-bilan-chiffre">' + pct + '<span class="ac-v21-bilan-unite"> %</span></div>' +
          '<span class="ac-v21-bilan-legende">Progression ' + escHtml(niveauActif) + '</span>' +
          '<div class="ac-piste" role="progressbar" aria-label="Progression ' + escHtml(niveauActif) +
            '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
            '<i style="width:' + pct + '%"></i></div>' +
        '</div>' +
        '<div class="ac-serie-mesure">' +
          '<div id="serie" class="serie ac-v21-bilan-chiffre">' +
            '<span class="ac-v21-bilan-flamme" aria-hidden="true">' + ICONES.flamme + '</span>' +
            '<span class="ac-v21-bilan-nombre">' + serie + '</span>' +
            '<span class="ac-v21-bilan-unite"> ' + jours + '</span>' +
          '</div>' +
          '<span class="ac-v21-bilan-legende">Série actuelle</span>' +
        '</div>' +
      '</div>' +
      '<p class="ac-lecons-faites">' + prog.terminees + ' / ' + prog.nbLecons +
        ' leçons terminées' + acquis + '</p>' +
    '</section>';
  };

  // Le moteur v2 choisit toujours les vraies cibles et les vrais libellés.
  // Seule la présentation du bouton est simplifiée.
  carteSuiteHtml = function (pas, nouveau) {
    let html = carteOriginale(pas, nouveau).replace(
      'class="carte-suite', 'class="carte-suite ac-v21-cta'
    );
    if (!pas) return html; // niveau terminé, action inchangée
    html = html.replace('<span class="cs-txt">',
      '<span class="cs-ic">' + ICONES.livre + '</span><span class="cs-txt">');
    html = html.replace('<span class="cs-lecon">LEÇON ' + numLecon(pas.lecon) + '</span>', '');
    html = html.replace('<span class="cs-titre">',
      '<span class="cs-titre">Leçon ' + numLecon(pas.lecon) + ' · ');
    return html;
  };

  // SPEC 88 : 4 raccourcis sur la même rangée, sans agrandir l'accueil.
  accesHtml = function (rev) {
    return '<div class="ac-v21-actions">' +
      '<nav class="ac-acces entre-3" aria-label="Accès rapides">' +
        boutonAcces('rev', ICONES.revision, "S'entraîner", '', 'openReviewSetup()') +
        boutonAcces('exa', ICONES.toque, 'Examens', '', 'openExamens()') +
        boutonAcces('err', ICONES.cible, 'Erreurs', '', "startSession('errors')").replace(
          'class="ac-btn err"', 'class="ac-btn err" aria-label="Erreurs fréquentes"'
        ) +
        boutonAcces('jeux', '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M7 9h10a4 4 0 0 1 3.8 3l1.1 4a2.5 2.5 0 0 1-4 2.5l-2.1-1.8H8.2l-2.1 1.8A2.5 2.5 0 0 1 2.2 16l1-4A4 4 0 0 1 7 9Z"/>' +
          '<path d="M8 11v5m-2.5-2.5h5M16.5 12.5h.01m2 2h.01"/>' +
          '</svg>', 'Jeux', '', 'ouvrirJeux()') +
      '</nav>' +
      '<button type="button" class="ac-btn lecons ac-v21-journey" onclick="goLessons()">' +
        ICONES.livre + '<b>Voir mon chemin</b>' + ICONES.suite +
      '</button>' +
    '</div>';
  };

  // Le comportement d'origine (plan du jour, synchro, animation) reste la source de vérité.
  // L'original insère le hero des primo-utilisateurs ; on l'insère aussi pour les actifs.
  renderAccueil = function (animer) {
    renduOriginal(animer);
    if (!aDejaPratique()) return;
    const box = document.getElementById('accueil');
    const statistiques = box && box.querySelector('.ac-chiffres');
    if (statistiques) statistiques.insertAdjacentHTML('beforebegin', accrocheHtml(false));
  };
})();
