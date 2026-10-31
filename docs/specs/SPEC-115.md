# SPEC 115 — RED FLAG : écran d'accueil fixe, contexte narratif et entrée Cringr (V2)

**Décision produit V2 :** 31 octobre 2026 · **Dépôt :** `aym2020/LuxApp` · **Branche de code :** `2.1`  
**Statut : V2 SPÉCIFIÉE — NON IMPLÉMENTÉE, NON TESTÉE, VALIDATION SAMSUNG À FAIRE.** La V1 cinématique a été implémentée (commit `ea3f774` ; voir § 10), mais **rejetée visuellement par le produit**. Ne pas présenter l'ancienne CI verte comme une recette de la V2.  
**Suivi :** [LD-049 — TODO canonique sur `main`](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md). LD-048/SPEC 113 (sélecteur) et LD-002.01 (Rencontre) restent distinctes.

> **Décision normative : ABANDONNER la cinématique 3D, le téléphone qui vibre, la prise en main, les messages intermédiaires, le zoom et le mécanisme « vu une fois ».** Les remplacer par **un seul écran de préparation statique**, dans l'esprit du lancement de **Lux Runner**, suivi immédiatement du sélecteur Cringr au clic sur **Commencer**. Ne pas créer de nouvelle SPEC.

## 1. Objectif produit

Avant de voir les profils masculins dans Cringr, le joueur doit comprendre immédiatement :

1. **Qui il incarne** : une jeune femme adulte (personnage fictif) qui cherche un rendez-vous.
2. **Où se déroule l'aventure** : l'application de rencontres fictive **Cringr**, intégrée au jeu RED FLAG.
3. **Ce qu'il va faire** : choisir un prétendant, discuter **en luxembourgeois**, chercher les incohérences et **prouver** les mensonges grâce aux indices. Il ne suffit pas de deviner qu'un homme ment.
4. **Ce qu'il doit toucher** : un unique bouton principal **« Commencer »** ouvrant directement le sélecteur existant.

Le contexte doit être compréhensible **en 3 à 5 secondes de lecture**, sans pavé explicatif, sans tutoriel modal, sans animation forcée et sans étape intermédiaire. L'introduction est un **écran de lancement**, pas un jeu dans le jeu.

## 2. Référence visuelle et direction artistique

Référence de composition : écran de préparation de **Lux Runner** sur Samsung (capture produit du 31/10/2026) : fond nocturne sombre, bandeau Retour/Jeux, titre fortement hiérarchisé, illustration/repère graphique marquant, informations essentielles, gros CTA or placé en bas.

**Maquette produit retenue :** deuxième mockup « Ton prochain date sur Cringr. » : il établit une jeune femme low-poly dans un intérieur nocturne, une tasse et un téléphone, avec une lecture en trois gestes. **C'est une référence de composition, pas un asset de production à intégrer tel quel** : reconstruire l'interface avec HTML/CSS, puis utiliser un asset autorisé et optimisé pour l'illustration. Ne pas incorporer une capture entière contenant du texte rasterisé.

**Style :**
- Fond #120f17 / violet très profond avec halo discret **fondu dans le noir**, sans rectangle de fond brutal sur PC.
- Titre éditorial serif dans l'esprit Lux Runner ; touches rose/rouge pour Cringr et RED FLAG, **or LuxApp réservé au CTA**.
- Petits repères pixel art/arcade pour les trois étapes ; pas de multiplications de badges, étoiles, stickers ou effets « template IA ».
- Portrait **féminin adulte** low-poly / PS1, expression légèrement dubitative ou amusée, sans hyperréalisme ni sexualisation. Composition simple : héroïne assise devant son téléphone, ou portrait de trois-quarts avec téléphone sur une table.
- Ne pas utiliser le visage d'un prétendant comme héroïne, ni recycler l'identité narrative de Noémie/Emma de Lux Match. Une géométrie féminine partagée peut servir **si ses couleurs et son rôle sont propres à RED FLAG**.
- Sur un vrai écran de 360–393 px, ne pas tenter de reproduire tous les espaces et éléments de la maquette au pixel : **la lisibilité et le CTA visible priment**.

## 3. Structure d'écran — ordre obligatoire

