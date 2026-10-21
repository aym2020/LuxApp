# Post-mortem — Régression des exercices LuxApp 2.1 (21 octobre 2026)

**Branche :** `2.1` uniquement. **Gravité :** régression UX/pédagogique majeure. **Statut : NON RÉSOLU — refonte visuelle NON VALIDÉE.**

Ce fichier est la mémoire durable de l'incident. Il ne signifie pas que l'interface a été réparée. Références : [PLAYBOOK](../PLAYBOOK.md), [instructions aux agents](../AGENTS.md), [exercices](EXERCICES-2.1.md), [recette](RECETTE.md).

## 1. Faits et chronologie

- **Référence avant refonte des exercices :** [`41e5526`](https://github.com/aym2020/LuxApp/commit/41e55263bba82e85b100aecb6b759b7e699e80bc). Sert de comparaison, **pas** de motif pour restaurer toute la branche.
- **Introduction de la régression :** [`46cb77e`](https://github.com/aym2020/LuxApp/commit/46cb77e6b30163d4c802f871c58fb01638b7cc28) : changements simultanés dans `public/parcours.js`, `public/app.js`, `public/index.html` et nouvelle surcharge `public/exercices-v21.css`.
- **Sept commits correctifs supplémentaires** : tests, clavier, cache, longueur de consigne, alignement Retour, jusqu'à [`a166802`](https://github.com/aym2020/LuxApp/commit/a166802fc3e780f6f932c5d499644150f684bba4).
- **Captures Samsung reçues :** premier échec « Pas encore » visible en même temps que réussite « Bien vu. », notes d'attention répétées, vert/rouge incohérents, balises littérales `<b>…</b>`, bouton / correction trop bas, mot caché désorganisé.
- **CI :** plusieurs premiers workflows en échec ; puis verts sans que le rendu soit validé. Le workflow `.github/workflows/accueil-2.1.yml` exécute surtout des tests Node. Il n'exécute **pas** `bash tools/critique.sh` ni une vérification visuelle Android.

## 2. Causes racines (code et méthode)

1. **Périmètre trop large.** Unification de deux moteurs différents (`parcours.js` pour la leçon, `app.js` pour l'entraînement) sans cartographier les états, les dépendances et les invariants.
2. **Sémantique de correction détruite.** `showFeedback(ok, titre, texteHtml, suite)` ignore désormais `titre` et remplace « Juste ! », « Juste au 2e essai », « La réponse », etc. par « Bien vu. » / « À retenir ». Le texte visible peut contredire la notation.
3. **État précédent non nettoyé.** `#mc-erreur` du premier essai peut subsister quand `#pc-feedback` annonce la réussite ; contrôler aussi l'écriture après 1er faux / 2e juste. **Jamais deux feedbacks contradictoires.**
4. **État coloré erroné.** Un trou peut afficher la bonne solution en style « faux » : distinguer le choix de l'utilisateur (éventuellement mauvais) de la solution révélée (correcte). Les nouvelles surcharges `.choice.correct`, `.choice.wrong` et `.mc-case` risquent d'écraser les couleurs métier.
5. **Disposition de correction brisée.** Passage de `.pc-feedback { position:sticky; bottom:0; }` à `#view-parcours .pc-feedback { position:static; }` sans découpage scrollable/CTA. Les messages, cases, notes et boutons s'empilent, se recouvrent ou sortent du viewport.
6. **Notes HTML affichées brutes.** `escHtml(note)` est appelé sur des notes contenant déjà du balisage formaté (`<b>`). Instaurer un rendu sûr commun : autoriser un jeu minimal de styles, échapper le reste ; pas d'injection HTML arbitraire.
7. **Tests inadéquats.** `test/exercices-v21.test.cjs` recherche des chaînes et sélecteurs, sans rendre la page ; les tests de session utilisent un faux DOM qui n'a pas de moteur CSS. Les validations Node réussies ne pouvaient pas détecter ces problèmes.
8. **Processus de qualité non respecté.** Le dépôt imposait déjà `tools/critique.sh` avant push. Il n'a pas été exécuté pour cette refonte ; après les premiers bugs, des CSS patches successifs ont été poussés sans pause ni validation visuelle.

**Ne jamais confondre :** syntaxe valide ≠ tests de comportement ≠ navigateur réel ≠ appareil Android. Un push ne prouve rien sur la qualité du rendu.

## 3. Invariants à préserver

- Leçon = **Mot caché → Quiz → Trous → Écriture**, sans étape flashcards supplémentaire (identifiant de données historique possible).
- Garder les différences : juste au 1er essai, correct au 2e essai, faux, indice payant, révélation, rattrapage, variantes, score, aide, audio, progression, stockage, examens. Une refonte CSS **n'autorise aucun changement de barème ou de contenu pédagogique**.
- Le « score du mot » est calculé d'après les lettres non révélées par indice : il n'est **pas** l'équivalent d'une réussite au 1er essai ; clarifier le libellé sans modifier sa règle sans demande.
- Pas de noms propres traduits, pas de changements de JSON ou du moteur linguistique sous couvert de CSS.

## 4. Protocole obligatoire anti-régression avant un push UI

1. **Lire le dépôt vivant** (`PLAYBOOK.md`, `AGENTS.md`, charte 2.1) et confirmer branche **`2.1`**, SHA actuel et diff. Protéger les modifications parallèles. Pas de `reset --hard` pour « réparer vite ».
2. **Cartographier les états** avant de coder : initial, choix juste, choix faux, erreur 1, correction au 2e essai, révélation, indice, transition. Pour chaque état : messages, classes, DOM visible, bouton, notation, stockage.
3. **Isoler la cause.** Un moteur/une zone à la fois. Vérifier styles calculés, héritage, spécificité CSS, flex, scroll, clavier, `position` et largeur avant tout override. Pas d'empilement de patchs.
4. **Tests de logique et DOM réel.** Ajouter un test qui reproduit **le bug exact** : messages contradictoires absents, solution au bon statut/couleur, notes sans HTML littéral, calcul de score conservé.
5. **Recette locale obligatoire pour refonte d'exercices :** `bash tools/critique.sh rapide`, puis **`bash tools/critique.sh`** (navigateur + tests ciblés). Examiner et expliquer tout échec, ne jamais annoncer une version validée avec un échec non résolu.
6. **Recette visuelle navigateur :** états initial/faux/juste/correction sur **320, 360, 390, 430 px**, petit viewport, texte agrandi ; comparer **avant/après** et mesurer débordements, positions/CTA avec `getBoundingClientRect()`. Vérifier Retour, audio et passage question suivante.
7. **Clavier Android :** pour toute modification clavier/viewport, un contrôle réel sur Samsung est requis avant de dire « validé ». Sinon statut explicitement « à vérifier sur Android ».
8. **Stop-loss :** au premier défaut grave ou après deux correctifs inefficaces, **arrêter les pushes UI**, reprendre le diagnostic et proposer rollback **sélectif**, pas un troisième patch superficiel.
9. **Publication :** annoncer branche, commit, fichiers touchés, tests réellement exécutés et non exécutés. Si le navigateur requis n'est pas disponible, ne pas publier une refonte comme « terminée » ; solliciter une validation adaptée. La documentation seule peut être poussée après contrôle textuel sans prétention de recette UI.

## 5. Scénarios de non-régression indispensables

| Scénario | Attendu |
|---|---|
| Mot caché : faux puis juste | `#mc-erreur` masqué, une seule correction finale, « Continuer » visible |
| Mot caché : indice ou réponse révélée | Pas de réussite trompeuse, note et score cohérents |
| Quiz/trou : juste | Bonne réponse explicitement identifiable, progression correcte |
| Quiz/trou : faux | Choix de l'utilisateur marqué faux ; **solution** marquée juste, y compris dans le trou |
| Écriture : faux puis 2e juste | Ancien diagnostic retiré, statut 2e essai, score/rappel inchangés |
| Écriture : 2 erreurs | Réponse finale, aide, audio et rappel lisibles |
| Attention contenant `<b>…</b>` | Mise en forme sûre, jamais de balises imprimées |
| Petite/longue phrase | Énoncé lisible, tuiles/choix et CTA accessibles sans chevauchement |
| Clavier Android ouvert/fermé | Zone de saisie et Valider accessibles, scroll stable |
| Entraînement / examen / erreurs | Notation, sauvegardes, navigation non régressées |

La recette automatisée devra **produire et vérifier** des états du vrai navigateur ; les snapshots et assertions sur des chaînes de code sont complémentaires, **pas suffisants**.

## 6. Remédiation et clôture

Avant tout nouveau travail visuel : sauvegarder le SHA actuel, examiner un diff ciblé avec `41e5526`, restaurer **sélectivement** les comportements fiables sans toucher aux écrans 2.1 déjà terminés. D'abord réparer les états/logiques de feedback, ensuite la disposition, puis la charte commune type par type.

**Incident ouvert.** Aucun fix fonctionnel n'est inclus dans ce post-mortem. Le clore seulement après reproduction et correction des bugs, tests d'états/DOM, suite navigateur complète, captures comparées et validation réelle du clavier si concerné.
