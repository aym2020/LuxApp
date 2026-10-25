"""SPEC 94, lot 2 — correction commune et sons, Leçon et S'entraîner.
Mis à jour pour SPEC 95 : la correction est légère (pas de bandeau) et le bouton
est dans le pied d'action ; les assertions métier (sons, essais, examen, coquille,
réglage Sons) sont inchangées. La géométrie du pied : test_spec95_exercices.py.

Vrai moteur dans Chromium (pas de DOM simulé). Critères couverts : A01–A14, A16
(son coupé, réduction des animations), A15 en partie (320×640 et 390×844).
Les sons sont comptés en espionnant SurvieFx.feedback (l'appel réel continue).

python3 tests/test_spec94_feedback.py   (serveur LUX_TESTS=1 sur le port 3456)
"""
from playwright.sync_api import sync_playwright
from helpers import ok, URL, relancer

LECON = 2

ESPION = """() => {
  window.__sons = [];
  if (!SurvieFx.__original) SurvieFx.__original = SurvieFx.feedback;
  SurvieFx.feedback = e => { window.__sons.push(e); SurvieFx.__original(e); };
}"""

# Ouvre une étape de la leçon, comme l'outil de recette (startEtapeSeule).
OUVRIR_ETAPE = """async ([lid, type]) => {
  const l = lecons.find(x => x.id === lid);
  const u = unitesCoeur(l).find(u => itemsUnite(l, type, u.id, 'coeur').length > 0);
  openParcoursLecon(l);
  await new Promise(r => setTimeout(r, 0));
  startEtapeSeule(u.id, type);
  await new Promise(r => setTimeout(r, 0));
}"""

ITEM = "(() => { const s = run.steps[run.stepIdx]; return trouverItem(pLecon, s.type, s.queue[0]); })()"

# Style calculé de la correction et du bouton du pied (SPEC 95) : parité Leçon / S'entraîner.
STYLE = """sel => {
  const f = document.querySelector(sel), t = f.querySelector('.fb-titre');
  const c = f.closest('.exo-shell').querySelector('.exo-action-dock .exo-cta:not([hidden])');
  const s = getComputedStyle(f), sc = c ? getComputedStyle(c) : null;
  const vh = window.visualViewport ? window.visualViewport.height : innerHeight;
  return {
    classes: [...f.classList].sort().join(' '),
    boutonsDansCorrection: f.querySelectorAll('button:not(.bouton-ecouter)').length,
    enfants: [...f.children].map(e => e.className.split(' ').filter(x => x.startsWith('fb-') || x === 'sr-only').join('.')),
    fond: s.backgroundColor, haut: s.borderTopWidth + ' ' + s.borderTopColor,
    gauche: s.borderLeftWidth, bas: s.borderBottomWidth, rayon: s.borderTopLeftRadius,
    titre: t && t.offsetParent ? t.textContent : null,
    titreStyle: t ? getComputedStyle(t).color + ' ' + getComputedStyle(t).fontSize : null,
    cta: sc ? [sc.backgroundColor, sc.minHeight, c.textContent] : null,
    ctaDetail: sc ? [c.className, sc.padding, sc.transitionProperty, sc.borderRadius, sc.font, sc.color] : null,
    couleur: s.color,
    ctaBas: c ? c.getBoundingClientRect().bottom : null, vh,
    texteVisible: f.innerText, annonce: (f.querySelector('.sr-only') || {}).textContent || ''
  };
}"""


def ouvrir(navigateur, w=390, h=844, mouvement_reduit=False):
    ctx = navigateur.new_context(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True,
                                 reduced_motion='reduce' if mouvement_reduit else 'no-preference')
    pg = ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort())
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_selector('#today')
    return ctx, pg, erreurs


