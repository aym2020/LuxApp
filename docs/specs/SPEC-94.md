# SPEC 94 — Corrections unifiées, audio et parité UI

> **Évolution UX impérative — [SPEC 95](SPEC-95.md) (implémentée le 25/10, visuels validés sur Samsung).** La SPEC 95 remplace les règles de **présentation et de placement** des commentaires/corrections et des boutons : **plus de grand bandeau coloré, note légère dans le contenu, pied d'action toujours ancré en bas**, indépendant de la longueur de l'explication. **Toute autre règle métier, son, choix rouge/vert et essai de la SPEC 94 reste valide.** Les sections ci-dessous décrivent l'architecture des lots 1/2 **déjà livrés**, non la cible visuelle finale.

> **Décision produit mise à jour le 25 octobre 2026 — texte normatif pour le codeur.**
> Les maquettes des conversations sont des références de comportement, **pas** une preuve d'implémentation. Ne pas recopier leur CSS, leurs couleurs approximatives ou leur code de démonstration dans l'application.

| Champ | Valeur |
|---|---|
| Dépôt/branche | `aym2020/LuxApp`, **`2.1`** ; ne pas modifier `main` |
| Base consultée | `3c80ef54a3b5d728c8f5dc343fcb857db2170453` |
| État réel | **Présentation de la correction et emplacement des boutons remplacés par [SPEC 95](SPEC-95.md) (implémentée)** ; scores, sons, essais, indices de cette fiche toujours valables. **Lots 1 et 2 (2A–2E) implémentés** : choix dans `public/verdict-choix.js`, bandeau commun `public/feedback-unifie.js` + `.css`, sons `SurvieFx.feedback()` ; **recette Samsung à faire** — voir « Implémentation — lot 2 » en fin de fiche |
| Nouvelle décision | **Bandeau plat à trait supérieur** commun aux parcours, **pas de carte bordée de correction**, et **aucun encadré « Juste ! » redondant** |
| Périmètre lot 2 | Quiz/Trous en Leçon et S'entraîner/Révision/Erreurs, Mot caché en Leçon, Écriture en Leçon et Session |
| Contraintes | Préserver scores, feedback pédagogique, variantes, aides, audio LOD, progression, clavier Android, navigation, cloud et JSON |
| Hors périmètre | Changer le barème, supprimer des explications, refondre Survie, missions ou examen, ajouter une voix de synthèse |
| Sources associées | [Design system](../DESIGN_SYSTEM.md), [charte 2.1](../CHARTE_UI_2.1.md), [SPEC 59](SPEC-59.md), [SPEC 87](SPEC-87.md), [post-mortem](../POSTMORTEM-EXERCICES-2.1-2026-10-21.md) |

## 0. Règles de décision — à lire avant de coder

**D01 — Une réponse porte son propre verdict.** Pour Quiz/Trous, après validation : réussite = **seule la bonne option verte** ; erreur = **option choisie rouge + bonne option verte**. Ces comportements fonctionnent déjà (lot 1) et ne doivent pas être réimplémentés.

**D02 — Ne plus empiler deux surfaces de feedback.** La bonne option ou les lettres vertes constituent déjà le signal principal. **Supprimer visuellement le titre ou la carte « Juste ! » / « Bien joué ! » redondants**, sans supprimer les explications utiles, l'audio pédagogique, la notation ou l'annonce accessible. **Ne pas supprimer le nom du résultat lorsque la réponse juste n'est pas directement visible** (ex. Écriture) : l'accessibilité et la compréhension priment.

**D03 — Remplacer la carte supplémentaire par une séparation.** Lorsque des informations complémentaires sont nécessaires, les présenter dans un **bandeau sans bordure périphérique, à trait supérieur** de la couleur du verdict, fond sombre discret et texte aéré, suivi du **seul CTA principal or**. Respecter les tokens LuxApp, pas les aplats bleus/verts et boutons verts de l'application de référence.

**D04 — Les sons expriment trois événements distincts** : `success`, `retry`, `finalFailure`. *Erreur temporaire* ≠ *échec/relecture de la réponse*. Un indice n'est pas une erreur et ne doit pas jouer le son `retry`.

**D05 — Identité de code.** Leçon et S'entraîner doivent utiliser **le même renderer de contenu du feedback** et **la même API d'effets**, avec des variantes de contexte documentées. Conserver les calculateurs métier distincts.

**D06 — Aucun comportement automatique destructeur.** Jamais auto-passage à la question suivante, pas d'effacement prématuré des lettres correctes, pas de révélation au premier essai faux d'Écriture, pas d'interception de Retour Android ni de désynchronisation de la sauvegarde.

**D07 — Ne jamais reproduire le compactage Trous annulé** au commit `9d57054` (la solution désormais mise en œuvre est le masquage des distracteurs, non des boutons minuscules).

## 1. Inventaire exact de l'implémentation actuelle

