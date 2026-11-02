/* Contrats de l'interaction souris Watfir / LuxApp 2.2.
 * Exécution : node --test test/watfir-hover.test.cjs */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/hover-interactions.css');
const html=read('public/index.html');
const watfir=read('public/accueil-watfir.css');

test('Le système commun est chargé après tous les styles applicatifs',()=>{
  const link='hover-interactions.css?v=watfir-hover-3';
  assert.ok(html.includes(link),'stylesheet présent');
  assert.ok(html.indexOf(link)>html.indexOf('expression-ecrite-v21.css'),'en dernier dans les CSS des écrans');
  assert.ok(html.indexOf(link)<html.indexOf('</head>'),'dans le head');
});

test('Hovers réservés aux souris et trackpads, sans effet permanent',()=>{
  assert.match(css,/@media\s*\(hover:hover\)\s*and\s*\(pointer:fine\)/);
  const pos=css.indexOf('@media (hover:hover) and (pointer:fine)');
  assert.ok(css.indexOf('.ux-hover-tile',pos)>pos);
  assert.ok(css.indexOf('.carte-suite.ac-v21-cta:hover',pos)>pos);
  assert.doesNotMatch(css,/@keyframes|animation:\s*[^;]*infinite/,'aucune animation en boucle');
});

test('Recettes partagées, sans recoloration des états pédagogiques',()=>{
  for(const cls of ['ux-hover-lift','ux-hover-tile','ux-hover-chip','ux-hover-link','ux-hover-icon','ux-hover-arrow','ux-hover-glyph'])
    assert.ok(css.includes('.'+cls),'classe '+cls);
  for(const cls of ['pc-btn','btn-jaune','pc-chip','pc-icon-btn','back-btn','exo-cta','exo-secondaire'])
    assert.ok(css.includes('.'+cls),'composant '+cls);
  assert.ok(css.includes('not([aria-disabled="true"])'));
  assert.ok(css.includes('hover:not(:active)'),'ne concurrence pas le feedback d\'appui');
  assert.doesNotMatch(css,/\.choice:hover|\.ex-blank:hover|\.survie-jeu/,'pas de modification des mécaniques de questions et jeux');
});

test('Accueil Watfir : tous les contrôles prioritaires reçoivent un hover',()=>{
  for(const x of ['carte-suite.ac-v21-cta:hover','puce-niv:not([aria-pressed="true"]):hover','puce-niv[aria-pressed="true"]:hover','ac-acces .ac-btn:hover','ac-v21-journey:hover','ac-menu:hover','ac-v21-guest:hover'])
    assert.ok(css.includes(x),'hover : '+x);
  assert.match(css,/--ux-hover-cyan-wash:\s*rgba\(2,197,231,\.18\)/);
  assert.match(css,/@property --wf-cta-outline\s*\{/);
});

test('CTA 3D : relief au repos, chevron éloigné du motif et bandes intactes',()=>{
  const block=watfir.split('/* ── CTA crème')[1].split('/* ── Quatre raccourcis')[0];
  assert.match(block,/0 7px 0 #aa8954/,'tranche visible au repos');
  assert.match(block,/inset 0 2px 0 rgba\(255,255,255,\.78\)/,'lumière de surface');
  assert.match(block,/var\(--wf-red\) 0 calc\(100% - 31\.8 \* var\(--k\)\)/,'bande rouge inchangée');
  assert.match(block,/var\(--wf-cyan\) 0/,'bande cyan inchangée');
  assert.match(block,/\.cs-rond \{[^}]*margin:calc\(8 \* var\(--k\)\) calc\(24 \* var\(--k\)\) 0 calc\(8 \* var\(--k\)\)/,'chevron recentré à gauche du coin');
  assert.match(block,/\.carte-suite\.ac-v21-cta:active:not\(:disabled\):not\(\[aria-disabled="true"\]\)/,'retour tactile au maintien');
  assert.match(block,/transform:translateY\(6px\)/,'enfoncement physique');
  assert.match(block,/pointer-events:none/,'contour non interactif');
  assert.match(block,/mask-composite:exclude/,'bordure annulaire');
  assert.match(block,/--wf-cta-outline:359deg/,'angle compatible conic-gradient');
  assert.doesNotMatch(block,/min-height:[1-9][0-9]*px/,'aucune hauteur imposée en CSS');
});

test('CTA hover : liseré rouge progressif maintenu pendant active, sans fond doré',()=>{
  const rule=css.split('/* CTA Watfir :')[1].split('  #view-dashboard .wf-accueil .puce-niv {')[0];
  assert.match(css,/@property --wf-cta-outline\s*\{[^}]*inherits:\s*true/,'la valeur animée atteint ::after');
  assert.match(rule,/\.carte-suite\.ac-v21-cta:hover:not\(:disabled\):not\(\[aria-disabled="true"\]\)\s*\{/,'hover valable aussi pendant active');
  assert.match(rule,/--wf-cta-outline:359deg/,'contour affiché');
  assert.match(rule,/\.carte-suite\.ac-v21-cta:hover:not\(:active\)/,'élévation seulement hors appui');
  assert.match(rule,/transform:translateY\(-2px\)/);
  assert.doesNotMatch(rule,/cta-gold|cta-surface|#ffe0aa|brightness\(/,'fond crème stable');
  assert.match(watfir,/@media \(prefers-reduced-motion:reduce\) \{/);
  assert.match(css,/#view-dashboard \.wf-accueil \.carte-suite\.ac-v21-cta:active/,'mobile : chevron coloré au press');
});

test('Quatre raccourcis : cyan au hover, crème au repos, sans changement de layout',()=>{
  const section=css.split('#view-dashboard .wf-accueil .ac-acces .ac-btn {')[1]
    .split('/* Bas de page')[0];
  assert.match(section,/background-color:var\(--ux-hover-cyan-wash\)/);
  assert.match(section,/box-shadow:inset 0 -2px 0 var\(--ux-hover-cyan\)/);
  assert.match(section,/\.ac-btn\.jeux:hover[^}]+> \.ic:first-child\s*\{/);
  assert.match(section,/color:var\(--ux-hover-cyan\)/);
  assert.doesNotMatch(section,/grid-template|padding:|width:|height:/);
});

test('Jeux devient crème et garde son épaisseur de trait validée',()=>{
  assert.match(watfir,/\.ac-btn\.jeux > \.ic:first-child\s*\{[^}]*stroke-width:1\.8/s);
  assert.match(css,/\.ac-btn\.jeux > \.ic:first-child\s*\{[^}]*color:var\(--wf-cream,#f7e9c2\)/s);
  assert.ok(css.indexOf('color:var(--wf-cream,#f7e9c2)')<css.indexOf('@media (hover:hover)'),'crème également sur mobile');
});

test('Accessibilité clavier et mouvement réduit conservés',()=>{
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media\s*\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/transition:none!important/);
  assert.match(css,/transform:none!important/);
  assert.doesNotMatch(css,/(?:min-height|grid-template-columns|margin):/,'le système ne modifie pas la géométrie');
});

test('Feuille CSS syntaxiquement équilibrée',()=>{
  const source=css.replace(/\/\*[\s\S]*?\*\//g,'');
  let level=0;
  for(const c of source) {if(c==='{')level++;else if(c==='}') {level--;assert.ok(level>=0,'pas de fermeture inattendue');}}
  assert.equal(level,0);
});
