# SPEC 116 — Mini-jeux : écran de présentation universel (référence Lux Runner mobile)

**Décision produit :** 1er novembre 2026 · **Branche de travail :** `2.1` · **Priorité : P1 transverse UI/UX**  
**Statut : SPÉCIFIÉE — NON IMPLÉMENTÉE COMME COMPOSANT COMMUN, NON TESTÉE.** Cette fiche fixe désormais le **contrat obligatoire** de tous les écrans de présentation des mini-jeux LuxApp. Elle ne modifie aucun moteur de jeu, ne ferme aucune tâche et n'atteste aucune recette.  
**Référence visuelle impérative :** **écran de préparation mobile de Lux Runner** (capture de référence utilisateur du 1er novembre 2026), confirmé par `public/runner.js` (`runnerRendrePreparation()`) et `public/runner.css`. En cas de divergence visuelle entre une maquette RED FLAG et Lux Runner, **Lux Runner prévaut sur la structure** ; l'illustration et l'identité éditoriale RED FLAG restent spécifiques.

> **Règle fondamentale : une même page de présentation pour tous les jeux ; seul le contenu change.** Même ordre DOM, mêmes axes, mêmes retraits, même position des titres, même emplacement réservé au visuel, même largeur et même ancrage du CTA, même logique de fond et de scroll. **Pas** de layout « personnalisé » par mini-jeu au seul motif qu'il possède un joli asset. Les couleurs, l'image et les contenus restent propres à chaque jeu.

## 1. Objectif et périmètre

À chaque passage du hub **Jeux** vers un mini-jeu, présenter un écran cohérent et immédiatement reconnaissable, sans effet de changement de produit. L'utilisateur doit retrouver ses repères **à la même place**, de Survie à Lux Runner en passant par RED FLAG. La consistance doit exister sur Android, puis sur PC, pas seulement en largeur maximale.

**Mini-jeux concernés :**

| Jeu | État constaté au 01/11 sur `2.1` | Décision |
|---|---|---|
| **Lux Runner** — `#view-runner` | `runnerRendrePreparation()` comporte déjà un en-tête « ← Jeux / LUX RUNNER », titre serif, visuel des trois portails, record/son et pied d'actions | **Référence de géométrie, espacement et comportement mobile** ; préserver son ergonomie. Le tutoriel de première visite est une variante de contenu, pas un gabarit distinct. |
| **RED FLAG** — `#view-luxdemasque` | `ldRendreAccueil()` a un en-tête apparenté, un grand hero illustré composite titre/portrait, les étapes et un CTA bas. Les rails et la hauteur visuelle divergent encore de Lux Runner | **À aligner strictement** sur la structure commune. Recomposer titre, texte, illustration et étapes dans les zones prévues ; garder l'héroïne, la DA, les interactions de Cringr et les données. |
| **Survie** — `#view-survie` | `survieRendre()` ouvre directement le gameplay ; `.survie-top` et HUD sont déjà propres à la partie. **Pas d'écran de préparation distinct au sens de cette SPEC** | Créer **ultérieurement** une préparation de jeu conforme, **sans démarrer un chronomètre ni toucher aux règles avant clic Jouer**. Conserver l'écran de partie et son HUD tels quels. Prévoir le retour et l'option d'entrée directe uniquement si validée par le produit. |
| **Lux Match** — `#view-luxmatch` | Jeu/démo présent dans le code, **masqué dans le produit** ; `lmEntete()` est conçu pour le gameplay | Le contrat s'applique si ce jeu est réexposé, **sans le réactiver** ni créer un nouvel écran visible pour l'utilisateur aujourd'hui. |

**Hors périmètre :** hub Jeux/cartes des jeux, écran des profils Cringr (SPEC 113), dates/interrogatoires, HUD pendant Survie ou Lux Runner, résultats, tutoriels interactifs, dialogues, modales et gameplay. Ne pas transformer une interface de jeu en une présentation statique. Ne pas modifier l'ordre des exercices ni la sauvegarde.

## 2. Squelette obligatoire : zones et ordre DOM

Chaque présentation suit **exactement ces trois zones**, dans **le même ordre**, avec des sous-zones identiques. **Ne pas déplacer le titre de jeu ou le visuel dans l'en-tête.**

