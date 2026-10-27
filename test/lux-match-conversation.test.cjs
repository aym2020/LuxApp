'use strict';
// SPEC 109 §18.4 (lot 10B) : suspicion perceptible, conversation variée, confrontation
// propre à la contradiction, au revoir cohérent avec l'ambiance.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const Core = require('../public/lux-match-core.js');
const C = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/jeux/lux-match/contenus-v02.json'), 'utf8'));
const donnees = { contenus: C };

function rendezVous(profilId, scenes, options) {
  const etat = Core.nouvellePartie(donnees, { graine: 7, parties: 5 });
  Core.commencerSwipes(etat);
  etat.paquet = [profilId]; etat.indexCarte = 0; etat.likesAvantMatch = 1;
  Core.swiper(etat, true);
  if (options && options.rappel !== undefined) etat.plan.rappel = options.rappel;
  if (options && options.cloture) etat.plan.cloture = options.cloture;
  Core.apresMatch(etat, 'date');
  Core.choisirLook(etat, null, null);
  Core.commencerDate(etat);
  etat.file = scenes.slice();
  etat.etapes = (options && options.etapes) || { rappel: true, demain: true };
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
const ETAT_CIVIL = ['B03_NAME', 'B04_AGE', 'B05_ORIGIN', 'B06_CITY', 'B13_NATIONALITY'];

test('Suspicion : un bluff plausible ne se voit pas ; son sujet favori et l’accumulation, si', () => {
  const etat = rendezVous('emma_r01', ['B04_AGE', 'B06_CITY', 'B08_PROFESSION', 'B07_LANGUAGE', 'B18_END']);
  let r = jouer(etat, 'REP04_B');           // 30 ans : plausible, elle ne peut pas savoir
  assert.equal(r.suspicion, 0);
  r = jouer(etat, 'REP06_B');               // Lëtzebuerg : 2e bluff, toujours invisible
  assert.equal(r.suspicion, 0);
  r = jouer(etat, 'REP08_C');               // Polizist : 3e bluff actif → portrait trop beau
  assert.equal(r.suspicion, 5);
  assert.equal(r.reaction.cle, 'TROP_BEAU');
  assert.equal(r.emotion.type, 'doubt');
  r = jouer(etat, 'REP07_C');               // 4e : encore un peu plus
  assert.equal(r.suspicion, 8);
  // Le bluff sur le sujet de la partenaire se remarque tout de suite (Claire et son métier).
  const claire = rendezVous('claire_r01', ['B08_PROFESSION', 'B18_END']);
  r = jouer(claire, 'REP08_C');
  assert.equal(r.suspicion, 6);
  assert.equal(r.reaction.cle, 'BLUFF');
});

test('Scénarios : jamais origine ET nationalité, et l’état civil ne s’enchaîne pas (6 × 1 000 graines)', () => {
  C.profils.forEach(profil => {
    let enchaines = 0;
    for (let g = 1; g <= 1000; g++) {
      const scenes = Core.composerScenario(C, profil, g).scenes;
      assert.ok(!(scenes.includes('B05_ORIGIN') && scenes.includes('B13_NATIONALITY')), profil.id + ' ' + g);
      let suite = 0, max = 0;
      scenes.forEach(id => { suite = ETAT_CIVIL.includes(id) ? suite + 1 : 0; max = Math.max(max, suite); });
      // Prénom + âge + une 3e question d'état civil : seulement si c'est SON sujet (Sofia et le Portugal).
      if (max >= 3) { enchaines++; assert.ok(profil.beatsForts.includes('B05_ORIGIN'), profil.id + ' ' + g + ' : ' + scenes.join(' ')); }
      // L'acte 2 s'ouvre sur un vrai sujet, jamais sur la question d'Alex.
      const acte2 = scenes.filter(id => !['B01_SALUT', 'B02_SALUT_SOIR', 'B03_NAME', 'B04_AGE'].includes(id));
      assert.notEqual(acte2[0], 'B21_ASK_HER', profil.id + ' ' + g);
      if (scenes.includes('B09_WORKPLACE')) assert.equal(scenes.indexOf('B09_WORKPLACE'), scenes.indexOf('B08_PROFESSION') + 1);
    }
    assert.ok(enchaines <= 50, profil.id + ' : ' + enchaines);
  });
});

test('Rappel : jamais sur ce qui vient d’être dit, un bluff rappelé plus souvent mais pas toujours', () => {
  let surBluff = 0, total = 0;
  for (let g = 1; g <= 200; g++) {
    const etat = Core.nouvellePartie(donnees, { graine: g, parties: 5 });
    Core.commencerSwipes(etat);
    etat.paquet = ['emma_r01']; etat.likesAvantMatch = 1;
    Core.swiper(etat, true);
    etat.plan.rappel = true;
    Core.apresMatch(etat, 'date'); Core.choisirLook(etat, null, null); Core.commencerDate(etat);
    etat.file = ['B03_NAME', 'B04_AGE', 'B12_COFFEE_OFFER', 'B06_CITY']; etat.courant = null; Core.continuer(etat);
    jouer(etat, 'REP03_A'); jouer(etat, 'REP04_B');
    jouer(etat, etat.courant.choix[0].id);
    jouer(etat, 'REP06_A');                 // la ville vient d'être dite : pas de rappel dessus
    if (etat.courant.type !== 'rappel') continue;
    total++;
    assert.notEqual(etat.courant.source.attribut, 'city', 'graine ' + g);
    if (etat.courant.source.attribut === 'age') surBluff++;
  }
  assert.ok(total > 150);
  assert.ok(surBluff / total > 0.5 && surBluff / total < 0.85, surBluff + '/' + total);
});

test('Confrontation : « Portugal oder Frankräich? » et « maintenir » reprend la phrase dite', () => {
  const etat = rendezVous('emma_r01', ['B05_ORIGIN', 'RAPPEL_ORIGINE', 'B18_END']);
  jouer(etat, 'REP05_B');
  const r = jouer(etat, 'RAPPEL_ORIGINE_FR');
  assert.equal(r.reaction.fr, 'Elle fronce les sourcils : d’abord tu viens du Portugal, et maintenant tu viens de France ?');
  assert.equal(etat.courant.id, 'B25_TRUTH_REPAIR');
  assert.equal(etat.courant.prompt.lu, 'Portugal oder Frankräich?');
  assert.equal(etat.courant.prompt.fr, 'Le Portugal ou la France ?');
  const maintien = etat.courant.choix.find(c => c.explication === 'maintien');
  assert.equal(maintien.lu, 'Ech kommen aus Frankräich.');
  assert.equal(maintien.fr, 'Je viens de France.');
  // Le contenu partagé n'est jamais modifié.
  assert.equal(C.evenements.B25_TRUTH_REPAIR.choices.find(c => c.id === 'REP25_C').lu, 'Jo.');
});

test('Confrontation : prénom et âge ; repli « Ass dat wouer? » pour une incohérence croisée', () => {
  let etat = rendezVous('lena_r01', ['B03_NAME', 'B15_NAME_RECALL', 'B18_END']);
  jouer(etat, 'REP03_B'); jouer(etat, 'REP15_A');
  assert.equal(etat.courant.prompt.lu, 'Max oder Alex?');
  assert.equal(etat.courant.choix.find(c => c.explication === 'maintien').lu, 'Ech heeschen Alex.');
  etat = rendezVous('emma_r01', ['B04_AGE', 'B16_AGE_RECALL', 'B18_END']);
  jouer(etat, 'REP04_B'); jouer(etat, 'REP16_A');
  assert.equal(etat.courant.prompt.lu, 'Drësseg oder aachtanzwanzeg?');
  assert.equal(etat.courant.prompt.fr, '30 ans ou 28 ans ?');
  etat = rendezVous('emma_r01', ['B05_ORIGIN', 'B13_NATIONALITY', 'B18_END']);
  jouer(etat, 'REP05_B');
  const r = jouer(etat, 'REP13_A');
  assert.equal(r.reaction.fr, 'Elle fronce les sourcils : tu viens du Portugal et tu es français ?');
  assert.equal(etat.courant.prompt.lu, 'Ass dat wouer?');
});

test('Confrontation : chaque valeur affirmable a ses mots LU et FR (aucune interpolation libre)', () => {
  const conf = C.evenements.B25_TRUTH_REPAIR.confrontation;
  assert.equal(conf.modele.lu, '{a} oder {b}?');
  const sources = Object.values(C.beats).concat(Object.values(C.evenements)).flatMap(b => b.choices || []);
  sources.forEach(c => Object.keys(c.claims || {}).forEach(cle => {
    const v = c.claims[cle];
    if (typeof v === 'boolean') return;      // oui / non : repli « Ass dat wouer? »
    assert.ok(conf.valeurs[cle] && conf.valeurs[cle][String(v)], cle + ' = ' + v + ' (' + c.id + ')');
  }));
  Object.values(C.rappels).forEach(r => r.choices.forEach(c => {
    if (c.valeur === 'blague') return;
    assert.ok(conf.valeurs[r.attribut][String(c.valeur)], r.attribut + ' = ' + c.valeur);
  }));
  // Mots LU : noms et nombres des leçons, sans article ni verbe.
  Object.values(conf.valeurs).forEach(m => Object.values(m).forEach(([lu]) => assert.match(lu, /^[A-Za-zÄËÉäëé][a-zäëéèöü]+$/)));
});

test('Au revoir : pas de « Et war flott! » après une dispute, transition amenée', () => {
  const etat = rendezVous('emma_r01', ['B05_ORIGIN', 'RAPPEL_ORIGINE'], { cloture: 'B26_DATE_FAREWELL', etapes: { rappel: true, demain: true } });
  jouer(etat, 'REP05_B'); jouer(etat, 'RAPPEL_ORIGINE_FR');
  jouer(etat, 'REP25_C');                     // « Ech kommen aus Frankräich. » : version maintenue
  assert.equal(etat.courant.id, 'B18_END');
  assert.equal(etat.ambianceFin, 'tendue');
  assert.equal(etat.courant.transition.fr, C.transitionsCloture.tendue);
  // Aveu : la tension retombe, l'au revoir n'est plus introduit par un silence.
  const franc = rendezVous('emma_r01', ['B05_ORIGIN', 'RAPPEL_ORIGINE'], { cloture: 'B26_DATE_FAREWELL' });
  jouer(franc, 'REP05_B'); jouer(franc, 'RAPPEL_ORIGINE_FR'); jouer(franc, 'REP25_B');
  assert.notEqual(franc.ambianceFin, 'tendue');
  assert.ok(!franc.courant.transition || franc.ambianceFin === 'froide');
  // Bonne ambiance : « Et war flott! » reste possible.
  const bon = rendezVous('emma_r01', ['B12_COFFEE_OFFER'], { cloture: 'B26_DATE_FAREWELL' });
  bon.affinity = 80;
  jouer(bon, bon.courant.choix.find(c => c.truth === 'honest').id);
  assert.equal(bon.courant.id, 'B26_DATE_FAREWELL');
  assert.ok(!bon.courant.transition);
});
