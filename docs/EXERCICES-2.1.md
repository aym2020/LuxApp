# LuxApp 2.1 — Exercices unifiés

**Branche exclusive :** `2.1`. **Statut :** code poussé, validation tactile Android à faire.

## Direction visuelle

Même vocabulaire graphique pour les exercices du parcours et de « S'entraîner » : fond noir chaud, question en Instrument Serif sans grosse carte, options alignées sur une colonne, saisie et CTA or cohérents. Une correction discrète suit la question : séparation fine, « Bien vu. » ou « À retenir », bonne réponse si nécessaire et bouton Continuer/Suivante. Pas d'écran vert ou rouge.

## Ordre et périmètre

Leçon : **1. Mot caché → 2. Quiz → 3. Trous → 4. Écriture**. L'ancien type de donnée `flashcards` correspond au moteur de **Mot caché** ; ce n'est pas une cinquième étape. « S'entraîner » conserve la sélection et le mélange de quiz, trous et écriture (ainsi que les questions historiques éventuellement admises par ce moteur).

`public/exercices-v21.css` est chargé après les autres CSS, avec sélecteurs limités à `#view-parcours` et `#view-session`. Les moteurs `parcours.js` et `app.js` restent en place : score, indices, deux essais d'écriture, variantes, audio, reprise, sauvegarde et correction des erreurs. Seule modification UX intentionnelle : **quiz/trous ne passent plus automatiquement à la question suivante**, l'utilisateur lit la correction puis appuie sur le bouton.

## Recette

1. Tester la progression dans les 4 étapes de leçon ; faire une réponse juste et une fausse pour chaque type.
2. Vérifier que les trois propositions de Trous forment une colonne (et que les 4 propositions de Quiz également).
3. Vérifier le premier et second essai en Écriture, la saisie clavier Android et l'audio de correction.
4. Tester les tuiles, les indices, les accents et le score de Mot caché.
5. Tester une révision de 20 questions, les erreurs fréquentes et une séance d'examen : bon score et correction persistante jusqu'au clic sur Suivante.
6. Vérifier 320 px de largeur, faible hauteur, grande police et `prefers-reduced-motion`.
7. Vérifier que les boutons Cours/Accueil/Retour et les sauvegardes ne régressent pas.

La recette visuelle mobile réelle reste nécessaire ; les contrôles statiques seuls ne la remplacent pas.
