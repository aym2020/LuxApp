# LD-001 — Audit de référence UX/UI du jeu Lux Démasqué (avant refonte arcade)

**Projet :** LuxApp · **Branche examinée :** `2.1` · **Date :** 28 octobre 2026.  
**Périmètre :** jeu « Lux Démasqué », dossier Milo, plus la fiche Noah en exemple ; **aucune refonte UI n'est implémentée dans ce lot**.  
**Suivi canonique :** [TODO V1.1 (`main`)](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md) · [SPEC 110](specs/SPEC-110.md) · [Design System](DESIGN_SYSTEM.md) · [Charte UI 2.1](CHARTE_UI_2.1.md).

## 1. Base de preuves et méthode

Trois niveaux de preuve, à **ne pas confondre** :

1. **Captures réelles Samsung fournies par le joueur (28/10)** : rencontre Milo et Noah, interrogatoire normal/précisé, réseaux Pix/Pro/Amis, détails de pièces pesto et LuxRun, carnet, objection rejetée et réussie, pause, confirmation de conclusion, bilan 0/3 et 1/3, liste des explications et vérités. Elles démontrent l'aspect réellement vu sur Android, mais ne constituent pas une mesure CSS reproductible.
2. **Inspection du code GitHub `2.1`** : `public/lux-demasque.js`, `public/lux-demasque.css`, `public/lux-demasque-core.js` et conventions. Elle explique les causes et états, mais ne prouve pas seule le rendu sur téléphone.
3. **Captures Chromium mobiles reproductibles** : script [`tests/capture_lux_demasque_ld001.py`](../tests/capture_lux_demasque_ld001.py), 16 états × 2 formats **360 × 740 et 393 × 852 CSS px** ; manifeste JSON (viewport, zones, hauteurs, défilement, boutons sous 44 px) et PNG archivés via [workflow `lux-demasque-v11.yml`](../.github/workflows/lux-demasque-v11.yml). Rechercher l'artifact **`lux-demasque-ld001`** dans l'exécution GitHub Actions correspondante. Ce test est un **état de référence**, pas un test de validation de la future DA ; il ne remplace pas l'observation Samsung.

**Principe directeur confirmé avec le joueur :** arcade old-school années 90/2000, 16/32 bits, pixel art **par touches**, personnages 3D low-poly PS1, humour et réactions manga. Pas d'application SaaS au thème violet, pas de pixelisation généralisée des longs dialogues, pas de baisse de difficulté. Le français ne doit plus être le sous-titre automatique des répliques LU : cible LD-005 à LD-011, avec petit Dico contextuel.

## 2. Inventaire des écrans et états

