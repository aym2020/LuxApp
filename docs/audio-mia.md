# MP3 luxembourgeois avec Mia

Outil intégré à LuxApp, branche `v2`. Les enregistrements natifs du LOD ne sont **jamais remplacés**. Les phrases et mots qui n'ont pas d'enregistrement LOD exact reçoivent un MP3 synthétisé par Mia ; les anciens sons contextualisés sont conservés.

**Inventaire :** `node tools/audio-mia.js --dry-run`

**Génération :** `node tools/audio-mia.js --voice=mia` ; essai limité : `node tools/audio-mia.js --limit=10`.

Les MP3 sont stockés dans `public/audio/mia/`, les correspondances dans `public/audio/mia.json`. Le générateur est incrémental : une deuxième exécution saute les fichiers existants. Il utilise les données vocales RHVoice du gouvernement luxembourgeois depuis https://accessibility-luxembourg.github.io/rhvoice-emscripten-lb/, exécutées dans Chromium puis converties en MP3 par FFmpeg. Aucune clé ni API payante.

Dépendances (pour la génération uniquement) : Node 22, FFmpeg, `npm install --no-save --no-package-lock playwright`, `npx playwright install chromium`. GitHub Actions lance la génération à l'ajout de l'outil sur `v2`, avec relance manuelle possible. La synthèse ne remplace pas une validation à l'oreille, notamment pour les noms propres. Tester sur Android après livraison des MP3.

**Contrôles :** `node tests/test_audio_mia.js` et `node tests/test_spec81_audio.js`. Les voix RHVoice sont publiées en logiciel libre ; les licences des composants restent applicables.
