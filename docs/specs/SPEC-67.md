# SPEC 67 — Ligne de compte sur l'accueil invité

| Champ | Valeur |
|---|---|
| Priorité | P1 — accès au compte sans passer par Réglages |
| Statut | **Implémentée sur `v2` — recette Android à confirmer** |
| Complète | SPEC 62, 63 et 66 |
| Fichiers | `public/accueil.js`, `public/portail.js`, `public/style.css` |

## Exigences

1. En mode invité (Firebase disponible, aucun compte connecté), une ligne discrète s'affiche juste sous les puces de niveau de l'accueil : « Mode invité » à gauche, « Se connecter · Créer un compte » à droite. Liens sans contour ni fond ; « Créer un compte » en or. Cibles tactiles ≥ 44 px. Rien pour un compte connecté ni sans Firebase.
2. « Se connecter » et « Créer un compte » ouvrent les écrans de connexion et d'inscription du portail (SPEC 66), avec le même glissement d'entrée. Le passage connexion ↔ inscription reste possible et garde l'e-mail.
3. Ouverts depuis l'accueil : la flèche Retour de l'écran et le bouton Retour du téléphone ramènent à l'**accueil** (glissement de sortie 200 ms), pas à l'écran de bienvenue. « Continuer sans compte » n'est pas proposé (on est déjà invité).
4. Après connexion ou inscription réussie : portail fermé, accueil réaffiché sans la ligne.
5. Au prochain lancement ou après déconnexion, le portail retrouve son comportement normal (retour vers la bienvenue).

## Recette

- [x] Ligne visible en invité à 393 et 360 px sur une ligne ; à 320 px, elle passe proprement sur deux lignes, sans débordement.
- [x] Se connecter / Créer un compte → formulaire animé ; flèche Retour et Retour du téléphone → accueil, portail fermé, aucune garde d'historique restante.
- [ ] Recette Android réelle.
