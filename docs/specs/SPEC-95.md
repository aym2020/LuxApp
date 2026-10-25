# SPEC 95 — Écran d'exercice stable : zone centrale défilante, feedback minimal, CTA ancré

> **Statut : décision UX validée en conception, À IMPLÉMENTER.** Ce document n'est **pas** un correctif livré. Il concerne uniquement `2.1` ; `main` reste intouchée.
> **Priorité P0 ergonomie Android / P1 mutualisation.** Base technique étudiée : commit `956ff3a0a4e8ffe697ed5bde5a31bda69ffe977e`, 25/10/2026.
> **Précédence** : cette SPEC remplace les règles **de placement et d'habillage du feedback/CTA** de SPEC 94 (§0 D03, §2, §4.1, §5, A01–A04 et A14–A15 lorsqu'elles supposent un bandeau/CTA imbriqués). Elle **ne remplace pas** SPEC 94 sur le scoring, le masquage des distracteurs, les 3 sons, la correction en deux essais, les indices, le rappel ni l'API sonore. SPEC 59 et SPEC 87 restent des contraintes de comportement clavier à reproduire par la nouvelle structure — ne pas garder leurs anciens `scrollBy` par dogme.

## 0. Décision : architecture UX immuable

**Trois zones DOM stables, dans cet ordre strict** :

1. **En-tête** : Retour / titre / progression, toujours accessible.
2. **Contenu central, seul défilable** : consigne, question, options, champs, explication/diagnostic éventuel, lecture audio et rappels.
3. **Pied d'action persistant** : **seul emplacement possible des CTA et commandes de validation**. Le bouton principal **reste au même X/Y**, au même format et à la même distance du bas, que l'exercice soit juste, faux, long, court, avec/sans explication, avec/sans audio. Il change éventuellement de libellé et d'action, jamais de conteneur.

**Interdit** : bouton `Continuer`/`Suivante`/`Valider`/`Réessayer` produit sous une explication, injecté dans `#pc-feedback`/`#session-feedback`, déplacé dans une carte colorée, soumis à un `margin-top` variable selon la longueur du texte, ou couvert par le clavier Android. **Aucun énorme bandeau fond vert/rouge, aucune deuxième carte de feedback, aucune ligne horizontale pleine largeur pour séparer tout le pied.** Le pied garde un fond neutre et, au besoin, un filet supérieur **gris très discret**, indépendant du verdict.

Le principe issu des captures : **la réponse montre la réussite/erreur** (vert/rouge) ; le feedback n'est qu'une **note pédagogique locale et légère**. Le son (SPEC 94) s'ajoute, ne remplace jamais une indication sémantique accessible.

## 1. Ce qui ne va pas dans le SHA de référence (preuve de cause)

- `public/feedback-unifie.js:renderFeedbackCommun(host,o)` construit le feedback **puis ajoute `o.action` dans `host`** (`.fb-cta`). Donc le CTA est tantôt dans un panneau coloré, tantôt seul et sans panneau (`feedback-flat.nu`).
- `public/feedback-unifie.css` teinte toute la zone et la délimite par un trait de verdict ; le bouton en devient visuellement une partie. `#session-feedback` est dans `.session-body`, tandis que `#pc-feedback` est frère de `#pc-body` et sticky : leurs géométries ne peuvent pas être vraiment identiques.
- `public/app.js:montrerFeedbackSession/cadrerSession` provoque un `window.scrollBy(...,smooth)` selon la longueur du commentaire et le clavier ; la position du CTA dépend alors du contenu. `#session-input-btn` est un autre bouton dans le formulaire. En Leçon, `#pc-ecr-valider` est même **reparenté dans le feedback** au premier vrai faux.
- Ce comportement explique les captures : « Juste » avec règle = grand panneau vert + CTA intégré ; « juste » sans note = CTA seul au milieu ; « pas encore » sans explication = grand bloc rouge presque vide ; Écriture = feedback au-dessus du champ, bouton sous le champ ; clavier et longs textes = fragment masqué.

**Conclusion technique** : pas de retouche de padding/rayon pour faire semblant. Changer **la propriété structurelle du CTA**. Ne pas revenir au compactage artificiel des quatre choix, annulé précédemment.

