# SPEC 42 — Pré-requis A1.2 : « sinn / hunn », aide vocabulaire et retours pédagogiques fiables

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0 pédagogique** (prérequis), **P1 UX** (feedback et cadrage) |
| Branche cible | `v2` |
| Références | [SPEC 24](./SPEC-24.md) (coquilles), [SPEC 40](./SPEC-40.md) (rappels), [SPEC 41](./SPEC-41.md) (feedback et retour Chemin) |
| Périmètre prévisionnel | `data/lecons/A1.2/`, registre/chargement des leçons, progression locale/cloud, `public/correction.js`, `public/parcours.js`, `public/chemin.js`, navigation et tests ciblés |
| Origine | Recette Android du 18/10/2026 : A1.1 « Le vélo n'est pas neuf », A1.2 « Le passé composé » et sortie de « Refaire mes erreurs » |

## Objectif

L'utilisateur débutant ne doit **ni deviner une forme grammaticale jamais expliquée**, ni être pénalisé pour un complément de vocabulaire nouveau qui n'est pas l'objet de l'exercice. Conserver des exercices riches, mais enseigner les prérequis, donner une **aide facultative et discrète** sur le vocabulaire incident, et corriger **l'erreur effectivement commise**.

Ne pas confondre : (a) une **erreur réelle** de réponse, (b) une **lacune pédagogique** du parcours, (c) une **coquille mineure** et (d) une simple variante de formulation acceptable. La qualité des leçons prévaut sur l'exhaustivité.

## 1. Nouvelle leçon A1.2 n°20 — « sinn » et « hunn » au présent

### Constat

La leçon actuelle 24, « Le passé composé – hunn / sinn + participe passé », donne les conjugaisons des auxiliaires dans un tableau intitulé **« Les auxiliaires au présent (rappel) »**. Les exercices obligatoires demandent déjà de distinguer `ass`, `bass`, `sinn`, `hues`, `huet`, etc. sans une leçon autonome, progressive et suffisamment travaillée sur ces deux verbes.

### Exigences de contenu

Insérer **avant l'actuelle leçon 20** une nouvelle leçon A1.2, initialement identifiée comme **n°20** : « Être et avoir au présent — Sinn an hunn ». Les anciennes leçons 20 à 26 deviennent 21 à 27 (voir migration §6). Construire un JSON de leçon **conforme à la structure et aux conventions du dépôt** (instructions, unités/mission si exigées, flashcards, quiz, trous, écriture, cours).

Table de référence à enseigner et à retrouver dans le cours :

| Sujet | `sinn` (être) | `hunn` (avoir) |
|---|---|---|
| ech | sinn | hunn |
| du | bass | hues |
| hien / si / hatt (singulier) | ass | huet |
| mir | sinn | hunn |
| dir / Dir (pluriel / poli) | sidd | hutt |
| si (pluriel) | sinn | hunn |

Les formes abrégées usuelles (`ech si`, `ech hu`) sont présentées **explicitement comme variantes**, distinctes des formes pleines `ech sinn`, `ech hunn`. Enseigner ces variantes avant de les mobiliser dans le passé composé ; éviter qu'une consigne d'écriture impose une variante non annoncée. Distinguer `si` « elle » / `si` « ils/elles » par le contexte et le verbe, et `dir` / `Dir` si la distinction importe à l'exercice.

Progression attendue :
1. Sens et sujets : **être / avoir** au présent, avec exemples concrets courts ;
2. Toutes les personnes : reconnaissance puis sélection de la bonne conjugaison ;
3. Phrases affirmatives, questions et réponses simples, sans introduire encore le passé composé ;
4. Préparation explicite de l'emploi futur de `sinn` et `hunn` comme **auxiliaires** au passé composé.

