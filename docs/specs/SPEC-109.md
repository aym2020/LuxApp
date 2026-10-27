# SPEC 109 — Lux Match : Double jeu (game design + bible de contenu)

**Dépôt :** aym2020/LuxApp · **Branche cible :** `2.1` · **Statut :** **démo jouable ; bible éditoriale intégrée le 27/10/2026 (lots 1–5, voir « Suivi par lot »)**, textes LU **audités par règles et leçons, non certifiés LOD/natif**, recette Samsung à faire · **Date :** 26 octobre 2026 · **État documentaire :** les sections 12 et 13 sont implémentées dans la mesure décrite au tableau de suivi ; les écarts et points ouverts y sont listés.

> **Banque textuelle unique à exploiter lors des prochains lots :** [Bible éditoriale Lux Match A1.1](../LUX-MATCH-BIBLE-EDITORIALE-A11.md) — personnages, réseaux, 28 scènes candidates, événements, réactions et conclusions, avec identifiants et garde-fous linguistiques. Ce contenu est un **brouillon documenté**, distinct des JSON runtime et **ne remplace pas le code** ; consulter la section 12 pour les priorités et la section 13 pour le planificateur procédural.

## Démo implémentée (27/10/2026)

**Accès :** Jeux › carte « Lux Match · DÉMO » (`ouvrirLuxMatch()`), vue `view-luxmatch`, non restaurée après actualisation (retour au hub). Badge « DÉMO · textes LU en relecture » en jeu et note sur l'écran de fin.

