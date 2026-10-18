"""Spec 43 : mode recette visuelle. Instance dédiée (RECETTE=1, mot de passe,
sans Firebase) ; « Plus → Outils de test » ; chaque scénario ouvre le vrai écran
de résultat en quelques secondes ; aucune requête cloud ; l'app normale
n'expose rien. Lance sa propre instance de recette sur un autre port."""
import base64
import os
import subprocess
import time
import urllib.error
import urllib.request
from playwright.sync_api import sync_playwright
from helpers import ok, vue, URL, lecon_cadree

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PORT = 3457
REC = 'http://localhost:%d/' % PORT
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


def demarrer(env_sup):
    env = dict(os.environ, PORT=str(PORT), **env_sup)
    proc = subprocess.Popen(['node', 'server.js'], cwd=RACINE, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try:
            urllib.request.urlopen(REC)
        except urllib.error.HTTPError:
            return proc  # répond (401 / 503)
        except Exception:
            time.sleep(0.1)
            continue
        return proc
    raise RuntimeError('instance de recette non démarrée')


# ── 1. L'app normale n'expose rien ──
code, page = http(URL)
assert code == 200 and 'recette' not in page.lower(), 'aucune trace de recette dans la page normale'
assert http(URL + 'recette/recette.js')[0] == 404 and http(URL + '?debug=1')[1].lower().count('recette') == 0
assert 'luxapp-b5c1e' in http(URL + 'config.js')[1], 'config Firebase normale inchangée'
ok('app normale : pas de panneau, /recette/recette.js introuvable, ?debug=1 sans effet, config Firebase intacte')

# ── 2. Instance recette sans mot de passe configuré : refus ──
proc = demarrer({'RECETTE': '1'})
try:
    assert http(REC)[0] == 503
finally:
    proc.terminate(); proc.wait()
ok('RECETTE=1 sans RECETTE_USER / RECETTE_PASS : refus (503), jamais ouverte par défaut')

proc = demarrer({'RECETTE': '1', 'RECETTE_USER': USER, 'RECETTE_PASS': PASS})
try:
    assert http(REC)[0] == 401 and http(REC, USER + ':faux')[0] == 401 and http(REC + 'recette/recette.js')[0] == 401
    code, page = http(REC, USER + ':' + PASS)
    assert code == 200 and '/recette/recette.js' in page and 'gstatic.com/firebasejs' not in page
    assert 'FIREBASE: null' in http(REC + 'config.js', USER + ':' + PASS)[1]
    ok('instance recette : mot de passe exigé (401 sinon), Firebase retiré de la page et de la config')

    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True,
                            http_credentials={'username': USER, 'password': PASS})
        pg = ctx.new_page()
        erreurs_js = []
        cloud = []
        pg.on('pageerror', lambda e: erreurs_js.append(str(e)))
        CLOUD = ('firestore.googleapis', 'identitytoolkit', 'securetoken', 'firebaseio', 'firebasejs', 'firebaseapp')
        pg.on('request', lambda r: cloud.append(r.url) if any(h in r.url for h in CLOUD) else None)
        pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        pg.goto(REC)
        pg.wait_for_selector('#today')
        assert pg.evaluate("typeof firebase") == 'undefined' and pg.evaluate("window.APP_CONFIG.FIREBASE") is None
        assert pg.is_visible('#recette-badge') and 'MODE TEST' in pg.inner_text('#recette-badge')

        # Plus → Outils de test
        pg.evaluate("ouvrirPlus()")
        pg.click('.recette-ligne')
        assert pg.is_visible('#rec-lecon') and 'progression fictive' in pg.inner_text('.recette-panneau')
        libelle = pg.evaluate("document.querySelector('#rec-lecon option[value=\"24\"]').textContent")
        assert 'Leçon 25' in libelle and 'passé composé' in libelle, libelle
        ok('Plus → Outils de test : leçons avec leur numéro affiché (id 24 → « Leçon 25 · Le passé composé »), badge MODE TEST')

        def lancer(lecon, ecran, scenario):
            pg.evaluate("fermerPanneau(); ouvrirRecette()")
            pg.select_option('#rec-lecon', str(lecon))
            pg.select_option('#rec-ecran', ecran)
            pg.select_option('#rec-scenario', scenario)
            t = time.time()
            pg.click('#rec-voir')
            pg.wait_for_function("recDerniereDuree !== null && !document.getElementById('panneau')", timeout=10000)
            return time.time() - t

        durees = {}
        # Missions (leçon 25 = id 24)
        durees['sans-faute'] = lancer(24, 'mission', 'sans-faute')
        assert vue(pg) == 'view-mission' and pg.evaluate("ms.bilan.vies") == 3 and pg.evaluate("ms.bilan.ok") == 10
        assert 'Mission réussie' in pg.inner_text('#view-mission') and pg.evaluate("missionReussie(lecons.find(l => l.id === 24))")
        ok('mission sans faute : vrai bilan « Mission réussie », 10 / 10, 3 vies')

        durees['une-vie'] = lancer(24, 'mission', 'une-vie')
        assert pg.evaluate("ms.bilan.vies") == 1 and 'Leçon validée' in pg.inner_text('#view-mission')
        assert pg.evaluate("unitesCoeur(lecons.find(l => l.id === 24)).every(u => getUnitBest(24, u.id) == null)"), 'pas d\'étoiles fictives'
        ok('mission réussie avec 2 erreurs : 1 vie, leçon validée, aucune unité créditée')

        durees['perdue'] = lancer(24, 'mission', 'perdue')
        assert pg.evaluate("ms.bilan.vies") == 0 and 'Plus de vie' in pg.inner_text('#view-mission')
        assert not pg.evaluate("missionReussie(lecons.find(l => l.id === 24))")
        assert pg.locator('#view-mission button:has-text("Rejouer la mission")').count() == 1
        ok('mission perdue : 0 vie, « Plus de vie », « Rejouer la mission », non validée')

        durees['tente-ok'] = lancer(24, 'mission', 'tente-ok')
        assert 'Tu connais déjà cette leçon' in pg.inner_text('#view-mission')
        durees['tente-ko'] = lancer(24, 'mission', 'tente-ko')
        assert 'Les unités vont t\'aider' in pg.inner_text('#view-mission') and not pg.evaluate("missionReussie(lecons.find(l => l.id === 24))")
        ok('Tente ta chance : réussie (« Tu connais déjà… ») et perdue (renvoi vers les unités)')

        durees['derniere'] = lancer(24, 'mission', 'derniere')
        assert pg.locator('#ms-input').count() == 1 and pg.evaluate("ms.bilan") is None
        pg.fill('#ms-input', pg.evaluate("pLecon.scene[ms.idx].lu")); pg.click('#ms-btn-valider'); pg.click('#ms-continuer')
        assert pg.evaluate("ms.bilan.ok") == 10
        ok('juste avant la dernière réponse : une réponse et le vrai bilan s\'affiche')

        # Vrais boutons : « Rejouer la mission » puis Retour
        lancer(24, 'mission', 'perdue')
        pg.click('#view-mission button:has-text("Rejouer la mission")')
        assert vue(pg) == 'view-mission' and pg.locator('#ms-input').count() == 1
        pg.go_back(); pg.wait_for_timeout(150)
        assert vue(pg) == 'view-plecon', vue(pg)
        ok('vrais boutons : « Rejouer la mission » relance la mission, Retour → la leçon')

        # Étapes, unités, rattrapage
        durees['etape'] = lancer(24, 'etape', 'deuxieme-essai')
        assert vue(pg) == 'view-pfin' and pg.evaluate("pResultat.mode") == 'etape' and pg.evaluate("pResultat.erreurs.length") >= 1
        durees['unite'] = lancer(24, 'unite', 'erreurs')
        assert vue(pg) == 'view-pfin' and pg.evaluate("pResultat.erreurs.length") == 3
        assert pg.locator('#view-pfin button:has-text("Refaire mes erreurs")').count() == 1
        ok('fin d\'étape (2e essai) et fin d\'unité avec 3 erreurs : vrais résultats, « Refaire mes erreurs » présent')

        durees['rattrapage'] = lancer(24, 'rattrapage', 'termine')
        assert vue(pg) == 'view-pfin' and pg.evaluate("pResultat.mode") == 'erreurs'
        pg.click('#pf-suite')
        pg.wait_for_timeout(500)
        lecon_cadree(pg, 24)
        # Spec 44 dans l'instance de recette : une actualisation garde le Chemin et la leçon dépliée
        pg.reload()
        pg.wait_for_function("typeof navigationRestauree !== 'undefined' && navigationRestauree === true")
        pg.wait_for_timeout(450)
        lecon_cadree(pg, 24)
        assert pg.is_visible('#recette-badge')
        # … et une mission en cours reprend avec ses réponses et ses vies
        lancer(24, 'mission', 'derniere')
        avant = pg.evaluate("({ idx: ms.idx, vies: ms.vies, faits: ms.resultats.filter(Boolean).length })")
        pg.reload()
        pg.wait_for_function("typeof navigationRestauree !== 'undefined' && navigationRestauree === true")
        assert vue(pg) == 'view-mission' and pg.evaluate("({ idx: ms.idx, vies: ms.vies, faits: ms.resultats.filter(Boolean).length })") == avant
        ok('actualisation dans la recette : Chemin (leçon dépliée) et mission en cours conservés (spec 44)')
        ok('rattrapage → « Mon chemin » : chemin principal, Leçon 25 seule dépliée et cadrée')

        # Isolation : rien vers le cloud ; « Quitter le test » efface la progression fictive
        assert not cloud, cloud
        pg.evaluate("recQuitter()")
        reste = pg.evaluate("Object.keys(localStorage).filter(k => k !== 'recette:choix')")
        assert pg.evaluate("getUnitBest(24, 1)") is None and pg.evaluate("getMissionBest(24)") is None, reste
        pg.reload(); pg.wait_for_selector('#today')
        assert pg.evaluate("getMissionBest(24)") is None and pg.evaluate("recLireChoix().lecon") == 24
        ok('isolation : aucune requête cloud ; « Quitter le test » efface tout, rien ne revient au rechargement ; dernier choix gardé')

        lente = max(durees.values())
        assert lente < 3, durees
        ok('durée : chaque scénario prêt en %.1f s au plus (%s)' % (lente, ', '.join('%s %.1f' % (k, v) for k, v in durees.items())))
        b.close()
finally:
    proc.terminate(); proc.wait()

print()
print('Erreurs JavaScript :', erreurs_js or 'aucune')
if erreurs_js:
    raise SystemExit(1)
