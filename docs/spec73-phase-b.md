# SPEC 73 — Phase B : journal des lots

Phase B validée par Clayton le 20/10/2026, de façon progressive : moteur et sons sûrs d'abord ;
vérification individuelle des cas « à valider » ; audios contextuels relus ; orthographes présentées avant toute modification des leçons.

## Lot 1 — Moteur de correspondance

- **Index des formes versionné** : `tools/lod/lod-formes.json.gz` (3,9 Mo), construit par
  `node tools/lod/construire-formes.js new_lod-art.xml new_lod-tab.xml new_lod-search.xml` (exports LOD du 2026-07-27, CC0, gardés hors dépôt).
  Il contient 33 941 entrées (lemmes, pluriels, participes, variantes, sens, exemples avec la forme prononcée), 9 851 tables de flexion
  et 251 861 graphies de l'index de recherche avec leur statut (contrôlée, règle du n, fautive, générée).
- **Audit sans fichier externe** : `node tools/lod/audit-correspondances.js` lit l'index versionné ; résultat **identique** à la lecture des exports XML (contrôlé).
  À lancer pour toute nouvelle leçon : il propose les correspondances (sûres / à valider), les formes fléchies, les phrases candidates et les graphies à vérifier.
- **Chaîne proposer → valider → appliquer** : l'audit propose ; une correspondance n'est appliquée que si elle est dans
  `tools/lod/correspondances.json` (vérifiée à la main) ou trouvée par le rapprochement automatique des cartes (inchangé, 442 associations).
  Les mots du cours (vocabulaire, exemples) ne reçoivent un son **que** par la table vérifiée (`tools/audio-lod.js`).
- **Notes entre parenthèses** : « de Brudder (pl. d'Bridder) », « d'Meedchen (neutre) »… La note n'est pas prononcée : la clé du son et le nom
  accessible du bouton l'ignorent (`public/dialogue.js` et `tools/lod/commun.js`). Les 6 textes concernés sont des notes de grammaire (vérifié).

## Lot 2 — Sons directs

### Acceptés (12)

| Texte LuxApp | Entrée | Comment | Justification |
|---|---|---|---|
| de Brudder (pl. d'Bridder) | BRUDDER1 | clé sans parenthèses (MP3 déjà présent) | sûr |
| d'Meedchen (neutre) | MEEDCHEN1 | idem | sûr |
| de Grousspapp (fam. de Bopa/Bopi) | GROUSSPAPP1 | idem | sûr |
| d'Groussmamm (fam. d'Boma/Bomi) | GROUSSMAMM1 | idem | sûr |
| d'Niess (pl. d'Niessen) | NIESS1 | idem | sûr |
| d'Enkelkand (neutre) | ENKELKAND1 | idem | sûr |
| d'Elteren | ELTEREN1 | table vérifiée, MP3 téléchargé | sûr : lemme identique, graphie contrôlée, sans homographe |
| d'Geschwëster | GESCHWESTER1 | idem | sûr |
| d'Grousselteren | GROUSSELTEREN1 | idem | sûr |
| d'Reunioun | REUNIOUN1 | idem | sûr |
| un | UN1 | idem | vérifié : préposition « contre, à » (leçon 20) ; homographe UN2 = adverbe « allumé », même prononciation /un/ |
| widdert | WIDDERT1 | idem | vérifié : préposition « contre » ; variante de « widder » avec son propre enregistrement (/vˈidɐt/) |

### Vérifiés mais non intégrés : cellules de tableau sans bouton audio (36)

Le sens est confirmé par la ligne du tableau, mais les tableaux du cours n'affichent pas de bouton « Écouter » : une association n'apporterait rien à l'apprenant.
**Décision à prendre** : ajouter un bouton aux cellules luxembourgeoises des tableaux (nouvelle spec), ou laisser les tableaux sans son.

