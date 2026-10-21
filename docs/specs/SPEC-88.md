# SPEC 88 — Accueil fixe, rubrique Jeux et Survie

**Branche :** `2.1` · **Statut :** première version · **Maquette :** accueil fixe avec quatre raccourcis approuvée par l'utilisateur.

## Objectif

Garder l'accueil existant inchangé (logo, niveaux, panorama, progression, CTA jaune Continuer, lien « Voir mon chemin ») tout en remplaçant **trois raccourcis par quatre**, sans ajouter de hauteur : S'entraîner / Examens / Erreurs / **Jeux**. Ne pas ajouter d'encart supplémentaire ni de scroll à l'accueil.

« Jeux » est une rubrique autonome (`view-jeux`) ; elle accueille le premier mini-jeu **Survie** (`view-survie`). Navigation Android historique LuxApp : retour du jeu vers la rubrique, puis vers l'accueil.

## Gameplay Survie

- Une réserve est extraite des **flashcards de leçons déjà ouvertes ou réellement pratiquées**, tous niveaux confondus. Les leçons non vues, cartes Plus, phrases et doublons sont exclus. Mots luxembourgeois isolés de 3 à 12 lettres, indices français courts.
- Minimum **4 mots** pour débloquer ; sinon accès vers « Voir mon chemin ». Jamais de mots inventés.
- Montrer la traduction FR, puis des tuiles de lettres LU mélangées. Une tuile touchée se place dans la prochaine case. Effacer supprime la dernière lettre. **Validation automatique** lorsque le mot est complet.
- **Temps** : 30 secondes initiales. Mot correct : +3 secondes, sans dépasser 30 secondes. Mot erroné : −3 secondes, série consécutive remise à zéro, même mot rejoué. La partie s'arrête quand le temps est épuisé.
- **Difficulté** : cible 4 lettres, +1 toutes les 3 réussites jusqu'à 12 ; borne réelle de la réserve connue. Éviter une répétition avant épuisement de la réserve. Pas de pénalité pour effacer avant validation.
- **Score** : record = meilleure série consécutive ; total de mots réussis affiché séparément. Clé locale `storageKey('luxSurvieBest')`, profil isolé, non synchronisée cloud pour V1. Aucun effet sur les niveaux d'exercices, erreurs, points, examens, streak quotidienne ou progression de leçon.
- Quitter arrête le timer ; application masquée = chrono en pause. Rejouer n'efface pas le meilleur score.

## UI et isolation

Utiliser tokens existants et charte 2.1 (fond #0f0e0c, jaune #f5cf4d, Instrument Serif). Une vraie page « Jeux » présente Survie en carte, et Survie se joue en plein écran. Zones tactiles 44 px minimum, tuiles 6 colonnes adaptatives, couleurs de validation distinctes. Les vues du jeu peuvent défiler sur petite hauteur, pas l'accueil standard.

Modifications uniquement dans `public/accueil-v21.js`, `accueil-v21.css`, `index.html`, `navigation.js`, les nouveaux `jeux-v21.js` / `jeux-v21.css`, tests, CI et documentation. **Aucun changement dans les moteurs d'exercices et les JSON de leçons.**

## Recette et limites

Tester accueil 320/360/390/430 px et toutes les actions existantes ; zéro mot vu, une leçon vue, deux niveaux, doublons, lettres répétées, accents, longueur, inversion et annulation ; +3/−3 s, record par profil, navigation Retour Android, masquage de l'application, taille de police agrandie. Tester le rendu navigateur et sur Samsung avant validation UX finale. Tests automatisés : `node --test test/accueil-v21.test.cjs test/jeux-v21.test.cjs` intégrés à la CI, puis `tools/critique.sh` dès qu'un environnement exécutable est disponible.

**Statut :** V1 à éprouver sur mobile ; record local seulement, pas de classement ni de publicité, pas de boutique.

## Correctif Survie — centrage des lettres (22 octobre 2026)

La première version gardait une grille rigide de six colonnes : pour un mot de quatre lettres, les quatre tuiles restaient collées à gauche. Correction CSS isolée : conteneur **flex avec retour à la ligne et centrage horizontal** ; chaque tuile garde une largeur tactile de 44 à 52 px, plafonnement de la rangée à 347 px. Contrairement à une grille de six colonnes, la dernière rangée de 7–12 lettres est également centrée. Aucun changement dans le mot, le tirage, le timer ou les scores.

Recette navigateur mesurée sur Chromium aux largeurs **320, 360, 390 et 430 px**, pour **4, 5, 6, 7, 9 et 12 lettres** (24 situations) : centres alignés, largeur des tuiles ≥ 44 px, aucun débordement horizontal. Test CSS de non-régression intégré à `test/jeux-v21.test.cjs`. Reste à vérifier sur Samsung réel.

## Ajustement Survie — Combo arcade (22 octobre 2026)

- Chaque mot correct ajoute **+3 secondes** (anciennement +2), **sans dépasser les 30 secondes** de réserve. Le feedback affiche le gain réellement obtenu (« +3 s » si possible, « CHRONO PLEIN » si la réserve est pleine).
- La **série grossit visiblement** : chiffre, flamme vectorielle et halo lumineux progressent durablement aux paliers **3, 5 et 10**. À chaque réussite, le compteur rebondit, six étincelles jaillissent, une annonce de combo est affichée brièvement et le temps gagné flotte près du chrono.
- Les étiquettes évoluent avec la série : « BIEN JOUÉ ! », « DOUBLE ! », « COMBO ×3 », « EN FEU ×5 », « LÉGENDAIRE ×10 ».
- **Sans décaler les tuiles** : effets dans la barre supérieure, animations exclusivement de transformation/opacité. Le délai de passage au mot suivant reste 280 ms. Mauvaise réponse = série remise à zéro et effets arrêtés.
- **Accessibilité :** la série chiffrée reste visible en permanence ; `prefers-reduced-motion` désactive impacts/étincelles/texte flottant. Test de non-régression dédié aux seuils et aux temps réels ; vérifier le rendu sur Samsung avant validation finale.
