# SPEC 111 — Lux Match : refonte UI/UX du swipe des profils (mobile-first)

**Projet :** LuxApp 2.1 · **Jeu :** Lux Match · **Écran :** `phase: 'swipe'` uniquement  
**Statut :** **CODE INTÉGRÉ SUR `2.1` — EN ATTENTE DE VALIDATION VISUELLE SAMSUNG**  
**Date :** 28 octobre 2026 · **Branche de référence :** `2.1`  
**Dépendances :** [SPEC 109](SPEC-109.md), [CHARTE UI 2.1](../CHARTE_UI_2.1.md), [Design System](../DESIGN_SYSTEM.md) et [test swipe](../../tests/test_lux_match_swipe.py).

> **Périmètre sans ambiguïté :** cette spécification concerne **Lux Match**, où l'on fait défiler les profils de partenaires. Le choix des *affaires/dossiers* dans **Lux Démasqué** n'a actuellement **pas** d'écran swipe ; ce serait une fonctionnalité différente, relevant de SPEC 110. Lux Match est **masqué au public** (`JEUX_DISPONIBLES.luxMatch = false`) : la refonte ne doit **pas** le rendre visible par inadvertance.

## 1. Intention produit et critères d'expérience

Transformer le swipe en **moment de jeu immédiatement désirable** : profils PS1 en vedette, lecture LU sans effort, décisions évidentes, micro-feedback arcade et match spectaculaire. Inspirations : gestes intuitifs des interfaces de rencontre + langage visuel rétro 16/32 bits de LuxApp. **Ne pas copier une application tierce.**

À la première carte, le joueur doit comprendre en moins de trois secondes : **qui est présenté**, **comment passer** et **comment aimer**. L'avatar donne envie de découvrir le suivant ; les textes restent des indices utiles au rendez-vous, jamais de simples décorations. Conserver la dimension pédagogique A1.1 et les traits de personnalité des six profils.

**Principes :** un personnage vedette, un niveau de lecture principal, deux choix symétriques, une seule identité de marque, un seul geste qui décide, une récompense forte uniquement en cas de match.

## 2. État de référence vérifié dans le code

| Élément | État actuel (SPEC 109) | Cible SPEC 111 |
| --- | --- | --- |
| Navigation | En-tête `lmEntete()` : retour, logo, aide FR, menu ; second logo `lux♥match` dans le faux téléphone | **Un seul logo principal** : garder l'en-tête fonctionnel, supprimer la répétition *dans ce swipe uniquement* |
| Carte | Portrait 3D pré-rendu, dégradé sur toute la partie basse, biographie LU/FR, ton éventuel, tags LU/FR | Image prioritaire ; bloc d'informations organisé, contrasté, entièrement consultable |
| Gestes | Carte suit le doigt, rotation, tampon OUI/NON ; décision si **|dx| > 90 px** après orientation ≥ 12 px | **Conserver seuils et sémantique**, affiner seulement le ressenti visuel |
| Boutons | Crois / cœur de 62 × 62 px, labels accessibles uniquement | Garder deux cibles ≥ 56 px, ajouter les libellés visuels **PASSER** / **J'AIME** |
| Sortie | Animation de 260 ms, puis `LuxMatchCore.swiper()` | Garder le verrouillage et la durée de base ; transition lisible vers la carte suivante |
| Règles | 4–6 cartes dans le paquet ; match au 1er ou 2e « j'aime », relance si tout est refusé | **Aucun changement** |
| Progression | Carte suivante après décision ; états `match` / `suivante` / `recommence` | **Aucun changement**, pas de nouvelle récompense ou d'indice |
| Style | Violet / rose néon / or, portraits PS1, faux OS LUXNET | Hiérarchie plus nette, palette actuelle harmonisée, pixel art réservé aux accents |

**Fichiers actuels :** `public/lux-match.js` (`lmRendreSwipe`, `lmBrancherSwipe`, `lmSwiper`), `public/lux-match.css`, `public/lux-match-3d.js`, `public/lux-match-core.js`. Le moteur pur et les contenus JSON restent intacts.

## 3. Composition cible du premier écran (360 × 740 de référence)

### 3.1. Zones verticales