def etape(pg, type_):
    # Toujours depuis un écran neuf : rouvrir une leçon par-dessus une autre
    # fait reculer l'historique de la page et couperait le script.
    relancer(pg)
    pg.evaluate(OUVRIR_ETAPE, [LECON, type_])
    # 1re fois : l'introduction de la mission passe avant (SPEC 55), puis l'étape démarre.
    if pg.evaluate("document.getElementById('view-msintro').classList.contains('active')"):
        pg.click('#msi-content .pc-btn.primary')
        pg.wait_for_timeout(100)
    assert pg.evaluate('run && run.steps[run.stepIdx].type') == type_, type_
    pg.evaluate(ESPION)


def sons(pg):
    return pg.evaluate('window.__sons')


def visible_sans_annonce(st):
    """Texte visible du bandeau, sans la phrase réservée au lecteur d'écran."""
    return st['texteVisible'].replace(st['annonce'], '')


def cliquer_choix(pg, sel, bonne, juste):
    for b in pg.locator(sel + ' .choice').all():
        if (b.inner_text() == bonne) == juste:
            b.click()
            return b.inner_text()
    raise AssertionError('choix introuvable')


def session(pg, lid, type_, qid, mode='review'):
    pg.evaluate("""([lid, type, qid, mode]) => {
      const q = lecons.find(l => l.id === lid)[type].find(x => x.id === qid);
      session = { mode, questions: [{ leconId: lid, type, qid, q }], index: 0, score: 0,
                  answered: false, essais: 0, options: {} };
      showView('view-session'); renderSessionQ(); window.scrollTo(0, 0);
    }""", [lid, type_, qid, mode])
    pg.evaluate(ESPION)


def plat(st, nom):
    """SPEC 95 : correction légère — ni fond, ni bordure, ni bouton."""
    assert st['fond'] in ('rgba(0, 0, 0, 0)', 'transparent'), (nom, 'fond coloré', st['fond'])
    assert st['gauche'] == st['bas'] == '0px' and st['haut'].startswith('0px'), (nom, 'bordure de carte', st)
    assert st['boutonsDansCorrection'] == 0, (nom, 'bouton dans la correction')


