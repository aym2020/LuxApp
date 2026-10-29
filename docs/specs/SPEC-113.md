# SPEC 113 — Red Flag / Cringr : expérience swipe arcade

Date : 29 octobre 2026. Branche : `2.1`. Statut : code poussé, recette Android et validation produit en attente.

## Décision produit prioritaire

Cringr doit se comporter comme une application de rencontre, pas comme un carrousel de sélection. Les anciens repères PRÉCÉDENT/SUIVANT et l'instruction SWIPE permanente sont supprimés. Swipe gauche = NOPE : passer au profil suivant. Swipe droit = LIKE : ouvrir le rendez-vous du profil. Le cœur est une alternative au LIKE. Pas de retour arrière arbitraire. Le geste incomplet revient au centre ; les gestes verticaux restent dédiés au scroll. La confirmation doit rester protégée contre les doubles déclenchements.

## Direction artistique

Toute l'expérience Red Flag doit viser une borne arcade pixel art 8/16-bit : polices bitmap uniquement, bordures et ombres franches, boutons enfonçables, tampons LIKE/NOPE pixellisés, portraits PS1 conservés, palette violet/rose. La coque de téléphone peut garder sa silhouette moderne en tant qu'objet fictif, mais pas les composants à l'intérieur. Les écrans hors sélection restent à harmoniser progressivement, sans modifier leur moteur ni Lux Match.

## Périmètre de cette livraison

Changement limité au sélecteur Cringr : microcopy gestuelle, décision swipe, typographie bitmap et bouton cœur arcade. Aucun changement des IDs de dossiers, du score, des clés de sauvegarde ou du renderer 3D. Le rejet passe au profil suivant, avec boucle existante : il n'enregistre pas de dislike persistant. Le LIKE lance la rencontre existante ; il n'ajoute pas de nouveau système de match. Les contrôles d'accessibilité non tactiles et la recette de bout en bout restent à compléter.

## Recette bloquante

Tester sur 320×600, 360×740, 393×852 et 430×932 : carte au repos, swipe gauche/droit, geste incomplet, scroll vertical, double geste, clic cœur, profil généré, déjà résolu, motion réduite, navigation Android et préservation de progression. Exécuter les suites rapides et complètes, vérifier les captures avant/après et obtenir l'approbation Samsung. Ne pas clôturer LD-048 avant cette validation.

Cette décision remplace la sémantique de navigation gauche/droite décrite dans les anciennes sections de SPEC 112.

## Correctif de composition du 29 octobre 2026

Après capture Samsung rejetée : cause identifiée dans les surcharges CSS successives, notamment `margin-top:clamp(...)` qui éloignait artificiellement les informations du bas de la carte. Le CSS V3/113 du sélecteur a été consolidé en un bloc unique : carte en colonne avec `justify-content:flex-end`, informations en flux sans marge supérieure, hauteur adaptée au viewport, police bitmap conservée et bouton cœur rectangulaire arcade. Les assertions statiques ont été actualisées et la version des assets CSS/JS incrémentée pour éviter un mélange de cache. **Contrôles effectués :** cohérence des accolades CSS, présence des règles et suppression de la surcharge, vérification des fichiers distants. **Non effectués :** suite Node complète, Playwright, CI et validation visuelle Samsung. Ne pas clore LD-048.
