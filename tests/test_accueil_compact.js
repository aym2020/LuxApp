// SPEC 52 — accueil mobile compact, sans navigateur ni dépendance externe.
// Lancer : node tests/test_accueil_compact.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const lire = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const html = lire('public/index.html');
const css = lire('public/style.css');
const accueil = lire('public/accueil.js');
const cloud = lire('public/cloud.js');
const app = lire('public/app.js');

let etat = { ok: true, texte: "Synchronisé à l'instant" };
let niveau = 'A1.2';
let nouveau = false;
let cloudEnabled = false;
const auth = { currentUser: null };
let pas = {
  type: 'unite',
  lecon: { id: 20, titre_fr: 'Être et avoir au présent' },
  unite: { id: 1, titre: 'sinn : être au présent' }
};
let data = { pourcent: 0, terminees: 0, nbLecons: 8, anciennes: 1 };
const noeuds = {};
function noeud(id) {
  if (!noeuds[id]) noeuds[id] = {
    id, innerHTML: '', textContent: '', attrs: {},
    classList: {
      states: new Set(),
      toggle(c, on) { if (on) this.states.add(c); else this.states.delete(c); },
      add(c) { this.states.add(c); },
      contains(c) { return this.states.has(c); }
    },
    setAttribute(k, v) { this.attrs[k] = v; },
    querySelector(selector) { return selector === '.ac-sync-slot' ? noeud('slot') : null; }
  };
  return noeuds[id];
}
const document = {
  getElementById: noeud,
  querySelector(selector) {
    if (selector === '#accueil .ac-menu') return noeud('menu');
    if (selector === '#panneau [data-synchro-menu]') return noeuds['panneau-sous-titre'] || null;
    return null;
  },
  addEventListener() {}
};
const echapper = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const dependances = [
  'document', 'lecons', 'niveauActif', 'niveauxDisponibles', 'etatSynchro', 'escHtml',
  'progressionNiveau', 'serieActuelle', 'numLecon', 'titreCourt', 'aDejaPratique',
  'resumeRevision', 'noterQuestionsDues', 'loadSeance', 'revisionFaiteAujourdhui',
  'isCloudEnabled', 'fbAuth',
  'prochainPas', 'getJours', 'dayString', 'niveauSuivant'
];
const args = [
  document, [], niveau, () => ['A1.1', 'A1.2'], () => etat, echapper,
  () => data, () => 0, l => l.id, l => l.titre_fr, () => !nouveau,
  () => ({ dus: [] }), () => {}, () => null, () => false,
  () => cloudEnabled, auth,
  () => pas, () => ({ today: 0 }), () => 'today', () => null
];
const factory = new Function(...dependances,
  accueil + '\nreturn { renderAccueil, enteteAccueilHtml, chiffresHtml, carteSuiteHtml, detailPasCourt, actualiserStatutSynchro, pastilleSynchroHtml };');
const ui = factory(...args);

assert.equal(ui.detailPasCourt(pas), 'Unité 1 · sinn');
const rendered = ui.carteSuiteHtml(pas, false);
assert.ok(rendered.includes('id="today"'));
assert.ok(rendered.includes('suivreProchainPas()'));
assert.ok(rendered.includes('class="cs-kicker">Continuer'));
assert.ok(rendered.includes('class="cs-lecon">LEÇON 20'));
assert.ok(rendered.includes('class="cs-titre">Être et avoir au présent'));
assert.ok(rendered.includes('class="cs-etape"'));
assert.ok(rendered.includes('Unité 1 · sinn</small>'));
assert.ok(rendered.includes('aria-label="Continuer · Leçon 20 · Être et avoir au présent · Unité 1 · sinn : être au présent"'));

const stats = ui.chiffresHtml();
assert.ok(stats.includes('0 / 8'));
assert.ok(stats.includes('Terminées'));
assert.ok(stats.includes('+1 acquise</small>'));
assert.ok(stats.includes('acquises précédemment"') || stats.includes('acquises précédemment'));
assert.ok(!stats.includes('>Leçons terminées'));

