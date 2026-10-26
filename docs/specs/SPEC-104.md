# SPEC 104 — Cartes Jeux : surfaces graphiques harmonisées sans images

**Branche** : `2.1` · **Date** : 26 octobre 2026 · **Statut** : implémentation, recette Android/Desktop restante.

## Demande et référence approuvée
Reproduire le mock-up HTML « Formes » présenté dans le chat pour Survie et Lux Runner. Les illustrations photo/WebP actuelles nuisent à la lisibilité et à l'harmonisation. L'application conserve sa charte générale : fond noir chaud, Instrument Serif pour les titres, or `#f5cf4d` pour les actions principales et les records ; le violet signifie « univers ludique ».

## Design cible
- **Architecture commune** : même rayon 24 px, mêmes tuiles de prévisualisation, titres, descriptions, métadonnées en bandeau sombre et boutons « Jouer » jaunes. Pas de second CTA ni de nouvelle interaction.
- **Palette** : dégradé aubergine/charbon pour les deux cartes ; Survie reçoit un halo ambre/or et une bordure chaude discrète, Lux Runner un halo violet et une bordure lavande discrète.
- **Survie** : anneau concentrique et lettres A/B/C flottantes **purement décoratives**, à droite. Les tuiles S/U/R restent du vrai HTML.
- **Lux Runner** : arches successives et perspective abstraite **en nuances de violet**, sans bleu/rouge/vert sur les éléments d'arrière-plan ; les M/F/N HTML conservent leurs trois couleurs sémantiques. Les véritables arches, contrôles et gameplay 3D ne changent pas.
- **Lisibilité** : le texte repose sur une surface sombre stable, sans photo ni halo débordant ; les ornements sont derrière les textes, avec `aria-hidden="true"` et `pointer-events:none`.
- **Adaptatif** : 1 colonne jusqu'à 759 px, 2 colonnes au-delà (conteneur jusqu'à 960 px) ; cartes intrinsèquement extensibles pour zoom texte, progression/état verrouillé et records importants ; petites largeurs dès 320 px.
- **Accessibilité** : focus natif des boutons maintenu, prise en compte `prefers-reduced-motion` et `forced-colors`. Aucun texte essentiel porté par le décor.

## Changements
- `public/jeux-v21.js` : wrapper `jeux-cartes-grille` et décoration non interactive de Survie, sans modifier les règles de déblocage et les scores.
- `public/runner.js` : décoration non interactive sur la **carte** Lux Runner uniquement ; aucune modification au jeu, à la préparation ou au tutoriel.
- `public/jeux-univers.css` : remplacement des anciens fonds photo/WebP par un design entièrement en gradients et formes CSS ; page d'accueil et en-tête Jeux préservés.
- `public/index.html` : versionnement `jeux-univers.css?v=9`, `jeux-v21.js?v=17`, `runner.js?v=19`.
- `test/jeux-cartes-illustrations.test.cjs` : tests statiques actualisés pour SPEC 104.

Les anciens fichiers WebP restent stockés dans le dépôt mais ne sont **plus utilisés** par les cartes. Aucun changement des données pédagogiques, progression, Cloud, localStorage, sons ou navigation.

## Recette
- Sur Android Chrome/Samsung : tailles 320/360/390/430 px, scroll vertical, carte déverrouillée et verrouillée, compte invité et connecté, zoom/agrandissement du texte, CTA entièrement visible, pas de débordement.
- Sur ordinateur : deux colonnes équilibrées, esthétique nette à haute définition, variations de hauteur de description et scores à 4–5 chiffres.
- Tester les actions « Jouer », « Voir mes leçons », les records persistants et les niveaux A1.1/A1.2 ; contrôler que les décors ne bloquent aucune zone tactile.

## Hors périmètre
Pas de nouveau fond généré, pas de SVG et pas de nouvelle dépendance, aucune refonte du gameplay Lux Runner/Survie.
