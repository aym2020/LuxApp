# LuxApp 2.1 — Scénario de mission (maquette 3)

Date : 21 octobre 2026  
Branche : `2.1`  
État : code intégré ; recette sur Android à confirmer.

## Objet

L'accès **« Voir le scénario »** depuis la carte Mission présentait l'ensemble du dialogue dans un panneau haut de 85 vh. Chaque réplique était une grande carte colorée avec une pastille « Unité N », un bouton audio et sa traduction. L'en-tête répétait tout le contexte et l'objectif de la mission, et le CTA « Jouer la mission » se trouvait à la fin des 20 répliques.

Le nouvel affichage est un **lecteur immersif plein écran**, distinct du jeu de mission. Ce choix ne modifie ni les contenus JSON, ni la progression, ni les règles de validation.

## Composition

- **En-tête fixe** : flèche de fermeture, `SCÉNARIO · LEÇON N`, titre de mission en Instrument Serif, nombre réel de répliques et nombre de répliques `qui === 'toi'`.
- **Zone centrale défilante** : une ligne par réplique, séparateur fin, nom du personnage et accent doré uniquement pour `TOI`. Luxem­bourgeois, traduction française et bouton audio restent affichés. Les unités sont indiquées à chaque changement dans la scène ; les repères individuels restent accessibles aux lecteurs d'écran.
- **Contexte facultatif** : `Rappel du contexte` est un bloc `<details>` fermé par défaut, contenant le contexte et l'objectif exacts de la mission. Leur présence est donc conservée, sans répétition forcée.
- **Pied fixe** : un seul CTA jaune **« Jouer la mission »** ou « Rejouer la mission ». Il est **toujours visible**, même après défilement de la scène, immédiatement au-dessus de la zone système Android. La zone de lecture possède son propre scroll et une réserve inférieure : la dernière réplique ne peut pas être cachée derrière le CTA.
- **Retour** : fermeture par flèche, touche Échap, bouton Android Retour ou voile sur grand écran, grâce au gestionnaire de panneau déjà existant. Pas de deuxième bouton « Fermer » en bas.

## Préservation des fonctionnalités

- `voirScenario()` conserve `studioVoirScenario()` pour les leçons du studio radio.
- Les répliques proviennent de `l.scene`. `bulleSceneHtml` garde `repliqueApprise`, `escHtml` et `boutonEcouterHtml(x.lu, true)`.
- Le CTA conserve la logique `fermerPanneau(); openMission(peutTenterSaChance(pLecon))` : une tentative anticipée reste une tentative, sans validation prématurée.
- `getMissionBest` reste l'unique critère pour afficher `Jouer` ou `Rejouer`.
- Les bulles du **jeu effectif** (`bulleJeuHtml`), le mécanisme des vies, les erreurs et les sauvegardes ne changent pas.
- Les autres panneaux partagent toujours le composant historique. Seule la classe `ms-v21-dialogue` active le mode plein écran.

## Fichiers

| Chemin | Modification |
|---|---|
| `public/mission.js` | Rendu du scénario, lignes légères, panneau plein écran, CTA conservé |
| `public/scenario-v21.css` | Styles isolés, hauteur viewport, zone défilante, entête et CTA fixes |
| `public/index.html` | Inclusion CSS dédiée |
| `test/scenario-v21.test.cjs` | Tests de répliques, audio, fermeture, CTA et mode studio |

## Recette Android

1. Ouvrir « Voir le scénario » sur la leçon 3 : en-tête et CTA visibles.
2. Faire défiler les 20 répliques jusqu'en bas : traduction et dernier audio visibles, CTA inchangé à sa place.
3. Écouter plusieurs répliques, y compris `TOI`. Vérifier que le lecteur audio est identique à l'ancien.
4. Déplier/replier le contexte ; revenir avec la flèche puis avec le bouton Retour Android.
5. Jouer directement puis terminer/abandonner la mission : progression et score inchangés.
6. Tester la mission 1, une mission déjà réussie, une leçon studio, un téléphone étroit, le mode paysage et la police agrandie.

Vérification statique : `node --test test/scenario-v21.test.cjs`. Le test réel du scroll tactile et de la zone de navigation Android reste nécessaire.

## To-do v2.1

- [x] Détail de la leçon
- [x] Introduction de mission
- [x] Scénario de mission (intégré, contrôle mobile à confirmer)
- [ ] Introduction d'unité
- [ ] Panneau Cours
