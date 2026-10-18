# SPEC 15 — Historique de navigation et retour fixe

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `navigation.js, app.js, parcours.js` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Le Retour (interface et bouton Android) restaure l'écran réellement précédent, la leçon ouverte et le scroll.
- Ajouter un en-tête Retour visible sur les écrans concernés ; distinguer explicitement Accueil.
- Les panneaux temporaires (cours, contexte) se ferment avant de quitter l'activité ; préserver le contexte de saisie.
- Ne pas bloquer artificiellement le Retour système à la racine de l'app.

## Critères d'acceptation

- [ ] Chemin → unité → exercice → retour revient au chemin dans le bon contexte.
- [ ] Exercice → cours → retour retrouve l'exercice.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
