# Watfir V4 — implémentation effective sur `2.2`

**Date :** 2 novembre 2026  
**Statut :** accueil codé et chargé, tests de logique ciblés effectués, **capture navigateur / Android Samsung encore nécessaires**.

## 1. Base de travail

La branche `2.2` a été dérivée de `2.1`. Tous les fichiers des leçons, du parcours, du moteur des exercices, des examens, des jeux, de Firebase, de la PWA et des sauvegardes sont conservés. Aucun changement n'a été poussé sur `main` ou `2.1`.

## 2. Fichiers de production

| Chemin | Rôle |
| --- | --- |
| `public/accueil-watfir.js` | Surcouche de rendu V4 chargée **après** `accueil-v21.js` : entête « Watfir », hero SVG, titre « Ta progression », placement du bilan, niveau actif + voisin, panneau natif de sélection |
| `public/accueil-watfir.css` | Styles scoppés à `#view-dashboard .wf-accueil` et à `.wf-niveaux-dialog`, avec ajustements 320/360/393/430px |
| `public/art/watfir-mark.svg` | Emblème architectural crème avec bandes rouge/cyan |
| `public/art/watfir-hero.svg` | Tour, trois arches et bandes géométriques, **sans soleil** ni photographie |
| `public/index.html` | Deux inclusions versionnées, placées après les surcouches 2.1 existantes |
| `test/watfir-home.test.cjs` | Contrats d'affichage, changement de niveau, modal et import des surcouches |

Les sources supplémentaires dans `docs/watfir-2.2/assets/` servent à retravailler le dessin. La capture générée V4 n'est pas utilisée comme image d'interface : les textes et contrôles sont de véritables éléments HTML.

## 3. Conservation des comportements de 2.1

- **Progression :** `progressionNiveau(niveauActif)` et `serieActuelle()` restent la source ; le faux 6 % du mockup n'est pas codé.
- **Reprise :** `carteSuiteHtml()` et ses actions utilisent toujours `prochainPas()`, `commencer()` et `suivreProchainPas()` ; le titre de leçon a maintenant une hauteur adaptative, sans troncature obligatoire.
- **Niveaux :** les options proviennent de `niveauxDisponibles()`, elles sont regroupées par famille ; la sélection appelle `changerNiveauAccueil()`, puis le mécanisme de choix `choisirNiveau()` de 2.1. La persistance `luxChoix`/`luxNiveau` et les stats restent inchangées.
- **Authentification / synchro :** `ligneCompteHtml()` conditionne le lien invité ; la roue utilise `etatSynchro()` et garde `.ac-sync-slot`.
- **Navigation :** les raccourcis et `Voir mon chemin` sont produits par la V2.1 existante ; aucune route ni destination modifiée.
- **Écrans et jeux hors accueil :** restent sous leurs feuilles et moteurs antérieurs.

## 4. Comportement du menu de niveau

- Boutons directs : niveau actif et, si disponible, autre sous-niveau de la famille courante (maximum deux visibles).
- Flèche : ouvre `<dialog>` natif en panneau bas, listes A1/A2/B1… alimentées par les niveaux réels.
- Fermer, Échap, bouton Retour Android (comportement natif du dialogue), clic sur le fond ; restitution du focus au nouveau chevron.
- Si une famille n'a qu'un niveau, une seule puce est visible. Si elle en a plus de deux, l'actif et son plus proche voisin restent visibles.
- Les niveaux absents des leçons ne sont jamais proposés ni acceptés.

## 5. Vérifications effectuées

Une validation JavaScript de la surcouche a été exécutée dans l'environnement d'édition : **parsing, génération du header A1, rendu de A2.2, présence du hero et de « Ta progression », appel à la fonction de changement de niveau 2.1, équilibre des blocs CSS et présence des imports HTML**.

Le test `node --test test/watfir-home.test.cjs` a été ajouté au dépôt comme contrat automatisable. **Son exécution Node complète et celle du navigateur/Playwright ne sont pas attestées ici** (pas de checkout GitHub réseau dans l'environnement d'édition). Ne pas déclarer la V4 « vérifiée Android » sans capture, tests et accord utilisateur.

## 6. Vérifications restant à faire

1. Tester l'URL réellement déployée de `2.2` sur un smartphone Samsung à largeur effective 393px, puis à 320/360/430px.
2. Vérifier les hauteurs, retours/scroll, menu avec de nombreux niveaux et longues traductions.
3. Contrôler le clavier et TalkBack dans le dialogue ; comportement du Retour Android réel et focus.
4. Tester profil invité vierge et compte synchronisé, niveau terminé, absence de reprise.
5. Exécuter `node --test test/watfir-home.test.cjs` + la suite critique 2.1, comparer les échecs préexistants.
6. Reproduire la capture réelle pour comparaison avec la V4 approuvée et ajuster exclusivement les styles d'accueil.

## 7. Reproduction de la maquette V4 (02/11/2026)

La maquette de référence (image 941×1672, conversation du 02/11) est désormais reproduite à l'échelle. Un premier correctif du même jour, fait sans la maquette, est remplacé.

**Méthode**

- Toutes les mesures CSS viennent de la maquette : une seule unité `--k = min(100vw, 520px) / 941`. `calc(54 * var(--k))` = 54 px de la maquette. L'accueil garde les proportions de la maquette de 320 à 520 px, centré au-delà.
- Positions vérifiées par superposition : rendu à 941 px avec `--k:1px`, boîtes d'encre comparées à la maquette (écart ≤ 5 px maquette, soit ≤ 2 px réels à 360 px, sauf glyphes propres aux polices).

