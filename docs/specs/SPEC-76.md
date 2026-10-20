# SPEC 76 — Information sur la progression en mode invité

| Champ | Décision |
|---|---|
| Statut | Version V2 animée codée sur `v2` — recette visuelle Android à confirmer |
| Portée | Portail initial → choix « Commencer à apprendre » / « Continuer sans compte » |
| Dépendances | SPEC 63, 66, 67 — portail, UI et navigation |
| Fichiers | `public/portail.js`, `public/style.css`, `public/navigation.js`, `tests/test_spec_63_portail.js` |

## Problème

Le toast « Ta progression est enregistrée sur cet appareil. » est trop discret, peu informatif et disparaît rapidement. Il n'explique ni le stockage local ni le risque réel de perte.

## Design final V2 — « C’est parti ! »

Fenêtre **compacte et centrée** (largeur max 365 px) sur fond assombri, alignement central, sans en-tête HTML global (évite l'héritage du `header` de l'app).

- Illustration : téléphone doré dans un carré arrondi et coche verte superposée.
- Titre : **C’est parti !**
- Intro : *Apprends sans compte, à ton rythme.*
- ✓ **Progrès enregistrés sur cet appareil**
- ⚠ **Ils peuvent être perdus si les données sont effacées**
- Indication : *Connecte-toi pour les sauvegarder en ligne.*
- Seul bouton : **Compris**, jaune LuxApp, hauteur 54 px minimum.

Rendu épuré : pas de « Mode invité », pas de séparateur, pas de deuxième titre et pas de longue explication.

### Mouvement (subtil et limité)

- Carte : apparition en **420 ms**, petit décalage vertical et échelle 95 → 100 %.
- Coche : arrivée après **320 ms**, léger zoom.
- Halo : deux pulsations douces, puis arrêt.
- Avec `prefers-reduced-motion: reduce` : **aucune animation**.
- Une seule apparition du message par version ; le drapeau passe à `luxInfoInviteVueV2` pour permettre aux personnes ayant vu la V1 de découvrir et valider la nouvelle information **une dernière fois**. La progression n'est jamais remise à zéro.

## Comportement

- L'ancien `notifier('Ta progression est enregistrée sur cet appareil.')` est supprimé, sans altérer les autres notifications.
- Le premier appui sur « Commencer à apprendre » / « Continuer sans compte » ferme le portail, ouvre l'accueil, puis affiche cette fenêtre **une fois pour la V2 par installation/stockage local invité**, sans bloquer l'accès à l'app à long terme.
- Le bouton « Compris » ferme la fenêtre et écrit `luxInfoInviteVueV2=oui` dans `localStorage`. Aux lancements suivants, l'utilisateur invité ne voit plus cette information.
- Retour Android et touche Échap ferment la fenêtre (même mémorisation) ; aucune confirmation supplémentaire, aucun clic involontaire sur le fond.
- La fenêtre possède `role=dialog`, `aria-modal=true`, un titre et une description accessibles. Le focus est placé sur « Compris », puis restitué au bouton « Commencer/Continuer » de l'accueil. Tab reste dans la fenêtre.
- Bloquer le scroll de l'accueil pendant l'affichage ; la carte reste défilable en hauteur réduite et ne déborde pas de l'écran.
- Si un compte est connecté, ne jamais afficher la fenêtre. La connexion et la progression ne sont pas modifiées ; aucune donnée utilisateur ne part au serveur. En mode de recette et tests automatisés, ne pas interrompre l'écran par cette fenêtre.
- Ne pas utiliser le drapeau `luxPortailInviteV1` (héritage de SPEC 64), qui ne doit pas masquer la bienvenue lors de prochaines ouvertures.

## Tests

`node tests/test_spec_63_portail.js` doit vérifier : absence de toast, titre « C’est parti ! », deux messages courts, risque de perte, icône animée, bouton unique, focus, fermeture, stockage persistant, réouverture bloquée, Échap, animation réduite et règles de style et la prise en charge de Retour Android dans `navigation.js`.

Recette Android à confirmer : première arrivée invitée, retour Android, deuxième lancement, compte connecté, petits écrans et lecteur d'écran.
