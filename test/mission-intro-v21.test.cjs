'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const html = read('public/index.html');
const mission = read('public/mission.js');
const css = read('public/mission-intro-v21.css');

function renderFakeIntro(id, titre) {
  const a = mission.indexOf('function renderIntroMission() {');
  const b = mission.indexOf('// SPEC 55 :', a);
  assert.ok(a>=0 && b>a, 'Source renderIntroMission introuvable');
  const l = {id, mission:{
    titre, contexte:'Contexte de la mission', objectif:'Objectif de la mission'
  }};
  const container={innerHTML:''};
  const env={
    pLecon:l,studioActif:()=>false,
    numLecon:x=>x.id,escHtml:String,
    unitesCoeur:()=>[{id:1},{id:2},{id:3}],
    nbRepliquesToi:()=>10, peutTenterSaChance:()=>true,
    ICONES:{coche:'<svg></svg>'},
    document:{getElementById:()=>container}
  };
  new Function('env','with(env){' + mission.slice(a,b) + 'renderIntroMission();}')(env);
  return container.innerHTML;
}

test('Le visuel hero est un vrai asset WebP dédié à la mission correspondante',()=>{
  assert.match(html,/href="mission-intro-v21\.css\?v=2"/);
  assert.match(css,/url\("art\/mission-objets-trouves-v21\.webp\?v=hd1024"\)/);
  assert.match(css,/#view-msintro \.msi-v21-hero/);
  const result=renderFakeIntro(3,'Aux objets trouvés');
  assert.match(result,/class="msi-v21-hero" aria-hidden="true"/);
  assert.ok(result.indexOf('msi-v21-hero')<result.indexOf('MISSION · LEÇON 3'));
});

test('Pas d’illustration hors sujet pour les autres missions',()=>{
  assert.doesNotMatch(renderFakeIntro(1,'Premier cours de luxembourgeois'),/msi-v21-hero/);
  assert.doesNotMatch(renderFakeIntro(3,'Une autre mission'),/msi-v21-hero/);
});

test('Aucune instruction pédagogique ni option de navigation supprimée',()=>{
  const result=renderFakeIntro(3,'Aux objets trouvés');
  assert.match(result,/Contexte de la mission/);
  assert.match(result,/À la fin, tu sauras :/);
  assert.match(result,/Objectif de la mission/);
  assert.match(result,/3 unités/);
  assert.match(result,/10 répliques/);
  assert.match(result,/onclick="confirmerIntroMission\(\)"/);
  assert.match(result,/onclick="voirUnitesDepuisIntro\(\)"/);
  assert.match(result,/onclick="tenterDepuisIntro\(\)"/);
  assert.match(result,/class="msi-v21-links"/);
  assert.match(result,/>Tenter la mission<\/button>/);
  assert.match(html,/id="view-msintro"/);
  assert.match(html,/onclick="voirUnitesDepuisIntro\(\)">Passer/);
});

test('Pas de bloc orange ou de vide artificiel ; CTA et liens restent accessibles',()=>{
  assert.match(css,/#view-msintro \.msi-objectif\s*\{[^}]*border-left: 3px solid/s);
  assert.match(css,/#view-msintro \.msi-bas\s*\{[^}]*position: static;/s);
  assert.match(css,/#view-msintro \.msi-v21-info/);
  assert.match(css,/#view-msintro \.msi-bas \.pc-btn.primary/);
  assert.match(css,/#view-msintro \.msi-bas \.msi-v21-link/);
  assert.match(css,/#view-msintro \.msi-v21-links\s*\{[^}]*display: flex;/s);
  assert.match(css,/#view-msintro \.msi-bas \.msi-v21-link\s*\{[^}]*min-height: 44px;/s);
  assert.match(css,/@media \(max-width: 380px\)/);
  assert.match(css,/@media \(max-height: 740px\)/);
  assert.match(css,/:focus-visible/);
  assert.doesNotMatch(css,/#view-dashboard|#view-plecon|#view-parcours|#view-mission/);
});
