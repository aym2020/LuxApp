# RED FLAG — transformer un mensonge en énigme prouvable

**Rôle :** guide de conception, non modification du moteur. Lire [SPEC 110](../../specs/SPEC-110.md) et [affaires actuelles](../../LUX-DEMASQUE-AFFAIRES.md) pour les contraintes exactes de génération, d'IDs, de pièces et de précision.

## Chaîne de preuve

**Déclaration → question de précision (si nécessaire) → réponse précise → pièce(s) pertinente(s) → objection → justification → réplique.**

Pour chaque proposition, écrire :
1. **P** : la proposition exacte que le personnage soutient.
2. **E** : l'élément qui contredit logiquement P, pas seulement sa vraisemblance.
3. **A** : au moins deux explications alternatives réalistes et pourquoi elles sont exclues, ou pourquoi la preuve reste insuffisante.
4. **L** : un leurre qui semble lié mais ne prouve pas la négation de P.
5. **V** : une variante vraie, crédible et documentée, pour éviter un jeu où tout est faux.

## Sources de preuves utilisables dans la fiction

| Domaine | Déclaration testable | Pièce utile | Risque de faux positif |
|---|---|---|---|
| Travail | « Je suis médecin dans cet hôpital aujourd'hui » | Présentation explicite du poste actuel par un collègue fiable | Une ancienne fiche ou une profession secondaire |
| Logement | « Je vis seul dans cet appartement » | Message récent du colocataire identifiant l'adresse et la cohabitation | Visite ponctuelle, ancien colocataire |
| Voyage | « J'étais trois semaines entières au Japon en août » | Présences **physiques** datées et incompatibles à Luxembourg | Photo repostée, activité de compte à distance |
| Sport | « J'ai couru tous les jours de septembre » | Relevé **exhaustif** déclaré comme tel et absence de jours | Montre non portée, course sans montre |
| Langue | « Mon allemand est certifié C2 » | Attestation officielle datée incompatible avec l'affirmation précise | Auto-évaluation ancienne sur un profil |
| Relation | « Je suis célibataire depuis janvier » | Déclaration récente, explicite et contextualisée de relation actuelle | Photo ancienne, statut non mis à jour |
| Passion | « J'étais sur scène avec ce groupe samedi » | Programme et témoignage exhaustifs sur la distribution de samedi | Invité non crédité |
| Animal | « Rex est mon chien » | Propriétaire identifiée + confirmation qu'il ne lui appartient pas | Garde partagée ou adoption récente |
| Richesse | « Cette Porsche est à mon nom » | Message explicite du loueur sur la location à cette date | Véhicule à la fois loué et possédé ailleurs |
| Restaurant | « J'ai réservé ici il y a trois semaines » | Confirmation explicite du restaurant sur l'absence de réservation à son nom **et alias exclus** | Réservation au nom d'un ami |

**Attention :** les exemples sont des **pistes**, pas des preuves automatiquement suffisantes. Le test d'objection doit expliciter les hypothèses nécessaires. Éviter les affirmations absolues basées sur des données non exhaustives.

## Pièces et leurres

- **Pix** : photos, stories, commentaires et dates ; une image seule ne garantit ni lieu ni date de prise de vue.
- **Pro** : emploi, diplôme, parcours, langues ; profil potentiellement ancien ou auto-déclaré.
- **Amis** : témoignages et liens ; distinguer récit direct, rumeur et plaisanterie.
- **Journal sportif** : données d'entraînement ; préciser si la source est exhaustive.
- **Messages** : déclarations explicites, horodatage, identité des participants ; attention au contexte.
- **Documents fictionnels** : billets, réservations, programmes, attestations ; privilégier les documents compréhensibles au niveau A1.1/A1.2.

**Leurre acceptable :** une photo de Kyoto pendant un séjour revendiqué, qui peut dater d'un autre mois ; elle ne réfute ni ne prouve le séjour. **Leurre interdit :** un document qui contredit à lui seul une deuxième déclaration du même dossier, ou une pièce censée confirmer une vérité mais qui la réfute.

## Contrôles anti-ambiguïté

- La contradiction reste-t-elle vraie si le joueur interprète « souvent », « parfois », « je travaille » ou « j'ai » au sens ordinaire ?
- Les dates, fuseaux, durées, récurrences et jours de semaine sont-ils cohérents ?
- La preuve distingue-t-elle **absence de trace** et **preuve d'absence** ?
- Une présence en ligne ne prouve pas une présence physique.
- La précision indispensable est-elle accessible avant l'objection ?
- La pièce est-elle accessible sans déjà connaître la solution ?
- Chaque mauvaise pièce reçoit-elle une réponse honnête, non punitive ?
- Les pièces de deux affaires peuvent-elles créer une contradiction croisée non prévue ?
- Les déclarations vraies ont-elles des éléments qui les corroborent sans les rendre trivialement suspectes ?
- L'objection peut-elle être formulée en LU simple et naturel, vérifié LOD/grammaire ?

## Exemples d'adaptation des affaires existantes

Les affaires actuelles incluent notamment `A_TRAVAIL_DOKTER`, `A_LOGEMENT_COLOC`, `A_VOYAGE_JAPON`, `A_SPORT_TOUSLESJOURS`, `A_LANGUE_DAITSCH` et `A_ANIMAL_HOND`. **Ne pas les remplacer** sans audit : elles ont des précisions, des leurres et des interactions déjà documentés dans [LUX-DEMASQUE-AFFAIRES.md](../../LUX-DEMASQUE-AFFAIRES.md).

## Processus de passage en production

1. Choisir une idée du catalogue ; remplir la [fiche personnage](../references/FICHE-PERSONNAGE.md).
2. Vérifier preuves, leurres, cohérence croisée et progressivité pédagogique.
3. Vérifier la structure actuelle de `tools/lux-demasque/contenus.py` et le JSON généré avant toute édition.
4. Rédiger et vérifier le LU via LOD.lu et la grammaire ; garder les traductions FR dans les espaces documentaires autorisés.
5. Exécuter validations de dossiers, tests moteur, générateur et parcours navigateur selon le PLAYBOOK.
6. Faire relire le contenu et ne cocher la TODO qu'après recette requise.
