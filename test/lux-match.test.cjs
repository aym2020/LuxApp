'use strict';
// SPEC 109 — Lux Match : moteur pur (swipe, look, dialogue, événements, batterie, fins).
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const Core = require('../public/lux-match-core.js');
const lire = p => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const donnees = { contenus: lire('data/jeux/lux-match/contenus-v02.json') };
const C = donnees.contenus;

// Partie arrêtée au profil voulu, prête pour le date (parcours imposé si planId).
function partieAvec(profilId, options, planId, traits) {
  const etat = Core.nouvellePartie(donnees, Object.assign({ graine: 7, parties: 5 }, options || {}));
  Core.commencerSwipes(etat);
  etat.paquet = [profilId]; etat.indexCarte = 0; etat.likesAvantMatch = 1;
  assert.equal(Core.swiper(etat, true), 'match');
  if (planId) etat.plan = Core.composerScenario(C, etat.profil, 7, planId);
  if (traits) etat.plan.traits = traits;
  Core.apresMatch(etat, 'date');
  Core.choisirLook(etat, null, null);
  Core.commencerDate(etat);
  return etat;
}
const choisir = (etat, id) => { const r = Core.repondre(etat, id); Core.continuer(etat); return r; };
// Réponse « vraie » de l'échange courant (ou première réponse pour les échanges sans vérité).
function sincere(etat) {
  const e = etat.courant;
  if (e.type === 'rappel') return (e.choix.find(c => c.valeur === etat.claims[e.source.attribut]) || e.choix[0]).id;
  if (e.type === 'evenement') return (e.choix.find(c => c.aveu) || e.choix[0]).id;
  return (e.choix.find(c => c.truth === 'honest') || e.choix[0]).id;
}
function jouerJusquA(etat, condition, choisirId) {
  let garde = 0;
  while (etat.phase === 'date' && !condition(etat) && garde++ < 30) choisir(etat, (choisirId && choisirId(etat)) || sincere(etat));
}

test('Données : parcours pilotes valides pour les six profils', () => {
  C.profils.forEach(p => {
    const plans = C.plans.filter(x => x.profil === p.id && x.valide !== false);
    assert.ok(plans.length >= 1, p.id);
    plans.forEach(plan => plan.sequence.forEach(id => assert.ok(C.beats[id] || C.evenements[id] || C.rappels[id] || C.clotures[id], plan.id + ' → ' + id)));
  });
  assert.ok(C.plans.filter(p => p.valide === false).every(p => p.raison));
});

