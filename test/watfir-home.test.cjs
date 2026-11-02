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
    enteteAccueilHtml:()=>'',renderAccueil:()=>{},chiffresHtml:()=>'<div>Aujourd’hui</div>',
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
  assert.match(h,/width="400" height="160"/);
  assert.match(h,/Une nouvelle langue commence ici\./);
  assert.match(ctx.accrocheHtml(false),/Prêt pour quelques minutes/);
});
test('SVG du monument : viewBox 400×160, sans soleil ni façade, tout dans le cadre',()=>{
  const svg=fs.readFileSync(path.join(root,'public/art/watfir-hero.svg'),'utf8');
  assert.match(svg,/viewBox="0 0 400 160"/);
  assert.doesNotMatch(svg,/<circle|<rect/,'ni soleil ni fenêtres');
  assert.equal((svg.match(/A22 20/g)||[]).length,3,'trois arches');
  const nombres=[...svg.matchAll(/\sd="([^"]+)"/g)].flatMap(m=>m[1].match(/-?\d+(\.\d+)?/g).map(Number));
  assert.ok(nombres.every(n=>n>=0&&n<=400),'aucune coordonnée hors du cadre');
  const traits=[...svg.matchAll(/stroke-width="(\d+)"/g)].map(m=>Number(m[1]));
  assert.deepEqual(traits,[7],'bandes fines (7 u sur 400)');
});
test('CSS : hero sans hauteur fixe, police display auto-hébergée, compactage par paliers',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  assert.ok(fs.existsSync(path.join(root,'public/fonts/dm-serif-display-latin-400-italic.woff2')));
  assert.ok(fs.existsSync(path.join(root,'public/fonts/DM-SERIF-DISPLAY-OFL.txt')));
  assert.match(css,/@font-face\s*\{[^}]*Watfir Display[^}]*font-style:italic/);
  assert.match(html,/rel="preload" href="fonts\/dm-serif-display-latin-400-italic\.woff2"/);
  const hero=css.match(/\.wf-accueil \.ac-hero \{([^}]*)\}/)[1];
  assert.match(hero,/height:auto/);
  assert.doesNotMatch(hero,/height:clamp|min-height:2\d\dpx/);
  assert.match(css,/\.wf-hero-art \{[^}]*margin-top:clamp\(-120px,-25%,0px\)/);
  assert.match(css,/max-height:660px/);
  assert.doesNotMatch(css,/italic 700/,'pas de gras synthétique');
  assert.match(css,/\.carte-suite\.ac-v21-cta \{[^}]*min-height:0/,'neutralise le min-height 2.1');
});
