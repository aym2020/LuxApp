// SPEC 75 — tests de données, navigation et structure (sans réseau).
'use strict';
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict'), vm=require('node:vm');
const racine=path.join(__dirname,'..');
const lecon=n=>JSON.parse(fs.readFileSync(path.join(racine,'data/lecons/A1.1/lecon-'+String(n).padStart(2,'0')+'.json')));
const empreinte=t=>{let x=2166136261>>>0;for(let i=0;i<t.length;i++)x=Math.imul(x^t.charCodeAt(i),16777619)>>>0;return x.toString(16);};
const origine={1:{autres:'b37b633b',cours:18},2:{autres:'308baf2d',cours:10},3:{autres:'259c0cf9',cours:12}};
const lecons=[lecon(1),lecon(2),lecon(3)];
const ecran={
  'cours75-panneau': {innerHTML:''},
  'cours75-principal': {innerHTML:''},
  'cp-content': {scrollTop:100}
};
const ctx={currentLecon:lecons[1],pLecon:lecons[1],
  escHtml:s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'),
  boutonEcouterHtml:lu=>lu==='Tipptopp!'?'<button class="bouton-ecouter compact" type="button">Écouter</button>':'',coursBlocsHtml:bs=>bs.map(b=>b.titre||b.contenu||'').join(' '),
  fermerBulleContexte:()=>{},document:{getElementById:id=>ecran[id]||null}};
const api=vm.runInNewContext(fs.readFileSync(path.join(racine,'public/cours75.js'),'utf8')+
  ';({cours75Actif,cours75Html,cours75Contenu,cours75Choisir,cours75Filtrer,cours75Etats})',ctx);
assert.equal(api.cours75Actif(lecon(4)),true,'leçon 4 migrée elle aussi');
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
assert.equal(supplements.length,2);
assert.equal(supplements.reduce((s,b)=>s+b.lignes.length,0),31);
assert.equal(l2.cours.find(b=>b.titre==='Article et négation selon le genre').rubrique,'regles');
api.cours75Html(l2,'principal',null,false);
api.cours75Etats.principal.rubrique='lexique';
const lex=api.cours75Contenu(l2,'principal');
assert.ok(lex.includes('Voir les mots supplémentaires (31)'));
assert.ok(lex.includes('cours75-entree-tete'),'lexique utilise le composant commun');
assert.ok(!lex.includes('<table class="cours-vocab">'),'plus de tableau de mise en page dans le lexique pilote');
assert.ok(lex.includes('<details class="cours75-plus"')&&!lex.includes('<details class="cours75-plus" open'));
assert.ok(lex.includes('Voir les phrases de cette leçon'));
// Même HTML pour le lexique et les phrases, indépendamment de la présence d'un audio.
api.cours75Html(lecons[0],'principal',null,false);
api.cours75Etats.principal.rubrique='lexique';
const lex1=api.cours75Contenu(lecons[0],'principal');
const expressionAvecSon='<span class="cours75-entree-lu">Tipptopp!</span><button class="bouton-ecouter compact"';
assert.ok(lex1.includes(expressionAvecSon),'bouton audio dans la ligne du mot');
const sansSon='<span class="cours75-entree-lu">Net immens.</span></div>' +
  '<div class="cours75-entree-fr">Pas terrible</div>';
assert.ok(lex1.includes(sansSon),'ligne identique sans audio, sans emplacement fictif');
const phrase1=api.cours75Html(lecons[0],'principal',1,false);
api.cours75Etats.principal.rubrique='phrases';
const textePhrases=api.cours75Contenu(lecons[0],'principal');
assert.ok(textePhrases.includes('cours75-entree-tete'),'phrases utilisent la même ligne que le lexique');
assert.ok(textePhrases.includes('cours75-entree-fr'),'même emplacement de traduction');
assert.ok(!textePhrases.includes('cours-dialogue'),'pas de double structure héritée');
const css=fs.readFileSync(path.join(racine,'public/style.css'),'utf8');
assert.match(css,/\.cours75-entree-tete\s*\{[^}]*min-height:40px/,
  'hauteur de base de 40 px même sans son');
assert.match(css,/\.cours75-entree-tete \.bouton-ecouter\.compact\s*\{[^}]*min-height:40px/,
  'audio de 40 px, sans pousser la traduction');
assert.match(css,/\.cours75-entree-fr\s*\{[^}]*margin-top:2px/,
  'traduction avec espacement constant');

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

