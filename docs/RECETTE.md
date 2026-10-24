# LuxApp 2.1 — Recette privée et outils de test

**Référence actuelle :** branche `2.1`. Cette page est le **mode d'emploi officiel** du dispositif de recette. Pour les scénarios disponibles et leurs statuts, voir [RECETTES-2.1.md](RECETTES-2.1.md) ; pour les consignes de non-régression, consulter le [post-mortem](POSTMORTEM-EXERCICES-2.1-2026-10-21.md).

## Principe

Le site public LuxApp et le site de recette sont deux **services distincts**, déployés à partir de la même branche `2.1`. **L'URL habituelle de LuxApp ne change pas.** Le service privé peut être ouvert depuis **Plus → Outils de test** pour les comptes Firebase autorisés, ou directement à son URL HTTPS.

- **Sur l'application normale :** Firebase et les données réelles continuent de fonctionner. Le raccourci n'est montré qu'aux UID configurés avec `RECETTE_ACCES` ; cette visibilité n'est **pas** une barrière de sécurité.
- **Sur la recette :** `RECETTE=1` active l'authentification HTTP Basic côté serveur (`RECETTE_USER`, `RECETTE_PASS`), retire les scripts Firebase, empêche les écritures cloud et isole le stockage par un domaine différent. Sans utilisateur ou mot de passe de recette, l'accès est refusé (503).
- **Retour :** `LUXAPP_URL` autorise le bouton « Retour à LuxApp ». Les essais et records de recette ne constituent pas une progression réelle.

## Configuration Render

Créer un **second** Render Web Service sur `aym2020/LuxApp`, branche `2.1`, avec `npm install` en build et `npm start` au démarrage. Conserver le service public existant.

| Où ? | Variable | Valeur |
|---|---|---|
| **Service recette uniquement** | `RECETTE` | `1` |
| Service recette | `RECETTE_USER` | Identifiant privé |
| Service recette | `RECETTE_PASS` | Mot de passe fort et non versionné |
| Service recette | `LUXAPP_URL` | URL HTTPS réelle de LuxApp |
| **Service public uniquement** | `RECETTE_URL` | URL HTTPS du **second** service Render |
| Service public | `RECETTE_ACCES` | Un ou plusieurs UID Firebase, séparés par des virgules |

**Ne jamais renseigner `RECETTE=1` dans le service public.** Ne pas pointer `RECETTE_URL` vers l'URL de LuxApp normale. Les UID autorisés et l'URL de recette étant envoyés au navigateur dans `/config.js`, le mot de passe serveur reste obligatoire même si le menu est masqué.

Après chaque changement de variables, laisser Render redéployer le service concerné. Le plan gratuit peut se mettre en veille.

## Fenêtre « app » Android : pourquoi une installation distincte est nécessaire

L'URL de recette et l'URL de LuxApp normale sont **deux origines** : ouvrir la recette depuis l'icône installée de LuxApp passe donc par un onglet du navigateur (Chrome / Brave peuvent afficher leur barre d'adresse). Le manifeste de la recette porte le nom **« LuxApp TEST »**, mais **on ne peut pas forcer un autre domaine à s'ouvrir à l'intérieur de la PWA LuxApp**.

Pour obtenir une **fenêtre dédiée sans barre de navigateur**, ouvrir directement l'URL `https://luxapp-recette.onrender.com` dans Brave/Chrome, s'authentifier puis utiliser le menu du navigateur **Installer l'application** ou **Ajouter à l'écran d'accueil** si l'option PWA est proposée. Lancer ensuite l'icône LuxApp TEST ainsi créée. Selon la prise en charge du navigateur et de HTTP Basic Auth, l'option peut n'être qu'un raccourci et conserver l'interface du navigateur. **Ne pas** rapprocher les deux sites sur la même origine : cela supprimerait la séparation du stockage local de progression.

## Utilisation sur PC et Samsung

1. Ouvrir LuxApp sur son URL habituelle, se connecter avec un UID autorisé et choisir **Plus → Outils de test** ; saisir l'identifiant/mot de passe de recette dans la fenêtre native du navigateur.
2. Dans la recette, choisir une **leçon**, puis un **écran** disponible et un **scénario** ; cliquer sur **Voir cet écran**.
3. Contrôler le rendu réel, la correction et les actions. Le contenu est préparé par les moteurs réels. Une option « indisponible » dépend des données de la leçon ou du mode de jeu.
4. Utiliser le repère **MODE TEST** pour changer de scénario, puis « Retour à LuxApp » pour revenir à l'application habituelle.

Le menu et ses scénarios sont documentés dans [RECETTES-2.1.md](RECETTES-2.1.md). Une réussite des tests automatisés **ne signifie pas** validation de l'ergonomie Android réelle. Vérifier les cas clavier ouvert, écrans 320–430px, zoom, scroll, retour Android et CTA bas.

## Usage local — optionnel

Pour une instance locale isolée, lancer le serveur Node sur un port dédié avec `RECETTE=1` et les variables Basic Auth, sans toucher au checkout du site public. L'URL locale classique est `http://localhost:3001`. Une procédure locale historique existe en [archive v2](archives/RECETTE-V2-TERMUX.md) ; elle **ne doit pas être copiée telle quelle**, car elle référence une ancienne branche et des commandes destructrices.

## Contrôles et règles de qualité

- Test d'accès / authentification / retour : `python tests/test_acces_recette.py`.
- Recettes navigateur et isolation : `python tests/test_recette_visuelle.py`.
- Suite critique avant modification sensible : `bash tools/critique.sh rapide`, puis `bash tools/critique.sh`.
- Résultats et validation humaine par recette : [RECETTES-2.1.md](RECETTES-2.1.md).
- Incidents connus des exercices `2.1` : [post-mortem](POSTMORTEM-EXERCICES-2.1-2026-10-21.md).

**Statut :** mécanisme d'accès privé disponible dans le code ; les recettes restent validées ou non **individuellement**, sur navigateur et Samsung. Ni ce guide ni une CI verte ne constituent une validation générale de tous les exercices.
