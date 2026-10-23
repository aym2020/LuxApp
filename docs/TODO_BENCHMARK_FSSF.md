# TODO compacte — Captures de référence pour LuxApp

**Dernière mise à jour :** 23/10/2026 · **Branche :** `2.1` · **Document d'analyse :** [Benchmark UX (103 captures distinctes)](benchmark_onboarding_application_fr_2026-10-23.md).

**Objet :** choisir uniquement les écrans qui apportent encore des informations sur la pédagogie, la navigation, les états de jeu et la rétention. **Ne pas confondre avec [TODO.md](../TODO.md)**, backlog de développement LuxApp. Cette liste suit la rétro-ingénierie du produit observé, sans commander de changement de code.

## Couvert

- [x] Onboarding : progression, choix du profil et des priorités, essai Premium.
- [x] Accueil, profil, navigation principale, classement, badges et première présentation du mode classé.
- [x] Catalogue de règles, explications détaillées, conjugaison, bibliothèque, écriture (écrans d'entrée). **Nouveau :** fiche « Quelle/qu'elle », astuce, quiz 8 questions, états succès/erreur et décompte de notions par catégorie.
- [x] Partie rapide : sélection de **5 règles**, **15 questions** à formats variés, réponses bonnes/fausses, détails, bilan **13/15**, série quotidienne.
- [x] Signalement : formulaire, seuil de saisie et confirmation d'envoi. **Traitement réel d'un signalement non observé.**
- [x] **Économie et conversion** : fiches « Macarons » / « Diamants » depuis l'accueil (gains affichés, quota annoncé, CTA Premium), paywall étendu, bonus Shaky, FAQ en accordéon, avertissement de facturation et liens légaux. **Paiement réel non observé**.
- [x] **Bibliothèque des parcours et entrée en écriture** : onglets Standards/Personnalisés, cartes niveaux/accès, état vide et bouton créer ; sujet de rédaction avec introduction illustrée et CTA « Commencer ». **Création, saisie et correction non observées**.
- [x] Règle individuelle « Quelle/qu'elle » : théorie, astuce, quiz de 8 questions et **bilan « Bravo ! 7/8, +5 macarons, règle maîtrisée »**. **Statut après « Terminer » non observé.**

## À voir ensuite — par priorité

- [ ] **P0 · Retour après « Terminer » — PROCHAIN.** Le bilan du quiz est maintenant observé (**7/8, +5 macarons, annonce de maîtrise**). Montrer le **retour au catalogue**, statut de la règle et compteur **« Confusions fréquentes »**. **Intérêt :** vérifier si la réussite devient vraiment une notion validée. L'item 8/8 lui-même n'est pas documenté.
- [ ] **P0 · Révision après une erreur — PARTIEL.** La fiche « Quelle/qu'elle » consultée est marquée **« Non vue »**, et le défi d'accueil indique une révision accomplie, mais on n'a **pas** encore suivi une partie ouverte depuis **« Erreur récente »** jusqu'au résultat. À capturer ensuite.
- [ ] **P0 · Parcours guidé d'une règle — PARTIEL.** Liste **Standards** (niveaux Facile/Intermédiaire, carte gratuite et verrouillages) et onglet **Personnalisés** (bouton créer) observés. Suivre **le premier parcours gratuit** jusqu'à la validation, et **ouvrir « Créer un parcours personnalisé »**. **Intérêt :** séquencement, sélection de règles, critères de maîtrise et persistance.
- [ ] **P0 · Dictée ou écriture avec correction — PARTIEL.** Écran d'introduction d'un **sujet d'écriture libre** vu (visuel immersif, questions d'amorce, CTA fixe). Montrer **après « Commencer »** : champ de saisie, clavier Android, soumission, feedback et sauvegarde. **Intérêt :** correction et ergonomie réelle.
- [ ] **P1 · Partie classée complète.** Après le lobby déjà observé : début d'une manche, interaction en direct, fin de manche, classement et récompense. **Intérêt :** compétition, timing, attribution de points et engagement social.
- [ ] **P1 · Premium au point de blocage réel — PARTIEL.** Quota de diamants, incitation Premium, tarif annuel **44,99 €**, essai de 7 jours, bonus, FAQ et mention de reconduction observés. Il manque le **clic sur une carte verrouillée**, les autres offres et la sortie sans payer. **Intérêt :** frontière du gratuit et qualité des consentements.
- [ ] **P2 · États limites de la Partie rapide.** Sélection de **1 à 4 règles**, « Choisis le bon » **avant réponse**, multi-homophones **incorrects/partiellement corrects**, bilan d'une règle **« À revoir »**, sortie/reprise. **Intérêt :** règles métiers encore incertaines, états UI.
- [ ] **P2 · Notifications et rétention.** Refuser puis accepter les notifications si pertinent, observer la série du lendemain et un éventuel retour sur une notion déjà signalée. **Intérêt :** effets réellement vérifiables, sans surinterpréter les promesses affichées.

## Protocole de mise à jour

À **chaque nouveau lot de captures fourni dans cette conversation** :

1. Vérifier le benchmark et son compteur ; **ne pas recomptabiliser les doublons**.
2. Ajouter les états **vus**, leurs détails UI/UX et les inconnues dans le benchmark sur **`2.1`**.
3. **Cocher ou préciser** les tâches traitées ici ; actualiser la date, le compteur et **une seule priorité « PROCHAIN »**.
4. Préserver la distinction **observé / inféré / non vérifié**, et le code actuel de LuxApp.

**Prochain envoi recommandé :** revenir au catalogue après **« Terminer »** et montrer le **statut de « Quelle/qu'elle »** ainsi que le **compteur de catégorie**. Ensuite, ouvrir **« Créer un parcours personnalisé »**, puis montrer le **champ de saisie d'écriture** après « Commencer ». **Pas besoin de refaire les 103 captures précédentes.**
