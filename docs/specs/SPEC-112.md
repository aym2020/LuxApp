# SPEC 112 — Red Flag : sélection des profils dans l'app Cringr

> ⚠️ **DOCUMENT HISTORIQUE — NE PAS IMPLÉMENTER TEL QUEL.** La [SPEC 113](SPEC-113.md) est la **seule référence normative actuelle** pour la sélection Cringr : swipe **gauche = NOPE / profil suivant**, **droite = LIKE / rencontre**, cœur = LIKE. Les prescriptions ci-dessous « swipe = précédent/suivant », « un swipe ne lance jamais la rencontre », « PRÉCÉDENT/SUIVANT », pile factice et hint SWIPE sont **obsolètes et explicitement annulées**. Le code actuel implémente une partie de SPEC 113 mais **n'a pas été validé par tests navigateur ni sur Samsung**. Conserver le reste de cette fiche pour l'historique, les données et les contraintes non contradictoires. Ne pas reprendre les anciens tests comme vérité produit sans les adapter.


**Décision produit :** 29 octobre 2026 · **Branche de code cible :** `2.1` · **État : V2 IMPLÉMENTÉE SUR `2.1` — RECETTE ET APPROBATION SAMSUNG À CONFIRMER** · **Écran unique de ce lot :** sélecteur `data-ecran="selection"` · **Suivi canonique :** LD-048 dans `docs/LUX-DEMASQUE-TODO.md` sur `main`.

> **Pivot explicite :** Lux Démasqué n'est **pas** une enquête policière présentée comme un interrogatoire : c'est **un date**, organisé dans un téléphone et une app de rencontre. Les incohérences, preuves et disquettes forment le gameplay sous-jacent, sans contaminer le vocabulaire et la présentation du choix initial. **Ne pas modifier Lux Match : il s'agit de Lux Démasqué.**

## DÉCISION PRODUIT FINALE — 29 octobre 2026 (normative, prévaut sur les anciennes sections)

**Nom définitif du jeu : RED FLAG.** **Nom de l'application fictive de rencontre, à l'intérieur du téléphone : CRINGR.** Ne jamais afficher le nom du jeu à l'intérieur de l'application, et ne pas afficher Cringr comme nom du jeu dans le hub.

**Statut de cette décision : DOCUMENTATION UNIQUEMENT, PAS ENCORE CODÉE.** Le code actuel sur `2.1` affiche encore « Lux Démasqué » / `lux♥démasqué` et les flèches. La capture Samsung de 08:12 a confirmé la bonne direction de la coque téléphone, mais rejeté ces éléments. La structure et les comportements existants restent la baseline technique.

### Résultat visuel exigé

