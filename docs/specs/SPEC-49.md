# SPEC 49 — Résultat d'examen : deux retours fiables vers la liste des sujets

| Champ | Valeur |
|---|---|
| Statut | **À faire — spécification uniquement** |
| Priorité | **P1 — navigation incohérente** |
| Branche cible | `v2` |
| Périmètre probable | `public/examens.js`, `public/index.html`, `public/navigation.js`, `recette/recette.js`, `tests/test_examens.py`, `tests/test_recette_visuelle.py` |
| Références | SPEC 15 (historique et Retour), SPEC 43 (recette visuelle), SPEC 44 (restauration après actualisation), SPEC 45 (retours de fin d'activité), SPEC 48 (harmonisation des examens) |
| Origine | Recette Android réelle du 19/10/2026 : fin de l'« Annale 1 », score 40/40, « Mon chemin » en haut et « Autres sujets » en bas |

## 1. Anomalies reproduites

Sur l'écran de fin d'examen (`view-examen-result`) :

1. **Retour supérieur** : le bouton, situé en haut à gauche de l'écran et présenté comme un retour, affiche « Mon chemin ». Or le contexte fonctionnel est un résultat d'annale : la destination attendue est la **liste des sujets d'examen**, pas le Chemin des leçons.
2. **Action inférieure** : le bouton **« Autres sujets »**, placé sous « Refaire ce sujet », **ne renvoie pas à la liste des sujets** lors de la recette sur Android.

Les captures montrent « RÉSULTAT — Annale 1 », score 40/40, les sections Sproochgebrauch et Liesverstoen, puis le CTA « Autres sujets » en bas. Les calculs et l'affichage du score ne sont pas remis en cause par cette fiche.

## 2. Diagnostic du code existant

- `public/index.html` : le retour de `view-examen-result` est un bouton `[data-retour]` appelant `retour()`. Son texte « Sujets » est **réécrit** par `majBoutonsRetour()` à partir de `ecranPrecedent()`.
- `public/examens.js` : dans `renderExamResult()`, « Autres sujets » est actuellement `onclick="retour()"`.
- `public/navigation.js` : `retour()` suit la pile `pileNav`, qui n'assure pas à elle seule une destination « Sujets » lorsque l'écran de résultat est créé à partir d'un autre contexte.
- `recette/recette.js` : les scénarios de fin d'examen déclenchent `openExamens()`, `startExamen()` et `examFinish()` en accéléré. **Vérifier** si ces transitions rapprochées sont regroupées par la logique `pileAvantAppui` et font perdre `view-examens` dans la pile ; cela expliquerait « Mon chemin ». Ne pas considérer cette hypothèse comme définitivement prouvée sans test.

Un test existant vérifie déjà « Autres sujets » en parcours normal (`tests/test_examens.py`) ; il ne couvre pas suffisamment le **contexte recette** ni les deux boutons.

## 3. Comportement cible obligatoire

### 3.1 Bouton de retour supérieur

Sur `view-examen-result`, afficher systématiquement :

**« ← Sujets »**, avec libellé accessible **« Retour aux sujets d'examen »**.

L'action ouvre **`view-examens` (« Choisis un sujet »)**, **sans passer par le Chemin**, l'Accueil ou l'écran précédent de l'historique.

Le texte et la destination restent corrects :
- après un examen réellement passé ;
- depuis le mode recette (« Fin d'examen ») ;
- si l'examen a été ouvert depuis différents onglets ;
- lorsque la pile de navigation est incomplète ;
- après affichage/masquage de « Mes erreurs » ;
- après une restauration ou une navigation système, selon les règles de persistance actuelles.

### 3.2 Bouton « Autres sujets »

Le CTA situé tout en bas du résultat mène **à la même destination explicite `view-examens`**.

- Ne pas utiliser un simple `retour()` dépendant de `pileNav` pour cette action métier.
- Actualiser la liste par la logique habituelle (`renderExamens()` / `openExamens()` ou navigation canonique équivalente) afin d'afficher les meilleurs scores réellement enregistrés dans le contexte courant.
- Conserver le niveau de l'annale consultée : pour une annale A1.2, retrouver **les sujets A1.2**, sans basculer sur un autre niveau.
- Ne pas afficher de confirmation d'abandon : l'examen est **déjà terminé**.
- Ne pas perdre ou réinitialiser les scores : le résultat vient d'être calculé et enregistré conformément aux règles actuelles.

### 3.3 Historique et Retour Android

Définir un retour canonique partagé pour ces deux boutons, afin d'éviter deux implémentations divergentes.

- Depuis un résultat d'examen, le Retour Android suit également une navigation cohérente vers les **sujets**.
- Une fois sur les sujets, Retour Android revient au contexte normal antérieur (Accueil, Chemin ou autre contexte légitime), **sans reboucler** sur l'ancien résultat et sans recréer une liste infinie d'entrées.
- Ne pas modifier la règle spécifique des résultats d'unité et de mission : **ils retournent au Chemin** (SPEC 45).
- Dans `view-examen` **avant** la fin du sujet, garder l'alerte actuelle si des réponses seraient perdues (`quitExamen()`).

### 3.4 Cause et robustesse du mode recette

Ne pas se limiter à remplacer un texte HTML : corriger également le chemin d'action.

En mode recette, vérifier que la création accélérée du résultat ne fausse pas l'historique (`pileAvantAppui`, `pileNav`). Le mode recette doit reproduire une **navigation logique identique** à celle d'un véritable passage d'examen, tout en conservant l'isolation des données :

- Aucune écriture Firebase/cloud en mode recette.
- Les meilleurs scores fictifs restent dans l'origine de test et sont supprimés par « Quitter le test ».
- Aucune modification des acquis personnels.
- Ne pas générer de faux écran : continuer à utiliser `examFinish()` et `renderExamResult()`.

## 4. Tests de non-régression

Mettre à jour les tests existants, notamment `tests/test_examens.py` et `tests/test_recette_visuelle.py`.

- [ ] Passer une annale normalement jusqu'au résultat : bouton supérieur **« Sujets »**, clic → `view-examens`.
- [ ] Repasser une annale : clic sur **« Autres sujets »** → `view-examens`, meilleur score affiché.
- [ ] En **recette visuelle**, lancer « Fin d'examen → Annale 1 → 100 % » : le retour supérieur porte le bon libellé et mène aux sujets.
- [ ] En recette, lancer « Fin d'examen → Annale 1 → ≈ 70 % » : « Autres sujets » mène aux sujets.
- [ ] Vérifier les mêmes deux actions après avoir sélectionné « Mes erreurs », puis « Toute la correction ».
- [ ] Tester le Retour Android sur le résultat : destination « Sujets », puis Retour depuis les sujets : pas de boucle.
- [ ] Tester une annale A1.2 différente ; le niveau et le score restent cohérents.
- [ ] Ne pas casser le bouton **« Refaire ce sujet »** (même annale, réponses vierges) ni la confirmation d'abandon pendant un examen inachevé.
- [ ] Vérifier l'isolation du mode recette (aucune écriture cloud, aucune progression personnelle modifiée).
- [ ] Faire une recette visuelle sur Android ; les tests Playwright seuls ne suffisent pas à déclarer la fiche validée.

## 5. Implémentation et livraison

Chercher la cause réelle de la pile de navigation et créer **une seule destination canonique** vers la liste des sujets depuis le résultat. Réutiliser les fonctions existantes : ne pas réécrire le moteur d'examen, les scores ni les composants de correction.

Exécuter d'abord les tests ciblés, puis la suite critique conformément au PLAYBOOK, en évitant les itérations inutiles. Documenter les fichiers modifiés, les tests passés et les éventuels écarts.

**Critère d'acceptation : depuis le résultat de n'importe quelle annale, le retour du haut, « Autres sujets » et le Retour Android affichent bien la liste des examens, avec les bons scores et sans altérer les autres parcours de navigation.**
