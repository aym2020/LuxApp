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
  vm.runInContext(read('public/runner-rendu.js'), ctx);
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
// Joue une partie : strategie(mot) → voie voulue (ou null = ne rien toucher).
// Le joueur n'agit qu'une fois par portail, et seulement s'il doit changer de voie.
function jouer(ctx, p, pas, strategie, limite) {
  const resultats = [];
  let garde = 0, dernier = null;
  while (p.etat === 'course' && p.temps < (limite || 1000) && garde++ < 1e6) {
    if (p.portail && p.portail.mot && p.portail !== dernier) {
      dernier = p.portail;
      const g = strategie(p.portail.mot);
      if (g && (g !== p.voie || p.mode === 'tuto')) ctx.runnerChoisirTest(p, g);
    }
    resultats.push(...ctx.runnerAvancer(p, pas));
  }
  return resultats;
}
function preparer(ctx) {
  // Même règle que runnerChoisir, sans DOM.
  ctx.runnerChoisirTest = (p, g) => { if (p.portail && !p.portail.arrivee) { p.voie = g; p.toucheMot = true; } };
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
  assert.deepEqual([0, 19.9, 20, 39.9, 40, 59].map(t => ctx.runnerApproche('sprint', t)), [4, 4, 3.5, 3.5, 3, 3]);
  assert.equal(ctx.runnerApproche('entrainement', 50), 6);
  assert.equal(ctx.runnerApproche('tuto', 0), 6);
  assert.equal(ctx.runnerFormatTemps(48.2), '00:49');
  assert.equal(ctx.runnerFormatTemps(60), '01:00');
});

test('Sprint parfait : 17 portails, arche d’arrivée à 60 s pile, combo plafonné', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'sprint', 3);
  const lances = [];
  const res = jouer(ctx, p, 1 / 60, mot => { if (p.portail && !lances.includes(p.portail)) lances.push(p.portail); return mot.gender; });
  assert.equal(p.etat, 'fin'); assert.equal(p.victoire, true);
  assert.equal(p.finTemps, 60);
  assert.equal(p.vies, 3);
  // 0-20 : 4 s, 20-40 : 3,5 s, 40-60 : 3 s ; à 59 s un portail de 3 s dépasserait 60 → arche d'arrivée.
  assert.deepEqual(res.map(r => r.temps), [4, 8, 12, 16, 20, 23.5, 27, 30.5, 34, 37.5, 41, 44, 47, 50, 53, 56, 59]);
  assert.ok(lances.every(x => x.debut + x.duree <= 60));
  assert.deepEqual(res.map(r => r.points), [100, 125, 150, 175].concat(Array(13).fill(200)));
  assert.equal(p.score, 3150);
  assert.equal(p.maxSerie, 17);
});

test('Le coureur garde sa voie : deux noms du même genre réussis sans retoucher', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'sprint', 1);
  // Mots imposés : deux féminins de suite.
  const fem = ctx.RUNNER_MOTS.filter(m => m.level === 'A1.1' && m.gender === 'f');
  let i = 0;
  ctx.runnerChoisirMot = () => fem[i++];
  ctx.runnerAvancer(p, 0.01);
  ctx.runnerChoisirTest(p, 'f');           // un seul appui, au premier mot
  const r1 = ctx.runnerAvancer(p, 4);      // premier impact
  assert.equal(r1[0].statut, 'correct');
  assert.equal(p.voie, 'f');               // pas de retour au centre ni de remise à zéro
  assert.equal(p.portail.mot.gender, 'f');
  const r2 = ctx.runnerAvancer(p, 4);      // aucun nouvel appui
  assert.equal(r2[0].statut, 'correct');
  assert.equal(p.serie, 2);
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

test('Jamais de choix : réponse manquée, perte de vie, défaite au 3e impact (12 s)', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'sprint', 5);
  const res = jouer(ctx, p, 0.05, () => null);
  assert.deepEqual(res.map(r => r.statut), ['absent', 'absent', 'absent']);
  assert.equal(p.vies, 0); assert.equal(p.victoire, false);
  assert.equal(p.finTemps, 12);
  assert.equal(p.erreurs.length, 3);
  assert.equal(p.erreurs[0].choix, null);
});

test('Seule la voie occupée à la collision compte, rien n’est validé avant', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'sprint', 7);
  ctx.runnerAvancer(p, 0.01);
  const bon = p.portail.mot.gender;
  const mauvais = bon === 'm' ? 'f' : 'm';
  ctx.runnerChoisirTest(p, mauvais);
  assert.equal(ctx.runnerAvancer(p, 3.9).length, 0); // 3,91 s : pas encore d'impact
  ctx.runnerChoisirTest(p, bon);                     // changement d'avis au dernier moment
  const res = ctx.runnerAvancer(p, 1);
  assert.equal(res.length, 1); assert.equal(res[0].statut, 'correct');
  assert.equal(p.voie, bon); // la voie est conservée pour le mot suivant
});

