// SPEC 70 — Chercher des phrases LOD enregistrées pour construire une leçon.
//
//   node tools/lod/exemples.js "wunnen zu"            → exemples A1/A2 qui contiennent cette suite de mots
//   node tools/lod/exemples.js "wunnen zu" --tous     → aussi les exemples hors A1/A2
//
// Les plus simples d'abord (niveau A1, puis A2, puis les plus courts). Chaque ligne donne l'identifiant
// de l'enregistrement : la phrase reprise telle quelle dans une leçon aura son audio LOD exact
// (relancer ensuite node tools/audio-lod.js). Ne jamais retoucher la phrase : sinon l'audio ne correspond plus.
const { phraseCle, majuscule, lireIndex } = require('./commun');

const args = process.argv.slice(2);
const tous = args.includes('--tous');
const recherche = phraseCle(args.filter(a => a !== '--tous').join(' '));
if (!recherche) { console.error('Usage : node tools/lod/exemples.js "mots à chercher" [--tous]'); process.exit(1); }

const index = lireIndex();
const vus = new Set();
const resultats = index.utilisables
  .filter(e => (tous || e.niveau) && (' ' + e.cle + ' ').includes(' ' + recherche + ' '))
  .filter(e => !vus.has(e.id) && vus.add(e.id))
  .sort((a, b) => ({ A1: 0, A2: 1, '': 2 }[a.niveau] - { A1: 0, A2: 1, '': 2 }[b.niveau]) || a.nbMots - b.nbMots);
for (const e of resultats.slice(0, 40)) console.log((e.niveau || '--') + '  ' + majuscule(e.texte) + '   [' + e.id + ']');
console.log('\n' + resultats.length + ' exemple(s)' + (resultats.length > 40 ? ' (40 premiers affichés)' : ''));
