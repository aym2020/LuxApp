# SPEC 113 — RED FLAG / CRINGR : contrat produit et recette du sélecteur

**Date de décision :** 29 octobre 2026 · **Branche du code :** `2.1` · **Statut :** implémentée, suites dédiées et recette Chromium vérifiées le 29/10 ; **validation produit Samsung en attente**. La suite critique globale reste rouge sur des échecs reproduits dans la référence. Voir le [rapport de livraison et les réserves](../CRINGR-SPEC-113-RECETTE.md).
**Suivi canonique :** `main/docs/LUX-DEMASQUE-TODO.md`, LD-048 ; ne pas cocher sans recette et accord explicite.  
**Périmètre :** exclusivement `#view-luxdemasque .ld-jeu[data-ecran="selection"]`. Aucun changement de Lux Match ni du moteur de vérité.

> **Ordre de priorité :** cette SPEC 113 remplace toutes les prescriptions contradictoires de SPEC 112 sur le swipe, les boutons, la pile, les textes et la direction artistique. SPEC 112 reste un historique et une source pour les données et contraintes non contredites. Les faits de code ci-dessous sont une photographie du 29/10, **pas une attestation de bon fonctionnement**.

## 1. Intention produit non négociable

RED FLAG est le nom du **jeu** ; Cringr est le nom de l'**application fictive de rencontres**, visible dans le téléphone. Le joueur parcourt des profils de dates, et non des « dossiers » à sélectionner. Les mécanismes d'enquête restent dans le gameplay après l'entrée en rencontre.

| Interaction | Résultat attendu | Ne doit jamais faire |
|---|---|---|
| Glisser la carte vers la **gauche** au-delà du seuil | **NOPE** : afficher le profil suivant | Lancer une rencontre ; écrire un dislike persistant |
| Glisser vers la **droite** au-delà du seuil | **LIKE** : ouvrir la rencontre du profil courant | Revenir au profil précédent |
| Appuyer sur le **cœur** | Même action que LIKE | Déclencher deux rencontres |
| Geste horizontal trop court | Carte revient au centre, profil inchangé | Changer d'index |
| Scroll vertical / pointercancel | Défilement normal / annulation propre | Interpréter comme LIKE ou NOPE |
| Dernier profil rejeté | Retour circulaire au premier profil, **comportement transitoire existant** | Créer un état persistant non spécifié |

**Pas de flèches précédent/suivant, pas de hub de sélection, pas de texte « SWIPE » permanent.** Le rejet est un passage au suivant, pas un enregistrement de préférence. Le LIKE est une entrée en rencontre, pas un système de match supplémentaire. Le seuil actuel de 65 px est conservé jusqu'à mesure sur appareil ; ne pas le changer arbitrairement.

## 2. Composition visuelle attendue

- **Extérieur du téléphone :** titre RED FLAG centré indépendamment du bouton Retour ; respecter la navigation Android existante.
- **Intérieur :** faux téléphone avec statut 21:30 / 5G / encoche, logo Cringr, compteur discret ; ne pas y afficher RED FLAG ou Lux Démasqué.
- **Carte unique :** portrait narratif PS1/low-poly issu du modèle 3D existant, prénom, âge, ville, bio française et statut. Les quatre entrées existantes (Milo, Noah, Tom, profil généré) restent accessibles. L'image doit rester dominante **sans créer de grand vide sous les informations**.
- **Informations :** bloc ancré visuellement au bas de la photo avec dégradé de contraste ; nom et âge en premier, ville puis bio, statut discret. Les textes doivent être lisibles sur **320 px** sans débordement, sans coupure et sans micro-typographie illisible.
- **CTA :** un seul cœur central arcade, zone tactile ≥ 48×48 px, état pressé et focus visible. Aucun bouton de navigation concurrent.
- **Identité :** véritable interface de jeu rétro arcade 8/16-bit ; police bitmap pour l'UI Cringr, contours nets, ombres franches, tampons LIKE/NOPE pixellisés, violet/rose. Ne pas introduire de boutons glossy/SaaS, ni de typographie moderne pour les composants de jeu. **Lisibilité prioritaire :** la police pixel ne justifie jamais un texte minuscule ; adapter la composition et les tailles, pas seulement forcer `font-family`.
- **Feedback :** tampon LIKE pendant drag droit, NOPE pendant drag gauche ; aucun ancien « PRÉCÉDENT/SUIVANT ». Une courte animation de découverte peut se jouer une seule fois via la préférence locale existante, jamais en boucle ; pas de hint permanent. Respecter `prefers-reduced-motion`.
- **Responsive :** ne pas étirer artificiellement la carte à toute la hauteur si cela laisse un vide ; préserver une composition équilibrée aux petites hauteurs et avec barres Android. Si le contenu est long, ne pas le masquer sous le CTA ou l'encoche.