test('Tirage : genres équilibrés, jamais 3 fois le même genre ni le même nom dans 4 portails', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'entrainement', 9);
  const res = jouer(ctx, p, 0.25, m => m.gender, 6 * 300);
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
  ctx.runnerChoisirTest(p, p.portail.mot.gender);
  ctx.runnerAvancer(p, 30);                  // 2e mot : il attend une nouvelle action
  assert.equal(p.rencontres, 1);
  assert.ok(Math.abs(p.temps - (6 + 6 * 0.7)) < 1e-9);
  const res = jouer(ctx, p, 0.1, m => m.gender, 100);
  assert.equal(res.length, 2); assert.equal(p.etat, 'fin');
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

test('Rendu : trios suivants et arche d’arrivée annoncés à l’avance', () => {
  const { ctx } = make(); preparer(ctx);
  const p = partie(ctx, 'sprint', 2);
  ctx.runnerAvancer(p, 0.01);
  assert.deepEqual(Array.from(ctx.runnerPortailsSuivants(p, p.portail)), ['trio', 'trio']);
  p.portail = { mot: p.portail.mot, debut: 53, duree: 3 }; // suivant lancé à 56 s, puis 59 s
  assert.deepEqual(Array.from(ctx.runnerPortailsSuivants(p, p.portail)), ['trio', 'arrivee']);
  assert.ok(vm.runInContext('RUNNER_PROFONDEUR', ctx) * 2 <= 1, 'deux trios suivants visibles avant l’horizon');
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
  assert.ok(html.indexOf('runner-audio.js') < html.indexOf('src="runner.js'));
  assert.ok(html.indexOf('runner-rendu.js') < html.indexOf('src="runner.js'));
  // Sons propres au runner : jamais ceux des exercices.
  assert.doesNotMatch(read('public/runner.js'), /jouerFeedbackSon|SurvieFx/);
});

