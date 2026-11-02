/* Contrats de l'accueil Watfir : données et destinations restent dans la 2.1.
 * node --test test/watfir-home.test.cjs */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const watfir=fs.readFileSync(path.join(root,'public/accueil-watfir.js'),'utf8');

function setup(levels=['A1.1','A1.2','A2.1','A2.2','B1.1']) {
  const d = {handler:null,dialog:null,focusCount:0};
  const trigger = {setAttribute(){},focus(){d.focusCount++}};
  const close = {focus(){},addEventListener(t,fn){this.listener=fn}};
  const list = {innerHTML:''};
  const body = {classList:{add(){},remove(){}}};
  const document={
    body,
    addEventListener(type,fn){if(type==='click')d.handler=fn},
    querySelector(s){return s==='#view-dashboard .wf-niveau-ouvrir'?trigger:null},
    getElementById(id){return id==='wf-niveaux-dialog'?d.dialog:null},
    createElement(tag){
      assert.equal(tag,'dialog');
      d.dialog={
        open:false,innerHTML:'',listeners:{},attributes:{},
        setAttribute(k,v){this.attributes[k]=v},
        addEventListener(k,fn){this.listeners[k]=fn},
        querySelector(s){return s==='.wf-sheet-close'?close:s==='.wf-sheet-levels'?list:null},
        showModal(){this.open=true},
        close(){this.open=false;if(this.listeners.close)this.listeners.close()},
      };
      return d.dialog;
    },
  };
  document.body.appendChild=()=>{};
  const ctx={
    document, niveauActif:'A1.1', niveauxDisponibles:()=>levels,
    enteteAccueilHtml:()=>'',renderAccueil:()=>{},chiffresHtml:()=>'<div>Aujourd’hui</div><div>6<span class="ac-v21-bilan-unite"> %</span></div><span class="ac-v21-bilan-unite"> jours</span>',
    accrocheHtml:()=>'', ligneCompteHtml:()=>'<div>invite</div>',
    etatSynchro:()=>null,libelleMenuSynchro:()=> 'Menu',pastilleSynchroHtml:()=> '',
    aDejaPratique:()=>false,
    escHtml:t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    ICONES:{reglages:'<svg></svg>',chevron:'<svg></svg>'},
    changerNiveauAccueil(n){ctx.niveauActif=n;ctx.changes.push(n)},changes:[]
  };
  vm.runInNewContext(watfir,ctx,{filename:'accueil-watfir.js'});
  function click(className,option){
    const element={getAttribute(k){return k==='data-wf-niveau'?option:null}};
    d.handler({target:{closest(selector){
      if(selector==='#view-dashboard .wf-niveau-ouvrir')return className==='open'?element:null;
      return className==='level'?element:null;
    }}});
  }
  return {ctx,d,list,click};
}
test('Watfir shows only the active family and a chevron',()=>{
  const {ctx}=setup();
  const h=ctx.enteteAccueilHtml();
  assert.match(h,/Watfir/);
  assert.match(h,/A1\.1/);
  assert.match(h,/A1\.2/);
  assert.doesNotMatch(h,/data-wf-niveau="A2\.1"/);
  assert.match(h,/aria-haspopup="dialog"/);
  ctx.niveauActif='B1.1';
  const b=ctx.enteteAccueilHtml();
  assert.match(b,/B1\.1/);
  assert.doesNotMatch(b,/data-wf-niveau="A1\.1"/);
});
test('Live levels select the existing 2.1 navigation function',()=>{
  const {ctx,click}=setup();
  click('level','A1.2');
  assert.deepEqual(ctx.changes,['A1.2']);
  click('level','B2.1'); // not in real lessons: must do nothing
  assert.deepEqual(ctx.changes,['A1.2']);
  assert.match(ctx.chiffresHtml(),/Ta progression/);
  assert.match(ctx.chiffresHtml(),/6<span class="ac-v21-bilan-unite">%<\/span>/,'« 6% » sans espace');
  assert.match(ctx.chiffresHtml(),/"ac-v21-bilan-unite"> jours/,'« 0 jours » garde son espace');
  assert.match(ctx.accrocheHtml(false),/watfir-hero\.svg/);
});
test('Bottom sheet filters available levels, closes and restores focus',()=>{
  const {ctx,d,list,click}=setup();
  click('open');
  assert.equal(d.dialog.open,true);
  assert.match(list.innerHTML,/A2\.1/);
  assert.doesNotMatch(list.innerHTML,/B2\.1/);
  click('level','A2.1');
  assert.deepEqual(ctx.changes,['A2.1']);
  assert.equal(d.dialog.open,false);
  assert.ok(d.focusCount>0);
});
test('The 2.1 frontend loads Watfir files after its existing overlays',()=>{
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  assert.ok(html.indexOf('accueil-v21.js')<html.indexOf('accueil-watfir.js'));
  assert.ok(html.indexOf('accueil-v21.css')<html.indexOf('accueil-watfir.css'));
  assert.ok(fs.existsSync(path.join(root,'public/art/watfir-hero.svg')));
  assert.ok(fs.existsSync(path.join(root,'public/art/watfir-mark.svg')));
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  assert.match(css,/\.wf-accueil/);
  assert.match(css,/white-space:normal/);
});test('Hero V4 : texte puis dessin dans le flux, dimensions intrinsèques déclarées',()=>{
  const {ctx}=setup();
  const h=ctx.accrocheHtml(true);
  assert.ok(h.indexOf('ac-hero-texte')<h.indexOf('wf-hero-art'),'le dessin suit le texte');
  assert.match(h,/width="870" height="276"/);
  assert.match(h,/Une nouvelle langue commence ici\./);
  assert.match(ctx.accrocheHtml(false),/Prêt pour quelques minutes/);
});
test('Header V4 sur une ligne : marque, niveaux, séparateur, invité, réglages',()=>{
  const {ctx}=setup();
  const h=ctx.enteteAccueilHtml();
  const ordre=['ac-marque','puces-niveau','wf-entete-sep','ac-v21-guest','ac-menu'].map(c=>h.indexOf(c));
  assert.ok(ordre.every(i=>i>0),'tous les éléments sont présents');
  assert.deepEqual([...ordre].sort((a,b)=>a-b),ordre,'ordre de la maquette');
  assert.doesNotMatch(h,/ac-v21-controls/,'plus de deuxième ligne');
  ctx.ligneCompteHtml=()=> '';
  assert.doesNotMatch(ctx.enteteAccueilHtml(),/wf-entete-sep|ac-v21-guest/,'compte connecté : ni séparateur ni lien');
});
test('SVG : coordonnées de la maquette, église et pont à trois arches, sans soleil',()=>{
  const svg=fs.readFileSync(path.join(root,'public/art/watfir-hero.svg'),'utf8');
  assert.match(svg,/viewBox="38 322 870 276"/);
  assert.doesNotMatch(svg,/<circle/,'pas de soleil');
  assert.equal((svg.match(/A4[67](\.5)? 42\.5/g)||[]).length,3,'trois arches');
  assert.equal((svg.match(/stroke-width="21"/g)||[]).length,1,'bandes de 21 px maquette');
  assert.match(svg,/paint-order="stroke"/,'liseré noir autour de l’église');
  const mark=fs.readFileSync(path.join(root,'public/art/watfir-mark.svg'),'utf8');
  assert.match(mark,/viewBox="47 96 80 96"/);
});
test('CSS : une unité --k (maquette 941 px), polices auto-hébergées, aucune hauteur fixe de hero',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  assert.match(css,/--k:calc\(min\(100vw, 520px\) \/ 941\)/);
  for (const f of ['playfair-display-latin-800-italic','fraunces-latin-900-italic','roboto-condensed-latin-400-normal']) {
    assert.ok(fs.existsSync(path.join(root,'public/fonts/'+f+'.woff2')),f);
    assert.match(html,new RegExp('rel="preload" href="fonts/'+f+'\\.woff2"'));
  }
  for (const l of ['PLAYFAIR-DISPLAY','FRAUNCES','ROBOTO-CONDENSED']) assert.ok(fs.existsSync(path.join(root,'public/fonts/'+l+'-OFL.txt')));
  const hero=css.match(/\.wf-accueil \.ac-hero \{([^}]*)\}/)[1];
  assert.match(hero,/height:auto/);
  assert.match(css,/\.wf-hero-art \{[^}]*margin:calc\(-194 \* var\(--k\)\)/);
  assert.match(css,/\.puce-niv::after \{ content:""; position:absolute; inset:-11px/,'zone de toucher agrandie');
  assert.match(css,/\.ac-menu::after \{ content:""; position:absolute; inset:-12px/);
  assert.match(css,/flex-wrap:wrap/,'repli sur deux lignes si la police grandit');
  assert.doesNotMatch(css,/italic 700/,'pas de gras synthétique');
});
test('Hauteur : grille à six blocs et intervalles souples, page défilante en secours',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const bloc=css.match(/#view-dashboard \.accueil\.wf-accueil \{([^}]*)\}/)[1];
  assert.match(bloc,/display:grid/);
  assert.equal((bloc.match(/max-content/g)||[]).length,6,'six blocs jamais écrasés');
  assert.equal((bloc.match(/minmax\(/g)||[]).length,7,'six intervalles plafonnés (+ la colonne)');
  assert.match(bloc,/align-content:center/);
  assert.match(bloc,/min-height:100%/);
  assert.doesNotMatch(bloc,/overflow:hidden/);
  for (const [sel,row] of [['> .ac-ent',1],['> .ac-hero',3],['> .ac-chiffres',5],['> #today',7],['> .ac-acces',9],['> .ac-v21-journey',11]])
    assert.match(css,new RegExp(sel.replace(/[.#>]/g,m=>'\\'+m)+' \\{ grid-row:'+row+'; \\}'),sel);
});
