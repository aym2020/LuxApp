"""Lux Démasqué V1.1 — smoke UI des panneaux sur petits Android.

Cette recette complète les parcours fonctionnels existants : elle vérifie la présence,
la lisibilité minimale et l'absence de débordement horizontal des principales vues.
Elle ne valide PAS le rendu esthétique, la qualité des animations ni le GPU Samsung.
"""
from playwright.sync_api import sync_playwright
from helpers import ok, URL

FORMATS = [(320, 640), (360, 740), (393, 852), (430, 932)]


def sans_debordement(pg, ecran):
    dimensions = pg.evaluate("""() => ({
        largeurPage: document.documentElement.scrollWidth,
        largeurFenetre: innerWidth,
        hauteurFenetre: innerHeight,
        calques: [...document.querySelectorAll('#ld-jeu .ld-calque')].map(c => {
          const r = c.querySelector('.ld-fenetre').getBoundingClientRect();
          return { gauche: r.left, droite: r.right, bas: r.bottom };
        })
    })""")
    assert dimensions['largeurPage'] <= dimensions['largeurFenetre'] + 1, (ecran, dimensions)
    for c in dimensions['calques']:
        assert c['gauche'] >= -1 and c['droite'] <= dimensions['largeurFenetre'] + 1, (ecran, c)


def zone_tactile(pg, selecteur, ecran):
    r = pg.locator(selecteur).first.bounding_box()
    assert r and r['width'] >= 44 and r['height'] >= 44, (ecran, selecteur, r)


with sync_playwright() as p:
    b = p.chromium.launch()
    for largeur, hauteur in FORMATS:
        ctx = b.new_context(viewport={'width': largeur, 'height': hauteur},
                            is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.route('**/*gstatic*/**', lambda r: r.abort())
        pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        pg.goto(URL)
        pg.wait_for_selector('#today')

        pg.evaluate('ouvrirLuxDemasque()')
        pg.wait_for_selector('.ld-rencontre')
        sans_debordement(pg, 'rencontre')
        zone_tactile(pg, '.ld-rencontre .ld-btn-or', 'rencontre')
        # LD-002.01 : la fiche et les règles restent disponibles, sans tronquer
        # le bouton principal aux deux formats ciblés pour la revue produit.
        assert pg.locator('.ld-rencontre .ld-fiche-kicker').count() == 1
        assert pg.locator('.ld-rencontre .ld-briefing').count() == 1
        if largeur in (360, 393):
            bas_cta = pg.locator('.ld-rencontre .ld-btn-or').bounding_box()
            assert bas_cta['y'] + bas_cta['height'] <= hauteur - 10, (
                'CTA hors champ', largeur, hauteur, bas_cta)
        # Une introduction peut défiler naturellement ; le démarrage doit rester atteignable.
        pg.click('.ld-rencontre .ld-btn-or')
        pg.wait_for_selector('#ld-declaration')
        sans_debordement(pg, 'déposition')
        for cible in ('#ld-preciser', '#ld-objecter', '.ld-top .ld-icone-btn',
                      '.ld-hud .ld-outil'):
            zone_tactile(pg, cible, 'déposition')

        pg.evaluate("ldReseaux('pro')")
        pg.wait_for_selector('#ld-reseaux .ld-vignette')
        sans_debordement(pg, 'réseaux')
        zone_tactile(pg, '#ld-reseaux .ld-onglet', 'réseaux')
        pg.click('#ld-reseaux .ld-vignette >> nth=0')
        pg.wait_for_selector('#ld-piece')
        sans_debordement(pg, 'pièce')
        assert pg.locator('#ld-piece .ld-transcription').count() == 1
        zone_tactile(pg, '#ld-piece .ld-fermer', 'pièce')

        pg.evaluate("ldFermerToutesFenetres(); ldCarnet()")
        pg.wait_for_selector('#ld-carnet')
        sans_debordement(pg, 'carnet')
        zone_tactile(pg, '#ld-carnet .ld-fermer', 'carnet')

        pg.evaluate("ldFermerToutesFenetres(); ldObjection()")
        pg.wait_for_selector('#ld-objection')
        sans_debordement(pg, 'objection')
        zone_tactile(pg, '#ld-objection .ld-fermer', 'objection')

        pg.evaluate("ldFermerToutesFenetres(); ldMenu()")
        pg.wait_for_selector('#ld-menu')
        sans_debordement(pg, 'pause')
        zone_tactile(pg, '#ld-menu .ld-fermer', 'pause')
        pg.evaluate("ldFermerToutesFenetres(); ldConclure(true)")
        pg.wait_for_selector('.ld-bilan')
        sans_debordement(pg, 'bilan')
        zone_tactile(pg, '.ld-bilan .ld-btn-or', 'bilan')

        assert not erreurs, (largeur, hauteur, erreurs)
        ok(f'{largeur}x{hauteur} : rencontre, déposition, réseaux, pièce, carnet, objection, pause, bilan — aucun débordement horizontal')
        ctx.close()
    b.close()
