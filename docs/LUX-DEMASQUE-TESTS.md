# Lux Démasqué — suite de tests et recette V1.1

**Dépôt :** `aym2020/LuxApp` · **Code et tests : branche `2.1`**.  
**Backlog canonique :** [TODO V1.1 sur `main`](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md).  
**Références :** [SPEC 110](specs/SPEC-110.md) · [PLAYBOOK](../PLAYBOOK.md) · [AGENTS](../AGENTS.md).  
**État au 28/10/2026 :** suite dédiée installée et intégration statique réalisée. **Pas de résultat de tests exécutés certifié dans cette livraison : environnement d'exécution GitHub inaccessible depuis la session de création**. Ne pas écrire « suite verte » avant exécution réelle.

## 1. Commandes canoniques

Depuis la racine d'un clone **de la branche `2.1`** :

```bash
# Tests de base : syntaxe JS/Python + moteur + générateur (sans serveur).
bash tools/test-lux-demasque.sh rapide

# Base + parcours Chromium/Playwright + écran mobile (serveur local LUX_TESTS=1).
bash tools/test-lux-demasque.sh complet

# Base + navigateur + contrat futur LD-034 (actuellement ROUGE attendu).
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
| **Contrat P0 LD-034** | **`tests/test_lux_demasque_acceptation.py`** | Après 1/3 sur Milo, « Nouveau dossier » doit ouvrir un **autre** dossier ; Milo reste non résolu. Test volontairement exclu de `complet` jusqu'au correctif. |

**Note de compatibilité :** les scénarios existants sur la traduction `FR` reflètent le comportement actuel. Lors des tâches LD-005–LD-011, **mettre à jour leurs attentes et créer des tests du Dico au même commit** ; ne pas désactiver ou supprimer silencieusement les tests pour faire passer la refonte.

## 3. Contrat rouge connu LD-034 (test « failing first »)

À la date de création, `ldChoisirDossier()` sélectionne le premier dossier non résolu. Après une conclusion partielle de Milo, « Nouveau dossier » rouvre donc Milo. Le nouveau test d'acceptation formalise le comportement **voulu** : un identifiant de dossier différent, tout en gardant Milo disponible au rejeu.

- `bash tools/test-lux-demasque.sh complet` **n'inclut pas ce test tant que LD-034 est ouvert**. Il ne doit pas être bloqué par cette anomalie connue.
- `bash tools/test-lux-demasque.sh acceptation` **l'inclut** : échec attendu avant correctif, puis succès exigé après implémentation.
- Quand LD-034 est corrigé : intégrer `test_lux_demasque_acceptation` à `complet` **et** à `tools/critique.sh` (liste navigateur). Ne cocher LD-034 dans la TODO qu'après réussite réelle du scénario.

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

**Intégration :** `tools/critique.sh` exécute maintenant les deux tests Node du jeu en mode `rapide` et le smoke mobile dans le parcours complet.

**Exécution réelle :** non effectuée depuis la session de livraison, faute d'accès réseau Git/serveur de test et d'environnement Chromium reposant sur le code courant. Les tests existants ne sont pas déclarés verts sur la seule base de leur présence. **Prochaine vérification : exécuter `rapide` et `complet` dans un clone de `2.1`, archiver les logs, corriger toute erreur du runner avant de valider LD-000.** Le mode `acceptation` est destiné à montrer le défaut LD-034 tant que non corrigé.
