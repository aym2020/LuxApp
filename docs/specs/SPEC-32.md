# SPEC 32 — Mission réussie avec trois vies : validation de la leçon sans étoiles fictives

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Branche cible | `v2` |
| Périmètre | `public/mission.js`, `public/progress.js`, `public/niveau.js`, `public/chemin.js`, `public/accueil.js`, `public/parcours.js`, tests ciblés |
| Décision | Une mission terminée avec au moins une vie restante valide la leçon, quelle que soit la progression dans les unités. Aucune étoile d'unité inventée. |

> **Affichage complémentaire — SPEC 33 (à implémenter)** : une unité non jouée mais couverte par une mission réussie doit apparaître **visuellement validée en vert**, avec la mention « Validée par la mission », **sans étoiles et sans score fictif**. L'état visuel de validation du parcours ne doit pas être confondu avec l'achèvement réel de l'exercice. Les leçons acquises restent à leur position numérique dans « Mon chemin », sans regroupement « Terminées ».

## Problème constaté

Capture Android du 18/10/2026 : mission de la leçon 1 affichée **« Sans faute »**, mais unité 4 encore à faire ; la leçon reste « Commencée », l'étape 4 reste recommandée, et la leçon 2 ne devient pas la prochaine étape. La mission normale peut aujourd'hui être « réussie » (≥ 80 % d'autonomie et vie restante) sans déclencher `saveValideeMission()` ; seul le mode « Tente ta chance » peut valider la leçon, sous un seuil encore différent (90 %).

Ce double seuil brouille les règles du jeu. Avec dix répliques et trois vies, trois vraies erreurs sur trois répliques distinctes épuisent déjà les vies : le seuil de 80 % fait doublon avec ce mécanisme.

**Cette SPEC remplace, pour le comportement cible, les seuils de réussite de la SPEC 23 et la restriction de validation au seul mode « Tente ta chance ».** Les autres exigences de la SPEC 23 (dix réponses, trois vies, fautes de frappe gratuites reconnues, finir la conversation après échec) sont conservées.

## 1. Une règle de réussite commune

- Une mission comporte **10 réponses à produire par l'apprenant** et commence avec **3 vies**.
- Une véritable erreur de connaissance retire **1 vie au maximum par réplique**, même en cas de plusieurs essais incorrects sur la même réponse. Une coquille éligible et corrigée selon la SPEC 24 ne retire pas de vie.
- **À la fin de la conversation : au moins 1 vie restante = mission réussie ; 0 vie = mission échouée.** Aucun seuil de score supplémentaire (ni 80 %, ni 90 %).
- Lorsque les trois vies sont perdues, l'apprenant **peut finir la conversation en mode apprentissage**, mais la mission de cette tentative ne peut plus être gagnée, même si les réponses suivantes sont correctes.
- La même règle s'applique à la **mission normale** et à **« Tente ta chance »**. Ce dernier est un mode d'accès anticipé à la mission, non une autre définition de la réussite.
- Le pourcentage de réponses autonomes reste un **indicateur informatif** affiché dans le bilan, et non un critère indépendant de réussite. Ne pas plafonner artificiellement cet indicateur pour simuler une défaite : enregistrer explicitement réussite/échec.

Exemples pour dix réponses (sans coquilles gratuites) :

| Situation | Vies restantes | Résultat |
|---|---:|---|
| 10 réponses autonomes | 3 | Réussie, mission « Sans faute » |
| 9 réponses autonomes et 1 véritable erreur | 2 | Réussie |
| 8 réponses autonomes et 2 véritables erreurs | 1 | Réussie |
| 7 réponses autonomes et 3 véritables erreurs | 0 | Échouée, même si la conversation est terminée |
| Coquille reconnue et corrigée | Vies inchangées | Pas d'erreur pénalisante |

Le statut **« Sans faute » de la mission** ne vaut que pour une mission terminée sans erreur pénalisante, sans réponse révélée et avec toutes ses réponses autonomes. Il reste distinct de « Leçon sans faute ».

## 2. La mission est un véritable raccourci de leçon

- Dès qu'une mission est **réussie**, normale ou « Tente ta chance », la leçon est **validée pédagogiquement**, même si une ou plusieurs unités n'ont jamais été jouées.
- Passer la leçon à l'état **« Validée par la mission »** et la compter dans les leçons validées/terminées affichées sur l'accueil et le chemin. La **leçon suivante devient la recommandation** et l'action principale de fin affiche **« Leçon suivante »** ou un libellé équivalent sans ambiguïté.
- Une mission échouée n'accorde **aucun raccourci**. Dans une leçon dotée d'une mission, **l'avoir seulement jouée ne suffit pas** à satisfaire sa condition finale : le parcours classique repose sur les unités apprises puis sur la réussite de la mission.
- Un ancien run principal d'une unité non terminée **ne doit pas continuer à primer sur la leçon suivante** après validation par mission. Préserver les réponses et l'éventuelle reprise en entraînement libre, ou préserver la session sans en faire la recommandation principale ; ne pas l'effacer silencieusement.
- La leçon validée reste ouvrable. Les unités manquantes peuvent être réalisées volontairement après la validation ; elles ne doivent pas redevenir des étapes obligatoires.

## 3. Étoiles, coches et progression réelle : ne rien inventer

- **Aucune étoile ni coche ne doit être attribuée artificiellement aux unités non faites**, même après mission réussie à 100 %.
- Les unités déjà terminées conservent leurs meilleurs scores et leurs étoiles. Les unités non faites restent visibles et identifiables comme non faites, mais accessibles.
- Les **étoiles globales de la leçon** ne sont affichées/calculées comme acquis que lorsque **toutes les unités du fil** ont effectivement été terminées, selon les règles existantes ; la mission ne remplace pas leurs scores.
- Le badge **« Leçon sans faute »** reste lié aux unités réellement réussies sans faute ; le badge **« Mission sans faute »** est distinct.
- **Distinguer « leçon validée » et « unités faites » dans les compteurs.** Compter la leçon comme validée pour le parcours, sans transformer par erreur « 3/4 unités faites » en « 4/4 unités faites ». Revoir au besoin la séparation entre `leconTerminee()`, `etapesFaites()` et les indicateurs de progression, pour éviter les pourcentages trompeurs.
- Dans « Mon chemin », le groupe des leçons acquises peut contenir une leçon validée par mission, mais son libellé doit rendre ce mode d'acquisition compréhensible. La prochaine leçon, et non l'unité manquante, porte l'accent doré.

## 4. Stockage, migration et compatibilité

- Enregistrer un **état persistant explicite de validation** (réutiliser si pertinent `progress[leconId].valideeMission.ok` existant) pour toutes les missions réussies, sans distinction de mode. La synchronisation cloud doit conserver l'acquis (fusion monotone, idempotence).
- Conserver séparément le meilleur **score d'autonomie** (`mission.score`) et l'état de **réussite**. Un score numérique ne doit pas, à lui seul, servir d'unique état métier pour de nouvelles tentatives.
- **Rétroactivité :** une mission déjà réussie et sauvegardée avant déploiement doit valider la leçon sans imposer de la rejouer. Les scores historiques ≥ 80 % correspondant aux missions normales réussies doivent être reconnus ; respecter les anciens `valideeMission.ok`. Ne jamais retirer un acquis historique.
- Les anciennes données ayant un score plafonné lors de la perte des vies ne permettent pas forcément de reconstruire exactement les erreurs : **ne pas inventer d'historique**. Conserver les meilleurs scores et marqueurs existants sans réinitialisation.
- Préserver `luxParcours` / `luxParcoursLibre`, la progression locale/cloud, les statistiques des exercices, le choix du niveau et l'accès libre aux unités.

## 5. Modifications ciblées attendues

- `mission.js` : déterminer la réussite selon les **vies restantes à la fin** ; normaliser la validation et les résultats des deux modes ; ne pas utiliser `SEUIL_MISSION` pour gagner ; conserver la conversation après perte des vies.
- `progress.js` : marquer explicitement les réussites acquises ; gérer la compatibilité des anciennes données.
- `niveau.js` / `accueil.js` / `chemin.js` : une leçon validée par mission est acquise et ne recommande plus les unités manquantes, sans falsifier le compteur d'unités réellement effectuées.
- `parcours.js` : préserver les unités non réalisées et leur reprise facultative sans détourner la progression principale.
- `docs/specs/SPEC-23.md` : historique des seuils remplacés par cette SPEC.

## 6. Tests d'acceptation (automatisés et contrôle ciblé)

- [x] Mission normale : 10/10, 9/10, 8/10 avec vies restantes → **réussite + leçon validée**.
- [x] Mission normale : 7/10, trois vraies erreurs sur des répliques distinctes, zéro vie → **échec**, conversation terminable, aucun raccourci.
- [x] Plusieurs erreurs dans **une même réplique** coûtent au maximum une seule vie.
- [x] Coquille corrigée éligible ne coûte pas de vie et ne bloque pas la réussite ni le « Sans faute » si tout le reste est correct.
- [x] « Tente ta chance » : **même règle** de réussite par vies restantes ; 8/10 avec une vie suffit à valider.
- [x] Leçon 1 : unités 1–3 terminées, unité 4 non faite, mission réussie → leçon comptée acquise, unité 4 sans coche/étoile, leçon 2 proposée.
- [x] Une unité principale interrompue avant la mission ne bloque plus l'avancement après le raccourci ; ses réponses restent récupérables.
- [x] Mission déjà « Sans faute » (historique) : après migration, la leçon devient validée sans rejouer ; les étoiles déjà acquises ne diminuent pas.
- [x] Mission échouée avec toutes les unités faites : **ne pas confondre « mission jouée » avec « mission réussie »**.
- [x] Rechargement, reprise, synchronisation cloud et suivi du niveau : pas de perte d'acquis, ni de progression artificiellement attribuée aux unités.
- [ ] Vérifier le comportement sur PC et Android ; ne pas élargir la recette visuelle à des écrans hors périmètre.

## Hors périmètre

- Réécriture des dialogues, modification de la correction linguistique, nombre de répliques, nombre de vies, design général, refonte des unités, recalibrage des étoiles déjà gagnées.
- Attribution d'étoiles « par équivalence » lors du saut de leçon.

## Suivi

**Implémentée sur `v2`**, recette PC et Android à faire (dernier critère non coché).

- `public/progress.js` : `missionReussie()` = `valideeMission.ok` (ou, pour les résultats d'avant la spec, ancien score ≥ 80 %) ; `SEUIL_MISSION` devient `SEUIL_MISSION_HISTORIQUE`, utilisé seulement pour l'historique ; `leconTermineeAvantSpec32()` ; `figerAcquisMission()` écrit les acquis historiques (`valideeMission`, `historique.terminee`) puis `mission.regle32` au 1er essai avec la nouvelle règle. Toutes ces clés sont à 3 niveaux (fusion cloud = max, jamais perdues).
- `public/mission.js` : réussite = `ms.vies > 0` à la fin, pour la mission normale et « Tente ta chance » ; plus de plafonnement du score ; `validerLeconParMission()` (validation + partie principale de la leçon déplacée en entraînement libre si cet emplacement est vide) ; fin : « Leçon suivante » si le prochain pas est ailleurs, bandeau neutre « Plus de vie · mission à rejouer » sinon.
- `public/niveau.js` : `etapesFaites()` = unités réellement faites + mission **réussie** ; `leconTerminee()` vraie aussi si mission réussie ou leçon terminée avant la spec ; la progression du niveau compte une leçon acquise en entier.
- `public/revision.js` (`prochainPas`), `public/chemin.js` : une leçon acquise n'est plus proposée (ni sa partie principale) ; leçon validée avant la fin des unités → « Validée par la mission », pas d'étoiles de leçon ; une mission jouée mais perdue reste le prochain pas.
- `public/parcours.js` : unités pas faites d'une leçon validée = « FACULTATIVE · LEÇON VALIDÉE PAR LA MISSION » (plus de « ✓ »), jouées en entraînement libre.
- Décision du 18/10/2026 : les leçons **déjà terminées** avant la mise à jour avec une mission seulement jouée (< 80 %) **restent terminées**.
- Tests : `tests/test_mission_validation.py` (nouveau), `tests/test_mission_vies.py`, `tests/test_lot3.py`, `tests/test_chemin_lignes.py`, `tests/test_sync.js` adaptés ; suite critique verte.
- Écart : les scènes actuelles ont 3 à 6 réponses (pas encore 10) ; la règle des vies s'applique telle quelle.

Références : [SPEC 23 — Missions et vies](./SPEC-23.md), [SPEC 22 — Progression principale et libre](./SPEC-22.md), [SPEC 31 — Premier clic PC](./SPEC-31.md).
