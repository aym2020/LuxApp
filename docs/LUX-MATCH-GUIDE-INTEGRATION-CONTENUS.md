# Lux Match — Guide d'intégration des contenus pour Claude

**Branche :** `2.1` · **Statut : passation exécutée — bible intégrée le 27/10/2026 (lots 1–5)** · **Date :** 27 octobre 2026 · **Responsable des textes :** bible éditoriale ci-dessous.

> **État réel (27/10/2026) :** les contenus de la bible sont structurés dans `data/jeux/lux-match/contenus-v02.json` (généré par `tools/lux-match/contenus_v02.py`, statut de relecture par ligne : `lecon`, `lecon_modele`, `audit_regles`, `a_verifier_lod`) et lus par `public/lux-match-core.js` ; les JSON v01 ne sont plus servis. Ce qui est fait, non intégré et encore ouvert : [SPEC 109 › Suivi par lot](specs/SPEC-109.md#intégration-de-la-bible-éditoriale--suivi-par-lot). Le reste de ce guide décrit la passation d'origine.

> **Lis d'abord ce fichier, puis les sections de la bible qui concernent le lot.** Ne lis pas 1 000 lignes d'un seul bloc pour ensuite improviser. Tous les textes candidats sont déjà rédigés ; ton travail consiste à **auditer, structurer, raccorder et tester**, pas à inventer le scénario. Tant que la validation luxembourgeoise n'est pas obtenue, ces nouvelles répliques sont **des propositions, pas du contenu publiable**. Le moteur 3D en cours de correction par Claude est hors périmètre de cette passation.

## 1. Les quatre niveaux de vérité (à ne pas confondre)

| Priorité / rôle | Fichier | Ce qu'il apporte |
| --- | --- | --- |
| **Conventions obligatoires** | [PLAYBOOK](../PLAYBOOK.md) + [AGENTS](../AGENTS.md) | Règles projet, branche, recettes, tests, non-régression |
| **Comportement voulu (produit)** | [SPEC 109](specs/SPEC-109.md), surtout [§ 12](specs/SPEC-109.md#12-arbitrages-valides--gameplay-personnages-et-finition-ux-27102026) et [§ 13](specs/SPEC-109.md#13-moteur-semi-procedural-de-situations--lux-match-cadrage-27102026) | Gameplay décidé, principes du générateur, limites, critères de validation |
| **Corpus éditorial à intégrer** | [Bible Lux Match A1.1](LUX-MATCH-BIBLE-EDITORIALE-A11.md) | Textes UI/FR et propositions LU, 6 personnalités, 3 réseaux, choix, événements, conclusions, IDs et scénarios |
| **État réel du jeu** | `public/lux-match-core.js`, `public/lux-match.js`, `public/lux-match-3d.js`, `data/jeux/lux-match/{archetypes-v01,dialogues-a11-v01}.json` | Schémas effectivement lus aujourd'hui, règles de scoring et rendu. **Vérifier HEAD 2.1 juste avant d'éditer.** |

**En cas d'écart :** le code actuel décrit ce qui fonctionne ; la SPEC 109 définit ce qui doit fonctionner à terme ; la Bible définit **quels textes** employer. Ne pas écraser les textes existants validés par de nouvelles propositions non auditées. Ne pas renommer en masse des IDs runtime pour coller à l'édition.

## 2. Où chercher précisément dans la Bible

**Point d'entrée : [LUX-MATCH-BIBLE-EDITORIALE-A11.md](LUX-MATCH-BIBLE-EDITORIALE-A11.md)** — environ 1 000 lignes. Ne consulter que la section correspondant au lot :

| Ce que Claude implémente | Lire dans la Bible | Inventaire / ID |
| --- | --- | --- |
| Texte de boutons, instructions, messages, résultats | [§ 3](LUX-MATCH-BIBLE-EDITORIALE-A11.md#3-tous-les-textes-courts-dinterface-fr_jeu) | `UI_*` |
| Fiche d'Alex en ouverture | [§ 4](LUX-MATCH-BIBLE-EDITORIALE-A11.md#4-profil-joueur--affichage-initial-et-reference-canonique) | Persona `alex_v01` |
| Tinder, photos, Pro, Amis, personnalités | [§ 5](LUX-MATCH-BIBLE-EDITORIALE-A11.md#5-profils-posts-et-photos--corpus-principal-six-personnages) | `P_LENA` à `P_EMMA`, `PIX_*`, `AMIS_*`, `VAR_*` |
| Questions, trois réponses, phrases A1.1, rappels | [§ 6](LUX-MATCH-BIBLE-EDITORIALE-A11.md#6-banque-de-scenes-de-conversation--26-beats-a-selectionner-jamais-tous-dans-une-date) | `B01`–`B26`, 78 réponses |
| Événements, pièges et conséquences conditionnelles | [§ 7](LUX-MATCH-BIBLE-EDITORIALE-A11.md#7-evenements-dialogues-et-gags--14-fiches-conditionnelles) | `EV_*` (14 événements, 43 choix) |
| Fins sociales personnalisées | [§ 8](LUX-MATCH-BIBLE-EDITORIALE-A11.md#8-conclusions-personnalisees--24-textes-fr_jeu) | `FIN_*`, 24 variantes |
| Réactions selon personnalités et émotions | [§ 9](LUX-MATCH-BIBLE-EDITORIALE-A11.md#9-reactions-de-personnalite-30-repliques-fr_jeu) | `REACT_*`, 30 FR + LU § 11 candidat |
| Plans à utiliser comme jeux de tests | [§ 10](LUX-MATCH-BIBLE-EDITORIALE-A11.md#10-douze-parcours-pilotes-pour-le-compositeur-procedural) | `PLAN_*`, 12 exemples |
| **Compléments indispensables** (dessin/gaming, âge, prénom de l'ex, 30 LU candidates) | [§ 11](LUX-MATCH-BIBLE-EDITORIALE-A11.md#11-complements-de-contenu--amorces-des-deux-gags-manquants-et-preferences) | `B_DRAW`, `B_GAMING`, `PREF_*`, `REACT_*` LU |
| Politique qualité et blocages à lever | [§ 12](LUX-MATCH-BIBLE-EDITORIALE-A11.md#12-contrat-dintegration-et-recette-exclusivement-editoriale-pour-claude) | Liste de contrôle, non-régression et points à auditer |

**À retenir :** les 26 beats sont des **options de catalogue**, pas « 26 répliques consécutives ». Un date = environ 6–8 beats principaux, 0–2 événements. Les 12 plans sont **des exemples de test**, pas des graphes à imposer sans conditions.

## 3. Procédure par lots : quoi faire, concrètement

**Lot 0 — Toujours d'abord** : vérifier les derniers commits `2.1`, `PLAYBOOK.md`, code et données actuels. Conserver l'état et les corrections de seconde run 3D en cours. N'éditer aucun JS/CSS/GLB tant que la stabilisation n'est pas achevée.

**Lot 1 — Audit et import des profils/réseaux** :
1. Lire Bible **§§ 4–5, 11, 12**. Faire un inventaire des phrases LU proposées, comparer aux leçons en vigueur et à `grammaire_luxembourg.md`, puis vérifier LOD.lu et obtenir validation linguistique des nouvelles formes. **Aucune validation automatique par confiance dans cette bible**.
2. Mapper les textes validés vers les champs JSON existants, **sans remplacer le schema entier** : `profiles[].pix.bioLu / bioFr / photos[]`, `profiles[].pro`, `profiles[].amis.bioLu / bioFr / posts[]`, infos `outfitSignal`. Si le format doit évoluer (`captionLu` avec `captionFr`, posts conditionnels), le faire avec adaptateur et tests.
3. Conserver une table claire `editorialId → targetFile.targetField` et `reviewStatus`. Toute préférence à conséquence forte a au moins un indice **public** du `scenarioPlan`. Pix privée → aucune photo publique. Texte FR d'aide masqué quand Aide FR = off ; traductions visibles quand on l'active.

**Lot 2 — Dialogues A1.1 et actions** :
1. Lire Bible **§ 6 + § 11**, SPEC 109 **§ 12.3–12.4**. Migrer d'abord les nœuds qui correspondent aux anciens `sharedDialogueNodes` ; garder leur IDs runtime ou définir un mapping explicite. Les `B*` sont des IDs **éditoriaux**, pas des clés qui existent déjà dans le moteur.
2. Corriger le nœud `age` : 3 réponses grammaticalement bonnes **même aux premières parties** (28 vrai, 30 mensonge plausible, 120 blague), effets sociaux conditionnels au profil et au sens de l'humour ; `languageCorrect` distinct de `truthKind`.
3. Les nœuds `B21_ASK_HER`, `B20_PARTNER_CITY`, `B22_ASK_HER_LANG` requièrent le support d'un **locuteur/acteur différent** : Alex choisit quelle question poser, la fille émet **sa** réplique canonique. Ne pas afficher les répliques du PNJ comme des boutons de réponse d'Alex.
4. Les gags `B_DRAW` / `B_GAMING` ne sont **pas** des variantes de `B10_FOOT`. Si `persona.drawing` ou `persona.gaming` ne sont pas définis, impossible de qualifier automatiquement le « oui » de mensonge. Compléter explicitement ces faits ou laisser la vérité indéterminée.
5. Distinguer erreur linguistique réelle, choix social maladroit, mensonge factuel et blague assumée. Vérifier les prépositions des pays, professions, nombres, accords ; pas de pénalité de langue pour un âge de 120 ans grammaticalement correct.

**Lot 3 — Gags, réactions et conclusions** :
1. Lire Bible **§§ 7–9 et 11**. Mapper `EV_*` vers `conditionalTrapEvents` ou nouveau pool conditionnel ; **ne pas les injecter tous dans chaque flow**. Uniquement si prérequis accomplis ET indices visibles ; au maximum deux événements, dont un gros gag.
2. Mapper `REACT_*` sur des textes de feedback, **sans exiger de nouveaux modèles 3D** et sans confondre la réaction FR et la réplique jouée en LU. Les versions LU § 11 sont candidates `À_AUDITER`.
3. Mapper `FIN_*` vers les issues du moteur et **des gardes d'événements réels**. Exemple : `FIN_SOFIA_FUN` n'est accessible que si le gag portugais a réellement eu lieu ; `FIN_EMMA_FUN` seulement si téléphone épuisé. Sinon autre variante ou fin générique, **jamais une fin mensongère**.

**Lot 4 — Moteur procédural (APRÈS lot 0–3 stabilisés)** :
1. Lire SPEC 109 **§ 13** + Bible **§§ 5, 6, 7, 10**. Composer **une seule fois** un `scenarioPlan` au match, avec `seed` reproductible, traits secondaires, `clueIds`, `beatIds`, `eventPool`, `endingTemplateIds`.
2. Pix/Pro/Amis/LOOK/date lisent **le même plan immuable** ; `claims`, jauges et batterie restent dans le moteur pur existant. Éviter de créer un monstre à graphes, pas de LLM.
3. Tester 1 000 seeds et 3 dates successives sur Samsung avant d'activer le générateur. Fallback sur un flow statique validé si plan impossible. La variété n'est utile que si elle est perçue.

**Ordre de livraison :** jeux 3D stabilisés → textes validés/imports sociaux → dialogues → événements/fins → procédural. Petits commits isolés, tests à chaque lot.

## 4. Mapping éditorial → runtime (exemples non destructifs)

| ID auteur Bible | Fichier ou mécanisme existant | Règle d'intégration |
| --- | --- | --- |
| `TINDER.SOFIA.BIO`, `P_SOFIA` | `data/jeux/lux-match/archetypes-v01.json` → profil `sofia_r01` | Bio en LU + traduction FR conditionnelle ; préserver faits |
| `PIX_SOFIA_P01` | `profiles[].pix.photos[]` | Légende `lu/fr`, `photoAssetId` cohérent ; scène Lisbonne représentée, pas phrase méta |
| `AMIS_SOFIA_A02` | `profiles[].amis.posts[]` | Offre l'indice d'origine Portugal ; disponible uniquement si variante le prévoit |
| `B05_ORIGIN` | `data/jeux/lux-match/dialogues-a11-v01.json` → nœud `origine` | Options françaises/LU auditées, vraie France vs bluff Portugal ; `claims.origin` |
| `EV_SOFIA_PORTUGAL` | `conditionalTrapEvents` (`trap_portugal`) | `requiresLie=true` ET Portugal/portugais affirmé ; sortie `aveu` toujours possible |
| `FIN_SOFIA_FUN` | `public/lux-match.js` `LM_ISSUES` et/ou moteur de choix de fin | Contenu français conditionnel, **uniquement après le gag portugais** ; fallback sinon |
| `PREF_EX_ALEX` | variation d'indices Amis + trait optionnel de scénario | Générer le post AVANT date si trait activé ; réponse Alex vraie ne provoque pas game over |
| `B04_AGE` | nœud `age` + `preparerEchange` | Exception à la règle actuelle des 2 choix pour les 2 premières parties ; toutes les options LU correctes |
| `UI_ME_*` | `public/lux-match.js` / vue de profil initial | Texte d'interface FR non noté ; Alex vrai, pas historique des mensonges |

**Point de vigilance :** certaines variantes du catalogue comprennent des textes candidats qui demandent davantage que la leçon A1.1 indiquée. Les IDs ne constituent **pas** un certificat d'appartenance au cours. Filtrer par notions effectivement enseignées, marquer les gags non notés ou les exclure tant qu'ils ne sont pas validés.

## 5. Exemple complet de fil conducteur (pour vérifier un import)

**Cas Sofia / mensonge portugais :**
1. `P_SOFIA` conserve son origine canonique Portugal, Metz, guide touristique, voyages.
2. Le `scenarioPlan` sélectionne un post Amis avec son origine, une photo de Lisbonne et un style explicitement aimé. Le téléphone affiche bien **LU** ; FR seulement avec aide.
3. Alex connaît sa **vraie fiche** : il vient de France. La scène `B05_ORIGIN` propose « Ech kommen aus Frankräich » (vrai) ou « Ech kommen aus Portugal » (bluff).
4. S'il dit Portugal, `claims.origin=Portugal` et `mensonges.origin=true` ; alors `EV_SOFIA_PORTUGAL` devient éligible. Sinon **pas de piège**.
5. Une question drôle porte sur le choix de « vaca » / « hipopótamo » / « gata » ou sur l'aveu. Le portugais n'est pas noté comme luxembourgeois. Éviter d'utiliser une réponse d'animal comme preuve de maîtrise de la langue.
6. Une réponse d'aveu restaure de la confiance (calibrer dans le core) ; la conclusion adaptée `FIN_SOFIA_FUN` n'est sélectionnée **que si la scène comique a réellement eu lieu**.
7. Tester les deux branches **avec** et **sans** mensonge, avec une graine fixe. Une seule fin du parcours est émise, aucune mémoire ne fuite vers une autre run.

## 6. Points bloquants déjà identifiés : ne pas intégrer aveuglément

- **Orthographe et naturel luxembourgeois** : les nouvelles phrases sont `À_AUDITER` ; LOD.lu + `grammaire_luxembourg.md` + leçon de référence + relecture. Certains champs d'emplois et d'adjectifs sont de simples *candidats*.
- **Nombres et heures** : `honnertzwanzeg` pour 120, 7 h vs 19 h, `hallwer aacht` ; valider formes et lever l'ambiguïté de contexte.
- **Dessin/gaming** : `pilotPlayerPersona` actuel ne définit pas `drawing` ni `gaming` ; aucune affirmation « oui » ne peut être un mensonge détectable sans faits explicites.
- **Locuteur** : `B20`, `B22` et certains sous-échanges sont des répliques de la fille, **pas trois réponses possibles d'Alex**.
- **Fins `FUN`** : plusieurs textes parlent d'un gag spécifique. Ajouter `requiresEventId` (ou garde équivalente) dans le plan de la partie ; ne pas choisir par simple niveau d'affinité.
- **Posts éligibles** : un trait d'âge ou de prénom doit avoir son indice public, **et seulement** dans les runs où il est choisi.
- **Langue vs social** : « 120 ans » et « je suis James Bond » peuvent être linguistiquement corrects tout en étant des blagues sociales. Aucun point de langue retiré pour le seul sens absurde.
- **Animation/son** : aucune nouvelle animation générique ni changement de assets nécessaire pour importer des lignes ; la 3D appartient au chantier de stabilisation séparé.

## 7. Définition de terminé pour un lot de contenu

Ne dire « textes intégrés » que si :
- [ ] Chaque ligne importée a un `contentId`, un locuteur, `lu`, `fr`, `lessonIds`, un `reviewStatus` justifié et une référence à la bible/source.
- [ ] Les nouvelles lignes LU **affichées** sont vérifiées et validées ; les brouillons ne franchissent pas le filtre publication. Pas de statut « validé » attribué par simple conformité JSON.
- [ ] Le réglage Aide FR fonctionne **sur Tinder, Pix, Pro, Amis et le date**.
- [ ] Les 6 profils sont canoniques, les photos illustrent les légendes et les comptes privés restent privés.
- [ ] Conditions de pièges, 3 réponses d'âge, rappel des mensonges et fins personnalisées sont testés ; une scène non vécue ne peut pas être racontée en conclusion.
- [ ] Tests Lux Match existants + `bash tools/critique.sh rapide` puis suite critique complète, comparaison des éventuelles défaillances préexistantes.
- [ ] Tests navigateur 320×640 / 360×740 / 430×932 et **3 runs successives Android**. Ne pas certifier Samsung sans test effectif.
- [ ] Aucun changement de `luxProgress`, pas d'effet sur Lux Runner, pas de modification des corrections 3D parallèles.

## 8. À ne PAS faire

Ne pas demander une nouvelle « bible » à un générateur de texte ; elle existe. Ne pas recopier les 74 Ko de Markdown dans des fichiers JS ; **extraire les éléments du lot puis produire des JSON structurés après audit**. Ne pas réécrire tous les noeuds d'un coup. Ne pas brancher le catalogue complet avant de garantir la correction linguistique. Ne pas faire apparaître les textes français pédagogiques quand l'aide est désactivée. Ne pas ajouter de nouvelles villes, un second café ou CUPID.EXE.

**En bref :** lisez ce guide → sélectionnez un lot → consultez ses sections de la bible → auditez ses lignes → mappez à la donnée actuelle → testez → poussez. **La SPEC définit les règles, la bible fournit les mots, ce guide explique comment les brancher.**

---

## 9. Complément gameplay — signaler le tempérament avant de juger l'humour

> **Implémenté le 27/10/2026 (lot 7)** — voir SPEC 109 › Suivi par lot.

**Source :** [SPEC 109 § 14](specs/SPEC-109.md#14-lisibilite-du-temperament-et-compatibilite-humoristique-retour-joueur-27102026) et [Bible § 13](LUX-MATCH-BIBLE-EDITORIALE-A11.md#13-signaux-de-temperament-et-style-dhumour--complements-de-dialogues). **Évolution documentaire, pas code livré.**

### Diagnostic sur la démo actuelle

Dans `data/jeux/lux-match/contenus-v02.json`, Léna a `humours: ["direct","taquine"]`, et non `absurde`. Dans `public/lux-match-core.js`, `aimeLAbsurde()` récompense seulement `humour === "absurde"`. Ainsi les plaisanteries de type James Bond ou champion du foot subissent systématiquement le même malus sur ce profil, bien que les informations Tinder/Amis n'explicitent pas qu'elle déteste la vantardise. L'archétype sportive n'est pas une indication suffisante.

### Tâches ciblées pour Claude (après les corrections en cours)

1. **Éditorialiser les signaux** : importer les `TONE_*` de Bible § 13 après correction linguistique et correspondance LU/FR. Dans Tinder un indice général, dans Amis un trait explicite. Conserver l'aspect naturel d'un réseau de rencontres, aucun indicateur « risque de malus ».
2. **Différencier le type de blague** : si cela ne complexifie pas le moteur, ajouter aux options humoristiques `jokeKind` (`absurde`, `vantardise`, `autoderision`, `taquinerie`) et une matrice simple de réactions par partenaire ou trait tiré. Le simple booléen `aimeLAbsurde` est trop grossier : Léna taquine peut apprécier l'autodérision tout en rejetant la vantardise.
3. **S'assurer de la cohérence procédurale** : une partenaire dont le scénario accepte l'humour extravagant ne doit pas publier l'indice « je déteste les grandes histoires » ; **même scenarioPlan pour indices et calcul**.
4. **Ne pas sursanctionner** : une blague correctement exprimée en LU conserve la réussite linguistique ; une maladresse sociale fait varier l'affinité, sans suspicion automatique. `Kaffi!` est une réponse pragmatiquement décalée, pas un mot luxembourgeois erroné ; justifier pédagogiquement l'évaluation au lieu de la traiter comme une faute grammaticale.
5. **Réactions** : associer `REACT_LENA_BOND_SERIOUS`, `REACT_LENA_FOOT_STAR`, `REACT_LENA_FOOT_SELF`, `REACT_LENA_COFFEE_SHOUT` (Bible § 13), sans générer de nouvelles phrases LU à l'exécution.

**Test d'acceptation ciblé :** un joueur a un indice accessible avant d'utiliser « James Bond » / « star du foot » ; il peut comprendre l'échec social **après** la réaction, sans connaître les variables du moteur. La même option reçoit des réactions différentes chez Léna et Noémie. Une plaisanterie d'autodérision peut plaire à Léna. Aucun statut de validation LU accordé avant audit. Ne pas modifier Lux Runner, le moteur Three.js ni la progression utilisateur pour cette évolution.

---

## 10. Réactions visuelles type manga — émotions lisibles sans visage 3D expressif

> **Implémenté le 27/10/2026 (lot 8)** — voir SPEC 109 › Suivi par lot.

**Nouvel arbitrage UX :** [SPEC 109 §15](specs/SPEC-109.md#15-reactions-emotionnelles-manga-en-surimpression-2d-27102026). Ce guide ajoute les instructions d'implémentation **sans changer les contenus JSON ni le moteur de jeu**.

**Brief de réalisation :** six petits sprites originaux / SVG locaux (goutte de gêne, veine de colère, interrogation de doute, étincelles d'amusement, cœur rare d'attirance, choc « !! ») affichés **près de la tête** en calque HTML/CSS au-dessus du café 3D. Maintenir les personnages et `r.visuel` existants, synchroniser l'effet 2D avec le résultat social et la réaction 3D ; limiter à un signe à la fois et ne pas masquer HUD, sous-titres, options ni téléphone.

**Scénarios obligatoires** : « Kaffi! » → goutte, Léna poker face et possible réplique naturelle (pas de message professeur « tu es trop sec ») ; James Bond → interrogation ; vantardise football → doute/agacement ; autodérision → rire/éclats ; Emma + téléphone → agacement seulement si trait prévu ; Sofia + hippopotame → gros « !! » avec effet rare. Chaque vignette doit être **la conséquence d'un choix**, pas un signe aléatoire ajouté selon le score.

**Séparation critique :** une maladresse sociale n'est pas forcément une faute linguistique. Le cas `REP11_C` (`Kaffi!`) est actuellement `languageCorrect:false`, `truth:error` et accompagné d'une correction de style « Pas faux, mais un peu sec » : **réexaminer le statut** et déplacer l'explication de politesse vers une réaction naturelle de la partenaire. Conserver une vraie correction pédagogique seulement si un objectif linguistique le justifie.

**Priorité et recette :** après stabilisation 3D et audit des textes ; pas de nouvelle animation WebGL, pas de nouvelle dépendance, pas de second RAF ; 320–430 px, orientation/pause, fallback portrait, TalkBack, `prefers-reduced-motion`, 3 runs successives. Tous les nouveaux mots en LU doivent être audités, comme dans la bible.

**Aucun code de production n'a été modifié par cette documentation.**

---

## 11. Ambiance musicale arcade — deux pistes et comportement de lecture

> **Implémenté le 27/10/2026 (lot 9)** : deux boucles composées par Claude (`tools/lux-match/musique.py`), à valider à l'oreille — voir SPEC 109 › Suivi par lot.

**Source de référence :** [SPEC 109 §16](specs/SPEC-109.md#16-direction-musicale-et-orchestration-audio--deux-boucles-arcade-retro-27102026). Ceci est une **passation à Claude**, pas une bande-son livrée ni une modification de code.

**Deux pistes originales à produire** : `LM_BGM_PRE_DATE` (nom de travail **Love Circuit**, 108–116 BPM, electro-funk FM/chiptune rétro, boucle 32–45 s) pour fiche Alex, swipes, match, enquête et look ; `LM_BGM_DATE` (nom de travail **Neon Café**, 78–88 BPM, lounge rétro piano FM/basse ronde/percus discrètes, boucle 44–60 s) pour la conversation au café et le téléphone pendant date. **Motif court commun**, musique instrumentale sans voix, pas d'OST existante copiée. Composer/exporter et vérifier les licences avant intégration. **Aucun fichier audio de musique n'est actuellement fourni par les docs.**

**Implémentation attendue (lot indépendant et limité) :**
1. Auditer le `LuxMatchSon` déjà intégré à `public/lux-match.js` (SFX Web Audio, paramètre `luxMatchSon`, bouton son visible sur l'entête avant date, pas sur l'HUD du date). Réutiliser son contrôleur ou un module léger ; **une seule musique active, aucun AudioContext superflu**.
2. Changer de thème **seulement selon la phase** : `profil/swipe/match/reseaux/look → pre-date`; `date → café`; `resultats/quitter → musique arrêtée`; `nouvellePartie → pre-date`. Pas de redémarrage lors du re-render, d'une traduction FR, de l'ouverture Pix/Amis/Pro, du téléphone ou du panneau Moi.
3. Fondus de 0,6–1,2 s à l'entrée du date, les SFX `match`/`faux`/`scratch` restent audibles. Sur gag majeur, bref retrait de la musique (silence comique), puis reprise. Le lecteur ne doit pas imposer son tempo aux réponses.
4. Volume de musique **bas** sous les voix LU ; ducking d'environ 8–12 dB lors de lecture/TTS si elle est disponible. Respecter la préférence `luxMatchSon` et permettre de couper la musique **pendant le date** sans cacher les questions/options ; une option musicale distincte est pertinente si elle évite de désactiver les effets et la prononciation.
5. Android/PWA : démarrer après geste utilisateur autorisant l'audio, couper/pause quand l'app est masquée/quittée, reprendre proprement, annuler les fondues en cours, ne jamais superposer des pistes sur trois runs. En cas de fichier absent ou refus d'autoplay, **fallback silencieux**, jeu toujours utilisable.

**Critères de recette :** deux pistes bouclent 5 fois sans clic/silence ; 3 runs successives sans superposition ; son désactivé = silence total ; au date le bouton audio reste accessible (≥44 px) ; les voix sont intelligibles, le téléphone/batterie ne redémarre pas la piste, bascule de vue ne relance pas la musique ; tests Android réel et tests existants Lux Match. **Ne pas annoncer deux musiques ajoutées tant que les fichiers n'existent pas et ne sont pas audibles en jeu.**

---

## 12. Refonte UX pré-date — hub des réseaux, dossier Alex, dressing

> **Implémenté le 27/10/2026 (lot 6)** — voir SPEC 109 › Suivi par lot.

**Instruction de passation :** [SPEC 109 § 17](specs/SPEC-109.md#17-refonte-des-ecrans-pre-date--telephone-dossier-alex-et-dressing-arcade-27102026) est le **cahier des charges précis** pour la dernière série de captures Android du 27/10/2026. Statut **à implémenter**, pas déjà livré par la documentation.

- **Réseaux** : éliminer les doublons de titres et toute phrase « Prends ton temps, la batterie ne se vide pas ici », désencombrer l'entête, convertir le hub en **faux OS rétro Pix/Pro/Amis** compact et lisible, conserver les 3 apps et leurs vrais contenus et états (dont Pix privé). Ne pas inventer de compteurs d'indices.
- **Dossier Alex** : déplacer vers un format compact **dossier de personnage** et pas un tuto : portrait, faits canoniques, phrases LU utiles ; supprimer le bouton **Aide FR à l'intérieur de la fiche**, les messages sur les mensonges et les explications méta ; préserver l'accessibilité pendant le date **sans batterie**.
- **Dressing** : présenter l'avatar 3D bien cadré de face/3/4, cinq styles sur grille mobile adaptative, six couleurs en pastilles lisibles, retours visuels discrets, **un CTA « Aller au rendez-vous » même avec la tenue par défaut**, le secondaire « Garder cette tenue » devient inutile ; retour réseaux préservant les choix.
- **Entête** : retirer l'icône **haut-parleur permanente**, mais ne pas casser la musique nouvelle de SPEC §16 ni le mute : déplacer ce dernier dans un contrôle audio/pause discret, accessible aussi pendant le date, en respectant la préférence actuelle `luxMatchSon`. Aide FR sur contenus pédagogiques, pas sur la fiche perso.
- **Recette** : 320/360/393/430 px ; captures comparatives de chaque écran, pas de blocage scroll ni scroll horizontal, CTA toujours accessible, 3 runs successives, suite `test/lux-match.test.cjs` et `tools/critique.sh`. Ne pas certifier la compatibilité Samsung sans test matériel.

**Éviter toute refonte des autres jeux, nouvelles villes ou nouveaux personnages.** Les modifications code ne sont pas incluses dans cette passation documentaire.


---

## 13. Recette Android des deux salves : corrections P0/P1 et scroll

**État au 27/10/2026 :** lots **10A** (journal claim/contradiction/aveu, bilan « Tes réponses » / « Phrases modèles ») et **10B** (suspicion perceptible, diversité d'état civil, rappel espacé, confrontation « X oder Y? », au revoir selon l'ambiance) et **10C** (dressing sans scroll, résultats repliables, deltas dans le HUD, sous-titres au lieu de « Continuer », aide FR cohérente) **implémentés**, détail dans le tableau « Suivi par lot » de SPEC 109. Nouvelle phrase LU : uniquement le modèle « {a} oder {b}? » (`audit_regles`, « oder » attesté dans l'examen A1.1 n° 1) rempli par des valeurs déjà dites ; « maintenir » répète la phrase du joueur. **Recette Samsung à faire.**

**Commencer par [SPEC 109 § 18](specs/SPEC-109.md#18-recette-android--deux-salves-emma-fidelite-narrative-et-ecrans-sans-scroll-inutile-27102026).** La section 18 est la **liste complète de recette Android** après les lots 6–9 et constitue la **passation pour les lots 10A, 10B, 10C**. Ne pas prendre les demandes ci-dessous pour du code déjà livré.

**Ce que le joueur a montré :** deux salves partielles d'un date avec Emma, fin « Ça ne colle pas » à **44 affinité / 41 suspicion / 100 % langue**, score 850, `G0` graine `693698638` ; l'âge 30, origine Portugal, nationalité luxembourgeoise, retour à France au rappel, puis « Jo. » lors de la demande de clarification. **Les screenshots sont incomplets : toute reconstruction est partielle.**

**Lot 10A — corriger avant le polish :**
- `affirmer` efface le mensonge actif lorsqu'une réponse tardive donne la vérité ; `resumer` dit alors « Bluff réparé » même si le joueur **n'a pas avoué**. Séparer contradiction / correction factuelle / aveu et reconstruire les bilans depuis les **faits réellement joués**.
- `expressionsTravaillees` utilise la réponse marquée `honest`, pas la réponse réellement choisie. Distinguer **« Tes réponses »** et **« Phrase modèle à retenir »**, sans pénaliser une phrase LU grammaticalement correcte sous prétexte qu'elle ment.
- Tests ciblés Emma avec et sans aveu explicite, multiples bluffs, aucun mensonge.

**Lot 10B — rendre les personnes crédibles :**
- Les mensonges augmentent mécaniquement la suspicion avant vérification ; calibrer la suspicion selon les signaux **perceptibles par le personnage**, pas la connaissance secrète du moteur. Conserver un risque, mais éviter la divination.
- Garde de **diversité des thèmes** au générateur : âge/origine/nationalité/rappel dans un intervalle court = interrogatoire administratif. Privilégier tempérament et centres d'intérêt ; origine Portugal et nationalité luxembourgeoise ne sont pas intrinsèquement incompatibles.
- Reactions de contradictions contextualisées, transitions et clôtures crédibles ; rédiger/réviser les nouvelles phrases LU selon `grammaire_luxembourg.md` et LOD.lu.

**Lot 10C — ergonomie :**
- **Dressing 100 % visible et zéro scroll normal** : aperçu Alex, 5 styles, 6 couleurs, bouton principal et « Revoir ses réseaux » ensemble. Remplacer la hauteur minimale forcée `clamp(240px,42dvh,380px)` par une hauteur **réellement adaptative à l'espace**, sans cacher des boutons avec `overflow:hidden`. Garder zones tactiles ≥44px, défilement autorisé uniquement en cas de font-scale/viewport extrêmes ; rendre le style casual par défaut visuellement cohérent.
- **Dossier Alex** : scroll autorisé ; **Pix/Pro/Amis** : feed défilant volontaire, pas scroll parasite du hub ; **date** : sans scroll standard ; **résultat** : détail scrollable, mais CTA « Nouveau match » proche du score et détails repliables.
- Éviter les trois feedbacks superposés **sur le visage** : symbole manga près de la tempe, scores près des jauges, paroles dans les bulles. Ne pas forcer « Continuer » pour chaque sourire ; garder l'avancement contrôlé quand du LU doit être lu.
- « Aide FR désactivée » doit correspondre à l'affichage réel ; ne pas forcer les traductions en cachette. Mieux exposer l'aide contextuelle pour les segments avancés.
- Garder `scenario G0 / graine` en diagnostic reproductible, **pas dans le récit public**.

**Recette** : comparer captures réelles 320×640 / 360×740 / 393×852 / 430×932 ; trois runs, petite et grande police, Android Back et son ; tests Lux Match et suite critique. Aucun patch 3D, audio ou code des autres jeux requis par ce lot. **Pousser des commits séparés avec bilan des tests.**


---

## 14. Bug tactile intermittent : glisse droite déclenchant « NON »

**Corrigé le 27/10/2026** (`tests/test_lux_match_swipe.py`, 12 cas, dans la suite critique) ; **recette Samsung à faire**. **Nouveau signalement Android du 27/10/2026 — P0 d'interaction**. Diagnostic complet et tests dans [SPEC 109 § 19](specs/SPEC-109.md#19-bug-tactile-android--swipe-droite-interprete-comme--non--27102026).

**Symptôme** : en glissant vers la droite sur Tinder, le joueur observe parfois très brièvement « NON » et la carte est refusée ; phénomène difficile à reproduire.

**Défaut de code identifié** : `lmBrancherSwipe()` dans `public/lux-match.js` utilise **le même gestionnaire de fin** pour `pointerup` et `pointercancel`. Sur Android, avec `touch-action:pan-y`, le navigateur peut annuler un geste ; **un cancel ne doit jamais valider un refus**. Le gestionnaire calcule pourtant `dx=e.clientX-depart` puis peut appeler `lmSwiper(false)`. Cause plausible du symptôme mais **reproduction Samsung pas encore confirmée**.

**Tâche prioritaire à ajouter avant/avec le lot 10A :** isoler un correctif tactile **sans refondre le swipe** : annuler proprement sur `pointercancel`/`lostpointercapture`, n'accepter `pointerup` que du pointeur actif, nettoyer transform/classes/capture et verrouiller une décision unique par carte. Respecter les scrolls verticaux normaux ; garder le swipe à droite = aimer et gauche = passer, boutons accessibles et animation existante.

**Tests indispensables** : pointerdown/move vers droite puis **pointercancel clientX=0** (aucun NON), geste gauche réel (NON), droit réel (OUI), geste vertical, multi-touch, seuil, double clic, glisses rapides, plusieurs profils, trois runs Samsung. Ajouter tests DOM/browser, car `test/lux-match.test.cjs` teste le moteur pur `Core.swiper()` mais pas les événements tactiles. Ne marquer corrigé qu'après tests, ne pas annoncer la reproduction comme certaine.

**Livraison :** commit isolé, tests et note de vérification de la SPEC 109 § 19 ; aucune modification du 3D, musique, progression ou autres jeux.


---

## 15. Lot 11 — blagues vraiment gratifiantes et enquête socialement utile

**À faire après les lots 10A/10B/10C** : [SPEC 109 § 20](specs/SPEC-109.md#20-complicite-recompensee-et-enquete-utile-pendant-le-date-retour-joueur-27102026) contient le **diagnostic et les règles d'acceptation**. À l'audit GitHub `2.1`, HEAD `1eeb55b5`, le joueur a obtenu deux sourires polis de Claire pour « James Bond » et « 120 ans » sans +affinité, et constate que lire Pix/Pro/Amis ne sert presque pas aux conversations.

**Lot 11A :** `EFFET_GOUT` = `aime:+4`, `neutre:0`, `n_aime_pas:-3`; Claire est `neutre` à `absurde`, les deux réponses `REP03_C`/`REP04_C` sont `jokeKind:absurde`. Corriger la lisibilité de la **réaction polie ≠ amusement réel**, ajouter **des options réellement plaisantes** pour Claire (autodérision, taquinerie), diversifier la seconde blague. Ne pas rendre Claire fan de l'absurde ni offrir un bonus à chaque sourire. Distinguer récompense sociale et correction LU.

**Lot 11B :** enrichir la **bible éditoriale** d'au moins **12 scènes A1.1 contextualisées** (2 pour chacun des 6 personnages) fondées sur de **vrais faits des réseaux existants**. Les proposer comme situations conversationnelles naturelles (travail de Claire / dessins de Noémie / voyage de Sofia / jeux de Maya / sport de Léna / livres d'Emma), **pas comme « quelle est ma couleur préférée ? » répété ou test de mémorisation des posts**. Chaque réponse personnalisée utile rapporte idéalement +3 à +5 selon équilibre, réponses honnêtes génériques restent jouables et petites blagues adaptées peuvent réussir. Tous textes LU soumis aux leçons, grammaire et LOD avant publication. Mapping `sourceClueIds` vers les mêmes `facts` du `scenarioPlan` ; 2 opportunités significatives par date de 6–8 tours si contenu validé.

**Lot 11C :** vérifier que le téléphone **a une valeur stratégique**, notamment en cours de date pendant les **20 s de batterie**. Les mêmes indices restent disponibles gratuitement AVANT le date, sans consultation forcée pendant le café. Emma anti-téléphone : enquête préalable avantageuse mais absence d'enquête ne rend pas le date impossible. Pas de score pour « avoir ouvert l'app », seulement pour le fait utilisé à bon escient. Tests seedés des six filles : joue sans enquête, avec enquête, avec consultation au café ; éviter double événement et fuite de batterie, conserver l'accessibilité mobile.

**Ne pas commencer en créant 12 scènes entièrement nouvelles sans revoir les sources** : inventorier la bible et `contenus-v02.json` pour réutiliser les répliques existantes, rédiger uniquement le manque, documenter `reviewStatus` et les tests avant toute publication. Aucun besoin de retoucher les modèles 3D, le rendu café, le lecteur musical, le hub global ni `luxProgress`.


---

## 16. Lot 12 — boucle V2, questions d'Alex, LuxTrad et micro-écriture

**Cahier des charges approuvé :** [SPEC 109 § 21](specs/SPEC-109.md#21-boucle-de-gameplay-v2--conversation-active-luxtrad-et-micro-ecriture-27102026). **Source éditoriale FR :** [Bible § 14](LUX-MATCH-BIBLE-EDITORIALE-A11.md#14-amorces-editoriales-v2--curiosite-questions-dalex-traduction-ecriture-27102026), avec **12 cellules narratrices** (2 par fille) et patrons de micro-écriture. **État : documentation poussée, aucun code ou texte LU final intégré.**

**Diagnostic spécifique** :
- Les derniers screenshots d'un date avec Sofia montrent plusieurs bluffs (policier / Portugal / portugais) et quiz des animaux ; c'est ludique, mais elle questionne encore surtout le joueur. Dans « Elo bass du drun! », le joueur peut immédiatement redemander « Wat schaffs du? » après qu'elle lui a demandé son métier. Ce n'est pas un défaut de grammaire mais de **composition conversationnelle et de réciprocité**.
- Les questions posées à elle plaisent au joueur : **en faire un vrai moment actif** avec 3 sujets pertinents, une réponse concrète de la fille et un éventuel callback.
- Pix, Pro, Amis doivent informer 2 opportunités sociales dans les dates sans transformer la conversation en quiz sur une fiche ni exiger une consultation.
- Besoin de **comprendre ponctuellement le LU** (outil façon traducteur) et d'**écrire une micro-phrase** sans imposer du free-text arbitrairement noté.

**Séquence demandée à Claude** :
1. **12A (prioritaire)** : enrichir `B21_ASK_HER` / la banque équivalente ; faire émerger une vraie information *sur la fille* et une réaction de suivi. Filtrer doublons exacts et thèmes déjà posés par elle. Ne pas augmenter systématiquement les 6–8 tours, conserver le procédural seedé.
2. **12B** : ajouter **LuxTrad LU ⇄ FR** comme utilitaire dans le dock du faux téléphone, distinct des 3 réseaux ; glossaire **prévalidé**, consultable hors ligne. Pendant le date, **taper sur un mot / question actuelle** pour une traduction rapide ; pas de clavier de recherche indispensable pendant la décharge à 5 %/s. Pré-date recherche facultative gratuite. Pas de Google API requise ni de promesse de traduction universelle. FR ON/OFF inchangé. Ne pas créer d'incohérence entre vocabulaire affiché et cours/Lexique LOD.
3. **12C** : **une seule micro-écriture facultative par date**, alternative à un QCM, sans clavier pop-up automatique. Variantes LU fermées écrites/auditées, évaluation `recognized` / `unrecognized` / `empty` ; **pas de faute grammaticale supposée quand hors catalogue**, aucun malus social pour non reconnue, QCM accessible sans perte d'état, mobile Samsung IME/scroll/focus/retour Android.
4. **12D** : calibration et QA déterministes : 6 personnages × 200 graines, au moins un acte où Alex pose une vraie question et 2 possibilités de connexion si banque suffisante, 6–8 tours, aucune référence à un fait non montré, profils privés respectés, scénario sans enquête jouable et scénario avec enquête plus riche, batterie restant utile mais non punitive.

**Les textes LU nouveaux ne sont PAS livrés par § 21 ou Bible § 14** : ces documents livrent les **intentions et le mapping** des données. En tant que responsable d'intégration, Claude doit **d'abord rechercher les phrases LU réutilisables** dans la Bible, les leçons et `contenus-v02.json`, puis ne rédiger/faire valider que le nécessaire dans une banque JSON conforme. Toute phrase nouvelle doit passer par `grammaire_luxembourg.md`, les leçons et LOD.lu ; conserver `reviewStatus`. Ne pas prétendre qu'un brouillon a été certifié.

**Aucune refonte** des modèles 3D, de la direction artistique, de la musique, du cloud, des scores de progression ou des autres jeux. **Livrer les lots par commits isolés sur `2.1`, avec tests et bilan honnête.**