## 2. Spécification fonctionnelle par type, état et contenu

### 2.1 Quiz et Trous — Leçon ET S'entraîner/Réviser/Erreurs

| État métier | Zone centrale | Zone de feedback dans le contenu | Pied d'action |
|---|---|---|---|
| Avant choix | Toutes les options existantes, taille tactile inchangée | Aucune correction | **Emplacement réservé, sans faux bouton** si le choix valide immédiatement |
| Réponse correcte sans explication | **Seul le bon choix vert** (`afficherVerdictChoix` actuel), lettre d'origine conservée | **Rien de visible** ; annonce lecteur d'écran hors vue | **Continuer** ou **Suivante →**, toujours tout en bas |
| Réponse correcte avec explication utile | Seul bon choix vert | **« À retenir » discret** + texte pédagogique, sans vert de fond ni « Juste ! » redondant | Même pied, même position |
| Réponse fausse sans explication | Choix erroné rouge + bon vert, lettres A/B/C/D d'origine et ordre d'origine | **Aucune grande zone vide** ; court texte optionnel « Pas encore » seulement s'il apporte une information, mais jamais nouvelle carte | Même pied, même position |
| Réponse fausse avec explication | Faux rouge + correct vert | **Note « À retenir »** et contenu existant, sans troisième répétition du mot correct ; statut accessible « Pas encore… » | Même pied, même position |

Les couleurs ne sont pas un substitut au texte lu par lecteur d'écran : annonce `Juste, …` ou `Pas encore, ton choix…, bonne réponse…` conservée, **sans la dupliquer visuellement**. Les explications du JSON ne sont pas supprimées pour réduire la hauteur ; un texte trivial éventuellement supprimé à l'écran doit rester dans les données et être validé pédagogiquement.

### 2.2 Écriture — Leçon ET Session

| État | Corps scrollable et aide | Pied d'action fixe | Métier/son préservé |
|---|---|---|---|
| Saisie initiale | Question + champ éditable et éventuelle erreur locale de formulaire | **Valider** | Pas de son sur champ vide |
| Coquille gratuite (Leçon) | Aide neutre à proximité du champ, saisie toujours éditable | **Corriger ma saisie** ou libellé actuel préservé | Ni score négatif ni son `retry` |
| Premier vrai faux (hors examen) | Petit indicateur « Pas encore · réessaie » proche du champ + diagnostic **sans solution**, même champ utilisable ; ne pas le cacher derrière le clavier | **Réessayer** ; conserver `ecrValiderPc()` ou `validateSessionInput()` selon contexte | Son `retry`, comptage/état inchangé |
| Juste au premier | Saisie/solution reconnue + variantes + écoute LOD disponibles ; pas de grand panneau vert | **Continuer/Suivante** | `success` ; progression comme avant |
| Juste au second | Réponse visible, mention « au 2e essai » et rappel métier lisibles | **Continuer/Suivante** | Son `success`, **rattrapage conservé en Leçon** |
| Faux définitif (2e, ou 1er si `session.mode==='exam'`) | Texte « Réponse attendue : … » + audio LOD + rappel/attention existants, **sans carte géante rouge** | **Continuer/Suivante** | Son `finalFailure` ; pas de 3e saisie |

Le champ doit rester à sa place : ne plus le déplacer dans le feedback ni dupliquer le bouton. **Même position du pied** au premier et au deuxième essai. Pour la Session, le champ reste vidable/renseignable comme l'ancien code le prévoit ; ne pas forcer une conservation de texte interdite par le moteur.

### 2.3 Mot caché / Lettres mélangées en Leçon

