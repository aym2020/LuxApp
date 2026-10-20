/* LuxApp 2.1 — Étape 1 : présentation de l'accueil.
   Chargé après accueil.js et avant app.js ; aucune logique pédagogique modifiée. */
(function () {
  'use strict';

  const enteteAvant = enteteAccueilHtml;
  const carteAvant = carteSuiteHtml;
  const renduAvant = renderAccueil;

  // Conserve le menu de synchronisation, les niveaux et les liens de compte.
  enteteAccueilHtml = function () {
    const logo = '<div class="ac-marque">' +
      '<svg class="ac-marque-symbole" viewBox="0 0 40 40" fill="none" aria-hidden="true">' +
      '<path d="M5 34V17h7v17M13 34V11l4-4 4 4v23M22 34V21h5v13M28 34V14l4-7 4 7v20M3 34h35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M17 3v4M32 3v4M16 16h2M31 19h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '</svg><div><h1 class="ac-titre">LuxApp</h1>' +
      '<span class="ac-marque-sous">Lëtzebuergesch</span></div></div>';
    return enteteAvant().replace('<h1 class="ac-titre">Lëtzebuergesch</h1>', logo);
  };

  // La même accroche humaine pour débuter ou reprendre, sans prétendre connaître le prénom.
  accrocheHtml = function (nouveau) {
    // accueil.js appelle cette fonction sans argument pour une première visite.
    if (typeof nouveau !== 'boolean') nouveau = !aDejaPratique();
    const message = nouveau
      ? 'Prêt à découvrir le luxembourgeois ?'
      : 'Prêt pour quelques minutes de Lëtzebuergesch ?';
    return '<section class="ac-hero entre-2" aria-label="Bienvenue">' +
      '<div class="ac-hero-texte">' +
      '<span class="ac-hero-surtitre">DE FRANÇAIS À LËTZEBUERGESCH</span>' +
      '<h2>Moien<span class="ac-hero-exclamation">!</span></h2>' +
      '<p>' + message + '</p></div>' +
      '<div class="ac-hero-image" aria-hidden="true"></div></section>';
  };

  // Valeurs existantes : progression du niveau, série du jour, leçons terminées.
  chiffresHtml = function () {
    const prog = progressionNiveau(niveauActif);
    const serie = serieActuelle();
    const pct = Math.max(0, Math.min(100, Number(prog.pourcent) || 0));
    const acquis = prog.anciennes
      ? ' · +' + prog.anciennes + ' acquise' + (prog.anciennes > 1 ? 's' : '') + ' précédemment'
      : '';
    return '<section class="ac-chiffres entre-2" aria-label="Ma progression">' +
      '<div class="ac-progress-mesure"><div class="ac-stat-principale">' +
      '<b>' + pct + ' %</b><span>de progression</span></div>' +
      '<div class="ac-piste" role="progressbar" aria-label="Progression ' +
      escHtml(niveauActif) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
      pct + '"><i style="width:' + pct + '%"></i></div></div>' +
      '<div class="ac-serie-mesure"><b id="serie" class="serie">' +
      ICONES.flamme + serie + '</b><span>jour' + (serie > 1 ? 's' : '') +
      ' de série</span></div>' +
      '<p class="ac-lecons-faites">' + prog.terminees + ' / ' + prog.nbLecons +
      ' leçons terminées' + acquis + '</p></section>';
  };

  // La carte existante décide toujours du prochain pas, de la reprise et du niveau terminé.
  carteSuiteHtml = function (pas, nouveau) {
    return carteAvant(pas, nouveau).replace(
      'class="carte-suite', 'class="carte-suite ac-v21-cta'
    );
  };

  // Conserve les quatre actions ; les trois actions secondaires deviennent des tuiles.
  accesHtml = function (rev) {
    return '<nav class="ac-acces entre-3" aria-label="Accès directs">' +
      boutonAcces('rev', ICONES.revision, 'Réviser', infoRevision(rev), 'lancerRevision()') +
      boutonAcces('exa', ICONES.toque, 'Examens', '', 'openExamens()') +
      boutonAcces('err', ICONES.cible, 'Erreurs', '', "startSession('errors')").replace(
        'class="ac-btn err"', 'class="ac-btn err" aria-label="Erreurs fréquentes"'
      ) +
      boutonAcces('lecons', ICONES.livre, 'Mon chemin', '', 'goLessons()') +
      '</nav>';
  };

  // Le moteur v2 gère toujours les états et la synchronisation. On insère seulement
  // le hero des utilisateurs actifs (les nouveaux possèdent déjà leur accroche).
  renderAccueil = function (animer) {
    renduAvant(animer);
    if (!aDejaPratique()) return;
    const box = document.getElementById('accueil');
    const statistiques = box && box.querySelector('.ac-chiffres');
    if (statistiques) statistiques.insertAdjacentHTML('beforebegin', accrocheHtml(false));
  };
})();
