# Système d'interactions au survol — LuxApp / Watfir 2.2

**Date :** 2 novembre 2026 · **Mise à jour :** 3 novembre 2026 (six boutons avec appui 3D)
**Périmètre :** états repos / souris / appui tactile du CTA Watfir, plus survol du shell et des composants HTML. Aucune animation de gameplay, aucune modification des moteurs, de la progression ou des JSON.  
**Fichier actif :** `public/hover-interactions.css`, chargé **après** les styles d'écrans par `public/index.html`.

## 1. Intention et hiérarchie

L'accueil Watfir reste figé pour ses dimensions, sa grille, ses SVG et sa palette. Le CTA Commencer / Continuer conserve son relief physique au repos sur mobile et PC (tranche beige et lumière en `box-shadow`, hors flux). **Au survol souris, seule sa face crème s'éclaircit de `#fbebc5` à `#fff4da` : aucun soulèvement, renforcement de l'ombre, contour ou changement de chevron.** Le coin rouge/cyan reste identique ; au clic, la face s'enfonce de 6 px comme avant. La navigation secondaire se résume désormais à **Étudier (rouge assombri) et Jouer (bleu profond)**, deux boutons centrés. Leur survol PC éclaire uniquement la couleur de fond, sans déplacement ni changement d'ombre ; les niveaux restent rouges. Aucun glow permanent ni animation en boucle.

| Rôle | Interaction | Durée |
| --- | --- | --- |
| **CTA au repos (mobile et PC)** | Fond crème `#fbebc5` inchangé, tranche beige de **7 px** (`#aa8954`), ombre portée et reflet intérieur ; chevron éloigné du motif rouge/cyan | permanent |
| **CTA hover (souris)** | Face crème `#fbebc5` → `#fff4da` uniquement ; ni déplacement, ni nouvelle ombre, ni contour, ni recoloration du chevron ou des bandes | instantané |
| **CTA appuyé (tactile et souris)** | Enfoncement **6 px** et tranche abaissée à 1 px ; appui visible pendant 160 ms avant la navigation, sans contour coloré | 115 ms de transition + maintien 160 ms |
| **Étudier (repos)** | Bouton rouge `#d3232b`, texte/picto crème `#f7e9c2`, tranche rouge sombre `#861c18` de 5 px | permanent |
| **Jouer (repos)** | Bouton bleu profond `#087496`, texte/picto crème `#f7e9c2`, tranche bleu foncé `#054860` de 5 px | permanent |
| **Étudier / Jouer (survol PC)** | Éclaircissement simple de la face (rouge `#ed3640` / bleu `#0b8fb5`), **sans transform, filtre, filet ou changement d'ombre** | 170 ms |
| **Étudier / Jouer (appui)** | Enfoncement de 4 px ; tranche comprimée à 1 px, affichée 160 ms avant le sous-menu ou la navigation | 115 ms de transition + maintien 160 ms |
| **A1.1 / A1.2 / sélecteur (repos, mobile et PC)** | Tranche 3D de **2 à 4 px** proportionnelle à `--k`, beige foncé `#75644c` en inactif, rouge foncé `#991a17` pour le niveau actif. Bordure crème et dimensions inchangées | permanent |
| **Niveaux au survol (souris)** | Fond crème 20 % + contour doux en inactif ; niveau courant rouge `#F22421` → `#FF4038`. La tranche et sa couleur restent en place, même en clic maintenu | 160 ms |
| **Niveaux appuyés (tactile et souris)** | Les deux niveaux affichés et le chevron descendent de `--wf-pill-depth - 1px` (2–4 px moins 1) ; tranche comprimée à 1 px ; **maintien 160 ms avant sélection / ouverture du sheet**, même après un tap bref | 115 ms de transition + maintien 160 ms |
| **Réglages** | Rotation de 15° du pictogramme | 190 ms |
| **Connexion** | Soulignement rouge de 2 px | immédiat |
| **Contrôles 2.1 partagés** | Élévation neutre de 2 px + luminosité ×1,10, aucune nouvelle couleur métier | 190 ms |

