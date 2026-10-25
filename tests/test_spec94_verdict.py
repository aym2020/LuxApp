"""SPEC 94 — Verdict d'un Quiz ou d'un Trou, identique en Leçon et en S'entraîner.

Contrôle dans Chromium (vrai DOM, vrais styles) :
  - juste : une seule proposition visible, la bonne ;
  - faux  : deux propositions visibles, le choix fait (rouge, secousse) et la bonne ;
  - les lettres A/B/C/D ne sont pas renumérotées après le masquage ;
  - un seul son par réponse, montant ou descendant ;
  - sans mouvement (prefers-reduced-motion) : aucune secousse.

python3 tests/test_spec94_verdict.py   (serveur LUX_TESTS=1 sur le port 3456)
"""
from playwright.sync_api import sync_playwright
from helpers import ok, URL, item_courant, repondre

# Lettre affichée, visibilité et classes de chaque proposition.
JS_ETAT = """sel => [...document.querySelectorAll(sel + ' .choice')].map(b => ({
  texte: b.textContent,
  lettre: getComputedStyle(b, '::before').content.replace(/"/g, ''),
  visible: b.offsetParent !== null,
  correct: b.classList.contains('correct'),
  faux: b.classList.contains('wrong'),
  animation: getComputedStyle(b).animationName
}))"""

# Remplace le son par un compteur pour vérifier qu'il est joué une seule fois.
# Lot 2 : le son passe par SurvieFx.feedback('success' | 'finalFailure').
JS_ESPION_SON = "() => { window.__sons = []; SurvieFx.feedback = e => window.__sons.push(e === 'success'); }"


def lettres_avant(pg, sel):
    # Avant la réponse, la lettre vient du compteur CSS : A, B, C, D dans l'ordre affiché.
    return {e['texte']: 'ABCD'[i] for i, e in enumerate(pg.evaluate(JS_ETAT, sel))}


def cliquer(pg, sel, bonne, juste):
    boutons = pg.locator(sel + ' .choice')
    for i in range(boutons.count()):
        if (boutons.nth(i).inner_text() == bonne) == juste:
            boutons.nth(i).click()
            return
    raise AssertionError('proposition introuvable')


def verifier(pg, sel, bonne, juste, avant, nom, mouvement=True):
    etat = pg.evaluate(JS_ETAT, sel)
    visibles = [e for e in etat if e['visible']]
    assert len(etat) >= 2, f'{nom} : moins de deux propositions'
    if juste:
        assert len(visibles) == 1 and visibles[0]['texte'] == bonne and visibles[0]['correct'], (nom, etat)
    else:
        assert len(visibles) == 2, (nom, etat)
        juste_vis = [e for e in visibles if e['correct']]
        faux_vis = [e for e in visibles if e['faux']]
        assert len(juste_vis) == 1 and juste_vis[0]['texte'] == bonne, (nom, etat)
        assert len(faux_vis) == 1 and faux_vis[0]['texte'] != bonne, (nom, etat)
        attendu = 'secousse-choix' if mouvement else 'none'
        assert faux_vis[0]['animation'] == attendu, (nom, faux_vis[0]['animation'])
        assert juste_vis[0]['animation'] != 'secousse-choix', (nom, 'la bonne réponse ne doit pas trembler')
    for e in visibles:
        assert e['lettre'] == avant[e['texte']], f'{nom} : lettre renumérotée {e}'
    assert pg.evaluate('window.__sons') == [juste], (nom, pg.evaluate('window.__sons'))


def session(pg, lecon_id, type_, qid):
    pg.evaluate("""([lid, type, qid]) => {
      const q = lecons.find(l => l.id === lid)[type].find(x => x.id === qid);
      session = { mode: 'review', questions: [{ leconId: lid, type, qid, q }], index: 0, score: 0,
                  answered: false, essais: 0, options: {} };
      showView('view-session'); renderSessionQ(); window.scrollTo(0, 0);
    }""", [lecon_id, type_, qid])
    pg.evaluate(JS_ESPION_SON)
    return pg.evaluate("(s => s.type === 'trous' ? s.q.trou : s.q.reponse)(session.questions[0])")


