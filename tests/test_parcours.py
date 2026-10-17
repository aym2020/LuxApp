import os
"""Test de bout en bout du parcours v2, en format mobile (390x844)."""
import json, sys
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'captures') + '/'
os.makedirs(OUT, exist_ok=True)
erreurs_js = []
etapes_ok = []


def ok(msg):
    etapes_ok.append(msg)
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


def continuer_si_besoin(page):
    if page.evaluate('pAttente && pSuite !== null'):
        page.click('#pc-continuer')


def repondre(page, juste=True):
    """Répond à l'item affiché (juste ou faux)."""
    c = item_courant(page)
    t, it = c['type'], c['item']
    if t == 'flashcards':
        page.fill('#mc-input', cible(page, it) if juste else 'zzz')
        page.click('#mc-btn-valider')
        if juste:
            continuer_si_besoin(page)
    elif t in ('quiz', 'trous'):
        bonne = it['reponse'] if t == 'quiz' else it['trou']
        boutons = page.locator('#pc-choix .choice')
        for i in range(boutons.count()):
            txt = boutons.nth(i).inner_text()
            if (txt == bonne) == juste:
                boutons.nth(i).click()
                break
        if juste:
            page.wait_for_function('!pAttente || pSuite !== null', timeout=4000)
            page.wait_for_timeout(1700)
        else:
            continuer_si_besoin(page)
    else:
        page.fill('#pc-ecr-input', it['lu'] if juste else 'faux')
        page.click('#pc-body .pc-btn.primary')
        continuer_si_besoin(page)


