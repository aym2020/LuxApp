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

## Résultats de la phase A (20/10/2026)

Outil : `node tools/lod/audit-correspondances.js --articles new_lod-art.xml --tables new_lod-tab.xml [--recherche …] [--hors-ligne]`
(exports LOD gardés hors dépôt). Rapport : `docs/audit-correspondances-lod.md` ; inventaire : `docs/audit-correspondances-lod.json`.
Tests ciblés : `node tests/test_audit_correspondances.js` (ajouté à la suite critique avec `tests/test_audio_lod.js`).
**Aucune leçon, association audio ni fichier son modifié.**

### Sources et schémas réellement lus

- Articles (export 2026-07-27, 33 941 entrées) : `lemma` (+ attribut `nRuleForm`), `inflection type="plural"` / `form` (attributs `nRuleForm`, `rare`),
  `pastParticiple`, `internalLink relation="Variant"` (entrée sans traduction → sens de l'entrée liée), exemples avec `inflectedHeadword`.
- Tables (2026-07-27, 9 851 tables) : `verbConjugation` et `adjDeclension`. Temps composés et auxiliaire exclus (« si », « war » ne sont pas des formes du verbe),
  pronoms réfléchis entre parenthèses retirés (« mécht (sech) » → « mécht »).
- **Index de recherche : non consulté** — `download.data.public.lu` est refusé par le proxy de l'environnement de Claude.
  Les « sans entrée » sont donc provisoires ; les graphies générées (`suggest` absent) n'ont pas pu être distinguées.
- Casse conservée (« Still » pluriel de Stull ≠ « still » calme ; « Sproochen » ≠ « sproochen »), normalisation Unicode NFC, aucun accent retiré côté luxembourgeois.

### Chiffres (183 mots isolés sans son : cartes, vocabulaire et exemples du cours, cellules de tableaux)

| | |
|---|---:|
| LEMME_EXACT (dont 53 MP3 disponibles sur le miroir, 1 absent : ganzdaags) | 54 |
| FORME_FLECHIE_VALIDEE (pluriels, participes, formes conjuguées / déclinées) — **sans son direct** | 83 |
| GRAPHIE_A_VERIFIER (10 graphies LuxApp ≠ LOD, 7 variantes règle du n dérivées) | 17 |
| SENS_AMBIGU (surtout cellules de tableaux grammaticaux sans traduction) | 14 |
| PAS_D_ENTREE (provisoire) | 15 |
| CONTEXTE_CANDIDAT (exemple de la même entrée prononçant la forme exacte, relecture requise) | 74 |

- Les 63 « absents » : **53 faux absents** (41 formes fléchies, 12 graphies à vérifier), 10 sans entrée
  (Hallo, Wollekekrazer, nombres composés, Koreanesch, leedeg, Aarbechtsannonce).
- Les 4 « sens différent » : Still → pluriel de Stull, Becheren → pluriel de Becher, gemaach → participe de maachen (résolus par la casse) ;
  « Dat sinn » reste ambigu (« Dat » n'est pas un article ici).
- Catalogue : les 442 associations existantes sont toutes cohérentes (lemme LOD identique) et conservées.
- 6 mots du cours ont déjà leur MP3 dans le dépôt mais pas de bouton à cause d'une parenthèse dans le texte affiché
  (« de Brudder (pl. d'Bridder) ») : correction de clé d'affichage seulement.

### Orthographes LuxApp à valider (graphie LOD, MP3 vérifié sur le miroir)

aachtzeg → **achtzeg** (`ACHTZEG1`) · eenanaachtzeg → **eenanachtzeg** · Italiener → **Italieener** (ou Italiéiner) · Italienerin → **Italieenerin** ·
Italienesch → **italieenesch** · Fransousin → **Franséisin** · Kirchberg → **Kierchbierg** · verlobt → **verloobt** · Kommod → **Komoud** ·
éischte, dräizéngte, uechtzéngte, véieranzwanzegste, drëtte, fënnefte, zéngte : variantes règle du n de formes officielles (à confirmer avec l'index de recherche).

### Gain estimé (mots isolés)

+53 sons directs (forme exacte, MP3 du miroir) ; +74 audios contextuels possibles (≈ +67 réellement disponibles, 1 enregistrement sur 10 manquant lors du passage SPEC 72) ;
+9 sons supplémentaires si les orthographes ci-dessus sont corrigées. Les 83 formes fléchies n'ont pas de son direct (règle centrale).
