# SPEC 76 — Information sur la progression en mode invité

| Champ | Décision |
|---|---|
| Statut | Codée sur `v2` — recette visuelle Android à confirmer |
| Portée | Portail initial → choix « Commencer à apprendre » / « Continuer sans compte » |
| Dépendances | SPEC 63, 66, 67 — portail, UI et navigation |
| Fichiers | `public/portail.js`, `public/style.css`, `public/navigation.js`, `tests/test_spec_63_portail.js` |

## Problème

Le toast « Ta progression est enregistrée sur cet appareil. » est trop discret, peu informatif et disparaît rapidement. Il n'explique ni le stockage local ni le risque réel de perte.

## Design approuvé

Fenêtre compacte (carte sombre, bord discret, fond obscurci, texte aligné à gauche), dans le style LuxApp :

**Mode invité**  
*Apprends sans créer de compte*

✅ **Progression enregistrée**  
Sur cet appareil uniquement

⚠️ **Risque de perte**  
Si les données de l’application sont effacées

*Connecte-toi pour sauvegarder tes progrès en ligne.*

**[ Compris ]** — seul bouton, jaune LuxApp, cible ≥ 44 px.

## Comportement

- L'ancien `notifier('Ta progression est enregistrée sur cet appareil.')` est supprimé, sans altérer les autres notifications.
- Le premier appui sur « Commencer à apprendre » / « Continuer sans compte » ferme le portail, ouvre l'accueil, puis affiche cette fenêtre **une fois par installation/stockage local invité**, sans bloquer l'accès à l'app à long terme.
- Le bouton « Compris » ferme la fenêtre et écrit `luxInfoInviteVueV1=oui` dans `localStorage`. Aux lancements suivants, l'utilisateur invité ne voit plus cette information.
- Retour Android et touche Échap ferment la fenêtre (même mémorisation) ; aucune confirmation supplémentaire, aucun clic involontaire sur le fond.
- La fenêtre possède `role=dialog`, `aria-modal=true`, un titre et une description accessibles. Le focus est placé sur « Compris », puis restitué au bouton « Commencer/Continuer » de l'accueil. Tab reste dans la fenêtre.
- Bloquer le scroll de l'accueil pendant l'affichage ; la carte reste défilable en hauteur réduite et ne déborde pas de l'écran.
- Si un compte est connecté, ne jamais afficher la fenêtre. La connexion et la progression ne sont pas modifiées ; aucune donnée utilisateur ne part au serveur. En mode de recette et tests automatisés, ne pas interrompre l'écran par cette fenêtre.
- Ne pas utiliser le drapeau `luxPortailInviteV1` (héritage de SPEC 64), qui ne doit pas masquer la bienvenue lors de prochaines ouvertures.

## Tests

`node tests/test_spec_63_portail.js` doit vérifier : absence de toast, titre, 2 messages, risque de perte, bouton unique, focus, fermeture, stockage persistant, réouverture bloquée, Échap, ainsi que les règles de style et la prise en charge de Retour Android dans `navigation.js`.

Recette Android à confirmer : première arrivée invitée, retour Android, deuxième lancement, compte connecté, petits écrans et lecteur d'écran.
