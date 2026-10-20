// SPEC 75 — tests déterministes du pilote, sans réseau.
'use strict';
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict'), vm=require('node:vm');
const racine=path.join(__dirname,'..');
const lecon=n=>JSON.parse(fs.readFileSync(path.join(racine,'data/lecons/A1.1/lecon-'+String(n).padStart(2,'0')+'.json')));
const empreinte=t=>{let x=2166136261>>>0;for(let i=0;i<t.length;i++)x=Math.imul(x^t.charCodeAt(i),16777619)>>>0;return x.toString(16);};
const origine={1:{autres:'4620339c',cours:18},2:{autres:'7c469ef',cours:11},3:{autres:'259c0cf9',cours:12}};
const lecons=[lecon(1),lecon(2),lecon(3)];
const ecran={};
const ctx={currentLecon:lecons[1],pLecon:lecons[1],
  escHtml:s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'),
  boutonEcouterHtml:()=>'',coursBlocsHtml:bs=>bs.map(b=>b.titre||b.contenu||'').join(' '),
  fermerBulleContexte:()=>{},document:{getElementById:id=>ecran[id]||null}};
const api=vm.runInNewContext(fs.readFileSync(path.join(racine,'public/cours75.js'),'utf8')+
  ';({cours75Actif,cours75Html,cours75Contenu,cours75Choisir,cours75Rechercher,cours75Filtrer,cours75Etats})',ctx);
assert.equal(api.cours75Actif(lecon(4)),false,'leçon 4 non migrée');
for(const l of lecons) {
  assert.ok(api.cours75Actif(l),'pilote '+l.id);
  assert.equal(l.cours.length,origine[l.id].cours+l.unites.length);
  assert.ok(l.cours.every(b=>['regles','lexique','phrases'].includes(b.rubrique)));
  assert.equal(l.cours.filter(b=>b.type==='dialogue').length,1,'dialogue conservé');
  assert.equal(l.cours.filter(b=>b.type==='phrases').length,l.unites.length);
  const nonCours={...l};delete nonCours.cours;
  assert.equal(empreinte(JSON.stringify(nonCours)),origine[l.id].autres,
    'aucune modification exercices / unités / mission / progression');
}
const l2=lecons[1];
const supplements=l2.cours.filter(b=>b.plus && b.rubrique==='lexique' && b.type==='tableau');
assert.equal(supplements.length,3);
assert.equal(supplements.reduce((s,b)=>s+b.lignes.length,0),36,'36 mots supplémentaires');
assert.equal(l2.cours.find(b=>b.titre==='Article et négation selon le genre').rubrique,'regles');
api.cours75Html(l2,'principal',null,false);
api.cours75Etats.principal.rubrique='lexique';
const lex=api.cours75Contenu(l2,'principal');
assert.ok(lex.includes('Voir les mots supplémentaires (31)'));
assert.ok(lex.includes('Voir les mots supplémentaires (5)'));
assert.ok(lex.includes('<details class="cours75-plus"')&&!lex.includes('<details class="cours75-plus" open'));
assert.ok(lex.includes('Voir les phrases de cette leçon'));
api.cours75Etats.principal.recherche='ordinateur';
const filtre=api.cours75Contenu(l2,'principal');
assert.ok(filtre.includes('Computer')&&!filtre.includes('e Bus'),'recherche FR');
api.cours75Etats.principal.recherche='';
api.cours75Etats.principal.rubrique='phrases';
const phr=api.cours75Contenu(l2,'principal');
assert.ok(phr.includes('Premier jour au bureau')&&phr.includes('Phrases à connaître'));
api.cours75Html(lecons[0],'panneau',2,true);
assert.equal(api.cours75Etats.panneau.unite,2);
assert.equal(api.cours75Etats.panneau.exercice,true);
const panneau=api.cours75Html(lecons[0],'panneau',2,true);
assert.ok(panneau.includes('Unité 2')&&!panneau.includes('>Unité 1</button>'));
console.log('SPEC 75 : OK — 3 leçons, rubriques, unités, recherche, 36 bonus et dialogues.');
