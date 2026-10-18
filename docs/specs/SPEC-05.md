# SPEC 05 — Mission interactive : réponse, feedback et clavier

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `mission.js, ui.js, style.css` |

> **Traçabilité :** Synthèse reconstruite à partir des demandes initiales et du fonctionnement v2 ; vérifier le détail historique avant évolution.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- À l'entrée en mission, afficher la question sans ouvrir le clavier virtuel ; l'utilisateur touche le champ pour écrire.
- Après réponse correcte, fermer le clavier et montrer la correction jusqu'au clic « Continuer ».
- Après erreur, afficher aide progressive et bouton « Réessayer » sans effacer arbitrairement la saisie ; « Voir la réponse » reste disponible selon les essais.
- Ne pas avancer automatiquement à la réplique suivante pendant que l'utilisateur lit la correction.

## Critères d'acceptation

- [ ] Le feedback positif est visible sur téléphone.
- [ ] Chaque question reste lisible avec le clavier fermé.
- [ ] Les règles de score et de correction existantes restent stables jusqu'à leur évolution explicite par les specs 23–24.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
