# SPEC 90 — Roguelite Survie : builds, pouvoirs, draft, combos et Tempête

**Branche :** `2.1` · **Statut :** règles candidates à équilibrer, non implémentées dans le moteur public · **Simulation :** SPEC 91.

> **Révision du 22 octobre 2026 — [SPEC 92](./SPEC-92.md) prévaut en cas de conflit.**
> - **Plus aucun pouvoir actif** : tous les pouvoirs sont des buffs passifs permanents (catalogue ci-dessous).
> - **Pas de choix avant la partie** ; le draft est déclenché par la **barre de surchauffe** (remplie par les points, seuil croissant), plus par les streaks 8/12/16.
> - **Pas de mur à 180 s** : après Chaos, la Tempête continue de monter (×2,5 puis ×3).
> - Record = **score** (meilleure série en secondaire).

## Boucle

1. ~~Choisir 2 pouvoirs niveau I avant la partie~~ — révisé : la partie démarre sans pouvoir ; 3 emplacements de passifs, remplis via la surchauffe.
2. Reconstituer les lettres, répondre sans bouton Valider ; chrono initial 30 s (réserve max 30), succès +3 s de base.
3. Succès = +1 streak, score de mot × multiplicateur, charge des passifs en « mots corrects », remplissage de la barre de surchauffe avec les points.
4. ~~Draft aux streaks 8, 12, 16~~ — révisé : **barre de surchauffe pleine → draft** (3 choix, pause atomique), seuil croissant à chaque niveau ; une erreur ne vide pas la barre.
5. Draft : upgrade d'un passif possédé I→II→III, nouveau passif dans un emplacement libre, ou remplacement (nouveau passif au niveau I et **perte de l'ancien niveau**). Les niveaux acquis ne sont pas perdus sur erreur.
6. Erreur : mot non crédité, tentative possible sur le même mot, streak=0, multiplicateur=×1, malus temporel croissant. Après perte, ne pas redonner les récompenses déjà obtenues.

## Catalogue V1 révisé — passifs uniquement (paramètres à simuler)

| Passif | Ancien pouvoir | Niveau I | II | III | Contraintes |
|---|---|---|---|---|---|
| Givre | Gel temporel (actif) | Chrono gelé 3 s toutes les 4 réussites | 4 s | 4 s toutes les 3 réussites | Ne retarde pas la Tempête |
| Étincelle | Lettre magique (actif) | 1re lettre posée sur les mots de 7+ lettres | 6+ lettres | 2 lettres sur 9+ | Ne donne jamais la solution complète |
| Passe-droit | Joker (actif) | « Passer » gratuit toutes les 5 réussites | 4 | 3 | Passage gratuit = 0 point, série conservée à 0 |
| Braise | Second souffle | +0,5 s/succès | +0,75 s | +1 s | Plafond 30 s de réserve |
| Bouclier | Bouclier | Absorbe le malus d'une erreur, recharge 6 mots | 5 | 4 | **Streak casse quand même** |
| Phénix | Dernière chance | Retour à 3 s | 5 s | 7 s | **Une seule résurrection par partie** |
| Brasier | Quitte ou double (actif) | Multiplicateur +1 palier, malus d'erreur ×2 | — | — | Passif à double tranchant |

Chaque passif affiche son icône et ses pastilles de charge sous le chrono, et un effet visuel propre quand il se déclenche (détail en SPEC 92).

Charges = nombre de **mots correctement reconstruits**, pas des secondes, et jamais de charge gratuite en pause de draft, à l'arrière-plan ou en attendant. Un passif n'est jamais perdu à la première erreur (sauf l'usage unique de Phénix).

**Conception anti-exploit** : cooldown et capacité sont mis à jour dans une transaction logique par réponse, ordre des événements explicite ; jamais de double validation ; les passifs ne permettent pas de dépasser la réserve maximale de 30 s.

## Score et rupture

- Score initial candidat : `points = 10 × nb_lettres × multiplicateur × bonus_risque`.
- Multiplicateur de streak **avant validation du mot suivant** : 0–2 ×1 ; 3–5 ×1,25 ; 6–9 ×1,5 ; 10–14 ×2 ; ≥15 ×3. Arrondir au niveau de chaque mot de manière reproductible, comparer autres seuils par simulation.
- Échec : malus temporel selon **streak juste avant la faute** : 0–4 = −3 s ; 5–9 = −4 s ; 10–14 = −5 s ; ≥15 = −6 s. Multiplicateur ×1 immédiatement. Bouclier = aucun malus temporel, **pas de sauvegarde de combo**.
- Feedback « COMBO BRISÉ », multiplicateur ×3→×1 et secondes perdues, maximum 700 ms, non bloquant, `prefers-reduced-motion`. Les niveaux de build restent acquis.

## Tempête (montée de pression EXOGÈNE)

| Temps réel de jeu | Phase | Consommation de la réserve |
|---|---|---|
| 0–45 s | Calme | ×1 |
| 45–90 s | Vent | ×1,25 |
| 90–135 s | Tempête | ×1,5 |
| 135–180 s | Chaos | ×2 |
| 180–225 s | Chaos II (révision SPEC 92) | ×2,5 |
| 225 s et + | Chaos III (révision SPEC 92) | ×3 |

Les phases sont basées sur le **temps réel actif** écoulé, pas sur la streak, le build ou les points. Les pauses de draft n'incrémentent rien. Le passif Givre protège la réserve de temps pendant sa durée mais **ne retarde pas la Tempête**.

Les modificateurs sont déterministes, préannoncés, télégraphiés visuellement et identiques pour un défi : lettres parasites à certains mots, vagues plus exigeantes, mots d'élite avec récompense et pénalité accrues. **Jamais** de lettres non distinguables, boutons mobiles, impossibilité de défaire un choix ou saisie invalide inattendue.

## Anti-immortalité et expérience

- Toutes les sources de temps sont plafonnées à 30 s ; les freezes n'annulent pas la fin de partie en temps réel.
- Un joueur parfait ne peut pas continuer indéfiniment : l'escalade de la Tempête (×2,5 puis ×3) rend la réserve intenable, sans mur arbitraire.
- Mes mots : mini Sprint 45 s / court 90 s / complet 180 s selon pool ; Tempête et draft allégés, même système de score séparé.
- Compétition : tous disposent des mêmes graines et mêmes versions. Scores personnels historiques de SPEC 88 non détruits.
- Aucun « scaling adaptatif caché » selon le niveau des pouvoirs, le score ou la performance du joueur.

## Paramètres provisoires, validation

Ces valeurs sont des **hypothèses de design**, non équilibrées. La SPEC 91 doit mesurer : mortalité à 45/90/135/180 s, pourcentage de joueurs atteignant 180 s (par compétence/build), performance relative des pouvoirs, distributions p50/p90/p99 du score et durée, sources de mort, erreurs, nombre de mots distincts, niveau de storm et rapport temps gagné/perdu. Valider après tests humains et télémetrie consentie ; un LLM ne peut pas déclarer l'équilibre à partir de bots seuls.
