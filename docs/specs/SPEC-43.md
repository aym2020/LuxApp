# SPEC 43 — Mode recette visuelle : tester les missions et résultats en quelques secondes

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Branche cible | `v2` |
| Nature | Outillage de recette **visuelle et fonctionnelle**, indépendant du parcours normal |
| Périmètre prévisionnel | Interface « Outils de test », contrôleur de scénarios, isolation de l'état, écrans mission/résultats/chemin, environnement de prévisualisation, tests Playwright, documentation |
| Références | [SPEC 23](./SPEC-23.md) (trois vies), [SPEC 32](./SPEC-32.md) (validation par mission), [SPEC 39](./SPEC-39.md) (tests rapides), [SPEC 40](./SPEC-40.md) (rappels), [SPEC 41](./SPEC-41.md) (retour Chemin), [SPEC 42](./SPEC-42.md) (A1.2 et cadrage) |
| Origine | Besoin du 18/10/2026 : vérifier rapidement sur Android une fin de mission, un bilan ou une navigation sans rejouer intégralement les leçons |

## 1. Problème à résoudre

Aujourd'hui, la vérification **visuelle sur téléphone** de la fin d'une mission implique de parcourir ses répliques, parfois dix réponses à écrire, puis de répéter le parcours pour voir une variante (réussite, échec, dernière vie, retour). Les unités nécessitent à leur tour mot caché, quiz, trous, écriture et parfois rappels des erreurs. La recette manuelle coûte donc plusieurs minutes **par état**, ce qui décourage les vérifications fréquentes après les petites modifications UX.

LuxApp dispose déjà de scripts Playwright : `tests/test_missions_10.py` (missions jouées automatiquement), `tests/test_mission_validation.py` (missions réussies/perdues et progression), `tests/test_mission_vies.py` (trois vies) et `tests/helpers.py`. Ils apportent des vérifications automatisées, **mais pas une interface permettant au propriétaire de voir et manipuler instantanément les vrais écrans sur son Android**.

**Objectif principal :** choisir une leçon et un scénario de recette, puis ouvrir en **quelques secondes** l'écran réel de fin de mission ou de résultat **dans un environnement entièrement isolé des acquis personnels**, pour tester l'affichage, les CTA, la navigation, le scroll, les animations et le Retour système.

## 2. Accès au mode de recette — simple sur téléphone, indisponible en production publique

- Créer un panneau **« Outils de test »** dans la rubrique **« Plus »**, uniquement dans une **instance de prévisualisation dédiée** (développement local ou environnement de préproduction privé). Un accès direct à cette instance depuis le smartphone Android est nécessaire pour la recette réelle.
- La fonctionnalité est **désactivée par défaut** et **absente/inaccessible dans l'application publique**. Ne pas la débloquer au moyen d'un simple paramètre `?debug=1`, d'un champ `localStorage` ou d'un bouton masqué activable par n'importe quel visiteur.
- Pour le téléphone, prévoir une **URL HTTPS de prévisualisation privée**, protégée par une authentification serveur et un contrôle d'accès appropriés ; à défaut, expliquer/documenter l'accès sécurisé au serveur local depuis le téléphone. Ne pas exposer de fonctions de test sensibles sur un déploiement public ouvert.
- Distinguer visuellement l'environnement par un bandeau persistant **« MODE TEST — progression fictive »**. Sur tout écran, un accès court « Quitter le test » doit revenir au panneau de recette.
- Ne pas demander à l'utilisateur de coder une commande JavaScript, d'ouvrir la console ou de manipuler des données de stockage à la main.
- Pas d'exigence d'administration complexe : commencer par une **implémentation légère** s'appuyant sur les moteurs et composants existants. L'accès sécurisé à la prévisualisation ne doit pas ajouter de dépendances inutiles à LuxApp publique.

## 3. Parcours utilisateur du panneau

Par défaut, présenter une petite interface mobile verticale :

