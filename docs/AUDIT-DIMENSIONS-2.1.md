# LuxApp 2.1 — Audit des dimensions et proposition d'harmonisation

**Date :** 23 octobre 2026  
**Référence GitHub :** `aym2020/LuxApp`, branche `2.1`, commit `ff6d6ee9e355bc170b6235728fdeb682122c4982`  
**Périmètre :** vingt vues HTML principales, couches de présentation et panneaux complémentaires.  
**Statut :** audit statique du code CSS/HTML et analyse qualitative des cinq captures PC fournies ; **aucun test visuel automatisé ni mesure de DOM à l'exécution** dans ce rapport. Les dimensions ci-dessous sont des contraintes CSS, non des dimensions mesurées de tous les états. Les tailles finales peuvent dépendre de la fenêtre, du zoom, du contenu et de la cascade.

## 1. Constats centraux

- Toutes les vues `.view` disposent d'un plafond global `max-width: 720px` (`public/style.css`, début du fichier) et le corps les centre horizontalement.
- `#view-dashboard .accueil` définit **470px** : l'accueil paraît donc moins large que les pages de leçons, de cours et d'examens.
- `#view-jeux .jeux-hub` et `#view-survie .survie-jeu` définissent **470px**, tandis que leur enveloppe a un plafond de 720px.
- Les zones de réponse des vues `#view-parcours` et `#view-session` sont limitées à **500px** dans `public/exercices-v21.css`.
- Le résultat Survie a lui-même un plafond de **470px** puis un contenu à **420px**.
- La barre de navigation `.nav-bas` et les bandeaux `.cta-fixe` ont un plafond de **720px**, qui peut être visuellement différent de leur contenu principal plus étroit.
- Le panneau général `.panneau` mesure au maximum **560px**, la feuille Cours `.cp-feuille` **720px**, la sélection des leçons de révision `.rs-v21-sheet` **560px**, l'aide Mot caché **500px**.
- Des stratégies verticales distinctes (`height:100dvh`, `min-height:100dvh`, scroll central, footer fixe ou position sticky) sont parfois nécessaires, mais leur expression PC n'est pas harmonisée.

## 2. Inventaire des 20 vues principales

| Vue HTML | Fonction | Plafond enveloppe CSS | Limite interne explicitement identifiable | Géométrie verticale / notes |
|---|---|---:|---|---|
| `view-dashboard` | Accueil | 720px | `.accueil`: **470px** | Sur accueil actif, vue remplissant la hauteur, scroll interne si nécessaire ; menus variables selon session |
| `view-lessons` | Mon chemin | 720px | Aucun maximum inférieur sur `.chemin-page` | Page éditoriale à longueur variable, liste verticale ; navigation en bas selon état |
| `view-plecon` | Vue d'une leçon / unités | 720px | Pas de plafond inférieur pour `.pl-head` et `.pl-units` | Hauteur dictée par les cartes, scroll de page ; photo de tête de 188px minimum |
| `view-pintro` | Introduction d'unité | 720px | `.pi-content` sur la largeur de vue | Hauteur **100dvh**, zone centrale scrollable, CTA bas préservé |
| `view-decouverte` | Découverte guidée | 720px | `.dc-contenant` sur la vue ; certains textes max 385px | **100dvh**, contenu scrollable, zone CTA dédiée ; scène min 290px (260px sur faible hauteur) |
| `view-parcours` | Exercices au fil du cours | 720px | `.pc-body`: **500px** | Dans plusieurs états, hauteur de viewport et feedback sticky ; état Mot caché sans clavier et avec clavier très sensibles |
| `view-pfin` | Bilan d'unité / étape | 720px | `.pf-content` largeur héritée | `min-height:100dvh`, CTA éventuellement fixe (largeur globale 720px) |
| `view-review-setup` | Paramétrage de S'entraîner | 720px | Zone de scroll pleine largeur de vue ; feuille secondaire 560px | En présence de nav, hauteur `100dvh - 76px - safe-area`, footer propre |
| `view-session` | Entraînement libre | 720px | `.session-body` et header: **500px** | Saisie/clavier et correction dans le flux ; parcours d'états distinct de `view-parcours` |
| `view-msintro` | Introduction de mission | 720px | Pas de plafond inférieur confirmé | `100dvh`, contenu scrollable, actions en pied sticky |
| `view-mission` | Jeu mission / discussion | 720px | Bulles limitées à ~84% de la conversation, sans plafond intérieur absolu | `100dvh`, entête stable, conversation scrollable et réponse en pied ; clavier Android critique |
| `view-jeux` | Hub des mini-jeux | 720px | `.jeux-hub`: **470px** | Colonnes compactes, dimensionnement dépendant du contenu |
| `view-survie` | Partie et résultat Survie | 720px | `.survie-jeu`: **470px** ; fin: **470px**, contenu **420px** | `100dvh`, HUD/chrono, résultat avec scroll central indépendant, actions fixes |
| `view-reglages` | Compte et réglages | 720px | Contenu héritant principalement de la vue | Formulaires et listes ; la gestion de compte est une fonction sensible |
| `view-lecon` | Écran leçon historique | 720px | Styles divers internes, sans plafond global inférieur identifié | Présent dans le HTML ; vérifier son utilisation réelle avant de le modifier |
| `view-lexique` | Lexique | 720px | Recherche et liste héritées de la vue | Liste défilante, potentiellement longue |
| `view-pieges` | Mes pièges | 720px | Héritage général | Historique / corrections, densité variable |
| `view-examens` | Catalogue des examens | 720px | Héritage général | Cartes, sujets et résultats historiques |
| `view-examen` | Passage d'examen | 720px | `.ex-body` sur largeur de vue | `100dvh`, en-tête et étapes fixes, contenu défilant, banque de réponses/CTA stables |
| `view-examen-result` | Résultat et correction | 720px | Héritage général ; anneau du score 150px | Contenu et correction longs, compensation de ~96px pour CTA fixe |

