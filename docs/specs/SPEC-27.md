# SPEC 27 — Valorisation visuelle des unités terminées

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `chemin.js, style.css, design-tokens.css` |

> **Traçabilité :** Implémentée sur `v2` ; recette sur smartphone réel à faire.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Trois états visuels distincts : terminé (coche et accent vert discret + étoiles lisibles), recommandé (anneau et chevron jaune), non commencé (neutre mais accessible).
- Rehausser le contraste des unités réussies sans transformer la carte en grands aplats de couleur.
- Lors de la première validation, révéler coche et étoiles avec un halo vert léger ; animer la prochaine unité en jaune.
- Réutiliser le design system et respecter `prefers-reduced-motion` ; aucune modification des seuils, étoiles ou de la sélection de l'unité en cours.

## Critères d'acceptation

- [ ] Les acquis et la prochaine action sont visibles d'un coup d'œil.
- [x] Les animations ne se rejouent pas à chaque consultation.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Implémentation

- Fichiers : `public/chemin.js` (classes `ok` / `actuelle` / `a-venir`, `premiere`), `public/parcours.js` (`dernierFini.premiere`), `public/style.css`.
- 1re réussite : coche, étoiles une par une, halo vert, puis la prochaine unité pulse. Une seule fois, coupé en mouvement réduit.
- Tests : `tests/test_lot2.py`.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
