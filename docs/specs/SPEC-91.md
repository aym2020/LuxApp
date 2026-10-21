# SPEC 91 — Simulation massive autonome et arbitrage d'équilibrage par LLM

**Branche :** `2.1` · **Statut :** simulateur V0 indépendant exécuté en CI ; moteur public à faire · **Cible :** comparer les règles de SPEC 89/90 sans modifier le gameplay actuel.

## Objectifs non négociables

- Fournir un simulateur **headless Node.js**, déterministe à graine et version du corpus identiques, sans navigateur, dépendance externe, accès à Supabase ni score utilisateur.
- Comparer **Mes mots (10/30/60 mots simulés)** et **Arène (tout le corpus admissible)**, novices/intermédiaires/avancés/experts et builds agressif/défensif/équilibré/aléatoire.
- Produire des volumes de **100 000 à 1 000 000 de parties simulées** par campagne configurable, avec agrégats robustes. Le nombre d'échantillons fait partie du rapport, jamais sous-entendu.
- Faire varier les paramètres par scénarios : baseline, tempête renforcée, rupture aggravée, bonus plus généreux, sans pouvoirs. Permettre le balayage de configurations supplémentaires sans retoucher le code métier.
- Tester des **scénarios extrêmes** : joueur parfait, pouvoirs niveau III, source de temps maximale, peu de mots, pool quasi épuisé, jamais de boucle infinie (limite temporelle réelle et garde-fou tours max).
- Créer des artefacts `summary.json`, `llm-brief.md` et une synthèse de traces représentatives ; ne pas exporter de données personnelles ni de secrets.

## Modélisation honnête

Les bots sont des **hypothèses** : leur probabilité d'erreur et vitesse dépendent de la compétence, de la longueur et du modificateur, mais ne mesurent **pas** des êtres humains. Présenter les intervalles de confiance (pour taux), distributions p50/p90/p99, effectifs par cellule, sensibilité, taille d'effet ; **ne jamais** attribuer des probabilités réelles aux utilisateurs sans validation terrain.

Séparer une référence **fonctionnelle** (mêmes équations et séquence d'événements que le jeu réel futur) et un modèle **comportemental** (habileté probabiliste). Pour V0, ne pas revendiquer l'identité au jeu existant SPEC 88 ; lors de l'implémentation production, extraire un noyau pur partagé et comparer simulateur/replay sur des fixtures identiques.

Audit du vocabulaire réel depuis `data/lecons/A1.1` et `A1.2` : filtrer les flashcards comme dans SPEC 88, décompter doublons et longueur, produire `corpusHash`. Bloquer le leaderboard si corpus insuffisant/non audité ; 200–250 mots est une **cible**, pas une garantie. Pool personnel synthétique de tailles différentes, tiré de cet index.

## Métriques et garde-fous proposés à calibrer

- Taux atteignant le cap de 180 s par niveau/buid : éviter une domination écrasante, viser une proportion modérée chez les experts (fourchette expérimentale, pas un objectif définitif).
- Durée moyenne, médiane, p90, p99 ; nombre total de mots justes, erreurs, skips, meilleurs combos, points, rang simulé, survenue des pouvoirs et morts.
- Efficacité de chaque pouvoir : choix, niveau, activation, gain marginal et domination des builds, avec comparaison **à niveau de compétence et seed identiques**. Exposer les intervalles, pas uniquement les moyennes.
- Détecter les exploits : performances croissantes sans borne, trop de résurrections, score anormalement infini, « champion » sans erreur avec hasard très favorable.
- Indicateurs de décision : alerte si pool Arène <200, concentration d'un pouvoir sur les stratégies gagnantes, quasi-totalité d'une classe au cap, taux d'échec trop élevé avant première upgrade, forte asymétrie entre builds.
- Garder un jeu valorisant : croissance du multiplicateur et des pouvoirs malgré la Tempête ; pas d'adaptation cachée de la difficulté au build.

## Boucle automatisée souhaitée

1. Auditer le corpus et hacher les données/paramètres.
2. Exécuter en parallèle/cohortes une campagne seedée ; conserver échantillons et agrégats.
3. Produire rapports JSON/Markdown et alertes **déterministes**.
4. Si un secret `OPENAI_API_KEY` est explicitement configuré, faire analyser la synthèse par un LLM pour proposer **au plus trois modifications de paramètres**, une justification chiffrée, prédictions falsifiables et plan d'essai A/B ; sinon produire un prompt utilisable par n'importe quel LLM.
5. Exécuter **une nouvelle campagne** avec les variantes proposées **après examen humain** ; comparer aux résultats de référence et consigner le diff.
6. **Aucune modification automatique de production, aucun auto-merge, aucun classement mis à jour** à partir de résultats simulés.

## GitHub Actions et limites de la branche

Créer workflow indépendant avec `push` sur les fichiers du simulateur de **2.1** (exécution autonome à chaque modification pertinente), `workflow_dispatch` pour mass runs, et planification `schedule` préparée.

**Limitation GitHub : un workflow `schedule` et généralement `workflow_dispatch` exigent sa présence dans la branche par défaut. Tant qu'il n'est que dans `2.1`, ne pas prétendre qu'il s'exécute chaque nuit.** L'activation des runs périodiques nécessite une livraison contrôlée du workflow sur `main` ou un déclencheur externe explicitement autorisé ; ne pas changer de branche sans instruction.

La CI exécute des **tests de déterminisme** à volume réduit ; les simulations massives exportent des artefacts pour revue. Coûts LLM/API plafonnés et journalisés ; secrets lus depuis GitHub Actions, jamais committés.

## Critères d'acceptation

1. Deux exécutions même seed/corpus/params = mêmes résultats (hors horodatage d'exécution).
2. Seed modifiée = tirages/résultats différents.
3. Partie parfaite finit au plus tard au temps réel maximal ; aucune série illimitée.
4. +3 s, cap30, casse streak, malus 3/4/5/6 et Tempête aux seuils reproduits.
5. Au moins un test sans pouvoirs et avec pouvoirs, validité agrégats (0≤taux≤1, quantiles ordonnés, sommes cohérentes).
6. Sortie en cas d'entrée invalidée, aucune donnée personnelle ni API réseau non opt-in.
7. Relectures LLM **critiques** et contradictoires, elles proposent mais ne décident pas : aucune modification de paramètres par une sortie non validée.
8. Suite GitHub CI verte et documentation de la commande de lancement, des limites statistiques, et de l'absence de cron actif si sur `2.1`.

## Premier jalon réel — 22 octobre 2026

GitHub Actions sur `2.1` : **64 000 parties synthétiques, 320 cellules, 200 parties/cellule**, exécution et tests Node réussis. Audit technique : **227 entrées admissibles** du corpus A1.1/A1.2 (avant validation linguistique). Deux alertes heuristiques signalées, détails dans l'artefact `summary.json`. Le `llm-review.md` du premier run indique honnêtement **analyse LLM non activée**, faute de configuration explicite de `OPENAI_API_KEY` et `SURVIE_LLM_MODEL`. Ceci ne valide ni le gameplay futur ni son équilibre.

[Run initial](https://github.com/aym2020/LuxApp/actions/runs/39694291948) · [Artefact](https://github.com/aym2020/LuxApp/actions/runs/39694291948/artifacts/12390226459).
