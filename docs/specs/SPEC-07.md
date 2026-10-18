# SPEC 07 — Gestion robuste du clavier mobile

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `ui.js, parcours.js, mission.js, style.css` |

> **Traçabilité :** Synthèse reconstruite à partir des demandes initiales et du fonctionnement v2 ; vérifier le détail historique avant évolution.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Préserver la consigne, la saisie et le bouton de validation lorsque le clavier s'ouvre.
- Ne pas forcer de focus ni de `scrollIntoView` à chaque changement de question.
- Utiliser `visualViewport` de manière cohérente, éviter les doubles scrolls et préserver la saisie lorsque le clavier se ferme.
- Conserver Entrée, la ponctuation et les caractères du luxembourgeois.

## Critères d'acceptation

- [ ] Brave/Chrome Android et Safari iOS ne masquent aucun contrôle critique.
- [ ] Le changement d'orientation ne renvoie pas au début de l'exercice.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
