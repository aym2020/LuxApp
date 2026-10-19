"""Spec 18 : explorer une leçon (unités, Tente ta chance) sans la « commencer »,
et revenir à l'introduction. Bouton Retour de l'app et du téléphone. Téléphone simulé."""
import os
from playwright.sync_api import sync_playwright
from helpers import relancer

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')


def ok(m):
    print('  ok  ', m, flush=True)


def actif(pg, v):
    return pg.evaluate("id => document.getElementById(id).classList.contains('active')", v)


def cta(pg, lid):
    return pg.inner_text('#chemin-lecon-%d .btn-jaune' % lid)


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.evaluate("(p => { p.guide = { viesMasquees: 1 }; saveProgress(p); })(getProgress())")  # rappel des vies masqué (spec 36)
    pg.evaluate("choisirNiveau('A1.1'); goLessons()")

    # Chemin → Découvrir → Retour : chemin, leçon 1 dépliée
    assert cta(pg, 1) == 'Découvrir'
    pg.click('#chemin-lecon-1 .btn-jaune')
    assert actif(pg, 'view-msintro')
    pg.go_back(); pg.wait_for_timeout(200)
    assert actif(pg, 'view-lessons') and pg.locator('#chemin-lecon-1.ouverte').count() == 1
    ok('Chemin → Découvrir → Retour du téléphone : chemin, leçon 1 dépliée')

    # Découvrir → Voir les unités → Retour : introduction ; « Découvrir » reste
    pg.click('#chemin-lecon-1 .btn-jaune')
    pg.click('#msi-content button:has-text("Voir les unités")')
    assert actif(pg, 'view-plecon') and 'Introduction' in pg.inner_text('#view-plecon [data-retour]')
    pg.click('#view-plecon [data-retour]'); pg.wait_for_timeout(200)
    assert actif(pg, 'view-msintro')
    assert not pg.evaluate('getIntroMissionVue(1)')
    ok('Découvrir → Voir les unités → Retour : introduction, rien de confirmé')

    # Découvrir → Tente ta chance (ouverte puis abandonnée) → Retour du téléphone : introduction
    pg.click('#msi-content .msi-tenter')
    assert actif(pg, 'view-mission')
    pg.go_back(); pg.wait_for_timeout(200)
    assert actif(pg, 'view-msintro')
    pg.go_back(); pg.wait_for_timeout(200)
    assert actif(pg, 'view-lessons') and cta(pg, 1) == 'Découvrir'
    ok('Tente ta chance abandonnée → Retour : introduction, puis chemin ; toujours « Découvrir »')

    # Après rechargement : toujours « Découvrir »
    relancer(pg); pg.evaluate('goLessons()')
    assert cta(pg, 1) == 'Découvrir'
    ok('après rechargement : leçon seulement consultée → « Découvrir »')

    # Introduction → J'ai compris → 1re unité → Retour : chemin (spec 38 : introduction consommée)
    pg.click('#chemin-lecon-1 .btn-jaune')
    pg.click('#msi-content button.primary')
    assert actif(pg, 'view-pintro') and 'Mon chemin' in pg.get_attribute('#view-pintro [data-retour]', 'aria-label')
    pg.click('#view-pintro [data-retour]'); pg.wait_for_timeout(200)
    assert actif(pg, 'view-lessons')
    ok('J\'ai compris → 1re unité → Retour : chemin, plus l\'introduction (spec 38)')
    assert cta(pg, 1) == 'Commencer'
    ok('introduction confirmée mais rien commencé : « Commencer » (spec 48)')

    # Chemin → unité 2 directement → Retour : chemin, unité 2 visible
    pg.click('#chemin-u-1-2 button')
    assert actif(pg, 'view-pintro')
    pg.go_back(); pg.wait_for_timeout(200)
    assert actif(pg, 'view-lessons') and pg.locator('#chemin-u-1-2').count() == 1
    ok('Chemin → unité 2 → Retour : chemin')

    # Apprentissage réel : une réponse → « Commencer » / « Reprendre »
    pg.click('#chemin-u-1-1 button'); pg.click('#pi-commencer')
    pg.locator('#mc-btn-reconstruire').count() and pg.click('#mc-btn-reconstruire')
    pg.fill('#mc-input', pg.evaluate("motATaper(pLecon, trouverItem(pLecon,'flashcards', run.steps[run.stepIdx].queue[0]))"))
    pg.click('#mc-btn-valider'); pg.click('#pc-continuer')
    pg.click('#view-parcours [data-retour]'); pg.wait_for_timeout(200)
    assert actif(pg, 'view-lessons') and cta(pg, 1) != 'Découvrir', cta(pg, 1)
    ok('leçon vraiment commencée : « %s »' % cta(pg, 1))

    print('\nErreurs JavaScript :', errs or 'aucune')
    assert not errs
    b.close()
