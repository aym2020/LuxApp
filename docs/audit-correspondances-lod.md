# Audit des correspondances LOD — SPEC 73, phase A (révision 2)

Généré par `node tools/lod/audit-correspondances.js`. **Aucune leçon, association audio ni fichier son n'a été modifié.**
Inventaire complet : `docs/audit-correspondances-lod.json`.

## Sources

| Source | Version | Utilisée | Contenu exploité |
|---|---|---|---|
| Articles LOD (`new_lod-art.xml`) | export 2026-07-27 | oui (33941 entrées) | lemmes, règle du n, pluriels, participes, variantes (renvois), sens, exemples |
| Tables de flexion (`260727-new-lod-tab.zip`) | 2026-07-27 | oui (9851 tables) | présent, prétérit, impératif, conditionnel, participes ; déclinaisons |
| Index de recherche (`260727-new-lod-search.zip`) | 2026-07-27 | **oui** | statut de chaque graphie : contrôlée (`suggest="true"`), règle du n (`reason="n-rule"`, contrôlée selon data.public.lu), fautive (`erroneous-spelling`), générée (autres raisons) |
| Miroir MP3 (robertoentringer/lod-mp3-mirror) | 2020-12-18 | oui (requête HEAD par identifiant) | son du lemme |
| Phrases LOD téléchargées (SPEC 72) | 2026-10-20 | oui | enregistrements d'exemples disponibles |

Note : l'attribut `audio="true"` figure sur les 33 941 entrées de l'index de recherche ; il ne prouve donc pas qu'un fichier est disponible.
Seuls les fichiers réellement présents (miroir ou téléchargés) comptent comme sons disponibles.

## Synthèse

183 mots isolés des leçons (cartes, vocabulaire et exemples du cours, cellules luxembourgeoises des tableaux) n'ont pas de son aujourd'hui.

### Sons exacts (la forme affichée elle-même)

| | Nombre |
|---|---:|
| **Sûrs** : lemme identique, graphie contrôlée, sens lu dans la traduction LuxApp, aucun homographe, MP3 présent | **10** |
| **À valider** : MP3 présent, mais homographe, variante, sens non vérifiable (tableau) ou déduit | 42 |
| Lemme identique sans fichier disponible | 1 |

### Sans son exact

| | Nombre |
|---|---:|
| Formes fléchies validées (pluriel, participe, impératif, forme conjuguée ou déclinée) : le MP3 de l'entrée prononce le lemme, **pas de son direct** | 90 |
| … dont **audio contextuel candidat** (un exemple de la même entrée prononce exactement la forme ; relecture humaine requise) | 74 (4 déjà téléchargés) |
| Graphies à vérifier (fautive selon le LOD, générée, ou graphie LOD proche) | 10 |
| Sens ambigu | 15 |
| Pas d'entrée dans les trois sources | 15 |

### Les 63 « mots absents du LOD » du rapport initial

- LEMME_EXACT : 0
- FORME_FLECHIE_VALIDEE : 45 (Entschëllegt!, kee, zwou, e bësse, gescheet, getrennt, gepacst, Kanner, Jongen, Meedercher, gebuer, éischte, dräizéngte, uechtzéngte, véieranzwanzegste, hallwer, Këschten, Glieser, Handdicher, Biller, Telleren, gefuer, gaangen, heemgaangen, erausgaangen, erwächt, opgestanen, gelaf, gefall, getrëppelt, giess, gedronk, geschafft, geschlof, geschriwwen, geduscht, telefonéiert, gewunnt, gekuckt, Äppel, Bieren, Gromperen, Aprikosen, d'Kenntnesser, viru)
- GRAPHIE_A_VERIFIER : 8 (aachtzeg, Italiener, Fransousin, Italienerin, Italienesch, Kirchberg, verlobt, Kommod)
- SENS_AMBIGU : 0
- PAS_D_ENTREE : 10 (Hallo!, Wollekekrazer, zweehonnert, dräihonnert, zweedausend, zéngdausend, Koreanesch, leedeg, zweedausendvéier, Aarbechtsannonce)

**Les 4 refus « sens différent »** : « Dat sinn » → SENS_AMBIGU ; « Still » → FORME_FLECHIE_VALIDEE (Stull, pluriel) ; « Becheren » → FORME_FLECHIE_VALIDEE (Becher, pluriel) ; « gemaach » → FORME_FLECHIE_VALIDEE (maachen, participe passé).

### Gain estimé

- Sons exacts : **+10 sûrs**, jusqu'à +52 après relecture des 42 cas à valider.
- Audio contextuel : jusqu'à +74 après relecture (≈ +67 si 1 enregistrement d'exemple sur 10 manque, comme lors de la SPEC 72).
- Graphies : les corrections validées donneraient un son exact supplémentaire par mot corrigé (voir la section dédiée).

### Par leçon

| Leçon | Sans son | Son exact sûr | Son exact à valider | Contexte candidat | Graphie à vérifier | Autre (fléchi sans contexte, ambigu, absent) |
|---|---|---|---|---|---|---|
| A1.1 L1 | 3 | 0 | 1 | 1 | 0 | 1 |
| A1.1 L2 | 4 | 0 | 0 | 1 | 0 | 3 |
| A1.1 L3 | 2 | 0 | 1 | 0 | 0 | 1 |
| A1.1 L5 | 15 | 0 | 5 | 1 | 2 | 7 |
| A1.1 L6 | 3 | 0 | 2 | 0 | 0 | 1 |
| A1.1 L8 | 4 | 0 | 0 | 1 | 3 | 0 |
| A1.1 L9 | 5 | 0 | 0 | 3 | 1 | 1 |
| A1.1 L10 | 3 | 0 | 0 | 0 | 1 | 2 |
| A1.1 L11 | 1 | 0 | 0 | 1 | 0 | 0 |
| A1.1 L12 | 2 | 0 | 0 | 0 | 0 | 2 |
| A1.1 L13 | 8 | 0 | 0 | 5 | 1 | 2 |
| A1.1 L14 | 13 | 0 | 0 | 6 | 0 | 7 |
| A1.1 L15 | 2 | 0 | 0 | 2 | 0 | 0 |
| A1.1 L16 | 1 | 0 | 1 | 0 | 0 | 0 |
| A1.2 L20 | 4 | 0 | 2 | 2 | 0 | 0 |
| A1.2 L21 | 8 | 0 | 0 | 6 | 2 | 0 |
| A1.2 L22 | 22 | 0 | 9 | 8 | 0 | 5 |
| A1.2 L23 | 24 | 9 | 6 | 7 | 0 | 2 |
| A1.2 L24 | 50 | 1 | 18 | 22 | 0 | 9 |
| A1.2 L25 | 9 | 0 | 4 | 3 | 0 | 2 |
| A1.2 L26 | 8 | 0 | 1 | 3 | 0 | 4 |
| A1.2 L27 | 15 | 0 | 8 | 6 | 0 | 1 |

