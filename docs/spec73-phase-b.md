# SPEC 73 — Phase B : journal des lots

Phase B validée par Clayton le 20/10/2026, de façon progressive : moteur et sons sûrs d'abord ;
vérification individuelle des cas « à valider » ; audios contextuels relus ; orthographes présentées avant toute modification des leçons.

## Lot 1 — Moteur de correspondance

- **Index des formes versionné** : `tools/lod/lod-formes.json.gz` (3,9 Mo), construit par
  `node tools/lod/construire-formes.js new_lod-art.xml new_lod-tab.xml new_lod-search.xml` (exports LOD du 2026-07-27, CC0, gardés hors dépôt).
  Il contient 33 941 entrées (lemmes, pluriels, participes, variantes, sens, exemples avec la forme prononcée), 9 851 tables de flexion
  et 251 861 graphies de l'index de recherche avec leur statut (contrôlée, règle du n, fautive, générée).
- **Audit sans fichier externe** : `node tools/lod/audit-correspondances.js` lit l'index versionné ; résultat **identique** à la lecture des exports XML (contrôlé).
  À lancer pour toute nouvelle leçon : il propose les correspondances (sûres / à valider), les formes fléchies, les phrases candidates et les graphies à vérifier.
- **Chaîne proposer → valider → appliquer** : l'audit propose ; une correspondance n'est appliquée que si elle est dans
  `tools/lod/correspondances.json` (vérifiée à la main) ou trouvée par le rapprochement automatique des cartes (inchangé, 442 associations).
  Les mots du cours (vocabulaire, exemples) ne reçoivent un son **que** par la table vérifiée (`tools/audio-lod.js`).
- **Notes entre parenthèses** : « de Brudder (pl. d'Bridder) », « d'Meedchen (neutre) »… La note n'est pas prononcée : la clé du son et le nom
  accessible du bouton l'ignorent (`public/dialogue.js` et `tools/lod/commun.js`). Les 6 textes concernés sont des notes de grammaire (vérifié).

## Lot 2 — Sons directs

### Acceptés (12)

| Texte LuxApp | Entrée | Comment | Justification |
|---|---|---|---|
| de Brudder (pl. d'Bridder) | BRUDDER1 | clé sans parenthèses (MP3 déjà présent) | sûr |
| d'Meedchen (neutre) | MEEDCHEN1 | idem | sûr |
| de Grousspapp (fam. de Bopa/Bopi) | GROUSSPAPP1 | idem | sûr |
| d'Groussmamm (fam. d'Boma/Bomi) | GROUSSMAMM1 | idem | sûr |
| d'Niess (pl. d'Niessen) | NIESS1 | idem | sûr |
| d'Enkelkand (neutre) | ENKELKAND1 | idem | sûr |
| d'Elteren | ELTEREN1 | table vérifiée, MP3 téléchargé | sûr : lemme identique, graphie contrôlée, sans homographe |
| d'Geschwëster | GESCHWESTER1 | idem | sûr |
| d'Grousselteren | GROUSSELTEREN1 | idem | sûr |
| d'Reunioun | REUNIOUN1 | idem | sûr |
| un | UN1 | idem | vérifié : préposition « contre, à » (leçon 20) ; homographe UN2 = adverbe « allumé », même prononciation /un/ |
| widdert | WIDDERT1 | idem | vérifié : préposition « contre » ; variante de « widder » avec son propre enregistrement (/vˈidɐt/) |

### Vérifiés mais non intégrés : cellules de tableau sans bouton audio (36)

Le sens est confirmé par la ligne du tableau, mais les tableaux du cours n'affichent pas de bouton « Écouter » : une association n'apporterait rien à l'apprenant.
**Décision à prendre** : ajouter un bouton aux cellules luxembourgeoises des tableaux (nouvelle spec), ou laisser les tableaux sans son.

den (DEN1, article) · eenandrësseg, eenafofzeg, eenasiwwenzeg, eenannonzeg (numéraux) · eng Mauer (MAUER1) · iessen (IESSEN3, verbe ; IESSEN1 = nom « Iessen ») ·
ech (ECH1) · maachen (MAACHEN1) · spillen (SPILLEN1) · fueren (FUEREN1) · hien (HIEN1) · hatt (HATT2, pronom ; HATT1 = « Hatt » hotte) ·
mir (MIR1) · dir (DIR1) · Dir (DIR3, politesse) · deng (DENG2) · hiert (HIERT2 ; HIERT1 = « Hiert » berger) · **eis → EIS3** (possessif « notre », pas EIS1 « nous ») ·
eist (EIST1) · Är (AR3) · Äert (AERT2) · lafen (LAFEN1) · falen (FALEN1 « tomber » ; FALEN2 = « plier ») · opstoen (OPSTOEN2) · drénken (DRENKEN1) ·
wunnen (WUNNEN1) · kucken (KUCKEN1) · lauschteren (LAUSCHTEREN1) · en Akafskuerf (AKAFSKUERF1) · en Apel (APEL1) · eng Gromper (GROMPER1) ·
eng Aprikos (APRIKOS1) · e Sekretär (SEKRETAR1) · sinn (SINN1) · hunn (HUNN1) · Awuer! (AWUER1, variante familière de « Awar »).
Les homographes de même graphie ont la même prononciation (API identique dans le LOD) ; l'identifiant retenu est celui du sens de la leçon.

### À présenter à Clayton (3)

| Texte LuxApp | Leçon | Constat LOD | Proposition |
|---|---|---|---|
| eng Posch → « deux poches » | L6, tableau des pluriels | POSCH1 = **sac à main, sacoche** ; « poche » = **Täsch** (TASCH1) | corriger la traduction (« deux sacs à main ») ou remplacer l'exemple par « eng Täsch / zwou Täschen » |
| trëppelen → « marcher » | L24, verbes avec sinn (+ getrëppelt) | TREPPELEN2 = **marcher sur, poser le pied sur** ; pas de sens « se promener » dans le LOD | à vérifier : « trëppelen » au sens de « marcher (à pied) » n'est pas confirmé par le LOD |
| eenasiechzeg (61) | L5, tableau UNITEDZOHA | entrée **variante** de la graphie standard « eenasechzeg » (prononciation différente) | garder (variante attestée) ou passer à « eenasechzeg » ; à décider avec « siechzeg / sechzeg » |

### Mesure

Couverture audio des leçons : **37,1 % → 37,7 %** (sons directs 653 → 665 éléments ; `node tools/lod/audit-audio.js`).
Catalogue : 442 → **448** associations dans `public/audio/lod.json` (+ 6 éléments sonorisés par la clé sans parenthèses).
