# SPEC 80 — Audit pédagogique et lisibilité de la leçon 0

Date : 20 octobre 2026. Statut : implémenté sur `v2`, recette visuelle Android à confirmer.

## 1. Constats et classification

- **Incohérence pédagogique réelle (quiz d'écoute)** : les distracteurs de l'unité 1 étaient surtout des graphies alternatives ou fautives du même mot (« wäiss / waiss / weiss »). L'enregistrement ne permet pas à lui seul de différencier leur orthographe. Remplacer par trois **autres mots réels étudiés** et disponibles en MP3 LOD pour chaque question. Les 9 `audioMot`, les réponses et les IDs restent inchangés.
- **Défaut d'ergonomie** : le titre de la leçon et le nom de l'unité 1 débordent sur deux lignes dans le Chemin mobile. Nouveau titre français : **Les bases** ; unité 1 : **Prononciation** ; unité 2 : **United Zoha**. Le titre luxembourgeois `Déi éischt Schrëtt` reste intact.
- **Charge cognitive excessive** : le callout « Écoute les graphies différentes » mélangeait longue consigne, plusieurs lettres, phrases d'exemple et renvoi audio, tout en répétant « Audio officiel LOD » neuf fois. Le cours « Les sons essentiels » garde trois lignes courtes, les cartes ne répètent plus la provenance et le Lexique reste la source des audios enregistrés.
- **Précision grammaticale** : la n-Reegel ne supprime pas arbitrairement tous les N ; elle concerne certaines terminaisons en fonction du début du mot suivant (voyelles, N D T Z H et fin d'énoncé). Le cours explicite que les séries `e/en`, `de/den`, `kee/keen` sont des aperçus approfondis plus tard. `Auto` et `Dësch` sont masculins en luxembourgeois malgré leur traduction française féminine.
- **Choix acceptable conservé** : les neuf graphies avec un fichier MP3 LOD réel, les exercices, exemples, distinctions `Gudde/Gudden` et les tables de lexique restent disponibles. Ne pas remplacer le son enregistré par une pseudo-transcription phonétique française.

## 2. Portée et compatibilité

- Données de la leçon 0 : uniquement intitulés, consignes de lecture, notes, callouts et distracteurs des quiz d'écoute. Aucun ID ni sens/réponse attendue ne change.
- Libellé « United Zoha » harmonisé dans le contenu pédagogique des leçons A1.1 0, 2, 5, 6, 8, 11, 14 et A1.2 23, 24, 25. Aucun exercice supplémentaire ni changement de correction.
- Aucun changement du moteur audio, des fichiers MP3, du parcours ou du système de progression.
- Les phrases `Dat ass`, `de/den` présentes dans la première leçon restent des exemples ; la grammaire des articles est ensuite enseignée en leçon 2.

## 3. Tests de recette

1. Chemin sur téléphone étroit : « Les bases », « Prononciation » et « United Zoha » restent sur une ligne sans diminuer les cibles tactiles.
2. Dans Cours > 1 > Règles : callout concis et compréhensible ; dans Lexique : neuf mots avec leurs audios LOD.
3. Quiz : l'écoute de chaque `audioMot` permet de choisir parmi quatre mots différents réellement enseignés, sans donner la réponse à l'écran ou accepter des fautes comme alternatives.
4. Cours > 2 : rappel « United Zoha », tableau Sans N / Avec N et exemples avec genre clarifié.
5. Script : `node tests/test_spec79.js` ; `node tests/test_spec75.js` ; `node tools/valider-lecons.js`.
6. Ne modifier aucun ancien identifiant de question : la progression actuelle demeure valable.

Source grammaticale : `grammaire_luxembourg.md` (genres de `den Auto`, `den Dësch`) et [étude linguistique de la n-Reegel](https://orbilu.uni.lu/bitstream/10993/34559/1/LIN-00943_PG.pdf).
