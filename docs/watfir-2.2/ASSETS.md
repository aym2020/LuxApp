# Inventaire et utilisation des assets Watfir 2.2

## 1. Niveau de confiance

Les assets de **ce répertoire `docs/`** sont des sources de conception. Deux copies optimisées sont **désormais intégrées dans `public/art/watfir-mark.svg` et `public/art/watfir-hero.svg`** sur `2.2` ; les autres restent documentaires. Ils constituent une **première reconstruction vectorielle originale** de la V4 approuvée comme direction, pas une vectorisation identique de la capture.

| Asset | Type | Usage | Statut |
| --- | --- | --- | --- |
| [`watfir-mark.svg`](assets/watfir-mark.svg) | SVG compact | Emblème de marque, app icon de travail | Prototype |
| [`watfir-hero.svg`](assets/watfir-hero.svg) | SVG 400×160 | Illustration du hero : bandes 7 u, pont à trois arches, tour élancée (redessiné le 02/11/2026) | Actif dans `public/art`, à valider Samsung |
| [`watfir-stripes.svg`](assets/watfir-stripes.svg) | SVG motif | Bandes identitaires autonomes | Prototype |
| [`watfir-palette.svg`](assets/watfir-palette.svg) | SVG planche | Contrôle visuel des tokens | Documentaire |
| [`niveaux-sheet.svg`](assets/niveaux-sheet.svg) | SVG schéma | Sélecteur V4 et feuille de choix | Documentaire |
| [`watfir-tokens.css`](assets/watfir-tokens.css) | CSS | Tokens expérimentation, **non importés** | Documentaire |

## 2. Référence visuelle vs source déployable

La **référence visuelle V4** est le mockup généré dans la conversation, avec le menu chevron ajouté à V3 et le reste volontairement conservé. Il ne prouve ni le rendu à 320px, ni la justesse des dimensions CSS, ni le comportement tactile. Pour une véritable reprise de pixel matching, joindre/exporter la capture PNG originale dans le pipeline d'implémentation et documenter dimensions + provenance. Aucun fichier du dossier `assets` ne doit être présenté comme « asset officiel » sans revue produit.

## 3. Règles de fabrication

- **Emblème** : rendre à 24/32/48/96 px, silhouette reconnaissable sans mot.
- **Hero** : utiliser SVG directement dans l'HTML ou comme `<img>` avec `alt` adapté au sens ; décorations pures `aria-hidden="true"`.
- **Motif** : ne pas dupliquer les bandes dans les composants secondaires ; éviter répétition décorative.
- **Couleurs** : consommer les variables sémantiques CSS pour la vraie UI, pas recopier les codes sur chaque élément.
- **Rasters** : si des images de référence sont exportées, créer une version haute définition d'archive et un aperçu WebP optimisé ; jamais intégrer une capture entière comme interface cliquable.
- **Fonts** : `public/fonts/dm-serif-display-latin-400-italic.woff2` (DM Serif Display italique, SIL OFL 1.1, licence `DM-SERIF-DISPLAY-OFL.txt`) pour « Watfir » et « Moien! » uniquement. Le reste de l'interface garde Inter.
- **Originalité** : s'inspirer des règles historiques (courbes, géométrie, composition typographique) ; ne pas réutiliser les logos de villes ou marques de tiers.

## 4. Critères de promotion en production

Revue des tracés SVG, poids final, vue miniature/retina, contrastes, alternative accessible, compatibilité iOS/Android, responsive, tests visuels, approbation explicite. Tant que ces points ne sont pas cochés dans [RECETTE.md](RECETTE.md), garder les fichiers sous `docs/`.

## 5. Éléments à exclure

Les prototypes détaillés de Spuerkeess (façade à nombreuses fenêtres / coucher de soleil), le logo touristique illustré avec soleil géant et les versions à bordures de CTA tricolores épaisses **ne sont pas des éléments retenus de la V4**. Ils ne sont pas copiés ici pour éviter de créer deux directions concurrentes.
