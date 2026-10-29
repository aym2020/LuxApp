# RED FLAG — Lot éditorial 001 : trois affaires pilotes

**Statut : conception FR avancée, non implémentée, non validée en LU ni par test.** Branche `2.1`. Sélection : [SELECTION-50.md](SELECTION-50.md). **Ordre de traitement :** RF-01-07 → RF-02-01 → RF-02-03. Les pièces et personnages sont entièrement fictifs. Le moteur et les affaires existantes restent inchangés.

## RF-01-07 — « Je vis seul » (colocation)

**Personnage provisoire :** Noé, 29 ans, Luxembourg-ville. Archétype : indépendant de façade, un peu maladroit. **Enjeu pédagogique :** `wunnen`, `eleng`, appartement, avec/sans, depuis ; LU à rédiger et contrôler séparément.

**Déclaration FR :** « J'habite seul dans mon appartement à Luxembourg-ville. »  
**Précision demandée :** « Tu veux dire que personne d'autre n'habite avec toi, même pas en colocation ? »  
**Réponse engageante :** « Exactement. Depuis janvier 2026, je suis le seul habitant permanent de l'appartement du 12, rue des Tilleuls. »

**Pièces à écrire :**
- `AMIS_COLOC_NOE_01` (preuve) : conversation du **12 octobre 2026**, Karim : « Noé et moi louons ensemble l'appartement du 12, rue des Tilleuls depuis janvier. On y habite tous les deux. » Noé répond : « Oui, et c'est moi qui fais la vaisselle ce soir. » L'échange identifie deux résidents permanents, même adresse et période.
- `PIX_SOIREE_NOE_01` (leurre) : photo du 4 octobre montrant Noé et Karim sur un canapé, légendée « soirée à la maison ». Un invité peut être présent ; cette photo **ne prouve pas** une colocation.
- `PRO_APPART_NOE_01` (confirmation facultative) : annonce fictive de chambre dans l'appartement, datée du 1er septembre, publiée par Karim, à utiliser uniquement si son identité et l'adresse sont explicites.

**Objection correcte :** « Tu dis habiter seul depuis janvier, mais tu confirmes toi-même dans la conversation du 12 octobre que Karim et toi habitez ensemble à cette adresse. »  
**Objection incorrecte :** « Karim apparaît sur une photo chez toi » → insuffisant : un ami peut être invité.

**Contre-explications testées :** (1) Karim est simplement de passage : exclu par « louons ensemble », « on y habite tous les deux » et la réponse de Noé. (2) La conversation concerne un ancien appartement : exclu par l'adresse et le présent au 12 octobre. (3) Karim vient d'emménager après janvier : contredit par « depuis janvier » confirmé.  
**Variante vraie :** « Je vis avec Karim en colocation depuis janvier » ; la conversation confirme la déclaration.  
**Risque restant :** adresse de fiction et conversation doivent rester cohérentes dans toutes les pièces ; éviter que la photo soit présentée comme preuve suffisante.  
**Verdict :** **GO CONCEPTION**, contradiction robuste, bonne entrée en matière. **Ne pas intégrer telle quelle** : doublon thématique avec `A_LOGEMENT_COLOC` déjà existante ; différencier personnage, scène et mécanique ou améliorer l'affaire existante plutôt que multiplier des copies.

## RF-02-01 — « J'ai fondé et je dirige ma société » (faux CEO)

**Personnage provisoire :** Victor, 34 ans, entrepreneur vantard. **Enjeu pédagogique :** travail, entreprise, patron, dates, passé/présent ; phrases LU à valider.

**Déclaration FR :** « J'ai fondé Atelier Nova et j'en suis le directeur général. »  
**Précision :** « Tu as créé la société toi-même ? Tu en es toujours le directeur aujourd'hui ? »  
**Réponse engageante :** « Oui. Je l'ai créée en mars 2021, je suis le seul fondateur et le directeur général depuis sa création. »

**Pièces à écrire :**
- `PRO_REGISTRE_NOVA_01` (preuve principale) : extrait **fictif** de registre d'entreprise, daté du **15 octobre 2026**, indiquant « Atelier Nova, constituée le 18 juin 2018 ; fondatrice : Élise Martin ; directrice générale actuelle : Élise Martin ». Inclure la continuité du mandat, pas seulement la date de constitution.
- `PRO_EQUIPE_NOVA_01` (corroboration) : page officielle fictive de l'entreprise, datée du **15 octobre 2026** : « Victor nous a rejoints en septembre 2024 comme responsable commercial. »
- `PIX_VICTOR_BUREAU_01` (leurre) : selfie de Victor dans un bureau de direction avec légende « Boss mode ». Ne démontre ni fondateur ni directeur.

**Objection correcte :** « Tu dis avoir fondé Atelier Nova en 2021 et la diriger depuis, mais son registre donne 2018 et Élise Martin comme fondatrice et dirigeante actuelle. La page de l'équipe dit que tu l'as rejointe en 2024. »  
**Objection incorrecte :** « Tu es dans un bureau luxueux, donc tu mens » → aucun lien logique.

