# Tests de LuxApp v2

Tous les tests tournent contre un serveur local.

```bash
npm install                      # une fois
pip install playwright           # une fois (Chromium déjà installé ou : playwright install chromium)
PORT=3456 node server.js &       # serveur de test
```

| Commande | Ce qu'elle vérifie | Durée |
| --- | --- | --- |
| `node tools/valider-lecons.js` | Format et cohérence des leçons | 1 s |
| `node tests/test_cloud.js` | La v1 (branche main) garde les données v2 après fusion cloud | 1 s |
| `python3 tests/test_lot1.py` | Lot 1 : guide, première visite, accueil, mission, aide à l'erreur | ~1 min |
| `node tests/test_sync.js` | Lot 2 (S8, S13) : séance, partie et niveau synchronisés, le plus récent gagne | 1 s |
| `python3 tests/test_lot2.py` | Lot 2 : niveau choisi, chemin, accueil, barre du bas, animations | ~40 s |
| `python3 tests/test_lot3.py` | Lot 3 : article à écrire (S5), « Tente ta chance » (S10), palette, animations des exercices, largeurs 320–430 px (S12) | ~30 s |
| `python3 tests/test_migration.py` | Leçons migrées (1, 3, 4, 5, 6) : chaque unité et la mission jouées sans faute | ~2 min |
| `python3 tests/test_parcours.py` | Parcours d'une leçon en unités | ~1 min |
| `python3 tests/test_seance.py` | Séance du jour : quitter puis reprendre | ~30 s |
| `python3 tests/test_etalement.py` | Étalement de l'historique v1 | ~10 s |
| `node tests/test_lot2_contenu.js` | Lot 2 : six JSON, unités, scènes, distracteurs, IDs et cours | ~1 s |
| `node tests/test_lot3_contenu.js` | Lot 3 : leçons 14–17, missions, cours, V1, taille du cœur, distracteurs et doublons | ~1 s |
| `python3 tests/test_fil.py` | Leçon complète avec mission, « + », bonus, séance | ~5 min |
| `python3 tests/captures_ecrans.py avant` | Captures des écrans à 320, 360, 390, 430 px | ~30 s |

Les captures vont dans `tests/captures/` (ignoré par git).
Autre adresse de serveur : `LUX_URL=http://localhost:8080/ python3 tests/...`.
Texte agrandi : `LUX_TEXTE=130 python3 tests/captures_ecrans.py apres`.
