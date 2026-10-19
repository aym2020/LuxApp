# SPEC 69 — Sons LOD : correspondances vérifiées, relance autonome, phrases enregistrées

| Champ | Valeur |
|---|---|
| Priorité | P1 — audio |
| Statut | **Implémentée sur `v2` — mots en ligne ; phrases en attente d'accès à `lod.lu`** |
| Complète | SPEC 66 et 68 |
| Fichiers | `tools/audio-lod.js`, `tools/lod/construire-index.js`, `tools/lod/lod-index.json.gz`, `tools/lod/correspondances.json`, `public/audio/lod*`, `public/dialogue.js`, `public/app.js`, `public/mission.js`, `public/parcours.js`, `PLAYBOOK.md` |

## 1. Table de correspondance (mots)

- `tools/lod/correspondances.json` : 70 mots dont le sens a été vérifié à la main dans le LOD (nombres, prépositions, mots sans traduction française dans le LOD, homographes tranchés par le sens de la leçon : « Franséisch » langue = `FRANSEISCH2`, « Schlecht. » = adverbe `SCHLECHT2`, « Jo » = particule `JO1`…).
- Contrôles conservés pour ces entrées : identifiant présent dans l'index, mot LOD identique au mot de la carte, MP3 valide.
- Résultat : **442 mots** avec son (372 → 442). Restent sans son : 211 expressions, 63 mots absents du LOD, 4 sens différents (« Dat sinn », « Still », « Becheren », « gemaach ») et « ganzdaags » (absent du miroir).

## 2. Relance autonome

- L'export XML LOD (100 Mo) n'est plus nécessaire : `tools/lod/construire-index.js` en extrait un index compact versionné (`lod-index.json.gz`, 3,5 Mo : mots, catégories, API, sens français, 57 360 exemples).
- Après l'ajout de leçons, Claude lance `node tools/audio-lod.js` (`--essai` pour relire sans télécharger) : il ne télécharge que les sons manquants et affiche le rapport des refus. Inscrit au PLAYBOOK (contrôles du dossier `data/lecons/`).
- Reconstruire l'index seulement quand le LOD publie une nouvelle version.

## 3. Phrases enregistrées du LOD

- Les exemples du XML (`example/@id`) sont comparés aux phrases des leçons : cartes de plusieurs mots, écriture, scènes de mission, aides de vocabulaire, dialogues et tableaux du cours.
- Correspondance seulement si le texte est identique après normalisation de la casse, des espaces, des apostrophes et de la ponctuation. Les exemples avec une partie entre parenthèses (facultative) sont exclus. Jamais l'enregistrement d'une phrase différente.
- Source : `https://lod.lu/uploads/examples/AAC/{2 premiers caractères}/{ID}.m4a`, contrôle du conteneur M4A (`ftyp`). Stockage `public/audio/lod-phrases/`, table `public/audio/lod-phrases.json`.
- Rapport actuel : 1 329 phrases dans les leçons, **25 trouvées** dans le LOD (ex. « Ech wunnen zu Metz. », « Wéi vill Auer ass et? », « Merci gläichfalls! »), 1 304 non trouvées, 3 avec plusieurs enregistrements du même texte (le premier est gardé).
- **Bloqué** : l'environnement de Claude n'a pas accès à `lod.lu` (refus du proxy). Dès que `lod.lu` est ajouté aux domaines autorisés (claude.ai → Settings → Capabilities), relancer `node tools/audio-lod.js`.
- Boutons « Écouter » prêts (sans lecture automatique) : dialogues du cours, scénario de la mission (aperçu), corrections d'écriture (étapes et révisions). Ils n'apparaissent que pour une phrase dont le son existe.

## 4. Plus tard

- Synthèse vocale luxembourgeoise pour les phrases sans enregistrement LOD (à évaluer : qualité à vérifier).

## Recette

- [x] Suite critique verte ; `tests/test_audio_lod.js` (correspondances appliquées, MP3/M4A valides).
- [x] Recherche de phrase : « ech wunnen zu Metz » trouve l'enregistrement de « Ech wunnen zu Metz. », « Ech wunnen zu Paris. » n'en trouve aucun.
- [ ] Téléchargement des phrases après ouverture de `lod.lu`.
