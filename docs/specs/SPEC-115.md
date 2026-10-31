# SPEC 115 — RED FLAG / CRINGR : prologue cinématique « Le téléphone vibre »

**Décision de conception :** 31 octobre 2026 · **Branche de travail :** `2.1` · **Statut : SPÉCIFIÉE — NON IMPLÉMENTÉE, NON TESTÉE, NON VALIDÉE SUR SAMSUNG.**  
**Priorité proposée :** P1 narratif / expérience d'entrée, à planifier sans bloquer les corrections et validations déjà ouvertes.  
**Portée :** nouvelle introduction **avant** le sélecteur Cringr de RED FLAG, sans changer les rencontres, preuves, objections, dossiers, résultats ni le moteur d'apprentissage.  
**Important :** la prochaine action canonique `LD-002.01 — Rencontre` reste inchangée dans [la TODO RED FLAG sur `main`](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md). Cette SPEC n'est **ni une réouverture de LD-048 ni un remplacement de SPEC 113**. Son ordonnancement devra être décidé dans le suivi avant implémentation.

## 1. Problème produit et intention

L'actuel écran Cringr montre immédiatement quatre prétendants masculins. Il suggère le dating, mais **n'installe pas visuellement le point de vue** : le joueur incarne une femme qui cherche un rendez-vous et se prépare à rencontrer quelqu'un. La suite du gameplay est une conversation en luxembourgeois où le joueur peut confronter les histoires racontées par le prétendant avec des preuves en français ([SPEC 110](SPEC-110.md)).

**Promesse de la scène :** « Une femme reçoit un message, prend son téléphone et se retrouve naturellement dans Cringr. » Le joueur comprend le rôle par l'action, sans écran de texte « Tu incarnes une femme » ni tutoriel long. Le ton est léger, complice, rétro 16/32 bits, avec une petite tension comique sur les prétendants qui embellissent leur vie, **sans révéler les mensonges d'un dossier**.

**Décision UX :** une **cinématique hybride 3D courte + interface 2D de messages**, intégrée au faux téléphone, **une seule fois au premier lancement**, entièrement passable, avec possibilité de la revoir volontairement. À partir de la deuxième entrée, le joueur rejoint directement Cringr comme aujourd'hui.

**Non-objectifs :** cinématique photoréaliste, animation anatomiquement exacte des doigts, éditeur d'héroïne, choix d'apparence, personnage jouable librement en 3D, modification de Lux Match, nouvelles règles de scores, mise en scène de rencontre avant le LIKE, séquences à rallonge, caméra 3D exploratoire.

## 2. Storyboard normatif