**Contre-explications testées :** (1) Victor aurait fondé une société **distincte** sous le même nom : exclure en précisant l'identifiant fictif de société dans sa réponse et le registre. (2) Il pourrait être cofondateur ou codirigeant : réponse « seul fondateur », registre exhaustif des fondateurs/mandats et poste de 2024 l'excluent. (3) Le registre serait ancien : extrait du 15 octobre, mandat actuel, corroboration officielle.  
**Variante vraie :** « Je travaille chez Atelier Nova depuis 2024 comme responsable commercial » ; la page officielle confirme.  
**Risque restant :** ne pas mélanger « propriétaire », « associé », « fondateur » et « directeur » ; les preuves doivent porter sur les mêmes assertions et le même identifiant.  
**Verdict :** **GO CONCEPTION SOUS RÉSERVE**, bonne mécanique de recoupement de deux sources ; risque de documents administratifs trop complexes pour A1.1/A1.2. Présenter la pièce avec résumé FR clair, sans exiger la lecture juridique.

## RF-02-03 — « Je suis médecin » (faux titre professionnel)

**Personnage provisoire :** Samir, 31 ans, travaille de nuit à l'hôpital. **Enjeu pédagogique :** métiers, hôpital, présent, négation ; LU à vérifier.

**Déclaration FR :** « Je suis médecin à l'hôpital Saint-Aubin. »  
**Précision :** « Tu es médecin diplômé et tu y exerces comme médecin aujourd'hui, pas dans un autre métier de l'hôpital ? »  
**Réponse engageante :** « Oui, j'y suis médecin depuis janvier 2026. Je n'y ai jamais exercé comme infirmier. »

**Pièces à écrire :**
- `AMIS_SAMIR_EQUIPE_01` (preuve) : message de groupe professionnel fictif du **16 octobre 2026** : « Samir est notre infirmier de nuit depuis janvier 2026, et n'occupe aucun poste de médecin dans notre établissement. » Samir répond : « Oui, c'est mon poste depuis janvier. Je suis infirmier, pas médecin. »
- `PRO_SAMIR_POSTE_01` (corroboration) : présentation interne fictive à jour au 16 octobre, identifiant Samir comme infirmier de nuit ; ne pas utiliser comme preuve unique d'absence de diplôme.
- `PIX_BLOUSE_SAMIR_01` (leurre) : photo en blouse blanche dans un couloir de l'hôpital. La blouse ne prouve aucune profession.

**Objection correcte :** « Tu dis exercer comme médecin depuis janvier et n'avoir jamais été infirmier ici, mais tu confirmes dans le message du 16 octobre que tu es infirmier de nuit depuis janvier et pas médecin. »  
**Objection incorrecte :** « Tu portes une blouse, donc tu n'es pas médecin » → absurde, la blouse ne tranche pas.

**Contre-explications testées :** (1) Samir pourrait avoir deux qualifications : sa **réponse explicite** réfute la proposition « j'y exerce comme médecin », sans prétendre démontrer qu'il n'a aucun diplôme. (2) La page de l'hôpital pourrait être ancienne : message daté du 16 octobre et aveu au présent. (3) Un collègue pourrait se tromper : Samir confirme personnellement le poste.  
**Variante vraie :** « Je travaille à l'hôpital comme infirmier de nuit depuis janvier » ; corroborée.  
**Risque restant :** l'affaire existante `A_TRAVAIL_DOKTER` traite déjà le même ressort. Ne pas créer un doublon ; envisager une **révision de l'affaire existante** si la preuve actuelle laisse subsister le double emploi. Ne pas dévaloriser le métier d'infirmier : le problème est le mensonge, pas la profession.  
**Verdict :** **GO CONDITIONNEL / FORTE REDONDANCE** avec l'existant ; préférer consolidation plutôt qu'ajout.

## Contrôle du lot 001

| Critère | RF-01-07 | RF-02-01 | RF-02-03 |
|---|---|---|---|
| Proposition testable après précision | Oui | Oui | Oui |
| Preuve réfutant la proposition | Oui, aveu daté | Oui, registre + équipe | Oui, aveu daté |
| Deux contre-explications explicites | Oui | Oui | Oui |
| Leurre non probant | Oui | Oui | Oui |
| Vraie variante | Oui | Oui | Oui |
| Redondance avec les affaires existantes | **Oui** : logement/coloc | Non directe identifiée | **Oui** : docteur |
| Dialogues LU vérifiés LOD + grammaire | **Non** | **Non** | **Non** |
| JSON/moteur/tests | **Non modifiés** | **Non modifiés** | **Non modifiés** |
| Validation éditoriale utilisateur | **En attente** | **En attente** | **En attente** |

**Conclusion du lot :** les trois pistes ont une contradiction explicite ; **deux sont très proches d'affaires déjà présentes**. Ce lot est un travail de conception FR, pas une livraison de trois nouvelles affaires jouables. La priorité de la suite est de choisir entre enrichir les affaires existantes ou créer une variation suffisamment originale, puis de vérifier le LU.

**Progression persistante :** [SUIVI-ENQUETES.md](SUIVI-ENQUETES.md). Aucun changement à la TODO canonique de refonte `main`, car aucune tâche du moteur ou de l'interface n'a été livrée.