def ouvrir_page(navigateur, mouvement_reduit=False):
    ctx = navigateur.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True,
                                 reduced_motion='reduce' if mouvement_reduit else 'no-preference')
    pg = ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    return ctx, pg, erreurs


with sync_playwright() as p:
    navigateur = p.chromium.launch()

    # ── S'entraîner : Trous et Quiz à 4 propositions, juste et faux ──
    ctx, pg, erreurs = ouvrir_page(navigateur)
    quiz_lid, quiz_qid = pg.evaluate("""(() => { const l = lecons.find(l => (l.quiz || []).some(q => (q.distracteurs || []).length === 3));
      return [l.id, l.quiz.find(q => (q.distracteurs || []).length === 3).id]; })()""")
    for (lid, type_, qid) in ((5, 'trous', 2010), (quiz_lid, 'quiz', quiz_qid)):
        for juste in (True, False):
            bonne = session(pg, lid, type_, qid)
            avant = lettres_avant(pg, '#session-choices')
            cliquer(pg, '#session-choices', bonne, juste)
            pg.wait_for_timeout(300)
            verifier(pg, '#session-choices', bonne, juste, avant, f'session {type_} {"juste" if juste else "faux"}')
            assert pg.locator('#session-suivante').count() == 1
            # Double appui : aucun second son, aucune seconde correction.
            pg.evaluate("document.querySelector('#session-choices .choice.correct').click()")
            assert pg.evaluate('window.__sons') == [juste]
    ok("S'entraîner : Trous et Quiz, juste = 1 choix, faux = 2 choix, lettres stables, un seul son")
    assert not erreurs, erreurs
    ctx.close()

    # ── Leçon : vrai parcours de la leçon 2, premier Quiz puis premier Trou ──
    ctx, pg, erreurs = ouvrir_page(navigateur)
    pg.evaluate('goLessons()')
    pg.click('.chemin-lecon:has-text("Identifier des objets")')
    pg.click('.pas.ouverte .lien-or')
    pg.click('.pl-unit:has-text("UNITÉ 1") button:has-text("Commencer")')
    pg.click('#msi-content .pc-btn.primary')
    pg.click('#pi-commencer')
    vus = {}
    tours = 0
    while len(vus) < 2 and tours < 80:
        tours += 1
        c = item_courant(pg)
        t = c['type']
        if t in ('quiz', 'trous') and t not in vus:
            juste = t == 'trous'  # un juste et un faux
            bonne = c['item']['reponse'] if t == 'quiz' else c['item']['trou']
            pg.evaluate(JS_ESPION_SON)
            avant = lettres_avant(pg, '#pc-choix')
            cliquer(pg, '#pc-choix', bonne, juste)
            pg.wait_for_timeout(300)
            verifier(pg, '#pc-choix', bonne, juste, avant, f'leçon {t}')
            assert pg.locator('#pc-continuer').is_visible()
            vus[t] = True
            pg.click('#pc-continuer')
        else:
            repondre(pg, juste=True)
    assert len(vus) == 2, f'Quiz et Trous non atteints : {vus}'
    ok('Leçon : Quiz faux (2 choix, secousse) et Trou juste (1 choix), même rendu qu\'en S\'entraîner')
    assert not erreurs, erreurs
    ctx.close()

    # ── Préférence « réduire les animations » : pas de secousse ──
    ctx, pg, erreurs = ouvrir_page(navigateur, mouvement_reduit=True)
    bonne = session(pg, 5, 'trous', 2010)
    avant = lettres_avant(pg, '#session-choices')
    cliquer(pg, '#session-choices', bonne, False)
    pg.wait_for_timeout(300)
    verifier(pg, '#session-choices', bonne, False, avant, 'mouvement réduit', mouvement=False)
    ok('mouvement réduit : aucune secousse, verdict toujours lisible')
    assert not erreurs, erreurs
    ctx.close()

    navigateur.close()
print('SPEC 94 : OK')
