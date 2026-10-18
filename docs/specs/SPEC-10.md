# SPEC 10 — Recette UX mobile et non-régression

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `tests/, parcours.js, mission.js, navigation.js` |

> **Traçabilité :** Synthèse reconstruite à partir des demandes initiales et du fonctionnement v2 ; vérifier le détail historique avant évolution.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Tester la première découverte, la carte compacte, les retours depuis chaque unité et la mission.
- Vérifier clavier fermé à l'entrée, feedback explicite, erreurs, réponses révélées, retours Android et bonus.
- Tester un écran court, Brave Android, Chrome Android et Safari iOS, y compris `prefers-reduced-motion`.
- Préserver notes, scores, étoiles, contenus et synchronisation.

## Critères d'acceptation

- [ ] Chaque action laisse l'utilisateur comprendre ce qui vient de se passer et comment poursuivre.
- [ ] Aucun écran critique ne requiert de deviner où se trouve le bouton.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
