# SPEC 73 — Corriger les faux absents LOD et améliorer les correspondances audio

| Champ | Valeur |
|---|---|
| Priorité | P1 — fiabilité linguistique et couverture audio |
| Statut | **Phase A livrée (audit) — phase B en attente de validation** |
| Complète | SPEC 68, 69, 70, 71 et 72 |
| Périmètre | Index LOD, formes fléchies, validation du sens, audio direct/contextuel, audit |
| Hors périmètre initial | Réécriture des leçons, refonte visuelle, TTS, téléchargement massif |

## 1. Problème réel

Dans la version actuelle, le script audio cherche surtout une correspondance exacte entre le mot simplifié de la flashcard et le **lemme** de l'index LOD. L'index compact construit depuis l'export des articles contient principalement les lemmes, catégories grammaticales, traductions, IPA et exemples.

La catégorie « mot absent de LOD » signifie en réalité **lemme absent de notre index**, et non « forme inexistante dans le dictionnaire ».

Les cas à auditer incluent :

- Pluriels : Kanner / Kand, Jongen / Jong, Meedercher / Meedchen, Still / Stull.
- Participes : gaangen / goen, geschriwwen / schreiwen, gedronk / drénken.
- Féminins, pronoms et numéraux : Italienerin, Fransousin, kee, zwou / zwee.
- Variantes, composés ou orthographes à vérifier : aachtzeg, zweehonnert.
- Sens ou catégories ambigus : Dat sinn, Becheren, gemaach.
- Fichier absent du miroir MP3 historique : ganzdaags.

Les **211 expressions de plusieurs mots** sont un problème différent : elles relèvent des audios de phrases exactes ou contextuelles des SPEC 69–72 et ne doivent pas être assimilées à des lemmes absents.

**Règle centrale :** trouver une forme dans le LOD ne prouve pas qu'un audio prononce exactement cette forme. Ne jamais substituer le son du lemme au pluriel, participe ou féminin lorsque la prononciation diffère.

## 2. Sources officielles et validation orthographique

En plus des articles déjà indexés, étudier les ressources publiées le **27 juillet 2026** :

- **Index de recherche LOD** (8,1 Mo) : https://download.data.public.lu/resources/letzebuerger-online-dictionnaire-lod-index-vun-der-sich-funktioun/20260727-095933/260727-new-lod-search.zip
- **Tables de flexion LOD** (1,2 Mo) : https://download.data.public.lu/resources/letzebuerger-online-dictionnaire-lod-flexiounstabellen/20260727-101009/260727-new-lod-tab.zip

Documentation :
- https://data.public.lu/fr/datasets/letzebuerger-online-dictionnaire-lod-index-vun-der-sich-funktioun/
- https://data.public.lu/fr/datasets/letzebuerger-online-dictionnaire-lod-flexiounstabellen/

**Attention :** dans l'index de recherche, les graphies spelling comportant suggest="true" sont orthographiquement contrôlées, y compris celles marquées reason="n-rule". Les autres graphies sont automatiquement générées et doivent être **revues**, pas validées par défaut.

Les tables de flexion LOD portent sur **les verbes et adjectifs** ; elles ne suffisent pas à retrouver tous les pluriels nominaux. Compléter par l'index de recherche et les articles.

Inspecter les schémas XML effectivement fournis avant de coder : ne pas inventer de balises ou de liens entre forme et entrée. Préserver accents, apostrophes et graphies exactes. Ne pas supprimer les accents pour établir une identité lexicale.

Garder les ZIP hors dépôt si nécessaire ; ne versionner qu'un index dérivé compact, sourcé, horodaté et reproductible.

## 3. Audit exhaustif, sans modification des leçons

Passer en revue :

1. Les **63 mots** signalés « absents du LOD ».
2. Les **4 refus** pour « sens différent » et les homographes concernés.
3. Le MP3 manquant de ganzdaags.
4. Les mots isolés présents dans **tous les blocs des cours**, notamment les tableaux, et pas seulement les flashcards.
5. Les expressions sans audio, dans une analyse distincte.

