# LuxApp 2.1 — Nouveautés et versions

Date : 21 octobre 2026  
Branche : `2.1`  
État : intégré ; contrôle visuel Android requis.

## Objectif produit

Depuis l’onglet **Plus**, l'utilisateur peut ouvrir une page **Nouveautés** pour découvrir les changements de la branche 2.1 sans lire des dizaines de messages GitHub. Les changements sont volontairement regroupés par expérience d'apprentissage, avec de courts aperçus visuels réalisés en HTML/CSS : c'est une synthèse éditoriale, pas un journal technique généré à chaque lancement.

La version de l’application apparaît discrètement à la fin du panneau **Plus** : `LuxApp 2.1` sur la branche `2.1`. Le panneau Plus de la branche `v2` affiche **LuxApp 2.0**, sans recevoir la nouvelle page ni aucune modification pédagogique. Ces libellés identifient les deux variantes ; ils ne prétendent pas être dérivés d’une version native Android.

## Présentation

La nouvelle page garde :
- Le noir chaud, l’or `#f5cf4d`, Inter et Instrument Serif.
- Un hero discret réutilisant l’illustration locale `hero-luxapp-mobile.webp`.
- Six sections éditoriales avec aperçu illustré, courte explication et lien vers un commit représentatif.
- Une navigation **← Plus**, une zone de lecture défilante, un lien vers l’historique complet et le rappel `Version 2.1` en bas.
- Des contrôles cliquables de 44 px au minimum, le respect de la zone système Android et de `prefers-reduced-motion`.

Les aperçus sont **illustratifs**, ils n'affichent ni fausses données de progression de l'utilisateur ni scores inventés. Le contenu est embarqué et reste accessible sans connexion. Les liens externes de GitHub sont facultatifs.

## Recherche Git (21 octobre 2026)

Consultation des commits de `2.1` et comparaison GitHub `v2...2.1` : les branches **ont divergé** (à la date du contrôle : 129 commits spécifiques à `2.1` après le point de divergence, 43 propres à `v2`). Il ne faut donc pas présenter `2.1` comme une simple copie linéaire de la dernière version de `v2`. Les six points ci-dessous reprennent les évolutions d'interface et d'utilisation effectivement présentes sur la branche `2.1`, avec un commit d'exemple pour chaque groupe.

