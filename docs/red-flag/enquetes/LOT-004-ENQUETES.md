# RED FLAG — Lot éditorial 004 : concert, famille, réservation

**Statut : conception FR rédigée ; non validée, non implémentée.** Branche `2.1`. Sélection : [SELECTION-50.md](../SELECTION-50.md). Règles : [MATRICE-PREUVES.md](../MATRICE-PREUVES.md), [FICHE-PERSONNAGE.md](../FICHE-PERSONNAGE.md), [SPEC 110](../specs/SPEC-110.md). Toutes les personnes, organisations, adresses, dates de manifestations et pièces sont **fictives**. Aucune preuve n'est tirée de données privées réelles. Pas de LU inventé sans vérification LOD/grammaire. Les trois cas sont indépendants et ne modifient pas les affaires existantes.

## RF-08-12 — « J'étais au concert »

**Personnage.** Robin, 27 ans, Esch-sur-Alzette ; amateur de musique, très désireux de partager les goûts de son rendez-vous. Archétype : le fan opportuniste. Trait attachant : il connaît réellement les chansons, mais pas l'événement. Ton : comédie légère. **Portrait PS1 :** veste de concert, badges colorés, devant une salle de spectacle sous la pluie. **Bio Cringr :** « Musique live, petits concerts, grandes émotions. » **Objectif pédagogique A1 :** hier, vendredi, concert, aller, être, lieu, heures ; reconnaître une date et un lieu.

**Déclaration FR (P).** « Vendredi dernier, j'étais au concert du groupe fictif Les Étoiles Bleues à la salle Nova de Luxembourg. Je les ai vus jouer sur scène. »

**Question de précision.** « Tu parles du vendredi 16 octobre 2026, du concert public à la salle Nova, et tu étais bien dans la salle pendant leur prestation ? »

**Réponse engageante.** « Oui, vendredi 16 octobre, à la salle Nova. Je suis entré à 20 h et j'ai vu le groupe jouer jusqu'à la fin. »

**Pièces fictives à produire.**
- `PIX_ROBIN_TICKET_04` — *leurre* : photo d'un billet numérique « Les Étoiles Bleues — Nova — 16/10 ». Un billet acheté ne prouve ni l'entrée ni la prestation.
- `PIX_ROBIN_TSHIRT_04` — *leurre* : selfie avec un t-shirt du groupe. Cela prouve seulement qu'il possède un t-shirt.
- `EVT_NOVA_ANNULATION_04` — *preuve principale* : annonce officielle de la salle du 15 octobre, indiquant que **le concert du 16 octobre est annulé**, salle fermée au public ce soir-là, **aucune prestation ni entrée du public**. Nom de l'événement, salle et date correspondent exactement à la précision.
- `EVT_NOVA_CONFIRM_04` — *corroboration* : message de l'organisateur du 17 octobre confirmant « aucun concert des Étoiles Bleues n'a eu lieu à Nova le 16 octobre ; les billets ont été remboursés ». À conserver pour exclure un changement d'horaire ou une prestation de remplacement.

**Bonne objection.** « Tu dis avoir vu le groupe jouer à Nova le 16 octobre, mais la salle et l'organisateur confirment que ce concert a été annulé et qu'aucun public n'est entré. »

**Mauvaise objection.** « Tu as seulement une photo de billet, donc tu n'y es pas allé. » Un billet ne démontre ni présence ni absence.

**Contre-explications testées.** (1) Concert reporté à une autre date : sa réponse précise le 16 octobre, et l'annonce porte sur cette date. (2) Showcase privé le même soir : la proposition parle du concert **public** à Nova ; l'organisateur confirme qu'aucune prestation du groupe n'y a eu lieu. (3) Autre salle ou autre groupe homonyme : nom de la salle, groupe et date confirmés. (4) Robin aurait vu une retransmission : sa réponse affirme une présence physique dans la salle.

**Réplique à l'erreur.** « Posséder un billet ne signifie pas forcément avoir assisté au concert. Cherche ce qui s'est passé ce soir-là. » **Réplique à la réussite.** « OK… j'avais le billet. J'avais même préparé ma story. Mais le concert a été annulé. » **Chute :** Robin connaît la setlist par cœur, sauf le morceau intitulé « Concert annulé ».

**Variante vraie.** « J'avais un billet pour ce concert, mais il a été annulé » ; billet et annonce concordent.

**Incompatibilités :** ne pas mélanger avec un dossier où ce même concert serait présenté comme ayant réellement eu lieu. **Verdict : GO conception.** Risque : ressemblance de mécanique avec RF-06-11 (événement annulé). Lors de l'intégration, privilégier **un seul** des deux dans une même rencontre, ou remplacer la preuve par un autre mécanisme vérifiable. Le groupe, la salle et l'annulation sont fictifs.

