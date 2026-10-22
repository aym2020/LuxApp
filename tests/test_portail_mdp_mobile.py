"""Portail LuxApp 2.1 : vrai CSS/JS, bouton œil sur Chromium tactile."""
from pathlib import Path
from uuid import uuid4
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent.parent
PUBLIC=ROOT/"public"
OUT=ROOT/"portail-password-screenshots"
OUT.mkdir(exist_ok=True)
HTML='''<!doctype html><html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="stylesheet" href="design-tokens.css"><link rel="stylesheet" href="components.css">
<link rel="stylesheet" href="style.css"></head><body>
<div id="portail-auth" class="portail-auth hidden" aria-hidden="true"></div>
<script>
window.APP_CONFIG={TESTS:true};
function isCloudEnabled(){return true}
function getProgress(){return {}}
function aDejaPratique(){return false}
function escHtml(v){return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
function programmerGarde(){}
function animationsReduites(){return true}
</script><script src="portail.js"></script><script>portailOuvrir('signin')</script>
</body></html>'''

def check(browser,fixture,w,h):
    context=browser.new_context(viewport={"width":w,"height":h},is_mobile=True,
                                has_touch=True,device_scale_factor=2)
    p=context.new_page()
    errors=[]
    p.on("pageerror",lambda e:errors.append(str(e)))
    p.goto(fixture.as_uri())
    eye=p.locator(".pa-mdp-oeil")
    pw=p.locator("#pa-password")
    eye.wait_for(state="visible")
    assert pw.get_attribute("type")=="password"
    assert pw.get_attribute("autocomplete")=="current-password"
    assert eye.get_attribute("aria-label")=="Afficher le mot de passe"
    assert eye.get_attribute("aria-pressed")=="false"
    assert eye.get_attribute("type")=="button"
    assert eye.get_attribute("aria-controls")=="pa-password"
    pw.fill("EssaiSecret42!")
    assert p.evaluate("document.activeElement.id")=="pa-password"
    a,b=pw.bounding_box(),eye.bounding_box()
    assert a and b and b["width"]>=44 and b["height"]>=44
    assert b["x"]>=a["x"] and b["x"]+b["width"]<=a["x"]+a["width"],f"{w}: œil hors du champ"
    assert b["y"]>=a["y"] and b["y"]+b["height"]<=a["y"]+a["height"],f"{w}: œil trop bas"
    assert p.evaluate("document.documentElement.scrollWidth")<=w+1
    eye.tap()
    assert pw.get_attribute("type")=="text"
    assert pw.input_value()=="EssaiSecret42!"
    assert eye.get_attribute("aria-label")=="Masquer le mot de passe"
    assert eye.get_attribute("aria-pressed")=="true"
    assert p.evaluate("document.activeElement.id")=="pa-password",f"{w}: perte de focus après tap"
    if w==390:p.screenshot(path=str(OUT/"connexion-visible.png"),full_page=True)
    eye.tap()
    assert pw.get_attribute("type")=="password"
    assert pw.input_value()=="EssaiSecret42!"
    assert p.evaluate("document.activeElement.id")=="pa-password"
    eye.focus()
    p.keyboard.press("Enter")
    assert pw.get_attribute("type")=="text"
    p.keyboard.press("Space")
    assert pw.get_attribute("type")=="password"
    p.evaluate("portailOuvrir('signup')")
    pw=p.locator("#pa-password")
    eye=p.locator(".pa-mdp-oeil")
    assert pw.get_attribute("autocomplete")=="new-password"
    assert pw.get_attribute("type")=="password"
    pw.fill("NouveauSecret42!")
    eye.tap()
    assert pw.get_attribute("type")=="text"
    assert pw.input_value()=="NouveauSecret42!"
    assert p.evaluate("document.activeElement.id")=="pa-password"
    if w==390:p.screenshot(path=str(OUT/"inscription-visible.png"),full_page=True)
    assert not errors,f"{w}: JavaScript : {errors}"
    context.close()

def main():
    fixture=PUBLIC/("_portail_oeil_fixture_"+uuid4().hex+".html")
    try:
        fixture.write_text(HTML,encoding="utf-8")
        with sync_playwright() as pw:
            browser=pw.chromium.launch()
            for w,h in [(320,680),(360,740),(390,844),(430,890),(320,520)]:
                check(browser,fixture,w,h)
                print(f"OK portail œil {w}x{h}")
            browser.close()
    finally:
        fixture.unlink(missing_ok=True)

if __name__=="__main__":main()
