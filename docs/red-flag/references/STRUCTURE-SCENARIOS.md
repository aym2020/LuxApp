# RED FLAG — Unité éditoriale : mensonge, enquête, scénario

**Décision de cadrage (29 octobre 2026), branche `2.1` ; documentation uniquement, non implémentée.** À lire avec [SPEC 110](../../specs/SPEC-110.md), [BIBLE-EDITORIALE.md](../references/BIBLE-EDITORIALE.md) et [OBJECTIONS-PROGRESSIVES.md](../references/OBJECTIONS-PROGRESSIVES.md).

## Vocabulaire obligatoire

- **Mensonge / affirmation RF-xx-xx** : un fait précis déclaré par le personnage et potentiellement réfutable. Les 198 idées, les 50 sélectionnées et les 12 fiches des lots 001–004 comptent des **mensonges candidats**, **pas des scénarios**.
- **Enquête / affaire atomique** : le traitement d'une affirmation : précision, indices, leurres, preuve(s), objection(s), défense éventuelle et résolution. Une affaire peut être vraie : il faut alors ne pas accuser.
- **Scénario / rencontre / dossier** : une expérience complète centrée sur **un personnage cohérent**, regroupant plusieurs déclarations et affaires, avec une introduction, une personnalité, des liens entre indices, un déroulement et une conclusion.

## Composition cible

**Cible éditoriale demandée : 1 scénario = 3 mensonges à démasquer**, accompagnés de déclarations vraies. **Contrat existant à respecter :** SPEC 110 décrit un prototype de **6 déclarations (3 mensonges + 3 vérités)**, mais indique aussi pour le générateur une cible de **2 ou 3 mensonges selon la difficulté** et au moins deux mensonges réels. Le choix éditorial de **trois mensonges pour les scénarios conçus désormais** ne modifie **pas** automatiquement les variantes techniques actuelles. Toute uniformisation à trois dans le moteur demande une décision d'implémentation distincte et des tests.

Exemple conceptuel (non validé) : **un** prétendant pourrait combiner trois mensonges compatibles — une Porsche prétendument achetée, des gains de trading simulés présentés comme réels, une réservation VIP inventée — et trois faits vrais, **à condition** de construire une biographie, une chronologie et des preuves cohérentes. Les trois mensonges ne sont pas trois scénarios.

## Méthode de création

1. **Sélectionner trois mensonges complémentaires** : diversité des mécaniques, du registre émotionnel et de la difficulté ; éviter les preuves répétitives.
2. **Créer un seul personnage** : motivation crédible reliant les trois mensonges, traits attachants, biographie, ton et portrait.
3. **Ajouter les affirmations vraies** : crédibles, vérifiables et non contradictoires avec les mensonges ni avec les pièces.
4. **Orchestrer la rencontre** : ordre des révélations, progression, leurres et accès plausible aux pièces ; un mensonge peut comporter une ou deux objections selon [la mécanique progressive](../references/OBJECTIONS-PROGRESSIVES.md).
5. **Auditer les interactions croisées** : dates, adresses, emplois, comptes, relations, identité, provenance des preuves ; aucun indice ne doit résoudre involontairement une autre affaire ou contredire une vérité.
6. **Préparer la pédagogie** : dialogues LU A1.1/A1.2 à rédiger et vérifier ; ne pas traduire automatiquement les documents complexes.
7. **Vérifier le contrat technique avant implémentation** : SPEC 110, générateur, JSON, tests, sauvegarde et Android. Une fiche éditoriale ne vaut ni scénario jouable ni validation.

## Relecture des lots 001–004

Les intitulés historiques `LOT-001-ENQUETES.md` à `LOT-004-ENQUETES.md` restent inchangés pour conserver les liens. **Chacun contient trois mensonges/affaires candidats indépendants, et non un scénario de trois mensonges.** Il n'existe à ce stade **aucun assemblage validé** de ces douze candidats en quatre rencontres. Ne pas compter « 12 scénarios » ni « 4 scénarios » ; compter **12 mensonges candidats développés**, **0 scénario assemblé et validé** dans ce chantier.

Les cinq idées distinguées lors de la revue (RF-03-03, RF-05-10, RF-14-07, RF-04-07, RF-02-11) sont **cinq mensonges candidats**, dont deux déjà rédigés dans les lots et trois encore à développer ; elles ne constituent pas cinq scénarios.

## Critères de qualité d'un scénario

- Un seul personnage et une histoire cohérente ; trois mensonges aux motivations compréhensibles.
- Variété des mécaniques (objection progressive, chronologie, observation, recoupement…), sans imposer deux objections partout.
- Vérités réellement défendables ; preuves accessibles et suffisantes ; absence d'aveu décisif avant l'objection finale.
- Pas de doublon inutile avec les affaires existantes ; aucune contradiction croisée.
- Rythme mobile-first et difficulté LU adaptée ; validation éditoriale puis technique distinctes.

**État :** définition et méthode documentées. Aucun fichier de contenu, moteur, progression ou JSON modifié.