## Catalogue existant

- **442 mots** avec son direct (`public/audio/lod.json`) : 442 contrôlés, lemme LOD identique au mot affiché ; aucune incohérence.
- Les 442 associations sont conservées telles quelles pendant cette phase.

## Expressions de plusieurs mots (analyse séparée)

211 cartes sont des expressions de plusieurs mots. Elles relèvent des phrases exactes ou contextuelles (SPEC 69–72),
pas des lemmes : 55 ont déjà un son de phrase disponible, 156 n'en ont pas.
Les 4 refus « sens différent » du rapport précédent (Dat sinn (ce sont) ; Still (des chaises) ; Becheren (des gobelets) ; gemaach (fait)) sont repris ci-dessous dans le détail des mots isolés.

---

## 1. Sons exacts sûrs (10)

| Texte LuxApp | Traduction | Leçons · sections | Entrée LOD | Graphie | Fichier |
|---|---|---|---|---|---|
| d'Elteren | les parents | A1.2 L23 · cours | Elteren (`ELTEREN1`, SUBST) | contrôlée | ELTEREN1.mp3 |
| de Brudder (pl. d'Bridder) | le frère | A1.2 L23 · cours | Brudder (`BRUDDER1`, SUBST) | contrôlée | BRUDDER1.mp3 (déjà dans le dépôt) |
| d'Geschwëster | les frères et sœurs | A1.2 L23 · cours | Geschwëster (`GESCHWESTER1`, SUBST) | contrôlée | GESCHWESTER1.mp3 |
| d'Meedchen (neutre) | la (jeune) fille | A1.2 L23 · cours | Meedchen (`MEEDCHEN1`, SUBST) | contrôlée | MEEDCHEN1.mp3 (déjà dans le dépôt) |
| de Grousspapp (fam. de Bopa/Bopi) | le grand-père | A1.2 L23 · cours | Grousspapp (`GROUSSPAPP1`, SUBST) | contrôlée | GROUSSPAPP1.mp3 (déjà dans le dépôt) |
| d'Groussmamm (fam. d'Boma/Bomi) | la grand-mère | A1.2 L23 · cours | Groussmamm (`GROUSSMAMM1`, SUBST) | contrôlée | GROUSSMAMM1.mp3 (déjà dans le dépôt) |
| d'Grousselteren | les grands-parents | A1.2 L23 · cours | Grousselteren (`GROUSSELTEREN1`, SUBST) | contrôlée | GROUSSELTEREN1.mp3 |
| d'Niess (pl. d'Niessen) | la nièce | A1.2 L23 · cours | Niess (`NIESS1`, SUBST) | contrôlée | NIESS1.mp3 (déjà dans le dépôt) |
| d'Enkelkand (neutre) | le petit-enfant | A1.2 L23 · cours | Enkelkand (`ENKELKAND1`, SUBST) | contrôlée | ENKELKAND1.mp3 (déjà dans le dépôt) |
| d'Reunioun | la réunion | A1.2 L24 · cours | Reunioun (`REUNIOUN1`, SUBST) | contrôlée | REUNIOUN1.mp3 |

## 2. Sons exacts à valider (42)

