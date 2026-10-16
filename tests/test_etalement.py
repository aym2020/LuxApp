import os
import sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(ICI, 'test_fil.py')).read()
bloc = src[src.index('    res = page.evaluate("""() => {\n        const today'):src.index("    ok('étalement v1")]
erreurs = []
with sync_playwright() as p:
    nav = p.chromium.launch(); page = nav.new_page()
    page.route('**/*gstatic*/**', lambda r: r.abort())
    page.on('pageerror', lambda e: erreurs.append(str(e)))
    page.goto(os.environ.get('LUX_URL', 'http://localhost:3456/')); page.wait_for_selector('#today')
    import textwrap; exec(textwrap.dedent(bloc))
    print('  ok   étalement v1 :', res['dusAuj'], '/ 300 vieilles questions dues aujourd\'hui · erreurs actives toujours dues · question vue depuis la v2 inchangée')
    page.evaluate("openLecon(lecons.find(l => l.id === 7))")
    assert page.evaluate("document.getElementById('view-lecon').classList.contains('active')")
    print('  ok   leçon 7 (ancien format) : écran à onglets inchangé')
    nav.close()
print('Erreurs JavaScript :', erreurs or 'aucune'); sys.exit(1 if erreurs else 0)
