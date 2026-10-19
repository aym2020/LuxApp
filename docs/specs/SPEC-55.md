# SPEC 55 — Introduction privilégiée, consultation libre des unités

| Champ | Valeur |
|---|---|
| Priorité | P1 — navigation pédagogique |
| Statut | **Implémentée — recette Android à confirmer** |
| Branche | `v2` |
| Périmètre | `public/chemin.js`, `public/parcours.js`, `tests/test_chemin_introduction_unites.js` |
| Compatibilité | SPEC 01, 18, 38, 44, 53 et 54 |

## Problème constaté

Sur une leçon jamais commencée (ex. leçon affichée 22, ID 21 : `An der Wunneng`), le lien secondaire **« Voir toute la leçon »** du Chemin ouvrait l'introduction immersive de mission au lieu de la **liste des unités**. L'utilisateur souhaite néanmoins conserver cette introduction comme entrée principale.

## Choix fonctionnel

1. **« Découvrir »** (bouton principal) continue d'ouvrir l'introduction de mission sur une leçon jamais commencée. Il conserve ses règles de reprise, de confirmation et de progression.
2. **« Voir toute la leçon »** (lien secondaire) ouvre directement **l'écran de leçon présentant la mission, toutes les unités obligatoires, toutes les unités bonus et le contenu libre**, sans introduction préalable.
3. **« Voir les unités »** depuis l'introduction continue d'ouvrir ce même écran. Le retour depuis cet écran restaure l'introduction quand le visiteur venait de celle-ci.
4. La consultation des unités est **de l'exploration**. Elle ne confirme pas l'introduction de mission (`marquerIntroMissionVue` n'est pas appelé), ne termine pas une unité, ne valide pas la mission et ne modifie aucun score. L'indicateur de visite habituel peut rester mis à jour.
5. Si l'utilisateur revient sur le Chemin après cette consultation, **« Découvrir »** doit toujours proposer l'introduction non encore confirmée.
6. Les leçons classiques (sans unités) continuent d'ouvrir leur écran historique, sans changement.
7. Ne pas contourner l'introduction globalement : garder `openParcoursLecon(l)` et `openParcoursLecon(l, cible)` avec leur comportement par défaut ; seul le lien secondaire fournit une option explicite `afficherUnitesDirectement=true`.
8. Préserver le bouton `Passer`, les retours, la reprise, la navigation d'unité et le déroulement de la mission.

## Implémentation

- `public/chemin.js` : le lien secondaire appelle `ouvrirTouteLaLeconDepuisChemin(leconId)`. Le bouton principal conserve `actionLeconChemin(l)`.
- `public/parcours.js` : troisième paramètre facultatif `afficherUnitesDirectement = false` de `openParcoursLecon(l, cible, afficherUnitesDirectement)`. Il court-circuite **uniquement** le test d'affichage de l'introduction, sans consommer celle-ci ni changer les étapes.
- Aucun changement au JSON des leçons, aux bonus ou à `mission.js`.

## Recette

- [x] Première visite : bouton principal → `view-msintro`.
- [x] Première visite : « Voir toute la leçon » → `view-plecon` avec les unités bonus.
- [x] Exploration sans confirmation : « Découvrir » → introduction toujours disponible.
- [x] Après confirmation de l'introduction : liste des unités normalement accessible.
- [x] Accès direct à une unité, navigation historique et leçon classique non modifiés.
- [x] Contrôles automatisés ciblés sur les fonctions réelles.
- [ ] Vérification tactile sur Android : lien secondaire, bouton principal, retour depuis introduction et état après rafraîchissement.

**Ne pas déclarer « Validée » avant la recette Android.**
