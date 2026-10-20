// SPEC 75 — tests de données, navigation et structure (sans réseau).
'use strict';
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict'), vm=require('node:vm');
const racine=path.join(__dirname,'..');
const lecon=n=>JSON.parse(fs.readFileSync(path.join(racine,'data/lecons/A1.1/lecon-'+String(n).padStart(2,'0')+'.json')));
const empreinte=t=>{let x=2166136261>>>0;for(let i=0;i<t.length;i++)x=Math.imul(x^t.charCodeAt(i),16777619)>>>0;return x.toString(16);};
const origine={1:{autres:'4620339c',cours:18},2:{autres:'7c469ef',cours:11},3:{autres:'259c0cf9',cours:12}};
const lecons=[lecon(1),lecon(2),lecon(3)];
const ecran={
  'cours75-panneau': {innerHTML:''},
  'cours75-principal': {innerHTML:''},
  'cp-content': {scrollTop:100}
};
const ctx={currentLecon:lecons[1],pLecon:lecons[1],
  escHtml:s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'),
  boutonEcouterHtml:()=>'',coursBlocsHtml:bs=>bs.map(b=>b.titre||b.contenu||'').join(' '),
  fermerBulleContexte:()=>{},document:{getElementById:id=>ecran[id]||null}};
const api=vm.runInNewContext(fs.readFileSync(path.join(racine,'public/cours75.js'),'utf8')+
  ';({cours75Actif,cours75Html,cours75Contenu,cours75Choisir,cours75Filtrer,cours75Etats})',ctx);
assert.equal(api.cours75Actif(lecon(4)),false,'leçon 4 conserve son cours historique');
for(const l of lecons) {
  assert.ok(api.cours75Actif(l),'pilote '+l.id);
  assert.equal(l.cours.length,origine[l.id].cours+l.unites.length);
  assert.ok(l.cours.every(b=>['regles','lexique','phrases'].includes(b.rubrique)));
  assert.equal(l.cours.filter(b=>b.type==='dialogue').length,1,'dialogue conservé');
  assert.equal(l.cours.filter(b=>b.type==='phrases').length,l.unites.length);
  const nonCours={...l};delete nonCours.cours;
  assert.equal(empreinte(JSON.stringify(nonCours)),origine[l.id].autres,
    'aucune modification des exercices, unités ou missions');
  const cours=api.cours75Html(l,'principal',null,false);
  assert.ok(cours.includes('aria-label="Toute la leçon"'),'Tout visible');
  assert.ok(cours.includes('--cours75-colonnes:'+(l.unites.length+1)),'grille à largeur égale');
  for(const u of l.unites)assert.ok(cours.includes('aria-label="Unité '+u.id+'"'),'unité visible '+u.id);
  assert.ok(!cours.includes('type="search"'),'aucune recherche locale');
}
const l2=lecons[1];
const supplements=l2.cours.filter(b=>b.plus&&b.rubrique==='lexique'&&b.type==='tableau');
assert.equal(supplements.length,3);
assert.equal(supplements.reduce((s,b)=>s+b.lignes.length,0),36);
assert.equal(l2.cours.find(b=>b.titre==='Article et négation selon le genre').rubrique,'regles');
api.cours75Html(l2,'principal',null,false);
api.cours75Etats.principal.rubrique='lexique';
const lex=api.cours75Contenu(l2,'principal');
assert.ok(lex.includes('Voir les mots supplémentaires (31)')&&lex.includes('Voir les mots supplémentaires (5)'));
assert.ok(lex.includes('cours75-ligne-lu'),'icône liée au mot');
assert.ok(lex.includes('<details class="cours75-plus"')&&!lex.includes('<details class="cours75-plus" open'));
assert.ok(lex.includes('Voir les phrases de cette leçon'));
const echelle=lecons[0].cours.find(b=>b.titre==="Comment ça va ? L'échelle");
assert.ok(echelle.lignes.some(r=>r[0]==="Tipptopp!"));
assert.equal(echelle.lignes.filter(r=>r[0].includes(' · ')).length,0,'variantes séparées');
api.cours75Etats.principal.rubrique='phrases';
const phrases=api.cours75Contenu(l2,'principal');
assert.ok(phrases.includes('Premier jour au bureau')&&phrases.includes('Phrases à connaître'));
// Le panneau ouvert sur une unité doit proposer toutes les autres sans défilement.
let panel=api.cours75Html(l2,'panneau',2,true);
assert.equal(api.cours75Etats.panneau.unite,2);
for(const n of [1,2,3])assert.ok(panel.includes('aria-label="Unité '+n+'"'));
assert.ok(panel.includes('aria-label="Toute la leçon"'));
api.cours75Choisir('panneau','unite',1);
assert.equal(api.cours75Etats.panneau.unite,1);
assert.equal(ecran['cp-content'].scrollTop,0,'le contenu retourne en haut');
api.cours75Choisir('panneau','rubrique','phrases');
assert.equal(api.cours75Etats.panneau.unite,1,'changer de rubrique garde l’unité');
api.cours75Choisir('panneau','unite',null);
assert.equal(api.cours75Etats.panneau.unite,null,'Toute la leçon disponible');
const css=fs.readFileSync(path.join(racine,'public/style.css'),'utf8');
assert.match(css,/#cours-panel \.cp-feuille\s*\{[^}]*height:88dvh/,'hauteur fixe du panneau');
assert.match(css,/grid-template-columns:repeat\(var\(--cours75-colonnes,5\),minmax\(0,1fr\)\)/,
  'toutes les unités accessibles sans défilement horizontal');
console.log('SPEC 75 : OK — hauteur fixe, unités 1–4/Tout, recherche absente, cours intact, bonus et dialogues.');
