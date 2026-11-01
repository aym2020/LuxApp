# SPEC 115 — RED FLAG : accueil illustré Cringr, héroïne et lancement (V8)

**Décision initiale V2 :** 31 octobre 2026 · **Dépôt :** `aym2020/LuxApp` · **Branche de code :** `2.1`  
**Statut courant : V7 implémentée et testée sous Chromium ; validation Samsung/Produit en attente.** La V7 (§16) remplace les règles de hauteur, de fondu et d'illustration V6. [Recette, mesures et captures](../red-flag/SPEC-115-V7-RECETTE.md). L'ancienne cinématique reste abandonnée.
**Suivi :** [LD-049 — TODO canonique sur `main`](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md). LD-048/SPEC 113 (sélecteur) et LD-002.01 (Rencontre) restent distinctes.

> **Décision normative : ABANDONNER la cinématique 3D, le téléphone qui vibre, la prise en main, les messages intermédiaires, le zoom et le mécanisme « vu une fois ».** Les remplacer par **un seul écran de préparation statique**, dans l'esprit du lancement de **Lux Runner**, suivi immédiatement du sélecteur Cringr au clic sur **Commencer**. Ne pas créer de nouvelle SPEC.

> **Priorité documentaire V7 :** le **§16** prime sur les versions précédentes pour la composition, le placement du CTA et l'asset. Conserver le titre, les deux paragraphes, le panneau des trois étapes et le bouton unique. Aucun nouveau composant, aucune modification de gameplay.

## 1. Objectif produit

Avant de voir les profils masculins dans Cringr, le joueur doit comprendre immédiatement :

1. **Qui il incarne** : une jeune femme adulte (personnage fictif) qui cherche un rendez-vous.
2. **Où se déroule l'aventure** : l'application de rencontres fictive **Cringr**, intégrée au jeu RED FLAG.
3. **Ce qu'il va faire** : choisir un prétendant, discuter **en luxembourgeois**, chercher les incohérences et **prouver** les mensonges grâce aux indices. Il ne suffit pas de deviner qu'un homme ment.
4. **Ce qu'il doit toucher** : un unique bouton principal **« Commencer »** ouvrant directement le sélecteur existant.

Le contexte doit être compréhensible **en 3 à 5 secondes de lecture**, sans pavé explicatif, sans tutoriel modal, sans animation forcée et sans étape intermédiaire. L'introduction est un **écran de lancement**, pas un jeu dans le jeu.

## 2. Référence visuelle et direction artistique

Référence de composition : écran de préparation de **Lux Runner** sur Samsung (capture produit du 31/10/2026) : fond nocturne sombre, bandeau Retour/Jeux, titre fortement hiérarchisé, illustration/repère graphique marquant, informations essentielles, gros CTA or placé en bas.

**Maquette produit retenue :** deuxième mockup « Ton prochain date sur Cringr. » : il établit une jeune femme low-poly dans un intérieur nocturne, une tasse et un téléphone, avec une lecture en trois gestes. **C'est une référence de composition, pas un asset de production à intégrer tel quel** : reconstruire l'interface avec HTML/CSS, puis utiliser un asset autorisé et optimisé pour l'illustration. Ne pas incorporer une capture entière contenant du texte rasterisé.

**Style :**
- Fond #120f17 / violet très profond avec halo discret **fondu dans le noir**, sans rectangle de fond brutal sur PC.
- Titre éditorial serif dans l'esprit Lux Runner ; touches rose/rouge pour Cringr et RED FLAG, **or LuxApp réservé au CTA**.
- Petits repères pixel art/arcade pour les trois étapes ; pas de multiplications de badges, étoiles, stickers ou effets « template IA ».
- Portrait **féminin adulte** low-poly / PS1, expression légèrement dubitative ou amusée, sans hyperréalisme ni sexualisation. Composition simple : héroïne assise devant son téléphone, ou portrait de trois-quarts avec téléphone sur une table.
- Ne pas utiliser le visage d'un prétendant comme héroïne, ni recycler l'identité narrative de Noémie/Emma de Lux Match. Une géométrie féminine partagée peut servir **si ses couleurs et son rôle sont propres à RED FLAG**.
- Sur un vrai écran de 360–393 px, ne pas tenter de reproduire tous les espaces et éléments de la maquette au pixel : **la lisibilité et le CTA visible priment**.

## 3. Structure d'écran — ordre obligatoire

| Rang | Composant | Contrat |
|---|---|---|
| 1 | **En-tête** | Retour vers Jeux à gauche ; **RED FLAG** identifié sans doublon de titre énorme. Même logique de navigation que les jeux. |
| 2 | **Kicker discret** | Ex. « TON PROCHAIN RENDEZ-VOUS », en petite capitale violette ; facultatif si l'espace vertical manque. |
| 3 | **Titre principal** | **« Ton prochain date sur Cringr. »**, le mot **Cringr** accentué en rose, sur 2–3 lignes selon largeur. |
| 4 | **Visuel héroïne** | Une seule illustration 2D statique optimisée issue d'un rendu low-poly cohérent, non une scène Three.js en fonctionnement ; smartphone visible pour identifier le contexte. |
| 5 | **Pitch court** | Deux phrases maximum (§ 4). Le visuel peut accompagner le texte en grand écran, mais ne doit pas le recouvrir. |
| 6 | **Règle des trois gestes** | Trois pictogrammes simples, liés par des chevrons discrets : **Choisis → Discute → Démasque** ; libellés lisibles sous chaque pictogramme. |
| 7 | **Action principale** | Bouton or LuxApp **« Commencer → »**, largeur disponible, tactile ≥48 px, placé vers le bas de la zone de préparation et jamais masqué. Il ouvre le **sélecteur Cringr actuel**. |

