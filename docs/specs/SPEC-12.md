# SPEC 12 — Mission en dialogue interactif compact

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `mission.js, style.css` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Supprimer la grande carte « À toi — écris en luxembourgeois » sous les dialogues ; faire écrire directement dans une bulle « Toi ».
- Ne pas afficher les traductions des personnages par défaut ; garder la consigne française de la seule réplique à produire.
- Conserver un accès « Contexte » volontaire et l'historique des répliques utiles.
- Intégrer la correction à la conversation, sans bascule vers un formulaire séparé.

## Critères d'acceptation

- [ ] Une mission ressemble à une conversation, pas à un questionnaire géant.
- [ ] Le clavier reste fermé jusqu'à la saisie explicite.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
