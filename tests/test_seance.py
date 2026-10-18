"""Séance du jour : quitter par « Accueil » puis reprendre, point du jour."""
import os
import sys
from playwright.sync_api import sync_playwright
from helpers import relancer

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
    # 0 = rien, 1 = commencé, 2 = objectif atteint (S7 : révision ET unité)
    return page.evaluate("getJours()[dayString(0)] || 0")


def tuile(page):
    return page.inner_text('.ac-btn.rev')


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
    assert jour(page) == 0, jour(page)
    assert '60' in tuile(page) and 'à revoir' in tuile(page), tuile(page)
    print('  ok   avant la séance : point du jour vide, « Réviser · 60 à revoir »')

    page.click('.ac-btn.rev')
    premieres = page.evaluate('session.questions.map(x => x.leconId + "-" + x.type + "-" + x.qid)')
    assert len(premieres) == 20
    for i in range(7):
        repondre_session(page, juste=(i % 2 == 0))
    score = page.evaluate('session.score')

    # Retour à l'accueil au milieu de la séance
    page.click('#view-session .back-btn')
    assert '7 / 20' in tuile(page), tuile(page)
    assert 'à finir' in tuile(page)
    assert jour(page) == 1, jour(page)
    page.screenshot(path=OUT + 's01-accueil-seance-commencee.png', full_page=True)
    print('  ok   accueil : « Réviser · 7 / 20 à finir » · point = commencé')

    # Rechargement de la page (fermer l'appli) : toujours reprenable
    relancer(page)
    assert '7 / 20' in tuile(page)

    page.click('.ac-btn.rev')
    assert page.evaluate('session.index') == 7
    assert page.evaluate('session.score') == score
    assert page.evaluate('session.questions.map(x => x.leconId + "-" + x.type + "-" + x.qid)') == premieres
    compteur = page.evaluate("document.querySelector('#view-session .progress-text, #session-progress-text') ? 1 : 0")
    print('  ok   reprise : question 8 / 20, même liste, score gardé (' + str(score) + ')')

    while page.evaluate("!document.getElementById('session-q').classList.contains('hidden')"):
        repondre_session(page)
    assert page.evaluate("loadSeance()") is None
    actions = page.locator('#session-actions button').all_inner_texts()
    assert actions[0].startswith('Continuer'), actions  # la leçon d'abord (S7)
    page.click('#session-actions button:has-text("Accueil")')
    assert 'Fait' in tuile(page), tuile(page)
    assert jour(page) == 1, 'révision seule : jour « commencé » (S7)'
    page.evaluate('marquerUniteFaite(); goDashboard()')
    assert jour(page) == 2, 'révision + unité : objectif atteint'
    page.screenshot(path=OUT + 's02-accueil-seance-finie.png', full_page=True)
    print('  ok   séance finie : fin = ' + ' | '.join(actions) + ' · « Fait » · point plein seulement avec une unité')

    # Séance d'hier : oubliée
    page.evaluate("""() => {
        localStorage.setItem(storageKey(SEANCE_KEY), JSON.stringify({ date: '2020-01-01',
            questions: [{ leconId: 1, type: 'quiz', qid: 1 }, { leconId: 1, type: 'quiz', qid: 2 }], index: 1, score: 1 }));
        goDashboard();
    }""")
    assert '/ 20' not in tuile(page) and 'à finir' not in tuile(page)
    print("  ok   séance d'un autre jour : ignorée")

    print('  erreurs JS :', erreurs or 'aucune')
    nav.close()
