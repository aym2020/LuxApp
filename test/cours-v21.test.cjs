'use strict';
// node --test test/cours-v21.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('public/cours-v21.css');
const cours = read('public/cours75.js');
const parcours = read('public/parcours.js');
const html = read('public/index.html');
const app = read('public/app.js');

function rule(selector) {
  const i = css.indexOf(selector + ' {');
  assert.ok(i >= 0, 'Sélecteur absent : ' + selector);
  return css.slice(i, css.indexOf('}', i + selector.length));
}
function loadCours(env) {
  new Function('env','with(env){' + cours +
    ';env.api={cours75Actif,cours75Html,cours75Choisir,cours75Etats,cours75Contenu,cours75EntreeHtml,cours75Bloc};}')(env);
  return env.api;
}
function fixture() {
  const lecon = {
    id:9, titre:'Sproochen', couleur:'#8f82de',
    unites:[{id:1,titre:'Dire les langues'},{id:2,titre:'Poser une question'}],
    cours:[
      {unite:1,rubrique:'regles',type:'callout',variant:'retenir',titre:'Parler une langue',lignes:['La langue est invariable.']},
      {unite:2,rubrique:'regles',type:'tableau',titre:'Schwätzen',entetes:['Personne','Forme'],lignes:[['ech','schwätzen'],['du','schwätz']]},
      {unite:1,rubrique:'lexique',type:'vocab',titre:'Langues',items:[['Franséisch','français'],['Portugisesch','portugais']]},
      {unite:2,rubrique:'lexique',type:'vocab',titre:'Autres langues',items:[['Japanesch','japonais']]},
      {unite:1,rubrique:'phrases',type:'phrases',titre:'Phrases à connaître',items:[['Ech schwätze Franséisch.','Je parle français.']]},
      {unite:0,rubrique:'regles',type:'texte',contenu:'Pour toute la leçon.'}
    ]
  };
  const nodes = {
    'cours75-panneau':{innerHTML:''},
    'cours75-principal':{innerHTML:''},
    'cours75-resultats-panneau':{scrollTop:270},
    'cp-content':{scrollTop:77}
  };
  const env={
    pLecon:lecon,currentLecon:lecon,pCoursUnite:null,document:{getElementById:id=>nodes[id]||null},
    fermerBulleContexte:()=>{},escHtml:s=>String(s),boutonEcouterHtml:s=>'<button aria-label="Écouter">'+s+'</button>',
    coursBlocsHtml:arr=>arr.map(b=>'<section data-type="'+b.type+'">'+b.titre+(b.contenu||'')+'</section>').join('')
  };
  return {lecon,nodes,env,api:loadCours(env)};
}

test('La feuille Cours est correctement chargée sur 2.1',()=>{
 assert.match(html,/href="cours-v21\.css\?v=2"/);
 assert.match(html,/src="cours75\.js\?v=2"/);
 assert.match(html,/src="parcours\.js\?v=2"/);
 assert.match(html,/id="cours-panel"/);
});

test('La navigation Cours reste visible, les résultats seuls défilent',()=>{
 assert.match(rule('#cours-panel .cp-content:has(.cours75)'),/overflow:\s*hidden/);
 assert.match(rule('#cours-panel .cours75'),/display:\s*flex/);
 assert.match(rule('#cours-panel .cours75-navigation'),/flex:\s*0 0 auto/);
 assert.match(rule('#cours-panel .cours75-resultats'),/overflow-y:\s*auto/);
 assert.match(rule('#cours-panel .cours75-resultats'),/min-height:\s*0/);
 assert.match(rule('#cours-panel .cp-bas'),/flex:\s*0 0 auto/);
 assert.match(rule('#cours-panel .cp-feuille'),/animation:\s*none/);
});

