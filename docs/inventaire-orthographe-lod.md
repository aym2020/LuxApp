# Inventaire des corrections orthographiques confirmées par le LOD — SPEC 73

Généré par `node tools/lod/inventaire-orthographe.js` (index de recherche LOD du 2026-07-27, versionné dans `tools/lod/lod-formes.json.gz`).
**Aucune leçon n'est modifiée.** Chaque correction attend la décision de Clayton.

## Synthèse

8 corrections proposées, **187 occurrences** dans les leçons :
- choix proposé : 43
- cours : 36
- note / point d'attention : 29
- phrase à produire : 25
- réponse attendue : 15
- aperçu d'unité : 11
- mot caché (lettres à reconstruire) : 8
- question de quiz : 8
- phrase à trous (contexte) : 8
- aide de mission : 4

## Conséquences sur la progression

- La progression, les statistiques et la révision espacée sont enregistrées par **identifiant** (leçon, type, `id` de la question),
  jamais par le texte : une correction ne fait perdre aucune progression et ne crée pas de nouvelle question.
- **Mot caché** : les lettres à reconstruire changent (« Italiener » → « Italieener » : une lettre de plus).
- **Écriture et mission** : la nouvelle graphie devient la réponse attendue ; un apprenant qui tape l'ancienne serait corrigé.
  Option de transition : garder l'ancienne graphie comme coquille tolérée (SPEC 24) pendant un temps, **sans** l'accepter comme juste.
- **Trous et quiz** : réponse et choix proposés à corriger ensemble (sinon la bonne réponse disparaît des choix).
- **Audio** : chaque correction validée donne un son exact (sauf « verloobt », participe) ; relancer `node tools/audio-lod.js`.

## Corrections proposées

### « wann ech gelift » → « wannechgelift »

- Preuve LOD : graphie LuxApp **fautive** ; graphie proposée **contrôlée** (`WANNECHGELIFT1`).
- Audio après correction : direct (WANNECHGELIFT1.mp3).
- Occurrences : **15** (A1.1 L1, A1.2 L25).

