"""Specs 40 et 41 : phrase « reviendra » séparée de la réponse ; une question ratée
revient au plus 2 fois dans l'étape puis part en révision ; réussie du premier
coup à son rappel, elle sort tout de suite ; après « Refaire mes erreurs », le
chemin s'ouvre centré sur la leçon."""
from playwright.sync_api import sync_playwright
from helpers import ok, vue, ouvrir, masquer_regles_vies, finir, lecon_cadree

L = 8


def item_id(pg):
    return pg.evaluate("run.steps[run.stepIdx].queue[0]")


def ecrire(pg, texte):
    pg.fill('#pc-ecr-input', texte)
    pg.click('#pc-ecr-valider')


def rater_ecriture(pg):
    """Deux essais faux : la correction s'affiche."""
    ecrire(pg, 'zzz faux')
    ecrire(pg, 'zzz encore faux')
    assert pg.evaluate('pAttente && pSuite !== null')


def bonne_reponse(pg):
    return pg.evaluate("trouverItem(pLecon, 'ecriture', run.steps[run.stepIdx].queue[0]).lu")


def centree(pg, lid):
    return pg.evaluate("""id => { const c = document.getElementById('chemin-lecon-' + id).getBoundingClientRect();
        return { haut: c.top, bas: c.bottom, milieu: (c.top + c.bottom) / 2, zone: (12 + basVisibleChemin()) / 2,
                 visible: c.top >= 0 && c.bottom <= basVisibleChemin() + 1, y: scrollY }; }""", lid)