1. **Barre supérieure compacte (44–52 px de hauteur utile)** : retour à gauche ; logo Lux Match unique ; aide FR et menu à droite. Aucun nouveau bouton. L'OS fictif `LUXNET` peut conserver sa minuscule barre d'état, mais **pas le second logo Lux Match**.
2. **Repère de progression discret** : « PROFIL 1 / 6 » ou « 1 / 6 » (index réel du paquet), aligné et lisible ; la consigne gauche/droite complète reste visible au premier profil, ensuite une aide courte si nécessaire. **Pas de fausse promesse de six rencontres** : le match peut survenir plus tôt.
3. **Carte dominante, centrée et adaptable** : largeur réutilisant la coque `lm-tel` (actuellement max. 348 px), marges extérieures respirantes, portrait occupant **environ 55–65 % de la hauteur de carte** dans le cas nominal. Visage dégagé ; cadrage validé sur les six modèles.
4. **Panneau de lecture dans la carte** : nom et âge en première ligne (**24–28 px** visés), phrase LU (**≥ 16 px**, interligne généreux), traduction FR **uniquement si l'aide existante est activée**, trait d'humour `profil.ton` le cas échéant, tags existants tous disponibles. Fond dégradé suffisamment opaque pour ne jamais perdre le contraste sur un portrait clair.
5. **Commandes au pouce** : **PASSER (X)** à gauche et **J'AIME (♥)** à droite, boutons symétriques de **62 × 62 px** (minimum tactile absolu **44 × 44 px**), libellés visibles sous les icônes. Position basse et stable, en dehors de la zone de glisse, avec safe area Android.

**Hauteurs flexibles, pas de gabarit rigide.** À 360 × 740 et 393 × 852, le profil courant, son texte essentiel et les deux actions doivent être consultables sans défilement inutile. Sur 320 × 600, avec aide FR, contenus longs ou taille de police agrandie, **autoriser un défilement vertical réel plutôt que masquer le LU, les tags ou les commandes**. Ne pas empiler deux conteneurs à scroll concurrents. Aucun CTA sous la barre de navigation système.

### 3.2. Hiérarchie visuelle

- **Premier regard : portrait / expression**, second : **prénom, âge**, troisième : **bio LU**, quatrième : traits et tags.
- Rétro = tampons, quelques détails pixel, couleur et micro-motion ; **pas de police pixel sur un paragraphe luxembourgeois**, ni effet scanline qui dégrade la lecture.
- Couleurs : violet profond pour le décor, rose pour « J'aime », rouge atténué pour « Passer », **or réservé aux décisions structurantes** de LuxApp et au moment fort de match (pas deux CTA dorés).
- Préserver la vraie information des données `profil.tinder`, `profil.ton` et `tags` : le masquage esthétique d'un indice est interdit. Ne jamais introduire de slogan qui révèle un trait caché.

### 3.3. Profondeur sans coût graphique excessif

Afficher **une carte active** au premier plan et, si les mesures le permettent, une **silhouette de carte suivante** très discrète (décalage 5–8 px, échelle ~0,97). Cette profondeur est **décorative** (`aria-hidden`, non cliquable) et ne doit pas impliquer un second WebGL ou pré-calculer une nouvelle scène. Réutiliser le cache des portraits existants ; à défaut, simple fond CSS. Elle disparaît si la largeur, la hauteur ou la police agrandie l'exigent.

## 4. Comportement du swipe — contrat d'interaction

**Ne modifier ni le calcul de décision ni les protections établies par SPEC 109 § 19.**

| État | Rendu/feedback attendu | Décision |
| --- | --- | --- |
| Repos | Carte au centre, deux actions visibles, texte lisible | Aucune |
| Déplacement horizontal commencé | Translation directe sous le doigt + rotation bornée ; aucune latence sensible | Aucune avant relâchement |
| Vers la droite | Tampon « J'AIME » rose, apparition progressive après un déplacement significatif (repère existant ≈ 40 px) | **OUI uniquement** si relâchement au-delà du seuil actuel |
| Vers la gauche | Tampon « PASSER » rouge, apparition progressive | **NON uniquement** si seuil atteint |
| Glisse courte | Retour fluide au centre, aucun son de validation | Aucune |
| Défilement vertical initial | Conserver le scroll, aucune inclinaison parasite | Aucune |
| `pointercancel` / perte de capture | Recentrement, suppression des tampons | Aucune |
| Plusieurs doigts | Ignorer les pointeurs secondaires | Au plus décision du pointeur primaire |
| Double appui / événements multiples | Action verrouillée tant que la carte sort | **Une décision maximum** |
| Confirmation par bouton | Même sortie et même feedback que la direction du swipe | Une seule décision |
| Match déclenché | Sortie puis scène « IT'S A MATCH! » déjà existante, révélée de façon festive | Aucun changement du moteur |

