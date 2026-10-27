'use strict';
// SPEC 110 lot D4 — Lux Démasque : affaires atomiques, dossiers rédigés, générateur seedé.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const Core = require('../public/lux-demasque-core.js');
const C = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/jeux/lux-demasque/contenus-v01.json'), 'utf8'));
const GRAINES = 1000;

// Joue toutes les objections possibles d'un dossier (tout écouté, tout consulté) et renvoie
// les paires qui démasquent, avec ou sans les précisions.
function pairesGagnantes(dossier, precisions) {
  const base = () => {
    const e = Core.nouvellePartie(C, { dossier });
    Core.commencer(e);
    dossier.declarations.forEach((d, i) => Core.allerA(e, i));
    if (precisions) dossier.declarations.forEach(d => Core.preciser(e, d.id));
    dossier.pieces.forEach(p => Core.consulter(e, p));
    return e;
  };
  const gagnantes = [];
  const pieces = Core.carnet(base()).map(c => c.id);
  dossier.declarations.forEach(d => pieces.forEach(p => {
    const r = Core.objecter(base(), d.id, p);
    if (r.resultat === 'demasque') gagnantes.push(d.id + '×' + p);
  }));
  return gagnantes.sort();
}
function attendues(dossier, precisions) {
  return dossier.declarations.filter(d => !d.vrai && (precisions || !d.mensonge.exigePrecision))
    .map(d => d.id + '×' + d.mensonge.preuves[0][0]).sort();
}

test('Catalogue : affaires valides, preuves internes, aucune variable dans le luxembourgeois', () => {
  assert.deepEqual(Core.validerAffaires(C), []);
  const mensonges = C.affaires.filter(a => !a.vrai), verites = C.affaires.filter(a => a.vrai);
  assert.ok(mensonges.length >= 8 && verites.length >= 8, mensonges.length + ' / ' + verites.length);
  assert.ok(C.affaires.length >= 12 && C.affaires.length <= 18);
  assert.ok(mensonges.some(a => a.mensonge.exigePrecision) && mensonges.some(a => a.croise));
  // Chaque mensonge a un motif, une explication, une justification propre et au moins un leurre.
  mensonges.forEach(a => {
    assert.ok(a.mensonge.motivationFr && a.mensonge.explicationFr && a.mensonge.aveuFr && a.mensonge.justification.lu, a.id);
    assert.ok(a.pieces.length >= 2 && Object.keys(a.refusPieces || {}).length >= 1, a.id + ' : leurre');
  });
});

test('Dossiers rédigés (Noah, Tom) : valides, 3 mensonges / 3 vérités, solution exacte', () => {
  (C.dossiersRediges || []).forEach(r => {
    const d = Core.trouverDossier(C, r.id);
    assert.deepEqual(Core.validerDossier(C, d), [], r.id);
    assert.equal(d.declarations.filter(x => !x.vrai).length, 3);
    assert.deepEqual(pairesGagnantes(d, true), attendues(d, true), r.id);
    assert.deepEqual(pairesGagnantes(d, false), attendues(d, false), r.id + ' sans précision');
    assert.ok(!JSON.stringify(d).includes('{npc}'), r.id);
  });
});

test('1 000 graines : dossiers valides, reproductibles, équilibrés, jamais un prétendant rédigé', () => {
  const combinaisons = new Set(), parAffaire = {};
  for (let g = 1; g <= GRAINES; g++) {
    const d = Core.composerDossier(C, { graine: g });
    assert.ok(d, 'graine ' + g);
    assert.deepEqual(Core.validerDossier(C, d), [], 'graine ' + g);
    assert.equal(JSON.stringify(d), JSON.stringify(Core.composerDossier(C, { graine: g })), 'reproductible');
    assert.ok(C.generateur.npcs.includes(d.npc) && !['milo', 'noah', 'tom'].includes(d.npc));
    const mensonges = d.declarations.filter(x => !x.vrai);
    assert.equal(mensonges.length, 3); assert.equal(d.declarations.length, 6);
    assert.ok(mensonges.some(x => x.mensonge.exigePrecision), 'graine ' + g + ' : une précision indispensable');
    assert.ok(d.affaires.some(id => C.affaires.find(a => a.id === id).croise), 'graine ' + g + ' : un recoupement');
    assert.equal(new Set(d.declarations.map(x => x.theme)).size, 6);
    d.affaires.forEach(id => (C.affaires.find(a => a.id === id).incompatibles || []).forEach(x => assert.ok(!d.affaires.includes(x), id + ' + ' + x)));
    assert.ok(!d.declarations.slice(0, 3).every(x => !x.vrai), 'pas trois mensonges en tête');
    assert.ok(!JSON.stringify(d).includes('{npc}'), 'prénom remplacé partout');
    combinaisons.add(d.affaires.slice().sort().join(','));
    d.affaires.forEach(id => { parAffaire[id] = (parAffaire[id] || 0) + 1; });
  }
  // Des dizaines de situations réellement différentes, toutes les affaires utilisées.
  assert.ok(combinaisons.size >= 100, combinaisons.size + ' combinaisons');
  C.affaires.forEach(a => assert.ok(parAffaire[a.id] > 0, a.id + ' jamais tirée'));
});

