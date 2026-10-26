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

## SPEC 102 — Mise à jour de l’illustration Lux Runner (26/10/2026)

**Motif :** la branche `2.1` propose désormais, dans le gameplay 3D, trois formes distinctes de portails (carré masculin, rond féminin, octogone neutre), avec bleu/rouge/vert comme codes *pédagogiques*. Il ne faut pas reproduire ces couleurs sémantiques dans le décor statique de la carte.

**Décision artistique :** le fond de carte est une illustration raster HD **1200 × 1200 WebP**, ~97 Ko, montrant Luxembourg nocturne avec éclairages **jaune/or**, route et ambiance **violettes**, coureur de dos et passages neutres dans le décor. Les formes ne sont pas des réponses colorées ni des contrôles interactifs. Les vrais M/F/N restent des tuiles HTML bleu/rouge/vert au-dessus de l'image. La zone gauche reste sombre pour les titres/description ; le bas protège les statistiques et le bouton « Jouer ».

**Changement isolé :** nouveau `public/art/jeux-runner-card-or-violet.webp`, nouvelle URL dans `public/jeux-univers.css`, cache-busting `jeux-univers.css?v=7`, tests mis à jour. **Aucun changement** au visuel Survie, au code 3D, au gameplay, au score, aux sauvegardes ou aux données linguistiques.

**Recette :** contrôles Chrome Android à 320–430 px CSS, descriptions longues, reflets dorés visibles à droite, absence de bleu/rouge/vert sur les portails de fond, maintien des trois tuiles colorées M/F/N en HTML.

## SPEC 103 — Hiérarchie UX des cartes Jeux (26/10/2026)

Après audit des captures Android, les deux cartes cumulaient image trop sombre, paragraphes longs, statistiques isolées et CTA redondants visuellement. **Correction de la présentation réelle, sans générer de nouvel asset** :

- Titres Instrument Serif conservés, espacement vertical resserré et cartes au rayon commun de 24 px.
- Textes de présentation plus courts : objectif pédagogique de chaque jeu immédiatement identifiable.
- Statistiques regroupées dans un bandeau sombre et compact à deux colonnes : réserve ou durée/niveau à gauche, **record valorisé en or** à droite ; valeurs dynamiques et stockage inchangés.
- Illustration révélée davantage à droite tout en gardant une réserve sombre sous la copie. La ville reste or, l'univers Runner violet, et les couleurs des portails ne sont pas imprimées sur l'image.
- Bouton « Jouer » jaune conservé, min. 56 px de hauteur, avec retour tactile sobre ; aucun nouveau contrôle.
- Mobile-first : cartes non verrouillées d'une hauteur minimale modérée, contenu verrouillé à hauteur intrinsèque, prise en charge des largeurs <= 359 px et de `prefers-reduced-motion`.
- Cache invalidé : `jeux-univers.css?v=8`, `jeux-v21.js?v=15`, `runner.js?v=16`. Tests statiques dédiés aux URL, textes, CTA et records.

**Recette manuelle :** Chrome Samsung portrait 320/360/390/430 px, cartes verrouillées/déverrouillées, zoom de texte 200 %, records à 4 chiffres et navigation. Jeux, progression et données pédagogiques inchangés.