| État de référence | Capture CI (préfixe) | Constat Samsung / code | Problème dominant | Suite |
|---|---|---|---|---|
| Rencontre — fiche personnage | `01-rencontre` | Dossier tamponné, grand portrait, accroche, salut traduit, date, règles, CTA, lien réseaux | Hauteur cumulée : entrée trop longue, densité de panneaux | LD-012 à 014 |
| Déposition normale | `02-deposition` | Personnage PS1 et plaque LU/FR, HUD réseau/carnet/disquettes | HUD trop en concurrence avec personnage, traduction court-circuite LU | LD-005/015/016 |
| Déposition avec précision | `03-deposition-precision` | Question du joueur + réponse sous phrase initiale ; deux boutons dock | La carte grandit et défile sur elle-même, lecture moins rythmée | LD-017/019 |
| Réseaux Pix | `04-reseaux-pix` | Réseau fictif et publications illustrées | Réseau peu distinct de Pro/Amis ; nombreuses bordures | LD-020/021/025 |
| Réseaux Pro | `05-reseaux-pro` | CV/profil qui peut innocenter ou contredire selon la date | Document fictif présenté dans une feuille quasi générique | LD-020/024 |
| Réseaux Amis | `06-reseaux-amis` | Informations de colocation, pesto, LuxRun | Cartes/états « au carnet » répétés | LD-020/022 |
| Pièce individuelle | `07-piece` | Grande photo/capture, date, transcription, statut, énorme Retour doré | Duplications visuel/transcription et forme de modale web | LD-023/024/025/033 |
| Carnet avec pièces et paroles | `08-carnet` | Pièces puis paroles, précisions ; badge numérique dans HUD | Navigation longue, information dense, compteur ne compte que pièces | LD-026/027 |
| Objection — choix de preuve | `09-objection-choix` | Citation puis liste souvent longue de preuves/phrases | Risque de perte de la cible après défilement ; énergie arcade faible avant sélection | LD-023/027/031 |
| Objection rejetée | `10-verdict-refuse` | Retour comique, pénalité -50, couche en bas | Bonne interaction ; distinguer erreur des vérités sans révéler la solution | LD-032 |
| Objection retenue | `11-verdict-retenu` | Personnage réagit, tampon « Disquette démasquée » | Interaction la plus forte ; lisibilité et rythme à stabiliser | LD-028/029/031 |
| Phrase déjà démasquée | `12-deposition-demasquee` | Tampon jaune et boutons encore inactifs | Deux actions sans effet, absence de CTA « suivante » | LD-018/019 |
| Menu Pause | `13-menu-pause` | **Conclure** en or, **Reprendre** en violet | Hiérarchie inversée : pause incite visuellement à abandonner | LD-036 |
| Confirmation de fin | `14-confirmation-fin` | Avertit que les autres mensonges ne seront plus trouvables | Bonne prévention, conserver ; privilégier « Continuer » | LD-037 |
| Bilan — dessus | `15-bilan-debut` | 0/3 ou 1/3, portrait, réponse de Milo, 3 statistiques, grand Nouveau dossier | Écran proche du jeu mais récompense ambiguë en cas de résultat incomplet | LD-038/039 |
| Bilan — long | `16-bilan-complet` | Les trois mensonges et preuves sont ouverts par défaut, puis vérités, diagnostic | Pavés de texte, solutions révélées, forte longueur, debug exposé | LD-040 à 043 |

**Note :** les scénarios de preuve exacts dépendent du dossier. Le script fixe Milo pour conserver des images comparables, tandis que les captures Samsung comprennent aussi Noah.

## 3. Diagnostic transversal : direction artistique

### DA — identité encore hybride

**Présent et à conserver :** tampon « DOSSIER N° », police Press Start 2P sur identifiants/cris/compteurs, 3D PS1 à basse résolution, palette noir/violet/rose/or, contraste rouge sur « OBJECTION ! », réactions manga et feedback sonore.

**Rupture de style principale :** fiches, onglets, boutons, sous-fenêtres et bilans utilisent massivement des contours fins + grands arrondis (CSS : `border-radius: 12/14/18/20/22px`, souvent avec fond violet translucide). Ce vocabulaire de composants de **web-app** cohabite avec le graphisme arcade du cri et des tampons. Il faut unifier les surfaces dans **LD-002 à LD-004**, pas simplement ajouter une police pixel à toutes les lignes.

**Palette :** mêmes rôles à rappeler (or = CTA, rouge = objection, rose = personnage, violet = scène/jeu) ; bleus `#9fb0ff` (défaite/score/record) et kraft doivent être documentés pour éviter des couleurs perçues comme arbitraires. Ne pas multiplier l'or sur décor, statut et boutons concurrents.

**Typographie :** conserver une police de lecture nette pour les phrases LU, dates et preuves ; réserver le pixel aux titres, aux chiffres, aux tampons et à la confrontation. Vérifier texte agrandi et 320 px avant de réduire les tailles.

### Ergonomie et architecture visuelle

