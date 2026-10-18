# SPEC 13 — Mon chemin : accordéon à leçon unique

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `chemin.js, style.css` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Une seule leçon développée à la fois ; cliquer sur une autre replie la précédente et développe la nouvelle.
- L'utilisateur peut replier toutes les leçons ; l'accordéon ne change pas l'avancement recommandé.
- Le CTA d'une leçon développée agit sur cette même leçon, non sur une recommandation globale différente.
- Conserver l'expansion/scroll lors des allers-retours.

## Critères d'acceptation

- [ ] Changer de leçon n'efface ni progression ni position.
- [ ] Les unités et missions de la carte sélectionnée sont directement accessibles.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
