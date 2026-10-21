'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'public');
const css = fs.readFileSync(path.join(base, 'style.css'), 'utf8');
const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
const exam = fs.readFileSync(path.join(base, 'examens.js'), 'utf8');
const app = fs.readFileSync(path.join(base, 'app.js'), 'utf8');

test('Toutes les transitions de vues restent sans transform de conteneur', () => {
  assert.match(css, /\.view\.entre-avant,\s*\.view\.entre-arriere,\s*\.view\.entre-fondu\s*\{\s*animation:\s*fondu\s*\.18s/s);
  assert.doesNotMatch(css, /\.view\.entre-avant\s*\{\s*animation:\s*pa-glisse/);
  assert.doesNotMatch(css, /\.view\.entre-arriere\s*\{\s*animation:\s*pa-glisse/);
  assert.match(app, /vue\.classList\.remove\('entre-avant', 'entre-arriere', 'entre-fondu'\)/);
});

test('Tous les écrans avec action fixe sont protégés du décalage', () => {
  for (const id of ['view-pintro', 'view-decouverte', 'view-pfin', 'view-examen-result']) {
    const start = html.indexOf('id="' + id + '"');
    assert.notEqual(start, -1, id);
    const next = html.indexOf('</div>\n\n  <!--', start);
    const fragment = html.slice(start, next > start ? next : start + 1600);
    assert.match(fragment, /cta-fixe/, id + ' : CTA fixe attendu');
  }
});

test('Examen : corps indépendant et bandeau ancré dans la hauteur visible', () => {
  assert.match(css, /#view-examen\.active\s*\{\s*height:\s*100dvh;\s*min-height:\s*0;\s*overflow:\s*hidden;/);
  assert.match(css, /#view-examen \.ex-body\s*\{[^}]*overflow-y:\s*auto;/s);
  assert.match(css, /\.ex-bottom\s*\{[^}]*position:\s*relative;[^}]*flex:\s*0 0 auto;[^}]*max-height:\s*46dvh;/s);
  assert.match(css, /\.ex-bottom\s*\{[^}]*safe-area-inset-bottom/s);
  assert.match(css, /\.ex-tray\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(html, /id="view-examen"[\s\S]*?class="ex-bottom"[\s\S]*?id="ex-next"/);
});

function extraireFonction(nom) {
  const match = new RegExp('function ' + nom + '\\(\\)\\s*\\{([\\s\\S]*?)\\n\\}').exec(exam);
  assert.ok(match, nom);
  return 'function ' + nom + '(){' + match[1] + '}';
}

test('Examen : la navigation recentre la zone défilante, pas seulement la page', () => {
  const etat = { scroll: 90, window: false };
  const doc = { getElementById: id => id === 'ex-body' ? {
    set scrollTop(v) { etat.scroll = v; }
  } : null };
  const fn = new Function('document', 'window',
    extraireFonction('examRemonter') + '; return examRemonter;'
  )(doc, { scrollTo: () => { etat.window = true; } });
  fn();
  assert.equal(etat.scroll, 0);
  assert.equal(etat.window, true);
  assert.match(exam, /function examGoTo\([\s\S]*?renderExamPart\(\);\s*examRemonter\(\);/);
  assert.match(exam, /async function examCheck\([\s\S]*?renderExamPart\(\);\s*examRemonter\(\);/);
});

test('Examen : le prochain trou reste visible au-dessus du bandeau', () => {
  const etat = { visible: false };
  const doc = { getElementById: id => {
    if (id === 'ex-body') return { getBoundingClientRect: () => ({top:50,bottom:380}) };
    if (id === 'ex-blank-0') return {
      getBoundingClientRect: () => ({top:400,bottom:430}),
      scrollIntoView: opts => { etat.visible = opts.block === 'center'; }
    };
    return null;
  }};
  const fn = new Function('document','examBlank',
    extraireFonction('examShowBlank') + '; return examShowBlank;'
  )(doc,0);
  fn();
  assert.equal(etat.visible,true);
});
