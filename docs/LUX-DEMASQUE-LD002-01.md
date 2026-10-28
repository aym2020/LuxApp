# LD-002.01 — Écran « Rencontre » : fiche arcade rétro

**Branche :** `2.1`. **Statut :** code livré et validation produit à recueillir. **Date :** 28 octobre 2026.  
**Source des statuts :** [TODO canonique sur `main`](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md). **Référence avant :** [audit LD-001](LUX-DEMASQUE-AUDIT-UI-LD001.md), [32 captures de référence](https://github.com/aym2020/LuxApp/actions/runs/40648859830/artifacts/12799130743).

## Problème initial

Sur les références à 360 × 740 et 393 × 852, l'écran Rencontre ressemble davantage à une succession de panneaux d'application web qu'à un véritable dossier arcade. La fiche, le salut, la date et les trois règles prennent beaucoup de hauteur avant le CTA ; sur la capture LD-001, le document atteint 775 px à 360 × 740.

## Intervention ciblée

- [x] Transformer le début de la page en entête « DOSSIER » tamponné avec repère « RENDEZ-VOUS ».
- [x] Recomposer la **fiche personnage** sans remplacer le portrait 3D existant : étiquette à interroger, identité, ville, accroche.
- [x] Style **16/32 bits** : encadrement carré/biseauté, liseré rose, ombre arcade, violet profond ; police pixel **seulement** pour les petits libellés, texte narratif toujours net.
- [x] Dialogue de salutation sous forme de panneau simple à liseré magenta ; contenu original `lu/fr` inchangé.
- [x] Regrouper les trois consignes en **une mission compacte** conservant : les mensonges ne portent pas sur tout, demande de précision, réseaux, preuve nécessaire à l'objection.
- [x] Maintenir le rendez-vous (lieu + date), le CTA principal doré et l'accès aux réseaux avant l'enquête.
- [x] Scoper les changements CSS à `.ld-rencontre` / `[data-ecran="rencontre"]` afin de **ne pas** repeindre l'interrogatoire, le carnet ou le bilan.
- [x] Ajouter au smoke test mobile une assertion de présence de la fiche/mission et de visibilité du CTA à 360 × 740 et 393 × 852.

**Fichiers :** `public/lux-demasque.js` (rencontre seulement), `public/lux-demasque.css` (styles locaux), `tests/test_lux_demasque_mobile.py` (contrat mobile).

**Hors périmètre :** dictionnaire et retrait des traductions FR (LD-005–LD-011), nouvelle 3D/émotions, écrans suivants, moteur d'objection et générateur, sauvegardes, structure des dossiers.

## Critères et validation

1. Exécuter la [suite dédiée](LUX-DEMASQUE-TESTS.md) : `rapide` et `complet` sur le code `2.1` ; pas de régression.
2. Comparer les captures `360x740_01-rencontre.png` et `393x852_01-rencontre.png` du run actuel aux fichiers de l'artifact de LD-001.
3. Vérifier absence de scroll horizontal, CTA visible, contraste de la fiche et préservation du portrait.
4. **Attendre la validation visuelle explicite du joueur**. Même avec CI verte, le sous-ID LD-002.01 reste **[ ]** jusqu'à cette décision. Toute demande de retouche reste dans LD-002.01 ; **ne pas passer à LD-002.02**.

## Références de réalisation

- [Code JS `2.1`](https://github.com/aym2020/LuxApp/blob/2.1/public/lux-demasque.js)
- [CSS `2.1`](https://github.com/aym2020/LuxApp/blob/2.1/public/lux-demasque.css)
- [Test mobile `2.1`](https://github.com/aym2020/LuxApp/blob/2.1/tests/test_lux_demasque_mobile.py)
- [Exécution CI](https://github.com/aym2020/LuxApp/actions/workflows/lux-demasque-v11.yml)

## Résultats réellement vérifiés en CI

[**GitHub Actions run 40652975646 — succès**](https://github.com/aym2020/LuxApp/actions/runs/40652975646) : tests rapides, tests complets Playwright Chromium et génération des 32 captures (16 états à 360/393) **verts**. [Artifact PNG + manifeste avant/après disponibles](https://github.com/aym2020/LuxApp/actions/runs/40652975646/artifacts/12800002783) pendant leur période de rétention.

| Mesure | Avant LD-001 | Après LD-002.01 | Lecture |
|---|---:|---:|---|
| Document à 360 × 740 | 775 px | **740 px** | Fini le dépassement vertical sur ce format |
| Fiche personnage 360 px | 208 px | **162 px** | −46 px sans couper l'accroche |
| Début du CTA 360 px | y = 655 | **y = 524** | Accessible dès l'ouverture |
| Fiche personnage 393 px | 170 px | **163 px** | Cohérence de densité |
| Début du CTA 393 px | y = 596 | **y = 507** | CTA plus haut |
| Débordement horizontal | aucun | **aucun** | Vérifié sur les deux captures |

**Revue des visuels :** portrait Milo présent, nom/âge/ville et accroche lisibles, salut LU/FR conservé (suppression des sous-titres prévue plus tard), rendez-vous daté, règles condensées, CTA et accès réseaux présents. Contraste arcade et arrondis rectangulaires appliqués uniquement à la rencontre. Ne pas confondre émulation Chromium et validation tactile sur Samsung ; l'appréciation esthétique finale appartient au joueur.

**Commits :** [HTML JS `7e56b92`](https://github.com/aym2020/LuxApp/commit/7e56b928f3a5a0c7473a5b038d5fced2d87db1f9), [CSS `567709e`](https://github.com/aym2020/LuxApp/commit/567709ee306c0a9c65cf06e54d1ec4f1186d27e3), [test mobile `4305684`](https://github.com/aym2020/LuxApp/commit/430568448fe7c4abdf08d157e4bb7691eb557c34).

**Décision produit : en attente de validation explicite.** Tant que l'utilisateur n'a pas approuvé le rendu, la TODO conserve LD-002.01 non cochée comme prochaine action.
