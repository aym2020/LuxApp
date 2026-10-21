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
5. **Des actions secondaires réunies** : sur l'accueil, Réviser / Examens / Erreurs partagent une surface sombre à séparateurs fins ; « Voir mon chemin » est volontairement discret. Ailleurs, appliquer cette économie visuelle **si cela aide vraiment la décision**, sans copier mécaniquement cette rangée.

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

## Réglages / panneau Plus — appuis rapides (21 octobre 2026)

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

## 7. Stratégie d'implémentation — une harmonisation en plusieurs lots

### Lot 0 — Audit visuel, avant modification

Inventorier chaque vue et capturer au moins un état représentatif sur une largeur mobile de référence. Relever uniquement les écarts significatifs : hiérarchie, répétition de cartes, contrastes, poids du CTA, troncature, surcharges, densité, transitions. Conserver le comportement comme ligne de base. **Ne pas redessiner ce qui est déjà conforme.**

### Lot 1 — Orientation (priorité élevée)

**Mon chemin → détail de leçon → introduction d'unité.** C'est la continuité immédiate du bouton « Commencer ». Harmoniser d'abord les en-têtes, la mise en avant de la prochaine étape, les cartes de parcours, les lignes d'unités et les CTA. C'est le principal point de rupture possible après l'accueil.

### Lot 2 — Apprentissage (priorité élevée)

**Découverte → quiz / trous / écriture / mot caché → corrections → mission.** Travail sur l'ergonomie réelle : taille de la notion, choix, saisie, passage à l'étape suivante, lisibilité et stabilité des contrôles ; conserver l'espace calme et fonctionnel.

### Lot 3 — Suivi et évaluation

**Réviser, Erreurs, Lexique, Examens, résultats.** Mutualiser les surfaces et les présentations de chiffres, sans fusionner des statuts qui ont des sens différents.

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
