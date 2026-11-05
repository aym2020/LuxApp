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
  const d = {handler:null,pressHandler:null,timers:[],dialog:null,studyDialog:null,focusCount:0,studyFocus:0,reducedMotion:false};
  const trigger = {setAttribute(){},focus(){d.focusCount++}};
  const studyTrigger = {attributes:{},setAttribute(k,v){this.attributes[k]=v},focus(){d.studyFocus++}};
  const close = {focus(){},addEventListener(t,fn){this.listener=fn}};
  const list = {innerHTML:''};
  const body = {classList:{add(){},remove(){}}};
  const document={
    body,
    addEventListener(type,fn,capture){
      if(type==='click') {
        if(capture === true) d.pressHandler=fn;
        else d.handler=fn;
      }
    },
    querySelector(s){return s==='#view-dashboard .wf-niveau-ouvrir'?trigger:s==='#view-dashboard .wf-etudier-trigger'?studyTrigger:null},
    getElementById(id){return id==='wf-niveaux-dialog'?d.dialog:id==='wf-etudier-dialog'?d.studyDialog:null},
    createElement(tag){
      assert.equal(tag,'dialog');
      const dialog={
        open:false,innerHTML:'',listeners:{},attributes:{},
        set id(v){this._id=v;if(v==='wf-niveaux-dialog')d.dialog=this;else if(v==='wf-etudier-dialog')d.studyDialog=this},
        get id(){return this._id},
        setAttribute(k,v){this.attributes[k]=v},
        addEventListener(k,fn){this.listeners[k]=fn},
        querySelector(s){
          return s==='.wf-sheet-close'?close:
            s==='.wf-sheet-levels'?list:
            s==='[data-wf-etude="lecons"]'?{focus(){d.studyFocus++}}:null;
        },
        showModal(){this.open=true},
        close(){this.open=false;if(this.listeners.close)this.listeners.close()},
      };
      return dialog;
    },
  };
  document.body.appendChild=()=>{};
  const ctx={
    document,
    window:{
      matchMedia(){return {matches:d.reducedMotion}},
      setTimeout(fn,ms){d.timers.push({fn,ms});}
    },
    niveauActif:'A1.1', niveauxDisponibles:()=>levels,
    enteteAccueilHtml:()=>'',renderAccueil:()=>{},chiffresHtml:()=>'<div>Aujourd’hui</div><div>6<span class="ac-v21-bilan-unite"> %</span></div><span class="ac-v21-bilan-unite"> jours</span>',
    carteSuiteHtml:()=>'<button class="carte-suite"><span class="cs-ic"><svg></svg></span><span class="cs-txt">Commencer</span></button>',
    accesHtml:()=>'',
    accrocheHtml:()=>'', ligneCompteHtml:()=>'<div>invite</div>',
    etatSynchro:()=>null,libelleMenuSynchro:()=> 'Menu',pastilleSynchroHtml:()=> '',
    aDejaPratique:()=>false,
    escHtml:t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    ICONES:{reglages:'<svg></svg>',chevron:'<svg></svg>'},
    changerNiveauAccueil(n){ctx.niveauActif=n;ctx.changes.push(n)},changes:[],routes:[],
    goLessons(){ctx.routes.push('lecons')},
    openReviewSetup(){ctx.routes.push('entrainer')},
    openExamens(){ctx.routes.push('examens')},
    startSession(mode){ctx.routes.push(mode)}
  };
  vm.runInNewContext(watfir,ctx,{filename:'accueil-watfir.js'});
  function click(className,option){
    const element={getAttribute(k){return k==='data-wf-niveau'||k==='data-wf-etude'?option:null}};
    d.handler({target:{closest(selector){
      if(selector==='#view-dashboard .wf-etudier-trigger')return className==='study'?element:null;
      if(selector==='#wf-etudier-dialog [data-wf-etude]')return className==='route'?element:null;
      if(selector==='#view-dashboard .wf-niveau-ouvrir')return className==='open'?element:null;
      if(selector==='#view-dashboard .wf-niveau-btn, #wf-niveaux-dialog .wf-sheet-level')
        return className==='level'?element:null;
      return null;
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
  assert.match(ctx.accrocheHtml(false),/wf-hero-ecouter/);
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
  assert.ok(!fs.existsSync(path.join(root,'public/art/watfir-hero-v4.svg')),'hero V5 sans dessin du monument');
  assert.ok(fs.existsSync(path.join(root,'public/art/watfir-logo-v4.svg')));
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  assert.match(css,/\.wf-accueil/);
  assert.match(css,/white-space:normal/);
});test('Hero V5 : « Moien! », bouton Écouter (son LOD au clic) puis rubans, sans monument',()=>{
  const {ctx}=setup();
  const h=ctx.accrocheHtml(true);
  assert.doesNotMatch(h,/<img/,'plus de dessin du monument dans le hero');
  assert.ok(h.indexOf('Moien')<h.indexOf('wf-hero-ecouter'),'le bouton suit le mot');
  assert.ok(h.indexOf('wf-hero-ecouter')<h.indexOf('wf-hero-rubans'),'les rubans suivent la ligne du titre');
  assert.match(h,/onclick="jouerAudio\('moien\.mp3', this\)"/,'son LOD, jamais lu automatiquement');
  assert.match(h,/aria-label="Écouter « Moien! »"/);
  assert.match(h,/Une nouvelle langue commence ici\./);
  assert.match(ctx.accrocheHtml(false),/Prêt pour quelques minutes/);
  assert.ok(fs.existsSync(path.join(root,'public/audio/moien.mp3')));
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
  assert.match(ctx.enteteAccueilHtml(),/<div class="wf-entete-compte"><button type="button" class="ac-menu"/,'connecté : la roue seule dans le bloc compte');
});
test('Header : le bloc compte passe à la ligne d\'un seul tenant ; repli < 360 px',()=>{
  const {ctx}=setup();
  const h=ctx.enteteAccueilHtml();
  const compte=h.slice(h.indexOf('wf-entete-compte'));
  for (const c of ['wf-entete-sep','ac-v21-guest','ac-menu']) assert.ok(compte.includes(c),c+' dans le bloc compte');
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  assert.match(css,/\.wf-entete-compte \{[^}]*margin-left:auto/);
  assert.ok(css.includes('@media (max-width:359px)'),'repli dès que la ligne unique ne tient plus');
  const repli=css.slice(css.indexOf('@media (max-width:359px)'));
  assert.match(repli,/\.puces-niveau \{[^}]*order:2; flex-basis:100%; --ecart:16px/,'niveaux sur leur propre rangée, plus espacés');
  // Les zones des deux rangées ne se touchent pas : 24 px entre rangées, zones des niveaux à 12 px au-dessus.
  assert.match(repli,/\.ac-ent\.wf-entete \{ row-gap:24px; \}/);
  assert.match(repli,/\.puce-niv::after \{ top:-12px; transform:none; \}/);
  // Contour des pastilles par ::before : la zone de toucher se calcule depuis le bord extérieur.
  assert.match(css,/\.puce-niv \{[^}]*border:0;/);
  assert.match(css,/\.puce-niv::before \{[^}]*border:max\(1px, calc\(3\.5 \* var\(--k\)\)\) solid/);
  assert.match(css,/--cible-g:calc\(var\(--ecart\) \/ -2\); --cible-d:calc\(var\(--ecart\) \/ -2\)/,'moitié de l\'écart de chaque côté');
});
test('Mode invité lisible : 11 px minimum, sans point, ligne unique tenue dès 360 px',()=>{
  const {ctx}=setup();
  const h=ctx.enteteAccueilHtml();
  assert.match(h,/<span class="wf-invite-mode">Mode invité<\/span><b>Connexion<\/b>/,'deux mots empilés, sans « · »');
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  assert.match(css,/\.ac-v21-guest \{[^}]*font:400 max\(11px, calc\(24\.4 \* var\(--k\)\)\)/,'Mode invité ≥ 11 px');
  assert.match(css,/\.ac-v21-guest b \{[^}]*font:700 max\(11\.5px, calc\(28 \* var\(--k\)\)\)/,'Connexion ≥ 11,5 px');
  // 360–389 px : la roue se rapproche de ce que le texte a gagné, pour garder la ligne unique.
  const etroit=css.slice(css.indexOf('@media (max-width:389px)'));
  assert.match(etroit,/\.ac-menu \{ margin-left:calc\(21 \* var\(--k\)\); --cible-g:calc\(-16 \* var\(--k\)\); \}/);
  assert.match(css,/\.wf-entete-compte > \.ac-menu:first-child \{ --cible-g:calc\(-40 \* var\(--k\)\); \}/,'connecté : roue plus large');
});
test('Grande police : page défilante de secours et deux labels lisibles',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  assert.match(css,/#view-dashboard \.accueil\.wf-accueil \{[^}]*align-content:safe center/,'haut non coupé');
  assert.match(css,/\.ac-hero-surtitre \{[^}]*white-space:normal/,'surtitre retourne à la ligne');
  assert.match(css,/\.ac-v21-bilan #serie \{[^}]*min-height:calc\(76 \* var\(--k\)\);\s*flex-wrap:wrap/);
  assert.match(css,/\.ac-v21-bilan-legende \{[^}]*white-space:normal/);
  assert.match(css,/\.wf-activite > b \{[^}]*white-space:nowrap/,'libellés courts Étudier et Jouer');
  assert.match(css,/\.wf-choix-activite \.wf-activite \{[^}]*min-height:clamp\(76px/,'cibles tactiles');
});

test('Audit 04/11 : niveau actif lisible, textes ≥ 12 px, fond PC continu',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const hover=fs.readFileSync(path.join(root,'public/hover-interactions.css'),'utf8');
  // Crème sur #c81e1b = 4,75:1 (AA). Le rouge de marque #f22421 reste pour les ornements.
  assert.match(css,/--wf-red:#f22421; --wf-red-texte:#c81e1b;/);
  assert.match(css,/\.puce-niv\[aria-pressed="true"\] \{[^}]*background:var\(--wf-red-texte\)/);
  assert.match(css,/\.wf-sheet-level\.is-current \{ background:var\(--wf-red-texte\); \}/);
  assert.doesNotMatch(hover,/--ux-hover-red\)/,'le niveau actif ne s\'éclaircit plus au survol');
  assert.match(css,/var\(--wf-red\) 0 calc\(100% - 31\.8 \* var\(--k\)\)/,'bandes du CTA inchangées');
  // Charte § 3 : aucun texte utile de l'accueil sous 12 px (sauf logotype et compte du header).
  for (const [bloc, taille] of [['ac-hero-surtitre','800 max(12px, calc(24.5'],['ac-v21-bilan-titre','800 max(12px, calc(24.5'],
    ['ac-hero p','400 max(12px, calc(31'],['ac-v21-bilan-legende','400 max(12px, calc(30'],
    ['cs-etape','400 max(12px, calc(28.8'],['cs-titre','700 max(12px, calc(34'],['puce-niv','700 max(12px, calc(32']])
    assert.ok(css.slice(css.indexOf(bloc)).includes('font:'+taille),bloc+' ≥ 12 px');
  assert.match(css,/\.wf-activite > b \{[^}]*font:800 clamp\(19px,/,'Étudier / Jouer en grand texte WCAG');
  assert.match(css,/body:has\(#view-dashboard\.active\) \{ background:#080808; \}/,'pas de faux panneau sur PC');
});

test('Audit 04/11 : nom accessible de Connexion et aria-controls valide',()=>{
  const {ctx,d}=setup();
  assert.match(ctx.enteteAccueilHtml(),/aria-label="Connexion, mode invité"/,'le nom lu commence par le mot affiché');
  assert.doesNotMatch(ctx.accesHtml(),/aria-controls/,'pas de référence à une feuille encore absente');
  const trigger={attributes:{},setAttribute(k,v){this.attributes[k]=v},focus(){}};
  ctx.document.querySelector=s=>s==='#view-dashboard .wf-etudier-trigger'?trigger:null;
  d.handler({target:{closest:s=>s==='#view-dashboard .wf-etudier-trigger'?{}:null}});
  assert.equal(trigger.attributes['aria-controls'],'wf-etudier-dialog','relié à la feuille dès son ouverture');
  assert.match(ctx.accesHtml(),/aria-controls="wf-etudier-dialog"/,'rendu suivant : la feuille existe');
});

test('Watfir : Commencer sans doublon livre et deux activités centrées',()=>{
  const {ctx}=setup();
  const html=ctx.carteSuiteHtml({},true);
  assert.match(html,/Commencer/);
  assert.doesNotMatch(html,/class="cs-ic"/,'livre retiré uniquement de Watfir');
  const actions=ctx.accesHtml();
  assert.match(actions,/aria-label="Choisir une activité"/);
  assert.match(actions,/>Étudier<\/b>/);
  assert.match(actions,/>Jouer<\/b>/);
  assert.match(actions,/onclick="ouvrirJeux\(\)"/,'Jouer garde le moteur existant');
  assert.match(actions,/aria-haspopup="dialog"/,'Étudier ouvre un sous-menu accessible');
  assert.doesNotMatch(actions,/Voir mon chemin|boutonAcces\(|ac-v21-journey/,'plus de barre à quatre raccourcis');
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/width:min\(100%,calc\(860 \* var\(--k\)\)\)/);
  assert.match(css,/--wf-study:#d3232b/);
  assert.match(css,/--wf-play:#087496/);
  assert.match(css,/color:var\(--wf-cream\)/);
});

test('Sous-menu Étudier : révisions et examens conservés, Retour Android géré',()=>{
  assert.match(watfir,/lecons: \(\) => goLessons\(\)/);
  assert.match(watfir,/entrainer: \(\) => openReviewSetup\(\)/);
  assert.match(watfir,/examens: \(\) => openExamens\(\)/);
  assert.match(watfir,/erreurs: \(\) => startSession\('errors'\)/);
  assert.match(watfir,/function wfEtudierOuvert\(\)/);
  assert.match(watfir,/function wfFermerEtudier\(\)/);
  const nav=fs.readFileSync(path.join(root,'public/navigation.js'),'utf8');
  assert.match(nav,/function superpositionOuverte\(\) \{[\s\S]*wfEtudierOuvert\(\)/);
  assert.match(nav,/function fermerSuperposition\(\) \{[\s\S]*wfFermerEtudier\(\)/);
});
test('Interactions : retour d\'appui, feuille fermée par Retour, mouvement réduit',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  assert.match(css,/\.ac-v21-guest:active,\s*#view-dashboard \.wf-accueil \.ac-menu:active \{ opacity:\.6; transition-duration:0s; \}/);
  assert.match(css,/\.wf-sheet-level:active \{ transform:scale\(\.97\); \}/);
  const reduit=css.slice(css.lastIndexOf('@media (prefers-reduced-motion:reduce)'));
  assert.match(reduit,/\.wf-niveaux-dialog, \.wf-niveaux-dialog\[open\] \{ transform:none; transition:none; \}/);
  const nav=fs.readFileSync(path.join(root,'public/navigation.js'),'utf8');
  assert.match(nav,/function superpositionOuverte\(\) \{[\s\S]*?wfNiveauxOuverts\(\)[\s\S]*?\n\}/);
  assert.match(nav,/function fermerSuperposition\(\) \{[\s\S]*?wfFermerNiveaux\(\)[\s\S]*?\n\}/);
  // Ouverture puis Retour (navigation.js) : la feuille se ferme et rend le focus au chevron.
  const {ctx,d,click}=setup();
  let gardes=0; ctx.programmerGarde=()=>{gardes++};
  click('open');
  assert.equal(ctx.wfNiveauxOuverts(),true);
  assert.equal(ctx.wfFermerNiveaux(),true);
  assert.equal(d.dialog.open,false);
  assert.equal(ctx.wfFermerNiveaux(),false,'rien à fermer');
  assert.equal(gardes,2,'garde d\'historique posée à l\'ouverture, retirée à la fermeture');
});
test('Étudier : ouverture, destinations réelles et Retour Android sans perdre le focus',()=>{
  for(const [action,destination] of [['lecons','lecons'],['entrainer','entrainer'],['examens','examens'],['erreurs','errors']]){
    const {ctx,d,click}=setup();
    let guards=0;
    ctx.programmerGarde=()=>{guards++};
    click('study');
    assert.equal(d.studyDialog.open,true,'feuille ouverte');
    assert.equal(ctx.wfEtudierOuvert(),true);
    assert.ok(d.studyDialog.innerHTML.includes('data-wf-etude="'+action+'"'));
    assert.equal(d.studyFocus,1,'première option reçoit le focus');
    click('route',action);
    assert.equal(d.studyDialog.open,false,'feuille refermée avant navigation');
    assert.equal(ctx.wfEtudierOuvert(),false);
    assert.deepEqual(ctx.routes,[destination],'moteur de destination intact : '+action);
    assert.equal(guards,2,'garde à l’ouverture et à la fermeture');
    assert.equal(d.studyTrigger,undefined); // aucun état de dialogue persistant sur le mock
    assert.ok(d.studyFocus>=2,'focus restitué au bouton Étudier');
    click('study');
    assert.equal(ctx.wfFermerEtudier(),true,'Retour ferme le sheet');
    assert.equal(ctx.wfFermerEtudier(),false,'Retour ne ferme rien après la fermeture');
  }
});

test('Press animation : 6 boutons tiennent 160ms avant leur clic réel, mobile et PC',()=>{
  for (const type of ['commencer','etudier','jouer','A1.1','A1.2','selecteur']) {
    const {d}=setup();
    const classes=new Set();
    let clicks=0,prevented=0,stopped=0;
    const button={
      disabled:false,isConnected:true,
      classList:{add(c){classes.add(c)},remove(c){classes.delete(c)}},
      getAttribute(){return null},
      click(){clicks++}
    };
    const event={
      isTrusted:true,
      target:{closest(selector){
        const expected=type==='commencer'?'carte-suite.ac-v21-cta':
          ['A1.1','A1.2','selecteur'].includes(type)?'.puces-niveau .puce-niv':
          '.wf-choix-activite .wf-activite';
        return selector.includes(expected)?button:null;
      }},
      preventDefault(){prevented++},
      stopPropagation(){stopped++}
    };
    assert.equal(typeof d.pressHandler,'function','handler capture installé');
    d.pressHandler(event);
    assert.equal(prevented,1,'navigation originale suspendue');
    assert.equal(stopped,1,'onclick natif différé');
    assert.ok(classes.has('wf-pressing'),'le bouton reste physiquement enfoncé');
    assert.equal(clicks,0,'aucune navigation pendant le press');
    assert.equal(d.timers.length,1);
    assert.equal(d.timers[0].ms,160,'durée courte et identique sur les trois actions');
    d.pressHandler(event);
    assert.equal(d.timers.length,1,'double tap ignoré');
    d.timers[0].fn();
    assert.equal(clicks,1,'un seul clic natif rejoué après la pression');
    assert.ok(!classes.has('wf-pressing'),'état nettoyé');
    const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
    assert.match(css,/\.carte-suite\.ac-v21-cta\.wf-pressing \{/);
    assert.match(css,/\.wf-activite\.wf-pressing \{/);
    assert.match(css,/\.puce-niv\.wf-pressing \{/,'pastilles incluses dans le relief 3D');
  }
});

test('Header : le clic après enfoncement sélectionne A1.2 ou ouvre les niveaux',()=>{
  for(const type of ['A1.1','A1.2','selecteur']){
    const {ctx,d,click}=setup();
    const classes=new Set();
    let replayCount=0;
    const button={
      disabled:false,isConnected:true,
      classList:{add(c){classes.add(c)},remove(c){classes.delete(c)}},
      getAttribute(){return null},
      click(){
        replayCount++;
        if(type==='selecteur')click('open');
        else click('level',type);
      }
    };
    const event={isTrusted:true,target:{closest(selector){
      return selector.includes('.puces-niveau .puce-niv')?button:null;
    }},preventDefault(){},stopPropagation(){}};
    d.pressHandler(event);
    assert.equal(ctx.changes.length,0,'aucun changement de niveau avant feedback');
    assert.equal(d.dialog,null,'pas de feuille avant feedback');
    assert.equal(d.timers[0].ms,160);
    assert.ok(classes.has('wf-pressing'));
    d.timers[0].fn();
    assert.equal(replayCount,1,'clic d’origine rejoué une seule fois');
    assert.ok(!classes.has('wf-pressing'));
    if(type==='selecteur')assert.equal(d.dialog.open,true,'choix de niveaux ouvert après feedback');
    else if(type==='A1.2')assert.deepEqual(ctx.changes,['A1.2'],'niveau modifié après feedback');
    else assert.deepEqual(ctx.changes,[],'niveau actif inchangé après feedback');
  }
});

test('Press : reduced-motion, clic programmatique et bouton désactivé non différés',()=>{
  const {d}=setup();
  const classes=new Set();
  const button={
    disabled:false,isConnected:true,
    classList:{add(c){classes.add(c)},remove(c){classes.delete(c)}},
    getAttribute(){return null},click(){throw Error('aucun replay attendu')}
  };
  let blocked=0;
  const event={isTrusted:true,target:{closest(){return button}},
    preventDefault(){blocked++},stopPropagation(){}};
  d.reducedMotion=true;d.pressHandler(event);
  assert.equal(blocked,0);
  d.reducedMotion=false;event.isTrusted=false;d.pressHandler(event);
  assert.equal(blocked,0,'replay synthétique non intercepté');
  event.isTrusted=true;button.disabled=true;d.pressHandler(event);
  assert.equal(blocked,0,'disabled non intercepté');
  assert.equal(d.timers.length,0);
  assert.equal(classes.size,0);
});

test('SVG V4 fournis : utilisés tels quels, transparents, palette inchangée',()=>{
  const hero=fs.readFileSync(path.join(root,'docs/watfir-2.2/assets/watfir-hero-v4.svg'),'utf8'); // archivé (hero V5 sans dessin)
  const logo=fs.readFileSync(path.join(root,'public/art/watfir-logo-v4.svg'),'utf8');
  assert.match(hero,/viewBox="0 0 864 265"/);
  assert.match(logo,/viewBox="0 0 80 100"/);
  for (const svg of [hero,logo]) {
    assert.doesNotMatch(svg,/<rect[^>]*width="100%"|<circle/,'fond transparent, pas de soleil');
    const couleurs=new Set((svg.match(/#[0-9A-Fa-f]{6}/g)||[]).map(c=>c.toUpperCase()));
    // Palette Watfir : cyan, rouge, crème et le noir du fond (contours du hero corrigé).
    for (const c of couleurs) assert.ok(['#02C5E7','#F22421','#F7E9C2','#080808'].includes(c),c);
  }
  const {ctx}=setup();
  assert.match(ctx.enteteAccueilHtml(),/src="art\/watfir-logo-v4\.svg\?v=\d+"[^>]*width="80" height="100"/);
  assert.ok(!fs.existsSync(path.join(root,'public/art/watfir-hero.svg')),'ancien hero retiré');
  // Pas d'étirement : le rapport largeur/hauteur CSS respecte le viewBox.
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const art=css.match(/\.wf-hero-rubans \{[^}]*width:calc\((\d+(?:\.\d+)?) \* var\(--k\)\)[^}]*height:calc\((\d+(?:\.\d+)?) \* var\(--k\)\)/);
  assert.ok(Math.abs(art[1]/art[2]-941/98)<0.01,'rubans non étirés');
  const lg=css.match(/\.ac-marque-symbole \{ width:calc\((\d+(?:\.\d+)?) \* var\(--k\)\); height:calc\((\d+(?:\.\d+)?) \* var\(--k\)\)/);
  assert.ok(Math.abs(lg[1]/lg[2]-80/100)<0.01,'logo non étiré');
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
  assert.match(css,/\.wf-hero-rubans \{[^}]*margin:calc\(18 \* var\(--k\)\) calc\(-40 \* var\(--k\)\) 0/,'rubans jusqu\'aux bords de l\'écran');
  assert.match(css,/::after \{\s*content:""; position:absolute; top:50%; height:48px;/,'zones de toucher de 48 px');
  assert.match(css,/\.ac-piste i \{[^}]*min-width:0/,'0 % = aucun remplissage');
  assert.match(css,/flex-wrap:wrap/,'repli sur deux lignes si la police grandit');
  assert.doesNotMatch(css,/italic 700/,'pas de gras synthétique');
});
test('Hauteur : cinq blocs et intervalles souples, page défilante en secours',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const bloc=css.match(/#view-dashboard \.accueil\.wf-accueil \{([^}]*)\}/)[1];
  assert.match(bloc,/display:grid/);
  assert.equal((bloc.match(/max-content/g)||[]).length,5,'cinq blocs jamais écrasés');
  assert.equal((bloc.match(/minmax\(/g)||[]).length,6,'cinq intervalles plafonnés (+ la colonne)');
  assert.match(bloc,/align-content:safe center/);
  assert.match(bloc,/min-height:100%/);
  assert.doesNotMatch(bloc,/overflow:hidden/);
  for (const [sel,row] of [['> .ac-ent',1],['> .ac-hero',3],['> .ac-chiffres',5],['> #today',7],['.ac-v21-actions > .ac-acces',9]])
    assert.match(css,new RegExp(sel.replace(/[.#>]/g,m=>'\\'+m)+' \\{ grid-row:'+row+'; \\}'),sel);
});
