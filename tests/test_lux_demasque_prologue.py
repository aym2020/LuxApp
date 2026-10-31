"""SPEC 115 — RED FLAG : prologue « Le téléphone vibre » (PR-01 à PR-12, Chromium).

Premier accès depuis Jeux : cinématique 3D (instance WebGL partagée) → messages HTML →
« Ouvrir Cringr » → sélecteur SPEC 113 inchangé. Passer à chaque étape, Retour, relecture,
replis (3D absente, GLB lent, stockage refusé), son, mouvement réduit, tailles, catalogue
partiel et enchaînements avec la rencontre. LD_CAPTURES=dossier : captures de chaque plan.
"""
import json
import os
from playwright.sync_api import sync_playwright
from helpers import URL, ok

CAPTURES = os.environ.get('LD_CAPTURES')
CLE = 'luxDemasquePrologueVuV1'
ETAT = """() => ({
  ecran: document.getElementById('ld-jeu').dataset.ecran,
  prologue: !!ld.prologue, partie: !!ld.partie, selection: !!ld.selection,
  canvas: document.querySelectorAll('canvas').length,
  vu: ldLire('luxDemasquePrologueVuV1', null),
  vue: document.querySelector('.view.active').id })"""


def contexte(b, largeur=360, hauteur=740, **options):
    mobile = largeur < 700
    ctx = b.new_context(viewport={'width': largeur, 'height': hauteur}, is_mobile=mobile, has_touch=mobile, **options)
    pg = ctx.new_page()
    pg.erreurs = []
    pg.on('pageerror', lambda e: pg.erreurs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    return ctx, pg


def demarrer(pg, jouer=True):
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.evaluate("localStorage.setItem('ldSwipeVu','1'); ouvrirJeux()")
    if jouer:
        pg.click('.ld-jouer-hub')


def capture(pg, nom):
    if CAPTURES:
        os.makedirs(CAPTURES, exist_ok=True)
        pg.screenshot(path=os.path.join(CAPTURES, nom + '.png'))


def etat(pg):
    return pg.evaluate(ETAT)


def vers_cringr(pg, bouton):
    pg.click(bouton)
    pg.wait_for_selector('#ld-selection-carte')
    e = etat(pg)
    assert e['ecran'] == 'selection' and not e['prologue'] and not e['partie'] and e['vu'] is True, e
    return e


with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])

    # ── PR-01 / 02 / 03 / 04 : parcours complet, son espionné ─────────────────
    ctx, pg = contexte(b)
    demarrer(pg, jouer=False)
    pg.evaluate("""() => { window.sons115 = []; const ref = ldSon;
      ldSon = (nom, o) => { sons115.push(nom); return ref(nom, o); }; }""")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('.ld-prologue-cinema')
    assert pg.locator('.ld-prologue-passer').is_visible()           # dès la première image
    assert pg.locator('#ld-selection-carte').count() == 0 and not etat(pg)['partie']
    pg.wait_for_selector('#ld-prologue-scene.ld-prologue-3d canvas', timeout=30000)
    assert etat(pg)['canvas'] == 1
    capture(pg, 'pr01-plan1-telephone')
    pg.wait_for_function("sons115.includes('vibre')")
    ok('PR-01 : premier accès → prologue 3D (un seul canvas), « Passer l’intro » visible dès le chargement, vibration')

    pg.wait_for_selector('.ld-prologue-messages', timeout=60000)
    e = etat(pg)
    assert e['canvas'] == 0 and e['ecran'] == 'prologue' and not e['selection'], e
    fil = pg.evaluate("[...document.querySelectorAll('.ld-prologue-fil li')].map(li => li.textContent)")
    assert fil == ['Ton amie : Alors, prête pour ton date de ce soir ? 👀', 'Toi : Pas encore trouvé avec qui !'], fil
    total = pg.evaluate("ld.donnees.dossiers.length + (ld.donnees.dossiersRediges || []).length + ((ld.donnees.affaires || []).length ? 1 : 0)")
    assert pg.inner_text('#ld-prologue-notif-texte') == f'{total} profils à découvrir ♥'
    assert pg.evaluate("document.activeElement.classList.contains('ld-prologue-ouvrir')")
    assert min(pg.locator('.ld-prologue-ouvrir').bounding_box()['height'], pg.locator('.ld-prologue-passer').bounding_box()['height']) >= 48
    assert 'message' in pg.evaluate('sons115') and pg.evaluate('LuxDemasqueSon.pisteEnCours()') is None
    pg.wait_for_timeout(1500)
    capture(pg, 'pr03-messages')
    ok(f'PR-02/03 : plans → messages DOM (canvas retiré, aucune musique), notification réelle ({total}), CTA focalisé ≥ 48 px')

    pg.evaluate("""() => { window.rendus115 = 0; const ref = ldRendreSelection;
      ldRendreSelection = () => { rendus115++; return ref(); }; }""")
    pg.locator('.ld-prologue-ouvrir').dblclick()
    pg.wait_for_selector('#ld-selection-carte')
    e = etat(pg)
    assert pg.evaluate('rendus115') == 1 and not e['partie'] and e['vu'] is True and e['canvas'] == 0, e
    assert pg.evaluate('ld.selection.index') == 0 and pg.evaluate('ld.selection.items.length') == total
    assert pg.evaluate("ld.selection.items.filter(i => i.genere).every(i => Number.isInteger(i.graine))")
    assert pg.evaluate("document.activeElement.id") == 'ld-selection-carte'
    # La boucle d'enquête existante prend la suite à l'ouverture de Cringr, une seule fois.
    pg.wait_for_function("LuxDemasqueSon.pisteEnCours() === 'enquete'", timeout=15000)
    capture(pg, 'pr04-cringr')
    ok('PR-04 : « Ouvrir Cringr » (double appui) → un seul rendu du sélecteur, premier profil, aucune partie, prologue mémorisé')

    # ── PR-06 : intro vue → Cringr direct ; « Revoir l’introduction » ─────────
    pg.evaluate("ldQuitter()")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('#ld-selection-carte')
    assert pg.locator('.ld-prologue').count() == 0
    pg.get_by_role('button', name='Revoir l’introduction').click()
    pg.wait_for_selector('.ld-prologue-cinema')
    vers_cringr(pg, '.ld-prologue-passer')
    assert pg.evaluate("ld.selection.items.length") == total
    ok('PR-06 : intro vue → Cringr immédiat ; « Revoir l’introduction » rejoue puis rend le même sélecteur')

    # ── PR-05 : Retour pendant le cinéma, puis pendant les messages ────────────
    pg.get_by_role('button', name='Revoir l’introduction').click()
    pg.wait_for_selector('#ld-prologue-scene.ld-prologue-3d canvas', timeout=30000)
    pg.evaluate("history.back()")
    pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    e = etat(pg)
    assert not e['prologue'] and e['canvas'] == 0 and pg.evaluate('LuxDemasqueSon.pisteEnCours()') is None, e
    pg.wait_for_timeout(4500)                                       # plus aucun plan ni message ne revient
    assert etat(pg)['vue'] == 'view-jeux' and not etat(pg)['prologue'] and etat(pg)['canvas'] == 0
    assert pg.evaluate("document.getElementById('ld-jeu').querySelector('.ld-prologue-messages')") is None
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('#ld-selection-carte')
    pg.evaluate("ldRevoirIntroduction()")
    pg.wait_for_selector('.ld-prologue-messages', timeout=60000)
    pg.evaluate("history.back()")
    pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    assert not etat(pg)['prologue'] and etat(pg)['canvas'] == 0
    assert not pg.erreurs, pg.erreurs
    ok('PR-05 : Retour en cinéma ou en messages → hub Jeux ; scène, canvas, minuteurs et musique arrêtés')

    # ── PR-12 : trois enchaînements intro → Cringr → rencontre → retour ───────
    for k in range(3):
        pg.click('.ld-jouer-hub')
        pg.wait_for_selector('#ld-selection-carte')
        pg.evaluate("ldRevoirIntroduction()")
        pg.wait_for_selector('.ld-prologue-cinema')
        if k == 1:
            pg.wait_for_selector('#ld-prologue-scene.ld-prologue-3d canvas', timeout=30000)
        vers_cringr(pg, '.ld-prologue-passer')
        pg.locator('#ld-selection-carte .ld-image-prete').wait_for(timeout=40000)   # portrait 3D de Cringr
        pg.click('.ld-dating-meet')
        pg.wait_for_selector('.ld-rencontre')
        assert pg.evaluate("!!ld.partie && ld.partie.dossier.id === 'MILO_001'")
        assert pg.evaluate("document.querySelectorAll('canvas').length") <= 1
        pg.evaluate("history.back()")
        pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
        assert not etat(pg)['partie'] and etat(pg)['canvas'] == 0
    assert pg.evaluate("ldLire('luxDemasqueResolus', [])") == [] and pg.evaluate("ldLire('luxDemasqueRecord', 0)") == 0
    assert not pg.erreurs, pg.erreurs
    ok('PR-12 : 3 enchaînements intro → Cringr (portrait 3D) → LIKE → rencontre → retour, sans canvas orphelin ni sauvegarde modifiée')
    ctx.close()

    # ── PR-07 : 3D indisponible, GLB lent, stockage refusé ────────────────────
    ctx, pg = contexte(b)
    pg.route('**/lux-match-3d.js*', lambda r: r.abort())
    demarrer(pg)
    pg.wait_for_selector('#ld-prologue-scene.ld-prologue-repli', timeout=10000)
    capture(pg, 'pr07-repli-2d')
    pg.wait_for_selector('.ld-prologue-messages', timeout=10000)
    vers_cringr(pg, '.ld-prologue-ouvrir')
    ok('PR-07 : module 3D bloqué → repli 2D (téléphone qui s’allume) puis messages et Cringr')
    ctx.close()

    ctx, pg = contexte(b)
    def glb_lent(route):
        pg.wait_for_timeout(6000)
        try:
            route.continue_()
        except Exception:
            pass
    pg.route('**/lux-match/Casual3_Female.glb*', glb_lent)
    demarrer(pg)
    pg.wait_for_selector('#ld-prologue-scene.ld-prologue-repli', timeout=10000)
    pg.wait_for_selector('.ld-prologue-messages', timeout=15000)
    pg.wait_for_timeout(4000)                                       # le GLB arrive après le repli
    assert etat(pg)['canvas'] == 0 and pg.locator('.ld-prologue-messages').count() == 1
    vers_cringr(pg, '.ld-prologue-passer')
    ok('PR-07 : GLB lent → repli à 3,5 s, aucune scène attachée quand le modèle arrive ensuite')
    ctx.close()

    ctx, pg = contexte(b)
    pg.goto(URL); pg.wait_for_selector('#today')
    # Stockage refusé après le démarrage de l'appli (même procédé que test_lux_demasque_cringr).
    pg.evaluate("ouvrirJeux(); Object.defineProperty(window,'localStorage',{get(){throw new DOMException('refusé','SecurityError')}})")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('.ld-prologue-cinema')
    pg.click('.ld-prologue-passer')
    pg.wait_for_selector('#ld-selection-carte')
    pg.evaluate("ldQuitter()")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('#ld-selection-carte')                    # mémoire de session : pas de répétition
    assert pg.locator('.ld-prologue').count() == 0 and not pg.erreurs, pg.erreurs
    ok('PR-07 : stockage refusé → entrée jamais bloquée, prologue non répété dans la session')
    ctx.close()

    # ── PR-04 : passer pendant le chargement (profils et 3D encore en route) ──
    ctx, pg = contexte(b)
    def api_lente(route):
        pg.wait_for_timeout(2500)
        try:
            route.continue_()
        except Exception:
            pass
    pg.route('**/api/jeux/lux-demasque', api_lente)
    demarrer(pg)
    pg.wait_for_selector('.ld-prologue-cinema')
    pg.click('.ld-prologue-passer')
    assert pg.locator('.ld-chargement').count() == 1 and etat(pg)['vu'] is True
    pg.wait_for_selector('#ld-selection-carte', timeout=15000)
    pg.wait_for_timeout(4500)                                       # la 3D éventuellement chargée ne s'attache pas
    e = etat(pg)
    assert e['ecran'] == 'selection' and e['canvas'] == 0 and pg.locator('.ld-prologue').count() == 0, e
    ok('PR-04 : « Passer l’intro » pendant le chargement → attente puis Cringr, une seule fois, aucune scène tardive')
    ctx.close()

    # ── API en panne pendant le prologue : jamais bloquant ───────────────────
    ctx, pg = contexte(b, reduced_motion='reduce')
    pg.route('**/api/jeux/lux-demasque', lambda r: r.fulfill(status=500, body='{}'))
    demarrer(pg)
    pg.wait_for_selector('.ld-prologue-messages')
    assert pg.inner_text('#ld-prologue-notif-texte') == 'De nouveaux profils t’attendent ♥'
    pg.click('.ld-prologue-ouvrir')
    pg.wait_for_selector('.ld-selection-reessayer')
    ok('Profils indisponibles : notification générique, « Ouvrir Cringr » → message d’erreur et « Réessayer »')
    ctx.close()

    # ── PR-11 : catalogue partiel (1 profil, 0 profil) et profil résolu ───────
    for garder, attendu in ((1, '1 profil à découvrir ♥'), (0, 'Aucun profil pour le moment')):
        ctx, pg = contexte(b, reduced_motion='reduce')
        def partiel(route, garder):
            r = route.fetch()
            data = r.json()
            c = data['contenus']
            c['dossiers'] = c['dossiers'][:garder]
            c['dossiersRediges'] = []
            c['affaires'] = []
            route.fulfill(response=r, body=json.dumps(data))
        pg.route('**/api/jeux/lux-demasque', lambda route, *_, g=garder: partiel(route, g))
        demarrer(pg)
        pg.wait_for_function("document.getElementById('ld-prologue-notif-texte') && !document.getElementById('ld-prologue-notif-texte').textContent.startsWith('De nouveaux')")
        assert pg.inner_text('#ld-prologue-notif-texte') == attendu
        pg.click('.ld-prologue-ouvrir')
        pg.wait_for_selector('#ld-selection-carte' if garder else '.ld-chargement')
        ctx.close()
    ctx, pg = contexte(b, reduced_motion='reduce')
    pg.goto(URL); pg.wait_for_selector('#today')
    pg.evaluate("ldEcrire('luxDemasqueResolus', ['MILO_001']); ouvrirJeux()")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('.ld-prologue-messages')
    pg.wait_for_function("!document.getElementById('ld-prologue-notif-texte').textContent.startsWith('De nouveaux')")
    vers_cringr(pg, '.ld-prologue-ouvrir')
    assert pg.evaluate('ld.selection.index') == 1 and pg.evaluate("ldLire('luxDemasqueResolus', [])") == ['MILO_001']
    ok('PR-11 : 1 profil / 0 profil → notification exacte ; Milo résolu → même premier profil (Noah) qu’hors prologue')
    ctx.close()

    # ── PR-08 / 09 : son coupé, mouvement réduit, clavier ─────────────────────
    ctx, pg = contexte(b, reduced_motion='reduce')
    pg.goto(URL); pg.wait_for_selector('#today')
    pg.evaluate("ldEcrire('luxDemasqueSon', false); ouvrirJeux()")
    pg.evaluate("""() => { window.osc115 = 0; const ref = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function () { osc115++; return ref.apply(this, arguments); }; }""")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('.ld-prologue-messages')                  # aucune cinématique imposée
    assert pg.locator('#ld-prologue-scene').count() == 0 and etat(pg)['canvas'] == 0
    anim = pg.evaluate("getComputedStyle(document.querySelector('.ld-bulle-moi')).animationName")
    assert anim == 'none', anim
    assert pg.evaluate("document.activeElement.classList.contains('ld-prologue-ouvrir')")
    pg.keyboard.press('Enter')
    pg.wait_for_selector('#ld-selection-carte')
    assert pg.evaluate('osc115') == 0 and pg.evaluate('LuxDemasqueSon.pisteEnCours()') is None
    ok('PR-08/09 : mouvement réduit → messages directs sans animation ; Entrée ouvre Cringr ; son coupé = ni bruitage ni musique')
    ctx.close()

    # ── PR-10 : tailles mobiles et PC ─────────────────────────────────────────
    for largeur, hauteur in ((320, 600), (360, 740), (393, 852), (430, 932), (768, 1024), (1440, 900)):
        ctx, pg = contexte(b, largeur, hauteur)
        demarrer(pg)
        pg.wait_for_selector('.ld-prologue-cinema')
        for phase in ('cinema', 'messages'):
            if phase == 'messages':
                pg.wait_for_selector('.ld-prologue-messages', timeout=60000)
            m = pg.evaluate("""() => { const r = s => document.querySelector(s).getBoundingClientRect();
              const logo = r('.ld-top-selection .ld-logo'), pro = r('.ld-prologue');
              return {ov: document.documentElement.scrollWidth - innerWidth, passer: r('.ld-prologue-passer').bottom,
                cta: document.querySelector('.ld-prologue-ouvrir') ? r('.ld-prologue-ouvrir').bottom : 0,
                largeur: pro.width, centre: Math.abs(logo.left + logo.width / 2 - innerWidth / 2)}; }""")
            assert m['ov'] <= 1 and m['passer'] <= hauteur and m['cta'] <= hauteur, (largeur, phase, m)
            assert m['largeur'] <= 420 and m['centre'] <= 1, (largeur, phase, m)
            capture(pg, f'pr10-{largeur}x{hauteur}-{phase}')
        assert not pg.erreurs, pg.erreurs
        ctx.close()
    ok('PR-10 : 320×600 → 1440×900 : zéro débordement, CTA visibles, prologue ≤ 420 px dans l’enveloppe, titre centré')
    b.close()