| Temps cible | Plan / image | Animation et son | Transition / intention |
|---|---|---|---|
| **0,0–1,4 s** | Plan rapproché d'un téléphone sombre posé sur une table dans une pièce low-poly, lumière nocturne violette/rose. | Deux vibrations brèves **visibles** (léger déplacement du téléphone + traits pixel) ; halo de notification ; effet sonore original discret **uniquement si audio autorisé**. | Attirer immédiatement l'attention, sans texte introductif superflu. |
| **1,4–2,8 s** | Plan trois-quarts sur l'**héroïne féminine**, en tenue quotidienne, silhouette et visage suffisamment visibles pour installer qui l'on incarne. Elle tend le bras vers le téléphone. | Animation d'attente réutilisée et déplacement/rotation très sobres ; **coupe de caméra avant la préhension**. Il n'est pas requis que les doigts entourent l'objet. | Raconter la prise du téléphone grâce au montage, pas au rigging. |
| **2,8–4,0 s** | Gros plan du téléphone comme tenu vers la caméra, puis écran presque plein cadre. | Translation/zoom courts de l'objet ou de la caméra ; fondu/masquage synchronisé vers une **interface HTML** nette. Pas de véritable capture Three.js utilisée comme UI de lecture. | Passage diégétique naturel du décor au faux smartphone. |
| **Après 4,0 s** | Écran de **messages** affiché dans le téléphone de Cringr / son faux OS (avant l'application de rencontres). | Deux bulles brèves, 1 notification Cringr, puis le CTA « Ouvrir Cringr ». L'utilisateur contrôle le rythme. | Situer le rendez-vous et inviter à consulter les profils. |
| **Action utilisateur** | Sélecteur Cringr **SPEC 113** actuel, avec le premier profil qui aurait été proposé sans prologue. | Transition courte vers le faux écran Cringr ; la musique d'enquête existante prend la suite **sans doublon ni relance concurrente**. | Rejoindre le gameplay existant sans changer dossiers ni progression. |

**Objectif de durée :** environ **quatre secondes pour les plans automatiques** (hors temps volontaire de lecture des messages). Les durées sont une **cible de direction**, pas un délai bloquant : chargement, accessibilité et puissance de l'appareil priment. Pas de lecture forcée de bulles sous chronomètre.

### 2.1 Composition visuelle

- Pièce stylisée **PS1 / basse résolution** : table de nuit ou petite table, téléphone, une source de lumière chaude et un halo violet/rose. On reconnaît un intérieur, sans créer un décor complexe inutile ; **quelques primitives géométriques** ou un meuble Kenney existant suffisent.
- **Héroïne** : un modèle féminin low-poly existant (exemple technique identifié : `Casual3_Female`) recoloré de manière cohérente, à figer après vérification du rendu réel. Ne **pas** reprendre l'identité narrative d'un profil féminin de Lux Match, ni le personnage Alex de Lux Match ; seule la géométrie peut être mutualisée.
- Téléphone 3D : bloc minimal aux proportions crédibles, matériaux sombres, écran lumineux simplifié. L'interface de messages finale est du **HTML/CSS accessible** ; éviter de rendre du texte lisible en texture 3D.
- Effet de vibration : léger décalage court du téléphone / traits pixel, **pas de caméra qui tremble** et pas de vibration haptique obligatoire. Respecter `prefers-reduced-motion`.
- Montage rétro : deux coupes nettes possibles et un zoom simple ; pas d'interpolation de bras ou d'IK obligatoire, pas de geste humain à produire pour un impact de quelques secondes.
- L'héroïne est cadrée assez longtemps pour être comprise comme **la protagoniste**, pas comme une nouvelle candidate à swiper.

### 2.2 Messagerie de contextualisation (proposition éditoriale française à valider)

La conversation doit être plausible et **très courte**, pas explicative ni publicitaire. Proposition :

> **Amie :** « Alors, prête pour ton date de ce soir ? 👀 »  
> **Toi :** « Pas encore trouvé avec qui ! »  
> **Notification Cringr :** « 4 profils à découvrir ♥ »

CTA principal : **« Ouvrir Cringr »**. Ne pas demander de sélectionner un dialogue ni de confirmer chaque message individuellement. Aucun texte en luxembourgeois n'est requis ici : le contrat pédagogique de SPEC 110 utilise le LU dans les échanges du rendez-vous, les indices contextuels pouvant être en français.

**Point d'attention :** le chiffre de la notification doit refléter le **nombre réel de profils chargés** ; ne pas figer « 4 » si un chargement partiel, une autre configuration ou un catalogue étendu diffère. Ne jamais afficher une fausse information de progression. Si les données ne sont pas encore disponibles, afficher une notification générique (« De nouveaux profils t'attendent ») puis le nombre réel après chargement.

## 3. Audit des ressources existantes et limites réelles (GitHub `2.1`, 31/10/2026)

