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

