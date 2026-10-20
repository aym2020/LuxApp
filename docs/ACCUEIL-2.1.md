# LuxApp 2.1 — Étape 1 : accueil éditorial

## Objectif

Rendre l'accueil plus reconnaissable, plus humain et plus facile à parcourir, sans reprendre le style d'une application Apple ni toucher aux apprentissages.

## Base et périmètre

- Branche **2.1**, dérivée de **v2**.
- Pas de changement sur les unités, les leçons, les évaluations, la sauvegarde, le modèle de progression ou la navigation des autres écrans.
- L'accueil v2 d'origine (public/accueil.js) reste intact. public/accueil-v21.js est chargé après lui et adapte uniquement les fonctions de présentation. Retirer les deux inclusions 2.1 dans index.html permet de revenir au visuel précédent.

## Direction artistique

1. **Une expression luxembourgeoise** — « Moien ! » devient l'élément typographique principal en Instrument Serif. Inter reste la police de l'interface.
2. **Une scène photographique** — décor original généré dans une ambiance luxembourgeoise nocturne. Les WebP locaux `public/art/hero-luxapp-mobile.webp` (960 × 540) et `public/art/hero-luxapp-fhd.webp` (1920 × 1080) ne contiennent aucun texte. Les dégradés de lisibilité sont appliqués en CSS. Le décor est une création d'ambiance, pas une photographie documentaire.
3. **Des chiffres sans cartes** — progression réelle, série et leçons terminées restent visibles sans répéter les mêmes cadres.
4. **Une action dominante** — bouton jaune utilisant la fonction de prochain pas existante : commencer, continuer, reprendre ou terminer un niveau.
5. **Trois actions secondaires** — Réviser, Examens et Erreurs ; « Mon chemin » reste accessible après elles et via la navigation inférieure.

## Comportement conservé

- Les niveaux sont sélectionnés manuellement et le changement de niveau après complétion reste explicite.
- Le mode invité garde ses liens de compte ; le menu garde l'information de synchronisation.
- Les chiffres proviennent exclusivement de progressionNiveau() et serieActuelle().
- Les identifiants today et serie et les appels commencer(), suivreProchainPas(), lancerRevision(), openExamens(), startSession('errors'), goLessons(), passerAuNiveau() sont conservés.
- Scroll interne de l'accueil, adaptations mobiles, interaction clavier et réduction des animations maintenus.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| public/accueil-v21.js | Surcouche de présentation |
| public/accueil-v21.css | Styles limités à #view-dashboard |
| public/art/hero-luxapp-mobile.webp | Image optimisée mobile (960 × 540) |\n| public/art/hero-luxapp-fhd.webp | Image haute définition (1920 × 1080) |
| public/index.html | Chargement après les fichiers v2 |
| test/accueil-v21.test.cjs | Tests automatiques des états et destinations |

## Recette / non-régression

Exécuter : **node --test test/accueil-v21.test.cjs**

Puis vérifier dans un navigateur :

1. Nouveau visiteur : « Moien ! », message de découverte, « Commencer », aucun pourcentage inventé.
2. Visiteur avec progression : pourcentage, série et leçons terminées réels ; « Continuer » vers le bon prochain pas.
3. Niveau terminé : proposition de passage au niveau suivant ou au chemin, sans changement automatique.
4. Réviser, Examens, Erreurs, Mon chemin et navigation du bas.
5. Connexion invitée, synchro, réglages, bascule A1.1/A1.2.
6. Écrans 320, 360, 390 et 720 px, petite hauteur, zoom de texte, navigation clavier et préférences d'animation.
7. Chemin, exercices, missions, retour navigateur et sauvegarde non affectés.

Le visuel généré précédemment est une **maquette d'intention** : ses chiffres étaient fictifs. La version 2.1 exploite les données réelles et un visuel WebP photographique optimisé, avec superposition de dégradés CSS.

## Étapes suivantes

Le chemin des leçons et les exercices seront traités par des changements séparés après validation de cet accueil.
