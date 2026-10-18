# SPEC 24 — Correction algorithmique des coquilles sans IA

| Champ | Valeur |
|---|---|
| Statut | **En cours** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `correction.js, mission.js, parcours.js, progress.js, tests/test_correction.js` |

> **Traçabilité :** Demande validée en conversation ; développement en cours signalé par l'utilisateur.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Créer `analyserReponse(saisie, attendu, contexte)` avec résultat `correct`, `coquille_probable` ou `erreur`, type d'écart, justification et éligibilité à une correction gratuite.
- Traitement 100 % local, déterministe, sans modèle d'IA, API ni connexion.
- Normalisation contrôlée puis alignement mot par mot ; distance de Damerau-Levenshtein (substitution, omission, ajout, inversion) et proximité clavier AZERTY/QWERTY en indices secondaires.
- Protéger les articles, pronoms, négations, conjugaisons, mots valides distincts et différences de casse grammaticalement importantes ; préférer une erreur ordinaire en cas d'ambiguïté.
- Une coquille probable peut être corrigée une fois sans afficher la solution ; la validation gratuite exige que l'utilisateur produise finalement la réponse attendue.
- Distinguer `correct_direct`, `correct_apres_coquille`, `correct_apres_erreur`, `reponse_revelee`; différer l'écriture définitive des erreurs pour éviter les faux historiques.
- Appliquer aux missions et à l'écriture libre, pas aux QCM.

## Critères d'acceptation

- [ ] `Gudde Mioen` peut ouvrir une correction gratuite ; `Dat ass en Mapp` ne doit pas être pardonné comme coquille.
- [ ] Aucune réponse approximative n'est auto-validée.
- [ ] Des tests couvrent formes courtes, accents, mots manquants, négations et doublons.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
