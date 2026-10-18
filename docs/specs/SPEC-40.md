# SPEC 40 — Correction lisible, rappels des erreurs limités, retour au chemin après « Refaire mes erreurs »

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Branche | `v2` |
| Périmètre | `public/parcours.js`, `public/chemin.js`, `public/navigation.js`, `public/style.css`, `tests/test_rappels.py` (nouveau) |
| Origine | Retours de Clayton du 18/10/2026 |

## 1. Phrase « reviendra » collée à la réponse

**Cause :** sans point d'attention, la correction concaténait `<b>réponse</b>` et « Cette phrase reviendra… » sans séparateur (mot caché, quiz/trous, écriture ×2).

**Correction :** `rappelHtml()` met toujours cette phrase dans son propre bloc (`.pc-fb-rappel`).

## 2. Après « Refaire mes erreurs » : le chemin, centré sur la leçon

- Résultats d'une partie « Refaire mes erreurs » : l'action principale devient **« Mon chemin »** (`cheminSurLecon`) ; « Retour à la leçon » reste dans les actions secondaires.
- Le chemin s'ouvre leçon **dépliée** et **centrée** dans la zone visible (`centrerLeconChemin`). Si la carte est plus haute que l'écran, elle est alignée en haut.
- Le Retour (flèche, téléphone) depuis ces résultats centre aussi la leçon.
- Les autres retours vers le chemin gardent le cadrage de la SPEC 25.

## 3. Répétition des erreurs

**Logique constatée :** une question ratée (ou juste seulement au 2e essai) repart en fin d'étape, **sans limite**. Elle ne sort qu'une fois réussie du premier coup.

**Règle :**
- Le principe de maîtrise au premier essai est conservé.
- Réussie du premier coup à son rappel : la question sort immédiatement de la file (inchangé).
- **Au plus 2 rappels par question dans une partie** (`RAPPELS_MAX = 2`, soit 3 passages au plus). Au-delà, la question sort de la partie.
- Une question sortie reste une erreur : elle apparaît dans les résultats, dans « Refaire mes erreurs » et dans les révisions, qui se basent sur le 1er passage.
- La règle est expliquée sous la correction :
  - 2e essai juste : « Pour la valider, trouve-la du premier coup : elle reviendra à la fin de l'étape. »
  - dernier passage : « Tu la retrouveras dans « Refaire mes erreurs » et dans tes révisions. »
- Les parties sauvegardées avant ce changement restent compatibles : le compteur `step.rappels` est créé au besoin.

## Critères d'acceptation

- [x] Réponse et phrase « reviendra » dans deux éléments distincts.
- [x] Question ratée à chaque fois : 3 passages au plus (écriture et quiz), puis message « révisions ».
- [x] Après la limite, la question reste dans `pResultat.erreurs`.
- [x] Ratée puis réussie du premier coup à son rappel : sort tout de suite.
- [x] « Refaire mes erreurs » → « Mon chemin » ou Retour : chemin, leçon dépliée et centrée.
- [ ] Recette téléphone.

## Tests

`tests/test_rappels.py` (nouveau, dans la suite critique) : il échoue sans le correctif. Suite critique verte.
