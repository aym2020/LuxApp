"""SPEC111 : captures avant/après avec les vrais scripts historiques (pas une maquette).
Exécution : LUX_TESTS=1 PORT=3456 node server.js ; python tests/capture_lux_match_swipe_spec111.py
Les ressources JS/CSS anciennes sont chargées depuis le commit de base avec git show.
"""
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
from helpers import URL
BASE='8f3bceb72e2b3eba57f1215ce1e4f777c9e66b7b'
OUT=Path('artifacts/lux-match-swipe')
OUT.mkdir(parents=True,exist_ok=True)
baseline={}
for file in ('public/lux-match.js','public/lux-match.css'):
    baseline[file]=subprocess.check_output(['git','show',f'{BASE}:{file}']).decode('utf-8')

with sync_playwright() as p:
    b=p.chromium.launch()
    for variant in ('before','after'):
        for w,h in ((360,740),(393,852)):
            ctx=b.new_context(viewport={'width':w,'height':h},is_mobile=True,has_touch=True)
            page=ctx.new_page()
            page.route('**/fonts.googleapis.com/**',lambda route:route.abort())
            page.route('**/*gstatic*/**',lambda route:route.abort())
            if variant=='before':
                page.route('**/lux-match.js*',lambda route:route.fulfill(status=200,content_type='application/javascript',body=baseline['public/lux-match.js']))
                page.route('**/lux-match.css*',lambda route:route.fulfill(status=200,content_type='text/css',body=baseline['public/lux-match.css']))
            page.goto(URL)
            page.wait_for_selector('#today')
            page.evaluate('JEUX_DISPONIBLES.luxMatch = true; ouvrirLuxMatch()')
            page.wait_for_selector('.lm-profil',timeout=45000)
            page.evaluate('''() => {
               lmCommencerSwipes();
               lm.partie.paquet=['lena_r01','claire_r01','noemie_r01','maya_r01','sofia_r01','emma_r01'];
               lm.partie.indexCarte=0;lm.partie.aimes=[];lm.partie.likesAvantMatch=99;
               lm.aideFr=false;lmRendre();
            }''')
            page.wait_for_selector('#lm-carte')
            # Le portrait 3D est pré-calculé. Attente bornée, repli CSS accepté.
            try:
                page.locator('#lm-carte img.lm-carte-photo').wait_for(timeout=18000)
            except Exception:
                pass
            page.screenshot(path=str(OUT/f'{variant}-{w}x{h}.png'),full_page=True)
            ctx.close()
    b.close()
