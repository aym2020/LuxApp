'use strict';
// node --test test/intro-unite-v21.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('public/intro-unite-v21.css');
const html = read('public/index.html');
const parcours = read('public/parcours.js');
const style = read('public/style.css');

function rule(selector) {
  const key = selector + ' {';
  const a = css.indexOf(key);
  assert.ok(a >= 0, 'Règle CSS manquante : ' + selector);
  const b = css.indexOf('}', a);
  assert.ok(b > a);
  return css.slice(a + key.length, b);
}

test('Le CSS de l’introduction est chargé après les styles communs', () => {
  const common = html.indexOf('href="style.css"');
  const scoped = html.indexOf('href="intro-unite-v21.css"');
  assert.ok(common >= 0 && scoped > common);
  assert.match(html, /id="view-pintro"/);
});

test('La règle pédagogique est éditoriale : aucun fond brun ni encadré', () => {
  const block = rule('#view-pintro .pi-regle');
  assert.match(block, /background:\s*transparent/);
  assert.match(block, /border:\s*0/);
  assert.match(block, /border-radius:\s*0/);
  assert.match(css, /#view-pintro \.pi-regle-txt b/);
  assert.match(css, /color:\s*var\(--couleur-action\)/);
});

test('ATTENTION : seulement un filet orange, sans grosse carte', () => {
  const block = rule('#view-pintro .pi-piege');
  assert.match(block, /background:\s*transparent/);
  assert.match(block, /border-left:\s*3px solid var\(--couleur-orange\)/);
  assert.match(block, /border-radius:\s*0/);
  assert.match(css, /#view-pintro \.pi-piege-txt b/);
  assert.match(css, /line-height:\s*1\.45/);
});

test('Espacements modérés, sans toucher au lexique ni aux exemples', () => {
  assert.match(rule('#view-pintro .pi-content'), /gap:\s*\.4rem/);
  assert.match(rule('#view-pintro .pi-titre'), /margin-bottom:\s*\.2rem/);
  assert.match(rule('#view-pintro .pi-phrase'), /margin-bottom:\s*\.4rem/);
  assert.doesNotMatch(css, /#view-pintro \.pi-mots(?:\s|\{|,)/);
  assert.doesNotMatch(css, /#view-pintro \.pi-mot(?:\s|\{|,)/);
  assert.doesNotMatch(css, /#view-pintro \.pi-phrases(?:\s|\{|,)/);
  assert.doesNotMatch(css, /#view-pintro \.cta-fixe(?:\s|\{|,)/);
  assert.doesNotMatch(css, /#view-pintro #pi-cta/);
});

test('Le contenu pédagogique et les actions de l’écran sont conservés', () => {
  assert.match(parcours, /class="pi-phrase"/);
  assert.match(parcours, /class="pi-regle"/);
  assert.match(parcours, /class="pi-regle-txt"/);
  assert.match(parcours, /class="pi-regle-ex"/);
  assert.match(parcours, /class="pi-piege"/);
  assert.match(parcours, /class="pi-piege-txt"/);
  assert.match(parcours, /class="pi-mots"/);
  assert.match(parcours, /class="pi-phrases"/);
  assert.match(parcours, /document\.getElementById\('pi-cta'\)\.innerHTML/);
  assert.match(parcours, /onclick="startUnite\('/);
  assert.match(html, /id="pi-cta"/);
  assert.match(style, /#view-pintro \.pi-content\s*\{[\s\S]*?overflow-y:\s*auto/);
});

test('Aucun sélecteur ne déborde sur une autre vue', () => {
  const selectors = css.match(/(?:^|\})\s*([^{}]+)\{/gm) || [];
  for (const raw of selectors) {
    const selector = raw.replace(/^\}/,'').replace(/\{$/,'').trim();
    if (selector.startsWith('@')) continue;
    assert.ok(selector.startsWith('#view-pintro '), 'Sélecteur hors écran : ' + selector);
  }
  assert.match(css, /@media \(max-width:\s*380px\)/);
});
