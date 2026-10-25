# P0-06 — Audit des barèmes et de la progression (LuxApp 2.1)

**Date :** 25 octobre 2026 · **Branche :** `2.1` · **Référence de code lue :** `e958650` · **Statut : audit initial, NON clôturé.**

## Objet et méthode

Vérifier les résultats métier, pas seulement le rendu : barèmes des exercices, premier/deuxième essai, indices, rappels, étoiles, récupération, sessions d'entraînement et examens, historique des erreurs, répétition espacée, séries et sauvegardes. Sources relues : `public/parcours.js`, `public/progress.js`, `public/app.js`, `public/examens.js`, tests existants, `tools/critique.sh` et workflows GitHub. **Aucun JSON et aucune règle de notation ne sont modifiés.**

## Règles relevées dans le code (constats statiques, pas des tests exécutés)

| Domaine | Comportement implémenté | Référence |
|---|---|---|
| Leçon, passage initial | `enregistrer()` mémorise une seule note par item, lors du premier passage ; le rappel ne la remplace pas | `parcours.js` : `enregistrer`, `echouer` |
| Quiz / Trous | Une première réponse correcte vaut 1 ; sinon 0, avec rappel de l'item | `parcours.js` : `choisirP` |
| Écriture en leçon | Correct au premier essai : 1 ; faux au premier essai : 0 et deuxième chance ; juste au deuxième : rappel quand même. Même première réponse répétée et coquille gratuite ne doivent pas consommer le second essai | `parcours.js` : `ecrValiderPc` |
| Mot caché | Les lettres révélées par « Indice » diminuent le score proportionnellement aux lettres à trouver ; « Voir la réponse » vaut 0. Les erreurs de reconstruction **sans indice ne diminuent pas le pourcentage du mot** ; elles empêchent toutefois `ok` / « Sans faute ». Ne pas confondre ce score avec une réussite du premier coup | `parcours.js` : `mcScore`, `mcValider`, `mcVoirReponse` ; post-mortem 21/10 |
| Note d'unité et étoiles | Moyenne des pourcentages des étapes jouées ; 1 étoile à 50 %, 2 à 70 %, 3 à 90 %. Le meilleur score est monotone ; le « + » ne contribue pas aux étoiles | `parcours.js` : `bilanUnite`, `finirRun`, `etoiles` ; `progress.js` : `saveUnitBest` |
| Rattrapage d'étoile | Sur score 70–89 %, reprendre seulement les items perdus d'un snapshot compatible ; recalcul conservant le maximum ancien/nouveau. Sans détail historique compatible, un défi de 5 items minimum et 90 % de réussite accorde 90 %, jamais 100 % ou « Sans faute » | `parcours.js` : `appliquerResultatRattrapage`, `detailRattrapageValide` |
| Sessions S'entraîner | Score de session augmenté **au premier essai uniquement** ; bonne réponse au deuxième essai sans point supplémentaire. En mode « exam », un premier faux est définitif ; les niveaux de maîtrise ne changent pas dans ce mode | `app.js` : `validateSessionInput`, `recordSessionAnswer`, `handleSessionChoice` |
| Erreurs et niveaux | Mauvaise réponse : erreur active +1, historique conservé et niveau décrémenté (sauf mode exam) ; bonne réponse : réduction des erreurs actives jusqu'à 2, historique de difficultés conservé | `progress.js` : `updateQuestionProgress`, `updateQuestionLevel` |
| Séries quotidiennes | Un jour « atteint » doit combiner révision si due et unité/mission terminée ; séries sur jours consécutifs validés | `progress.js` : `verifierObjectifDuJour`, `serieActuelle` |
| Examens par sujet | Un point par réponse ; meilleur score par sujet, sans écrasement par un résultat inférieur ; statut visuel vert à partir de 60 % | `examens.js` : `examTotal`, `saveExamScore`, `examClasse` |

## Couverture trouvée et action faite

- **Rattrapage / trois étoiles :** `tests/test_rattrapage_etoiles.js` couvre un passage 80 → 90 %, l'absence de régression du meilleur score, l'invalidation d'un snapshot incompatible, les défis historiques et les structures de fusion cloud. Le test existait **mais n'était exécuté ni dans la CI interface, ni dans `tools/critique.sh`**. Il est maintenant intégré aux deux, sans toucher au moteur.
- **Deuxième essai des sessions :** `tests/test_session_erreurs_frequentes.js`, déjà dans la CI, vérifie notamment qu'une réponse bonne au second essai n'ajoute pas de point.
- **Moteur navigateur :** `tests/test_parcours.py`, `tests/test_rappels.py`, `tests/test_examens.py`, `tests/test_seance.py`, `tests/test_acquis_v1.py` sont présents et appelés par la suite critique complète, mais **pas par le workflow interface Node**.
- **Sauvegardes :** `tests/test_cloud.js` et `tests/test_sync.js` sont dans la suite rapide ; une vraie synchronisation à deux appareils reste P0-04.

### Réserves et suites

1. **Contrôle CI réalisé :** workflow [LuxApp 2.1 — tests interface, exécution 40242069360](https://github.com/aym2020/LuxApp/actions/runs/40242069360) **vert**, y compris l'étape ajoutée « P0-06 — Barème des étoiles et rattrapage (SPEC 58) ». **Cela ne prouve pas la réussite des tests navigateur absents de ce workflow.**
2. Exécuter `bash tools/critique.sh rapide` puis `bash tools/critique.sh` dans un environnement où le dépôt et le serveur de test sont présents ; comparer les échecs **test par test** à la même base avant toute conclusion de non-régression.
3. Compléter les assertions aux seuils limites (49/50, 69/70, 89/90), au rappel et au score premier/deuxième essai, à l'idempotence de la sauvegarde et au cas Mot caché « erreurs gratuites mais score 100 % sans indice ».
4. Conserver la question de libellé « Score du mot : 100 % » malgré des erreurs comme une **nuance produit/pédagogie**, pas comme un bug démontré : la règle actuelle porte sur les indices, alors que « Sans faute » tient compte de l'exactitude initiale.
5. L'audit de cloud entre comptes et appareils appartient à P0-04 ; la recette Android transversale appartient à P0-08. **Ne pas cocher P0-06** sans preuve d'exécution et comparaison avant/après.