| Fichier | Rôle |
|---|---|
| `public/lux-match-core.js` | Moteur pur (Node + navigateur) : phase `profil` puis swipe (4–6 cartes, match au 1er ou 2e « j'aime », paquet relancé si tout est refusé), **générateur `composerScenario`** (lot 4), look (±4 max selon `outfitSignal` publié), échanges `question` / `demande` / `evenement` / `rappel` (lot 3), événements conditionnels (max 2 dont 1 gros), aveu = réparation, contradictions (+20 suspicion, −10 affinité) puis B25, batterie −5 %/s ouverte (temps actif, pas de 0,25 s max), anti-téléphone (événement après la réponse en cours, puis −5), fin anticipée à suspicion ≥ 80, fins FAIL (≥ 60) > FUN > SUCCESS (aff. ≥ 65, sus. < 40) > NEUTRAL, score (langue 600 + affinité ×3 + (100 − suspicion) ×2), 2 réponses lors des 2 premières parties puis 3 (âge : toujours 3) |
| `public/lux-match.js` + `.css` | TON PROFIL, téléphone CSS (swipe glissé ou boutons), MATCH arcade, apps fictives Pix / Pro / Amis, LOOK 5 styles × 6 couleurs (noms LU), date : jauges, première impression, bulle LU + aide FR, réponses, réponse canonique de la partenaire (B21), corrections, messages pixel `UI_FEED_*`, téléphone à batterie (alerte 20 %, « Batterie à plat »), fiche « Ma vraie identité » sur tous les écrans (hors batterie), résultats : conclusion `FIN_*`, « Ce qui s'est passé », expressions, graine. Sons Web Audio propres. Records `luxMatchRecord`, `luxMatchParties`, préférences `luxMatchAideFr`, `luxMatchSon` (par profil). Aucune écriture dans `luxProgress`. |
| `public/lux-match-3d.js` | Module chargé à la demande : un renderer, rendu basse résolution « PS1 » (pixel ratio ×0,5, `image-rendering: pixelated`), portraits et **photos Pix dans 8 décors low-poly** (parc, terrain de foot, réception, ville de nuit, carnet, atelier, Lisbonne et son tram, train), aperçu du look face ↔ trois-quarts, café néon de nuit (Kenney Furniture), partenaire face caméra (visage au-dessus des réponses), Alex de dos, **gestes de tête sobres** (hoche, sourire, sourcil, gêne, regard froid, rire) ; animations complètes réservées à la fin heureuse (Victory), au malaise (Defeat) et aux gags rares (disque rayé, zoom). Repli : portrait 2D si WebGL indisponible. |
| `public/lux-match/` | GLB CC0 : 5 modèles de partenaires, 4 looks d'Alex, `anims.glb` (squelette commun), `cafe.glb` ; voir `CREDITS.md`. Régénération : `tools/lux-match/`. |
| `server.js` | `GET /api/jeux/lux-match` → `{ contenus }` (copie hors ligne via SPEC 93). `archetypes-v01.json` et `dialogues-a11-v01.json` restent dans le dépôt comme archive, non servis. |
| `data/jeux/lux-match/contenus-v02.json` | Contenus de la bible A1.1 structurés : `persona`, 6 `profils` (Tinder, Pix, Pro, Amis, répliques canoniques, réactions, fins), `variantes`, `preferences`, `beats`, `rappels`, `clotures`, `evenements`, `nonIntegres`, `correctionsAudit`, `finsAdaptees`. Chaque ligne LU porte `review` (voir ci-dessous). Généré par `tools/lux-match/contenus_v02.py`. |

### Intégration de la bible éditoriale — suivi par lot

| Lot | Statut | Contenu livré |
|---|---|---|
| 1 — Stabilité 3D | Fait | Teinture synchrone (Noémie/Emma partagent un modèle), scènes en chargement annulées à la sortie, aperçu du look face ↔ trois-quarts (±35°), badge DÉMO sous les réponses, `diagnostic()` (3 parties consécutives : 1 Alex en aperçu, 2 personnages au café). |
| 2 — Profils et réseaux | Fait | Écran **TON PROFIL** avant les swipes (`phase: 'profil'`, `commencerSwipes`), bouton « Ma vraie identité » et bouton **FR** dans l'en-tête de tous les écrans, Tinder (bio + tags éditoriaux), Pix (pseudo, compteurs, fil de photos 3D, légendes LU, privé = aucune photo), Pro (À propos LU), Amis (posts LU avec indices de look/téléphone obligatoires). Aide FR : traduction **uniquement** si activée, partout (y compris fiche d'Alex, tags, posts, légendes). Le changement d'aide pendant une lecture ne bloque plus le rendez-vous. |
| 3 — Conversations et conséquences | Fait | Moteur réécrit sur `contenus-v02.json` (les JSON v01 ne sont plus servis) : 4 types d'échanges (`question`, `demande` B21 où elle répond avec ses faits canoniques, `evenement`, `rappel`), âge toujours à 3 réponses correctes (120 ans = `blagues`, jamais un `claim`), mensonges mémorisés (`claims`, `mensonges`, `dejaMenti`), contradictions (aussi croisées : banquier « à l'hôpital », origine ≠ nationalité) → suspicion +20 puis B25 « Ass dat wouer? », 11 événements conditionnels (budget 2 dont 1 gros), anti-téléphone d'Emma, rappel B15–B17/origine/métier en acte 3 (mensonges prioritaires), B24 seulement si tout va bien, B24/B25 traduits même sans aide. Fins : FAIL > FUN (gag réellement joué) > SUCCESS > NEUTRAL, texte `FIN_*` seulement si sa garde est vraie, sinon texte générique ; écran « Ce qui s'est passé ». Première impression `REACT_*_LOOK_*`. Parcours : un des 10 plans pilotes valides de la bible (âge ajouté après le prénom). |
| 4 — Générateur semi-procédural | Fait | `composerScenario(contenus, profil, graine)` dans `lux-match-core.js`, appelé **une fois au match**, hasard dédié (indépendant des tirages d'affichage). Traits : humour (parmi ceux du profil), 0–1 variante de post (60 %), **au plus un levier fort** : ex « Alex » ≈ 10 % (Claire, Sofia), préférence d'âge ≈ 35 % (jamais en plus de l'anti-téléphone d'Emma) avec son post PREF_* publié sur Amis. Scènes : acte 1 salutation + prénom + âge (85 %, toujours si préférence d'âge), acte 2 = accroche de la partenaire (`beatsForts`) + 2–3 thèmes (scènes propres ×3), un seul sujet café, B09 après B08, B21 jamais en premier ; acte 3 rappel (75 %) + B18 ou B26. Validation (6–8 tours, doublons, salutations, indices look/téléphone/âge/prénom, accroche) puis 3 essais, sinon repli sur un plan pilote. Plan gelé : `schemaVersion`, `contentVersion`, `graine`, `traits`, `posts`, `indices`, `diagnostics`. Équilibrage : le doute augmente avec les mensonges accumulés (+2, +5, +8… suspicion, +4 sur son sujet favori). Graine et scénario affichés en bas des résultats. |
| 5 — Réactions 3D, fins, polish UX | Fait | Gestes sobres de la tête (décalage retiré chaque image, sans dérive), Victory/Defeat seulement en fin de partie ; photos Pix dans leur décor ; caméra du café recadrée (Alex moins envahissant, visage de la partenaire au-dessus des réponses) ; textes batterie de la bible (« 20 % ! Fais vite. », « Batterie à plat. Maintenant, improvise. », « Revenir au rendez-vous ») ; petits écrans ≤ 700 px de haut : réponses plus compactes, badge DÉMO masqué en date, panneau du bas défilable en dernier recours (vérifié 320×640 avec les 3 réponses d'âge). |

**Contenus de la bible non intégrés** (détail dans `contenus-v02.json › nonIntegres`) : B14_TIME, EV_CLAIRE_TIME, EV_SOFIA_TRAIN et les plans P04/P10 (heure 7 h/19 h ambiguë) ; B19 (redondant avec B21) ; B20/B22 utilisés comme répliques canoniques de la partenaire, jamais comme boutons ; B23 (« Deng Faarf ») remplacé par la première impression FR ; REP09_C « doheem » (aucun mode de travail dans le persona) ; les 30 répliques LU des réactions (§11) : réactions affichées en FR ; VAR_CLAIRE_TIME. Erreurs grammaticales volontaires : seules les erreurs `E` de la bible (pragmatiques : « Äddi! » au début, « Gudde Moien! » le soir, « Kaffi! », « Moien! » au départ) ; aucun distracteur grammatical inventé. B11 retiré du plan P12 (même question qu'EV_EMMA_COFFEE).

**Points ouverts avant publication :**

- **Relecture LOD/native** de toutes les lignes `audit_regles` et `a_verifier_lod` (professions Léierin/Illustratorin/Programméiererin, Guide, couleurs/look « sportlech Kleeder », « faarweg », « bequeme Look », Konschtwierk, Kënschtler, eeler, « nach eng Kéier », « Entschëllegt, ech hu gelunn », « Dat weess ech nach net », « Bis geschwënn », « leeën den Handy ewech », préférences PREF_*). Portugais du gag Sofia à relire.
- **Leçons** : trois occurrences « Ech schwätze Franséisch **an** Lëtzebuergesch » dans `data/lecons` contredisent la règle du n (« a Lëtzebuergesch », retenu dans le jeu) — à arbitrer, non modifié.
- **Samsung réel** : lisibilité 320–430 px, 3 parties consécutives (doublons WebGL, temps du 2e chargement), batterie (pause/reprise, onglet masqué, retour Android, 0 %), gestes de tête perceptibles mais discrets, photos Pix lisibles, performance des décors (portraits rendus une fois puis mis en cache).
- Filtrage des scènes par leçons débloquées et mode batterie lente (`accessible`) : toujours non branchés dans l'interface.

**Statuts de relecture (`review`)** — aucun n'équivaut à une certification native :

- `lecon` : phrase présente **telle quelle** dans `data/lecons` (vérifié par `test/lux-match-contenus.test.cjs`) ;
- `lecon_modele` : même structure qu'une phrase de leçon, seul un nom, nombre, lieu ou une langue change ;
- `audit_regles` : contrôlée par Claude (conjugaison, règle du n, prépositions, accords), hors leçons ;
- `a_verifier_lod` : lexique ou tournure hors leçons (professions, adjectifs, expressions) à confirmer sur LOD.lu et par un locuteur.

LOD.lu n'est pas joignable depuis l'environnement de Claude : **aucune ligne n'a été vérifiée sur LOD**. Les corrections appliquées à la bible (règle du n, « kee Kaffi », « keen Handy », « Librairie »…) sont listées dans `correctionsAudit`.

**Ajouts de données (brouillons) :** `apparence3d` par profil ; `recallNodes`, `recallRules`, `contradictionReaction` ; corrections « Ech spille gär Fussball », « Wat fir en Déier sinn ech? », post anti-téléphone d'Emma en LU. **Tout reste à auditer sur LOD avant production.**

**Tests :** `node --test test/lux-match*.test.cjs` — `lux-match.test.cjs` (moteur : plans, swipe, look, 12 parcours sincères, âge, Portugal, budget, contradiction + B25, cohérence croisée, faute pragmatique, préférences, fins, batterie, anti-téléphone, garde-fous 3D), `lux-match-contenus.test.cjs` (statuts de relecture, phrases « lecon » présentes dans les leçons, règle du n, IDs, faits canoniques, indices publics), `lux-match-generateur.test.cjs` (1 000 graines × 6 profils, 18 000 parties simulées, rejeu). Parcours navigateur (Playwright, SwiftShader) : profil → swipe → match → enquête → look → date → résultats, 3 parties consécutives sans doublon de personnage ni erreur JS ; captures 320×640, 360×740. Suite complète `node --test test/*.test.cjs` : 228 OK, 8 échecs préexistants (tuile Jeux, composition 2.1, feuille Cours, CSS intro, blocage Jeux, roue ×3). `bash tools/critique.sh` : 19 échecs navigateur, tous présents avant le lot 1 (vérifié sur `3c8275e`), aucun lié à Lux Match.

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

**STATUT DE LA VERSION INITIALE DE CETTE FICHE (historique) :** seule la spec et les contenus JSON avaient été livrés. Depuis le 27/10/2026, une démo jouable est intégrée, puis la bible éditoriale (lots 1–5, voir tête du document) ; la recette complète Samsung et la validation linguistique restent à effectuer.


---

## 12. Arbitrages validés — Gameplay, personnages et finition UX (27/10/2026)

**Statut : implémenté le 27/10/2026 (lots 1–5, voir « Suivi par lot » en tête) ; texte de cadrage conservé tel quel.** Cette section complète et, si nécessaire, **prime sur les parties prescriptives antérieures** de SPEC 109 ; elle ne constitue pas un compte rendu de fonctionnalités livrées. La première démo fonctionne sur Android mais une seconde partie a montré des anomalies 3D ; **Claude traite ce bug séparément**, ne pas rebasculer le rendu ou retoucher les scènes parallèlement. Préserver le code existant, les parties et les sauvegardes.

### 12.1. Périmètre : ne PAS ajouter de « lore » complexe

- **Refuser CUPID.EXE**, voix d'algorithme personnifié, quête scénarisée, personnages secondaires récurrents, nouveaux décors, monde ouvert ou hub narratif : **hors périmètre**.
- Le décor du café actuel reste le lieu unique du date. **Garder les six archétypes**, sans multiplier les personnalités avant de fiabiliser le contenu.
- **Oui** aux événements comiques conditionnels (piège Portugal, anti-téléphone, jogging, etc.) et aux **conclusions personnalisées par personnage et par historique réel** : succès, maladresse, bluff découvert, complicité malgré l'échec.
- Le plaisir doit provenir du conflit *préparation → conversation → improvisation → conséquence*, pas d'un scénario additionnel.

### 12.2. P0/P1 — Présenter le personnage joueur AVANT le premier swipe

- Première vue au lancement d'une partie : **carte « TON PROFIL »** cohérente avec le faux smartphone (avatar 3D/portrait existant, prénom **Alex**, **28 ans**, France/Frankräich, **Metz**, **Banker** / banquier, **Franséisch** / français). Ajouter les informations canoniques du `pilotPlayerPersona` si utiles ; ne pas inventer de renseignements personnels.
- CTA principal explicite **« Commencer les swipes »** ; pas de nouveaux formulaires, de personnalisation de l'identité ou de retouche de progression. **Option pour revoir la fiche avant le date** et bouton « Moi » pendant le date, déjà existant, à conserver.
- Cette carte présente la **vérité**. Pendant le date, les fausses affirmations du joueur sont stockées dans `claims`/historique **séparément** : ne jamais réécrire son profil réel, ne jamais lui afficher automatiquement le détail de ses mensonges pour résoudre les défis à sa place.
- Le profil peut changer dans de futures versions, mais **ne PAS implémenter de génération de personas joueurs** dans ce lot ; respecter les traductions des champs à leur affichage.

### 12.3. P1 — Trois réponses à la question d'âge, toutes grammaticalement correctes

Pour le nœud `age` (et seulement là où ce modèle de choix sert réellement au game design), présenter **exactement trois réponses en luxembourgeois**, dans un ordre mélangé, sans étiquette qui révèle leur type :

1. **Vérité** : âge canonique du personnage joueur (pilote : 28).
2. **Mensonge crédible** : autre âge adulte proche (pilote : 30).
3. **Mensonge aberrant** : âge volontairement absurde (pilote : 120) ; c'est une **blague assumée**, pas nécessairement une erreur linguistique.

**Important :** les trois phrases doivent être **linguistiquement correctes** : pas de distracteur grammatical « Ech bass… », pas de « 28 / 30 / 120 » brut en interface finalisée si les leçons requièrent les nombres en lettres. Vérifier formes des nombres au LOD et dans la grammaire. Séparer les évaluations : `linguisticCorrect=true` pour les trois ; `truthType=honest|plausible_lie|absurd_joke` pour les conséquences sociales. Aucune faute de langue induite par la seule absurdité d'un chiffre.

La **préférence d'âge** d'une partenaire est une variable de profil **optionnelle et indépendante de l'archétype**, parmi `indifferent`, `prefers_similar`, `prefers_older`, `prefers_younger` (tous adultes), éventuellement une plage raisonnable explicitement affichée. Certaines partenaires **s'en moquent totalement** : dans ces cas aucun bonus/malus ne doit dépendre de 28 vs 30. Un critère ayant un effet significatif doit pouvoir être découvert dans ses informations publiques. Les réactions aux blagues varient par personnalité (humour apprécié / réaction glaciale / sourire), mais restent cohérentes et compréhensibles. Aucune préférence d'âge supposée d'après son métier ou son origine.

**Ne jamais donner automatiquement +8 à un mensonge** ; les scores dépendent du contexte. Les conséquences immédiates ne doivent pas effacer la possibilité de relance de cohérence plus tard. Les choix « 120 ans » restent disponibles sans rendre une fin agréable impossible à cause d'un unique gag.

### 12.4. P1 — Événements rares liés au prénom : l'ex d'Alex

- Ajouter au plus **1 trait rare** dans la banque des partenaires, par exemple `dislikedFirstName: 'Alex'`, associé à une raison comique **fictive** (prénom d'un ex qui lui a laissé un mauvais souvenir). Éviter de forcer le mot « toxique » ou une histoire lourde dans la conversation A1.1 ; humour léger.
- **Indice accessible AVANT le date** : une publication personnelle `Amis`, une bio ou une remarque explicite. Ne jamais punir le joueur sans possibilité de découvrir l'information.
- À « **Wéi heeschs du?** » le vrai `Alex` peut déclencher une surprise/réplique gênée, mais **pas un échec instantané**. Un autre prénom `Max` est un bluff linguistiquement valide, mémorisé comme tel et exposé à une **question de rappel** plus tard. Un prénom décalé peut donner lieu à une réaction humoristique si la banque de contenu permet une phrase LU validée. Les effets ne doivent pas être une règle universelle de tous les archétypes.
- Cas limite : si `dislikedFirstName` n'est pas celui du persona courant, aucun effet. Pas de prénom interdit « universel » ni de hasard injuste.

### 12.5. P0 — Corrections d'ergonomie constatées sur captures Android (27/10)

- **Aide FR** : lorsque l'option est « désactivée », ne **jamais** afficher les traductions dans les posts Amis ou les légendes Pix, à moins que le contenu soit explicitement un élément de décor non évalué. À l'activation, la traduction apparaît sous le texte LU partout, y compris bio, légendes, posts, réponses. **Audit contenu obligatoire** : les `captionFr` actuels et posts « Blo. », « Rout. », « Gréng. » sont insuffisants ; **ne pas masquer des textes français bruts sans les remplacer par des phrases LU validées**.
- **Tags sur swipe** : la bio « Sport a Fussball » ne doit pas être découpée automatiquement en `Sport`, `a`, `Fussball`. Introduire une banque de **tags éditoriaux**, chacun autonome et vérifié ; pas de jeton grammatical isolé.
- **Photos Pix** : une légende ne doit pas expliciter les règles du jeu (« pays d'origine confirmé dans Amis ») ; la photo doit représenter visuellement son sujet. Enrichir les mini-scènes 3D uniquement si le renderer stabilisé le permet ; sinon images/poses spécifiques réutilisables à coût faible. Les comptes privés restent fermés.
- **LOOK** : avant validation, l'avatar doit être vu **de face / trois quarts**, et un changement de style/couleur doit actualiser visiblement sa tenue ; éviter que l'avatar en rotation libre présente son dos au moment de décider. Faire ressortir la silhouette propre à chaque style et préserver les gros boutons sur mobile. Un look cohérent peut déclencher une **réplique brève de première impression**, sans bonus disproportionné.
- **DATE HUD** : préserver la lisibilité des jauges, des sous-titres LU et des choix, sans badge DÉMO chevauchant l'enseigne. Le badge d'état linguistique peut être déplacé en entrée/sortie du jeu. Limiter les **animations « Victory/Jump »** aux gros événements ; salutation = réaction subtile, mensonge suspect = regard/sourcil levé, gêne = pause/zoom, blague exceptionnelle = grand effet. Ne pas introduire de nouvelles dépendances lourdes en animation pour ce lot.
- **Réseaux** : les trois apps restent fonctionnellement complémentaires (Pix photos, Pro métier/formation/langues, Amis vie perso et goûts) et peuvent garder un peu d'espace vide. **Pas de remplissage artificiel** ; créer des publications LU crédibles qui révèlent des indices, sans textes de « développeur » ni tutoriel intrusif.

### 12.6. P1 — Dialogues en 3 actes, personnalités et conséquences

- Chaque date de 6–8 tours suit un rythme léger : **briser la glace** (salutations/âge), **faire connaissance** (ville, origine, métier, langues, routine), **moment de vérité** (rappel de mensonge ou piège **conditionnel**, puis conclusion). Garder 0–2 relances max et respecter les leçons A1.1 effectivement accessibles quand ce filtrage sera activé.
- **Ne pas généraliser** trois types de réponse à tous les nœuds : à l'âge, toujours 3 types ci-dessus ; ailleurs, proposer parfois plusieurs réponses **toutes correctes en LU** mais socialement différentes ; garder quelques erreurs linguistiques explicites pour réviser, jamais de fausse « mauvaise » réponse ambiguë.
- Affinité et Suspicion restent les **deux seules jauges sociales visibles** ; `languageScore` reste **indépendant** des préférences, plaisanteries, mensonges plausibles et des échecs de dating. Aucun gros bonus automatique parce que « la fille aime son métier » ou « son origine ».
- Chaque archétype doit avoir 1 préférence dominante visible, 1 trait secondaire, 1 petite contradiction légère/personnalité marquée, **1 type de relance drôle réalisable**. Une situation peut être une animation seule (elle rit du portrait catastrophique) sans ajouter une quatrième jauge ni nouveau lieu.
- Les **fins personnalisées** combinent le résultat social et au maximum 1–2 faits du run (ex. téléphone consulté devant Emma ; nationalité inventée devant Sofia ; mensonge sur le prénom). Pas besoin de dizaines de branches de dialogues ou de texte généré librement : utiliser des **templates vérifiés** avec garde-fous, faits et priorités clairs.

### 12.7. Ordre et critères pour Claude (NE PAS pousser tout en un seul lot)

**Pré-requis :** consulter derniers commits de `2.1`, `PLAYBOOK.md`, `AGENTS.md`, le présent document, `docs/CHARTE_UI_2.1.md` et code réel `public/lux-match*.js/css` avant toute intervention. **Ne pas écraser les commits de stabilisation 3D de Claude.** Faire les changements sur `2.1` par lots séparés avec tests.

1. **Lot A — P0 qualité de la démo** : laisser finir et tester la correction seconde partie WebGL ; corriger aide FR, tags, contenus bruts/phrases fragmentaires ; audit et traçabilité LU. Tester sur Android réel. Ne pas prétendre que les nouvelles phrases sont validées avant LOD.
2. **Lot B — P1 onboarding et gameplay** : écran profil d'Alex **avant swipe**, âge à 3 options (vraie/plausible/absurde), variables de préférences d'âge et prénom avec **indices visibles**, relances sur mensonges, sans nouvelles erreurs de grammaire.
3. **Lot C — P1 polish UX/3D et personnalité** : LOOK toujours lisible de face/travers, photos Pix illustrant réellement leur légende, 3 réseaux éditorialisés, réactions 3D sobres + événements comiques, déroulé conversationnel en 3 actes, **fins personnalisées**.
4. **Lot D — facultatif plus tard** : diversifier sans complexes supplémentaires, bilan d'apprentissage et optimisation de rejouabilité après retours Samsung. **Pas de CUPID.EXE, pas de nouveaux lieux ou lore**.

**Critères d'acceptation automatiques + Samsung :**

- Une nouvelle partie ouvre **d'abord** sur Alex et sa fiche ; continuer mène au swipe. Retour et relecture du profil sans batterie, pas de fuite entre profils utilisateurs.
- `age` offre toujours **exactement 3 choix** de phrases LU *correctes* avec variation d'ordre ; vrai 28, plausible 30, absurde 120 dans le pilote, trois évaluations linguistiques positives. Variation selon partenaire sensible/indifférente ; jamais de bonus universel au bluff.
- Préférence/prénom explicitement lisibles depuis profil avant date ; une partenaire indifférente ne juge pas l'âge, un autre prénom ne déclenche rien si pas de correspondance, un mensonge peut produire une relance ultérieure ; sincérité toujours jouable.
- Aide FR off = **aucune traduction des contenus pédagogiques** Pix/Amis/Pro/Dialogues ; aide on = traduction de chaque item muni de `fr`, au bon endroit. Les textes à auditer sont signalés hors production, pas affichés comme s'ils étaient corrects.
- Texte long / smartphone 320×640, 360×740, 430×932 : aucune option cachée sous barre Android, interactions ≥44px, réponses et boutons sans scroll coincé, portrait lisible, look front visible.
- Batterie baisse **uniquement** quand téléphone date ouvert, y compris si défilement dans Pix/Pro/Amis, jamais dans profil « Moi » ; fermeture/onglet masqué/retour Android suspend ; batterie nulle → retour scène date possible.
- Rejouer 3 fois avec diverses filles : pas de doublon de modèles/canvas, pas de disparition de scènes, pas de timers/RAF orphelins, pas d'altération de Lux Runner ni `luxProgress`.
- `node --test test/lux-match.test.cjs` + suite critique `bash tools/critique.sh rapide` puis `bash tools/critique.sh` ; rapporter l'état des tests et les éventuels échecs préexistants, sans affirmer « validé sur Samsung » sans recette sur appareil.

**Suivi :** cocher les lots dans une note de recette/commit détaillé **après** validation ; ne pas réécrire cette spec en feignant que toutes les fonctions sont livrées. Les données JSON et traductions validées sont une livraison distincte de cette décision documentaire.


---

## 13. Moteur semi-procédural de situations — Lux Match (cadrage 27/10/2026)

**Statut : implémenté le 27/10/2026 dans `composerScenario` (lot 4, voir « Suivi par lot ») ; anti-répétition entre parties et filtrage par leçons débloquées non faits.** Répond au besoin de rejouabilité « personnages familiers, nouvelles situations », sans IA générative au runtime, sans nouveaux lieux, sans CUPID.EXE, sans nouveau langage à apprendre. **Complète les arbitrages de la section 12** ; elle ne demande pas à Claude d'interrompre la stabilisation 3D ni les lots A/B/C déjà ordonnés.

### 13.1. Positionnement game design : générer une histoire cohérente, pas des cases aléatoires

La démo actuelle possède déjà **une graine** reproductible (`creerHasard`), un paquet de profils mélangés, des réponses mélangées, un moteur de `claims`/`mensonges`, des `archetypeFlows` statiques, des `conditionalTrapEvents` et des `recallNodes`. **Ne pas refaire ce moteur**. Ce qui manque est un **planificateur de situations** : profils sociaux et dialogues restent essentiellement pré-écrits et peu variables d'une rencontre à l'autre.

**Promesse V1 :** avec les mêmes six personnages visuellement identifiables et le même café, enchaîner plusieurs dates sans retomber toujours sur les mêmes révélations, mêmes looks, mêmes questions et mêmes pièges. Le joueur doit pouvoir raconter « avec Emma elle n'aimait pas le téléphone » ou « cette fois Emma plaisantait sur mon prénom » sans que l'archétype chill devienne incohérent.

**Invariants UX :**
1. **Identité forte** : archétype principal et silhouette du personnage inchangés ; les traits secondaires, préférences et petits faits peuvent varier **dans des bornes écrites**. Une voyageuse conserve le goût du voyage, même si elle est sportive en trait secondaire.
2. **Prévisibilité loyale** : toute préférence donnant un malus significatif (âge, prénom, look, téléphone) possède un **indice public consultable avant le date** et, idéalement, un signal visible sur l'écran de match. Aucune pénalité importante issue d'une règle cachée.
3. **Cause → effet** : un gag de langue étrangère ne peut émerger que d'une affirmation pertinente, un piège téléphone que d'une consultation, une surprise liée à l'ex que du prénom effectivement dit. Aucun piège gratuit.
4. **Liberté** : rendez-vous direct sans enquête toujours jouable ; enquêter apporte un **avantage d'information**, jamais le seul accès à une réponse possible. Les comptes privés sont respectés.
5. **A1.1 d'abord** : les phrases sont auditées, apprises au préalable, courtes et lisibles. Le moteur change les circonstances d'une conversation, **pas la correction grammaticale**.
6. **Petites sessions** : 6–8 tours principaux par rendez-vous, dont 0–2 événements, aucun filler et aucun temps d'attente artificiel.

### 13.2. Cinq couches séparées, réutilisant la pile actuelle

| Couche | Génère / décide | Doit rester stable |
| --- | --- | --- |
| **Personnage** | choisir 1 des 6 profils de base et, éventuellement, une variante visuelle déjà packagée (sans nouvelle génération d'assets) | prénom, avatar, âge et métier : constants **dans la partie** ; archétype principal stable |
| **Traits sociaux** | 1 préférence dominante, 0–1 préférence secondaire, `agePreference` optionnel, sens de l'humour, `dislikedFirstName` très rare, tolérance téléphone ; tirages parmi options par archétype | goûts annoncés par les réseaux, absence de contradiction entre applis |
| **Indices publics** | sélection de 2–4 posts / scènes Pix disponibles, fiche Pro crédible, 1–3 posts Amis ; répartition d'indices pour âge/look/téléphone/prénom | même `facts` et mêmes `preferences` sur toutes les surfaces ; si Pix privé, photos non visibles |
| **Rendez-vous** | organiser 3 actes à partir d'un pool de **beats** conversationnels validés, avec variantes par traits et compétences débloquées | début/fin crédibles, diversité thématique, borne de tours, options LU autorisées |
| **Conséquences** | évaluer `claims`, `flags`, préférences et actions ; déclencher **au maximum deux** pièges éligibles ; choisir un rappel et une conclusion récapitulant 1–2 événements réellement survenus | les points linguistiques et sociaux séparés, mêmes règles pour tous |

Ne pas construire une grammaire procédurale complète, un moteur de graphes générique ou un « story engine » ambitieux. **Un plan de rendez-vous structuré, des pools finis, un résolveur de contraintes et le `core` existant suffisent.**

### 13.3. Le cœur : générer un `scenarioPlan` UNE FOIS par match

Nouvelle fonction pure proposée : `composerScenario({ seed, profileBase, personaJoueur, leconsDebloquees, catalogue }) → { scenarioPlan, diagnostics }`.

Le `scenarioPlan` est généré **au moment du match** ; il sert ensuite de source canonique pour les réseaux, le LOOK et le date. Il **ne doit jamais se régénérer** lorsqu'on ouvre une app, recule, écoute une phrase, recharge une vue ou consulte son téléphone. Le plan peut être sérialisé pour reproduire exactement un bug.

Exemple de **contrat conceptuel**, non encore un fichier réel et **sans contenu linguistique non vérifié** :

```json
{
  "schemaVersion": 1,
  "seed": 27102026,
  "contentVersion": "lux-match-a11-v1",
  "partnerProfileId": "sofia_r01",
  "partnerArchetypeId": "voyageuse",
  "personaId": "alex_v01",
  "traits": {
    "main": "voyage",
    "secondary": "sport",
    "phoneTolerance": "normal",
    "agePreference": "indifferent",
    "dislikedFirstName": null,
    "humor": "taquine"
  },
  "facts": {"partnerAge": 29, "partnerCity": "Metz"},
  "preferences": {"style": "casual", "color": "blo"},
  "clues": [
    {"id": "sofia_style_blue_01", "app": "amis", "reveals": "style_color"},
    {"id": "sofia_travel_01", "app": "pix", "reveals": "travel_interest"}
  ],
  "beats": [
    {"id": "salutation_01", "act": 1},
    {"id": "prenom_01", "act": 1},
    {"id": "origine_01", "act": 2},
    {"id": "langues_01", "act": 2},
    {"id": "routine_01", "act": 2},
    {"id": "recall_if_claim", "act": 3},
    {"id": "conclusion_01", "act": 3}
  ],
  "eligibleEventPool": ["trap_portugal", "small_talk_voyage"],
  "endingTemplates": ["date_reussi_voyage", "bluff_decouvert", "fin_neutre"]
}
```

**Important :** `eligibleEventPool` ne force pas les événements. `trap_portugal` n'est déclenché que si **l'affirmation du joueur** remplit sa condition, et une option d'aveu doit rester disponible. `beats` peut contenir des **intentions** ou des nœuds de pool ; le texte LU affiché provient **d'IDs de répliques validées**, pas d'une concaténation arbitraire.

L'état **mutable** de partie (`claims`, `mensonges`, `flags`, batterie, jauges, réponse courante) reste dans `lux-match-core.js`. Ne jamais le confondre avec le `scenarioPlan` immuable : une réponse fait évoluer le **jeu**, pas les faits déjà publiés.

### 13.4. Génération sous contraintes : un pipeline court et déterministe

Algorithme de référence :

1. Tirer la **partenaire** selon le swipe actuel ; conserver les six noms et les modèles 3D. Si l'archétype est sélectionné, tirer une variante **secondaire** parmi ses combinaisons autorisées (la personnalité principale ne se retourne pas).
2. Construire une **fiche canonique cohérente** pour le run : prénom/âge (adultes 21+), ville, origine, profession, langues, traits et goûts. **V1 : garder les faits d'identité des six profils existants**, ne varier que goûts secondaires et situations, tant que les tables de déclinaisons LU ne sont pas auditéees. Ne pas faire changer l'âge ou le prénom d'un profil entre écrans.
3. Choisir au plus **1 levier social fort** (ex. anti-téléphone, prénom de l'ex, préférence d'âge) + au plus 1 trait secondaire (couleur/loisir/humour). Éviter la multiplication de deux pièges de même nature ou une partenaire qui punit absolument tout.
4. Allouer à chaque levier déterminant au moins **1 indice public** (`clueId` avec `reveals`) dans Pix, Pro ou Amis, disponible avant LOOK/date ; pour le style, garantir au moins 1 indice explicite même si le réseau photo est privé. Ne pas rendre une origine déductible uniquement par une photo de vacances.
5. Constituer une **file de 3 actes** : salutation/prénom ; 3–4 thèmes A1.1 variés ; rappel ou piège conditionnel si éligible ; sortie. Filtrer par `lessonIds` débloqués, taille de texte et disponibilité des variantes de réponse. Réutiliser les nœuds actuels si aucun candidat sûr ; ne pas inventer une ligne.
6. **Planifier les opportunités de conséquence** : un bluff doit pouvoir revenir plus tard, mais **ne pas garantir** une sanction ; un mensonge crédible crée un risque, pas une défaite. Pour 6–8 tours, sélectionner les nœuds qui permettent au moins une relance compatible avec les choix disponibles.
7. Valider le scénario : indices présents, réponses produisibles, pas de double dialogue identique, piège conditionnel atteignable, difficulté A1.1 adaptée, fin accessible, ≤2 événements, ≤8 tours principaux, informations cohérentes. **Si validation échoue, retenter une variante bornée ; puis fallback fixe** sur le parcours actuel et log d'un diagnostic sans interrompre le joueur.
8. Geler `scenarioPlan`. UI Pix/Pro/Amis, LOOK, date et écran final consultent **le même objet**, sans nouveau tirage au changement d'écran.

**RNG :** séparer au moins `rngScenario` et `rngPresentation` dérivés de `seed` ; changer l'ordre d'une animation, l'ouverture du téléphone ou le tirage de réponses ne doit **pas** changer la personnalité ou les indices. Introduire `contentVersion` pour reproduire les bugs de seed et ne pas casser la recette si les pools changent.

**Contraintes fortes (validation)** > **règles d'équilibrage** > **variété** > **tirage aléatoire**. Ne pas générer des dizaines d'essais en continu : la composition doit être très légère (petits tableaux en mémoire, synchrones / temps négligeable).

### 13.5. Le directeur de partie (« drama director »), sans intelligence artificielle

Pas de LLM ou d'agent qui invente l'histoire. Un **sélecteur d'événements à poids** choisit parmi des beats *écrits, testés et compatibles avec l'état*. On ne tire jamais un événement dans l'absolu : d'abord `prerequisites`, puis `eligible`, puis `weight`.

- **Rythme** : Acte 1 pas de gros piège ; acte 2 possibilité de bluff et d'information personnelle ; acte 3 maximum un grand twist + un rappel déjà préparé.
- **Budget d'impact** : maximum **2 événements comiques** par date, dont au plus **1 gros événement animé** (les réactions de type souris/regarde ne comptent pas). Jamais deux punitions consécutives et jamais de piège pendant la lecture d'un texte LU.
- **Poids et rareté de départ À CALIBRER par tests** : `dislikedFirstName` environ **10 % des scénarios compatibles** ; `agePreference` explicite environ **35 %** ; `anti_phone` selon traits compatibles ; `noMajorTwist` doit rester possible. Ce sont des objectifs de conception, **pas des statistiques réalisées**.
- **Garanties** : une erreur de langue n'est pas un déclencheur gratuit de gag narratif ; le téléphone qui se vide est une difficulté d'enquête, pas une loterie ; aucun événement exige une connaissance de portugais pour obtenir un score de luxembourgeois.
- **Adaptation de difficulté** : seules la longueur, la syntaxe et les leçons débloquées changent ; ne pas faire dépendre les **préférences intimes** ou les conséquences sociales de la performance linguistique du joueur. Le jeu doit rester prévisible.
- **Anti-répétition optionnelle** : garder en local seulement les IDs de beats récemment utilisés (ex. 3 dernières parties) pour minorer leurs poids, **sans jamais** supprimer une scène fondamentale ou exiger un nouveau système cloud. Une même `seed` explicite doit produire le même scénario quel que soit cet historique (historique transmis explicitement comme entrée si utilisé).

### 13.6. Contrat « texte luxembourgeois sûr » : pas de combinatoire grammaticale libre

**La génération porte sur le choix des contenus et les faits, pas sur la syntaxe.**

- Tout texte LU/FR jouable est une **réplique entière auditée**, identifiée `lineId` + `grammarReviewStatus: validated` + `lessonIds` ; les brouillons existants restent `draft`.
- Une variable n'est interpolée que si le champ possède une **liste de variantes entièrement validées**. Pour pays/prépositions, métiers et nationalités, privilégier des *phrases complètes validées par valeur* plutôt qu'un moteur de déclinaison, notamment pour les exceptions (`aus Portugal` / `aus der Belsch` / `vu Lëtzebuerg`).
- Les âges `28 / 30 / 120` : trois réponses **grammaticalement correctes**, la troisième relève de l'humour ; prévoir les formes luxembourgeoises **vérifiées et affichables**, sans transformer 120 en simple chiffre si le but pédagogique est le nombre.
- Type pédagogique de choix **orthogonal** au type social : `languageCorrect` (booléen), `truthKind` (`honest`/`plausibleLie`/`absurdJoke`), `socialEffects` conditionnels au profil ; une blague correcte ne pénalise pas le score linguistique.
- Posts Pix/Amis/Pro et leurs traductions suivent exactement le réglage d'aide FR. Tags éditoriaux autonomes ; pas de « Blo. » isolé accompagné d'une traduction détaillée fabriquée.
- Avant intégration runtime : vérification de la **grammaire_luxembourg.md**, LOD.lu, audit du cours/JSON source, et relecture pédagogique. Les nœuds non audités ne sont **jamais** mis dans un pool publiable.
- Chaque pool est étiqueté `learningObjective` et au moins un lien de leçon. Les gags hors programme sont `pedagogicalScoring:false`, textes LU également à auditer avant publication.

### 13.7. Données d'auteur : préférer quelques pools riches à un JSON monstre

En conception, nouveaux champs / petits fichiers éventuels (À APPROUVER après audit de l'existant) :
- `data/jeux/lux-match/scenario-pools-v01.json` : variantes de traits autorisées **par archétype**, indices édités (posts, légendes, photos disponibles, préférence explicitement affichée), événements et conditions, poids/raretés.
- `data/jeux/lux-match/dialogue-beats-v01.json` : nœuds conversationnels **avec variantes de réponse validées**, actes possibles, `lessonIds`, `prerequisites`, `consequences`, liens de `claims`, priorités. Peut au départ être une **extension des JSON déjà chargés** pour éviter doublon.
- `public/lux-match-generator.js` : une petite **fonction pure** de composition et de validation du plan ; optionnel si une fonction intégrée dans `lux-match-core.js` est plus simple. La logique de conversation et des jauges reste dans le core, la vue dans `lux-match.js`, la 3D dans `lux-match-3d.js`. **Aucune nouvelle dépendance npm / aucun réseau externe / aucune génération IA à l'exécution.**

**Exemple mini-pool conceptuel** (`textId` doit pointer vers des textes réellement validés, pas des strings libres) :

```json
{
  "id": "name_ex_alex",
  "archetypes": ["chill", "bc_bg", "voyageuse"],
  "baseWeight": 10,
  "conditions": {"personaName": "Alex"},
  "clueRequirements": [{"app": "amis", "textId": "warning_ex_alex_lu_fr"}],
  "trigger": {"nodeId": "prenom", "claim": {"prenom": "Alex"}},
  "optionalResponseEvent": "surprise_ex",
  "scoring": {"learning": "unchanged", "social": "conditional"}
}
```

Ne jamais déduire `dislikedFirstName` à partir de l'avatar, de la nationalité ou du métier. **Un trait rare est facultatif**, et l'absence de cette complication fait partie de la variété.

### 13.8. Rejouabilité MESURABLE, pas multiplication marketing

**Faire varier les expériences**, pas viser un produit combinatoire trompeur du type « 6 profils × 10 âges × 5 tenues = 300 histoires ». Dix variantes cosmétiques qui suivent les mêmes 7 répliques restent **une** expérience ludique répétée.

**Objectifs de recette / hypothèses à vérifier** :
- Sur **20 parties** couvrant les six profils, les situations visibles présentent plusieurs combinaisons de traits secondaires/indices ; il doit y avoir de vraies différences de beats, de relances et de conclusions, **pas seulement l'ordre des choix**.
- Un joueur peut identifier la préférence majeure à partir d'au moins **un indice accessible et compréhensible**. Les phrases particulières des variantes sont compatibles avec les leçons étudiées.
- Chaque mensonge déclenchant un piège a une **réponse de réparation** ; une partie sincère sans enquête peut toujours atteindre une fin positive ou neutre, y compris avec partenaire anti-téléphone.
- Un résultat de fin a **une cause traçable** (`lastMeaningfulEventIds`, `truthKind`, `affinity`, `suspicion`) ; éviter le même texte final générique après des événements opposés.
- Des tests génératifs de **1 000 graines reproductibles** vérifient : profils majeurs, indices de tous les critères à effet fort, absence de contradictions entre réseaux, ≤2 traps, 6–8 tours, aucune boucle morte, toutes les options ouvrables, zéro fuite de posts privés, ≥1 trajectoire jouable honnête, taux d'échec de génération nul (fallback inclus). Ce n'est **pas** une exigence de 1 000 textes écrits.
- Tests *property based* (Node natif, pas forcément de dépendance externe) : `compose(seed,catalogue)` = même JSON deux fois ; changer `rngPresentation` seul ne change pas `scenarioPlan` ; rejouer exactement un log de choix produit le même historique/jauges/fin ; `lookup` d'un indice ne régénère pas un autre indice.
- Test parcours Android réel après intégration : pause/reprise/téléphone à 0 %, retours vers les trois apps, 3 runs successives avec réutilisation d'assets sans doublons WebGL, latence imperceptible, UI sans texte masqué sur 320–430 px. Évaluer les causes de frustration, pas seulement les tests verts.

### 13.9. Priorités et limites pour Claude

**NE PAS démarrer ce développement en même temps que les bugs 3D / lots A–C section 12.** Ce document sert de cible de design pour éviter d'écrire maintenant des dialogues trop statiques et incompatibles avec le futur générateur.

1. **Étape 0 — Audit des contenus** : inventorier précisément les permutations actuelles, comparer six profils et `archetypeFlows`, repérer les champs immuables, vérifier les répliques LU disponibles, estimer la **variété réellement visible** et les manques. Mettre ce bilan à côté de la spec.
2. **Étape 1 — Prototype de pur générateur, sans UI** : conserver six personnages et leurs faits d'identité, varier un trait secondaire + un indice, organiser 3 actes à partir des beats actuels, garantir les préconditions et la reproductibilité. Ajouter tests sur 1 000 seeds et logs de diagnostics. **Ne pas modifier le moteur 3D**.
3. **Étape 2 — Intégration contrôlée** : un seul `scenarioPlan` choisi par match ; les trois fausses apps et les dialogues **lisent le même scénario** ; aucune copie d'état séparée susceptible de diverger ; reprise/replay et fallback des anciens parcours. Tester en démo.
4. **Étape 3 — Enrichissement éditorial** : ajouter de **petits lots** de posts LU complets, d'options de dialogue, de variantes de réaction et de pièges, après audit LOD. Mesurer la nouveauté perçue et corriger les poids. Une nouvelle mécanique n'est ajoutée que si elle améliore le jeu et reste explicable.

**Critère d'arrêt** : si le générateur produit des parties moins lisibles, des indices ambigus, des erreurs de luxembourgeois ou une complexité de maintenance disproportionnée, **revenir au scénario pré-écrit**. Un catalogue de **20–30 situations très bien écrites, recombinées sous contraintes**, est préférable à une fabrique de 10 000 scénarios sans sens.

**Interdits maintenus** : pas de CUPID.EXE, pas de nouveaux lieux, pas de faux réseaux réels, pas de dialogue généré par LLM, pas de « difficulté » qui pénalise la vitesse de lecture, pas de rétroaction négative sur `luxProgress`, aucune refonte du renderer Runner.

---

## 14. Lisibilité du tempérament et compatibilité humoristique (retour joueur 27/10/2026)

**Statut : retour de gameplay + décision de conception à implémenter ; pas de modification du moteur.**

### 14.1. Problème réellement observé sur `2.1`

Une partie contre Léna s'est terminée à **61 affinité / 0 suspicion / 83 % LU** après les réponses « James Bond », « star du foot » et « Kaffi! ». La cause spécifique est vérifiable : dans `data/jeux/lux-match/contenus-v02.json`, `lena_r01.humours = ["direct","taquine"]`, tandis que le moteur `aimeLAbsurde()` dans `public/lux-match-core.js` n'accepte comme humour positif **que** `humour === "absurde"`. Ces plaisanteries déclenchent donc un malus standard sans signe public suffisant pour anticiper le résultat. Le refus d'une blague **n'est pas** un bug en soi ; l'absence d'indice, si elle détermine une partie, est un défaut de lisibilité ludique.

**Ne pas déduire** qu'un archétype sportif ou une profession implique d'être « coincée » : c'est un **trait de personnalité indépendant**, affiché ou suggéré dans ses publications, et éventuellement tiré comme variante cohérente.

### 14.2. Règle de design : la personnalité doit se lire avant d'être testée

1. Chaque partenaire révèle **au moins un signal de ton** accessible *avant le date* (bio Tinder ou mini-description) et **un indice plus explicite** dans Pix ou Amis pour les tolérances à l'humour ayant un malus significatif. Aucun avertissement « attention : -2 si tu dis James Bond », ni tag de score.
2. Ne confondre **aime plaisanter** et **aime les mensonges absurdes**. Léna peut être **taquine et compétitive** mais trouver agaçante la *vantardise grossière*. Maya peut apprécier le sarcasme sans aimer les références hors jeu ; Claire peut manier l'ironie sans apprécier les impostures.
3. La préférence s'applique au **genre de plaisanterie**, pas à tout `truth === "joke"`. Ajouter au contenu d'auteur `jokeKind` candidat : `autoderision`, `taquinerie`, `absurde`, `vantardise`. Une partenaire peut aimer certains genres et en détester d'autres, selon un petit catalogue borné.
4. **Lisibilité du feedback** : si le joueur tente une plaisanterie et qu'elle tombe à plat, montrer une réaction crédible (regard perplexe, petit silence, réplique de premier degré) et un impact social modéré ; ne pas afficher une faute de **luxembourgeois** si la phrase était correctement formulée. Une fille froide n'est pas nécessairement « suspecte ».
5. Le joueur qui **n'enquête pas** peut tout de même réussir. Enquêter aide à optimiser et à découvrir les traits fins ; les indices ne doivent pas former une énigme cachée dont la solution est obligatoire.

### 14.3. Exemples d'indices (FR d'auteur ; version LU à auditer)

| Partenaire | Signal dans Tinder (ton général) | Post Amis plus explicite | Conséquence cohérente |
| --- | --- | --- | --- |
| **Léna — taquine mais terre-à-terre** | « Compétitive, franche et pas très impressionnée par les grandes histoires. » | « J'adore chambrer les copains, mais ceux qui se prennent pour des stars, très peu pour moi. » | « Je suis une star du foot » tombe à plat ; une taquinerie sportive ou de l'autodérision peut lui plaire |
| **Claire — humour sec** | « J'aime les gens qui savent ce qu'ils racontent. » | « L'ironie, oui. Les CV inventés, non. » | Bluff professionnel jugé sur sa crédibilité, pas sur la valeur du métier |
| **Noémie — humour absurde** | « J'aime les gens qui osent être un peu bizarres. » | « Un dessin complètement raté peut être ma meilleure rencontre de la semaine. » | Le dessin en patate ou une absurdité assumée peut faire rire |
| **Maya — ironie geek** | « Jeux rétro et humour bizarre : bienvenue. » | « Si tu échoues au premier niveau et que tu en ris, on s'entendra bien. » | Autodérision appréciée davantage que vantardise de champion |
| **Sofia — humour spontané** | « J'aime les histoires de voyage et les gens qui me font rire. » | « Les histoires invraisemblables sont les meilleures… quand on sait que c'est une blague. » | Une énorme histoire assumée comme gag fonctionne, l'imposture persistante non |
| **Emma — humour doux** | « Un café, une vraie conversation, sans écran. » | « J'aime les petites plaisanteries, mais j'aime surtout qu'on m'écoute. » | Les blagues légères passent ; trop d'interruptions ou d'exagérations fatiguent |

**Ces formulations françaises sont des propositions éditoriales**, pas une nouvelle bio LU déjà vérifiée. Leur traduction en luxembourgeois doit respecter les leçons et la revue LOD.

### 14.4. Calibration et limites

- **V1 minimale recommandée :** une seule dimension `jokeKind` par choix et une table simple `humorReactions` par profil/trait tiré ; ne pas créer une nouvelle jauge ou une simulation de personnalité complexe.
- Pour `James Bond` : classification `vantardise` ou `absurde` selon mise en scène (réplique jouée sérieusement vs clin d'œil clair). `star du foot` : `vantardise`. `Kaffi!` : **réponse pragmatiquement incongrue**, pas un mensonge ni nécessairement une erreur de lexique ; séparer la qualité d'énoncé de la réaction sociale. La déduction linguistique éventuelle doit être fondée sur un objectif pédagogique explicite, non sur la susceptibilité du personnage.
- Ne pas rendre la réponse « humour » toujours bonne : deux filles doivent pouvoir réagir différemment **au même texte**, et la même fille doit pouvoir aimer une plaisanterie tout en rejetant la vantardise.
- Si le moteur tire des **variantes de tempérament**, le signal Tinder et le post Amis sont générés depuis le même `scenarioPlan`, sinon le trait reste fixe par personnage ; ne jamais présenter « humour débridé » à Léna si son scénario pénalise tous les gags.
- **Tests** : pour chaque partenaire et chaque `jokeKind`, déterminer la réaction avant la partie depuis les indices ; vérifier ≥1 indice public, pas de contradiction entre bio et réaction, aucune pénalité linguistique sur choix LU grammaticalement correct, pas de suspicion créée automatiquement par une blague ; tester au moins 100 graines incluant variants de traits.
- **Prérequis** : stabilisation des autres lots et relecture LU ; cet ajout est un travail de contenu/gameplay de faible priorité par rapport aux régressions 3D/UX.

**Contenus source et mapping** : [Bible éditoriale — section 13](../LUX-MATCH-BIBLE-EDITORIALE-A11.md#13-signaux-de-temperament-et-style-dhumour--complements-de-dialogues) et [Guide pour Claude](../LUX-MATCH-GUIDE-INTEGRATION-CONTENUS.md).

---

## 15. Réactions émotionnelles manga en surimpression 2D (27/10/2026)

**Statut : choix de direction UX/game feel à réaliser, aucune modification du jeu par cette note.** Objectif : les personnages 3D low-poly de Lux Match expriment peu les micro-émotions faciales ; **le joueur doit comprendre ce qu'il vient de provoquer même si la fille reste poker face**. Dans ce jeu, le silence et la neutralité du visage peuvent être volontairement comiques. Il ne faut pas remplacer cette comédie par des explications pédagogiques sur la maladresse sociale.

### 15.1. Solution : signes manga / visual novel en 2D au-dessus de la scène 3D

Créer une **couche HTML/CSS de réactions non interactive**, visuellement associée à la tête de la partenaire, sans modifier le squelette 3D ni générer de nouvelles expressions faciales. Graphismes originaux en **SVG ou sprites 2D locaux** (traits épais, silhouettes lisibles, style arcade PS1 cohérent avec l'UI violette). Pas d'emojis système comme unique rendu (variables selon Android), pas de bibliothèque d'animation externe, pas d'ajout de canvas/WebGL pour les glyphes.

Six émotions de base, avec un effet **déterminé par la réaction de la scène**, jamais par un tirage décoratif :

| Émotion de scène (ID éditorial) | Signe 2D | Compréhension attendue | Exemple déclencheur |
| --- | --- | --- | --- |
| `awkward` | **grosse goutte de sueur** (bleue, avec petit rebond) | Malaise / « euh… » | Alex crie « Kaffi! » au lieu de répondre normalement |
| `annoyed` | **veine de colère** rouge / deux traits de tension | Agacée, pas nécessairement soupçonneuse | Téléphone ressorti malgré avertissement d'Emma |
| `doubt` | **petit point d'interrogation** ou goutte + regard figé | Elle ne te croit pas / doute du sens | Une vantardise de foot, un bluff improbable |
| `delighted` | **petites étoiles** ou éclats roses, sans grand cœur systématique | Elle apprécie sincèrement | Une réponse attentionnée ou de l'autodérision |
| `charmed` | **petit cœur rose**, usage peu fréquent | Attirance plutôt que simple réponse correcte | Très bonne réponse sociale sur un sujet qui la touche |
| `stunned` | **! / traits de choc** avec micro-freeze | Stupeur comique | Piège portugais « hippopotame » ; mensonge totalement démasqué |

**Règles de lisibilité :** garder **un seul signe émotionnel principal** à la fois et un espace de respiration entre deux réactions. Ne pas mettre un cœur à chaque bonne réponse de LU, une goutte à chaque faute linguistique ni une veine à chaque choix négatif. La **grammaire** et la **réaction sociale** restent séparées. Les nombres d'affinité et de suspicion continuent d'exister dans le HUD, mais le symbole ne doit pas exposer la logique interne (seuils, pénalité exacte).

### 15.2. Exemples de mise en scène : les signes remplacent l'explication de professeur

**Léna / « Kaffi! » :**
- Alex dit « Kaffi! ».
- Léna reste impassible pendant ~0,3 s ; une **goutte manga** apparaît près de sa tempe et disparaît après ~1,2 s.
- Elle peut avoir une courte réplique naturelle et amusante : **FR intention :** « KAFFI ? Tu me réponds ou tu commandes ? ». **LU candidate à rédiger/auditer dans la Bible, ne pas afficher la phrase FR comme question LU.**
- Affinité légèrement réduite : la sanction est **sociale**. Ne pas expliquer « tu es trop direct » comme un tuteur de savoir-vivre ; si la réponse était une **erreur d'usage linguistique enseigné**, sa correction de langue relève d'un espace distinct, bref, sans confondre les deux.

**Léna / « Je suis James Bond » :** point d'interrogation + regard perplexe, sans punition de langue si la phrase est correcte. **Léna / « Je suis une star du foot » :** veine discrète ou point d'interrogation selon si elle interprète ça comme vantardise ou plaisanterie ; les traits humoristiques publics (§14) déterminent la réponse.

**Léna / autodérision sur son niveau de foot :** deux petites étoiles / petit rire. Une partenaire peut donc apprécier une plaisanterie et pas une autre.

**Emma / téléphone :** signe d'agacement (veine) **uniquement si son trait anti-téléphone est actif et son indice public**, pas simplement parce que le téléphone a été ouvert.

**Sofia / réponse « hipopótamo » :** symbole de choc « !! » + arrêt de la musique + très court zoom ; scène rare avec une intensité supérieure. Ne pas multiplier les gros effets à chaque tour.

### 15.3. Intégration technique minimale et robustesse mobile

**Constat du code réel `2.1` :** `public/lux-match.js` déclenche déjà `LuxMatchCore.repondre(...)`, obtient `r.visuel` et affiche `lmFeedback(...)` ; `public/lux-match-3d.js` expose `reagir(type)` avec mouvements de tête `hoche`, `sourire`, `sourcil`, `gene`, `froid`, `rire`, et événements `scratch`/`zoom`. La scène `#lm-scene` est absolue derrière les jauges et les options. **Pas besoin de refonte du moteur 3D.**

- **Source d'état unique :** enrichir les retours d'événement ou un mapping UI contrôlé `{visualReaction, emotionFx}` ; les glyphes découlent **de la même décision sociale** qui a produit `r.visuel`. Ne pas faire dépendre les icônes du score total, ni recalculer arbitrairement la personnalité.
- **Surimpression :** un petit composant DOM non cliquable `#lm-emotion-fx` au-dessus de `#lm-scene`, sous HUD et dialogue. Visuellement près de la tête de la partenaire, **sans masquer le visage, les sous-titres, l'indicateur batterie ou les réponses**.
- **Position :** version MVP : ancrage en % **vérifié sur plusieurs tailles Android et orientations** pour la caméra actuelle fixe, y compris fallback portrait 2D. Si le cadrage bouge avec zoom, soit corriger par 2–3 positions prédéfinies, soit projeter un **seul point proche de la tête** depuis la caméra déjà existante à l'écran (pas de nouvel effet Three.js) ; ne pas ajouter un second `requestAnimationFrame` à la page pour cela si cela n'apporte rien.
- **Rythme :** effet apparu après réponse, ~0,2–0,4 s de suspension pour les situations gênantes, 0,8–1,4 s de durée visible, puis disparition. **Aucune animation bloquante** ni attente forcée pour afficher le choix suivant ou lire le dialogue. Supprimer/annuler l'effet précédent au changement d'échange, au téléphone ouvert, à la navigation ou à la fin d'une partie. Un seul timeout/animation sous contrôle du cycle de vie.
- **Intensité** : `subtle` (petit pictogramme, pas de son) par défaut, `medium` (pop CSS court + son optionnel), `big` réservé à **un gag majeur** par date. Les petites réponses satisfaisantes ne doivent pas toutes avoir des effets.
- **Accessibilité et performances :** rendu SVG/CSS local léger, `pointer-events:none`, aria cachée si la réaction équivalente existe déjà textuellement ; sinon un retour textuel discret accessible en aria-live **sans diagnostic professoral**. Respecter `prefers-reduced-motion` (signe statique ou fondu sans secousse), mode silencieux, faible GPU. Éviter de répéter dans TalkBack le score ET le signe ET la réplique.
- **Thème :** contours assez contrastés pour rester lisibles sur fond néon/violet et sur le portrait de fallback ; signes cohérents stylistiquement avec les pixels/low-poly ; pas d'image manga sous licence empruntée à un anime.

### 15.4. Critères de recette et périmètre de Claude

1. Tester au minimum les événements **« Kaffi! »**, James Bond, star du foot, autodérision, faux métier de Claire, téléphone d'Emma, piège portugais de Sofia ; vérifier que chaque signe **correspond au contexte**, pas juste au malus.
2. Test **« poker face »** : visage/animation de la partenaire neutre et son coupé ; 3 testeurs doivent pouvoir dire s'il s'agit de gêne, colère, doute, amusement ou attirance grâce à la composition, **sans lecture du panneau de correction**. Si doute/colère confondus, modifier les symboles.
3. Réaction sociale ≠ faute de LU : même si l'affinité diminue, ne pas déclencher automatiquement de correction de grammaire. Le cas `Kaffi!` actuel nécessite une revue distincte de son statut `languageCorrect:false` (maladresse conversationnelle vs objectif pédagogique).
4. Vérifier 320 × 640, 360 × 740, 430 × 932, Android Samsung, safe areas, zoom caméra, fallback 2D, son OFF, motion reduced, téléphone ouvert/fermé et **3 rendez-vous successifs** : pas d'effet persistant, de dédoublement d'icône, de rendu masquant les choix ou de nouvelle fuite de timer/RAF.
5. Garder le moteur procédural, les six profils, le café et les graphismes 3D existants. **Cette évolution est une couche de feedback UX légère**, non un nouveau jeu, pas de nouveaux décors/lore.

**Livraison attendue ultérieurement :** petit atlas de **six sprites originaux**, mapping `r.visuel / emotionFx` et tests de non-régression ; **ne pas développer le changement par cette mise à jour documentaire**. Les répliques LU supplémentaires demeurent à valider selon la Bible/LOD.

---

## 16. Direction musicale et orchestration audio : deux boucles arcade rétro (27/10/2026)

**Statut : choix créatif et cahier des charges audio, NON implémenté par cette modification documentaire.** Ajouter exactement **deux thèmes musicaux originaux** à la démo Lux Match : un avant le rendez-vous et un pendant le rendez-vous. Ne pas ajouter de troisième thème complet pour les résultats ou les personnages ; conserver les SFX courts actuels. L'esthétique visée est **arcade old school / dating sim rétro PS1**, dans la DA violet–rose–or existante, et non une bande-son générique d'application de vocabulaire.

### 16.1. Les deux morceaux à produire

| Identifiant d'asset proposé | Phase de jeu | Direction artistique et instrumentation | Durée / pulsation cible |
| --- | --- | --- | --- |
| **LM_BGM_PRE_DATE** — titre de travail « Love Circuit » | Fiche d'Alex, swipes, match, enquête Pix/Pro/Amis, essayage des vêtements | **Electro-funk rétro joyeux**, sonorités 16-bit / synthèse FM, basse rebondissante, petite batterie électronique sèche, mélodie courte en sons de console, accords légèrement romantiques et kitsch. Énergie de sélection de personnage / dating sim, jamais musique agressive de runner ou EDM moderne | **108–116 BPM**, 4/4, boucle de **32–45 secondes** |
| **LM_BGM_DATE** — titre de travail « Neon Café » | Décor du café 3D, conversations, consultation éventuelle du téléphone pendant le date | **Lounge/chill rétro de jeu de rencontre**, piano électrique FM chaleureux, basse synthé ronde, percussions légères, nappes douces, échos 8-bit très sobres et petites notes mélodiques timides. Un peu romantique et maladroit ; **aucune voix**, aucun leitmotiv strident qui concurrence les répliques LU | **78–88 BPM**, 4/4, boucle de **44–60 secondes** |

**Parenté musicale** : un **motif de 3–5 notes** commun aux deux morceaux (en pré-date vif et sautillant, au café lent et délicat), pour que la transition donne l'impression d'un seul jeu cohérent. Accords riches mais lisibles, timbres synthétiques assumés, grain console **sans dégrader artificiellement la qualité des voix ou du texte**. Prévoir des mélodies originales, aucune reprise, aucun riff ressemblant volontairement à une bande-son protégée, aucun extrait de chanson commerciale.

**Repères de composition indicatifs (non imposés)** : une mesure 4/4, structure A/B/A de 16 ou 24 mesures avec variation d'instrument plutôt qu'un solo long ; limiter les aigus piquants et les grosses basses. La musique pré-date doit supporter la répétition lors de l'enquête, celle du café doit rester confortable pendant **plusieurs minutes de lecture**, y compris à faible volume. Test d'écoute comparative sur haut-parleur de téléphone Android et casque.

### 16.2. Machine à états audio : une musique active maximum

| Transition / état | Comportement attendu |
| --- | --- |
| Ouverture de Lux Match, après première **interaction explicite** autorisant l'audio | Démarrer **LM_BGM_PRE_DATE** si le son/musique sont autorisés ; ne pas lancer de musique avant une interaction conforme à l'autoplay mobile |
| Fiche Alex → swipe → match → enquête → look et retours en arrière | **Continuer la même piste**, sans la redémarrer à chaque \`lmRendre()\` ou réouverture des faux réseaux ; le jingle \`match\` existant reste audible en surimpression |
| Validation « Aller au rendez-vous » / passage \`phase === "date"\` | Fondu sortant pré-date ~**0,6–1 s**, démarrage/fondu entrant date ~**0,8–1,2 s** ; ne pas attendre le chargement Three.js pour garder une continuité sonore si c'est possible sans UX bizarre |
| Pendant date, ouverture du téléphone et panneau « Moi » | **Conserver LM_BGM_DATE** au même point ; la musique **ne suit pas la batterie** et ne recommence pas à chaque sous-panneau |
| Gros gag (Portugal, malaise volontaire, \`scratch\`) | **Micro-coupure ou baisse forte très brève** de la musique (environ **0,3–0,8 s**) synchronisée à l'effet existant, puis reprise en fondu ; ne jamais bloquer la lecture ou la réponse |
| Fin de date / \`resultats\` | Arrêter progressivement la boucle de café ; **réutiliser le petit jingle \`fin\` / \`bof\` déjà existant**, pas une troisième longue musique |
| « Nouveau match » | Revenir au morceau pré-date **une seule fois** ; aucune piste précédente ne continue en parallèle |
| Quitter Lux Match, ouvrir un autre jeu, perdre la visibilité de l'onglet ou verrouiller l'écran | Pause/arrêt immédiat ou fondu très court, **aucun son en arrière-plan non sollicité** ; sur retour visible, ne reprendre que si Lux Match est toujours actif ET préférence son active ET action utilisateur/autoplay permise |

**Règle absolue :** un seul contrôleur de bande-son et **un seul lecteur/pipeline de musique actif**. Ne pas multiplier les \`AudioContext\`, éléments \`Audio\`, timers ou \`requestAnimationFrame\` au fil des parties. Les sons de \`LuxMatchSon.jouer(...)\` restent indépendants mais intégrés au même système de gestion des volumes.

### 16.3. Mixage, pédagogie et commandes

- **La compréhension du luxembourgeois prime sur la musique** : volume musical initial **très bas** et stable, environ **15–25 % de la perception** d'une voix de lecture à volume usuel (ce n'est pas une valeur de gain ni une norme de LUFS : régler réellement à l'oreille et mesurer si possible).
- **Ducking de musique** : lors de la prononciation/TTS ou d'une réplique audio LU, réduire la musique d'environ **8–12 dB** (à calibrer), puis la remonter en ~0,4 s une fois l'audio terminé. **Ne pas couper** les sons de prononciation ni leur imposer de reprendre la piste du début.
- Les petits SFX \`swipe\`, \`like\`, \`match\`, \`bien\`, \`bof\`, \`faux\`, \`scratch\`, \`tel\`, \`vide\`, \`fin\` déjà synthétisés restent clairs, **sans être masqués** par une caisse claire, un arpège aigu ou un fort kick sur chaque interaction.
- **Respecter le réglage existant \`luxMatchSon\`** : s'il est désactivé, pas de musique ni de SFX. Ajouter si utile un booléen distinct \`luxMatchMusique\` (**activé par défaut seulement si la permission sonore globale le permet**) afin que le joueur coupe la musique **sans perdre les effets ni la prononciation** ; ne jamais réactiver l'audio sans son accord.
- **Commande accessible pendant le date** : le bouton son n'existe actuellement que dans l'entête pré-date (\`lmEntete\`). Placer un contrôle discret et tactile ≥44×44 px dans l'interface de date (ou menu audio commun réellement accessible), sans cacher jauges, téléphone, textes LU ou choix. Éviter de multiplier des boutons si le toggle global suffit ; en cas de menu séparé, comportement cohérent avec celui du hub.
- Les pistes sont **instrumentales** ; pas de voix chantée, pas d'effets de vibration forcée, pas de tempo qui impose de répondre vite. Aide FR, mode silencieux, \`prefers-reduced-motion\` et paramètre d'accessibilité batterie ne doivent pas rendre la lecture pénible. **Ne jamais lier la fin d'une boucle musicale à l'avancée du dialogue.**

### 16.4. Livraison des assets et implémentation conservative

- **Produire ou faire produire deux boucles originales** ; les fichiers audio finaux ne sont **pas fournis par la présente spec**, qui constitue le brief de composition. Utiliser une licence et provenance **traçables**, idéalement création originale du projet ; ne pas récupérer de MP3 YouTube, d'OST de dating sim, de « Nintendo soundalike » reconnaissable, ni d'asset incertain.
- Emplacement proposé : \`public/audio/lux-match/pre-date.ogg\` / \`date.ogg\` (+ \`mp3\` ou \`m4a\` de secours selon support effectif du navigateur, à vérifier). **Adapter aux conventions actuelles** du repo après audit, pas créer de doublons de répertoire.
- Les deux fichiers doivent être **bouclables sans clic, blanc, attaque tronquée ni décrochement** ; éventuellement utiliser un point de boucle interne mesuré si une longue queue de réverbération existe. Formats compressés raisonnables, **budget cible ≤1 Mo par piste** si la qualité est acceptable (à valider, pas un critère qui sacrifie l'écoute). Chargement différé selon la phase et cache navigateur/PWA si supporté.
- Aujourd'hui, le code \`public/lux-match.js\` comporte déjà **\`LuxMatchSon\` avec un unique \`AudioContext\`** et des notes Web Audio ponctuelles, mais aucune lecture de BGM. **Faire évoluer ce contrôleur ou un petit module adjoint**, sans recopier tous les SFX, sans modifier les moteurs 3D/runner et sans démarrer un second AudioContext inutile.
- Prévoir les états \`playPreDate\`, \`playDate\`, \`pause\`, \`stop\`, \`setMuted\`, \`dispose\`, support d'appel répété sans double lancement et **annulation des transitions obsolètes**. Les changements de phase et sortie de jeu pilotent la musique, pas le rendu HTML ou Three.js. Éviter de réinitialiser la musique si \`lmRendre()\` est rappelé uniquement pour changer la traduction FR.

### 16.5. Recette musicale et technique

1. **Timbre & cohérence** : avant-date vif et ludique, café doux et romantique, motif identifiable commun ; les deux fonctionnent sur haut-parleur Samsung à **volume modéré**, sans saturation, bourdonnement ni fatigue auditive au bout de 10 minutes.
2. **Loop** : 5 répétitions consécutives de chaque morceau sans trou sonore, clic ou montée de volume ; ne pas confondre effet de fin volontaire et mauvais raccord.
3. **Transitions** : jouer 3 manches de suite, swiper, ouvrir 3 apps, revenir Look, passer au date, faire un gag, terminer, recommencer : toujours **une seule** musique active, crossfades fluides, pas de reprise inattendue.
4. **Mute** : bouton OFF avant une partie, OFF puis ON pendant le café, retour à un autre jeu, écran verrouillé/app en arrière-plan ; jamais de réactivation intempestive, boutons et états sonores cohérents.
5. **Voix & SFX** : écouter des questions LU sur musique, avec ducking, match jingle, \`Kaffi!\` gênant et \`scratch\` de Sofia ; l'audio pédagogique reste intelligible et la musique ne masque ni feedback ni silence comique.
6. **Résilience** : réseau lent/asset absent/autoplay refusée/Web Audio indisponible/PWA hors-ligne : le gameplay continue **sans blocage ni erreur visible** ; fallback silencieux. Nettoyer timers/ressources au replay et quand l'utilisateur quitte.
7. **Tests existants** : \`node --test test/lux-match.test.cjs\` et suites critiques du dépôt ; ajouter tests ciblés sur le contrôleur audio/transition et recette Android réelle avant de marquer le travail validé.

**Interdits :** pas de nouvelle ville/café, pas de CUPID.EXE, pas de troisième thème musical complet, pas d'effet « horror » constant qui stresse la lecture du luxembourgeois. La batterie du téléphone crée la tension, **la musique du date crée l'ambiance**.


---

## 17. Refonte des écrans pré-date : téléphone, dossier Alex et dressing arcade (27/10/2026)

**Statut : spécification de refonte UI/UX, NON implémentée ; captures Samsung utilisateur du 27/10/2026.** Cet arbitrage complète les §§14–16 de la SPEC 109 et la bible éditoriale. Périmètre strict : **hub des réseaux dans le faux téléphone, modale dossier Alex, écran de relooking et entête mobile associée**. **Conserver** toutes les fonctionnalités déjà codées, l'aide FR disponible dans les contenus pédagogiques (mais pas dans la fiche Moi), les trois apps Pix/Pro/Amis, l'enquête, la navigation, les choix de tenue et le bouton de son **dans une configuration accessible**, sans icône permanente en haut.

### 17.1. Diagnostic confirmé par les captures Android réelles

1. **Réseaux** : double empilement d'interfaces (« grande barre supérieure Lux Match » + « énorme faux smartphone »), marge et largeur excessives, message externe « Enquête sur Noémie avant le rendez-vous. », hub intérieur minimal (3 grosses tuiles à lettres P/P/A sur fond vide), texte méta « Prends ton temps. La batterie ne se vide pas ici. », CTA jaune éloigné de l'interface du téléphone. L'écran fait **maquette** plutôt que faux système social intégré au jeu.
2. **Fiche Moi** : grand panneau avec portrait/bio française, 6 énormes lignes luxembourgeoises verticales, liste d'habitudes séparée, bouton « Aide FR désactivée », deux paragraphes explicatifs (« Tes mensonges ne modifieront pas cette fiche », « Ce que tu as raconté, à toi de t'en souvenir »). Résultat : **panneau de tutoriel méta** qui déborde la réalité fictive du jeu et demande beaucoup de scroll.
3. **Relooking** : grande zone de rendu 3D rectangulaire sans composition, avatar relativement petit et posé sur un socle violet, **cinq pavés de style comprimés sur une ligne**, **six couleurs et leurs noms tassés** avec risqué de collision/illisibilité, deux actions principales concurrentes (« Aller au rendez-vous » désactivé tant que rien n'est sélectionné, « Garder cette tenue » toujours accessible), beaucoup de vide autour. Ça ressemble à un paramétrage technique plutôt qu'à une préparation de date.
4. **Entête** : logo, badge DÉMO, FR, Moi, son sur une seule ligne : trop chargé pour ~320–430 px, d'où présence disproportionnée des contrôles. Le bouton de son doit **disparaître de la top bar** selon décision utilisateur ; ce n'est **pas** une demande de supprimer l'audio.

**But transversal :** impression de jouer à une **dating sim arcade old school/PS1** (typographie pixel pour les micro-titres, boutons et textures de console sobres, cadres maîtrisés, hautes contrastes et rétro modernisé), mais **lisibilité Android avant décoration**. Éviter les cartes SaaS géantes, faux effets CRT agressifs, bruit visuel permanent, ou esthétique de téléphone iPhone réaliste qui contredit la DA.

### 17.2. Composition cible — HUB « Réseaux de Noémie »

**Principe d'interaction :** le faux téléphone reste un **objet dans l'univers** et une interface fonctionnelle ; l'écran ne doit pas devenir une deuxième page web avec un smartphone qui prend toute la hauteur pour trois icônes.

- **Entête global réduit** : bouton retour ≥44×44, logo compact **LUX ♥ MATCH**, badge DÉMO miniaturisé ou déplacé sans masquer le titre. FR uniquement à l'endroit pertinent pour les contenus LU. **Supprimer l'icône son permanente de cet entête**, et éviter un bouton Moi redondant dans chaque vue si la navigation vers le dossier existe ailleurs ; garder l'accessibilité du dossier, notamment pendant le date.
- **Supprimer la phrase externe « Enquête sur [Nom] avant le rendez-vous. »** si le titre dans le faux téléphone dit déjà « Réseaux de [Nom] ». Aucun doublon.
- **Supprimer entièrement « Prends ton temps. La batterie ne se vide pas ici. »**, et toutes les phrases meta de règles sur cet écran. L'absence de drain avant le date reste vraie **dans le moteur**, sans être annoncée par un tutoriel non demandé.
- Téléphone au bon ratio, **cadre plus fin et moins haut en état d'accueil**, largeur relative adaptée au viewport (marges latérales et safe areas ; éviter de gagner 30 % de hauteur avec un cadre disproportionné). Préserver le style téléphone sans le faire ressembler littéralement à un appareil iOS haut de gamme.
- Intérieur : **barre d'état fictive arcade** compacte + titre **« Réseaux de Noémie »** + 3 apps réellement identifiables, dessinées comme **icônes pixel/sprites originaux** plutôt que 3 lettres P/P/A identiques. Chaque app possède sa couleur et son motif : Pix (photo/flash), Pro (carte/porte-documents), Amis (deux portraits/bulle). Conserver Pix/Pro/Amis et les écrans existants, **ne pas renommer ou inventer de quatrième app**.
- Sous chaque app, une courte étiquette fonctionnelle, voire un **état réel uniquement si calculable** (ex. privé pour Pix, publication récente) : **ne pas inventer de badge « 3 indices » ou compteur non représenté par les données**. Retirer les tuiles inutilement larges.
- Espace vide : **ne pas remplir avec de la décoration gratuite**. Réduire le hub à sa juste hauteur / compacter la façade et laisser respirer l'interface, ou proposer une petite vignette de la partenaire (déjà disponible) si elle apporte un contexte réel. Les détails OS doivent rester légers, pas créer des onglets fantômes.
- CTA primaire **« Choisir mon look »** clair, visible sans scroll non nécessaire, position cohérente **sous le téléphone ou dans sa barre d'action** (une seule solution, pas deux boutons). Le passage aux apps ouvertes doit rester entièrement scrollable et lisible ; conserver le retour apps et la confidentialité Pix.
- Les posts LU restent en luxembourgeois quand aide FR off ; le système ne réintroduit pas des traductions non demandées. Taille des zones tactiles ≥44 px.

### 17.3. Composition cible — dossier immersif Alex

**Ce panneau est consultable gratuitement pendant le date** et accessible en préparation. Il doit faire penser à une petite fiche privée / dossier de personnage **diégétique**, pas à une leçon ni à une fiche de debug.

- Titre court : **« DOSSIER ALEX »** (ou « Mon profil », tonalité immersive). **Retirer le libellé « Ma vraie identité »** si un vocabulaire de menu technique reste perceptible ; l'utilisateur comprend implicitement qu'il s'agit de sa fiche.
- Conserver portrait low-poly, Alex, 28 ans, vrai métier, Metz, France, langue, goûts et habitudes **canoniques** du persona — ne pas effacer les informations qui servent au gameplay. En revanche, **éviter le bloc narratif FR long** en doublon des champs.
- Présenter les caractéristiques en petites **lignes ou paires label/valeur** et les phrases LU essentielles en sous-cartes **compactes, lisibles, à densité maîtrisée** (pas six énormes cartes pleines largeur avec 20 px de marge). Garder suffisamment de LU pour qu'on puisse se rappeler les formulations, sans transformer l'écran en exercice.
- **Retirer totalement le bouton « Aide FR » dans la fiche** ; il n'y a pas de quiz à cet endroit. L'aide FR reste disponible là où un contenu pédagogique LU est proposé. **Retirer** : « Tes mensonges ne modifieront pas cette fiche », « Ce que tu as raconté, à toi de t'en souvenir », et tous rappels de mécanique énoncés par le système.
- Le descriptif des loisirs peut être reformulé comme **quelques faits sobres** (« Matin : café », « Football : non », etc.) sans expliquer au joueur que c'est une arme pour mentir.
- **Fermer** accessible sans descendre toute la fiche, bouton grande cible tactile / croix claire et sortie Android Back, focus restitué au contrôle d'ouverture, pas de perte du dialogue ou de batterie. Supporter scroll interne si nécessaire sans scroll piégé de la page.
- Pas de nouvelle personnalisation, ni de sauvegarde des mensonges dans les champs canoniques du profil.

### 17.4. Composition cible — relooking = mini-dressing / écran d'équipement arcade

**Intention** : « Je prépare mon personnage pour impressionner Noémie », pas « je choisis deux valeurs dans un formulaire ».

- **Haut du dressing** : un titre pixel court **« PRÉPARE TON LOOK »**, décor de cabine / écran de sélection d'avatar rétro possible **en CSS léger**, avatar 3D **nettement plus présent dans un cadrage face ou 3/4**, bien éclairé, **jamais dos à la caméra au moment d'un choix**. Les cinq modèles d'apparence existants restent. Éviter une grande dalle vide autour d'un petit personnage. Prévisualiser les changements immédiatement, conserver contrôle du rendu et caméra existants si possible.
- **Styles** : cinq **cartes d'équipement** plus visuelles que des pavés textuels. Petit pictogramme original simple / silhouette CSS + nom en français \`Sportif / Casual / Loose / BCBG / Créatif\`. Ne pas obliger cinq colonnes sur petit Android : grille adaptable (ex. 3 + 2), carrousel seulement s'il évite d'en cacher sans signalement ; pas de scroll horizontal nécessaire juste pour toucher une option.
- **Couleurs** : six **pastilles 36–44 px**, avec zone tactile ≥44 px et contraste/contour de sélection ; **le nom LU/FR peut être affiché sous la seule couleur choisie**, pas serré six fois dans un rang avec les autres. Accessibilité : chaque pastille a \`aria-label\` clair, non ambigu sans perception de couleur.
- **Un seul CTA primaire non trompeur** : « **Aller au rendez-vous** ». Ne pas le bloquer sans raison si une **tenue par défaut** existe. Si le joueur n'a rien modifié, continuer avec la tenue par défaut ; sinon la sélection est celle qu'il voit.
- Le secondaire « Garder cette tenue » est ambigu : **supprimer ce bouton comme action de départ séparée** et préserver sa sémantique via le CTA unique qui accepte le look actuel. Rendre \`Revoir ses réseaux\` secondaire discret (naviguer sans effacer la sélection de tenue).
- Choix + avatar + CTA doivent être utilisables **sur 320–430 px** : éviter que la grille et le CTA se heurtent au bord, utiliser le scroll naturel si nécessaire, **sticky CTA seulement si nécessaire et sans masquer les derniers choix** ; safe area Android respectée.
- **Pas de révélation automatique des préférences de la fille** à ce stade : le jeu récompense l'enquête. Éviter un label qui vend la solution (« Indice détecté : bleu + casual ») si le joueur n'a rien consulté. Si futur rappel, il doit seulement refléter des informations **déjà vues explicitement** par le joueur, sans badge de score.
- Le visuel doit correspondre à la DA arcade (socle/stage de personnage, sélection lumineuse brève), **sans modifier les modèles 3D ni ajouter de scènes**, sans recomposition des assets à chaque bouton.

### 17.5. Barre haute et réglage du son — arbitrage avec la musique (§16)

- **Décision explicite : supprimer l'icône haut-parleur permanente de la top bar pré-date**. Le logo, le retour et l'aide FR réellement pertinente ont priorité sur les autres actions.
- **Ne pas supprimer le son du jeu** : la SPEC §16 demande deux thèmes musicaux et le respect du réglage \`luxMatchSon\`. Conserver la préférence utilisateur et le mute **accessible via un emplacement discret dédié** (p. ex. panneau Pause/Options ou réglage audio réutilisable sans ouvrir un écran additionnel non nécessaire). Si un menu audio séparé est requis, il ne doit pas recréer l'encombrement dans l'entête. Tester le **mute durant le date** et la persistance quand le joueur revient dans Lux Match.
- **La fiche Moi** doit rester accessible pendant le date (HUD) sans consommer de batterie ; ne pas la retirer sous prétexte d'alléger le header.
- Les fonctions disponibles (Aide FR, Moi, Son) ne doivent jamais être supprimées silencieusement : **déplacer ou contextualiser**, sauf suppression explicitement demandée **dans la fiche Moi** (\`Aide FR\`) et **dans l'entête** (\`son\`).

### 17.6. Acceptation visuelle et non-régression

1. Produire **captures avant/après sur viewport identique** : 320×640, 360×740, 393×852, 430×932 ; trois vues réseau hub, dossier et dressing, **en mode sombre**. Vérifier absence de débordement horizontal, textes coupés, chevauchement barre OS, navigation Android, état actif et CTA non masqué.
2. **Réseaux** : hub de faux smartphone compact, agréable et arcade ; aucune phrase « prends ton temps », ni « Enquête sur Noémie » redondante, aucune icône son en top bar ; trois apps visibles, pages internes fonctionnelles, contenu conditionné aide FR, Pix privée inchangée.
3. **Dossier** : aucune bascule Aide FR à l'intérieur ; aucun message méta sur les mensonges ; **tous les faits canoniques d'Alex** et formulations LU de référence encore consultables ; fermeture Android Back, pas de décharge de batterie.
4. **Dressing** : cinq styles et six couleurs réellement sélectionnables, avatar avant/3/4, **prévisualisation fiable après plusieurs modifications**, CTA toujours fonctionnel **même sans choix** (tenue par défaut), retour réseaux sans perte des sélections, aucun risque de rechargement WebGL après 3 parties.
5. **Audio** : bouton haut-parleur absent de l'entête, mais contrôle mute effectif et découvrable ailleurs, \`luxMatchSon\` conservé ; musique §16 non relancée par rendu du hub / dossier / LOOK.
6. **Tests** : \`node --test test/lux-match.test.cjs\`, suites critiques \`bash tools/critique.sh rapide\` puis \`bash tools/critique.sh\` ; tester avec la version réelle des sources et conserver preuves/captures. Vérifier réellement sur Samsung avant d'affirmer « Android validé ».
7. **État d'avancement documentaire** : ne pas marquer cette §17 « implémentée » tant qu'aucun code, test et recette visuelle ne l'attestent. Limiter la modification aux écrans visés et au contrôleur audio prévu ; ne pas toucher aux autres jeux, à Lux Runner ni à \`luxProgress\`.
