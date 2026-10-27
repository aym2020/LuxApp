'use strict';
// SPEC 109 §18.2–18.3 (lot 10A) : affirmation ≠ mensonge ≠ contradiction ≠ blague ≠ aveu,
// et bilan fidèle aux réponses réellement choisies.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const Core = require('../public/lux-match-core.js');
const donnees = { contenus: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/jeux/lux-match/contenus-v02.json'), 'utf8')) };

// Rendez-vous avec une suite de scènes imposée (après la salutation).
function rendezVous(profilId, scenes, graine) {
  const etat = Core.nouvellePartie(donnees, { graine: graine || 7, parties: 5 });
  Core.commencerSwipes(etat);
  etat.paquet = [profilId]; etat.indexCarte = 0; etat.likesAvantMatch = 1;
  Core.swiper(etat, true);
  Core.apresMatch(etat, 'date');
  Core.choisirLook(etat, null, null);
  Core.commencerDate(etat);
  etat.file = scenes.slice();
  etat.etapes = { rappel: true, demain: true }; // pas de rappel ni de « à demain » automatiques
  etat.courant = null;
  Core.continuer(etat);
  return etat;
}
function jouer(etat, id) {
  assert.ok(etat.courant.choix.some(c => c.id === id), 'choix ' + id + ' absent de ' + etat.courant.id);
  const r = Core.repondre(etat, id);
  Core.continuer(etat);
  return r;
}
const lignes = (etat, type) => etat.fin.resume.filter(l => !type || l.type === type).map(l => l.fr);
// Termine avec des réponses vraies et correctes (clôture comprise).
const finir = etat => {
  let g = 0;
  while (etat.phase === 'date' && g++ < 20) {
    const c = etat.courant.choix;
    jouer(etat, (c.find(x => x.truth === 'honest' && x.languageCorrect !== false) || c.find(x => x.languageCorrect !== false) || c[0]).id);
  }
};

// Parcours Emma de la recette Android : 30 ans, Portugal, luxembourgeois, France au rappel.
function emma(reponseB25) {
  const etat = rendezVous('emma_r01', ['B04_AGE', 'B05_ORIGIN', 'B13_NATIONALITY', 'RAPPEL_ORIGINE', 'B18_END']);
  jouer(etat, 'REP04_B');
  jouer(etat, 'REP05_B');
  const r = jouer(etat, 'REP13_C');
  assert.ok(!r.contradiction, 'Portugal + nationalité luxembourgeoise n’est pas contradictoire');
  const rappel = jouer(etat, 'RAPPEL_ORIGINE_FR');
  assert.ok(rappel.contradiction);
  assert.deepEqual(rappel.attributsContredits, ['origin']);
  assert.equal(etat.courant.id, 'B25_TRUTH_REPAIR');
  jouer(etat, reponseB25);
  finir(etat);
  assert.equal(etat.phase, 'resultats');
  return etat;
}

test('Portugal → France → « Jo. » : contradiction maintenue, jamais un aveu ni un « bluff réparé »', () => {
  const etat = emma('REP25_C');
  assert.equal(etat.aveux, 0);
  assert.deepEqual(etat.avoues, {});
  assert.ok(!lignes(etat).some(l => /réparé|avoué \(/.test(l)), lignes(etat).join(' | '));
  assert.ok(lignes(etat).some(l => /Changement de version sans aveu : d’abord tu viens du Portugal, puis tu viens de France/.test(l)));
  assert.ok(lignes(etat).some(l => /maintenu ta version/.test(l)));
  assert.ok(lignes(etat, 'contradiction').length >= 1);
  // Les deux autres bluffs restent des bluffs jamais avoués.
  assert.ok(lignes(etat).includes('Bluff jamais avoué : tu as 30 ans.'));
  assert.ok(lignes(etat).includes('Bluff jamais avoué : tu es luxembourgeois.'));
  const types = etat.journal.map(j => j.type);
  assert.ok(types.includes('contradiction') && types.includes('maintenu') && !types.includes('aveu'));
});

test('Portugal → France → « Entschëllegt, ech hu gelunn. » : aveu ciblé sur l’origine seulement', () => {
  const etat = emma('REP25_B');
  assert.equal(etat.aveux, 1);
  assert.deepEqual(Object.keys(etat.avoues), ['origin']);
  assert.ok(lignes(etat, 'aveu').some(l => /Bluff avoué \(tu viens du Portugal\)/.test(l)));
  // Plusieurs mensonges, un seul avoué : l'âge et la nationalité restent des bluffs actifs.
  assert.ok(etat.mensonges.age && etat.mensonges.nationality);
  assert.ok(lignes(etat).includes('Bluff jamais avoué : tu as 30 ans.'));
  assert.equal(etat.claims.age, 30);
});

test('« Nee, dat war e Witz. » : plaisanterie assumée, pas un aveu', () => {
  const etat = emma('REP25_A');
  assert.equal(etat.aveux, 0);
  assert.ok(etat.blaguesAssumees.origin && !etat.avoues.origin);
  assert.ok(lignes(etat).some(l => /rattrapé en « c’était une blague » : ce n’est pas un aveu/.test(l)));
  assert.ok(etat.journal.some(j => j.type === 'blague_assumee'));
});

test('Contradiction France → Portugal puis aveu : la vérité est rétablie sur cet attribut', () => {
  const etat = rendezVous('sofia_r01', ['B05_ORIGIN', 'B13_NATIONALITY', 'RAPPEL_ORIGINE', 'B18_END']);
  jouer(etat, 'REP05_A');
  jouer(etat, 'REP13_A');
  const r = jouer(etat, 'RAPPEL_ORIGINE_PT');
  assert.ok(r.contradiction);
  assert.ok(etat.mensonges.origin);
  jouer(etat, 'REP25_B');
  assert.equal(etat.claims.origin, 'Frankräich');
  assert.ok(!etat.mensonges.origin && etat.avoues.origin);
});

test('Jamais menti : aucun « bluff réparé », aucune ligne de bluff', () => {
  const etat = rendezVous('emma_r01', ['B04_AGE', 'B05_ORIGIN', 'B13_NATIONALITY', 'RAPPEL_ORIGINE', 'B18_END']);
  jouer(etat, 'REP04_A'); jouer(etat, 'REP05_A'); jouer(etat, 'REP13_A'); jouer(etat, 'RAPPEL_ORIGINE_FR');
  finir(etat);
  assert.ok(lignes(etat, 'sincere').length === 1);
  assert.ok(!lignes(etat).some(l => /[Bb]luff|version/.test(l)));
  assert.ok(etat.journal.every(j => j.type !== 'claim' || j.vrai));
});

test('Origine et nationalité : Portugal + luxembourgeois accepté, Portugal + français = incohérent', () => {
  // Emma (pas de quiz portugais déclenché par le bluff, contrairement à Sofia).
  let etat = rendezVous('emma_r01', ['B05_ORIGIN', 'B13_NATIONALITY', 'B18_END']);
  jouer(etat, 'REP05_B');
  assert.ok(!jouer(etat, 'REP13_C').contradiction);
  etat = rendezVous('emma_r01', ['B05_ORIGIN', 'B13_NATIONALITY', 'B18_END']);
  jouer(etat, 'REP05_B');
  const r = jouer(etat, 'REP13_A');
  assert.ok(r.contradiction);
  assert.deepEqual(r.attributsContredits, ['origin', 'nationality']);
});

test('Événement : « C’était une blague ! » n’est plus compté comme un aveu', () => {
  const etat = rendezVous('claire_r01', ['B08_PROFESSION', 'B18_END']);
  jouer(etat, 'REP08_B'); // « Ech sinn Dokter. » (bluff)
  assert.equal(etat.courant.id, 'EV_CLAIRE_JOB');
  const r = jouer(etat, 'EV_CLAIRE_JOB_C3');
  assert.ok(!r.aveu && r.blagueAssumee);
  assert.equal(etat.aveux, 0);
  assert.ok(etat.blaguesAssumees.job && !etat.avoues.job);
});

test('Bilan : « Tes réponses » = choix réellement joués ; phrases modèles séparées', () => {
  const etat = emma('REP25_C');
  const reponses = Core.reponsesJouees(etat);
  const lu = reponses.map(r => r.reponse.lu);
  assert.ok(lu.includes('Ech sinn drësseg Joer al.'), 'l’âge joué (30 ans) apparaît');
  assert.ok(!lu.includes('Ech sinn aachtanzwanzeg Joer al.'), 'jamais remplacé par 28 ans');
  assert.ok(lu.includes('Ech kommen aus Portugal.') && lu.includes('Ech sinn e Lëtzebuerger.') && lu.includes('Jo.'));
  assert.equal(reponses.find(r => r.reponse.lu === 'Ech sinn drësseg Joer al.').truth, 'lie');
  // Ordre réel conservé.
  assert.ok(lu.indexOf('Ech sinn drësseg Joer al.') < lu.indexOf('Ech kommen aus Portugal.'));
  // Un mensonge grammaticalement correct garde ses points de langue.
  assert.equal(etat.fin.langue, 100);
  const modeles = Core.phrasesModeles(etat);
  const age = modeles.find(m => m.question.lu === 'Wéi al bass du?');
  assert.equal(age.reponse.lu, 'Ech sinn aachtanzwanzeg Joer al.');
  assert.equal(age.dejaJouee, false);
});

test('Bilan sincère : les phrases jouées sont marquées « modèle », aucun doublon à réviser', () => {
  const etat = rendezVous('emma_r01', ['B04_AGE', 'B05_ORIGIN', 'B18_END']);
  jouer(etat, 'REP04_A'); jouer(etat, 'REP05_A'); finir(etat);
  const reponses = Core.reponsesJouees(etat).filter(r => r.question.lu === 'Wéi al bass du?' || r.question.lu === 'Vu wou kënns du?');
  assert.equal(reponses.length, 2);
  assert.ok(reponses.every(r => r.modele));
  assert.ok(Core.phrasesModeles(etat).every(m => m.dejaJouee));
});

test('Journal isolé : trois parties consécutives ne partagent aucun état', () => {
  const a = emma('REP25_C');
  const b = emma('REP25_B');
  const c = rendezVous('emma_r01', ['B04_AGE', 'B18_END']);
  assert.notEqual(a.journal, b.journal);
  assert.equal(c.journal.length, 0);
  assert.deepEqual(c.avoues, {});
  assert.deepEqual(c.derniereContradiction, []);
  assert.equal(a.aveux, 0); assert.equal(b.aveux, 1);
});