## RF-10-01 — « Je suis fils unique »

**Personnage.** Mathieu, 30 ans, Differdange ; adore se présenter comme le « petit dernier très choyé », mais mélange les versions de son histoire familiale. Archétype : le conteur maladroit. Ton : drôle, sans stigmatiser les familles recomposées. **Portrait PS1 :** chemise impeccable, décor de salon familial avec albums. **Bio Cringr :** « Très famille, brunch du dimanche, toujours partant. » **Objectif pédagogique A1 :** frère, sœur, parents, famille, un/deux, avoir, négation.

**Déclaration FR (P).** « Je suis fils unique. Je n'ai ni frère ni sœur. »

**Question de précision.** « Tu veux dire que tu n'as aucun frère ni aucune sœur, même demi-frère ou demi-sœur, biologique ou adopté ? »

**Réponse engageante.** « Exactement. Je suis le seul enfant de mes deux parents. Je n'ai aucun frère ni aucune sœur, même demi-frère ou demi-sœur. »

**Pièces fictives à produire.**
- `PIX_MATHIEU_FAMILLE_04` — *leurre* : photo de Mathieu avec un jeune homme du même âge lors d'un repas. Un cousin ou un ami pourrait être sur la photo.
- `AMIS_MATHIEU_FREROT_04` — *leurre* : commentaire « Mon frère ! » sous une photo ; le terme peut être amical.
- `AMIS_MATHIEU_FRERE_04` — *preuve principale* : publication fictive de Mathieu datée du 8 octobre : « Joyeux anniversaire à Thomas, mon frère biologique. Nous avons les mêmes deux parents. Je suis son grand frère depuis sa naissance en 2001. » Réponse de Thomas : « Merci grand frère ! » La publication est attribuée explicitement au compte de Mathieu et il confirme en confrontation : « Oui, Thomas est mon frère, on a bien les mêmes parents. »
- `PIX_ALBUM_MATHIEU_04` — *corroboration optionnelle* : album familial légendé par Mathieu « Mathieu et son petit frère Thomas », sans utiliser l'album seul comme preuve de parenté.

**Bonne objection.** « Tu affirmes n'avoir aucun frère, mais tu reconnais toi-même que Thomas est ton frère biologique et que vous avez les mêmes parents. »

**Mauvaise objection.** « Tu poses avec un autre homme, donc c'est ton frère. » La photo ne prouve aucun lien familial.

**Contre-explications testées.** (1) « frère » employé comme surnom : la publication précise **frère biologique**, mêmes parents, et Mathieu le confirme. (2) Demi-frère ou frère adopté : sa réponse exclut aussi ces liens, mais la preuve va plus loin en établissant un frère des deux parents. (3) Souvenir d'enfance ou frère décédé : la publication et la réponse sont actuelles ; l'affaire ne doit pas inférer la situation d'autres membres de la famille. (4) Compte non authentifié : l'identité de Mathieu et sa confirmation doivent être établies par le scénario.

**Réplique à l'erreur.** « Cette photo ne dit pas quel lien unit ces deux personnes. » **Réplique à la réussite.** « Bon… je voulais dire que j'étais le seul enfant *sage* de la famille. » **Chute :** Thomas intervient : « Et encore, c'est discutable. »

**Variante vraie.** « J'ai un petit frère, Thomas » ; publication et confirmation concordent.

**Incompatibilités :** ne pas attribuer au même personnage une variante vraie « fils unique ». **Verdict : GO conception**, sous réserve de rendre plausible la consultation volontaire d'une publication du personnage et de ne pas confondre famille biologique, adoptive et recomposée.

## RF-14-07 — « J'ai réservé cette table il y a trois semaines »

**Personnage.** Bastien, 32 ans, Luxembourg-ville ; aime jouer au VIP. Archétype : le séducteur qui veut paraître organisé. Ton : comédie de rendez-vous. **Portrait PS1 :** costume trop élégant pour un bistrot, petit carnet de réservations sur le comptoir. **Bio Cringr :** « J'adore les bonnes adresses et les surprises bien préparées. » **Objectif pédagogique A1 :** restaurant, table, aujourd'hui, réserver, trois semaines, nombre de personnes.

**Déclaration FR (P).** « J'ai réservé cette table pour nous il y a trois semaines. Ils me connaissent bien ici. »

**Question de précision.** « Tu as toi-même fait une réservation confirmée pour deux personnes au restaurant fictif Le Verre Doré, à ton nom, pour ce soir 29 octobre 2026 à 20 h, le jeudi 8 octobre exactement ? Tu n'es pas simplement venu sans réservation ? »

