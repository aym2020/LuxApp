# SPEC 52 — Accueil compact, carte « Continuer » lisible, statut cloud discret

| Champ | Valeur |
|---|---|
| Priorité | P1 — UX mobile |
| Statut | **Implémentée — recette visuelle Android à confirmer** |
| Branche | `v2` |
| Fichiers | `public/accueil.js`, `public/style.css`, `public/index.html`, `public/cloud.js`, `tests/test_accueil_compact.js` |
| Compatibilité | SPEC 46 (acquis antérieurs), SPEC 48 (design), SPEC 44 (navigation), S8 (synchronisation) |

## Constat (capture Android, octobre 2026)

- La carte « Continuer » répète un titre d'action immense, puis le numéro, le nom de leçon et l'unité sur plusieurs lignes (ex. « Leçon 20 · Être et avoir au présent / Unité 1 · sinn : être au présent »). Sa hauteur déséquilibre l'accueil.
- Les statistiques affichent « Leçons terminées » puis « +5 acquises précédemment » sur plusieurs lignes ; elles occupent plus d'espace vertical que les chiffres.
- Une petite ligne « Synchronisé à l'instant » sous le menu oblige parfois à faire défiler quelques pixels.
- L'utilisateur veut **conserver** le thème sombre/or, les niveaux A1.1/A1.2, l'ensemble des statistiques, les actions Leçons/Réviser/Examens/Erreurs fréquentes et la synchronisation.

## Attendu

### Carte principale

1. Conserver **l'action native**, le bouton unique, `id="today"`, le cas « nouveau » et le cas « niveau terminé ».
2. Afficher dans un ordre clair : petite surligne **CONTINUER** (ou COMMENCER), petit badge **LEÇON N**, titre français de la leçon **principal**, puis courte précision d'étape et flèche ronde à droite.
3. Le titre occupe **au maximum deux lignes**, le détail d'étape **une ligne**, avec ellipsis si la largeur manque. Garder le libellé complet dans `aria-label` du bouton pour l'accessibilité.
4. Pour une unité `sinn : être au présent`, résumer en « Unité 1 · sinn » ; pour les intitulés sans deux-points, conserver le titre et laisser CSS le tronquer (aucune information métier inventée).
5. Pas d'icône superflue occupant une colonne à gauche ; l'or et la flèche identifient l'action. Toutes les destinations restent inchangées.
6. Cas « niveau terminé » et « nouvel utilisateur » restent accessibles et cohérents.

### Statistiques

7. Conserver série, progression, leçons terminées **pour le niveau actif**, et séparément le compteur d'acquis provenant de l'ancienne version.
8. Afficher trois colonnes : valeur, libellé court **Série / Progression / Terminées**, plus la sous-ligne discrète **+5 acquises** (genre/pluriel correct). La distinction « précédemment » doit rester consultable par `title`/`aria-label` du compteur.
9. Ne pas modifier les formules ni mélanger « terminées » et « acquises précédemment ».

### Synchronisation

10. Retirer **uniquement** la ligne de statut située sous les boutons de l'accueil.
11. Dans l'icône « Plus » (roue dentée), afficher un **petit point** : vert seulement si l'utilisateur connecté a un statut `etatSynchro().ok`, ambre si `etatSynchro()` indique une attente. Sans compte cloud / statut nul, ne rien afficher (jamais de fausse confirmation).
12. Rendre l'état accessible au clavier/lecteur d'écran sur le bouton « Plus », et montrer son texte complet dans **Plus → Réglages** et sur la page **Compte et synchronisation**. Conserver les fonctions de connexion, synchronisation manuelle et déconnexion.
13. Quand l'état de synchro change, mettre à jour le point et le texte visible sans reconstruire toute la page ni voler le focus.
14. Ne jamais présenter « sauvegarde cloud activée » comme une sauvegarde effectuée à l'instant ; reprendre exactement les états textuels existants (y compris hors ligne).

### Dimensionnement et accessibilité

15. Réduire modérément les espaces verticaux de l'accueil, sans descendre les quatre boutons d'accès sous **60 px** de hauteur ni réduire la cible tactile de la roue dentée, des puces et de la flèche.
16. Optimiser prioritairement les écrans étroits Android ; préserver le défilement naturel si le contenu dépasse sur petit écran, zoom texte ou orientation paysage. **Ne pas forcer `overflow: hidden` ni `100vh`**.
17. Préserver les couleurs et composants CSS actuels, les animations existantes, les interactions et le niveau actif.

## Tests de recette

- [x] Libellé `CONTINUER / COMMENCER`, badge de leçon, titre et détail abrégé ; titres longs avec ligne CSS limitée.
- [x] Statistiques par niveau conservées et acquis antérieurs distincts.
- [x] Action native « reprendre », première leçon, mission, niveau terminé inchangée.
- [x] Pas de footer « Synchronisé … » dans le dashboard ; état synchronisation dans roue, menu et réglages.
- [x] Dot vert / ambre / absent selon états, mises à jour sans rerender complet.
- [x] Test automatisé sur les vrais scripts avec DOM simulé ; syntaxe JS et règles CSS vérifiées.
- [ ] Validation visuelle réelle Android à différentes hauteurs, zoom police et statut cloud.
- [ ] Confirmation qu'à la hauteur de l'appareil de référence, le léger défilement a disparu.

**Ne pas déclarer « Validée » avant vérification sur téléphone.**

## Complément — SPEC 62
Le statut technique de synchronisation reste dans Plus et Réglages. L'accueil **invité** reçoit cependant un bandeau dédié à la création/connexion de compte et au risque de perte de progression locale, sans se prétendre statut de synchronisation cloud.
