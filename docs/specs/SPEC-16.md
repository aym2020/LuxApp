# SPEC 16 — Affordances et microanimations de guidage

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `chemin.js, style.css, anim.js` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Donner aux unités cliquables un chevron et un feedback au toucher.
- Animer discrètement la prochaine unité recommandée (une à deux pulsations à l'ouverture), sans clignotement permanent.
- Animer l'ouverture et la fermeture des cartes (environ 200–300 ms).
- Respecter `prefers-reduced-motion` et ne pas ralentir l'interaction.

## Critères d'acceptation

- [ ] La prochaine action est identifiable d'un coup d'œil.
- [ ] Les animations signalent une possibilité d'action, pas seulement de la décoration.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
