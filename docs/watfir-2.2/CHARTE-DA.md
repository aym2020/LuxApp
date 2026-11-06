# Charte de direction artistique — Watfir / LuxApp 2.2

**Version** 2.2 · 2026-11-06 · **Statut** : DA Watfir **active sur l'accueil et le portail de bienvenue de la branche `2.2`** ; formulaires de compte et autres écrans non encore harmonisés. Références d'implémentation : [BOUTONS-3D.md](BOUTONS-3D.md) (boutons), [HOVER-SYSTEM.md](HOVER-SYSTEM.md) (survols), [ASSETS.md](ASSETS.md) (fichiers graphiques), [IMPLEMENTATION.md](IMPLEMENTATION.md) § 18 (historique du 05–06/11/2026). Les tests Samsung physique restent à effectuer.

> **Historique de la version 1.2 (remplacé par Mission V6)** : un seul dessin du monument (logo, icône, favicon) ; hero sans monument (« Moien! » + bouton Écouter + rubans) ; un seul rouge et un seul bleu à l'écran ; Étudier rouge vif et Jouer cyan à texte noir ; accueil PC à 640 px comme les autres pages ; appui des boutons 3D complet même en « animations réduites ».

> **Version 2.2 (06/11/2026, soir) — Moien V7 (§31)** : le hero « Mission A1.1 » est remplacé par **« Moien, prénom! »** (prénom facultatif saisi dans Réglages, sinon « Moien! ») avec le bouton Écouter ; rubans en **plongée** plus vivants ; la mission de la leçon passe dans Commencer avec son titre luxembourgeois ; Étudier/Jouer gardent leurs couleurs mais sont plus bas (58 px) ; Commencer et Étudier/Jouer forment un groupe en bas ; « Ton objectif actuel » n'apparaît qu'après une première pratique.

## 1. Intention

Créer une application d'apprentissage du luxembourgeois immédiatement identifiable : une esthétique d'identités télévisuelles et touristiques des années 1975–1985, **réinterprétée pour une interface moderne, mobile-first et très lisible**. Inspiration revendiquée : le travail de kxdgraphics (logos de lieux réimaginés en 1984 : fond noir, emblème simple, bandes de couleur, couleurs tirées du sujet). Le but n'est ni un jeu néon, ni une imitation littérale d'un logo existant, ni un filtre VHS sur toute l'application.

Le langage graphique repose sur quatre idées complémentaires :

1. **Des couleurs qui viennent du sujet** : noir, crème, rouge et cyan reprennent presque exactement le drapeau luxembourgeois (rouge, blanc, bleu ciel). Aucune couleur n'est décorative ou choisie au hasard.
2. **Un repère géographique réduit à un signe, dessiné une seule fois** : une tour à flèche au-dessus d'un pont à trois arches. Ce même dessin sert au logo du header, à l'icône de l'app et au favicon ; il n'en existe pas de seconde version.
3. **Des rubans identitaires rouge et cyan** : deux bandes d'épaisseur homogène qui partent du bord gauche de l'écran, plongent sous le salut puis remontent franchement vers la droite (forme « plongée »). Elles donnent le rythme du hero.
4. **Deux familles typographiques** : Fraunces 900 italic pour la marque Watfir **et pour les mots luxembourgeois mis en avant** (« Moien », titre luxembourgeois de la leçon dans Commencer) ; Inter pour toute l'interface.

Précision éditoriale : les essais « carte postale synthwave », coucher de soleil tranché, multiples bâtiments, néons excessifs, dégradés arc-en-ciel, pictogrammes décoratifs et monument géant dans le hero **ont été écartés**. La version cible est **épurée**.

## 2. Palette et rôle des couleurs

Les valeurs suivantes sont les **tokens de marque de l'accueil `2.2`**, définis dans `public/accueil-watfir.css`.

