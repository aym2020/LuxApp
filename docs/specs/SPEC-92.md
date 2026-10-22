# SPEC 92 — Survie « Feu et Tempête » : passifs uniquement, surchauffe, VFX en 4 étapes

**Branche :** `2.1` · **Date :** 22 octobre 2026 · **Statut :** étape 1/4 implémentée, recette Samsung à faire ; étapes 2 à 4 à faire.
**Révise :** [SPEC 89](./SPEC-89.md) et [SPEC 90](./SPEC-90.md) (pouvoirs actifs abandonnés, draft par surchauffe, Tempête sans mur à 180 s). **Prototype de référence :** [Embrasement V0.1](../prototypes/SURVIE-COMBO-FIRE-V01.md).

## Décisions produit (validées par l'utilisateur le 22 octobre 2026)

1. **Aucun pouvoir actif.** Un bouton qu'on a toujours intérêt à presser n'est pas une décision mais une corvée (constat « Galactic Racer »), et il éloigne le pouce des tuiles. Tous les pouvoirs deviennent des **buffs passifs permanents** qui se déclenchent seuls. La décision du joueur se fait au **draft** (quel buff prendre), pas pendant la frappe.
2. **Un passif doit se voir quand il agit.** Icône sous le chrono, pastilles de charge qui se remplissent à chaque mot juste, effet visuel propre au déclenchement. Un buff invisible n'a aucune valeur ressentie.
3. **Au moins un passif à double tranchant** (Brasier), pour que le draft ne se résume pas à « prendre le plus gros chiffre ».
4. **HUD à deux barres, deux rôles :**
   - **Barre chrono = barre en feu.** Longueur = temps restant ; intensité des flammes = palier de combo. Les flammes ne masquent jamais la lecture du temps.
   - **Barre de surchauffe** (étape 3) : se remplit avec les **points** (donc plus vite quand la série est haute). Pleine → « SURCHAUFFE » → pause atomique → choix d'un buff parmi 3. Seuil croissant à chaque niveau. Une erreur remet le multiplicateur à ×1 mais **ne vide pas** la barre. Remplace le draft aux streaks 8/12/16 de SPEC 90, que la plupart des joueurs n'auraient jamais vu.
5. **Pas de choix de pouvoirs avant la partie.** « Rejouer » relance une partie en moins d'une seconde ; la première surchauffe arrive vite (~4–5 mots).
6. **Points** (étape 2) : `10 × lettres × multiplicateur`. Le **record devient le score**, la meilleure série reste affichée en secondaire. L'ancien `luxSurvieBest` est conservé en lecture.
7. **Tempête sans mur de 180 s** (étape 4) : la fin vient de la Tempête, pas d'une limite arbitraire. Après Chaos ×2, l'escalade continue (×2,5 puis ×3), toujours déterministe donc compatible avec un classement.

## Catalogue des passifs (remplace le tableau de SPEC 90)

| Passif | Ancien pouvoir | Niveau I | II | III | Effet visible au déclenchement |
|---|---|---|---|---|---|
| Givre | Gel temporel (actif) | Chrono gelé 3 s toutes les 4 réussites | 4 s | 4 s toutes les 3 réussites | Givre sur la barre, flammes bleues |
| Étincelle | Lettre magique (actif) | 1re lettre posée sur les mots de 7+ lettres | mots de 6+ | 2 lettres sur 9+ | Étincelle qui vole vers la case |
| Passe-droit | Joker (actif) | « Passer » gratuit toutes les 5 réussites | 4 | 3 | Le bouton Passer s'allume en or |
| Braise | Second souffle | +0,5 s par mot | +0,75 s | +1 s | « +0,5 » qui rejoint la barre |
| Bouclier | Bouclier | Absorbe le malus d'une erreur, recharge 6 mots | 5 | 4 | Bulle autour du chrono qui éclate |
| Phénix | Dernière chance | Une résurrection à 3 s | 5 s | 7 s | Embrasement et renaissance de la barre |
| Brasier | Quitte ou double (actif) | Multiplicateur +1 palier, erreur −2× temps | — | — | Flammes hautes en permanence |

Charges = mots **correctement reconstruits**, jamais du temps. Aucune charge pendant la pause de draft. Toutes les sources de temps restent plafonnées à 30 s. Valeurs = hypothèses à simuler (SPEC 91) puis à tester sur appareil.

