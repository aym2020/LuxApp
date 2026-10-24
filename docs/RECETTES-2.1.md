# Catalogue des recettes LuxApp 2.1 — tests et validations sur téléphone

**Branche :** `2.1` · **Instance :** service Render privé avec `RECETTE=1` **ou** installation locale sur `http://localhost:3001`, authentification obligatoire dans les deux cas. Sur Render, la recette a sa propre URL et Firebase est désactivé. **Statut :** livraison incrémentale ; les recettes P0-01 sont le premier lot, pas tous les tests existants. Voir [configuration et sécurité](RECETTE.md).

## Principe obligatoire pour chaque nouvelle tâche

1. **Identifiant stable** de recette (`MC-03`, `Q-02`…), lié à un risque utilisateur et au numéro de TODO.
2. **Préparation par le vrai moteur** dans `recette/recette.js` ; jamais de HTML fictif qui ne serait pas le code réel.
3. **Test automatique nommé** (Node/Chromium) qui vérifie le comportement et l'isolation ; un test ne remplace pas la vérification visuelle sur Samsung.
4. **Critères visibles sur 3001**, état de départ/erreur/réussite et boutons interactifs réellement fonctionnels.
5. **Validation humaine** dans le TODO : capture, date, appareil, commit et éventuelles anomalies. La recette est isolée par le port et `RECETTE=1`, sans Firebase et sans conserver la progression.

## Lot 1 — P0-01, exercices (disponible dans 3001)

