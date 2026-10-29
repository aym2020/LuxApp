# RED FLAG — bibliothèque éditoriale et guide d'accès

**Jeu :** RED FLAG · **Application fictive :** Cringr · **Ancien nom technique/documentaire :** Lux Démasqué.  
**Branche de travail :** `2.1` · **Backlog canonique :** [TODO sur `main`](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md).

Ce dossier est **le point d'entrée éditorial** pour créer des personnages, mensonges, preuves, leurres et rencontres de RED FLAG. Il ne remplace **ni** les SPEC techniques, **ni** le moteur, **ni** les données validées.

## Lecture recommandée pour Claude et ChatGPT

1. [BIBLE-EDITORIALE.md](BIBLE-EDITORIALE.md) : ton, personnages, principes d'enquête, difficultés et pédagogie.
2. [CATALOGUE-MENSONGES.md](CATALOGUE-MENSONGES.md) : banque de thèmes et affirmations (idées **non implémentées**, non vérifiées).
3. [MATRICE-PREUVES.md](MATRICE-PREUVES.md) : transformer une idée en affaire jouable, avec précision, preuve suffisante, leurre et contre-exemples.
4. [FICHE-PERSONNAGE.md](FICHE-PERSONNAGE.md) : modèle de conception et critères d'acceptation.
5. **Références normatives hors de ce dossier :** [SPEC 110](../specs/SPEC-110.md) (moteur, données, LU), [SPEC 113](../specs/SPEC-113.md) (sélecteur Cringr, remplace les règles de swipe de SPEC 112), [affaires existantes](../LUX-DEMASQUE-AFFAIRES.md), [tests](../LUX-DEMASQUE-TESTS.md), [validation par écran](../LUX-DEMASQUE-VALIDATION-ECRANS.md).

## Où est la source de vérité ?

| Objet | Source | Statut |
|---|---|---|
| Intention et idées de mensonges | Ce dossier | **Brainstorming / conception**, pas contenu approuvé |
| Comportement Cringr | `docs/specs/SPEC-113.md` | Décision normative, recette ouverte |
| Format, moteur et génération | `docs/specs/SPEC-110.md` + code et JSON actuels | Contrat technique à vérifier avant intervention |
| Affaires déjà écrites | `docs/LUX-DEMASQUE-AFFAIRES.md` et `tools/lux-demasque/contenus.py` | Contenu existant ; ne pas écraser |
| Avancement / validation | `main/docs/LUX-DEMASQUE-TODO.md` | Backlog canonique |
| Processus de développement | `PLAYBOOK.md` et `AGENTS.md` | Obligatoire |

## Règle de contribution

Une idée du catalogue n'est **jamais** une preuve. Ne pas créer directement des phrases LU, pièces JSON ou nouvelles affaires à partir de la banque. Vérifier les faits, dates et contraintes, construire un raisonnement sans ambiguïté, puis rédiger le luxembourgeois A1.1/A1.2 avec `grammaire_luxembourg.md` et LOD.lu. Relire les textes FR/LU, tester le générateur et les contradictions croisées, puis faire valider le résultat.

**Convention de recherche :** mots-clés `RED FLAG`, `Cringr`, `Lux Démasqué`, `mensonges`, `affaires`, `preuves`, `leurres`. Les chemins internes `ld*`, les IDs et les clés de sauvegarde ne doivent pas être renommés pour des raisons de marque.
