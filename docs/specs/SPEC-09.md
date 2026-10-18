# SPEC 09 — Sauvegarde et reprise sans perte

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `parcours.js, progress.js, cloud.js` |

> **Traçabilité :** Synthèse reconstruite à partir des demandes initiales et du fonctionnement v2 ; vérifier le détail historique avant évolution.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Réutiliser `luxParcours` et `saveRun`/`loadRun` pour les parcours classiques.
- Quitter par la croix n'efface pas une session interrompue.
- Conserver la compatibilité cloud Firebase et ne pas créditer artificiellement le score de premier essai lors d'une reprise.
- La reprise détaillée des missions interrompues peut être traitée distinctement de la restauration du scroll.

## Critères d'acceptation

- [ ] Une session commencée reste reprenable après sortie.
- [ ] Aucune réinitialisation de données existantes.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
