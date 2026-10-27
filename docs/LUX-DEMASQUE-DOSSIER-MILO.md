# Lux Démasque — Dossier Milo : audit du prototype et matrice logique (lot D0)

**Branche :** `2.1` · **Date :** 27/10/2026 · **Référence :** [SPEC 110](specs/SPEC-110.md) §2–§4, §10 (lot D0).
**Statut : implémenté au lot D1 (voir SPEC 110 § 12) ; logique à faire relire par un testeur extérieur (SPEC 110 §3). Phrases LU et statuts de relecture : `data/jeux/lux-demasque/contenus-v01.json` (source : `tools/lux-demasque/contenus.py`).**

## 1. Prototype HTML : ce qui est vérifiable

Le fichier HTML autonome « Lux Démasque — Dossier n°001 » **n'est pas dans le dépôt** (SPEC 110, en-tête) et n'a pas été fourni à Claude. Il n'a donc **pas pu être exécuté** : la matrice ci-dessous part du fonctionnement décrit par la SPEC (§3), sans inventer de chemin ni de comportement.

| Élément | Prototype (décrit par la SPEC) | Dossier Milo LuxApp (cette matrice) |
|---|---|---|
| Déclarations | 6 en français, 3 mensonges (`job`, `flat`, `japan`), 3 vraies (`run`, `cooking`, `cat`) | 6 en **luxembourgeois** (D1), mêmes sujets |
| Précisions | une par déclaration | une par déclaration, mémorisée ; **obligatoire** pour le mensonge du métier |
| Preuves | Pro / Amis / Pix, presque des aveux publics | indices datés et recoupés, **aucun aveu publié** ; 3 leurres crédibles |
| Objection | `statementId` + `proofId` | idem, + condition « précision obtenue » pour le métier |
| Bilan | motivations révélées | motivations + preuves + phrases LU, après la partie seulement |

## 2. Repères fixes du dossier

- **Rendez-vous :** samedi 24 octobre 2026, au café (date affichée dans l'en-tête du dossier et sur la fiche de Milo).
- **Milo, 30 ans**, Bonnevoie (Luxembourg-ville). Veut paraître stable, indépendant et aventureux. Ment pour impressionner, jamais méchant.
- **Personnages secondaires (fictifs) :** Sami (colocataire), Léa (amie). Aucune marque ni personne réelle ; « Horizon Voyages » et « LuxRun » sont fictifs.
- **Calendrier vérifié :** les dimanches d'août 2026 sont les 2, 9, 16, 23 et 30.

## 3. Matrice déclaration × précision × preuve × résultat

| Déclaration (intention FR) | Vérité | Faire préciser (intention FR) | Preuve qui suffit | Leurres (objection refusée) |
|---|---|---|---|---|
| **MILO_JOB** « Je travaille dans le tourisme. Je suis chef d'équipe. » | **Mensonge.** Son contrat chez Horizon Voyages a pris fin en juin 2026 | « Tu travailles où ? » → « Chez Horizon Voyages. J'y suis tous les jours. » (**indispensable** : sans elle, rien ne relie « le tourisme » à Horizon) | **PRO_PROFIL** : expérience « Chef d'équipe · Horizon Voyages · mars 2021 – juin 2026 », aucune expérience après | **PRO_EQUIPE** (post d'avril 2026 « Fier de mon équipe ») : daté **avant** juin, ne prouve rien pour octobre |
| **MILO_FLAT** « J'habite seul, dans un appartement à Bonnevoie. » | **Mensonge.** Il vit en colocation avec Sami | « Tu vis vraiment seul ? » → « Oui, seul. Avec mon chat, Pixel. » | **AMIS_SAMI** : profil de Sami « Coloc à Bonnevoie avec Milo (et Pixel 🐈) » — un tiers établit la cohabitation | **PIX_CANAPE** (Milo : « Sami est passé voir le match ») : une **visite** ne prouve pas une colocation |
| **MILO_RUN** « Je cours le dimanche matin. » | **Vrai** (dix minutes) | « Tu cours combien de temps ? » → « Dix minutes. Mais je cours ! » | — (vrai) | **LUXRUN_AOUT** confirme la course : objection refusée, gag « dix minutes, c'est courir » |
| **MILO_JAPAN** « En août, j'ai passé trois semaines au Japon. » | **Mensonge.** Il n'a pas quitté Bonnevoie ; l'album est un montage | « Qu'est-ce que tu as fait là-bas ? » → « Plein de photos ! Regarde mon Pix. » (oriente vers le leurre) | **LUXRUN_AOUT** : capture partagée par Milo sur Amis, « Août 2026 · 5 courses · dim. 2, 9, 16, 23, 30 · Parc de Bonnevoie ». Trois semaines en août contiennent forcément au moins deux de ces dimanches | **PIX_KYOTO** (« 3 semaines inoubliables », lanternes, publié le 31 août) : une photo ne prouve pas un voyage, ni son absence |
| **MILO_COOK** « J'aime cuisiner pour mes amis. » | **Vrai** (toujours du pesto) | « Tu cuisines quoi ? » → « Des pâtes au pesto. Toujours. » | — (vrai) | **AMIS_LEA** (« Merci Milo pour le pesto de samedi ! », 12 septembre) confirme |
| **MILO_CAT** « J'ai un chat. Il s'appelle Pixel. » | **Vrai** | « Il est où, ton chat ? » → « À la maison, il dort. » | — (vrai) | **PIX_PIXEL** (photo du chat) et **AMIS_SAMI** confirment |