### Critères visuels observables

La capture de référence rejetée montrait un nom/bio en police bitmap trop petite, des retours à la ligne pénibles, un grand vide au bas de la carte et un cœur surdimensionné. **Ces défauts sont des cas de test obligatoires**, pas des choix esthétiques à conserver. Une correction CSS inspectée statiquement ne prouve pas leur disparition.

## 3. Architecture et données à préserver

- `public/lux-demasque.js` : `ldRendreSelection`, `ldBrancherSelection`, `ldSelectionChanger`, `ldSelectionConfirmer`, `ldSelectionCoachmark`, `ldPreparerPortraitSelection`, `ldComposerPhotoProfil`.
- `public/lux-demasque.css` : styles **scopés** au sélecteur ; éviter les blocs concurrents et les nouvelles surcharges en fin de fichier. Vérifier la cascade réelle et les styles calculés.
- `public/index.html` : version des assets et ordre des feuilles de style.
- `public/lux-demasque-core.js` et données `data/jeux/lux-demasque/` : **ne pas modifier** pour une retouche visuelle.
- Conserver les IDs, les clés localStorage de progression, les graines des profils générés, le score, la séquence WebGL, les sons, le retour au hub et la possibilité de rejouer. Ne pas renommer les fonctions `ld*` pour un changement de marque.
- Le portrait est produit à la demande par `m.portrait()`, composé avec les décors `public/art/cringr-*.svg` ; conserver le fallback si la composition échoue. Ne pas créer un deuxième renderer WebGL.
- Le garde-fou `selection.enCours` doit éviter les doubles ouvertures (double clic, swipe + clic, pointeurs concurrents). Examiner aussi les cas d'échec de chargement avant de déclarer ce contrat satisfait.

## 4. Accessibilité et cas limites

La carte doit permettre une navigation **sans drag tactile** : équivalent clavier et alternative accessible discrète au NOPE, sans réintroduire deux grosses flèches. Le cœur doit être accessible par clavier et avoir un libellé explicite ; focus visible, tailles tactiles et contraste contrôlés. **Ces fonctions ne sont pas attestées comme implémentées.** Ne pas inventer une solution graphique sans l'éprouver.

Tester : 1 seul profil si données partielles, 4 profils, profil déjà résolu, profil généré, retour du rendez-vous, swipe rapide, drag interrompu, multitouch, souris, clavier, portrait lent/échoué, texte long, rotation, rechargement, réduction des animations, absence de stockage local. Aucun geste ne doit corrompre la progression.

## 5. État initial du 29/10, avant la recette ci-dessous (historique)

- Le rendu `ldRendreSelection()` produit la coque Cringr, le compteur, la carte et le cœur ; aucun bouton précédent/suivant dans ce DOM.
- `ldBrancherSelection()` : drag horizontal, seuil strict `Math.abs(dx) > 65`, droite → `ldSelectionConfirmer()`, gauche → `ldSelectionChanger(1)`. Geste vertical et annulation ont des chemins dédiés.
- `ldSelectionConfirmer()` positionne `selection.enCours` avant `ouvrirLuxDemasque(...)`.
- `ldSelectionCoachmark()` utilise `ldSwipeVu` et respecte le mouvement réduit.
- Le CSS a été consolidé après une capture rejetée ; le cache CSS/JS a été incrémenté à `v=16`. **Cette intervention n'a été vérifiée que statiquement** : aucune preuve que le vide, la bio ou les proportions sont corrigés.
- Les tests statiques de sélection ont été modifiés ; leur **exécution réussie n'a pas été démontrée**. Des assertions anciennes de SPEC 112 peuvent encore être obsolètes.

Ne pas considérer les commits précédents comme une validation. Vérifier le SHA distant et les modifications d'autres agents avant toute intervention.

## 6. Procédure d'implémentation pour Claude (ordre bloquant)

