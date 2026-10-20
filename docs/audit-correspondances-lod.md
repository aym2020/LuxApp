# Audit des correspondances LOD — SPEC 73, phase A

Généré par `node tools/lod/audit-correspondances.js`. **Aucune leçon, association audio ni fichier son n'a été modifié.**
Inventaire complet : `docs/audit-correspondances-lod.json`.

## Sources

| Source | Version | Utilisée | Contenu exploité |
|---|---|---|---|
| Articles LOD (`new_lod-art.xml`) | export 2026-07-27 | oui (33941 entrées) | lemmes, variantes règle du n, pluriels, participes passés, locutions, sens, exemples |
| Tables de flexion (`260727-new-lod-tab.zip`) | 2026-07-27 | oui (9851 tables) | conjugaisons et déclinaisons (verbes et adjectifs) |
| Index de recherche (`260727-new-lod-search.zip`) | 2026-07-27 | **non — téléchargement refusé par le proxy de l'environnement de Claude** | graphies contrôlées (`suggest="true"`) ou générées |
| Miroir MP3 (robertoentringer/lod-mp3-mirror) | 2020-12-18 | oui (requête HEAD par identifiant) | son du lemme |
| Phrases LOD téléchargées (SPEC 72) | 2026-10-20 | oui | enregistrements d'exemples disponibles |

Sans l'index de recherche, les formes retenues viennent uniquement des données éditoriales du LOD (articles et tables) : ce sont des graphies officielles,
mais les mots restés sans entrée sont marqués **provisoires** tant que l'index de recherche n'a pas été consulté.

## Synthèse

183 mots isolés des leçons (cartes, vocabulaire et exemples du cours, cellules de tableaux luxembourgeoises) n'ont pas de son aujourd'hui.

| Correspondance | Nombre |
|---|---:|
| LEMME_EXACT — entrée identique (faux absent ou mot de cours jamais rapproché) | 54 |
| FORME_FLECHIE_VALIDEE — pluriel, participe, forme conjuguée ou déclinée rattachée à une entrée | 83 |
| GRAPHIE_A_VERIFIER | 17 |
| SENS_AMBIGU — forme trouvée, sens ou homographe à départager | 14 |
| PAS_D_ENTREE (provisoire) | 15 |

| Audio (indépendant de la correspondance) | Nombre |
|---|---:|
| SON_EXACT_DISPONIBLE — MP3 du lemme identique présent sur le miroir : **sons directs récupérables** | 53 |
| AUDIO_INDISPONIBLE — lemme identique, mais MP3 absent du miroir | 1 |
| ENTREE_SANS_AUDIO_EXACT — forme attestée, le MP3 de l'entrée prononce le lemme, pas cette forme | 90 |
| CONTEXTE_CANDIDAT — un exemple de la même entrée prononce exactement la forme (relecture requise) | 74 (dont 4 déjà téléchargés) |

