# SPEC 114 — Relevés réels et recette des gabarits

Référence de départ : `effbef3c0a1a4cc981605c8db80f16da0707a50d`, branche `2.1`.

## Lot 0 — Baseline avant modification des styles

Mesure du vrai DOM de **24 vues et 9 états ou panneaux**, à **390×844, 720×900 et 1440×900**, soit **99 captures et relevés**. Toutes les vues ont été préparées par les fonctions de l'application ; les helpers de recette existants jouent les vrais moteurs pour les résultats, sans HTML de substitution. Lux Match est activé dans le contexte de test seulement, son accès public reste masqué. Les animations d'arrivée finies et les polices sont attendues avant la capture.

À 1440 px, les vues mesurent **720 px**, sauf le hub Jeux à **1440 px**. Les conteneurs internes mesurés sont : accueil **470 px**, hub Jeux **960 px**, sélection RED FLAG **480 px**, rencontre/bilan **560 px**, déposition **600 px**. La navigation et les CTA globaux font **720 px**, la feuille Cours **720 px**, la sélection des leçons **560 px** et le scénario de mission **680 px**. Aucun débordement horizontal détecté dans ces 99 états.

Les sources reproductibles sont `tests/layout114_scenarios.py` et `tests/capture_spec114_layout.py`. Les PNG et mesures détaillées sont dans `artifacts/spec-114/avant/`. La référence compacte de géométrie à 390/720 est versionnée dans `tests/fixtures/spec114-mobile.json` pour contrôler la conservation du mobile après modification.

```bash
# Sur un serveur local LUX_TESTS=1 PORT=3456 node server.js
LUX_CAPTURE_PHASE=avant python3 tests/capture_spec114_layout.py
```

Les contrôles portent sur Chromium/SwiftShader ; ils ne constituent pas une recette Samsung ni une approbation produit.

## Implémentation par lots

| Lot | Objet | Commit de livraison |
| --- | --- | --- |
| 0 | Référence DOM et captures, fixture mobile | `be791e0` |
| 1 | Tokens et consultation, accueil et chemin réellement élargis | `7287727` |
| 2 | Navigation, CTA, dock et panneaux | `2fcf7c3` |
| 3 | Hub et quatre jeux, tous les sous-écrans RED FLAG | `1c5de55` |
| 4 | Lecture, reflow de textes longs, géométrie/hauteurs/focus, cache CSS et CI | Livraison finale SPEC 114 |

Les limites sont corrigées dans leurs feuilles propriétaires. Les alias desktop ne sont activés qu'à 768 px ; les valeurs mobiles historiques restent en repli. Le hub utilise une colonne : les cartes gardent des titres lisibles et des boutons entièrement accessibles dans 640 px. Les versions des 18 feuilles modifiées sont renouvelées dans `index.html`. Aucun JavaScript applicatif, JSON pédagogique, calcul de score ou sauvegarde n'est modifié. Lux Match reste masqué dans l'app ; seul le contexte de test l'active.

## Dimensions réellement mesurées

À 1440 px de viewport, après modification :

| Élément | Avant (`effbef3`) | Après |
| --- | ---: | ---: |
| Enveloppe des 24 vues | 720 px, Jeux 1440 px | **640 px pour chaque vue** |
| Accueil, conteneur principal | 470 px | 640 px |
| Hub Jeux, conteneur principal | 960 px | 640 px |
| Navigation / CTA global fixe | 720 px | 640 px |
| Feuille Cours | 720 px | 640 px |
| Sélection de leçons | 560 px | 640 px |
| Scénario de mission | 680 px | 640 px |
| RED FLAG : sélection / rencontre / déposition / bilan, rail `.ld-jeu` | 480 / 560 / 600 / 560 px | 640 px pour chaque état |
| RED FLAG : réseaux et carnet, fenêtre intérieure | 560 px | 640 px |
| Téléphone Cringr intérieur | 420 px | 420 px |
| Survie : plateau / résultat intérieur | 470 / 420 px | 470 / 420 px |
| Runner / Lux Match, scènes | 500 / 500 px | 500 / 500 px |
| Corps et dock d'exercice | 500 px | 500 px |
| En-tête Leçon en exercice | 720 px | 500 px, aligné sur le corps et le dock |