test('300 graines : seule la bonne pièce démasque, chaque mensonge est prouvable, zéro faux positif', () => {
  for (let g = 1; g <= 300; g++) {
    const d = Core.composerDossier(C, { graine: g });
    assert.deepEqual(pairesGagnantes(d, true), attendues(d, true), 'graine ' + g);
    assert.deepEqual(pairesGagnantes(d, false), attendues(d, false), 'graine ' + g + ' sans précision');
    // Toutes les bonnes objections, dans l'ordre inverse : 3/3 sans faute.
    const e = Core.nouvellePartie(C, { dossier: d });
    Core.commencer(e);
    d.declarations.forEach((x, i) => Core.allerA(e, i));
    d.declarations.forEach(x => Core.preciser(e, x.id));
    d.pieces.forEach(p => Core.consulter(e, p));
    d.declarations.filter(x => !x.vrai).reverse().forEach(x => assert.equal(Core.objecter(e, x.id, x.mensonge.preuves[0][0]).resultat, 'demasque'));
    const fin = Core.conclure(e);
    assert.deepEqual([fin.trouvees, fin.total, fin.sansFaute], [3, 3, true]);
  }
});

test('Cohérence des faits : dates de juillet, août et septembre 2026 vérifiées par calcul', () => {
  const jours = (mois, semaine) => { const l = []; for (let j = 1; j <= 31; j++) { const t = new Date(Date.UTC(2026, mois, j)); if (t.getUTCMonth() === mois && semaine.includes(t.getUTCDay())) l.push(j); } return l; };
  assert.deepEqual(jours(6, [2, 4]), [2, 7, 9, 14, 16, 21, 23, 28, 30]);  // mardis et jeudis de juillet : 9 entraînements
  assert.equal(jours(6, [2, 4]).length, 9);
  for (let debut = 1; debut + 13 <= 31; debut++) assert.ok(jours(6, [2, 4]).filter(j => j >= debut && j <= debut + 13).length >= 4); // 2 semaines ⊃ 4 séances
  assert.deepEqual(jours(7, [0]), [2, 9, 16, 23, 30]);
  assert.ok(jours(8, [0]).includes(6) && jours(8, [0]).includes(20));      // 6 et 20 septembre = dimanches
  const p = id => C.affaires.flatMap(a => a.pieces).find(x => x.id === id);
  assert.match(p('AMIS_COACH').transcription, /9 entraînements/);
  assert.match(p('LUXRUN_MERL').transcription, /2, 9, 16, 23 et 30 août/);
  assert.match(p('LUXRUN_SEPT').transcription, /2 courses, le 6 et le 20 septembre/);
  // Aucune pièce n'avoue : pas de « j'ai menti », « jamais allé », « pas médecin »…
  C.affaires.flatMap(a => a.pieces).forEach(x => assert.doesNotMatch(x.transcription, /menti|jamais (été|allé)|pas (médecin|musicien)|chômage|sans emploi/i, x.id));
});

test('Rejouer : même dossier généré + mêmes décisions = même partie', () => {
  const d = Core.composerDossier(C, { graine: 4242 });
  const jouer = () => {
    const e = Core.nouvellePartie(C, { dossier: Core.composerDossier(C, { graine: 4242 }) });
    Core.commencer(e);
    d.declarations.forEach((x, i) => Core.allerA(e, i));
    d.pieces.forEach(p => Core.consulter(e, p));
    Core.objecter(e, d.declarations[0].id, d.pieces[0]);
    Core.objecter(e, d.declarations[2].id, d.pieces[3]);
    Core.conclure(e);
    return JSON.stringify([e.journal, e.fin]);
  };
  assert.equal(jouer(), jouer());
});
