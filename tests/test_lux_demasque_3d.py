"""SPEC 110 lot D2 — Lux Démasque : 3D partagée avec Lux Match, photos des preuves, réactions.
Un seul moteur (un WebGLRenderer) pour les deux jeux ; le prétendant seul au café ;
trois dossiers d'affilée sans personnage en double ; la scène se détache en quittant ;
images de preuves générées depuis la 3D avec leur transcription."""
from playwright.sync_api import sync_playwright
from helpers import ok, URL

with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_context(viewport={'width': 360, 'height': 740}, is_mobile=True, has_touch=True).new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort()); pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL); pg.wait_for_selector('#today')
    for tour in range(3):
        pg.evaluate("ouvrirLuxDemasque()")
        pg.wait_for_selector('.ld-rencontre')
        pg.wait_for_function("ld.preparation", timeout=30000)
        pg.evaluate("ld.preparation")
        images = pg.evaluate("Object.keys(ld.images).sort()")
        assert images == ['piece:milo:AMIS_LEA', 'piece:milo:PIX_CANAPE', 'piece:milo:PIX_KYOTO', 'piece:milo:PIX_PIXEL', 'piece:milo:PRO_EQUIPE', 'portrait-defaite:milo', 'portrait:milo'], images
        assert pg.locator('.ld-fiche .ld-image-prete').count() == 1
        pg.click('.ld-rencontre .ld-btn-or')
        pg.wait_for_selector('.ld-scene-3d', timeout=30000)
        diag = pg.evaluate("ld.rendu3d.diagnostic()")
        assert diag['date'] == 1 and diag['attache'] == 'date', diag   # Milo seul : aucun avatar joueur
        assert pg.locator('canvas').count() == 1
        if tour == 0:
            assert pg.evaluate("LuxMatch3D.partage().then(m => m === ld.rendu3d)")
            ok('images du dossier rendues depuis la 3D (portraits + 5 photos), instance 3D partagée avec Lux Match')
            # Une photo de preuve : image + transcription identique à la pièce.
            pg.evaluate("ldReseaux('pix')"); pg.click('#ld-reseaux .ld-vignette >> nth=0')
            pg.wait_for_selector('#ld-piece .ld-image-prete')
            assert 'Kyoto' in pg.inner_text('#ld-piece .ld-transcription')
            assert pg.get_attribute('#ld-piece .ld-visuel-photo', 'aria-label') == pg.inner_text('#ld-piece .ld-transcription')
            pg.evaluate("ldFermerToutesFenetres()")
            ok('photo de preuve zoomée : image 3D et transcription accessible identiques')
            # Objection ratée : sourire narquois + signe manga à côté de la tête, pas dessus.
            pg.evaluate("for (let i = 0; i < 6; i++) LuxDemasqueCore.allerA(ld.partie, i); LuxDemasqueCore.allerA(ld.partie, 3); ldMajDeposition()")
            pg.evaluate("ldPresenter('PIX_KYOTO')")
            pg.wait_for_selector('#ld-verdict')
            tete = pg.evaluate("ld.rendu3d.pointTete()")
            signe = pg.evaluate("(() => { const r = document.querySelector('#ld-emotion svg').getBoundingClientRect(); return { x: r.left / innerWidth, bas: r.bottom / innerHeight }; })()")
            assert signe['x'] >= tete['x'] - 0.02 and signe['bas'] <= tete['y'] + 0.02, (signe, tete)
            pg.click('#ld-verdict .ld-btn')
            ok('objection ratée : signe manga au-dessus de la tempe, visage dégagé')
        pg.evaluate("ldQuitter()")
        pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
        assert pg.locator('canvas').count() == 0
        assert pg.evaluate("ld.rendu3d.diagnostic().attache") is None
    ok('3 dossiers d’affilée : un seul personnage au café, canvas retiré en quittant')
    assert not erreurs, erreurs
    b.close()
