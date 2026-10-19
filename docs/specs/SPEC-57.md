# SPEC 57 — Feedback de pression sur les boutons CTA

| Champ | Valeur |
|---|---|
| Priorité | P2 — finition UX mobile |
| Statut | **Implémentée — recette tactile Android à confirmer** |
| Branche | `v2` |
| Périmètre | `public/design-tokens.css`, `public/components.css`, `public/style.css`, `docs/DESIGN_SYSTEM.md`, `tests/test_cta_pression.js` |
| Compatibilité | SPEC 21/25 (CTA fixe et zones tactiles), 48 (couleurs), 52 (accueil compact), 56 (bouton Valider) |

## 1. Constat

LuxApp présente de nombreux boutons d'action : `Découvrir`, `Commencer`, `Continuer`, `Valider`, `J'ai compris`, `Suivant`, `Envoyer`, `Lancer le bilan`, révisions et examens. Les styles `:active` existants sont hétérogènes : `.pc-btn` rétrécit à 98 %, certaines cartes à 97 %, le bouton d'écriture a seulement un changement d'opacité, et le bouton principal de mission a sa propre animation. Le retour visuel au toucher peut donc sembler absent.

## 2. Comportement attendu

1. **Pression immédiatement visible et maintenue :** tant qu'un CTA activé est maintenu par le doigt ou la souris, le bouton s'enfonce discrètement : échelle **97,5 %**, translation verticale **1 px**, luminosité abaissée et petite ombre intérieure. Tout le **bouton** est animé, texte et icône compris.
2. **Relâchement :** retour rapide à l'état normal en **140 ms** ; aucun état « bloqué », délai artificiel ou animation autonome après le clic. Le clic natif se déclenche normalement, une seule fois. L'appui long reste une pression, **pas** une nouvelle action.
3. **Périmètre ciblé :** composants `.pc-btn` (primaire, neutre, résultat ok/ko), `.btn-jaune`, CTA accueil `.carte-suite` et `.ac-btn`, `.dash-btn.primary`, `.ecr-btn-validate` (Valider classique + session erreurs fréquentes), `.session-action.primary`, `.ms-envoyer`. Les variantes normales, Réviser, Missions, Examens et bandeaux CTA fixes bénéficient des mêmes règles par les composants partagés.
4. **Hors périmètre :** liens purement textuels, cartes de cours, pastilles, icônes Retour/Accueil, réponses de quiz, lettres mélangées, boutons radio, lien « Voir toute la leçon ». Le feedback déjà défini des autres composants n'est pas supprimé.
5. **Bouton désactivé / `aria-disabled="true"` :** pas d'effet de pression, aucun changement du comportement désactivé, de son opacité, ni des évènements de clic.
6. **Accessibilité :** conserver `:focus-visible`, cible tactile et contraste ; pas de vibration, ripple, son ni nouvelle dépendance JavaScript. `prefers-reduced-motion: reduce` supprime toute transformation/déplacement/transition, mais garde un bref feedback statique de luminosité.
7. **Responsive :** 320–430 px, zoom texte et clavier ouvert ; aucun saut de mise en page, car `transform` est purement visuel. Ne pas toucher aux zones `pointer-events` des bandeaux fixes (SPEC 25).
8. **Centralisation :** paramètres communs dans `design-tokens.css`, règles de base `.pc-btn` / `.btn-jaune` dans `components.css`, adaptations aux autres CTA existants dans `style.css`. Ne pas ajouter de gestionnaires d'évènements : les pseudo-classes CSS suffisent.
9. **Ne pas modifier** la progression des leçons, scores, navigation, validation d'écriture ou missions. Ne pas absorber l'erreur du bouton `Valider` (SPEC 56) avec une animation qui masque son état réel.

## Correctif Android — CTA « Reprendre » du Chemin (19 octobre 2026)

Sur une leçon dépliée, la règle `.carte-lecon.ouvre > :not(.carte-tete)` applique l'animation `entre` avec `animation-fill-mode: both`. Comme les keyframes `entre` animent `transform`, leur valeur finale continuait de prendre le dessus sur le `:active` de la SPEC 57 : l'ombre jaune disparaissait, mais le bouton ne rétrécissait pas.

**Correction minimale** dans `public/style.css` : remplacer l'animation d'entrée **du seul bouton** `.carte-lecon.ouvre > .btn-jaune` par `fondu .25s ease-out .06s both` (les keyframes `fondu` ne touchent que `opacity`). Les autres éléments de la carte gardent leur animation d'apparition habituelle. Il n'est pas nécessaire de modifier les tokens, le clic ni le balisage HTML.

**Non-régression** dans `tests/test_cta_pression.js` : vérifier l'animation spécifique du CTA, l'absence de `transform` dans les keyframes et la coexistence avec les règles de pression communes. Validation réelle du maintien au doigt sur Android encore nécessaire.

## 3. Critères de recette

- [x] Inventaire des CTA des leçons, écriture, mission, accueil, Chemin, révision et examens.
- [x] Styles ciblés, même effet de pression sur `.pc-btn`, `.btn-jaune`, l'accueil et `Valider`.
- [x] Le bouton garde le feedback pendant `:active` et revient en 140 ms.
- [x] Aucun effet sur `:disabled`, `aria-disabled="true"` ni les liens ou les icônes exclus.
- [x] `prefers-reduced-motion` : pas de scale/déplacement/transitions.
- [x] Tokens et design system mis à jour ; contrôle automatisé des sélecteurs et de la structure.
- [ ] Vérification tactile en situation réelle sur Android : maintenir, relâcher, annuler en glissant, appuis répétés, bouton Valider et CTA fixe.
- [ ] Comparer visuellement l'accueil et la mission sans modifier les clics et le cadrage.

**Ne pas marquer « Validée » avant la recette sur téléphone.**
