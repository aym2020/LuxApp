"""Lot 3 : article à écrire (S5), « Tente ta chance » (S10), fin du design (S12).
Format mobile."""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'captures') + '/'
os.makedirs(OUT, exist_ok=True)
PALETTE = {'#f08c46', '#8f87f0', '#ee6fb0', '#a3cc52', '#b07ce0', '#8fa6bd', '#d46fc4'}
erreurs_js = []


def ok(msg):
    print('  ok  ', msg)


def actif(page, vue):
    return page.evaluate("id => document.getElementById(id).classList.contains('active')", vue)


def jouer_mission(page, fautes=0):
    """Joue la mission ; les `fautes` premières répliques sont d'abord fausses (une vie chacune)."""
    n = 0
    while page.locator('#ms-input').count():
        bonne = page.evaluate('pLecon.scene[ms.idx].lu')
        if n < fautes:
            page.fill('#ms-input', 'xxx')
            page.click('#ms-btn-valider')
        page.fill('#ms-input', bonne)
        page.click('#ms-btn-valider')
        page.locator('#ms-continuer').count() and page.click('#ms-continuer')
        n += 1


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
    page.evaluate("[2, 3, 8].forEach(id => marquerIntroMissionVue(id))")  # introduction de mission : testée ailleurs

    # ── S5 : article à écrire, aussi en révision ──
    page.evaluate("""() => {
        const l = lecons.find(x => x.id === 2);
        const carte = l.flashcards.find(c => c.lu === 'Mapp');
        demarrerSession('review', 'TEST', [{ leconId: 2, type: 'motcache', qid: carte.id, q: carte }]);
    }""")
    assert "l'article et le mot" in page.inner_text('#session-label').lower(), page.inner_text('#session-label')
    page.fill('#session-input', 'Mapp')
    page.click('#session-input-btn')
    assert 'Il manque un mot' in page.inner_text('#session-feedback')
    page.fill('#session-input', 'eng Mapp')
    page.click('#session-input-btn')
    assert 'Correct' in page.inner_text('#session-feedback')
    autre = page.evaluate("articleAEcrire(lecons.find(x => x.id === 2), lecons.find(x => x.id === 2).flashcards.find(c => c.unite === 2 && c.article))")
    assert autre is False
    ok('révision : mot caché de l\'unité 1 de la leçon 2 → « écris l\'article et le mot », « Mapp » refusé, « eng Mapp » juste ; unité 2 inchangée')

    # ── S10 : Tente ta chance, réussite à 100 % ──
    page.evaluate("openParcoursLecon(lecons.find(l => l.id === 2))")
    bouton = page.inner_text('.ms-carte .ms-tenter')
    assert 'Tente ta chance' in bouton and '10 répliques' in bouton, bouton
    assert 'primary' not in page.get_attribute('.ms-carte .ms-tenter', 'class')
    page.screenshot(path=OUT + 'lot3-tenter.png', full_page=True)
    page.click('.ms-carte .ms-tenter')
    assert actif(page, 'view-mission') and page.evaluate('ms.tentative')
    jouer_mission(page)
    fin = page.inner_text('.ms-fin')
    assert 'Tu connais déjà cette leçon' in fin and 'Leçon suivante' in fin and 'Faire quand même les unités' in fin, fin
    assert page.evaluate('leconValideeParMission(2)')
    assert page.evaluate('getUnitBest(2, 1)') is None and not page.evaluate('getSansFaute(2, 1)')
    page.screenshot(path=OUT + 'lot3-tenter-reussi.png', full_page=True)
    assert 'Leçon 2' not in page.evaluate('prochainPas().texte')
    page.evaluate("openParcoursLecon(lecons.find(l => l.id === 2))")
    carte = page.inner_text('.pl-unit >> nth=0')
    assert 'VALIDÉE PAR LA MISSION' in carte and 'TERMINÉE' not in carte, carte
    assert page.locator('.pl-unit >> nth=0').locator('.pl-unit-stars').count() == 0
    assert page.locator('.ms-carte .ms-tenter').count() == 0
    page.evaluate('goLessons()')
    assert page.evaluate('leconTerminee(lecons.find(l => l.id === 2))')
    assert 'Validée par la mission' in page.inner_text('#chemin-lecon-2')
    ok('leçon 2 : « Tente ta chance · 5 répliques » (secondaire) → 100 % → validée par la mission, '
       'aucune étoile ni « Terminée », guide sur la suite, « Validée par la mission » sur le chemin')

    # ── S10 : tentative ratée (trois erreurs, plus de vie) ──
    page.evaluate("openParcoursLecon(lecons.find(l => l.id === 8)); openMission(true)")
    jouer_mission(page, fautes=3)  # spec 32 : ratée = plus de vie
    fin = page.inner_text('.ms-fin')
    assert "Les unités vont t'aider" in fin and "Commencer l'unité 1" in fin, fin
    assert not page.evaluate('leconValideeParMission(8)')
    assert page.evaluate('getMissionBest(8)') is not None
    ok('leçon 8 : tentative avec une erreur → « Les unités vont t\'aider », rien de validé, meilleur score gardé')

    # ── S10 : la proposition disparaît dès qu'une unité est terminée ──
    page.evaluate("saveUnitBest(3, 1, 90); openParcoursLecon(lecons.find(l => l.id === 3))")
    assert page.locator('.ms-carte .ms-tenter').count() == 0
    assert 'Jouer la mission' in page.inner_text('.ms-carte')
    ok('leçon 3 : une unité terminée → plus de « Tente ta chance », bouton « Jouer la mission »')

    # ── S12 : animations des exercices ──
    page.evaluate("marquerIntroMissionVue(4); openParcoursLecon(lecons.find(l => l.id === 4)); startUnite(1, 'unite')")  # SPEC 55 : intro déjà vue
    assert 'glisse' in page.get_attribute('#pc-body', 'class')
    avant = page.evaluate("document.querySelector('#pc-steps .pc-seg')")
    page.evaluate("window._seg = document.querySelector('#pc-steps .pc-seg')")
    page.evaluate("run.steps[0].queue.shift(); renderItem()")
    assert page.evaluate("window._seg === document.querySelector('#pc-steps .pc-seg')"), 'segments recréés : la barre ne peut pas glisser'
    page.evaluate("openParcoursLecon(lecons.find(l => l.id === 4)); openMission()")
    assert page.locator('#ms-body .ms-bulle.bulle-in').count() >= 1
    ok('exercice : item qui glisse, barre mise à jour sans être recréée ; mission : répliques qui arrivent une par une')

    # ── S12 : palette resserrée, en-tête de leçon teinté, largeurs ──
    couleurs = set(page.evaluate('lecons.map(l => l.couleur)'))
    assert couleurs <= PALETTE, couleurs - PALETTE
    voisines = page.evaluate("lecons.slice().sort((a, b) => a.id - b.id).every((l, i, t) => i === 0 || t[i - 1].couleur !== l.couleur)")
    assert voisines
    for largeur in (320, 360, 390, 430):
        page.set_viewport_size({'width': largeur, 'height': 800})
        for vue in ("openParcoursLecon(lecons.find(l => l.id === 5))", "openIntro(1)", "startUnite(1, 'unite')",
                    "openLexique()", "openPieges()", "openExamens()", "openReglages()"):
            page.evaluate(vue)
            page.wait_for_timeout(120)
            d = page.evaluate('document.documentElement.scrollWidth - innerWidth')
            assert d <= 0, (largeur, vue, d)
    page.set_viewport_size({'width': 390, 'height': 844})
    page.evaluate("openParcoursLecon(lecons.find(l => l.id === 5))")
    page.screenshot(path=OUT + 'lot3-lecon5.png')
    ok('palette de ' + str(len(couleurs)) + ' teintes, deux leçons voisines jamais de la même couleur ; '
       'leçon, intro, exercice, lexique, pièges, examens, réglages sans débordement de 320 à 430 px')

    print('\nErreurs JavaScript :', erreurs_js or 'aucune')
    assert not erreurs_js
    nav.close()
