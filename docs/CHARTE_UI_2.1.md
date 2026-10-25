# LuxApp 2.1 — Charte visuelle cible et plan d'harmonisation

**Statut : référence de design validée pour la branche `2.1` (21 octobre 2026).**  
**Référence visuelle :** capture Android de l'accueil approuvée le 21/10/2026 ; implémentation `public/accueil-v21.css` + `public/accueil-v21.js`.  
**Objet :** harmoniser progressivement les autres écrans **sans modifier les contenus pédagogiques, le moteur de progression, les règles de navigation, les sauvegardes ou les examens**.

Cette charte **complète** `docs/DESIGN_SYSTEM.md` (tokens, sémantique des couleurs, composants, états métier) et `docs/ACCUEIL-2.1.md` (historique et fonctionnement de l'accueil). Elle prime sur les anciens choix de **composition visuelle** qui ne correspondent plus à l'accueil validé, mais **pas** sur les invariants fonctionnels et d'accessibilité du design system existant.

## 1. Intention : ce qui fait immédiatement « LuxApp 2.1 »

LuxApp 2.1 est une application d'apprentissage du luxembourgeois pour francophones. Elle doit évoquer le Luxembourg, donner envie d'apprendre, puis laisser toute la place aux exercices. L'accueil approuvé fixe cinq signatures :

1. **Chaleur et sobriété** : fond quasi noir chaud, surfaces brun-noir, textes ivoire ; pas d'interface froide, ni d'accumulation de panneaux.
2. **Personnalité éditoriale** : « Moien ! » en Instrument Serif, grand et expressif, sur une scène luxembourgeoise panoramique. Les autres écrans peuvent employer cette police pour **une expression ou un titre narratif**, jamais pour tout le contenu.
3. **Un or identifiable** : `#f5cf4d` fait ressortir l'action prioritaire ; il ne sert pas à décorer toutes les cartes, tous les boutons ou chaque ligne.
4. **Une lecture immédiate** : marque/niveau → contexte ou message → action principale → alternatives. Une seule information dominante à la fois.
5. **Des actions secondaires réunies** : sur l'accueil, S'entraîner / Examens / Erreurs partagent une surface sombre à séparateurs fins ; « Voir mon chemin » est volontairement discret. Ailleurs, appliquer cette économie visuelle **si cela aide vraiment la décision**, sans copier mécaniquement cette rangée.

**But du travail sur les autres pages :** obtenir une même signature graphique et une même sensation de fluidité, **pas faire 18 copies de l'accueil**. Le panorama photographique est réservé aux moments d'orientation ou de narration pertinents ; les écrans d'entraînement doivent être plus calmes et lisibles.

## 2. Hiérarchie visuelle obligatoire

Sur chaque écran, le regard doit retrouver dans cet ordre :

1. **Où suis-je ?** Titre court, étape, retour cohérent et — si utile — niveau / leçon / progression.
2. **Qu'est-ce qui compte maintenant ?** Une phrase, une notion, une question ou un résultat, avec un poids typographique supérieur au reste.
3. **Que dois-je faire ?** **Une** action principale, distincte visuellement et toujours identifiable.
4. **Quelles sont les alternatives ?** Liens, options et métadonnées discrets mais lisibles.

Ne pas multiplier en-têtes, liserés, pastilles, scores, étiquettes et cartes pour raconter la même chose. Une information secondaire n'a de place que si elle modifie la compréhension, la décision ou l'accessibilité. L'espace vide est volontaire, **mais ne doit pas repousser une question ou un bouton essentiel hors écran**.

## 3. Fondations à reprendre, sans inventer une seconde palette

| Fonction | Référence existante | Application visuelle |
| --- | --- | --- |
| Fond | `--couleur-fond: #0f0e0c` | Fond continu des pages, y compris pendant les transitions |
| Surface | `--couleur-surface-1: #1a1916` | Regroupements discrets, non chaque ligne |
| Surface forte | `--couleur-surface-2: #26241f` | Une carte importante quand elle est vraiment utile |
| Bordure | `--couleur-bord-1: #2a2926` | Contours fins, séparateurs plutôt que cadres redondants |
| Texte | `--couleur-texte: #f6f1e9` | Titres et réponses |
| Texte secondaire | `--couleur-texte-2 / -3` | Explication, statut, détail de parcours |
| Action | `--couleur-action: #f5cf4d` | Une action principale / recommandation réelle |
| Succès | `--couleur-reussi: #54e0ad` | Réussite effectivement obtenue |
| Révision | `--couleur-turquoise: #4fd1c5` | Répétition espacée, questions dues |
| Examen/info | `--couleur-info: #6fb0f2` | Information et identité des examens, pas un succès |
| Erreur | `--couleur-erreur: #ef7a73` | Erreur, échec, alertes |

**Typographie :** Inter pour navigation, consignes, boutons, explications et tableaux ; Instrument Serif pour l'expression « Moien ! », les titres éditoriaux et les mots/phrases courtes mis en scène. Atkinson Hyperlegible reste réservé à l'entraînement sur les lettres (mot caché). Conserver les tokens de taille existants ; les exceptions spectaculaires (ex. titre du hero) restent localisées.

**Formes et espaces :** reprendre `--sp-1` à `--sp-6`, `--rayon-bouton`, `--rayon-carte` et les composants existants. Sur l'accueil, la composition actuelle (`ac-hero`, `ac-v21-cta`, `ac-acces`) est la référence acceptée, **pas un composant générique à coller dans chaque vue**. Les valeurs propres au hero, ses dégradés et ses images restent locales à l'accueil.

**Sémantique non négociable :** l'or indique une action ou une étape courante, le vert une réussite réelle, le turquoise la révision, le bleu l'information ou l'examen. Une icône seule ou une couleur seule ne doit jamais être l'unique moyen de comprendre un état.

## 4. Grammaire des composants

- **Bouton principal :** une grande cible or nette, avec texte sombre et descriptif. Son rôle prime sur l'effet visuel. Un écran de résultat peut utiliser les variantes sémantiques prévues par `components.css` (vert pour continuer après validation) ; ne pas repeindre arbitrairement tous les CTA en jaune.
- **Action secondaire :** bouton neutre, lien texte ou surface regroupée. Deux CTA dorés d'importance égale sur un même écran sont à éviter.
- **Carte :** une unité logique (une leçon, un sujet, un résultat, une question). Pas de carte autour d'un simple sous-titre si un espacement suffit ; contenu développé non tronqué.
- **Séparateurs :** bordures fines et tonalités proches du fond ; les grandes bandes colorées sont réservées à une information d'état importante.
- **Étiquette / badge :** seulement si elle apporte une signification nouvelle. Les statuts de leçon et d'unité reprennent les libellés canoniques de `docs/DESIGN_SYSTEM.md`.
- **Icônes :** SVG au trait, tailles et épaisseurs cohérentes, valeur sémantique ; ne jamais insérer des emojis décoratifs à la place d'une icône UI déjà définie.
- **Feedback :** immédiat, lisible, sans déplacement du contenu essentiel ni masque sur le bouton suivant ; pas de multiplication d'effets d'animation.

### Règle de réutilisation sémantique — SPEC 94 (appliquée)

Deux éléments **ayant le même rôle, le même état et la même interaction** (choix correct/faux, retour, bouton de suite, explication, signal de validation) doivent partager **une seule implémentation de présentation** et les tokens existants. **Ne pas fusionner aveuglément** les moteurs de score Leçon et Session : seuls le modèle d'état et la présentation sont mutualisables. État de la règle : **appliquée aux choix Quiz/Trous** (`public/verdict-choix.js`, partagé par Leçon et S'entraîner) ; les bandeaux de correction partagent un seul rendu (`renderFeedbackCommun()` dans `public/feedback-unifie.js`, style unique `public/feedback-unifie.css` ; **lot 2 implémenté, Samsung à valider**). La règle est un **bandeau plat à trait supérieur** sans deuxième carte bordée ; la réponse correcte verte suffit à signaler un succès et ne doit pas être répétée par une grande carte « Juste ! » ; pour l'échec, la seule zone d'explication conserve un trait rouge, sans répéter la bonne option déjà visible. Mot caché et Écriture adoptent les **mêmes styles et sons** avec exceptions documentées pour essais, aide, clavier et score. [SPEC 94](specs/SPEC-94.md) définit la correction à un seul choix juste / deux choix juste+faux, les sons et l'animation de faute, sans reproduction de la palette des captures de référence.