| Rang | Composant | Contrat |
|---|---|---|
| 1 | **En-tête** | Retour vers Jeux à gauche ; **RED FLAG** identifié sans doublon de titre énorme. Même logique de navigation que les jeux. |
| 2 | **Kicker discret** | Ex. « TON PROCHAIN RENDEZ-VOUS », en petite capitale violette ; facultatif si l'espace vertical manque. |
| 3 | **Titre principal** | **« Ton prochain date sur Cringr. »**, le mot **Cringr** accentué en rose, sur 2–3 lignes selon largeur. |
| 4 | **Visuel héroïne** | Une seule illustration 2D statique optimisée issue d'un rendu low-poly cohérent, non une scène Three.js en fonctionnement ; smartphone visible pour identifier le contexte. |
| 5 | **Pitch court** | Deux phrases maximum (§ 4). Le visuel peut accompagner le texte en grand écran, mais ne doit pas le recouvrir. |
| 6 | **Règle des trois gestes** | Trois pictogrammes simples, liés par des chevrons discrets : **Choisis → Discute → Démasque** ; libellés lisibles sous chaque pictogramme. |
| 7 | **Action principale** | Bouton or LuxApp **« Commencer → »**, largeur disponible, tactile ≥48 px, placé vers le bas de la zone de préparation et jamais masqué. Il ouvre le **sélecteur Cringr actuel**. |

**À supprimer par rapport au mockup généré :** les deux pilules « En luxembourgeois (A1–A2) » et « Dialogue et enquête » (redondantes avec le pitch et les trois gestes) ; **« Revoir l'intro »** (absurde lorsque cette page EST l'introduction) ; les éléments décoratifs en surnombre. Ne pas ajouter « Musique/Oui » sur cet écran si aucun réglage existant ne le demande.

Sur Android, prévoir une page à hauteur naturelle et scroll si nécessaire, **sans blocage vertical**. L'objectif est de garder le CTA dans le premier viewport usuel **393×852**, mais jamais au prix d'une police minuscule ou d'une illustration écrasée. À **320×600**, une petite zone scrollable est acceptable ; ne jamais tronquer le bouton ni rendre les textes inaccessibles. Sur PC, respecter l'enveloppe extérieure commune **640 px** (SPEC 114) ; le texte et le visuel se recentrent sans occuper 100 % du viewport.

## 4. Copywriting final proposé

**Titre :** Ton prochain date sur Cringr.

**Contexte :** « Tu incarnes une femme qui cherche un rendez-vous sur Cringr. »

**Mission :** « Discute en luxembourgeois, cherche des indices et démasque les mensonges. »

**Étapes :**
- **Choisis** — un profil.
- **Discute** — en luxembourgeois.
- **Démasque** — les mensonges.

**CTA :** **Commencer →**

**Contraintes éditoriales :** langage français naturel, légèrement complice, pas de tutoiement forcé caricatural ; pas de déclaration selon laquelle *toutes* les paroles des prétendants seraient fausses : certains faits sont vrais, seuls certains sont des mensonges à prouver (SPEC 110). Ne pas écrire qu'un rendez-vous a déjà été fixé alors qu'aucun LIKE n'a été effectué. Éviter les instructions de gameplay trompeuses (« repère les red flags » uniquement à l'intuition).

Le titre peut être raccourci après recette Samsung si le visuel souffre, **sans perdre le nom Cringr**. Les textes sont des nœuds DOM, jamais intégrés à une image.

## 5. Règles de navigation et persistance