test('Swipe : écran profil d’abord, match borné après 1 ou 2 « j’aime », jamais bloqué', () => {
  for (let graine = 1; graine < 40; graine++) {
    const etat = Core.nouvellePartie(donnees, { graine });
    assert.equal(etat.phase, 'profil'); Core.commencerSwipes(etat); assert.equal(etat.phase, 'swipe');
    assert.ok(etat.paquet.length >= 4 && etat.paquet.length <= 6);
    let resultat, tours = 0;
    do { resultat = Core.swiper(etat, true); tours++; } while (resultat !== 'match' && tours < 10);
    assert.equal(resultat, 'match'); assert.ok(tours <= 2); assert.ok(etat.profil && etat.plan);
  }
  const etat = Core.nouvellePartie(donnees, { graine: 3 });
  Core.commencerSwipes(etat);
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

test('Parcours sincère (12 plans) : 6–8 tours, langue 100 %, aucun événement de mensonge', () => {
  C.plans.filter(p => p.valide !== false).forEach(plan => {
    const etat = partieAvec(plan.profil, null, plan.id);
    let tours = 0;
    while (etat.phase === 'date' && tours < 30) {
      assert.notEqual(etat.courant.id, 'B25_TRUTH_REPAIR', plan.id);
      if (etat.courant.type === 'evenement') assert.ok(!(etat.courant.source.declencheur || {}).mensonge, plan.id + ' ' + etat.courant.id);
      choisir(etat, sincere(etat)); tours++;
    }
    assert.equal(etat.phase, 'resultats', plan.id);
    assert.ok(tours >= 6 && tours <= 9, plan.id + ' : ' + tours + ' tours');
    assert.equal(etat.fin.langue, 100, plan.id);
    assert.equal(etat.contradictions, 0);
    assert.ok(Core.expressionsTravaillees(etat).length >= 3);
    assert.ok(etat.fin.resume.some(l => l.type === 'sincere'));
    // Deux salutations ne se suivent jamais ; aucune question posée deux fois.
    const ids = etat.historique.map(h => h.id);
    assert.equal(new Set(ids).size, ids.length, plan.id);
    assert.ok(!(ids.includes('B01_SALUT') && ids.includes('B02_SALUT_SOIR')));
  });
});

test('Âge : trois réponses dès la première partie ; 120 ans = blague, pas une affirmation', () => {
  const etat = partieAvec('lena_r01', { parties: 0 }, 'P01');
  jouerJusquA(etat, e => e.courant.id === 'B04_AGE');
  assert.equal(etat.courant.choix.length, 3);
  choisir(etat, 'REP04_C');
  assert.equal(etat.claims.age, undefined); assert.ok(etat.blagues.joke_age_120);
  assert.equal(etat.totalLangue, etat.scoreLangue); // blague correcte = point de langue
  // Ailleurs, les premières parties gardent 2 réponses (dont la vraie).
  const debut = partieAvec('lena_r01', { parties: 0 }, 'P01');
  assert.equal(debut.courant.choix.length, 2);
  assert.ok(debut.courant.choix.some(c => c.truth === 'honest'));
});

test('Mensonge Portugal : événement seulement après le bluff, aveu toujours possible', () => {
  let etat = partieAvec('sofia_r01', null, 'P09');
  jouerJusquA(etat, e => e.courant.id === 'B05_ORIGIN');
  choisir(etat, 'REP05_B');
  assert.equal(etat.courant.id, 'EV_SOFIA_PORTUGAL');
  assert.ok(etat.courant.choix.some(c => c.aveu));
  const r = choisir(etat, 'aveu');
  assert.ok(r.aveu); assert.equal(etat.claims.origin, 'Frankräich'); assert.ok(!etat.mensonges.origin);
  // La vache : gag joué, fin drôle possible (seulement si le gag a eu lieu).
  etat = partieAvec('sofia_r01', null, 'P09');
  jouerJusquA(etat, e => e.courant.id === 'B05_ORIGIN');
  choisir(etat, 'REP05_B'); choisir(etat, 'vaca');
  jouerJusquA(etat, () => false);
  assert.ok(Core.gardeOk(etat, C.profils.find(p => p.id === 'sofia_r01').fins.FUN.garde));
});

test('Budget : au plus 2 événements dont 1 gros, jamais deux fois le même', () => {
  // Maya : bluff gaming (gros) + bluff allemand (petit) ; le 3e ne passe pas.
  const etat = partieAvec('maya_r01', null, 'P07');
  jouerJusquA(etat, () => false, e => {
    const c = e.courant.choix;
    return (c.find(x => x.truth === 'lie') || c.find(x => !x.aveu && x.id !== 'aveu') || c[0]).id;
  });
  const joues = etat.evenements.filter(id => id !== 'B25_TRUTH_REPAIR');
  assert.ok(joues.length <= 2, joues.join());
  assert.ok(joues.filter(id => (C.evenements[id] || C.beats[id]).taille === 'gros').length <= 1);
  assert.equal(new Set(etat.evenements).size, etat.evenements.length);
});

test('Contradiction au rappel : suspicion +20, puis une chance de s’expliquer (B25)', () => {
  const etat = partieAvec('lena_r01', null, 'P01');
  jouerJusquA(etat, e => e.courant.id === 'B03_NAME');
  choisir(etat, 'REP03_B'); // « Max »
  jouerJusquA(etat, e => e.courant.type === 'rappel');
  assert.equal(etat.courant.id, 'B15_NAME_RECALL'); // le mensonge est rappelé en priorité
  const s0 = etat.suspicion;
  const r = choisir(etat, 'REP15_A'); // « Alex » : contradiction
  assert.ok(r.contradiction); assert.equal(etat.suspicion, Math.min(100, s0 + 20));
  assert.equal(etat.courant.id, 'B25_TRUTH_REPAIR');
  choisir(etat, 'REP25_B'); // « Entschëllegt, ech hu gelunn. »
  assert.deepEqual(Object.keys(etat.mensonges), []);
});

test('Cohérence croisée : banquier qui « travaille à l’hôpital » = contradiction', () => {
  const etat = partieAvec('claire_r01', null, 'P03');
  jouerJusquA(etat, e => e.courant.id === 'B08_PROFESSION');
  etat.file.unshift('B09_WORKPLACE'); // « Wou schaffs du? » juste après le métier
  choisir(etat, 'REP08_A');
  assert.equal(etat.courant.id, 'B09_WORKPLACE');
  const r = Core.repondre(etat, 'REP09_B');
  assert.ok(r.contradiction);
});

test('Faute pragmatique : correction affichée, langue fausse, suspicion inchangée', () => {
  const etat = partieAvec('lena_r01', null, 'P01');
  const avant = etat.suspicion;
  const r = choisir(etat, 'REP01_C'); // « Äddi! » pour répondre à « Wéi geet et dir? »
  assert.equal(r.langue, false); assert.ok(r.correction && r.correction.lu);
  assert.equal(etat.suspicion, avant);
});

test('Préférences : âge (indice publié) et ex prénommé Alex', () => {
  // Préférence « plus âgé » : 30 ans plaît (+3) et déclenche EV_AGE_PREF.
  let etat = partieAvec('claire_r01', null, 'P03', { agePreference: 'prefers_older', agePrefPositive30: true });
  jouerJusquA(etat, e => e.courant.id === 'B04_AGE');
  const r = choisir(etat, 'REP04_B');
  assert.equal(r.affinity, 2 + 3);
  assert.equal(etat.courant.id, 'EV_AGE_PREF');
  // Indifférente : 28 et 30 ont le même effet.
  const a = partieAvec('claire_r01', null, 'P03', { agePreference: 'indifferent' });
  jouerJusquA(a, e => e.courant.id === 'B04_AGE');
  assert.equal(Core.repondre(a, 'REP04_B').affinity, 2);
  // Ex « Alex » : dire son vrai prénom déclenche la surprise, sans échec automatique.
  etat = partieAvec('emma_r01', null, 'P12', { dislikedFirstName: 'Alex' });
  jouerJusquA(etat, e => e.courant.id === 'B03_NAME');
  choisir(etat, 'REP03_A');
  assert.equal(etat.courant.id, 'EV_EX_ALEX');
  choisir(etat, 'EV_EX_ALEX_C2'); // bluff « Max » : mémorisé, pas une contradiction
  assert.equal(etat.claims.prenom, 'Max'); assert.ok(etat.mensonges.prenom); assert.equal(etat.contradictions, 0);
  // Sans le trait : rien.
  etat = partieAvec('emma_r01', null, 'P12');
  jouerJusquA(etat, e => e.courant.id === 'B03_NAME');
  choisir(etat, 'REP03_A');
  assert.notEqual(etat.courant.id, 'EV_EX_ALEX');
});

test('Fins : le texte personnalisé ne cite que des faits réels', () => {
  // Emma, téléphone jamais ouvert, sincère : SUCCESS possible avec son texte.
  let etat = partieAvec('emma_r01', null, 'P12');
  jouerJusquA(etat, () => false);
  if (etat.fin.cle === 'SUCCESS') assert.equal(etat.fin.texte.id, 'FIN_EMMA_SUCCESS');
  assert.notEqual(etat.fin.cle, 'FUN'); // batterie jamais vidée : pas de fin « téléphone mort »
  // Léna sans le gag du ballon : jamais FIN_LENA_FUN.
  etat = partieAvec('lena_r01', null, 'P01');
  jouerJusquA(etat, () => false);
  assert.ok(!etat.fin.texte || etat.fin.texte.id !== 'FIN_LENA_FUN');
  // Léna : bluff foot puis « Jo, gär! » → le ballon raté → FIN_LENA_FUN.
  etat = partieAvec('lena_r01', null, 'P01');
  jouerJusquA(etat, e => e.courant.id === 'B10_FOOT');
  choisir(etat, 'REP10_B');
  assert.equal(etat.courant.id, 'EV_LENA_FOOT');
  choisir(etat, 'EV_LENA_FOOT_C1');
  jouerJusquA(etat, () => false);
  if (etat.fin.cle === 'FUN') assert.equal(etat.fin.texte.id, 'FIN_LENA_FUN');
  assert.ok(etat.fin.resume.some(l => l.type === 'evenement'));
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
  assert.equal(a.battery, 0); assert.equal(a.telephoneOuvert, false); assert.ok(a.batterieVide);
  assert.equal(Core.ouvrirTelephone(a), 'batterie_vide');
});

test('Anti-téléphone (Emma) : événement après la réponse en cours, puis malus de -5', () => {
  const etat = partieAvec('emma_r01', null, 'P11');
  const premier = etat.courant.id;
  assert.equal(Core.ouvrirTelephone(etat), 'piege_telephone');
  assert.equal(etat.courant.id, premier); // le dialogue en cours n'est pas interrompu
  Core.fermerTelephone(etat);
  choisir(etat, sincere(etat));
  assert.equal(etat.courant.id, 'EV_EMMA_PHONE');
  choisir(etat, 'EV_EMMA_PHONE_C1');
  const avant = etat.affinity;
  assert.equal(Core.ouvrirTelephone(etat), 'malus_telephone');
  assert.equal(etat.affinity, avant - 5);
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

test('3D : réactions sobres et photos Pix dans leur décor', () => {
  const src3d = fs.readFileSync(path.join(__dirname, '..', 'public/lux-match-3d.js'), 'utf8');
  const ui = fs.readFileSync(path.join(__dirname, '..', 'public/lux-match.js'), 'utf8');
  // Gestes de tête pour les réponses ordinaires ; Victory seulement via « joie ».
  ['hoche', 'sourire', 'sourcil', 'gene', 'froid', 'rire'].forEach(g => assert.match(src3d, new RegExp('\\b' + g + ': \\{ duree')));
  assert.match(ui, /parle: 'parle', hoche: 'hoche', sourire: 'sourire', sourcil: 'sourcil'/);
  const visuels = new Set();
  JSON.stringify(C, (k, v) => { if (k === 'visuel') visuels.add(v); return v; });
  visuels.forEach(v => assert.match(ui, new RegExp('\\b' + v + ": '"), 'visuel ' + v));
  // Chaque scène Pix de la bible a un décor 3D (la photo montre ce que dit la légende).
  C.profils.forEach(p => p.pix.photos.forEach(ph => assert.match(src3d, new RegExp('\\b' + ph.scene + ': g => \\{'), ph.id)));
});
