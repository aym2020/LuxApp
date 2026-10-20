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
  assert.match(c.accrocheHtml(), /Prêt à découvrir/);
  c.aDejaPratique = () => true;
  assert.match(c.accrocheHtml(false), /quelques minutes/);
  assert.doesNotMatch(c.accrocheHtml(false), /42\s*%/);
});
test('La progression affiche les vraies données et un indicateur accessible', () => {
  const h = contexte().chiffresHtml();
  assert.match(h, /42 %/);
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
  for(const action of ['lancerRevision()', 'openExamens()', "startSession('errors')", 'goLessons()']) {
    assert.ok(h.includes(action), action);
  }
  assert.ok(h.indexOf('Réviser') < h.indexOf('Mon chemin'));
});
