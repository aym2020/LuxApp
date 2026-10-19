// SPEC 70 — Audit de la couverture audio LOD, leçon par leçon.
//
//   node tools/lod/audit-audio.js      → écrit docs/audit-audio-lod.md
//
// Pour chaque élément luxembourgeois d'une leçon (cartes, scène, écriture, dialogues, vocabulaire du cours) :
//   direct      son LOD du mot, validé et présent (public/audio/lod.json)
//   exacte      phrase identique à un exemple enregistré du LOD
//   contexte    phrase LOD qui contient l'expression, relue et traduite (tools/lod/contextes.json)
//   à relire    phrase LOD candidate, pas encore relue
//   sans audio  rien dans le LOD
// « Disponible » = fichier présent dans public/audio ; « identifié » = trouvé dans l'index, fichier pas encore téléchargé.
const fs = require('fs');
const path = require('path');
const { RACINE, phraseCle, lireIndex, chercherContextes, tableDirecte, elementsLecon, lecons } = require('./commun');

const SORTIE = path.join(RACINE, 'docs/audit-audio-lod.md');
const lire = f => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {});
const present = f => fs.existsSync(path.join(RACINE, 'public/audio', f));

function nature(lu) {
  const n = phraseCle(lu).split(' ').length;
  return n === 1 ? 'mot' : n <= 3 ? 'expression' : 'phrase';
}
function pourcent(n, total) {
  return total ? (Math.round((n / total) * 1000) / 10).toLocaleString('fr-FR') + ' %' : '—';
}