Avant fusion d'une modification UI transversale : revue indépendante par [l'agent de vérification](../.claude/agents/ui-parity-auditor.md) et contrôle navigateur, puis Samsung ; `AGENTS.md` fixe les critères de preuve.

## 5. Traduction de la direction par parcours

| Vues existantes | Cible V2.1 | À préserver |
| --- | --- | --- |
| `view-dashboard` | **Référence approuvée** : marque, niveaux, hero « Moien ! », CTA or, trois raccourcis groupés, lien Mon chemin | Prochain pas réel, niveau choisi, compte, progression, série, navigation |
| `view-lessons` (Mon chemin) | Rythme plus aéré et lisible : étapes clairement hiérarchisées ; une prochaine étape or ; cartes neutres à bordures fines ; indicateurs de réussite sobres | Chronologie, statuts, étoiles acquises, étapes optionnelles, reprise, accès aux leçons |
| `view-plecon`, `view-lecon` | Une leçon lisible avant tout : titre distinctif, unité dominante, sections pédagogiques sans empilement de bordures, action principale claire | Ordre des unités, cours, exemples, erreurs, ouverture/repli, sans troncature des notions |
| `view-pintro`, `view-decouverte` | Introduction narrative courte : **une** phrase à retenir, règle immédiatement exploitable, mots essentiels, bouton de départ visible | Contenu intégral, découverte guidée, retour, CTA fixe et safe areas |
| `view-parcours`, `view-session` | **Écran de travail calme** : progression discrète, consigne très visible, zone de réponse dominante, correction puis action suivante claire. Pas de hero photo | Réponses, exercices, révisions, niveaux, feedback, clavier, score et progression |
| `view-msintro`, `view-mission` | Ambiance plus incarnée sans rompre la charte : conversation lisible, interlocuteur, contexte et vies clairement séparés ; or réservé au geste prioritaire | Texte, dialogues, vies, validation, mission à 3 vies, reprise |
| `view-pfin`, `view-examen-result` | Résultat mémorable mais sobre : score/état dominant, détail utile ensuite, une action claire ; pas de confettis visuels permanents | Scores calculés, corrections, navigation, vraie distinction entre succès/échec |
| `view-review-setup`, `view-pieges`, `view-lexique` | Outils de progression cohérents : densité maîtrisée, filtres lisibles, cartes neutres, révision turquoise utilisée à bon escient | Sélections, filtres, erreurs historiques, nombres réels |
| `view-examens`, `view-examen` | Présentation de sujets et passation épurée : enjeu/consigne identifiables ; questions prioritaires, choix robustes ; identité bleu/info seulement quand utile | Barèmes, temps, choix, correction, navigation |
| `view-reglages`, portail de compte | Même niveau de finition et sobriété : groupes clairement nommés, formulaires accessibles, avertissements proportionnés | Connexion, synchro, désactivation, suppression, confidentialité |