Les paragraphes Cours et le lecteur de scénario sont bornés par le token de lecture 560 px. Le dialogue de confirmation garde son plafond 400 px ; l'aide Mot caché et les scènes gardent leurs dimensions dédiées. Les fonds d'overlay couvrent le viewport. Il n'y a ni zoom CSS ni transformation de vue.

Le breakpoint 760 px du hub et son plafond 960 px ont été supprimés à la source. L'intervalle 721–767 px suit donc désormais le gabarit mobile commun, sans promesse d'identité avec l'ancienne grille à deux colonnes. Le mobile approuvé ≤600 px et la référence 720 px restent protégés.

## Tests exécutés

- **Géométrie finale :** `tests/test_spec114_layout.py`, **363 états** (24 vues + 9 états/panneaux × 11 largeurs : 320, 360, 390, 430, 600, 640, 720, 768, 1024, 1440, 1920), zéro débordement horizontal. Enveloppes et grands rails centrés à 640 px sur PC. Comparaison de **66 états** à 390/720 avec la fixture versionnée : mêmes axes, largeurs et gouttières pour les éléments sondés. Ce contrôle horizontal ne prétend pas comparer chaque pixel ou toutes les hauteurs.
- **Hauteurs :** `tests/test_spec114_ergonomie.py`, **198 états** à 390/1440 px et 600/900/1080 px de haut ; pieds visibles et dock indépendant du scroll.
- **Zoom :** vingt parcours à 125/150 %, simulés par réduction du viewport CSS et densité physique, sans modifier l'interface par `zoom`/`scale`. Zoom natif sur appareil à vérifier séparément.
- **Texte :** onze parcours à 320/1440 px, taille racine 130/200 % et hauteur 600 px, sans débordement. Il s'agit d'un test de reflow `rem`, pas d'une preuve de tous les réglages système ou des polices Samsung.
- **Compléments :** Nouveautés, confirmation courte (≤400 px), fermeture et restitution du focus, examen d'expression écrite à 390/720/1440 px.
- **Node ciblé : 241/241 PASS**, consultation, composants partagés, quatre jeux et accès aux assets. Les assertions de versions/cache et de grille ont été adaptées au nouveau contrat. L'ancien test Cours attendait `parcours.js?v=2` alors que la référence charge déjà `v=14` : seule cette assertion de cache périmée a été rendue indépendante du numéro.
- **RED FLAG :** `bash tools/test-lux-demasque.sh complet`, **11 blocs, 0 échec**, dont gestes Cringr, mobile, audio, parcours et acceptation. Aucun changement du seuil de swipe ou du portrait.
- **Examen :** `tests/test_examens.py` PASS après les correctifs de reflow ; score, correction, résultats, abandon et retours fonctionnels conservés.
- **Revue indépendante obligatoire :** `ui-parity-auditor`, SPEC 94/95, deux passages. Test SPEC 95 complet PASS (texte 200 %, dock ±2 px, clavier simulé, 320 px et paysage/720–1440). Node de parité 26/26 PASS. Comparaison directe avec la référence : header/dock identiques à 320/390/720 px ; à 1440 px, seul le rail du header passe de 720 à 500 px. Même `renderFeedbackCommun`, `renderActionExercice` et adaptateur sonore ; aucune duplication introduite.

### Débordements hérités diagnostiqués et corrigés

