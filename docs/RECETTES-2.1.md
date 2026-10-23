# Catalogue des recettes LuxApp 2.1 — tests et validations sur téléphone

**Branche :** `2.1` · **Instance :** `http://localhost:3001` démarrée avec `RECETTE=1`, authentification obligatoire. **Statut :** déploiement incrémental ; les recettes de P0-01 sont le premier lot, pas tous les tests existants.

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
| **Trous** | T-01 Départ ; T-02 Juste ; T-03 Faux | `tests/test_parcours.py`, `test/exercices-etats-v21.test.cjs` | **À valider sur Samsung** |
| **Écriture** | E-01 Départ ; E-02 1re erreur ; E-03 Juste ; E-04 Juste au 2e ; E-05 Échec final | `tests/test_parcours.py`, `tests/test_spec87_session_mobile.py` | **À valider sur Samsung** |

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
