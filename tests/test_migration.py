"""Leçons migrées au format en unités (toutes les 24 leçons : 1–17 et 20–26).
Pour chaque leçon : l'écran de la leçon s'affiche, chaque unité se joue de bout
en bout sans faute, la mission se joue sans faute, le bilan démarre, et la
leçon devient terminée sur le chemin. Format mobile."""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')
LECONS = list(range(1, 18)) + list(range(20, 27))
erreurs_js = []


def ok(msg):
    print('  ok  ', msg)


def actif(page, vue):
    return page.evaluate("id => document.getElementById(id).classList.contains('active')", vue)

def cible(page, it):
    # Ce qu'on tape dans le mot caché (S5 : l'article en plus dans les unités « article à écrire »).
    return page.evaluate("id => motATaper(pLecon, trouverItem(pLecon, 'flashcards', id))", it['id'])


def repondre(page):
    c = page.evaluate("""() => {
        const s = run.steps[run.stepIdx];
        return { type: s.type, item: trouverItem(pLecon, s.type, s.queue[0]) };
    }""")
    t, it = c['type'], c['item']
    if t == 'flashcards':
        page.locator('#mc-btn-reconstruire').count() and page.click('#mc-btn-reconstruire')  # mot nouveau : découverte d'abord
        page.fill('#mc-input', cible(page, it))
        page.click('#mc-btn-valider')
        page.click('#pc-continuer')
    elif t in ('quiz', 'trous'):
        bonne = it['reponse'] if t == 'quiz' else it['trou']
        boutons = page.locator('#pc-choix .choice')
        trouve = False
        for i in range(boutons.count()):
            if boutons.nth(i).inner_text() == bonne:
                boutons.nth(i).click()
                trouve = True
                break
        assert trouve, ('bonne réponse absente des choix', t, it['id'], bonne)
        page.wait_for_function('!pAttente', timeout=4000)
    else:
        page.fill('#pc-ecr-input', it['lu'])
        page.click('#pc-body .pc-btn.primary')
        page.click('#pc-continuer')


def jouer_mission(page):
    n = 0
    while page.locator('#ms-input').count() and n < 20:
        n += 1
        reponse = page.evaluate('pLecon.scene[ms.idx].lu')
        page.fill('#ms-input', reponse)
        page.click('#ms-btn-valider')
        page.locator('#ms-continuer').count() and page.click('#ms-continuer')
    return n


with sync_playwright() as p:
    nav = p.chromium.launch()
    page = nav.new_page(viewport={'width': 390, 'height': 844})
    page.route('**/*gstatic*/**', lambda r: r.abort())
    page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    page.on('pageerror', lambda e: erreurs_js.append(str(e)))
    page.on('dialog', lambda d: d.accept())
    page.goto(URL)
    page.wait_for_selector('#today')
    page.evaluate("(p => { p.guide = { viesMasquees: 1 }; saveProgress(p); })(getProgress())")  # rappel des vies masqué (spec 36)
    page.evaluate("choisirNiveau('A1.1')")
    page.evaluate("lecons.forEach(l => marquerIntroMissionVue(l.id))")  # introduction de mission : testée ailleurs

    for lid in LECONS:
        page.evaluate("id => openParcoursLecon(lecons.find(l => l.id === id))", lid)
        assert actif(page, 'view-plecon')
        assert page.locator('.ms-carte').count() == 1, 'carte mission absente'
        unites = page.evaluate('unitesCoeur(pLecon).map(u => u.id)')
        items = 0
        for u in unites:
            page.evaluate("u => startUnite(u, 'unite')", u)
            n = 0
            while actif(page, 'view-parcours') and n < 200:
                n += 1
                repondre(page)
            items += n
            assert actif(page, 'view-pfin'), ('unité', u, 'non terminée')
            assert page.evaluate('pResultat.total') == 100, ('score', lid, u, page.evaluate('pResultat.total'))
        page.evaluate('openParcoursLecon(pLecon); openMission()')
        dites = jouer_mission(page)
        assert page.evaluate('getMissionBest(pLecon.id)') == 100, 'mission pas à 100 %'
        page.evaluate('lancerBilan()')
        assert actif(page, 'view-session') and page.evaluate('session.questions.length') == 10
        assert page.evaluate('id => leconTerminee(lecons.find(l => l.id === id))', lid)
        ok('leçon %d : %d unités jouées sans faute (%d items), mission %d répliques à 100 %%, bilan 10 questions, terminée'
           % (lid, len(unites), items, dites))

    print('\nErreurs JavaScript :', erreurs_js or 'aucune')
    assert not erreurs_js
    nav.close()