function main() {
  const index = lireIndex();
  const direct = tableDirecte(lire(path.join(RACINE, 'public/audio/lod.json')));
  const phrases = lire(path.join(RACINE, 'public/audio/lod-phrases.json'));
  const contexte = lire(path.join(RACINE, 'public/audio/lod-contexte.json'));
  const choix = lire(path.join(__dirname, 'contextes.json'));
  const refuses = choix['_refusés'] || {};

  const total = { elements: 0, direct: 0, exacte: 0, exacteDispo: 0, contexte: 0, contexteDispo: 0, relire: 0, refuse: 0, sans: 0 };
  const parNature = { mot: { n: 0, avec: 0 }, expression: { n: 0, avec: 0 }, phrase: { n: 0, avec: 0 } };
  const lignes = [];
  const details = [];
  for (const l of lecons()) {
    const t = { elements: 0, direct: 0, exacte: 0, exacteDispo: 0, contexte: 0, contexteDispo: 0, relire: 0, refuse: 0, sans: 0 };
    const listes = { direct: [], exacte: [], contexte: [], relire: [], sans: [] };
    for (const e of elementsLecon(l.lecon)) {
      t.elements++;
      const nat = nature(e.lu);
      parNature[nat].n++;
      let statut;
      if (direct(e.lu)) { statut = 'direct'; t.direct++; listes.direct.push(e.lu); }
      else if (index.parPhrase[phraseCle(e.lu)]) {
        statut = 'exacte'; t.exacte++;
        if (phrases[e.lu] && present(phrases[e.lu])) t.exacteDispo++;
        listes.exacte.push(e.lu);
      } else if (choix[e.lu] && !e.lu.startsWith('_')) {
        statut = 'contexte'; t.contexte++;
        if (contexte[e.lu] && present(contexte[e.lu].son)) t.contexteDispo++;
        listes.contexte.push(e.lu + ' → « ' + choix[e.lu].lod + ' »');
      } else if (!refuses[e.lu] && chercherContextes(index, e.lu).length) { statut = 'relire'; t.relire++; listes.relire.push(e.lu); }
      else { statut = 'sans'; if (refuses[e.lu]) t.refuse++; t.sans++; listes.sans.push(e.lu); }
      if (statut !== 'sans' && statut !== 'relire') parNature[nat].avec++;
    }
    for (const k of Object.keys(total)) total[k] += t[k];
    const dispo = t.direct + t.exacteDispo + t.contexteDispo;
    const possible = t.direct + t.exacte + t.contexte;
    lignes.push('| ' + l.niveau + ' · ' + l.id + ' ' + l.titre_fr + ' | ' + t.elements + ' | ' + t.direct + ' | ' + t.exacte +
      ' | ' + t.contexte + ' | ' + t.sans + ' | ' + pourcent(dispo, t.elements) + ' | ' + pourcent(possible, t.elements) + ' |');
    details.push('### ' + l.niveau + ' · Leçon ' + l.id + ' — ' + l.titre + ' (' + l.titre_fr + ')\n\n' +
      '- **Audio direct (' + listes.direct.length + ')** : ' + (listes.direct.join(', ') || '—') + '\n' +
      '- **Phrases enregistrées à l\'identique (' + listes.exacte.length + ')** : ' + (listes.exacte.join(' · ') || '—') + '\n' +
      '- **Audio contextuel relu (' + listes.contexte.length + ')** : ' + (listes.contexte.join(' · ') || '—') + '\n' +
      (listes.relire.length ? '- **Candidats à relire (' + listes.relire.length + ')** : ' + listes.relire.join(' · ') + '\n' : '') +
      '- **Sans audio (' + listes.sans.length + ')** : ' + (listes.sans.join(' · ') || '—') + '\n');
  }

  // Réservoir pour les prochaines leçons : exemples simples (mot LOD A1/A2, 8 mots au plus).
  const reservoir = { A1: 0, A2: 0 };
  for (const e of index.utilisables) if (e.niveau && e.nbMots <= 8) reservoir[e.niveau]++;

  const dispo = total.direct + total.exacteDispo + total.contexteDispo;
  const possible = total.direct + total.exacte + total.contexte;
  const md = `# Audit audio LOD — couverture par leçon

Généré par \`node tools/lod/audit-audio.js\` (SPEC 70). Ne pas modifier à la main.

## Synthèse

| | Éléments | Part |
|---|---:|---:|
| Éléments luxembourgeois des leçons (sans doublon par leçon) | ${total.elements} | 100 % |
| Audio direct du mot, **validé et disponible** | ${total.direct} | ${pourcent(total.direct, total.elements)} |
| Phrase enregistrée à l'identique dans le LOD | ${total.exacte} (dont ${total.exacteDispo} disponibles) | ${pourcent(total.exacte, total.elements)} |
| Audio contextuel relu et traduit | ${total.contexte} (dont ${total.contexteDispo} disponibles) | ${pourcent(total.contexte, total.elements)} |
| Candidats contextuels pas encore relus | ${total.relire} | ${pourcent(total.relire, total.elements)} |
| Sans audio LOD (dont ${total.refuse} propositions refusées à la relecture) | ${total.sans} | ${pourcent(total.sans, total.elements)} |

**Couverture actuelle (fichiers disponibles)** : ${pourcent(dispo, total.elements)}
**Couverture après téléchargement des phrases identifiées** : ${pourcent(possible, total.elements)}

Les phrases (exactes et contextuelles) viennent de \`lod.lu\`. Tant que ce site est inaccessible depuis l'environnement de Claude,
elles sont identifiées mais pas téléchargées : l'existence réelle de chaque enregistrement est vérifiée au téléchargement.

### Par nature d'élément

| Nature | Éléments | Avec audio (direct, exact ou contextuel) | Part |
|---|---:|---:|---:|
| Mot seul (avec ou sans article) | ${parNature.mot.n} | ${parNature.mot.avec} | ${pourcent(parNature.mot.avec, parNature.mot.n)} |
| Expression (2 à 3 mots) | ${parNature.expression.n} | ${parNature.expression.avec} | ${pourcent(parNature.expression.avec, parNature.expression.n)} |
| Phrase (4 mots ou plus) | ${parNature.phrase.n} | ${parNature.phrase.avec} | ${pourcent(parNature.phrase.avec, parNature.phrase.n)} |

### Réservoir pour les prochaines leçons

L'index contient ${index.nbExemples.toLocaleString('fr-FR')} exemples LOD. Exemples simples (8 mots au plus, rattachés à un mot LOD
de niveau A1 ou A2) : **${reservoir.A1.toLocaleString('fr-FR')} en A1** et **${reservoir.A2.toLocaleString('fr-FR')} en A2**.

## Par leçon

| Leçon | Éléments | Direct | Phrase exacte | Contexte | Sans audio | Disponible | Après téléchargement |
|---|---:|---:|---:|---:|---:|---:|---:|
${lignes.join('\n')}

## Détail

${details.join('\n')}`;
  fs.writeFileSync(SORTIE, md);
  console.log('Audit écrit : ' + path.relative(process.cwd(), SORTIE));
  console.log('Couverture actuelle ' + pourcent(dispo, total.elements) + ', après téléchargement ' + pourcent(possible, total.elements) +
    ' (' + total.elements + ' éléments : ' + total.direct + ' directs, ' + total.exacte + ' phrases exactes, ' + total.contexte + ' contextuels, ' +
    total.relire + ' à relire, ' + total.sans + ' sans audio)');
  console.log('Par nature : ' + Object.entries(parNature).map(([k, v]) => k + ' ' + v.avec + '/' + v.n).join(', '));
}

main();
