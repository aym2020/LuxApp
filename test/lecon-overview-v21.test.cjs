'use strict';
// node --test test/lecon-overview-v21.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const css = read('public/lecon-v21.css');
const html = read('public/index.html');
const mission = read('public/mission.js');
const parcours = read('public/parcours.js');

test('La première maquette utilise une feuille dédiée et la photo locale déjà optimisée', () => {
  assert.match(html, /href="lecon-v21\.css"/);
  assert.match(html, /id="view-plecon"[\s\S]*?id="pl-num"[\s\S]*?id="pl-titre"[\s\S]*?id="pl-sous"[\s\S]*?id="pl-units"/);
  assert.match(css, /url\("art\/hero-luxapp-mobile\.webp"\)/);
  assert.match(css, /#view-plecon \.pl-head::before/);
  assert.match(css, /#view-plecon \.pl-unit\.prochaine/);
  assert.match(css, /#view-plecon \.pl-unit-actions/);
  assert.doesNotMatch(css, /#view-dashboard|#view-msintro|#view-pintro|#view-parcours|#view-mission/);
});

test('La mission garde toutes les actions avec une barre calculée sur les répliques réellement apprises', () => {
  const a = mission.indexOf('function missionHtml(l, conseillee)');
  const b = mission.indexOf('// État de la mission', a);
  assert.ok(a >= 0 && b > a);
  const extrait = mission.slice(a, b);
  const lecon = {
    id: 1, mission: {titre: 'Premier cours de luxembourgeois'},
    scene: [{qui:'toi', unite:1}, {qui:'prof', unite:2}, {qui:'toi', unite:1}, {qui:'prof', unite:2}]
  };
  const env = {
    studioActif: () => false,
    getMissionBest: () => null,
    repliqueApprise: (l, x) => x.unite === 1,
    statutMission: () => null,
    etiquetteMission: () => 'MISSION',
    escHtml: String,
    etatPreparationMission: () => 'En préparation',
    peutTenterSaChance: () => true,
    nbRepliquesToi: () => 2
  };
  const result = new Function('env', 'l', 'with(env){ '+extrait+'; return missionHtml(l, false); }')(env, lecon);
  assert.match(result, /Tu sais dire 2 répliques sur 4/);
  assert.match(result, /aria-valuemax="4" aria-valuenow="2"/);
  assert.match(result, /style="width:50%"/);
  assert.match(result, /onclick="voirScenario\(\)"/);
  assert.match(result, /onclick="openMission\(true\)"/);
  assert.match(result, /Tenter la mission · 2 répliques/);
});

test('Aucune action du parcours ou des unités n’est supprimée', () => {
  assert.match(parcours, /function renderParcoursLecon\(\)/);
  assert.match(parcours, /html = missionHtml\(l, !runIci && !prochaine\)/);
  assert.match(parcours, /html \+= carteUniteHtml\(l, u, runIci, prochaine, revision\)/);
  assert.match(parcours, /onclick="openIntro\(' \+ u\.id \+ '\)"/);
  assert.match(parcours, /function chipsEtapes\(uniteId\)/);
  assert.match(parcours, /onclick="startEtapeSeule\(/);
  assert.match(parcours, /onclick="startUnite\(/);
  assert.match(parcours, /function toutRevoir\(\)/);
  assert.match(parcours, /function lancerBilan\(\)/);
});

test('Écrans étroits, polices agrandies et accessibilité restent pris en charge', () => {
  assert.match(css, /@media \(max-width: 380px\)/);
  assert.match(css, /min-height: var\(--toucher\)/);
  assert.match(css, /overflow-wrap: break-word/);
  assert.match(css, /#view-plecon \.ms-progression/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
