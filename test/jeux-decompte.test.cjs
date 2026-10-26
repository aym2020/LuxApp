'use strict';
// SPEC 101 — Compte à rebours des jeux (Survie, Lux Runner).
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

function make() {
  const minuteries = [];
  let maintenant = 0;
  const enfants = [];
  const conteneur = { appendChild: e => { enfants.push(e); e.parentNode = conteneur; }, removeChild: e => { enfants.splice(enfants.indexOf(e), 1); e.parentNode = null; } };
  const ctx = {
    document: { createElement: () => ({ className: '', innerHTML: '', setAttribute() {}, style: { setProperty() {} }, parentNode: null }) },
    setTimeout: (fn, ms) => { minuteries.push({ fn, a: maintenant + ms }); return minuteries.length; },
    clearTimeout: id => { if (minuteries[id - 1]) minuteries[id - 1].fn = null; }
  };
  vm.createContext(ctx);
  vm.runInContext(read('public/jeux-decompte.js'), ctx);
  const avancer = ms => {
    const fin = maintenant + ms;
    for (;;) {
      const prochaine = minuteries.filter(m => m.fn && m.a <= fin).sort((x, y) => x.a - y.a)[0];
      if (!prochaine) break;
      maintenant = prochaine.a; const fn = prochaine.fn; prochaine.fn = null; fn();
    }
    maintenant = fin;
  };
  return { ctx, conteneur, enfants, avancer };
}

test('3, 2, 1 puis départ : « fini » une seule fois, voile retiré', () => {
  const { ctx, conteneur, enfants, avancer } = make();
  let fini = 0; const vus = [];
  ctx.fini = () => fini++;
  ctx.opts = { conteneur, theme: 'runner', son: false };
  vm.runInContext('jeuDecompte(opts, fini)', ctx);
  for (let i = 0; i < 3; i++) { vus.push(enfants[0].innerHTML.replace(/<[^>]+>/g, '')); assert.equal(fini, 0); avancer(900); }
  vus.push(enfants[0].innerHTML.replace(/<[^>]+>/g, ''));
  assert.deepEqual(vus, ['3', '2', '1', 'GO !']);
  // Le jeu part dès l'affichage du GO ; le voile s'efface ensuite en fondu.
  assert.equal(fini, 1); assert.match(enfants[0].className, /jeu-decompte-sortie/);
  avancer(700); assert.equal(enfants.length, 0);
  avancer(5000); assert.equal(fini, 1);
});

test('Survie : « Partez ! » ; annulation et sortie du jeu sans départ', () => {
  const { ctx, conteneur, enfants, avancer } = make();
  let fini = 0, actif = true;
  ctx.fini = () => fini++;
  ctx.opts = { conteneur, theme: 'survie', son: false, estActif: () => actif };
  ctx.annuler = vm.runInContext('jeuDecompte(opts, fini)', ctx);
  avancer(1000);
  assert.match(enfants[0].innerHTML, />2</);
  actif = false;              // Retour Android pendant le décompte
  avancer(3000);
  assert.equal(fini, 0); assert.equal(enfants.length, 0);
  const b = make(); let f2 = 0; b.ctx.fini = () => f2++; b.ctx.opts = { conteneur: b.conteneur, theme: 'survie' };
  const annuler = vm.runInContext('jeuDecompte(opts, fini)', b.ctx);
  b.avancer(800); annuler(); b.avancer(5000);
  assert.equal(f2, 0); assert.equal(b.enfants.length, 0);
});

test('Intégration : chrono lancé au départ seulement, tutoriel sans décompte', () => {
  const jeux = read('public/jeux-v21.js'), runner = read('public/runner.js'), html = read('public/index.html');
  assert.ok(html.indexOf('jeux-decompte.js') < html.indexOf('jeux-v21.js'));
  assert.match(html, /jeux-decompte\.css\?v=\d+/);
  assert.match(jeux, /p\.verrou=true;\s*p\.annulerDecompte=jeuDecompte/);
  assert.match(jeux, /p\.timer=setInterval\(survieTick,100\);\s*\}\);/);
  assert.match(runner, /mode === 'tuto' \|\| typeof jeuDecompte !== 'function'/);
  assert.match(runner, /p\.etat = 'decompte';/);
  // Son : seulement déverrouillé pendant l'appui, la musique part au GO, après la scène.
  assert.match(runner, /RunnerAudio\.preparer\(\);/);
  assert.match(runner, /p\.etat = 'course';[\s\S]{0,120}RunnerAudio\.demarrer\(\)/);
  assert.match(runner, /runnerQuandScenePrete\(p, /);
  assert.match(runner, /a\.annulerDecompte\(\)/);
});
