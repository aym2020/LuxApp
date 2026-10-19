# SPEC 61 — Minuscules sur les tuiles, majuscules automatiques dans les cases

**Priorité : P1. Statut : implémentée sur `v2`, validation Android à confirmer.**

Complète les SPEC 11, 21 et 51 ; implémentée dans `public/parcours.js`.

1. Les lettres mélangées, y compris intruses et tuiles anciennement mémorisées, sont **toujours en minuscules sans accents** : `Ä` donne `a`, `É` donne `e`.
2. Quand une lettre est placée dans une case, sa **casse suit la position de la solution** (ex. `m` devient `M` au début de `Moien`). Une mauvaise lettre bénéficie du même traitement et ne révèle pas sa justesse.
3. Les accents restent cachés jusqu'à la validation, la correction ou un indice, conformément à SPEC 51. Le score, les indices, les doublons, le clavier physique et les règles de validation globales ne changent pas.
4. La découverte et la solution finale présentent l'orthographe exacte.

**Tests :** tuiles minuscules, position majuscule, mauvaise lettre, absence de dévoilement d'accent et génération des intruses : vérifiés par `tests/test_specs_61_62.js`. Recette tactile Android et clavier externe encore à faire.

Ne pas marquer « Validée » avant recette Android.
