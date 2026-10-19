# SPEC 62 — Compte visible et protection de la progression invitée

**Priorité : P0. Statut : implémentée sur `v2`, recette Firebase et Android à confirmer.**

Fichiers : `public/accueil.js`, `public/app.js`, `public/style.css`. Complète les SPEC 09, 22 et 52.

1. En mode invité et lorsque Firebase est disponible, afficher **dès l'accueil**, juste après les niveaux, un bandeau « Protège ta progression » qui avertit que les progrès restent sur cet appareil et **peuvent être perdus** après changement de téléphone ou suppression des données.
2. Deux CTA : « Créer un compte » et « J'ai déjà un compte ». En un clic, ouvrir le formulaire correspondant dans Réglages, sans obliger à trouver le menu Plus.
3. Utilisateur connecté : **aucun bandeau**, y compris si sa session restaurée est momentanément hors ligne. Cloud indisponible : ne pas afficher de CTA inutilisables.
4. À l'**inscription**, capturer les progrès de `anonymous` avant connexion, puis les fusionner dans le profil `user:<uid>` et enfin les synchroniser avec le cloud, sans supprimer le profil invité.
5. À la **connexion d'un compte existant**, si l'invité a travaillé, proposer une case **non cochée** « Ajouter mes progrès de cet appareil à ce compte ». Aucune fusion sans consentement explicite, pour éviter de mélanger les données de deux personnes partageant l'appareil.
6. En cas d'erreur d'authentification, conserver le profil et les données invités ; ne pas annoncer une synchronisation réussie en cas d'erreur réseau.
7. Pas de modification des scores, formats cloud, fonctions de fusion, ou accès aux leçons. Les statuts techniques de synchronisation restent dans Plus et Réglages conformément à SPEC 52.

**Tests :** bannière invité / connecté / cloud indisponible, entrée directe, fusion automatique après inscription, absence d'import à la connexion, import explicite, échec sans perte — `tests/test_specs_61_62.js`.

**Reste à contrôler :** tests Firebase réels (nouveau compte, fusion à distance, second téléphone, perte réseau), affichage Android et accessibilité. Ne pas marquer « Validée » auparavant.
