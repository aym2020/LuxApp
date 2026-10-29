# RED FLAG — Lot 003 : trois enquêtes

**Statut :** conception éditoriale française, non validée et non implémentée. Sources : SELECTION-50.md, MATRICE-PREUVES.md, FICHE-PERSONNAGE.md, SPEC-110.md et LUX-DEMASQUE-AFFAIRES.md. Personnages et documents fictifs. Les traductions LU, la relecture LOD et les tests restent à faire.

## RF-04-05 — L'application toujours active

**Personnage :** Hugo, 28 ans, charmeur qui veut paraître détaché des applications. **Objectif pédagogique :** aujourd'hui, hier, écrire, message, depuis.

**Déclaration :** « Je n'utilise plus Cringr depuis lundi. » **Question de précision :** « Tu n'as envoyé aucun message sur Cringr depuis le lundi 19 octobre 2026 ? » **Réponse :** « Aucun. Je n'ai rien envoyé depuis le 19. »

**Pièces fictives :** `PIX_PROFIL_HUGO_03`, profil encore visible le 25 octobre (**leurre**, présence du profil ≠ activité) ; `APP_NOTIF_HUGO_03`, notification reçue le 23 (**leurre**, réception ≠ envoi) ; `APP_MESSAGE_HUGO_03`, message sortant horodaté le 23 octobre à 20 h 14, partagé volontairement par son destinataire fictif, avec identification explicite du compte ; Hugo reconnaît dans l'échange de confrontation avoir personnellement envoyé ce message le 23 (**preuve**).

**Objection correcte :** « Tu dis n'avoir envoyé aucun message depuis le 19, mais tu reconnais celui du 23. » **Objection incorrecte :** « Ton profil est toujours visible. »

**Alternatives :** message programmé (exclu par reconnaissance d'envoi personnel le 23) ; compte partagé ou piraté (exclu par reconnaissance de l'auteur) ; message entrant (la pièce précise « envoyé »). **Variante vraie :** « J'ai conservé mon profil, mais je ne l'utilise plus » : exiger un autre dossier de preuve. **Chute :** « J'avais désactivé les notifications, pas mon charme. »

**Verdict : GO conditionnel.** L'accès au message doit être justifié par le destinataire volontaire ; aucun accès magique aux conversations privées. La précision doit précéder l'objection.

## RF-05-12 — Les trois semaines au Japon

**Personnage :** Lucas, 33 ans, raconteur de voyages. **Objectif pédagogique :** pays, semaines, dates, ici/là-bas.

**Déclaration :** « J'ai passé trois semaines au Japon en août. » **Question :** « Du 1er au 21 août 2026, sans revenir au Luxembourg ? » **Réponse :** « Oui, j'étais au Japon chaque jour et je ne suis jamais rentré pendant ces trois semaines. »

**Pièces fictives :** `PIX_KYOTO_LUCAS_03`, photo publiée le 12 août depuis Kyoto (**leurre**, publication potentiellement différée) ; `PRO_VOL_LUCAS_03`, réservation de vol vers Tokyo (**leurre**, billet ≠ présence continue) ; `EVT_CEREMONIE_LUCAS_03`, enregistrement d'une cérémonie à Luxembourg-ville **le 12 août 2026**, Lucas monte sur scène et échange en direct avec le présentateur ; `AMIS_CONFIRM_LUCAS_03`, Lucas confirme : « Oui, j'étais physiquement à cette cérémonie à Luxembourg le 12 août » (**ensemble, preuve**).

**Objection correcte :** « Tu prétends être resté au Japon tous les jours, mais tu confirmes ta présence au Luxembourg le 12. » **Objection incorrecte :** « Ta photo publiée à Kyoto le 12 est forcément truquée. »

**Alternatives :** vidéo préenregistrée (interaction en direct et aveu) ; homonyme (visage et reconnaissance) ; aller-retour (la précision exclut explicitement tout retour) ; publication différée (date de cérémonie établie indépendamment). **Variante vraie :** « J'ai voyagé au Japon, mais je suis revenu au Luxembourg le 12 août » : les pièces ne suffisent pas à établir la durée totale. **Chute :** « Trois semaines au Japon, sauf un petit détour par Luxembourg. »

**Verdict : GO sous réserve de dédoublonnage.** Les affaires existantes `A_VOYAGE_JAPON` et `A_VOYAGE_ESPAGNE` utilisent déjà une présence incompatible ; privilégier une mécanique différente ou améliorer une affaire existante. Ne jamais utiliser une simple trace d'activité numérique comme preuve de présence physique.

## RF-06-11 — Le marathon annulé

**Personnage :** Enzo, 31 ans, sportif fanfaron. **Objectif pédagogique :** courir, gagner, dimanche, premier, dates.

**Déclaration :** « J'ai gagné le marathon de la Ville Haute dimanche dernier. » **Question :** « Tu parles de l'édition officielle du 18 octobre 2026, du marathon complet, première place au classement général ? » **Réponse :** « Oui, j'ai remporté exactement cette édition officielle. »

**Pièces fictives :** `PIX_MEDAILLE_ENZO_03`, selfie avec médaille « Finisher » (**leurre**, participation ≠ victoire) ; `EVT_AFFICHE_10KM_03`, affiche d'une autre course de 10 km le 18 octobre (**leurre**, épreuve différente) ; `EVT_ANNULATION_03`, communiqué daté du 1er septembre par l'organisateur fictif annonçant l'annulation de **l'édition officielle 2026 du marathon de la Ville Haute** ; `EVT_CONFIRMATION_03`, réponse officielle datée du 20 octobre indiquant qu'aucune édition ni classement n'a existé le 18 octobre (**preuve combinée**).

**Objection correcte :** « Tu prétends avoir gagné l'édition officielle du 18 octobre, mais l'organisateur confirme qu'elle a été annulée. » **Objection incorrecte :** « Ta médaille indique Finisher, donc tu n'as pas gagné. »

**Alternatives :** autre course homonyme (édition officielle et organisateur explicités) ; autre année (date confirmée) ; résultats non publiés (annulation explicite, pas simple absence de classement) ; 10 km distinct (n'est pas le marathon complet). **Variante vraie :** « J'ai participé à une course de 10 km » : nécessiterait une pièce confirmant sa participation. **Chute :** « Premier d'une course qui n'a jamais commencé. »

**Verdict : GO conception.** Événement fictif : ne pas suggérer qu'un marathon réel a été annulé.

## Audit de fin de lot

| Contrôle | RF-04-05 | RF-05-12 | RF-06-11 |
|---|---|---|---|
| Proposition précise | Oui | Oui | Oui |
| Contradiction logique | Oui, envoi reconnu | Oui, présence physique reconnue | Oui, annulation officielle |
| Leurres non concluants | Oui | Oui | Oui |
| Contre-explications traitées | 3 | 4 | 4 |
| Variante vraie envisagée | Oui | Oui | Oui |
| Point de vigilance | Provenance du message | Doublon avec affaires voyage | Identification exacte de l'épreuve |
| LU vérifié / LOD | Non | Non | Non |
| JSON et moteur | Inchangés | Inchangés | Inchangés |
| Validation utilisateur | En attente | En attente | En attente |

**Bilan :** trois enquêtes rédigées en français, deux sous réserve. Elles ne constituent pas des affaires jouables. Le suivi éditorial est dans [SUIVI-ENQUETES.md](SUIVI-ENQUETES.md) ; la TODO technique sur `main` n'est pas concernée.
