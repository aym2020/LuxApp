# Lux Démasqué — TODO de refonte V1.1

**Source de vérité du suivi :** `aym2020/LuxApp` · **branche `main`** · `docs/LUX-DEMASQUE-TODO.md`  
**Branche du jeu :** `2.1` (ne pas confondre avec `main`, qui ne contient pas encore la version jouable).  
**Création :** 28 octobre 2026 · **Statut :** 3/48 tâches validées (LD-000, LD-001 et LD-034). La suite de tests dédiée est verte ; les vérifications mobiles des futures refontes restent prévues dans leurs tâches propres. Les fonctions déjà implémentées en D0–D5 sont à améliorer, pas à reconstruire.  
**PROCHAINE ACTION : `LD-002.01` — RENCONTRE.** Refonte arcade **écran par écran**, une seule livraison puis **validation explicite du joueur** avant de passer à l'écran suivant. Les 12 sous-étapes sont ci-dessous. **LD-000, LD-001 et LD-034 sont validées.**

> **But produit :** jeu d'enquête exigeant, arcade rétro old-school 16/32 bits, un peu pixel art, personnages 3D low-poly PS1, expressions/effets manga, interface cohérente et fluide sur Android. **Ne pas abaisser la difficulté logique** : préserver les vraies déclarations, les leurres, les indices datés, les précisions indispensables et les objections à preuve suffisante. Supprimer les traductions françaises systématiques des dialogues luxembourgeois ; créer un dictionnaire consultable, sans donner les solutions.

## Règle permanente — retrouver, sélectionner et mettre à jour la prochaine tâche

**À suivre pour toute demande « prochaine action », « où en est Lux Démasqué ? », intervention ou nouvelle discussion portant sur ce jeu :**

1. **Lire ce fichier directement sur GitHub, branche `main`, avant de répondre** ; ne pas utiliser le souvenir d'une conversation ou un fichier joint comme statut de référence. Lire aussi `2.1/PLAYBOOK.md`, `2.1/docs/specs/SPEC-110.md` et le code actuel de `2.1` avant toute modification.
2. Une case `[ ]` = **à faire / pas encore vérifiée** ; `[x]` = **livrée ET vérifiée**. Une CI verte seule ne vaut pas validation Android. Si le code a été modifié par un autre agent, comparer au résultat actuel et faire la recette prévue avant de cocher.
3. **Ordre de traitement :** `LD-000`, `LD-001` et `LD-034` sont validées. Commencer par **LD-002.01 → LD-002.12, une seule étape visuelle à la fois** ; ensuite terminer LD-003/004 et poursuivre les autres tâches. **Ne jamais commencer l'écran suivant avant accord explicite du joueur sur l'écran actuel.** En cas de retouches, conserver le même sous-ID comme prochaine action. Une tâche importante découverte ultérieurement reçoit un nouvel ID, jamais le recyclage d'un ID.
4. Pour chaque tâche réalisée par l'assistant : modifier uniquement les fichiers nécessaires de `2.1`, tester, vérifier l'interface concernée, **puis mettre à jour ce fichier sur `main` dans la même intervention**. Pour les sous-étapes LD-002, enregistrer **« en attente de validation produit »** après code + tests + captures ; cocher `[x]` **uniquement après accord explicite du joueur**, avec date, commit, captures et éventuelles retouches. Une CI verte ne remplace jamais son approbation graphique. Si refus, reprendre le même écran ; ne pas faire avancer `PROCHAINE ACTION`.
5. Ne pas cocher une tâche simplement parce qu'un autre agent dit l'avoir faite. Vérifier les fichiers et tests sur GitHub. Préserver Lux Match, les leçons, le cloud et la progression. Ne pas modifier le moteur de vérité/contradiction pour un simple chantier d'interface.
6. **Pas de suivi autonome en arrière-plan :** l'actualisation est faite lorsqu'une intervention ou une demande dans la conversation permet de vérifier l'état. Cette TODO est l'index persistant entre conversations.

