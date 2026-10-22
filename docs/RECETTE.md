# Recette visuelle (spec 43)

> **Alerte branche 2.1 :** cette recette a été rédigée pour `v2` et ne valide **pas** entièrement les nouveaux exercices 2.1. Pour `2.1`, ne pas exécuter la commande `git reset --hard origin/v2` documentée ci-dessous : elle abandonne les modifications locales et revient sur une autre branche. Lire [le protocole 2.1](POSTMORTEM-EXERCICES-2.1-2026-10-21.md) ; les tests des états et le rendu Android restent nécessaires.


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
2. Choisir l'**écran** à tester : pour les leçons, sélectionner la leçon ; pour **Fin d'examen**, sélectionner le sujet (annale A1.2). Choisir ensuite le **scénario**.
3. **Voir cet écran →** : l'app vide la progression fictive, joue la leçon en accéléré avec ses vraies fonctions, puis affiche le vrai écran (moins d'une seconde dans les tests).
4. Utiliser ensuite les vrais boutons (Continuer, Refaire mes erreurs, Mon chemin, Rejouer la mission, Retour Android…). Depuis tout résultat, « Mon chemin » et Retour mènent au Chemin, la leçon seule dépliée et cadrée (spec 45).
5. **Tester l'actualisation (spec 44)** : sur n'importe quel écran obtenu (mission en cours, exercice, Chemin), tirer l'écran vers le bas pour actualiser. Le même écran doit revenir, avec les réponses, les vies, la leçon dépliée et la position.
6. **Quitter le test** : efface toute la progression fictive (seul le dernier choix du panneau est gardé).

| Écran | Scénarios |
|---|---|
| Fin de mission | Sans faute (3 vies) · Réussie avec 2 erreurs (1 vie) · Perdue (0 vie) · Tente ta chance réussie / perdue · Juste avant la dernière réponse |
| Fin d'étape (écriture, unité 1) | Sans faute · 1re réponse juste au 2e essai |
| Fin d'unité (unité 1) | Sans faute · Avec 3 erreurs (« Refaire mes erreurs ») |
| Rattrapage des erreurs → Chemin | Erreurs refaites : résultat du rattrapage, puis « Mon chemin » (leçon seule dépliée et cadrée, spec 44) |
| **Fin d’examen (annales)** | **100 %** · **≈ 85 %** (Très bien) · **≈ 70 %** (Réussi) · **≈ 40 %** (À retravailler) · **≈ 70 % avec « Mes erreurs » affiché** |

Les erreurs simulées dans les missions et les leçons sont de vraies erreurs (une vie de moins par réplique ratée, réponses ratées une fois puis justes). Les bilans et validations utilisent les fonctions de l'app.

Pour la **fin d’examen**, le mode test choisit des réponses présentes dans les options du sujet, répartit automatiquement les bonnes et mauvaises réponses selon le scénario, puis appelle les **véritables fonctions** de calcul du score, d'affichage des sections et de correction. Le résultat n'est pas une maquette. Les pourcentages sont **approximatifs**, arrondis selon le nombre total de points. Tester ensuite les vrais boutons **« Toute la correction »**, **« Mes erreurs »**, **« Refaire ce sujet »** et **« Autres sujets »**.

**Isolation :** tous les scores et meilleurs résultats obtenus dans ce mode restent sur l'origine de recette sans Firebase. « Quitter le test » les efface ; ils ne sont jamais synchronisés avec ton compte.

## Fichiers

- `server.js` : bloc « MODE RECETTE VISUELLE ».
- `recette/recette.js`, `recette/recette.css` : panneau, scénarios et onglet « MODE TEST ».
- `tests/test_recette_visuelle.py` : accès, isolation, scénarios et durée.


## Survie — recette directe sur la branche `2.1` (22 octobre 2026)

