# SPEC 118 — RED FLAG / Cringr : refonte visuelle V3 de la sélection des profils

**Statut : implémentée sur `2.1` le 02/11/2026 (première livraison : sélection Cringr uniquement). Recette Samsung et approbation visuelle à faire — non validée.**
Source : cahier des charges UI/UX « Refonte visuelle V3 — Écran de sélection des profils » (01/11/2026). Complète [SPEC 113](SPEC-113.md) (composition, gestes, LD-048) et [SPEC 110](SPEC-110.md) (moteur) sans les modifier.

## 1. Objectif

Retrouver sur le téléphone Cringr l'ambiance nocturne, chaleureuse et un peu mystérieuse de la présentation RED FLAG ([SPEC 117](SPEC-117.md)), en gardant l'identité arcade 16/32 bits, les personnages low-poly PS1 réels et l'humour. Habillage et composition seulement : même moteur 3D, mêmes portraits, mêmes gestes.

## 2. Ce qui a changé (01–02/11)

| Zone | Avant | V3 |
|---|---|---|
| Palette | violet froid, carte encadrée lilas vif | nuit prune `#17101F`, aubergine `#302039`, prune rosé `#432A46`, rose Cringr `#E74791`, ambre `#D99B70`, crème `#F6E9DD`, lavande `#C9B5D6` (variables `--cr-*` limitées au sélecteur) |
| Fond de page | dégradé violet | halos diffus rose (haut) et ambre (bas), fond prune sur mobile |
| Téléphone | 3 cadres emboîtés (coque épaisse, bord d'écran, carte lilas) | une seule coque fine aubergine, ombre décalée nette + reflet rose diffus ; écran sans bordure ; carte au filet prune discret |
| Hauteur | carte `clamp(320px, 100svh − 250px, 550px)` : défilement de 4 à 9 px à 320×600, 360×740 et 393×763 | page à la hauteur de l'écran, chaîne flexible page → téléphone → écran → carte (560 px max) ; la carte rétrécit jusqu'à son contenu, jamais en dessous (aucune troncature) |
| Portrait | infos sur un aplat presque noir qui masquait le visage à 320 px | dégradé prune progressif et coloré ; halo rose au visage, lumière ambre en haut, vignette douce ; place minimale réservée au portrait (120 px, 96 px sous 700 px de haut) |
| Décors (`public/art/cringr-*.svg`) | ciels froids (bleu, sarcelle) | réécrits en formes géométriques simples, halo derrière le personnage : **Milo** coucher de soleil prune/corail/ambre, montagnes, valise ; **Noah** Luxembourg-ville la nuit, lune, fenêtres allumées ; **Tom** crépuscule, montagne, sentier, sapins ; **profil généré** toits de la ville, enseigne cœur (aussi derrière le « ? ») |
| Infos | — | nom crème (âge ambre), ville lavande, bio crème VT323 22 px, ombre portée pixel ; statut en **badge arcade rose** |
| Boutons | cœur rose saturé à bord rose clair | cœur rose Cringr à contour sombre net, biseau pixel, ombre décalée ; NOPE en tuile aubergine sombre. Tailles inchangées (56 et 48 px) |
| Tampons | LIKE vert, NOPE saumon | **LIKE rose**, NOPE lavande, fond nuit et ombre décalée |

Typographies : deux familles seulement (Press Start 2P pour marques/tampons, VT323 pour le reste).

## 3. Inchangé (vérifié par les tests)

Moteur, données et textes des profils ; portraits issus de `m.portrait()` et `ldComposerPhotoProfil()` (aucune régénération, un seul renderer) ; gestes (seuil 65 px, glisser gauche = NOPE, droite / cœur = LIKE, geste court = retour, défilement vertical sans effet, double activation bloquée) ; `prefers-reduced-motion` ; déposition, réseaux, preuves, bilan, scoring et progression non touchés.

## 4. Fichiers

`public/lux-demasque.css` (section SPEC 113 réécrite, sélecteur Cringr uniquement), `public/art/cringr-milo.svg`, `cringr-noah.svg`, `cringr-tom.svg`, `cringr-ville.svg`, `public/index.html` (`lux-demasque.css?v=30`), `test/lux-demasque-selection.test.cjs` (version du cache).

## 5. Recette exécutée (Chromium + SwiftShader, 02/11)

- Mesures 320×600, 360×740, 393×852, 430×932, 393×763 et 1440×900 : **0 px de défilement** vertical et horizontal partout (contre 4 à 9 px avant) ; cœur 56 px et NOPE 48 px dans l'écran.
- Captures avant/après aux quatre tailles de référence, les quatre profils et les deux tampons à 393×763.
- `test_lux_demasque_cringr` (texte réel, bio ≥ 22 px, bio longue, texte 200 %, rotation, gestes, seuil 65, tampons, clavier, mouvement réduit, WebGL refusé), `test_lux_demasque_selection`, `_parcours`, `_mobile`, `_accueil`, `_acceptation`, `test_game_intro_conformite` : verts. `test_lux_demasque_audio` : échec préexistant connu (attente `#ld-verdict`), inchangé.
- Node : 301 réussis, 5 échecs connus inchangés.

## 6. Non vérifié / limites

- **Samsung réel et approbation visuelle** : à faire. La refonte n'est pas validée avant accord explicite.
- À 320×600, le dégradé des infos recouvre le menton de Milo (yeux et visage visibles) : c'est la limite tant que la bio reste à 22 px sans troncature.
- Sur grand écran (430×932, PC), la carte plafonne à 560 px et le téléphone est centré verticalement (marges égales au-dessus et en dessous).
- `overflow: clip` est utilisé pour que la carte garde sa hauteur de contenu ; un navigateur très ancien sans `clip` retombe sur `hidden` (comportement d'avant).
- Le cahier des charges cite un « suivi canonique sur `main` » : conformément à la consigne produit du 01/11 (aucun push sur `main`), le suivi est consigné ici, sur `2.1`.

## 7. Suite du 02/11 (retour produit) : repère de glisse, croix « quitter », confirmation

**Demande :** un petit repère en pixel art, en haut et centré, qui dit au joueur de glisser ; la flèche en haut à gauche remplacée par une croix discrète ; une fenêtre « Veux-tu vraiment quitter la partie ? » dans la même DA ; à la sortie, retour sur la carte du jeu quitté dans le hub Jeux.

- **Repère de glisse** (`.ld-selection-geste`) : petite tuile arcade sombre centrée en haut de la carte, au-dessus du ciel du portrait (jamais sur le visage). Pixel art 30×8 : flèche gauche, doigt (rond rose), flèche droite, affiché à 2×. Le doigt se déplace par pas de 3 px trois fois à l'arrivée, puis le repère reste fixe et discret. Il s'efface pendant le tirage de la carte et quand un tampon LIKE / NOPE apparaît ; `pointer-events:none`, `aria-hidden` (les commandes restent décrites dans `#ld-selection-commandes`) ; sans animation avec `prefers-reduced-motion`. **Il remplace la règle de SPEC 113 « pas de hint permanent » sur demande du produit** ; l'animation de découverte de la carte (une seule fois) est conservée.
- **Croix « quitter »** : sur Cringr seulement, la flèche de retour devient une croix pixel 14 px, sans tuile ni bordure (la tuile reste réservée au NOPE), lavande à 70 %, cible tactile 48×48, nom accessible « Quitter la partie ». Les autres écrans (rencontre, déposition…) gardent leur flèche.
- **Fenêtre « Quitter la partie ? »** (`ldDemanderQuitter()`, via le système de calques existant) : tuile aubergine à contour net et ombre décalée, drapeau pixel rose, VT323, deux boutons ≥ 52 px : **Rester** (rose, action par défaut, focus à l'ouverture) et **Quitter**. Clic hors fenêtre, Échap et Retour Android ferment la fenêtre et laissent le joueur sur Cringr. **Quitter** appelle `ldQuitter()` (arrêt de la partie et de la musique) puis ouvre le hub Jeux.
- **Retour au hub** : réutilise SPEC 116 §9 (le hub se recale sur la carte du jeu d'où l'on vient). Vérifié depuis Cringr : à 393×763 et 360×640, la carte RED FLAG (dernière du hub) retrouve sa position d'avant l'entrée, aux quatre tailles de référence elle reste visible.
- **Inchangé** : Retour Android ou navigateur *depuis l'écran Cringr sans fenêtre* quitte toujours directement vers le hub (comportement SPEC 113, testé), sans confirmation.

**Fichiers :** `public/lux-demasque.js` (`ldEntete`, `ldDemanderQuitter`, `LD_GESTE_GLISSE`), `public/lux-demasque.css`, `public/index.html` (`lux-demasque.css?v=31`, `lux-demasque.js?v=30`), `test/lux-demasque-selection.test.cjs`, `tests/test_cringr_quitter.py` (nouveau, ajouté à `tools/test-lux-demasque.sh` et `tools/critique.sh`).

**Recette exécutée :** `test_cringr_quitter` à 320×600, 360×740, 393×763 et 430×932 (croix 48 px sans tuile, repère centré dans la carte et effacé pendant le tirage, fenêtre dans l'écran, Rester / Échap / Retour = on reste, Quitter = hub recalé, partie et sélection arrêtées, mouvement réduit). **Non vérifié : Samsung réel.**


## 8. Réchauffement de l'écran de sélection (css v32)

Constat produit : l'écran de présentation (lampe ambrée) paraissait plus chaleureux que l'écran du téléphone Cringr, plus froid et violet.

Correctif, couleurs uniquement, aucune dimension modifiée :
- coque du téléphone : aubergine plus chaude `#3b2335`, liseré ambre intérieur et lueur ambre sous le téléphone ;
- écran : lumière ambrée qui monte du bas, haut légèrement rosé ;
- carte : filet `#7a4a58`, lumière ambre au bas du portrait, bloc d'infos teinté chaud ;
- fond de page : halo ambre du bas plus présent.

Vérifié en Chromium à 320×600, 360×740, 393×763, 430×932 : aucun défilement, aucune erreur JS. Tests Node 302 réussis / 5 échecs connus (référence inchangée), tests Cringr, quitter, sélection et conformité de présentation OK.
Non vérifié : rendu sur le Samsung. Le réchauffement n'est pas validé tant que le joueur ne l'a pas approuvé visuellement.

## 9. Contraste du portrait (css v33, js v31)

Retour produit sur Samsung : avec le §8, Milo et la carte paraissaient pâles et délavés. Le portrait 3D est rendu avec une lumière plate (blanche et forte, sans ombre), et les voiles clairs du §8 l'éclaircissaient encore.

Correctif :
- `ldEclairerPortrait()` retravaille la photo de profil après le détourage, à la composition : couleurs plus vives, contraste, côté éclairé plus clair, bas du buste dans l'ombre, liseré de lumière au bord du côté de la source et contour sombre d'un pixel ;
- `LD_LUMIERE_DECOR` donne la lumière de chaque décor : Milo, soleil à droite (ambre) ; Noah, lune à droite (lavande froide) ; Tom, soleil à gauche (ambre) ; ville, néon rose ;
- `ldAssombrirDecor()` creuse légèrement les ombres du décor ;
- le voile rose et ambre posé sur la photo est remplacé par une simple vignette sombre.

Le moteur 3D, les portraits des autres écrans et l'identité des personnages ne changent pas : seule la composition de la photo Cringr est concernée.

Vérifié en Chromium : quatre profils à 393×763, sélection à 320×600, 393×763 et 430×932 sans défilement. Tests Node : 302 réussis, 5 échecs connus. `test-lux-demasque.sh complet` : seul `test_lux_demasque_audio` échoue, comme avant.
Non vérifié : Samsung.
