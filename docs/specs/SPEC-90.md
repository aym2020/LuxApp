# SPEC 90 — Roguelite Survie : builds, pouvoirs, draft, combos et Tempête

**Branche :** `2.1` · **Statut :** règles candidates à équilibrer, non implémentées dans le moteur public · **Simulation :** SPEC 91.

## Boucle

1. Choisir 2 pouvoirs **niveau I** avant la partie ; 3e slot verrouillé.
2. Reconstituer les lettres, répondre sans bouton Valider ; chrono initial 30 s (réserve max 30), succès +3 s de base.
3. Succès = +1 streak, score de mot × multiplicateur, recharge des capacités en « mots corrects ».
4. Débloquer 3e slot à **streak 4** dans Survie complète/Arène ; proposer 3 choix lors du draft aux **streaks 8, 12, 16**, puis tous les 4 mots, chaque palier au plus une fois **par partie**, même après rupture.
5. Draft : upgrade d'une capacité possédée I→II→III, nouveau pouvoir dans un slot disponible, ou remplacer un pouvoir (nouveau pouvoir au niveau I et **perte de l'ancien niveau**). Les niveaux acquis ne sont pas perdus sur erreur.
6. Erreur : mot non crédité, tentative possible sur le même mot, streak=0, multiplicateur=×1, malus temporel croissant. Après perte, ne pas redonner les récompenses déjà obtenues.

## Catalogue V1 proposé (paramètres à simuler)

| Pouvoir | Catégorie | Niveau I | II | III | Contraintes |
|---|---|---|---|---|---|
| Gel temporel | Actif | Stop chrono 3 s | 4 s | 5 s | Recharge 5/5/4 réussites, n'arrête pas le temps réel ni la Tempête |
| Lettre magique | Actif | Place une lettre | Deux lettres | Deux lettres, recharge plus rapide | Recharge 5/4/3 réussites, ne donne pas automatiquement la solution |
| Joker | Actif | Skip, 0 point | Recharge plus rapide | Recharge encore améliorée | 6/5/4 réussites, pas de streak gagnée, n'évite pas cap de partie |
| Second souffle | Passif | +0,5 s/succès | +0,75 s | +1 s | Gain toujours plafonné à 30 s de réserve |
| Bouclier | Passif | Annule malus erreur toutes les 6 réussites | 5 | 4 | **Streak casse quand même**, bonus offensifs perdus |
| Dernière chance | Passif | Retour à 3 s | 5 s | 7 s | **Une seule résurrection par partie**, pas par streak |
| Quitte ou double | Actif | Prochain mot ×2 points | ×2,5 | ×3 | Échec = pénalité supplémentaire, déclenchement volontaire, jamais cumulé gratuitement |

Cooldowns = nombre de **mots correctement reconstruits**, pas des secondes, et jamais de charge gratuite en pause de draft, à l'arrière-plan ou en attendant. Une capacité n'est ni obligatoire ni perdue à la première erreur (sauf l'usage unique de Dernière chance).

**Conception anti-exploit** : cooldown et capacité sont mis à jour dans une transaction logique par réponse, ordre des événements explicite ; jamais de double validation ; les passifs ne permettent pas de dépasser la réserve maximale ou la fin de 180 s.

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

Les phases sont basées sur le **temps réel actif** écoulé, pas sur la streak, le build ou les points. Les pauses de draft n'incrémentent rien. Le pouvoir Gel protège la réserve de temps pendant sa durée mais **ne retarde pas la Tempête**, ni la limite de 180 s.

Les modificateurs sont déterministes, préannoncés, télégraphiés visuellement et identiques pour un défi : lettres parasites à certains mots, vagues plus exigeantes, mots d'élite avec récompense et pénalité accrues. **Jamais** de lettres non distinguables, boutons mobiles, impossibilité de défaire un choix ou saisie invalide inattendue.

## Anti-immortalité et expérience

- Toutes les sources de temps sont plafonnées à 30 s ; les freezes n'annulent pas la fin de partie en temps réel.
- Un joueur parfait peut atteindre 180 s, mais **ne peut continuer indéfiniment**.
- Mes mots : mini Sprint 45 s / court 90 s / complet 180 s selon pool ; Tempête et draft allégés, même système de score séparé.
- Compétition : tous disposent des mêmes graines et mêmes versions. Scores personnels historiques de SPEC 88 non détruits.
- Aucun « scaling adaptatif caché » selon le niveau des pouvoirs, le score ou la performance du joueur.

## Paramètres provisoires, validation

Ces valeurs sont des **hypothèses de design**, non équilibrées. La SPEC 91 doit mesurer : mortalité à 45/90/135/180 s, pourcentage de joueurs atteignant 180 s (par compétence/build), performance relative des pouvoirs, distributions p50/p90/p99 du score et durée, sources de mort, erreurs, nombre de mots distincts, niveau de storm et rapport temps gagné/perdu. Valider après tests humains et télémetrie consentie ; un LLM ne peut pas déclarer l'équilibre à partir de bots seuls.
