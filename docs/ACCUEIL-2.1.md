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
- Le mode invité conserve un accès « Connexion » discret dans la ligne des niveaux. La création de compte reste disponible dans le portail d'authentification ; le menu conserve l'état de synchronisation.
- Les chiffres proviennent exclusivement de progressionNiveau() et serieActuelle().
- Les identifiants today et serie et les appels commencer(), suivreProchainPas(), lancerRevision(), openExamens(), startSession('errors'), goLessons(), passerAuNiveau() sont conservés.
- Scroll interne de l'accueil, adaptations mobiles, interaction clavier et réduction des animations maintenus.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| public/accueil-v21.js | Surcouche de présentation |
| public/accueil-v21.css | Styles limités à #view-dashboard |
| public/art/hero-luxapp-mobile.webp | Image optimisée mobile (960 × 540) |
| public/art/hero-luxapp-fhd.webp | Image haute définition (1920 × 1080) |
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

**Accueil validé comme référence de la V2.1 le 21 octobre 2026.** Sa direction artistique et l'ordre de migration des autres écrans sont formalisés dans [`docs/CHARTE_UI_2.1.md`](CHARTE_UI_2.1.md). Les changements du chemin des leçons et des exercices seront réalisés par lots séparés, avec validation sur téléphone.

## Accueil V2 — mise en œuvre du mockup approuvé (20 octobre 2026)

La seconde maquette HTML, validée après comparaison avec la capture Android, remplace les choix de composition de la première tentative **uniquement sur la branche `2.1`**.

- **En-tête** : symbole architectural conservé et niveaux A1.1/A1.2 sur la même ligne que « Mode invité · Connexion » ; la connexion est volontairement secondaire.
- **Hero** : photographie WebP du dépôt existant, panoramique sur environ 250 px, fondue en haut et en bas et assombrie latéralement pour préserver le contraste du texte HTML.
- **Microcopy** : « Le luxembourgeois, pas à pas », « Moien ! », « Une nouvelle langue commence ici. » sur la première visite ; message de reprise sur les visites suivantes.
- **Progression** : deux blocs textuels sans cartes, pourcentage et série issus exclusivement de la progression réelle. Les leçons terminées restent disponibles aux technologies d'assistance.
- **Action principale** : bouton or compact d'environ 85 px, libellé Commencer/Continuer, leçon et unité sur deux lignes secondaires, icône livre.
- **Navigation** : Réviser, Examens et Erreurs dans un bandeau commun à séparateurs fins ; « Voir mon chemin » isolé en lien discret.
- **Adaptation** : règles à 380 px, 330 px et faible hauteur ; conservation du scroll et des états clavier ; aucune modification des exercices.

**Données et comportements conservés :** aucune valeur 42 %, 7 jours ou Leçon 6 n'est codée en production ; elles n'apparaissaient que dans la maquette. Toutes les fonctions `commencer`, `suivreProchainPas`, `goLessons`, `lancerRevision` et `openExamens` sont celles de `v2`.

**Contrôle automatique :** `node --test test/accueil-v21.test.cjs` doit réussir pour les états invité, connecté, débutant, progression, fin de niveau et présence des assets WebP. Les tests automatisés ne remplacent pas une revue sur téléphone réel.
