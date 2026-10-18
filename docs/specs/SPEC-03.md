# SPEC 03 — Retour sur l'unité quittée

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `parcours.js, app.js, navigation.js` |

> **Traçabilité :** Synthèse reconstruite à partir des demandes initiales et du fonctionnement v2 ; vérifier le détail historique avant évolution.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- La croix d'un exercice doit ramener à l'unité ou à l'activité d'origine, pas en tête de la leçon.
- Mémoriser leçon, unité, mode et contexte d'origine ; restaurer la carte correspondante après rendu du DOM.
- Tenir compte des éléments fixes et annuler les scrolls concurrents ; ne pas confondre la croix et l'icône Accueil.

## Critères d'acceptation

- [ ] Depuis unités 2, 3, bonus, « + » ou mission, le retour cible exactement la carte concernée.
- [ ] Le CTA visé n'est pas masqué par la navigation inférieure.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
