# Recette visuelle (spec 43)

Voir en quelques secondes, sur le téléphone, le **vrai** écran de fin de mission, de fin d'étape ou d'unité, ou le Chemin après « Refaire mes erreurs », sans rejouer la leçon et **sans toucher à ta vraie progression**.

## Principe de sécurité

Le mode recette n'existe que sur une **instance lancée avec `RECETTE=1`** :

| Protection | Comment |
|---|---|
| Accès privé | Tout le site demande un identifiant et un mot de passe (`RECETTE_USER`, `RECETTE_PASS`). Sans eux, l'instance refuse de servir (503). |
| Pas de cloud | Le serveur envoie une configuration **sans Firebase** et retire les scripts Firebase de la page : aucune connexion et aucune écriture cloud n'est possible. |
| Stockage séparé | L'instance a sa propre adresse (autre port ou autre domaine), donc son propre stockage local, distinct de l'app que tu utilises pour apprendre. |
| Rien en production | Sans `RECETTE=1`, le dossier `recette/` n'est pas servi et la page ne contient aucune trace du mode test. Ni `?debug=1` ni le stockage local ne peuvent l'activer. |

**Ne jamais mettre `RECETTE=1` sur les services publics (`main` ou `v2`).**

## Option A — sur le téléphone, avec Termux (le plus rapide)

```bash
cd ~/LuxembourgishApp
git fetch origin && git checkout v2 && git reset --hard origin/v2
npm install
RECETTE=1 RECETTE_USER=moi RECETTE_PASS=un-mot-de-passe PORT=3001 node server.js
```

Puis ouvrir **http://localhost:3001** dans Chrome sur le même téléphone, et saisir l'identifiant et le mot de passe. `localhost:3001` est une autre origine que l'app en ligne : ta progression réelle n'est pas visible et ne peut pas être modifiée.

## Option B — service Render privé (HTTPS, accessible partout)

1. Render → **New → Web Service** → dépôt `aym2020/LuxApp`, branche **`v2`**, commande `npm start` (comme le service v2).
2. Variables d'environnement : `RECETTE=1`, `RECETTE_USER=…`, `RECETTE_PASS=…` (un mot de passe long).
3. Ouvrir l'URL `https://….onrender.com` du nouveau service : le navigateur demande l'identifiant.

Ce service suit la branche `v2` : chaque push met aussi la recette à jour.

## Utilisation

1. **Plus → Outils de test** (ou toucher l'onglet rose « MODE TEST » au bord droit de l'écran).
2. Choisir la **leçon** (numéro affiché, ex. « Leçon 25 · Le passé composé »), l'**écran**, puis le **scénario**.
3. **Voir cet écran →** : l'app vide la progression fictive, joue la leçon en accéléré avec ses vraies fonctions, puis affiche le vrai écran (moins d'une seconde dans les tests).
4. Utiliser ensuite les vrais boutons (Continuer, Refaire mes erreurs, Mon chemin, Rejouer la mission, Retour Android…).
5. **Quitter le test** : efface toute la progression fictive (seul le dernier choix du panneau est gardé).

| Écran | Scénarios |
|---|---|
| Fin de mission | Sans faute (3 vies) · Réussie avec 2 erreurs (1 vie) · Perdue (0 vie) · Tente ta chance réussie / perdue · Juste avant la dernière réponse |
| Fin d'étape (écriture, unité 1) | Sans faute · 1re réponse juste au 2e essai |
| Fin d'unité (unité 1) | Sans faute · Avec 3 erreurs (« Refaire mes erreurs ») |
| Rattrapage des erreurs → Chemin | Erreurs refaites : résultat du rattrapage, puis « Mon chemin » |

Les erreurs simulées sont de vraies erreurs (une vie de moins par réplique ratée, réponses ratées une fois puis justes). Rien n'est fabriqué : bilans, étoiles et validations sont calculés par l'app.

## Fichiers

- `server.js` : bloc « MODE RECETTE VISUELLE ».
- `recette/recette.js`, `recette/recette.css` : panneau, scénarios et onglet « MODE TEST ».
- `tests/test_recette_visuelle.py` : accès, isolation, scénarios et durée.