**Lecture :** « 720px » signifie ici le plafond de la **vue extérieure**. Il ne prouve pas que chaque carte ou chaque bloc visible mesure 720px. Cette différence explique une grande partie du décalage visuel constaté.

## 3. Composants transversaux hors des vingt vues

| Composant | Plafond déclaré | Hauteur / comportement | Risque d'incohérence |
|---|---:|---|---|
| Navigation inférieure `.nav-bas` | **720px** | Fixed en bas ; boutons min 56px, zone de réservation de 76px | Plus large que l'accueil et le hub Jeux |
| CTA fixe `.cta-fixe` | **720px** | Fixed, padding safe area | Plus large que les contrôles d'exercice à 500px |
| Menu Plus / recette `.panneau` | **560px** | Fixed bas, max-height 85vh | Taille différente de Cours |
| Cours `.cp-feuille` | **720px** | Fixed bas, max-height 88dvh | Très large par rapport à l'exercice qui l'a ouvert |
| Sélection de révision `.rs-v21-sheet` | **560px** | Fixed bas, max-height 85dvh | Même ordre de grandeur que Plus |
| Aide Mot caché `.mc-aide-dialog` | **500px** | Fixed bas, max-height min(76dvh, 590px) | Bon rapport avec largeur d'exercice, différent de Cours |
| Portail de connexion `.pa-page` | **500px** | Min-height 100dvh | Plus étroit que la vue de leçon |
| Lecteur d'exemples `.exv` | Viewport complet ; contenu **560px** | Overlay pleine page, contenu scrollable | Header plein écran tandis que corps reste centré |
| Carte d'information invitée `.pi-carte` | **365px** | Max-height 100dvh - 32px | Exception justifiée : dialogue, non page principale |
| Dialogues `.dlg-carte` | **400px** | Modales | Exception justifiée : dialogue, non page principale |
| Bulles contextuelles `.bulle-contexte` | **306px** max | Positionnées près de l'élément cible | Exception justifiée : popover |

## 4. Incohérences identifiées sur les cinq captures PC

1. **Accueil vers écran de leçon :** le contenu passe d'une colonne de 470px à une page qui peut remplir 720px ; le hero et les cartes changent de largeur.
2. **Présentation de leçon vers introduction :** la même largeur extérieure est disponible, mais la composition devient plein viewport vertical et l'action descend au bas de la fenêtre ; impression de densité différente.
3. **Jeux vers Survie :** les deux contenus restent à 470px, ce qui est cohérent localement, mais ne correspond pas au gabarit des leçons et examens.
4. **Intro :** le bouton primaire suit la largeur du bandeau global et non toujours la largeur d'un contenu textuel resserré ; sur PC, la distance verticale entre règle et CTA peut être considérable.
5. **Rythme horizontal :** les points d'ancrage (retour, titres, listes, boutons, footer) varient davantage que nécessaire.

Ne pas confondre **différence d'espacement voulue** (jeu immersif versus liste éditoriale) et **incohérence involontaire** (largeur et alignements de l'enveloppe).

## 5. Proposition de système cible

### Dimensions communes proposées (à valider avant code)

