# SPEC 38 — Après une leçon commencée, Retour ne doit plus rouvrir son introduction initiale

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P0** |
| Branche | `v2` |
| Périmètre | `public/navigation.js`, `public/mission.js`, `tests/test_retour_intro.py` (nouveau), `tests/test_decouverte.py`, `PLAYBOOK.md` |
| Origine | Bug signalé le 18/10/2026 sur la **leçon 20**, après un parcours complet et « Refaire mes erreurs » |

## Bug constaté

Reproduction rapportée :

1. Ouvrir **la leçon 20 pour la première fois** depuis le chemin.
2. Voir l'**introduction de mission** ; confirmer « J'ai compris · Commencer ».
3. Enchaîner les exercices jusqu'à leur **écran de résultats**.
4. Cliquer sur **« Refaire mes erreurs »** ; refaire la question ratée et la réussir.
5. Depuis le résultat ou l'écran suivant, utiliser **Retour** (flèche en haut à droite, puis éventuellement autres Retours).

**Comportement observé :** le bouton Retour indique **« Introduction »** et ramène finalement à l'écran d'introduction initial, comme si l'utilisateur venait de découvrir la leçon pour la première fois. La navigation semble revenir à un état déjà dépassé malgré les exercices terminés.

**Impact :** rupture du parcours, titre de destination trompeur, risque de relancer à tort une entrée « première découverte ». Aucun effacement de progression n'a été démontré ; ne pas prétendre à une perte de données sans preuve.

## Diagnostic établi sur `v2`

- `ouvrirIntroMission()` ouvre `view-msintro` en l'inscrivant dans l'historique `pileNav`.
- `confirmerIntroMission()` persiste la confirmation `marquerIntroMissionVue(pLecon.id)` puis lance `openIntro(u.id)`, **sans retirer `view-msintro` de la pile de navigation**.
- `noterNavigation()` considère `view-msintro` comme un écran de navigation de niveau 3 et `view-pintro`, `view-parcours`, `view-pfin` comme des activités. Les activités se remplacent entre elles, mais la pile conserve le niveau 3.
- `refaireErreurs()` lance une nouvelle activité `startUnite(..., 'erreurs', ...)`, puis `finirRun()` affiche `view-pfin`. Lors d'un `retour()`, l'activité est dépilée et l'introduction périmée peut redevenir le sommet.
- `restaurerEcran()` sait réafficher `view-msintro` par `renderIntroMission()`, ce qui explique l'apparence « première fois ».

**Cause probable, directement appuyée par le code :** persistance d'une **introduction déjà confirmée dans l'historique**, pas forcément une réinitialisation des acquis. Le parcours n'a pas été reproduit automatiquement sur un navigateur au stade de cette SPEC : vérifier l'hypothèse avec un test de navigation ciblé.

## Comportement attendu

### A. Introduction confirmée = étape de découverte consommée

- Lorsque l'utilisateur confirme **« J'ai compris · Commencer »**, l'introduction initiale n'est **plus une destination de Retour** pour le parcours engagé.
- Une fois les exercices lancés, les changements `view-pintro` → `view-parcours` → `view-pfin` → `view-parcours` (« Refaire mes erreurs ») → `view-pfin` **ne doivent jamais réintroduire** cette introduction périmée.
- Après le rattrapage réussi et un Retour, rejoindre **le contexte valide à partir duquel l'utilisateur avait ouvert la leçon** : « Leçon 20 » si la navigation venait de la fiche de leçon, ou « Mon chemin » si elle venait directement du chemin ; ne pas inventer un passage par « Introduction ».
- La destination doit être visible **avant l'appui** : l'intitulé « Retour à … » correspond exactement à l'écran qui sera réellement restauré. Ni « Introduction » trompeur, ni écran fantôme dans la pile.
- La progression pédagogique déjà sauvegardée, le statut des unités, leurs étoiles, l'état des erreurs et les résultats **ne changent pas** à cause de ce correctif. L'introduction peut rester consultable **par une action volontaire et explicite** si une telle entrée existe, mais pas via l'historique courant une fois consommée.

