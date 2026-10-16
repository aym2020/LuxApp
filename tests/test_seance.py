"""Séance du jour : quitter par « Accueil » puis reprendre, point du jour."""
import os
import sys
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'captures') + '/'
os.makedirs(OUT, exist_ok=True)
erreurs = []


def repondre_session(page, juste=True):
    q = page.evaluate('session.questions[session.index]')
    t, it = q['type'], q['q']
    if t in ('quiz', 'trous'):
        bonne = it['reponse'] if t == 'quiz' else it['trou']
        boutons = page.locator('#session-choices .choice')
        for i in range(boutons.count()):
            txt = boutons.nth(i).inner_text()
            if (txt == bonne) == juste:
                boutons.nth(i).click()
                break
        page.wait_for_function('session.answered', timeout=3000)
        if page.locator('#view-session .ecr-next-btn').count():
            page.click('#view-session .ecr-next-btn')
        else:
            idx = page.evaluate('session.index')
            page.wait_for_function('i => session.index > i || !document.getElementById("session-result").classList.contains("hidden")', arg=idx, timeout=4000)
    else:
        page.fill('#session-input', it['lu'] if juste else 'xxx')
        page.click('#session-input-btn')
        if not juste:  # 2 essais (S6) : le 1er raté laisse réessayer
            page.fill('#session-input', 'xxx')
            page.click('#session-input-btn')
        page.click('#view-session .ecr-next-btn')


def jour(page):
    return page.evaluate("document.querySelector('#today .td-jour.auj').className")


with sync_playwright() as p:
    nav = p.chromium.launch()
    page = nav.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    page.route('**/*gstatic*/**', lambda r: r.abort())
    page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    page.on('pageerror', lambda e: erreurs.append(str(e)))
    page.on('dialog', lambda d: d.accept())
    page.goto(URL)
    page.wait_for_selector('#today')

    # Historique : 60 questions vues il y a 40 jours, avec une erreur active -> toutes dues.
    page.evaluate("""() => {
        const items = [];
        leconsActives().forEach(l => itemsRevision(l).forEach(x => items.push(x)));
        items.slice(0, 60).forEach(x => updateQuestionStats(x.leconId, x.type, x.qid, false));
        const store = getStatsStore();
        const wrong = getWrongStore();
        const vieux = new Date(Date.now() - 40 * 86400000).toISOString();
        items.slice(0, 60).forEach(x => {
            store[x.leconId][x.type][x.qid].lastSeenAt = vieux;
            if (!wrong[x.leconId]) wrong[x.leconId] = {};
            if (!wrong[x.leconId][x.type]) wrong[x.leconId][x.type] = {};
            wrong[x.leconId][x.type][x.qid] = 1;
        });
        saveStatsStore(store);
        saveWrongStore(wrong);
        goDashboard();
    }""")
    assert 'pratique' not in jour(page) and 'objectif' not in jour(page), jour(page)
    print('  ok   avant la séance : point du jour vide')

    page.click('#today button:has-text("Ma séance")')
    premieres = page.evaluate('session.questions.map(x => x.leconId + "-" + x.type + "-" + x.qid)')
    assert len(premieres) == 20
    for i in range(7):
        repondre_session(page, juste=(i % 2 == 0))
    score = page.evaluate('session.score')

    # Retour à l'accueil au milieu de la séance
    page.click('#view-session .back-btn')
    bouton = page.inner_text('#today button.pc-btn.primary')
    ligne = page.inner_text('#today .td-ligne')
    assert bouton == 'Reprendre ma séance · 7 / 20', bouton
    assert 'Séance commencée : 7 / 20' in ligne, ligne
    assert 'pratique' in jour(page) and 'objectif' not in jour(page), jour(page)
    assert 'finir ta séance' in page.inner_text('#today .td-objectif')
    page.screenshot(path=OUT + 's01-accueil-seance-commencee.png', full_page=True)
    print('  ok   accueil :', bouton, '·', ligne.replace('\n', ' '), '· point = commencé')

    # Rechargement de la page (fermer l'appli) : toujours reprenable
    page.reload()
    page.wait_for_selector('#today')
    assert page.inner_text('#today button.pc-btn.primary') == 'Reprendre ma séance · 7 / 20'

    page.click('#today button:has-text("Reprendre ma séance")')
    assert page.evaluate('session.index') == 7
    assert page.evaluate('session.score') == score
    assert page.evaluate('session.questions.map(x => x.leconId + "-" + x.type + "-" + x.qid)') == premieres
    compteur = page.evaluate("document.querySelector('#view-session .progress-text, #session-progress-text') ? 1 : 0")
    print('  ok   reprise : question 8 / 20, même liste, score gardé (' + str(score) + ')')

    while page.evaluate("!document.getElementById('session-q').classList.contains('hidden')"):
        repondre_session(page)
    assert page.evaluate("loadSeance()") is None
    page.click('#session-actions button:has-text("Terminer")')
    assert 'objectif' in jour(page), jour(page)
    assert page.inner_text('#today button.pc-btn.primary') == 'Ma séance'
    page.screenshot(path=OUT + 's02-accueil-seance-finie.png', full_page=True)
    print('  ok   séance finie : point plein (objectif), bouton redevient « Ma séance »')

    # Séance d'hier : oubliée
    page.evaluate("""() => {
        localStorage.setItem(storageKey(SEANCE_KEY), JSON.stringify({ date: '2020-01-01',
            questions: [{ leconId: 1, type: 'quiz', qid: 1 }, { leconId: 1, type: 'quiz', qid: 2 }], index: 1, score: 1 }));
        goDashboard();
    }""")
    assert page.inner_text('#today button.pc-btn.primary') == 'Ma séance'
    print("  ok   séance d'un autre jour : ignorée")

    print('  erreurs JS :', erreurs or 'aucune')
    nav.close()
