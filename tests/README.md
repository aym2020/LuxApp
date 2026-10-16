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
| `python3 tests/test_parcours.py` | Parcours d'une leçon en unités | ~1 min |
| `python3 tests/test_seance.py` | Séance du jour : quitter puis reprendre | ~30 s |
| `python3 tests/test_etalement.py` | Étalement de l'historique v1 | ~10 s |
| `python3 tests/test_fil.py` | Leçon complète avec mission, « + », bonus, séance | ~5 min |
| `python3 tests/captures_ecrans.py avant` | Captures des écrans à 320, 360, 390, 430 px | ~30 s |

Les captures vont dans `tests/captures/` (ignoré par git).
Autre adresse de serveur : `LUX_URL=http://localhost:8080/ python3 tests/...`.
Texte agrandi : `LUX_TEXTE=130 python3 tests/captures_ecrans.py apres`.