Pour chaque élément, documenter : texte LuxApp, traduction, leçons/sections concernées, lemme candidat, forme exacte, type morphologique, ID LOD, catégorie grammaticale, sens, source et version, statut de graphie, disponibilité du son, décision et justification.

Utiliser des statuts exclusifs :

- **LEMME_EXACT** : entrée identique trouvée.
- **FORME_FLECHIE_VALIDEE** : forme rattachée à une entrée et orthographe vérifiée.
- **GRAPHIE_A_VERIFIER** : forme candidate générée ou non confirmée.
- **SENS_AMBIGU** : sens/catégorie/homographes non départagés.
- **PAS_D_ENTREE** : rien trouvé dans les trois sources après vérification.
- **ENTREE_SANS_AUDIO_EXACT** : forme attestée, mais aucun enregistrement correspondant vérifié.
- **AUDIO_INDISPONIBLE** : fichier attendu inaccessible, inexistant ou invalide.
- **CONTEXTE_CANDIDAT** : une phrase LOD contient la forme, en attente de validation.

Ne jamais confondre **forme attestée**, **orthographe validée** et **son exact disponible**. Les statuts de correspondance et de téléchargement doivent également être conservés séparément dans l'inventaire pour les cas combinés.

## 4. Appariement audio souhaité

### Priorité A — audio de la forme exacte

Chercher la forme dans les articles, l'index de recherche et les flexions. Vérifier qu'elle correspond bien au sens de LuxApp et à la catégorie grammaticale ; départager les homographes (an, op, Franséisch, etc.).

Ne créer une association directe que si l'enregistrement disponible prononce **exactement** la forme affichée. Le MP3 du lemme ne suffit pas pour un participe, un pluriel ou une déclinaison différents.

Conserver les associations manuelles existantes, après contrôle de leur exactitude ; les nouvelles exceptions doivent indiquer un ID LOD et une justification.

### Priorité B — phrase LOD contenant la forme

En l'absence de son exact, proposer un exemple audio où la **même forme** est prononcée dans le bon sens. Étendre les propositions contextuelles aux mots isolés, mais appliquer une relecture humaine renforcée pour les homographes.

Afficher la phrase effectivement entendue et sa traduction. Respecter le design validé : **or** = audio exact ; **gris sable** = audio contextuel ; expression étudiée en **doré**.

Ne jamais utiliser une phrase qui emploie une autre forme ou un autre sens pour augmenter artificiellement la couverture.

### Priorité C — aucun son sûr

Conserver le mot dans LuxApp sans bouton audio si aucune prononciation exacte ou contextuelle n'a été validée. Signaler « pas d'enregistrement vérifié » plutôt que « mot inexistant ».

## 5. Téléchargement et traçabilité

- Continuer à utiliser le miroir MP3 pour les entrées dont le fichier est confirmé.
- Quand il ne contient pas l'enregistrement requis, explorer les ressources officielles **M4A/OGG** de lod.lu uniquement avec un chemin réellement documenté ou vérifié.
- Distinguer les erreurs 404, 403/proxy, timeout et fichier invalide. Ne jamais conclure « audio inexistant » après un simple échec réseau.
- Réutiliser la procédure Termux de la SPEC 72 si nécessaire.
- Vérifier signature, taille, lisibilité/décodage, durée cohérente et échantillon écouté pour les nouvelles correspondances.
- Dédupliquer par ID, reprendre après interruption, limiter les requêtes.
- Aucun bouton ne doit pointer vers un fichier absent ; ne pas publier d'association non validée.

## 6. Livrables et étapes

**Phase A — audit et validation (à faire en premier)**

Produire :

- Un rapport lisible dans docs/audit-correspondances-lod.md.
- Un inventaire machine (JSON ou CSV) de **tous les refus** et candidats, avec données de la section 3.
- Des chiffres séparés : faux absents avérés, formes attestées sans son, sons directs récupérables, audios contextuels possibles, cas réellement absents.
- Le comparatif avec le catalogue existant (**442 mots avec son au dernier état connu**) et l'audit par leçon/section.

**Ne modifier aucun JSON de leçon, association audio ou fichier son pendant cette phase.**

**Phase B — implémentation après validation de l'audit**