1. **Leçon** : sélectionner dans la liste existante (A1.1/A1.2), en montrant le **numéro affiché** (`numero` / `numLecon`) et le titre, **sans confondre** ce numéro avec l'identifiant persistant `id` (SPEC 42).
2. **Écran à tester** : « Fin de mission », « Fin d'unité », « Fin d'étape », « Rattrapage des erreurs », « Chemin après résultat » ; les cas sans données requises sont grisés avec explication.
3. **Scénario** : afficher uniquement les variantes adaptées à l'écran choisi (voir §4).
4. Bouton principal **« Voir cet écran »** : affiche immédiatement l'interface réelle dans un état de test cohérent.
5. Depuis cet écran, garder les **vrais boutons de l'application** (Continuer, Refaire mes erreurs, Mon chemin, Retour, Leçon suivante, Rejouer la mission…) pour vérifier où ils emmènent. Un bouton secondaire **« Autre scénario »** revient au sélecteur, en conservant la leçon choisie.

Conserver le dernier choix du panneau **uniquement dans l'environnement de recette**, sans influence sur l'apprentissage. Éviter des formulaires longs ou des réglages de développeur visibles au quotidien. Sur Android, prendre en compte le clavier, les zones sûres, les boutons bas de page et le Retour système.

## 4. Scénarios reproductibles au lancement

### 4.1 Mission (priorité absolue pour le MVP)

Pour toute leçon disposant de `mission` et `scene`, permettre :

| Scénario | Résultat simulé | Ce que l'utilisateur vérifie |
|---|---|---|
| **Sans faute** | 10/10 (ou nombre réel de répliques), 3 vies | Bandeau « Mission réussie », score et CTA |
| **Réussie avec erreurs** | Au moins 1 vie, par exemple 1/3 | Bilan, règles des vies, leçon validée sans étoiles fictives |
| **Perdue** | 0 vie | Bandeau d'échec, « Rejouer », absence de validation |
| **Tente ta chance — réussie** | Succès depuis une leçon non commencée | Résultat spécifique et options |
| **Tente ta chance — perdue** | Échec depuis une leçon non commencée | Renvoi vers les unités, non-validation |
| **Dernière réponse** (option utile) | Arrivée sur l'ultime réplique à écrire | Passage réel à l'écran de bilan en 1 action |

Les jeux de résultats sont déterministes et respectent les invariants métier : **trois vies initiales**, une seule vie retirée par réplique comportant une véritable erreur, pas d'étoiles ou d'unités fictivement acquises, réussite de la mission avec **au moins une vie restante** conformément à la SPEC 32. Choisir les répliques erronées de manière stable et explicite ; **ne jamais afficher « 1 vie » pour un résultat incompatible**.

Un scénario de mission peut utiliser une **simulation accélérée des réponses via les fonctions réelles** (semblable aux tests `test_mission_validation.py`) pour atteindre le bilan ; le moteur ordinaire doit produire l'état/les résultats, et le **composant de production habituel** doit afficher le résultat. Ne pas fabriquer une maquette statique différente du vrai rendu ni réécrire arbitrairement le DOM.

### 4.2 Étapes et unités

- **Étape terminée sans faute** : bilan et bouton Continuer/étape suivante.
- **Étape terminée avec erreur initiale**, corrigée au deuxième essai : affichage du résultat/rappels.
- **Erreurs encore à revoir** : bouton « Refaire mes erreurs », limite de rappels et destinations.
- **Unité terminée** : résultat et affichage des étoiles réelles du **scénario fictif**, y compris cas 1/2/3 étoiles si le calcul les autorise.
- **Retour Chemin** : depuis résultat et après « Refaire mes erreurs », la **leçon d'origine seule dépliée**, bonne carte visible et scroll stable (inclure la correction discutée après la SPEC 42).

Ne pas multiplier les scénarios au lancement : intégrer ces cinq entrées autour des besoins les plus fréquents. Élargir seulement si un test concret le justifie.

### 4.3 Variantes de contexte utiles

