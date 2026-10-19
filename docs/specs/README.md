# LuxApp — Registre des spécifications

Ce répertoire centralise les **53 spécifications** fonctionnelles et UX du projet LuxApp. Source de référence : discussions de cadrage, implémentation dans le dépôt `v2`, [playbook](../../PLAYBOOK.md) et [design system](../DESIGN_SYSTEM.md).

> **Précision importante :** les fiches 01 à 22 sont une **reconstruction structurée** des demandes/échanges et des fonctionnalités observées : elles ne prétendent pas être des copies littérales des versions originales. La fiche 23 est implémentée côté moteur (scènes à 10 réponses à écrire) ; les fiches 24 à 28 sont implémentées, recette sur smartphone à faire ; les fiches 29 à 31 sont implémentées avec validation à confirmer ; la fiche 32 est implémentée (recette à confirmer) ; les fiches 33 et 34 sont implémentées (recette à confirmer) ; les fiches 35 à 37 sont implémentées (recette à confirmer) ; la fiche 38 décrit le correctif d'historique après confirmation de l'introduction et rattrapage des erreurs. La fiche 39 optimise l'outillage de tests ; la fiche 40 est implémentée (recette Android à confirmer) ; la fiche 41 est implémentée (recette Android à confirmer) ; la fiche 42 est implémentée (validation Android à confirmer) ; la fiche 43 décrit le mode de recette visuelle rapide à développer. Les statuts sont un point de départ de pilotage, **pas une attestation de tests de recette**.

## Statuts

- **Implémentée — validation à confirmer** : travail déclaré comme codé ou constaté dans le dépôt, mais conformité à revalider sur la version courante.
- **En cours** : développement annoncé et susceptible d'évoluer dans d'autres commits.
- **À faire** : la spec est formalisée mais n'est pas déclarée implémentée.
- **Validée** : à utiliser uniquement après une vraie recette fonctionnelle et visuelle.

## Registre

