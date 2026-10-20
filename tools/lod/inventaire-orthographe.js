// SPEC 73 — Inventaire des corrections orthographiques confirmées par le LOD (sans rien modifier).
//
//   node tools/lod/inventaire-orthographe.js      → docs/inventaire-orthographe-lod.md
//
// Pour chaque graphie LuxApp contestée : preuve LOD (index de recherche versionné), graphie proposée,
// effet sur l'audio, et toutes ses occurrences dans les 25 leçons (cours, cartes, quiz, trous, écriture, mission),
// en distinguant les réponses attendues, les choix proposés et les réponses alternatives acceptées.
const fs = require('fs');
const path = require('path');
const { RACINE, lecons } = require('./commun');
const { chargerFormes } = require('./audit-correspondances');

const SORTIE = path.join(RACINE, 'docs/inventaire-orthographe-lod.md');

// Corrections examinées. « dans » : true = la graphie peut être à l'intérieur d'un mot composé (« dräianaachtzeg »).
const CORRECTIONS = [
  { de: 'wann ech gelift', vers: 'wannechgelift', id: 'WANNECHGELIFT1', son: 'direct (WANNECHGELIFT1.mp3)', insensible: true },
  { de: 'Italiener', vers: 'Italieener', id: 'ITALIEENER1', son: 'direct (ITALIEENER1.mp3)' },
  { de: 'Italienerin', vers: 'Italieenerin', id: 'ITALIEENERIN1', son: 'direct (ITALIEENERIN1.mp3)' },
  { de: 'Italienesch', vers: 'Italieenesch', id: 'ITALIEENESCH1', son: 'direct (ITALIEENESCH1.mp3)',
    note: 'adjectif « italieenesch » dans le LOD ; nom de la langue avec majuscule, comme les autres langues de la leçon 9' },
  { de: 'aachtzeg', vers: 'achtzeg', id: 'ACHTZEG1', son: 'direct pour « achtzeg » et « eenanachtzeg » ; les autres composés n\'ont pas d\'entrée', dans: true },
  { de: 'Fransousin', vers: 'Franséisin', id: 'FRANSEISIN1', son: 'direct (FRANSEISIN1.mp3)' },
  { de: 'Kommod', vers: 'Komoud', id: 'KOMOUD1', son: 'direct (KOMOUD1.mp3)', note: '« Kommoud » est listé comme graphie fautive' },
  { de: 'verlobt', vers: 'verloobt', id: 'VERLOBEN1', son: 'aucun son direct (participe ; le MP3 prononce « verloben ») ; contexte possible' },
];
const CONSERVES = [
  { mot: 'Kirchberg', raison: 'nom propre officiel du quartier (forme française et allemande) ; forme luxembourgeoise « Kierchbierg » (KIERCHBIERG1). Conservé tant qu\'aucune raison pédagogique ou orthographique vérifiée ne justifie le remplacement.' },
  { mot: 'siechzeg', raison: 'graphie contrôlée par le LOD (variante de « sechzeg ») : pas de correction.' },
  { mot: 'eenasiechzeg', raison: 'variante de « eenasechzeg » (entrée LOD propre, prononciation différente) : pas de correction, cohérente avec « siechzeg ».' },
];
const CONTENU = [
  { mot: 'Posch', constat: 'POSCH1 = « sac à main, sacoche » ; « poche » = Täsch (TASCH1). Leçon 6 : « eng Posch | zwou Poschen | deux poches ».',
    proposition: 'corriger la traduction (« deux sacs à main ») ou remplacer l\'exemple par « eng Täsch | zwou Täschen | deux poches ».' },
  { mot: 'trëppelen', constat: 'TREPPELEN2 = « marcher sur, poser le pied sur » ; le sens « marcher, se promener » n\'est pas confirmé par le LOD. Leçon 24 : « trëppelen | getrëppelt | marcher ».',
    proposition: 'à vérifier avec un locuteur ou une autre source avant toute modification.' },
];

// Rôle pédagogique d'un champ (pour mesurer les conséquences d'une correction).
function role(chemin) {
  if (/alternatives/.test(chemin)) return 'réponse alternative acceptée';
  if (/\.trou$|\.reponse$/.test(chemin)) return 'réponse attendue';
  if (/\.choix|\.distracteurs/.test(chemin)) return 'choix proposé';
  if (/^flashcards.*\.lu$/.test(chemin)) return 'mot caché (lettres à reconstruire)';
  if (/^(ecriture|scene).*\.lu$/.test(chemin)) return 'phrase à produire';
  if (/^cours/.test(chemin)) return 'cours';
  if (/^quiz.*\.question$/.test(chemin)) return 'question de quiz';
  if (/^trous.*\.(avant|apres)$/.test(chemin)) return 'phrase à trous (contexte)';
  if (/\.(note|attention|explication)$/.test(chemin)) return 'note / point d\'attention';
  if (/^scene.*\.aide$/.test(chemin)) return 'aide de mission';
  if (/^unites/.test(chemin)) return 'aperçu d\'unité';
  if (/^(mission|instructions)/.test(chemin)) return 'consigne / mission';
  return 'autre texte';
}
function occurrences(regex) {
  const liste = [];
  for (const L of lecons()) {
    const visiter = (o, chemin, idItem) => {
      if (typeof o === 'string') {
        if (regex.test(o.replace(/<[^>]*>/g, ''))) liste.push({ lecon: L.niveau + ' L' + L.id, chemin, id: idItem, texte: o.replace(/<[^>]*>/g, '') });
      } else if (Array.isArray(o)) o.forEach((x, i) => visiter(x, chemin + '[' + i + ']', idItem));
      // L'id de la leçon (racine) n'est pas celui d'un élément.
      else if (o && typeof o === 'object') for (const k of Object.keys(o)) visiter(o[k], chemin ? chemin + '.' + k : k, chemin && o.id != null ? o.id : idItem);
    };
    visiter(L.lecon, '', null);
  }
  return liste;
}
const echapper = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function motif(c) {
  const corps = echapper(c.de);
  if (c.dans) return new RegExp(corps, c.insensible ? 'iu' : 'u');
  return new RegExp('(^|[^\\p{L}])' + corps + '([^\\p{L}]|$)', c.insensible ? 'iu' : 'u');
}

