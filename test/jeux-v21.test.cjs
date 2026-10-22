'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const script=read('public/jeux-v21.js'),accueil=read('public/accueil-v21.js'),css=read('public/accueil-v21.css'),html=read('public/index.html'),nav=read('public/navigation.js');
const card=(fr,lu)=>({fr,lu}),lesson=(id,flashcards)=>({id,flashcards});
function make(){
 const store=new Map(),nodes=new Map(),timeouts=[];let tick=1000;
 const element=id=>{
  if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',style:{},disabled:false,
   className:id==='survie-combo'?'survie-combo':id==='survie-chrono'?'survie-hud-time':'',
   classList:{contains:cl=>id==='view-survie'&&cl==='active'},setAttribute(){},focus(){},blur(){}});
  return nodes.get(id);
 };
 const ctx={console,lecons:[],getProgress:()=>({}),getLeconVue:()=>false,
  storageKey:x=>'profilA:'+x,
  localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},
  document:{visibilityState:'visible',getElementById:element,querySelector:()=>({disabled:false,textContent:'',setAttribute(){}}),querySelectorAll:()=>[]},
  showView:id=>{ctx.lastView=id},retour:()=>{ctx.lastView='retour'},goLessons:()=>{},
  performance:{now:()=>tick},setInterval:()=>1,clearInterval:()=>{},setTimeout:(fn,ms=0)=>timeouts.push({fn,at:tick+ms})};
 vm.createContext(ctx);vm.runInContext(script,ctx);
 function runThrough(limit){
  while(true){
    timeouts.sort((a,b)=>a.at-b.at);
    const job=timeouts[0];
    if(!job||job.at>limit)break;
    timeouts.shift();tick=job.at;job.fn();
  }
  tick=limit;
 }
 return {ctx,store,element,
   advance:ms=>runThrough(tick+ms),
   flush:()=>{while(timeouts.length){timeouts.sort((a,b)=>a.at-b.at);runThrough(timeouts[0].at)}}
 };
}
test('Accueil : quatre raccourcis, même rangée et même hauteur',()=>{
 assert.match(accueil,/boutonAcces\('jeux',/);
 assert.match(accueil,/ouvrirJeux\(\)/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/#view-dashboard \.ac-btn\.ac-v21-journey/);
 assert.doesNotMatch(accueil,/jeux-carte|survie-mot/);
});
test('Pages Jeux et Survie, navigation native Android',()=>{
 for(const id of ['view-jeux','view-survie'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/jeux-v21.css\?v=11/);assert.match(html,/jeux-v21.js\?v=12/);assert.match(html,/survie-vfx.js\?v=2/);
 assert.match(nav,/'view-jeux': 1/);
 assert.match(nav,/else if \(e\.vue === 'view-jeux'\) renderJeuxHub\(\)/);
 assert.match(nav,/case 'view-jeux': ouvrirJeux\(\)/);
});
test('Mots issus uniquement des leçons étudiées, sans Plus, phrases ni doublons',()=>{
 const {ctx}=make();
 ctx.list=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht'),card('salut','Moien'),card('film','Film'),card('Au bureau','Um Büro'),{...card('cher','deier'),plus:true},card('maison','Haus')]),lesson(2,[card('table','Dësch')])];
 ctx.progress={1:{vue:{ouverte:1}}};
 const pool=vm.runInContext('survieMotsDisponibles(list,progress)',ctx);
 assert.deepEqual(Array.from(pool,p=>p.mot),['haus','bam','buch','këscht','moien']);
 assert.equal(vm.runInContext('survieMotsDisponibles(list,{}).length',ctx),0);
});
test('Leçon 1 réelle : ponctuation finale ignorée, cinq mots jouables et données intactes',()=>{
 const {ctx}=make();
 const l=JSON.parse(read('data/lecons/A1.1/lecon-01.json'));
 ctx.list=[l];
 ctx.progress={1:{vue:{ouverte:1}}};
 const pool=vm.runInContext('survieMotsDisponibles(list,progress)',ctx);
 assert.deepEqual(Array.from(pool,p=>p.mot),['moien','madamm','här','schlecht','äddi']);
 assert.ok(pool.every(p=>!p.mot.includes(' ')&&!p.mot.includes('!')&&!p.mot.includes('.')&&!p.mot.includes('?')),'aucune phrase ni ponctuation dans les tuiles');
 assert.equal(l.flashcards.find(c=>c.id===2001).lu,'Moien!','source originale préservée');
 assert.equal(l.flashcards.find(c=>c.id===2031).lu,'Äddi!','accent et ponctuation d’origine préservés');
 assert.equal(vm.runInContext('survieMotsDisponibles(list,{}).length',ctx),0,'leçon non vue exclue');
});
test('Survie : ponctuation uniquement en fin de mot ; cartes Plus et doublons exclus',()=>{
 const {ctx}=make();
 ctx.list=[lesson(7,[
  card('Bonjour','Moien!'),card('Au revoir','Äddi!?'),
  card('Bonjour','Moien'),card('Monsieur','Här.'),
  card('Merci','Merci!'),card('Phrase','Wéi geet et dir?'),
  card('Mot interne','mo!ien'),{...card('Salut','Hallo!'),plus:true}
 ])];
 ctx.progress={7:{vue:{ouverte:1}}};
 const pool=vm.runInContext('survieMotsDisponibles(list,progress)',ctx);
 assert.deepEqual(Array.from(pool,p=>p.mot),['moien','äddi','här']);
});
test('Record persistant et isolé par profil sans écrire la progression',()=>{
 const {ctx,store}=make();
 vm.runInContext('survieEnregistrer(8)',ctx);
 assert.equal(vm.runInContext('survieRecord()',ctx),8);
 vm.runInContext('survieEnregistrer(2)',ctx);
 assert.equal(vm.runInContext('survieRecord()',ctx),8);
 assert.ok(store.has('profilA:luxSurvieBest'));
 ctx.storageKey=k=>'profilB:'+k;
 assert.equal(vm.runInContext('survieRecord()',ctx),0);
});
test('Survie : auto-validation, +3 s, mauvaise réponse -3 s et série remise à zéro',()=>{
 const {ctx,element,advance,flush}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht'),card('bonjour','Moien')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 assert.equal(ctx.lastView,'view-survie');
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
 advance(4000);vm.runInContext('survieTick()',ctx);
 assert.equal(vm.runInContext('Math.round(surviePartie.restant)',ctx),26);
 // Associer chaque lettre correcte à une tuile disponible.
 ctx.indices=vm.runInContext('(function(){const p=surviePartie,used=new Set();return Array.from(p.mot.mot).map(c=>{const i=p.tuiles.findIndex((x,j)=>x===c&&!used.has(j));used.add(i);return i})})()',ctx);
 vm.runInContext('indices.forEach(survieLettre)',ctx);
 assert.equal(vm.runInContext('surviePartie.serie',ctx),1);
 assert.equal(vm.runInContext('Math.round(surviePartie.restant)',ctx),29);
 assert.equal(vm.runInContext('surviePartie.gainTexte',ctx),'+3 s');
 assert.match(element('survie-combo').className,/survie-combo-hit/);
 assert.match(element('survie-chrono').className,/survie-time-hit/);
 assert.equal(vm.runInContext('survieRecord()',ctx),1);
 flush();
 // Forcer un ordre de tuiles différent de la solution attendue.
 ctx.bad=vm.runInContext('(function(){const p=surviePartie,ids=p.tuiles.map((_,i)=>i);while(ids.map(i=>p.tuiles[i]).join("")===p.mot.mot){ids.push(ids.shift())}return ids})()',ctx);
 vm.runInContext('bad.forEach(survieLettre)',ctx);
 assert.equal(vm.runInContext('surviePartie.serie',ctx),0);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),26);
 assert.equal(vm.runInContext('survieComboPalier(surviePartie.serie)',ctx),0);
 assert.doesNotMatch(element('survie-combo').className,/survie-combo-hit/);
 flush();
 advance(32000);vm.runInContext('survieTick()',ctx);
 assert.equal(element('survie-jeu').className,'survie-jeu survie-jeu-fin','rideau visible avant les résultats');
 assert.match(element('survie-jeu').innerHTML,/TEMPS ÉCOULÉ/);
 advance(2201);
 assert.match(element('survie-jeu').innerHTML,/Le temps est écoulé/);
 assert.equal(vm.runInContext('surviePartie.actif',ctx),false);
 vm.runInContext('demarrerSurvie()',ctx);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
});
test('Timer en pause quand le document est caché',()=>{
 const {ctx,advance}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 ctx.document.visibilityState='hidden';
 advance(30000);vm.runInContext('survieTick()',ctx);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
 ctx.document.visibilityState='visible';vm.runInContext('survieTick()',ctx);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
});

test('Survie : les lettres courtes et les dernières rangées sont centrées, sans grille rigide',()=>{
 const styles=read('public/jeux-v21.css');
 const zone=styles.match(/#view-survie \.survie-tuiles\s*\{([^}]*)\}/);
 assert.ok(zone,'le conteneur des tuiles doit exister');
 assert.match(zone[1],/display:flex/);
 assert.match(zone[1],/flex-wrap:wrap/);
 assert.match(zone[1],/justify-content:center/);
 assert.match(zone[1],/max-width:347px/);
 assert.doesNotMatch(zone[1],/grid-template-columns/);
 assert.match(styles,/#view-survie \.survie-tuile\{flex:0 0 clamp\(44px,13\.2vw,52px\)/);
 assert.match(html,/href="jeux-v21\.css\?v=10"/);
});

test('Combo arcade : paliers progressifs, étincelles, temps bonus et animation réduite',()=>{
 const {ctx}=make();
 ctx.series=[0,2,3,4,5,9,10,20];
 assert.deepEqual(Array.from(vm.runInContext('series.map(survieComboPalier)',ctx)),[0,0,1,1,2,2,3,3]);
 assert.equal(vm.runInContext('survieComboMessage(3)',ctx),'COMBO ×3');
 assert.equal(vm.runInContext('survieComboMessage(5)',ctx),'EN FEU ×5');
 assert.equal(vm.runInContext('survieComboMessage(10)',ctx),'LÉGENDAIRE ×10');
 assert.equal(vm.runInContext('survieGainLabel(3)',ctx),'+3 s');
 assert.equal(vm.runInContext('survieGainLabel(0)',ctx),'CHRONO PLEIN');
 assert.match(script,/SURVIE_BONUS = 3/);
 const css=read('public/jeux-v21.css');
 for(const x of ['data-tier="1"','data-tier="2"','data-tier="3"',
  '.survie-combo-hit #survie-serie','.survie-combo-hit .survie-etincelles i',
  '.survie-time-hit .survie-gain','@keyframes survie-combo-glide',
  '@media(prefers-reduced-motion:reduce)']) assert.ok(css.includes(x),x);
 assert.doesNotMatch(css,/#view-survie \.survie-tuiles\{[^}]*animation/);
});
test('Bonus plafonné : ne pas afficher +3s si la réserve est déjà au maximum',()=>{
 const {ctx,element}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 ctx.ordre=vm.runInContext('(function(){const p=surviePartie,used=new Set();return Array.from(p.mot.mot).map(letter=>{const i=p.tuiles.findIndex((c,j)=>c===letter&&!used.has(j));used.add(i);return i;});})()',ctx);
 vm.runInContext('ordre.forEach(survieLettre)',ctx);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
 assert.equal(vm.runInContext('surviePartie.gainTexte',ctx),'CHRONO PLEIN');
 assert.equal(vm.runInContext('survieRecord()',ctx),1);
 assert.match(element('survie-jeu').innerHTML,/survie-etincelles/);
 assert.match(element('survie-jeu').innerHTML,/survie-combo-cri/);
});

test('Régression : une seule animation, HUD conservé entre deux mots, sans reflow',()=>{
 const {ctx,element,advance}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),
    card('livre','Buch'),card('boîte','Këscht'),card('bonjour','Moien')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 const shell=element('survie-jeu').innerHTML;
 const hud=element('survie-combo'),chrono=element('survie-chrono');
 assert.ok(shell.includes('id="survie-question"'));
 ctx.ordre=vm.runInContext("(()=>{const p=surviePartie,u=new Set();return Array.from(p.mot.mot).map(c=>{const i=p.tuiles.findIndex((x,j)=>x===c&&!u.has(j));u.add(i);return i})})()",ctx);
 vm.runInContext('ordre.forEach(survieLettre)',ctx);
 assert.match(hud.className,/survie-combo-hit/);
 assert.match(chrono.className,/survie-time-hit/);
 advance(300); // mot suivant à 280ms, animation encore en cours (jusqu'à 620ms)
 assert.equal(element('survie-combo'),hud,'même instance de HUD');
 assert.equal(element('survie-chrono'),chrono,'même instance de chrono');
 assert.equal(element('survie-jeu').innerHTML,shell,'pas de réécriture totale de la vue');
 assert.match(hud.className,/survie-combo-hit/,'impulsion initiale encore présente');
 assert.equal(vm.runInContext('surviePartie.ecranPret',ctx),true);
 assert.equal(vm.runInContext('surviePartie.serie',ctx),1);
 assert.ok(element('survie-question').innerHTML.includes('survie-tuile'),
   'seule la zone de question est rafraîchie');
 advance(400); // nettoyage 650ms, la classe d'animation ne persiste pas
 assert.doesNotMatch(hud.className,/survie-combo-hit/);
 assert.doesNotMatch(chrono.className,/survie-time-hit/);
 const source=read('public/jeux-v21.js'),css=read('public/jeux-v21.css');
 assert.doesNotMatch(source,/void combo\.offsetWidth|void chrono\.offsetWidth/,
   'aucune lecture forcée du layout');
 assert.doesNotMatch(source,/p\.fete/,'ancien double départ supprimé');
 assert.match(css,/#view-survie #survie-question\{display:flex/);
 assert.doesNotMatch(css,/transition:font-size/);
});
test('Erreur : annule le combo immédiatement sans modifier le HUD ni le score',()=>{
 const {ctx,element,flush}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),
    card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 const hud=element('survie-combo');
 ctx.wrong=vm.runInContext("(()=>{const p=surviePartie,indices=p.tuiles.map((_,i)=>i);while(indices.map(i=>p.tuiles[i]).join('')===p.mot.mot)indices.push(indices.shift());return indices})()",ctx);
 vm.runInContext('wrong.forEach(survieLettre)',ctx);
 assert.equal(vm.runInContext('surviePartie.serie',ctx),0);
 assert.doesNotMatch(hud.className||'',/hit/);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),27);
 flush();
 assert.equal(element('survie-combo'),hud);
});

test('Passer : même pénalité qu’une faute, nouveau mot, série perdue et double tap ignoré',()=>{
 const {ctx,element,advance}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),
  card('boîte','Këscht'),card('bonjour','Moien'),card('table','Dësch')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 const prev=vm.runInContext('surviePartie.mot.mot',ctx);
 assert.match(element('survie-jeu').innerHTML,/onclick="surviePasser\(\)"/);
 assert.match(element('survie-jeu').innerHTML,/Passer <small>−3 s<\/small>/);
 ctx.correct=vm.runInContext("(()=>{const p=surviePartie,u=new Set();return Array.from(p.mot.mot).map(c=>{const i=p.tuiles.findIndex((x,j)=>x===c&&!u.has(j));u.add(i);return i})})()",ctx);
 vm.runInContext('correct.forEach(survieLettre)',ctx);
 advance(700); // HUD animation terminée, prochaine question active
 assert.equal(vm.runInContext('surviePartie.serie',ctx),1);
 const activeWord=vm.runInContext('surviePartie.mot.mot',ctx);
 const record=vm.runInContext('survieRecord()',ctx);
 const initial=vm.runInContext('surviePartie.restant',ctx);
 vm.runInContext('surviePasser();surviePasser()',ctx);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),initial-3);
 assert.equal(vm.runInContext('surviePartie.serie',ctx),0);
 assert.equal(vm.runInContext('surviePartie.total',ctx),1);
 assert.equal(vm.runInContext('survieRecord()',ctx),record);
 assert.equal(vm.runInContext('surviePartie.verrou',ctx),true);
 assert.match(element('survie-info').textContent,/Mot passé/);
 assert.equal(vm.runInContext('surviePartie.mot.mot',ctx),activeWord);
 advance(261);
 assert.equal(vm.runInContext('surviePartie.verrou',ctx),false);
 assert.equal(vm.runInContext('surviePartie.selection.length',ctx),0);
 assert.notEqual(vm.runInContext('surviePartie.mot.mot',ctx),activeWord);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),initial-3);
});
test('Passer : délai ignoré si la partie est quittée, et fin immédiate quand le chrono atteint zéro',()=>{
 const {ctx,element,advance}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 vm.runInContext('surviePartie.restant=2.5;surviePasser()',ctx);
 assert.equal(vm.runInContext('surviePartie.actif',ctx),false);
 assert.equal(element('survie-jeu').className,'survie-jeu survie-jeu-fin','rideau visible avant les résultats');
 assert.match(element('survie-jeu').innerHTML,/TEMPS ÉCOULÉ/);
 advance(2201);
 assert.match(element('survie-jeu').innerHTML,/Le temps est écoulé/);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),0);
 vm.runInContext('demarrerSurvie()',ctx);
 vm.runInContext('surviePasser();survieArreter()',ctx);
 advance(300);
 assert.equal(vm.runInContext('surviePartie.actif',ctx),false);
 assert.equal(vm.runInContext('surviePartie.verrou',ctx),true);
});
test('Passer : largeur mobile et statut séparé des boutons, aucun impact pédagogique',()=>{
 const styles=read('public/jeux-v21.css');
 assert.match(styles,/#view-survie \.survie-actions\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(styles,/#view-survie #survie-info\{grid-column:1\/-1/);
 assert.match(styles,/min-height:48px/);
 assert.match(script,/function surviePasser\(\)/);
 assert.match(script,/surviePenaliser\(p\)/);
 assert.doesNotMatch(script,/progress\.(?:set|update).*surviePasser/);
});

// SPEC 92 étape 1 : le moteur envoie des événements au gestionnaire d'effets, une seule fois par réponse.
function fxStub(){
 const appels=[];
 return {appels,stub:{
  attacher:()=>appels.push('attacher'),etat:()=>appels.push('etat'),lettre:i=>appels.push('lettre:'+i),
  reussite:x=>appels.push('reussite:'+x.palier+':'+x.nouveauPalier),erreur:x=>appels.push('erreur:'+x.serieAvant),
  arreter:()=>appels.push('arreter'),sonActif:()=>true,basculerSon:()=>false}};
}
const motsFx=[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht'),card('bonjour','Moien')];
const bonOrdre="(()=>{const p=surviePartie,u=new Set();return Array.from(p.mot.mot).map(c=>{const i=p.tuiles.findIndex((x,j)=>x===c&&!u.has(j));u.add(i);return i})})()";
test('SPEC 92 : événements VFX — lettres, une réussite, palier, erreur, Passer et arrêt',()=>{
 const {ctx,element,advance}=make();
 const fx=fxStub();ctx.SurvieFx=fx.stub;
 ctx.lecons=[lesson(1,motsFx)];ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 assert.equal(fx.appels.filter(a=>a==='attacher').length,1,'canvas attaché une fois');
 assert.match(element('survie-jeu').innerHTML,/<canvas id="survie-feu"/);
 assert.match(element('survie-jeu').innerHTML,/id="survie-son"[^>]*aria-label="Couper le son"/);
 const longueur=vm.runInContext('surviePartie.mot.longueur',ctx);
 ctx.ordre=vm.runInContext(bonOrdre,ctx);
 vm.runInContext('ordre.forEach(survieLettre)',ctx);
 assert.deepEqual(fx.appels.filter(a=>a.startsWith('lettre:')),Array.from({length:longueur},(_,i)=>'lettre:'+i));
 assert.deepEqual(fx.appels.filter(a=>a.startsWith('reussite')),['reussite:0:false']);
 assert.equal(element('survie-cases').className,'survie-cases survie-cases-ok');
 advance(700);
 assert.equal(fx.appels.filter(a=>a.startsWith('reussite')).length,1,'aucun second déclenchement au mot suivant');
 assert.equal(fx.appels.filter(a=>a==='attacher').length,1,'HUD et canvas conservés entre deux mots');
 // Atteindre le palier 1 (série 3) : la réussite le signale une seule fois.
 for(let n=0;n<2;n++){ctx.ordre=vm.runInContext(bonOrdre,ctx);vm.runInContext('ordre.forEach(survieLettre)',ctx);advance(700);}
 assert.deepEqual(fx.appels.filter(a=>a.startsWith('reussite')),['reussite:0:false','reussite:0:false','reussite:1:true']);
 // Faute après une série de 3 : combo brisé, −3 s affiché.
 ctx.wrong=vm.runInContext("(()=>{const p=surviePartie,ids=p.tuiles.map((_,i)=>i);while(ids.map(i=>p.tuiles[i]).join('')===p.mot.mot)ids.push(ids.shift());return ids})()",ctx);
 vm.runInContext('wrong.forEach(survieLettre)',ctx);
 assert.deepEqual(fx.appels.filter(a=>a.startsWith('erreur')),['erreur:3']);
 assert.equal(element('survie-combo').className,'survie-combo survie-combo-ko');
 assert.equal(element('survie-combo-cri').textContent,'COMBO BRISÉ');
 assert.equal(element('survie-gain').textContent,'−3 s');
 assert.equal(element('survie-cases').className,'survie-cases survie-cases-ko');
 advance(700);
 assert.equal(element('survie-cases').className,'survie-cases','secousse retirée pour le nouvel essai');
 assert.equal(element('survie-combo').className,'survie-combo');
 // Passer : même effet de perte, sans secousse des cases.
 vm.runInContext('surviePasser()',ctx);
 assert.deepEqual(fx.appels.filter(a=>a.startsWith('erreur')),['erreur:3','erreur:0']);
 vm.runInContext('quitterSurvie()',ctx);
 assert.ok(fx.appels.includes('arreter'));
});
test('SPEC 92 : chrono critique sous 5 s, palier recopié sur la barre, jeu intact sans survie-vfx.js',()=>{
 const {ctx,element,advance}=make();
 ctx.lecons=[lesson(1,motsFx)];ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 assert.doesNotMatch(element('survie-jeu').innerHTML,/id="survie-son"/,'pas de bouton son sans gestionnaire');
 assert.equal(element('survie-jeu').className,'survie-jeu');
 advance(26000);vm.runInContext('survieTick()',ctx);
 assert.equal(element('survie-jeu').className,'survie-jeu survie-urgence');
 advance(5000);vm.runInContext('survieTick()',ctx);
 assert.equal(element('survie-jeu').className,'survie-jeu survie-jeu-fin','rideau visible avant les résultats');
 assert.match(element('survie-jeu').innerHTML,/TEMPS ÉCOULÉ/);
 advance(2201);
 assert.match(element('survie-jeu').innerHTML,/Le temps est écoulé/);
 assert.match(element('survie-jeu').className,/survie-jeu survie-jeu-resultats/,'urgence retirée en fin de partie');
 const styles=read('public/jeux-v21.css');
 for(const x of ['.survie-tete[data-tier="3"] .survie-piste i','.survie-hud .survie-flamme{color:var(--tier-color)}',
  '.survie-cases-ok .survie-case','.survie-cases-ko','.survie-combo-ko','.survie-time-ko .survie-gain',
  '.survie-urgence::before','#view-survie .survie-feu{display:none}','pointer-events:none'])assert.ok(styles.includes(x),x);
 const nouveau=styles.slice(styles.indexOf('SPEC 92'));
 assert.doesNotMatch(nouveau,/transition:[^;}]*(width|height|top|left|margin|font-size)/,'aucune transition de mise en page');
});

test('Survie : lettres toujours en minuscules, sans confusion I/l ni altération des flashcards',()=>{
 const {ctx,element}=make();
 const originals=[card('exemple','Ili'),card('maison','Haus'),card('boîte','Këscht'),
   card('arbre','Bam'),card('livre','Buch')];
 ctx.lecons=[lesson(1,originals)];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 const pool=vm.runInContext('surviePool()',ctx);
 assert.deepEqual(Array.from(pool,p=>p.mot),['ili','haus','këscht','bam','buch']);
 assert.equal(ctx.lecons[0].flashcards[0].lu,'Ili','donnée pédagogique inchangée');
 assert.equal(ctx.lecons[0].flashcards[1].lu,'Haus','majuscule orthographique conservée');
 vm.runInContext('demarrerSurvie()',ctx);
 assert.equal(vm.runInContext('surviePartie.mot.mot===surviePartie.mot.mot.toLocaleLowerCase("lb")',ctx),true);
 assert.equal(vm.runInContext('surviePartie.tuiles.every(c=>c===c.toLocaleLowerCase("lb"))',ctx),true);
 assert.match(element('survie-jeu').innerHTML,/class="survie-tuile"/);
 ctx.ordre=vm.runInContext('(()=>{const p=surviePartie,u=new Set();return Array.from(p.mot.mot).map(c=>{const i=p.tuiles.findIndex((x,j)=>x===c&&!u.has(j));u.add(i);return i})})()',ctx);
 vm.runInContext('ordre.forEach(survieLettre)',ctx);
 assert.equal(vm.runInContext('surviePartie.serie',ctx),1,'validation correcte inchangée');
 assert.equal(vm.runInContext('survieRecord()',ctx),1);
});

test('Fin de Survie : extinction visible, chrono à 0, score figé, résultat après 2200ms',()=>{
 const {ctx,element,advance,store}=make(),events=[];
 ctx.SurvieFx={fin:()=>events.push('fin'),arreter:()=>events.push('arreter'),etat:()=>events.push('etat'),sonActif:()=>false};
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 vm.runInContext('surviePartie.maxSerie=7;surviePartie.total=13;survieEnregistrer(9);surviePartie.restant=0;survieTerminer();survieTerminer()',ctx);
 assert.equal(vm.runInContext('surviePartie.actif',ctx),false);
 assert.equal(vm.runInContext('surviePartie.verrou',ctx),true);
 assert.equal(vm.runInContext('surviePartie.finEnCours',ctx),true);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),0);
 assert.equal(element('survie-secondes').textContent,'0 s');
 assert.equal(element('survie-jauge').style.transform,'scaleX(0)');
 assert.equal(element('survie-jeu').className,'survie-jeu survie-jeu-fin');
 assert.match(element('survie-jeu').innerHTML,/TEMPS ÉCOULÉ/);
 assert.equal(events.filter(x=>x==='fin').length,1,'un seul effet de fin');
 assert.equal(events.filter(x=>x==='arreter').length,0,'pas de démolition prématurée du Canvas après fin');
 advance(2199);
 assert.equal(vm.runInContext('surviePartie.finEnCours',ctx),true);
 assert.match(element('survie-jeu').innerHTML,/TEMPS ÉCOULÉ/);
 advance(1);
 assert.equal(vm.runInContext('surviePartie.finEnCours',ctx),false);
 assert.equal(vm.runInContext('surviePartie.resultatsVisibles',ctx),true);
 assert.match(element('survie-jeu').innerHTML,/Le temps est écoulé/);
 assert.match(element('survie-jeu').innerHTML,/Meilleure série/);
 assert.match(element('survie-jeu').innerHTML,/>13<\/strong><span>SUR 4/);
 assert.match(element('survie-jeu').innerHTML,/<span>Record personnel<\/span><strong>9<\/strong>/);
 assert.equal(JSON.parse(store.get('profilA:luxSurvieBest')).record,9,'pas de mutation du record');
 assert.equal(events.filter(x=>x==='arreter').length,1,'Canvas arrêté après la transition');
 advance(1000);
 assert.equal(events.filter(x=>x==='arreter').length,1,'aucune seconde révélation');
});

