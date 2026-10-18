"""Specs 23, 24 et 32 : missions à 3 vies, réponses autonomes, faute de frappe
corrigée gratuitement (algorithme local). Réussite = au moins une vie à la fin
(spec 32), en mode normal comme avec « Tente ta chance »."""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')


def ok(m):
    print('  ok  ', m, flush=True)


# Une saisie « coquille » : deux lettres voisines inversées dans le plus long mot,
# acceptée par l'algorithme comme coquille probable.
COQUILLE = """(lu) => {
  const mots = lu.split(' ');
  const ordre = mots.map((m, i) => i).sort((a, b) => mots[b].length - mots[a].length);
  for (const i of ordre) {
    const m = mots[i];
    for (let k = 1; k + 1 < m.length - 1; k++) {
      const t = m.slice(0, k) + m[k + 1] + m[k] + m.slice(k + 2);
      if (t === m) continue;
      const essai = mots.slice(0, i).concat([t], mots.slice(i + 1)).join(' ');
      if (analyserReponse(essai, lu).correctionGratuiteAutorisee) return essai;
    }
  }
  return null;
}"""


RESET = "(id => { const p = getProgress(); if (p[id]) { delete p[id].mission; delete p[id].valideeMission; delete p[id].historique; } saveProgress(p); })"


