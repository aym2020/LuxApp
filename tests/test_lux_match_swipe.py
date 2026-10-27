"""SPEC 109 §19 : swipe Lux Match. Un geste annulé (pointercancel, perte de capture),
vertical, trop court ou d'un second doigt ne décide jamais ; droite = OUI, gauche = NON,
une seule décision par carte. Événements pointeur réels du DOM (pas seulement le moteur)."""
from playwright.sync_api import sync_playwright
from helpers import ok, ouvrir

PREPARER = """() => {
  lmCommencerSwipes();
  const p = lm.partie;
  const six = ['lena_r01', 'claire_r01', 'noemie_r01', 'maya_r01', 'sofia_r01', 'emma_r01'];
  p.paquet = six.concat(six); // 12 cartes : aucune fin de paquet pendant le test
  p.indexCarte = 0; p.aimes = []; p.likesAvantMatch = 99; // jamais de match pendant le test
  window.__decisions = [];
  if (!window.__swiperOrigine) window.__swiperOrigine = LuxMatchCore.swiper;
  LuxMatchCore.swiper = (etat, aime) => { window.__decisions.push(aime ? 'OUI' : 'NON'); return window.__swiperOrigine(etat, aime); };
  lmRendre();
}"""

# Envoie une suite d'événements pointeur à la carte : [type, x, y, pointerId, isPrimary]
GESTE = """async (suite) => {
  const carte = document.getElementById('lm-carte');
  const r = carte.getBoundingClientRect(), y0 = r.top + r.height / 2;
  for (const [type, x, dy, id, primaire] of suite) {
    carte.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: id || 7, isPrimary: primaire !== false,
      pointerType: 'touch', clientX: x, clientY: y0 + (dy || 0), button: 0 }));
    await new Promise(f => setTimeout(f, 16));
  }
  await new Promise(f => setTimeout(f, 420)); // animation de sortie (260 ms) terminée
  const c = document.getElementById('lm-carte');
  return { decisions: window.__decisions.slice(), index: lm.partie.indexCarte, transform: c ? c.style.transform : null,
           penche: c ? (c.classList.contains('lm-penche-oui') || c.classList.contains('lm-penche-non')) : null };
}"""


def geste(pg, suite):
    pg.evaluate("window.__decisions = []")
    return pg.evaluate(GESTE, suite)


with sync_playwright() as p:
    b, pg, erreurs_js = ouvrir(p, mobile=True)
    # Lux Match est masqué au public (JEUX_DISPONIBLES) : le test le réactive pour lui seul.
    pg.evaluate("JEUX_DISPONIBLES.luxMatch = true; ouvrirLuxMatch(); 0")
    pg.wait_for_selector('.lm-profil', timeout=40000)
    pg.evaluate(PREPARER)
    pg.wait_for_selector('#lm-carte')

    r = geste(pg, [['pointerdown', 250], ['pointermove', 300], ['pointermove', 365], ['pointerup', 365]])
    assert r['decisions'] == ['OUI'] and r['index'] == 1, r
    ok('glisse droite → OUI exactement une fois')

    r = geste(pg, [['pointerdown', 300], ['pointermove', 240], ['pointermove', 160], ['pointerup', 160]])
    assert r['decisions'] == ['NON'] and r['index'] == 2, r
    ok('glisse gauche → NON exactement une fois')

    r = geste(pg, [['pointerdown', 280], ['pointermove', 300], ['pointermove', 330], ['pointercancel', 0]])
    assert r['decisions'] == [] and r['index'] == 2 and r['transform'] == '' and not r['penche'], r
    ok('pointercancel à x=0 après un début vers la droite → aucune décision, carte recentrée')

    r = geste(pg, [['pointerdown', 280], ['pointermove', 330], ['pointermove', 375], ['pointercancel', 0]])
    assert r['decisions'] == [] and r['index'] == 2 and r['transform'] == '', r
    ok('pointercancel après le seuil OUI → aucune décision')

    r = geste(pg, [['pointerdown', 280], ['pointermove', 330], ['pointermove', 375], ['lostpointercapture', 0]])
    assert r['decisions'] == [] and r['index'] == 2 and r['transform'] == '', r
    ok('perte de capture → aucune décision')

    r = geste(pg, [['pointerdown', 200, 0], ['pointermove', 205, 40], ['pointermove', 150, 120], ['pointerup', 60, 160]])
    assert r['decisions'] == [] and r['index'] == 2 and r['transform'] == '', r
    ok('geste d’abord vertical (défilement) → aucune décision, même s’il dérive ensuite')

    r = geste(pg, [['pointerdown', 200], ['pointermove', 240], ['pointerup', 240]])
    assert r['decisions'] == [] and r['index'] == 2 and r['transform'] == '', r
    ok('micro-glisse sous le seuil → retour au centre')

    r = geste(pg, [['pointerdown', 250, 0, 7], ['pointermove', 320, 0, 7], ['pointerdown', 100, 0, 8, False],
                   ['pointermove', 0, 0, 8, False], ['pointerup', 0, 0, 8, False], ['pointermove', 380, 0, 7], ['pointerup', 380, 0, 7]])
    assert r['decisions'] == ['OUI'] and r['index'] == 3, r
    ok('second doigt ignoré : la décision reste celle du premier (OUI)')

    r = geste(pg, [['pointerdown', 250], ['pointermove', 380], ['pointerup', 380], ['pointerup', 380], ['pointerup', 0]])
    assert r['decisions'] == ['OUI'] and r['index'] == 4, r
    ok('pointerup répétés → une seule décision')

    pg.evaluate("window.__decisions = []; lmSwiper(true); lmSwiper(true); lmSwiper(false)")
    pg.wait_for_timeout(450)
    assert pg.evaluate("window.__decisions") == ['OUI'] and pg.evaluate("lm.partie.indexCarte") == 5
    ok('triple appui sur les boutons → une seule décision')

    # Dix glisses rapides alternées : chaque carte reçoit exactement la décision voulue.
    pg.evaluate(PREPARER)
    attendu = []
    for k in range(10):
        sens = 1 if k % 2 == 0 else -1
        r = geste(pg, [['pointerdown', 200], ['pointermove', 200 + 60 * sens], ['pointermove', 200 + 150 * sens], ['pointerup', 200 + 150 * sens]])
        attendu.append('OUI' if sens > 0 else 'NON')
        assert r['decisions'] == [attendu[-1]], (k, r)
    ok('10 glisses rapides alternées : 10 décisions, toutes dans le bon sens')

    # Vrai geste tactile (CDP) : pouce qui glisse vite vers la droite.
    pg.evaluate(PREPARER)
    pg.evaluate("window.__decisions = []")
    boite = pg.locator('#lm-carte').bounding_box()
    cdp = pg.context.new_cdp_session(pg)
    y = boite['y'] + boite['height'] / 2
    points = [boite['x'] + 80 + i * 25 for i in range(9)]
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': points[0], 'y': y}]})
    for x in points[1:]:
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x, 'y': y + 3}]})
        pg.wait_for_timeout(16)
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    pg.wait_for_timeout(450)
    assert pg.evaluate("window.__decisions") == ['OUI'], pg.evaluate("window.__decisions")
    ok('geste tactile réel vers la droite → OUI')

    assert not erreurs_js, erreurs_js
    b.close()