1. Lire `PLAYBOOK.md`, `AGENTS.md`, `docs/LUX-DEMASQUE-TESTS.md`, `docs/LUX-DEMASQUE-VALIDATION-ECRANS.md`, SPEC 112 et 113, puis le TODO **sur `main`** ; lire le code actuel **sur `2.1`**. Vérifier les derniers commits.
2. Reproduire les défauts dans un navigateur réel et prendre les captures **avant**. Inspecter dimensions, DOM, styles calculés, cascade CSS et interactions. Ne pas déduire le rendu d'une lecture de CSS.
3. Corriger la **cause racine**, avec le plus petit périmètre cohérent. Ne pas empiler de CSS compensatoire ; ne pas modifier le moteur, les données ou Lux Match.
4. Actualiser les tests de comportement et les assertions historiques obsolètes **sans supprimer la couverture** ; tester explicitement gauche, droite, cœur, geste court, scroll vertical, annulation et garde double action.
5. Exécuter `bash tools/test-lux-demasque.sh rapide`, puis `bash tools/test-lux-demasque.sh complet` ; exécuter les tests transversaux pertinents si des composants partagés sont touchés. Ne pas confondre syntaxe, tests Node, Playwright, CI et Samsung.
6. Tester à **320×600, 360×740, 393×852, 430×932** avec captures **après** ; vérifier les textes réels, portrait, zones tactiles, débordements, interactions et états. Comparer avant/après, pas seulement les captures finales.
7. **Si les tests ou la recette navigateur échouent, corriger et relancer avant push.** Si l'environnement empêche une vérification obligatoire, chercher une alternative ; à défaut documenter le blocage et **ne pas déclarer le correctif validé**. Ne pas pousser une retouche UI non vérifiée en la présentant comme une livraison.
8. Après contrôles réussis, pousser sur `2.1` et rapporter SHA, fichiers, commandes/résultats, captures et limites. Demander l'approbation explicite du joueur sur Samsung avant de clore LD-048 ou d'avancer le suivi sur `main`.

## 7. Matrice de recette bloquante

| ID | Scénario | Résultat attendu | Preuve |
|---|---|---|---|
| RF-01 | 4 tailles, carte au repos | Aucun vide disproportionné, bio lisible, pas de débordement | Captures + DOM |
| RF-02 | Swipe gauche >65 px | NOPE puis profil suivant, aucune partie | Playwright |
| RF-03 | Swipe droit >65 px | LIKE puis rencontre courante, une seule ouverture | Playwright |
| RF-04 | Cœur + double activation | Même rencontre, aucune double ouverture | Playwright |
| RF-05 | Geste court / scroll vertical / annulation | Carte recentrée, aucun changement non voulu | Playwright |
| RF-06 | Dernier profil / profil généré / résolu | Wrap cohérent, seed/rejeu/progression conservés | Playwright |
| RF-07 | Clavier, focus, alternative accessible | Entrée et rejet possibles sans drag, libellés corrects | Navigateur |
| RF-08 | Reduced motion, portrait indisponible, stockage refusé | Aucune animation imposée ni blocage | Navigateur |
| RF-09 | Régression autres écrans, Lux Match et sauvegarde | Aucun effet collatéral | Suites existantes |
| RF-10 | Appareil Samsung réel | Proportions, gestes, barres système, scroll et rendu approuvés | Validation produit |

**Définition de terminé :** RF-01 à RF-09 vérifiés, tests rapides et complets verts, captures comparatives produites, puis RF-10 et accord explicite du joueur. En attendant : **À RETOUCHER / NON VALIDÉ**. Ne pas marquer « terminé » sur une simple CI verte.

## 8. Implémentation et recette du 29 octobre 2026

[Rapport complet](../CRINGR-SPEC-113-RECETTE.md) : consolidation des trois couches CSS du sélecteur ; police rétro de lecture auto-hébergée ; nom/ville/bio/statut réordonnés ; cœur pixel de 56 px ; alternative discrète « Passer » ; clavier et focus ; feedback gestuel progressif ; annulation des ouvertures périmées et réessai après échec sans perte de graine.

Tests réels : `rapide` **3/3**, `complet` **11/11**, recette RF-01 à RF-08 sur Chromium avec gestes tactiles CDP, souris, clavier, portrait lent/absent, stockage refusé et texte 200 %. Captures avant/après aux quatre tailles. RF-09 : Lux Match, moteur, cloud et sauvegardes contrôlés ; les **19 échecs globaux** observés existent aussi dans le checkout initial `19c0cdb` (20 échecs dans cette référence, dont `test_actualisation` qui passe après). **Ne pas présenter la suite critique comme verte.** RF-10 non exécuté ; LD-048 reste ouverte jusqu'à accord explicite sur Samsung.

