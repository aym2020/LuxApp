# SPEC 25 — Accueil : destination explicite et scroll de retour

| Champ | Valeur |
|---|---|
| Statut | **À faire** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `parcours.js, app.js, navigation.js` |

> **Traçabilité :** Spécification définie dans la conversation ; non implémentée au moment de la rédaction.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Distinguer définitivement « Accueil » (vrai `view-dashboard`), « Retour » (écran précédent) et « Retour à la leçon » (liste des unités).
- Corriger le cas observé où « Accueil » depuis une fin d'étape finit dans les unités mal cadrées malgré `goDashboard()`.
- Éliminer les défilements différés résiduels déclenchés par une ancienne vue lorsque la navigation a déjà changé.
- Sur un retour vers la leçon, positionner la carte cible sous l'en-tête, jamais à cheval sur deux unités ni sous la barre inférieure.
- Inspecter les interactions `goDashboard()`, `showView()`, `noterNavigation()`, `restaurerEcran()` et `allerALaCarte()` ; ne pas remplacer le bouton Accueil par un faux Retour.

## Critères d'acceptation

- [ ] Accueil depuis étape, unité, mission et bilan affiche toujours le vrai dashboard.
- [ ] Retour retrouve la position précédente, Retour à la leçon sa carte cible.
- [ ] Tester Android physique, chrome/brave et scroll post-animation.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