**Éléments**

- Header sur une ligne : emblème, « Watfir » (Fraunces 900 italique), « Lëtzebuergesch » (Roboto Condensed), A1.1/A1.2/chevron, filet, « Mode invité · Connexion », réglages. Zones de toucher agrandies par `::after` (~44 px de haut) ; repli sur deux lignes si la police système grandit.
- « Moien! » : Playfair Display 800 italique, point rouge.
- `public/art/watfir-hero.svg` en coordonnées de la maquette (viewBox `38 322 870 276`) : bandes de 21 px qui se croisent dans le virage, coupe en biais à gauche, église à flèche et trois fenêtres détachée par un liseré noir, toit en long, pont à culée arrondie et trois arches. `watfir-mark.svg` redessiné de même.
- Progression : « 6% » sans espace, filet vertical, flamme rouge, barre épaisse ; CTA crème avec coin rouge/cyan à 45° (dégradé à arêtes nettes) ; raccourcis aux colonnes de la maquette ; « Voir mon chemin » centré.
- Polices auto-hébergées sous licence OFL (`public/fonts/`), préchargées.

**Mesures Chromium (invité, leçon 0)** : contenu de 450 px à 320×568, 501 px à 360×593 (Brave Samsung : plus aucun défilement, contre 118 px avant), 545 px à 393×760, 594 px à 430×932. Aucun débordement horizontal ; police ×1,3 : header sur deux lignes, défilement naturel.

**Écarts assumés** : textes de 9 à 12 px à 360 px (proportions de la maquette, sous la règle « ≥ 12 px » de la charte) ; pastilles de niveau visuellement de 23 px (zone de toucher agrandie) ; la barre de progression suit la vraie valeur (la maquette exagère 6 %). **Validation Samsung réelle encore nécessaire.**

## 8. Tirer pour actualiser (02/11/2026)

`public/actualiser.js` + `actualiser.css`. L'app installée (PWA standalone) n'a pas le geste natif d'Android, et sur l'accueil le défilement interne (`#view-dashboard`) le bloquait aussi dans le navigateur.

- En haut d'une page, tirer vers le bas : un rond crème descend, devient rouge au seuil (70 px), relâcher recharge l'app. Une nouvelle version déjà téléchargée est activée avant le rechargement.
- Accueil : toujours. Autres pages (chemin, leçon, jeux, examens, Plus, réglages, lexique, pièges, S'entraîner) : seulement dans l'app installée, le navigateur ayant déjà son geste.
- Jamais pendant un exercice, une mission, un examen, une découverte ou un jeu, ni avec une feuille ou un panneau ouvert, ni si la page n'est pas tout en haut.
- Après le rechargement, `navigation.js` (spec 44) rouvre le même écran (vérifié en Chromium sur 8 écrans).
- L'écouteur `touchmove` non passif n'existe que pendant le geste.
- Tests : `test/actualiser.test.cjs` ; gestes simulés en Chromium (accueil, chemin, jeux, exercice, mission, petit geste, glissé horizontal, page défilée). **À valider sur Samsung, app installée et Brave.**

## 9. Répartition verticale (02/11/2026)

`--k` (largeur / 941) ne règle plus que les **dimensions** ; la **hauteur** est gérée par une grille sur `#accueil` :

- six blocs en lignes `max-content` (header, hero, progression, CTA, raccourcis, « Voir mon chemin ») — jamais écrasés ;
- six intervalles `minmax(min, max)` en unités `--k` : min = espacement serré (≈ 0,8 × maquette), max = respiration maximale (hero et zone sous les bandes plus généreux) ;
- la grille fait au moins la hauteur utile (`#view-dashboard` = 100dvh, barres du navigateur déduites) ; l'espace libre est réparti à parts égales entre les intervalles jusqu'à leur plafond, le reste éventuel centre la composition (PC) ;
- `.ac-v21-actions` en `display:contents` pour séparer raccourcis et « Voir mon chemin » ; marges verticales des blocs supprimées.

Mesures Chromium (invité, leçon 0) — hauteur utile / contenu / écarts header→hero, hero→progression, progression→CTA, CTA→raccourcis, raccourcis→chemin / bas :

| Écran | Avant | Après |
| --- | --- | --- |
| 360×593 (Brave Samsung) | 593 / 491 / 25·15·15·12·2 / vide 92 | 593 / 557 / 36·30·28·26·16 / 25 |
| 360×640 | vide 139 | 640 / 597 / 44·38·36·34·24 / 33 |
| 393×760 | vide 215 | 760 / 700 / 60·54·50·42·39 / 49 |
| 393×850 | vide 305 | 850 / 736 / 67·71·50·42·50 / 81 |
| 430×932 | vide 338 | 932 / 801 / 73·78·55·46·55 / 92 |
| 1440×900 | vide 187 | 900 / 839 / 62·53·51·47·39 / 46 |
| 1920×1080 | vide 367 | 1080 / 958 / 88·94·66·55·66 / 92 |

Aucun défilement vertical ni horizontal à ces tailles ; police ×1,3 : intervalles au minimum, toujours sans défilement à 360×640. Les nouveaux SVG `watfir_hero_v4.svg` / `watfir_logo_v4.svg` annoncés n'ont pas encore été fournis : les assets actuels restent en place.

## 10. Retour arrière ciblé

Si l'écran V4 échoue : retirer uniquement les liens `accueil-watfir.css` et `accueil-watfir.js` de `public/index.html`. Le rendu 2.1 reprend alors sans toucher au moteur, à la progression ni aux jeux. Ne jamais supprimer les clés de stockage.
