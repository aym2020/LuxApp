# SPEC 51 — Lettres mélangées : accents automatiques dans les cases

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

**On n'évalue pas les accents dans cet exercice de mémorisation.** Les **tuiles sont toutes sans accent**. Lorsque l'utilisateur pose une lettre de base correcte à l'emplacement d'une lettre accentuée, la **case affichée reprend aussitôt l'accent correct**. Par exemple, les deux `e` proposés peuvent former `Lëtzebuerg` : la case prévue pour `ë` affiche `ë`; l'autre reste `e`.

La correction orthographique stricte des accents relève d'un éventuel exercice distinct, pas des lettres mélangées. **Ne pas modifier la fonction globale `normalize()`** : les exercices d'écriture et les missions continuent de tolérer les accents.

## 3. Règles obligatoires

1. **Tuiles :** convertir chaque lettre proposée (y compris les futures lettres intruses) en sa forme sans diacritique, **en conservant la casse** : `ë → e`, `É → E`, `ä → a`. Les doublons restent des **tuiles distinctes** (SPEC 21).
2. **Cases :** lors d'un placement par clic/toucher **ou au clavier physique**, si la lettre de base correspond à celle attendue dans cette case et que la lettre cible comporte un diacritique, afficher **la lettre cible accentuée** immédiatement ; sinon afficher le caractère posé **sans ajouter d'accent**. Une lettre incorrecte ne doit pas être transformée en bonne lettre.
3. **Validation :** continuer de vérifier le bon ordre des lettres avec la normalisation existante. Une réponse avec les bonnes lettres de base, sans faute d'ordre, reçoit le score complet sans pénalité pour les accents.
4. **Essai incorrect :** ne figer en vert que les lettres correctement placées, accents compris dans les cases figées ; conserver les règles existantes d'indice, d'essais, de réessai et de score.
5. **Indice :** révéler la véritable lettre, avec accent si nécessaire, en retirant **une seule** tuile compatible parmi les tuiles libres. Une tuile libre ayant le bon caractère de base suffit (sans accent).
6. **Reprise / effacement :** la touche `⌫`, les caractères répétés, les espaces, apostrophes, traits d'union et la saisie clavier ne changent pas de comportement. Les lettres insérées depuis le clavier physique restent affichées avec la même règle automatique dans la case.
7. **Découverte / correction :** afficher l'orthographe **standard intégrale** du mot, accents inclus.
8. **Périmètre :** seulement le module **Mot caché / lettres mélangées** du moteur v2 ; pas de changement du quiz, des trous, de l'écriture, de la mission ni des anciens exercices de l'application.
9. **Ergonomie :** lorsqu'un mot comporte un accent, afficher discrètement pendant sa reconstruction « Accents ajoutés automatiquement ». Ne jamais afficher une tuile accentuée. Ce texte n'est pas un indice payant.
10. **Cas de même base :** si la lettre attendue est `e`, poser un `e` affiche `e` ; si elle est `ë` ou `é`, le même `e` affiche respectivement `ë` ou `é`. Le changement d'affichage n'apporte aucun point supplémentaire ni pénalité.

## 4. Implémentation ciblée

- Ajouter deux petites fonctions utilitaires locales au module : enlever les diacritiques d'une lettre et fournir sa représentation dans une case.
- Dans `nouvellesTuiles()`, construire les tuiles à partir de la **base non accentuée** des lettres attendues (et garder leurs indices).
- Dans `renderCases()`, n'ajuster que l'affichage des caractères déjà posés ; les cases révélées par un indice/vert continuent de prendre `c.ch` (orthographe originale).
- Garder `mcLettresTapees()`, `mcLettresParCase()`, `mcSaisie()`, `mcValider()` et leurs barèmes existants ; adapter les commentaires nécessaires.

## 5. Tests d'acceptation

- [x] Aucun accent dans les tuiles pour `Lëtzebuerg`, `Äddi`, `Éislek` et `Mëllech`.
- [x] Dans une case correcte, `e` devient `ë` ou `é`, `A` devient `Ä`, sans changer les cases voisines.
- [x] Une mauvaise lettre ne se transforme jamais en la lettre attendue.
- [x] Les mêmes lettres de base peuvent être utilisées à des positions accentuées et non accentuées, sans confusion d'identité des tuiles.
- [x] Tuiles posées / retirées, indice (une tuile consommée, sans supprimer les doublons), réponse correcte, réponse incorrecte, verdissement et score.
- [x] Clavier physique : la saisie et les corrections affichées sont conformes.
- [x] Espaces, ponctuation, casse et articles inchangés ; pas de changement de la normalisation des autres modules.
- [ ] Validation tactile/visuelle sur Android et sur le site déployé.

**À ne pas déclarer « Validée » avant la recette sur téléphone.**