test('Fin : tap Passer l’animation immédiat, ancien timer ne remplace pas une autre partie',()=>{
 const {ctx,element,advance}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie();survieTerminer();survieFinPasser();survieFinPasser()',ctx);
 assert.match(element('survie-jeu').innerHTML,/Rejouer/);
 assert.equal(vm.runInContext('surviePartie.resultatsVisibles',ctx),true);
 vm.runInContext('demarrerSurvie()',ctx);
 assert.equal(vm.runInContext('surviePartie.actif',ctx),true);
 advance(1200);
 assert.match(element('survie-jeu').innerHTML,/id="survie-question"/);
 assert.doesNotMatch(element('survie-jeu').innerHTML,/survie-resultat-actions/);
});

test('Fin : quitter pendant le rideau supprime tout résultat tardif',()=>{
 const {ctx,element,advance}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie();survieTerminer();quitterSurvie()',ctx);
 assert.equal(ctx.lastView,'retour');
 advance(2000);
 assert.equal(vm.runInContext('surviePartie.resultatsVisibles',ctx),false);
 assert.match(element('survie-jeu').innerHTML,/TEMPS ÉCOULÉ/);
 assert.doesNotMatch(element('survie-jeu').innerHTML,/survie-resultat-actions/);
});

test('Fin : réduction des mouvements révèle immédiatement un résultat non animé',()=>{
 const {ctx,element,advance}=make();
 ctx.window={matchMedia:()=>({matches:true})};
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie();surviePartie.maxSerie=4;survieTerminer()',ctx);
 assert.equal(vm.runInContext('surviePartie.finEnCours',ctx),false);
 assert.match(element('survie-jeu').innerHTML,/id="survie-fin-score"[^>]*>0<\/strong>/);
 assert.match(element('survie-jeu').className,/survie-jeu survie-jeu-resultats/);
 advance(1000);
 assert.equal(vm.runInContext('surviePartie.resultatsVisibles',ctx),true);
});