| Leçon | Champ | Id | Rôle | Texte actuel |
|---|---|---|---|---|
| A1.1 L1 | `unites[2].phrases[1][0]` | 3 | aperçu d'unité | Wéi ass Ären Numm, wann ech gelift? |
| A1.1 L1 | `flashcards[28].lu` | 2029 | mot caché (lettres à reconstruire) | Wann ech gelift |
| A1.1 L1 | `quiz[28].question` | 2029 | question de quiz | Wann ech gelift |
| A1.1 L1 | `trous[26].note` | 2027 | note / point d'attention | wann ech gelift = s'il vous plaît |
| A1.1 L1 | `ecriture[36].lu` | 2037 | phrase à produire | Wéi ass Ären Numm, wann ech gelift? |
| A1.1 L1 | `cours[9].lignes[2]` | — | cours | Demander poliment : Wéi ass Ären Numm, wann ech gelift? (à l'écrit : wgl.) |
| A1.1 L1 | `cours[12].items[0][0]` | — | cours | Wann ech gelift |
| A1.2 L25 | `trous[0].apres` | 2001 | phrase à trous (contexte) | Dir, wann ech gelift? |
| A1.2 L25 | `trous[4].apres` | 2005 | phrase à trous (contexte) | ass et, wann ech gelift? |
| A1.2 L25 | `trous[7].apres` | 2008 | phrase à trous (contexte) | , wann ech gelift. |
| A1.2 L25 | `ecriture[7].lu` | 2008 | phrase à produire | Eng Dosen, wann ech gelift. |
| A1.2 L25 | `cours[5].lignes[0][0]` | — | cours | Eng Dosen, wann ech gelift. |
| A1.2 L25 | `cours[10].echanges[0][0]` | — | cours | U wiem ass et, wann ech gelift? |
| A1.2 L25 | `cours[10].echanges[2][0]` | — | cours | Wat kritt Dir, wann ech gelift? |
| A1.2 L25 | `cours[10].echanges[3][0]` | — | cours | Ech hätt gär e Kilo Äppel, wann ech gelift. |

### « Italiener » → « Italieener »

- Preuve LOD : graphie LuxApp **fautive** ; graphie proposée **contrôlée** (`ITALIEENER1`).
- Audio après correction : direct (ITALIEENER1.mp3).
- Occurrences : **36** (A1.1 L7, A1.1 L8, A1.1 L9, A1.2 L27).

| Leçon | Champ | Id | Rôle | Texte actuel |
|---|---|---|---|---|
| A1.1 L7 | `quiz[17].distracteurs[0]` | 2018 | choix proposé | Italiener |
| A1.1 L8 | `scene[5].lu` | — | phrase à produire | Hien ass Italiener. |
| A1.1 L8 | `scene[5].aide` | — | aide de mission | Hien ass (n gardé devant une voyelle) Italiener. |
| A1.1 L8 | `scene[13].aide` | — | aide de mission | Italiener + in. |
| A1.1 L8 | `flashcards[5].lu` | 2006 | mot caché (lettres à reconstruire) | Italiener |
| A1.1 L8 | `flashcards[25].note` | 2026 | note / point d'attention | Italien · masculin : Italiener |
| A1.1 L8 | `quiz[5].reponse` | 2006 | réponse attendue | Italiener |
| A1.1 L8 | `quiz[27].distracteurs[0]` | 2028 | choix proposé | Italiener |
| A1.1 L8 | `quiz[54].distracteurs[2]` | 2055 | choix proposé | Si ass keng Italiener. |
| A1.1 L8 | `trous[5].trou` | 2006 | réponse attendue | Italiener |
| A1.1 L8 | `trous[5].choix[0]` | 2006 | choix proposé | Italiener |
| A1.1 L8 | `trous[5].note` | 2006 | note / point d'attention | Pas d'article : De Marco ass Italiener. |
| A1.1 L8 | `trous[27].choix[1]` | 2028 | choix proposé | Italiener |
| A1.1 L8 | `trous[44].apres` | 2045 | phrase à trous (contexte) | Italiener. |
| A1.1 L8 | `ecriture[5].lu` | 2006 | phrase à produire | Ech sinn Italiener. |
| A1.1 L8 | `cours[0].lignes[5][0]` | — | cours | Italiener |
| A1.1 L8 | `cours[2].lignes[1]` | — | cours | Il reste devant une voyelle ou n, d, t, z, h (UNITEDZOHA) : Ech sinn Däitschen, Ech sinn Italiener. |
| A1.1 L8 | `cours[10].lignes[0]` | — | cours | Quand on parle d'une personne (pas de sa nationalité) : e Fransous, en Italiener, eng Portugisin. |
| A1.1 L9 | `quiz[3].distracteurs[0]` | 2004 | choix proposé | Italiener |
| A1.2 L27 | `scene[1].lu` | — | phrase à produire | Nee, ech sinn Italiener. |
| A1.2 L27 | `scene[6].lu` | — | phrase à produire | Sidd dir zwee Italiener? |
| A1.2 L27 | `scene[7].lu` | — | phrase à produire | Jo, mir sinn Italiener. |
| A1.2 L27 | `unites[0].phrase[0]` | 1 | aperçu d'unité | Ech sinn Italiener. – Hien ass Lëtzebuerger. |
| A1.2 L27 | `unites[0].exemple` | 1 | aperçu d'unité | Ech sinn Italiener · Si ass bestuet · Mir sinn zu Lëtzebuerg. |
| A1.2 L27 | `unites[2].exemple` | 3 | aperçu d'unité | Ech si bestuet · Ech hu keen Auto · mais Ech sinn Italiener · Ech hunn en Auto. |
| A1.2 L27 | `trous[0].apres` | 2001 | phrase à trous (contexte) | Italiener. |
| A1.2 L27 | `ecriture[5].lu` | 2006 | phrase à produire | Ech sinn Italiener. |
| A1.2 L27 | `ecriture[5].attention` | 2006 | note / point d'attention | Devant une voyelle, on garde le n : ech sinn Italiener. |
| A1.2 L27 | `cours[0].lignes[1]` | — | cours | Ech sinn Italiener · Si ass bestuet · Mir sinn zu Lëtzebuerg. |
| A1.2 L27 | `cours[2].lignes[0][0]` | — | cours | Ech sinn Italiener. |
| A1.2 L27 | `cours[6].lignes[1]` | — | cours | Ech si bestuet · Ech hu keen Auto · mais Ech sinn Italiener · Ech hunn en Auto. |
| A1.2 L27 | `cours[12].lignes[1]` | — | cours | Devant une voyelle ou n, d, t, z, h, on garde la forme pleine : Ech sinn Italiener · Mir hunn zwee Kanner. |
| A1.2 L27 | `cours[13].lignes[4][1]` | — | cours | Nee, ech sinn Italiener. |
| A1.2 L27 | `cours[15].echanges[1][0]` | — | cours | Nee, ech sinn Italiener. |
| A1.2 L27 | `cours[15].echanges[6][0]` | — | cours | Sidd dir zwee Italiener? |
| A1.2 L27 | `cours[15].echanges[7][0]` | — | cours | Jo, mir sinn Italiener. |

### « Italienerin » → « Italieenerin »

- Preuve LOD : graphie LuxApp **fautive** ; graphie proposée **contrôlée** (`ITALIEENERIN1`).
- Audio après correction : direct (ITALIEENERIN1.mp3).
- Occurrences : **16** (A1.1 L8, A1.1 L9).

| Leçon | Champ | Id | Rôle | Texte actuel |
|---|---|---|---|---|
| A1.1 L8 | `scene[13].lu` | — | phrase à produire | Si ass Italienerin. |
| A1.1 L8 | `flashcards[5].note` | 2006 | note / point d'attention | Italien · féminin : Italienerin |
| A1.1 L8 | `flashcards[25].lu` | 2026 | mot caché (lettres à reconstruire) | Italienerin |
| A1.1 L8 | `quiz[5].distracteurs[0]` | 2006 | choix proposé | Italienerin |
| A1.1 L8 | `quiz[27].reponse` | 2028 | réponse attendue | Italienerin |
| A1.1 L8 | `quiz[54].reponse` | 2055 | réponse attendue | Si ass keng Italienerin. |
| A1.1 L8 | `quiz[54].distracteurs[0]` | 2055 | choix proposé | Si ass kee Italienerin. |
| A1.1 L8 | `quiz[54].distracteurs[1]` | 2055 | choix proposé | Si ass keen Italienerin. |
| A1.1 L8 | `trous[5].choix[1]` | 2006 | choix proposé | Italienerin |
| A1.1 L8 | `trous[27].trou` | 2028 | réponse attendue | Italienerin |
| A1.1 L8 | `trous[27].choix[0]` | 2028 | choix proposé | Italienerin |
| A1.1 L8 | `trous[27].note` | 2028 | note / point d'attention | D'Giulia ass Italienerin. |
| A1.1 L8 | `ecriture[19].lu` | 2020 | phrase à produire | Ech sinn Italienerin. |
| A1.1 L8 | `ecriture[37].lu` | 2038 | phrase à produire | Nee, si ass keng Italienerin. |
| A1.1 L8 | `cours[0].lignes[5][1]` | — | cours | Italienerin |
| A1.1 L9 | `trous[3].choix[1]` | 2004 | choix proposé | Italienerin |

### « Italienesch » → « Italieenesch »

- Preuve LOD : graphie LuxApp **fautive** ; graphie proposée **contrôlée** (`ITALIEENESCH1`).
- adjectif « italieenesch » dans le LOD ; nom de la langue avec majuscule, comme les autres langues de la leçon 9.
- Audio après correction : direct (ITALIEENESCH1.mp3).
- Occurrences : **16** (A1.1 L7, A1.1 L8, A1.1 L9).

| Leçon | Champ | Id | Rôle | Texte actuel |
|---|---|---|---|---|
| A1.1 L7 | `quiz[17].distracteurs[1]` | 2018 | choix proposé | Italienesch |
| A1.1 L8 | `quiz[5].distracteurs[2]` | 2006 | choix proposé | Italienesch |
| A1.1 L8 | `quiz[27].distracteurs[2]` | 2028 | choix proposé | Italienesch |
| A1.1 L8 | `trous[5].choix[2]` | 2006 | choix proposé | Italienesch |
| A1.1 L8 | `trous[27].choix[2]` | 2028 | choix proposé | Italienesch |
| A1.1 L9 | `flashcards[3].lu` | 2004 | mot caché (lettres à reconstruire) | Italienesch |
| A1.1 L9 | `quiz[3].reponse` | 2004 | réponse attendue | Italienesch |
| A1.1 L9 | `quiz[5].distracteurs[2]` | 2006 | choix proposé | Italienesch |
| A1.1 L9 | `quiz[13].distracteurs[2]` | 2014 | choix proposé | Italienesch |
| A1.1 L9 | `trous[3].trou` | 2004 | réponse attendue | Italienesch |
| A1.1 L9 | `trous[3].choix[0]` | 2004 | choix proposé | Italienesch |
| A1.1 L9 | `trous[5].choix[3]` | 2006 | choix proposé | Italienesch |
| A1.1 L9 | `trous[13].choix[3]` | 2014 | choix proposé | Italienesch |
| A1.1 L9 | `ecriture[3].lu` | 2004 | phrase à produire | Italienesch |
| A1.1 L9 | `cours[2].items[3][0]` | — | cours | Italienesch |
| A1.1 L9 | `cours[8].items[3][0]` | — | cours | Italienesch |

### « aachtzeg » → « achtzeg »

- Preuve LOD : graphie LuxApp **absente du LOD** ; graphie proposée **contrôlée** (`ACHTZEG1`).
- Audio après correction : direct pour « achtzeg » et « eenanachtzeg » ; les autres composés n'ont pas d'entrée.
- Occurrences : **39** (A1.1 L5, A1.1 L14).

| Leçon | Champ | Id | Rôle | Texte actuel |
|---|---|---|---|---|
| A1.1 L5 | `unites[2].pieges[0]` | 3 | aperçu d'unité | an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `unites[3].pieges[1]` | 4 | aperçu d'unité | Années avant 2000, par centaines : 1984 = nonzénghonnertvéieranaachtzeg. |
| A1.1 L5 | `flashcards[27].lu` | 2028 | mot caché (lettres à reconstruire) | aachtzeg |
| A1.1 L5 | `flashcards[29].attention` | 2030 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `flashcards[30].attention` | 2031 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `quiz[20].question` | 2021 | question de quiz | aachtzeg |
| A1.1 L5 | `quiz[24].attention` | 2025 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `quiz[25].attention` | 2026 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `quiz[26].attention` | 2027 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `quiz[32].question` | 2033 | question de quiz | dräianaachtzeg |
| A1.1 L5 | `quiz[36].question` | 2037 | question de quiz | dräihonnertaachtzeg |
| A1.1 L5 | `quiz[49].question` | 2050 | question de quiz | fënnefhonnertaachtanaachtzeg |
| A1.1 L5 | `trous[4].choix[3]` | 2005 | choix proposé | aachtzeg |
| A1.1 L5 | `trous[19].attention` | 2020 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `trous[21].attention` | 2022 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `trous[22].attention` | 2023 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `trous[23].trou` | 2024 | réponse attendue | véieranaachtzeg |
| A1.1 L5 | `trous[23].choix[0]` | 2024 | choix proposé | véieranaachtzeg |
| A1.1 L5 | `trous[23].choix[3]` | 2024 | choix proposé | dräianaachtzeg |
| A1.1 L5 | `trous[23].note` | 2024 | note / point d'attention | 84 = véieranaachtzeg |
| A1.1 L5 | `trous[23].attention` | 2024 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `trous[25].attention` | 2026 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `trous[26].choix[1]` | 2027 | choix proposé | siwenanaachtzeg |
| A1.1 L5 | `trous[27].choix[1]` | 2028 | choix proposé | nénganaachtzeg |
| A1.1 L5 | `trous[33].trou` | 2034 | réponse attendue | eenanaachtzeg |
| A1.1 L5 | `trous[33].choix[0]` | 2034 | choix proposé | eenanaachtzeg |
| A1.1 L5 | `trous[33].choix[3]` | 2034 | choix proposé | zweeanaachtzeg |
| A1.1 L5 | `trous[33].note` | 2034 | note / point d'attention | 81 = eenanaachtzeg |
| A1.1 L5 | `ecriture[28].attention` | 2029 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `ecriture[31].attention` | 2032 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `ecriture[33].lu` | 2034 | phrase à produire | aachtzeg |
| A1.1 L5 | `ecriture[35].attention` | 2036 | note / point d'attention | Liaison : an devant zwanzeg, drësseg, aachtzeg, nonzeg · a devant véierzeg, fofzeg, siechzeg, siwwenzeg. |
| A1.1 L5 | `ecriture[46].lu` | 2047 | phrase à produire | fënnefanaachtzeg |
| A1.1 L5 | `ecriture[57].lu` | 2058 | phrase à produire | dräihonnertfënnefanaachtzeg |
| A1.1 L5 | `cours[6].items[6][0]` | — | cours | aachtzeg |
| A1.1 L5 | `cours[8].lignes[6][0]` | — | cours | 80 — aachtzeg |
| A1.1 L5 | `cours[8].lignes[6][2]` | — | cours | eenanaachtzeg (81) |
| A1.1 L5 | `cours[12].lignes[0]` | — | cours | Avant 2000, on lit par centaines : 1984 = nonzénghonnertvéieranaachtzeg (19-cent-84). |
| A1.1 L14 | `ecriture[26].lu` | 2027 | phrase à produire | nonzénghonnertaachtanaachtzeg |

### « Fransousin » → « Franséisin »

- Preuve LOD : graphie LuxApp **absente du LOD** ; graphie proposée **contrôlée** (`FRANSEISIN1`).
- Audio après correction : direct (FRANSEISIN1.mp3).
- Occurrences : **29** (A1.1 L8).

| Leçon | Champ | Id | Rôle | Texte actuel |
|---|---|---|---|---|
| A1.1 L8 | `scene[17].lu` | — | phrase à produire | Ass d'Julie och Fransousin? |
| A1.1 L8 | `scene[18].lu` | — | phrase à produire | Nee, si ass keng Fransousin. Si ass Belsch. |
| A1.1 L8 | `scene[18].aide` | — | aide de mission | Féminin → keng Fransousin. |
| A1.1 L8 | `unites[1].exemple` | 2 | aperçu d'unité | Fransous → Fransousin · Portugis → Portugisin |
| A1.1 L8 | `unites[1].phrases[1][0]` | 2 | aperçu d'unité | Ech si Fransousin. |
| A1.1 L8 | `unites[2].exemple` | 3 | aperçu d'unité | Ass hie Portugis? · Hien ass kee Portugis · Si ass keng Fransousin |
| A1.1 L8 | `flashcards[1].note` | 2002 | note / point d'attention | Frankräich · féminin : Fransousin |
| A1.1 L8 | `flashcards[21].lu` | 2022 | mot caché (lettres à reconstruire) | Fransousin |
| A1.1 L8 | `flashcards[45].note` | 2046 | note / point d'attention | Si ass keng Fransousin. |
| A1.1 L8 | `quiz[1].distracteurs[0]` | 2002 | choix proposé | Fransousin |
| A1.1 L8 | `quiz[23].reponse` | 2024 | réponse attendue | Fransousin |
| A1.1 L8 | `quiz[29].reponse` | 2030 | réponse attendue | Ech si Fransousin. |
| A1.1 L8 | `quiz[29].distracteurs[0]` | 2030 | choix proposé | Ech sinn Fransousin. |
| A1.1 L8 | `quiz[29].distracteurs[2]` | 2030 | choix proposé | Ech si eng Fransousin. |
| A1.1 L8 | `quiz[46].reponse` | 2047 | réponse attendue | Si ass keng Fransousin. |
| A1.1 L8 | `quiz[46].distracteurs[0]` | 2047 | choix proposé | Si ass kee Fransousin. |
| A1.1 L8 | `quiz[46].distracteurs[1]` | 2047 | choix proposé | Si ass keen Fransousin. |
| A1.1 L8 | `trous[1].choix[1]` | 2002 | choix proposé | Fransousin |
| A1.1 L8 | `trous[23].trou` | 2024 | réponse attendue | Fransousin |
| A1.1 L8 | `trous[23].choix[0]` | 2024 | choix proposé | Fransousin |
| A1.1 L8 | `trous[23].note` | 2024 | note / point d'attention | D'Claire ass Fransousin. |
| A1.1 L8 | `trous[46].apres` | 2047 | phrase à trous (contexte) | Fransousin. |
| A1.1 L8 | `ecriture[14].lu` | 2015 | phrase à produire | Ech si Fransousin. |
| A1.1 L8 | `ecriture[31].lu` | 2032 | phrase à produire | Nee, si ass keng Fransousin. |
| A1.1 L8 | `cours[0].lignes[1][1]` | — | cours | Fransousin |
| A1.1 L8 | `cours[4].lignes[0]` | — | cours | Le féminin = masculin + -in : Fransous → Fransousin, Portugis → Portugisin. |
| A1.1 L8 | `cours[7].lignes[2]` | — | cours | Hien ass kee Portugis · Hien ass keen Däitschen · Si ass keng Fransousin. |
| A1.1 L8 | `cours[11].echanges[7][0]` | — | cours | Ass d'Julie och Fransousin? |
| A1.1 L8 | `cours[11].echanges[8][0]` | — | cours | Nee, si ass keng Fransousin. Si ass Belsch. |

### « Kommod » → « Komoud »

- Preuve LOD : graphie LuxApp **absente du LOD** ; graphie proposée **contrôlée** (`KOMOUD1`).
- « Kommoud » est listé comme graphie fautive.
- Audio après correction : direct (KOMOUD1.mp3).
- Occurrences : **25** (A1.2 L21).

| Leçon | Champ | Id | Rôle | Texte actuel |
|---|---|---|---|---|
| A1.2 L21 | `scene[9].lu` | — | phrase à produire | D'Planz ass op der Kommod. |
| A1.2 L21 | `scene[9].aide` | — | aide de mission | Kommod est féminin → op der Kommod. |
| A1.2 L21 | `unites[1].phrase[0]` | 2 | aperçu d'unité | D'Planz ass op der Kommod. |
| A1.2 L21 | `unites[1].exemple` | 2 | aperçu d'unité | op der Kommod · nieft der Fotell · ënnert der Luucht |
| A1.2 L21 | `flashcards[18].lu` | 2019 | mot caché (lettres à reconstruire) | Kommod |
| A1.2 L21 | `flashcards[18].note` | 2019 | note / point d'attention | Féminin · op der Kommod |
| A1.2 L21 | `quiz[20].question` | 2021 | question de quiz | eng Kommod |
| A1.2 L21 | `quiz[26].question` | 2027 | question de quiz | D'Planz ass op der Kommod. |
| A1.2 L21 | `trous[12].apres` | 2013 | phrase à trous (contexte) | Kommod. |
| A1.2 L21 | `trous[12].note` | 2013 | note / point d'attention | Kommod est féminin → op der |
| A1.2 L21 | `trous[14].trou` | 2015 | réponse attendue | Kommod |
| A1.2 L21 | `trous[14].choix[0]` | 2015 | choix proposé | Kommod |
| A1.2 L21 | `trous[14].note` | 2015 | note / point d'attention | eng Kommod = une commode |
| A1.2 L21 | `trous[15].choix[1]` | 2016 | choix proposé | Kommod |
| A1.2 L21 | `trous[20].choix[2]` | 2021 | choix proposé | Kommod |
| A1.2 L21 | `trous[22].choix[2]` | 2023 | choix proposé | Kommod |
| A1.2 L21 | `trous[23].choix[1]` | 2024 | choix proposé | Kommod |
| A1.2 L21 | `trous[31].apres` | 2032 | phrase à trous (contexte) | Kommod. |
| A1.2 L21 | `trous[31].note` | 2032 | note / point d'attention | Kommod est féminin → op der (pas um) |
| A1.2 L21 | `trous[31].attention` | 2032 | note / point d'attention | Kommod est féminin → op der (pas um). |
| A1.2 L21 | `ecriture[11].lu` | 2012 | phrase à produire | D'Planz ass op der Kommod. |
| A1.2 L21 | `ecriture[16].lu` | 2017 | phrase à produire | eng Kommod |
| A1.2 L21 | `cours[1].lignes[0]` | — | cours | Objet féminin → der : op der Kommod, nieft der Fotell. |
| A1.2 L21 | `cours[4].items[0][0]` | — | cours | eng Kommod |
| A1.2 L21 | `cours[11].echanges[5][0]` | — | cours | D'Planz ass op der Kommod. |

### « verlobt » → « verloobt »

- Preuve LOD : graphie LuxApp **absente du LOD** ; graphie proposée **contrôlée** (`VERLOBEN1`).
- Audio après correction : aucun son direct (participe ; le MP3 prononce « verloben ») ; contexte possible.
- Occurrences : **11** (A1.1 L13).

| Leçon | Champ | Id | Rôle | Texte actuel |
|---|---|---|---|---|
| A1.1 L13 | `scene[5].lu` | — | phrase à produire | Nee, ech si verlobt. |
| A1.1 L13 | `flashcards[4].lu` | 2005 | mot caché (lettres à reconstruire) | verlobt |
| A1.1 L13 | `quiz[4].question` | 2005 | question de quiz | verlobt |
| A1.1 L13 | `trous[2].choix[3]` | 2003 | choix proposé | verlobt |
| A1.1 L13 | `trous[3].trou` | 2004 | réponse attendue | verlobt |
| A1.1 L13 | `trous[3].choix[0]` | 2004 | choix proposé | verlobt |
| A1.1 L13 | `ecriture[4].lu` | 2005 | phrase à produire | verlobt |
| A1.1 L13 | `cours[3].items[4][0]` | — | cours | verlobt |
| A1.1 L13 | `cours[13].lignes[0]` | — | cours | Dans cette leçon, devant un statut comme bestuet, gescheet, getrennt, gepacst, verlobt ou leedeg, on écrit souvent si au lieu de sinn. |
| A1.1 L13 | `cours[14].lignes[5][0]` | — | cours | verlobt |
| A1.1 L13 | `cours[14].lignes[5][2]` | — | cours | Hien ass verlobt. |

## Conservés (pas de correction)

| Mot | Raison | Occurrences |
|---|---|---|
| Kirchberg | nom propre officiel du quartier (forme française et allemande) ; forme luxembourgeoise « Kierchbierg » (KIERCHBIERG1). Conservé tant qu'aucune raison pédagogique ou orthographique vérifiée ne justifie le remplacement. | 24 (A1.1 L10) |
| siechzeg | graphie contrôlée par le LOD (variante de « sechzeg ») : pas de correction. | 21 (A1.1 L5) |
| eenasiechzeg | variante de « eenasechzeg » (entrée LOD propre, prononciation différente) : pas de correction, cohérente avec « siechzeg ». | 1 (A1.1 L5) |

## Points de contenu (sens), hors orthographe

| Mot | Constat LOD | Proposition |
|---|---|---|
| Posch | POSCH1 = « sac à main, sacoche » ; « poche » = Täsch (TASCH1). Leçon 6 : « eng Posch | zwou Poschen | deux poches ». | corriger la traduction (« deux sacs à main ») ou remplacer l'exemple par « eng Täsch | zwou Täschen | deux poches ». |
| trëppelen | TREPPELEN2 = « marcher sur, poser le pied sur » ; le sens « marcher, se promener » n'est pas confirmé par le LOD. Leçon 24 : « trëppelen | getrëppelt | marcher ». | à vérifier avec un locuteur ou une autre source avant toute modification. |
