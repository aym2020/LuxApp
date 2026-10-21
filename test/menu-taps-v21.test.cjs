'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../public/accueil.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

// Ne charger que le moteur du menu, sans init de l'app ni données utilisateur.
const begin = source.indexOf('function ouvrirPlus()');
const end = source.indexOf('// ─── APRÈS UNE SYNCHRONISATION', begin);
assert.ok(begin !== -1 && end > begin);
const engine = source.slice(begin, end);

function simulation() {
  const elements = new Map();
  let timestamp = 1000;
  let garde = 0;
  let calculs = 0;
  const roue = { getBoundingClientRect: () => ({ left: 340, right: 390, top: 80, bottom: 124 }) };
  const document = {
    getElementById: id => elements.get(id) || null,
    querySelector: selector => selector === '#view-dashboard.active .ac-menu' ? roue : null,
    addEventListener() {},
    createElement(tag) {
      return {
        tag, id: '', attributes: {}, events: {}, innerHTML: '',
        addEventListener(name, handler) { this.events[name] = handler; },
        setAttribute(name, value) { this.attributes[name] = value; },
        getAttribute(name) { return this.attributes[name] || null; },
        remove() { elements.delete(this.id); },
        clickAt(clientX, clientY) { this.events.click({ clientX, clientY }); }
      };
    },
    body: { append(...nodes) { nodes.forEach(node => elements.set(node.id, node)); } }
  };
  const context = {
    document,
    Date: { now: () => timestamp },
    ICONES: { loupe: 'L', alerte: 'A', reglages: 'R' },
    compterUnitesTerminees: () => { calculs++; return 3; },
    compterAcquisesAncienneVersion: () => 0,
    leconsActives: () => [],
    missionReussie: () => false,
    totalJours: () => 4,
    etatSynchro: () => null,
    escHtml: String,
    programmerGarde: () => { garde++; }
  };
  const app = new Function('context',
    'with (context) { ' + engine + '; return { ouvrirPlus, ouvrirPanneau, fermerPanneau }; }'
  )(context);
  return {
    app,
    elements,
    setTime(value) { timestamp = value; },
    get calculs() { return calculs; },
    get garde() { return garde; }
  };
}

test('Double appui sur la roue : panneau unique, sans recalcul ni duplication', () => {
  const s = simulation();
  s.app.ouvrirPlus();
  const first = s.elements.get('panneau');
  assert.ok(first);
  s.app.ouvrirPlus();
  assert.equal(s.elements.get('panneau'), first);
  assert.equal(s.calculs, 1);
  assert.equal(s.garde, 1);
});

test('Le voile ne referme pas Plus si le tap revient sur la roue', () => {
  const s = simulation();
  s.app.ouvrirPlus();
  const voile = s.elements.get('voile');
  s.setTime(1500); // protection du point d'appui même après animation
  voile.clickAt(365, 102);
  assert.ok(s.elements.get('panneau'));
});

test('Un tap parasite immédiat est ignoré, mais le voile ferme normalement ensuite', () => {
  const s = simulation();
  s.app.ouvrirPlus();
  const voile = s.elements.get('voile');
  s.setTime(1120);
  voile.clickAt(140, 400);
  assert.ok(s.elements.get('panneau'));
  s.setTime(1600);
  voile.clickAt(140, 400);
  assert.equal(s.elements.has('panneau'), false);
  assert.equal(s.elements.has('voile'), false);
  s.app.ouvrirPlus();
  assert.ok(s.elements.get('panneau'));
});

test('Protection limitée au menu Plus : les autres feuilles peuvent être remplacées', () => {
  const s = simulation();
  s.app.ouvrirPanneau('Mission A', 'Scénario de la mission');
  const first = s.elements.get('panneau');
  s.app.ouvrirPanneau('Mission B', 'Scénario de la mission');
  assert.notEqual(s.elements.get('panneau'), first);
  assert.equal(s.elements.get('panneau').innerHTML, 'Mission B');
});

test('Réglages et panneau sans translation au premier frame', () => {
  assert.match(css, /#view-dashboard \.anime \.ac-ent \{ animation: none; \}/);
  const start = css.indexOf('.panneau {');
  const end = css.indexOf('.panneau .poignee', start);
  const panel = css.slice(start, end);
  assert.ok(start > -1 && end > start);
  assert.match(panel, /animation: fondu \.16s ease-out/);
  assert.doesNotMatch(panel, /animation:\s*monte/);
});
