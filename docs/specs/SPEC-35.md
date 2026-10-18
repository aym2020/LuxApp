# SPEC 35 — Missions : bouton « Continuer » cohérent, ascenseur sombre et retours compréhensibles

| Champ | Valeur |
|---|---|
| Statut | **Implémentée — validation à confirmer** |
| Priorité | **P1** |
| Branche cible | `v2` |
| Périmètre | `public/mission.js`, `public/style.css` ; `public/ui.js` ou tests uniquement si nécessaire |
| Référence | Captures PC de la mission « Premier cours de luxembourgeois » et capture Android du « Mot caché » du 18/10/2026 |
| Contraintes | Pas de changement de la règle des trois vies ni des scores ; conserver l'accessibilité clavier et mobile |

## Constat

1. **Mission sur PC :** après une réponse, le bouton vert « Continuer → » reçoit un contour jaune. Dans `public/mission.js`, `retourMission()` appelle systématiquement `document.getElementById('ms-continuer').focus({ preventScroll: true })`. Le CSS global `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` rend alors le focus visible selon la navigation et les heuristiques du navigateur.
2. **Mot caché sur téléphone :** le même bouton d'action « Continuer » apparaît vert **sans** contour jaune. L'écart visuel ressemble à une différence de statut alors qu'il ne reflète pas une réussite différente.
3. **Conversation sur PC :** l'ascenseur vertical de `#view-mission .ms-body` est un large ascenseur clair natif du navigateur, non harmonisé avec le thème sombre.
4. **Retour pédagogique :** après une bonne réponse obtenue à un essai ultérieur, le texte « Elle ne compte pas comme réponse autonome » emploie un jargon que l'utilisateur ne comprend pas et suggère à tort une pénalité supplémentaire. Depuis la SPEC 32, le taux de réponses autonomes est seulement informatif ; la réussite dépend des vies restantes.

## 1. Bouton « Continuer » : même présentation selon le contexte

- Tous les boutons d'action « Continuer » de type succès gardent le **même aspect de base** que dans « Mot caché » : fond vert, texte lisible, dimensions et arrondis du design system ; pas de contour jaune décoratif permanent.
- Un **véritable focus de navigation au clavier** (Tab, Shift+Tab et parcours clavier) doit rester **visiblement signalé** et accessible, même si ce signal est jaune. **Ne pas supprimer globalement `:focus-visible` ni retirer `outline` sans alternative équivalente**.
- Ne pas afficher inutilement le contour jaune après une interaction souris ou tactile simplement parce que le bouton a reçu un focus **programmatique**.
- Préserver le flux PC : l'utilisateur qui **saisit et valide avec Entrée** doit pouvoir continuer avec **Entrée** sans devoir prendre la souris ni tabuler laborieusement. Si le focus est transféré volontairement au bouton suite à une soumission clavier, un anneau de focus visible est **normal et souhaité**.
- Si la réponse est validée au clic/toucher, gérer le focus en conséquence. S'appuyer sur la modalité de la dernière interaction **de façon fiable** (éventuellement une petite logique locale), sans casser la navigation des lecteurs d'écran. Ne pas masquer le focus clavier pour obtenir artificiellement la même capture dans tous les cas.
- Pas de modification générale des styles de bouton dans l'application si un ajustement ciblé à la mission suffit.
- Éviter les dépendances à une pseudo-classe ou option `focus()` non prise en charge sans repli.

**Important :** les captures de deux appareils n'impliquent pas que les styles sont incohérents en eux-mêmes ; l'écart peut venir du **mode de focus**. On cherche donc une **règle de comportement cohérente**, pas à cacher tous les indicateurs.

## 2. Barre de défilement de la mission

- Sur **ordinateur**, styliser uniquement la zone de conversation `#view-mission .ms-body` avec un ascenseur **fin (environ 5–6 px)** et un curseur gris discret mais discernable, adapté au thème sombre.
- Éviter le rail blanc contrastant de la capture. Ne pas modifier la scrollbar de toute l'application.
- Prévoir un rendu acceptable dans les moteurs principaux : `scrollbar-color` / `scrollbar-width: thin` pour Firefox et `::-webkit-scrollbar` pour Chrome/Edge/Brave si nécessaire. Les navigateurs utilisant des ascenseurs natifs superposés peuvent ignorer certains styles : conserver le comportement natif.
- **Ne pas masquer totalement l'ascenseur sur PC** : le défilement doit rester identifiable et manipulable à la souris.
- Sur téléphone, laisser le défilement tactile fluide et ne pas forcer un rail permanent. Les messages, boutons et marges ne doivent pas être rognés.

## 3. Texte compréhensible après une bonne réponse tardive

