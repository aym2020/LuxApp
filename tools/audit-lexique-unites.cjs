// Vérifie que les exercices reprennent le lexique introduit par Mot caché
// dans l'unité courante/précédente. Les mots du « + » ne sont pas acquis
// pour le parcours principal. Rapport global indicatif : autres leçons
// peuvent réutiliser du vocabulaire d'une leçon antérieure.
// node tools/audit-lexique-unites.cjs --lesson 7 --strict
// node tools/audit-lexique-unites.cjs --all
'use strict';
const fs = require('node:fs');
const path = require('node:path');

function normaliser(texte) {
  return String(texte || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function contientForme(texte, forme) {
  const haystack = normaliser(texte), needle = normaliser(forme);
  if (needle.length < 4) return false;
  let pos = haystack.indexOf(needle);
  while (pos !== -1) {
    const gauche = pos === 0 || !/[a-z0-9]/.test(haystack[pos - 1]);
    const droite = pos + needle.length === haystack.length ||
      !/[a-z0-9]/.test(haystack[pos + needle.length]);
    if (gauche && droite) return true;
    pos = haystack.indexOf(needle, pos + 1);
  }
  return false;
}

function texteItem(type, item) {
  if (type === 'quiz') return [item.question, item.reponse];
  if (type === 'trous') return [item.fr, item.avant, item.apres, item.trou];
  if (type === 'ecriture') return [item.fr, item.lu];
  if (type === 'cours') return [JSON.stringify(item.items || []), JSON.stringify(item.echanges || [])];
  return [];
}

function analyserLecon(lecon) {
  if (!Array.isArray(lecon.unites)) return [];
  const cartes = (lecon.flashcards || []).filter(c => c.lu && c.fr);
  const questions = [];
  ['quiz', 'trous', 'ecriture'].forEach(type =>
    (lecon[type] || []).forEach(item => questions.push({ type, item })));
  // Phrases rattachées à une unité : elles aussi doivent respecter le lexique.
  (lecon.cours || []).filter(b => b.unite > 0 && ['phrases', 'dialogue'].includes(b.type))
    .forEach(item => questions.push({ type: 'cours', item }));
  const erreurs = [];
  for (const { type, item } of questions) {
    for (const c of cartes) {
      if (!texteItem(type, item).some(t => contientForme(t, c.lu) || contientForme(t, c.fr))) continue;
      if (c.unite > item.unite || (c.unite === item.unite && c.plus && !item.plus)) {
        erreurs.push({
          unite: item.unite, type, id: item.id || item.titre || '',
          forme: c.lu, sourceUnite: c.unite, sourcePlus: !!c.plus,
          exercicePlus: !!item.plus
        });
      }
    }
  }
  return erreurs;
}

function lireLecons() {
  const base = path.resolve(__dirname, '../data/lecons');
  const resultat = [];
  for (const niveau of fs.readdirSync(base)) {
    const dossier = path.join(base, niveau);
    if (!fs.statSync(dossier).isDirectory()) continue;
    for (const fichier of fs.readdirSync(dossier).filter(f => /^lecon-\d+\.json$/.test(f))) {
      resultat.push({ niveau, ...JSON.parse(fs.readFileSync(path.join(dossier, fichier), 'utf8')) });
    }
  }
  return resultat;
}

function main() {
  const args = process.argv.slice(2);
  const ix = args.indexOf('--lesson');
  const id = ix >= 0 ? Number(args[ix + 1]) : null;
  if (ix >= 0 && !Number.isInteger(id)) throw Error('--lesson attend un ID numérique');
  const candidates = lireLecons().filter(l => id === null || l.id === id);
  if (!candidates.length) throw Error('Aucune leçon trouvée');
  let nb = 0;
  candidates.forEach(l => {
    const erreurs = analyserLecon(l);
    nb += erreurs.length;
    erreurs.forEach(e => console.log('Leçon ' + l.id + ' · unité ' + e.unite +
      ' · ' + e.type + ' ' + e.id + ' : « ' + e.forme + ' » (Mot caché unité ' +
      e.sourceUnite + (e.sourcePlus ? ' + ' : '') + ')'));
  });
  console.log(nb + ' décalage(s) repéré(s) sur ' + candidates.length + ' leçon(s).');
  if (args.includes('--strict') && nb) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { contientForme, analyserLecon };
