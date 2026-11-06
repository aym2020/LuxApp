# Portail de bienvenue Watfir — affiche rétro (06/11/2026)

**Statut : implémenté sur la branche `2.2` uniquement.** Cible : premier lancement invité / entrée non authentifiée. Les écrans de connexion et d'inscription restent le portail fonctionnel de LuxApp 2.1, sans refonte dans ce lot.

## 1. Décision de design

L'écran d'entrée est une **affiche de marque**, et non un tutoriel. Le concept retenu est **A — Affiche rétro**, après suppression explicite du slogan « Le luxembourgeois, autrement. ».

Composition, de haut en bas :
1. **Grand logotype typographique `Watfir`**, crème, Fraunces italique 900 auto-hébergée (déjà chargée par `accueil-watfir.css`). Le mot-symbole du portail reprend désormais l’**espacement naturel `letter-spacing:0` du header**, avec `font-kerning:normal` et **sans `text-shadow`** : l'ancien `-0.075em` faisait fusionner visuellement « tfir » sur les smartphones. Aucun autre slogan, claim, pré-titre, liste de fonctionnalités, trois étapes ou pictogramme gratuit.
2. **Deux rubans** SVG inline : rouge `#F22421`, cyan `#02C5E7`, sur fond noir `#080808`, **conservés dans le visuel, jamais dans le coin des boutons crème**. Le dessin est géométrique et éditable, sans PNG ni téléchargement distant ; il reprend les couleurs de l'accueil sans reproduire l'interaction « Moien! ».
3. **`Lëtzebuergesch`**, descripteur de la langue en petites capitales espacées. Ce mot identifie le sujet : ce n'est pas un slogan marketing.
4. **Actions**, dans cet ordre : **Essayer sans compte** (face crème unie `#FBebc5`, texte noir **centré, sans chevron** comme « Créer un compte », tranche beige `#AA8954` de **6 px**, identique en teinte à l'accueil et **sans coin rouge/cyan**), **Créer un compte** (face sombre `#11100e`, filet crème `#c3b08b`, tranche beige foncée `#796646` de **6 px**), **J’ai déjà un compte** (lien). Les **deux grands boutons ont la même hauteur minimum de 70 px, rayon de 17 px et appui de 5 px** (64 px chacun sous 360 px). Survol PC : éclaircissement de la face uniquement, sans déplacement ni glow ; appui 3D maintenu **160 ms** avant les routes invité/inscription, y compris au clavier. `prefers-reduced-motion: reduce` : appui instantané sans délai.
5. En cas d'indisponibilité cloud, « Essayer sans compte » reste disponible ; seules les options de compte disparaissent et un message d'information apparaît.

**Ne pas ajouter** sur ce portail : « Moien! », lecture de `moien.mp3`, carte à retourner, trois pictogrammes Leçons/Révisions/Examens, promesse longue, mini-parcours en trois points, animation sonore automatique. Le mot et son audio sont déjà proposés sur l'accueil principal, où ils ont leur place.

## 2. Contrat applicatif

`public/portail.js` conserve sans changement les fonctions `portailAction('guest')`, `portailAction('signup')`, `portailAction('signin')`, les formulaires Firebase, les messages d'erreur, le stockage invité local, l'option de sauvegarde des progrès, l'écran d'information invité affiché une fois et la navigation Retour Android.

Seule la branche `mode === 'welcome'` de `portailContenu` produit désormais l'affiche. Les anciennes fonctions `portailCarte`, `portailAtouts` et `portailEcouter` restent dans le module à titre de compatibilité, mais **ne sont plus appelées par l'écran de bienvenue**. Aucun changement sur la pédagogie, les données ou l'audio de l'accueil.

**Netteté typographique (06/11/2026)** : le retour utilisateur sur Samsung a mis en évidence un logo trop serré, perçu comme « baveux ». Correction minimale : `letter-spacing:-.075em` → `0` et suppression de l’ombre de texte, sans remplacer Fraunces ni modifier sa graisse ou les autres éléments. Test de contrat associé dans `test/watfir-portail.test.cjs`. La vérification d’antialiasing sur le navigateur réel reste nécessaire.

**CSS scindé et strictement isolé** : `public/portail-watfir.css` contient exclusivement des règles sous `#portail-auth .wf-portail-bienvenue` (et un parent `:has()` pour la toile de fond). Il est importé après `style.css` et `accueil-watfir.css`. **Ne pas modifier globalement** `.pa-bouton`, `.pa-reconnexion`, `#pa-form` ou les composants des exercices.

Un écouteur `click` capturant sur `#portail-auth` est installé une seule fois par `portailOuvrir` et cible **`.wf-portail-demarrer` et `.wf-portail-creer`** exclusivement dans le mode bienvenue. Il garde la classe `.wf-pressing` 160 ms, puis rejoue `button.click()` afin de conserver les actions `guest` et `signup` existantes. Les clics programmatiques, désactivés et le mouvement réduit passent immédiatement. Le double clic n'active pas deux fois l'entrée.

## 3. Responsive et accessibilité

- **Mobile-first** : affiche centrée dans l'espace disponible ; CTA dans la partie basse ; hauteur minimale et espacement adaptatifs. Le portail est déjà `overflow-y:auto` : sous 360 px, en landscape ou à grande police, laisser **défiler** au lieu de cacher des CTA.
- **PC** : colonne maximale de 640 px, centrée sur fond noir, comme l'accueil. Aucun étirement du wordmark sur la largeur de l'écran.
- Tous les CTA sont des **`button` natifs** ; `focus-visible` cyan ; les deux boutons principaux font **70 px** de haut (64 px sur tout petit mobile), et « J’ai déjà un compte » conserve une cible de 45 px. Les rubans sont décoratifs (`aria-hidden`). Titre `h1` lisible « Watfir », `lang="lb"` sur le descripteur.
- **Réduction de mouvement** : supprime les transitions et l'entrée séquencée, pas la profondeur physique de l'appui. Aucun délai d'activation.

**Polissage final des deux boutons 3D (06/11/2026) :** chaque face reçoit **un seul reflet lumineux d'1 px en haut**, sans fausse tranche blanche. Commencer : `inset 0 1px 0 rgba(255,255,255,.70)` ; Créer un compte : `inset 0 1px 0 rgba(247,233,194,.22)`. Le beige `#AA8954` du CTA est dorénavant exactement le même que celui de la carte Commencer/Continuer dans l'accueil. Les rayons, zones tactiles et états :active/.wf-pressing restent identiques ; le parcours invité, les formulaires et les rubans sont inchangés. Référence transverse : [BOUTONS-3D.md](BOUTONS-3D.md).

**Décision de cohérence du 06/11/2026 :** conserver intégralement les **rubans identitaires du hero** (portail et page « Moien! »), mais utiliser la **même face crème unie** pour le CTA principal du portail et celui de l'accueil. Les coins rouge/cyan ne doivent pas réapparaître sur les boutons « Commencer ». « Créer un compte » reprend la même épaisseur physique pour que le duo ne mélange plus un bouton 3D et un bouton plat.

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

**Wording et centrage (06/11/2026) :** « Commencer » devient **« Essayer sans compte »** (le choix invité se distingue de « Créer un compte » et du « Commencer » de l'accueil) et « Se connecter » devient **« J’ai déjà un compte »**. Le texte du CTA crème est centré et le chevron retiré, pour que les deux grands boutons s'alignent. Message hors ligne : « Tu peux essayer sans compte. » Actions `guest` / `signup` / `signin` inchangées. Cache : `portail-watfir.css?v=wf-poster-5`, `portail.js?v=wf-poster-3`.