```text
VIEW DE JEU — fond plein écran continu (mobile et desktop)
┌──────────────────────────────────────┐
│ HEADER (aligné haut, largeur contenu)│
│ ← Jeux                  NOM DU JEU    │
├──────────────────────────────────────┤
│ MAIN — PREPARATION (zone flexible)   │
│ Kicker optionnel de contexte         │
│ GRAND TITRE SERIF                    │
│ Sous-titre/règle courte              │
│ VISUEL PRINCIPAL (zone dédiée)       │
│ Informations spécifiques (si utiles)│
│ stats, son, étapes ou bref résumé    │
├──────────────────────────────────────┤
│ FOOTER ACTIONS (ancré bas)           │
│ [ CTA OR pleine largeur       → ]    │
│ [ action secondaire si justifiée ]   │
│ lien discret éventuel                │
└──────────────────────────────────────┘
```

**Header :** même retour **flèche + mot « Jeux »** à gauche, sans cadre/bouton carré ; nom du jeu en petites capitales à droite, sur une ligne. Hauteur, taille du texte, couleur, espacement icône/libellé et marges **identiques** à `.runner-top`/`.runner-retour`. Le retour mène au hub Jeux, pas directement à l'accueil LuxApp. Aucun logo géant ou bouton décoratif supplémentaire dans le header.

**Main :** même conteneur de présentation que `.runner-prepa`. La structure intérieure conserve **un rail de contenu et des points d'ancrage identiques** :

1. **Kicker**, sur une ligne, **si réellement utile** : la zone reste structurellement prévue mais doit être complètement masquée (sans hauteur résiduelle) quand aucun texte n'est nécessaire.
2. **Titre du mini-jeu**, en **Instrument Serif** (même graisse, taille responsive et interligne que Lux Runner), aligné à gauche. Exemples : « Lux Runner. », « Red Flag. », « Survie. ». **RED FLAG doit cesser d'utiliser son titre narratif « Ton prochain date sur Cringr » comme titre principal occupant trois lignes** : ce texte peut devenir un sous-titre ou accroche de contenu, mais le nom du jeu occupe **la position et le style communs**. Le label à droite du header reste petit.
3. **Phrase d'accroche / règle essentielle**, immédiatement sous le titre, sur une largeur lisible. Résumer le défi en une ou deux phrases maximum ; pas deux grands encarts positionnés en surimpression sur l'image. Pour RED FLAG, préciser la protagoniste féminine et le principe de preuve.
4. **Visuel de présentation**, **dans la même zone visuelle**, à la même position dans le flux que les portails de Lux Runner. Contenu libre selon le jeu : trois portails, héroïne de RED FLAG, illustration Survie. **Même enveloppe CSS, ratios/cadrages internes adaptés sans changer la position du bloc** ; le visage ou les objets importants ne doivent pas être recouverts par les textes. Pas de fond rectangulaire opaque, de halo indépendant ni de rupture de dégradé sur les bords d'image.
5. **Informations secondaires**, sous le visuel : records, paramètres audio, trois étapes ou bref rappel **selon ce qui est vraiment utile**. Même rail de largeur, mêmes marges/écarts verticaux. Un jeu peut laisser cette zone vide **sans afficher des placeholders, badges superflus ou faux records**. Le nombre de cartes n'est pas imposé : **la place et la logique des zones le sont**.

**Footer :** actions **hors du MAIN**, comme `.runner-actions`, alignées sur ses bords gauche/droit. Le bouton primaire **or, plein rail**, au minimum 54 px de hauteur, rayon **12 px**, typographie commune, icône flèche à droite ; ancré en pied de viewport par **flex**, pas `position:fixed`, ni `position:absolute`. Il peut s'appeler « Jouer » ou « Commencer » selon le parcours ; **la position, la forme, la couleur et le comportement ne varient pas**. Actions secondaires admises uniquement pour un mode réellement disponible (entraînement, tutoriel), en suivant le modèle Lux Runner, **sans bouton factice pour aligner artificiellement les pages**.

## 3. Géométrie et design tokens : ne pas inventer un quatrième shell

Références normatives : [SPEC 114](SPEC-114.md), [charte UI §6 bis](../CHARTE_UI_2.1.md), [Design System](../DESIGN_SYSTEM.md) et `runner.css`.

