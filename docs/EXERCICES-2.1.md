# LuxApp 2.1 — Exercices unifiés

> **AVERTISSEMENT — RECRÉATION NON VALIDÉE (21 octobre 2026).** Les mentions antérieures « code poussé » ou « implémenté » documentent seulement un état historique ; les captures Android montrent des régressions majeures (corrections incohérentes, dispositions et états juste/faux cassés). Ne pas considérer cet écran validé. Lire [post-mortem et protocole anti-régression](POSTMORTEM-EXERCICES-2.1-2026-10-21.md). Ce document ne corrige aucun bug.


**Mise à jour 21/10 :** stabilisation mobile de S'entraîner → [SPEC 87](specs/SPEC-87.md).

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

## Réparation des corrections (21 octobre 2026, soir)

La refonte avait uniformisé les corrections au détriment de leur sens. Corrigé sans toucher aux moteurs (notation, essais, rappels, audio, sauvegarde) :

- **Titres réels rétablis** : `showFeedback()` affiche de nouveau le titre transmis (« Bien joué ! », « Juste ! », « Juste, au 2e essai », « Pas encore », « La réponse : … ») au lieu de « Bien vu. » / « À retenir ». Entraînement : « Juste ! » / « Pas encore » + « Bonne réponse : … ».
- **Un seul message à la fois** : la correction finale masque le « Pas encore » temporaire du premier essai (mot caché et écriture).
- **Trou révélé en vert** : après une erreur, le trou contient la bonne réponse ; il n'est plus coloré comme une erreur (parcours et entraînement).
- **Gras des points d'attention** : `noteHtml()` échappe le texte et ne garde que `<b>` ; plus de `<b>Madamm</b>` affiché littéralement.
- **Bandeau de correction du parcours** de nouveau collé en bas (`position:sticky`), fond et titre vert/rouge, contenu aligné sur l'exercice ; texte long défilant, « Continuer » toujours visible. Entraînement : correction encadrée vert/rouge dans le flux (SPEC 59).
- **Choix** : bonne réponse en vert, mauvais choix en rouge (au lieu de gris/brun).
- **Mot caché** : `#view-parcours .mc-case` écrasait `.mc-case.vert` / `.indice` (spécificité) ; états redéclarés. Le score précise « sans indice » ou le nombre d'indices.

Test de comportement : `test/exercices-etats-v21.test.cjs` exécute les vraies fonctions sur un faux DOM (titres, masquage de l'erreur, couleur du trou, gras, règles CSS clés). Ajouté au workflow 2.1. Recette tactile Android toujours nécessaire.


## Son des lettres « Mot caché » et Survie (22 octobre 2026)

Les lettres mélangées de l’étape **Mot caché** (`public/parcours.js`) jouent désormais **exactement le même son synthétisé ascendant** que les tuiles de Survie : `SurvieFx.lettre(position)`, fonction déjà incluse par `public/survie-vfx.js`. Une note à chaque tuile **réellement ajoutée**, au toucher ou avec le clavier physique ; aucune note en cas de touche ignorée, annulation, suppression, collage, indice ou reconstitution automatique de l’UI. `position` correspond au rang de la lettre posée, comme dans Survie.

L’audio est facultatif, ne bloque jamais la saisie si `AudioContext` manque ou refuse de démarrer et **respecte le même réglage de son par profil** que Survie (`luxSurvieSon`, enregistré localement ; désactivation dans Survie coupe aussi les notes de Mot caché). La prononciation pédagogique LOD reste séparée et déclenchée explicitement par « Écouter » ; ne jamais la remplacer par cet effet d’interface. Aucun changement aux cases, indices, accents, notes, score, progression, sessions d'écriture ni mission. Tests unitaires de tapping, clavier, absence de son sur actions ignorées, mode silencieux et absence de module ; vérification tactile Samsung encore nécessaire.


## Anomalie Samsung P0-01 — Valider disparaît après plusieurs erreurs (22 octobre 2026)

Captures de « Bonsoir ! » (Gudden Owend) : le contenu d’aide s’étend dans `.mc-milieu` et repousse les commandes de `.mc-saisie` sous la navigation Android. Correction strictement visuelle : reconstruction à hauteur `100dvh`, milieu scrollable, actions non rétractables au pied. Le mode découverte, le bilan, le clavier actif, les scores et les JSON sont inchangés. Test Chromium : `tests/test_motcache_cta_mobile.py`. **Recette Samsung réelle encore nécessaire.**
