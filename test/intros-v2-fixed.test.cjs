'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, '..', 'public');
const css = fs.readFileSync(path.join(publicDir, 'style.css'), 'utf8');
const mission = fs.readFileSync(path.join(publicDir, 'mission.js'), 'utf8');
const parcours = fs.readFileSync(path.join(publicDir, 'parcours.js'), 'utf8');
const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

function sourceEntre(source, debut, fin) {
  const a = source.indexOf(debut);
  const b = source.indexOf(fin, a + debut.length);
  assert.ok(a >= 0 && b > a, debut + ' introuvable');
  return source.slice(a, b);
}

test('La mise en forme compacte des introductions est reprise de V2', () => {
  assert.match(css, /SPEC 85 — Intros lisibles sur smartphone/);
  assert.match(css, /#view-msintro \.msi-titre \{ font-size: clamp\(2rem, 8vw, 2\.45rem\)/);
  assert.match(css, /#view-pintro \.pi-regle \{ padding: \.85rem \.95rem/);
  assert.match(css, /#view-pintro \.pi-regle-txt \{ font-size: 1rem; line-height: 1\.4/);
  assert.match(css, /@media \(max-height: 700px\)/);
});

test('Les deux introductions restent à hauteur de viewport avec défilement local', () => {
  assert.match(css, /#view-pintro\.active,\s*#view-msintro\.active\s*\{\s*height: 100dvh;\s*min-height: 0;\s*overflow: hidden;/);
  assert.match(css, /#view-pintro \.pi-content\s*\{[^}]*flex: 1 1 auto;[^}]*overflow-y: auto;/s);
  assert.match(css, /#view-msintro \.msi-content\s*\{[^}]*flex: 1 1 auto;[^}]*overflow-y: auto;/s);
  assert.match(css, /#view-msintro \.msi-bas\s*\{[^}]*position: sticky;[^}]*bottom: 0;/s);
  assert.match(html, /id="view-pintro"[\s\S]*?id="pi-content"[\s\S]*?id="pi-cta"/);
  assert.match(html, /id="view-msintro"[\s\S]*?id="msi-content"/);
});

test('La découverte guidée garde la mise en page à bouton fixe de V2', () => {
  assert.match(css, /SPEC 86 — Découverte mobile/);
  assert.match(css, /#view-decouverte\.active\s*\{\s*height: 100dvh;\s*min-height: 0;\s*overflow: hidden;/);
  assert.match(css, /#view-decouverte \.dc-contenant\s*\{[^}]*overflow-y: auto;/s);
  assert.match(css, /#view-decouverte \.dc-bas\s*\{\s*position: static;[^}]*flex: 0 0 auto;/s);
});

test('Le résumé de mission utilise les variantes courtes de V2 sans perdre les actions', () => {
  const segment = sourceEntre(mission, 'function renderIntroMission()', '// SPEC 55 :');
  const box = { innerHTML: '' };
  const l = {
    id: 2,
    mission: {
      titre: 'Titre très long', titre_intro: 'Titre court',
      contexte: 'Contexte beaucoup trop long', contexte_intro: 'Contexte court',
      objectif: 'Objectif détaillé', objectif_intro: 'Objectif court'
    }
  };
  const contexte = {
    pLecon: l,
    document: { getElementById: () => box },
    studioActif: () => false,
    numLecon: a => a.id,
    escHtml: String,
    ICONES: { coche: '✓' },
    unitesCoeur: () => [{id: 1}, {id: 2}],
    nbRepliquesToi: () => 3,
    peutTenterSaChance: () => true
  };
  new Function('ctx', 'with(ctx){ ' + segment + '; renderIntroMission(); }')(contexte);
  assert.match(box.innerHTML, /Titre court/);
  assert.match(box.innerHTML, /Contexte court/);
  assert.match(box.innerHTML, /Objectif court/);
  assert.doesNotMatch(box.innerHTML, /Contexte beaucoup trop long/);
  assert.match(box.innerHTML, /onclick="confirmerIntroMission\(\)"/);
  assert.match(box.innerHTML, /onclick="voirUnitesDepuisIntro\(\)"/);
  assert.match(box.innerHTML, /onclick="tenterDepuisIntro\(\)"/);
});

test('Introduction de prononciation : résumé court et CTA exacts de V2', () => {
  const segment = sourceEntre(parcours, 'function openIntro(uniteId)', '// Retour depuis « Avant de commencer »');
  const content = { innerHTML: '' };
  const cta = { innerHTML: '' };
  let view = '';
  const unit = { id: 1, titre: 'Prononciation', regle: 'Écoute les sons', exemple: 'wäiss', pieges: ['Attention'], activiteUnique: true };
  const ctx = {
    pLecon: {id: 0},
    introMissionAVoir: () => false,
    fermerClavier: () => {},
    trouverUnite: () => unit,
    itemsUnite: () => [],
    minutesPour: () => 4,
    nbItems: () => 20,
    studioActif: () => true,
    decouvertePour: () => Array(9).fill(null),
    escHtml: String,
    document: { getElementById: id => id === 'pi-content' ? content : cta },
    showView: id => { view = id; }
  };
  new Function('ctx', 'with(ctx){ let pIntroUnite = null; ' + segment + '; openIntro(1); }')(ctx);
  assert.match(content.innerHTML, /Prononciation/);
  assert.match(content.innerHTML, /9 sons à découvrir · 20 écoutes/);
  assert.match(cta.innerHTML, /Découvrir les sons →/);
  assert.match(cta.innerHTML, /onclick="startUnite\(1\)"/);
  assert.equal(view, 'view-pintro');
});

test('Les introductions ne remplacent aucun moteur de score ou de progression', () => {
  assert.doesNotMatch(sourceEntre(mission, 'function renderIntroMission()', '// SPEC 55 :'), /save|progression|reset|localStorage/);
  assert.match(parcours, /function startUnite\(/);
});
