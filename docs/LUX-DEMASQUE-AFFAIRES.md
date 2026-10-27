# Lux Démasque — Affaires atomiques et générateur (SPEC 110, lot D4)

Source unique : `tools/lux-demasque/contenus.py` → `data/jeux/lux-demasque/contenus-v01.json` (clés `affaires`, `dossiersRediges`, `generateur`). Moteur : `public/lux-demasque-core.js` (`assembler`, `composerDossier`, `validerAffaires`). Dossier pilote : [LUX-DEMASQUE-DOSSIER-MILO.md](LUX-DEMASQUE-DOSSIER-MILO.md).

## 1. Principe

Une **affaire** est une déclaration complète et relue : phrase LU de base, question de précision et réponse, réplique de refus, pièces (FR, transcription complète), et pour un mensonge la preuve, la justification LU, le motif, l'explication et au moins un **leurre** (pièce plausible qui ne prouve rien, avec sa réplique propre).

Le générateur **n'écrit aucun texte** : il choisit des affaires validées, remplace `{npc}` dans le français seulement (le luxembourgeois ne contient aucune variable — vérifié par test) et vérifie le dossier obtenu avec `validerDossier`. Il ne peut donc ni inventer un mensonge sans preuve, ni produire une phrase LU non relue.

## 2. Catalogue (17 affaires, 9 mensonges, 8 vérités)

| Affaire | Thème | Nature | Phrase LU | Preuve | Pièces | Pourquoi c'est un mensonge |
| --- | --- | --- | --- | --- | --- | --- |
| A_TRAVAIL_CONTRAT | travail | mensonge | Ech schaffen an engem Restaurant. Ech sinn e Kach. | PRO_CONTRAT (**précision indispensable**) | PRO_CONTRAT, PRO_PLAT | Le profil Pro s'arrête en mai 2026 ; la précision dit « tous les jours », en octobre. |
| A_TRAVAIL_DOKTER | travail | mensonge | Ech sinn en Dokter. Ech schaffen am Spidol. | AMIS_COLLEGUE | AMIS_COLLEGUE, PIX_NUIT | Sa collègue le présente comme « notre infirmier de nuit ». |
| A_LOGEMENT_COLOC | logement | mensonge | Ech wunnen eleng. Ech hunn en Appartement an der Stad. | AMIS_KARIM | AMIS_KARIM, PIX_MATCH | Karim se présente lui-même comme son coloc. |
| A_VOYAGE_JAPON | voyage | mensonge | Am August war ech dräi Wochen a Japan. | LUXRUN_MERL (**recoupement**) | LUXRUN_MERL, PIX_KYOTO2 | Courses enregistrées les 5 dimanches d'août à Merl. |
| A_VOYAGE_ESPAGNE | voyage | mensonge | Am Juli war ech zwou Wochen a Spuenien. | AMIS_COACH (**recoupement**) | AMIS_COACH, PIX_BARCELONE | Présent aux 9 entraînements de juillet (mardis et jeudis) : 2 semaines en contiennent au moins 4. |
| A_SPORT_TOUSLESJOURS | sport | mensonge | Ech ginn all Dag lafen. | LUXRUN_SEPT (**recoupement**) | LUXRUN_SEPT, PIX_COURSE | La montre ne compte que 2 courses en septembre (6 et 20). |
| A_LOISIR_BAND | loisir | mensonge | Ech spille Gittar an enger Band. | AMIS_BAND (**précision indispensable**) | AMIS_BAND, PIX_CONCERT | La page du groupe nommé dans la précision liste 4 membres, sans lui. |
| A_LANGUE_DAITSCH | langue | mensonge | Ech schwätze perfekt Däitsch. | PRO_LANGUES | PRO_LANGUES, PIX_TREVES | Son profil Pro : « allemand A1 », parcours uniquement au Luxembourg. |
| A_ANIMAL_HOND | animal | mensonge | Ech hunn en Hond. Hien heescht Rex. | AMIS_CLARA_REX | AMIS_CLARA_REX, PIX_REX | Clara le remercie d'avoir promené **son** chien Rex. |
| V_TRAVAIL_BUREAU | travail | vraie | Ech schaffen an engem Büro. | — | PRO_COMPTABLE | — |
| V_LOGEMENT_SEUL | logement | vraie | Ech wunnen eleng. Mäin Appartement ass kleng. | — | PIX_APPART | — |
| V_SPORT_TENNIS | sport | vraie | Ech spillen Tennis. | — | PIX_TENNIS | — |
| V_ANIMAL_KAZ | animal | vraie | Ech hunn eng Kaz. Si heescht Mimi. | — | PIX_MIMI | — |
| V_CUISINE_ZOPP | cuisine | vraie | Ech kache gär fir meng Frënn. | — | AMIS_ZOPP | — |
| V_LOISIR_LIESEN | loisir | vraie | Ech liese gär. Ech hu vill Bicher. | — | PIX_LIVRES | — |
| V_LANGUE_ENGLESCH | langue | vraie | Ech schwätzen Englesch a Franséisch. | — | PRO_LANGUES2 | — |
| V_FAMILLE_CLARA | famille | vraie | Ech hunn eng Schwëster. Si heescht Clara. | — | AMIS_CLARA | — |