| Rôle | Token recommandé | Valeur cible |
|---|---|---:|
| Enveloppe commune de toutes les pages | `--layout-shell` | **640px** |
| Lecture éditoriale confortable / textes longs | `--layout-reading` | **560px** |
| Bloc interactif concentré (quiz, saisie, mot caché, Survie) | `--layout-focus` | **500px** |
| Feuille contextuelle principale (Plus, Cours, recette) | `--layout-sheet` | **640px** au maximum |
| Dialogues courts | `--layout-dialog` | **400px**, exception |
| Gouttière gauche/droite | `--layout-gutter` | **16px mobile / 24px bureau** |
| Barre de navigation et CTA global | lié à `--layout-shell` | **640px** |

**Principe :** même enveloppe extérieure de 640px pour la continuité de navigation, tandis que certains **blocs intérieurs** sont volontairement à 500–560px pour la lecture ou l'attention. Les marges visuelles sont calculées à partir des mêmes repères. Sur mobile <640px, toutes les vues utilisent 100% de largeur avec gutters appropriés. Ne pas tenter de faire occuper 640px aux lettres de Survie ou aux bulles de mission.

Exemple indicatif de tokens, non implémenté :

```css
:root {
  --layout-shell: 640px;
  --layout-reading: 560px;
  --layout-focus: 500px;
  --layout-sheet: 640px;
  --layout-gutter: clamp(16px, 3vw, 24px);
}

/* À appliquer aux bons conteneurs après audit de cascade, pas comme patch global aveugle. */
.view { width: 100%; max-width: var(--layout-shell); }
```

### Comportement cible par famille

- **Accueil, Chemin, présentation de leçon, hub Jeux :** même largeur extérieure **640px**, mêmes axes pour entêtes et actions, cartes et hero composés à cette largeur quand cela améliore la lisibilité. Survie reste un *jeu de lettres centré* et non une grille de lettres étirée.
- **Contenus pédagogiques longs, lexique, pièges, examen et correction :** largeur de page 640px ; bloc de lecture plafonné à 560px si la longueur de ligne devient excessive. Tables/banques de mots gérées localement, jamais de débordement horizontal.
- **Exercices, entraînement, mission, Survie :** enveloppe 640px, zone fonctionnelle cible 500px. Les headers ont les mêmes axes que la page, les réponses et la saisie restent centrées ; pas de déplacement des zones tactiles au changement d'état.
- **Résultats :** enveloppe 640px ; score/anneau éventuellement plus étroit ; CTA lié au même repère que la vue et son contenu.
- **Panneaux :** Plus et Cours partagent un plafond d'environ 640px ; exceptions explicites pour aides et modales compactes. Le mode recette utilise les mêmes règles.

### Verticalité : ne pas harmoniser en forçant toutes les vues à `100dvh`

| Type | Règle conseillée |
|---|---|
| Page de consultation (accueil, chemin, leçons, lexique, sujets) | Scroll naturel de la page ou d'une seule zone principale, sans pied artificiellement collé |
| Activité immersive (exercices, Survie, mission, examen) | Hauteur du viewport si nécessaire ; top/bas stables ; centre scrollable |
| Introduction d'unité ou découverte | Titre/règle près du haut ; centre scrollable ; CTA en bas seulement si pertinent, avec comportement desktop évitant les immenses distances visuelles |
| Bilan | Résultat mis en avant, détails en dessous ; CTA accessible mais pas superposé |
| Panneau | Max-height bornée et contenu interne scrollable ; safe area respectée |

Pour PC à très grande hauteur, **ne pas imposer un vide géant** entre message et action. Si l'action reste en bas pour cohérence mobile, utiliser une zone centrale qui structure l'espace, ou une adaptation desktop ciblée sans changer l'ordre du focus.

## 6. Où corriger : ordre et fichiers

1. **Règles de dimension et composants :** définir les nouveaux tokens dans `public/design-tokens.css`, corriger `.view`, `.nav-bas` dans `public/style.css`, `.cta-fixe` dans `public/components.css`, vérifier les panneaux de `public/style.css`.
2. **Accueil et Chemin :** `public/accueil-v21.css`, `public/chemin-v21.css`, `public/lecon-v21.css` ; ajuster max-width et padding, préserver le hero approuvé et les états de progression.
3. **Jeux / Survie :** `public/jeux-v21.css` ; mettre l'enveloppe commune sans agrandir les lettres ou casser le résultat, le chrono et la disposition verticale.
4. **Parcours et entraînement :** `public/exercices-v21.css` ; conserver l'aire interactive resserrée, harmoniser headers/footer et préserver tous les états bon/faux, clavier, correction et bouton Continuer.
5. **Introductions / résultats / missions / examens :** `public/style.css`, `public/intro-unite-v21.css`, `public/mission-intro-v21.css`, `public/scenario-v21.css`, éventuellement CSS des examens ; travail à fort risque de régression Android.
6. **Panneaux :** Cours et Plus, sélection révision, aides, modales ; exceptions de dimensions explicitement documentées.