test('Prototype 3D : chargé à la demande, assets locaux et légers, secours 2D', () => {
  const runner = read('public/runner.js'), r3d = read('public/runner-3d.js'), html = read('public/index.html');
  // Jamais chargé pour tout le monde : ni balise script, ni import statique.
  assert.doesNotMatch(html, /runner-3d\.js|three\.module/);
  assert.match(runner, /import\('\.\/runner-3d\.js/);
  assert.match(runner, /function runnerRendu3DActif/);
  assert.match(runner, /if \(runnerRendu3DActif\(\)\) p\.affichage\.pret3d = runnerBrancher3D/);
  // En cas d'échec, le rendu 2D continue.
  assert.match(runner, /rendu 2D conservé/);
  assert.match(runner, /if \(a\.rendu3d\) a\.rendu3d\.image\(p, dt\);\s*\/\/[^\n]*\n\s*else if \(!a\.attente3d\) \{/);
  // Imports relatifs uniquement (aucun CDN) et assets présents.
  assert.doesNotMatch(r3d, /https?:\/\//);
  assert.match(r3d, /from '\.\/vendor\/three\/three\.module\.min\.js'/);
  for (const f of ['public/vendor/three/three.module.min.js', 'public/vendor/three/GLTFLoader.js',
    'public/vendor/three/BufferGeometryUtils.js', 'public/runner3d/coureur.glb', 'public/runner3d/ville.glb', 'public/runner3d/CREDITS.md']) {
    assert.ok(fs.existsSync(path.join(racine, f)), f);
  }
  const poids = ['coureur.glb', 'ville.glb'].reduce((t, f) => t + fs.statSync(path.join(racine, 'public/runner3d', f)).size, 0);
  assert.ok(poids < 1.5e6, 'modèles < 1,5 Mo (' + poids + ')');
  assert.doesNotMatch(read('public/vendor/three/GLTFLoader.js'), /from 'three'/);
  // Aucune règle du jeu dans le rendu 3D.
  assert.doesNotMatch(r3d, /runnerResoudre|runnerAvancer|p\.vies\s*[-+]=|p\.score\s*[-+]=/);
});

test('SPEC 96 V2.2 : rendu 3D par défaut sans selecteur, secours 2D conserve', () => {
  const { ctx } = make();
  const js = read('public/runner.js');
  const page = read('public/index.html');
  assert.equal(vm.runInContext('runnerRendu3DActif()', ctx), true);
  assert.ok(!js.includes('runnerBouton3D'));
  assert.ok(!js.includes('runnerBasculer3D'));
  assert.ok(!js.includes("localStorage.getItem('luxRunner3D')"));
  assert.ok(js.includes('runnerBoutonsSon() +'));
  assert.ok(js.includes('runnerBrancher3D(p, scene)'));
  assert.ok(js.includes('rendu 2D conservé'));
  assert.ok(!read('public/runner.css').includes('.runner-bouton-3d'));
  assert.match(page, /runner\.js\?v=(1[0-9]|[2-9][0-9])\b/); // v10 ou plus récent
});

test('SPEC 105 — articles indéfinis au-dessus de M/F/N sans dévoiler le mot', () => {
  const { ctx } = make();
  const genres = vm.runInContext('RUNNER_GENRES', ctx);
  assert.equal(genres.m.articleRepere, 'e / en');
  assert.equal(genres.f.articleRepere, 'eng');
  assert.equal(genres.n.articleRepere, 'e / en');
  assert.equal(genres.m.articleRepere, genres.n.articleRepere);
  const js = read('public/runner.js');
  const css = read('public/runner.css');
  const html = read('public/index.html');
  assert.ok(js.includes('class="runner-voie-article" lang="lb"'));
  assert.ok(js.includes("articleRepere.replace(' / ', ' ou ')"));
  assert.ok(js.includes('onclick="runnerChoisir'));
  const start = js.indexOf('class="runner-voies"');
  const end = js.indexOf('id="runner-pause"', start);
  assert.ok(start >= 0 && end > start);
  assert.ok(!js.slice(start, end).includes('.articleForm'));
  assert.ok(css.includes('.runner-voie .runner-voie-article'));
  assert.ok(css.includes('min-height:84px'));
  assert.ok(Number((html.match(/runner\.js\?v=(\d+)/) || [])[1]) >= 20);
  assert.ok(Number((html.match(/runner\.css\?v=(\d+)/) || [])[1]) >= 10);
});

test('SPEC 106 : micro-feedback attribué au mot précédent sans bloquer la course', () => {
  const { ctx } = make();
  ctx.exemple = { statut:'correct', points:125, mot:{ articleForm:'e Bild', gender:'n' } };
  let html = vm.runInContext('runnerHtmlFeedback(exemple, "sprint")', ctx);
  assert.match(html, /MOT PRÉCÉDENT/);
  assert.match(html, /\+125/);
  assert.match(html, /e Bild/);
  assert.match(html, /Neutre/);
  assert.doesNotMatch(html, /Correct|Faux|Trop tard/);
  assert.equal(vm.runInContext('runnerDureeFeedback("correct")', ctx), 1100);
  ctx.exemple = { statut:'faux', points:0, mot:{ articleForm:'eng Dier', gender:'f' } };
  html = vm.runInContext('runnerHtmlFeedback(exemple, "sprint")', ctx);
  assert.match(html, /-1 vie/);
  assert.match(html, /eng Dier/);
  assert.match(html, /Féminin/);
  assert.equal(vm.runInContext('runnerDureeFeedback("faux")', ctx), 1700);
  ctx.exemple.statut = 'absent';
  html = vm.runInContext('runnerHtmlFeedback(exemple, "sprint")', ctx);
  assert.match(html, /sans choix/);
  html = vm.runInContext('runnerHtmlFeedback(exemple, "entrainement")', ctx);
  assert.match(html, /À revoir/);
  assert.doesNotMatch(html, /-1 vie/);
  ctx.exemple = { statut:'correct', points:100, mot:{ articleForm:'<b>mot&',gender:'m' } };
  html = vm.runInContext('runnerHtmlFeedback(exemple, "tuto")', ctx);
  assert.match(html, /&lt;b&gt;mot&amp;/);
  assert.doesNotMatch(html, /<b>mot&/);
  const code = read('public/runner.js');
  assert.doesNotMatch(code, /RUNNER_FEEDBACK_MS\s*=\s*1400/);
  assert.match(code, /runnerDureeFeedback\(r\.statut\)/);
  assert.doesNotMatch(code.slice(code.indexOf('function runnerMontrerResultat'),code.indexOf('function runnerMajCombo')), /runnerAvancer\(p,/);
  assert.match(read('public/runner.css'), /runner-feedback-entete/);
  assert.match(read('public/runner.css'), /pointer-events:none/);
});
test('SPEC 106 : halo réduit dans les rendus 3D et 2D avec cache renouvelé', () => {
  const t = read('public/runner-3d.js'), c = read('public/runner-rendu.js'), css=read('public/runner.css'), html=read('public/index.html');
  assert.ok(t.includes('[[0.16, 0.34, 0.35], [0.09, 0.18, 0.49], [0.05, 0.08, 0.63]]'));
  assert.ok(t.includes('opacity: 0.56'));
  assert.ok(t.includes('opacites: [1, 1, 1, 1, 0.56]'));
  assert.ok(t.includes('new THREE.Vector2(256, 256), 0.30, 0.28, 0.5'));
  assert.ok(c.includes('g.globalAlpha = alpha * 0.10;'));
  assert.ok(c.includes('g.globalAlpha = alpha * 0.21;'));
  assert.ok(Number((html.match(/runner\.css\?v=(\d+)/) || [])[1]) >= 11);
  assert.ok(html.includes('runner-rendu.js?v=3'));
  assert.ok(Number((html.match(/runner\.js\?v=(\d+)/) || [])[1]) >= 21);
  assert.ok(read('public/runner.js').includes("import('./runner-3d.js?v=12')"));
  assert.ok(css.includes('MOT PRÉCÉDENT') && css.includes('prefers-reduced-motion:reduce'));
});
