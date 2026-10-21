# SPEC 87 — Stabilisation UX des exercices sur mobile

> Numérotée **87** dans le registre : le numéro 83 annoncé dans la demande était déjà attribué (découverte guidée de la leçon 0) et 84–86 sont également utilisés.


Projet : LuxApp 2.1
Branche autorisée : "2.1" uniquement
Référence de départ : "870ba23"
Priorité : P1 — Bloquant pour la validation de la refonte
Périmètre : rendu mobile, clavier, feedback, navigation après réponse
Interdiction : ne pas modifier la notation, les contenus JSON ou la logique de progression.

1. Objectif

Corriger les derniers problèmes de présentation et d'ergonomie des exercices, sans refaire leur design ni altérer les corrections fonctionnelles apportées par le commit "870ba23".

Les captures Samsung montrent quatre anomalies principales :

1. La question française disparaît en haut lorsque le clavier s'ouvre ou après un premier essai incorrect.
2. Le premier message d'erreur occupe trop de place et repousse le champ de réponse.
3. Le bouton « Suivante » peut être partiellement ou totalement hors de la zone visible.
4. Les corrections d'écriture n'utilisent pas exactement la même hiérarchie visuelle que les quiz et les trous.

Principe : une question lisible, un feedback clair, une seule action principale immédiatement accessible.

2. P1 — Écriture avec clavier Android

Problème

Dans "public/app.js", la fonction "cadrerSaisieSession()" utilise :

valider.scrollIntoView({
  block: 'nearest',
  behavior: 'auto'
});

Elle cherche à rendre le bouton Valider visible, sans préserver la visibilité de l'énoncé français.

Sur les captures, après le premier essai incorrect, la question « Je travaille. » est entièrement sortie de l'écran.

Comportement attendu

Avant la saisie :

- Question française clairement visible.
- Champ de réponse compact.
- Bouton Valider séparé du champ.
- Pas d'ouverture automatique du clavier sur téléphone tactile.

Lorsque le clavier est ouvert :

- Conserver autant que possible la question, le champ et Valider dans la zone visible.
- Réduire les espaces verticaux non essentiels.
- Autoriser un défilement naturel lorsque le contenu ne peut physiquement pas tenir sur l'écran.
- Éviter les scrolls automatiques répétés et les sauts de position.
- Le bouton Valider ne doit jamais être masqué par le clavier au moment où l'utilisateur veut le toucher.

Lorsqu'une première réponse est fausse :

- La question reste accessible.
- La réponse précédente est effacée selon le fonctionnement actuel.
- Le message « Pas encore · réessaie » est visible.
- L'utilisateur peut immédiatement saisir une deuxième réponse.
- La mauvaise réponse est enregistrée une seule fois.

Contraintes techniques

Examiner "cadrerSaisieSession()", "montrerFeedbackSession()", "visualViewport", "#session-input-wrap" et "#view-session .session-body:focus-within".

Ne pas remplacer aveuglément un "scrollIntoView()" par un autre. Calculer d'abord les dimensions réellement disponibles.

Le recentrage doit dépendre de l'espace visible et de la position des éléments, pas seulement de la présence du focus.

Ne pas ajouter un nouveau mécanisme de défilement sans supprimer ou coordonner les mécanismes existants.

3. P1 — Bouton Suivante toujours accessible

Problème

Sur la question « Il y a douze chaises », avec quatre choix et une correction détaillée, le bouton Suivante se retrouve parfois partiellement sous le bord inférieur de l'écran.

Dans "handleSessionChoice()", le feedback est affiché et le bouton est ajouté via "ajouterBoutonSuivante()", sans cadrage systématique de l'ensemble.

Comportement attendu

Après une réponse à un quiz ou à un trou :

- Le choix incorrect reste identifiable en rouge.
- La bonne réponse reste identifiable en vert.
- Le feedback et son explication restent consultables.
- Le bouton Suivante devient entièrement visible sans défilement manuel supplémentaire.
- Il n'y a pas de passage automatique.
- Le retour à la question et aux choix reste possible par défilement.

