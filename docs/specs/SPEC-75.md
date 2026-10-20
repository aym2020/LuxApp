# SPEC 75 — Cours des leçons 1 à 3 : Règles / Lexique / Phrases

| Champ | Valeur |
|---|---|
| Priorité | P1 — pédagogie et ergonomie |
| Statut | **Pilote codé — recette visuelle Android en attente** |
| Objectif | Rendre le **Cours** plus lisible, progressif et utilisable pour écouter du luxembourgeois |
| Portée pilote | **Uniquement les champs `cours` des leçons 1, 2 et 3** (A1.1) et les composants qui les affichent |
| Ne pas modifier | Flashcards, quiz, trous, écriture, missions, scènes, identifiants et progression |
| Dépendances | SPEC 68–73 (audio exact/contextuel), cours du Chemin, design system LuxApp |
| Référence visuelle | [Maquette HTML interactive de la leçon 2](../maquettes/LuxApp_Lecon2_Cours_3onglets.html) |

## 1. Constat

Les leçons 1 à 3 suivent une bonne progression : **saluer et se présenter → nommer des objets → décrire des objets**. Il faut la conserver.

Dans les cours actuels, règles, tableaux grammaticaux, longues listes de vocabulaire, phrases d'exemple et dialogues apparaissent dans un même défilement. Une information est parfois répétée dans plusieurs blocs. La leçon 2 est particulièrement longue : plusieurs dizaines de mots supplémentaires apparaissent dans des tableaux.

**But :** séparer les façons de consulter le même cours, **sans retrancher les notions essentielles ni ajouter de navigation de premier niveau**. Aucun changement demandé pour les exercices et les missions.

## 2. Organisation cible : deux niveaux de navigation

Dans la rubrique **Cours** déjà existante, afficher :

**Sélection de portée** (première rangée) :
- En contexte d'exercice : ouvrir sur l'unité courante, mais afficher directement **toutes les unités** et « Tout », sans défilement horizontal.
- Pour toute consultation : une seule rangée de boutons compacts **1 | 2 | 3 | 4 | Tout** (ou 1 | 2 | 3 | Tout). Chaque bouton est immédiatement visible ; « Tout » affiche toute la leçon. Labels accessibles « Unité N » et « Toute la leçon ».
- La portée agit sur **les trois rubriques** et reste sélectionnée quand on change de rubrique ; changer de leçon réinitialise l'état.

