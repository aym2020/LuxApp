# Expression écrite A1.2 — versions simplifiées (LuxApp 2.1)

Deux modèles de **70 mots exactement**, remplaçant les textes précédents.

- **Expression écrite 1 : Le week-end dernier** — 13 phrases, sujet `a12-expression-01-v2`.
- **Expression écrite 2 : La semaine dernière** — 12 phrases, sujet `a12-expression-02-v2`.

L'apprenant lit chaque phrase française **en haut de l'écran**, écrit la phrase luxembourgeoise et valide. La correction présente la solution et une note pédagogique, puis permet de passer à la phrase suivante. **La commande « Voir la traduction FR » a été supprimée dans les corrections et dans le bilan**, puisque le français est déjà la consigne de départ. Le champ `phrases[].fr` reste nécessaire pour afficher la question.

Ces deux textes réutilisent volontairement les mêmes verbes, avec une progression phrase par phrase. Le score mesure **la restitution du texte modèle**, pas toute traduction libre possible : 1 point par phrase reconnue selon la normalisation existante (casse, accents et ponctuation ignorés).

**Vacances, variante non notée :** après le premier examen, l'écran de bilan présente exactement deux substitutions : la première phrase devient « Meng lescht Vakanz war ganz gutt. » et la dernière devient « Et war eng schéi Vakanz. ». La variante compte aussi 70 mots.

Les IDs ont été versionnés en `-v2` pour ne pas comparer des résultats sur 11 ou 10 phrases avec les nouveaux résultats sur 13 ou 12 phrases. Les anciens meilleurs scores restent dans les anciennes clés de stockage, non affichées pour les nouveaux sujets. Les sept annales historiques d'A1.2 et les autres moteurs ne sont pas modifiés.

**Recette :** vérifier les 13/12 phrases dans le bon ordre, le compte de 70 mots sur les trois textes, les phrases partagées, les deux substitutions de vacances, la correction et les notes, l'absence totale du bouton « Voir la traduction FR » dans ce mode, le score, les nouveaux meilleurs scores et le clavier Samsung. Le CI Node ne remplace pas une recette visuelle navigateur et mobile.

## Correctif orthographique — 21 octobre 2026 (règle du N)

Une réponse « mir hu kaffi gedronk » a été refusée à tort : le modèle imposait « Mir hunn Kaffi gedronk. » Or, devant **K**, la règle du N (*Eifeler Reegel*) écrit **Mir hu Kaffi gedronk.** De même, « Ech hu laang geschlof », « Ech hu meng Famill gesinn » et « Ech hu Kaffi gedronk… » sont les formes adaptées au contexte. Cinq occurrences ont été rectifiées dans les deux textes, notes correspondantes comprises, sans changer le nombre de phrases ou les 70 mots. Le correcteur compare toujours les phrases du modèle, mais celles-ci sont désormais correctes pour ces cas. Le test `test/expression-ecrite-v21.test.cjs` parcourt toutes les occurrences de `hu/hunn` des deux textes et rejoue exactement la réponse initialement pénalisée.

**Historique :** la sauvegarde existante ne mémorise que le meilleur score de l'examen, pas chaque phrase erronée ; il faut donc refaire le sujet pour enregistrer le score corrigé. Ne pas valider les variantes arbitraires en supprimant `n` partout : la règle dépend du mot suivant.
