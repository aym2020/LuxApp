# SPEC 113 — Cringr : implémentation et recette du sélecteur

**Date :** 29 octobre 2026 · **Code :** `2.1` · **Référence initiale :** `19c0cdbd2e4b44166571d5d8414302db9fd55ece`.
**Statut :** codé et vérifié dans Chromium, **en attente d'accord explicite du joueur sur Samsung**. LD-048 n'est pas clôturée ; LD-002.01 et sa prochaine action restent inchangées.

## Résultat et cause des défauts

Le sélecteur cumulait les règles V1, V2 et SPEC 113. La bio utilisait effectivement 8 à 9 px selon le téléphone, tandis que les assertions statiques ne contrôlaient ni le rendu calculé ni les gestes. Trois blocs CSS concurrents ont été remplacés par une seule composition, entièrement limitée à `.ld-jeu[data-ecran="selection"]`.

La police rétro VT323 auto-hébergée permet une bio à **22 px**, une ville à 20 px, un prénom à 28–34 px et un statut à 17 px, avec Press Start 2P réservé aux marques et tampons. Source : [Google Fonts / VT323](https://github.com/google/fonts/tree/main/ofl/vt323), licence OFL conservée dans `public/fonts/vt323-OFL.txt` ; WOFF2 de 32 016 octets. Les informations suivent l'ordre prénom/âge, ville, bio, statut. Le dégradé est porté par le bloc d'informations, dont la hauteur dépend du texte : les longs contenus agrandissent la carte et restent accessibles par défilement.

Le cœur est un SVG pixel original dans une cible de **56 × 56 px** avec état pressé et focus visible. « Passer » offre un NOPE sans drag dans une cible de 64 × 48 px. Les flèches de navigation, le hub intermédiaire et l'indication permanente SWIPE restent absents. Le titre extérieur est centré indépendamment du bouton Retour.

Sur la carte focalisée, gauche passe au suivant ; droite, Entrée et Espace ouvrent la rencontre. Le focus revient sur la nouvelle carte ou le bouton « Passer » après navigation. Le geste conserve le seuil strict **|dx| > 65 px**, la priorité au scroll vertical, l'annulation et l'exclusion du deuxième doigt ; les tampons LIKE/NOPE gagnent en opacité avec la distance. Le coachmark peut apparaître au premier accès même si Milo est déjà résolu ; il reste absent avec mouvement réduit ou stockage indisponible.

Une génération d'ouverture invalide les chargements périmés après une sortie ou une nouvelle demande. En cas d'échec, le sélecteur retrouve son index et sa graine avec un message de réessai. Une absence de profils produit un état vide explicite. Le moteur, les JSON, les IDs, les clés de progression, les sons, Lux Match et le renderer partagé ne changent pas. Les portraits continuent de provenir de `m.portrait()` et des décors existants.

## Captures et mesures avant/après

Les captures ont été prises avant toute édition du code produit, puis après correction, avec le vrai modèle 3D prêt, le même profil Milo et les polices locales chargées. Les PNG et leurs JSON de géométrie sont produits dans `artifacts/spec-113/avant/` et `apres/`. Le comparatif 393 px est [consultable ici](https://chatgpt.com/library?file_id=libfile_6bbcf91f9da08191850134731de784c1&account_id=personal). La CI archive les captures finales des quatre tailles et leurs mesures sous `cringr-spec-113`.

| Viewport | Bio avant → après | Prénom avant → après | Bas du cœur après | Débordement horizontal après |
|---|---|---|---|---|
| 320 × 600 | 8 → 22 px | 13 → 28 px | 572,8 px | 0 px |
| 360 × 740 | 8 → 22 px | 13,3 → 28,8 px | 708 px | 0 px |
| 393 × 852 | 8,3 → 22 px | 14,5 → 31,4 px | 768 px | 0 px |
| 430 × 932 | 9 → 22 px | 15,9 → 34 px | 768 px | 0 px |

Le bas des informations est à 2 px du bas intérieur de la carte ; le cœur passe de 68 à 56 px. À 320 px, la composition peut défiler de quelques pixels pour exposer la coque entière ; le cœur reste entièrement visible au repos. Avec texte long/agrandi ou en paysage, le défilement est volontaire : aucune ligne n'est coupée, aucune action ne recouvre les informations.

Reproduction, avec un serveur `LUX_TESTS=1 PORT=3456 node server.js` :

```bash
LUX_CAPTURE_PHASE=apres python3 tests/capture_cringr_spec113.py
python3 tests/test_lux_demasque_cringr.py
```

Pour refaire un avant, servir le checkout initial `19c0cdb` et utiliser le même script de capture avec `LUX_CAPTURE_PHASE=avant` ; ne pas remplacer le code de l'application courante par des fichiers anciens.

## Tests réellement exécutés

Environnement : Node 24.22.1, Python 3.12, Playwright **1.56.0**, Chromium 141 / SwiftShader. La CI utilise Node 22 et la même version de Playwright. Aucun service Firebase de production utilisé.

| Commande | Résultat |
|---|---|
| `bash tools/test-lux-demasque.sh rapide` | **3/3 blocs verts** : syntaxe, moteur, générateur et sélection ; 1 000 graines contrôlées |
| `bash tools/test-lux-demasque.sh complet` | **11/11 blocs verts**, dont huit scripts navigateur et le nouveau contrat Cringr |
| `python3 tests/test_lux_demasque_cringr.py` | Gestes tactiles CDP aux quatre tailles, clavier, souris, focus, 4 profils, annulations, seuil, double action, échecs, stockage, portrait et texte long |
| `bash tools/critique.sh rapide` | **15 réussites, 1 échec préexistant** (`test_audio_lod.js`, entrée `Awar!`) |
| `bash tools/critique.sh` | **39 réussites, 19 échecs** ; tous les échecs reproduits sur le checkout initial |
| Même suite critique sur le checkout initial `19c0cdb` | **35 réussites, 20 échecs** ; trois tests de sélection supplémentaires dans la livraison ; `test_actualisation` échoue seulement dans la référence |

**La suite critique globale est rouge.** Les 19 échecs de la livraison sont : `test_audio_lod.js`, `test_lecon_resumes`, `test_parcours`, `test_retours`, `test_prerequis`, `test_rappels`, `test_acquis_v1`, `test_missions_10`, `test_mission_vies`, `test_lot2`, `test_lot3`, `test_navigation`, `test_chemin_lignes`, `test_seance`, `test_mission_validation`, `test_lot1`, `test_decouverte`, `test_libre`, `test_retour_android`. Ils échouent aussi dans la référence non modifiée ; aucun nouvel échec observé. Ces contrôles concernent des parcours et contrats historiques d'autres vues. Cette comparaison ne les répare pas et ne vaut pas validation générale de LuxApp.

Les contrôles Lux Match swipe/masquage, moteur/générateur, 3D partagée, audio du jeu, sauvegardes/cloud, examens et corrections SPEC 94/95 passent. Les assertions historiques du sélecteur ont été adaptées à la cascade consolidée et à la version 17 ; la couverture navigateur a été ajoutée aux deux runners et à la CI, sans retrait des anciens tests.

## Matrice de recette et réserve produit

| ID | Vérification réelle | État |
|---|---|---|
| RF-01 | Quatre tailles, polices calculées, textes et quatre profils, cibles, centrage, zéro overflow X, captures comparatives ; texte 200 % et paysage | Vérifié Chromium |
| RF-02/03 | Tactile CDP natif : gauche vers Noah sans partie ni modification de progression ; droite ouvre Noah | Vérifié Chromium |
| RF-04 | Swipe droit suivi de deux clics sur le cœur : une seule ouverture ; double action pendant chargement et réessai | Vérifié Chromium |
| RF-05 | Geste court, seuil exact 65 px, défilement vertical, touchCancel, capture perdue et pointeur secondaire | Vérifié Chromium |
| RF-06 | Wrap, 1/0 profil, résolu rejouable, généré/rejeu de même graine, retour et reload sans perte | Vérifié Chromium |
| RF-07 | Clavier gauche/droite/Entrée/Espace, souris, Passer, focus visible et conservé, noms accessibles | Vérifié Chromium ; TalkBack réel non testé |
| RF-08 | Reduced motion, première découverte unique, WebGL indisponible, portrait lent, décor échoué, localStorage refusé, réseau/réessai et sortie pendant chargement | Vérifié Chromium |
| RF-09 | Suites dédiées et Lux Match vertes ; comparaison de la suite globale avant/après sans nouvel échec | Vérifié avec réserve sur les échecs globaux préexistants |
| RF-10 | Gestes, proportions, barres Android, lisibilité, GPU et approbation du joueur sur Samsung | **À faire — non validé** |

**Étape suivante :** essai réel et accord explicite du joueur sur ce seul sélecteur, puis mise à jour de LD-048 sur `main`. Ne pas avancer la refonte des autres écrans ni cocher LD-048 sur la seule base de ces tests.
