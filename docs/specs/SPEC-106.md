# SPEC 106 — Feedback de collision compact et portails moins éblouissants

**Branche** : `2.1` · **Date** : 26 octobre 2026 · **Sources** : captures Android et SPEC 96 / SPEC 105.

## Problème observé
Les bandeaux « Correct · e Bild · neutre » ou « Trop tard · eng Dier · féminin » restaient visibles 1,4 seconde **alors que le mot du portail suivant était déjà affiché**. Visuellement, ils pouvaient être interprétés comme la correction de la question courante. Les larges pastilles centrées détournaient le regard du coureur et des trois voies. Les halos 3D bleu/rouge/vert fusionnaient lorsque les portails se rapprochaient.

## Décision de conception
Remplacer la notification textuelle « Correct/Faux/Trop tard » par une micro-correction **intégrée à la scène, en haut à gauche**, qui indique explicitement **« MOT PRÉCÉDENT »**.

- **Réussite Sprint** : signal vert `✓ +100` (ou bonus réel), puis la forme article + nom et le genre précédemment évalués.
- **Erreur Sprint** : signal rouge `−1 vie`, puis forme correcte et genre ; si aucun portail n'a été choisi : `sans choix`.
- **Tutoriel / entraînement** : signal `À revoir` (pas de vie retirée), suivi de la correction.
- **Durées** : 650 ms pour une réussite, 1 050 ms pour un échec. Elles concernent *uniquement* la notification. Aucun blocage de `runnerAvancer`, de l'arrivée des portails, du compte à rebours, ni aucune modification des scores/records.
- **Accessibilité** : zone de feedback déjà dotée de `role=status` / `aria-live=polite` ; article en `lang=lb`, libellés complets, contrastes élevés et aucun masquage des commandes.
- **Robustesse** : notification précédente remplacée à la collision suivante, timer libéré à l'arrêt ; le callback vérifie qu'il appartient toujours à la partie affichée. `pointer-events:none` et `prefers-reduced-motion`.

Le gain de score animé, le flash de couleur, les vibrations, les effets sonores et les animations de franchissement existants sont **préservés**. Il n'y a pas de deuxième grande carte ni de nouvelle image.

## Effets visuels des portails
Pour réduire l'éblouissement d'environ **30 %**, sans perdre l'information essentielle :
- 3D `runner-3d.js` : alphas des halos précalculés multipliés par 0,7, reflet au sol de 0,80 à 0,56, bloom de 0,42 à 0,30 (avec désactivation automatique sur appareils lents maintenue).
- Secours 2D `runner-rendu.js` : contours externes larges de 0,14 à 0,10 et de 0,30 à 0,21.
- **Inchangés** : formes de portails, liserés nets, lettres M/F/N, couleurs sémantiques, physique de course, modèles 3D, bank de mots, et enregistrement de progression.

## Fichiers et cache
`public/runner.js`, `public/runner.css`, `public/runner-3d.js`, `public/runner-rendu.js`, `public/index.html`, `test/runner.test.cjs`.

Versions incrémentées : `runner.js?v=21`, `runner.css?v=11`, `runner-3d.js?v=12` (import dynamique), `runner-rendu.js?v=3` (secours Canvas).

## Recette
- Android 320–430 px, mots longs dont `Wollekekratzer`, affichage d'une correction au milieu d'une nouvelle question, feedback positif/erreur/absence, entraînement/tutoriel, pause/relance, fin de partie.
- Comparez 2D et 3D près des portails : absence de fusion des halos, contours et lettres toujours lisibles.
- Vérifier que les sons de collision et les vibrations existants jouent encore, que le chrono continue et qu'aucune interaction de voie n'est bloquée.
- Tester les tailles de texte augmentées et `prefers-reduced-motion`.

**Recette réelle Samsung et suite complète à exécuter avant validation définitive.**
