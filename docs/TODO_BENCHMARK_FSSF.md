# TODO compacte — Captures de référence pour LuxApp

**Dernière mise à jour :** 23/10/2026 · **Branche :** `2.1` · **Document d'analyse :** [Benchmark UX (85 captures distinctes)](benchmark_onboarding_application_fr_2026-10-23.md).

**Objet :** choisir uniquement les écrans qui apportent encore des informations sur la pédagogie, la navigation, les états de jeu et la rétention. **Ne pas confondre avec [TODO.md](../TODO.md)**, backlog de développement LuxApp. Cette liste suit la rétro-ingénierie du produit observé, sans commander de changement de code.

## Couvert

- [x] Onboarding : progression, choix du profil et des priorités, essai Premium.
- [x] Accueil, profil, navigation principale, classement, badges et première présentation du mode classé.
- [x] Catalogue de règles, explication détaillée, conjugaison, bibliothèque, écriture (écrans d'entrée).
- [x] Partie rapide : sélection de **5 règles**, **15 questions** à formats variés, réponses bonnes/fausses, détails, bilan **13/15**, série quotidienne.
- [x] Signalement : formulaire, seuil de saisie et confirmation d'envoi. **Traitement réel d'un signalement non observé.**

## À voir ensuite — par priorité

- [ ] **P0 · Révision après une erreur — PROCHAIN.** Depuis une règle marquée « erreur récente » (par exemple « On/ont »), montrer son ouverture, le lancement d'une **partie de révision**, un exercice, sa correction puis le bilan. **Intérêt :** établir le fonctionnement réel de la boucle erreur → notion → réentraînement → progression.
- [ ] **P0 · Parcours guidé d'une règle.** Ouvrir « Parcours guidés », suivre une règle complète : présentation, éventuel test, validation, état suivant. **Intérêt :** modèle de leçon progressive, critères de maîtrise et déverrouillage.
- [ ] **P0 · Dictée ou écriture avec correction.** Écran avant saisie, clavier Android, soumission, feedback et sauvegarde/révision. **Intérêt :** ergonomie réelle, contenu produit par l'apprenant, qualité et traçabilité de la correction.
- [ ] **P1 · Partie classée complète.** Après le lobby déjà observé : début d'une manche, interaction en direct, fin de manche, classement et récompense. **Intérêt :** compétition, timing, attribution de points et engagement social.
- [ ] **P1 · Premium au point de blocage réel.** Ouvrir une option verrouillée, examiner ce qui est gratuit, l'écran de vente, les choix de sortie. **Intérêt :** frontière fonctionnelle et friction de monétisation, sans recopier ses incitations.
- [ ] **P2 · États limites de la Partie rapide.** Sélection de **1 à 4 règles**, « Choisis le bon » **avant réponse**, multi-homophones **incorrects/partiellement corrects**, bilan d'une règle **« À revoir »**, sortie/reprise. **Intérêt :** règles métiers encore incertaines, états UI.
- [ ] **P2 · Notifications et rétention.** Refuser puis accepter les notifications si pertinent, observer la série du lendemain et un éventuel retour sur une notion déjà signalée. **Intérêt :** effets réellement vérifiables, sans surinterpréter les promesses affichées.

## Protocole de mise à jour

À **chaque nouveau lot de captures fourni dans cette conversation** :

1. Vérifier le benchmark et son compteur ; **ne pas recomptabiliser les doublons**.
2. Ajouter les états **vus**, leurs détails UI/UX et les inconnues dans le benchmark sur **`2.1`**.
3. **Cocher ou préciser** les tâches traitées ici ; actualiser la date, le compteur et **une seule priorité « PROCHAIN »**.
4. Préserver la distinction **observé / inféré / non vérifié**, et le code actuel de LuxApp.

**Prochain envoi recommandé :** une séquence continue de la rubrique **Révision après une erreur**, depuis son entrée jusqu'au résultat. **Pas besoin de refaire les 85 captures précédentes.**
