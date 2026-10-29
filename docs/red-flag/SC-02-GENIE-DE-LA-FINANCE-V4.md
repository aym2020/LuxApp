# SC-02 — Le génie de la finance : V4 après playtest narratif

**Statut : conception FR révisée, non validée LU, non implémentée.** V3 conservée pour traçabilité. Même personnage, trois mensonges, trois vérités, mêmes faits et dates ; nouvelles interactions et meilleure progression. Références : SPEC 110, MATRICE-PREUVES.md, STRUCTURE-SCENARIOS.md.

## Diagnostic V3 → V4

V3 ressemblait à une vérification de CV : trois fois « déclaration → document officiel → contradiction ». **Objectif V4 :** trois sensations distinctes : découvrir un contexte masqué (trading), choisir la bonne source (titre), reconstituer une chronologie collective (NovaPay). Donner à Maxime une vraie personnalité, de la légèreté et des choix au joueur. **Interdit :** accès magique à des comptes privés, documents qui résolvent les trois mensonges à la fois, accusations sur simple absence de nom.

## Personnage et contrat

**Maxime, 30 ans**, responsable commercial chez Atelier Nova depuis septembre 2024. Enthousiaste, parle trop vite, se reprend mal quand il est impressionné. Il aime vraiment expliquer un produit. Café fictif Le Point-Virgule, Luxembourg, 29 octobre 2026. Bio : « Tech, café et idées qui changent le monde. J'aime les gens qui posent des questions. » Son arc : cesser de transformer une contribution en réussite solitaire.

**Mensonges inchangés :** M1 « Les 24 800 € du graphique sont mes gains réels de trading en 2026 » ; M2 « J'ai fondé Atelier Nova en 2021 et je suis PDG aujourd'hui » ; M3 « J'ai imaginé et conçu seul NovaPay V1 en 2025 ». **Vérités :** V1 salarié depuis septembre 2024 ; V2 présentateur de NovaPay à TechDays le 9 octobre 2026 ; V3 formation d'initiation financière terminée en septembre 2026. Une vérité n'invalide jamais automatiquement un mensonge.

## Ouverture — Maxime est attachant avant de mentir

Maxime renverse presque son espresso en ouvrant son ordinateur. « Je sais, premier rendez-vous et déjà un PowerPoint. C'est mon langage amoureux. » Joueur : « Tu fais quoi exactement ? » Maxime : « Je présente des logiciels. Et parfois je présente aussi une version légèrement améliorée de moi-même. » Ce dernier trait est une plaisanterie, **pas un aveu précis**.

**Choix du joueur :** « Tu travailles où ? » (V1), « Tu as parlé devant une salle entière ? » (V2), « Montre ton graphique » (M1). Les choix ouvrent des pistes ; aucune pénalité de curiosité.

## M1 — Le graphique à contexte masqué (facile)

Maxime : « Plus 24 800 € cette année. » Joueur : « Avec ton argent ? » Maxime : « Oui, sur ce compte. » Il partage volontairement une capture `PIX-GRAPHE-02`, période janvier–octobre 2026, identifiant `DEMO-742`, total `+24 800 €`. Le haut de l'interface est coupé. **Leurre :** photo de quatre écrans `PIX-ECRANS-02`.

**Action joueur :** choisir « Vérifier le compte », « Vérifier la période » ou « Accuser sur la courbe ». Les deux premiers demandent à Maxime de faire défiler **sa propre interface** et d'ouvrir l'export `PRO-EXPORT-DEMO-02` : même compte, mêmes opérations, même total, bandeau « SIMULATION — FONDS VIRTUELS ». La troisième option reçoit « Une courbe ne dit pas si c'est de l'argent réel » et laisse continuer.

**Objection correcte :** « Ces 24 800 € proviennent du compte démo, pas d'argent réel. » **Réplique :** « J'ai peut-être présenté mon portefeuille imaginaire comme mon portefeuille tout court. » **Limite logique :** un autre compte réel pourrait exister ; la déclaration vise exclusivement ce graphique. L'export d'un compte différent ne suffit pas.

## M2 — Qui dirige vraiment ? (intermédiaire)

Maxime : « Atelier Nova ? Je l'ai fondée en 2021. Je suis encore PDG. » Le joueur choisit où vérifier : **« Son badge TechDays »**, **« La page de l'équipe »**, **« Le registre de société »**. Le badge prouve seulement sa présence à une conférence. La page d'équipe du 20 octobre 2026 `PRO-EQUIPE-NOVA-02` confirme Maxime responsable commercial depuis septembre 2024 et Élise Martin directrice générale. Le registre fictif `PRO-REGISTRE-NOVA-02`, même entité `ATN-2018-04`, donne fondation le 18 juin 2018 par Élise et mandats continus et exhaustifs jusqu'au 20 octobre 2026.

**Micro-déduction :** relier **« fondée en 2021 »** à **« créée en 2018 »**, puis **« PDG aujourd'hui »** à **« Élise dirige actuellement »**. Le joueur choisit quelle contradiction citer. Une seule contradiction complète suffit à réfuter la proposition conjointe, mais le jeu valorise les deux faits sans imposer un doublon d'objection.

