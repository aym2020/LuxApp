# LUX MATCH — Bible éditoriale A1.1 : profils, réseaux, dialogues, événements et fins

**État : V1, contenu de conception à intégrer / relire, pas un jeu modifié.** Branche de référence : `2.1` · Date : 27/10/2026 · Liens : [SPEC 109](specs/SPEC-109.md) · [Profils existants](../data/jeux/lux-match/archetypes-v01.json) · [Dialogues existants](../data/jeux/lux-match/dialogues-a11-v01.json).

> **Contrat pour Claude** — Ce document est le **corpus d'auteur**, pas un ordre de modifier immédiatement le moteur. Les identifiants des scènes, lignes et conditions sont destinés à être intégrés en données structurées après audit. **Ne pas copier/coller des phrases en production sans contrôle LOD/grammaire**, ni créer une deuxième source de vérité concurrente. Ne pas retoucher Lux Runner, le renderer Three.js, le cloud ou `luxProgress` avec ce lot.

## 1. Contenu source et décisions figées

**Source de vérité consultée :** `PLAYBOOK.md`, `docs/specs/SPEC-109.md` (§§12–13), `docs/CHARTE_UI_2.1.md`, `public/lux-match.js`, `public/lux-match-core.js`, les deux JSON Lux Match de `2.1`, `data/missions/README.md` et le vocabulaire des leçons A1.1 **1, 3, 4, 5, 7, 8, 9, 10, 11, 13, 14, 15, 16**. Référence de règles : `grammaire_luxembourg.md` (phrases V2, conjugaison, prépositions de pays/villes, heures). Dictionnaire officiel [LOD.lu](https://lod.lu) pour revue finale. Le LOD a été consulté ponctuellement (dont l'entrée [spillen](https://lod.lu/artikel/SPILLEN1)), **pas une certification ligne par ligne**. Les missions conversationnelles existantes restent des **brouillons pédagogiques**, et ne servent pas de preuve de validation complète.

**Statuts :** `EXISTANT` = repris littéralement du JSON actuel ; `LEÇON` = forme présente dans le référentiel A1.1 actuel ; `À_AUDITER` = texte luxembourgeois ou portugais nouvellement rédigé, soumis à LOD + grammaire + revue humaine ; `FR_JEU` = texte français de narration / animation ; `OPTIONNEL` = hors lexique A1.1 strict, ne pas compter dans le score de langue.

**Périmètre** : même café, six partenaires adultes fictives, un avatar Alex (28 ans, France/Metz, banquier, français), trois faux réseaux (Pix/Pro/Amis), 5 styles et 6 couleurs, deux jauges sociales Affinité/Suspicion. **Pas de CUPID.EXE, monde ouvert, dialogues LLM ou nouveaux personnages secondaires.** Les préférences sont **déclarées** publiquement, jamais devinées sur nationalité/profession/look. La comparaison sociale et le bluff peuvent être drôles mais aucune personne réelle ni données privées ne sont exploitées.

## 2. Style rédactionnel et exploitation par le générateur

- **Une seule voix de personnage** : Léna directe et compétitive ; Claire organisée et ironique ; Noémie créative et spontanée ; Maya geek taquine mais calme ; Sofia curieuse des langues et voyages ; Emma franche, calme et attentive.
- **Un fait canonique** par partenaire (`facts`) et par Alex (`persona`) ; ne jamais changer âge, ville, métier ou langues au milieu du même run. Variantes procédurales seulement dans les pools autorisés.
- **Un indice avant toute conséquence forte** : préférence de couleur/look, anti-téléphone, aversion rare pour « Alex », critère d'âge. Un indice doit être accessible avant le date même si Pix est privé ; poster une bio honnête sur Amis au besoin.
- **Pas de spoilers méta** dans les réseaux : on supprime les légendes « pays d'origine confirmé dans Amis », et on ne montre pas « piège à venir ».
- **Écriture courte** : Tinder = 1–2 phrases LU (35–100 caractères visés) ; un post = 1–2 phrases ; dialogue = 1 question + 2–3 choix de 1 phrase ; réactions brèves. Pas de longs paragraphes ni de langage hors A1.1 pour une réponse notée.
- **Réponses** : `L` = correct linguistiquement, `V` = vérité, `M` = mensonge plausible, `B` = blague/absurdité, `E` = erreur linguistique ou pragmatique **explicitement indiquée**. Les `B` correctes en LU valent des points de langue, même si elles font baisser l'affinité. Si une formulation `E` est acceptable en luxembourgeois, **supprimer le piège linguistique**, ne pas la sanctionner.
- **Montage** : des scènes `A1` (briser la glace), `A2` (faire connaissance), `A3` (cohérence/clôture) sont sélectionnées une fois dans `scenarioPlan` par `seed` ; les textes sont des lignes entièrement auditées, **aucune génération libre de phrases**.
- **Blague étrangère** : le gag « vache / hippopotame / chat » en portugais n'est **jamais** un test de portugais noté ; sortie « j'avoue » toujours possible.

## 3. Tous les textes courts d'interface (FR_JEU)

| ID UI | Emplacement / contexte | Texte prêt à employer |
| --- | --- | --- |
| `UI_START_TITLE` | Début | **LUX MATCH** |
| `UI_START_SUB` | Accueil | Une rencontre. Quelques mensonges. Beaucoup de conséquences. |
| `UI_ME_TITLE` | Écran initial | **TON PROFIL** |
| `UI_ME_SUB` | Sous-titre | Voilà qui tu es. Ce que tu raconteras ensuite, c'est une autre histoire. |
| `UI_ME_CTA` | Avant swipe | **Commencer les swipes** |
| `UI_ME_REOPEN` | En partie | Ma vraie identité |
| `UI_ME_FOOT` | Profil Alex | Tes mensonges ne modifieront pas cette fiche. |
| `UI_SWIPE_HINT` | Première carte | Glisse à droite pour aimer, à gauche pour passer. |
| `UI_SWIPE_LIKE` | Action | J'aime |
| `UI_SWIPE_PASS` | Action | Passer |
| `UI_SWIPE_NO_MORE` | Tout refusé | Personne ne te plaît ? Une nouvelle série arrive. |
| `UI_MATCH_TITLE` | Match | **IT'S A MATCH!** |
| `UI_MATCH_BODY` | Match | Vous allez vous retrouver au café ce soir. |
| `UI_MATCH_DATE` | Choix | **Aller au date** |
| `UI_MATCH_SEARCH` | Choix | **Enquêter** |
| `UI_NETWORK_TITLE` | Enquête | Ses réseaux |
| `UI_NETWORK_HINT` | Enquête | Prends ton temps. La batterie ne se vide pas ici. |
| `UI_NETWORK_PIX` | App | **Pix** · Photos |
| `UI_NETWORK_PRO` | App | **Pro** · Carrière |
| `UI_NETWORK_AMIS` | App | **Amis** · Vie perso |
| `UI_PRIVATE` | Pix privé | Compte privé. Ses photos ne sont pas accessibles. |
| `UI_NO_MORE_POSTS` | Fil terminé | Fin des publications. |
| `UI_BACK_APPS` | Réseau | Retour aux apps |
| `UI_LOOK_TITLE` | Look | Quel look pour ce rendez-vous ? |
| `UI_LOOK_STYLE` | Look | Style |
| `UI_LOOK_COLOR` | Look | Couleur |
| `UI_LOOK_SKIP` | Look | Garder cette tenue |
| `UI_LOOK_CTA` | Look | **Aller au rendez-vous** |
| `UI_LOOK_RESEARCH` | Look | Revoir ses réseaux |
| `UI_DATE_PHONE` | HUD | Téléphone |
| `UI_DATE_SELF` | HUD | Moi |
| `UI_DATE_AFFINITY` | HUD | Affinité |
| `UI_DATE_SUSPICION` | HUD | Suspicion |
| `UI_DATE_FR_ON` | Aide | Aide FR activée |
| `UI_DATE_FR_OFF` | Aide | Aide FR désactivée |
| `UI_PHONE_LOW` | Batterie basse | 20 % ! Fais vite. |
| `UI_PHONE_DEAD` | Batterie épuisée | Batterie à plat. Maintenant, improvise. |
| `UI_PHONE_COMEBACK` | Fermer téléphone | Revenir au rendez-vous |
| `UI_FEED_GOOD` | Réponse juste | BIEN JOUÉ ! |
| `UI_FEED_LIE` | Bluff | BLUFF ! |
| `UI_FEED_CRINGE` | Gaffe | GÊNANT… |
| `UI_FEED_REPAIR` | Aveu | SAUVÉ… DE JUSTESSE ! |
| `UI_FEED_RECALL` | Rappel | Elle s'en souvient… |
| `UI_HELP_LANG` | Correction | Expression à retenir |
| `UI_RESULT_GOOD` | Fin | NOUVEAU RDV ! |
| `UI_RESULT_FUN` | Fin | GÊNANT… MAIS DRÔLE |
| `UI_RESULT_NEUTRAL` | Fin | ÇA NE COLLE PAS |
| `UI_RESULT_BAD` | Fin | MALAISE TOTAL |
| `UI_RESULT_LANG` | Bilan | Tes expressions en luxembourgeois |
| `UI_RESULT_SOCIAL` | Bilan | Ce qui s'est passé |
| `UI_RESULT_REPLAY` | Fin | **Nouveau match** |
| `UI_RESULT_EXIT` | Fin | Retour aux jeux |

**Consigne de localisation** : l'interface générale de LuxApp reste en français ; les contenus enseignés (bio, posts, questions, réponses) sont en LU, traduction sous la phrase seulement si aide FR. Texte FR des réactions narratives autorisé comme *feedback social*, distinct de la compétence linguistique.

## 4. Profil joueur — affichage initial et référence canonique

**Alex, 28 ans.** `name=Alex`, `age=28`, `origin=Frankräich`, `city=Metz`, `job=Banker`, `languages=[Franséisch]`, `football=false`, `morningCoffee=true` (champs existants). Texte d'affichage « **Alex, 28 ans — Je viens de France, j'habite à Metz, je suis banquier et je parle français.** » (FR_JEU). Sous-titre LU, construit avec **phrases intégrales auditées** : « Ech heeschen Alex. Ech sinn aachtanzwanzeg Joer al. Ech kommen aus Frankräich. Ech wunnen zu Metz. Ech sinn e Banker. Ech schwätzen Franséisch. » (`À_AUDITER` en tant qu'ensemble ; segments repris des dialogues actuels).

**Règle d'édition :** vérité et historique `claims` séparés ; l'écran Moi montre la vraie identité, **jamais** les réponses mémorisées à la place du joueur. Pas de nouvelle identité inventée pour un client réel.

## 5. Profils, posts et photos : corpus principal (six personnages)

**Convention des entrées :** chaque `TINDER`, `PIX`, `PRO`, `AMIS` est composé d'un identifiant stable, **LU → FR**, et pour chaque photo d'une **description de scène à produire** (pas la photographie réelle de quelqu'un). Tous les nouveaux énoncés LU ci-dessous = `À_AUDITER` par défaut, y compris si fondés sur des formes simples du cours. Les *préférences de look et la couleur* sont explicites via posts ; elles ne sont pas inférées de la profession.


### P_LENA — Léna

**Faits source :** 27 ans · Metz · originaire de France · professeure · archétype sportive. **Voix :** sportive/directe/compétitive.

- **TINDER.LENA.BIO :** « Ech wunnen zu Metz. Ech spille gär Fussball. » → *J'habite à Metz. J'aime jouer au football.*
- **PIX.LENA.BIO :** « Fussball, Sport a Frënn. » → *Football, sport et amis.*

**Pix — légendes et instructions de scène (sauf si le compte passe privé dans une variante) :**

| Ligne | Légende LU → FR | Image 3D à créer |
| --- | --- | --- |
| `PIX_LENA_P01` | « Moies am Park. Ech lafe gär. » → *Le matin au parc. J'aime courir.* | Léna court sur un chemin arboré, baskets visibles ; matin frais. |
| `PIX_LENA_P02` | « Ech spille gär Fussball. » → *J'aime jouer au football.* | Terrain de foot éclairé ; maillot bleu, ballon au premier plan. |

**Pro — textes :** « Ech schaffen als Léierin. Ech wunnen zu Metz. » → *Je suis professeure. J'habite à Metz.*. Libellés de fiche à conserver en français hors mode pédagogique : Enseignante · Université de Metz · Français et luxembourgeois (libellés de champs).

**Amis — posts authentiques :**

| Ligne | Texte LU → traduction FR | Fonction dans le générateur |
| --- | --- | --- |
| `AMIS_LENA_A01` | « Meng Liiblingsfaarf ass blo. Sportlech Kleeder si super. » → *Ma couleur préférée est le bleu. J'adore les tenues sportives.* | `style=sportif,color=blo` |
| `AMIS_LENA_A02` | « Ech spille gär Fussball. E Freideg och! » → *J'aime jouer au foot. Même le vendredi !* | `sport=football` |
| `AMIS_LENA_A03` | « Eng Fro: Bass du och sportlech? » → *Une question : tu es sportif aussi ?* | `question_foot` |

**Caractère et réactions :** Tendance à provoquer des défis amicaux ; ne pénalise pas automatiquement les personnes qui ne font pas de sport. **Variante admise :** Variante autorisée : humour direct ou compétitivité ; piège seulement après mensonge sportif.

### P_CLAIRE — Claire

**Faits source :** 31 ans · Luxembourg-ville · originaire de France · banquière · archétype ambitieuse. **Voix :** organisée/ironique/ponctuelle.

- **TINDER.CLAIRE.BIO :** « Ech wunnen zu Lëtzebuerg. Ech schaffen an enger Bank. » → *J'habite au Luxembourg. Je travaille dans une banque.*
- **PIX.CLAIRE.BIO :** « Lëtzebuerg. Aarbecht. Reesen. » → *Luxembourg. Travail. Voyages.*

**Pix — légendes et instructions de scène (sauf si le compte passe privé dans une variante) :**

| Ligne | Légende LU → FR | Image 3D à créer |
| --- | --- | --- |
| `PIX_CLAIRE_P01` | « Gudden Owend! » → *Bonsoir !* | Photo d'une vraie réception stylisée, tenue noire chic, lumière chaude. |
| `PIX_CLAIRE_P02` | « Lëtzebuerg owes. » → *Luxembourg le soir.* | Panorama low-poly de la ville ; un agenda sur la table, aucun mot de jeu. |

**Pro — textes :** « Ech schaffen an enger Bank. Ech schwätzen Franséisch an Englesch. » → *Je travaille dans une banque. Je parle français et anglais.*. Libellés de fiche à conserver en français hors mode pédagogique : Banquière · Université du Luxembourg · Luxembourgeois : non déclaré.

**Amis — posts authentiques :**

| Ligne | Texte LU → traduction FR | Fonction dans le générateur |
| --- | --- | --- |
| `AMIS_CLAIRE_A01` | « Meng Liiblingsfaarf ass schwaarz. Ech hunn elegant Kleeder gär. » → *Ma couleur préférée est le noir. J'aime les vêtements élégants.* | `style=bcbg,color=schwaarz` |
| `AMIS_CLAIRE_A02` | « Ech sinn ëmmer pünktlech. » → *Je suis toujours à l'heure.* | `trait=ponctualite` |
| `AMIS_CLAIRE_A03` | « Aacht Auer heescht aacht Auer. » → *Huit heures, c'est huit heures.* | `event=retard_si_annonce` |

**Caractère et réactions :** Elle apprécie la ponctualité, mais n'évalue jamais le métier d'Alex selon une hiérarchie sociale ; si elle découvre un faux métier, c'est la tromperie qui la gêne. **Variante admise :** Variante rare : aversion pour le prénom Alex, annoncée sur Amis, indépendamment de l'archétype.

### P_NOEMIE — Noémie

**Faits source :** 25 ans · Esch · originaire de Belgique · illustratrice · archétype artiste. **Voix :** créative/spontanée/taquine.

- **TINDER.NOEMIE.BIO :** « Ech wunnen zu Esch. Ech molen gär. » → *J'habite à Esch. J'aime dessiner.*
- **PIX.NOEMIE.BIO :** « Faarwen. Molerei. Musek. » → *Couleurs. Dessin. Musique.*

**Pix — légendes et instructions de scène (sauf si le compte passe privé dans une variante) :**

| Ligne | Légende LU → FR | Image 3D à créer |
| --- | --- | --- |
| `PIX_NOEMIE_P01` | « Ech molen haut. » → *Je dessine aujourd'hui.* | Petit carnet rempli de croquis sur une table de café, stylo rouge. |
| `PIX_NOEMIE_P02` | « Rout a blo! » → *Rouge et bleu !* | Atelier avec vrai tableau rouge et bleu ; pas seulement son portrait sur un fond. |

**Pro — textes :** « Ech wunnen zu Esch. Ech schaffen als Illustratorin. » → *J'habite à Esch. Je travaille comme illustratrice.*. Libellés de fiche à conserver en français hors mode pédagogique : Illustratrice · École d'art · Langues : français / anglais.

**Amis — posts authentiques :**

| Ligne | Texte LU → traduction FR | Fonction dans le générateur |
| --- | --- | --- |
| `AMIS_NOEMIE_A01` | « Meng Liiblingsfaarf ass rout. Ech hu faarweg Kleeder gär. » → *Ma couleur préférée est le rouge. J'aime les vêtements colorés.* | `style=creatif,color=rout` |
| `AMIS_NOEMIE_A02` | « Ech molen gär. Awer net moies. » → *J'aime dessiner. Mais pas le matin.* | `trait=creation` |
| `AMIS_NOEMIE_A03` | « Ech spille gär Musek. » → *J'aime faire de la musique.* | `trait=musique; audit sens exact de spille Musek` |

**Caractère et réactions :** Les dessins ratés peuvent la faire rire, mais jamais d'obligation de réussir une épreuve hors langue. **Variante admise :** Variante : aime l'humour absurde ou préfère la franchise, annoncé dans une publication.

### P_MAYA — Maya

**Faits source :** 26 ans · Trèves · originaire d'Allemagne · développeuse · archétype geek. **Voix :** geek/calme/ironique.

- **TINDER.MAYA.BIO :** « Ech wunnen zu Tréier. Ech spille gär Computerspiller. » → *J'habite à Trèves. J'aime jouer aux jeux vidéo.*
- **PIX.MAYA.BIO :** « Spiller a Kaffi. » → *Jeux et café.*

**Pix :** Compte privé — bio publique uniquement. Aucun compteur inventé, aucune photo exposée.

**Pro — textes :** « Ech schaffen als Programméiererin. Ech schwätzen Däitsch an Englesch. » → *Je travaille comme développeuse. Je parle allemand et anglais.*. Libellés de fiche à conserver en français hors mode pédagogique : Développeuse · Informatique · Trèves.

**Amis — posts authentiques :**

| Ligne | Texte LU → traduction FR | Fonction dans le générateur |
| --- | --- | --- |
| `AMIS_MAYA_A01` | « Meng Liiblingsfaarf ass gréng. Ech hunn einfach Kleeder gär. » → *Ma couleur préférée est le vert. J'aime les tenues simples.* | `style=casual,color=gréng` |
| `AMIS_MAYA_A02` | « Ech spille gär Computerspiller. » → *J'aime les jeux vidéo.* | `trait=gaming` |
| `AMIS_MAYA_A03` | « Moies drénken ech Kaffi. » → *Le matin, je bois du café.* | `routine=cafe` |

**Caractère et réactions :** Taquine sur les jeux rétro, n'exige pas de connaissances de joueur pour gagner une question A1.1. **Variante admise :** Variante compatible : susceptible sur un bluff sur les jeux ; sinon adore expliquer ses références.

### P_SOFIA — Sofia

**Faits source :** 29 ans · Metz · originaire du Portugal · guide touristique · archétype voyageuse. **Voix :** curieuse/enthousiaste/langues.

- **TINDER.SOFIA.BIO :** « Ech kommen aus Portugal. Ech wunnen zu Metz. » → *Je viens du Portugal. J'habite à Metz.*
- **PIX.SOFIA.BIO :** « Reesen a Sproochen. » → *Voyages et langues.*

**Pix — légendes et instructions de scène (sauf si le compte passe privé dans une variante) :**

| Ligne | Légende LU → FR | Image 3D à créer |
| --- | --- | --- |
| `PIX_SOFIA_P01` | « Lissabon. Ech kommen ëmmer gär zeréck. » → *Lisbonne. J'aime toujours y revenir.* | Place de Lisbonne avec tram jaune stylisé, ville et architecture réellement visibles. |
| `PIX_SOFIA_P02` | « Mam Zuch ënnerwee. » → *En voyage en train.* | Siège de train, billet visible, paysage passant par la fenêtre. |

**Pro — textes :** « Ech schwätzen Portugisesch a Franséisch. » → *Je parle portugais et français.*. Libellés de fiche à conserver en français hors mode pédagogique : Guide touristique · Études de tourisme · Metz.

**Amis — posts authentiques :**

| Ligne | Texte LU → traduction FR | Fonction dans le générateur |
| --- | --- | --- |
| `AMIS_SOFIA_A01` | « Meng Liiblingsfaarf ass blo. Ech hunn e bequeme Look gär. » → *Ma couleur préférée est le bleu. J'aime les looks confortables.* | `style=casual,color=blo` |
| `AMIS_SOFIA_A02` | « Ech kommen aus Portugal. Ech wunnen zu Metz. » → *Je viens du Portugal. J'habite à Metz.* | `origin=Portugal,city=Metz` |
| `AMIS_SOFIA_A03` | « Ech schwätzen Portugisesch a Franséisch. » → *Je parle portugais et français.* | `languages=[pt,fr]` |

**Caractère et réactions :** Aime les histoires de voyage ; le piège portugais est déclenché uniquement par mensonge éligible d'Alex et propose un aveu. **Variante admise :** Variante secondaire sportive OU curieuse des horaires de train, mais elle reste passionnée de voyages.

### P_EMMA — Emma

**Faits source :** 30 ans · Luxembourg-ville · originaire de France · libraire · archétype chill. **Voix :** calme/franche/attentive.

- **TINDER.EMMA.BIO :** « Ech wunnen zu Lëtzebuerg. Moies drénken ech Kaffi. » → *J'habite au Luxembourg. Le matin, je bois du café.*
- **PIX.EMMA.BIO :** « Kaffi a Bicher. » → *Café et livres.*

**Pix :** Compte privé — aucune photo accessible, les intérêts sont révélés sur Amis.

**Pro — textes :** « Ech schaffen als Buchhändlerin. Ech schwätzen Franséisch a Lëtzebuergesch. » → *Je travaille comme libraire. Je parle français et luxembourgeois.*. Libellés de fiche à conserver en français hors mode pédagogique : Libraire · Lettres · Luxembourg.

**Amis — posts authentiques :**

| Ligne | Texte LU → traduction FR | Fonction dans le générateur |
| --- | --- | --- |
| `AMIS_EMMA_A01` | « Meng Liiblingsfaarf ass beige. Ech hunn einfach Kleeder gär. » → *Ma couleur préférée est le beige. J'aime les tenues simples.* | `style=loose,color=beige` |
| `AMIS_EMMA_A02` | « Beim Rendez-vous: kee Telefon, w.e.g. » → *Pendant le rendez-vous : pas de téléphone, s'il te plaît.* | `anti_phone, fort, déclencheur observé ; auditer l'emprunt Telefon/Handy` |
| `AMIS_EMMA_A03` | « Moies drénken ech Kaffi. Owes liesen ech gär. » → *Le matin, je bois du café. Le soir, j'aime lire.* | `routine_cafe_lecture` |

**Caractère et réactions :** Si Alex regarde son téléphone, gêne contextuelle (jamais punition d'une faute de luxembourgeois). **Variante admise :** Variante anti-téléphone désactivée possible seulement si les posts changent eux aussi ; la cohérence exige la même seed.


### 5.7. Paquets de variantes procédurales de posts (facultatifs)

Les variantes ci-dessous **ne remplacent pas les preuves indispensables du look** : elles sont des posts secondaires à insérer si le plan sélectionne le trait, jamais des goûts tirés sans indice.

| ID | Partenaire | Variante LU (À_AUDITER) → FR | Fonction |
| --- | --- | --- | --- |
| `VAR_LENA_COFFEE` | Léna | « Moies drénken ech Kaffi. » → Le matin je bois du café. | Routine secondaire |
| `VAR_LENA_EARLY` | Léna | « Ech ginn moies fréi eraus. » → Je sors tôt le matin. | Activité matinale |
| `VAR_CLAIRE_TRAVEL` | Claire | « Ech reese gär. » → J'aime voyager. | Trait voyage |
| `VAR_CLAIRE_TIME` | Claire | « Um aacht Auer sinn ech do. » → Je serai là à huit heures. | Piège de ponctualité, contexte à valider |
| `VAR_NOEMIE_MUSIC` | Noémie | « Ech hunn Musek gär. » → J'aime la musique. | Trait musique |
| `VAR_NOEMIE_MORNING` | Noémie | « Moies drénken ech Kaffi. » → Je bois du café le matin. | Routine |
| `VAR_MAYA_LANG` | Maya | « Ech schwätzen Däitsch an Englesch. » → Je parle allemand et anglais. | Information Pro corroborée |
| `VAR_MAYA_READING` | Maya | « Ech liese gär. » → J'aime lire. | Trait secondaire |
| `VAR_SOFIA_EARLY` | Sofia | « Moies fueren ech gär mam Zuch. » → Le matin, j'aime prendre le train. | Voyage |
| `VAR_SOFIA_COFFEE` | Sofia | « Ech drénke gär Kaffi. » → J'aime boire du café. | Trait secondaire |
| `VAR_EMMA_READING` | Emma | « Owes liesen ech gär. » → Le soir, j'aime lire. | Lecture |
| `VAR_EMMA_TIME` | Emma | « Ech hunn owes Zäit. » → J'ai du temps le soir. | Horaires |

**Texte de préférence d'âge, seulement si tiré :** `PREF_AGE_INDIFFERENT` (Amis, FR : « L'âge ne m'intéresse pas beaucoup. Je préfère une conversation sympa. » ; LU nouveau à rédiger/valider), `PREF_AGE_SIMILAR` (FR : « Je préfère sortir avec quelqu'un à peu près de mon âge. » ; LU à rédiger/valider), `PREF_AGE_OLDER` / `PREF_AGE_YOUNGER` (FR : préférences entre adultes, LU à rédiger/valider). **Ne pas forcer une préférence d'âge dans les six fiches.**

**Trait rare « ex Alex » :** `PREF_EX_ALEX` (FR : « Mon ex s'appelait Alex. J'avoue, ça me fait encore un drôle d'effet d'entendre ce prénom. » ; LU à rédiger/valider). Ce post doit être **inséré publiquement avant le date** si et seulement si `dislikedFirstName=Alex` ; jamais caché, ni attribué à toutes les filles.

**Photos :** produire depuis le moteur 3D existant si possible des décors contextualisés, sinon une illustration cohérente. Une légende ne doit jamais décrire autre chose que ce qui est visible. Un personnage majeur apparaît toujours identique entre Tinder, Pix et la scène café.



---

## 6. Banque de scènes de conversation : 26 beats à sélectionner, jamais tous dans une date

Les 26 beats suivants **ne remplacent pas automatiquement les dialogues existants**. Ils constituent un pool d'**intentions et de textes candidats** avec identifiants uniques. Claude doit faire valider toute nouvelle ligne LU et intégrer les nœuds selon la section 13 de SPEC 109. **À_AUDITER par défaut** ; les phrases manifestement au-delà d'A1.1 sont `OPTIONNEL` ou affectées seulement aux réactions non notées.

**Notation de chaque réponse :** `L/V` luxembourgeois grammaticalement correct + sincère ; `L/M` langue correcte + bluff ; `L/B` langue correcte + blague ; `E` erreur pédagogique ou conversationnelle à examiner ; `L partenaire` est une **ligne prononcée par la partenaire**, pas une réponse sélectionnable par Alex. Les tags n'équivalent pas à une validation linguistique. Les effets sont des **intentions d'auteur**, les valeurs de jauges seront calibrées par Claude, **pas un score fixe imposé**.

**Garde spéciale :** `B04_AGE` doit afficher 3 propositions même pendant les deux premiers runs (nouvelle exception à la réduction à 2 choix prévue dans le moteur actuel). L'âge de 120 ans est une **plaisanterie contextuelle**, pas un vrai `claim.age=120` par défaut : sinon la blague rendrait absurdes les rappels. On peut mémoriser `ageJoke=120` séparément.


### B01_SALUT — A1 · L1

**Déclenchement :** tous. **Interlocutrice :** « Moien! Wéi geet et dir? » → *Salut ! Comment ça va ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP01_A` | « Mir geet et gutt, merci. An dir? » → *Je vais bien, merci. Et toi ?* | L/V | affinité+ |
| `REP01_B` | « Et geet. » → *Ça va.* | L/V | neutre |
| `REP01_C` | « Äddi! » → *Au revoir !* | E | réaction gênée; correction contextuelle |

### B02_SALUT_SOIR — A1 · L1

**Déclenchement :** date en soirée. **Interlocutrice :** « Gudden Owend! » → *Bonsoir !*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP02_A` | « Gudden Owend! » → *Bonsoir !* | L/V | affinité+ |
| `REP02_B` | « Moien! » → *Bonjour !* | L/V | neutre, registre plus simple |
| `REP02_C` | « Gudde Moien! » → *Bonjour ! (matin)* | E | décalage horaire comique |

### B03_NAME — A1 · L1

**Déclenchement :** Alex déjà présenté avant swipe. **Interlocutrice :** « Wéi heeschs du? » → *Comment t'appelles-tu ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP03_A` | « Ech heeschen Alex. » → *Je m'appelle Alex.* | L/V | claims.prenom=Alex |
| `REP03_B` | « Ech heeschen Max. » → *Je m'appelle Max.* | L/M | claims.prenom=Max; vérifier aux rappels |
| `REP03_C` | « Ech heeschen James Bond. » → *Je m'appelle James Bond.* | L/B | claims.prenom=James Bond; réaction selon humour |

### B04_AGE — A1 · L5,L14

**Déclenchement :** obligatoire si l'âge demandé; **3 choix quel que soit numéro de partie**. **Interlocutrice :** « Wéi al bass du? » → *Quel âge as-tu ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP04_A` | « Ech sinn aachtanzwanzeg Joer al. » → *J'ai 28 ans.* | L/V | claims.age=28 |
| `REP04_B` | « Ech sinn drësseg Joer al. » → *J'ai 30 ans.* | L/M | claims.age=30; préférence d'âge facultative |
| `REP04_C` | « Ech sinn honnertzwanzeg Joer al. » → *J'ai 120 ans.* | L/B | claims.age=120? NON: enregistrer « joke » sans prétendre faire croire durablement à 120; voir note |

### B05_ORIGIN — A2 · L7

**Déclenchement :** Alex vient de France. **Interlocutrice :** « Vu wou kënns du? » → *D'où viens-tu ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP05_A` | « Ech kommen aus Frankräich. » → *Je viens de France.* | L/V | claims.origin=Frankräich |
| `REP05_B` | « Ech kommen aus Portugal. » → *Je viens du Portugal.* | L/M | claims.origin=Portugal; Sofia → trap_portugal éligible |
| `REP05_C` | « Ech kommen aus Däitschland. » → *Je viens d'Allemagne.* | L/M | claims.origin=Däitschland; cohérence future |

### B06_CITY — A2 · L10

**Déclenchement :** Alex réside à Metz. **Interlocutrice :** « Wou wunns du? » → *Où habites-tu ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP06_A` | « Ech wunnen zu Metz. » → *J'habite à Metz.* | L/V | claims.city=Metz |
| `REP06_B` | « Ech wunnen zu Lëtzebuerg. » → *J'habite à Luxembourg-ville.* | L/M | claims.city=Lëtzebuerg |
| `REP06_C` | « Ech wunnen zu Esch. » → *J'habite à Esch.* | L/M | claims.city=Esch |

### B07_LANGUAGE — A2 · L9

**Déclenchement :** Alex ne parle que français comme fait canonique. **Interlocutrice :** « Wat fir eng Sprooch schwätz du? » → *Quelle langue parles-tu ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP07_A` | « Ech schwätzen Franséisch. » → *Je parle français.* | L/V | claims.language=Franséisch |
| `REP07_B` | « Ech schwätzen Portugisesch. » → *Je parle portugais.* | L/M | claims.language=Portugisesch; Sofia → gag possible |
| `REP07_C` | « Ech schwätzen Däitsch. » → *Je parle allemand.* | L/M | claims.language=Däitsch |

### B08_PROFESSION — A2 · L11

**Déclenchement :** Alex est banquier. **Interlocutrice :** « Wat schaffs du? » → *Que fais-tu comme travail ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP08_A` | « Ech sinn e Banker. » → *Je suis banquier.* | L/V | claims.job=Banker |
| `REP08_B` | « Ech sinn en Dokter. » → *Je suis médecin.* | L/M | claims.job=Dokter; Claire → piège possible |
| `REP08_C` | « Ech sinn e Polizist. » → *Je suis policier.* | L/M | claims.job=Polizist; rappel possible |

### B09_WORKPLACE — A2 · L11,L10

**Déclenchement :** Alex banquier, lieu de travail non défini → parler de secteur et non de ville. **Interlocutrice :** « Wou schaffs du? » → *Où travailles-tu ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP09_A` | « Ech schaffen an enger Bank. » → *Je travaille dans une banque.* | L/V | précision du métier |
| `REP09_B` | « Ech schaffen an engem Spidol. » → *Je travaille dans un hôpital.* | L/M | uniquement avec une couverture « médecin » cohérente ou nouvel aveu, sinon contradiction |
| `REP09_C` | « Ech schaffen doheem. » → *Je travaille de chez moi.* | L/? | non relié au persona : ne pas noter comme mensonge ou vérité tant que workMode absent |

### B10_FOOT — A2 · OPTIONNEL (loisir non noté)

**Déclenchement :** partenaire sportive ou foot, Alex ne joue pas au foot. **Interlocutrice :** « Spills du gär Fussball? » → *Tu aimes jouer au football ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP10_A` | « Nee, ech spille net gär Fussball. » → *Non, je n'aime pas jouer au football.* | L/V | réponse honnête, pas de pénalité automatique |
| `REP10_B` | « Jo, ech spille gär Fussball. » → *Oui, j'aime jouer au football.* | L/M | claims.football=true; défi sportif éligible |
| `REP10_C` | « Jo! Ech sinn de Messi! » → *Oui ! Je suis Messi !* | L/B | réaction comique ; pas d'usurpation réelle ni d'épreuve notée |

### B11_COFFEE — A2 · L16

**Déclenchement :** Alex boit du café le matin. **Interlocutrice :** « Drénks du moies Kaffi? » → *Tu bois du café le matin ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP11_A` | « Jo, ech drénke moies Kaffi. » → *Oui, je bois du café le matin.* | L/V | claims.morningCoffee=true |
| `REP11_B` | « Nee, ech drénke moies keen Kaffi. » → *Non, je ne bois pas de café le matin.* | L/M | claims.morningCoffee=false |
| `REP11_C` | « Kaffi! » → *Café !* | E pragmatique | phrase incomplète pour répondre naturellement ; pas nécessairement faute de lexique |

### B12_COFFEE_OFFER — A2 · L16

**Déclenchement :** la partenaire propose le café, pas de nouveau trait. **Interlocutrice :** « Drénks du Kaffi? » → *Tu bois du café ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP12_A` | « Jo, gär. » → *Oui, volontiers.* | L/V | réaction chaleureuse |
| `REP12_B` | « Jo, merci. » → *Oui, merci.* | L/V | neutre |
| `REP12_C` | « Nee, merci. » → *Non merci.* | L/V | neutre ; ce refus ponctuel ne modifie pas morningCoffee |

### B13_NATIONALITY — A2 · L8

**Déclenchement :** optionnel si cours débloqué, Alex français. **Interlocutrice :** « Wat fir eng Nationalitéit hues du? » → *Quelle est ta nationalité ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP13_A` | « Ech sinn e Fransous. » → *Je suis français.* | L/V | claims.nationality=Fransous |
| `REP13_B` | « Ech sinn e Portugis. » → *Je suis portugais.* | L/M | claims.nationality=Portugis; liée à l'origine si revendiquée |
| `REP13_C` | « Ech sinn e Lëtzebuerger. » → *Je suis luxembourgeois.* | L/M | claims.nationality=Lëtzebuerger; éviter incohérence automatique avec lieu de résidence |

### B14_TIME — A2 · L15

**Déclenchement :** définir une heure canonique de rendez-vous dans scenarioPlan : ex. 19:00, sinon ne pas jouer. **Interlocutrice :** « Um wéi vill Auer ass eise Rendez-vous? » → *À quelle heure est notre rendez-vous ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP14_A` | « Um siwen Auer. » → *À sept heures.* | L/V contextuel | date.time=19:00 à expliciter format 12/24 h |
| `REP14_B` | « Um aacht Auer. » → *À huit heures.* | L/M contextuel | si rendez-vous à 19h, erreur de mémoire, pas forcément mensonge |
| `REP14_C` | « Um hallwer aacht. » → *À sept heures et demie.* | L/M contextuel | forme de demi-heure à confirmer en contexte |

### B15_NAME_RECALL — A3 · L1

**Déclenchement :** si claims.prenom défini ; question déjà existante, ne pas poser si nom jamais déclaré. **Interlocutrice :** « Wéi heeschs du nach eng Kéier? » → *Tu t'appelles comment, déjà ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP15_A` | « Ech heeschen Alex. » → *Je m'appelle Alex.* | L/V ou contradiction | si prénom annoncé Max auparavant → contradiction sociale |
| `REP15_B` | « Ech heeschen Max. » → *Je m'appelle Max.* | L/M ou cohérence | si Max annoncé → maintient le mensonge |
| `REP15_C` | « Ech heeschen James Bond. » → *Je m'appelle James Bond.* | L/B | nouvelle plaisanterie, pas pénalité automatique de grammaire |

### B16_AGE_RECALL — A3 · L5,L14

**Déclenchement :** uniquement si une affirmation d'âge durable a été faite. **Interlocutrice :** « Wéi al bass du nach eng Kéier? » → *Tu as quel âge, déjà ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP16_A` | « Ech sinn aachtanzwanzeg Joer al. » → *J'ai 28 ans.* | L/V conditionnel | cohérent si claim=28 ; sinon contradiction |
| `REP16_B` | « Ech sinn drësseg Joer al. » → *J'ai 30 ans.* | L/M conditionnel | cohérent si claim=30 ; sinon contradiction |
| `REP16_C` | « Dat war e Witz! » → *C'était une blague !* | L/B | réparation si ageJoke=120 ; LU à auditer |

### B17_CITY_RECALL — A3 · L10

**Déclenchement :** si claims.city. **Interlocutrice :** « Wou wunns du nach eng Kéier? » → *Tu habites où, déjà ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP17_A` | « Ech wunnen zu Metz. » → *J'habite à Metz.* | L/V conditionnel | vrai mais contradiction si claim antérieur différent |
| `REP17_B` | « Ech wunnen zu Lëtzebuerg. » → *J'habite au Luxembourg.* | L/M conditionnel | cohérent seulement si déclaré auparavant |
| `REP17_C` | « Ech wunnen zu Esch. » → *J'habite à Esch.* | L/M conditionnel | cohérent seulement si déclaré auparavant |

### B18_END — A3 · L1

**Déclenchement :** obligatoire, fin d'échange. **Interlocutrice :** « Äddi! » → *Au revoir !*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP18_A` | « Äddi! » → *Au revoir !* | L/V | fin polie |
| `REP18_B` | « Schéinen Owend nach! » → *Bonne soirée !* | L/V | si date en soirée |
| `REP18_C` | « Moien! » → *Bonjour !* | E pragmatique | salutation de début au moment du départ |

### B19_PARTNER_NAME — A2 · L1

**Déclenchement :** question posée par Alex à une fille dont il connait déjà le prénom ; intention : attention à l'autre. **Interlocutrice :** « Wéi heeschs du? » → *Comment tu t'appelles ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP19_A` | « Wéi geet et dir? » → *Comment vas-tu ?* | L/V | ouvre une réponse sur l'humeur plutôt que redemander un prénom connu |
| `REP19_B` | « Wou wunns du? » → *Où habites-tu ?* | L/V | demande cohérente avec le profil |
| `REP19_C` | « Wéi heeschs du? » → *Comment tu t'appelles ?* | L/B ou maladroit | elle rappelle son prénom, selon humour |

### B20_PARTNER_CITY — A2 · L10

**Déclenchement :** si le joueur choisit de s'intéresser à elle. **Interlocutrice :** « Wou wunns du? » → *Où habites-tu ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP20_A` | « Ech wunnen zu Metz. » → *J'habite à Metz.* | L partenaire | réplique fournie par Sofia/Léna seulement ; source canonique du profil |
| `REP20_B` | « Ech wunnen zu Lëtzebuerg. » → *J'habite au Luxembourg.* | L partenaire | réplique fournie par Emma/Claire seulement |
| `REP20_C` | « Ech wunnen zu Esch. » → *J'habite à Esch.* | L partenaire | réplique fournie par Noémie seulement |

### B21_ASK_HER — A2 · L1,L10,L11

**Déclenchement :** nouveau type de nœud : Alex choisit quelle question POSER, aucune question fausse. **Interlocutrice :** « Elo bass du drun! » → *À toi de poser une question !*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP21_A` | « Wou wunns du? » → *Où habites-tu ?* | L | elle répond par la ville canonique |
| `REP21_B` | « Wat schaffs du? » → *Quel est ton métier ?* | L | elle répond par la profession canonique, variante validée |
| `REP21_C` | « Wéi al bass du? » → *Quel âge as-tu ?* | L | elle répond par l'âge canonique, peut être jugé indiscret selon trait visible |

### B22_ASK_HER_LANG — A2 · L9

**Déclenchement :** si langue connue du profil via Pro. **Interlocutrice :** « Schwätz du Portugisesch? » → *Tu parles portugais ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP22_A` | « Jo, ech schwätzen Portugisesch. » → *Oui, je parle portugais.* | L partenaire | Sofia seulement |
| `REP22_B` | « Nee, ech schwätzen Franséisch. » → *Non, je parle français.* | L partenaire | autre profil si français et pas portugais |
| `REP22_C` | « Jo, ech schwätzen Englesch. » → *Oui, je parle anglais.* | L partenaire | profil concerné selon Pro |

### B23_STYLE_REACTION — A1 · L3/L4 + OPTIONNEL

**Déclenchement :** si préférence vestimentaire publique révélée ; première impression. **Interlocutrice :** « Deng Faarf ass schéin! » → *Ta couleur est jolie !*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP23_A` | « Merci! » → *Merci !* | L | réaction naturelle |
| `REP23_B` | « Gutt! » → *Bien !* | L | court |
| `REP23_C` | « Deng Faarf ass och schéin. » → *Ta couleur est jolie aussi.* | L | sous réserve de sens et contexte LU audité |

### B24_TOMORROW — A3 · L15/L16

**Déclenchement :** fin positive, propose un autre RDV ; pas de vraie planification ni agenda. **Interlocutrice :** « Hues du muer Zäit? » → *Tu as du temps demain ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP24_A` | « Jo, gär! » → *Oui, volontiers !* | L | fin enthousiaste |
| `REP24_B` | « Nee, leider net. » → *Non, malheureusement.* | L | fin polie |
| `REP24_C` | « Dat weess ech nach net. » → *Je ne sais pas encore.* | L | fin neutre ; formulation LU à auditer |

### B25_TRUTH_REPAIR — A3 · L1 + OPTIONNEL

**Déclenchement :** après mensonge démasqué ou révélateur d'un gag, réparation narrative. **Interlocutrice :** « Ass dat wouer? » → *C'est vrai ?*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP25_A` | « Nee, dat war e Witz. » → *Non, c'était une blague.* | L/B | peut calmer si gag volontaire |
| `REP25_B` | « Entschëllegt, ech hu gelunn. » → *Pardon, j'ai menti.* | L/V | aveu restaure un peu la confiance, LU à auditer |
| `REP25_C` | « Jo. » → *Oui.* | L/M selon claim | maintient le bluff, pas d'effet automatique |

### B26_DATE_FAREWELL — A3 · L1

**Déclenchement :** réutiliser en petite variante de fin. **Interlocutrice :** « Et war flott! » → *C'était sympa !*.

| Choix | Réponse LU → FR | Type | Conséquence / mémoire |
| --- | --- | --- | --- |
| `REP26_A` | « Merci, et war flott. » → *Merci, c'était sympa.* | L | conclusion chaleureuse |
| `REP26_B` | « Äddi! » → *Au revoir !* | L | court, poli |
| `REP26_C` | « Bis geschwënn! » → *À bientôt !* | L | positif, ne pas promettre une suite si affinité insuffisante |


### 6.27. Conditions de montage et indications d'animation

- **Acte 1** : 1 salutation (B01 ou B02), B03 prénom OU une autre présentation, B04 âge si choisi. Jamais deux « bonjour » successifs. Un éventuel trait prénom/âge doit être signalé avant le date dans Amis.
- **Acte 2** : 3–4 beats parmi B05 (origine), B06 (ville), B07 (langues), B08 (métier), B09 (travail), B10 (football), B11/B12 (café), B13 (nationalité), B14 (heure), B21 (Alex questionne la partenaire). Diversifier les sujets, ne pas poser deux fois la même question.
- **Acte 3** : 0–1 piège conditionnel, 0–1 rappel (B15–B17), 1 clôture B18 ou B26. Éviter le piège et le rappel sur le même attribut dans la même minute.
- **Question d'Alex à une fille :** B21 est un **type différent** : Alex choisit une question, la partenaire répond avec ses informations canonique. B20/B22 sont des **réponses de PNJ conditionnelles**, qui ne doivent jamais apparaître comme trois choix parmi lesquels le joueur sélectionne ce que l'autre dit. Si le core ne sait pas gérer ce type, **ne pas intégrer le beat tant qu'il n'est pas implémenté**.
- **Réactions sous-titrées** : une phrase douce → sourire/hochement ; une compatibilité → rire discret ; une contradiction → regard soupçonneux ; seule une gaffe rare autorise zoom/dramatic scratch. Ne pas jouer une animation « Victory » à chaque bonne réponse.
- **Refus du téléphone / correction** : texte et score d'apprentissage restent indépendants des conséquences sociales. La batterie ne doit jamais se décharger sur l'écran de rappel « Moi ».

### 6.28. Phrases à ne PAS publier sans correction

- **B14 heure** : « Um siwen Auer » peut signifier 7 h OU 19 h selon contexte ; pour une échéance explicite à 19 h, **prévoir une formulation non ambiguë validée** ou cadrer clairement « ce soir » ; sinon neutraliser B14.
- **B20/B22** : ce sont des **réponses de PNJ** et non des choix de réponse. Le contrat doit préserver le locuteur.
- **B09_WORKPLACE** : le persona Alex n'indique pas où il travaille exactement ; une réponse « doheem » ne peut pas être qualifiée d'honnête ou de mensonge sans étoffer le persona.
- **B24/B25** : expressions plus avancées ; hors progression A1.1 si non enseignées, utilisables uniquement avec une traduction visible et `pedagogicalScoring=false`.
- **Age 120** : orthographe « honnertzwanzeg » est **à vérifier** malgré sa construction lexicale plausible ; si non validée, ne pas l'utiliser comme distracteur pédagogique.
- **Prénom « James Bond »** : blague, nom de personnage de fiction en réplique courte ; ne pas en faire un visage, une image, une citation ou un atout officiel et éviter toute représentation de marque sous licence.



---

## 7. Événements dialogués et gags — 14 fiches conditionnelles

**État : À_AUDITER pour toute réplique LU nouvelle.** Aucun événement n'est ajouté automatiquement : conditions + trait public + conséquence. Maximum deux par date dont un grand gag visuel. Les réponses en portugais sont une blague et ne sont pas notées comme luxembourgeois.

### EV_LENA_FOOT · Léna

**Déclenchement :** mensonge confirmé football=true ; sport présent dans son profil.

**Réplique LU candidate :** « Du spills gär Fussball? Super, da komm, mir spillen! » → *Tu joues au foot ? Viens, on fait trois passes !*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_LENA_FOOT_C1` (Accepter) | « Jo, gär! » → *Oui, avec plaisir !* | Alex rate un ballon à deux mètres, elle rit. |
| `EV_LENA_FOOT_C2` (Avouer) | « Nee, ech spillen net gär Fussball. » → *Non, en fait je n'aime pas le foot.* | Elle apprécie un aveu un peu tardif. |
| `EV_LENA_FOOT_C3` (Fanfarons) | « Ech sinn de Messi! » → *Je suis Messi !* | Elle le met au défi avec un sourire incrédule. |

**Mise en scène / garde-fou :** Ballon et animation courte ; pas de vrai mini-jeu ; pas de score de football.

### EV_LENA_MORNING · Léna

**Déclenchement :** trait secondaire matinale présent sur Amis ; L16.

**Réplique LU candidate :** « Wat méchs du moies? » → *Tu fais quoi le matin ?*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_LENA_MORNING_C1` (Café) | « Moies drénken ech Kaffi. » → *Le matin je bois du café.* | Elle répond que ce n'est pas vraiment un échauffement. |
| `EV_LENA_MORNING_C2` (Courir) | « Moies ginn ech lafen. » → *Je vais courir le matin.* | Bluff de routine, à pouvoir rappeler si joueur ment. |
| `EV_LENA_MORNING_C3` (Travail) | « Ech ginn op d'Aarbecht. » → *Je pars au travail.* | Réponse sincère si emploi compatible, pas de malus. |

**Mise en scène / garde-fou :** Rebondir sur routine, sans imposer une activité hors programme.

### EV_CLAIRE_JOB · Claire

**Déclenchement :** Alex s'est faussement présenté comme Dokter.

**Réplique LU candidate :** « Du bass Dokter? Wou schaffs du? » → *Tu es médecin ? Tu travailles où ?*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_CLAIRE_JOB_C1` (Bluff) | « Ech schaffen am Spidol. » → *Je travaille à l'hôpital.* | Elle interroge d'un sourcil levé. Pas de quiz médical. |
| `EV_CLAIRE_JOB_C2` (Aveu) | « Nee, ech sinn e Banker. » → *Non, en fait je suis banquier.* | Elle sourit : « Pourquoi m'inventer un hôpital ? » |
| `EV_CLAIRE_JOB_C3` (Blague) | « Dat war e Witz! » → *C'était une blague !* | Elle trouve le sens de l'humour très discutable. |

**Mise en scène / garde-fou :** Zoom subtil/silence ; aucune profession supposée supérieure.

### EV_CLAIRE_TIME · Claire

**Déclenchement :** horaire canonique et post de ponctualité activés ; L15.

**Réplique LU candidate :** « Um wéi vill Auer ass eise Rendez-vous? » → *Notre rendez-vous, c'était à quelle heure ?*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_CLAIRE_TIME_C1` (À l'heure) | « Um siwen Auer. » → *À sept heures.* | Bon si scénario indique 19 h ce soir et contexte explicite. |
| `EV_CLAIRE_TIME_C2` (En retard) | « Um aacht Auer. » → *À huit heures.* | Elle pointe son agenda : « Tu fais ton propre fuseau ? » |
| `EV_CLAIRE_TIME_C3` (Demi-heure) | « Um hallwer aacht. » → *À sept heures et demie.* | Elle sourit jaune : il est toujours 19 h. |

**Mise en scène / garde-fou :** Visuel agenda, 7h/19h à lever par contexte, pas de devinette illégitime.

### EV_NOEMIE_DRAW · Noémie

**Déclenchement :** Alex a affirmé savoir dessiner sans le savoir.

**Réplique LU candidate :** « Kanns du mech molen? » → *Tu peux me dessiner ?*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_NOEMIE_DRAW_C1` (Essayer) | « Jo, gär! » → *Oui, volontiers.* | Portrait en patate, elle explose de rire. |
| `EV_NOEMIE_DRAW_C2` (Avouer) | « Nee, ech kann net molen. » → *Non, je ne sais pas dessiner.* | Elle lui passe quand même le crayon. |
| `EV_NOEMIE_DRAW_C3` (Blague) | « Dat ass Konscht! » → *C'est de l'art !* | Elle contemple le gribouillis et fait une critique ironique. |

**Mise en scène / garde-fou :** Dessin sur une serviette, événement non noté artistiquement.

### EV_NOEMIE_COLOR · Noémie

**Déclenchement :** préférence créatif/rouge déclarée, look choisi.

**Réplique LU candidate :** « Ech hu gär Faarwen! » → *J'aime les couleurs !*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_NOEMIE_COLOR_C1` (Poli) | « Merci! » → *Merci !* | Si look rouge créatif, elle remarque ton effort. |
| `EV_NOEMIE_COLOR_C2` (Complice) | « Rout ass meng Liiblingsfaarf. » → *Le rouge est ma couleur préférée.* | Elle apprécie, sans nouveau mensonge déterminé automatiquement. |
| `EV_NOEMIE_COLOR_C3` (Absurde) | « Ech sinn eng Konschtfigur! » → *Je suis une œuvre d'art !* | Elle rit si elle aime l'humour absurde. |

**Mise en scène / garde-fou :** Petite réaction de première impression, pas de note de peinture.

### EV_MAYA_RETRO · Maya

**Déclenchement :** Alex a bluffé aimer les jeux rétro.

**Réplique LU candidate :** « Du spills gär Computerspiller? Da probéier dat! » → *Tu aimes jouer aux jeux vidéo ? Essaye ma console !*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_MAYA_RETRO_C1` (Essayer) | « Jo! » → *Oui !* | Il perd en quatre secondes, elle lui propose la revanche. |
| `EV_MAYA_RETRO_C2` (Honnête) | « Nee, ech kennen dat Spill net. » → *Non, je ne connais pas ce jeu.* | Elle est ravie de le lui faire découvrir. |
| `EV_MAYA_RETRO_C3` (Bluff total) | « Ech sinn de Champion! » → *Je suis le champion !* | Défaite comique immédiate. |

**Mise en scène / garde-fou :** Petit accessoire console en scène café ; aucune nouvelle mécanique.

### EV_MAYA_GERMAN · Maya

**Déclenchement :** Alex affirme faussement parler allemand ; Pro indique que Maya le parle.

**Réplique LU candidate :** « Du schwätz Däitsch? Super! » → *Tu parles allemand ? Super !*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_MAYA_GERMAN_C1` (Rectifier) | « Ech schwätzen net Däitsch. » → *En fait je ne parle pas allemand.* | Elle rit : « Tu fais aussi des CV mensongers ? » |
| `EV_MAYA_GERMAN_C2` (Revenir au réel) | « Ech schwätzen Franséisch. » → *Je parle français.* | Réaction détendue. |
| `EV_MAYA_GERMAN_C3` (Continuer) | « Jo, ech schwätzen Däitsch. » → *Oui, je parle allemand.* | Elle garde un doute ; aucun quiz d'allemand noté. |

**Mise en scène / garde-fou :** Question de cohérence, pas de test hors luxembourgeois.

### EV_SOFIA_PORTUGAL · Sofia

**Déclenchement :** mensonge sur origin=Portugal OU language=Portugisesch (au plus une fois).

**Réplique LU candidate :** « Du kënns aus Portugal? Wat fir en Déier sinn ech? Op Portugisesch! » → *Tu viens du Portugal ? Alors à quel animal je ressemble en portugais ?*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_SOFIA_PORTUGAL_C1` (Vache) | « Vaca » → *Vache* | « UNE VACHE ?! » Disque rayé, grand silence. |
| `EV_SOFIA_PORTUGAL_C2` (Hippopotame) | « Hipopótamo » → *Hippopotame* | « UN HIPPOPOTAME ?! » Zoom dramatique. |
| `EV_SOFIA_PORTUGAL_C3` (Chatte animale) | « Gata » → *Chatte, animal femelle* | « Un chat ? C'est mignon ! » |
| `EV_SOFIA_PORTUGAL_C4` (Aveu) | « Ech schwätzen net Portugisesch. » → *En fait je ne parle pas portugais.* | Elle rit et accepte l'aveu, confiance restaurée. |

**Mise en scène / garde-fou :** Gag non noté PT, aveu toujours disponible, relecture portugaise requise.

### EV_SOFIA_TRAIN · Sofia

**Déclenchement :** billet avec horaire véritable indiqué sur Pix, L15 débloquée.

**Réplique LU candidate :** « Um wéi vill Auer fiert den Zuch? » → *À quelle heure part le train ?*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_SOFIA_TRAIN_C1` (7 h) | « Um siwen Auer. » → *À sept heures.* | Correct seulement si billet 07:00 ou situation équivalente. |
| `EV_SOFIA_TRAIN_C2` (7 h 30) | « Um hallwer aacht. » → *À sept heures et demie.* | Correct seulement si billet 07:30. |
| `EV_SOFIA_TRAIN_C3` (8 h) | « Um aacht Auer. » → *À huit heures.* | Correct seulement si billet 08:00. |

**Mise en scène / garde-fou :** Épreuve de mémoire/heure contextuelle, pas de bonus si billet inaccessible.

### EV_EMMA_PHONE · Emma

**Déclenchement :** trait anti_phone + post public + téléphone ouvert pendant le date.

**Réplique LU candidate :** « Bass du ëmmer um Handy? » → *Tu es toujours sur ton téléphone ?*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_EMMA_PHONE_C1` (Ranger) | « Entschëllegt. Ech leeën den Handy ewech. » → *Pardon, je range le téléphone.* | Elle reprend calmement la discussion. |
| `EV_EMMA_PHONE_C2` (Minimiser) | « Ech kucken just kuerz. » → *Je regarde juste un instant.* | Elle attend en silence, affinité modérément réduite. |
| `EV_EMMA_PHONE_C3` (Mauvaise idée) | « Jo. » → *Oui.* | Elle regarde sa montre sans rien dire. |

**Mise en scène / garde-fou :** Déclenché une seule fois par consultation ; pas de double malus par frame.

### EV_EMMA_COFFEE · Emma

**Déclenchement :** partenaire aime café, Alex aussi ; L16.

**Réplique LU candidate :** « Drénks du moies Kaffi? » → *Tu bois du café le matin ?*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_EMMA_COFFEE_C1` (Vérité) | « Jo, ech drénke moies Kaffi. » → *Oui, je bois du café le matin.* | Elle sourit, point commun. |
| `EV_EMMA_COFFEE_C2` (Mentir) | « Nee, ech drénke moies kee Kaffi. » → *Non, je n'en bois pas.* | Possible rappel de routine plus tard. |
| `EV_EMMA_COFFEE_C3` (Absurde) | « Ech sinn e Kaffi! » → *Je suis un café !* | Selon humour, rire ou long silence. |

**Mise en scène / garde-fou :** Blague absurde correct LU à auditer, ne pas sanctionner en langue.

### EV_EX_ALEX · Tous, trait rare

**Déclenchement :** dislikedFirstName=Alex + indice Amis visible AVANT date + prenom annoncé.

**Réplique LU candidate :** « Alex? Mäin Ex huet och Alex geheescht. » → *Alex ? Mon ex s'appelait Alex. Quelle coïncidence…*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_EX_ALEX_C1` (Vrai) | « Ech heeschen Alex. » → *Je m'appelle Alex.* | Elle souffle : « Bon, tu n'es pas lui. » |
| `EV_EX_ALEX_C2` (Bluffer) | « Ech heeschen Max. » → *Je m'appelle Max.* | Mensonge mémorisé ; rappel prénom possible. |
| `EV_EX_ALEX_C3` (Absurde) | « Ech heeschen James Bond. » → *Je m'appelle James Bond.* | Une réaction humoristique selon tempérament. |

**Mise en scène / garde-fou :** Rare, jamais échec automatique ; ne pas traiter un vécu traumatique comme gag.

### EV_AGE_PREF · Tous, trait optionnel

**Déclenchement :** agePreference tirée ET indice Amis, jamais pour indifférente.

**Réplique LU candidate :** « Du bass drësseg? Interessant! » → *Ah, tu as trente ans ? Intéressant.*.

| Choix | Texte LU / PT → FR | Réaction FR_JEU |
|---|---|---|
| `EV_AGE_PREF_C1` (Assumer) | « Jo. » → *Oui.* | Effet seulement si la préférence existe et a été annoncée. |
| `EV_AGE_PREF_C2` (Rétablir 28) | « Ech sinn aachtanzwanzeg Joer al. » → *En fait, j'ai vingt-huit ans.* | Réparation d'un mensonge, baisse éventuelle de suspicion. |
| `EV_AGE_PREF_C3` (Plaisanter) | « Dat war e Witz! » → *C'était une blague !* | Si âge absurde 120, traiter la réponse comme plaisanterie, pas vraie identité. |

**Mise en scène / garde-fou :** Préférence nulle pour certaines partenaires ; aucune discrimination arbitraire.


### 7.1. Ordre de déclenchement

- Un événement lié à un mensonge doit être introduit **après** le choix qui crée `claims` / `mensonges`, et jamais deux fois.
- Les événements anti-téléphone et prénom rare sont **publics avant le date**. Si le trait n'a pas été publié dans le scénario courant, ne pas le sélectionner.
- Les événements de vérification hors programme (dessin, gaming, animal portugais) sont narratifs, `pedagogicalScoring=false`, et ne diminuent jamais le score LU.
- Si l'âge « 120 ans » était une plaisanterie, stocker `joke.age=120` plutôt que `claims.age=120`, à moins que le joueur ne réaffirme réellement ce mensonge en contexte.
- La scène au café n'est **jamais remplacée** : console, serviette, agenda, ballon imaginaire peuvent être des accessoires ou animations très courts.



---

## 8. Conclusions personnalisées — 24 textes FR_JEU

Ces textes n'évaluent **jamais** la qualité du luxembourgeois. Les quatre issues sont SUCCESS (affinité haute, faible suspicion), FUN (gag réellement survenu, ambiance positive), NEUTRAL (pas d'alchimie), FAIL (mensonges découverts et forte suspicion). **Vérifier le fait vécu** avant de sélectionner la fin : la vache de Sofia n'est pas évoquée si le gag portugais n'a pas été déclenché.

### LENA

| ID | Texte final |
|---|---|
| `FIN_LENA_SUCCESS` | « J'aime les gens qui tiennent parole. Un autre café après un match ? » |
| `FIN_LENA_FUN` | « Tu as raté le ballon de trois mètres. C'était magnifique. Je veux une revanche. » |
| `FIN_LENA_NEUTRAL` | « On n'a pas les mêmes passions, mais j'ai aimé discuter. » |
| `FIN_LENA_FAIL` | « Tu as juré aimer le foot, puis tu as changé d'histoire trois fois. Ça fait beaucoup ! » |

### CLAIRE

| ID | Texte final |
|---|---|
| `FIN_CLAIRE_SUCCESS` | « Tu es ponctuel et intéressant. Je note un deuxième rendez-vous ? » |
| `FIN_CLAIRE_FUN` | « J'ai trois métiers différents dans mon agenda. Lequel est le vrai ? » |
| `FIN_CLAIRE_NEUTRAL` | « La conversation était agréable, mais je crois qu'on cherche autre chose. » |
| `FIN_CLAIRE_FAIL` | « Médecin, banquier, policier… Je vais avoir besoin d'un CV plus clair. » |

### NOEMIE

| ID | Texte final |
|---|---|
| `FIN_NOEMIE_SUCCESS` | « J'aime les gens qui assument leurs goûts. Un autre café ? » |
| `FIN_NOEMIE_FUN` | « J'ai gardé ton portrait sur serviette. Il est atroce. Je l'adore. » |
| `FIN_NOEMIE_NEUTRAL` | « On a passé un moment sympa, sans déclic. » |
| `FIN_NOEMIE_FAIL` | « Tu as affirmé être peintre, puis tu as fui devant un crayon. Dommage. » |

### MAYA

| ID | Texte final |
|---|---|
| `FIN_MAYA_SUCCESS` | « Une belle partie, sans triche. J'accepte une deuxième manche. » |
| `FIN_MAYA_FUN` | « Tu as perdu au premier niveau mais tu m'as fait rire. Bien joué. » |
| `FIN_MAYA_NEUTRAL` | « On ne joue pas dans la même équipe, mais c'était agréable. » |
| `FIN_MAYA_FAIL` | « Tu prétends tout connaître, mais ton histoire change à chaque question. Game over. » |

### SOFIA

| ID | Texte final |
|---|---|
| `FIN_SOFIA_SUCCESS` | « Merci pour cette soirée. Raconte-moi ta prochaine destination au prochain café ! » |
| `FIN_SOFIA_FUN` | « La vache en portugais… Je m'en souviendrai longtemps. J'ai quand même bien ri. » |
| `FIN_SOFIA_NEUTRAL` | « Nos routes se croisent ici. Bon voyage ! » |
| `FIN_SOFIA_FAIL` | « Portugal, France, Allemagne… je ne sais plus du tout d'où tu viens. » |

### EMMA

| ID | Texte final |
|---|---|
| `FIN_EMMA_SUCCESS` | « Parler sans écran, ça fait du bien. On reprend un café ensemble ? » |
| `FIN_EMMA_FUN` | « Ton téléphone est mort avant le rendez-vous. Au moins, il nous a laissés tranquilles ! » |
| `FIN_EMMA_NEUTRAL` | « C'était calme et agréable, mais je ne crois pas qu'on se reverra. » |
| `FIN_EMMA_FAIL` | « J'aurais préféré discuter avec toi plutôt qu'avec ton téléphone. » |

### Règle d'éligibilité et fallback

Le texte FUN peut être affiché seulement si l'événement correspondant figure dans l'historique. Si un autre gag a eu lieu, écrire une variante supplémentaire du même profil **ou** utiliser l'issue générique du jeu : ne jamais inventer rétrospectivement ce que le joueur a fait. Une issue FAIL ne peut pas se conclure sur une déclaration de nouveau rendez-vous.

---

## 9. Réactions de personnalité (30 répliques FR_JEU)

Répliques de commentaire social français, distinctes du dialogue LU enseigné. Pour en faire des lignes orales luxembourgeoises, **écrire une traduction complète, puis la faire auditer**. Réactions 3D sobres (sourire, hochement, haussement de sourcil) ; animations spectaculaires réservées aux pièges rares.

| Ligne | Contexte | Réplique |
|---|---|---|
| `REACT_LENA_LOOK_OK` | LOOK_OK | « Ah, du bleu et des baskets ! » |
| `REACT_LENA_LOOK_DIFFERENT` | LOOK_DIFFERENT | « Tu viens courir en costume ? Ambitieux. » |
| `REACT_LENA_BLUFF` | BLUFF | « Tu joues au foot ? Je note ! » |
| `REACT_LENA_AVEU` | AVEU | « Bon, au moins tu ne mens plus sur ton niveau. » |
| `REACT_LENA_SINCERE` | SINCERE | « Pas besoin d'aimer le foot pour être sympa. » |
| `REACT_CLAIRE_LOOK_OK` | LOOK_OK | « C'est soigné. J'aime bien. » |
| `REACT_CLAIRE_LOOK_DIFFERENT` | LOOK_DIFFERENT | « C'est… original pour un rendez-vous. » |
| `REACT_CLAIRE_BLUFF` | BLUFF | « Ah bon ? Et tu fais ça depuis quand ? » |
| `REACT_CLAIRE_AVEU` | AVEU | « Merci pour la précision. C'est mieux. » |
| `REACT_CLAIRE_SINCERE` | SINCERE | « Au moins, ta réponse est claire. » |
| `REACT_NOEMIE_LOOK_OK` | LOOK_OK | « Cette couleur te va bien ! » |
| `REACT_NOEMIE_LOOK_DIFFERENT` | LOOK_DIFFERENT | « Tu as choisi la sobriété. C'est un concept aussi. » |
| `REACT_NOEMIE_BLUFF` | BLUFF | « Sérieux ? Il faut que tu me montres ! » |
| `REACT_NOEMIE_AVEU` | AVEU | « La vérité, c'est aussi de l'art. » |
| `REACT_NOEMIE_SINCERE` | SINCERE | « J'aime les gens qui ont leurs propres goûts. » |
| `REACT_MAYA_LOOK_OK` | LOOK_OK | « Style validé. +1 en charisme. » |
| `REACT_MAYA_LOOK_DIFFERENT` | LOOK_DIFFERENT | « Cette tenue est tirée au hasard, non ? » |
| `REACT_MAYA_BLUFF` | BLUFF | « Ah oui ? Alors on va voir ça ! » |
| `REACT_MAYA_AVEU` | AVEU | « Pas grave, on apprend tous au niveau un. » |
| `REACT_MAYA_SINCERE` | SINCERE | « Tu ne bluffes pas. C'est rare, ça. » |
| `REACT_SOFIA_LOOK_OK` | LOOK_OK | « J'adore cette couleur. Bon début. » |
| `REACT_SOFIA_LOOK_DIFFERENT` | LOOK_DIFFERENT | « Tu voyages toujours dans cette tenue ? » |
| `REACT_SOFIA_BLUFF` | BLUFF | « Vraiment ? Je veux tout savoir ! » |
| `REACT_SOFIA_AVEU` | AVEU | « Au moins, maintenant on se comprend. » |
| `REACT_SOFIA_SINCERE` | SINCERE | « Super. Et tu aimes voyager ? » |
| `REACT_EMMA_LOOK_OK` | LOOK_OK | « Ça te va bien. Simple, j'aime. » |
| `REACT_EMMA_LOOK_DIFFERENT` | LOOK_DIFFERENT | « Tu t'es beaucoup préparé, non ? » |
| `REACT_EMMA_BLUFF` | BLUFF | « Hm. Tu es sûr de toi ? » |
| `REACT_EMMA_AVEU` | AVEU | « Merci. Je préfère ça. » |
| `REACT_EMMA_SINCERE` | SINCERE | « On peut juste discuter, tu sais. » |

---

## 10. Douze parcours pilotes pour le compositeur procédural

Montages **indicatifs**, non scripts imposés ; garantir 6–8 tours principaux, ≤2 événements et toutes les préconditions. Les identifiants B_DRAW / B_GAMING sont des beats **à écrire et à auditer** avant leur intégration : ne surtout pas réutiliser B10 (football) pour tester le dessin ou le gaming.

| Plan | Profil | Séquence indicative | Particularité |
|---|---|---|---|
| `P01` | Léna | `B01 B03 B10 EV_LENA_FOOT B06 B15 B18` | mensonge football → gaffe ou aveu |
| `P02` | Léna | `B02 B03 B11 EV_LENA_MORNING B05 B21 B18` | routine matinale → pas de bluff imposé |
| `P03` | Claire | `B02 B03 B08 EV_CLAIRE_JOB B06 B17 B18` | faux métier → contrôle cohérent |
| `P04` | Claire | `B01 B03 B04 B14 EV_CLAIRE_TIME B07 B18` | horaire public → rappel d'heure |
| `P05` | Noémie | `B01 B03 B06 B_DRAW EV_NOEMIE_DRAW B07 B18` | dessin, futur beat spécifique B_DRAW requis |
| `P06` | Noémie | `B02 B03 B05 B12 EV_NOEMIE_COLOR B21 B18` | couleur/look et café |
| `P07` | Maya | `B01 B03 B07 B_GAMING EV_MAYA_RETRO B05 B18` | console, futur beat spécifique B_GAMING requis |
| `P08` | Maya | `B02 B03 B07 EV_MAYA_GERMAN B06 B21 B18` | bluff sur l'allemand, hors score allemand |
| `P09` | Sofia | `B02 B03 B05 EV_SOFIA_PORTUGAL B07 B15 B18` | mensonge Portugal → chat/vache/aveu |
| `P10` | Sofia | `B01 B03 B06 B14 EV_SOFIA_TRAIN B21 B18` | horaire de train, indice Pix obligatoire |
| `P11` | Emma | `B01 B03 B11 B06 EV_EMMA_PHONE B15 B18` | téléphone consulté et trait déclaré |
| `P12` | Emma | `B02 B03 B11 EV_EMMA_COFFEE B07 B21 B18` | conversation détendue sans téléphone |

Les deux parcours horaires sont invalides tant qu'une heure non ambiguë n'est pas visible et vérifiée ; le plan d'Emma anti-téléphone ne doit pas déclencher si Alex n'ouvre pas son téléphone. Une même partenaire peut avoir un rendez-vous **sans grand événement**, ce qui fait partie de la variété.
