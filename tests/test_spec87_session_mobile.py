"""SPEC 87 — S'entraîner sur téléphone : question, correction et action principale visibles.

Mesure les positions RÉELLES dans Chromium (pas un faux DOM), à 320, 360, 390 et 430 px.
Le clavier est simulé en réduisant la hauteur visible de 42 % après avoir touché le champ :
c'est la même information (visualViewport) que reçoit l'app sur Android. Le vrai clavier
Samsung reste à contrôler à la main.

python3 tests/test_spec87_session_mobile.py   (serveur LUX_TESTS=1 sur le port 3456)
"""
from playwright.sync_api import sync_playwright
from helpers import ok, URL

TAILLES = [(320, 700), (360, 740), (390, 844), (430, 932)]
CLAVIER = .42

# Un élément est « visible » s'il est entier entre le bas de l'en-tête collant
# (quand il est affiché) et le bas de la zone visible au-dessus du clavier.
JS_POSITION = """sel => {
  const vv = window.visualViewport;
  const bas = vv ? vv.offsetTop + vv.height : innerHeight;
  const tete = document.querySelector('#view-session .lecon-header');
  const rt = tete.getBoundingClientRect();
  const haut = rt.height > 0 ? Math.max(0, rt.bottom) : (vv ? vv.offsetTop : 0);
  const el = document.querySelector(sel);
  if (!el || el.offsetParent === null) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, h: r.height, visible: r.top >= haut - 1 && r.bottom <= bas + 1 };
}"""


def ouvrir_question(pg, lecon_id, type_, qid):
    pg.evaluate("""([lid, type, qid]) => {
      const q = lecons.find(l => l.id === lid)[type].find(x => x.id === qid);
      session = { mode: 'review', questions: [{ leconId: lid, type, qid, q }], index: 0, score: 0,
                  answered: false, essais: 0, options: {} };
      showView('view-session'); renderSessionQ(); window.scrollTo(0, 0);
    }""", [lecon_id, type_, qid])
    pg.wait_for_timeout(200)


def pos(pg, sel):
    return pg.evaluate(JS_POSITION, sel)


def visibles(pg, taille, scenario, *selecteurs):
    for sel in selecteurs:
        p = pos(pg, sel)
        assert p is not None, f'{taille} {scenario} : {sel} absent'
        assert p['visible'], f'{taille} {scenario} : {sel} hors de la zone visible {p}'


def clavier(pg, w, h, ouvert):
    pg.set_viewport_size({'width': w, 'height': h - round(h * CLAVIER) if ouvert else h})
    pg.wait_for_timeout(400)


def titre(pg):
    # SPEC 94 : titre visible du bandeau commun ; sans titre (choix juste), la phrase du lecteur d'écran.
    return pg.evaluate("(document.querySelector('#session-feedback .fb-titre') || document.querySelector('#session-feedback .sr-only') || {}).textContent || '(pas de titre)'")


def choisir(pg, juste):
    bonne = pg.evaluate("(s => s.type === 'trous' ? s.q.trou : s.q.reponse)(session.questions[0])")
    boutons = pg.locator('#session-choices .choice')
    for i in range(boutons.count()):
        if (boutons.nth(i).inner_text() == bonne) == juste:
            boutons.nth(i).click()
            break
    pg.wait_for_timeout(700)  # cadrage en défilement doux


