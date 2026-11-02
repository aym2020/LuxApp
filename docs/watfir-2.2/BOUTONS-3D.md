# Watfir 2.2 — système de boutons 3D

**Statut : référence de design et d'interaction active pour l'accueil, 03/11/2026.** À appliquer aux autres écrans **uniquement après audit de leurs composants et validation de leur DA**. Le fichier ne remplace ni les règles pédagogiques, ni `public/components.css`, ni les mécaniques des jeux.

## 1. Principe commun

Un bouton 3D de Watfir possède **une face, une tranche plus sombre, une ombre portée et un reflet léger**. La tranche est dessinée par `box-shadow`, sans div supplémentaire, sans `height` ajouté et sans modifier la grille. Au toucher ou au clic souris, la face **descend** tandis que la tranche se comprime à **1 px**. Le retour se fait en douceur. Pas de `scale(.97)` pour ce type de bouton, pas de contour rouge animé, de glow, de rebond ou de néon.

- **Au repos** : relief visible sur mobile et PC.
- **Au survol PC** : simple éclaircissement de la couleur de face ; pas de déplacement, ni de nouvelle ombre. Le CTA crème change seulement `--wf-cta-cream`, ce qui préserve ses bandes rouge/cyan ; Étudier/Jouer changent uniquement `background-color`. Les niveaux changent discrètement leur fond et leur repère de contour, sans toucher à la tranche.
- **Pendant l'appui** : règle `:active` immédiatement visible sous le doigt ; pour les boutons qui changent de vue ou ouvrent une feuille, la classe `.wf-pressing` conserve le même rendu pendant **160 ms avant l'action** afin qu'un tap bref ne masque pas l'enfoncement.
- **Au clavier** : activation par Entrée/Espace d'un vrai `button`, même feedback. Le `:focus-visible` reste indépendant du hover et visible.
- **Mouvement réduit** : `prefers-reduced-motion: reduce` supprime le déplacement, les transitions et l'attente ; la navigation reste immédiate. Les clics programmatiques restent immédiats. Rien n'est différé pour `disabled` ou `aria-disabled="true"`.

**Attention :** la classe `.wf-pressing` n'est pas une API de navigation globale. L'écouteur de l'accueil gère un ensemble précis de sélecteurs et laisse passer les `click()` synthétiques (`isTrusted === false`) pour éviter les récursions. Les jeux, réponses notées et écrans à chronomètre ne doivent jamais hériter automatiquement de ce délai.

## 2. Variantes réellement implémentées

| Rôle | Face / texte | Tranche 3D | Appui | Hover PC |
| --- | --- | --- | --- | --- |
| **Commencer / Continuer** | Crème `#fbebc5` / noir `#080808` | 7 px, beige `#aa8954` | Translation 6 px | Crème `#fff4da`, sans changer le motif |
| **Étudier** | Rouge `#d3232b` / crème `#f7e9c2` | 5 px, rouge foncé `#861c18` | Translation 4 px | Rouge `#ed3640` |
| **Jouer** | Bleu `#087496` / crème `#f7e9c2` | 5 px, bleu sombre `#054860` | Translation 4 px | Bleu `#0b8fb5` |
| **Pastille active de niveau** | Rouge de marque `#f22421` / crème | `--wf-pill-depth` = 2–4 px, `#991a17` | `depth - 1px` | Rouge `#ff4038`, contour discret |
| **Pastille inactive / chevron** | Fond noir / crème et filet crème | `--wf-pill-depth` = 2–4 px, `#75644c` | `depth - 1px` | Lavis crème 20 %, contour discret |

**Important : les bandes du coin de Commencer ne sont PAS les surfaces des boutons Étudier/Jouer.** Elles restent `--wf-red:#f22421` et `--wf-cyan:#02c5e7`, aux stops `51.6 * --k` et `31.8 * --k`. Aucun éclaircissement hover ne doit changer leur largeur, leur couleur ni le chevron noir.

Les pictogrammes Étudier/Jouer sont des SVG au trait crème ; le CTA principal n'a plus de pictogramme livre. La décoration des pastilles est assurée par `::before` (filet crème). Leur `::after` reste réservé à l'élargissement des **cibles tactiles à 48 px** : ne pas le réutiliser pour de la 3D.

## 3. Contrat technique

