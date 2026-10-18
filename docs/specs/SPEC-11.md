# SPEC 11 — Mot caché : découverte et lettres mélangées

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Référence | Branche `v2` |
| Périmètre | `parcours.js, progress.js, style.css` |

> **Traçabilité :** Synthèse structurée des specs validées en conversation, rapprochée des modules existants.
> Le statut « implémentée » atteste l'existence de travaux dans le projet ou leur confirmation conversationnelle, **pas** une recette exhaustive sur le commit courant.

## Exigences

- Le Mot caché initie au vocabulaire : première rencontre = présentation du mot luxembourgeois et de sa traduction ; puis reconstruction.
- Remplacer le clavier natif par des lettres mélangées avec généralement 2 à 4 intruses, en conservant les accents, répétitions et signes fixes.
- Permettre l'effacement, le recommencement et « Revoir le mot » ; éviter toute pénalité de découverte.
- Distinguer apprentissage assisté de production autonome et conserver Écriture comme étape sans lettres proposées.

## Critères d'acceptation

- [ ] Une personne n'ayant pas lu le cours peut apprendre sans taper au hasard.
- [ ] Les lettres nécessaires existent exactement dans les tuiles et l'orthographe reste correcte.
- [ ] Une reconstruction assistée n'est pas confondue avec une maîtrise parfaite.

## Non-régression

- Préserver la progression déjà acquise, les données locales et la synchronisation cloud.
- Ne pas modifier les JSON pédagogiques, les scores ou l'orthographe sans exigence explicite ci-dessus.
- Tester les parcours concernés sur smartphone Android, et les interactions clavier/Retour lorsqu'elles sont pertinentes.
- Vérifier les évolutions concurrentes de la branche `v2` avant implémentation.

## Suivi

- Implémentation : consulter le code, les commits et les tests, plutôt que déduire une validation du seul présent document.
- Si le comportement actuel diverge de la spec, ouvrir une tâche corrective ciblée et mettre à jour ce statut.
