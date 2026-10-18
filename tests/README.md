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
| `python3 tests/test_migration.py` | Les 24 leçons migrées : chaque unité et la mission jouées sans faute | ~45 min |
| `python3 tests/test_parcours.py` | Parcours d'une leçon en unités | ~1 min |
| `python3 tests/test_navigation.py` | Chemin en accordéon, Retour (et bouton Retour du téléphone) vers l'écran précédent, mission en conversation | ~20 s |
| `python3 tests/test_motcache.py` | Mot caché : découverte du mot nouveau, reconstruction avec des lettres mélangées (sans clavier) | ~10 s |
| `python3 tests/test_decouverte.py` | Spec 18 : explorer une leçon sans la commencer, Retour vers l'introduction | ~15 s |
| `python3 tests/test_libre.py` | Spec 22 : refaire une unité ne change pas la prochaine étape, parties principale et libre gardées, migration | ~15 s |
| `node tests/test_correction.js` | Spec 24 : coquille ou erreur (inversions, touches voisines, articles, négations…) | 1 s |
| `python3 tests/test_mission_vies.py` | Spec 23 : 3 vies, réponses autonomes, Tente ta chance, coquille en écriture | ~20 s |
| `python3 tests/test_retours.py` | Specs 25 et 28 : Accueil, Retour, Retour à la leçon (cadrage sous l'en-tête), écran de résultats | ~40 s |
| `python3 tests/test_seance.py` | Séance du jour : quitter puis reprendre | ~30 s |
| `python3 tests/test_etalement.py` | Étalement de l'historique v1 | ~10 s |
| `node tests/test_lot2_contenu.js` | Lot 2 : six JSON, unités, scènes, distracteurs, IDs et cours | ~1 s |
| `node tests/test_lot3_contenu.js` | Lot 3 : leçons 14–17, missions, cours, V1, taille du cœur, distracteurs et doublons | ~1 s |
| `node tests/test_lot4_contenu.js` | Lot 4 : leçons A1.2 (20, 23–26), exercices, cours, missions et anciens acquis | ~1 s |
| `python3 tests/test_fil.py` | Leçon complète avec mission, « + », bonus, séance | ~5 min |
| `python3 tests/captures_ecrans.py avant` | Captures des écrans à 320, 360, 390, 430 px | ~30 s |

Les captures vont dans `tests/captures/` (ignoré par git).
Autre adresse de serveur : `LUX_URL=http://localhost:8080/ python3 tests/...`.
Texte agrandi : `LUX_TEXTE=130 python3 tests/captures_ecrans.py apres`.
