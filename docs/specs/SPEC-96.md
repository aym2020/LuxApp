# SPEC 96 — Lux Runner : les trois portails

**Branche :** `2.1` · **Statut :** V1.1 implémentée — recette Samsung à faire · **Sources :** Game Design Document « Lux Runner — Les trois portails » v1.0, puis « Correctifs et polish V1.1 » (26/10/2026). Les règles ci-dessous intègrent la V1.1.

## Objectif

Mini-jeu de la rubrique **Jeux** (SPEC 88) pour mémoriser le **genre des noms** luxembourgeois. Un nom s'affiche sans article ; le joueur choisit la voie **Masculin / Féminin / Neutre** avant que le trio de portails n'arrive sur le coureur. Le jeu complète les leçons, il ne remplace pas leurs explications.

## Règles implémentées

- **Temps de décision = trajet jusqu'aux portails.** Tout est piloté par le temps de jeu actif (`partie.temps`) : approche des portails, défilement des marquages, collision. Le résultat ne dépend jamais du nombre d'images (testé à 2, 10, 30 et 60 images/s).
- **Sprint 60** : 60 s de jeu actif, 3 vies. Approche fixée à l'apparition du mot : **4 s (0–20 s), 3,5 s (20–40 s), 3 s (40–60 s)** — 17 portails, puis l'arche d'arrivée de 59 à 60 s. Une séquence qui dépasserait 60 s n'est pas lancée ; le chrono n'est jamais prolongé. Défaite à la 3e vie perdue, au temps de l'impact.
- **Validation à la collision uniquement**, sur la **voie occupée** à cet instant. **V1.1 : le coureur garde sa voie d'un portail à l'autre** (plus de retour au centre) ; rester sur la bonne voie est une réponse valide. Seul le **premier** portail exige un choix : sans aucune voie choisie → « Trop tard · Aucun portail choisi », perte d'une vie (on ne gagne donc pas en laissant le coureur au centre au départ).
- **Score** : +100, +25 par bonne réponse consécutive précédente (bonus plafonné à +100). Erreur ou absence : 0 et série remise à zéro. Aucun bonus de rapidité.
- **Entraînement** : approche de 6 s, vies illimitées, pas de limite de durée, bouton « Terminer », aucun record compétitif.
- **Tutoriel** (première ouverture) : 3 mots, le portail s'arrête à 70 % du trajet tant que le joueur n'a pas touché une voie pour ce mot (toucher sa propre voie confirme qu'il reste). « Passer le tutoriel » et « Revoir le tutoriel » disponibles.
- **Pause** (bouton, Échap ou P) : chrono, portails et validation arrêtés ; « Reprendre » / « Quitter la partie ». Pause automatique quand l'app passe en arrière-plan (`visibilitychange`). Retour Android : la course est abandonnée (non comptée), retour à Jeux.
- **Contrôles** : trois boutons sous la scène (≥ 44 px, lettre + nom + couleur), toucher direct d'une voie sur la route, glisser horizontal vers la voie voisine, touches 1/2/3 et flèches.

## Univers visuel « Jeux » (V1.2)

Le **violet** devient la couche ludique ; l'**or** reste la valeur LuxApp. Fichier dédié `public/jeux-univers.css` (accueil, page Jeux, carte) et `public/runner.css` (écrans du runner).

- **Violet :** icône et libellé « Jeux » en violet, sans halo radial de fond, avec un éclat très discret de l'icône (seule la tuile change : CTA Continuer, progression et autres raccourcis restent or), ambiance radiale aubergine de la page Jeux et halo du titre, carte Lux Runner (bordure, glow, dégradé noir → violet), kickers et micro-libellés, barre de temps lumineuse, bouton pause en verre sombre, contours secondaires (S'entraîner, puces Musique/Effets, pause), badge combo, séparateurs des records et des résultats.
- **Or :** Jouer, Rejouer, Reprendre, score, record (pastille « Nouveau record »), point final des titres.
- **Survie** garde son identité or/brun, inchangée.
- **Course :** zone du mot cadrée (lueur diffuse, filet violet, traduction plus claire) ; commandes M/F/N en vraies commandes de jeu (fond teinté par genre, lettre plus grande, état choisi teinté + glow + « TA VOIE ») ; correction en pastille de verre sombre bordée selon le statut ; flash bref vert/rouge de la scène.
- **Canvas :** ciel teinté violet avec brume et étoiles, route plus contrastée, pointillés plus lisibles, bords plus lumineux, perspective plus marquée, lampadaires à halo pré-dessiné ; arches « énergétiques » (sommet arrondi, halo, cœur clair, intérieur translucide, sol teinté, reflet sur la route, lettre dans une pastille au sommet, nom dès que la place le permet) ; aura du coureur au passage (couleur du genre, rouge sur un choc) et écharpe or qui flotte.
- **Résultats :** stats apparaissant en cascade, score et record en or, mots à retravailler en cartes avec barre et pastille de la couleur du genre, article et choix fait.

