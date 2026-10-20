# MP3 luxembourgeois avec Mia

Outil intégré à LuxApp, branche `v2`. Les enregistrements natifs du LOD ne sont **jamais remplacés**. Les phrases et mots qui n'ont pas d'enregistrement LOD exact reçoivent un MP3 synthétisé par Mia ; les anciens sons contextualisés sont conservés.

**Inventaire :** `node tools/audio-mia.js --dry-run`

**Génération :** `node tools/audio-mia.js --voice=mia` ; essai limité : `node tools/audio-mia.js --limit=10`.

Les MP3 sont stockés dans `public/audio/mia/`, les correspondances dans `public/audio/mia.json`. Le générateur est incrémental : une deuxième exécution saute les fichiers existants. Il utilise les données vocales RHVoice du gouvernement luxembourgeois depuis https://accessibility-luxembourg.github.io/rhvoice-emscripten-lb/, exécutées dans Chromium puis converties en MP3 par FFmpeg. Aucune clé ni API payante.

Dépendances (pour la génération uniquement) : Node 22, FFmpeg, `npm install --no-save --no-package-lock playwright`, `npx playwright install chromium`. GitHub Actions lance la génération à l'ajout de l'outil sur `v2`, avec relance manuelle possible. La synthèse ne remplace pas une validation à l'oreille, notamment pour les noms propres. Tester sur Android après livraison des MP3.

**Contrôles :** `node tests/test_audio_mia.js` et `node tests/test_spec81_audio.js`. Les voix RHVoice sont publiées en logiciel libre ; les licences des composants restent applicables.

## SPEC 87 — Couverture audio LOD exact puis Mia (20/10/2026)

**Périmètre actif :** les 26 leçons (cartes, écriture et variantes, scènes, découvertes, tableaux et exemples des cours) et les 8 examens publiés (textes corrigés, questions, preuves et réponses). Les 25 missions de data/missions/missions-25.json sont des brouillons exclus ; les scènes des missions actives restent incluses.

**Priorité :** 1. LOD enregistrant le mot ou la phrase exacte. 2. Mia enregistrant l'expression entière. 3. En dépannage, le son LOD d'un nom isolé si Mia n'a pas encore été généré. Un MP3 LOD de Stull n'est pas un audio complet de de Stull ; idem pour Faarf et d'Faarf. Dans ces cas, une synthèse Mia de la forme intégrale est prévue, sans remplacer le fichier LOD lexical.

**Examens :** aucune aide sonore pendant une épreuve de lecture. Les boutons d'écoute sont présents uniquement pendant la correction ; les trous sont complétés par les bonnes réponses avant synthèse. Aucun autoplay.

**Pipeline :** tools/audio-mia.js inventorie désormais les contenus actifs et les examens. .github/workflows/audio-mia.yml se déclenche après modification du générateur, d'une leçon, d'un examen ou des index LOD, lance RHVoice Mia et versionne les MP3, l'index public/audio/mia.json et docs/audit-audio-complet.json sur v2. Une génération interrompue peut se poursuivre lors d'une relance manuelle.

**Contrôle :** node tools/audit-audio-complet.js --write mesure le taux de couverture ; node tests/test_audio_mia.js --strict impose zéro MP3 manquant après génération. Si le workflow échoue ou reste incomplet, ne pas annoncer 100 %. Tous les index existants doivent pointer vers des fichiers présents.

**Qualité :** réécouter des exemples avec noms propres, nombres, phrases complexes et voyelles particulières. La présence d'un MP3 ne prouve pas l'exactitude phonétique.