with sync_playwright() as p:
    navigateur = p.chromium.launch()
    for (w, h) in TAILLES:
        t = f'{w}x{h}'
        ctx = navigateur.new_context(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.route('**/*gstatic*/**', lambda r: r.abort())
        pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        pg.goto(URL)
        pg.wait_for_selector('#today')

        # Écriture « Je travaille. » (leçon 17), comme sur les captures Samsung.
        ouvrir_question(pg, 17, 'ecriture', 2011)
        visibles(pg, t, 'écriture, clavier fermé', '#session-word', '#session-input-btn')
        pg.click('#session-input')
        clavier(pg, w, h, True)
        visibles(pg, t, 'écriture, clavier ouvert', '#session-word', '#session-input', '#session-input-btn')

        # Premier essai faux : compact, sans réponse ni Suivante, nouvelle saisie possible.
        pg.fill('#session-input', 'Ech schaffe')
        pg.click('#session-input-btn')
        clavier(pg, w, h, False)
        fb = pos(pg, '#session-feedback')
        assert fb['h'] <= 130, f'{t} : 1er essai trop haut ({fb["h"]:.0f} px)'
        assert pg.locator('#session-suivante').count() == 0
        assert 'Ech schaffen' not in pg.inner_text('#session-feedback')
        fond = pg.evaluate("getComputedStyle(document.querySelector('#session-feedback .pc-attention, #session-feedback .fb-attention')).backgroundColor")
        assert fond in ('rgba(0, 0, 0, 0)', 'transparent'), f'{t} : second encadré au 1er essai ({fond})'
        visibles(pg, t, '1er essai faux', '#session-word', '#session-feedback', '#session-input-btn')
        assert pg.evaluate("session.essais") == 1
        pg.click('#session-input')
        clavier(pg, w, h, True)
        visibles(pg, t, '1er essai faux, clavier rouvert', '#session-word', '#session-feedback', '#session-input-btn')
        assert titre(pg) == 'Pas encore · réessaie', titre(pg)

        # Deuxième essai faux : correction complète, bonne réponse, Suivante entière.
        pg.fill('#session-input', 'Ech schaffen net')
        pg.click('#session-input-btn')
        clavier(pg, w, h, False)
        pg.wait_for_timeout(400)
        assert titre(pg) == 'Pas encore', titre(pg)
        assert 'Réponse attendue : Ech schaffen.' in pg.inner_text('#session-feedback')  # SPEC 94 : même libellé qu'en Leçon
        couleur = pg.evaluate("getComputedStyle(document.querySelector('#session-feedback .fb-reponse b')).color")
        assert couleur != pg.evaluate("getComputedStyle(document.querySelector('#session-feedback .fb-titre')).color"), \
            'la bonne réponse ne doit pas être rouge'
        assert pg.locator('#session-suivante').count() == 1
        visibles(pg, t, '2 essais faux', '#session-suivante')

        # Deuxième essai juste.
        ouvrir_question(pg, 17, 'ecriture', 2011)
        pg.fill('#session-input', 'Ech schaffe')
        pg.click('#session-input-btn')
        pg.fill('#session-input', 'Ech schaffen')
        pg.click('#session-input-btn')
        pg.wait_for_timeout(500)
        assert titre(pg) == 'Juste, au 2e essai', titre(pg)
        visibles(pg, t, '2e essai juste', '#session-suivante')

        # Phrase longue, clavier ouvert.
        ouvrir_question(pg, 15, 'ecriture', 2027)
        pg.click('#session-input')
        clavier(pg, w, h, True)
        visibles(pg, t, 'phrase longue, clavier ouvert', '#session-word', '#session-input-btn')
        clavier(pg, w, h, False)

        # Trous à 4 propositions (leçon 5) : « Il y a douze chaises » et explication longue.
        for qid in (2010, 2023):
            ouvrir_question(pg, 5, 'trous', qid)
            choisir(pg, False)
            assert titre(pg) == 'Pas encore'
            assert pg.evaluate("document.getElementById('session-blank').style.color") == 'var(--correct)'
            assert pg.locator('#session-choices .choice.wrong').count() == 1
            assert pg.locator('#session-choices .choice.correct').count() == 1
            visibles(pg, t, f'trou {qid} faux', '#session-feedback', '#session-suivante')
        ouvrir_question(pg, 5, 'trous', 2010)
        choisir(pg, True)
        assert titre(pg).startswith('Juste !'), titre(pg)  # SPEC 94 : annoncé, pas affiché
        visibles(pg, t, 'trou juste', '#session-suivante')

        # Quiz à 4 propositions avec point d'attention, réponse fausse.
        lid, qid = pg.evaluate("""(() => { const l = lecons.find(l => (l.quiz || []).some(q => (q.distracteurs || []).length === 3 && q.attention));
          return [l.id, l.quiz.find(q => (q.distracteurs || []).length === 3 && q.attention).id]; })()""")
        ouvrir_question(pg, lid, 'quiz', qid)
        choisir(pg, False)
        visibles(pg, t, 'quiz faux', '#session-feedback', '#session-suivante')

        assert not erreurs, erreurs
        ok(f'{t} : question, correction et action principale visibles dans les 11 scénarios')
        ctx.close()
    navigateur.close()