## Tempête — visuel (étape 4)

Phases inchangées (Calme / Vent / Tempête / Chaos) puis escalade. Bandeau d'annonce 3 s avant chaque phase (« LE VENT SE LÈVE ») et éclair. Traînées de vent en arrière-plan qui couchent les flammes ; en Chaos, pluie et bords assombris, flammes affaiblies si le combo est bas. Mot, tuiles et boutons jamais recouverts. Seul modificateur V1 : **mots d'élite** (cadre doré, points ×2, malus accru). Lettres parasites reportées (risque pédagogique et de lisibilité).

## Plan de livraison

| Étape | Contenu | Statut |
|---|---|---|
| 1 | Effets du jeu actuel : tuiles, réussite, erreur, barre chrono en feu, chrono critique, sons, couleur de la flamme | **Implémentée** — recette Samsung à faire |
| 2 | Points, multiplicateur visible, record au score, écran de fin (score qui défile, écart au record, mots ratés avec Écouter LOD) | À faire |
| 3 | Barre de surchauffe, draft, 4 passifs (Givre, Braise, Bouclier, Phénix) | À faire |
| 4 | Tempête (phases, annonces, visuel, mots d'élite), passifs restants | À faire |

Chaque étape est jouable seule et validée sur Samsung avant la suivante. Les modes Mes mots / Arène, le classement et l'équilibrage par simulation viennent après.

## Étape 1 — règles d'implémentation

**Règles de jeu inchangées** : +3 s par mot (plafond 30 s), −3 s par erreur ou passage, série remise à zéro, mot suivant à 280 ms, record = meilleure série. Aucun impact sur la progression pédagogique.

**Architecture :**
- `public/survie-vfx.js` : **gestionnaire d'effets unique** (canvas + sons). Le moteur `jeux-v21.js` lui envoie des événements (`demarrer`, `lettre`, `reussite`, `erreur`, `etat`, `arreter`) via `survieFx()` ; si le fichier manque, le jeu fonctionne à l'identique.
- HUD créé une seule fois par partie (règle SPEC 88) : la barre en feu continue de brûler pendant le changement de mot, sans second déclenchement.
- Un seul `<canvas>` au-dessus de la barre chrono, `pointer-events:none`, hors flux (aucun décalage des tuiles). DPR plafonné à 2, 140 particules maximum, boucle `requestAnimationFrame` arrêtée en fin de partie et suspendue quand la page est masquée.
- Animations DOM limitées à `transform` / `opacity` / couleurs. Aucune lecture forcée du layout.

**Effets :**

| Moment | Effet |
|---|---|
| Tuile touchée | Enfoncement de la tuile, la lettre « saute » dans sa case avec un léger rebond, note dont la hauteur monte à chaque lettre du mot |
| Mot juste | Balayage doré des cases de gauche à droite (< 280 ms), gerbe d'étincelles et pic lumineux à la tête de la barre, arpège montant transposé selon le palier |
| Nouveau palier (3, 5, 10) | Gerbe plus forte et accord supplémentaire |
| Erreur / Passer | Cases qui tremblent en rouge, les flammes meurent en fumée, un morceau de barre se détache et tombe, « −3 s » en rouge sous le chrono, « COMBO BRISÉ » si la série était ≥ 3, son grave |
| Barre selon palier | 0 : braises discrètes en tête, barre jaune. 1 : petites flammes. 2 : flammes orange. 3 : flammes plus hautes, cœur blanc-or. Mouvement organique (taille, vitesse et ondulation variables par particule), pas de langues triangulaires ni de bloom permanent |
| Moins de 5 s | Barre rouge qui bat, bords de l'écran qui pulsent, battement sonore à chaque seconde |
| Flamme de la série | Correctif : elle restait grise (la règle `.survie-hud span` écrasait sa couleur). Elle prend la couleur du palier et vacille dès le palier 1 |

**Son :** sons synthétisés (Web Audio, aucun fichier), volumes faibles, contexte audio créé au premier toucher. Bouton haut-parleur dans la barre du haut (« Couper le son » / « Activer le son »), choix mémorisé par profil (`storageKey('luxSurvieSon')`). Aucune vibration.

**Accessibilité :** `prefers-reduced-motion` désactive le canvas, les tremblements, les rebonds et les pulsations ; les couleurs de réussite/erreur sont doublées par le texte d'état existant.

## Critères d'acceptation étape 1

- Tests Node : moteur inchangé (+3/−3, série, Passer, HUD stable, pas de double impulsion), événements VFX émis une seule fois par réponse, plafond de particules, arrêt de la boucle, préférence son par profil, reduced-motion.
- Rendu Chromium mobile 360 × 780 : aucune tuile ni bouton recouvert, aucun débordement horizontal, captures palier 0 / palier 3 / erreur / chrono critique.
- **Recette Samsung obligatoire** avant de passer à l'étape 2 : fluidité, lisibilité du chrono, volume des sons.

## Implémentation

- 22 octobre 2026 — étape 1 : `public/survie-vfx.js` (nouveau), `public/jeux-v21.js` (événements, HUD enveloppé, bouton son, classes de feedback), `public/jeux-v21.css` (tuiles, cases, barre par palier, urgence, flamme), `public/index.html` (versions de cache), `test/jeux-v21.test.cjs`, `test/survie-vfx.test.cjs`, CI `accueil-2.1.yml`.

## Transition de fin de partie — extension UX SPEC 92 (22 octobre 2026)

**Cause corrigée :** l'ancien `survieTerminer()` arrêtait le Canvas puis remplaçait synchroniquement tout le HTML. Le passage de `0 s` au score était brutal et coupait l'effet de feu au milieu de son mouvement.

**Séquence cible (V1) :**
- À `0 s`, `p.actif=false`, `p.verrou=true`, intervalle du chrono interrompu, valeur `0 s` visible ; scores, streak et record **figés**. Aucun input, bonne réponse ou pénalité supplémentaire après la fin.
- Le même DOM conserve les lettres et le HUD pendant **950 ms** au maximum. Un rideau sombre annonce **« TEMPS ÉCOULÉ »**, le chrono se vide en ~260 ms, le feu cesse de générer des particules et ses dernières braises s'éteignent, avec une note basse si le son est actif.
- Bouton **« Passer l'animation »** pendant le rideau : résultat immédiatement accessible sans attente.
- À la révélation seulement, on arrête/efface le Canvas et on affiche les résultats. Meilleure série (valeur source inchangée) avec animation numérique bornée à 460 ms, `Mots trouvés` et `Record personnel` dans deux tuiles. Si `maxSerie > recordDepart`, badge **« Nouveau record ! »** ; pas de médaille autrement.
- `prefers-reduced-motion` : pas de rideau ni de comptage, résultat immédiat au score final. Le code reste fonctionnel si `survie-vfx.js` est absent.
- Tous les callbacks vérifient **l'identité de la session** et l'état `finEnCours`. Un retour, une nouvelle partie, une double demande de fin ou un clic « Passer » n'affichent jamais des résultats d'une ancienne session. La navigation et les données pédagogiques sont inchangées.
- Ne change **aucune règle** : bonus +3 s, faute/Passer −3 s, records existants par profil, affichage du mot et pools, score futur SPEC 92 étape 2.

**Recette requise :** tests Node des fins par chrono et Passer, fast-skip, départ/reprise, arrière-plan, égalité/nouveau record, préférence de réduction des mouvements, fumée/son VFX et absence de double sortie. Vérification navigateur 320–430 px puis essai Samsung avant validation visuelle. Ne pas qualifier la CI Node de validation d'animation sur Android.

## Ajustement du tempo de fin — 22 octobre 2026

À la demande de l'utilisateur, la transition entre l'apparition de **« TEMPS ÉCOULÉ »** et les résultats passe de **950 ms à 2 200 ms**, comptés à partir de l'arrêt du timer. Les 650 premières millisecondes environ servent à révéler le message ; il reste donc environ 1,5 seconde de lecture avant le score. Le bouton **« Passer l'animation »** continue d'ouvrir les résultats immédiatement ; `prefers-reduced-motion` continue de les montrer sans attente. Aucun changement au score, aux records, aux règles, au HUD, au Canvas ni à l'audio. Contrôles : à 1 100 ms le rideau est encore présent ; à 2 200 ms il est remplacé par les résultats, sur 320/360/390/430 px.
