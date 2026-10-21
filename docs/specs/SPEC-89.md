# SPEC 89 — Deux modes Survie, vocabulaire et compétition

**Branche :** `2.1` · **Statut :** conception, NON implémenté dans le jeu public · **Suite :** SPEC 88 · **Dépendances :** SPEC 90, SPEC 91.

## Décision produit

`Jeux → Survie → Mes mots | Arène → Choisir 2 pouvoirs → Partie → Résultats`.
Un **seul noyau de règles**, avec deux configurations explicites et des records séparés. Ne pas ajouter de scroll à l'accueil, ne pas toucher à la progression pédagogique ni aux examens.

### Mes mots — jouer avec le vocabulaire rencontré

- Source : mots réellement présentés/pratiqués par l'utilisateur (pas simplement débloqués par l'accès à la leçon). Source exacte à fiabiliser avant livraison : le code actuel considère parfois la leçon entière « vue » ; auditer les marqueurs de progression disponibles.
- Paliers initiaux de **pool admissible unique** : 0–3 = jeu indisponible et lien vers le Chemin ; 4–19 = **Sprint 45 s**, 2 pouvoirs simples, pas de draft ; 20–49 = **Survie courte 90 s**, 2 pouvoirs + un choix de récompense limité ; 50+ = **Survie complète 180 s**, système de 3 emplacements et upgrades I–III.
- Nombre de mots et statut des modes visibles avant démarrage. Répétitions autorisées lorsque le pool est épuisé, mais empêcher les doubles consécutifs si pool ≥2. Éviter que 10 mots soient considérés comme une preuve de compétence ; ce mode est ludique, non diplômant.
- Le vocabulaire rencontré inclut A1.1 et A1.2, indépendamment de l'onglet actuellement affiché. Il ne doit pas révéler de mots de leçons non étudiées.
- Record local par profil : meilleur score de Mes mots, meilleure streak et total de mots, séparés du record Arène. **Ne pas écraser** `luxSurvieBest` existant ; écrire une migration douce ou conserver cet ancien record en lecture.

### Arène — défi équitable sur tous les mots admissibles

- Réserve : **tout le vocabulaire admissible du contenu LuxApp**, leçons A1.1/A1.2, sans critère de progression. Exclure les phrases, les traductions ambiguës, les articles dont la présence est imprévisible, les graphies incohérentes et les doublons. Construire un **index audité et versionné** avec identifiants stables, traduction française précise, graphie attendue, variantes linguistiques validées et longueur. Le filtrage actuel de SPEC 88 n'est qu'une première approximation.
- Auditer quantité et répartition par longueur avant de fixer les vagues ; cible **200–250 mots distincts minimum** souhaitable pour les longues parties, pas une assertion que le dépôt en dispose déjà.
- Défi quotidien : `challengeId`, version du corpus, version des règles, seed de tirage. Ordre des mots, ordre des lettres mélangées, événements/vagues, propositions de draft déterministes **pour un même challenge et un même choix d'actions**. Aucun `Math.random()` non contrôlé côté compétitif. Ne pas ajuster le tirage suivant en fonction de la performance ou du build.
- Le joueur choisit ses pouvoirs et ses actions : ces **décisions** restent libres. Équité = mêmes règles, même seed et accès au même corpus, pas builds identiques imposés.
- Durée maximale Arène 180 s **de temps réel de partie**, indépendamment des freezes d'horloge du jeu (pauses de choix exclues). Classement selon points, puis meilleure série, puis nombre de mots, puis durée si nécessaire.
- **Leaderboard serveur uniquement** pour Arène. Connexion pour publier ; spectateur/invité peut jouer hors classement. Records Mes mots privés. Aucun avantage permanent/payant.
- Prévention fraude : ne jamais faire confiance au score envoyé par le navigateur. Journal d'événements borné (`seed/challengeId, challenge/rules versions, décisions de build, actions, timing monotone`), validation serveur/replay et contrôles de plausibilité ; signatures, nonce anti-rejeu, rate limits, protection de la vie privée et politique d'expiration. Un client JS exposé n'est pas une preuve d'intégrité ; décider de l'architecture avant mise en ligne du classement.
- Gestion versions : si le corpus ou les règles changent, **nouveau challenge et nouveau leaderboard** ; ne pas mélanger les résultats de règles incompatibles.

## UX mobile et accessibilité

- Page Survie : 2 cartes, « Mes mots » sobre et « Arène » valorisée, sans faire passer le mode personnel pour un mauvais jeu ; les 2 modes ont builds, combos et feedback. Pour moins de 20 mots, expériences simplifiées.
- Écran de build : choix **2 capacités au départ**, cartes tactiles ≥44 px, différences actif/passif indiquées, comparaisons niveau I/II/III ; accessible lecteur d'écran.
- HUD : mot et tuiles centraux, timer, streak/multiplicateur visibles, max 3 pouvoirs en bas (actif = bouton et recharge lisible, passif = indicateur non cliquable). Aucun panneau cachant les lettres lorsque le chrono tourne.
- En cas de draft : vraie **pause atomique** du timer et de la Tempête ; désactiver tout input du jeu jusqu'au choix, pas de recharge de cooldown pendant pause. Retour Android géré explicitement.
- Réduction des mouvements et contrastes, feedback bon/faux non exclusivement coloré, pas de vibration forcée, pas de microtransactions.

## Critères d'acceptation

Tests du pool réel (vocabulaire vu vs simple leçon déverrouillée, duplications, 4/10/20/50 mots), deux records distincts, sortie et reprise, seed déterministe du défi, séparation modes, 320/360/390/430 px et Samsung. Performance et accessibilité mesurées. Aucun leaderboard public tant que replay serveur et audit des mots ne sont pas faits.