**Objection correcte :** « Atelier Nova a été fondée par Élise en 2018, et elle la dirige encore. » **Fausse :** « Ton badge ne dit pas PDG, donc tu mens. » **Réplique :** « D'accord. Je suis responsable commercial. Mais mon badge de conférence est vrai ! » **Équité :** même société, dates récentes, pas de source obsolète ni homonyme.

## M3 — La chronologie des créateurs (avancé, cœur de la rencontre)

Maxime montre sa vraie vidéo de TechDays du 9 octobre 2026 : « C'est moi sur scène. » Le joueur confirme **V2**. Puis Maxime : « Et NovaPay V1, je l'ai imaginé et conçu seul, avant tout le monde. »

**Interaction nouvelle :** le joueur reconstitue une frise **à trois cartes** à partir d'un dossier public de lancement, plutôt que de lire une conclusion unique :
1. **Janvier 2025 — idée et spécifications** : note d'atelier datée, signée Élise Martin et deux membres de l'équipe produit ; Maxime n'y figure pas. Cette absence **seule n'est pas une preuve**.
2. **Mai 2025 — réalisation et lancement V1** : fiche officielle du 12 mai avec **attribution positive** « idée, conception et livraison de la première version : Élise et équipe produit ». La fiche porte explicitement « attribution complète des responsables de la V1 », pas seulement une liste de remerciements.
3. **Octobre 2026 — démonstration TechDays** : programme et vidéo attribuant la présentation commerciale à Maxime. Cela confirme une vérité, sans prouver ou exclure une contribution technique.

**Question de précision :** « Tu parles de la première version de mai 2025, pas de la présentation de 2026 ? » Maxime : « Oui, je dis que j'ai conçu cette première version tout seul. » Le joueur doit associer les **rôles** (concevoir / présenter) aux **dates** (2025 / 2026) et choisir une objection.

**Objection correcte :** « La V1 est attribuée à Élise et à l'équipe produit ; toi, tu l'as présentée plus tard. Tu ne l'as pas conçue seul. » **Fausse :** « Tu as présenté le produit, donc tu ne peux pas l'avoir créé. » **Réplique :** « Je l'ai présenté. Et j'en étais fier. J'ai juste voulu que le reste soit aussi mon histoire. »

**Condition de justice :** la fiche de mai doit être une attribution **positive, complète et fiable** des responsabilités de la V1. Si les pièces finales sont de simples listes de noms sans portée exhaustive, M3 reste **bloqué** : une contribution cachée demeure possible. M2 ne résout pas M3 ; un commercial peut concevoir un produit.

## Vérités, rythme et fin

**V1 :** page d'équipe actualisée ; **V2 :** programme et vidéo de conférence ; **V3 :** attestation de formation d'initiation, septembre 2026. Aucune ne prouve un statut de PDG, un profit réel ou une conception solitaire. Chronologie : Atelier Nova 2018, embauche Maxime 2024, NovaPay V1 mai 2025, formation septembre 2026, TechDays 9 octobre, rendez-vous 29 octobre.

**Rythme :** ouverture drôle → M1 rapide et visuel → M2 recherche de la bonne source → respiration (vraie conférence) → M3 frise de contributions → conclusion. Le joueur peut revenir aux vérités et aux pièces. **Final complet :** Joueur : « Tu travailles vraiment là-bas, tu as fait une formation et tu as présenté NovaPay. C'est déjà pas mal. » Maxime : « J'ai passé le rendez-vous à essayer de devenir le patron de ma propre légende. Je crois que je préfère être moi. » **Fin partielle :** n'avouer que les mensonges effectivement prouvés.

## UX mobile, pédagogie et recette

Une action par étape, trois options courtes maximum, pièces datées et zoomables, frise en cartes verticales **sans drag-and-drop obligatoire**, labels accessibles au toucher, retour sans perdre la piste. Une réponse insuffisante explique ce qu'elle ne prouve pas. Pas de tableau dense ni de pénalité pour explorer.

**Objectifs LU A1.1/A1.2 :** travail, argent, nombres, dates, avant/après, seul/ensemble ; vocabulaire spécialisé réservé aux pièces FR. Dialogues LU, audio, vérification LOD.lu et grammaire_luxembourg.md **non réalisés**.

**Cas de test définis (non exécutés) :** M1 graphique seul insuffisant ; export même compte décisif ; M2 badge seul insuffisant ; registre de la même entité daté décisif ; M3 vidéo seule insuffisante ; frise + attribution exhaustive décisive ; les trois vérités confirmables ; aucune preuve M2 ne réfute M3 ; aucune fin partielle ne révèle tout ; usage Android sans glisser obligatoire. **Reste :** assets, pièces complètes, test à l'aveugle, traduction LU, JSON, tests moteur et mobile, validation utilisateur. **Ne pas déclarer jouable.**