test('La sélection de filtre/onglet conserve le moteur et remet le bon scroll en haut',()=>{
 const {api,nodes}=fixture();
 const initial = api.cours75Html({id:9,titre:'Sproochen',couleur:'#8f82de',
   unites:[{id:1,titre:'Dire les langues'},{id:2,titre:'Poser une question'}],
   cours:[{unite:1,rubrique:'lexique',type:'vocab',titre:'Langues',items:[['Franséisch','français']]}]
 },'panneau',null,true);
 assert.match(initial,/cours75-navigation/);
 assert.match(initial,/cours75-resultats-panneau/);
 assert.match(initial,/Règles/);
 assert.match(initial,/Lexique/);
 assert.match(initial,/Phrases/);
 assert.match(initial,/Tout/);
 nodes['cours75-resultats-panneau'].scrollTop=270;
 api.cours75Choisir('panneau','rubrique','lexique');
 assert.equal(api.cours75Etats.panneau.rubrique,'lexique');
 assert.equal(nodes['cours75-resultats-panneau'].scrollTop,0);
 assert.match(nodes['cours75-panneau'].innerHTML,/Franséisch/);
 nodes['cours75-resultats-panneau'].scrollTop=120;
 api.cours75Choisir('panneau','unite',2);
 assert.equal(api.cours75Etats.panneau.unite,2);
 assert.equal(nodes['cours75-resultats-panneau'].scrollTop,0);
});

test('Le panneau conserve tous les types pédagogiques et les audios',()=>{
 const {api,lecon}=fixture();
 api.cours75Html(lecon,'panneau',null,false);
 let rules=api.cours75Contenu(lecon,'panneau');
 assert.match(rules,/Parler une langue/);
 assert.match(rules,/Schwätzen/);
 assert.match(rules,/Pour toute la leçon/);
 api.cours75Etats.panneau.rubrique='lexique';
 const lexique=api.cours75Contenu(lecon,'panneau');
 assert.match(lexique,/Franséisch/);
 assert.match(lexique,/Japanesch/);
 assert.match(lexique,/aria-label="Écouter"/);
 api.cours75Etats.panneau.rubrique='phrases';
 assert.match(api.cours75Contenu(lecon,'panneau'),/Ech schwätze Franséisch/);
 assert.match(app,/sec\.type === 'tableau'/);
 assert.match(app,/sec\.type === 'callout'/);
 assert.match(app,/sec\.type === 'dialogue'/);
});

test('La nouvelle DA enlève les grosses cartes, sans effacer les distinctions',()=>{
 assert.match(rule('#cours-panel .cours-bloc,\n#cours-panel .cours-regle'),/background:\s*transparent/);
 assert.match(rule('#cours-panel .cours-callout'),/background:\s*transparent/);
 assert.match(rule('#cours-panel .cours-callout.cc-attention'),/var\(--couleur-orange\)/);
 assert.match(rule('#cours-panel .cours-callout'),/border-left:\s*3px solid/);
 assert.match(rule('#cours-panel .cours75-chip.active'),/var\(--couleur-or-fond\)/);
 assert.match(rule('#cours-panel .cours75-onglet.active::after'),/var\(--couleur-action\)/);
 assert.match(rule('#cours-panel .cours75-entree-tete .bouton-ecouter.compact'),/min-height:\s*44px/);
});

test('Aucun contenu ni état d’exercice modifié par la nouvelle feuille',()=>{
 assert.match(parcours,/focusSiClavierPhysique\(input\)/);
 assert.match(parcours,/document\.getElementById\('cours-panel'\)\.classList\.add\('hidden'\)/);
 assert.match(parcours,/pCoursUnite = uniteId == null \? null : uniteId/);
 assert.match(parcours, /COURS · LEÇON/);
 assert.doesNotMatch(css,/#view-parcours|#view-session|#view-pintro|#view-dashboard/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/env\(safe-area-inset-bottom\)/);
});

test('Les filtres et les onglets se rapprochent, avec des cibles de 44 px',()=>{
 assert.match(rule('#cours-panel .cours75-navigation'),/padding: 7px 23px 0/);
 assert.match(rule('#cours-panel .cours75-portee'),/padding: 0 0 4px/);
 assert.match(rule('#cours-panel .cours75-onglet'),/min-height: 44px/);
 assert.match(rule('#cours-panel .cours75-chip'),/min-height: 44px/);
 assert.match(css,/#cours-panel \.cours75-onglet\.active::after/);
});

test('Tableaux : mots non césurés avec défilement horizontal de secours',()=>{
 assert.match(rule('#cours-panel .cours-table'),/table-layout: auto/);
 assert.match(rule('#cours-panel .cours-table-wrap'),/overflow-x: auto/);
 const cells = rule('#cours-panel .cours-table th,\n#cours-panel .cours-table td');
 assert.match(cells,/overflow-wrap: normal/);
 assert.match(cells,/word-break: normal/);
 assert.match(cells,/hyphens: none/);
 assert.match(cells,/-webkit-hyphens: none/);
 assert.doesNotMatch(css,/#cours-panel \.cours-table \{ table-layout: fixed/);
});
