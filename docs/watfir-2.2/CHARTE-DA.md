# Charte de direction artistique — Watfir / LuxApp 2.2

**Version** 1.1 · 2026-11-03 · **Statut** : DA Watfir **active sur l'accueil de la branche `2.2`**, non généralisée aux autres écrans. Référence d'implémentation des boutons : [BOUTONS-3D.md](BOUTONS-3D.md). Les tests Samsung physique restent à effectuer.

## 1. Intention

Créer une application d'apprentissage du luxembourgeois immédiatement identifiable : une esthétique d'identités télévisuelles et touristiques des années 1975–1985, **réinterprétée pour une interface moderne, mobile-first et très lisible**. Le but n'est ni un jeu néon, ni une imitation littérale d'un logo existant, ni un filtre VHS sur toute l'application.

Le langage graphique repose sur trois idées complémentaires :

1. **Un repère géographique réduit à un signe** : tour, toiture et trois arches ; la silhouette doit rester reconnaissable avant toute texture.
2. **Des lignes identitaires cyan et rouges** : deux bandes de hauteur homogène qui commencent presque horizontales, montent en courbe douce et se terminent derrière la silhouette architecturale. Elles donnent le rythme et relient les zones du hero.
3. **Un contraste typographique** : « Moien! » expressif en grande serif italique, contre une interface de lecture sobre en sans-serif.

Précision éditoriale : les premiers essais « carte postale synthwave », multiples bâtiments, grand soleil tranché, néons excessifs, dégradés arc-en-ciel et pictogrammes trop décoratifs **ont été écartés**. La version cible est **beaucoup plus épurée**.

## 2. Palette et rôle des couleurs

Les valeurs suivantes sont les **tokens de marque de l'accueil `2.2`**, définis dans `public/accueil-watfir.css`. Les surfaces Étudier/Jouer utilisent des variantes plus sombres afin que le texte et les pictogrammes crème restent lisibles ; leur détail est documenté dans [BOUTONS-3D.md](BOUTONS-3D.md).

| Token 2.2 | Hex | Rôle |
| --- | --- | --- |
| `--wf-bg` | `#080808` | Fond quasi noir, continu, sans faux panneaux |
| `--wf-cream` | `#F7E9C2` | Marque, titres, icônes neutres, **CTA principal** |
| `--wf-red` | `#F22421` | Bande identitaire, ponctuation de « Moien! », sélection de niveau |
| `--wf-cyan` | `#02C5E7` | Bande identitaire, détail secondaire exceptionnel, rubrique Jeux si pertinent |
| `--wf-secondary` | `#BEB6A6` | Texte explicatif non essentiel |
| `--wf-track` | `#3C3934` | Barre de progression inactive, filets discrets |
| `--wf-ink` | `#080808` | Texte sur bouton crème |
| `--wf-success` | `#54E0AD` | Succès pédagogique, **pas** bleu ou rouge |
| `--wf-error` | `#EF7A73` | Correction erreur / alerte sémantique |
| `--wf-info` | `#6FB0F2` | Informations pédagogiques et examen |

**Répartition visuelle sur l'accueil** : le noir domine, le crème structure la lecture et le CTA principal. Le rouge et le cyan restent des **signes identitaires dans le hero et dans le coin du CTA** ; les deux seules grandes surfaces secondaires colorées sont « Étudier » (rouge plus profond `#d3232b`) et « Jouer » (bleu plus profond `#087496`). Cette hiérarchie n'autorise pas à colorer tous les boutons de tous les écrans.

Le rouge de marque `--wf-red` n'est pas le rouge d'erreur `--wf-error`. Un état d'erreur exige un libellé/icône et un contraste explicite. Ne jamais coder uniquement par la couleur.

## 3. Typographie

