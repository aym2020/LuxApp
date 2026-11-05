# Inventaire et utilisation des assets Watfir 2.2

## 1. Niveau de confiance

Les assets de **ce répertoire `docs/`** sont des sources de conception. Deux copies optimisées sont **désormais intégrées dans `public/art/watfir-mark.svg` et `public/art/watfir-hero.svg`** sur `2.2` ; les autres restent documentaires. Ils constituent une **première reconstruction vectorielle originale** de la V4 approuvée comme direction, pas une vectorisation identique de la capture.

| Asset | Type | Usage | Statut |
| --- | --- | --- | --- |
| [`watfir-logo-v4.svg`](../../public/art/watfir-logo-v4.svg) | SVG 96×100 | Logo du header (source V4 fournie, utilisée telle quelle) | Actif |
| [`watfir-header-concept-02.svg`](assets/watfir-header-concept-02.svg) | SVG vectoriel 1320×470 | **Variante 02** du logo horizontal pour un éventuel futur header, inspirée du concept généré (tour, rubans rouge/cyan et wordmark) | **Proposition, non intégrée** |
| [`watfir-icon-concept-02.svg`](assets/watfir-icon-concept-02.svg) | SVG vectoriel 1200×1200 | **Proposition 02 redessinée depuis la capture validée** : cadre crème arrondi, fond noir, rubans cyan/rouge en S et monument à trois arches | **Proposition, non intégrée** |
| [`watfir-mark.svg`](assets/watfir-mark.svg) | SVG 80×96 | Ancien emblème (coordonnées maquette) | Archivé |
| [`watfir-hero-v4.svg`](../../public/art/watfir-hero-v4.svg) | SVG 864×265 | Hero V5 (05/11/2026) : monument repris de l'icône de l'app (flèche, tour, toiture), trois arches identiques, rubans droits au niveau de la tour | Actif |
| [`watfir-hero.svg`](assets/watfir-hero.svg) | SVG 870×276 | Ancien hero (coordonnées maquette) | Archivé |
| [`watfir-stripes.svg`](assets/watfir-stripes.svg) | SVG motif | Bandes identitaires autonomes | Prototype |
| [`watfir-palette.svg`](assets/watfir-palette.svg) | SVG planche | Contrôle visuel des tokens | Documentaire |
| [`niveaux-sheet.svg`](assets/niveaux-sheet.svg) | SVG schéma | Sélecteur V4 et feuille de choix | Documentaire |
| [`watfir-tokens.css`](assets/watfir-tokens.css) | CSS | Tokens expérimentation, **non importés** | Documentaire |

### Variante 02 — correction des arches (04/11/2026)

Les SVG `watfir-header-concept-02.svg` et `watfir-icon-concept-02.svg` ont été **redessinés suite au défaut visible sur la référence** : l'arche gauche n'était pas nette et les bandes placées à l'arrière traversaient les évidements. Les **trois arches disposent désormais de la même géométrie** (largeur 94 unités, couronne y=338, ressort y=385), avec un **fond noir propre derrière la façade**, tandis que les bandes rouge et cyan restent distinctes de la maçonnerie. Les fenêtres, la toiture, la flèche et la courbure des rubans sont de vrais tracés vectoriels.

Les fichiers du dossier de conception restent **des propositions non actives** ; le manifest PWA, les icônes Android installées et le logo du header ne sont pas remplacés.

### Variante 02 — portée et provenance (04/11/2026)

La **deuxième proposition graphique générée dans la conversation était une image PNG**, pas un fichier vectoriel natif. Le logo horizontal reste une réinterprétation vectorielle éditable. **L'icône carrée a été redessinée depuis la capture de référence explicite du 04/11/2026**, en paths SVG sans raster incorporé (rubans, tour, arches et cadre), puis son rendu a été vérifié à **1024 px et 96 px**. Il s'agit d'une reproduction vectorielle approximative fidèle aux formes, et non d'un calque pixel à pixel. Leur typographie utilise des polices de repli ; il faudra vérifier le rendu au format réel du header et, si la direction est retenue, figer la police ou convertir la signature typographique en tracés.

**Ne pas confondre les supports** :
- Logo du header : `public/art/watfir-logo-v4.svg` (actif), non remplacé.
- Icône installée sur Android/PWA (**active depuis le 05/11/2026 sur `2.2`**) : PNG sous `public/icons/` déclarés dans `public/manifest.json` (`?v=3`).
  - `icon-192.png` / `icon-512.png` (`any`) : export de [`watfir-icon-app.svg`](assets/watfir-icon-app.svg), proposition 2 validée avec l'arche gauche rendue symétrique (cadre crème, coins transparents).
  - `icon-maskable-192.png` / `icon-maskable-512.png` : export de [`watfir-icon-app-maskable.svg`](assets/watfir-icon-app-maskable.svg) — fond noir plein, sans cadre, dessin réduit dans la zone sûre de 80 %, rubans gauches prolongés jusqu'au bord. C'est cette variante qu'Android affiche.
  - Export : `rsvg-convert -w 512 -h 512 <svg> -o <png>`.
- Le favicon et l'icône Apple (`public/index.html`) **n'ont pas été modifiés**.

## 2. Référence visuelle vs source déployable

La **référence visuelle V4** est le mockup généré dans la conversation, avec le menu chevron ajouté à V3 et le reste volontairement conservé. Il ne prouve ni le rendu à 320px, ni la justesse des dimensions CSS, ni le comportement tactile. Pour une véritable reprise de pixel matching, joindre/exporter la capture PNG originale dans le pipeline d'implémentation et documenter dimensions + provenance. Aucun fichier du dossier `assets` ne doit être présenté comme « asset officiel » sans revue produit.

## 3. Règles de fabrication

- **Emblème** : rendre à 24/32/48/96 px, silhouette reconnaissable sans mot.
- **Hero** : utiliser SVG directement dans l'HTML ou comme `<img>` avec `alt` adapté au sens ; décorations pures `aria-hidden="true"`.
- **Motif** : ne pas dupliquer les bandes dans les composants secondaires ; éviter répétition décorative.
- **Couleurs** : consommer les variables sémantiques CSS pour la vraie UI, pas recopier les codes sur chaque élément.
- **Rasters** : si des images de référence sont exportées, créer une version haute définition d'archive et un aperçu WebP optimisé ; jamais intégrer une capture entière comme interface cliquable.
- **Fonts** (SIL OFL 1.1, licences dans `public/fonts/*-OFL.txt`) : Playfair Display 800 italique (« Moien! »), Fraunces 900 italique (« Watfir »), Roboto Condensed 400 (« Lëtzebuergesch »). Le reste de l'interface garde Inter.
- **Originalité** : s'inspirer des règles historiques (courbes, géométrie, composition typographique) ; ne pas réutiliser les logos de villes ou marques de tiers.

## 4. Critères de promotion en production

Revue des tracés SVG, poids final, vue miniature/retina, contrastes, alternative accessible, compatibilité iOS/Android, responsive, tests visuels, approbation explicite. Tant que ces points ne sont pas cochés dans [RECETTE.md](RECETTE.md), garder les fichiers sous `docs/`.

## 5. Éléments à exclure

Les prototypes détaillés de Spuerkeess (façade à nombreuses fenêtres / coucher de soleil), le logo touristique illustré avec soleil géant et les versions à bordures de CTA tricolores épaisses **ne sont pas des éléments retenus de la V4**. Ils ne sont pas copiés ici pour éviter de créer deux directions concurrentes.
