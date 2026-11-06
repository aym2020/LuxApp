# Portail de bienvenue Watfir — affiche rétro (06/11/2026)

**Statut : implémenté sur la branche `2.2` uniquement.** Cible : premier lancement invité / entrée non authentifiée. Les écrans de connexion et d'inscription restent le portail fonctionnel de LuxApp 2.1, sans refonte dans ce lot.

## 1. Décision de design

L'écran d'entrée est une **affiche de marque**, et non un tutoriel. Le concept retenu est **A — Affiche rétro**, après suppression explicite du slogan « Le luxembourgeois, autrement. ».

Composition, de haut en bas :
1. **Grand logotype typographique `Watfir`**, crème, Fraunces italique 900 auto-hébergée (déjà chargée par `accueil-watfir.css`). Le mot-symbole du portail reprend désormais l’**espacement naturel `letter-spacing:0` du header**, avec `font-kerning:normal` et **sans `text-shadow`** : l'ancien `-0.075em` faisait fusionner visuellement « tfir » sur les smartphones. Aucun autre slogan, claim, pré-titre, liste de fonctionnalités, trois étapes ou pictogramme gratuit.
2. **Deux rubans** SVG inline : rouge `#F22421`, cyan `#02C5E7`, sur fond noir `#080808`. Le dessin est géométrique et éditable, sans PNG ni téléchargement distant ; il reprend les couleurs de l'accueil sans reproduire l'interaction « Moien! ».
3. **`Lëtzebuergesch`**, descripteur de la langue en petites capitales espacées. Ce mot identifie le sujet : ce n'est pas un slogan marketing.
4. **Actions**, dans cet ordre : **Commencer** (CTA crème `#FBebc5`, texte noir, chevron, coin rouge/cyan et tranche 3D beige de 6 px), **Créer un compte** (bouton sombre bord crème), **Se connecter** (lien secondaire). Survol PC : simple éclaircissement. L'appui du CTA s'enfonce de 5 px, y compris au clavier ; maintien de 160 ms sur clic utilisateur avant navigation immédiate vers l'accueil invité. Le mode `prefers-reduced-motion: reduce` conserve l'appui physique instantané sans retard.
5. En cas d'indisponibilité cloud, « Commencer » reste disponible ; seules les options de compte disparaissent et un message d'information apparaît.

**Ne pas ajouter** sur ce portail : « Moien! », lecture de `moien.mp3`, carte à retourner, trois pictogrammes Leçons/Révisions/Examens, promesse longue, mini-parcours en trois points, animation sonore automatique. Le mot et son audio sont déjà proposés sur l'accueil principal, où ils ont leur place.

## 2. Contrat applicatif

`public/portail.js` conserve sans changement les fonctions `portailAction('guest')`, `portailAction('signup')`, `portailAction('signin')`, les formulaires Firebase, les messages d'erreur, le stockage invité local, l'option de sauvegarde des progrès, l'écran d'information invité affiché une fois et la navigation Retour Android.

Seule la branche `mode === 'welcome'` de `portailContenu` produit désormais l'affiche. Les anciennes fonctions `portailCarte`, `portailAtouts` et `portailEcouter` restent dans le module à titre de compatibilité, mais **ne sont plus appelées par l'écran de bienvenue**. Aucun changement sur la pédagogie, les données ou l'audio de l'accueil.

**Netteté typographique (06/11/2026)** : le retour utilisateur sur Samsung a mis en évidence un logo trop serré, perçu comme « baveux ». Correction minimale : `letter-spacing:-.075em` → `0` et suppression de l’ombre de texte, sans remplacer Fraunces ni modifier sa graisse ou les autres éléments. Test de contrat associé dans `test/watfir-portail.test.cjs`. La vérification d’antialiasing sur le navigateur réel reste nécessaire.

**CSS scindé et strictement isolé** : `public/portail-watfir.css` contient exclusivement des règles sous `#portail-auth .wf-portail-bienvenue` (et un parent `:has()` pour la toile de fond). Il est importé après `style.css` et `accueil-watfir.css`. **Ne pas modifier globalement** `.pa-bouton`, `.pa-reconnexion`, `#pa-form` ou les composants des exercices.

Un écouteur `click` capturant sur `#portail-auth` est installé une seule fois par `portailOuvrir` et ne cible que `.wf-portail-demarrer` dans le mode bienvenue. Il garde la classe `.wf-pressing` 160 ms, puis rejoue `button.click()` afin de conserver l'action `guest` existante. Les clics programmatiques, désactivés et le mouvement réduit passent immédiatement. Le double clic n'active pas deux fois l'entrée.

## 3. Responsive et accessibilité

- **Mobile-first** : affiche centrée dans l'espace disponible ; CTA dans la partie basse ; hauteur minimale et espacement adaptatifs. Le portail est déjà `overflow-y:auto` : sous 360 px, en landscape ou à grande police, laisser **défiler** au lieu de cacher des CTA.
- **PC** : colonne maximale de 640 px, centrée sur fond noir, comme l'accueil. Aucun étirement du wordmark sur la largeur de l'écran.
- Tous les CTA sont des **`button` natifs** ; `focus-visible` cyan ; zones tactiles de 45–70 px. Les rubans sont décoratifs (`aria-hidden`). Titre `h1` lisible « Watfir », `lang="lb"` sur le descripteur.
- **Réduction de mouvement** : supprime les transitions et l'entrée séquencée, pas la profondeur physique de l'appui. Aucun délai d'activation.

## 4. Recette

Exécuter les contrats :

```sh
node --test test/watfir-portail.test.cjs
node --test test/watfir-home.test.cjs test/watfir-hover.test.cjs
```

Contrôles de recette manuelle restant nécessaires : Android Samsung à 320/360/412 px et taille de texte augmentée, écran court 640 px, PC 640 px/1440 px, souris/clavier/lecteur d'écran, Retour Android et navigation signup→welcome, absence de son lancé automatiquement, absence de régression Firebase et invité, vérification de l'installation PWA.

Le test de contrat ne remplace pas ces essais de navigateur / appareil.

## 5. Retour arrière ciblé

Restaurer uniquement la branche bienvenue de `public/portail.js` et retirer le `portailInstallerAppuiBienvenue` dédié ; supprimer le lien `portail-watfir.css` de `public/index.html` ou retirer la feuille dédiée. Remettre à jour les cache-busters `portail.js` et CSS. Les formulaires, données utilisateur, compte et accueil n'ont pas besoin d'être restaurés.
