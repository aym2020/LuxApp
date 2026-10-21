# LuxApp 2.1 — Maquette 1 : écran d’ensemble de la leçon

Date : 21 octobre 2026  
Branche : `2.1`  
Statut : **intégré** ; validation visuelle sur Android à effectuer.

## Périmètre

Il s’agit du **premier écran parmi les maquettes retenues**, l’ensemble de la leçon « Moien! ...an Äddi! » : en-tête « Introduction / Cours », titre, mission, liste d’unités, raccourcis d’exercices et barre de navigation. **Ce n’est pas** l’introduction de mission, l’écran de règle, le quiz ou le panneau de cours. Ces autres maquettes ne sont pas intégrées par ce lot.

Les choix restent dynamiques pour toutes les leçons A1.1/A1.2 : titre, mission, état, étapes, nombre de répliques, statut des unités, étoiles, progression, textes, exercices et `+` viennent des objets de leçon et des fonctions existantes.

## Direction artistique appliquée

- Réutilisation exclusive de `public/art/hero-luxapp-mobile.webp` dans l’en-tête, avec un masque de lisibilité ; aucun nouveau média.
- Titres éditoriaux de leçon et d’unité en **Instrument Serif**, commandes et explications en **Inter**.
- Fond noir chaud, photographie masquée, surfaces sobres. La carte Mission reste neutre ; l’unité en cours est seule mise en avant par une légère teinte ambrée.
- Progression de la mission en piste fine et **réelle**, calculée à partir des répliques apprises, sans nouveau score.
- « Voir le scénario » en action secondaire discrète ; « Tenter la mission · N répliques » en bouton contour. Le contenu vient de la mission, jamais d’un chiffre codé en dur.
- Bouton jaune réservé à l’unité à faire ou à la reprise ; les exercices « Mot caché / Quiz / Trous / Écriture » restent des raccourcis secondaires.
- Les blocs « Toute la leçon » et « Bilan » sont allégés visuellement, mais tous leurs contrôles restent présents.
- Petites largeurs : boutons tactiles d’au moins 44 px, textes repliables, empilement des actions de mission si nécessaire.

## Intégration et limites

| Fichier | Rôle |
|---|---|
| `public/lecon-v21.css` | Style strictement limité à `#view-plecon` |
| `public/index.html` | Chargement de la feuille après les styles existants |
| `public/mission.js` | Barre d’avancement mission accessible et libellé du bouton, calculés sur les données réelles |
| `test/lecon-overview-v21.test.cjs` | Tests de non-régression du rendu, des actions et de la progression |

Les fonctions `renderParcoursLecon`, `carteUniteHtml`, `chipsEtapes`, `openIntro`, `startUnite`, `openMission`, `voirScenario`, `lancerBilan` et la logique de progression restent inchangées. Les leçons sans mission et les contenus spécifiques du studio restent supportés grâce au rendu conditionnel historique.

## Recette mobile

1. Depuis « Mon chemin », ouvrir la leçon 1 puis une autre leçon longue ; contrôler le titre et l’image, sans débordement horizontal.
2. Vérifier sur une mission neuve le compteur « 0 réplique sur N », la barre vide et le CTA de mission ; après avoir terminé une unité, contrôler le nombre et la barre.
3. Tester « Voir le scénario », « Tenter la mission », « Commencer », « Refaire », « Reprendre » et les quatre raccourcis, sur une leçon jamais commencée et sur une leçon en cours.
4. Dérouler jusqu’à « Toute la leçon » et « Bilan » ; contrôler que les actions restent accessibles.
5. Tester sur Samsung en navigation système normale, petit écran et police agrandie. La barre du bas ne doit pas masquer le bouton d’une unité.
6. Vérifier avec `node --test test/lecon-overview-v21.test.cjs` et les tests de chemin/mission existants.

**Note :** le test de code peut confirmer les attributs et les boutons, mais seule la recette sur appareil confirme l’équilibre visuel exact de la photographie et des retours à la ligne.
