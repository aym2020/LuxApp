# SPEC 56 — Valider une réponse dans « Erreurs fréquentes » ne doit plus bloquer

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — recette Android à confirmer** |
| Priorité | **P0 — bouton de validation bloqué** |
| Branche | `v2` |
| Fichiers | `public/app.js`, `tests/test_session_erreurs_frequentes.js`, registre des specs |
| Compatibilité | Sessions de révision, examens, erreurs fréquentes et sessions configurées ; SPEC 50 (alternatives d'écriture) |

## Bug et reproduction

Depuis l'accueil, le bouton **Erreurs fréquentes** appelle `startSession('errors')`. Cette fonction crée `session` sans propriété `options`. Au premier clic de réponse sur une carte à choix, ou au premier clic « Valider » sur une carte écrite, `recordSessionAnswer()` exécute `session.options.apresReponse`. L'accès à `apresReponse` sur `undefined` provoque une `TypeError` et bloque la correction.

Reproduction directe avant correctif :

```
TypeError: Cannot read properties of undefined (reading 'apresReponse')
```

L'ancien `startSession('review')` et `startSession('exam')` présente le même risque. Les sessions créées par `demarrerSession` ne reproduisent pas le problème car elles initialisent déjà `options: {}`.

## Correctif attendu

1. Toutes les sessions, y compris via `startSession`, ont toujours un objet `options` (initialement vide) ; ne pas changer la sélection des questions, la navigation ni les écrans.
2. `recordSessionAnswer()` déclenche `apresReponse` **uniquement si c'est une fonction**. L'absence du callback (session classique, vieille session, session de test) n'est pas une erreur.
3. Première réponse à choix : indiquer la correction et avancer normalement. Première erreur écrite : afficher l'aide et autoriser le 2e essai. Deuxième essai : correction et bouton suivant. Réponse correcte au premier essai : bouton suivant immédiat.
4. Les scores et la progression des questions restent mis à jour **une fois par réponse comptabilisée**, sans pénalisation supplémentaire sur le second essai ; les sessions d'examen continuent à ne pas modifier les niveaux.
5. Les callbacks explicites des sessions configurées et des examens spécialisés restent exécutés **exactement une fois**, comme avant.
6. Conserver les règles spécifiques d'orthographe et les alternatives d'écriture (SPEC 50).

## Tests de non-régression

- [x] Reproduction de la `TypeError` initiale et disparition du plantage après correction.
- [x] `startSession('errors')` et les deux autres modes historiques : `options` toujours défini.
- [x] Session « Erreurs fréquentes » : quiz à choix, bonne et mauvaise réponse écrite, 2e essai, score, progression.
- [x] Sessions configurées : callback `apresReponse` préservé et appelé une seule fois.
- [x] Session d'examen : `changeLevel=false`, règles de progression conservées.
- [x] Contrôles ciblés et non-régressions des exercices précédents.
- [ ] Vérification tactile Android sur la version réellement déployée, avec au moins une erreur fréquente enregistrée.

**Ne pas déclarer « Validée » avant une vérification dans l'application mobile.**