**Règle pédagogique :** une belle interface qui ralentit la lecture d'une consigne, cache une réponse ou nécessite de deviner l'action suivante n'est **pas** conforme à la V2.1.

## 6. Transitions, responsive et accessibilité

L'effet V2.1 doit rester fluide, **pas spectaculaire** :

- Aucun écran ne doit apparaître brièvement **plus large, plus haut ou zoomé** avant de retrouver sa taille. Ne pas animer `width`, `height`, `padding` ou la taille de la page pour changer d'écran.
- **Toutes les transitions de vues** doivent utiliser un fondu court **sans `transform` sur le conteneur `.view`** (correction V2.1 du 21/10). Les animations internes (cartes, résultats, réponses) peuvent rester indépendantes. Cette règle protège les contrôles fixes et le bandeau d'examen du saut observé à l'ouverture.
- Les boutons ancrés en bas et les zones de saisie doivent rester stables, y compris pendant une animation et à l'ouverture du clavier.
- Tester au minimum **320, 360, 390, 430 et 720 px**, sur téléphone de faible hauteur, avec zones sûres Android/iOS, texte agrandi à **130 % et 200 %**, et préférences `prefers-reduced-motion`.
- Aucun scroll horizontal, aucun bord supérieur de CTA masqué sous le hero, aucun bouton hors champ. Tap targets ≥ **44 px**, boutons principaux ≥ **48 px** ; contrastes et focus clavier conformes au design system.
- Préserver le scroll, le retour Android, le retour applicatif, les états de session et les positions d'éléments lorsqu'ils sont contractuellement requis.

## Mission « Le studio radio » — feedback non masqué (21 octobre 2026)

Pendant les huit défis, la zone basse `#ms-reponse` gardait les choix après validation puis ajoutait « Continuer » ; le retour « Exact ! / Pas encore » était, lui, injecté dans `#ms-body` et pouvait se retrouver caché sous cette zone devenue trop haute. La correction V2.1 remplace les choix par **un seul bouton « Continuer »** une fois la réponse enregistrée, affiche la réponse donnée (et, si elle est fausse, celle attendue) dans `.studio-feedback`, puis recentre le début de cette correction **dans le scroll local** de `#ms-body`. Chaque nouveau défi réinitialise ce scroll. Le compteur de vies, la notation, l'audio et la fin de mission ne changent pas.

Régression couverte par `test/studio-feedback-v21.test.cjs` : succès, erreur, double appui, passage au défi suivant, huitième défi et défilement local. Recette visuelle Android nécessaire sur une petite hauteur et avec texte agrandi.

## Introductions de mission et d'unité — parité V2 (21 octobre 2026)

L'écran « Unité 1 · Ce que tu vas apprendre » de la V2.1 devenait trop haut : la règle et l'avertissement repoussaient la synthèse vers le bas, alors que le CTA restait ancré et masquait visuellement la dernière ligne. La V2 avait déjà des règles compactes (**SPEC 85**) et une disposition fixe de découverte (**SPEC 86**), absentes de la branche `2.1`.