- **Pendant la composition** : cases, banque de lettres, couleurs vert/jaune, score et indices restent dans le **corps**, avec une disposition scrollable même sur petit écran. Ne changer ni normalisation des accents, ni score partiel, ni cases déjà acquises.
- **Pied d'actions de saisie** : une rangée ou deux rangées **dans le même dock** contenant **Effacer** (secondaire), **Indice** (secondaire) et **Valider** (primaire or). Garder ≥44px par cible à 320px ; « Voir la réponse » après 3 erreurs en action secondaire accessible, sans masquer Valider ou la banque.
- **Essai incorrect N** : son `retry` à chaque **nouvelle validation** (même N≥3), secousse seulement des mauvaises cases (reduced-motion respecté), diagnostic compact « Pas encore · essai N » **dans le corps, près des cases** ; jamais de grand bandeau qui pousse les commandes. Le dock reste inchangé.
- **Réussite** : cases vertes, infos utiles (mot = traduction, score, audio, note) dans le corps ; dock remplace les commandes par **Continuer** (même position primaire).
- **« Voir la réponse » volontaire** : son `finalFailure` une fois, cases révélées, note/audio/rappel, dock = **Continuer**. Trois erreurs ne déclenchent **jamais** une révélation automatique.

### 2.4 Écriture/Mot à saisir dans Session, examens et résultats

L'item `motcache` d'une Session **est une saisie textuelle à deux essais**, pas la grille de tuiles de Leçon. Conserver cette distinction. Le mode examen ne propose pas de deuxième tentative ; ne pas changer la maîtrise des réponses enregistrées.

**Hors périmètre structurel strict** : autres écrans d'examen dédiés (`view-examen`), mini-jeu Survie, dialogues de mission, pages de lecture. Ne pas appliquer la nouvelle règle de dock à toutes les `.view` globalement.

## 3. Contrat géométrique responsive / Android

**Shell mobile**, uniquement `#view-parcours.active` et `#view-session.active` :

- Une enveloppe `display:flex; flex-direction:column; height:100dvh; min-height:0; overflow:hidden` ou équivalent calculé avec VisualViewport vérifié. Ne pas empiler plusieurs zones sticky/fixed.
- `header {flex:none}` ; `.exo-scroll {flex:1; min-height:0; overflow-y:auto; overscroll-behavior:contain}` ; `.exo-action-dock {flex:none}`, **dans le flux flex, pas un `position:fixed` recouvrant le corps**.
- Dock centré selon les tokens existants : largeur max **500px** en zone active (charte UI §6 bis), padding latéral correspondant à la zone centrale **16–21px**, `padding-bottom: calc(16px + env(safe-area-inset-bottom))`, bouton largeur 100%, hauteur `var(--hauteur-cta)` (**56px**). Rayon, or et pression tactile hérités des composants actuels.
- L'**axe X**, la largeur et le bord inférieur du CTA doivent être identiques (tolérance géométrique **±2px**) sur tous les résultats à viewport égal ; le dock ne change de hauteur qu'en cas d'action secondaire Mot caché ou clavier visible, **pas** selon la présence d'explication. Le texte d'un bouton peut changer mais pas sa hauteur.
- **Cas QCM sans CTA initial** : une zone neutre réservée de la **même hauteur de dock**, sans faux bouton désactivé ou invisiblement cliquable, évite le saut au premier choix.
- **Défilement** : si l'énoncé, la réponse et une longue aide dépassent l'espace central, seul le corps défile ; la dernière information est accessible par scroll et n'est jamais recouverte par le dock. Le CTA reste entièrement dans le viewport visible. Le contenu du feedback ne doit pas avoir un deuxième scroll nested sauf nécessité démontrée.
- **Clavier Samsung** : à l'ouverture du clavier, hauteur utile fondée sur `window.visualViewport`/viewport réellement redimensionné, sans addition ou soustraction deux fois de la hauteur IME ; le pied doit rester juste au-dessus du clavier, et le textarea visible via **scroll du corps seulement**. À la fermeture, retrouver la même position basse. Éviter `position:fixed` combiné à translations CSS, `window.scrollBy` post-réponse et gestion concurrente `100vh` vs `100dvh`. Recentrer uniquement si nécessaire, pas de sauts. **Ne pas violer SPEC 59/87**.
- **Desktop** : contenu/exercices max **500px** ; shell générique max 640px si applicable à la vue ; dock aligné sur l'axe du formulaire et **ancré au bas de l'enveloppe d'exercice visible**, sans étendre une page de consultation ni créer de large CTA à 1920px. Ne pas modifier accueil/Plus/cours.
- Tester **320×640, 360×740, 390×844, 430×900**, paysage court, **720/1024/1440px**, zoom 130/200%, orientation, safe area et taille réelle Samsung. Le dock ne doit jamais recouvrir la ligne de navigation Android ; les éléments tactiles ≥44px, bouton principal ≥48px.