**Incompatibilité déclarée** : A_VOYAGE_JAPON ✕ A_SPORT_TOUSLESJOURS (le relevé LuxRun d'août contredirait aussi « tous les jours » : deux preuves pour un mensonge, ou une preuve pour deux). Aucune autre paire ne crée de fausse contradiction : vérifié exhaustivement (toutes déclarations × toutes pièces) sur 300 graines.

## 3. Règles du générateur (`composerDossier`)

- Graine entière → hasard déterministe (`creerHasard`) : **même graine = même dossier**, même graine + mêmes décisions = même partie (testé).
- Prétendant tiré dans `generateur.npcs` (leo, hugo, sam, jules, enzo, nico) : jamais Milo, Noah ou Tom, dont les dossiers sont canoniques.
- 3 mensonges + 3 vérités, **6 thèmes distincts**, incompatibilités respectées.
- Au moins **un mensonge à précision indispensable** et au moins **un recoupement de dates**.
- Pas trois mensonges en tête de déposition.
- Dossier refusé et nouveau tirage si `validerDossier` échoue (jamais observé sur 1 000 graines).
- Identifiant `GEN_<NPC>_<graine>`, numéro « N°xxx · INÉDIT », diagnostic du bilan : graine + liste des affaires.

Mesures (test Node) : 1 000 graines valides, **387 combinaisons différentes**, les 17 affaires toutes tirées.

## 4. Dossiers rédigés

| Dossier | Prétendant | Affaires |
| --- | --- | --- |
| MILO_001 (N°001) | Milo | dossier pilote écrit à la main (voir son document) |
| NOAH_001 (N°002) | Noah (`Suit_Male`) | DOKTER, CLARA, BAND, ZOPP, HOND, ENGLESCH |
| TOM_001 (N°003) | Tom (`Casual3_Male`) | CONTRAT, TENNIS, ESPAGNE, LOGEMENT_SEUL, DAITSCH, LIESEN |

Ordre de jeu : le premier dossier rédigé non résolu (`luxDemasqueResolus`), puis des dossiers générés. « Rejouer » propose le même dossier.

## 5. Décors 3D ajoutés

`hopital` (couloir, lit, croix) et `chien` (Rex low-poly), en plus des décors du lot D2, dans `public/lux-match-3d.js` (`FABRIQUES`, additif). Images mises en cache par prétendant (`piece:<npc>:<id>`).

## 6. Statut de relecture LU (affaires)

45 `audit_regles`, 24 `a_verifier_lod`, 17 `lecon`, 2 `lecon_modele` (le script refuse une phrase `lecon` absente des leçons et examens). LOD.lu n'est pas joignable depuis l'environnement de Claude ; aucune de ces phrases n'est déclarée validée.

Phrases `a_verifier_lod` à confirmer (mots ou tournures absents des leçons : *wierklech, just, Gesäis, gelunn, gewonnen, Spidol, Equipe, Tourismus, Gittar, Band, Concert, Spuenien, Däitsch, Pesto, Nuddelen, Gromperenzopp, Zweemol, geléiert, Fussball*) :

- De Karim / De Sami war just fir de Match do!
- Ech schaffen am Tourismus. Ech hunn eng Equipe. — Nee, nee. Ech schaffen am Tourismus! — Wéi? Ech hunn « Tourismus » gesot, net Horizon! — Gesäis du? Dat ass meng Equipe!
- Ech schaffen an engem Büro, wierklech!
- Ech schwätze perfekt Däitsch. — Wou hues du dat geléiert? — Jo, perfekt!
- Ech spille Gittar an enger Band. — Wéi heescht d'Band? — Wéi? Wéi eng Band? — Ech spille wierklech Gittar! — Kuck! Ech sinn um Concert! — Okay… ech si just Fan.
- Ech spille wierklech Tennis! — Jo! Ech liese wierklech gär!
- Ech war a Japan, wierklech! — Ech war a Spuenien, wierklech! — Ech war net a Spuenien. Ech war beim Fussball.
- Gesäis du? Ech lafen! — Okay… net all Dag. Zweemol am September.
- Gesäis du? Ech sinn am Spidol!
- Gromperenzopp! — Hues du meng Zopp net gär? — Hues du mäi Pesto net gär? — Nuddele mat Pesto. Ëmmer!
- Nee! Dat ass wierklech meng Kaz! — Nee! Ech wunne wierklech eleng.
- Okay… Du hues gewonnen. — Gesäis du? Ech hunn net gelunn!
- Wéi? Ech hunn den Numm net gesot!

## 7. Ajouter une affaire

1. L'écrire dans `contenus.py` avec `affaire(...)` : phrase, précision, refus, ≥ 1 pièce de preuve + ≥ 1 leurre, statut de relecture honnête.
2. Si sa preuve peut aussi contredire une autre affaire : la déclarer dans `incompatibles` (des deux côtés).
3. `python3 tools/lux-demasque/contenus.py` puis `node --test test/lux-demasque-generateur.test.cjs` : le test exhaustif refuse tout faux positif ou mensonge non prouvable.