1. **Chaque entrée normale** RED FLAG depuis le hub Jeux affiche cet **écran d'accueil fixe**, à la manière de Lux Runner ; pas seulement la première fois. Ce choix **remplace** la V1 « une fois puis directement Cringr ». Il ne doit pas devenir un tutoriel rejoué de force.
2. **Commencer** passe directement à Cringr, sans seconde intro, sans animation, sans messagerie, sans appel au moteur de dossier, sans écriture de dislike/LIKE et sans perdre l'ordre ou la graine des profils.
3. **Retour** depuis l'accueil revient au hub Jeux ; sur Cringr, conserver la navigation actuelle de SPEC 113. Retour Android, navigateur et focus clavier cohérents.
4. Une ouverture répétée, un double clic Commencer ou un départ pendant chargement ne doit pas produire deux sélecteurs, deux musiques, deux sessions ou un profil généré différent.
5. **L'ancienne préférence `luxDemasquePrologueVuV1`** peut rester stockée pour compatibilité, mais **ne décide plus de l'affichage** de cet accueil ; ne pas migrer/supprimer de données utilisateur ni altérer `luxDemasqueResolus`, les records, seeds, `ldSwipeVu` ou les réglages audio.
6. L'ancienne action **« Revoir l'introduction »** devient inutile : retirer son contrôle visible **uniquement** avec l'abandon du prologue V1, sans faire disparaître des actions de Cringr ou de Rencontre. L'accueil est accessible depuis le hub à chaque fois.
7. Musique : ne pas introduire de nouvelle boucle ; le fond musical d'enquête de Cringr et les préférences `luxDemasqueSon` / `luxDemasqueMusique` restent respectés. Tout audio doit respecter le geste utilisateur / autoplay. Aucune ressource WebGL chargée **pour ce seul écran fixe**.
8. Si le chargement des profils échoue après Commencer : conserver l'état d'erreur et le bouton Réessayer existants de SPEC 113. L'intro statique ne doit pas bloquer Cringr.

## 6. Contrat technique : réutiliser, simplifier, supprimer le code mort

**État actuel observé sur `2.1` :** la V1 existe dans `public/lux-demasque.js` (`ldEntrerRedFlag`, `ldDemarrerPrologue`, `ldRendrePrologue`, phases `cinema/messages`, `ldTerminerPrologue`) et le moteur partagé `public/lux-match-3d.js` (service `prologue(...)`). Des CSS, tests et effets audio sont associés. **Ces éléments sont historiques, pas le design cible.**

- Réutiliser le point d'entrée **`ldEntrerRedFlag()`** et la vue `#view-luxdemasque`. Remplacer les phases cinématiques/messages par une unique phase **`accueil` / `preparation`** statique.
- Préserver `ldOuvrirSelection()` et `ldRendreSelection()` pour Cringr ; la SPEC 113 reste prioritaire **à partir du clic Commencer**.
- Réutiliser les composants visuels existants de l'application (titre, boutons, fond), notamment la logique de composition de `public/runner.css` comme **référence**, mais éviter les sélecteurs CSS globaux partagés susceptibles de casser Lux Runner.
- **Ne pas conserver des timers, un import Three.js, le système de skip, une messagerie inaccessible ou un état cinéma inutile** simplement pour minimiser la taille du diff : retirer proprement le code devenu orphelin **après audit des appels et des tests**, sans supprimer les services 3D utilisés par Lux Match, l'interrogatoire, les portraits et les preuves.
- Réduire les ressources inutiles du prologue V1 (scène, vibration, bruitages dédiés) **seulement** si leurs références sont exclusives à cette cinématique ; garder les méthodes audio partagées.
- Illustrer par une image 2D fixe **d'origine contrôlée** (rendu du modèle féminin existant avec le renderer déjà disponible durant la production, asset PNG/WebP optimisé, ou composition graphique originale). **Ne pas imposer à chaque utilisateur le chargement 3D pour dessiner l'écran d'accueil**. La création de l'illustration définitive devra être contrôlée visuellement avant livraison.
- Fallback : si l'image ne charge pas, une composition CSS statique conserve le titre, le contexte, les étapes et Commencer. Aucun écran noir.
- Ne modifier **aucun JSON d'enquête**, règle LU, score, sauvegarde, génération de dossiers, ni le jeu Lux Match.

## 7. Recette d'acceptation V2 (distincte des anciens PR-01 à PR-12)

