// ─── VERDICT D'UN CHOIX (SPEC 94) ───────────────────────────────────────────
// Une seule fonction, utilisée par la Leçon (parcours.js) et par S'entraîner,
// Révision et Erreurs (app.js) pour le Quiz et le Texte à trous.
//
// Après la réponse :
//   - juste : il ne reste que la bonne réponse (verte) ;
//   - faux  : il reste le choix fait (rouge, petite secousse) et la bonne
//             réponse (verte). Les autres propositions disparaissent.
// Les lettres A/B/C/D sont figées avant de masquer : la bonne réponse « C »
// reste « C » (sinon le compteur CSS la renumérote en « B »).
//
// Cette fonction ne touche ni au score, ni à la progression, ni aux données,
// et ne joue aucun son : chaque moteur garde ses calculs et joue le son
// (jouerFeedbackSon) au moment de la réponse (SPEC 94).
function afficherVerdictChoix(conteneur, bonne, choisi) {
  if (!conteneur) return;
  const boutons = conteneur.querySelectorAll('.choice');
  boutons.forEach((b, i) => {
    b.dataset.lettre = String.fromCharCode(65 + i); // 65 = « A »
    b.disabled = true;
    if (b.textContent === bonne) {
      b.classList.add('correct');
    } else if (b === choisi) {
      b.classList.add('wrong', 'secousse');
    } else {
      b.hidden = true;
    }
  });
}
