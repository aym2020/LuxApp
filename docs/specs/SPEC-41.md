# SPEC 41 — Coquilles expliquées précisément et retour au véritable Chemin après rattrapage

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Branche cible | `v2` |
| Périmètre probable | `public/correction.js`, `public/parcours.js`, `public/navigation.js`, `public/chemin.js`, tests de correction et de navigation (à confirmer après lecture du code) |
| Origine | Retours d'utilisation sur Android, 18/10/2026 |
| Références | [SPEC 24](./SPEC-24.md) (coquilles), [SPEC 40](./SPEC-40.md) (rappels et navigation) |

## 1. Indication précise sur une faute de frappe

### Cas réel à reproduire

- Consigne française : **« La douche est dans la salle de bain. »**
- Saisie : `d'dusch ass aam buedzemmer`
- Réponse attendue : `D'Dusch ass am Buedzëmmer.`
- Écart significatif après normalisation autorisée des majuscules et accents : **`aam` au lieu de `am`** (un `a` supplémentaire).
- Feedback observé : **« Presque : une lettre à corriger. »**, suivi d'une note générique **« Attention : ..., Schlofzëmmer (neutres), Living (masculin) → am. »**.

### Problème

Le moteur semble reconnaître une différence d'une lettre, mais il n'indique pas **où** elle se trouve. La note de grammaire affichée ne correspond pas à l'erreur de saisie : l'utilisateur a doublé une lettre, il ne s'est pas trompé dans le choix de la préposition `am`.

### Comportement attendu

1. Réutiliser et, si nécessaire, affiner l'analyse déterministe prévue par la SPEC 24 : normalisation contrôlée, localisation du token fautif et identification de l'opération (ajout, omission, substitution ou inversion).
2. Pour cet exemple, afficher une aide courte et ciblée, par exemple : **« Presque ! Une lettre en trop dans “aam”. Corrige ta réponse. »**
3. Ne pas afficher une règle grammaticale hors sujet lorsqu'une **coquille orthographique probable** explique entièrement l'écart. Afficher une règle seulement si elle aide réellement à comprendre l'erreur.
4. Conserver la deuxième tentative et la validation uniquement après saisie correcte : **ne jamais corriger/valider automatiquement une réponse approximative ni révéler d'emblée toute la solution**.
5. Conserver les tolérances existantes de casse, accents et ponctuation, ainsi que les protections de la SPEC 24 (articles, négations, pronoms, conjugaisons, mots distincts valides, ambiguïtés). Ne pas requalifier à tort une erreur grammaticale en coquille gratuite.
6. Si l'écart ne peut pas être localisé avec confiance, rester sur un message prudent plutôt que donner une indication fausse.
7. Conserver le suivi des tentatives et de la progression prévu par la SPEC 24.

## 2. Retour au véritable écran « Chemin » après « Refaire mes erreurs »

### Cas réel à reproduire

