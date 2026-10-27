'use strict';
// SPEC 109 — Lux Match : moteur pur (swipe, look, dialogue, pièges, batterie, fins).
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const Core = require('../public/lux-match-core.js');
const lire = p => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const donnees = { archetypes: lire('data/jeux/lux-match/archetypes-v01.json'), dialogues: lire('data/jeux/lux-match/dialogues-a11-v01.json') };

// Partie arrêtée au profil voulu, prête pour le date.
function partieAvec(profilId, options) {
  const etat = Core.nouvellePartie(donnees, Object.assign({ graine: 7, parties: 5 }, options || {}));
  etat.paquet = [profilId]; etat.indexCarte = 0; etat.likesAvantMatch = 1;
  assert.equal(Core.swiper(etat, true), 'match');
  Core.apresMatch(etat, 'date');
  Core.choisirLook(etat, null, null);
  Core.commencerDate(etat);
  return etat;
}
const choisir = (etat, id) => { const r = Core.repondre(etat, id); Core.continuer(etat); return r; };
const sincere = echange => (echange.choix.find(c => c.learningCorrect && !c.lie) || echange.choix[0]).id;

test('Données : références croisées valides', () => {
  const ids = new Set(donnees.dialogues.sharedDialogueNodes.map(n => n.id));
  donnees.dialogues.archetypeFlows.forEach(f => f.flow.forEach(id => assert.ok(ids.has(id), f.id + ' → ' + id)));
  const archetypes = new Set(donnees.archetypes.archetypes.map(a => a.id));
  donnees.archetypes.profiles.forEach(p => {
    assert.ok(archetypes.has(p.archetypeId)); assert.ok(p.age >= 21);
    assert.ok(p.apparence3d && p.apparence3d.modele, p.id);
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'public/lux-match', p.apparence3d.modele + '.glb')));
  });
  donnees.dialogues.conditionalTrapEvents.forEach(t => assert.ok(archetypes.has(t.archetypeId)));
});

test('Swipe : match borné après 1 ou 2 « j’aime », jamais bloqué', () => {
  for (let graine = 1; graine < 40; graine++) {
    const etat = Core.nouvellePartie(donnees, { graine });
    assert.ok(etat.paquet.length >= 4 && etat.paquet.length <= 6);
    let resultat, tours = 0;
    do { resultat = Core.swiper(etat, true); tours++; } while (resultat !== 'match' && tours < 10);
    assert.equal(resultat, 'match'); assert.ok(tours <= 2); assert.ok(etat.profil);
  }
  const etat = Core.nouvellePartie(donnees, { graine: 3 });
  const n = etat.paquet.length;
  for (let i = 0; i < n - 1; i++) Core.swiper(etat, false);
  assert.equal(Core.swiper(etat, false), 'recommence'); // tout refusé : nouveau paquet
  assert.equal(etat.phase, 'swipe');
});

test('Look : au plus ±4, uniquement selon la préférence publiée', () => {
  const lena = Core.profilParId({ donnees }, 'lena_r01');
  assert.equal(Core.effetLook(lena, 'sportif', 'blo'), 4);
  assert.equal(Core.effetLook(lena, 'sportif', 'rout'), 2);
  assert.equal(Core.effetLook(lena, 'bcbg', 'rout'), -2);
  assert.equal(Core.effetLook(lena, null, null), 0);
});

test('Parcours sincère : jauges bornées, fin atteignable, score de langue parfait', () => {
  for (const p of donnees.archetypes.profiles) {
    const etat = partieAvec(p.id);
    let garde = 0;
    while (etat.phase === 'date' && garde++ < 20) choisir(etat, sincere(etat.courant));
    assert.equal(etat.phase, 'resultats', p.id);
    assert.ok(etat.affinity >= 0 && etat.affinity <= 100 && etat.suspicion >= 0 && etat.suspicion <= 100);
    assert.equal(etat.fin.langue, 100, p.id);
    const ex = Core.expressionsTravaillees(etat);
    assert.ok(ex.length >= 3 && ex.every(e => e.question.lu && e.reponse.lu));
  }
});

test('Mensonge Portugal : piège seulement si on a menti, aveu toujours possible', () => {
  let etat = partieAvec('sofia_r01');
  choisir(etat, sincere(etat.courant)); // salutation
  choisir(etat, sincere(etat.courant)); // prénom
  assert.equal(etat.courant.id, 'origine');
  choisir(etat, 'origine_portugal');
  assert.equal(etat.courant.type, 'piege'); assert.equal(etat.courant.id, 'trap_portugal');
  assert.ok(etat.courant.choix.some(c => c.id === 'aveu'));
  choisir(etat, 'aveu');
  assert.equal(etat.claims.origin, 'Frankräich'); // aveu : affirmation réparée
  // Sans mensonge : jamais de piège.
  etat = partieAvec('sofia_r01');
  let garde = 0;
  while (etat.phase === 'date' && garde++ < 20) { assert.notEqual(etat.courant.type, 'piege'); choisir(etat, sincere(etat.courant)); }
});