den (DEN1, article) · eenandrësseg, eenafofzeg, eenasiwwenzeg, eenannonzeg (numéraux) · eng Mauer (MAUER1) · iessen (IESSEN3, verbe ; IESSEN1 = nom « Iessen ») ·
ech (ECH1) · maachen (MAACHEN1) · spillen (SPILLEN1) · fueren (FUEREN1) · hien (HIEN1) · hatt (HATT2, pronom ; HATT1 = « Hatt » hotte) ·
mir (MIR1) · dir (DIR1) · Dir (DIR3, politesse) · deng (DENG2) · hiert (HIERT2 ; HIERT1 = « Hiert » berger) · **eis → EIS3** (possessif « notre », pas EIS1 « nous ») ·
eist (EIST1) · Är (AR3) · Äert (AERT2) · lafen (LAFEN1) · falen (FALEN1 « tomber » ; FALEN2 = « plier ») · opstoen (OPSTOEN2) · drénken (DRENKEN1) ·
wunnen (WUNNEN1) · kucken (KUCKEN1) · lauschteren (LAUSCHTEREN1) · en Akafskuerf (AKAFSKUERF1) · en Apel (APEL1) · eng Gromper (GROMPER1) ·
eng Aprikos (APRIKOS1) · e Sekretär (SEKRETAR1) · sinn (SINN1) · hunn (HUNN1) · Awuer! (AWUER1, variante familière de « Awar »).
Les homographes de même graphie ont la même prononciation (API identique dans le LOD) ; l'identifiant retenu est celui du sens de la leçon.

### À présenter à Clayton (3)

| Texte LuxApp | Leçon | Constat LOD | Proposition |
|---|---|---|---|
| eng Posch → « deux poches » | L6, tableau des pluriels | POSCH1 = **sac à main, sacoche** ; « poche » = **Täsch** (TASCH1) | corriger la traduction (« deux sacs à main ») ou remplacer l'exemple par « eng Täsch / zwou Täschen » |
| trëppelen → « marcher » | L24, verbes avec sinn (+ getrëppelt) | TREPPELEN2 = **marcher sur, poser le pied sur** ; pas de sens « se promener » dans le LOD | à vérifier : « trëppelen » au sens de « marcher (à pied) » n'est pas confirmé par le LOD |
| eenasiechzeg (61) | L5, tableau UNITEDZOHA | entrée **variante** de la graphie standard « eenasechzeg » (prononciation différente) | garder (variante attestée) ou passer à « eenasechzeg » ; à décider avec « siechzeg / sechzeg » |

### Mesure du lot 2

Couverture audio des leçons : **37,1 % → 37,7 %** (sons directs 653 → 665 éléments ; `node tools/lod/audit-audio.js`).
Catalogue : 442 → **448** associations dans `public/audio/lod.json` (+ 6 éléments sonorisés par la clé sans parenthèses).

## Lot 3 — Audios contextuels (74 candidats relus)