| Élément | Contrat obligatoire |
|---|---|
| Enveloppe de la vue PC | **640 px maximum** avec `--layout-shell` ; centrée, sans dégradé coupé aux bords de la vue |
| Rail de présentation | **560 px max** avec `--layout-reading` ; **même rail pour header, titre, visuel, contenu et CTA**, sauf zone interne spécialement justifiée |
| Gouttières | **16 px sur téléphone / 24 px sur PC** via `--layout-gutter` ; ne pas dupliquer les 16 px dans parent + enfant |
| En-tête | **44 px minimum** de hauteur ; retour à gauche, identifiant jeu à droite, centrage vertical |
| Grand titre | **`clamp(48px,14vw,64px)` / `line-height:1.05`** comme Lux Runner ; réduire seulement en cas de problème de débordement démontré, **dans le composant partagé** |
| Visuel | Même **emplacement sous le titre et l'accroche**, alignement et espacement uniformes ; taille contrôlée par une zone de visuel commune. Contenu `object-fit:contain` ou cadrage `cover` **à l'intérieur du bloc** si approprié |
| Bloc d'informations secondaires | Directement sous le visuel ; facultatif, sans réserve de hauteur cachée, même rythme vertical |
| CTA principal | **54 px minimum**, fond or `var(--accent)`, coins 12 px, même police et flèche ; toute largeur du rail |
| Footer | **Ancré en bas** sur viewport suffisamment haut ; padding bas **14 px + safe area**, espace secondaire **8 px** si présent |
| Fond | **Un seul continuum pour la vue complète**, radiale/linéaire sombre ; sur PC, voile éventuel au niveau du `body` plein viewport, jamais un rectangle plus violet dans un shell plus étroit |
| Hauteur/scroll | `min-height:100dvh` et `display:flex;flex-direction:column`; zone MAIN flexible, footer après. Si contenu trop grand, **scroll naturel**, pas de CTA qui masque le contenu |

**Contrat sur la hauteur :** Lux Runner centre sa préparation dans la zone flexible (`.runner-prepa { flex:1; justify-content:center; }`). Cela devient le **standard** pour tous les jeux. En viewport haut, le footer reste en bas et le contenu de MAIN reste visuellement équilibré ; **ne jamais rapprocher manuellement le CTA à 16 px du bloc d'informations**. En viewport court, le centre devient défilable sans sacrifier la lisibilité ni l'accessibilité.

**Important :** le contrat doit être rendu par de **vrais composants/variables partagés**. Les chiffres ci-dessus reproduisent les références actuelles, mais doivent être factorisés dans le CSS commun lors de l'implémentation. Éviter de maintenir quatre copies divergentes de `clamp()`, paddings et hauteurs. Ne pas utiliser `transform:scale()` ou `zoom` pour simuler une conformité.

## 4. Contenu par jeu : mêmes emplacements, liberté contrôlée

| Zone commune | Lux Runner (référence) | RED FLAG | Survie (futur écran) | Lux Match (si réactivé) |
|---|---|---|---|---|
| Header droite | LUX RUNNER | RED FLAG | SURVIE | LUX MATCH |
| Kicker | LES TROIS PORTAILS | Court, uniquement si utile | Enjeu survie | Scénario/démo si utile |
| Grand titre | Lux Runner. | **Red Flag.** | Survie. | Lux Match. |
| Sous-titre | 60 secondes · 3 vies | Tu incarnes une femme cherchant un rendez-vous ; preuves et mensonges | Reconstitue les mots avant la fin du temps | Accroche exacte du mode |
| Visuel | Les trois portails M/F/N | **L'héroïne actuelle**, téléphone, ambiance nocturne ; cadrer au bon ratio sans remplacer l'art | Illustration/symbole de feu ou lettres, propre au produit, pas d'asset inventé silencieusement | Visuel déjà disponible si retenu |
| Sous-visuel | Record, meilleure série, parties ; son | Choisis → Discute → Démasque (si utile) | Règle/record réellement disponible | Infos réellement disponibles |
| CTA primaire | Jouer | Commencer | Jouer | Jouer/Commencer |
| Secondaires | S'entraîner ; Revoir tutoriel | **Aucun** tant qu'aucune action justifiée | Uniquement modes réels | Uniquement modes réels |

Les trois étapes RED FLAG peuvent rester dans la zone d'informations, mais **pas en carte spéciale qui redéfinit le squelette ou sa hauteur**. Les titres narratifs peuvent vivre dans la zone d'accroche, jamais piloter à eux seuls la mise en page du jeu. **Pas d'uniformisation forcée des décors, des couleurs du visuel, des scores ni du nombre d'actions.**

## 5. Contrat technique de factorisation (à implémenter)

**Ne pas dupliquer les styles de Lux Runner dans chaque jeu.** Introduire un composant de présentation commun, purement UI, indépendant des moteurs de jeu, par exemple :

