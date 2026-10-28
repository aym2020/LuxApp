# SPEC 112 — Lux Démasqué : sélectionner les affaires par swipe

**Branche :** `2.1` · **Statut :** code poussé, validation graphique Samsung en attente · **28 octobre 2026**.

## Correction du périmètre

La refonte du swipe des partenaires **Lux Match** était une erreur : elle a été annulée sélectivement au commit `c3952c3` (code, styles, tests, workflow et SPEC 111). La vraie fonctionnalité demandée concerne le **choix des affaires de Lux Démasqué**. Lux Match reste masqué au public.

## Comportement

À l'entrée **Jeux → Lux Démasqué → Jouer**, afficher le nouveau sélecteur avant la rencontre. Trois dossiers rédigés **Milo, Noah et Tom**, puis une quatrième carte **« Affaire inédite »** quand des affaires sont disponibles pour la génération contrainte. Chaque carte montre portrait low-poly existant (repli initiale), numéro, nom, âge, ville, accroche déjà publique, statut « à enquêter » ou « déjà résolu ». Aucun texte ne révèle les mensonges, solutions ou preuves.

Le joueur navigue horizontalement (seuil strictement supérieur à 65 px) ou avec les flèches **48 × 48 px**. Le swipe ne démarre aucune partie : le bouton or « Ouvrir ce dossier », « Rejouer ce dossier » ou « Découvrir cette affaire » est la **seule validation**. L'affaire inédite conserve une seule graine jusqu'à confirmation. Le bouton Retour de l'en-tête ramène au hub Jeux.

### Garanties

- Les appels explicites `ouvrirLuxDemasque(dossierId)` et les tests historiques continuent d'ouvrir directement la rencontre ; seule **l'entrée depuis la carte Jeux** affiche le sélecteur.
- Aucune modification de `lux-demasque-core.js`, des données d'affaires, des sauvegardes `luxDemasqueResolus`, des scores, de la logique d'objection et des autres écrans.
- Le WebGLRenderer est unique ; la préparation des portraits et la préparation du dossier sont sérialisées. En échec WebGL : lettre initiale.
- La rotation automatique « Nouveau dossier » en fin de partie est conservée.
- Carte accessible, scroll vertical libre, pas de double déclenchement, pointercancel et second doigt ignorés, `prefers-reduced-motion` respecté.
- Le style est **strictement ciblé** sur `#view-luxdemasque .ld-jeu[data-ecran="selection"]`.

## Recette

`bash tools/test-lux-demasque.sh rapide` et `complet` ; nouvel automatisme `test/lux-demasque-selection.test.cjs` et `tests/test_lux_demasque_selection.py`. Matrice 320×600, 360×740, 393×852, 430×932 ; swipe tactile CDP, flèches, ouverture Noah, état résolu, affaire inédite, aucune écriture de progression avant confirmation. Captures dans l'artifact `lux-demasque-selection` de la CI dédiée. Contrôle visuel réel Samsung à faire avant validation produit. **Ne pas avancer LD-002.01 sur le TODO main sans accord explicite.**

## Livraison vérifiée — 28 octobre 2026

- **Rollback sélectif Lux Match :** [`c3952c3`](https://github.com/aym2020/LuxApp/commit/c3952c39f449a2e7d63a69487a798552cbb1decd) ; Lux Match conserve son comportement, ses données et son statut masqué.
- **Code du bon jeu :** `public/lux-demasque.js`, `public/lux-demasque.css` (sélection), commit d'implémentation `cbf647d`, tests et compatibilité `d21f953`, captures 3D `e07cbfc`.
- **CI finale réussie :** [Lux Démasqué — run 40783142046](https://github.com/aym2020/LuxApp/actions/runs/40783142046). `rapide` et `complet` verts, y compris les anciens parcours, les objections, le contrat LD-034 et le nouveau test tactile du sélecteur. [CI générale 2.1 verte](https://github.com/aym2020/LuxApp/actions/runs/40783142045).
- **Captures Chromium avec le vrai portrait 3D chargé :** [artifact `lux-demasque-selection`](https://github.com/aym2020/LuxApp/actions/runs/40783142046/artifacts/12857654477), 360×740 et 393×852. Le sélecteur ne trahit pas la solution de l'affaire.
- **Réserve visuelle connue :** rendu des yeux du personnage 3D déjà listé sous LD-028 ; ce chantier n'a pas modifié le modèle, les matériaux ni les animations.

**À attendre :** acceptation graphique/tactile explicite du joueur sur Samsung (défilement des quatre affaires, changement via flèches, ouverture volontaire et retour), puis seulement clôture LD-048. LD-002.01 reste ouverte.