Les deux pictogrammes de la navigation secondaire sont dessinés dans le même style de trait : **livre = Étudier**, **manette = Jouer**, tous deux crème dans tous les états. Le CTA « Commencer / Continuer » n'a plus de livre pour éviter le doublon ; il conserve son texte, sa cible, sa flèche noire et surtout les **mêmes bandes rouge/cyan (stops 51,6 / 31,8 × --k)**. Les couleurs métier (erreur, réussite, info) ne sont pas réinterprétées.

### Pastilles 3D du header

La règle `#view-dashboard .wf-accueil .puce-niv` s'applique **aux trois boutons du header** (`A1.1`, `A1.2` et `wf-niveau-ouvrir`). Le relief est une ombre externe, sans changement de `height`, `padding`, `border-radius`, `gap` ou position du groupe. La bordure crème demeure gérée par `::before`. L'élément `::after`, qui élargit les zones tactiles à 48 px, est **préservé** et ne doit jamais être utilisé pour le relief.

Les tokens `--wf-pill-depth`, `--wf-pill-side` et `--wf-pill-hover-outline` centralisent la tranche, sa couleur et le retour visuel souris. `:active` et **`.wf-pressing`** partagent exactement la même règle de compression : le clic rapide garde la pastille enfoncée **160 ms avant l'action**, comme le CTA principal et Étudier/Jouer. Les transitions physiques durent 115 ms. Le hover change uniquement la teinte de fond et l'outline via une variable : pas de nouveau `box-shadow` dans la feuille commune, car cela supprimerait la tranche. Sur `prefers-reduced-motion: reduce`, aucun déplacement ni délai de sélection n'a lieu, mais le retour visuel d'ombre reste disponible.

**Périmètre limité aux pastilles encadrées :** le logo, « Mode invité », « Connexion » et l'icône Réglages restent inchangés. L'objectif n'est pas de créer une rangée de boutons épais mais un relief discret cohérent avec le grand CTA.

### Enfoncement visible au clic — six boutons 3D de l'accueil

Le CSS `:active` seul ne suffit pas à montrer l'appui sur un clic rapide : `Commencer` et `Jouer` changent de vue immédiatement ; `Étudier` et le chevron ouvrent un dialogue ; `A1.1` / `A1.2` peuvent re-render l'accueil. `public/accueil-watfir.js` intercepte donc **seulement les clics utilisateur** (`isTrusted`), sur **les six boutons 3D**, par un écouteur `click` en **capture** sur `document`. L'état `.wf-pressing` garde le relief enfoncé pendant **160 ms**, puis le code appelle `button.click()` pour exécuter l'**action existante** et restitue la classe. Les clics de replay synthétiques (`isTrusted === false`) ne sont pas interceptés : aucune récursion. Les doubles activations pendant l'appui sont ignorées ; les boutons désactivés sont respectés. Le sélecteur de niveaux et les deux pastilles utilisent la **même mécanique**, sans changement de destination ou de code de progression.

L'appui réel au doigt/souris reste immédiatement perceptible par `:active`. La transition `transform` / `box-shadow` dure **115 ms** ; l'état persiste suffisamment après relâchement pour être visible avant changement d'écran. Les taps clavier (Entrée/Espace) bénéficient du même mécanisme. **`prefers-reduced-motion: reduce` : pas de maintien ni de délai de navigation**, et aucun déplacement CSS. Les appels programmatiques de l'application ne sont pas différés non plus.

Aucun moteur, aucun `onclick`, aucun état de progression n'est remplacé. Les bandes rouge/cyan du CTA ne sont jamais animées et le hover souris continue d'éclaircir seulement la face.

### Navigation secondaire et sous-menu Étudier

`public/accueil-watfir.js` surcouche uniquement les fonctions de présentation de `accueil-v21.js`. La grille est passée de quatre raccourcis + « Voir mon chemin » à deux boutons de largeur égale, centrés (`wf-choix-activite`) et sans surtitre. La grille verticale n'a plus que **cinq blocs réels** et cinq intervalles souples ; pas de ligne fantôme ni d'espace réservé à l'ancien lien.

**Étudier** ouvre un dialogue natif avec « Les leçons » (`goLessons`), « S’entraîner » (`openReviewSetup`), « Examens » (`openExamens`) et « Mes erreurs » (`startSession('errors')`). Le dialogue est accessible au clavier et à Retour Android via `wfEtudierOuvert` / `wfFermerEtudier` dans `navigation.js`, sur le même principe que le sélecteur de niveaux. **Jouer** utilise directement `ouvrirJeux()`. Aucune progression, clé de sauvegarde ni moteur n'a été modifié.

