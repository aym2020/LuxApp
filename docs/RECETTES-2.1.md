# Catalogue des recettes LuxApp 2.1 — tests et validations sur téléphone

**Branche :** `2.1` · **Instance :** service Render privé avec `RECETTE=1` **ou** installation locale sur `http://localhost:3001`, authentification obligatoire dans les deux cas. Sur Render, la recette a sa propre URL et Firebase est désactivé. **Statut :** correction visuelle et sons acceptés le 25/10 ; P0-01 clôturée. **P0-02 clôturée le 25/10 sur Samsung :** clavier ouvert, CTA, saisie longue, premier faux et Réessayer, touche Entrée, Retour Android et police agrandie tous acceptés par le Produit. Autres tailles d'écran, zoom exact et TalkBack relèvent de la recette globale/accessibilité. Voir [configuration et sécurité](RECETTE.md).

## Principe obligatoire pour chaque nouvelle tâche

1. **Identifiant stable** de recette (`MC-03`, `Q-02`…), lié à un risque utilisateur et au numéro de TODO.
2. **Préparation par le vrai moteur** dans `recette/recette.js` ; jamais de HTML fictif qui ne serait pas le code réel.
3. **Test automatique nommé** (Node/Chromium) qui vérifie le comportement et l'isolation ; un test ne remplace pas la vérification visuelle sur Samsung.
4. **Critères visibles sur 3001**, état de départ/erreur/réussite et boutons interactifs réellement fonctionnels.
5. **Validation humaine** dans le TODO : capture, date, appareil, commit et éventuelles anomalies. La recette est isolée par le port et `RECETTE=1`, sans Firebase et sans conserver la progression.

## Lot 1 — P0-01, exercices (disponible dans 3001)

| Recettes dans « Écran à tester » | Scénarios | Tests associés | État |
|---|---|---|---|
| **Mot caché** | MC-01 Découverte ; MC-02 Départ ; MC-03/04/05 1/2/3 erreurs ; MC-06 Indice ; MC-07 Réussite ; MC-08 Réponse révélée | `tests/test_motcache_cta_mobile.py`, `tests/test_motcache.py`, `test/exercices-etats-v21.test.cjs` | **validé visuellement sur Samsung les 23 et 25/10** (états de jeu, deux erreurs et réponse révélée) ; aide non montrée |
| **Quiz** | Q-01 Départ ; Q-02 Juste ; Q-03 Faux | `tests/test_parcours.py`, `test/exercices-etats-v21.test.cjs` | **Q-02 juste et Q-03 faux validés visuellement sur Samsung le 25/10** ; Q-01 non montré |
| **Trous** | T-01 Départ ; T-02 Juste ; T-03 Faux | `tests/test_parcours.py`, `test/exercices-etats-v21.test.cjs` | **T-02 et T-03 confirmés sur captures Samsung du 25/10** (mot et explication affichés) ; T-01 et transitions non montrés |
| **Écriture** | E-01 Départ ; E-02 1re erreur ; E-03 Juste ; E-04 Juste au 2e ; E-05 Échec final | `tests/test_parcours.py`, `tests/test_spec87_session_mobile.py` | **E-02 (premier faux et Réessayer) et E-05 (échec final) acceptés sur Samsung 25/10 selon SPEC 95** ; E-01/03/04 observés le 24/10. Clavier ouvert et transitions non montrés |

### Revue manuelle Samsung — 24 octobre 2026 (captures utilisateur)

**Périmètre :** 10 captures Samsung Android transmises dans la conversation. Le SHA déployé n'est pas vérifiable sur les images ; le code de référence consulté pour l'analyse est celui de `2.1`, commit `bad2166`. **Aucune preuve vidéo, aucun test réel du clavier ouvert ni preuve de passage entre questions** dans ce lot. Les captures ne sont **pas** ajoutées au dépôt GitHub.

