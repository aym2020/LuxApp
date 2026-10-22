"""SPEC 92 : sortie Survie sur vrai Chromium mobile (sans serveur ni Supabase).
La suite s'exécute à quatre tailles. Elle ne simule PAS un Samsung réel.
"""
from pathlib import Path
from uuid import uuid4
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = ROOT / "survie-fin-screenshots"
OUT.mkdir(exist_ok=True)
SIZES = [(320, 700), (360, 740), (390, 844), (430, 932)]

FIXTURE = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>:root{--font:Arial,sans-serif;--accent:#f5cf4d;--couleur-reussi:#58cca0;--couleur-erreur:#e5533d}
*{box-sizing:border-box}html,body{margin:0;background:#0f0e0c;color:#f5f0e8;font:16px Arial,sans-serif}
.view{display:none}.view.active{display:block}</style>
<link rel="stylesheet" href="jeux-v21.css">
</head><body>
<div id="view-survie" class="view active"><div id="survie-jeu" class="survie-jeu"></div></div>
<script>
let lecons=[{id:1,flashcards:[
{fr:'maison',lu:'Haus'},{fr:'livre',lu:'Buch'},{fr:'table',lu:'Dësch'},
{fr:'bonjour',lu:'Moien'},{fr:'chaise',lu:'Stull'},{fr:'bureau',lu:'Büro'}
]}];
function getProgress(){return {1:{vue:{ouverte:true}}}}
function getLeconVue(){return false}
function storageKey(x){return 'recette:'+x}
function showView(id){document.getElementById('view-survie').classList.add('active')}
function retour(){}
localStorage.setItem(storageKey('luxSurvieSon'),'0');
</script>
<script src="survie-vfx.js"></script>
<script src="jeux-v21.js"></script>
<script>demarrerSurvie()</script>
</body></html>"""

def box(page, sel):
    return page.locator(sel).bounding_box()

def assert_screen(page, w):
    assert page.evaluate("document.documentElement.scrollWidth") <= w + 1, f"{w}px: débordement horizontal"
    curtain = box(page, ".survie-fin-rideau")
    title = box(page, ".survie-fin-rideau-contenu strong")
    btn = box(page, ".survie-fin-passer")
    assert curtain and title and btn
    assert curtain["width"] <= w+1 and abs(curtain["x"]) <= 1, f"{w}: rideau pas centré {curtain}"
    assert title["x"] >= -1 and title["x"] + title["width"] <= w+1
    assert btn["x"] >= -1 and btn["x"] + btn["width"] <= w+1
    assert btn["y"] + btn["height"] <= page.viewport_size["height"] - 4, f"{w}: passer caché"

def test_size(browser, w, h, path):
    context = browser.new_context(viewport={"width":w,"height":h},
                                  device_scale_factor=2, is_mobile=True, has_touch=True,
                                  reduced_motion="no-preference")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(path.as_uri())
    page.locator(".survie-tuile").first.wait_for()
    assert page.locator(".survie-fin-rideau").is_hidden()
    page.evaluate("surviePartie.total=8;surviePartie.maxSerie=6;survieEnregistrer(6);survieTerminer()")
    assert page.evaluate("surviePartie.actif") is False
    assert page.evaluate("surviePartie.restant")==0
    assert page.locator(".survie-fin-rideau").is_visible()
    assert page.locator("#survie-secondes").inner_text()=="0 s"
    assert page.locator("#survie-fin-score").count()==0
    assert_screen(page, w)
    page.wait_for_timeout(450)
    page.screenshot(path=str(OUT / f"rideau-{w}.png"), full_page=False)
    page.wait_for_timeout(650)
    # À 1 100 ms, le message doit toujours être lisible (ancienne valeur : 950 ms).
    assert page.locator(".survie-fin-rideau").is_visible()
    assert page.locator("#survie-fin-score").count()==0
    page.wait_for_timeout(1200)
    page.locator("#survie-fin-score").wait_for()
    assert page.locator(".survie-fin-rideau").count()==0
    assert page.locator(".survie-fin-stats").inner_text().find("8")>=0
    assert page.locator("#survie-jeu").get_attribute("class")=="survie-jeu survie-jeu-resultats"
    assert page.evaluate("document.documentElement.scrollWidth") <= w+1
    page.screenshot(path=str(OUT / f"resultat-{w}.png"), full_page=True)
    page.locator(".survie-fin .jeux-jouer").click()
    assert page.evaluate("surviePartie.actif") is True
    assert page.locator(".survie-fin-rideau").is_hidden()
    assert not errors, f"{w}px erreurs JS : {errors}"
    context.close()

def test_skip(browser, path):
    context=browser.new_context(viewport={"width":320,"height":700},is_mobile=True,has_touch=True)
    p=context.new_page()
    p.goto(path.as_uri())
    p.evaluate("surviePartie.total=2;surviePartie.maxSerie=2;survieTerminer()")
    p.locator(".survie-fin-passer").click()
    assert p.locator("#survie-fin-score").is_visible()
    assert p.locator("#survie-fin-score").inner_text()=="2"
    assert p.evaluate("surviePartie.finEnCours") is False
    p.locator(".survie-fin .survie-fin-retour").click()
    assert p.evaluate("surviePartie.resultatsVisibles") is False
    context.close()

def test_reduced(browser, path):
    context=browser.new_context(viewport={"width":360,"height":740},
                                reduced_motion="reduce",is_mobile=True,has_touch=True)
    p=context.new_page();p.goto(path.as_uri())
    p.evaluate("surviePartie.maxSerie=3;survieTerminer()")
    assert p.locator("#survie-fin-score").inner_text()=="3"
    assert p.locator(".survie-fin-rideau").count()==0
    context.close()

def main():
    fixture=PUBLIC/f"_survie_fin_fixture_{uuid4().hex}.html"
    try:
        fixture.write_text(FIXTURE,encoding="utf-8")
        with sync_playwright() as pw:
            browser=pw.chromium.launch()
            for w,h in SIZES:
                test_size(browser,w,h,fixture)
                print(f"OK: {w} × {h}")
            test_skip(browser,fixture)
            test_reduced(browser,fixture)
            browser.close()
    finally:
        fixture.unlink(missing_ok=True)

if __name__ == "__main__":
    main()
