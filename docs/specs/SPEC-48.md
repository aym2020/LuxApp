# SPEC 48 — Harmonisation visuelle et sémantique du Chemin

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** (recette Android à faire) |
| Priorité | **P1** — UX / Design system |
| Branche | `v2` |
| Périmètre | `public/chemin.js`, `public/parcours.js`, `public/accueil.js`, `public/revision.js`, `public/examens.js`, `public/design-tokens.css`, `public/components.css`, `public/style.css`, `public/catalogue.html`, tests du Chemin. Étendu à l'écran de sélection des examens et aux examens (demande de Clayton du 19/10/2026) |
| Références | SPEC 19, 29, 33, 39, 43, 46 et 47 |
| Design system | Règles communes reportées dans [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) v1.8 (§ 2, 5 bis, 5 ter) : elles s'appliquent à **toute l'application**, pas seulement au Chemin |

## 1. Objectif

Harmoniser l'écran « Mon chemin » afin d'obtenir une interface sobre, cohérente, lisible et adaptée à une application d'apprentissage destinée aux débutants.

Chaque couleur, icône, compteur, badge et libellé doit remplir une fonction précise.

**Principe directeur : une information ne doit être affichée que si elle aide l'utilisateur à comprendre sa progression, identifier son état ou décider de sa prochaine action.**

L'objectif n'est pas de reconstruire l'interface, mais de conserver son identité visuelle en supprimant les éléments décoratifs inutiles, les redondances et les incohérences.

Préserver le thème sombre, la typographie, le parcours vertical, les interactions existantes et la navigation inférieure.

## 2. Supprimer les couleurs individuelles des leçons

### Constat

Actuellement, les leçons possèdent des couleurs différentes : orange, rose, violet, vert, etc.

Ces couleurs ne traduisent aucune catégorie pédagogique stable. Elles ne permettent pas de déterminer la difficulté, l'état ou la progression d'une leçon.

Elles ajoutent du bruit visuel et peuvent entrer en concurrence avec les couleurs fonctionnelles.

### Comportement attendu

- Supprimer les couleurs propres aux leçons sur les cartes du Chemin.
- Utiliser des fonds sombres neutres et homogènes.
- Conserver des bordures discrètes pour délimiter les cartes.
- Réserver les couleurs aux états et aux actions.
- Conserver les couleurs dans les données JSON si elles sont utilisées ailleurs, sans modifier inutilement les leçons.

### Code couleur commun

| Couleur | Signification |
|---|---|
| Vert | Réussite ou validation effectivement obtenue |
| Jaune / or | Action principale, étape recommandée ou activité en cours |
| Gris neutre | Élément non commencé, secondaire ou informatif |
| Gris bleuté | Acquisition historique provenant de la V1 |
| Turquoise | Révision et répétition espacée |
| Rouge | Erreur, échec ou alerte nécessitant une correction |

Une couleur ne doit jamais changer de signification selon la leçon ou l'écran.

La distinction entre une leçon entièrement réalisée et une leçon validée par mission doit rester explicite dans les textes, même lorsqu'elles utilisent toutes deux une indication positive.

Le statut ne doit jamais reposer uniquement sur la couleur : conserver des icônes et des libellés accessibles.

## 3. Uniformiser les cartes de leçon

### Constat

Les cartes repliées présentent actuellement plusieurs problèmes :

- Numéro, titre et chevron parfois mal alignés.
- Chevrons déplacés sur une ligne supplémentaire.
- Hauteurs disproportionnées.
- Titres tronqués ou compressés.
- Badges concurrençant le titre.
- Structures visuelles différentes selon les statuts.

### Nouvelle structure commune

Toutes les cartes repliées suivent la même organisation :

**Zone supérieure :**
- Numéro de leçon.
- Titre.
- Chevron systématiquement aligné en haut à droite.

**Zone inférieure facultative :**
- Statut significatif.
- Indicateur de révision lorsqu'il existe.

Le titre reste l'information principale.

### Règles de mise en page

