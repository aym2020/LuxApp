// Diagnostic d'erreur et masquage de la réponse (S6), sans navigateur.
const fs = require('fs');
const path = require('path');
const racine = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(racine, 'public/app.js'), 'utf8');
// normalize et escHtml viennent de app.js ; attentionHtml de parcours.js.
const extraire = (src, nom) => src.slice(src.indexOf('function ' + nom + '('), src.indexOf('\n}\n', src.indexOf('function ' + nom + '(')) + 3);
eval(extraire(app, 'normalize'));
eval(extraire(app, 'escHtml'));
eval(extraire(fs.readFileSync(path.join(racine, 'public/parcours.js'), 'utf8'), 'attentionHtml'));
eval(fs.readFileSync(path.join(racine, 'public/diagnostic.js'), 'utf8'));

let echecs = 0;
function verifie(nom, obtenu, attendu) {
  const ok = obtenu === attendu;
  if (!ok) echecs++;
  console.log((ok ? '  ok    ' : '  ÉCHEC ') + nom + (ok ? '' : ' → obtenu « ' + obtenu + ' », attendu « ' + attendu + ' »'));
}

const ARTICLE = 'Bon mot, mauvais article. Le genre ne suit pas le français.';
verifie('mauvais article', diagnostic('Dat ass e Mapp.', 'Dat ass eng Mapp.'), ARTICLE);
verifie('mauvais article (en/e)', diagnostic('dat ass e Telefon', 'Dat ass en Telefon.'), ARTICLE);
verifie('ordre', diagnostic('Ass dat eng Mapp?', 'Dat ass eng Mapp?'), 'Tous les mots sont là, mais pas dans le bon ordre.');
verifie('mot manquant (net)', diagnostic('Ech sinn midd.', 'Ech sinn net midd.'), 'Il manque un mot.');
verifie('mot en trop', diagnostic('Dat ass eng eng Mapp.', 'Dat ass eng Mapp.'), 'Il y a un mot en trop.');
verifie('une lettre en moins', diagnostic('Mapp', 'Mappe'), 'Presque : une lettre à corriger.');
verifie('une lettre (faute)', diagnostic('Stëfft', 'Stëft'), 'Presque : une lettre à corriger.');
verifie('accents ignorés', diagnostic('Fenster', 'Fënster'), '');
verifie('rien de connu', diagnostic('bag', 'Mapp'), '');

const mapp = { lu: 'Mapp', article: 'eng' };
const note = 'Mapp est <b>féminin</b> (≠ un sac) → <b>eng</b> Mapp.';
verifie('masque mot + article', masquerReponse(note, mapp), '… est <b>féminin</b> (≠ un sac) → ….');
verifie('trop court après masquage', masquerReponse('<b>eng</b> Mapp', mapp), '');
verifie('pas de faux positif', masquerReponse('Le genre ne se devine pas : apprends-le avec le mot.', mapp),
  'Le genre ne se devine pas : apprends-le avec le mot.');
const phrase = { lu: 'Nee, dat ass keen Handy.' };
verifie('écriture : mots de la réponse masqués', masquerReponse('Avec <b>keen</b> on nie un nom : keen Handy.', phrase),
  'Avec <b>…</b> on nie un nom : … ….');

// Sur les vraies notes de la leçon 2 : aucune ne doit laisser voir le mot cherché.
const l2 = JSON.parse(fs.readFileSync(path.join(racine, 'data/lecons/A1.1/lecon-02.json'), 'utf8'));
let fuites = 0, notes = 0;
l2.flashcards.filter(c => c.attention).forEach(c => {
  notes++;
  const m = masquerReponse(c.attention, c).replace(/<[^>]+>/g, '');
  if (new RegExp('(^|[^\\p{L}])' + c.lu + '(?![\\p{L}])', 'iu').test(m)) { fuites++; console.log('  FUITE ', c.lu, '→', m); }
});
verifie('leçon 2 : ' + notes + ' notes, aucune ne montre le mot', fuites, 0);

console.log(echecs ? echecs + ' échec(s)' : 'tout est bon');
process.exit(echecs ? 1 : 0);
