# SPEC 60 — Mon chemin : bouton compact « Améliorer mes résultats »

| Champ | Valeur |
|---|---|
| Priorité | P1 — compacité du parcours |
| Statut | **Implémentée sur v2 — recette Android à confirmer** |
| Branche | `v2` |
| Code | `public/chemin.js`, `public/index.html`, `public/style.css`, `public/navigation.js` |
| Tests | `tests/test_chemin_amelioration.js` |
| Compatibilité | SPEC 22, 29, 33, 40, 45, 48, 55, 58 et 59 |

## Problème constaté

Les CTAs de rattrapage et de révision affichaient un gros bouton sous chaque unité du Chemin. Plusieurs unités à améliorer rendaient la carte trop haute et repoussaient la Mission, le Bilan et le bouton principal en dehors de l'écran.

## Règles

1. Conserver les lignes d'unité compactes, sans aucun bouton secondaire sous chaque unité.
2. Si au moins une unité du fil est éligible, afficher **un seul** bouton « ↗ Améliorer mes résultats » avec nombre d'unités, après le CTA principal, avant « Voir toute la leçon ». Ne pas afficher ce bouton si toutes les unités sont sans correction disponible.
3. Le bouton ouvre une feuille modale listant les unités et le type d'action (rattrapage de la 3e étoile ou révision). Fermeture par croix, fond, Escape et bouton Retour Android. Cible tactile minimale 44 px. Le focus est conservé dans la feuille puis restauré à sa fermeture.
4. Pour **70–89 %** et snapshot compatible du meilleur passage, proposer seulement les items de ce passage dont le premier score est inférieur à 1. Utiliser la mécanique SPEC 58 pour faire monter le record sans le diminuer.
5. Pour une **ancienne partie sans détail de réponses**, un défi historique SPEC 58 reste possible (au moins 5 questions, au plus 8, 90 % requis). **Il ne représente pas exclusivement les erreurs exactes** : l'UI le nomme « Défi pour la 3e étoile » et l'annonce explicitement.
6. Pour **90–100 %** sans « Sans faute », afficher « Revoir mes erreurs » uniquement si le meilleur passage a perdu des points ou si les statistiques contiennent des erreurs effectivement constatées. Au plus 8 dans l'historique. Révision sans modification des étoiles, records ni badge.
7. Aucun CTA sur une unité non faite, déjà « Sans faute » ou sans item à retravailler. Préserver la reprise des séances et les actions de la vue détaillée des unités. Ne pas introduire de changement de données ni de règles cloud.

## Recette

- [x] Trois unités à retravailler : un CTA de leçon, trois choix dans la feuille.
- [x] Ancienne unité à deux étoiles : défi historique distinct et avertissement.
- [x] Snapshot à 94 % : seulement la question perdue, si elle existe.
- [x] « Sans faute », aucune erreur ou non commencé : aucun CTA inutile.
- [x] Lancement direct des modes existants, pas de changement des scores.
- [x] Fermeture du panneau intégrée au Retour Android.
- [ ] Recette tactile réelle sur Android et profil existant.
- [ ] Contrôle de synchronisation cloud sur deux appareils.

Ne pas marquer cette SPEC « Validée » avant ces deux dernières recettes.