- Utiliser une grille CSS stable plutôt qu'un assemblage de règles Flexbox contradictoires.
- Garder le chevron au même emplacement quelle que soit la longueur du titre.
- Autoriser le titre sur plusieurs lignes si nécessaire.
- Ne jamais réduire un mot à quelques caractères par manque de largeur.
- Éviter les lignes vides et les espaces verticaux injustifiés.
- Ajuster automatiquement la hauteur à la quantité réelle de contenu.
- Conserver des cartes compactes pour les leçons sans statut secondaire.
- Aucun badge ne doit réduire la largeur minimale nécessaire à la lecture du titre.

Les cartes dépliées utilisent les mêmes règles typographiques et les mêmes alignements.

Il faut obtenir un système de composants commun, et non ajouter des corrections CSS spécifiques à chaque leçon.

## 4. Clarifier les statuts de progression

### Constat

Les notions « Terminée », « Acquise · V1 », « En cours » et « Validée par la mission » correspondent à des réalités différentes.

Or, leur présentation actuelle peut laisser penser qu'une leçon historiquement acquise possède toutes ses nouvelles unités terminées.

### Statuts attendus

| Situation | Libellé |
|---|---|
| Leçon jamais commencée | À découvrir |
| Leçon réellement commencée | En cours |
| Leçon acquise dans l'ancienne version | Acquise précédemment |
| Toutes les unités obligatoires réalisées | Terminée |
| Leçon validée grâce à la mission | Validée par la mission |

Une leçon simplement recommandée ne doit pas être appelée « En cours » si aucune activité n'a réellement été commencée. La recommandation et l'avancement sont deux notions distinctes.

### Acquisition historique

Remplacer « Acquise · V1 » par **« Acquise précédemment »**.

Ce libellé doit être compréhensible sans connaître les versions techniques de LuxApp.

Conserver les règles de la SPEC 46 :

- Aucun acquis historique supprimé.
- Aucune étoile inventée.
- Aucune unité fictivement terminée.
- Aucune obligation de refaire la leçon pour conserver son acquisition.
- Possibilité de découvrir les nouvelles unités.

Utiliser un indicateur gris bleuté pour différencier visuellement l'acquisition historique d'une réussite obtenue dans le parcours actuel.

### Synthèse du parcours

Adapter les indicateurs situés sous « Mon chemin » pour distinguer clairement :
- Les leçons terminées dans le parcours actuel.
- Les leçons acquises précédemment.
- Les activités réellement commencées.

Ne pas confondre le nombre de leçons acquises avec le nombre d'unités réalisées.

## 5. Supprimer les compteurs et badges peu utiles

### Mission : supprimer « 0/20 » du Chemin

Actuellement, un compteur comme « 0/20 » apparaît sous la mission.

Il mesure la découverte des répliques du scénario, mais peut être interprété comme un score ou un nombre d'exercices réussis.

**Supprimer ce compteur uniquement de la carte Mission affichée dans le Chemin.**

Conserver les informations de progression détaillées lorsqu'elles sont réellement utiles dans l'écran dédié à la mission.

La ligne Mission doit afficher :

- Icône de dialogue.
- Libellé « Mission ».
- Titre du scénario.
- Chevron de navigation.

Afficher un résultat seulement lorsqu'une mission a effectivement été jouée, avec un libellé explicite : « Réussie », « À rejouer » ou « Sans faute », selon les états existants.

### Bilan : supprimer le badge « Facultatif »

Actuellement, le mot « Facultatif » occupe une ligne supplémentaire et apparaît comme un badge.

Remplacer cette présentation par une ligne concise :

**Bilan · 10 questions · Optionnel**

Le caractère optionnel reste donc explicite, sans créer un élément graphique supplémentaire.

### Révisions

Remplacer « À rafraîchir · 11 » par :

**11 questions à réviser**

Conserver la couleur turquoise.

Le compteur doit correspondre au nombre réellement calculé par le moteur de répétition espacée.

Ne pas modifier les dates, les seuils, les séries ou la logique des révisions.

### Règle générale

Supprimer tout indicateur qui :
- répète une information déjà visible ;
- n'a pas de conséquence utile pour l'utilisateur ;
- ressemble à un score sans en être un ;
- nécessite une connaissance technique pour être compris ;
- augmente inutilement la hauteur d'une carte.

Ne pas supprimer une information obligatoire pour comprendre la progression ou l'accessibilité.

