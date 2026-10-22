# Survie — essai VFX Canvas « Embrasement » (V0.1)

**Branche de référence :** `2.1` · **Date :** 22 octobre 2026 · **Décision utilisateur :** « C'est pas mal, consigne le test, c'est pas parfait mais un bon début. »

**État : preuve de concept prometteuse, NON validée pour intégration.** Le jeu Survie actuel reste sur le HUD restauré par le commit `64a0aba`. Le prototype ne doit ni le remplacer, ni réactiver la VFX V1 retirée lors du rollback.

## Archive reproductible

- [Prototype HTML + Canvas autonome](./survie-combo-fire-v01.html). Ouvrir le fichier localement dans un navigateur : aucune dépendance, aucune connexion et aucun chargement d'asset externe.
- Interactions : curseur « Intensité » de 0 à 24, bouton « + Réussite » et bouton « Rupture de combo ».
- Les règles de la démo sont **visuelles uniquement**. La valeur 20/24 et les textes « ×2 » / « ×3 » sont des démonstrateurs, pas une modification des multiplicateurs réels, de la streak, ni de SPEC 90.
- Les captures Samsung fournies par l'utilisateur dans la conversation le 22 octobre 2026 documentent l'état **20 / 24 : 100 % · INFERNO ×3** et **2 / 24 : 10 % · CHARGE ×1**. Les menus de partage et les barres système visibles appartiennent à l'interface ChatGPT, pas à LuxApp.
- Le HTML archivé reproduit les mécaniques Canvas de la démonstration dans le chat ; c'est une source autonome pour itération, pas une preuve de performance mesurée ou un enregistrement vidéo.

## Résultats constatés

| Critère | Observation |
| --- | --- |
| Direction visuelle | Noir chaud / or / ambre cohérents avec LuxApp 2.1, hiérarchie éditoriale conservée |
| Rendu de la jauge | Gradient incandescant, extrémité lumineuse, braises de tailles et luminosités variées |
| Montée en puissance | À 2 points, une faible charge ; à 20 points, le remplissage est total et les braises/flammes sont plus présentes |
| Dynamique | Canvas 2D : particules calculées en temps réel, halos radiaux et composition additive ; le bouton réussite provoque un burst, rupture fait décroître l'énergie |
| Ergonomie | Prototype manipulable au curseur et via deux boutons ; validation ergonomique dans le **vrai HUD du jeu : non faite** |
| Appréciation utilisateur | **Bon début**, insuffisant comme résultat définitif |
| Tests non réalisés | Mesure FPS Android, consommation batterie, longue session, modes économie d'énergie, analyse sur 320 px et intégration réelle |

## À améliorer, sans précipiter l'intégration

1. **Forme du feu :** à 100 %, certaines langues apparaissent triangulaires et répétitives. Chercher un mouvement organique crédible, moins géométrique, avec variations de turbulence et de vitesse.
2. **Rendu plus subtil :** limiter les grandes surfaces blanches/jaunes et le bloom permanent. Utiliser les pics incandescents pour les événements marquants ; éviter l'effet « barbecue » et le kitsch.
3. **Densité dans le HUD :** la démo laisse volontairement un grand espace vide au-dessus de la jauge. La version réelle doit s'inscrire dans une zone beaucoup plus compacte, sans pousser le mot/les lettres sous l'écran.
4. **Qualité mobile :** plafonner le DPR et les particules, suspendre le rendu quand la page est masquée, gérer `prefers-reduced-motion`; tester réellement sur le Samsung avant de promettre 60 FPS.
5. **Couplage au moteur :** séparer impérativement `streak` (donnée réelle), état visuel et système VFX ; un gestionnaire unique d'effets. Aucun second déclenchement quand le mot suivant apparaît. L'erreur et « Passer −3 s » remettent le visuel à zéro.
6. **Pouvoirs :** décision UX encore à spécifier : tendance utilisateur vers des **buffs permanents/automatiques** (ex. gel tous les trois succès), plutôt que des boutons actifs à toucher inutilement. Ne pas implémenter ce changement de gameplay dans le prototype de feu.

## Acceptation de la prochaine version

- Comparatif animé à **2 / 5 / 10 / 20** réussites et rupture, en HTML/Canvas utilisable avant tout push de production.
- Effet perceptible et propre en 300–600 ms, sans recouvrir chrono, mots, tuiles ou boutons.
- Sur Android : pas de chevauchement, pas de double rebond, animation continue lors du changement de mot ; capture vidéo courte et contrôle sur l'appareil réel.
- Mesures : temps de frame p95, nombre de particules max, mémoire/CPU, réduction des effets pour téléphones plus faibles, contraste.
- **Aucune intégration du prototype dans `public/jeux-v21.js` sans validation explicite du rendu** et tests de non-régression.

## Références

- [Charte LuxApp 2.1](../CHARTE_UI_2.1.md)
- [SPEC 88 — Survie existante](../specs/SPEC-88.md)
- [SPEC 90 — pouvoirs et combo futurs](../specs/SPEC-90.md)
- [PLAYBOOK](../../PLAYBOOK.md)

**Décision : archiver et itérer, pas déployer.**

**Mise à jour du 22 octobre 2026 :** l'utilisateur a demandé l'intégration de l'étape 1/4 de [SPEC 92](../specs/SPEC-92.md). L'intégration reprend les enseignements de ce prototype (flammes organiques par particules, pas de bloom permanent, pics réservés aux événements, HUD compact, DPR et particules plafonnés, gestionnaire d'effets unique, remise à zéro visuelle sur erreur et Passer) ; recette Samsung toujours obligatoire.