Flashcards = formes et structures courtes utiles ; quiz = reconnaissance avec distracteurs `ass/bass/sinn/sidd` et `hues/huet/hunn/hutt` ; trous = contextualisation sur le bon verbe et la bonne personne ; écriture = production depuis un français **non ambigu**, incluant au moins une fois chaque forme importante ; cours = règle et tableau complets, exemples, questions/réponses et dialogue de réemploi. Chaque notion obligatoire doit figurer dans le cours **et** l'écriture. Éviter les traductions françaises qui accepteraient plusieurs réponses cibles non prises en charge.

Dans l'actuelle leçon sur le passé composé (future n°25), remplacer la présentation des auxiliaires « rappel » par une **référence explicite à la nouvelle leçon 20** et une explication graduée de **choisir `sinn` ou `hunn`** : déplacements, changements d'état, activités ; proscrire la règle simpliste « tout déplacement = sinn » si elle induit des généralisations fausses. Garder des exemples réutilisables : `Du bass ...`, `Hien ass ...`, `Mir sinn ...`, `Ech hunn ...` ou `Ech hu ...` avec vérification orthographique avant publication. Ne pas confondre « être/avoir au présent » et « auxiliaires du passé composé ».

## 2. Aide vocabulaire discrète, disponible AVANT la première réponse

### Cas réels

- « Je suis allé en ville en voiture. » → attendu dans la leçon actuelle : `Ech si mam Auto an d'Stad gefuer.`
- « Nous sommes allés au cinéma. » → attendu : `Mir sinn an de Kino gaangen.`

L'utilisateur peut connaître la conjugaison et le participe, tout en ignorant `mam Auto`, `an d'Stad` et `an de Kino` ou la distinction destination/localisation. Ce vocabulaire **incident** ne doit pas devenir un piège d'écriture.

### Interface

Ajouter, pour les questions d'écriture concernées, une ligne compacte **« 💡 Aide vocabulaire »** (discrète, accessible au clavier et sur mobile), **fermée par défaut**, sous la consigne et avant le champ de réponse. Au clic, afficher uniquement les **groupes de mots non encore enseignés comme prérequis obligatoires**.

Exemple pour « Je suis allé en ville en voiture » :

- `en voiture` → **`mam Auto`**
- `en ville (destination)` → **`an d'Stad`**
- Mention éventuelle très courte : « localisation : `an der Stad` ».

Pour « Nous sommes allés au cinéma » : `au cinéma (destination)` → **`an de Kino`** ; ne pas confondre avec la localisation `am Kino`.

### Règles pédagogiques et techniques

