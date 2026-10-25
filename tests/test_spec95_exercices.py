"""SPEC 95 — écran d'exercice stable : contenu seul défilant, correction légère, pied d'action fixe.

Vrai moteur dans Chromium (pas de DOM simulé), Leçon et S'entraîner.
Critères : G01–G19, G21–G23 (G20 et G24 : test_spec94_feedback.py et test/exercices-etats-v21.test.cjs).
Le clavier Android est simulé comme dans test_spec87_session_mobile.py : on réduit la hauteur
visible après avoir touché le champ (c'est l'information que reçoit l'app). Le vrai clavier
Samsung reste à contrôler à la main.

python3 tests/test_spec95_exercices.py   (serveur LUX_TESTS=1 sur le port 3456)
"""
from playwright.sync_api import sync_playwright
from helpers import ok, URL, relancer

TOL = 2  # tolérance géométrique de la SPEC (px)

OUVRIR_ETAPE = """async ([lid, type]) => {
  const l = lecons.find(x => x.id === lid);
  const u = unitesCoeur(l).find(u => itemsUnite(l, type, u.id, 'coeur').length > 0);
  openParcoursLecon(l);
  await new Promise(r => setTimeout(r, 0));
  startEtapeSeule(u.id, type);
  await new Promise(r => setTimeout(r, 0));
}"""
ITEM = "(() => { const s = run.steps[run.stepIdx]; return trouverItem(pLecon, s.type, s.queue[0]); })()"

# Géométrie du pied, du bouton et de la zone qui défile, dans la vue active.
GEO = """() => {
  const vue = document.querySelector('.view.active');
  const dock = vue.querySelector('.exo-action-dock'), cta = dock.querySelector('.exo-cta');
  const zone = vue.querySelector('.exo-scroll');
  const r = e => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, bas: b.bottom }; };
  const vv = window.visualViewport;
  return {
    vue: vue.id, dock: r(dock), cta: cta.hidden ? null : r(cta), ctaTexte: cta.hidden ? null : cta.textContent,
    nbPrimaires: dock.querySelectorAll('.exo-cta').length,
    secondaires: [...dock.querySelectorAll('.exo-secondaire')].map(b => ({ id: b.id, h: b.getBoundingClientRect().height, w: b.getBoundingClientRect().width })),
    zone: r(zone), zoneScroll: zone.scrollHeight - zone.clientHeight,
    pageScroll: document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight,
    largeurPage: document.documentElement.scrollWidth, largeurVue: document.documentElement.clientWidth,
    basVisible: vv ? vv.offsetTop + vv.height : innerHeight,
    boutonsHorsPied: [...vue.querySelectorAll('.exo-scroll button')]
      .filter(b => b.offsetParent !== null && !b.matches('.choice, .bouton-ecouter, .mc-tuile, .mc-aide-ouvrir, summary, .aide-vocab *'))
      .map(b => b.id || b.className)
  };
}"""


def ouvrir(nav, w=390, h=844):
    ctx = nav.new_context(viewport={'width': w, 'height': h}, is_mobile=w < 700, has_touch=w < 700)
    pg = ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    return ctx, pg, erreurs


def etape(pg, lid, type_):
    relancer(pg)  # écran neuf (rouvrir une leçon par-dessus une autre recule l'historique)
    pg.evaluate(OUVRIR_ETAPE, [lid, type_])
    if pg.evaluate("document.getElementById('view-msintro').classList.contains('active')"):
        pg.click('#msi-content .pc-btn.primary')
        pg.wait_for_timeout(100)
    assert pg.evaluate('run && run.steps[run.stepIdx].type') == type_, type_


def session(pg, lid, type_, qid, mode='review', total=1):
    pg.evaluate("""([lid, type, qid, mode, total]) => {
      const q = lecons.find(l => l.id === lid)[type].find(x => x.id === qid);
      const questions = Array.from({ length: total }, () => ({ leconId: lid, type, qid, q }));
      demarrerSession(mode, 'ENTRAÎNEMENT', questions, {});
    }""", [lid, type_, qid, mode, total])
    pg.wait_for_timeout(100)


