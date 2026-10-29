# SPEC 93 — LuxApp 2.1 utilisable hors ligne (PWA)

**Branche :** `2.1` · **Date :** 22 octobre 2026 · **Statut :** **implémentée le 26/10/2026** (app hors ligne + téléchargement complet des audios) — **recette Samsung à faire**.  

> **Implémentation (26/10/2026).** Choix produit : un seul bouton « Télécharger tous les audios » (≈ 33 Mo, 1 960 fichiers) au lieu des packs par leçon (§3.4).
> - `server.js` : `/offline-manifest.json` (fichiers de l'app, API de contenu, scripts externes, liste des audios avec tailles ; version = empreinte des fichiers publics et de `data/`) et `/sw.js` (version injectée). En recette, `/sw.js` est un worker qui vide les caches `luxapp-*` et se désinstalle.
> - `public/sw.js` : à l'installation, copie de l'app (≈ 100 fichiers) + SDK Firebase et CSS des polices (copie opaque). Page et fichiers sans `?v=` : réseau d'abord (délai 4 s), copie hors ligne ; fichiers `?v=` : copie d'abord ; `/api/*` : dernière réponse JSON valide ; audios : cache d'abord, fichier entier gardé, réponses 206 pour les lectures par plage. Anciennes versions de l'app supprimées à l'activation, audios conservés. Jamais : non-GET, Firestore, authentification.
> - `public/hors-ligne.js` : enregistrement (sauf `RECETTE`/`TESTS`), carte **Réglages › Hors ligne** (état, barre de progression, Annuler, reprise des seuls fichiers manquants, 3 essais par fichier, vérification finale, `navigator.storage.persist()`, message si l'espace manque). État de l'appareil dans `luxHorsLigneAudio`.
> - Compte hors ligne : `cloud.js` mémorise le dernier compte (`luxDernierCompte`, effacé à la déconnexion) ; si Firebase ne se charge pas, `restaurerCompteHorsLigne()` garde ce profil et le portail ne s'ouvre pas. `syncProgress()` ne contacte pas le cloud quand `navigator.onLine === false` (statut « En attente · hors ligne », reprise sur `online`).
> - **V2 (27/10/2026) — démarrage instantané.** La V1 attendait le réseau (jusqu'à 4 s) pour la page, les fichiers non versionnés et les API, et retéléchargeait toute l'app (≈ 5 Mo) à chaque publication, en concurrence avec le chargement de la page : écran noir au relancement. Désormais : tout est servi depuis la copie cohérente de la version active (aucune attente réseau) ; le manifeste donne une empreinte par fichier et l'installation d'une nouvelle version ne télécharge que les fichiers modifiés (4 en parallèle, les autres sont copiés localement) ; la nouvelle version attend le prochain lancement ou le bandeau « Nouvelle version de LuxApp prête · Mettre à jour » (`skipWaiting` sur message, puis rechargement). Mesures navigateur : relancement 0,25 s avec un serveur ralenti, mise à jour d'un seul fichier = 1 téléchargement.
> - Tests : `test/hors-ligne.test.cjs` ; contrôle navigateur : SW actif, 1 960 audios téléchargés (~15 s en local), rechargement complet hors ligne → accueil, 26 leçons, audio 200 et 206, Lux Runner ouvert, aucune erreur JS.

> **Correctif UX du 28/10/2026 — bandeau de mise à jour intégré.** La notification PWA est maintenant une ligne compacte **dans** la barre de navigation basse, au-dessus de ses quatre onglets, uniquement sur les vues où cette barre apparaît. Le contenu conserve une réserve basse égale à la hauteur effective de la ligne (ResizeObserver avec repli CSS) : pas de carte de leçon recouverte, même sur écran étroit ou avec texte agrandi. Elle affiche « Nouvelle version prête », « Mettre à jour » (cible ≥ 44 px), et « Plus tard » (cible ≥ 44 px, aria-label). Après report, l’action reste disponible dans **Plus → Réglages → Hors ligne**. Elle n’apparaît ni par-dessus les exercices, ni en RECETTE/TESTS ; le mécanisme Service Worker (download, attente, activation, rechargement après clic) et la progression restent inchangés. Tests de non-régression : `node --test test/mise-a-jour-mobile.test.cjs test/hors-ligne.test.cjs`. Recette tactile Samsung (320–430 px, taille de police agrandie, clavier et Retour) à confirmer.

**Références :** [PLAYBOOK](../../PLAYBOOK.md), [AGENTS](../../AGENTS.md), [Charte UI 2.1](../CHARTE_UI_2.1.md), [SPEC 63 — Portail et reconnexion](./SPEC-63.md), [SPEC 88 — Jeux/Survie](./SPEC-88.md), [Recette](../RECETTE.md).

## 1. Objectif produit et définition du « hors ligne »

Pour les francophones/frontaliers, l'application doit permettre une session d'apprentissage sans connexion : train, tunnel, déplacement, réseau défaillant. L'utilisateur ne doit pas perdre sa progression ni avoir besoin de maintenir Brave ouvert.

**Critère de succès principal :** après une première connexion et une préparation offline réussie, l'utilisateur ferme complètement le navigateur, passe en mode avion, rouvre LuxApp depuis son raccourci ou son URL déjà installée : l'accueil, les cours, les leçons téléchargées, les exercices et les fonctions locales se chargent normalement, avec progression persistante. Le retour d'Internet synchronise sans perte les changements locaux.

**Périmètre produit :**
- **P0 — Essentiel :** démarrage à froid, navigation, leçons et exercices téléchargés, chemin, révisions basées sur ces leçons, Survie avec les mots disponibles, scores/progression locaux, statut de connectivité et de téléchargement.
- **P1 — Confort :** audios téléchargeables par leçon, examens préchargés (si choisis), gestion du stockage et mises à jour.
- **Hors périmètre initial :** inscription/connexion Firebase **sans réseau**, synchronisation entre appareils hors connexion, téléchargement initial de la totalité des fichiers audio, push notifications et nouveaux modèles de progression.

**Ne pas confondre :** le manifest `public/manifest.json` (`display: standalone`) permet une présentation installable, **mais ne garantit pas la disponibilité offline**. Le rendu déjà ouvert peut continuer en mémoire tant qu'il n'est pas rechargé ; ce n'est pas le critère P0.

## 2. État vérifié du code avant implémentation

| Élément existant | Constat / conséquence |
|---|---|
| `public/manifest.json` et lien dans `index.html` | Présents, mais **aucun Service Worker** n'existe sur la branche `2.1` à cette date |
| `public/app.js → init()` | `await fetch('/api/lecons')` sans repli : un vrai démarrage hors réseau échoue |
| `public/examens.js → loadExamens()` | `/api/examens` ; échec toléré, mais sujets absents après redémarrage sans cache |
| `public/progress.js` | Progression locale par profil dans `localStorage`, déjà persistante ; **à préserver** |
| `public/cloud.js` | Firebase facultatif et fusion local/cloud existante ; indicateur « En attente · hors ligne », reprise sur `online` et `visibilitychange` |
| `public/index.html` | Scripts Firebase depuis `www.gstatic.com` ; indisponibles hors connexion si non présents en cache navigateur, démarrage local ne doit pas en dépendre |
| `server.js` | Express sert les assets publics et JSON des leçons/examens ; en mode `RECETTE=1`, ressources forcées `Cache-Control: no-store` ; **recette à isoler du SW** |
| `public/audio/` | Environ **1 960 fichiers .mp3/.m4a** référencés sur cette branche (inventaire Git, à auditer avant pack offline) |

Pas de migration de schéma pédagogique ni de réécriture des contenus prévue.

## 3. Architecture cible simple et incrémentale

### 3.1 Service Worker contrôlé et versionné

- Créer un **Service Worker unique** à la racine publique (par exemple `public/sw.js`, portée `/`), enregistré depuis le boot normal si `serviceWorker` est disponible sur HTTPS/localhost et **si `APP_CONFIG.RECETTE !== true`**. Ne jamais l'enregistrer sur une instance de recette ; vérifier également qu'aucun ancien worker ne contrôle l'origine recette.
- Cache de **shell** versionné : document de départ, CSS/JS locaux indispensables au boot et à la navigation, manifest, icônes, polices locales et assets effectivement requis. Inclure les dépendances réelles et leur ordre de chargement ; ne pas mettre en cache à l'aveugle l'ensemble de `public/audio`.
- Pour les navigations de l'application : servir le shell connu en cas de perte réseau ; lorsque disponible, vérifier les mises à jour via le réseau. Pour les assets statiques, stratégie explicitement versionnée et cohérente avec les versions `?v=…` existantes.
- Installation **atomique** : pré-cache shell complet ou refuser la nouvelle version ; conserver la version précédente utilisable jusqu'à activation. Ne pas supprimer l'ancien cache avant la disponibilité du nouveau. Ne pas forcer un rechargement au milieu d'un exercice, d'une mission ou d'une partie de Survie ; proposer « Nouvelle version disponible — Actualiser » au moment opportun.
- **Isolation sécurité :** ne jamais stocker en Cache Storage les tokens Firebase, réponses d'auth, écritures de progression, endpoints privés, données personnelles, ni les requêtes non-GET. Limiter la mise en cache aux ressources **publiques et de même origine** explicitement autorisées. Pas de cache offline partagé entre profils pour les données utilisateurs.

### 3.2 Données pédagogiques et démarrage

- `/api/lecons` : cache de réponse **validée et complète** après chargement réseau réussi, identifié par une version de contenu ; accès offline à la dernière copie valide. Ne jamais mettre en cache une réponse d'erreur, partielle ou un HTML de maintenance sous une URL JSON.
- `/api/examens` : cache optionnel conforme au besoin de l'utilisateur ; si aucun sujet n'a été téléchargé, afficher explicitement « Examens indisponibles hors ligne », sans liste vide trompeuse.
- Préserver les structures et identifiants JSON existants, l'ordre pédagogique, les filtres de niveau, la révision et les accès Survie. Ne pas compter comme accessibles des mots provenant d'une leçon non téléchargée.
- La lecture offline doit fonctionner aussi **après un redémarrage complet** : pas de dépendance à une variable `lecons` encore en mémoire. Les données téléchargeables peuvent utiliser Cache Storage pour les réponses publiques ; conserver `localStorage` pour la progression existante et n'utiliser IndexedDB que si un inventaire fiable ou des métadonnées offline le nécessitent.
- Si aucun cache pédagogique utilisable n'existe, montrer une page/état d'indisponibilité clair avec bouton « Réessayer en ligne », **sans écraser ou réinitialiser la progression** et sans masquer silencieusement les leçons.

### 3.3 Progression, compte et retour réseau

- `localStorage` reste **source de travail locale par profil** (`anonymous` / `user:<uid>`), comme dans `progress.js` et `cloud.js`. Ne modifier ni les clés, ni les identifiants, ni les règles de réussite/score, ni les structures existantes.
- Une session déjà associée à un compte doit pouvoir continuer sur **son profil local correctement identifié** sans bloquer la navigation par une tentative Firebase hors réseau ; **ne jamais confondre** les données du profil connecté et celles du mode invité. Si l'identité locale est ambiguë après redémarrage hors réseau, bloquer uniquement le changement de profil / l'opération sensible et présenter un choix explicite, jamais fusionner implicitement.
- Toutes les écritures pédagogiques restent locales immédiatement. Le statut visuel indique « Hors ligne · progression conservée sur cet appareil » / « Synchronisation en attente » ; « Synchronisé » seulement après retour positif du cloud, pas sur le seul événement `online`.
- À la reconnexion, conserver la mécanique de fusion déjà définie dans `cloud.js` (local + distant avant sauvegarde) ; auditer en priorité les collisions de profils, horodatages et modifications faites sur deux appareils. **Aucune écriture cloud depuis le Service Worker**, aucun nouveau schéma de progression ni « reset » caché.
- Nettoyage des caches d'app **≠** suppression du `localStorage` ; avertir qu'effacer *toutes* les données du site dans les réglages Android/Brave peut supprimer la progression non synchronisée.

### 3.4 Audio offline opt-in par leçon

- **P0 fonctionne sans audio réseau** : bouton de lecture explicite « Audio non téléchargé » si la ressource requise manque, sans blocage de l'exercice.
- **P1 : « Télécharger l'audio de cette leçon »** dans une interface existante appropriée. Générer la liste des fichiers réellement référencés par la leçon, suivant les index/sources LOD, phrases/contextes et voix locales existantes ; ne pas déduire un MP3 à partir du seul texte.
- Téléchargements à la demande, contrôles de taille/volume et de quota (`navigator.storage.estimate()` si disponible), progression et annulation, reprise/revalidation des fichiers manquants. Ne déclarer une leçon « Audio disponible hors ligne » que lorsque son pack minimal est complet.
- L'utilisateur peut retirer uniquement les audios téléchargés sans toucher aux leçons, aux scores, aux cours ni à la progression. Prévoir un message si le navigateur évince les caches.
- Vérifier les modes sans audio, audio local déjà mis en cache, réseau coupé en plein téléchargement, accent/phrase LOD, et fallback audio contextuel.

## 4. UX conforme LuxApp 2.1

- Réutiliser les tokens et composants de la [Charte UI 2.1](../CHARTE_UI_2.1.md) : fond `--couleur-fond`, texte lisible, **or réservé au CTA**, statut de réussite **vert uniquement si réellement réussi**. Ne pas utiliser le vert pour signaler simplement le téléchargement.
- Un indicateur discret dans l'accueil / Réglages : « Prêt hors ligne », « Téléchargement en cours », « Hors ligne · données sauvegardées ici », « Mise à jour disponible ». L'absence de réseau ne doit ni bloquer les tuiles ni créer une modale récurrente.
- Actions compréhensibles : « Préparer mes leçons hors ligne », état `N leçons prêtes`, « Télécharger les audios » (optionnel), « Libérer l'espace audio ». Ne jamais afficher « Tout est disponible » si certains contenus requis ne le sont pas.
- Au premier chargement en ligne, expliquer le téléchargement en une phrase, et le rendre possible sans inscription. Rendre visibles les éventuels coûts de données (Wi-Fi recommandé si packs audio lourds), pas de téléchargement massif sans accord.
- Mobile Android : cibles tactiles ≥ 44 px, pas de micro-scroll provoqué par un bandeau réseau, pas d'action essentielle sous le clavier, navigation Retour conservée. Accessibilité : état annoncé textuellement / `aria-live` discret, pas par couleur seule.

## 5. Plan de livraison obligatoire, séparé du reste de l'app

| Lot | Portée | Critère de sortie |
|---|---|---|
| **0 — Audit** | Cartographier toutes les ressources de boot et leurs dépendances (scripts, fonts, images, API) + audio et profils Firebase ; estimer les volumes ; établir tests de référence sur `2.1` | Inventaire vérifié, impacts et scénarios de régression documentés |
| **1 — Shell / démarrage froid** | Manifest existant conservé, Service Worker versionné, shell public en cache, fallback valide `/api/lecons`, fallback explicite si rien n'a été téléchargé | Redémarrage complet en mode avion OK après préchargement ; aucune modification de progression |
| **2 — Sessions & synchronisation** | Boot non bloquant offline, profil local préservé, statut fiable, fusion au retour du réseau, mise à jour atomique | Aucune perte de progrès après plusieurs redémarrages et bascules réseau |
| **3 — Téléchargements sélectifs** | Inventaire par leçon, audios optionnels, quotas/erreurs, examens choisis, commandes de nettoyage limitées aux caches | Leçon + audios téléchargés utilisables offline ; nettoyage sans perte de progression |

Un lot doit pouvoir être validé **avant** le suivant. Ne pas coupler à une refonte des exercices, de Survie, des missions ou du portail.

## 6. Recette et critères d'acceptation

La livraison sera refusée si un de ces scénarios échoue :

1. **Android / Brave ou Chrome, HTTPS réel** : en ligne → préparer les leçons → fermer complètement l'onglet/application → mode avion → rouvrir depuis le raccourci/la PWA → accueil, cours, exercices, révision et Survie fonctionnels sur le périmètre téléchargé. Ne pas tester uniquement un onglet déjà ouvert.
2. **Démarrage sans préparation** : navigateur hors ligne sans cache → état d'erreur intelligible, pas d'écran noir, pas de `init()` silencieusement interrompu, aucun effacement local.
3. **Progression** : répondre à plusieurs exercices offline, terminer une mission, relancer hors ligne, retrouver les résultats exacts ; retour en ligne et synchronisation ; vérification sur second appareil et sur compte existant sans écrasement des données distantes.
4. **Profils et sécurité** : invité, déjà connecté, déconnecté, reconnexion, comptes alternés ; données strictement isolées ; aucune donnée personnelle dans Cache Storage, aucun cache de credential ou de réponse Firebase Auth.
5. **Réponses cache/API** : mise à jour des leçons en ligne après utilisation offline ; JSON invalide ou 500 non mis en cache ; ancienne copie valide toujours utilisable ; déploiement interrompu et retour arrière testés.
6. **Mise à jour en plein exercice** : nouvelle version publiée pendant une mission ou Survie → aucune interruption/effacement/rechargement imposé ; mise à jour seulement après sortie sûre.
7. **Audios P1** : un pack disponible sans réseau ; autre leçon sans pack → message explicite ; téléchargement interrompu repris ; manque d'espace détecté ; suppression des audios uniquement.
8. **Robustesse mobile** : Android 320/360/390/430 px, petits écrans et police agrandie, touches, scroll, Retour, clavier, navigation et bascule mode avion répétés.
9. **Isolation recette** : `RECETTE=1` sur `localhost:3001` sans Service Worker ni cache pédagogique persistant indésirable ; comportement `Cache-Control: no-store` conservé ; la recette ne peut pas altérer la progression publique. Tester l'absence de worker actif **et** d'un worker résiduel issu de tests antérieurs de la même origine.
10. **Données site effacées** : simuler l'éviction Cache Storage, la suppression du cache audio, et la suppression totale des données site ; expliciter lesquelles détruisent aussi `localStorage`.

**Automatisation requise :**
- Tests unitaires Node pour classification URL/stratégie cache, versioning, fallback et absence d'écriture des données personnelles.
- Tests Playwright **avec un vrai Service Worker actif** (`browserContext.setOffline(true)`), deux navigations distinctes, redémarrage/cold start, cache vide, réponses API invalides, éviction et mises à jour.
- Tests de non-régression de la progression existante (`tests/test_cloud.js`, `tests/test_sync.js` et suites liées), puis `bash tools/critique.sh rapide` / `bash tools/critique.sh` selon impact.
- Test réel Samsung après la CI : chrome installé / onglet navigateur, mode avion **après fermeture**, stabilité des boutons/scroll et audio offline.

**Critère de validation final :** CI verte **et** recette Android documentée. Une capture ou un test en ligne ne suffit pas à prouver le fonctionnement hors ligne.

## 7. Risques et décisions restantes

- **Stockage limité / éviction :** Cache Storage n'est pas garanti permanent. Considérer `navigator.storage.persist()` uniquement avec UX justifiée et mesurer le poids réel, ne jamais promettre un stockage infini.
- **Liens Firebase externes :** les scripts `www.gstatic.com` ne doivent pas empêcher le boot si Internet manque. Étudier leur chargement non bloquant ou un chemin local autorisé sans embarquer de secrets.
- **Fraîcheur et intégrité des contenus :** lors d'une modification de données pédagogiques, associer cache/JSON à une version et vérifier la cohérence des références ; ne pas servir un shell vN avec un schéma incompatible vN+1.
- **Multi-profil / compte connu :** valider précisément la restauration de session Firebase sur appareil hors ligne et la fusion optimiste du code réel avant de promettre « reprise sur compte » en mode avion.
- **Navigation sous `localhost` et HTTPS :** ne pas confondre le fait qu'un serveur Node fonctionne localement sans Internet avec une vraie PWA indépendante de ce serveur.
- **Aucune complexité gratuite :** une solution de cache simple et testée vaut mieux qu'un framework ou une réécriture du moteur. Ne pas introduire de dépendance lourde sans nécessité prouvée.

---

**Cette SPEC autorise uniquement une conception future.** Aucun Service Worker, endpoint, cache offline, changement de synchronisation, migration de progression ou téléchargement audio n'est implémenté par la présente livraison documentaire.

## Décision produit PWA du 29 octobre 2026 — mises à jour automatiques, hors ligne permanent

**Statut : SPÉCIFIÉ, NON IMPLÉMENTÉ.** Ce chapitre **prime** sur le fonctionnement historique « bandeau Mettre à jour / activation manuelle » décrit ci-dessus. Le code actuel reste cache-first, avec bandeau après installation d'un worker en attente. Objectif : **l'utilisateur n'a jamais à demander une mise à jour quand il a Internet**, sans couper une activité en cours ni perdre l'accès hors ligne.

### 1. Contrat utilisateur

1. **En ligne :** démarrage immédiat depuis la dernière copie complète cohérente, puis vérification réseau non bloquante du Service Worker au lancement, au retour au premier plan (`visibilitychange` / `pageshow`), au retour de la connexion (`online`) et périodiquement pendant une longue session au premier plan (cadence indicative : 15 minutes, sans boucle en arrière-plan). Utiliser `registration.update()`, dédupliquer les vérifications et ralentir les tentatives en cas d'erreur réseau. Ne pas se fier exclusivement à `navigator.onLine` : une requête peut échouer malgré ce statut.
2. **Téléchargement :** récupérer les seuls assets modifiés via le manifeste et ses empreintes, en conservant le cache de version active jusqu'à la fin d'une installation **entièrement réussie**. Installation en arrière-plan ; pas de mélange JS/CSS/JSON de deux versions dans une même session. En cas d'échec ou d'interruption, continuer à utiliser la version active et réessayer plus tard.
3. **Activation :** dès qu'un worker mis à jour est prêt, **automatique** au prochain lancement ou à un point de navigation sûr (par exemple retour à l'accueil, en dehors d'une activité), sans bouton manuel. **Ne jamais recharger automatiquement** pendant un exercice, une découverte guidée, un examen, une mission, un jeu, une saisie, un formulaire non envoyé ou une synchronisation locale non consolidée. Ne pas considérer un simple changement d'onglet comme un point sûr. Conserver la version active pendant toute cette activité.
4. **Rechargement :** si l'activation change le contrôleur, recharger **au maximum une fois**, seulement si l'écran est sûr et qu'aucun état volatile n'est à perdre. En cas contraire, différer le rechargement jusqu'au prochain point sûr (ou redémarrage), même si le worker est déjà actif. Vérifier spécifiquement la conservation de la progression locale et de la file de synchronisation.
5. **Hors ligne :** lancer immédiatement la dernière copie complète disponible, sans réseau ni bandeau d'erreur de mise à jour ; conserver les résultats locaux et reprendre la synchronisation en ligne. La connexion retrouvée relance les vérifications. Les audios restent facultativement téléchargeables depuis Réglages : une mise à jour de l'app **ne doit pas vider** le cache `luxapp-audio`.
6. **UI :** supprimer le bandeau « Mettre à jour / Plus tard » en usage normal. Réglages > Hors ligne affiche un état discret : « Application prête hors ligne », « Recherche de mise à jour », « Mise à jour téléchargée, appliquée après cette activité », ou « À jour » **uniquement si une vérification serveur réussie le confirme**. Ne pas promettre « À jour » simplement parce qu'un worker est enregistré. Aucun toast intrusif et aucun bouton obligatoire. Un éventuel recours de diagnostic pour update bloquée doit être réservé aux Réglages, sans restauration du bandeau permanent.

### 2. Plan technique ciblé

- `public/hors-ligne.js` : orchestrateur unique d'enregistrement, `registration.update()`, listeners `updatefound`, `statechange`, `visibilitychange`, `pageshow`, `online` ; déduplication, cadence et backoff ; état « prête / à activer / à recharger ». Remplacer la logique de bandeau manuel par une activation sécurisée, avec détection explicite des vues actives et des états en cours. Ne pas dupliquer les hooks de navigation existants.
- `public/sw.js` : garder les caches `luxapp-app-<version>`, `luxapp-audio`, `luxapp-externe`, l'index d'empreintes et l'installation incrémentale. Activer uniquement à la demande de l'orchestrateur lorsque la session est sûre ; ne pas déclencher `skipWaiting()` simplement parce qu'un onglet vient de perdre le focus. Gérer le cas **multi-onglets / plusieurs clients** : pas de destruction du cache nécessaire à une autre session encore en cours ; définir une stratégie de coordination et de nettoyage différé avant implémentation.
- `public/app.js` / navigation : exposer ou réutiliser un signal explicite « navigation sûre pour activation ». **Par défaut, considérer un écran comme non sûr** tant qu'il n'a pas été audité. Ne pas supprimer les états d'exercice ni réinitialiser la progression au changement de version.
- `public/index.html` / `public/style.css` : retirer les contrôles manuels et réservations d'espace du bandeau devenu inutile, mettre à jour les cache-busters et le libellé Réglages de façon cohérente.
- `server.js` : vérifier l'entête HTTP de `/sw.js` et le manifeste pour éviter le cache réseau intempestif ; utiliser `updateViaCache` adapté lors de l'enregistrement. **Ne pas** ajouter un polling serveur coûteux si `registration.update()` suffit.
- Mode `RECETTE` et `TESTS` : conserver la désinscription / exclusion actuelles afin que la suite Playwright ne soit pas polluée par de vieux caches.

### 3. Recette et critères bloquants

- [ ] Publication d'une version : vérification déclenchée à l'ouverture, au retour au premier plan, au retour d'Internet et en session longue, sans attendre un bandeau.
- [ ] Installation incrémentale terminée avant activation ; en cas de panne réseau ou de quota, **version précédente toujours utilisable**, aucune copie partielle servie.
- [ ] Sur accueil sûr : mise à jour appliquée automatiquement sans clic ni double rechargement.
- [ ] Sur leçon, exercice, clavier ouvert, mission, examen, jeu, formulaire ou synchronisation incertaine : **pas de rechargement intempestif**, même lors de `controllerchange`.
- [ ] Retour vers accueil / lancement suivant : mise à jour appliquée et état de navigation cohérent, aucun score perdu.
- [ ] Test **multi-onglets** : une session ancienne active ne perd pas son cache pendant la bascule d'une autre session.
- [ ] Hors ligne froid après installation : accueil, contenus, exercices et assets téléchargés accessibles ; au retour réseau, reprise des vérifications et de la synchronisation.
- [ ] Audios préalablement téléchargés : toujours présents après au moins deux publications.
- [ ] Aucun bandeau de mise à jour ni espace mort dans la barre du bas ; état discret en Réglages, cibles tactiles et TalkBack adaptés.
- [ ] Tests Node `test/hors-ligne.test.cjs`, `test/mise-a-jour-mobile.test.cjs` **adaptés au nouveau contrat** ; nouveaux tests navigateur avec Service Worker réellement actif, cache de deux versions, offline, réseau coupé/ralenti, activité en cours, plusieurs onglets ; CI verte et vérification Samsung.

### 4. Limites techniques explicites

La PWA ne peut pas garantir une installation immédiate pendant qu'elle est complètement fermée ni contourner l'ordonnancement des Service Workers par Android/Chrome. La promesse produit raisonnable est : **vérifier automatiquement dès que l'app est ouverte et connectée, télécharger sans gêner l'usage, appliquer sans intervention au premier moment sûr**. Hors connexion, la dernière version complète reste disponible. **Cette décision documentaire ne constitue pas un code livré.**
