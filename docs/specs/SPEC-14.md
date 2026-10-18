# SPEC 14 — Mon chemin compact et scroll intelligent

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `chemin.js, style.css, app.js` |

> **Correctif SPEC 33 (à implémenter)** : supprimer le flash du bandeau « Mon chemin » relancé à chaque `renderLessons()`, et éviter le double mouvement de scroll sur les bascules d'accordéon. Les comportements antérieurs de cadrage restent à préserver.

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Au lancement normal, afficher l'en-tête « Mon chemin » sans recentrer automatiquement une grande carte.
- Réduire les espacements sans tronquer les contenus essentiels ; garder des surfaces tactiles de 44 px.
- Après expansion, aligner la carte sous l'en-tête si elle est plus grande que l'écran ; sinon la montrer entièrement dans la zone visible.
- Ne jamais masquer le CTA sous la barre inférieure.

## Critères d'acceptation

- [ ] Le titre ne sort pas de l'écran.
- [ ] Le défilement naturel est possible même sur les longues leçons.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
