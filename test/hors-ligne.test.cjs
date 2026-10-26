'use strict';
// SPEC 93 — LuxApp hors ligne : Service Worker, manifeste et téléchargement des audios.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

test('Service Worker : version injectée, caches séparés, aucune requête non GET ni externe privée', () => {
  const sw = read('public/sw.js');
  assert.match(sw, /const VERSION = '__VERSION__';/);
  assert.match(sw, /requete\.method !== 'GET'\) return;/);
  assert.match(sw, /luxapp-audio/);
  assert.match(sw, /n\.startsWith\('luxapp-app-'\) && n !== CACHE_APP/); // anciennes versions supprimées, audios gardés
  assert.match(sw, /Firestore, authentification… : toujours le réseau/);
  assert.match(sw, /status: 206/); // lecture audio par plage
});

test('Serveur : manifeste et sw.js hors recette, désinstallation en recette', () => {
  const s = read('server.js');
  assert.match(s, /app\.get\('\/offline-manifest\.json'/);
  assert.match(s, /replace\('__VERSION__', manifesteHorsLigne\.version\)/);
  assert.match(s, /registration\.unregister\(\)/);
  assert.ok(s.indexOf("app.get('/offline-manifest.json'") < s.indexOf("app.use(express.static('public'"));
});

test('Page : enregistrement, carte Réglages et compte gardé sans Firebase', () => {
  const html = read('public/index.html'), hl = read('public/hors-ligne.js');
  assert.ok(html.indexOf('hors-ligne.js') > html.indexOf('cloud.js') && html.indexOf('hors-ligne.js') < html.indexOf('app.js'));
  assert.match(html, /id="hl-bouton"/);
  assert.match(hl, /if \(cfg\.TESTS\) return;/);
  assert.match(hl, /if \(cfg\.RECETTE\)/);
  assert.match(hl, /navigator\.storage\.persist/);
  assert.match(read('public/app.js'), /restaurerCompteHorsLigne\(\);/);
  assert.match(read('public/cloud.js'), /navigator\.onLine === false\) \{ noterSynchro\(false\); return; \}/);
  assert.match(read('public/portail.js'), /!fbAuth && typeof currentStorageProfile === 'string' && currentStorageProfile\.startsWith\('user:'\)\) return;/);
});