| Token 2.2 | Hex | Rôle |
| --- | --- | --- |
| `--wf-bg` | `#080808` | Fond quasi noir, continu, sans faux panneaux. Texte et picto de Jouer. |
| `--wf-cream` | `#F7E9C2` | Marque, titres, icônes neutres, **CTA principal**, texte sur rouge |
| `--wf-red` | `#F22421` | **Le seul rouge** : ruban, « ! » du salut, bouton Étudier, pastille de niveau actif, flamme de série |
| `--wf-cyan` | `#02C5E7` | **Le seul bleu** : ruban, bouton Écouter, bouton Jouer, survols PC (Connexion, réglages) |
| `--wf-red-texte` | `#C81E1B` | Niveau courant dans la feuille des niveaux uniquement (4,75:1) |
| `--wf-secondary` | `#BEB6A6` | Texte explicatif non essentiel, sous-titre « Lëtzebuergesch » du logo |
| `--wf-track` | `#3C3934` | Barre de progression inactive, filets discrets |
| `--wf-ink` | `#080808` | Texte sur bouton crème |
| `--wf-success` | `#54E0AD` | Succès pédagogique, **pas** bleu ou rouge |
| `--wf-error` | `#EF7A73` | Correction erreur / alerte sémantique |
| `--wf-info` | `#6FB0F2` | Informations pédagogiques et examen |

**Règle « un rouge, un bleu » (06/11/2026)** : à l'écran, il n'existe qu'un rouge (`#F22421`) et qu'un bleu (`#02C5E7`), chacun accompagné de sa seule tranche plus sombre pour le relief (`#8F1712` sous le rouge, `#087496` sous le cyan). Aucune variante intermédiaire (anciens `#D3232B`, `#087496` en face, etc.).

**Répartition visuelle sur l'accueil** : le noir domine, le crème structure la lecture et le CTA principal. Le rouge et le cyan restent les signes identitaires du hero ; les deux seules grandes surfaces colorées sont **Étudier** (rouge, texte crème) et **Jouer** (cyan, texte noir). Cette hiérarchie n'autorise pas à colorer tous les boutons de tous les écrans.

