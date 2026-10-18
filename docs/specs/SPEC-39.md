# SPEC 39 — Outillage de test : suite critique en ~1 min 30 sans perte de couverture

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Branche | `v2` |
| Périmètre | `tools/critique.sh` (nouveau), `tests/helpers.py` (nouveau), `tests/test_parcours.py`, `tests/test_retours.py`, `tests/test_retour_intro.py`, `tests/test_fil.py`, `tests/test_migration.py`, `PLAYBOOK.md`, `tests/README.md` |
| Origine | Demande de Clayton du 18/10/2026 : réduire drastiquement les temps de traitement sans négliger la qualité |

## Constat (mesures du 18/10/2026)

La suite critique durait **~6 min** (357 s de tests navigateur, en série). Trois tests faisaient 80 % du temps : `test_retour_intro` 116 s, `test_retours` 93 s, `test_parcours` 73 s.

Cause principale : après chaque bonne réponse de quiz ou de trou, l'app attend 0,9 à 1,5 s avant de passer à la suite (`pTimer`). Les tests subissaient ce délai des centaines de fois, avec parfois une attente fixe de 1,7 s en plus.

## Changements

- **`tests/helpers.py`** : helpers communs (`ouvrir`, `vue`, `item_courant`, `repondre`, `finir`, `masquer_regles_vies`). `passer_delai()` appelle tout de suite `reussir()`, la même fonction que l'app, sans le délai.
- **Couverture conservée** : le vrai passage automatique après le délai est vérifié une fois, explicitement, dans `test_parcours.py`.
- **Tests migrés** sur `passer_delai` : `test_parcours`, `test_retours`, `test_retour_intro` (entièrement sur les helpers), `test_fil`, `test_migration`.
- **`tools/critique.sh`** : une commande pour toute la suite critique. Elle démarre le serveur si besoin, récupère `main` pour `test_cloud.js`, lance les tests navigateur 2 par 2 (les plus longs d'abord), donne la durée par test, le détail des échecs et un verdict « ne pas pousser ». `rapide` = syntaxe, contenu et tests Node seulement.
- **PLAYBOOK §8** : tableau « fichier modifié → tests ciblés », règles de vitesse (une suite par lot, helpers obligatoires pour les nouveaux tests, pas d'attente fixe).

## Résultat

| Mesure | Avant | Après |
|---|---|---|
| `test_retour_intro` | 116 s | 31 s |
| `test_retours` | 93 s | 39 s |
| `test_parcours` | 73 s | 25 s |
| Suite critique complète | ~6 min | **87 s** |
| `test_migration` (avant fusion) | ~45 min | ~16 min |

Mêmes tests, mêmes assertions (plus une vérification explicite du délai réel). Aucun code applicatif modifié.

## Critères d'acceptation

- [x] Suite critique verte avec `bash tools/critique.sh`, en moins de 2 min.
- [x] Le passage automatique réel après une bonne réponse reste testé.
- [x] Un échec de test fait sortir le script en erreur, avec le détail.
- [x] `test_migration.py` : 23 leçons jouées sans erreur en 15 min (limite de mesure atteinte avant les 2 dernières), contre ~45 min avant pour l'ensemble. Estimation : ~16 min. Test hors suite critique (avant fusion dans `main`).
