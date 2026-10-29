"""SPEC 114 : hauteurs, lecture, actions, focus et overlays sur le vrai DOM.

Le texte agrandi est simulé par la taille racine ; ce n'est pas une recette
des réglages d'accessibilité Samsung. Le clavier réel reste à valider sur appareil.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
from helpers import URL, ok
from layout114_scenarios import VUES, AUTRES, preparer, ouvrir, mesurer


def controler(page, nom):
    m = mesurer(page, nom)
    assert m['overflow'] <= 1, (nom, 'débordement', m['overflow'])
    for sel in ['.view.active .exo-action-dock', '.view.active .cta-fixe',
                '.view.active .ex-footer', '.nav-bas:not(.hidden)']:
        for e in page.locator(sel).all():
            if not e.is_visible():
                continue
            r = e.bounding_box()
            assert r['y'] >= -1 and r['y']+r['height'] <= page.viewport_size['height']+1, (nom, sel, r)
    # Dernière réponse/ligne accessible dans son scroll, sans déplacer le dock.
    if nom in ('parcours', 'session'):
        dock = page.locator('.view.active .exo-action-dock')
        avant = dock.bounding_box()
        page.locator('.view.active .exo-scroll').evaluate('(e)=>e.scrollTop=e.scrollHeight')
        apres = dock.bounding_box()
        assert abs(avant['y']-apres['y']) <= 1, (nom, 'dock déplacé', avant, apres)
        assert page.evaluate('document.scrollingElement.scrollHeight<=innerHeight+1'), (nom, 'double scroll')
    return m


traces = []
phases = os.environ.get('LUX_ERGO_PHASES', 'hauteurs,texte,overlays').split(',')
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for w in ([390, 1440] if 'hauteurs' in phases else []):
        for h in [600, 900, 1080]:
            ctx = b.new_context(viewport={'width': w, 'height': h}, reduced_motion='reduce')
            pg = ctx.new_page(); preparer(pg, URL)
            for nom in list(VUES)+list(AUTRES):
                ouvrir(pg, nom, nom in AUTRES)
                traces.append(controler(pg, nom))
            ctx.close(); ok(f'SPEC114 hauteur {w}×{h} : 33 états et pieds accessibles')
    for w in ([320, 1440] if 'texte' in phases else []):
        for texte in [130, 200]:
            ctx = b.new_context(viewport={'width': w, 'height': 600}, reduced_motion='reduce')
            pg = ctx.new_page(); preparer(pg, URL)
            pg.evaluate('(n)=>document.documentElement.style.fontSize=n+"%"', texte)
            for nom in ['dashboard', 'plecon', 'parcours', 'session', 'mission', 'pfin',
                        'examen', 'examen-result', 'jeux', 'cours', 'scenario-mission']:
                ouvrir(pg, nom, nom in AUTRES)
                controler(pg, nom)
            ctx.close(); ok(f'SPEC114 texte racine {texte}% à {w}px : onze parcours sans débordement')
    for w in ([390, 720, 1440] if 'overlays' in phases else []):
        ctx = b.new_context(viewport={'width': w, 'height': 600}, reduced_motion='reduce')
        pg = ctx.new_page(); preparer(pg, URL)
        ouvrir(pg, 'plus')
        pg.evaluate('ouvrirNouveautes()')
        panneau = pg.locator('.panneau.nv21-panel')
        panneau.wait_for()
        r = panneau.bounding_box()
        assert r['width'] <= (640 if w >= 768 else 720)+1, (w, 'nouveautés', r)
        assert abs(r['x']+r['width']/2-w/2) <= 1, (w, 'nouveautés décentrées', r)
        pg.locator('.nv21-scroll').evaluate('(e)=>e.scrollTop=e.scrollHeight')
        pg.click('.nv21-back')
        pg.wait_for_function('!document.querySelector(".panneau.nv21-panel")')
        # Le dialogue natif de l'app conserve sa taille dédiée, et restitue le focus.
        pg.locator('.view.active button').first.focus()
        pg.evaluate('window.spec114Focus=document.activeElement;void confirmer({titre:"Conserver cette séance ?",texte:"La progression reste disponible."})')
        pg.locator('.dlg-carte').wait_for()
        r = pg.locator('.dlg-carte').bounding_box()
        assert r['width'] <= 400+1, (w, 'dialogue élargi', r)
        assert pg.locator('.dlg-ok').evaluate('(e)=>e===document.activeElement')
        pg.click('.dlg-annuler')
        assert pg.evaluate('document.activeElement===window.spec114Focus'), 'focus non restitué'
        # Expression écrite : le chemin réel partage le shell Examen, sans changer le moteur.
        ouvrir(pg, 'examens')
        pg.evaluate('expressionStart(examens.find(expressionEstSujet))')
        pg.locator('#xee-input').wait_for()
        pg.locator('#xee-input').fill('Moien, ech heeschen Alex.')
        controler(pg, 'expression-ecrite')
        if w >= 768:
            assert abs(pg.locator('.view.active').bounding_box()['width']-640) <= 2
        ctx.close(); ok(f'SPEC114 overlays/focus et expression écrite à {w}px')
    b.close()
sortie = Path('artifacts/spec-114'); sortie.mkdir(parents=True, exist_ok=True)
if traces:
    (sortie/'tests-hauteurs.json').write_text(json.dumps(traces, ensure_ascii=False, indent=2)+'\n')
