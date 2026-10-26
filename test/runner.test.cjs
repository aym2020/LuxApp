'use strict';
// SPEC 96 — Lux Runner : référentiel des genres et règles du jeu (sans navigateur).
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const racine = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(racine, p), 'utf8');

function make(niveau) {
  const store = new Map();
  const ctx = {
    console, niveauActif: niveau || 'A1.1',
    storageKey: x => 'profilA:' + x,
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
    setTimeout: () => 1, clearTimeout: () => {}
  };
  vm.createContext(ctx);
  vm.runInContext(read('public/runner-mots.js') + '\n;this.RUNNER_MOTS=RUNNER_MOTS;', ctx);
  vm.runInContext(read('public/runner.js'), ctx);
  return { ctx, store };
}
// Hasard reproductible.
function graine(n) {
  let s = n;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function partie(ctx, mode, seed, niveau) {
  ctx.seed = graine(seed || 1);
  ctx.mode = mode;
  ctx.niv = niveau || 'A1.1';
  return vm.runInContext('runnerNouvellePartie(mode, runnerMotsDuNiveau(niv), {niveau: niv, hasard: seed})', ctx);
}
// Joue une partie : strategie(portail) → genre choisi (ou null), pas = durée d'une image.
function jouer(ctx, p, pas, strategie, limite) {
  const resultats = [];
  let garde = 0;
  while (p.etat === 'course' && p.temps < (limite || 1000) && garde++ < 1e6) {
    if (p.portail && p.portail.mot && p.choix === null) {
      const g = strategie(p.portail.mot);
      if (g) ctx.runnerChoisirTest(p, g);
    }
    resultats.push(...ctx.runnerAvancer(p, pas));
  }
  return resultats;
}
function preparer(ctx) {
  // Même règle que runnerChoisir, sans DOM.
  ctx.runnerChoisirTest = (p, g) => { if (p.portail && !p.portail.arrivee) p.choix = g; };
}

test('Référentiel : fichier généré à jour, genres m/f/n, ids uniques, lien avec la leçon', () => {
  execFileSync('node', [path.join(racine, 'tools/runner-genres.cjs'), '--check']);
  const { ctx } = make();
  const mots = ctx.RUNNER_MOTS;
  const lecons = {};
  for (const niveau of ['A1.1', 'A1.2']) {
    for (const f of fs.readdirSync(path.join(racine, 'data/lecons', niveau))) {
      const l = JSON.parse(read('data/lecons/' + niveau + '/' + f));
      lecons[l.id] = l;
    }
  }
  const ids = new Set();
  for (const m of mots) {
    assert.ok(['m', 'f', 'n'].includes(m.gender), m.id);
    assert.ok(!ids.has(m.id), 'id en double ' + m.id); ids.add(m.id);
    const carte = (lecons[m.sourceLessonId].flashcards || []).find(c => c.id === m.sourceFlashcardId);
    assert.ok(carte, 'carte source absente ' + m.id);
    // Le nom figure dans la carte source (nom seul, expression ou note du pluriel).
    assert.ok((carte.lu + ' ' + (carte.note || '')).includes(m.lemma), m.id + ' ' + m.lemma);
    // Genre écrit en toutes lettres dans la note de la carte source.
    const mot = { m: 'masculin', f: 'féminin', n: 'neutre' }[m.gender];
    assert.match((carte.note || '').toLowerCase(), new RegExp(mot), m.id);
    // Article : règle de l'Eifel, et accord avec l'article de la carte si c'est le même nom.
    const attendu = m.gender === 'f' ? 'eng' : (/^[aeiouäëéöüyndtzh]/i.test(m.lemma) ? 'en' : 'e');
    assert.equal(m.articleForm, attendu + ' ' + m.lemma, m.id);
    if (carte.lu === m.lemma && ['e', 'en', 'eng'].includes(carte.article)) assert.equal(carte.article, attendu, m.id);
    // Traduction sans article français (aucun indice trompeur).
    assert.doesNotMatch(m.translation, /(^|\/ )(un|une|le|la|les|des|l')\b/i, m.id);
  }
  for (const niveau of ['A1.1', 'A1.2']) {
    const duNiveau = mots.filter(m => m.level === niveau);
    const noms = new Set(duNiveau.map(m => m.lemma.toLowerCase()));
    assert.equal(noms.size, duNiveau.length, 'doublon dans ' + niveau);
    assert.ok(vm.runInContext('runnerDisponible(runnerMotsDuNiveau("' + niveau + '"))', ctx), niveau);
  }
  // Exemples de la spécification.
  const cherche = l => mots.find(m => m.level === 'A1.1' && m.lemma === l);
  assert.equal(cherche('Dësch').gender, 'm'); assert.equal(cherche('Dësch').articleForm, 'en Dësch');
  assert.equal(cherche('Dier').gender, 'f'); assert.equal(cherche('Buch').gender, 'n');
  assert.equal(cherche('Auto').articleForm, 'en Auto'); assert.equal(cherche('Haus').articleForm, 'en Haus');
  assert.equal(cherche('Fënster').articleForm, 'eng Fënster');
});

test('Barème et temps d’approche', () => {
  const { ctx } = make();
  assert.deepEqual([0, 1, 2, 3, 4, 7].map(s => ctx.runnerPoints(s)), [100, 125, 150, 175, 200, 200]);
  assert.deepEqual([0, 19.9, 20, 39.9, 40, 59].map(t => ctx.runnerApproche('sprint', t)), [6, 6, 5, 5, 4, 4]);
  assert.equal(ctx.runnerApproche('entrainement', 50), 8);
  assert.equal(ctx.runnerApproche('tuto', 0), 6);
  assert.equal(ctx.runnerFormatTemps(48.2), '00:49');
  assert.equal(ctx.runnerFormatTemps(60), '01:00');
});

test('Sprint parfait : arrivée à 60 s pile, aucun portail lancé au-delà, combo plafonné', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'sprint', 3);
  const lances = [];
  const res = jouer(ctx, p, 1 / 60, mot => { if (p.portail && !lances.includes(p.portail)) lances.push(p.portail); return mot.gender; });
  assert.equal(p.etat, 'fin'); assert.equal(p.victoire, true);
  assert.equal(p.finTemps, 60);
  assert.equal(p.vies, 3);
  // 0-20 : 6 s, 20-40 : 5 s, 40-60 : 4 s → le dernier portail (lancé à 56 s) arrive à 60 s pile.
  assert.deepEqual(res.map(r => r.temps), [6, 12, 18, 24, 29, 34, 39, 44, 48, 52, 56, 60]);
  assert.ok(lances.every(x => x.debut + x.duree <= 60));
  assert.deepEqual(res.map(r => r.points), [100, 125, 150, 175, 200, 200, 200, 200, 200, 200, 200, 200]);
  assert.equal(p.score, 2150);
  assert.equal(p.maxSerie, 12);
});

test('Résultat identique quelle que soit la cadence d’images', () => {
  const resume = pas => {
    const { ctx } = make(); preparer(ctx);
    const p = partie(ctx, 'sprint', 11);
    // Stratégie déterministe : se trompe sur les noms neutres.
    const res = jouer(ctx, p, pas, mot => (mot.gender === 'n' ? 'm' : mot.gender));
    return JSON.stringify([res.map(r => [r.temps, r.statut, r.mot.id, r.points]), p.score, p.vies, p.finTemps]);
  };
  assert.equal(resume(0.5), resume(1 / 60));
  assert.equal(resume(0.1), resume(1 / 30));
});

test('Sans choix : réponse manquée, perte de vie, défaite au 3e impact (18 s)', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'sprint', 5);
  const res = jouer(ctx, p, 0.05, () => null);
  assert.deepEqual(res.map(r => r.statut), ['absent', 'absent', 'absent']);
  assert.equal(p.vies, 0); assert.equal(p.victoire, false);
  assert.equal(p.finTemps, 18);
  assert.equal(p.erreurs.length, 3);
  assert.equal(p.erreurs[0].choix, null);
});

