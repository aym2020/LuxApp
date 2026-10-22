# TODO — LuxApp 2.1 (UI/UX mobile, pédagogie, game design)

**Audit :** 22 octobre 2026 · **Branche :** `2.1` · **Code audité :** `e0d8b88` · **37 tâches : 9 P0 / 14 P1 / 9 P2 / 5 P3.**

**Responsables :** **Dev** = agent chargé du code et des tests (ChatGPT/Claude) ; **Produit** = propriétaire de LuxApp, décisions produit et recette sur Samsung ; **Pédago** = Clayton / référent habilité à valider les contenus luxembourgeois. **Val.** = validateur distinct. Les cases sont **non cochées jusqu'à preuve de validation**, pas nécessairement du code absent. Les travaux P2/P3 ne doivent pas interrompre un P0.

> **Ordre d'exécution :** exercices et sauvegardes fiables → ergonomie mobile → confort pédagogique → Survie avancée → évolutions. Règles : [AGENTS](AGENTS.md) · [Charte UI 2.1](docs/CHARTE_UI_2.1.md) · [Post-mortem des exercices](docs/POSTMORTEM-EXERCICES-2.1-2026-10-21.md). Les contenus JSON ne sont pas à modifier sans approbation.

## P0 — Bloquants : fiabiliser et valider

