# Watfir — Accueil Pop Editorial (branche `dev`)

## Objectif

Intégrer l'exemple HTML « Watfir — Accueil », validé visuellement le 21 octobre 2026, dans l'application réelle. L'interface conserve la hiérarchie du prototype, mais **aucun contenu fictif ni bouton simulé** n'est transféré en production.

Cette étape concerne **uniquement l'accueil**. La structure pédagogique, les JSON, les exercices, le parcours, la progression, l'authentification et la synchronisation restent inchangés.

## Référence artistique

| Élément | Décision | Application |
| --- | --- | --- |
| Palette | Papier `#F2EEE5`, noir `#101110`, turquoise `#08D9BD`, orange `#FF6924`, rose `#FF619B` | Tokens `--wf-*` locaux à `#view-dashboard` |
| Marque | `watfir.`, nom typographique en noir et point orange | `enteteAccueilHtml()` |
| Hero | Grand `MOIEN.` condensé, slogan et paysage sérigraphié | Image WebP **sans texte** + HTML sélectionnable |
| Accès principal | Bouton orange compact, « Commencer » ou « Continuer » | `carteSuiteHtml()` hérité de `accueil-v21.js` |
| Révision | Bandeau noir compact avec `01 / 02 / 03`, sans pictogrammes | `accesHtml()` et fonctions existantes |
| Navigation secondaire | « Voir mon chemin » en lien centré | `goLessons()` |
| Réalisation | Pas de fausses statistiques `42 %` / `7 jours` / `Leçon 6` | `progressionNiveau()`, `serieActuelle()`, `prochainPas()` |

Le nombre « 001 » situé dans le hero est un repère **éditorial**, pas une donnée pédagogique ou un numéro de leçon.

## Implémentation

- `public/watfir-dev.js` adapte `enteteAccueilHtml()`, `accrocheHtml()` et `accesHtml()`. Il conserve les fonctions de la version `v2.1` comme sources de vérité.
- `public/watfir-dev.css` est chargé après `accueil-v21.css` et utilise des sélecteurs `#view-dashboard` pour isoler les couleurs et la composition.
- `public/accueil-v21.js` contient toujours le lien vers la bonne activité, le calcul des statistiques, le menu et le traitement des états. Il n'a pas été modifié.
- `public/index.html` conserve l'ordre `accueil.js` → `accueil-v21.js` → `watfir-dev.js` et leurs feuilles de style dans le même ordre.
- `public/art/watfir-hero-background-mobile.webp` (960 × 540) et `public/art/watfir-hero-background-fhd.webp` (1920 × 1080) restent les fichiers visuels chargés. La référence aplatie `docs/brand/watfir-hero-reference-fhd.webp` n'est pas chargée dans la page.

Le prototype autonome fourni dans la conversation sert **uniquement** de cible visuelle ; les boutons de démonstration « Première visite / En progression » n'apparaissent pas dans l'application.

## États gérés

**Premier lancement.** Le hero apparaît après la sélection de niveau et le lien de connexion invité (lorsque celui-ci est activé). Il n'y a aucun compteur artificiel. L'action principale est « Commencer ».

**Progression engagée.** Le même hero s'affiche, avec les vrais pourcentages, jours de série et l'étape réelle à reprendre. L'action principale est « Continuer ». Les leçons acquises précédemment restent présentes dans les données accessibles.

**Niveau terminé.** Le bloc principal propose de passer explicitement au niveau suivant ou de revenir au chemin. L'utilisateur ne change jamais de niveau automatiquement.

**Compte invité / connecté.** Le lien discret de connexion n'apparaît que dans les cas où le système cloud est activé et l'utilisateur n'est pas connecté ; le portail d'inscription demeure accessible depuis le flux d'authentification. Le menu de synchronisation est conservé.

**Révision.** Les raccourcis « Réviser », « Examens » et « Erreurs » utilisent respectivement `lancerRevision()`, `openExamens()` et `startSession('errors')`. Les informations de révision restent disponibles à l'accessibilité sans surcharger le bandeau.

## Réglages visuels et accessibilité

L'objectif de composition mobile est un viewport CSS proche de **390 px**, avec un hero d'environ **338 px**. Les règles à 375 et 330 px réduisent les tailles de texte ; les petites hauteurs conservent le défilement plutôt que de cacher des fonctionnalités.

Tous les boutons gardent des cibles de 44 px minimum et un état de focus explicite. L'image est décorative et masquée aux lecteurs d'écran ; le slogan et « MOIEN » restent du texte HTML. Les préférences de réduction des animations sont respectées.

Les couleurs `--wf-*` servent à la **marque sur l'accueil**. Elles ne remplacent pas les couleurs de validation/erreur des exercices.

## Validation

```bash
node --test test/accueil-v21.test.cjs test/watfir-dev.test.cjs
python scripts/build_watfir_hero.py
```

Le script Python existant valide les trois assets WebP et **ne les régénère pas**. Le workflow GitHub `Validate Watfir hero (dev)` contrôle automatiquement les fichiers, la syntaxe des rendus et les fonctions de navigation.

### Recette manuelle avant fusion

1. Première visite / mode invité : slogan, inscription accessible via le portail, bouton « Commencer » et zéro statistique fictive.
2. Session engagée : série, pourcentage et libellés réels ; « Continuer » renvoie au bon point.
3. Niveau terminé : changement de niveau explicite.
4. Navigation : A1.1/A1.2, Réviser, Examens, Erreurs, Voir mon chemin et paramètres.
5. Écrans à 320, 360, 390 et 430 px ; tester la largeur de « MOIEN. », le recadrage du décor, le zoom à 200 %, clavier et préférences d'animation.
6. Vérifier le chargement de l'illustration WebP sur réseau lent et le retour vers les écrans pédagogiques.

Les tests automatisés **ne constituent pas** une validation graphique sur un vrai téléphone.

## Rollback

Désactiver l'intégration de `watfir-dev.css` et `watfir-dev.js` dans `public/index.html` restaure l'accueil `2.1`, sans toucher au moteur de progression. La branche `dev` ne doit pas être fusionnée tant que l'ensemble de la recette n'est pas validé visuellement.
