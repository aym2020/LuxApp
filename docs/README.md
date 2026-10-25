# Documentation LuxApp — point d'entrée

**Dépôt :** `aym2020/LuxApp` · **Branche concernée :** `2.1` · **Dernière réorganisation :** 23 octobre 2026.

Bienvenue dans la documentation du projet d'apprentissage du luxembourgeois pour francophones. Cet index indique **quel document lire**, son rôle et son niveau de fiabilité. Commencer toujours par le **code actuel sur GitHub** et le [PLAYBOOK](../PLAYBOOK.md) ; les anciens documents, maquettes et captures ne supplantent jamais le code ni les règles approuvées.

## Par où commencer ?

| Besoin | Document à ouvrir | Rôle |
|---|---|---|
| Conventions, branches, tests et risques | [PLAYBOOK.md](../PLAYBOOK.md) · [AGENTS.md](../AGENTS.md) | Méthode d'intervention et garde-fous |
| Refonte visuelle LuxApp 2.1 | [CHARTE_UI_2.1.md](CHARTE_UI_2.1.md) | **Règles UI normatives**, y compris § 6 bis pour les dimensions 640 / 560 / 500px **à implémenter** |
| Composants, typographie, couleurs, statuts | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Référence partagée ; ne pas dupliquer les valeurs |
| Règles de correction et parité Leçon / S'entraîner | [SPEC 94](specs/SPEC-94.md) · [agent de vérification](../.claude/agents/ui-parity-auditor.md) | **Lots 1 et 2 codés** : choix partagés, bandeau plat commun (`feedback-unifie.js/.css`), 3 sons, Mot caché, Écriture, réglage Sons ; **Samsung à valider** |
| Dimensions PC/mobile existantes | [AUDIT-DIMENSIONS-2.1.md](AUDIT-DIMENSIONS-2.1.md) | **Diagnostic statique**, pas preuve de validation visuelle |
| Priorités à livrer | [TODO.md](../TODO.md) | Backlog et critères d'acceptation |
| Recette privée (Render et PC / Samsung) | [RECETTE.md](RECETTE.md) | **Guide actuel**, authentification et isolation |
| Choisir les scénarios de test | [RECETTES-2.1.md](RECETTES-2.1.md) | Catalogue des scénarios et validations |
| Incident des exercices | [POSTMORTEM-EXERCICES-2.1-2026-10-21.md](POSTMORTEM-EXERCICES-2.1-2026-10-21.md) | Incidents et procédure obligatoire anti-régression |
| Comportement attendu et décisions produit | [specs/README.md](specs/README.md) | **Registre de 89 fiches** ; lire l'état de chaque SPEC |

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
