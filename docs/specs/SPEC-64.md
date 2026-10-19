# SPEC 64 — Portail d'entrée compact et retour à la bienvenue en mode invité

| Champ | Valeur |
|---|---|
| Priorité | P1 — cohérence UX, accessibilité et rétention |
| Statut | **Implémentée sur `v2` — recette Android / PWA réelle à confirmer** |
| Complète | SPEC 19, 48, 62 et 63 |
| Fichiers | `public/portail.js`, `public/style.css`, `tests/test_spec_63_portail.js` |

## Constats

Les écrans de bienvenue, « Bon retour ! » et création de compte étaient trop longs sur Android. La présence d'un grand pictogramme de profil entre l'en-tête et le formulaire forçait un défilement ; de nombreux textes et éléments étaient colorés en jaune sans fonction claire. Le choix invité était enregistré dans `localStorage` (`luxPortailInviteV1=oui`) et empêchait de revoir « Moien / Bonjour » à chaque réouverture de l'application.

## Exigences UX

1. **Identité graphique :** utiliser les variables `design-tokens.css` déjà appliquées aux autres écrans. Un seul bouton en or par page, pour l'action principale. Blanc pour titres, gris neutre pour informations et liens secondaires, or réservé aux actions. Rayons, espacements, police et tailles alignés sur le design system. Supprimer les blocs de CSS redondants de la SPEC 63.
2. **Écran de bienvenue :** garder « Lëtzebuergesch », l'accueil bilingue « Wëllkomm · Bienvenue » et l'illustration « Moien ! / Bonjour ! », mais en taille réduite. Réduire le texte descriptif et l'espace vertical ; tous les choix **Créer un compte / J'ai déjà un compte / Continuer sans compte** doivent rester visibles sans défilement sur un téléphone courant. « Continuer sans compte » devient une **action tertiaire discrète**, de taille comparable aux liens de l'application et avec cible tactile ≥44 px.
3. **Bon retour :** supprimer le grand pictogramme de profil et le titre jaune surdimensionné. Afficher un titre blanc court, une description d'une ligne ou deux, deux champs usuels, « Mot de passe oublié ? » discret, un bouton principal « Me connecter » de hauteur `--hauteur-bouton`, puis les liens « Créer un compte » et « Continuer sans compte ». Pas de grande carte secondaire ni de vide artificiel entre les actions.
4. **Créer un compte :** même structure que connexion ; titre court, description condensée, champs directement accessibles, CTA jaune compact, lien vers connexion et mode invité discret. Pas d'illustration de profil inutile.
5. **Modal invité :** conserver la confirmation et l'information sur le stockage local. Le médaillon doit être centré, mais réduit, et les deux actions principales du panneau restent alignées avec les autres boutons LuxApp. Ni suppression ni transfert silencieux des progrès.
6. **Retour en mode invité :** à chaque **nouveau démarrage de la page** sans session Firebase restaurée, afficher l'écran « Moien / Bonjour » (ou « Bon retour » seulement si le dernier mode connu est un compte déconnecté). L'ancienne clé permanente `luxPortailInviteV1` ne doit plus permettre de sauter l'accueil. Confirmer « Continuer en invité » ne dispense que de l'écran pour l'ouverture en cours. **Ne pas effacer les progrès** en local (`anonymous` reste inchangé).
7. Si l'utilisateur choisit explicitement le mode invité depuis l'écran d'un ancien compte, la prochaine ouverture se fait sur la bienvenue « Moien / Bonjour ». Après une déconnexion volontaire d'un compte connecté, la prochaine ouverture propose « Bon retour ».
8. Préserver la connexion Firebase existante, le traitement des erreurs, l'import consentant de la progression invitée et la sauvegarde. Aucune nouvelle donnée personnelle enregistrée.

## Recette

- [x] Le contrôle de l'ancienne clé d'accès invité est supprimé au boot ; les données de progression ne sont pas modifiées.
- [x] Un invité confirmé revoit la bienvenue lors du nouveau démarrage, sans seconde confirmation dans la même ouverture.
- [x] Un compte déconnecté arrive sur « Bon retour » ; un compte connecté ne voit pas le portail.
- [x] Disparition du grand pictogramme de profil ; boutons et textes plus compacts.
- [x] Contrôles CSS : utilisation des tokens, dimensions tactiles de 44–48 px, texte secondaire neutre.
- [ ] Recette visuelle Android : 320 × 650, 360 × 740, 393 × 852, clavier ouvert et contraste.
- [ ] Vérification PWA après fermeture complète, reprise de l'onglet suspendu et reconnexion Firebase réelle.

**Ne pas déclarer « Validée » avant la recette sur appareil réel.**
