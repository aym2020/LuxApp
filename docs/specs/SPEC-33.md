# SPEC 33 — Mon chemin continu, unités validées par mission et en-tête stable

| Champ | Valeur |
|---|---|
| Statut | **À faire — non implémentée** |
| Priorité | **P0** |
| Branche | `v2` |
| Périmètre | `public/chemin.js`, `public/style.css` ; éventuellement `public/niveau.js` et `public/parcours.js` uniquement si nécessaire à l'affichage |
| Origine | Captures Android du 18/10/2026 : leçon 1 validée par mission, groupe « Terminées », réouverture de la carte et saut du bandeau « Mon chemin » |

## Objectif

Le parcours doit être **une chronologie continue de leçons dans l'ordre numérique**. Valider une mission doit rendre la leçon et ses unités visuellement acquises (vertes), même si certaines unités ont été franchies par raccourci. Mais les **vrais scores et étoiles des exercices ne sont jamais inventés**.

Déplier ou replier une leçon ne doit **jamais faire disparaître, descendre puis remonter, ou clignoter** « Mon chemin », « X terminée(s) », « X en cours ». Conserver l'accordéon et une navigation agréable, sans sauts du scroll.

Cette SPEC **remplace uniquement le regroupement en bloc « Terminées » décrit dans l'implémentation historique de la SPEC 13**, et complète les règles visuelles de la SPEC 32. Les règles métier de réussite de mission restent celles de la SPEC 32 (une vie restante minimum).

## 1. Les leçons restent dans le chemin

- Afficher toutes les leçons, **terminées, en cours et à venir**, dans leur ordre initial **1, 2, 3, 4, 5, 6…**, indépendamment de l'ordre dans lequel elles sont jouées.
- **Supprimer le regroupement qui déplace les leçons acquises dans une grande carte verte « Terminées »** en haut du chemin. Conserver le compteur « X terminée(s) » de l'en-tête, qui sert de synthèse, pas de deuxième liste interactive.
- Chaque leçon occupe **une seule position et une seule carte**. En l'ouvrant, cette **même carte** se déplie sur place ; aucun double affichage ailleurs dans le parcours.
- Une leçon réussie par mission, même quand des leçons précédentes ne sont pas validées, **reste à son numéro**. Ne jamais écrire « Leçons 1 à 5 » si les leçons 2–4 ne sont pas validées.
- Garder **une seule leçon développée à la fois** (SPEC 13), toutes les autres repliées ; possibilité de tout replier. Les leçons validées restent accessibles.
- Réutiliser le design existant : chemin vertical, numéros, couleurs pédagogiques de leçon pour les leçons à venir ; pas de refonte générale.

### Exemple logique (même écran, sans deuxième bloc)

```text
Mon chemin                        PARCOURS A1.1
● 1 terminée                     ● 1 en cours

✓  LEÇON 1 · Salutations et comment ça va
   Validée par la mission                     ▾

▶  LEÇON 2 · Identifier des objets            ▾
   Prochaine leçon

○  LEÇON 3 · Décrire des objets                ▾
○  LEÇON 4 · Les contraires                    ▾
○  LEÇON 5 · Les nombres…                      ▾
```

L'exemple est un schéma de comportement, **pas** une maquette pixel-perfect ; ne pas tricher en réduisant police, largeur, textes ou zones tactiles.

## 2. Leçon et unités validées : vert, même après le raccourci