**Sources :**
- `public/accueil-watfir.css` : tailles, rayons, relief et transitions. La règle `:active` **et** la règle `.wf-pressing` sont volontairement groupées pour que les deux états restent identiques.
- `public/hover-interactions.css` : exclusivement les hovers PC dans `@media (hover:hover) and (pointer:fine)` ; chargé en dernier. Éviter d'y réassigner `box-shadow` ou `transform` sur ces composants.
- `public/accueil-watfir.js` : écouteur `click` en **capture** : `Commencer/Continuer`, `Étudier`, `Jouer`, `A1.1`, `A1.2` (ou deux niveaux courants d'une autre famille) et le **sélecteur de niveaux**. Seuls les clics utilisateurs fiables sont retenus : `preventDefault()`, `stopPropagation()`, `wf-pressing` durant **160 ms**, nettoyage, puis `button.click()` afin de réutiliser le gestionnaire existant.
- `public/navigation.js` : Retour Android ferme toujours les feuilles Étudier / niveaux avant de quitter l'écran.

**Temps CSS actuel** : `transform` et `box-shadow` **115 ms**, `background-color` **160–170 ms** selon la variante. Le maintien enfoncé avant activation est distinct : **160 ms**, commun aux six boutons. Une animation ne doit pas rendre le bouton fonctionnellement inerte pendant une seconde : la durée courte est volontaire.

**Sélecteurs des états pressés :**

```css
/* Principe : dans l'accueil Watfir, même compression pour :active et maintien JS. */
#view-dashboard .wf-accueil .puce-niv:active:not(:disabled):not([aria-disabled="true"]),
#view-dashboard .wf-accueil .puce-niv.wf-pressing {
  transform: translateY(calc(var(--wf-pill-depth) - 1px));
  /* box-shadow réduit à une tranche de 1px : voir le CSS source */
}
```

Le sélecteur `.puce-niv` couvre **les deux niveaux affichés et le chevron**, et ne s'applique pas aux boutons de la feuille modale (qui sont une autre famille de composants). Il reste possible de changer de niveau après un clic rapide : la sélection et le re-render surviennent après la pression. Ne jamais placer l'écouteur uniquement sur les éléments rendus, car `renderAccueil()` remplace leur DOM ; la délégation à `document` est nécessaire.

## 4. Bonnes pratiques de migration vers d'autres écrans

1. **Identifier le rôle**, non seulement la couleur : CTA principal, choix de catégorie, pastille de filtre, réponse notée ou commande de gameplay. Ne pas forcer tout le produit en 3D.
2. **Réutiliser le principe d'ombre physique** sans importer aveuglément un sélecteur `#view-dashboard`. Définir face, tranche, profondeur et appui via des variables propres au composant. Chaque bouton garde ses dimensions, son contraste, sa zone tactile et son état désactivé.
3. **Réserver le délai de 160 ms aux transitions d'écran masquant immédiatement l'animation.** Si un bouton valide une réponse, modifie un compteur ou déclenche une action à latence sensible, définir une règle spécifique avec tests d'intégration.
4. **Tester les interactions** au doigt (Android), à la souris, au clavier et via Retour Android. Vérifier focus, disabled, `prefers-reduced-motion`, double clic, zoom, lecture TalkBack et retour arrière après navigation.
5. **Vérifier les invariants métier** : données de progression, raccourcis fonctionnels, historique et accessibilité. Ne jamais masquer une régression fonctionnelle sous un effet d'animation.

**Références :** [Charte DA](CHARTE-DA.md), [Système de hover](HOVER-SYSTEM.md), [Historique d'implémentation](IMPLEMENTATION.md), `PLAYBOOK.md`.

## 5. Recette et limites

`test/watfir-home.test.cjs` vérifie le maintien, les six sélecteurs, le clic rejoué, la sélection de niveau, l'ouverture de la feuille, le double clic et le mouvement réduit. `test/watfir-hover.test.cjs` protège le CSS, les hovers et les bandes du coin. Les tests de contrat peuvent être exécutés par `node --test test/watfir-home.test.cjs test/watfir-hover.test.cjs`.

**Non couvert par ces contrats statiques :** rendu réel Samsung/Brave, latence subjective, zoom système, talkback, comportement natif du clic sous tous les moteurs de navigateur. Une recette sur appareils reste requise avant généralisation de la DA.
