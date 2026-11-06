# Charte de direction artistique — Watfir / LuxApp 2.2

**Version** 1.3 · 2026-11-06 · **Statut** : DA Watfir **active sur l'accueil et le portail de bienvenue de la branche `2.2`** ; formulaires de compte et autres écrans non encore harmonisés. Références d'implémentation : [BOUTONS-3D.md](BOUTONS-3D.md) (boutons), [HOVER-SYSTEM.md](HOVER-SYSTEM.md) (survols), [ASSETS.md](ASSETS.md) (fichiers graphiques), [IMPLEMENTATION.md](IMPLEMENTATION.md) § 18 (historique du 05–06/11/2026). Les tests Samsung physique restent à effectuer.

> **Changements de la version 1.2** : un seul dessin du monument (logo, icône, favicon) ; hero sans monument (« Moien! » + bouton Écouter + rubans) ; un seul rouge et un seul bleu à l'écran ; Étudier rouge vif et Jouer cyan à texte noir ; accueil PC à 640 px comme les autres pages ; appui des boutons 3D complet même en « animations réduites ».

## 1. Intention

Créer une application d'apprentissage du luxembourgeois immédiatement identifiable : une esthétique d'identités télévisuelles et touristiques des années 1975–1985, **réinterprétée pour une interface moderne, mobile-first et très lisible**. Inspiration revendiquée : le travail de kxdgraphics (logos de lieux réimaginés en 1984 : fond noir, emblème simple, bandes de couleur, couleurs tirées du sujet). Le but n'est ni un jeu néon, ni une imitation littérale d'un logo existant, ni un filtre VHS sur toute l'application.

Le langage graphique repose sur quatre idées complémentaires :

1. **Des couleurs qui viennent du sujet** : noir, crème, rouge et cyan reprennent presque exactement le drapeau luxembourgeois (rouge, blanc, bleu ciel). Aucune couleur n'est décorative ou choisie au hasard.
2. **Un repère géographique réduit à un signe, dessiné une seule fois** : une tour à flèche au-dessus d'un pont à trois arches. Ce même dessin sert au logo du header, à l'icône de l'app et au favicon ; il n'en existe pas de seconde version.
3. **Des rubans identitaires rouge et cyan** : deux bandes d'épaisseur homogène qui partent du bord gauche de l'écran, passent sous le titre et remontent en courbe douce vers la droite. Elles donnent le rythme du hero.
4. **Un contraste typographique** : « Moien! » expressif en grande serif italique, contre une interface de lecture sobre en sans-serif.

Précision éditoriale : les essais « carte postale synthwave », coucher de soleil tranché, multiples bâtiments, néons excessifs, dégradés arc-en-ciel, pictogrammes décoratifs et monument géant dans le hero **ont été écartés**. La version cible est **épurée**.

## 2. Palette et rôle des couleurs

Les valeurs suivantes sont les **tokens de marque de l'accueil `2.2`**, définis dans `public/accueil-watfir.css`.

| Token 2.2 | Hex | Rôle |
| --- | --- | --- |
| `--wf-bg` | `#080808` | Fond quasi noir, continu, sans faux panneaux. Texte et picto de Jouer. |
| `--wf-cream` | `#F7E9C2` | Marque, titres, icônes neutres, **CTA principal**, texte sur rouge |
| `--wf-red` | `#F22421` | **Le seul rouge** : ruban, « ! » de « Moien! », bouton Étudier, pastille de niveau actif, coin du CTA |
| `--wf-cyan` | `#02C5E7` | **Le seul bleu** : ruban, bouton Écouter du hero, bouton Jouer, coin du CTA, survols PC (Connexion, réglages) |
| `--wf-red-texte` | `#C81E1B` | Niveau courant dans la feuille des niveaux uniquement (4,75:1) |
| `--wf-secondary` | `#BEB6A6` | Texte explicatif non essentiel, sous-titre « Lëtzebuergesch » du logo, phrase du hero |
| `--wf-track` | `#3C3934` | Barre de progression inactive, filets discrets |
| `--wf-ink` | `#080808` | Texte sur bouton crème |
| `--wf-success` | `#54E0AD` | Succès pédagogique, **pas** bleu ou rouge |
| `--wf-error` | `#EF7A73` | Correction erreur / alerte sémantique |
| `--wf-info` | `#6FB0F2` | Informations pédagogiques et examen |

**Règle « un rouge, un bleu » (06/11/2026)** : à l'écran, il n'existe qu'un rouge (`#F22421`) et qu'un bleu (`#02C5E7`), chacun accompagné de sa seule tranche plus sombre pour le relief (`#8F1712` sous le rouge, `#087496` sous le cyan). Aucune variante intermédiaire (anciens `#D3232B`, `#087496` en face, etc.).

