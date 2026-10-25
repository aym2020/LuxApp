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
// Cette fonction ne touche ni au score, ni à la progression, ni aux données :
// chaque moteur garde ses propres calculs.
function afficherVerdictChoix(conteneur, bonne, choisi, ok) {
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
  jouerSonVerdict(ok);
}

// Son bref : montant si juste, descendant si faux. Il suit le réglage Son
// déjà utilisé par Survie et le Mot caché. Facultatif : sans son, rien ne casse.
function jouerSonVerdict(ok) {
  if (typeof SurvieFx === 'undefined' || typeof SurvieFx.verdict !== 'function') return;
  try { SurvieFx.verdict(ok); } catch (_) { /* le son est un bonus */ }
}
