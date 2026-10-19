# SPEC 70 — Stratégie audio LOD prioritaire

| Champ | Valeur |
|---|---|
| Priorité | P1 — audio et contenu |
| Statut | **Implémentée sur `v2` — audit à valider ; phrases en attente d'accès à `lod.lu`** |
| Complète | SPEC 66, 68, 69 |
| Fichiers | `tools/lod/commun.js`, `tools/lod/audit-audio.js`, `tools/lod/exemples.js`, `tools/lod/contextes.json`, `tools/lod/construire-index.js`, `tools/lod/lod-index.json.gz`, `tools/audio-lod.js`, `public/audio/lod-contexte.json`, `public/dialogue.js`, `public/style.css`, `public/design-tokens.css`, `docs/audit-audio-lod.md`, `PLAYBOOK.md`, `tests/test_audio_lod.js` |

## Principe

Le LOD sert de source de prononciation **et** de base de phrases pour les prochaines leçons.
La progression pédagogique reste prioritaire : jamais une phrase compliquée à la place d'une phrase simple pour gagner un audio.

## 1. Ordre de recherche de l'audio

1. Son LOD exact du mot (SPEC 66–69) ou phrase enregistrée à l'identique (SPEC 69).
2. Sinon, **audio contextuel** : un exemple LOD qui contient exactement l'expression.
   - Énoncé complet (« Gudde Moien! », « Wéi geet et Iech? ») : il doit former à lui seul une partie de la phrase LOD,
     entre deux signes de ponctuation (« Gudde Moien, Madamm, wat kann ech fir Iech maachen? »).
     Ainsi « An dir? » ne trouve pas « Dir Dammen an Dir Hären ».
   - Fragment (« e bësse », « mat der Kaart ») : au milieu d'une phrase de 8 mots au plus.
   - Toujours un exemple rattaché à un mot LOD de niveau A1 ou A2 (catégories LOD, ajoutées à l'index) ; jamais un mot seul (homographes) ; jamais de partie facultative entre parenthèses.
   - Ce sont des **propositions** : seules celles relues dans `tools/lod/contextes.json` sont utilisées,
     avec le texte LOD et sa traduction française (le LOD ne traduit pas ses exemples : traduction rédigée par Claude).
     Les propositions écartées sont gardées dans `_refusés` avec la raison.
3. Jamais d'enregistrement substitué en silence : la phrase réellement prononcée est toujours affichée.

Relecture faite : 70 propositions, **62 retenues**, 8 refusées (expressions idiomatiques ou sens trompeur,
ex. « Ech hu gekacht vu Roserei » = « je bouillais de rage », proposé pour « ech hu gekacht »).

## 2. Affichage

- Un seul bouton par élément, le son exact en priorité.
- **Or** : prononciation exacte. **Vert menthe** (`--couleur-audio-contexte`) : prononciation dans une phrase, libellé « Dans une phrase ».
- Au clic sur le bouton menthe, la phrase LOD et sa traduction apparaissent discrètement sous le bouton, puis le son est joué.
  Le nom accessible annonce la phrase entière. Pas de lecture automatique.
- Table : `public/audio/lod-contexte.json` `{ "expression": { son, phrase, fr } }`, remplie par `node tools/audio-lod.js`
  (seulement si le fichier M4A est téléchargé et valide).

## 3. Audit (avant toute modification de contenu)

`node tools/lod/audit-audio.js` → `docs/audit-audio-lod.md` : pour chaque leçon, mots avec audio direct, phrases exactes,
expressions avec audio contextuel, éléments sans audio, taux disponible et taux après téléchargement.

Résultat (1 980 éléments luxembourgeois, 25 leçons) :

| | Éléments | Part |
|---|---:|---:|
| Audio direct validé et disponible | 653 | 33 % |
| Phrases enregistrées à l'identique | 26 | 1,3 % |
| Audio contextuel relu | 65 | 3,3 % |
| Sans audio LOD | 1 236 | 62,4 % |

- Couverture actuelle **33 %** ; après téléchargement des phrases identifiées **37,6 %**.
- Par nature : mots seuls **81,5 %**, expressions (2–3 mots) 37,2 %, phrases (4 mots et plus) **2,6 %**.
- **99 % n'est pas atteignable sur les leçons existantes sans les réécrire** : leurs phrases ont été écrites sans le LOD.
- Réservoir pour les prochaines leçons : 57 360 exemples, dont **2 961 simples en A1** et **2 908 en A2** (8 mots au plus).
  Exemple : « Ech wunnen zu Bartreng », « … zu Dikrech », « … zu Hollerech » existent tous enregistrés.

## 4. Création des prochaines leçons

- `node tools/lod/exemples.js "mots"` : exemples LOD enregistrés contenant ces mots, A1 puis A2, les plus courts d'abord, avec l'identifiant.
- Méthode inscrite au PLAYBOOK (§ 10, « Audio LOD d'abord ») : notions → exemples LOD → sélection débutant → exercices construits sur ces phrases, reprises mot pour mot ; règles flashcards / quiz / trous / écriture / cours inchangées.
- Objectif : tendre vers 99 % d'audio LOD sur les nouveaux contenus.
- Leçons existantes : **aucune modification** sans validation de l'audit par Clayton.

## 5. Limite actuelle

Les phrases (exactes et contextuelles) viennent de `lod.lu`, inaccessible depuis l'environnement de Claude (refus du proxy).
Elles sont identifiées mais pas téléchargées ; l'existence de chaque enregistrement est contrôlée au téléchargement.
Après ajout de `lod.lu` aux domaines autorisés : `node tools/audio-lod.js` puis `node tools/lod/audit-audio.js`.

## Recette

- [x] `tests/test_audio_lod.js` : choix relus valides (exemple présent, contient l'expression, texte à jour, traduction), règles de recherche (énoncé coupé refusé, hors A1/A2 refusé, mot seul refusé, parenthèses refusées), bouton or / menthe, phrase annoncée.
- [x] Rendu vérifié au format téléphone : bouton menthe dans le dialogue du cours, phrase et traduction dévoilées au clic.
- [ ] Validation de l'audit par Clayton.
- [ ] Téléchargement des phrases après ouverture de `lod.lu` ; écoute sur Android.