```text
public/game-intro.css         # layout commun (une seule source de géométrie)
public/game-intro.js          # optionnel : fabrique pure des zones, sans dépendance métier
  .game-intro-shell
    .game-intro-header       [retour] [marque de jeu]
    .game-intro-main
      .game-intro-kicker?
      .game-intro-title
      .game-intro-description
      .game-intro-artwork
      .game-intro-details?
    .game-intro-actions      [CTA principal] [secondaire?] [lien?]
```

L'existence de ces chemins est **une proposition d'architecture**, pas un fichier créé par cette livraison documentaire. Respecter les modules globaux et conventions actuels de `public/index.html`; ne pas introduire de framework. Les jeux peuvent garder leurs identifiants et fonctions (`runnerRendrePreparation`, `ldRendreAccueil`, etc.) et injecter seulement du contenu dans la même structure.

- **Navigation/état :** conserver `quitterRunner()`, `ldQuitter()`, etc. Le composant n'efface pas les données, ne décide pas du premier lancement et ne démarre aucun chrono.
- **CSS :** un seul système de padding/largeur/header/CTA. Chaque jeu n'apporte que des tokens d'ambiance et du style **dans** la zone graphique : aucune règle métier pour repositionner les cinq blocs.
- **Décor :** `background` global (mobile et desktop), illustration avec masque progressif si besoin. Les fonds du `body`, des vues et des shells doivent être vérifiés ensemble pour éviter les coutures verticales déjà constatées sur RED FLAG.
- **Chargement :** illustration avec dimensions connues, lazy/eager cohérents, repli textuel, jamais élément interactif dépendant d'une image. Pas d'import Three.js uniquement pour peindre une introduction statique.
- **Accessibilité :** DOM sémantique header/main/actions, vrai bouton, icône décorative `aria-hidden`, retour accessible, focus visible, actions ≥44 px (primaire ≥54), `prefers-reduced-motion`, zoom 200 %.
- **PWA :** mettre à jour caches CSS/JS/service worker si nécessaire, vérifier les rechargements après déploiement. Aucun changement de scores, records, modes ni progression.

**Anti-patterns interdits :** reconstruire un en-tête spécifique à chaque jeu ; placer le titre dans l'image ; cacher des textes avec `overflow:hidden` ; ajouter de faux badges pour combler le vide ; créer un CTA dans MAIN seulement sur un jeu ; déplacer le bouton via `position:absolute` ; pousser la même règle CSS dans trois feuilles avec des sélecteurs plus spécifiques ; présenter un écran de gameplay comme préparation sans état explicite.

## 6. Plan de migration sans régression

**Lot 0 — Baseline.** Capturer sur Samsung et PC **la préparation de Lux Runner** (avec/sans tutoriel), l'accueil RED FLAG, l'entrée de Survie et la démo Lux Match masquée ; mesurer la taille et les positions réelles. Archiver les captures/mesures. Sans ces valeurs, aucun « pixel perfect » revendiqué.

**Lot 1 — Composant partagé + Lux Runner.** Extraire le squelette du CSS/HTML de Lux Runner dans des classes communes **à rendu identique** ; exécuter tests et captures avant/après. Lux Runner est l'étalon : si son mobile change de forme ou de position, le lot échoue.

**Lot 2 — RED FLAG.** Appliquer ce composant au seul écran d'accueil, en préservant l'illustration déjà approuvée, les règles de narration, le CTA et la logique de `ldEntrerRedFlag()`. Vérifier particulièrement la place du visage, la visibilité du titre, la continuité du fond, le footer et l'absence de texte recouvrant les yeux. **Ne pas modifier la sélection SPEC 113.**

**Lot 3 — Survie.** Ajouter une préparation du même gabarit **sans activer le temps avant Jouer** ; vérifier explicitement l'entrée, retour, reprises et effets audio, avec un arbitrage produit sur le parcours. Ne pas toucher au HUD ni aux animations du jeu sans besoin démontré.

**Lot 4 — Lux Match.** Préparer uniquement une migration si le jeu est réactivé par décision explicite ; ne pas le rendre visible maintenant. Puis auditer tous les nouveaux mini-jeux contre la SPEC 116.

**Approche de livraison :** commits séparés par lot, tests pertinents, aucune refonte générale des moteurs ou des JSON. La standardisation des écrans de présentation ne peut justifier une régression sur Survie, les animations de Runner ou la progression RED FLAG.

## 7. Recette de conformité : comparaisons mesurables

Mesurer avec `getBoundingClientRect()` les zones **header/retour/marque**, **titre**, **visuel**, **détails**, **footer/CTA**, pour Lux Runner et chaque autre jeu aux mêmes viewport/zoom. La conformité ne se déduit pas seulement d'un `max-width` partagé.

