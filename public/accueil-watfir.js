/* Watfir 2.2 — habillage de l'accueil uniquement, chargé APRÈS accueil-v21.js.
   Les fonctions de calcul, les destinations, la sauvegarde et les jeux restent en 2.1. */
(function () {
  'use strict';
  const renduV21 = renderAccueil;
  const bilanV21 = chiffresHtml;

  function familleNiveau(n) { return String(n).split('.')[0]; }
  function niveauxFamille() {
    const niveaux = niveauxDisponibles();
    const famille = familleNiveau(niveauActif);
    const proches = niveaux.filter(n => familleNiveau(n) === famille);
    if (proches.length <= 2) return proches;
    const index = Math.max(0, proches.indexOf(niveauActif));
    return proches.slice(Math.min(index, proches.length - 2), Math.min(index, proches.length - 2) + 2);
  }

  // Maquette V4 : une seule ligne — marque, niveaux, séparateur, compte invité, réglages.
  enteteAccueilHtml = function () {
    const sync = etatSynchro();
    const compteInvite = !!ligneCompteHtml();
    const boutons = niveauxFamille().map(n =>
      '<button type="button" class="puce-niv wf-niveau-btn" data-wf-niveau="' + escHtml(n) +
      '" aria-pressed="' + (n === niveauActif) + '">' + escHtml(n) + '</button>'
    ).join('');
    return '<div class="ac-ent wf-entete entre">' +
      '<div class="ac-marque">' +
        '<img class="ac-marque-symbole" src="art/watfir-logo-v4.svg?v=1" alt="" width="96" height="100">' +
        '<div class="wf-marque-texte"><h1 class="ac-titre">Watfir</h1><span class="ac-marque-sous">Lëtzebuergesch</span></div>' +
      '</div>' +
      '<div class="puces-niveau" role="group" aria-label="Niveau actif">' +
        boutons +
        '<button type="button" class="puce-niv wf-niveau-ouvrir" aria-label="Choisir un niveau" ' +
          'aria-haspopup="dialog" aria-expanded="false">' + ICONES.chevron + '</button>' +
      '</div>' +
      (compteInvite
        ? '<span class="wf-entete-sep" aria-hidden="true"></span>' +
          '<button type="button" class="ac-v21-guest" onclick="ouvrirCompteDepuisAccueil(\'signin\')" ' +
          'aria-label="Mode invité : se connecter"><span class="wf-invite-mode">Mode invité ·</span>' +
          '<b>Connexion</b></button>'
        : '') +
      '<button type="button" class="ac-menu" aria-label="' + escHtml(libelleMenuSynchro(sync)) +
        '" onclick="ouvrirPlus()">' + ICONES.reglages +
        '<span class="ac-sync-slot" aria-hidden="true">' + pastilleSynchroHtml(sync) + '</span></button>' +
    '</div>';
  };

  accrocheHtml = function (nouveau) {
    if (typeof nouveau !== 'boolean') nouveau = !aDejaPratique();
    const phrase = nouveau
      ? 'Une nouvelle langue commence ici.'
      : 'Prêt pour quelques minutes de Lëtzebuergesch ?';
    // Le dessin suit le texte dans le flux : il remonte dessous par une marge négative (CSS).
    return '<section class="ac-hero entre-2" aria-label="Bienvenue">' +
      '<div class="ac-hero-texte">' +
        '<span class="ac-hero-surtitre">Le luxembourgeois, pas à pas</span>' +
        '<h2>Moien<span class="ac-hero-exclamation">!</span></h2>' +
        '<p>' + phrase + '</p>' +
      '</div>' +
      '<img class="wf-hero-art" src="art/watfir-hero-v4.svg?v=1" alt="" aria-hidden="true" width="864" height="265">' +
    '</section>';
  };

  // Maquette : « 6% » sans espace avant le signe.
  chiffresHtml = function () {
    return bilanV21().replace('Aujourd’hui', 'Ta progression')
      .replace('<span class="ac-v21-bilan-unite"> %</span>', '<span class="ac-v21-bilan-unite">%</span>');
  };

  // V21 calcule les mêmes vrais KPI et le même prochain pas.
  // On place toujours le hero AVANT le bilan et on montre le bilan aux nouveaux.
  renderAccueil = function (animer) {
    renduV21(animer);
    const box = document.getElementById('accueil');
    if (!box) return;
    box.classList.add('wf-accueil');
    const hero = box.querySelector('.ac-hero');
    if (!hero) return;
    let bilan = box.querySelector('.ac-chiffres');
    if (!bilan) {
      hero.insertAdjacentHTML('afterend', chiffresHtml());
      bilan = box.querySelector('.ac-chiffres');
    } else if (hero.nextElementSibling !== bilan) {
      hero.after(bilan);
    }
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
  }

  // Délégation : renderAccueil() reconstruit le DOM après chaque changement de niveau.
  document.addEventListener('click', function (event) {
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