# SPEC 50 — Accepter les salutations équivalentes sans pénaliser l'apprenant

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation Android à confirmer** |
| Priorité | **P1 — frustration en leçon 1** |
| Branche | `v2` |
| Périmètre | `public/correction.js`, `public/parcours.js`, `public/mission.js`, `public/navigation.js`, `data/lecons/A1.1/lecon-01.json`, tests |
| Références | SPEC 24 (coquilles), SPEC 34 (missions), SPEC 44 (reprise), LOD : [gudde Moien](https://lod.lu/artikel/MOIEN1) |

## 1. Problème

Dans la leçon 1, les formes **Moien!** et **Gudde Moien!** sont toutes deux enseignées. Dans une situation du matin, répondre « Moien! » à la place de « Gudde Moien! » est correct, mais le moteur de l'écriture et celui de la mission attendent aujourd'hui l'égalité stricte avec une seule chaîne `lu` : l'utilisateur est pénalisé injustement.

**Orthographe :** `Gudde Moien!` (sans *n* devant M), jamais `Gudden Moien!` dans cette formule. Le dictionnaire LOD atteste `gudde Moien`.

## 2. Comportement attendu

1. Le champ existant `lu` reste la réponse principale, affichée comme référence et utilisée par les exercices historiques.
2. Pour une consigne à plusieurs réponses **réellement équivalentes dans son contexte**, un champ facultatif `alternatives: ["..."]` autorise d'autres réponses correctes.
3. Dans l'écriture des unités et dans la mission, la réponse `lu` **ou toute alternative déclarée** est acceptée comme « juste » dès le premier essai : pas de vie perdue, pas d'erreur enregistrée, score normal, étoiles et sans-faute inchangés.
4. La normalisation **existante** du moteur est réutilisée (casse, accents, ponctuation et espaces ignorés). Ne pas créer d'équivalence globale entre `Moien` et `Gudde Moien` pour tous les exercices.
5. Après réussite, afficher **la forme effectivement reconnue** et préciser les autres réponses acceptées ; dans la mission, la bulle de dialogue reprend la formulation reconnue, y compris après la reprise de session ou au bilan.
6. Sans `alternatives`, le comportement antérieur est **strictement inchangé**. Les quiz, textes à trous, flashcards et autres leçons ne sont pas assouplis.
7. La mission n'accorde pas automatiquement d'erreur de typographie au mauvais mot `Gudden`. Les coquilles continuent d'être traitées par SPEC 24.
8. Une expression dépendante du contexte (ex. le matin) n'est pas déclarée alternative d'un exercice qui exige explicitement une formule valable *à toute heure*.

## 3. Leçon 1 : données

- Écriture **2002** : `Gudde Moien!` ; accepte `Moien!` (consigne du matin).
- Écriture **2005** : `Moien Anna!` ; accepte `Gudde Moien, Anna!` (salutation du matin également valable). Prénom **Anna** inchangé.
- Écriture **2001** : `Moien!` **seul** reste exigé, car la consigne précise « à toute heure ».
- Mission : les trois répliques `toi` de l'unité 1 acceptent les salutations équivalentes :
  - `Gudde Moien, Här Kremer!` ou `Moien, Här Kremer!`.
  - `Gudde Moien!` ou `Moien!`.
  - `Gudde Moien, Madamm Weber!` ou `Moien, Madamm Weber!`.
- La consigne concernant Madamm Weber est précisée « le matin ».
- Le cours, les notes et la règle de l'unité expliquent explicitement l'équivalence **le matin**, sans masquer les deux structures.

## 4. Structure et validation

Exemple :

```json
{
  "id": 2002,
  "unite": 1,
  "fr": "Bonjour ! (le matin)",
  "lu": "Gudde Moien!",
  "alternatives": ["Moien!"]
}
```

Le validateur vérifie que `alternatives` est un **tableau non vide de chaînes non vides**, sans doublon ni équivalence identique à `lu` après normalisation. Le champ n'est ajouté **que sur les écritures et les répliques « toi »** où il est pertinent.

Ne pas changer les IDs : ils indexent la progression des utilisateurs. Ne pas toucher à la version de la mission : les dix répliques, leurs notions et le barème restent les mêmes.

## 5. Tests et critères d'acceptation

- [x] `Moien!` / `Gudde Moien!` et les variantes avec Monsieur/Madame réussissent au premier essai.
- [x] Écriture : premier succès = progression normale, sans incrémenter les erreurs.
- [x] Mission : premier succès = statut `ok`, pas de vie perdue, bulle avec la réponse validée.
- [x] Version avec ponctuation, casse et accents différents : cohérence avec `normalize`.
- [x] `Gudden Moien!`, une formule de départ (`Äddi`) ou un autre destinataire ne deviennent pas équivalents par défaut.
- [x] Une question sans alternatives garde sa réponse unique ; quiz et trous inchangés.
- [x] Reprise de la mission : les formulations validées sont restaurées.
- [x] Tests unitaires du moteur et du JSON ajoutés ; syntaxe et structure contrôlées.
- [ ] Vérification visuelle et tactile Android sur le déploiement `v2`.

**Limite :** les contrôles automatisés ne remplacent pas la recette Android. Conserver ce statut jusqu'à cette vérification.
