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
| **Trous** | T-01 Départ ; T-02 Juste ; T-03 Faux | `tests/test_parcours.py`, `test/exercices-etats-v21.test.cjs` | **T-02 visuellement conforme sur Samsung 24/10 ; T-03 anomalie de visibilité (voir ci-dessous) ; T-01 non fourni** |
| **Écriture** | E-01 Départ ; E-02 1re erreur ; E-03 Juste ; E-04 Juste au 2e ; E-05 Échec final | `tests/test_parcours.py`, `tests/test_spec87_session_mobile.py` | **E-01 à E-05 : rendu statique conforme sur captures Samsung 24/10 ; clavier ouvert, transitions, compteur/rappel et sauvegarde non validés** |

### Revue manuelle Samsung — 24 octobre 2026 (captures utilisateur)

**Périmètre :** 10 captures Samsung Android transmises dans la conversation. Le SHA déployé n'est pas vérifiable sur les images ; le code de référence consulté pour l'analyse est celui de `2.1`, commit `bad2166`. **Aucune preuve vidéo, aucun test réel du clavier ouvert ni preuve de passage entre questions** dans ce lot. Les captures ne sont **pas** ajoutées au dépôt GitHub.

- **T-02 (juste) :** solution verte, « Juste ! », bonne réponse dans la phrase et CTA « Continuer » visibles. **Conforme visuellement**, sans preuve du fonctionnement de Continuer.
- **T-03 (faux) :** première capture lisible (choix erroné rouge, solution dans la phrase et correction). **Seconde capture : anomalie bloquante de lisibilité** : « Madamm » en vert et « Pas encore » en rouge, alors que l'option erronée marquée rouge est située plus bas dans la liste et **cachée sous le bandeau de correction** ; une proposition est partiellement recouverte. Le code `choisirP()` attribue les classes `.wrong` et `.correct` aux bons éléments, mais l'écran ne les rend pas simultanément consultables. La pédagogie devient ambiguë. **Ne pas clôturer T-03.**
- **E-01 (départ) :** consigne, champ et Valider visibles. **Conforme sur clavier fermé**.
- **E-02 (premier faux) :** diagnostic sans révélation, saisie conservée et « Réessayer » visibles. **Conforme visuellement**.
- **E-03 (premier juste) :** titre « Juste ! », réponse, audio et Continuer visibles. **Conforme visuellement**.
- **E-04 (juste au second essai) :** titre « Juste, au 2e essai », réponse, audio, rappel de fin d'étape et Continuer visibles. **Conforme visuellement**.
- **E-05 (deux faux) :** titre « Pas encore », réponse attendue, audio, rappel et Continuer visibles. **Conforme visuellement**.
- **Q-01 à Q-03** : aucune capture dans ce lot. **Non validés**. **Mot caché** : état antérieur inchangé, sans nouvelle capture.

**Correctif requis T-03 :** une fois la réponse fausse, faire apparaître sans ambiguïté et sans chevauchement **le choix erroné rouge et la bonne réponse verte**, tout en gardant la correction et « Continuer » accessibles. Préférer un cadrage du corps scrollable ou un résumé « Ton choix : … » explicite dans le bandeau ; tester les cas où l'option erronée est la dernière de 4 à **320/360/390/430 px**, avec textes longs et zoom. Ne pas changer le score, la répétition de la question ni les JSON.

**Clôture P0-01 interdite** tant que T-03 n'est pas corrigé et rejoué sur Samsung, que Q-01/02/03 ne sont pas vérifiés, et que les tests fonctionnels/clavier/retour concernés restent ouverts. Les validations visuelles partielles ne prouvent ni la sauvegarde ni le cloud (Firebase désactivé en recette).

Chaque scénario affiche sa **liste de contrôle dans le panneau** avant ouverture. Après « Voir cet écran », vérifier le rendu sur le vrai écran, puis utiliser « MODE TEST » pour passer au suivant. Un indice doit garder son coût, « Voir l'aide » rester gratuit, « Continuer » rester visible. Tests navigateur de l'instance et protections : `tests/test_recette_visuelle.py`.

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
