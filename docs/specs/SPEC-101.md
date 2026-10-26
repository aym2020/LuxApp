# SPEC 101 — Compte à rebours avant Survie et Lux Runner

**Branche :** `2.1` · **Statut :** implémentée — recette Samsung à faire · **Date :** 26 octobre 2026.

## Comportement
- Au lancement d'une partie, un décompte **« 3, 2, 1, Partez ! »** (Survie) ou **« 3, 2, 1, GO ! »** (Lux Runner) s'affiche au-dessus de la zone de jeu, 700 ms par chiffre.
- **Le chrono ne démarre qu'à la fin du décompte.** Survie : lettres bloquées pendant le décompte (`verrou`), `setInterval` lancé au départ. Lux Runner : état `decompte` (temps de jeu figé), le joueur peut déjà choisir sa voie ; le coureur 3D attend (animation Idle) puis s'élance.
- Pas de décompte pour le tutoriel de Lux Runner.
- Retour Android, sortie du jeu ou « Quitter » pendant le décompte : décompte annulé, la partie ne démarre pas.
- Bips courts (aigu au départ) et vibration brève au départ, selon le réglage son de chaque jeu (Survie : `SurvieFx.sonActif()` ; Runner : réglage « Effets »).

## Style
- **Survie :** chiffres or en Instrument Serif, lueur de feu, voile chaud.
- **Lux Runner :** chiffres néon — 3 bleu, 2 rouge, 1 vert (couleurs des genres), GO doré.
- `prefers-reduced-motion` : chiffres sans animation d'échelle.

## Fichiers et tests
`public/jeux-decompte.js` (composant unique `jeuDecompte`), `public/jeux-decompte.css`, intégration dans `public/jeux-v21.js` (`demarrerSurvie`, `survieArreter`) et `public/runner.js` (`demarrerRunner`, `runnerChoisir`, `runnerArreter`), `public/runner-3d.js` (Idle pendant le décompte). Sans le composant (tests Node existants), Survie démarre comme avant.
Tests : `node --test test/jeux-decompte.test.cjs` (ordre 3-2-1-départ, « fini » unique, annulation, sortie du jeu, intégration) ; `test/jeux-v21.test.cjs` inchangé hors version de cache. Contrôle navigateur : chrono figé pendant le décompte dans les deux jeux, aucune erreur JS.
