# SPEC 79 — Leçon 0 : prononciation LOD et UNITEDZOHA

| Champ | Décision |
|---|---|
| Portée | A1.1 : nouvelle leçon 0 (2 unités) et remplacement de l'unité 2 de la leçon 2 |
| Statut | Implémentée sur v2 ; validation Android à confirmer |
| Sources | \`grammaire_luxembourg.md\`, LOD \`n-Reegel\`, index MP3 LOD versionné dans \`public/audio/lod.json\` |
| Objectif | Comprendre dès le départ les graphies non françaises et le N final variable |

## 1. Progression pédagogique

### Leçon 0 — Bien démarrer : les sons et la règle du N

**Unité 1 — Les sons différents du français** : ne pas réciter les 26 lettres, travailler neuf graphies fréquentes par mots entendus :
\`wäiss\` (W), \`Jo\` (J), \`zéng\` (Z), \`Schoul\` (SCH), \`Stull\` (ST initial), \`Buch\` (CH), \`Fënster\` (Ë), \`Äddi!\` (Ä) et \`schéin\` (ÉI). Ce sont neuf entrées présentes dans \`public/audio/lod.json\` avec un MP3 physiquement versionné dans \`public/audio/lod/\`. Indications françaises = approximations d'orientation ; écouter le natif prime. Flashcards puis quiz d'écoute (\`audioMot\` lu à la demande), trous contextualisés, production du mot à partir du français. Pas de synthèse vocale ni audio inventé.

**Unité 2 — UNITEDZOHA** : dans les formes susceptibles d'alterner, le N final reste devant les voyelles, N, D, T, Z, H et normalement en fin d'énoncé ; il tombe devant la plupart des autres consonnes. Paires \`Gudde Moien! / Gudden Owend!\`, \`e Stull / en Auto\`, \`de Bus / den Auto\`, \`kee Bus / keen Auto\`. Ne pas enseigner une suppression universelle des N des radicaux. Les exercices de reconnaissance, trous et écriture portent sur les formes explicitement enseignées. \`Dat ass\` expliqué en cours.

### Leçon 1

Conserve les rappels déjà présents : \`Gudde Moien\` / \`Gudden Owend\` ; \`Ech heesche Paul\` / \`Ech heeschen Anna\`. Aucun exercice ne change.

### Leçon 2

Unité 1 inchangée dans son cœur, renvoie à la règle du N pour \`e/en\`. **Unité 2 remplacée** par les articles définis \`de/den/d'\` : masculin \`de/den\` selon UNITEDZOHA ; féminin et neutre \`d'\`, attaché au nom. Distinguer « un/une » de « le/la/l' » dès les consignes d'écriture ; genre luxembourgeois, non français. Unité 3, questions et négation, conservée. Mission : les trois répliques de l'unité 2 sont adaptées à l'article défini, \`version=3\`.

## 2. Compatibilité technique

- Nouveau fichier \`data/lecons/A1.1/lecon-00.json\`, \`id=0\` : le serveur le charge et le trie numériquement avant 1 ; aucun renommage des identifiants 1–27.
- Cours : structure SPEC 75 commune \`regles / lexique / phrases\`, 2 unités ; pas de mission narrative artificielle pour cette leçon de préparation.
- Quiz d'écoute : \`quiz[].audioMot\` facultatif, rendu par \`boutonEcouterHtml(audioMot, true)\`, sans afficher le terme audio en libellé accessible avant la réponse. Lecture déclenchée volontairement. Taille tactile 56 px et préférence de réduction des mouvements respectée par le reste de l'application.
- Article \`d'\` : mot caché et affichage doivent concaténer **sans espace** \`d'\` + nom. Autres articles gardent leur espace.
- Progression : l'ancien score \`progress[2].unites[2]\`, anciens « Sans faute » et snapshots restent **intacts** ; la nouvelle unité 2 utilise la clé dédiée \`2-definis-v1\`. L'ancien résultat ne doit **jamais** débloquer la nouvelle unité. Identifiants de questions nouveaux \`2701+\`, indépendants des scores historiques. Mission v3 garde les succès/score de la mission v2 sous leurs anciennes clés : les acquis historiques ne sont pas effacés.
- L'intégralité de l'ancienne unité 2 (unités, questions, scènes et cours) est sauvegardée à titre d'archive d'audit dans \`data/archives/lecon-02-unite-02-avant-spec79.json\` ; cette archive n'est pas chargée comme une leçon active.
- Les utilisateurs ayant déjà pratiqué ne sont pas renvoyés arbitrairement au début : la leçon 0 est accessible dans le chemin et les révisions. Les nouveaux utilisateurs A1.1 commencent par la leçon 0.
- Une session de parcours laissée ouverte avant la migration de l'unité 2 peut contenir des ID de questions supprimés. Au chargement, `loadRun()` identifie ces ID inconnus, copie cette session sous une clé `:archive79`, marque la session active comme terminée et permet d'ouvrir une nouvelle session. Les résultats sauvegardés restent intacts.
- Les champs et IDs des leçons 1 et 3 à 27 demeurent identiques.

## 3. Contrôles de qualité

\`node tests/test_spec79.js\` : 26 leçons A1.1/A1.2, structure et IDs, 9 MP3 LOD physiques, quiz audio qui ne révèle pas sa réponse dans le bouton, tables et règles, entrée id0 en premier, pas de trous sans réponse, genre/élision \`d'\`, séparation des clés de progression et anciens acquis intacts.

\`node tests/test_spec75.js\` : SPEC 75 actualisée à 26 leçons et au lexique remanié de la leçon 2.

\`node tools/valider-lecons.js\` et \`bash tools/critique.sh\` : validation générale. La leçon 0 étant volontairement introductive, l'avertissement « pas de mission » est attendu. Une recette mobile doit vérifier l'écoute (autoplay jamais requis), le mot caché \`d'Mapp\`, les scores historiques et la navigation 0 → 1 → 2.

## 4. Références linguistiques

- LOD, \`n-Reegel\` : https://lod.lu/artikel/nreegel1
- Données LOD officielles et graphies : https://data.public.lu/fr/datasets/letzebuerger-online-dictionnaire-lod-index-vun-der-sich-funktioun/
- Fichier de référence interne : \`grammaire_luxembourg.md\` (articles, formes, exemples).

## Après audit — SPEC 80

La leçon 0 utilise désormais le titre court **« Les bases »**, les unités **« Prononciation »** et **« United Zoha »**. Les quiz audio ne demandent plus de choisir entre des graphies phonétiquement indistinguables, mais de reconnaître l'un des neuf mots réellement entendus. Les règles ont été abrégées, la terminologie harmonisée et les genres luxembourgeois des noms Auto/Dësch précisés. Voir `docs/specs/SPEC-80.md`.
