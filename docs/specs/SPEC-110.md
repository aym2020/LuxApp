# SPEC 110 — Lux Démasque : dépositions, preuves et objections en luxembourgeois

> **Suivi actif de la refonte V1.1 :** [TODO Lux Démasqué, branche `main`](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md) — 47 tâches, prochaine action, critères de validation et journal. **Consulter et mettre à jour cette TODO lors de chaque intervention ; ne pas déduire son statut des anciens lots D0–D5 décrits plus bas.** Le code du jeu reste sur `2.1`.

**Dépôt :** `aym2020/LuxApp` · **Branche cible :** `2.1` · **Date de conception :** 27 octobre 2026  
**Statut : IMPLÉMENTÉE SUR `2.1` (lots D0 → D5, 28 octobre 2026) — RECETTE SUR APPAREIL SAMSUNG, ÉCOUTE DE LA MUSIQUE, RELECTURE LU NATIVE/LOD ET TESTEUR EXTÉRIEUR ENCORE À FAIRE.** Lux Match est masqué, pas supprimé (§ 12, D0).  
**Suivi d'implémentation :** voir § 12 (lots D0 → D5).  
**Origine :** prototype HTML autonome « Lux Démasque — Dossier n°001 » déjà testé par le joueur, puis demande d'y ajouter le luxembourgeois, un moteur de génération de cas, la 3D low-poly et une bande-son arcade d'interrogatoire. Le fichier HTML original est un prototype de conversation, **non présent dans ce dépôt à la date de rédaction** : ne pas inventer un chemin GitHub. Ce document consigne son fonctionnement et les évolutions souhaitées.

> **Séparation obligatoire :** Lux Démasque est un **mini-jeu distinct de Lux Match** (SPEC 109), même si l'on mutualise des briques techniques. Lux Match reste jouable et sa progression, ses données, ses dialogues et ses parcours ne doivent pas être altérés par ce nouveau jeu. Les propositions abandonnées de Lux Match (LuxTrad, saisie libre, nouveaux personnages joueurs) ne sont pas des dépendances de Lux Démasque.

## 1. Vision : « tous les prétendants sont des disquetteurs »
**Suite de tests V1.1 :** [guide et matrice de couverture](../LUX-DEMASQUE-TESTS.md). Lancer `bash tools/test-lux-demasque.sh rapide` puis `complet` avant chaque refonte ; `acceptation` porte le contrat LD-034 actuellement non conforme. Ne pas déclarer la suite validée sans exécution réelle.



**Pitch :** tu rencontres un homme fictif qui cherche à t'impressionner. Il déroule une courte déposition en luxembourgeois. Ses réseaux en français, les questions que tu lui poses et ses propres affirmations renferment les éléments pour prouver ses **disquettes** — des mensonges crédibles, motivés, et pas de simples erreurs de culture générale. Tu peux réécouter ses phrases, lui demander des précisions et déclencher une objection avec **la bonne preuve**. À la fin, tu dois avoir retrouvé **tous** ses mensonges.

**Règle produit ferme : tous les PNJ sont menteurs** : pas de « profil honnête » tiré au hasard en guise de piège final. **En revanche, plusieurs déclarations de chaque PNJ sont vraies** : le joueur ne doit pas accuser au hasard. Le jeu ne se résume donc pas au choix binaire « honnête/disquetteur » ; le verdict est un **bilan des mensonges prouvés**.

- **Public :** francophones A1.1/A1.2 ; priorité à des structures LU utiles et vérifiables, sans examen de culture générale, football, géographie ou cinéma.
- **Ton :** parodie tendre, mensonges ridicules mais psychologiquement motivés, mauvaise foi, excuses maladroites et surprises. Éviter l'humiliation sociale gratuite (chômage, colocation, revenus) : le gag porte sur le **mensonge pour impressionner**, pas sur la situation réelle.
- **Durée cible :** **4–6 minutes** pour un dossier MVP, sans minuteur pendant la lecture ou la réflexion ; option de rejouer / passer rapidement.
- **Identité visuelle :** reprendre la DA rétro arcade/PS1 low-poly, les accents rose/violet/or et le café de Lux Match, mais une signalétique **dossier, témoignage, pièce et objection** reconnaissable comme un autre mini-jeu.
- **Objectif principal :** prouver toutes les disquettes. Le nombre d'objections erronées affecte le score et peut moduler le résultat, **sans permettre le spam gratuit de preuves**.

## 2. Boucle de gameplay minimale et contrôles

1. **RENCONTRE (courte).** Portrait 3D du prétendant, prénom, âge, quelques traits de profil. Bouton « Commencer le rendez-vous ».
2. **DÉPOSITION (4–6 phrases).** Le PNJ raconte son histoire en **LU**. Le joueur avance/revient librement entre les déclarations, peut lire la traduction FR seulement via l'aide. Pas de compte à rebours.
3. **ENQUÊTE.** Depuis chaque phrase, **Faire préciser** lance **une question LU rédigée** et une réponse du PNJ, parfois révélatrice ; **Réseaux** ouvre Pix, Pro et Amis en **FR** ; les contenus consultés alimentent le **carnet de preuves**.
4. **OBJECTION.** Sur la déclaration ciblée, le joueur choisit « Objection ! », puis **la pièce** qui contredit réellement cette déclaration : post, capture, photo annotée, précision recueillie, ou **une autre phrase de la déposition**. L'action fonctionne comme « déclaration ciblée + preuve », pas comme un bouton qui détecte tout automatiquement.
5. **CONFRONTATION.** Si la preuve est logiquement suffisante : impact arcade + réaction 3D du prétendant + tentative de justification/aveu. Si la preuve est inadéquate : réplique amusante, tentative décomptée, dossier toujours ouvert. On peut reprendre l'enquête.
6. **BILAN.** **3/3 disquettes démasquées** (ou nombre du dossier), taux de preuves réussies, réponses LU revues, motivations révélées **après** la partie, puis « Nouveau dossier ».

**Une seule interaction principale en bas de la scène**, deux boutons contextuels « Faire préciser » / « Objection ! » et navigation précédente/suivante. Le carnet/profil est toujours accessible. N'ajouter **ni roue de dialogue**, ni inventaire RPG, ni champ de saisie libre, ni quatrième réseau, ni longues conversations générées.

