"""SPEC 113 : captures et géométrie du vrai sélecteur (serveur LUX_TESTS=1).

LUX_CAPTURE_PHASE=avant|apres python3 tests/capture_cringr_spec113.py
Les PNG/JSON restent dans artifacts/, sans fichier de progression de production.
"""
import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright
from helpers import URL

PHASE = os.environ.get('LUX_CAPTURE_PHASE', 'apres')
ART = Path('artifacts/spec-113') / PHASE
ART.mkdir(parents=True, exist_ok=True)
mesures = []

with sync_playwright() as p:
    navigateur = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for largeur, hauteur in ((320, 600), (360, 740), (393, 852), (430, 932)):
        contexte = navigateur.new_context(
            viewport={'width': largeur, 'height': hauteur}, is_mobile=True, has_touch=True)
        page = contexte.new_page()
        page.route('**/fonts.googleapis.com/**', lambda route: route.abort())
        page.goto(URL)
        page.wait_for_selector('#today')
        page.evaluate("localStorage.setItem('ldSwipeVu','1'); ldOuvrirSelection()")
        page.wait_for_selector('#ld-selection-carte')
        page.evaluate('document.fonts.ready')
        page.locator('#ld-selection-carte .ld-image-prete').wait_for(timeout=40000)
        page.screenshot(path=str(ART / f'selection-{largeur}x{hauteur}.png'), full_page=True)
        mesure = page.evaluate("""() => {
            const rect = s => {
                const el = document.querySelector(s), r = el.getBoundingClientRect(), css = getComputedStyle(el);
                return {x:r.x, y:r.y, width:r.width, height:r.height, bottom:r.bottom,
                    fontSize:css.fontSize, fontFamily:css.fontFamily};
            };
            return {viewport:[innerWidth,innerHeight], overflow:document.documentElement.scrollWidth-innerWidth,
                scrollHeight:document.documentElement.scrollHeight,
                carte:rect('#ld-selection-carte'), nom:rect('.ld-selection-infos h2'),
                bio:rect('.ld-selection-description'), infos:rect('.ld-selection-infos'),
                coeur:rect('.ld-dating-meet'), logo:rect('.ld-top-selection .ld-logo'),
                portrait:!!document.querySelector('#ld-selection-carte .ld-image-prete')};
        }""")
        mesures.append(mesure)
        print(json.dumps(mesure, ensure_ascii=False), flush=True)
        contexte.close()
    navigateur.close()

(ART / 'geometrie.json').write_text(json.dumps(mesures, ensure_ascii=False, indent=2) + '\n')
