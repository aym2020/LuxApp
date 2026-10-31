'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/lux-demasque.js'),css=read('public/lux-demasque.css');
test('SPEC112 : le hub ouvre la sélection, pas une rencontre automatique',()=>{
 assert.match(js,/onclick="ldEntrerRedFlag\(\)">Jouer/); // SPEC 115 : prologue la première fois, puis la sélection
 assert.match(js,/async function ldOuvrirSelection\(options\)/);
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
 for(const x of ['lux-demasque.css?v=20','lux-demasque.js?v=20','lux-match.css?v=22','lux-match.js?v=29']) assert.ok(html.includes(x),x);
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

// Cringr est un écran avant-partie : la musique ne doit pas attendre le LIKE.
test('Cringr : musique synchronisée dès le rendu des profils, sans partie', () => {
 const selection=js.slice(js.indexOf('function ldRendreSelection()'),js.indexOf('function ldComposerPhotoProfil('));
 const synchro=js.slice(js.indexOf('function ldSynchroMusique()'),js.indexOf('function ldSon('));
 assert.match(selection,/ldSynchroMusique\(\)/);
 assert.match(synchro,/ld\.selection && ld\.selection\.items\.length \? 'enquete' : null/);
 assert.match(synchro,/p\.phase === 'bilan'/);
 assert.match(js,/LuxDemasqueSon\.musique\(null\)/);
});

test('Fonds des jeux PC : halo sur le viewport, sans rectangle autour du shell',()=>{
 const univers=read('public/jeux-univers.css'),html=read('public/index.html');
 assert.match(html,/jeux-univers\.css\?v=11/);
 assert.match(univers,/@media \(min-width:768px\) and \(forced-colors:none\)/);
 for(const nom of ['jeux','runner','luxmatch','luxdemasque'])
   assert.ok(univers.includes('body:has(#view-'+nom+'.active)'),'halo viewport '+nom);
 assert.match(univers,/#view-jeux,#view-runner,#view-luxmatch,#view-luxdemasque\s*\{\s*background:transparent;/);
});

// LD-048 / SPEC 113 §9 : « Passer » devient une petite croix arcade à gauche du cœur.
test('LD-048 : croix NOPE secondaire à gauche du cœur, même action, cible 48 px',()=>{
 const vue=js.slice(js.indexOf('function ldRendreSelection()'),js.indexOf('function ldComposerPhotoProfil('));
 const croix=vue.indexOf('class="ld-selection-passer"'),coeur=vue.indexOf('class="ld-dating-meet"');
 assert.ok(croix>0&&coeur>croix,'croix avant le cœur : ordre clavier gauche → droite');
 assert.match(vue,/class="ld-selection-passer" onclick="ldSelectionChanger\(1\)" aria-label="Passer au profil suivant"/);
 const svg=vue.indexOf('<svg viewBox="0 0 8 8"');assert.ok(svg>croix&&svg<coeur,'croix pixel 8×8 dans le bouton NOPE');
 assert.doesNotMatch(vue,/>Passer<\/button>/,'plus de lien texte « Passer »');
 const regle=css.match(/\.ld-selection-passer\{([^}]*)\}/)[1];
 assert.match(regle,/grid-column:1/);assert.match(regle,/width:48px;height:48px/);
 assert.doesNotMatch(regle,/underline/);
 assert.match(css,/\.ld-dating-meet\{[^}]*width:56px;height:56px/,'cœur inchangé');
 assert.match(js,/if \(dx > 0\) ldSelectionConfirmer\(\)/);assert.match(js,/else ldSelectionChanger\(1\); \/\/ NOPE/);
 assert.match(js,/Math\.abs\(dx\) > 65/);
});

// SPEC 115 : prologue « Le téléphone vibre » avant Cringr (contrat statique ; parcours dans tests/test_lux_demasque_prologue.py).
test('SPEC 115 : prologue une fois, passable, sur le renderer partagé, sans toucher au jeu',()=>{
 const m3d=read('public/lux-match-3d.js'),audio=read('public/lux-demasque-audio.js');
 assert.match(js,/function ldEntrerRedFlag\(\) \{ return ldOuvrirSelection\(ldPrologueVu\(\) \? undefined : \{ prologue: true \}\); \}/);
 assert.match(js,/const LD_PROLOGUE_CLE = 'luxDemasquePrologueVuV1'/);
 for(const cle of ['luxDemasqueResolus','luxDemasqueRecord','ldSwipeVu'])assert.notEqual(cle,'luxDemasquePrologueVuV1');
 assert.match(js,/modele: 'Casual3_Female'/);
 for(const t of ['Alors, prête pour ton date de ce soir ? 👀','Pas encore trouvé avec qui !','Ouvrir Cringr','Passer l’intro','Revoir l’introduction','De nouveaux profils t’attendent ♥'])assert.ok(js.includes(t),t);
 assert.match(js,/n \+ ' profils à découvrir ♥'/,'chiffre réel, jamais « 4 » figé');
 assert.doesNotMatch(js,/'4 profils/);
 assert.match(js,/\(ld\.partie \|\| ld\.selection \|\| ld\.prologue\)\) luxDemasqueArreter\(\)/);
 assert.equal((m3d.match(/new THREE\.WebGLRenderer/g)||[]).length,1,'aucun second renderer');
 assert.match(m3d,/async function prologue\(cible, profil, rappels\)/);
 assert.match(m3d,/Promise\.resolve\(\)\.then\(fin\)/,'fin() hors de l’image en cours');
 assert.match(m3d,/return \{[^}]*prologue \}/);
 assert.equal((audio.match(/new \(window\.AudioContext/g)||[]).length,1,'un seul AudioContext');
 assert.match(audio,/vibre: \(\) =>/);assert.match(audio,/message: \(\) =>/);
 assert.match(css,/\.ld-jeu\[data-ecran="prologue"\] \.ld-prologue-passer\{[^}]*min-height:48px/);
});