## 6. Harmoniser les unités et leurs icônes

Les unités doivent utiliser un système visuel stable.

| État de l'unité | Présentation |
|---|---|
| Non commencée | Cercle neutre vide |
| Prochaine étape recommandée | Cercle jaune |
| En cours | Cercle jaune et libellé approprié |
| Terminée réellement | Coche verte |
| Validée indirectement par mission | Indicateur distinct, sans étoile fictive |

Ne pas confondre une unité réalisée et une unité rendue facultative par la validation de la mission.

Chaque ligne contient :

1. Son indicateur d'état.
2. Son numéro et son titre complet.
3. Son chevron à droite.

Les intitulés longs doivent pouvoir occuper plusieurs lignes sans déplacer les icônes ou les chevrons.

Préserver les étoiles lorsqu'elles correspondent à un résultat réellement obtenu.

## 7. Hiérarchie des actions

Chaque carte de leçon dépliée doit comporter une seule action principale, visuellement dominante.

### Actions principales

Adapter le texte au véritable état de la leçon :

- **Découvrir** : première ouverture d'une leçon non commencée.
- **Commencer** : première unité à réaliser lorsque l'introduction est déjà connue.
- **Continuer** : progression commencée.
- **Reprendre** : session interrompue.
- **Faire les nouvelles unités** : leçon acquise précédemment, mais nouvelles unités non réalisées.
- **Revoir** : leçon effectivement terminée.

Conserver un bouton jaune pour cette action principale.

### Action secondaire

« Voir toute la leçon » reste accessible sous forme de lien discret.

Ne pas ajouter d'autres grands boutons si une action secondaire suffit.

### Cohérence de navigation

Conserver les comportements déjà définis :

- Une seule leçon dépliée à la fois.
- Retour au Chemin sur la leçon quittée.
- Conservation du contexte après actualisation.
- Cadrage correct de la carte dépliée.
- Aucune modification de la progression lors d'une simple navigation.

## 8. Améliorer la densité et les espacements

### Objectif

Afficher davantage d'informations utiles sans donner une impression d'interface surchargée.

### Règles

- Réduire les espaces vides inutiles entre les éléments.
- Conserver une séparation visuelle claire entre les unités.
- Éviter les badges isolés sur une ligne lorsqu'un texte secondaire suffit.
- Harmoniser les marges internes des cartes.
- Aligner numéros, titres, icônes et chevrons selon une grille commune.
- Conserver des zones tactiles confortables sur mobile.
- Ne pas réduire excessivement la taille de la police pour gagner de la place.

La hauteur des cartes dépend du contenu réel : elle ne doit être ni arbitrairement fixe, ni inutilement importante.

## 9. Design system et architecture CSS

Respecter l'architecture existante :

- `public/design-tokens.css` : couleurs et valeurs communes.
- `public/components.css` : composants réutilisables.
- `public/style.css` : mise en page spécifique au Chemin.

Examiner notamment :
- `public/chemin.js`
- `public/niveau.js`
- `public/components.css`
- `public/design-tokens.css`
- `public/style.css`

Réutiliser les composants et les tokens existants autant que possible.

Éviter :
- les nouvelles couleurs codées en dur ;
- les styles inline inutiles ;
- les sélecteurs CSS excessivement spécifiques ;
- l'accumulation de règles contradictoires ;
- les exceptions propres à une leçon.

**Ne pas entreprendre une refonte générale du CSS ou du moteur de progression.**

Si certains composants sont communs à l'Accueil ou à l'écran détaillé d'une leçon, vérifier leur compatibilité. Harmoniser les libellés partagés lorsqu'ils représentent exactement le même état.

Mettre à jour le design system pour documenter la nouvelle signification des couleurs et des statuts.

## 10. Accessibilité et responsive

Tester la nouvelle interface sur les largeurs :

**320, 360, 390 et 430 px.**

Vérifier également le texte agrandi, notamment à 130 % et 200 %, dans les limites des configurations Android prises en charge.

Critères :

