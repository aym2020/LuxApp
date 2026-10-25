"""Specs 25 et 45 : « Accueil », « Retour » et « Mon chemin » mènent toujours au
bon écran, et le retour sur la liste des unités cadre la carte sous l'en-tête.
Spec 28 : l'écran de résultats félicite, compte les réponses justes et
n'affiche que les barres et étoiles pertinentes.
Téléphone simulé (390 × 844, écran tactile)."""
import os
from playwright.sync_api import sync_playwright
from helpers import passer_delai, lecon_cadree
U = os.environ.get('LUX_URL', 'http://localhost:3456/')


def ok(m): print('  ok  ', m, flush=True)
def vue(pg): return pg.evaluate("document.querySelector('.view.active').id")


def item_courant(pg):
    return pg.evaluate("() => { const s = run.steps[run.stepIdx]; return { type: s.type, item: trouverItem(pLecon, s.type, s.queue[0]) }; }")


def repondre(pg, juste=True):
    """Répond juste ; juste=False ne se trompe que sur un choix (quiz, trous)."""
    c = item_courant(pg)
    t, it = c['type'], c['item']
    if t == 'flashcards':
        pg.locator('#mc-btn-reconstruire').count() and pg.click('#mc-btn-reconstruire')
        pg.fill('#mc-input', pg.evaluate("it => motATaper(pLecon, it)", it))
        pg.click('#mc-btn-valider')
        pg.click('#pc-continuer')
    elif t in ('quiz', 'trous'):
        bonne = it['reponse'] if t == 'quiz' else it['trou']
        bs = pg.locator('#pc-choix .choice')
        for i in range(bs.count()):
            if (bs.nth(i).inner_text() == bonne) == juste:
                bs.nth(i).click()
                break
        if juste:
            passer_delai(pg)  # même reussir() que l'app, sans le délai (helpers.py)
        else:
            pg.click('#pc-continuer')
    else:
        pg.fill('#pc-ecr-input', it['lu'])
        pg.click('#pc-ecr-valider')  # SPEC 95 : bouton du pied d'action
        pg.click('#pc-continuer')


def finir(pg, erreurs=0):
    n = 0
    while vue(pg) == 'view-parcours' and n < 400:
        choix = item_courant(pg)['type'] in ('quiz', 'trous')
        repondre(pg, juste=not (choix and erreurs > 0))
        if choix and erreurs > 0:
            erreurs -= 1
        n += 1


def carte_sous_entete(pg, sel):
    """La carte commence juste sous l'en-tête fixe (ni dessous, ni loin plus bas)."""
    r = pg.evaluate("""s => { const c = document.querySelector(s).getBoundingClientRect();
        const t = document.querySelector('#view-plecon > .pc-topbar').getBoundingClientRect();
        return { carte: c.top, entete: t.bottom, max: document.documentElement.scrollHeight - innerHeight, y: scrollY }; }""", sel)
    # en bas de page, le navigateur ne peut pas défiler plus : la carte est alors plus bas
    assert r['carte'] >= r['entete'] and (r['carte'] <= r['entete'] + 24 or r['y'] >= r['max'] - 1), r
    return r


