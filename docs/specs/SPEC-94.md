# SPEC 94 — Correction unifiée, audio/animation et parité des composants

| Champ | Valeur |
|---|---|
| Branche | `2.1` uniquement ; `main` inchangée |
| Statut | **Lot 1 implémenté (Quiz et Trous, Leçon + S'entraîner) — recette Samsung à faire.** Voir « Implémentation » en fin de fiche |
| Priorité | P1 conception / P0 de non-régression pour toute mise en œuvre |
| Référence | Captures utilisateur de l'application « Français sans faute » (inspiration de l'interaction, **pas** de reprise de sa charte graphique) |
| Périmètre | Quiz et Texte à trous, dans **Leçon** (`view-parcours`) et **S'entraîner / Révision / Erreurs** (`view-session`) |
| Hors périmètre immédiat | Écriture, Mot caché, annales et missions : comparer leur feedback sémantique sans modifier leur barème ou leur UX clavier |

## 1. Objectif et décision de principe

Après la validation d'une question à choix, supprimer les **distracteurs qui n'apportent plus rien à l'apprentissage**. Conserver l'énoncé et la réponse pertinente, au lieu de conserver quatre grandes cartes + une carte de correction. Le signal de réussite ou d'erreur doit être immédiat, **visuel et sonore**. Une erreur déclenche une micro-secousse **du choix erroné seulement**, puis une explication utile.

**Règle de parité : deux éléments sémantiquement identiques doivent partager le même code de présentation et les mêmes états.** On réutilise un composant de correction ; on ne fusionne **pas** les moteurs de questions, de calcul ou de progression. Le post-mortem du 21/10/2026 interdit toute refonte transversale non testée.

## 2. États et contrat de rendu (Quiz et Trous)

| État | Choix visibles | Message / action | Audio / mouvement |
|---|---|---|---|
| `idle` | Tous les choix (2–4 selon le vrai JSON), ordre d'origine | Pas de correction ; options actives | Aucun |
| `correct` | **Un seul choix : la réponse juste sélectionnée** | Icône ✓ + « Juste ! », rappel facultatif, **Continuer / Suivante** | Signal positif bref ; accent vert discret |
| `incorrect` | **Deux choix uniquement : celui sélectionné (rouge) et la vraie bonne réponse (verte)** | Icône ✕ + « Pas encore », explication si présente, **Continuer / Suivante** | Signal négatif bref + secousse du choix faux (non du viewport) |
| `restored` | Restituer `correct` / `incorrect` à partir de l'état enregistré | Aucun double feedback, aucun double clic, aucune nouvelle notation | **Ne pas rejouer** sons ni animation lors de la restauration |

**Ordre et identité :** conserver l'ordre relatif du JSON pour les choix visibles (pas de déplacement arbitraire au moment du verdict), leur lettre/identifiant stable et le mapping de la sélection. Les distracteurs sont retirés **du rendu**, pas des données ni de l'historique. Jamais afficher un choix faux comme vert ni une correction correcte comme rouge. Sur un succès, le détail pédagogique peut être minimal ; sur un échec, l'explication est présentée dans une zone lisible **sans doubler le texte de la bonne réponse** si elle figure déjà dans le choix vert.

**Cas à prévoir :** bonne réponse à A/B/C/D ; faute sur A/B/C/D ; deux propositions au lieu de quatre ; valeurs textuelles identiques/variantes ; longue traduction ; aucun commentaire pédagogique ; retours, rafraîchissement, nouvelle question et sessions mixtes. Aucun masquage permanent de l'accessibilité : lecteur d'écran annonce explicitement le verdict, l'option choisie et l'option correcte.

## 3. Correction commune et frontière métier

**Cible d'architecture, pas état actuel :**

- `QuestionChoiceFeedback` : **un seul renderer de présentation** (DOM et CSS partagés) recevant un modèle d'état, utilisable depuis `parcours.js` et `app.js`. Séparer fonctions pures de sélection des choix pertinents et rendu/effets. Pas de deuxième `renderFeedback()` copié-collé dans une autre vue.
- Adaptateur Leçon : produit un modèle `{outcome, selectedId, correctId, choices, explanation, context:'lesson'}`, puis applique les règles déjà existantes de score, deuxième essai, rappels, progression et retour.
- Adaptateur Session : produit **le même modèle** avec `context:'session'`, tout en gardant ses propres règles de score, session, reprise, révision, examen et clavier. Les libellés CTA (`Continuer` / `Suivante`) sont des paramètres, pas des forks HTML/CSS.
- Module d'effets distinct, appelable **une fois par validation utilisateur** : son, animation, annonce accessible. Les effets ne modifient jamais la notation.
- Conserver les mécanismes existants de `showFeedback()`, `handleSessionChoice()`, `choisirP()` tant que les tests de caractérisation (avant/après) ne sont pas prêts. Migration **par moteur et type**, sans big-bang.

**Contrat indicatif** (non implémenté) :

```js
showChoiceOutcome({
  choices, selectedId, correctId, outcome: 'correct' | 'incorrect',
  explanation, actionLabel, context, announce: true, effects: true
});
// Utiliser IDs stables, jamais comparer la réponse sur le seul textContent.
// Les mêmes classes/tokens/DOM doivent être employés dans les deux vues.
```

Les différences justifiées (ex. écriture et saisie au second essai, Mot caché et indices) sont des **variantes documentées** du composant ou un composant distinct si la sémantique diffère. « Identique » concerne le sens et l'interaction, pas toute surface qui se ressemble.

## 4. Comportement sonore et animation

