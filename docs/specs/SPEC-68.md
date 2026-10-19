# SPEC 68 — Bouton « Écouter » partout où un mot isolé est présenté

| Champ | Valeur |
|---|---|
| Priorité | P1 — mémorisation et révision |
| Statut | **Implémentée sur `v2` — recette Android à confirmer** |
| Complète | SPEC 66 (sons LOD validés, `public/audio/lod.json`) |
| Fichiers | `public/dialogue.js`, `public/parcours.js`, `public/app.js`, `public/revision.js`, `public/style.css` |

## Exigences

1. Le bouton « Écouter » (son LOD validé) apparaît partout où un mot luxembourgeois isolé est présenté, **y compris s'il a déjà été étudié** :
   - mot caché : découverte, correction « Bien joué ! » et réponse révélée ;
   - révisions / séances : correction d'une question « mot caché » (juste ou fausse) ;
   - lexique : à côté de chaque mot (icône seule) ;
   - cours : tableaux de vocabulaire (icône seule).
2. Recherche du son : mot exact de la carte, sinon forme simplifiée (sans article `de`, `den`, `déi`, `dat`, `e`, `en`, `eng`, `d'`, ni ponctuation). Si deux sons différents partagent la même forme simplifiée (ex. « de Moien » / « Moien! »), aucun son n'est deviné.
3. Jamais de lecture automatique ; une lecture à la fois ; nom accessible « Écouter « mot » » ; cible tactile ≥ 40 px.
4. Pas de bouton pour les expressions de plusieurs mots ni les mots sans son validé.

## Recette

- [x] Lexique A1.1 : 316 boutons ; cours de la leçon 2 : 6 ; mot caché « e Buch » : bouton dans « Bien joué ! » (navigateur local).
- [x] « Moien » seul : aucun son (ambigu entre « le matin » et « bonjour ») ; « Wéi geet et? » : aucun son.
- [ ] Recette Android réelle.
