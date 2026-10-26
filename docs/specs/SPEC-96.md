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

- **Violet :** icône et libellé « Jeux » de l'accueil avec halo léger (seule la tuile change : CTA Continuer, progression et autres raccourcis restent or), ambiance radiale aubergine de la page Jeux et halo du titre, carte Lux Runner (bordure, glow, dégradé noir → violet), kickers et micro-libellés, barre de temps lumineuse, bouton pause en verre sombre, contours secondaires (S'entraîner, puces Musique/Effets, pause), badge combo, séparateurs des records et des résultats.
- **Or :** Jouer, Rejouer, Reprendre, score, record (pastille « Nouveau record »), point final des titres.
- **Survie** garde son identité or/brun, inchangée.
- **Course :** zone du mot cadrée (lueur diffuse, filet violet, traduction plus claire) ; commandes M/F/N en vraies commandes de jeu (fond teinté par genre, lettre plus grande, état choisi teinté + glow + « TA VOIE ») ; correction en pastille de verre sombre bordée selon le statut ; flash bref vert/rouge de la scène.
- **Canvas :** ciel teinté violet avec brume et étoiles, route plus contrastée, pointillés plus lisibles, bords plus lumineux, perspective plus marquée, lampadaires à halo pré-dessiné ; arches « énergétiques » (sommet arrondi, halo, cœur clair, intérieur translucide, sol teinté, reflet sur la route, lettre dans une pastille au sommet, nom dès que la place le permet) ; aura du coureur au passage (couleur du genre, rouge sur un choc) et écharpe or qui flotte.
- **Résultats :** stats apparaissant en cascade, score et record en or, mots à retravailler en cartes avec barre et pastille de la couleur du genre, article et choix fait.

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
