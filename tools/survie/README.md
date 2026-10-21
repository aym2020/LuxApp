# Survie — simulateur massif hors production (SPEC 91)

Cette simulation **ne modifie ni l'application ni les scores**. Elle est destinée à préparer les règles **SPEC 89/90**, non à prétendre que ces pouvoirs existent déjà dans `public/jeux-v21.js`.

## Exécution locale

Node.js 22, sans dépendance à installer :

```bash
node --test test/survie-sim.test.cjs
node tools/survie/simulate.cjs --runs 1000 --seed balance-2026-v1 --out survie-sim-report
```

320 cellules (= 4 pools × 4 profils × 4 builds × 5 scénarios), donc **320 000 parties** pour `--runs 1000`. Pour une vérification rapide, `--runs 5` produit 1 600 parties. La campagne écrit `summary.json`, `manifest.json`, `llm-brief.md`. Ne pas committer les rapports : ils sont régénérables et doivent rester des **artefacts** de CI.

- **Pools** : Mes mots 10/30/60 entrées distinctes tirées du corpus audité, et Arène avec toutes les entrées admissibles.
- **Profils synthétiques** : novice, intermediate, advanced, perfect ; quatre politiques de builds (balanced, defensive, aggressive, utility).
- **Scénarios** : baseline, strongStorm, hardBreak, extraBonus, noPowers. Seeds identiques par cellule pour comparisons appariées.
- **Mesures** : taux au plafond, IC95 % Wilson, p50/p90/p99 du score, temps et streak, nombre de mots, erreurs, upgrades, causes de fin et alertes de corpus/immortalité.
- **Audit corpus** : tous les JSON `data/lecons/A1.1` et `A1.2`, règles de filtrage proches de SPEC 88. Une entrée techniquement admissible n'est pas **linguistiquement validée** ; l'audit humain du luxembourgeois et des traductions reste obligatoire.

## GitHub Actions

`.github/workflows/survie-balance.yml` exécute automatiquement une campagne de **64 000 parties à chaque changement pertinent poussé sur 2.1** (200 par cellule), test compris. Le lancement massif via `workflow_dispatch` est préparé (par défaut 640 000 parties).

**Limitation importante :** GitHub ne déclenche un workflow `schedule` et certains déclenchements manuels que si ce workflow est installé sur la branche par défaut (`main`). Le cron « tous les jours à 03:17 UTC » est donc **préparé mais inactif** tant que cette condition n'est pas remplie. Nous ne poussons rien sur main sans décision explicite. Les lancements automatiques **sur push 2.1** fonctionnent indépendamment de cette limite.

## Analyse LLM

La campagne produit un brief exploitable par un LLM, même sans clé API. Si un secret `OPENAI_API_KEY` et une variable GitHub `SURVIE_LLM_MODEL` sont configurés **volontairement**, `llm-review.cjs` appelle l'API Responses pour générer `llm-review.md` (recommandations chiffrées, non appliquées). Sans configuration, il marque clairement que l'analyse IA n'a pas tourné. Aucune donnée utilisateur personnelle ni mot de passe transmis. Coût API possible si activé : maîtriser la cadence/les quotas.

**Garde-fou :** une proposition LLM n'est jamais un patch, aucune génération de commit ni ajustement de l'Arène en production ; revue humaine, nouvelle campagne et test sur joueurs avant livraison.

## Honnêteté des modèles et limites de V0

Ce moteur est une **maquette mathématique prospective**, pas un replay du moteur Survie actuel. Il modélise bonus +3, plafond 30, tempête 45/90/135 s, malus 3/4/5/6, pouvoirs actifs/passifs simplifiés, paliers 4/8/12…, un cap 45/90/180 s et une résurrection max. Les bots ne reproduisent ni l'hésitation, ni la mémorisation, ni l'attention d'une vraie personne. **À ce stade** : les drafts ne modélisent pas encore les trois cartes tirées ni l'échange tactique complet d'un pouvoir de niveau III contre un nouveau niveau I ; les lettres parasites et élites sont des coûts/risques statistiques, pas des interactions de tuiles. Le score et les pouvoirs devront être raccordés à un moteur pur partagé avant tout classement public.

**Critère de suite :** dès que Survie 2.0 existe, les tests de simulation doivent jouer des traces identiques dans le moteur réel et le simulateur (même RNG, delta temps, pénalités, pouvoirs, réapparition de mots, fin). Compléter par bots qui font des erreurs volontaires et tests humains.
