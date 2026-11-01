# SPEC 117 — RED FLAG : présentation intégrée à la structure Lux Runner (application de SPEC 116)

**Date :** 1er novembre 2026 · **Branche :** `2.1` · **Priorité :** P1 UI/UX  
**Statut : IMPLÉMENTÉE SUR `2.1` LE 01/11/2026 — recette Chromium (conformité géométrique à Lux Runner sur 8 tailles, parcours FIX-01 à FIX-10) verte ; VALIDATION SAMSUNG À FAIRE.**  
**Cadre :** [SPEC 116](SPEC-116.md) (structure commune, référence mesurée Lux Runner § 2 bis, registre § 5 bis) prime pour la mise en page ; [SPEC 115](SPEC-115.md) reste la source du **comportement** de l'accueil (affiché à chaque entrée, « Commencer » → Cringr, ni 3D ni musique) et de l'illustration retenue. [SPEC 113](SPEC-113.md) (sélecteur Cringr) et [SPEC 110](SPEC-110.md) (jeu) inchangées. Suivi : LD-049 (TODO sur `main`).

## 1. Constat (captures Samsung du 01/11 et mesures Chromium)

Le produit aime l'illustration de la jeune femme, mais l'écran ne « parle » pas la même langue que Lux Runner. Mesures à 393×852 (Chromium) et captures Samsung :

| Point | Lux Runner (référence) | RED FLAG avant SPEC 117 | Effet |
|---|---|---|---|
| En-tête | « ← Jeux » texte + marque discrète à droite, y = 12, marge 16 px | bouton carré encadré + logo pixel centré (Samsung) / variante V9 à 10 px de marge | deux familles d'écrans d'entrée |
| Titre | nom du jeu, serif 55 px, une ligne, pleine largeur | « Ton prochain date sur Cringr. » sur 3 lignes, 37,7 px, **posé sur l'image** | le titre narratif remplace le nom du jeu, lisibilité réduite |
| Texte | une accroche courte sous le titre | deux paragraphes à filets verticaux, coincés dans 43–48 % de la largeur à côté du visage | texte étroit, composition « affiche » |
| Visuel | bloc sous l'accroche, rail entier | héros composite à droite, 276×428, superposé au texte | l'image domine et dicte la mise en page |
| Détails | records à filets, sans cadre | étapes dans une **carte encadrée** à coins arrondis | encart de plus, autre langage graphique |
| Actions | bloc d'actions hors de `main`, ancré en bas | CTA seul, grand vide au-dessus | vide de ~150 px entre étapes et CTA |
| Rail PC | 468 px (`--layout-focus` − 2 × 16) | 560 px | colonne plus large que Lux Runner |

## 2. Décision

1. RED FLAG **utilise l'écran commun** SPEC 116 : même DOM, même CSS que Lux Runner. Plus aucune mise en page propre au jeu.
2. **Le nom du jeu devient le titre** : « Red Flag. » (point en or, comme Lux Runner). Le contexte narratif passe dans le **kicker** « TON PROCHAIN DATE » et dans l'**accroche** : « Tu incarnes une femme qui cherche un date sur Cringr. Discute, trouve des preuves et démasque les mensonges. »
3. **L'illustration est conservée** (même héroïne, même art), mais **recadrée en paysage** pour la zone visuel commune, sous l'accroche, sur toute la largeur du rail : visage, main, tasse, téléphone au cœur rose et lampe restent visibles. Coins arrondis 16 px, filet violet discret, **aucun texte posé dessus**.
4. **Étapes** « Choisis un profil → Discute en LU → Démasque les mensonges » dans la zone détails, au **même rythme que les records de Lux Runner** (filets haut et bas, trois colonnes, petits pictogrammes pixel), sans carte.
5. **Un seul bouton** « Commencer → » dans le bloc d'actions commun, ancré en bas comme « Jouer ».
6. Tous ces contenus vivent **dans le registre unique** `JEUX_PRESENTATIONS.redflag` (`public/game-intro.js`).

**Image régénérée ?** Non : l'art approuvé est conservé. Un **recadrage** produit l'asset de présentation (voir § 3). Une nouvelle génération n'était pas nécessaire : le recadrage paysage garde tous les éléments narratifs et le visage, sans texte incrusté.

## 3. Implémentation (01/11/2026)