| Texte LuxApp | Traduction | Leçons · sections | Entrée LOD | Pourquoi relire |
|---|---|---|---|---|
| Awuer! | Au revoir | A1.1 L1 · tableau | Awuer (`AWUER1`, SUBST) | variante de « Awar » ; traduction lue dans un tableau |
| den | — | A1.1 L3 · tableau | den (`DEN1`, ART) | sens non vérifiable (cellule de tableau sans traduction) |
| eenandrësseg | — | A1.1 L5 · tableau | eenandrësseg (`EENANDRESSEG1`, NB) | sens non vérifiable (cellule de tableau sans traduction) |
| eenafofzeg | — | A1.1 L5 · tableau | eenafofzeg (`EENAFOFZEG1`, NB) | sens non vérifiable (cellule de tableau sans traduction) |
| eenasiechzeg | — | A1.1 L5 · tableau | eenasiechzeg (`EENASIECHZEG1`, NB) | sens non vérifiable (cellule de tableau sans traduction) ; variante de « eenasechzeg » |
| eenasiwwenzeg | — | A1.1 L5 · tableau | eenasiwwenzeg (`EENASIWWENZEG1`, NB) | sens non vérifiable (cellule de tableau sans traduction) |
| eenannonzeg | — | A1.1 L5 · tableau | eenannonzeg (`EENANNONZEG1`, NB) | sens non vérifiable (cellule de tableau sans traduction) |
| eng Posch | — | A1.1 L6 · tableau | Posch (`POSCH1`, SUBST) | sens non vérifiable (cellule de tableau sans traduction) |
| eng Mauer | — | A1.1 L6 · tableau | Mauer (`MAUER1`, SUBST) | sens non vérifiable (cellule de tableau sans traduction) |
| iessen | — | A1.1 L16, A1.2 L24 · tableau | iessen (`IESSEN3`, VRB) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : IESSEN1 |
| un | à / contre (en contact avec) | A1.2 L20 · cours | un (`UN1`, PREP) | homographes : UN2 |
| widdert | contre (appuyé contre) | A1.2 L20 · cours | widdert (`WIDDERT1`, PREP) | variante de « widder » |
| ech | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | ech (`ECH1`, PRON) | sens non vérifiable (cellule de tableau sans traduction) |
| maachen | — | A1.2 L22, A1.2 L24 · tableau | maachen (`MAACHEN1`, VRB) | sens non vérifiable (cellule de tableau sans traduction) |
| spillen | — | A1.2 L22, A1.2 L24 · tableau | spillen (`SPILLEN1`, VRB) | sens non vérifiable (cellule de tableau sans traduction) |
| fueren | aller en ville | A1.2 L22, A1.2 L24 · tableau | fueren (`FUEREN1`, VRB) | traduction lue dans un tableau |
| hien | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | hien (`HIEN1`, PRON) | sens non vérifiable (cellule de tableau sans traduction) |
| hatt | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | hatt (`HATT2`, PRON) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : HATT1 |
| mir | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | mir (`MIR1`, PRON) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : MIR2 |
| dir | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | dir (`DIR1`, PRON) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : DIR2, DIR3 |
| Dir | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | Dir (`DIR3`, PRON) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : DIR1, DIR2 |
| deng | — | A1.2 L23 · tableau | deng (`DENG2`, PRON) | sens non vérifiable (cellule de tableau sans traduction) |
| hiert | — | A1.2 L23 · tableau | hiert (`HIERT2`, PRON) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : HIERT1 |
| eis | — | A1.2 L23 · tableau | eis (`EIS1`, PRON) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : EIS2, EIS3 |
| eist | — | A1.2 L23 · tableau | eist (`EIST1`, PRON) | sens non vérifiable (cellule de tableau sans traduction) |
| Är | — | A1.2 L23 · tableau | Är (`AR3`, PRON) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : AR2 |
| Äert | — | A1.2 L23 · tableau | Äert (`AERT2`, PRON) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : AERT1 |
| trëppelen | — | A1.2 L24 · tableau | trëppelen (`TREPPELEN2`, VRB) | sens non vérifiable (cellule de tableau sans traduction) |
| lafen | — | A1.2 L24 · tableau | lafen (`LAFEN1`, VRB) | sens non vérifiable (cellule de tableau sans traduction) |
| falen | — | A1.2 L24 · tableau | falen (`FALEN1`, VRB) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : FALEN2 |
| opstoen | — | A1.2 L24 · tableau | opstoen (`OPSTOEN2`, VRB) | sens non vérifiable (cellule de tableau sans traduction) |
| drénken | — | A1.2 L24 · tableau | drénken (`DRENKEN1`, VRB) | sens non vérifiable (cellule de tableau sans traduction) |
| wunnen | — | A1.2 L24 · tableau | wunnen (`WUNNEN1`, VRB) | sens non vérifiable (cellule de tableau sans traduction) |
| kucken | — | A1.2 L24 · tableau | kucken (`KUCKEN1`, VRB) | sens non vérifiable (cellule de tableau sans traduction) |
| lauschteren | — | A1.2 L24 · tableau | lauschteren (`LAUSCHTEREN1`, VRB) | sens non vérifiable (cellule de tableau sans traduction) |
| en Akafskuerf | un panier à provisions | A1.2 L25 · tableau | Akafskuerf (`AKAFSKUERF1`, SUBST) | traduction lue dans un tableau |
| en Apel | — | A1.2 L25 · tableau | Apel (`APEL1`, SUBST) | sens non vérifiable (cellule de tableau sans traduction) |
| eng Gromper | — | A1.2 L25 · tableau | Gromper (`GROMPER1`, SUBST) | sens non vérifiable (cellule de tableau sans traduction) |
| eng Aprikos | — | A1.2 L25 · tableau | Aprikos (`APRIKOS1`, SUBST) | sens non vérifiable (cellule de tableau sans traduction) |
| e Sekretär | — | A1.2 L26 · tableau | Sekretär (`SEKRETAR1`, SUBST) | sens non vérifiable (cellule de tableau sans traduction) |
| sinn | — | A1.2 L27 · tableau | sinn (`SINN1`, VRB) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : SINN2 |
| hunn | — | A1.2 L27 · tableau | hunn (`HUNN1`, VRB) | sens non vérifiable (cellule de tableau sans traduction) ; homographes : HUNN2, HUNN3 |

### Lemme identique sans fichier disponible

| Texte LuxApp | Entrée LOD | Fichier |
|---|---|---|
| ganzdaags | ganzdaags (`GANZDAAGS1`, ADV) | absent du miroir (404) ; enregistrement annoncé par l'index de recherche (audio="true") : à récupérer sur lod.lu |

## 3. Formes fléchies : pas de son exact, audio contextuel possible (90)

Le MP3 d'une entrée prononce son lemme (« Kand »), jamais le pluriel ou le participe affiché (« Kanner »). Ces formes n'auront pas de son direct.
Une phrase de la même entrée qui prononce exactement la forme est proposée quand elle existe ; **chaque proposition doit être relue** (sens, idiomatisme, niveau).

