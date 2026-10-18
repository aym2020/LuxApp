"""Spec 34 : les 24 missions se jouent en entier — 10 réponses à produire,
chaque réponse attendue acceptée telle quelle, bilan 10 / 10, mission réussie,
compteur « n / 10 »."""
import os
from playwright.sync_api import sync_playwright
U = os.environ.get('LUX_URL', 'http://localhost:3456/')

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(U)
    pg.wait_for_selector('#today')
    pg.evaluate("(p => { p.guide = { viesMasquees: 1 }; saveProgress(p); })(getProgress())")  # rappel des vies masqué (spec 36)
    ids = pg.evaluate("lecons.filter(l => isParcoursLecon(l) && l.mission && l.scene).map(l => l.id)")
    assert len(ids) == 24, ids
    for lid in ids:
        pg.evaluate("id => { const l = lecons.find(x => x.id === id); choisirNiveau(l.niveau); marquerIntroMissionVue(id); openParcoursLecon(l); openMission(); }", lid)
        k = 0
        while pg.locator('#ms-input').count():
            k += 1
            assert pg.inner_text('#ms-compteur') == '%d / 10' % k, (lid, pg.inner_text('#ms-compteur'))
            pg.fill('#ms-input', pg.evaluate("pLecon.scene[ms.idx].lu"))
            pg.click('#ms-btn-valider')
            assert pg.locator('#ms-continuer').count(), (lid, k, 'réponse attendue refusée', pg.evaluate("pLecon.scene[ms.idx].lu"))
            pg.click('#ms-continuer')
        bilan = pg.evaluate("ms.bilan")
        assert k == 10 and bilan['ok'] == 10 and bilan['total'] == 10 and bilan['vies'] == 3, (lid, k, bilan)
        assert pg.evaluate("id => missionReussie(lecons.find(x => x.id === id)) && getMissionBest(id) === 100", lid)
        print('  ok   leçon %d : 10 / 10, mission réussie' % lid, flush=True)
    assert not errs, errs
    b.close()
print('test_missions_10 : tout est vert')
