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

## Ajustement écriture mobile (21 octobre 2026)

Suite aux captures Android, le champ initial de 114 px était excessif et le CTA « Valider » collait au champ. Le champ débute désormais sur **une ligne (70 px)**, grandit automatiquement jusqu'à 150 px si une phrase est longue, et reste séparé du bouton par 12 px. L'en-tête de session est raccourci ; sur téléphone tactile, **le clavier ne s'ouvre plus tout seul**. Lorsque le clavier redimensionne le viewport, le groupe de saisie est recadré pour laisser le CTA accessible sans recouvrement. Focus discret, accessible au clavier ; mécanismes de validation et de scores inchangés.

Recette complémentaire : écrire « Februar » pour « Février » et une phrase longue, sur clavier Samsung ouvert/fermé ; contrôler le CTA dans les deux cas et le scroll lorsque le clavier monte. Refaire le même test dans une leçon et après une erreur au premier essai.

## Correctif du cache et du clavier (21 octobre, captures 16 h 53)

Une version ancienne des assets semblait encore chargée sur Android : captures avec textarea proche de 114 px malgré le code à 70 px, CTA masqué. Le lien du CSS avait gardé `?v=1` malgré les correctifs. L'HTML pointe désormais vers `exercices-v21.css?v=3`, `app.js?v=3` et `parcours.js?v=3`. Après déploiement de cette branche, **recharger la page** pour récupérer les nouvelles URL. Le groupe de saisie réserve un espace de scroll lors du focus ; à l'ouverture/redimensionnement du clavier, le cadrage vise directement **Valider** plutôt que le conteneur, car seule sa partie haute pouvait être visible.

**À vérifier sur Samsung :** en mode S'entraîner, une consigne courte (« France ») et une longue (« À 10h30… »), toutes deux avec clavier ouvert. Le champ doit rester initialement compact et Valider entièrement accessible. Vérifier aussi plusieurs essais et la fermeture du clavier. Un navigateur peut toujours utiliser une page HTML ancienne tant qu'il n'a pas été actualisé ; ce test visuel confirme les nouveaux assets réellement livrés.

### Consignes longues
Les phrases françaises de plus de 42 caractères reçoivent la classe `question-longue` et une typographie réduite (25–31 px). Les mots isolés conservent la taille éditoriale. Le contenu de la question et la correction ne sont pas transformés.

## Retour de l'entraînement — alignement de l'en-tête

Après contrôle de la capture Android (17:08), le retour était anormalement centré, contrairement aux autres écrans. Cause CSS : l'en-tête flex de `#view-session` avait seulement `max-width:500px` et `margin-inline:auto`, sans `width:100%`. Il se réduisait à son contenu. Fix : largeur entière limitée à 500px, les 21px de padding positionnent le retour sur le bord gauche et le titre reste à droite. Le handler `retour()` n'est pas modifié.
