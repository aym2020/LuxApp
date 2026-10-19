# SPEC 54 — « Mon chemin » : numéro au-dessus du titre et intitulés homogènes

| Champ | Valeur |
|---|---|
| Priorité | P1 — finition visuelle mobile |
| Statut | **Implémentée — recette Android à confirmer** |
| Branche | `v2` |
| Périmètre | `public/chemin.js`, `public/style.css`, `tests/test_chemin_cartes.js`, registre des specs |
| Compatible avec | SPEC 29/30 (grilles adaptatives), 33 (chemin continu), 48 (états et progression), 53 (unités et missions courtes) |

## Contexte

Dans les cartes **repliées** de « Mon chemin », « LEÇON N » occupe une colonne à gauche du titre, qui se retrouve repoussé, passe prématurément à la ligne et manque d'alignement entre les différentes cartes. Le titre de la leçon 5 (« Les nombres et la façon de compter en luxembourgeois ») est particulièrement long. La maquette validée montre un petit « LEÇON N » **au-dessus** du vrai titre, sur toute la largeur disponible (moins le chevron), avec des statuts sous le titre.

## Exigences

1. **Une hiérarchie unique**, pour toutes les leçons A1.1 et A1.2, repliées ou dépliées : numéro discret sur sa propre ligne, titre principal immédiatement dessous, puis statut/révision s'il existe. Le chevron reste en haut à droite. Pas de numéro dans une colonne à gauche du titre.
2. Les **titres gardent leur texte actuel** et restent lisibles ; ne jamais abréger automatiquement au premier tiret, point ou deux-points. Pour la seule leçon 5, afficher dans le chemin **« Les nombres et le comptage »**, une formulation fidèle et courte, sans modifier le JSON de leçon ni le contenu pédagogique.
3. Gérer les abréviations dans un dictionnaire **strictement de présentation**, indexé par ID et titre original attendu. Si le titre source change, revenir automatiquement au titre non abrégé (pas de libellé périmé). La fonction `titreCourt` historique continue d'être utilisée ailleurs.
4. L'**intitulé complet** reste dans le `aria-label` du bouton replié, dans son `title`, dans celui de la carte dépliée et dans l'écran de leçon. Le numéro et l'état restent correctement annoncés. Le texte abrégé n'est qu'un confort visuel.
5. Ne changer **ni les actions**, ni l'ouverture/repli de l'accordéon, ni les états (en cours, acquise précédemment, terminée, mission), ni les révisions, ni les animations, ni les contenus du bilan et des missions.
6. Conserver une zone tactile d'au moins **44px**, le style sombre actuel, les chevrons, les ronds, les couleurs et le rail. Ne pas augmenter artificiellement le padding ni masquer tout le Chemin pour supprimer le scroll.
7. Les titres réels longs peuvent aller sur **deux lignes ou davantage si nécessaire** (zoom, accessibilité), sans chevaucher chevrons et statuts. Ne pas utiliser de troncature coupant la notion principale. L'objectif visuel est **un alignement homogène**, pas une hauteur fixe artificielle.
8. Les libellés abrégés de la SPEC 53 (unités et missions) restent inchangés. Les cartes d'examen et les autres écrans ne sont pas concernés.

## Contrôles

- [x] Les 25 leçons A1.1/A1.2 du catalogue actuel sont représentées par le nouveau gabarit commun.
- [x] « Leçon 1 » et « Leçon 7 » : aucun titre déplacé dans une colonne de gauche.
- [x] « Leçon 5 » : « Les nombres et le comptage » seulement dans le Chemin ; titre intégral accessible et contenu JSON inchangé.
- [x] Leçon 27 A1.2, cartes repliées/dépliées, statuts, révisions et commandes inchangés.
- [x] Si le titre original de la leçon 5 change : repli sur le texte original.
- [x] CSS mobile : chevron hors du texte, grille et libellés empilés, cibles tactiles conservées.
- [x] Tests ciblés du composant et tests de non-régression existants.
- [ ] Validation visuelle Android sur téléphone et avec taille de police augmentée.

**Ne pas déclarer la spec validée sans cette recette.**
