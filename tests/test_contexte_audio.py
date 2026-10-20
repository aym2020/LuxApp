"""SPEC 71 : prononciation en contexte et écran d'exemples.
Bouton menthe → bulle flottante (phrase LOD, expression en menthe, traduction) sans
changer la hauteur du cours ; lien « N exemples en contexte » → écran dédié ;
Retour du téléphone ferme la bulle, puis l'écran d'exemples, et le cours reste ouvert.
Les tables de sons sont simulées (les vrais fichiers viennent de lod.lu)."""
import json
from playwright.sync_api import sync_playwright
from helpers import ok, URL

CONTEXTE = {"Wéi geet et Iech?": {"son": "lod/MOIEN2.mp3", "phrase": "Bonjour, wéi geet et Iech?", "fr": "Bonjour, comment allez-vous ?"}}
PHRASES = {"Et freet mech.": "lod/MOIEN1.mp3", "Wéi heeschs du?": "lod/AN2.mp3"}

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True).new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/audio/lod-contexte.json', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(CONTEXTE)))
    pg.route('**/audio/lod-phrases.json', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(PHRASES)))
    # Sons Mia (exacts, prioritaires) désactivés : on teste ici le son en contexte.
    pg.route('**/audio/mia.json', lambda r: r.fulfill(status=200, content_type='application/json', body='{}'))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    pg.wait_for_function("lecons.length > 0 && Object.keys(sonsContexte).length > 0 && Object.keys(sonsPhrases).length > 0")
    pg.evaluate("() => { openParcoursLecon(lecons.find(l => l.id === 1)); ouvrirCours(null); }")
    pg.click('#cours-panel .cours75-onglet:has-text("Lexique")')  # SPEC 75 : le vocabulaire est dans l'onglet Lexique

    bouton = '#cours-panel .bouton-ecouter.contexte'
    pg.wait_for_selector(bouton)
    assert pg.locator(bouton).count() == 1 and pg.get_attribute(bouton, 'aria-expanded') == 'false'
    assert 'dans une phrase' in pg.get_attribute(bouton, 'aria-label')
    pg.evaluate("s => document.querySelector(s).scrollIntoView({block:'center'})", bouton)
    hauteur = pg.evaluate("() => document.querySelector('#cours-panel .cp-content').scrollHeight")
    pg.click(bouton)
    pg.wait_for_selector('.bulle-contexte')
    assert pg.evaluate("() => document.querySelector('#cours-panel .cp-content').scrollHeight") == hauteur
    assert pg.inner_text('.bulle-contexte strong') == 'wéi geet et Iech'
    assert 'comment allez-vous' in pg.inner_text('.bulle-fr')
    assert 'phrase entière' in pg.inner_text('.bulle-pied')
    assert pg.get_attribute(bouton, 'aria-expanded') == 'true'
    ok('bouton menthe : bulle flottante, expression surlignée, traduction, aucune ligne décalée')

    pg.click('.bulle-fermer')
    assert pg.locator('.bulle-contexte').count() == 0 and pg.get_attribute(bouton, 'aria-expanded') == 'false'
    pg.click(bouton)
    pg.wait_for_selector('.bulle-contexte')
    pg.go_back()
    pg.wait_for_function("!document.querySelector('.bulle-contexte')")
    assert pg.evaluate("!document.getElementById('cours-panel').classList.contains('hidden')")
    ok('bulle fermée par « Fermer » et par Retour ; le cours reste ouvert')

    # SPEC 75 : leçon migrée → pas de lien « N exemples » sous les blocs Lexique, un raccourci vers Phrases à la place.
    assert pg.locator('#cours-panel .lien-exemples').count() == 0
    assert pg.locator('#cours-panel .cours75-voir-phrases').count() == 1
    ok('cours migré (SPEC 75) : pas de lien d\'exemples dupliqué dans Lexique, raccourci « Voir les phrases »')

    # Écran d'exemples SPEC 71 (gardé pour les leçons non migrées) : rendu ancien des blocs de vocabulaire.
    pg.evaluate("""() => {
        const l = lecons.find(x => x.id === 1);
        const blocs = l.cours.filter(b => b.type === 'vocab').map(b => ({ type: 'vocab', titre: b.titre, items: b.items }));
        document.querySelector('#cours-panel .cp-content').insertAdjacentHTML('beforeend',
            '<div id="test-ancien">' + coursBlocsHtml(blocs, l.couleur) + '</div>');
    }""")
    liens = pg.locator('#test-ancien .lien-exemples')
    assert liens.count() == 2  # « Demander et répondre » (contexte) et « Se présenter » (2 phrases exactes)
    assert '2 exemples en contexte' in liens.nth(1).inner_text()
    liens.nth(1).click()
    pg.wait_for_selector('.exv')
    assert pg.locator('.exv-carte').count() == 2
    assert pg.locator('.exv-pastille.exacte').count() == 2
    assert 'Leçon 1' in pg.text_content('.exv-tag')
    pg.go_back()
    pg.wait_for_function("!document.querySelector('.exv')")
    assert pg.evaluate("!document.getElementById('cours-panel').classList.contains('hidden')")
    liens.nth(0).click()
    pg.wait_for_selector('.exv')
    assert pg.inner_text('.exv-carte strong') == 'wéi geet et Iech'
    pg.keyboard.press('Escape')
    pg.wait_for_function("!document.querySelector('.exv')")
    assert pg.evaluate("!document.getElementById('cours-panel').classList.contains('hidden')")
    ok('lien « N exemples en contexte » : écran dédié, fermé par Retour et Échap, le cours reste ouvert')

    assert not erreurs, erreurs
    b.close()
