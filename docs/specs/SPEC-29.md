# SPEC 29 — Mon chemin : lignes compactes et statuts sans débordement

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre prévu | `public/chemin.js`, `public/style.css` ; composants/tokens existants si nécessaire |
| Origine | Capture Android « Mon chemin », leçon 1, et maquette comparative validée pour formalisation le 18/10/2026 |

## Constat

Dans la carte ouverte de « Mon chemin », la mention turquoise « Révision en cours » a été ajoutée à la même ligne flex que la coche, le nom de l'unité, les étoiles et le chevron. Les étiquettes `.tag` sont non rétractables et sur une seule ligne ; elles absorbent la largeur disponible au détriment de `.nom`. Sur la capture, `1 · Saluer` se fragmente sur plusieurs lignes.

La ligne « Mission · Premier cours de luxembourgeois » est également trop haute : l'intitulé se retrouve comprimé entre l'icône, « Sans faute » et le chevron. La carte apparaît plus longue que nécessaire, alors que les informations sont utiles et doivent être conservées.

**Objectif :** mieux distribuer l'espace horizontal pour réduire la hauteur des lignes et garder les libellés lisibles, sans réduire globalement les caractères ni masquer des informations pédagogiques.

## Maquette fonctionnelle de référence

L'objectif est de conserver toutes les informations de la capture dans une carte **moins haute**, sans comprimer le nom des activités. Exemples de disposition à largeur mobile courante (schéma de structure, non spécification pixel-perfect) :

