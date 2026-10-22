"""SPEC 88 VFX V1 — recette Chromium réelle sur 4 largeurs mobiles.
Indépendant du serveur, Supabase et de la progression : charge exactement
les fichiers publics CSS/JS avec une session Survie synthétique en file://.
Ce n'est PAS un substitut à la recette tactile Samsung.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
CSS = ROOT / "public" / "jeux-v21.css"
JS = ROOT / "public" / "jeux-v21.js"
ASSETS = ROOT / "public" / "assets" / "survie-flamme-v1.svg"
SIZES = [(320, 700), (360, 740), (390, 844), (430, 932)]
OUT = ROOT / "survie-vfx-screenshots"
OUT.mkdir(exist_ok=True)

def fixture():
    lesson = r"""
      var lecons = [{id:1,flashcards:[
        {fr:'maison',lu:'Haus'},{fr:'arbre',lu:'Bam'},{fr:'livre',lu:'Buch'},
        {fr:'bonjour',lu:'Moien'},{fr:'chaise',lu:'Stull'},
        {fr:'voiture',lu:'Auto'},{fr:'train',lu:'Zuch'},
        {fr:'bureau',lu:'Büro'},{fr:'ordinateur',lu:'Computer'}
      ]}];
      function getProgress(){return {1:{vue:{ouverte:true}}};}
      function getLeconVue(){return false;}
      function storageKey(x){return 'test-vfx:'+x;}
      function showView(id){document.getElementById('view-survie').classList.add('active');}
      function retour(){}
    """
    return f"""<!doctype html><html lang="fr"><head>
      <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <style>:root{{--font:Arial,sans-serif;--accent:#f5cf4d;--couleur-reussi:#60d9a6;
      --couleur-erreur:#f17b76}}*{{box-sizing:border-box}}
      body{{margin:0;background:#0f0e0c;font-family:Arial,sans-serif}}
      .view{{display:none}}.view.active{{display:block}}</style>
      <link rel="stylesheet" href="jeux-v21.css"></head>
      <body><div id="view-survie" class="view active"><div id="survie-jeu" class="survie-jeu"></div></div>
      <script>{lesson}</script>
      <script src="jeux-v21.js"></script>
      <script>demarrerSurvie();</script></body></html>"""

def box(pg,selector):
    return pg.eval_on_selector(selector, "el => {const r=el.getBoundingClientRect();"
                                  "return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,"
                                  "width:r.width,height:r.height}}")

def check(pg,w,h):
    pg.wait_for_selector("#survie-gel-bouton")
    assert pg.locator("#survie-combo-meter").count()==1
    assert pg.locator("#survie-freeze-indicator").count()==1
    assert pg.locator("#survie-jauge").count()==1
    assert pg.locator(".survie-flamme img").count()==1
    assert ASSETS.exists()
    assert pg.evaluate("document.documentElement.scrollWidth") <= w+1, f"{w} px: débordement horizontal"
    hud=box(pg,"#survie-combo")
    clock=box(pg,"#survie-chrono")
    meter=box(pg,"#survie-combo-meter")
    power=box(pg,"#survie-gel-bouton")
    prompt=box(pg,".survie-mot")
    assert hud["right"] <= clock["left"]+1, f"{w}: Série chevauche chrono : {hud} {clock}"
    assert clock["right"] <= w+1 and hud["left"] >= -1
    assert meter["top"] >= max(hud["bottom"],clock["bottom"])-2, f"{w}: jauge sur HUD"
    assert power["top"] >= meter["bottom"], f"{w}: Gel chevauche jauge"
    assert prompt["top"] >= power["bottom"]-1, f"{w}: question chevauche Gel"
    assert power["height"]>=44 and power["width"]>=44
    assert pg.locator("#survie-gel-bouton").is_enabled()
    # Contrôler l'animation réelle du chrono (le JS doit stopper la consommation).
    pg.locator("#survie-gel-bouton").click()
    pg.wait_for_timeout(1250)
    remaining=pg.evaluate("surviePartie.restant")
    assert remaining >= 29.7, f"{w}: chrono consommé pendant Freeze : {remaining}"
    assert pg.eval_on_selector("#survie-jeu","el=>el.classList.contains('survie-is-frozen')")
    assert pg.inner_text("#survie-freeze-indicator")=="TEMPS GELÉ"
    assert not pg.locator("#survie-gel-bouton").is_enabled()
    ice=pg.eval_on_selector(".survie-ice-sheen","el=>getComputedStyle(el).opacity")
    assert float(ice)>0.6, f"{w}: givre invisible"
    pg.screenshot(path=str(OUT / f"freeze-{w}.png"), full_page=True, animations="disabled")
    pg.wait_for_timeout(2350)
    assert not pg.eval_on_selector("#survie-jeu","el=>el.classList.contains('survie-is-frozen')"), f"{w}: gel ne se termine pas"
    assert pg.evaluate("surviePartie.restant") < 29.9
    # Maquette VFX à séries croissantes, sans changer les règles de jeu :
    pg.evaluate("surviePartie.serie=10;survieHud()")
    assert pg.get_attribute("#survie-combo-meter","data-heat")=="2"
    assert pg.inner_text("#survie-combo-phase")=="BRASIER"
    assert pg.eval_on_selector("#survie-combo-fill","el=>el.style.transform")=="scaleX(0.5)"
    pg.screenshot(path=str(OUT / f"combo-{w}.png"), full_page=True, animations="disabled")
    pg.evaluate("surviePenaliser(surviePartie)")
    assert pg.get_attribute("#survie-combo-meter","data-heat")=="0"
    assert pg.eval_on_selector("#survie-combo-fill","el=>el.style.transform")=="scaleX(0)"
    assert pg.evaluate("surviePartie.serie")==0
    return dict(width=w,gel=remaining,combo=10,ok=True)

def main():
    # Fixture locale sous public : CSS + SVG utilisent les vrais chemins de prod.
    import uuid
    f=ROOT/"public"/("_survie_vfx_fixture_"+uuid.uuid4().hex+".html")
    try:
        f.write_text(fixture(),encoding="utf-8")
        with sync_playwright() as pw:
            browser=pw.chromium.launch()
            for w,h in SIZES:
                context=browser.new_context(viewport={"width":w,"height":h},device_scale_factor=2,
                                            is_mobile=True,has_touch=True)
                page=context.new_page()
                errors=[]
                page.on("pageerror",lambda e:errors.append(str(e)))
                page.goto(f.as_uri())
                result=check(page,w,h)
                assert not errors,f"{w}: erreurs JS: {errors}"
                print(result)
                context.close()
            browser.close()
    finally:
        f.unlink(missing_ok=True)

if __name__=="__main__":
    main()
