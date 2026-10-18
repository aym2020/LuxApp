"""Spec 32 : une mission réussie (au moins une vie) valide la leçon, sans
inventer d'étoile ni de coche ; une mission seulement jouée ne suffit pas ;
les acquis d'avant la mise à jour sont gardés."""
import os
from playwright.sync_api import sync_playwright
from helpers import relancer

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')


def ok(m):
    print('  ok  ', m, flush=True)


def jouer(pg, erreurs):
    """Joue la mission de pLecon : `erreurs` premières répliques fausses (une fois), le reste juste."""
    pg.evaluate("openMission()")
    for k in range(pg.evaluate("nbRepliquesToi(pLecon)")):
        lu = pg.evaluate("pLecon.scene[ms.idx].lu")
        if k < erreurs:
            pg.fill('#ms-input', 'Ech weess et net'); pg.click('#ms-btn-valider')
        pg.fill('#ms-input', lu); pg.click('#ms-btn-valider'); pg.click('#ms-continuer')
    return pg.evaluate("ms.bilan")


L1 = "lecons.find(l => l.id === 1)"

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.evaluate("(p => { p.guide = { viesMasquees: 1 }; saveProgress(p); })(getProgress())")  # rappel des vies masqué (spec 36)
    pg.evaluate("choisirNiveau('A1.1'); lecons.forEach(l => marquerIntroMissionVue(l.id))")

    # 1. Leçon 1 : unités 1 à 3 faites, unité 4 interrompue (partie principale), mission réussie avec 1 vie
    pg.evaluate("[1, 2, 3].forEach(u => saveUnitBest(1, u, 90)); openParcoursLecon(" + L1 + "); startUnite(4, 'unite')")
    assert pg.evaluate("loadRun(false).uniteId") == 4 and pg.evaluate("prochainPas().lecon.id") == 1
    pg.evaluate("openParcoursLecon(" + L1 + ")")
    bilan = jouer(pg, 2)
    assert bilan['vies'] == 1, bilan
    assert pg.evaluate("leconTerminee(" + L1 + ")") and pg.evaluate("leconValideeParMission(1)")
    assert pg.evaluate("getUnitBest(1, 4)") is None, 'aucune étoile inventée pour l\'unité 4'
    assert pg.evaluate("resumeLecon(" + L1 + ").done") == 3
    assert pg.evaluate("prochainPas().lecon.id") == 2, 'la leçon 2 devient le prochain pas'
    assert pg.evaluate("loadRun(false)") is None and pg.evaluate("loadRun(true).uniteId") == 4, 'unité 4 gardée en entraînement libre'
    assert 'Leçon suivante' in pg.inner_text('.ms-fin')
    ok('mission réussie avec 1 vie : leçon 1 validée, unité 4 sans étoile, partie de l\'unité 4 gardée en libre, leçon 2 proposée')

    pg.evaluate("goLessons()")
    assert pg.locator('#chemin-lecon-1.pas.fait').count() == 1 and 'Validée par la mission' in pg.inner_text('#chemin-lecon-1')
    assert pg.evaluate("progressionNiveau('A1.1').terminees") == 1
    ok('chemin : leçon 1 verte à sa place, « Validée par la mission » (pas d\'étoiles de leçon)')
    # Spec 33 : leçon 1 dépliée — unités 1 à 3 avec leurs vraies étoiles, unité 4 verte sans étoiles
    pg.click('#chemin-lecon-1 .carte-lecon')
    assert 'VALIDÉE PAR LA MISSION' in pg.inner_text('#chemin-lecon-1 .carte-tete').upper()
    assert pg.locator('#chemin-u-1-4.ok.par-mission').count() == 1 and pg.locator('#chemin-u-1-4 .pc-star').count() == 0
    assert 'validée par la mission' in pg.inner_text('#chemin-u-1-4').lower()
    assert 'non réalisée' in pg.get_attribute('#chemin-u-1-4 button', 'aria-label')
    assert pg.locator('#chemin-u-1-1 .pc-star.on').count() >= 1 and pg.locator('#chemin-u-1-1.par-mission').count() == 0
    assert pg.evaluate("getUnitBest(1, 4)") is None
    ok('leçon 1 dépliée : unités 1–3 et leurs étoiles réelles, unité 4 verte « Validée par la mission » sans étoiles, lue « non réalisée »')
    # En-tête stable : pas d'animation d'entrée ni de déplacement quand on déplie / replie
    haut = "(() => { const r = document.querySelector('.chemin-tete').getBoundingClientRect(); return r.top + scrollY; })()"
    y0 = pg.evaluate(haut)
    for lid in (1, 2, 2, 1):
        pg.evaluate("id => basculerLeconChemin(id)", lid)
        assert pg.locator('.chemin-tete.entre').count() == 0, "pas d'animation de l'en-tête"
        assert pg.evaluate("getComputedStyle(document.querySelector('.chemin-tete')).animationName") == 'none'
        assert pg.evaluate(haut) == y0
    ok('en-tête du chemin : plus d\'animation d\'entrée en dépliant / repliant les leçons')

    # 2. Leçon 2 : toutes les unités faites, mission perdue (0 vie) → pas terminée, la mission revient
    pg.evaluate("unitesCoeur(lecons.find(l => l.id === 2)).forEach(u => saveUnitBest(2, u.id, 90)); openParcoursLecon(lecons.find(l => l.id === 2))")
    bilan = jouer(pg, 3)
    assert bilan['vies'] == 0
    assert not pg.evaluate("leconTerminee(lecons.find(l => l.id === 2))")
    pas = pg.evaluate("(p => ({ lecon: p.lecon.id, type: p.type }))(prochainPas())")
    assert pas == {'lecon': 2, 'type': 'mission'}, pas
    ok('mission jouée mais perdue : leçon 2 pas terminée, la mission reste le prochain pas')

    # 3. Anciennes données : leçon terminée avec une mission jouée à 50 %, mission « Sans faute »
    pg.evaluate("""(p => { p[3] = {}; p[4] = {}; saveProgress(p); })(getProgress());
      unitesCoeur(lecons.find(l => l.id === 3)).forEach(u => saveUnitBest(3, u.id, 95)); saveMissionBest(3, 50);
      saveMissionBest(4, 100)""")
    assert pg.evaluate("leconTerminee(lecons.find(l => l.id === 3))"), 'terminée avant la mise à jour : reste terminée'
    assert pg.evaluate("leconAcquiseParMission(lecons.find(l => l.id === 4)) && leconTerminee(lecons.find(l => l.id === 4))")
    # Spec 34 : l'ancien « Sans faute » (scène version 1) ne valide pas la nouvelle scène à 10 réponses
    assert not pg.evaluate("missionReussie(lecons.find(l => l.id === 4))") and pg.evaluate("getMissionBest(4)") is None
    assert pg.evaluate("getUnitBest(4, 1)") is None
    etoiles3 = pg.evaluate("resumeLecon(lecons.find(l => l.id === 3)).stars")
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 3))")
    jouer(pg, 3)  # nouvelle partie perdue
    assert pg.evaluate("leconTerminee(lecons.find(l => l.id === 3))"), 'acquis historique figé'
    assert pg.evaluate("resumeLecon(lecons.find(l => l.id === 3)).stars") == etoiles3
    ok('historique : leçon terminée avec mission à 50 % reste terminée (même après une partie perdue) ; ancien « Sans faute » garde la leçon acquise sans rejouer, sans valider la nouvelle scène')

    # 4. Rechargement : tout est gardé
    relancer(pg)
    pg.evaluate("(p => { p.guide = { viesMasquees: 1 }; saveProgress(p); })(getProgress())")  # rappel des vies masqué (spec 36)
    assert pg.evaluate("leconTerminee(" + L1 + ") && getUnitBest(1, 4) == null && loadRun(true).uniteId === 4")
    ok('après rechargement : validation, unité 4 non faite et partie libre conservées')

    assert not errs, errs
    b.close()
print('test_mission_validation : tout est vert')
