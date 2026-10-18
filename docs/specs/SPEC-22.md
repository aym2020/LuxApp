# SPEC 22 — Progression principale séparée de l'entraînement libre

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `revision.js, chemin.js, parcours.js, cloud.js, accueil.js` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Rejouer une unité déjà validée ne change pas la prochaine unité pédagogique recommandée.
- Conserver séparément une session principale et une session libre, chacune reprenable, avec migration des anciennes sauvegardes.
- Le bouton « Continuer » privilégie une activité principale inachevée ou la prochaine unité non terminée ; la répétition dispose d'un « Reprendre la révision » secondaire.
- Le score historique ne diminue jamais et les sauvegardes ne s'écrasent pas entre elles.

## Critères d'acceptation

- [ ] Après unités 1 et 2 terminées, rejouer puis interrompre unité 1 ne détourne pas « Continuer » de l'unité 3.
- [ ] Le cloud fusionne indépendamment les sessions principales et libres.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
