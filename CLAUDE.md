# LuxApp — instructions permanentes pour Claude Code

## Produit et architecture
LuxApp est une application d'apprentissage du luxembourgeois. Le dépôt contient un serveur Node.js/Express (`server.js`), une interface web dans `public/`, des tests Node et navigateur dans `test/` et `tests/`, ainsi que des outils dans `tools/`. Lire le code réel avant de déduire des comportements.

## Branches et changements
- Ne jamais présumer que `main`, `2.1` et la production sont identiques. Vérifier la branche courante, la cible et les changements locaux.
- Ne jamais écraser des modifications préexistantes. Pas de push, merge, déploiement, force-push ni modification de branche protégée sans autorisation explicite.
- Limiter les changements au besoin demandé ; conserver les conventions existantes et éviter les refontes opportunistes.

## Environnements et données
- `RECETTE=1` active une instance dédiée, protégée par `RECETTE_USER` / `RECETTE_PASS` ; le serveur désactive Firebase pour cette instance et sert les outils dans `recette/`.
- `LUX_TESTS=1` active une configuration spécifique aux tests navigateur hors recette. Ne pas confondre recette, tests et production.
- Protéger les données utilisateur, la progression, la synchronisation Firebase, le cache offline et le service worker. Ne jamais manipuler les données de production pour tester.
- Ne pas afficher de secrets ni supposer que les clés de configuration frontend sont des secrets serveur.

## Validation
- Suite critique existante : `bash tools/critique.sh rapide` (contrôles rapides) puis `bash tools/critique.sh` (suite complète) lorsque l'environnement le permet.
- ATTENTION : `tools/critique.sh` utilise le port fixe 3456, peut réutiliser un serveur existant et peut récupérer `main`. Avant de l'exécuter, vérifier les ports, processus, isolation et effets de bord ; ne jamais le lancer simultanément avec une suite de référence sur les mêmes ressources.
- Les tests navigateur sont des scripts Python dans `tests/` ; ne pas supposer que Playwright est configuré via un `playwright.config.*` à la racine.
- En cas d'échec, comparer à une version de référence intacte avec serveur et port distincts ; ne pas qualifier un échec de régression sans preuve.
- Ne jamais utiliser `pkill` générique pour arrêter des serveurs partagés ; arrêter uniquement les PID créés et suivis par la session.

## Skills
- `/feature` : conception et implémentation d'une fonctionnalité.
- `/debug` : reproduction, diagnostic et correction minimale.
- `/pre-push` : validation avant push et décision GO/NO-GO (pas de push automatique).
- `/ui-review` : contrôle visuel, responsive et accessibilité.
- `/release` : préparation de livraison, recette et retour arrière.

## Compte rendu
Toujours distinguer ce qui a été vérifié, ce qui est supposé et ce qui reste non testé. Indiquer fichiers modifiés, commandes exécutées, résultats, risques et actions non réalisées.