Après une unité terminée, l'utilisateur lance **« Refaire mes erreurs »**, puis clique sur **« Retour à la leçon »** / **« Retour leçon »**. L'application affiche la **vue détaillée des unités** de la leçon (« Unité 1 · terminée », « Unité 2 », boutons d'entraînement, etc.), avec l'onglet Chemin sélectionné, au lieu du **Chemin principal**.

### Comportement attendu

1. À la sortie du rattrapage, le CTA de retour doit mener au **Chemin principal (parcours global des leçons)**, **pas à la liste détaillée des unités** de la leçon.
2. Afficher la **leçon qui vient d'être travaillée** dans ce parcours et positionner le scroll pour qu'elle soit visible, idéalement centrée dans la zone disponible (en respectant en-tête et navigation inférieure).
3. Ne pas ouvrir automatiquement le détail des unités. Si nécessaire, renommer le CTA **« Mon chemin »** pour que son libellé corresponde exactement à sa destination.
4. Appliquer la même destination cohérente au retour depuis les résultats de rattrapage (bouton prévu à cet effet, flèche Retour et Retour système Android, selon le contexte). Éviter toute restauration d'historique qui réintroduirait la vue des unités.
5. Préserver la progression, les étoiles, les erreurs, l'état des unités et le contexte de la leçon. Ne pas modifier les retours hors du parcours « Refaire mes erreurs ».
6. **Précision par rapport à la SPEC 40 :** « revenir au Chemin » signifie ici **revenir au niveau principal des leçons**, sans afficher la vue détaillée des unités. Le comportement de la SPEC 40 doit être ajusté sur ce point précis.

## 3. Tests ciblés et critères d'acceptation

- [x] Reproduire `d'dusch ass aam buedzemmer` : le moteur indique l'excès d'une lettre dans `aam`, **sans conseil grammatical hors sujet**.
- [x] Une réponse corrigée à la deuxième tentative est acceptée selon les règles de la SPEC 24, sans auto-validation de la première saisie.
- [x] Les exemples d'erreurs grammaticales proches mais réelles restent traités comme des erreurs ; la casse et les accents tolérés restent tolérés.
- [x] Depuis **« Refaire mes erreurs » → « Retour à la leçon »**, l'application montre la **vue principale Chemin** avec la bonne leçon visible, **sans ouverture de sa liste d'unités**.
- [x] Vérifier le même cheminement pour le Retour de l'interface et d'Android, sans casser la navigation ordinaire.
- [x] Préserver les données de progression et relancer les tests de correction/navigation concernés avec les helpers rapides de la SPEC 39.

## Livraison attendue

Implémenter un correctif **minimal**, avec tests de non-régression. Ne pas refondre le moteur de correction ni les écrans de navigation, et ne pas modifier les données des leçons. Documenter les fichiers touchés et les tests réellement exécutés ; ne passer le statut à « Implémentée — validation à confirmer » qu'après livraison du code.

## Implémentation (18/10/2026)

### 1. Faute de frappe localisée — `public/diagnostic.js`

- **Cause :** `am` est un mot court, donc `aam` est classé `mot_court` par `analyserReponse` (SPEC 24). C'est une vraie erreur, à juste titre. Mais l'aide affichait ensuite le diagnostic générique « une lettre à corriger » et la règle de grammaire masquée.
- **Correctif :** nouvelle fonction `diagnosticLettre()`, utilisée au 1er essai par `aideErreur()` (parcours, mot caché, mission, révision). Elle donne une indication **seulement si** :
  - un seul mot diffère, d'une seule lettre ;
  - le mot tapé n'existe pas (ni forme protégée, ni mot du vocabulaire des leçons).
- Message affiché : « Presque ! Une lettre en trop / Il manque une lettre / Une lettre à changer / Deux lettres inversées dans « mot » », avec le mot tel qu'il a été tapé. La règle de grammaire n'est alors pas affichée.
- **Inchangé :**
  - un autre mot réel (« an » pour « am »), un article, un pronom, un verbe protégé, plusieurs erreurs : aide habituelle, règle comprise ;
  - la coquille gratuite de la SPEC 24 ;
  - la 2e tentative obligatoire : rien n'est validé automatiquement.

### 2. Retour au Chemin principal — `parcours.js`, `chemin.js`, `navigation.js`

- Résultats de « Refaire mes erreurs » : l'action principale reste « Mon chemin ». Le bouton secondaire « Retour à la leçon » (liste des unités) n'est plus proposé.
- `cheminSurLecon()` : chemin principal, leçon **repliée** (pas de liste des unités) et centrée. Cela ajuste la SPEC 40, qui la dépliait.
- Retour (flèche, Android, navigateur) depuis ces résultats : même destination, même si la fiche de leçon est dans l'historique. Le Retour suivant mène à l'accueil.
- Les autres retours ne changent pas.

### Tests

- `tests/test_rappels.py` (déjà dans la suite critique), complété :
  - cas réel `d'dusch ass aam buedzemmer` (leçon 21, item 2005), avec acceptation au 2e essai seulement ;
  - `an` (autre mot réel) qui garde la règle ;
  - forme protégée, plusieurs erreurs, casse et accents tolérés ;
  - chemin replié et centré par le bouton et par Retour, y compris en venant de la fiche de leçon.
- Suite critique `bash tools/critique.sh` : verte.

**Reste ouvert :** recette Android.
