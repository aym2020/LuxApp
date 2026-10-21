# PLAYBOOK — LuxembourgishApp

Mémo des méthodes et techniques pour résoudre les problèmes récurrents du projet.
But : arrêter de re-réfléchir à des trucs déjà résolus.

---

## 0. Contexte projet (rappel rapide)

- **Repo** : `aym2020/LuxApp` (GitHub), déployé sur **Render**.
- **Stack** : frontend vanilla JS/HTML/CSS, backend Node.js/Express.
- **Contenu des leçons** : `data/lecons/<niveau>/lecon-NN.json` (ex : `data/lecons/A1.2/lecon-20.json`).
- **Fichiers front clés** : `public/index.html`, `public/app.js`, `public/style.css`, `public/progress.js`, `public/cloud.js`.
- **Niveaux** : A1.1 (leçons 1 à 19) et A1.2 (à partir de la leçon 20), public francophone débutant.
- **Langue de travail** : français.

---

## Alerte prioritaire — Incident des exercices 2.1 (21 octobre 2026)

**Règle permanente :** lire [le post-mortem des exercices](docs/POSTMORTEM-EXERCICES-2.1-2026-10-21.md) et [les consignes pour agents](AGENTS.md) avant toute refonte UI/UX 2.1. **L'état actuel des exercices est NON VALIDÉ** : les captures Samsung révèlent des états contradictoires, corrections mal placées et styles faux/juste ambigus, malgré CI verte.

**Pour les exercices :** conserver tous les états pédagogiques et la logique de progression ; un seul type/une seule cause à la fois ; exécuter `bash tools/critique.sh rapide` **et** `bash tools/critique.sh` avant push, vérifier DOM/captures navigateur, puis Android réel si clavier concerné. Faute de recette visuelle, ne pas annoncer un correctif UI validé. Au premier défaut majeur, stopper les patchs, chercher la cause et envisager un rollback sélectif. Branche **`2.1` uniquement**, sauf instruction contraire.

---

## SPEC 88 — Accueil fixe, catégorie Jeux et Survie (branche `2.1`)