**Références :** [SPEC 110 (`2.1`)](https://github.com/aym2020/LuxApp/blob/2.1/docs/specs/SPEC-110.md) · [documentation (`2.1`)](https://github.com/aym2020/LuxApp/blob/2.1/docs/README.md) · [moteur](https://github.com/aym2020/LuxApp/blob/2.1/public/lux-demasque-core.js) · [interface](https://github.com/aym2020/LuxApp/blob/2.1/public/lux-demasque.js) · [styles](https://github.com/aym2020/LuxApp/blob/2.1/public/lux-demasque.css) · [contenus](https://github.com/aym2020/LuxApp/blob/2.1/data/jeux/lux-demasque/contenus-v01.json).

## Préalable — Tests avant refonte (LD-000)

- [x] **LD-000 · P0 — Qualifier la suite de tests Lux Démasqué.** **VALIDÉ le 28/10/2026 par exécution réelle GitHub Actions** : `rapide` **3/3 blocs verts**, `complet` **9/9 blocs verts**, dont six parcours Playwright Chromium, le moteur + 1 000 graines et le contrat LD-034. Premier run : échec de test audio dû à un arrondi incorrect, corrigé dans [`6397a824`](https://github.com/aym2020/LuxApp/commit/6397a82421a7c343c4c977a78aed67b990475097) sans modifier l'audio du jeu. Preuve : [run `40648161245`](https://github.com/aym2020/LuxApp/actions/runs/40648161245). Les tests Android graphiques/tactiles de chaque future refonte et la suite critique transversale restent des contrôles distincts.

## Lot 0 — Socle de direction artistique (LD-001 à LD-004)

- [x] **LD-001 · P0 — État des lieux visuel. VALIDÉ 28/10/2026.** **32 captures de référence** (16 états × 360×740 et 393×852), manifeste JSON de géométrie, archive [GitHub Actions 40648859830](https://github.com/aym2020/LuxApp/actions/runs/40648859830/artifacts/12799130743) (conservation 30 jours, script reproductible et diagnostic permanent). [Audit écran par écran](https://github.com/aym2020/LuxApp/blob/2.1/docs/LUX-DEMASQUE-AUDIT-UI-LD001.md) : intro 775 px à 360×740, carnet 1399 px dans feuille 681 px, bilan 1545 px, DA hybride, pause CTA inversé ; **aucun overflow horizontal ni bouton actif sous 44 px** dans ces 32 états. CI dédiée 9/9 verte ; revue humaine des captures Chromium et rapprochement avec captures Samsung existantes. Les corrections sont réservées à LD-002 et suivants.
- [ ] **LD-002 · P0 — Refonte graphique arcade par écran, palette commune.** Déployer l'identité 16/32 bits (violet profond, rose, rouge objection, or action et surfaces neutres) **en 12 sous-étapes**, chacune avec avant/après, tests et **validation explicite du joueur**. Les ajustements de typographie/composants nécessaires à la cohérence locale sont inclus, puis LD-003/004 contrôlent l'homogénéité transversale. **Parent validé si :** 12/12 sous-étapes cochées, palette cohérente et aucune régression globale. [Procédure et critères](https://github.com/aym2020/LuxApp/blob/2.1/docs/LUX-DEMASQUE-VALIDATION-ECRANS.md).


### LD-002 — Validation de chaque écran (source de vérité des statuts)

**Décision utilisateur du 28/10/2026 :** un écran à la fois ; chaque sous-étape doit être **codée, testée, montrée avec captures avant/après et explicitement validée par le joueur** avant de continuer. La palette, les styles pixel, la typographie et les composants sont traités ensemble **sur cet écran seulement**, sans changer visuellement les autres. Après push + CI verte, conserver `[ ]` et indiquer « attente de validation » tant que le joueur n'a pas accepté. Après retouches, reproposer le même écran. [Guide opérationnel sur `2.1`](https://github.com/aym2020/LuxApp/blob/2.1/docs/LUX-DEMASQUE-VALIDATION-ECRANS.md). **Sous-étapes : 0/12 validées ; elles sont incluses dans le parent LD-002 et ne changent pas le total global 48.**

- [ ] **LD-002.01 — Rencontre / fiche du personnage.** **CODE POUSSÉ, TESTS VERTS, EN ATTENTE DE VALIDATION PRODUIT** (28/10/2026). Fiche arcade compacte, portrait PS1 préservé, salut et date conservés, consignes réunies en briefing, CTA visible à 360/393. [Implémentation et métriques](https://github.com/aym2020/LuxApp/blob/2.1/docs/LUX-DEMASQUE-LD002-01.md) ; [CI réelle 40652975646 — rapide/complet/captures verts](https://github.com/aym2020/LuxApp/actions/runs/40652975646) ; [32 captures après](https://github.com/aym2020/LuxApp/actions/runs/40652975646/artifacts/12800002783) comparées à LD-001. Résultats 360 px : document 775→740 px, fiche 208→162 px, CTA y655→524 ; aucun overflow X. **NE PAS COCHER** avant que le joueur accepte visuellement cet écran ; en cas de retouches, conserver LD-002.01 comme prochaine action.
- [ ] **LD-002.02 — Déposition / interrogatoire.** Scène, HUD, déclaration normale/précisée/démasquée et dock ; vérifier lisibilité LU, état des actions et personnage. **Statut : à faire — validation produit requise.**
- [ ] **LD-002.03 — Réseaux — Pix.** Publications, images, statuts consultés ; identité de réseau arcade, preuves intactes. **Statut : à faire — validation produit requise.**
- [ ] **LD-002.04 — Réseaux — Pro.** Profil professionnel, posts datés, lisibilité des preuves. **Statut : à faire — validation produit requise.**
- [ ] **LD-002.05 — Réseaux — Amis.** Profil ami/colocataire, posts et preuves ; hiérarchie proche des autres réseaux mais reconnaissable. **Statut : à faire — validation produit requise.**
- [ ] **LD-002.06 — Pièce à conviction.** Photo, source/date, transcription accessible, retour cohérent vers le même réseau. **Statut : à faire — validation produit requise.**
- [ ] **LD-002.07 — Carnet d’enquête.** Pièces, déclarations et précisions ; liste longue, compteur compréhensible. **Statut : à faire — validation produit requise.**
- [ ] **LD-002.08 — Objection — sélection.** Déclaration cible, preuves possibles, liste vide/pleine, aucun spoiler. **Statut : à faire — validation produit requise.**
- [ ] **LD-002.09 — Verdict — confrontation.** Réussite/échec, réaction 3D et CTA, lisibilité avec grandes polices. **Statut : à faire — validation produit requise.**
- [ ] **LD-002.10 — Pause.** Actions Reprendre/Conclure, hiérarchie des boutons et lisibilité. **Statut : à faire — validation produit requise.**
- [ ] **LD-002.11 — Confirmation de conclusion.** Avertissement de conclusion anticipée, priorité à Continuer. **Statut : à faire — validation produit requise.**
- [ ] **LD-002.12 — Bilan.** 0/3, 1/3 et 3/3, résumé compact, détails et actions Nouveau/Rejouer. **Statut : à faire — validation produit requise.**

- [ ] **LD-003 · P1 — Hiérarchie typographique rétro, contrôle final inter-écrans.** Chaque écran LD-002 adopte la typo nécessaire (pixel pour titres/tampons/compteurs ; police lisible pour LU/dates/preuves) ; ici contrôler la cohérence des 12 écrans à 320 px et grands caractères sans revalider inutilement un écran inchangé. **Validé si :** aucune troncature ni incohérence de hiérarchie.
- [ ] **LD-004 · P1 — Composants de jeu communs, contrôle final inter-écrans.** Réutiliser les boutons arcade, onglets, panneaux, fiches, en-têtes et badges mis au point pendant les 12 étapes de LD-002 ; vérifier leur homogénéité sans refaire des écrans déjà validés. **Validé si :** mêmes rôles/états donnent le même comportement sur tous les écrans.

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

- [x] **LD-034 · P0 — « Nouveau dossier » réellement nouveau.** **VALIDÉ côté produit le 28/10/2026** : correctif poussé sur `2.1`, 8 scénarios de sélection ciblés réussis en JS isolé, et recette **Samsung réelle confirmée par le joueur** (bilan Milo 0/3 → bouton « Nouveau dossier » → rencontre Noah, dossier n°002). Le passage en dossier suivant est indépendant du nombre de disquettes trouvées, selon la fonction corrigée. **Tests Playwright/Node globaux non exécutés dans cette session** (accès réseau au clone indisponible) : leur qualification est suivie séparément sous **LD-000**, sans imposer une nouvelle validation manuelle au joueur. Références : [`1734b52`](https://github.com/aym2020/LuxApp/commit/1734b52f792353b8e482438c4aa94f061507614e), [tests](https://github.com/aym2020/LuxApp/blob/2.1/tests/test_lux_demasque_acceptation.py), [guide](https://github.com/aym2020/LuxApp/blob/2.1/docs/LUX-DEMASQUE-TESTS.md).
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

| 2026-10-28 | LD-034 | **Recette manuelle Samsung : 0/3 → Noah confirmé par l'utilisateur et captures** ; validation globale toujours en attente | `1734b52` (`2.1`) | Capture du bilan Milo 0/3, puis capture de la rencontre Noah, dossier n°002 ; bouton « Nouveau dossier » fonctionne pour ce chemin réel. Pas de preuve visuelle du parcours 1/3, du rejeu, du retour Android, ni de résultats complets Playwright. Case `[ ]` conservée jusqu'aux critères restants. |

| 2026-10-28 | LD-034 | **VALIDÉ côté produit et case cochée** | `1734b52` (`2.1`) | Confirmation utilisateur Samsung (Milo 0/3 → Noah dossier 002) ; 8/8 scénarios ciblés JS simulés ; pas de suite Playwright exécutée. Les suites automatisées restent à qualifier sous LD-000 **sans nouvelle action demandée au joueur**. |

| 2026-10-28 | LD-000 | **VALIDÉ — CI dédiée verte** | `c4ca932` (workflow), `6397a824` (assertion audio), `946df5b` (doc), branche `2.1` | [Run 40648161245](https://github.com/aym2020/LuxApp/actions/runs/40648161245) : `rapide` **3/3 OK**, `complet` **9/9 OK** dont 6 Playwright Chromium et contrat LD-034. Première exécution rouge : arrondi 0,75 s vs 0,7 s dans test audio ; test fiabilisé sans modifier le son. Aucun test Samsung supplémentaire demandé ; la suite critique globale se valide séparément. |

| 2026-10-28 | LD-001 | **VALIDÉ — captures archivées et audit UX reproductible** | `4b4ad69` (script captures), `f0f9af6` (workflow), `a8a1068` (mesures + audit), `d1ed547` (index), branche `2.1` | [CI 40648859830](https://github.com/aym2020/LuxApp/actions/runs/40648859830) verte (rapide 3/3, complet 9/9, captures 32/32). [PNG + manifeste](https://github.com/aym2020/LuxApp/actions/runs/40648859830/artifacts/12799130743) : 360/393, 16 états chacun. Audit du code et comparaison visuelle des PNG/Samsung ; 0 overflow horizontal, 0 contrôle actif <44 px ; saturation verticale/DA détaillées dans [rapport LD-001](https://github.com/aym2020/LuxApp/blob/2.1/docs/LUX-DEMASQUE-AUDIT-UI-LD001.md). **Aucune modification gameplay/UI de production** ; corrections à venir par lots. |

| 2026-10-28 | LD-002.01–12 | **Plan de refonte par écran enregistré, 0/12 sous-étapes acceptées** | `f3d1d47` (procédure `2.1`) | Décision produit : une seule livraison d'écran à la fois ; captures avant/après + CI, puis validation explicite par le joueur. Prochaine action LD-002.01 Rencontre. Parent LD-002 et LD-003/004 ouverts, progression globale inchangée à 3/48. |

| 2026-10-28 | LD-002.01 | **Livré sur `2.1` — en attente de validation produit** | `7e56b92` (JS), `567709e` (CSS), `4305684` (test), `3540d00` (rapport) | [Run 40652975646](https://github.com/aym2020/LuxApp/actions/runs/40652975646) vert : rapide/complet + 32 captures. Rencontre 360×740 tient désormais dans 740 px (775 avant), CTA visible et contrôles mobiles passés. Montages avant/après présentés au joueur ; ne pas commencer LD-002.02 avant approbation. |

**Règle :** après validation d'un ID, cocher la case correspondante et écrire une ligne datée ici. Mettre à jour le compteur de l'en-tête et la `PROCHAINE ACTION`. Les entrées antérieures ne sont pas effacées.
