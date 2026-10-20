// SPEC 73 — Index morphologique compact du LOD (versionné), utilisé par le moteur de correspondance audio.
//
//   node tools/lod/construire-formes.js new_lod-art.xml new_lod-tab.xml new_lod-search.xml
//
// À relancer seulement quand le LOD publie de nouveaux exports (data.public.lu). Les exports restent hors dépôt.
// Sortie : tools/lod/lod-formes.json.gz
//   entrees   : [id, lemme, catégorie, API, [sens fr], [[forme, type]], variante de, niveau, [[id exemple, [formes prononcées]]]]
//   tables    : { id: [[forme, type]] }      formes simples des verbes et adjectifs
//   graphies  : [[graphie, id, statut]]      index de recherche (contrôlée, règle du n, fautive, générée)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { lireArticles, lireTables, lireRecherche } = require('./audit-correspondances');

const SORTIE = path.join(__dirname, 'lod-formes.json.gz');

function main() {
  const [art, tab, rech] = process.argv.slice(2);
  if (!art || !tab || !rech) {
    console.error('Usage : node tools/lod/construire-formes.js new_lod-art.xml new_lod-tab.xml new_lod-search.xml');
    process.exit(1);
  }
  const entrees = lireArticles(art);
  const tables = lireTables(tab);
  const recherche = lireRecherche(rech);
  const sortie = {
    source: 'LOD, exports data.public.lu du 2026-07-27 (articles, tables de flexion, index de recherche), licence CC0',
    entrees: Object.values(entrees).map(e => [e.id, e.lemme, e.categorie, e.ipa, e.fr, e.formes.map(f => [f.forme, f.type]),
      e.varianteDe || null, e.niveau, e.exemples.map(x => [x.id, x.formes])]),
    tables: Object.fromEntries(Object.entries(tables).map(([id, l]) => [id, l.map(f => [f.forme, f.type])])),
    graphies: Object.values(recherche.graphies).flat().map(g => [g.graphie, g.id, g.statut]),
  };
  fs.writeFileSync(SORTIE, zlib.gzipSync(JSON.stringify(sortie), { level: 9 }));
  console.log('Index des formes : ' + sortie.entrees.length + ' entrées, ' + Object.keys(sortie.tables).length + ' tables, ' +
    sortie.graphies.length + ' graphies → ' + path.relative(process.cwd(), SORTIE) + ' (' + Math.round(fs.statSync(SORTIE).size / 1024) + ' Ko)');
}

main();
