# SPEC 02 — Mission compacte lors des visites suivantes

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `mission.js, parcours.js, style.css` |

> **Traçabilité :** Synthèse reconstruite à partir des demandes initiales et du fonctionnement v2 ; vérifier le détail historique avant évolution.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Après découverte, remplacer la grande carte de scénario par une carte compacte : mission, titre, état et accès « Voir le scénario ».
- Séparer la lecture du scénario de l'exécution de la mission ; conserver « Jouer/Rejouer la mission ».
- Conserver les statuts « À découvrir », « En préparation », « Prête à jouer », « Réussie »/« À rejouer » calculés à partir des acquis.

## Critères d'acceptation

- [ ] Le scénario complet reste disponible à la demande.
- [ ] Consulter/fermer le scénario restaure l'écran et son scroll.
- [ ] La mission reste accessible sans suppression de ses répliques.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
