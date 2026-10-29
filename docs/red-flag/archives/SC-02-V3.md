# SC-02 — Le génie de la finance — dossier FR V3

**Statut : conception FR finalisée pour revue, non validée LU, non intégrée.** Références : SCENARIOS-001-005.md, MATRICE-PREUVES.md, SPEC 110. Toutes les pièces et personnes sont fictives.

## Rencontre

**Maxime, 30 ans**, responsable commercial chez Atelier Nova, aime la technologie et les chiffres. Il est bon présentateur, mais croit devoir se faire passer pour un entrepreneur exceptionnel pour séduire. Bio Cringr : « Tech, café et idées qui changent le monde. J'aime les gens qui posent des questions. » Café fictif Le Point-Virgule, Luxembourg, 29 octobre 2026. Son arc : reconnaître sa contribution réelle sans s'attribuer celle des autres.

## Six déclarations

| ID | Déclaration | Verdict |
|---|---|---|
| RF-02-05 | « Les 24 800 € de ce graphique sont mes gains réels de trading en 2026. » | Faux |
| RF-02-01 | « J'ai fondé Atelier Nova en 2021 et je suis son PDG aujourd'hui. » | Faux |
| RF-02-11 | « J'ai imaginé et conçu seul la première version de NovaPay en 2025. » | Faux |
| SC02-V1 | « Je travaille chez Atelier Nova depuis septembre 2024. » | Vrai |
| SC02-V2 | « J'ai présenté NovaPay à TechDays le 9 octobre 2026. » | Vrai |
| SC02-V3 | « J'ai terminé une formation d'initiation financière en septembre 2026. » | Vrai |

## Acte 1 : les gains

Maxime : « Regarde, plus 24 800 euros ! » Joueur : « Avec ton argent, vraiment ? » Maxime : « Oui, ce sont mes gains sur ce compte. »

**Leurres :** photo devant quatre écrans et graphique sans contexte. **Preuve :** export qu'il ouvre volontairement : même identifiant de compte fictif `DEMO-742`, mêmes transactions et même total que le graphique, bandeau « SIMULATION — FONDS VIRTUELS ».

**Objection juste :** « Ces 24 800 euros sont des gains virtuels, pas des profits réalisés avec ton argent. » **Fausse :** « Tu as quatre écrans, donc tu mens. » **Réplique :** « C'est un compte démo. Mais je m'entraîne vraiment. »

**Audit :** un autre compte réel est possible mais ne change pas le statut de **ce graphique**. Un export sans identifiant concordant serait insuffisant. Pas d'aveu avant objection.

## Acte 2 : le titre

Maxime : « J'ai créé Atelier Nova en 2021. Je suis encore PDG. » Joueur : « C'est toi qui as fondé la société ? » Maxime : « Oui. »

**Leurres :** selfie dans un bureau, badge de conférencier. **Preuve E1 :** registre fictif actualisé le 20 octobre 2026, entité `ATN-2018-04`, fondée le 18 juin 2018 par Élise Martin, historique exhaustif des dirigeants, Élise dirigeante actuelle. **E2 :** page officielle d'équipe du 20 octobre, même entité, Maxime responsable commercial depuis septembre 2024.

**Objection juste :** « La société existait en 2018 ; Élise l'a fondée et la dirige, tu y es responsable commercial. » **Fausse :** « Tu n'as pas de bureau personnel. » **Réplique :** « J'ai un peu gonflé mon titre. Responsable commercial, c'est déjà bien. »

**Audit :** identité de l'entité et mandats continus, sans homonymie ni source obsolète. Être salarié n'empêche pas d'avoir conçu un produit : M2 ne résout pas M3.

## Acte 3 : le produit

Maxime montre une vidéo de sa présentation de NovaPay au salon TechDays le 9 octobre 2026. « La première version, je l'ai conçue seul. » Joueur : « Tu l'as vraiment faite tout seul ? » Maxime : « Oui, les autres ont aidé après. »

**Leurre :** la vidéo de scène confirme qu'il a présenté le produit, pas qu'il l'a conçu. **E1 :** note publique de lancement du 12 mai 2025, rubrique « Responsabilités V1 » : conception initiale attribuée à Élise Martin et à l'équipe produit, démonstration commerciale à Maxime. **E2 :** journal public des étapes de janvier à mai 2025 et attribution explicite et complète des responsabilités de conception de V1.

**Objection juste :** « Tu as présenté NovaPay, mais tu ne l'as pas conçu seul. » **Fausse :** « Présenter un produit empêche de l'avoir créé. » **Réplique :** « C'est vrai. J'ai fait la démo, pas la conception. »

**Audit critique :** une liste de crédits partielle ou l'absence du nom de Maxime ne suffit pas. Les pièces finales doivent attribuer **positivement et exhaustivement** la conception de V1. Une contribution secondaire n'établit pas une conception solitaire.

## Vérités et cohérence

**V1** confirmée par page d'équipe ; **V2** par programme, badge et vidéo TechDays ; **V3** par attestation fictive de formation d'initiation de septembre 2026. Cette attestation ne prouve aucun gain réel.

Chronologie : société créée 2018, Maxime recruté 2024, NovaPay V1 lancée mai 2025, formation septembre 2026, conférence 9 octobre, rendez-vous 29 octobre 2026. Aucun document d'une enquête ne doit contredire une vérité ni résoudre automatiquement une autre enquête.

## Conclusion et ergonomie

Joueur : « Tu travailles vraiment chez Atelier Nova. Tu as vraiment présenté NovaPay. Pourquoi inventer le reste ? » Maxime : « Parce que “fondateur” sonnait mieux que “j'ai préparé une super démo”. Mais c'était une bonne démo. »

Trois mécaniques distinctes : comparer un graphique à son export, croiser des rôles officiels, attribuer la conception d'un produit. Feedback non punitif pour preuve insuffisante ; documents datés et lisibles sur mobile ; vérités confirmables. Les dialogues LU A1.1/A1.2, assets, JSON, tests moteur, sauvegarde et Android **restent à produire et vérifier**. Objectifs LU : travail, argent, chiffres, dates, seul/ensemble. Ne pas considérer le scénario comme jouable avant validation.

**Livrable : dossier éditorial FR complet pour revue. Prochaine action : produire les pièces exactes, vérifier exhaustivité des crédits NovaPay, puis localisation LU et recette.**