- **Repris directement de `v2` :** SPEC 85/86 de `public/style.css` ; fonction d'introduction de mission de `public/mission.js` avec `titre_intro`, `contexte_intro`, `objectif_intro` lorsqu'ils existent ; fonction `openIntro` de `public/parcours.js`, y compris le résumé « 9 sons à découvrir · 20 écoutes » et le CTA « Découvrir les sons » pour la prononciation.
- **Sécurité de mise en page propre à `2.1` :** introductions de mission et d'unité limitées à `100dvh`, défilement uniquement dans les zones de lecture en cas de contenu long ou de grands caractères, bouton de démarrage accessible en permanence et bloc d'actions de mission collé au bas du contenu visible. La découverte guidée emploie la barre inférieure stable de `v2`.
- **Non modifiés :** textes source des leçons, missions jouées, résultats, sauvegardes et calculs de progression. Tests ciblés dans `test/intros-v2-fixed.test.cjs`. Contrôle visuel sur Samsung Android encore nécessaire.

## Plus — page de navigation compacte (24 octobre 2026)

Le menu Plus est **une vraie vue** (`view-plus`) et non plus un panneau temporaire ; les destinations Réglages, Lexique et Mes pièges doivent y revenir via le bouton Retour Android et le bouton retour de l'écran.

**Composition cible :** même hiérarchie que l'écran S'entraîner : surtitre discret, titre sobre, statistiques compactes sans quatre grandes cartes, puis **une seule liste** de liens sur surface sombre avec séparateurs fins. Garder les quatre compteurs, les quatre destinations, l'accès recette réservé aux comptes autorisés, le statut de synchronisation et la version ; ne supprimer aucune fonctionnalité pour réduire la hauteur. Les zones cliquables doivent rester ≥44px, sans masquer la navigation basse. Styles limités à `#view-plus`, pas de changement global d'autres vues.

**Recette UI :** vérifier en 320, 390, 430px, clavier/zoom et PC ; aucune troncature, liens visibles par défilement si nécessaire, puis ouvrir Réglages/Lexique et revenir à Plus. L'accès de recette via Render reste distinct et sécurisé.

### Historique : ancien panneau Plus (21 octobre 2026)



Le menu **Plus** (roue dentée de l'accueil et onglet Plus) ne doit pas s'ouvrir plusieurs fois sous un double appui. Un tap supplémentaire sur la position de la roue, intercepté par le voile du panneau, ne doit pas provoquer sa fermeture instantanée. La fermeture reste accessible en touchant une autre zone du voile, en choisissant une destination ou avec le bouton Retour.

**Implémentation** : `public/accueil.js` réutilise le panneau Plus déjà ouvert, neutralise sur son voile les taps correspondant à l'emplacement de la roue et ignore les taps parasites pendant les 250 premières millisecondes. Les panneaux de mission conservent leur comportement de remplacement. `public/style.css` laisse la roue immobile à l'arrivée sur l'accueil et remplace la translation du panneau par un fondu court. **Recette** : `test/menu-taps-v21.test.cjs`, puis essai de double/triple appui rapide sur Chrome Android.

## Stabilisation des CTA — 21 octobre 2026

Lors de l'ouverture d'une annale, le bandeau « banque de mots + Corriger » apparaissait partiellement hors champ avant de se repositionner. L'origine relevait de deux choix de présentation : animation de `.view` avec translation et barre `.ex-bottom` positionnée en `sticky` dans un écran de longueur variable.

**Correctif :** animation des vues uniquement en opacité dans `public/style.css`; `#view-examen` utilise une hauteur `100dvh`, un `#ex-body` défilant et un bandeau `.ex-bottom` maintenu dans le flux flex, avec banque de mots défilante si nécessaire et prise en compte de `safe-area-inset-bottom`. `public/examens.js` replace le scroll de la zone de question après changement ou correction de partie et mesure cette même zone pour rendre un trou visible.

**Périmètre préventif :** intro d'unité, découverte guidée, résultat d'unité et résultat d'examen possèdent des CTA fixes ; ils bénéficient de l'absence de translation sur la vue entière. Tests de structure et comportement dans `test/navigation-cta.test.cjs`. Les essais en environnement simulé ne se substituent pas à la recette sur Android (hauteurs de clavier, parties à banque longue, retour depuis résultats).

## Implémentation du Chemin V2.1 — 21 octobre 2026

Le premier lot est **codé sur la branche `2.1`**, avec une feuille `public/chemin-v21.css` entièrement limitée à `#view-lessons`. Ce découplage temporaire, identique à celui de l'accueil validé, permet de valider visuellement le lot sans risquer de modifier les anciens styles des écrans d'exercice. Lors d'une consolidation ultérieure, les styles réellement communs seront replacés dans `components.css` ou `style.css`.

Principes mis en œuvre : en-tête photographique compact utilisant le **WebP déjà présent** sur l'accueil ; « Mon chemin » en Instrument Serif ; barre réelle des **leçons terminées sur les leçons du niveau** (une acquisition historique n'est pas une leçon terminée) ; mini-résumé distinct des acquis historiques / en cours ; frise continue de repères plus légers ; or réservé à la recommandation ; carte actuelle prioritaire mais sans photographie supplémentaire ; lignes d'unités complètes et lisibles ; examens ouverts à tout moment.

