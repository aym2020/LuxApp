# AGENTS.md — Consignes obligatoires pour coder LuxApp

Lire avant toute intervention : [PLAYBOOK.md](PLAYBOOK.md) (voir aussi l'[index documentaire](docs/README.md)), et pour la refonte `2.1`, [docs/CHARTE_UI_2.1.md](docs/CHARTE_UI_2.1.md) + [POSTMORTEM-EXERCICES-2.1-2026-10-21.md](docs/POSTMORTEM-EXERCICES-2.1-2026-10-21.md).

## Contrôle de parité UI (SPEC 94 implémentée ; [SPEC 95](docs/specs/SPEC-95.md) NOUVELLE cible à coder)

**Attention : SPEC 95 a priorité sur la présentation des feedbacks et CTA de SPEC 94.** Le correctif attendu impose **un seul dock d'action bas et indépendant** des explications, avec la même position de CTA quel que soit le verdict ; pas de grande carte/bandeau coloré ni de CTA injecté dans `#pc-feedback` ou `#session-feedback`. Zone centrale scrollable ; clavier Samsung et Mot caché avec commandes secondaires font l'objet de cas G01–G24. **Le code n'est pas encore migré.** Il faut préserver la logique/scores et les sons SPEC 94 et faire auditer le diff avant fusion.


**Règle : deux éléments identiques dans leur sens et leurs interactions doivent réutiliser le même composant de présentation, ses tokens et ses états** (et non deux copies HTML/CSS qui « semblent pareilles »). Les deux moteurs de Leçon (`parcours.js`) et S'entraîner (`app.js`) conservent **des calculs pédagogiques indépendants**. **Correction d'exercice (lot 2 de SPEC 94, codé)** : toute correction passe par `renderFeedbackCommun()` (bandeau plat à trait supérieur, bouton unique `.fb-cta`, style unique `feedback-unifie.css`) et tout son par `jouerFeedbackSon('success'|'retry'|'finalFailure')`, appelé par le moteur au moment de la réponse, jamais dans un rendu. Ne pas recréer de carte « Juste ! » / « Pas encore », ni de bouton ou de couleurs propres à une vue ; les règles `#view-parcours …` / `#view-session …` ne gèrent que l'emplacement. Exceptions documentées dans SPEC 94 (« Implémentation — lot 2 »). Voir A01–A17. Tout changement de correction, CTA, choix ou feedback partagé nécessite une revue par l'[agent de parité UI](.claude/agents/ui-parity-auditor.md) selon la [SPEC 94](docs/specs/SPEC-94.md), des tests DOM/browser avant/après, et Samsung pour valider le rendu réel. L'agent est un contrôle de revue ; son existence ne prouve **ni** la migration, **ni** le passage de tests.

## Règles prioritaires — UI/UX 2.1

- **Branche :** `2.1` exclusivement pour cette refonte, sauf instruction explicite contraire ; inspecter SHA distant et diff, ne jamais changer de branche ni écraser le travail d'autrui à son insu.
- **État actuel :** les exercices 2.1 sont **NON VALIDÉS** après régressions visuelles/pédagogiques du 21 octobre 2026. Une CI verte ne rend pas l'UI validée.
- **Ne pas changer le sens des exercices :** Mot caché → Quiz → Trous → Écriture ; conserver exactitude du 1er/2e essai, indices, faux, « Voir la réponse », rappel, score, données, audio et reprise. Ne jamais remplacer tous les titres de feedback par deux textes génériques.
- **Périmètre minimal :** une cause racine/une famille d'exercices à la fois ; comparer le comportement ancien/actuel. Ne pas ajouter de surcharges CSS sans contrôler cascade, spécificité, états du composant, scroll et position réelle.
- **Feedback fiable :** un seul message actif, bon/faux clairement identifiables sans dépendre exclusivement de couleur ; la bonne solution ne doit pas être teintée comme une erreur ; aucune balise HTML littérale ni répétition de note.
- **Qualité avant push :** vérifier scénarios d'états sur DOM réel, `bash tools/critique.sh rapide` puis **`bash tools/critique.sh`** pour toute refonte des exercices/corrections ; navigateur 320–430px avec comparatif de captures. Contrôle Samsung réel obligatoire avant de valider un correctif clavier.
- **Arrêt obligatoire :** un défaut majeur détecté => plus de nouveaux patches UI en série ; diagnostiquer, documenter, rollback sélectif si nécessaire ; tests de non-régression d'abord.
- **Communication :** chaque livraison indique branche, SHA, tests effectivement exécutés, tests impossibles, limites. Tests Node, CI, navigateur et Samsung sont **quatre garanties distinctes**. Sans validation du navigateur, ne jamais affirmer que le rendu est corrigé ou prêt à livrer.

Documentation seule : contrôler liens/markdown et ne pas revendiquer de recette UI ; aucun changement fonctionnel sans demande.