### B. Exploration sans engagement : préserver l'introduction (SPEC 18)

- Tant que l'utilisateur est **en découverte**, cliquer sur **« Voir les unités »**, puis Retour, doit **bien revenir à l'introduction**. Ouvrir l'écran des unités n'est pas une confirmation.
- Si depuis « Voir les unités » l'utilisateur **lance réellement une unité**, l'introduction ne doit plus être conservée comme écran de Retour de la nouvelle activité. Si la confirmation explicite n'a pas été cliquée, cette transition de navigation ne doit **pas forcément écrire** `intro.mission=1` dans la progression : distinguer le fait de commencer à apprendre du fait de confirmer l'introduction.
- « Tente ta chance » lancé **en exploration** doit préserver sa règle d'historique existante tant que la leçon n'a pas été effectivement validée et que l'introduction n'a pas été confirmée. Ne pas casser la possibilité de revenir à l'introduction après une tentative abandonnée ou échouée, si c'était le parcours prévu.
- Après **réussite** d'une mission et validation de la leçon par raccourci (SPEC 32), ne pas permettre à un retour de faire réapparaître un état « Première découverte » périmé. Le statut validé est prioritaire.

### C. Navigation cohérente sur tous les boutons Retour

- Même destination logique pour le **Retour de l'en-tête**, le **Retour système Android**, et le Retour du navigateur/PC lorsqu'il est géré par l'application.
- Les actions **« Retour à la leçon »**, **« Mon chemin »**, **« Accueil »** et **« Continuer »** restent cohérentes avec la pile ; pas de rebond vers une ancienne introduction en faisant plusieurs Retours successifs.
- Retour depuis une **introduction d'unité** (`view-pintro`) reste autorisé lorsqu'elle représente l'activité actuelle ; ne pas confondre cette étape avec l'**introduction initiale de mission** (`view-msintro`). Ne pas supprimer toutes les introductions indistinctement.
- Conserver l'accordéon ouvert sur la bonne leçon et la position du scroll quand l'utilisateur revient à « Mon chemin » (SPEC 14/15/25).
- Limiter l'historique à des étapes réellement parcourues et encore pertinentes ; ne pas créer de boucles, de doublons ni d'écrans qui apparaissent deux fois sur une unique action.

## Pistes d'implémentation (sans imposer de technique)

- Ajouter dans la gestion centralisée de la navigation une **transition explicite de consommation de l'introduction initiale** au moment de « J'ai compris » ou du premier exercice réellement commencé depuis l'exploration.
- Nettoyer **uniquement** l'entrée `view-msintro` périmée de **la même leçon**, sans effacer les niveaux « Accueil », « Mon chemin » ou « Leçon ». Recalculer correctement le label du bouton Retour après changement de pile.
- Examiner les interactions entre `noterNavigation()`, `pileAvantAppui`, `ecranPrecedent()`, `retour()`, `restaurerEcran()`, `confirmerIntroMission()` et `refaireErreurs()`.
- Sur un Retour de rattrapage, ne pas utiliser un `pResultat` ou un `pIntroUnite` ancien pour rouvrir la mauvaise leçon. Conserver le contexte courant de l'unité 20 réellement concernée.
- **Aucun changement des JSON pédagogiques**, des règles de score, ni de la logique de sauvegarde des exercices. Éviter une refonte générale du routeur.

## Critères d'acceptation et tests

