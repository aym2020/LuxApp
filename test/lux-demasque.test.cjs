'use strict';
// SPEC 110 — Lux Démasque : moteur pur, dossier Milo (lot D1).
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const Core = require('../public/lux-demasque-core.js');
const racine = path.join(__dirname, '..');
const C = JSON.parse(fs.readFileSync(path.join(racine, 'data/jeux/lux-demasque/contenus-v01.json'), 'utf8'));

const MENSONGES = { MILO_JOB: 'PRO_PROFIL', MILO_FLAT: 'AMIS_SAMI', MILO_JAPAN: 'LUXRUN_AOUT' };
// Partie où le joueur a tout écouté, tout consulté et (option) tout fait préciser.
function partieComplete(options) {
  const o = Object.assign({ precisions: true }, options);
  const e = Core.nouvellePartie(C, { dossierId: 'MILO_001' });
  Core.commencer(e);
  e.dossier.declarations.forEach((d, i) => Core.allerA(e, i));
  if (o.precisions) e.dossier.declarations.forEach(d => Core.preciser(e, d.id));
  e.dossier.pieces.forEach(p => Core.consulter(e, p));
  return e;
}
function lignesLu(x, chemin, liste) {
  liste = liste || [];
  if (Array.isArray(x)) x.forEach((v, i) => lignesLu(v, chemin + '/' + i, liste));
  else if (x && typeof x === 'object') {
    if (typeof x.lu === 'string') liste.push({ o: x, chemin });
    Object.keys(x).forEach(k => lignesLu(x[k], chemin + '/' + k, liste));
  }
  return liste;
}

test('Dossier Milo valide : 6 déclarations, 3 mensonges prouvables, 3 vérités', () => {
  const d = C.dossiers.find(x => x.id === 'MILO_001');
  assert.deepEqual(Core.validerDossier(C, d), []);
  assert.equal(d.declarations.length, 6);
  assert.deepEqual(d.declarations.filter(x => !x.vrai).map(x => x.id).sort(), Object.keys(MENSONGES).sort());
  assert.deepEqual(d.declarations.filter(x => x.vrai).map(x => x.id).sort(), ['MILO_CAT', 'MILO_COOK', 'MILO_RUN']);
});

test('Les trois bonnes objections, dans n’importe quel ordre, donnent 3/3 et un sans-faute', () => {
  const ordres = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  const ids = Object.keys(MENSONGES);
  ordres.forEach(ordre => {
    const e = partieComplete();
    ordre.forEach((k, n) => {
      const r = Core.objecter(e, ids[k], MENSONGES[ids[k]]);
      assert.equal(r.resultat, 'demasque', ids[k]);
      assert.equal(r.trouvees, n + 1);
      assert.equal(r.complet, n === 2);
    });
    const fin = Core.conclure(e);
    assert.deepEqual([fin.trouvees, fin.total, fin.erreurs, fin.sansFaute, fin.score], [3, 3, 0, true, 3 * 300 + 200]);
    assert.equal(fin.replique, e.dossier.fin.complet);
  });
});

test('Aucune autre paire (déclaration, pièce) ne démasque, précisions obtenues ou non', () => {
  [true, false].forEach(precisions => {
    const e0 = partieComplete({ precisions });
    const pieces = Core.carnet(e0).map(c => c.id);
    assert.ok(pieces.length >= 8 + 6); // 8 pièces + 6 déclarations entendues (+ précisions)
    e0.dossier.declarations.forEach(d => pieces.forEach(p => {
      const e = partieComplete({ precisions });
      const r = Core.objecter(e, d.id, p);
      const attendu = MENSONGES[d.id] === p && (precisions || d.id !== 'MILO_JOB');
      assert.equal(r.resultat === 'demasque', attendu, d.id + ' × ' + p + ' (précisions : ' + precisions + ')');
    }));
  });
});

test('Métier : la précision est indispensable, la même preuve marche ensuite', () => {
  const e = partieComplete({ precisions: false });
  let r = Core.objecter(e, 'MILO_JOB', 'PRO_PROFIL');
  assert.equal(r.resultat, 'refus');
  assert.equal(r.raison, 'precision_manquante');
  assert.equal(r.reponse.lu, 'Wéi? Ech hunn « Tourismus » gesot, net Horizon!');
  assert.equal(e.erreurs, 1);
  const p = Core.preciser(e, 'MILO_JOB');
  assert.equal(p.reponse.lu, 'Bei Horizon Voyages. Ech sinn all Dag am Büro.');
  r = Core.objecter(e, 'MILO_JOB', 'PRO_PROFIL');
  assert.equal(r.resultat, 'demasque');
  assert.equal(r.reponse.lu, 'Bis Juni, jo. Elo sichen ech eng nei Aarbecht.');
});

