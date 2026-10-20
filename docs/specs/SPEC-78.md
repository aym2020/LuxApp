# SPEC 78 — Salutations alternatives : Salut! / Hallo!

| Champ | Décision |
|---|---|
| Priorité | P1 — éviter les réponses justes refusées |
| Statut | Implémentée sur `v2` — recette Android à confirmer |
| Leçon | A1.1, leçon 1, unité 1 : Saluer |
| Dépendances | SPEC 50 (alternatives contextualisées), SPEC 75 (cours unifié) |

## Problème

Deux entrées consécutives « Salut! » et « Hallo! » avec le même français « Salut ! » laissent penser qu'il faut mémoriser deux notions distinctes. Pourtant l'exercice d'écriture « Salut ! » rejetait `Hallo!`.

## Contrat pédagogique

- **Salut!** : réponse principale pour dire bonjour de manière informelle.
- **Hallo!** : alternative également correcte pour cette même consigne de salutation.
- Cette paire ne devient pas une équivalence globale : le LOD distingue aussi un emploi de `salut` pour **prendre congé**, emploi où `Hallo!` ne convient pas.
- Conserver les prénoms **Pierre** et **Jean** à l'identique dans les alternatives.
- Laisser les consignes « Bonjour ! », « Au revoir ! » et les trous sans autre sens inchangés.

## Changements

- `data/lecons/A1.1/lecon-01.json` : `ecriture` 2008, 2009, 2010 ont respectivement `alternatives: ["Hallo!"]`, `["Hallo Pierre!"]`, `["Hallo Jean!"]`.
- Lexique : une seule ligne « Salut! » avec la note « Variante : Hallo! » ; la ligne « Hallo! » redondante est retirée de cette liste. La carte facultative et le quiz « Hallo! » sont conservés pour la reconnaissance, et les notes des flashcards précisent l'usage.
- Phrases : exemple « Salut Pierre! », note « Variante : Hallo Pierre! ». Le renderer garde le bouton audio de Salut! uniquement s'il existe un audio vérifié.
- Aucun changement des fonctions de correction : le champ `alternatives` est déjà utilisé dans l'écriture des unités, l'ancienne écriture et les révisions (SPEC 50). Aucun changement des missions ni des IDs.

## Vérification

`node tests/test_reponses_alternatives.js` : doit contrôler les 3 exercices, les formes principales et alternatives, les scores du premier essai, les noms propres inchangés, et le refus d'une alternative utilisée pour « Au revoir ! ».

`node tests/test_spec75.js` : contrôle qu'une seule entrée de vocabulaire couvre les deux salutations et que la variante apparaît dans le cours.

Source : [LOD, « salut »](https://lod.lu/artikel/SALUT2) ; pour `Hallo!`, usage informel également indiqué par des supports de cours luxembourgeois.

Recette Android : écrire Hallo! au lieu de Salut!, observer le succès et l'autre formulation acceptée.