- **T-02 (juste) :** solution verte, « Juste ! », bonne réponse dans la phrase et CTA « Continuer » visibles. **Conforme visuellement**, sans preuve du fonctionnement de Continuer.
- **T-03 (faux) :** **rectificatif utilisateur du 24/10** : le choix erroné était D, plus bas dans la liste. Le vert « Madamm » indique correctement la solution tandis que « Pas encore » indique l'erreur. **Retirer le diagnostic de bug T-03** ; choix et correction cohérents sur ces captures, sans validation de défilement ou de transition complète.
- **E-01 (départ) :** consigne, champ et Valider visibles. **Conforme sur clavier fermé**.
- **E-02 (historique 24/10) :** l'affichage dans le corps était alors considéré comme un défaut ; **SPEC 95 remplace cette décision**. Depuis le 25/10, feedback léger dans le corps + Réessayer au pied fixe sont acceptés sur Samsung. La saisie et le deuxième essai restent disponibles.
- **E-03 (premier juste) :** titre « Juste ! », réponse, audio et Continuer visibles. **Conforme visuellement**.
- **E-04 (juste au second essai) :** titre « Juste, au 2e essai », réponse, audio, rappel de fin d'étape et Continuer visibles. **Conforme visuellement**.
- **E-05 (deux faux) :** titre « Pas encore », réponse attendue, audio, rappel et Continuer visibles. **Conforme visuellement**.
- **Q-01 à Q-03** : aucune capture dans ce lot. **Non validés**. **Mot caché** : état antérieur inchangé, sans nouvelle capture.
- **Badge MODE TEST :** repère volontaire de l'environnement de recette. Le Produit confirme le 25/10 qu'il ne constitue pas une anomalie et qu'aucune correction n'est demandée. Sans objet pour la validation de l'application normale.

### Revue complémentaire Samsung — 25 octobre 2026, 23h08–23h09 (P0-02)

Quatre captures de l'exercice **Écriture Leçon** sur téléphone Samsung, dont une avec clavier Samsung AZERTY réellement ouvert et une saisie anormalement longue :

- **Validé sur image :** énoncé « Je suis français. » visible avec clavier ouvert, champ multilignes lisible, bouton « Valider » entièrement au-dessus du clavier ; après fermeture, premier faux et longue réponse sans débordement horizontal apparent, bouton « Réessayer » fixe ; autre cas premier faux puis échec final avec solution, aide et bouton « Continuer » accessibles.
- **Comportement délibéré :** l'en-tête Leçon (`.pc-topbar` et `.pc-sous-barre`) est masqué lorsque `body.clavier-actif` est présent (CSS actuel), pour préserver la place pour l'énoncé et la saisie. Ne pas diagnostiquer cette disparition comme une régression.
- **Repère de l'instance de recette :** l'onglet rose « MODE TEST » est volontaire. Confirmation Produit le 25/10 : **pas un défaut, aucune action corrective**. Il n'entre pas dans les critères de P0-02.
- **Pédagogie à examiner séparément (P0-09) :** pour « Marc est portugais. », l'aide montre « au féminin : + -in », précision non pertinente pour l'exemple masculin. Ne pas modifier les JSON sans revue pédagogique.
- **Non établis :** comportement de la touche Entrée et du retour Android, transitions et deuxième essai effectués pendant que le clavier est ouvert, texte 130/200 %, autres tailles de téléphone et clavier alternatif. **P0-02 reste ouverte**, mais le cas normal clavier ouvert + saisie longue + CTA a une preuve visuelle réelle.

### Revue complémentaire Samsung — 25 octobre 2026, 23h34–23h36 (P0-02)

Trois nouvelles captures Samsung en **S'entraîner → Écriture** montrent le clavier AZERTY ouvert, la question lisible, le champ accessible, le CTA « Valider » fixe et un état **premier faux** avec texte d'aide et « Réessayer » entièrement visible au-dessus du clavier. **Confirmation explicite du Produit :** touche Entrée et Retour Android fonctionnent. Le badge MODE TEST ne constitue pas un défaut. Les captures ne démontrent pas un réglage de police agrandie.

**Bilan à cette date (avant la dernière confirmation) :** clavier et actions critiques validés sur Samsung en Leçon et S'entraîner ; l'agrandissement de police restait à tester. **Le contrôle est depuis accepté** par le Produit le 25/10 (voir validation finale ci-dessous). La recette globale, les parcours de progression et TalkBack restent dans leurs tâches distinctes.

### Validation finale P0-02 — 25 octobre 2026

Le Produit confirme avoir **augmenté la taille de police sur Samsung** et testé l'interface : **aucun problème signalé**. Avec les captures antérieures (clavier ouvert en Leçon et S'entraîner, champ long et CTA visibles, premier essai faux avec « Réessayer ») et la confirmation du bon fonctionnement d'**Entrée** et **Retour Android**, **P0-02 est clôturée par acceptation Produit**. Le pourcentage exact de police n'est pas mesuré : ne pas présenter cette validation comme une mesure instrumentée 130/200 % ou un test de zoom navigateur.

