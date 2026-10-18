# SPEC 48 — Harmonisation visuelle et sémantique du Chemin

| Champ | Valeur |
|---|---|
| Statut | **À faire** |
| Priorité | **P1** — UX / Design system |
| Branche | `v2` |
| Périmètre | `public/chemin.js`, `public/niveau.js`, `public/parcours.js`, `public/accueil.js`, `public/design-tokens.css`, `public/components.css`, `public/style.css`, tests du Chemin |
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

- [ ] Toutes les cartes du Chemin utilisent des surfaces neutres cohérentes.
- [ ] Les couleurs individuelles des leçons ne perturbent plus le parcours.
- [ ] Les chevrons sont alignés de manière identique.
- [ ] Aucun titre ne devient illisible à cause d'un badge.
- [ ] Les cartes sans information secondaire restent compactes.
- [ ] Les cartes dépliées respectent une hiérarchie visuelle identique.

### Statuts

- [ ] Une leçon historiquement acquise affiche « Acquise précédemment ».
- [ ] Une leçon terminée dans le nouveau parcours est clairement identifiable.
- [ ] Une leçon validée par mission conserve son statut distinct.
- [ ] Les unités non réalisées ne reçoivent aucune coche ou étoile fictive.
- [ ] Une leçon recommandée mais non commencée n'est pas présentée à tort comme déjà commencée.

### Informations

- [ ] « 0/20 » n'apparaît plus sous Mission dans le Chemin.
- [ ] Le bilan affiche « 10 questions · Optionnel » sans badge supplémentaire.
- [ ] Les révisions affichent « N questions à réviser » avec un nombre exact.
- [ ] Les scores réellement utiles restent visibles.
- [ ] Les libellés sont cohérents entre le Chemin et les écrans associés.

### Navigation et stabilité

- [ ] L'ouverture et la fermeture des cartes fonctionnent.
- [ ] Une seule leçon reste dépliée.
- [ ] Le retour depuis les résultats conserve la bonne leçon ouverte.
- [ ] Le scroll reste correctement positionné.
- [ ] La progression locale et cloud reste inchangée.
- [ ] Aucun changement de score, d'étoiles, d'erreurs ou d'acquis n'est provoqué par ce travail d'interface.

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

---

**Résultat attendu :** un Chemin plus sobre, lisible, compact et harmonieux, dans lequel l'utilisateur comprend immédiatement ce qu'il a acquis, ce qu'il doit apprendre, ce qu'il peut réviser et quelle action entreprendre ensuite.