**À supprimer par rapport au mockup généré :** les deux pilules « En luxembourgeois (A1–A2) » et « Dialogue et enquête » (redondantes avec le pitch et les trois gestes) ; **« Revoir l'intro »** (absurde lorsque cette page EST l'introduction) ; les éléments décoratifs en surnombre. Ne pas ajouter « Musique/Oui » sur cet écran si aucun réglage existant ne le demande.

Sur Android, prévoir une page à hauteur naturelle et scroll si nécessaire, **sans blocage vertical**. L'objectif est de garder le CTA dans le premier viewport usuel **393×852**, mais jamais au prix d'une police minuscule ou d'une illustration écrasée. À **320×600**, une petite zone scrollable est acceptable ; ne jamais tronquer le bouton ni rendre les textes inaccessibles. Sur PC, respecter l'enveloppe extérieure commune **640 px** (SPEC 114) ; le texte et le visuel se recentrent sans occuper 100 % du viewport.

## 4. Copywriting final proposé

**Titre :** Ton prochain date sur Cringr.

**Contexte :** « Tu incarnes une femme qui cherche un rendez-vous sur Cringr. »

**Mission :** « Discute en luxembourgeois, cherche des indices et démasque les mensonges. »

**Étapes :**
- **Choisis** — un profil.
- **Discute** — en luxembourgeois.
- **Démasque** — les mensonges.

**CTA :** **Commencer →**

**Contraintes éditoriales :** langage français naturel, légèrement complice, pas de tutoiement forcé caricatural ; pas de déclaration selon laquelle *toutes* les paroles des prétendants seraient fausses : certains faits sont vrais, seuls certains sont des mensonges à prouver (SPEC 110). Ne pas écrire qu'un rendez-vous a déjà été fixé alors qu'aucun LIKE n'a été effectué. Éviter les instructions de gameplay trompeuses (« repère les red flags » uniquement à l'intuition).

Le titre peut être raccourci après recette Samsung si le visuel souffre, **sans perdre le nom Cringr**. Les textes sont des nœuds DOM, jamais intégrés à une image.

## 5. Règles de navigation et persistance

1. **Chaque entrée normale** RED FLAG depuis le hub Jeux affiche cet **écran d'accueil fixe**, à la manière de Lux Runner ; pas seulement la première fois. Ce choix **remplace** la V1 « une fois puis directement Cringr ». Il ne doit pas devenir un tutoriel rejoué de force.
2. **Commencer** passe directement à Cringr, sans seconde intro, sans animation, sans messagerie, sans appel au moteur de dossier, sans écriture de dislike/LIKE et sans perdre l'ordre ou la graine des profils.
3. **Retour** depuis l'accueil revient au hub Jeux ; sur Cringr, conserver la navigation actuelle de SPEC 113. Retour Android, navigateur et focus clavier cohérents.
4. Une ouverture répétée, un double clic Commencer ou un départ pendant chargement ne doit pas produire deux sélecteurs, deux musiques, deux sessions ou un profil généré différent.
5. **L'ancienne préférence `luxDemasquePrologueVuV1`** peut rester stockée pour compatibilité, mais **ne décide plus de l'affichage** de cet accueil ; ne pas migrer/supprimer de données utilisateur ni altérer `luxDemasqueResolus`, les records, seeds, `ldSwipeVu` ou les réglages audio.
6. L'ancienne action **« Revoir l'introduction »** devient inutile : retirer son contrôle visible **uniquement** avec l'abandon du prologue V1, sans faire disparaître des actions de Cringr ou de Rencontre. L'accueil est accessible depuis le hub à chaque fois.
7. Musique : ne pas introduire de nouvelle boucle ; le fond musical d'enquête de Cringr et les préférences `luxDemasqueSon` / `luxDemasqueMusique` restent respectés. Tout audio doit respecter le geste utilisateur / autoplay. Aucune ressource WebGL chargée **pour ce seul écran fixe**.
8. Si le chargement des profils échoue après Commencer : conserver l'état d'erreur et le bouton Réessayer existants de SPEC 113. L'intro statique ne doit pas bloquer Cringr.

## 6. Contrat technique : réutiliser, simplifier, supprimer le code mort

**État actuel observé sur `2.1` :** la V1 existe dans `public/lux-demasque.js` (`ldEntrerRedFlag`, `ldDemarrerPrologue`, `ldRendrePrologue`, phases `cinema/messages`, `ldTerminerPrologue`) et le moteur partagé `public/lux-match-3d.js` (service `prologue(...)`). Des CSS, tests et effets audio sont associés. **Ces éléments sont historiques, pas le design cible.**