La validation ne couvre pas l'ensemble des vues, TalkBack, la synchronisation, la notation complète ou les résolutions d'autres appareils ; ces sujets restent dans P0-08/P1-18 et P0-03/04/06. Aucun changement de code applicatif n'a été nécessaire.

**E-02 clos visuellement au 25/10 :** première erreur « Pas encore · réessaie » dans le corps, bouton « Réessayer » fixe en bas ; échec final avec solution et « Suivante ». L'ancienne demande de bandeau inférieur est remplacée par la SPEC 95. Vérifications restantes : clavier réellement ouvert, transitions et texte agrandi.

**P0-01 clôturée avec accord Produit le 25/10/2026 :** Quiz Q-02/03, Trous T-02/03, Écriture E-02/05, Mot caché (saisie/essais/solution) vus sur 10 captures Samsung ; sons de verdict confirmés satisfaisants par le Produit. Workflows interface, recettes P0-01 et Mot caché verts au SHA applicatif `33786e0`. Les images restent dans la conversation, pas dans Git. **Réserves hors P0-01 :** clavier ouvert et Q-01/transitions non démontrés par les captures (P0-02/08), barèmes/progression transverses (P0-06), Firebase (P0-04), grossissement et TalkBack (P0-08). Survie garde un échec CI distinct (P0-05).

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
| **2 — clôturé Samsung 25/10** | P0-02 Clavier Android | Clavier ouvert/fermé, CTA, saisie longue, premier faux, Entrée, Retour et police agrandie validés ; autres résolutions et TalkBack en P0-08/P1-18 |
| **3** | P0-03 Navigation | Accueil → Chemin → leçon, fermeture Cours/Plus, Retour et reprise |
| **4** | P0-04 / P0-06 Progression | Révision, scores, modes invité, interruption et restauration en recette **locale seulement** |
| **5** | P0-05 / P0-08 Survie + validation | État final 320–430 px, résultats, Retour, temps écoulé, interactions |
| **6** | P1+ | Accueil, onboarding, Réviser, examens, missions, audio, accessibilité |

**Exception non contournable :** le mode sécurisé `3001` **désactive Firebase**. Aucune recette sur cette origine ne peut prouver la vraie connexion, la fusion cloud ni la synchronisation entre deux appareils. Ces points exigent des tests automatisés `tests/test_cloud.js` / `tests/test_sync.js` et une recette distincte sur comptes de test, uniquement en environnement isolé. Ne pas désactiver la protection Firebase de 3001 pour cette raison.

## Lux Démasque (SPEC 110) — recette sur appareil à faire

**Non réalisée** : aucun test tactile, GPU ni écoute sur Samsung n'a été fait par Claude (Chromium + SwiftShader seulement). Automatisé : `test/lux-demasque*.cjs`, `tests/test_lux_demasque*.py`, `tests/test_lux_match_masque.py`.

| À vérifier sur Samsung | Attendu |
|---|---|
| Hub Jeux | Carte Lux Démasque, **aucune carte Lux Match** |
| Dossier Milo complet au doigt | Réseaux, pièces, carnet, « Faire préciser », OBJECTION ! sans tap fantôme ; effet passable d'un appui |
| 3D | Visage lisible, jamais caché par la feuille du verdict ; fluidité acceptable ; pas d'échauffement anormal sur 5 min |
| Musique et effets | Boucles sans clic au raccord, volume équilibré, ducking à l'objection ; silence en arrière-plan, reprise au retour ; Son/Musique coupés mémorisés |
| Retour Android | Ferme la fenêtre du dessus, passe l'effet OBJECTION !, puis revient au hub |
| 320–430 px, police agrandie | Aucun texte coupé, OBJECTION ! visible sans défiler |
| Noah, Tom, dossier « INÉDIT » | Après Milo résolu : Noah puis Tom, puis dossiers générés ; « Rejouer » redonne le même dossier |
| Relecture LU | Phrases `a_verifier_lod` de [LUX-DEMASQUE-AFFAIRES.md](LUX-DEMASQUE-AFFAIRES.md) et du dossier Milo confirmées sur LOD.lu ou par un locuteur |

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