with sync_playwright() as p:
    nav = p.chromium.launch()
    page = nav.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    page.route('**/*gstatic*/**', lambda r: r.abort())
    page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    page.on('pageerror', lambda e: erreurs_js.append(str(e)))
    page.goto(URL)
    page.wait_for_function('lecons.length > 0')

    # 1. Liste des leçons
    page.evaluate('goLessons()')
    page.screenshot(path=OUT + '01-liste.png')
    assert page.evaluate('etapesLecon(lecons.find(l => l.id === 2))') == 4  # 3 unités + mission
    assert page.locator('.chemin-lecon:has-text("Identifier des objets")').count() == 1
    ok('chemin : leçon 2 affichée (3 unités + mission)')

    # 2. Ancienne leçon toujours en onglets (seulement s'il en reste une au format v1)
    v1 = page.evaluate('(lecons.find(l => !isParcoursLecon(l)) || {}).id')
    if v1:
        page.evaluate('id => ouvrirLeconDepuisListe(id)', v1)
        assert actif(page, 'view-lecon')
        page.click('.tab-btn[data-tab="flashcards"]')
        page.click('#card')
        assert page.evaluate("document.getElementById('card').classList.contains('flipped')")
        ok('leçon %d (ancien format) : onglets et carte retournable' % v1)
        page.click('#view-lecon .back-btn')
    else:
        ok('plus aucune leçon au format v1 : étape sautée')

    # 3. Leçon 2 -> unités -> intro
    page.click('.chemin-lecon:has-text("Identifier des objets")')  # accordéon : la leçon se déplie
    page.click('.pas.ouverte .lien-or')  # « Voir toute la leçon »
    assert actif(page, 'view-msintro')  # 1re découverte : introduction de la mission
    page.click('#msi-content button:has-text("Voir les unités")')
    assert actif(page, 'view-plecon')
    page.screenshot(path=OUT + '02-lecon.png')
    page.click('.pl-unit:has-text("UNITÉ 1") button:has-text("Commencer")')
    assert actif(page, 'view-pintro')
    page.screenshot(path=OUT + '03-intro.png')
    page.click('#pi-content button:has-text("Commencer")')
    assert actif(page, 'view-parcours')
    ok('leçon 2 : liste des unités puis écran « Avant de commencer »')

    # 4. Mot caché : erreur, lettres vertes, indice, puis juste
    page.screenshot(path=OUT + '04-motcache.png')
    it = item_courant(page)['item']
    bon = cible(page, it)
    # On garde les 2 premières LETTRES (un espace après « e » ne compte pas), le reste faux.
    faux, lettres = '', 0
    for ch in bon:
        garder = lettres < 2 or not ch.isalpha()
        faux += ch if garder else 'q'
        if ch.isalpha() and lettres < 2:
            lettres += 1
    page.fill('#mc-input', faux)
    page.keyboard.press('Enter')
    verts = page.locator('.mc-case.vert').count()
    assert verts >= 2, verts
    assert 'Pas encore' in page.inner_text('#mc-erreur')
    page.click('#mc-btn-indice')
    assert page.locator('.mc-case.indice').count() == 1
    score = page.inner_text('#mc-score')
    page.screenshot(path=OUT + '05-motcache-erreur.png')
    ok('mot caché : ' + str(verts) + ' lettres vertes après erreur, 1 indice, score ' + score)

    # Barre d'espace dans le champ (bug corrigé des raccourcis cartes)
    page.click('#mc-mot')
    page.keyboard.type('a b')
    # On tape dans les cases : l'espace est accepté sans déclencher de raccourci, puis retiré.
    assert page.input_value('#mc-input') == 'ab', page.input_value('#mc-input')
    assert page.locator('.mc-case.tapee').count() == 2
    page.keyboard.press('Backspace')
    assert page.locator('.mc-case.tapee').count() == 1
    page.keyboard.press('Backspace')
    ok('écriture directe dans les cases : toucher les cases donne le clavier, espace sans raccourci, effacement')

    # Panneau cours
    page.click('#view-parcours .pc-cours-btn')
    assert page.is_visible('#cours-panel')
    page.screenshot(path=OUT + '06-cours.png')
    page.click('.cp-bas button')
    assert not page.is_visible('#cours-panel')
    ok('panneau Cours : ouverture sur l\'unité, fermeture')

    page.fill('#mc-input', bon)
    page.keyboard.press('Enter')
    page.screenshot(path=OUT + '07-motcache-juste.png')
    page.keyboard.press('Enter')  # Continuer au clavier
    assert item_courant(page)['item']['id'] != it['id'] or item_courant(page)['type'] != 'flashcards'
    ok('mot caché : juste, puis Entrée = Continuer')

    # 5. Voir la réponse après 3 essais -> le mot revient à la fin
    it2 = item_courant(page)['item']
    for _ in range(3):
        page.fill('#mc-input', 'zzz')
        page.click('#mc-btn-valider')
    assert page.is_visible('#mc-btn-voir')
    page.click('#mc-btn-voir')
    page.click('#pc-continuer')
    queue = page.evaluate('run.steps[0].queue')
    assert queue[-1] == it2['id'], queue
    ok('« Voir la réponse » après 3 essais, le mot repart en fin de file')

    # 6. Finir l'unité : une erreur en quiz et en trous
    deja_faux = set()
    garde = 0
    while actif(page, 'view-parcours') and garde < 200:
        garde += 1
        t = item_courant(page)['type']
        if t in ('quiz', 'trous') and t not in deja_faux:
            deja_faux.add(t)
            repondre(page, juste=False)
            if t == 'trous':
                page.screenshot(path=OUT + '08-trous-erreur.png')
            continue
        repondre(page, juste=True)
    assert actif(page, 'view-pfin'), 'fin non atteinte'
    page.screenshot(path=OUT + '09-fin.png', full_page=True)
    best = page.evaluate('getUnitBest(2, 1)')
    lignes = page.locator('.pf-ligne').count()
    assert best is not None and lignes >= 3
    ok('unité 1 finie : score ' + str(best) + ' %, ' + str(lignes) + ' items à retravailler')

    # 7. Refaire mes erreurs : seulement les items ratés
    page.click('text=Refaire mes erreurs')
    total = page.evaluate('run.steps.reduce((a, s) => a + s.total, 0)')
    assert total == lignes, (total, lignes)
    while actif(page, 'view-parcours'):
        repondre(page, True)
    assert page.evaluate('getUnitBest(2, 1)') == best
    ok('« Refaire mes erreurs » : ' + str(total) + ' items, étoiles de l\'unité inchangées')

    # 8. Unité 2 : 3 réponses, quitter, reprendre après rechargement
    page.click('text=Retour à la leçon')
    page.click('.pl-unit:has-text("UNITÉ 2") button:has-text("Commencer")')
    page.click('#pi-content button:has-text("Commencer")')
    for _ in range(3):
        repondre(page, True)
    avant = page.evaluate('[run.stepIdx, run.steps[run.stepIdx].queue.length]')
    page.click('#view-parcours .pc-icon-btn')
    assert page.locator('.pl-unit.en-cours').count() == 1
    page.screenshot(path=OUT + '10-lecon-en-cours.png')
    page.reload()
    page.wait_for_function('lecons.length > 0')
    page.evaluate('goLessons()')
    assert page.inner_text('.pas.encours .btn-jaune').startswith('Reprendre'), page.inner_text('.pas.encours .btn-jaune')
    page.screenshot(path=OUT + '11-reprendre.png')
    page.click('.pas.encours .btn-jaune')
    apres = page.evaluate('[run.stepIdx, run.steps[run.stepIdx].queue.length]')
    assert avant == apres, (avant, apres)
    ok('reprise après rechargement : même étape, même item ' + str(apres))

    # 9. Bilan : débloqué quand toutes les unités sont faites, retour à la leçon
    page.evaluate('saveUnitBest(2, 2, 80); saveUnitBest(2, 3, 95); clearRun(); openParcoursLecon(pLecon)')
    page.click('text=Lancer le bilan')
    assert actif(page, 'view-session')
    n = page.evaluate('session.questions.length')
    page.evaluate('session.index = session.questions.length; renderSessionQ()')
    page.click('#session-actions button')
    assert actif(page, 'view-plecon')
    ok('bilan : ' + str(n) + ' questions, « Terminer » ramène à la leçon')

    # 10. Liste : étoiles et « À revoir »
    page.click('#view-plecon .back-btn')
    assert page.evaluate('etapesFaites(lecons.find(l => l.id === 2))') == 3
    carte = page.inner_text('.chemin-lecon:has-text("Identifier des objets")')
    page.screenshot(path=OUT + '12-liste-apres.png')
    ok('chemin : leçon 2 à 3 étapes sur 4 · ' + ' | '.join(carte.split('\n')[:3]))

    # 11. Les 3 autres leçons v2 s'ouvrent et démarrent
    for niveau, titre in [('A1.1', "D'Nationalitéit"), ('A1.2', 'An der Wunneng'), ('A1.2', 'An der Fräizäit')]:
        page.evaluate("n => { changerNiveau(n); goLessons(); }", niveau)
        page.evaluate("t => ouvrirLeconDepuisListe(lecons.find(l => l.titre === t).id)", titre)
        # 1re découverte : « J'ai compris · Commencer » mène à l'unité 1
        page.click('#msi-content button:has-text("J\'ai compris")')
        page.click('#pi-content button:has-text("Commencer")')
        repondre(page, True)
        page.click('#view-parcours .pc-icon-btn')
        page.evaluate('clearRun()')
    page.evaluate("changerNiveau('A1.2'); goLessons(); openParcoursLecon(lecons.find(l => l.id === 22)); openIntro(3)")
    page.screenshot(path=OUT + '13-intro-22.png')
    ok('leçons 8, 21, 22 : ouverture et premier item')

    # 12. Révision configurée : la leçon v2 y figure, « Tout revoir » ne coche qu'elle
    page.evaluate("openParcoursLecon(lecons.find(l => l.id === 22)); toutRevoir()")
    coches = page.evaluate("[...document.querySelectorAll('#rs-lecons input:checked')].map(b => Number(b.value))")
    assert coches == [22], coches
    ok('« Tout revoir » : seule la leçon 22 est cochée')

    nav.close()

print('\nErreurs JavaScript :', erreurs_js or 'aucune')
sys.exit(1 if erreurs_js else 0)
