# SPEC 59 — Erreurs fréquentes : feedback d’écriture visible après « Valider »

| Champ | Valeur |
|---|---|
| Priorité | **P0 — correction invisible sur mobile** |
| Statut | **Implémentée — recette Android à confirmer** |
| Branche | `v2` |
| Fichiers | `public/index.html`, `public/app.js`, `public/style.css`, `tests/test_session_feedback_visible.js`, `tests/test_session_erreurs_frequentes.js` |
| Compatibilité | SPEC 50 (réponses alternatives), 56 (Valider), 57 (pression CTA), 58 (suppression points V1) |

## Diagnostic

La fonction `validateSessionInput()` enregistre la première réponse avec `recordSessionAnswer()`, puis écrit correctement le texte dans `#session-feedback`. Un test avec les vrais modules `diagnostic.js` et `correction.js` confirme que les cas correct/incorrect produisent un contenu de feedback. Mais `#session-feedback` est inséré **après** `#session-input-wrap` (textarea + bouton), alors que le clavier virtuel reste ouvert : sur Android, la correction peut rester sous le clavier ou hors du viewport. Elle paraît ainsi absente alors que le niveau, les statistiques et le score ont changé.

L’ancien test SPEC 56 vérifiait `innerHTML` et non la position/visibilité du feedback dans l’interface : il n’attrapait donc pas cette régression.

## Règles attendues

1. **Au clic sur Valider**, la réponse produit un message immédiat et visible. Le feedback se place entre l’énoncé et le champ de saisie, pas tout en bas de la zone de session.
2. La réponse correcte affiche « Correct ! » et éventuellement les alternatives acceptées et le point d’attention. Une réponse erronée au premier essai affiche « Pas encore · réessaie » avec l’aide appropriée, sans montrer la bonne réponse. Au second essai (ou en examen), la correction complète s’affiche.
3. Fermer le clavier virtuel par `blur()` après chaque validation non vide puis s’assurer que le feedback est amené dans la zone visible (`scrollIntoView` après mise à jour de la mise en page). Le champ peut être réactivé par l’utilisateur pour son deuxième essai.
4. Après une réponse finale, masquer le champ et « Valider » : seul le feedback et le bouton « Suivante / Voir le score » restent visibles. Ne pas laisser l’ancienne réponse ou le clavier masquer le résultat.
5. Préserver les réponses alternatives (SPEC 50), les **deux essais**, les scores et le comptage des erreurs **sur le premier essai uniquement**, les corrections de quiz/trous et les sessions d’examen ou de révision.
6. Rendre le feedback accessible avec `role="status"`, `aria-live="polite"`, `aria-atomic="true"` ; conserver les couleurs de succès/échec avec leur texte explicite et des cibles tactiles de 48 px.
7. Ne pas ajouter de nouvelle navigation, de vibration, de délai artificiel ou de dépendance. Lors d'une nouvelle question, réinitialiser et cacher le feedback sans conserver son ancien contenu.
8. Aucun changement des données des leçons, des statistiques de maîtrise ou du backend.

## Recette

- [x] Reproduction du placement sous le clavier dans le balisage précédent.
- [x] Feedback déplacé **avant** `#session-input-wrap` et annoncé comme statut accessible.
- [x] Mauvais premier essai : réponse comptabilisée une fois, aide visible, clavier fermé, second essai disponible.
- [x] Bonne réponse / second essai : bouton Suivante visible, saisie masquée, score correctement comptabilisé.
- [x] Clic de validation d’une saisie vide : rien n’est enregistré.
- [x] Sessions Erreurs fréquentes, Révision, Examen et alternatives conservées.
- [x] Tests de structure DOM, de correction et de défilement ; régression des SPEC précédentes.
- [ ] Contrôle tactile Android et clavier Gboard/Samsung après déploiement.

Ne pas marquer « Validée » sans dernier contrôle Android.
