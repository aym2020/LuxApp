# SPEC 107 — Défis évolutifs du Chemin (2.1)

Date : 26 octobre 2026. Branche : `2.1`.

## Objectif validé

La première découverte d'une unité reste le parcours guidé initial. Les leçons terminées proposent ensuite des **questions complémentaires distinctes**, sans modifier les étoiles ni la mission. Le Chemin conserve unités, états, étoiles, mission, compteur turquoise « N questions à réviser », bloc « Améliorer mes résultats » et accès « Voir toute la leçon ».

- **Bilan** : supprimé uniquement du Chemin ; toujours disponible dans « Voir toute la leçon ».
- **Leçon en cours** : bouton « Continuer » et étapes inchangés, sans compteur de défis.
- **Leçon terminée avec questions inédites** : ligne d'information non cliquable « N nouveaux défis » puis **unique CTA jaune** « Découvrir les défis ».
- **Pool épuisé** : « Tous les défis découverts » (vert), CTA « Réviser mes acquis » ; séance ciblée immédiate, sans configuration S'entraîner.
- **Rattrapage d'étoiles** : exclusivement dans « Améliorer mes résultats » ; aucun défi n'efface un score acquis.

## Catalogue et honnêteté pédagogique

`public/defis.js` dérive un **pool plafonné à 12 questions par leçon** pour les leçons en unités avec quiz inversibles. Ce sont des **questions à sens inversé** : « je suis → ech sinn » devient « ech sinn → je suis ». Les choix portent sur les réponses dans l'autre langue ; ce n'est pas une permutation d'options. Toutes les formes viennent des quiz de la leçon déjà présents. Aucun texte luxembourgeois n'est inventé.

Gardes-fous : on exclut questions audio, consignes, entrées non bijectives (même traduction source pour plusieurs entrées), couples déjà présents dans les deux sens, bonus, champs HTML et distrateurs non comparables. Les trois distracteurs viennent d'autres quiz de la leçon, priorité à la même unité et à une longueur similaire. ID stable versionné : `defi-inverse-v1-<id quiz source>`.

Les leçons sans correspondances sûres ne doivent **pas** afficher un faux compteur de « 12 » : le CTA propose directement « Réviser mes acquis ». Les variations lexicales indépendantes, phrases nouvelles ou jeux en contexte demanderaient un catalogue éditorial additionnel, à relire avec LOD et la grammaire. **Cette livraison n'en fabrique pas artificiellement.**

## Déroulement, sauvegarde et révisions

- Jusqu'à **4 questions inédites** + **3 questions déjà vues**, les dues en premier, dans une même séance de 4 à 7 questions.
- Un défi n'est découvert qu'après la **première réponse enregistrée**, bonne ou mauvaise ; une ouverture / sortie avant réponse ne consomme rien.
- Les défis découverts rejoignent `itemsRevision`, le suivi d'erreurs et les rappels espacés existants ; le Bilan de 10 questions continue de tirer exclusivement dans les exercices originaux.
- Quand plus aucun défi n'est inédit, CTA « Réviser mes acquis » : jusqu'à 20 questions dues ou, s'il n'y en a pas, questions déjà vues, uniquement dans cette leçon.
- Le suivi de découverte se fait via `luxQuestionStats:<profil>` existant : clé stable de quiz, `attempts > 0` ; pas de drapeau séparé fragile. La synchronisation et la fusion cloud existantes préservent cet historique. Aucun changement de score d'unité, mission, étoiles ou niveau déjà acquis.

## Recette de non-régression

1. Leçon terminée : compteur réel, un seul CTA jaune, Bilan absent du Chemin.
2. Leçon en cours : « Continuer » et unités / étoiles inchangées, pas de défis.
3. Lancer les défis : `view-session` direct, jamais `view-review-setup`, avec 4 nouveaux et jusqu'à 3 rappels.
4. Le compteur diminue après réponse réellement enregistrée ; pas avant.
5. Test de reprise et fusion du compteur entre deux appareils connectés.
6. Pool épuisé : « Tous les défis découverts » et révision ciblée immédiate.
7. « Voir toute la leçon » : Bilan, bonus et mission toujours accessibles.
8. Android 320 / 390 / 430 px, texte agrandi, scroll, retour système.

Tests : `node --test test/defis-v21.test.cjs`, `python3 tests/test_defis_chemin.py`, puis `bash tools/critique.sh`. **La validation Samsung réelle reste nécessaire avant approbation finale du rendu**.