| Recettes dans « Écran à tester » | Scénarios | Tests associés | État |
|---|---|---|---|
| **Mot caché** | MC-01 Découverte ; MC-02 Départ ; MC-03/04/05 1/2/3 erreurs ; MC-06 Indice ; MC-07 Réussite ; MC-08 Réponse révélée | `tests/test_motcache_cta_mobile.py`, `tests/test_motcache.py`, `test/exercices-etats-v21.test.cjs` | **Mot caché validé sur Samsung 23/10** ; nouvel accès 3001 à tester |
| **Quiz** | Q-01 Départ ; Q-02 Juste ; Q-03 Faux | `tests/test_parcours.py`, `test/exercices-etats-v21.test.cjs` | **À valider sur Samsung** |
| **Trous** | T-01 Départ ; T-02 Juste ; T-03 Faux | `tests/test_parcours.py`, `test/exercices-etats-v21.test.cjs` | **T-02 et T-03 : visuellement cohérents sur captures Samsung du 24/10 (sélection D erronée confirmée par l'utilisateur) ; T-01 et transitions non vérifiés** |
| **Écriture** | E-01 Départ ; E-02 1re erreur ; E-03 Juste ; E-04 Juste au 2e ; E-05 Échec final | `tests/test_parcours.py`, `tests/test_spec87_session_mobile.py` | **E-02 défaut confirmé : premier faux affiché dans le corps au lieu du bandeau inférieur ; correctif proposé dans la PR de suivi, à retester sur Samsung. E-01/03/04/05 visuellement conformes ; clavier/transitions non vérifiés** |

### Revue manuelle Samsung — 24 octobre 2026 (captures utilisateur)

**Périmètre :** 10 captures Samsung Android transmises dans la conversation. Le SHA déployé n'est pas vérifiable sur les images ; le code de référence consulté pour l'analyse est celui de `2.1`, commit `bad2166`. **Aucune preuve vidéo, aucun test réel du clavier ouvert ni preuve de passage entre questions** dans ce lot. Les captures ne sont **pas** ajoutées au dépôt GitHub.

- **T-02 (juste) :** solution verte, « Juste ! », bonne réponse dans la phrase et CTA « Continuer » visibles. **Conforme visuellement**, sans preuve du fonctionnement de Continuer.
- **T-03 (faux) :** **rectificatif utilisateur du 24/10** : le choix erroné était D, plus bas dans la liste. Le vert « Madamm » indique correctement la solution tandis que « Pas encore » indique l'erreur. **Retirer le diagnostic de bug T-03** ; choix et correction cohérents sur ces captures, sans validation de défilement ou de transition complète.
- **E-01 (départ) :** consigne, champ et Valider visibles. **Conforme sur clavier fermé**.
- **E-02 (premier faux) :** **défaut réel signalé par l'utilisateur** : message rouge placé au milieu dans le corps de la question, au lieu du **bandeau inférieur** commun aux états Quiz/Trous et aux corrections finales. Le deuxième essai et la réponse saisie doivent rester disponibles. Correctif ciblé en cours : utiliser `#pc-feedback.ko.essai` avec « Réessayer » et ne pas verrouiller `pAttente`.
- **E-03 (premier juste) :** titre « Juste ! », réponse, audio et Continuer visibles. **Conforme visuellement**.
- **E-04 (juste au second essai) :** titre « Juste, au 2e essai », réponse, audio, rappel de fin d'étape et Continuer visibles. **Conforme visuellement**.
- **E-05 (deux faux) :** titre « Pas encore », réponse attendue, audio, rappel et Continuer visibles. **Conforme visuellement**.
- **Q-01 à Q-03** : aucune capture dans ce lot. **Non validés**. **Mot caché** : état antérieur inchangé, sans nouvelle capture.
- **Badge MODE TEST : problème secondaire propre à la recette** : le volet rose fixe sur la bordure droite chevauche visuellement l'extrémité des boutons de réponse et, en Écriture, du bouton « Valider ». Déplacer/réduire ce raccourci ou utiliser une zone sûre pour ne pas intercepter les appuis sur les commandes du vrai moteur. À tester sur Samsung ; ne pas confondre avec un défaut de l'application de production.

**Correctif requis E-02 :** présenter la **première erreur d'Écriture en bandeau inférieur**, comme les autres feedbacks de parcours, avec titre rouge, aide sans réponse attendue, valeur du champ préservée et **Réessayer** accessible. Après saisie corrigée, conserver exactement les deux issues : « Juste, au 2e essai » ou « Pas encore » avec solution et rappel. Vérifier clavier Android, hauteur de 320–430px et absence de double feedback ; aucune modification de la notation ou des JSON.

**Clôture P0-01 interdite** tant qu'E-02 n'est pas revérifié sur Samsung après correctif, que Q-01/02/03 ne sont pas vérifiés, et que les tests fonctionnels/clavier/retour concernés restent ouverts. Les validations visuelles partielles ne prouvent ni la sauvegarde ni le cloud (Firebase désactivé en recette).

Chaque scénario affiche sa **liste de contrôle dans le panneau** avant ouverture. Après « Voir cet écran », vérifier le rendu sur le vrai écran, puis utiliser « MODE TEST » pour passer au suivant. Un indice doit garder son coût, « Voir l'aide » rester gratuit, « Continuer » rester visible. Tests navigateur de l'instance et protections : `tests/test_recette_visuelle.py`.

### À vérifier ensuite — Trous et quatre choix lors de la correction (24 octobre 2026)

**Retour Samsung confirmé :** avec le bandeau de correction ouvert, la **quatrième proposition doit rester visible**, pas seulement scrollable derrière « Pas encore ». Le cas concerné est T-03 (faux) à **4 propositions**, mais la règle s'applique aussi à T-02 (juste). Cible : conserver les quatre choix et la distinction rouge/vert visibles simultanément à 390 et 430 px de largeur avec hauteur courante, sans agrandir la place du bandeau. Sur les fenêtres trop courtes ou le texte agrandi, garder le corps **défilable indépendamment du bandeau et du bouton Continuer**, sans recouvrement. Ne jamais réduire les cibles en dessous de 44px ni changer les réponses/score.

**Code en cours de recette :** CSS limité au parcours `data-type="trous"` + `data-etat="corrige"`, testé sur le **vrai moteur** avec les JSON quatre choix de la leçon 1. Vérification finale sur Samsung encore nécessaire après déploiement.

## Déjà présent dans 3001 (à conserver)

| Famille | Cas | Tests associés |
|---|---|---|
| Mission | Sans faute, 1 vie, perdue, tentative, dernière réponse | `tests/test_mission_vies.py`, `tests/test_recette_visuelle.py` |
| Fin d'étape/unité | Sans faute, 2e essai, erreurs et rattrapage | `tests/test_parcours.py`, `tests/test_rappels.py`, `tests/test_recette_visuelle.py` |
| Survie | Réserve parfaite, passés, chrono | `tests/test_survie_fin_mobile.py`, `test/jeux-v21.test.cjs` |
| Examens | 100/85/70/40 %, filtre erreurs | `tests/test_examens.py`, `tests/test_recette_visuelle.py` |

## Lots suivants (non encore implémentés dans 3001)

| Ordre | TODO | Recettes à développer |
|---|---|---|
| **2** | P0-02 Clavier Android | Saisie vide/longue, clavier ouvert/fermé, bouton visible, taille 130/200 %, Retour |
| **3** | P0-03 Navigation | Accueil → Chemin → leçon, fermeture Cours/Plus, Retour et reprise |
| **4** | P0-04 / P0-06 Progression | Révision, scores, modes invité, interruption et restauration en recette **locale seulement** |
| **5** | P0-05 / P0-08 Survie + validation | État final 320–430 px, résultats, Retour, temps écoulé, interactions |
| **6** | P1+ | Accueil, onboarding, Réviser, examens, missions, audio, accessibilité |

**Exception non contournable :** le mode sécurisé `3001` **désactive Firebase**. Aucune recette sur cette origine ne peut prouver la vraie connexion, la fusion cloud ni la synchronisation entre deux appareils. Ces points exigent des tests automatisés `tests/test_cloud.js` / `tests/test_sync.js` et une recette distincte sur comptes de test, uniquement en environnement isolé. Ne pas désactiver la protection Firebase de 3001 pour cette raison.

## Commandes sécurisées (Termux)

```bash
cd ~/LuxembourgishApp
git status --short
git fetch origin
git switch 2.1
git pull --ff-only origin 2.1
RECETTE=1 RECETTE_USER=moi RECETTE_PASS='choisir-un-mot-de-passe' PORT=3001 node server.js
```

Ouvrir `http://localhost:3001`, puis **Plus → Outils de test**. Ne pas exécuter de `git reset --hard` ; garder une origine séparée de la vraie application. Pour les tests automatiques : `LUX_TESTS=1 PORT=3456 node server.js` dans une autre session, puis `python3 tests/test_recette_visuelle.py`.