### 2.1. Comportement d'une ligne de déposition

Pour chaque `statementId` :
- `baseLu` : affirmation immuable, **identique au retour sur la ligne** ;
- `pressLu` : question de la joueuse prévalidée (une seule au MVP) ;
- `answerLu` : précision du PNJ, éventuellement nouvelle **pièce de déposition** ;
- `targetable` : la ligne est sélectionnable pour une objection, même si elle est vraie ; **ne jamais montrer « mensonge » dans le HUD avant preuve** ;
- `acceptedProofSets` : ensemble(s) de pièces suffisantes à sa contradiction (une pièce seule dans le MVP, deux si un test de recoupement clair l'exige) ;
- `onExpose` : justification + aveu/retournement rédigés, **liés à CE mensonge** ; pas de texte générique qui accuse d'un autre sujet ;
- `onWrong` : refus contextualisé sans révéler la bonne preuve.

**Faire préciser** n'est pas une porte infinie : une clarification par déclaration dans le MVP, mémorisée et relisible. Après une objection réussie, la déclaration est marquée « Démasquée » et ne rapporte pas deux fois.

### 2.2. Équité et difficulté

- **Tout mensonge doit être prouvable** en suivant des indices accessibles dans la partie, sans Internet ni connaissances personnelles.
- **Aucune vraie déclaration ne doit pouvoir être « prouvée fausse »** en utilisant un indice ambigu.
- Une photo publiée **ne prouve pas** à elle seule qu'on a voyagé, habité seul ou été employé ; l'opposition doit porter sur un **fait vérifiable** et une temporalité claire.
- Mentir n'implique pas que chaque phrase sur le même thème soit fausse. « Je travaille », « j'ai travaillé » et « je cherche du travail » ne sont pas interchangeables.
- Au moins un mensonge par dossier nécessite **Faire préciser** ; au moins un repose sur un réseau FR ; un troisième peut demander de **recouper deux paroles** ou comparer une photo datée et une déclaration. Varier la difficulté.
- Les publications de preuve ne doivent pas toutes écrire **explicitement la confession** (« Je n'ai jamais été à Kyoto ») : ce défaut du prototype est à corriger. Privilégier des indices contextualisés, **suffisants** mais non fléchés.
- Une objection incorrecte retire un bonus de score et déclenche une riposte courte, **sans révélation automatique**. Tester si une limite douce est nécessaire contre la brute-force ; **pas de vies, monnaie ou chronomètre ajoutés sans validation de recette**.
- Le carnet ne révèle pas les `targetStatementId` ou `lieId` ; les métadonnées restent internes.

## 3. Premier dossier : Milo — conserver le prototype, améliorer les preuves

**Personnage : Milo, 30 ans.** Il veut paraître indépendant, professionnellement établi et grand voyageur. Il ment pour impressionner, **pas parce qu'il est intrinsèquement méchant**.

**Prototype HTML français actuel : six déclarations, trois mensonges (`job`, `flat`, `japan`) et trois vraies (`run`, `cooking`, `cat`).** Sur le prototype, les trois preuves sont obtenues depuis Pro/Amis/Pix, les « précisions » sont uniques, les objections confrontent `statementId` et `proofId`, puis le bilan révèle la motivation. **On conserve ce noyau**, mais on le rend moins trivial.

| Sujet | Déclaration du PNJ (intention FR, pas texte LU final) | Réalité de l'auteur | Piste de preuve visuelle / textuelle | Motivation révélée APRÈS |
| --- | --- | --- | --- | --- |
| **Métier (mensonge)** | « Je dirige toujours une équipe chez Horizon Voyages. » | Son contrat y a pris fin en juin | **Pro**, ligne d'expérience indiquant « juin 2026 — fin » / publication datée annonçant son départ. Dates cohérentes avec un date en octobre. Une confirmation de détail peut préciser « j'y suis encore ». | Paraître stable malgré une période de recherche |
| **Logement (mensonge)** | « J'habite seul dans mon appartement à Bonnevoie. » | Il habite **en colocation avec Sami** | **Amis**, publication datée d'emménagement « notre coloc », photo de deux cartons nommés / message du colocataire. Une visite occasionnelle de Sami ne suffit pas à le prouver : pièce et texte doivent établir la cohabitation. | Paraître autonome |
| **Japon (mensonge)** | « J'ai passé trois semaines à Kyoto en août. » | Il n'y est pas allé, son album est un montage | **Pix**, photo avec indices de montage **plus** une publication/une précision incompatible avec ce voyage (ex. récit daté d'avoir passé tout août dans une activité locale **sans partir**). Un simple cliché au Japon ou un filtre ne suffit jamais comme preuve. | Paraître aventureux |
| **Course (vrai)** | « Je cours certains dimanches matin. » | C'est vrai, même s'il court dix minutes | **Faire préciser** n'invalide pas « certains dimanches » | Distracteur honnête |
| **Cuisine (vrai)** | « Je cuisine souvent quand mes amis viennent. » | Il prépare effectivement du pesto | Publication/clarification compatible | Distracteur honnête |
| **Chat Pixel (vrai)** | « J'ai un chat qui s'appelle Pixel. » | Le chat existe | Pix le montre ; photo ni mensonge ni preuve d'une autre accusation | Distracteur honnête |

**À améliorer dans l'écriture finale :** les trois preuves de la démo HTML actuelle sont **très directes**, presque des aveux publics. Les réécrire en **micro-enquête logique** : horaires, dates explicites, publications recoupées, éléments visuels contextualisés. **Tester chaque preuve avec un lecteur extérieur** : la contradiction doit être indiscutable au moment de l'objection, sans être affichée comme réponse d'un QCM.

**Pas de « preuve impossible » de fait privé.** Si un mensonge (ex. Kyoto) ne peut être démontré de façon indiscutable par les sources choisies, **changer le mensonge, la preuve ou l'énoncé**, pas l'exigence de logique.

### 3.1. Trois résolutions comiques distinctes

- **Métier :** « Mon contrat s'est terminé, mais je cherchais à faire bonne impression. » Le mensonge est un acte ; être sans emploi n'est pas la chute humiliant le personnage.
- **Colocation :** « J'ai mon espace personnel… enfin, quand Sami ne monopolise pas la cuisine. » Aveu + gag sur le quotidien, pas sur les revenus.
- **Japon :** « C'était Kyoto vu depuis mon canapé. J'ai même ajouté les lanternes ! » Un effet visuel peut montrer le montage **après** que le joueur le prouve.

**Vérification obligatoire :** les dates et les indices doivent rester identiques sur le profil, Pix, Pro, Amis, la précision, la confrontation et le bilan.

## 4. Générateur de dossiers : semi-procédural, **pas génération libre**

**Principe : un générateur de cas assemble des éléments édités et validés** (personnage, motivations, vérités, mensonges, témoignages, clarifications, preuves et réactions). Il **ne fabrique ni mensonges ni phrases LU au hasard**. **Pas de LLM ou de Google Translate au runtime** pour les dossiers du MVP : reproductibilité, performance mobile, sécurité logique, qualité pédagogique.

### 4.1. Unité de génération : l'« affaire » complète

Une affaire est un ensemble **atomique et cohérent** de :
- vérité cachée à l'auteur (`groundTruth`) ;
- mensonge exact (`lieId`, `claimId`, `statementId`) ;
- **motif humain plausible** (`motiveId`) ;
- réplique de déposition LU / aide FR ;
- question et réponse de précision LU / aide FR ;
- **une ou plusieurs preuves matérielles** (`proofId`, `mediaId`, date, provenance, descriptif FR), avec nécessité éventuelle de les combiner ;
- règle d'objection (`targetStatementId`, `requiredProofIds`/variantes) ;
- réaction/aveu/fin humoristique, **conditionnés à la preuve vraiment présentée** ;
- variante de diversion non incriminante, si souhaité.

**Une phrase mensongère sans preuve ou une preuve sans cible valide bloque l'assemblage.** On ne modifie pas aléatoirement des faits isolés : tout changement de métier, lieu ou date doit choisir un **paquet de cohérence** complet.

### 4.2. Composition seedée d'un dossier

Pipeline de génération proposé :
1. Choisir un **PNJ adulte fictif** avec une personnalité et des motivations cohérentes.
2. Tirer **2–3 affaires compatibles** de thèmes différents (emploi, logement, voyage, loisir, animal, famille, travail…), puis **2–3 vérités** qui n'entrent pas en conflit avec le canon.
3. Construire une déposition de **4–6 déclarations**, répartir les cibles, questions et preuves ; éviter les doublons de thème et les contradictions involontaires entre distracteurs.
4. Affecter une **source de preuve variée** (au moins une photo/objet visuel, au moins un post Pro/Amis, au moins une réponse révélée par question si possible).
5. Auditer automatiquement les contraintes : tous les `lieId` ont un chemin de preuve accessible ; les bons couples `statement, proof` sont atteignables ; les mauvaises combinaisons n'établissent pas autre chose accidentellement ; pas de preuve qui révèle explicitement un autre mensonge par inadvertance.
6. Valider la difficulté et figer `seed`, `casePlan`, `contentVersion` pour replay ; garder les révélations inconnues du rendu jusqu'à ce que le joueur les découvre.

**Attention aux « centaines de scénarios » :** un simple changement d'ordre des phrases n'est **pas une nouvelle affaire**. La richesse vient de **variantes réellement différentes de motifs, indices, objections et aveux**. Commencer par **1 dossier intégral**, puis **3–5 dossiers rédigés** avant d'étendre vers **12–18 affaires atomiques réutilisables**. Leur combinaison peut créer des dizaines de parties, mais **uniquement après validation de chaque plan**.

### 4.3. Contrat de données indicatif

```json
{
  "caseId": "MILO_CASE_001",
  "contentVersion": "demasque-v1",
  "npcId": "milo",
  "seed": 123456,
  "statementIds": ["MILO_JOB", "MILO_FLAT", "MILO_RUN", "MILO_JAPAN", "MILO_COOK", "MILO_CAT"],
  "lieIds": ["MILO_JOB_LIE", "MILO_FLAT_LIE", "MILO_JAPAN_LIE"],
  "proofIds": ["PRO_JOB_END", "AMIS_FLAT_SHARE", "PIX_KYOTO_EDIT"],
  "reviewStatus": "fr_design_only"
}
```

```json
{
  "lieId": "MILO_JOB_LIE",
  "claimId": "employment_at_horizon",
  "targetStatementId": "MILO_JOB",
  "motiveId": "desire_to_look_stable",
  "pressId": "MILO_JOB_PRESS",
  "acceptedProofSets": [["PRO_JOB_END"]],
  "exposeReactionId": "MILO_JOB_EXPOSED",
  "reviewStatus": "fr_design_only"
}
```

**Fragments d'architecture, pas de JSON déployable :** les `statementIds` renvoient à des phrases complètes LU/FR **rédigées et auditées**, les media référencent de vrais assets et les preuves sont soumises à un validateur. L'exemple de preuve Kyoto n'est **pas accepté comme suffisant** tant qu'un indice indépendant excluant le voyage n'a pas été défini (sinon `acceptedProofSets` doit exiger cette seconde pièce).

### 4.4. Invariants absolus du générateur

- **Tous les prétendants ont ≥2 mensonges réels**, et leur nombre exact est connu **du moteur**, pas nécessairement affiché dès l'intro finale (prototype actuel = trois visibles).
- **Toutes les disquettes sont détectables sans deviner** : chaque mensonge a un chemin de preuve audité, accessible sans action irréversible ni connaissances extérieures.
- Les vrais faits ne deviennent jamais de faux mensonges à cause du mélange de deux affaires.
- **Les mêmes indices prouvent les mêmes faits** ; aucune photo/chronologie générée ne contredit par accident le canon.
- **Toutes les sorties** (question, objection correcte, objection fausse, révélation, fin) possèdent une réplique LU/FR adaptée et un état défini ; impossible d'être bloqué faute de preuve chargée.
- Tous les objets affichés ont un identifiant et une provenance ; toutes les cartes d'indices consultées sont retrouvables dans le carnet.
- **Même seed + mêmes décisions = même parcours**. Le score et le récapitulatif ne citent que ce qui a été réellement consulté et prouvé.
- Les contenus portant `reviewStatus` inacceptable pour publication ne sont **jamais tirés en production**.

## 5. Langues et pédagogie : FR pour les indices, LU pour l'interrogatoire

| Surface | Langue | Règle |
| --- | --- | --- |
| Pix / Pro / Amis, légendes et pièces visuelles | **FR principal** | Les joueurs francophones comprennent les éléments de preuve immédiatement. |
| Déposition du PNJ | **LU principal** | Courtes phrases naturelles A1.1/A1.2, en unités lisibles ; pas de texte LU généré par concaténation libre. |
| Question « Faire préciser » de la joueuse | **LU** | Question rédigée, éventuellement prononcée sans QCM additionnel. |
| Réponse/justification du PNJ | **LU** | Même régime que la déposition, avec sous-titrage FR facultatif selon le réglage. |
| Objection et preuve sélectionnée | **UI FR**, déclaration contestée en LU, preuve FR | Le raisonnement consiste à **relier le sens d'une phrase LU à une pièce FR** ; on ne teste pas une culture externe. |
| Scores et bilan | FR + rappels LU | Succès logique et apprentissage séparés ; les réponses factuelles/culturelles ne sont pas des fautes de grammaire LU. |

- **Aide FR** disponible pour la déposition, la question, les justifications ; ne pas rendre la traduction obligatoire et **ne pas désactiver l'enquête au prétexte de « FR OFF »**.
- Auditer les phrases LU contre les **leçons**, `grammaire_luxembourg.md` et **LOD.lu**. Une intention de dialogue FR ne peut être annoncée « certifiée LOD » sans revue.
- Vocabulaire progressif : métiers, logement, lieux, temps (« depuis », « avant », « maintenant »), voyages, habitudes ; privilégier les contradictions dont les nuances sont compréhensibles au niveau étudié.
- Ne pas afficher les solutions en surlignant automatiquement les mots de contradiction dans la phrase LU ; l'aide de vocabulaire ne doit **pas** dévoiler l'indice logique.
- Si une contradiction exige une négation ou chronologie trop subtile pour A1.1, soit la reformuler avec des structures déjà enseignées, soit l'identifier **A1.2 non notée** et fournir une aide claire.
- **L'objectif pédagogique est compréhension + logique + questions usuelles** ; aucun besoin de faire écrire un texte libre pendant le rendez-vous.

## 6. Preuves visuelles : mini-inventaire compréhensible et crédible

**Oui, les preuves doivent avoir une forme visuelle**, mais **ne doivent pas nécessiter de nouvelles scènes 3D complexes**.

Trois familles de pièces :
1. **Photo Pix** : vignette stylisée low-poly (personnage/décor/objet), date/légende FR, détail vérifiable zoomable. Produire si possible des captures **depuis la scène 3D** déjà présente ; vérifier que les éléments décisifs (date, lieu, montage) sont **clairs en rendu mobile**.
2. **Capture Pro / Amis** : carte d'application fictive avec publication, historique de métier ou message court, date et auteur. Design arcade cohérent, **pas de logo, capture ou marque réels**.
3. **Extrait de déposition** : petite carte de phrase LU réellement entendue ; la pièce n'apparaît dans le carnet qu'après la déposition ou la précision correspondante.

Chaque preuve comporte `proofId`, source, date, titre court, media/alt, transcription, éléments logiques et statut de découverte. **Aucun texte déterminant uniquement dans une image sans équivalent textuel accessible** ; pas de reconnaissance visuelle trop fine sur 320 px. L'effet « preuve brandie » peut afficher la carte comme un élément 2D à l'écran devant le décor 3D.

**La preuve et la déposition doivent être logiquement incompatibles**, pas simplement incongrues : « photo à Kyoto » ne démontre pas un voyage ; « deux noms sur une boîte aux lettres » seul ne démontre pas une colocation ; « j'ai arrêté en juin » contredit « j'y travaille encore en octobre » si les termes/dates sont explicités.

## 7. 3D et UI mobile : réemployer l'existant, pas le casser

**Références techniques vérifiées sur GitHub `2.1` :**
- `public/lux-match-3d.js` : **Three.js r170 local**, cache de modèles, **WebGLRenderer unique**, rendu basse résolution PS1, personnage Quaternius et café Kenney ; API de portraits, aperçu, date et réactions.
- `public/lux-match.js` : UI HTML/CSS, faux téléphone, modales, système audio Web Audio / boucles OGG-MP3, pause et visibilité document.
- `public/lux-match-core.js` : moteur pur JS/Node de Lux Match, **à ne pas détourner directement pour les mensonges du PNJ** sans isolation des états.

**Architecture recommandée :**
- `lux-demasque-core.js` : moteur **pur** (dossier, génération, découverte, objections, assertions, états), sans DOM.
- `lux-demasque.js` / `.css` : déposition, navigation, pièces, modale d'objection, bilan.
- Un **adaptateur 3D partagé et versionné** peut exposer café + personnages masculins low-poly + 4 réactions (`neutral`, `nervous`, `caught`, `relieved`). Ne pas recopier intégralement le moteur Three.js ; ne pas changer silencieusement l'API Lux Match.
- Réutiliser les GLB compatibles et leurs licences existantes ; si le modèle masculin manque pour un profil, garder un modèle simple plutôt que bloquer le prototype.
- Les dialogues restent en **HTML lisible** par-dessus la scène 3D ; ne jamais les dessiner dans un canvas inaccessible.

**Disposition mobile :** scène 3D en arrière-plan, **une déclaration visible à la fois**, flèches précédent/suivant, dock inférieur stable « Faire préciser » / « Objection ! », accès simple aux réseaux et au carnet. **Zéro scroll de page parasite** à hauteur habituelle ; les feeds/notes/zoom de preuves peuvent défiler dans leur propre région. Android Back ferme d'abord une preuve/modale ; la transition ne doit pas détruire les états d'enquête. Cibles tactiles ≥44px, respect de `100dvh` / safe areas, contrôle de la mémoire GPU, modal focus et lecteur d'écran.

**Réactions 3D, limitées et expressives** : légère gêne pour une question, sourire arrogant si objection fausse, choc sur preuve irréfutable, défaite comique après aveu. Symboles manga 2D à côté de la tête (goutte, !, ?) ; **pas de gros overlay sur les yeux**. Pas de nouvelles salles/caméras coûteuses.

## 8. Direction musicale : tension d'interrogatoire arcade **originale**

**Intention d'ambiance :** tension, curiosité, accélération et euphorie de la confrontation, dans l'esprit du **genre** « jeu de procès rétro », mais **aucun arrangement, mélodie, motif, sample, orchestration reconnaissable, son d'objection ou asset provenant de Phoenix Wright**. Composer et livrer **des musiques originales** (ou licenciées explicitement pour cet usage), pas des reprises « façon une piste précise ».

| État du jeu | Direction sonore | Déclencheur |
| --- | --- | --- |
| Dossier / profils / réseaux | Boucle **enquête** : synthés/chiptune, basse discrète, tempo médium, mystère amusant | Début / consultation d'un indice |
| Déposition / navigation | Boucle **témoignage** : motif rythmique léger, tension montante mais lisible | Parcours normal |
| Faire préciser / indice nouveau | Accent bref (clic, petite montée), musique inchangée | Révélation non décisive |
| Objection correcte | **Stinger original** + micro-silence / ducking de la boucle | Preuve validée (jamais au simple clic Objection) |
| Confrontation / menteur coincé | Court thème **pression / percée**, percussions et synthés plus marqués | Aveu ou explication |
| Objection erronée | « Raté » arcade léger, pas une punition sonore longue | Preuve insuffisante |
| Dossier complet | Jingle de victoire original, boucle arrêtée | Toutes les disquettes prouvées |

**Règles audio :**
- Réutiliser si possible le **bus Web Audio existant** et ses principes `effets`/`musique`, mais **prévoir des pistes distinctes** et le verrouillage d'instance : ne pas lancer deux boucles si Lux Match est quitté puis Lux Démasque ouvert.
- Un volume modéré pour laisser lire le LU ; **un réglage de musique/effets cohérent avec le menu global**, préférence persistante éventuelle. L'icône sonore encombrante dans le HUD n'est pas nécessaire.
- Respecter autoplay mobile (démarrer après geste), `document.hidden`/background, mute, `prefers-reduced-motion` pour les effets visuels associés ; transitions par fondu court, **aucune fuite de musique** après sortie/Back/nouveau jeu.
- Formats OGG/MP3 locaux avec fallback et cache ; **les valeurs de tempo, tonalité et instruments relèvent de la composition**, non d'une imitation de titre existant.

## 9. Équilibrage, interface de résultat et rejouabilité

**Score principal :** `trouvées / total`. Bonus éventuels : zéro ou peu de fausses objections, peu de questions utilisées, découverte sans aide FR (si l'aide est disponible), répliques bien comprises. **Ne jamais mélanger note linguistique et vérité logique**. Ne pas retirer des points au hasard à un joueur qui a correctement prouvé une disquette.

**Le carnet** note seulement :
- déclarations réellement entendues ;
- précisions réellement obtenues ;
- publications réellement consultées ;
- mensonges réellement démasqués.

**Bilan compact** : personnage 3D + « 3/3 DÉMASQUÉES » + nombre d'objections inutiles + « Nouveau dossier » **au-dessus** de l'historique détaillé. Sous-section déroulante facultative « Comment il a essayé de t'embobiner » : motivations et preuves, avec traduction LU des déclarations. **Ne pas afficher la graine de génération en gros au joueur** : panneau diagnostic copiable seulement.

**Rejouabilité d'un même prétendant** : variantes entièrement cohérentes de mensonges, vrais détails, preuves et réactions. **Rejouer une graine connue ne doit pas changer la solution**. Sur un nouveau dossier, le joueur ne doit pas pouvoir deviner toutes les réponses simplement parce qu'il connaît l'illustration du PNJ.

## 10. Production et ordre de livraison — tâches Claude

**Lot D0 — Isoler le prototype** : confirmer le fonctionnement de la démo autonome Milo et écrire une matrice `statement × press × proof × result`. Pas de nouvelles 3D ou pistes avant que toutes les solutions logiques soient validées. Distinguer ce que le HTML exécute déjà de ce qui n'est qu'aspiration de la SPEC.

**Lot D1 — Dossier pilote LU** : convertir **un seul dossier** en LU, en éditant les six déclarations, les questions, précisions et confrontations, avec revue contre `grammaire_luxembourg.md`, leçons et LOD.lu. Réseaux et preuves restent FR. Réécrire les trois preuves trop évidentes, faire valider par un testeur qu'il n'existe **ni faux positif ni mensonge impossible**.

**Lot D2 — Emballage arcade / 3D / preuves visuelles** : créer le composant jeu distinct sans impacter Lux Match ; portrait/café low-poly, photos/captures sociales, carnet de preuves, réaction manga et **« OBJECTION ! » original** avec choix de preuve. Recette mobile 320×640, 360×740, 393×852 et 430×932, notamment visibilités, scroll, boutons, Back et mode FR.

**Lot D3 — Musiques originales et effets** : boucle enquête, boucle déposition, stingers et jingle ; le tout sous contrôle menu son, autoplay, chargement différé et suspension correcte. Ne pas reprendre la bande-son de Phoenix Wright.

**Lot D4 — Générateur contraint** : une première version avec **3–5 dossiers édités**, puis combinaison de **12–18 affaires validées** seulement après validation des invariants ; même seed = même plan, preuves accessibles, dates cohérentes, aucune réplique LU manquante, aucun indice divulgué avant découverte. Aucune génération libre de LU.

**Lot D5 — Recette anti-régression** : tests moteur Node et DOM/Playwright + suite critique du PLAYBOOK ; mesurer parcours où l'on trouve 0, 1, 2 ou toutes les disquettes, objections fausses, preuves non découvertes, précisions répétées, retour Android, fermeture du jeu, rejouer, transition de Lux Match à Lux Démasque, accessibilité, performance WebGL. Ne jamais prétendre à une recette Samsung réelle sans test sur appareil.

### 10.1. Tests d'acceptation obligatoires

1. **Solution complète vérifiable :** le dossier Milo possède trois véritables contradictions et trois déclarations correctes ; les trois bonnes objections, dans n'importe quel ordre, font **3/3** ; aucune paire erronée ne marque un mensonge comme prouvé.
2. **Joueur novice :** aucune connaissance hors texte du jeu requise ; toutes les preuves peuvent être obtenues par exploration et « Faire préciser ».
3. **Indice médiatique :** zoom et transcription d'une photo/capture affichent la même preuve ; pas de piège basé uniquement sur un détail illisible.
4. **Dossier généré :** audit de **1 000 seeds** pour un catalogue suffisant : tous les `lieIds` atteignables et solvables, zéro faux positif détectable par le validateur, événements en ordre cohérent ; **les assertions sémantiques complexes restent soumises à des tests humains**.
5. **Langues :** avec aide FR OFF, dialogues **en LU**, sources **en FR**, aide optionnelle cohérente. Les erreurs de raisonnement n'impactent pas arbitrairement le score de langue.
6. **3D/audio :** un seul renderer actif, pas de perte de contexte lors d'une navigation répétée ; musique stoppée en arrière-plan/à la sortie, pas de double boucle ni de crash si fichiers audio indisponibles.
7. **Protection de LuxApp :** aucun changement involontaire dans Lux Match, jeux, leçons, progression, authentification, service worker ou cloud.

## 11. Décisions verrouillées vs ouvertes

**Validées dans leur principe :**
- Tous les prétendants mentent ; l'objectif est **démasquer toutes les disquettes** avec des **preuves**.
- Déposition + « Faire préciser » + « Objection ! » + carnet + réseaux.
- LU dans les interrogatoires, FR sur les profils, posts et preuves.
- Générateur **semi-procédural à contenus contrôlés**, pas générateur de libre dialogue.
- 3D low-poly, preuves visuelles, musique d'enquête et stingers **originaux**, inspiration arcade d'interrogatoire.
- Lux Démasque **séparé** de Lux Match et sans régression.

**À arbitrer après le pilote (ne pas bloquer sa réalisation) :**
- Cible finale exacte 2 ou 3 mensonges par mini-dossier selon difficulté.
- Fautes d'objection : simple pénalité de score ou nombre limité d'erreurs.
- Nombre de dossiers disponibles à l'ouverture (3–5 recommandé) et niveau de variation procédurale.
- Pondération du score linguistique sans encourager à désactiver l'aide FR.

**Non demandés :** voix générée, modèle de traduction tiers, saisie libre, PNJ conversationnel LLM, nouvelle ville, réseau social réel, musique sous droit d'auteur d'une autre licence.

**Critère de réussite du concept :** après une partie, le joueur doit pouvoir dire **« Il m'a affirmé X, je lui ai demandé Y, j'ai trouvé Z dans son profil, alors je l'ai coincé »** — et pouvoir raconter une histoire différente lors du dossier suivant.

## 12. Suivi d'implémentation (Claude)

| Lot | Statut | Contenu livré |
| --- | --- | --- |
| D0 — Masquage de Lux Match + audit | Fait (navigateur) | **Lux Match masqué, pas supprimé** : `JEUX_DISPONIBLES = { luxMatch: false }` + `jeuDisponible(id)` en tête de `public/jeux-v21.js` (point unique). Masqué ⇒ `luxMatchCarteHub()` ne rend rien et ne lance plus `lmPrecharger()` (aucune requête 3D/GLB/contenus depuis le hub) ; `ouvrirLuxMatch()` renvoie au hub Jeux sans créer de partie ; la restauration de la vue `view-luxmatch` renvoyait déjà au hub (`navigation.js`). Fichiers, JSON, GLB, sons, moteur, tests, records (`luxMatchRecord`) et préférences (`luxMatchAideFr`, `luxMatchSon`, `luxMatchMusique`) intacts. **Réactivation : `luxMatch: true`.** Service Worker inchangé : les fichiers Lux Match restent dans la copie hors ligne (les GLB du café et des personnages serviront à Lux Démasque). Tests : `tests/test_lux_match_masque.py` (carte absente, zéro préchargement, ouverture refusée, données conservées, réactivation), `tests/test_lux_match_swipe.py` réactive le jeu pour lui seul. **Audit du prototype :** le HTML autonome n'est pas dans le dépôt et n'a pas pu être exécuté ; matrice `déclaration × précision × preuve × résultat` du dossier Milo réécrite avec des preuves recoupées, sans aveu publié : [LUX-DEMASQUE-DOSSIER-MILO.md](../LUX-DEMASQUE-DOSSIER-MILO.md). |
| D1 — Dossier Milo jouable en LU | Fait (moteur + navigateur) — **relecture LU native/LOD et testeur extérieur à faire** | **Moteur pur** `public/lux-demasque-core.js` (sans DOM, Node + navigateur) : `validerDossier` (4–6 déclarations, ≥ 2 mensonges et ≥ 2 vérités, thèmes distincts, chaque mensonge a une preuve accessible dans un réseau, une pièce ne prouve jamais deux mensonges, toutes les répliques présentes et au statut publiable), `nouvellePartie`, navigation libre, `preciser` (une fois, mémorisée), `consulter`, `carnet` (seulement le vu/entendu, dans l'ordre), `objecter` (déclaration + pièce du carnet ; refus contextualisé, jamais de révélation ; métier : précision obligatoire), `conclure` (score 300/disquette − 50/objection ratée + 200 sans faute), `bilan`. Aucun hasard dans les règles : même dossier + mêmes décisions = même partie. **Contenus** `data/jeux/lux-demasque/contenus-v01.json`, générés par `tools/lux-demasque/contenus.py` (refuse une phrase marquée `lecon` absente des leçons/examens) : 34 répliques LU — 2 `lecon`, 4 `lecon_modele`, 16 `audit_regles`, 12 `a_verifier_lod` (Tourismus, Equipe, gesot, Gesäis, wierklech, just, Nuddelen, Pesto, gewonnen, gelunn) ; réseaux et pièces en FR, transcription complète pour chacune. `grammaire_luxembourg.md` n'existe ni dans le dépôt ni dans le projet : audit fait contre les leçons (règle UNITEDZOHA, possessifs, passé composé) ; LOD.lu non joignable depuis l'environnement de Claude. **Interface** `public/lux-demasque.js` + `.css`, vue `view-luxdemasque`, carte « Lux Démasque · NOUVEAU » dans Jeux (`JEUX_DISPONIBLES.luxDemasque`), contenus servis par `/api/jeux/lux-demasque` (copie hors ligne SPEC 93). Rencontre → déposition (une déclaration, ‹ ›, pastilles entendue/démasquée, « Faire préciser » / « OBJECTION ! », compteur de disquettes, Réseaux, Carnet, FR) → fenêtres réseaux / pièce / carnet / objection / verdict / menu (Retour Android et Échap ferment celle du dessus) → bilan (3/3, objections ratées, score, record `luxDemasqueRecord`, « Nouveau dossier » avant les détails repliables, motivations et preuves, diagnostic). Quitter par la navigation de l'appli arrête la partie. Portrait 2D provisoire (3D au lot D2). Tests : `test/lux-demasque.test.cjs` (11 cas : 6 ordres de solution, 36 paires × 2 états de précision sans faux positif, précision indispensable, leurres, rejeu exact, dimanches d'août vérifiés par calcul, aucune pièce ne trahit un autre mensonge, règle du n) ; `tests/test_lux_demasque.py` (parcours complet par l'interface, Retour Android, aide FR, 4 tailles d'écran sans scroll de page, cibles ≥ 44 px). |
| D2 — 3D, preuves visuelles, objection arcade | Fait (navigateur, rendu logiciel SwiftShader) — **Samsung réel (GPU, performance, lisibilité) à faire** | **3D réutilisée, API de Lux Match inchangée** : `public/lux-match-3d.js` (v=10) gagne trois services additifs — `interrogatoire(conteneur, profil)` (le prétendant seul au café, cadrage propre : visage dans le tiers haut, enseigne « LUX ♥ MATCH » masquée ; la date de Lux Match garde exactement son cadrage), `photo(scene, personnes, l, h)` (décor low-poly + jusqu'à deux personnes ; un modèle à l'écran est prêté le temps de la photo) et `partage()` (une seule instance, donc **un seul WebGLRenderer** pour Lux Match et Lux Démasque ; `lux-match.js` l'utilise désormais). Cinq décors en primitives : `kyoto` (temple, torii, six lanternes identiques), `canape`, `chat` (Pixel en low-poly), `bureau`, `pesto`. Milo = `Casual_Male` recoloré, Sami = `Casual2_Male` (figurant). **Images** rendues à l'ouverture du dossier (portrait, portrait vaincu, 5 photos) puis posées dans la fiche, les réseaux, le carnet, le verdict et le bilan ; repli CSS si la 3D manque ; chaque visuel garde sa transcription (`aria-label` identique). **Réactions** du prétendant via `reagir` : « parle » (déclaration, précision), sourire narquois + étoiles sur objection ratée, zoom + RecieveHit + « !! » sur preuve, Defeat + goutte après l'aveu. **Signes manga** : mêmes dessins que Lux Match (`LM_SIGNES`, aucune copie), au-dessus de la tempe (testé). **OBJECTION !** : lignes de vitesse rouges/blanches, cri qui claque, flash, secousse, **pièce brandie** (1,3 s ; 0,7 s si ratée ; fondu seul avec `prefers-reduced-motion`), puis verdict en feuille du bas, **sans zone défilante** (une zone qui défile au-dessus du canvas suspendait son affichage dans Chromium) ; le montage de « Kyoto » n'apparaît qu'après la preuve. Tests : `tests/test_lux_demasque_3d.py` (images, instance partagée, transcription = alt, signe hors du visage, 3 dossiers d'affilée sans doublon, canvas retiré en quittant) ; `tests/test_lux_demasque.py` étendu (effet plein écran, pièce brandie, révélation seulement après la preuve). Lux Match vérifié inchangé (rendez-vous, swipe, masquage). |
| D3 — Musiques et effets originaux | Fait (navigateur, Web Audio instrumenté) — **écoute humaine et haut-parleur Samsung à faire** (Claude n'entend pas le rendu) | Compositions **originales** synthétisées par `tools/lux-demasque/musique.py` (numpy + ffmpeg, instruments de `tools/lux-match/musique.py`, aucun échantillon, aucun motif ou son de Phoenix Wright) dans `public/audio/lux-demasque/` (OGG Vorbis + MP3 de secours, ≈ 0,9 Mo en OGG et 1,1 Mo en MP3) : boucles **« Dossier ouvert »** (enquête : basse ronde qui marche, pizzicatos pulse, piano FM, batterie feutrée) et **« Déposition »** (interrogatoire : basse en croches, arpèges qui passent aux doubles croches à mi-boucle, montée chromatique avant la reprise), toutes deux à 104 BPM en la mineur, 16 mesures (36,9 s), même grille Am9–Fmaj7–Dm9–E7sus4, **motif commun** mi-la-do-si ; raccord de boucle sans clic (rendu circulaire). Accents : `indice` (0,75 s), `objection` (élan, impact grave, « ta-DAA » cuivré FM, 1,7 s), `percee` (2 mesures : roulement, basse qui grimpe, motif aigu, cadence suspendue, 5,5 s), `rate` (glissando comique, 0,9 s), `resolu` (la mineur → la majeur, 3,4 s), `clos` (1,6 s). Crêtes ≤ −1 dBFS. **Lecture** `public/lux-demasque-audio.js` (`LuxDemasqueSon`) : AudioContext créé au geste (autoplay mobile), bus effets + musique, **une boucle au plus**, fondus 0,7 s ; piste selon l'écran (`ldSynchroMusique`) : fiche → enquête, déposition → déposition, réseaux/carnet/pièce ouverts → enquête, bilan → silence + `resolu` ou `clos` ; précision ou pièce nouvelle → `indice` ; objection réussie → `objection` puis `percee` avec la musique baissée (ducking) ; ratée → `rate` ; navigation → petit clic synthétisé. Menu : **Son** (`luxDemasqueSon`) et **Musique** (`luxDemasqueMusique`), mémorisés. Arrière-plan → contexte suspendu, reprise seulement si Lux Démasque est affiché ; quitter (bouton, Retour, autre vue) → arrêt ; ouvrir Lux Démasque fait taire Lux Match. Fichier absent : silence, jeu intact. Test : `tests/test_lux_demasque_audio.py` (AudioContext espionné : pistes par écran, une seule boucle, accents, réglage, arrière-plan, bilan, transition Lux Match → Lux Démasque, audio indisponible). |
| D4 — Générateur semi-procédural + dossiers supplémentaires | Fait (moteur + navigateur) — **relecture LU native/LOD et testeur extérieur à faire** | **Affaires atomiques** : 17 déclarations complètes et relues (9 mensonges, 8 vérités, 8 thèmes) dans `contenus.py` → `contenus-v01.json` (`affaires`), chacune avec précision, refus, pièces FR transcrites, preuve, justification LU, motif, explication et au moins un leurre à réplique propre ; deux mensonges à **précision indispensable** (restaurant, groupe), trois par **recoupement de dates** (Japon/août, Espagne/juillet, « tous les jours »/septembre — dates calculées par test). **Dossiers rédigés** assemblés d'affaires : NOAH_001 (N°002, Noah) et TOM_001 (N°003, Tom), joués dans l'ordre après Milo (`luxDemasqueResolus`), puis dossiers générés. **Générateur** `composerDossier(contenus, { graine })` dans le moteur pur : graine → hasard déterministe, prétendant générique (leo, hugo, sam, jules, enzo, nico ; jamais Milo/Noah/Tom), 3 mensonges + 3 vérités, 6 thèmes distincts, incompatibilités déclarées (Japon ✕ « tous les jours »), au moins une précision indispensable et un recoupement, pas trois mensonges en tête, puis `validerDossier` ; **aucun texte LU produit par le moteur** (`{npc}` remplacé dans le français seulement, aucune variable dans le LU — testé). Carte « N°xxx · INÉDIT », salut LU, « Rejouer » le même dossier, diagnostic du bilan avec graine et affaires. 3D : décors `hopital` et `chien`, images en cache par prétendant. Statuts LU des affaires : 45 `audit_regles`, 24 `a_verifier_lod`, 17 `lecon`, 2 `lecon_modele`. Détail et phrases à confirmer : [LUX-DEMASQUE-AFFAIRES.md](../LUX-DEMASQUE-AFFAIRES.md). Tests : `test/lux-demasque-generateur.test.cjs` (catalogue ; Noah et Tom : solution exacte avec et sans précision ; 1 000 graines valides et reproductibles, **387 combinaisons**, toutes les affaires tirées ; 300 graines × toutes les paires déclaration × pièce : zéro faux positif, chaque mensonge prouvable ; dates ; rejeu exact) ; `tests/test_lux_demasque.py` (après Milo, « Nouveau dossier » ouvre Noah). |
| D5 — Tests complets, équilibrage, documentation | Fait (Node + navigateur Chromium/SwiftShader) — **non vérifié : tactile et GPU sur Samsung réel, écoute de la musique, relecture LU native/LOD, testeur extérieur** | **Équilibrage** : chaque vérité du catalogue reçoit une **2e pièce** qui la confirme (PIX_BUREAU, AMIS_VOISINE, AMIS_CLUB, AMIS_VETO, PIX_ZOPP, AMIS_LECTURE, AMIS_SARAH, PIX_CLARA ; dates vérifiées) : chaque affaire apporte exactement deux pièces, donc le nombre de pièces liées à une phrase ne trahit plus un mensonge (12 pièces par dossier généré). Barème inchangé mais mesuré : 3/3 sans faute = 1 100, une ratée = 850, 2/3 = 600, la **force brute** (toutes les pièces contre toutes les phrases) = 0 sur 200 graines (plancher à 0). Milo garde ses 8 pièces (dossier pilote validé). **Corrections** : pendant l'effet OBJECTION ! les boutons étaient encore actifs (on pouvait conclure et voir le verdict s'afficher sur le bilan) — l'effet capte désormais les appuis, un appui ou Retour/Échap le passe et montre le verdict, et le verdict ne s'affiche plus hors déposition ; accord « 0 / 3 disquettes démasquées » ; posts sans image (collègue, soupe) dotés d'un décor (`hopital`, nouveau décor `soupe`). **Bilan** : pour chaque disquette manquée, la pièce qui la prouvait et si elle avait été ouverte (« jamais ouverte » / « tu l’avais ouverte »). **Tests** : `tests/test_lux_demasque_parcours.py` — 0/3 (confirmation, Retour = continuer, score 0, Rejouer), 1/3 (précision unique et appels répétés sans effet, phrase démasquée verrouillée « déjà », nouveau record), 2/3 (précision indispensable : refus + indice puis preuve, 2 ratées, 500), 3/3 (bilan direct, Milo résolu, record) ; effet OBJECTION ! bloquant et passable ; `prefers-reduced-motion` (fondu, sans secousse) ; Retour/Échap dans l'ordre des fenêtres ; accessibilité (dialogue modal nommé, focus dedans puis rendu, aucun bouton sans nom, `lang="lb"`, compteur `aria-live`) ; WebGL (un seul canvas, rendu à demi-résolution, dessins pendant la déposition, **zéro dessin** au bilan et après la sortie) ; Lux Match → Lux Démasque (même instance 3D, un seul canvas). `test/lux-demasque-generateur.test.cjs` + équilibrage (deux pièces par affaire, force brute = 0, barème). Suites : Node 18/18 Lux Démasque ; navigateur : 6 tests Lux Démasque/Lux Match verts ; suite critique sans nouvel échec (échecs préexistants inchangés). |

