# SPEC 04 — Navigation douce entre unités

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `parcours.js, chemin.js, style.css` |

> **Traçabilité :** Synthèse reconstruite à partir des demandes initiales et du fonctionnement v2 ; vérifier le détail historique avant évolution.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- À la fin d'une unité, proposer la suivante explicitement, sans imposer de scroll-snap.
- Afficher son introduction pédagogique et permettre de lancer les exercices volontairement.
- Utiliser le défilement doux uniquement après une action explicite et respecter la réduction des animations.

## Critères d'acceptation

- [ ] Le passage d'une unité à l'autre conserve la liberté de revenir en arrière.
- [ ] Aucun défilement automatique permanent ni contenu tronqué.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
