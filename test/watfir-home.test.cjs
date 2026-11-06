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

function setup(levels=['A1.1','A1.2','A2.1','A2.2','B1.1'], extra={}) {
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
  Object.assign(ctx,extra); // fonctions 2.1 remplacées par un test avant le chargement
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
test('Contrat 2.2 : hero Moien, audio à la demande et cache CSS/JS',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const js=fs.readFileSync(path.join(root,'public/accueil-watfir.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  assert.ok(css.includes('.wf-salut {')&&css.includes('.wf-hero-ecouter {'));
  assert.ok(!css.includes('.wf-mission-titre')&&!js.includes('wf-mission-titre'),'hero « Mission A1.1 » retiré');
  assert.ok(js.includes("jouerAudio(\\'moien.mp3\\', this)"),'Moien écouté seulement sur appui');
  assert.ok(!/autoplay|\.play\(\)/.test(js),'jamais de lecture automatique');
  for(const cache of ['accueil-watfir.js?v=watfir-v4-14','accueil-watfir.css?v=watfir-v4-31','hover-interactions.css?v=watfir-hover-11'])
    assert.ok(html.includes(cache),'cache : '+cache);
});

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
  assert.ok(ctx.chiffresHtml().includes('Ton objectif actuel'));
  assert.match(ctx.chiffresHtml(),/6<span class="ac-v21-bilan-unite">%<\/span>/,'« 6% » sans espace');
  assert.match(ctx.chiffresHtml(),/"ac-v21-bilan-unite"> jours/,'« 0 jours » garde son espace');
  // Le niveau sélectionné reste affiché par la pastille du header, plus dans le hero.
  assert.ok(!ctx.accrocheHtml(false).includes('A1.2'));
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
});test('Hero Moien : prénom facultatif échappé, audio sur appui, rubans en plongée',()=>{
  const {ctx}=setup();
  // Sans prénom : « Moien! »
  let hero=ctx.accrocheHtml();
  assert.match(hero,/<h2 class="wf-salut"><span><span lang="lb">Moien<\/span><span class="wf-salut-ex">!<\/span><\/span><\/h2>/);
  assert.match(hero,/Ton premier mot\. Le reste commence ici\./,'premier accueil');
  assert.match(ctx.accrocheHtml(false),/Prêt pour ta mission \?/,'utilisateur actif');
  assert.match(hero,/class="wf-hero-ecouter" onclick="jouerAudio\('moien\.mp3', this\)" aria-label="Écouter « Moien »"/);
  assert.ok(hero.indexOf('wf-salut')<hero.indexOf('wf-hero-rubans'),'rubans après le salut');
  assert.ok(hero.includes('#F22421')&&hero.includes('#02C5E7'),'rubans de marque');
  assert.match(hero,/viewBox="0 0 941 190"/);
  assert.equal((hero.match(/M-20 20C150 20 230 131 420 131S690 125 800 59S900 2 961 8/g)||[]).length,3,'rouge, filet noir et cyan suivent la même plongée');
  // Avec prénom (rangé dans le choix synchronisé).
  const choix={prenom:{valeur:'Clayton',maj:1}};
  ctx.getChoix=()=>choix;
  hero=ctx.accrocheHtml();
  assert.match(hero,/<span lang="lb">Moien,<\/span><span>Clayton<span class="wf-salut-ex">!<\/span><\/span>/);
  assert.match(hero,/Bonjour, Clayton\./);
  choix.prenom.valeur='Jean-Christophe';
  assert.match(ctx.accrocheHtml(),/class="wf-salut wf-salut-xs"/,'prénom long : titre réduit');
  choix.prenom.valeur='<img src=x>';
  assert.ok(!ctx.accrocheHtml().includes('<img'),'pas d’injection HTML');
  assert.ok(ctx.accrocheHtml().includes('&lt;img src=x&gt;'));
  choix.prenom.valeur='Abcdefghijklmnopqrstuvwxyz';
  assert.ok(ctx.accrocheHtml().includes('Abcdefghijklmnopqrst<'),'prénom limité à 20 caractères');
  assert.ok(ctx.chiffresHtml().includes('Ton objectif actuel'),'réutilise les vrais KPI de 2.1');
});

test('Commencer : mission, titre luxembourgeois et étape réelle, action 2.1 inchangée',()=>{
  const base='<section id="today"><button class="carte-suite ac-v21-cta" aria-label="ancien" onclick="commencer()">'+
    '<span class="cs-txt"><span class="cs-kicker">Commencer</span><span class="cs-titre">Leçon 0 · Les bases</span>'+
    '<small class="cs-etape" title="x">Unité 1 · Prononciation</small></span><span class="cs-rond"></span></button></section>';
  const {ctx:c2}=setup(undefined,{carteSuiteHtml:()=>base});
  Object.assign(c2,{numLecon:()=>0,titreCourt:()=>'Les bases',detailPasCourt:()=>'Unité 1 · Prononciation',detailPas:()=>'Unité 1 · Prononciation'});
  const pas={type:'unite',lecon:{titre:'Déi éischt Schrëtt',mission:{titre:'Le studio radio'}}};
  const html=c2.carteSuiteHtml(pas,true);
  assert.match(html,/<span class="cs-titre">Mission · Le studio radio<\/span>/);
  assert.match(html,/<i class="wf-cta-lux" lang="lb">Déi éischt Schrëtt<\/i> · Unité 1 · Prononciation<\/small>/);
  assert.match(html,/aria-label="Commencer · Mission · Le studio radio · Leçon 0 · Les bases · Unité 1 · Prononciation"/);
  assert.match(html,/onclick="commencer\(\)"/,'action 2.1 conservée');
  const sansMission=c2.carteSuiteHtml({type:'unite',lecon:{titre:'X'}},false);
  assert.match(sansMission,/<span class="cs-titre">Leçon 0 · Les bases<\/span>/,'repli sans mission');
  assert.equal(c2.carteSuiteHtml(null,false),base,'niveau terminé : carte 2.1 inchangée');
});

test('Header V6 : groupes conservés, routes et navigation accessibles',()=>{
  const {ctx}=setup();
  const h=ctx.enteteAccueilHtml();
  const ordre=['ac-marque','puces-niveau','wf-entete-sep','ac-v21-guest','ac-menu'].map(c=>h.indexOf(c));
  assert.ok(ordre.every(i=>i>0),'tous les éléments sont présents');
  assert.deepEqual([...ordre].sort((a,b)=>a-b),ordre,'ordre de la maquette');
  assert.doesNotMatch(h,/ac-v21-controls/,'wrapper historique absent');
  ctx.ligneCompteHtml=()=> '';
  assert.doesNotMatch(ctx.enteteAccueilHtml(),/wf-entete-sep|ac-v21-guest/,'compte connecté : ni séparateur ni lien');
  assert.match(ctx.enteteAccueilHtml(),/<div class="wf-entete-compte"><button type="button" class="ac-menu"/,'connecté : la roue seule dans le bloc compte');
});
test('Samsung : une seule ligne réellement aérée, espace flexible après les niveaux',()=>{
  const {ctx}=setup();
  const header=ctx.enteteAccueilHtml();
  const account=header.slice(header.indexOf('wf-entete-compte'));
  for(const c of ['wf-entete-sep','ac-v21-guest','ac-menu'])
    assert.ok(account.includes(c),'bloc compte et actions inchangés : '+c);
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const mobile=css.slice(css.indexOf('@media (max-width:540px)'),css.indexOf('@media (max-width:359px)'));
  assert.ok(mobile.includes('display:grid'),'header mobile déterministe');
  assert.ok(mobile.includes('grid-template-areas:"marque niveaux compte"'));
  assert.ok(mobile.includes('grid-template-columns:max-content max-content minmax(0,1fr)'),
    'le vide disponible est ENTRE les niveaux et le compte, pas avant A1.1');
  assert.ok(mobile.includes('column-gap:clamp(10px,calc(30 * var(--k)),16px)'),
    'espacement minimum régulier entre les trois groupes');
  assert.ok(mobile.includes('.ac-marque-sous { display:none; }'),
    'sous-titre redondant masqué uniquement sur le header mobile');
  assert.ok(mobile.includes('--ecart:clamp(7px,calc(18 * var(--k)),10px)'),
    'pastilles suffisamment espacées');
  assert.ok(mobile.includes('gap:clamp(10px,calc(25 * var(--k)),14px)'),
    'respiration entre Connexion et la roue');
  assert.ok(mobile.includes('--cible-d:-20px'),
    'chevron avec une cible tactile élargie dans l’espace libre');
  assert.ok(mobile.includes('grid-area:marque')&&mobile.includes('grid-area:niveaux')&&mobile.includes('grid-area:compte'));
  assert.ok(mobile.includes('row-gap:0'),'aucun second rang en mobile courant');
  assert.ok(css.includes('height:48px; transform:translateY(-50%)'),
    'zones tactiles du header conservées');
  assert.ok(mobile.includes('align-content:safe start'), 'header mobile ancré en haut');
  assert.ok(mobile.includes('padding-top:clamp(18px,calc(52 * var(--k)),26px)'),
    'marge supérieure mobile stable entre 18 et 26 px');
  assert.ok(mobile.includes('--wf-section-min:clamp(28px,4svh,36px)'),
    'plancher commun pour écrans courts et zoom Android');
  assert.ok(!mobile.includes('minmax(24px,1fr)'),
    'interdit : renvoyer toute la hauteur restante sous Étudier/Jouer');
  assert.ok(!mobile.includes('align-content:safe center'),
    'le centrage vertical global ne doit plus redescendre le header sur Samsung');
  const compact=css.slice(css.indexOf('@media (max-width:359px)'),css.indexOf('@media (max-width:260px)'));
  assert.ok(compact.includes('puce-niv:not([aria-pressed="true"]):not(.wf-niveau-ouvrir)'),
    'petit écran : seule l’option non active est masquée');
  assert.ok(!compact.includes('grid-template-areas:"marque compte" "niveaux niveaux"'),
    'pas de deuxième rangée flottante sur petits Android');
  const zoom=css.slice(css.indexOf('@media (max-width:260px)'));
  assert.ok(zoom.includes('grid-template-areas:"marque" "compte" "niveaux"'),
    'zoom extrême : alternative accessible sans compression');
  ctx.ligneCompteHtml=()=> '';
  const connected=ctx.enteteAccueilHtml();
  assert.ok(connected.includes('ac-menu')&&!connected.includes('ac-v21-guest'),
    'connecté : le menu reste accessible sans faux lien de connexion');
});
test('Header : compte invité lisible, lien et focus préservés',()=>{
  const {ctx}=setup();
  const header=ctx.enteteAccueilHtml();
  assert.match(header,/<span class="wf-invite-mode">Mode invité<\/span><b>Connexion<\/b>/);
  assert.match(header,/aria-label="Connexion, mode invité"/);
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  assert.match(css,/\.ac-v21-guest \{[^}]*font:400 max\(11px, calc\(24\.4 \* var\(--k\)\)\)/);
  assert.match(css,/\.ac-v21-guest b \{[^}]*font:700 max\(11\.5px, calc\(28 \* var\(--k\)\)\)/);
  assert.match(css,/\.wf-entete-compte > \.ac-menu:first-child \{ --cible-g:calc\(-40 \* var\(--k\)\); \}/);
});
test('Mobile §31 : hero, objectif puis Commencer + Étudier/Jouer groupés en bas',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const mobile=css.slice(css.indexOf('@media (max-width:540px)'),css.indexOf('@media (max-width:359px)'));
  assert.ok(mobile.includes('align-content:safe start'), 'header ancré en haut');
  assert.ok(mobile.includes('padding-top:clamp(18px,calc(52 * var(--k)),26px)'));
  assert.ok(mobile.includes('--wf-section-min:clamp(28px,4svh,36px)'));
  const grilles=[...mobile.matchAll(/grid-template-rows:([^;]*);/g)].map(m=>m[1].replace(/\/\*[^*]*\*\//g,'').replace(/\s+/g,' ').trim());
  assert.equal(grilles.length,2,'grille normale + premier accueil');
  assert.equal(grilles[0],'max-content minmax(var(--wf-section-min),.8fr) max-content minmax(var(--wf-section-min),1fr) max-content minmax(var(--wf-section-min),1fr) max-content 20px max-content clamp(28px,5svh,48px)');
  assert.equal(grilles[1],'max-content minmax(var(--wf-section-min),.8fr) max-content 0 0 minmax(var(--wf-section-min),1fr) max-content 20px max-content clamp(28px,5svh,48px)');
  assert.ok(mobile.includes('.accueil.wf-accueil.wf-sans-bilan {'),'premier accueil sans objectif');
  assert.ok(!mobile.includes('minmax(24px,1fr)'),'aucun grand vide sous Étudier/Jouer');
  const js=fs.readFileSync(path.join(root,'public/accueil-watfir.js'),'utf8');
  assert.ok(js.includes("box.classList.toggle('wf-sans-bilan', !bilan)"),'classe posée selon la présence de l’objectif');
  assert.ok(!js.includes("insertAdjacentHTML('afterend', chiffresHtml())"),'plus de « 0% · 0 jours » imposé au premier accueil');
  assert.ok(css.includes('grid-template-areas:"marque niveaux compte"'));
  assert.ok(css.includes('border-radius:17px;')&&css.includes('border-radius:14px;'),'design 3D préservé');
});

test('Grande police : page défilante de secours et deux labels lisibles',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  assert.match(css,/#view-dashboard \.accueil\.wf-accueil \{[^}]*align-content:safe center/,'haut non coupé');
  assert.match(css,/\.wf-salut \{[^}]*overflow-wrap:anywhere/,'un prénom très long passe à la ligne');
  assert.match(css,/\.ac-v21-bilan #serie \{[^}]*min-height:calc\(76 \* var\(--k\)\);\s*flex-wrap:wrap/);
  assert.match(css,/\.ac-v21-bilan-legende \{[^}]*white-space:normal/);
  assert.match(css,/\.wf-activite > b \{[^}]*white-space:nowrap/,'libellés courts Étudier et Jouer');
  assert.match(css,/\.wf-choix-activite \.wf-activite \{[^}]*min-height:58px/,'cibles tactiles ≥ 48 px');
});

test('Audit 04/11 : niveau actif lisible, textes ≥ 12 px, fond PC continu',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const hover=fs.readFileSync(path.join(root,'public/hover-interactions.css'),'utf8');
  // Crème sur #c81e1b = 4,75:1 (AA). Le rouge de marque #f22421 reste pour les ornements.
  assert.match(css,/--wf-red:#f22421; --wf-red-texte:#c81e1b;/);
  // 06/11/2026 : niveau actif au rouge vif (un seul rouge à l'écran, choix de Clayton).
  assert.match(css,/\.puce-niv\[aria-pressed="true"\] \{[^}]*background:var\(--wf-red\)/);
  assert.match(css,/\.wf-sheet-level\.is-current \{ background:var\(--wf-red-texte\); \}/);
  assert.doesNotMatch(hover,/--ux-hover-red\)/,'le niveau actif ne s\'éclaircit plus au survol');
  assert.match(css,/background:var\(--wf-cta-cream\)/,'CTA crème uni');
  assert.doesNotMatch(css,/var\(--wf-red\) 0 calc\(100% - 31\.8 \* var\(--k\)\)/,'plus de bande sur le bouton');
  assert.match(css,/\.wf-hero-rubans/,'rubans du hero préservés');
  // Charte § 3 : aucun texte utile de l'accueil sous 12 px (sauf logotype et compte du header).
  for (const [bloc, taille] of [['wf-hero-trad b','700 max(15px, calc(38'],['wf-hero-trad small','400 max(13px, calc(31'],
    ['ac-v21-bilan-titre','800 max(12px, calc(24.5'],['ac-v21-bilan-legende','400 max(12px, calc(30'],
    ['cs-etape','400 max(12px, calc(28.8'],['cs-titre','700 max(13px, calc(38'],['puce-niv','700 max(12px, calc(32']])
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
  assert.match(css,/--wf-study:#f22421/);
  assert.match(css,/--wf-play:#02c5e7/);
  assert.match(css,/\.wf-activite-jouer > b \{ color:var\(--wf-bg\); \}/,'texte noir sur cyan');
  assert.match(css,/color:var\(--wf-cream\)/);
});

test('Watfir 2.2 : rayons harmonisés sans modifier la géométrie des commandes',()=>{
  const home=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const portal=fs.readFileSync(path.join(root,'public/portail-watfir.css'),'utf8');
  const cta=home.match(/#view-dashboard \.wf-accueil \.carte-suite\.ac-v21-cta \{([^}]+)\}/);
  const activities=home.match(/#view-dashboard \.wf-accueil \.wf-choix-activite \.wf-activite \{([^}]+)\}/);
  assert.ok(cta&&activities,'sélecteurs actuels présents');
  assert.match(cta[1],/border-radius:17px;/,'Commencer accueil = grands CTA portail');
  assert.match(activities[1],/border-radius:14px;/,'Étudier et Jouer = actions secondaires');
  assert.match(activities[1],/min-height:58px/,'boutons plus bas que Commencer, cible > 48 px');
  assert.match(cta[1],/0 7px 0 #aa8954/,'relief CTA inchangé');
  assert.match(activities[1],/0 5px 0 var\(--wf-side\)/,'relief activités inchangé');
  for(const selector of ['\\.pa-bouton\\.or\\.wf-portail-demarrer','\\.pa-bouton\\.sombre\\.wf-portail-creer']) {
    const rule=portal.match(new RegExp(selector+' \\{([^}]+)\\}'));
    assert.ok(rule,'bouton portail existant');
    assert.match(rule[1],/border-radius:17px;/,'grand CTA portail = 17px');
  }
  assert.match(home,/\.puce-niv \{[^}]*border-radius:calc\(18 \* var\(--k\)\)/,
    'pastilles niveaux compactes conservées');
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
  assert.ok(Math.abs(art[1]/art[2]-941/190)<0.01,'rubans non étirés');
  const lg=css.match(/\.ac-marque-symbole \{ width:calc\((\d+(?:\.\d+)?) \* var\(--k\)\); height:calc\((\d+(?:\.\d+)?) \* var\(--k\)\)/);
  assert.ok(Math.abs(lg[1]/lg[2]-80/100)<0.01,'logo non étiré');
});
test('CSS : unité --k, deux polices et hero sans hauteur fixe',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  // PC : même largeur que les autres pages (--layout-shell = 640 px).
  assert.match(css,/--k:calc\(min\(100vw, var\(--layout-shell, 640px\)\) \/ 941\)/);
  const f='fraunces-latin-900-italic';
  assert.ok(fs.existsSync(path.join(root,'public/fonts/'+f+'.woff2')),f);
  assert.ok(html.includes('rel="preload" href="fonts/'+f+'.woff2"'));
  assert.ok(fs.existsSync(path.join(root,'public/fonts/FRAUNCES-OFL.txt')));
  assert.ok(!html.includes('rel="preload" href="fonts/playfair-display'),'plus de preload Playfair');
  assert.ok(!html.includes('rel="preload" href="fonts/roboto-condensed'),'plus de preload Roboto Condensed');
  assert.ok(!css.includes('Watfir Titre')&&!css.includes('Watfir Etroite'),'un seul style de marque Fraunces');
  assert.match(css,/\.wf-salut \{[^}]*font:italic 900 clamp\(48px, calc\(150 \* var\(--k\)\), 72px\)\/\.98 'Watfir Logo'/,'Moien en Fraunces');
  assert.ok(css.includes('font:400 max(9px, calc(24 * var(--k)))/1.05 var(--wf-sans)'),
    'sous-titre Lëtzebuergesch en Inter');
  const hero=css.match(/\.wf-accueil \.ac-hero \{([^}]*)\}/)[1];
  assert.match(hero,/height:auto/);
  assert.match(css,/\.wf-hero-rubans \{[^}]*margin:calc\(34 \* var\(--k\)\) calc\(-40 \* var\(--k\)\) 0/,'rubans jusqu\'aux bords de l\'écran');
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

test('PC : header sur une ligne et quatre espaces verticaux identiques',()=>{
  const css=fs.readFileSync(path.join(root,'public/accueil-watfir.css'),'utf8');
  const debut=css.indexOf('@media (min-width:541px)');
  assert.ok(debut>0,'règles PC/tablette présentes');
  const pc=css.slice(debut,css.indexOf('\n}\n',debut));
  assert.ok(pc.includes('grid-template-areas:"marque niveaux compte"'),'header PC : une seule ligne en grille');
  assert.ok(pc.includes('row-gap:0'),'aucun passage du compte à la ligne');
  assert.ok(pc.includes('.wf-entete-sep { display:none; }'),'filet retiré comme sur mobile');
  assert.ok(!pc.includes('ac-marque-sous { display:none; }'),'« Lëtzebuergesch » reste visible sur PC');
  const grilles=[...pc.matchAll(/grid-template-rows:([^;]*);/g)].map(m=>m[1].replace(/\/\*[^*]*\*\//g,'').replace(/\s+/g,' ').trim());
  assert.equal(grilles[0],'max-content minmax(28px,72px) max-content minmax(28px,72px) max-content minmax(28px,72px) max-content 20px max-content minmax(24px,1fr)','espaces égaux, Commencer + Étudier/Jouer groupés');
  assert.equal(grilles[1],'max-content minmax(28px,72px) max-content 0 0 minmax(28px,72px) max-content 20px max-content minmax(24px,1fr)','premier accueil sans objectif');
  assert.ok(pc.includes('align-content:safe start'),'header ancré en haut sur PC');
});