ui.renderAccueil(false);
const dashboard = noeud('accueil').innerHTML;
assert.ok(dashboard.includes('Leçons</b>'));
assert.ok(dashboard.includes('Réviser</b>'));
assert.ok(dashboard.includes('Examens</b>'));
assert.ok(dashboard.includes('Erreurs fréquentes</b>'));
assert.equal((dashboard.match(/class="ac-btn /g) || []).length, 4);
assert.ok(!dashboard.includes('point-synchro'), 'aucun footer de synchro');
assert.ok(dashboard.includes('ac-sync-point'), 'point cloud dans la roue');
assert.ok(!dashboard.includes('Leçons terminées'));
assert.ok(noeud('reglages-synchro').innerHTML.includes("Synchronisé à l'instant"));
assert.ok(noeud('menu').attrs['aria-label'].includes('Synchronisé'));

const old = noeud('accueil').innerHTML;
etat = { ok: false, texte: 'En attente · hors ligne' };
ui.actualiserStatutSynchro();
assert.ok(noeud('slot').innerHTML.includes('attente'));
assert.ok(noeud('menu').attrs['aria-label'].includes('hors ligne'));
assert.ok(noeud('reglages-synchro').innerHTML.includes('attente'));
assert.equal(noeud('accueil').innerHTML, old, 'pas de reconstruction de page');

etat = null;
ui.actualiserStatutSynchro();
assert.equal(noeud('slot').innerHTML, '', 'aucun point si hors connexion');
assert.equal(noeud('menu').attrs['aria-label'], 'Menu');
assert.equal(noeud('reglages-synchro').innerHTML, '');

assert.ok(ui.carteSuiteHtml(pas, true).includes('commencer()'), 'première leçon');
assert.ok(ui.carteSuiteHtml(pas, true).includes('class="cs-kicker">Commencer'));
assert.ok(ui.carteSuiteHtml(null, false).includes('Niveau terminé'), 'niveau fini');

// Invariants CSS : aucune suppression de défilement et cibles tactiles préservées.
assert.ok(css.includes('/* SPEC 52 — Accueil compact'));
assert.ok(css.includes('.carte-suite.compacte'));
assert.ok(css.includes('-webkit-line-clamp: 2'));
assert.ok(css.includes('text-overflow: ellipsis'));
assert.ok(css.includes('.ac-btn { min-height: 60px; }'));
assert.ok(css.includes('.ac-menu { position: relative; }'));
assert.ok(!css.includes('.accueil { overflow: hidden; }'));
assert.ok(html.includes('id="reglages-synchro"'));
assert.ok(cloud.includes("typeof actualiserStatutSynchro === 'function'"));
assert.ok(app.includes("if (typeof actualiserStatutSynchro === 'function') actualiserStatutSynchro();"));

// Régression mobile : le titre ne doit plus partir hors écran quand les cartes tiennent.
assert.match(css, /body:has\(#view-dashboard\.active\)\s*\{[^}]*height:100dvh;[^}]*overflow:hidden/s,
  'Seul l’accueil verrouille le scroll du document');
assert.match(css, /#view-dashboard\.active\s*\{[^}]*overflow-y:auto/s,
  'Sur les petits écrans, les cartes restent accessibles via la vue Accueil');
assert.match(css, /#view-dashboard\.active\s*\{[^}]*overscroll-behavior-y:contain/s,
  'Pas de rebond du document parent');
assert.match(app, /if \(id === 'view-dashboard'\) vue\.scrollTop = 0;/,
  'Revenir à l’accueil remet seulement son scroll à zéro');
// Ne pas bloquer le scroll des autres vues : la condition CSS exige explicitement l'accueil actif.
assert.ok(!css.includes('body { overflow: hidden; }') && !css.includes('#view-dashboard.active { overflow:hidden; }'),
  'Le contenu long et les autres écrans restent consultables');

// SPEC 77 : accueil de première visite en invité, trop haut sur Android standard.
assert.ok(!noeud('accueil').classList.contains('ac-nouveau-invite'), 'accueil suivi non compacté');
nouveau = true; cloudEnabled = true;
ui.renderAccueil(false);
assert.ok(noeud('accueil').classList.contains('ac-nouveau-invite'),
  'compacter seulement le nouvel invité avec sa barre de compte');
assert.match(noeud('accueil').innerHTML, /Mode invité/);
assert.match(noeud('accueil').innerHTML, /Prêt à commencer/);
assert.equal((noeud('accueil').innerHTML.match(/class="ac-btn /g)||[]).length,4,
  'les quatre accès restent visibles');
auth.currentUser = { uid:'logged-in' };
ui.renderAccueil(false);
assert.ok(!noeud('accueil').classList.contains('ac-nouveau-invite'),
  'le compte connecté garde sa disposition');
auth.currentUser = null; nouveau = false;
ui.renderAccueil(false);
assert.ok(!noeud('accueil').classList.contains('ac-nouveau-invite'),
  'la page avec progression conserve ses stats et son espacement');
nouveau = true; cloudEnabled = false;
ui.renderAccueil(false);
assert.ok(!noeud('accueil').classList.contains('ac-nouveau-invite'),
  'sans barre de compte, ne pas compacter');
assert.match(css, /@media\s*\(max-height:\s*810px\)/);
assert.match(css, /#view-dashboard \.accueil\.ac-nouveau-invite\s*\{[^}]*gap:\s*7px/s,
  'espacements réduits uniquement au bon niveau');
assert.match(css, /#view-dashboard \.ac-nouveau-invite \.ac-accroche \.ic\s*\{[^}]*width:\s*28px/s,
  'illustration raccourcie, texte conservé');
assert.match(css, /#view-dashboard \.ac-nouveau-invite \.ac-btn\s*\{[^}]*min-height:\s*60px/s,
  'cibles tactiles préservées');
assert.match(css, /#view-dashboard\.active\s*\{[^}]*overflow-y:auto/s,
  'petits écrans : aucun contenu rogné');

console.log('SPEC 52 + 77 : OK — accueil invité compact sur écran standard, navigation et retour préservés.');
