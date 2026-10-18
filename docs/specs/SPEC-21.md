# SPEC 21 — Mot caché : identité des tuiles et CTA de l'introduction

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `parcours.js, style.css, index.html` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Chaque tuile de lettre possède une identité ; le clic sur la deuxième occurrence de `t` ne désactive pas la première.
- Ne pas réattribuer une tuile via `normalize()` et `findIndex()` ; préserver casse, accents, répétitions et identité lors de l'effacement.
- Pour Mot caché uniquement, choisir une police à glyphes bien distincts (`I`, `l`, `1`, `O`, `0`), par exemple Atkinson Hyperlegible.
- Rendre « Commencer » de l'introduction d'unité accessible dans un CTA fixe, avec contenu défilant non masqué.

## Critères d'acceptation

- [ ] Le clic consomme la tuile réellement touchée.
- [ ] La saisie et le CTA sont lisibles sur mobile.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
