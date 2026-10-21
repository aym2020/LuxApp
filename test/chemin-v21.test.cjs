'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'public/chemin.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'public/chemin-v21.css'), 'utf8');
const index = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');

function preparer({ anciennes = [], terminees = [0], active = 1, parties = [0,1,2] } = {}) {
  const liste = parties.map(id => ({ id, titre_fr: 'Leçon test ' + id }));
  const box = { innerHTML: '' };
  const c = {
    document: { getElementById: () => box, addEventListener() {} },
    window: { addEventListener() {} },
    niveauActif: 'A1.1',
    leconsActives: () => liste,
    leconEnCours: () => liste.find(l => l.id === active) || null,
    resumeRevision: () => ({ parLecon: {} }),
    acquiseAncienneVersion: l => anciennes.includes(l.id),
    leconTerminee: l => terminees.includes(l.id),
    isParcoursLecon: () => false,
    calculateLessonStats: () => ({ percent: 0 }),
    etapesFaites: () => 0,
    titreCourt: l => l.titre_fr,
    numLecon: l => l.id,
    etoiles: () => 0,
    etoilesHtml: () => '',
    escHtml: s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'),
    ICONES: { livre: 'BOOK', lecture: 'PLAY', coche: 'DONE', fleche: 'ARROW',
      cheque: '', toque: 'EXAM', chevron: 'DOWN' },
    dernierFini: null,
    console
  };
  vm.createContext(c);
  vm.runInContext(source, c, { filename: 'chemin.js' });
  c.renderLessons();
  return { html: box.innerHTML, c, box };
}

test('La composition 2.1 suit le chemin existant, sans ajouter de nouveau moteur', () => {
  assert.match(index, /href="chemin-v21.css"/);
  assert.match(styles, /#view-lessons \.chemin-tete/);
  assert.match(styles, /hero-luxapp-mobile\.webp/);
  assert.match(styles, /#view-lessons \.chemin \.pas/);
  assert.doesNotMatch(styles, /#view-dashboard/);
});

test('Le compteur, la barre et les dénominateurs viennent des vraies leçons', () => {
  const { html } = preparer({ terminees: [0], parties: [0,1,2] });
  assert.match(html, /1 \/ 3<\/strong> leçons terminées/);
  assert.match(html, /aria-valuemax="3" aria-valuenow="1"/);
  assert.match(html, /style="width:33%"/);
  assert.match(html, /chemin-avancement-barre/);
});

test('Zéro leçon terminée : aucun faux progrès en or', () => {
  const { html } = preparer({ terminees: [], parties: [0,1,2] });
  assert.match(html, /0 \/ 3<\/strong> leçons terminées/);
  assert.match(html, /style="width:0%"/);
  assert.match(html, /aria-valuenow="0"/);
});

test('Les acquis historiques ne sont pas comptés comme terminés', () => {
  const { html } = preparer({ terminees: [], anciennes: [0], parties: [0,1,2] });
  assert.match(html, /0 \/ 3<\/strong> leçons terminées/);
  assert.match(html, /1 acquise précédemment/);
  assert.match(html, /aria-valuenow="0"/);
});

test('La leçon recommandée conserve ses actions ; les suivantes restent accessibles', () => {
  const { html } = preparer();
  assert.match(html, /id="chemin-lecon-1"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /onclick="lancerActionLecon\(1\)"/);
  assert.match(html, /onclick="ouvrirTouteLaLeconDepuisChemin\(1\)"/);
  assert.match(html, /onclick="basculerLeconChemin\(2\)"/);
  assert.match(html, /chemin-noeud-vide/);
  assert.match(html, /onclick="openExamens\(\)"/);
});

test('Le rendu garde ses protections mobile et la sémantique des couleurs', () => {
  assert.match(styles, /@media \(max-width: 360px\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.pas\.fait::before/);
  assert.match(styles, /\.pas\.acquis::before/);
  assert.match(styles, /\.pas\.encours > \.rond/);
  assert.match(styles, /\.pas\.exam > \.rond/);
  assert.match(styles, /\.pas\.ouverte \.btn-jaune/);
});
