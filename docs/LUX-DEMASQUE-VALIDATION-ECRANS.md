# Lux Démasqué V1.1 — refonte arcade écran par écran et validation produit

**Branche du code et des rapports :** `2.1`. **Source de vérité des statuts :** [TODO canonique sur `main`](https://github.com/aym2020/LuxApp/blob/main/docs/LUX-DEMASQUE-TODO.md), section « LD-002 — validations écran par écran ».  
**Date :** 28 octobre 2026. **Décision produit :** travailler et faire valider **un écran à la fois**. Ne pas entreprendre la refonte graphique globale en un unique push. Après chaque écran, attendre la **validation explicite de l'utilisateur**, ou traiter ses retouches, avant de passer au suivant.

## Intention et périmètre

Direction artistique : **arcade old-school 16/32 bits, pixel art par touches, 3D low-poly PS1, humour et effets manga**. Garder la lisibilité moderne du LU, l'ergonomie Android, la navigation et toutes les mécaniques d'enquête. Ne pas transformer les panneaux en formulaires SaaS ni tout pixeliser. Conserver la sémantique des couleurs de LuxApp : or = action prioritaire, rouge = objection, rose/violet = identité du jeu. [Audit LD-001](LUX-DEMASQUE-AUDIT-UI-LD001.md), [Charte 2.1](CHARTE_UI_2.1.md), [Design System](DESIGN_SYSTEM.md) et [SPEC 110](specs/SPEC-110.md) sont les références.

Les tâches **LD-002 (palette)**, **LD-003 (typo rétro)** et **LD-004 (composants)** sont **coordonnées par écran** et non appliquées partout en parallèle. Chaque écran livré peut inclure couleurs, typographie, composants et mise en page ciblée indispensables pour obtenir un rendu cohérent. Les chantiers de gameplay, dictionnaire, contenu et animation non nécessaires à cet écran restent dans leurs tâches dédiées (LD-005 et suivantes). Si une modification ultérieure touche un écran déjà accepté, consigner la nouvelle recette visuelle.

## Déroulement obligatoire d'un écran

1. **Consulter GitHub** (TODO `main`, PLAYBOOK/SPEC/code `2.1`) ; sélectionner le premier sous-ID non validé, dans l'ordre fixé ci-dessous.
2. **Définir la composition et les changements précis pour ce seul écran** : zones visuelles, hiérarchie, taille de texte, composants, couleurs, états (normal/chargement/erreur/déjà consulté si applicables).
3. **Coder et pousser sur `2.1` en commit(s) ciblé(s)**. Des tokens transversaux peuvent être ajoutés sans changer les autres écrans ; toute modification accidentelle d'un écran déjà validé nécessite sa nouvelle comparaison et une approbation si visible.
4. **Exécuter les tests automatiques** : `bash tools/test-lux-demasque.sh rapide` puis `complet` via GitHub Actions (déjà disponibles). Analyser les régressions avant livraison. Pour les modifications plus larges, exécuter aussi la suite critique pertinente.
5. **Présenter à l'utilisateur, dans la conversation, le résultat et les captures avant/après**, idéalement **360 × 740 et 393 × 852**, ainsi que les états particuliers et les éventuelles limites du rendu Chromium vs Samsung. Donner le lien vers le commit, pas seulement une description.
6. **Bloquer la suite** jusqu'à une réponse explicite : `VALIDÉ` ou demande de changements. Une CI verte n'est jamais une validation de DA et un simple « ça marche » ne vaut pas approbation du design.
7. **Mettre à jour immédiatement la TODO canonique sur `main`** : sous-ID, statut, lien commit, capture, tests, décision utilisateur. Si validé, cocher le sous-ID et avancer à l'écran suivant ; si retouches, garder le même écran comme prochaine action.

**Cycle :** À faire → En cours → **En attente de validation produit** → Validé / Retouches demandées. Les sous-ID ne sont jamais cochés sans accord explicite ; à l'inverse, une fois approuvés, il ne faut pas redemander au joueur de répéter une validation déjà enregistrée.

## Les 12 écrans / étapes visuelles dans l'ordre

| ID | Écran / périmètre de l'itération | États à montrer à la validation | Règles de non-régression |
|---|---|---|---|
| LD-002.01 | **Rencontre** (fiche Milo / Noah, tampon, entrée) | fiche + bouton démarrer en bas | CTA visible, portrait, date, lien réseaux, pas de scroll piégeux |
| LD-002.02 | **Déposition / scène de dialogue** | normale, précisée, démasquée | personnage visible, dock mobile, boutons actifs/états, aucun débordement |
| LD-002.03 | **Réseau Pix** | flux et badges consultés | pièces conservées, lecture/dates |
| LD-002.04 | **Réseau Pro** | profil, publications et dates | preuve d'emploi datée conservée |
| LD-002.05 | **Réseau Amis** | amis, photos et badges | liens entre Milo, Sami, preuves cohérents |
| LD-002.06 | **Détail d'une pièce** | photo + transcription, déjà consultée | source/date, retour même onglet, pièce dans carnet |
| LD-002.07 | **Carnet** | pièces, déclarations, précisions, liste longue | accès rapide, pas de confusion sur compteur |
| LD-002.08 | **Sélection de preuve / Objection** | carnet vide puis rempli | cible visible, aucune révélation prématurée |
| LD-002.09 | **Verdict** | objection rejetée et réussie | réaction 3D, score, CTA visible, accessibilité |
| LD-002.10 | **Pause** | menu ouvert | Reprendre prioritaire, sortie délibérée |
| LD-002.11 | **Confirmation de conclusion** | abandon partiel | Continuer prioritaire, décision explicite |
| LD-002.12 | **Bilan final** | 0/3, 1/3 et 3/3, court et détail long | pas de spoil automatique, score exact, suite/rejeu |

**Une étape visuelle ≠ forcément une tâche métier terminée.** Une amélioration de dialogue faisant partie de LD-017 pourra être terminée plus tard sans annuler l'approbation de la palette. Les autres tâches restent distinctes, mais on évite autant que possible de faire revalider plusieurs fois le même écran pour des changements purement décoratifs.

## Critères d'acceptation techniques communs

- Android : viewport court et `safe-area-inset-bottom`, absence de scroll horizontal à 320/360/393/430 px, zones tactiles ≥ 44 px ; grands textes et Retour Android sans blocage.
- Palette : contraste et symboles non basés exclusivement sur la couleur, CTA principal or sans surabondance.
- Pixel art : réservée aux titres, séparateurs, tampons, badges et effets ; **texte luxembourgeois, dates et preuve restent nets**.
- Les transitions et animations doivent respecter `prefers-reduced-motion`, rester rapides et sans sous-animations involontaires.
- Le moteur et les données d'enquête demeurent inchangés sauf anomalie identifiée et testée.
- Captures de référence reproductibles : [`tests/capture_lux_demasque_ld001.py`](../tests/capture_lux_demasque_ld001.py) ; [32 captures baseline GitHub Actions](https://github.com/aym2020/LuxApp/actions/runs/40648859830/artifacts/12799130743). Elles servent d'avant pour chaque itération. Ne pas confondre captures navigateur et validation graphique Samsung.

## Statut initial

Au moment de cette décision, **aucun des 12 écrans n'a encore été refondu ou validé** dans le cadre de LD-002. **La prochaine action est LD-002.01 — Rencontre.** Les sous-étapes sont suivies **dans la TODO canonique sur `main`** ; ce document décrit le processus, pas un second registre de cases à cocher.
