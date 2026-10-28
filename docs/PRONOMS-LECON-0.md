# Leçon 0 — unité 3 : pronoms personnels (28 octobre 2026)

## Pédagogie

La leçon enseigne **vous = Dir** une seule fois, sans distinguer le pluriel et la politesse. Découverte guidée : **8 cartes**, suivies de **8 quiz**. Les autres leçons peuvent réutiliser les pronoms sans les réintroduire.

L'onglet Règles présente un tableau à deux colonnes utilisant le verbe **sinn (être)** avec l'adverbe « do » (là) :

| Français | Luxembourgeois · Exemple |
|---|---|
| Je | ech · Ech sinn do. |
| Tu | du · Du bass do. |
| Il | hien · Hien ass do. |
| Elle | si / hatt · Si ass do. |
| Nous | mir · Mir sinn do. |
| Vous | Dir · Dir sidd do. |
| Ils / Elles | si · Si sinn do. |

La règle du N se rappelle simplement : **Hie kënnt.** / **Vu wou kënnt hien?**. *si* peut aussi signifier « ils / elles » ; *hatt* s'emploie notamment pour une personne désignée par un prénom féminin.

## Audio

Avant ce correctif, LOD : **si** ; Mia : **ech, du, mir**. Il manquait **hien, hatt, Dir** : le bouton partagé `boutonEcouterHtml` masque une icône sans fichier audio indexé. La découverte réutilise maintenant ce bouton. Un workflow GitHub Actions génère avec la voix Mia existante les trois MP3 manquants, les enregistre dans `public/audio/mia/` et actualise `public/audio/mia.json`. Aucun MP3 LOD n'est remplacé. Si la génération échoue, les nouveaux sons ne sont pas considérés livrés.

## Compatibilité

Les unités 1–2, leurs 20 écoutes LOD, 15 choix avec/sans N et la mission à huit défis restent inchangés. L'ID 3227 (seconde distinction de « vous ») est retiré et jamais réaffecté ; l'ID 3228 reste « Vous » et attend « Dir ». Les autres IDs et la clé `0-pronoms-v1` sont conservés : aucun effacement des données historiques.

## Vérifications

`node --test test/pronoms-lecon0.test.cjs`, `node tests/test_spec79.js`, `node tests/test_spec82_studio.js`, `node tools/valider-lecons.js` ; tests audio, navigateur 320–430 px puis validation tactile Samsung. Rejouer l'unité 3 après mise à jour pour découvrir le contenu simplifié. Le test CI n'atteste pas de la prononciation à l'oreille.

Références : LLO sur les pronoms personnels, `https://sproo.lu/fr/conjugaison/sinn`, `docs/audio-mia.md`.

## Livraison audio vérifiée

Génération Mia terminée sur `2.1` (commit audio `ab76d57`) : fichiers physiques et index vérifiés pour **hien**, **hatt** et **Dir** ; les sept entrées du lexique ont désormais un fichier LOD ou Mia. Un audit complémentaire a identifié cinq références historiques omises de la nouvelle version de l'index ; elles ont été restaurées, et la fonction `save()` fusionne dorénavant les anciennes entrées afin de préserver la bibliothèque lors des générations futures. Deux tests protègent cette conservation et la couverture complète des pronoms.