**Contraintes à conserver :** `LM_SEUIL_SWIPE = 90`, `LM_SEUIL_SENS = 12`, traitement `pointerdown/move/up/cancel`, `lostpointercapture`, `touch-action: pan-y`, `lm.swipeEnCours` et délai de sortie actuel **260 ms**. Une éventuelle évolution de vitesse ou d'inertie exige une SPEC/test distinct, **pas de changement implicite ici**.

**Timing visuel indicatif, à valider par mesure :** tampon réactif pendant la translation ; retour au centre 180–240 ms ; sortie dans la durée existante de 260 ms ; carte suivante prête sans flash vide. Respecter `prefers-reduced-motion` : abandonner rotation/échelles/effets non essentiels, conserver un changement d'état perceptible, et **ne pas ralentir la décision**.

**Audio :** réutiliser les sons Lux Match existants (`like`, `swipe`, `match`) **à la validation**, pas à chaque mouvement. Respecter préférences son/musique ; pas de son auto-joué au chargement, ni de vibration imposée.

## 5. États particuliers et exigences d'accessibilité

- **Portrait pas encore prêt** : silhouette/fond de couleur propre au personnage ou initiale déjà prévue par `lmImage()` ; texte et boutons disponibles ; aucun saut de layout quand le 3D arrive.
- **Aide FR activée** : conserver exactement la traduction existante et tous les tags FR, prévoir la place. Un basculement FR pendant le swipe ne doit ni consommer ni changer une carte.
- **Bio/ton/tags très longs** : aucun `line-clamp` destructeur, aucune troncature invisible ; défilement mobile accessible, y compris avec traduction ; aucun texte sous les boutons.
- **Dernière carte et paquet relancé** : ne pas afficher de carte vide, conserver le message et le mécanisme actuels.
- **Focus clavier / lecteur d'écran** : boutons natifs avec intitulés accessibles cohérents, ordre Retour → aide/menu → contenu → Passer → J'aime ; annoncer le nom du nouveau profil si nécessaire **sans répéter la biographie entière**.
- **Sans gestes tactiles** : les boutons suffisent à jouer ; seuil de cible tactile ≥44 px, focus visible, couleurs avec texte/icône (jamais couleur seule).
- **Sans animation / basse performance** : pas de second rendu WebGL ; respecter le mode réduit, les téléphones Android modestes et l'orientation portrait.

## 6. Architecture et lot d'implémentation

**Un seul lot visuel : l'écran `swipe`.** Modifier principalement `lmRendreSwipe()` et les règles ciblées `#view-luxmatch .lm-jeu[data-ecran="swipe"]`. Ne pas repeindre `profil`, `match`, `reseaux`, `look`, `date` ni `resultats`. Éviter les surcharges CSS anonymes en fin de fichier ; extraire les composants réellement communs seulement après preuve de réutilisation.

**Ne pas toucher** à `lux-match-core.js`, `data/jeux/lux-match/contenus-v02.json`, aux probabilités de match, à `luxMatchRecord`, `luxMatchParties`, aux préférences `luxMatchAideFr` / `luxMatchSon`, à `luxProgress` ou à la visibilité publique du jeu. Le module 3D partagé avec Lux Démasqué reste inchangé pour cette refonte.

**Séquence recommandée :**

1. Capturer la version actuelle (360 × 740 et 393 × 852) avec les états FR activé/désactivé, portrait en attente, bio longue.
2. Réorganiser l'en-tête spécifique, la carte et les deux actions ; produire les **captures avant/après**.
3. Tester le layout sur écran court et texte agrandi avant les effets visuels.
4. Ajouter tampons, profondeur et micro-animations **sans toucher aux décisions**.
5. Relancer les tests et faire valider les captures par l'utilisateur avant de passer à un autre écran.

## 7. Recette et critères de validation

### 7.1. Tests automatisés à exécuter lors de l'implémentation

- `node --test test/lux-match.test.cjs test/lux-match-contenus.test.cjs test/lux-match-conversation.test.cjs test/lux-match-generateur.test.cjs test/lux-match-narratif.test.cjs` (adapter uniquement si la suite dédiée du dépôt prévoit une commande mieux ciblée).
- `python3 tests/test_lux_match_swipe.py` (Playwright avec serveur de recette) : droite/OUI, gauche/NON, geste court, défilement vertical, cancel, perte de capture, deuxième doigt, événements répétés, dix swipes alternés et geste tactile CDP.
- Ajouter une **recette géométrique** ciblée : une carte active ; un seul logo principal ; nom, bio LU, tags et traductions présents ; boutons affichés et cliquables ; absence d'overflow horizontal ou de contenu masqué.
- Tests de non-régression de transition : profil → swipe → match → réseaux/date ; absence de doublon d'image 3D et absence de double décision.

