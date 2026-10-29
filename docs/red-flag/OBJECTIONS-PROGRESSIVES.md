# RED FLAG — Objections progressives et défense du personnage

**Statut : décision de conception validée sur le principe le 29 octobre 2026 ; non implémentée.** Branche documentaire `2.1`. Ce document complète [MATRICE-PREUVES.md](MATRICE-PREUVES.md), les [lots 001 à 004](SUIVI-ENQUETES.md) et [SPEC 110](../specs/SPEC-110.md), sans les remplacer. **Ne pas modifier le moteur ou le contrat de six déclarations sans analyse et validation spécifiques.**

## Intention

Le joueur peut formuler une **première objection pertinente mais non décisive**. Le personnage ne reconnaît pas immédiatement le mensonge : il oppose une explication plausible, qui **remplace ou précise sa version précédente dans le dialogue actif**. Le joueur poursuit l'enquête, découvre une preuve complémentaire et peut formuler une **seconde objection décisive**. L'aveu, s'il existe, vient **après** la démonstration, jamais comme solution préalablement offerte.

Cette structure ne doit pas être imposée à toutes les enquêtes : **un niveau** suffit pour les cas d'introduction ; **deux niveaux** conviennent aux enquêtes intermédiaires ou avancées. Un troisième niveau n'est pas retenu par défaut.

## Parcours cible

1. **Déclaration initiale (P0)** : « Cette Porsche est à moi. Je l'ai achetée cet été. »
2. **Premier indice (E1)** : contrat de location du même véhicule, en **juillet 2026**.
3. **Objection intermédiaire O1** : « Regarde ce contrat de location ! »
4. **Défense D1** : « Oui, je l'ai louée en juillet pour l'essayer, puis je l'ai achetée en août. »
5. **Mise à jour de la version active (P1)** : Théo ne nie plus la location ; il maintient **l'achat en août**. Le dialogue affiche la nouvelle explication comme version actuelle. L'historique reste consultable afin que le joueur comprenne ce qui a changé.
6. **Seconde pièce (E2)** : preuve datée et crédible qui réfute spécifiquement l'achat d'août et élimine la possibilité d'une revente ultérieure ou d'un autre véhicule.
7. **Objection décisive O2** : le joueur confronte P1 à E2, idéalement en sélectionnant la déclaration et la pièce correspondantes.
8. **Résolution** : si la contradiction est démontrée, réaction et éventuel aveu de Théo ; sinon feedback non punitif et poursuite de l'enquête.

**Point logique impératif :** un contrat de location de juillet **ne réfute pas** un achat en août. Une simple annonce de location en octobre ou un document disant que l'agence est propriétaire en octobre ne suffit pas toujours non plus : il faut exclure une vente puis un rachat, une mise en location pour le compte de Théo ou une confusion de plaque. Pour le prototype, E2 peut être un **historique de propriété fictif fiable, couvrant juillet à octobre**, identifiant la même immatriculation/VIN, indiquant que l'agence est restée propriétaire sans transfert à Théo et présentant sa source de manière plausible. Ce document reste une **hypothèse de conception à scénariser**, pas une pièce déjà disponible dans le jeu.

## Types d'objection et réponses

| Type | Condition | Effet |
|---|---|---|
| **Intermédiaire pertinente** | E1 soulève un doute réel mais admet une explication plausible | Défense D1, nouvelle version P1, étape suivante débloquée ; **ne pas compter comme échec** |
| **Erronée** | La pièce ne concerne pas P0/P1 ou la conclusion n'en découle pas | Réplique courte expliquant l'insuffisance ; aucune accusation validée |
| **Décisive** | La ou les pièces accessibles réfutent P1 sans alternative raisonnable | Résolution, réaction narrative, éventuel aveu |
| **Prématurée** | Le joueur tente O2 sans preuve suffisante | Indiquer la lacune, conserver l'enquête et l'accès aux indices ; ne pas révéler E2 automatiquement |

## Contrat UX à préserver

- **Mobile-first** : une seule étape lisible à l'écran, texte court, grandes zones tactiles, aucun scroll forcé après ouverture du clavier ; éviter un arbre de dialogue interminable.
- **Version active visible** : la défense de Théo remplace la formulation de référence pour la prochaine objection, **sans effacer l'historique**. Une indication « Nouvelle version » peut montrer le changement sans donner la solution.
- **Progression non punitive** : O1 est une avancée, pas une mauvaise réponse ; feedback distinct de l'erreur.
- **Choix clairs** : montrer pourquoi une pièce ne suffit pas, sans dévoiler d'avance la preuve finale.
- **Rythme** : limiter les doubles objections aux affaires qui gagnent réellement en intérêt ; ne pas répéter systématiquement « pièce, défense, pièce ».
- **Variantes vraies** : une première objection peut conduire à une explication honnête confirmée ; le jeu ne doit pas forcer un mensonge.
- **Pédagogie** : dialogue LU A1.1/A1.2 court, vérifié avec LOD et la grammaire du projet avant toute intégration ; complexité des documents portée en priorité par l'interface française.
- **Provenance** : chaque pièce doit être accessible dans l'univers du jeu sans accès magique à des messages privés ou registres internes.

## Modèle de données conceptuel (non contractuel)

`declarationInitiale` → `objectionIntermediaire` (pièces admissibles) → `defense` → `declarationActive` → `preuveDecisive` → `objectionFinale` → `resolution`.

L'état de progression doit être distinct de la validation d'une accusation ; le joueur peut reprendre après fermeture sans perdre sa version active ni ses pièces. **Ce schéma est une intention éditoriale, pas une proposition de modification JSON validée.** Examiner les données et le moteur actuels avant de fixer la structure, la sauvegarde, le nombre de tentatives et le scoring.

## Critères d'acceptation avant implémentation

1. E1 est pertinente mais logiquement insuffisante pour condamner P0.
2. D1 est naturelle, cohérente avec E1, et n'avoue pas le mensonge.
3. P1 est affichée comme nouvelle version active ; l'ancienne reste consultable.
4. E2 contredit P1 ; les alternatives raisonnables sont testées explicitement.
5. O1 est récompensée comme progrès ; une mauvaise objection est distinguée d'O1.
6. O2 ne réussit qu'avec la preuve adéquate ; aucun aveu préalable ne court-circuite le raisonnement.
7. Les cas à un seul niveau restent jouables et ne régressent pas.
8. Les vérités, la progression persistée, le générateur, la compatibilité mobile et les exercices LU restent préservés.
9. Tests unitaires et recette Android à prévoir **au moment de l'implémentation** ; aucune validation technique n'est revendiquée ici.

## Application aux lots 001–004

**Candidat pilote prioritaire : RF-03-03, Porsche louée** ([lot 002](LOT-002-ENQUETES.md)). Sa rédaction actuelle utilise une location d'octobre et un aveu anticipé ; il faudra la **réécrire** avec location en juillet, défense « essai puis achat en août », preuve E2 indépendante et objection finale. **Ne pas modifier rétroactivement la fiche du lot 002 sans une révision éditoriale explicite**, afin de conserver la trace de la version initiale.

Autres candidats possibles après audit : RF-02-05 (trader en simulation), RF-14-07 (réservation). Les affaires faciles et les dossiers déjà redondants ne doivent pas être convertis automatiquement.

**Prochaine étape :** écrire une fiche pilote RF-03-03 v2 avec dialogues et pièces, valider la crédibilité d'E2, puis analyser l'impact sur SPEC 110, les données, le moteur et les tests avant tout changement de code.
