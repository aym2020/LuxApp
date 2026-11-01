"""SPEC 115 V2 — RED FLAG : écran d'accueil fixe avant Cringr (FIX-01 à FIX-10, Chromium).

À chaque entrée depuis Jeux : accueil statique (titre, héroïne en image, pitch, trois gestes,
« Commencer ») puis le sélecteur SPEC 113 inchangé. Aucune 3D, aucun minuteur, aucune mémoire
« vu une fois ». LD_CAPTURES=dossier : captures de l'accueil aux tailles testées.
"""
import os
from playwright.sync_api import sync_playwright
from helpers import URL, ok

CAPTURES = os.environ.get('LD_CAPTURES')
ETAT = """() => ({ ecran: document.getElementById('ld-jeu').dataset.ecran, partie: !!ld.partie,
  selection: !!ld.selection, canvas: document.querySelectorAll('canvas').length,
  vue: document.querySelector('.view.active').id, piste: LuxDemasqueSon.pisteEnCours() })"""


def contexte(b, largeur=393, hauteur=852, **options):
    mobile = largeur < 700
    ctx = b.new_context(viewport={'width': largeur, 'height': hauteur}, is_mobile=mobile, has_touch=mobile, **options)
    pg = ctx.new_page()
    pg.erreurs = []
    pg.on('pageerror', lambda e: pg.erreurs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    return ctx, pg


def entrer(pg, avant=''):
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.evaluate("localStorage.setItem('ldSwipeVu','1'); " + avant + " ouvrirJeux()")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('.ld-accueil')


def etat(pg):
    return pg.evaluate(ETAT)


def capture(pg, nom):
    if CAPTURES:
        os.makedirs(CAPTURES, exist_ok=True)
        pg.screenshot(path=os.path.join(CAPTURES, nom + '.png'), full_page=True)


with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])

    # ── FIX-01 : première entrée — contenu exact, image, aucune 3D ni musique ──
    ctx, pg = contexte(b)
    requetes3d = []   # l'accueil ne charge aucune 3D (Cringr, lui, en charge ensuite)
    pg.on('request', lambda r: requetes3d.append(r.url) if ('.glb' in r.url or 'lux-match-3d' in r.url) else None)
    entrer(pg)
    pg.evaluate("document.querySelector('.ld-accueil-visuel img').decode()")
    e = etat(pg)
    assert e['ecran'] == 'accueil' and not e['partie'] and not e['selection'] and e['canvas'] == 0 and e['piste'] is None, e
    assert ' '.join(pg.locator('.ld-accueil-titre').text_content().split()) == 'Ton prochain date sur Cringr.'
    assert pg.evaluate("getComputedStyle(document.querySelector('.ld-accueil-titre em')).color") == 'rgb(247, 106, 164)'
    assert pg.locator('.ld-accueil-pitch p').all_inner_texts() == [
        'Tu incarnes une femme qui cherche un date.',
        'Discute, trouve des preuves et démasque les mensonges.']
    etapes = pg.evaluate("[...document.querySelectorAll('.ld-accueil-etapes li')].map(li => li.querySelector('b').textContent + ' ' + li.lastChild.textContent)")
    assert etapes == ['Choisis un profil', 'Discute en LU', 'Démasque les mensonges'], etapes
    img = pg.evaluate("(() => { const i = document.querySelector('.ld-accueil-visuel img'); return [i.naturalWidth, i.alt]; })()")
    assert img[0] == 564 and 'femme' in img[1] and 'téléphone' in img[1], img
    assert pg.locator('.ld-accueil-titre span').all_inner_texts() == ['Ton prochain', 'date sur']
    assert pg.locator('.ld-accueil-tags').count() == 0  # V6 : aucune capsule redondante
    assert pg.get_by_role('button', name='Commencer').count() == 1
    for absent in ('Revoir', 'Passer', 'Ouvrir Cringr'):
        assert absent not in pg.inner_text('#ld-jeu'), absent
    assert pg.locator('.ld-accueil .ld-accueil-commencer').evaluate("e => getComputedStyle(e).backgroundColor") != 'rgba(0, 0, 0, 0)'
    pg.wait_for_timeout(600)
    assert not pg.erreurs and not requetes3d, (pg.erreurs, requetes3d)
    capture(pg, 'fix01-accueil-393x852')
    ok('FIX-01 : accueil fixe complet (titre, héroïne, pitch, Choisis → Discute → Démasque, Commencer), ni 3D ni musique')

    # ── FIX-03 / 09 : Commencer (double appui) → un seul sélecteur, même premier profil ──
    pg.evaluate("""() => { window.rendus = 0; window.ouvertures = 0; const r = ldRendreSelection, o = ldOuvrirSelection;
      ldRendreSelection = () => { rendus++; return r(); }; ldOuvrirSelection = (x) => { ouvertures++; return o(x); }; }""")
    pg.locator('.ld-accueil-commencer').dblclick()
    pg.wait_for_selector('#ld-selection-carte')
    pg.wait_for_timeout(500)
    e = etat(pg)
    assert pg.evaluate('[ouvertures, rendus]') == [1, 1] and e['ecran'] == 'selection' and not e['partie'], e
    assert pg.evaluate('ld.selection.index') == 0   # (le 2e appui tombe sur l'écran suivant : focus vérifié en FIX-08)
    pg.wait_for_function("LuxDemasqueSon.pisteEnCours() === 'enquete'", timeout=15000)
    assert pg.locator('.ld-dating-controls button').count() == 2   # croix + cœur (SPEC 113 / LD-048)
    ok('FIX-03 : « Commencer » ×2 → une seule ouverture et un seul rendu Cringr, premier profil, musique d’enquête')

    # ── FIX-02 / 04 : Retour → Jeux ; chaque entrée remontre l'accueil (clé V1 ignorée) ──
    pg.evaluate("history.back()")
    pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    e = etat(pg)
    assert not e['selection'] and e['canvas'] == 0 and e['piste'] is None, e
    pg.evaluate("ldEcrire('luxDemasquePrologueVuV1', true)")       # ancienne clé V1 : sans effet
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('.ld-accueil')
    pg.evaluate("history.back()")                                   # Retour depuis l'accueil
    pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('.ld-accueil')
    pg.click('.ld-top-selection [aria-label="Retour aux jeux"]')
    pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    ok('FIX-02/04 : Retour Android/navigateur et bouton ‹ → Jeux ; l’accueil revient à chaque entrée, clé V1 ignorée')

    # ── FIX-09 : partie complète puis nouvelle entrée ─────────────────────────
    pg.click('.ld-jouer-hub')
    pg.click('.ld-accueil-commencer')
    pg.wait_for_selector('#ld-selection-carte')
    graine = pg.evaluate("ld.selection.items.find(i => i.genere).graine")
    pg.locator('#ld-selection-carte .ld-image-prete').wait_for(timeout=40000)
    pg.click('.ld-dating-meet')
    pg.wait_for_selector('.ld-rencontre')
    assert pg.evaluate("ld.partie.dossier.id") == 'MILO_001'
    pg.evaluate("history.back()")
    pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    pg.reload()   # la navigation restaurée peut rouvrir Jeux plutôt que l'accueil de l'appli
    pg.wait_for_function("typeof ouvrirJeux === 'function' && !!document.querySelector('.view.active')")
    pg.evaluate("ouvrirJeux()")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('.ld-accueil')                             # après une partie et un redémarrage
    assert pg.evaluate("ldLire('luxDemasqueResolus', [])") == [] and pg.evaluate("ldLire('luxDemasqueRecord', 0)") == 0
    assert isinstance(graine, int) and not pg.erreurs, pg.erreurs
    ok('FIX-02/09 : Cringr → LIKE → rencontre Milo → retour → redémarrage : même accueil, sauvegardes intactes')
    ctx.close()

    # ── FIX-05 : image absente, API en erreur, stockage refusé ─────────────────
    ctx, pg = contexte(b, 360, 740)
    pg.route('**/art/redflag-hero-v6.svg*', lambda r: r.fulfill(status=404, body=''))
    pg.route('**/api/jeux/lux-demasque', lambda r: r.fulfill(status=500, body='{}'))
    entrer(pg)
    pg.wait_for_selector('.ld-accueil-sans-image')
    assert pg.locator('.ld-accueil-commencer').is_visible() and pg.inner_text('.ld-accueil-titre').startswith('Ton prochain date')
    capture(pg, 'fix05-sans-image')
    pg.click('.ld-accueil-commencer')
    pg.wait_for_selector('.ld-selection-reessayer')
    ok('FIX-05 : image 404 → repli CSS, texte et CTA intacts ; API en erreur → Cringr affiche « Réessayer »')
    ctx.close()

    ctx, pg = contexte(b, 360, 740)
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.evaluate("ouvrirJeux(); Object.defineProperty(window,'localStorage',{get(){throw new DOMException('refusé','SecurityError')}})")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('.ld-accueil')
    pg.click('.ld-accueil-commencer')
    pg.wait_for_selector('#ld-selection-carte')
    assert not pg.erreurs, pg.erreurs
    ok('FIX-05 : stockage refusé → accueil puis Cringr sans blocage')
    ctx.close()

    # ── FIX-08 : clavier, mouvement réduit, texte agrandi ─────────────────────
    ctx, pg = contexte(b, 393, 852, reduced_motion='reduce')
    entrer(pg)
    for _ in range(12):                                             # vraie navigation clavier (Tab)
        pg.keyboard.press('Tab')
        if pg.evaluate("document.activeElement.classList.contains('ld-accueil-commencer')"):
            break
    assert pg.evaluate("document.activeElement.classList.contains('ld-accueil-commencer')")
    assert pg.evaluate("getComputedStyle(document.activeElement).outlineStyle") != 'none'
    pg.keyboard.press('Enter')
    pg.wait_for_selector('#ld-selection-carte')
    assert pg.evaluate("document.activeElement.id") == 'ld-selection-carte'   # focus conservé dans Cringr
    pg.evaluate("history.back()")
    pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    for zoom in ('130%', '200%'):
        pg.click('.ld-jouer-hub')
        pg.wait_for_selector('.ld-accueil')
        pg.evaluate(f"document.documentElement.style.fontSize = '{zoom}'; document.body.style.zoom = '{zoom}'")
        m = pg.evaluate("""() => { const r = document.querySelector('.ld-accueil-commencer').getBoundingClientRect();
          return {ov: document.documentElement.scrollWidth - innerWidth, h: r.height}; }""")
        assert m['ov'] <= 1 and m['h'] >= 48, (zoom, m)
        pg.locator('.ld-accueil-commencer').scroll_into_view_if_needed()
        assert pg.locator('.ld-accueil-commencer').is_visible()
        pg.evaluate("document.documentElement.style.fontSize = ''; document.body.style.zoom = ''")
        pg.evaluate("history.back()")
        pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    ok('FIX-08 : Entrée au clavier → carte Cringr focalisée, focus visible, mouvement réduit, zoom 130 % et 200 % sans débordement, CTA atteignable')
    ctx.close()

    # ── FIX-06 / 07 : tailles mobiles et PC ───────────────────────────────────
    for largeur, hauteur in ((320, 600), (360, 740), (393, 852), (430, 932), (768, 1024), (1024, 768), (1440, 900)):
        ctx, pg = contexte(b, largeur, hauteur)
        entrer(pg)
        pg.evaluate("document.querySelector('.ld-accueil-visuel img').decode()")
        m = pg.evaluate("""() => { const r = s => document.querySelector(s).getBoundingClientRect();
          const cta = r('.ld-accueil-commencer'), logo = r('.ld-top-selection .ld-logo'), acc = r('.ld-accueil'), img = r('.ld-accueil-visuel');
          const petits = [...document.querySelectorAll('.ld-accueil *')].filter(e => e.children.length === 0 && e.textContent.trim())
            .map(e => parseFloat(getComputedStyle(e).fontSize));
          return {ov: document.documentElement.scrollWidth - innerWidth, ctaBas: cta.bottom, ctaH: cta.height,
            largeur: acc.width, centre: Math.abs(acc.left + acc.width / 2 - innerWidth / 2), logo: Math.abs(logo.left + logo.width / 2 - innerWidth / 2),
            imgH: img.height, police: Math.min(...petits), coupe: [...document.querySelectorAll('.ld-accueil-etapes span')].some(s => s.scrollWidth > s.clientWidth + 1)}; }""")
        assert m['ov'] <= 1 and m['ctaH'] >= 48 and m['largeur'] <= 560 and m['centre'] <= 1 and m['logo'] <= 1, (largeur, m)
        assert m['police'] >= 12 and m['imgH'] >= 150 and not m['coupe'], (largeur, m)
        if hauteur >= 740:
            assert m['ctaBas'] <= hauteur, (largeur, hauteur, m)        # CTA dans le premier écran
        else:
            pg.locator('.ld-accueil-commencer').scroll_into_view_if_needed()
            assert pg.locator('.ld-accueil-commencer').is_visible()      # 320×600 : court défilement accepté
        capture(pg, f'fix06-{largeur}x{hauteur}')
        assert not pg.erreurs, pg.erreurs
        ctx.close()
    ok('FIX-06/07 : 320×600 → 1440×900 : pas de débordement, CTA ≥ 48 px, contenu ≤ 560 px centré')

    # ── FIX-10 : Lux Match (réactivé pour le test) puis RED FLAG : pas de 3D résiduelle ──
    ctx, pg = contexte(b)
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.evaluate("JEUX_DISPONIBLES.luxMatch = true; ouvrirLuxMatch(); 0")
    pg.wait_for_selector('.lm-profil', timeout=40000)
    pg.evaluate("ouvrirJeux()")
    pg.click('.ld-jouer-hub')
    pg.wait_for_selector('.ld-accueil')
    assert etat(pg)['canvas'] == 0 and pg.evaluate("typeof window.LuxMatch3D === 'undefined' || !('prologue' in window.LuxMatch3D)")
    pg.click('.ld-accueil-commencer')
    pg.locator('#ld-selection-carte .ld-image-prete').wait_for(timeout=40000)
    pg.evaluate("ldQuitter(); JEUX_DISPONIBLES.luxMatch = false")
    assert not pg.erreurs, pg.erreurs
    ok('FIX-10 : Lux Match → RED FLAG : accueil sans canvas, portraits Cringr via le moteur 3D partagé')
    ctx.close()
    b.close()