Si les quatre propositions et le feedback ne peuvent pas tenir simultanément, le navigateur peut faire défiler les propositions déjà corrigées pour présenter la correction et le bouton.

Le bouton ne doit ni recouvrir le feedback ni sortir de la zone interactive.

Contraintes

Conserver "ajouterBoutonSuivante()" et la logique de "nextSessionQ()".

Ne pas créer de bouton fixe qui recouvre les options, notamment sur les petits écrans.

Vérifier aussi le cas d'une correction avec une explication longue et un bouton audio.

4. P2 — Feedback de première erreur plus compact

Problème

Dans l'exercice « Je travaille », le premier échec affiche un grand rectangle rouge contenant un deuxième rectangle brun.

Cette présentation prend beaucoup trop de hauteur alors qu'il ne s'agit pas d'une correction définitive.

Comportement attendu

Premier essai faux :

- Message principal : « Pas encore · réessaie ».
- Feedback identifiable en rouge.
- Une seule zone visuelle compacte.
- Diagnostic utile sur une ou deux lignes lorsque c'est possible.
- Si le diagnostic est long, permettre sa consultation sans éloigner excessivement le champ.
- Aucun affichage de la bonne réponse.
- Aucun bouton Suivante.
- Le champ et Valider restent accessibles.

Correction définitive :

Conserver une présentation plus détaillée comprenant, selon le cas, la réponse attendue, une explication, l'audio et Suivante.

Design

Éviter les doubles encadrements rouge + brun pour les premiers essais.

Conserver les couleurs existantes :

- Rouge : réponse incorrecte.
- Vert : réponse correcte.
- Jaune : action principale.
- Texte neutre : explication complémentaire.

Il ne s'agit pas de supprimer les aides, mais de mieux les hiérarchiser.

5. P2 — Harmoniser les corrections d'écriture

Problème

Les quiz et trous affichent un titre coloré « Juste ! » ou « Pas encore ».

L'écriture affiche « Correct ! », « Correct, au 2e essai » ou « Réponse : », sans utiliser systématiquement les mêmes éléments visuels.

Comportement attendu

État| Titre
Correct au premier essai| Juste !
Correct au deuxième essai| Juste, au 2e essai
Premier essai faux| Pas encore · réessaie
Deuxième essai faux| Pas encore
Correction définitive après erreur| Afficher clairement la bonne réponse

Conserver les distinctions pédagogiques existantes.

Pour chaque correction définitive :

- Titre coloré selon l'état.
- Réponse attendue si nécessaire.
- Audio lorsqu'il est disponible.
- Attention pédagogique lorsqu'elle existe.
- Bouton Suivante.

Le tout avec les mêmes espacements et la même hiérarchie visuelle entre les types d'exercices.

Ne pas transformer la bonne réponse en texte rouge : le rouge qualifie l'essai incorrect, pas la solution.

6. P3 — Qualité des aides pédagogiques

Ce point constitue un chantier distinct, à ne pas mélanger avec la correction UI.

Exemples à auditer :

- « Pour “je travaille”, conjugue … à la première personne » : aide potentiellement trop vague.
- « Féminin → toujours eng » : préciser qu'il s'agit de l'article indéfini.

Ne pas modifier les contenus pédagogiques dans cette intervention.

Documenter séparément les aides à revoir et appliquer ensuite l'audit pédagogique habituel de LuxApp.

7. Fichiers à examiner

Principaux :

- "public/app.js" — "renderSessionQ()", "handleSessionChoice()", "validateSessionInput()", "montrerFeedbackSession()", "cadrerSaisieSession()".
- "public/exercices-v21.css" — styles de session, feedback, écriture, boutons et adaptations mobiles.
- "public/style.css" — styles historiques et interactions avec les nouvelles règles.
- "public/index.html" — ordre et structure de "#session-q", "#session-feedback", "#session-input-wrap" et "#session-choices".

Tests :

- "test/exercices-etats-v21.test.cjs"
- "test/exercices-v21.test.cjs"
- Tests de session existants.
- "tools/critique.sh"

Limiter le diff aux fichiers réellement nécessaires.

