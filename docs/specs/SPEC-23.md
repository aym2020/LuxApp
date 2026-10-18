# SPEC 23 — Missions de 10 réponses et système de trois vies

| Champ | Valeur |
|---|---|
| Statut | **En cours** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `mission.js, progress.js, chemin.js, données data/lecons/` |

> **Traçabilité :** Moteur implémenté (commit `31871d9`) ; scènes à 10 réponses à écrire.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

**Évolution décidée le 18/10/2026 :** les seuils 80 % (mission normale) et 90 % (« Tente ta chance ») présentés ci-dessous décrivent l'ancienne règle et sont **remplacés par la [SPEC 32](./SPEC-32.md)** à l'implémentation. Désormais, après les 10 réponses, **au moins 1 vie restante = mission réussie ; 0 vie = échouée**, pour les deux modes. La réussite de la mission valide la leçon sans attribuer d'étoiles fictives aux unités non faites. Les autres exigences de la présente SPEC restent applicables.

## Exigences

- Chaque mission contient exactement 10 répliques prononcées par l'utilisateur (`qui: "toi"`) ; les personnages peuvent prononcer d'autres répliques. Toute scène doit rester pédagogique et naturelle.
- Chaque mission commence avec trois vies : une véritable erreur de connaissance enlève une vie, au plus une fois par réplique ; une coquille corrigée éligible n'enlève rien.
- Après perte des trois vies, laisser finir la conversation en apprentissage, sans valider le défi.
- Mission normale : au moins 8/10 réponses autonomes ET au moins une vie restante. « Tente ta chance » : au moins 9/10 autonomes, aucune aide révélatrice et une vie restante.
- Afficher `Réplique X/10`, les trois cœurs et un bilan des réponses autonomes, erreurs et vies.
- Versionner les missions pour préserver les acquis historiques lors du passage des anciennes scènes à 10 réponses.

## Critères d'acceptation

- [x] Une mission ne confond pas les 10 réponses de l'utilisateur avec le nombre total de bulles.
- [ ] Le score et le saut de leçon reflètent les nouveaux seuils sans réinitialiser les anciennes réussites.
- [ ] Tester 10/10, 9/10, 8/10, trois erreurs, coquille et aide révélatrice.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Implémentation

- Commit `31871d9`. Fichiers : `public/mission.js`, `public/progress.js`, `public/style.css`.
- Moteur : 3 vies (une au plus par réplique), résultats `ok` / `coquille` / `essais` / `revele`, réussite ≥ 80 % de réponses autonomes avec au moins une vie, « Tente ta chance » ≥ 90 % sans réponse révélée, score enregistré avec `mission.version` (1 par défaut).
- Tests : `tests/test_mission_vies.py`.
- Reste à faire : réécrire les 24 scènes à 10 répliques « toi », puis `mission.version: 2`.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
