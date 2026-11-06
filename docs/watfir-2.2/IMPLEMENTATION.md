# Watfir V4 — implémentation effective sur `2.2`

**Date :** 2 novembre 2026  
**Statut (02/11/2026) :** **accueil Watfir V2.2 terminé et gelé** (§ 12). Recette Chromium complète effectuée ; aucun défaut bloquant constaté. Contrôle sur le Samsung physique non effectué par l'agent (voir § 12, « Non vérifié »).

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

- Toutes les mesures CSS viennent de la maquette : une seule unité `--k = min(100vw, var(--layout-shell, 640px)) / 941` (520 px jusqu'au 05/11/2026). `calc(54 * var(--k))` = 54 px de la maquette. L'accueil garde les proportions de la maquette de 320 à 640 px, centré au-delà, comme les autres pages.
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
- *(Remplacé par § 12 : repli < 360 px, « Mode invité » agrandi.)* Repli ≤ 340 px : marque et compte en haut, niveaux sur leur propre rangée (écart 12 px). Hauteur du header 65 px à 320 px, accueil toujours sans défilement en 320×568.
- « Mode invité » : non agrandi. À 360 px, le header n'a plus que ≈ 1 px de marge ; toute hausse de taille ferait passer le bloc compte à la ligne ou réduirait les zones de toucher sous 44 px. Il reste à 9,3 px à 360 px (10,2 px à 393, 11,1 px à 430).

Zones de toucher mesurées (largeur × hauteur, px CSS, balayage `elementFromPoint`), aucun chevauchement à toutes les largeurs, invité et connecté *(valeurs à jour au § 12)* :

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

## 12. Recette finale et gel de l'accueil (02/11/2026)

### Statut : accueil Watfir V2.2 terminé — gelé

Tests concluants, aucun défaut bloquant constaté en Chromium. **Règle à partir de maintenant : aucune modification esthétique de l'accueil sans défaut concret identifié** (mesure ou capture qui le reproduit). L'étape suivante est l'harmonisation des autres écrans de LuxApp.

**Figés :** les deux SVG (`watfir-logo-v4.svg`, `watfir-hero-v4.svg`), le monument et ses bandes rouge/cyan, typographies, palette et « Moien! », dimensions et style du CTA, composition générale et intervalles verticaux, les quatre pictogrammes (manette Jeux comprise), le style de « Voir mon chemin », la barre de progression (0 % = vide).

### Défauts reproduits et corrections

Chaque correction n'agit que là où le défaut est mesuré. À 100 % de police, la différence pixel avant/après se limite au bloc « Mode invité / Connexion » du header (360–1440 px ; état connecté : aucun pixel changé) ; seul le header à 320 px change (repli, voir ci-dessous).

| Défaut mesuré (avant) | Correction |
| --- | --- |
| « Mode invité » à 9 px (320), 9,3 px (360), 10,2 px (393) ; « Connexion » à 10–10,7 px | `max(11px, …)` et `max(11.5px, …)`. Au-delà de 425 px, les proportions de la maquette donnent déjà plus. Le point « · » est retiré : les deux mots sont empilés, il ne séparait plus rien, et sa place (≈ 6 px) sert au texte agrandi. |
| Ligne unique à 360 px : ≈ 1 px de marge ; le texte agrandi la ferait passer à la ligne | 360–389 px : la roue se rapproche de 33 à 21 px maquette (zone de toucher 45 px, au lieu de 50). La ligne unique tient de 360 à 1920 px (marge restante 1,1 px à 360, 0,8 px à 393). |
| < 360 px : A1.2 47 px, chevron 46 px, roue 44 px | Repli dès 359 px (au lieu de 340) : marque et compte en haut, niveaux dessous, écart 16 px. Toutes les zones ≥ 48 px de large. |
| Police Android agrandie (zoom Chrome) : zones chevron/Connexion superposées (0,9 px à 200 %, jusqu'à 38 px avec le nouveau repli) | Repli : 24 px entre rangées ; zones des niveaux 12 px au-dessus de la pastille, le reste dessous. Plus aucun chevauchement de 114 % à 200 %. |
| Grande police : surtitre « Le luxembourgeois, pas à pas » coupé à droite | Passe à la ligne (`white-space:normal`). |
| Zoom Chrome 200 % sur 320/360 px : haut de l'accueil (« Watfir ») coupé, impossible à atteindre en défilant | `align-content:safe center` : si le contenu dépasse, il défile au lieu d'être coupé en haut. |
| Texte ×2 : « 0 jours » et « Série actuelle » sortent de l'écran ; dès ×1,75 les libellés des raccourcis se superposent | Série et légendes passent à la ligne ; libellés : 6 px de débord permis de chaque côté, puis retour à la ligne plutôt que superposition. |
| Connecté : la roue seule gardait la zone réduite du mode invité | Zone étendue dans l'espace libre (54 px à 360). |

### Mesures après correction (Chromium, invité sauf mention)

Zones de toucher réelles (balayage `elementFromPoint`, px CSS), puis **vrai toucher** (`touchscreen.tap`) à 2 px de chaque bord de chaque zone : le bon bouton répond partout, et aucun voisin ne capte la surface visible d'un bouton. Aucun chevauchement de zones.

| Largeur | A1.1 | A1.2 | Chevron | Connexion | Réglages | Header |
| --- | --- | --- | --- | --- | --- | --- |
| 320 | 56×49 | 51×49 | 50×49 | 61×48 | 51×48 | 2 rangées |
| 360 | 49×48 | 45×48 | 45×48 | 63×48 | 45×48 (connecté 54) | 1 ligne |
| 393 | 53×48 | 49×48 | 50×48 | 63×48 | 54×48 | 1 ligne |
| 430 | 58×48 | 53×48 | 54×48 | 69×48 | 59×48 | 1 ligne |
| 1440 | 71×48 | 65×48 | 65×48 | 84×48 | 72×48 | 1 ligne |

À 360 px, A1.2, chevron et roue restent à 45 px de large : la ligne unique de la maquette ne laisse pas plus (48 px imposeraient deux rangées sur le Samsung). C'est au-dessus des 44 px Apple / WCAG AAA, sous l'objectif Android de 48.

Espaces (intervalles header→hero, hero→progression, progression→CTA, CTA→raccourcis, raccourcis→chemin ; libre sous « Voir mon chemin ») — aucun défilement, aucun débordement horizontal, aucun bloc superposé, aucun libellé hors de sa case, invité comme connecté :

| Écran | Intervalles (px) | Libre en bas |
| --- | --- | --- |
| 320×568 | 30 · 25 · 23 · 21 · 13 | 21 |
| 360×593 (Brave Samsung) | 36 · 30 · 28 · 26 · 16 | 25 |
| 360×640 | 44 · 38 · 36 · 34 · 24 | 33 |
| 393×760 | 60 · 54 · 50 · 42 · 39 | 49 |
| 393×850 | 67 · 71 · 50 · 42 · 50 | 81 |
| 430×932 | 73 · 78 · 55 · 46 · 55 | 92 |
| 1440×900 | 62 · 53 · 51 · 47 · 39 | 46 |

Titre de leçon long : deux lignes, sans défilement (360 et 393). Progression réelle (fonctions de l'app) : 13 %, « Continuer ».

**Police Android agrandie — deux modèles testés.** Chrome Android (depuis M113) applique la taille de police du système comme un *zoom de page* : la largeur CSS diminue (360 px à 130 % → 277 px). L'accueil étant proportionnel à la largeur (`--k`), il garde la même taille physique et passe au header en deux rangées. Mesuré de 114 % à 200 % sur 320, 360 et 393 : rien de coupé ni superposé ; défilement de secours de 14 à 82 px seulement à 175–200 % sur 320/360. Les navigateurs qui agrandissent seulement le texte ont été simulés (chaque texte × 1,15 à × 2) : sans défilement jusqu'à × 1,3 ; × 1,5 à 360 : 18 px de défilement ; × 2 : défilement, tout reste visible sauf le « ! » de « Moien! », rogné de 3 px (titre figé).

Niveaux et navigation (Chromium, toucher simulé, 320 et 360) : A1.1 → A1.2 → A1.1 garde les progressions (13 % / 0 % / 13 %) ; seules `luxNiveau` et `luxChoix` changent dans le stockage, aucune clé de progression. Choix dans la feuille, rechargement : A1.2 conservé. Feuille fermée par Fermer, voile, Échap et Retour (`history.back()`) : on reste sur l'accueil, focus rendu au chevron, garde d'historique retirée. Destinations des raccourcis, du CTA, de la roue et de Connexion inchangées.

### Tests

- `node --test test/watfir-home.test.cjs` : 14/14 (2 nouveaux tests et 2 mis à jour ; les nouveaux contrôles échouent sur l'ancien code).
- `node --test test/*.cjs` : 320/325 ; les 5 échecs (79, 92, 223–225) existaient avant cette passe.
- `bash tools/critique.sh` : 22 échecs, les 21 de la référence plus `test_actualisation`. Ce test est instable sur les deux versions (relancé seul : référence 1 échec sur 3, après 2 sur 3, toujours à la même étape, la sortie de l'app par Retour depuis l'accueil). Cette passe ne touche ni l'historique ni la navigation.

### Non vérifié

- **Samsung physique** : aucun contrôle sur l'appareil. Toutes les mesures viennent de Chromium (émulation mobile et toucher simulé), pas de Brave Android, de l'app installée, de la gestuelle Retour, de TalkBack ni du vrai réglage de police Samsung.
- Marge de la ligne unique à 360 px : 1,1 px. Avec une police de remplacement (Inter non chargée), le texte est plus étroit. Si le header passait à la ligne sur l'appareil, le bloc compte irait d'un seul tenant sous la ligne, sans chevauchement ; à signaler avec une capture.
- Connexion réelle (Firebase) : état connecté simulé en masquant le lien invité.

## 13. Retour arrière ciblé

Si l'écran V4 échoue : retirer uniquement les liens `accueil-watfir.css` et `accueil-watfir.js` de `public/index.html`. Le rendu 2.1 reprend alors sans toucher au moteur, à la progression ni aux jeux. Ne jamais supprimer les clés de stockage.


## 14. Refonte validée du bas de l'accueil — Étudier / Jouer (03/11/2026)

**Décision UI :** remplacer les quatre tuiles `S'entraîner / Examens / Erreurs / Jeux` et le lien `Voir mon chemin` par **deux boutons de poids égal, centrés**, sans surtitre. Un bouton **Étudier** rouge profond (`#d3232b`), un bouton **Jouer** bleu profond (`#087496`), tous deux avec pictogramme et texte crème `#f7e9c2`. Relief physique de 5 px et enfoncement de 4 px sur mobile/PC. **Hover PC : seule la couleur de la face s'éclaircit** (rouge `#ed3640`, bleu `#0b8fb5`) ; ni mouvement, ni contour, ni glow, ni modification de l'ombre.

**CTA principal :** suppression du livre injecté par la surcouche V21 `carteSuiteHtml`, sans toucher à la génération de l'action ou du libellé du moteur. Le bouton conserve le chevron noir et son relief de 7 px. Les stops du coin **rouge/cyan** demeurent `51.6 * --k` et `31.8 * --k`, avec exactement les couleurs `--wf-red` / `--wf-cyan` de l'original. Aucune modification des largeurs relatives du motif.

**Parcours :**
- **Jouer** : action `ouvrirJeux()` existante, sans intermédiaire ;
- **Étudier** : bottom sheet natif accessible (`<dialog>`) avec `Les leçons → goLessons()`, `S'entraîner → openReviewSetup()`, `Examens → openExamens()`, `Mes erreurs → startSession('errors')`. Tous les parcours anciennement visibles restent donc disponibles. Échap, bouton de fermeture et Retour Android ferment le sheet ; la garde d'historique réutilise `programmerGarde`.

**Intégration sans régression :** `public/accueil-watfir.js` surcharge uniquement `carteSuiteHtml` et `accesHtml` après V21 ; aucun changement du moteur de progression, des JSON, des leçons, des routes des jeux ou des clés de stockage. `public/accueil-watfir.css` passe la grille de **six blocs à cinq**, enlève la ligne vide de l'ancien `Voir mon chemin` et adopte des surfaces 3D compactes à hauteur minimale 76 px. `public/hover-interactions.css` conserve sa place après les styles d'écran ; les anciens hovers cyan de la barre à quatre cellules ont été supprimés. `public/navigation.js` intègre seulement les deux hooks de fermeture du nouveau dialogue. Les versions CSS/JS de `index.html` ont été incrémentées.

**Validation disponible :** contrats `test/watfir-home.test.cjs` et `test/watfir-hover.test.cjs` adaptés, 26/26 assertions réussies dans le harnais JS de contrôle des sources GitHub. Vérification des sélecteurs, transitions, cinq rangées de contenu, URLs de cache et routes conservées. **Non validé dans cette livraison :** capture Chromium du site complet après intégration, tactile Samsung physique, zoom 200 % et restauration d'historique sur navigateur mobile réel. Ces tests d'acceptation restent à effectuer avant de qualifier définitivement la version.

**Rollback ciblé :** restaurer les sections du CTA/actions de `accueil-watfir.js` et la grille/action de `accueil-watfir.css`, les hover de `hover-interactions.css`, les deux hooks `wfEtudier*` de `navigation.js`, ainsi que les versions de cache dans `index.html`. Ne pas changer `accueil-v21.js`, les moteurs ou la progression.
 

## 15. Appui 3D perceptible avant navigation — trois boutons (03/11/2026)

**Problème concret :** les styles CSS `:active` étaient bien présents, mais le clic déclenchait aussitôt une nouvelle vue (`Commencer`, `Jouer`) ou la feuille native (`Étudier`). Sur les taps rapides, l'utilisateur ne voyait pas la profondeur s'enfoncer avant le changement d'écran.

**Correction ciblée :** les trois boutons partagent désormais un écouteur délégué `click` en phase capture dans `public/accueil-watfir.js`. Pour un clic humain (`event.isTrusted`), celui-ci empêche provisoirement le comportement de navigation, ajoute `.wf-pressing`, puis après **160 ms** retire la classe et appelle `button.click()`. Le replay programmatique (`isTrusted === false`) déclenche **exactement le `onclick` préexistant** ou le gestionnaire délégué Étudier sans être intercepté de nouveau. Une activation déjà en cours empêche la double navigation. Aucun `onclick` n'est remplacé, aucune fonction d'exercice ni de stockage modifiée.

**Rendu :** `:active` et `.wf-pressing` partagent la même compression visuelle : **6 px** sur Commencer, **4 px** sur Étudier/Jouer, transition `transform/box-shadow` de **115 ms**. L'appui s'affiche immédiatement sous le doigt ou la souris, demeure visible après relâchement, puis la destination est ouverte. Sur PC, le hover conserve uniquement son éclaircissement de couleur ; les bandes d'angle rouge/cyan du CTA et leurs stops demeurent inchangés.

**Accessibilité et cas limites :** clic Entrée/Espace pris en charge, double tap bloqué pendant les 160 ms, composants `disabled` et `aria-disabled` respectés. `prefers-reduced-motion: reduce` désactive le déplacement et le délai ; les clics programmatiques ne sont jamais ralentis. Bouton retiré du DOM pendant le délai : le replay est abandonné pour éviter une activation obsolète.

**Recette automatisée :** `test/watfir-home.test.cjs` couvre la durée, le maintien de classe, les trois sélecteurs, le double tap, le mouvement réduit, le clic programmatique et le bouton désactivé ; `test/watfir-hover.test.cjs` conserve le contrôle des bandes et des hovers. **29/29 assertions passent dans le harnais JS exécutant les sources GitHub.** Contrôles d'acceptation à réaliser sur Samsung et sur navigateur desktop réel : impression tactile et latence subjective, deux activations rapides, Retour Android après ouverture du sous-menu.


## 16. Harmonisation des trois pastilles 3D du header (03/11/2026)

**Périmètre :** les deux niveaux visibles (`A1.1` / `A1.2` aujourd'hui, puis toute autre famille réellement disponible) et le chevron « Choisir un niveau ». Ces trois boutons avaient déjà une tranche physique de **2–4 px**, mais la sélection d'un autre niveau re-rend immédiatement l'accueil, tandis que le chevron affiche aussitôt sa feuille : un tap court n'avait pas le temps de montrer l'enfoncement.

**Correction :** le sélecteur délégué en capture de `public/accueil-watfir.js` comprend désormais `#view-dashboard .wf-accueil .puces-niveau .puce-niv` en plus des trois CTA. Le `click` humain reçoit `.wf-pressing` pendant **160 ms**, puis son `button.click()` synthétique réexécute l'action existante (sélection si le niveau diffère, ou ouverture du dialogue). L'état `:active` reste instantané au contact. Un clic de niveau déjà actif est également pressé sans modifier la progression.

**CSS :** l'appui de `.puce-niv.wf-pressing` et `:active` est exactement le même : translation `calc(var(--wf-pill-depth) - 1px)`, ombre latérale comprimée à 1 px, transition **115 ms**. La feuille de niveaux, le filet crème `::before`, la cible 48 px `::after`, les états `aria-pressed`, les couleurs et les dimensions du header ne changent pas. En mouvement réduit, aucun déplacement ni délai ; le retour d'ombre reste possible.

**Design system :** [BOUTONS-3D.md](BOUTONS-3D.md) est la référence pour les nouvelles vues. [CHARTE-DA.md](CHARTE-DA.md) décrit désormais la composition active à deux boutons Étudier/Jouer et les six boutons physiques ; [HOVER-SYSTEM.md](HOVER-SYSTEM.md) conserve le contrat de hover. **Le système ne doit pas être propagé automatiquement aux réponses notées ou aux contrôles de gameplay.**

**Recette de contrat :** `test/watfir-home.test.cjs` vérifie l'appui et le replay sur **six** types de boutons, y compris la sélection de `A1.2`, l'absence de changement pour `A1.1` déjà actif, la feuille de niveaux, le double clic et le mouvement réduit. `test/watfir-hover.test.cjs` protège les tranches, les hovers et les états CSS. **30/30 tests de contrat réussis dans le harnais JS fondé sur les fichiers GitHub.** Non validé ici : rendu et timing sur Samsung physique ou vrai Chromium connecté au site déployé.

**Retour arrière ciblé :** retirer seulement `.puces-niveau .puce-niv` de la liste des sélecteurs en capture, le sélecteur `.puce-niv.wf-pressing` des états CSS, les tests correspondants et actualiser les versions CSS/JS. Les fonctions `changerNiveauAccueil` et `ouvrirNiveaux` ne doivent pas être modifiées.


## 17. Correctifs de l'audit UI de l'accueil (04/11/2026)

**Origine :** audit de l'accueil 2.2 (commit `a1cf16c`) dans Chromium, avec mesures réelles, axe-core 4.10 et contrôle WCAG 2.2. Le gel autorise ces changements : chaque point est un défaut mesuré (contraste, règle de la charte, accessibilité), pas un changement esthétique. Aucune nouvelle page, feuille ou fonctionnalité n'est créée.

| # | Défaut mesuré | Correction |
| --- | --- | --- |
| 1 | Niveau actif crème sur `#f22421` : **3,44:1** (A1.1 à 12 px, feuille à 16 px) ; survol `#ff4038` : 2,88:1 | Face `--wf-red-texte` `#c81e1b` (**4,75:1**) pour le niveau actif du header et de la feuille. Le survol ne change plus la face, seulement le contour. `--wf-red` reste sur les bandes, le « ! » et la barre |
| 2 | Kicker et « TA PROGRESSION » à 9–10,7 px, accroche 10,5 px, légendes 10,2–11,5 px, titre/étape du CTA 9,8–11,6 px, niveaux 10,9 px (sous 360 px) | Plancher `max(12px, …)` sur ces textes (charte § 3). Au-delà de ~400 px de large, la taille de la maquette est déjà plus grande : rien ne change |
| 3 | Bouton invité : on voit « Connexion », il est lu « Mode invité : se connecter » (WCAG 2.5.3) | `aria-label="Connexion, mode invité"` |
| 4 | `aria-controls` d'Étudier vise `wf-etudier-dialog` avant sa création (axe : `aria-valid-attr-value`) | Attribut ajouté seulement quand la feuille existe (à l'ouverture, puis aux rendus suivants). La feuille n'est pas créée à l'avance |
| 5 | PC : côtés `#0f0e0c` autour de la colonne `#080808` (faux panneau) | `body:has(#view-dashboard.active) { background:#080808; }` |
| 6 | Étudier/Jouer à 18 px sous 338 px de large : 4,3:1 et 4,4:1, sous le seuil de 4,5:1 des textes normaux | Libellé `clamp(19px, …)` : grand texte WCAG, 3:1 suffit |

**Mesures après correction (Chromium, invité) :** aucun défilement ni débordement à 320×568, 360×640, 360×780, 393×852, 412×915, 430×932 et 1440×900. Place libre en bas : 24 px (320×568, au lieu de 28), 43 px (360×640, au lieu de 45). Zones de toucher inchangées. axe-core : 0 violation sur l'accueil, la feuille Étudier et la feuille des niveaux (avant : 2 contrastes et un `aria-controls` invalide). Feuille Étudier : focus sur « Les leçons », Retour la ferme et rend le focus. Commencer ouvre sa destination en ~220 ms. Accroche des habitués et titre long : deux lignes à 320 px, sans défilement. Textes encore sous 12 px : « Lëtzebuergesch » (9–11,4 px) et « Mode invité / Connexion » (11–11,7 px), exceptions documentées dans la charte.

**Non corrigé volontairement :** `theme-color` reste `#0f0e0c`, couleur de fond des autres écrans ; la passer à `#080808` déplacerait l'écart vers ces écrans. À revoir lors de leur harmonisation. Focus perdu (sur `body`) après un choix dans la feuille Étudier : comportement de navigation commun à l'app, hors périmètre.

**Tests :** `test/watfir-home.test.cjs` + `test/watfir-hover.test.cjs` : 32/32, dont 2 nouveaux tests qui échouent sur l'ancien code. `node --test test/*.cjs` : 338/343, les 5 échecs (79, 92, 223–225) existaient déjà. Non vérifié : Samsung physique, Brave Android, TalkBack, commande vocale réelle.

**Retour arrière ciblé :** remettre `background:var(--wf-red)` sur les deux niveaux actifs et le survol `--ux-hover-red`, retirer les `max(12px, …)`, l'`aria-label` et l'`aria-controls` conditionnel, la règle `body:has(...)`, puis actualiser les versions de cache.

## 18. Icône, logo, hero V5 et appui du CTA (05/11/2026)

Dégel ciblé demandé par Clayton : seuls l'icône, le logo, le hero et l'animation d'appui changent.

- **Icône PWA, favicon et icône Apple** : l'emblème du header, centré sur fond noir avec les bandes prolongées (`any` au liseré crème, `maskable` à fond plein dans la zone sûre, Apple 180 px, favicon 16/32/48), avec bandes épaissies et monument agrandi pour l'impact à petite taille. `manifest.json` en `?v=5`. Sources : `docs/watfir-2.2/assets/watfir-icon-app*.svg` (la proposition 2 dessinée à part, utilisée quelques heures, est remplacée : un seul dessin du monument dans l'app).
- **Logo du header** : emblème 80×100 repris du monument de l'icône (tour, flèche, bandes derrière la tour, pont à trois arches) ; marque aérée (plus de marges négatives, sous-titre crème atténué). Largeur de la marque inchangée.
- **Appui des boutons 3D** : déplacement de la face et tranche sur la même courbe ; le bas de Commencer, Étudier et Jouer reste immobile pendant l'appui.
- **Hero V5** : le monument n'apparaît plus qu'une fois (dans le logo). Le hero = surtitre, « Moien! » en grand avec un bouton rond cyan **Écouter** (`jouerAudio('moien.mp3', this)`, son LOD, jamais lu automatiquement), puis les deux rubans signature en SVG inline qui partent du bord gauche et remontent vers la droite (`.wf-hero-rubans`, viewBox 941×98 rogné au ras des rubans, bord à bord), puis « **Bonjour**, ton premier mot. Une nouvelle langue commence ici. » (utilisateur régulier : « **Bonjour** ! Prêt pour quelques minutes de Lëtzebuergesch ? »). `watfir-hero-v4.svg` est archivé dans `docs/watfir-2.2/assets/`.
- **Vérifié** : `node --test test/watfir-home.test.cjs test/watfir-hover.test.cjs` (32/32) ; rendu Chromium 412, 360 et 320 px sans défilement horizontal ; bouton Écouter ≥ 44 px, clic → `/audio/moien.mp3`, aucune erreur JS. **À vérifier** : rendu et son sur le Samsung.
- **Retour arrière** : revenir sur les commits `feat(watfir)` / `fix(watfir)` du 05/11/2026 sur `2.2`.
- **Survols PC (05/11/2026)** : Connexion passe au cyan (fin du soulignement rouge), roue des réglages en quart de tour cyan avec rebond, bouton Écouter éclairci. `hover-interactions.css?v=watfir-hover-9`. Appui Commencer / Étudier / Jouer revérifié sur PC (1440 px, souris) : bas immobile (7 px / 5 px) pendant tout l'appui ; un bas qui remonte venait d'une version précédente encore en cache (service worker : la mise à jour s'applique au lancement suivant ou via « Mettre à jour »).
- **Appui en « animations réduites » (05/11/2026)** : sur un PC/téléphone où le système demande de réduire les animations (`prefers-reduced-motion: reduce`), Commencer, Étudier/Jouer et les pastilles annulaient la descente de la face mais écrasaient la tranche : le bas remontait et disparaissait. Désormais l'appui y est instantané et complet (face descendue, bas fixe), sans animation. Pastilles : face et tranche sur la même courbe (fin d'un léger rebond). Mesuré au pixel sur Chromium 1440 px, dans les deux modes.
- **Largeur PC (05/11/2026)** : l'accueil était une colonne de 520 px alors que toutes les autres pages (Leçons, S'entraîner, Examens…) font 640 px (`--layout-shell`). `--k` est désormais plafonné par `--layout-shell` : même largeur partout sur PC, proportions identiques (tout est 23 % plus grand qu'avant sur PC). Mobile inchangé. Contrepartie : sous ~850 px de hauteur utile (portable 1366×768), l'accueil défile d'environ 70 px pour atteindre Étudier / Jouer, comme les autres pages qui défilent déjà.
- **Un seul rouge et un seul bleu (06/11/2026)** : Étudier passe de `#d3232b` au rouge vif des rubans `#f22421` (tranche `#8f1712`, survol `#ff2f2a` pour rester ≥ 3:1) ; Jouer passe de `#087496` au cyan `#02c5e7` du bouton Écouter (tranche `#087496`, survol `#3fd6f0`, texte et picto noirs, 9,7:1) ; la pastille de niveau actif passe de `--wf-red-texte` à `--wf-red`. Écart d'accessibilité assumé : crème sur `#f22421` = 3,44:1 sur la pastille de 14 px (sous 4,5:1). `accueil-watfir.css?v=watfir-v4-19`. Vérifié : couleurs calculées dans Chromium, tests Watfir 32/32.



## 19. Portail de bienvenue Watfir — affiche rétro sans slogan (06/11/2026)

**Demande validée :** supprimer la carte « Moien! » et le son doublon, abandonner les trois étapes classiques et les paragraphes marketing, puis reprendre le concept « Affiche rétro » **sans le slogan** du dessus. Il ne reste que le très grand wordmark `Watfir`, les deux rubans marque rouge/cyan, la signature `Lëtzebuergesch` et trois CTA : `Commencer` / `Créer un compte` / `Se connecter`.

**Implémentation :** `public/portail.js` ne change que la branche `mode === 'welcome'` de `portailContenu`; le code de connexion/inscription, la persistance locale, la notice invitée SPEC 76, les garde-fous Firebase et les destinations de `portailAction` sont maintenus. L'ancienne carte à retourner, les icônes des bénéfices et l'audio restent dans le module comme fonctions non utilisées, sans être injectés dans le nouvel écran. Aucun changement de l'accueil principal.

**Style :** nouvelle feuille `public/portail-watfir.css`, chargée après les styles existants dans `index.html`, ciblant exclusivement `#portail-auth .wf-portail-bienvenue`. Fond noir, Fraunces auto-hébergée, wordmark crème, deux rubans SVG inline, centrage mobile, colonne 640 px au maximum sur PC, boutons accessibles et défilement de secours sur petit écran. Aucun pseudo-hero avec monument ni reproduction du `Moien!` de l'accueil. `Commencer` a une face crème, un coin rouge/cyan et une tranche 3D beige de 6 px. `Créer un compte` est sombre et bordé de crème, `Se connecter` textuel. Hover PC limité à l'éclaircissement ; appui du bouton primaire maintenu 160 ms avant l'entrée utilisateur (`wf-pressing` et replay de l'ancien clic). Mouvement réduit : appui physique instantané, sans attente.

**Cache :** `portail-watfir.css?v=wf-poster-1` et `portail.js?v=wf-poster-1` dans `public/index.html`.

**Tests ciblés :** `test/watfir-portail.test.cjs`, neuf scénarios : absence de slogan/gimmicks, bonne présence du logotype et des bandes, trois routes, absence cloud, formulaires inchangés, entrée invité avec notice déjà lue, état 3D 160 ms, double clic/mouvement réduit et sélecteurs CSS isolés. **9/9 réussis dans le harnais JavaScript exécutant le code actuel GitHub.** Impossible d'exécuter la commande réelle `node --test` depuis la session de livraison : le container de test ne peut pas résoudre `github.com`. Recette visuelle Android/PC et inscription Firebase réelle **non effectuées** ici.

**Documentation de référence :** [PORTAIL-BIENVENUE.md](PORTAIL-BIENVENUE.md), [CHARTE-DA.md](CHARTE-DA.md) § 6.8 et [README.md](README.md). **Rollback :** restaurer la branche `welcome` de `portailContenu`, retirer la feuille CSS dédiée et l'écouteur `portailInstallerAppuiBienvenue`, puis actualiser le cache. Les formulaires et la progression n'ont pas à être touchés.


## 20. Harmonisation finale des CTA crème et de l'inscription (06/11/2026)

**Demande :** conserver les **rubans rouge/cyan du grand visuel de marque** (portail et hero « Moien! »), retirer uniquement les bandes d'angle des boutons « Commencer » pour éviter deux variantes incohérentes, puis donner un véritable relief 3D à « Créer un compte » sur la première page. Les rubans SVG, le logo, les couleurs des jeux et les actions ne changent pas.

**Code livré :**
- `public/portail-watfir.css` : `Commencer` passe d'un `linear-gradient` crème/rouge/cyan à **`background:var(--wf-p-cta-face)`**, crème uni. `Créer un compte` prend une face sombre `#11100e`, bord crème `#c3b08b`, tranche beige foncé `#796646` de **6 px** et enfoncement de **5 px**. Les deux grands CTA partagent **70 px de hauteur minimale et 17 px de rayon**, réduits uniformément à 64 px sous 360 px. Leurs hovers n'éclaircissent que la face ; le lien « Se connecter » reste secondaire.
- `public/portail.js` : le même écouteur `click` capturant cible aussi `.wf-portail-creer`. Le maintien de l'enfoncement pendant **160 ms** précède le `button.click()` d'origine pour les actions `guest` et `signup`. Clic programmatique, `disabled` et mouvement réduit : aucun délai. Aucune modification des formulaires.
- `public/accueil-watfir.css` : le CTA `Commencer/Continuer` devient **crème uni** avec `background:var(--wf-cta-cream)` ; relief beige 7 px, appui 6 px, chevron et géométrie inchangés. **Les rubans SVG du hero restent intacts**, et Étudier/Jouer ne changent pas.
- `public/index.html` : cache-busters `accueil-watfir.css?v=watfir-v4-20`, `portail-watfir.css?v=wf-poster-3`, `portail.js?v=wf-poster-2`.

**Règle de DA :** bandes rouge/cyan = **illustration et identité** (hero, marque), **jamais coins de CTA crème**. La hiérarchie passe par le contraste des faces, les tranches 3D et les libellés, pas par la répétition de rubans décoratifs sur chaque bouton. La différence de hauteur du CTA de l'accueil est fonctionnelle : il contient les informations de leçon, à l'inverse de l'entrée du portail.

**Tests :** les trois fichiers `test/watfir-portail.test.cjs`, `test/watfir-home.test.cjs` et `test/watfir-hover.test.cjs` ont été exécutés dans le harnais JS alimenté par les sources GitHub : **44 tests de contrat réussis**. Ils couvrent présence des rubans, absence de coin bicolore sur les CTA, géométrie et pression des deux boutons du portail, routes préservées, et non-régression des six boutons de l'accueil. **Non validé ici :** captures Chromium et tests tactiles Samsung du site déployé. Ne pas considérer ces tests statiques comme une recette visuelle complète.

**Rollback ciblé :** restaurer les deux règles de background des CTA crème et l'ancienne règle sombre plate de `portail-watfir.css`, revenir au sélecteur de clic limité au seul `wf-portail-demarrer` dans `portail.js`, puis actualiser les versions de cache `index.html`. Les rubans, le logo, le moteur pédagogique et la progression n'ont jamais été modifiés.
