# AGENTS.md — Consignes obligatoires pour coder LuxApp

> **RED FLAG / CRINGR — contenu et personnages :** commencer par [docs/red-flag/README.md](docs/red-flag/README.md) et sa [banque de mensonges](docs/red-flag/CATALOGUE-MENSONGES.md). Pour toute implémentation, lire aussi SPEC 110/113, le code sur `2.1` et le TODO canonique sur `main`. Les idées éditoriales ne sont pas des affaires validées.


Lire avant toute intervention : [PLAYBOOK.md](PLAYBOOK.md) (voir aussi l'[index documentaire](docs/README.md)), et pour la refonte `2.1`, [docs/CHARTE_UI_2.1.md](docs/CHARTE_UI_2.1.md) + [POSTMORTEM-EXERCICES-2.1-2026-10-21.md](docs/POSTMORTEM-EXERCICES-2.1-2026-10-21.md).

## Contrôle de parité UI (SPEC 94 et [SPEC 95](docs/specs/SPEC-95.md) implémentées)

**Écran d'exercice (SPEC 95, codée)** : Leçon et S'entraîner ont trois zones — en-tête, `.exo-scroll` (seule zone qui défile : question, réponses, correction) et `.exo-action-dock` (seul emplacement des boutons). Tout bouton d'exercice passe par `renderActionExercice(dock, config)` : **un seul bouton primaire, même nœud, même place** (Valider → Réessayer → Continuer) ; toute correction par `renderFeedbackCommun()` (**aucun bouton**, pas de fond ni de carte) ; tout son par `jouerFeedbackSon()` au moment de la réponse. Interdit : bouton dans `#pc-feedback` / `#session-feedback` ou dans le contenu, `position:fixed`/`sticky` pour la correction, `window.scrollBy` après une réponse, changement de libellé du bouton sans passer par `renderActionExercice` (la garde de double appui en dépend). Tests : `tests/test_spec95_exercices.py` (G01–G23). Écarts documentés dans SPEC 95 « Implémentation ».

**Règle : deux éléments identiques dans leur sens et leurs interactions doivent réutiliser le même composant de présentation, ses tokens et ses états** (et non deux copies HTML/CSS qui « semblent pareilles »). Les deux moteurs de Leçon (`parcours.js`) et S'entraîner (`app.js`) conservent **des calculs pédagogiques indépendants**. **Correction d'exercice (SPEC 94, présentation remplacée par SPEC 95)** : scores, sons `success`/`retry`/`finalFailure`, essais, indices, rappels : voir SPEC 94 (A01–A17). Ne pas recréer de carte « Juste ! » / « Pas encore », ni de bouton ou de couleurs propres à une vue ; les règles `#view-parcours …` / `#view-session …` ne gèrent que l'emplacement. Tout changement de correction, CTA, choix ou feedback partagé nécessite une revue par l'[agent de parité UI](.claude/agents/ui-parity-auditor.md) selon la [SPEC 94](docs/specs/SPEC-94.md), des tests DOM/browser avant/après, et Samsung pour valider le rendu réel. L'agent est un contrôle de revue ; son existence ne prouve **ni** la migration, **ni** le passage de tests.

## Règles prioritaires — UI/UX 2.1

- **Branche :** `2.1` exclusivement pour cette refonte, sauf instruction explicite contraire ; inspecter SHA distant et diff, ne jamais changer de branche ni écraser le travail d'autrui à son insu.
- **État actuel (25/10) :** corrections visuelles, CTA fixe et sons **acceptés sur captures Samsung** par le Produit ; P0-01/P0-07 clôturées. **Restent ouvertes** la validation clavier ouvert (P0-02), les barèmes transverses (P0-06), les sauvegardes (P0-04) et la recette complète (P0-08). La CI verte ne couvre pas ces validations.
- **Ne pas changer le sens des exercices :** Mot caché → Quiz → Trous → Écriture ; conserver exactitude du 1er/2e essai, indices, faux, « Voir la réponse », rappel, score, données, audio et reprise. Ne jamais remplacer tous les titres de feedback par deux textes génériques.
- **Périmètre minimal :** une cause racine/une famille d'exercices à la fois ; comparer le comportement ancien/actuel. Ne pas ajouter de surcharges CSS sans contrôler cascade, spécificité, états du composant, scroll et position réelle.
- **Feedback fiable :** un seul message actif, bon/faux clairement identifiables sans dépendre exclusivement de couleur ; la bonne solution ne doit pas être teintée comme une erreur ; aucune balise HTML littérale ni répétition de note.
- **Qualité avant push :** vérifier scénarios d'états sur DOM réel, `bash tools/critique.sh rapide` puis **`bash tools/critique.sh`** pour toute refonte des exercices/corrections ; navigateur 320–430px avec comparatif de captures. Contrôle Samsung réel obligatoire avant de valider un correctif clavier.
- **Arrêt obligatoire :** un défaut majeur détecté => plus de nouveaux patches UI en série ; diagnostiquer, documenter, rollback sélectif si nécessaire ; tests de non-régression d'abord.
- **Communication :** chaque livraison indique branche, SHA, tests effectivement exécutés, tests impossibles, limites. Tests Node, CI, navigateur et Samsung sont **quatre garanties distinctes**. Sans validation du navigateur, ne jamais affirmer que le rendu est corrigé ou prêt à livrer.

Documentation seule : contrôler liens/markdown et ne pas revendiquer de recette UI ; aucun changement fonctionnel sans demande.