| Domaine | Fichier / fonction existante | Rôle et piège |
|---|---|---|
| Quiz/Trous — choix | `public/verdict-choix.js` : `afficherVerdictChoix(conteneur, bonne, choisi, ok)` | **Conserver** : figer A/B/C/D via `data-lettre`, masquer distracteurs, couleurs, micro-secousse ; `jouerSonVerdict(ok)` joue déjà le son |
| Quiz/Trous — Leçon | `public/parcours.js` : `choisirP()` → `showFeedback()` | Pied de page `#pc-feedback` avec titre « Juste ! » ou « Pas encore », texte et `#pc-continuer` |
| Quiz/Trous — Session | `public/app.js` : `handleSessionChoice()` → `#session-feedback`, `ajouterBoutonSuivante()`, `montrerFeedbackSession()` | Feedback actuel en **carte à 4 bordures** et CTA séparé dans le flux ; le cadrage auto est critique (SPEC 87) |
| Écriture — Leçon | `ecrValiderPc()` ; `#pc-ecr-erreur` et `#pc-feedback.essai` | Coquille gratuite, deux essais ; premier faux dans le pied de page sans désactiver le champ |
| Écriture/mot à écrire — Session | `validateSessionInput()` ; `#session-feedback` | Deux essais **hors examen** ; `session.answered`, `recordSessionAnswer()` et variantes ; SPEC 59/87 clavier |
| Mot caché — Leçon | `mcValider()`, `mcVoirReponse()`, `renderCases()`, `mcMajScore()` | Bonnes lettres conservées gratuitement, indices pénalisants, **`ESSAIS_AVANT_REPONSE = 3`** : afficher « Voir la réponse » après 3 erreurs, sans imposer son usage |
| Sons actuels | `public/survie-vfx.js` : `SurvieFx.verdict(ok)`, `SurvieFx.lettre(position)`, `sonActif()`, `basculerSon()` | Web Audio et préférence `luxSurvieSon` déjà existants ; ne pas multiplier les `AudioContext` |
| Styles actuels | `public/exercices-v21.css`, `public/style.css`, `public/design-tokens.css`, `public/components.css` | Deux feedbacks avec DOM/CSS distincts ; attention à l'ordre de la cascade |
| Tests existants | `tests/test_spec94_verdict.py`, `tests/test_spec87_session_mobile.py`, `tests/test_recette_visuelle.py` | Lot 1/écrans vérifiés sur Chromium, **ne prouvent pas** la parité du lot 2 |

**Règle de compatibilité :** l'API `afficherVerdictChoix()` est une dépendance existante. Ne pas la réécrire si la correction du bandeau n'en a pas besoin. Vérifier les conséquences d'un éventuel déplacement du déclenchement `jouerSonVerdict()` pour garantir **un seul son**, et ne pas renuméroter A/B/C/D.

## 2. Contrat graphique final : BANDEAU, jamais CARTE

### 2.1. Structure

- **Énoncé** : inchangé, typographie courante.
- **Choix/cases** : porteurs des couleurs de verdict (vert réussi, rouge choisi faux, jaune indice). Pas de contour rouge/vert supplémentaire autour d'un deuxième conteneur équivalent.
- **Zone `feedback` commune** : surface plate sous le contenu, **uniquement si elle possède une information qui n'est pas déjà évidente**. **Pas de border sur les quatre côtés, pas d'ombre de carte, pas de rayon de carte.** Utiliser `border-top:2px solid var(--couleur-erreur)` pour un échec ; pour une réussite avec aide/score, séparation vert discret ou neutre selon le sens. Arrière-plan sombre nuancé, pas une deuxième tuile.
- **CTA principal** : `Continuer` en Leçon ; `Suivante →` ou `Voir le score →` en Session selon l'état réel ; or `var(--couleur-action)`, largeur disponible, cible ≥48px (56px cible). Une seule action principale.
- Le bandeau **n'est pas un overlay** sur les choix. Le corps et le pied sont dans une disposition flex de hauteur contrôlée ; aucune quatrième option cachée derrière.
- Alignement et paddings harmonisés : corps largeur de lecture existante, padding latéral 16–20px, titre éventuel ~16–18px, texte ~14–16px, espacement vertical 8–12px ; **utiliser les tokens** définis dans le design system, ne pas disperser de valeurs concurrentes.
- Éviter le saut visuel au verdict : seul le contenu utile se contracte ; prévoir une transition courte non indispensable et sans déplacer arbitrairement l'écran.

### 2.2. Visuel par état

| État | Corps visible | Bandeau et CTA | Texte |
|---|---|---|---|
| `idle` | Toutes les options/lettres ; saisie possible | Pas de correction, action initiale existante | Énoncé/consigne |
| `success` choix | **Une bonne option verte** | **Aucune carte ni titre « Juste ! » visuel**. Si pas d'explication utile, uniquement CTA or ; sinon **ligne discrète + note neutre + CTA** | Pas de répétition « Bonne réponse : … » |
| `finalFailure` choix | **Faux rouge + correct vert**, ordre original, lettres A/B/C/D stables | **Ligne rouge**, « Pas encore », explication seulement si présente, CTA or | Pas de répétition de la réponse verte, sauf demande accessibilité ou ambiguïté |
| `retry` Écriture | Champ éditable conservé, aucune réponse attendue révélée | **Ligne rouge**, « Pas encore · réessaie », aide concise, **Réessayer** | Conserver diagnostic exact et réponse saisie si déjà affichée |
| `success` Écriture | Champ/correction écrite visible | Pas de grande carte « Juste ! » ; **garder formulation utile**, variantes acceptées, audio si disponible, CTA | Le succès 2e essai garde son message de rappel |
| `finalFailure` Écriture | Saisie verrouillée, solution visible dans le bandeau | **Ligne rouge**, « Pas encore », réponse attendue + explication + audio + rappel, CTA | L'énoncé ne remplace pas l'attendu |
| `retry` Mot caché | Cases acquises **vertes**, autres lettres modifiables, banque encore active | **Diagnostic compact à trait rouge**, compteur d'essai + « Voir l'aide » ; **pas de Continuer** | Aucune révélation ; score et indices préservés |
| `success` Mot caché | Toutes cases validées vertes | **Pas de « Bien joué ! » redondant** ; conserver mot/traduction, audio LOD, score, indices, note/attention utiles et CTA | `Här = Monsieur` reste utile même quand les cases vertes affichent « Här » |
| `reveal` Mot caché | Cases complétées dont indices en **jaune** | Ligne rouge/neutre selon statut non maîtrisé ; titre « Réponse dévoilée », solution, audio, note et rappel, CTA | **Ce n'est pas un essai faux automatique** |

### 2.3. Explication / « Attention »

