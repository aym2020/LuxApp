# RED FLAG / Cringr — documentation éditoriale

**Branche de travail :** `2.1`. **Sources normatives techniques :** [SPEC 110 — gameplay](../specs/SPEC-110.md), [SPEC 113 — sélection Cringr](../specs/SPEC-113.md) ; **[SPEC 115 — prologue cinématique](../specs/SPEC-115.md)** est **implémentée sur `2.1` (LD-049), validation Samsung en attente**. **Backlog canonique :** [TODO Lux Démasqué sur main](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md). **Code et JSON actuels :** toujours consulter GitHub avant intégration.

## Commencer ici

1. [SUIVI-ENQUETES.md](SUIVI-ENQUETES.md) : état réel, décisions ouvertes et prochaines étapes.
2. [SC-01 — Le prince du leasing](scenarios/SC-01.md) et [SC-02 — Le génie de la finance](scenarios/SC-02.md) : **uniques versions actives** des deux dossiers français, non validés LU et non intégrés.
3. [SCENARIOS-001-005.md](scenarios/SCENARIOS-001-005.md) : synopsis initial des cinq rencontres, **historique pour SC-01/SC-02**, non normatif face aux dossiers actifs.
4. [BIBLE-EDITORIALE.md](references/BIBLE-EDITORIALE.md) et [STRUCTURE-SCENARIOS.md](references/STRUCTURE-SCENARIOS.md) : ton, personnage, unité mensonge/enquête/scénario.
5. [MATRICE-PREUVES.md](references/MATRICE-PREUVES.md), [OBJECTIONS-PROGRESSIVES.md](references/OBJECTIONS-PROGRESSIVES.md) et [FICHE-PERSONNAGE.md](references/FICHE-PERSONNAGE.md) : contrôle des preuves et modèle de création.

## Arborescence

```text
docs/red-flag/
├── README.md
├── SUIVI-ENQUETES.md
├── references/
│   ├── BIBLE-EDITORIALE.md
│   ├── STRUCTURE-SCENARIOS.md
│   ├── MATRICE-PREUVES.md
│   ├── OBJECTIONS-PROGRESSIVES.md
│   └── FICHE-PERSONNAGE.md
├── catalogue/
│   ├── CATALOGUE-MENSONGES.md
│   ├── MATRICE-EXHAUSTIVE.md
│   └── SELECTION-50.md
├── enquetes/
│   ├── LOT-001-ENQUETES.md
│   ├── LOT-002-ENQUETES.md
│   ├── LOT-003-ENQUETES.md
│   └── LOT-004-ENQUETES.md
├── scenarios/
│   ├── SCENARIOS-001-005.md
│   ├── SC-01.md
│   └── SC-02.md
└── archives/
    ├── SC-01-V2.md
    ├── SC-01-V3.md
    ├── SC-02-V2.md
    └── SC-02-V3.md
```

## Rôles, sans doublon fonctionnel

- **[Catalogue](catalogue/CATALOGUE-MENSONGES.md)** : 198 idées, non vérifiées ; [matrice exhaustive](catalogue/MATRICE-EXHAUSTIVE.md) : index et pistes de preuves ; [sélection 50](catalogue/SELECTION-50.md) : priorités éditoriales.
- **[Lots d'enquêtes](enquetes/LOT-001-ENQUETES.md)** : fiches atomiques 001–004, **pas** des scénarios complets. Les autres lots : [002](enquetes/LOT-002-ENQUETES.md), [003](enquetes/LOT-003-ENQUETES.md), [004](enquetes/LOT-004-ENQUETES.md).
- **[Scénarios](scenarios/SC-01.md)** : rencontres composées de trois mensonges et trois vérités ; les V2/V3 dans `archives/` servent uniquement à l'audit et ne doivent pas être utilisées pour implémenter.
- **Suivi éditorial** : ce dossier ; **suivi technique** : TODO sur `main`. Ne pas mélanger.

## Garde-fous

Une idée n'est pas une preuve. Les dossiers SC-01/SC-02 sont des conceptions **françaises** : produire les pièces, tester les objections, vérifier le LU sur LOD.lu et `grammaire_luxembourg.md`, puis contrôler le contrat JSON, le moteur, la progression et Android. Ne pas déclarer jouable avant recette et validation. Les anciens chemins supprimés restent récupérables via l'historique Git.
