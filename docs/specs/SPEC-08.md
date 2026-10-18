# SPEC 08 — Clarification du vocabulaire « + »

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `parcours.js, mission.js` |

> **Traçabilité :** Synthèse reconstruite à partir des demandes initiales et du fonctionnement v2 ; vérifier le détail historique avant évolution.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Expliquer qu'un chip `+N mots · S'entraîner` lance réellement des exercices bonus.
- Conserver un accès distinct « Voir les N mots supplémentaires » pour consulter le vocabulaire sans jouer.
- Compter les mots depuis les flashcards `plus: true`, sans inventer de questions ni changer la complétion.

## Critères d'acceptation

- [ ] Un utilisateur distingue consulter et s'entraîner.
- [ ] Le clic sur bonus conserve la navigation et les acquis du fil principal.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