with sync_playwright() as p:
    b, pg, erreurs_js = ouvrir(p, mobile=True)
    masquer_regles_vies(pg)
    pg.evaluate("choisirNiveau('A1.1'); lecons.forEach(l => marquerIntroMissionVue(l.id))")

    # ── 1 + 3. Étape « écriture » seule de l'unité 1 ──
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === %d)); startEtapeSeule(1, 'ecriture')" % L)
    assert pg.evaluate("run.steps[0].type") == 'ecriture'
    n = pg.evaluate("run.steps[0].queue.length")
    assert n >= 3, n

    # Point 1 : réponse et phrase « reviendra » dans deux éléments séparés
    cible = item_id(pg)
    lu = bonne_reponse(pg)
    rater_ecriture(pg)
    fb = pg.evaluate("""() => { const t = document.querySelector('#pc-feedback .pc-fb-txt');
        return { b: t.querySelector('b').textContent, rappel: (t.querySelector('.pc-fb-rappel') || {}).textContent || null,
                 texte: t.innerText }; }""")
    assert fb['b'] == lu and fb['rappel'] == 'Cette phrase reviendra à la fin de l\'étape.', fb
    assert (lu + 'Cette') not in fb['texte'].replace('\n', ''), fb['texte']
    ok('correction : réponse et « Cette phrase reviendra… » dans deux blocs séparés')

    # Point 3 : ratée à chaque passage → au plus 3 passages (1 + 2 rappels), puis elle part
    passages = 1
    pg.click('#pc-continuer')
    for _ in range(6):
        if vue(pg) != 'view-parcours' or item_id(pg) != cible:
            # avance jusqu'au retour de la phrase cible, en répondant juste aux autres
            while vue(pg) == 'view-parcours' and cible in pg.evaluate("run.steps[0].queue") and item_id(pg) != cible:
                ecrire(pg, bonne_reponse(pg)); pg.click('#pc-continuer')
            if vue(pg) != 'view-parcours' or cible not in pg.evaluate("run.steps[0].queue"):
                break
        passages += 1
        dernier = not pg.evaluate("vaRevenir()")
        rater_ecriture(pg)
        texte = pg.inner_text('#pc-feedback .pc-fb-rappel')
        if dernier:
            assert 'Refaire mes erreurs' in texte and 'révisions' in texte, texte
        else:
            assert 'reviendra' in texte, texte
        pg.click('#pc-continuer')
    assert passages == 3, passages
    assert cible not in pg.evaluate("run && run.steps[0] ? run.steps[0].queue : []")
    ok('phrase ratée à chaque fois : 3 passages au plus (1 + 2 rappels), puis « tu la retrouveras dans tes révisions »')

    # On termine l'étape : la phrase sortie reste une erreur (résultats, Refaire mes erreurs)
    while vue(pg) == 'view-parcours':
        ecrire(pg, bonne_reponse(pg)); pg.click('#pc-continuer')
    assert vue(pg) == 'view-pfin'
    assert ('ecriture:%d' % cible) in pg.evaluate("pResultat.erreurs")
    ok('après la limite : la phrase reste dans les erreurs (« Refaire mes erreurs », révisions)')

    # Ratée une fois, réussie du premier coup à son rappel → elle sort tout de suite
    pg.evaluate("startEtapeSeule(1, 'ecriture')")
    cible = item_id(pg)
    rater_ecriture(pg); pg.click('#pc-continuer')
    while item_id(pg) != cible:
        ecrire(pg, bonne_reponse(pg)); pg.click('#pc-continuer')
    ecrire(pg, bonne_reponse(pg))
    assert 'Juste !' in pg.inner_text('#pc-feedback')
    pg.click('#pc-continuer')
    assert vue(pg) == 'view-pfin' or cible not in pg.evaluate("run.steps[0].queue"), 'sortie de la file'
    ok('ratée puis réussie du premier coup à son rappel : sort immédiatement de la file')

    # 2e essai juste : la règle est expliquée, la phrase revient
    pg.evaluate("startEtapeSeule(1, 'ecriture')")
    cible = item_id(pg)
    ecrire(pg, 'zzz faux')
    ecrire(pg, bonne_reponse(pg))
    t = pg.inner_text('#pc-feedback')
    assert 'Juste, au 2e essai' in t and 'du premier coup' in t, t
    pg.click('#pc-continuer')
    assert pg.evaluate("run.steps[0].queue")[-1] == cible
    ok('juste au 2e essai : « trouve-la du premier coup », la phrase revient en fin d\'étape')

    # Quiz : même limite
    pg.evaluate("startEtapeSeule(1, 'quiz')")
    cible = item_id(pg)
    vus = 0
    while vue(pg) == 'view-parcours':
        it = pg.evaluate("trouverItem(pLecon, 'quiz', run.steps[0].queue[0])")
        boutons = pg.locator('#pc-choix .choice')
        juste = it['id'] != cible
        if not juste:
            vus += 1
        for i in range(boutons.count()):
            if (boutons.nth(i).inner_text() == it['reponse']) == juste:
                boutons.nth(i).click(); break
        pg.click('#pc-continuer')  # 2.1 : Continuer aussi après une bonne réponse
    assert vus == 3, vus
    ok('quiz : une question ratée à chaque fois est posée 3 fois au plus')

    # ── 2. Refaire mes erreurs → « Mon chemin », leçon centrée et dépliée ──
    for sortie in ('bouton', 'retour'):
        pg.evaluate("goLessons()")
        pg.evaluate("ouvrirUniteDepuisChemin(%d, 1)" % L)
        pg.click('#pi-commencer')
        finir(pg, erreurs=1)
        pg.click('text=Refaire mes erreurs')
        finir(pg)
        assert vue(pg) == 'view-pfin'
        if sortie == 'bouton':
            assert pg.inner_text('#pf-suite').startswith('Mon chemin'), pg.inner_text('#pf-suite')
            assert pg.locator('#pf-content button:has-text("Retour à la leçon")').count() == 0, 'spec 41 : pas de liste des unités'
            pg.click('#pf-suite')
        else:
            pg.go_back()
        pg.wait_for_timeout(150)
        assert vue(pg) == 'view-lessons', vue(pg)
        c = lecon_cadree(pg, L)  # spec 44 : leçon dépliée seule et cadrée
        ok('Refaire mes erreurs → ' + ('« Mon chemin »' if sortie == 'bouton' else 'Retour') +
           ' : chemin principal, leçon %d seule dépliée et cadrée (défilement %d px)' % (L, c['y']))

    # Spec 41 : entrée par la fiche de leçon (liste des unités dans l'historique) → Retour : chemin quand même
    pg.evaluate("goLessons()")
    pg.evaluate("openParcoursLecon(lecons.find(l => l.id === %d))" % L)
    pg.evaluate("openIntro(1)")
    pg.click('#pi-commencer')
    finir(pg, erreurs=1)
    pg.click('text=Refaire mes erreurs')
    finir(pg)
    assert 'view-plecon' in pg.evaluate("pileNav.map(e => e.vue)")
    pg.go_back(); pg.wait_for_timeout(150)
    lecon_cadree(pg, L)
    pg.go_back(); pg.wait_for_timeout(150)
    assert vue(pg) == 'view-dashboard', 'pas de rebond vers la liste des unités'
    ok('entrée par la fiche de leçon → Refaire mes erreurs → Retour : chemin principal (pas la liste des unités), puis accueil')

    # ── Spec 41 : faute de frappe localisée (cas réel, leçon 21) ──
    pg.evaluate("choisirNiveau('A1.2'); openParcoursLecon(lecons.find(l => l.id === 21)); startEtapeSeule(1, 'ecriture')")
    while pg.evaluate("trouverItem(pLecon, 'ecriture', run.steps[0].queue[0]).id") != 2005:
        ecrire(pg, bonne_reponse(pg)); pg.click('#pc-continuer')
    ecrire(pg, "d'dusch ass aam buedzemmer")
    err = pg.inner_text('#pc-ecr-erreur')
    assert 'Une lettre en trop dans « aam »' in err, err
    assert 'Attention' not in err and 'Schlofz' not in err, err
    assert not pg.evaluate('pAttente') and pg.input_value('#pc-ecr-input') == "d'dusch ass aam buedzemmer", 'pas d\'auto-validation'
    ecrire(pg, "d'dusch ass am buedzemmer")
    assert 'Juste, au 2e essai' in pg.inner_text('#pc-feedback')
    pg.click('#pc-continuer')
    ok('« aam » au lieu de « am » : « Une lettre en trop dans « aam » », sans règle hors sujet ; accepté au 2e essai seulement')

    # Un autre mot réel (« an ») ou une forme protégée : vraie erreur, aide habituelle
    pg.evaluate("startEtapeSeule(1, 'ecriture')")
    while pg.evaluate("trouverItem(pLecon, 'ecriture', run.steps[0].queue[0]).id") != 2005:
        ecrire(pg, bonne_reponse(pg)); pg.click('#pc-continuer')
    ecrire(pg, "d'dusch ass an buedzemmer")
    err = pg.inner_text('#pc-ecr-erreur')
    assert '« an »' not in err and 'Attention' in err, err
    ok('« an » (un autre mot réel) : pas d\'indication de frappe, la règle « am » reste affichée')
    d = pg.evaluate('''() => [diagnosticLettre("Ech sin Lëtzebuerger", "Ech sinn Lëtzebuerger."),
        diagnosticLettre("Dat si mi Elteren", "Dat sinn meng Elteren."),
        diagnosticLettre("D'Dusch ass am Buedzëmmer", "D'Dusch ass am Buedzëmmer.")]''')
    assert d == ['', '', ''], d
    ok('forme protégée (sin/sinn), plusieurs erreurs, réponse juste (casse, accents) : aucune indication de frappe')

    b.close()

print()
print('Erreurs JavaScript :', erreurs_js or 'aucune')
if erreurs_js:
    raise SystemExit(1)
