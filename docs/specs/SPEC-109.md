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
