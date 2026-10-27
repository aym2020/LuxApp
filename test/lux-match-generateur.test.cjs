'use strict';
// SPEC 109 §13 — Lux Match : générateur semi-procédural, 1 000 graines par profil.
// Cohérence, reproductibilité, indices publics, budget d'événements, parties rejouées.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const Core = require('../public/lux-match-core.js');
const C = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/jeux/lux-match/contenus-v02.json'), 'utf8'));
const donnees = { contenus: C };
const GRAINES = 1000;

// Joue une partie complète avec une stratégie ; renvoie l'état final et le journal des choix.
function jouer(graine, profilId, strategie, journal) {
  const etat = Core.nouvellePartie(donnees, { graine, parties: 5 });
  Core.commencerSwipes(etat);
  etat.paquet = [profilId]; etat.likesAvantMatch = 1;
  Core.swiper(etat, true);
  Core.apresMatch(etat, 'date');
  Core.choisirLook(etat, etat.profil.outfitSignal.style, graine % 2 ? etat.profil.outfitSignal.color : null);
  Core.commencerDate(etat);
  const choix = [];
  let pas = 0;
  while (etat.phase === 'date' && pas++ < 40) {
    if (pas === 3 && graine % 3 === 0) { Core.ouvrirTelephone(etat); Core.avancerTemps(etat, 0.2); Core.fermerTelephone(etat); }
    const id = journal ? journal[choix.length] : strategie(etat, pas);
    choix.push(id);
    Core.repondre(etat, id);
    Core.continuer(etat);
  }
  return { etat, choix, pas };
}
const sincere = etat => {
  const e = etat.courant;
  if (e.type === 'rappel') return (e.choix.find(c => c.valeur === etat.claims[e.source.attribut]) || e.choix[0]).id;
  if (e.type === 'evenement') return (e.choix.find(c => c.aveu) || e.choix[0]).id;
  return (e.choix.find(c => c.truth === 'honest') || e.choix[0]).id;
};
const menteur = etat => {
  const e = etat.courant;
  return (e.choix.find(c => c.truth === 'lie') || e.choix.find(c => !c.aveu) || e.choix[0]).id;
};
const auHasard = graine => { const h = Core.creerHasard(graine * 7 + 1); return etat => etat.courant.choix[Math.floor(h() * etat.courant.choix.length)].id; };

test('1 000 graines × 6 profils : scénario valide, reproductible, sans repli', () => {
  const stats = { exAlex: 0, compatibleEx: 0, age: 0, compatibleAge: 0, variante: 0, total: 0, replis: 0 };
  const signatures = new Set();
  C.profils.forEach(profil => {
    for (let g = 1; g <= GRAINES; g++) {
      const plan = Core.composerScenario(C, profil, g);
      assert.deepEqual(Core.validerScenario(C, profil, plan), [], profil.id + ' graine ' + g);
      assert.equal(JSON.stringify(plan), JSON.stringify(Core.composerScenario(C, profil, g)), 'reproductible');
      assert.equal(plan.contentVersion, C.contentVersion);
      stats.total++;
      if (plan.diagnostics.some(d => d.startsWith('repli'))) stats.replis++;
      if (profil.exAlexPossible && profil.phoneTolerance !== 'anti_phone') { stats.compatibleEx++; if (plan.traits.dislikedFirstName) stats.exAlex++; }
      if (profil.agePrefPossible) { stats.compatibleAge++; if (plan.traits.agePreference) stats.age++; }
      if (plan.variante) stats.variante++;
      // Au plus un levier social fort par partenaire.
      const leviers = [plan.traits.dislikedFirstName, plan.traits.agePreference && plan.traits.agePreference !== 'indifferent', profil.phoneTolerance === 'anti_phone'].filter(Boolean);
      assert.ok(leviers.length <= 1, profil.id + ' graine ' + g);
      // Indice publié AVANT le date pour chaque critère fort (jamais sur Pix privé : toujours Amis).
      if (plan.traits.dislikedFirstName) assert.ok(plan.posts.some(p => p.id === 'PREF_EX_ALEX'));
      if (plan.traits.agePreference) assert.ok(plan.posts.some(p => p.reveals === 'age'));
      assert.ok(plan.indices.every(i => i.app === 'amis'));
      signatures.add(profil.id + ':' + plan.scenes.join(','));
    }
  });
  assert.equal(stats.replis, 0);
  // Raretés visées (SPEC §13.5) : ex « Alex » ≈ 10 %, préférence d'âge ≈ 35 %.
  const tauxEx = stats.exAlex / stats.compatibleEx, tauxAge = stats.age / stats.compatibleAge;
  assert.ok(tauxEx > 0.06 && tauxEx < 0.14, 'ex Alex ' + tauxEx);
  assert.ok(tauxAge > 0.25 && tauxAge < 0.42, 'âge ' + tauxAge);
  // Variété réelle : au moins 15 enchaînements de scènes différents par partenaire.
  C.profils.forEach(p => assert.ok([...signatures].filter(s => s.startsWith(p.id + ':')).length >= 15, p.id));
});