- **À l'extérieur du téléphone :** titre de jeu **RED FLAG**, centré horizontalement de façon indépendante du bouton Retour. Sur le hub Jeux, carte **Red Flag**. Les titres des autres étapes de jeu doivent à terme reprendre le nom Red Flag ; l'implémentation de l'identité globale sera inventoriée sans changer les IDs internes.
- **À l'intérieur :** marque d'application **Cringr** en haut, par exemple `cringr` avec petit cœur rose dans le logo si le rendu reste lisible. **Pas « Lux Démasqué », « Red Flag », ni « lux♥démasqué » dans le faux téléphone.** Barre d'état 21:30, encoche et coque déjà en place conservées.
- **Carte :** portrait PS1 immersif, prénom, âge, ville, bio et statut de progression ; conserver Milo/Noah/Tom + profil inédit. Dégradé de contraste et hauteur responsive conservés, sans tronquer les textes.
- **Bas du téléphone :** **supprimer complètement les deux grosses flèches circulaires** précédent/suivant ; ne conserver que le **CTA central de rencontre** avec cible tactile ≥ 48 px, suffisamment distinct du geste de navigation. Un swipe ne doit jamais lancer la rencontre.
- **Affordance du swipe :** montrer visuellement une **carte suivante derrière** (débord de 6–10 px et léger décalage, purement CSS, sans autre portrait WebGL). Si la carte est unique/dernière, rendre la pile cohérente avec le retour circulaire existant. Ajouter un **coachmark au premier accès** : carte qui se décale délicatement de 12–20 px puis revient, **une seule fois par installation / sauvegarde de préférence locale**, jamais à chaque retour ou à chaque profil. Alternative texte persistante, non répétitive : **« Glisse pour découvrir »**, accompagnée d'une icône gestuelle discrète. Pas de main fantôme permanente.
- **Pendant le glissement :** afficher progressivement des repères neutres **« PRÉCÉDENT »** vers la droite et **« SUIVANT »** vers la gauche ; **pas « MATCHER » ou « PASSER »**, car dans ce jeu un swipe parcourt les profils, il ne les accepte ni ne les rejette. Après relâchement trop court, retour au centre ; au-delà du seuil actuel, profil suivant/précédent, avec transition lisible et sans écran blanc.
- **Sans geste tactile :** prévoir l'équivalent **clavier gauche/droite** pour accessibilité, et une action de navigation secondaire non dominante si nécessaire pour les utilisateurs qui ne peuvent pas swiper. Ne pas remettre deux gros boutons de navigation dans le bas du téléphone.
- **Respect du mouvement réduit :** désactiver la démonstration animée et les rotations décoratives si `prefers-reduced-motion: reduce`, sans supprimer l'indication textuelle du geste.

### Contrat technique (prochaine implémentation)

**Fichiers à inventorier avant édition :** `public/lux-demasque.js` (sélecteur, en-tête et hub), `public/lux-demasque.css`, `public/jeux-v21.js` (nom affiché sur la carte de jeu), `public/index.html` (versions des assets), autres références affichées « Lux Démasqué » dans les vues et textes publics. **Ne pas** renommer les fonctions `ld*`, les clés persistées (`luxDemasqueResolus`, etc.), IDs JSON ou le chemin des modules simplement pour des raisons de marque : une migration technique risquerait d'effacer la progression.

**Comportement conservé :** `ldSelectionChanger(delta)`, `ldBrancherSelection()`, seuil strict de 65 px, wrap des 4 profils, séquence WebGL, `ldSelectionConfirmer()` seule action ouvrant la rencontre, sélection/résolus/records inchangés. Aucun changement de Lux Match ni de son application `lux♥match`.

**Tests requis :** statique (aucun branding historique dans l'écran de sélection, absence des deux flèches de bas, présence d'une pile et du coachmark), navigateur Playwright sur 320×600 / 360×740 / 393×852 / 430×932, swipe dans les deux sens, retour après geste incomplet, pointeurs annulés/secondaires, coachmark une seule fois et absent avec mouvement réduit, navigation clavier, accessibilité CTA, pas de débordement horizontal, sauvegarde inchangée ; captures avant/après et validation tactile Samsung explicite. **LD-048 reste ouverte jusqu'à validation.**

**Recommandation de titre pour la prochaine PR :** `feat(red-flag): Cringr et affordance de swipe sans flèches`.

> **Nota historique :** toutes les mentions « Lux Démasqué », « flèches gauche/droite » ou « V2 à implémenter » dans les sections archivées ci-dessous décrivent les versions antérieures ; cette décision finale prime pour la prochaine livraison. Le nom « Red Flag » est une décision de marque, distincte du concept pédagogique « red flags ».

---

## 1. Historique et périmètre exact