## 4. DOM cible, frontières et compatibilité

### 4.1. DOM de référence (structure conceptuelle, pas HTML actuellement livré)

```html
<section id="view-parcours" class="view exo-shell">
  <header class="exo-header">... #pc-steps / #pc-etape / #pc-compteur ...</header>
  <div class="exo-scroll">
    <div id="pc-body" class="pc-body">... énoncé, choix, tuiles, input ...</div>
    <div id="pc-feedback" class="exo-feedback" role="status" aria-live="polite"></div>
  </div>
  <div id="pc-action-dock" class="exo-action-dock">
    <!-- Unique action primaire : Valider / Réessayer / Continuer ;
         commandes secondaires MC seulement. -->
  </div>
</section>

<section id="view-session" class="view exo-shell">
  <header class="exo-header">... #session-progress-* ...</header>
  <div class="exo-scroll">
    <div class="session-body">... #session-q / #session-choices /
      #session-feedback / #session-input-wrap ...</div>
  </div>
  <div id="session-action-dock" class="exo-action-dock"></div>
</section>
```

**Important** : garder `#pc-feedback` **en dehors de `#pc-body`**, car `renderItem()` remplace `#pc-body.innerHTML` ; les placer **frères dans `.exo-scroll`**. De même, déplacer les nœuds existants plutôt que cloner les champs/handlers, spécialement `#pc-ecr-valider` et `#session-input-btn`.

### 4.2. Répartition du code — une responsabilité par primitive

| Fichier | Action obligatoire (lot cible) |
|---|---|
| `public/index.html` | Ajouter les deux containers `.exo-scroll` et `.exo-action-dock` dans `view-parcours` et `view-session` ; maintenir les IDs DOM existants. Adapter les positions du retour et de la progression sans casser `setProgress()`. |
| `public/feedback-unifie.js` | **Ne générer que la présentation accessible** (message, explication, aide, audio). **Retirer la création et `appendChild` de `o.action` dans `host` pour les deux vues migrées** ; supprimer l'ancien couplage. Prévoir compatibilité explicitement vérifiée des autres appelants. |
| Nouvelle primitive légère `renderActionExercice(dock, config)` (dans module réutilisé du dépôt, sans framework) | Reçoit `{label, id, onClick, disabled, secondaryActions?}` ; crée/met à jour **une seule action primaire** ; autorise groupe secondaire uniquement Mot caché. Ne note rien, ne change pas le métier, et conserve focus/handlers. `config` absente ⇒ réservation d'espace non interactive. Ne pas créer de double ID ni capturer un ancien `onClick` sur une question suivante. |
| `public/parcours.js` | `showFeedback()` : remplir correction dans corps, puis action dans `#pc-action-dock`. `ecrValiderPc()` : maintenir le **même** bouton de validation sur tous les essais mais dans dock ; `mcValider()`, `mcVoirReponse()` : seule configuration de commandes du dock change avec l'état ; `renderItem()` : vider/réinitialiser correction + dock. Conserver `pAttente`, `pSuite`, `etatExercice()`, `continuerParcours()`, `focusApresClavier()`. |
| `public/app.js` | `renderSessionQ()` réinitialise le dock ; `handleSessionChoice()` et `validateSessionInput()` rendent feedback puis configurent `#session-action-dock` ; `actionSuivante()` conserve libellé/handler ; `nextSessionQ()` ne laisse aucun CTA fantôme ; `showSessionResult()` masque le dock (résultat utilise ses commandes). Refondre `montrerFeedbackSession()/cadrerSession()` pour **scroller le conteneur interne**, pas le document entier. |
| `public/feedback-unifie.css` | Conserver tokens et styles de détail `.fb-*` ; remplacer les blocs `.feedback-flat` colorés de largeur pleine par **texte local minimal** + léger filet vertical éventuel ; **supprimer .fb-cta comme descendant obligatoire de feedback**. |
| `public/exercices-v21.css`, `public/style.css` | Porter le shell/scroll/dock, éliminer les anciens `position:sticky` et paddings de feedback devenus inutiles ; ne pas cumuler plusieurs implémentations de placement pour un même composant. Conserver la grille tactile et les styles de saisie. |
| `public/components.css` / `public/design-tokens.css` | **Un seul style de dock et de bouton primaire** réutilisé ; réutiliser `--hauteur-cta`, `--couleur-action`, `--sp-*`. Ajouter un token seulement s'il manque, documenté dans DESIGN_SYSTEM ; ne pas recoder des or/verts/rouges en dur. |
| `public/survie-vfx.js`, `public/verdict-choix.js`, `public/diagnostic.js` | **Pas de modification logique prévue** : préserver les 3 sons, la secousse, les réponses 1/2 choix et les textes échappés. Modifier uniquement si test de parité prouve nécessaire, sans double son ni nouvelle pile audio. |