**Répartition visuelle sur l'accueil** : le noir domine, le crème structure la lecture et le CTA principal. Le rouge et le cyan sont les signes identitaires du hero et du coin du CTA ; les deux seules grandes surfaces colorées sont **Étudier** (rouge, texte crème) et **Jouer** (cyan, texte noir). Cette hiérarchie n'autorise pas à colorer tous les boutons de tous les écrans.

**Contraste** :
- Crème sur rouge `#F22421` = **3,44:1** : conforme pour un grand texte (≥ 18,66 px gras, seuil 3:1), donc pour Étudier (libellé ≥ 19 px). Sur la pastille de niveau actif (14 px), c'est **sous** le seuil de 4,5:1 : écart assumé, à reconsidérer si l'accessibilité devient prioritaire (texte noir sur rouge = 4,8:1).
- Noir sur cyan `#02C5E7` = **9,7:1** : Jouer et le bouton Écouter portent toujours du noir, jamais du crème.
- Un survol ne doit jamais faire passer un texte sous son seuil (survol d'Étudier `#FF2F2A` = 3,06:1).

Le rouge de marque `--wf-red` n'est pas le rouge d'erreur `--wf-error`. Un état d'erreur exige un libellé ou une icône et un contraste explicite. Ne jamais coder uniquement par la couleur.

## 3. Typographie

- **Wordmark « Watfir »** : Fraunces 900 italic auto-hébergée, chargée sous `Watfir Logo`.
- **Sous-titre « Lëtzebuergesch »** : Roboto Condensed (`Watfir Etroite`), crème atténué `--wf-secondary`, légèrement espacé (0,02 em), pour se lire comme une légende sous « Watfir ».
- **Titre « Moien! »** : Playfair Display 800 italic auto-hébergée (`Watfir Titre`), crème avec ponctuation rouge, environ 192 unités `--k` (≈ 84 px à 412 px de large).
- **Navigation, niveaux, boutons, questions, métriques** : `Inter` / sans-serif. Chiffres lisibles, pas de serif pour des statistiques opérationnelles.
- **Kicker « LE LUXEMBOURGEOIS, PAS À PAS »** : capitales à chasse étendue, jamais sous 12 px. Même plancher de **12 px** pour « TA PROGRESSION », la phrase du hero, les légendes, le titre et l'étape du CTA et les niveaux (`max(12px, …)`). Exceptions mesurées : le sous-titre du logo et le bloc « Mode invité / Connexion » (11–11,5 px), qui feraient sinon passer le header sur deux lignes à 360 px.
- **Contenu pédagogique** : police nette, contraste WCAG adapté. Aucune texture CRT, aberration chromatique ou flou sur les textes fonctionnels.

Ne pas intégrer de polices propriétaires non licenciées.

## 4. Géométrie et iconographie

### 4.1 Le monument (un seul dessin)

Une tour à flèche allongée, trois fenêtres évidées, une toiture rectiligne et un pont à **trois arches identiques** (même largeur, même courbe, piles régulières). Sans marches, pierres, arbres, silhouettes supplémentaires ni soleil.

- **Logo du header** : `public/art/watfir-logo-v4.svg`, emblème 80 × 100. La tour crème passe **devant** deux bandes cyan (haut) et rouge (bas), avec un fin détourage noir là où elle croise les bandes ; toiture et pont en dessous. Lisible dès 24–32 px.
- **Icône de l'app, icône Apple, favicon** : le même emblème, centré sur fond noir, avec des bandes **plus épaisses** et prolongées jusqu'aux bords pour l'impact à petite taille. Version « any » dans un carré arrondi au liseré crème ; version « maskable » à fond plein, emblème dans la zone sûre. Sources : `docs/watfir-2.2/assets/watfir-icon-app*.svg`.
- **Interdit** : redessiner une autre version du monument (hero illustré, silhouette différente, autre pont). Le grand dessin du hero V4 est archivé (`docs/watfir-2.2/assets/watfir-hero-v4.svg`), il ne sert plus.

### 4.2 Rubans

Deux bandes continues, rouge au-dessus et cyan en dessous, séparées par un fin filet noir, d'épaisseur identique. Dans le hero, elles partent du bord gauche de l'écran, passent sous « Moien! » et remontent vers la droite jusqu'au bord (SVG inline `.wf-hero-rubans`, viewBox 941 × 98 rogné au ras des rubans). Aucun éclatement en sept couleurs, aucune répétition systématique dans les cartes. Leurs extrémités doivent être nettes et ne pas sembler coupées par accident. Sur PC, elles s'arrêtent aux bords de la colonne de 640 px.

### 4.3 Icônes

Trait de poids optique cohérent. Étudier : livre au trait **crème** ; Jouer : manette au trait **noir** (sur cyan). Le bouton principal Commencer/Continuer n'a **pas** de livre : son texte et sa flèche suffisent. Bouton Écouter du hero : triangle de lecture noir dans un rond cyan. Réglages : roue au trait crème. Cibles tactiles d'au moins 44–48 px, sans chevauchement.

### 4.4 Surfaces

Fond noir libre autour des composants ; un CTA crème de premier niveau et deux boutons secondaires centrés (Étudier rouge / Jouer cyan). Les reliefs sont de véritables **tranches d'ombre hors flux**, pas des doubles cartes. Pas de contour animé rouge, ni d'ombre néon. Le CTA crème garde son coin à deux bandes rouge/cyan **sans changement d'épaisseur**.

## 5. Rythme, densité et hiérarchie

Ordre de lecture sur l'accueil : **marque + niveaux + compte** → **hero** (kicker, « Moien! » + Écouter, rubans, phrase) → **progression réelle** → **Commencer/Continuer** → **Étudier et Jouer**. Le parcours, les révisions, les examens et les erreurs sont accessibles depuis la feuille « Étudier », et non comme quatre boutons concurrents.

Une seule action dominante à l'écran. Le hero est expressif mais ne doit jamais repousser le CTA hors de l'écran à cause d'une hauteur fixe.

**Dimensions** : toutes les mesures viennent de la maquette via une unité unique `--k = min(100vw, var(--layout-shell, 640px)) / 941`. Sur mobile, l'accueil suit la largeur de l'écran ; sur PC, il est centré à **640 px, comme toutes les autres pages** (`--layout-shell`). Sous environ 850 px de hauteur utile, l'accueil défile légèrement pour atteindre Étudier et Jouer.

Échelle d'espacement de départ `4/8/12/16/24/32px`, adaptée au rendu réel. Éviter les trous verticaux artificiels et le positionnement absolu du CTA à une coordonnée calculée pour une capture.

## 6. Composants et règles

### 6.1 Header

Logo (emblème + « Watfir » + « Lëtzebuergesch ») avec un espace franc entre l'emblème et le texte (plus de marges négatives) ; largeur de la marque plafonnée pour que le header tienne sur une ligne à 412 px avec « Mode invité / Connexion ». Survol PC : « Connexion » passe au cyan ; la roue des réglages fait un quart de tour (90°) avec léger rebond et passe au cyan.

### 6.2 Hero

Kicker, puis « Moien! » en grand avec, à droite, le **bouton Écouter** : rond cyan en relief, triangle noir, `jouerAudio('moien.mp3', this)` — son LOD officiel, **jamais lu automatiquement**, 44 px minimum. Survol PC : cyan éclairci et triangle légèrement agrandi. Puis les rubans, puis la phrase : « **Bonjour**, ton premier mot. Une nouvelle langue commence ici. » (utilisateur régulier : « **Bonjour** ! Prêt pour quelques minutes de Lëtzebuergesch ? »). Pas de monument dans le hero.

### 6.3 Bouton principal

Fond crème `#fbebc5`, texte noir, flèche noire, **sans livre**. Tranche beige de 7 px, enfoncement de 6 px, état maintenu 160 ms avant une navigation déclenchée par clic utilisateur ; survol PC : face crème `#fff4da` **sans soulèvement**. Les deux bandes du coin gardent `#F22421` / `#02C5E7` et leur largeur. Afficher le vrai titre de la leçon sur deux lignes au besoin ; pas de troncature d'information critique.

### 6.4 Niveaux A1.1/A1.2 et familles futures

Deux pastilles maximum dans le header, **actif rouge vif `#F22421` / crème** et inactif fond noir / filet crème ; le chevron est la troisième commande 3D. Relief de 2 à 4 px selon `--k`, tranche beige sombre ou rouge sombre, enfoncement de `depth - 1px` et maintien 160 ms avant sélection ou ouverture de la feuille. Filet `::before` et cibles tactiles `::after` préservés. Pour A2.1/A2.2, B1.1/B1.2, etc., le chevron ouvre un bottom sheet groupé par familles et limité aux niveaux disponibles. Sous 360 px, le header peut se replier sur deux rangées sans compresser la marque.

### 6.5 Progression

En-tête « TA PROGRESSION », pourcentage du **niveau actif** et série selon calcul réel. Barre très fine avec piste foncée. Ne pas confondre progression du niveau et « Aujourd'hui ».

### 6.6 Accès secondaires

Deux boutons **centrés, côte à côte**, sans titre : **Étudier** (`#F22421`, tranche `#8F1712`, texte et picto crème, survol `#FF2F2A`) et **Jouer** (`#02C5E7`, tranche `#087496`, texte et picto noirs, survol `#3FD6F0`). Relief 5 px, enfoncement 4 px maintenu 160 ms avant activation ; au survol PC, seule la face s'éclaircit. Étudier ouvre un bottom sheet **Les leçons / S'entraîner / Examens / Mes erreurs** ; Jouer ouvre les mini-jeux. Cibles tactiles d'au moins 76 px de hauteur. Voir [BOUTONS-3D.md](BOUTONS-3D.md).

### 6.7 États

Définir au minimum : chargement, progression nulle, aucune leçon reprenable, niveau indisponible, invité et connecté, série zéro, hors ligne, retour depuis chemin, message d'erreur. Aucun raccourci ne doit sembler disponible s'il ne fonctionne pas.

### 6.8 Premier écran — portail de bienvenue (06/11/2026)

**Typographie du mot-symbole :** Fraunces 900 italic (même fonte que le header), `font-kerning:normal`, **`letter-spacing:0`**, aucune ombre portée. Ne pas resserrer artificiellement les glyphes : à grande taille, `-0.075em` collait les lettres et donnait une impression de dessin « baveux » sur Android. La forme de la fonte est conservée. La lisibilité à l'écran prime sur une compaction décorative.

**La page de bienvenue n'est pas une version simplifiée de l'accueil.** C'est une affiche éditoriale sans slogan, sans paragraphe marketing et sans succession de trois bénéfices numérotés. La marque **Watfir** est le seul titre, en Fraunces 900 italic crème, suivie des rubans rouge/cyan en SVG et de « Lëtzebuergesch » en petites capitales comme désignation de la langue. Pas de monument démesuré, pas de pictos génériques, pas de carte « Moien! » ni d'audio : cet apprentissage est réservé au hero de l'accueil.

**Actions :** Commencer (CTA crème 3D, chevron noir, coin bicolore, tranche beige 6 px, appui 5 px maintenu 160 ms), Créer un compte (surface sombre bord crème), Se connecter (lien). Ces actions préservent `guest`, `signup` et `signin`, et les formulaires conservent les composants 2.1. Seule la présentation du mode `welcome` est migrée. La feuille `portail-watfir.css` est isolée sous `.wf-portail-bienvenue`; le fond noir remplace le dégradé doré sur cette seule vue.

**Écrans courts, zoom et accessibilité :** l'affiche se réduit mais ne pousse pas les CTA hors d'une zone défilable ; 320–360 px et petits écrans Android doivent être vérifiés. Hover PC = éclaircissement sans glissement. En réduction des animations, le bouton reste physiquement enfonçable instantanément sans délai de navigation. Référence : [PORTAIL-BIENVENUE.md](PORTAIL-BIENVENUE.md).

## 7. Rapport à LuxApp 2.1

Le code 2.1 utilise `public/design-tokens.css`, `public/components.css`, `public/accueil-v21.css` et des modules d'apprentissage/jeux. Les invariants fonctionnels et pédagogiques restent prioritaires. La **palette Watfir est déployée sur l'accueil et le portail de bienvenue `2.2` uniquement**, pas une autorisation pour repeindre toutes les variables sémantiques ou changer les jeux. L'icône de l'app et le favicon Watfir, en revanche, s'appliquent à toute la PWA `2.2`.

Faire évoluer les composants existants plutôt que dupliquer leurs fonctions. Les nouvelles classes doivent être préfixées `wf-` ; ne pas multiplier des styles globaux pour écraser 2.1. La référence 2.1, qui considérait l'or comme CTA principal, reste historique pour les vues non migrées jusqu'à validation explicite.

## 8. Mouvement et rendu

**Boutons 3D** (CTA, Étudier/Jouer, pastilles, bouton Écouter) : la face descend de la hauteur de la tranche pendant que la tranche s'écrase, **avec la même courbe pour les deux** (`transform` et `box-shadow` en `115 ms cubic-bezier(.22,1,.36,1)`) : le bas du bouton reste fixe pendant tout l'appui. Le fond change sur 160–170 ms. Pour une activation utilisateur susceptible de masquer l'animation, `.wf-pressing` conserve le creux 160 ms avant le clic rejoué.

**`prefers-reduced-motion: reduce`** (fréquent sur PC) : aucune animation ni délai, mais l'appui reste **instantané et complet** (face descendue, bas fixe). Ne jamais annuler la descente de la face en gardant l'écrasement de la tranche : le bas remonterait. La roue et le triangle du bouton Écouter ne bougent pas au survol.

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