| Ressource | État observé | Usage autorisé / manque à traiter |
|---|---|---|
| `public/lux-match-3d.js` | Three.js r170 local, rendu PS1, `GLTFLoader`, un seul `WebGLRenderer` partagé, scènes et caméra existantes | Réutiliser la fabrique 3D ; créer une petite **scène d'introduction** / API dédiée, **sans second renderer**. L'API `partage()` actuelle **ne fournit pas encore** de scène « prendre le téléphone ». |
| Modèles GLB | `data/jeux/lux-match/contenus-v02.json` référence notamment `Casual3_Female` / `Casual2_Female` ; le moteur charge les modèles à la demande depuis `public/lux-match/` | Choisir un modèle existant après preuve de disponibilité, d'apparence, de licence et de performance. Réutilisation **technique seulement**, sans changer les données de Lux Match. |
| Animations | `anims.glb`, système `AnimationMixer`, `Idle` et plusieurs animations utilisées dans les jeux (dont `Walk`, `Jump` côté contenus) | Poser/faire avancer le bras **si une animation existante convient** ; **aucune animation de saisie avec doigts et téléphone n'a été identifiée**. Plan/coupe obligatoire en repli. Ne pas promettre de rigging non vérifié. |
| Décor | `cafe.glb` Kenney + primitives utilitaires Three.js déjà utilisées pour les photos de preuves | Petite table et intérieur construits **avec primitives**, éventuellement meuble déjà chargé ; pas de nouvelle scène GLB lourde exigée. |
| Audio | `public/lux-demasque-audio.js` : un `AudioContext` au premier geste, musique enquête/déposition, sons, préférences et suspension | Effet de vibration/notification original, facultatif et déclenché seulement avec permission d'autoplay. Réutiliser le bus existant ; ne jamais créer un second AudioContext. |
| Entrée RED FLAG | `ldOuvrirSelection()` → chargement des données → `ldRendreSelection()`, sans partie avant LIKE | Insérer un **état prologue** conditionnel avant le sélecteur, sans appeler le moteur de dossier prématurément. Conserver la sélection et la graine générée lorsque le prologue est passé. |
| Mobile/PC | [Charte UI `6 bis](../CHARTE_UI_2.1.md), [SPEC 114](SPEC-114.md), [SPEC 113](SPEC-113.md) | Conserver l'enveloppe PC **640 px**, le téléphone Cringr proportionné et le mobile 320–430 px utilisable. L'introduction n'est pas une nouvelle page Full HD. |

**Arbitrage technique verrouillé :** la **version initiale** ne doit nécessiter **ni rigging personnalisé ni nouveau modèle 3D**. Si le rendu féminin, la pose ou le zoom s'avère insatisfaisant, améliorer le cadrage et le montage ou utiliser le fallback 2D ; proposer un nouvel asset comme amélioration séparée, pas comme prérequis silencieux. Les GLB exacts, clips disponibles et licences doivent être vérifiés **dans le dépôt actuel et en navigateur** avant de commencer les animations.

## 4. Contrat fonctionnel, états et navigation

### 4.1 Déclenchement et mémoire

- Le prologue se montre **une seule fois par installation/profil de stockage** au premier accès RED FLAG, avant `ldRendreSelection()`, si l'option d'accessibilité n'impose pas un démarrage direct sur messages.
- Conserver un état dédié, **distinct** de `luxDemasqueResolus`, des records, des seeds et des préférences audio. Exemple de clé **à valider selon `ldCle()`** : `luxDemasquePrologueVuV1`.
- Marquer le prologue vu après **lecture jusqu'au passage aux profils ou choix explicite « Passer l'intro »**. Ne pas marquer vu si le chargement échoue avant la première possibilité d'interaction.
- Au prochain lancement, arriver directement au sélecteur Cringr comme aujourd'hui. Pour le relecture volontaire, proposer une entrée **« Revoir l'introduction »**, discrète dans l'environnement RED FLAG (menu ou hub, à définir selon l'UI disponible), sans alourdir les actions du sélecteur.
- Si `localStorage` est refusé/indisponible, **ne pas bloquer l'entrée**. Éviter la répétition à chaque retour dans une même session (mémoire volatile) ; accepter qu'une future session puisse rejouer faute de persistance.

### 4.2 Boutons et comportement

- **« Passer l'intro »** doit être accessible **dès la première image**, pendant le chargement, pendant les quatre secondes de plans et sur l'écran de messages. Une activation ouvre **directement** le sélecteur (`SPEC 113`), sans attente ni seconde cinématique.
- **« Ouvrir Cringr »** passe au sélecteur sans démarrer de dossier ni écrire de LIKE. Les gestes `NOPE/LIKE` ne sont actifs **qu'une fois dans Cringr**.
- **Retour Android / navigateur :** en prologue, revient au hub Jeux et arrête animation/son. Dans les messages, même comportement ou précédent état explicitement défini dans la recette ; ne pas intercepter Retour pour forcer la lecture du prologue. Après entrée sur Cringr, préserver le comportement actuel SPEC 113.
- **Double clic**, skip pendant un chargement GLB, sortie de la vue ou changement de partie : annuler promesses/transitions obsolètes (jeton d'ouverture type `ld.ouverture`), **une seule transition effective**, pas de canvas zombie ni de musique jouant après sortie.
- Un échec d'asset, de décodage audio ou de WebGL ne bloque jamais `« Ouvrir Cringr »`.

### 4.3 Audio, animation et accessibilité

- Le son de vibration est un **bruitage original discret**, pas un morceau sous copyright. Pas de bruitage si l'utilisateur a désactivé le son ; respecter `luxDemasqueSon` et `luxDemasqueMusique`.
- L'AudioContext ne doit démarrer **qu'après un geste utilisateur autorisé** (l'action « Jouer » du hub peut être réutilisée si elle suffit sur Android, sinon silence). En cas d'échec autoplay, **ne pas insister en boucle**.
- Pendant la courte intro, ne pas lancer deux musiques ; à l'ouverture de Cringr, reprendre la synchronisation d'enquête existante. Sortie, pause et `document.hidden` arrêtent/suspendent sons et animations.
- `prefers-reduced-motion: reduce` : aucune secousse, travelling ou zoom imposé ; présenter une image fixe / transition immédiate vers les messages, toujours avec CTA.
- Les dialogues et notifications existent en **vrai texte DOM**, lisibles par lecteur d'écran, ordonnés correctement, avec libellés accessibles. Ne pas exposer 3D décorative comme information obligatoire.
- Zones tactiles **≥48 px** pour les CTA, focus visible et conservé après la transition, clavier/Entrée, zoom du texte et Android Back utilisables. **Aucune étape essentielle seulement en animation ou en audio.**

## 5. Contrat technique d'intégration

**Ne pas créer un second mini-jeu ni un nouveau moteur de navigation.** Ajouter un état de présentation limité à RED FLAG (ex. `prologue-cinema`, `prologue-messages`, `selection`) avant l'état métier actuel, avec transition explicite vers `ldOuvrirSelection()` ou un point d'entrée refactorisé sans duplication de chargement.

1. **Vérifier avant code** le comportement actuel de `ldOuvrirSelection()`, `luxDemasqueArreter()`, `ldVueActive()`, `ldObtenir3D()`, `ldSynchroMusique()` et du `MutationObserver` ; déterminer où l'état prologue peut être annulé proprement. Aujourd'hui, l'arrêt / observation se fonde largement sur `ld.partie` ou `ld.selection` : **un prologue sans ces deux états ne doit pas rester actif après navigation**.
2. **3D :** étendre proprement le module partagé `public/lux-match-3d.js` (nouvelle fonction d'introduction/état local) ou une API d'adaptation légère utilisant l'instance existante. Ne pas modifier le comportement de `date()`, `interrogatoire()`, `apercu()`, `portrait()` ou des photos, ni les assets/données de Lux Match.
3. **Scènes :** découper en plans contrôlés, sans `setTimeout` non annulables au départ de la vue ; prévoir une seule horloge d'animation liée au renderer, suspension quand onglet masqué, annulation sur skip, déchargement et navigation. Tester notamment la création d'un portrait Cringr après une intro interrompue : **renderer partagé non occupé**.
4. **2D :** module de présentation réutilisant la coque / typographie Cringr (SPEC 113) pour les messages et notifications ; conserver le titre RED FLAG hors du faux téléphone, à la même place que le sélecteur lorsque cela sert la continuité visuelle.
5. **Cache, versioning et PWA :** mettre à jour les références nécessaires sans casser le service worker / préchargement des assets. Une cinématique ne doit pas imposer des téléchargements lourds à chaque accès.
6. **Ressources :** ne charger la 3D que si l'on va réellement afficher la cinématique ; les joueurs l'ayant déjà vue vont directement au sélecteur sans coût supplémentaire de la scène. Éviter tout nouveau contexte WebGL ; contrôler mémoire et FPS réels sur Samsung.

### Repli visuel obligatoire

Sur WebGL absent, GLB indisponible, chargement lent ou choix de mouvement réduit : afficher **une image/illustration statique légère** du téléphone qui s'allume (HTML/CSS ou asset original du projet), puis l'écran de messages. La progression vers Cringr est toujours indépendante du succès de la cinématique.

**Principe qualité :** pas de scène 3D médiocre simplement parce qu'on veut de la 3D. Une coupe cinématographique propre et un bon cadrage valent mieux qu'une main qui traverse le téléphone.

## 6. Plan d'implémentation limité et ordonné

**Lot A — POC visuel isolé.** Confirmer la présence des GLB féminins, du clip utile et des licences ; capturer en navigateur la protagoniste, la table et le téléphone à 360×740. Mesurer coût de rendu et tester l'animation sans modifier encore l'entrée du jeu. Arbitrer la coupe de caméra ; si la main est peu crédible, adopter immédiatement le plan qui masque le contact.

**Lot B — Cinématique et transition.** Ajouter les quatre plans, la commande « Passer l'intro » et l'annulation propre ; brancher exclusivement sur l'instance WebGL partagée. Tester accès direct au sélecteur, sortie immédiate, retour et panne de ressource.

**Lot C — Écran messages.** Créer les bulles HTML, notification Cringr et CTA ; raccord stable avec la sélection existante et les messages exacts approuvés. Musique/SFX et préférences audio sans conflit.

**Lot D — Persistance et relecture.** Première visite, visites suivantes, bouton « Revoir », stockage refusé, rafraîchissement, multi-clics et reprise après interruption ; garder le gameplay `LD-048` / `SPEC 113` inchangé.

**Lot E — Recette et livraison.** Mesures, captures, tests dédiés/partagés, audit Android et validation produit explicite. N'effectuer aucun changement de contenu LU/FR des dossiers, du moteur de vérité, des scores ni des sauvegardes de jeu.

Livrer **par incréments testables** plutôt qu'un chantier monolithique. En cas de baisse du budget ou d'un problème d'asset, préserver une version fonctionnelle **messages + transition 2D**, puis enrichir la cinématique séparément.

## 7. Recette d'acceptation (bloquante)

| ID | Scénario | Résultat attendu |
|---|---|---|
| PR-01 | Première ouverture de RED FLAG depuis Jeux | Le prologue apparaît, femme et téléphone identifiables ; CTA Passer visible immédiatement |
| PR-02 | Animation complète | Vibration visuelle → femme tend le bras → coupe / zoom téléphone → messages ; aucun saut disgracieux ni animation de doigts ratée |
| PR-03 | Messages | Discussion courte en FR, notification cohérente avec le catalogue réel, action « Ouvrir Cringr » lisible |
| PR-04 | Passage normal / skip à chaque plan / skip pendant chargement | **Même sélecteur Cringr** que sans prologue, une seule fois, aucune partie créée avant LIKE |
| PR-05 | Retour depuis cinématique/messages, relance, navigation ailleurs | Aucune scène/canvas/son orphelin, retour au hub correct, aucun blocage |
| PR-06 | Réouverture après intro vue, puis « Revoir l'introduction » | Accès Cringr immédiat par défaut ; relecture volontaire sans altérer le sélecteur |
| PR-07 | WebGL bloqué, GLB 404/chargement lent, stockage refusé | Repli 2D et messages utilisables ; jamais écran noir ni chargement infini |
| PR-08 | Son et musique désactivés, autoplay refusé, application en arrière-plan | Silence correct, aucune reprise intempestive ou deuxième contexte musical |
| PR-09 | `prefers-reduced-motion`, clavier, lecteur d'écran, texte 200 % | Animation réduite/supprimée, texte DOM accessible, focus et CTA utilisables |
| PR-10 | 320×600 / 360×740 / 393×852 / 430×932 et PC 768/1440 px | Zéro débordement horizontal, CTA visible avec safe areas, même enveloppe 640 px sur PC |
| PR-11 | 1, 4, 0 profil(s), profil résolu, profil généré | Notification exacte ou générique ; pas de modification de graine, d'ordre, de record ou d'état résolu |
| PR-12 | Trois enchaînements intro → Cringr → rencontre → retour / nouveau dossier | Zéro régression sur portrait 3D, animation swipe, logique LIKE/NOPE, sons, scores et Lux Match masqué |

**Tests minimum à exécuter et consigner :** `bash tools/test-lux-demasque.sh rapide` puis `complet`, tests ciblés de sélection SPEC 113, régression `test/lux-match*.test.cjs` et `tests/test_lux_demasque_audio.py`, suite critique du PLAYBOOK selon dépendances modifiées ; Playwright Chromium avec captures avant/après ; **vrai Samsung** pour GPU, vibration visuelle, reprise, audio et Retour. Une capture et une CI verte ne remplacent pas l'accord produit.

**Critère d'arrêt :** si le prologue impose un coût de chargement sensible, crée un artefact visuel évident ou perturbe Cringr, adopter le **fallback 2D/messages** et ne pas livrer la 3D comme « terminée ».

## 8. Gouvernance documentaire et statut

- **SPEC 110** : préserve moteur, narration, mécanique d'enquête, LU/FR, musique et progression ; reste normative après le prologue.
- **SPEC 113** : demeure **la référence du sélecteur Cringr**. Cette SPEC 115 ne modifie ni la carte, ni les boutons cœur/croix, ni les gestes.
- **SPEC 114** et charte UI : géométrie PC/mobile et ergonomie inchangées.
- **TODO canonique sur `main` :** suivre l'implémentation dans une tâche dédiée **à créer/planifier avant travaux**. Ne pas cocher `LD-048`, `LD-002.01` ou autre tâche comme « faite » au seul titre de cette SPEC.
- **État de livraison de cette fiche :** rédaction et indexation documentaire uniquement. **Pas de code, asset, scène, musique ni test de l'application modifié ou exécuté.**

**Définition de terminé :** l'utilisateur reconnaît spontanément qu'il incarne une femme cherchant un date, la transition dans le téléphone paraît naturelle, l'introduction ne l'ennuie pas à la seconde partie, tous les cas PR-01 à PR-12 sont vérifiés et l'expérience est approuvée sur Samsung.
