# LuxApp 2.1 — Refonte du panneau Cours

Date : 21 octobre 2026  
Branche : `2.1`  
Statut : implémenté et couvert par des tests de code ; recette Android en attente.

## Intention et périmètre

Le panneau **Cours** constitue une aide de référence pendant l'apprentissage. Il était composé d'une navigation très visuelle (boutons d'unité, onglets à fond gris), puis de blocs pédagogiques très colorés (règles sur cartes vertes, astuces jaunes, vocabulaire bordé de violet). Les contenus sont riches et utiles, mais la répétition de bordures et de grandes cartes rend la consultation lente. La maquette validée privilégie une interface **éditoriale, sobre et immédiatement lisible**, sans supprimer les données.

La refonte ne concerne que `#cours-panel` sur la branche `2.1`. L'onglet Cours de référence générale (surface `principal`), les exercices, Supabase, les scores et les fichiers de leçons ne sont pas modifiés.

## Écran livré

1. **En-tête compact** : « COURS · LEÇON N », titre en Instrument Serif, bouton de fermeture accessible.
2. **Unités** : choix 1 / 2 / ... / Tout, sélection matérialisée par un fond or très discret et une bordure fine, au lieu d'une grosse pastille jaune pleine.
3. **Trois rubriques** : Règles, Lexique, Phrases. L'onglet actif utilise une fine ligne dorée, sans carte pleine.
4. **Navigation et pied fixes** : seuls les résultats défilent, y compris pour les leçons très longues. « Revenir à l'exercice » reste en bas, au-dessus de la zone système Android.
5. **Règles** : contenu directement sur le noir, termes importants en jaune, sans blocs verts suggérant faussement une validation. Pour les avertissements, un simple filet orange reste visible ; astuces et informations gardent des distinctions sobres.
6. **Lexique et phrases** : termes luxembourgeois dominants, traduction atténuée, audio aligné à droite, séparateurs fins.
7. **Tableaux** : tables de conjugaison ou de grammaire conservées avec leurs en-têtes, colonnes et défilement horizontal de secours. Les `details` « mots supplémentaires » restent fonctionnels.
8. **Transitions** : aucune animation de changement de taille, conformément aux défauts déjà rencontrés sur mobile. Les interactions restent immédiates.

### Navigation et état

Le moteur `cours75.js` ne change pas son filtrage ni sa structure de blocs. Le panneau affiche la même navigation et les mêmes contenus, mais `#cours75-resultats-panneau` devient la seule zone scrollable. Tout changement d'unité ou de rubrique reconstruit cette zone et réinitialise son `scrollTop`. La fonction de fermeture reste `fermerCours()`, avec conservation de la question, du score et de l'état de l'exercice en cours.

Sur la surface `principal`, aucun changement de défilement : le CSS est exclusivement ciblé sur `#cours-panel`.

## Fichiers

| Chemin | Changement |
|---|---|
| `public/cours-v21.css` | Réalisation visuelle de la maquette, styles isolés à `#cours-panel` |
| `public/index.html` | Inclusion CSS ; invalidation de cache sur `cours75.js`, `parcours.js` |
| `public/parcours.js` | Libellé d'en-tête « COURS · LEÇON N » |
| `public/cours75.js` | Réinitialisation du défilement du contenu après chaque sélection |
| `test/cours-v21.test.cjs` | Six tests couvrant les filtres, le rendu pédagogique et le CTA |
| `public/nouveautes-v21.js` | Nouvelle rubrique « COURS » avec commit de référence |
| `public/nouveautes-v21.css` | Mini-aperçu de la refonte |
| `test/nouveautes-v21.test.cjs` | Sept rubriques vérifiées |

Aucun texte des JSON, aucune traduction, aucun bloc de cours et aucun audio ne sont supprimés ou modifiés.

## Recette Samsung

1. Pendant un exercice, ouvrir **Cours** : vérifier que l'en-tête, les filtres et le bouton de retour restent fixes.
2. Faire défiler les Règles de « Sproochen » jusqu'au tableau de conjugaison puis aux astuces : aucune carte verte pleine, pas de débordement horizontal.
3. Passer à Lexique, écouter une entrée et ouvrir « Mots supplémentaires » si disponible.
4. Passer à Phrases, vérifier l'alignement des boutons audio avec des expressions longues.
5. Alterner Unité 1 / Unité 2 / Tout : le contenu revient immédiatement en haut, sans changer la sélection des autres rubriques.
6. Fermer puis rouvrir depuis le même exercice : réponse saisie, question courante et progression préservées.
7. Tester une leçon à 4 unités, une leçon à tableaux à plusieurs colonnes, une leçon courte, police agrandie, écran étroit et paysage.
8. Ouvrir la rubrique **Nouveautés** depuis Plus : une section « COURS » avec son aperçu est visible.

Les tests Node sont accessibles via `node --test test/cours-v21.test.cjs`. Les tests automatisés ne remplacent pas le contrôle visuel Android.

## Prochaines étapes

- [x] Détail de la leçon
- [x] Introduction de mission
- [x] Scénario de mission
- [x] Introduction d'unité
- [x] Panneau Cours (à valider visuellement)
- [ ] Refondre Plus et les pages auxquelles il donne accès
- [ ] Formaliser et appliquer la charte d'animation
