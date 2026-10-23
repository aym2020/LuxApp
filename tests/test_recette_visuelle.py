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
    # Les fichiers restent frais, même quand la recette tourne longtemps dans Termux.
    auth='Basic '+base64.b64encode((USER+':'+PASS).encode()).decode()
    for url in (REC, REC+'jeux-v21.js', REC+'jeux-v21.css', REC+'recette/recette.js'):
        req=urllib.request.Request(url,headers={'Authorization':auth})
        with urllib.request.urlopen(req) as response:
            assert 'no-store' in response.headers.get('Cache-Control',''), (
                url, response.headers.get('Cache-Control'))
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

        # Régression Chrome/Windows : popup native blanche + texte clair illisible.
        # Le color-scheme et les couleurs des options actives/désactivées doivent rester lisibles.
        menu_couleurs = pg.evaluate("""() => {
          const select = document.querySelector('#rec-ecran');
          const enabled = [...select.options].find(o => !o.disabled);
          const disabled = [...select.options].find(o => o.disabled);
          return {
            scheme: getComputedStyle(select).colorScheme,
            fond: getComputedStyle(enabled).backgroundColor,
            actif: getComputedStyle(enabled).color,
            inactif: getComputedStyle(disabled).color
          };
        }""")
        assert 'dark' in menu_couleurs['scheme'], menu_couleurs
        assert menu_couleurs['fond'] == 'rgb(38, 36, 31)', menu_couleurs
        assert menu_couleurs['actif'] == 'rgb(246, 241, 233)', menu_couleurs
        assert menu_couleurs['inactif'] == 'rgb(183, 175, 163)', menu_couleurs
        ok('liste native de recette : popup sombre, options lisibles même désactivées (Chrome/Windows)')


        def lancer(lecon, ecran, scenario, sujet=None):
            pg.evaluate("fermerPanneau(); ouvrirRecette()")
            # La leçon n'est proposée que hors examen (champ masqué pour « Fin d'examen »)
            pg.select_option('#rec-ecran', ecran)
            if pg.is_visible('#rec-lecon'):
                pg.select_option('#rec-lecon', str(lecon))
                pg.select_option('#rec-ecran', ecran)
            if sujet:
                pg.select_option('#rec-examen', sujet)
            pg.select_option('#rec-scenario', scenario)
            t = time.time()
            pg.click('#rec-voir')
            pg.wait_for_function("recDerniereDuree !== null && !document.getElementById('panneau')", timeout=10000)
            return time.time() - t

        durees = {}
        # P0-01 : les états affichés dans 3001 proviennent du vrai moteur.
        # Vérifier que chaque scénario est sélectionnable et explique le test lié.
        pg.evaluate("fermerPanneau(); ouvrirRecette()")
        pg.select_option('#rec-lecon','2')
        pg.select_option('#rec-ecran','motcache')
        assert pg.is_visible('#rec-criteres') and 'tests/test_motcache' in pg.inner_text('#rec-criteres')
        pg.evaluate('fermerPanneau()')
        lancer(2, 'motcache', 'decouverte')
        assert pg.locator('#mc-btn-reconstruire').count() == 1
        lancer(2, 'motcache', 'depart')
        assert pg.locator('#mc-btn-valider').is_visible()
        assert pg.locator('#mc-legende').is_visible()
        for n in (1, 2, 3):
            lancer(2, 'motcache', 'erreur-%d' % n)
            assert pg.evaluate('mc.essais') == n
            assert pg.locator('#mc-erreur').is_visible()
            assert pg.locator('#mc-btn-valider').is_visible()
            if n == 3:
                pg.locator('.mc-aide-ouvrir').click()
                assert pg.locator('#mc-btn-voir').is_visible()
                # Un dialogue natif reste modal : il faut le refermer avant
                # de pouvoir toucher les Outils de test du scénario suivant.
                pg.locator('.mc-aide-fermer').click()
                assert not pg.locator('#mc-aide-dialog').evaluate('el => el.open')
        lancer(2, 'motcache', 'indice')
        assert pg.evaluate('mc.indices') == 1 and pg.locator('.mc-case.indice').count() == 1
        lancer(2, 'motcache', 'reussite')
        assert pg.evaluate('pAttente') and 'Bien joué' in pg.inner_text('#pc-feedback')
        lancer(2, 'motcache', 'revelation')
        assert pg.evaluate('pAttente') and pg.evaluate('mc.revele')
        assert pg.locator('#pc-continuer').is_visible()
        ok('3001 Mot caché : découverte, départ, 1–3 erreurs, aide, indice, réussite et révélation')

        for ecran, prefix in (('quiz','Q'),('trous','T')):
            lancer(2, ecran, 'depart')
            assert pg.locator('#pc-choix .choice').count() >= 2
            lancer(2, ecran, 'juste')
            assert pg.evaluate('pAttente') and pg.locator('#pc-feedback.ok').is_visible()
            lancer(2, ecran, 'faux')
            assert pg.evaluate('pAttente') and pg.locator('#pc-feedback.ko').is_visible()
            assert pg.locator('#pc-choix .choice.wrong').count() == 1
            assert pg.locator('#pc-choix .choice.correct').count() == 1
            if ecran == 'trous': assert pg.locator('#pc-blank').evaluate('el => el.style.color') != ''
            ok('3001 %s : départ, juste, faux et correction cohérente' % prefix)

        lancer(2, 'ecriture', 'depart')
        assert pg.locator('#pc-ecr-input').is_visible()
        lancer(2, 'ecriture', 'erreur-1')
        assert pg.evaluate('ecrEssais') == 1 and pg.locator('#pc-ecr-erreur').is_visible()
        lancer(2, 'ecriture', 'juste')
        assert pg.evaluate('pAttente') and 'Juste !' in pg.inner_text('#pc-feedback')
        lancer(2, 'ecriture', 'juste-2')
        assert pg.evaluate('pAttente') and '2e essai' in pg.inner_text('#pc-feedback')
        lancer(2, 'ecriture', 'faux-2')
        assert pg.evaluate('pAttente') and pg.locator('#pc-feedback.ko').is_visible()
        ok('3001 Écriture : départ, première erreur, réussite immédiate ou différée, échec définitif')

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

        # Résultats d'examens : vraies annales, mêmes calculs et mêmes boutons.
        pg.evaluate("fermerPanneau(); ouvrirRecette()")
        pg.select_option('#rec-ecran', 'examen')
        assert pg.is_visible('#rec-examen') and not pg.is_visible('#rec-lecon')
        assert pg.locator('#rec-examen option').count() >= 2
        pg.evaluate("fermerPanneau()")
        durees['examen-sans-faute'] = lancer(24, 'examen', 'sans-faute', 'a12-01')
        assert vue(pg) == 'view-examen-result' and pg.evaluate("exam.id") == 'a12-01'
        assert pg.evaluate("examRes.score === examRes.total")
        assert 'Très bien' in pg.inner_text('#exr-body') and pg.evaluate("examRes.sections.length") > 1
        assert pg.evaluate("examRes.sections.reduce((s, x) => s + x.score, 0) === examRes.score")
        assert pg.evaluate("Object.keys(getExamScores()).length") == 1
        ok('annale 1 · 100 % : vrai résultat et sections, meilleur score enregistré uniquement dans la recette')
        # Spec 49 : retour du haut = « ← Sujets » (lancé depuis le Chemin), historique réel
        assert pg.inner_text('#exr-retour').strip() == '← Sujets'
        assert pg.get_attribute('#exr-retour', 'aria-label') == "Retour aux sujets d'examen"
        assert pg.evaluate("pileNav.map(e => e.vue).slice(-2)") == ['view-examens', 'view-examen-result']
        pg.click('#exr-retour')
        assert vue(pg) == 'view-examens' and pg.evaluate("niveauActif") == 'A1.2'
        assert pg.locator('#examens-list .ex-carte-score').count() >= 1
        ok('annale 1 · 100 % : « ← Sujets » (et non « Mon chemin ») → liste des sujets A1.2, score visible')

        durees['examen-tres-bien'] = lancer(24, 'examen', 'tres-bien', 'a12-01')
        assert 80 <= pg.evaluate("Math.round(examRes.score / examRes.total * 100)") < 100
        assert 'Très bien' in pg.inner_text('#exr-body')
        durees['examen-reussi'] = lancer(24, 'examen', 'reussi', 'a12-01')
        assert 60 <= pg.evaluate("Math.round(examRes.score / examRes.total * 100)") < 80
        assert pg.locator('#exr-body .exr-ring.ok').count() == 1
        assert pg.evaluate("examRes.score < examRes.total")
        assert pg.evaluate("""() => exam.parties.every((p, i) => examItems(p).every((item, j) =>
            examAnswers[i][j] === item.reponse || examAnswers[i][j] === null ||
            (item.choix || p.banque || []).includes(examAnswers[i][j])))""")
        pg.click('#exr-body .exr-filter button:has-text("Mes erreurs")')
        assert pg.evaluate("examOnlyErrors") and pg.locator('#exr-body .exr-item.ok').count() == 0
        pg.click('#exr-body .exr-filter button:has-text("Toute la correction")')
        assert not pg.evaluate("examOnlyErrors")
        ok('annale 1 · 70 % : vraies réponses/options, correction filtrable et scores cohérents')
        # Specs 49 et 74 : après les filtres, Retour et Terminer mènent aux sujets
        assert pg.inner_text('#exr-retour').strip() == '← Sujets'
        pg.click('#exr-terminer')
        assert vue(pg) == 'view-examens'
        ok('annale 1 · 70 % : après « Mes erreurs » / « Toute la correction », « Terminer » → sujets')
        # Retour du téléphone : sujets, puis l'écran d'avant, sans reboucler sur le résultat
        lancer(24, 'examen', 'reussi', 'a12-01')
        pg.go_back(); pg.wait_for_timeout(200)
        assert vue(pg) == 'view-examens'
        pg.go_back(); pg.wait_for_timeout(200)
        assert vue(pg) not in ('view-examen-result', 'view-examen', 'view-examens'), vue(pg)
        ok('Retour du téléphone : résultat → sujets → %s, sans boucle' % vue(pg))

        durees['examen-echec'] = lancer(24, 'examen', 'echec', 'a12-01')
        assert pg.evaluate("Math.round(examRes.score / examRes.total * 100)") < 60
        assert pg.locator('#exr-body .exr-ring.ko').count() == 1
        durees['examen-erreurs'] = lancer(24, 'examen', 'mes-erreurs', 'a12-02')
        assert pg.evaluate("exam.id") == 'a12-02' and pg.evaluate("examOnlyErrors")
        assert vue(pg) == 'view-examen-result' and pg.locator('#exr-body .exr-item.ok').count() == 0
        pg.click('#exr-refaire')
        assert vue(pg) == 'view-examen' and pg.evaluate("examAnswers.every(p => p.every(a => a === null))")
        ok('annale 1 · échec ; annale 2 · filtre erreurs ; Refaire ce sujet repart de zéro')
        durees['examen-retour'] = lancer(24, 'examen', 'reussi', 'a12-02')
        pg.click('#exr-terminer')
        assert vue(pg) == 'view-examens' and pg.locator('#examens-list .ex-carte-score').count() >= 1
        ok('Terminer : vrai retour à la liste et meilleur score fictif visible')

        # Isolation : rien vers le cloud ; « Quitter le test » efface la progression fictive
        assert not cloud, cloud
        pg.evaluate("recQuitter()")
        reste = pg.evaluate("Object.keys(localStorage).filter(k => k !== 'recette:choix')")
        assert pg.evaluate("getUnitBest(24, 1)") is None and pg.evaluate("getMissionBest(24)") is None, reste
        assert pg.evaluate("Object.keys(getExamScores()).length") == 0
        pg.reload(); pg.wait_for_selector('#today')
        assert pg.evaluate("getMissionBest(24)") is None and pg.evaluate("recLireChoix().lecon") == 24
        assert pg.evaluate("recLireChoix().examen") == 'a12-02' and not pg.evaluate("Object.keys(getExamScores()).length")
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