- L'explication n'est **jamais supprimée uniquement pour réduire la hauteur**. Si elle reprend mot pour mot l'information montrée dans la réponse verte (ex. « 25 = fënnefanzwanzeg » lorsque les deux figurent déjà sur l'écran), **déduplication visuelle sous validation pédagogique** : conserver dans la donnée mais ne pas ajouter de carte répétitive. Si règle grammaticale utile, l'afficher en texte neutre dans le bandeau, éventuellement précédé de « À retenir » ; pas d'encadré brun dans un autre encadré rouge.
- La réponse correcte peut figurer à plusieurs endroits ayant une fonction différente (trou complété + option verte), **mais le bandeau ne doit pas en créer une troisième copie**. Les textes nécessaires à Écriture et Mot caché sont des exceptions explicites.
- Long texte : permettre défilement du détail si nécessaire, sans tronquer ni cacher l'audio ou l'action principale. Pas de `line-clamp` qui fait perdre une règle.
- Échappement des données pédagogiques inchangé : utiliser `escHtml()` / `textContent` selon les cas, ne jamais injecter un champ JSON brut avec `innerHTML`.

## 3. Contrat de transition des essais (normatif)

### 3.1. Quiz/Trous Leçon et Session

1. L'utilisateur choisit une réponse. Guard contre double tap `pAttente` / `session.answered` inchangé.
2. Le **moteur actuel** compte le résultat **une fois** ; ne pas refaire le score dans un renderer.
3. `afficherVerdictChoix()` conserve la/les options visibles (1 juste, 2 faux), les lettres et la secousse existante.
4. La **vue commune** affiche éventuellement explication + CTA en bandeau plat ; pas de boîte « Juste ! ». Sur erreur, titre « Pas encore » + aide si utile.
5. Émettre **un** événement sonore : `success` ou `finalFailure` (une seule réponse autorisée pour **cette occurrence**, même si l'item reviendra en rattrapage).
6. Attendre **l'appui explicite** sur Continuer/Suivante. Les règles de rappel et de progression restent celles du moteur.

### 3.2. Écriture — Leçon

| Action métier | Effet visuel/sonore | Suite |
|---|---|---|
| Soumission vide | Aucun verdict, aucun son, aucune notation | Champ disponible |
| Coquille gratuite autorisée par `analyserReponse()` | Aide **neutre**, pas de son d'erreur ni faux échec ; garder la saisie | Corriger gratuitement |
| Réussite au 1er | `success` ; champ correct, réponse accessible, audio LOD manuel ; pas de carte verte redondante | `reussir` actuel |
| Premier vrai faux | `retry` ; trait rouge, message « Pas encore · réessaie », aide **sans réponse attendue**, champ modifiable, CTA Réessayer | Erreur comptée 1 fois, `ecrEssais = 1` |
| Réussite au 2e | `success` **son positif**, texte sémantique « au 2e essai » conservé et rappel visible | `echouer` métier/rattrapage **inchangé** : ne pas créer une réussite définitive |
| Deuxième faux | `finalFailure` ; trait rouge, réponse attendue, audio, attention, rappel, Continuer | Pas de 3e essai |

### 3.3. Mot caché / Lettres mélangées — Leçon

| Transition réelle | Affichage/son | Ce qui reste inchangé |
|---|---|---|
| Lettre tapée sans validation | Feedback léger des lettres si déjà existant ; **pas de son de verdict** | Banque, cases, accents gratuits, niveau de score |
| Validation correcte du mot (0, 1, 2, 3+ erreurs, indices éventuels) | Cases justes vertes, `success` **une fois** ; pas de « Bien joué ! » en carte ; conserver mot/français, audio, score et note | `enregistrer(card, mcScore(), ok, ...)`, où `ok` métier peut être **false** après indices ou erreurs ; ne pas convertir cela en score parfait |
| Validation incorrecte, essais 1 ou 2 | `retry` à **chaque validation fausse distincte** ; micro-secousse ≤4px des cases **incorrectes**, vertes acquises conservées, diagnostic compact « essai N » et aide existante non révélatrice | `mc.essais++` ; pas de suppression du score/indices |
| Validation incorrecte, essai 3 et suivants | **Toujours `retry`**, car continuer reste possible ; afficher « Voir la réponse » en option secondaire | `ESSAIS_AVANT_REPONSE = 3`, sans limite artificielle |
| « Voir la réponse » activé après 3 échecs | `finalFailure` **une fois**, mot dévoilé avec lettres d'indice jaunes, « Réponse dévoilée », audio et rappel ; CTA Continuer | `mc.revele`, `enregistrer(..., 0, false)` et rattrapage |
| Appui sur « Indice » | Son d'indice/lettre si préexistant ; **pas `retry` et pas `finalFailure`** | Coût en points, nombre d'indices |
| Mot déjà corrigé / vue rerendue | Aucune nouvelle secousse ni son de validation | Progrès et choix précédents intacts |

**Important :** ce jeu n'a **pas** « trois vies ». Le 3e mauvais essai rend seulement possible la révélation ; l'utilisateur choisit quand l'utiliser.

### 3.4. S'entraîner / Révision / Erreurs / examens

- Dans `validateSessionInput()`, texte saisi hors examen : deux tentatives ; premier vrai faux → `retry`, deuxième faux → `finalFailure`, réussite au premier/second → `success` (conserver « au 2e essai » dans le texte, si applicable).
- **En mode `session.mode === 'exam'`**, la première réponse fausse est **finale** (pas de `retry`), sans changement de maîtrise des questions ; vérifier les autres comportements spécifiques d'examen avant de mutualiser le composant.
- Mot caché **de session** est une saisie à deux essais, **pas** le jeu de cases/tuiles `mcValider()`. Ne pas lui donner les règles `ESSAIS_AVANT_REPONSE` ni les indices du jeu de Leçon.
- Les examens de passation avec écran spécifique (hors `view-session`) restent hors périmètre de ce lot : ne pas y injecter le composant de force.

## 4. Architecture de code requise : réutiliser sans sur-ingénierie

### 4.1. Rendu partagé

Ajouter **une seule primitive de feedback de contenu** dans un module dédié, par exemple `public/feedback-unifie.js`, exposant une fonction unique de rendu. Le nom définitif peut suivre les conventions du dépôt, mais la signature et les invariants doivent rester stables :

```js
// Contrat de référence — pseudocode, PAS un API déjà disponible.
renderFeedbackCommun({
  host,                         // conteneur propre à la vue
  state: 'success'|'retry'|'finalFailure'|'reveal',
  semanticLabel,                // « au 2e essai », « Réponse dévoilée »...
  explanationHtml,              // HTML produit par les helpers échappés existants
  correctionHtml,               // seulement si la réponse n'est pas déjà visible
  audioHtml,                    // bouton LOD fourni par helper existant
  scoreHtml,                    // Mot caché, lorsque réellement pertinent
  reminderHtml,                 // rattrapage, uniquement quand métier le requiert
  action: { label, id, onClick }, // un seul bouton principal, ou null pour retry MC
  presentation: 'lesson'|'session',
  announceText                  // message accessible sans doublon sonore
});
```

**Règles de contrat :** `state` n'est pas le score ; `semanticLabel` n'est pas déduit de la couleur ; `action` peut être absente (`retry` Mot caché). Le renderer n'enregistre rien, ne déduit aucune bonne réponse depuis `textContent`, n'appelle pas `enregistrer()`/`recordSessionAnswer()` et **ne joue pas de son dans une fonction de rendu**. Il produit une région de statut accessible et un markup/jeu de classes communs `feedback-flat` (pas deux strings HTML copiées). Si `host` diffère entre Leçon et Session, **ne dupliquer que l'adaptateur de placement**, pas le composant visuel.

Mettre le style partagé dans `public/components.css` ou un fichier CSS dédié **chargé dans les deux vues** ; tokens dans `public/design-tokens.css`. Ne pas conserver des variantes `#view-session … {carte}` et `#view-parcours … {bandeau}` concurrentes. Nettoyer les anciennes règles supplantées après vérification de cascade : `public/style.css` et `public/exercices-v21.css`.

### 4.2. Effets partagés — API événementielle

Réutiliser **`public/survie-vfx.js` et la préférence sonore existante** (aujourd'hui le son vient de `SurvieFx.verdict(ok)`). Faire évoluer l'API de manière rétrocompatible, par exemple `SurvieFx.feedback(kind)` où `kind` est `'success' | 'retry' | 'finalFailure'`. Garder `verdict(ok)` comme délégué rétrocompatible si d'autres appels en dépendent. **Pas de nouveau lecteur audio ni `AudioContext` dupliqué.**

| Événement | Profil auditif cible (indicatif, pas fréquences obligatoires) | Durée cible | Mouvement |
|---|---|---|---|
| `success` | 2–3 notes douces **montantes**, lumineuses | 150–300ms | micro-éclat léger sur bonne option ou cases validées, pas sur tout l'écran |
| `retry` | 2 notes douces **descendantes**, différentes de la finale | 120–240ms | secousse horizontale des lettres/choix **incorrects uniquement** |
| `finalFailure` | 2–3 notes plus **graves**, non agressives et distinctes du retry | 180–350ms | aucun tremblement d'écran ; révélation lisible de la correction |

Régler les niveaux bas : ne pas interrompre la prononciation LOD en cours, ne pas créer de son si le contexte Audio est bloqué, ne pas stocker plusieurs préférences incompatibles. **Ajustement sonore du 25/10/2026 :** seuls les sons de verdict des exercices (`success`, `retry`, `finalFailure`) ont une amplitude accrue de **18 %** via `GAIN_VERDICT_EXERCICE = 1.18` dans `public/survie-vfx.js` (environ +1,4 dB) ; notes Survie, sons des lettres et fichiers de prononciation LOD restent inchangés. Test de non-régression dédié dans `test/survie-vfx.test.cjs`. **Le mode silencieux sonnerie Android ne coupe pas nécessairement Web Audio** : se fier au réglage explicite de l'app et au volume média ; ne pas promettre sa prise en charge native.

**Garantie une seule fois :** émission d'événement dans la transition métier validée, **jamais** dans le renderer DOM. Empêcher 2e son sur double tap, `rerender`, navigation Retour, réouverture d'un panneau, audio LOD, replay de la correction ou ajout d'une explication. Le passage `retry → success` produit bien deux sons différents si l'utilisateur fait deux tentatives réelles.

**Accessibilité :** `prefers-reduced-motion: reduce` désactive secousse/éclat. Couleurs accompagnées d'un message accessible (`role=status`, `aria-live=polite`), sans forcer l'annonce du titre en gros vert visible. Il faut pouvoir couper **tous** les sons de feedback avec le même réglage utilisateur ; prévoir une entrée « Sons des exercices » visible dans Plus/Réglages, réutilisant la préférence existante, à livrer comme sous-lot explicite.

### 4.3. Compatibilité des fonctions existantes

- `public/verdict-choix.js` : ne pas casser le nombre de choix visibles, `data-lettre` ni la secousse. Si le son migre dans l'adaptateur, **retirer ou déléguer** `jouerSonVerdict()` sans doublement. Mesurer le nombre d'appels audio.
- `showFeedback()` : préserver `pAttente`, `pSuite`, `etatExercice('corrige')`, `focusApresClavier()` et le passage `continuerParcours()`. Seule sa construction DOM et son habillage doivent changer.
- `handleSessionChoice()`, `ajouterBoutonSuivante()`, `montrerFeedbackSession()` : préserver `session.answered`, `recordSessionAnswer()`, les libellés et `cadrerSession()` ; la nouvelle structure de bandeau ne doit pas régresser le positionnement du CTA.
- `ecrValiderPc()` : ne **jamais** appeler `showFeedback()` lors du premier faux, car cette fonction verrouille le parcours. Préserver `#pc-ecr-valider` et l'édition du même champ.
- `mcValider()` : pas de suppression des bonnes cases/indices/score ; mettre seulement le diagnostic de faute au style « trait rouge » au lieu d'une grande carte et supprimer le grand titre positif redondant, tout en gardant le statut accessible.
- `mcVoirReponse()` : conserver la règle de révélation volontaire et le score 0 qui lui est propre.

## 5. Comportements mobile, scroll, focus

**Interdiction d'appliquer aveuglément `position:fixed; bottom:0` à un feedback.** C'est la source de plusieurs régressions précédentes. Le composant **a un DOM identique**, mais une enveloppe de placement compatible avec chaque écran.

- **Leçon** : bandeau plat de bas d'écran via une disposition flex/scroll du contenu (en continuité avec `#pc-feedback`). CTA stable avec les safe areas ; la zone supérieure peut défiler.
- **Session** : respecter `montrerFeedbackSession()` et le recalage `cadrerSession()` des SPEC 59/87. Si on utilise un pied stable, prouver que la dernière option visible, l'explication et « Suivante » ne se recouvrent jamais. Pas de deuxième carte « sous le choix ».
- **Écriture avec clavier ouvert** : fermer le clavier après validation comme aujourd'hui et cadrer feedback + champ restant éditable au premier essai faux. Lorsque l'utilisateur rouvre le clavier, conserver Réessayer accessible ; le changement de hauteur du VisualViewport ne doit pas provoquer de saut hors de l'origine ni verrouiller la saisie.
- **Taille** : vérifications réelles à 320×640, 360×740, 390×844, 430×900 et 720px de large ; ajouter un cas de hauteur réduite, des phrases longues, zoom texte 130/200%, safe-area bas, Android Retour, orientation, onglet mis en arrière-plan. Pas de scroll horizontal.
- **Géométrie** : bouton principal entièrement contenu dans le viewport ou accessible par **un défilement cohérent** sans être recouvert. Cibles choix ≥44×44px ; CTA ≥48px, cible 56px ; aucun `pointer-events` invisible au-dessus des boutons.
- **Animation** : ne pas supprimer l'énoncé ni les caractères/espaces lexicalement significatifs ; éviter les reflows brusques et `scrollIntoView()` agressifs. Aucun déplacement de 4 choix requis après validation : le lot 1 n'en laisse déjà qu'un ou deux.

## 6. Accessibilité / UX rédactionnelle

- **Ne pas dépendre du vert/rouge ou du son seul**. Utiliser les lettres figées, une coche/une croix dans les options si c'est un contrôle accessible, des textes pertinents et `aria-live`. Masquer les distracteurs avec `hidden` également pour clavier/lecteur d'écran ; ne pas cacher un bouton encore actionnable.
- **Cas de réussite sans bandeau** : statut accessible (ex. `<span class="sr-only" role="status">Bonne réponse, …</span>`), et focus logique sur le CTA **sans auto-navigation**. Si un lecteur d'écran doit distinguer succès au deuxième essai/maîtrise imparfaite, l'annoncer explicitement.
- **Cas d'erreur** : annonce « Pas encore. Ton choix … ; bonne réponse … » pour Quiz/Trous même si la réponse n'est pas répété visuellement. L'explication est lue séparément, sans boucle d'annonces ni son automatique répété.
- **Mot caché / Écriture** : garder les libellés qui indiquent une distinction de maîtrise (essai N, réussite au deuxième, réponse dévoilée) ; on supprime seulement la décoration superflue, pas le sens.
- **Bouton écouter LOD** : élément interactif distinct, disponible selon la disponibilité audio réelle ; le verdict sonore ne le remplace pas.
- **État sans explication** : ne jamais inventer un texte pédagogique. La zone correction peut se limiter au titre et au CTA (faux), ou au seul CTA (juste).

## 7. Règle d'harmonisation : responsabilités et agent

**Contrat de parité obligatoire :** deux éléments avec le même rôle, état et interaction partagent **une source de vérité HTML, CSS et API sonore**. Les adaptateurs pédagogiques peuvent différer. Les exceptions doivent préciser `pourquoi`, `où` et `quel test` les couvre.

L'agent [`ui-parity-auditor`](../../.claude/agents/ui-parity-auditor.md) doit contrôler avant fusion :

1. source unique de `feedback-flat` et absence d'une variante carte résiduelle en Session ;
2. absence de « Juste ! »/« Bien joué ! » en grande carte lorsque le choix ou le mot correct est déjà vert et suffisant ;
3. conservation des explications et de l'audio LOD utiles ;
4. `success/retry/finalFailure` issus d'une **seule API sonore** et joués une fois par action ;
5. inaccessibilité des distracteurs masqués, couleurs/lettres cohérentes et préservation des handlers de progression ;
6. essais, indices, révélation, coquille gratuite et examen conservés ;
7. géométrie Android pour le feedback et le CTA, audio/motion/contraste/focus ;
8. **preuve de parité DOM et styles** Leçon/Session, pas simple équivalence visuelle sur capture.

Rapport agent : `PASS | FAIL | NON TESTÉ` par invariant, fichiers/lignes, test exécuté et captures, blocage éventuel, SHA et recommandation explicite de fusion. Ne pas cocher « PASS Samsung » sur la base d'un test Playwright.

## 8. Plan de livraison contrôlé (pas de big-bang)

| Lot | Travail | Contrat de sortie |
|---|---|---|
| **0 — Photo avant** | Rejouer les états existants sur SHA de base, mesurer la position des CTA et sauver les captures navigateur | Baseline + liste des problèmes préexistants |
| **2A — QCM** | Feedback plat commun Quiz/Trous **Leçon et Session**, suppression titres positifs redondants, mise en forme « aide utile » | 1/2 choix, son unique, rendu et CTA identiques à sens égal |
| **2B — Mot caché** | Diagnostic d'essai provisoire léger, suppression « Bien joué ! » décoratif, sons success/retry/finalFailure, aide dialog et score inchangés | MC-01…MC-08 inchangés côté métier ; 3 erreurs ≠ fin |
| **2C — Écriture** | Harmoniser visuel positif/erreur/2e essai, sons communs, conserver champ et Variantes | E-01…E-05, coquille gratuite, clavier Android |
| **2D — Session texte** | Même feedback visuel/sonore sur `validateSessionInput()` ; traiter les deux essais et cas `exam` distinct | SPEC 59/87 non régressées, maîtrise historique identique |
| **2E — Préférences** | Bouton Sons visible dans Plus ou Réglages, sans seconde clé locale | Son OFF persistant, compatible Survie |
| **3 — Audit transversal** | Agent + corrections isolées ; mise à jour registre/charte et statut | Parité réelle prouvée, captures Samsung de chaque état |

**Ne jamais fusionner plusieurs lots si un seul état critique reste cassé.** Pour chaque lot de code : test Node ciblé, **`bash tools/critique.sh rapide` ET `bash tools/critique.sh`**, tests navigateur d'états/position, mesure et audit de l'agent ; sur Samsung, au minimum juste/faux/réessayer/échec final/clavier si pertinent. S'il existe des échecs de référence, les mesurer **sur la même base sans patch** et établir l'absence de nouveaux échecs, ne pas les masquer.

## 9. Critères d'acceptation testables — à implémenter comme assertions

| ID | Entrée | Attendu à vérifier dans le DOM **et visuellement** |
|---|---|---|
| A01 | Quiz/Trous juste, Leçon + Session | **1** option visible et verte ; **0** titre/card visible « Juste ! » ; son `success` une fois ; CTA présent |
| A02 | Quiz/Trous faux, Leçon + Session | **2** options visibles (faux rouge + bon vert), lettres d'origine inchangées, micro-secousse du faux ; **0** carte à quatre bordures, ligne rouge présente |
| A03 | QCM faux avec aide | Explication utile présente et lisible ; pas de troisième répétition « Bonne réponse » ; CTA visible |
| A04 | QCM faux sans aide | « Pas encore » et CTA uniquement ; **aucun paragraphe pédagogique inventé** |
| A05 | Option A/B/C/D, double tap | Choix et correspondance identiques avant/après ; 1 notation, 1 son, 1 CTA |
| A06 | Mot caché essai faux 1, 2, 3, 4 | Son `retry` à chaque **nouvelle validation** ; bonnes lettres conservées ; révélation facultative dès la 3e ; aucune solution automatique |
| A07 | Mot caché juste après indice ou erreur | Son `success` ; cases vertes, mot+traduction+audio+score préservés ; score non artificiellement 100 % |
| A08 | Mot caché « Voir la réponse » | Son `finalFailure`, lettres révélées et aide, `mc.revele=true`, score original, CTA |
| A09 | Écriture 1er faux | Bandeau plat, son `retry` ; même champ editable, aide sans solution et possibilité de 2e essai |
| A10 | Écriture 2e juste | Son `success`, mais état pédagogique « à revoir » et rappel conservés ; aucune carte « Juste ! » |
| A11 | Écriture 2e faux | Son `finalFailure`, solution et audio LOD manuels, répétition/score inchangés |
| A12 | Coquille gratuite | Diagnostic neutre, **0** son d'échec, **0** nouvelle erreur comptée |
| A13 | Session examen | Aucune seconde chance si mode `exam`, son `finalFailure` dès une faute, progression de maîtrise non modifiée |
| A14 | Deux contextes | Même classes, noeuds et tokens du feedback ; seuls placement, libellé du CTA et détails métier changent |
| A15 | Mobile et zoom | 320–430px, faible hauteur, texte 200 %, clavier : aucun CTA coupé/masqué, pas de défilement horizontal |
| A16 | Son OFF, réduction animations, navigation Retour | Aucun son si OFF ; aucune secousse si réduction ; pas de son au rerender/retour ; aucune perte de réponse |
| A17 | Anciennes fonctionnalités | JSON, variantes, séquences, progression, sauvegarde, note d'attention, lecture LOD et cas de rattrapage inchangés |

**Nouveaux tests recommandés** (noms indicatifs ; ne pas les annoncer comme existants) : `tests/test_spec94_feedback_shared.py` (Leçon/Session, géométrie et DOM), `tests/test_spec94_sound_events.py` (événements et non-duplication), `tests/test_spec94_motcache_stages.py` (essais 1–4, score et révélation), `tests/test_spec94_ecriture_keyboard.py` (clavier et deux essais), plus tests Node de modules pour les API pures. Réutiliser `tests/test_spec94_verdict.py` pour le lot 1.

**Le mockup ne garantit pas la qualité réelle du son sur Samsung** : écouter les 3 sons en conditions normales et avec le son coupé, contrôler le volume média, et vérifier les animations réduites.

## 10. Critère de livraison

**Implémentation acceptable seulement si** : code partagé réellement unique, 17 invariants ci-dessus couverts par tests ou documentés comme hors lot, moteur pédagogique inchangé, checks CI verts, mesures visuelles réelles par état et **validation Samsung** avant de qualifier l'UI de « validée ».

**Documentation seule** : la révision présente décrit la **cible décidée**, ne modifie aucun moteur, ne prouve aucune recette et ne change pas les scores.

---

## Implémentation — lot 1 (25/10/2026)

**Statut : implémenté — recette Samsung à faire.** Branche `2.1`, à partir de `9aaeb11`.

### Écarts assumés par rapport à la conception ci-dessus

- **Pas d'architecture `QuestionChoiceFeedback` + adaptateurs + module d'effets.** Le besoin tient dans une seule fonction partagée, lisible par un junior : `afficherVerdictChoix(conteneur, bonne, choisi, ok)` dans `public/verdict-choix.js`, appelée par `choisirP()` (Leçon) et `handleSessionChoice()` (S'entraîner, Révision, Erreurs). Les deux moteurs gardent leur score, leurs rappels et leur progression.
- **État `restored` retiré.** Aucun des deux moteurs ne restaure une question déjà répondue : le verdict ne vit qu'en mémoire. Il n'y a rien à restaurer.
- **Mode silencieux Android : non applicable.** Le Web Audio suit le volume média, pas le mode sonnerie. Le seul levier est le réglage Son de l'app.
- **Bandeaux de correction non unifiés.** `showFeedback()` (Leçon) et `#session-feedback` (S'entraîner) restent distincts : les fusionner touche au cadrage SPEC 59/87. Lot 2 éventuel, seulement si le lot 1 est validé sur Samsung.

### Comportement livré

- Juste : seule la bonne réponse reste visible (verte). Faux : le choix fait (rouge, secousse 4 px, 0,2 s, une fois) et la bonne réponse (verte). Les autres propositions sont masquées (`hidden`), jamais retirées des données.
- **Lettres figées** : avant le masquage, chaque bouton reçoit `data-lettre` (A, B, C, D). Sans cela, le compteur CSS `counter(choice)` renumérotait la bonne réponse « C » en « B ».
- Son : `SurvieFx.verdict(ok)`, deux notes douces montantes (juste) ou descendantes (faux), avec le réglage Son déjà utilisé par Survie et le Mot caché (`luxSurvieSon`). Un seul son par réponse ; un second appui est ignoré par les gardes existantes (`pAttente`, `session.answered`).
- `prefers-reduced-motion: reduce` : aucune secousse ; le verdict reste lisible (couleur, lettre, titre « Juste ! » / « Pas encore », bonne réponse écrite).
- Non modifiés : notation, essais, rappels, JSON, Écriture, Mot caché, examens, missions, anciennes vues v1 (`#quiz-choices`, `#trou-choices`).

### Fichiers

`public/verdict-choix.js` (nouveau), `public/parcours.js`, `public/app.js`, `public/survie-vfx.js` (`verdict`), `public/style.css`, `public/index.html` (chargement + versions d'assets), `tests/test_spec94_verdict.py` (nouveau), `tools/critique.sh`.

### Tests

- **Nouveau, navigateur (vrai DOM)** : `tests/test_spec94_verdict.py`, ajouté à `tools/critique.sh`. S'entraîner (Trous leçon 5 + un Quiz à 4 propositions, juste et faux), Leçon (vrai parcours leçon 2 : Quiz faux, Trou juste), préférence « réduire les animations ». Vérifie : 1 ou 2 propositions visibles, lettres non renumérotées, secousse uniquement sur le choix faux, un seul son, double appui sans effet. **Vert.**
- `test_recette_visuelle` (scénarios 3001 Quiz/Trous juste/faux sur le vrai moteur), `test_acces_recette`, `test_spec87_session_mobile` (cadrage Suivante 320–430 px) : **verts**.
- Comparaison avant (`9aaeb11`) / après, test par test sur les 26 tests navigateur de la suite : **résultats identiques**. Échecs préexistants inchangés, aux mêmes lignes (Mot caché, accueil, chemin : `test_parcours`, `test_rappels`, `test_seance`, `test_retours`, `test_lot1/2/3`, `test_navigation`, etc.). `test_audio_lod.js` échoue déjà sur la base (contenu « Awar! »).
- Contrôle visuel : captures 320 et 390 px, juste et faux.
- **Non testé** : Samsung réel (son, secousse, rendu), clavier Android sans objet ici (pas de saisie).

### Limite connue

Le seul bouton pour couper le son est dans l'écran Survie. Un réglage « Sons » visible dans Plus serait plus clair ; non fait dans ce lot.

## Implémentation — lot 2 (25/10/2026)

**Statut : lots 2A à 2E implémentés — recette Samsung à faire.** Branche `2.1`, à partir de `0562a1a`.

### Ce qui est livré

| Lot | Livré |
|---|---|
| 2A — QCM | Bandeau plat commun Leçon + S'entraîner. Réussite : pas de titre « Juste ! » visible (annoncé au lecteur d'écran), seulement l'aide utile et le CTA ; bandeau `nu` (sans fond ni trait) s'il n'y a rien à dire. Erreur : trait rouge, « Pas encore », aide si présente ; la bonne réponse n'est plus répétée dans le bandeau (elle est verte dans les choix et dans le trou). |
| 2B — Mot caché | `retry` à chaque validation fausse (essais 1, 2, 3, 4…), secousse des seules cases encore à trouver (fenêtre de 250 ms : pas de nouvelle secousse au rendu suivant), diagnostic d'essai en bandeau à trait rouge. Réussite : plus de « Bien joué ! » visible ; mot, traduction, audio, score, note et attention conservés. « Voir la réponse » : `finalFailure`, titre « Réponse dévoilée ». Indice : aucun son de verdict. |
| 2C — Écriture Leçon | 1er faux : `retry`, bandeau plat, même champ modifiable, bouton Réessayer déplacé dans le bandeau. 2e juste : `success` + « Juste, au 2e essai » + rappel. 2e faux : `finalFailure` + « Réponse attendue ». Coquille gratuite : aucun son, aucune erreur comptée. |
| 2D — Saisie S'entraîner | Même bandeau et mêmes sons ; « Réponse attendue » (même libellé qu'en Leçon). Examen (`session.mode === 'exam'`) : pas de 2e essai, `finalFailure` dès la première faute. |
| 2E — Préférences | Ligne « Sons des exercices » (interrupteur) dans Plus. Même clé `luxSurvieSon` que le bouton de Survie : une seule préférence. La prononciation LOD (Écouter) n'est pas concernée. |

### Architecture (simple, lisible par un junior)

- `public/feedback-unifie.js` : `renderFeedbackCommun(host, o)` (un seul rendu : `sr-only` + `fb-titre` + `fb-txt` + bouton `.fb-cta`), `fbAttentionHtml()`, `jouerFeedbackSon(evenement)`. Le rendu ne note rien et ne joue aucun son.
- Bouton principal : **une seule classe** `fb-cta` dans les deux vues (ids de repère `pc-continuer` / `session-suivante`), pression tactile SPEC 57 (`components.css`) incluse. Plus de `pc-btn ok/ko` ni d'`.ecr-next-btn` sur ce bouton.
- Hôte S'entraîner sans la classe de carte `.ecr-feedback` (elle reste réservée aux anciennes vues v1).
- `public/feedback-unifie.css` : seul style du bandeau (`.feedback-flat`, `.ok`, `.ko`, `.nu`, `.essai`, `.fb-*`), couleurs en tokens (`--couleur-correction-*` dans `design-tokens.css`), chargé après `exercices-v21.css`. Les règles `#view-parcours .pc-feedback` et `#view-session #session-feedback` ne gèrent que l'emplacement (position, marges, padding, hauteur de défilement).
- Aide du 1er essai d'Écriture : **une seule fonction** `aideErreurHtml()` (diagnostic.js) en Leçon et en S'entraîner.
- `SurvieFx.feedback(evenement)` dans `public/survie-vfx.js` ; `verdict(ok)` garde son nom (délégué). Pas de nouvel `AudioContext`. `afficherVerdictChoix()` ne joue plus de son : `choisirP()` et `handleSessionChoice()` l'appellent eux-mêmes, au moment de la réponse.
- Les moteurs (`parcours.js`, `app.js`) gardent leur notation : seuls l'appel du son et l'appel du rendu ont changé.
- Notes pédagogiques : même échappement `noteHtml()` dans les deux vues (les données n'utilisent que `<b>`).

### Exceptions documentées (pourquoi · où · quel test)

| Exception | Pourquoi | Où | Test |
|---|---|---|---|
| Écriture en S'entraîner, 1er essai : le bouton reste « Valider » sous le champ (en Leçon, « Réessayer » dans le bandeau) | Disposition clavier Android validée par SPEC 87 ; le champ est vidé pour la 2e saisie (comportement antérieur au lot) | `app.js` `validateSessionInput()` ; `index.html` `#session-input-btn` | `test_spec87_session_mobile.py` (11 scénarios × 4 tailles), `test_spec94_feedback.py` |
| Écriture : titre « Juste ! » / « Juste, au 2e essai » visible | D02 : la réponse n'est pas montrée comme choix vert | `parcours.js` `ecrValiderPc()`, `app.js` `validateSessionInput()` | `test_spec94_feedback.py` (A10) |
| Leçon : rappel « reviendra à la fin de l'étape » dans le bandeau | Détail métier du parcours (rattrapage), absent en S'entraîner | `parcours.js` `rappelHtml()` | `test_rappels.py`, A14 compare les mêmes nœuds hors ce rappel |
| Leçon, Écriture 1er essai : le bouton Réessayer garde aussi `pc-btn primary wide` | C'est le même bouton que Valider, déplacé dans le bandeau (même gestionnaire, Entrée au clavier) ; son style calculé est celui de `.fb-cta` | `parcours.js` `ecrValiderPc()` | `test_recette_visuelle.py` (E-02), A09 |
| Coquille gratuite : fond or neutre, sans trait rouge | Ce n'est pas une erreur (SPEC 24, §3.2) : aucun son, aucune erreur comptée | `exercices-v21.css` `.mc-erreur:not(.coquille)` | A12 |
| Leçon : le bandeau monte (`monte-b`, 0,2 s) ; S'entraîner : non | Emplacement : bandeau collé en bas d'écran contre correction dans le flux (SPEC 59) | `style.css` `.pc-feedback:not(.hidden)` | Désactivé par « réduire les animations » |

### Tests

- Nouveau : `tests/test_spec94_feedback.py` (ajouté à `critique.sh`) — A01–A14, A16, A15 partiel (320×640), 2E.
- Mis à jour pour le nouveau balisage, même intention : `tests/test_spec94_verdict.py`, `tests/test_spec87_session_mobile.py`, `tests/test_rappels.py`, `test/exercices-etats-v21.test.cjs`, `test/exercices-v21.test.cjs`, `test/jeux-v21.test.cjs`.
- Correction d'une régression du lot 1 non vue à l'époque (`test/*.cjs` ne fait pas partie de `critique.sh`) : 3 tests `.cjs` cassés par `afficherVerdictChoix` et les numéros de version. Les `.cjs` d'exercices et de jeux : 52/52. Restent en échec, **déjà avant le lot 1** (`9aaeb11`) : `cours-v21`, `intro-unite-v21`, `menu-taps-v21`.
- `tests/test_recette_visuelle.py` : Plus compte désormais 6 lignes (« Sons des exercices » ; hauteur du bloc 387 px, budget 400 px).
- Audit `ui-parity-auditor` (1er passage sur `f9c697a`) : « ne pas fusionner » — bouton différent entre vues, classe de carte résiduelle sur l'hôte S'entraîner, typographie de l'essai propre à une vue, aide du 1er essai rendue deux fois, test instable (attente au rechargement), couleurs en dur, son dans une fonction d'affichage, catalogue non à jour. **Tous corrigés** ; A14 compare désormais aussi la classe, le padding, la transition, la police et la couleur du bouton, et la couleur de l'hôte. Test stable 3/3.
- **Comparaison avant (`0562a1a`) / après, sur les mêmes 26 tests navigateur de la suite** (serveurs séparés, même machine) : **résultats identiques test par test**, deux fois (avant et après les corrections de l'audit). Les tests en échec sur la base cassent aux mêmes lignes, toutes hors correction (Mot caché `#mc-btn-voir`, accueil, chemin, missions). `test_actualisation` est instable (passe ou échoue selon la charge, des deux côtés). `test_recette_visuelle` et `test_acces_recette` : verts. `test_audio_lod.js` : échec préexistant (contenu « Awar! »).
- 2e audit `ui-parity-auditor` (sur `241f410`) : les 9 corrections PASS, 8 invariants PASS sous Chromium, aucune duplication P1 ; fusion sur `2.1` autorisée sous condition de cette section et de la comparaison ci-dessus ; **UI non validée sans Samsung**.
- Mesuré par l'audit sous Chromium : 320, 360, 390, 430 et 720 px, 390×520, texte racine 200 % (approximation du zoom).
- **Non testé** : Samsung réel (3 sons, son coupé, volume média, secousse, clavier, Retour Android), vrai zoom navigateur 130/200 %, lecture LOD réelle.

### Reste à faire (P2, non bloquant)

- `#e1d1cc` (texte du diagnostic Mot caché compact, `exercices-v21.css`) et 13,5 px (texte de l'essai) ne sont pas des tokens.

## Recette Produit — 25 octobre 2026

Les corrections visuelles Quiz/Trous (juste/faux), Écriture (premier faux/final) et Mot caché (essais et solution) sont approuvées à partir de 10 captures Samsung. Le Produit confirme les sons de verdict audibles et satisfaisants après le gain de +18 % du commit `33786e0`. SPEC 95 gouverne le placement des messages et du CTA. Clavier ouvert, zoom et TalkBack restent à vérifier ; cette validation n'atteste ni les sauvegardes cloud ni les barèmes transverses.