- Aucun débordement horizontal.
- Aucun titre écrasé.
- Aucun chevron déplacé.
- Aucun bouton coupé.
- Aucun texte masqué par la barre de navigation.
- Cibles tactiles suffisamment grandes.
- Contrastes compatibles avec les exigences WCAG 2.2 AA applicables.
- États distinguables sans perception des couleurs.
- Libellés compréhensibles par les lecteurs d'écran.
- Respect de `prefers-reduced-motion`.

Tester les titres courts, longs et les cartes présentant plusieurs informations secondaires.

## 11. Tests de non-régression obligatoires

### Présentation

- [x] Toutes les cartes du Chemin utilisent des surfaces neutres cohérentes.
- [x] Les couleurs individuelles des leçons ne perturbent plus le parcours.
- [x] Les chevrons sont alignés de manière identique.
- [x] Aucun titre ne devient illisible à cause d'un badge.
- [x] Les cartes sans information secondaire restent compactes.
- [x] Les cartes dépliées respectent une hiérarchie visuelle identique.

### Statuts

- [x] Une leçon historiquement acquise affiche « Acquise précédemment ».
- [x] Une leçon terminée dans le nouveau parcours est clairement identifiable.
- [x] Une leçon validée par mission conserve son statut distinct.
- [x] Les unités non réalisées ne reçoivent aucune coche ou étoile fictive.
- [x] Une leçon recommandée mais non commencée n'est pas présentée à tort comme déjà commencée.

### Informations

- [x] « 0/20 » n'apparaît plus sous Mission dans le Chemin.
- [x] Le bilan affiche « 10 questions · Optionnel » sans badge supplémentaire.
- [x] Les révisions affichent « N questions à réviser » avec un nombre exact.
- [x] Les scores réellement utiles restent visibles.
- [x] Les libellés sont cohérents entre le Chemin et les écrans associés.

### Navigation et stabilité

- [x] L'ouverture et la fermeture des cartes fonctionnent.
- [x] Une seule leçon reste dépliée.
- [x] Le retour depuis les résultats conserve la bonne leçon ouverte.
- [x] Le scroll reste correctement positionné.
- [x] La progression locale et cloud reste inchangée.
- [x] Aucun changement de score, d'étoiles, d'erreurs ou d'acquis n'est provoqué par ce travail d'interface.

## 12. Validation et livraison

Utiliser les tests existants, notamment ceux du Chemin, des cartes et de la navigation.

Ajouter les cas manquants dans les tests visuels plutôt que créer une nouvelle infrastructure.

Exploiter le mode recette de la SPEC 43 lorsqu'il permet de reproduire les états concernés.

Effectuer une vérification comparative avant/après sur Android.

Ne pas se limiter à des tests automatisés : vérifier réellement la qualité visuelle de plusieurs cartes ouvertes et fermées.

Exécuter les tests ciblés, puis la suite critique conformément au PLAYBOOK.

### Livrables

1. Interface du Chemin harmonisée.
2. Règles de couleur et de statut documentées.
3. Composants CSS consolidés.
4. Tests visuels et fonctionnels adaptés.
5. Confirmation qu'aucune donnée de progression n'a été modifiée.

### Critère d'arrêt

La SPEC est terminée lorsque toutes les cartes suivent une structure cohérente, que chaque couleur et indicateur possède un sens explicite, que les tests pertinents passent et que les captures Android ne présentent plus de défaut visuel majeur.

Ne pas prolonger le chantier par des ajustements purement décoratifs sans bénéfice concret.

## Implémentation (19/10/2026)

**Statuts et libellés** (`chemin.js`, `parcours.js`, `accueil.js`, `revision.js`)
- `statutLecon48()` : un seul calcul pour les cinq statuts (À découvrir, En cours, Acquise précédemment, Terminée, Validée par la mission). « En cours » = activité réellement faite (`leconCommencee`), plus la simple recommandation.
- Synthèse sous « Mon chemin » : N terminées, N acquises précédemment, N en cours (leçons réellement commencées).
- Accueil : « Leçons terminées » + « +N acquises précédemment » ; tuile « leçons acquises précédemment ». Plus aucun « v1 » visible.
- « N questions à réviser » partout (`texteAReviser`, compte réel du moteur) ; puce de l'écran de leçon : « Réviser · N ».
- Bouton principal : Découvrir, **Commencer** (introduction déjà confirmée, rien de fait — remplace « Découvrir » attendu par la spec 18), Continuer, Reprendre, Faire les nouvelles unités, Revoir. Leçons classiques : plus d'« Ouvrir ». « Jouer la nouvelle mission » devient « Continuer ».
- Unités : « En cours » (or) sous l'unité d'une partie interrompue ; « Validée par la mission » inchangé (cercle vert non rempli, sans étoile).
- Mission : plus de compteur « n/20 » ; « Réussie » / « Sans faute » (vert) ou « À rejouer » (rouge) seulement après une partie. Icônes de mission et de bilan neutres.
- Bilan : « Bilan · 10 questions · Optionnel », sans badge.