Sur une **instance de recette séparée** démarrée avec la branche `2.1`, `RECETTE=1`, `RECETTE_USER` et `RECETTE_PASS` (mot de passe requis), ouvrir **Plus → Outils de test** ou l'onglet **MODE TEST**, choisir **Fin de Survie**, puis la **leçon 1** et un des scénarios : **Sans-faute** (tous les mots réussis), **2 mots passés** (réserve entièrement parcourue sans sans-faute), **Temps écoulé** (réserve incomplète). Cliquer **Voir cet écran →** : le vrai résultat apparaît sans jouer une partie.

Le décompte dépend du vocabulaire réel de la leçon sélectionnée, pas de mots fictifs. La leçon 1 fournit 5 mots jouables (Moien, Madamm, Här, Schlecht, Äddi). Tester le titre, le vert réservé au sans-faute, le ratio des mots réussis, la série et le record, la présence de « Rejouer » seulement comme action principale si la réserve est incomplètement réussie ou que le temps manque, les boutons « Continuer mon chemin » / « Retour aux Jeux », le Retour Android et les largeurs 320/360/390/430 px ainsi que le bureau.

**Isolation :** ce contrôle est absent du service normal. Les scores de recette restent dans le stockage local de l'origine protégée, Firebase est désactivé. **Quitter le test** efface ces scores fictifs. Pour le rendu, la recette utilise `survieAfficherResultat` du vrai jeu et non une maquette HTML parallèle. Tester aussi manuellement l'arrêt après dernier mot : cette recette vérifie l'écran final, les tests Node vérifient l'enchaînement réel des mots.


### Résultats Survie — maquette finale

Utiliser **Fin de Survie** dans le mode recette sécurisé. Vérifier les trois états et le bandeau inférieur : le CTA jaune « Continuer mon chemin » ou « Rejouer Survie » doit rester visible sans faire défiler le résultat. Le centre peut défiler indépendamment. L'anneau affiche un nombre et « SUR N » sur deux lignes sans chevauchement. Les séries et records sont affichés en colonnes compactes. Le vert indique exclusivement un vrai sans-faute ; le temps écoulé et une réserve avec passés ou erreurs restent neutres.


### Cohérence de la version dans Termux et absence de micro-scroll (22 octobre 2026)

L'ancienne présentation de « Réserve terminée » (fraction horizontale dans le cercle et deux grosses cartes statistiques) ne fait **plus** partie de la version actuelle de `2.1` ; les trois résultats de Survie utilisent la même fonction `survieAfficherResultat`. Si `localhost:3001` l'affiche encore, rafraîchir réellement l'onglet, vérifier la branche locale avec `git branch --show-current` et le SHA avec `git rev-parse --short HEAD`, arrêter le serveur avec Ctrl+C, puis `git pull --ff-only origin 2.1` et redémarrer `RECETTE=1`. Les ressources de l'instance recette renvoient désormais `Cache-Control: no-store` pour éviter un mélange d'anciens CSS et JS entre captures. Un onglet déjà ouvert ne se met pas à jour tout seul.

Les trois résultats gardent leur pied fixe et recentrent leur contenu dans la zone de lecture. Espacements verticaux resserrés pour qu'un Android moderne à hauteur normale voie tout le résultat **sans micro-scroll**. La zone de lecture reste défilante sur les écrans courts, en navigation navigateur avec barres visibles, ou en police agrandie : ne jamais désactiver tout scroll au prix d'un texte ou d'un bouton coupé. Tester le scénario **Réserve terminée** et le chrono ; quitter le mode test pour effacer le faux record.


**Précision technique sur le cache de recette :** pour les fichiers statiques (`jeux-v21.css`, `jeux-v21.js` et `recette/recette.js`), Express configure ses propres en-têtes : `setHeaders` impose désormais `Cache-Control: no-store` dans les deux dossiers statiques. Une vérification HTTP est ajoutée à `tests/test_recette_visuelle.py`. Ce contrôle ne remplace pas l'actualisation de l'onglet ni la mise à jour du clone Git local.
