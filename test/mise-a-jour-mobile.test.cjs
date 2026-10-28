'use strict';
// Contrat : pas de bandeau PWA superposé aux leçons ni aux exercices.
// node --test test/mise-a-jour-mobile.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const lire = p => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');

function environnement() {
  const classes = new Set();
  const styles = {};
  const boutons = {
    action: { disabled: false, listen: null, addEventListener(_, callback) { this.listen = callback; } },
    fermer: { listen: null, addEventListener(_, callback) { this.listen = callback; } },
    reglages: { disabled: false }
  };
  const nodes = {};
  const nav = { children: [], prepend(item) {
    this.children.unshift(item);
    nodes[item.id] = item;
    nodes['hl-maj-action'] = boutons.action;
  }};
  nodes['nav-bas'] = nav;
  nodes['hl-version'] = { hidden: true };
  nodes['hl-version-bouton'] = boutons.reglages;
  const body = {
    classList: { add: k => classes.add(k), remove: k => classes.delete(k) },
    style: {
      setProperty(k, v) { styles[k] = v; },
      removeProperty(k) { delete styles[k]; }
    },
    appendChild() { throw Error('Un bandeau flottant sur body est interdit'); }
  };
  const document = {
    body,
    getElementById: id => nodes[id] || null,
    createElement() {
      return {
        id: '', className: '', innerHTML: '', removed: false,
        setAttribute() {},
        getBoundingClientRect: () => ({ height: 64 }),
        querySelector: selector => selector === '.hl-maj-action' ? boutons.action :
          selector === '.hl-maj-fermer' ? boutons.fermer : null,
        remove() { this.removed = true; delete nodes[this.id]; delete nodes['hl-maj-action']; }
      };
    }
  };
  const messages = [];
  const reg = { waiting: { postMessage: m => messages.push(m) } };
  let recharges = 0, observe = 0, disconnect = 0;
  class ResizeObserver {
    constructor(cb) { this.callback = cb; }
    observe() { observe++; this.callback(); }
    disconnect() { disconnect++; }
  }
  const contexte = { document, navigator: {}, window: { addEventListener() {} },
    location: { reload() { recharges++; } }, ResizeObserver };
  vm.createContext(contexte);
  vm.runInContext(lire('public/hors-ligne.js') + '\nthis.api = { horsLigneBandeauMaj, horsLigneAppliquerMaj };', contexte);
  return { contexte, boutons, nodes, nav, classes, styles, reg, messages,
    observe: () => observe, disconnect: () => disconnect, recharges: () => recharges };
}

test('notification PWA : rangée normale de navigation, espace réservé, boutons 44px', () => {
  const s = environnement();
  s.contexte.api.horsLigneBandeauMaj(s.reg);
  assert.equal(s.nav.children.length, 1);
  assert.equal(s.nav.children[0].id, 'hl-maj');
  assert.match(s.nav.children[0].innerHTML, /Nouvelle version prête/);
  assert.match(s.nav.children[0].innerHTML, /aria-label="Plus tard"/);
  assert.equal(s.nodes['hl-version'].hidden, false);
  assert.equal(s.classes.has('hl-maj-visible'), true);
  assert.equal(s.styles['--hl-maj-hauteur'], '64px');
  assert.equal(s.observe(), 1);
  s.contexte.api.horsLigneBandeauMaj(s.reg);
  assert.equal(s.nav.children.length, 1, 'un seul bandeau si deux updates arrivent');
  const css = lire('public/style.css');
  assert.match(css, /body\.avec-nav\.hl-maj-visible\s*\{[\s\S]*?var\(--hl-maj-hauteur/);
  assert.match(css, /\.nav-bas \.hl-maj\s*\{\s*grid-column:\s*1\s*\/\s*-1/);
  assert.doesNotMatch(css, /\.hl-maj\s*\{[^}]*position:\s*fixed/);
  assert.match(css, /\.hl-maj button\s*\{[^}]*min-height:\s*44px/);
  assert.match(css, /\.hl-version\[hidden\]\s*\{\s*display:\s*none/);
});

test('Plus tard : masque la ligne sans activer ni perdre le contrôle depuis Réglages', () => {
  const s = environnement();
  s.contexte.api.horsLigneBandeauMaj(s.reg);
  s.boutons.fermer.listen();
  assert.equal(s.nav.children[0].removed, true);
  assert.equal(s.classes.has('hl-maj-visible'), false);
  assert.equal(s.disconnect(), 1);
  assert.equal('--hl-maj-hauteur' in s.styles, false);
  assert.equal(s.nodes['hl-version'].hidden, false);
  assert.equal(s.messages.length, 0);
  s.contexte.api.horsLigneBandeauMaj(s.reg);
  assert.equal(s.nav.children.length, 1, 'une mise à jour reportée ne réouvre pas le bandeau');
  s.contexte.api.horsLigneAppliquerMaj();
  assert.equal(s.messages[0].type, 'activer'); // objet provenant du contexte VM
  assert.equal(s.boutons.reglages.disabled, true);
  assert.equal(s.recharges(), 0, 'rechargement uniquement au controllerchange');
});

test('Mettre à jour : même activation SW, double clic sans double activation', () => {
  const s = environnement();
  s.contexte.api.horsLigneBandeauMaj(s.reg);
  s.boutons.action.listen();
  s.boutons.action.listen();
  assert.equal(s.messages.length, 1);
  assert.equal(s.messages[0].type, 'activer');
  assert.equal(s.boutons.action.disabled, true);
  assert.equal(s.boutons.reglages.disabled, true);
});

test('mise à jour différée : bouton dans Réglages et version des assets renouvelée', () => {
  const html = lire('public/index.html');
  assert.match(html, /id="hl-version" class="hl-version" hidden/);
  assert.match(html, /id="hl-version-bouton".*horsLigneAppliquerMaj/);
  assert.match(html, /src="hors-ligne\.js\?v=3"/);
  assert.match(html, /href="style\.css\?v=[^"]+"/);
  assert.match(lire('public/hors-ligne.js'), /if \(cfg\.RECETTE\)/);
  assert.match(lire('public/hors-ligne.js'), /if \(cfg\.TESTS\) return;/);
  assert.match(lire('public/hors-ligne.js'), /if \(horsLigneMajDemandee\) \{ location\.reload\(\); return; \}/);
});