**Réponse engageante.** « Oui, j'ai personnellement réservé et reçu la confirmation le 8 octobre. C'est une réservation à mon nom, Bastien Morel, pour deux personnes à 20 h ce soir. »

**Pièces fictives à produire.**
- `PIX_BASTIEN_RESTO_04` — *leurre* : selfie de Bastien devant le restaurant daté du 8 octobre. Il a pu passer devant sans réserver.
- `AMIS_SERVEUR_BASTIEN_04` — *leurre* : message du serveur « Ravi de te revoir ! » ; connaître un serveur n'établit aucune réservation.
- `PRO_RESERVATION_04` — *preuve principale* : historique **exhaustif** du système de réservation fictif du restaurant, pour la soirée du 29 octobre, montrant une réservation **créée le 29 octobre à 19 h 42** par la réceptionniste, au nom de Bastien Morel, pour deux personnes à 20 h. L'historique contient la date de création initiale et aucune réservation antérieure ou fusionnée pour cette table ; un champ explicite indique « entrée créée à l'arrivée, sans réservation préalable ». **Ne pas déduire la date de création d'une simple date de modification.**
- `AMIS_ACCUEIL_04` — *corroboration* : échange fictif de 19 h 43 : réceptionniste « Nous avons trouvé une table libre et je viens de créer votre entrée ; aucune réservation n'avait été faite avant votre arrivée. » Bastien répond : « Oui, merci de nous avoir trouvé une place au dernier moment. »

**Bonne objection.** « Tu dis avoir réservé personnellement le 8 octobre, mais l'historique complet et ton échange à l'accueil montrent qu'aucune réservation préalable n'existait et que la table a été attribuée le 29 octobre. »

**Mauvaise objection.** « Le serveur te connaît, donc tu n'as pas réservé. » La familiarité avec le personnel n'exclut pas une réservation.

**Contre-explications testées.** (1) Réservation sous un autre nom : exclue par sa précision « à mon nom » et le journal exhaustif pour la table, mais **pas** par une simple recherche nominative. (2) Réservation téléphonique hors système : le restaurant doit confirmer que **toutes** les réservations confirmées, y compris par téléphone, sont enregistrées et qu'aucune n'existait ; sinon la preuve est insuffisante. (3) Réservation du 8 octobre annulée puis recréée : le journal exhaustif conserve aussi les annulations et indique qu'il n'y en a aucune. (4) Réservation faite par un tiers : sa précision dit « personnellement », et l'accueil confirme une attribution à l'arrivée.

**Réplique à l'erreur.** « Connaître le serveur n'indique pas quand une table a été réservée. » **Réplique à la réussite.** « Trois semaines… dans ma tête. La réservation, c'était il y a dix-huit minutes. » **Chute :** Bastien a surtout réservé son mensonge.

**Variante vraie.** « Nous avons eu de la chance : le restaurant avait une table libre ce soir » ; historique et échange concordent.

**Incompatibilités :** aucun autre indice du dossier ne doit mentionner une confirmation de réservation antérieure à 19 h 42. **Verdict : GO sous réserve de mise en scène.** Un registre interne de restaurant ne doit pas apparaître magiquement sur le téléphone du joueur : fournir un extrait communiqué volontairement par l'accueil ou une confirmation à l'écran au moment du rendez-vous. La mécanique doit rester compréhensible sans lire un journal informatique complexe.

## Contrôle du lot 004

| Contrôle | RF-08-12 | RF-10-01 | RF-14-07 |
|---|---|---|---|
| Précision factuelle | Oui | Oui | Oui |
| Preuve qui réfute la réponse | Oui | Oui | Oui, si historique exhaustif |
| Leurres non concluants | Oui | Oui | Oui |
| Contre-explications examinées | 4 | 4 | 4 |
| Variante vraie | Oui | Oui | Oui |
| Provenance des pièces à scénariser | Organisateur | Publication volontaire | Accueil du restaurant |
| Risque principal | Similitude avec marathon annulé | Identification familiale | Réservation hors système |
| LU vérifié LOD/grammaire | Non | Non | Non |
| JSON / moteur / tests | Inchangés | Inchangés | Inchangés |
| Validation utilisateur | En attente | En attente | En attente |

**Bilan :** trois concepts rédigés en FR, dont une réserve forte sur la preuve de réservation. Les preuves ne sont pas encore des pièces intégrées au moteur. Ne pas cocher de tâche de la TODO technique sur `main`. Voir [SUIVI-ENQUETES.md](../SUIVI-ENQUETES.md).
