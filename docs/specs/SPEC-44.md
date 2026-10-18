# SPEC 44 — Chemin déplié après « Refaire mes erreurs » et écran conservé à l'actualisation

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Branche | `v2` |
| Périmètre | `public/chemin.js`, `public/navigation.js`, `public/mission.js`, `public/accueil.js`, `public/app.js`, tests |
| Origine | Demande de Clayton du 18/10/2026 |
| Remplace | Le repli de la leçon des [SPEC 41](./SPEC-41.md) et [SPEC 42](./SPEC-42.md) §5 |

## 1. Retour au Chemin après « Refaire mes erreurs »

**Attendu :**
- retour au Chemin principal ;
- la leçon travaillée **seule dépliée**, comme après un appui sur sa carte (unités, progression, étoiles, « Continuer ») ;
- cadrée sous le haut de l'écran et au-dessus de la barre du bas, sans déplacement ultérieur.

**Implémentation :**
- `cheminSurLecon(leconId)` fixe `cheminLeconOuverte = leconId` au lieu de `null`, ce qui replie toutes les autres leçons.
- Cadrage par `centrerLeconChemin()` : la carte est centrée si elle tient, sinon son début est placé en haut, à 12 px. Il est refait après stabilisation (deux images, polices, 400 ms), sauf si l'utilisateur touche l'écran (SPEC 42).
- Même destination par le bouton « Mon chemin » et par Retour (flèche, Android).

## 2. Garder l'écran lors d'une actualisation

**Attendu :**

| Écran avant l'actualisation | Après |
|---|---|
| Chemin | même leçon dépliée, même position |
| Une leçon (unités) | la même leçon, même position |
| Exercice en cours | la même partie, réponses déjà validées gardées |
| Mission en cours | même réplique, réponses validées, vies et essais en cours gardés (pas de vie en moins pour une erreur déjà comptée), sans rappel des règles |
| Lexique, Mes pièges, Réviser, Examens, Réglages | le même onglet |
| Introduction de mission ou d'unité | le même écran |
| Résultat de fin de partie | la leçon (le résultat est déjà enregistré) |
| Révision ou examen en cours | leur onglet de départ (non conservés) |
| Accueil, ou restauration impossible | l'accueil |

**Implémentation (`navigation.js`) :**
- **Sauvegarde** à `pagehide` et quand la page passe en arrière-plan, dans `sessionStorage` (clé `luxNavigation`). Ce stockage est propre à l'onglet, effacé à sa fermeture et jamais envoyé au cloud. On y garde : écran, leçon, position, leçon dépliée du Chemin, unité, partie libre ou principale, état de la mission en cours, historique de l'app.
- **Isolation :** la note contient le profil de stockage (`anonymous` / `user:<id>`). Un autre profil après rechargement (connexion, déconnexion) ne la reprend jamais. Au-delà de 12 h, on repart de l'accueil.
- **Restauration** une seule fois, à la fin de `init()`, après le chargement des leçons et la synchronisation cloud (`restaurerNavigation()`). La note est effacée dès sa lecture, ce qui évite toute double restauration. L'exercice reprend par `reprendreRun()` (partie sauvegardée), la mission par `reprendreMission()` qui recompose la conversation.
- **Historique :**
  - après rechargement, l'entrée « garde » déjà posée est reconnue (`history.state`) et n'est pas ajoutée une 2e fois ;
  - la garde n'est mise à jour qu'une fois la restauration finie (avant, elle était retirée puis remise en même temps, et Retour quittait l'app) ;
  - la longueur de l'historique ne change pas d'une actualisation à l'autre ;
  - Retour remonte comme avant l'actualisation, et quitte l'app depuis l'accueil.
- Aucune donnée de progression locale ou cloud n'est écrite par ce mécanisme.

## Critères d'acceptation

- [x] « Refaire mes erreurs » → « Mon chemin » (ou Retour) : leçon travaillée seule dépliée, unités et bouton visibles, cadrée, stable.
- [x] Actualisation sur le Chemin : même leçon dépliée, même position (deux actualisations de suite).
- [x] Actualisation dans une leçon : même leçon ; Retour → Chemin.
- [x] Exercice : même partie, même avancement.
- [x] Mission : réponses validées, vies et essais gardés ; réplique validée avant « Continuer » gardée.
- [x] Lexique et Réviser conservés.
- [x] Note d'un autre profil ignorée → accueil.
- [x] Historique inchangé ; Retour depuis l'accueil quitte l'app.
- [ ] Recette Android réelle (geste « tirer pour actualiser »).

## Tests

- `tests/test_actualisation.py` (nouveau, dans la suite critique) : tous les cas ci-dessus, en téléphone Android simulé (mobile, tactile) puis sur ordinateur, avec un vrai rechargement de page.
- `tests/helpers.py` : `lecon_cadree()` (leçon seule dépliée et cadrée), utilisée par `test_rappels`, `test_prerequis` et `test_recette_visuelle` (adaptés : la leçon est maintenant dépliée).
- Suite critique `bash tools/critique.sh` : voir la livraison.