| ID | Spécification | Priorité | Statut |
|---|---|---|---|
| 01 | [Introduction immersive de la mission](./SPEC-01.md) | P1 | Implémentée — validation à confirmer |
| 02 | [Mission compacte lors des visites suivantes](./SPEC-02.md) | P1 | Implémentée — validation à confirmer |
| 03 | [Retour sur l'unité quittée](./SPEC-03.md) | P0 | Implémentée — validation à confirmer |
| 04 | [Navigation douce entre unités](./SPEC-04.md) | P1 | Implémentée — validation à confirmer |
| 05 | [Mission interactive : réponse, feedback et clavier](./SPEC-05.md) | P0 | Implémentée — validation à confirmer |
| 06 | [Harmonisation des exercices d'écriture](./SPEC-06.md) | P0 | Implémentée — validation à confirmer |
| 07 | [Gestion robuste du clavier mobile](./SPEC-07.md) | P0 | Implémentée — validation à confirmer |
| 08 | [Clarification du vocabulaire « + »](./SPEC-08.md) | P1 | Implémentée — validation à confirmer |
| 09 | [Sauvegarde et reprise sans perte](./SPEC-09.md) | P0 | Implémentée — validation à confirmer |
| 10 | [Recette UX mobile et non-régression](./SPEC-10.md) | P0 | Implémentée — validation à confirmer |
| 11 | [Mot caché : découverte et lettres mélangées](./SPEC-11.md) | P1 | Implémentée — validation à confirmer |
| 12 | [Mission en dialogue interactif compact](./SPEC-12.md) | P0 | Implémentée — validation à confirmer |
| 13 | [Mon chemin : accordéon à leçon unique](./SPEC-13.md) | P0 | Implémentée — validation à confirmer |
| 14 | [Mon chemin compact et scroll intelligent](./SPEC-14.md) | P0 | Implémentée — validation à confirmer |
| 15 | [Historique de navigation et retour fixe](./SPEC-15.md) | P0 | Implémentée — validation à confirmer |
| 16 | [Affordances et microanimations de guidage](./SPEC-16.md) | P1 | Implémentée — validation à confirmer |
| 17 | [Lisibilité et réduction des troncatures](./SPEC-17.md) | P1 | Implémentée — validation à confirmer |
| 18 | [Découverte sans engagement et retours préservés](./SPEC-18.md) | P0 | Implémentée — validation à confirmer |
| 19 | [Design system et harmonisation des écrans](./SPEC-19.md) | P1 | Implémentée — validation à confirmer |
| 20 | [Résultats d'unité : barres et CTA fixe](./SPEC-20.md) | P1 | Implémentée — validation à confirmer |
| 21 | [Mot caché : identité des tuiles et CTA de l'introduction](./SPEC-21.md) | P0 | Implémentée — validation à confirmer |
| 22 | [Progression principale séparée de l'entraînement libre](./SPEC-22.md) | P0 | Implémentée — validation à confirmer |
| 23 | [Missions de 10 réponses et système de trois vies](./SPEC-23.md) | P1 | En cours |
| 24 | [Correction algorithmique des coquilles sans IA](./SPEC-24.md) | P1 | Implémentée — validation à confirmer |
| 25 | [Accueil : destination explicite et scroll de retour](./SPEC-25.md) | P0 | Implémentée — validation à confirmer |
| 26 | [Sens de lecture uniforme des traductions du cours](./SPEC-26.md) | P1 | Implémentée — validation à confirmer |
| 27 | [Valorisation visuelle des unités terminées](./SPEC-27.md) | P1 | Implémentée — validation à confirmer |
| 28 | [Résultats d'étape plus gratifiants](./SPEC-28.md) | P1 | Implémentée — validation à confirmer |
| 29 | [Mon chemin : lignes compactes et statuts sans débordement](./SPEC-29.md) | P1 | Implémentée — validation à confirmer |
| 30 | [Mon chemin homogène et compact, en-tête de mission sans troncature](./SPEC-30.md) | P1 | Implémentée — validation à confirmer |
| 31 | [Mot caché : premier clic perdu sur PC](./SPEC-31.md) | P0 | Implémentée — validation à confirmer |
| 32 | [Mission réussie avec trois vies : validation de la leçon sans étoiles fictives](./SPEC-32.md) | P0 | Implémentée — validation à confirmer |
| 33 | [Mon chemin continu, unités validées par mission et en-tête stable](./SPEC-33.md) | P0 | Implémentée — validation à confirmer |
| 34 | [Système de vies lisible et missions à 10 répliques](./SPEC-34.md) | P0 | Implémentée — validation à confirmer |
| 35 | [Missions : bouton Continuer, ascenseur sombre et retours compréhensibles](./SPEC-35.md) | P1 | Implémentée — validation à confirmer |
| 36 | [Règles des vies à chaque lancement de mission, avec « Ne plus afficher »](./SPEC-36.md) | P1 | Implémentée — validation à confirmer |
| 37 | [Boutons « Continuer » verts : plus d'anneau jaune après Entrée](./SPEC-37.md) | P1 | Implémentée — validation à confirmer |
| 38 | [Retour après une leçon commencée : ne pas rouvrir l'introduction](./SPEC-38.md) | P0 | Implémentée — validation à confirmer |
| 39 | [Outillage de test : suite critique en ~1 min 30 sans perte de couverture](./SPEC-39.md) | P1 | Implémentée — validation à confirmer |
| 40 | [Correction lisible, rappels des erreurs limités, retour au chemin après « Refaire mes erreurs »](./SPEC-40.md) | P1 | Implémentée — validation à confirmer |
| 41 | [Coquilles expliquées précisément et retour au véritable Chemin après rattrapage](./SPEC-41.md) | P1 | Implémentée — validation à confirmer |
| 42 | [Pré-requis A1.2 : sinn/hunn, aide vocabulaire et retours pédagogiques fiables](./SPEC-42.md) | P0 | Implémentée — validation à confirmer |
| 43 | [Mode recette visuelle : tester les missions et résultats en quelques secondes](./SPEC-43.md) | P1 | Implémentée — validation à confirmer |
| 44 | [Chemin déplié après « Refaire mes erreurs » et écran conservé à l'actualisation](./SPEC-44.md) | P1 | Implémentée — validation à confirmer |
| 45 | [Tout retour depuis un écran de résultat mène au Chemin, leçon dépliée](./SPEC-45.md) | P1 | Implémentée — validation à confirmer |
| 46 | [Acquis de l'ancienne version : distincts des unités réellement terminées](./SPEC-46.md) | P0 | Implémentée — validation à confirmer |
| 47 | [Leçon repliée : titre lisible, pastille « À rafraîchir » sous le titre](./SPEC-47.md) | P1 | Implémentée — validation à confirmer |
| 48 | [Harmonisation visuelle et sémantique du Chemin](./SPEC-48.md) | P1 | Implémentée — validation à confirmer |
| 49 | [Résultat d'examen : retours fiables vers la liste des sujets](./SPEC-49.md) | P1 | Implémentée — validation à confirmer |
| 50 | [Salut du matin : accepter Moien et Gudde Moien sans pénalité](./SPEC-50.md) | P1 | Implémentée — validation à confirmer |
| 51 | [Lettres mélangées : accents automatiques dans les cases](./SPEC-51.md) | P1 | Implémentée — validation à confirmer |
| 52 | [Accueil mobile compact et synchronisation dans les réglages](./SPEC-52.md) | P1 | Implémentée — validation à confirmer |
| 53 | [Chemin : libellés courts pour unités, missions et bilan](./SPEC-53.md) | P1 | Implémentée — validation à confirmer |

## Gestion des changements

1. Toute modification de comportement doit citer son numéro de SPEC et, si nécessaire, mettre à jour sa fiche **avant** la livraison.
2. Après implémentation, documenter dans la fiche les fichiers touchés, tests exécutés et anomalies ouvertes ; n'indiquer « Validée » qu'après vérification.
3. Le code et les JSON de leçons restent la source du **fonctionnement actuel**, tandis que ces fiches décrivent le **comportement attendu**.
4. Ne pas refaire intégralement la suite de tests pour une modification cosmétique isolée ; tester d'abord le périmètre puis exécuter une non-régression globale avant livraison.
5. En cas d'évolution concurrente (Claude, autre branche), se synchroniser sur la dernière révision et éviter d'écraser des fichiers modifiés.

## Liens utiles

- [Playbook](../../PLAYBOOK.md)
- [Design system](../DESIGN_SYSTEM.md)
- [Tests du projet](../../tests/README.md)
- [Code `v2`](https://github.com/aym2020/LuxApp/tree/v2/public)