- Réutiliser le point d'entrée **`ldEntrerRedFlag()`** et la vue `#view-luxdemasque`. Remplacer les phases cinématiques/messages par une unique phase **`accueil` / `preparation`** statique.
- Préserver `ldOuvrirSelection()` et `ldRendreSelection()` pour Cringr ; la SPEC 113 reste prioritaire **à partir du clic Commencer**.
- Réutiliser les composants visuels existants de l'application (titre, boutons, fond), notamment la logique de composition de `public/runner.css` comme **référence**, mais éviter les sélecteurs CSS globaux partagés susceptibles de casser Lux Runner.
- **Ne pas conserver des timers, un import Three.js, le système de skip, une messagerie inaccessible ou un état cinéma inutile** simplement pour minimiser la taille du diff : retirer proprement le code devenu orphelin **après audit des appels et des tests**, sans supprimer les services 3D utilisés par Lux Match, l'interrogatoire, les portraits et les preuves.
- Réduire les ressources inutiles du prologue V1 (scène, vibration, bruitages dédiés) **seulement** si leurs références sont exclusives à cette cinématique ; garder les méthodes audio partagées.
- Illustrer par une image 2D fixe **d'origine contrôlée** (rendu du modèle féminin existant avec le renderer déjà disponible durant la production, asset PNG/WebP optimisé, ou composition graphique originale). **Ne pas imposer à chaque utilisateur le chargement 3D pour dessiner l'écran d'accueil**. La création de l'illustration définitive devra être contrôlée visuellement avant livraison.
- Fallback : si l'image ne charge pas, une composition CSS statique conserve le titre, le contexte, les étapes et Commencer. Aucun écran noir.
- Ne modifier **aucun JSON d'enquête**, règle LU, score, sauvegarde, génération de dossiers, ni le jeu Lux Match.

## 7. Recette d'acceptation V2 (distincte des anciens PR-01 à PR-12)

| ID | Contrôle | Attendu |
|---|---|---|
| FIX-01 | Première entrée depuis Jeux | Accueil fixe complet, protagoniste féminine identifiable et contexte compris en quelques secondes |
| FIX-02 | Réouverture après une partie et après redémarrage | **Même accueil fixe** ; ancienne clé V1 n'empêche pas son affichage |
| FIX-03 | Action Commencer et double clic | **Un seul** sélecteur Cringr, aucun écran de messages, aucune cinématique |
| FIX-04 | Retour Android/navigation, depuis accueil puis Cringr | Retour correct, focus cohérent, aucune scène/son orphelin |
| FIX-05 | Image manquante, API de profils en erreur, stockage refusé | Contexte lisible, fallback, accès au Retry Cringr |
| FIX-06 | 320×600, 360×740, 393×852, 430×932 | Pas de débordement horizontal ni de CTA masqué ; texte et héroïne bien cadrés |
| FIX-07 | PC 768 / 1024 / 1440 px | Enveloppe 640 px, contraste et centrage corrects, aucune bordure de fond artificielle |
| FIX-08 | Texte 130/200 %, zoom, clavier/focus, reduced motion | Titres lisibles, action accessible, aucune animation imposée, navigation clavier valide |
| FIX-09 | LIKE/NOPE, portraits 3D, rencontre, déposition, nouvelle partie | Gameplay SPEC 110/113, graines, records et sons inchangés |
| FIX-10 | Lux Runner / Lux Match / WebGL partagé | Aucune régression causée par la suppression du service cinématique |

**À tester réellement** : tests Node/Playwright RED FLAG adaptés à la **V2**, `bash tools/test-lux-demasque.sh rapide` puis `complet`, tests de régression Lux Match et suites pertinentes du PLAYBOOK ; captures avant/après au minimum à 360, 393 et 430 px, plus PC ; **vrai Samsung pour validation visuelle**. L'ancienne suite `tests/test_lux_demasque_prologue.py` décrit la cinématique V1 et **doit être adaptée/remplacée** : son passage ou son échec n'est pas un verdict sur la V2.

**Qualité visuelle :** le rendu doit avoir l'air d'un écran de jeu conçu par une équipe, pas d'une infographie promotionnelle générée. Éviter trois systèmes de badges, surlignages et pictogrammes répétés ; garder des espaces respirants, une vraie héroïne et un parcours de lecture évident.

## 8. Ordre de réalisation

1. Auditer les dépendances du prologue V1 et figer les captures avant.
2. Construire **le seul écran statique**, valider les vrais textes et la disposition à 393×852 ; utiliser une illustration féminine optimisée et accessible.
3. Brancher Commencer vers le sélecteur existant, retirer progressivement les anciennes phases et leurs ressources **exclusives**.
4. Actualiser les tests (la V1 est désormais abandonnée), contrôler navigation/stockage/audio/erreurs.
5. Captures PC + mobile, CI dédiée, contrôle Samsung et validation produit ; documenter commits, tests et limites dans LD-049 **sans cocher avant accord**.

## 9. Hiérarchie et suivi

- **SPEC 115 V2 (ce document) = source normative pour l'écran d'entrée fixe.** Tous les passages de la V1 parlant de téléphone vibrant, zoom 3D ou messagerie sont **obsolètes et non à implémenter**.
- **SPEC 113** = source normative **uniquement pour la sélection Cringr** après Commencer ; garder carte, tampon LIKE/NOPE, croix et cœur.
- **SPEC 110** = enquête : moteur, personnages, dialogues LU, preuves FR, objections et scores.
- **SPEC 114 / charte UI §6 bis** = layout PC et compatibilité mobile.
- **LD-049**, suivi sur `main`, reste **ouverte** jusqu'à validation V2 sur Samsung. **LD-048 et LD-002.01 restent ouvertes et indépendantes.**
- La V2 est **une décision de remplacement** de l'implémentation V1 ; **codée et testée en Chromium le 31/10 (§ 11), pas encore approuvée sur appareil**.

## 10. Historique V1 — conservé pour traçabilité, non normatif

