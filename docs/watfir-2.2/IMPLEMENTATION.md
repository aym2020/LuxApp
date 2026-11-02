# Watfir V4 — implémentation effective sur `2.2`

**Date :** 2 novembre 2026  
**Statut :** accueil codé et chargé, tests de logique ciblés effectués, **capture navigateur / Android Samsung encore nécessaires**.

## 1. Base de travail

La branche `2.2` a été dérivée de `2.1`. Tous les fichiers des leçons, du parcours, du moteur des exercices, des examens, des jeux, de Firebase, de la PWA et des sauvegardes sont conservés. Aucun changement n'a été poussé sur `main` ou `2.1`.

## 2. Fichiers de production

| Chemin | Rôle |
| --- | --- |
| `public/accueil-watfir.js` | Surcouche de rendu V4 chargée **après** `accueil-v21.js` : entête « Watfir », hero SVG, titre « Ta progression », placement du bilan, niveau actif + voisin, panneau natif de sélection |
| `public/accueil-watfir.css` | Styles scoppés à `#view-dashboard .wf-accueil` et à `.wf-niveaux-dialog`, avec ajustements 320/360/393/430px |
| `public/art/watfir-mark.svg` | Emblème architectural crème avec bandes rouge/cyan |
| `public/art/watfir-hero.svg` | Tour, trois arches et bandes géométriques, **sans soleil** ni photographie |
| `public/index.html` | Deux inclusions versionnées, placées après les surcouches 2.1 existantes |
| `test/watfir-home.test.cjs` | Contrats d'affichage, changement de niveau, modal et import des surcouches |

Les sources supplémentaires dans `docs/watfir-2.2/assets/` servent à retravailler le dessin. La capture générée V4 n'est pas utilisée comme image d'interface : les textes et contrôles sont de véritables éléments HTML.

## 3. Conservation des comportements de 2.1

- **Progression :** `progressionNiveau(niveauActif)` et `serieActuelle()` restent la source ; le faux 6 % du mockup n'est pas codé.
- **Reprise :** `carteSuiteHtml()` et ses actions utilisent toujours `prochainPas()`, `commencer()` et `suivreProchainPas()` ; le titre de leçon a maintenant une hauteur adaptative, sans troncature obligatoire.
- **Niveaux :** les options proviennent de `niveauxDisponibles()`, elles sont regroupées par famille ; la sélection appelle `changerNiveauAccueil()`, puis le mécanisme de choix `choisirNiveau()` de 2.1. La persistance `luxChoix`/`luxNiveau` et les stats restent inchangées.
- **Authentification / synchro :** `ligneCompteHtml()` conditionne le lien invité ; la roue utilise `etatSynchro()` et garde `.ac-sync-slot`.
- **Navigation :** les raccourcis et `Voir mon chemin` sont produits par la V2.1 existante ; aucune route ni destination modifiée.
- **Écrans et jeux hors accueil :** restent sous leurs feuilles et moteurs antérieurs.

## 4. Comportement du menu de niveau

- Boutons directs : niveau actif et, si disponible, autre sous-niveau de la famille courante (maximum deux visibles).
- Flèche : ouvre `<dialog>` natif en panneau bas, listes A1/A2/B1… alimentées par les niveaux réels.
- Fermer, Échap, bouton Retour Android (comportement natif du dialogue), clic sur le fond ; restitution du focus au nouveau chevron.
- Si une famille n'a qu'un niveau, une seule puce est visible. Si elle en a plus de deux, l'actif et son plus proche voisin restent visibles.
- Les niveaux absents des leçons ne sont jamais proposés ni acceptés.

## 5. Vérifications effectuées

Une validation JavaScript de la surcouche a été exécutée dans l'environnement d'édition : **parsing, génération du header A1, rendu de A2.2, présence du hero et de « Ta progression », appel à la fonction de changement de niveau 2.1, équilibre des blocs CSS et présence des imports HTML**.

Le test `node --test test/watfir-home.test.cjs` a été ajouté au dépôt comme contrat automatisable. **Son exécution Node complète et celle du navigateur/Playwright ne sont pas attestées ici** (pas de checkout GitHub réseau dans l'environnement d'édition). Ne pas déclarer la V4 « vérifiée Android » sans capture, tests et accord utilisateur.

