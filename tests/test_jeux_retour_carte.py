"""SPEC 116 § 9 — retour au hub Jeux : la page se recale sur la carte du jeu quitté.

Pour RED FLAG (troisième carte, sous le pli) et Lux Runner : on fait défiler le hub jusqu'à la
carte, on touche « Jouer », puis on revient par « ← Jeux », par Retour (navigateur/Android) et
par le bouton de la présentation. La carte doit être visible et à peu près centrée.
"""
from playwright.sync_api import sync_playwright
from helpers import URL, ok

CARTES = {'redflag': ('.ld-carte-hub', '.ld-jouer-hub', '.game-intro'),
          'runner': ('.runner-carte', '.runner-jouer-hub', '#runner-jeu .runner-prepa')}
POSITION = """(sel) => { const r = document.querySelector(sel).getBoundingClientRect();
  return {haut: r.top, bas: r.bottom, centre: Math.abs(r.top + r.height / 2 - innerHeight / 2), h: r.height, scroll: scrollY,
    max: document.documentElement.scrollHeight - innerHeight}; }"""


def visible_et_centree(pg, carte):
    m = pg.evaluate(POSITION, carte)
    assert m['haut'] >= 0 and (m['bas'] <= pg.viewport_size['height'] or m['h'] > pg.viewport_size['height']), m
    # Centrée, sauf si la page ne peut plus défiler (dernière carte : collée au bas de page).
    if m['h'] < pg.viewport_size['height'] and m['scroll'] < m['max'] - 1:
        assert m['centre'] <= 24, m
    return m


with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for largeur, hauteur in ((393, 763), (360, 640)):
        ctx = b.new_context(viewport={'width': largeur, 'height': hauteur}, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.route('**/*gstatic*/**', lambda r: r.abort())
        pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        pg.goto(URL)
        pg.wait_for_selector('#today')
        pg.evaluate("localStorage.setItem(runnerCle('luxRunnerTuto'), '1')")
        pg.evaluate("ouvrirJeux()")
        pg.wait_for_selector('.ld-carte-hub')
        for jeu, (carte, jouer, ecran) in CARTES.items():
            if pg.locator(jouer).count() == 0:
                continue                                          # carte verrouillée (pas de mots) : rien à tester
            for sortie in ('retour-navigateur', 'bouton-jeux'):
                pg.evaluate("window.scrollTo(0, 0)")
                pg.locator(jouer).scroll_into_view_if_needed()
                pg.click(jouer)
                pg.wait_for_selector(ecran)
                if sortie == 'retour-navigateur':
                    pg.evaluate("history.back()")
                else:
                    pg.click('.game-intro-retour' if jeu == 'redflag' else '#runner-jeu .runner-retour')
                pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
                pg.wait_for_timeout(500)                          # après les replacements différés (polices, 400 ms)
                m = visible_et_centree(pg, carte)
                print(f'  {largeur}×{hauteur} {jeu} ({sortie}) : carte à {round(m["haut"])} px du haut', flush=True)
        # Ouvrir Jeux sans venir d'un jeu : aucun recentrage parasite (haut de page).
        pg.evaluate("ouvrirJeux()")
        pg.evaluate("window.scrollTo(0, 0); goDashboard && goDashboard()")
        pg.evaluate("ouvrirJeux()")
        pg.wait_for_timeout(500)
        assert pg.evaluate("scrollY") == 0, pg.evaluate("scrollY")
        assert not erreurs, erreurs
        ctx.close()
    b.close()
ok('Retour au hub Jeux : carte du jeu quitté visible et centrée (RED FLAG, Lux Runner ; Retour et « ← Jeux »)')
