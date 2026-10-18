# SPEC 29 — Mon chemin : lignes compactes et statuts sans débordement

| Champ | Valeur |
|---|---|
| Statut | **À faire — non implémentée** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre prévu | `public/chemin.js`, `public/style.css` ; composants/tokens existants si nécessaire |
| Origine | Capture Android « Mon chemin », leçon 1, et maquette comparative validée pour formalisation le 18/10/2026 |

## Constat

Dans la carte ouverte de « Mon chemin », la mention turquoise « Révision en cours » a été ajoutée à la même ligne flex que la coche, le nom de l'unité, les étoiles et le chevron. Les étiquettes `.tag` sont non rétractables et sur une seule ligne ; elles absorbent la largeur disponible au détriment de `.nom`. Sur la capture, `1 · Saluer` se fragmente sur plusieurs lignes.

La ligne « Mission · Premier cours de luxembourgeois » est également trop haute : l'intitulé se retrouve comprimé entre l'icône, « Sans faute » et le chevron. La carte apparaît plus longue que nécessaire, alors que les informations sont utiles et doivent être conservées.

**Objectif :** mieux distribuer l'espace horizontal pour réduire la hauteur des lignes et garder les libellés lisibles, sans réduire globalement les caractères ni masquer des informations pédagogiques.

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
- Compacter raisonnablement les espacements horizontaux (par exemple utiliser le token `--sp-2`, 8 px, au lieu de 12 px dans les lignes concernées), sans toucher aux zones tactiles ni supprimer les marges de lisibilité.
- Ne pas changer inutilement le haut de page, la frise verticale, les cartes repliées ou la navigation inférieure : **périmètre ciblé sur le contenu d'une carte ouverte**.

## Règles d'implémentation

- Séparer dans `etapesLeconHtml()` (fichier `public/chemin.js`) le bloc **titre + statut éventuel** de la zone **étoiles/statut secondaire + chevron**, afin que le titre ne se retrouve plus en concurrence horizontale avec « Révision en cours ». Une structure interne dédiée (par exemple conteneur de texte à `min-width: 0`) est préférable à un correctif uniquement par `font-size`.
- Adapter les règles CSS spécifiques à `.unites` dans `public/style.css`. Examiner leur ordre de cascade : des règles tardives rétablissent actuellement le retour à la ligne de `.nom` et `flex: none` sur les `.tag` ; ne pas ajouter un correctif contradictoire non documenté.
- Réutiliser **les tokens du design system** (Inter, or pour l'action, vert pour acquis, turquoise pour révision). Si une nouvelle règle globale est introduite, documenter son effet dans `docs/DESIGN_SYSTEM.md` lors de l'implémentation.
- Les étoiles continuent à refléter le **meilleur score acquis**. Les états de la SPEC 27 et la séparation partie principale/révision libre de la SPEC 22 restent inchangés.
- Conserver un seul bouton interactif par ligne, une zone tactile d'au moins **44 px**, une lecture cohérente par technologies d'assistance et aucune dépendance exclusive à la couleur.

## Critères d'acceptation / recette

- [ ] Sur Android, dans la leçon 1 de la capture, `1 · Saluer` se lit d'un bloc sur la première ligne, « Révision en cours » apparaît juste dessous, et les 3 étoiles restent à droite.
- [ ] Les unités 2 et 3 gardent leurs titres complets, leurs étoiles et leur coche ; l'unité 4 reste clairement l'étape recommandée.
- [ ] La mission « Premier cours de luxembourgeois » ne se retrouve plus dans une colonne étroite d'un ou deux mots ; `Sans faute` reste visible et lisible.
- [ ] La ligne Bilan, le bouton « Reprendre » et « Voir toute la leçon » restent visibles, cliquables et sans chevauchement.
- [ ] Tester des largeurs CSS de **320, 360, 393 et 430 px**, ainsi qu'un agrandissement de texte Android ; aucune coupure de titre, aucun défilement horizontal et aucun élément superposé. En largeur extrême, une ligne supplémentaire est acceptable si l'information reste entière.
- [ ] Contrôler les états **aucune révision**, **révision en cours**, **unité terminée 1/2/3 étoiles**, **unité recommandée**, **mission avec/sans statut** et **bilan** ; vérifier les titres particulièrement longs.
- [ ] Vérifier que les données `luxParcours` / `luxParcoursLibre`, les scores, la progression, le cloud, la navigation et l'accordéon n'ont pas changé.
- [ ] Comparer une capture réelle avant/après sur le même téléphone ; la carte doit être plus compacte **sans** réduire la taille générale du texte.

## Hors périmètre

- Refonte graphique complète du chemin, changement de thème, tailles de police globales, refonte du menu inférieur.
- Changement de textes pédagogiques, règles de notation, durée des sessions, missions, données JSON ou logique de reprise.
- Modification du comportement de l'anneau doré, des étoiles, des états de progression ou du statut « Sans faute ».

## Implémentation et suivi

- **Non implémentée à la création de cette fiche.** Cette livraison concerne exclusivement la spécification et le registre.
- À l'implémentation : compléter ici les fichiers modifiés, les tests réalisés, les captures avant/après et les anomalies résiduelles. Passer à « Implémentée — validation à confirmer » seulement après présence du code ; à « Validée » seulement après recette.
- Références : [SPEC 17 — Lisibilité](./SPEC-17.md), [SPEC 22 — Révision libre](./SPEC-22.md), [SPEC 27 — États d'unité](./SPEC-27.md), [Design system](../DESIGN_SYSTEM.md).