test('Objection refusée : réplique propre au leurre, conséquence mesurée, jamais de révélation', () => {
  const e = partieComplete();
  const kyoto = Core.objecter(e, 'MILO_JAPAN', 'PIX_KYOTO');
  assert.deepEqual([kyoto.resultat, kyoto.reponse.lu], ['refus', 'Kuck! Dat ass Kyoto!']);
  const canape = Core.objecter(e, 'MILO_FLAT', 'PIX_CANAPE');
  assert.equal(canape.reponse.lu, 'De Sami war just fir de Match do!');
  const vrai = Core.objecter(e, 'MILO_RUN', 'LUXRUN_AOUT');
  assert.equal(vrai.reponse.lu, 'Zéng Minutte sinn och Sport!');
  [kyoto, canape, vrai].forEach(r => { assert.equal(r.aveuFr, undefined); assert.ok(!JSON.stringify(r).includes('motivation')); });
  assert.equal(e.erreurs, 3);
  assert.deepEqual(e.demasquees, []);
  // Le dossier reste ouvert : les bonnes preuves marchent toujours.
  Object.keys(MENSONGES).forEach(id => assert.equal(Core.objecter(e, id, MENSONGES[id]).resultat, 'demasque'));
  const fin = Core.conclure(e);
  assert.deepEqual([fin.trouvees, fin.erreurs, fin.sansFaute, fin.score], [3, 3, false, 900 - 150]);
});

test('Une déclaration démasquée ne rapporte qu’une fois ; une pièce non vue ne peut pas servir', () => {
  const e = partieComplete();
  assert.equal(Core.objecter(e, 'MILO_FLAT', 'AMIS_SAMI').resultat, 'demasque');
  assert.equal(Core.objecter(e, 'MILO_FLAT', 'AMIS_SAMI').resultat, 'deja');
  assert.equal(e.erreurs, 0);
  const neuf = Core.nouvellePartie(C, { dossierId: 'MILO_001' });
  Core.commencer(neuf);
  for (let i = 0; i < 6; i++) Core.allerA(neuf, i);
  assert.equal(Core.objecter(neuf, 'MILO_FLAT', 'AMIS_SAMI').resultat, 'invalide'); // jamais consultée
  assert.equal(neuf.erreurs, 0);
  const sourd = Core.nouvellePartie(C, { dossierId: 'MILO_001' });
  Core.commencer(sourd); // seule la 1re déclaration est entendue
  Core.consulter(sourd, 'AMIS_SAMI');
  assert.equal(Core.objecter(sourd, 'MILO_FLAT', 'AMIS_SAMI').resultat, 'invalide');
});

test('Carnet : seulement ce qui a été vu ou entendu, dans l’ordre ; précision unique et relisible', () => {
  const e = Core.nouvellePartie(C, { dossierId: 'MILO_001' });
  Core.commencer(e);
  Core.suivante(e);
  Core.consulter(e, 'PIX_PIXEL');
  const a = Core.preciser(e, 'MILO_FLAT'), b = Core.preciser(e, 'MILO_FLAT');
  assert.ok(a.nouvelle && !b.nouvelle);
  assert.equal(Core.preciser(e, 'MILO_CAT'), null); // pas encore entendue
  assert.deepEqual(Core.carnet(e).map(c => c.id), ['DEP:MILO_JOB', 'DEP:MILO_FLAT', 'PIX_PIXEL', 'PRE:MILO_FLAT']);
  assert.equal(Core.consulter(e, 'INCONNUE'), false);
});

test('Même dossier + mêmes décisions = même partie (rejeu exact)', () => {
  const jouer = () => {
    const e = partieComplete();
    Core.objecter(e, 'MILO_RUN', 'LUXRUN_AOUT');
    Core.objecter(e, 'MILO_JAPAN', 'LUXRUN_AOUT');
    Core.conclure(e);
    return JSON.stringify([e.journal, e.fin]);
  };
  assert.equal(jouer(), jouer());
});

test('Bilan : motivations et preuves révélées après la partie, fidèles à ce qui a été fait', () => {
  const e = partieComplete({ precisions: false });
  Core.objecter(e, 'MILO_FLAT', 'AMIS_SAMI');
  const fin = Core.conclure(e);
  assert.deepEqual([fin.trouvees, fin.total, fin.complet], [1, 3, false]);
  assert.equal(fin.replique, e.dossier.fin.partiel);
  const b = Core.bilan(e);
  assert.equal(b.find(x => x.id === 'MILO_FLAT').demasquee, true);
  assert.equal(b.find(x => x.id === 'MILO_JOB').demasquee, false);
  assert.equal(b.find(x => x.id === 'MILO_JOB').precisionObtenue, false);
  assert.equal(b.find(x => x.id === 'MILO_CAT').motivationFr, null);
  assert.ok(b.filter(x => !x.vrai).every(x => x.motivationFr && x.explicationFr && x.preuve));
  // Après la fin, plus aucune action.
  assert.equal(Core.objecter(e, 'MILO_JOB', 'PRO_PROFIL').resultat, 'invalide');
});

