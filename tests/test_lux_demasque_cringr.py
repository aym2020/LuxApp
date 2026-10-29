"""SPEC 113 : RF-01 à RF-08, vrais gestes Chromium et cas limites de Cringr."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from helpers import URL, ok

ART = Path('artifacts/lux-demasque-selection')
ART.mkdir(parents=True, exist_ok=True)


def ouvrir(b, **options):
    ctx = b.new_context(viewport={'width': 360, 'height': 740}, is_mobile=True, has_touch=True, **options)
    pg = ctx.new_page()
    pg.erreurs = []
    pg.on('pageerror', lambda e: pg.erreurs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    return ctx, pg


def selection(pg):
    pg.evaluate('ldOuvrirSelection()')
    pg.wait_for_selector('#ld-selection-carte')
    pg.evaluate('document.fonts.ready')


def sauvegarde(pg):
    return pg.evaluate("JSON.stringify({p:getProgress(),r:ldLire('luxDemasqueResolus',[]),s:ldLire('luxDemasqueRecord',null)})")


def index(pg):
    return pg.evaluate('ld.selection.index')


def pointer(pg, type, x, y=100, id=1, primary=True):
    pg.locator('#ld-selection-carte').dispatch_event(type, {
        'pointerId': id, 'pointerType': 'touch', 'isPrimary': primary,
        'clientX': x, 'clientY': y, 'bubbles': True})


def swipe(pg, dx, dy=2, cancel=False):
    r = pg.locator('#ld-selection-carte').bounding_box()
    x, y = r['x'] + r['width']/2, r['y'] + 100
    cdp = pg.context.new_cdp_session(pg)
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
    for i in range(1, 7):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x+dx*i/6, 'y': y+dy*i/6}]})
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchCancel' if cancel else 'touchEnd', 'touchPoints': []})
    cdp.detach()


with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for w, h in ((320, 600), (360, 740), (393, 852), (430, 932)):
        ctx, pg = ouvrir(b)
        pg.set_viewport_size({'width': w, 'height': h})
        pg.evaluate("localStorage.setItem('ldSwipeVu','1')")
        selection(pg)
        mesures = pg.evaluate("""() => {
            const rect=s=>document.querySelector(s).getBoundingClientRect();
            const carte=rect('#ld-selection-carte'),infos=rect('.ld-selection-infos');
            const bio=document.querySelector('.ld-selection-description'),logo=rect('.ld-top-selection .ld-logo');
            return {overflow:document.documentElement.scrollWidth-innerWidth,
                bottom:rect('.ld-dating-meet').bottom,gap:carte.bottom-infos.bottom,
                nomPremier:rect('.ld-selection-infos h2').top<rect('.ld-selection-ville').top,
                taille:parseFloat(getComputedStyle(bio).fontSize),retro:getComputedStyle(bio).fontFamily.includes('VT323'),
                texte:bio.innerText.includes(ld.selection.items[0].npc.accrocheFr),coupe:bio.scrollHeight>bio.clientHeight+1,
                centre:Math.abs(logo.x+logo.width/2-innerWidth/2),
                cibles:[...document.querySelectorAll('.ld-dating-controls button')].map(e=>{
                    const r=e.getBoundingClientRect();return Math.min(r.width,r.height)})}; }""")
        assert mesures['overflow'] <= 1 and mesures['centre'] <= 1, mesures
        assert mesures['bottom'] <= h-8 and mesures['gap'] <= 3, mesures
        assert mesures['taille'] >= 22 and mesures['retro'] and mesures['texte'], mesures
        assert mesures['nomPremier'] and not mesures['coupe'] and min(mesures['cibles']) >= 48, mesures
        # Les quatre vrais profils, pas seulement la carte Milo : texte et cœur accessibles.
        for _ in range(4):
            assert pg.locator('.ld-selection-description').evaluate('e=>e.scrollHeight<=e.clientHeight+1')
            assert pg.locator('.ld-dating-meet').bounding_box()['y'] + 56 <= h-8
            pg.evaluate('ldSelectionChanger(1)')
        assert index(pg) == 0
        avant = sauvegarde(pg)
        for dx, dy, cancel in ((-40, 2, False), (-15, 110, False), (-110, 2, True)):
            swipe(pg, dx, dy, cancel)
            assert index(pg) == 0
        assert pg.locator('#ld-selection-carte').evaluate('e=>e.style.transform') == ''
        swipe(pg, -120)
        pg.wait_for_function('ld.selection && ld.selection.index===1')
        assert sauvegarde(pg) == avant and pg.evaluate('ld.partie') is None
        swipe(pg, 120)
        pg.wait_for_selector('.ld-rencontre')
        assert pg.evaluate('ld.partie.dossier.id') == 'NOAH_001'
        assert not pg.erreurs, pg.erreurs
        ok(f'RF-01/02/03/05 {w}x{h} : texte réel, cibles, gestes court/vertical/annulé, NOPE/LIKE')
        ctx.close()

    ctx, pg = ouvrir(b)
    selection(pg)
    avant = sauvegarde(pg)
    for dx in (-65, 65):
        pointer(pg, 'pointerdown', 150)
        pointer(pg, 'pointermove', 150+dx)
        assert pg.locator('#ld-selection-carte').evaluate("e=>getComputedStyle(e,'::after').content") == ('"NOPE"' if dx < 0 else '"LIKE"')
        pointer(pg, 'pointerup', 150+dx)
        assert index(pg) == 0 and pg.evaluate('ld.partie') is None
    pointer(pg, 'pointerdown', 150)
    pointer(pg, 'pointermove', 125)
    assert 0 < float(pg.locator('#ld-selection-carte').evaluate("e=>getComputedStyle(e,'::after').opacity")) < 1
    pointer(pg, 'lostpointercapture', 125)
    pointer(pg, 'pointerdown', 150)
    for type, x in (('pointerdown', 150), ('pointermove', 10), ('pointerup', 10)):
        pointer(pg, type, x, id=2, primary=False)
    pointer(pg, 'pointerup', 150)
    assert index(pg) == 0 and sauvegarde(pg) == avant
    pg.evaluate("""() => {window.ouvertures113=[];const ref=ouvrirLuxDemasque;
        ouvrirLuxDemasque=id=>{ouvertures113.push(id);return ref(id)};}""")
    pg.evaluate("""() => {const coeur=document.querySelector('.ld-dating-meet'),carte=document.getElementById('ld-selection-carte');
        const event=(type,x)=>carte.dispatchEvent(new PointerEvent(type,{pointerId:1,isPrimary:true,pointerType:'touch',clientX:x,clientY:100}));
        event('pointerdown',100);event('pointermove',210);event('pointerup',210);coeur.click();coeur.click();} """)
    pg.wait_for_selector('.ld-rencontre')
    assert pg.evaluate('ouvertures113') == ['MILO_001']
    ok('RF-04/05 : seuil strict 65, tampons progressifs, capture perdue, deuxième doigt et swipe + double cœur')

    selection(pg)
    graine = pg.evaluate('ld.selection.items[3].graine')
    pg.get_by_role('button', name='Passer au profil suivant').click()
    assert index(pg) == 1 and pg.locator('.ld-selection-passer').evaluate('e=>e===document.activeElement')
    pg.locator('#ld-selection-carte').focus()
    pg.keyboard.press('ArrowLeft')
    assert index(pg) == 2 and pg.locator('#ld-selection-carte').evaluate('e=>e===document.activeElement')
    assert pg.locator('#ld-selection-carte').evaluate('e=>getComputedStyle(e).outlineStyle') != 'none'
    pg.keyboard.press('ArrowLeft')
    assert index(pg) == 3 and pg.evaluate('ld.selection.items[3].graine') == graine
    pg.keyboard.press('ArrowLeft')
    assert index(pg) == 0
    r = pg.locator('#ld-selection-carte').bounding_box()
    pg.mouse.move(r['x']+180, r['y']+100); pg.mouse.down()
    pg.mouse.move(r['x']+65, r['y']+102, steps=6); pg.mouse.up()
    assert index(pg) == 1
    for touche in ('ArrowRight', 'Enter', 'Space'):
        pg.locator('#ld-selection-carte').focus(); pg.keyboard.press(touche)
        pg.wait_for_selector('.ld-rencontre'); selection(pg)
    pg.evaluate("ldEcrire('luxDemasqueResolus',['MILO_001'])")
    selection(pg)
    assert index(pg) == 1
    pg.evaluate('ldSelectionChanger(-1)')
    pg.get_by_role('button', name='Revoir le profil').click()
    pg.wait_for_selector('.ld-rencontre')
    assert pg.evaluate('ld.partie.dossier.id') == 'MILO_001'
    selection(pg); pg.evaluate('ldSelectionChanger(2)')
    graine = pg.evaluate('ld.selection.items[3].graine')
    pg.get_by_role('button', name='Découvrir le profil').click(); pg.wait_for_selector('.ld-rencontre')
    assert pg.evaluate('ld.partie.dossier.graine') == graine
    pg.evaluate('ldRejouer()'); pg.wait_for_selector('.ld-rencontre')
    assert pg.evaluate('ld.partie.dossier.graine') == graine
    assert pg.evaluate("ldLire('luxDemasqueResolus',[])") == ['MILO_001']
    ok('RF-06/07 : clavier, focus, souris, Passer, wrap, profil résolu et graine rejouable')

    pg.evaluate("""() => {window.contenus113=ld.donnees;ld.donnees={...ld.donnees,dossiers:[ld.donnees.dossiers[0]],dossiersRediges:[],affaires:[]};} """)
    selection(pg)
    pg.get_by_role('button', name='Passer au profil suivant').click()
    assert index(pg) == 0 and pg.evaluate('ld.selection.items.length') == 1
    pg.evaluate('ld.donnees={...ld.donnees,dossiers:[]};ldOuvrirSelection()')
    pg.get_by_role('status').filter(has_text='Aucun profil').wait_for()
    pg.evaluate('ld.donnees=contenus113'); selection(pg); pg.evaluate('ldSelectionChanger(2)')
    graine = pg.evaluate('ld.selection.items[3].graine')
    pg.evaluate("""() => {window.charger113=ldChargerDonnees;ldChargerDonnees=()=>new Promise((_,rejeter)=>window.echouer113=()=>rejeter(Error('test')));
        window.confirmation113=ldSelectionConfirmer();ldSelectionConfirmer();} """)
    n = pg.evaluate('ouvertures113.length')
    pg.evaluate('ldSelectionConfirmer();echouer113();confirmation113')
    pg.get_by_role('alert').wait_for()
    assert pg.evaluate('ouvertures113.length') == n and pg.evaluate('ld.selection.enCours') is False
    assert pg.evaluate('ld.selection.items[3].graine') == graine
    pg.evaluate('ldChargerDonnees=charger113')
    pg.get_by_role('button', name='Découvrir le profil').click(); pg.wait_for_selector('.ld-rencontre')
    assert pg.evaluate('ld.partie.dossier.graine') == graine
    selection(pg)
    pg.evaluate("""() => {ldChargerDonnees=()=>new Promise(resoudre=>window.finir113=()=>resoudre(ld.donnees));
        window.confirmation113=ldSelectionConfirmer();ldQuitter();finir113();} """)
    pg.evaluate('confirmation113')
    assert pg.evaluate('ld.partie') is None and pg.evaluate("document.querySelector('.view.active').id") == 'view-jeux'
    pg.evaluate('ldChargerDonnees=charger113'); selection(pg)
    avant = sauvegarde(pg); pg.reload()
    pg.wait_for_function('typeof navigationRestauree!=="undefined" && navigationRestauree')
    assert pg.evaluate('ld.partie') is None and sauvegarde(pg) == avant
    assert not pg.erreurs, pg.erreurs
    ctx.close()
    ok('RF-06/08 : 1/0 profil, échec et réessai, double validation pendant chargement, sortie et rechargement')

    ctx, pg = ouvrir(b)
    pg.evaluate("ldEcrire('luxDemasqueResolus',['MILO_001']);localStorage.removeItem('ldSwipeVu')")
    selection(pg)
    assert pg.locator('.ld-swipe-demo').count() == 1
    pg.wait_for_function("!document.querySelector('.ld-swipe-demo')")
    selection(pg)
    assert pg.locator('.ld-swipe-demo').count() == 0
    assert pg.evaluate("localStorage.getItem('ldSwipeVu')") == '1'
    ctx.close()
    ctx, pg = ouvrir(b, reduced_motion='reduce'); selection(pg)
    assert pg.locator('.ld-swipe-demo').count() == 0
    pointer(pg, 'pointerdown', 150); pointer(pg, 'pointermove', 175)
    assert 'rotate(0deg)' in pg.locator('#ld-selection-carte').evaluate('e=>e.style.transform')
    pointer(pg, 'pointercancel', 175)
    ctx.close()
    ctx, pg = ouvrir(b)
    # Un portrait lent n'immobilise pas les commandes ; un décor manquant garde la 3D.
    attentes = []
    pg.route('**/lux-match-3d.js*', lambda r: attentes.append(r))
    selection(pg)
    pg.get_by_role('button', name='Passer au profil suivant').click()
    assert index(pg) == 1 and pg.locator('.ld-selection-initiale').is_visible()
    for attente in attentes:
        attente.abort()
    pg.unroute('**/lux-match-3d.js*')
    source = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="4" height="4"%3E%3Crect width="4" height="4" fill="red"/%3E%3C/svg%3E'
    assert pg.evaluate("s=>ldComposerPhotoProfil(s,'/decor-inexistant-spec113.svg')", source) == source
    assert not pg.erreurs, pg.erreurs
    ctx.close()
    ctx, pg = ouvrir(b)
    pg.route('**/lux-match-3d.js*', lambda r: r.abort())
    pg.evaluate("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('refusé','SecurityError')}})")
    selection(pg)
    assert pg.locator('.ld-selection-initiale').is_visible()
    assert pg.locator('.ld-swipe-demo').count() == 0
    pg.get_by_role('button', name='Passer au profil suivant').click()
    assert index(pg) == 1 and not pg.erreurs, pg.erreurs
    ctx.close()
    ok('RF-08 : découverte unique même sur Noah, mouvement réduit, stockage et WebGL refusés')

    ctx, pg = ouvrir(b)
    pg.route('**/api/jeux/lux-demasque', lambda r: r.fulfill(status=503, body='indisponible'))
    pg.evaluate('ldOuvrirSelection()'); pg.get_by_role('alert').wait_for()
    pg.unroute('**/api/jeux/lux-demasque')
    pg.get_by_role('button', name='Réessayer', exact=True).click(); pg.wait_for_selector('#ld-selection-carte')
    pg.evaluate("ld.selection.items[0].npc.nom='Unprénomexceptionnellementlong';ld.selection.items[0].npc.accrocheFr='Une bio publique complète et lisible, même quand elle est longue. '.repeat(12);ldRendreSelection()")
    pg.add_style_tag(content='#ld-jeu .ld-selection-description{font-size:44px!important}#ld-jeu .ld-selection-ville{font-size:40px!important}#ld-jeu .ld-selection-infos h2{font-size:64px!important}')
    for w, h in ((320, 600), (740, 360), (393, 852)):
        pg.set_viewport_size({'width': w, 'height': h})
        pg.get_by_role('button', name='Voir le profil').scroll_into_view_if_needed()
        assert pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        assert pg.locator('.ld-selection-description').evaluate('e=>e.scrollHeight<=e.clientHeight+1')
        assert pg.locator('.ld-dating-meet').is_visible()
        pg.screenshot(path=str(ART / f'texte-long-200-{w}x{h}.png'), full_page=True)
    assert not pg.erreurs, pg.erreurs
    ctx.close(); b.close()
    ok('RF-01/08 : réseau/réessai, bio longue, texte 200 %, rotation sans coupure')
