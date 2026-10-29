# RED FLAG — suivi persistant de conception des enquêtes

**Objet :** suivi éditorial **distinct** de la TODO technique `main/docs/LUX-DEMASQUE-TODO.md`. Branche de travail `2.1`. Une case de conception cochée n'implique ni intégration JSON, ni validation linguistique, ni recette Android. Ce fichier doit être consulté et mis à jour à chaque nouveau lot d'enquêtes, pour que Claude et ChatGPT reprennent sans repartir de zéro.

**Convention éditoriale :** [STRUCTURE-SCENARIOS.md](STRUCTURE-SCENARIOS.md) — les lots regroupent des mensonges candidats, pas des rencontres complètes. Cible de conception : trois mensonges par scénario, avec des vérités ; respecter les variantes techniques existantes avant toute implémentation. [Objections progressives](OBJECTIONS-PROGRESSIVES.md) : mécanique optionnelle pour une affaire.

## État au 29 octobre 2026

- Catalogue original : **198** idées, conservées.
- Présélection : **50** candidates dans [SELECTION-50.md](SELECTION-50.md).
- Affaires pilotes P1 : **12** identifiées.
- Mensonges candidats développés en FR : **12/50** (répartis dans quatre lots, pas quatre scénarios).
- Scénarios complets assemblés et validés dans ce chantier : **0**.
- Fiches validées éditorialement par l'utilisateur : **0/50**.
- Nouvelles affaires intégrées au jeu par ce chantier : **0**.
- LU relu / LOD vérifié pour ce chantier : **0**.

## Scénarios assemblés (non validés)

- [SCENARIOS-001-005.md](SCENARIOS-001-005.md) : **5 rencontres**, **15 emplacements de mensonges**, **3 affirmations vraies par rencontre** ; documents FR de conception uniquement, avec risques de preuve encore ouverts.
- **0 scénario validé, 0 scénario intégré** ; ne pas additionner ces quinze emplacements aux 12 fiches de mensonges des lots, car certains IDs sont réutilisés.

## SC-01 — Avancement V2

[Dossier détaillé SC-01](SC-01-PRINCE-DU-LEASING-V2.md) : conception FR approfondie, non validée et non implémentée. Trois mensonges et trois vérités assemblés. **Blocage prioritaire : preuve finale de propriété de la Porsche, à rendre accessible et concluante.** Ensuite : contrôler le financement et le vol, rédiger le LU et tester. Aucun scénario jouable ajouté.

## SC-02 — Avancement V2

[Dossier SC-02](SC-02-GENIE-DE-LA-FINANCE-V2.md) : synthèse de conception FR poussée sur GitHub ; trois mensonges, trois vérités et trois mécaniques définis. **Non validé, non implémenté.** À poursuivre : rédaction complète des pièces et dialogues, exhaustivité des crédits NovaPay, vérification LU, recette mobile.

## Registre des lots

| Lot | IDs | Document | État | Prochain traitement |
|---|---|---|---|---|
| 001 | RF-01-07, RF-02-01, RF-02-03 | [LOT-001-ENQUETES.md](LOT-001-ENQUETES.md) | **Conception FR rédigée ; non validée** | Revue éditoriale, dédoublonnage avec affaires existantes, LU |
| 002 | RF-02-05, RF-03-03, RF-04-01 | [LOT-002-ENQUETES.md](LOT-002-ENQUETES.md) | **Conception FR rédigée ; non validée** | Revue des preuves et LU |
| 003 | RF-04-05, RF-05-12, RF-06-11 | [LOT-003-ENQUETES.md](LOT-003-ENQUETES.md) | **Conception FR rédigée ; non validée** | Revue des preuves, dédoublonnage et LU |
| 004 | RF-08-12, RF-10-01, RF-14-07 | [LOT-004-ENQUETES.md](LOT-004-ENQUETES.md) | **Conception FR rédigée ; non validée** | Contrôle de redondance, provenance des pièces, LU |
| 005+ | Autres IDs de [SELECTION-50.md](SELECTION-50.md) | À créer | **Non commencé** | Prochain lot : RF-03-04, RF-04-07, RF-05-10 |

## Prochaines décisions à prendre

1. **RF-01-07** : déjà couvert sur le fond par `A_LOGEMENT_COLOC` ; faut-il améliorer la preuve et les leurres existants plutôt que créer un doublon ?
2. **RF-02-01** : poursuivre la piste du faux fondateur/CEO, en gardant les documents compréhensibles pour A1.1/A1.2.
3. **RF-02-03** : déjà proche de `A_TRAVAIL_DOKTER` ; privilégier un audit et une amélioration de l'affaire existante.
4. **Lot 002** rédigé : trader et voiture GO conception, relation cachée sous réserve de provenance de preuve.
5. **Lot 003** rédigé : application de rencontre (provenance), voyage (redondance), marathon (GO conception).
6. **Lot 004** rédigé : concert (mécanique d'annulation proche du marathon), fils unique (parenté explicite), restaurant (historique exhaustif et accès à justifier).
7. **Prochain lot 005 proposé** : RF-03-04 (voiture achetée comptant), RF-04-07 (exclusivité amoureuse), RF-05-10 (aurore boréale), sous réserve de diversité des preuves.

## Protocole de mise à jour

Pour chaque lot : consulter GitHub (PLAYBOOK, SPEC 110, affaires actuelles, sélection), écrire les fiches individuelles, vérifier preuves et alternatives, créer `LOT-NNN-ENQUETES.md`, mettre à jour **ce suivi** avec IDs, état exact, liens et prochaine action. Ne jamais compter une fiche comme « jouable » tant que les textes LU, JSON, tests et validations produit ne sont pas achevés. Préserver les anciens lots pour audit. **Ne pas modifier la TODO technique sur `main` pour du brainstorming éditorial.**
