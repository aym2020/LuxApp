# Lux Démasqué — TODO de refonte V1.1

**Source de vérité du suivi :** `aym2020/LuxApp` · **branche `main`** · `docs/LUX-DEMASQUE-TODO.md`  
**Branche du jeu :** `2.1` (ne pas confondre avec `main`, qui ne contient pas encore la version jouable).  
**Création :** 28 octobre 2026 · **Statut :** 0/48 tâches validées dans ce backlog (nouvelle tâche préalable LD-000, validation de la suite de tests). Les fonctions déjà implémentées en D0–D5 sont à améliorer, pas à reconstruire.  
**PROCHAINE ACTION : `LD-000`** — exécuter et valider la nouvelle suite de tests dédiée sur `2.1`. Ensuite `LD-034`, puis `LD-001` et les lots suivants.

> **But produit :** jeu d'enquête exigeant, arcade rétro old-school 16/32 bits, un peu pixel art, personnages 3D low-poly PS1, expressions/effets manga, interface cohérente et fluide sur Android. **Ne pas abaisser la difficulté logique** : préserver les vraies déclarations, les leurres, les indices datés, les précisions indispensables et les objections à preuve suffisante. Supprimer les traductions françaises systématiques des dialogues luxembourgeois ; créer un dictionnaire consultable, sans donner les solutions.

## Règle permanente — retrouver, sélectionner et mettre à jour la prochaine tâche

**À suivre pour toute demande « prochaine action », « où en est Lux Démasqué ? », intervention ou nouvelle discussion portant sur ce jeu :**

1. **Lire ce fichier directement sur GitHub, branche `main`, avant de répondre** ; ne pas utiliser le souvenir d'une conversation ou un fichier joint comme statut de référence. Lire aussi `2.1/PLAYBOOK.md`, `2.1/docs/specs/SPEC-110.md` et le code actuel de `2.1` avant toute modification.
2. Une case `[ ]` = **à faire / pas encore vérifiée** ; `[x]` = **livrée ET vérifiée**. Une CI verte seule ne vaut pas validation Android. Si le code a été modifié par un autre agent, comparer au résultat actuel et faire la recette prévue avant de cocher.
3. **Ordre de traitement :** d'abord `LD-000` (validation du banc de tests), puis `LD-034` (anomalie fonctionnelle confirmée), ensuite `LD-001` à `LD-033`, puis `LD-035` à `LD-047`, en respectant les dépendances et en repriorisant explicitement tout nouveau défaut bloquant. **La prochaine action est la première tâche non cochée de cet ordre**, sauf blocage documenté. Une tâche importante découverte ultérieurement reçoit un nouvel ID, jamais le recyclage d'un ID.
4. Pour chaque tâche réalisée par l'assistant : modifier uniquement les fichiers nécessaires de `2.1`, tester, vérifier l'interface concernée, **puis mettre à jour ce fichier sur `main` dans la même intervention**. Ajouter une ligne au journal avec la date, l'ID, le commit de code, les tests réellement effectués et les vérifications restantes. Si non validée : laisser `[ ]` et noter le blocage.
5. Ne pas cocher une tâche simplement parce qu'un autre agent dit l'avoir faite. Vérifier les fichiers et tests sur GitHub. Préserver Lux Match, les leçons, le cloud et la progression. Ne pas modifier le moteur de vérité/contradiction pour un simple chantier d'interface.
6. **Pas de suivi autonome en arrière-plan :** l'actualisation est faite lorsqu'une intervention ou une demande dans la conversation permet de vérifier l'état. Cette TODO est l'index persistant entre conversations.

