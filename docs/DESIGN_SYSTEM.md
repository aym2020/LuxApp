# LuxApp — Design system

Référence visuelle de LuxApp. Catalogue vivant : `/catalogue.html` (mêmes feuilles CSS que l'application).

## Historique des versions

| Version | Date | Changements |
| --- | --- | --- |
| 1.8 | 2026-10-19 | Code couleur unique pour toute l'app, couleurs de leçon retirées de l'interface, libellés de statut canoniques (« Acquise précédemment »…), structure commune des cartes, règles des indicateurs et des actions, token gris bleuté `--couleur-acquis` (spec 48) |
| 1.7 | 2026-10-18 | Chemin continu : bloc « Terminées » supprimé, carte de leçon acquise verte, unité `par-mission` (cercle vert non rempli) (spec 33) |
| 1.6 | 2026-10-18 | Mission : ligne des vies `.ms-vies-zone` (cœurs 24 px centrés, compteur dessous), animation de vie perdue, panneau `.ms-regles` (spec 34) |
| 1.5 | 2026-10-18 | Statut secondaire `.unites .statut` (sobre, sans bordure) remplace `.pastille-statut` ; icônes d'état du chemin 22 px ; en-tête de mission titre + vies (spec 30) |
| 1.4 | 2026-10-18 | Lignes du chemin en grille (état · texte · statut · chevron), statut secondaire sous le titre, pastille `.pastille-statut`, requêtes de conteneur en `em` pour les cartes étroites ou le texte agrandi (spec 29) |
| 1.3 | 2026-10-18 | `.cta-fixe` : fondu limité à la marge haute, ne capte plus les appuis hors de son bouton (spec 25). États d'unité du chemin `ok` / `actuelle` / `a-venir` (spec 27) |
| 1.2 | 2026-10-18 | Tout l'exercice mot caché en `--police-lettres` (Nouveau mot, consigne, article, cases, tuiles, correction) |
| 1.1 | 2026-10-18 | Police des lettres isolées `--police-lettres` (Atkinson Hyperlegible, hébergée dans `public/fonts/`), composant `.cta-fixe` (résultats, introduction d'unité) — spec 21 |
| 1.0 | 2026-10-18 | Tokens centralisés (`design-tokens.css`), composants partagés (`components.css`), catalogue, écran de leçon aligné sur « Mon chemin » (spec 19) |

## 1. Trois niveaux

| Niveau | Fichier | Contenu |
| --- | --- | --- |
| Tokens | `public/design-tokens.css` | Couleurs, polices, tailles de texte, espacements, rayons, dimensions |
| Composants | `public/components.css` | Boutons, puces, barre du haut, étiquettes, badges, pastilles — une définition par composant, avec ses variantes |
| Écrans | `public/style.css` | Accueil, chemin, leçon, exercices, mission… : ils placent les composants, sans redéfinir leurs couleurs ni leurs tailles |

Ordre de chargement : `design-tokens.css` → `components.css` → `style.css`. Pas de framework.

## 2. Direction artistique

- Thème sombre et chaleureux (`--couleur-fond` #0f0e0c, surfaces brun-gris).
- **Principe directeur (spec 48)** : une information n'est affichée que si elle aide l'utilisateur à comprendre sa progression, à identifier un état ou à décider de sa prochaine action. Chaque couleur, icône, compteur, badge et libellé a une fonction précise.
- **Code couleur unique, valable sur tous les écrans** — une couleur ne change jamais de sens selon la leçon ou l'écran :

| Couleur | Token | Sens | Exemples |
| --- | --- | --- | --- |
| Or / jaune | `--couleur-action`, `--couleur-or-fond/-bord` | Action principale, étape recommandée, activité en cours | Grand bouton jaune, prochaine unité, leçon conseillée |
| Vert | `--couleur-reussi`, `--couleur-vert-*` | Réussite ou validation **effectivement obtenue** | Leçon terminée, unité terminée, validée par la mission, « Continuer » après bonne réponse |
| Gris neutre | `--couleur-texte-3`, `--couleur-bord-*`, surfaces | Non commencé, secondaire, informatif | Leçon à découvrir, unité à venir, textes secondaires |
| Gris bleuté | `--couleur-acquis`, `--couleur-acquis-fond/-bord` | Acquis **historique** (ancienne version) | « Acquise précédemment » |
| Turquoise | `--couleur-turquoise`, `--couleur-turq-*` | Révision, répétition espacée | « 11 questions à réviser », écran Réviser |
| Rouge | `--couleur-erreur` | Erreur, échec, alerte à corriger | Mauvaise réponse, vie perdue, mission à rejouer |
| Bleu | `--couleur-info`, `--couleur-bleu-*` | Information, examens — **jamais un état de progression** | Encadrés « info » du cours, examens, face française des cartes |

- **Pas de couleur propre à une leçon dans l'interface.** Les cartes utilisent des surfaces sombres neutres et des bordures discrètes. Le champ `couleur` des JSON est conservé (données) mais `--lc` ne sert plus à colorer cartes, étiquettes, anneaux ou liserés ; les usages restants sont à retirer au fil des modifications (section 7).
- **Jamais la couleur seule** : tout état porte aussi une icône et un libellé lisible par un lecteur d'écran. Vert pour « Terminée » et pour « Validée par la mission » : c'est le texte qui fait la différence.
- Polices : **Inter** pour l'interface ; **Instrument Serif** pour les mots et phrases luxembourgeoises courtes et les titres narratifs (au-delà de 40 caractères, Inter : classe `.texte-long`) ; **Atkinson Hyperlegible** (`--police-lettres`) pour **tout l'exercice mot caché** (écran « Nouveau mot », consigne, article, cases, tuiles, correction) : c'est là qu'on apprend l'orthographe, I, l, i, 1, O et 0 doivent se distinguer d'un coup d'œil. Ailleurs, Inter et Instrument Serif.
- Cartes arrondies (`--rayon-carte` 20 px), bordures discrètes (`--couleur-bord-1`), animations courtes, coupées par `prefers-reduced-motion`.

## 3. Tokens principaux

| Rôle | Token | Valeur |
| --- | --- | --- |
| Fond | `--couleur-fond` | #0f0e0c |
| Carte | `--couleur-surface-1` / `--couleur-bord-1` | #1a1916 / #2a2926 |
| Carte principale | `--couleur-surface-2` / `--couleur-bord-2` | #26241f / #3d3a31 |
| Bouton secondaire, puce, champ | `--couleur-bord-3` | #3a3730 |
| Texte / secondaire / discret | `--couleur-texte` / `-2` / `-3` | #f6f1e9 / #c8bda8 / #aaa090 |
| Action | `--couleur-action` | #f5cf4d |
| Texte sur action | `--couleur-sur-action`, `--couleur-sur-or` | #0f0e0c, #1a1505 |
| Réussi / erreur / info | `--couleur-reussi` / `-erreur` / `-info` | #54e0ad / #ef7a73 / #6fb0f2 |
| Révision (turquoise) | `--couleur-turquoise` / `--couleur-turq-fond` / `--couleur-turq-bord` | #4fd1c5 / #10282a / #2b6b68 |
| Acquis historique (gris bleuté) | `--couleur-acquis` / `--couleur-acquis-fond` / `--couleur-acquis-bord` | #9aabbd / #1b2027 / #3b4756 |
| Prochaine étape (carte) | `--couleur-or-fond` / `--couleur-or-bord` | #2b2514 / #6b5a22 |
| Tailles de texte | `--fs-micro` 12, `--fs-sec` 14, `--fs-corps` 16, `--fs-titre` 22 px | |
| Espacements | `--sp-1` à `--sp-6` : 4, 8, 12, 16, 24, 32 px | |
| Rayons | `--rayon-bouton` 12, `--rayon-moyen` 14, `--rayon-carte` 20, `--rayon-pilule` 999 px | |
| Dimensions | `--toucher` 44, `--hauteur-bouton` 48, `--hauteur-bouton-grand` 52, `--hauteur-cta` 56 px | |

Les anciens noms (`--accent`, `--bg`, `--muted`…) restent comme **alias** dans `design-tokens.css`. Ne plus en créer ; les remplacer au fil des modifications.

## 4. Composants

| Composant | Classe | Variantes / états |
| --- | --- | --- |
| Bouton | `.pc-btn` (48 px) | `.primary` (or), `.ok` (vert, continuer après réussite), `.ko` (rouge, après erreur), `.ghost`, `.plus`, `.wide`, `.big`, `:disabled`, `:active` |
| Grand bouton d'action | `.btn-jaune` (56 px) | un seul libellé, selon l'état réel (section 5 bis) : Découvrir, Commencer, Continuer, Reprendre, Faire les nouvelles unités, Revoir |
| Puce | `.pc-chip` | `.active`, `.plus`, `.plus.fait` |
| Bouton icône | `.pc-icon-btn` | 44 × 44 |
| Barre du haut | `.back-btn` « ← écran précédent », `.pc-cours-btn`, `.pc-icon-btn.maison` | barre fixe (`position: sticky`) |
| Étiquettes | `.pc-mini-label`, `.etiquette(.or)` | |
| Badges et pastilles | `.badge(.fait)`, `.pastille(.v/.o)`, `.lecon-pill` | |
| Retour d'exercice | `.pc-feedback(.ok/.ko)` | une seule action : « Continuer » |
| Bandeau d'action fixe | `.cta-fixe` | porte l'action principale en bas de l'écran (zone de sécurité comprise) ; le contenu garde 96 px de marge en bas ; fondu seulement dans la marge haute, `pointer-events` limité au bouton |

## 5. Règles d'interface

1. **Une seule action principale par écran** (or). Après une correction, les commandes de saisie disparaissent ; il reste « Continuer » (vert ou rouge).
2. **Compacter l'interface, jamais l'information** : les titres et intitulés pédagogiques ne sont pas tronqués dans une carte ouverte.
3. Zone tactile ≥ 44 px ; boutons ≥ 48 px.
4. Le clavier du téléphone ne s'ouvre jamais tout seul.
5. Retour = l'écran réellement précédent (`navigation.js`).
6. **Une seule action principale par carte dépliée** (bouton jaune) ; les actions secondaires sont des liens discrets (« Voir toute la leçon »), pas de second grand bouton.
7. **Pas de troncature** : un titre peut passer sur plusieurs lignes ; aucun badge ne réduit la largeur nécessaire pour le lire.
8. Une simple navigation (ouvrir, replier, revenir) ne modifie jamais la progression.

## 5 bis. Statuts de progression (libellés canoniques)

Ces libellés sont **les mêmes partout** (Accueil, Chemin, écran de leçon, résultats). Un même état = un même mot.

### Leçon

| Situation | Libellé | Indicateur |
| --- | --- | --- |
| Jamais commencée | À découvrir | gris neutre |
| Au moins une activité réellement faite | En cours | or |
| Acquise dans l'ancienne version | Acquise précédemment | gris bleuté |
| Toutes les unités obligatoires faites | Terminée | vert + coche |
| Validée grâce à la mission | Validée par la mission | vert, libellé distinct |

- **Recommandée ≠ en cours** : une leçon conseillée mais jamais commencée reste « À découvrir » (la recommandation s'exprime par l'action jaune, pas par le statut).
- Ne jamais afficher « v1 », « V2 » ou un autre nom de version technique dans l'interface.
- Acquis historique : aucun acquis supprimé, aucune étoile inventée, aucune unité fictivement terminée, aucune obligation de refaire la leçon (spec 46).
- Les synthèses chiffrées distinguent leçons terminées, leçons acquises précédemment et activités commencées ; ne jamais mélanger un nombre de leçons et un nombre d'unités.

### Unité

| État | Présentation |
| --- | --- |
| Non commencée | cercle neutre vide |
| Prochaine étape recommandée | cercle or |
| En cours | cercle or + libellé |
| Terminée réellement | coche verte (+ étoiles si réellement obtenues) |
| Facultative car leçon validée par la mission | indicateur distinct, ni coche ni étoile |

### Action principale de la leçon

| État | Libellé |
| --- | --- |
| Jamais ouverte | Découvrir |
| Introduction vue, rien fait | Commencer |
| Progression commencée | Continuer |
| Session interrompue | Reprendre |
| Acquise précédemment, nouvelles unités non faites | Faire les nouvelles unités |
| Terminée | Revoir |

## 5 ter. Cartes, lignes et indicateurs

**Structure commune des cartes de liste** (leçon repliée, et toute carte du même type ailleurs) — grille CSS, pas de Flexbox empilé :

- **ligne 1** : numéro · titre (plusieurs lignes possibles) · chevron toujours en haut à droite ;
- **ligne 2, seulement si utile** : statut significatif et indicateur de révision, en texte secondaire.

Une carte sans information secondaire reste compacte ; sa hauteur suit son contenu (jamais de hauteur fixe ni de ligne vide). Les cartes dépliées gardent la même typographie et les mêmes alignements.

**Lignes d'unité, de mission, de bilan** : indicateur d'état · numéro et titre complet · chevron à droite. Un intitulé long passe à la ligne sans déplacer l'icône ni le chevron.

**Libellés de référence :**

| Élément | Affichage |
| --- | --- |
| Révisions dues | « N questions à réviser » (turquoise ; N = compte réel du moteur de répétition espacée) |
| Bilan | « Bilan · 10 questions · Optionnel », sur une ligne, sans badge |
| Mission (dans une liste) | icône dialogue · « Mission » · titre du scénario · chevron ; résultat (« Réussie », « À rejouer », « Sans faute ») **seulement après une partie jouée** ; pas de compteur de découverte (« 0/20 ») |

**Un indicateur est supprimé s'il** répète une information déjà visible, n'a pas de conséquence pour l'utilisateur, ressemble à un score sans en être un, demande une connaissance technique, ou agrandit une carte sans raison. On garde toute information nécessaire pour comprendre la progression ou pour l'accessibilité.

**Pas de badge isolé sur une ligne** quand un texte secondaire suffit.

**Densité** : réduire les vides inutiles, garder une séparation nette entre unités et des zones tactiles ≥ 44 px ; ne pas réduire la police pour gagner de la place.

**Responsive et accessibilité** : vérifier à 320, 360, 390 et 430 px, texte à 130 % et 200 % ; aucun débordement horizontal, titre écrasé, chevron déplacé, bouton coupé ni texte caché par la barre du bas ; contrastes WCAG 2.2 AA ; `prefers-reduced-motion` respecté.

## 6. Gouvernance

Toute nouvelle fonctionnalité ou refonte :

- réutilise les composants de `components.css` ;
- n'ajoute pas de valeur CSS arbitraire : une nouvelle couleur, taille ou rayon devient un token dans `design-tokens.css` ;
- documente ici toute exception justifiée (section 7) ;
- met à jour ce document et l'historique des versions quand une règle commune change ;
- n'ajoute pas d'exception propre à une leçon, ni de style inline évitable, ni de sélecteur sur-spécifique pour corriger un cas : on corrige le composant commun ;
- vérifie les écrans touchés par une modification globale : `/catalogue.html`, puis les écrans concernés (comparaison de captures avant / après pour un changement qui ne doit rien modifier visuellement).

## 7. Exceptions connues

- **Mission (messagerie)** : bulles et zone de réponse propres à la conversation (`#view-mission`) ; couleurs issues des tokens sauf le fond des bulles (#26272b, #e8b95c) et l'avatar (dégradé chaud).
- **Introduction de mission** : composition plus immersive (titre serif, objectifs en orange).
- **Cartes recto / verso (flashcards)** : face française en bleu, face luxembourgeoise en or. L'or y désigne la langue cible, pas une action : exception tolérée tant que l'écran existe.
- **Couleur de leçon `--lc` encore utilisée** (à retirer au fil des modifications, spec 48) : `chemin.js` (cartes du Chemin), `parcours.js` (écran de leçon), `revision.js` (anneaux, liste des leçons), `examens.js` (cartes d'examen), `.pc-lc` dans `style.css`.
- **Libellés à aligner sur la section 5 bis** (spec 48) : « Acquise · v1 » (`chemin.js`), « leçons acquises · v1 » (`accueil.js`), « À rafraîchir · N » (`chemin.js`, `parcours.js`, `revision.js`), badge « Facultatif » du bilan, « FACULTATIVE · LEÇON VALIDÉE PAR LA MISSION » (`parcours.js`), « En cours » attribué à une leçon seulement conseillée (`chemin.js`).
- **Valeurs codées en dur restantes dans `style.css`** (gris proches de `--couleur-bord-3` : #3a3935, #34322d, #2a2823…) : à remplacer par des tokens au fil des modifications des écrans concernés.