### Correction audio Cringr — 29 octobre 2026 (non validée sur Samsung)

Le sélecteur est un écran **avant la création de la partie** : auparavant, `ldSynchroMusique()` imposait le silence quand `ld.partie` était nulle. Désormais, après l'affichage des profils, Cringr joue la **boucle d'enquête originale existante**, sans nouvelle piste ni nouveau contexte Audio. La boucle est conservée lors d'un NOPE/changement de profil, poursuivie lors d'un LIKE, coupée à la sortie et au bilan ; les préférences `luxDemasqueSon` et `luxDemasqueMusique` restent respectées. Une liste vide et le chargement restent silencieux. Voir `public/lux-demasque.js` et `tests/test_lux_demasque_audio.py`. **Tests automatisés ajoutés, non exécutés dans cette intervention ; écoute et validation Samsung à faire.**

## 9. Retour produit du 29 octobre 2026

**Décision : conserver cette direction artistique comme base de RED FLAG et prévoir uniquement des finitions ciblées.** Retour transmis par le joueur, évoquant trois captures Samsung : composition cohérente, interactions compréhensibles et identité rétro convaincante. Cette note consigne une appréciation visuelle ; les pistes ci-dessous sont **à planifier, non implémentées dans cette intervention**.

### Éléments à préserver

La carte de profil et son portrait dominant, le dégradé de contraste, l'ancrage des informations sans grand vide sous la bio, les tampons LIKE/NOPE et la manipulation de la carte (translation/rotation) constituent la base retenue. Préserver aussi la cohérence du téléphone fictif, de l'encoche, de la typographie bitmap, des contours violets et du cœur rose, ainsi que la séparation entre **RED FLAG** à l'extérieur et **Cringr** à l'intérieur. **Ne pas repartir sur une refonte générale ni retoucher systématiquement la carte et les animations de swipe.**

### Améliorations futures, par ordre de priorité

| Priorité | Retouche envisagée | Contraintes à conserver |
|---|---|---|
| 1 — principale | Remplacer le lien souligné « Passer », trop proche d'un lien web, par un petit bouton secondaire arcade à **croix pixel art**, au contour violet discret, **placé à gauche du cœur central**. | Le cœur reste dominant. La croix déclenche le même NOPE que le swipe gauche. Conserver cible tactile ≥48×48 px, libellé accessible explicite, focus visible et commandes clavier. Ne réintroduire ni grosses flèches ni navigation précédent/suivant. |
| 2 | Raccourcir les bios publiques qui occupent quatre lignes et concurrencent le portrait. | Conserver la taille de police désormais lisible ; travailler d'abord le texte. Préserver les informations utiles au jeu et la cohérence du personnage, sans changer les preuves ni le moteur. |
| 3 | Affiner légèrement le cadre et les doubles contours du téléphone pour rendre quelques pixels au contenu sur Android. | Retouche mesurée, sans perdre la silhouette du téléphone ni son identité rétro ; vérifier les petites largeurs. |
| 4 — non urgente | Rendre « PROFIL 1 / 4 » plus discret ou étudier de petits indicateurs pixellisés plus immersifs. | Conserver une information de position compréhensible et accessible ; ne pas ajouter d'encombrement. |

### Appréciation visuelle transmise

| Critère | Note indicative |
|---|---|
| Direction artistique | 9/10 |
| Cohérence graphique | 9/10 |
| Composition mobile | 8,5/10 |
| Lisibilité | 8/10 |
| Feedback du swipe | 9/10 |
| Hiérarchie des actions | 7/10 |

**Appréciation globale : 8,5/10 sur les captures.** L'amélioration principale attendue porte sur l'harmonisation du contrôle « Passer » avec le cœur.

### Portée de ce retour et suivi

Ce retour apporte une appréciation visuelle positive sur Samsung, avec des finitions à prévoir ; il ne démontre pas à lui seul tous les cas fonctionnels mobiles de RF-10. **LD-048 reste ouverte** et aucune autre étape n'est avancée. Lors d'une future intervention autorisée, reprendre ces priorités, comparer le rendu avant/après et exécuter les contrôles prévus par la SPEC. **La présente intervention modifie uniquement la documentation ; aucun code, contenu ou test du jeu n'est modifié ou réexécuté.**