8. Matrice de tests obligatoire

Scénario| Résultat attendu
Écriture courte, clavier fermé| Question et Valider visibles
Écriture courte, clavier ouvert| Question accessible, Valider entièrement utilisable
Écriture longue, clavier ouvert| Aucun contenu tronqué ou bloqué
Écriture, premier essai incorrect| Feedback compact, question consultable, nouvelle saisie possible
Écriture, deuxième essai correct| Titre du 2e essai, audio si disponible, Suivante
Écriture, deux essais incorrects| Correction complète, sans doublon ni bouton inaccessible
Quiz à quatre propositions, réponse fausse| Choix rouge, solution verte, feedback et Suivante accessibles
Trou à quatre propositions, réponse juste| Bonne réponse verte, feedback correct
Correction avec explication longue| Défilement fonctionnel, aucune superposition
Mot caché dans la leçon| Comportement, indices et score inchangés
Entraînement et examen| Règles de score, d'essais et progression inchangées

Dimensions à vérifier

Contrôler au minimum :

- 320 × 700 px
- 360 × 740 px
- 390 × 844 px
- 430 × 932 px

Sur Android, tester également le clavier Samsung ouvert, puis fermé.

Les contrôles doivent inspecter les positions réelles des éléments dans le navigateur, notamment la portion visible des boutons par rapport au viewport.

Un test unitaire sur un faux DOM ne suffit pas à valider la mise en page.

9. Critères de validation

La correction n'est considérée comme terminée que si :

1. Tous les scénarios directement concernés passent.
2. Aucune correction logique du commit "870ba23" n'est perdue.
3. Aucune modification des scores, rappels, données ou réponses alternatives n'a été introduite.
4. Les nouveaux tests reproduisent les défauts avant correction et passent après correction.
5. "bash tools/critique.sh rapide" puis "bash tools/critique.sh" ont été exécutés.
6. Les éventuels échecs préexistants sont documentés individuellement, avec comparaison reproductible au commit de référence.
7. Des captures navigateur avant/après ont été contrôlées.
8. Le rendu clavier Samsung est validé séparément ; sans cet essai, la partie Android reste explicitement « à valider ».

10. Consignes de développement et de livraison

Respecter "AGENTS.md", "PLAYBOOK.md" et le post-mortem des exercices du 21 octobre.

- Travailler exclusivement sur "2.1".
- Vérifier l'état Git avant toute modification.
- Ne pas effectuer de rollback général.
- Ne pas refaire les exercices ou leur moteur.
- Corriger une cause à la fois.
- Ne pas ajouter de surcharges CSS sans examiner les styles calculés.
- Ne pas supprimer d'explications, d'aides ou d'audio pour gagner de la place.
- Ne pas modifier les quiz, trous ou leçons si le problème concerne uniquement l'écriture, sauf dépendance démontrée.
- Ne pas pousser une nouvelle modification d'interface sans validation des tests réalisables.
- En cas d'échec critique non résolu, ne pas prétendre que la livraison est validée.

Livrables attendus

1. Diff minimal et documenté.
2. Tests de non-régression pertinents.
3. Captures comparatives avant/après dans un navigateur.
4. Résultat détaillé de la suite critique.
5. Liste explicite des points restant à valider sur Samsung.
6. Commit sur "2.1", uniquement lorsque les conditions de livraison sont réunies.

Résultat recherché : une interface plus compacte et stable, avec des corrections pédagogiquement fiables, sans nouvelle refonte graphique ni régression fonctionnelle.
---

## Implémentation (21/10/2026)

**Statut : implémentée — recette Samsung à faire.** Branche `2.1`, à partir de `870ba23`.

### Causes et correctifs

