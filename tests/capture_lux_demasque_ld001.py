"""LD-001 — Captures de référence et métriques visuelles, sans changer le gameplay.

Exécuter contre un serveur LUX_TESTS=1 :
  LUX_URL=http://127.0.0.1:3456/ python3 tests/capture_lux_demasque_ld001.py
La CI archive PNG + manifeste JSON dans l'artifact « lux-demasque-ld001 ».
Ces captures Chromium ne remplacent pas la vérification sur Samsung physique.
"""
import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = os.environ.get("LUX_URL", "http://127.0.0.1:3456/")
OUTPUT = Path(os.environ.get("LD001_OUT", "artifacts/lux-demasque-ld001"))
FORMATS = [(360, 740), (393, 852)]
METRICS = """() => {
  const box = document.querySelector('#ld-jeu');
  const selectors = ['.ld-top', '.ld-rencontre', '.ld-fiche', '.ld-regles',
    '.ld-rencontre .ld-btn-or', '.ld-depo', '.ld-hud', '.ld-scene',
    '.ld-declaration', '.ld-dock', '.ld-fenetre', '.ld-transcription',
    '.ld-carnet-liste', '.ld-bilan', '.ld-stats', '.ld-details'];
  const rect = e => {
    if (!e) return null;
    const b = e.getBoundingClientRect();
    return {x: Math.round(b.x), y: Math.round(b.y),
      width: Math.round(b.width), height: Math.round(b.height),
      bottom: Math.round(b.bottom), scrollHeight: e.scrollHeight,
      clientHeight: e.clientHeight};
  };
  const areas = {};
  for (const s of selectors) {
    const e = document.querySelector('#ld-jeu ' + s);
    if (e) areas[s] = rect(e);
  }
  const modal = [...document.querySelectorAll('#ld-jeu .ld-calque')].map(e => ({
    id:e.id, rect:rect(e.querySelector('.ld-fenetre')),
    controls:[...e.querySelectorAll('button')].length}));
  const clipped = [...(box ? box.querySelectorAll('button') : [])].filter(e => {
    const b = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && !e.disabled &&
      b.width > 0 && b.height > 0 && (b.width < 44 || b.height < 44);
  }).slice(0,15).map(e => ({label:e.getAttribute('aria-label') || e.textContent.trim().slice(0,45),
    rect:rect(e)}));
  return {window:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
    scroll:{documentHeight:document.documentElement.scrollHeight,
    documentWidth:document.documentElement.scrollWidth,
    overflowsX:document.documentElement.scrollWidth > innerWidth + 1},
    phase:typeof ld !== 'undefined' && ld.partie ? ld.partie.phase : 'unknown',
    areas,modal,smallControls:clipped};
}"""

def snapshot(pg, fmt, name, manifest, full_page=False):
    """Capture visible UI + measurements. No screenshots of real accounts."""
    pg.wait_for_timeout(350)  # Render3D low-poly / CSS animations; capture only.
    values = pg.evaluate(METRICS)
    file = f"{fmt[0]}x{fmt[1]}_{name}.png"
    pg.screenshot(path=str(OUTPUT / file), full_page=full_page,
                  animations="disabled", timeout=30000)
    manifest.append({"name":name,"file":file,"format":list(fmt),
                     "fullPage":full_page,"metrics":values})
    print(f"CAPTURE {file} — phase={values['phase']} "
          f"overflowX={values['scroll']['overflowsX']}",flush=True)


def primary(pg):
    pg.wait_for_function("typeof ld !== 'undefined' && ld.partie && ld.partie.phase === 'rencontre'")


