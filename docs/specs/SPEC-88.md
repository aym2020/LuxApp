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

## Correctif animation unique et continuité du HUD — 22 octobre 2026

**Cause constatée :** sur réussite, `survieCelebrate` déclenchait les effets dans le HUD puis `survieNouvelleQuestion` appelait `survieRendre` au bout de 280 ms. Ce dernier reconstruisait tout le `innerHTML` du jeu avec `p.fete=true`, **relançant les animations encore actives** (430–1050 ms). Des lectures `offsetWidth` forçaient en outre des synchronisations de style, et des transitions `font-size` à chaque palier recalculaient la mise en page.

**Correction :** HUD crée une fois par partie ; seule `#survie-question` est remplacée au changement de mot. Impulsion unique déclenchée sur réussite et terminée en 620 ms, sans double départ ni lecture d'offsetWidth. Paliers durables via `transform:scale`, taille de police/hauteurs fixes pour préserver les positions des tuiles. Score et gain réels inchangés (+3 s, plafond 30, erreur −3 s) ; mot suivant toujours à 280 ms. Reset d'animation au faux, nettoyage seulement en fin d'effet ; `prefers-reduced-motion` conservé. Les animations restent limitées à une durée modérée et à des propriétés principalement compositées.

**Vérification :** régression DOM sur stabilité du HUD et absence de deuxième impulsion après 280 ms, succès/faux, chrono, bonus, paliers, CSS et cache. Validation visuelle Chrome Android/Samsung nécessaire avant d'affirmer que le rendu est fluide sur le téléphone.

## Passage volontaire d’un mot — 22 octobre 2026

- Bouton secondaire **« Passer −3 s »**, disponible sous chaque mot, distinct d'**« Effacer »**.
- Utilise exactement la même fonction de pénalité qu'une réponse fausse : −3 secondes (sans temps négatif), **streak remise à zéro**, animations de combo annulées. Aucun point, aucun bonus, aucune augmentation du record.
- Contrairement à la réponse fausse, le bouton choisit **un autre mot** après une courte transition de 260 ms. La réserve évite le retour immédiat sur le mot précédent si le pool le permet.
- Bouton verrouillé immédiatement après activation : double tap sans effet ; si les −3 secondes atteignent zéro, la partie se termine sans autre mot ; aucun timer ne survit à la fermeture de la session.
- Deux boutons sur une ligne, retour d'état séparé sous les boutons pour que les textes ne se chevauchent pas à 320 px ; cible tactile d'au moins 48 px.
- **Périmètre volontairement limité :** ce bouton n'est PAS le futur pouvoir « Joker » de SPEC 90 (qui sera une capacité rechargeable sans pénalité). Aucun changement dans les contenus, les examens, les sauvegardes ou la progression.
- Contrôle en CI : nouveau mot, série rompue, pénalité unique, double tap, fin du chrono, retour, mise en page responsive. La recette tactile Samsung reste obligatoire avant validation UX.

## Retour arrière ciblé de la V1 VFX — 22 octobre 2026

À la demande de l'utilisateur, **Survie a été restauré exactement à l'état du commit `4069bd8`**, juste après l'ajout du bouton « Passer −3 s ». Ce retour restaure uniquement `public/jeux-v21.js`, `public/jeux-v21.css`, leurs références versionnées dans `public/index.html`, et `test/jeux-v21.test.cjs`. Les fichiers dédiés à la tentative VFX (`public/assets/survie-flamme-v1.svg`, `tests/test_survie_vfx_mobile.py`, `.github/workflows/survie-vfx-mobile.yml`) sont retirés.

**Fonctionnalités conservées :** jeu Survie, streak et chronomètre originels (+3 s/réussite, −3 s/erreur), bouton « Passer −3 s », record local, affichage du prochain mot sans double animation, navigation et progression indépendantes. **Fonctionnalités retirées :** nouveau HUD et jauge d'énergie, flamme SVG, prototype du Gel temporel et ses effets ; ce n'est pas une désactivation de la future SPEC 89/90, qui reste à concevoir/implémenter distinctement.

Les tests VFX supprimés ciblaient la fonctionnalité retirée. La recette smartphone pourra confirmer le retour de l'ancienne présentation.
