// Audit des prérequis (spec 42 §4) : un mot exigé dans le parcours principal
// (quiz, trous, écriture, réponses de la mission) doit avoir été vu AVANT :
//   - dans une leçon précédente (tout son contenu) ;
//   - ou dans la leçon même : mot caché principal, règle, exemple, phrase ou
//     pièges d'une unité de numéro inférieur ou égal, ou aide vocabulaire de l'item.
// Le « + » (plus: true) et les unités bonus ne comptent pas comme appris.
// Lancer : node tools/audit-prerequis.js [niveau]   (par défaut A1.2)
// Rapport seulement : ne bloque rien (formes conjuguées, pluriels… à juger à la main).

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'data', 'lecons');
const niveauAudite = process.argv[2] || 'A1.2';

function mots(texte) {
  return String(texte || '').replace(/<[^>]+>/g, ' ').replace(/[’`´]/g, "'")
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\bd'/g, ' ') // article élidé : « d'Dusch » = « Dusch »
    .split(/[^a-z0-9']+/).map(m => m.replace(/^'+|'+$/g, '')).filter(m => m.length > 1);
}

// Toutes les leçons, dans l'ordre du parcours (numero, sinon id).
const lecons = [];
fs.readdirSync(BASE).sort().forEach(niveau => {
  fs.readdirSync(path.join(BASE, niveau)).filter(f => f.endsWith('.json')).forEach(f => {
    const l = JSON.parse(fs.readFileSync(path.join(BASE, niveau, f), 'utf8'));
    l.niveau = niveau;
    lecons.push(l);
  });
});
const niveaux = [...new Set(lecons.map(l => l.niveau))].sort();
lecons.sort((a, b) => niveaux.indexOf(a.niveau) - niveaux.indexOf(b.niveau) || (a.numero || a.id) - (b.numero || b.id));

// Mots français (côté « fr » de toutes les leçons) : ignorés dans les quiz,
// dont une des deux faces est en français.
const francais = new Set();
lecons.forEach(l => {
  ['flashcards', 'trous', 'ecriture'].forEach(t => (l[t] || []).forEach(x => mots(x.fr).forEach(m => francais.add(m))));
  (l.scene || []).forEach(x => mots(x.fr).forEach(m => francais.add(m)));
  (l.cours || []).forEach(b => (b.items || []).forEach(it => mots(it[1]).forEach(m => francais.add(m))));
});

const dejaVu = new Set();
const ajouter = (set, texte) => mots(texte).forEach(m => set.add(m));
let total = 0;

lecons.forEach(l => {
  const audit = l.niveau === niveauAudite && Array.isArray(l.unites);
  if (audit) {
    const bonus = new Set(l.unites.filter(u => u.bonus).map(u => u.id));
    const manques = [];
    const unitesTriees = l.unites.filter(u => !u.bonus).map(u => u.id).sort((a, b) => a - b);
    unitesTriees.forEach(uid => {
      // Ce qui est enseigné jusqu'à cette unité.
      const vu = new Set(dejaVu);
      l.unites.filter(u => !u.bonus && u.id <= uid).forEach(u => {
        ajouter(vu, u.regle); ajouter(vu, u.exemple); ajouter(vu, (u.phrase || []).join(' ')); ajouter(vu, (u.pieges || []).join(' '));
      });
      (l.flashcards || []).filter(c => !c.plus && c.unite <= uid && !bonus.has(c.unite)).forEach(c => ajouter(vu, c.lu));
      const exige = [];
      (l.quiz || []).filter(q => q.unite === uid && !q.plus).forEach(q => exige.push(['quiz', q.id, q.question + ' / ' + q.reponse, q]));
      (l.trous || []).filter(t => t.unite === uid && !t.plus).forEach(t => exige.push(['trou', t.id, t.trou, t]));
      (l.ecriture || []).filter(e => e.unite === uid && !e.plus).forEach(e => exige.push(['écriture', e.id, e.lu, e]));
      (l.scene || []).filter(x => x.unite === uid && x.qui === 'toi').forEach(x => exige.push(['mission', '', x.lu, x]));
      exige.forEach(([type, id, texte, item]) => {
        const aide = new Set();
        (item.aide_vocab || []).forEach(a => ajouter(aide, a.lu));
        const inconnus = mots(texte).filter(m => !vu.has(m) && !aide.has(m) && !(type === 'quiz' && francais.has(m)));
        if (inconnus.length) manques.push('  u' + uid + ' ' + type + (id ? ' ' + id : '') + ' : ' + inconnus.join(', ') + '   « ' + texte + ' »');
      });
    });
    if (manques.length) {
      console.log('Leçon ' + (l.numero || l.id) + ' (id ' + l.id + ') — ' + l.titre_fr);
      manques.forEach(m => console.log(m));
      total += manques.length;
    }
  }
  // Après la leçon : tout son contenu est connu pour les suivantes.
  ['flashcards', 'quiz', 'trous', 'ecriture'].forEach(t => (l[t] || []).forEach(x => {
    ajouter(dejaVu, x.lu); ajouter(dejaVu, x.reponse); ajouter(dejaVu, x.question); ajouter(dejaVu, x.trou); ajouter(dejaVu, x.avant); ajouter(dejaVu, x.apres);
  }));
  (l.scene || []).forEach(x => ajouter(dejaVu, x.lu));
  (l.cours || []).forEach(b => ajouter(dejaVu, JSON.stringify(b)));
});

console.log('\n' + total + ' item(s) à examiner (' + niveauAudite + ').');
