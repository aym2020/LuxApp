"""Fonctions communes aux tests Playwright (parcours, retours, navigation).

Pour aller vite sans perdre en qualité :
- passer_delai() déclenche tout de suite le passage automatique après une
  bonne réponse de quiz / trou (même fonction reussir() que l'app, sans les
  0,9 à 1,5 s d'attente). Le vrai délai est vérifié une fois dans
  test_parcours.py (attendre_passage_auto) ;
- jamais d'attente fixe : on attend un état (wait_for_function).
"""
import os

URL = os.environ.get('LUX_URL', 'http://localhost:3456/')


def ok(msg):
    print('  ok  ', msg, flush=True)


def vue(pg):
    """Id de l'écran affiché."""
    return pg.evaluate("document.querySelector('.view.active').id")


def actif(pg, id_vue):
    return pg.evaluate("id => document.getElementById(id).classList.contains('active')", id_vue)


def ouvrir(p, mobile=False):
    """Navigateur au format téléphone, polices et Firebase coupés. Renvoie (navigateur, page, erreurs_js)."""
    b = p.chromium.launch()
    options = {'viewport': {'width': 390, 'height': 844}}
    if mobile:
        options.update(is_mobile=True, has_touch=True)
    pg = b.new_context(**options).new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    return b, pg, erreurs


def masquer_regles_vies(pg):
    pg.evaluate("(p => { p.guide = Object.assign(p.guide || {}, { viesMasquees: 1 }); saveProgress(p); })(getProgress())")


def item_courant(pg):
    return pg.evaluate("""() => {
        const s = run.steps[run.stepIdx];
        return { type: s.type, item: trouverItem(pLecon, s.type, s.queue[0]) };
    }""")


def passer_delai(pg):
    """Bonne réponse en quiz / trou : passe à la suite sans attendre le délai de l'app."""
    pg.evaluate("() => { if (pAttente && pSuite === null) { clearTimeout(pTimer); reussir(); } }")


def continuer_si_besoin(pg):
    if pg.evaluate('pAttente && pSuite !== null'):
        pg.click('#pc-continuer')


def repondre(pg, juste=True):
    """Répond à l'item affiché, juste ou faux (faux : un seul essai raté)."""
    c = item_courant(pg)
    t, it = c['type'], c['item']
    if t == 'flashcards':
        pg.locator('#mc-btn-reconstruire').count() and pg.click('#mc-btn-reconstruire')  # mot nouveau : découverte d'abord
        bon = pg.evaluate("id => motATaper(pLecon, trouverItem(pLecon, 'flashcards', id))", it['id'])
        pg.fill('#mc-input', bon if juste else 'zzz')
        pg.click('#mc-btn-valider')
        if juste:
            continuer_si_besoin(pg)
    elif t in ('quiz', 'trous'):
        bonne = it['reponse'] if t == 'quiz' else it['trou']
        boutons = pg.locator('#pc-choix .choice')
        for i in range(boutons.count()):
            if (boutons.nth(i).inner_text() == bonne) == juste:
                boutons.nth(i).click()
                break
        if juste:
            passer_delai(pg)
        else:
            continuer_si_besoin(pg)
    else:
        pg.fill('#pc-ecr-input', it['lu'] if juste else 'faux')
        pg.click('#pc-body .pc-btn.primary')
        continuer_si_besoin(pg)


def finir(pg, erreurs=0):
    """Termine la partie affichée ; les `erreurs` premiers quiz / trous sont ratés une fois."""
    n = 0
    while vue(pg) == 'view-parcours' and n < 400:
        n += 1
        choix = item_courant(pg)['type'] in ('quiz', 'trous')
        if choix and erreurs > 0:
            erreurs -= 1
            repondre(pg, juste=False)
        else:
            repondre(pg, juste=True)
    return n


def lecon_cadree(pg, lecon_id):
    """Spec 44 : après « Refaire mes erreurs », la leçon est seule dépliée et
    cadrée (entière si elle tient, sinon son début sous le haut de l'écran ;
    en bas de page, elle peut être plus bas). Renvoie les mesures."""
    r = pg.evaluate("""id => { const c = document.getElementById('chemin-lecon-' + id).getBoundingClientRect();
        return { vue: document.querySelector('.view.active').id, haut: c.top, bas: c.bottom, zone: basVisibleChemin(), y: scrollY,
                 max: document.documentElement.scrollHeight - innerHeight,
                 ouvertes: [...document.querySelectorAll('#lecon-list .ouverte')].map(e => e.id) }; }""", lecon_id)
    assert r['vue'] == 'view-lessons' and r['ouvertes'] == ['chemin-lecon-%d' % lecon_id], r
    tient = r['bas'] - r['haut'] <= r['zone'] - 12
    if tient:
        assert r['haut'] >= 11 and r['bas'] <= r['zone'] + 1, r
    else:
        assert abs(r['haut'] - 12) < 2 or (r['y'] >= r['max'] - 1 and r['haut'] >= 11), r
    return r


def relancer(pg):
    """Fermer puis rouvrir l'app (pas une simple actualisation, qui garde
    l'écran depuis la spec 44) : on repart de l'accueil."""
    pg.evaluate("""() => { window.removeEventListener('pagehide', sauverNavigation);
        sauverNavigation = function () {}; sessionStorage.removeItem('luxNavigation'); }""")
    pg.reload()
    pg.wait_for_function("typeof navigationRestauree !== 'undefined' && navigationRestauree === true")