with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx, pg, erreurs = ouvrir(nav)

    # ── A01–A05 : Quiz et Trous, Leçon puis S'entraîner ──
    styles = {}
    for type_ in ('quiz', 'trous'):
        for juste in (True, False):
            etape(pg, type_)
            it = pg.evaluate(ITEM)
            bonne = it['reponse'] if type_ == 'quiz' else it['trou']
            choisi = cliquer_choix(pg, '#pc-choix', bonne, juste)
            pg.wait_for_timeout(250)
            st = pg.evaluate(STYLE, '#pc-feedback')
            nom = f'Leçon {type_} {"juste" if juste else "faux"}'
            assert sons(pg) == ['success' if juste else 'finalFailure'], (nom, sons(pg))
            assert pg.locator('#pc-choix .choice:visible').count() == (1 if juste else 2), nom
            assert st['cta'] and st['cta'][2] == 'Continuer' and st['ctaBas'] <= st['vh'] + 1, (nom, st)
            if juste:
                assert st['titre'] is None, (nom, 'titre « Juste ! » visible', st['titre'])
                assert 'Juste' in st['annonce'] and bonne in st['annonce'], (nom, st['annonce'])
            else:
                plat(st, nom)
                # SPEC 95 : pas de titre visible ; les choix rouge et vert portent le verdict.
                assert st['titre'] is None, (nom, st['titre'])
                assert 'Bonne réponse' not in visible_sans_annonce(st), (nom, 'réponse répétée', st['texteVisible'])
                assert st['annonce'].startswith('Pas encore'), (nom, st['annonce'])
                assert choisi in st['annonce'] and bonne in st['annonce'], (nom, st['annonce'])
            # A05 : double appui sans second son ni seconde notation
            pg.evaluate("document.querySelector('#pc-choix .choice.correct').click()")
            assert len(sons(pg)) == 1, (nom, sons(pg))
            styles[('lecon', type_, juste)] = st
    ok('A01–A05 Leçon : Quiz/Trous juste = 1 choix, faux = 2 choix, correction légère sans titre ni bouton, 1 son')

    # S'entraîner : un Trou de la leçon 5 et le premier Quiz de la leçon 2
    quiz_id = pg.evaluate("lecons.find(l => l.id === %d).quiz[0].id" % LECON)
    trou_id = pg.evaluate("lecons.find(l => l.id === %d).trous[0].id" % LECON)
    for type_, qid in (('quiz', quiz_id), ('trous', trou_id)):
        for juste in (True, False):
            session(pg, LECON, type_, qid)
            bonne = pg.evaluate("(s => s.type === 'trous' ? s.q.trou : s.q.reponse)(session.questions[0])")
            choisi = cliquer_choix(pg, '#session-choices', bonne, juste)
            pg.wait_for_timeout(700)
            st = pg.evaluate(STYLE, '#session-feedback')
            nom = f'Session {type_} {"juste" if juste else "faux"}'
            assert sons(pg) == ['success' if juste else 'finalFailure'], (nom, sons(pg))
            assert st['cta'] and st['cta'][2] in ('Voir le score →', 'Suivante →'), (nom, st['cta'])
            assert pg.locator('#session-suivante').count() == 1, nom
            if juste:
                assert st['titre'] is None and 'Juste' in st['annonce'], (nom, st)
            else:
                plat(st, nom)
                assert st['titre'] is None and 'Bonne réponse' not in visible_sans_annonce(st), (nom, st)
                assert choisi in st['annonce'], nom
            styles[('session', type_, juste)] = st

    # A14 : mêmes classes, nœuds et styles entre Leçon et S'entraîner (à sens égal)
    for type_ in ('quiz', 'trous'):
        for juste in (True, False):
            a, b = styles[('lecon', type_, juste)], styles[('session', type_, juste)]
            for cle in ('classes', 'fond', 'haut', 'gauche', 'rayon', 'titreStyle', 'titre', 'couleur', 'ctaDetail'):
                assert a[cle] == b[cle], (type_, juste, cle, a[cle], b[cle])
            assert a['cta'][:2] == b['cta'][:2], (type_, juste, a['cta'], b['cta'])
            # Mêmes types de nœuds (la Leçon ajoute le rappel dans .fb-txt : détail métier)
            assert a['enfants'][0] == b['enfants'][0] == 'sr-only', (a['enfants'], b['enfants'])
            assert a['boutonsDansCorrection'] == b['boutonsDansCorrection'] == 0
    ok('A01–A05 + A14 S\'entraîner : même correction et même bouton du pied que la Leçon (classes, styles, CTA)')

    # ── A06–A08 : Mot caché ──
    # Repartir de l'accueil : ouvrir une leçon depuis l'écran S'entraîner fait
    # naviguer la page (historique), ce qui couperait le script de test.
    etape(pg, 'flashcards')
    pg.evaluate("document.getElementById('mc-btn-reconstruire') && document.getElementById('mc-btn-reconstruire').click()")
    pg.evaluate(ESPION)
    for n in (1, 2, 3, 4):
        pg.evaluate("""() => { const libres = mcCasesLettres().libres;
          const attendu = mcLettreTuile(mc.cases[libres[0]].ch);
          let k = mc.tuiles.findIndex(t => !t.retiree && mcLettreTuile(t.ch) !== attendu);
          if (k < 0) k = mc.tuiles.findIndex(t => !t.retiree);
          mcPoserLettre(k); mcValider(); }""")
        assert pg.evaluate('mc.essais') == n and not pg.evaluate('pAttente'), n
        assert sons(pg) == ['retry'] * n, (n, sons(pg))
        # « Voir la réponse » est dans la fenêtre d'aide : proposé (non masqué) dès le 3e essai
        assert pg.evaluate("!document.getElementById('mc-btn-voir').classList.contains('hidden')") == (n >= 3), (n, 'Voir la réponse')
        if n == 1:
            assert pg.locator('#mc-cases .mc-case.secousse').count() >= 1
            assert pg.locator('#mc-cases .mc-case.vert.secousse').count() == 0, 'une case verte tremble'
            err = pg.evaluate("(e => [getComputedStyle(e).borderTopWidth, getComputedStyle(e).borderLeftWidth, getComputedStyle(e).borderTopLeftRadius])(document.getElementById('mc-erreur'))")
            # SPEC 95 : diagnostic compact, simple trait rouge à gauche (pas de bandeau ni de carte)
            assert err == ['0px', '2px', '0px'], ('diagnostic Mot caché en carte', err)
    pg.wait_for_timeout(400)
    pg.evaluate('mcPoserLettre(0)')  # nouveau rendu des cases, plus tard : aucune nouvelle secousse
    assert pg.locator('#mc-cases .mc-case.secousse').count() == 0
    pg.evaluate("mcOuvrirAide(); document.getElementById('mc-btn-voir').click()")
    st = pg.evaluate(STYLE, '#pc-feedback')
    assert sons(pg) == ['retry'] * 4 + ['finalFailure'], sons(pg)
    assert pg.evaluate('mc.revele') and st['titre'] == 'Réponse dévoilée', st['titre']
    assert pg.evaluate("mcScore()") == 0
    ok('A06/A08 Mot caché : « retry » à chaque essai (1 à 4), aide dès le 3e sans fin imposée, dévoilement = « finalFailure »')

    etape(pg, 'flashcards')
    pg.evaluate("document.getElementById('mc-btn-reconstruire') && document.getElementById('mc-btn-reconstruire').click()")
    pg.evaluate(ESPION)
    pg.evaluate('mcIndice()')
    assert sons(pg) == [], ('un indice n\'est pas une erreur', sons(pg))
    pg.evaluate("""() => { const pos = mcCasesLettres().libres, pris = new Set();
      mc.choix = pos.map(i => { const a = mcLettreTuile(mc.cases[i].ch);
        const k = mc.tuiles.findIndex((t, n) => !t.retiree && !pris.has(n) && mcLettreTuile(t.ch) === a); pris.add(k); return k; });
      mcSynchroniserChamp(); renderCases(); mcValider(); }""")
    st = pg.evaluate(STYLE, '#pc-feedback')
    carte = pg.evaluate(ITEM)
    assert sons(pg) == ['success'], sons(pg)
    assert st['titre'] is None and 'Bien joué' in st['annonce'], st
    assert carte['fr'] in st['texteVisible'] and 'Score du mot' in st['texteVisible'], st['texteVisible']
    assert '100 %' not in st['texteVisible'], 'indice utilisé : score non parfait'
    ok('A07 Mot caché juste après indice : « success », pas de « Bien joué ! » visible, mot + traduction + score < 100 %')

    # ── A09–A12 : Écriture Leçon ──
    def ecrire(texte):
        pg.fill('#pc-ecr-input', texte)
        pg.evaluate('ecrValiderPc()')
        pg.wait_for_timeout(150)

    etape(pg, 'ecriture')
    lu = pg.evaluate(ITEM)['lu']
    ecrire('zzz reponse manifestement fausse')
    st = pg.evaluate(STYLE, '#pc-feedback')
    assert sons(pg) == ['retry'] and pg.evaluate('ecrEssais') == 1 and not pg.evaluate('pAttente')
    plat(st, 'Écriture 1er faux')
    assert st['titre'] == 'Pas encore · réessaie' and lu not in st['texteVisible'], st
    # SPEC 95 : le même bouton du pied (Valider) devient « Réessayer ».
    assert pg.locator('#pc-action-dock #pc-ecr-valider.exo-cta').inner_text() == 'Réessayer'
    assert pg.evaluate("!document.getElementById('pc-ecr-input').disabled")
    ecrire(lu)
    st = pg.evaluate(STYLE, '#pc-feedback')
    assert sons(pg) == ['retry', 'success'] and st['titre'] == 'Juste, au 2e essai', (sons(pg), st['titre'])
    assert 'reviendra' in st['texteVisible'] or 'à revoir' in st['texteVisible'], 'rappel perdu'
    ok('A09/A10 Écriture : 1er faux = « retry », même champ, Réessayer dans le pied ; 2e juste = « success » + rappel')

    etape(pg, 'ecriture')
    lu = pg.evaluate(ITEM)['lu']
    ecrire('zzz reponse manifestement fausse')
    ecrire('zzz encore une reponse fausse')
    st = pg.evaluate(STYLE, '#pc-feedback')
    assert sons(pg) == ['retry', 'finalFailure'], sons(pg)
    assert st['titre'] == 'Pas encore' and 'Réponse attendue' in st['texteVisible'] and lu in st['texteVisible'], st
    ok('A11 Écriture 2e faux : « finalFailure », réponse attendue affichée')

    # A12 : coquille gratuite. On cherche une inversion de deux lettres voisines
    # que le vrai analyseur (correction.js) classe en « coquille probable ».
    etape(pg, 'ecriture')
    # Si la phrase affichée n'en permet pas, on met en tête de l'étape une phrase qui en permet une.
    coquille = pg.evaluate("""() => {
      const trouver = lu => {
        for (let i = 1; i < lu.length - 2; i++) {
          if (!/[a-zäëéè]/i.test(lu[i]) || !/[a-zäëéè]/i.test(lu[i + 1]) || lu[i] === lu[i + 1]) continue;
          const essai = lu.slice(0, i) + lu[i + 1] + lu[i] + lu.slice(i + 2);
          if (analyserReponse(essai, lu).correctionGratuiteAutorisee) return essai;
        }
        return null;
      };
      const s = run.steps[run.stepIdx];
      const id = s.queue.find(x => trouver(trouverItem(pLecon, 'ecriture', x).lu));
      if (id === undefined) return null;
      s.queue = [id].concat(s.queue.filter(x => x !== id));
      renderItem();
      return trouver(trouverItem(pLecon, 'ecriture', id).lu);
    }""")
    assert coquille, 'aucune coquille gratuite trouvée pour cette phrase'
    ecrire(coquille)
    assert pg.evaluate('ecrCoquille') and pg.evaluate('ecrEssais') == 0, 'coquille comptée comme erreur'
    assert sons(pg) == [], ('son joué pour une coquille', sons(pg))
    ok('A12 coquille gratuite : aucun son, aucune erreur comptée')

    # ── Session : Écriture deux essais, puis examen ──
    ecr_id = pg.evaluate("lecons.find(l => l.id === %d).ecriture[0].id" % LECON)
    session(pg, LECON, 'ecriture', ecr_id)
    pg.fill('#session-input', 'zzz faux')
    pg.click('#session-input-btn')
    st = pg.evaluate(STYLE, '#session-feedback')
    assert sons(pg) == ['retry'] and st['titre'] == 'Pas encore · réessaie', (sons(pg), st['titre'])
    plat(st, 'Session écriture 1er faux')
    pg.fill('#session-input', 'zzz encore faux')
    pg.click('#session-input-btn')
    st = pg.evaluate(STYLE, '#session-feedback')
    assert sons(pg) == ['retry', 'finalFailure'] and 'Réponse attendue' in st['texteVisible'], (sons(pg), st)
    plat(st, 'Session écriture 2e faux')
    assert pg.locator('#session-action-dock #session-suivante.exo-cta').count() == 1
    session(pg, LECON, 'ecriture', ecr_id, mode='exam')
    pg.fill('#session-input', 'zzz faux')
    pg.click('#session-input-btn')
    st = pg.evaluate(STYLE, '#session-feedback')
    assert sons(pg) == ['finalFailure'] and pg.evaluate('session.answered'), sons(pg)
    assert st['titre'] == 'Pas encore', st['titre']
    ok('Session écriture : « retry » puis « finalFailure » ; A13 examen : pas de 2e essai, « finalFailure » direct')

    assert not erreurs, erreurs
    ctx.close()

    # ── A16 : son coupé, et réduction des animations ──
    ctx, pg, erreurs = ouvrir(nav, mouvement_reduit=True)
    pg.evaluate("""() => { localStorage.setItem(storageKey ? storageKey('luxSurvieSon') : 'luxSurvieSon', '0');
      window.__osc = 0; const C = window.AudioContext;
      window.AudioContext = function () { const a = new C(); const o = a.createOscillator.bind(a);
        a.createOscillator = () => { window.__osc++; return o(); }; return a; }; }""")
    assert not pg.evaluate('SurvieFx.sonActif()')
    session(pg, LECON, 'quiz', quiz_id)
    bonne = pg.evaluate("session.questions[0].q.reponse")
    cliquer_choix(pg, '#session-choices', bonne, False)
    pg.wait_for_timeout(300)
    assert sons(pg) == ['finalFailure'] and pg.evaluate('window.__osc') == 0, 'son joué malgré le réglage coupé'
    anim = pg.evaluate("getComputedStyle(document.querySelector('#session-choices .choice.wrong')).animationName")
    assert anim == 'none', anim
    ok('A16 son coupé : aucun oscillateur créé ; animations réduites : aucune secousse')
    assert not erreurs, erreurs
    ctx.close()

    # ── 2E : réglage « Sons des exercices » dans Plus, même préférence que Survie ──
    ctx, pg, erreurs = ouvrir(nav)
    pg.evaluate('ouvrirPlus()')
    ligne = pg.locator('#plus-sons')
    assert ligne.is_visible() and ligne.get_attribute('aria-checked') == 'true'
    ligne.click()
    assert pg.locator('#plus-sons').get_attribute('aria-checked') == 'false'
    assert 'Coupés' in pg.inner_text('#plus-sons') and not pg.evaluate('SurvieFx.sonActif()')
    assert pg.evaluate("localStorage.getItem(storageKey('luxSurvieSon'))") == '0', 'autre clé que celle de Survie'
    pg.evaluate("location.reload()")
    # Attendre la fin du démarrage (app.js et navigation.js chargés), pas seulement SurvieFx.
    pg.wait_for_function("typeof navigationRestauree !== 'undefined' && navigationRestauree === true")
    assert not pg.evaluate('SurvieFx.sonActif()'), 'réglage non conservé après rechargement'
    pg.evaluate('ouvrirPlus()')
    pg.locator('#plus-sons').click()
    assert pg.evaluate('SurvieFx.sonActif()')
    ok('2E Plus : « Sons des exercices » coupe et rétablit le son, conservé après rechargement, clé unique')
    assert not erreurs, erreurs
    ctx.close()

    # ── A15 (partiel) : petit écran, CTA entièrement visible ──
    ctx, pg, erreurs = ouvrir(nav, 320, 640)
    for type_ in ('quiz', 'trous'):
        etape(pg, type_)
        it = pg.evaluate(ITEM)
        cliquer_choix(pg, '#pc-choix', it['reponse'] if type_ == 'quiz' else it['trou'], False)
        pg.wait_for_timeout(250)
        st = pg.evaluate(STYLE, '#pc-feedback')
        assert st['ctaBas'] <= st['vh'] + 1, (type_, st['ctaBas'], st['vh'])
    session(pg, 5, 'trous', 2023)
    bonne = pg.evaluate("session.questions[0].q.trou")
    cliquer_choix(pg, '#session-choices', bonne, False)
    pg.wait_for_timeout(800)
    st = pg.evaluate(STYLE, '#session-feedback')
    assert st['ctaBas'] <= st['vh'] + 1, ('Suivante coupée', st['ctaBas'], st['vh'])
    assert pg.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'défilement horizontal'
    ok('A15 320×640 : Continuer et Suivante entièrement visibles, pas de défilement horizontal')
    assert not erreurs, erreurs
    ctx.close()
    nav.close()
print('SPEC 94 lot 2 : OK')