assert.match(css,/#cours-panel \.cp-feuille\s*\{[^}]*height:88dvh/,'hauteur fixe du panneau');
assert.match(css,/grid-template-columns:repeat\(var\(--cours75-colonnes,5\),minmax\(0,1fr\)\)/,
  'toutes les unités accessibles sans défilement horizontal');
// Extension : les 25 leçons existantes partagent désormais la même structure.
const migration = require('../tools/spec75-migration.js');
let compte = 0, exemples = 0, tableauxComplexes = 0;
for (const niveau of ['A1.1','A1.2']) {
  for (const fichier of fs.readdirSync(path.join(racine,'data/lecons',niveau))
    .filter(f=>/^lecon-\d+\.json$/.test(f))) {
    const l=JSON.parse(fs.readFileSync(path.join(racine,'data/lecons',niveau,fichier)));
    const parties=migration.categories(l); compte++;
    assert.ok(api.cours75Actif(l),l.id+' : nouveau cours actif');
    assert.deepEqual(migration.migrant(l),l,l.id+' : migration stable');
    assert.ok(Object.values(parties).every(v=>v>0),l.id+' : 3 rubriques');
    assert.equal(l.cours.filter(b=>b.type==='dialogue'&&b.rubrique!=='phrases').length,0,
      'dialogue classé dans Phrases');
    assert.equal(l.cours.filter(b=>b.type==='callout'&&b.rubrique!=='regles').length,0,
      'règles correctement classées');
    for(const u of l.unites) {
      assert.ok(l.cours.some(b=>b.unite===u.id&&b.rubrique==='regles'),
        l.id+'/'+u.id+' : règle explicite');
      assert.ok(l.cours.some(b=>b.unite===u.id&&b.rubrique==='phrases'),
        l.id+'/'+u.id+' : phrases existantes');
    }
    const all=api.cours75Html(l,'principal',null,false);
    assert.ok(all.includes('--cours75-colonnes:'+(l.unites.length+1)));
    assert.ok(!all.includes('type="search"'),'aucune recherche locale');
    api.cours75Etats.principal.rubrique='phrases';
    const phrases=api.cours75Contenu(l,'principal');
    assert.ok(phrases.includes('cours75-entree-tete') || phrases.includes('cours-table'),
      l.id+' : affichage de Phrases');
    exemples+=(l.cours||[]).filter(b=>b.rubrique==='phrases').length;
    tableauxComplexes+=(l.cours||[]).filter(b=>b.rubrique==='lexique'&&b.type==='tableau'&&
      !(b.entetes[0]==='Luxembourgeois'&&b.entetes[1]==='Français')).length;
  }
}
assert.equal(compte,26,'18 leçons A1.1 + 8 leçons A1.2');
assert.ok(tableauxComplexes>=10,'tableaux complexes préservés avec leurs colonnes');
const lecon4=lecon(4);
assert.ok(lecon4.cours.some(b=>b.rubrique==='lexique'&&b.type==='tableau'&&
  b.entetes[0]==='Adjectif'&&b.entetes[1]==='↔ Contraire'),'les contraires restent un tableau à deux adjectifs');
const lecon6=lecon(6);
assert.ok(lecon6.cours.some(b=>b.rubrique==='lexique'&&b.type==='tableau'&&
  b.entetes[0]==='Singulier'&&b.entetes[1]==='Pluriel'),'pluriels préservés');
const lecon8=lecon(8);
assert.ok(lecon8.cours.some(b=>b.rubrique==='lexique'&&b.type==='tableau'&&
  b.entetes[0]==='Il'&&b.entetes[1]==='Elle'),'nationalités préservées');
const lecon21=JSON.parse(fs.readFileSync(path.join(racine,'data/lecons/A1.2/lecon-21.json')));
assert.ok(lecon21.cours.some(b=>b.unite===4&&b.rubrique==='phrases'&&b.items.some(
  x=>x[0]==='Um Dësch sinn zwee Glieser.')),'unité bonus avec phrase attestée');
assert.ok(lecon21.cours.some(b=>b.unite===4&&b.rubrique==='regles'&&b.titre==='Les pluriels'),
  'règle de l’unité bonus reprise des supports');

// Les salutations équivalentes ne doivent pas apparaître en doublon dans le Lexique.
const salutations=lecons[0].cours.find(b=>b.unite===1&&b.type==='vocab'&&b.titre==="Saluer quelqu'un");
const salut=salutations.items.filter(row=>row[0]==='Salut!');
assert.equal(salut.length,1,'une seule notion de salutation informelle');
assert.ok(salut[0].slice(2).join(' ').includes('Hallo!'),'variante explicite dans le lexique');
assert.ok(!salutations.items.some(row=>row[0]==='Hallo!'),'plus de deuxième ligne de même traduction');
api.cours75Html(lecons[0],'principal',1,false);
api.cours75Etats.principal.rubrique='lexique';
const greetings=api.cours75Contenu(lecons[0],'principal');
assert.ok(greetings.includes('Variante : Hallo!'),'variante visible dans le cours');

console.log('SPEC 75 + 79 : OK — 26 leçons, lexique et règle du N cohérents.');