| Texte LuxApp | Traduction | Leçons · sections | Entrée LOD | Analyse retenue (autres) | Graphie | Phrase candidate |
|---|---|---|---|---|---|---|
| Entschëllegt! | Excusez-moi ! | A1.1 L1 · cartes, cours | entschëllegen (`ENTSCHELLEGEN1`, VRB) | impératif (formule de politesse) (participe passé, impératif (table), participe passé (table), présent (table)) | contrôlée | « Entschëllegt den Derangement, wannechgelift! » (A2, à vérifier (Termux)) |
| kee | pas un (après e) | A1.1 L2, A1.1 L8, A1.1 L11 · cartes, tableau, cours | keen (`KEEN1`, PRON) | variante règle du n | contrôlée (règle du n) | « Kee vun hire Bouwen daacht eppes » (A1, à vérifier (Termux)) |
| zwou | 2 (féminin) | A1.1 L5, A1.1 L15, A1.2 L20 · cartes, cours | zwee (`ZWEE2`, NB) | forme déclinée (table) | contrôlée | « Fir déi Distanz brauchs de ongeféier zwou Stonnen » (—, à vérifier (Termux)) |
| e bësse | un peu | A1.1 L9 · cartes, cours | bëssen (`BESSEN1`, PRON) | variante règle du n | contrôlée (règle du n) | « Ass dat net e bësse vill verlaangt? » (A1, à vérifier (Termux)) |
| schwätz | — | A1.1 L9 · tableau | schwätzen (`SCHWATZEN1`, VRB) | présent (table) (impératif (table)) | contrôlée | « Schwätz dach kee Kabes! » (A1, à vérifier (Termux)) |
| schwätzt | — | A1.1 L9 · tableau | schwätzen (`SCHWATZEN1`, VRB) | présent (table) (impératif (table)) | contrôlée | « Mäi Monni schwätzt fléissend véier Sproochen » (A1, à vérifier (Termux)) |
| gescheet | divorcé(e) | A1.1 L13 · cartes, cours, tableau | scheeden (`SCHEEDEN1`, VRB) | participe passé | contrôlée | — |
| getrennt | séparé(e) | A1.1 L13 · cartes, cours, tableau | trennen (`TRENNEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « Wéi gëtt dat Wuert richteg getrennt? » (—, à vérifier (Termux)) |
| gepacst | pacsé(e) | A1.1 L13 · cartes, cours, tableau | pacsen (`PACSEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « De Buergermeeschter huet d'Koppel gepacst » (A1, à vérifier (Termux)) |
| Kanner | des enfants | A1.1 L13 · cartes, cours, tableau | Kand (`KAND1`, SUBST) | pluriel | contrôlée | « Aus Kanner gëtt Leit » (A1, à vérifier (Termux)) |
| Jongen | des garçons | A1.1 L13 · cartes, cours, tableau | Jong (`JONG1`, SUBST) | pluriel | contrôlée | « Mir hu just zwee Jongen an der Klass » (A1, téléchargé) |
| Meedercher | des filles | A1.1 L13 · cartes, cours, tableau | Meedchen (`MEEDCHEN1`, SUBST) | pluriel | contrôlée | « Deen ale Jonggesell geet ëmmer nach bei d'Meedercher » (A1, à vérifier (Termux)) |
| gebuer | né(e) | A1.1 L14 · cartes, cours | gebieren (`GEBIEREN1`, VRB) | participe passé | contrôlée | « Hie gouf op Niklosdag gebuer » (A1, à vérifier (Termux)) |
| éischte | le 1er (ordinal) | A1.1 L14 · cartes, cours, tableau | éischt (`EISCHT1`, NB) | graphie de l'index de recherche (contrôlée (règle du n)) | contrôlée (règle du n) | « Ech gi just bis op den éischte Stack, wéinst menger braucht Der de Lift net ze ruffen » (A2, à vérifier (Termux)) |
| dräizéngte | le 13 (ordinal) | A1.1 L14 · cartes, cours, tableau | dräizéngt (`DRAIZENGT1`, NB) | graphie de l'index de recherche (contrôlée (règle du n)) | contrôlée (règle du n) | « Mäi Büro ass um dräizéngte Stack » (—, à vérifier (Termux)) |
| uechtzéngte | le 18 (ordinal) | A1.1 L14 · cartes, cours, tableau | uechtzéngt (`UECHTZENGT1`, NB) | graphie de l'index de recherche (contrôlée (règle du n)) | contrôlée (règle du n) | « Eist Appartement ass um uechtzéngte Stack » (—, à vérifier (Termux)) |
| véieranzwanzegste | le 24 (ordinal) | A1.1 L14 · cartes, cours, tableau | véieranzwanzegst (`VEIERANZWANZEGST1`, NB) | graphie de l'index de recherche (contrôlée (règle du n)) | contrôlée (règle du n) | « Eréischt beim véieranzwanzegste Versuch ass d'Experiment perfekt gelongen » (—, à vérifier (Termux)) |
| zweeten | — | A1.1 L14 · tableau | zweet (`ZWEET1`, NB) | forme déclinée (table) | contrôlée | — |
| drëtte | — | A1.1 L14 · tableau | drëtt (`DRETT1`, NB) | graphie de l'index de recherche (contrôlée (règle du n)) | contrôlée (règle du n) | — |
| fënnefte | — | A1.1 L14 · tableau | fënneft (`FENNEFT1`, NB) | graphie de l'index de recherche (contrôlée (règle du n)) | contrôlée (règle du n) | — |
| zéngte | — | A1.1 L14 · tableau | zéngt (`ZENGT1`, NB) | graphie de l'index de recherche (contrôlée (règle du n)) | contrôlée (règle du n) | — |
| zwanzegsten | — | A1.1 L14 · tableau | zwanzegst (`ZWANZEGST1`, NB) | forme déclinée (table) | contrôlée | « Säi Gebuertsdag ass den zwanzegsten Oktober » (—, à vérifier (Termux)) |
| eenanzwanzegsten | — | A1.1 L14 · tableau | eenanzwanzegst (`EENANZWANZEGST1`, NB) | forme déclinée (table) | contrôlée | — |
| hallwer | demie (heure) | A1.1 L15 · cartes, cours | hallef (`HALLEF1`, ADJ) | forme déclinée (table) | contrôlée | « O vreck, ass et schonn hallwer dräi! » (A1, téléchargé) |
| Këschten | des boîtes | A1.2 L20 · cartes, cours | Këscht (`KESCHT1`, SUBST) | pluriel | contrôlée | « Mir mussen nach d'Këschten ausraumen » (A2, à vérifier (Termux)) |
| Glieser | des verres | A1.2 L21 · cartes, tableau | Glas (`GLAS1`, SUBST) | pluriel | contrôlée | « Beim Spullen hunn ech zwee Glieser gebrach » (A1, téléchargé) |
| Still | des chaises | A1.2 L21 · cartes, tableau | Stull (`STULL1`, SUBST) | pluriel | contrôlée | « Ech sëtzen tëschent zwee Still » (A1, à vérifier (Termux)) |
| Handdicher | des serviettes | A1.2 L21 · cartes, tableau | Handduch (`HANDDUCH1`, SUBST) | pluriel | contrôlée | « Hëllefs de mer, d'Handdicher falen? » (—, à vérifier (Termux)) |
| Biller | des images / tableaux | A1.2 L21 · cartes, tableau | Bild (`BILD1`, SUBST) | pluriel | contrôlée | « Du schwätz a Biller » (A2, à vérifier (Termux)) |
| Telleren | des assiettes | A1.2 L21 · cartes, tableau | Teller (`TELLER1`, SUBST) | pluriel | contrôlée | « Huel der e Kichenduch an dréchen d'Telleren of! » (A2, à vérifier (Termux)) |
| Becheren | des gobelets | A1.2 L21 · cartes, tableau | Becher (`BECHER1`, SUBST) | pluriel | contrôlée | « Um Camping drénke mir aus plastiks Becheren » (—, à vérifier (Termux)) |
| gees | — | A1.2 L22 · tableau | goen (`GOEN1`, VRB) | présent (table) | contrôlée | « Wann s de net gees! » (A1, à vérifier (Termux)) |
| méchs | — | A1.2 L22 · tableau | maachen (`MAACHEN1`, VRB) | présent (table) | contrôlée | « Du méchs dat! » (A1, à vérifier (Termux)) |
| spills | — | A1.2 L22 · tableau | spillen (`SPILLEN1`, VRB) | présent (table) | contrôlée | — |
| fiers | — | A1.2 L22 · tableau | fueren (`FUEREN1`, VRB) | présent (table) | contrôlée | « Schalt de Stroum aus, ier s de mat der Zaang un de Kabel fiers! » (A1, à vérifier (Termux)) |
| geet | — | A1.2 L22 · tableau | goen (`GOEN1`, VRB) | présent (table) | contrôlée | « Elo geet et an d'Bett! » (A1, à vérifier (Termux)) |
| mécht | — | A1.2 L22 · tableau | maachen (`MAACHEN1`, VRB) | présent (table) | contrôlée | « Dat mécht näischt! » (A1, à vérifier (Termux)) |
| spillt | — | A1.2 L22 · tableau | spillen (`SPILLEN1`, VRB) | présent (table) (impératif (table)) | contrôlée | « Wie spillt an deem neien Actionfilm? » (A1, à vérifier (Termux)) |
| fiert | — | A1.2 L22 · tableau | fueren (`FUEREN1`, VRB) | présent (table) | contrôlée | « Mäi Mann fiert um Bus » (A1, à vérifier (Termux)) |
| maacht | — | A1.2 L22 · tableau | maachen (`MAACHEN1`, VRB) | présent (table) (impératif (table)) | contrôlée | « Maacht mer e puer Tranchen Ham! » (A1, à vérifier (Termux)) |
| fuert | — | A1.2 L22 · tableau | fueren (`FUEREN1`, VRB) | présent (table) (impératif (table)) | contrôlée | — |
| d'Kanner | les enfants | A1.2 L23 · cours | Kand (`KAND1`, SUBST) | pluriel | contrôlée | « Aus Kanner gëtt Leit » (A1, à vérifier (Termux)) |
| d'Enkelkanner | les petits-enfants | A1.2 L23 · cours | Enkelkand (`ENKELKAND1`, SUBST) | pluriel | contrôlée | « D'Enkelkanner hunn hirem Grousspapp gehollef, d'Gromperen erauszehuelen » (—, à vérifier (Termux)) |
| mäi | — | A1.2 L23 · tableau | mäin (`MAIN1`, PRON) | variante règle du n | contrôlée (règle du n) | « Mäi Brudder ass e lëschtege Kärel » (—, à vérifier (Termux)) |
| däi | — | A1.2 L23 · tableau | däin (`DAIN1`, PRON) | variante règle du n | contrôlée (règle du n) | « Du muss däi Passwuert aginn, fir dech anzeloggen » (A2, à vérifier (Termux)) |
| säi | — | A1.2 L23 · tableau | säin (`SAIN1`, PRON) | variante règle du n | contrôlée (règle du n) | « D'Meedchen huet säi Schlëssel verluer » (A2, à vérifier (Termux)) |
| hire | — | A1.2 L23 · tableau | hiren (`HIREN1`, PRON) | variante règle du n | contrôlée (règle du n) | « Si ënnerstëtzen hire Jong finanziell » (—, à vérifier (Termux)) |
| Äre | — | A1.2 L23 · tableau | Ären (`AREN2`, PRON) | variante règle du n | contrôlée (règle du n) | « Sot wannechgelift Äre Mataarbechter Bescheed! » (—, à vérifier (Termux)) |
| gefuer | conduit / allé en véhicule | A1.2 L24 · cartes, cours, tableau | fueren (`FUEREN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « De Chauffer ass en Ëmwee gefuer » (A1, à vérifier (Termux)) |
| gaangen | allé à pied | A1.2 L24 · cartes, cours, tableau | goen (`GOEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « D'Fest ass bis mueres fréi gaangen » (A1, à vérifier (Termux)) |
| heemgaangen | rentré chez soi | A1.2 L24 · cartes, cours, tableau | heemgoen (`HEEMGOEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « Meng Kolleegin ass fréi heemgaangen, well se de Kapp wéi hat » (—, à vérifier (Termux)) |
| erausgaangen | sorti | A1.2 L24 · cartes, cours, tableau | erausgoen (`ERAUSGOEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « De Communiqué ass nach net erausgaangen » (A2, à vérifier (Termux)) |
| erwächt | réveillé | A1.2 L24 · cartes, cours, tableau | erwächen (`ERWACHEN1`, VRB) | participe passé (impératif (table), participe passé (table), présent (table)) | contrôlée | « Ech sinn hënt zweemol erwächt » (A1, à vérifier (Termux)) |
| opgestanen | levé | A1.2 L24 · cartes, cours, tableau | opstoen (`OPSTOEN2`, VRB) | participe passé (participe passé (table)) | contrôlée | « Ech war elo dräi Woche krank, haut sinn ech fir d'éischt erëm opgestanen » (A1, à vérifier (Termux)) |
| gelaf | couru | A1.2 L24 · cartes, cours, tableau | lafen (`LAFEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « D'Saach ass gelaf! » (A1, à vérifier (Termux)) |
| gefall | tombé | A1.2 L24 · cartes, cours, tableau | falen (`FALEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « Hënt ass Schnéi gefall » (A2, à vérifier (Termux)) |
| getrëppelt | marché | A1.2 L24 · cartes, cours, tableau | trëppelen (`TREPPELEN2`, VRB) | participe passé (participe passé (table)) | contrôlée | « Du bass him ellen op d'Féiss getrëppelt! » (A2, à vérifier (Termux)) |
| giess | mangé | A1.2 L24 · cartes, cours, tableau | iessen (`IESSEN3`, VRB) | participe passé (participe passé (table)) | contrôlée | — |
| gedronk | bu | A1.2 L24 · cartes, cours, tableau | drénken (`DRENKEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « Ech hunn nach kee Kaffi gedronk » (A1, à vérifier (Termux)) |
| geschafft | travaillé | A1.2 L24 · cartes, cours, tableau | schaffen (`SCHAFFEN3`, VRB) | participe passé (participe passé (table)) | contrôlée | « D'Aarbechter hu séier an effikass geschafft » (A1, à vérifier (Termux)) |
| geschlof | dormi | A1.2 L24 · cartes, cours, tableau | schlofen (`SCHLOFEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « Deen huet net gutt geschlof » (A1, à vérifier (Termux)) |
| geschriwwen | écrit | A1.2 L24 · cartes, cours, tableau | schreiwen (`SCHREIWEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « D'Haus ass op mech geschriwwen » (A1, à vérifier (Termux)) |
| gemaach | fait | A1.2 L24 · cartes, cours, tableau | maachen (`MAACHEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « Ech hunn näischt gemaach! » (A1, à vérifier (Termux)) |
| geduscht | douché | A1.2 L24 · cartes, cours, tableau | duschen (`DUSCHEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | — |
| telefonéiert | téléphoné | A1.2 L24 · cartes, cours, tableau | telefonéieren (`TELEFONEIEREN1`, VRB) | participe passé (impératif (table), participe passé (table), présent (table)) | contrôlée | « De Monni huet sengem Neveu telefonéiert, fir him ze gratuléieren » (A1, à vérifier (Termux)) |
| gewunnt | habité | A1.2 L24 · cartes, cours, tableau | wunnen (`WUNNEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | — |
| gekuckt | regardé | A1.2 L24 · cartes, cours, tableau | kucken (`KUCKEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « Hues de schonn op d'Auer gekuckt? » (A1, à vérifier (Termux)) |
| gespillt | — | A1.2 L24 · tableau | spillen (`SPILLEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « Ech hunn nach ni Theater gespillt » (A1, à vérifier (Termux)) |
| gekacht | — | A1.2 L24 · tableau | kachen (`KACHEN2`, VRB) | participe passé (participe passé (table)) | contrôlée | « Du hues d'Nuddelen eng Grimmel ze laang gekacht » (A1, à vérifier (Termux)) |
| gelies | — | A1.2 L24 · tableau | liesen (`LIESEN1`, VRB) | participe passé (participe passé (table)) | contrôlée | — |
| gelauschtert | — | A1.2 L24 · tableau | lauschteren (`LAUSCHTEREN1`, VRB) | participe passé (participe passé (table)) | contrôlée | « Hues du de Moien de Radio gelauschtert? » (A1, à vérifier (Termux)) |
| war | — | A1.2 L24 · tableau | sinn (`SINN1`, VRB) | prétérit (table) | contrôlée | « Villes, wat war, ass net méi » (A1, à vérifier (Termux)) |
| waars | — | A1.2 L24 · tableau | sinn (`SINN1`, VRB) | prétérit (table) | contrôlée | « Wéi ech éinescht bei der laanschtkoum, waars de net doheem » (A1, à vérifier (Termux)) |
| has | — | A1.2 L24 · tableau | hunn (`HUNN1`, VRB) | prétérit (table) | contrôlée | — |
| waren | — | A1.2 L24 · tableau | sinn (`SINN1`, VRB) | prétérit (table) | contrôlée | — |
| haten | — | A1.2 L24 · tableau | hunn (`HUNN1`, VRB) | prétérit (table) | contrôlée | « Si haten hir Kanner bei sech » (A1, à vérifier (Termux)) |
| Äppel | des pommes | A1.2 L25 · cartes, cours, tableau | Apel (`APEL1`, SUBST) | pluriel | contrôlée | « Du vergläichs Äppel a Bieren » (A1, à vérifier (Termux)) |
| Bieren | des poires | A1.2 L25 · cartes, cours, tableau | Bier (`BIER3`, SUBST) | pluriel | contrôlée | « Du vergläichs Äppel a Bieren » (A1, à vérifier (Termux)) |
| Gromperen | pommes de terre | A1.2 L25 · cartes, cours, tableau | Gromper (`GROMPER1`, SUBST) | pluriel | contrôlée | « Ech hunn am léifste gebootschte Gromperen » (A1, à vérifier (Termux)) |
| Aprikosen | abricots | A1.2 L25 · cartes, cours, tableau | Aprikos (`APRIKOS1`, SUBST) | pluriel | contrôlée | — |
| d'Kenntnesser | connaissances | A1.2 L26 · cartes, cours, tableau | Kenntnes (`KENNTNES1`, SUBST) | pluriel | contrôlée | — |
| viru | avant | A1.2 L26 · cartes, cours | virun (`VIRUN1`, PREP) | variante règle du n | contrôlée (règle du n) | « Hie louch am Klassement viru mir » (A2, à vérifier (Termux)) |
| Kenntnesser | connaissances | A1.2 L26 · tableau | Kenntnes (`KENNTNES1`, SUBST) | pluriel | contrôlée | — |
| Sproochen | — | A1.2 L26 · tableau | Sprooch (`SPROOCH1`, SUBST) | pluriel | contrôlée | « Dësen Dolmetscher schwätzt siwe Sproochen » (A1, à vérifier (Termux)) |
| bass | — | A1.2 L27 · tableau | sinn (`SINN1`, VRB) | présent (table) | contrôlée | « Wou bass de? » (A1, à vérifier (Termux)) |
| hues | — | A1.2 L27 · tableau | hunn (`HUNN1`, VRB) | présent (table) | contrôlée | « Du hues hei ze follegen! » (A1, à vérifier (Termux)) |
| ass | — | A1.2 L27 · tableau | sinn (`SINN1`, VRB) | présent (table) | contrôlée | « Et ass Fréijoer! » (A1, à vérifier (Termux)) |
| huet | — | A1.2 L27 · tableau | hunn (`HUNN1`, VRB) | présent (table) | contrôlée | « Hien huet 36 Joer » (A1, à vérifier (Termux)) |
| sidd | — | A1.2 L27 · tableau | sinn (`SINN1`, VRB) | présent (table) (impératif (table)) | contrôlée | « Aus wat fir engem Land sidd Dir? » (A1, à vérifier (Termux)) |
| hutt | — | A1.2 L27 · tableau | hunn (`HUNN1`, VRB) | présent (table) (impératif (table)) | contrôlée | « Hutt Dir Äre Fürerschäi bei Iech? » (A1, à vérifier (Termux)) |

## 4. Graphies à vérifier (10) — aucun remplacement automatique

| Texte LuxApp | Traduction | Constat | Graphie LOD proposée | Décision proposée | Emplois dans LuxApp |
|---|---|---|---|---|---|
| aachtzeg | 80 | LuxApp « aachtzeg » ; LOD : « achtzeg » ou « aachten » ou « aachter » | achtzeg (`ACHTZEG1`, NB) — contrôlée | Vérifier l'orthographe : si « achtzeg » est retenu, corriger la leçon ; son exact alors disponible (ACHTZEG1.mp3, disponible) | — |
| eenanaachtzeg | — | LuxApp « eenanaachtzeg » ; LOD : « eenanachtzeg » ou « eenanuechtzeg » | eenanachtzeg (`EENANACHTZEG1`, NB) — contrôlée | Vérifier l'orthographe : si « eenanachtzeg » est retenu, corriger la leçon ; son exact alors disponible (EENANACHTZEG1.mp3, disponible) | — |
| Italiener | Italien | graphie fautive selon le LOD ; standard : « Italieener » | Italieener (`ITALIEENER1`, SUBST) — contrôlée | Corriger en « Italieener » si validé ; son exact alors disponible (ITALIEENER1.mp3, disponible) | A1.1 L8 : « Hien ass Italiener. »<br>A1.1 L8 : « Ech sinn Italiener. »<br>A1.2 L27 : « Nee, ech sinn Italiener. »<br>A1.2 L27 : « Sidd dir zwee Italiener? » |
| Fransousin | Française | LuxApp « fransousin » ; LOD : « Franséisin » | Franséisin (`FRANSEISIN1`, SUBST) — contrôlée | Vérifier l'orthographe : si « Franséisin » est retenu, corriger la leçon ; son exact alors disponible (FRANSEISIN1.mp3, disponible) | A1.1 L8 : « Ass d'Julie och Fransousin? »<br>A1.1 L8 : « Nee, si ass keng Fransousin. Si ass Belsch. »<br>A1.1 L8 : « Ech si Fransousin. »<br>A1.1 L8 : « Nee, si ass keng Fransousin. » |
| Italienerin | Italienne | graphie fautive selon le LOD ; standard : « Italieenerin » | Italieenerin (`ITALIEENERIN1`, SUBST) — contrôlée | Corriger en « Italieenerin » si validé ; son exact alors disponible (ITALIEENERIN1.mp3, disponible) | A1.1 L8 : « Si ass Italienerin. »<br>A1.1 L8 : « Ech sinn Italienerin. »<br>A1.1 L8 : « Nee, si ass keng Italienerin. » |
| Italienesch | italien | graphie fautive selon le LOD ; standard : « italieenesch » | italieenesch (`ITALIEENESCH1`, ADJ) — contrôlée | Corriger en « italieenesch » si validé ; son exact alors disponible (ITALIEENESCH1.mp3, disponible) | — |
| Kirchberg | Kirchberg | LuxApp « kirchberg » ; LOD : « Kierchbierg » | Kierchbierg (`KIERCHBIERG1`, NP) — contrôlée | Nom propre : « Kirchberg » est aussi la forme officielle (français / allemand) ; la forme luxembourgeoise est « Kierchbierg ». Examiner chaque contexte avant de remplacer | A1.1 L10 : « Si wunnt um Kirchberg. »<br>A1.1 L10 : « Ech wunnen um Kirchberg. » |
| verlobt | fiancé(e) | LuxApp « verlobt » ; LOD : « verloobt » | verloben (`VERLOBEN1`, VRB) — contrôlée | Vérifier l'orthographe : si « verloobt » est retenu, corriger la leçon ; participe passé de « verloben » : pas de son direct (le MP3 prononce « verloben »), audio contextuel possible | A1.1 L13 : « Nee, ech si verlobt. » |
| Kommod | une commode | LuxApp « kommod » ; LOD : « Komoud » | Komoud (`KOMOUD1`, SUBST) — contrôlée | Vérifier l'orthographe : si « Komoud » est retenu, corriger la leçon ; son exact alors disponible (KOMOUD1.mp3, disponible) | A1.2 L21 : « D'Planz ass op der Kommod. »<br>A1.2 L21 : « eng Kommod » |
| eng Kommod | une commode | LuxApp « kommod » ; LOD : « Komoud » | Komoud (`KOMOUD1`, SUBST) — contrôlée | Vérifier l'orthographe : si « Komoud » est retenu, corriger la leçon ; son exact alors disponible (KOMOUD1.mp3, disponible) | A1.2 L21 : « D'Planz ass op der Kommod. »<br>A1.2 L21 : « eng Kommod » |

## 5. Sens ambigu (15)

| Texte LuxApp | Traduction | Leçons · sections | Candidats | Pourquoi |
|---|---|---|---|---|
| e | — | A1.1 L2 · tableau | en `EN1` PRON, en `EN2` ART | Pas de traduction dans le tableau pour départager 2 entrées. |
| de | — | A1.1 L3 · tableau | de `DE1` PRON, den `DEN1` ART | Pas de traduction dans le tableau pour départager 2 entrées. |
| a | — | A1.1 L5, A1.1 L10 · tableau | a `A2` INTERJ, an `AN2` CONJ, an `AN3` PREP, an `AN4` ADV | Pas de traduction dans le tableau pour départager 5 entrées. |
| Dat sinn | ce sont | A1.1 L6 · cartes | sinn `SINN1` VRB, sinn `SINN2` VRB | Forme trouvée mais aucun sens LOD ne correspond à « ce sont ». |
| um | — | A1.1 L10 · tableau | um `UM1` , um `UM2` PREP, um `UM3`  | Pas de traduction dans le tableau pour départager 3 entrées. |
| enger | — | A1.1 L12 · tableau | een `EEN2` NB, enger `ENGER1` ART, enger `ENGER2` PRON | Pas de traduction dans le tableau pour départager 3 entrées. |
| engem | — | A1.1 L12 · tableau | een `EEN2` NB, engem `ENGEM1` ART, engem `ENGEM2` PRON | Pas de traduction dans le tableau pour départager 3 entrées. |
| ginn | — | A1.2 L22 · tableau | ginn `GINN1` VRB, ginn `GINN2` VRB, ginn `GINN3` VRB, ginn `GINN4` VRB | Pas de traduction dans le tableau pour départager 5 entrées. |
| du | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | du `DU1` ADV, du `DU2` PRON | Pas de traduction dans le tableau pour départager 2 entrées. |
| gitt | — | A1.2 L22 · tableau | ginn `GINN1` VRB, ginn `GINN2` VRB, ginn `GINN3` VRB, goen `GOEN1` VRB | Pas de traduction dans le tableau pour départager 4 entrées. |
| meng | — | A1.2 L23 · tableau | meng `MENG1` PRON, mengen `MENGEN1` VRB | Pas de traduction dans le tableau pour départager 2 entrées. |
| eise | — | A1.2 L23 · tableau | eisen `EISEN3` PRON, eisen `EISEN4` ADJ | Pas de traduction dans le tableau pour départager 2 entrées. |
| hat | — | A1.2 L24 · tableau | haen `HAEN1` VRB, hunn `HUNN1` VRB, hunn `HUNN3` VRB | Pas de traduction dans le tableau pour départager 3 entrées. |
| waart | — | A1.2 L24 · tableau | sinn `SINN1` VRB, sinn `SINN2` VRB, waarden `WAARDEN1` VRB | Pas de traduction dans le tableau pour départager 3 entrées. |
| eng Bier | — | A1.2 L25 · tableau | Bier `BIER1` SUBST, Bier `BIER2` SUBST, Bier `BIER3` SUBST, Bier `BIER4` SUBST | Pas de traduction dans le tableau pour départager 4 entrées. |

## 6. Pas d'entrée dans les trois sources (15)

| Texte LuxApp | Traduction | Leçons · sections | Constat |
|---|---|---|---|
| Hallo! | Salut ! (familier) | A1.1 L1 · cartes, cours | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. |
| Wollekekrazer | un gratte-ciel | A1.1 L2 · cartes | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. Entrée voisine : Wollek (WOLLEK1). |
| e Wollekekrazer | un gratte-ciel | A1.1 L2 · tableau | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. Entrée voisine : Wollek (WOLLEK1). |
| zweehonnert | 200 | A1.1 L5 · cartes, tableau | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. |
| dräihonnert | 300 | A1.1 L5 · cartes, tableau | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. |
| zweedausend | 2000 | A1.1 L5 · cartes, tableau | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. |
| zéngdausend | 10 000 | A1.1 L5 · cartes, tableau | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. |
| honnerteenanzwanzeg | — | A1.1 L5 · tableau | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. Entrée voisine : honnert (HONNERT1). |
| zweehonnertfofzeg | — | A1.1 L5 · tableau | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. |
| Koreanesch | coréen | A1.1 L9 · cartes, cours | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. |
| leedeg | célibataire (état) | A1.1 L13 · cartes, cours, tableau | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. |
| zweedausendvéier | 2004 | A1.1 L14 · cartes, cours | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. |
| nonzénghonnertsiwenannonzeg | 1997 | A1.1 L14 · tableau | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. Entrée voisine : nonzénghonnert (NONZENGHONNERT1), nonzéng (NONZENG1). |
| Aarbechtsannonce | offre d'emploi | A1.2 L26 · cartes | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. Entrée voisine : Aarbecht (AARBECHT1). |
| eng Aarbechtsannonce | offre d'emploi | A1.2 L26 · cours, tableau | Aucune forme identique dans les articles ni dans les tables ni dans l'index de recherche. Entrée voisine : Aarbecht (AARBECHT1). |
