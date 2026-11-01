"""Plus : plus de ligne « Nouveautés », version « LuxApp 2.1 · <id du commit> » (route /api/version)."""
import json
import urllib.request
from playwright.sync_api import sync_playwright
from helpers import ok, ouvrir, URL

with sync_playwright() as p:
    b, pg, erreurs_js = ouvrir(p, mobile=True)
    commit = json.load(urllib.request.urlopen(URL + 'api/version'))['commit']
    assert commit and len(commit) == 7, commit
    pg.evaluate("ouvrirPlus()")
    pg.wait_for_function("document.querySelector('#plus-page .plus-version').textContent.includes('·')")
    assert pg.inner_text('#plus-page .plus-version') == f'LuxApp 2.1 · {commit}'
    noms = pg.evaluate("[...document.querySelectorAll('#plus-page .plus-ligne b')].map(b => b.textContent)")
    assert 'Nouveautés' not in noms and noms[:3] == ['Lexique', 'Mes pièges', 'Réglages'], noms
    ok('Plus : pas de « Nouveautés », version affichée avec l’id du commit')
    # Id absent (pas de git ni de variable) ou réseau coupé : la version seule reste affichée.
    pg.evaluate("commitVersion = null")
    pg.route('**/api/version', lambda route, *_: route.abort())
    pg.evaluate("ouvrirPlus()")
    assert pg.inner_text('#plus-page .plus-version') == 'LuxApp 2.1'
    ok('Plus : /api/version indisponible → « LuxApp 2.1 » sans erreur')
    assert not erreurs_js, erreurs_js
    b.close()