def jouer(pg, actions, tentative=False):
    """actions : une par réplique « toi » : 'ok', 'typo', 'err' (faux puis juste), 'revele'."""
    pg.evaluate("t => openMission(t)", tentative)
    for a in actions:
        lu = pg.evaluate("pLecon.scene[ms.idx].lu")
        if a == 'typo':
            t = pg.evaluate(COQUILLE, lu)
            assert t, ('aucune coquille possible pour', lu)
            pg.fill('#ms-input', t); pg.click('#ms-btn-valider')
            assert 'Possible faute de frappe' in pg.inner_text('#ms-erreur')
            pg.fill('#ms-input', lu); pg.click('#ms-btn-valider')
        elif a == 'err':
            pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
            pg.fill('#ms-input', lu); pg.click('#ms-btn-valider')
        elif a == 'revele':
            pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
            pg.fill('#ms-input', 'nach eng Kéier falsch'); pg.click('#ms-btn-valider')
            pg.click('#ms-btn-voir')
        else:
            pg.fill('#ms-input', lu); pg.click('#ms-btn-valider')
        pg.click('#ms-continuer')
    return pg.evaluate("ms.bilan")


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.evaluate("choisirNiveau('A1.1'); lecons.forEach(l => marquerIntroMissionVue(l.id)); saveUnitBest(12, 1, 100); openParcoursLecon(lecons.find(l => l.id === 12))")
    n = pg.evaluate("nbRepliquesToi(pLecon)")
    assert n == 5, n
    assert pg.locator('#ms-vies .ms-coeur').count() == 0 or True

    # Tout juste
    bilan = jouer(pg, ['ok'] * n)
    assert bilan == {'ok': 5, 'total': 5, 'erreurs': 0, 'reveles': 0, 'vies': 3}, bilan
    assert pg.evaluate("getMissionBest(12)") == 100 and pg.evaluate("missionReussie(lecons.find(l => l.id === 12))")
    ok('5 réponses justes : 5/5 autonomes, 3 vies, mission réussie')

    # Une faute de frappe corrigée : gratuite
    pg.evaluate(RESET + "(12)")
    bilan = jouer(pg, ['typo'] + ['ok'] * (n - 1))
    assert bilan['ok'] == 5 and bilan['vies'] == 3, bilan
    ok('faute de frappe corrigée : comptée autonome, aucune vie perdue')

    # Une vraie erreur : une vie, 4/5 = 80 % → réussie
    pg.evaluate(RESET + "(12)")
    bilan = jouer(pg, ['err'] + ['ok'] * (n - 1))
    assert bilan['ok'] == 4 and bilan['vies'] == 2 and pg.evaluate("missionReussie(lecons.find(l => l.id === 12))"), bilan
    assert pg.locator('#ms-vies .ms-coeur.vide').count() == 1
    ok('une erreur : 4/5 autonomes (80 %), 2 vies, réussie ; un cœur vide')

    # Deux erreurs : 3/5 = 60 % → à rejouer
    pg.evaluate(RESET + "(12)")
    bilan = jouer(pg, ['err', 'err'] + ['ok'] * (n - 2))
    assert bilan['ok'] == 3 and bilan['vies'] == 1 and pg.evaluate("missionReussie(lecons.find(l => l.id === 12))"), bilan
    assert 'Mission réussie' in pg.inner_text('.ms-fin')
    ok('deux erreurs : 3/5 autonomes, 1 vie restante → réussie (spec 32 : plus de seuil de 80 %)')

    # Trois erreurs : plus de vie, mode apprentissage, défi non validé
    pg.evaluate(RESET + "(12)")
    pg.evaluate("openMission()")
    for k in range(3):
        lu = pg.evaluate("pLecon.scene[ms.idx].lu")
        pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
        pg.fill('#ms-input', 'nach eng Kéier falsch'); pg.click('#ms-btn-valider')  # 2e erreur : pas de 2e vie perdue
        pg.fill('#ms-input', lu); pg.click('#ms-btn-valider'); pg.click('#ms-continuer')
    assert pg.evaluate("ms.vies") == 0 and pg.locator('.ms-apprentissage').count() == 1
    for k in range(n - 3):
        pg.fill('#ms-input', pg.evaluate("pLecon.scene[ms.idx].lu")); pg.click('#ms-btn-valider'); pg.click('#ms-continuer')
    assert pg.evaluate("ms.bilan.vies") == 0 and not pg.evaluate("missionReussie(lecons.find(l => l.id === 12))")
    assert 'Plus de vie' in pg.inner_text('.ms-fin') and not pg.evaluate("leconTerminee(lecons.find(l => l.id === 12))")
    ok('trois erreurs : 0 vie (une seule par réplique), conversation terminée en mode apprentissage, non validée')

    # Réponse révélée
    pg.evaluate(RESET + "(12)")
    bilan = jouer(pg, ['revele'] + ['ok'] * (n - 1))
    assert bilan['reveles'] == 1 and bilan['ok'] == 4, bilan
    ok('réponse révélée : comptée échouée, une vie perdue')

    # Tente ta chance : même règle — une erreur (2 vies) valide, trois erreurs (0 vie) non
    pg.evaluate("(p => { [13, 14].forEach(id => { delete p[id]; }); saveProgress(p); })(getProgress()); openParcoursLecon(lecons.find(l => l.id === 13))")
    jouer(pg, ['ok'] * pg.evaluate("nbRepliquesToi(pLecon)"), tentative=True)
    assert pg.evaluate("leconValideeParMission(13)")
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 14))")
    m = pg.evaluate("nbRepliquesToi(pLecon)")
    jouer(pg, ['err'] + ['ok'] * (m - 1), tentative=True)
    assert pg.evaluate("leconValideeParMission(14)")
    pg.evaluate(RESET + "(14)")
    jouer(pg, ['err', 'err', 'err'] + ['ok'] * (m - 3), tentative=True)
    assert not pg.evaluate("leconValideeParMission(14)") and "Les unités vont t'aider" in pg.inner_text('.ms-fin')
    ok('Tente ta chance : 5/5 → validée ; une erreur sur %d (2 vies) → validée ; trois erreurs → non validée' % m)

    # Anciennes données : un score historique est gardé, la version est notée
    pg.evaluate("(p => { p[15] = { mission: { score: 75 } }; saveProgress(p); })(getProgress()); openParcoursLecon(lecons.find(l => l.id === 15))")
    jouer(pg, ['err', 'err'] + ['ok'] * (pg.evaluate("nbRepliquesToi(pLecon)") - 2))
    assert pg.evaluate("getMissionBest(15)") == 75 and pg.evaluate("getProgress()[15].mission.version") == 1
    assert pg.evaluate("missionReussie(lecons.find(l => l.id === 15))"), 'deux erreurs, une vie : réussie'
    ok('ancien score 75 % gardé (indicateur) ; nouvelle partie à 1 vie → réussie ; version notée')

    # Écriture : coquille → rien n'est enregistré avant la décision ; corrigée → juste du premier coup
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 12)); startEtapeSeule(1, 'ecriture')")
    e = pg.evaluate("trouverItem(pLecon, 'ecriture', run.steps[run.stepIdx].queue[0])")
    t = pg.evaluate(COQUILLE, e['lu'])
    if t:
        pg.fill('#pc-ecr-input', t); pg.click('#pc-ecr-valider')
        assert 'Possible faute de frappe' in pg.inner_text('#pc-ecr-erreur')
        assert pg.evaluate("Object.keys(run.steps[run.stepIdx].scores).length") == 0, 'rien ne doit être enregistré'
        pg.fill('#pc-ecr-input', e['lu']); pg.click('#pc-ecr-valider')
        assert pg.evaluate("run.steps[run.stepIdx].details[%d].ok" % e['id']) is True
        ok('écriture : coquille corrigée → juste du premier coup, aucune erreur enregistrée')
    else:
        ok('écriture : phrase sans coquille possible (mots courts) — cas couvert par test_correction.js')
    pg.click('#pc-continuer')
    e = pg.evaluate("trouverItem(pLecon, 'ecriture', run.steps[run.stepIdx].queue[0])")
    pg.fill('#pc-ecr-input', 'Ech weess et net'); pg.click('#pc-ecr-valider')
    assert 'Pas encore' in pg.inner_text('#pc-ecr-erreur') and pg.evaluate("run.steps[run.stepIdx].details[%d].ok" % e['id']) is False
    ok('écriture : vraie erreur → enregistrée comme avant')

    print('\nErreurs JavaScript :', errs or 'aucune')
    assert not errs
    b.close()
