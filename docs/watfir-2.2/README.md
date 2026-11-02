# Watfir — direction artistique 2.2 (Retro 1984)

**Branche :** `2.2` (créée depuis `2.1`, le 2 novembre 2026).  
**Statut :** **accueil V4 intégré au code réel de la branche `2.2`**, à valider visuellement sur Samsung et en navigateur. Les autres vues restent inchangées.  
**Périmètre de cette livraison :** surcouches `public/accueil-watfir.js` / `.css`, deux SVG publics, inclusion dans `public/index.html`, tests, documentation. Aucune modification des moteurs, JSON, routes, sauvegardes, audio ou mini-jeux.

## Commencer ici

1. [CHARTE-DA.md](CHARTE-DA.md) — identité, palette, typographie, géométrie, iconographie, système de composants et garde-fous.
2. [ACCUEIL-V4.md](ACCUEIL-V4.md) — description écran par écran de la référence V4, contraintes responsive et **sélecteur de niveaux évolutif**.
3. [ASSETS.md](ASSETS.md) — inventaire, provenance, usage et conditions de remplacement des sources.
4. [RECETTE.md](RECETTE.md) — plan d'implémentation graduelle, tests et critères de validation.
5. [Prototype interactif V4](prototypes/accueil-v4.html) — accueil autonome, démonstration du changement A1/A2/B1 et de la feuille de niveaux, **sans lien avec la vraie progression**.

### Assets disponibles dans cette branche

- [Emblème Watfir — SVG](assets/watfir-mark.svg) : pictogramme indépendant de la typographie.
- [Hero architectural — SVG](assets/watfir-hero.svg) : tour, trois arches et bandes cyan/rouge, **sans soleil**.
- [Bandes identitaires — SVG](assets/watfir-stripes.svg) : motif réutilisable, indépendant de l'illustration.
- [Palette — SVG](assets/watfir-palette.svg) : planche de couleurs.
- [Proposition de sélecteur — SVG](assets/niveaux-sheet.svg) : maquette explicative non interactive.
- [Tokens proposés — CSS](assets/watfir-tokens.css) : **référence non importée par l'application**.

Les fichiers SVG sont des **constructions vectorielles originales**, éditables et scalables. Les versions utilisées par l'accueil sont copiées dans `public/art/watfir-mark.svg` et `public/art/watfir-hero.svg`. Ils ne sont pas des vectorisations pixel à pixel des maquettes générées. Les chiffres affichés dans les maquettes (6 %, 0 jour, 28 questions) sont des **données d'exemple**, jamais des valeurs à coder en dur.

## Invariants applicatifs

La 2.2 hérite des contraintes fonctionnelles de la 2.1 : lire [PLAYBOOK](../../PLAYBOOK.md), [charte UI 2.1](../CHARTE_UI_2.1.md), [Design System](../DESIGN_SYSTEM.md), [post-mortem exercices](../POSTMORTEM-EXERCICES-2.1-2026-10-21.md), [recettes](../RECETTES-2.1.md) avant de changer le code. Le fonctionnement de `main/docs/LUX-DEMASQUE-TODO.md` reste la source canonique de suivi pour Lux Démasqué ; ne pas le recopier dans cette branche.

**Règle produit :** le nouveau style « Watfir » peut remplacer progressivement la présentation du **shell** de LuxApp, mais cela ne constitue ni un renommage technique immédiat de toutes les clés et URL, ni une permission de réécrire les fonctionnalités. Toute migration du nom public, du manifeste PWA, des icônes, des URLs ou des données est une décision séparée.

## Décisions et incertitudes

- **Validé comme intention de design** : noir + beige crème + rouge + cyan ; hero géométrique compact ; « Moien! » expressif ; CTA crème unique ; raccourcis regroupés ; sans soleil et sans détails superflus.
- **V4 conceptuelle** : deux niveaux de la famille courante visibles et une flèche pour ouvrir tous les niveaux disponibles. La popup doit devenir un **bottom sheet accessible** dans une version fonctionnelle.
- **Non validé** : fidélité du mockup généré au rendu HTML réel (capture réelle non encore prise), exactitude chromatique de tous les pixels, dessins finaux des glyphes, visuels des écrans hors accueil, tests Android TalkBack / grandes polices / très petits écrans.
- **Écart volontaire avec 2.1** : l'or `#f5cf4d` du CTA 2.1 est remplacé **dans le concept 2.2** par le crème, tandis que le rouge/cyan servent d'ornement de marque. Les couleurs sémantiques de succès, erreur, information et révision **ne doivent pas être rebaptisées par des couleurs décoratives**.

## Méthode d'intégration

L'accueil est déjà branché sur la 2.2 ; avant de valider la livraison visuelle, contrôler sur un lot UI isolé avec capture avant/après, puis contrôles navigateur 320/360/393/430/720 px, clavier/zoom et recette Samsung avant validation. Un écran à la fois. Les SVG de `public/art` sont actifs dans le nouvel accueil, ceux de `docs` restent des sources de travail. Ne pas présenter les autres écrans comme migrés.

## Implémentation V4 (02/11/2026)

Voir [IMPLEMENTATION.md](IMPLEMENTATION.md) pour les fichiers actifs, événements, compatibilité avec le moteur 2.1, points de validation et retour arrière ciblé.

**02/11/2026** (IMPLEMENTATION § 7) : accueil reproduit à l'échelle de la maquette V4 (unité `--k`, polices Playfair Display / Fraunces / Roboto Condensed auto-hébergées, SVG en coordonnées de la maquette). Validation Samsung réelle à faire.
