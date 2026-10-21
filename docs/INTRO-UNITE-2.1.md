# LuxApp 2.1 — Introduction d'unité : refonte éditoriale

Date : 21 octobre 2026  
Branche : `2.1`  
État : intégré et testé au niveau du code ; recette visuelle Android à confirmer.

## Objectif

Sur l'écran `view-pintro` (« Unité 1 · Ce que tu vas apprendre »), le fond brun du bloc **LA RÈGLE** et le fond orange de **ATTENTION** alourdissaient la lecture. Les informations essentielles de l'unité étaient déjà bien présentées : titre en Instrument Serif, phrase emblématique, lexique à deux colonnes, exemples et CTA jaune constamment accessible. L'intervention est volontairement limitée à ces deux encadrés et à quelques marges.

## Changements livrés

- **LA RÈGLE :** supprimés : panneau brun, coins arrondis, bordure et ombre. Le titre et le contenu pédagogique passent directement sur le fond noir chaud ; les expressions importantes restent en jaune. Les exemples de la règle sont maintenus à l'identique.
- **ATTENTION :** supprimé : fond orange, coins arrondis et effet carte. Un filet vertical orange de 3 px indique toujours l'avertissement. La couleur des termes importants reste orange.
- **Rythme :** réduction modérée des espaces après le titre et la phrase de l'unité, et entre les blocs Règle et Attention. Aucun texte n'est retiré pour gagner artificiellement de la hauteur.
- **Inchangés :** bloc « LA PHRASE DE L'UNITÉ », liste des mots, mots supplémentaires dépliables, exemples, durée, bandeau supérieur, accès Cours et Accueil, bouton jaune `Commencer →` toujours visible et logique de démarrage de l'unité.
- **Portée :** tous les sélecteurs de la nouvelle feuille de style ciblent exclusivement `#view-pintro`. Les introductions de mission, le scénario, les exercices et les autres écrans ne sont pas concernés.

## Implémentation

| Fichier | Rôle |
|---|---|
| `public/intro-unite-v21.css` | Ajustements visuels strictement propres à l'introduction d'unité |
| `public/index.html` | Chargement du CSS après les feuilles existantes |
| `test/intro-unite-v21.test.cjs` | Six tests de non-régression (fond, filet, espacement, contenu et portée) |

Le JavaScript `public/parcours.js` et les données JSON des leçons n'ont pas été modifiés. Les modes exceptionnels (bonus, unité sans règle, unité sans pièges, introduction du studio) restent générés par la même logique conditionnelle.

## Recette Android

1. Ouvrir l'unité 1 de la leçon « Décrire des objets », vérifier « LA RÈGLE » sur noir, « ATTENTION » signalé par un filet orange, avec tous les termes et exemples visibles.
2. Faire défiler la liste des mots, les exemples et les éventuels « + » : aucune rupture de mise en page et aucun texte coupé.
3. Tester « Commencer » ainsi que le bouton « Cours » et le retour vers « Mon chemin ».
4. Vérifier sur une unité avec et sans section Attention, une unité longue, écran étroit, police agrandie et paysage.
5. Vérifier que le CTA reste fixe et ne masque ni la dernière ligne du lexique ni la durée.

Tests : `node --test test/intro-unite-v21.test.cjs`. La recette visuelle sur Samsung reste une étape distincte.

## To-do

- [x] Détail de la leçon — validé
- [x] Introduction de mission — intégrée
- [x] Scénario de mission — validé visuellement
- [x] Introduction d'unité — intégrée, validation visuelle Android en attente
- [ ] Panneau Cours — à refondre
- [ ] Charte globale des animations — à formaliser et appliquer
