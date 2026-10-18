# SPEC 06 — Harmonisation des exercices d'écriture

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `parcours.js, ui.js` |

> **Traçabilité :** Synthèse reconstruite à partir des demandes initiales et du fonctionnement v2 ; vérifier le détail historique avant évolution.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Supprimer le `focus()` automatique qui ouvre le clavier à chaque nouvelle question de Mot caché et Écriture.
- Réutiliser le `showFeedback()` existant plutôt que réécrire un second composant ; fermer le clavier avant correction.
- Ne pas modifier les transitions rapides de Quiz/Trous sans anomalie avérée.

## Critères d'acceptation

- [ ] Le feedback n'est pas caché par le clavier.
- [ ] Les réponses et les règles de notation sont conservées.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