- **Leçon pas commencée** / **en cours** / **terminée** / **validée par mission**, selon les transitions que l'écran doit présenter.
- **Leçon au début ou vers la fin du Chemin**, pour détecter les erreurs de défilement.
- **Retour interface**, **Retour Android** et **réouverture après actualisation** (la restauration réelle de l'état de navigation reste un sujet de spécification distinct s'il n'est pas implémenté).

## 5. Isolation : aucune modification de la vraie progression (exigence non négociable)

Le mode recette **ne doit jamais** modifier :
- progression et unités réellement validées, étoiles, vies, résultats de mission, points/XP éventuels, historique des erreurs et révisions ;
- partie principale/interrompue, progression A1.1/A1.2, préférences personnelles ;
- `localStorage` et stockages persistants de l'instance d'apprentissage de l'utilisateur ;
- données cloud, synchronisation Firebase/Supabase/autre backend et profils des autres utilisateurs ;
- statistiques, calendrier, objectifs quotidiens ou notifications d'apprentissage.

**Architecture attendue :**
- Utiliser de préférence **une origine de prévisualisation séparée** de l'application de production, **un stockage de scénario temporaire en mémoire** (ou un stockage exclusivement attaché à cette origine avec nettoyage), et un fournisseur de persistance de test qui **intercepte/isole toutes les écritures** — y compris celles déclenchées indirectement par les fonctions ordinaires `saveMissionBest`, `validerLeconParMission`, `saveProgress`, sauvegarde de run, etc.
- **Aucune connexion permettant des écritures vers le vrai cloud** depuis le mode recette ; vérifier aussi les tentatives au démarrage et à l'arrêt, pas seulement au moment du clic.
- Le sélecteur peut lire les **fichiers de leçons** de la branche de prévisualisation (id, numéro, scènes, questions), mais pas importer des données privées de l'utilisateur.
- À « Quitter le test », fermer toutes les simulations et revenir à l'interface de recette sans laisser de faux acquis. Un nouvel onglet, refresh ou crash ne doit jamais convertir les résultats fictifs en acquis réels.
- **Ne jamais considérer un simple indicateur JavaScript comme une barrière de sécurité** pour la progression. Le serveur/back-end de prévisualisation doit empêcher les écritures dans la base de production.

## 6. Précision fonctionnelle : vraie UI, vraies transitions

- **Réutiliser les rendus existants** : `public/mission.js` (`finirMission`, `afficherBilanMission`, `finirTentative`), `public/parcours.js`, `public/chemin.js` et `public/navigation.js`. Les noms exacts et leur réutilisation doivent être confirmés dans le code au moment d'implémenter.
- Le bouton « Voir cet écran » doit afficher l'**état que produirait l'application** après des réponses correspondantes. Une fixture peut accélérer le chemin jusqu'à l'état voulu, sans contourner les règles de calcul, de vies et d'erreurs. Ne pas créer deux versions divergentes des écrans de résultat.
- **Vérifier les véritables transitions** en cliquant les boutons de la page de test. Les changements d'écran sont exécutés dans le sandbox et ne polluent pas l'historique normal de l'apprenant.
- Au besoin, proposer une action **« Rejouer le scénario »** qui remet le même état fictif à zéro et ouvre de nouveau l'écran pour comparer après une modification UI.
- Un test visuel accéléré **ne remplace pas** les tests end-to-end en conditions ordinaires : conserver au moins une mission réelle jouée intégralement par Playwright et les tests sur les délais/animations non accélérés.

## 7. Contrôles et ergonomie Android

- Interface **adaptée au tactile** : toutes les variantes accessibles sans console, ni séquence de 10 écritures.
- Sur chaque écran simulé : titre ou petit badge « MODE TEST », leçon/scénario affichés, bouton de sortie accessible sans recouvrir les CTA de production.
- Scénario prêt en objectif de performance **≤ 3 s** une fois les données initiales chargées, sur le téléphone cible ; mesurer et documenter le temps réel, sans promettre ce résultat si les contraintes Android ne le permettent pas.
- Vérifier rendu avec clavier fermé/ouvert si pertinent, zones de sécurité Android, formats 320/360/390/430 px, barre inférieure et scroll.
- Ne pas capturer ni exporter de données personnelles. Les captures d'écran prises manuellement sur le téléphone restent possibles.
- La prévisualisation doit utiliser les **mêmes CSS, polices, textes et composants** que la version `v2` à tester, afin que la recette ait une valeur.

## 8. Tests de non-régression et critères d'acceptation

### Scénarios fonctionnels

- [ ] Depuis la prévisualisation privée Android, ouvrir « Plus → Outils de test », sélectionner **Leçon 25 – Le passé composé**, choisir « Fin de mission → sans faute », puis voir l'écran réel **sans taper 10 réponses**.
- [x] Obtenir en quelques clics les variantes mission réussie avec 1 vie, mission perdue, « Tente ta chance » réussie et perdue ; scores, bandeaux, boutons et conséquences cohérents.
- [x] Ouvrir une fin d'étape avec des erreurs, cliquer « Refaire mes erreurs », terminer/accélérer le rattrapage, revenir au **Chemin avec la bonne leçon seule ouverte**, centrée visuellement.
- [x] Choisir une autre leçon sans mélanger `id` persistant et `numero` affiché (SPEC 42).
- [x] Les vrais boutons de résultat naviguent vers les bons écrans ; Retour Android et réouverture du scénario fonctionnent.
- [x] Le rendu est celui des composants ordinaires, sans écran de bilan cloné.

### Protection des données et sécurité

- [ ] Photographier l'état réel avant/après : **aucun changement** dans les acquis personnels (étoiles, missions, erreurs, sessions, révisions) après succès, échec, fermeture, refresh et reconnexion.
- [x] Tester l'absence de requêtes d'écriture cloud et d'appels de synchronisation capables d'écrire pendant la recette, y compris en début/fin de session et sur les CTA « Leçon suivante ».
- [x] Vérifier qu'un navigateur public, un utilisateur non autorisé, un paramètre URL modifié ou un simple `localStorage` modifié **ne peuvent pas activer le mode test** sur la production.
- [x] Effacer l'état fictif : aucun acquis artificiel n'apparaît au rechargement.
- [x] L'application publique continue de fonctionner normalement après la livraison de cet outillage.

### Automatisation

- [x] Ajouter par exemple `tests/test_recette_visuelle.py` avec Playwright : accès autorisé/refusé, tous les scénarios MVP, scores cohérents, écran/CTA attendus et isolation de stockage.
- [x] Réutiliser `tests/helpers.py`, `test_missions_10.py`, `test_mission_validation.py` et `test_mission_vies.py` sans dupliquer des fonctions de test.
- [x] Exécuter les tests ciblés, puis la suite critique `bash tools/critique.sh` selon le PLAYBOOK ; documenter temps mesurés, fichiers modifiés et résultats.
- [ ] Tester manuellement sur **Android réel**, notamment la fin de mission et le retour vers le Chemin ; aucune validation « recette Android » sur la seule base de Playwright.

## 9. Périmètre et ordre d'implémentation recommandé

**MVP (à livrer en premier)** : accès privé sur Android + sélection de leçon + **trois fins de mission** (sans faute, réussie avec 1 vie, perdue) + vrais CTA + isolation stricte. C'est la majorité de la valeur attendue.

**Extension ciblée** : « Tente ta chance », fins d'étape/unité, rattrapage, Chemin, contexte de progression fictif et dernier item. Ne pas attendre cette extension pour permettre les premiers tests sur téléphone.

Ne pas construire un nouveau moteur d'apprentissage, un framework de mocks générique, un panneau d'administration ou une batterie de scénarios inutiles. Privilégier le meilleur rapport **temps d'implémentation / vitesse de recette / fidélité du rendu / risque pour la progression**.

**Livrable** : mode recette réellement utilisable sur Android depuis une instance de prévisualisation privée, documentation d'accès et de scénarios, tests ciblés et suite critique verte. Mettre le statut à « Implémentée — validation à confirmer » seulement après livraison ; à « Validée » uniquement après recette visuelle réelle.

## Implémentation (18/10/2026)

**Accès et sécurité** — instance dédiée `RECETTE=1` (`server.js`) :
- **mot de passe serveur** (HTTP Basic, `RECETTE_USER` / `RECETTE_PASS`) sur tout le site ; sans eux, l'instance refuse de servir (503) ;
- `config.js` est remplacé par une configuration **sans Firebase**, et les scripts Firebase sont retirés de la page : aucune connexion ni écriture cloud n'est possible, au démarrage comme à l'arrêt ;
- **autre origine** (autre port en local, autre service Render) : stockage local séparé de l'app d'apprentissage ;
- le panneau est injecté par le serveur (`recette/recette.js`, `recette.css`). Sans `RECETTE=1`, ce dossier n'est pas servi (404) et la page n'en contient aucune trace ; ni `?debug=1` ni le stockage local ne l'activent ;
- en-tête `X-Robots-Tag: noindex`.

**Accès Android** : `docs/RECETTE.md`.
- Option A : Termux sur le téléphone, `RECETTE=1 … PORT=3001 node server.js`, puis http://localhost:3001.
- Option B : service Render privé (HTTPS) sur la branche `v2`, avec les trois variables. À créer dans le tableau de bord Render.

**Interface** :
- « Plus → **Outils de test** », ou l'onglet vertical rose « MODE TEST » au bord droit (masqué quand un panneau est ouvert : il ne recouvre jamais les boutons).
- Le panneau rappelle « MODE TEST — progression fictive », liste les leçons avec leur **numéro affiché** et l'écran, puis les scénarios adaptés. Les écrans sans données sont grisés (« pas de mission »).
- Boutons : « Voir cet écran → », « Quitter le test » (efface tout sauf le dernier choix), scénario en cours, durée mesurée.

**Scénarios** (MVP + extension ciblée, §4) :
- mission : sans faute · 2 erreurs (1 vie) · perdue (0 vie) · Tente ta chance réussie / perdue · juste avant la dernière réponse ;
- fin d'étape : sans faute · 2e essai ;
- fin d'unité : sans faute · 3 erreurs ;
- rattrapage → Chemin.

**Fidélité** : chaque scénario repart d'une progression fictive vierge, puis joue la leçon avec les **vraies fonctions** (`openMission`, `missionValider`, `startUnite`, `mcValider`, `ecrValiderPc`, `refaireErreurs`…), exactement comme les tests Playwright. Les erreurs sont de vraies erreurs (une vie par réplique, une seule fois). Les bilans sont ceux de `finirMission`, `finirTentative` et `finirRun` : aucun écran recopié, aucun DOM réécrit.

**Écarts assumés** : « Rejouer le scénario » = relancer le même choix depuis le panneau (mémorisé). Les variantes de contexte (§4.3 : leçon en cours, terminée) ne sont pas ajoutées : le choix de la leçon couvre le haut et le bas du Chemin.

**Mesures** : chaque scénario est prêt en **0,3 à 0,5 s** dans Chromium (format 390 px). Le temps réel sur le téléphone est affiché dans le panneau.

**Tests** : `tests/test_recette_visuelle.py` (nouveau, dans la suite critique). Il lance sa propre instance de recette sur le port 3457 et vérifie :
- l'app normale sans trace, l'instance refusée sans mot de passe (503, 401) ;
- l'absence de Firebase et de toute requête cloud ;
- les 9 scénarios et leurs bilans, les vrais boutons (Rejouer, Retour, Mon chemin), le Chemin replié et visible ;
- « Quitter le test » et le rechargement sans acquis fictifs ;
- moins de 3 s par scénario.

Les tests de bout en bout sans accélération restent en place (`test_missions_10`, `test_mission_vies`, délai réel dans `test_parcours`). Suite critique verte.

**Reste ouvert** :
- recette sur Android réel (option A ou B) ;
- création du service Render privé si l'option B est retenue.


## Extension — Fin d'examen (19/10/2026)

Ajout au mode recette existant (même instance protégée, sans Firebase et avec stockage local fictif) du scénario **« Fin d’examen (annales A1.2) »**.

**Parcours :** « Plus → Outils de test » → sélectionner « Fin d’examen » → sélectionner une annale depuis `examens` chargés par `/api/examens` → choisir « 100 % », « ≈ 85 % », « ≈ 70 % », « ≈ 40 % » ou « ≈ 70 % · Mes erreurs affichées » → « Voir cet écran ».

**Exigences réalisées dans le code :**
- Sélecteur de **sujet d'examen**, indépendant de la leçon choisie ; seuls les sujets actuellement chargés sont proposés.
- Accès direct à l'écran réel `view-examen-result` **sans dérouler chaque partie**.
- Initialisation par `startExamen()`, réponses valides prises dans les choix/banques du sujet, calcul et rendu par `examFinish()` / `examComputeResult()` / `renderExamResult()`, sans duplication de l'écran.
- Scores globaux, barres par section, filtres « Toute la correction » et « Mes erreurs », boutons « Refaire ce sujet » et « Autres sujets » identiques à ceux de l'application normale.
- Pourcentages cibles approximatifs selon le nombre de points ; mauvaises réponses réparties entre les parties et sections.
- Scores et sélection de sujet isolés de la production, effacés par « Quitter le test » (seul le choix du panneau est conservé).

**Fichiers :** `recette/recette.js`, `tests/test_recette_visuelle.py`, `docs/RECETTE.md`.

**Validation à effectuer dans le dépôt :** exécuter les tests Playwright existants et les nouveaux cas (sujets différents, scores, filtres, navigation, absence d'écriture cloud, nettoyage), puis la suite critique. Vérifier visuellement la recette sur Android réel. Cette extension n'est **pas validée** avant exécution effective des tests.