- **Rencontre** : le DOM cumule fiche, salut, rendez-vous, 3 règles, CTA et lien réseaux. La cause est structurelle dans `ldRendreRencontre()`, pas uniquement une marge CSS. La fiche Noah sur Samsung illustre ce bloc narratif très étiré.
- **Déposition** : `.ld-depo{height:100dvh;overflow:hidden}` ; `.ld-declaration{max-height:48dvh;overflow-y:auto}`. C'est bien de réserver une scène fixe, mais une précision longue peut absorber une part excessive de l'écran et son propre scroll interne. Garder le personnage présent et le dock accessible.
- **Fenêtres** : `.ld-calque` fixe avec `.ld-fenetre{max-height:92dvh;overflow-y:auto}` ; une pièce s'ouvre sur le réseau déjà ouvert. Les captures montrent l'empilement visuel. Simplifier la sensation de navigation sans casser Retour/Échap ni le focus, actuellement testés.
- **Verdict** : dérogation CSS `.ld-calque-verdict .ld-fenetre{max-height:none;overflow:visible}` et CTA sticky. À surveiller en très faible hauteur, gros caractères et pour des révélations longues ; **risque identifié dans le code**, pas panne mesurée sur Samsung.
- **Bilan** : `<details class="ld-details" open>` dévoile immédiatement tous les mensonges, et chaque liste les représente en long. La surcharge est structurelle, avant même le CSS. Distinguer résumé des conclusions et explications facultatives.
- **Carnet** : le toast « précision ajoutée au carnet » est vrai pour les données, mais `#ld-carnet-nb` ne compte que `genre === 'piece'`. Clarifier son libellé plutôt qu'incrémenter arbitrairement.
- **Écran de Pause** : l'or sur « Conclure le dossier » contredit la sémantique de l'action primaire de la charte. « Reprendre » doit dominer.
- **Visuels de preuve** : la scène du pesto visible dans les captures manque de reconnaissance visuelle immédiate ; garder une transcription accessible et améliorer le visuel 3D, sans faire dépendre la solution d'un micro-détail.
- **Yeux du PNJ** : sur plusieurs captures Samsung de Milo, les yeux pâles/mi-clos et les traits blancs verticaux ressemblent à des larmes. Il faut séparer pose neutre et réactions au moment de LD-028 ; ne pas supposer que chaque frame est identique.

## 4. Priorité opérationnelle des corrections

| Ordre | Symptôme | Correctif ciblé | Tâche |
|---|---|---|---|
| 1 | Interface arcade incohérente | Palette et famille de composants rétro communes, légères | LD-002 à LD-004 |
| 2 | Le LU est systématiquement doublé en français | Dico accessible ; pas de sous-titres automatiques | LD-005 à LD-011 |
| 3 | Intro verticale, HUD dense, lecture en double | Réduire architecture de rencontre et repositionner la parole | LD-012 à LD-019 |
| 4 | Fenêtres en cascade, pièces répétitives, carnet dense | Navigation et supports de preuve propres à chaque réseau | LD-020 à LD-027 |
| 5 | Personnage parfois peu expressif, confrontation perfectible | Expressions et impact arcade, sans animations longues | LD-028 à LD-033 |
| 6 | Pause et bilan sous-optimaux | Reprendre prioritaire, bilan progressif et non spoiler | LD-036 à LD-043 |

## 5. Garde-fous des lots suivants

- **Ne pas simplifier l'enquête** : trois mensonges prouvables, trois vérités possibles, preuves datées, leurres et précision obligatoire.
- **Ne pas modifier le moteur `lux-demasque-core.js` pour des retouches cosmétiques.**
- **Ne pas remplacer les captures réelles Samsung par les PNG Chromium**. Garder chaque type de preuve avec sa source.
- **Ne pas changer Lux Match, la progression des leçons, le cloud ou l'audio par accident**.
- Chaque lot de refonte devra produire son **avant/après** avec les mêmes 360 × 740 / 393 × 852, plus test 320/430 et Android tactile quand pertinent.
- **Le prochain lot LD-002 porte sur les tokens de couleur**, pas sur un redessin global simultané.

## 6. Mesures réelles de la baseline Chromium (28 octobre 2026)