**Couleurs**
- `--lc` ne colore plus le Chemin ni l'écran de leçon ; surfaces neutres pour toutes les cartes (y compris Examens) ; bordure or pour la leçon conseillée.
- Rond et trait gris bleuté (`--couleur-acquis`) pour « Acquise précédemment » ; « Sans faute » et « TERMINÉE / COMPLÈTE » en vert ; étiquettes d'en-tête des écrans secondaires en gris (plus en or).
- Examens : cartes de sujets neutres (`.ex-carte`), infos sur une ligne de texte, meilleur score vert (≥ 60 %) ou rouge ; `examColor` à deux niveaux (vert / rouge, plus d'or) pour la liste, les cases de parties et le résultat.

**Examens : passage et résultat** (2e lot, même jour)
- Boutons : « Précédent » / « Corriger » / « Suivant » en `.pc-btn` (or uni, plus de dégradé) ; « Refaire ce sujet » `.pc-btn.primary` + lien « Autres sujets » (une seule action principale).
- Couleurs par classes, plus de style inline : `examClasse()` (ok / ko) pour les cases de parties, l'anneau, la mention, les barres de sections et les pastilles de score. Parties entamées ou remplies : or (activité en cours).
- Étiquettes neutres (section, personnages du dialogue, « TROU 2 SUR 8 », « PARTIE 1 · … ») ; mot placé dans un trou en texte normal (l'or seulement sur le trou actif) ; gris codés en dur remplacés par des tokens (nouveau `--couleur-bord-fort`).
- Retour : boutons `data-retour` + `retour()` sur les trois écrans (l'écran réellement précédent, spec 15) ; la liste des sujets est réaffichée au retour (meilleur score à jour).
- Questions aléatoires (écran de séance) : barre de progression et boutons or uni, liseré neutre, lettres A/B/C/D neutres. Également appliqué aux révisions, qui partagent cet écran ; `.dash-btn.primary` passe aussi en or uni.
- Cases de parties : noms accessibles (« Partie 1, corrigée, 7 sur 8 »).
- Test `tests/test_examens.py`, ajouté à la suite critique.

**CSS** : un seul bloc « SPEC 48 » en fin de `style.css` (grille commune carte repliée / en-tête dépliée : numéro et titre | chevron en haut à droite, 2e rangée facultative) ; suppression des règles contradictoires des specs 17, 33, 46 et 47 et du composant `.lecon-card`, devenu inutilisé. `.pastille.a` dans `components.css`.

**Tests** : `test_chemin_cartes.py` étendu (texte 100/130/200 %, chevron, surfaces neutres, absence de « v1 » et « À rafraîchir », sujets d'examen, progression intacte après navigation) ; libellés mis à jour dans `test_acquis_v1`, `test_chemin_lignes`, `test_decouverte`, `test_lot1`. Suite critique : verte.

**Données** : aucune écriture de progression ajoutée ou modifiée ; vérifié par le test (progression, statistiques et erreurs identiques avant / après navigation).

**Reste à faire** : recette Android avant / après. Hors périmètre, signalé : anneaux et liste du lexique encore colorés par leçon (`revision.js`), voir DESIGN_SYSTEM § 7.

---

**Résultat attendu :** un Chemin plus sobre, lisible, compact et harmonieux, dans lequel l'utilisateur comprend immédiatement ce qu'il a acquis, ce qu'il doit apprendre, ce qu'il peut réviser et quelle action entreprendre ensuite.
