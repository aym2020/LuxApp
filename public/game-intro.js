/* SPEC 116 — écran de présentation commun des mini-jeux.
   UN SEUL ENDROIT pour les contenus : le registre JEUX_PRESENTATIONS (titre, accroche,
   image, détails, boutons). La mise en page est produite par renderGameIntro() et
   dessinée par game-intro.css. Aucune règle de jeu ici : un bouton n'appelle que la
   fonction déclarée dans « action ». Lux Runner rejoindra ce registre au lot 1
   (aujourd'hui il sert d'étalon de géométrie). */
'use strict';

const JEUX_PRESENTATIONS = {
  redflag: {
    marque: 'RED FLAG',
    retour: 'ldQuitter',
    kicker: 'TON PROCHAIN DATE',
    titre: 'Red Flag', ponctuation: '.',
    accroche: 'Tu incarnes une femme qui cherche un date sur Cringr. Discute, trouve des preuves et démasque les mensonges.',
    visuel: {
      type: 'image', src: 'art/jeux/redflag-presentation.webp?v=1', largeur: 1254, hauteur: 1000,
      alt: 'Une jeune femme au regard dubitatif, assise le soir à une table avec une tasse et son téléphone.',
      cadrage: 'center 40%'
    },
    details: {
      type: 'etapes',
      items: [
        { picto: 'coeur', verbe: 'Choisis', suite: 'un profil' },
        { picto: 'bulle', verbe: 'Discute', suite: 'en LU' },
        { picto: 'loupe', verbe: 'Démasque', suite: 'les mensonges' }
      ]
    },
    actions: [{ role: 'primaire', libelle: 'Commencer', action: 'ldAccueilCommencer' }]
  }
};

// Pictogrammes pixel 8×8 des étapes (décoratifs).
const GAME_INTRO_PICTOS = {
  coeur: '<path d="M1 1h2v1h1V1h2v1h1v2H6v1H5v1H4v1H3V6H2V5H1V4H0V2h1z"/>',
  bulle: '<path d="M1 0h6v1h1v4H7v1H3v1H2v1H1V6H0V1h1zM2 2v1h1V2zm2 0v1h1V2z" fill-rule="evenodd"/>',
  loupe: '<path d="M2 0h3v1h1v1h1v3H6v1h1v1h1v1H7V7H6V6H5v1H2V6H1V5H0V2h1V1h1zm0 2v3h3V2z" fill-rule="evenodd"/>'
};
// Tailles portées par le SVG lui-même : le composant reste identique dans toutes les vues
// (certaines vues de jeu imposent une taille générique à leurs svg).
const GAME_INTRO_FLECHE = '<svg style="width:18px;height:18px;flex:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
// Même flèche que runnerIcone('retour') de Lux Runner.
const GAME_INTRO_RETOUR = '<svg style="width:20px;height:20px;flex:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 5-7 7 7 7M7 12h13"/></svg>';

function gameIntroEchapper(t) {
  return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Contenu d'un jeu, variante éventuelle appliquée champ par champ.
function gameIntroContenu(id, variante) {
  const base = JEUX_PRESENTATIONS[id];
  if (!base) return null;
  const surcharge = variante && base.variantes && base.variantes[variante];
  return Object.assign({}, base, surcharge || {});
}
// « nomDeFonction(args) » pour un onclick : seulement des noms simples déclarés dans le registre.
function gameIntroAppel(action, args) {
  if (!/^[A-Za-z_$][\w$]*$/.test(action || '')) return '';
  return action + '(' + (args || []).map(a => gameIntroEchapper(JSON.stringify(a))).join(',') + ')';
}
function gameIntroVisuel(v) {
  if (!v) return '';
  if (v.type === 'image') {
    return '<figure class="game-intro-visuel game-intro-visuel-image" style="--gi-ratio:' + v.largeur + '/' + v.hauteur +
      ';--gi-cadrage:' + gameIntroEchapper(v.cadrage || 'center') + '">' +
      '<img src="' + gameIntroEchapper(v.src) + '" width="' + v.largeur + '" height="' + v.hauteur + '" alt="' + gameIntroEchapper(v.alt) +
      '" decoding="async" onerror="this.parentNode.classList.add(\'game-intro-visuel-vide\')"></figure>';
  }
  if (v.type === 'html' && typeof window[v.rendu] === 'function') return '<div class="game-intro-visuel" aria-hidden="true">' + window[v.rendu]() + '</div>';
  return '';
}
function gameIntroDetails(d) {
  if (!d) return '';
  if (d.type === 'etapes') {
    return '<ol class="game-intro-details game-intro-etapes" aria-label="Comment jouer">' + d.items.map(e =>
      '<li><span class="game-intro-picto" aria-hidden="true"><svg style="width:14px;height:14px;flex:none" viewBox="0 0 8 8" fill="currentColor">' + (GAME_INTRO_PICTOS[e.picto] || '') + '</svg></span>' +
      '<b>' + gameIntroEchapper(e.verbe) + '</b><span>' + gameIntroEchapper(e.suite) + '</span></li>').join('') + '</ol>';
  }
  if (d.type === 'regles') {
    return '<div class="game-intro-details"><ol class="game-intro-regles">' + d.items.map(r => '<li>' + gameIntroEchapper(r) + '</li>').join('') + '</ol>' +
      (d.note ? '<p class="game-intro-note">' + gameIntroEchapper(d.note) + '</p>' : '') + '</div>';
  }
  if (d.type === 'fonction' && typeof window[d.rendu] === 'function') return '<div class="game-intro-details">' + window[d.rendu]() + '</div>';
  return '';
}
function gameIntroBouton(a) {
  const classe = a.role === 'primaire' ? 'game-intro-primaire' : a.role === 'secondaire' ? 'game-intro-secondaire' : 'game-intro-lien';
  return '<button type="button" class="' + classe + '" onclick="' + gameIntroAppel(a.action, a.args) + '">' +
    gameIntroEchapper(a.libelle) + (a.role === 'primaire' ? ' ' + GAME_INTRO_FLECHE : '') + '</button>';
}
// Même DOM pour tous les jeux : header, main (zones facultatives absentes sans hauteur), actions hors de main.
function renderGameIntro(id, options) {
  const c = gameIntroContenu(id, options && options.variante);
  if (!c) return '';
  return '<div class="game-intro" data-jeu="' + gameIntroEchapper(id) + '">' +
    '<div class="game-intro-header"><button type="button" class="game-intro-retour" onclick="' + gameIntroAppel(c.retour) + '">' +
      GAME_INTRO_RETOUR + ' Jeux</button><span class="game-intro-marque">' + gameIntroEchapper(c.marque) + '</span></div>' +
    '<main class="game-intro-main">' +
      (c.kicker ? '<span class="game-intro-kicker">' + gameIntroEchapper(c.kicker) + '</span>' : '') +
      '<h1 class="game-intro-titre">' + gameIntroEchapper(c.titre) + (c.ponctuation ? '<span>' + gameIntroEchapper(c.ponctuation) + '</span>' : '') + '</h1>' +
      (c.accroche ? '<p class="game-intro-accroche">' + gameIntroEchapper(c.accroche) + '</p>' : '') +
      gameIntroVisuel(c.visuel) +
      gameIntroDetails(c.details) +
    '</main>' +
    '<div class="game-intro-actions">' + (c.actions || []).map(gameIntroBouton).join('') + '</div>' +
  '</div>';
}
if (typeof module !== 'undefined') module.exports = { JEUX_PRESENTATIONS, renderGameIntro, gameIntroContenu };