\`\`\`text
[✓]  1 · Saluer                    ★★★  ›
     ↻ Révision en cours

[✓]  2 · Demander comment ça va    ★★★  ›
[✓]  3 · Se présenter              ★★☆  ›
[◉]  4 · Prendre congé                  ›

[▣]  Mission                  Sans faute  ›
     Premier cours de luxembourgeois

[◎]  Bilan · 10 questions    facultatif  ›

[              Reprendre →              ]
          Voir toute la leçon →
\`\`\`

À largeur plus étroite, avec un titre long ou avec le texte agrandi, la colonne textuelle prend la priorité. L'information secondaire (notamment \`Sans faute\` ou \`facultatif\`) **descend sous le titre**, au lieu de lui laisser une colonne illisible ; les étoiles des unités restent visibles. Il ne faut pas imposer artificiellement une hauteur fixe.

**Ordre de priorité visuelle :**
1. Identifier l'activité sans effort (numéro + titre complet).
2. Reconnaître l'état (coche, anneau recommandé, étoiles, statut de mission).
3. Signaler une révision interrompue comme information **secondaire** turquoise, sur une ligne dédiée seulement lorsqu'elle existe.
4. Garder le chevron et toute la ligne cliquable. Ne pas ajouter de commandes supplémentaires.

La maquette montre des séparations discrètes autour de Mission et Bilan. Elles sont facultatives si elles alourdissent la carte à 320 px : la lisibilité et la compacité passent avant le décor.

## Comportement attendu

### 1. Unités du fil

- Conserver à gauche l'état de l'unité (coche verte, anneau doré ou état neutre), à droite les étoiles acquises et le chevron. Ces éléments ne doivent ni chevaucher ni tronquer le titre.
- Placer le numéro et le **titre de l'unité sur la ligne principale** : exemple `1 · Saluer`. La zone du texte doit être prioritaire et pouvoir occuper toute la largeur restante.
- Quand une révision libre interrompue existe pour cette unité, placer **« ↻ Révision en cours » sous le titre**, en texte secondaire turquoise, aligné avec le début du titre ; jamais entre le numéro et le nom, jamais à la place des étoiles.
- S'il n'y a pas de révision, ne réserver **aucune ligne vide** au statut.
- Une unité courante non terminée, telle que `4 · Prendre congé`, conserve son accent doré et ne devient pas l'unité recommandée parce qu'une ancienne unité est en révision.
- Afficher un libellé long entièrement, sur plusieurs lignes si nécessaire ; **ne jamais le tronquer pour forcer un nombre de lignes**.

### 2. Mission

- Dans la même ligne cliquable, présenter un petit libellé **« Mission »** au-dessus du titre complet **« Premier cours de luxembourgeois »**. La hiérarchie typographique doit distinguer le type d'activité de son nom.
- Garder le statut `Sans faute` / `Réussie` / `À rejouer` / progression `n/10` (selon le cas) comme information secondaire. À largeur normale, le statut peut être présenté en pastille sobre à droite du titre ; à largeur étroite ou avec police agrandie, le déplacer sous le titre plutôt que réduire celui-ci à un mot par ligne.
- Garder l'icône de conversation et le chevron ; la mission reste accessible d'un appui sur **toute** la ligne. Éviter une deuxième action concurrente dans cette ligne.

### 3. Bilan et bas de carte

- Préserver `Bilan · 10 questions` et `facultatif` avec le même principe : titre prioritaire, mention secondaire qui s'adapte si nécessaire.
- Conserver le bouton principal **« Reprendre »** et le lien **« Voir toute la leçon »**. Ne pas introduire un nouveau CTA ni changer leur destination.
- Compacter raisonnablement les espacements horizontaux : privilégier le token `--sp-2` (8 px) au lieu de 12 px **entre éléments d'une ligne**, sans réduire la zone cliquable ni supprimer les marges de lisibilité. Les lignes restent à hauteur naturelle avec **minimum 44 px**. Une unité sans statut et au titre court doit tenir sur une seule ligne.
- Ne pas changer inutilement le haut de page, la frise verticale, les cartes repliées ou la navigation inférieure : **périmètre ciblé sur le contenu d'une carte ouverte**.

## Règles d'implémentation

- Séparer dans `etapesLeconHtml()` (fichier `public/chemin.js`) le bloc **titre + statut éventuel** de la zone **étoiles/statut secondaire + chevron**, afin que le titre ne se retrouve plus en concurrence horizontale avec « Révision en cours ». Utiliser une structure interne claire, de type **icône | contenu textuel flexible | récompense/statut | chevron**. Le contenu textuel doit pouvoir se rétracter (`min-width: 0`) et passer à la ligne ; les éléments secondaires ne doivent pas imposer de retours absurdes au titre. Préférer une adaptation responsive ciblée à un correctif uniquement par `font-size`.
- Adapter les règles CSS spécifiques à `.unites` dans `public/style.css`. Examiner leur ordre de cascade : des règles tardives rétablissent actuellement le retour à la ligne de `.nom` et `flex: none` sur les `.tag` ; ne pas ajouter un correctif contradictoire non documenté.
- Réutiliser **les tokens du design system** (Inter, or pour l'action, vert pour acquis, turquoise pour révision). Si une nouvelle règle globale est introduite, documenter son effet dans `docs/DESIGN_SYSTEM.md` lors de l'implémentation.
- Les étoiles continuent à refléter le **meilleur score acquis**. Les états de la SPEC 27 et la séparation partie principale/révision libre de la SPEC 22 restent inchangés.
- Conserver un seul bouton interactif par ligne, une zone tactile d'au moins **44 px**, une lecture cohérente par technologies d'assistance et aucune dépendance exclusive à la couleur. Le nom accessible du bouton doit inclure **titre complet + état utile**. Si le symbole `↻` est décoratif, le masquer aux lecteurs d'écran (`aria-hidden`) : la mention textuelle « Révision en cours » reste lisible.

## Critères d'acceptation / recette

- [ ] Sur Android, dans la leçon 1 de la capture, `1 · Saluer` se lit d'un bloc sur la première ligne, « Révision en cours » apparaît juste dessous, et les 3 étoiles restent à droite.
- [x] Les unités 2 et 3 gardent leurs titres complets, leurs étoiles et leur coche ; l'unité 4 reste clairement l'étape recommandée.
- [x] La mission « Premier cours de luxembourgeois » ne se retrouve plus dans une colonne étroite d'un ou deux mots ; `Sans faute` reste visible et lisible.
- [x] La ligne Bilan, le bouton « Reprendre » et « Voir toute la leçon » restent visibles, cliquables et sans chevauchement. Les libellés « Sans faute » et « facultatif » ne poussent jamais le titre dans une colonne d'un seul mot.
- [x] Tester des largeurs CSS de **320, 360, 393 et 430 px**, ainsi qu'un agrandissement de texte Android ; aucune coupure de titre, aucun défilement horizontal et aucun élément superposé. En largeur extrême, une ligne supplémentaire est acceptable si l'information reste entière.
- [x] Contrôler les états **aucune révision**, **révision en cours**, **unité terminée 1/2/3 étoiles**, **unité recommandée**, **mission avec/sans statut** et **bilan** ; vérifier les titres particulièrement longs.
- [x] Vérifier que les données `luxParcours` / `luxParcoursLibre`, les scores, la progression, le cloud, la navigation et l'accordéon n'ont pas changé.
- [ ] Comparer une capture réelle avant/après sur le même téléphone et à police identique ; la carte doit être plus compacte **sans** réduire la taille générale du texte. Vérifier que le gain vient des retours à la ligne supprimés et de la meilleure distribution de la largeur, pas d'une troncature.

## Hors périmètre

- Refonte graphique complète du chemin, changement de thème, tailles de police globales, refonte du menu inférieur.
- Changement de textes pédagogiques, règles de notation, durée des sessions, missions, données JSON ou logique de reprise.
- Modification du comportement de l'anneau doré, des étoiles, des états de progression ou du statut « Sans faute ».

## Implémentation et suivi

- **Implémentée sur `v2`**, recette sur téléphone réel à faire : critères 1 (Android) et 8 (capture avant/après sur le même téléphone) non cochés.
- `public/chemin.js` (`etapesLeconHtml`) : chaque ligne = état · texte (`.nom`) · statut (`.tag` : étoiles ou pastille `.pastille-statut`) · chevron, un seul bouton. « ↻ Révision en cours » (`.sous.revision`, icône `aria-hidden`) seulement s'il y a une révision libre. Mission : « Mission » (`.sur`) et son statut sur la 1re rangée, titre complet dessous. Numéro et titre liés par des espaces insécables. Nom accessible complet sur chaque bouton (ex. « 1 · Saluer, terminée, 3 étoiles sur 3, révision en cours » ; « Mission : Premier cours de luxembourgeois, Sans faute »).
- `public/style.css` : ligne en grille (`24px | 1fr | auto | 16px`), écart `--sp-2` au lieu de 12 px, marges verticales `--sp-1`, hauteur tactile 44 px conservée. 2e rangée sous le titre seulement si un statut existe (`:has(> .sous)`). Requêtes de conteneur en `em` (suivent l'agrandissement du texte Android) : carte < 18 em → pastille « Facultatif » sous le titre du bilan ; < 13 em (320 px, texte agrandi) → étoiles sous le titre. Règles tardives contradictoires supprimées (`.nom` sur une ligne puis rétabli, `.tag` `flex: none`). Séparateurs Mission/Bilan non ajoutés (facultatifs).
- Hauteur de la liste d'unités, leçon 1 (révision en cours sur l'unité 1, mission sans faute), même taille de texte : 320 px 413 → 324 ; 360 px 336 → 292 ; 360 px texte 130 % 545 → 413 ; 393 px 295 → 292 ; 430 px 273 → 267. Défilement horizontal supprimé à 320 px et en texte 130 %.
- Tests : `tests/test_chemin_lignes.py` (320/360/393/430 px, texte 130 %, les 24 leçons dépliées à 320 px, noms accessibles) ; suite critique verte.
- Écart assumé : à 393 px, « Facultatif » passe sous « Bilan · 10 questions » (la ligne ne tient pas à côté de la pastille).
- Références : [SPEC 17 — Lisibilité](./SPEC-17.md), [SPEC 22 — Révision libre](./SPEC-22.md), [SPEC 27 — États d'unité](./SPEC-27.md), [Design system](../DESIGN_SYSTEM.md).
