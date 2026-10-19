# SPEC 58 — Rattrapage de la 3e étoile et suppression des trois points V1 des sessions

| Champ | Valeur |
|---|---|
| Priorité | P1 — progression juste et rattrapage accessible |
| Statut | **Implémentée — recette Android à confirmer** |
| Branche | `v2` |
| Fichiers | `public/parcours.js`, `public/progress.js`, `public/cloud.js`, `public/app.js`, `public/index.html`, `public/style.css`, `tests/test_rattrapage_etoiles.js`, registre |
| Compatibilité | SPEC 22, 27, 33, 40, 48, 50, 55, 56 |

## 1. Constats vérifiés

- `renderLevelDots` est appelé dans `renderSessionQ` et affiche trois points de niveau **par question** dans les sessions `errors`, `review` et `exam`. Ils n'ont aucun rapport avec les étoiles de l'unité, d'où une confusion visuelle.
- `getUnitBest` / `saveUnitBest` ne stockent qu'un pourcentage : `etoiles(%)` donne 3 étoiles à **90 %**, 2 à **70 %** et 1 à **50 %**.
- `finirRun` ne met à jour les meilleurs scores que pour les modes `unite` et `lecon`. `Refaire mes erreurs` est en mode `erreurs`, donc **ne peut pas récupérer une étoile** malgré une réussite.
- Le résultat du premier passage et les erreurs sont conservés pendant la partie mais pas après : **recalculer rétroactivement une ancienne partie avec précision est impossible**.

## 2. Expérience attendue

1. Supprimer **uniquement dans les sessions transversales** (Erreurs fréquentes, Réviser, Examens utilisant l'ancien moteur) les trois points V1 dans l'en-tête de la question. La progression numérique `1 / N`, la barre, les corrections et le niveau interne des questions restent inchangés ; les étoiles acquises restent partout.
2. Dans **chaque carte d'unité déjà terminée** avec `70 ≤ meilleur score < 90`, afficher un CTA secondaire **« Rattraper ma 3e étoile »** avec score actuel et seuil. L'utilisateur peut toujours refaire l'unité complète.
3. **Nouvelles parties complètes** : au terme d'une unité (`mode=unite`) ou d'une leçon complète (`mode=lecon`), conserver, si le score est son nouveau meilleur, le détail des scores de premier passage des items du **cœur** de l'unité (hors `plus`, hors autres unités). Enregistrer uniquement les métadonnées nécessaires et limiter le poids du stockage.
4. Sur rattrapage, demander **seulement les items ayant perdu des points** (`score < 1`) dans le meilleur passage mémorisé, avec les mêmes quatre exercices et les mêmes règles de notation. En fin de rattrapage, remplacer les scores de ces items par leurs nouveaux scores **uniquement s'ils sont meilleurs**, puis recalculer le pourcentage exactement comme le score de l'unité (moyenne des pourcentages par étape).
5. Le meilleur score et ses étoiles peuvent **augmenter**, jamais diminuer. **Aucun « Sans faute »** ne doit être attribué par le rattrapage ; ce badge exige toujours une partie complète parfaite.
6. **Anciennes parties sans détail** : proposer un **défi de rattrapage** de préférence sur les questions historiquement difficiles (`getQuestionStats` / `getWrongCount`). Compléter avec des questions de différents types du cœur, pour un maximum de **8 questions**, avec **au moins 5 items distincts** pour être éligible. Si le catalogue a moins de 5 items, refuser le défi raccourci et proposer « Refaire l'unité ». Pour obtenir la 3e étoile, il faut **au moins 90 %** sur ce défi ; on enregistre alors **90 %** (et non un score complet fictif de 100 %). En cas d'échec, le meilleur score ne change pas. Le résultat mentionne clairement « Défi de rattrapage », pas « unité complète » ni « Sans faute ».
7. Si un **nouveau meilleur passage complet** remplace le passage mémorisé, remplacer le détail. Ne jamais attacher un détail dont la liste d'items ou le score ne correspond pas à la version du cours ou au meilleur score durable.
8. Le bouton « Refaire mes erreurs » de fin de partie continue de fonctionner normalement. Pour une unité éligible, il peut lancer le **rattrapage des étoiles** si le détail du passage est disponible ; pour les autres modes, comportement inchangé. Un utilisateur qui ferme l'écran retrouve toujours l'accès depuis la carte d'unité.
9. Une partie de rattrapage entamée est sauvegardée dans la partie libre comme les autres exercices. Ne pas détruire la progression principale. Les retours et reprises utilisent les mécanismes existants.
10. Les données sont **isolées par profil et synchronisées dans le cloud** avec fusion du détail le plus récent pertinent ; ne jamais écraser une meilleure note existante, ni transformer en régression les niveaux V1.
11. Préserver la navigation, les animations de résultat, la mission et les questions des leçons. Ne pas présenter de 3e étoile avant la fin et la validation de l'épreuve.

## 3. Test de recette

- [x] Les sessions Erreurs fréquentes/Réviser/Examen n'affichent plus les points V1 ; niveau des questions conservé en base.
- [x] CTA absent sur unité non faite ou ≥90 %, présent de 70 à 89 %.
- [x] Sur nouvelle unité à 80 % : les items perdus sont seuls reproposés et le score recomposé peut atteindre 90 %, sans « Sans faute ».
- [x] Rattrapage partiellement ou totalement raté : meilleur score inchangé ou non diminué.
- [x] Sur partie ancienne : défi historique d'au moins 5 items, seuil strict à 90 %, et gain plafonné à 90 %.
- [x] Si trop peu d'items : message et retour à « Refaire l'unité », sans gain gratuit.
- [x] Leçons complètes, items `plus`, bonus, scores par étape, records et fusions cloud préservés.
- [x] Partie interrompue et scénario d'introduction inchangés.
- [ ] Test tactile Android avec profil réel, après déploiement.
- [ ] Vérification de la synchronisation réelle sur deux appareils.

**Ne pas déclarer « Validée » sans ces deux dernières recettes.**

## Complément — SPEC 60

Le Chemin centralise ses options de correction dans la feuille « Améliorer mes résultats », au lieu de trois boutons par unité. **Seuls les items dont le score a baissé** sont repris quand le meilleur passage est disponible. Le défi d'anciennes parties sans snapshot est distinct : il peut également inclure d'autres questions et est présenté comme tel. Tous les seuils, étoiles et règles « Sans faute » de la SPEC 58 restent inchangés.
