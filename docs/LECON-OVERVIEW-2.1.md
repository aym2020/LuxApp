# LuxApp 2.1 — Maquette 1 : écran d’ensemble de la leçon

Date : 21 octobre 2026  
Branche : `2.1`  
Statut : **version compacte intégrée** ; contrôle du rendu tactile Samsung à effectuer.

## Périmètre

Il s’agit du **premier écran parmi les maquettes retenues**, l’ensemble de la leçon « Moien! ...an Äddi! » : en-tête « Mon chemin / Cours », titre, mission, liste d’unités et barre de navigation. **Ce n’est pas** l’introduction de mission, l’écran de règle, le quiz ou le panneau de cours. Ces autres maquettes ne sont pas intégrées par ce lot.

Les choix restent dynamiques pour toutes les leçons A1.1/A1.2 : titre, mission, état, étapes, nombre de répliques, statut des unités, étoiles, progression, textes, exercices et `+` viennent des objets de leçon et des fonctions existantes.

## Direction artistique appliquée

- Réutilisation exclusive de `public/art/hero-luxapp-mobile.webp` dans l’en-tête, avec un masque de lisibilité ; aucun nouveau média.
- Titres éditoriaux de leçon et d’unité en **Instrument Serif**, commandes et explications en **Inter**.
- Fond noir chaud, photographie masquée, surfaces sobres. La carte Mission reste neutre ; l’unité en cours est seule mise en avant par une légère teinte ambrée.
- Progression de la mission en piste fine et **réelle**, calculée uniquement sur les répliques que l’utilisateur doit produire (\`qui: "toi"\`). Une réplique est dite « préparée » quand l’unité qui l’enseigne est terminée ; cela ne vaut pas validation de la mission.
- « Voir le scénario » et « Tenter la mission » en **liens texte discrets**, sans bouton secondaire à bordure. Les clics et la logique de la mission ne changent pas.
- Le bouton « Commencer » est l’action principale de chaque unité. Les quatre boutons « Mot caché / Quiz / Trous / Écriture » disparaissent **de la carte d’unité** : les séquences guidées de l’unité contiennent toujours ces exercices. Quiz, À trou et Écriture restent également disponibles dans « S’entraîner ». Le mode « Mot caché » reste dans le parcours guidé ; il n’est pas actuellement un type sélectionnable de la rubrique « S’entraîner ». Le moteur d’étape isolée reste présent, sans accès direct dans cette carte.
- « Toute la leçon » et « Bilan » deviennent deux **lignes cliquables**, avec informations utiles et chevron. La première lance exactement la même leçon complète (ou reprend celle en cours) ; la seconde ouvre le bilan de 10 questions. Les raccourcis redondants « Tout revoir » et exercices séparés disparaissent de la vue, sans modifier leur moteur.
- Les bonus « +1 mot », reprises d’entraînement déjà commencées, défis étoiles et reprise d’erreurs restent visibles lorsqu’ils sont applicables.
- En-tête photographique raccourci d’environ 18 px pour rapprocher la carte Mission du titre ; Mission resserrée en hauteur.
- Petites largeurs : actions tactiles d’au moins 44 px, textes repliables, deux liens de mission capables de passer à la ligne si nécessaire.

## Intégration et limites

| Fichier | Rôle |
|---|---|
| `public/lecon-v21.css` | Style strictement limité à `#view-plecon` |
| `public/index.html` | Chargement de la feuille après les styles existants |
| `public/mission.js` | Compteur de répliques à produire et actions secondaires sans changement du jeu | 
| `public/parcours.js` | Rend les cartes et synthèses compactes, conserve les bonus et reprises |
| `test/lecon-overview-v21.test.cjs` | Tests de non-régression du rendu, des actions et de la progression |

Les fonctions `openIntro`, `startUnite`, `openMission`, `voirScenario`, `lancerBilan`, les calculs de score et la logique de progression restent inchangés. Le rendu HTML de `renderParcoursLecon`, `carteUniteHtml` et `chipsEtapes` a été ajusté pour la nouvelle composition. Les leçons sans mission et les contenus spécifiques du studio restent supportés grâce au rendu conditionnel historique.

## Recette mobile

1. Depuis « Mon chemin », ouvrir la leçon 1 puis une autre leçon longue ; contrôler le titre et l’image, sans débordement horizontal.
2. Vérifier sur une mission neuve le compteur « 0 / N répliques préparées », où N est le nombre de répliques `qui === 'toi'` ; après avoir terminé une unité, contrôler le nombre et la barre.
3. Tester les deux liens de mission, « Commencer », « Refaire », « Reprendre », les bonus « + », les rattrapages étoiles et la reprise d’erreurs, sur une leçon neuve et sur une leçon en cours. Confirmer que les quatre raccourcis par type d’exercice ne sont plus affichés dans les cartes.
4. Dérouler jusqu’aux lignes « Toute la leçon » et « Bilan », activer chacune en touchant toute la ligne ; vérifier la reprise d’une leçon complète interrompue et la suppression des boutons « Tout revoir » en doublon.
5. Tester sur Samsung en navigation système normale, petit écran et police agrandie. La barre du bas ne doit pas masquer le bouton d’une unité.
6. Vérifier avec `node --test test/lecon-overview-v21.test.cjs` et les tests de chemin/mission existants.

**Note :** le test de code peut confirmer les attributs et les boutons, mais seule la recette sur appareil confirme l’équilibre visuel exact de la photographie et des retours à la ligne.

## Historique du lot compact — validation des cinq changements

1. Rapprocher le début de la carte Mission du bandeau en réduisant l’en-tête de 206 px à 188 px au format mobile standard (la hauteur reste extensible si le texte déborde).
2. Compacter la carte Mission et laisser deux liens discrets ; suivre uniquement les répliques à produire.
3. Réduire la carte de l’unité à une action pédagogique principale ; maintenir bonus et rattrapages sans les quatre raccourcis redondants.
4. Transformer « Toute la leçon » en ligne cliquable, avec reprise prioritaire lorsqu’un entraînement libre est interrompu.
5. Transformer le Bilan en ligne cliquable, en conservant les mêmes 10 questions mélangées.

La mention **« répliques préparées »** est volontaire : le compteur dépend de la validation des unités, pas de l’évaluation orale ou écrite lors de la mission. Le statut réel de réussite de la mission continue de dépendre du moteur existant.

## SPEC 108 — Actions contextuelles des unités (26 octobre 2026)

**Maquette retenue sur Android :** un composant compact partagé, à icône à gauche, texte et courte précision sur deux lignes, chevron à droite. Cible tactile complète de 76 px minimum, hauteur extensible avec gros caractères, focus clavier visible et aucun badge supplémentaire. Les boutons n'apparaissent que lorsque les conditions métier historiques sont remplies.

- **Revoir mes erreurs** : fond sombre vert/turquoise discret, ↻, sous-texte **« Questions difficiles · étoiles conservées »**. Appel inchangé à `lancerRevisionErreursUnite(u.id)`, session non notée.
- **Gagner ma 3e étoile** : léger fond brun/or, ★, sous-texte dynamique **« [score] % → 90 % · Défi ciblé »**. Appel inchangé à `lancerRattrapageEtoile(u.id)`, rattrapage noté, meilleur score conservé en cas d'échec.
- **Refaire l'unité**, mission, bonus, chemin, Bilan, scores, étoiles, sauvegardes et calculs ne changent pas.
- Styles strictement limités à `#view-plecon` dans `public/lecon-v21.css`. Classes `.pl-rattrapage` et `.pl-revoir-erreurs` préservées pour les contrats existants ; la nouvelle classe commune est `.pl-action-unite`. Version CSS actualisée dans `public/index.html`.

Recette : `node --test test/actions-unite-v21.test.cjs`, `node tests/test_rattrapage_etoiles.js`, `python tests/test_actions_unite.py` (320, 360, 390, 430 et 720 px, 130/200 %), puis tests critiques habituels. Le contrôle tactile sur Samsung réel reste distinct.
