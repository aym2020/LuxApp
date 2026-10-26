'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const code=read('public/parcours.js'),css=read('public/lecon-v21.css'),index=read('public/index.html');
const begin=code.indexOf('function carteUniteHtml(l, u, runIci, prochaine, revision) {');
const end=code.indexOf('// "Tout revoir"',begin);
assert(begin!==-1 && end>begin);
const render=new Function('e','l','u','with(e){'+code.slice(begin,end)+';return carteUniteHtml(l,u,null,null,{dusParUnite:{}})}');
function unit(score){
 const l={id:20,unites:[{id:1},{id:2}]};
 const u={id:1,titre:'Dans quelle pièce ?',phrase:['Wou ass de Frigo?']};
 const e={
   getUnitBest:()=>score,getSansFaute:()=>false,
   leconAcquiseParMission:()=>false,acquiseAncienneVersion:()=>false,
   itemsUnite:()=>[{lu:'an der Kichen'},{lu:'am Buedzëmmer'}],
   escHtml:s=>String(s),etoilesHtml:()=>score>=90?'★★★':'★★☆',
   etoiles:()=>score>=90?3:2,peutRattraperEtoile:()=>score>=70&&score<90,
   peutRevoirErreursUnite:()=>score>=90,
   chipsEtapes:()=>'',pLibreIci:null
 };
 return render(e,l,u);
}
test('revoir ses erreurs : bouton turquoise, icône/texte/flèche, moteur non noté',()=>{
 const s=unit(95);
 assert.match(s,/pl-revoir-erreurs pl-action-unite/);
 assert.match(s,/onclick="lancerRevisionErreursUnite\(1\)"/);
 assert.match(s,/<span class="pl-action-icone" aria-hidden="true">↻<\/span>/);
 assert.match(s,/Revoir mes erreurs/);
 assert.match(s,/Questions difficiles · étoiles conservées/);
 assert.match(s,/class="pl-action-chevron" aria-hidden="true">›/);
 assert.doesNotMatch(s,/Gagner ma 3e étoile/);
 assert.doesNotMatch(s,/lancerRattrapageEtoile/);
});
test('rattrapage : texte dynamique et moteur noté (pas d\'attribution automatique)',()=>{
 const s=unit(88);
 assert.match(s,/pl-action-unite pl-gagner-etoile/);
 assert.match(s,/onclick="lancerRattrapageEtoile\(1\)"/);
 assert.match(s,/Gagner ma 3e étoile/);
 assert.match(s,/88 % → 90 % · Défi ciblé/);
 assert.doesNotMatch(s,/Revoir mes erreurs/);
 assert.doesNotMatch(s,/lancerRevisionErreursUnite/);
});
test('visuel isolé, CSS chargée et états tactiles/clavier accessibles',()=>{
 assert.match(css,/#view-plecon \.pl-unit > \.pc-btn\.wide\.pl-action-unite/);
 assert.match(css,/min-height:\s*76px/);
 assert.match(css,/#view-plecon \.pl-action-unite:focus-visible/);
 assert.match(css,/#view-plecon \.pl-revoir-erreurs \.pl-action-icone/);
 assert.match(css,/#view-plecon \.pl-gagner-etoile \.pl-action-icone/);
 assert.match(css,/@media \(max-width: 360px\)/);
 assert.match(index,/lecon-v21\.css\?v=actions-unite-or-doux-20261026/);
 assert.doesNotMatch(css,/#view-dashboard|#view-mission|#view-review-setup/);
});

test('SPEC 108 : glyphes remontés sans déplacer leur fond ni modifier leur taille', () => {
  const icone = css.match(/#view-plecon \.pl-action-unite \.pl-action-icone \{([^}]*)\}/);
  const chevron = css.match(/#view-plecon \.pl-action-unite \.pl-action-chevron \{([^}]*)\}/);
  assert.ok(icone && chevron);
  assert.match(icone[1], /box-sizing:\s*border-box/);
  assert.match(icone[1], /padding-bottom:\s*4px/);
  assert.match(icone[1], /width:\s*36px/);
  assert.match(icone[1], /height:\s*36px/);
  assert.match(chevron[1], /transform:\s*translateY\(-2px\)/);
});
test('SPEC 108 : défi étoile en or doux, moins dominant que le CTA primaire', () => {
  const defi = css.match(/#view-plecon \.pl-unit > \.pl-action-unite\.pl-gagner-etoile \{([^}]*)\}/);
  assert.ok(defi);
  assert.match(defi[1], /color:\s*#d6ae51/);
  assert.match(defi[1], /border-color:\s*#574b32/);
  assert.doesNotMatch(defi[1], /var\(--couleur-action\)/);
  assert.match(css, /#view-plecon \.pl-gagner-etoile \.pl-action-chevron \{ color: var\(--couleur-texte-3\); \}/);
  assert.match(css, /#view-plecon \.pl-revoir-erreurs \.pl-action-icone/);
});
