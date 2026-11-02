# Système d'interactions au survol — LuxApp / Watfir 2.2

**Date :** 2 novembre 2026  
**Périmètre :** état souris du shell et des composants HTML. Aucune animation de gameplay, aucune modification des moteurs, de la progression ou des JSON.  
**Fichier actif :** `public/hover-interactions.css`, chargé **après** les styles d'écrans par `public/index.html`.

## 1. Intention et hiérarchie

L'accueil Watfir reste gelé **au repos** : mêmes dimensions, même grille, mêmes SVG et même palette. La première version des hovers, essentiellement crème/grise, manquait d'identité et le CTA relevé de 3 px avec des ombres paraissait flotter. La variante validée adopte **le cyan pour les quatre raccourcis**, **un crème doré pour Commencer / Continuer** et **le rouge pour les niveaux**. Sur PC, le survol doit se percevoir immédiatement sans glow néon, rebond ni mouvement automatique.

| Rôle | Interaction | Durée |
| --- | --- | --- |
| **Action primaire** | Fond crème `#FB EBC5` (sans espace : `#fbebc5`) → **crème doré `#ffe0aa`** ; chevron noir → rouge Watfir ; **aucun déplacement, aucun glow ou ombre** ; bandes d'angle préservées | 175 ms |
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
- `--ux-hover-cta-gold: #ffe0aa` (hover de la surface crème)
- `--ux-hover-bright: #fff4da`
- `--ux-hover-red: #ff4038`

Le CTA utilise `@property --wf-cta-surface` (type `<color>`) : seul le premier aplat du `linear-gradient(135deg, ...)` est animé ; les deux bandes d'angle restent sur les mêmes stops et aux mêmes couleurs. Sans support de `@property`, l'état doré reste utilisable mais la transition peut être instantanée. **Aucune propriété `transform`, `filter` ou `box-shadow` nouvelle ne s'applique au hover du CTA.**

Pour les nouveaux écrans, adopter les classes **explicitement** :

| Classe | Utilisation | Enfant optionnel |
| --- | --- | --- |
| `.ux-hover-lift` | Action primaire **standard des écrans 2.1** : élévation neutre. L'accueil Watfir utilise une recette dorée dédiée, sans élévation | `.ux-hover-arrow` (chevron) |
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
- `:hover:not(:active)` : ne pas concurrencer les états `:active` de la **SPEC 57**. L'appui reste immédiat et prédictible.
- `:disabled` et `[aria-disabled=true]` : ne jamais animer un contrôle indisponible.
- `:focus-visible` : contour cyan de 3 px pour les classes réutilisables. L'accueil conserve ses règles de focus déjà validées.
- `prefers-reduced-motion: reduce` : les transitions et transformations de déplacement au survol sont neutralisées ; le changement de couleur instantané reste possible.
- `transform` / `filter` sont limités aux états secondaires ; **le CTA Watfir ne monte plus**. Pas de modification `width`, `height`, `padding`, `margin`, `grid` ou `position`. Pas de secousse du hero, animation infinie ou effet VHS.
- Les couleurs sémantiques de réussite, erreur, information ou interdiction demeurent celles des composants métiers, jamais remplacées par le rouge/cyan de marque.

**Règle de cascade :** `hover-interactions.css` est chargé en dernier dans le `<head>`. L'intégration n'exige pas de modifier `accueil-watfir.js`, `components.css`, `style.css` ou les moteurs.

## 4. Adoption progressive dans l'application

1. **Lot présent :** accueil Watfir complet, plus feedback neutre sur composants HTML partagés de la version 2.1.
2. **Lots suivants :** ajouter les classes opt-in à la navigation du Chemin, aux présentations de leçon et aux écrans de choix après audit du DOM, un écran à la fois.
3. **Jeux :** ne pas appliquer par défaut ces classes aux contrôles de gameplay, déplacements, chronomètres ou sélecteurs de réponses notées. Un hover de jeu doit être conçu spécifiquement et testé sur la mécanique.
4. **Validation à chaque lot :** captures au repos (strictement identiques), captures souris au survol, tabulation/focus, disabled, touch Android, `prefers-reduced-motion`, titres longs et absence de défilement supplémentaire.

## 5. Vérification et recette

Contrat automatisable : `node --test test/watfir-hover.test.cjs`. Il vérifie les imports, les règles partagées, le gating desktop, les états disabled/active, le reduced motion, le CTA crème doré sans élévation, les bandes d'angle inchangées, les quatre raccourcis cyan au hover et l'icône Jeux crème au repos.

**Avant validation finale**, faire sur Chromium/PC : capture survol CTA, A1.2, S'entraîner, Jeux, Voir mon chemin, Connexion et roue ; comparer avec le repos. Vérifier aussi le press/relâchement, navigation clavier et un viewport mobile tactile simulé. La recette sur smartphone physique et le rendu réel après déploiement restent distincts d'une inspection statique du CSS.

## 6. Rollback sans perte de données

Retirer uniquement `<link rel="stylesheet" href="hover-interactions.css?...">` dans `public/index.html` ; le système d'appui et la présentation Watfir précédents reprennent. La couleur de l'icône Jeux redevient cyan si le fichier entier est retiré. Aucun stockage utilisateur n'est affecté.