**Exécution complète réussie :** [GitHub Actions n°40648859830](https://github.com/aym2020/LuxApp/actions/runs/40648859830) sur `2.1`, code `f0f9af6`. **Artifact :** [`lux-demasque-ld001` (32 PNG + `manifest.json`)](https://github.com/aym2020/LuxApp/actions/runs/40648859830/artifacts/12799130743). Ce snapshot est conservé **30 jours** ; le script de génération et les mesures résumées dans ce document demeurent versionnés pour une régénération ultérieure. Le test complet du jeu (Node/Playwright) a également été **vert** lors de cette exécution. Le manifeste est la source de mesure, pas une estimation à partir des screenshots.

| Mesure | 360 × 740 | 393 × 852 | Interprétation |
|---|---:|---:|---|
| Hauteur de page rencontre | **775 px** | **852 px** | À 360 px, **35 px hors du viewport** : l'action secondaire descend ; le démarrage principal reste à y=655 |
| Carte `ld-fiche` rencontre | 208 px | 170 px | La densité explose dès que l'accroche passe sur davantage de lignes |
| Règles de rencontre | 156 px | 156 px | Trois consignes prennent une zone significative du premier écran |
| Carte déposition sans précision | 157 px | 157 px | Gabarit stable |
| Carte déposition avec précision | **300 px** | **300 px** | Près du double, occulte davantage le personnage |
| Feuille carnet (visible / contenu total) | **681 / 1399 px** | **784 / 1346 px** | Carnet long, défilement important ; une preuve peut exiger beaucoup de navigation |
| Feuille choix d'objection (visible / contenu total) | **681 / 1220 px** | **784 / 1149 px** | Liste de preuves dense, cible de la phrase éloignée après défilement |
| Hauteur totale bilan | **1545 px** | **1464 px** | **2,09×** et **1,72×** le viewport, respectivement ; refonte progressive utile |
| Débordements horizontaux (16 états) | **0 / 16** | **0 / 16** | Baseline positive : préserver ce résultat dans les lots suivants |
| Boutons visibles actifs sous 44 px (capture script) | **0** | **0** | Baseline positive aux tailles et états mesurés ; ne vaut pas un audit WCAG exhaustif |

**Vérification visuelle de la planche 16 × 2 par inspection des PNG :** identité reconnaissable grâce à la 3D PS1, tampons, logo et cri ; beaucoup de cartes et de feuilles arrondies avec bordures, apparition des réseaux en feuilles du bas ; écran des preuves textuelles plus dense que l'écran de dialogue ; grand panneau de bilan à détails ouverts et nombreuses traductions FR ; comparaison 360/393 illustrant le saut de hauteur de la fiche. Ces observations se retrouvent également dans les captures Samsung fournies par le joueur.

**Éléments à ne pas surinterpréter :** aucune erreur de scroll **horizontal** n'a été mesurée, mais cela ne signifie pas que l'ergonomie verticale est bonne ; le carnet et le bilan sont volontairement défilants. Les captures ont été faites en émulation Chromium avec réduction des animations, **pas** en test réel de GPU Samsung. Le script ne teste pas le texte à 150 %, TalkBack ni le clavier du futur dictionnaire : à couvrir lors de l'implémentation des lots concernés. Les snapshots présentent un toast « Précision ajoutée au carnet » car l'état de référence prévoit cette action ; ce n'est pas un élément permanent du HUD.

## 7. Traçabilité des fichiers et statut

- Code inspecté : [`lux-demasque.js`](../public/lux-demasque.js), [`lux-demasque.css`](../public/lux-demasque.css).
- Capture automatisée : [`tests/capture_lux_demasque_ld001.py`](../tests/capture_lux_demasque_ld001.py), exécution dans [CI dédiée](../.github/workflows/lux-demasque-v11.yml).
- Validation technique existante (avant LD-001) : [CI du 28 octobre — 9/9 blocs verts](https://github.com/aym2020/LuxApp/actions/runs/40648161245).
- **LD-001 est un audit seulement** : les problèmes inventoriés doivent rester ouverts dans leurs tâches individuelles, même si l'inventaire est validé.
