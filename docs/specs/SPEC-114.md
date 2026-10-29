# SPEC 114 — Harmonisation des dimensions PC et des gabarits de LuxApp 2.1, jeux compris

**Décision produit :** 29 octobre 2026 · **Dépôt :** `aym2020/LuxApp` · **Branche cible :** `2.1`  
**Statut : SPÉCIFIÉE — NON IMPLÉMENTÉE, NON TESTÉE EN NAVIGATEUR, NON VALIDÉE PRODUIT.** Aucun correctif CSS/JS n'est livré par cette fiche.  
**Priorité :** P1 transverse, après stabilisation P0 ; correspond aux tâches `P1-38` à `P1-41` de [TODO.md](../../TODO.md).  
**Périmètre :** toutes les vues de l'application, **y compris le hub Jeux, Survie, Lux Runner, Lux Match et RED FLAG**, les sous-écrans, les pieds d'action, la navigation, les feuilles contextuelles et les résultats.

**Documents sources / hiérarchie :**
- [Charte UI 2.1, ` 6 bis](../CHARTE_UI_2.1.md) : **norme de gabarit déjà adoptée** (640/560/500 px) et précautions mobiles. La présente SPEC **opérationnalise** cette norme et documente les jeux ; elle ne remplace pas la charte.
- [Audit des dimensions du 23 octobre](../AUDIT-DIMENSIONS-2.1.md) : photographie CSS antérieure, vingt vues, non mesurées en exécution.
- [Design system](../DESIGN_SYSTEM.md), [PLAYBOOK](../../PLAYBOOK.md), [AGENTS](../../AGENTS.md) : tokens, contraintes UX et méthode de livraison.
- [SPEC 95](SPEC-95.md) : dock d'action des exercices, [SPEC 96](SPEC-96.md) : Runner, [SPEC 109](SPEC-109.md) : Lux Match, [SPEC 110](SPEC-110.md) : enquête RED FLAG, [SPEC 113](SPEC-113.md) : sélecteur Cringr. Leurs comportements fonctionnels, contenus et directions artistiques restent prioritaires dans leur périmètre.

> **Distinction impérative :** les chiffres de l'état actuel ci-dessous sont des `max-width` CSS vérifiés sur `2.1` le 29/10/2026, **pas** des mesures de `getBoundingClientRect()`. La cascade, les media queries, la fenêtre et le contenu peuvent donner des largeurs effectivement différentes. Mesurer avant d'écrire et avant de déclarer la conformité.

## 1. Problème produit et résultat attendu

### 1.1 Problème

Sur PC, les écrans ont des largeurs visiblement différentes. Une transition Accueil → Mon chemin → Leçon → Exercice → Jeux → RED FLAG semble parfois changer d'application. La cause identifiée est la superposition d'une enveloppe commune (`.view`, plafond 720 px), de plafonds spécifiques dans les enfants et de surcharges tardives. Le hub Jeux annule même la largeur commune et peut aller jusqu'à 960 px. La barre de navigation et certains panneaux n'ont pas les mêmes axes que le contenu.

### 1.2 Objectif

**Une enveloppe principale de 640 px, centrée et stable sur PC, pour toutes les vues, jeux compris.** Son bord, ses repères de titre et ses rails d'actions ne doivent plus sauter à chaque changement de vue. La largeur des **contenus intérieurs** reste adaptée à leur fonction : lecture, zone d'interaction, plateau ou téléphone de jeu. On ne cherche ni une interface Full HD, ni des panneaux artificiellement étirés.

**Succès perçu :** l'utilisateur ressent toujours la même application, y compris lorsqu'il passe à un jeu ; les identités graphiques propres à chaque jeu sont conservées.

**Non-objectifs :** nouveau design graphique, nouvelles mécaniques, changement des données/JSON/son/score, alignement artificiel de toutes les hauteurs, modification du mobile déjà approuvé, création d'une grille desktop à plusieurs colonnes partout.

## 2. État du code constaté le 29 octobre 2026 (branche `2.1`)

| Vue ou composant | Plafonds CSS trouvés | Diagnostic / fichier |
|---|---|---|
| Toutes les `.view` | 720 px | `public/style.css`, enveloppe commune actuelle |
| Accueil `#view-dashboard .accueil` | 470 px interne | `public/accueil-v21.css` ; page beaucoup plus étroite que Mon chemin |
| Mon chemin `#view-lessons` / Leçon `#view-plecon` | 720 px extérieur | `public/style.css` ; ne pas confondre avec la largeur réellement occupée par les blocs |
| Exercices `#view-parcours` / `#view-session` | 720 px extérieur, 500 px zone interactive | `public/exercices-v21.css` ; certaines actions/entêtes ont un autre rail |
| Hub Jeux `#view-jeux` | `max-width:none` en surcouche, `.jeux-hub` jusqu'à **960 px** à partir de 760 px de viewport | `public/jeux-univers.css` ; rupture PC la plus marquée ; base `public/jeux-v21.css` à 470 px |
| Survie `#view-survie` | `.survie-jeu` 470 px, résultat interne 420 px | `public/jeux-v21.css` ; tailles de lettres/tuiles à conserver |
| Lux Runner `#view-runner` | `.runner-jeu` 500 px | `public/runner.css` ; scène et HUD à protéger |
| Lux Match `#view-luxmatch` | `.lm-jeu` 500 px | `public/lux-match.css` ; jeu masqué mais non supprimé |
| RED FLAG `#view-luxdemasque` | `.ld-jeu` 560 px ; sélection : conteneur 480 px et téléphone/sélection 420 px ; déposition : 600 px | `public/lux-demasque.css` ; **plusieurs largeurs dans un même jeu** |
| Navigation basse `.nav-bas` | 720 px | `public/style.css` |
| CTA globaux `.cta-fixe` | 720 px | `public/components.css` ; le dock d'exercice `.exo-action-dock` est à 500 px |
| Panneau `.panneau` / feuille Cours `.cp-feuille` | 560 / 720 px | `public/style.css` ; autres panneaux à vérifier |
| Lecteur de scénario de mission `.ms-v21-dialogue` | 680 px | `public/scenario-v21.css` ; exception actuelle à étudier |
| Plus `#view-plus .plus-page` | 640 px | `public/style.css` ; déjà proche de la cible |

**Source de la liste des vues :** `public/index.html` contient actuellement **24 éléments `#view-*`**, dont le hub Jeux et quatre jeux individuels (Survie, Lux Runner, Lux Match et RED FLAG). L'ancien audit de 20 vues ne couvre donc pas à lui seul le périmètre actuel. Vérifier également les overlays et pages hors `.view`.

## 3. Gabarit cible — décision normative

| Usage | Token dans `public/design-tokens.css` | Largeur maximale |
|---|---|---:|
| **Enveloppe extérieure de toute vue** | `--layout-shell` | **640 px** |
| Lecture, cours, texte long, correction | `--layout-reading` | **560 px** |
| Bloc de concentration : questions, champs, plateaux, HUD compact | `--layout-focus` | **500 px** |
| Feuille principale : Plus, Cours, recette | `--layout-sheet` | **640 px** |
| Dialogue ou confirmation brève | `--layout-dialog` | **400 px** |
| Gouttière **intérieure** de l'enveloppe | `--layout-gutter` | **16 px mobile / 24 px PC** |

**Principes d'implémentation :**
1. L'enveloppe `.view` constitue le **repère visuel commun**. En viewport desktop (à partir de 768 px), elle ne dépasse jamais 640 px et doit être centrée sans décalage entre écrans.
2. Les vues de consultation (Accueil, Mon chemin, Leçon, Jeux, résultats, Plus) **utilisent réellement l'enveloppe élargie** : ne pas garder un bloc principal accidentellement bloqué à 470 px sous un parent de 640 px. Les paragraphes peuvent toutefois rester limités à 560 px. Préserver proportions du hero et lisibilité.
3. Les scènes et réponses sont centrées à 500 px **au maximum**, sauf contraintes spécifiques documentées. Une carte Cringr de 420 px ou une zone de score plus étroite est une exception **intérieure légitime**, pas une nouvelle largeur de page.
4. La navigation basse et les CTA globaux partagent **exactement le même repère extérieur** que les vues (640 px), avec rails internes alignés sur le contenu concerné ; ne pas élargir de force le bouton d'exercice à 640 px.
5. Les feuilles Cours/Plus/recette utilisent le plafond 640 px. Les petits dialogues, popovers et aides conservent une taille dédiée ; les fonds/voiles d'overlay peuvent couvrir tout le viewport **sans être considérés comme une vue de largeur incohérente**.
6. À moins de 640 px, aucune largeur minimale forcée, débordement horizontal, effet de zoom artificiel ni réduction des zones tactiles. La cible est **un maximum responsive**, pas une largeur fixe en tout contexte.
7. Les repères importants (retour, titre, action, bord des grands panneaux) sont cohérents, avec des gouttières explicites. La hauteur est traitée séparément (` 5).

**Ne jamais** appliquer `* { max-width: 640px }`, `transform: scale()` ou `zoom` à des vues ; ne pas empiler un dernier bloc CSS plus spécifique pour cacher les anciennes règles. Corriger la source et l'ordre de cascade.

## 4. Contrat par parcours et jeux

| Famille / vues | Conteneur PC cible | Intérieur et comportements à préserver |
|---|---|---|
| Accueil (`view-dashboard`) | 640 px | Hero, texte, métriques et CTA occupent une composition cohérente ; pas une petite colonne 470 px centrée par accident. **Ne pas refaire le design Android approuvé.** |
| Mon chemin, détail de leçon (`view-lessons`, `view-plecon`) | 640 px | Cartes et titres alignés ; chronologie, progression, étoiles et unités inchangées |
| Introduction/découverte (`view-msintro`, `view-pintro`, `view-decouverte`) | 640 px | Narration lisible ; CTA accessible, centre scrollable en cas de hauteur courte |
| Cours, Leçon historique, Lexique, Pièges (`view-lecon`, `view-lexique`, `view-pieges`) | 640 px | Textes ≤560 px quand pertinent, sans tronquer tableaux ou lexique |
| Exercices (`view-parcours`, `view-session`) | 640 px | Questions, saisie et dock à 500 px ; **contrat SPEC 95** et clavier Android intacts |
| Missions (`view-mission`) | 640 px | En-tête, conversation défilante, réponses ancrées ; bulles jamais étirées |
| Bilans et examens (`view-pfin`, `view-examens`, `view-examen`, `view-examen-result`) | 640 px | Résultat et score éventuellement plus compacts, CTA alignés et visibles |
| S'entraîner, Plus, Réglages (`view-review-setup`, `view-plus`, `view-reglages`) | 640 px | Formulaires et panneaux sans désalignement ni dépassement |
| **Hub Jeux** (`view-jeux`) | **640 px, sans exception à 960** | Grille à adapter : une ou deux colonnes **selon une vérification réelle** de la lisibilité et des zones tactiles à 640 px. Supprimer le breakpoint 960 px plutôt que simplement couper son débordement ; ne rien masquer. |
| **Survie** (`view-survie`) | 640 px | Plateau de jeu, tuiles, HUD et score ≤500 px centrés ; résultat compact autorisé (420 px si justifié), mais **page et navigation à 640 px** |
| **Lux Runner** (`view-runner`) | 640 px | Scène/HUD centrés jusqu'à 500 px, canvas et rythme inchangés ; pas d'étirement des trois portails |
| **Lux Match** (`view-luxmatch`) | 640 px | Scène/portrait/téléphone à 500 px maximum, même si ce jeu est actuellement masqué. Ne pas supprimer, réactiver ou altérer le jeu |
| **RED FLAG / Cringr** (`view-luxdemasque`) | 640 px **sur tous les sous-écrans** | Sélection : faux téléphone et carte autour de 420 px, conservés ; rencontre, déposition, preuves, carnet, objections et bilan : scènes cohérentes sur le **même rail de page**, avec panneaux/overlays appropriés. Le CSS de sélection et sa dynamique de swipe restent régis par SPEC 113. |

**Important pour RED FLAG :** on unifie le **cadre externe** du jeu. On ne transforme pas le faux téléphone Cringr en une carte de 640 px, on ne modifie pas l'image PS1, les tampons, les seuils de swipe, l'accès aux preuves ou l'ordre de l'enquête. Les sous-écrans ne doivent pas donner l'impression de changer de largeur d'application.

## 5. Contrat vertical, scroll et ergonomie

Il n'y a **pas de hauteur de fenêtre unique** imposée à toutes les vues : une page de consultation et une activité immersive ont des besoins différents. Les repères horizontaux sont communs ; la verticalité dépend de la fonction.

- **Consultation** : contenu à hauteur naturelle avec un chemin de scroll clair, sans éloigner artificiellement l'action de la question sur un PC 1080 px de haut.
- **Exercices, missions, jeux, examens** : hauteur du viewport (`100dvh` ou mesure compatible clavier si nécessaire), en-tête stable, contenu central scrollable, actions toujours accessibles ; un seul scroll principal à la fois quand le contrat de l'écran l'exige.
- **Résultats et panneaux** : le dernier texte n'est jamais recouvert par le CTA ou les safe areas ; le panneau reste borné en hauteur.
- **Clavier et retour Android** : préserver `body.clavier-actif`, `visualViewport`, la position des champs, les CTA et l'ordre de focus. Aucun correctif PC ne doit toucher aveuglément ces règles sensibles.
- **Transitions** : aucun `transform` sur `.view` (charte 2.1) ; changement de page sans saut horizontal, déplacement du pied ni ressaut du header.
- **Accessibilité** : pas de débordement à 320 px, texte à 130 %/200 %, focus clavier visible, contraste lisible, cibles ≥44 px et principaux CTA ≥48 px ; `prefers-reduced-motion` respecté.

## 6. Plan d'implémentation par lots indépendants

**Lot 0 — Baseline instrumentée (TODO P1-38, prérequis obligatoire).** Partir d'un commit fixé, lire CSS calculé et capturer les **24 vues** du HTML actuel, y compris les cinq écrans de jeu/hub, leurs sous-écrans importants et les panneaux/CTA. Mesurer `getBoundingClientRect()` des éléments `.view.active`, des principaux conteneurs, en-têtes, nav, docks, CTA et overlays. Consigner les écarts desktop et les captures 390/720/1440 px. Identifier les vues non accessibles sans données de recette, sans les supposer conformes.

**Lot 1 — Fondations et consultation (TODO P1-39).** Ajouter les tokens de gabarit, harmoniser `.view`, les points d'ancrage, l'Accueil, Mon chemin, Leçon, Plus, listes, résultats et leurs CSS locaux. Comparer captures et DOM à chaque famille ; ne pas modifier les données.

**Lot 2 — Navigation, CTA et panneaux (TODO P1-40).** Aligner `.nav-bas`, `.cta-fixe`, `.cp-feuille`, `.panneau` et feuilles de révision ; préserver les tailles spécifiques des confirmations, aides, modales et des docks SPEC 95.

**Lot 3 — Jeux, RED FLAG inclus (extension transverse de P1-39/41).** Adapter le hub et sa grille, puis Survie, Runner, Lux Match et chaque écran RED FLAG. Supprimer les maxima concurrents **au bon endroit dans leurs feuilles propriétaires** ; préserver les scènes, le portrait et l'UX tactile. Aucun changement d'état utilisateur ni de logique.

**Lot 4 — Immersion, hauteur, clavier, non-régression (TODO P1-41).** Harmoniser les vues à `100dvh` sans forcer les vues de lecture ; vérifier exercices, mission, examens, feedback, passage en résultat, Android clavier ouvert, retour navigateur/système, zoom et mode réduit.

Chaque lot comporte un avant/après (captures + dimensions), ses tests ciblés et un commit isolé. **Pas de gros patch global**, pas d'implantation sans mesure initiale, pas de changement silencieux sur `main`.

## 7. Critères d'acceptation mesurables

### A. Dimensions et stabilité PC

- À **768, 1024, 1440 et 1920 px** de viewport, la boîte `.view.active` de toutes les 24 vues standard est **centrée**, et sa largeur calculée ne dépasse pas **640 px** ; si le viewport laisse suffisamment de place, elle mesure environ **640 px (tolérance ±2 px de mesure)**.
- Changement Accueil → Mon chemin → Leçon → Exercice → Hub Jeux → chaque jeu → retour : **les bords du shell et du rail navigation/CTA ne changent pas** et aucun défilement horizontal n'apparaît.
- Les conteneurs éditoriaux principaux sont réellement réorganisés : pas de « faux 640 px » avec une petite colonne de 470 px qui reste visuellement isolée sans raison ; les exceptions de lecture/plateau/téléphone sont explicitement identifiées et centrées.
- Le hub Jeux n'a plus de plafond de **960 px**, y compris pour une fenêtre supérieure à 1440 px. Les cartes restent intégralement lisibles, cliquables et accessibles.
- RED FLAG n'a plus de **changement de largeur extérieure** entre sélection, rencontre, déposition, carnet et bilan ; le faux téléphone reste proportionné et les tampons/swipes ne sont pas altérés.

### B. Responsive et accessibilité

- Vérifier **320 / 360 / 390 / 430 / 600 / 640 / 720 / 768 / 1024 / 1440 / 1920 px** ; hauteurs **600 / 900 / 1080 px** ; zoom **100 / 125 / 150 %** et texte **130 / 200 %**. Tester aussi Samsung réel avec clavier déployé, retour Android, scroll, safe areas et réduction des animations.
- Aucun contenu tronqué, aucune perte de scroll utile, aucun CTA caché, aucun champ inaccessible, aucune barre de navigation décentrée, aucune taille de touche réduite au-dessous des cibles prévues.
- Les quatre profils du sélecteur Cringr, les états swipe incomplet/LIKE/NOPE, les écrans de jeu et états de résultat restent utilisables ; pas de modification de l'accessibilité clavier.

### C. Non-régression applicative

- Progression utilisateur, localStorage/cloud, sélection des leçons, scores, étoiles, sons, téléchargements PWA et retour Android **strictement inchangés**.
- Tests spécifiques de l'enveloppe (`getBoundingClientRect` et styles calculés) **en navigateur réel**, captures comparatives et contrôles de non-débords ; lancer les tests ciblés, `bash tools/critique.sh rapide` puis `bash tools/critique.sh` selon PLAYBOOK.
- Toute suite critique rouge est **comparée sur le commit de référence** et documentée ; ne jamais déclarer que tous les tests passent si le résultat diffère.
- **Approbation explicite du Produit** après revue PC + vrai Samsung pour clôturer. L'obtention d'une CI verte seule ne vaut pas validation.

## 8. Zones de code attendues (non modifiées par cette SPEC)

- Tokens : `public/design-tokens.css`.
- Géométrie globale, barre basse et panneaux : `public/style.css` ; composants et CTA : `public/components.css`.
- Accueil, chemin, leçons, exercices : `public/accueil-v21.css`, `public/chemin-v21.css`, `public/lecon-v21.css`, `public/exercices-v21.css` et CSS propres aux autres vues.
- Jeux : `public/jeux-v21.css`, `public/jeux-univers.css`, `public/runner.css`, `public/lux-match.css`, `public/lux-demasque.css`.
- Scénario mission : `public/scenario-v21.css` et autres panneaux concernés.
- Ordre de chargement CSS/cache : `public/index.html`. Éviter toute nouvelle surcharge tardive non documentée.
- Recette : tests Playwright/DOM existants et nouveaux tests de géométrie ; comparer les résultats avant/après.

## 9. Suivi et statut de livraison

- **À faire :** lot 0, mesure réelle des 24 vues, états et panneaux ; compléter un relevé de dimensions et captures de référence.
- **À faire :** implémentation des lots 1 à 4, par petits commits et tests.
- **À faire :** recette PC + Samsung et validation Produit.
- **Fait dans la présente livraison :** création de la SPEC et liens documentaires. **Aucun CSS, JavaScript, JSON, test automatisé ou réglage n'est modifié.**

**Règle de clôture :** ne déclarer `SPEC 114 validée` et ne cocher les tâches de la TODO qu'après critères A/B/C vérifiés, preuve de recette et accord explicite. Ne pas clôturer les tâches RED FLAG de la TODO `main` par simple harmonisation du gabarit.