test('Seule la dernière voie compte, et rien n’est validé avant la collision', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'sprint', 7);
  ctx.runnerAvancer(p, 0.01);
  const bon = p.portail.mot.gender;
  const mauvais = bon === 'm' ? 'f' : 'm';
  p.choix = mauvais;
  assert.equal(ctx.runnerAvancer(p, 5).length, 0); // 5,01 s : pas encore d'impact
  p.choix = bon;                                     // changement d'avis au dernier moment
  const res = ctx.runnerAvancer(p, 1);
  assert.equal(res.length, 1); assert.equal(res[0].statut, 'correct');
  assert.equal(p.choix, null); // sélection réinitialisée au mot suivant
});

test('Tirage : genres équilibrés, jamais 3 fois le même genre ni le même nom dans 4 portails', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'entrainement', 9);
  const res = jouer(ctx, p, 0.25, m => m.gender, 8 * 300);
  assert.ok(res.length >= 290);
  const genres = res.map(r => r.mot.gender);
  for (let i = 0; i + 6 <= genres.length; i += 6) {
    const bloc = genres.slice(i, i + 6).sort().join('');
    assert.equal(bloc, 'ffmmnn', 'sac de 6 équilibré');
  }
  for (let i = 2; i < genres.length; i++) assert.ok(!(genres[i] === genres[i - 1] && genres[i] === genres[i - 2]), 'triple ' + i);
  const ids = res.map(r => r.mot.id);
  for (let i = 0; i < ids.length; i++) assert.ok(!ids.slice(Math.max(0, i - 4), i).includes(ids[i]), 'répétition ' + i);
  // Entraînement : vies illimitées, pas de fin automatique.
  assert.equal(p.etat, 'course'); assert.equal(p.vies, 3);
});

