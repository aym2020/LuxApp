# Charte de direction artistique — Watfir / LuxApp 2.2

**Version** 1.0 · 2026-11-02 · **Statut** : proposition détaillée, V4 de l'accueil comme référence visuelle, non déployée.

## 1. Intention

Créer une application d'apprentissage du luxembourgeois immédiatement identifiable : une esthétique d'identités télévisuelles et touristiques des années 1975–1985, **réinterprétée pour une interface moderne, mobile-first et très lisible**. Le but n'est ni un jeu néon, ni une imitation littérale d'un logo existant, ni un filtre VHS sur toute l'application.

Le langage graphique repose sur trois idées complémentaires :

1. **Un repère géographique réduit à un signe** : tour, toiture et trois arches ; la silhouette doit rester reconnaissable avant toute texture.
2. **Des lignes identitaires cyan et rouges** : deux bandes de hauteur homogène qui commencent presque horizontales, montent en courbe douce et se terminent derrière la silhouette architecturale. Elles donnent le rythme et relient les zones du hero.
3. **Un contraste typographique** : « Moien! » expressif en grande serif italique, contre une interface de lecture sobre en sans-serif.

Précision éditoriale : les premiers essais « carte postale synthwave », multiples bâtiments, grand soleil tranché, néons excessifs, dégradés arc-en-ciel et pictogrammes trop décoratifs **ont été écartés**. La version cible est **beaucoup plus épurée**.

## 2. Palette et rôle des couleurs

Les valeurs suivantes sont des **tokens de travail fidèles à l'intention des captures**, pas un prélèvement colorimétrique certifié. La recette peut calibrer les valeurs après test sur smartphone.

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

**Répartition visuelle sur accueil** : ~80 % noir, ~15 % crème/ivoire et ~5 % rouge/cyan (ordre de grandeur, non une mesure). Le rouge/cyan **ne doivent pas être partout** : une occurrence forte dans le hero, un éventuel micro-détail sur CTA, des accents de navigation strictement utiles.

Le rouge de marque `--wf-red` n'est pas le rouge d'erreur `--wf-error`. Un état d'erreur exige un libellé/icône et un contraste explicite. Ne jamais coder uniquement par la couleur.

## 3. Typographie

- **Wordmark « Watfir »** : serif italique éditoriale à contraste marqué. Le mockup ne constitue pas une fonte identifiée ou une licence. Première piste techniquement compatible : `Instrument Serif` (déjà présent en 2.1), à ajuster par tests d'impression / antialiasing. Ne pas affirmer que le mockup utilise exactement cette fonte.
- **Titre « Moien! »** : grand, en serif italique crème, ponctuation rouge. En CSS : `clamp(3rem, 11vw, 5.5rem)` comme point de départ *à calibrer* (pas une valeur finale imposée).
- **Navigation, niveaux, boutons, questions, métriques** : `Inter` existant / sans-serif. Chiffres lisibles, pas de serif pour des statistiques opérationnelles.
- **Kicker « LE LUXEMBOURGEOIS, PAS À PAS »** : capitales avec chasse étendue, taille petite mais lisible ; ne jamais abaisser sous 12px sur mobile.
- **Contenu pédagogique** : police nette, contraste WCAG adapté. Aucune texture CRT, aberration chromatique ou flou sur les textes fonctionnels.

Ne pas intégrer des polices propriétaires non licenciées. Les SVG de référence utilisent des fontes de repli système : **ces glyphes ne sont pas des dessins finaux figés**.

## 4. Géométrie et iconographie

**Monument** : une tour centrale légèrement décentrée, flèche allongée, trois fenêtres évidées ; toiture rectiligne très simplifiée ; **trois arches noires nettes**, sans marches d'escalier, pierres, arbres, silhouettes supplémentaires ni soleil. La version "full" est un asset de hero, pas l'icône de barre de navigation.

**Logo/mark** : pictogramme dérivé du monument, réduit à une tour et deux lignes rouge/cyan ; perceptible dès 24–32 px. Le mot « Watfir » ne doit pas être fusionné dans une miniature illisible.

**Bandes** : deux traits continus de même logique, arrondis contrôlés ; aucun éclatement en sept couleurs, aucune répétition systématique dans les cartes. Leurs extrémités doivent être totalement visibles et **ne pas sembler coupées par accident**.