- **Wordmark « Watfir »** : Fraunces 900 italic auto-hébergée sur l'accueil V4. La fonte est chargée sous `Watfir Logo` dans `accueil-watfir.css`.
- **Titre « Moien! »** : Playfair Display 800 italic auto-hébergée (`Watfir Titre`), crème avec ponctuation rouge. Ses dimensions effectives sont celles du CSS V4, adaptées par `--k`.
- **Navigation, niveaux, boutons, questions, métriques** : `Inter` existant / sans-serif. Chiffres lisibles, pas de serif pour des statistiques opérationnelles.
- **Kicker « LE LUXEMBOURGEOIS, PAS À PAS »** : capitales avec chasse étendue, taille petite mais lisible ; ne jamais abaisser sous 12px sur mobile.
- **Contenu pédagogique** : police nette, contraste WCAG adapté. Aucune texture CRT, aberration chromatique ou flou sur les textes fonctionnels.

Ne pas intégrer de polices propriétaires non licenciées. Les SVG de marque et de monument déjà validés sont figés ; ne pas redessiner leurs traits pour harmoniser des boutons.

## 4. Géométrie et iconographie

**Monument** : une tour centrale légèrement décentrée, flèche allongée, trois fenêtres évidées ; toiture rectiligne très simplifiée ; **trois arches noires nettes**, sans marches d'escalier, pierres, arbres, silhouettes supplémentaires ni soleil. La version "full" est un asset de hero, pas l'icône de barre de navigation.

**Logo/mark** : pictogramme dérivé du monument, réduit à une tour et deux lignes rouge/cyan ; perceptible dès 24–32 px. Le mot « Watfir » ne doit pas être fusionné dans une miniature illisible.

**Bandes** : deux traits continus de même logique, arrondis contrôlés ; aucun éclatement en sept couleurs, aucune répétition systématique dans les cartes. Leurs extrémités doivent être totalement visibles et **ne pas sembler coupées par accident**.

**Icônes de navigation** : trait de poids optique cohérent, SVG au trait crème pour Étudier (livre) et Jouer (manette). Le bouton principal Commencer/Continuer n'a **pas** de livre : son texte et sa flèche suffisent. L'icône ne change pas de couleur au hover. Cibles tactiles d'au moins 44–48 px, sans chevauchement.

**Surfaces** : fond noir libre autour des composants ; un CTA crème de premier niveau et deux boutons secondaires centrés (Étudier rouge / Jouer bleu). Les reliefs sont de véritables **tranches d'ombre hors flux**, pas des doubles cartes. Pas de contour animé rouge, ni d'ombre néon. Le CTA crème garde son coin à deux bandes rouge/cyan **sans changement d'épaisseur**.

## 5. Rythme, densité et hiérarchie

Ordre de lecture actif sur l'accueil : **marque + niveau** → **accroche + illustration** → **progression réelle** → **Commencer/Continuer** → **Étudier et Jouer**. Le parcours, les révisions, les examens et les erreurs sont accessibles depuis la feuille « Étudier », et non plus comme quatre boutons concurrents sur l'accueil.

Une seule action dominante à l'écran. Le hero est expressif mais **ne doit pas repousser le CTA hors de l'écran à cause d'une illustration à hauteur fixe**. La réduction visuelle recherchée depuis V2 est de l'ordre de 10–15 % sur la partie hero, mais le bon critère est la place effective disponible sur différents appareils.

Échelle d'espacement de départ `4/8/12/16/24/32px`, adaptés au rendu réel. Éviter les trous verticaux artificiels et le positionnement absolu du CTA à une coordonnée calculée pour une capture.

## 6. Composants et règles

### 6.1 Bouton principal

Fond crème `#fbebc5`, texte noir, flèche noire, **sans livre**. Tranche beige de 7 px, enfoncement 6 px, état visiblement maintenu 160 ms avant une navigation déclenchée par clic utilisateur ; hover PC : face crème `#fff4da` **sans soulèvement**. Les deux bandes du coin gardent leur couleur marque `#f22421` / `#02c5e7` et leur largeur inchangée. Afficher le vrai titre de la leçon sur **deux lignes au besoin** ; pas de troncature d'information critique.

### 6.2 Niveaux A1.1/A1.2 et familles futures

