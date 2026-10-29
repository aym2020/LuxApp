'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/lux-demasque.js'),css=read('public/lux-demasque.css');
test('SPEC112 : le hub ouvre la sélection, pas une rencontre automatique',()=>{
 assert.match(js,/onclick="ldOuvrirSelection\(\)">Jouer/);
 assert.match(js,/async function ldOuvrirSelection\(\)/);
 assert.match(js,/function ldRendreSelection\(\)/);
 assert.match(js,/ld\.donnees\.dossiers\.concat\(ld\.donnees\.dossiersRediges \|\| \[\]\)/);
 assert.match(js,/NOUVEAU PROFIL/);
 assert.match(js,/DÉJÀ DÉMASQUÉ/);
 assert.match(js,/ldEchapper\(npc\.accrocheFr\)/);
 assert.match(js,/onclick="ldSelectionConfirmer\(\)"/);
});
test('SPEC113 : les commandes de sélection préservent le moteur et la génération',()=>{
 const section=js.slice(js.indexOf('function ldSelectionChanger('),js.indexOf('async function ouvrirLuxDemasque('));
 assert.ok(section.length>1400);
 assert.match(section,/Math\.abs\(dx\) > 65/);
 assert.match(section,/pointercancel/);
 assert.match(section,/lostpointercapture/);
 assert.match(section,/!e\.isPrimary/);
 assert.doesNotMatch(section,/LuxDemasqueCore\.nouvellePartie/);
 assert.match(js,/LuxDemasqueCore\.nouvellePartie\(ld\.donnees, ldChoisirDossier\(dossierId\)\)/);
 assert.match(js,/function ldNouveauDossier\(\)/);
});
test('SPEC112 : CSS scope, scripts versions et Lux Match restauré',()=>{
 assert.match(css,/\.ld-jeu\[data-ecran="selection"\]/);
 assert.match(css,/touch-action:pan-y/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 const html=read('public/index.html'),jeux=read('public/jeux-v21.js');
 for(const x of ['lux-demasque.css?v=18','lux-demasque.js?v=17','lux-match.css?v=22','lux-match.js?v=28']) assert.ok(html.includes(x),x);
 assert.match(jeux,/luxMatch:\s*false,\s*luxDemasque:\s*true/);
});

test('SPEC 112 V2 : profil dating, titre centré et microcopy',()=>{const s=js.slice(js.indexOf('function ldRendreSelection()'),js.indexOf('function ldPreparerPortraitSelection('));for(const w of ['BUREAU DES ENQUÊTES','Choisis ton affaire','DOSSIER N°','À ENQUÊTER','Ouvrir ce dossier','Affaire inédite'])assert.ok(!s.includes(w),w);for(const w of ['ld-dating-phone','Voir le profil','DÉJÀ DÉMASQUÉ','Nouveau profil','ld-selection-carte'])assert.ok(s.includes(w),w);assert.match(js,/ld-top-selection/);assert.match(css,/grid-template-columns:48px minmax\(0,1fr\) 48px/)});

test('SPEC112 V3 : téléphone complet, carte immersive et CTA de rencontre',()=>{
 const view=js.slice(js.indexOf('function ldRendreSelection()'),js.indexOf('function ldPreparerPortraitSelection('));
 for(const x of ['ld-dating-phone','ld-dating-screen','ld-dating-status','ld-dating-island','ld-dating-appbar','ld-dating-brand','ld-dating-controls' ,'ld-dating-meet'])assert.ok(view.includes(x),x);
 assert.ok(view.includes('ld-selection-carte'), 'le swipe d’origine est conservé');
 assert.ok(!view.includes('ld-selection-intro')&&!view.includes('ld-btn-or'),'aucune fiche ni CTA jaune externe');
 assert.match(css,/\.ld-selection-image-zone\s*\{[\s\S]*?position:absolute/);
 assert.match(css,/\.ld-selection-infos\s*\{[\s\S]*?position:relative/);
});

test('Red Flag et Cringr, sans flèches de sélection',()=>{
 const section=js.slice(js.indexOf('function ldRendreSelection()'),js.indexOf('function ldPreparerPortraitSelection('));
 assert.match(js,/<h2 id="jeux-ld-titre">Red Flag<\/h2>/);
 assert.match(js,/RED <i>FLAG<\/i>/);
 assert.match(section,/ld-dating-brand">cringr/);
 assert.doesNotMatch(section,/ld-dating-round/);
 assert.match(section,/ld-dating-meet/);
 assert.match(js,/function ldSelectionCoachmark/);
 assert.match(css,/ld-swipe-demo/);
});

test('SPEC 112 portraits narratifs du vrai modèle de date',()=>{assert.match(js,/ldComposerPhotoProfil/);assert.match(js,/m\.portrait\(npc/);assert.match(js,/profil-photo:/);assert.doesNotMatch(js.slice(js.indexOf('function ldRendreSelection()'),js.indexOf('function ldComposerPhotoProfil(')),/ld-photo-swipe|SWIPE/);for(const id of ['milo','noah','tom','ville'])assert.ok(read('public/art/cringr-'+id+'.svg').includes('<svg'));});

test('SPEC 113 : carte sans marge artificielle, texte bitmap, CTA arcade',()=>{
 const section=css.slice(css.indexOf('/* SPEC 113 — Cringr'));
 assert.ok(section.includes('justify-content:flex-end'));
 assert.match(section,/\.ld-selection-infos\s*\{[^}]*margin:0/);
 assert.doesNotMatch(section,/margin-top:clamp/);
 assert.match(section,/\.ld-selection-description\s*\{[^}]*var\(--ld-lecture\)/);
 assert.match(section,/\.ld-dating-meet\s*\{[^}]*border-radius:8px/);
 assert.match(section,/content:"NOPE"/);
 assert.match(section,/content:"LIKE"/);
 assert.ok(fs.statSync(path.join(root,'public/fonts/vt323-latin-400-normal.woff2')).size>1000);
 const view=js.slice(js.indexOf('function ldRendreSelection()'),js.indexOf('function ldComposerPhotoProfil('));
 assert.doesNotMatch(view,/ld-photo-swipe|PRÉCÉDENT|SUIVANT/);
 assert.match(js,/if \(dx > 0\) ldSelectionConfirmer\(\)/);
});