1. **Clavier en écriture (P1).** Deux mécanismes se concurrençaient : `ui.js` (`body.clavier-actif`, déjà validé pour le parcours et la mission) excluait l'entraînement, et la refonte avait ajouté `cadrerSaisieSession()` (`scrollIntoView` sur Valider) + un `padding-bottom` en `:focus-within`. Correctif : `#session-input` passe par `ui.js` ; l'ancien mécanisme est supprimé. Clavier ouvert, la vue occupe exactement la zone au-dessus du clavier, l'en-tête est masqué, les espaces sont réduits, seul le corps défile ; si Valider est caché, défilement minimal vers lui (la question d'abord). Piège corrigé : `.progress-wrap` porte un `flex:1` historique qui l'étirait dans la hauteur fixe.
2. **Suivante accessible (P1).** `montrerFeedbackSession()` utilisait `scrollIntoView('center')` sur l'écriture seulement ; quiz et trous ne cadraient rien. Nouvelle fonction `cadrerSession()` : mesure la place visible (sous l'en-tête collant, au-dessus du clavier), garde la question si tout tient, sinon la correction, et défile juste assez pour que l'action (Valider ou Suivante) soit entière. Appelée aussi par `handleSessionChoice()`. Pas de bouton fixe, pas d'avance automatique.
3. **Premier essai compact (P2).** Classe `essai` : une seule zone rouge, titre « Pas encore · réessaie », aide en texte neutre sans second encadré, aide longue défilante (≈ 3 lignes). 166–188 px → 113 px. Ni réponse ni Suivante.
4. **Titres d'écriture harmonisés (P2).** « Juste ! », « Juste, au 2e essai », « Pas encore · réessaie », « Pas encore » + « Bonne réponse : **…** » (texte neutre, jamais rouge), avec audio et point d'attention comme avant.

Non modifiés : notation, essais, rappels, réponses alternatives, données JSON, parcours de leçon, mot caché.

### Fichiers

`public/app.js`, `public/ui.js`, `public/exercices-v21.css`, `public/index.html` (versions d'assets), tests listés ci-dessous, `tools/critique.sh` (ajout du test navigateur).

### Tests

- **Navigateur (positions réelles)** : `tests/test_spec87_session_mobile.py`, 11 scénarios × 320×700, 360×740, 390×844, 430×932 ; clavier simulé (−42 % de hauteur visible). **Échoue sur `870ba23`** (« 1er essai trop haut (188 px) » ; mesures : question hors écran après un 1er essai à 320/360/390 px, Suivante hors écran en quiz/trous à 320/360 px), **passe après correctif**.
- Node : `test/*.cjs` (108/109, l'échec « feuille Cours » est préexistant), `tests/test_session_*.js` adaptés aux titres et au cadrage.
- `critique.sh rapide` puis `critique.sh` : **résultats identiques à `870ba23` test par test**, plus le nouveau test au vert. Échecs préexistants : `test_audio_lod` (contenu « Awar! »), tests navigateur écrits pour les écrans v2 (accueil, chemin, aperçu de leçon refondus en 2.1 : `test_retours`, `test_parcours` — étape « Lancer le bilan » —, `test_acquis_v1`, `test_missions_10`, `test_lot1/2/3`, `test_navigation`, `test_chemin_lignes`, `test_seance`, `test_mission_validation`, `test_libre`, `test_decouverte`, `test_retour_android`). `test_recette_visuelle` et `test_actualisation` échouent sous charge parallèle sur les deux commits mais passent en isolé (instables).

### À valider sur Samsung

- Clavier Samsung ouvert puis fermé : question, champ et Valider visibles, sans saut.
- Après un 1er essai faux : le clavier se ferme, la correction compacte reste sous la question ; retoucher le champ rouvre le clavier sans perdre la question.
- Fermeture du clavier après validation : le cadrage est calculé deux images après le blur ; si le clavier n'est pas encore refermé, le défilement peut être un peu plus grand que nécessaire.
- Quiz/trous à 4 propositions avec explication longue : Suivante entière sans défilement manuel.

### Aides pédagogiques à revoir (P3, hors périmètre, contenus non modifiés)

- Leçon 17, écriture « Je travaille. » : « conjugue **schaffen** à la première personne » — au 1er essai, le mot est masqué (« conjugue … ») et l'aide devient vague.
- Leçon 2, 50 occurrences de « Féminin → toujours **eng** » : préciser qu'il s'agit de l'**article indéfini**.