- Étendre le constructeur d'index ou créer un index morphologique compact et reproductible.
- Adapter tools/lod/commun.js et tools/audio-lod.js, en conservant un mode --essai sans téléchargement ni écriture.
- Adapter les listes de candidats, la table de correspondances relues et tools/lod/audit-audio.js.
- Réutiliser les flux Termux et maintenir les contrôles audio déjà en place.
- Mettre à jour le PLAYBOOK avec les commandes réelles et rapports.
- Ne pas modifier la progression, les IDs d'exercices ni les leçons.

## 7. Tests et risques de régression

Tests ciblés obligatoires :

- Kanner/Kand ; Still/Stull ; gaangen/goen ; geschriwwen/schreiwen ; zwou/zwee ; kee/keen.
- Orthographes contrôlées vs formes générées ; absence de suppression des accents.
- Homographes, sens différents, formes féminines, numéraux composés et cas sans entrée.
- Rejet de l'audio du lemme lorsque le fichier ne prononce pas la forme affichée.
- Contrôle ID LOD ↔ texte ↔ sens ↔ fichier référencé ; doublons et format invalide.
- Idempotence : deuxième exécution sans nouveaux téléchargements et sans modifications parasites.
- Audit complet des cours, y compris les tableaux, et maintien des **442 correspondances** déjà approuvées.
- Fonctionnement hors réseau du mode --essai et du rapport.
- Une fois les tests ciblés réussis, lancer la suite critique tools/critique.sh.

Une suite de tests verte ne démontre pas à elle seule la qualité phonétique ou linguistique.

## 8. Validation

La SPEC 73 ne peut être déclarée implémentée que si :

1. Chaque faux « absent » a une explication et une source vérifiable.
2. Les formes fléchies sont reliées aux entrées LOD sans confondre les variantes générées avec l'orthographe standard.
3. Les nouveaux boutons audio correspondent bien à la **forme et au sens** affichés.
4. La couverture augmente sur la base de **fichiers réels vérifiés**, sans perte des anciens enregistrements.
5. Les 25 leçons et la progression restent intactes.
6. Les décisions, tests et rapports sont reproductibles.

**Instruction finale : livrer l'audit, puis attendre validation avant toute association massive ou téléchargement complémentaire.**


---

## Résultats de la phase A — révision 2 (20/10/2026)

Outil : `node tools/lod/audit-correspondances.js --articles new_lod-art.xml --tables new_lod-tab.xml --recherche new_lod-search.xml [--hors-ligne]`
(exports LOD 2026-07-27 gardés hors dépôt ; résultat identique à chaque exécution). Rapport : `docs/audit-correspondances-lod.md` ;
inventaire : `docs/audit-correspondances-lod.json`. Tests : `node tests/test_audit_correspondances.js` (suite critique).
**Aucune leçon, association audio ni fichier son modifié.**

### Sources et schémas réellement lus

