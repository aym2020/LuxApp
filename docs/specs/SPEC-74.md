# SPEC 74 — Résultat d'annale : « Terminer » prioritaire, « Refaire ce sujet » secondaire

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — recette Android à confirmer** |
| Priorité | P2 — clarté du parcours après résultat |
| Branche | `v2` |
| Périmètre | `public/examens.js`, commentaire `public/style.css`, tests des examens et de la recette |
| Dépendance | SPEC 49 — navigation canonique `retourSujets()` |

## 1. Constat

Après avoir terminé une annale et consulté son score, le grand bouton doré fixe propose « Refaire ce sujet », tandis que « Autres sujets » figure au bas de la correction. Cette hiérarchie privilégie un nouveau passage plutôt que la clôture naturelle de l'examen.

## 2. Comportement cible

**Action principale : « Terminer ».** Dans `view-examen-result`, le bouton du bandeau fixe `#exr-cta` reste visible dès le haut de l'écran, y compris pendant le défilement et après un changement de filtre. Il affiche « Terminer » (`#exr-terminer`), conserve le composant doré existant `.pc-btn.primary.wide.big`, et appelle `retourSujets()`. La destination est `view-examens`, dans le niveau du sujet achevé, avec le meilleur score à jour. Pas de confirmation d'abandon : le sujet est déjà terminé.

**Action secondaire : « Refaire ce sujet ».** À l'emplacement de l'ancien « Autres sujets », en fin de correction dans `#exr-body .exr-actions`, afficher un bouton discret `.lien-or` (`#exr-refaire`). Il appelle `startExamen(exam.id)` : même annale, réponses remises à `null`, parties à nouveau non corrigées, retour à la première partie. Le meilleur score enregistré n'est ni effacé ni diminué.

**Hiérarchie et navigation.** Un seul bouton principal sur l'écran. Le lien secondaire doit rester atteignable sans être masqué sous le CTA fixe ; conserver le dégagement inférieur de `#exr-body` et la prise en compte du `safe-area-inset-bottom`. Le bouton « ← Sujets » en haut et le Retour Android continuent de suivre SPEC 49. Les filtres « Toute la correction » et « Mes erreurs » ne modifient ni les libellés ni les destinations. Aucun changement aux scores, au moteur d'examens, aux données ou à la sauvegarde.

## 3. Recette attendue

- Résultat dès son affichage : un unique CTA doré fixe intitulé « Terminer », visible sur mobile.
- Appui sur « Terminer » après 100 %, après un résultat partiel, et après alternance des filtres : retour à la liste du niveau correct, meilleurs scores préservés.
- Fin de la correction : « Refaire ce sujet » est visible et cliquable au-dessus du bandeau ; appui → mêmes parties, réponses vierges, aucun écran de confirmation.
- Résultat obtenu depuis la recette visuelle : comportements identiques, données fictives isolées et Retour du téléphone sans boucle.
- Non-régression : « ← Sujets », navigation de l'examen en cours, autres résultats et indicateurs inchangés.

## 4. Tests et limites

Les scénarios correspondants sont intégrés à `tests/test_examens.py` et `tests/test_recette_visuelle.py`. Vérifier ces tests sur serveur local (`LUX_TESTS=1`), puis la suite critique `tools/critique.sh`. Une validation tactile réelle Android reste nécessaire pour confirmer l'ergonomie et l'absence de recouvrement au bas de la page.
