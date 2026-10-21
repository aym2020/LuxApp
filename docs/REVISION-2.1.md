# LuxApp 2.1 — Réviser : configuration éditoriale

Date : 21 octobre 2026  
Branche : `2.1`  
Statut : intégré dans le code ; recette visuelle Android à confirmer.

## 1. Problème traité

L'ancienne configuration de révision juxtaposait cinq sections sous forme de grandes cartes, dont une liste de nombreuses leçons directement dans le flux principal. Le bouton de démarrage apparaissait loin sous la ligne de flottaison. Cela contredisait la direction éditoriale de l'accueil V2.1 : une action dominante, des séparateurs discrets, un jaune réservé aux choix actifs, des informations utiles et peu de décorations répétées.

## 2. Présentation cible

Le nouvel écran affiche un en-tête « RÉVISER / Ta séance de révision » avec le **nombre réel de questions disponibles** pour la sélection actuelle, puis des sections sans fond de carte :

- **Niveau des questions** : Fragile / En cours / Maîtrisé, avec sélection multiple et compteurs calculés.
- **Nombre de questions** : 10 / 20 / 50 / Tout, sélecteur à choix unique. Le choix par défaut reste **20**.
- **Focus** : Aléatoire / À consolider / Difficile, avec désactivation des modes vides. Un message discret explique leur déblocage.
- **Types d'exercices** : Quiz / À trou / Écriture, filtres multiples conservés et affichés en pastilles compactes.
- **Leçons** : ligne synthétique indiquant combien de leçons sont sélectionnées. L'appui ouvre une feuille indépendante listant toutes les leçons du niveau. « Tout cocher / décocher » et « Terminé » conservent les sélections.

Le bouton **Commencer la révision** constitue l'unique CTA jaune principal. La zone des critères défile indépendamment si nécessaire ; le CTA reste visible **au-dessus de la barre de navigation inférieure**. Sur petite largeur, les réglages conservent leurs cibles tactiles d'au moins 44 px.

## 3. Comportement conservé

- `openReviewSetup(seuleLeconId)` pré-sélectionne la leçon demandée, ou toutes les leçons lorsqu'aucun ID n'est fourni.
- Les identifiants `rs-lecons`, `rs-types`, `rs-niveaux`, `rs-count`, `rs-focus` sont identiques à l'ancienne interface.
- Les valeurs techniques des inputs ne changent pas. `readReviewSelection`, `getReviewCounts`, `getConfiguredReview`, `startConfiguredReview` et `demarrerSession` restent les sources de vérité.
- Les trois niveaux de questions sont cochés par défaut, ainsi que tous les types. Le focus par défaut reste **Aléatoire**.
- Le panneau des leçons ne reconstruit pas les cases lors de son ouverture : les modifications sont immédiatement visibles dans les compteurs et préservées à sa fermeture.
- Le panneau se ferme par son bouton, par « Terminé », par le voile ou avec **Échap**. Son parcours au clavier est borné ; la fermeture restitue le focus au bouton d'ouverture.
- Aucun changement des données des leçons, du scoring, de Firebase ou du suivi des niveaux.

## 4. Implémentation

| Fichier | Modification |
|---|---|
| `public/index.html` | Structure éditoriale, contrôles natifs conservés, nouveau dialogue pour choisir les leçons, lien CSS |
| `public/revision-v21.css` | Style scoped à `#view-review-setup`, modes responsives et CTA ancré |
| `public/app.js` | Ouverture/fermeture du dialogue, résumés dynamiques, focus et clavier |
| `test/revision-v21.test.cjs` | Contrat de compatibilité des identifiants, critères et lancement |

La feuille CSS dédiée permet de modifier la page Réviser sans toucher à la présentation des autres écrans.

## 5. Recette attendue

1. Ouvrir « Réviser » via l'onglet du bas et via le bouton de l'accueil : titre, compteurs, sélections et CTA corrects.
2. Vérifier les trois niveaux, les types, les quatre quantités, et le fallback d'un focus devenu indisponible.
3. Ouvrir « Leçons », en décocher une, fermer, vérifier le résumé et le nombre de questions ; recommencer avec « Tout cocher / décocher ».
4. Ouvrir la révision depuis une seule leçon et vérifier qu'elle est l'unique leçon cochée.
5. Démarrer les séances 10, 20, 50 et Tout ; vérifier les nombres effectivement disponibles et l'absence de régression de notation.
6. Essayer les actions clavier, le bouton Android Retour, une faible hauteur d'écran et une police agrandie. La barre inférieure et le bouton de démarrage ne doivent pas se recouvrir.
7. Exécuter `node --test test/revision-v21.test.cjs` depuis la racine.

**Limite :** les tests statiques valident le contrat code/HTML, pas les dimensions et le comportement tactile exacts du Samsung. Le contrôle mobile reste nécessaire.
