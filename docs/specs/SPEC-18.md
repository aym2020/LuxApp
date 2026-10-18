# SPEC 18 — Découverte sans engagement et retours préservés

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `mission.js, navigation.js, chemin.js, progress.js` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

> **Précision de navigation :** la [SPEC 38](./SPEC-38.md) conserve le retour à l'introduction tant que l'utilisateur ne fait qu'explorer, mais supprime cette destination périmée après confirmation ou lancement effectif des exercices.

## Exigences

- « Voir les unités » et « Tente ta chance » depuis l'introduction n'enregistrent pas à eux seuls un apprentissage commencé.
- Conserver l'introduction dans l'historique : y revenir après l'exploration des unités ou de la mission.
- Séparer ouverture, confirmation explicite et activité réellement commencée.
- Ne passer de « Découvrir » à « Commencer » qu'en fonction de l'état pédagogique attendu, pas d'une consultation.

## Critères d'acceptation

- [ ] Chemin → Découvrir → Voir les unités → Retour revient à Découvrir.
- [ ] Une exploration abandonnée ne détourne pas la progression.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
