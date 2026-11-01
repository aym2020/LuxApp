"""SPEC 116 / 117 — conformité de la présentation RED FLAG à celle de Lux Runner (étalon).

Même viewport, mesures getBoundingClientRect() : header, retour, marque, titre, accroche,
visuel, détails et actions de RED FLAG (composant commun game-intro) comparés à la
préparation actuelle de Lux Runner (première visite et visite normale). Tolérance ±2 px.
Captures et mesures : artifacts/game-intro/ (archivées par la CI).
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from helpers import URL, ok

SORTIE = Path('artifacts/game-intro')
SORTIE.mkdir(parents=True, exist_ok=True)
TAILLES = [(320, 600), (360, 740), (393, 852), (430, 932), (768, 1024), (1024, 768), (1440, 900), (1920, 1080)]
ZONES_RUNNER = {'header': '.runner-top', 'retour': '.runner-retour', 'marque': '.runner-top > span', 'main': '.runner-prepa',
                'kicker': '.jeux-kicker', 'titre': '.runner-prepa h1', 'actions': '.runner-actions', 'cta': '.runner-actions .jeux-jouer'}
ZONES_RF = {'header': '.game-intro-header', 'retour': '.game-intro-retour', 'marque': '.game-intro-marque', 'main': '.game-intro-main',
            'kicker': '.game-intro-kicker', 'titre': '.game-intro-titre', 'accroche': '.game-intro-accroche', 'visuel': '.game-intro-visuel',
            'details': '.game-intro-details', 'actions': '.game-intro-actions', 'cta': '.game-intro-primaire'}
MESURE = """(zones) => { const o = {}; for (const [k, s] of Object.entries(zones)) { const e = document.querySelector(s); if (!e) continue;
  const r = e.getBoundingClientRect(), c = getComputedStyle(e);
  o[k] = {x: r.left, y: r.top, w: r.width, h: r.height, d: r.right, b: r.bottom, fs: parseFloat(c.fontSize), ff: c.fontFamily, fw: c.fontWeight}; }
  o.scroll = document.documentElement.scrollHeight - innerHeight; o.ov = document.documentElement.scrollWidth - innerWidth; return o; }"""


def page(b, w, h):
    mobile = w < 700
    pg = b.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile).new_page()
    pg.erreurs = []
    pg.on('pageerror', lambda e: pg.erreurs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    return pg


def proche(a, b, tol=2):
    return abs(a - b) <= tol


with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    rapport = []
    for w, h in TAILLES:
        mesures = {}
        for variante in ('premiere', 'normale'):
            pg = page(b, w, h)
            if variante == 'normale':
                pg.evaluate("localStorage.setItem(runnerCle('luxRunnerTuto'), '1')")
            pg.evaluate("ouvrirRunner()")
            pg.wait_for_selector('#runner-jeu .runner-prepa')
            mesures['runner-' + variante] = pg.evaluate(MESURE, ZONES_RUNNER)
            pg.context.close()
        pg = page(b, w, h)
        pg.evaluate("ouvrirJeux()")
        pg.click('.ld-jouer-hub')
        pg.wait_for_selector('.game-intro')
        pg.evaluate("document.querySelector('.game-intro-visuel img').decode()")
        rf = mesures['redflag'] = pg.evaluate(MESURE, ZONES_RF)
        pg.screenshot(path=str(SORTIE / f'redflag-{w}x{h}.png'))
        assert not pg.erreurs, pg.erreurs
        pg.context.close()
        rapport.append({'viewport': [w, h], **mesures})

        for variante in ('premiere', 'normale'):
            rn = mesures['runner-' + variante]
            for k in ('header', 'retour'):                       # en-tête : même place, même taille
                assert all(proche(rf[k][c], rn[k][c]) for c in ('x', 'y', 'w', 'h')), (w, h, variante, k, rf[k], rn[k])
            assert proche(rf['marque']['d'], rn['marque']['d']) and proche(rf['marque']['y'], rn['marque']['y']), (w, h, 'marque')
            assert rf['marque']['fs'] == rn['marque']['fs'] and rf['marque']['fw'] == rn['marque']['fw'], (w, h, 'marque')
            for k in ('main', 'kicker', 'titre', 'cta'):           # même rail gauche/droite
                assert proche(rf[k]['x'], rn[k]['x']) and proche(rf[k]['w'], rn[k]['w']), (w, h, variante, k, rf[k], rn[k])
            for k in ('kicker', 'titre'):                          # même typographie
                assert rf[k]['fs'] == rn[k]['fs'] and rf[k]['ff'] == rn[k]['ff'], (w, h, k, rf[k], rn[k])
            assert proche(rf['cta']['h'], rn['cta']['h']), (w, h, 'cta')
            # Le bloc d'actions finit au même endroit en bas d'écran (sans défilement).
            if rf['scroll'] <= 0 and rn['scroll'] <= 0:
                assert proche(rf['actions']['b'], rn['actions']['b']), (w, h, variante, rf['actions'], rn['actions'])
        for k in ('accroche', 'visuel', 'details'):                 # zones de contenu sur le même rail
            assert proche(rf[k]['x'], rf['titre']['x']) and proche(rf[k]['w'], rf['titre']['w']), (w, h, k)
        assert rf['titre']['y'] < rf['accroche']['y'] < rf['visuel']['y'] < rf['details']['y'] < rf['actions']['y'], (w, h, 'ordre')
        assert rf['ov'] <= 1, (w, h, rf['ov'])
        if h >= 740:
            assert rf['scroll'] <= 0 and rf['cta']['b'] <= h, (w, h, rf['scroll'])
        print(f'  {w}×{h} : header, retour, marque, titre, rail et CTA = Lux Runner (±2 px)', flush=True)
    (SORTIE / 'mesures.json').write_text(json.dumps(rapport, indent=1) + '\n')
    b.close()
ok('SPEC 116/117 : présentation RED FLAG conforme à Lux Runner sur 8 tailles (mobile et PC)')
