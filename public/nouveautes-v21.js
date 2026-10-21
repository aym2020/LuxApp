'use strict';
// Actualités de la branche 2.1 : sélection éditoriale appuyée sur les commits.
// Ce contenu est local et fonctionne hors réseau. Pas de dépendance à GitHub.
const LUXAPP_VERSION_21 = '2.1';
const LUXAPP_NOUVEAUTES_21 = [
  {categorie:'ACCUEIL',titre:'L’essentiel, dès l’ouverture',
   description:'Un accueil plus calme : progression et série au même endroit, une action Continuer qui donne le cap.',
   apercu:'accueil',commit:'b73432262'},
  {categorie:'CHEMIN',titre:'Un parcours plus lisible',
   description:'Une ligne d’apprentissage, des unités mieux hiérarchisées et moins d’actions qui se concurrencent.',
   apercu:'chemin',commit:'071948ba2'},
  {categorie:'LEÇONS',titre:'Apprendre sans surcharge',
   description:'Une règle à lire sur le fond noir, les points d’attention signalés par un filet, le bouton Commencer toujours disponible.',
   apercu:'lecons',commit:'3effc6466'},
  {categorie:'COURS',titre:'Une référence toujours à portée de main',
   description:'Règles, lexique et phrases dans une lecture épurée, avec les unités accessibles et le retour à l’exercice toujours visible.',
   apercu:'cours',commit:'22fc0b201'},
  {categorie:'MISSIONS',titre:'La langue prend vie',
   description:'Une mise en situation plus immersive et un scénario épuré : répliques, traductions, audio et bouton Jouer toujours accessible.',
   apercu:'missions',commit:'a181db13f'},
  {categorie:'ENTRAÎNEMENT',titre:'S’exercer à son rythme',
   description:'Un accès clair aux exercices libres avec choix des leçons, des niveaux, du nombre de questions et du type de pratique.',
   apercu:'revision',commit:'9e36825df'},
  {categorie:'CONFORT',titre:'Moins de friction au quotidien',
   description:'Espacements mobiles revus, navigation plus cohérente et corrections des états visuels et du défilement.',
   apercu:'confort',commit:'228d7f6e2'}
];

function apercuNouveaute21(type) {
  switch(type) {
    case 'accueil':
      return '<div class="nv21-mini-home"><div class="nv21-mini-word">Moien<span>!</span></div>' +
        '<div class="nv21-mini-stats"><span>PROGRESSION <i class="nv21-mini-track"><i></i></i></span>' +
        '<span>SÉRIE <b>✦</b></span></div><div class="nv21-mini-main">Continuer <span>→</span></div></div>';
    case 'chemin':
      return '<div class="nv21-mini-path"><span class="fait">✓</span><i></i><span class="actif">●</span>' +
        '<i></i><span class="futur">○</span><p>Terminé <b>·</b> En cours <b>·</b> À découvrir</p></div>';
    case 'lecons':
      return '<div class="nv21-mini-rule"><span>LA RÈGLE</span><strong>Objets + <em>ass</em> + adjectif</strong>' +
        '<p>ATTENTION <small>Une précision utile, sans grosse carte.</small></p></div>';
    case 'cours':
      return '<div class="nv21-mini-course"><div class="nv21-mini-course-tabs"><b>Règles</b><span>Lexique</span><span>Phrases</span></div>' +
        '<small>UNITÉ 1</small><p>Une langue reste <em>invariable</em>.</p><div>Revenir à l’exercice</div></div>';
    case 'missions':
      return '<div class="nv21-mini-dialog"><div><small>L’EMPLOYÉE</small><b>Moien!</b></div>' +
        '<div><small>TOI</small><b>Gudde Moien!</b></div><span>Jouer la mission →</span></div>';
    case 'revision':
      return '<div class="nv21-mini-practice"><span>10</span><span class="actif">20</span><span>50</span><span>Tout</span>' +
        '<p>Quiz &nbsp; · &nbsp; À trou &nbsp; · &nbsp; Écriture</p></div>';
    default:
      return '<div class="nv21-mini-comfort"><span>←</span><span>Une navigation plus fluide</span>' +
        '<span>✓</span></div>';
  }
}

function ouvrirNouveautes() {
  const contenus = LUXAPP_NOUVEAUTES_21.map((info, i) =>
    '<section class="nv21-feature">' +
      '<div class="nv21-index">' + String(i + 1).padStart(2,'0') + ' <span>／ ' + info.categorie + '</span></div>' +
      '<h3>' + info.titre + '</h3>' +
      '<p>' + info.description + '</p>' +
      '<div class="nv21-preview" aria-label="Aperçu simplifié : ' + info.categorie + '">' + apercuNouveaute21(info.apercu) + '</div>' +
      '<a class="nv21-source" href="https://github.com/aym2020/LuxApp/commit/' + info.commit +
      '" target="_blank" rel="noopener noreferrer">Voir un commit associé ↗</a>' +
    '</section>'
  ).join('');

  const html =
    '<header class="nv21-top">' +
      '<button type="button" class="nv21-back" onclick="fermerPanneau(); ouvrirPlus()" aria-label="Retour au menu Plus">← <span>Plus</span></button>' +
      '<span class="nv21-top-version">VERSION ' + LUXAPP_VERSION_21 + '</span>' +
    '</header>' +
    '<main class="nv21-scroll">' +
      '<div class="nv21-hero">' +
        '<div class="nv21-overline">LA NOUVELLE VERSION</div>' +
        '<h2>LuxApp <em>' + LUXAPP_VERSION_21 + '</em></h2>' +
        '<p>Moins de bruit. Plus de place pour apprendre.</p>' +
      '</div>' +
      '<div class="nv21-lead">Voici ce qui a changé dans l’application, en un coup d’œil.</div>' +
      contenus +
      '<footer class="nv21-footer">' +
        '<p>Les évolutions marquantes de la branche 2.1, regroupées pour la lecture. Il ne s’agit pas d’une liste exhaustive des commits.</p>' +
        '<a href="https://github.com/aym2020/LuxApp/commits/2.1/" target="_blank" rel="noopener noreferrer">Consulter l’historique complet ↗</a>' +
        '<small>LuxApp · Version ' + LUXAPP_VERSION_21 + '</small>' +
      '</footer>' +
    '</main>';

  // Dimension plein écran appliquée dès le premier rendu, sans bascule
  // entre le panneau standard et la page Nouveautés.
  ouvrirPanneau(html, 'Nouveautés LuxApp ' + LUXAPP_VERSION_21, null, 'nv21-panel');
  const panneau = document.getElementById('panneau');
  if (panneau) {
    panneau.setAttribute('aria-labelledby','nv21-heading');
    // On garde un titre textuel et accessible aux lecteurs d’écran.
    const titre = panneau.querySelector('.nv21-hero h2');
    if (titre) titre.id = 'nv21-heading';
  }
}
