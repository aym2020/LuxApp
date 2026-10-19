# SPEC 63 — Accueil de bienvenue, avertissement centré et reconnexion

| Champ | Valeur |
|---|---|
| Priorité | P0 — première utilisation et conservation des données |
| Statut | **Implémentée sur `v2` — validation mobile/Firebase à confirmer** |
| Référence | Maquette `luxapp-maquettes-accueil-auth-corrige.html` |
| Fichiers | `public/portail.js`, `public/app.js`, `public/accueil.js`, `public/index.html`, `public/style.css`, `public/navigation.js` |
| Tests | `tests/test_spec_63_portail.js` et non-régression SPEC 61/62 |

## Parcours fonctionnel

1. **Première visite, pas de session :** afficher avant l'accueil habituel un écran chaleureux « Wëllkomm · Bienvenue », présentation courte des leçons, boutons « Créer mon compte », « J'ai déjà un compte », « Continuer sans compte ». Les boutons sont **centrés dans leur contenu**, largeur disponible et cible tactile ≥44 px.
2. **Continuer sans compte :** afficher une feuille modale expliquant clairement que la progression reste sur cet appareil et risque d'être perdue après changement de téléphone ou effacement. Proposer « Créer un compte pour sauvegarder », « Continuer en invité » et « Retour ». L'accès invité nécessite une **confirmation explicite**.
3. **Centrage obligatoire :** remplacer l'ancien bouclier décalé par un nuage de sauvegarde barré, parfaitement centré horizontalement/verticalement dans un cercle de 88 px, lui-même centré dans la feuille. Centrer le titre, le descriptif et **les textes de tous les boutons**, y compris « Continuer en invité » ; conserver la mise en page aux largeurs 320–430 px.
4. **Invité confirmé :** mémoriser localement ce choix (pas de boîte répétée à chaque actualisation). Montrer l'ancien accueil, **sans bandeau de création de compte**, et conserver la progression invitée et ses accès via Réglages.
5. **Compte connecté :** accéder directement à l'accueil après restauration de la session Firebase, sans portail intermédiaire. Enregistrer seulement le fait qu'un compte a déjà été connecté sur cet appareil (pas d'e-mail ni mot de passe).
6. **Compte déconnecté :** au prochain lancement, proposer « Bon retour ! » et un formulaire de reconnexion direct. En cas de déconnexion détectée pendant l'utilisation, protéger les données du compte et demander à nouveau l'authentification. Le mode invité reste possible après avertissement.
7. **Authentification :** conserver Firebase et la fusion existante SPEC 62. Nouvelle inscription : la progression invitée est proposée à la fusion automatiquement. Reconnexion : import local uniquement après consentement explicite (case décochée). Identifiants incorrects : affichage d'erreur et aucune perte de progression.
8. **Connexion indisponible :** ne pas présenter d'action inutilisable comme si elle fonctionnait. Informer et maintenir le mode invité. Le mode recette `RECETTE=1` conserve l'accès pédagogique direct pour les tests.
9. **Navigation :** la feuille modale se ferme par Retour, voile, touche Échap ou Retour Android. Le portail n'ajoute pas d'étape au chemin ni de nouveau modèle de données cloud. Les écrans d'exercices sont inchangés.

## Recette

- [x] Visibilité bienvenue / bon retour / compte connecté / invité mémorisé.
- [x] Modale invité et confirmation explicite, centrage CSS des pictogrammes et boutons.
- [x] Authentification formulaire portail + Réglages (même moteur), mode invité conservé.
- [x] Retour Android, pas de bandeau sur l'accueil classique.
- [ ] Contrôle visuel tactile réel Android (320, 360, 390 et 430 px).
- [ ] Test Firebase réel : création, déconnexion, reconnexion, échec, second appareil.

Ne pas déclarer « Validée » avant recette Firebase et Android.
