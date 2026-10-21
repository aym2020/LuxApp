'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ancien = fs.readFileSync(path.join(__dirname, '..', 'public', 'accueil.js'), 'utf8');
const nouveau = fs.readFileSync(path.join(__dirname, '..', 'public', 'accueil-v21.js'), 'utf8');

function contexte() {
  const c = {
    document: { addEventListener() {} },
    niveauActif: 'A1.1',
    niveauxDisponibles: () => ['A1.1', 'A1.2'],
    isCloudEnabled: () => false,
    etatSynchro: () => null,
    progressionNiveau: () => ({ pourcent:42, terminees:4, nbLecons:16, anciennes:1 }),
    serieActuelle: () => 7,
    aDejaPratique: () => true,
    escHtml: s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),
    numLecon: () => 6,
    titreCourt: () => 'Les nationalités',
    detailPas: () => 'Unité 2 · Présenter',
    detailPasCourt: () => 'Unité 2',
    niveauSuivant: () => 'A1.2',
    console
  };
  vm.createContext(c);
  vm.runInContext(ancien, c, { filename:'accueil.js' });
  vm.runInContext(nouveau, c, { filename:'accueil-v21.js' });
  return c;
}

test('L’accueil conserve les puces, le menu et le titre de marque', () => {
  const h = contexte().enteteAccueilHtml();
  assert.match(h, /LuxApp/);
  assert.match(h, /Lëtzebuergesch/);
  assert.match(h, /ac-menu/);
  assert.match(h, /A1\.1/);
  assert.match(h, /A1\.2/);
});
test('Moien affiche un message adapté au premier lancement', () => {
  const c = contexte();
  c.aDejaPratique = () => false;
  assert.match(c.accrocheHtml(), /Une nouvelle langue commence ici/);
  c.aDejaPratique = () => true;
  assert.match(c.accrocheHtml(false), /quelques minutes/);
  assert.doesNotMatch(c.accrocheHtml(false), /42\s*%/);
});
test('La progression affiche les vraies données et un indicateur accessible', () => {
  const h = contexte().chiffresHtml();
  assert.match(h, /42(?:<[^>]+>)* %/); // valeur et unité séparées par le balisage V2.1
  assert.match(h, /aria-valuenow="42"/);
  assert.match(h, /style="width:42%"/);
  assert.match(h, /id="serie"/);
  assert.match(h, /4 \/ 16 leçons terminées/);
  assert.match(h, /\+1 acquise précédemment/);
});
test('Le bouton principal conserve la reprise et le démarrage', () => {
  const c = contexte();
  const p = {lecon:{id:6},type:'unite',unite:{id:2,titre:'Présenter'}};
  assert.match(c.carteSuiteHtml(p,false), /suivreProchainPas\(\)/);
  assert.match(c.carteSuiteHtml(p,false), /ac-v21-cta/);
  assert.match(c.carteSuiteHtml(p,false), /Leçon 6 · Les nationalités/);
  assert.match(c.carteSuiteHtml(p,false), /Unité 2/);
  assert.match(c.carteSuiteHtml(p,true), /onclick="commencer\(\)"/);
});
test('Le niveau terminé laisse explicitement le choix', () => {
  const h = contexte().carteSuiteHtml(null,false);
  assert.match(h, /ac-v21-cta/);
  assert.match(h, /passerAuNiveau\('A1\.2'\)/);
});
test('Les quatre actions et la navigation existante restent disponibles', () => {
  const h = contexte().accesHtml({etat:'rien'});
  assert.equal((h.match(/class="ac-btn /g)||[]).length,4);
  for(const action of ['openReviewSetup()', 'openExamens()', "startSession('errors')", 'goLessons()']) {
    assert.ok(h.includes(action), action);
  }
  assert.ok(h.indexOf("S'entraîner") < h.indexOf('Voir mon chemin'));
  assert.doesNotMatch(h, /à revoir|à finir|>Fait</);
  assert.match(h, /ac-v21-actions/);
  assert.match(h, /ac-v21-journey/);
});

test('Les deux photos du hero sont des WebP compacts, bien branchés dans le CSS', () => {
  const style = fs.readFileSync(path.join(__dirname, '..', 'public', 'accueil-v21.css'), 'utf8');
  for (const [filename, maxBytes] of [
    ['hero-luxapp-mobile.webp', 80000],
    ['hero-luxapp-fhd.webp', 250000]
  ]) {
    const file = fs.readFileSync(path.join(__dirname, '..', 'public', 'art', filename));
    assert.equal(file.toString('ascii', 0, 4), 'RIFF');
    assert.equal(file.toString('ascii', 8, 12), 'WEBP');
    assert.ok(file.length < maxBytes, filename + ' doit rester optimisé');
    assert.ok(style.includes(filename), filename + ' doit être chargé dans le hero');
  }
  assert.doesNotMatch(style, /lux-city\.svg/);
});

test('Mode invité compact : accès connexion conservé, inscription toujours proposée dans le portail', () => {
  const c = contexte();
  c.isCloudEnabled = () => true;
  c.fbAuth = { currentUser: null };
  const h = c.enteteAccueilHtml();
  assert.match(h, /ac-v21-controls/);
  assert.match(h, /ac-v21-guest/);
  assert.match(h, /Mode invité/);
  assert.match(h, /Connexion/);
  assert.match(h, /ouvrirCompteDepuisAccueil\(\\?'signin\\?'\)/);
  assert.match(c.ligneCompteHtml(), /signup/);
});
test('Mode connecté : aucun appel à la connexion dans l’en-tête', () => {
  const c = contexte();
  c.isCloudEnabled = () => true;
  c.fbAuth = { currentUser: {uid:'test'} };
  const h = c.enteteAccueilHtml();
  assert.doesNotMatch(h, /ac-v21-guest/);
  assert.match(h, /puces-niveau/);
});
test('Le hero est un élément décoratif, pas un fond photographique derrière toute la page', () => {
  const h = contexte().accrocheHtml(true);
  assert.match(h, /ac-hero-image" aria-hidden="true"/);
  assert.match(h, /ac-hero-overlay" aria-hidden="true"/);
  assert.match(h, /Moien/);
  const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'accueil-v21.css'), 'utf8');
  assert.match(css, /-webkit-mask-image/);
  assert.match(css, /#view-dashboard \.ac-hero-image/);
  assert.match(css, /#view-dashboard \.ac-v21-controls/);
  assert.match(css, /#view-dashboard \.ac-v21-cta/);
  assert.match(css, /#view-dashboard \.ac-acces/);
});