**CSS** : `accueil-watfir.css` gère dimensions, couleur, relief et pression (hors flux) ; `hover-interactions.css`, chargé en dernier, ne change que `background-color:var(--wf-face-hover)` sous `@media (hover:hover) and (pointer:fine)`. Le fond utilise un léger gradient de lumière constant, ce qui permet de **faire varier uniquement la couleur de base** par transition CSS. `prefers-reduced-motion: reduce` neutralise les déplacements tout en conservant la couleur et le retour d'appui.

**Référence normative pour les prochaines migrations : [BOUTONS-3D.md](BOUTONS-3D.md)** (tokens, épaisseurs par rôle, conventions de hover, press/replay, respect des cibles 48 px, cas limites Android et règles à ne pas propager dans les jeux). Le présent fichier reste centré sur les hovers et la compatibilité CSS du shell.

## 2. Recettes réutilisables

Toutes les transitions passent par les tokens CSS :

- `--ux-hover-duration: 190ms`
- `--ux-hover-easing: cubic-bezier(.22,1,.36,1)`
- `--ux-hover-wash: rgba(247,233,194,.17)` (filtres et autres états neutres)
- `--ux-hover-cyan-wash: rgba(2,197,231,.18)` (tuiles et raccourcis Watfir)
- `--ux-hover-cyan: #02c5e7` (filet, pictogramme, chevron)
- `--ux-hover-bright: #fff4da`
- `--ux-hover-red: #ff4038`

**Le contour animé rouge a été retiré à la demande**, sur PC comme sur mobile. Les pseudo-éléments `::before` et `::after` du CTA sont désactivés (`content:none`) ; aucune propriété CSS `--wf-cta-outline`, `@property`, `conic-gradient` ou `mask-composite` n'est utilisée pour ce bouton.

Sur PC, `:hover:not(:active)` change uniquement la variable `--wf-cta-cream`, utilisée pour la première couleur du dégradé : la face s'éclaircit sans modifier les deux bandes d'angle, le chevron noir, la position ni l'ombre. Sur Android et au clic souris, `:active` enfonce la face de 6 px ; le hover n'interfère pas avec l'appui. **Pas de rouge de survol** : les seules bandes rouge/cyan restent celles du coin inférieur droit.

Les tracés des bandes rouge/cyan du coin sont intacts ; seule la **marge droite du chevron** a été corrigée (de `-23 × --k` à `+24 × --k`, marge gauche maintenue à `16 × --k`) pour l'éloigner du motif, sans nouvelle largeur ni hauteur de CTA.

Pour les nouveaux écrans, adopter les classes **explicitement** :

| Classe | Utilisation | Enfant optionnel |
| --- | --- | --- |
| `.ux-hover-lift` | Action primaire **standard des écrans 2.1** : élévation neutre. **Ne pas** l'ajouter au CTA Watfir, qui possède son propre effet de bouton physique | `.ux-hover-arrow` (chevron) |
| `.ux-hover-tile` | Tuile neutre à hover cyan, sans valeur métier associée | `.ux-hover-glyph` (icône) |
| `.ux-hover-chip` | Filtre / niveau / pilule non destructive | Aucun |
| `.ux-hover-link` | Lien de navigation secondaire | `.ux-hover-arrow` |
| `.ux-hover-icon` | Bouton d'icône simple (réglages) | `.ux-hover-glyph` |

Exemple :

```html
<button class="ux-hover-lift pc-btn primary">
  Continuer <svg class="ux-hover-arrow" aria-hidden="true">…</svg>
</button>
<button class="ux-hover-tile" type="button">
  <svg class="ux-hover-glyph" aria-hidden="true">…</svg>
  <span>S'entraîner</span>
</button>
```

Ces classes sont **visuelles uniquement** : ni handler, ni route, ni sauvegarde. Elles s'appliquent à un véritable contrôle HTML accessible, et ne doivent pas être posées sur une carte purement décorative.

Les composants partagés existants `.pc-btn`, `.btn-jaune`, `.pc-chip`, `.pc-icon-btn`, `.back-btn`, `.exo-cta` et `.exo-secondaire` bénéficient déjà du feedback de base, **sans recoloration de leurs états métier**. Ne pas ajouter d'autres sélecteurs transverses sans recette ciblée. Les parcours de mini-jeux et les surfaces de choix de réponses ont leurs états propres et restent hors périmètre.