La structure HTML et les boutons du parcours restent fournis par `public/chemin.js` et son moteur existant. Les nouveaux contrôles ciblés sont dans `test/chemin-v21.test.cjs`. **Le rendu final sur téléphone et les autres états de progression restent à recetter manuellement avant validation visuelle définitive.**

## 6 bis. Référentiel de dimensions 2.1 — cible d'harmonisation

**Statut : règles normatives pour les prochaines modifications de la branche `2.1`, non implémentées dans les CSS actuels.** Lire d'abord [l'audit des 20 vues et panneaux](AUDIT-DIMENSIONS-2.1.md) (état GitHub initial `ff6d6ee`). Les valeurs ci-dessous sont des **plafonds proposés et retenus comme cible de conception**, jamais des mesures DOM de tous les écrans.

### 6 bis.1 — Un gabarit extérieur, des contenus adaptés

| Rôle | Token à créer dans `design-tokens.css` | Maximum cible |
|---|---|---:|
| Enveloppe commune des vues | `--layout-shell` | **640px** |
| Zone de lecture : cours, lexique, corrections longues | `--layout-reading` | **560px** |
| Zone de concentration : exercices, saisie, tuiles, Survie | `--layout-focus` | **500px** |
| Feuille contextuelle principale : Plus, Cours, recette | `--layout-sheet` | **640px** |
| Dialogue bref / confirmation | `--layout-dialog` | **400px** |
| Gouttière latérale | `--layout-gutter` | **16px mobile / 24px PC** |

**Ces tokens ne sont pas encore définis dans le code.** Les utiliser seulement lors du futur lot d'implémentation, avec `width:100%`, `max-width`, `min-width:0` quand nécessaire et centrage cohérent. Jamais de largeur minimale supérieure à celle d'un téléphone. Ne pas étirer les caractères des tuiles, les bulles de messagerie ni les titres courts pour « remplir » 640px.

**Mobile prioritaire :** préserver l'accueil déjà validé et les compositions jusqu'à 600px ; l'harmonisation extérieure se manifeste principalement sur les grands écrans. Aucune modification de la disposition des leçons, de leur ordre, du clavier, des réponses, des couleurs de feedback ou de la progression n'est autorisée pour gagner de la largeur.

### 6 bis.2 — Alignement et exceptions par famille

