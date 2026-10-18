# SPEC 01 — Introduction immersive de la mission

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `mission.js, progress.js, cloud.js, style.css` |

> **Traçabilité :** Synthèse reconstruite à partir des demandes initiales et du fonctionnement v2 ; vérifier le détail historique avant évolution.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Lors de la première découverte d'une leçon avec mission, présenter un écran dédié : titre, scénario, objectifs, bouton « J'ai compris · Commencer » et accès « Voir les unités ».
- Ne pas considérer la simple ouverture comme confirmation de lecture ; enregistrer la confirmation dans la progression du profil et la synchronisation cloud.
- Animer discrètement l'apparition du contenu (environ 500–800 ms) en respectant `prefers-reduced-motion`.
- Ne pas imposer rétroactivement l'introduction aux personnes ayant déjà commencé la leçon.

## Critères d'acceptation

- [ ] Une première découverte présente le contexte complet et attend une action explicite.
- [ ] Une visite ultérieure ne réimpose pas automatiquement ce long écran.
- [ ] Les acquis anciens ne sont ni effacés ni déclassés.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