### 7.2. Matrice visuelle

| Format | Attendu |
| --- | --- |
| 320 × 600 | Rien de tronqué, scroll vertical naturel autorisé, boutons atteignables |
| 360 × 740 | Lecture initiale et actions visibles sans scroll inutile |
| 393 × 852 et 430 × 932 | Portrait plus respirant ; éléments toujours alignés |
| 500 / 720 / 1024 px de largeur | Coque centrée, pas de carte géante ; composition mobile préservée |
| Texte 130 % / 200 % | Aucun chevauchement du visage, du texte ou des boutons |
| FR activée / désactivée | Même carte, aucune décision supplémentaire |
| `prefers-reduced-motion` | Pas d'animation envahissante ; décisions inchangées |

**Critères bloquants (tous requis) :**
- [ ] 0 débordement horizontal sur la matrice ; contenu LU/FR/tags entièrement accessible.
- [ ] Portrait visible, visage dégagé, nom + âge lisibles et boutons tactiles utilisables.
- [ ] 1 seul logo principal et information de progression non redondante.
- [ ] Swipe droit/gauche/boutons = **exactement une décision**, tous les gestes annulés = zéro.
- [ ] Pas de modification des matches, scores, sauvegardes, données et autres écrans.
- [ ] Tests automatisés verts, captures comparatives jointes ; **recette Samsung réelle**, puis **validation explicite du joueur** sur le rendu.

## 8. Hors périmètre et décision produit

Sont **exclus** : sélection par swipe d'affaires de Lux Démasqué, nouveaux profils, nouvelles photos ou modèles 3D, réécriture des dialogues ou du luxembourgeois, rééquilibrage du match, publication de Lux Match, redesign des réseaux/date/écrans de fin, vibrations ou nouveaux effets sonores, simulation de classement ou récompenses artificielles.

**Statut de livraison :** cette SPEC définit une cible UX/UI ; **elle n'est ni une maquette approuvée ni une fonctionnalité codée**. Attendre l'accord produit sur cette direction et les captures du premier lot avant d'étendre la refonte.

## 9. Implémentation SPEC 111 — 28 octobre 2026

**Lot effectivement codé :** composition et hiérarchie de l'écran `swipe`, portrait 3D conservé, panneau de lecture LU/FR/ton/tags, unique logo Lux Match, jauge « PROFIL x / n », boutons Passer/J'aime étiquetés, pile décorative CSS et tampons progressifs. Les mouvements sont désormais bornés à ±12° mais **le seuil de décision reste strictement supérieur à 90 px** ; `pointercancel`, multi-touch et verrouillage des décisions sont préservés. Le swipe par geste relâché supprime son `transform` inline avant la classe de sortie afin que la transition CSS reste effective.

**Fichiers :** `public/lux-match.js`, `public/lux-match.css`, cache-busters de `public/index.html`. Tests ajoutés : `test/lux-match-swipe-ui.test.cjs` (invariants DOM et CSS) et `tests/test_lux_match_swipe_ui.py` (géométrie, FR, boutons, scroll, portraits), exécution des gestes existants `tests/test_lux_match_swipe.py`. Workflow dédié : `.github/workflows/lux-match-swipe.yml`, avec captures PNG 360 × 740 et 393 × 852 en état original et après modification. **Aucune modification de** `lux-match-core.js`, du contenu, des sauvegardes ou de la visibilité publique.

**Critère de sortie :** tests et captures Chromium analysés, puis captures sur Samsung transmises au produit pour approbation. L'implémentation n'équivaut pas à une validation produit ou au lancement public du jeu.

**Ajustement issu de l'inspection des captures :** au format 360 × 740 avec aide FR activée, la première version plaçait le dernier bouton légèrement sous le viewport. La carte réduit désormais **sa seule zone portrait** lorsque la hauteur est au plus 790 px et qu'une traduction est présente (CSS `:has(.lm-carte-infos .lm-fr)`). Les textes/tags ne sont pas tronqués, la cible tactile demeure identique. Un test navigateur vérifie la visibilité des deux commandes avant défilement dans ce format. Les écrans plus hauts et FR désactivé gardent le portrait plus grand.
