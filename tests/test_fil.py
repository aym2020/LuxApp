"""Tests v2c : leçons avec un fil (mission, phrase d'unité, « + », bonus),
séance du jour limitée à 20 + « Encore », étalement de l'historique v1. Format mobile."""
import os
import sys
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'captures') + '/'
os.makedirs(OUT, exist_ok=True)
erreurs_js = []


def ok(msg):
    print('  ok  ', msg)


def actif(page, vue):
    return page.evaluate("id => document.getElementById(id).classList.contains('active')", vue)

def cible(page, it):
    # Ce qu'on tape dans le mot caché (S5 : l'article en plus dans les unités « article à écrire »).
    return page.evaluate("id => motATaper(pLecon, trouverItem(pLecon, 'flashcards', id))", it['id'])


def item_courant(page):
    return page.evaluate("""() => {
        const s = run.steps[run.stepIdx];
        return { type: s.type, item: trouverItem(pLecon, s.type, s.queue[0]) };
    }""")


def repondre(page):
    c = item_courant(page)
    t, it = c['type'], c['item']
    if t == 'flashcards':
        page.locator('#mc-btn-reconstruire').count() and page.click('#mc-btn-reconstruire')  # mot nouveau : découverte d'abord
        page.fill('#mc-input', cible(page, it))
        page.click('#mc-btn-valider')
        page.click('#pc-continuer')
    elif t in ('quiz', 'trous'):
        bonne = it['reponse'] if t == 'quiz' else it['trou']
        boutons = page.locator('#pc-choix .choice')
        for i in range(boutons.count()):
            if boutons.nth(i).inner_text() == bonne:
                boutons.nth(i).click()
                break
        page.wait_for_function('!pAttente', timeout=4000)
    else:
        page.fill('#pc-ecr-input', it['lu'])
        page.click('#pc-body .pc-btn.primary')
        page.click('#pc-continuer')


def finir_partie(page):
    n = 0
    while actif(page, 'view-parcours') and n < 600:
        n += 1
        repondre(page)
    return n


def repondre_session(page):
    q = page.evaluate('session.questions[session.index]')
    t, it = q['type'], q['q']
    if t in ('quiz', 'trous'):
        bonne = it['reponse'] if t == 'quiz' else it['trou']
        boutons = page.locator('#session-choices .choice')
        for i in range(boutons.count()):
            if boutons.nth(i).inner_text() == bonne:
                boutons.nth(i).click()
                break
        page.wait_for_function('session.answered', timeout=3000)
        if page.locator('#view-session .ecr-next-btn').count():
            page.click('#view-session .ecr-next-btn')
        else:
            idx = page.evaluate('session.index')
            page.wait_for_function('i => session.index > i || !document.getElementById("session-result").classList.contains("hidden")', arg=idx, timeout=4000)
    else:
        page.fill('#session-input', it['lu'])
        page.click('#session-input-btn')
        page.click('#view-session .ecr-next-btn')


def finir_session(page):
    n = 0
    while page.evaluate("!document.getElementById('session-q').classList.contains('hidden')") and n < 100:
        n += 1
        repondre_session(page)