**Les 63 « mots absents du LOD » du rapport précédent** :
- LEMME_EXACT : 0
- FORME_FLECHIE_VALIDEE : 41 (Entschëllegt!, kee, zwou, e bësse, gescheet, getrennt, gepacst, Kanner, Jongen, Meedercher, gebuer, hallwer, Këschten, Glieser, Handdicher, Biller, Telleren, gefuer, gaangen, heemgaangen, erausgaangen, erwächt, opgestanen, gelaf, gefall, getrëppelt, giess, gedronk, geschafft, geschlof, geschriwwen, geduscht, telefonéiert, gewunnt, gekuckt, Äppel, Bieren, Gromperen, Aprikosen, d'Kenntnesser, viru)
- GRAPHIE_A_VERIFIER : 12 (aachtzeg, Italiener, Fransousin, Italienerin, Italienesch, Kirchberg, verlobt, éischte, dräizéngte, uechtzéngte, véieranzwanzegste, Kommod)
- SENS_AMBIGU : 0
- PAS_D_ENTREE : 10 (Hallo!, Wollekekrazer, zweehonnert, dräihonnert, zweedausend, zéngdausend, Koreanesch, leedeg, zweedausendvéier, Aarbechtsannonce)


**Les 4 refus « sens différent »** : « Dat sinn » → SENS_AMBIGU ; « Still » → FORME_FLECHIE_VALIDEE (Stull, pluriel) ; « Becheren » → FORME_FLECHIE_VALIDEE (Becher, pluriel) ; « gemaach » → FORME_FLECHIE_VALIDEE (maachen, participe passé).

Le mot « absent » signifiait « lemme absent de notre index », pas « inexistant dans le LOD ».

### Gain de couverture audio estimé (mots isolés)

- Sons directs récupérables (MP3 du miroir, forme exacte) : **+53** mots.
- Audio contextuel possible (forme exacte dans une phrase de la même entrée, après relecture) : **+74** mots ;
  environ 1 enregistrement d'exemple sur 10 manquait sur lod.lu lors du passage SPEC 72, soit ≈ +67 réellement disponibles.
- Les 90 formes fléchies **n'ont pas de son direct** : le MP3 de l'entrée prononce le lemme (règle centrale de la SPEC 73).

### Par leçon

| Leçon | Mots isolés sans son | Son direct récupérable | Contexte candidat | Formes fléchies | Ambigus | Sans entrée |
|---|---:|---:|---:|---:|---:|---:|
| A1.1 L1 | 3 | 1 | 1 | 1 | 0 | 1 |
| A1.1 L2 | 4 | 0 | 1 | 1 | 1 | 2 |
| A1.1 L3 | 2 | 1 | 0 | 0 | 1 | 0 |
| A1.1 L5 | 15 | 5 | 1 | 1 | 1 | 6 |
| A1.1 L6 | 3 | 1 | 0 | 0 | 2 | 0 |
| A1.1 L8 | 4 | 0 | 1 | 1 | 0 | 0 |
| A1.1 L9 | 5 | 0 | 3 | 3 | 0 | 1 |
| A1.1 L10 | 3 | 0 | 0 | 0 | 2 | 0 |
| A1.1 L11 | 1 | 0 | 1 | 1 | 0 | 0 |
| A1.1 L12 | 2 | 0 | 0 | 0 | 2 | 0 |
| A1.1 L13 | 8 | 0 | 5 | 6 | 0 | 1 |
| A1.1 L14 | 13 | 0 | 6 | 4 | 0 | 2 |
| A1.1 L15 | 2 | 0 | 2 | 2 | 0 | 0 |
| A1.1 L16 | 1 | 1 | 0 | 0 | 0 | 0 |
| A1.2 L20 | 4 | 2 | 2 | 2 | 0 | 0 |
| A1.2 L21 | 8 | 0 | 6 | 6 | 0 | 0 |
| A1.2 L22 | 22 | 9 | 8 | 10 | 3 | 0 |
| A1.2 L23 | 24 | 16 | 7 | 7 | 1 | 0 |
| A1.2 L24 | 50 | 19 | 22 | 28 | 3 | 0 |
| A1.2 L25 | 9 | 5 | 3 | 4 | 0 | 0 |
| A1.2 L26 | 8 | 1 | 3 | 4 | 0 | 2 |
| A1.2 L27 | 15 | 8 | 6 | 6 | 1 | 0 |

## Catalogue existant

- **442 mots** avec son direct (`public/audio/lod.json`) : 442 contrôlés, lemme LOD identique au mot affiché ; aucune incohérence.
- Les 442 associations sont conservées telles quelles pendant cette phase.

## Expressions de plusieurs mots (analyse séparée)

211 cartes sont des expressions de plusieurs mots. Elles relèvent des phrases exactes ou contextuelles (SPEC 69–72),
pas des lemmes : 55 ont déjà un son de phrase disponible, 156 n'en ont pas.
Les 4 refus « sens différent » du rapport précédent (Dat sinn (ce sont) ; Still (des chaises) ; Becheren (des gobelets) ; gemaach (fait)) sont repris ci-dessous dans le détail des mots isolés.

## Détail

### Faux absents : lemme LOD identique (54)

| Texte LuxApp | Traduction | Leçons · sections | Entrée LOD | Type | Correspondance | Audio | Justification |
|---|---|---|---|---|---|---|---|
| Awuer! | Au revoir | A1.1 L1 · tableau | Awuer (`AWUER1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique (variante de « Awar »), sens « au revoir, dire au revoir (à), prendre congé (de) ». |
| den | — | A1.1 L3 · tableau | den (`DEN1`, ART) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « le, le, les ». |
| eenandrësseg | — | A1.1 L5 · tableau | eenandrësseg (`EENANDRESSEG1`, NB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « trente et un ». |
| eenafofzeg | — | A1.1 L5 · tableau | eenafofzeg (`EENAFOFZEG1`, NB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « cinquante et un ». |
| eenasiechzeg | — | A1.1 L5 · tableau | eenasiechzeg (`EENASIECHZEG1`, NB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique (variante de « eenasechzeg »), sens « soixante et un ». |
| eenasiwwenzeg | — | A1.1 L5 · tableau | eenasiwwenzeg (`EENASIWWENZEG1`, NB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « soixante et onze ». |
| eenannonzeg | — | A1.1 L5 · tableau | eenannonzeg (`EENANNONZEG1`, NB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « quatre-vingt-onze ». |
| eng Mauer | deux murs | A1.1 L6 · tableau | Mauer (`MAUER1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « mur, séparateur de voie ». |
| iessen | manger | A1.1 L16, A1.2 L24 · tableau | iessen (`IESSEN3`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « manger, manger ». |
| un | à / contre (en contact avec) | A1.2 L20 · cours | un (`UN1`, PREP) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « sur, à, contre, à » ; homographes : UN1, UN2. |
| widdert | contre (appuyé contre) | A1.2 L20 · cours | widdert (`WIDDERT1`, PREP) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique (variante de « widder »), sens « contre ». |
| ech | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | ech (`ECH1`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « je, moi ». |
| maachen | faire | A1.2 L22, A1.2 L24 · tableau | maachen (`MAACHEN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « faire, faire, faire (à partir de), faire ». |
| spillen | jouer | A1.2 L22, A1.2 L24 · tableau | spillen (`SPILLEN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « jouer à, jouer à, jouer, jouer de ». |
| fueren | aller en ville | A1.2 L22, A1.2 L24 · tableau | fueren (`FUEREN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « circuler, traverser, conduire, faire du ». |
| hien | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | hien (`HIEN1`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « il, lui, le, lui ». |
| hatt | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | hatt (`HATT2`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « elle, la ». |
| mir | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | mir (`MIR1`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « nous, nous autres, me, moi » ; homographes : MIR1, MIR2. |
| dir | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | dir (`DIR1`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « vous, vous autres, te, toi » ; homographes : DIR1, DIR2. |
| Dir | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | Dir (`DIR3`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « vous ». |
| d'Elteren | les parents | A1.2 L23 · cours | Elteren (`ELTEREN1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « parents ». |
| de Brudder (pl. d'Bridder) | le frère | A1.2 L23 · cours | Brudder (`BRUDDER1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « frère, frère, type » ; fichier déjà dans le dépôt : seule la clé d'affichage manque. |
| d'Geschwëster | les frères et sœurs | A1.2 L23 · cours | Geschwëster (`GESCHWESTER1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « frères et sœurs ». |
| d'Meedchen (neutre) | la (jeune) fille | A1.2 L23 · cours | Meedchen (`MEEDCHEN1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « fille, fille, filles (légères) » ; fichier déjà dans le dépôt : seule la clé d'affichage manque. |
| de Grousspapp (fam. de Bopa/Bopi) | le grand-père | A1.2 L23 · cours | Grousspapp (`GROUSSPAPP1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « grand-père » ; fichier déjà dans le dépôt : seule la clé d'affichage manque. |
| d'Groussmamm (fam. d'Boma/Bomi) | la grand-mère | A1.2 L23 · cours | Groussmamm (`GROUSSMAMM1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « grand-mère » ; fichier déjà dans le dépôt : seule la clé d'affichage manque. |
| d'Grousselteren | les grands-parents | A1.2 L23 · cours | Grousselteren (`GROUSSELTEREN1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « grands-parents ». |
| d'Niess (pl. d'Niessen) | la nièce | A1.2 L23 · cours | Niess (`NIESS1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « nièce » ; fichier déjà dans le dépôt : seule la clé d'affichage manque. |
| d'Enkelkand (neutre) | le petit-enfant | A1.2 L23 · cours | Enkelkand (`ENKELKAND1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « petit-fils, petite-fille, petit-enfant » ; fichier déjà dans le dépôt : seule la clé d'affichage manque. |
| meng | — | A1.2 L23 · tableau | meng (`MENG1`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « ma, la mienne, ma, la mienne ». |
| deng | — | A1.2 L23 · tableau | deng (`DENG2`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « ta, la tienne, ta, la tienne ». |
| hiert | — | A1.2 L23 · tableau | hiert (`HIERT2`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « son, sa, le sien, la sienne ». |
| eis | — | A1.2 L23 · tableau | eis (`EIS1`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « nous, à nous, nous » ; homographes : EIS1, EIS2, EIS3. |
| eist | — | A1.2 L23 · tableau | eist (`EIST1`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « notre, le nôtre, la nôtre, notre ». |
| Är | — | A1.2 L23 · tableau | Är (`AR3`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « votre, la vôtre, votre, la vôtre ». |
| Äert | — | A1.2 L23 · tableau | Äert (`AERT2`, PRON) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « votre, le vôtre, la vôtre, votre ». |
| trëppelen | marcher | A1.2 L24 · tableau | trëppelen (`TREPPELEN2`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « marcher sur, poser le pied sur, former, blesser ». |
| lafen | courir | A1.2 L24 · tableau | lafen (`LAFEN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « courir, couler, confluer avec, se jeter dans ». |
| falen | tomber | A1.2 L24 · tableau | falen (`FALEN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « tomber, tomber, tomber, tomber » ; homographes : FALEN1, FALEN2. |
| opstoen | se lever | A1.2 L24 · tableau | opstoen (`OPSTOEN2`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « se lever, se mettre debout, se lever, être (bien) calé ». |
| drénken | boire | A1.2 L24 · tableau | drénken (`DRENKEN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « boire, boire, prendre le petit-déjeuner, boire ». |
| wunnen | habiter | A1.2 L24 · tableau | wunnen (`WUNNEN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « habiter, avoir son domicile, résider ». |
| kucken | regarder | A1.2 L24 · tableau | kucken (`KUCKEN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « regarder, regarder, vérifier, regarder ». |
| lauschteren | écouter | A1.2 L24 · tableau | lauschteren (`LAUSCHTEREN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « écouter, écouter, écouter, écouter ». |
| d'Reunioun | la réunion | A1.2 L24 · cours | Reunioun (`REUNIOUN1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « réunion ». |
| en Akafskuerf | un panier à provisions | A1.2 L25 · tableau | Akafskuerf (`AKAFSKUERF1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « panier à provisions, sac à provisions ». |
| en Apel | pomme(s) | A1.2 L25 · tableau | Apel (`APEL1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « pomme ». |
| eng Bier | poire(s) | A1.2 L25 · tableau | Bier (`BIER3`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « poire, ampoule (électrique), caboche » ; homographes : BIER1, BIER2, BIER3, BIER4. |
| eng Gromper | pomme(s) de terre | A1.2 L25 · tableau | Gromper (`GROMPER1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « pomme de terre, patate douce, montre (tape-à-l'œil), montre (de frimeur) ». |
| eng Aprikos | abricot(s) | A1.2 L25 · tableau | Aprikos (`APRIKOS1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « abricot ». |
| ganzdaags | temps plein | A1.2 L26 · cartes, cours, tableau | ganzdaags (`GANZDAAGS1`, ADV) | lemme | LEMME_EXACT | AUDIO_INDISPONIBLE + CONTEXTE_CANDIDAT | Lemme identique, sens « toute la journée, à temps plein, à temps complet » ; MP3 : absent du miroir (404). Contexte : « Meng Hausdoktesch schafft méindes an dënschdes ganzdaags » (à vérifier (Termux)). |
| e Sekretär | — | A1.2 L26 · tableau | Sekretär (`SEKRETAR1`, SUBST) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « secrétaire, secrétaire, secrétaire, secrétaire ». |
| sinn | — | A1.2 L27 · tableau | sinn (`SINN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « être, être, être, être » ; homographes : SINN1, SINN2. |
| hunn | — | A1.2 L27 · tableau | hunn (`HUNN1`, VRB) | lemme | LEMME_EXACT | SON_EXACT_DISPONIBLE | Lemme identique, sens « avoir, posséder, avoir, avoir (sous la main) » ; homographes : HUNN1, HUNN3. |

### Faux absents : forme fléchie rattachée à une entrée (100)

| Texte LuxApp | Traduction | Leçons · sections | Entrée LOD | Type | Correspondance | Audio | Justification |
|---|---|---|---|---|---|---|---|
| Entschëllegt! | Excusez-moi ! | A1.1 L1 · cartes, cours | entschëllegen (`ENTSCHELLEGEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « entschëllegt » = participe passé de entschëllegen (ENTSCHELLEGEN1), articles. Contexte : « Entschëllegt den Derangement, wannechgelift! » (à vérifier (Termux)). |
| kee | pas un (après e) | A1.1 L2, A1.1 L8, A1.1 L11 · cartes, tableau, cours | keen (`KEEN1`, PRON) | variante règle du n | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « kee » = variante règle du n de keen (KEEN1), articles. Contexte : « Kee vun hire Bouwen daacht eppes » (à vérifier (Termux)). |
| zwou | 2 (féminin) | A1.1 L5, A1.1 L15, A1.2 L20 · cartes, cours | zwee (`ZWEE2`, NB) | forme adjectivale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « zwou » = forme adjectivale (table) de zwee (ZWEE2), tables. Contexte : « Fir déi Distanz brauchs de ongeféier zwou Stonnen » (à vérifier (Termux)). |
| aachtzeg | 80 | A1.1 L5 · cartes, cours | achtzeg (`ACHTZEG1`, NB) | lemme | GRAPHIE_A_VERIFIER | AUCUN | Pas d'entrée « aachtzeg » ; graphie LOD proche : achtzeg (ACHTZEG1, lemme), aachten (AACHT2, forme adjectivale (table)), aachter (AACHT2, forme adjectivale (table)) ; sens LOD : quatre-vingt(s). |
| eenanaachtzeg | — | A1.1 L5 · tableau | eenanachtzeg (`EENANACHTZEG1`, NB) | lemme | GRAPHIE_A_VERIFIER | AUCUN | Pas d'entrée « eenanaachtzeg » ; graphie LOD proche : eenanachtzeg (EENANACHTZEG1, lemme), eenanuechtzeg (EENANUECHTZEG1, lemme) ; sens LOD : quatre-vingt-un. |
| Italiener | Italien | A1.1 L8 · cartes, tableau | Italieener (`ITALIEENER1`, SUBST) | lemme | GRAPHIE_A_VERIFIER | AUCUN | Pas d'entrée « italiener » ; graphie LOD proche : Italieener (ITALIEENER1, lemme), Italiéiner (ITALIEINER1, lemme) ; sens LOD : Italien. |
| Fransousin | Française | A1.1 L8 · cartes, tableau | Franséisin (`FRANSEISIN1`, SUBST) | lemme | GRAPHIE_A_VERIFIER | AUCUN | Pas d'entrée « fransousin » ; graphie LOD proche : Franséisin (FRANSEISIN1, lemme) ; sens LOD : Française. |
| Italienerin | Italienne | A1.1 L8 · cartes, tableau | Italieenerin (`ITALIEENERIN1`, SUBST) | lemme | GRAPHIE_A_VERIFIER | AUCUN | Pas d'entrée « italienerin » ; graphie LOD proche : Italieenerin (ITALIEENERIN1, lemme), Italiéinerin (ITALIEINERIN1, lemme) ; sens LOD : Italienne. |
| Italienesch | italien | A1.1 L9 · cartes, cours | italieenesch (`ITALIEENESCH1`, ADJ) | lemme | GRAPHIE_A_VERIFIER | AUCUN | Pas d'entrée « italienesch » ; graphie LOD proche : italieenesch (ITALIEENESCH1, lemme), italieenescht (ITALIEENESCH1, forme adjectivale (table)), italiéinesch (ITALIEINESCH1, lemme) ; sens LOD : italien. |
| e bësse | un peu | A1.1 L9 · cartes, cours | bëssen (`BESSEN1`, PRON) | variante règle du n | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « bësse » = variante règle du n de bëssen (BESSEN1), articles. Contexte : « Ass dat net e bësse vill verlaangt? » (à vérifier (Termux)). |
| schwätz | — | A1.1 L9 · tableau | schwätzen (`SCHWATZEN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « schwätz » = forme verbale (table) de schwätzen (SCHWATZEN1), tables. Contexte : « Schwätz dach kee Kabes! » (à vérifier (Termux)). |
| schwätzt | — | A1.1 L9 · tableau | schwätzen (`SCHWATZEN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « schwätzt » = forme verbale (table) de schwätzen (SCHWATZEN1), tables. Contexte : « Mäi Monni schwätzt fléissend véier Sproochen » (à vérifier (Termux)). |
| Kirchberg | Kirchberg | A1.1 L10 · cartes, cours | Kierchbierg (`KIERCHBIERG1`, NP) | lemme | GRAPHIE_A_VERIFIER | AUCUN | Pas d'entrée « kirchberg » ; graphie LOD proche : Kierchbierg (KIERCHBIERG1, lemme) ; sens LOD : Kirchberg. |
| gescheet | divorcé(e) | A1.1 L13 · cartes, cours, tableau | scheeden (`SCHEEDEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « gescheet » = participe passé de scheeden (SCHEEDEN1), articles. |
| getrennt | séparé(e) | A1.1 L13 · cartes, cours, tableau | trennen (`TRENNEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « getrennt » = participe passé de trennen (TRENNEN1), articles. Contexte : « Wéi gëtt dat Wuert richteg getrennt? » (à vérifier (Termux)). |
| gepacst | pacsé(e) | A1.1 L13 · cartes, cours, tableau | pacsen (`PACSEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gepacst » = participe passé de pacsen (PACSEN1), articles. Contexte : « De Buergermeeschter huet d'Koppel gepacst » (à vérifier (Termux)). |
| verlobt | fiancé(e) | A1.1 L13 · cartes, cours, tableau | verloben (`VERLOBEN1`, VRB) | participe passé | GRAPHIE_A_VERIFIER | AUCUN | Pas d'entrée « verlobt » ; graphie LOD proche : verloobt (VERLOBEN1, participe passé) ; sens LOD : se fiancer. |
| Kanner | des enfants | A1.1 L13 · cartes, cours, tableau | Kand (`KAND1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « kanner » = pluriel de Kand (KAND1), articles. Contexte : « Aus Kanner gëtt Leit » (à vérifier (Termux)). |
| Jongen | des garçons | A1.1 L13 · cartes, cours, tableau | Jong (`JONG1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « jongen » = pluriel de Jong (JONG1), articles. Contexte : « Mir hu just zwee Jongen an der Klass » (téléchargé). |
| Meedercher | des filles | A1.1 L13 · cartes, cours, tableau | Meedchen (`MEEDCHEN1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « meedercher » = pluriel de Meedchen (MEEDCHEN1), articles. Contexte : « Deen ale Jonggesell geet ëmmer nach bei d'Meedercher » (à vérifier (Termux)). |
| gebuer | né(e) | A1.1 L14 · cartes, cours | gebieren (`GEBIEREN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gebuer » = participe passé de gebieren (GEBIEREN1), articles. Contexte : « Hie gouf op Niklosdag gebuer » (à vérifier (Termux)). |
| éischte | le 1er (ordinal) | A1.1 L14 · cartes, cours, tableau | éischt (`EISCHT1`, NB) | variante règle du n dérivée de « éischten » | GRAPHIE_A_VERIFIER | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « éischte » = variante règle du n dérivée de « éischten » de éischt (EISCHT1), tables. Contexte : « Ech gi just bis op den éischte Stack, wéinst menger braucht Der de Lift net ze ruffen » (à vérifier (Termux)). |
| dräizéngte | le 13 (ordinal) | A1.1 L14 · cartes, cours, tableau | dräizéngt (`DRAIZENGT1`, NB) | variante règle du n dérivée de « dräizéngten » | GRAPHIE_A_VERIFIER | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « dräizéngte » = variante règle du n dérivée de « dräizéngten » de dräizéngt (DRAIZENGT1), tables. Contexte : « Mäi Büro ass um dräizéngte Stack » (à vérifier (Termux)). |
| uechtzéngte | le 18 (ordinal) | A1.1 L14 · cartes, cours, tableau | uechtzéngt (`UECHTZENGT1`, NB) | variante règle du n dérivée de « uechtzéngten » | GRAPHIE_A_VERIFIER | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « uechtzéngte » = variante règle du n dérivée de « uechtzéngten » de uechtzéngt (UECHTZENGT1), tables. Contexte : « Eist Appartement ass um uechtzéngte Stack » (à vérifier (Termux)). |
| véieranzwanzegste | le 24 (ordinal) | A1.1 L14 · cartes, cours, tableau | véieranzwanzegst (`VEIERANZWANZEGST1`, NB) | variante règle du n dérivée de « véieranzwanzegsten » | GRAPHIE_A_VERIFIER | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « véieranzwanzegste » = variante règle du n dérivée de « véieranzwanzegsten » de véieranzwanzegst (VEIERANZWANZEGST1), tables. Contexte : « Eréischt beim véieranzwanzegste Versuch ass d'Experiment perfekt gelongen » (à vérifier (Termux)). |
| zweeten | — | A1.1 L14 · tableau | zweet (`ZWEET1`, NB) | forme adjectivale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « zweeten » = forme adjectivale (table) de zweet (ZWEET1), tables. |
| drëtte | — | A1.1 L14 · tableau | drëtt (`DRETT1`, NB) | variante règle du n dérivée de « drëtten » | GRAPHIE_A_VERIFIER | ENTREE_SANS_AUDIO_EXACT | « drëtte » = variante règle du n dérivée de « drëtten » de drëtt (DRETT1), tables. |
| fënnefte | — | A1.1 L14 · tableau | fënneft (`FENNEFT1`, NB) | variante règle du n dérivée de « fënneften » | GRAPHIE_A_VERIFIER | ENTREE_SANS_AUDIO_EXACT | « fënnefte » = variante règle du n dérivée de « fënneften » de fënneft (FENNEFT1), tables. |
| zéngte | — | A1.1 L14 · tableau | zéngt (`ZENGT1`, NB) | variante règle du n dérivée de « zéngten » | GRAPHIE_A_VERIFIER | ENTREE_SANS_AUDIO_EXACT | « zéngte » = variante règle du n dérivée de « zéngten » de zéngt (ZENGT1), tables. |
| zwanzegsten | — | A1.1 L14 · tableau | zwanzegst (`ZWANZEGST1`, NB) | forme adjectivale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « zwanzegsten » = forme adjectivale (table) de zwanzegst (ZWANZEGST1), tables. Contexte : « Säi Gebuertsdag ass den zwanzegsten Oktober » (à vérifier (Termux)). |
| eenanzwanzegsten | — | A1.1 L14 · tableau | eenanzwanzegst (`EENANZWANZEGST1`, NB) | forme adjectivale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « eenanzwanzegsten » = forme adjectivale (table) de eenanzwanzegst (EENANZWANZEGST1), tables. |
| hallwer | demie (heure) | A1.1 L15 · cartes, cours | hallef (`HALLEF1`, ADJ) | forme adjectivale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « hallwer » = forme adjectivale (table) de hallef (HALLEF1), tables. Contexte : « O vreck, ass et schonn hallwer dräi! » (téléchargé). |
| Këschten | des boîtes | A1.2 L20 · cartes, cours | Këscht (`KESCHT1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « këschten » = pluriel de Këscht (KESCHT1), articles. Contexte : « Mir mussen nach d'Këschten ausraumen » (à vérifier (Termux)). |
| Kommod | une commode | A1.2 L21 · cartes | Komoud (`KOMOUD1`, SUBST) | lemme | GRAPHIE_A_VERIFIER | AUCUN | Pas d'entrée « kommod » ; graphie LOD proche : Komoud (KOMOUD1, lemme) ; sens LOD : commode. |
| Glieser | des verres | A1.2 L21 · cartes, tableau | Glas (`GLAS1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « glieser » = pluriel de Glas (GLAS1), articles. Contexte : « Beim Spullen hunn ech zwee Glieser gebrach » (téléchargé). |
| Still | des chaises | A1.2 L21 · cartes, tableau | Stull (`STULL1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « still » = pluriel de Stull (STULL1), articles. Contexte : « Ech sëtzen tëschent zwee Still » (à vérifier (Termux)). |
| Handdicher | des serviettes | A1.2 L21 · cartes, tableau | Handduch (`HANDDUCH1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « handdicher » = pluriel de Handduch (HANDDUCH1), articles. Contexte : « Hëllefs de mer, d'Handdicher falen? » (à vérifier (Termux)). |
| Biller | des images / tableaux | A1.2 L21 · cartes, tableau | Bild (`BILD1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « biller » = pluriel de Bild (BILD1), articles. Contexte : « Du schwätz a Biller » (à vérifier (Termux)). |
| Telleren | des assiettes | A1.2 L21 · cartes, tableau | Teller (`TELLER1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « telleren » = pluriel de Teller (TELLER1), articles. Contexte : « Huel der e Kichenduch an dréchen d'Telleren of! » (à vérifier (Termux)). |
| Becheren | des gobelets | A1.2 L21 · cartes, tableau | Becher (`BECHER1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « becheren » = pluriel de Becher (BECHER1), articles. Contexte : « Um Camping drénke mir aus plastiks Becheren » (à vérifier (Termux)). |
| eng Kommod | une commode | A1.2 L21 · cours | Komoud (`KOMOUD1`, SUBST) | lemme | GRAPHIE_A_VERIFIER | AUCUN | Pas d'entrée « kommod » ; graphie LOD proche : Komoud (KOMOUD1, lemme) ; sens LOD : commode. |
| gees | — | A1.2 L22 · tableau | goen (`GOEN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gees » = forme verbale (table) de goen (GOEN1), tables. Contexte : « Wann s de net gees! » (à vérifier (Termux)). |
| méchs | — | A1.2 L22 · tableau | maachen (`MAACHEN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « méchs » = forme verbale (table) de maachen (MAACHEN1), tables. Contexte : « Du méchs dat! » (à vérifier (Termux)). |
| spills | — | A1.2 L22 · tableau | spillen (`SPILLEN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « spills » = forme verbale (table) de spillen (SPILLEN1), tables. |
| fiers | — | A1.2 L22 · tableau | fueren (`FUEREN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « fiers » = forme verbale (table) de fueren (FUEREN1), tables. Contexte : « Schalt de Stroum aus, ier s de mat der Zaang un de Kabel fiers! » (à vérifier (Termux)). |
| geet | — | A1.2 L22 · tableau | goen (`GOEN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « geet » = forme verbale (table) de goen (GOEN1), tables. Contexte : « Elo geet et an d'Bett! » (à vérifier (Termux)). |
| mécht | — | A1.2 L22 · tableau | maachen (`MAACHEN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « mécht » = forme verbale (table) de maachen (MAACHEN1), tables. Contexte : « Dat mécht näischt! » (à vérifier (Termux)). |
| spillt | — | A1.2 L22 · tableau | spillen (`SPILLEN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « spillt » = forme verbale (table) de spillen (SPILLEN1), tables. Contexte : « Wie spillt an deem neien Actionfilm? » (à vérifier (Termux)). |
| fiert | — | A1.2 L22 · tableau | fueren (`FUEREN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « fiert » = forme verbale (table) de fueren (FUEREN1), tables. Contexte : « Mäi Mann fiert um Bus » (à vérifier (Termux)). |
| maacht | — | A1.2 L22 · tableau | maachen (`MAACHEN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « maacht » = forme verbale (table) de maachen (MAACHEN1), tables. Contexte : « Maacht mer e puer Tranchen Ham! » (à vérifier (Termux)). |
| fuert | — | A1.2 L22 · tableau | fueren (`FUEREN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « fuert » = forme verbale (table) de fueren (FUEREN1), tables. |
| d'Kanner | les enfants | A1.2 L23 · cours | Kand (`KAND1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « kanner » = pluriel de Kand (KAND1), articles. Contexte : « Aus Kanner gëtt Leit » (à vérifier (Termux)). |
| d'Enkelkanner | les petits-enfants | A1.2 L23 · cours | Enkelkand (`ENKELKAND1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « enkelkanner » = pluriel de Enkelkand (ENKELKAND1), articles. Contexte : « D'Enkelkanner hunn hirem Grousspapp gehollef, d'Gromperen erauszehuelen » (à vérifier (Termux)). |
| mäi | — | A1.2 L23 · tableau | mäin (`MAIN1`, PRON) | variante règle du n | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « mäi » = variante règle du n de mäin (MAIN1), articles. Contexte : « Mäi Brudder ass e lëschtege Kärel » (à vérifier (Termux)). |
| däi | — | A1.2 L23 · tableau | däin (`DAIN1`, PRON) | variante règle du n | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « däi » = variante règle du n de däin (DAIN1), articles. Contexte : « Du muss däi Passwuert aginn, fir dech anzeloggen » (à vérifier (Termux)). |
| säi | — | A1.2 L23 · tableau | säin (`SAIN1`, PRON) | variante règle du n | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « säi » = variante règle du n de säin (SAIN1), articles. Contexte : « D'Meedchen huet säi Schlëssel verluer » (à vérifier (Termux)). |
| hire | — | A1.2 L23 · tableau | hiren (`HIREN1`, PRON) | variante règle du n | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « hire » = variante règle du n de hiren (HIREN1), articles. Contexte : « Si ënnerstëtzen hire Jong finanziell » (à vérifier (Termux)). |
| Äre | — | A1.2 L23 · tableau | Ären (`AREN2`, PRON) | variante règle du n | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « äre » = variante règle du n de Ären (AREN2), articles. Contexte : « Sot wannechgelift Äre Mataarbechter Bescheed! » (à vérifier (Termux)). |
| gefuer | conduit / allé en véhicule | A1.2 L24 · cartes, cours, tableau | fueren (`FUEREN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gefuer » = participe passé de fueren (FUEREN1), articles. Contexte : « De Chauffer ass en Ëmwee gefuer » (à vérifier (Termux)). |
| gaangen | allé à pied | A1.2 L24 · cartes, cours, tableau | goen (`GOEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gaangen » = participe passé de goen (GOEN1), articles. Contexte : « D'Fest ass bis mueres fréi gaangen » (à vérifier (Termux)). |
| heemgaangen | rentré chez soi | A1.2 L24 · cartes, cours, tableau | heemgoen (`HEEMGOEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « heemgaangen » = participe passé de heemgoen (HEEMGOEN1), articles. Contexte : « Meng Kolleegin ass fréi heemgaangen, well se de Kapp wéi hat » (à vérifier (Termux)). |
| erausgaangen | sorti | A1.2 L24 · cartes, cours, tableau | erausgoen (`ERAUSGOEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « erausgaangen » = participe passé de erausgoen (ERAUSGOEN1), articles. Contexte : « De Communiqué ass nach net erausgaangen » (à vérifier (Termux)). |
| erwächt | réveillé | A1.2 L24 · cartes, cours, tableau | erwächen (`ERWACHEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « erwächt » = participe passé de erwächen (ERWACHEN1), articles. Contexte : « Ech sinn hënt zweemol erwächt » (à vérifier (Termux)). |
| opgestanen | levé | A1.2 L24 · cartes, cours, tableau | opstoen (`OPSTOEN2`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « opgestanen » = participe passé de opstoen (OPSTOEN2), articles. Contexte : « Ech war elo dräi Woche krank, haut sinn ech fir d'éischt erëm opgestanen » (à vérifier (Termux)). |
| gelaf | couru | A1.2 L24 · cartes, cours, tableau | lafen (`LAFEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gelaf » = participe passé de lafen (LAFEN1), articles. Contexte : « D'Saach ass gelaf! » (à vérifier (Termux)). |
| gefall | tombé | A1.2 L24 · cartes, cours, tableau | falen (`FALEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gefall » = participe passé de falen (FALEN1), articles. Contexte : « Hënt ass Schnéi gefall » (à vérifier (Termux)). |
| getrëppelt | marché | A1.2 L24 · cartes, cours, tableau | trëppelen (`TREPPELEN2`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « getrëppelt » = participe passé de trëppelen (TREPPELEN2), articles. Contexte : « Du bass him ellen op d'Féiss getrëppelt! » (à vérifier (Termux)). |
| giess | mangé | A1.2 L24 · cartes, cours, tableau | iessen (`IESSEN3`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « giess » = participe passé de iessen (IESSEN3), articles. |
| gedronk | bu | A1.2 L24 · cartes, cours, tableau | drénken (`DRENKEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gedronk » = participe passé de drénken (DRENKEN1), articles. Contexte : « Ech hunn nach kee Kaffi gedronk » (à vérifier (Termux)). |
| geschafft | travaillé | A1.2 L24 · cartes, cours, tableau | schaffen (`SCHAFFEN3`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « geschafft » = participe passé de schaffen (SCHAFFEN3), articles. Contexte : « D'Aarbechter hu séier an effikass geschafft » (à vérifier (Termux)). |
| geschlof | dormi | A1.2 L24 · cartes, cours, tableau | schlofen (`SCHLOFEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « geschlof » = participe passé de schlofen (SCHLOFEN1), articles. Contexte : « Deen huet net gutt geschlof » (à vérifier (Termux)). |
| geschriwwen | écrit | A1.2 L24 · cartes, cours, tableau | schreiwen (`SCHREIWEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « geschriwwen » = participe passé de schreiwen (SCHREIWEN1), articles. Contexte : « D'Haus ass op mech geschriwwen » (à vérifier (Termux)). |
| gemaach | fait | A1.2 L24 · cartes, cours, tableau | maachen (`MAACHEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gemaach » = participe passé de maachen (MAACHEN1), articles. Contexte : « Ech hunn näischt gemaach! » (à vérifier (Termux)). |
| geduscht | douché | A1.2 L24 · cartes, cours, tableau | duschen (`DUSCHEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « geduscht » = participe passé de duschen (DUSCHEN1), articles. |
| telefonéiert | téléphoné | A1.2 L24 · cartes, cours, tableau | telefonéieren (`TELEFONEIEREN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « telefonéiert » = participe passé de telefonéieren (TELEFONEIEREN1), articles. Contexte : « De Monni huet sengem Neveu telefonéiert, fir him ze gratuléieren » (à vérifier (Termux)). |
| gewunnt | habité | A1.2 L24 · cartes, cours, tableau | wunnen (`WUNNEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « gewunnt » = participe passé de wunnen (WUNNEN1), articles. |
| gekuckt | regardé | A1.2 L24 · cartes, cours, tableau | kucken (`KUCKEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gekuckt » = participe passé de kucken (KUCKEN1), articles. Contexte : « Hues de schonn op d'Auer gekuckt? » (à vérifier (Termux)). |
| gespillt | jouer | A1.2 L24 · tableau | spillen (`SPILLEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gespillt » = participe passé de spillen (SPILLEN1), articles. Contexte : « Ech hunn nach ni Theater gespillt » (à vérifier (Termux)). |
| gekacht | faire la cuisine | A1.2 L24 · tableau | kachen (`KACHEN2`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gekacht » = participe passé de kachen (KACHEN2), articles. Contexte : « Du hues d'Nuddelen eng Grimmel ze laang gekacht » (à vérifier (Termux)). |
| gelies | lire | A1.2 L24 · tableau | liesen (`LIESEN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « gelies » = participe passé de liesen (LIESEN1), articles. |
| gelauschtert | écouter | A1.2 L24 · tableau | lauschteren (`LAUSCHTEREN1`, VRB) | participe passé | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gelauschtert » = participe passé de lauschteren (LAUSCHTEREN1), articles. Contexte : « Hues du de Moien de Radio gelauschtert? » (à vérifier (Termux)). |
| war | — | A1.2 L24 · tableau | sinn (`SINN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « war » = forme verbale (table) de sinn (SINN1), tables. Contexte : « Villes, wat war, ass net méi » (à vérifier (Termux)). |
| waars | — | A1.2 L24 · tableau | sinn (`SINN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « waars » = forme verbale (table) de sinn (SINN1), tables. Contexte : « Wéi ech éinescht bei der laanschtkoum, waars de net doheem » (à vérifier (Termux)). |
| has | — | A1.2 L24 · tableau | hunn (`HUNN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « has » = forme verbale (table) de hunn (HUNN1), tables. |
| waren | — | A1.2 L24 · tableau | sinn (`SINN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « waren » = forme verbale (table) de sinn (SINN1), tables. |
| haten | — | A1.2 L24 · tableau | hunn (`HUNN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « haten » = forme verbale (table) de hunn (HUNN1), tables. Contexte : « Si haten hir Kanner bei sech » (à vérifier (Termux)). |
| Äppel | des pommes | A1.2 L25 · cartes, cours, tableau | Apel (`APEL1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « äppel » = pluriel de Apel (APEL1), articles. Contexte : « Du vergläichs Äppel a Bieren » (à vérifier (Termux)). |
| Bieren | des poires | A1.2 L25 · cartes, cours, tableau | Bier (`BIER3`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « bieren » = pluriel de Bier (BIER3), articles. Contexte : « Du vergläichs Äppel a Bieren » (à vérifier (Termux)). |
| Gromperen | pommes de terre | A1.2 L25 · cartes, cours, tableau | Gromper (`GROMPER1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « gromperen » = pluriel de Gromper (GROMPER1), articles. Contexte : « Ech hunn am léifste gebootschte Gromperen » (à vérifier (Termux)). |
| Aprikosen | abricots | A1.2 L25 · cartes, cours, tableau | Aprikos (`APRIKOS1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « aprikosen » = pluriel de Aprikos (APRIKOS1), articles. |
| d'Kenntnesser | connaissances | A1.2 L26 · cartes, cours, tableau | Kenntnes (`KENNTNES1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « kenntnesser » = pluriel de Kenntnes (KENNTNES1), articles. |
| viru | avant | A1.2 L26 · cartes, cours | virun (`VIRUN1`, PREP) | variante règle du n | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « viru » = variante règle du n de virun (VIRUN1), articles. Contexte : « Hie louch am Klassement viru mir » (à vérifier (Termux)). |
| Kenntnesser | — | A1.2 L26 · tableau | Kenntnes (`KENNTNES1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT | « kenntnesser » = pluriel de Kenntnes (KENNTNES1), articles. |
| Sproochen | — | A1.2 L26 · tableau | Sprooch (`SPROOCH1`, SUBST) | pluriel | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « sproochen » = pluriel de Sprooch (SPROOCH1), articles. Contexte : « Dësen Dolmetscher schwätzt siwe Sproochen » (à vérifier (Termux)). |
| bass | — | A1.2 L27 · tableau | sinn (`SINN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « bass » = forme verbale (table) de sinn (SINN1), tables. Contexte : « Wou bass de? » (à vérifier (Termux)). |
| hues | — | A1.2 L27 · tableau | hunn (`HUNN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « hues » = forme verbale (table) de hunn (HUNN1), tables. Contexte : « Du hues hei ze follegen! » (à vérifier (Termux)). |
| ass | — | A1.2 L27 · tableau | sinn (`SINN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « ass » = forme verbale (table) de sinn (SINN1), tables. Contexte : « Et ass Fréijoer! » (à vérifier (Termux)). |
| huet | — | A1.2 L27 · tableau | hunn (`HUNN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « huet » = forme verbale (table) de hunn (HUNN1), tables. Contexte : « Hien huet 36 Joer » (à vérifier (Termux)). |
| sidd | — | A1.2 L27 · tableau | sinn (`SINN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « sidd » = forme verbale (table) de sinn (SINN1), tables. Contexte : « Aus wat fir engem Land sidd Dir? » (à vérifier (Termux)). |
| hutt | — | A1.2 L27 · tableau | hunn (`HUNN1`, VRB) | forme verbale (table) | FORME_FLECHIE_VALIDEE | ENTREE_SANS_AUDIO_EXACT + CONTEXTE_CANDIDAT | « hutt » = forme verbale (table) de hunn (HUNN1), tables. Contexte : « Hutt Dir Äre Fürerschäi bei Iech? » (à vérifier (Termux)). |

### Sens ambigu ou différent (14)

| Texte LuxApp | Traduction | Leçons · sections | Entrée LOD | Type | Correspondance | Audio | Justification |
|---|---|---|---|---|---|---|---|
| e | — | A1.1 L2 · tableau | en `EN1`, en `EN2` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 2 entrées. |
| de | — | A1.1 L3 · tableau | de `DE1`, den `DEN1` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 2 entrées. |
| a | — | A1.1 L5, A1.1 L10 · tableau | a `A2`, an `AN2`, an `AN3`, an `AN4`, an `AN5` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 5 entrées. |
| Dat sinn | ce sont | A1.1 L6 · cartes | sinn `SINN1`, sinn `SINN2` | — | SENS_AMBIGU | AUCUN | Forme trouvée mais aucun sens LOD ne correspond à « ce sont ». |
| eng Posch | deux poches | A1.1 L6 · tableau | Posch `POSCH1` | — | SENS_AMBIGU | AUCUN | Forme trouvée mais aucun sens LOD ne correspond à « deux poches ». |
| um | — | A1.1 L10 · tableau | um `UM1`, um `UM2`, um `UM3` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 3 entrées. |
| enger | Travailler dans un lieu concret | A1.1 L12 · tableau | een `EEN2`, enger `ENGER1`, enger `ENGER2` | — | SENS_AMBIGU | AUCUN | Forme trouvée mais aucun sens LOD ne correspond à « Travailler dans un lieu concret ». |
| engem | — | A1.1 L12 · tableau | een `EEN2`, engem `ENGEM1`, engem `ENGEM2` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 3 entrées. |
| ginn | — | A1.2 L22 · tableau | ginn `GINN1`, ginn `GINN2`, ginn `GINN3`, ginn `GINN4`, goen `GOEN1` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 5 entrées. |
| du | — | A1.2 L22, A1.2 L24, A1.2 L27 · tableau | du `DU1`, du `DU2` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 2 entrées. |
| gitt | — | A1.2 L22 · tableau | ginn `GINN1`, ginn `GINN2`, ginn `GINN3`, goen `GOEN1` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 4 entrées. |
| eise | — | A1.2 L23 · tableau | eisen `EISEN3`, eisen `EISEN4` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 2 entrées. |
| hat | — | A1.2 L24 · tableau | haen `HAEN1`, hunn `HUNN1`, hunn `HUNN3` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 3 entrées. |
| waart | — | A1.2 L24 · tableau | sinn `SINN1`, sinn `SINN2`, waarden `WAARDEN1` | — | SENS_AMBIGU | AUCUN | Pas de traduction dans le tableau pour départager 3 entrées. |

### Aucune entrée trouvée (15)

| Texte LuxApp | Traduction | Leçons · sections | Entrée LOD | Type | Correspondance | Audio | Justification |
|---|---|---|---|---|---|---|---|
| Hallo! | Salut ! (familier) | A1.1 L1 · cartes, cours | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). |
| Wollekekrazer | un gratte-ciel | A1.1 L2 · cartes | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). Entrée voisine : Wollek (WOLLEK1). |
| e Wollekekrazer | un gratte-ciel | A1.1 L2 · tableau | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). Entrée voisine : Wollek (WOLLEK1). |
| zweehonnert | 200 | A1.1 L5 · cartes, tableau | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). |
| dräihonnert | 300 | A1.1 L5 · cartes, tableau | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). |
| zweedausend | 2000 | A1.1 L5 · cartes, tableau | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). |
| zéngdausend | 10 000 | A1.1 L5 · cartes, tableau | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). |
| honnerteenanzwanzeg | — | A1.1 L5 · tableau | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). Entrée voisine : honnert (HONNERT1). |
| zweehonnertfofzeg | — | A1.1 L5 · tableau | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). |
| Koreanesch | coréen | A1.1 L9 · cartes, cours | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). |
| leedeg | célibataire (état) | A1.1 L13 · cartes, cours, tableau | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). |
| zweedausendvéier | 2004 | A1.1 L14 · cartes, cours | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). |
| nonzénghonnertsiwenannonzeg | 1997 | A1.1 L14 · tableau | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). Entrée voisine : nonzénghonnert (NONZENGHONNERT1), nonzéng (NONZENG1). |
| Aarbechtsannonce | offre d'emploi | A1.2 L26 · cartes | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). Entrée voisine : Aarbecht (AARBECHT1). |
| eng Aarbechtsannonce | offre d'emploi | A1.2 L26 · cours, tableau | — | — | PAS_D_ENTREE | AUCUN | Aucune forme identique dans les articles ni dans les tables (index de recherche non consulté). Entrée voisine : Aarbecht (AARBECHT1). |