Deux pastilles maximum dans le header courant, actif rouge/crème et inactif fond noir/filet crème ; le chevron est la troisième commande 3D. Relief de **2 à 4 px** selon `--k`, tranche beige sombre ou rouge sombre, enfoncement de `depth - 1px` et maintien **160 ms** avant sélection ou ouverture de la feuille. Leur filet `::before` et leurs cibles tactiles `::after` sont préservés. Pour A2.1/A2.2, B1.1/B1.2, etc., le chevron ouvre un **bottom sheet** groupé par familles et limité aux niveaux disponibles. Sous 360 px, le header peut se replier sur deux rangées sans compresser la marque.

### 6.3 Progression

En-tête « TA PROGRESSION », pourcentage du **niveau actif** et série globale/contextuelle selon calcul réel. Barre très fine avec piste foncée. Ne pas confondre progression globale du niveau avec « Aujourd'hui ». Les compteurs d'exemple du mockup sont fictifs.

### 6.4 Accès secondaires

Deux boutons **centrés, côte à côte**, sans titre inutile : **Étudier** (`#d3232b`, tranche `#861c18`) et **Jouer** (`#087496`, tranche `#054860`). Les deux ont texte/pictogramme crème, relief 5 px et enfoncement 4 px maintenu 160 ms avant activation ; au hover PC, seule leur face s'éclaircit. Étudier ouvre un bottom sheet avec **Les leçons / S'entraîner / Examens / Mes erreurs**, sans perte de fonctionnalités. Jouer ouvre directement les mini-jeux. Cibles tactiles d'au moins 76 px de hauteur. Voir [BOUTONS-3D.md](BOUTONS-3D.md).

### 6.5 États

Définir au minimum : chargement, progression nulle, aucune leçon reprenable, niveau indisponible, invité et connecté, série zéro, hors ligne, retour depuis chemin, message d'erreur. Aucun raccourci ne doit sembler disponible s'il ne fonctionne pas.

## 7. Rapport à LuxApp 2.1

Le code 2.1 utilise `public/design-tokens.css`, `public/components.css`, `public/accueil-v21.css` et des modules d'apprentissage/jeux. Les invariants fonctionnels et pédagogiques restent prioritaires. La **palette Watfir est déployée sur l'accueil `2.2` uniquement**, pas une autorisation pour repeindre toutes les variables sémantiques ou changer les jeux.

Faire évoluer les composants existants plutôt que dupliquer leurs fonctions. Les nouvelles classes temporaires doivent être préfixées `wf-` pour éviter les collisions ; ne pas multiplier des styles globaux pour écraser 2.1. La référence 2.1, qui considérait l'or comme CTA principal, reste historique pour les vues non migrées jusqu'à validation explicite.

## 8. Mouvement et rendu

Pour les **boutons 3D de l'accueil**, la transition physique `transform/box-shadow` dure **115 ms**, le fond change sur **160–170 ms** et, pour une activation utilisateur susceptible de masquer l'animation, la classe `.wf-pressing` conserve le creux **160 ms** avant le clic rejoué. Sur `prefers-reduced-motion:reduce` : aucun déplacement ni délai. Les hovers sont réservés à `(hover:hover) and (pointer:fine)`, sans animation de gameplay. Aucun filtre VHS permanent, scintillement ni glow. Sur écran HDR, vérifier les rouges et le cyan. Les formes sont vectorielles, les effets analogiques strictement décoratifs.

## 9. Conditions de livraison

La DA doit être validée **écran par écran** : capture avant/après, tests statiques et navigateur, test Samsung Android (dont clavier, zoom police, TalkBack), vérification des données, navigation, progression et offline. Pas de modification silencieuse du modèle pédagogique ou des mini-jeux. Toute adaptation d'un jeu exige ses propres SPEC et tests, notamment les contraintes Lux Démasqué LD-002.

## 10. Interdictions de conception

- Ne pas revenir à une illustration touristique ultra détaillée.
- Ne pas ajouter de grand soleil ni de soleil coupé.
- Ne pas transformer l'app en synthwave à fond dégradé et glow permanent.
- Ne pas appliquer rouge/cyan à tous les CTA.
- Ne pas tronquer un titre de leçon important.
- Ne pas mettre toutes les familles de niveau sur une seule rangée.
- Ne pas faire dépendre le contenu d'une image générée non éditable.
- Ne pas confondre validation d'un mockup et validation UX/Android.
