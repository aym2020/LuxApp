# LuxApp — Registre des spécifications

Ce répertoire contient **89 fiches de spécification présentes** sur la branche `2.1` (01 à 81 et 87 à 94, au 23 octobre 2026). Les numéros **82 à 86 sont absents** du dépôt : ne pas leur inventer de contenu. Le tableau ci-dessous indexe **toutes les fiches actuellement présentes** ; leur statut est une information documentaire, pas une preuve de recette. Source de référence : discussions de cadrage, implémentation dans le dépôt `v2`, [playbook](../../PLAYBOOK.md) et [design system](../DESIGN_SYSTEM.md).

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
| 54 | [Chemin : numéro de leçon au-dessus du titre](./SPEC-54.md) | P1 | Implémentée — validation à confirmer |
| 55 | [Introduction privilégiée et aperçu libre des unités](./SPEC-55.md) | P1 | Implémentée — validation à confirmer |
| 56 | [Corriger le bouton Valider des erreurs fréquentes](./SPEC-56.md) | P0 | Implémentée — validation à confirmer |
| 57 | [Feedback tactile de pression sur les boutons CTA](./SPEC-57.md) | P2 | Implémentée — validation à confirmer |
| 58 | [Rattrapage de la troisième étoile et retrait des points V1](./SPEC-58.md) | P1 | Implémentée — validation à confirmer |
| 59 | [Correction visible après Valider en écriture et Erreurs fréquentes](./SPEC-59.md) | P0 | Implémentée — validation à confirmer |
| 60 | [Chemin compact : Améliorer mes résultats et correction ciblée](./SPEC-60.md) | P1 | Implémentée — validation à confirmer |
| 61 | [Minuscules dans les tuiles, majuscules automatiques](./SPEC-61.md) | P1 | Implémentée — validation à confirmer |
| 62 | [Compte visible et protection de la progression invitée](./SPEC-62.md) | P0 | Implémentée — validation à confirmer |
| 63 | [Accueil de bienvenue, alerte invitée centrée et reconnexion](./SPEC-63.md) | P0 | Implémentée — validation à confirmer |
| 64 | [Portail compact, cohérence graphique et bienvenue à chaque nouveau lancement invité](./SPEC-64.md) | P1 | Implémentée — validation à confirmer |
| 65 | [Bienvenue chaleureuse et popup invité centrée](./SPEC-65.md) | P1 | Remplacée par SPEC 66 |
| 66 | [Accueil interactif, audio, transitions, dialogues LuxApp et Retour Android](./SPEC-66.md) | P1 | Implémentée — validation à confirmer |
| 67 | [Ligne de compte sur l'accueil invité](./SPEC-67.md) | P1 | Implémentée — validation à confirmer |
| 68 | [Bouton « Écouter » partout où un mot isolé est présenté](./SPEC-68.md) | P1 | Implémentée — validation à confirmer |
| 69 | [Sons LOD : correspondances vérifiées, relance autonome, phrases enregistrées](./SPEC-69.md) | P1 | Implémentée — phrases en attente d'accès à lod.lu |
| 70 | [Stratégie audio LOD prioritaire : audit, audio contextuel, leçons construites sur les exemples LOD](./SPEC-70.md) | P1 | Implémentée — audit à valider ; phrases en attente d'accès à lod.lu |
| 71 | [Prononciation en contexte : bulle flottante et écran d'exemples](./SPEC-71.md) | P1 | Implémentée — s'active avec les phrases LOD |
| 72 | [Finaliser la SPEC 71 : procédure Termux, couleurs gris sable / doré, audit d'enrichissement leçons 1–3](./SPEC-72.md) | P1 | Implémentée — 73 phrases LOD en ligne ; audit en attente |
| 73 | [Corriger les faux absents LOD et améliorer les correspondances audio](./SPEC-73.md) | P1 | Phase B livrée par lots — corrections orthographiques en attente de décision |
| 74 | [Résultat d'annale : Terminer prioritaire, Refaire ce sujet secondaire](./SPEC-74.md) | P2 | Implémentée — recette Android à confirmer |
| 75 | [Cours des leçons 1–3 : Règles / Lexique / Phrases](./SPEC-75.md) | P1 | À implémenter — maquette leçon 2 déposée |
| 76 | [Progression en mode invité](./SPEC-76.md) | — | Implémentée sur v2 — recette Android à confirmer |
| 77 | [Accueil invité stable sur Android](./SPEC-77.md) | — | Implémentée sur v2 — recette Android à confirmer |
| 78 | [Salutations alternatives](./SPEC-78.md) | P1 | Implémentée sur v2 — recette Android à confirmer |
| 79 | [Leçon 0 : prononciation LOD](./SPEC-79.md) | — | Implémentée sur v2 — recette Android à confirmer |
| 80 | [Audit pédagogique leçon 0](./SPEC-80.md) | — | Implémentée sur v2 — recette Android à confirmer |
| 81 | [Lecture audio en quiz](./SPEC-81.md) | — | Implémentée sur v2 — recette Android à confirmer |
| 87 | [Stabilisation UX des exercices sur mobile (branche 2.1)](./SPEC-87.md) | P1 | Implémentée — recette Samsung à faire |
| 88 | [Accueil fixe, Jeux et Survie](./SPEC-88.md) | — | Première version 2.1 — recette à confirmer |
| 89 | [Deux modes Survie et compétition](./SPEC-89.md) | P1 | Conception non implémentée — révisée par SPEC 92 |
| 90 | [Roguelite, pouvoirs et Tempête](./SPEC-90.md) | P1 | Candidats non implémentés — révisés par SPEC 92 |
| 91 | [Simulation et équilibrage autonome](./SPEC-91.md) | P1 | Simulateur V0 indépendant en CI, à aligner sur SPEC 92 |
| 92 | [Survie Feu et Tempête](./SPEC-92.md) | P1 | Étape 1/4 codée — recette Samsung à faire |
| 93 | [PWA hors ligne](./SPEC-93.md) | — | Proposition à implémenter — non développée |
| 94 | [Feedback unifié, audio et parité de composants UI](./SPEC-94.md) | P1 | **Lot 1 codé** (choix/sons Quiz/Trous) ; **lot 2 spécifié et validé comme cible de conception**, non codé (bandeau plat, 3 sons, Mot caché, Écriture) ; Samsung à faire |

## Précautions de lecture

- Les fiches 01–22 reconstruisent en partie des décisions antérieures ; vérifier le code de la branche réellement visée avant toute modification.
- La SPEC 65 est **remplacée par la SPEC 66** ; elle reste dans la numérotation pour l'historique.
- Les SPEC 89 et 90 sont des **conceptions futures**, révisées par la SPEC 92. La SPEC 91 est une simulation qui ne vaut pas comportement du jeu public.
- Les numéros 82 à 86 sont absents de l'arbre de fichiers actuel, **sans conclusion sur leur existence historique**.
- Le préfixe `v2` d'une fiche ancienne ne signifie pas validation du comportement ou des styles sur la branche `2.1`.

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

## Évolution Survie 2.0 — rappel

Pour les règles actuellement implémentées, lire [SPEC 88](SPEC-88.md). Les [SPEC 89](SPEC-89.md) et [SPEC 90](SPEC-90.md) décrivent des projets non livrés dont une partie a été remplacée par [SPEC 92](SPEC-92.md). Le simulateur indépendant est documenté dans [SPEC 91](SPEC-91.md). **Ne jamais confondre une règle simulée et le jeu réel.**

Retour à l'[index de la documentation](../README.md).
