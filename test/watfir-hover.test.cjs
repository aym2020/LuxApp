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
  const link='hover-interactions.css?v=watfir-hover-9';
  assert.ok(html.includes(link),'stylesheet présent');
  assert.ok(html.includes('accueil-watfir.css?v=watfir-v4-21'),'CSS de base du CTA versionné');
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
  for(const x of ['carte-suite.ac-v21-cta:hover','puce-niv:not([aria-pressed="true"]):hover','puce-niv[aria-pressed="true"]:hover','wf-activite:hover','ac-menu:hover','ac-v21-guest:hover'])
    assert.ok(css.includes(x),'hover : '+x);
  assert.match(css,/--ux-hover-cyan-wash:\s*rgba\(2,197,231,\.18\)/);
  assert.doesNotMatch(css,/@property --wf-cta-outline/,'plus de contour rouge');
});

test('CTA 3D : crème uni, relief au repos et chevron conservé',()=>{
  const block=watfir.split('/* ── CTA crème')[1].split('/* ── Deux actions secondaires')[0];
  assert.match(block,/0 7px 0 #aa8954/,'tranche visible au repos');
  assert.match(block,/inset 0 1px 0 rgba\(255,255,255,\.70\)/,'filet de lumière supérieur fin');
  assert.match(block,/background:var\(--wf-cta-cream\)/,'le bouton reste crème sans motif');
  assert.doesNotMatch(block,/linear-gradient|calc\(100% - 31\.8|var\(--wf-cyan\) 0/,'pas de bande de coin');
  assert.match(watfir,/\.wf-hero-rubans/,'rubans du hero inchangés');
  assert.match(block,/\.cs-rond \{[^}]*margin:calc\(8 \* var\(--k\)\) calc\(24 \* var\(--k\)\) 0 calc\(16 \* var\(--k\)\)/,'chevron recentré à gauche du coin');
  assert.match(block,/\.carte-suite\.ac-v21-cta:active:not\(:disabled\):not\(\[aria-disabled="true"\]\)/,'retour tactile au maintien');
  assert.match(block,/transform:translateY\(6px\)/,'enfoncement physique');
  assert.match(block,/\.carte-suite\.ac-v21-cta::after \{ content:none; \}/,'aucun calque de contour');
  assert.doesNotMatch(block,/conic-gradient|mask-composite|wf-cta-outline/,'aucun effet de bordure animé');
  assert.doesNotMatch(block,/min-height:[1-9][0-9]*px/,'aucune hauteur imposée en CSS');
});

test('CTA hover : crème plus clair uniquement, sans soulèvement ni changement du relief',()=>{
  const section=css.split('/* CTA Watfir :')[1].split('  /* Pastilles 3D')[0];
  assert.match(section,/\.carte-suite\.ac-v21-cta:hover:not\(:active\):not\(:disabled\):not\(\[aria-disabled="true"\]\)/,
    'survol souris hors appui et boutons désactivés');
  assert.match(section,/--wf-cta-cream:var\(--ux-hover-bright\)/,'face crème éclaircie');
  assert.match(css,/--ux-hover-bright:\s*#fff4da/,'teinte du hover');
  assert.match(watfir,/--wf-cta-cream:#fbebc5/,'crème initial conservé');
  assert.match(watfir,/background:var\(--wf-cta-cream\)/,
    'la face crème unie reçoit directement la couleur au hover');
  assert.doesNotMatch(section,/transform:|box-shadow:|filter:|wf-cta-outline|::after|brightness\(/,
    'ni déplacement, ni variation d\'ombre, ni filtre sur le texte');
  assert.match(watfir,/@media \(prefers-reduced-motion:reduce\) \{/);
  assert.doesNotMatch(css,/\.carte-suite\.ac-v21-cta:active[^{}]*\{[^}]*color:var\(--wf-red\)/,
    'chevron inchangé au press');
});
test('Header : A1.1, A1.2 et dropdown utilisent le même relief physique compact',()=>{
  const header=watfir.split('/* ── Header :')[1].split('/* ── Hero :')[0];
  assert.match(header,/\.puce-niv \{[^}]*--wf-pill-depth:clamp\(2px, calc\(6 \* var\(--k\)\), 4px\)/s);
  assert.match(header,/0 var\(--wf-pill-depth\) 0 var\(--wf-pill-side\)/);
  assert.match(header,/\.puce-niv\[aria-pressed="true"\]\s*\{[^}]*--wf-pill-side:#991a17/s,
    'tranche rouge sombre pour le niveau actif');
  assert.match(header,/\.wf-niveau-ouvrir\s*\{/,'le chevron reprend la classe de pastille');
  assert.match(header,/\.puce-niv:active:not\(:disabled\):not\(\[aria-disabled="true"\]\),\s*[^{}]*\.puce-niv\.wf-pressing\s*\{[^}]*transform:translateY\(calc\(var\(--wf-pill-depth\) - 1px\)\)/s,
    'un appui physique remplace le scale');
  assert.match(header,/\.puce-niv::after[^}]*height:48px/s,'grandes cibles tactiles conservées');
  // Mouvement réduit : pas d'animation, mais la face descend toujours (sinon le bas remonte).
  const reduitW=watfir.slice(watfir.lastIndexOf('@media (prefers-reduced-motion:reduce)'));
  assert.match(reduitW,/\.puce-niv,\s*[^{}]*\.carte-suite\.ac-v21-cta,\s*[^{}]*\.wf-activite \{ transition:none; \}/,
    'respect de reduced-motion');
  assert.doesNotMatch(reduitW,/wf-pressing \{ transform:none; \}/,'la face descend aussi en mouvement réduit');
});

test('Header : le survol préserve la tranche et la couleur pendant le clic maintenu',()=>{
  const styles=css.split('/* Pastilles 3D :')[1].split('  /* Deux boutons :')[0];
  assert.match(styles,/\.puce-niv:not\(\[aria-pressed="true"\]\):hover:not\(:disabled\):not\(\[aria-disabled="true"\]\)/);
  assert.match(styles,/\.puce-niv\[aria-pressed="true"\]:hover:not\(:disabled\):not\(\[aria-disabled="true"\]\)/);
  assert.match(styles,/--wf-pill-hover-outline/);
  assert.doesNotMatch(styles,/box-shadow:|hover:not\(:active\)/,
    'les hovers ne suppriment jamais les ombres 3D pendant le clic');
});

test('Étudier/Jouer : hover léger = fond seul éclairci, 3D et crème inchangés',()=>{
  const section=css.split('/* Deux boutons :')[1].split('#view-dashboard .wf-accueil .ac-menu .ic {')[0];
  assert.match(section,/\.wf-choix-activite \.wf-activite:hover:not\(:active\)/);
  assert.match(section,/background-color:var\(--wf-face-hover\)/);
  assert.doesNotMatch(section,/box-shadow:|transform:|filter:|stroke:/,
    'pas d\'élévation ou de filet cyan en hover');
  assert.doesNotMatch(css,/\.ac-v21-journey:hover/,'ancien lien supprimé des hovers');
  assert.doesNotMatch(css,/\.ac-acces \.ac-btn\.jeux:hover/,'ancien raccourci remplacé');
  assert.match(watfir,/--wf-study-hover:#ff2f2a/);
  assert.match(watfir,/--wf-play-hover:#3fd6f0/);
  assert.match(watfir,/\.wf-choix-activite \.wf-activite > b \{[^}]*color:var\(--wf-cream\)/);
  assert.match(watfir,/\.wf-choix-activite \.wf-activite:active/);
});

test('Étudier/Jouer : tranches sombres monochromes et filet de lumière limité au dessus',()=>{
  assert.match(watfir,/--wf-study-side:#8f1712/,'rouge sombre sous la face rouge');
  assert.match(watfir,/--wf-play-side:#087496/,'bleu pétrole sous la face cyan');
  const section=watfir.split('/* ── Deux actions secondaires')[1].split('/* ── Sous-menu Étudier')[0];
  assert.match(section,/box-shadow:0 5px 0 var\(--wf-side\)/,'tranche d’épaisseur 5 px');
  assert.match(section,/inset 0 1px 0 rgba\(255,255,255,\.28\)/,'fin reflet supérieur, pas une tranche crème');
  assert.match(section,/border:1px solid rgba\(255,255,255,\.10\)/,'filet neutre discret');
  assert.doesNotMatch(section,/0 5px 0 (?:#f7e9c2|#fbebc5|white)/i,'aucune tranche blanche ou crème');
  assert.match(section,/\.wf-activite:active[^{}]*\{[^}]*transform:translateY\(4px\)/s,'compression physique conservée');
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