- [x] **Régression exacte leçon 20** : première découverte → « J'ai compris » → unité complète avec une erreur → résultats → « Refaire mes erreurs » → bonne réponse → résultat final → Retour. **Jamais « Introduction »** dans le libellé ni comme destination.
- [x] Après ce Retour, afficher « Mon chemin » ou « Leçon 20 » selon l'entrée réelle ; **étoiles, avancement et historique d'erreur inchangés**.
- [x] Refaire trois fois Retour après rattrapage : aucune boucle entre première introduction, introduction d'unité et résultats précédents.
- [x] Depuis introduction initiale → « Voir les unités » → Retour **sans démarrer d'unité** : introduction initiale retrouvée comme auparavant.
- [x] Depuis introduction initiale → « Voir les unités » → démarrer une unité → résultats → Retour : ne pas revenir à l'introduction initiale.
- [x] Depuis introduction initiale → « Tente ta chance » → quitter/échouer : comportement d'exploration antérieur conservé ; si mission réussie et leçon validée : pas de retour vers un état de première découverte.
- [x] Démarrer une leçon déjà commencée ou déjà validée : aucun Retour intempestif vers la première introduction.
- [ ] Tester flèche UI + bouton Android ; vérifier clavier/Échap et bouton navigateur si applicables. *(Flèche de l'app et Retour navigateur testés automatiquement ; recette Android à faire.)*
- [x] Tester retour d'exercice interrompu et reprise enregistrée, retour depuis fiche de leçon, et retour depuis le chemin sans fiche intermédiaire.
- [x] Tests de navigation existants `test_navigation.py` et `test_retours.py` ; ajouter au moins un test de régression reproduisant **la pile exacte avant/après correction des erreurs**.

## Non-régression et suivi

- Respecter [SPEC 15](./SPEC-15.md) (retour exact et position), [SPEC 18](./SPEC-18.md) (découverte sans engagement), [SPEC 25](./SPEC-25.md) (retour/scroll), [SPEC 32](./SPEC-32.md) (validation par mission).
- Préserver toutes les données locales/cloud. Aucun nouveau champ de progression requis pour une simple correction de pile.
- **À faire** : aucune implémentation applicative dans le commit de rédaction. Lors de l'implémentation, renseigner les fichiers changés, les tests réalisés et la recette Android. Ne pas déclarer « Validée » sans reproduction fonctionnelle.

## Implémentation (18/10/2026)

**Cause confirmée** par un test qui échoue sans le correctif : dès « J'ai compris · Commencer », la pile vaut `Accueil > Mon chemin > Introduction > intro d'unité` et le bouton Retour affiche « Introduction ». L'introduction confirmée restait dans l'historique sous toutes les activités qui suivaient (exercice, résultats, « Refaire mes erreurs »).

**Correctif (routeur seulement, aucune donnée de progression touchée) :**

- `navigation.js` : nouvelle fonction `oublierIntroMission(leconId)`, qui retire de la pile (et de `pileAvantAppui`) uniquement l'entrée `view-msintro` de cette leçon. Accueil, chemin et fiche de leçon restent en place.
- `noterNavigation()` l'appelle quand une activité **autre que la mission** est notée : intro d'unité, exercice, résultats. Ça couvre « J'ai compris », une unité lancée depuis « Voir les unités », « Commencer l'unité » après un « Tente ta chance » raté, et « Refaire mes erreurs ».
- La mission (« Tente ta chance ») reste de l'exploration : l'introduction est gardée, Retour y ramène.
- `mission.js` (`finirMission`) : mission réussie, donc leçon validée : l'introduction est retirée et les libellés Retour sont recalculés tout de suite (`majBoutonsRetour`, `majGarde`).
- Lancer une unité depuis « Voir les unités » **n'écrit pas** `intro.mission` : seul « J'ai compris » confirme.
- `view-pintro` (introduction d'**unité**) n'est pas concernée.

**Comportement obtenu :**

| Parcours | Retour |
|---|---|
| Chemin → Introduction → J'ai compris → unité → résultats → Refaire mes erreurs → résultat | Mon chemin |
| Introduction → Voir les unités → Retour | Introduction (inchangé) |
| Introduction → Voir les unités → unité → résultats | Leçon 20, puis Mon chemin |
| Introduction → Tente ta chance abandonnée | Introduction (inchangé) |
| Introduction → Tente ta chance réussie | Mon chemin |

**Tests :**

- `tests/test_retour_intro.py` (nouveau, ajouté à la suite critique) : les cinq parcours ci-dessus, trois Retours supplémentaires sans boucle, leçon déjà commencée, étoiles inchangées. Il échoue sans le correctif.
- `tests/test_decouverte.py` : l'attente « J'ai compris → 1re unité → Retour : introduction » (ancien comportement) devient « Retour : chemin ».
- Suite critique verte.

**Reste ouvert :** recette Android (bouton Retour système).