### 4.3. API cible et propriété des CTA

```js
// Pseudocode contractuel, non implémenté au SHA de base.
renderFeedbackCommun(host, { etat, titre, annonce, corpsHtml }); // AUCUN CTA.
renderActionExercice(dock, {
  id: 'session-suivante', label: 'Suivante →', onClick: nextSessionQ,
  disabled: false, secondaryActions: []
});

// Un objet de config à état immuable est possible, mais NE PAS
// introduire un store, un framework ou une couche abstraite inutile.
```

Règle impérative : **pas de bouton contenu dans `feedback` ; aucun bouton principal dans la zone scrollable après migration**. **Même noeud existant** à conserver pour le bouton `#pc-ecr-valider` afin que clavier/Enter réutilisent `ecrValiderPc()`. Le dock de Session peut employer un bouton persistant ou remplacer son contenu si ses handlers sont réattachés proprement, mais **jamais deux actions au même ID**. Un bouton que l'on masque par `display:none` ne doit plus garder de focus ni d'accessibilité involontaire. `disabled` doit refléter l'état métier réel.

Le composant de feedback ne déclenche **ni score, ni son, ni navigation**, même en cas de rerender. Toute note vient des helpers existants échappés (`escHtml`, `aideErreurHtml`, `fbAttentionHtml`, etc.).

## 5. Arbre des états du pied — machine de placement

| Mode | À l'entrée | Sur erreur provisoire | Après correction finale |
|---|---|---|---|
| Quiz / Trous | Dock réservé mais **sans CTA** (le choix valide immédiatement) | — | **Continuer / Suivante**, fixe |
| Écriture Leçon | **Valider**, fixe | **Réessayer** / « Corriger ma saisie » pour coquille | **Continuer**, fixe |
| Écriture Session | **Valider**, fixe | **Réessayer** avec le handler de validation courant (libellé adaptable, pas de troisième tentative) | **Suivante / Voir le score**, fixe |
| Mot caché Leçon | **Effacer + Indice + Valider** dans dock fixe | Les mêmes ; « Voir la réponse » secondaire à partir du 3e vrai faux | **Continuer** primaire, secondaires masquées |
| Mot à saisir Session | Comme Écriture Session, pas les tuiles MC | Comme Écriture Session | Comme Écriture Session |

Pendant l'activation d'un CTA, empêcher le double tap **au niveau de l'état métier existant**, pas d'un timeout UI improvisé. La progression (20 questions ou étapes) ne change pas.

## 6. Audio, animation, accessibilité (ne pas régresser SPEC 94)