Remplacer dans `retourMission()` :

```text
✓ Juste, au 4e essai
Elle ne compte pas comme réponse autonome.
```

par un retour plus naturel et factuel, par exemple :

```text
✓ Bonne réponse, au 4e essai !
Tu as trouvé après plusieurs essais.
```

- Le message indique **que la réponse est désormais correcte** ; il ne met pas en avant le concept technique de « réponse autonome » et n'invente pas une deuxième sanction.
- **Ne pas afficher « aucune pénalité »** si une vie a réellement été perdue sur cette réplique. La vie perdue est déjà signalée par les cœurs ; ne pas en retirer une supplémentaire.
- En cas de **simple coquille corrigée**, conserver une formulation spécifique du type « Petite faute de frappe corrigée : aucune vie perdue ».
- En cas de réponse révélée, conserver un message indiquant qu'elle a été montrée.
- Dans le **bilan** qui présente le score informatif, remplacer si nécessaire « réponses autonomes » par une formulation claire et exacte, par exemple **« Réponses trouvées sans erreur : X/10 »**, assortie d'une explication accessible indiquant que les coquilles corrigées et éligibles sont acceptées. Ce score ne détermine pas la réussite (SPEC 32).
- Ne pas modifier la logique des résultats `ok`, `coquille`, `essais`, `revele`, les compteurs de vies, le meilleur score sauvegardé ou le déclenchement de la validation de leçon.

## 4. Critères d'acceptation

- [x] PC + souris : après soumission au clic, « Continuer » apparaît vert, **sans contour jaune non sollicité**, et reste immédiatement cliquable.
- [x] PC + clavier : Tab atteint « Continuer », avec **focus visible** ; Entrée continue. En soumettant au clavier avec Entrée, l'utilisateur peut aussi continuer avec Entrée sans étape cachée.
- [ ] Android : « Continuer » vert sans anneau artificiel après toucher ; navigation tactile et boutons conservés.
- [ ] Dans la mission et le « Mot caché », un succès se présente avec des couleurs et styles de bouton cohérents, hors focus légitime.
- [ ] Sur Chrome/Edge/Brave PC, la scrollbar de la conversation ne présente plus un large rail blanc ; défilement par molette, glissement et clavier fonctionnel.
- [ ] Firefox et navigateur mobile : comportement acceptable, pas de défilement bloqué ou de débordement.
- [x] Bonne réponse au 2e/4e essai : message court, compréhensible, sans jargon technique ni fausse promesse de vie intacte.
- [x] Coquille corrigée, vraie erreur, réponse révélée, zéro vie et bilan final : messages exacts et **score/validation identiques avant et après**.
- [x] Tests ciblés utiles + non-régression des événements de clavier de la mission ; pas d'itérations visuelles pixel par pixel au-delà d'une recette suffisante.

## Hors périmètre

Refonte de la mission, refonte des boutons globaux, changement des seuils ou des vies, réécriture des dialogues, modification des données de leçons et attribution de récompenses.

## Suivi

**Implémentée sur `v2`**, recette Android et Firefox / Chrome PC à faire (critères correspondants non cochés).

- `public/ui.js` : `derniereActionClavier` (keydown → vrai, pointerdown → faux) et `focusApresClavier(bouton)`. `:focus-visible` n'est pas touché.
- `public/mission.js` (`retourMission`) et `public/parcours.js` (exercices, « Mot caché » compris) : le bouton « Continuer » ne reçoit le focus qu'après une validation au clavier — alors l'anneau est visible et Entrée continue ; après un clic ou un toucher, pas de focus programmatique, donc pas d'anneau.
- Retours : « Bonne réponse, au Ne essai ! » + « Tu as trouvé après une erreur. » / « … après plusieurs essais. » ; coquille : « Petite faute de frappe corrigée : aucune vie perdue. » ; réponse montrée : « La réponse t'a été montrée. » ; bilan : « Réponses trouvées sans erreur : X / 10 (fautes de frappe corrigées comprises) · N vies restantes ». Résultats, vies, scores et validation inchangés.
- `public/style.css` : ascenseur de `#view-mission .ms-body` seulement — `scrollbar-width: thin`, `scrollbar-color` gris sombre, `::-webkit-scrollbar` 6 px (Chrome/Edge/Brave anciens) ; jamais masqué.
- Tests : `tests/test_mission_vies.py` (clic → pas de focus ; Entrée → focus visible, Entrée continue ; textes ; bilan ; ascenseur fin) ; suite critique verte.

Références : [SPEC 24 — Coquilles](./SPEC-24.md), [SPEC 32 — Victoire par vies](./SPEC-32.md), [SPEC 34 — Missions à 10 répliques](./SPEC-34.md).