La première passe à 320 px a mesuré **43 px de débordement dans le résultat d'examen**, identiques sur la référence et le code intermédiaire. Les options de correction imposaient leur largeur minimale ; textes et statut ne pouvaient pas se réorganiser. Au texte 200 %, titres de mission, titres/statuts de résultat et mots longs aggravaient le défaut. Les règles propriétaires autorisent désormais le retour à la ligne, `min-width:0`, les mots longs et les limites intérieures ; les en-têtes peuvent reprendre une ligne et la navigation utilise quatre colonnes qui se rétrécissent. La réserve sous navigation suit le texte agrandi. Aucun contenu n'est caché pour satisfaire la mesure.

### Suite critique globale — résultat distinct

`bash tools/critique.sh rapide` puis `bash tools/critique.sh` ont été exécutés après implémentation ; la suite complète a aussi été exécutée sur la référence. **Premiers passages complets : 39 contrôles passent et 19 échouent sur la référence et après implémentation. Dernier passage : 38 passent et 20 échouent**, avec un échec supplémentaire de `test_actualisation`. Rejoué isolément et sans modifier ce test, ce même échec est reproduit sur les deux codes (attente `about:blank`, ligne 151, après les neuf scénarios Android de restauration réussis). Aucun nouvel échec propre au code SPEC 114 identifié. La suite reste rouge et n'est pas présentée comme une validation globale.

Les 19 échecs communs des premiers passages : `test_audio_lod.js` (entrée Awar!), `test_lecon_resumes`, `test_parcours`, `test_retours`, `test_prerequis`, `test_rappels`, `test_acquis_v1`, `test_missions_10`, `test_mission_vies`, `test_lot2`, `test_lot3`, `test_navigation`, `test_chemin_lignes`, `test_seance`, `test_mission_validation`, `test_lot1`, `test_decouverte`, `test_libre`, `test_retour_android`. Ils concernent notamment des sélecteurs historiques ou attentes de parcours antérieures ; cette livraison ne remplace pas ces tests ni leurs assertions par des succès artificiels.

## Captures, reproduction et CI

**99 captures avant et 99 après**, mêmes scénarios et mêmes trois fenêtres de référence. Les relevés JSON accompagnent les PNG, et les portraits Cringr réellement composés sont attendus. Les captures ciblées des lots 2/3 complètent les relevés locaux. Le manifeste indique le SHA source et la présence éventuelle de styles locaux non committés.

Le workflow [SPEC 114](../.github/workflows/layout-114.yml) publie l'artefact `spec114-geometrie-captures`, avec les **deux séries** de captures et les mesures. Il démarre aussi le vrai code de référence `effbef3` sur un port distinct ; les images « avant » ne sont pas des reconstitutions CSS. [Exécutions GitHub Actions](https://github.com/aym2020/LuxApp/actions/workflows/layout-114.yml). Le résultat de cette CI reste distinct de la recette locale et de Samsung.

```bash
npm ci
python3 -m pip install playwright==1.56.0
python3 -m playwright install chromium
# Serveur dédié : LUX_TESTS=1 PORT=3456 node server.js
LUX_URL=http://127.0.0.1:3456/ python3 tests/test_spec114_layout.py
LUX_URL=http://127.0.0.1:3456/ python3 tests/test_spec114_ergonomie.py
LUX_URL=http://127.0.0.1:3456/ python3 tests/capture_spec114_layout.py
```

## Limites et validation Produit

**Samsung réel non testé** : clavier déployé, retour système, safe areas et réglages système restent à recetter sur appareil. Les tests SPEC 87/95 couvrent un clavier simulé dans Chromium, pas l'IME physique. Les contrôles de focus de ce lot ne constituent pas un audit TalkBack complet. La réduction des animations est activée pour les mesures et testée par les suites existantes.

La SPEC 114 est codée et testée techniquement ; **elle n'est pas déclarée validée Produit**. P1-38 à P1-41 restent ouvertes pour revue PC/Samsung et accord explicite. Les tâches RED FLAG sur `main`, dont LD-048, ne sont pas clôturées par cette harmonisation. Les améliorations éditoriales et visuelles futures du sélecteur Cringr (notamment « Passer ») restent dans leur backlog dédié.
