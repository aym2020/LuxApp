"""SPEC 115 V7 : composition naturelle, CTA proche et captures avant/après."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
from helpers import URL

reference = os.environ.get('LD_ACCUEIL_REFERENCE') == '1'
sortie = Path('artifacts/redflag-v7') / ('avant' if reference else 'apres')
sortie.mkdir(parents=True, exist_ok=True)
mesures = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for w, h in [(320,600),(360,740),(393,852),(430,932),(768,1024),(1024,768),(1440,900),(1920,1080)]:
        ctx = b.new_context(viewport={'width':w,'height':h}, reduced_motion='reduce')
        pg = ctx.new_page()
        pg.route('**/*gstatic*/**', lambda r:r.abort())
        pg.route('**/fonts.googleapis.com/**', lambda r:r.abort())
        pg.goto(URL);pg.wait_for_selector('#today')
        pg.evaluate('ouvrirJeux();ldEntrerRedFlag()')
        pg.wait_for_selector('.ld-accueil')
        pg.evaluate('document.fonts.ready')
        pg.locator('.ld-accueil-visuel img').evaluate('(e)=>e.decode()')
        m = pg.evaluate('''() => {
          const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,b:b.bottom}};
          const c=r('.ld-accueil-commencer'),e=r('.ld-accueil-etapes');
          return {viewport:[innerWidth,innerHeight],shell:r('.view.active'),hero:r('.ld-accueil-hero'),etapes:e,cta:c,
            gap:c.y-e.b,overflow:document.documentElement.scrollWidth-innerWidth,
            image:document.querySelector('.ld-accueil-visuel img').getAttribute('src')};
        }''')
        mesures.append(m)
        (sortie/'mesures.json').write_text(json.dumps(mesures,indent=2)+'\n')
        pg.screenshot(path=str(sortie/f'{w}x{h}.png'),full_page=True)
        if not reference:
            assert m['overflow']<=1,m
            assert 12<=m['gap']<=24,m
            assert m['cta']['h']>=54,m
            assert abs(m['cta']['w']-m['etapes']['w'])<=1,m
            if w>=768:assert abs(m['shell']['w']-640)<=1,m
            if h>=740:assert m['cta']['b']<=h,m
            assert 'redflag-hero-v7.webp' in m['image'],m
            pg.locator('.ld-accueil-commencer').scroll_into_view_if_needed()
            assert pg.locator('.ld-accueil-commencer').is_visible()
        print(w,h,'écart étapes/CTA',round(m['gap'],1),'CTA bas',round(m['cta']['b'],1),flush=True)
        ctx.close()
    b.close()