OUTPUT.mkdir(parents=True,exist_ok=True)
manifest = []
with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    for w,h in FORMATS:
        fmt=(w,h)
        ctx=browser.new_context(viewport={"width":w,"height":h},
                                device_scale_factor=1,is_mobile=True,has_touch=True,
                                reduced_motion="reduce")
        pg=ctx.new_page()
        errors=[]
        pg.on('pageerror',lambda e:errors.append(str(e)))
        pg.route('**/*gstatic*/**', lambda route:route.abort())
        pg.route('**/fonts.googleapis.com/**', lambda route:route.abort())
        pg.goto(URL)
        pg.wait_for_selector('#today')
        pg.evaluate("ouvrirJeux(); ouvrirLuxDemasque()")
        pg.wait_for_selector('.ld-rencontre')
        primary(pg)
        snapshot(pg,fmt,"01-rencontre",manifest,True)
        pg.click('.ld-rencontre .ld-btn-or')
        pg.wait_for_selector('#ld-declaration')
        snapshot(pg,fmt,"02-deposition",manifest)
        pg.click('#ld-preciser')
        snapshot(pg,fmt,"03-deposition-precision",manifest)
        for i,app in enumerate(('pix','pro','amis'),start=4):
            pg.evaluate(f"ldReseaux('{app}')")
            pg.wait_for_selector('#ld-reseaux .ld-vignette')
            snapshot(pg,fmt,f"{i:02d}-reseaux-{app}",manifest)
        pg.click('#ld-reseaux .ld-vignette >> nth=0')
        pg.wait_for_selector('#ld-piece')
        snapshot(pg,fmt,"07-piece",manifest)
        pg.evaluate("""() => {
          ldFermerToutesFenetres();
          ld.partie.dossier.pieces.forEach(id => LuxDemasqueCore.consulter(ld.partie,id));
          ldMajDeposition();
          ldCarnet();
        }""")
        pg.wait_for_selector('#ld-carnet')
        snapshot(pg,fmt,"08-carnet",manifest)
        pg.evaluate("ldFermerToutesFenetres(); ldObjection()")
        pg.wait_for_selector('#ld-objection')
        snapshot(pg,fmt,"09-objection-choix",manifest)
        pg.evaluate("ldFermerToutesFenetres(); ldPresenter('PIX_KYOTO')")
        pg.wait_for_selector('#ld-verdict',timeout=15000)
        snapshot(pg,fmt,"10-verdict-refuse",manifest)
        pg.evaluate("ldFermerVerdict()")
        pg.evaluate("""() => {
          LuxDemasqueCore.allerA(ld.partie,1);
          ldMajDeposition();
          ldPresenter('AMIS_SAMI');
        }""")
        pg.wait_for_selector('#ld-verdict',timeout=15000)
        snapshot(pg,fmt,"11-verdict-retenu",manifest)
        pg.evaluate("ldFermerVerdict()")
        snapshot(pg,fmt,"12-deposition-demasquee",manifest)
        pg.evaluate("ldMenu()")
        pg.wait_for_selector('#ld-menu')
        snapshot(pg,fmt,"13-menu-pause",manifest)
        pg.evaluate("ldFermerToutesFenetres(); ldDemanderConclusion()")
        pg.wait_for_selector('#ld-conclure')
        snapshot(pg,fmt,"14-confirmation-fin",manifest)
        pg.evaluate("ldFermerToutesFenetres(); ldConclure(true)")
        pg.wait_for_selector('.ld-bilan')
        snapshot(pg,fmt,"15-bilan-debut",manifest)
        snapshot(pg,fmt,"16-bilan-complet",manifest,True)
        # Named diagnostics: never pretend to certify visual state if JS crashed.
        assert not errors,(fmt,errors)
        ctx.close()
    browser.close()
(OUTPUT/"manifest.json").write_text(json.dumps({
    "purpose":"LD-001 screenshots baseline before retro UI refactor",
    "source":"LuxApp 2.1, Chromium mobile emulation, not native Samsung",
    "formats":FORMATS,
    "captures":manifest},ensure_ascii=False,indent=2),encoding="utf-8")
print(f"ARCHIVED {len(manifest)} screenshots + manifest in {OUTPUT}",flush=True)