| ID | Contrôle | Attendu |
|---|---|---|
| FIX-01 | Première entrée depuis Jeux | Accueil fixe complet, protagoniste féminine identifiable et contexte compris en quelques secondes |
| FIX-02 | Réouverture après une partie et après redémarrage | **Même accueil fixe** ; ancienne clé V1 n'empêche pas son affichage |
| FIX-03 | Action Commencer et double clic | **Un seul** sélecteur Cringr, aucun écran de messages, aucune cinématique |
| FIX-04 | Retour Android/navigation, depuis accueil puis Cringr | Retour correct, focus cohérent, aucune scène/son orphelin |
| FIX-05 | Image manquante, API de profils en erreur, stockage refusé | Contexte lisible, fallback, accès au Retry Cringr |
| FIX-06 | 320×600, 360×740, 393×852, 430×932 | Pas de débordement horizontal ni de CTA masqué ; texte et héroïne bien cadrés |
| FIX-07 | PC 768 / 1024 / 1440 px | Enveloppe 640 px, contraste et centrage corrects, aucune bordure de fond artificielle |
| FIX-08 | Texte 130/200 %, zoom, clavier/focus, reduced motion | Titres lisibles, action accessible, aucune animation imposée, navigation clavier valide |
| FIX-09 | LIKE/NOPE, portraits 3D, rencontre, déposition, nouvelle partie | Gameplay SPEC 110/113, graines, records et sons inchangés |
| FIX-10 | Lux Runner / Lux Match / WebGL partagé | Aucune régression causée par la suppression du service cinématique |

**À tester réellement** : tests Node/Playwright RED FLAG adaptés à la **V2**, `bash tools/test-lux-demasque.sh rapide` puis `complet`, tests de régression Lux Match et suites pertinentes du PLAYBOOK ; captures avant/après au minimum à 360, 393 et 430 px, plus PC ; **vrai Samsung pour validation visuelle**. L'ancienne suite `tests/test_lux_demasque_prologue.py` décrit la cinématique V1 et **doit être adaptée/remplacée** : son passage ou son échec n'est pas un verdict sur la V2.

**Qualité visuelle :** le rendu doit avoir l'air d'un écran de jeu conçu par une équipe, pas d'une infographie promotionnelle générée. Éviter trois systèmes de badges, surlignages et pictogrammes répétés ; garder des espaces respirants, une vraie héroïne et un parcours de lecture évident.

## 8. Ordre de réalisation

1. Auditer les dépendances du prologue V1 et figer les captures avant.
2. Construire **le seul écran statique**, valider les vrais textes et la disposition à 393×852 ; utiliser une illustration féminine optimisée et accessible.
3. Brancher Commencer vers le sélecteur existant, retirer progressivement les anciennes phases et leurs ressources **exclusives**.
4. Actualiser les tests (la V1 est désormais abandonnée), contrôler navigation/stockage/audio/erreurs.
5. Captures PC + mobile, CI dédiée, contrôle Samsung et validation produit ; documenter commits, tests et limites dans LD-049 **sans cocher avant accord**.

## 9. Hiérarchie et suivi

- **SPEC 115 V2 (ce document) = source normative pour l'écran d'entrée fixe.** Tous les passages de la V1 parlant de téléphone vibrant, zoom 3D ou messagerie sont **obsolètes et non à implémenter**.
- **SPEC 113** = source normative **uniquement pour la sélection Cringr** après Commencer ; garder carte, tampon LIKE/NOPE, croix et cœur.
- **SPEC 110** = enquête : moteur, personnages, dialogues LU, preuves FR, objections et scores.
- **SPEC 114 / charte UI §6 bis** = layout PC et compatibilité mobile.
- **LD-049**, suivi sur `main`, reste **ouverte** jusqu'à validation V2 sur Samsung. **LD-048 et LD-002.01 restent ouvertes et indépendantes.**
- La V2 est **une décision de remplacement** de l'implémentation V1 ; elle n'est pas encore codée, testée ni approuvée sur appareil.

## 10. Historique V1 — conservé pour traçabilité, non normatif

Le 31/10/2026, la SPEC 115 V1 « Le téléphone vibre » a été implémentée sur la branche `2.1` (code `ea3f774`) et une recette Chromium PR-01 à PR-12 a été documentée. Elle montrait un téléphone vibrant, une héroïne trois-quarts animée via `PickUp`, un zoom vers les messages, puis un CTA « Ouvrir Cringr ». Elle utilisait `luxDemasquePrologueVuV1`, une option de skip et un fallback 2D. **Le produit a ensuite rejeté le rendu animé et choisi l'écran d'accueil statique V2.** Les tests et captures de V1 restent historiques ; aucune de leurs validations ne s'applique automatiquement à V2. Les fonctions et assets en question **existent encore dans le code tant que le remplacement n'est pas livré**.
