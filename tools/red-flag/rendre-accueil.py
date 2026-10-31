"""SPEC 115 V2 — génère public/art/redflag-accueil.webp (illustration fixe de l'accueil RED FLAG).

Usage (serveur LuxApp local lancé, ex. LUX_TESTS=1 PORT=3456 node server.js) :
    python3 tools/red-flag/rendre-accueil.py [--sortie chemin.webp] [--url http://127.0.0.1:3456/]
Le rendu utilise Three.js et les GLB déjà présents dans le dépôt ; l'application, elle, ne charge
que l'image produite (aucune 3D sur l'écran d'accueil).
"""
import argparse, base64, pathlib
from playwright.sync_api import sync_playwright

ICI = pathlib.Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--sortie', default=str(ICI.parent.parent / 'public/art/redflag-accueil.webp'))
parser.add_argument('--url', default='http://127.0.0.1:3456/')
parser.add_argument('--pose', default='', help='JS optionnel exécuté avant le rendu (réglages POSE, CAM…)')
args = parser.parse_args()
html = (ICI / 'accueil-heroine.html').read_text(encoding='utf-8')
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/__rendu-redflag.html', lambda r: r.fulfill(body=html, content_type='text/html'))
    if args.pose:
        pg.add_init_script(args.pose)
    pg.goto(args.url.rstrip('/') + '/__rendu-redflag.html')
    pg.wait_for_function('window.RESULTAT || false', timeout=60000)
    assert not erreurs, erreurs
    donnees = pg.evaluate('window.RESULTAT').split(',', 1)[1]
    pathlib.Path(args.sortie).write_bytes(base64.b64decode(donnees))
    b.close()
print('écrit', args.sortie)