| Fichier | Changement |
|---|---|
| `public/game-intro.css` *(nouveau)* | géométrie unique reprise de Lux Runner (§ 2 bis de SPEC 116) : conteneur `--layout-focus` + 16 px, header 44 px à 12 px du haut, `main` centré verticalement (`padding:24px 0`), titre `clamp(48px,14vw,64px)/1.05` Instrument Serif, accroche 15 px/700, zone visuel (image : ratio déclaré, hauteur ≤ `min(32svh, 300px)`, `object-fit:cover` avec cadrage), étapes et règles, actions (or 54 px, secondaire 48 px, lien 44 px) |
| `public/game-intro.js` *(nouveau)* | registre `JEUX_PRESENTATIONS` (entrée `redflag`) et fabrique `renderGameIntro(id, { variante })` : header, `main` (kicker, titre, accroche, visuel, détails ; zones absentes sans hauteur), actions **hors de `main`** ; boutons = nom de fonction déclaré ; repli `game-intro-visuel-vide` si l'image échoue ; tailles d'icônes portées par le SVG (indépendantes des styles de la vue hôte) |
| `public/lux-demasque.js` | `ldRendreAccueil()` = `box.innerHTML = renderGameIntro('redflag')` ; suppression de l'ancien HTML d'accueil, des pictos locaux et de l'en-tête `accueil` de `ldEntete()`. `ldEntrerRedFlag()` / `ldAccueilCommencer()` inchangés |
| `public/lux-demasque.css` | suppression des règles `.ld-accueil*` et `.ld-top-accueil` (V7–V9) ; pour `data-ecran="accueil"`, le conteneur du jeu s'efface (`max-width:none;padding:0;gap:0;background:transparent`) ; le fond reste celui de la vue / du body (`jeux-univers.css`) |
| `public/art/jeux/redflag-presentation.webp` *(nouveau)* | recadrage 1254×1000 (y 150 → 1150) de l'illustration V7, WebP q84, **50 Ko** ; produit par `tools/red-flag/recadrer-presentation.py` |
| `tools/red-flag/sources/redflag-hero-v7.webp` | source carrée déplacée **hors de `public/`** (n'est plus téléchargée ni mise en cache par la PWA) |
| Retirés | `public/art/redflag-hero-v4.webp`, `redflag-hero-v6.svg`, `redflag-accueil.webp` (orphelins, plus référencés) et l'outil de rendu low-poly V2 (`tools/red-flag/rendre-accueil.py`, `accueil-heroine.html`) ; ils restent dans l'historique git |
| `public/index.html` | `game-intro.css?v=1`, `game-intro.js?v=1` (chargé avant `lux-demasque.js`), cache `lux-demasque.css/js?v=29` |

**Lux Runner n'est pas modifié** : il reste l'étalon. Sa bascule sur `renderGameIntro('runner')` (avec ses deux variantes) est le **lot 1 de SPEC 116**, à faire séparément ; le test de conformité ci-dessous garantit déjà que RED FLAG et Lux Runner coïncident.

## 4. Recette exécutée (Chromium + SwiftShader, 01/11)

- **`tests/test_game_intro_conformite.py` (nouveau)** : à 320×600, 360×740, 393×852, 430×932, 768×1024, 1024×768, 1440×900 et 1920×1080, mesure RED FLAG et Lux Runner (première visite **et** visite normale) dans le même viewport. Identiques à ±2 px : header et « ← Jeux » (position et taille), marque (bord droit, hauteur, police), rail du `main`, du kicker, du titre et du CTA, typographie du kicker et du titre, hauteur du CTA, bas du bloc d'actions (sans défilement). Accroche, visuel et détails sur le même rail que le titre, dans l'ordre titre → accroche → visuel → détails → actions. Aucun débordement ; dès 740 px de haut, pas de défilement et CTA visible. Captures et mesures : `artifacts/game-intro/` (archivées par la CI `lux-demasque-v11`).
- **`tests/test_lux_demasque_accueil.py` (adapté)** : FIX-01 contenus exacts du registre et **ordre DOM commun** ; FIX-02/04 Retour et « ← Jeux » ; FIX-03 double appui ; FIX-05 image 404 → repli, API en erreur, stockage refusé ; FIX-06/07 tailles (rail ≤ 468 px) ; FIX-08 clavier, mouvement réduit, zoom 130/200 % ; FIX-09/10 parcours et Lux Match.
- **`test/lux-demasque-selection.test.cjs`** : contrats V2→V9 de l'ancienne mise en page remplacés par le contrat SPEC 117 (registre, DOM commun, géométrie Lux Runner dans `game-intro.css`, ancienne image retirée) ; assertion obsolète `jeux-univers.css?v=11` corrigée en `v=12`.
- Tests passant par « Jouer » (`test_lux_demasque`, `_audio`, `_parcours`, `_selection`) : bouton `.game-intro-primaire`.

Mesures après correction (393×852) : header [16, 12, 361, 44] et titre 55 px à x = 16 sur 361 px, comme Lux Runner ; visuel 361 × 272 ; CTA [16, 784, 361, 54] : le bloc d'actions finit à 838 px, au même endroit que celui de Lux Runner.

## 5. Non vérifié / limites

- **Samsung réel** : rendu de l'image recadrée, barres système, police système agrandie, Retour.
- Le texte de l'accroche fait 3 lignes sur téléphone (contenu SPEC 115 conservé) ; si le produit veut la légèreté d'une ligne comme « 60 secondes · 3 vies », raccourcir **dans le registre** sans toucher à la mise en page.
- À 320×600, l'écran défile d'environ 90 px (Lux Runner défile aussi à cette taille) ; le CTA reste atteignable.
- Couleur du point final : or, comme Lux Runner (règle SPEC 116 § 5 bis) ; une variation par jeu n'est pas prévue.

## 6. Retour Samsung du 01/11 (16 h) et correctifs

**Retour :** « très bien », mais la page **défilait** sur le téléphone (~393 × 763 px utiles), et au retour vers Jeux la page ne revenait pas sur la carte RED FLAG.

- **Hauteur** : le visuel image devient la zone élastique de l'écran commun (SPEC 116 § 3 bis) — entre 140 et 300 px selon la place, header, titre, rail et actions toujours identiques à Lux Runner. Étapes compactes (pictogramme et verbe sur une ligne ; empilés sous 380 px). Résultat Chromium : plus de défilement dès 360×640 (dont 393×763) ; à 320×600, 26 px.
- **Retour au hub** : recentrage sur la carte du jeu quitté, pour tous les jeux (SPEC 116 § 9).
- Tests ajoutés ou étendus : `tests/test_game_intro_conformite.py` (11 tailles, dont 360×640, 393×763 et 412×780 ; visuel entre 140 et 300 px ; aucun défilement dès 360×640), `tests/test_jeux_retour_carte.py` (nouveau), contrat Node (hauteur élastique, recentrage).
- **Non vérifié** : Samsung réel après correctif (la police système peut ajouter quelques pixels : le visuel les absorbe tant qu'il reste au-dessus de 140 px).

## 7. Harmonisation de la zone « Choisis / Discute / Démasque » (01/11/2026, soir)

**Retour :** les pictos plaisent, mais le rendu des trois étapes n'est « pas harmonieux » : espacements bizarres.

**Constat mesuré (355 px de large, téléphone du produit) :** « les mensonges » passait sur 2 lignes dans la 3ᵉ colonne ; les colonnes étaient centrées verticalement, donc le picto et le verbe de « Démasque » étaient décalés de 3 px et 9 px par rapport aux deux autres. Le premier picto avait en plus 4 px de retrait par rapport au titre et à l'image, et la disposition changeait sous 380 px (picto à gauche du verbe au-dessus, empilés en dessous).

**Correctif (`public/game-intro.css`, `game-intro.js`) :**
- une seule disposition à toutes les largeurs : pictogramme (28 px, icône 16 px = 2× la grille 8×8), verbe, complément, empilés et alignés **en haut** (plus de centrage vertical) ; media query `max-width:379px` supprimée ;
- première colonne sans retrait : le picto s'aligne sur le bord gauche du titre et de l'image ; colonnes suivantes : filet puis 10 px de marge ;
- complément en `text-wrap:balance` : « les / mensonges » se coupe proprement quand la colonne est étroite ;
- espacements verticaux resserrés (10 px haut, 8 px bas, 4 px sous le picto) pour garder le visuel élastique au-dessus de 140 px.

**Recette exécutée (Chromium, 01/11) :** pictogrammes et verbes à la même ordonnée dans les trois colonnes à 320, 355, 360, 393, 430 et 1440 px (nouvelle assertion dans `tests/test_lux_demasque_accueil.py`, aucun verbe ni complément coupé) ; `test_game_intro_conformite.py` (11 tailles, aucun défilement dès 360×640) et `test_jeux_retour_carte.py` verts ; Node 301/5 (les 5 échecs connus inchangés).

**Limite :** à 320×600 le défilement passe d'environ 26 à 32 px (visuel déjà au minimum de 140 px ; le CTA reste atteignable). **Recette Samsung à faire.**

