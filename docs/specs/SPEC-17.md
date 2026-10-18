# SPEC 17 — Lisibilité et réduction des troncatures

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `chemin.js, style.css` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Leçons repliées : jusqu'à deux lignes avec ellipsis exceptionnel en fin de deuxième ligne.
- Leçons développées : aucun intitulé pédagogique tronqué ; remplacer « Unité 1 » par « 1 » dans les lignes d'unité.
- Le CTA jaune utilise un verbe court : Découvrir, Commencer, Continuer, Reprendre, Revoir.
- Réduire la répétition et les décorations avant de réduire l'information.

## Critères d'acceptation

- [ ] Les titres des unités, missions et bilans restent lisibles sans accumulation de « … ».
- [ ] Le bouton agit sur la même destination qu'avant.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