def choisir(pg, sel, bonne, juste):
    for b in pg.locator(sel + ' .choice').all():
        if (b.inner_text() == bonne) == juste:
            b.click()
            pg.wait_for_timeout(400)
            return
    raise AssertionError('choix introuvable')


def geo(pg):
    return pg.evaluate(GEO)


def meme_place(a, b, nom):
    for k in ('x', 'y', 'w', 'h', 'bas'):
        assert abs(a[k] - b[k]) <= TOL, (nom, k, a, b)


def base_ok(g, nom):
    """Invariants de tous les états : un seul bouton primaire, dans le pied, entier à l'écran."""
    assert g['nbPrimaires'] == 1, (nom, 'boutons primaires', g['nbPrimaires'])
    assert not g['boutonsHorsPied'], (nom, 'bouton d\'action dans le contenu', g['boutonsHorsPied'])
    assert g['pageScroll'] <= 1, (nom, 'la page entière défile', g['pageScroll'])
    assert g['largeurPage'] <= g['largeurVue'] + 1, (nom, 'défilement horizontal')
    assert g['dock']['bas'] <= g['basVisible'] + 1, (nom, 'pied hors de l\'écran', g)
    if g['cta']:
        assert g['cta']['h'] >= 48 and g['cta']['bas'] <= g['basVisible'] + 1, (nom, 'bouton coupé', g['cta'])


