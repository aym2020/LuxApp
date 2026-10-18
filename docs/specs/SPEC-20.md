# SPEC 20 — Résultats d'unité : barres et CTA fixe

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `parcours.js, mission.js, style.css` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Conserver score et étoiles dans un format compact.
- Montrer la mission débloquée avec les nouvelles bulles de conversation.
- Conserver visibles par défaut les quatre barres vertes Mot caché, Quiz, Trous, Écriture pour une unité complète ; ne montrer que les étapes réellement jouées en mode isolé.
- Fixer un CTA jaune principal en bas en tenant compte des safe areas ; laisser les actions secondaires dans le scroll.
- Ne pas changer les notes ni les seuils de maîtrise.

## Critères d'acceptation

- [ ] Le bouton principal est visible sans défilement.
- [ ] Aucune barre de progression ne disparaît dans un accordéon.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
