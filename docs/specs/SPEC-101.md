# SPEC 101 — Compte à rebours avant Survie et Lux Runner

**Branche :** `2.1` · **Statut :** implémentée — recette Samsung à faire · **Date :** 26 octobre 2026.

## Comportement
- Au lancement d'une partie, un décompte **« 3, 2, 1, Partez ! »** (Survie) ou **« 3, 2, 1, GO ! »** (Lux Runner) s'affiche au-dessus de la zone de jeu, **900 ms par chiffre** (V2). Le jeu démarre dès l'affichage de « Partez ! » / « GO ! », puis le voile s'efface en fondu (~650 ms).
- **Le chrono ne démarre qu'à la fin du décompte.** Survie : lettres bloquées pendant le décompte (`verrou`), `setInterval` lancé au départ. Lux Runner : état `decompte` (temps de jeu figé), le joueur peut déjà choisir sa voie ; le coureur 3D attend (animation Idle) puis s'élance.
- Pas de décompte pour le tutoriel de Lux Runner.
- **Lux Runner, son et affichage (V2) :** pendant l'appui sur Jouer, l'audio est seulement déverrouillé (`RunnerAudio.preparer()`, `jeuDecompteDebloquer()`). Le décompte attend que la scène 3D soit affichée (`p.affichage.pret3d`, 2,5 s max, puis deux images) ; la musique (`RunnerAudio.demarrer()`) ne part qu'au GO (ou dès la scène prête pour le tutoriel).
- Retour Android, sortie du jeu ou « Quitter » pendant le décompte : décompte annulé, la partie ne démarre pas.
- Bips courts (aigu au départ) et vibration brève au départ, selon le réglage son de chaque jeu (Survie : `SurvieFx.sonActif()` ; Runner : réglage « Effets »).

## Style
- **Commun (V2) :** voile sombre léger en fondu, disque sombre flouté (136 px) avec un anneau qui se vide pendant chaque chiffre ; chiffre blanc en **Inter 800** (`var(--font)`, la police du chrono), apparition douce (fondu + échelle 0,82 → 1). Départ : pastille de la couleur d'accent, texte foncé.
- **Survie :** anneau et pastille or.
- **Lux Runner :** anneau 3 bleu, 2 rouge, 1 vert (couleurs des genres), pastille GO dorée.
- `prefers-reduced-motion` : aucune animation, voile retiré sans fondu.

## Fichiers et tests
`public/jeux-decompte.js` (composant unique `jeuDecompte`), `public/jeux-decompte.css`, intégration dans `public/jeux-v21.js` (`demarrerSurvie`, `survieArreter`) et `public/runner.js` (`demarrerRunner`, `runnerChoisir`, `runnerArreter`), `public/runner-3d.js` (Idle pendant le décompte). Sans le composant (tests Node existants), Survie démarre comme avant.
Tests : `node --test test/jeux-decompte.test.cjs` (ordre 3-2-1-départ à 900 ms, « fini » unique au GO puis voile retiré après le fondu, musique Runner au GO, annulation, sortie du jeu, intégration) ; `test/jeux-v21.test.cjs` inchangé hors version de cache. Contrôle navigateur : chrono figé pendant le décompte dans les deux jeux, aucune erreur JS.
