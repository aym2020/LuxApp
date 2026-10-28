# Lux Démasqué — suite de tests et recette V1.1

**Dépôt :** `aym2020/LuxApp` · **Code et tests : branche `2.1`**.  
**Backlog canonique :** [TODO V1.1 sur `main`](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md).  
**Références :** [SPEC 110](specs/SPEC-110.md) · [PLAYBOOK](../PLAYBOOK.md) · [AGENTS](../AGENTS.md).  
**État au 28/10/2026 :** **suite dédiée VALIDÉE sur GitHub Actions** — [exécution réelle verte n°40648161245](https://github.com/aym2020/LuxApp/actions/runs/40648161245), branche `2.1`, commit `6397a82421a7c343c4c977a78aed67b990475097`. Mode `rapide` : **3/3 blocs verts** ; mode `complet` : **9/9 blocs verts**, dont les **6 parcours Chromium/Playwright** et le contrat LD-034. Le bouton a également été confirmé sur Samsung par l'utilisateur (Milo 0/3 → Noah). Ces tests Chromium n'équivalent **pas** à une certification complète du rendu/performance sur un GPU Samsung.

## 1. Commandes canoniques

Depuis la racine d'un clone **de la branche `2.1`** :

```bash
# Tests de base : syntaxe JS/Python + moteur + générateur (sans serveur).
bash tools/test-lux-demasque.sh rapide

# Base + parcours Chromium/Playwright + écran mobile (serveur local LUX_TESTS=1).
bash tools/test-lux-demasque.sh complet

# Base + test navigateur ciblé LD-034 (rejeu et rotation).
bash tools/test-lux-demasque.sh acceptation

# Régression transversale LuxApp 2.1 (inclut maintenant les tests de base du jeu).
bash tools/critique.sh rapide
bash tools/critique.sh
```

Pré-requis : Node.js compatible `node --test` (18+), Python 3, dépendance `playwright` et Chromium Playwright, `curl`, dépendances Node du dépôt (`npm install` si nécessaires). Installation navigateur par `python3 -m playwright install chromium`. Aucun service Firebase réel ne doit être nécessaire : serveur démarré avec `LUX_TESTS=1` et données de test isolées.

Par défaut, le runner utilise le port **3456** et `LUX_URL=http://127.0.0.1:3456/`. Il lance son propre serveur si ce port est libre, ne ferme **que le processus qu'il a lancé**, et refuse d'exécuter les scénarios contre un serveur non configuré avec `APP_CONFIG.TESTS = true`. Si un autre serveur occupe le port, l'arrêter proprement ou utiliser `PORT_TEST=3457` (et éventuellement `LUX_URL`). Les journaux sont conservés dans un répertoire temporaire en cas d'échec ; la commande affiche son chemin. Aucun test ne doit écrire dans le projet Firebase de production.

## 2. Périmètre et matrice de couverture

| Bloc | Fichier | Contrat contrôlé |
|---|---|---|
| Syntaxe | `tools/test-lux-demasque.sh` | `node --check` pour le moteur, la vue et l'audio ; analyse syntaxique AST de tous les scripts Python |
| Moteur | `test/lux-demasque.test.cjs` | 6 déclarations Milo ; toutes les paires `déclaration × preuve` ; bonne pièce, leurre, précision obligatoire, journal, bilan, score et dates |
| Générateur | `test/lux-demasque-generateur.test.cjs` | 1 000 seeds déterministes, dossiers rédigés, incompatibilités, variété des affaires, 300 seeds exhaustives de preuves, force brute et scoring |
| Parcours utilisateur | `tests/test_lux_demasque.py` | Rencontre → déposition → réseaux → carnet → objections → 3/3 ; navigation Back ; aide FR existante ; écrans 320–430 px |
| Visuels/3D | `tests/test_lux_demasque_3d.py` | Renderer partagé avec Lux Match, image + alt/transcription, émotions manga, scène détachée en sortie |
| Audio | `tests/test_lux_demasque_audio.py` | Boucle unique, changement de thème, réglages, arrière-plan, extinction, fichier indisponible |
| Parcours et accessibilité | `tests/test_lux_demasque_parcours.py` | 0/3 à 3/3, fin anticipée, score, précis répétées, objection bloquante/passable, Retour/Échap, focus, WebGL, reduced motion |
| **Smoke mobile V1.1** | **`tests/test_lux_demasque_mobile.py`** | Rencontre, déposition, réseaux, pièce, carnet, objection, pause et bilan aux 4 tailles, pas de débordement horizontal, contrôles essentiels ≥44 px |
| **Contrat P0 LD-034** | **`tests/test_lux_demasque_acceptation.py`** | Milo 1/3 → Noah ; Noah 0/3 → Tom ; Tom → dossier généré ; `Rejouer` conserve ID/graine ; `Nouveau` régénère une graine différente ; retour via hub → Milo encore non résolu. Inclus dans `complet` et la suite critique. |

**Note de compatibilité :** les scénarios existants sur la traduction `FR` reflètent le comportement actuel. Lors des tâches LD-005–LD-011, **mettre à jour leurs attentes et créer des tests du Dico au même commit** ; ne pas désactiver ou supprimer silencieusement les tests pour faire passer la refonte.

## 3. LD-034 — Rotation distincte après fin partielle (correctif poussé)

**Cause initiale :** `ldNouveauDossier()` appelait simplement `ouvrirLuxDemasque()`. Cette entrée utilise `ldChoisirDossier()` qui sélectionne le premier dossier non résolu ; après Milo 1/3, « Nouveau dossier » redémarrait donc Milo.

**Correction :** `ldNouveauDossier()` conserve le parcours de jeu en cours le temps de choisir la suite : prochain dossier **rédigé non résolu situé après le courant** dans la rotation, ou **dossier généré** lorsque la rotation est épuisée. Si le courant est généré, une nouvelle graine est tirée ; une collision avec la graine actuelle est corrigée. L'appel explicite `ldRejouer()` et l'entrée depuis le hub `ldChoisirDossier()` restent inchangés. Aucun dossier partiel n'est enregistré dans `luxDemasqueResolus` par « Nouveau dossier ».

**Cas de test :** Milo 1/3 → Noah ; Noah 0/3 → Tom ; Tom 0/3 → généré ; généré 0/3 → rejeu de même seed ; « Nouveau » → seed différente ; sortie vers le hub → Milo toujours disponible. Les scénarios ciblés de fonction ont réussi (8/8) **et le parcours Playwright complet a réussi sur GitHub Actions** (28/10, run 40648161245).

- `bash tools/test-lux-demasque.sh complet` comprend désormais le contrat LD-034.
- `bash tools/test-lux-demasque.sh acceptation` exécute les tests de base puis **seulement le parcours navigateur LD-034**, pour accélérer les itérations.
- `bash tools/critique.sh` comprend ce test dans les régressions navigateur.
- **Validation LD-034 : TERMINÉE.** Les suites `rapide` et `complet` ont été exécutées sur un vrai checkout de `2.1` par GitHub Actions ; le contrat `acceptation` est compris dans `complet` et vert. Le joueur a confirmé Milo 0/3 → Noah sur Samsung. LD-034 est cochée dans la TODO canonique.

Cela évite de « faire passer » le test en vérifiant simplement l'ancien comportement incorrect.

## 4. Critères de non-régression à chaque livraison

**Règles moteur (ne jamais modifier à l'occasion d'un changement UI) :**
- Trois mensonges et trois affirmations vraies par dossier actuel, sauf évolution explicite de la SPEC.
- Pas de faux positif : une vérité n'est jamais démasquée par une preuve vague.
- La preuve doit avoir été réellement ouverte ; la déclaration doit avoir été entendue.
- Les précisions indispensables sont requises ; une objection ratée garde sa pénalité.
- Une déclaration déjà démasquée ne rapporte jamais deux fois.
- Même dossier/seed + mêmes décisions = résultat identique ; pas de fuite de motif/solution avant bilan.

**Interfaces et navigation :**
- Retour Android/Échap ferment d'abord l'effet et le panneau le plus haut, sans perdre la déclaration ni les pièces.
- Fenêtres et boutons ne se chevauchent pas à largeur 320, 360, 393 ou 430 px.
- La déposition a son dock accessible et la page entière ne défile pas par accident.
- Dico futur : ouvrir, rechercher, fermer, retour clavier, reprise sans perte d'état ; aucune traduction intégrale affichée automatiquement et aucun mot du dictionnaire ne spoile la preuve.
- Succès / échec : feedback et score corrects ; le bilan ne révèle les solutions manquées que sur action explicite **après LD-042**.
- La 3D demeure une instance partagée ; sortie, arrière-plan et manque d'audio n'empêchent pas de jouer.

## 5. Procédure de validation par petite tâche

1. **Avant modification** : lire la TODO canonique sur `main`, le `PLAYBOOK.md` de `2.1`, les documents concernés et les fichiers actuels, puis relever le SHA. Reproduire le comportement et conserver une capture de référence.
2. **Pendant la modification** : isoler un composant et son état ; créer ou adapter le test automatisé correspondant ; ne pas supprimer des assertions de contenu pour rendre les tests verts.
3. **Avant push** : lancer la suite `rapide` puis `complet`, et `tools/critique.sh rapide` puis `tools/critique.sh` lorsque la livraison touche la navigation/UX ou des composants partagés.
4. **Contrôle visuel** : faire les captures comparatives au minimum à 320×640, 360×740, 393×852, 430×932, et vérifier l'échelle de texte 150 %, le mode réduction des animations, le comportement des scrolls et le bouton Retour.
5. **Appareil réel** : tester tactile, GPU/WebGL, performances et musique sur Samsung Android. **Une exécution Playwright Chromium/SwiftShader ne valide pas le GPU Samsung.**
6. **Suivi** : documenter test(s), résultat(s), commit(s) et éventuelles réserves dans la [TODO V1.1](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md). Une tâche non vérifiée reste `[ ]`.

## 6. Scénarios à automatiser lors des lots suivants

| Tâche V1.1 | Assertions à ajouter |
|---|---|
| LD-005 à LD-011 (Dico) | Textes FR masqués par défaut ; dictionnaire navigable/recherchable ; formes LU correctement reliées ; aucun spoil ; Back/clavier |
| LD-012 à LD-019 (Déposition) | Dialogues non tronqués, transition précisée/démasquée, dock stable et actions contextuelles |
| LD-020 à LD-027 (Réseaux) | Même scroll/onglet au retour d'une pièce, carnet sans doublon, compteur exact et crédible |
| LD-028 à LD-033 (Animations) | Une seule séquence active, double tap neutralisé, motion réduite, 3D unique et arrêt du rendu |
| LD-034 à LD-043 (Navigation / bilan) | Nouveau dossier réellement distinct, rejeu reproductible, reprise prioritaire, solution cachée tant que non révélée, résumé compact sans perte d'informations |

## 7. État de la présente livraison

**Fichiers ajoutés :** `tools/test-lux-demasque.sh`, `tests/test_lux_demasque_mobile.py`, `tests/test_lux_demasque_acceptation.py`.

**Intégration :** `tools/critique.sh` exécute les deux tests Node en mode `rapide` et les contrôles navigateur, dont le smoke mobile et le contrat LD-034, en mode complet. Le runner dédié exécute aussi LD-034 en mode `complet` ou seul côté navigateur en mode `acceptation`.

**Exécution réelle :** `rapide` et `complet` lancés sur un checkout de `2.1` dans GitHub Actions, **3/3 et 9/9 blocs réussis**, tous les six parcours Playwright verts, dont LD-034. Les cas simulés 8/8 et la confirmation Samsung LD-034 sont aussi archivés. **LD-000 et LD-034 validées.** La suite globale `tools/critique.sh` et les tests manuels exhaustifs d'ergonomie GPU/audio Samsung ne sont pas couverts par ce run dédié.


## 8. Journal LD-034 (28 octobre 2026)

- **Source corrigée :** `public/lux-demasque.js`, commit `1734b52f792353b8e482438c4aa94f061507614e` (`2.1`).
- **Test navigateur enrichi :** `tests/test_lux_demasque_acceptation.py`, commit `5eed60b12fa05002ca2d492e8abdd26abb072ac0`.
- **Exécution automatisée raccordée :** `tools/test-lux-demasque.sh` (`14a8ef77`) et `tools/critique.sh` (`f10bd609`).
- **Vérification faite :** compilation JS de la source complète et simulation des huit scénarios de navigation (Milo/Noah/Tom, dossiers déjà résolus, graine identique, entrée sans partie) : 8/8.
- **Réserve :** suites réelles du dépôt et interactions Android non exécutées dans cette intervention ; cases de la TODO non cochées tant que leur recette n'est pas disponible.


## 9. Qualification effective LD-000 — GitHub Actions, 28 octobre 2026

**Workflow versionné :** [`.github/workflows/lux-demasque-v11.yml`](https://github.com/aym2020/LuxApp/blob/2.1/.github/workflows/lux-demasque-v11.yml). Lancé automatiquement sur push affectant le jeu, ses tests et le runner, ou manuellement par `workflow_dispatch` ; il utilise `actions/checkout@v4`, Node 22, Python 3.12, Playwright 1.56.0 et Chromium sur Ubuntu GitHub Actions.

| Exécution | Révision du code | Résultat | Détail |
|---|---|---|---|
| [`40647907515`](https://github.com/aym2020/LuxApp/actions/runs/40647907515) | `c4ca9320` | **Échec identifié** | Rapide 3/3, navigateur 5/6 : ancien test audio comparait 0,75 s après `round(..., 1)` à 0,7 s, alors que Python arrondit à 0,8 s |
| [`40648161245`](https://github.com/aym2020/LuxApp/actions/runs/40648161245) | `6397a824` | **Succès — 9/9 blocs complets** | Syntaxe JS/Python, moteur + générateur, `test_lux_demasque.py`, `test_lux_demasque_3d.py`, `test_lux_demasque_audio.py`, `test_lux_demasque_parcours.py`, `test_lux_demasque_mobile.py`, `test_lux_demasque_acceptation.py` |

**Correction du test audio, sans changer les ressources sonores :** [commit `6397a824`](https://github.com/aym2020/LuxApp/commit/6397a82421a7c343c4c977a78aed67b990475097) — comparer les durées brutes à 0,75/0,9/1,7/5,5 s avec tolérance 0,06 s au lieu de comparer des décimales arrondies à une mauvaise valeur.

**Limites clairement séparées :** ces tests ont été **réellement exécutés par GitHub Actions**, contrairement aux simulations isolées antérieures. Ils ne démontrent pas l'absence de régressions dans **toute** LuxApp : la suite critique transversale complète (`bash tools/critique.sh`) reste un contrôle de livraison séparé. Chromium en CI ne remplace pas l'observation tactile et graphique sur un Samsung réel lors des refontes UI futures.
