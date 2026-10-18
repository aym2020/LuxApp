# SPEC 46 — Acquis de l'ancienne version : distincts des unités réellement terminées

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** (affichage trompeur sur les comptes existants) |
| Branche | `v2` |
| Périmètre | `public/niveau.js`, `public/chemin.js`, `public/app.js`, `public/accueil.js`, `public/parcours.js`, `public/style.css`, tests |
| Origine | Compte de Clayton, 19/10/2026 : la Leçon 21 « Les prépositions de lieu » apparaît « Terminée » alors qu'aucune de ses nouvelles unités n'a été faite |

## Cause

`etapesFaites(l)` renvoyait **toutes** les étapes dès que `acquisV1(l)` était vrai. Une leçon validée en v1 passait donc pour complète dans le nouveau parcours : statut « Terminée », bouton « Revoir », 100 % dans la progression, et 1 « unité terminée » fictive dans « Plus ».

## Trois états distincts

1. **Acquise historiquement** : `acquisV1(l)`, l'ancienne leçon validée selon les règles v1 (inchangé).
2. **Unités réellement terminées** : `getUnitBest()` ; `etapesFaites(l)` ne compte plus que les unités du fil faites et la mission réussie.
3. **Complète dans le nouveau parcours** : `leconCompleteV2(l)`, toutes les étapes v2 réellement faites.

`acquiseAncienneVersion(l)` vaut 1 sans 3, hors validation par la mission et hors fin d'avant la spec 32 : ces deux cas gardent leur affichage propre.

## Règles

- `leconTerminee(l)` reste vrai pour un acquis v1. La leçon reste acquise : le parcours, la prochaine étape et l'accès aux leçons suivantes ne changent pas, rien n'est à refaire.
- Chemin :
  - statut **« Acquise · v1 »**, plus l'avancement réel s'il existe (ex. « · 1/3 ») ;
  - aucune étoile ni coche sur les unités non faites ;
  - bouton **« Faire les nouvelles unités »** (1re unité non faite), ou « Jouer la nouvelle mission » si seules les unités sont faites ;
  - en-tête : pastille « N acquise(s) · v1 », séparée des leçons terminées.
- Liste des unités : « NOUVELLE · LEÇON ACQUISE (V1) » sur les unités non faites.
- Indicateurs :
  - **Progression %** : pour ces leçons, seules les étapes réellement faites comptent (plus de 100 % artificiel). Les leçons validées par la mission comptent toutes leurs étapes, comme avant (spec 32) ;
  - **Leçons** : « terminées / total · +N v1 » ;
  - **Plus** : « unités terminées » ne compte que les vraies unités, avec une tuile à part « leçons acquises · v1 ».
- Une fois toutes les unités et la mission faites, la leçon redevient simplement « Terminée » (« Revoir »).

## Sécurité des données

Aucune écriture : seuls le calcul d'affichage et les compteurs changent. Les anciens scores (`progress[id].quiz/trous/ecriture`, ids < 1000), les statistiques, les ids de leçons et la synchronisation cloud restent intacts. Aucune migration.

## Critères d'acceptation

- [x] Compte v1 sans unité v2 : « Acquise · v1 », « Faire les nouvelles unités », 0 unité, 0 %, pastille et tuile dédiées, leçon toujours acquise, données identiques avant et après.
- [x] Compte partiellement avancé : « v1 · 1/3 », 1 unité comptée, pourcentage réel.
- [x] Compte ayant tout fait en v2 : « Terminée », « Revoir », comptée comme terminée.
- [x] v1 + mission réussie : « Validée par la mission » conservé.
- [ ] Vérification sur le compte réel de Clayton.

## Tests

- `tests/test_acquis_v1.py` (nouveau, dans la suite critique) : les trois comptes et le cas de la mission réussie.
- `tests/test_lot1.py` : tuiles de « Plus » adaptées.
- Suite critique verte.
