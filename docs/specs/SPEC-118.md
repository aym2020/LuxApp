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