- Deux sons positivement **distinguables** (confirmation et erreur), brefs, discrets, volume modéré, aucune musique, aucun téléchargement réseau indispensable. En prototype : deux notes montantes pour juste, descendantes pour faux. En production : utiliser le mécanisme sonore/muet existant si possible, pas de nouvelle pile audio.
- L'utilisateur peut **désactiver les effets sonores** ; respecter les préférences explicites et le mode silencieux / les restrictions de lecture d'Android. Ne pas rejouer les sons au rerender, sur le retour, lors d'un chargement ni pour deux taps rapprochés.
- Si la voix est désirée à terme : **option distincte** de message vocal court (« Bonne réponse » / « Pas encore »), désactivée par défaut tant que l'interruption des audios LOD et les préférences ne sont pas arbitrées. **Le clic sur Écouter un mot/phrase reste manuel** ; ne pas confondre voix pédagogique et son de validation.
- Erreur : secousse horizontale du **choix faux seulement**, ≤4px, 150–220 ms, **une fois**, sans translation/zoom de la `.view` ni du panneau inférieur. Pas d'effet automatique en restauration.
- `prefers-reduced-motion:reduce` désactive tremblement et mouvements ; l'état reste lisible. Audio non essentiel : aucun verdict porté uniquement par le son, la couleur ou une icône.

## 5. Placement mobile et densité

- Après validation : le nombre de choix passe à **1 ou 2**, ce qui libère de l'espace au lieu de compacter artificiellement quatre grosses cartes. Ne pas réintroduire le compactage des Trous **annulé** par `9d57054`.
- Une seule surface de correction, visuellement identique dans Leçon et S'entraîner (fond, icône, typographie, explication, espacement et CTA) ; un positionnement bas stable si le viewport le permet ; **ni superposition des boutons ni saut de page**.
- Sur hauteur réduite, grand texte ou clavier : zone d'énoncé/correction scrollable, **CTA entièrement visible**, respect des safe areas. Ne pas imposer simultanément un pied fixe massif et quatre choix.
- Employer exclusivement les tokens couleur/espacement de `docs/DESIGN_SYSTEM.md`, l'or restant l'action principale. Cibles ≥44px, CTA ≥48px, focus clavier visible et contraste satisfaisant.

## 6. Invariants pédagogiques et garde-fous

Ne changer **ni** JSON, réponses possibles/alternatives, LOD, traduction, ordre des leçons, score, limites de deux essais, coquilles gratuites, indices, étoiles, répétition des erreurs, historique, Firebase, examens, révision, Survie, ni la transition `Mot caché → Quiz → Trous → Écriture`. Définir la correspondance d'état métier→état visuel pour toutes les exceptions **avant** d'intégrer le composant ; un « juste au 2e » ne devient pas un « juste du premier coup » parce que les options visibles sont identiques.

## 7. Agent de contrôle : parité UI obligatoire

Agent dédié : [`../../.claude/agents/ui-parity-auditor.md`](../../.claude/agents/ui-parity-auditor.md), invoqué **avant chaque fusion ou push touchant une interface partagée**. Il compare le code, les styles calculés, la structure DOM, les états, le parcours et la recette réelle de Leçon / Session. Il n'écrit pas de correctifs automatiques. Son rapport : **PASS / FAIL / NON TESTÉ** par invariant, extraits `fichier:ligne`, mesures DOM, commandes/tests réellement exécutés, anomalies bloquantes et verdict « merge autorisé ou non ». Un PASS statique ne vaut pas validation visuelle Samsung.

**Garde CI futur :** ajouter des tests de parité de contrat (structure de renderer importé partagée, états et tokens), tests DOM et captures Playwright *croisés* pour Quiz/Trous. La présence d'une classe CSS commune seule n'est **pas** une preuve de composant partagé. Conserver les scripts existants de recette ; l'agent ne peut ni les remplacer ni les ignorer.

## 8. Plan de migration séquentiel et validation

1. **Geler une base mesurée** à SHA `2.1` de la PR, documenter les deux moteurs et les tests P0 + SPEC 59/87 ; recueillir les comparatifs Samsung existants.
2. **Prototype autonome** : confirmer visuellement les trois états, le son (y compris muting), secousse, ordre des réponses et accès CTA.
3. Implémenter les primitives de présentation sans toucher à l'algorithme de progression, puis migrer **Quiz Leçon seulement**, mesurer, tester et vérifier Samsung.
4. Migrer **Quiz Session** via les **mêmes** primitives ; comparer états et effets sans dupliquer les rendus.
5. Répéter **Trous Leçon**, puis **Trous Session**, en testant cas à quatre choix et feedback long. Pour Écriture / Mot caché, appliquer uniquement la signature visuelle compatible avec leurs états spécifiques et attendre un arbitrage explicite sur le reste.
6. Avant chaque lot : `bash tools/critique.sh rapide`, `bash tools/critique.sh`, tests DOM/captures 320/360/390/430/720px, hauteurs réduites, zoom texte 130/200%, clavier Samsung, retour Android, audio activé/désactivé, préférence sans mouvement, et contrôle de l'agent.
7. **Critère de fusion** : aucune régression du score ni du clavier, aucune duplication sémantique sans justification, tout état incorrect montre uniquement le choix erroné et le bon choix, action pleinement cliquable ; CI verte ET validation visuelle sur Samsung ou état clairement « non validé ».

**Si l'un des lots échoue : arrêter, diagnostiquer, et annuler le lot concerné**, pas de nouveau correctif CSS au hasard. Le mockup et les règles sont **une cible, pas du code produit déjà livré**.

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