- Articles : `lemma` (+ `nRuleForm`), `inflection type="plural"` / `form` (attributs `nRuleForm`, `rare`), `pastParticiple`,
  `internalLink relation="Variant"` (renvoi : sens de l'entrée liée), exemples avec `inflectedHeadword`.
- Tables : `verbConjugation` (infinitif, participe, présent, prétérit, conditionnel, **impératif** — bloc lu à part, « ! » retiré)
  et `adjDeclension`. Temps composés et auxiliaires exclus ; pronoms réfléchis entre parenthèses retirés.
- **Index de recherche** (fourni par Clayton, 88 Mo) : `entry/@audio`, `spellings/spelling` avec `suggest` et `reason`.
  Règle de data.public.lu : `suggest="true"` = graphie contrôlée ; les formes `reason="n-rule"` sont aussi contrôlées
  (dans le fichier elles portent `suggest="false"`) ; `erroneous-spelling` = graphie fautive rattachée au standard ; les autres raisons = graphies générées.
  L'index sert d'arbitre orthographique et de source de secours (il contient aussi les morceaux des verbes composés : jamais prioritaire).
- `audio="true"` est présent sur les 33 941 entrées : il ne prouve pas la disponibilité d'un fichier. Seuls les MP3 vérifiés sur le miroir comptent.

### Corrections d'interprétation (retours de Clayton)

- **Entschëllegt!** : impératif (formule de politesse), pas participe passé ; les deux analyses sont documentées, l'usage LuxApp tranche
  (formule exclamative → impératif ; cellule de conjugaison → présent).
- **Traductions des tableaux** : la colonne française n'est attribuée que si le tableau a une seule colonne luxembourgeoise ;
  sinon, traduction prise dans les cartes / le vocabulaire, ou aucune (« eng Mauer » n'est plus traduit « deux murs »).
  « Dat sinn » ne prête plus sa traduction à « sinn ».
- **Sons exacts séparés** en « sûrs » et « à valider » ; les sons contextuels sont dans une section distincte.
- **Corrections d'orthographe** : un participe proposé (verloobt) n'apporte pas de son direct (le MP3 prononce « verloben »).

### Chiffres (183 mots isolés sans son)

| Sons exacts (forme affichée) | |
|---|---:|
| Sûrs : lemme identique, graphie contrôlée, sens lu dans la traduction, sans homographe ni variante, MP3 présent | **10** |
| À valider : 37 cellules de tableau sans traduction, 13 avec homographes, 3 variantes, 3 traductions lues dans un tableau | 42 |
| Lemme identique sans fichier (ganzdaags, absent du miroir 2020) | 1 |

| Sans son exact | |
|---|---:|
| Formes fléchies validées (pluriels, participes, impératif, présent, prétérit, formes déclinées, règle du n contrôlée) | 90 |
| … dont phrase LOD candidate prononçant la forme exacte (relecture requise) | 74 |
| Graphies à vérifier (3 fautives selon le LOD, 7 graphies LOD proches) | 10 |
| Sens ambigu | 15 |
| Pas d'entrée dans les trois sources (définitif) | 15 |

- Les 10 sons sûrs sont tous des mots du cours (« de Brudder (pl. d'Bridder) », « d'Reunioun »…) ; 6 MP3 sont déjà dans le dépôt.
- Les 63 « absents » : 45 formes fléchies, 8 graphies à vérifier, 10 sans entrée ; les 7 ordinaux en « -te » sont des formes règle du n **contrôlées**.
- Les 4 « sens différent » : Still, Becheren, gemaach résolus (casse) ; « Dat sinn » ambigu.
- 442 associations existantes : toutes cohérentes et conservées.

### Orthographes (aucun remplacement automatique)

| LuxApp | LOD | Constat | Son exact après correction |
|---|---|---|---|
| Italiener, Italienerin, Italienesch | Italieener, Italieenerin, italieenesch | graphies **fautives** selon l'index | oui (MP3 présents) |
| aachtzeg, eenanaachtzeg | achtzeg, eenanachtzeg | absentes du LOD, graphie contrôlée proche | oui |
| Fransousin | Franséisin | absente du LOD | oui |
| Kommod | Komoud (Kommoud = fautive) | absente du LOD | oui |
| verlobt | verloobt (participe de verloben) | absente du LOD | non (forme fléchie) |
| Kirchberg | Kierchbierg | **nom propre** : Kirchberg est aussi la forme officielle française / allemande ; 2 emplois en leçon 10 (« Ech wunnen um Kirchberg. ») à examiner avant tout remplacement | oui si remplacé |

### Gain estimé

+10 sons exacts sûrs ; jusqu'à +52 après relecture des 42 cas à valider ; jusqu'à +74 audios contextuels relus (≈ +67 disponibles) ;
+7 mots avec son exact (8 éléments) si les orthographes sont corrigées, hors verlobt (forme fléchie) et Kirchberg (nom propre).

### Phase B proposée (après validation)

1. Moteur : index morphologique compact et versionné (formes des articles et des tables + statut de l'index de recherche), utilisé par `tools/audio-lod.js`
   pour toutes les futures leçons ; clé d'affichage tolérant les parenthèses (« (pl. d'Bridder) »).
2. Associations exactes **sûres** d'abord (10), puis les cas « à valider » relus un par un.
3. Exemples contextuels relus (comme SPEC 70), téléchargés via Termux.
4. Orthographes : correction des leçons seulement après décision de Clayton, mot par mot.
