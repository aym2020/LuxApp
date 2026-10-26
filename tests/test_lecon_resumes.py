"""Régression mobile : « Revoir » ≠ « Voir toute la leçon » et résumés lisibles.

Reproduit la capture Android : les lignes « Toute la leçon » / « Bilan »
étaient rendues comme des boutons HTML non stylés (blanc/noir, texte collé).
Test navigateur à 320 / 390 / 430 px ; la progression doit rester intacte.
"""
import os
from playwright.sync_api import sync_playwright
from helpers import URL, ok, masquer_regles_vies

OUT = os.path.join(os.path.dirname(__file__), 'captures')
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    for width in (320, 390, 430):
        context = browser.new_context(viewport={'width': width, 'height': 844},
                                      is_mobile=True, has_touch=True)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.route('**/*gstatic*/**', lambda route: route.abort())
        page.route('**/fonts.googleapis.com/**', lambda route: route.abort())
        page.goto(URL)
        page.wait_for_selector('#today')
        masquer_regles_vies(page)

        # Leçon 20 du parcours A1.2 (identifiant interne 27).
        # Aucune réponse simulée n'altère les stats de questions existantes.
        page.evaluate("""() => {
            choisirNiveau('A1.2');
            saveUnitBest(27, 1, 95);
            saveUnitBest(27, 2, 95);
            saveUnitBest(27, 3, 88);
            marquerIntroMissionVue(27);
            marquerMissionReussie(27, 2);
            cheminLeconOuverte = 27;
            goLessons();
            renderLessons();
        }""")
        assert page.inner_text('#chemin-lecon-27 .btn-jaune').strip() == 'Revoir'
        avant = page.evaluate('JSON.stringify([getProgress(), getStatsStore(), getWrongStore()])')

        # Revoir : ouverture de la révision filtrée à cette leçon.
        page.locator('#chemin-lecon-27 .btn-jaune').click()
        assert page.locator('#view-review-setup.active').count() == 1
        assert page.locator('#rs-lecons input:checked').count() == 1
        assert page.locator('#rs-lecons input:checked').input_value() == '27'

        # Voir toute : écran détaillé des unités, mission et deux synthèses.
        page.evaluate("goLessons(); cheminLeconOuverte = 27; renderLessons();")
        page.locator('#chemin-lecon-27 .lien-or').click()
        assert page.locator('#view-plecon.active').count() == 1
        assert page.locator('#pl-unite-1').count() == 1
        assert page.locator('#pl-unite-2').count() == 1
        assert page.locator('#pl-unite-3').count() == 1

        items = page.evaluate("""() => [...document.querySelectorAll('#pl-units .pl-resume')].map(el => {
            const s = getComputedStyle(el), r = el.getBoundingClientRect();
            return { text: el.innerText, display: s.display, color: s.color,
                     background: s.backgroundColor, width: r.width, height: r.height,
                     left: r.left, right: r.right, textAlign: s.textAlign,
                     borderTop: s.borderTopWidth };
        })""")
        assert len(items) == 2, items
        assert 'TOUTE LA LEÇON' in items[0]['text'] and 'Bilan de la leçon' in items[1]['text'], items
        for item in items:
            assert item['display'] == 'flex', item
            assert item['height'] >= 70, item
            assert item['width'] >= width * .70, item
            assert item['left'] >= 0 and item['right'] <= width + 1, item
            assert item['color'] != 'rgb(0, 0, 0)', item
            assert item['textAlign'] == 'left', item
        assert page.evaluate('document.documentElement.scrollWidth') <= width, width
        assert page.evaluate('JSON.stringify([getProgress(), getStatsStore(), getWrongStore()])') == avant

        if width == 390:
            page.locator('#pl-bilan').scroll_into_view_if_needed()
            page.screenshot(path=os.path.join(OUT, 'fix-resumes-390.png'), full_page=True)
        assert not errors, errors
        ok('résumés lisibles + actions distinctes sans perte de progression : %d px' % width)
        context.close()
    browser.close()
