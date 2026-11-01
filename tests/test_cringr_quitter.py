"""SPEC 118 §7 — Cringr : repère de glisse en pixel art, croix « quitter » discrète, fenêtre de confirmation,
retour au hub Jeux sur la carte RED FLAG."""
from playwright.sync_api import sync_playwright
from helpers import URL, ok


def entrer(pg):
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.evaluate("localStorage.setItem('ldSwipeVu','1'); ouvrirJeux()")
    pg.locator('.ld-jouer-hub').scroll_into_view_if_needed()
    pg.click('.ld-jouer-hub')
    pg.click('.game-intro-primaire')
    pg.wait_for_selector('#ld-selection-carte')


def geo(pg, sel):
    return pg.evaluate("s => { const r = document.querySelector(s).getBoundingClientRect(); return {l: r.left, t: r.top, w: r.width, h: r.height, b: r.bottom}; }", sel)


with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for largeur, hauteur in ((320, 600), (360, 740), (393, 763), (430, 932)):
        ctx = b.new_context(viewport={'width': largeur, 'height': hauteur}, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.route('**/*gstatic*/**', lambda r, *_: r.abort())
        pg.route('**/fonts.googleapis.com/**', lambda r, *_: r.abort())
        entrer(pg)
        # Croix discrète à la place de la flèche : cible 48×48, aucune tuile, nom accessible.
        croix = pg.evaluate("""() => { const e = document.querySelector('.ld-top-selection .ld-quitter-croix'), c = getComputedStyle(e), r = e.getBoundingClientRect();
          return {w: r.width, h: r.height, bord: c.borderTopWidth, fond: c.backgroundColor, nom: e.getAttribute('aria-label'),
                  flecheRetour: !!document.querySelector('.ld-top-selection [aria-label="Retour aux jeux"]')}; }""")
        assert croix['w'] >= 48 and croix['h'] >= 48 and croix['bord'] == '0px' and croix['fond'] == 'rgba(0, 0, 0, 0)', croix
        assert croix['nom'] == 'Quitter la partie' and not croix['flecheRetour'], croix
        # Repère de glisse : centré en haut de la carte, dans la carte, sans bloquer les gestes.
        carte, geste = geo(pg, '#ld-selection-carte'), geo(pg, '.ld-selection-geste')
        assert abs((geste['l'] + geste['w'] / 2) - (carte['l'] + carte['w'] / 2)) <= 1, (geste, carte)
        assert 0 <= geste['t'] - carte['t'] <= 24 and geste['b'] < carte['t'] + carte['h'] / 3, (geste, carte)
        assert pg.evaluate("getComputedStyle(document.querySelector('.ld-selection-geste')).pointerEvents") == 'none'
        assert pg.evaluate("document.querySelector('.ld-selection-geste').getAttribute('aria-hidden')") == 'true'
        # Le repère s'efface pendant le tirage de la carte.
        pg.evaluate("document.getElementById('ld-selection-carte').classList.add('ld-selection-tire')")
        pg.wait_for_function("getComputedStyle(document.querySelector('.ld-selection-geste')).opacity === '0'")
        pg.evaluate("document.getElementById('ld-selection-carte').classList.remove('ld-selection-tire')")
        # Fenêtre : Rester → on reste sur Cringr, même profil.
        pg.click('.ld-quitter-croix')
        pg.wait_for_selector('#ld-quitter')
        txt = pg.inner_text('#ld-quitter')
        assert 'Quitter la partie ?' in txt and 'Rester' in txt and 'Quitter' in txt, txt
        assert pg.evaluate("document.querySelector('#ld-quitter').contains(document.activeElement)"), 'focus dans la fenêtre'
        cibles = pg.evaluate("[...document.querySelectorAll('#ld-quitter button')].map(b => { const r = b.getBoundingClientRect(); return Math.min(r.width, r.height); })")
        assert min(cibles) >= 48, cibles
        fen = geo(pg, '#ld-quitter .ld-fenetre')
        assert fen['l'] >= 0 and fen['l'] + fen['w'] <= largeur and fen['t'] >= 0 and fen['b'] <= hauteur, fen
        assert pg.evaluate("document.documentElement.scrollWidth - innerWidth") <= 1
        pg.click('.ld-quitter-non')
        assert pg.locator('#ld-quitter').count() == 0 and pg.locator('#ld-selection-carte').count() == 1
        assert pg.evaluate("ld.selection.index") == 0 and pg.evaluate("document.getElementById('view-luxdemasque').classList.contains('active')")
        # Retour Android / Échap : ferment la fenêtre sans quitter.
        pg.click('.ld-quitter-croix'); pg.wait_for_selector('#ld-quitter')
        pg.keyboard.press('Escape')
        assert pg.locator('#ld-quitter').count() == 0 and pg.evaluate("!!ld.selection")
        pg.click('.ld-quitter-croix'); pg.wait_for_selector('#ld-quitter')
        pg.evaluate("history.back()")
        pg.wait_for_function("!document.getElementById('ld-quitter')")
        assert pg.evaluate("document.getElementById('view-luxdemasque').classList.contains('active')") and pg.evaluate("!!ld.selection")
        # Quitter → hub Jeux, recalé sur la carte RED FLAG (visible, centrée sauf fin de page).
        pg.click('.ld-quitter-croix'); pg.wait_for_selector('#ld-quitter')
        pg.click('.ld-quitter-oui')
        pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
        assert pg.evaluate("ld.partie") is None and pg.evaluate("ld.selection") is None
        pg.wait_for_timeout(600)
        m = pg.evaluate("""() => { const r = document.querySelector('.ld-carte-hub').getBoundingClientRect();
          return {haut: r.top, bas: r.bottom, h: r.height, centre: Math.abs(r.top + r.height / 2 - innerHeight / 2), scroll: scrollY,
                  max: document.documentElement.scrollHeight - innerHeight}; }""")
        assert m['haut'] >= 0 and (m['bas'] <= hauteur or m['h'] > hauteur), m
        if m['h'] < hauteur and m['scroll'] < m['max'] - 1:
            assert m['centre'] <= 24, m
        assert not erreurs, erreurs
        print(f'  {largeur}×{hauteur} : carte RED FLAG à {round(m["haut"])} px du haut après « Quitter »', flush=True)
        ctx.close()
    ok('Cringr : croix discrète 48 px, repère de glisse centré, fenêtre Rester/Quitter (Échap et Retour = rester), retour sur la carte RED FLAG')

    # Mouvement réduit : le repère reste affiché mais ne bouge pas.
    ctx = b.new_context(viewport={'width': 393, 'height': 763}, is_mobile=True, has_touch=True, reduced_motion='reduce')
    pg = ctx.new_page()
    pg.route('**/*gstatic*/**', lambda r, *_: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r, *_: r.abort())
    entrer(pg)
    assert pg.evaluate("getComputedStyle(document.querySelector('.ld-geste-doigt')).animationName") == 'none'
    assert pg.is_visible('.ld-selection-geste')
    ctx.close()
    ok('mouvement réduit : repère de glisse fixe')
    b.close()