test('Cohérence des faits : mêmes dates partout, aucune preuve ne trahit un autre mensonge', () => {
  const p = Core.piecesParId(C);
  // Fin du contrat en juin 2026 : profil Pro, aveu et explication disent la même chose.
  assert.match(p.PRO_PROFIL.transcription, /mars 2021 – juin 2026/);
  const d = C.dossiers[0].declarations, par = id => d.find(x => x.id === id);
  assert.match(par('MILO_JOB').mensonge.justification.lu, /Juni/);
  assert.match(par('MILO_JOB').mensonge.explicationFr, /juin 2026/);
  // Dimanches d'août 2026 : exactement 2, 9, 16, 23, 30.
  const dimanches = [];
  for (let j = 1; j <= 31; j++) if (new Date(Date.UTC(2026, 7, j)).getUTCDay() === 0) dimanches.push(j);
  assert.deepEqual(dimanches, [2, 9, 16, 23, 30]);
  assert.match(p.LUXRUN_AOUT.transcription, /2, 9, 16, 23 et 30 août/);
  // Trois semaines dans un mois de 31 jours contiennent au moins deux dimanches courus.
  for (let debut = 1; debut + 20 <= 31; debut++) assert.ok(dimanches.filter(j => j >= debut && j <= debut + 20).length >= 2);
  // Aucune pièce ne parle d'un autre mensonge que le sien.
  assert.doesNotMatch(p.LUXRUN_AOUT.transcription, /coloc|Sami|Horizon/i);
  assert.doesNotMatch(p.AMIS_SAMI.transcription, /Japon|Kyoto|Horizon|août/i);
  assert.doesNotMatch(p.PRO_PROFIL.transcription, /coloc|Sami|Japon|Kyoto/i);
  // Pas d'aveu publié : aucune pièce ne dit « jamais allé », « plus de travail », « menti ».
  C.pieces.forEach(x => assert.doesNotMatch(x.transcription, /jamais (été|allé)|menti|plus de travail|sans emploi|chômage/i, x.id));
  // Chaque pièce a une transcription complète et une date ou une nature de profil.
  C.pieces.forEach(x => { assert.ok(x.transcription.length > 20, x.id); assert.ok(x.dateFr || x.visuel.type === 'profil', x.id); });
});

test('Répliques LU : statut publiable, règle du n respectée', () => {
  const lignes = lignesLu(C, '');
  assert.ok(lignes.length >= 30);
  lignes.forEach(({ o, chemin }) => assert.ok(C.publiables.includes(o.review), chemin));
  const pleines = ['sinn', 'hunn', 'ginn', 'keen', 'an', 'en', 'den', 'heeschen', 'wunnen', 'schaffen', 'lafen', 'kachen', 'Minutten', 'Wochen', 'Fotoen', 'mäin', 'Nuddelen'];
  const reduites = { si: 'sinn', hu: 'hunn', gi: 'ginn', kee: 'keen', a: 'an', wunne: 'wunnen', schaffe: 'schaffen', lafe: 'lafen', kache: 'kachen', minutte: 'Minutten', fotoe: 'Fotoen', 'mäi': 'mäin', nuddele: 'Nuddelen' };
  const garde = /^[aeiouäëéèöüiyndtzh]/i;
  const erreurs = [];
  lignes.forEach(({ o, chemin }) => {
    const mots = o.lu.split(/\s+/);
    for (let i = 0; i < mots.length - 1; i++) {
      if (/[.,!?:;…]$/.test(mots[i])) continue;
      const mot = mots[i].toLowerCase(), suivant = mots[i + 1].replace(/^[«"(]/, '').replace(/^»/, '');
      if (!suivant) continue;
      // « Si » en début de phrase est le pronom (elle), pas le verbe réduit « si » (= sinn).
      if (mot === 'si' && (i === 0 || /[.!?]$/.test(mots[i - 1]))) continue;
      if (pleines.map(x => x.toLowerCase()).includes(mot) && !garde.test(suivant)) erreurs.push(chemin + ' : « ' + mots[i] + ' ' + suivant + ' »');
      if (reduites[mot] && garde.test(suivant)) erreurs.push(chemin + ' : « ' + mots[i] + ' ' + suivant + ' »');
    }
  });
  assert.deepEqual(erreurs, []);
});