Critères : phrase courte et naturelle, sens littéral, même forme que celle de la leçon, utile à un débutant, traduction relue.
Le mot isolé est accepté quand la phrase prononce **exactement** cette forme (contrôle `contientExpression`, article élidé « d' » toléré).

- **29 formes n'apparaissent que dans des tableaux** (conjugaisons, possessifs : schwätz, gees, mäi, war, bass…) : pas de bouton, pas d'association.
- **45 formes ont un bouton** (cartes, vocabulaire du cours) : **37 retenues** (dont « e bësse », déjà retenue en SPEC 70), **8 refusées**.

### Retenues (36 nouvelles, `tools/lod/contextes.json`, lot « SPEC 73 lot 3 »)

| Forme LuxApp | Phrase LOD prononcée | Traduction |
|---|---|---|
| Entschëllegt! | Entschëllegt, ass dee Stull nach fräi? | Excusez-moi, cette chaise est-elle encore libre ? |
| zwou | Fir déi Distanz brauchs de ongeféier zwou Stonnen | Pour cette distance, il te faut environ deux heures. |
| getrennt | D'Koppel huet sech am Gudde getrennt | Le couple s'est séparé à l'amiable. |
| gepacst | De Buergermeeschter huet d'Koppel gepacst | Le maire a pacsé le couple. |
| Kanner | Eis Noperen hu véier Kanner, zwee Jongen an zwee Meedercher | Nos voisins ont quatre enfants, deux garçons et deux filles. |
| Jongen | Eis Noperen hu véier Kanner, zwee Jongen an zwee Meedercher | Nos voisins ont quatre enfants, deux garçons et deux filles. |
| Meedercher | Eis Noperen hu véier Kanner, zwee Jongen an zwee Meedercher | Nos voisins ont quatre enfants, deux garçons et deux filles. |
| gebuer | Hie gouf op Niklosdag gebuer | Il est né le jour de la Saint-Nicolas. |
| dräizéngte | Mäi Büro ass um dräizéngte Stack | Mon bureau est au treizième étage. |
| uechtzéngte | Eist Appartement ass um uechtzéngte Stack | Notre appartement est au dix-huitième étage. |
| hallwer | O vreck, ass et schonn hallwer dräi! | Oh mince, il est déjà deux heures et demie ! |
| Këschten | Mir mussen nach d'Këschten ausraumen | Nous devons encore vider les cartons. |
| Glieser | Beim Spullen hunn ech zwee Glieser gebrach | En faisant la vaisselle, j'ai cassé deux verres. |
| Still | An deem klengen Zëmmer ass just Plaz fir en Dësch an e puer Still | Dans cette petite pièce, il n'y a de la place que pour une table et quelques chaises. |
| Handdicher | Hëllefs de mer, d'Handdicher falen? | Tu m'aides à plier les serviettes ? |
| Biller | Am neie Musée si vill schéi Biller ausgestallt | Beaucoup de beaux tableaux sont exposés au nouveau musée. |
| Telleren | Huel der e Kichenduch an dréchen d'Telleren of! | Prends un torchon et essuie les assiettes ! |
| Becheren | Um Camping drénke mir aus plastiks Becheren | Au camping, nous buvons dans des gobelets en plastique. |
| d'Kanner | D'Kanner hu sech iwwer d'Kaddoe gefreet | Les enfants se sont réjouis des cadeaux. |
| d'Enkelkanner | D'Enkelkanner hunn hirem Grousspapp gehollef, d'Gromperen erauszehuelen | Les petits-enfants ont aidé leur grand-père à arracher les pommes de terre. |
| gefuer | Meng Eltere sinn de Moien op de Flughafe gefuer | Mes parents sont allés à l'aéroport ce matin. |
| heemgaangen | Meng Kolleegin ass fréi heemgaangen, well se de Kapp wéi hat | Ma collègue est rentrée tôt parce qu'elle avait mal à la tête. |
| erausgaangen | Ech sinn de ganzen Dag nach net aus dem Haus erausgaangen | Je ne suis pas encore sorti de la maison de toute la journée. |
| erwächt | Ech sinn hënt zweemol erwächt | Je me suis réveillé deux fois cette nuit. |
| gelaf | Bass du schonn eng Kéier e Marathon gelaf? | As-tu déjà couru un marathon ? |
| gefall | Hënt ass Schnéi gefall | Cette nuit, il est tombé de la neige. |
| gedronk | Ech hunn nach kee Kaffi gedronk | Je n'ai pas encore bu de café. |
| geschafft | Ech hunn de ganzen Dag am Gaart geschafft | J'ai travaillé toute la journée dans le jardin. |
| geschlof | Deen huet net gutt geschlof | Celui-là n'a pas bien dormi. |
| geschriwwen | Du hues mer scho laang net méi geschriwwen | Tu ne m'as plus écrit depuis longtemps. |
| gemaach | Ech hunn näischt gemaach! | Je n'ai rien fait ! |
| telefonéiert | De Monni huet sengem Neveu telefonéiert, fir him ze gratuléieren | L'oncle a téléphoné à son neveu pour le féliciter. |
| gekuckt | Mir hunn de ganzen Owend Fotoe gekuckt | Nous avons regardé des photos toute la soirée. |
| Gromperen | De Bop ass amgaang, Gromperen ze schielen | Grand-père est en train d'éplucher des pommes de terre. |
| ganzdaags | Meng Hausdoktesch schafft méindes an dënschdes ganzdaags | Ma médecin de famille travaille toute la journée le lundi et le mardi. |
| viru | Viru laanger, laanger Zäit huet an deem Schlass eng Prinzessin gewunnt | Il y a très, très longtemps, une princesse vivait dans ce château. |

Une même phrase sert parfois plusieurs formes (« Eis Noperen hu véier Kanner, zwee Jongen an zwee Meedercher » : Kanner, Jongen, Meedercher).

### Refusées (8)

| Forme | Raison |
|---|---|
| kee | seul exemple : pronom « aucun », tournure ancienne (« Kee vun hire Bouwen daacht eppes ») ; la leçon enseigne l'article |
| éischte | exemples trop longs ou nominalisés (« deen Éischte ») |
| véieranzwanzegste | seul exemple trop long |
| gaangen | emplois seulement figurés (« et ass gaangen », « matenee gaangen ») |
| opgestanen | exemples trop longs |
| getrëppelt | emplois figurés (« op d'Féiss getrëppelt ») ; sens de « trëppelen » à vérifier |
| Äppel, Bieren | expression « Äppel a Bieren vergläichen » ; autre exemple trop long |

### Correction trouvée en route

Le constructeur de l'index des exemples (`tools/lod/construire-index.js`, SPEC 69) ignorait les mots portant un attribut
(`<word partOfPreviousInflectedHeadword="true">gaangen,</word>`) : 81 exemples sur 57 360 perdaient un mot (« ass fréi heem, well… » au lieu de
« ass fréi heemgaangen, well… »). Corrigé et index reconstruit ; aucune phrase déjà retenue ou téléchargée n'était touchée.

### Surlignage

L'expression étudiée n'est surlignée que comme **mot entier** (« ass » ne s'allume plus dans « Klass ») ; « d'Këschten » surligne « Këschten ».

### Disponibilité

Sur les 98 phrases contextuelles relues (62 de la SPEC 70 + 36), **57 ont leur son** ; les 41 autres (34 nouvelles, 6 remplaçantes de la SPEC 72,
« Gudde Moien ») sont à télécharger par la procédure Termux.

## Lot 4 — Orthographe (aucune leçon modifiée)

Inventaire : `docs/inventaire-orthographe-lod.md` (`node tools/lod/inventaire-orthographe.js`) — **8 corrections, 187 occurrences**, classées par rôle
(réponse attendue, choix proposé, phrase à produire, mot caché, cours, note, aide de mission…).

| LuxApp | LOD | Preuve | Son après correction |
|---|---|---|---|
| wann ech gelift | wannechgelift | graphie **fautive** selon l'index de recherche | direct |
| Italiener, Italienerin | Italieener, Italieenerin | graphies **fautives** | direct |
| Italienesch | Italieenesch | « Italienesch » fautive ; « italieenesch » contrôlée | direct |
| aachtzeg (et 12 composés) | achtzeg | absente du LOD ; « achtzeg » contrôlée | direct pour achtzeg, eenanachtzeg |
| Fransousin | Franséisin | absente du LOD | direct |
| Kommod | Komoud | absente ; « Kommoud » fautive | direct |
| verlobt | verloobt | absente ; participe contrôlé de « verloben » | contextuel seulement |

Conservés : **Kirchberg** (nom propre officiel ; 24 occurrences en leçon 10), **siechzeg** et **eenasiechzeg** (variantes contrôlées).
Points de contenu : « eng Posch » traduit « poches » (LOD : sac à main ; poche = Täsch) ; « trëppelen » = « marcher » non confirmé par le LOD.
Progression : enregistrée par identifiant, aucune perte en cas de correction.

## Mesure finale de la phase B

| | Avant | Après (fichiers présents) | Après téléchargement Termux |
|---|---:|---:|---:|
| Couverture audio des leçons (1 980 éléments) | 37,1 % | **37,8 %** | **40,1 %** |
| Mots seuls avec audio exact ou contextuel relu (623) | 81,5 % | — | **88,6 %** |
| Associations directes (`lod.json`) | 442 | 448 (+6 par la clé sans parenthèses) | 448 |
| Phrases contextuelles relues | 62 | 98 | 98 |
