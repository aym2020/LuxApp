# SPEC 47 — Leçon repliée : titre lisible, pastille « À rafraîchir » sous le titre

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Branche | `v2` |
| Périmètre | `public/chemin.js` (balisage de la pastille), `public/style.css`, `tests/test_chemin_cartes.py` |
| Origine | Capture Android de Clayton du 19/10/2026 : Leçon 2, titre écrasé en « Ide / d… » par « À rafraîchir · 11 » |

## Cause

Une règle de la spec 17 (`.carte-lecon.compacte { flex-wrap: nowrap; }`) laisse le numéro, le titre, le chevron et la pastille sur une seule ligne. La pastille garde toute sa largeur (`flex: none`), et le titre (`flex: 1; min-width: 0`) prend ce qui reste. Même sans pastille, à 320 px, le titre n'avait qu'environ 87 px : « L'habitatio », « nationalité ».

## Correction (CSS ciblé)

- **1re ligne** : numéro, titre (2 lignes au plus), chevron.
- **2e ligne, seulement si nécessaire** : la pastille, dans un conteneur `.carte-ligne2` qui occupe toute la largeur. Elle garde sa propre largeur, sous le titre.
- Le titre réserve au moins **8 em**, ce qui suit la taille du texte. S'il manque de place à côté du numéro (écran de 320 px, texte agrandi), il passe sous le numéro au lieu d'être coupé.
- Sans pastille, sur un écran courant (390 à 430 px, texte normal), la carte ne change pas : numéro et titre restent sur la même ligne.
- Le résultat des leçons terminées (étoiles, « Acquise · v1 »…) garde sa place (`order: 10`). La pastille vient après (`order: 11`).
- Aucun changement de progression.

## Critères d'acceptation

- [x] Avec pastille : titre jamais écrasé (au moins 40 % de la largeur de la carte), 2 lignes au plus, pastille sous le titre et dans la carte.
- [x] Aucun mot coupé faute de largeur, de 320 à 430 px, en texte normal et agrandi (125 %).
- [x] Sans pastille : hauteur inchangée par la présence de pastilles ailleurs ; compacte (une ligne) à partir de 390 px.
- [x] Titres courts et longs, A1.1 et A1.2, leçons terminées ou non.
- [ ] Recette Android réelle (Leçon 2).

## Tests

`tests/test_chemin_cartes.py` (nouveau, dans la suite critique) : 4 largeurs × 2 tailles de texte × 2 niveaux, toutes les cartes repliées, avec et sans pastille. Captures : `tests/captures/spec47-chemin-100.png` et `-125.png`.
