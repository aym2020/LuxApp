# PLAYBOOK — LuxembourgishApp

Mémo des méthodes et techniques pour résoudre les problèmes récurrents du projet.
But : arrêter de re-réfléchir à des trucs déjà résolus.

---

## 0. Contexte projet (rappel rapide)

- **Repo** : `aym2020/LuxembourgishApp` (GitHub), déployé sur **Render**.
- **Stack** : frontend vanilla JS/HTML/CSS, backend Node.js/Express.
- **Contenu des leçons** : `data/lecons/<niveau>/lecon-NN.json` (ex : `data/lecons/A1.2/lecon-20.json`).
- **Fichiers front clés** : `public/index.html`, `public/app.js`, `public/style.css`, `public/progress.js`, `public/cloud.js`.
- **Niveaux** : A1.1 (leçons 1 à 19) et A1.2 (à partir de la leçon 20), public francophone débutant.
- **Langue de travail** : français.

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
- **Eifeler Regel** : gère la liaison `an` vs `a`.
  - Cas spécial : utiliser `a` devant un mot commençant par `n` pour éviter le double-n.
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
- Pas de correction pendant le sujet. À la fin : score, score par section, correction
  complète ou « Mes erreurs » seulement, avec la `note` en français de chaque réponse.
- Meilleur score par sujet : `luxExamens:<profil>` dans localStorage (local, pas de cloud).
- L'ancien examen (50 questions aléatoires) reste accessible en bas de la liste des sujets.
- Vérifier un sujet : chaque `reponse` est dans ses `choix` (ou dans la `banque`),
  et les numéros `{n}` du texte vont de 1 au nombre de trous.

---

## 8. Patterns de test (à réutiliser systématiquement)

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

- Coloration flashcards par langue : bleu pour le français (`.face-fr`), or pour le
  luxembourgeois (`.face-lu`).
- Badges de choix lettrés (A/B/C/D) via compteurs CSS.
- Carte question : dégradé unifié + barre d'accent en haut.
- Couleur par leçon : custom property `--lc` posée dans `app.js`.
- Fix débordement tableau mobile : `table-layout:fixed` + conteneur scroll `.cours-table-wrap`.
- **Pas d'emoji sur les boutons d'action.**

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

### Blocs `cours`

```json
{ "type": "vocab",    "titre": "...", "items": [["lu", "fr"]] }
{ "type": "regle",    "titre": "...", "lignes": [...] }   // courtes, précises, applicables
{ "type": "dialogue", "titre": "...", "echanges": [["lu", "fr"]] }
```

---

## 11. Sorties

- Tous les fichiers livrés vont dans **`/mnt/user-data/outputs/`**.

---

## 12. Préférences de communication

- Pas de question à la fin des réponses.
- Solution optimale directement.
- Réponses précises, directes, droit au but.
- Code simple à comprendre pour un junior, pas de pratiques complexes.
