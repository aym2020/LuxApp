# RED FLAG — suivi persistant de conception des enquêtes

**Objet :** suivi éditorial **distinct** de la TODO technique `main/docs/LUX-DEMASQUE-TODO.md`. Branche de travail `2.1`. Une case de conception cochée n'implique ni intégration JSON, ni validation linguistique, ni recette Android. Ce fichier doit être consulté et mis à jour à chaque nouveau lot d'enquêtes, pour que Claude et ChatGPT reprennent sans repartir de zéro.

## État au 29 octobre 2026

- Catalogue original : **198** idées, conservées.
- Présélection : **50** candidates dans [SELECTION-50.md](SELECTION-50.md).
- Affaires pilotes P1 : **12** identifiées.
- Fiches de conception FR développées : **9/50**.
- Fiches validées éditorialement par l'utilisateur : **0/50**.
- Nouvelles affaires intégrées au jeu par ce chantier : **0**.
- LU relu / LOD vérifié pour ce chantier : **0**.

## Registre des lots

| Lot | IDs | Document | État | Prochain traitement |
|---|---|---|---|---|
| 001 | RF-01-07, RF-02-01, RF-02-03 | [LOT-001-ENQUETES.md](LOT-001-ENQUETES.md) | **Conception FR rédigée ; non validée** | Revue éditoriale, dédoublonnage avec affaires existantes, LU |
| 002 | RF-02-05, RF-03-03, RF-04-01 | À créer | **Non commencé** | Construire trois enquêtes, pièces et contre-explications |
| 003+ | Autres IDs de [SELECTION-50.md](SELECTION-50.md) | À créer | **Non commencé** | Lots de trois selon priorité et diversité |

## Prochaines décisions à prendre

1. **RF-01-07** : déjà couvert sur le fond par `A_LOGEMENT_COLOC` ; faut-il améliorer la preuve et les leurres existants plutôt que créer un doublon ?
2. **RF-02-01** : poursuivre la piste du faux fondateur/CEO, en gardant les documents compréhensibles pour A1.1/A1.2.
3. **RF-02-03** : déjà proche de `A_TRAVAIL_DOKTER` ; privilégier un audit et une amélioration de l'affaire existante.
4. Après validation de la méthode, traiter le lot 002 : `RF-02-05`, `RF-03-03`, `RF-04-01`.

## Protocole de mise à jour

Pour chaque lot : consulter GitHub (PLAYBOOK, SPEC 110, affaires actuelles, sélection), écrire les fiches individuelles, vérifier preuves et alternatives, créer `LOT-NNN-ENQUETES.md`, mettre à jour **ce suivi** avec IDs, état exact, liens et prochaine action. Ne jamais compter une fiche comme « jouable » tant que les textes LU, JSON, tests et validations produit ne sont pas achevés. Préserver les anciens lots pour audit. **Ne pas modifier la TODO technique sur `main` pour du brainstorming éditorial.**
