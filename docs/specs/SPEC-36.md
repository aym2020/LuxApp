# SPEC 36 — Règles des vies à chaque lancement de mission, avec « Ne plus afficher »

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Branche | `v2` |
| Périmètre | `public/mission.js`, `public/style.css`, tests |
| Origine | Demande de Clayton du 18/10/2026 |
| Remplace | Le rappel automatique « une seule fois » de la [SPEC 34](./SPEC-34.md) |

## Problème

Avec la SPEC 34, le panneau « Tu as 3 vies ! » ne s'affiche qu'à la toute 1re mission. Un utilisateur qui l'a fermé trop vite, ou qui revient après plusieurs jours, ne revoit plus les règles au moment où elles comptent : au lancement d'une mission.

## Exigences

1. **À chaque lancement de mission**, le panneau des règles des vies s'affiche avant la conversation (mission normale comme « Tente ta chance »). La conversation ne démarre qu'à sa fermeture (bouton « C'est parti ! → », voile, Échap ou bouton Retour).
2. Le panneau contient une case **« Ne plus afficher »**, décochée par défaut.
3. Cocher la case enregistre le choix **immédiatement** (pas besoin de fermer le panneau). Le choix est mémorisé dans la progression, donc synchronisé entre appareils : `progress.guide.viesMasquees = 1`.
4. Case cochée : plus aucun affichage automatique au lancement des missions suivantes.
5. Un appui sur les cœurs rouvre toujours les règles (bouton « Continuer la mission », sans effet sur la partie en cours). La case y est présente et reflète le choix actuel : la décocher **réactive** l'affichage au lancement.
6. **Utilisateurs existants** : l'ancien marqueur `progress.guide.vies` (SPEC 34) n'est plus lu. Tout le monde revoit donc le rappel au prochain lancement, jusqu'à cocher « Ne plus afficher ».

## Critères d'acceptation

- [x] 1er lancement : règles avant la conversation, case décochée.
- [x] 2e lancement sans case cochée : règles de nouveau affichées.
- [x] Case cochée puis « C'est parti » : la mission démarre ; lancement suivant sans règles.
- [x] Appui sur les cœurs : règles affichées, case cochée, partie inchangée.
- [x] Case décochée depuis les cœurs : les règles reviennent au lancement suivant.
- [x] Le choix est enregistré dans la progression (`guide.viesMasquees`) et synchronisé.
- [ ] Recette Android / iOS (taille de la case, lisibilité).

## Implémentation

- `public/mission.js` :
  - `reglesViesMasquees()` remplace `reglesViesVues()` et lit `progress.guide.viesMasquees` ;
  - `masquerReglesVies(masquer)` enregistre le choix à chaque clic sur la case (+ synchronisation cloud) ;
  - `voirReglesVies(auLancement)` ajoute la case « Ne plus afficher » (cochée selon le choix actuel) ;
  - `demarrerApresRegles()` ne marque plus rien : elle lance seulement la conversation ;
  - `openMission()` affiche les règles tant que `reglesViesMasquees()` est faux.
- `public/style.css` : `.ms-regles-masquer` (case 18 px, centrée, couleur d'accent, texte secondaire).
- Tests :
  - `tests/test_mission_vies.py` : scénario complet (affichage à chaque lancement, case cochée, réactivation depuis les cœurs) ;
  - les autres tests qui neutralisaient le rappel avec `guide = { vies: 1 }` utilisent désormais `guide = { viesMasquees: 1 }`.

## Tests exécutés

`tests/test_mission_vies.py` puis suite critique du PLAYBOOK : verte.