| ID | Vérification | Critère |
|---|---|---|
| UNI-01 | 320×600, 360×740, 393×852, 430×932 Android | Retour, marque, titre, visuel et CTA aux **mêmes rails et ordre** que Lux Runner ; aucune troncature ni scroll horizontal |
| UNI-02 | Mobile à hauteur normale | En-tête à 44 px minimum ; CTA 54 px minimum, ancré en bas (safe area) ; les secondaires éventuels restent au-dessus ou sous le CTA selon le modèle Runner |
| UNI-03 | 768×1024, 1024×768, 1440×900, 1920×1080 PC | Enveloppe 640 px et rail 560 px ; **aucune couture entre body et vue** ; CTA bas, centre visuel équilibré |
| UNI-04 | Géométrie header | Flèche + « Jeux » alignés exactement ; identifiant à droite, même typographie/taille et padding sur toutes les présentations |
| UNI-05 | Géométrie titre et artwork | Même taille de titre/ligne/position et même emplacement du bloc image sous le pitch ; pas de héros en superposition qui change le squelette |
| UNI-06 | Jeux sans métriques ni seconde action | Aucun placeholder vide, fausse métrique, bouton inerte ; les zones sans contenu disparaissent sans désaligner les autres zones |
| UNI-07 | Texte 130 % et 200 %, zoom 125/150 %, clavier et navigation | Aucun élément recouvert, CTA atteignable, scroll naturel, ordre de focus stable |
| UNI-08 | Retour Android, perte WebGL, image absente, rechargement PWA | Retour correct, repli disponible, aucune progression/record perdu ni son fantôme |
| UNI-09 | Régression par mini-jeu | Lux Runner inchangé au jeu, Cringr SPEC 113 intact, Survie chrono/HUD intacts, Lux Match demeure masqué |
| UNI-10 | Captures de référence comparées | Déviations de structure corrigées au niveau **du composant partagé**, pas par exception CSS propre à chaque jeu |

**Tolérances :** mesures de rail, hauteur des contrôles, padding et espace structurel identiques aux tokens du composant commun ; **±2 px** seulement pour arrondis, police et DPR à viewport égal. Les dimensions internes des illustrations peuvent varier pour préserver leur ratio ; **leur bloc et leur position dans le flux sont identiques**. Sur petits écrans, adaptations communes documentées, jamais exceptions non testées par jeu.

**Tests attendus** : tests Node des composants, Playwright captures + mesures comparatives, suites Runner/Survie/RED FLAG, `bash tools/critique.sh rapide` et `bash tools/critique.sh` selon dépendances, et recette manuelle sur **vrai Samsung**. Ne déclarer « conforme UNI » qu'après preuve visuelle et fonctionnelle.

## 8. Sources, arbitrages et gouvernance

- **SPEC 116 prime** sur les anciennes règles de présentation spécifiques **pour la structure**. Les parties normatives de [SPEC 115](SPEC-115.md) qui placent différemment le titre, l'image ou les étapes de RED FLAG doivent être interprétées comme **historiques** ou **subordonnées** à cette SPEC. Son contenu éditorial, ses illustrations et son suivi LD-049 restent utilisables.
- [SPEC 114](SPEC-114.md) fixe le shell global 640 / lecture 560 / concentration 500. **SPEC 116 ne les remplace pas** ; elle précise la structure de présentation des mini-jeux à l'intérieur du shell.
- [SPEC 96](SPEC-96.md) reste normative pour les modes et mécaniques de Lux Runner ; [SPEC 110](SPEC-110.md) et [SPEC 113](SPEC-113.md) pour l'enquête/Cringr. Les SPEC Survie continuent de régir la partie.
- **SOURCE DE VÉRITÉ :** le code actuel `main` pour les décisions communes et `2.1` pour les jeux en cours de développement ; ne pas prétendre que cette SPEC a uniformisé le code par sa seule rédaction. **Ne pas cocher LD-049 ou une autre tâche avant recette et validation**.
- Lorsqu'un nouveau jeu est conçu, commencer **automatiquement** par cette page de présentation : pas de nouvelle disposition sans exception explicite approuvée et documentée dans cette SPEC.

**Définition du terminé :** passer de l'écran de présentation Lux Runner à RED FLAG ou à Survie ne déplace visuellement aucun repère structurel — seuls les titres, images, descriptions, métriques pertinentes et actions réellement offertes changent. **La norme est documentée dans cette livraison ; son implémentation reste à réaliser et tester.**
