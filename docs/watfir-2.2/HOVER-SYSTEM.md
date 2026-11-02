# Système d'interactions au survol — LuxApp / Watfir 2.2

**Date :** 2 novembre 2026  
**Périmètre :** états repos / souris / appui tactile du CTA Watfir, plus survol du shell et des composants HTML. Aucune animation de gameplay, aucune modification des moteurs, de la progression ou des JSON.  
**Fichier actif :** `public/hover-interactions.css`, chargé **après** les styles d'écrans par `public/index.html`.

## 1. Intention et hiérarchie

L'accueil Watfir reste figé pour ses dimensions, sa grille, ses SVG et sa palette. **Exception demandée et validée : le CTA Commencer / Continuer gagne un véritable relief physique au repos sur mobile et PC**, car la carte plate manquait de caractère cliquable. La tranche beige et la lumière sont **des box-shadows, hors flux**. Le hover de ce CTA ne passe plus au doré : il soulève la face de 2 px et dessine un filet rouge, sans altérer le fond crème ni les bandes bicolores. Les raccourcis restent cyan au survol, les niveaux rouges. Aucun glow permanent ni animation en boucle.

| Rôle | Interaction | Durée |
| --- | --- | --- |
| **CTA au repos (mobile et PC)** | Fond crème `#fbebc5` inchangé, tranche beige de **7 px** (`#aa8954`), ombre portée et reflet intérieur ; chevron éloigné du motif rouge/cyan | permanent |
| **CTA hover (souris)** | Léger soulèvement **2 px**, filet rouge de 2 px tracé par `conic-gradient`, chevron rouge ; couleur et contour **restent actifs pendant `:active`** | contour 260 ms |
| **CTA appuyé (tactile et souris)** | Enfoncement **6 px** et tranche abaissée à 1 px, contour rouge maintenu ; retour naturel au relâchement | 160 ms |
| **Choix secondaire (raccourcis)** | Fond **cyan 18 %**, filet cyan intérieur 2 px, pictogramme crème → cyan et remontée limitée à 2 px ; les quatre cellules réagissent pareil | 175 ms |
| **Niveau inactif** | Fond crème 20 % + contour très léger | 160 ms |
| **Niveau courant** | Rouge `#F22421` → `#FF4038` | 160 ms |
| **Lien de chemin** | Soulignement crème et chevron **cyan** +6 px, sans fond ni déplacement du bloc | 190 ms |
| **Réglages** | Rotation de 15° du pictogramme | 190 ms |
| **Connexion** | Soulignement rouge de 2 px | immédiat |
| **Contrôles 2.1 partagés** | Élévation neutre de 2 px + luminosité ×1,10, aucune nouvelle couleur métier | 190 ms |

La convention iconographique est explicite : **les quatre pictogrammes de l'accueil, y compris Jeux, sont crème au repos et cyan au survol souris**. Le cyan reste réservé aux bandes graphiques, aux états de hover, au focus accessible et aux accents réellement utiles. Les couleurs métier (erreur, réussite, info) ne sont pas réinterprétées.

## 2. Recettes réutilisables

Toutes les transitions passent par les tokens CSS :

- `--ux-hover-duration: 190ms`
- `--ux-hover-easing: cubic-bezier(.22,1,.36,1)`
- `--ux-hover-wash: rgba(247,233,194,.17)` (filtres et autres états neutres)
- `--ux-hover-cyan-wash: rgba(2,197,231,.18)` (tuiles et raccourcis Watfir)
- `--ux-hover-cyan: #02c5e7` (filet, pictogramme, chevron)
- `--ux-hover-bright: #fff4da`
- `--ux-hover-red: #ff4038`

Le CTA utilise `@property --wf-cta-outline` (type `<angle>`, **`inherits:true`**). Le `::after` de la face réutilise la valeur interpolée pour dessiner un bord rouge progressif avec `conic-gradient` et `mask-composite:exclude`. La cible est **359° et non 360°**, pour éviter qu'un navigateur normalise la valeur finale à 0°. Le `::after` est non interactif (`pointer-events:none`) ; le vrai bouton garde le clic. Sans support du tracé CSS, la face 3D et la pression restent fonctionnelles.

**Règle importante : ne pas utiliser `:hover:not(:active)` pour la couleur / le contour d'action.** Le contour doit persister pendant le maintien du clic. `:hover:not(:active)` peut toutefois décrire la **seule élévation** : lors de `:active`, la face s'enfonce. Sur écran tactile, seule la pression (`:active`) déclenche l'animation physique et le liseré, sans état hover bloqué.

Les tracés des bandes rouge/cyan du coin sont intacts ; seule la **marge droite du chevron** a été corrigée (de `-23 × --k` à `+24 × --k`, marge gauche de `16` à `8 × --k`) pour l'éloigner du motif, sans nouvelle largeur ni hauteur de CTA.

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
- **Le CTA Watfir est l'exception physique** : relief au repos via box-shadow (sans hauteur ajoutée), survol de -2 px, appui de +6 px ; pas de `filter`, de glow néon ni d'animation infinie. La marge du seul chevron a été corrigée pour éviter l'intersection avec l'angle bicolore ; aucune nouvelle dimension de grille.
- Les couleurs sémantiques de réussite, erreur, information ou interdiction demeurent celles des composants métiers, jamais remplacées par le rouge/cyan de marque.

**Règle de cascade :** `hover-interactions.css` est chargé en dernier dans le `<head>`. L'intégration n'exige pas de modifier `accueil-watfir.js`, `components.css`, `style.css` ou les moteurs.

## 4. Adoption progressive dans l'application

1. **Lot présent :** accueil Watfir complet, plus feedback neutre sur composants HTML partagés de la version 2.1.
2. **Lots suivants :** ajouter les classes opt-in à la navigation du Chemin, aux présentations de leçon et aux écrans de choix après audit du DOM, un écran à la fois.
3. **Jeux :** ne pas appliquer par défaut ces classes aux contrôles de gameplay, déplacements, chronomètres ou sélecteurs de réponses notées. Un hover de jeu doit être conçu spécifiquement et testé sur la mécanique.
4. **Validation à chaque lot :** captures au repos (strictement identiques), captures souris au survol, tabulation/focus, disabled, touch Android, `prefers-reduced-motion`, titres longs et absence de défilement supplémentaire.

## 5. Vérification et recette

Contrat automatisable : `node --test test/watfir-hover.test.cjs`. Il vérifie les imports, les règles partagées, le gating desktop, les états disabled/active, le reduced motion, le CTA 3D au repos, l'enfoncement au clic, le contour rouge pendant `:active`, les bandes d'angle inchangées, le chevron repositionné, les quatre raccourcis cyan au hover et l'icône Jeux crème au repos.

**Avant validation finale**, faire sur Chromium/PC : capture survol CTA, A1.2, S'entraîner, Jeux, Voir mon chemin, Connexion et roue ; comparer avec le repos. Vérifier aussi le press/relâchement, navigation clavier et un viewport mobile tactile simulé. La recette sur smartphone physique et le rendu réel après déploiement restent distincts d'une inspection statique du CSS.

## 6. Rollback sans perte de données

Pour revenir au CTA plat, restaurer **uniquement la règle CTA et la position du chevron** dans `public/accueil-watfir.css`, puis la section CTA de `public/hover-interactions.css` (avec les versions de cache correspondantes dans `index.html`). Retirer seulement le lien hover désactive les hovers, mais **ne supprime pas le relief permanent** ; ce n'est donc pas un rollback complet. Aucun stockage utilisateur n'est affecté.
