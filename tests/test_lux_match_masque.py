"""SPEC 110 lot D0 : Lux Match masqué de façon réversible. Aucune carte dans Jeux, aucun
préchargement 3D, aucune ouverture (ni directe, ni par restauration de vue) ; records et
préférences conservés ; réactivation par JEUX_DISPONIBLES.luxMatch = true."""
from playwright.sync_api import sync_playwright
from helpers import ok, ouvrir, vue

with sync_playwright() as p:
    b, pg, erreurs_js = ouvrir(p, mobile=True)
    requetes = []
    pg.on('request', lambda r: requetes.append(r.url))
    pg.evaluate("lmEcrire('luxMatchRecord', 777); lmEcrire('luxMatchAideFr', false)")
    assert pg.evaluate("JEUX_DISPONIBLES.luxMatch") is False
    pg.evaluate("ouvrirJeux()")
    pg.wait_for_selector('#jeux-hub .jeux-carte')
    pg.wait_for_timeout(3200)  # le préchargement (requestIdleCallback, 2,5 s max) aurait eu lieu
    assert pg.locator('.lm-carte-hub').count() == 0
    assert 'Lux Match' not in pg.inner_text('#jeux-hub')
    assert pg.locator('#jeux-hub .jeux-carte').count() >= 2  # Survie et Lux Runner restent là
    ok('aucune carte Lux Match dans Jeux, Survie et Lux Runner présents')
    assert not [u for u in requetes if 'lux-match-3d' in u or '/lux-match/' in u or 'api/jeux/lux-match' in u], requetes
    ok('aucun préchargement 3D ni chargement des contenus Lux Match')
    pg.evaluate("ouvrirLuxMatch()")
    pg.wait_for_timeout(300)
    assert vue(pg) == 'view-jeux', vue(pg)
    assert pg.evaluate("lm.partie") is None
    ok('ouvrirLuxMatch() direct → retour au hub Jeux, aucune partie créée')
    assert pg.evaluate("lmLire('luxMatchRecord', 0)") == 777
    assert pg.evaluate("lmLire('luxMatchAideFr', true)") is False
    ok('record et préférences Lux Match conservés')
    # Réactivation : le jeu revient tel quel.
    pg.evaluate("JEUX_DISPONIBLES.luxMatch = true; ouvrirJeux()")
    pg.wait_for_selector('.lm-carte-hub')
    assert '777' in pg.inner_text('.lm-carte-hub')
    pg.evaluate("ouvrirLuxMatch(); 0")
    pg.wait_for_selector('.lm-profil', timeout=40000)
    assert vue(pg) == 'view-luxmatch'
    ok('réactivation par JEUX_DISPONIBLES.luxMatch = true : carte et partie disponibles')
    assert not erreurs_js, erreurs_js
    b.close()