1. **Toutes les pages :** les vues, leurs en-têtes, la navigation basse `.nav-bas` et les bandeaux `.cta-fixe` prennent l'enveloppe commune de 640px. Les repères gauche et droit des titres, cartes et actions doivent être cohérents lors de la navigation.
2. **Accueil, Chemin, détail de leçon et hub Jeux :** enveloppe commune de 640px sur grand écran. Les blocs intérieurs peuvent être plus étroits pour la lecture ; ne pas transformer l'accueil en grille de bureau et ne pas recopier le hero photographique sur les activités.
3. **Cours, lexique, pièges, annales et résultats :** lecture jusqu'à 560px lorsqu'il s'agit de paragraphes. Tableaux, filtres et banques de mots restent intégralement utilisables et peuvent occuper l'enveloppe si nécessaire.
4. **Mot caché, Quiz, Trous, Écriture, entraînement et Survie :** enveloppe extérieure identique mais **zone active à 500px au maximum**. Les lettres, choix, champs et feedback gardent leurs tailles tactiles réelles et une correction toujours lisible. Aligner correctement les headers et CTA sur ce système.
5. **Mission :** garder l'en-tête, le fil de messages scrollable et la réponse fixe ; les bulles restent proportionnelles à la conversation. Ne pas modifier le comportement clavier.
6. **Survie et bilans :** scores, anneaux et éléments centraux peuvent rester compacts (le résultat Survie possède aujourd'hui un bloc interne de 420px). Les boutons et la navigation suivent les axes retenus.
7. **Panneaux principaux :** Plus / recette et Cours convergent vers 640px. Exceptions intentionnelles : aide Mot caché 500px, portail d'authentification compact 500px, modales 400px et popovers adaptés à leur ancre. Le lecteur d'exemples peut avoir un fond plein viewport et un contenu de 560px.

**Ne pas appliquer** `* {max-width:640px}` ni créer des surcharges répétées en fin de `style.css`. Une valeur partagée va dans les tokens, la géométrie commune dans les composants, les exceptions vérifiées dans les feuilles propres aux vues.

### 6 bis.3 — Règles verticales et scroll

- **Consultation** (accueil, chemin, leçons, lexique, liste d'examens) : hauteur guidée par le contenu et une zone de défilement principale ; ne pas forcer un grand vide pour pousser le CTA au fond de la fenêtre PC.
- **Immersion** (exercices, mission, Survie, examen) : `100dvh` ou hauteur de viewport ajustée au clavier lorsque nécessaire ; en-tête et actions stables, contenu central scrollable.
- **Introductions / découverte** : sur Android, garder l'action accessible en bas ; sur PC très haut, réduire les distances artificielles tout en conservant l'ordre de navigation, le contenu entier et les safe areas.
- **Résultats et panneaux** : jamais de recouvrement des dernières lignes par un CTA ; panneaux bornés en hauteur avec contenu défilant et actions toujours accessibles.

### 6 bis.4 — Recette avant chaque déploiement

Implémenter par lots séparés : **(1) tokens et vues de consultation, (2) accueil → chemin → leçon → Jeux, (3) navigation et panneaux, (4) activités sensibles et résultats**. Ne pas modifier en bloc toutes les vues et ne pas toucher à `main` ou à la progression.

Mesurer avant et après via `getBoundingClientRect()` (vues, axes des en-têtes, footers, zones de réponse), puis comparer des captures sur **320 / 360 / 390 / 430 / 600 / 640 / 720 / 768 / 1024 / 1440 / 1920px**, hauteurs **600 / 900 / 1080px**, zoom 100/125/150 %, texte 130/200 % et Samsung avec clavier ouvert. Critères : zéro scroll horizontal, aucune troncature de contenu, zones tactiles ≥44px, CTA visibles, navigation et reprise correctes. Pour les lots d'exercices, exécuter les tests ciblés, `bash tools/critique.sh rapide` et `bash tools/critique.sh`, puis vérifier sur vrai Samsung. Une CI verte ne suffit pas.

**Source normative unique pour le layout 2.1 : cette section de la charte.** L'audit fige l'état initial ; `docs/DESIGN_SYSTEM.md` reste la référence générale des composants. Ne pas confondre cible écrite et CSS déjà déployé.

---

## 7. Stratégie d'implémentation — une harmonisation en plusieurs lots

### Lot 0 — Audit visuel, avant modification

Inventorier chaque vue et capturer au moins un état représentatif sur une largeur mobile de référence. Relever uniquement les écarts significatifs : hiérarchie, répétition de cartes, contrastes, poids du CTA, troncature, surcharges, densité, transitions. Conserver le comportement comme ligne de base. **Ne pas redessiner ce qui est déjà conforme.**

### Lot 1 — Orientation (priorité élevée)

**Mon chemin → détail de leçon → introduction d'unité.** C'est la continuité immédiate du bouton « Commencer ». Harmoniser d'abord les en-têtes, la mise en avant de la prochaine étape, les cartes de parcours, les lignes d'unités et les CTA. C'est le principal point de rupture possible après l'accueil.

### Lot 2 — Apprentissage (priorité élevée)

**Découverte → quiz / trous / écriture / mot caché → corrections → mission.** Travail sur l'ergonomie réelle : taille de la notion, choix, saisie, passage à l'étape suivante, lisibilité et stabilité des contrôles ; conserver l'espace calme et fonctionnel.

### Lot 3 — Suivi et évaluation

**S'entraîner, Erreurs, Lexique, Examens, résultats.** Mutualiser les surfaces et les présentations de chiffres, sans fusionner des statuts qui ont des sens différents.

### Lot 4 — Finition transversale

**Réglages, connexion, états vides, erreurs techniques, chargement.** Nettoyer les doublons CSS, uniformiser les micro-interactions, vérifier tous les formats mobiles, étendre le catalogue de composants et exécuter une recette complète.

Chaque lot peut être validé et livré **indépendamment**, en préservant la V2.1 d'accueil validée.

## 8. Architecture et discipline de modification

1. **Source de vérité de la branche : `2.1`.** Lire ses fichiers actuels, pas ceux de `main`, de `v2` ou d'une ancienne pièce jointe.
2. **Tokens globaux :** `public/design-tokens.css`. **Composants partagés :** `public/components.css`. **Assemblage des vues :** `public/style.css`.
3. **Surcouche d'accueil :** `public/accueil-v21.css` et `public/accueil-v21.js` restent **limités à l'accueil**. Ne pas réutiliser leurs sélecteurs comme correctif global.
4. Lorsqu'une règle visuelle devient commune, l'extraire dans un **composant** documenté au lieu de dupliquer sa valeur dans chaque vue. Ne pas empiler les sélecteurs plus spécifiques pour cacher une ancienne règle incohérente.
5. Modifications minimales par lot ; aucune refonte du moteur, des JSON de leçons, de l'authentification, des calculs ni de l'accessibilité pour « simplifier le design ».
6. Pour toute nouvelle exception, indiquer **pourquoi** elle ne peut pas utiliser les composants de base. Actualiser `docs/DESIGN_SYSTEM.md` et `catalogue.html` si nécessaire.

## 9. Définition de « conforme V2.1 »

Un lot est **terminé** si :

- Un utilisateur reconnaît la même identité que l'accueil sans avoir besoin d'une photo ou de « Moien ! » partout.
- La prochaine action se comprend sans lire trois cartes de détails.
- Les statuts, couleurs, composants et libellés gardent le même sens d'un écran à l'autre.
- Les informations pédagogiques, choix, champs, erreurs et explications ne sont ni coupés ni dissimulés.
- La transition est stable dans les **deux sens**, particulièrement entre accueil et leçon, et aucun contrôle fixe ne saute.
- La navigation, la sauvegarde, les résultats et la progression se comportent **exactement comme avant**.
- Les tests ciblés passent ; `node --test test/accueil-v21.test.cjs` valide au moins la non-régression de l'accueil. Une validation sur téléphone réel reste requise pour les effets visuels et clavier.

**Critère de décision :** si deux designs sont aussi lisibles et fonctionnels, retenir celui qui demande **moins de cadres, moins de couleurs concurrentes et moins d'effets**. La personnalité vient du contenu luxembourgeois, de la typographie, de la chaleur et de la qualité des détails.


## Implémentation de S'entraîner V2.1 — 21 octobre 2026

La configuration de révision adopte la composition éditoriale de l'accueil : titre sans carte, sections délimitées par des filets, sélecteur compact de 10 / 20 / 50 / Tout, focus et niveaux visibles, **types d'exercices conservés**, liste des leçons dans un panneau secondaire, un seul CTA jaune au-dessus de la barre inférieure. Aucun calcul de disponibilité, règle de sélection, lancement de séance ni suivi de progression n'est modifié.

Implémentation : `public/index.html`, `public/revision-v21.css` (scopé à Réviser) et adaptation minimale de `public/app.js`. Recette : `test/revision-v21.test.cjs`, plus vérification sur Android. Spécification détaillée et critères de recette : [REVISION-2.1.md](REVISION-2.1.md).


## Nommage des accès d'apprentissage — 21 octobre 2026

**S'entraîner** désigne la pratique libre (toutes les questions disponibles selon les filtres), distincte de **Erreurs** (questions ratées) et de **Examens** (évaluation). C'est le nom affiché sur l'accueil, dans la navigation basse et sur l'écran de configuration (« Ton entraînement », « Commencer l'entraînement »). Les noms de fonctions / états `review`, `reviser` et les rappels « Réviser / Revoir » dans une leçon précise sont conservés.


## Maquette 1 — Écran d’ensemble de la leçon (21 octobre 2026)

La première maquette validée concerne **`view-plecon`** (« Moien! ...an Äddi! », mission et liste d’unités), à ne pas confondre avec les introductions `view-msintro` et `view-pintro`. L’écran adopte le titre éditorial en Instrument Serif, l’image WebP déjà optimisée en en-tête, la mission neutre avec sa progression réelle, une seule unité actuelle en léger or et des raccourcis d’exercices visuellement secondaires. Les cartes « Toute la leçon » et « Bilan » sont conservées et allégées.

Implémentation : `public/lecon-v21.css`, lien dans `public/index.html`, ajout d’une piste accessible dans `public/mission.js`. Aucun changement du score, des étapes, de l'ordre ni des sauvegardes. Tests : `test/lecon-overview-v21.test.cjs`. Documentation et recette Android : [LECON-OVERVIEW-2.1.md](LECON-OVERVIEW-2.1.md).



### Finalisation de la carte de leçon — 21 octobre 2026

Cinq améliorations validées sont désormais en place sur `view-plecon` : réduction légère de l'espace avant la mission, carte mission plus compacte et liens secondaires, décompte des répliques **à produire** et préparées par les unités, suppression des quatre raccourcis d'exercice dans les cartes (bonus conservés), et transformation de « Toute la leçon » et « Bilan » en deux lignes compactes entièrement cliquables. Aucun changement aux points, étoiles, règles de validation, contenus ou sauvegardes. Voir [LECON-OVERVIEW-2.1.md](LECON-OVERVIEW-2.1.md).


## Maquette 2 — Introduction de mission (21 octobre 2026)

Cette introduction garde ses objectifs et son scénario, mais abandonne l'encadré orange et la hauteur vide avant les actions. Le hero est un WebP généré spécifiquement pour « Aux objets trouvés » (leçon 3), placé avant le titre ; aucun visuel de bus n'est affiché pour les autres missions. L'objectif est signalé par un filet jaune, le nombre d'unités et les répliques restent dynamiques. « Commencer » reste la seule action jaune ; « Voir les unités » et « Tenter la mission directement » sont secondaires. Toutes les fonctions de découverte et de navigation sont conservées.

Fichiers : `public/art/mission-objets-trouves-v21.webp`, `public/mission.js`, `public/mission-intro-v21.css`, `public/index.html`. Tests : `test/mission-intro-v21.test.cjs`. Documentation : [MISSION-INTRO-2.1.md](MISSION-INTRO-2.1.md).


### Finition de l'introduction de mission — contrôle mobile

Le WebP de la scène « Aux objets trouvés » est passé de 400 × 198 px à 1 024 × 412 px ; CSS et image possèdent des versions de cache pour actualiser le rendu sur Android. Les deux liens « Voir les unités » et « Tenter la mission » sont désormais côte à côte sous l'unique bouton jaune, avec cibles de 44 px. Aucun changement aux états de validation ou à la logique pédagogique. Voir [MISSION-INTRO-2.1.md](MISSION-INTRO-2.1.md).


## Scénario de mission — lecteur immersif (21 octobre 2026)

Le panneau « Voir le scénario » devient un lecteur plein écran, avec un **en-tête constant**, une **zone de répliques défilante** et un pied fixe contenant l'unique CTA **« Jouer / Rejouer la mission »**. Les répliques sont des lignes typographiques avec séparateurs fins, sans grandes bulles colorées ; `TOI` reçoit le seul accent or. Les traductions françaises, les audios et l'unité associée restent accessibles. Contexte et objectif passent dans « Rappel du contexte » replié par défaut. Les autres panneaux, le moteur de mission et le parcours restent inchangés.

Fichiers : `public/mission.js`, `public/scenario-v21.css`, `public/index.html` ; vérification : `test/scenario-v21.test.cjs`. Détails : [SCENARIO-2.1.md](SCENARIO-2.1.md).


## Introduction d'unité — allègement éditorial (21 octobre 2026)

Sur `view-pintro`, « LA RÈGLE » perd son fond brun et devient une section typographique sur le fond noir ; les termes importants restent en or. « ATTENTION » perd son fond orange et conserve seulement un filet vertical orange. Les espaces entre le titre, la phrase, la règle et l'avertissement sont légèrement réduits. Le lexique, les exemples, le contenu des leçons, le CTA fixe et l'ensemble de la logique pédagogique sont inchangés. La feuille `public/intro-unite-v21.css` est strictement scoped à cette vue. Tests : `test/intro-unite-v21.test.cjs`. Détails : [INTRO-UNITE-2.1.md](INTRO-UNITE-2.1.md).


## Nouveautés et identification de version — 21 octobre 2026

Dans le menu **Plus**, une entrée « Nouveautés » ouvre sur la branche `2.1` une page éditoriale autonome avec hero local, six thèmes de changements et leurs mini-aperçus en HTML/CSS. Ce n'est pas une liste brute de commits : chaque thème renvoie vers un commit réel et une sortie vers l'historique GitHub complet est disponible en bas. La version reste visible dans Plus, sobrement : **LuxApp 2.1** (branche `2.1`) et **LuxApp 2.0** (branche `v2`). La branche `v2` ne reçoit aucun des éléments 2.1.

Correctifs annexes : le conteneur défilant `#pi-content` est réinitialisé sur chaque nouvelle ouverture d'introduction ; dans le scénario, les repères UNITÉ deviennent plus discrets que les noms d'interlocuteurs, `TOI` conservant le jaune. Le contenu pédagogique est inchangé. Voir [NOUVEAUTES-2.1.md](NOUVEAUTES-2.1.md) pour les commits, les fichiers et la recette mobile.


## Panneau Cours — maquette validée (21 octobre 2026)

La référence pédagogique affichée pendant un exercice est désormais un panneau éditorial : titre en Instrument Serif, filtres d'unités et trois onglets visibles, et un pied fixe « Revenir à l'exercice ». Seul le contenu défile. Le fond brun et les gros encadrés verts/violets sont supprimés, au profit du fond noir, de séparateurs fins et de l'or réservé aux mots importants et à l'onglet actif. Les avertissements gardent un filet orange, les audios restent alignés à droite et les tableaux complexes ne sont pas aplatis. L'implémentation est strictement limitée à `#cours-panel`. Référence : [COURS-2.1.md](COURS-2.1.md) ; styles : `public/cours-v21.css` ; tests : `test/cours-v21.test.cjs`.


## Portail de connexion — visibilité du mot de passe (22 octobre 2026)

Les formulaires **Se connecter** et **Créer un compte** comportent un bouton œil à droite du champ « Mot de passe ». Il utilise les SVG au trait de LuxApp, une zone tactile minimale de **44 × 44 px**, les états accessibles `aria-label="Afficher le mot de passe" / "Masquer le mot de passe"` et `aria-pressed`. Le champ reste lié à son label et conserve ses attributs `autocomplete="current-password"` ou `new-password`, ses validations et le traitement d’authentification existant. L’action inverse repasse immédiatement à `type="password"` ; aucune valeur n’est stockée par le bouton.

Sur mobile, `pointerdown.preventDefault()` empêche que le bouton prenne le focus au toucher ; le clavier du champ ne doit pas se refermer lorsqu'on révèle ou masque le mot de passe. Les essais clavier (Tab, Entrée, Espace) restent possibles grâce au vrai `button type="button"`. Scénarios à vérifier : champ vide, saisi, erreur de connexion, inscription, zoom 130 % / 200 %, Samsung clavier ouvert, tailles 320–430 px. L’ajout n’affecte pas le portail de recette protégé par Basic Auth (qui appartient au navigateur, pas à ce formulaire).
