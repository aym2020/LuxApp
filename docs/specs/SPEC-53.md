# SPEC 53 — Chemin : unités compactes, missions sur une ligne, bilan allégé

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — recette Android à confirmer** |
| Priorité | **P1 — lisibilité du Chemin sur mobile** |
| Branche | `v2` |
| Périmètre | `public/chemin.js`, `public/style.css`, `tests/test_chemin_libelles.js`, registre des specs |
| Compatibilité | SPEC 29/30 (lignes/grilles et lisibilité), 33 (chemin continu), 42 (cadrage), 44 (reprise), 46–48 (statuts et acquis) |

## 1. Constat

Sur téléphone, des lignes d'unités, de mission et de bilan passent inutilement sur 2–3 lignes. Exemple : `sinn : être au présent`, `hunn : avoir au présent`, `Mission / Faire connaissance au café` et `Bilan · 10 questions · Optionnel`. Le dernier mot « Optionnel » passe seul à la ligne. Le grand retrait réservé au parcours et certaines marges réduisent le texte disponible dans les cartes.

## 2. Audit du catalogue réel

Audit réalisé sur la branche `v2` le 19 octobre 2026 : **25 leçons publiées** avec unités et missions.

- A1.1 : IDs **1 à 17** (17 leçons).
- A1.2 : IDs **20 à 27** (8 leçons).
- Les leçons 18, 19 et 28+ ne sont pas présentes dans cette version du dépôt.
- La leçon « Être et avoir au présent » visible sur la capture est actuellement **ID 27**, et non ID 20. Ne jamais baser les règles sur l'ancien numéro affiché sur une capture.
- Les 25 titres de mission ont été relus pour retenir une **description courte du contexte**, sans inventer de situation.
- Seules les unités inutilement verbeuses reçoivent un libellé plus court ; **tous les titres originaux restent conservés dans le JSON, la mission et les attributs accessibles**.
- Pas de coupe automatique de texte au premier deux-points : « Sur un site : op », « Le matin : se préparer et partir » et « Questions et formes courtes : si, hu » démontrent qu'une telle règle changerait ou masquerait la notion. Une sélection manuelle explicite est préférable.

## 3. Comportement attendu

1. **Unités** : afficher, lorsque défini, un libellé `Chemin` abrégé qui transmet la même notion ; sinon afficher l'intitulé complet. La leçon concernée doit être identifiée par **ID numérique** et le contenu original doit être vérifié pour éviter qu'un libellé obsolète survive à un changement du JSON.
2. **Mission** : une seule ligne « Mission · Contexte court » (ex. « Mission · Au café »). Texte complet dans `aria-label` et `title` du bouton, donc toujours accessible, et dans l'écran de mission. Les statuts `Sans faute`, `Réussie`, `À rejouer` restent visibles et exacts.
3. **Bilan** : une seule ligne « Bilan · 10 questions ». **Optionnel** n'est plus affiché dans le Chemin ; cette information reste dans `aria-label` et dans l'écran du bilan. Ne pas changer son caractère facultatif ni son calcul.
4. **Mise en page** : redonner de l'espace à la carte en réduisant modérément la marge entre le rail du chemin et les cartes, l'espacement interne des lignes et les paddings. Préserver les ronds, les traits de progression et les 4 couleurs d'état.
5. **Lisibilité** : unités au maximum sur deux lignes sur smartphone, puis ellipsis seulement si véritablement trop longues. Mission sur une ligne avec ellipsis rare ; toujours l'intitulé complet via l'accessibilité. Les titres des leçons peuvent encore occuper plusieurs lignes normalement.
6. **Toucher** : chaque ligne reste cliquable avec `min-height: 44px`, le bouton jaune et le lien vers toute la leçon ne changent pas, les chevrons restent alignés. Aucun `overflow: hidden` sur la page entière.
7. **Progression** : ne pas modifier l'identité des unités (`id`), les sauvegardes, les points, les étoiles, la logique de navigation, les acquis précédents ni l'éligibilité des bilans.
8. **Évolutivité** : libellés courts réunis dans un seul dictionnaire **strictement de présentation** dans `public/chemin.js`. Chaque entrée garde le titre original attendu et le libellé court. Si le titre source change, revenir automatiquement au titre original au lieu d'afficher un libellé périmé.
9. Éviter de reformuler tout le catalogue simplement pour raccourcir. Les titres courts doivent être naturels, précis et adaptés aux débutants.

## 4. Exemples acceptés

| Titre source | Affichage du Chemin |
|---|---|
| `sinn : être au présent` | `sinn · être` |
| `hunn : avoir au présent` | `hunn · avoir` |
| `Questions et formes courtes : si, hu` | `Questions et formes courtes` |
| `Dans, sur, sous : situer un objet` | `Dans, sur, sous` |
| `La sœur de mon père : désigner un lien familial` | `Les liens familiaux` |
| `Faire connaissance au café` (mission) | `Mission · Au café` |
| `Bilan · 10 questions · Optionnel` | `Bilan · 10 questions` |

## 5. Vérifications

- [x] Relecture des 25 leçons actuelles, unités et titres des missions du dépôt GitHub.
- [x] Leçons A1.1 et A1.2 : sortie du composant contrôlée pour tous les IDs.
- [x] Titres d'unités raccourcis uniquement si justification pédagogique ; les autres ne changent pas.
- [x] 25 contextes de mission distincts audités ; pas de confusion entre titres.
- [x] Mission (état sans faute / réussie / à rejouer) et bilan (optionnel) : information accessible conservée.
- [x] Navigation `ouvrirUniteDepuisChemin`, `ouvrirMissionDepuisChemin`, `lancerBilanDepuisChemin` inchangée.
- [x] CSS mobile / largeurs minimales / syntaxe et tests des specs précédentes.
- [ ] Recette visuelle tactile sur Android (320–430px de large, taille de police agrandie, titres longs et statut d'unités avec étoiles).
- [ ] Estimation de gain de hauteur à confirmer sur le téléphone, sans chiffre promis avant mesure.

**À ne pas déclarer « Validée » avant la recette Android.**
