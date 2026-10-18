# SPEC 19 — Design system et harmonisation des écrans

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `public/design-tokens.css, public/components.css, docs/DESIGN_SYSTEM.md, public/style.css` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Adopter accueil, introduction et chemin comme références de la DA sombre, chaleureuse, avec jaune pour le CTA et couleurs par leçon.
- Centraliser tokens (couleurs, tailles, fontes, rayons), composants (cartes, CTA, puces, barres) et documentation versionnée.
- Conserver Inter pour l'interface et Instrument Serif pour les titres/phrases narratives, sauf exception locale motivée.
- Maintenir un catalogue de composants et éviter les nouvelles valeurs CSS arbitraires.

## Critères d'acceptation

- [ ] L'écran des unités paraît appartenir à la même application.
- [ ] Une modification d'un composant commun se fait à un endroit documenté.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