**Contraste** :
- Crème sur rouge `#F22421` = **3,44:1** : conforme pour un grand texte (≥ 18,66 px gras, seuil 3:1), donc pour Étudier (libellé ≥ 19 px). Sur la pastille de niveau actif (14 px), c'est **sous** le seuil de 4,5:1 : écart assumé, à reconsidérer si l'accessibilité devient prioritaire (texte noir sur rouge = 4,8:1).
- Noir sur cyan `#02C5E7` = **9,7:1** : Jouer porte du noir, jamais du crème.
- Un survol ne doit jamais faire passer un texte sous son seuil (survol d'Étudier `#FF2F2A` = 3,06:1).

Le rouge de marque `--wf-red` n'est pas le rouge d'erreur `--wf-error`. Un état d'erreur exige un libellé ou une icône et un contraste explicite. Ne jamais coder uniquement par la couleur.

## 3. Typographie — Moien V7

- **Watfir (portail et header)** : Fraunces 900 italic auto-hébergée, famille CSS `Watfir Logo` ; le logo existant est conservé.
- **Tous les autres textes des deux écrans** : Inter / system-ui / sans-serif. Le sous-titre « Lëtzebuergesch » du header quitte Roboto Condensed ; le portail utilisait déjà Inter. Boutons, progression, niveaux, navigation et descriptions ne changent pas de style.
- **Salut du hero** : « Moien, » puis le prénom sur une seconde ligne, en Fraunces 900 italique crème (`clamp(48px, calc(150 * var(--k)), 72px)`), « ! » rouge `#F22421`. Prénom de 10 à 14 caractères : `.wf-salut-s` (max 60 px) ; 15 caractères et plus : `.wf-salut-xs` (max 46 px). Prénom limité à 20 caractères, échappé. Dessous : « Bonjour, prénom. » (Inter 700) et une phrase en crème atténué (Inter 400, 13 px min.). L'ancien titre « MISSION A1.1 » (Inter 800) est retiré.
- **Surtitres** : petites capitales avec `letter-spacing:.18em` et plancher de 12 px sur les textes utiles (« Ton objectif actuel »). Le hero n'a plus de surtitre. Exception : « Lëtzebuergesch » et connexion du header, réduits pour préserver la disposition Android.
- **Anciennes fontes** : Playfair Display et Roboto Condensed ne sont plus chargées sur l'accueil ; leurs fichiers restent dans le dépôt à titre de compatibilité. Ce contrat ne concerne pas encore les jeux et écrans pédagogiques 2.1.

## 4. Géométrie et iconographie

### 4.1 Le monument (un seul dessin)

Une tour à flèche allongée, trois fenêtres évidées, une toiture rectiligne et un pont à **trois arches identiques** (même largeur, même courbe, piles régulières). Sans marches, pierres, arbres, silhouettes supplémentaires ni soleil.

- **Logo du header** : `public/art/watfir-logo-v4.svg`, emblème 80 × 100. La tour crème passe **devant** deux bandes cyan (haut) et rouge (bas), avec un fin détourage noir là où elle croise les bandes ; toiture et pont en dessous. Lisible dès 24–32 px.
- **Icône de l'app, icône Apple, favicon** : le même emblème, centré sur fond noir, avec des bandes **plus épaisses** et prolongées jusqu'aux bords pour l'impact à petite taille. Version « any » dans un carré arrondi au liseré crème ; version « maskable » à fond plein, emblème dans la zone sûre. Sources : `docs/watfir-2.2/assets/watfir-icon-app*.svg`.
- **Interdit** : redessiner une autre version du monument (hero illustré, silhouette différente, autre pont). Le grand dessin du hero V4 est archivé (`docs/watfir-2.2/assets/watfir-hero-v4.svg`), il ne sert plus.

### 4.2 Rubans

Deux bandes continues, rouge au-dessus et cyan en dessous, d'épaisseur identique, séparées par du noir. **Même trait à l'écran que les rubans du portail (§32)** : ≈ 20 px d'épaisseur et ≈ 35 px de décalage à 412 px (≈ 15 px de noir entre les deux), soit `stroke-width:46` et `translate(0, 81px)` dans le viewBox 941 × 260 de l'accueil ; sur PC, `stroke-width:30` et `translate(0, 52px)` (≈ 20 et 35 px, comme le portail plafonné). Forme **« plongée »** : `M-20 20C150 20 230 131 420 131S690 125 800 59S900 2 961 8`, le cyan suit exactement le rouge. Elles partent du bord gauche de l'écran, plongent sous le salut et remontent jusqu'au bord droit ; sur PC, elles s'arrêtent aux bords de la colonne de 640 px. Rapport largeur/hauteur toujours conservé. Formes « vague » et « drapeau » étudiées et écartées. Aucun éclatement en sept couleurs, aucune répétition dans les cartes.

### 4.3 Icônes

Trait de poids optique cohérent. Étudier : livre au trait **crème** ; Jouer : manette au trait **noir** (sur cyan). Le bouton principal Commencer/Continuer n'a **pas** de livre : son texte et sa flèche suffisent. Réglages : roue au trait crème. Cibles tactiles d'au moins 44–48 px, sans chevauchement.

### 4.4 Surfaces

Fond noir libre autour des composants ; un CTA crème de premier niveau et deux boutons secondaires centrés (Étudier rouge / Jouer cyan). Les reliefs sont de véritables **tranches d'ombre hors flux**, pas des doubles cartes. Pas de contour animé rouge, ni d'ombre néon. Le CTA crème est **uni, sans bandes d'angle** ; les rubans identitaires rouge/cyan restent exclusivement dans le hero et les emblèmes.

**Finition 3D transverse (06/11/2026) :** la tranche est une nuance **plus foncée de la face**, jamais une bande blanche ou crème sous les faces rouge/cyan. Étudier : tranche bordeaux `#8F1712` ; Jouer : tranche bleu pétrole `#087496`. Les deux faces colorées reçoivent uniquement un **reflet supérieur de 1 px**, `inset 0 1px 0 rgba(255,255,255,.28)`, sans bordure crème décorative. Les deux « Commencer » conservent leur face crème unie et partagent la **même teinte de tranche beige `#AA8954`** (profondeur 7 px pour la carte de leçon, 6 px pour le portail). « Créer un compte » adopte une tranche beige sombre `#796646`, reflet crème léger de 1 px, hauteur et rayon identiques à « Commencer » sur le portail. La transition physique reste 115 ms et l'enfoncement perceptible 160 ms avant navigation ; ne pas ajouter de fausse semelle claire. Voir [BOUTONS-3D.md](BOUTONS-3D.md).

**Rayons unifiés des actions de marque (06/11/2026, `2.2`) :** les grands boutons « Commencer / Continuer » de l'accueil et « Commencer / Créer un compte » du portail partagent désormais **17 px** de `border-radius`. Les deux choix « Étudier / Jouer » partagent **14 px**. Ce sont des valeurs fixes, identiques de 320 px à 640 px de largeur, pour éviter que la formule issue de la maquette (`--k`) produise des rayons différents sur les deux écrans. Les pastilles A1.1/A1.2/chevron conservent leur géométrie spécifique ; l'ancien bouton audio a été retiré. Ne changer ni dimensions, ni tranches 3D, ni appui, ni couleurs, ni cibles tactiles. CSS : `public/accueil-watfir.css`; le portail était déjà à 17 px. Voir [BOUTONS-3D.md](BOUTONS-3D.md) et [IMPLEMENTATION.md §22](IMPLEMENTATION.md#22-harmonisation-des-rayons-des-boutons-06112026).

## 5. Rythme, densité et hiérarchie

Ordre de lecture sur l'accueil : **marque + niveaux + compte** → **hero** (Moien + prénom, Écouter, rubans) → **objectif réel** (seulement après une première pratique) → **Commencer/Continuer** → **Étudier et Jouer**, ces deux derniers formant **un seul groupe** en bas de l'écran. Le parcours, les révisions, les examens et les erreurs sont accessibles depuis la feuille « Étudier », et non comme quatre boutons concurrents.

Une seule action dominante à l'écran. Le hero est expressif mais ne doit jamais repousser le CTA hors de l'écran à cause d'une hauteur fixe.

**Dimensions** : toutes les mesures viennent de la maquette via une unité unique `--k = min(100vw, var(--layout-shell, 640px)) / 941`. Sur mobile, l'accueil suit la largeur de l'écran ; sur PC, il est centré à **640 px, comme toutes les autres pages** (`--layout-shell`). Sous environ 850 px de hauteur utile, l'accueil défile légèrement pour atteindre Étudier et Jouer.

Échelle d'espacement de départ `4/8/12/16/24/32px`, adaptée au rendu réel. Éviter les trous verticaux artificiels et le positionnement absolu du CTA à une coordonnée calculée pour une capture.

## 6. Composants et règles

### 6.1 Header

**Rythme vertical — règle active §31 (06/11/2026, remplace §29) :** header ancré en haut ; puis `minmax(var(--wf-section-min),.8fr)` avant le hero, `1fr` avant l'objectif et avant Commencer, **20 px fixes entre Commencer et Étudier/Jouer**, marge basse `clamp(28px,5svh,48px)`. Le groupe d'actions reste donc en bas, près du pouce, et la hauteur libre se répartit au-dessus. Premier accueil (`.wf-sans-bilan`, aucun objectif affiché) : les rangées de l'objectif valent 0. [Implémentation §31](IMPLEMENTATION.md#31-hero-moien-prénom-rubans-en-plongée-et-groupe-dactions-06112026).

**Header mobile — règle en vigueur (§26, 06/11/2026) :** à largeur Samsung usuelle, **une seule rangée** avec Watfir, A1.1/A1.2/chevron et le compte. La grille utilise `max-content max-content minmax(0,1fr)` : toute la largeur souple se trouve **après les niveaux**, avant « Mode invité / Connexion / réglages ». Le lien Connexion et la roue disposent également d'un écart distinct. Le sous-titre « Lëtzebuergesch » du petit header est masqué sur mobile seulement, car redondant avec la présentation de la langue dans le hero ; le logo Watfir et les textes fonctionnels restent lisibles. Sous 360 px CSS, niveau actif et chevron restent visibles sur la même ligne ; les autres niveaux sont disponibles dans le sélecteur. Sous 260 px CSS (zoom très élevé), l'accessibilité prime et trois rangées sont permises. **Pas de deuxième rangée sur les Samsung courants ni de compression forcée des textes.** Voir [IMPLEMENTATION §26](IMPLEMENTATION.md#26-header-mobile--une-ligne-de-lespace-apres-les-niveaux-06112026). Contrôles de composant Chromium effectués ; recette sur Samsung réel encore nécessaire.

**Header et rythme PC — règle en vigueur (§30, rythme mis à jour §31) :** au-delà de 540 px, même grille à une ligne (`marque niveaux compte`), « Lëtzebuergesch » visible, filet masqué ; le compte invité ne passe jamais à la ligne. Verticalement : header en haut, espaces identiques `minmax(28px,72px)` entre header, hero, objectif et Commencer, puis **20 px entre Commencer et Étudier/Jouer**, reste de la hauteur en bas. [Implémentation §30](IMPLEMENTATION.md#30-header-et-espacements-de-laccueil-sur-pc-06112026).

Logo (emblème + « Watfir » + « Lëtzebuergesch ») avec un espace franc entre l'emblème et le texte (plus de marges négatives) ; largeur de la marque plafonnée pour que le header tienne sur une ligne à 412 px avec « Mode invité / Connexion ». Survol PC : « Connexion » passe au cyan ; la roue des réglages fait un quart de tour (90°) avec léger rebond et passe au cyan.

### 6.2 Hero

**Moien V7 (§31) :** « Moien, Clayton! » sur deux lignes (ou « Moien! » sans prénom), bouton Écouter cyan 3D (`jouerAudio('moien.mp3')`, jamais en lecture automatique, 44 px min.), puis « Bonjour, prénom. » et une phrase : « Ton premier mot. Le reste commence ici. » au premier accueil, « Prêt pour ta mission ? » ensuite. Rubans en plongée dessous. Le **prénom** est facultatif : carte « Ton prénom » en tête des Réglages, rangé dans le choix synchronisé (`choix.prenom = { valeur, maj }`, fusion « le plus récent gagne »), vide = retiré. Le monument reste uniquement dans le logo. L'ancien hero « MISSION A1.1 » est retiré : le niveau reste visible dans la pastille du header.

### 6.3 Bouton principal

Fond crème `#fbebc5`, texte noir, **sans livre**. **Deux lignes seulement (§32)** : « Commencer » ou « Continuer » (Inter 800, 34 px max.), puis le **titre luxembourgeois de la leçon** en Fraunces italique suivi de sa traduction en Inter regular (« *Déi éischt Schrëtt* · Les bases » ; repli « Leçon N · titre »). La mission et l'étape ne sont plus affichées : elles restent dans le nom accessible, qui commence par le texte visible. À droite, un **rond noir avec chevron crème** (46–64 px). L'action (`commencer()` / `suivreProchainPas()`) et l'étape restent celles de 2.1 ; le nom accessible reprend le texte visible. Tranche beige de 7 px, enfoncement de 6 px, état maintenu 160 ms avant une navigation déclenchée par clic utilisateur ; survol PC : face crème `#fff4da` **sans soulèvement**. Aucune bande rouge/cyan dans le bouton : **face crème unie identique au portail**.

### 6.4 Niveaux A1.1/A1.2 et familles futures

Deux pastilles maximum dans le header, **actif rouge vif `#F22421` / crème** et inactif fond noir / filet crème ; le chevron est la troisième commande 3D. Relief de 2 à 4 px selon `--k`, tranche beige sombre ou rouge sombre, enfoncement de `depth - 1px` et maintien 160 ms avant sélection ou ouverture de la feuille. Filet `::before` et cibles tactiles `::after` préservés. Pour A2.1/A2.2, B1.1/B1.2, etc., le chevron ouvre un bottom sheet groupé par familles et limité aux niveaux disponibles. Sous 360 px, le header peut se replier sur deux rangées sans compresser la marque.

### 6.5 Progression

En-tête « TON OBJECTIF ACTUEL », pourcentage du **niveau actif** et série selon calcul réel. Barre très fine avec piste foncée. **Masqué au premier accueil** (aucune pratique) : on n'accueille pas avec « 0% · 0 jours ». Ne pas confondre progression du niveau et « Aujourd'hui ».

### 6.6 Accès secondaires

Deux boutons **centrés, côte à côte**, sans titre : **Étudier** (`#F22421`, tranche `#8F1712`, texte et picto crème, survol `#FF2F2A`) et **Jouer** (`#02C5E7`, tranche `#087496`, texte et picto noirs, survol `#3FD6F0`). Relief 5 px, enfoncement 4 px maintenu 160 ms avant activation ; au survol PC, seule la face s'éclaircit. Étudier ouvre un bottom sheet **Les leçons / S'entraîner / Examens / Mes erreurs** ; Jouer ouvre les mini-jeux. **Hauteur 58 px depuis §31** (au lieu de 76–96 px) : ils gardent leurs couleurs mais laissent la première place à Commencer ; cible tactile > 48 px, libellé 19–22 px. Voir [BOUTONS-3D.md](BOUTONS-3D.md).

### 6.7 États

Définir au minimum : chargement, progression nulle, aucune leçon reprenable, niveau indisponible, invité et connecté, série zéro, hors ligne, retour depuis chemin, message d'erreur. Aucun raccourci ne doit sembler disponible s'il ne fonctionne pas.

### 6.8 Premier écran — portail de bienvenue (06/11/2026)

**Typographie du mot-symbole :** Fraunces 900 italic (même fonte que le header), `font-kerning:normal`, **`letter-spacing:0`**, aucune ombre portée. Ne pas resserrer artificiellement les glyphes : à grande taille, `-0.075em` collait les lettres et donnait une impression de dessin « baveux » sur Android. La forme de la fonte est conservée. La lisibilité à l'écran prime sur une compaction décorative.

**La page de bienvenue n'est pas une version simplifiée de l'accueil.** C'est une affiche éditoriale sans slogan, sans paragraphe marketing et sans succession de trois bénéfices numérotés. La marque **Watfir** est le seul titre, en Fraunces 900 italic crème, suivie des rubans rouge/cyan en SVG et de « Lëtzebuergesch » en petites capitales comme désignation de la langue. Pas de monument démesuré, pas de pictos génériques, pas de carte « Moien! » ni d'audio : l'accueil utilise désormais une mission de niveau plutôt qu'un mot à écouter.

**Actions :** C’est parti (CTA **crème uni** 3D, texte centré sans chevron, sans bande de coin, tranche beige 6 px, appui 5 px maintenu 160 ms), Créer un compte (surface sombre, bord crème, **tranche 3D de 6 px, appui 5 px maintenu 160 ms**), Se connecter (lien). Les deux boutons 3D ont la même hauteur minimum (70 px), le même rayon (17 px) et la même géométrie. Ces actions préservent `guest`, `signup` et `signin`, et les formulaires conservent les composants 2.1. Seule la présentation du mode `welcome` est migrée. La feuille `portail-watfir.css` est isolée sous `.wf-portail-bienvenue`; le fond noir remplace le dégradé doré sur cette seule vue.

**Écrans courts, zoom et accessibilité :** l'affiche se réduit mais ne pousse pas les CTA hors d'une zone défilable ; 320–360 px et petits écrans Android doivent être vérifiés. Hover PC = éclaircissement sans glissement. En réduction des animations, le bouton reste physiquement enfonçable instantanément sans délai de navigation. Référence : [PORTAIL-BIENVENUE.md](PORTAIL-BIENVENUE.md).

## 7. Rapport à LuxApp 2.1

Le code 2.1 utilise `public/design-tokens.css`, `public/components.css`, `public/accueil-v21.css` et des modules d'apprentissage/jeux. Les invariants fonctionnels et pédagogiques restent prioritaires. La **palette Watfir est déployée sur l'accueil et le portail de bienvenue `2.2` uniquement**, pas une autorisation pour repeindre toutes les variables sémantiques ou changer les jeux. L'icône de l'app et le favicon Watfir, en revanche, s'appliquent à toute la PWA `2.2`.

Faire évoluer les composants existants plutôt que dupliquer leurs fonctions. Les nouvelles classes doivent être préfixées `wf-` ; ne pas multiplier des styles globaux pour écraser 2.1. La référence 2.1, qui considérait l'or comme CTA principal, reste historique pour les vues non migrées jusqu'à validation explicite.

## 8. Mouvement et rendu

**Boutons 3D** (CTA, Étudier/Jouer, pastilles) : la face descend de la hauteur de la tranche pendant que la tranche s'écrase, **avec la même courbe pour les deux** (`transform` et `box-shadow` en `115 ms cubic-bezier(.22,1,.36,1)`) : le bas du bouton reste fixe pendant tout l'appui. Le fond change sur 160–170 ms. Pour une activation utilisateur susceptible de masquer l'animation, `.wf-pressing` conserve le creux 160 ms avant le clic rejoué.

**`prefers-reduced-motion: reduce`** (fréquent sur PC) : aucune animation ni délai, mais l'appui reste **instantané et complet** (face descendue, bas fixe). Ne jamais annuler la descente de la face en gardant l'écrasement de la tranche : le bas remonterait. La roue ne bouge pas au survol.

Les survols sont réservés à `(hover:hover) and (pointer:fine)`, sans animation de gameplay. Aucun filtre VHS permanent, scintillement ni halo permanent. Sur écran HDR, vérifier les rouges et le cyan. Formes vectorielles, effets analogiques strictement décoratifs.

**Cache** : toute modification d'un fichier de l'accueil incrémente son numéro de version dans `index.html` (`accueil-watfir.css?v=…`, `accueil-watfir.js?v=…`, `hover-interactions.css?v=…`, `manifest.json` et icônes `?v=…`). Le service worker applique une nouvelle version au lancement suivant.

## 9. Conditions de livraison

La DA doit être validée **écran par écran** : capture avant/après, tests statiques et navigateur (`node --test test/watfir-home.test.cjs test/watfir-hover.test.cjs`), test Samsung Android (dont clavier, zoom police, TalkBack), vérification des données, navigation, progression et offline. Vérifier sur PC avec et sans « réduire les animations ». Pas de modification silencieuse du modèle pédagogique ou des mini-jeux. Toute adaptation d'un jeu exige ses propres SPEC et tests, notamment les contraintes Lux Démasqué LD-002.

## 10. Interdictions de conception

- Ne pas dessiner une seconde version du monument ; ne pas remettre de monument dans le hero.
- Ne pas ajouter de soleil, ni de soleil coupé.
- Ne pas introduire de couleur hors palette, ni une deuxième nuance de rouge ou de bleu à l'écran.
- Ne pas mettre de texte crème sur le cyan.
- Ne pas transformer l'app en synthwave à fond dégradé, arc-en-ciel et halo permanent.
- Ne pas revenir à une illustration touristique détaillée.
- Ne pas appliquer rouge/cyan à tous les CTA.
- Ne pas tronquer un titre de leçon important.
- Ne pas mettre toutes les familles de niveau sur une seule rangée.
- Ne pas faire dépendre le contenu d'une image générée non éditable.
- Ne pas confondre validation d'un mockup et validation UX/Android.
