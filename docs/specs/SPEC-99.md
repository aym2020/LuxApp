# SPEC 99 — Fonds des cartes conçus pour le portrait Android

Date : 26 octobre 2026 · Branche : `2.1` · Référence : `docs/CHARTE_UI_2.1.md`, SPEC 98 et captures utilisateur.

## Problème
Les fonds HD 1200 × 800 étaient affichés dans des cartes presque carrées. Le recadrage automatique faisait tomber des lettres ou des portails derrière les titres et descriptions.

## Correction
Deux illustrations composées en **1200 × 1200 WebP**, pour le ratio réel des cartes :
- **Gauche** (environ 0–55 %) : une réserve sombre progressive pour S/U/R, M/F/N, titre et description.
- **Droite** (55–100 %) : scène spectaculaire nette, détails conservés : lettres en mouvement dans un paysage luxembourgeois chaud (Survie) ; coureur, chaussée nocturne et trois portails bleu/rose/violet (Runner).
- **Bas** (environ 80–100 %) : atténuation de l'image derrière métadonnées, états de déblocage et CTA « Jouer ».

Les éléments interactifs et textes restent en HTML (jamais incrustés dans les images). La description est limitée à 88 % de largeur sans changer sa formulation et peut s'étendre verticalement. Les dégradés CSS, plus doux que ceux de SPEC 98, préservent le contraste sans effacer le décor.

## Fichiers
- `public/art/jeux-survie-card-portrait.webp` — 1200 × 1200, 56 Ko.
- `public/art/jeux-runner-card-portrait.webp` — 1200 × 1200, 42 Ko.
- `public/jeux-univers.css` — cadrage portrait, voiles atténués, largeur de description.
- `public/index.html` — cache-busting CSS `v=4`.
- `test/jeux-cartes-illustrations.test.cjs` — présence, format, dimensions, poids et conservation des M/F/N du jeu.

Aucune modification des moteurs de jeux, contenus pédagogiques, records, utilisateurs ou sauvegardes. Anciennes images conservées mais non référencées. Recette manuelle à vérifier sur Samsung Chrome/PWA à 320/360/390/430 px CSS, état verrouillé, zoom texte et connexion lente.

## SPEC 100 — Lisibilité des cartes sur illustration (26/10/2026)

La capture Android montrait des descriptions et des records difficiles à lire sur les scènes lumineuses. Correction exclusivement CSS :
- Renforcement graduel du voile sombre à gauche, jusqu'au centre-droit, sans panneau rectangulaire visible ; les éléments graphiques restent apparents à droite.
- Assombrissement supplémentaire du bas pour les statistiques et le CTA.
- Description plus claire (`#f4ede5`, graisse 500) avec ombre diffuse ; même protection des titres et métadonnées.
- Les WebP, leurs dimensions, les tuiles, les records et les actions des boutons sont inchangés.
- `jeux-univers.css?v=5` force la mise à jour du cache ; tests statiques dédiés.

Contrôle visuel Android Chrome/PWA encore nécessaire aux largeurs 320–430 px, avec zoom de texte et état verrouillé.
