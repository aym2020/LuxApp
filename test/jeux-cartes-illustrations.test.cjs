'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('SPEC 104 : cartes sans images, harmonisées en violet nuit avec formes CSS',()=>{
  const css=read('public/jeux-univers.css');
  assert.match(css,/SPEC 104/);
  assert.match(css,/#view-jeux \.jeux-carte:not\(\.runner-carte\)/);
  assert.match(css,/#view-jeux \.runner-carte/);
  assert.match(css,/\.jeux-decor-anneau/);
  assert.match(css,/\.jeux-decor-lettre\.art-a/);
  assert.match(css,/\.jeux-decor-portail\.portal-1|\.jeux-decor-portail\{/);
  assert.match(css,/\.jeux-decor-piste/);
  assert.doesNotMatch(css,/url\((?:["']?)art\/|\.webp|\.svg/i);
  assert.ok(css.includes('pointer-events:none'),'ornements non interactifs');
  assert.ok(css.includes('z-index:0'),'ornements derrière le contenu');
  assert.ok(css.includes('> :not(.jeux-decor)'),'contenu au-dessus du décor');
});

test('SPEC 104 : une grille mobile, deux colonnes desktop et boutons or',()=>{
  const css=read('public/jeux-univers.css'),html=read('public/index.html');
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr)'));
  assert.ok(css.includes('@media(min-width:760px)'));
  assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
  assert.ok(css.includes('@media(max-width:359px)'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(css.includes('forced-colors:active'));
  assert.ok(css.includes('background:var(--accent)'),'CTA or conservé');
  assert.ok(css.includes('min-height:56px'),'cible tactile confortable');
  assert.ok(css.includes('color:var(--accent)'),'record or conservé');
  assert.ok(html.includes('jeux-univers.css?v=9'));
  assert.ok(Number((html.match(/jeux-v21\.js\?v=(\d+)/) || [])[1]) >= 17);
  assert.ok(Number((html.match(/runner\.js\?v=(\d+)/) || [])[1]) >= 19);
});

test('SPEC 104 : même organisation HTML, records dynamiques, états verrouillés',()=>{
  const survie=read('public/jeux-v21.js'),runner=read('public/runner.js');
  assert.ok(survie.includes("'<div class=\"jeux-cartes-grille\">'+"));
  assert.ok(survie.includes("runnerCarteHub():'')+"));
  assert.ok(survie.includes("luxMatchCarteHub():'')+'</div>'")); // SPEC 109 : 3e carte
  assert.ok(survie.includes('jeux-decor-survie'));
  assert.ok(runner.includes('jeux-decor-runner'));
  assert.ok(survie.includes('aria-hidden="true"'));
  assert.ok(runner.includes('aria-hidden="true"'));
  assert.ok(survie.includes('onclick="demarrerSurvie()"'));
  assert.ok(runner.includes('onclick="ouvrirRunner()"'));
  assert.ok(survie.includes("'<div class=\"jeux-meta\"><span><strong>'+nombre"));
  assert.ok(runner.includes('<strong>60 s</strong>'));
  assert.ok(survie.includes('À DÉBLOQUER'));
  assert.ok(survie.includes('onclick="goLessons()"'));
  assert.ok(runner.includes('BIENTÔT'));
  assert.ok(runner.includes('runnerApercuTuiles()'));
  assert.ok(runner.includes('runnerApercuPortails()'));
  assert.ok(survie.includes('Recompose les mots avant la fin du chrono'));
  assert.ok(runner.includes('Trouve le bon genre avant de franchir le portail'));
});

test('SPEC 104 : couleurs sémantiques M/F/N réservées aux tuiles HTML',()=>{
  const css=read('public/jeux-univers.css');
  assert.ok(css.includes('var(--runner-m,#2f8cff)'));
  assert.ok(css.includes('var(--runner-f,#ff3d5a)'));
  assert.ok(css.includes('var(--runner-n,#22e06b)'));
  assert.ok(css.includes('border:6px solid rgba(192,158,238,.58)'));
  assert.ok(!css.includes('background-image:url('));
});