## 6. Vérifications restant à faire

1. Tester l'URL réellement déployée de `2.2` sur un smartphone Samsung à largeur effective 393px, puis à 320/360/430px.
2. Vérifier les hauteurs, retours/scroll, menu avec de nombreux niveaux et longues traductions.
3. Contrôler le clavier et TalkBack dans le dialogue ; comportement du Retour Android réel et focus.
4. Tester profil invité vierge et compte synchronisé, niveau terminé, absence de reprise.
5. Exécuter `node --test test/watfir-home.test.cjs` + la suite critique 2.1, comparer les échecs préexistants.
6. Reproduire la capture réelle pour comparaison avec la V4 approuvée et ajuster exclusivement les styles d'accueil.

## 7. Correctif « compacité et fidélité V4 » (02/11/2026)

Capture Samsung (Brave, largeur 360 px, ~593 px utiles) : accueil 711 px de haut, 118 px de défilement, monument rogné, bandes épaisses, « Moien! » trop fin.

**Causes racines**

1. Hero à hauteur imposée (`clamp(207px,57vw,280px)` + `min-height:207px`) et dessin en `position:absolute` élargi à 110 % sous 380 px : rognage gauche/droite (14 et 22 px) et grand vide sous le texte.
2. SVG 980×330 : pont de 395×95 u (40 % de la largeur), bandes de 25 u, partant à x=25.
3. `Instrument Serif` n'existe qu'en graisse 400 : `italic 700` sur « Watfir » donnait un gras synthétique ; « Moien! » restait fin.
4. Hauteurs cumulées : CTA `min-height:112px` + padding 17 px, raccourcis 13 px de padding + boutons 63 px, marges 13–19 px, header 113 px. Règles 2.1 actives en parallèle (`ac-nouveau-invite` : CTA `min-height:108px`, `gap:7px` ; hero 2.1 `flex:1 1 258px`).

**Corrections**

- Hero en flux : texte, puis dessin (`width:100%`, `aspect-ratio:400/160`, `margin-top:clamp(-120px,-25%,0px)`). Le dessin remonte sous le texte en proportion de la largeur ; si le texte grandit, il descend avec lui. Aucun rognage, aucune hauteur fixe.
- `public/art/watfir-hero.svg` redessiné (viewBox 400×160) : bandes 7 u (−30 %), courbe plus longue et parallèle, fin alignée sur le bord du pont ; pont fin à trois arches ; tour élancée (socle, fût, corniche, clocheton, flèche) ; aucune fenêtre, aucun soleil. Source copiée dans `docs/watfir-2.2/assets/`.
- « Watfir » et « Moien! » : `DM Serif Display` italique (OFL, `public/fonts/`, préchargée), nom CSS `Watfir Display`, sans gras synthétique.
- Une grille verticale `--wf-gap` (12 px ; 8 px si hauteur ≤ 660 px ; 16 px si hauteur ≥ 820 px), CTA et raccourcis compactés, séparateurs courts à 20 % d'opacité, règles 2.1 concurrentes neutralisées explicitement (`gap`, `min-height`).

**Mesures Chromium (invité, leçon 0)**

| Viewport | Header | Hero | Stats | CTA | Raccourcis + chemin | Contenu | Défilement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 360×593 avant | 107 | 205 | 90 | 112 | 148 | 711 | 118 |
| 360×593 après | 94 | 164 | 78 | 87 | 120 | 584 | 0 |
| 320×568 après | 94 | 154 | 78 | 86 | 120 | 573 | 5 |
| 393×760 après | 98 | 188 | 87 | 93 | 128 | 653 | 0 |
| 430×932 après | 98 | 199 | 90 | 94 | 128 | 692 | 0 |

Titre de leçon long : 2–3 lignes sans troncature (CTA 112–125 px). Police ×1,3 (approximation par zoom) : défilement naturel, aucun débordement horizontal. **Validation Samsung réelle encore nécessaire.**

## 8. Retour arrière ciblé

Si l'écran V4 échoue : retirer uniquement les liens `accueil-watfir.css` et `accueil-watfir.js` de `public/index.html`. Le rendu 2.1 reprend alors sans toucher au moteur, à la progression ni aux jeux. Ne jamais supprimer les clés de stockage.
