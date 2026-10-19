# SPEC 51 — Lettres mélangées : accents révélés seulement après validation

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation visuelle Android à confirmer** |
| Priorité | **P1 — cohérence des lettres mélangées** |
| Branche cible | `v2` |
| Périmètre | `public/parcours.js`, `tests/test_motcache_accents.js`, registre des specs |
| Références | SPEC 11 (découverte/reconstruction), SPEC 21 (identité des tuiles), SPEC 24 (coquilles), SPEC 31 (premier clic PC) |

## 1. Problème

Les **lettres mélangées** affichent des lettres accentuées (`ë`, `é`, `ä`…), mais le validateur actuel ignore les accents comme les autres exercices. L'utilisateur peut donc placer un `e` et être considéré juste face à `ë`, alors qu'on lui a montré une tuile `ë` distincte : la règle affichée est incohérente et peut frustrer les débutants.

## 2. Choix pédagogique

**On n'évalue pas les accents dans cet exercice de mémorisation.** Les **tuiles sont toutes sans accent**. **Pendant la saisie, les cases restent toujours sans accent, même lorsqu'une lettre est correctement placée.** Sinon, l'apparition du tréma donnerait gratuitement la bonne position (`e` devient `ë`, mais `k` reste `k`). Par exemple, on construit visuellement `Letzebuerg`, puis la correction affiche `Lëtzebuerg`.

La correction orthographique stricte des accents relève d'un éventuel exercice distinct, pas des lettres mélangées. **Ne pas modifier la fonction globale `normalize()`** : les exercices d'écriture et les missions continuent de tolérer les accents.

## 3. Règles obligatoires

1. **Tuiles :** convertir chaque lettre proposée (y compris les futures lettres intruses) en sa forme sans diacritique, **en conservant la casse** : `ë → e`, `É → E`, `ä → a`. Les doublons restent des **tuiles distinctes** (SPEC 21).
2. **Cases avant validation :** afficher uniquement la lettre de base choisie, **sans jamais restituer l'accent automatiquement**. Un `e` reste `e` qu'il soit posé à la bonne position (`ë`) ou à la mauvaise (`k`). Même règle au clavier physique, y compris si l'utilisateur tape lui-même `ë` (la tuile utilisée reste `e`).
3. **Validation :** continuer de vérifier le bon ordre des lettres avec la normalisation existante. Une réponse avec les bonnes lettres de base, sans faute d'ordre, reçoit le score complet sans pénalité pour les accents. **Après validation réussie**, toutes les cases affichent l'orthographe luxembourgeoise exacte, accents compris.
4. **Essai incorrect :** **après avoir appuyé sur Valider**, seules les lettres correctement placées sont figées en vert et affichées avec leurs accents éventuels ; les autres sont effacées pour réessayer. Conserver les règles existantes de nombre d'essais et de score. Le texte de l'essai affiché dans le feedback reprend les lettres choisies **sans accent automatique**.
5. **Indice :** révéler la véritable lettre, avec accent si nécessaire, en retirant **une seule** tuile compatible parmi les tuiles libres. Une tuile libre ayant le bon caractère de base suffit (sans accent).
6. **Reprise / effacement :** la touche `⌫`, les caractères répétés, les espaces, apostrophes, traits d'union et la saisie clavier ne changent pas de comportement. Les lettres non corrigées restent sans accent tant que l'utilisateur n'a pas validé.
7. **Découverte / correction :** afficher l'orthographe **standard intégrale** du mot, accents inclus.
8. **Périmètre :** seulement le module **Mot caché / lettres mélangées** du moteur v2 ; pas de changement du quiz, des trous, de l'écriture, de la mission ni des anciens exercices de l'application.
9. **Ergonomie :** lorsqu'un mot comporte un accent, indiquer « Les accents apparaissent après validation ». Ne jamais afficher de tuile accentuée. Cette information n'est pas un indice payant.
10. **Cas de même base :** que la lettre attendue soit `e`, `ë` ou `é`, poser `e` affiche **toujours `e` avant validation** ; ce n'est qu'après correction que l'emplacement reconnu bon devient éventuellement `ë` ou `é`.

## 4. Implémentation ciblée

- Conserver la fonction utilitaire locale `mcSansAccent()` pour les tuiles. Supprimer la conversion immédiate `mcLettreDansCase()` qui dévoile la bonne position.
- Dans `nouvellesTuiles()`, construire les tuiles à partir de la **base non accentuée** des lettres attendues (et garder leurs indices).
- Dans `renderCases()`, montrer **la lettre de la tuile sans accent** lorsqu'elle est posée ; les cases révélées par une validation ou un indice continuent de prendre `c.ch` (orthographe originale).
- Garder la logique de `mcLettresTapees()`, `mcLettresParCase()`, `mcSaisie()`, `mcValider()` et leurs barèmes existants ; dans le feedback de `mcValider()`, ne pas accentuer l'essai saisi avant correction.

## 5. Tests d'acceptation

- [x] Aucun accent dans les tuiles pour `Lëtzebuerg`, `Äddi`, `Éislek` et `Mëllech`.
- [x] **Avant validation**, `e` reste `e` même à la place de `ë` / `é`, et `A` reste `A` même à la place de `Ä`.
- [x] Une mauvaise lettre ne se transforme jamais en la lettre attendue ; aucune différence d'apparence avant validation ne révèle la bonne position.
- [x] Les mêmes lettres de base peuvent être utilisées à des positions accentuées et non accentuées, sans confusion d'identité des tuiles.
- [x] **Après validation** : accents rétablis dans les cases correctes figées en vert et dans la réponse finale. Les lettres encore à chercher restent neutres.
- [x] Tuiles posées / retirées, indice (une tuile consommée, sans supprimer les doublons), réponse correcte, réponse incorrecte, verdissement et score.
- [x] Clavier physique : les lettres restent sans accent avant validation, même en saisissant un accent ; elles sont corrigées ensuite.
- [x] Espaces, ponctuation, casse et articles inchangés ; pas de changement de la normalisation des autres modules.
- [ ] Validation tactile/visuelle sur Android et sur le site déployé.

**À ne pas déclarer « Validée » avant la recette sur téléphone.**