## Rendu 3D (V2.2 — par défaut, secours 2D)

**Statut : 3D activée par défaut, sans bouton de sélection.** Le moteur 3D se précharge durant la préparation. Si WebGL ou le chargement échoue, le Canvas 2D assure automatiquement la continuité. L'ancienne préférence `luxRunner3D` est ignorée, sans modification des sauvegardes.

- **Même jeu, autre rendu :** `public/runner-3d.js` (module ES, Three.js r170 vendorisé dans `public/vendor/three/`, aucun CDN) lit l'état de la partie et le met en scène ; aucune règle, aucun score, aucun son n'y sont modifiés. Il est importé dynamiquement à l'ouverture de Lux Runner (jamais au chargement général de LuxApp) ; les modèles sont préchargés pendant la préparation et gardés en mémoire entre deux parties.
- **Secours :** tant que la 3D charge, ou si WebGL / le chargement échoue, le rendu 2D V1.2 continue. Le canvas WebGL et ses ressources sont libérés à chaque fin de partie (seules les géométries des modèles partagés sont conservées).
- **Scène :** caméra fixe derrière le coureur ; la route défile à la même vitesse que l'approche des portails (`RUNNER_PROFONDEUR` → 18 unités). Trio en cours + deux suivants + trio franchi, arche d'arrivée. Arches néon (tube, halo additif, voile, flaque au sol, pastille lettre + nom), bande lumineuse de la voie occupée, ville de nuit (brouillard violet, ciel dégradé, étoiles), lampadaires avec halo, particules, onde et aura au passage.
- **Correctifs V2.1 (retours Samsung) :** taille du coureur correcte après « Rejouer » (modèle réutilisé : échelle remise à 1 avant mesure) ; bras des lampadaires tournés vers la route ; trois voies colorées en permanence (bleu / rose / violet), voie occupée nettement plus lumineuse ; peau du coureur en teinte naturelle (le pack Quaternius a une peau noire stylisée, recolorée dans `tools/runner3d/exporter_coureur.py`) ; effets sonores plus forts face à la musique ; **vibration** sur Android (courte sur un bon portail, double sur une erreur), coupée avec le réglage « Effets ».
- **V2.2 — couleurs et formes :** masculin **bleu** `#2f8cff`, féminin **rouge** `#ff3d5a`, neutre **vert** `#22e06b` (convention der/die/das, teintes bien séparées ; le violet se fondait dans le décor). Une forme par genre : **carré** (M), **rond** (F), **octogone** (N). Néons non retouchés par le moteur (`toneMapped: false`), filament clair, halo, membrane d'énergie animée. Voie choisie façon « route arc-en-ciel » : néon saturé, bandes qui défilent. Couleurs reprises partout (boutons, tuiles, 2D, liste des erreurs) ; seule l'illustration WebP de la carte Jeux garde l'ancien violet.
- **V2.3 — portails retravaillés :** cadre solide en relief (forme en U extrudée, métal sombre teinté), liseré néon fin sur le bord intérieur, halo flou dessiné une fois par genre sur un plan face à la caméra (plus de gros tubes transparents à facettes), intérieur en dégradé discret qui scintille doucement, pastille lettre à contour net, un seul trio suivant visible. Bloom réel : piste future, seulement si fluide sur Samsung.
- **V2.4 :** portails plus fins et espacés (la route se voit entre eux), lettre seule sur la pastille ; sensations : saut + léger zoom sur un bon portail, secousse de caméra sur une erreur, traînées de vitesse et champ élargi dès un combo de 3 ; ambiance : immeubles assombris avec fenêtres éclairées, lumière de contour dorée sur le coureur, brouillard plus marqué, tonalité « Neutral » qui garde la saturation ; **bloom réel** (UnrealBloomPass à demi-résolution, seuil 0,5) désactivé automatiquement si les 90 premières images dépassent 22 ms en moyenne.
- **Coureur animé :** course (vitesse d'animation liée à la vitesse du jeu), inclinaison au changement de voie, coup reçu sur une erreur, victoire ou chute en fin de Sprint.
- **Assets (CC0) :** `public/runner3d/coureur.glb` (Quaternius, 405 Ko, 7 animations) et `ville.glb` (Kenney City Kit Roads + Commercial, 650 Ko) ; crédits dans `public/runner3d/CREDITS.md`. Scripts de régénération Blender (`bpy`) : `tools/runner3d/exporter_coureur.py` et `exporter_ville.py`. Les FBX du pack Quaternius ne contiennent pas la course : l'export part des `.blend`.
- **Poids total au premier lancement 3D :** ≈ 1,9 Mo (Three.js 690 Ko + chargeurs 140 Ko + modèles 1,05 Mo), puis cache navigateur.
- **Non vérifié :** fluidité sur Samsung (le navigateur de test sans GPU tourne à ~2,5 images/s, non représentatif), lisibilité des portails au loin en jeu réel, chauffe/batterie. Rendu 3D par défaut : recette Samsung indispensable pour confirmer la fluidité, la chauffe et la batterie.

## Banque de mots — `public/runner-mots.js`

- Fichier **généré** par `node tools/runner-genres.cjs` (`--check` pour vérifier). Jamais d'analyse de texte libre pendant la partie.
- Sources : flashcards dont la note commence par « Masculin / Féminin / Neutre », plus une liste `MANUEL` relue (pluriels de la leçon 6 avec genre du singulier, lieux des leçons 21–22, Auto/Dësch/Telefon de la leçon 2). Le genre n'est **jamais** déduit de `e`/`en` ni du français.
- Champs : `id` stable (`a11-l02-fc2002`), `sourceLessonId`, `sourceFlashcardId`, `level`, `lemma`, `translation` (sans article français), `gender` (`m`/`f`/`n`), `articleForm` (règle de l'Eifel : `en` devant voyelle, n, d, t, z, h ; `eng` au féminin).
- 88 noms : A1.1 = 19 m / 19 f / 11 n ; A1.2 = 15 m / 14 f / 10 n. Le niveau actif (`niveauActif`) choisit la banque ; sans au moins 2 noms par genre, la carte affiche « Pas encore de noms validés » au lieu de compléter avec d'autres mots.
- **Tirage** : sac de 6 genres (2 × m, f, n) mélangé → équilibre exact, jamais 3 fois le même genre d'affilée ; pas de répétition d'un nom dans 4 portails ; les noms ratés (parties précédentes `luxRunnerMots`, et partie en cours) ont un poids ×3 à ×7.

## Records (par profil et par niveau)

`luxRunnerRecords[niveau]` : meilleur score, meilleur temps de survie, meilleure précision (si ≥ 5 portails), meilleur combo, parties jouées. Écrits **une fois** en fin de Sprint. `luxRunnerTuto` mémorise le tutoriel. Rien n'est envoyé au cloud ni mêlé à la progression des leçons.

## Rendu (V1.1 — `public/runner-rendu.js`)

Canvas 2D pseudo-3D, aucune dépendance. Un trio apparaît à la profondeur `RUNNER_PROFONDEUR = 0,42` (lisible dès son apparition, lettre toujours dessinée) ; **les deux trios suivants** (ou l'arche d'arrivée) sont dessinés derrière lui, à la même vitesse : succession continue d'obstacles, sans vide. Le trio franchi passe sous la caméra pendant 0,3 s. Route éclairée (dégradé, bords lumineux, pointillés et lampadaires qui défilent à la vitesse des portails → accélération perceptible à 3,5 puis 3 s), ville nocturne sur deux plans de parallaxe et ciel étoilé pré-dessinés une seule fois, traînées de vitesse sur les côtés. Arches avec épaisseur, halo, reflet et flaque de lumière ; coureur dessiné (genoux, coudes, maillot or, inclinaison pendant le changement de voie, recul sur un choc, bras levés à l'arrivée). Bon portail : onde et particules (or à partir de 3 de série) ; erreur : secousse et bonne voie éclairée. Badge « Combo ×N » dès 3, plus lumineux à 5 et 10. `prefers-reduced-motion` : pas de secousse, d'onde ni de traînées, peu de particules. Décors coûteux dessinés une fois par taille d'écran ; boucle, minuteries et écouteurs libérés à chaque arrêt.

## Son (V1.1 — `public/runner-audio.js`)

Identité sonore propre, **synthétisée en Web Audio** (aucun fichier, aucune licence) ; Lux Runner n'appelle plus `jouerFeedbackSon` et les sons des exercices sont inchangés. Musique électronique arcade originale à 128 BPM (grosse caisse, charleston, basse, arpège), programmée sur l'horloge audio ; couche rythmique supplémentaire dans les 15 dernières secondes. Effets : souffle stéréo au changement de voie, traversée lumineuse (qui monte avec la série), impact sourd, fanfare de combo (3, 5, 10, 15, 20), séquence de fin et de victoire. **Musique et effets se coupent séparément** (boutons dans la préparation et la pause, mémorisés par profil : `luxRunnerMusique`, `luxRunnerEffets`). Contexte audio créé à l'appui sur Jouer, suspendu en pause et en arrière-plan, musique arrêtée à la sortie.

## Écrans

Carte Lux Runner dans Jeux (après Survie) → préparation (règles + aperçu des portails la première fois ; ensuite « 60 secondes · 3 vies », records, Jouer / S'entraîner) → course → résultats (« Course terminée ! » ou « Plus de vies ! », score, temps, bonnes réponses, précision, combo, record, liste des mots ratés avec genre, article et choix fait ; Rejouer / Revoir mes erreurs / Retour aux jeux).

## Hors périmètre V1

Mode Endurance (le moteur le permet : `runnerAvancer` sans limite), classement en ligne, sons dédiés (les sons de correction de l'app sont réutilisés via `jouerFeedbackSon`).

## Implémentation

- Fichiers : `public/runner.js` (règles, écrans, contrôles), `public/runner-rendu.js`, `public/runner-audio.js`, `public/runner.css`, `public/runner-mots.js`, `tools/runner-genres.cjs`, `public/index.html` (vue `view-runner`), `public/jeux-v21.js` (carte du hub, arrêt dans `ouvrirJeux`), `public/navigation.js` (actualisation → Jeux).
- Tests : `node --test test/runner.test.cjs` — 14 tests (référentiel, barème, approche 4/3,5/3, 17 portails puis arrivée à 60 s, **deux féminins de suite réussis sans retoucher**, cadence d'images, absence de choix, voie à la collision, équilibre du tirage, priorité des erreurs, tutoriel, portails suivants, records, intégration, aucun son d'exercice) ; `test/jeux-v21.test.cjs` mis à jour.
- V1.2 : `public/jeux-univers.css`, `public/runner.css`, `public/runner-rendu.js`, `public/runner.js` ; captures 360 × 640/760 et 430 × 932 (accueil, Jeux, préparation, course, erreur, résultats), aucun scroll horizontal, commandes de 74 px, aucune erreur JS.
- Contrôle navigateur (Playwright, 360 × 740 et 430 × 932) : hub, tutoriel, course, voie conservée, combo, pause figée avec réglages du son, défaite, victoire 60 s (3 150 points, 17/17), musique arrêtée en fin de partie, retour Jeux, aucune erreur JS. **Samsung non testé, son non écouté.**

## Recette à faire (Samsung)

1. Fluidité de la course et lisibilité des portails ; changement de voie au doigt et par glissement.
2. Écran éteint / appel pendant une course → pause, reprise sans saut de temps.
3. Retour Android pendant la course, depuis les résultats, depuis la préparation.
4. Musique et effets : volume, coupure séparée, silence en pause et écran éteint, aucun son résiduel après sortie.
5. Fluidité du rendu V1.1 (lampadaires, traînées, trios suivants) sur un téléphone modeste.
6. Équilibrage 4 / 3,5 / 3 s à confirmer par des parties réelles.

## V1.3 — Illustrations des cartes et tuiles de la rubrique Jeux (26/10/2026)

- **Survie** et **Lux Runner** possèdent chacun une illustration locale et légère `public/art/jeux-survie-card.svg` et `public/art/jeux-runner-card.svg`. Les fonds sont décoratifs : aucun texte de jeu ne dépend de l'image. Dégradés d'opacité de gauche à droite + ombre basse préservent la lecture des titres, descriptions, records et boutons dorés.
- **Survie** conserve ses trois tuiles S/U/R existantes ; sur la **carte Lux Runner seulement**, M/F/N prennent les mêmes dimensions, espaces, arrondis et proportions de tuiles, avec les couleurs sémantiques masculin bleu, féminin rose, neutre violet. Dans les écrans de tutoriel et de préparation, les **arches restent inchangées** pour expliquer la mécanique des portails.
- Les illustrations sont SVG statiques, aucun asset externe, aucune animation lourde ni ressource réseau pendant une partie. Le gameplay, les scores, le son, le niveau et la progression sont inchangés.
- Recette : vérifier sous 320, 360, 390 et 430 px que les 3 tuiles, les titres, le texte, les records et le CTA restent entièrement lisibles, y compris avec une carte verrouillée ; contrôler le parcours tutoriel et l'aperçu en arches séparément.

## Livraison visuelle V1.3 — cache navigateur
`public/index.html` référence désormais `jeux-univers.css?v=2` et `runner.js?v=4` pour invalider les ressources mises en cache avant l’arrivée des nouveaux décors et tuiles. Les illustrations restent des ressources locales sous `public/art/` ; les modes de jeu, les comptes et les sauvegardes ne sont pas modifiés.

## V2.2 — Simplification de l'interface et accueil (26 octobre 2026)

- Suppression du sélecteur « Rendu 3D bêta : oui/non » dans la préparation. La 3D est le rendu normal ; le Canvas 2D reste le repli technique en cas d'échec WebGL. Les préférences sonores, le tutoriel, le score et les sauvegardes ne changent pas.
- La tuile « Jeux » n'a plus de fond radial (bords visibles sur Samsung) ; l'icône et le texte restent violets, avec seulement un très léger éclat local de l'icône.
- Cache-busting : `runner.js?v=10`, `runner.css?v=6`, `jeux-univers.css?v=6`.
- Tests : rendu 3D par défaut sans toggle, menu sonore conservé, CSS de l'accueil isolé. Recette GPU réelle sur Samsung encore requise.

## V2.5 — Chargement sans écran noir, arches identiques (26/10/2026)
- **Instance 3D unique par session** (`runnerObtenir3D`) : créée dès l'ouverture de l'écran Lux Runner, shaders compilés d'avance (`renderer.compile`), puis réutilisée à chaque partie (`attacher` / `retirer` / `reinitialiser`). « Rejouer » affiche la 3D immédiatement. Contexte WebGL perdu (appli en arrière-plan) : instance recréée à la partie suivante.
- **Jamais de 2D en attendant la 3D** : scène `data-rendu="chargement"` (fond sombre + petit anneau de chargement), temps de jeu figé (`attente`). Le rendu 2D n'est utilisé qu'en cas d'échec WebGL ou après 10 s, et alors pour toute la partie (pas de bascule 2D → 3D en cours de jeu).
- **Arches :** les trois portails ont la même forme, un carré aux coins bien arrondis (rayon 0,24) ; seule la couleur distingue les genres.

## SPEC 105 — Articles au-dessus des commandes de voie (26 octobre 2026)

Les boutons de jeu affichent désormais les **articles indéfinis de référence** avant la grande lettre M/F/N :
- **Masculin (M)** : `e / en`
- **Féminin (F)** : `eng`
- **Neutre (N)** : `e / en`

Ce sont les formes usuelles au nominatif/accusatif, régies notamment par la règle du n. Les articles indéfinis du masculin et du neutre sont identiques, donc ils ne suffisent pas à reconnaître le genre : la lettre, la couleur et le libellé restent essentiels. Il ne faut **pas afficher `mot.articleForm` avant la collision**, sous peine de dévoiler la solution sur les noms féminins. L'article exact reste présenté dans le feedback et le bilan des erreurs, après validation.

Visuel : ligne d'articles de 12 px au-dessus de M/F/N, petits écrans 11 px, boutons min. 84 px et zones tactiles préservées. `aria-label` indique le genre, les articles possibles et le raccourci clavier. Aucun changement à la mécanique, aux scores, à l'audio ni au moteur 3D. Versions : `runner.js?v=20`, `runner.css?v=10`.

Recette mobile : Samsung Chrome 320/360/390/430 px, contrôles non tronqués au-dessus de la barre Android, état `TA VOIE`, entraînement/sprint, zoom texte.

## SPEC 106 — Feedback du mot précédent et lueurs réduites

Voir [`SPEC-106.md`](SPEC-106.md) : micro-correction compacte après chaque collision, durée 650 / 1050 ms sans interruption de course, halo 2D/3D réduit d’environ 30 %. Scores, sons, genres et progression inchangés.

## V2.6 — Messages intégrés à la DA (26/10/2026)
- **Feedback « MOT PRÉCÉDENT »** (contenu SPEC 106 inchangé) : carte de verre violet sombre, liseré lumineux à gauche et halo vert (juste) ou corail (faux), signal en italique gras (or pour le gain, corail pour « −1 vie »), pastille du genre identique à celle des portails (couleur + lettre), nom du genre dans sa couleur. Largeur limitée pour laisser la place au combo.
- **Combo** : texte d'arcade sans boîte, en haut à droite, italique incliné, « ×N » en dégradé or avec contour sombre ; halo plus fort au palier 2 (violet) et au palier 3 (orangé, texte plus grand).
- **Gain de score** : « +N » en or à gauche du score (il passait sous le bouton pause).

## V2.7 — Messages en style arcade rétro (26/10/2026)
- Remplace V2.6. Police pixel **Press Start 2P** (SIL OFL, `public/fonts/press-start-2p-latin-400-normal.woff2`, 12 Ko, licence `PRESS-START-2P-LICENSE.txt`), réservée aux messages du jeu.
- **Feedback « MOT PRÉCÉDENT »** : texte centré en haut de la scène, sans boîte (léger voile sombre radial), ombres dures. Signal en 24 px : « +150 » or, « -1 VIE » rouge qui clignote deux fois, « À REVOIR » en entraînement. Correction en dessous : carré pixel de la couleur du genre + mot + nom du genre dans sa couleur. Apparition « pop » en 3 paliers (`steps`).
- Les caractères ✓ et − (absents de la police) ne sont plus utilisés : `+N`, `-1 vie`.
- **Combo** : centré sous le feedback (plus jamais coupé au bord), « COMBO ×N » en pixel, pop à chaque palier ; au palier 3, couleurs arcade qui alternent.
- **Gain de score** : « +N » en pixel or à gauche du score.