| Thème affiché | Changement | Commit de référence |
|---|---|---|
| Accueil | Progression et série épurées, CTA Continue lisible | [b73432262](https://github.com/aym2020/LuxApp/commit/b73432262) |
| Chemin | Espacement corrigé et parcours hiérarchisé | [071948ba2](https://github.com/aym2020/LuxApp/commit/071948ba2) |
| Leçons | Règle et avertissement éditorialisés | [3effc6466](https://github.com/aym2020/LuxApp/commit/3effc6466) |
| Missions | Lecture plein écran du scénario avec bouton fixe | [a181db13f](https://github.com/aym2020/LuxApp/commit/a181db13f) |
| Entraînement | Filtres et configuration de pratique plus clairs | [9e36825df](https://github.com/aym2020/LuxApp/commit/9e36825df) |
| Confort | Correction des contours persistants sur mobile | [228d7f6e2](https://github.com/aym2020/LuxApp/commit/228d7f6e2) |

Ces liens sont des **points d’entrée** : les thèmes ont fait l’objet de plusieurs commits, dont des tests et ajustements ultérieurs. L’historique complet reste accessible depuis la page.

## Deux correctifs supplémentaires

1. **Introduction d’unité : reset du défilement interne.** La fonction `openIntro(uniteId)` remplit `#pi-content`, puis active `view-pintro`. Comme le défilement se fait dans `#pi-content` et non sur `window`, changer de leçon pouvait garder le contenu au bas de la précédente. Le correctif force `scrollTop = 0` sur ce seul conteneur après `showView`. Cela ne touche pas au système de retour et de restauration des autres vues.
2. **Scénario de mission : hiérarchie typographique.** Les intertitres UNITÉ sont plus petits, moins opaques et légèrement séparés des répliques. Les noms des personnages sont un peu plus lisibles ; `TOI` garde son accent jaune. Les textes, audios, traductions et validations restent identiques.

## Fichiers

| Branche | Fichier | Rôle |
|---|---|---|
| `2.1` | `public/nouveautes-v21.js` | Six thèmes, aperçus, ouverture de la page |
| `2.1` | `public/nouveautes-v21.css` | Design de la page et affichage discret de version |
| `2.1` | `public/accueil.js` | Entrée « Nouveautés » et version 2.1 dans Plus |
| `2.1` | `public/index.html` | Chargement JS/CSS |
| `2.1` | `public/parcours.js` | Reset scroll à chaque nouvelle introduction |
| `2.1` | `public/scenario-v21.css` | Hiérarchie des unités/interlocuteurs |
| `2.1` | `test/nouveautes-v21.test.cjs` | Tests de rendu et non-régression |
| `v2` | `public/accueil.js` et `public/style.css` | Affichage discret « LuxApp 2.0 » uniquement |

## Recette Samsung

1. Dans `2.1`, ouvrir **Plus** : « Nouveautés » doit être visible avec le sous-titre et **LuxApp 2.1** en bas.
2. Ouvrir « Nouveautés » : vérifier les six sections, la lisibilité, les aperçus, les retours à la ligne, le défilement complet et le bouton `← Plus`.
3. Fermer la page avec Android Retour, puis rouvrir Plus : aucun panneau bloqué ou superposé.
4. Tester un lien GitHub : ouverture facultative sans bloquer la navigation de l'application.
5. Entrer dans une unité A, défiler jusqu'aux exemples, sortir et ouvrir une autre unité B : retour impératif en haut de B.
6. Dans un scénario de mission, vérifier le contraste des intertitres UNITÉ par rapport aux intervenants et le CTA toujours fixe.
7. Sur `v2`, vérifier « LuxApp 2.0 » dans Plus, sans entrée Nouveautés.
8. Tester police agrandie, petit écran, thème sombre et mode de réduction des animations.

Tests de code : `node --test test/nouveautes-v21.test.cjs`. Les tests statiques ne remplacent pas le contrôle visuel mobile.

## Prochaines étapes

- [x] Détail de la leçon
- [x] Introduction de mission
- [x] Scénario de mission (hiérarchie affinée)
- [x] Introduction d'unité (scroll corrigé)
- [x] Page « Nouveautés » et affichage des versions
- [ ] Panneau Cours
- [ ] Charte globale des animations


## Correctif ouverture sans saut de mise en page — 21 octobre 2026

Symptôme Android : après un appui sur « Nouveautés », le contenu semblait apparaître au centre puis se déployer pendant une fraction de seconde. La cause probable était le passage successif du panneau commun `.panneau` (feuille limitée à 85 vh, ancrée en bas) vers `.panneau.nv21-panel` (plein écran), la seconde classe étant ajoutée **après** l’insertion du nœud dans le DOM.

Le constructeur commun `ouvrirPanneau(html, titre, apresFermeture, classeInitiale = '')` accepte désormais une classe de présentation facultative **avant la création visible** ; toutes les autres ouvertures conservent la classe `panneau` par défaut. `ouvrirNouveautes()` fournit `nv21-panel` dès la construction, sans `classList.add` tardif. La feuille de style annule également l’animation/fondu héritée du panneau commun pour cette page pleine hauteur seulement. Les URLs des fichiers CSS/JS Nouveautés portent `?v=2` pour limiter les problèmes de cache mobile. Aucun effet n'a été ajouté à la mise en page du contenu : les éléments apparaissent directement dans leur état final.

Contrôle : les tests vérifient la classe initiale sur les panneaux spéciaux et ordinaires, la suppression du changement de classe tardif, ainsi que les propriétés CSS de non-animation. Le rendu sur Samsung reste à confirmer visuellement.


## Mise à jour — panneau Cours (21 octobre 2026)

La rubrique « COURS » rejoint les six thèmes initiaux : la page Nouveautés présente désormais **sept évolutions** majeures. Elle montre un petit aperçu de Règles / Lexique / Phrases et renvoie vers le commit de la refonte du panneau Cours. La rubrique reste statique et éditoriale : elle n'est pas alimentée automatiquement depuis GitHub. Le code de la nouvelle vue est décrit dans [COURS-2.1.md](COURS-2.1.md).