test('Fin : sans record, aucune fausse médaille ; avec nouveau record, badge seulement',()=>{
 const {ctx,element}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('survieEnregistrer(8);demarrerSurvie();surviePartie.maxSerie=3;survieTerminer();survieFinPasser()',ctx);
 assert.doesNotMatch(element('survie-jeu').innerHTML,/Nouveau record/);
 vm.runInContext('demarrerSurvie();surviePartie.maxSerie=9;survieEnregistrer(9);survieTerminer();survieFinPasser()',ctx);
 assert.match(element('survie-jeu').innerHTML,/Nouveau record/);
 const styles=read('public/jeux-v21.css');
 for(const x of ['.survie-fin-rideau','.survie-jeu-fin','.survie-fin-stats','@media(prefers-reduced-motion:reduce)'])assert.ok(styles.includes(x),x);
});

test('Jeux : blocage explicite, progression 0/4 puis 3/4, une leçon à commencer',()=>{
 const {ctx,element}=make();
 vm.runInContext('renderJeuxHub()',ctx);
 let code=element('jeux-hub').innerHTML;
 assert.match(code,/À DÉBLOQUER/);
 assert.match(code,/0 \/ 4 mots/);
 assert.match(code,/4 restants/);
 assert.match(code,/Commencer une leçon/);
 assert.match(code,/aria-valuenow="0"/);
 assert.doesNotMatch(code,/onclick="demarrerSurvie\(\)"/);
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('renderJeuxHub()',ctx);
 code=element('jeux-hub').innerHTML;
 assert.match(code,/3 \/ 4 mots/);
 assert.match(code,/Encore 1 mot pour jouer/);
 assert.match(code,/aria-valuenow="3"/);
 ctx.lecons[0].flashcards.push(card('boîte','Këscht'));
 vm.runInContext('renderJeuxHub()',ctx);
 code=element('jeux-hub').innerHTML;
 assert.match(code,/4 mots disponibles/);
 assert.match(code,/onclick="demarrerSurvie\(\)"/);
 assert.doesNotMatch(code,/jeux-deblocage-barre/);
});
test('Entrée : action principale clavier hors boutons, sans activer un contrôle déjà ciblé',()=>{
 const {ctx,element}=make();
 element('view-jeux').classList={contains:cl=>cl==='active'};
 let clics=0,annulations=0,stops=0;
 ctx.document.querySelector=s=>s==='#jeux-hub .jeux-jouer'?{click(){clics++;}}:null;
 ctx.evt={key:'Enter',repeat:false,target:{closest:()=>null},
   preventDefault(){annulations++;},stopPropagation(){stops++;}};
 vm.runInContext('survieRaccourciEntree(evt)',ctx);
 assert.equal(clics,1);assert.equal(annulations,1);assert.equal(stops,1);
 ctx.evt.target={closest:()=>({tagName:'BUTTON'})};
 vm.runInContext('survieRaccourciEntree(evt)',ctx);
 assert.equal(clics,1,'un bouton déjà focalisé garde son Entrée native');
 ctx.evt.target={closest:()=>null};ctx.evt.repeat=true;
 vm.runInContext('survieRaccourciEntree(evt)',ctx);
 assert.equal(clics,1,'appui maintenu sans double lancement');
});