**Répartition des difficultés (SPEC 110 §2.2) :** métier = précision indispensable + profil Pro daté ; logement = réseau Amis (tiers) ; Japon = recoupement d'une capture datée et d'une durée. Aucune preuve n'écrit « je n'ai jamais été à Kyoto » ni « je n'ai plus de travail ».

## 4. Pièces du carnet (toutes en français, transcription textuelle obligatoire)

| `proofId` | Source | Date | Contenu (transcription) | Rôle |
|---|---|---|---|---|
| PRO_PROFIL | Pro | — | Milo, 30 ans · « Tourisme · voyages · gestion d'équipe » · Expérience : Chef d'équipe, Horizon Voyages (Luxembourg), **mars 2021 – juin 2026** · Formation : BTS Tourisme | Preuve MILO_JOB (avec la précision) |
| PRO_EQUIPE | Pro | 14 avril 2026 | « Fier de mon équipe chez Horizon Voyages ! 🧳 Cinq ans déjà. » | Leurre MILO_JOB |
| AMIS_SAMI | Amis | — | Profil de Sami : « Graphiste · coloc à Bonnevoie avec Milo (et Pixel 🐈) » | Preuve MILO_FLAT, confirme MILO_CAT |
| PIX_CANAPE | Pix | 4 octobre 2026 | Photo : deux amis devant un match. Légende de Milo : « Sami est passé voir le match 📺 » | Leurre MILO_FLAT |
| LUXRUN_AOUT | Amis (publié par Milo) | 31 août 2026 | Capture de l'appli LuxRun : « Août 2026 · 5 courses · dim. 2, 9, 16, 23, 30 · Parc de Bonnevoie · 10 min chacune » + « Régulier ! 💪 » | Preuve MILO_JAPAN, confirme MILO_RUN |
| PIX_KYOTO | Pix | 31 août 2026 | Photo : temple et lanternes. « Kyoto ✨ 3 semaines inoubliables » | Leurre MILO_JAPAN ; après la preuve, le montage est montré |
| AMIS_LEA | Amis | 12 septembre 2026 | Léa : « Merci Milo pour le pesto de samedi ! 🍝 » | Confirme MILO_COOK |
| PIX_PIXEL | Pix | 2 octobre 2026 | Photo d'un chat roux endormi. « Pixel, champion de sieste » | Confirme MILO_CAT |

Les déclarations et précisions entendues entrent aussi dans le carnet (« extraits de déposition », SPEC 110 §6), mais aucune ne suffit seule à prouver un mensonge de ce dossier.

## 5. Règles d'objection

- Objection = **déclaration ciblée + une pièce du carnet**. Seule la paire de la colonne « preuve qui suffit » démasque ; tout le reste est refusé.
- **MILO_JOB avec PRO_PROFIL avant la précision** : refusé avec une réplique qui oriente sans révéler (« Horizon ? J'ai dit le tourisme, pas Horizon ! ») ; la même pièce marche une fois la précision obtenue.
- **Objection contre une vraie déclaration** : riposte amusée propre à la déclaration (« Dix minutes, ça reste courir ! »), jamais de révélation.
- **Conséquence mesurée :** chaque objection refusée retire un bonus de score et fait sourire Milo ; ni vies, ni chrono, ni fin de partie (SPEC 110 §2.2). Une déclaration démasquée ne rapporte qu'une fois.

## 6. Démasqué : réaction propre à chaque mensonge (intention FR, LU en D1)

| Mensonge | Justification puis aveu | Motivation révélée au bilan |
|---|---|---|
| Métier | « Bon… mon contrat s'est terminé en juin. Je voulais faire bonne impression. » | Paraître stable pendant une recherche d'emploi |
| Logement | « J'habite avec Sami. Mais j'ai ma chambre ! Quand il ne squatte pas la cuisine. » | Paraître autonome |
| Japon | « Kyoto… vu de mon canapé. J'ai même ajouté les lanternes. » (l'image montre le montage) | Paraître aventureux |

## 7. Invariants vérifiés (repris par les tests du lot D1)

1. Trois mensonges, trois vérités ; les trois bonnes objections, dans n'importe quel ordre, donnent **3/3**.
2. Aucune autre paire (déclaration, pièce) ne démasque quoi que ce soit (36 paires × états de précision testés).
3. Chaque preuve est accessible sans action irréversible : profils Pix/Pro/Amis toujours consultables, précisions toujours disponibles.
4. Aucune preuve ne trahit un autre mensonge : LUXRUN_AOUT ne dit rien du logement ; AMIS_SAMI ne dit rien du voyage ; PRO_PROFIL ne dit rien du logement ni du Japon.
5. Dates identiques partout : fin de contrat **juin 2026** (Pro, aveu, bilan), dimanches d'août (LuxRun), publication Kyoto **31 août** (après le dernier dimanche couru).

## 8. Phrases luxembourgeoises à confirmer sur LOD.lu (lot D1)

Statut `a_verifier_lod` (mot ou tournure absent des leçons) : *Tourismus* (am Tourismus), *Equipe* (eng Equipe), *gesot* (Ech hunn … gesot), *Gesäis du?*, *wierklech*, *just* (= seulement), *Nuddelen* (Nuddele mat Pesto), genre de *Pesto* (mäi Pesto), *gewonnen* (Du hues gewonnen), *gelunn* (Ech hunn net gelunn). Toutes les autres répliques suivent des structures des leçons (`lecon`, `lecon_modele`, `audit_regles`). Note pédagogique affichée avec l'aide FR : *Kaz* est féminin, on dit « si » même pour le chat Pixel.
