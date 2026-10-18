# SPEC 28 — Résultats d'étape plus gratifiants

| Champ | Valeur |
|---|---|
| Statut | **À faire** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `parcours.js (renderFin), style.css` |

> **Traçabilité :** Spécification définie dans la conversation ; non implémentée au moment de la rédaction.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Supprimer « Ce passage ne change pas les étoiles » et toute explication technique inutile en conclusion d'étape.
- Afficher un titre précis (`ÉTAPE ÉCRITURE TERMINÉE`), un message selon le pourcentage (100 Parfait, 90–99 Excellent, 75–89 Bien joué, 50–74 Tu progresses, moins de 50 Continue à t'entraîner) et un bilan factuel des erreurs.
- Conserver « À retravailler », les réponses et les actions secondaires utiles ; privilégier un message positif sans masquer l'échec pédagogique.
- Pour une unité complète garder les quatre barres de résultat ; pour une étape isolée ne pas inventer d'autres scores.
- Conserver le CTA fixe et les seuils réels ; animation légère, contrastes améliorés et navigation sans doublon de CTA.

## Critères d'acceptation

- [ ] Un 86 % se présente positivement avec le nombre réel de réponses à retravailler.
- [ ] Les écrans étape/unité restent distincts et les scores historiques restent identiques.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