function main() {
  const { recherche } = chargerFormes();
  const statut = g => ((recherche.graphies[g.normalize('NFC').toLowerCase()] || [])[0] || {}).statut || 'absente du LOD';
  const sections = [];
  let total = 0;
  const parRole = {};
  for (const c of CORRECTIONS) {
    const occ = occurrences(motif(c));
    total += occ.length;
    occ.forEach(o => { const r = role(o.chemin); parRole[r] = (parRole[r] || 0) + 1; });
    const lignes = occ.map(o => '| ' + o.lecon + ' | `' + o.chemin.replace(/^(\w+)\[(\d+)\]/, '$1[$2]') + '` | ' + (o.id != null ? o.id : '—') + ' | ' +
      role(o.chemin) + ' | ' + o.texte.replace(/\|/g, '\\|') + ' |');
    sections.push(`### « ${c.de} » → « ${c.vers} »

- Preuve LOD : graphie LuxApp **${statut(c.de)}** ; graphie proposée **${statut(c.vers)}** (\`${c.id}\`).${c.note ? '\n- ' + c.note + '.' : ''}
- Audio après correction : ${c.son}.
- Occurrences : **${occ.length}** (${[...new Set(occ.map(o => o.lecon))].join(', ') || '—'}).

| Leçon | Champ | Id | Rôle | Texte actuel |
|---|---|---|---|---|
${lignes.join('\n') || '| — | — | — | — | — |'}
`);
  }
  const conserves = CONSERVES.map(c => {
    const occ = occurrences(new RegExp('(^|[^\\p{L}])' + echapper(c.mot) + '([^\\p{L}]|$)', 'u'));
    return '| ' + c.mot + ' | ' + c.raison + ' | ' + occ.length + ' (' + [...new Set(occ.map(o => o.lecon))].join(', ') + ') |';
  });
  const contenu = CONTENU.map(c => '| ' + c.mot + ' | ' + c.constat + ' | ' + c.proposition + ' |');
  const md = `# Inventaire des corrections orthographiques confirmées par le LOD — SPEC 73

Généré par \`node tools/lod/inventaire-orthographe.js\` (index de recherche LOD du 2026-07-27, versionné dans \`tools/lod/lod-formes.json.gz\`).
**Aucune leçon n'est modifiée.** Chaque correction attend la décision de Clayton.

## Synthèse

${CORRECTIONS.length} corrections proposées, **${total} occurrences** dans les leçons :
${Object.entries(parRole).sort((a, b) => b[1] - a[1]).map(([r, n]) => '- ' + r + ' : ' + n).join('\n')}

## Conséquences sur la progression

- La progression, les statistiques et la révision espacée sont enregistrées par **identifiant** (leçon, type, \`id\` de la question),
  jamais par le texte : une correction ne fait perdre aucune progression et ne crée pas de nouvelle question.
- **Mot caché** : les lettres à reconstruire changent (« Italiener » → « Italieener » : une lettre de plus).
- **Écriture et mission** : la nouvelle graphie devient la réponse attendue ; un apprenant qui tape l'ancienne serait corrigé.
  Option de transition : garder l'ancienne graphie comme coquille tolérée (SPEC 24) pendant un temps, **sans** l'accepter comme juste.
- **Trous et quiz** : réponse et choix proposés à corriger ensemble (sinon la bonne réponse disparaît des choix).
- **Audio** : chaque correction validée donne un son exact (sauf « verloobt », participe) ; relancer \`node tools/audio-lod.js\`.

## Corrections proposées

${sections.join('\n')}
## Conservés (pas de correction)

| Mot | Raison | Occurrences |
|---|---|---|
${conserves.join('\n')}

## Points de contenu (sens), hors orthographe

| Mot | Constat LOD | Proposition |
|---|---|---|
${contenu.join('\n')}
`;
  fs.writeFileSync(SORTIE, md);
  console.log('Inventaire écrit : docs/inventaire-orthographe-lod.md — ' + CORRECTIONS.length + ' corrections, ' + total + ' occurrences');
}

main();