def reste(pg, attendu, ms=700):
    """L'écran ne change plus ensuite (aucun défilement ni retour en différé)."""
    y = pg.evaluate('scrollY')
    pg.wait_for_timeout(ms)
    assert vue(pg) == attendu and pg.evaluate('scrollY') == y, (vue(pg), y, pg.evaluate('scrollY'))


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(U)
    pg.wait_for_selector('#today')
    pg.evaluate("(p => { p.guide = { viesMasquees: 1 }; saveProgress(p); })(getProgress())")  # rappel des vies masqué (spec 36)
    pg.evaluate("choisirNiveau('A1.1'); marquerJour(1); saveUnitBest(0,1,90); saveUnitBest(0,2,90); saveUnitBest(1,1,90); saveUnitBest(1,2,90); marquerIntroMissionVue(1); goDashboard()")

    def liste():
        pg.evaluate("goLessons()")
        pg.click('#chemin-lecon-1 .lien-or')
        assert vue(pg) == 'view-plecon'

    # 1. Fin d'unité avec erreurs : « Accueil » à moitié sous le bouton fixe
    liste()
    pg.evaluate("openIntro(3)")
    pg.click('#pi-cta button')
    finir(pg, erreurs=3)
    assert vue(pg) == 'view-pfin'
    haut = pg.inner_text('#pf-content .pf-haut')
    assert pg.locator('#pf-content .pf-etape').count() == 4 and pg.locator('#pf-content .pf-stars').count() == 1
    assert '3 réponses à retravailler.' in haut and 'réponses justes du premier coup' in haut, haut
    assert pg.inner_text('#pf-content .pf-bravo') == pg.evaluate('messageResultat(pResultat.total)')
    ok('fin d\'unité : message, 4 barres, étoiles, « 3 réponses à retravailler. »')
    pos = pg.evaluate("""() => { const b = [...document.querySelectorAll('#view-pfin .pf-boutons button')].pop();
        const cta = document.getElementById('pf-cta').getBoundingClientRect();
        window.scrollBy(0, b.getBoundingClientRect().top + b.offsetHeight / 2 - (cta.top + 4));
        const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: cta.top + 4, texte: b.textContent }; }""")
    assert pos['texte'] == 'Accueil', pos
    pg.touchscreen.tap(pos['x'], pos['y'])
    assert vue(pg) == 'view-dashboard' and pg.evaluate('scrollY') == 0
    reste(pg, 'view-dashboard')
    ok('fin d\'unité : « Accueil » à moitié caché par le bouton fixe → vrai accueil, en haut, sans retour différé')

    # 2. « Retour à la leçon » depuis une étape seule : la carte sous l'en-tête
    liste()
    pg.evaluate("startEtapeSeule(4, 'quiz')")
    finir(pg, erreurs=1)
    assert vue(pg) == 'view-pfin'
    haut = pg.inner_text('#pf-content .pf-haut')
    assert haut.startswith('ÉTAPE QUIZ TERMINÉE') and 'Une réponse à retravailler.' in haut, haut
    assert 'étoiles' not in pg.inner_text('#pf-content'), 'pas de phrase sur les étoiles pour une étape seule'
    assert pg.locator('#pf-content .pf-stars, #pf-content .pf-etapes').count() == 0
    justes = pg.evaluate('pResultat.nbQuestions - pResultat.erreurs.length')
    assert pg.inner_text('#pf-content .pf-justes b') == str(justes)
    assert pg.locator('#pf-content .pf-details[open] .pf-ligne').count() == 1
    assert pg.locator('#view-pfin .pf-boutons button:has-text("Retour à la leçon")').count() == 0  # déjà l'action fixe
    ok('étape seule : « ÉTAPE QUIZ TERMINÉE », %d réponses justes, ni étoiles ni barres, erreur visible' % justes)
    msgs = pg.evaluate("[100, 95, 90, 89, 75, 74, 50, 49, 0].map(messageResultat)")
    assert msgs == ['Parfait !', 'Excellent !', 'Excellent !', 'Bien joué !', 'Bien joué !', 'Tu progresses !',
                    'Tu progresses !', "Continue à t'entraîner", "Continue à t'entraîner"], msgs
    ok('messages selon le score : 100, 90–99, 75–89, 50–74, moins de 50')
    assert pg.inner_text('#pf-suite').startswith('Mon chemin')
    pg.click('#pf-suite')
    pg.wait_for_timeout(500)
    r = lecon_cadree(pg, pg.evaluate('pLecon.id'))  # spec 45 : chemin, leçon dépliée et cadrée
    reste(pg, 'view-lessons')
    ok('étape seule → « Mon chemin » : chemin principal, leçon seule dépliée et cadrée (spec 45)')

    # 3. Retour du téléphone depuis l'écran de résultats
    pg.evaluate("startEtapeSeule(3, 'trous')")
    finir(pg)
    pg.go_back()
    pg.wait_for_timeout(500)
    lecon_cadree(pg, pg.evaluate('pLecon.id'))
    reste(pg, 'view-lessons')
    ok('résultats → Retour du téléphone : chemin principal, leçon dépliée et cadrée (spec 45)')
    liste()

    # 4. Exercice : Retour puis maison
    pg.evaluate("startEtapeSeule(2, 'quiz')")
    repondre(pg)
    pg.click('#view-parcours [data-retour]')
    assert vue(pg) == 'view-plecon'
    carte_sous_entete(pg, '#pl-unite-2')
    ok('exercice → Retour : liste des unités, unité 2 cadrée')
    pg.evaluate("startEtapeSeule(2, 'quiz')")
    pg.click('#view-parcours .maison')
    assert vue(pg) == 'view-dashboard'
    reste(pg, 'view-dashboard')
    ok('exercice → maison : accueil')

    # 5. Mission : Retour, puis Accueil depuis l'écran de la leçon (barre du bas)
    liste()
    pg.evaluate("openMission()")
    assert vue(pg) == 'view-mission'
    pg.click('#view-mission [data-retour]')
    assert vue(pg) == 'view-plecon'
    carte_sous_entete(pg, '#pl-mission')
    pg.click('#nav-bas [data-nav="accueil"]')
    reste(pg, 'view-dashboard')
    ok('mission → Retour : carte de la mission sous l\'en-tête ; barre du bas → accueil')

    # 5 bis. Fin de mission (spec 45) : « Mon chemin » et la flèche → chemin, leçon dépliée et cadrée
    def jouer_mission():
        liste()
        pg.evaluate("openMission()")
        while pg.locator('#ms-input').count():
            pg.fill('#ms-input', pg.evaluate("pLecon.scene[ms.idx].lu")); pg.click('#ms-btn-valider'); pg.click('#ms-continuer')
        assert pg.evaluate("!!ms.bilan")
    jouer_mission()
    assert pg.locator('#view-mission button:has-text("Retour · ")').count() == 0
    pg.click('#view-mission .ms-fin button:has-text("Mon chemin")')
    pg.wait_for_timeout(500)
    lecon_cadree(pg, 1)
    jouer_mission()
    assert pg.get_attribute('#view-mission [data-retour]', 'aria-label') == 'Retour à Mon chemin'
    pg.click('#view-mission [data-retour]')
    pg.wait_for_timeout(500)
    lecon_cadree(pg, 1)
    reste(pg, 'view-lessons')
    ok('fin de mission → « Mon chemin » ou flèche : chemin principal, leçon 1 dépliée et cadrée (spec 45)')

    # 6. Révision libre (unité 1 déjà faite)
    liste()
    pg.evaluate("openIntro(1)")
    pg.click('#pi-cta button')
    assert pg.evaluate('!!(run && run.libre)')
    repondre(pg)
    pg.go_back()
    pg.wait_for_timeout(200)
    assert vue(pg) == 'view-plecon'
    carte_sous_entete(pg, '#pl-unite-1')
    ok('révision libre → Retour du téléphone : unité 1 cadrée')
    pg.evaluate("reprendreRun(true)")
    finir(pg)
    assert vue(pg) == 'view-pfin'
    pg.click('#view-pfin .pf-boutons button:has-text("Accueil")')
    reste(pg, 'view-dashboard')
    ok('fin de révision libre → Accueil : accueil')

    # 7. Un défilement doux en cours sur le chemin s'arrête quand on change d'écran
    pg.evaluate("goLessons()")
    pg.click('#chemin-lecon-6 .carte-lecon')
    pg.click('#nav-bas [data-nav="accueil"]')
    reste(pg, 'view-dashboard', 900)
    assert pg.evaluate('scrollY') == 0
    ok('chemin en train de défiler → Accueil : l\'accueil reste en haut')

    assert not errs, errs
    b.close()
print('test_retours : tout est vert')
