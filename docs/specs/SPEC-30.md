# SPEC 30 — Mon chemin homogène et compact, en-tête de mission sans troncature

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `public/chemin.js`, `public/mission.js`, `public/index.html`, `public/style.css` |
| Origine | Maquette comparative « Mon chemin / écran de leçon » et retour du 18/10/2026, après la SPEC 29 |

## Exigences

- **Mission et bilan homogènes** : même structure (icône · texte · statut discret · chevron). « Sans faute » et « Facultatif » ont le même style sobre, à droite ; sur carte étroite, les deux passent sous leur titre ensemble.
- **Carte moins haute** : espacements verticaux réduits, icônes d'état légèrement plus petites (22 px au lieu de 24), sans toucher à la taille du texte ni aux zones tactiles de 44 px.
- **Statuts secondaires sobres** : plus de pastille bordée ; « Mission » en petit libellé or au-dessus du titre, titre de mission en texte secondaire.
- **En-tête de mission** : le titre de la mission en entier (deux lignes au plus, points de suspension seulement au-delà), vies et progression dessous, Contexte et Cours à droite. Avatar et liste des personnages retirés de l'en-tête (les noms restent dans les bulles).
- Conserver : titres complets, étoiles à droite, « Révision en cours » turquoise sous le titre, accent doré de l'unité recommandée, bouton principal.

## Critères d'acceptation

- [x] À 393 px, « Sans faute » et « Facultatif » sont à droite de leur texte, même style ; à 360 px, les deux passent sous leur titre.
- [x] Aucun chevauchement, aucun défilement horizontal de 320 à 430 px et en texte agrandi.
- [x] En-tête de mission : « Premier cours de luxembourgeois » lisible en entier à 320 et 393 px.
- [ ] Recette sur téléphone Android réel.

## Implémentation et suivi

- `public/chemin.js` : mission et bilan avec `.texte` (libellé `.sur` + `.nom`) et `.tag.statut`.
- `public/style.css` : bloc « MON CHEMIN : LIGNES COMPACTES (specs 29 et 30) » regroupé (icônes 22 px, marges verticales 2 px, `.statut`), requêtes de conteneur 16 em (statuts mission + bilan sous le titre) et 13 em (étoiles et statuts sous le titre) ; en-tête `.ms-chat-tete` 56 px minimum, `.ms-tete-etat`.
- `public/index.html`, `public/mission.js` : en-tête de mission sans avatar ni sous-titre, titre = titre de la mission.
- Hauteur de la liste des unités (leçon 1, révision en cours) : 393 px 292 → 271 ; carte complète 464 px.
- Tests : `tests/test_chemin_lignes.py` (homogénéité mission/bilan, en-tête de mission) ; suite critique verte.
