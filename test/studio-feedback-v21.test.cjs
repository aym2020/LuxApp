'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'public');
const script = fs.readFileSync(path.join(root, 'studio.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const first = script.indexOf('function studioRenderMission()');
const last = script.indexOf('function studioFinirMission()', first);
assert.ok(first >= 0 && last > first, 'Fonctions du studio retrouvées');
const extract = script.slice(first, last);

function setup({ wrong = false, step = 0 } = {}) {
  const defs = Array.from({length:8}, () => ({
    type: 'verification', titre: 'Ce script est-il correct ?',
    script: 'en Stull', indice: 'SCRIPT À VÉRIFIER',
    choix: ['Correct', 'À corriger'], reponse: 'À corriger',
    explication: 'Devant S, le N tombe.', correction: 'e Stull'
  }));
  const body = {
    innerHTML: '', scrollTop: 180,
    classList: {remove() {}},
    insertAdjacentHTML(where, value) {
      assert.equal(where, 'beforeend');
      this.innerHTML += value;
    },
    getBoundingClientRect: () => ({top: 250, bottom: 750}),
    querySelector(selector) {
      if (selector !== '.studio-feedback' || !this.innerHTML.includes('studio-feedback')) return null;
      return {getBoundingClientRect: () => ({top: 650, bottom: 850})};
    }
  };
  const footer = {
    innerHTML: '',
    classList: {remove() {}}
  };
  const counter = {textContent:''};
  const progress = {style:{width:''}};
  const elems = {'ms-body':body,'ms-reponse':footer,'ms-compteur':counter,'ms-piste':progress};
  let livesLost=0, stops=0;
  const frames=[];
  const state = {
    ms: {radio:true,idx:step,resultats:[],vies:3},
    pLecon: {id:0},
    document: {getElementById: id=>elems[id]},
    studioDefis: () => defs,
    escHtml: v => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;'),
    perdreVie() { livesLost++; state.ms.vies--; },
    arreterAudio() { stops++; },
    requestAnimationFrame(fn) { frames.push(fn); }
  };
  const functions = new Function('scope', 'with(scope) { ' + extract +
    '; return { studioRenderMission, studioChoisir, studioSuivant }; }')(state);
  return {functions,state,body,footer,counter,progress,frames,
    get livesLost(){return livesLost},get stops(){return stops}};
}

test('Avant réponse, les choix sont affichés et la question repart du haut', () => {
  const c=setup();
  c.functions.studioRenderMission();
  assert.match(c.footer.innerHTML, /studio-choix/);
  assert.match(c.footer.innerHTML, /studio-option/);
  assert.equal(c.body.scrollTop,0);
  assert.doesNotMatch(c.body.innerHTML,/studio-feedback/);
});

test('Après réponse juste, le feedback remplace les choix et devient visible', () => {
  const c=setup();
  c.functions.studioRenderMission();
  c.functions.studioChoisir(1);
  assert.equal(c.state.ms.resultats[0],'ok');
  assert.equal(c.livesLost,0);
  assert.equal(c.stops,1);
  assert.match(c.body.innerHTML,/✓ Exact !/);
  assert.match(c.body.innerHTML,/Ton choix : <strong>À corriger<\/strong>/);
  assert.match(c.body.innerHTML,/Forme correcte : <\/b>e Stull/);
  assert.doesNotMatch(c.footer.innerHTML,/studio-option/);
  assert.match(c.footer.innerHTML,/studio-suivant/);
  assert.match(c.footer.innerHTML,/Continuer/);
  assert.equal(c.frames.length,1);
  c.frames.shift()();
  assert.equal(c.body.scrollTop,390);
});

test('Réponse fausse : une seule vie perdue et bonne réponse consultable', () => {
  const c=setup();
  c.functions.studioRenderMission();
  c.functions.studioChoisir(0);
  assert.equal(c.state.ms.resultats[0],'erreur');
  assert.equal(c.state.ms.vies,2);
  assert.equal(c.livesLost,1);
  assert.match(c.body.innerHTML,/✕ Pas encore/);
  assert.match(c.body.innerHTML,/Ton choix : <strong>Correct<\/strong>/);
  assert.match(c.body.innerHTML,/Réponse attendue : <strong>À corriger<\/strong>/);
  assert.doesNotMatch(c.footer.innerHTML,/studio-choix/);
  c.functions.studioChoisir(1);
  assert.equal(c.livesLost,1,'un deuxième appui ne peut réattribuer des points');
});

test('Continuer rend les choix du prochain défi et réinitialise son scroll', () => {
  const c=setup();
  c.functions.studioRenderMission();
  c.functions.studioChoisir(1);
  c.functions.studioSuivant();
  assert.equal(c.state.ms.idx,1);
  assert.equal(c.body.scrollTop,0);
  assert.match(c.footer.innerHTML,/studio-choix/);
  assert.doesNotMatch(c.footer.innerHTML,/studio-suivant/);
  assert.doesNotMatch(c.body.innerHTML,/studio-feedback/);
  c.frames.shift()();
  assert.equal(c.body.scrollTop,0,'un frame de correction périmé ne décale pas le défi suivant');
});

test('Dernier défi : le CTA reste Voir mon résultat', () => {
  const c=setup({step:7});
  c.functions.studioRenderMission();
  c.functions.studioChoisir(1);
  assert.match(c.footer.innerHTML,/Voir mon résultat/);
  assert.doesNotMatch(c.footer.innerHTML,/studio-option/);
});

test('Le scroll et le bloc correction restent dans la mission seulement', () => {
  assert.match(styles, /#view-mission \.ms-body\s*\{[^}]*overflow-y: auto/);
  assert.match(styles, /#view-mission \.studio-feedback \.studio-recap/);
  assert.match(styles, /#view-mission \.studio-suivant \{ margin-top: 0; min-height: 54px; \}/);
  assert.doesNotMatch(extract, /scrollIntoView\(/);
});