Le 31/10/2026, la SPEC 115 V1 « Le téléphone vibre » a été implémentée sur la branche `2.1` (code `ea3f774`) et une recette Chromium PR-01 à PR-12 a été documentée. Elle montrait un téléphone vibrant, une héroïne trois-quarts animée via `PickUp`, un zoom vers les messages, puis un CTA « Ouvrir Cringr ». Elle utilisait `luxDemasquePrologueVuV1`, une option de skip et un fallback 2D. **Le produit a ensuite rejeté le rendu animé et choisi l'écran d'accueil statique V2.** Les tests et captures de V1 restent historiques ; aucune de leurs validations ne s'applique automatiquement à V2. **Le remplacement est livré (§ 11) : ces fonctions, la scène 3D, les bruitages et le test V1 ont été retirés du code.**

## 12. Révision visuelle V3 — direction « illustration éditoriale » (31 octobre 2026)

**Constat produit :** la V2 est fonctionnelle, mais le rendu Samsung avec une illustration rectangulaire indépendante, suivie d'un paragraphe et d'une grille, paraît plus pauvre que le mockup de référence. Le joueur préfère la **qualité visuelle, la chaleur, l'expressivité et l'intégration du personnage dans la composition du premier mockup**. La V3 conserve la simplicité fonctionnelle de la V2 ; **aucun retour à la cinématique**.

### Décisions visuelles normatives

1. **Un seul bloc héro narratif :** titre, pitch et illustration composent une scène continue, **pas** trois rectangles empilés. Le texte reste en **HTML**, au-dessus du visuel ; l'image est décorativement fondue dans le fond violet/noir. Sur grand écran, texte à gauche, héroïne à droite ; à 320–393 px, conserver un espace de lecture dégagé, sans chevauchement du visage.
2. **Titre principal unique :** « Ton prochain date sur Cringr. » en serif ; Cringr en **rose**, sans kicker « TON PROCHAIN RENDEZ-VOUS » redondant. Le titre RED FLAG reste dans le bandeau de navigation.
3. **Pitch en deux phrases courtes :** « Tu incarnes une femme qui cherche un date. Discute en luxembourgeois, recueille des preuves et démasque les menteurs. » Ne jamais remplacer « preuves » par une simple intuition : c'est la mécanique centrale du jeu.
4. **Héroïne expressive :** visage féminin lisible, regard légèrement dubitatif ou amusé vers le téléphone, posture naturelle, tenue quotidienne. **Le rendu low-poly actuel n'est qu'un asset temporaire**, pas une validation de qualité artistique. Éviter les yeux blancs sans pupilles, la main incohérente et l'animation de prise de téléphone. Une illustration définitive de qualité comparable au mockup doit faire l'objet d'un **asset original autorisé**, optimisé (WebP), sans texte incrusté ni dépendance 3D au lancement.
5. **Ambiance :** intérieur nocturne rose/violet, lumière chaude, téléphone et éventuellement tasse ; profondeur douce sans halo excessif ni bord droit/inférieur rectangulaire. Préserver l'identité PS1/pixel et la sobriété de LuxApp ; ne pas transformer l'écran en publicité ou en illustration hyperréaliste.
6. **Conserver uniquement** les trois étapes simples « Choisis → Discute → Démasque » avec pictogrammes rétro, sans sous-cartes supplémentaires ou badges « A1–A2 » / « Dialogue et enquête ». **Un seul CTA or « Commencer »** ; pas de « Revoir l'intro ».
7. **Responsive :** sur 320×600, 360×740, 393×852, 430×932 et desktop 768/1440, vérifier que texte et visage ne se chevauchent pas ; le CTA reste atteignable, pas de débordement ni texte tronqué à 130/200 %. Les ajustements mobile peuvent modifier l'alignement de l'image sans modifier le fond ni la taille des cibles tactiles.

### Implémentation partielle poussée (code, non recette visuelle)

- `public/lux-demasque.js` : `.ld-accueil-hero` regroupe titre, pitch et illustration ; suppression du kicker et copy plus courte.
- `public/lux-demasque.css` : image positionnée et masquée en dégradé plutôt qu'isolée dans une vignette, texte à gauche et hiérarchie plus affirmée ; aucun changement des commandes ni du moteur.
- `public/index.html` : nouvelles versions de cache `?v=22` pour JS/CSS.
- Tests statiques et attentes Playwright de texte actualisés.

**Réserve produit majeure :** l'illustration `public/art/redflag-accueil.webp` **n'a pas été remplacée** dans cette passe ; elle reste le rendu low-poly existant. L'amélioration de l'expression du personnage et la qualité artistique du visuel **ne sont pas closes**. Aucune capture Samsung post-modification, aucun test Playwright effectif ni validation produit ne sont revendiqués par cette note. **LD-049 reste ouverte** ; ne pas réutiliser la recette Chromium V2 comme preuve de conformité V3.

## 11. Implémentation V2 du 31 octobre 2026 (Chromium ; Samsung non exécuté)

**Suivi :** LD-049 (TODO sur `main`), ouverte jusqu'à l'accord Samsung. SPEC 113 / LD-048 et LD-002.01 inchangées.

### Ce qui est codé

