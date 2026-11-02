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
- Fermer, Échap, bouton Retour Android, clic sur le fond ; restitution du focus au nouveau chevron. Le Retour passe par `navigation.js` (`wfNiveauxOuverts` / `wfFermerNiveaux`, voir § 11), plus seulement par le comportement natif du dialogue.
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

Aucun défilement vertical ni horizontal à ces tailles ; police ×1,3 : intervalles au minimum, toujours sans défilement à 360×640. 

## 10. SVG V4 et finitions (02/11/2026)

**Assets** : l'accueil utilise désormais les sources V4 fournies, sans modification : `public/art/watfir-logo-v4.svg` (viewBox 96×100) et `public/art/watfir-hero-v4.svg` (viewBox 864×265). Les anciens `watfir-mark.svg` / `watfir-hero.svg` sont retirés de `public/` (copies conservées dans `docs/watfir-2.2/assets/`). Références versionnées `?v=1`, CSS/JS en `watfir-v4-4` ; la copie hors ligne (service worker) reprend les nouveaux fichiers via le manifeste, qui liste `public/`.

- Logo : échelle uniforme 0,985 (94,6×98,5 px maquette), bandes calées sur la maquette (écart ≤ 2 px maquette).
- Hero : échelle uniforme 276/265 (900×276 px maquette), flèche alignée sur « Moien! » (x 738), bas du pont y 597. Aucun étirement (rapport largeur/hauteur testé).
- **Écarts propres aux sources V4** (non corrigés, les fichiers sont utilisés tels quels) : pas de liseré noir entre la tour et les bandes ; les bandes démarrent ≈ 25–30 px maquette plus à droite ; flèche ≈ 15 px plus courte.

**Progression** : `min-width` retiré du remplissage — 0 % n'affiche plus rien (largeur mesurée 0 px).

**Zones de toucher du header** : un seul `::after` de 48 px de haut par bouton, élargi jusqu'au milieu de l'espace voisin (variables `--cible-g` / `--cible-d`), jamais de chevauchement. Mesures (largeur × hauteur, px CSS) :

| Largeur | A1.1 | A1.2 | Chevron | Connexion | Réglages |
| --- | --- | --- | --- | --- | --- |
| 320 | 42×48 | 38×48 | 31×48 | 60×48 | 40×48 |
| 360 | 48×48 | 43×48 | 45×48 | 65×48 | 45×48 |
| 393 | 52×48 | 46×48 | 49×48 | 71×48 | 49×48 |
| 430 | 58×48 | 52×48 | 54×48 | 78×48 | 54×48 |

*(Tableau remplacé par celui du § 11.)*

