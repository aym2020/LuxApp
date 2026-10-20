# SPEC 77 — Accueil invité stable sur écran Android standard

| Champ | Décision |
|---|---|
| Statut | Implémenté sur `v2`, recette visuelle Android à confirmer |
| Portée | Accueil, première visite sans compte, avec la ligne « Mode invité / Se connecter / Créer un compte » |
| Dépendances | SPEC 52 (accueil compact), SPEC 67 (liens de compte), correctif de scroll de l'accueil |
| Fichiers | `public/accueil.js`, `public/style.css`, `tests/test_accueil_compact.js` |

## Constat Android

À la première visite du niveau A1.2, l'ajout de la ligne de compte pousse la dernière carte « Erreurs fréquentes » hors du viewport. La page devient défilable alors que l'accueil est conçu pour tenir sans bouger sur un écran Android standard. Le défilement déplace le grand titre vers le haut.

## Décision

Ne pas déplacer, supprimer ni réduire les actions de navigation. Ne pas transformer la ligne de compte en fenêtre bloquante. Le compactage s'active **uniquement** quand les trois conditions suivantes sont réunies :

1. L'utilisateur n'a pas encore pratiqué (`!aDejaPratique()`).
2. Le service de compte est disponible (`isCloudEnabled()`).
3. Aucun compte n'est connecté.

`renderAccueil()` ajoute `.ac-nouveau-invite` à `#accueil` uniquement dans ce cas, sans modifier le HTML de la page et sans intervenir sur la progression.

Sur un viewport de **810 CSS px ou moins en hauteur**, sous cette classe exclusivement :
- réduire le `gap` de la colonne principale de 14 à 7 px et les paddings verticaux ;
- garder le titre, le sélecteur A1.1/A1.2, les liens de connexion et les quatre accès ;
- rapprocher l'accroche « Prêt à commencer ? » (icône 28 px au lieu de 36, espaces intérieurs réduits) ;
- garder la carte « Commencer » entièrement interactive, min-height 108 px ;
- réduire les interstices entre les accès, dont la cible tactile reste **au moins 60 px**.
- corriger le séparateur **« Ou choisir une autre leçon »** : l'ancien `margin:-6px 0` combiné à l'espacement de 7 px de la colonne le collait à la carte et aux accès ; dans le seul état `.ac-nouveau-invite`, utiliser `margin:6px 0 7px`, `min-height:22px` et `line-height:1.3` pour conserver une séparation visuelle confortable ;
- récupérer 4 px au-dessus de la ligne « Mode invité / Se connecter / Créer un compte » via `.ac-compte { margin-top:-4px }` **sans réduire les zones tactiles**.

Ne pas fixer artificiellement une hauteur de contenu ni interdire le défilement de `#view-dashboard` : un écran plus petit, la police agrandie ou une traduction sur plusieurs lignes doivent toujours rester consultables. L'accueil ne bouge pas **si tout tient** ; sinon il reste défilable.

## Non-régressions

- Accueil d'un utilisateur déjà actif : mise en page et statistiques inchangées.
- Accueil avec compte connecté : pas de compactage.
- Mode sans service de compte : pas de compactage.
- Aucune modification de `public/navigation.js`, du portail d'authentification, des exercices, ni des données de progression.
- Test statique : `node tests/test_accueil_compact.js`, avec états invité/débutant, connecté, actif et hors-ligne ; CSS et 4 accès contrôlés.
- À vérifier sur Android réel : première arrivée invitée A1.2, écran standard et petit écran, puis défilement et retour à l'accueil.

## Ajustement de recette Android — séparateur (20/10/2026)

La capture montre un espace libre au-dessus de la ligne de compte et sous la quatrième carte, mais un séparateur trop comprimé. L'ajustement utilise cet espace pour rendre lisibles les traits et la légende « Ou choisir une autre leçon ». Le changement est strictement CSS et n'affecte pas les autres états d'accueil. Validation statique passée ; confirmation Android requise.
