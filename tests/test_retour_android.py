"""Retour du téléphone et accordéon du chemin (20/10/2026).
1. Accueil → Chemin → « Voir toute la leçon » : Retour → Chemin, Retour → Accueil.
   Aucune entrée d'historique n'est ajoutée pendant un Retour : Chrome Android
   saute les entrées ajoutées sans appui, et l'app se fermait au 2e Retour.
2. En haut du chemin, tout replié : déplier la leçon 1 ne fait pas défiler la page."""
from playwright.sync_api import sync_playwright
from helpers import ok, vue, URL

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('#today')
    pg.evaluate("(p => { p.guide = { viesMasquees: 1 }; saveProgress(p); })(getProgress())")  # rappel des vies masqué
    pg.evaluate("choisirNiveau('A1.1'); marquerIntroMissionVue(1); goDashboard()")
    # Compte les pushState faits pendant le traitement d'un Retour.
    pg.evaluate("""() => {
        window.__pushPendantRetour = 0; window.__dansRetour = false;
        const push = history.pushState.bind(history);
        history.pushState = (...a) => { if (window.__dansRetour) window.__pushPendantRetour++; return push(...a); };
        window.addEventListener('popstate', () => { window.__dansRetour = true; setTimeout(() => { window.__dansRetour = false; }, 50); }, true);
    }""")

    # ── 1. Accueil → Chemin → toute la leçon → Retour × 2 ──
    pg.click('.ac-btn:has-text("Leçons")')
    pg.wait_for_function("document.getElementById('view-lessons').classList.contains('active')")
    pg.evaluate("id => { cheminLeconOuverte = null; renderLessons(); basculerLeconChemin(id); }", 1)
    pg.click('#chemin-lecon-1 .lien-or')
    assert vue(pg) == 'view-plecon', vue(pg)
    assert pg.evaluate('history.state && history.state.n') == 2, pg.evaluate('history.state')
    pg.go_back(); pg.wait_for_timeout(200)
    assert vue(pg) == 'view-lessons', vue(pg)
    pg.go_back(); pg.wait_for_timeout(200)
    assert vue(pg) == 'view-dashboard', vue(pg)
    assert pg.evaluate('window.__pushPendantRetour') == 0, 'pushState pendant un Retour'
    assert pg.evaluate('!history.state || history.state.luxapp !== "garde"'), pg.evaluate('history.state')
    ok('Accueil → Chemin → leçon : Retour → Chemin → Accueil, sans entrée ajoutée pendant un Retour')

    # Retour depuis un exercice remplacé (intro → exercice) : un seul cran
    pg.click('.ac-btn:has-text("Leçons")')
    pg.wait_for_function("document.getElementById('view-lessons').classList.contains('active')")
    pg.evaluate("ouvrirUniteDepuisChemin(1, 2)")
    pg.click('#pi-commencer')
    assert vue(pg) == 'view-parcours', vue(pg)
    pg.go_back(); pg.wait_for_timeout(200)
    assert vue(pg) == 'view-lessons', vue(pg)
    pg.go_back(); pg.wait_for_timeout(200)
    assert vue(pg) == 'view-dashboard', vue(pg)
    assert pg.evaluate('window.__pushPendantRetour') == 0
    ok('Chemin → unité → exercice : Retour → Chemin → Accueil')

    # Onglet Accueil de la barre : les gardes sont retirées (Retour quitte ensuite)
    pg.click('.ac-btn:has-text("Leçons")')
    pg.click('#chemin-lecon-1 .lien-or') if pg.is_visible('#chemin-lecon-1 .lien-or') else pg.evaluate("openParcoursLecon(lecons.find(l => l.id === 1))")
    pg.evaluate('goLessons()')
    pg.click('#nav-bas [data-nav="accueil"]')
    pg.wait_for_timeout(200)
    assert vue(pg) == 'view-dashboard' and pg.evaluate('!history.state || history.state.luxapp !== "garde"')
    ok('retour à l\'accueil par la barre : plus aucune garde')

    # ── 2. Accordéon en haut de page : la page ne bouge pas ──
    pg.evaluate("goLessons(); cheminLeconOuverte = null; renderLessons(); window.scrollTo(0, 0)")
    pg.wait_for_timeout(100)
    haut = pg.evaluate("document.getElementById('chemin-lecon-1').getBoundingClientRect().top")
    pg.click('#chemin-lecon-1 .carte-lecon'); pg.wait_for_timeout(300)
    assert pg.locator('#chemin-lecon-1.ouverte').count() == 1
    assert pg.evaluate('scrollY') == 0, pg.evaluate('scrollY')
    assert abs(pg.evaluate("document.getElementById('chemin-lecon-1').getBoundingClientRect().top") - haut) < 1
    ok('en haut du chemin, déplier la leçon 1 : la page reste fixe')

    # Carte tout en bas : la leçon ouverte est cadrée (sinon rien ne serait visible)
    pg.evaluate("cheminLeconOuverte = null; renderLessons(); window.scrollTo(0, 0)")
    bas = pg.evaluate("basVisibleChemin()")
    lid = pg.evaluate("""bas => [...document.querySelectorAll('#lecon-list .pas.replie')]
        .find(e => { const r = e.getBoundingClientRect(); return r.top < bas && r.bottom > bas - 80; })?.id""", bas)
    if lid:
        n = int(lid.split('-')[-1])
        pg.click('#%s .carte-lecon' % lid); pg.wait_for_timeout(300)
        r = pg.evaluate("id => document.querySelector('#chemin-lecon-' + id + ' .unites li').getBoundingClientRect().bottom", n)
        assert r <= bas + 1, (r, bas)
        ok('leçon %d en bas de l\'écran : dépliée et cadrée, 1re étape visible' % n)

    print('\nErreurs JavaScript :', erreurs or 'aucune')
    assert not erreurs
    b.close()
