# SPEC 26 — Sens de lecture uniforme des traductions du cours

| Champ | Valeur |
|---|---|
| Statut | **À faire** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `data/lecons/A1.1/, data/lecons/A1.2/, app.js (coursBlocsHtml)` |

> **Traçabilité :** Spécification définie dans la conversation ; non implémentée au moment de la rédaction.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Pour les tableaux de vocabulaire bilingue : luxembourgeois à gauche, français à droite, partout.
- Identifier et inverser les lignes réellement concernées dans les blocs `cours` de type `tableau`, en corrigeant ensemble en-têtes et valeurs.
- Conserver les tableaux grammaticaux qui ont une finalité différente (« Genre / Article / Non », « Sens / Expression » lorsqu'il s'agit réellement d'une grille d'explication et non d'une traduction systématique).
- Ne pas déduire automatiquement la langue des cellules à partir du seul texte des en-têtes ; auditer les leçons A1.1 et A1.2.
- Conserver correspondances, phrases, accents et colonnes complémentaires ; ne pas toucher aux exercices.

## Critères d'acceptation

- [ ] Les tableaux de traduction suivent une convention stable sans casser les exceptions grammaticales.
- [ ] Les paires de traduction restent exactes et lisibles sur mobile.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
