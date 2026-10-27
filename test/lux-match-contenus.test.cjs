'use strict';
// SPEC 109 — Lux Match : contrôle qualité des contenus de la bible (contenus-v02.json).
// Critères de la bible §12.2 automatisables ; la relecture native reste nécessaire.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const racine = path.join(__dirname, '..');
const contenus = JSON.parse(fs.readFileSync(path.join(racine, 'data/jeux/lux-match/contenus-v02.json'), 'utf8'));

// Parcourt tous les objets du JSON (avec leur chemin).
function parcourir(x, visite, chemin) {
  chemin = chemin || '';
  if (Array.isArray(x)) x.forEach((v, i) => parcourir(v, visite, chemin + '/' + i));
  else if (x && typeof x === 'object') { visite(x, chemin); Object.keys(x).forEach(k => parcourir(x[k], visite, chemin + '/' + k)); }
}
const lignesLu = [];
parcourir(contenus, (o, chemin) => { if (typeof o.lu === 'string') lignesLu.push({ o, chemin }); });

test('Chaque ligne LU a un statut de relecture connu', () => {
  const statuts = Object.keys(contenus.reviewLegend);
  assert.deepEqual(statuts.sort(), ['a_verifier_lod', 'audit_regles', 'lecon', 'lecon_modele']);
  lignesLu.forEach(({ o, chemin }) => assert.ok(statuts.includes(o.review), chemin + ' : statut ' + o.review));
  // Le jeu reste une démo tant que des lignes ne sont pas certifiées.
  assert.equal(contenus.status, 'demo_textes_lu_en_relecture');
});

test('Statut « lecon » : la phrase existe telle quelle dans les leçons', () => {
  const corpus = [];
  const lireDossier = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) lireDossier(p);
    else if (e.name.endsWith('.json')) JSON.stringify(JSON.parse(fs.readFileSync(p, 'utf8')), (k, v) => { if (typeof v === 'string') corpus.push(v); return v; });
  });
  lireDossier(path.join(racine, 'data/lecons'));
  const norm = t => t.toLowerCase().replace(/[!?.,:;«»"]/g, ' ').replace(/\s+/g, ' ').trim();
  const texte = corpus.map(norm).join(' | ');
  lignesLu.filter(l => l.o.review === 'lecon').forEach(({ o, chemin }) => {
    o.lu.split(/(?<=[.!?])\s+/).filter(p => norm(p)).forEach(p => assert.ok(texte.includes(norm(p)), chemin + ' : « ' + p + ' » absent des leçons'));
  });
});

