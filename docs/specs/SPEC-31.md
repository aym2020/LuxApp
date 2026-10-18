# SPEC 31 — Mot caché : premier clic perdu sur PC

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Référence | Branche `v2` |
| Périmètre | `public/parcours.js` |

## Constat

Sur PC, dans le mot caché, le premier clic sur une lettre n'est pas pris en compte ; les suivants fonctionnent. Pas de problème sur téléphone.

## Cause (confirmée par test)

Sur PC, le champ de saisie invisible reçoit le focus d'office (`focusSiClavierPhysique`). Au clic sur une tuile, le champ perd le focus avant la fin du clic : `mcMajFocus()` appelait `renderCases()`, qui recréait aussi toutes les tuiles (`renderTuiles()`). Le bouton cliqué disparaissait, le `click` n'arrivait jamais. Sur téléphone, pas de focus automatique, donc pas de perte de focus.

## Correction

`renderCases(avecTuiles = true)` : `mcMajFocus()` appelle `renderCases(false)` et ne met à jour que les cases (le curseur dépend du focus). Les tuiles ne dépendent pas du focus ; elles restent les mêmes boutons.

## Critères d'acceptation

- [x] PC : le 1er clic sur une tuile pose la lettre ; le 2e aussi.
- [x] PC : ⌫ et clavier physique fonctionnent après les clics.
- [x] Téléphone : comportement inchangé (`tests/test_motcache.py`).
- [ ] Recette sur un vrai PC (Chrome, Brave).

## Tests

`tests/test_motcache.py` : scénario PC (souris, focus automatique). Sans la correction, il échoue sur « clic n°1 perdu ». Suite critique verte.
