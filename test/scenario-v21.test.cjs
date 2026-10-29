'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const mission = read('public/mission.js');
const css = read('public/scenario-v21.css');
const html = read('public/index.html');
const navigation = read('public/navigation.js');
function extract(start, finish) {
  const a = mission.indexOf(start);
  const b = mission.indexOf(finish, a + start.length);
  assert.ok(a >= 0 && b > a, 'Missing function range: ' + start);
  return mission.slice(a, b);
}
const linesSource = extract('function bulleSceneHtml(l, x)', '// ─── CARTE MISSION');
const sceneSource = extract('function voirScenario()', '// ─── INTRODUCTION DE LA MISSION');
function simulate(options = {}) {
  const l = {
    id: options.id || 3,
    mission: {
      titre: 'Aux objets trouvés',
      contexte: 'Tu as oublié un sac.',
      objectif: 'Dire les couleurs.'
    },
    scene: [
      {qui:'Employée', unite:1, lu:'Moien!',fr:'Bonjour !'},
      {qui:'toi', unite:1, lu:"D'Mapp ass schwaarz.",fr:'Le sac est noir.'},
      {qui:'Employée', unite:2, lu:'Ass en blo?',fr:'Est-il bleu ?'},
      {qui:'toi', unite:2, lu:'Jo, en ass blo!',fr:'Oui, il est bleu !'}
    ]
  };
  let htmlContent='',panelCreated=null,dialogName='';
  const panel={
    classes:[],
    attrs:{},
    classList:{add(x){panel.classes.push(x)}},
    setAttribute(k,v){panel.attrs[k]=v}
  };
  const ctx={
    pLecon:l,
    studioActif:()=>!!options.studio,
    studioVoirScenario:()=>{htmlContent='STUDIO'},
    repliqueApprise:(_,x)=>x.unite===1,
    numLecon:x=>x.id,
    nbRepliquesToi:x=>x.scene.filter(y=>y.qui==='toi').length,
    getMissionBest:()=>options.completed ? 90 : null,
    boutonEcouterHtml:s=>'<button aria-label="Écouter" data-lu="'+s+'">Son</button>',
    escHtml:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'),
    ouvrirPanneau:(h,name)=>{htmlContent=h;dialogName=name;panelCreated=panel},
    document:{getElementById:key=>key==='panneau'?panelCreated:null}
  };
  new Function('ctx', 'with(ctx){' + linesSource + sceneSource + 'voirScenario();}')(ctx);
  return {htmlContent,panel,dialogName};
}
test('Panneau immersif isolé et feuille CSS chargée après le style commun',()=>{
  assert.match(html,/href="scenario-v21\.css\?v=spec114-1"/);
  assert.match(css,/\.panneau\.ms-v21-dialogue\s*\{/);
  assert.doesNotMatch(css,/#view-mission|#view-plecon|\.panneau\.ms-debloque/);
  assert.match(css,/height: 100dvh/);
  assert.match(css,/max-height: 100dvh/);
});
test('L’en-tête reste visible et affiche titre et bons compteurs',()=>{
  const a=simulate();
  assert.equal(a.dialogName,'Scénario de la mission');
  assert.deepEqual(a.panel.classes,['ms-v21-dialogue']);
  assert.equal(a.panel.attrs['aria-modal'],'true');
  assert.equal(a.panel.attrs['aria-labelledby'],'ms-v21-titre');
  assert.match(a.htmlContent,/SCÉNARIO · LEÇON 3/);
  assert.match(a.htmlContent,/Aux objets trouvés/);
  assert.match(a.htmlContent,/4 répliques · 2 à toi/);
});
test('Contexte et objectif sont repliés, sans répétition obligatoire',()=>{
  const a=simulate();
  assert.match(a.htmlContent,/<details class="ms-v21-rappel">/);
  assert.doesNotMatch(a.htmlContent,/<details class="ms-v21-rappel" open/);
  assert.match(a.htmlContent,/Rappel du contexte/);
  assert.match(a.htmlContent,/Tu as oublié un sac/);
  assert.match(a.htmlContent,/Dire les couleurs/);
});
test('Chaque réplique et sa traduction sont affichées avec audio et repères d’unités',()=>{
  const a=simulate();
  assert.equal((a.htmlContent.match(/class="ms-v21-ligne(?: toi)?"/g)||[]).length,4);
  assert.equal((a.htmlContent.match(/aria-label="Écouter"/g)||[]).length,4);
  assert.match(a.htmlContent,/D'Mapp ass schwaarz/);
  assert.match(a.htmlContent,/Le sac est noir/);
  assert.match(a.htmlContent,/class="ms-v21-ligne toi"/);
  assert.equal((a.htmlContent.match(/class="ms-v21-unite"/g)||[]).length,2);
  assert.match(a.htmlContent,/ms-v21-visually-hidden/);
});
test('Le CTA reste toujours présent, suit le moteur et ne masque pas le défilement',()=>{
  const a=simulate();
  assert.match(a.htmlContent,/class="ms-v21-pied"/);
  assert.match(a.htmlContent,/Jouer la mission/);
  assert.match(a.htmlContent,/onclick="fermerPanneau\(\); openMission\(peutTenterSaChance\(pLecon\)\)"/);
  assert.match(simulate({completed:true}).htmlContent,/Rejouer la mission/);
  assert.match(css,/\.ms-v21-lecture\s*\{[\s\S]*?overflow-y: auto;/);
  assert.match(css,/\.ms-v21-pied\s*\{[\s\S]*?flex: 0 0 auto;/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
});
test('Fermeture Android préservée ; pas de bouton Fermer doublon en pied',()=>{
  const a=simulate();
  assert.match(a.htmlContent,/aria-label="Fermer le scénario"/);
  assert.match(a.htmlContent,/onclick="fermerPanneau\(\)"/);
  assert.doesNotMatch(a.htmlContent,/>Fermer<\/button>/);
  assert.match(navigation,/if \(document\.querySelector\('\.panneau'\)\) \{ fermerPanneau\(\); return true; \}/);
});
test('La mission du studio conserve son ancien scénario spécialisé',()=>{
  assert.equal(simulate({studio:true}).htmlContent,'STUDIO');
});
test('Navigation, formats compacts et réduction des animations respectés',()=>{
  assert.match(css,/@media \(max-width: 360px\)/);
  assert.match(css,/min-width: 44px/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css,/:focus-visible/);
});