- Aide visible/ouvrable **dès le premier essai**, sans devoir se tromper ; **aucune pénalité** (vies, étoiles, score, comptage d'erreur) à son ouverture.
- **Ne jamais afficher la traduction complète** ni la forme qui constitue précisément la **compétence évaluée** (par exemple le choix `bass/sinn` ou `huet/hues` dans un exercice sur la conjugaison).
- Proposer un schéma de données déclaratif simple sur les exercices concernés (p. ex. `aide_vocab: [{fr,lu,precision?}]`), sans déductions automatiques fragiles ; réutiliser le rendu dans la mission et l'écriture si leurs moteurs diffèrent. Les indications sont vérifiées et maintenues comme le reste du cours.
- Ne pas afficher systématiquement de l'aide sur tous les exercices : uniquement lorsqu'une expression requise est **réellement nouvelle au point de progression où elle est testée**. L'existence d'un mot dans un bonus, un tableau de référence en fin de leçon ou une leçon suivante ne constitue pas nécessairement son apprentissage préalable.
- Pour des exercices d'une **leçon déjà enseignée** portant précisément sur cette expression, l'aide ne doit pas révéler la réponse. Prévoir une règle explicite « cible de l'exercice » et une vérification lors de l'audit du contenu.
- Pas de traduction mot à mot artificielle. Les distinctions `an d'Stad` / `an der Stad` et `an de Kino` / `am Kino` doivent être abordées dans le cours avant d'être obligatoires sans aide.
- Préserver une UI mobile compacte, sans déborder le bouton de validation ni provoquer de saut de scroll lors de l'ouverture.

## 3. Corriger les feedbacks par rapport à l'erreur, pas à une note générique

### Cas réel : mauvais pronom

- Phrase : « Le vélo n'est pas neuf. Il est vieux. »
- Saisie : `de velo ass net nei. hien ass al`
- Réponse attendue : `De Vëlo ass net nei. En ass al.`
- Feedback observé : « Attention : Un adjectif se nie avec `net` : `ass net nei`. »

**Problème :** `net` était correct. L'écart pertinent est **`hien` au lieu de `en`** (objet masculin repris par `en` ; `hien` pour une personne). Afficher un retour ciblé du type « Pour reprendre un objet masculin, utilise `en` ; `hien` s'utilise pour une personne. » Ne pas pénaliser les accents et majuscules si la normalisation existante les tolère.

Généraliser la règle : identifier le **token ou groupe en erreur** avant d'afficher une note contextuelle. N'afficher une note de leçon que si elle explique l'écart détecté ; sinon, fournir un message prudent (« Réessaie en vérifiant les pronoms ») ou ne pas afficher de note plutôt que d'induire l'apprenant en erreur. Ne pas exposer automatiquement la réponse entière lors d'une deuxième tentative.

Conserver le comportement exigé par la SPEC 41 pour `aam` au lieu de `am` : expliquer le caractère ajouté, **sans note grammaticale hors sujet**.

Auditer également les notes de l'actuel passé composé : `falen` (« tomber ») et `erwächen` (« se réveiller ») ne se résument pas à « déplacement » ; une indication doit expliquer le bon usage de `sinn` selon le cas. Une erreur sur le choix de l'auxiliaire mérite une explication pertinente, une erreur sur sa conjugaison (`mir bass` → `mir sinn`) mérite une autre explication.

## 4. Audit des mots réellement enseignés AVANT les évaluations

### Cas réel : `trëppelen`

Dans l'actuelle leçon 24 :
- Quiz obligatoire : question `trëppelen` → `ech si getrëppelt`.
- Flashcard correspondante « j'ai marché » → `ech si getrëppelt` marquée **`plus: true`** (bonus).
- Le cours de référence contient le verbe, mais cela ne garantit pas qu'il a été présenté dans **l'unité principale avant le quiz**.

**Règle :** aucun terme, variante, participe, préposition ou construction ne doit être obligatoire dans quiz/trous/écriture avant d'avoir été introduit clairement dans le parcours principal ou rendu accessible via une aide qui ne dévoile pas la compétence évaluée.

Auditer d'abord la leçon du passé composé, puis les autres leçons A1.2 impactées : correspondance entre **unité, scène, flashcards principales/bonus, cours, quiz, trous, écriture**. Pour chaque contenu non préparé, choisir et documenter l'une des actions : (a) enseigner dans l'unité obligatoire avant son évaluation ; (b) fournir une aide limitée pour du vocabulaire incident ; (c) retirer ou déplacer l'exercice vers un bonus. Supprimer les répétitions et les variantes sans gain pédagogique.

Respecter les instructions propres à chaque leçon, les distracteurs plausibles, les identifiants uniques et séquentiels, le JSON valide et les traductions françaises non ambiguës. Vérifier l'orthographe et les formes sur **LOD.lu**, la grammaire avec `grammaire_luxembourg.md`, puis articles, genres, accords, prépositions et ponctuation.

## 5. Cadrage erroné du Chemin après « Refaire mes erreurs »

### Cas réel

L'onglet **Chemin** s'ouvre, mais l'écran atterrit **tout en bas du parcours** (leçons 20 à 26, examens A1.2 visibles) au lieu de la **leçon effectivement travaillée**. La destination est correcte, le cadrage ne l'est pas.

### Comportement exigé

- À l'issue du rattrapage, retourner au **Chemin principal**, leçon **repliée** conformément à la SPEC 41 (pas la vue des unités).
- Cadrer la **carte de la leçon terminée**, pas la prochaine conseillée ni le bas du parcours ; l'identifier à partir du résultat réel de la session et du niveau actif.
- Attendre la **stabilisation du rendu** avant le cadrage (DOM reconstruit, classes/hauteurs réelles, en-tête, barre de navigation et safe-area). Éviter les animations/restaurations de scroll concurrentes ; calculer avec la zone visible réelle. Si la carte tient à l'écran, la centrer ; sinon, montrer son début.
- Tester que la carte est **encore** visible après le rendu et les animations, et qu'un bouton Retour Android ou une nouvelle visite ne rétablissent pas un ancien scroll incorrect.
- Conserver les étoiles, scores, progrès, données locales/cloud et la distinction Accueil / Chemin / Retour.

Inspecter notamment `cheminSurLecon()`, `goLessons()`, `centrerLeconChemin()`, `showView()` et les mécanismes de restauration de navigation. Ne pas présumer la cause sans reproduction.

## 6. Renumérotation A1.2 : migration sans perte de progression

L'ajout de la nouvelle leçon 20 doit produire : **nouvelle 20**, anciennes **20→21, 21→22, 22→23, 23→24, 24→25, 25→26, 26→27**. Les leçons A1.1 restent inchangées.

Ce décalage est un **changement de clé fonctionnelle**, pas un simple renommage de fichiers :
- Actualiser IDs des leçons, chemins `lecon-XX.json`, index/manifeste/chargement, références croisées, intitulés et renvois pédagogiques, affichage du Chemin et des examens si nécessaire.
- **Avant toute migration**, inventorier précisément les structures qui indexent par ID leçon : niveaux par question, erreurs, historique, étoiles, unités, missions, sessions sauvegardées, `localStorage` et synchronisation cloud. Prendre en compte les clés de questions `id`, `unite`, `lecon` et les éventuelles références codées en dur.
- Fournir une migration **versionnée, idempotente, sans collision**, qui déplace les acquis des anciennes 20–26 vers 21–27, conserve A1.1 et n'attribue **aucun acquis préexistant** à la nouvelle leçon 20. Vérifier aussi les comptes déjà synchronisés sur plusieurs appareils : une ancienne sauvegarde ne doit pas écraser ni réintroduire les anciennes clés à la première synchro.
- Tester avec un profil vierge, un profil partiellement avancé (notamment ancienne 24), un profil entièrement terminé, et une synchronisation cloud/locale. Assurer un plan de retour arrière/sauvegarde avant migration si un état ancien ne peut être déplacé sûrement.
- **Interdiction de simplement changer les IDs** en laissant les progressions décalées. Si la migration sûre n'est pas prête, bloquer la livraison de la renumérotation plutôt que perdre des données.

## 7. Validation ciblée (acceptation)

- [x] Nouvelle leçon n°20 : toutes les formes de `sinn` et `hunn` sont expliquées, reconnues et produites sans ambiguïté ; formes abrégées annoncées, cours et écriture alignés.
- [x] L'actuelle leçon 24 (future 25) repose sur cette conjugaison déjà apprise ; exercices `ass/bass/sinn`, `hues/huet/hunn/hutt` compréhensibles ; notes distinctes pour auxiliaire et accord au sujet.
- [x] Dans « Je suis allé en ville en voiture », **« Aide vocabulaire »** révèle `mam Auto` et `an d'Stad` sans donner l'auxiliaire ni le participe ; ouverture sans pénalité, avant premier essai.
- [x] Dans « Nous sommes allés au cinéma », aide possible sur `an de Kino`, sans révéler `Mir sinn` ou `gaangen`.
- [x] Une aide n'apparaît pas sur un mot faisant l'objet même de la question, et ne donne jamais la réponse entière.
- [x] `trëppelen` et les autres termes obligatoires sont enseignés dans le parcours principal **avant** le quiz, ou leur exercice est reclassé.
- [x] « `de velo ass net nei. hien ass al` » donne une aide **sur `hien`/`en`**, pas sur `net`.
- [x] « `d'dusch ass aam buedzemmer` » donne l'aide ciblée de la SPEC 41.
- [x] Depuis le rattrapage, le **Chemin principal** arrive sur la **leçon jouée**, repliée et correctement cadrée, sans défilement ultérieur vers le bas.
- [x] *(Remplacé, décision du 18/10/2026 : pas de migration, voir Implémentation §6)* La migration 20→21 … 26→27 préserve les acquis locaux et cloud et ne crédite pas la nouvelle leçon 20.
- [x] Audits de langue, leçons et JSON passés (leçon du passé composé corrigée ; 38 points relevés ailleurs, voir ci-dessous) ; tests ciblés puis non-régression avec les outils rapides de la SPEC 39, résultats et limites consignés.

## Plan d'exécution recommandé

1. **Corriger les deux défauts UX** (feedback hors sujet + scroll du Chemin) et les couvrir par des tests ciblés.
2. **Produire et auditer le contenu pédagogique** de la nouvelle leçon 20, puis vérifier les prérequis de l'actuelle leçon 24.
3. **Ajouter l'aide vocabulaire déclarative** sur les exercices réellement concernés, sans indice sur la notion évaluée.
4. **Réaliser et valider la migration des identifiants et des progressions**, puis renuméroter et publier les contenus A1.2.
5. Tester le parcours du début à la leçon sur le passé composé ; vérifier Android et synchronisation sur deux profils.

Exécuter ces étapes sans refonte inutile ni relances de tests redondantes. Ne passer le statut de cette fiche à « Implémentée — validation à confirmer » **qu'après** modifications de code, tests et push ; ne jamais noter « Validée » sans recette réelle.

## Implémentation (18/10/2026)

### Décision : pas de renumérotation des ids (§6 remplacé)

Arbitrage de Clayton du 18/10/2026 : l'**ordre affiché est séparé de l'id**.
- La nouvelle leçon prend l'**id libre 27**, avec `"numero": 20`.
- Les anciennes leçons gardent leur id (20 à 26) et reçoivent `"numero": 21` à `27`.
- **Aucune migration** : progression locale et cloud, V1 sur `main` et sauvegardes multi-appareils restent attachées aux mêmes ids. Rien n'est crédité à la nouvelle leçon.
- `server.js` trie les leçons par `numero` (repli : id) dans chaque niveau.
- `numLecon(l)` (`niveau.js`) donne le numéro affiché partout : chemin, accueil, révision, mission, fin de partie, Retour.
- Les renvois « leçon N » des textes A1.2 sont décalés (leçons ids 21, 22, 24, 25).
- PLAYBOOK §7 bis : règle ajoutée ; prochain id libre en A1.2 : 28.

### 1. Nouvelle leçon « Sinn an hunn » (`data/lecons/A1.2/lecon-27.json`, affichée Leçon 20)

- 3 unités :
  - **sinn** au présent (toutes les personnes ; piège de l'âge avec sinn ; si = elle / ils) ;
  - **hunn** au présent (hues / huet ; dir / Dir) ;
  - **questions et formes courtes** (Bass du…? Hues du…? ; règle du n : sinn → si, hunn → hu, annoncées comme variantes).
- 20 mots cachés, 20 quiz (distracteurs ass / bass / sinn / sidd et hues / huet / hunn / hutt), 23 trous, 22 écritures (français non ambigu : « il est (une personne) », « (poli) »).
- Mission « Faire connaissance au café » : 10 réponses.
- Cours : tableau complet, pièges, formes courtes, questions et réponses, renvoi vers le passé composé (Leçon 25), dialogue.
- Vocabulaire limité à celui de l'A1.1 : nationalités, âge, famille, objets. Formes et règle du n alignées sur les leçons A1.1 déjà vérifiées sur LOD.lu (« Ech si Fransous », « Ech sinn drësseg Joer al », « keng Kanner », « Wéi al sidd Dir? »).
- Les formes courtes ne sont exigées qu'en unité 3, après avoir été expliquées.

### Leçon du passé composé (id 24, affichée Leçon 25)

- Le tableau « auxiliaires au présent (rappel) » devient un renvoi explicite vers la **leçon 20**, avec l'accord au sujet.
- « sinn ou hunn ? » réécrit : changement de lieu / changement d'état ou de position (falen, erwächen, opstoen) / hunn pour la plupart des autres verbes, « apprends l'auxiliaire avec le verbe ». Plus de règle « tout déplacement = sinn » ; note de `falen` corrigée.
- **Prérequis** :
  - `getrëppelt`, `gewunnt`, `gekuckt`, `mir waren`, `mir haten` ajoutés au mot caché du cœur ;
  - infinitifs `trëppelen`, `lafen`, `falen` dans l'exemple de l'unité 1 ;
  - `hate mir` expliqué dans la règle de l'unité 3.
- **Aide vocabulaire** (scène et écriture) :
  - `mam Auto` et `an d'Stad` (+ « an der Stad ») pour « Je suis allé en ville en voiture » ;
  - `an de Kino` (+ « am Kino ») pour « Nous sommes allés au cinéma » ;
  - `gëschter Owend` dans l'unité 2.
- Nouveau tableau de l'unité 1 « Aller quelque part ou y être » (an d'Stad / an der Stad, an de Kino / am Kino).

### 2. Aide vocabulaire — `parcours.js`, `mission.js`, `style.css`, `valider-lecons.js`

- Champ déclaratif `aide_vocab: [{fr, lu, precision?}]` sur un item d'écriture ou une réplique « toi ».
- Rendu commun `aideVocabHtml()` : `<details>` fermé par défaut, accessible au clavier, sous la consigne et avant le champ.
- Aucun effet sur les vies, le score, les essais ou les statistiques.
- `valider-lecons` refuse une aide qui donne la réponse entière et signale une aide absente de la réponse.

### 3. Feedback sur le mot réellement faux — `diagnostic.js`

- Un seul mot faux : la note de la leçon n'est affichée **que si elle parle de ce mot**. Sinon : « Un mot ne va pas : « … ». Vérifie-le. »
- Confusions dédiées :
  - `hien` → `en` : « Pour reprendre un objet masculin, utilise « en » ; « hien » s'utilise pour une personne. » ;
  - même verbe, mauvaise personne (`mir bass`) : « Bon verbe (« sinn »), mais « bass » ne va pas avec ce sujet : vérifie la conjugaison. » ;
  - sinn à la place de hunn, ou l'inverse : « Vérifie l'auxiliaire : « sinn » ou « hunn » ? » (sans donner lequel).
- Le cas `aam` de la SPEC 41 est conservé.

### 5. Cadrage du Chemin — `chemin.js`

Non reproduit dans le navigateur de test : profil vierge et profil avancé, leçons A1.2 proches du bas, tout est bien cadré. Le cadrage est rendu robuste aux deux causes probables sur Android :
- il est **refait après stabilisation** : deux images, polices chargées, 400 ms (fermeture du clavier qui agrandit la zone visible) ;
- il est **abandonné** dès que l'utilisateur touche ou fait défiler l'écran ;
- il cible toujours la leçon du résultat (`pResultat.leconId`), repliée.

### Audit des prérequis des autres leçons A1.2 (§4) — à décider

Nouvel outil : `node tools/audit-prerequis.js`. Il fait un rapport et ne bloque rien. Les prénoms (Hilaire, Max, Susy…) et certaines formes conjuguées sont des faux positifs. Points relevés, **non modifiés** (décision de contenu à prendre leçon par leçon : enseigner dans le cœur, aide vocabulaire, ou déplacer en « + ») :

```
Leçon 23 (id 22) — Les loisirs et le week-end – aimer faire (gär)
  u1 quiz 2006 : kucke   « Ech kucke ganz gär e Film. / J'adore regarder un film. »
  u2 trou 2023 : akafen   « akafen »
  u2 écriture 2022 : akafen   « E Samschdeg ginn ech akafen. »
Leçon 24 (id 23) — Les membres de la famille et les possessifs
  u1 quiz 2007 : monni   « de Monni / l'oncle »
  u1 quiz 2008 : tatta   « d'Tatta / la tante »
  u1 quiz 2009 : grousspapp   « de Grousspapp / le grand-père »
  u1 trou 2004 : dai   « Däi »
  u1 écriture 2007 : monni   « de Monni »
  u1 écriture 2008 : tatta   « d'Tatta »
  u1 mission : monni, tatta   « Dat ass de Monni an dat ass d'Tatta. »
  u2 quiz 2017 : patter   « de Pätter / le parrain »
  u2 quiz 2018 : enkelkand   « d'Enkelkand / le petit-enfant »
  u2 trou 2007 : eis   « Eis »
  u2 trou 2008 : are   « Äre »
  u2 trou 2009 : hiert   « Hiert »
  u3 trou 2015 : hiren   « hiren »
  u3 écriture 2026 : schweiesch   « menger Mamm hir Schwéiesch »
  u3 écriture 2031 : hilaire   « Den Hilaire ass menger Mamm hire Schwoer. »
  u3 écriture 2032 : max, tatta   « De Max ass der Tatta Susy hire Jong. »
  u3 mission : hilaire   « Den Hilaire ass menger Mamm hire Schwoer. »
  u3 mission : max, tatta   « De Max ass der Tatta Susy hire Jong. »
Leçon 26 (id 25) — Faire ses courses au marché – quantités et paiement
  u1 quiz 2008 : wier   « Dat wier alles. / Ce sera tout. »
  u1 écriture 2005 : bieren   « Ech huelen och nach Bieren. »
  u1 mission : bieren   « Ech huelen och nach Bieren. »
  u2 quiz 2017 : akafskuerf   « en Akafskuerf / un panier à provisions »
  u2 trou 2011 : akafskuerf   « Akafskuerf »
  u2 écriture 2010 : wellt   « Wëllt Dir eng Tut? »
  u2 écriture 2011 : akafskuerf   « Nee merci, ech hunn en Akafskuerf. »
  u2 mission : akafskuerf   « Nee merci, ech hunn en Akafskuerf. »
  u3 quiz 2012 : wellt   « Wëllt Dir eng Tut? / Voulez-vous un sachet ? »
Leçon 27 (id 26) — Lire une offre d'emploi – vrai ou faux
  u1 quiz 2003 : engager   « engagéieren / recruter, engager »
  u2 trou 2009 : fuhrerschain   « Führerschäin »
  u2 écriture 2012 : brauchen   « brauchen »
  u3 trou 2016 : mett   « Mëtt »
  u3 trou 2022 : per   « per E-Mail »
  u3 écriture 2016 : mett   « viru Mëtt August »
  u3 écriture 2021 : persoun, brauch   « D'Persoun brauch keng Erfarung. »
  u3 mission : persoun, brauch   « D'Persoun brauch keng Erfarung. »

38 item(s) à examiner (A1.2).
```

### Tests

- `tests/test_prerequis.py` (nouveau, dans la suite critique) :
  - ordre et numéros affichés ;
  - progression non décalée ;
  - `hien` / `en` et `mir bass` ;
  - aide vocabulaire (fermée, sans pénalité, sans auxiliaire ni participe, aussi en mission, absente ailleurs) ;
  - chemin centré après « Refaire mes erreurs » sur la Leçon 25, encore en place après 800 ms.
- `test_missions_10.py` : 25 missions, dont la nouvelle, jouées à 10 / 10.
- `test_lot2.py` et `test_retour_intro.py` : adaptés au numéro affiché.
- Suite critique `bash tools/critique.sh` : verte.

**Reste ouvert :**
- recette Android (cadrage réel, clavier) ;
- relecture de la nouvelle leçon par Clayton ;
- les 38 points d'audit ci-dessus.