Limite : sous 360 px, A1.2 et le chevron restent sous 44 px de large (l'espacement des pastilles de la maquette ne le permet pas sans chevauchement) ; tous dépassent le minimum WCAG 2.2 AA de 24 px. Header sur une ligne de 320 à 1920 px (≤ 340 px : écart minimal avant le filet réduit), deux lignes seulement avec police agrandie.

## 11. Finition finale avant gel (02/11/2026)

Passe guidée par le skill `apple-design` (Emil Kowalski) : retour d'appui immédiat, chemin d'entrée/sortie symétrique de la feuille, mouvement réduit, cohérence optique. Identité Watfir, SVG, palette, typographies, hero, CTA, textes et données inchangés.

**Pictogrammes** (`.ac-acces`) : une seule famille. Trait affiché = taille/24 × `stroke-width`, ramené à ≈ 5 px maquette pour les quatre (avant : 5,8 / 7,8 / 5,8 / 8,2).

| Raccourci | Taille (px maquette) | stroke-width | Trait affiché |
| --- | --- | --- | --- |
| S'entraîner | 58 | 2,2 | 5,3 |
| Examens | 68 (avant 78) | 1,9 | 5,4 |
| Erreurs | 58 | 2,05 | 5,0 |
| Jeux (cyan) | 66 (avant 82) | 1,8 | 4,9 |

Chaque pictogramme occupe 58 px de haut dans la mise en page (marges négatives) : libellés alignés au pixel. La manette, dessinée bas dans sa grille (y 9–19), remonte de 5,5 px maquette : les quatre centres optiques sont à 55–56 px du haut de la case (mesuré).

**Header** :
- Bloc compte `.wf-entete-compte` (filet, Connexion, réglages) : poussé à droite ; s'il ne tient plus (grande police), il passe à la ligne d'un seul tenant, à droite. `row-gap` de 24 px : les zones de toucher des deux rangées ne se recouvrent pas.
- Contour des pastilles dessiné par `::before` (et non `border`) : le `::after` de toucher se calcule depuis le bord extérieur, sans erreur d'arrondi (l'ancienne version se recouvrait de 0,7 à 1,4 px selon l'écran).
- Écart entre pastilles 14 (maquette 10) et marge avant le filet 14 (au lieu de 20) : même largeur totale à 360 px, différence visuelle ≈ 1 px.
- Repli ≤ 340 px : marque et compte en haut, niveaux sur leur propre rangée (écart 12 px). Hauteur du header 65 px à 320 px, accueil toujours sans défilement en 320×568.
- « Mode invité » : non agrandi. À 360 px, le header n'a plus que ≈ 1 px de marge ; toute hausse de taille ferait passer le bloc compte à la ligne ou réduirait les zones de toucher sous 44 px. Il reste à 9,3 px à 360 px (10,2 px à 393, 11,1 px à 430).

Zones de toucher mesurées (largeur × hauteur, px CSS, balayage `elementFromPoint`), aucun chevauchement à toutes les largeurs, invité et connecté :

| Largeur | A1.1 | A1.2 | Chevron | Connexion | Réglages | Header |
| --- | --- | --- | --- | --- | --- | --- |
| 320 | 54×48 | 47×48 | 46×48 | 57×48 | 44×48 | 2 rangées |
| 360 | 49×48 | 45×48 | 45×48 | 59×48 | 50×48 | 1 ligne |
| 393 | 53×48 | 49×48 | 49×48 | 64×48 | 54×48 | 1 ligne |
| 430 | 58×48 | 53×48 | 54×48 | 70×48 | 59×48 | 1 ligne |
| 1440 | 71×48 | 65×48 | 65×48 | 84×48 | 72×48 | 1 ligne |

**Interactions** :
- Connexion et réglages s'atténuent (opacité 0,6) dès le toucher, sans transition à l'appui, et reviennent en 150 ms. CTA, raccourcis et « Voir mon chemin » gardent l'effet commun SPEC 57 ; pastilles : réduction 0,97 (style.css).
- Feuille des niveaux : monte du bas et y redescend (240 ms, sans rebond), voile en fondu ; niveaux réduits à 0,97 à l'appui. `prefers-reduced-motion` : ni glissement ni transition.
- Bouton Retour du téléphone : la feuille est déclarée à `navigation.js` (`superpositionOuverte` / `fermerSuperposition`). Une garde d'historique est posée à l'ouverture et retirée à la fermeture (`programmerGarde`) : Retour ferme la feuille et reste sur l'accueil, y compris là où le dialogue natif ne réagit pas au Retour.
- Focus visible (contour cyan 3 px) vérifié au clavier sur les 11 boutons de l'accueil.

**CSS consolidé** : règle « connecté » `.puces-niveau + .ac-menu` supprimée (remplacée par le bloc compte), doublon `prefers-reduced-motion` de la barre retiré (déjà dans `accueil-v21.css`), surcharges ≤ 340 px remplacées par le repli. `justify-content:flex-start` explicite sur le header (style.css impose `space-between`). Versions `watfir-v4-5`.

**Tests** : `test/watfir-home.test.cjs` passe de 9 à 12 tests (bloc compte et repli, trait des pictogrammes, retour d'appui / Retour / mouvement réduit). Le test SVG accepte le noir `#080808` de la palette, introduit par la correction du hero (commit 26611e1) qui faisait échouer ce test.

## 12. Retour arrière ciblé

Si l'écran V4 échoue : retirer uniquement les liens `accueil-watfir.css` et `accueil-watfir.js` de `public/index.html`. Le rendu 2.1 reprend alors sans toucher au moteur, à la progression ni aux jeux. Ne jamais supprimer les clés de stockage.
