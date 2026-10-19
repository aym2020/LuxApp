// Construit l'index LOD compact utilisé par tools/audio-lod.js.
//
//   node tools/lod/construire-index.js chemin/vers/new_lod-art.xml
//
// À lancer seulement quand une nouvelle version du LOD est publiée
// (export « articles » de data.public.lu, ≈ 100 Mo, non versionné).
// Sortie : tools/lod/lod-index.json.gz (versionné), qui contient :
//   mots     : [{ id, lemme, categorie, ipa, fr: [traductions], niveau: 'A1' | 'A2' | '' }]
//   exemples : [{ id, texte, entree }]  (phrases d'exemple enregistrées par le LOD)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SORTIE = path.join(__dirname, 'lod-index.json.gz');

// Texte d'un exemple : les mots dans l'ordre, la ponctuation collée au mot précédent.
function texteExemple(bloc) {
  const mots = [];
  const re = /<(inflectedHeadword|word)>([^<]*)<\/\1>/g;
  let m;
  while ((m = re.exec(bloc))) mots.push(m[2]);
  return mots.join(' ').replace(/\s+([,.;:!?)])/g, '$1').replace(/\(\s+/g, '(')
    .replace(/(^|\s)([dD]['’])\s+/g, '$1$2').trim(); // « d' Aen » → « d'Aen »
}

function main() {
  const fichier = process.argv[2];
  if (!fichier) { console.error('Usage : node tools/lod/construire-index.js new_lod-art.xml'); process.exit(1); }
  const xml = fs.readFileSync(fichier, 'utf8');
  const mots = [];
  const exemples = [];
  for (const morceau of xml.split('<entry id="').slice(1)) {
    const id = morceau.slice(0, morceau.indexOf('"'));
    const lemme = (morceau.match(/<lemma[^>]*>([^<]*)<\/lemma>/) || [])[1];
    if (!lemme) continue;
    const categorie = (morceau.match(/<partOfSpeech[^>]*>([^<]*)<\/partOfSpeech>/) || [])[1] || '';
    const ipa = (morceau.match(/<ipa>([^<]*)<\/ipa>/) || [])[1] || '';
    const fr = [];
    for (const bloc of morceau.match(/<targetLanguage lang="fr">[\s\S]*?<\/targetLanguage>/g) || []) {
      for (const t of bloc.match(/<translation>([^<]*)<\/translation>/g) || []) fr.push(t.replace(/<\/?translation>/g, ''));
    }
    // Niveau LOD du mot (catégories « A1 », « GWS A1 », « A2 »…) : sert à choisir des exemples simples.
    const cats = (morceau.match(/<category>([^<]*)<\/category>/g) || []).map(c => c.replace(/<\/?category>/g, ''));
    const niveau = cats.some(c => /(^| )A1$/.test(c)) ? 'A1' : cats.some(c => /(^| )A2$/.test(c)) ? 'A2' : '';
    mots.push({ id, lemme, categorie, ipa, fr, niveau });
    for (const ex of morceau.match(/<example id="[^"]+">[\s\S]*?<\/example>/g) || []) {
      const exId = ex.match(/<example id="([^"]+)"/)[1];
      const bloc = ex.match(/<text>[\s\S]*?<\/text>/); // la phrase seule, sans sa paraphrase
      const texte = bloc ? texteExemple(bloc[0]) : '';
      if (texte) exemples.push({ id: exId, texte, entree: id });
    }
  }
  fs.writeFileSync(SORTIE, zlib.gzipSync(JSON.stringify({ mots, exemples })));
  console.log('Index LOD : ' + mots.length + ' mots, ' + exemples.length + ' exemples → ' + path.relative(process.cwd(), SORTIE) +
    ' (' + Math.round(fs.statSync(SORTIE).size / 1024) + ' Ko)');
}

main();
