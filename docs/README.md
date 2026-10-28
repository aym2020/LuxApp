# Documentation LuxApp — point d'entrée

**Dépôt :** `aym2020/LuxApp` · **Branche concernée :** `2.1` · **Dernière réorganisation :** 23 octobre 2026.

Bienvenue dans la documentation du projet d'apprentissage du luxembourgeois pour francophones. Cet index indique **quel document lire**, son rôle et son niveau de fiabilité. Commencer toujours par le **code actuel sur GitHub** et le [PLAYBOOK](../PLAYBOOK.md) ; les anciens documents, maquettes et captures ne supplantent jamais le code ni les règles approuvées.

## Par où commencer ?

| Besoin | Document à ouvrir | Rôle |
|---|---|---|
| Conventions, branches, tests et risques | [PLAYBOOK.md](../PLAYBOOK.md) · [AGENTS.md](../AGENTS.md) | Méthode d'intervention et garde-fous |
| Refonte visuelle LuxApp 2.1 | [CHARTE_UI_2.1.md](CHARTE_UI_2.1.md) | **Règles UI normatives**, y compris § 6 bis pour les dimensions 640 / 560 / 500px **à implémenter** |
| Composants, typographie, couleurs, statuts | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Référence partagée ; ne pas dupliquer les valeurs |
| Correction, sons et parité de feedback | [SPEC 94](specs/SPEC-94.md) · [agent de vérification](../.claude/agents/ui-parity-auditor.md) | **Lots 1/2 codés** ; les bandeaux actuels seront remplacés visuellement selon SPEC 95 |
| **Nouvelle structure des exercices / CTA fixe** | [SPEC 95](specs/SPEC-95.md) | **Implémentée ; visuels/sons acceptés sur Samsung le 25/10** : trois zones DOM, CTA stable ; clavier ouvert, zoom et TalkBack à valider |
| Dimensions PC/mobile existantes | [AUDIT-DIMENSIONS-2.1.md](AUDIT-DIMENSIONS-2.1.md) | **Diagnostic statique**, pas preuve de validation visuelle |
| Priorités à livrer | [TODO.md](../TODO.md) | Backlog et critères d'acceptation |
| **Lux Démasqué — prochaine action et suivi des 47 tâches V1.1** | [TODO canonique sur `main`](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md) | **Source de vérité du statut**, cases à cocher, ordre, journal de validation ; code du jeu sur `2.1` |
| Recette privée (Render et PC / Samsung) | [RECETTE.md](RECETTE.md) | **Guide actuel** : LuxApp TEST autonome, authentification et isolation ; pas de raccourci dans le Plus normal |
| Choisir les scénarios de test | [RECETTES-2.1.md](RECETTES-2.1.md) | Catalogue des scénarios et validations |
| Incident des exercices | [POSTMORTEM-EXERCICES-2.1-2026-10-21.md](POSTMORTEM-EXERCICES-2.1-2026-10-21.md) | Incidents et procédure obligatoire anti-régression |
| Comportement attendu et décisions produit | [specs/README.md](specs/README.md) | **Registre de 91 fiches** ; lire l'état de chaque SPEC |

**Hiérarchie en cas de contradiction :** version réelle du code et des données sur la branche cible pour le fonctionnement constaté ; PLAYBOOK/AGENTS pour la méthode ; charte et Design System pour les règles d'interface ; SPEC concernée pour l'intention fonctionnelle ; TODO et recette pour l'état de validation. Un rapport historique ne vaut pas approbation produit.

## Écrans et parcours — dossiers de livraison 2.1

Ces fichiers décrivent des **évolutions par écran** et leur périmètre ; ils ne remplacent pas la charte commune. Un statut « implémenté » n'implique pas « vérifié sur Samsung ».

