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
<style>:root{--font:Arial,sans-serif;--accent:#f5cf4d;--couleur-reussi:#54e0ad;--couleur-erreur:#ef7a73}
*{box-sizing:border-box}html,body{margin:0;background:#0f0e0c;color:#f5f0e8;font:16px Arial,sans-serif}
:root{--couleur-texte:#f6f1e9;--couleur-texte-2:#c8bda8;--couleur-texte-3:#aaa090;--couleur-bord-2:#3d3a31;--couleur-surface-1:#1a1916;--couleur-surface-2:#26241f;--couleur-bord-1:#2a2926;--couleur-action:#f5cf4d;--couleur-sur-action:#0f0e0c;--rayon-bouton:12px}
.view{display:none}.view.active{display:block}</style>
<link rel="stylesheet" href="design-tokens.css">
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
    # La police réelle doit être chargée : pas seulement une famille CSS déclarée.
    loaded=page.evaluate("""async () => {
      const faces=await document.fonts.load('700 26px "Atkinson Hyperlegible"');
      return faces.some(f=>f.status==='loaded');
    }""")
    assert loaded, f"{w}px: Atkinson locale non chargée"
    for selector in (".survie-tuile",".survie-case"):
        famille=page.locator(selector).first.evaluate("el=>getComputedStyle(el).fontFamily")
        poids=page.locator(selector).first.evaluate("el=>getComputedStyle(el).fontWeight")
        assert "Atkinson Hyperlegible" in famille and poids=="700", f"{w}px: {selector} {famille}/{poids}"
    assert page.locator(".survie-fin-rideau").is_hidden()
    page.evaluate("surviePartie.total=4;surviePartie.maxSerie=3;surviePartie.vus=new Set(surviePartie.pool.slice(0,4).map(m=>m.mot));survieEnregistrer(6);survieTerminer()")
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
    assert page.locator("#survie-fin-score").inner_text()=="4"
    assert "Meilleure série" in page.locator(".survie-fin-stats").inner_text()
    assert "2 mots non parcourus" in page.locator(".survie-fin-bilan").inner_text()
    assert "survie-jeu-resultats" in page.locator("#survie-jeu").get_attribute("class")
    assert page.evaluate("document.documentElement.scrollWidth") <= w+1
    page.screenshot(path=str(OUT / f"resultat-{w}.png"), full_page=True)
    page.locator(".survie-resultat-actions .jeux-jouer").click()
    assert page.evaluate("surviePartie.actif") is True
    assert page.locator(".survie-fin-rideau").is_hidden()
    assert not errors, f"{w}px erreurs JS : {errors}"
    context.close()


def test_reserve(browser, w, h, path, passes=False):
    """Vrais états finaux de Survie, sans jouer : réserve épuisée avec/sans mots passés."""
    context = browser.new_context(viewport={"width": w, "height": h},
                                  device_scale_factor=2, is_mobile=True, has_touch=True)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(path.as_uri())
    page.evaluate("""(passes) => {
      const p = surviePartie;
      p.passes = passes ? 2 : 0;
      p.total = p.pool.length - p.passes;
      p.serie = p.total;
      p.maxSerie = p.total;
      p.vus = new Set(p.pool.map(m => m.mot.toLocaleLowerCase('lb')));
      survieEnregistrer(p.maxSerie);
      survieTerminerReserve();
    }""", passes)
    state = "survie-resultat-partiel" if passes else "survie-resultat-parfait"
    page.locator("." + state + " .survie-fin").wait_for()
    expected = "RÉSERVE TERMINÉE" if passes else "SANS-FAUTE"
    assert expected in page.locator(".survie-fin-etat").inner_text()
    assert page.locator("#survie-fin-score").inner_text() == ("4" if passes else "6")
    assert page.locator(".survie-fin-anneau-chiffre span").inner_text()=="SUR 6"
    label = page.locator(".survie-fin-etat").evaluate("el => getComputedStyle(el).color")
    if passes:
        assert label != "rgb(84, 224, 173)", "réserve parcourue indûment verte"
        assert "2 mots passés" in page.locator(".survie-fin-bilan").inner_text()
        assert "Rejouer Survie" in page.locator(".survie-resultat-actions .jeux-jouer").inner_text()
        assert "SANS-FAUTE" not in page.locator(".survie-fin").inner_text()
    else:
        assert label == "rgb(84, 224, 173)", "sans-faute non représenté en vert"
        assert "Aucun mot passé" in page.locator(".survie-fin-bilan").inner_text()
        assert "Continuer mon chemin" in page.locator(".survie-resultat-actions .jeux-jouer").inner_text()
    assert page.evaluate("document.documentElement.scrollWidth") <= w + 1, f"débordement horizontal {w}"
    ring = page.locator(".survie-fin-anneau").bounding_box()
    number = page.locator("#survie-fin-score").bounding_box()
    denominator = page.locator(".survie-fin-anneau-chiffre span").bounding_box()
    assert ring and number and denominator
    assert number["x"] >= ring["x"] + 8 and number["x"]+number["width"] <= ring["x"]+ring["width"]-8, f"{w}: chiffre déborde du cercle"
    assert denominator["x"] >= ring["x"] + 8 and denominator["x"]+denominator["width"] <= ring["x"]+ring["width"]-8, f"{w}: total déborde du cercle"
    assert number["y"]+number["height"] <= denominator["y"]+1, f"{w}: chevauchement chiffre / total"
    footer = page.locator(".survie-resultat-actions").bounding_box()
    primary = page.locator(".survie-resultat-actions .jeux-jouer").bounding_box()
    secondary = page.locator(".survie-resultat-actions .survie-fin-retour").bounding_box()
    assert footer and primary and secondary, f"{w}: actions manquantes"
    assert primary["height"]>=48 and secondary["height"]>=44
    assert footer["y"] >= 0 and footer["y"]+footer["height"] <= h + 1, f"{w}: pied hors écran"
    assert primary["y"] >= footer["y"] and primary["y"]+primary["height"] <= footer["y"]+footer["height"]
    assert secondary["y"]+secondary["height"] <= h + 1
    # Sur un écran normal, le centre ne doit plus bouger de quelques pixels.
    if h >= 844:
        dimensions = page.locator(".survie-resultat-scroll").evaluate(
            "el => ({scroll: el.scrollHeight, visible: el.clientHeight})")
        assert dimensions["scroll"] <= dimensions["visible"] + 2, (
            f"{w}x{h}: micro-scroll inutile, {dimensions}")
    page.locator(".survie-resultat-scroll").evaluate("el => el.scrollTop = el.scrollHeight")
    after = page.locator(".survie-resultat-actions .jeux-jouer").bounding_box()
    assert abs(after["y"]-primary["y"])<=1, f"{w}: CTA bouge après scroll"
    button = page.locator(".survie-resultat-actions .jeux-jouer").bounding_box()
    assert button and button["width"] >= 200 and button["x"] >= 0 and button["x"] + button["width"] <= w + 1
    assert not errors, f"erreurs JS : {errors}"
    page.screenshot(path=str(OUT / f"reserve-{'passes' if passes else 'parfait'}-{w}.png"), full_page=True)
    context.close()


def test_short_height(browser, path):
    context=browser.new_context(viewport={"width":320,"height":520},is_mobile=True,has_touch=True)
    page=context.new_page()
    page.goto(path.as_uri())
    page.evaluate("""() => {
      const p=surviePartie;
      p.total=p.pool.length; p.maxSerie=p.pool.length;
      p.vus=new Set(p.pool.map(m=>m.mot));
      survieTerminerReserve();
    }""")
    footer=page.locator(".survie-resultat-actions").bounding_box()
    button=page.locator(".survie-resultat-actions .jeux-jouer").bounding_box()
    assert footer and button and footer["y"]>=0 and footer["y"]+footer["height"]<=521
    assert page.locator(".survie-resultat-scroll").evaluate("el=>el.scrollHeight>el.clientHeight"), "le contenu long doit défiler"
    page.locator(".survie-resultat-scroll").evaluate("el=>el.scrollTop=el.scrollHeight")
    button_after=page.locator(".survie-resultat-actions .jeux-jouer").bounding_box()
    assert abs(button_after["y"]-button["y"])<=1
    assert page.evaluate("document.documentElement.scrollWidth")<=321
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
    p.locator(".survie-resultat-actions .survie-fin-retour").click()
    assert p.evaluate("surviePartie.resultatsVisibles") is False
    context.close()

def test_reduced(browser, path):
    context=browser.new_context(viewport={"width":360,"height":740},
                                reduced_motion="reduce",is_mobile=True,has_touch=True)
    p=context.new_page();p.goto(path.as_uri())
    p.evaluate("surviePartie.maxSerie=3;survieTerminer()")
    assert p.locator("#survie-fin-score").inner_text()=="0"
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
                test_reserve(browser,w,h,fixture,passes=False)
                test_reserve(browser,w,h,fixture,passes=True)
                print(f"OK: {w} × {h} (chrono, sans-faute, mots passés)")
            test_short_height(browser,fixture)
            test_skip(browser,fixture)
            test_reduced(browser,fixture)
            browser.close()
    finally:
        fixture.unlink(missing_ok=True)

if __name__ == "__main__":
    main()