- Une leçon validée grâce à la mission adopte **l'état visuel vert acquis dans sa carte repliée ET dépliée** : rond/coche sur le chemin, bordure/accents et intitulé d'état vert. Ne pas laisser une carte de leçon acquise bordée d'orange ou affichée comme « commencée ».
- L'en-tête de la carte peut afficher **« LEÇON 1 · VALIDÉE PAR LA MISSION »** (ou « TERMINÉE » + badge secondaire « Par la mission »). Le libellé doit être explicite sans devenir plus encombrant.
- Les **unités réellement terminées** conservent leur coche verte et leurs **étoiles réellement gagnées**.
- Les **unités non jouées mais couvertes par la mission réussie** prennent un **état de validation verte distinct** (par exemple coche/validation verte et mention discrète « Validée par la mission »), **sans étoiles**. Ce vert représente la validation du parcours par équivalence, **pas** l'exécution des exercices.
- Les unités validées par mission restent **cliquables pour s'entraîner volontairement**. Leur état « validée par mission » est conservé tant qu'elles ne sont pas réellement terminées. Après exercice réel, afficher la coche et les étoiles acquises normalement ; ne jamais transformer artificiellement `getUnitBest`, les statistiques ni les indicateurs de réussite « Sans faute ».
- Une leçon dont les unités ont toutes réellement été faites peut afficher ses étoiles de leçon habituelles. Une leçon franchie avec des unités non jouées **n'obtient aucune étoile globale fictive**.
- Le libellé accessible (lecteur d'écran) doit distinguer « unité faite, N étoiles » de « unité validée par la mission, non réalisée ». Le vert seul ne suffit pas.
- Le statut de mission **« Sans faute »** reste propre à la mission ; il ne signifie pas « toutes les unités faites sans faute ».

## 3. Correction du clignotement du bandeau et du saut vertical

**Symptôme observé :** sur Android, quand les leçons 1 ou 2 sont ouvertes ou fermées près du haut de l'écran, « Mon chemin » et les pastilles « 1 terminée / 1 en cours » disparaissent brièvement avec un mouvement bas/haut.

**Cause fortement étayée par le code actuel :**

- `renderLessons()` refait `box.innerHTML = html` à chaque bascule de l'accordéon, ce qui **recrée aussi `.chemin-tete.entre`**.
- La règle CSS `.chemin-page .entre { animation: entre .25s ease-out both; }` relance alors `@keyframes entre` (de `opacity: 0; transform: translateY(8px)` à l'état normal). C'est la cause probable du clignotement.
- `basculerLeconChemin()` effectue en outre un `window.scrollBy()` de compensation, puis `cadrerCarteChemin()` peut effectuer un deuxième scroll `smooth`. Cela peut amplifier une sensation de saut, particulièrement lors d'un changement important de hauteur.

**Comportement attendu :**

- L'en-tête (« Mon chemin », parcours, pastilles) est **stable, opaque et immobile** pendant toutes les bascules d'accordéon.
- L'animation d'entrée de l'en-tête ne peut jouer **qu'à la première navigation sur l'écran**, jamais à chaque re-render interne. Solution possible : conserver le nœud d'en-tête et ne remplacer que la liste, ou ne pas lui attribuer d'animation pendant une bascule. Choisir la correction **la moins intrusive** qui garantit ce résultat.
- La gestion du scroll effectue **au maximum un repositionnement cohérent par interaction**, seulement si nécessaire. Éviter la concurrence compensation immédiate + recadrage `smooth` qui déplace une deuxième fois la page.
- Sur une carte longue, le début de la carte reste accessible et le CTA demeure atteignable par défilement naturel ; si la carte tient dans la zone visible, la préserver dans la vue autant que possible.
- Conserver les animations utiles des états d'unité, sans relancer les animations du header. Respecter `prefers-reduced-motion`.

## 4. Implémentation ciblée

- `public/chemin.js` : supprimer seulement la construction du groupe `groupe-fini` et ses doubles cartes ; générer **une liste unique ordonnée**. Préserver la logique existante de leçon conseillée, d'étape active, et de navigation directe vers les unités, missions, bilan et cours.
- Pour les unités, dériver uniquement **le statut d'affichage** : `fait = getUnitBest(...) != null` ; `valideeParMission = leconValideeParMission(l.id) && !fait` (ou indicateur équivalent fiable). Aucun `saveUnitBest` artificiel.
- Dans `public/style.css`, différencier par classes une leçon validée, une unité réellement faite, une unité validée par mission, une leçon courante et une leçon à venir ; réutiliser les tokens verts du design system.
- Corriger `.chemin-tete.entre` et/ou le périmètre de re-render pour que la transition n'affecte pas l'en-tête à chaque clic. Examiner également la double correction de scroll dans `basculerLeconChemin()`.
- Limiter le changement au chemin : ne pas refaire l'accueil, les écrans d'exercice ni les données pédagogiques.
- Éviter d'empiler des sélecteurs CSS contradictoires. Tester la cause identifiée, puis arrêter lorsque les critères de recette sont remplis.

## 5. Critères d'acceptation

- [ ] Leçons 1, 2, 3, 4… affichées dans l'ordre permanent ; aucune leçon absorbée par un bloc « Terminées ».
- [ ] Terminer directement la leçon 5 ne change pas la place des autres ni ne suggère que les leçons 2–4 sont acquises.
- [ ] Après réussite de la mission de la leçon 1 avec unités 1–3 faites et unité 4 non faite : **leçon 1 verte** dans la carte fermée et ouverte ; **unité 4 verte « Validée par la mission » sans étoiles** ; unités 1–3 gardent leurs véritables étoiles ; **leçon 2 recommandée**.
- [ ] Rouvrir l'unité 4 reste possible ; après la faire, ses étoiles apparaissent suivant son score réellement obtenu.
- [ ] Aucun « Sans faute » de leçon ou résultat d'unité inventé par le raccourci ; les badges de mission gardent leur signification.
- [ ] Tapoter plusieurs fois sur les leçons 1 et 2 lorsque « Mon chemin » et les pastilles sont visibles : **aucun flash d'opacité, aucun décalage vertical de l'en-tête**.
- [ ] Alterner entre carte courte et carte longue, replier, déplier, revenir d'un exercice : **pas de double saut**, pas de perte de position ni de CTA masqué.
- [ ] Contrôler une largeur Android réelle puis 320/393 px si besoin ; texte accessible, pas de débordement horizontal, zones tactiles ≥ 44 px.
- [ ] Navigation clavier, accordéon, bouton « Revoir », mission, bilan, progression de niveau, cloud et anciennes validations inchangés fonctionnellement.
- [ ] Les tests automatisés existants du chemin et des missions passent ; ajouter des assertions ciblées sur **ordre des leçons**, **état visuel validé par mission** et **stabilité du header**.

## Hors périmètre

Changement de la règle des trois vies (SPEC 32), attribution d'étoiles aux unités non faites, modification des scores, création de nouvelles récompenses, refonte complète du design, changements des JSON pédagogiques.

## Suivi

**Non implémentée.** Cette livraison ne modifie que les spécifications et le registre, **aucun CSS ni JavaScript applicatif**. Références : [SPEC 13](./SPEC-13.md), [SPEC 14](./SPEC-14.md), [SPEC 29](./SPEC-29.md), [SPEC 32](./SPEC-32.md), [Design system](../DESIGN_SYSTEM.md).