**Références :** [SPEC 110 (`2.1`)](https://github.com/aym2020/LuxApp/blob/2.1/docs/specs/SPEC-110.md) · [documentation (`2.1`)](https://github.com/aym2020/LuxApp/blob/2.1/docs/README.md) · [moteur](https://github.com/aym2020/LuxApp/blob/2.1/public/lux-demasque-core.js) · [interface](https://github.com/aym2020/LuxApp/blob/2.1/public/lux-demasque.js) · [styles](https://github.com/aym2020/LuxApp/blob/2.1/public/lux-demasque.css) · [contenus](https://github.com/aym2020/LuxApp/blob/2.1/data/jeux/lux-demasque/contenus-v01.json).

## Préalable — Tests avant refonte (LD-000)

- [ ] **LD-000 · P0 — Qualifier la suite de tests Lux Démasqué.** Les scripts de test, le runner dédié et le guide sont enregistrés sur `2.1` : [documentation et commandes](https://github.com/aym2020/LuxApp/blob/2.1/docs/LUX-DEMASQUE-TESTS.md). **À faire :** exécuter réellement `bash tools/test-lux-demasque.sh rapide` puis `bash tools/test-lux-demasque.sh complet` sur un clone actuel de `2.1`, corriger les éventuels échecs de la suite, consigner les résultats et vérifier que la suite critique intègre les tests. **Validé si :** les contrôles réellement exécutés passent, les échecs éventuels sont expliqués, et les limites Chromium vs Samsung sont documentées. Le contrat `bash tools/test-lux-demasque.sh acceptation` est attendu rouge jusqu'à la correction de LD-034 et ne bloque pas LD-000.

## Lot 0 — Socle de direction artistique (LD-001 à LD-004)

- [ ] **LD-001 · P0 — État des lieux visuel.** Capturer rencontre, déposition normale/précisée/démasquée, réseaux, pièce, carnet, objection correcte/ratée, pause et bilan. **Validé si :** les captures sont archivées et les écarts UI identifiés à 360/393 px.
- [ ] **LD-002 · P0 — Palette arcade.** Centraliser dans le CSS du jeu violet profond, rose, rouge objection, or d'action et surfaces neutres ; respecter la sémantique LuxApp. **Validé si :** aucune couleur concurrente ou régression globale dans les écrans comparés.
- [ ] **LD-003 · P1 — Hiérarchie typographique rétro.** Pixel font pour titres, tampons et compteurs, police lisible pour LU, dates, preuves et longs textes. **Validé si :** aucun texte tronqué à 320 px ou à 150 %.
- [ ] **LD-004 · P1 — Composants de jeu communs.** Harmoniser bouton arcade, onglet, panneau, fiche de pièce, en-tête et badge sans refonte du moteur. **Validé si :** mêmes composants/états ont la même présentation sur les écrans.

## Lot 1 — Luxembourgeois sans sous-titres et dictionnaire (LD-005 à LD-011)

- [ ] **LD-005 · P0 — Retirer les traductions automatiques.** Par défaut, ne plus afficher FR sous déclaration, question, précision et réplique/aveu LU ; conserver les données `fr` à des fins de référence. **Validé si :** aucune traduction intégrale n'apparaît pendant le jeu après rechargement.
- [ ] **LD-006 · P0 — Remplacer `FR` par `Dico`.** Remplacer l'action `ldBasculerAide()` dans le HUD par un accès au lexique. **Validé si :** ouvrir/fermer ne change ni déclaration, ni progression, ni caméra.
- [ ] **LD-007 · P1 — Panneau dictionnaire arcade.** Créer une feuille contenant recherche et entrées LU→FR, Back Android et retour à la scène. **Validé si :** recherche et fermeture fonctionnent sans perte d'état ni problème clavier.
- [ ] **LD-008 · P1 — Lexique du dossier Milo.** Constituer un inventaire de mots et expressions réellement employés dans les six déclarations, précisions et réactions. **Validé si :** chaque entrée a un sens FR contrôlé et une provenance.
- [ ] **LD-009 · P1 — Formes fléchies et expressions.** Relier notamment infinitifs, conjugaisons, pronoms et expressions fréquentes aux bonnes entrées, sans découpage naïf. **Validé si :** les formes affichées renvoient au sens approprié.
- [ ] **LD-010 · P1 — Vocabulaire contextuel.** Montrer d'abord les mots utiles à la réplique courante, puis le dictionnaire complet. **Validé si :** aucun indice de mensonge ni phrase FR complète n'est révélé.
- [ ] **LD-011 · P1 — Sources de preuves en FR.** Conserver Pix/Pro/Amis, dates, légendes et pièces en français ; les phrases dites par le PNJ restent LU. **Validé si :** le recoupement LU↔FR reste faisable sans changement des preuves.

## Lot 2 — Rencontre et déposition (LD-012 à LD-019)

- [ ] **LD-012 · P1 — Compacter la rencontre.** Diminuer hauteur de fiche/portrait et espacements sans supprimer les données utiles. **Validé si :** le CTA n'est pas repoussé hors champ.
- [ ] **LD-013 · P1 — Raccourcir les règles d'entrée.** Remplacer la longue liste par un résumé clair : écouter, préciser, fouiller, objecter. **Validé si :** un nouveau joueur comprend les actions sans lire un pavé.
- [ ] **LD-014 · P1 — CTA de départ mobile.** Garantir « Commencer le rendez-vous » et l'accès secondaire aux réseaux avec safe area. **Validé si :** accessibles à 320×640, 360×740, 393×852 et 430×932.
- [ ] **LD-015 · P1 — HUD compact.** Réorganiser compteur de disquettes, réseaux, carnet, dictionnaire et pause sans cacher le personnage. **Validé si :** tous les contrôles sont ≥44 px et aucune information critique n'est coupée.
- [ ] **LD-016 · P1 — Carte de déclaration.** Donner la priorité au LU, à la navigation et au confort de lecture ; profiter de la place libérée par FR. **Validé si :** hauteur stable, scroll interne seulement si besoin.
- [ ] **LD-017 · P1 — Distinguer question/précision.** Faire apparaître visuellement « Toi » et réponse du PNJ comme deux moments distincts. **Validé si :** aucune ambiguïté sur qui parle.
- [ ] **LD-018 · P1 — États de progression des six phrases.** Distinguer non entendue / entendue / démasquée avec indicateurs lisibles et accessibles. **Validé si :** pas de révélation anticipée des mensonges.
- [ ] **LD-019 · P1 — Actions après démasquage.** Remplacer les deux grands boutons désactivés par une action pertinente (« Phrase suivante » si possible), sans interdire le retour. **Validé si :** navigation et anti-double-gain restent intacts.

## Lot 3 — Réseaux, pièces et carnet (LD-020 à LD-027)

- [ ] **LD-020 · P1 — Identité Pix / Pro / Amis.** Adapter subtilement présentation des flux à leur rôle (photo, CV, amis), dans une DA arcade commune. **Validé si :** trois réseaux identifiables sans changer les pièces.
- [ ] **LD-021 · P1 — Publications compactes.** Réduire espaces inutiles et afficher auteur, date, titre et aperçu sans pavé. **Validé si :** une publication reste reconnaissable en petit écran.
- [ ] **LD-022 · P1 — Statut « au carnet ».** Transformer les gros badges répétés en marque discrète de lecture. **Validé si :** l'état consulté reste évident, y compris sans couleur.
- [ ] **LD-023 · P1 — Navigation réseau → pièce.** Remplacer l'empilement visuel de feuilles par une transition cohérente tout en conservant l'historique et Back Android. **Validé si :** Retour retrouve le même onglet/scroll.
- [ ] **LD-024 · P1 — Page de preuve lisible.** Mettre visuel, date/source, texte déterminant et retour dans l'ordre utile ; transcription complète accessible sans duplication obligatoire. **Validé si :** aucun indice essentiel n'est masqué.
- [ ] **LD-025 · P1 — Miniatures cohérentes.** Unifier tailles et cadrages des photos, profils, posts et captures sport. **Validé si :** images et alt/transcriptions concordent, même sans WebGL.
- [ ] **LD-026 · P1 — Structure du carnet.** Regrouper pièces, déclarations et précisions en sections immédiatement repérables. **Validé si :** retrouver une pièce déjà ouverte est rapide.
- [ ] **LD-027 · P1 — Compteur explicite du carnet.** Harmoniser la métrique affichée et le toast « précision ajoutée ». **Validé si :** le joueur sait ce que le badge dénombre ; aucun faux bug perçu.

## Lot 4 — Animation et confrontations (LD-028 à LD-033)

- [ ] **LD-028 · P1 — Lisibilité des yeux et du visage.** Revoir poses/cadrage/matériaux qui donnent l'impression que Milo pleure ou garde les yeux fermés. **Validé si :** visage neutre et regard reconnaissables sur vrai Samsung.
- [ ] **LD-029 · P1 — Expressions distinctes.** Différencier assurance, gêne, ironie après erreur, choc et défaite via animations/modèles déjà partagés. **Validé si :** chaque émotion se lit sans texte.
- [ ] **LD-030 · P2 — Micro-animations de dialogue.** Prévoir transitions courtes de pose/emphase sans bloquer la lecture. **Validé si :** pas de saut de mise en page ni ralentissement du changement de phrase.
- [ ] **LD-031 · P1 — Effet OBJECTION arcade.** Caler cri, flash, lignes de vitesse, pièce brandie et réaction 3D, avec possibilité de passer l'animation. **Validé si :** une seule interaction est possible pendant l'effet ; version motion réduite correcte.
- [ ] **LD-032 · P1 — Deux feedbacks de confrontation.** Réussite spectaculaire, erreur brève et moqueuse, sans indice de solution non demandé. **Validé si :** score et logique inchangés, feedback lisible.
- [ ] **LD-033 · P2 — Visuels 3D des pièces faibles.** Améliorer en priorité la scène du pesto et les images où l'objet de preuve est peu identifiable. **Validé si :** compréhension visuelle accrue sans nouvelle exigence de pixels fins.

## Lot 5 — Pause, navigation et bilan (LD-034 à LD-043)

- [ ] **LD-034 · P0 — « Nouveau dossier » réellement nouveau.** **Code et tests poussés sur `2.1` le 28/10/2026**, mais **validation navigateur/Samsung à faire**, donc case ouverte. Correction dans `ldNouveauDossier` : après 1/3 sur Milo, « Nouveau dossier » ouvre Noah ; progression ensuite vers Tom puis un généré, sans marquer Milo résolu. **Validé si :** le contrat `tests/test_lux_demasque_acceptation.py` et la suite `complet` passent réellement, et Back Android/rejeu sont validés. Références : [`1734b52`](https://github.com/aym2020/LuxApp/commit/1734b52f792353b8e482438c4aa94f061507614e), [guide des tests](https://github.com/aym2020/LuxApp/blob/2.1/docs/LUX-DEMASQUE-TESTS.md).
- [ ] **LD-035 · P0 — Rejouabilité des dossiers partiels.** Préserver l'accès à Milo et au même seed généré après une fin incomplète, sans marquer le dossier « résolu ». **Validé si :** « Rejouer » reproduit le même dossier et « Nouveau » en ouvre un différent.
- [ ] **LD-036 · P1 — Menu Pause hiérarchisé.** Mettre « Reprendre » en CTA prioritaire ; « Conclure » reste secondaire. **Validé si :** l'action par défaut n'encourage pas l'abandon.
- [ ] **LD-037 · P1 — Confirmation de conclusion.** Conserver l'avertissement « objections restantes perdues », les deux choix et le comportement Retour. **Validé si :** aucune fin accidentelle.
- [ ] **LD-038 · P1 — Résultats différenciés.** Traiter 0/3, 1/3, 2/3 comme enquêtes incomplètes et 3/3 comme victoire. **Validé si :** texte, animation et couleur ne célèbrent pas faussement un échec.
- [ ] **LD-039 · P1 — Score et record.** Clarifier distinction score/record et réussite logique ; ne pas masquer une progression réelle. **Validé si :** affichage cohérent à 0/3, 1/3 et 3/3.
- [ ] **LD-040 · P1 — Bilan compact.** Montrer d'abord les trois thèmes avec état démasquée/non démasquée, sans longs paragraphes ouverts. **Validé si :** résumé et actions principales apparaissent rapidement sur mobile.
- [ ] **LD-041 · P1 — Détails à déplier.** Afficher motifs, preuves, phrases LU et transcription seulement à l'ouverture d'une carte. **Validé si :** aucune donnée du bilan existant n'est perdue.
- [ ] **LD-042 · P1 — Solutions révélées sur demande.** Après une fin incomplète, garder fermées les réponses des mensonges manqués, avec confirmation explicite avant dévoilement. **Validé si :** rejouer ne spoil pas automatiquement.
- [ ] **LD-043 · P2 — Diagnostic réservé aux tests.** Masquer IDs, seed, décompte d'actions et mention de relecture LU en jeu normal, tout en maintenant leur accès en recette. **Validé si :** outils disponibles aux testeurs, absents de l'UI joueur.

## Lot 6 — Validation du contenu, Android et non-régression (LD-044 à LD-047)

- [ ] **LD-044 · P0 — Audit linguistique du Dico.** Vérifier orthographe, flexions et sens des entrées par les leçons, `grammaire_luxembourg.md` et LOD.lu ; terminer la revue des répliques en attente. **Validé si :** aucun mot non vérifié présenté comme approuvé.
- [ ] **LD-045 · P0 — Recette des parcours.** Tester 0/3, 1/3, 2/3, 3/3, précision requise, objection fausse, preuve non vue, fin anticipée, replay et navigation. **Validé si :** moteur et interface donnent des résultats conformes.
- [ ] **LD-046 · P0 — Recette Android / responsive.** Tester 320, 360, 393, 430 px, hauteurs courtes, texte agrandi, clavier du Dico, Back, audio, GPU et touches ≥44 px. **Validé si :** aucune troncature, scroll parasite ni perte d'état observée sur vrai Samsung.
- [ ] **LD-047 · P0 — Tests anti-régression.** Exécuter tests Node/Playwright dédiés, `bash tools/critique.sh rapide` et `bash tools/critique.sh` ; contrôler Lux Match, leçons, progression et cloud. **Validé si :** pas de nouvelle régression et résultats consignés.

## Journal d'exécution

| Date | Tâche | Statut | Commit de code sur `2.1` | Tests / recette / réserves |
|---|---|---|---|---|
| 2026-10-28 | LD-001 à LD-047 | Backlog créé, **aucune tâche cochée** | — | Retour utilisateur et screenshots ; pas d'implémentation de la V1.1 |
| 2026-10-28 | LD-000 | Banc de tests et guide **livrés, exécution réelle encore à faire** | `3c30dd3`, `e87033e`, `7894c7c`, `91834e9`, `bcaf8c5` (branche `2.1`) | Runner rapide/complet/acceptation ; smoke mobile, contrat rouge LD-034, tests existants raccordés à la suite critique ; impossible de lancer les tests dans l'environnement de cette session (GitHub non clonable, pas de serveur exécuté). LD-000 reste ouverte jusqu'à vérification. |
| 2026-10-28 | LD-034 | **Code, contrat et documentation poussés ; recette navigateur et Samsung en attente** | `1734b52` (fix), `5eed60b` (Playwright), `14a8ef7` (runner), `f10bd60` (critique), `c1841bc` (guide) | Compilation JS complète réussie ; 8/8 scénarios de sélection simulés réussis ; Playwright/Node complet non exécutés faute de clone/serveur local GitHub. LD-034 reste `[ ]` jusqu'au passage réel de `acceptation`, `complet` et contrôle Android. |

**Règle :** après validation d'un ID, cocher la case correspondante et écrire une ligne datée ici. Mettre à jour le compteur de l'en-tête et la `PROCHAINE ACTION`. Les entrées antérieures ne sont pas effacées.
