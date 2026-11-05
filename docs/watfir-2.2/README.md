# Watfir — direction artistique 2.2 (Retro 1984)

**Branche :** `2.2` (créée depuis `2.1`, le 2 novembre 2026).  
**Statut :** **accueil Watfir V2.2 terminé et gelé** (02/11/2026, [IMPLEMENTATION § 12](IMPLEMENTATION.md#12-recette-finale-et-gel-de-laccueil-02112026)) : plus aucune modification esthétique de l'accueil sans défaut concret identifié. Étape suivante : harmonisation des autres écrans de LuxApp, qui restent inchangés.  
**Périmètre de cette livraison :** surcouches `public/accueil-watfir.js` / `.css`, deux SVG publics, inclusion dans `public/index.html`, tests, documentation. Aucune modification des moteurs, JSON, routes, sauvegardes, audio ou mini-jeux.

## Commencer ici

1. [CHARTE-DA.md](CHARTE-DA.md) — identité, palette déployée sur l'accueil, typographie, géométrie, iconographie et garde-fous.
2. [ACCUEIL-V4.md](ACCUEIL-V4.md) — description écran par écran de la référence V4, contraintes responsive et **sélecteur de niveaux évolutif**.
3. [ASSETS.md](ASSETS.md) — inventaire, provenance, usage et conditions de remplacement des sources.
4. [RECETTE.md](RECETTE.md) — plan d'implémentation graduelle, tests et critères de validation.
5. [HOVER-SYSTEM.md](HOVER-SYSTEM.md) — système partagé des interactions souris : composants, tokens, adoption progressive, garde-fous mobile et accessibilité.
6. **[BOUTONS-3D.md](BOUTONS-3D.md)** — design system réutilisable des boutons 3D, **six commandes**, couleurs, durées, appui tactile, clavier et règles de migration.
7. [Prototype interactif V4](prototypes/accueil-v4.html) — accueil autonome, démonstration du changement A1/A2/B1 et de la feuille de niveaux, **sans lien avec la vraie progression**.

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

**02/11/2026, finitions** (IMPLEMENTATION § 10) : SVG V4 fournis intégrés tels quels (`watfir-logo-v4.svg`, `watfir-hero-v4.svg`), barre à 0 % vide, zones de toucher de 48 px de haut sans chevauchement.

**02/11/2026, gel** (IMPLEMENTATION § 12) : recette finale Chromium 320–1440 px, polices agrandies, invité/connecté ; « Mode invité » ≥ 11 px, repli du header sous 360 px, zones de toucher vérifiées au toucher. Accueil déclaré terminé.

**04/11/2026, correctifs d'audit** (IMPLEMENTATION § 17) : niveau actif sur rouge profond `#c81e1b` (contraste AA), textes utiles ≥ 12 px, nom accessible « Connexion, mode invité », `aria-controls` d'Étudier valide, fond PC continu, libellés Étudier/Jouer ≥ 19 px. Le gel reste en vigueur.

**05/11/2026, dégel ciblé** (IMPLEMENTATION § 18) : icône PWA Watfir, logo du header repris du monument de l'icône, appui 3D sans rebond, **hero V5 sans monument** (« Moien! » + bouton Écouter + rubans signature).

## Interactions desktop communes (02/11/2026)

Un fichier actif autonome, [`public/hover-interactions.css`](../../public/hover-interactions.css), est chargé en dernier dans `index.html`. L’accueil présente désormais **Étudier** (rouge foncé, texte/picto crème) et **Jouer** (bleu profond, texte/picto crème), deux boutons centrés au relief 3D de 5 px. Sur PC, seul leur fond s’éclaircit au survol, sans mouvement ni contour. Étudier ouvre un sous-menu accessible donnant accès aux Leçons, Révisions, Examens et Erreurs ; Jouer mène directement aux mini-jeux. Le pictogramme livre a été retiré de Commencer, mais **l’épaisseur des bandes rouge/cyan du coin et leur palette restent exactement inchangées**. **Le CTA principal est désormais un bouton physique au repos sur mobile et PC** (tranche beige de 7 px, ombre et lumière), avec appui tactile de 6 px ; sur PC, seul son fond crème s'éclaircit (`#fbebc5` → `#fff4da`), sans soulèvement ni nouvelle ombre. **Le contour rouge animé et la recoloration du chevron ont été supprimés**, y compris pendant le clic maintenu. Le fond reste crème, le coin rouge/cyan inchangé, le chevron est dégagé du motif. **Les trois boutons de niveaux du header (A1.1, A1.2 et chevron) reçoivent eux aussi un relief 3D proportionnel (tranche 2 à 4 px) et un enfoncement maintenu 160 ms avant changement de niveau ou ouverture du sélecteur**, tout en conservant le rouge du niveau actif, les contours crème et les cibles tactiles de 48 px. Le relief est hors flux : aucune modification de grille ni des données. Les composants 2.1 communs reçoivent un feedback neutre ; l'accueil Watfir possède des variantes plus affirmées. Les boutons « Étudier » et « Jouer » conservent tous deux leur pictogramme et leur texte crème sur mobile et PC. **Les six boutons 3D (Commencer, Étudier, Jouer, A1.1, A1.2 et sélecteur) s'enfoncent visiblement avant activation sur mobile et PC** : la face descend de 6/4 px, l'état pressé est maintenu 160 ms puis l'action originale s'exécute. Un tap bref ou un clic clavier ne supprime donc plus le feedback. Les réglages de mouvement réduit et les clics programmatiques ne sont pas retardés. Voir [HOVER-SYSTEM.md](HOVER-SYSTEM.md) et `node --test test/watfir-hover.test.cjs`. Les autres écrans ne sont pas déclarés harmonisés visuellement.