test('Réserve épuisée : quatre réussites arrêtent immédiatement sans répétition ni chrono à zéro',()=>{
 const {ctx,element,advance,store}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 for(let n=0;n<4;n++){
   ctx.ordre=vm.runInContext('(()=>{const p=surviePartie,u=new Set();return Array.from(p.mot.mot).map(c=>{const i=p.tuiles.findIndex((x,j)=>x===c&&!u.has(j));u.add(i);return i})})()',ctx);
   vm.runInContext('ordre.forEach(survieLettre)',ctx);
   advance(300);
 }
 assert.equal(vm.runInContext('surviePartie.actif',ctx),false);
 assert.equal(vm.runInContext('surviePartie.raisonFin',ctx),'reserve');
 assert.equal(vm.runInContext('surviePartie.vus.size',ctx),4);
 assert.equal(vm.runInContext('surviePartie.passes',ctx),0);
 assert.equal(vm.runInContext('surviePartie.restant',ctx),30);
 assert.match(element('survie-jeu').innerHTML,/SANS-FAUTE/);
 assert.match(element('survie-jeu').innerHTML,/Tous tes mots réussis/);
 assert.match(element('survie-jeu').innerHTML,/>4<\/strong><span>SUR 4<\/span>/);
 assert.match(element('survie-jeu').innerHTML,/Continuer mon chemin/);
 assert.equal(JSON.parse(store.get('profilA:luxSurvieBest')).record,4);
 advance(2300);
 assert.match(element('survie-jeu').innerHTML,/SANS-FAUTE/,'aucun timeout tardif');
});
test('Réserve parcourue : Passer donne une fin neutre, conserve record et offre Rejouer',()=>{
 const {ctx,element,advance}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 for(let n=0;n<4;n++){
   if(n===1||n===3)vm.runInContext('surviePasser()',ctx);
   else{
     ctx.ordre=vm.runInContext('(()=>{const p=surviePartie,u=new Set();return Array.from(p.mot.mot).map(c=>{const i=p.tuiles.findIndex((x,j)=>x===c&&!u.has(j));u.add(i);return i})})()',ctx);
     vm.runInContext('ordre.forEach(survieLettre)',ctx);
   }
   advance(300);
 }
 assert.equal(vm.runInContext('surviePartie.actif',ctx),false);
 assert.equal(vm.runInContext('surviePartie.total',ctx),2);
 assert.equal(vm.runInContext('surviePartie.passes',ctx),2);
 assert.match(element('survie-jeu').innerHTML,/RÉSERVE TERMINÉE/);
 assert.match(element('survie-jeu').innerHTML,/2 mots passés/);
 assert.match(element('survie-jeu').innerHTML,/>2<\/strong><span>SUR 4<\/span>/);
 assert.match(element('survie-jeu').innerHTML,/Rejouer Survie/);
 assert.doesNotMatch(element('survie-jeu').innerHTML,/SANS-FAUTE|DÉFI ACCOMPLI/);
 assert.equal(element('survie-jeu').className,'survie-jeu survie-jeu-resultats survie-resultat-partiel');
});
test('Mauvaise réponse non validée : le mot reste dans la réserve ; chrono garde sa fin habituelle',()=>{
 const {ctx,element,advance}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 assert.equal(vm.runInContext('surviePartie.vus.size',ctx),0);
 ctx.bad=vm.runInContext('(()=>{const p=surviePartie,a=p.tuiles.map((_,i)=>i);while(a.map(i=>p.tuiles[i]).join("")===p.mot.mot)a.push(a.shift());return a})()',ctx);
 vm.runInContext('bad.forEach(survieLettre)',ctx);
 assert.equal(vm.runInContext('surviePartie.vus.size',ctx),0);
 advance(530);
 assert.equal(vm.runInContext('surviePartie.actif',ctx),true);
 vm.runInContext('survieTerminer();survieFinPasser()',ctx);
 assert.match(element('survie-jeu').innerHTML,/TEMPS ÉCOULÉ/);
 assert.doesNotMatch(element('survie-jeu').innerHTML,/SANS-FAUTE/);
});