test('Le scénario ne dépend pas des tirages d’affichage (swipes, ordre des réponses)', () => {
  for (let g = 1; g <= 200; g++) {
    const profil = C.profils[g % 6];
    const a = Core.nouvellePartie(donnees, { graine: g });
    Core.commencerSwipes(a);
    a.paquet = [profil.id]; a.likesAvantMatch = 1;
    for (let i = 0; i < g % 7; i++) a.hasard(); // tirages de présentation supplémentaires
    Core.swiper(a, true);
    assert.equal(JSON.stringify(a.plan), JSON.stringify(Core.composerScenario(C, profil, g)));
  }
});

test('1 000 parties par stratégie : aucune boucle, 6–8 tours principaux, budget et gardes respectés', () => {
  const issues = {};
  C.profils.forEach(profil => {
    for (let g = 1; g <= GRAINES; g++) {
      [['sincere', () => sincere], ['menteur', () => menteur], ['hasard', () => auHasard(g)]].forEach(([nom, fabrique]) => {
        const { etat, choix, pas } = jouer(g, profil.id, fabrique());
        const ou = profil.id + ' ' + nom + ' graine ' + g;
        assert.equal(etat.phase, 'resultats', ou);
        assert.ok(pas <= 16, ou + ' : ' + pas + ' échanges');
        const principaux = etat.historique.filter(h => h.type !== 'evenement' && h.id !== 'B24_TOMORROW' && !/^EV_/.test(h.id)).length;
        if (!etat.fin || etat.suspicion < 80) assert.ok(principaux >= 5 && principaux <= 8, ou + ' : ' + principaux + ' tours');
        const ev = etat.evenements.filter(id => id !== 'B25_TRUTH_REPAIR');
        assert.ok(ev.length <= 2, ou + ' ' + ev);
        assert.ok(ev.filter(id => (C.evenements[id] || C.beats[id]).taille === 'gros').length <= 1, ou);
        assert.equal(new Set(etat.historique.map(h => h.id)).size, etat.historique.length, ou + ' : question répétée');
        assert.ok(etat.emotions.filter(e => e.endsWith(':big')).length <= 1, ou + ' : plusieurs gros effets');
        // Un événement de mensonge n'arrive qu'après un vrai mensonge, et propose un aveu.
        etat.historique.filter(h => h.type === 'evenement').forEach(h => {
          const d = C.evenements[h.id].declencheur || {};
          if (d.mensonge) {
            assert.ok(Object.keys(d.mensonge).some(k => etat.dejaMenti[k]), ou + ' ' + h.id);
            assert.ok(C.evenements[h.id].choices.some(c => c.aveu), h.id + ' sans aveu');
          }
        });
        // Conclusion : un texte personnalisé n'existe que si son fait a eu lieu.
        if (etat.fin.texte) assert.ok(Core.gardeOk(etat, etat.profil.fins[etat.fin.cle].garde), ou);
        if (nom === 'sincere') { assert.notEqual(etat.fin.cle, 'FAIL', ou); assert.equal(etat.contradictions, 0, ou); assert.equal(etat.fin.langue, 100, ou); }
        issues[nom + ':' + etat.fin.cle] = (issues[nom + ':' + etat.fin.cle] || 0) + 1;
        // Rejouer exactement le même journal donne la même partie.
        if (g % 50 === 0) {
          const rejeu = jouer(g, profil.id, null, choix).etat;
          assert.deepEqual([rejeu.affinity, rejeu.suspicion, rejeu.fin.cle, rejeu.historique.map(h => h.id)], [etat.affinity, etat.suspicion, etat.fin.cle, etat.historique.map(h => h.id)], ou + ' rejeu');
        }
      });
    }
  });
  // Toutes les issues existent et une partie sincère peut réussir.
  if (process.env.LM_STATS) console.log(JSON.stringify(issues));
  assert.ok(issues['sincere:SUCCESS'] > 0 && issues['menteur:FAIL'] > 0 && (issues['menteur:FUN'] || 0) + (issues['hasard:FUN'] || 0) > 0, JSON.stringify(issues));
});
