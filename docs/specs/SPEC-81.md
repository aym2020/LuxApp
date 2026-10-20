# SPEC 81 — Lecture audio fiable en quiz (Android/PWA)

Date : 20 octobre 2026.
Statut : Implémenté sur `v2`. Vérification visuelle/réseau sur téléphone **encore nécessaire**.

## Incident

Capture sur l'étape 2 (Quiz) de la leçon 0 : le bouton haut-parleur est présent, mais déclenche « Audio indisponible pour le moment ». Ce blocage rend le quiz de discrimination auditive inexploitable.

## Diagnostic établi

- Les 9 noms de fichiers des questions de la leçon 0 sont résolus par `public/audio/lod.json` et les 9 MP3 existent physiquement dans l'arbre Git de `v2` ; par exemple `lod/WAISS1.mp3`, 14 801 octets.
- L'ancien `jouerAudio` essayait une seule URL **relative** `audio/lod/WAISS1.mp3`, puis affichait un message identique pour toutes les erreurs (réseau, média, permissions).
- La capture ne permet pas d'affirmer quel échec précis survient sur le déploiement Render : une réponse réseau ou une validation réelle du fichier sur l'appareil est encore nécessaire. Il serait incorrect de déclarer le défaut définitivement résolu sans cette recette.

## Correctif

1. Résoudre les fichiers à partir du chemin absolu `/audio/<fichier>`, indépendant de la route de la PWA.
2. Pour un fichier `lod/<ID>.mp3` seulement, si le lecteur échoue, tenter **une seule fois** l'enregistrement LOD correspondant sur son miroir vérifié, déjà utilisé par `tools/audio-lod.js` pour le téléchargement original. On ne crée **aucun son artificiel** et aucun autre mot : même ID MP3.
3. Pour `lod-phrases/<ID>.m4a`, lecture locale seulement ; jamais de miroir MP3 inapproprié.
4. Les événements `onerror` et les rejets de `play()` sont consolidés : une seule relance et un seul message après deux échecs, sans fausse erreur si un ancien lecteur a été annulé.
5. Distinguer `NotAllowedError` (permission de lecture) d'une indisponibilité du fichier, sans seconde requête inutile.
6. Filtrer strictement les chemins audio d'index (dossiers `lod/` et `lod-phrases/`, extensions permises, aucun `../`).
7. Ne pas changer les données de leçon, les IDs, la progression ou la correction.

## Tests

`node tests/test_spec81_audio.js` : URL absolue, 9 mots indexés, réussite locale, bascule miroir, deux échecs, une seule notification, refus des chemins traversants, compatibilité M4A et absence de faux toast après changement de son.

Non-régression recommandée : `node tests/test_spec79.js` et `node tests/test_audio_lod.js`.

## Recette Android requise

Ouvrir la leçon 0 > unité 1 > Quiz, appuyer sur l'icône de son. Vérifier que les 9 mots sont audibles dans des conditions mobiles réelles. Si le son échoue encore, consulter la console Android : la ligne `[LuxApp audio]` comporte le nom, la source tentée (1 = locale ; 2 = miroir) et le type d'échec. Contrôler les requêtes HTTP `/audio/lod/<ID>.mp3` ; le vrai statut de production n'est pas connu ici.
