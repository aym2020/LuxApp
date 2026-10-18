# SPEC 45 — Tout retour depuis un écran de résultat mène au Chemin, leçon dépliée

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Branche | `v2` |
| Périmètre | `public/parcours.js`, `public/mission.js`, `public/navigation.js`, tests |
| Origine | Recette Android de Clayton du 18/10/2026 (mode recette) : « Retour à la leçon » depuis une fin d'unité ou de mission renvoyait à la liste des unités |
| Étend | [SPEC 44](./SPEC-44.md) §1 (jusqu'ici réservé à « Refaire mes erreurs ») ; remplace sur ce point la [SPEC 25](./SPEC-25.md) |

## Règle

Depuis **tout écran de résultat** (fin d'étape, fin d'unité, fin de rattrapage, bilan de mission, résultat de « Tente ta chance »), le retour mène au **Chemin principal**, avec la leçon :
- dépliée **seule** (unités, progression, étoiles, « Continuer ») ;
- cadrée sous le haut de l'écran et au-dessus de la barre du bas, sans déplacement ultérieur.

Jamais à la liste des unités de la leçon.

Cette règle vaut pour :
- le bouton **« Mon chemin »**, qui remplace « Retour à la leçon » en fin de partie et « Retour · Leçon N » en fin de mission ;
- la **flèche Retour** de la mission une fois le bilan affiché ;
- le **Retour Android** ou navigateur.

**Inchangé :**
- pendant un exercice ou une mission en cours, Retour ramène à l'écran de départ (liste des unités ou chemin), comme avant ;
- « Unité suivante », « Jouer la mission », « Leçon suivante », « Rejouer la mission », « Refaire mes erreurs », « Élargir » et « Accueil » ne changent pas.

## Implémentation

- `parcours.js` :
  - `suiteFin()` : l'action « retour » est « Mon chemin » (`cheminSurLecon`) pour tous les modes ;
  - `boutonsFinHtml()` : le bouton secondaire « Retour à la leçon » devient « Mon chemin ».
- `mission.js` :
  - bilan de mission : « Retour · Leçon N » devient « Mon chemin » ;
  - la flèche annonce « Retour à Mon chemin ».
- `navigation.js` : `retour()` depuis `view-pfin`, ou depuis la mission dont le bilan est affiché, appelle `cheminSurLecon()` au lieu de restaurer l'historique.

## Critères d'acceptation

- [x] Fin d'étape → « Mon chemin » : chemin, leçon seule dépliée et cadrée.
- [x] Fin d'étape → Retour du téléphone : idem.
- [x] Fin de mission → « Mon chemin », et flèche Retour : idem.
- [x] Exercice ou mission en cours → Retour : liste des unités, comme avant.
- [ ] Recette Android réelle.

## Tests

- `tests/test_retours.py` : cas 2 et 3 mis à jour (chemin au lieu de la liste des unités), nouveau cas 5 bis (fin de mission, bouton et flèche).
- `tests/test_fil.py` (avant fusion dans `main`) : adapté au bouton « Mon chemin ».
- Suite critique verte.