Référence : [docs/specs/SPEC-88.md](docs/specs/SPEC-88.md). Quatre raccourcis sur une rangée (S'entraîner, Examens, Erreurs, Jeux) **sans ajout de hauteur**. Jeux est une rubrique indépendante ; Survie ne peut proposer que des mots de leçons déjà ouvertes/étudiées. Score Survie isolé des leçons, record stocké par profil local, navigation Retour Android et pause de timer sur sortie/masquage. Ne pas modifier le chemin, les examens ou la progression pour le mini-jeu.

---

## Exception explicite — Harmonisation visuelle LuxApp 2.1

Pour toute tâche concernant le **design V2.1**, travailler sur la branche **`2.1`**, et lire [`docs/CHARTE_UI_2.1.md`](docs/CHARTE_UI_2.1.md) avant de modifier les pages. L'accueil validé est la référence de composition ; `docs/DESIGN_SYSTEM.md` conserve les règles communes de composants, d'états et d'accessibilité. Les autres vues sont à harmoniser par lots, sans toucher aux contenus pédagogiques ou à la logique de progression. Pour les travaux ordinaires non explicitement V2.1, la règle de branche `v2` ci-dessous reste applicable.

---

## Règle prioritaire — Toujours suivre le vrai dépôt et la branche v2

**Incident du 19 octobre 2026 :** un examen A1.1 a été créé dans un HTML autonome et proposé sur une branche basée sur `main`, alors que LuxApp avait déjà un moteur d'examens et que la branche de travail était `v2`. Ne jamais reproduire cette erreur.

Pour toute demande de code, de leçon ou d'examen :

1. **Lire d'abord le dépôt GitHub `aym2020/LuxApp` sur `v2`**, son `PLAYBOOK.md`, les fichiers pertinents et le dernier état distant. Les pièces jointes anciennes servent de contexte, jamais de source de vérité face à la branche actuelle.
2. **Reprendre impérativement les modèles et fonctionnalités déjà présents**, notamment `public/examens.js` et `data/examens/<niveau>/examen-XX.json` pour les annales, `data/lecons/<niveau>/` pour les leçons. Pas de moteur parallèle, pas d'HTML isolé si une fonctionnalité native existe.
3. Faire des modifications ciblées, contrôler le contenu et le comportement (barème, grammaire, JSON, JS, tests de non-régression), comparer avec l'état distant.
4. **Pousser sur `v2` lorsque l'utilisateur demande un push**, sauf branche explicitement différente. Ne jamais travailler depuis `main`, y ouvrir une PR ou y pousser sans instruction explicite.
5. Toujours annoncer la branche, le commit et la limite des tests. Ne jamais présenter un code en PR ou seulement local comme déjà livré sur `v2`.

Cette règle prime sur tout exemple d'architecture plus ancien qui contredirait le dépôt réel.

---

## 0 bis. Instruction permanente — Efficacité, rigueur et rapidité de développement

Tu travailles sur LuxApp, principalement sur la branche `v2`.

Objectif : produire du code fiable, maintenable et conforme aux spécifications, avec le minimum d'opérations nécessaires.

### 1. Comprendre avant d'agir

- Vérifie d'abord la branche active, le dernier commit et les modifications existantes.
- Lis uniquement les fichiers et sections pertinents pour la tâche.
- Identifie la cause réelle du problème avant de modifier le code.
- Établis mentalement la solution la plus simple et les tests nécessaires. Évite les longues phases de planification pour les tâches simples.
- En cas de doute sur une décision fonctionnelle ou un changement de périmètre, demande confirmation plutôt que de deviner.

### 2. Privilégier les corrections structurelles

- Corrige la cause racine, pas uniquement les symptômes.
- Évite d'empiler des correctifs CSS successifs qui se contredisent.
- Réutilise les fonctions, composants, tokens et conventions existants.
- Ne refactorise pas du code sans rapport avec la demande.
- Une solution courte, claire et robuste est préférable à une solution sophistiquée sans bénéfice concret.

### 3. Réduire les itérations inutiles

- Regroupe les modifications cohérentes avant de lancer une validation.
- Évite de relire plusieurs fois les mêmes fichiers ou de relancer des commandes identiques sans nouvelle raison.
- Pour l'interface, commence par une capture représentative, corrige les problèmes identifiés, puis vérifie le résultat.
- Ne multiplie pas les captures, les mesures pixel par pixel et les ajustements de quelques pixels si l'interface est déjà lisible, responsive et conforme.
- Si plusieurs tentatives échouent, réévalue l'approche plutôt que d'accumuler les correctifs.

### 4. Tester intelligemment, sans sacrifier la qualité

Applique une validation proportionnée au risque :

- Correction isolée : test ciblé, puis contrôle des comportements voisins susceptibles d'être affectés.
- Modification d'interface : vérifier la lisibilité, les débordements, les interactions et quelques largeurs représentatives.
- Modification de logique métier ou de progression : tester les cas normaux, les cas limites, la persistance et la non-régression.
- Modification structurante : élargir les tests à tous les composants concernés.

Utilise de préférence les tests automatisés existants.

Ne supprime jamais un test indispensable pour gagner du temps. En revanche, ne répète pas une batterie complète de tests quand rien n'a changé dans son périmètre.

### 5. Définir un critère d'arrêt

Considère une tâche terminée lorsque :

1. Les exigences fonctionnelles sont satisfaites.
2. Les tests pertinents passent.
3. Aucun bug ou défaut visuel significatif n'est identifié.
4. Le code reste lisible et maintenable.
5. Aucun fichier hors périmètre n'a été modifié inutilement.

Ne poursuis pas les optimisations cosmétiques sans bénéfice perceptible ou exigence explicite.

Si un défaut réel subsiste, corrige-le. Si tu ne peux pas le résoudre de façon fiable, explique précisément le blocage.

### 6. Respecter le dépôt et le travail parallèle

- Branche de travail par défaut : `v2`. Ne pousse jamais sur `main` sans autorisation explicite.
- Vérifie les dernières modifications distantes avant toute écriture.
- Préserve les changements effectués par d'autres intervenants.
- Limite les commits aux fichiers concernés.
- Respecte les instructions explicites concernant les commits et les pushs.
- Ne modifie pas les contenus pédagogiques sans demande spécifique.

### 7. Communication concise

- Évite les comptes rendus détaillés de chaque micro-opération.
- Signale les vrais blocages et les décisions nécessitant une validation.
- À la fin, résume : ce qui a changé, les tests effectués, les limites éventuelles et le commit si applicable.

### Principe fondamental

La rigueur ne se mesure pas au nombre de commandes, de captures ou d'itérations. Elle se mesure à la justesse du résultat.

Travaille comme un développeur expérimenté : identifie rapidement le problème, choisis une solution simple, implémente proprement, teste ce qui compte et arrête-toi lorsque les critères de qualité sont atteints.

---

## 1. RÈGLE N°1 — Source de vérité

**`/mnt/project` est TOUJOURS périmé. Ne jamais l'utiliser comme source de vérité.**

- Toujours travailler à partir des fichiers que Clayton colle ou upload directement.
- Si besoin de la dernière version : la prendre sur git, pas dans `/mnt/project`.
- Cette erreur a déjà causé une grosse régression (écran Réviser configurable perdu après un commit depuis fichiers périmés).

**Avant chaque livraison** : diff contre la dernière version livrée. Clayton fait ses propres
modifs (CSS / JS), il ne faut JAMAIS les écraser.

---

## 2. Périmètre d'édition des fichiers JSON de leçon

- Clayton corrige lui-même ses erreurs linguistiques dans les JSON.
- **Ne pas toucher** aux sections exercices / flashcards / quiz sauf si Clayton upload le fichier complet ET demande explicitement les corrections.
- Par défaut, livrer **uniquement le bloc `cours`** → fichier `lecon-NN-cours.json`.
- Livrer le fichier complet `lecon-NN.json` seulement si un upload complet le justifie.

---

## 3. Orthographe et règles linguistiques luxembourgeoises

- **Toujours vérifier l'orthographe sur LOD.lu.**
- **Nombres** : entièrement soudés, sans espaces. Ex : `zweedausendvéier`.
- **Eifeler Reegel / règle du -n final** : le -n final tombe devant de nombreuses consonnes et reste notamment devant les voyelles et n, d, t, z, h. Exemples : `Ech schwätze Franséisch`, `Ech schwätzen Englesch`, `Ech si kee Coiffer`, `Ech komme vu Lëtzebuerg`.
  - Pour la conjonction « et » (`an` / `a`), ne pas appliquer une prétendue règle « a devant n » : vérifier l'expression dans LOD.lu et le contexte.
- Toujours vérifier : genres, articles, pluriels, prépositions, formes irrégulières.
- Utiliser un luxembourgeois standard.
- Réutiliser le vocabulaire déjà appris quand c'est pertinent.

---

## 4. Bug récurrent — Propagation d'événements (exercice écriture)

Dans l'exercice d'écriture, sur les listeners `keydown` de `ecrInput` et `sessionInput` :

- `e.preventDefault()` **ne suffit pas**.
- Il faut **`e.stopPropagation()`**.

Sinon le listener global `setupKeyboard` attrape l'événement qui a bouillonné et clique
immédiatement sur le bouton question suivante.

```js
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation(); // OBLIGATOIRE
    // ... valider la réponse
  }
});
```

---

## 5. Système de progression / stats

- Niveaux de question : 1 à 3, sélection pondérée.
- `luxQuestionStats` par question : `attempts`, `correct`, `wrongTotal`, `correctStreak`,
  `difficultyScore`, `lastSeenAt`, `lastWrongAt`.
- **Taux de décrément du suivi des mauvaises réponses : −2 par bonne réponse** (équilibre pédagogique retenu).

### Perf — écran Réviser

Problème : `refreshReviewAvailability` reconstruisait tout le pool de questions et lisait
le localStorage plusieurs fois par refresh → lenteur sévère.

Solution (déjà en place) :
- `getReviewCounts` dans `progress.js` : **une seule** lecture localStorage, **un seul** passage
  sur le pool, retourne tous les compteurs.
- Debounce de 80 ms via `scheduleReviewRefresh`.

**Principe général** : une lecture localStorage, un passage de boucle. Pas de relectures multiples.

### Leçons en unités (v2)

- Type de stats du mot caché : `motcache` (à côté de `quiz`, `trous`, `ecriture`).
  Pas inclus dans `getAllQuestions()` : le Dashboard et l'écran Réviser ne le comptent pas.
- Seul le **premier passage** d'un item dans une unité est enregistré (niveau + stats).
  Bonne réponse = juste du premier coup, sans indice ni « Voir la réponse ».
- Meilleur score d'une unité : `luxProgress[leconId].unites[uniteId]` (0 à 100),
  via `getUnitBest` / `saveUnitBest`. Rangé là exprès : la fusion cloud garde le **max**,
  et la v1 conserve la clé sans la lire.
- Seuls « unité complète » et « leçon complète » mettent à jour les étoiles et le « Sans faute »
  (pas « Refaire mes erreurs », ni une étape seule, ni le « + »). Leçon complète = score et
  sans faute calculés **par unité**, sur le cœur seulement (le « + » ne compte jamais).
- **« + » fait** : `luxProgress[leconId].plus[uniteId] = 1` (`getPlusFait` / `savePlusFait`),
  dès que le « + » de l'unité a été joué en entier (ou la leçon complète).
- **Mission** : `luxProgress[leconId].mission.score` = meilleur score (0-100) de la scène finale
  (`getMissionBest` / `saveMissionBest`). Toujours 3 niveaux (leçon → clé → valeur) pour que
  la fusion cloud (max) marche.
- **Complète** = fil terminé + tous les « + » + toutes les unités bonus (`leconComplete`).
- Étoiles : 3 à partir de 90 %, 2 à partir de 70 %, 1 à partir de 50 %.
  Étoiles d'une leçon = moyenne des meilleurs scores des unités du **fil** (sans les bonus),
  affichées seulement quand toutes ces unités sont terminées.
- **Sans faute** : `luxProgress[leconId].sansfaute[uniteId] = 1` (`getSansFaute` / `saveSansFaute`).
  Tout juste du premier coup, sans indice ni « Voir la réponse ». Ne se perd jamais.
  Leçon sans faute = toutes les unités du fil sans faute (`leconSansFaute`).
- Partie en cours : `luxParcours:<profil>` dans localStorage, réécrit après chaque réponse.
  **Local seulement** (pas de cloud) : la reprise se fait sur le même appareil.

### Deux couches, jamais mélangées (règle de design)

- **Acquis** = en or, ne baisse jamais : étoiles, Terminée, Sans faute, Mission ✓, Complète,
  total de jours.
- **Vivant** = en turquoise (`--fresh`), bouge avec le temps : questions dues, fraîcheur,
  « À rafraîchir », série. On ne pâlit **jamais** une étoile ou un badge.
- Rien n'est verrouillé. La séance du jour fait **20 questions** (`TAILLE_SEANCE`), puis
  « Encore 20 » / « Terminer » : on ne montre jamais une montagne, mais on peut tout enchaîner.
  Réviser propose 10 / 20 / 50 / Tout.

### Partie principale et entraînement libre (spec 22)

Deux emplacements de partie en cours : `luxParcours` (principale : une unité du fil jamais
terminée) et `luxParcoursLibre` (refaire une unité terminée, ses erreurs, le « + », une étape
seule, la leçon complète, une unité bonus). Le type est fixé au lancement (`run.libre`,
`partieLibre()`). `prochainPas()`, l'accueil et le bouton jaune du chemin ne lisent que la
principale ; la libre est signalée (« Révision en cours », « Reprendre la révision ») sans
déplacer l'anneau doré. Synchronisées séparément (`enCours.partie` / `enCours.partieLibre`).
`migrerParties()` range une ancienne répétition dans l'emplacement libre.

### Correction : coquille ou erreur (spec 24) et missions à 3 vies (spec 23)

`public/correction.js` : `analyserReponse(saisie, attendu)` — local, déterministe, sans IA.
Accents, majuscules et ponctuation **ignorés** (décision de Clayton). Une seule différence sur un
mot de 5 lettres ou plus, sans article/pronom/négation/forme connue en jeu → « Possible faute de
frappe » : une correction gratuite par réplique / phrase, rien n'est enregistré avant la décision.
Mot manquant, en trop, ordre, mot court, autre mot connu, plusieurs erreurs → erreur.
Missions : 3 vies (une seule perdue par réplique) ; réponse autonome = juste du 1er coup ou après
coquille. **Spec 32 : réussite = au moins 1 vie à la fin**, mission normale comme « Tente ta
chance » (plus de seuil 80 / 90 %). Une mission réussie valide la leçon
(`progress[lid].valideeMission.ok`, `missionReussie()`), sans étoile ni coche pour les unités pas
faites ; jouée sans réussir, elle ne termine pas la leçon. Acquis d'avant la spec 32 gardés :
ancien score ≥ 80 % = réussite, leçon terminée avec mission jouée = reste terminée, figés au 1er
essai avec la nouvelle règle (`figerAcquisMission`, `mission.regle32`, `historique.terminee`).
Score de mission = indicateur. **Spec 34** : toutes les scènes ont exactement 10 réponses
(`mission.version: 2`, vérifié par `valider-lecons`) ; chaque version de scène a son score
et sa réussite (`mission.score` v1, `mission.scoreV2` / `mission.reussieV2`) : un ancien
résultat ne valide pas la nouvelle scène (`missionReussie`), la leçon reste acquise
(`leconAcquiseParMission`). Rappel des règles des vies à la 1re mission
(`progress.guide.vies`) et en touchant les cœurs. Écrire une scène : chaque réplique « toi »
n'utilise que des mots de la leçon ou des précédentes, rattachée à une unité du fil, dans
l'ordre des unités ; règle du n final (Eifeler Regel) partout.

### Révision espacée (aucune donnée en plus)

- Date de révision **calculée** depuis `luxQuestionStats` : `lastSeenAt` + intervalle selon
  `correctStreak` → 0 ou 1 : J+1 · 2 : J+3 · 3 : J+7 · 4 : J+14 · 5+ : J+30 (`INTERVALLES`).
  Une erreur remet `correctStreak` à 0 → la question revient le lendemain.
- `itemsRevision(l)` : toutes les questions d'une leçon, mot caché compris (type `motcache`).
- `resumeRevision(lecons)` : **une** lecture des stats → questions dues + par leçon
  `{ vus, dus, dusParUnite }`. Fraîcheur = 1 − dus / vus.
  Ordre des dues : 1. erreurs actives (`luxWrong` > 0) · 2. les plus en retard · 3. les plus fragiles.
- **Étalement de l'historique v1** (`dateRevisionItem`) : une question vue avant `DEBUT_V2`
  (2026-10-16) revient au plus tôt à DEBUT_V2 + 0 à 29 jours, jour calculé depuis son
  identifiant (`numeroDeJour`, toujours le même, rien de stocké). Sinon, le jour de la v2,
  des centaines de questions tombaient d'un coup. Les erreurs actives ne sont pas étalées.
- Séance du jour (`lancerSeance`) : les 20 premières dues. Fin : « Encore 20 questions »
  (recalculé à la fin), « Continuer : prochaine unité / mission », « Terminer ».
  « Les plus fragiles » fonctionne aussi par paquets de 20.
- `demarrerSession(…, { actions })` : `actions` peut être une liste ou une **fonction**
  appelée à la fin (pour des boutons qui dépendent des réponses données).

### Jours, série, objectif du jour

- `luxProgress.jours.actif["AAAA-MM-JJ"]` : 1 = pratiqué, 2 = objectif atteint
  (rangé dans la progression pour être synchronisé ; la fusion garde le max).
- Pratiqué = au moins une réponse (`updateQuestionProgress` appelle `marquerJour(1)`).
- Objectif atteint = séance du jour terminée, une unité / un « + » / une leçon complète finie,
  ou une mission jouée (`marquerJour(2)`).
- Série = jours d'affilée avec l'objectif (celle d'hier compte tant qu'aujourd'hui n'est pas fini).
  Total de jours de pratique = ne baisse jamais. Semaine en cours : 7 cases sur l'accueil.
- L'ancien `luxStreak` reste mis à jour pour la v1, mais la v2 ne l'affiche plus.

---

## 6. Bug récurrent — Pourcentages de progression incohérents

`calculateLessonProgress` (dans une leçon) et `calculateLessonStats` (liste des leçons)
donnaient des pourcentages différents (stratégies de moyenne différentes).

Fix : dans `calculateLessonStats`, remplacer le calcul de `percent` par un appel direct à
`calculateLessonProgress(leconId).global`.

**Règle** : un seul calcul de référence pour une même valeur, réutilisé partout.

---

## 7. Cloud sync (Firebase)

- Migration Supabase → Firebase faite en sept. 2026 (plan gratuit Supabase limité à 2 projets).
- Intégration optionnelle : sans config Firebase ou sans connexion, l'app tourne en local.
- Firestore : collection `user_progress`, 1 document par utilisateur (id = `uid`).
  Contenu stocké en texte JSON dans le champ `payload`.
- Données synchronisées : niveaux des questions, erreurs, stats, série. **Jamais les leçons.**
- `mergeStatsNested` : choisit l'enregistrement le plus riche par question, par `attempts`
  puis `lastSeenAt`.
- Isolation localStorage par profil : `luxProgress:anonymous`, `luxProgress:user:<id>`.
- **v1 et v2 partagent le même document cloud.** Règle : la v2 n'ajoute que de nouvelles clés,
  sans changer la structure. Les exercices des leçons migrées ont des ids ≥ 2001, jamais
  mélangés avec l'historique v1 (ids < 1000). Testé : une synchro faite par la v1 conserve
  `unites`, `sansfaute`, `plus`, `mission`, `jours`, `motcache` et leurs stats.

---

## 7 bis. Niveaux (A1.1, A1.2…)

### Données

- Un dossier par niveau : `data/lecons/A1.1/`, `data/lecons/A1.2/`.
- Le serveur ajoute le champ `niveau` à chaque leçon à partir du **nom du dossier**.
  Ne pas écrire `niveau` dans les JSON.
- Ajouter un niveau = créer un dossier. Le sélecteur l'affiche automatiquement.

### IDs de leçon — RÈGLE CRITIQUE

- Toute la progression (locale + cloud) est indexée par `l.id`.
- **Les IDs sont globaux et continus** : A1.2 commence à 20, pas à 1.
- **Ne jamais renuméroter** une leçon existante (sinon perte ou mélange de progression).
- **Numéro affiché ≠ id (spec 42)** : le champ facultatif `"numero"` donne le numéro affiché (« Leçon 20 ») et l'ordre du parcours ; sans lui, c'est l'id. Pour insérer une leçon, lui donner un **id libre** (ex. 27) et un `numero`, puis décaler les `numero` des suivantes. Afficher toujours `numLecon(l)`, jamais `l.id`. Les renvois « leçon N » dans les textes utilisent le numéro affiché.
- Prochain id libre en A1.2 : 28.
- L'id 17 est libre (non utilisé en A1.1).

### Front

- `niveauActif` (mémorisé dans `localStorage` sous `luxNiveau`) + `leconsActives()` dans `progress.js`.
- `getAllQuestions()` filtre sur `leconsActives()` → Dashboard, Examen et Erreurs fréquentes
  sont automatiquement limités au niveau actif.
- `renderLessons()`, `openReviewSetup()` et `calculateGlobalStats()` utilisent `leconsActives()`.
- `lecons.find(l => l.id === ...)` reste sur `lecons` (IDs uniques).
- Sélecteur `#niveau-switch` sur l'accueil, construit par `renderNiveauSwitch()`.
- Une leçon sans `niveau` est traitée comme A1.1 (sécurité si le serveur n'est pas à jour).

### Contenu A1.2

- Même structure JSON et mêmes règles qu'en A1.1.
- Réutiliser le vocabulaire A1.1 dans les contextes (trous, écriture), sans le remettre en flashcards.

---

## 7 ter. Examens (sujets complets)

- Bouton « Examens » de l'accueil → liste des sujets du niveau actif (`openExamens()`).
- Un sujet = un fichier `data/examens/<niveau>/examen-NN.json`, servi par `/api/examens`.
  **Ajouter un sujet = ajouter un fichier**, aucun code à toucher.
- La liste est triée par `titre` (pas par nom de fichier) : « Annale N » = vrai test de fin
  de formation, « Sujet N » = sujet d'entraînement. Les annales passent donc en premier.
- Avant d'ajouter une annale, comparer ses parties aux annales existantes : les tests
  réutilisent souvent les mêmes textes d'une session à l'autre.
- Tout le front est dans `public/examens.js` (+ bloc « EXAMENS » à la fin de `style.css`).
- Deux types de partie, 1 point par réponse :
  - `trous` : texte avec `{1}`, `{2}`… + soit `banque` (mots communs, un seul usage),
    soit `choix` dans chaque trou (3 propositions).
  - `qcm` : texte à lire + `questions` (vrai/faux = choix `["richteg", "falsch"]`).
    `"lignes": []` si la partie n'a pas de texte (ex. photos du sujet papier décrites en français).
- Pas d'expression écrite ni d'oral (non corrigeables) : un sujet est noté sur 40.
- Correction partie par partie : le bouton « Corriger » affiche la correction de la partie
  (`examChecked`), ses réponses sont alors verrouillées, puis « Suivant ». On ne peut voir
  le score qu'une fois toutes les parties corrigées.
- À la fin : score, score par section, correction complète ou « Mes erreurs » seulement,
  avec la `note` en français de chaque réponse (justes et fausses).
- Traduction (dans la correction seulement, jamais pendant l'exercice) : petit **FR** au bout de
  chaque ligne / question (traduit cet élément), grand **FR** en tête de partie (traduit tout). 3e élément
  d'une ligne `[label, texte, traduction]`, `chapeau_fr`, et dans une question
  `question_fr` et `choix_fr` (même ordre que `choix`, pas besoin pour richteg / falsch).
  Tout est facultatif : sans traduction, le bouton n'apparaît pas.
- Explication des QCM : `"preuve": [passage exact du texte, traduction]` + `"note"` (pourquoi
  vrai / faux, une ou deux phrases). Le passage doit être recopié tel quel depuis le texte.
- Meilleur score par sujet : `luxExamens:<profil>` dans localStorage (local, pas de cloud).
- L'ancien examen (50 questions aléatoires) reste accessible en bas de la liste des sujets.
- Vérifier un sujet : chaque `reponse` est dans ses `choix` (ou dans la `banque`),
  et les numéros `{n}` du texte vont de 1 au nombre de trous.

---

## 8. Patterns de test (à réutiliser systématiquement)

### Rythme de travail et niveaux de tests — RÈGLE

Objectif : **temps de traitement minimal, qualité intacte**. Privilégier une
implémentation rapide et ciblée. Ne pas relancer toute la suite après chaque
correction (surtout CSS) ; limiter le perfectionnement visuel et **signaler**
les problèmes secondaires au lieu de bloquer la livraison.

| Quand | Quoi | Durée |
| --- | --- | --- |
| Pendant le travail | `node --check` des fichiers touchés + **le(s) test(s) ciblé(s)** du tableau ci-dessous | < 1 min |
| Avant chaque push (**suite critique**) | `bash tools/critique.sh` (syntaxe, contenu, tests Node, puis 15 tests navigateur 2 par 2, les plus longs d'abord) | **~1 min 30** |
| Petite modification sans risque (texte, CSS isolé, doc) | `bash tools/critique.sh rapide` + le test ciblé | < 1 min |
| Avant de fusionner `v2` dans `main` | `python3 tests/test_fil.py` et `python3 tests/test_migration.py` complets | long |

**Tests ciblés selon le fichier touché** (pendant le travail) :

| Fichier modifié | Tests à lancer |
| --- | --- |
| `navigation.js`, `accueil.js` (panneaux, retour) | `test_navigation`, `test_retours`, `test_retour_intro`, `test_decouverte`, `test_actualisation` |
| `mission.js` | `test_mission_vies`, `test_mission_validation`, `test_retour_intro` (+ `test_missions_10` si scènes ou correction) |
| `parcours.js` (unités, fin de partie, rappels des erreurs) | `test_parcours`, `test_rappels`, `test_libre`, `test_lot2` |
| `parcours.js` (mot caché) | `test_motcache` |
| `chemin.js`, `niveau.js` | `test_chemin_lignes`, `test_chemin_cartes` (cartes repliées, 320–430 px, texte agrandi), `test_lot3`, `test_decouverte`, `test_rappels` (centrage) |
| `examens.js` | `test_examens` (sujets, passage, résultat, Retour), `test_chemin_cartes` (liste des sujets) |
| `progress.js`, `cloud.js` | `node tests/test_cloud.js`, `node tests/test_sync.js`, `test_lot1` |
| `correction.js`, `diagnostic.js` (aide après erreur) | `node tests/test_correction.js`, `test_rappels`, `test_prerequis`, `test_mission_vies` |
| `revision.js`, séance | `test_seance`, `test_lot2` |
| `data/lecons/` | `node tools/valider-lecons.js`, `node tools/audit-prerequis.js` (mots exigés avant d'être enseignés, rapport), `test_missions_10` si `scene` touchée, `test_prerequis` ; **puis `node tools/audio-lod.js`** (sons LOD des nouveaux mots et phrases, rapport des refus ; voir SPEC 69), relire les « nouveaux candidats » contextuels (SPEC 70 : les ajouter à `tools/lod/contextes.json` avec leur traduction, ou à `_refusés`), `node tools/lod/audit-audio.js` (couverture par leçon) et `node tests/test_audio_lod.js` ; moteur de correspondance (SPEC 73) : `node tools/lod/audit-correspondances.js` (index versionné, aucun fichier externe) propose sons sûrs / à valider, formes fléchies et phrases candidates → relire, puis ajouter à `tools/lod/correspondances.json` (sons directs) ou `tools/lod/contextes.json` (phrases, avec traduction) → `node tools/audio-lod.js` ; orthographe : `node tools/lod/inventaire-orthographe.js` ; nouvel export LOD : `node tools/lod/construire-formes.js art.xml tab.xml search.xml` et `node tools/lod/construire-index.js art.xml` |
| `style.css` seul | aucun test navigateur ; capture d'écran du point touché |
| `server.js`, `recette/` (mode recette) | `test_recette_visuelle` |

**Recette visuelle sur téléphone (spec 43)** : voir [docs/RECETTE.md](docs/RECETTE.md). Une instance dédiée `RECETTE=1` (mot de passe, sans Firebase, autre origine) donne « Plus → Outils de test » pour ouvrir en moins d'une seconde le vrai écran de fin de mission, d'étape, d'unité ou de rattrapage. **Jamais `RECETTE=1` sur un service public.**

**Règles de vitesse :**

- La suite critique se lance **une seule fois, en fin de lot**. Plusieurs specs à la suite → une seule suite et un seul push.
- **Ne jamais pousser** si un test critique échoue.
- Nouveaux tests : utiliser `tests/helpers.py` (`ouvrir`, `repondre`, `finir`, `passer_delai`…) au lieu de recopier les helpers. **Jamais d'attente fixe** (`wait_for_timeout`) quand on peut attendre un état (`wait_for_function`, `wait_for_selector`).
- `passer_delai()` déclenche tout de suite le passage automatique après une bonne réponse (même `reussir()` que l'app). Le vrai délai est vérifié une seule fois, dans `test_parcours.py`.
- Lire seulement les fonctions concernées par la spec ; écrire le test de régression en une passe, le faire échouer sans le correctif, puis corriger.
- **Échec connu (oct. 2026)** : `test_fil.py` s'arrête à l'étape 10 (séance de révision,
  attente de `#view-session .ecr-next-btn`). L'échec existe sans les changements récents :
  ne pas le re-diagnostiquer à chaque livraison ; le corriger dans une tâche dédiée.
- `tools/critique.sh` démarre lui-même le serveur local (`LUX_TESTS=1 PORT=3456`, sans portail d’entrée) s'il ne tourne pas, et récupère `main` si le clone est partiel (nécessaire à `test_cloud.js`). Un serveur déjà lancé sans `LUX_TESTS=1` fait échouer la suite : sinon le portail d'entrée (SPEC 63) couvre les écrans testés.

### Test de logique → script Node autonome dans `/tmp/`

1. Mocker `localStorage` avec un objet simple (proxy).
2. Stub `lecons` comme variable globale.
3. `eval()` les fichiers source concaténés dans le même scope.
4. Ajouter `process.on('unhandledRejection', () => {})` pour étouffer le bruit des stubs fetch.

```js
// /tmp/test.js
const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.lecons = [ /* stub */ ];
process.on('unhandledRejection', () => {});

const fs = require('fs');
const src = fs.readFileSync('public/progress.js', 'utf8');
eval(src);

// ... appeler les fonctions et asserter
```

### Test DOM / CSS → jsdom

- Injecter le CSS via une balise `<style>` inline.

### Vérifier l'accessibilité globale d'une fonction (pour `onclick`)

- `eval()` donne des faux négatifs sur le scope.
- Utiliser : `grep -n "^function nomDeLaFonction" public/*.js`

---

## 9. Détails UI à connaître

### Design system — RÈGLE (spec 19)

Référence : `docs/DESIGN_SYSTEM.md` ; catalogue vivant : `/catalogue.html`.
Trois niveaux : `public/design-tokens.css` (valeurs) → `public/components.css` (composants) →
`public/style.css` (écrans). Une nouvelle couleur, taille ou rayon devient un **token** ; un
nouveau bouton ou badge réutilise un **composant**. Toute exception est documentée dans
`docs/DESIGN_SYSTEM.md`, qui garde l'historique des versions. Pour un changement qui ne doit
rien modifier visuellement : comparer des captures avant / après.

- Coloration flashcards par langue : bleu pour le français (`.face-fr`), or pour le
  luxembourgeois (`.face-lu`).
- Badges de choix lettrés (A/B/C/D) via compteurs CSS.
- Carte question : dégradé unifié + barre d'accent en haut.
- Couleur par leçon : custom property `--lc` posée dans `app.js`.
- Fix débordement tableau mobile : `table-layout:fixed` + conteneur scroll `.cours-table-wrap`.
- **Pas d'emoji sur les boutons d'action.**

### Parcours en unités (leçons v2) — `public/parcours.js` et `public/mission.js`

- Une leçon **avec** `unites` s'ouvre sur l'écran des unités (`view-plecon`).
  Une leçon **sans** `unites` garde l'ancien écran à onglets : rien ne casse pendant la migration.
- Écrans : liste des unités → « Avant de commencer » (`view-pintro`) → exercice
  (`view-parcours`) → fin d'unité (`view-pfin`). Panneau Cours par-dessus (`#cours-panel`).
- Une unité = 4 étapes dans l'ordre : Mot caché → Quiz → Trous → Écriture.
  Une étape sans item est sautée.
- Erreur = l'item repart en fin d'étape (« +n à refaire » dans l'en-tête). On avance seulement
  quand c'est juste. Quiz/trous justes : passage automatique ; faux : bandeau + Continuer.
- **Mot caché** : une case par lettre ; espaces, apostrophes, tirets, « ? » déjà affichés.
  Comparaison = `normalize()` de l'écriture (accents et ponctuation ignorés).
  Erreur → les lettres bien placées passent en vert (gratuit). « Indice » révèle une lettre
  au hasard (coûte des points). « Voir la réponse » apparaît après 3 essais ratés : score 0
  et le mot revient en fin d'étape. Score du mot = (lettres − indices) / lettres.
- Fin de partie : score, étoiles, score par étape, moment « Première fois sans faute ! »,
  « À retravailler » (avec le point d'attention), « Refaire mes erreurs », « Unité suivante ».
- Écran leçon, de haut en bas, **rien n'est verrouillé** :
  - **carte mission** (`missionHtml`, `mission.js`) : titre, contexte, « À la fin, tu sauras »,
    la scène en bulles (une réplique est en clair quand son unité est terminée, sinon floutée
    avec « Unité n »), « n / N répliques débloquées », bouton « Jouer la mission »
    (jaune quand le fil est fini) ;
  - une carte par unité : état, étoiles, **la phrase de l'unité**, aperçu des mots du cœur,
    « À rafraîchir · n », Commencer / Refaire, les 4 étapes seules (sur le cœur) et le chip
    **« + n mots »** (doré, coché quand il est fait). Unité bonus : bordure pointillée, « BONUS » ;
  - carte « Toute la leçon » : **tout le contenu** d'un coup (cœur + « + » + bonus, mode `lecon`),
    une étape sur toute la leçon, « Tout revoir », « Rafraîchir · n » ;
  - le bilan (10 questions du fil, sans « + » ni bonus), toujours ouvert.
  Seule la prochaine unité du fil à faire a le bouton jaune.
- Modes de `startUnite(uniteId, mode)` : `unite` = cœur · `plus` = seulement le « + » ·
  `lecon` = tout · `etape` / `erreurs` = filtre. `itemsUnite(l, type, unite, quoi)` avec
  `quoi` = `coeur` / `plus` / `tout`.
- « Avant de commencer » : la phrase de l'unité (en grand), la règle, les pièges, les mots du
  cœur, puis **« + n autres mots · même phrase »** replié (`<details>`), les exemples.
- Fin d'unité : « Ta mission avance » (les répliques débloquées), puis les boutons
  Refaire mes erreurs · **Unité suivante** (ou **Jouer la mission** après la dernière) ·
  **« Élargir : n mots de plus · x min »** · Retour. « Leçon complète ! » au moment où elle le devient.
- **Mission** (`view-mission`) : les répliques des autres s'affichent seules ; pour chaque
  réplique « toi », on écrit le luxembourgeois à partir du français (`normalize`, ponctuation
  ignorée). Erreur → on réessaie, avec l'`aide` de la réplique ; « Voir la réponse » après
  2 essais ratés. Score = répliques justes du premier coup. Pas de stats de révision.
- **Points d'attention** : `unites[].pieges` (1 ou 2) sur l'écran « Avant de commencer »
  (encadré orange) ; `attention` d'un item affiché au moment de l'erreur (mot caché, quiz,
  trous, écriture, révision). Sans `attention`, un trou affiche sa `note`.
- Liste des leçons : carte « Reprendre » en tête si une unité est en cours.
- Panneau Cours : onglet « Unité n » (blocs de l'unité + blocs généraux) et « Toute la leçon ».
  Les blocs `"plus": true` sont repliés en bas, sous « Voir + · les mots en plus ».
- Les raccourcis clavier des cartes (espace, flèches) ne marchent que sur l'écran à onglets
  et jamais dans un champ de saisie (sinon la barre d'espace était bloquée).

- **Navigation (spec 25)** : « Accueil » = `goDashboard()`, toujours l'accueil ; « Retour » =
  écran précédent (pile de `navigation.js`) ; « Retour à la leçon » = liste des unités.
  `history.scrollRestoration = 'manual'` (sinon le navigateur replace la page après notre
  propre placement). `allerALaCarte()` place la carte sous l'en-tête fixe, en un seul scroll
  immédiat. `cibleDeRetour()` décide d'après l'écran réellement quitté. `.cta-fixe` : fondu
  limité à la marge haute et `pointer-events: none` hors du bouton (un bouton à moitié caché
  derrière reste appuyable).
- **Chemin (spec 27)** : unités `ok` (titre clair, coche verte cerclée, étoiles or),
  `actuelle` (anneau, titre et chevron or), `a-venir` (cercle neutre, texte secondaire).
  1re réussite d'une unité (`dernierFini.premiere`) : coche, étoiles une par une, halo vert,
  puis la prochaine unité pulse (`.pulse.apres`). Une seule fois ; coupé en mouvement réduit.
- **Focus « Continuer » (spec 35)** : `focusApresClavier()` (ui.js) — focus programmatique
  seulement après une saisie au clavier ; ne jamais supprimer `:focus-visible`. Mission : retours
  sans jargon (« Bonne réponse, au 2e essai ! », « Réponses trouvées sans erreur »), ascenseur fin.
- **Chemin continu (spec 33)** : toutes les leçons dans l'ordre, une carte chacune (plus de
  bloc « Terminées ») ; leçon acquise verte ; unité non jouée d'une leçon acquise par la mission
  = `ok par-mission` (sans étoiles, « Validée par la mission »). En-tête animé seulement à
  l'arrivée (`entre` si `cheminArrivee`) ; accordéon = un seul défilement immédiat.
- **Lignes du chemin (spec 29)** : grille état · `.texte` · `.tag` · chevron ; « Révision en
  cours » en 2e rangée seulement si elle existe ; mission et bilan : même structure, statut
  `.statut` sobre à droite (spec 30) ; requêtes de conteneur en `em` (< 16 em : statuts mission
  et bilan sous le titre ; < 13 em : étoiles aussi). Jamais de troncature. `aria-label` = titre
  + état. En-tête de mission : titre de la mission (2 lignes max), vies et compteur dessous.
- **Résultats (spec 28)** : `messageResultat(percent)` (Parfait / Excellent / Bien joué /
  Tu progresses / Continue à t'entraîner, purement visuel), score vert dès 75 %,
  « n / N réponses justes du premier coup », « Une réponse à retravailler. ». Étoiles et
  barres seulement quand il y a lieu (unité ou leçon complète ; barres si plusieurs étapes).
  « À retravailler » repliable (ouvert d'office jusqu'à 3 lignes).

### Accueil, lexique, mes pièges — `public/revision.js`

- Accueil : bloc « Aujourd'hui » (série, semaine, « Ta séance : 20 questions · x min » +
  « n autres en attente » en discret, prochaine étape, objectif, bouton « Ma séance »), puis
  « Tout explorer » (Leçons, Réviser, Lexique, Mes pièges, Examens, Erreurs fréquentes).
- Prochaine étape (`prochaineEtape`) : partie en cours, sinon première unité du fil jamais
  faite, sinon la mission d'une leçon dont le fil est fini.
- Liste des leçons : anneau de fraîcheur autour du numéro (toutes les leçons),
  pastilles d'acquis en or, « À rafraîchir · n » en turquoise.
- Lexique : tous les mots (cartes) des leçons du niveau, recherche FR ou LU (`normalize`).
- Mes pièges : **calculé** depuis les stats (rien de stocké) = questions avec un point
  d'attention sur lesquelles on s'est trompé, regroupées par texte, triées par nombre d'erreurs.
- Moteur de session (`app.js`) : accepte le type `motcache` (écrire le mot à partir du français),
  affiche le point d'attention à l'erreur, boutons de fin passés à `demarrerSession(…, { actions })`.

---

## 10. Conventions de structure d'une leçon

```
{
  "id", "titre", "titre_fr", "couleur",
  "instructions": {...},
  "flashcards": [...],   // mémorisation : vocab / expressions courtes, PAS de phrases longues
  "quiz": [...],         // reconnaissance : suit exactement les instructions
  "trous": [...],        // contextualisation : teste la NOTION PRINCIPALE
  "ecriture": [...],     // production : toujours FR → LU, couvre toutes les notions
  "cours": [...]         // référence complète : aucune notion importante absente
}
```

Règles à vérifier à chaque leçon :
- Toutes les sections travaillent **la même notion**.
- Distracteurs plausibles (traduction proche, contraire, autre genre, pluriel, pays,
  langue, nationalité, règle proche). Jamais absurdes.
- Les instructions correspondent exactement aux exercices.
- Toute notion importante apparaît dans `cours` ET dans `ecriture`.
- Cohérence orthographique sur toute la leçon.
- **JSON toujours valide.**
- `id` = numéro suivant la dernière leçon existante, tous niveaux confondus.

### Audio LOD d'abord — création des nouvelles leçons (SPEC 70)

Pour les **nouvelles** leçons, partir des phrases que le LOD a enregistrées :
1. Lister les notions à enseigner (niveau, vocabulaire déjà vu, objectifs).
2. Pour chaque notion, chercher des exemples : `node tools/lod/exemples.js "ech wunnen"`
   (A1 puis A2, les plus courts d'abord, avec l'identifiant de l'enregistrement).
3. Retenir ceux qui conviennent à un débutant : sens littéral, vocabulaire connu ou enseigné dans la leçon,
   pas d'expression idiomatique. Les reprendre **mot pour mot** (sinon l'audio ne correspond plus).
4. Écrire les sections avec ces phrases, en gardant toutes les règles ci-dessus (flashcards, quiz, trous, écriture, cours).
5. Une phrase pédagogiquement nécessaire sans enregistrement reste dans la leçon : **jamais** une phrase
   compliquée à la place d'une phrase simple pour gagner un audio. Les exemples interchangeables, eux, viennent du LOD.
6. Relancer `node tools/audio-lod.js` puis `node tools/lod/audit-audio.js` ; viser ~99 % d'audio sur les nouveaux contenus.

Ne jamais réécrire une leçon existante pour augmenter la couverture audio sans validation de Clayton (audit : `docs/audit-audio-lod.md`,
enrichissement : `docs/audit-enrichissement-lecons-1-3.md`).

**Téléchargement des phrases LOD (SPEC 72)** : `lod.lu` est bloqué pour Claude. Clayton lance sur son téléphone (Termux)
`curl -sSfL https://raw.githubusercontent.com/aym2020/LuxApp/v2/tools/termux-audio-lod.sh | bash` ; le script pousse
les sons sur la branche `audio-phrases` ; Claude vérifie (`node tests/test_audio_lod.js`) puis fusionne `public/audio` dans `v2`.

Audio dans l'application : **or** = prononciation exacte du mot ou de la phrase ; **gris sable** = l'expression
dite dans une phrase LOD (bulle flottante au clic : phrase en blanc cassé, expression en doré, traduction — SPEC 71/72). Un seul bouton,
le son exact en priorité. Sous un bloc de vocabulaire, « N exemples en contexte » ouvre l'écran d'exemples (`public/contexte.js`).

### Faux absents LOD et formes fléchies (SPEC 73)

Le message « mot absent de LOD » signale actuellement l'absence du **lemme**, pas nécessairement de la forme fléchie. Avant d'ajouter des associations audio, étudier aussi l'index de recherche LOD et les tables de flexion (verbes et adjectifs). Les graphies générées automatiquement ne sont pas des preuves de correction orthographique.

Procéder dans l'ordre : **audit des candidats → vérification de la forme et du sens → confirmation de la prononciation exacte ou contextuelle → contrôle du fichier → publication**. Ne jamais utiliser l'audio d'un lemme pour son pluriel/participe sans vérification de la forme réellement entendue. Voir docs/specs/SPEC-73.md. Les leçons ne doivent pas être modifiées lors de l'audit.

### Cours en trois rubriques — SPEC 75 (pilote leçons 1 à 3)

Pour les seules leçons 1 à 3, répartir explicitement les blocs `cours` en **Règles / Lexique / Phrases** via `rubrique`, en conservant le filtre d'unité et « Toute la leçon ». Les tableaux de grammaire restent dans Règles ; les tableaux de vocabulaire vont dans Lexique (avec `plus` replié). Les phrases et dialogues restent dans Phrases, avec audio uniquement si vérifié. Le Cours doit rendre de manière cohérente dans l'onglet principal et dans le panneau ouvert pendant un exercice. Ne modifier aucune autre section de leçon ni l'état de progression. Ne pas migrer les autres cours avant validation du pilote. Référence complète : `docs/specs/SPEC-75.md` ; maquette : `docs/maquettes/LuxApp_Lecon2_Cours_3onglets.html`.

### Blocs `cours`

```json
{ "type": "vocab",    "titre": "...", "items": [["lu", "fr"]] }
{ "type": "regle",    "titre": "...", "lignes": [...] }   // courtes, précises, applicables
{ "type": "dialogue", "titre": "...", "echanges": [["lu", "fr"]] }
{ "type": "tableau",  "titre": "...", "entetes": [...], "lignes": [[...]] }
```

**Tableaux de traduction (spec 26) : luxembourgeois à gauche, français à droite**, colonnes
de contexte ensuite (Phrase modèle, Structure, Remarque…). Les tableaux grammaticaux
(Genre / Article / Négation, conjugaisons, Singulier / Pluriel…) gardent leur ordre.
`valider-lecons` refuse un tableau où « Français » précède « Luxembourgeois ».

### Format v2 : une leçon avec un fil

**Toutes les 24 leçons sont migrées en V2** : A1.1 (1 à 17) et A1.2 (20 à 26). Aucune leçon au format V1 ne reste dans data/lecons/.

**Migrer une leçon v1** : les leçons du premier lot disposent chacune d'un script dans `tools/migration/lecon-NN.py` (petite fabrique
`fabrique.py` : ids donnés à partir de 2001, champ `v1` rempli tout seul). Lancer
`python3 tools/migration/lecon-NN.py`, puis `node tools/valider-lecons.js` et
`python3 tests/test_migration.py` (chaque unité et la mission jouées de bout en bout).

**Lot 4 (20, 23, 24, 25, 26)** : unités et missions A1.2 avec conservation de `v1`. Vérification structurelle : `node tests/test_lot4_contenu.js`. Parcours navigateur : `python3 tests/test_migration.py` (toutes les leçons migrées).

**Lot 2 (7, 9, 10, 11, 12, 13)** : JSON migrés et versionnés directement dans Git, avec archive `v1` préservant l'ancien acquis. Vérification structurelle : `node tests/test_lot2_contenu.js` ; test d'interface : `python3 tests/test_migration.py` (étendu au lot 2). Avant toute nouvelle migration, partir du dernier état Git et ne pas écraser les JSON v2.
- `"v1": { "quiz": 35, "trous": 25, "ecriture": 43 }` = nombre de questions de l'ancienne version.
  Il sert à garder l'acquis : une leçon réussie en v1 (≥ 70 %, ids < 1000) reste **terminée**
  (« Acquise » sur le chemin, `acquisV1`), sans score inventé pour les nouvelles unités.
- Eifeler Regel aussi pour « et » : <b>an</b> devant voyelle et n, d, t, z, h, sinon <b>a</b>
  (schwaarz a brong · gutt a bëlleg, vérifié sur LOD).

**Principe : chaque leçon mène à une conversation.** La mission est une scène de la vie
réelle ; chaque unité apprend **une phrase** de cette scène ; la mission finale la rejoue.
Tout le contenu testé reste dans la leçon : ce qui ne sert pas le fil va dans le « + »
(même phrase, plus de mots), jamais une nouvelle règle.

```
{
  "id", "titre", "titre_fr", "couleur",
  "instructions": {...},            // "flashcards" décrit le Mot caché
  "mission": { "titre": "La fête des voisins",
               "contexte": "Marie, ta voisine, vient se présenter. Tu joues Paul, français.",
               "objectif": "dire ta nationalité, présenter quelqu'un, …" },
  "scene": [                        // la conversation finale, dans l'ordre
    { "qui": "Marie", "lu": "Moien! Ech sinn d'Marie.", "fr": "Bonjour ! …", "unite": 1 },
    { "qui": "toi", "lu": "Ech si Fransous.", "fr": "Je suis français.", "unite": 1,
      "aide": "Le n tombe devant F → <b>Ech si</b>." }      // affichée à l'erreur
  ],
  "unites": [
    { "id": 1, "titre": "Dire sa nationalité",
      "phrase": ["Ech si Fransous.", "Je suis français."],   // LA phrase de l'unité
      "regle": "…", "exemple": "…", "phrases": [["…", "…"]],  // exemples
      "pieges": ["…", "…"] },
    { "id": 4, "bonus": true, "titre": "Les pluriels", … }    // unité bonus (facultative)
  ],
  "flashcards": [{ "id": 2001, "unite": 1, "fr": "…", "lu": "…", "plus": true, … }],
  "quiz":     [{ "id": 2001, "unite": 1, ... }],
  "trous":    [{ "id": 2001, "unite": 1, ... }],
  "ecriture": [{ "id": 2001, "unite": 1, "fr": "…", "lu": "…" }],
  "cours":    [{ ...bloc, "unite": 1, "plus": true }]
}
```

Règles du fil :
- **Une unité = une phrase de la scène.** Les unités suivent l'ordre de la scène : les
  répliques de l'unité 1 viennent en premier, etc. Chaque unité du fil a au moins une
  réplique ; les répliques « toi » (3 à 5) sont ce que l'apprenant saura dire.
- Une réplique n'utilise que ce que les unités ont appris (les répliques des autres peuvent
  contenir un mot nouveau, puisque la traduction est affichée).
- **Cœur** d'une unité : 5 à 10 mots, quiz 6–10, trous 6–10, écriture 5–8, tous au service
  de la phrase. Le cœur d'une unité n'utilise **jamais** un mot du « + ».
- **« + »** (`"plus": true`) : le reste du vocabulaire testé, **dans la même phrase**.
- **Aide vocabulaire (spec 42)** : `"aide_vocab": [{ "fr": "en voiture", "lu": "mam Auto", "precision": "…" }]` sur un item d'écriture ou une réplique « toi ». Repli fermé par défaut, sans pénalité. Seulement pour un groupe de mots **nouveau et hors objectif** de l'exercice ; jamais la réponse entière ni la notion évaluée (auxiliaire, conjugaison…). `valider-lecons` refuse l'aide qui donne la réponse entière.
- **Prérequis (spec 42)** : rien d'obligatoire (quiz, trous, écriture, mission) avant d'être enseigné dans le cœur d'une unité précédente ou égale (mot caché, règle, exemple), dans une leçon précédente, ou via `aide_vocab`. Contrôle : `node tools/audit-prerequis.js` (rapport, faux positifs possibles sur les prénoms et les formes conjuguées).
  Pas de limite de taille. Jamais de nouvelle règle dans le « + ».
- **Unité bonus** (`"bonus": true`) : une notion testée qui ne prolonge aucune phrase
  (ex. les pluriels). Pas de réplique dans la scène, pas de « + ».
- 2 à 4 unités par leçon (bonus compris).
- **Une carte = un mot** : `lu` = ce qu'on tape. `article` affiché à côté des cases,
  `indice` sous le mot français.
- **Article à écrire** (`"articleAEcrire": true` sur une unité) : quand l'article EST la
  notion de l'unité (e / en / eng), le mot caché fait taper « eng Mapp », pas « Mapp » —
  dans l'unité et en révision. Les cartes de cette unité portent leur `article` ; le
  validateur signale un nom seul sans article. Les autres unités ne changent pas.
- **Couleur** : une des 7 teintes de la palette, jamais la même que la leçon précédente.
- Ids de tous les exercices à partir de **2001** (1001+ = premier essai v2, < 1000 = v1).
- Blocs de cours : `"unite": n` = unité n ; sans `unite` = général ; `"unite": 0` = seulement
  « Toute la leçon » (la scène en dialogue). `"plus": true` = replié sous « Voir + ».
  3 lignes maximum par encadré.
- **Points d'attention** :
  - `unites[].pieges` : 1 ou 2 pièges par unité, courts, avec `<b>` sur le mot clé ;
  - `attention` sur un item : le piège exact de cette question. Pour un trou, il porte sur le
    mot à trouver ; sinon la `note` du trou sert ;
  - `scene[].aide` : le piège de la réplique, affiché à l'erreur dans la mission.

### Vérifier avant chaque livraison

```
node tools/valider-lecons.js
```

Contrôle toutes les leçons (JSON, ids, unités, réponse présente dans les choix, tailles du
cœur, mots cachés présents dans le cours, mission et scène, phrase de chaque unité…).
ERREUR = bloquant, ATTENTION = à regarder.

---

## 11. Sorties

- Tous les fichiers livrés vont dans **`/mnt/user-data/outputs/`**.

---

## 12. Préférences de communication

- Pas de question à la fin des réponses.
- Solution optimale directement.
- Réponses précises, directes, droit au but.
- Code simple à comprendre pour un junior, pas de pratiques complexes.


### SPEC 75 — Cours partagés (pilote initial A1.1 1–3)

Le composant `public/cours75.js` rend les trois rubriques Règles / Lexique / Phrases et la portée Unité/Toute la leçon, dans l'onglet Cours et le panneau d'exercice. Chaque bloc pilote porte `rubrique: regles|lexique|phrases`; les données hors `cours` sont inchangées. Les autres leçons continuent d'utiliser `coursBlocsHtml`. Le lexique local inclut les 36 mots complémentaires de la leçon 2 repliés, sans recherche locale. L'audio réutilise les catalogues validés SPEC 68–73 (or exact, sable contexte). Valider avec `node tests/test_spec75.js && node tools/valider-lecons.js && bash tools/critique.sh`, puis tester manuellement le panneau Android et l'audio avant de clôturer la recette.

SPEC 75 — Recette mobile : grille unique 1/2/3/4/Tout (ou 1/2/3/Tout), sans scroll horizontal, disponible même pendant un exercice ; aucun champ de recherche dans le cours ; panneau d'exercice à hauteur stable de 88dvh, seul son contenu défile ; phrases et icônes d'écoute alignées. Variantes lexicales de la leçon 1 séparées pour rendre l'audio exact (notamment TIPPTOPP1) accessible sans faux rapprochement. Conserver les champs hors `cours` inchangés.


### SPEC 75 — Lignes de cours harmonisées (20/10/2026)
Dans les leçons pilotes 1–3, les mots, expressions, phrases et dialogues sont tous rendus par cours75EntreeHtml() et cours75ListeHtml(). La ligne LU a min-height:40px, qu'un bouton audio existe ou non ; la traduction et la note sont toujours placées en dessous avec les mêmes marges. L'audio utilise le vrai bouton LOD et n'est jamais simulé. Les anciens tableaux et cours-dialogue restent disponibles pour les leçons 4+. Contrôle : node tests/test_spec75.js puis recette Android.


### SPEC 75 — Extension à toutes les leçons (20/10/2026)
Règles/Lexique/Phrases est désormais activé pour les **25 leçons** (A1.1 1–17, A1.2 20–27). Migrer de façon conservatrice avec `tools/spec75-migration.js` : ne toucher qu'à `cours`, classer `texte`/`callout`/tableaux grammaticaux en Règles, les mots et tableaux lexicaux en Lexique (en-têtes originaux conservés), les dialogues et phrases complètes en Phrases. Les tableaux de production LU/FR mixtes sont séparés en mots/phrases sans changer les traductions. Une unité bonus dépourvue de phrase/règle reprend celles déjà contenues dans `unites` ou `ecriture`. Les paires LU/FR partagent `cours75EntreeHtml`, les tableaux complexes gardent un `<table>` avec leurs en-têtes. Lexique commun accessible si pas de vocabulaire local. Vérification `node tools/spec75-migration.js && node tests/test_spec75.js && node tools/valider-lecons.js && bash tools/critique.sh`. Le vieux texte du pilote ne restreint plus la portée. Recette Android 4–27 encore nécessaire.


### SPEC 76 — Information mode invité (20/10/2026)
Après le choix invité du portail, une fenêtre sombre avec deux lignes (progression stockée **sur l'appareil uniquement**, **risque de perte** si les données sont effacées) remplace le toast trompeur. Un seul bouton « Compris » jaune. `public/portail.js` utilise `luxInfoInviteVueV1` en localStorage, mémorisé uniquement à la fermeture ; pas d'effet sur les données de progression. Blocage du scroll et focus, Retour Android et Échap via `navigation.js`. Pas d'apparition pour comptes connectés ni en mode RECETTE/TESTS. Vérifier : `node tests/test_spec_63_portail.js`. Ne pas réintroduire le toast.


### SPEC 76 — Version « C’est parti ! » animée (20/10/2026)
Après validation UX Android, remplacement de l'en-tête trop haut par une carte **centrée et compacte** : téléphone + coche verte, titre « C’est parti ! », deux messages courts (progrès locaux ✓, perte possible ⚠), invitation discrète à se connecter, un bouton jaune « Compris ». CSS scoped `.pi-*` sans balise `header` (l'ancienne héritait du CSS global et grandissait). Apparition 420 ms, coche retardée, halo discret deux cycles, zéro mouvement si `prefers-reduced-motion:reduce`. Clé `luxInfoInviteVueV2` pour permettre une dernière présentation de cette version aux invités ayant déjà validé la V1 ; ensuite une seule fois. Navigation Android inchangée. Tester avec `node tests/test_spec_63_portail.js` et sur Android.


### SPEC 77 — Accueil débutant invité compact, hauteur Android standard (20/10/2026)
La ligne de compte SPEC 67 fait dépasser l'accueil « Prêt à commencer ? » sur Android : au lieu de couper le scroll ou de réduire les zones tactiles, `renderAccueil` pose `.ac-nouveau-invite` seulement si `!aDejaPratique() && isCloudEnabled() && !fbAuth.currentUser`. Sous `@media(max-height:810px)`, réduire les espacements de l'accueil et la hauteur de l'accroche, garder carte Commencer ≥108 px et quatre raccourcis ≥60 px. `#view-dashboard` continue de scroller sur les écrans réellement petits ; les utilisateurs connectés/actifs restent inchangés. Test : `node tests/test_accueil_compact.js` ; valider aussi sur Android.


### SPEC 77 — Ajustement séparateur invité (20/10/2026)
Sur la première visite invitée en viewport ≤810 px, le `margin:-6px 0` global de `.ou-choisir` écrasait la séparation « Ou choisir une autre leçon ». Le CSS scoped `#view-dashboard .ac-nouveau-invite .ou-choisir` impose `margin:6px 0 7px; min-height:22px` et récupère 4 px au-dessus de `.ac-compte`. Les quatre accès et leurs cibles ≥60 px restent inchangés. Test : `node tests/test_accueil_compact.js`.


### SPEC 78 — Salut! / Hallo! (20/10/2026)
Si deux salutations ont réellement le même sens dans la consigne (« Salut ! » entre amis, pour dire bonjour), préférer **une entrée principale et une variante explicite** dans le Lexique, et des `ecriture[].alternatives` contextualisées. Leçon 1 : ID 2008 Salut! accepte Hallo!, ID 2009 Salut Pierre! accepte Hallo Pierre!, ID 2010 Salut Jean! accepte Hallo Jean!. Aucun prénom adapté, aucune équivalence globale pour Bonjour/Au revoir ; Salut peut aussi dire au revoir, **Hallo ne doit pas être accepté pour le départ**. Conserver les flashcards et quiz de reconnaissance, les audios LOD existants. Tests : `node tests/test_reponses_alternatives.js && node tests/test_spec75.js`.


### SPEC 79 — Leçon 0 + articles définis (20/10/2026)
Leçon 0 A1.1 en deux unités (neuf graphies avec MP3 LOD officiels, quiz `audioMot` joués manuellement ; UNITEDZOHA avec quatre paires sans/avec N). La leçon 2 unité 2 devient **articles définis de/den/d'**, tous les exercices renouvelés, mission v3. L'ancienne unité 2 est archivée dans `data/archives/`; aucune suppression de résultats : `public/progress.js` sépare `2-definis-v1` de la clé historique `2` (score, Sans faute, rattrapage). Les mots avec `d'` sont collés dans `motATaper` et `motComplet`. `server.js` charge naturellement `lecon-00.json` avant 01 ; ne jamais utiliser `if (!id)` sur id0. Mettre à jour les compteurs/test SPEC75 de 25 à 26. Tests `node tests/test_spec79.js && node tests/test_spec75.js && node tools/valider-lecons.js && bash tools/critique.sh`, puis recette Android.

SPEC 79 : `loadRun()` archive également les reprises d'exercice de l'ancienne unité 2 en `:archive79` lorsqu'un identifiant n'existe plus dans la nouvelle banque de questions. Ne pas réutiliser la queue obsolète.


### SPEC 80 — Audit du premier cours : lisibilité et reconnaissance audio (20/10/2026)

Sur téléphone, garder les noms du parcours très courts : leçon 0 **« Les bases »**, unité 1 **« Prononciation »**, unité 2 **« United Zoha »**. Quand une question utilise un enregistrement LOD pour une reconnaissance orale, les distracteurs doivent être d'autres **mots réels appris**, jamais trois orthographes indiscernables à l'oreille. Conserver les MP3, les IDs et les réponses validées des exercices lors d'une correction de distracteurs. Ne pas généraliser la n-Reegel à tous les N d'un radical ; expliquer les genres luxembourgeois dans les exemples qui ont un genre français différent. Vérifier `tests/test_spec79.js` et `tests/test_spec75.js` ; Android en recette.


### SPEC 81 — Dépannage des sons LOD dans la PWA (20/10/2026)
Si le haut-parleur existe mais indique « Audio indisponible », distinguer la **présence du fichier Git** de son accessibilité sur le déploiement réel. Résoudre depuis `/audio/` (pas une route relative) ; en secours seulement pour `lod/<ID>.mp3`, essayer l'enregistrement du miroir LOD déjà utilisé par le projet. Ne pas confondre une erreur de lecture avec le manque d'audio dans l'index. Journaliser les échecs sans révéler la réponse du quiz ; un seul toast après échec des deux sources. Ne jamais laisser une ancienne erreur déclencher un son après une navigation. Validation : `node tests/test_spec81_audio.js`, puis test Android effectif sur l'app déployée.


### Correctif — Apostrophes typographiques dans l'écriture (20/10/2026)

Bug signalé dans la leçon 3 (couleurs) : l'app rejetait `d’Faarf` et `D’Dier ass wäiss` alors que les réponses attendues étaient `D'Faarf` et `D'Dier ass wäiss.`. Les claviers mobiles peuvent saisir une apostrophe courbe (`’`) au lieu de l'apostrophe droite (`'`). `normalize()` dans `public/app.js` convertit désormais les apostrophes courbes `‘`, `’`, `ʼ` et `＇` en `'` avant de comparer. La casse et la ponctuation de fin de phrase restent ignorées, mais **une apostrophe absente n'est pas acceptée**. Comme `reponseReconnue()` utilise la même normalisation, la correction couvre l'écriture du parcours, les missions, les révisions et l'écriture classique sans modifier les JSON des leçons ni leurs réponses attendues. Régression : `node tests/test_reponses_alternatives.js` ; vérifier aussi sur téléphone la saisie des deux exemples ci-dessus.


### Correctif — Audio « Moien! » inactif sur le portail (20/10/2026)

Sur PC, « Écouter la prononciation » ne faisait rien : `portailEcouter()` appelait `jouerAudio('moien.mp3', bouton)` alors que `sourcesAudio()` refusait tout MP3 placé directement dans `public/audio/` (sans `lod/` ou `mia/`). Le fichier `public/audio/moien.mp3` existe déjà ; l'absence de lecture et de notification était liée à ce rejet silencieux. Autoriser **exactement** `moien.mp3` dans la liste blanche (sans ouvrir l'accès aux autres chemins ni autoriser `../`) ; le lecteur passe à `/audio/moien.mp3` et garde sa gestion d'erreurs habituelle. Conserver l'écoute uniquement sur clic, sans autoplay. Test : `node tests/test_spec81_audio.js` (sources, présence du MP3, lecture simulée du portail, arrêt et chemin absolu), puis vérifier le son dans Chrome sur PC et Android après déploiement de `v2`.

### SPEC 82 — Leçon 0 : écoute, United Zoha et studio radio (20/10/2026)

**Principe :** la leçon 0 prépare l'oreille et la règle du N ; ce n'est pas une leçon de vocabulaire. Aucun exercice de traduction ou dictée obligatoire.

- **Unité 1 « Prononciation » :** une seule activité, 20 quiz de reconnaissance audio LOD (IDs 3201 à 3220), chacun avec quatre vrais mots en luxembourgeois, dont la bonne graphie. Les MP3 se réécoutent sans pénalité. Le cours montre les 20 graphies et les particularités W/J/Z/SCH/ST/CH/Ë/Ä/ÉI, sans exiger leur sens. Pas de flashcards, trous ni écriture.
- **Unité 2 « United Zoha » :** une seule activité, 15 choix à trous (IDs 3301 à 3315) portant sur Gudde/Gudden, e/en et de/den. La consigne indique la lettre suivante et le type d'article avec le genre. Objectif : conserver ou omettre le N final dans les formes concernées, pas deviner le vocabulaire ni le genre.
- **Mission « Le studio radio » :** huit défis interactifs, exactement 3 sons LOD + 3 scripts à vérifier + 2 formes d'articles à compléter. Aucun dialogue à traduire. Trois vies, une seule pénalité par mauvaise réponse, score, étoiles, reprise de navigation et réussite avec au moins une vie conservée. La mission n'utilise jamais de TTS de substitution.
- **Données :** mission.type = studio-radio, mission.version = 2, mission.defis contient huit épreuves avec réponse attendue, choix et explication. Les vingt questions audio et les trois défis de mission utilisent des chemins MP3 LOD directs (audioFichier), afin de proposer le bouton immédiatement même avant le chargement de l'index sonore. La clé scene: [] sert seulement à conserver les contrôles de navigation existants ; ce n'est pas une scène de traduction.
- **Architecture :** public/studio.js est chargé après mission.js. mission.js dirige la mission de leçon 0 vers ce moteur. public/parcours.js annonce « une activité » et archive les parties historiques incompatibles sous :archive82. public/progress.js sépare les scores 0-ecoute-v2 et 0-n-v2 des anciennes unités, sans les écraser. Les identifiants quiz/trous sont nouveaux.
- **Validation :** node tests/test_spec79.js && node tests/test_spec80.js && node tests/test_spec82_studio.js && node tools/valider-lecons.js ; recette PC/Android et bash tools/critique.sh avant publication générale.

**Choix conservé :** en unité, une erreur peut revenir dans le parcours selon le mécanisme existant ; dans la mission radio, ce sont huit défis distincts avec trois vies. Les autres leçons et leurs dialogues ne changent pas.

### SPEC 83 — Découverte guidée avant les exercices de la leçon 0 (20/10/2026)

**Besoin :** l'apprenant ne doit pas découvrir un son ou la règle United Zoha en répondant directement à une question notée. Chaque unité commence par une séquence d'observation libre, au rythme de l'utilisateur, telle que validée dans la maquette.

- **Unité 1 / Prononciation :** 9 cartes de découverte, chacune montre en grand la graphie du son (W, J, Z, SCH, ST, CH, Ë, Ä, ÉI), un mot exemplaire (wäiss, Jo, zéng, Schoul, Stull, Buch, Fënster, Äddi!, schéin) et un bouton pour rejouer le **vrai MP3 LOD local**. Les chemins sont explicitement fournis dans `unites[0].decouverte[].audioFichier`. Aucun vocabulaire à traduire, aucune réponse à saisir.
- **Unité 2 / United Zoha :** 6 cartes d'exemples contrastés, dans cet ordre : Gudde Moien! / Gudden Owend!, e Stull / en Auto, de Bus / den Auto. Le N éventuel et l'initiale suivante sont mis en valeur, ainsi que la raison de sa présence ou de son absence. Les genres servent uniquement à expliquer les articles ; ils ne sont pas à deviner.
- **Interaction :** aucun son automatique, aucun délai de transition, aucune note, aucune vie perdue durant la découverte. « Précédent » revient sur un exemple ; « Continuer » avance uniquement après un appui. Sur la dernière carte, le bouton devient « Passer aux 20 écoutes » ou « Passer aux 15 exercices » et **ce clic lance seulement alors** la vraie activité. Les 20 quiz LOD et les 15 choix N de la SPEC 82 restent inchangés.
- **Intégration :** `public/decouverte.js` gère les cartes, le son via `jouerAudio()` et le démarrage explicite des exercices. `public/index.html` déclare le nouvel écran `view-decouverte`, `public/style.css` le présente dans une mise en page sobre et cohérente avec LuxApp, `public/parcours.js` intercepte le démarrage normal `mode='unite'` de la leçon 0. Les révisions, les raccourcis de types et les parties déjà commencées restent directs, sans redémarrer la découverte. Le cours et la navigation standard restent accessibles.
- **Reprise :** `public/navigation.js` mémorise l'unité et la carte en cours dans la sauvegarde de navigation déjà isolée par profil et par onglet ; après actualisation, l'apprenant retrouve sa carte. L'état de découverte n'est **pas** enregistré comme score ou exercice terminé.
- **Vérification ciblée :** `node tests/test_spec82_studio.js` et contrôle syntaxique. Sur PC/téléphone, vérifier le premier son W, l'écoute répétée, Précédent, le sixième exemple, les deux derniers boutons vers les vrais exercices et le retour/rechargement.

**Périmètre :** exclusivement la leçon 0 ; aucune modification des autres leçons ni des règles de score.

### SPEC 87 — S'entraîner sur mobile : clavier, cadrage et corrections (21/10/2026, branche 2.1)

- **Un seul mécanisme clavier :** `#session-input` passe par `ui.js` (`body.clavier-actif`), comme `#mc-input`, `#pc-ecr-input`, `#ms-input`. Ne jamais rajouter de `scrollIntoView` ou de `padding` en `:focus-within` à côté. Sous `clavier-actif`, geler les enfants du corps (`flex:none`) : `.progress-wrap` porte un `flex:1` historique.
- **Cadrage après réponse :** `cadrerSession(feedback)` mesure la place visible (sous l'en-tête collant, au-dessus du clavier) et défile juste assez pour que Valider/Suivante soit entier, question gardée si tout tient. Appelé par `montrerFeedbackSession()` (écriture, quiz, trous).
- **Titres :** « Juste ! », « Juste, au 2e essai », « Pas encore · réessaie » (zone compacte `.essai`, sans réponse), « Pas encore » + « Bonne réponse : … » (jamais en rouge).
- **Vérification :** `python3 tests/test_spec87_session_mobile.py` (positions réelles, 4 tailles, clavier simulé) — inclus dans `critique.sh`. Clavier Samsung réel à contrôler à la main.