| Parcours | Dossiers |
|---|---|
| Démarrage et navigation | [Accueil](ACCUEIL-2.1.md) · [Chemin et vue de leçon](LECON-OVERVIEW-2.1.md) · [Nouveautés](NOUVEAUTES-2.1.md) |
| Apprentissage | [Introduction d'unité](INTRO-UNITE-2.1.md) · [Exercices](EXERCICES-2.1.md) · [Cours](COURS-2.1.md) |
| Missions | [Introduction de mission](MISSION-INTRO-2.1.md) · [Scénario](SCENARIO-2.1.md) |
| Entraînement et évaluation | [Révision](REVISION-2.1.md) · [Expression écrite A1.2](EXPRESSION-ECRITE-A1.2-2.1.md) |

**Attention :** [EXERCICES-2.1.md](EXERCICES-2.1.md) conserve un avertissement de **validation Android incomplète**. Se référer au post-mortem plutôt que déclarer l'exercice terminé sur une simple CI verte.

## Données linguistiques et audio — rapports générés

Ces fichiers conservent volontairement leurs chemins historiques, car les **scripts LOD les produisent exactement à ces emplacements**. Ne pas les déplacer sans adapter les générateurs et leurs tests.

| Document | Nature |
|---|---|
| [audit-audio-lod.md](audit-audio-lod.md) | Rapport généré de couverture sonore |
| [audit-correspondances-lod.md](audit-correspondances-lod.md) · [JSON détaillé](audit-correspondances-lod.json) | Rapport et données générés de correspondances |
| [inventaire-orthographe-lod.md](inventaire-orthographe-lod.md) | Inventaire généré ; suggestions **non validées par défaut** |
| [audit-enrichissement-lecons-1-3.md](audit-enrichissement-lecons-1-3.md) | Propositions pédagogiques à valider |
| [spec73-phase-b.md](spec73-phase-b.md) | Journal des lots liés à SPEC 73 |
| [audio-mia.md](audio-mia.md) | Mode opératoire de synthèse audio, rédigé pour `v2` ; vérifier l'état actuel avant exécution |

La [SPEC 73](specs/SPEC-73.md) gouverne les décisions de correspondances LOD. Les rapports générés ne doivent **jamais** être corrigés manuellement pour maquiller un écart.

## Jeu — Lux Match (démo jouable)

[**SPEC 109 — Lux Match : Double jeu**](specs/SPEC-109.md) : proposition de dating arcade PS1, smartphone à batterie limitée durant le rendez-vous, 6 archétypes fictifs et dialogues conditionnels. Contenus du jeu : [contenus-v02.json](../data/jeux/lux-match/contenus-v02.json) (bible intégrée, statut de relecture par ligne ; v01 archivés). **Masqué au public depuis le 27/10/2026 (SPEC 110, lot D0) : `JEUX_DISPONIBLES.luxMatch = false` dans `public/jeux-v21.js`, tout est conservé, `true` pour le réactiver.** Démo jouable sur `2.1` : carte « Lux Match · DÉMO » dans Jeux, bible éditoriale intégrée le 27/10/2026 (profil d'Alex, réseaux, conversations, événements, fins, générateur semi-procédural). Textes LU audités par règles et leçons, non certifiés LOD (signalé dans le jeu).** Fichiers : `public/lux-match-core.js` (moteur pur + générateur), `public/lux-match.js` + `.css` (interface), `public/lux-match-3d.js` (café 3D, décors Pix), `public/lux-match/` (GLB CC0), `tools/lux-match/contenus_v02.py`, `test/lux-match*.test.cjs`.

**Pour Claude — commencer ici :** [Guide d'intégration des contenus Lux Match](LUX-MATCH-GUIDE-INTEGRATION-CONTENUS.md) — mode d'emploi par lot, table des IDs éditoriaux, correspondance vers les JSON/JS actuels, exemple Sofia, points bloquants et critères de test. **Lire ce guide avant d'ouvrir la bible complète.** Passation exécutée : voir le suivi par lot de la SPEC 109.

**Bible textuelle à intégrer (27/10/2026) :** [LUX-MATCH-BIBLE-EDITORIALE-A11.md](LUX-MATCH-BIBLE-EDITORIALE-A11.md) — 6 profils et leurs faux réseaux, textes de l'interface, 28 beats de dialogue (26 principaux + 2 amorces), 14 événements conditionnels, 24 conclusions, 30 réactions, 12 plans de partie et règles d'audit. **Document éditorial uniquement, phrases LU proposées à valider ; aucun code de production modifié par ce lot.**

## Jeu — Lux Démasque (SPEC 110, implémenté sur 2.1)


**Tests de Lux Démasqué V1.1 :** [suite dédiée, commandes et procédure Android](LUX-DEMASQUE-TESTS.md) — `bash tools/test-lux-demasque.sh rapide|complet|acceptation` ; scripts Playwright, test LD-034 en échec attendu jusqu'au correctif. Cette suite est le préalable obligatoire aux modifications du jeu.

[**SPEC 110 — Lux Démasque : dépositions, preuves, objections et dossiers générés**](specs/SPEC-110.md) : mini-jeu de déduction indépendant de Lux Match. Le joueur interroge des prétendants **toujours menteurs**, mais dont plusieurs déclarations sont vraies ; il cherche **toutes les disquettes**, avec les indices de Pix/Pro/Amis en **français**, des dépositions/questions en **luxembourgeois**, des objections appuyées sur des preuves **visuelles**, un moteur de dossiers **semi-procédural contraint**, le café/personnages **3D low-poly** et une **musique arcade d'enquête originale**. **Statut : implémenté sur 2.1 (lots D0–D5, suivi en SPEC 110 § 12) ; recette sur appareil et relecture LU native à faire ; ne pas confondre avec Lux Match (masqué, réactivable par `JEUX_DISPONIBLES.luxMatch`).** Dossier pilote : [LUX-DEMASQUE-DOSSIER-MILO.md](LUX-DEMASQUE-DOSSIER-MILO.md). Affaires atomiques et générateur : [LUX-DEMASQUE-AFFAIRES.md](LUX-DEMASQUE-AFFAIRES.md). Pour développer : moteur `public/lux-demasque-core.js`, contenus `tools/lux-demasque/contenus.py`, tests `test/lux-demasque*.cjs` et `tests/test_lux_demasque*.py` ; tester sans régression de Lux Match.

## Recherche, maquettes, prototypes et archives

| Répertoire | Utilisation |
|---|---|
| [recherche/](recherche/README.md) | Benchmark externe et captures à compléter — **observations**, pas fonctionnalités approuvées |
| [maquettes/](maquettes/LuxApp_Lecon2_Cours_3onglets.html) | Maquette interactive de Cours ; référence visuelle, pas code de production |
| [prototypes/](prototypes/SURVIE-COMBO-FIRE-V01.md) | Expérimentations de Survie **non validées pour intégration** |
| [archives/](archives/README.md) | Anciennes procédures, conservées pour traçabilité, **à ne pas exécuter sur `2.1`** |
| [specs/](specs/README.md) | Fiches historiques, implémentées ou futures ; les fiches remplacées restent dans le registre |

## Statuts documentaires — vocabulaire commun

- **Règle active :** convention applicable avant toute modification.
- **Cible à implémenter :** décision de conception écrite mais **absente du CSS / du moteur**.
- **Implémenté, validation à confirmer :** code présent sans preuve suffisante sur appareil réel.
- **Proposition / recherche / prototype :** non approuvé pour mise en production.
- **Généré :** sortie reproductible d'un outil, à régénérer et non éditer à la main.
- **Archive / remplacé :** utile pour l'historique, **pas** pour guider une nouvelle implémentation.

## Entretenir ces documents

1. Avant toute tâche : lire [PLAYBOOK](../PLAYBOOK.md), cette page et la doc pertinente dans sa **branche courante**.
2. Écrire les **règles de mise en page** dans la charte (pas dans chaque audit), les composants dans le Design System et le comportement dans la SPEC pertinente.
3. Indiquer branche, commit, statut réel, source et tests. Ne pas confondre capture fournie, audit statique, test automatisé et validation Android.
4. Maintenir les liens relatifs lors d'un déplacement. Les scripts de génération et leurs chemins de sortie doivent continuer à fonctionner.
5. Déplacer vers `archives/` les anciennes procédures plutôt que supprimer les décisions qui expliquent le code. Ne pas écraser l'historique ni modifier `main` au cours d'une réorganisation documentaire.