test('Contradiction au rappel : suspicion +20 ; faute de langue sans suspicion', () => {
  const etat = partieAvec('claire_r01');
  choisir(etat, sincere(etat.courant));                // salutation
  const avant = etat.suspicion;
  const r = choisir(etat, 'prenom_erreur');            // faute de conjugaison
  assert.equal(r.langue, false); assert.ok(r.correction && r.correction.lu);
  assert.equal(etat.suspicion, avant);
  // Ment sur le prénom au rappel : on force un prénom « Max » affirmé.
  etat.claims.prenom = 'Max'; etat.mensonges.prenom = true;
  let garde = 0;
  while (etat.phase === 'date' && etat.courant.type !== 'rappel' && garde++ < 20) choisir(etat, sincere(etat.courant));
  assert.equal(etat.courant.type, 'rappel');
  const s0 = etat.suspicion;
  const r2 = Core.repondre(etat, etat.courant.choix.find(c => c.value !== etat.claims[etat.courant.source.attribute]).id);
  assert.ok(r2.contradiction); assert.equal(etat.suspicion, Math.min(100, s0 + 20));
});

test('Batterie : même temps actif → même charge (30 ou 60 fps), fermée = aucune perte, 0 % = éteint', () => {
  const a = partieAvec('lena_r01'), b = partieAvec('lena_r01');
  Core.ouvrirTelephone(a); Core.ouvrirTelephone(b);
  for (let i = 0; i < 30 * 4; i++) Core.avancerTemps(a, 1 / 30);
  for (let i = 0; i < 60 * 4; i++) Core.avancerTemps(b, 1 / 60);
  assert.ok(Math.abs(a.battery - 80) < 0.01 && Math.abs(b.battery - 80) < 0.01);
  Core.fermerTelephone(a); Core.avancerTemps(a, 10); assert.ok(Math.abs(a.battery - 80) < 0.01);
  Core.ouvrirTelephone(a); Core.avancerTemps(a, 60); // reprise après veille : plafonné
  assert.ok(a.battery > 78);
  for (let i = 0; i < 200; i++) Core.avancerTemps(a, 0.25);
  assert.equal(a.battery, 0); assert.equal(a.telephoneOuvert, false);
  assert.equal(Core.ouvrirTelephone(a), 'batterie_vide');
});

test('Anti-téléphone (Emma) : piège après la réponse en cours, puis malus de -5', () => {
  const etat = partieAvec('emma_r01');
  assert.equal(Core.ouvrirTelephone(etat), 'piege_telephone');
  assert.equal(etat.courant.id, 'salutation'); // le dialogue en cours n'est pas interrompu
  Core.fermerTelephone(etat);
  choisir(etat, sincere(etat.courant));
  assert.equal(etat.courant.id, 'trap_telephone');
  choisir(etat, 'ranger');
  const avant = etat.affinity;
  assert.equal(Core.ouvrirTelephone(etat), 'malus_telephone');
  assert.equal(etat.affinity, avant - 5);
});

test('Premières parties : 2 réponses ; ensuite 3', () => {
  const debut = partieAvec('lena_r01', { parties: 0 });
  assert.equal(debut.courant.choix.length, 2);
  assert.ok(debut.courant.choix.some(c => c.learningCorrect && !c.lie));
  const ensuite = partieAvec('lena_r01', { parties: 4 });
  assert.equal(ensuite.courant.choix.length, 3);
});

test('3D : une instance par modèle, scènes annulables, aperçu face/trois-quarts', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'public/lux-match-3d.js'), 'utf8');
  // Couleurs appliquées sans « await » entre teinture et rendu (modèles partagés Noémie/Emma).
  assert.match(src, /function instancier\(gltf, teintes\)/);
  assert.doesNotMatch(src, /await personnage\(/);
  // Une scène demandée puis abandonnée (partie quittée) ne s'affiche jamais.
  assert.match(src, /if \(numero !== demande\) return false;/);
  assert.match(src, /function arreter\(\) \{ demande\+\+; detacher\(\); \}/);
  // Aperçu du look : oscillation autour de la face, jamais de dos.
  assert.doesNotMatch(src, /alexApercu\.rotation\.y \+=/);
  assert.match(src, /Math\.sin\(tempsApercu \* 0\.6\) \* 0\.6/);
  assert.match(src, /function diagnostic\(\)/);
});
