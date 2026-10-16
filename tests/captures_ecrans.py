"""Captures des écrans principaux à 4 largeurs (S12).
Usage : python3 tests/captures_ecrans.py <prefixe>   (ex. avant, apres)
Images dans tests/captures/<prefixe>-<ecran>-<largeur>.png
Option LUX_TEXTE=130 : texte agrandi à 130 %."""
import os
import sys
from playwright.sync_api import sync_playwright

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'captures') + '/'
os.makedirs(OUT, exist_ok=True)
PREFIXE = sys.argv[1] if len(sys.argv) > 1 else 'ecran'
LARGEURS = [320, 360, 390, 430]
TEXTE = os.environ.get('LUX_TEXTE')  # ex. "130"

# Chaque écran : nom + script JS qui l'ouvre (profil neuf).
ECRANS = [
    ('accueil', "goDashboard()"),
    ('lecons', "goLessons()"),
    ('lecon2', "openParcoursLecon(lecons.find(l => l.id === 2))"),
    ('intro', "openParcoursLecon(lecons.find(l => l.id === 2)); openIntro(1)"),
    ('exercice', "openParcoursLecon(lecons.find(l => l.id === 2)); startUnite(1, 'unite')"),
]

erreurs = []
debordements = []
with sync_playwright() as p:
    nav = p.chromium.launch()
    for largeur in LARGEURS:
        page = nav.new_page(viewport={'width': largeur, 'height': 844}, device_scale_factor=2)
        page.route('**/*gstatic*/**', lambda r: r.abort())
        page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        page.on('pageerror', lambda e: erreurs.append(str(e)))
        page.on('dialog', lambda d: d.accept())
        page.goto(URL)
        page.wait_for_selector('#today')
        if TEXTE:
            page.add_style_tag(content='html { font-size: %s%% !important; }' % TEXTE)
        for nom, js in ECRANS:
            page.evaluate(js)
            page.wait_for_timeout(150)
            # Débordement horizontal = page plus large que l'écran.
            large = page.evaluate('document.documentElement.scrollWidth')
            if large > largeur:
                debordements.append('%s à %d px : %d px de large' % (nom, largeur, large))
            suffixe = ('-texte' + TEXTE) if TEXTE else ''
            page.screenshot(path='%s%s-%s-%d%s.png' % (OUT, PREFIXE, nom, largeur, suffixe), full_page=True)
        page.close()
    nav.close()

print('captures :', len(LARGEURS) * len(ECRANS), 'dans', OUT)
print('débordements :', debordements or 'aucun')
print('erreurs JS :', erreurs or 'aucune')