- Réutiliser `SurvieFx.feedback('success'|'retry'|'finalFailure')` et le même interrupteur « Sons des exercices » dans Plus. **0 nouveau AudioContext**, **1 seul son par décision utilisateur**. Résultat faux sur Quiz = `finalFailure`, même si la carte reviendra en rattrapage ; Mot caché 3e mauvais essai = `retry`, `finalFailure` **uniquement** sur `mcVoirReponse()`.
- Maintenir la micro-secousse sur la réponse erronée et le statut lecteur d'écran (`role=status` / `aria-live=polite`) ; `prefers-reduced-motion` supprime la secousse. Ni le dock ni toute la vue ne tremblent.
- Conserver le bouton « Écouter » manuel (audio LOD) sous la correction pertinente, **dans le corps** ; ne pas transférer ce bouton dans le dock et ne pas jouer LOD automatiquement.
- Si le message visible de réussite est supprimé, le statut `sr-only` conserve la distinction « Juste » / « au 2e essai » ; l'absence de son n'enlève aucune information.
- Après validation tactile, pas de `focus()` provoquant clavier/saut arbitraire. Avec clavier physique, le focus après correction est géré par les fonctions existantes adaptables au **bouton stable**. Touche Entrée respecte la même action et les règles de non-double-validation.

## 7. Plan de réalisation à faible risque

**Lot 0 — Baseline** : mettre de côté les captures réelles fournies (cas juste/faux + avec/sans aide, Écriture 1er faux, correction finale, Mot caché), relever arbre DOM, rects et tests sur le SHA de base. Tester **avant** pour détecter les échecs déjà présents.

**Lot 1 — Infrastructure shell + dock** : créer les deux conteneurs en Leçon/Session, renderer du dock partagé, CSS de layout, mais conserver encore le feedback métier tel quel via adaptateurs transitoires **sans deux CTA visibles**. Tests de géométrie et de navigation.

**Lot 2 — Quiz/Trous** : migrer les boutons `Continuer`/`Suivante` hors feedback, affichage de note inline, garder `afficherVerdictChoix()`, audio inchangé. Test 1 ou 2 options seulement, et dock invariant avec/sans note.

**Lot 3 — Écriture** : migrer Valider/Réessayer/Continuer des deux moteurs au dock, valider clavier Android et coquille gratuite, 2e juste/faux, mode exam. Ne pas modifier notation.

**Lot 4 — Mot caché** : dock 3 commandes + action secondaire conditionnelle, toujours usable en 320px, pas de disparition des tuiles/score/indices. Sons inchangés.

**Lot 5 — Nettoyage et audit** : supprimer CSS de bandeau superflu et vieux chemin de `window.scrollBy` devenu obsolète, actualiser SPEC 94 « implémentation » si code livré ; audit indépendant `ui-parity-auditor`.

**Règle** : un lot par PR, tests avant fusion, comparer avec base à SHA identique (ou branche baseline) ; un échec dans un lot **bloque la fusion**. Ne pas transformer une CI verte en « validé Samsung ». Ne pas toucher `main`.

## 8. Matrice de recette P0/P1 — tests automatisables

