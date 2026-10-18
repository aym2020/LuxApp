# SPEC 37 — Boutons « Continuer » verts : plus d'anneau jaune après Entrée

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Branche | `v2` |
| Périmètre | `public/ui.js`, `public/style.css`, tests |
| Origine | Remarque de Clayton du 18/10/2026 : cadre jaune sur « Continuer » en mission, absent en Mot caché |
| Précise | [SPEC 35](./SPEC-35.md) (qui tolérait l'anneau après Entrée) |

## Décision

Même aspect partout : le bouton vert « Continuer » n'a **jamais** d'anneau jaune quand le focus vient du code (après une validation avec Entrée). Entrée continue toujours (le focus reste sur le bouton).

Le vrai focus clavier (Tab / Shift+Tab) garde son anneau jaune : accessibilité conservée.

## Implémentation

- `focusApresClavier()` (`ui.js`) ajoute la classe `focus-auto` au bouton avant de lui donner le focus.
- `style.css` : `.focus-auto:focus-visible { outline: none; }`.
- Concerne mission (`#ms-continuer`) et parcours / Mot caché (`#pc-continuer`).

## Critères d'acceptation

- [x] Mission, réponse validée avec Entrée : « Continuer » sans contour jaune, Entrée continue.
- [x] Réponse validée au clic : aucun focus (inchangé).
- [x] Bouton atteint avec Tab : anneau jaune visible.

## Tests

`tests/test_mission_vies.py` (contour absent après Entrée), suite critique.
