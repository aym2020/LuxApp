# SPEC 98 — Fonds illustrés HD des cartes Jeux

**Branche :** `2.1` · **Date :** 26 octobre 2026 · **Statut :** intégré, recette Android requise.  
**Référence :** maquette visuelle fournie dans la conversation, charte `docs/CHARTE_UI_2.1.md`, jeux `SPEC-88` et runner `SPEC-96`.

## Intention
Remplacer les arrière-plans SVG géométriques des cartes, jugés trop plats, par des **illustrations raster HD** aux détails, textures, ambiances et éclairages comparables à la maquette de référence.

- **Survie :** ville luxembourgeoise nocturne, pont et fortifications éclairés, tuiles alphabétiques dorées en mouvement, évocation immédiate du mot à reconstruire.
- **Lux Runner :** course de nuit sur chaussée réfléchissante, coureur au premier plan, arches bleu/rose/violet et perspective profonde.

Les illustrations sont des images originales créées pour le jeu puis recadrées pour un affichage responsive, et ne servent que de **décor**. Les tuiles `S/U/R` et `M/F/N`, le titre, la description, les records, l'état de déblocage et le bouton Jouer sont des éléments HTML réels.

## Livrables
- `public/art/jeux-survie-card-hd.webp` — **1200 × 800**, ~134 Ko.
- `public/art/jeux-runner-card-hd.webp` — **1200 × 800**, ~121 Ko.
- `public/jeux-univers.css` — branchement WebP et masques de lisibilité côté texte, ombrage extérieur allégé.
- `public/index.html` — cache-busting `jeux-univers.css?v=3`.
- `test/jeux-cartes-illustrations.test.cjs` — test de présence, format RIFF/WEBP, poids, interdiction de réutiliser les SVG dans les styles et non-régression des tuiles M/F/N.

## UX et contraintes
Conserver le noir et l'or de LuxApp, le violet de l'univers jeux, les trois genres sémantiques et les gros boutons Jouer jaunes. Les images ne remplacent aucun texte ou contrôle. Les fonds sont une requête locale statique, sans animation ni appel tiers. En absence d'image, le CSS garde un fond de repli.

## Recette Android
Contrôler à 320/360/390/430 px CSS : titre et description lisibles, décors visibles à droite, pas de lettres fantômes issues de l'image sous les informations, CTA accessible et jeu non modifié. Tester le zoom texte et le rechargement avec cache. L'harmonisation des tuiles M/F/N livrée en V1.3 reste inchangée.

## Hors périmètre
Aucune modification des mécaniques de Survie/Runner, des noms, scores, niveaux, records, progressions, sons ou synchronisations. Les SVG historiques peuvent demeurer dans le dépôt mais **ne sont plus référencés par les cartes**.