| ID | Scénario | Critère observé |
|---|---|---|
| G01 | Quiz correct **sans note** en Session | Option verte unique, **aucune carte verte**, CTA au bas, pas de faux bouton dans le corps |
| G02 | Quiz correct **avec note** en Session | Note lisible en zone centrale, **Y du CTA identique à G01 (±2px)** |
| G03 | Quiz faux **sans note** en Session | Deux options rouge/verte, **pas de grand rectangle rouge vide**, CTA même position |
| G04 | Quiz faux **avec note** en Session | Note neutre sans double mention de la réponse, CTA position G01 |
| G05 | Trous correct/faux avec longues phrases | Trou et choix correct conservés, aucun débordement horizontal, CTA ancré |
| G06 | Leçon Quiz/Trous juste/faux avec/sans aide | Même **shell/dock/classes/tokens** que Session, seule action libellée diffère |
| G07 | Écriture Leçon initiale | Champ éditable, **Valider dans dock**, aucun CTA dans `#pc-body/#pc-feedback` |
| G08 | Écriture Leçon 1er faux, nouveau clavier | Champ éditable, aide non révélatrice, **Réessayer dans dock**, visible au-dessus IME |
| G09 | Coquille gratuite | 0 mauvais point, 0 son retry, CTA « Corriger ma saisie » dock |
| G10 | Écriture Leçon 2e juste | Solution/LOD/rappel conservés, son success et maîtrise inchangée, CTA bas |
| G11 | Écriture Leçon 2e faux | Solution et LOD, son finalFailure, plus de troisième tentative, CTA bas |
| G12 | Écriture Session hors exam : 2 essais | Même dock à Valider/Réessayer/Suivante ; `session.essais` et score inchangés |
| G13 | Session en `exam` : 1er faux | Échec final immédiat, pas de 2e essai, dock vers suite/score |
| G14 | Mot caché initial et erreur 1/2/3/4 | Bonnes lettres/indice/score préservés, commandes Valider + aides dans dock ; reveal seulement sur choix |
| G15 | Mot caché réussi / révélé | Corps avec mot, traduction, audio, score et note ; dock = Continuer, pas d'ancien Valider |
| G16 | Clavier Android ouvert puis fermé | CTA au-dessus du clavier ; aucune duplication ; scroll du corps ; champ lisible et accessible |
| G17 | Corps trop long / 200 % texte / 320×640 | Texte entièrement accessible par un scroll **unique** ; CTA bas entier et cliquable ; aucun recouvrement |
| G18 | Réponse courte puis réponse longue sur même écran | **Géométrie dock constante ±2px**, pas de `scrollBy` violent, axe X identique |
| G19 | Naviguer Retour, re-render, deuxième tap | 0 son rejoué, 0 double score, 0 double CTA, focus cohérent, progression conservée |
| G20 | Son OFF, reduced-motion, lecteur d'écran | Annonce verdict sans couleur/son, pas de secousse si réduit |
| G21 | Session score final | Dock de question masqué ; actions de résultat conservées, aucune action fantôme |
| G22 | Écrans non concernés (missions, Survie, examen dédié, accueil, Plus) | **Aucun changement de disposition** |
| G23 | Petit Android + safe area et orientation | Bas du CTA ≤ bord visible du viewport ; pas derrière barre de navigation ni clavier |
| G24 | CSS/JS partagés | `renderFeedbackCommun` ne contient aucun `appendChild(button)`, même classe `.exo-action-dock` dans les deux vues, **un seul bouton primaire réel** |

### Automatisation attendue, pas des tests déjà présents

- **Nouveaux Playwright** : `tests/test_spec95_dock_geometry.py` (G01–G06,G17–G18,G23), `tests/test_spec95_ecriture_mobile.py` (G07–G13,G16), `tests/test_spec95_motcache.py` (G14–G15), `tests/test_spec95_parity.py` (G19–G24).
- **Node ciblés** : structure DOM du dock, API partagée, suppression du CTA dans `renderFeedbackCommun`, absence de gestionnaires dupliqués ; *ajuster* `tests/test_spec94_feedback.py` et `tests/test_spec87_session_mobile.py` au nouveau DOM **sans supprimer leurs assertions métier**. Les anciens tests qui présument CTA **à l'intérieur du feedback** doivent être adaptés, pas ignorés ni supprimés.
- Mesurer `getBoundingClientRect()` **avant/après** pour bord CTA, hauteur, zones scrollables, bas du scroll, haut du clavier ; `getComputedStyle` pour `position`, `overflow`, `display`, `pointer-events`, visibilité et safe areas. Tester **la vraie navigation entre deux questions**, pas seulement un état DOM créé à la main.
- Lancer `bash tools/critique.sh rapide` **puis** `bash tools/critique.sh`, comparer baseline, CI GitHub, audit `ui-parity-auditor`; terminer par recette réelle Samsung. **Aucun PASS automatique ne remplace la vérification Android**.

## 9. Définition de terminé / arbitrage

Livrable accepté quand **tous les types migrés** disposent d'un dock commun indépendant du feedback, aucune condition avec/sans explication ne modifie le CTA (tolérance ±2px), le scroll/IME fonctionnent sur Samsung et tous les résultats de SPEC 94 demeurent corrects. Aucun CSS « pansement » sur l'ancien bandeau, aucun `position:fixed` global, aucune création de framework. **Le code de branche reste inchangé par cette fiche documentaire.**

**Si une contrainte SPEC 59/87 paraît incompatible avec G16/G17, changer le placement via une enveloppe adaptée et prouver son comportement sur Android ; ne jamais écarter une vérification clavier ou baisser les assertions pour obtenir du vert.**
