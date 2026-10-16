// La v1 (main) fusionne et ré-enregistre une progression écrite par la v2.
// Les données v2 (meilleurs scores d'unité, stats du mot caché) doivent survivre,
// et la v1 doit continuer à calculer ses stats sans planter.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const repo = path.resolve(__dirname, '..');
// Version v1 (branche main) des fichiers de progression et de fusion cloud.
const v1 = f => execSync('git -C "' + repo + '" show main:' + f).toString();
const store = {};
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
global.window = {};
global.document = { getElementById: () => null };
global.lecons = JSON.parse(v1('data/lecons/A1.1/lecon-02.json'));
lecons = [lecons];
eval(v1('public/progress.js') + '\n' + v1('public/cloud.js') +
`
// Cloud écrit par la v2.
const cloudV2 = { progress: {
  levels: { "2": { quiz: { "3": 2, "1001": 3 }, unites: { "1": 91, "2": 80 }, motcache: { "1001": 2 }, sansfaute: { "1": 1 }, plus: { "1": 1 }, mission: { score: 75 } },
            "jours": { actif: { "2026-10-15": 2, "2026-10-16": 1 } } },
  wrong:  { "2": { motcache: { "1004": 1 } } },
  stats:  { "2": { motcache: { "1004": { attempts: 1, correct: 0, wrongTotal: 1, correctStreak: 0, difficultyScore: 3, lastSeenAt: "2026-10-16", lastWrongAt: "2026-10-16" } } } }
}, streak: { count: 3, lastActive: "2026-10-16" } };

// Appareil resté en v1 : sa propre progression locale.
const localV1 = { progress: { levels: { "2": { quiz: { "3": 3, "4": 2 }, unites: { "1": 70 } }, "jours": { actif: { "2026-10-16": 2 } } }, wrong: {}, stats: {} }, streak: { count: 1, lastActive: "2026-10-15" } };

const fusion = mergeLocalAndCloudProgress(localV1, cloudV2);
applyProgressPayload(fusion);
const renvoye = JSON.parse(JSON.stringify(getProgressPayload())); // ce que la v1 renvoie au cloud

const lv = renvoye.progress.levels["2"];
const ok = [
  ['meilleur score unité 1 gardé au max (91)', lv.unites["1"] === 91],
  ['meilleur score unité 2 conservé', lv.unites["2"] === 80],
  ['niveaux mot caché conservés', lv.motcache["1001"] === 2],
  ['erreurs mot caché conservées', renvoye.progress.wrong["2"].motcache["1004"] === 1],
  ['stats mot caché conservées', renvoye.progress.stats["2"].motcache["1004"].attempts === 1],
  ['quiz v1 fusionné au max', lv.quiz["3"] === 3 && lv.quiz["4"] === 2],
  ['« sans faute » conservé', lv.sansfaute["1"] === 1],
  ['« + » fait conservé', lv.plus["1"] === 1],
  ['score de mission conservé', lv.mission.score === 75],
  ['journal des jours conservé et fusionné au max', renvoye.progress.levels.jours.actif["2026-10-15"] === 2 && renvoye.progress.levels.jours.actif["2026-10-16"] === 2],
];
let echec = false;
ok.forEach(([m, b]) => { console.log((b ? '  ok    ' : '  ÉCHEC ') + m); if (!b) echec = true; });

// La v1 calcule ses stats sans planter malgré les clés inconnues.
const s = calculateLessonStats(2);
console.log('  ok    stats v1 de la leçon 2 calculées : ' + s.percent + ' % (' + s.status + ')');
process.exit(echec ? 1 : 0);
`);