- **Entrée :** « Jouer » (hub) → `ldEntrerRedFlag()` → `ldRendreAccueil()`, **à chaque entrée**. Écran `data-ecran="accueil"` : en-tête commun (‹ Retour aux jeux, RED FLAG centré), kicker « TON PROCHAIN RENDEZ-VOUS », titre « Ton prochain date sur *Cringr*. » (serif, Cringr en rose), illustration, pitch exact du § 4, trois étapes **Choisis → Discute → Démasque** (pictogrammes pixel 8×8, chevrons décoratifs masqués aux lecteurs d'écran), CTA or **« Commencer → »** (54 px, en bas, comme Lux Runner). Aucun badge, « Revoir l'intro » ni réglage audio.
- **Commencer :** `ldAccueilCommencer()` → `ldOuvrirSelection({ focus: true })` : sélecteur SPEC 113 inchangé, premier profil et graine générés comme avant, carte focalisée ; un double appui n'ouvre qu'une fois (garde sur l'écran courant). (Nom distinct de `ldCommencer()`, qui démarre déjà le rendez-vous.)
- **Ressources :** l'accueil ne charge **ni 3D ni musique** ; il précharge seulement les profils (`ldChargerDonnees`). La boucle d'enquête démarre dans Cringr comme avant. Aucune mémoire « vu une fois » : `luxDemasquePrologueVuV1` peut rester stockée, elle n'est plus lue.
- **Illustration :** `public/art/redflag-accueil.webp` (720×504, 14 Ko) : héroïne `Casual3_Female` (Quaternius, CC0, déjà dans le dépôt) aux teintes RED FLAG, téléphone rose allumé avec notification, chambre de nuit (fenêtre et lune, table, lampe, tasse). **Rendu hors ligne** par `tools/red-flag/rendre-accueil.py` + `accueil-heroine.html` (Three.js et GLB du dépôt), rendu 360×252 agrandi sans lissage (style PS1). Bords fondus dans le fond ; hauteur `clamp(150px, 100svh − 520px, 294px)`. **Repli** si l'image manque : nuit violette et téléphone rose en CSS, textes et CTA intacts.
- **Retrait de la V1 :** `ldDemarrerPrologue`, `ldRendrePrologue`, `ldTerminerPrologue`, phases cinéma/messages, minuteurs, « Revoir l'introduction », état `ld.prologue`, service `prologue()` de `public/lux-match-3d.js`, bruitages « vibre »/« message » et CSS associés ; `tests/test_lux_demasque_prologue.py` remplacé par `tests/test_lux_demasque_accueil.py`. Services 3D partagés (Lux Match, interrogatoire, portraits, photos) et méthodes audio communes inchangés.
- **Tests existants** passant par « Jouer » : ils touchent désormais « Commencer » ; `test_lux_demasque_audio` vérifie en plus que l'accueil est silencieux.

### Recette exécutée (Chromium + SwiftShader)

`tests/test_lux_demasque_accueil.py` : FIX-01 (contenu exact, image 720 px avec texte alternatif, aucune requête 3D, silence), FIX-02 (accueil après Retour, après une partie et après rechargement ; clé V1 sans effet), FIX-03 (double appui → une ouverture, un rendu, premier profil, musique d'enquête), FIX-04 (Retour Android/navigateur et bouton ‹ depuis l'accueil et Cringr), FIX-05 (image 404 → repli ; API 500 → « Réessayer » ; stockage refusé), FIX-06/07 (320×600, 360×740, 393×852, 430×932, 768×1024, 1024×768, 1440×900 : zéro débordement, CTA dans le premier écran dès 740 px de haut, court défilement à 320×600, police ≥ 12 px, étapes non coupées, contenu ≤ 420 px centré), FIX-08 (Tab jusqu'au CTA, focus visible, Entrée → carte focalisée, mouvement réduit, zoom 130 % et 200 %), FIX-09 (LIKE → rencontre Milo, sauvegardes intactes), FIX-10 (Lux Match → RED FLAG sans canvas résiduel). Contrat statique V2 dans `test/lux-demasque-selection.test.cjs`.

### Non vérifié / limites

- **Samsung réel non exécuté** (lisibilité de l'illustration, barres système, Retour, police système agrandie).
- Lecteur d'écran réel non testé (structure DOM et textes alternatifs vérifiés).
- L'illustration reste un rendu low-poly des modèles existants : si le produit veut une héroïne plus expressive, il faudra un asset dédié (amélioration séparée, § 6).


## 13. V4 — Asset artistique original et composition proche du mockup (1er novembre 2026)

### Décision produit

Le joueur a explicitement rejeté le rendu Samsung V3 : la femme low-poly aux yeux blancs, la pièce vide, les grandes zones noires et le pitch plaqué sur le personnage. La référence est le **premier mockup produit**, avec héroïne adulte expressive, cheveux bruns attachés, pose dubitative accoudée à la table, lumière chaude et fenêtre donnant sur la ville nocturne. L'écran doit paraître conçu comme un **jeu narratif premium**, non comme une démonstration 3D de modèles existants.

**La V4 est normative pour l'art et la composition.** Ses fichiers sont implémentés mais le résultat doit encore être contrôlé en navigateur et sur Samsung : la qualité visuelle ne peut être déduite du seul CSS.

### Asset livré

- **Image autonome :** `public/art/redflag-hero-v4.webp`, **564 × 563 px**, WebP optimisé (**8,6 Ko**), créée pour LuxApp à partir du style visuel approuvé, avec une femme adulte, une tasse, un smartphone à cœur rose et une chambre de nuit ; **aucun mot, aucune icône UI ni bouton incrusté**. Blob Git : `b96e02a831905ec1ba499bb686dac5fb1a8c4cf6`. Le précédent rendu `redflag-accueil.webp` reste conservé pour traçabilité, mais n'est plus chargé sur l'accueil.
- La résolution intrinsèque **n'est pas du Full HD** : l'illustration fonctionne comme un élément pixel art de taille contrôlée (max ~400 px CSS mobile et PC). **Ne pas annoncer une illustration HD native pour un affichage plein écran**. Le portrait et ses contours doivent rester propres à la taille d'affichage réelle ; une variante 2× dédiée sera nécessaire si les tests DPI révèlent une perte de netteté sur Samsung à fort DPR ou une extension desktop au-delà de la largeur prévue.
- **Pas d'affiche complète** : titres, explications, étapes, badges de format et bouton sont des éléments DOM réactifs et accessibles ; l'image ne contient que le décor et l'héroïne.
- Respecter la licence des éléments internes déjà présents (les modèles Quaternius sont des références de moteur, mais cet asset a été généré comme nouvelle illustration ; ne pas prétendre qu'il est un export exact du GLB).

### Composition normative

1. **Header** : retour et titre RED FLAG pixel centré ; aucun nouveau bandeau.
2. **Héro** : gros titre serif « Ton prochain date sur *Cringr.* » ; le point doit être **à l'intérieur du `<em>` rose** pour ne jamais se retrouver seul à la ligne. Texte à gauche, portrait à droite, image masquée en fondu sur les côtés et le bas. Le visage reste visible, même sur 320–360 px.
3. **Copy court en deux encarts** : « Tu incarnes une femme qui rencontre des prétendants sur Cringr. » et « Ton objectif : découvrir leurs mensonges et les prouver. » Le texte ne doit pas cacher ses yeux ; l'ombre et le fondu servent le contraste, pas l'effet décoratif gratuit.
4. **Trois gestes** : « Choisis → Discute → Démasque », pictos arcade sur un **panneau unique** à contour violet discret. Sous-libellés existants conservés. Ne pas encombrer l'écran avec des cartes supplémentaires.
5. **Deux informations compactes** : « En luxembourgeois A1–A2 » et « Dialogue et enquête » sur de petites capsules ; elles peuvent disparaître à hauteur mobile courte pour préserver l'action.
6. **Un seul CTA** : bouton or « Commencer → », large et accessible. Pas de « Revoir l'intro », pas d'animation automatique, pas de 3D temps réel sur ce screen.
7. **PC** : enveloppe extérieure **640 px** selon SPEC 114, contenu de préparation centré à **560 px** maximum ; illustration bornée, sans image plein écran étirée ni rupture de fond.

### Fichiers et impacts

- `public/lux-demasque.js` : asset `redflag-hero-v4.webp?v=1`, deux paragraphes HTML, ponctuation et capsules ; la commande `ldAccueilCommencer` ouvre toujours Cringr.
- `public/lux-demasque.css` : composition portrait/texte, dégradés, étapes réunies en panneau, responsive, texte ≥12 px et suppression des capsules sur les fenêtres très courtes.
- `public/index.html` : cache `lux-demasque.css?v=23` et `lux-demasque.js?v=23`.
- Contrat Node et parcours Chromium `tests/test_lux_demasque_accueil.py` adaptés à la V4.
- Aucun changement des contenus des dossiers, du moteur de preuve, des scores, des sauvegardes ni de la navigation SPEC 113.

### Critères d'acceptation V4 (à vérifier, pas encore validés)

- Captures visuelles **320 × 600, 360 × 740, 393 × 852, 430 × 932, 768 × 1024 et 1440 × 900** : visage, titre et encarts lisibles, **aucun élément texte sur les yeux**, aucun débordement horizontal et CTA facilement atteignable.
- Affichage @2×/@3×, zoom du texte à 130 et 200 %, réduction des animations, contraste des encarts et lecture clavier/écran ; le titre ne peut pas isoler le point final.
- Vérifier les variantes d'image échouée / sans stockage / connexion en erreur, le bouton Commencer, le retour Android, les préférences audio, les profils générés, les scores et le renderer partagé.
- Exécuter `bash tools/test-lux-demasque.sh rapide`, `complet`, les tests Node ciblés et la suite critique du PLAYBOOK ; archiver les captures et **obtenir une validation explicite sur Samsung** avant de cocher LD-049.

**Statut réel à ce stade : code, illustration et documentation poussés ; verdict visuel Android et résultat des tests automatisés non revendiqués.**

## 14. V5 — Finitions de lisibilité sur Samsung (1er novembre 2026)

**Décision produit : conserver intégralement l'illustration V4 et la direction artistique.** La capture Samsung 393 px révèle cinq défauts de composition ; la V5 ne modifie ni l'asset, ni le sélecteur Cringr, ni le moteur de jeu.

1. **Titre sur trois lignes stables** : « Ton prochain » / « date sur » / « Cringr. ». Trois éléments inline HTML rendus chacun en ligne autonome, point dans le mot rose. La mise en forme doit éviter la ligne isolée « sur », sans tronquer à 320 px ni à zoom 200 %. Ne pas demander à l'illustration de fournir le titre.
2. **Visage dégagé** : pitch plus court sur deux paragraphes : « Tu incarnes une femme qui cherche un date. » et « Discute, trouve des preuves et démasque les mensonges. » Colonne de texte limitée à 47 % (48 % à 320–360, 43 % sur PC) et **léger fondu sombre derrière les paragraphes**. Les yeux ne doivent pas être couverts par les textes ; conserver le visage expressif, la tasse et le téléphone.
3. **Capsules rééquilibrées** : « Luxembourgeois · A1–A2 » / « Dialogue et enquête ». Conserver deux capsules équilibrées et centrées, sans retour « A1– / A2 » ; si la largeur est inférieure à 350 px, les disposer verticalement. N'ajouter aucun troisième badge.
4. **Panneau des étapes affiné** : conserver « Choisis / Discute / Démasque » mais réduire le padding vertical et les pictogrammes de 46 à 42 px. Sous-libellés « un profil » / « en LU » / « les mensonges » ; l'information « luxembourgeois » est déjà explicitement donnée dans le pitch et la capsule.
5. **CTA préservé** : rester en bas avec 54 px minimum de cible tactile et un léger dégagement inférieur (0–10 px selon hauteur), sans saut de layout, animation ni nouveau bouton.

**Implementation** : `public/lux-demasque.js` (titre structuré, microcopy, étapes et capsules), `public/lux-demasque.css` (largeurs, dégradé de protection, taille du panneau, fallback ≤350 px, espacement CTA), `public/index.html` (CSS/JS `v=24`), tests Node `test/lux-demasque-selection.test.cjs` et Playwright `tests/test_lux_demasque_accueil.py` mis à jour.

**Critères spécifiques V5** : à 320, 360, 393, 430 px et PC, vérifier absence de chevauchement visage/texte, sous-libellés sans mots isolés, capsules lisibles, largeur et centrage cohérents, CTA atteignable et accessible ; avec texte agrandi 130/200 %, éviter tout débordement. Tests à exécuter et validation Samsung **non revendiqués avant confirmation effective**. LD-049 reste ouverte.

## 15. V6 — Simplification éditoriale et illustration nettoyée (1er novembre 2026)

**Décision produit :** supprimer les informations répétitives au lieu de les déplacer. La V6 complète et prime sur V5 (§14), sans changer le titre, les deux paragraphes, la scène, le sélecteur ni le moteur.

- **Supprimer totalement les deux capsules** « Luxembourgeois · A1–A2 » et « Dialogue et enquête » : ne les afficher ni sur mobile ni sur PC, même lorsque la hauteur permettrait de les conserver. Les trois étapes portent déjà l'objectif du jeu.
- **Conserver l'illustration V4 d'origine** comme référence artistique, mais **masquer le cœur décoratif sur la tasse uniquement**. Le cœur du téléphone doit rester visible. L'asset de présentation `public/art/redflag-hero-v6.svg` réutilise en embarqué l'image WebP de V4 et ajoute une retouche localisée aux couleurs de la céramique ; il ne remplace pas l'héroïne, ne change pas ses expressions et ne fait aucun appel réseau externe. L'original `redflag-hero-v4.webp` reste disponible pour comparaison. Ce montage SVG doit être **testé sur navigateur Samsung / PWA** avant clôture, notamment la prise en charge de l'image WebP embarquée, la propreté de la retouche et la compatibilité du mode image. Une conversion du composite vers un WebP final reste préférable si l'intégration révèle des défauts.
- **Remplacer le fond découpé derrière les paragraphes** : supprimer `.ld-accueil-pitch::before` et poser un seul dégradé sombre **sur toute la scène** (`.ld-accueil-hero::after`), progressif de gauche à droite. Ce voile se superpose au visuel, mais passe derrière les textes, sans bande horizontale ni rectangle opaque. Garantir le contraste du texte à gauche et la visibilité du visage à droite.
- **Rééquilibrer verticalement sans nouveaux composants** : la zone héro prend une hauteur flexible `clamp(350px, 50svh, 455px)` (335 px à ≤360 px et 430 px sur desktop) ; les trois étapes et le CTA « Commencer » restent présents, espacés dans la colonne. Aucun nouveau badge, carte, bouton ou tutoriel.
- **Garder les règles existantes** : écran d'accueil à chaque entrée, `Commencer` vers Cringr, pas d'animation 3D, pas d'écriture de scores/progression, navigation Android et accessibilité inchangées.

### Modifications et recette

Fichiers : `public/lux-demasque.js` (suppression capsules + image V6), `public/lux-demasque.css` (fondu global, retrait du CSS des badges, hauteur de la scène), `public/art/redflag-hero-v6.svg`, `public/index.html` (cache `?v=25`), `test/lux-demasque-selection.test.cjs` et `tests/test_lux_demasque_accueil.py`. Le WebP V4 reste conservé intact.

**Recette obligatoire avant validation LD-049** : captures 320×600 / 360×740 / 393×852 / 430×932, plus 768×1024 et 1440×900 ; aucune capsule, aucun fond rectangulaire derrière le pitch, tasse unie sans cœur (le téléphone conserve le sien), visuel complet, CTA accessible, pas de débordement au zoom 130/200 %. Tester une image bloquée pour le fallback. Exécuter les tests Node/Playwright et la suite dédiée, sans déclarer verte une recette non passée. **Validation manuelle Samsung nécessaire** pour l'intégration SVG et la finesse de la retouche.


## 16. V7 — Composition verticale continue et tasse régénérée (1er novembre 2026)

**Décision produit : réduire le vide structurel et supprimer les démarcations restantes.** Conserver l'identité artistique, les textes et les composants. Cette passe remplace la retouche SVG V6 par une vraie régénération de l'image, avec tasse unie et cœur du téléphone conservé.

### Contrat de composition

1. **Une hauteur guidée par le contenu.** `.ld-accueil` ne doit plus remplir artificiellement le viewport ; retirer sa croissance flex et la marge automatique du CTA. En grand écran comme sur mobile, conserver **16 px entre le panneau étapes et Commencer**, tolérance de recette 12–24 px. Les trois blocs se suivent dans le flux ; aucun CTA fixe ou absolu.
2. **Une ambiance continue.** Le halo appartient à l'ensemble de la composition, pas à un rectangle héro. Le voile latéral de protection du texte se dissout verticalement ; le visuel se prolonge de 48 px derrière le début des étapes. Masques progressifs sur les côtés et le bas : aucune bordure droite ou fin de fond opaque derrière les paragraphes.
3. **Un pont visuel.** Conserver l'unique panneau « Choisis / Discute / Démasque », avec un padding vertical de 12 px et une surface violette discrète. Aucune sous-carte, capsule ou information supplémentaire.
4. **PC.** Shell 640 px, contenu 560 px ; héro de 450 px, puis étapes et CTA proches. L'espace résiduel se situe après le groupe complet, sans isoler son bouton au bas d'un écran de 1080 px.
5. **Petits écrans et accessibilité.** Cibles ≥54 px pour Commencer ; défilement naturel autorisé à 320×600 ; bouton dans le premier viewport aux tailles usuelles dès 740 px de hauteur. Textes entiers, image manquante sans blocage, clavier et zoom 130/200 % vérifiés en navigateur. La police système et l'IME Samsung ne sont pas validés par cette simulation.

### Illustration de production

`public/art/redflag-hero-v7.webp` : **1254×1254 px, 73 890 octets**, régénérée avec le générateur d'images intégré depuis la V4, puis encodée WebP (qualité 88). Même scène, héroïne, expression, lumière et téléphone ; **tasse sans cœur**, téléphone avec cœur rose. Aucun texte ni bouton dans l'image, aucun cache céramique en SVG à l'exécution. Les assets V4/V6 restent historiques et ne sont plus chargés par cet écran. [Provenance et prompt](../red-flag/SPEC-115-V7-RECETTE.md#illustration-et-provenance).

### Livraison et limites

CSS/JS `v=26` ; changements limités au layout d'accueil et à sa référence d'image. Mesure avant/après sur huit tailles : **16 px** de séparation étapes/CTA au lieu de **12 à 385 px**. Tests statiques, navigateur fonctionnel, mouvement réduit, focus, erreurs et image 404 exécutés. La suite dédiée complète passe **12 blocs sur 13** : l'échec audio `PIX_KYOTO` est reproduit sur la référence `6feb2db`. Détails dans la [recette](../red-flag/SPEC-115-V7-RECETTE.md).

**LD-049 reste ouverte jusqu'à revue réelle Samsung et accord Produit.** LD-048, Rencontre/LD-002.01, audio, preuves, scores, graines et sauvegardes restent hors du changement. Ne pas déduire une validation du jeu complet du seul passage de la composition V7.

## 17. V8 — CTA en bas comme Lux Runner, ambiance unifiée (1er novembre 2026)

**Décision produit (capture PC RED FLAG/Lux Runner)** : revenir à l'ancrage en bas du bouton principal, **comme Lux Runner**, et ne conserver qu'un dégradé de fond continu jusqu'au pied de l'écran. Cette décision **remplace la règle V7** « 12–24 px entre étapes et CTA » : le grand intervalle entre étapes et footer est désormais **intentionnel**, à condition que le CTA soit aligné en bas comme sur l'autre jeu.

### Règles normatives

1. **Structure** : `#view-luxdemasque .ld-jeu` reste le shell flex vertical plein viewport ; la section `.ld-accueil` reprend `flex:1 1 auto`, et le seul CTA `.ld-accueil-commencer` utilise `margin-top:auto` (avec marge horizontale/basse nulle). Sa position basse découle de la mise en page, **sans `position:fixed` ou `absolute`**. Sur un petit écran où le contenu dépasse, conserver un défilement naturel, sans chevauchement.
2. **Fond unique** : le fond violet/noir appartient à la vue RED FLAG `#view-luxdemasque` sur mobile, et au `body` plein viewport sur PC via `jeux-univers.css` (les règles existantes restent intactes). Le halo local `background:radial-gradient(...)` de `.ld-accueil` est **supprimé** : `background:transparent`. Les fondus du portrait et le voile de lisibilité des textes restent progressifs et **ne constituent plus un cadre autonome autour des sections**.
3. **Constance** : illustration V7, titre, pitch, panneau Choisis/Discute/Démasque et CTA or conservés tels quels. Aucune carte, capsule ni action nouvelle. Le sélecteur SPEC 113 et les données utilisateurs restent inchangés.
4. **Écrans** : sur 360×740, 393×852, 430×932, 768×1024, 1440×900 et 1920×1080, le bas du CTA doit se situer dans les **40 px du bas du viewport** lorsqu'il n'y a pas de scroll et sa cible tactile rester ≥54 px. À 320×600 et au zoom 130/200 %, le scroll naturel est admis ; ne jamais couper les textes ou le bouton. Le contenu horizontal reste dans les enveloppes SPEC 114 (PC 640 px, intérieur ≤560 px).
5. **Non-régression** : retour Android, accueil réaffiché, navigation clavier/focus, son, scores, sauvegardes, portraits et swipe Cringr inchangés.

### Code et contrôle

- `public/lux-demasque.css` : croissance flex de l'accueil, retour de la marge automatique sur Commencer, suppression du fond local ; conserve le dégradé global de la vue.
- `public/index.html` : `lux-demasque.css?v=27` pour invalider le cache.
- `test/lux-demasque-selection.test.cjs` : contrat statique V8 ; `tests/test_lux_demasque_accueil_v7.py` : assertions V8 sur l'alignement du footer et l'absence de halo local (fichier historique conservé pour éviter de casser les appels existants).

**État : code/documentation poussés, recette visuelle Samsung non validée.** Ne pas réutiliser l'assertion d'écart V7 comme référence de validation V8. LD-049 reste ouverte jusqu'à validation produit.
