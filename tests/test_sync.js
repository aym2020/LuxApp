// S8 + S13 : synchronisation de ce qui est en cours et du niveau choisi.
// Règle : pour la séance du jour, la partie d'unité et le niveau, le plus
// RÉCENT gagne (date maj), jamais le maximum.
const fs = require('fs');
const path = require('path');
const pub = f => fs.readFileSync(path.resolve(__dirname, '..', 'public', f), 'utf8');

const store = {};
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
global.window = { addEventListener: () => {} };
global.document = { getElementById: () => null, addEventListener: () => {} };
global.navigator = { onLine: true };
global.lecons = [];

eval(pub('progress.js') + '\n' + pub('niveau.js') + '\n' + pub('cloud.js') + `
const SEANCE_KEY = 'luxSeance';
const RUN_KEY = 'luxParcours';
const RUN_LIBRE_KEY = 'luxParcoursLibre';
function migrerParties() {} // (parcours.js) : testé dans test_libre.py

function appareil(choix, seance, partie) {
  return { progress: { levels: {}, wrong: {}, stats: {} }, streak: {}, choix, enCours: { seance, partie } };
}
const seance7 = { date: '2026-10-16', questions: [1, 2, 3].map(i => ({ leconId: 1, type: 'quiz', qid: i })), index: 2, score: 1, maj: 1000 };
const partie = { leconId: 2, uniteId: 1, mode: 'unite', steps: [], stepIdx: 1, maj: 1500 };

const t = [];
// 1. Séance commencée sur A, B n'a rien : B la récupère.
let m = mergeLocalAndCloudProgress(appareil({}, null, null), appareil({}, seance7, partie));
t.push(['séance commencée sur A reprise sur B', m.enCours.seance && m.enCours.seance.index === 2]);
t.push(['partie en cours sur A reprise sur B', m.enCours.partie && m.enCours.partie.stepIdx === 1]);

// 2. Séance finie sur B (plus récente) : A ne propose plus l'ancienne.
m = mergeLocalAndCloudProgress(appareil({}, seance7, null), appareil({}, { fini: true, maj: 2000 }, null));
t.push(['séance finie sur B : A voit « finie »', m.enCours.seance.fini === true]);

// 3. Séance avancée sur A (plus récente) contre ancienne version du cloud.
m = mergeLocalAndCloudProgress(appareil({}, Object.assign({}, seance7, { index: 9, maj: 3000 }), null), appareil({}, seance7, null));
t.push(['séance plus avancée et plus récente gardée', m.enCours.seance.index === 9]);

// 4. Niveau : A1.2 choisi sur A puis A1.1 choisi plus tard sur B -> A1.1 (pas le max).
m = mergeLocalAndCloudProgress(appareil({ niveau: { valeur: 'A1.2', maj: 1000 } }, null, null),
                               appareil({ niveau: { valeur: 'A1.1', maj: 2000 } }, null, null));
t.push(['niveau : le choix le plus récent gagne (A1.1)', m.choix.niveau.valeur === 'A1.1']);

// 5. Ancien cloud (écrit par la v1) sans choix ni enCours : le local est gardé.
m = mergeLocalAndCloudProgress(appareil({ niveau: { valeur: 'A1.2', maj: 1000 } }, seance7, null),
                               { progress: { levels: {}, wrong: {}, stats: {} }, streak: {} });
t.push(['cloud v1 sans ces clés : niveau et séance locaux gardés', m.choix.niveau.valeur === 'A1.2' && m.enCours.seance.index === 2]);

// 6. Aller-retour par le stockage local (applyProgressPayload / getProgressPayload).
applyProgressPayload(m);
const relu = getProgressPayload();
t.push(['écrit puis relu en local', relu.choix.niveau.valeur === 'A1.2' && relu.enCours.seance.index === 2]);

// 7. Spec 22 : partie principale et entraînement libre fusionnés séparément.
//    Sur B, la révision libre est finie (plus récente) ; sur A, la partie principale avance.
const principaleA = { leconId: 1, uniteId: 3, mode: 'unite', steps: [], stepIdx: 2, maj: 5000, libre: false };
const libreA = { leconId: 1, uniteId: 1, mode: 'unite', steps: [], stepIdx: 1, maj: 4000, libre: true };
const A = appareil({}, null, principaleA); A.enCours.partieLibre = libreA;
const B = appareil({}, null, { leconId: 1, uniteId: 3, mode: 'unite', steps: [], stepIdx: 0, maj: 3000, libre: false });
B.enCours.partieLibre = { fini: true, maj: 6000 };
m = mergeLocalAndCloudProgress(A, B);
t.push(['libre finie sur B : la partie principale de A est gardée', m.enCours.partie.stepIdx === 2 && m.enCours.partieLibre.fini === true]);
// 8. Ancien payload sans partieLibre : la révision libre locale est gardée.
m = mergeLocalAndCloudProgress(A, appareil({}, null, null));
t.push(['ancien payload sans partieLibre : révision locale gardée', m.enCours.partieLibre && m.enCours.partieLibre.uniteId === 1]);
applyProgressPayload(m);
t.push(['les deux parties écrites séparément en local', JSON.parse(store[storageKey('luxParcoursLibre')]).uniteId === 1 && JSON.parse(store[storageKey('luxParcours')]).uniteId === 3]);

let rate = 0;
t.forEach(([nom, ok]) => { console.log((ok ? '  ok    ' : '  ÉCHEC ') + nom); if (!ok) rate++; });
console.log(rate ? rate + ' échec(s)' : 'tout est bon');
process.exitCode = rate ? 1 : 0;
`);
