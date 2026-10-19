# SPEC 55 — Introduction privilégiée, consultation libre des unités

| Champ | Valeur |
|---|---|
| Priorité | P1 — navigation pédagogique |
| Statut | **Implémentée — recette Android à confirmer** |
| Branche | `v2` |
| Périmètre | `public/chemin.js`, `public/parcours.js`, `public/mission.js`, `tests/test_chemin_introduction_unites.js` |
| Compatibilité | SPEC 01, 18, 38, 44, 53 et 54 |

## Problème constaté

Sur une leçon jamais commencée (ex. leçon affichée 22, ID 21 : `An der Wunneng`), le lien secondaire **« Voir toute la leçon »** du Chemin ouvrait l'introduction immersive de mission au lieu de la **liste des unités**. L'utilisateur souhaite néanmoins conserver cette introduction comme entrée principale.

## Choix fonctionnel

1. **« Découvrir »** (bouton principal) continue d'ouvrir l'introduction de mission sur une leçon jamais commencée. Il conserve ses règles de reprise, de confirmation et de progression.
2. **« Voir toute la leçon »** (lien secondaire) ouvre directement **l'écran de leçon présentant la mission, toutes les unités obligatoires, toutes les unités bonus et le contenu libre**, sans introduction préalable.
3. **« Voir les unités »** depuis l'introduction continue d'ouvrir ce même écran. Le retour depuis cet écran restaure l'introduction quand le visiteur venait de celle-ci.
4. La consultation des unités est **de l'exploration**. Elle ne confirme pas l'introduction de mission (`marquerIntroMissionVue` n'est pas appelé), ne termine pas une unité, ne valide pas la mission et ne modifie aucun score. L'indicateur de visite habituel peut rester mis à jour.
5. **Le premier démarrage** d'une unité (y compris bonus) ou d'une activité directe depuis cet aperçu **affiche obligatoirement l'introduction si elle n'a pas été confirmée**. Aucun exercice ni enregistrement de score ne commence avant « J'ai compris ».
6. Après « J'ai compris », **reprendre exactement l'action choisie** : unité 4 si c'est elle qui a été sélectionnée, ou raccourci Quiz, leçon complète, bilan, révision ou mission. En entrée normale « Découvrir », conserver le démarrage de la première unité à faire.
7. L'introduction n'est confirmée qu'au clic explicite sur « J'ai compris », pas en affichant la liste ni en ouvrant l'introduction. Le lien « Voir les unités » peut ainsi servir à explorer avant engagement.
8. L'option explicite « Tu connais déjà ? Tente ta chance » sur l'introduction continue de permettre d'essayer la mission avant d'avoir terminé les unités.
9. Si l'utilisateur revient sur le Chemin après simple consultation, **« Découvrir »** doit toujours proposer l'introduction non encore confirmée.
10. Les leçons classiques (sans unités) continuent d'ouvrir leur écran historique, sans changement.
11. Ne pas contourner l'introduction globalement : garder `openParcoursLecon(l)` et `openParcoursLecon(l, cible)` avec leur comportement par défaut ; seul le lien secondaire fournit une option explicite `afficherUnitesDirectement=true`.
12. Préserver le bouton `Passer`, les retours, la reprise et le déroulement de la mission.

## Implémentation

- `public/chemin.js` : le lien secondaire appelle `ouvrirTouteLaLeconDepuisChemin(leconId)`. Le bouton principal conserve `actionLeconChemin(l)`. La sélection directe d'une unité ou mission passe par la même vérification d'introduction.
- `public/parcours.js` : troisième paramètre facultatif `afficherUnitesDirectement = false` de `openParcoursLecon(l, cible, afficherUnitesDirectement)`. Il contourne l'introduction uniquement **pour afficher la liste** ; `openIntro`, `startUnite`, les raccourcis, le bilan et les révisions contrôlent encore si l'introduction doit être montrée.
- `public/mission.js` : conserve en mémoire l'activité explicitement sélectionnée pendant le scénario, puis la reprend seulement après `marquerIntroMissionVue`. Le bouton « Tente ta chance » existant reste une exception voulue.
- Aucun changement au JSON des leçons, aux unités bonus ni au calcul de progression.

## Recette

- [x] Première visite : bouton principal → `view-msintro`.
- [x] Première visite : « Voir toute la leçon » → `view-plecon` avec les unités bonus.
- [x] Exploration sans confirmation : « Découvrir » → introduction toujours disponible.
- [x] Après confirmation de l'introduction : liste des unités normalement accessible.
- [x] Accès direct à une unité : introduction avant lancement, reprise de l'unité choisie après confirmation.
- [x] Accès aux quiz, bilan, mission, révision et leçon complète : scénario d'abord, action conservée ensuite.
- [x] Navigation historique et leçon classique préservées.
- [x] 34 assertions sur les fonctions réelles du moteur avec les entrées du Chemin.
- [ ] Vérification tactile sur Android : lien secondaire, bouton principal, retour depuis introduction et état après rafraîchissement.

**Ne pas déclarer « Validée » avant la recette Android.**
