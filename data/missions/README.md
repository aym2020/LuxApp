# Missions conversationnelles LuxApp — brouillons pédagogiques

25 missions du niveau A1.1/A1.2, une par leçon, au format JSON indépendant du format applicatif final.

- Chaque mission comporte 20 répliques bilingues luxembourgeois/français : 10 pour l'interlocuteur, 10 pour l'apprenant.
- Fichiers individuels : `A1.1/mission-01.json` à `A1.1/mission-17.json` et `A1.2/mission-18.json` à `A1.2/mission-25.json`.
- Fichier groupé : `missions-25.json`.
- Leçons 18 et 19 absentes du dépôt au moment de la rédaction. Leurs missions `statut_source: provisoire_source_absente` sont des propositions de révision et ne doivent pas être considérées comme validées.
- Les autres missions sont des brouillons ancrés dans le contenu des leçons, **pas une validation linguistique exhaustive**.
- Aucune modification du code applicatif ni branchement des missions dans l'interface.

Date du lot : 18 octobre 2026.

## Intégration (spec 34, 18/10/2026)

Les brouillons ont servi de source, relus et corrigés : les scènes des leçons (`data/lecons/*/lecon-NN.json`, champ `scene`, `mission.version: 2`) ont chacune 10 réponses, dans le scénario déjà relu de la leçon. Les missions 18 et 19 attendent leurs leçons ; la mission de la leçon 26 a été écrite sans brouillon. Ces fichiers ne sont pas lus par l'application.