**À éviter :** `* {max-width:640px}` ; ajout d'une nouvelle surcharge en fin de `style.css` qui contredit des règles locales ; `transform` sur `.view` ; forcer `overflow:hidden` sans test de clavier et de zoom ; modifier la navigation ou la progression pour un problème de présentation.

## 7. Matrice de validation (avant publication)

- **Mobile :** 320, 360, 390, 430px ; hauteurs courtes et longues ; safe areas ; Samsung/Chrome réel ; clavier déployé ; focus ; bouton Continuer ; retour Android ; contenu à 130% et 200% ; pas de micro-scroll inutile ni contenu coupé.
- **Tablette / PC :** 720, 768, 1024, 1280, 1440, 1920px ; fenêtres redimensionnées, zoom 100%/125%/150%; hauteur 600/768/900/1080px ; aucun saut horizontal visible entre Accueil, Chemin, Leçon, Intro, Exercice, Résultat, Jeux, Survie, Cours.
- **Fonctionnel :** correction bon/faux, rattrapage, navigation, replay, scores fictifs de recette, résultats d'examen, sauvegarde, première connexion, audio ; les tests cloud ne peuvent pas être validés sur une recette `RECETTE=1` sans Firebase.
- **Automatisé :** en plus de `bash tools/critique.sh rapide` et `bash tools/critique.sh`, tests Playwright vérifiant `getBoundingClientRect()` des enveloppes et CTA, avec captures comparatives à 390, 720 et 1440px ; plusieurs états de chaque famille.
- **Qualité :** version explicite du commit, comparaison avant/après, pas d'évolution du contenu de leçons et de la progression, validation visuelle manuelle sur Samsung avant de déclarer chaque famille corrigée.

## 8. Décision proposée

**Adopter un système d'enveloppe unique de 640px sur PC, avec 560px pour lecture, 500px pour interactions et des exceptions métier explicitement listées.** Conserver la composition responsive mobile-first et les stratégies verticales propres aux jeux/exercices. Ne pas appliquer une règle globale sans tests : le chantier doit être réalisé par famille de vues, en commençant par accueil/leçon/Jeux (écarts visuels), puis navigation/CTA, puis écrans sensibles (exercices, mission, Survie, examen).

**Statut de la proposition :** diagnostic initial publié dans le dépôt. Les règles cibles sont consignées dans [CHARTE_UI_2.1.md — § 6 bis](CHARTE_UI_2.1.md). Aucun CSS ni comportement de l'application n'a été changé par cette livraison documentaire ; validation visuelle et implémentation restent à effectuer.

### Sources du dépôt

- [PLAYBOOK.md](https://github.com/aym2020/LuxApp/blob/ff6d6ee9e355bc170b6235728fdeb682122c4982/PLAYBOOK.md)
- [Charte UI 2.1](https://github.com/aym2020/LuxApp/blob/ff6d6ee9e355bc170b6235728fdeb682122c4982/docs/CHARTE_UI_2.1.md)
- [Design system](https://github.com/aym2020/LuxApp/blob/ff6d6ee9e355bc170b6235728fdeb682122c4982/docs/DESIGN_SYSTEM.md)
- [index.html](https://github.com/aym2020/LuxApp/blob/ff6d6ee9e355bc170b6235728fdeb682122c4982/public/index.html)
- [style.css](https://github.com/aym2020/LuxApp/blob/ff6d6ee9e355bc170b6235728fdeb682122c4982/public/style.css)
- [accueil-v21.css](https://github.com/aym2020/LuxApp/blob/ff6d6ee9e355bc170b6235728fdeb682122c4982/public/accueil-v21.css)
- [jeux-v21.css](https://github.com/aym2020/LuxApp/blob/ff6d6ee9e355bc170b6235728fdeb682122c4982/public/jeux-v21.css)
- [exercices-v21.css](https://github.com/aym2020/LuxApp/blob/ff6d6ee9e355bc170b6235728fdeb682122c4982/public/exercices-v21.css)
- [revision-v21.css](https://github.com/aym2020/LuxApp/blob/ff6d6ee9e355bc170b6235728fdeb682122c4982/public/revision-v21.css)
- [lecon-v21.css](https://github.com/aym2020/LuxApp/blob/ff6d6ee9e355bc170b6235728fdeb682122c4982/public/lecon-v21.css)