La SPEC 112 V1 a livré un sélecteur « Bureau des enquêtes → Choisis ton affaire → Dossier n°001 → Ouvrir ce dossier ». Son fonctionnement existe déjà sur `2.1`, testé dans [CI 40783142046](https://github.com/aym2020/LuxApp/actions/runs/40783142046), mais **son design et sa métaphore ont été refusés sur capture Samsung le 29/10**. Le défaut de centrage de « Lux Démasqué » est également confirmé par la capture.

La V2 est la **refonte visuelle et éditoriale du même écran de sélection**, et **non** la création d'un nouveau jeu, d'un nouveau moteur ou d'une nouvelle mécanique de matching. La suite du jeu reste inchangée dans ce lot. Ne pas cocher LD-048 avant capture Samsung approuvée.

**Fichiers principaux à modifier lors de l'implémentation :** `public/lux-demasque.js` (`ldRendreSelection()`, `ldEntete()` avec option localisée à la sélection), `public/lux-demasque.css` (styles strictement scopés), `public/index.html` (cache), `test/lux-demasque-selection.test.cjs`, `tests/test_lux_demasque_selection.py`. **Ne pas modifier** `public/lux-match.js`, `public/lux-match.css` ou les contenus Lux Match.

## 2. Expérience cible

Le joueur ouvre **Lux Démasqué**, découvre une **interface de téléphone fictif / app de dating**, fait défiler des **profils** dotés de portraits PS1, puis décide volontairement **avec qui commencer un date**. L'identité rétro arcade reste perceptible par la typographie secondaire, les touches et micro-animations, sans sacrifier la lecture.

L'écran doit répondre immédiatement à trois questions :
1. **Qui ?** Portrait, prénom, âge, ville, bio.
2. **Comment en voir d'autres ?** Swipe horizontal, flèches secondaires.
3. **Comment commencer ?** Un seul CTA clair sous la carte.

Aucune notion de commissariat, d'interrogatoire ou de collecte de preuves à cet endroit. La présence d'une incohérence chez la personne ne doit pas être vendue comme un « dossier à traiter ».

## 3. Microcopy normative, texte exact à afficher

| Élément | Texte V2 |
| --- | --- |
| Logo haut de page | **LUX DÉMASQUÉ** |
| Kicker (facultatif ; éviter la redondance) | **RENCONTRES** |
| Titre | **Découvre des profils** |
| Description | **Glisse pour découvrir les personnes disponibles.** |
| Compteur | **PROFIL 1 / 4** (nombres dynamiques, un seul compteur) |
| Carte standard | **Milo, 30 ans** · **Bonnevoie (Luxembourg)** · bio existante |
| Statut non joué | **À DÉCOUVRIR** |
| Statut déjà joué/résolu | **DÉJÀ DÉMASQUÉ** uniquement si l'état persisté signifie réellement résolu ; sinon **DÉJÀ JOUÉ** lorsque cette information existe |
| Carte générée | **Nouveau profil** |
| Texte de carte générée | **Une nouvelle rencontre t'attend.** |
| CTA standard | **Voir le profil** |
| CTA profil déjà démasqué | **Revoir le profil** |
| CTA profil généré | **Découvrir le profil** |
| Aide discrète | **Glisse à gauche ou à droite** |
| Boutons navigation | Aria-labels **Profil précédent**, **Profil suivant** |
| Erreur réseau | **Impossible de charger les profils. Vérifie ta connexion.** |

**Interdits sur cet écran :** « bureau des enquêtes », « affaire », « dossier », « dossier n° », « enquête », « à enquêter », « ouvrir ce dossier », « suspect », « interrogatoire », « preuves », « objection ». Les noms techniques `dossier`, `affaires` dans le code/données peuvent rester : ce changement est d'abord **produit, rédaction et UI**, pas une migration de schémas.

**Important :** le CTA « Voir le profil » ouvre actuellement directement la **rencontre** via `ouvrirLuxDemasque(id)`. Ne pas créer un écran intermédiaire vide ni modifier ce comportement dans ce lot. Le libellé est une promesse d'entrée dans le parcours date, pas une demande de seconde fiche.

## 4. Composition et direction graphique

### 4.1. Métaphore téléphone

- Une **coque de téléphone/app crédible**, subtile : fond intérieur, barre d'état fictive compacte si utile, coins cohérents, éventuellement nom de l'app ; **pas de téléphone imbriqué dans un autre téléphone**, pas de grosse bordure occupant 15 % de la largeur.
- Les portraits low-poly du jeu sont les **visuels principaux**, et non des portraits de « suspects ».
- **Pas de tampon « DOSSIER N°001 »** sur l'image ; si un marqueur existe, il doit être de nature dating (par exemple « EN LIGNE » uniquement si réellement justifié, sinon rien).
- Conserver le violet/rose/or de LuxApp, mais privilégier les **couleurs dating** pour l'interaction (rose/framboise) ; l'or peut rester une couleur d'appel à l'action, pas une décoration omniprésente.
- Aucun personnage, photo, donnée ou tag inventé. Les bios et villes viennent des données déjà servies au jeu. Ne pas introduire d'indicateur de compatibilité artificiel ou de promesse de « match » calculé sans moteur.

### 4.2. Header réellement centré

Sur le sélecteur uniquement : `Retour | LUX DÉMASQUÉ | espace symétrique`, avec grille `grid-template-columns: 48px minmax(0,1fr) 48px` (ou équivalent robuste). Bouton retour d'au moins **44 × 44 px**, titre centré sur **la largeur du viewport / de la coque**, et non au centre de l'espace restant après le bouton. Conserver le retour vers Jeux et le comportement Android. Vérifier à 320 px avec le logo en police pixel : autoriser une réduction raisonnable ou une variante compacte, jamais de dépassement sur le retour.

### 4.3. Carte profil

Une seule carte active, centrée ; élément légèrement visible derrière possible **uniquement en CSS**, non interactif et sans second rendu 3D.

**Ordre interne :**
1. Grand portrait PS1/low-poly (cadrage visage, sans tampon).
2. **Prénom, âge** en taille forte, mais dans la carte.
3. **Ville**.
4. **Bio publique** (texte intégral ; jamais tronquée sans possibilité de lire la suite).
5. Statut discret (**À découvrir / Déjà démasqué**), sans pictogramme policier.

Image visée autour de **55 à 65 % du bloc carte** en hauteur quand la fenêtre le permet. Sur petit écran, **réduire d'abord le portrait** avant de sacrifier les textes ou les commandes. Garder le repli par initiale en absence de GPU. Ne pas réécrire `lux-demasque-3d.js` ou les modèles dans ce lot ; les yeux de Milo sont un défaut **LD-028 distinct**.

### 4.4. Contrôles

- Flèches gauche/droite accessibles au pouce (cible ≥ **44 × 44 px**) mais visuellement secondaires, idéalement en dehors ou au bas de la carte sans chevauchement avec le portrait.
- **CTA primaire visible « Voir le profil »** (≥ 48–56 px de hauteur) et accessible au pouce en bas.
- Un compteur discret **PROFIL x / n**, sans duplication.
- Pendant le drag : carte suit le doigt, rotation douce bornée ; feedback progressif **« PRÉCÉDENT » / « SUIVANT »**. Pas de tampon « J'aime » qui changerait la sémantique : ici le swipe **parcourt**, il ne matche ni ne rejette.
- Pas de déclenchement automatique du CTA après swipe, ni de son de validation au simple glissement.
- `prefers-reduced-motion` : translation/rotation non essentielles désactivées, mais changement de carte évident et fonctionnel.

## 5. Contrat de comportement, état et non-régression

**Conserver le fonctionnement V1 qui est testé**, sauf microcopy/UI :

- Entrée depuis le hub : `ldOuvrirSelection()`, **aucune partie créée** avant clic explicite sur `ldSelectionConfirmer()`.
- Profils : Milo, Noah, Tom et une carte générée à partir des affaires disponibles ; conserver l'ordre, les IDs internes, et une graine stable de la carte générée jusqu'à confirmation.
- Navigation : `ldSelectionChanger(delta)`, wrap gauche/droite, seuil gestuel existant **|dx| > 65 px**, direction détectée à 12 px ; geste vertical = scroll ; `pointercancel`/perte de capture = aucune décision ; ignorer deuxième doigt et double validation.
- La carte d'un profil « déjà démasqué » est **rejouable** ; ne modifier ni `luxDemasqueResolus`, ni l'affichage réel des résultats sauvegardés.
- `ouvrirLuxDemasque(dossierId)` appelé directement par les tests et les parcours historiques conserve sa sémantique (rencontre immédiate).
- Préserver la génération contrainte, le moteur `LuxDemasqueCore`, les notes de score, les disquettes, les réseaux sociaux, les objections existantes et `ldNouveauDossier()`.
- Conserver un **unique renderer WebGL** et la préparation séquentielle des portraits ; pas de ressource lourde multipliée au swipe.
- Le jeu **Lux Match** demeure masqué au public et n'est **pas** modifié.

## 6. Suite du pivot intradiégétique : principes, pas implémentation dans ce lot

Ces décisions cadrent les prochains écrans, mais **ne doivent pas être codées avec le swipe V2** :

| Élément actuellement visible | Direction future |
| --- | --- |
| Réseaux Pix / Pro / Amis | De **vraies apps sur le téléphone fictif**, avec navigation type accueil/apps, puis retour vers le date |
| Carnet | **App Notes**, où retrouver observations et découvertes |
| Pièces / preuves | **Galerie / Fichiers / favoris**, inventaire de captures ou contenus consultés |
| « Objection » | Renommer / recontextualiser en **Démasquer** ou **Montrer la disquette** ; animation et règles à spécifier séparément, sans imitation d'une franchise extérieure |
| Déposition / interrogatoire | **Conversation de date** et répliques, avec moteur de déduction conservé |

**Principe transversal :** interface **intradiégétique** : les fonctionnalités sont représentées par des outils que le personnage pourrait réellement manipuler sur son téléphone ; pas de panneau externe qui rompt l'illusion. Ne pas réinventer la sauvegarde ou les structures de données pour cela.

## 7. Étapes de développement (un seul écran)

1. **Baseline** : captures du sélecteur actuel à 320×600, 360×740, 393×852, 430×932 ; portrait prêt/non prêt, carte générée, déjà démasqué ; constater le décalage actuel du logo et la hauteur du CTA.
2. **Header** : centrage géométrique indépendant du bouton retour, sans toucher aux autres en-têtes du jeu.
3. **Composition** : mise en scène de téléphone / app dating, suppression des tampons dossier, portrait, nom/âge/ville/bio/statut.
4. **Microcopy** : appliquer le tableau de la section 3 **sur le seul sélecteur**, y compris actions et erreur réseau ; garder les chaînes techniques internes.
5. **Interaction** : conserver moteur gestuel et confirmer explicitement, améliorer tampons de direction et feedback si nécessaire.
6. **Mobile** : contrôler 320×600, 360×740, 393×852, 430×932, tailles de police 130 %/200 %, aide tactile, safe area, scroll vertical lorsque contenu long.
7. **Tests et captures comparatives** : mettre à jour les assertions V1 **uniquement là où le wording change** ; exécuter suite rapide, complète et CI. Faire approuver les captures Samsung **avant tout autre écran**.

## 8. Recette et critères d'acceptation bloquants

- [ ] « Lux Démasqué » **géométriquement centré** dans le header sur 320–430 px.
- [ ] **Zéro mention policière** du tableau d'interdits dans l'UI de sélection ; notamment pas de tampon « Dossier n°001 ».
- [ ] Le sélecteur évoque immédiatement une **app de rencontre dans un téléphone**, et non une fiche de suspect.
- [ ] Les portraits originaux, bios, âges et villes sont affichés fidèlement ; pas de profil inventé.
- [ ] Une seule carte active ; statut affiché sans fausse promesse ; la quatrième carte n'expose aucune solution.
- [ ] Swipes, flèches et retour fonctionnent ; seul le CTA lance la rencontre, **exactement une fois**.
- [ ] Aucun état de progression ou score modifié lors d'un simple swipe ; dossiers résolus/rejouables préservés.
- [ ] Toutes les cibles ≥ 44 px ; aucun débordement horizontal ; contenu accessible avec clavier/zoom/scroll ; CTA atteignable sur 360×740.
- [ ] Mouvements réduits et repli GPU testés ; aucun double renderer.
- [ ] `bash tools/test-lux-demasque.sh rapide` et `complet` + suite critique du dépôt **verts**, captures avant/après publiées.
- [ ] **Capture et essai Samsung approuvés par l'utilisateur** ; alors seulement cocher **LD-048** sur `main`.

## 9. Traçabilité

**V1 en production de branche (à remplacer visuellement) :** commits `cbf647d`, `d21f953`, `e07cbfc` ; preuve [CI dédiée](https://github.com/aym2020/LuxApp/actions/runs/40783142046) et [captures](https://github.com/aym2020/LuxApp/actions/runs/40783142046/artifacts/12857654477).

**V2 :** ce document est **uniquement une spécification**, ni code ni maquette approuvée. Toute livraison de la V2 consignera ses commits, tests, captures et réserves ici. **Ne pas avancer LD-002.01**, dont la validation distincte reste ouverte.

## 10. Livraison V2

Écran de profils dating, grille d'en-tête symétrique, portrait PS1, textes et CTA dating, sans changement du moteur. Tests du sélecteur adaptés. Validation graphique Samsung et CI requises avant de clore LD-048.

## 11. Refonte structurelle V3 — téléphone réellement intégré

Le sélecteur V2 (simple fiche encadrée) a été rejeté sur les captures Samsung. La V3 remplace le DOM du sélecteur par **un téléphone fictif complet** : coque, faux statut mobile, encoche, barre d'app de dating, carte portrait immersive avec texte en overlay sur dégradé, trois contrôles bas intégrés (précédent / rencontrer / suivant), compteur et aide discrets. Aucune carte d'affaire, aucun gros bouton jaune sous le portrait. Le seul CTA qui ouvre la partie est au centre du téléphone, via `ldSelectionConfirmer()`. Le swipe gauche/droite continue seulement de changer le profil. Aucune modification du moteur, des contenus, des scores ou de Lux Match. **Reste : tests navigateur, images comparatives et validation Samsung.**

## Mise en œuvre — 29 octobre 2026

Noms visibles **Red Flag** et **Cringr**, retrait des boutons fléchés, pile de cartes renforcée, démonstration du geste au premier accès, tampons de direction. Les identifiants techniques du jeu sont conservés afin de préserver les sauvegardes. **Validation graphique Samsung encore attendue.**

## Portraits narratifs V4 — implémentation

Quatre décors SVG pixel-low-poly statiques, liés à des éléments publics des profils : voyage pour Milo, environnement urbain professionnel pour Noah, balade extérieure pour Tom, ville générique pour le profil surprise. La photo affichée utilise le vrai rendu `m.portrait()` du modèle 3D du date, détourage de la couleur connectée aux bords puis composition hors ligne dans un canvas 360×520. Le résultat est conservé en mémoire dans `ld.images['profil-photo:'+id]` ; pas de modèle alternatif inventé. Si composition impossible, utiliser le portrait 3D historique. Coque Cringr, texte SWIPE en haut au centre, suppression du fond uni et de la pile factice, CTA rond cœur. À valider sur Samsung (silhouettes, yeux, luminosité et bio). Cette approche génère les photos à la demande : elles ne sont pas des captures fixes préexportées.
