# SPEC 109 — Lux Match : Double jeu (game design + bible de contenu)

**Dépôt :** aym2020/LuxApp · **Branche cible :** `2.1` · **Statut :** **démo jouable implémentée le 27/10/2026** (prototypes A + B réunis), contenus LU **toujours en brouillon**, recette Samsung à faire · **Date :** 26 octobre 2026 · **État documentaire :** démo jouable et contenus JSON existants ; section 12 = nouvelles décisions produit à implémenter, non livrées.

## Démo implémentée (27/10/2026)

**Accès :** Jeux › carte « Lux Match · DÉMO » (`ouvrirLuxMatch()`), vue `view-luxmatch`, non restaurée après actualisation (retour au hub). Badge « DÉMO · textes LU en relecture » en jeu et note sur l'écran de fin.

| Fichier | Rôle |
|---|---|
| `public/lux-match-core.js` | Moteur pur (Node + navigateur) : swipe (4–6 cartes, match au 1er ou 2e « j'aime », paquet relancé si tout est refusé), look (±4 max selon `outfitSignal` publié), file d'échanges par `archetypeFlows`, pièges conditionnels (max 2), aveu = réparation sans pénalité, **rappel de mémoire** avant l'au revoir (contradiction : suspicion +20, affinité −10), batterie −5 %/s ouverte (temps actif, pas de 0,25 s max), anti-téléphone (piège après la réponse en cours, puis −5), fin anticipée à suspicion ≥ 80, issues `nouveau_rdv` / `gene_drole` / `pas_colle` / `malaise`, score (langue 600 + affinité ×3 + (100 − suspicion) ×2), 2 réponses lors des 2 premières parties puis 3 |
| `public/lux-match.js` + `.css` | Téléphone CSS (swipe glissé ou boutons), MATCH arcade, apps fictives Pix / Pro / Amis (compte privé respecté), LOOK 5 styles × 6 couleurs (noms LU), date : jauges, bulle LU + aide FR, réponses, corrections LU/FR, messages pixel, téléphone à batterie, fiche « Moi » hors batterie, résultats + expressions (question → bonne réponse, « à revoir » si faute). Sons Web Audio propres. Records `luxMatchRecord`, `luxMatchParties`, préférences `luxMatchAideFr`, `luxMatchSon` (par profil). Aucune écriture dans `luxProgress`. |
| `public/lux-match-3d.js` | Module chargé à la demande : un renderer, rendu basse résolution « PS1 » (pixel ratio ×0,5, `image-rendering: pixelated`), portraits et « photos » Pix rendus en 3D (poses), aperçu du look qui tourne, café néon de nuit (Kenney Furniture), partenaire face caméra, Alex de dos, réactions (joie, déception, surprise, rire, zoom, disque rayé). Repli : portrait 2D si WebGL indisponible. |
| `public/lux-match/` | GLB CC0 : 5 modèles de partenaires, 4 looks d'Alex, `anims.glb` (squelette commun), `cafe.glb` ; voir `CREDITS.md`. Régénération : `tools/lux-match/`. |
| `server.js` | `GET /api/jeux/lux-match` → `{ archetypes, dialogues }` (copie hors ligne via SPEC 93). |

**Ajouts de données (brouillons) :** `apparence3d` par profil ; `recallNodes`, `recallRules`, `contradictionReaction` ; corrections « Ech spille gär Fussball », « Wat fir en Déier sinn ech? », post anti-téléphone d'Emma en LU. **Tout reste à auditer sur LOD avant production.**

**Tests :** `node --test test/lux-match.test.cjs` (références croisées, match borné, look ±4, parcours sincère pour les 6 profils, piège Portugal seulement après mensonge + aveu, contradiction au rappel, batterie identique à 30/60 fps, téléphone fermé = aucune perte, anti-téléphone, 2 puis 3 réponses). Parcours navigateur : swipe → match → enquête → look → date → résultats sans erreur JS, batterie −10,5 % après ~2 s.

**Non fait dans la démo :** voix (TTS) facultative, filtrage des nœuds par leçons débloquées, mode batterie lente (paramètre `accessible` prêt dans le moteur, sans réglage UI), fallback complet sans WebGL testé sur appareil.

## 0. Sources de vérité et réutilisation

- `PLAYBOOK.md`, `AGENTS.md`, `docs/README.md`, `docs/CHARTE_UI_2.1.md`, `docs/specs/SPEC-96.md` lus sur `2.1` ; code actuel : `public/runner.js`, `public/runner-3d.js`, `public/jeux-v21.js`.
- Réutiliser l'univers Jeux de SPEC 88/96 : **violet pour l'arcade, or pour scores et CTA importants**, mais ne pas toucher aux jeux et à la progression existants.
- Le moteur 3D existant est **Three.js r170 local** (`public/vendor/three/`), avec `GLTFLoader` et fallback 2D dans Lux Runner. La réutilisation de la *pile* et des conventions est possible ; **ne pas réutiliser tel quel le renderer de la course**, spécifique aux portails. Il faudra un renderer de scène indépendant à la demande.
- `data/missions/A1.1/` contient des **brouillons** de répliques pédagogiques. Ne pas les importer silencieusement ni les annoncer comme validés. `grammaire_luxembourg.md` et LOD.lu sont les références de révision linguistique.
- Cette SPEC **n'autorise aucune nouvelle route de production** ni modification des sauvegardes des leçons avant prototype et recette.

## 1. Promesse et pilier de design

**Pitch :** comédie de dating rétro-arcade. Le joueur consulte une fausse app de rencontres sur un **téléphone physiquement cadré à l'écran**, swippe, obtient un match, peut enquêter sur **trois faux réseaux sociaux**, choisit son look, puis retrouve une personne fictive adulte lors d'un date en **3D low-poly PS1**. Il doit comprendre des phrases en luxembourgeois, se présenter, choisir ses réponses, assumer ses éventuels mensonges et éviter les gaffes.

**Objectif pédagogique premier A1.1 :** compréhension et formulation de salutations, nom, âge, origine, résidence, nationalité, langues, métier, heures, goûts et routine **uniquement après la leçon correspondante**. Les loisirs non enseignés et langues étrangères utilisés pour une blague ne doivent pas être évalués comme connaissance luxembourgeoise.

**Piliers :** entrée instantanée ; décisions lisibles ; profil → indices → conséquence vérifiable ; humour de situation ; une manche courte ; contenus contrôlés, jamais improvisés par une IA runtime ; arcade 3D esthétique et efficace, non monde ouvert.

**Garde-fou éditorial :** personnages fictifs **majeurs (21+ dans la banque)**, réseaux entièrement fictifs, comptes privés respectés (aucun contournement), pas d'information réelle ni usurpation de vrais profils. Le jeu peut satiriser le bluff et le « stalking » sans récompenser le harcèlement ni supposer qu'une profession ou une origine détermine les goûts.

## 2. Boucle de jeu et états

`SWIPE → MATCH → CHOIX(DATE | ENQUÊTER) → (RESEAUX) → LOOK → DATE_3D → RESULTATS`

- **SWIPE :** un téléphone centré dans le viewport. Profil = portrait illustré cohérent, âge, prénom, bio courte **LU**, option FR discrète selon aide, indices visibles, boutons Refuser/Aimer **en plus du swipe**. 3–7 cartes maximum pour le pilote. Déterminer un match après 1–4 likes positifs, à partir d'une liste éligible, pour éviter le hasard frustrant ; aucun défilement infini ou publicité.
- **MATCH :** réaction arcade « IT'S A MATCH », portrait et prénom, actions primaires **DATE** (direct) ou **ENQUÊTER** (préparation facultative). Le choix n'est pas un score de compréhension.
- **ENQUÊTER :** smartphone avec exactement trois apps fictives clairement inspirées des usages de réseau photo, professionnel et social (ex. `Pix`, `Pro`, `Amis`) : pas de vrais logos. Retour au menu des apps, accès aux indices et bouton **DATE** permanent.
- **LOOK :** avatar 3D/2D de prévisualisation, 5 styles (sportif, casual, loose, BCBG, créatif) × 6 teintes (noir, blanc, bleu, vert, rouge, beige). Une sélection touche un gros bouton ; pas de boutique, d'inventaire ou de drag-and-drop. Chaque look vaut au plus ±4 d'affinité, basé sur une **préférence publiée explicitement**, jamais sur une inférence du salaire ou de la nationalité. Passer autorisé.
- **DATE :** 1 décor café 3D, personnage en face, 6–8 échanges A1.1 et parfois 1 relance humoristique. Sous-titres LU obligatoires, voix en option et rejouable, pas de micro ni de clavier obligatoire. En haut deux jauges *Affinité* et *Suspicion* ; bas 2–3 réponses touchables, texte lisible. Bouton téléphone accessible à tout instant.
- **RESULTATS :** fin « nouveau rendez-vous », « moment gênant mais drôle » ou « ça ne colle pas », score basé surtout sur justesse linguistique et cohérence, résumé pédagogique LU/FR des expressions travaillées. Aucun échec social définitif, pas de pénalisation de la progression des leçons.

La scène de date n'est **pas une promenade 3D** : caméra et personnages prépositionnés ; actions = choisir, parler, consulter le téléphone. La 3D raconte les réactions (sourire, haussement de sourcil, silence, animation comique), la logique s'exécute hors renderer.

## 3. Téléphone : contrainte d'information façon survival horror

Pendant la **préparation** : consultation libre, sans batterie qui impose une vitesse de lecture. Lors du **date**, le téléphone commence à **100 %** ; uniquement lorsqu'il est **ouvert**, batterie -5 % par **seconde de temps actif**, soit **20 secondes cumulées** de consultation. Le joueur peut le fermer pour stopper la consommation. Sous 20 % : icône rouge, grésillement et feedback visuel ; à 0 % : écran éteint pour le reste de la manche ; aucune recharge/pouvoir payant.

- Sur `visibilitychange`, perte de focus, écran verrouillé ou pause réelle : horloge arrêtée et audio suspendu. Sur reprise, delta plafonné pour empêcher la décharge d'un seul coup.
- Consultation à l'écran : **ne jamais** interrompre un dialogue tant que le joueur n'a pas répondu ; le monde est figé ou en animation d'attente. La tension vient de la **durée de recherche**, pas d'un time-out de lecture en luxembourgeois.
- **Personnalité « anti-téléphone »** : première consultation déclenche une réplique annoncée à l'avance par bio/post, puis malus d'affinité (-8) ; nouvelle consultation peut coûter -5. Ce trait **n'est pas attribué à tous**.
- Mode accessibilité sans contrainte motrice : baisse à -2,5 %/s ou possibilité de désactiver le chronomètre dans un mode entraînement **sans classement compétitif**. Texte accessible hors WebGL et accessible au lecteur d'écran.
- Batterie déterministe au temps actif (seconds), non au nombre de frames (`Date.now()` n'est pas la source de points).

## 4. Réseaux — indices observables et limites

| App fictive | Informations principales | Règle |
| --- | --- | --- |
| **Pix** (réseau photo) | 2–4 images, quelques légendes LU, activité sportive / art / voyage / couleurs, abonnés indicatifs, compte éventuellement privé | Photo de voyage **ne prouve jamais** l'origine ; si privé, seule bio publique affichée, aucun bypass |
| **Pro** (réseau professionnel) | métier actuel, secteur, études, langues, ville professionnelle | Une bonne carrière **ne prouve pas** le goût du BCBG |
| **Amis** (réseau personnel) | ville, pays, anniversaire, passions déclarées, 1–2 posts courts LU, préférence de tenue ou de téléphone | Préférences décisives doivent être **écrites** ici ou dans la bio |

Chaque profil généré a au moins : (a) un indice de style consultable avant LOOK, (b) un sujet de conversation publiquement observable, (c) un trait de comportement reconnaissable, (d) éventuellement un piège déclenchable. Le joueur peut choisir DATE immédiatement ; le jeu reste finissable sans enquête.

**L'information est répartie mais pas incohérente.** Différencier faits (`facts` : ville, âge) de préférences (`preferences`), affichages publics (`clues`) et historique des affirmations (`claims`). Aucun cliché national/physique ne remplace un indice.

## 5. Archétypes et générateur semi-procédural

Six archétypes V1, dont la personnalité est reconnaissable AVANT de dater :

1. **Sportive :** sport/activité ; poste explicitement qu'elle aime les looks sportifs ; piège « on fait un jogging ? » si le joueur prétend courir.
2. **BCBG / ambitieuse :** photos d'événements, préférence **déclarée** pour style chic ; métier et ponctualité ; piège sur le faux métier ou horaire.
3. **Artiste :** dessins, couleurs, café culturel, look créatif déclaré ; piège « dessine-moi » en cutscene comique.
4. **Geek :** jeux rétro, sciences, look casual ; humour sur une référence vidéoludique, sans exiger des savoirs hors programme.
5. **Voyageuse :** photos de voyages + langues explicitement parlées, aime les anecdotes ; piège sur une fausse origine ou fausse langue.
6. **Chill :** café et routine, valorise la conversation attentive, déteste parfois le téléphone (signalé explicitement) ; piège sur une routine inventée.

Chaque instance = `archetypeId + seed + données factuelles cohérentes + variante secondaire + photos + posts + gardes de dialogue`. S'appuyer sur **banques de champs finies validées**, non sur des productions LLM au runtime. Un archétype n'est pas un stéréotype : les préférences proviennent de **signaux écrits** et un trait secondaire varie sans contredire les faits.

Banque pilote : **6 personnages adultes pré-écrits, un par archétype**, puis variantes de prénom, âge, origine, ville, langue et métier issues des leçons. Les portraits peuvent être packagés et réutilisés par variantes de tenues/couleurs ; ne pas prétendre créer des visages cohérents entièrement génératifs sans pipeline d'assets.

## 6. Mécanique de conversation, mensonges et conséquences

Le **pilote** commence avec une identité jouable fictive stable (Alex, 28 ans, originaire de France, habitant Metz, banquier, francophone). L'identité servira de référence pour distinguer sincérité, bluff et contradictions ; ne jamais demander d'information personnelle réelle au joueur. L'écran DATE doit permettre de consulter au moins le rappel de son propre profil hors batterie.

Chaque échange possède : `id`, `question.lu/fr`, `lessonIds`, `options[]`, effets numériques, `claims` éventuellement posées, conditions d'éligibilité, réaction textuelle FR/LU, éventuel `eventId`. Le moteur ne concatène pas librement du LU : **seules substitutions grammaticalement validées** (prénom propre, nombre, pays avec préposition prévue, ville avec `zu`, métier avec article/forme correcte) ; pas de construction automatique via traduction française.

- **Réponse linguistiquement correcte + cohérente :** score pédagogique +1, affinité +6 environ, suspicion stable.
- **Réponse erronée en LU :** explication courte, pénalité pédagogique limitée, pas de mensonge impliqué mécaniquement.
- **Mensonge compatible linguistiquement :** bonus social possible (+8), `claim` persistée dans la manche, risque conditionnel ultérieur.
- **Contradiction (même attribut annoncé différemment) :** suspicion +20, réponse visuelle contextualisée ; une réponse de réparation honnête est possible.
- **Choix maladroit ou téléphone malvenu :** conséquence sociale, **jamais notée comme faute linguistique**.
- **Blague surprise :** événement préparé, pas punition sur une langue étrangère non enseignée ; au moins une sortie honnête ou humoristique accessible sans savoir extérieur.

**Jauges initiales :** affinité 40/100, suspicion 0/100. Arrondir/cap 0–100. Premiers seuils d'essai, **non calibrés** : affinité ≥65 et suspicion <55 = date réussie ; suspicion ≥80 = malaise/fin anticipée ; sinon fin comique neutre. Score LU indépendant des goûts du rendez-vous, aucune optimisation aveugle « flatter = gagner ».

**Portugais, événement humoristique prototype :** une personne qui entend « Je viens du Portugal » peut demander « À quel animal je ressemble ? Réponds en portugais ! » ; réponses *vaca* (vache), *hipopótamo* (hippopotame), *gata* (chat), et une **option d'aveu / de retrait**. Ce gag ne mesure pas le portugais, n'apparaît **que si cette affirmation a été faite**, et n'utilise pas d'humiliation corporelle systématique. Réaction 3D : zoom, silence, bruit de disque rayé, puis retombée. La version luxembourgeoise de la relance **reste à auditer**.

## 7. Dialogue : principes pédagogiques A1.1

Nœuds prioritaires : `salutation` (L1), `age` (L5/L14), `origine` (L7), `nationalite` (L8), `langue` (L9), `ville` (L10), `metier` (L11), `statut` (L13), `heure` (L15), `routine` (L16). Les adjectifs/couleurs (L3/L4) sont souvent mieux mobilisés à l'écran LOOK.

- Les nœuds affichés **dépendent des leçons effectivement débloquées**, pas seulement du niveau global. Si leçon inaccessible, ne pas faire de cette notion une condition de réussite.
- 6–8 échanges par date pilote, 0–2 relances conditionnelles maximum. Toute question jouable propose **au moins 2 réponses** parmi : sincère, bluff plausible, erreur de langue évidente/option de réparation ; **aucune réponse bloquée uniquement par hasard**.
- Dans les premiers runs, 2 réponses; 3 ensuite. Une erreur expliquée avec *la forme correcte*, en luxembourgeois + français, sans interrompre le rythme.
- Les dialogues de `data/jeux/lux-match/` sont **des brouillons à faire auditer** par LOD/grammaire et par une relecture francophone-luxembourgeois **avant publication**. Jamais mélanger `status=draft` et contenu publiable.
- TTS **facultative** ; afficher le texte dès l'apparition de la réplique, ne jamais attendre l'audio pour permettre de répondre. Ne pas lancer simultanément des fichiers audio contradictoires avec le rendu. Mode silencieux pleinement jouable.

## 8. Présentation 3D et contraintes Android

- Smartphone en **cadre portrait visible**, contenu lisible au centre sur SWIPE/RÉSEAUX ; pas de faux faux écran mobile miniaturisé illisible. Coque = décor CSS léger, contenu HTML/DOM accessible, responsive aux safe areas.
- DATE : une **scène 3D légère** (café) avec personnages adultes stylisés low-poly PS1, quelques animations courtes (attente, sourire, surprise, gêne), fond néon violet. Camera fixe ou légers cadrages prédéfinis ; aucune vue FPS.
- Three.js local déjà fourni dans `public/vendor/three/`, importer **à la demande** ; **module de rendu séparé** `public/lux-match-3d.js`, moteur pur proposé `public/lux-match-core.js`, UI `public/lux-match.js`, styles `public/lux-match.css`, sons séparés. **Aucun composant créé à cette étape**.
- Logique identique en WebGL et fallback image/Canvas 2D. UI et sous-titres **DOM au-dessus** du rendu ; jamais du texte pédagogique mappé sur une texture 3D illisible.
- Budget pilote : 30 fps stable minimum sur Android milieu de gamme à valider ; limites strictes de draw calls, géométries partagées, animations non bloquantes, petits GLB sous licence documentée ; pas de CDN.
- Touches ≥44px, aucun défilement horizontal, soutien swipe ET boutons, scroll vertical autonome du faux téléphone, réponses visibles au-dessus de la navigation Android et accessibles au lecteur d'écran. `prefers-reduced-motion` et mode son désactivé.
- Son Web Audio original pour match/malaise ; ne pas réutiliser les sons des exercices de LuxApp ni couper la voix de la question en changeant de vue.

## 9. Contrat de données (brouillons livrés avec cette fiche)

- `data/jeux/lux-match/archetypes-v01.json` : catalogue de 6 personnalités + 6 profils tests, faits, préférences, indices Pix/Pro/Amis, styles et events.
- `data/jeux/lux-match/dialogues-a11-v01.json` : 12 nœuds conversationnels de base, options LU/FR, flags, effets; 6 déclencheurs/personnalités + événements comiques (dont Portugal), niveaux de compétence, transitions conditionnelles.
- Format **de conception** : le schéma final sera ajusté après prototype. Identifiants stables en snake_case ; propriétés explicites, valeurs numériques sans logique cachée, sources de notions par IDs. Aucun champ `lu` nouveau n'est réputé validé sans audit.
- Les fichiers ne sont **pas encore servis** dans `/api/lecons`, non utilisés par le hub, ne modifient aucune donnée utilisateur.

## 10. Prototypage et recette par portes de sortie

**Prototype A — papier / DOM** : smartphone swipe, match garanti, 1 archétype, choix DATE/enquête, 3 apps fictives, look, 6 échanges, jauges, batterie 20s. **Tester que les mensonges ont une suite**, et que l'issue reste atteignable sans enquête. Aucun WebGL requis pour cette vérification.

**Prototype B — 3D :** brancher scène café rendue par Three.js, réactions sur événements purement émis par core ; mesurer chargement/mémoire/perf, tester fallback WebGL refusé, retour Android, veille, téléphone à 0%, audio désactivé.

**Contenu :** relire chaque chaîne LU/FR, gender/nationalité/préposition/accord, aucune double bonne réponse indécidable, un seul fait canonique par personne, aucun champ privé contourné ; vérifier les traductions de références portugaises distinctement. Les textes nouveaux ne peuvent être approuvés automatiquement par simple conformité JSON.

**Tests automatiques futurs (purs, reproductibles) :**
1. Chaque seed rend exactement une personnalité majeure, une photo/description et un match borné.
2. Chaque profil émet ≥1 indice public pour style et comportement ; privé Pix ne dévoile jamais un post inaccessible.
3. Chaque dialogue référence uniquement des IDs existants et une compétence effectivement débloquée ; options accessibles à au moins un profil.
4. Si le joueur ment sur le Portugal, la relance conditionnelle est éligible ; sinon absente ; sortie d'aveu toujours possible.
5. Même `dt` cumulé → même batterie à 30 et 60 fps ; écran fermé/masqué/pausé → aucune perte ; zéro → téléphone inactif.
6. Affinité/suspicion dans [0,100], mensonge ≠ erreur linguistique ; fin atteignable et rejouable.
7. Retour Android / interruption / replay : aucun timer, RAF, listener, audio ou renderer résiduel ; records indépendants par niveau et profil, pas de mutation de `luxProgress`.
8. 320×640, 360×740, 430×932, clavier éventuel, orientation, `prefers-reduced-motion`, mode sans son : texte et CTA lisibles sans recouvrement.
9. Comparaison suite critique `tools/critique.sh` avant toute **future modification de code** ; recette Samsung réelle impérative pour déclarer l'UI validée.

## 11. MVP et hors périmètre

**MVP :** 6 profils écrits, 6 grands archétypes, 3 fausses apps, 5 looks × 6 couleurs, 1 café 3D, 6–8 tours conditionnels, 2 jauges, une jauge batterie temporelle, 3 conclusions comiques. **Pas de comptes sociaux réels, chat libre, API de génération de dialogue, reconnaissance vocale, dating réel, boutique, monnaie, microtransactions ni classement.**

**Mesure de succès à valider en jeu :** joueurs comprennent swipe et date sans aide, prennent une décision éclairée à partir d'un indice, ne trouvent pas les choix arbitraires, veulent rejouer un autre archétype, savent reformuler au moins une phrase de présentation après la session. La DA seule ne suffit pas.

**STATUT DE LA VERSION INITIALE DE CETTE FICHE (historique) :** seule la spec et les contenus JSON avaient été livrés. Depuis le 27/10/2026, une démo jouable est intégrée (voir tête du document) ; **les décisions de la section 12 ne sont pas encore implémentées**. La recette complète Samsung et la validation linguistique restent à effectuer.


---

## 12. Arbitrages validés — Gameplay, personnages et finition UX (27/10/2026)

**Statut : décisions produit de cadrage à implémenter, NON réalisées par cet ajout documentaire.** Cette section complète et, si nécessaire, **prime sur les parties prescriptives antérieures** de SPEC 109 ; elle ne constitue pas un compte rendu de fonctionnalités livrées. La première démo fonctionne sur Android mais une seconde partie a montré des anomalies 3D ; **Claude traite ce bug séparément**, ne pas rebasculer le rendu ou retoucher les scènes parallèlement. Préserver le code existant, les parties et les sauvegardes.

### 12.1. Périmètre : ne PAS ajouter de « lore » complexe

- **Refuser CUPID.EXE**, voix d'algorithme personnifié, quête scénarisée, personnages secondaires récurrents, nouveaux décors, monde ouvert ou hub narratif : **hors périmètre**.
- Le décor du café actuel reste le lieu unique du date. **Garder les six archétypes**, sans multiplier les personnalités avant de fiabiliser le contenu.
- **Oui** aux événements comiques conditionnels (piège Portugal, anti-téléphone, jogging, etc.) et aux **conclusions personnalisées par personnage et par historique réel** : succès, maladresse, bluff découvert, complicité malgré l'échec.
- Le plaisir doit provenir du conflit *préparation → conversation → improvisation → conséquence*, pas d'un scénario additionnel.

### 12.2. P0/P1 — Présenter le personnage joueur AVANT le premier swipe

- Première vue au lancement d'une partie : **carte « TON PROFIL »** cohérente avec le faux smartphone (avatar 3D/portrait existant, prénom **Alex**, **28 ans**, France/Frankräich, **Metz**, **Banker** / banquier, **Franséisch** / français). Ajouter les informations canoniques du \`pilotPlayerPersona\` si utiles ; ne pas inventer de renseignements personnels.
- CTA principal explicite **« Commencer les swipes »** ; pas de nouveaux formulaires, de personnalisation de l'identité ou de retouche de progression. **Option pour revoir la fiche avant le date** et bouton « Moi » pendant le date, déjà existant, à conserver.
- Cette carte présente la **vérité**. Pendant le date, les fausses affirmations du joueur sont stockées dans \`claims\`/historique **séparément** : ne jamais réécrire son profil réel, ne jamais lui afficher automatiquement le détail de ses mensonges pour résoudre les défis à sa place.
- Le profil peut changer dans de futures versions, mais **ne PAS implémenter de génération de personas joueurs** dans ce lot ; respecter les traductions des champs à leur affichage.

### 12.3. P1 — Trois réponses à la question d'âge, toutes grammaticalement correctes

Pour le nœud \`age\` (et seulement là où ce modèle de choix sert réellement au game design), présenter **exactement trois réponses en luxembourgeois**, dans un ordre mélangé, sans étiquette qui révèle leur type :

1. **Vérité** : âge canonique du personnage joueur (pilote : 28).
2. **Mensonge crédible** : autre âge adulte proche (pilote : 30).
3. **Mensonge aberrant** : âge volontairement absurde (pilote : 120) ; c'est une **blague assumée**, pas nécessairement une erreur linguistique.

**Important :** les trois phrases doivent être **linguistiquement correctes** : pas de distracteur grammatical « Ech bass… », pas de « 28 / 30 / 120 » brut en interface finalisée si les leçons requièrent les nombres en lettres. Vérifier formes des nombres au LOD et dans la grammaire. Séparer les évaluations : \`linguisticCorrect=true\` pour les trois ; \`truthType=honest|plausible_lie|absurd_joke\` pour les conséquences sociales. Aucune faute de langue induite par la seule absurdité d'un chiffre.

La **préférence d'âge** d'une partenaire est une variable de profil **optionnelle et indépendante de l'archétype**, parmi \`indifferent\`, \`prefers_similar\`, \`prefers_older\`, \`prefers_younger\` (tous adultes), éventuellement une plage raisonnable explicitement affichée. Certaines partenaires **s'en moquent totalement** : dans ces cas aucun bonus/malus ne doit dépendre de 28 vs 30. Un critère ayant un effet significatif doit pouvoir être découvert dans ses informations publiques. Les réactions aux blagues varient par personnalité (humour apprécié / réaction glaciale / sourire), mais restent cohérentes et compréhensibles. Aucune préférence d'âge supposée d'après son métier ou son origine.

**Ne jamais donner automatiquement +8 à un mensonge** ; les scores dépendent du contexte. Les conséquences immédiates ne doivent pas effacer la possibilité de relance de cohérence plus tard. Les choix « 120 ans » restent disponibles sans rendre une fin agréable impossible à cause d'un unique gag.

### 12.4. P1 — Événements rares liés au prénom : l'ex d'Alex

- Ajouter au plus **1 trait rare** dans la banque des partenaires, par exemple \`dislikedFirstName: 'Alex'\`, associé à une raison comique **fictive** (prénom d'un ex qui lui a laissé un mauvais souvenir). Éviter de forcer le mot « toxique » ou une histoire lourde dans la conversation A1.1 ; humour léger.
- **Indice accessible AVANT le date** : une publication personnelle \`Amis\`, une bio ou une remarque explicite. Ne jamais punir le joueur sans possibilité de découvrir l'information.
- À « **Wéi heeschs du?** » le vrai \`Alex\` peut déclencher une surprise/réplique gênée, mais **pas un échec instantané**. Un autre prénom \`Max\` est un bluff linguistiquement valide, mémorisé comme tel et exposé à une **question de rappel** plus tard. Un prénom décalé peut donner lieu à une réaction humoristique si la banque de contenu permet une phrase LU validée. Les effets ne doivent pas être une règle universelle de tous les archétypes.
- Cas limite : si \`dislikedFirstName\` n'est pas celui du persona courant, aucun effet. Pas de prénom interdit « universel » ni de hasard injuste.

### 12.5. P0 — Corrections d'ergonomie constatées sur captures Android (27/10)

- **Aide FR** : lorsque l'option est « désactivée », ne **jamais** afficher les traductions dans les posts Amis ou les légendes Pix, à moins que le contenu soit explicitement un élément de décor non évalué. À l'activation, la traduction apparaît sous le texte LU partout, y compris bio, légendes, posts, réponses. **Audit contenu obligatoire** : les \`captionFr\` actuels et posts « Blo. », « Rout. », « Gréng. » sont insuffisants ; **ne pas masquer des textes français bruts sans les remplacer par des phrases LU validées**.
- **Tags sur swipe** : la bio « Sport a Fussball » ne doit pas être découpée automatiquement en \`Sport\`, \`a\`, \`Fussball\`. Introduire une banque de **tags éditoriaux**, chacun autonome et vérifié ; pas de jeton grammatical isolé.
- **Photos Pix** : une légende ne doit pas expliciter les règles du jeu (« pays d'origine confirmé dans Amis ») ; la photo doit représenter visuellement son sujet. Enrichir les mini-scènes 3D uniquement si le renderer stabilisé le permet ; sinon images/poses spécifiques réutilisables à coût faible. Les comptes privés restent fermés.
- **LOOK** : avant validation, l'avatar doit être vu **de face / trois quarts**, et un changement de style/couleur doit actualiser visiblement sa tenue ; éviter que l'avatar en rotation libre présente son dos au moment de décider. Faire ressortir la silhouette propre à chaque style et préserver les gros boutons sur mobile. Un look cohérent peut déclencher une **réplique brève de première impression**, sans bonus disproportionné.
- **DATE HUD** : préserver la lisibilité des jauges, des sous-titres LU et des choix, sans badge DÉMO chevauchant l'enseigne. Le badge d'état linguistique peut être déplacé en entrée/sortie du jeu. Limiter les **animations « Victory/Jump »** aux gros événements ; salutation = réaction subtile, mensonge suspect = regard/sourcil levé, gêne = pause/zoom, blague exceptionnelle = grand effet. Ne pas introduire de nouvelles dépendances lourdes en animation pour ce lot.
- **Réseaux** : les trois apps restent fonctionnellement complémentaires (Pix photos, Pro métier/formation/langues, Amis vie perso et goûts) et peuvent garder un peu d'espace vide. **Pas de remplissage artificiel** ; créer des publications LU crédibles qui révèlent des indices, sans textes de « développeur » ni tutoriel intrusif.

### 12.6. P1 — Dialogues en 3 actes, personnalités et conséquences

- Chaque date de 6–8 tours suit un rythme léger : **briser la glace** (salutations/âge), **faire connaissance** (ville, origine, métier, langues, routine), **moment de vérité** (rappel de mensonge ou piège **conditionnel**, puis conclusion). Garder 0–2 relances max et respecter les leçons A1.1 effectivement accessibles quand ce filtrage sera activé.
- **Ne pas généraliser** trois types de réponse à tous les nœuds : à l'âge, toujours 3 types ci-dessus ; ailleurs, proposer parfois plusieurs réponses **toutes correctes en LU** mais socialement différentes ; garder quelques erreurs linguistiques explicites pour réviser, jamais de fausse « mauvaise » réponse ambiguë.
- Affinité et Suspicion restent les **deux seules jauges sociales visibles** ; \`languageScore\` reste **indépendant** des préférences, plaisanteries, mensonges plausibles et des échecs de dating. Aucun gros bonus automatique parce que « la fille aime son métier » ou « son origine ».
- Chaque archétype doit avoir 1 préférence dominante visible, 1 trait secondaire, 1 petite contradiction légère/personnalité marquée, **1 type de relance drôle réalisable**. Une situation peut être une animation seule (elle rit du portrait catastrophique) sans ajouter une quatrième jauge ni nouveau lieu.
- Les **fins personnalisées** combinent le résultat social et au maximum 1–2 faits du run (ex. téléphone consulté devant Emma ; nationalité inventée devant Sofia ; mensonge sur le prénom). Pas besoin de dizaines de branches de dialogues ou de texte généré librement : utiliser des **templates vérifiés** avec garde-fous, faits et priorités clairs.

### 12.7. Ordre et critères pour Claude (NE PAS pousser tout en un seul lot)

**Pré-requis :** consulter derniers commits de \`2.1\`, \`PLAYBOOK.md\`, \`AGENTS.md\`, le présent document, \`docs/CHARTE_UI_2.1.md\` et code réel \`public/lux-match*.js/css\` avant toute intervention. **Ne pas écraser les commits de stabilisation 3D de Claude.** Faire les changements sur \`2.1\` par lots séparés avec tests.

1. **Lot A — P0 qualité de la démo** : laisser finir et tester la correction seconde partie WebGL ; corriger aide FR, tags, contenus bruts/phrases fragmentaires ; audit et traçabilité LU. Tester sur Android réel. Ne pas prétendre que les nouvelles phrases sont validées avant LOD.
2. **Lot B — P1 onboarding et gameplay** : écran profil d'Alex **avant swipe**, âge à 3 options (vraie/plausible/absurde), variables de préférences d'âge et prénom avec **indices visibles**, relances sur mensonges, sans nouvelles erreurs de grammaire.
3. **Lot C — P1 polish UX/3D et personnalité** : LOOK toujours lisible de face/travers, photos Pix illustrant réellement leur légende, 3 réseaux éditorialisés, réactions 3D sobres + événements comiques, déroulé conversationnel en 3 actes, **fins personnalisées**.
4. **Lot D — facultatif plus tard** : diversifier sans complexes supplémentaires, bilan d'apprentissage et optimisation de rejouabilité après retours Samsung. **Pas de CUPID.EXE, pas de nouveaux lieux ou lore**.

**Critères d'acceptation automatiques + Samsung :**

- Une nouvelle partie ouvre **d'abord** sur Alex et sa fiche ; continuer mène au swipe. Retour et relecture du profil sans batterie, pas de fuite entre profils utilisateurs.
- \`age\` offre toujours **exactement 3 choix** de phrases LU *correctes* avec variation d'ordre ; vrai 28, plausible 30, absurde 120 dans le pilote, trois évaluations linguistiques positives. Variation selon partenaire sensible/indifférente ; jamais de bonus universel au bluff.
- Préférence/prénom explicitement lisibles depuis profil avant date ; une partenaire indifférente ne juge pas l'âge, un autre prénom ne déclenche rien si pas de correspondance, un mensonge peut produire une relance ultérieure ; sincérité toujours jouable.
- Aide FR off = **aucune traduction des contenus pédagogiques** Pix/Amis/Pro/Dialogues ; aide on = traduction de chaque item muni de \`fr\`, au bon endroit. Les textes à auditer sont signalés hors production, pas affichés comme s'ils étaient corrects.
- Texte long / smartphone 320×640, 360×740, 430×932 : aucune option cachée sous barre Android, interactions ≥44px, réponses et boutons sans scroll coincé, portrait lisible, look front visible.
- Batterie baisse **uniquement** quand téléphone date ouvert, y compris si défilement dans Pix/Pro/Amis, jamais dans profil « Moi » ; fermeture/onglet masqué/retour Android suspend ; batterie nulle → retour scène date possible.
- Rejouer 3 fois avec diverses filles : pas de doublon de modèles/canvas, pas de disparition de scènes, pas de timers/RAF orphelins, pas d'altération de Lux Runner ni \`luxProgress\`.
- \`node --test test/lux-match.test.cjs\` + suite critique \`bash tools/critique.sh rapide\` puis \`bash tools/critique.sh\` ; rapporter l'état des tests et les éventuels échecs préexistants, sans affirmer « validé sur Samsung » sans recette sur appareil.

**Suivi :** cocher les lots dans une note de recette/commit détaillé **après** validation ; ne pas réécrire cette spec en feignant que toutes les fonctions sont livrées. Les données JSON et traductions validées sont une livraison distincte de cette décision documentaire.