**Icônes de navigation** : tracé constant (~2 px dans une grille 24 px), taille optique cohérente, couleurs crème ; Jeux peut recevoir le cyan, mais pas une icône 30 % plus volumineuse que les autres. Cibles tactiles de 44–48 px min.

**Surfaces** : préserver des fonds sans cadre ; regrouper quatre raccourcis dans une seule surface à filet crème discret. Pas de cartes imbriquées, double contour ni ombre massive sous chaque élément. Le CTA crème doit former un bloc simple au rayon maîtrisé.

## 5. Rythme, densité et hiérarchie

Ordre de lecture attendu : **marque + niveau** → **accroche + illustration** → **progression réelle** → **reprise de la prochaine activité** → **raccourcis** → **voir mon chemin**.

Une seule action dominante à l'écran. Le hero est expressif mais **ne doit pas repousser le CTA hors de l'écran à cause d'une illustration à hauteur fixe**. La réduction visuelle recherchée depuis V2 est de l'ordre de 10–15 % sur la partie hero, mais le bon critère est la place effective disponible sur différents appareils.

Échelle d'espacement de départ `4/8/12/16/24/32px`, adaptés au rendu réel. Éviter les trous verticaux artificiels et le positionnement absolu du CTA à une coordonnée calculée pour une capture.

## 6. Composants et règles

### 6.1 Bouton principal

Fond crème uni, texte noir et icône noire, rayon modéré, contraste élevé, forme cliquable d'au moins 48 px de haut. Le **coin bicolore** est un petit accent facultatif à l'extrémité droite (jamais un grand contour rouge/cyan autour du bouton). Afficher le titre réel de la leçon sur **deux lignes au besoin** ; ellipsis seulement pour les informations secondaires et avec solution pour lire le titre complet.

### 6.2 Niveaux A1.1/A1.2 et familles futures

Deux pills maximum dans le header courant, actif rouge/crème et inactif fond noir/bord crème ; chevron discret, troisième commande. Pour A2.1/A2.2, B1.1/B1.2, etc., le chevron ouvre un **bottom sheet** groupé par familles et limité aux niveaux réellement disponibles. Ne pas comprimer le nom de marque, la connexion et les niveaux sur une seule ligne à 320px.

### 6.3 Progression

En-tête « TA PROGRESSION », pourcentage du **niveau actif** et série globale/contextuelle selon calcul réel. Barre très fine avec piste foncée. Ne pas confondre progression globale du niveau avec « Aujourd'hui ». Les compteurs d'exemple du mockup sont fictifs.

### 6.4 Accès secondaires

Raccourcis regroupés : S'entraîner, Examens, Erreurs, Jeux. Même axe, labels lisibles. 4 colonnes sur écran suffisamment large ; en très petite largeur ou zoom fort, réorganiser en 2×2 si nécessaire, sans créer de boutons <44px.

### 6.5 États

Définir au minimum : chargement, progression nulle, aucune leçon reprenable, niveau indisponible, invité et connecté, série zéro, hors ligne, retour depuis chemin, message d'erreur. Aucun raccourci ne doit sembler disponible s'il ne fonctionne pas.

## 7. Rapport à LuxApp 2.1

Le code 2.1 utilise `public/design-tokens.css`, `public/components.css`, `public/accueil-v21.css` et des modules d'apprentissage/jeux. Les invariants fonctionnels et pédagogiques restent prioritaires. La **palette Watfir est une proposition de remplacement visuel**, pas une autorisation pour repeindre toutes les variables sémantiques ou changer les jeux.

Faire évoluer les composants existants plutôt que dupliquer leurs fonctions. Les nouvelles classes temporaires doivent être préfixées `wf-` pour éviter les collisions ; ne pas multiplier des styles globaux pour écraser 2.1. La référence 2.1, qui considérait l'or comme CTA principal, reste historique pour les vues non migrées jusqu'à validation explicite.

## 8. Mouvement et rendu

Transitions 120–220ms sur éléments interactifs, avec débrayage `prefers-reduced-motion`. Aucun filtre VHS permanent, aucun scintillement de texte, aucun glow sur les réponses. Sur supports HDR, vérifier que le rouge et le cyan ne brûlent pas. Les formes sont d'abord vectorielles, les effets analogiques éventuels étant strictement décoratifs.

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
