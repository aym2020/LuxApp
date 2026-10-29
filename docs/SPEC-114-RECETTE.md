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