**Rubrique pédagogique** (seconde rangée) : trois onglets internes **Règles | Lexique | Phrases**.
- Onglet initial : **Règles** (une nouvelle entrée dans le cours commence par l'explication).
- Changer de rubrique ne ferme pas le cours, ne modifie pas la progression ni l'exercice et ne transforme pas ces trois vues en onglets principaux au même niveau que Cartes/Quiz/Écrire.
- « Toute la leçon » regroupe par unités successives avec sous-titres, puis contenu transversal. Éviter les doublons.
- Dans le panneau d'exercice, fixer la hauteur à **88dvh** quel que soit le volume de contenu ; l'en-tête, les unités, les onglets et « Revenir à l'exercice » restent stables. Seul le contenu central défile.
- L'interface doit fonctionner aussi bien dans `#tab-cours / #cours-content` que dans `#cours-panel / #cp-content`, idéalement à partir d'un composant/rendu partagé. Conserver l'en-tête, la progression éventuelle et le bouton « Revenir à l'exercice » existants.

### Les trois fonctions

**Règles — comprendre**
- Quelques règles courtes, tableaux de grammaire, distinctions et exemples immédiatement applicables.
- Ne pas transférer automatiquement tout bloc `tableau` dans le Lexique : un tableau « genre / article / négation » appartient aux Règles.
- L'essentiel par unité, sans longue liste de mots. Un exemple nécessaire peut apparaître pour expliquer une règle, sans créer une carte de phrase supplémentaire dupliquée.

**Lexique — mémoriser / retrouver**
- Termes et **expressions courtes** utiles de l'unité, luxembourgeois et traduction française ; article affiché avec le nom.
- **Aucune barre de recherche** dans le cours pilote pour l'instant ; conserver le Lexique global inchangé.
- Essentiel immédiatement visible ; éléments marqués `plus` regroupés sous **« Voir les mots supplémentaires (N) »**, repliés par défaut.
- Les entrées avec indications annexes dans des parenthèses conservent ces indications à l'écran, mais le bouton doit cibler uniquement l'expression effectivement prononcée (conforme SPEC 73).
- Pas de duplication de l'onglet **Lexique global** de LuxApp : il reste inchangé et agrège toujours les leçons. Ici, c'est un lexique **local au cours/unité**.
- Un raccourci discret « Voir les phrases de cette unité » peut sélectionner Phrases en conservant la portée ; ne pas ouvrir une page supplémentaire par défaut.

**Phrases — comprendre en situation et écouter**
- Distinguer **« Phrases à connaître »** (phrases modèles simples, utiles, issues du cours/des unités) et **« Exemples enregistrés du LOD »** (facultatifs, sélectionnés et vérifiés).
- Montrer systématiquement la phrase luxembourgeoise et sa traduction naturelle ; une seule action d'écoute **si et seulement si un fichier audio correct existe**.
- Quand un dialogue figure dans le cours, l'afficher à la fin de Phrases, distinct des exemples, en conservant l'ordre des répliques et leur traduction. Pour les dialogues actuellement marqués `unite: 0`, les montrer seulement dans « Toute la leçon », sauf si leur découpage par unité est explicitement validé.
- Privilégier **3 à 6 phrases courtes et pédagogiques** par unité lorsque le contenu réel le permet. Ne jamais atteindre ce quota artificiellement.
- Refuser les phrases idiomatiques, les sens incorrects, les constructions beaucoup plus avancées, les formulations sans lien direct avec l'objectif, ou les exemples qui introduisent trop de vocabulaire inédit. Un exemple LOD enregistré mais inadapté doit être écarté.
- Les phrases modèles indispensables sont **conservées même sans son** ; ne pas les remplacer par des phrases moins pédagogiques uniquement pour augmenter la couverture.

## 3. Répartition détaillée des contenus existants

| Leçon | Règles | Lexique | Phrases |
|---|---|---|---|
| **1 — Salutations** (4 unités) | `Gudde/Gudden` ; formel/informel `dir/Iech/Dir` ; `Ech heesche/heeschen` ; saluer vs prendre congé | Salutations, réponses à « comment ça va », présentation, politesse, formules de congé | Demander/répondre « comment ça va », se présenter, prendre congé ; dialogue « Premier cours de luxembourgeois » |
| **2 — Objets** (3 unités) | Genre ; `e/en/eng` ; règle du n ; `kee/keen/keng` ; question `Wat ass dat ? / Ass dat… ?` | Objets essentiels avec article ; **36 mots complémentaires** repliés (31 en unité 1, 5 en unité 2) ; expressions courtes de réponse | `Dat ass e Stull.`, `Dat ass eng Dier.`, `Dat ass en Telefon.`, questions et réponses oui/non ; dialogue « Premier jour au bureau » |
| **3 — Couleurs** (3 unités) | Articles définis ; question « Wat fir eng Faarf… ? » ; `a/an` ; négation `net` ; pronoms `en/si/et` | Couleurs, expressions courtes et mots nécessaires, couleurs complémentaires repliées | Décrire un objet, poser une question, relier deux couleurs, dire que la couleur est différente ; dialogue « Aux objets trouvés » |

**Point particulier leçon 2 :** les tableaux « Plus d'objets avec e/eng/en » sont de **l'inventaire lexical**, et non des règles. Les ranger avec le vocabulaire supplémentaire en préservant articles, sens français et les éventuelles informations pédagogiquement nécessaires. Le tableau « Article et négation selon le genre » demeure dans Règles.

**Leçon 1 :** conserver les distinctions `Moien!` vs `Gudde Moien!`, `Gudden Owend!` vs `Schéinen Owend!`, et `Ech heesche` vs `Mäin Numm ass`. Ne jamais uniformiser leurs traductions au point de créer une ambiguïté.

**Leçon 3 :** ne pas transformer les règles sur `net`, `a/an`, articles définis et pronoms en listes de mots décontextualisés ; leur explication et leurs exemples doivent rester accessibles.

## 4. Règles audio (LOD et SPEC 71–73)

Réutiliser **les catalogues et fonctions audio existants** : aucun fichier audio ni URL inventé dans les JSON de leçon.

- **Or `--couleur-action`** : l'enregistrement prononce exactement le mot ou **toute la phrase affichée**, dans le sens voulu.
- **Gris sable `--couleur-audio-contexte`** : un mot/une expression est prononcé au sein d'une **phrase LOD différente**. Au clic, jouer la phrase entière, ouvrir la **bulle flottante SPEC 71**, surligner la forme étudiée en doré, afficher phrase complète et traduction ; aucun décalage de ligne.
- **Sans son vérifié : aucun bouton audio actif**, pas de faux état « audio disponible », pas de lecture TTS automatique.
- Les audios ne sont **pas fournis dans la maquette HTML** : ses commandes « démo » illustrent seulement l'UX. En production, utiliser les fichiers réels et leurs correspondances validées.
- Ne pas détourner le son du lemme pour prononcer un pluriel, un participe ou une expression différente (SPEC 73). Vérifier formes et sens ; privilégier le contexte quand le son exact manque.
- Dans Phrases, pour une phrase LOD enregistrée, l'écoute est un **audio exact de cette phrase** ; pour un extrait non enregistré avec mot contextuel, l'UX doit expliquer **ce qui est réellement entendu**, sans faire croire que la phrase modèle complète est prononcée.
- L'actuel lien **« N exemples en contexte »** de SPEC 71 ne doit **pas être dupliqué** sous chaque bloc Lexique si ces exemples sont déjà visibles dans l'onglet Phrases : proposer un raccourci vers Phrases à la place. Conserver SPEC 71 et l'écran d'exemples ailleurs dans l'application / les leçons non migrées jusqu'à migration décidée.
- Les exemples proposés par `docs/audit-enrichissement-lecons-1-3.md` sont des **candidats, pas une autorisation d'ajout automatique**. N'ajouter que les phrases utiles après relecture du lexique, du niveau, du sens et de la présence réelle du fichier.

## 5. Schéma des cours : classification explicite, sans heuristique fragile

Dans les champs `cours` des leçons pilotes, introduire un champ facultatif `rubrique` avec trois valeurs autorisées :

```json
{ "type": "tableau", "rubrique": "regles", "unite": 0, "titre": "Article et négation selon le genre", "entetes": ["Genre", "Article", "Négation"], "lignes": [["Masculin / neutre", "e", "kee"]] }
{ "type": "vocab", "rubrique": "lexique", "unite": 1, "titre": "Les objets du bureau", "items": [["e Stull", "une chaise"]] }
{ "type": "dialogue", "rubrique": "phrases", "unite": 0, "titre": "Premier jour au bureau", "echanges": [["Dat ass e Stull.", "C'est une chaise."]] }
```

Ceci est un **exemple de structure**, pas un remplacement complet des contenus. Conserver `type`, `titre`, `variant`, `items`, `lignes`, `echanges`, `plus` et le `unite` existant lorsque pertinent.

- `unite: 1/2/3/4` : une unité précise.
- `unite: 0` : uniquement pour « Toute la leçon » (notamment dialogues transversaux).
- `unite` absent : règle/référence générale ; visible quand elle est utile, au maximum **une fois** dans Toute la leçon. Pour les nouveaux blocs, privilégier un rattachement explicite, ou un affichage transversal clairement défini.
- `rubrique` est une décision **pédagogique explicite**, jamais une déduction automatique de `type` (un `tableau` peut être grammatical ou lexical). Si un bloc mélange des fonctions, le séparer en blocs cohérents, sans perdre d'information.
- Réutiliser `plus: true` pour le vocabulaire complémentaire. Dans Lexique, montrer les mots essentiels d'abord, puis les blocs `plus` repliés par défaut.
- Les dialogues, tableaux et phrases dont la traduction inclut une précision de contexte doivent conserver ces nuances dans la nouvelle présentation.
- Pour les autres leçons non migrées, **garder l'affichage Cours existant** ; absence de `rubrique` ne doit pas entraîner de disparition de contenu ni de bloc blanc.
- Ajuster le validateur de leçons pour `rubrique` seulement, sans migration des identifiants, de la progression ou des exercices.

## 6. Interaction et navigation

- Surface **Cours principal** : filtre d'unités + trois rubriques sous le titre/progression. Pas de sixième onglet principal.
- **Panneau Cours** pendant un exercice : même structure, ouverture par défaut sur l'unité de l'exercice, retour à l'exercice sans perdre le texte saisi ni le focus (garder le comportement actuel).
- Conserver l'unité sélectionnée lors du changement Règles/Lexique/Phrases. Changer de leçon réinitialise la rubrique sur Règles.
- Retour Android / Échap : fermer en priorité la **bulle** contextuelle, puis un éventuel écran secondaire d'exemples, puis le panneau Cours, sans fermer toute la leçon par accident ; revenir à l'exercice au même endroit.
- Taper en dehors ferme la bulle, jamais le cours complet. Défilement ou changement de rubrique ferme/repositionne proprement la bulle sans référence DOM obsolète.
- Boutons de portée et onglets accessibles aux lecteurs d'écran (`aria-label`, `aria-selected` / `aria-pressed`), avec cibles tactiles d'au moins 44 px.
- Sur mobile : onglets compacts, titres et traductions lisibles, cibles tactiles confortables, aucun saut de mise en page à l'ouverture audio, aucune carte surdimensionnée ni doubles listes interminables.
- Utiliser le design system de LuxApp : fond sombre, surfaces neutres, or pour l'action exacte, sable pour le contexte. Pas de retour au vert menthe pour l'audio.

## 7. Réalisation technique attendue

- `public/app.js` : composant/rendu partagé des trois rubriques ; le rendu existant `coursBlocsHtml` reste compatible pour les anciennes leçons ; écoute sur les phrases si audio vérifié.
- `public/parcours.js` : synchroniser le filtre d'unité du panneau avec l'onglet interne ; ne pas casser le parcours ni le bouton « Revenir à l'exercice ».
- `public/index.html` et `public/style.css` : deux niveaux de navigation uniquement dans Cours, styles responsives conformes aux tokens.
- `public/contexte.js` et `public/dialogue.js` : réutiliser l'existant, ajuster seulement l'intégration du raccourci vers Phrases et des boutons exacts/contextuels.
- `data/lecons/A1.1/lecon-01.json`, `lecon-02.json`, `lecon-03.json` : **uniquement la clé `cours`**, classement explicite, exemples utiles, aucune suppression d'informations nécessaires.
- Ajouter les tests UI et données ; documenter SPEC et PLAYBOOK.
- Réutiliser les exemples audios du LOD uniquement après audit ; l'absence de nouveaux enregistrements ne bloque **pas** l'UX des trois rubriques.

## 8. Plan de déploiement et recette

**Lot 1 — leçon 2, maquette de référence :**
- Mettre en place le composant Cours partagé et migrer **uniquement la leçon 2**.
- Vérifier toutes les unités et « Tout » visibles simultanément, Règles/Lexique/Phrases, tableaux grammaticaux, 14 mots essentiels, **36 mots complémentaires** repliés et phrases modèles.
- Vérifier la vraie interface et les boutons sur Android, y compris le panneau ouvert depuis un exercice.

**Lot 2 — leçons 1 et 3 :**
- Migrer les deux cours avec leurs 4 et 3 unités, dialogues transversaux, distinctions pédagogiques et audio si réellement disponible.
- Comparer les contenus avant/après avec un inventaire automatique (phrases, termes, traductions, règles) pour éviter les pertes.
- Ne pas migrer les leçons 4+ avant validation du pilote.

**Tests obligatoires :**
1. La rubrique ne perd aucun contenu de référence (règles, vocabulaire essentiel et complémentaire, dialogues) pour 1–3.
2. Tous les tableaux de règles restent dans Règles ; tous les tableaux d'objets complémentaires sont dans Lexique.
3. Une unité sélectionnée filtre correctement chaque onglet ; « Toute la leçon » restitue tout dans l'ordre sans répétition injustifiée.
4. Le lien local « Voir les phrases » conserve l'unité et affiche le bon contenu ; le Lexique global demeure inchangé.
5. Audios : fichiers valides uniquement, type or/sable juste, lecture de la bonne forme, bulle sans layout shift, aucun bouton trompeur.
6. Changement d'unité et d'onglet, défilement uniquement dans le contenu, hauteur du panneau constante, Retour Android et Échap ; le panneau refermé reprend l'exercice **sans perte d'état**.
7. Les autres leçons continuent à afficher leurs cours comme avant ; aucune régression SPEC 71–74.
8. Diff automatique des JSON : **flashcards, quiz, trous, ecriture, mission, scene, unites, IDs et progression inchangés**.
9. Exécuter les tests ciblés puis la suite critique (`tools/critique.sh`), vérifier visuellement téléphone étroit + grand écran.

**Critères de validation :** le cours est plus court à consulter, les notions sont retrouvables dans la bonne rubrique, les audios affichés correspondent aux vrais fichiers, aucun contenu essentiel ni comportement de navigation n'est perdu.

## 9. Maquette : statut et limites

La maquette livrée avec cette SPEC est une **référence UX autonome**, non le code à copier tel quel dans `public`. Elle contient des mots réels de la leçon 2 et des commandes de démonstration. Elle n'embarque **pas** les MP3/M4A et ne prétend pas que toutes les phrases LOD sont enregistrées.

L'implémentation doit reprendre l'organisation et le ton visuel, mais intégrer les vrais catalogues, les règles de navigation, les textes validés et les composants natifs de LuxApp. Ne pas traiter l'audio simulé comme disponible.

## Implémentation pilote (20/10/2026)

- Rendu partagé `public/cours75.js` dans Cours principal et panneau d'exercice (2 rangées : portée puis rubrique).
- Classement `rubrique` explicite dans les seuls champs `cours` des leçons A1.1 1–3. Les phrases modèles sont reprises des unités et scènes validées ; dialogues transversaux inchangés et réservés à « Toute la leçon ».
- Aucun champ de recherche locale, 36 objets complémentaires repliés, reprise de l'audio LOD existant sans URL inventée.
- Aucun changement aux exercices, aux identifiants, à la progression ou aux leçons 4+.
- Tests de données et de rendu sans navigateur : `node tests/test_spec75.js`. Contrôles complémentaires : `node tools/valider-lecons.js` et `bash tools/critique.sh`.
- Recette Android réelle à réaliser avant statut « validé » : rangée complète visible sur écran étroit, hauteur stable, défilement du contenu, audio exact/contextuel, retour et vue libre vs exercice.

## Correctifs de recette Android (20/10/2026)

- **Décision finale** : toutes les unités numérotées et « Tout » sont visibles côte à côte, sans zone défilante, dans les deux surfaces.
- **Décision finale** : suppression complète de la recherche locale dans le cours pilote. Son éventuel retour sera une SPEC distincte.
- Mot/phrase et haut-parleur regroupés dans une même zone flex ; sur téléphone, traduction sous le luxembourgeois pour éviter les icônes rejetées à la ligne.
- Les expressions composées de l'échelle des réponses (Ganz gutt!/Tipptopp!, Ganz schlecht./Guer net gutt.) et Awar!/Awuer! sont divisées en entrées distinctes. Aucun exercice ou audio n'est modifié.
- Son exact LOD TIPPTOPP1 déjà présent : il devient découvrable dans le cours grâce à la séparation de la cellule.
- Pour « Et geet. » et « Net immens. », l'absence de correspondance audio dans les tables locales ne démontre pas une absence sur LOD ; ne pas attribuer de phrase d'un autre sens.
- Validation du design et des retours au clavier réel sur Android toujours nécessaire.

## SPEC 75 — Ajustement définitif de navigation mobile (20/10/2026)

- Panneau Cours d'exercice à hauteur **constante : 88 % du viewport dynamique (`88dvh`)**, quelle que soit la taille du contenu d'une unité. Seul `#cp-content` défile. Ne pas modifier le comportement des autres panneaux.
- Rangée d'unités **entièrement visible** : boutons `1 | 2 | 3 | 4 | Tout` pour la leçon 1 et `1 | 2 | 3 | Tout` pour les leçons 2 et 3. Une grille à colonnes égales remplace le défilement horizontal, y compris depuis un exercice. Labels `aria-label` détaillés conservés.
- Le panneau ouvert pendant un exercice démarre sur l'unité travaillée, mais ne masque pas les autres unités. Le passage à une autre unité ne modifie aucun état d'exercice.
- Recherche locale **supprimée** (input, JS et CSS). Le lexique global n'est pas concerné ; les mots complémentaires restent dans des `details` repliés.
- Les anciennes exigences de la maquette sur défilement horizontal, recherche et portée limitée en exercice sont remplacées par ces décisions ; elles ne doivent plus être réintroduites.
- Recette encore nécessaire sur Android, notamment hauteur constante entre unités courtes/longues, position du bouton de retour, tailles tactiles et absence de débordement sur écran étroit.