test('Noms ratés prioritaires lors des parties suivantes', () => {
  const { ctx } = make(); preparer(ctx);
  const cible = ctx.RUNNER_MOTS.find(m => m.level === 'A1.1' && m.gender === 'n');
  const compte = erreurs => {
    let n = 0;
    for (let s = 1; s <= 200; s++) {
      ctx.seed = graine(s); ctx.err = erreurs;
      const p = vm.runInContext('runnerNouvellePartie("sprint", runnerMotsDuNiveau("A1.1"), {niveau:"A1.1", hasard: seed, erreursPassees: err})', ctx);
      for (let k = 0; k < 6; k++) { if (ctx.runnerChoisirMot(p).id === cible.id) { n++; break; } }
    }
    return n;
  };
  assert.ok(compte({ [cible.id]: 3 }) > compte({}) * 2);
});

test('Tutoriel : le portail attend la réponse, 3 mots puis fin', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'tuto', 4);
  ctx.runnerAvancer(p, 30);
  assert.ok(Math.abs(p.temps - 6 * 0.7) < 1e-9, 'arrêt à 70 % du trajet');
  assert.equal(p.rencontres, 0);
  const res = jouer(ctx, p, 0.1, m => m.gender, 100);
  assert.equal(res.length, 3); assert.equal(p.etat, 'fin');
});

test('Records par niveau, une seule écriture par partie ; erreurs mémorisées', () => {
  const { ctx, store } = make(); preparer(ctx);
  const p = partie(ctx, 'sprint', 2);
  jouer(ctx, p, 0.2, m => (m.gender === 'f' ? 'n' : m.gender));
  const battus = ctx.runnerEnregistrerSprint(p);
  ctx.runnerEnregistrerMots(p);
  const records = JSON.parse(store.get('profilA:luxRunnerRecords'))['A1.1'];
  assert.equal(records.score, p.score); assert.equal(records.parties, 1);
  assert.ok(battus.includes('score'));
  const mots = JSON.parse(store.get('profilA:luxRunnerMots'))['A1.1'];
  assert.ok(Object.keys(mots).length >= 1);
  assert.equal(JSON.parse(store.get('profilA:luxRunnerRecords'))['A1.2'], undefined);
});

test('Carte du hub : niveau disponible, niveau sans noms validés', () => {
  const { ctx } = make('A1.1');
  assert.match(ctx.runnerCarteHub(), /Lux Runner/);
  assert.match(ctx.runnerCarteHub(), /onclick="ouvrirRunner\(\)"/);
  ctx.niveauActif = 'A2.1';
  assert.match(ctx.runnerCarteHub(), /Pas encore de noms validés pour le niveau A2\.1/);
  assert.doesNotMatch(ctx.runnerCarteHub(), /ouvrirRunner/);
});

test('Intégration : vue, scripts, navigation et hub', () => {
  const html = read('public/index.html'), nav = read('public/navigation.js'), jeux = read('public/jeux-v21.js');
  assert.ok(html.includes('id="view-runner"'));
  assert.ok(html.indexOf('runner-mots.js') > html.indexOf('jeux-v21.js'));
  assert.ok(html.indexOf('runner.js') > html.indexOf('runner-mots.js'));
  assert.match(html, /runner\.css\?v=\d+/);
  assert.match(nav, /case 'view-runner': ouvrirJeux\(\)/);
  assert.doesNotMatch(nav, /'view-runner': \d/); // activité, pas un onglet
  assert.match(jeux, /runnerCarteHub\(\)/);
  assert.match(jeux, /runnerArreter\(\)/);
});
