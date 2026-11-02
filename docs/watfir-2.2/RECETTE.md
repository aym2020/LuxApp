# Recette de la direction artistique Watfir 2.2

**Statut : intégration V4 effectuée sur `2.2` ; validations logiques limitées dans le contexte d'édition, et tests Node dédiés ajoutés sous `test/watfir-home.test.cjs`. Ni navigateur réel ni Samsung ne sont encore validés.** La présente checklist est un plan de recette, et **aucune case n'est considérée validée**.

## A. Vérifications des assets (possibles sans implémentation)

- [x] SVG XML valides, `viewBox` définis, aucun lien vers police ou ressource distante. *(hero, 02/11)*
- [ ] Symboles visibles sur fond noir et en réduction de 32/48/96 px ; traces distinctes.
- [x] Monument lisible, trois arches visibles ; aucun soleil ni façade détaillée. *(Chromium 320–1440, 02/11 ; Samsung à confirmer)*
- [ ] Palette identique entre planche SVG, tokens CSS et documentation.
- [ ] Textes d'illustration et véritables données applicatives distingués.

## B. Fonctionnel / navigation (après codage)

- [ ] Dashboard : valeurs de progression dynamiques, dernier chapitre réel.
- [ ] Changement A1.1 ↔ A1.2 → stats, leçons, examen et erreurs cohérents.
- [ ] Niveau A2.1 ajouté en test → accès par chevron, sélection persistée après relance.
- [ ] Famille B1 avec seul B1.1 → un seul bouton compact + chevron.
- [ ] Niveau indisponible → absent, aucune sélection fantôme.
- [ ] Persistance `luxNiveau` et profils de progression `luxProgress:user:<id>` / anonymous intacts.
- [ ] Retour depuis une leçon, examen, jeu et chemin correct.
- [ ] Connexion, déconnexion et sync inchangés ; ne jamais afficher du faux succès.
- [ ] Hors ligne : contenu / assets en cache uniquement après validation des mécanismes PWA existants.

## C. Dimensions et accessibilité

| Configuration | Attendu |
| --- | --- |
| 320×568 Android, zoom 100 % | Aucun débordement horizontal, CTA atteignable |
| 360×640 Android | Header lisible, niveaux accessibles, navigation visible |
| 393×~760 Samsung | Composition proche de la référence V4 sans troncature |
| 430×932 | Hiérarchie et densité cohérentes |
| 720px et desktop | Shell recentré, hero sans étirement excessif |
| Police Android 150–200 % | CTA et niveaux non superposés, labels lisibles |
| TalkBack / clavier / Escape | Ordre du focus, rôle modal, fermeture et restitution du focus |
| Retour Android depuis sheet | Ferme la feuille avant toute navigation arrière |
| Motion réduit | Pas de mouvement forcé ou scintillement |
| Orientation paysage / clavier | Accès maintenu au contenu et aux actions |

## D. Contraste et sémantique

- [ ] Texte crème/noir conforme au contraste cible pour sa taille.
- [ ] Texte noir du CTA crème lisible à 200 %.
- [ ] Rouge identité distinct du rouge erreur ; erreur signalée aussi par icône/texte.
- [ ] Indicateur actif du switch compréhensible sans perception des couleurs.
- [ ] Le cyan d'accent n'est pas utilisé pour un contenu critique de petite taille sans vérification.

## E. Procédure de livraison

1. Capturer état de départ réel de la branche avant modification et état après, mêmes appareils et mêmes données.
2. Lancer tests existants `node --test` et les suites critiques référencées dans `AGENTS.md` et `docs/RECETTES-2.1.md`. Pour les jeux : recettes particulières, dont SPEC 110/113/116.
3. Contrôler réellement sur Chrome mobile / Samsung : scroll, gestuelle, touch targets, clavier, retour, zoom, focus.
4. Comparer chaque écran aux invariants 2.1 et aux attentes V4 ; documenter les écarts acceptés.
5. Ne fusionner la DA qu'après validation explicite, écran par écran. Aucun changement à `main` ou `2.1` sans instruction.

**Règle anti-régression :** pour cette livraison documentaire, ne pas modifier `public/`, `data/`, la PWA, les moteurs, ni les sauvegardes.