with sync_playwright() as p:
    nav = p.chromium.launch()
    page = nav.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    page.route('**/*gstatic*/**', lambda r: r.abort())
    page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    page.on('pageerror', lambda e: erreurs_js.append(str(e)))
    page.on('dialog', lambda d: d.accept())
    page.goto(URL)
    page.wait_for_selector('#today')

    # ── 1. Leçon 8 : la mission en haut, la scène floutée ──
    page.evaluate("openParcoursLecon(lecons.find(l => l.id === 8))")
    if page.locator('#view-msintro.active').count():
        page.click('#msi-content button:has-text("Voir les unités")')
    assert page.locator('.ms-carte').count() == 1
    page.evaluate('voirScenario()')
    assert page.locator('.panneau .ms-bulle').count() == 9
    assert page.locator('.panneau .ms-pastille.apprise').count() == 0  # scène lisible, rien d'appris (S4)
    page.evaluate('fermerPanneau()')
    assert page.locator('.pl-unit-phrase').count() == 3
    chip = page.locator('.pl-unit:has-text("UNITÉ 1") .pc-chip.plus').inner_text()
    assert chip == '+14 mots · S\'entraîner', chip
    page.screenshot(path=OUT + 'c01-lecon8.png', full_page=True)
    ok('leçon 8 : carte mission, 9 répliques lisibles, phrase sur chaque unité, chip « ' + chip + ' »')

    # ── 2. Avant de commencer : phrase, « + » replié ──
    page.click('.pl-unit:has-text("UNITÉ 1") button:has-text("Commencer")')
    assert page.inner_text('.pi-phrase-lu') == 'Ech si Fransous.'
    assert page.locator('details.pi-plus').count() == 1
    assert not page.evaluate("document.querySelector('details.pi-plus').open")
    page.click('details.pi-plus summary')
    page.screenshot(path=OUT + 'c02-intro.png', full_page=True)
    ok('intro : la phrase de l\'unité, puis « Voir les 14 mots supplémentaires » replié')

    # ── 3. Unité 1 : seulement le cœur ──
    page.click('#pi-content button:has-text("Commencer")')
    total = page.evaluate('run.steps.reduce((a, s) => a + s.total, 0)')
    attendu = page.evaluate("nbItems(pLecon, 1, 'coeur')")
    assert total == attendu and total < 40, (total, attendu)
    finir_partie(page)
    assert actif(page, 'view-pfin')
    assert page.locator('.ms-debloque .ms-bulle').count() == 2
    boutons = page.locator('.pf-boutons button').all_inner_texts()
    assert boutons[0] == 'Unité suivante →' and boutons[1].startswith('Élargir : 14 mots de plus'), boutons
    page.screenshot(path=OUT + 'c03-fin-unite.png', full_page=True)
    ok('unité 1 : ' + str(total) + ' items (cœur seul) · « Ta mission avance » (2 répliques) · ' + ' | '.join(boutons))

    # ── 4. Élargir : seulement le « + » ──
    page.click('.pf-boutons button:has-text("Élargir")')
    total_plus = page.evaluate('run.steps.reduce((a, s) => a + s.total, 0)')
    assert total_plus == page.evaluate("nbItems(pLecon, 1, 'plus')")
    assert page.evaluate("run.steps.every(s => s.queue.every(id => trouverItem(pLecon, s.type, id).plus))")
    finir_partie(page)
    assert '« + » TERMINÉ' in page.inner_text('.pf-haut')
    assert page.evaluate('getPlusFait(8, 1)')
    assert page.evaluate('getUnitBest(8, 1)') == 100  # le « + » ne change pas les étoiles
    page.screenshot(path=OUT + 'c04-fin-plus.png', full_page=True)
    page.click('#pf-content button:has-text("Retour à la leçon")')
    assert page.locator('.pl-unit:has-text("UNITÉ 1") .pc-chip.plus.fait').count() == 1
    page.evaluate('voirScenario()')
    assert page.locator('.panneau .ms-pastille.apprise').count() == 2
    page.evaluate('fermerPanneau()')
    ok('« + » : ' + str(total_plus) + ' items, tous « plus » · chip coché · étoiles inchangées · 2 répliques débloquées')

    # ── 5. Unités 2 et 3, puis la mission conseillée ──
    for u in (2, 3):
        page.click('.pl-unit:has-text("UNITÉ %d") button:has-text("Commencer")' % u)
        page.click('#pi-content button:has-text("Commencer")')
        finir_partie(page)
        if u == 2:
            page.click('#pf-content button:has-text("Retour à la leçon")')
    boutons = page.locator('.pf-boutons button').all_inner_texts()
    assert 'Jouer la mission' in boutons, boutons
    ok('fin du fil : « ' + boutons[[b for b in boutons].index('Jouer la mission')] + ' » proposé')

    # ── 6. La mission : une erreur (aide), voir la réponse, puis le reste juste ──
    page.click('.pf-boutons button:has-text("Jouer la mission")')
    assert actif(page, 'view-mission')
    page.fill('#ms-input', 'Ech sinn Fransous')
    page.click('#ms-btn-valider')
    assert page.locator('#ms-erreur:not(.hidden)').count() == 1  # aide en deux temps (S6)
    page.screenshot(path=OUT + 'c05-mission-erreur.png', full_page=True)
    page.fill('#ms-input', 'faux')
    page.click('#ms-btn-valider')
    assert page.locator('#ms-btn-voir:not(.hidden)').count() == 1
    page.click('#ms-btn-voir')
    page.click('#ms-continuer')
    scene = page.evaluate('pLecon.scene')
    n = 0
    while page.locator('#ms-input').count() and n < 20:
        n += 1
        idx = page.evaluate('ms.idx')
        page.fill('#ms-input', scene[idx]['lu'].replace('!', ''))  # la ponctuation est ignorée
        page.keyboard.press('Enter')
        page.locator('#ms-continuer').count() and page.click('#ms-continuer')
    assert page.locator('.ms-fin').count() == 1
    score = page.evaluate('getMissionBest(8)')
    assert score == 75, score
    page.screenshot(path=OUT + 'c06-mission-fin.png', full_page=True)
    ok('mission : aide à l\'erreur, « Voir la réponse » après 2 essais, score ' + str(score) + ' % (3/4 du premier coup)')

    page.click('.ms-fin button:has-text("Rejouer")')
    n = 0
    while page.locator('#ms-input').count() and n < 20:
        n += 1
        page.fill('#ms-input', scene[page.evaluate('ms.idx')]['lu'])
        page.keyboard.press('Enter')
        page.locator('#ms-continuer').count() and page.click('#ms-continuer')
    assert 'sans faute' in page.inner_text('.ms-fin .pf-sansfaute').lower()
    assert page.evaluate('getMissionBest(8)') == 100
    page.click('.ms-fin button:has-text("Retour ·")')
    assert page.locator('.ms-carte .ms-bulle.cachee').count() == 0
    assert 'SANS FAUTE' in page.inner_text('.ms-carte .pc-mini-label')
    page.screenshot(path=OUT + 'c07-lecon8-mission.png', full_page=True)
    ok('mission rejouée sans faute → 100 %, scène entière visible, « MISSION · SANS FAUTE »')

    # ── 7. Panneau Cours : « Voir + » replié ──
    page.click('#view-plecon .pc-cours-btn')
    assert page.locator('#cp-content details.cp-plus').count() == 1
    page.click('#cp-content details.cp-plus summary')
    page.screenshot(path=OUT + 'c08-cours-plus.png')
    page.evaluate('fermerCours()')
    ok('cours : blocs « + » repliés sous « Voir + »')

    # ── 8. Leçon 21 : leçon complète = fil + « + » + bonus → « Complète » ──
    page.evaluate("changerNiveau('A1.2'); marquerIntroMissionVue(21); openParcoursLecon(lecons.find(l => l.id === 21))")
    assert page.locator('.pl-unit.bonus').count() == 1
    page.screenshot(path=OUT + 'c09-lecon21.png', full_page=True)
    attendu = page.evaluate("nbItems(pLecon, 'all', 'tout')")
    page.click('button:has-text("Leçon complète")')
    total = page.evaluate('run.steps.reduce((a, s) => a + s.total, 0)')
    assert total == attendu, (total, attendu)
    finir_partie(page)
    assert 'Leçon complète !' in page.inner_text('#pf-content')
    assert page.evaluate("leconComplete(pLecon)") and page.evaluate("leconSansFaute(pLecon)")
    page.screenshot(path=OUT + 'c10-fin-complete.png', full_page=True)
    page.click('#pf-content button:has-text("Retour à la leçon")')
    page.evaluate('goLessons()')
    assert page.locator('.chemin-lecon:has-text("Les meubles")').count() == 1
    ok('leçon 21 complète (' + str(total) + ' items, bonus compris) → « Leçon complète ! », pastilles Sans faute + Complète')

    # ── 9. Leçons 2 et 22 : s'affichent, unités et mission ──
    for lid, niv in ((2, 'A1.1'), (22, 'A1.2')):
        page.evaluate("changerNiveau('%s'); openParcoursLecon(lecons.find(l => l.id === %d))" % (niv, lid))
        if actif(page, 'view-msintro'):  # 1re découverte : introduction de la mission
            page.click('#msi-content button:has-text("Voir les unités")')
        assert page.locator('.ms-carte').count() == 1
        page.screenshot(path=OUT + 'c11-lecon%d.png' % lid, full_page=True)
        page.click('.pl-unit:has-text("UNITÉ 1") button:has-text("Commencer")')
        page.screenshot(path=OUT + 'c12-intro%d.png' % lid, full_page=True)
        page.click('#pi-content button:has-text("Commencer")')
        finir_partie(page)
        assert actif(page, 'view-pfin')
    ok('leçons 2 et 22 : unité 1 jouée de bout en bout')

    # ── 10. Séance du jour : 20 questions, puis « Encore » ──
    page.evaluate("""() => {
        const store = getStatsStore();
        const vieux = new Date(Date.now() - 40 * 86400000).toISOString();
        // Vieilles stats + une erreur active partout : pas d'étalement, tout est dû.
        const wrong = getWrongStore();
        Object.keys(store).forEach(lid => Object.keys(store[lid]).forEach(type =>
            Object.keys(store[lid][type]).forEach(qid => {
                store[lid][type][qid].lastSeenAt = vieux;
                if (!wrong[lid]) wrong[lid] = {};
                if (!wrong[lid][type]) wrong[lid][type] = {};
                wrong[lid][type][qid] = 1;
            })));
        saveStatsStore(store);
        saveWrongStore(wrong);
        changerNiveau('A1.1');
    }""")
    page.evaluate('goDashboard()')
    dus = page.evaluate('resumeRevision(lecons).dus.length')
    ligne = page.inner_text('.ac-btn.rev')
    page.screenshot(path=OUT + 'c13-accueil.png', full_page=True)
    print('       questions dues :', dus, '·', ligne.replace('\n', ' '))
    page.click('.ac-btn.rev')
    assert page.evaluate('session.questions.length') == min(20, dus)
    finir_session(page)
    actions = page.locator('#session-actions button').all_inner_texts()
    assert any(a.startswith('Réviser encore') for a in actions) and 'Accueil' in actions, actions
    ok('séance : ' + str(min(20, dus)) + ' questions sur ' + str(dus) + ' dues · fin : ' + ' | '.join(actions))

    # ── 11. Étalement de l'historique v1 ──
    res = page.evaluate("""() => {
        const today = dayString(0);
        const item = { leconId: 3, type: 'quiz', qid: 5 };
        const vieux = { lastSeenAt: '2026-09-01T10:00:00Z', correctStreak: 2 };
        const recent = { lastSeenAt: new Date().toISOString(), correctStreak: 1 }; // vue depuis DEBUT_V2
        // 300 vieilles questions : combien tombent aujourd'hui ?
        let dusAuj = 0;
        for (let i = 0; i < 300; i++) {
          if (dateRevisionItem({ leconId: 3, type: 'quiz', qid: i }, vieux, 0) <= today) dusAuj++;
        }
        return {
          dusAuj,
          erreur: dateRevisionItem(item, vieux, 1) <= today,
          recent: dateRevisionItem(item, recent, 0) === dateRevision(recent),
          stable: dateRevisionItem(item, vieux, 0) === dateRevisionItem(item, vieux, 0)
        };
    }""")
    assert res['erreur'] and res['recent'] and res['stable'] and res['dusAuj'] < 40, res
    ok('étalement v1 : ' + str(res['dusAuj']) + ' / 300 vieilles questions dues aujourd\'hui · erreurs actives toujours dues · stats récentes inchangées')

    # ── 12. Ancienne leçon : écran à onglets ──
    page.evaluate("openLecon(lecons.find(l => l.id === 7))")
    assert actif(page, 'view-lecon')
    ok('leçon 7 (ancien format) : écran à onglets inchangé')
    nav.close()

print('\nErreurs JavaScript :', erreurs_js or 'aucune')
sys.exit(1 if erreurs_js else 0)