with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx, pg, erreurs = ouvrir(nav)

    ids = pg.evaluate("""() => {
      const trouver = (type, avecNote) => { for (const l of lecons) for (const x of (l[type] || []))
        if (!!(x.attention || (type === 'trous' && x.note)) === avecNote && (type !== 'quiz' || x.distracteurs.length === 3)) return [l.id, x.id];
        return null; };
      return { quizNote: trouver('quiz', true), quizSans: trouver('quiz', false),
               trouNote: trouver('trous', true), trouSans: trouver('trous', false) };
    }""")

    # ── G01–G04, G18 : S'entraîner, Quiz avec / sans note, juste / faux : même place du bouton ──
    reference = None
    for cle, juste, nom in (('quizSans', True, 'G01'), ('quizNote', True, 'G02'),
                            ('quizSans', False, 'G03'), ('quizNote', False, 'G04')):
        lid, qid = ids[cle]
        session(pg, lid, 'quiz', qid, total=2)
        avant = geo(pg)
        assert avant['cta'] is None, (nom, 'faux bouton avant le choix')
        bonne = pg.evaluate("session.questions[0].q.reponse")
        choisir(pg, '#session-choices', bonne, juste)
        g = geo(pg)
        base_ok(g, nom)
        assert g['ctaTexte'] == 'Suivante →', (nom, g['ctaTexte'])
        meme_place(avant['dock'], g['dock'], nom + ' pied avant/après le choix')  # place réservée (G18)
        assert pg.locator('#session-choices .choice:visible').count() == (1 if juste else 2), nom
        fond = pg.evaluate("getComputedStyle(document.getElementById('session-feedback')).backgroundColor")
        assert fond in ('rgba(0, 0, 0, 0)', 'transparent'), (nom, 'correction colorée', fond)
        if 'Note' in cle:
            assert 'À retenir' in pg.inner_text('#session-feedback'), nom
        if reference is None:
            reference = g['cta']
        meme_place(reference, g['cta'], nom + ' bouton identique à G01')
    ok('G01–G04, G18 S\'entraîner : Quiz juste/faux, avec/sans note — bouton du pied à la même place (±2 px), place réservée avant le choix')

    # ── G05 : Trous long, avec note ──
    lid, qid = pg.evaluate("""() => { let m = null; for (const l of lecons) for (const t of (l.trous || [])) {
      const n = (t.avant || '').length + (t.apres || '').length + (t.note || t.attention || '').length;
      if (!m || n > m[0]) m = [n, l.id, t.id]; } return [m[1], m[2]]; }""")
    for juste in (True, False):
        session(pg, lid, 'trous', qid)
        choisir(pg, '#session-choices', pg.evaluate("session.questions[0].q.trou"), juste)
        g = geo(pg)
        base_ok(g, 'G05')
        meme_place(reference, g['cta'], 'G05 trou long')
    ok('G05 Trous long : trou et choix conservés, pas de débordement, bouton ancré')

    # ── G06 : Leçon, mêmes pied / bouton / classes que S'entraîner ──
    styles = []
    for type_ in ('quiz', 'trous'):
        for juste in (True, False):
            etape(pg, 2, type_)
            it = pg.evaluate(ITEM)
            choisir(pg, '#pc-choix', it['reponse'] if type_ == 'quiz' else it['trou'], juste)
            g = geo(pg)
            base_ok(g, 'G06 ' + type_)
            assert g['ctaTexte'] == 'Continuer'
            meme_place(reference, g['cta'], 'G06 Leçon / S\'entraîner')
            styles.append(pg.evaluate("""() => { const c = document.querySelector('#pc-action-dock .exo-cta'), s = getComputedStyle(c);
              return [c.className, s.backgroundColor, s.borderRadius, s.font, s.color, s.height]; }"""))
    session(pg, ids['quizSans'][0], 'quiz', ids['quizSans'][1])
    choisir(pg, '#session-choices', pg.evaluate("session.questions[0].q.reponse"), True)
    styles.append(pg.evaluate("""() => { const c = document.querySelector('#session-action-dock .exo-cta'), s = getComputedStyle(c);
      return [c.className, s.backgroundColor, s.borderRadius, s.font, s.color, s.height]; }"""))
    assert all(s == styles[0] for s in styles), styles
    ok('G06 Leçon : même pied, même bouton (classe, couleurs, police, hauteur) et même place qu\'en S\'entraîner')

    # ── G07–G11, G19 : Écriture Leçon ──
    etape(pg, 2, 'ecriture')
    g0 = geo(pg)
    base_ok(g0, 'G07')
    assert pg.locator('#pc-action-dock #pc-ecr-valider').inner_text() == 'Valider'
    assert pg.locator('#pc-body button:not(.bouton-ecouter), #pc-feedback button:not(.bouton-ecouter)').count() == 0
    noeud = pg.evaluate("window.__cta = document.querySelector('#pc-action-dock .exo-cta'), true")
    pg.fill('#pc-ecr-input', 'zzz reponse manifestement fausse')
    pg.click('#pc-ecr-valider')
    g1 = geo(pg)
    base_ok(g1, 'G08')
    assert g1['ctaTexte'] == 'Réessayer' and pg.evaluate("!document.getElementById('pc-ecr-input').disabled")
    meme_place(g0['cta'], g1['cta'], 'G08 Valider → Réessayer')
    assert pg.evaluate("document.querySelector('#pc-action-dock .exo-cta') === window.__cta"), 'G08 : le bouton a été recréé'
    lu = pg.evaluate(ITEM)['lu']
    pg.fill('#pc-ecr-input', lu)
    # G19 : double appui sur Réessayer = une seule validation, la correction reste affichée
    pg.dblclick('#pc-ecr-valider')
    pg.wait_for_timeout(200)
    assert pg.evaluate('pAttente') and pg.evaluate(ITEM)['lu'] == lu, 'G19 : le 2e appui a sauté la correction'
    g2 = geo(pg)
    base_ok(g2, 'G10')
    assert g2['ctaTexte'] == 'Continuer' and 'Juste, au 2e essai' in pg.inner_text('#pc-feedback')
    meme_place(g0['cta'], g2['cta'], 'G10 Réessayer → Continuer')
    ok('G07/G08/G10/G19 Écriture Leçon : Valider → Réessayer → Continuer, même nœud, même place ; double appui sans saut')

    etape(pg, 2, 'ecriture')
    pg.fill('#pc-ecr-input', 'zzz reponse manifestement fausse')
    pg.click('#pc-ecr-valider')
    pg.fill('#pc-ecr-input', 'zzz encore une reponse fausse')
    pg.click('#pc-ecr-valider')
    g = geo(pg)
    base_ok(g, 'G11')
    assert g['ctaTexte'] == 'Continuer' and 'Réponse attendue' in pg.inner_text('#pc-feedback')
    assert pg.evaluate("document.getElementById('pc-ecr-input').disabled"), 'G11 : 3e tentative possible'
    ok('G11 Écriture Leçon 2e faux : réponse attendue, plus de saisie, Continuer dans le pied')

    # G09 : coquille gratuite → « Corriger ma saisie » dans le pied
    etape(pg, 2, 'ecriture')
    coquille = pg.evaluate("""() => {
      const trouver = lu => { for (let i = 1; i < lu.length - 2; i++) {
        if (!/[a-zäëéè]/i.test(lu[i]) || !/[a-zäëéè]/i.test(lu[i + 1]) || lu[i] === lu[i + 1]) continue;
        const essai = lu.slice(0, i) + lu[i + 1] + lu[i] + lu.slice(i + 2);
        if (analyserReponse(essai, lu).correctionGratuiteAutorisee) return essai; } return null; };
      const s = run.steps[run.stepIdx];
      const id = s.queue.find(x => trouver(trouverItem(pLecon, 'ecriture', x).lu));
      s.queue = [id].concat(s.queue.filter(x => x !== id)); renderItem();
      return trouver(trouverItem(pLecon, 'ecriture', id).lu); }""")
    pg.fill('#pc-ecr-input', coquille)
    pg.click('#pc-ecr-valider')
    g = geo(pg)
    base_ok(g, 'G09')
    assert g['ctaTexte'] == 'Corriger ma saisie' and pg.evaluate('ecrEssais') == 0, g['ctaTexte']
    ok('G09 coquille gratuite : « Corriger ma saisie » dans le pied, aucune erreur comptée')

    # ── G12, G13 : Écriture S'entraîner, deux essais puis examen ──
    lid, qid = 17, 2011
    session(pg, lid, 'ecriture', qid, total=2)
    s0 = geo(pg)
    assert s0['ctaTexte'] == 'Valider'
    pg.fill('#session-input', 'Ech schaffe')
    pg.click('#session-input-btn')
    pg.wait_for_timeout(300)
    s1 = geo(pg)
    base_ok(s1, 'G12 1er faux')
    assert s1['ctaTexte'] == 'Réessayer' and pg.evaluate('session.essais') == 1
    pg.fill('#session-input', 'Ech schaffen net')
    pg.click('#session-input-btn')
    pg.wait_for_timeout(300)
    s2 = geo(pg)
    base_ok(s2, 'G12 2e faux')
    assert s2['ctaTexte'] == 'Suivante →' and pg.evaluate('session.score') == 0
    meme_place(s0['cta'], s1['cta'], 'G12 Valider → Réessayer')
    meme_place(s0['cta'], s2['cta'], 'G12 → Suivante')
    session(pg, lid, 'ecriture', qid, mode='exam')
    pg.fill('#session-input', 'Ech schaffe')
    pg.click('#session-input-btn')
    pg.wait_for_timeout(300)
    assert geo(pg)['ctaTexte'] == 'Voir le score →' and pg.evaluate('session.answered'), 'G13'
    ok('G12/G13 S\'entraîner : Valider → Réessayer → Suivante à la même place ; examen sans 2e essai')

    # ── G21 : fin de session, le pied des questions disparaît ──
    pg.click('#session-suivante')
    pg.wait_for_timeout(200)
    assert pg.evaluate("document.getElementById('session-action-dock').classList.contains('hidden')")
    assert pg.locator('#session-result').is_visible() and pg.locator('#session-actions button').count() >= 1
    ok('G21 score final : pied des questions masqué, boutons du résultat conservés')

    # ── G14, G15 : Mot caché ──
    etape(pg, 2, 'flashcards')
    if pg.locator('#mc-btn-reconstruire').count():
        assert pg.locator('#pc-action-dock #mc-btn-reconstruire').count() == 1, 'découverte : bouton hors du pied'
        pg.click('#mc-btn-reconstruire')
    g = geo(pg)
    base_ok(g, 'G14')
    assert [s['id'] for s in g['secondaires']] == ['mc-btn-effacer', 'mc-btn-indice'] and g['ctaTexte'] == 'Valider', g
    for n in (1, 2, 3):
        pg.evaluate("""() => { const libres = mcCasesLettres().libres; const a = mcLettreTuile(mc.cases[libres[0]].ch);
          let k = mc.tuiles.findIndex(t => !t.retiree && mcLettreTuile(t.ch) !== a); mcPoserLettre(k); mcValider(); }""")
        gn = geo(pg)
        base_ok(gn, 'G14 essai %d' % n)
        meme_place(g['cta'], gn['cta'], 'G14 Valider après l\'essai %d' % n)
        assert not pg.evaluate('pAttente') and not pg.evaluate('mc.revele'), 'G14 : révélation automatique'
    pg.evaluate("""() => { const pos = mcCasesLettres().libres, pris = new Set();
      mc.choix = pos.map(i => { const a = mcLettreTuile(mc.cases[i].ch);
        const k = mc.tuiles.findIndex((t, n) => !t.retiree && !pris.has(n) && mcLettreTuile(t.ch) === a); pris.add(k); return k; });
      mcSynchroniserChamp(); renderCases(); mcValider(); }""")
    g = geo(pg)
    base_ok(g, 'G15')
    assert g['ctaTexte'] == 'Continuer' and g['secondaires'] == [], g
    assert 'Score du mot' in pg.inner_text('#pc-feedback')
    ok('G14/G15 Mot caché : Effacer + Indice + Valider dans le pied (3 essais sans révélation), puis Continuer seul')

    assert not erreurs, erreurs
    ctx.close()

    # ── G14 à 320 px : cibles ≥ 44 px ; G17 : long contenu, texte 200 %, défilement unique ──
    ctx, pg, erreurs = ouvrir(nav, 320, 640)
    etape(pg, 2, 'flashcards')
    if pg.locator('#mc-btn-reconstruire').count():
        pg.click('#mc-btn-reconstruire')
    g = geo(pg)
    base_ok(g, 'G14 320')
    assert all(s['h'] >= 44 and s['w'] >= 44 for s in g['secondaires']), g['secondaires']
    lid, qid = 3, 2012  # Écriture à la consigne la plus longue
    session(pg, lid, 'ecriture', qid)
    pg.evaluate("document.documentElement.style.fontSize = '200%'")
    pg.fill('#session-input', 'zzz faux')
    pg.click('#session-input-btn')
    pg.fill('#session-input', 'zzz encore faux')
    pg.click('#session-input-btn')
    pg.wait_for_timeout(300)
    g = geo(pg)
    base_ok(g, 'G17')
    fin = pg.evaluate("""() => { const z = document.getElementById('session-scroll'); z.scrollTop = z.scrollHeight;
      const f = document.getElementById('session-feedback').getBoundingClientRect();
      return { bas: f.bottom, pied: document.getElementById('session-action-dock').getBoundingClientRect().top }; }""")
    assert fin['bas'] <= fin['pied'] + 1, ('G17 : fin de la correction cachée sous le pied', fin)
    pg.evaluate("document.documentElement.style.fontSize = ''")
    ok('G14 320 px : Effacer / Indice ≥ 44 px ; G17 texte 200 % : un seul défilement, fin accessible, bouton entier')
    assert not erreurs, erreurs
    ctx.close()

    # ── G16 : clavier ouvert puis fermé (simulé) ──
    for (w, h) in ((360, 740), (390, 844)):
        ctx, pg, erreurs = ouvrir(nav, w, h)
        session(pg, 17, 'ecriture', 2011)
        ferme = geo(pg)
        pg.click('#session-input')
        pg.set_viewport_size({'width': w, 'height': h - round(h * .42)})
        pg.wait_for_timeout(450)
        g = geo(pg)
        assert pg.evaluate("document.body.classList.contains('clavier-actif')")
        base_ok(g, 'G16 clavier ouvert %d' % w)
        champ = pg.evaluate("(r => ({ haut: r.top, bas: r.bottom }))(document.getElementById('session-input').getBoundingClientRect())")
        assert champ['bas'] <= g['dock']['y'] + 1 and champ['haut'] >= g['zone']['y'] - 1, ('G16 champ caché', champ, g['dock'])
        pg.fill('#session-input', 'Ech schaffe')
        pg.click('#session-input-btn')  # 1er faux, clavier encore ouvert
        pg.wait_for_timeout(300)
        base_ok(geo(pg), 'G16 réessayer clavier')
        pg.evaluate("document.activeElement && document.activeElement.blur()")
        pg.set_viewport_size({'width': w, 'height': h})
        pg.wait_for_timeout(450)
        rouvert = geo(pg)
        meme_place(ferme['cta'], rouvert['cta'], 'G16 retour après fermeture du clavier')
        # Même chose en Leçon (Écriture)
        etape(pg, 2, 'ecriture')
        ferme = geo(pg)
        pg.click('#pc-ecr-input')
        pg.set_viewport_size({'width': w, 'height': h - round(h * .42)})
        pg.wait_for_timeout(450)
        g = geo(pg)
        base_ok(g, 'G16 Leçon clavier ouvert %d' % w)
        champ = pg.evaluate("(r => ({ haut: r.top, bas: r.bottom }))(document.getElementById('pc-ecr-input').getBoundingClientRect())")
        assert champ['bas'] <= g['dock']['y'] + 1 and champ['haut'] >= g['zone']['y'] - 1, ('G16 Leçon champ caché', champ, g['dock'])
        pg.fill('#pc-ecr-input', 'zzz faux')
        pg.click('#pc-ecr-valider')
        pg.wait_for_timeout(300)
        base_ok(geo(pg), 'G16 Leçon réessayer')
        pg.evaluate("document.activeElement && document.activeElement.blur()")
        pg.set_viewport_size({'width': w, 'height': h})
        pg.wait_for_timeout(450)
        meme_place(ferme['cta'], geo(pg)['cta'], 'G16 Leçon après fermeture du clavier')
        assert not erreurs, erreurs
        ctx.close()
    ok('G16 clavier simulé, Leçon et S\'entraîner : bouton juste au-dessus du clavier, champ visible, même place après fermeture')

    # ── G22 : écrans non concernés ; G23 : tailles et orientation ──
    ctx, pg, erreurs = ouvrir(nav, 390, 844)
    for vue in ('view-mission', 'view-dashboard', 'view-plus', 'view-examen'):
        assert not pg.evaluate("id => document.getElementById(id) ? document.getElementById(id).classList.contains('exo-shell') : false", vue), vue
    pg.evaluate("ouvrirPlus()")
    pg.wait_for_timeout(200)
    assert pg.evaluate("getComputedStyle(document.getElementById('view-plus')).height") != '844px' or \
        pg.evaluate("document.scrollingElement.scrollHeight >= innerHeight"), 'G22'
    ctx.close()
    for (w, h) in ((740, 360), (720, 900), (1024, 768), (1440, 900)):
        ctx, pg, erreurs = ouvrir(nav, w, h)
        session(pg, ids['quizNote'][0], 'quiz', ids['quizNote'][1])
        choisir(pg, '#session-choices', pg.evaluate("session.questions[0].q.reponse"), False)
        g = geo(pg)
        base_ok(g, 'G23 %dx%d' % (w, h))
        assert g['dock']['w'] <= 501, ('G23 pied trop large', g['dock'])
        assert not erreurs, erreurs
        ctx.close()
    ok('G22 missions / accueil / Plus / examen hors enveloppe ; G23 paysage court et 720–1440 px : pied ≤ 500 px, bouton visible')

    nav.close()
print('SPEC 95 : OK')
