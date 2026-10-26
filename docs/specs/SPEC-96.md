# SPEC 96 — Lux Runner : les trois portails

**Branche :** `2.1` · **Statut :** implémentée — recette Samsung à faire · **Source :** Game Design Document « Lux Runner — Les trois portails » v1.0 (26/10/2026).

## Objectif

Mini-jeu de la rubrique **Jeux** (SPEC 88) pour mémoriser le **genre des noms** luxembourgeois. Un nom s'affiche sans article ; le joueur choisit la voie **Masculin / Féminin / Neutre** avant que le trio de portails n'arrive sur le coureur. Le jeu complète les leçons, il ne remplace pas leurs explications.

## Règles implémentées

- **Temps de décision = trajet jusqu'aux portails.** Tout est piloté par le temps de jeu actif (`partie.temps`) : approche des portails, défilement des marquages, collision. Le résultat ne dépend jamais du nombre d'images (testé à 2, 10, 30 et 60 images/s).
- **Sprint 60** : 60 s de jeu actif, 3 vies. Approche fixée à l'apparition du mot : 6 s (0–20 s), 5 s (20–40 s), 4 s (40–60 s). Une séquence qui dépasserait 60 s n'est pas lancée (arche d'arrivée à la place) ; le chrono n'est jamais prolongé. Défaite à la 3e vie perdue, au temps de l'impact.
- **Validation à la collision uniquement**, sur la **dernière** voie choisie. Aucune voie présélectionnée : sans choix → « Trop tard · Aucun portail choisi », perte d'une vie. Sélection remise à zéro à chaque mot.
- **Score** : +100, +25 par bonne réponse consécutive précédente (bonus plafonné à +100). Erreur ou absence : 0 et série remise à zéro. Aucun bonus de rapidité.
- **Entraînement** : approche de 8 s, vies illimitées, pas de limite de durée, bouton « Terminer », aucun record compétitif.
- **Tutoriel** (première ouverture) : 3 mots, le portail s'arrête à 70 % du trajet tant qu'aucune voie n'est choisie. « Passer le tutoriel » et « Revoir le tutoriel » disponibles.
- **Pause** (bouton, Échap ou P) : chrono, portails et validation arrêtés ; « Reprendre » / « Quitter la partie ». Pause automatique quand l'app passe en arrière-plan (`visibilitychange`). Retour Android : la course est abandonnée (non comptée), retour à Jeux.
- **Contrôles** : trois boutons sous la scène (≥ 44 px, lettre + nom + couleur), toucher direct d'une voie sur la route, glisser horizontal vers la voie voisine, touches 1/2/3 et flèches.

## Banque de mots — `public/runner-mots.js`

- Fichier **généré** par `node tools/runner-genres.cjs` (`--check` pour vérifier). Jamais d'analyse de texte libre pendant la partie.
- Sources : flashcards dont la note commence par « Masculin / Féminin / Neutre », plus une liste `MANUEL` relue (pluriels de la leçon 6 avec genre du singulier, lieux des leçons 21–22, Auto/Dësch/Telefon de la leçon 2). Le genre n'est **jamais** déduit de `e`/`en` ni du français.
- Champs : `id` stable (`a11-l02-fc2002`), `sourceLessonId`, `sourceFlashcardId`, `level`, `lemma`, `translation` (sans article français), `gender` (`m`/`f`/`n`), `articleForm` (règle de l'Eifel : `en` devant voyelle, n, d, t, z, h ; `eng` au féminin).
- 88 noms : A1.1 = 19 m / 19 f / 11 n ; A1.2 = 15 m / 14 f / 10 n. Le niveau actif (`niveauActif`) choisit la banque ; sans au moins 2 noms par genre, la carte affiche « Pas encore de noms validés » au lieu de compléter avec d'autres mots.
- **Tirage** : sac de 6 genres (2 × m, f, n) mélangé → équilibre exact, jamais 3 fois le même genre d'affilée ; pas de répétition d'un nom dans 4 portails ; les noms ratés (parties précédentes `luxRunnerMots`, et partie en cours) ont un poids ×3 à ×7.

## Records (par profil et par niveau)

`luxRunnerRecords[niveau]` : meilleur score, meilleur temps de survie, meilleure précision (si ≥ 5 portails), meilleur combo, parties jouées. Écrits **une fois** en fin de Sprint. `luxRunnerTuto` mémorise le tutoriel. Rien n'est envoyé au cloud ni mêlé à la progression des leçons.

## Rendu

Canvas 2D pseudo-3D (ville nocturne en parallaxe pré-dessinée une fois, route, marquages défilant à la vitesse des portails, arches colorées avec lettre et nom, coureur vu de dos, particules sur réussite, secousse et voie correcte éclairée sur erreur). HUD et commandes en HTML/CSS. `prefers-reduced-motion` : pas de secousse, peu de particules, glissement instantané. Boucle `requestAnimationFrame`, pas de stockage par image ; boucle, minuteries et écouteurs libérés à chaque arrêt.

## Écrans

Carte Lux Runner dans Jeux (après Survie) → préparation (règles + aperçu des portails la première fois ; ensuite « 60 secondes · 3 vies », records, Jouer / S'entraîner) → course → résultats (« Course terminée ! » ou « Plus de vies ! », score, temps, bonnes réponses, précision, combo, record, liste des mots ratés avec genre, article et choix fait ; Rejouer / Revoir mes erreurs / Retour aux jeux).

## Hors périmètre V1

Mode Endurance (le moteur le permet : `runnerAvancer` sans limite), classement en ligne, sons dédiés (les sons de correction de l'app sont réutilisés via `jouerFeedbackSon`).

## Implémentation

- Fichiers : `public/runner.js`, `public/runner.css`, `public/runner-mots.js`, `tools/runner-genres.cjs`, `public/index.html` (vue `view-runner`), `public/jeux-v21.js` (carte du hub, arrêt dans `ouvrirJeux`), `public/navigation.js` (actualisation → Jeux).
- Tests : `node --test test/runner.test.cjs` (référentiel, barème, approche, 60 s pile, cadence d'images, absence de choix, dernière voie, équilibre du tirage, priorité des erreurs, tutoriel, records, intégration) ; `test/jeux-v21.test.cjs` mis à jour.
- Contrôle navigateur (Playwright, 360 × 740 et 430 × 932) : hub, tutoriel, course, pause figée, défaite, victoire 60 s (2 150 points), retour Jeux, aucun scroll horizontal, aucune erreur JS. **Samsung non testé.**

## Recette à faire (Samsung)

1. Fluidité de la course et lisibilité des portails ; changement de voie au doigt et par glissement.
2. Écran éteint / appel pendant une course → pause, reprise sans saut de temps.
3. Retour Android pendant la course, depuis les résultats, depuis la préparation.
4. Réglage du son de l'app respecté.
5. Équilibrage 6/5/4 s à confirmer par des parties réelles.