test('Règle du n : formes cohérentes devant consonne / voyelle', () => {
  // Formes pleines (-n) et réduites : le n reste devant voyelle et n, d, t, z, h.
  const pleines = ['sinn', 'hunn', 'ginn', 'keen', 'an', 'en', 'den', 'heeschen', 'schwätzen', 'spillen', 'molen', 'drénken', 'kommen', 'wunnen', 'schaffen', 'liesen', 'kennen', 'maachen', 'verkafen', 'reesen', 'lafen'];
  const reduites = { si: 'sinn', hu: 'hunn', gi: 'ginn', kee: 'keen', a: 'an', heesche: 'heeschen', 'schwätze': 'schwätzen', spille: 'spillen', mole: 'molen', 'drénke': 'drénken', wunne: 'wunnen', schaffe: 'schaffen', liese: 'liesen', maache: 'maachen', verkafe: 'verkafen', reese: 'reesen', lafe: 'lafen' };
  const garde = /^[aeiouäëéèöüiyndtzh]/i;
  const erreurs = [];
  lignesLu.forEach(({ o, chemin }) => {
    if (o.languageCorrect === false) return; // fautes volontaires (corrigées à l'écran)
    const mots = o.lu.split(/\s+/);
    for (let i = 0; i < mots.length - 1; i++) {
      if (/[.,!?:;]$/.test(mots[i])) continue; // pas de liaison après une ponctuation
      const mot = mots[i].toLowerCase(), suivant = mots[i + 1].replace(/^[«"(]/, '');
      if (pleines.includes(mot) && !garde.test(suivant)) erreurs.push(chemin + ' : « ' + mots[i] + ' ' + suivant + ' » (le n tombe)');
      if (reduites[mot] && garde.test(suivant)) erreurs.push(chemin + ' : « ' + mots[i] + ' ' + suivant + ' » (le n reste : ' + reduites[mot] + ')');
    }
  });
  assert.deepEqual(erreurs, []);
});

test('Identifiants uniques et références valides', () => {
  const vus = new Set();
  parcourir(contenus, (o, chemin) => {
    if (typeof o.id !== 'string' || chemin.startsWith('/nonIntegres') || chemin.startsWith('/finsAdaptees')) return;
    assert.ok(!vus.has(o.id), 'doublon ' + o.id + ' (' + chemin + ')');
    vus.add(o.id);
  });
  contenus.profils.forEach(p => p.variantes.forEach(v => assert.equal(contenus.variantes[v].profil, p.id, v)));
  Object.values(contenus.beats).forEach(b => { if (b.requiresVariant) assert.ok(contenus.variantes[b.requiresVariant]); });
  Object.entries(contenus.evenements).forEach(([id, e]) => assert.ok(e.profil === 'tous' || contenus.profils.some(p => p.id === e.profil), id));
});

test('Six profils adultes, faits canoniques identiques sur tous les réseaux', () => {
  const ages = { 25: 'fënnefanzwanzeg', 26: 'sechsanzwanzeg', 27: 'siwenanzwanzeg', 29: 'nénganzwanzeg', 30: 'drësseg', 31: 'eenandrësseg' };
  assert.equal(contenus.profils.length, 6);
  contenus.profils.forEach(p => {
    assert.ok(p.age >= 21, p.id);
    assert.ok(p.repliques.age.lu.includes(ages[p.age]), p.id + ' âge');
    assert.ok(p.repliques.ville.lu.includes('zu ' + p.city), p.id + ' ville');
    // Toute phrase « Ech wunnen zu X » des réseaux donne la même ville.
    const textes = [p.tinder.lu, p.pro.texte.lu, p.amis.bio.lu].concat(p.amis.posts.map(x => x.lu), p.pix.photos.map(x => x.lu));
    textes.forEach(t => { const m = t.match(/Ech wunnen zu ([A-ZÄËÉa-zäëé]+)/); if (m) assert.equal(m[1], p.city, p.id + ' : ' + t); });
    textes.forEach(t => { const m = t.match(/Ech kommen aus ([A-ZÄËÉa-zäëé]+)/); if (m) assert.equal(m[1], p.origin, p.id + ' : ' + t); });
    assert.ok(p.fins.SUCCESS && p.fins.FUN && p.fins.NEUTRAL && p.fins.FAIL, p.id + ' fins');
    ['LOOK_OK', 'LOOK_DIFFERENT', 'BLUFF', 'AVEU', 'SINCERE'].forEach(k => assert.ok(p.reactions[k], p.id + ' ' + k));
  });
});

test('Indices publics : style et téléphone visibles avant le rendez-vous, Pix privé sans photo', () => {
  const styles = ['sportif', 'casual', 'loose', 'bcbg', 'creatif'], couleurs = ['schwaarz', 'wäiss', 'blo', 'gréng', 'rout', 'beige'];
  const scenes = ['parc', 'foot', 'reception', 'ville_nuit', 'carnet', 'atelier', 'lisbonne', 'train'];
  const poses = ['Idle', 'Victory', 'Defeat', 'RecieveHit', 'Jump', 'Walk', 'Punch', 'PickUp'];
  contenus.profils.forEach(p => {
    const s = p.outfitSignal;
    assert.ok(s.explicit && styles.includes(s.style) && couleurs.includes(s.color), p.id);
    const indice = p.amis.posts.find(x => x.id === s.clue);
    assert.ok(indice && indice.reveals === 'style' && indice.obligatoire, p.id + ' indice de look sur Amis (jamais privé)');
    if (p.phoneTolerance === 'anti_phone') assert.ok(p.amis.posts.some(x => x.reveals === 'anti_phone' && x.obligatoire), p.id + ' anti-téléphone annoncé');
    if (p.pix.private) { assert.equal(p.pix.photos.length, 0); assert.equal(p.pix.followers, 0); }
    p.pix.photos.forEach(ph => { assert.ok(scenes.includes(ph.scene), ph.id); assert.ok(poses.includes(ph.pose), ph.id); });
    // Pas de légende « développeur » qui révèle la mécanique.
    p.pix.photos.concat(p.amis.posts).forEach(x => assert.doesNotMatch(x.fr, /confirm|piège|indice/i, x.id));
    assert.ok(fs.existsSync(path.join(racine, 'public/lux-match', p.apparence3d.modele + '.glb')), p.id);
  });
});

test('Identité d’Alex : vraie fiche complète, loisirs explicites (aucun mensonge déduit d’un champ absent)', () => {
  const a = contenus.persona;
  assert.deepEqual([a.name, a.age, a.origin, a.city, a.job], ['Alex', 28, 'Frankräich', 'Metz', 'Banker']);
  ['football', 'drawing', 'gaming', 'running'].forEach(k => assert.equal(a[k], false, k));
  assert.equal(a.morningCoffee, true);
  assert.equal(a.lignes.length, 6);
});

test('Âge : trois réponses grammaticalement correctes (vérité, bluff crédible, blague)', () => {
  const b = contenus.beats.B04_AGE;
  assert.equal(b.choices.length, 3);
  assert.deepEqual(b.choices.map(c => c.truth).sort(), ['honest', 'joke', 'lie']);
  b.choices.forEach(c => assert.equal(c.languageCorrect, true));
  assert.equal(b.choices.find(c => c.truth === 'joke').claims, undefined); // 120 ans : blague, pas une affirmation
});
