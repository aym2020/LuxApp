# LuxApp — Design system

Référence visuelle de LuxApp. Catalogue vivant : `/catalogue.html` (mêmes feuilles CSS que l'application).

## Historique des versions

| Version | Date | Changements |
| --- | --- | --- |
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
- **Or = l'action.** Le jaune `--couleur-action` désigne l'action principale de l'écran et la prochaine étape. Une seule action principale visible à la fois.
- **Couleur de la leçon (`--lc`, dans les JSON) = l'appartenance.** Étiquettes « LEÇON 3 », « UNITÉ 2 », liseré ou teinte légère. Jamais pour une action.
- États : vert = réussi / terminé ; rouge = erreur ; turquoise = révision ; bleu = examens, information, mission.
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
| Grand bouton d'action | `.btn-jaune` (56 px) | un seul verbe : Découvrir, Commencer, Continuer, Reprendre, Revoir |
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

## 6. Gouvernance

Toute nouvelle fonctionnalité ou refonte :

- réutilise les composants de `components.css` ;
- n'ajoute pas de valeur CSS arbitraire : une nouvelle couleur, taille ou rayon devient un token dans `design-tokens.css` ;
- documente ici toute exception justifiée (section 7) ;
- met à jour ce document et l'historique des versions quand une règle commune change ;
- vérifie les écrans touchés par une modification globale : `/catalogue.html`, puis les écrans concernés (comparaison de captures avant / après pour un changement qui ne doit rien modifier visuellement).

## 7. Exceptions connues

- **Mission (messagerie)** : bulles et zone de réponse propres à la conversation (`#view-mission`) ; couleurs issues des tokens sauf le fond des bulles (#26272b, #e8b95c) et l'avatar (dégradé chaud).
- **Introduction de mission** : composition plus immersive (titre serif, objectifs en orange).
- **Valeurs codées en dur restantes dans `style.css`** (gris proches de `--couleur-bord-3` : #3a3935, #34322d, #2a2823…) : à remplacer par des tokens au fil des modifications des écrans concernés.