## 3. États et garde-fous

- `@media (hover:hover) and (pointer:fine)` : la souris et le trackpad uniquement. Aucun changement de disposition ou effet `:hover` sur un écran tactile standard.
- `:hover:not(:active)` : réservé aux déplacements de survol ; la couleur et le contour restent sur `:hover` **pendant le clic**. L'appui direct du CTA sur Android est spécifique Watfir et respecte l'intention de la **SPEC 57**.
- `:disabled` et `[aria-disabled=true]` : ne jamais animer un contrôle indisponible.
- `:focus-visible` : contour cyan de 3 px pour les classes réutilisables. L'accueil conserve ses règles de focus déjà validées.
- `prefers-reduced-motion: reduce` : les transitions et transformations de déplacement au survol sont neutralisées ; le changement de couleur instantané reste possible.
- **Le CTA Watfir est l'exception physique** : relief au repos via `box-shadow` (hors flux), survol crème `#fff4da` sans translation ni nouvelle ombre, appui de +6 px. Pas de filtre `brightness`, de liseré rouge, de glow ou d'animation infinie. La marge du chevron évite l'intersection avec l'angle bicolore ; aucune nouvelle dimension de grille.
- Les couleurs sémantiques de réussite, erreur, information ou interdiction demeurent celles des composants métiers, jamais remplacées par le rouge/cyan de marque.

**Règle de cascade :** `hover-interactions.css` est chargé en dernier dans le `<head>`. `accueil-watfir.js` ne change que la présentation et les destinations accessibles depuis le menu ; `components.css`, `style.css`, les JSON et les moteurs restent inchangés.

## 4. Adoption progressive dans l'application

1. **Lot présent :** accueil Watfir complet, plus feedback neutre sur composants HTML partagés de la version 2.1.
2. **Lots suivants :** ajouter les classes opt-in à la navigation du Chemin, aux présentations de leçon et aux écrans de choix après audit du DOM, un écran à la fois.
3. **Jeux :** ne pas appliquer par défaut ces classes aux contrôles de gameplay, déplacements, chronomètres ou sélecteurs de réponses notées. Un hover de jeu doit être conçu spécifiquement et testé sur la mécanique.
4. **Validation à chaque lot :** captures au repos (strictement identiques), captures souris au survol, tabulation/focus, disabled, touch Android, `prefers-reduced-motion`, titres longs et absence de défilement supplémentaire.

## 5. Vérification et recette

Contrats automatisables : `node --test test/watfir-hover.test.cjs` et `node --test test/watfir-home.test.cjs` (maintien 160 ms sur les **six contrôles**, double clic, mouvement réduit, sélection A1.2, ouverture du chevron et replay de l'action d'origine). Le test vérifie les imports versionnés, le gating souris, les états disabled/active et le mouvement réduit, ainsi que le crème normal `#fbebc5` / survol `#fff4da` **sans mouvement ni variation d'ombre**. Il protège également le relief au repos, l'enfoncement au clic, les bandes d'angle, le chevron, les trois pastilles 3D du header et les **deux boutons Étudier/Jouer** au hover.

**Avant validation finale**, faire sur Chromium/PC : capture survol CTA, A1.2, Étudier et Jouer, Connexion et roue ; puis test du dialogue Étudier ; comparer avec le repos. Vérifier aussi le press/relâchement, navigation clavier et un viewport mobile tactile simulé. La recette sur smartphone physique et le rendu réel après déploiement restent distincts d'une inspection statique du CSS.

## 6. Rollback sans perte de données

Pour revenir à la barre de quatre raccourcis : restaurer les surcouches `accesHtml` et `carteSuiteHtml` précédentes dans `public/accueil-watfir.js`, la grille/raccourcis dans `public/accueil-watfir.css`, et les hovers de la barre dans `public/hover-interactions.css` ; retirer les deux hooks Étudier de `navigation.js`, puis incrémenter les caches CSS/JS dans `index.html`. La restauration ciblée ne touche ni la progression ni les moteurs. Pour revenir au CTA plat, son relief doit être modifié séparément dans `accueil-watfir.css`.
