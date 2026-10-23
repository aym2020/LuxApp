"""Accès à la recette depuis l'app réelle.
- RECETTE_URL + RECETTE_ACCES : la ligne « Outils de test » n'apparaît dans Plus
  que pour les comptes autorisés, et ouvre l'instance de recette ;
- adresse non https ou liste vide : rien n'est exposé ;
- instance de recette avec LUXAPP_URL : bouton « Retour à LuxApp ».
Lance ses propres serveurs sur d'autres ports."""
import base64
import os
import subprocess
import time
import urllib.error
import urllib.request
from playwright.sync_api import sync_playwright
from helpers import ok

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PORT_APP, PORT_REC = 3461, 3462
APP = 'http://localhost:%d/' % PORT_APP
REC = 'http://localhost:%d/' % PORT_REC
URL_RECETTE = 'https://recette.exemple.test/'
URL_LUXAPP = 'https://luxapp.exemple.test/'
USER, PASS = 'recette', 'mot-de-passe-test'


def http(url, auth=None):
    req = urllib.request.Request(url)
    if auth:
        req.add_header('Authorization', 'Basic ' + base64.b64encode(auth.encode()).decode())
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read().decode('utf8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf8', 'replace')


def demarrer(port, env_sup):
    env = dict(os.environ, PORT=str(port), **env_sup)
    for cle in ('RECETTE', 'RECETTE_URL', 'RECETTE_ACCES', 'LUXAPP_URL'):
        if cle not in env_sup:
            env.pop(cle, None)
    proc = subprocess.Popen(['node', 'server.js'], cwd=RACINE, env=env,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try:
            urllib.request.urlopen('http://localhost:%d/' % port)
        except urllib.error.HTTPError:
            return proc
        except Exception:
            time.sleep(0.1)
            continue
        return proc
    raise RuntimeError('serveur non démarré')


def arreter(proc):
    proc.terminate()
    proc.wait()


# ── 1. Config : exposée seulement si adresse https ET liste de comptes ──
cas = [
    ({'RECETTE_URL': URL_RECETTE}, False),
    ({'RECETTE_ACCES': 'abc'}, False),
    ({'RECETTE_URL': 'javascript:alert(1)', 'RECETTE_ACCES': 'abc'}, False),
    ({'RECETTE_URL': 'http://recette.exemple.test/', 'RECETTE_ACCES': 'abc'}, False),
    ({'RECETTE_URL': URL_RECETTE, 'RECETTE_ACCES': 'abc, def'}, True),
]
for env, attendu in cas:
    proc = demarrer(PORT_APP, env)
    try:
        config = http(APP + 'config.js')[1]
        assert 'luxapp-b5c1e' in config, 'config Firebase conservée'
        assert ('LIEN_RECETTE' in config) == attendu, (env, config[-200:])
        if attendu:
            assert '"uids":["abc","def"]' in config
    finally:
        arreter(proc)
ok('config : lien exposé seulement avec une adresse https et au moins un compte autorisé')

# ── 2. App réelle : ligne visible pour le compte autorisé, absente sinon ──
proc = demarrer(PORT_APP, {'LUX_TESTS': '1', 'RECETTE_URL': URL_RECETTE, 'RECETTE_ACCES': 'abc'})
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_context(viewport={'width': 390, 'height': 844}).new_page()
        erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.route('**/*gstatic*/**', lambda r: r.abort())
        pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        pg.route(URL_RECETTE + '**', lambda r: r.fulfill(status=200, content_type='text/html', body='<h1>recette</h1>'))
        pg.goto(APP)
        pg.wait_for_selector('#today')

        def lignes_plus():
            pg.evaluate("fermerPanneau && document.getElementById('panneau') && fermerPanneau()")
            pg.wait_for_function("!document.getElementById('panneau')")
            pg.evaluate("ouvrirPlus()")
            return pg.evaluate("[...document.querySelectorAll('#panneau .plus-ligne b')].map(b => b.textContent)")

        assert 'Outils de test' not in lignes_plus(), 'invité : pas de ligne'
        pg.evaluate("fbAuth = { currentUser: { uid: 'xyz' } }")
        assert 'Outils de test' not in lignes_plus(), 'autre compte : pas de ligne'
        pg.evaluate("fbAuth = { currentUser: { uid: 'abc' } }")
        lignes = lignes_plus()
        assert lignes[-1] == 'Outils de test', lignes
        ok('Plus : « Outils de test » seulement pour le compte autorisé (ni invité, ni autre compte)')

        pg.click('#panneau .plus-ligne:last-of-type')
        pg.wait_for_url(URL_RECETTE)
        assert erreurs == [], erreurs
        ok('Outils de test : ouvre l\'instance de recette')
        b.close()
finally:
    arreter(proc)

# ── 3. Instance de recette : « Retour à LuxApp » si LUXAPP_URL est défini ──
for retour in (URL_LUXAPP, None):
    env = {'RECETTE': '1', 'RECETTE_USER': USER, 'RECETTE_PASS': PASS}
    if retour:
        env['LUXAPP_URL'] = retour
    proc = demarrer(PORT_REC, env)
    try:
        # Contrôle du vrai accès HTTP, indépendamment de la visibilité du bouton.
        assert http(REC)[0] == 401
        assert http(REC + 'config.js')[0] == 401
        assert http(REC, USER + ':faux')[0] == 401
        code, config_rec = http(REC + 'config.js', USER + ':' + PASS)
        assert code == 200 and 'FIREBASE: null' in config_rec
        assert (URL_LUXAPP in config_rec) == bool(retour)
        with sync_playwright() as p:
            b = p.chromium.launch()
            ctx = b.new_context(viewport={'width': 390, 'height': 844},
                                http_credentials={'username': USER, 'password': PASS})
            pg = ctx.new_page()
            pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
            pg.route(URL_LUXAPP + '**', lambda r: r.fulfill(status=200, content_type='text/html', body='<h1>app</h1>'))
            pg.goto(REC)
            pg.wait_for_selector('#today')
            assert pg.evaluate("window.APP_CONFIG.FIREBASE") is None
            pg.evaluate("ouvrirRecette()")
            bouton = pg.locator('.recette-panneau button', has_text='Retour à LuxApp')
            if retour:
                assert bouton.count() == 1
                bouton.click()
                pg.wait_for_url(URL_LUXAPP)
            else:
                assert bouton.count() == 0
            b.close()
    finally:
        arreter(proc)
ok('recette : « Retour à LuxApp » présent avec LUXAPP_URL et ramène à l\'app, absent sinon')
print('test_acces_recette : OK')