- [ ] **01 · Corriger l'incident des exercices.** **Dev** ; val. **Produit**. Vérifier Mot caché → Quiz → Trous → Écriture, 1er/2e essai, indices, révélation, scores et correction. **Fini si :** feedback unique sans contradiction ni balise brute, vrai/faux correctement distingués et captures navigateur + Samsung validées.
- [ ] **02 · Stabiliser le clavier mobile.** **Dev** ; val. **Produit**. Vérifier énoncé, saisie, Valider/Suivante après erreur, clavier ouvert/fermé, tailles 320–430 px et polices 130/200 %. **Fini si :** aucun bouton caché, saut de scroll ou question inaccessible. [SPEC 87](docs/specs/SPEC-87.md).
- [ ] **03 · Garantir navigation et reprise.** **Dev**. Retour Android, sortie de mission/exercice, fermeture du Cours, restauration onglet/écran, retour au chemin. **Fini si :** aucune perte de réponse, état ou destination inattendue.
- [ ] **04 · Fiabiliser progression et cloud.** **Dev** ; val. **Produit**. Invité → compte, déconnexion, reconnexion, coupure réseau et deux appareils. **Fini si :** profils isolés, sauvegarde locale intacte, fusion Firebase sans écrasement.
- [ ] **05 · Supprimer le micro-scroll inutile en fin de Survie.** **Dev**. Échec connu Chromium : **390 × 844**, contenu **676 px** / zone **667 px** (9 px). **Fini si :** test [sortie-mobile](https://github.com/aym2020/LuxApp/actions/runs/39839338583) vert aux quatre tailles, pied fixe, fallback défilant sur petits écrans.
- [ ] **06 · Réauditer les barèmes et les états pédagogiques.** **Dev**. Exactitude 1er/2e essai, indices, étoiles, rattrapages, séries, examens, erreurs, révisions et sauvegardes. **Fini si :** les résultats attendus restent identiques avant/après la refonte.
- [ ] **07 · Étendre la CI aux tests DOM et navigateur critiques.** **Dev**. Compléter les tests Node par les scénarios réels, exécuter `bash tools/critique.sh rapide` puis `bash tools/critique.sh` pour les refontes. **Fini si :** échec navigateur bloquant détecté avant validation ; CI verte seule ≠ UI validée.
- [ ] **08 · Faire la recette complète sur Samsung.** **Produit** ; corrections **Dev**. Invité/compte, leçon vierge/en cours, mission, entraînement, examens, Survie, clavier, Retour et gros texte. **Fini si :** captures et anomalies tracées, tous P0 clos ou signalés bloquants.
- [ ] **09 · Corriger les ambiguïtés linguistiques bloquantes.** **Pédago** ; aide **Dev**. Traductions, articles, graphies, accents, variantes et cohérence cours/exercice sur cas signalés. **Fini si :** réponses naturelles/prévisibles approuvées avant modification JSON.

## P1 — Qualité d'apprentissage et UX

- [ ] **10 · Simplifier le premier lancement.** **Dev** ; arbitrage **Produit**. Bienvenue → niveau → première leçon → première réussite. **Fini si :** chemin court et prochaine action évidente, statut invité compréhensible.
- [ ] **11 · Uniformiser le « prochain pas ».** **Dev**. Accueil, chemin, fiche leçon, résultats : Commencer/Reprendre/Refaire/Réviser suivant le vrai statut. **Fini si :** une seule action principale correcte, pas de doublon.
- [ ] **12 · Harmoniser les quatre exercices.** **Dev**. Consigne dominante, choix lisibles, correction, navigation et CTA cohérents sans modifier le moteur. **Fini si :** affichage stable 320–430 px, clavier inclus.
- [ ] **13 · Valider Cours, intros et scénario.** **Produit** ; corrections **Dev**. Onglets Règles/Lexique/Phrases, filtres unités, tableaux, sons, intro d'unité et mission. **Fini si :** scroll/retour et états saisis conservés, aucune coupe mobile.
- [ ] **14 · Supprimer les frictions inutiles.** **Dev** ; arbitrage **Produit**. Contrôler répétitions de cartes, confirmations et étapes ; conserver les étapes pédagogiques utiles. **Fini si :** moins d'actions sans disparition d'informations.
- [ ] **15 · Clarifier les bilans et résultats.** **Dev**. Réussite, erreurs, progression réelle, rappel et prochaine action. **Fini si :** score séparé de la maîtrise, révision proposée lorsqu'utile.
- [ ] **16 · Distinguer S'entraîner, Réviser et Erreurs.** **Dev**. Libellés, filtres, répétition espacée, états vides et corrections ciblées. **Fini si :** trois intentions identifiables, sans confusion.
- [ ] **17 · Créer un réglage global des sons d'interface.** **Dev**. Mutualiser les notes/effets de Survie et Mot caché ; séparer explicitement les prononciations LOD, préserver `luxSurvieSon`. **Fini si :** préférence stable par profil, « Écouter » indépendant.
- [ ] **18 · Tester l'accessibilité.** **Dev**. Touches ≥ 44 px, contraste, focus, lecteur d'écran, messages non codés seulement par couleur, reduced-motion, texte 130/200 %. **Fini si :** tous les parcours critiques accessibles.
- [ ] **19 · Traiter tous les états techniques.** **Dev**. Chargement, échec API, absence de leçons, réseau perdu, synchro en attente, erreurs serveur. **Fini si :** explication et réessai explicites, aucune progression effacée.
- [ ] **20 · Mesurer la performance Android.** **Dev**. Démarrage, CSS/JS, polices, déplacements de contenu, Canvas, latence au toucher, mémoire. **Fini si :** mesures avant/après et correctifs seulement fondés sur preuves.
- [ ] **21 · Implémenter le hors-ligne par lots.** **Dev** ; val. **Produit**. Shell, cache de leçons, démarrage après fermeture en mode avion, sauvegarde et resynchronisation. **Fini si :** critères de [SPEC 93](docs/specs/SPEC-93.md) vérifiés sans perte de profil.
- [ ] **22 · Augmenter la couverture audio utile.** **Pédago** ; outillage **Dev**. Actualiser [l'audit LOD](docs/audit-audio-lod.md) (40,1 % au dernier audit), prioriser mots fréquents et phrases A1 ; contrôler chaque correspondance. **Fini si :** associations justes, pas de MP3 erroné ; Mia si approprié et validé.
- [ ] **23 · Auditer le parcours A1.1/A1.2.** **Pédago**. Toutes les leçons présentes : prérequis, densité, difficulté, cohérence cours → exercices → mission et traductions. **Fini si :** liste de corrections pédagogiques validées, sans JSON modifié arbitrairement.

## P2 — Gamification et motivation (uniquement après P0)

- [ ] **24 · Valider Survie V1 sur Samsung.** **Produit**. Répéter des parties : tuiles, chrono, son, longs mots, fatigue visuelle, fluidité. **Fini si :** aucun irritant bloquant.
- [ ] **25 · Fiabiliser la réserve de Survie.** **Dev** ; val. **Pédago**. « Mes mots » réellement rencontrés, graphies univoques, exclusions appropriées et répétitions maîtrisées. **Fini si :** aucun mot inédit présenté comme pratiqué. [SPEC 89](docs/specs/SPEC-89.md).
- [ ] **26 · Calibrer la difficulté de Survie.** **Dev** ; arbitrage **Produit**. Longueur, temps +/−, durée, erreurs, fréquence des mots ; combiner simulation et parties humaines. **Fini si :** réglages justifiés par données et essai réel.
- [ ] **27 · SPEC 92 étape 2 : score et bilan.** **Dev**. Points, multiplicateur, record, mots ratés révisables ; conserver `luxSurvieBest` en lecture. **Fini si :** calculs exacts et bilan lisible sur Samsung. [SPEC 92](docs/specs/SPEC-92.md).
- [ ] **28 · SPEC 92 étape 3 : surchauffe et passifs.** **Dev** ; arbitrage **Produit**. Buffs automatiques, effets perceptibles, choix clair hors phase de frappe. **Fini si :** équilibrage et recette mobile validés.
- [ ] **29 · SPEC 92 étape 4 : Tempête.** **Dev**. Phases, annonces, mots d'élite et escalade. **Fini si :** chrono/lettres toujours visibles et performance stable.
- [ ] **30 · Prototyper une boucle quotidienne courte.** **Produit** ; réalisation **Dev**. Session 3–5 min → réussite gratifiante → action suivante → retour volontaire. **Fini si :** parcours testé, aucune mécanique de pression inutile.
- [ ] **31 · Relier Survie à la révision.** **Dev**. Depuis le bilan, proposer les mots ratés quand disponibles. **Fini si :** révision utile sans attribuer d'étoiles ni de maîtrise pour un score arcade.
- [ ] **32 · Améliorer la valeur des examens.** **Pédago** ; réalisation **Dev**. Représentativité A1.1/A1.2, barèmes, explications, erreurs et entraînement ciblé. **Fini si :** retour pédagogique exploitable et fiable.

## P3 — Évolutions après stabilisation

- [ ] **33 · Télécharger les audios hors ligne par leçon.** **Dev**. Téléchargement facultatif, taille/quota, reprise, nettoyage ciblé. **Fini si :** lecture en mode avion et aucun score/progrès effacé. [SPEC 93](docs/specs/SPEC-93.md).
- [ ] **34 · Arbitrer Survie « Mes mots / Arène ».** **Produit** ; étude **Dev**. Pools, règles, records distincts et intérêt réel de la compétition. **Fini si :** cadrage validé avant développement. [SPEC 89](docs/specs/SPEC-89.md).
- [ ] **35 · Étudier un classement facultatif.** **Produit** ; étude **Dev**. Confidentialité, anonymat, lutte contre triche, intérêt pédagogique. **Fini si :** décision explicite, aucune donnée personnelle publiée par défaut.
- [ ] **36 · Cadrer une éventuelle offre Sproochentest.** **Produit**. Bénéfices, programme, progression et modèle économique. **Fini si :** valeur pédagogique définie, A1 gratuit intact.
- [ ] **37 · Nettoyer documentation et publication.** **Dev**. Registre des specs, statuts contradictoires, décisions abandonnées, procédure release/rollback. **Fini si :** références cohérentes et traçables.

---

## Mode opératoire

1. **Premier lot : 01 → 02 → 04 → 05 → 07 ; validation 08**. Les tâches 03/06/09 restent P0 et sont à traiter selon les incidents observés. Aucun ajout « spectaculaire » avant la stabilisation.
2. Pour cocher une tâche, conserver un **commit ou rapport d'essai** et, lorsque nécessaire, **captures Chromium/Samsung**. Contrôle linguistique séparé du contrôle visuel.
3. Les tests **Node**, **DOM/Chromium**, **Samsung** et la **validation pédagogique** sont des niveaux distincts : une CI verte ne valide pas seule l'UI.
4. **Deux incidents confirmés à la date de l'audit :** exercices 2.1 non validés après régressions du 21/10 ; test mobile de Survie échoué de 9 px. Les autres items regroupent contrôles préventifs ou améliorations envisagées, **pas des bugs tous reproduits**.