test('Recette Survie : les trois scénarios utilisent le moteur réel, uniquement en RECETTE=1',()=>{
 const s=read('recette/recette.js'),serveur=read('server.js');
 assert.match(s,/titre: 'Fin de Survie'/);
 assert.match(s,/'sans-faute': \{ titre: 'Réserve épuisée/);
 assert.match(s,/'passes': \{ titre: 'Réserve épuisée/);
 assert.match(s,/'temps': \{ titre: 'Temps écoulé/);
 assert.match(s,/function recJouerSurvie\(l, def\)/);
 assert.match(s,/survieTerminerReserve\(\)/);
 assert.match(s,/survieTerminer\(\);survieFinPasser\(\)/);
 assert.match(serveur,/if \(RECETTE\)/);
 assert.match(serveur,/app\.use\('\/recette', express\.static/);
 assert.match(serveur,/FIREBASE: null, RECETTE: true/);
});

test('Maquette : vrais résultats ont un en-tête, un centre défilant et un footer fixe',()=>{
 const {ctx,element}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie();surviePartie.total=4;surviePartie.maxSerie=4;surviePartie.vus=new Set(surviePartie.pool.map(m=>m.mot));survieTerminerReserve()',ctx);
 const markup=element('survie-jeu').innerHTML;
 for(const label of ['survie-resultat-entete','survie-resultat-scroll','survie-resultat-actions',
  'survie-fin-anneau-chiffre','MOTS RÉUSSIS','SUR 4','Continuer mon chemin','Retour aux Jeux'])assert.ok(markup.includes(label),label);
 assert.match(markup,/id="survie-fin-score"[^>]*>4<\/strong><span>SUR 4<\/span>/);
 const styles=read('public/jeux-v21.css');
 for(const s of ['height:100dvh','min-height:0','overflow-y:auto','env(safe-area-inset-bottom)','survie-resultat-actions'])assert.ok(styles.includes(s),s);
});
test('Une faute corrigée ne peut plus produire un faux sans-faute',()=>{
 const {ctx,element,advance}=make();
 ctx.lecons=[lesson(1,[card('maison','Haus'),card('arbre','Bam'),card('livre','Buch'),card('boîte','Këscht')])];
 ctx.getProgress=()=>({1:{vue:{ouverte:1}}});
 vm.runInContext('demarrerSurvie()',ctx);
 ctx.bad=vm.runInContext('(()=>{const p=surviePartie,a=p.tuiles.map((_,i)=>i);while(a.map(i=>p.tuiles[i]).join("")===p.mot.mot)a.push(a.shift());return a})()',ctx);
 vm.runInContext('bad.forEach(survieLettre)',ctx);
 assert.equal(vm.runInContext('surviePartie.erreurs',ctx),1);
 advance(550);
 for(let i=0;i<4;i++){
   ctx.indices=vm.runInContext('(()=>{const p=surviePartie,u=new Set();return Array.from(p.mot.mot).map(c=>{const n=p.tuiles.findIndex((x,i)=>x===c&&!u.has(i));u.add(n);return n})})()',ctx);
   vm.runInContext('indices.forEach(survieLettre)',ctx);
   advance(300);
 }
 assert.match(element('survie-jeu').className,/survie-resultat-partiel/);
 assert.doesNotMatch(element('survie-jeu').innerHTML,/SANS-FAUTE/);
 assert.match(element('survie-jeu').innerHTML,/1 erreur avant correction/);
});
