// ─── BANDEAU DE CORRECTION COMMUN (SPEC 94, lot 2) ─────────────────────────
// Un seul rendu pour toutes les corrections d'exercice :
//   Leçon       : #pc-feedback      (bandeau collé en bas de l'écran)
//   S'entraîner : #session-feedback (dans le flux, sous la question, SPEC 59/87)
// Le DOM et les classes sont les mêmes ; seul l'emplacement (CSS par id) change.
//
// Ce module ne note rien, n'enregistre rien et ne joue aucun son :
// chaque moteur décide du résultat, puis appelle :
//   1. jouerFeedbackSon(evenement)    → une seule fois, au moment de la réponse ;
//   2. renderFeedbackCommun(host, o)  → l'affichage.
//
// Les quatre états :
//   'success'      : réussite (aucun titre « Juste ! » si la réponse verte suffit)
//   'retry'        : erreur provisoire, on peut réessayer (Écriture 1er essai)
//   'finalFailure' : erreur définitive, la correction est montrée
//   'reveal'       : réponse dévoilée à la demande (Mot caché)

// o = {
//   etat      : 'success' | 'retry' | 'finalFailure' | 'reveal',
//   titre     : texte du titre visible, ou '' pour aucun titre,
//   annonce   : phrase lue par le lecteur d'écran (toujours fournie),
//   corpsHtml : explication, audio, score, rappel… déjà échappés par l'appelant,
//   action    : { label, id, classe, onClick } pour un nouveau bouton,
//               ou { bouton } pour réutiliser un bouton existant (Écriture),
//               ou null (aucun bouton dans le bandeau).
// }
// Renvoie le bouton d'action (ou null).
function renderFeedbackCommun(host, o) {
  const succes = o.etat === 'success';
  const titre = o.titre || '';
  const corps = o.corpsHtml || '';

  // Les classes ok / ko / essai restent : d'autres écrans et tests s'en servent.
  host.classList.remove('hidden', 'ok', 'ko', 'essai', 'nu', 'reveal', 'discret');
  host.classList.add('feedback-flat', succes ? 'ok' : 'ko');
  if (o.etat === 'retry') host.classList.add('essai');
  if (o.etat === 'reveal') host.classList.add('reveal');
  // Réussite sans rien à dire : pas de bandeau coloré, seulement le bouton.
  if (succes && !titre && !corps) host.classList.add('nu');

  host.innerHTML =
    '<span class="sr-only">' + escHtml(o.annonce || titre) + '</span>' +
    (titre ? '<div class="fb-titre" aria-hidden="true">' + escHtml(titre) + '</div>' : '') +
    (corps ? '<div class="fb-txt">' + corps + '</div>' : '');

  if (!o.action) return null;
  let bouton = o.action.bouton;
  if (!bouton) {
    bouton = document.createElement('button');
    bouton.type = 'button';
    if (o.action.id) bouton.id = o.action.id;
    if (o.action.classe) bouton.className = o.action.classe;
    bouton.textContent = o.action.label;
    bouton.addEventListener('click', o.action.onClick);
  }
  bouton.classList.add('fb-cta');
  host.appendChild(bouton);
  return bouton;
}

// « Attention : … » : même rendu en Leçon et en S'entraîner.
// texteHtml est déjà prêt à afficher (note des leçons, déjà échappée ou balisée).
function fbAttentionHtml(texteHtml) {
  return texteHtml ? '<div class="fb-attention">Attention : ' + texteHtml + '</div>' : '';
}

// Son de la correction. Il suit le réglage Son de l'app (le même que Survie).
// Facultatif : si le son est impossible, l'exercice continue normalement.
function jouerFeedbackSon(evenement) {
  if (typeof SurvieFx === 'undefined' || typeof SurvieFx.feedback !== 'function') return;
  try { SurvieFx.feedback(evenement); } catch (_) { /* le son est un bonus */ }
}
