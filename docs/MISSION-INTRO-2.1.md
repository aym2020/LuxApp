# LuxApp 2.1 — Introduction de mission (maquette 2)

Date : 21 octobre 2026  
Branche : `2.1`  
Statut : intégré ; recette visuelle sur Samsung à confirmer.

## Intention

L’introduction de mission est une courte mise en situation avant le parcours des unités. L’ancienne version empilait un gros cadre orange « À la fin, tu sauras », puis un vide central artificiel avant les trois actions. La refonte privilégie une composition éditoriale, avec un objectif souligné par un trait ambre et une seule action principale jaune.

### Hero photographique

L’image `public/art/mission-objets-trouves-v21.webp` est une scène générée pour **la mission « Aux objets trouvés » (leçon 3)** : sac, bouteille et effets personnels oubliés dans un bus. Le fichier est un **WebP sans interface ni texte superposé**, recadré depuis le visuel approuvé ; version affichée en 1 024 × 412 px, environ 11,4 Ko, issue de la source originale plus détaillée et légèrement accentuée. L’empreinte binaire Git du WebP a été vérifiée à l’identique après upload. Il est placé en premier sous la navigation, dans une zone de hauteur limitée et avec dégradé sombre afin d’assurer la continuité du fond de l’application.

Le hero est volontairement **conditionnel à la leçon 3 ET au titre « objets trouvés »**, afin de ne pas afficher une photographie de bus sur une mission sans rapport. Les autres introductions conservent leurs textes sans photo en attendant une illustration pertinente. Aucun décor n’est encodé dans le texte pédagogique.

### Changements d’interface

- Les titres restent en Instrument Serif, le corps en Inter, sur le noir chaud `#0f0e0c`.
- Le contexte et les objectifs de chaque mission sont conservés à l’identique, depuis les données de la leçon.
- Le cadre de l’objectif est remplacé par une fine ligne verticale jaune/ambre ; aucun fond orange.
- Les informations « N unités » et « N répliques » sont séparées en deux colonnes compactes et restent dynamiques.
- Le bouton jaune « Commencer → » conserve `confirmerIntroMission()`.
- « Voir les unités » et « Tenter la mission » sont disposés côte à côte comme liens textuels secondaires et gardent respectivement `voirUnitesDepuisIntro()` et `tenterDepuisIntro()`.
- La disposition supprime `margin-top:auto` et le footer sticky responsable du grand vide intermédiaire. Sur les petits écrans ou avec police agrandie, l’introduction défile dans son conteneur sans recouvrir les actions.
- « Passer », le retour, le démarrage direct, la mémorisation de l’introduction et les branches studio ne sont pas modifiés.

## Fichiers

| Fichier | Modification |
|---|---|
| `public/art/mission-objets-trouves-v21.webp` | Hero léger en WebP, distinct du HTML |
| `public/mission.js` | Rendu conditionnel du hero et composition des statistiques |
| `public/mission-intro-v21.css` | Styles limités à `#view-msintro` |
| `public/index.html` | Déclaration du CSS |
| `test/mission-intro-v21.test.cjs` | Tests du hero, des actions et de l’accessibilité |

## Recette Android

1. Ouvrir l’introduction de la leçon 3 : photo en haut, titre lisible, contenu complet, ligne jaune à gauche de l’objectif.
2. Ouvrir l’introduction de la leçon 1 : aucune image de bus affichée par erreur.
3. Tester « Commencer », « Passer », « Voir les unités » et « Tenter la mission ». Retour Android : restitution de l’écran précédent.
4. Vérifier un petit téléphone, une police agrandie, un scénario long et le passage portrait/paysage : aucun texte masqué, défilement possible.
5. Vérifier que les actions n’enregistrent pas de validation prématurée et que le score d’une mission reste inchangé.

Tests statiques : `node --test test/mission-intro-v21.test.cjs`. Ils ne remplacent pas une vérification graphique sur appareil.

## Liste compacte des écrans

- [x] Détail de la leçon
- [x] Introduction de mission (intégration réalisée, recette Android en attente)
- [ ] Introduction d’unité
- [ ] Panneau Cours pendant les exercices

Le « Nouveau mot » et le lexique ne nécessitent pas de refonte prioritaire.

## Finitions après recette Samsung

Le premier asset de 400 × 198 px était trop petit pour la densité de l’écran : il a été remplacé par un **WebP 1 024 × 412 px** plus détaillé, issu de la scène de bus d'origine (interpolation modérée ; la définition intrinsèque de l'image générée ne peut pas dépasser la source). Le cache est explicitement invalidé avec `?v=hd1024` dans l’URL du hero et `?v=2` pour la feuille de style.

Les deux actions secondaires occupent désormais **une seule ligne**, sous le CTA jaune. Le titre de la seconde action est raccourci en « Tenter la mission », sans changement de fonction. Les zones tactiles restent d’au moins 44 px et les libellés peuvent se répartir selon la largeur de l’écran. Le défilement local et la marge basse sont conservés pour les petits écrans ou polices agrandies.
