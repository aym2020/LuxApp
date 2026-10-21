"""Spec 48 : examens harmonisés avec le design system.
Liste des sujets, passage et résultat : surfaces neutres, aucune couleur codée
dans la page (styles inline de couleur), or réservé à l'action (bouton
« Corriger » = .pc-btn.primary), score vert (≥ 60 %) ou rouge, Retour vers
l'écran réellement précédent, meilleur score à jour au retour sur la liste."""
from playwright.sync_api import sync_playwright
from helpers import ok, ouvrir, masquer_regles_vies

# Remplit une partie : bonnes réponses sauf une sur `tous_les`.
REMPLIR = """([p, tous]) => { examItems(exam.parties[p]).forEach((it, i) => {
    examAnswers[p][i] = (tous && i % tous === 0) ? '__faux__' : it.reponse; }); renderExamPart(); }"""

# Couleurs posées en style inline (interdit : la couleur vient du CSS)
COULEURS_INLINE = """sel => [...document.querySelectorAll(sel + ' [style]')]
    .map(e => e.getAttribute('style')).filter(s => /color|background/.test(s))"""

with sync_playwright() as p:
    b, pg, erreurs = ouvrir(p, mobile=True)
    masquer_regles_vies(pg)
    pg.evaluate("choisirNiveau('A1.2')")

    # ── Liste des sujets, ouverte depuis l'accueil ──
    pg.click('#view-dashboard .ac-btn.exa')
    assert pg.locator('#examens-list .ex-carte').count() >= 2
    assert pg.evaluate(COULEURS_INLINE, '#examens-list') == []
    assert pg.locator('#examens-list .lecon-pill, #examens-list .ex-carte-score').count() == 0  # jamais fait : pas de score
    assert 'Pas encore fait' in pg.inner_text('#examens-list .ex-carte >> nth=0')
    ok('liste des sujets : cartes neutres, infos sur une ligne, pas de pastille ni de couleur inline')

    # ── Passage : partie 1 réussie, partie 2 ratée ──
    pg.click('#examens-list .ex-carte >> nth=0')
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-examen'
    assert pg.inner_text('#view-examen .back-btn').endswith('Sujets')
    assert pg.locator('#ex-next.pc-btn.primary').count() == 1 and pg.locator('#ex-prev.pc-btn').count() == 1
    # Régression UI (21/10/2026) : la barre 1…6 ne doit pas toucher/laisser
    # transparaître le texte à trous quand le corps de l'annale défile.
    barre = pg.evaluate("""() => {
        const steps = document.getElementById('ex-steps');
        const lastButton = steps.querySelector('.ex-step');
        const body = document.getElementById('ex-body');
        return {
            gap: body.getBoundingClientRect().top - lastButton.getBoundingClientRect().bottom,
            fond: getComputedStyle(steps).backgroundColor,
            fondPage: getComputedStyle(document.body).backgroundColor
        };
    }""")
    assert barre['gap'] >= 10, ('Espacement insuffisant sous les parties', barre)
    assert barre['fond'] == barre['fondPage'], ('La barre des parties doit être opaque', barre)
    ok('barre 1…6 : 12 px sous les boutons, fond opaque et contenu séparé')
    fond = pg.evaluate("getComputedStyle(document.getElementById('ex-next')).backgroundImage")
    assert fond == 'none', ('bouton principal en dégradé', fond)  # or uni
    pg.evaluate(REMPLIR, [0, 0])
    pg.click('#ex-next')  # Corriger
    pg.evaluate("examGoTo(1)")
    pg.evaluate(REMPLIR, [1, 1])  # tout faux
    pg.click('#ex-next')
    steps = pg.evaluate("[...document.querySelectorAll('#ex-steps .ex-step')].map(s => s.className)")
    assert 'ok' in steps[0] and 'ko' in steps[1], steps
    assert pg.evaluate(COULEURS_INLINE, '#view-examen') == []
    assert pg.get_attribute('#ex-steps .ex-step >> nth=0', 'aria-label').startswith('Partie 1, corrigée')
    ok('passage : « Corriger » or uni (.pc-btn.primary), parties corrigées vertes / rouges par classe, noms accessibles')

    # ── Résultat ──
    pg.evaluate("""() => { exam.parties.forEach((part, k) => { examItems(part).forEach((it, i) => {
        if (examAnswers[k][i] === null) examAnswers[k][i] = it.reponse; }); examChecked[k] = true; });
        examPart = exam.parties.length - 1; renderExamPart(); examNext(); }""")
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-examen-result'
    classe = pg.evaluate("examClasse(Math.round(examRes.score / examRes.total * 100))")
    assert pg.locator('.exr-ring.' + classe).count() == 1 and pg.locator('.exr-mention.' + classe).count() == 1
    assert pg.evaluate(COULEURS_INLINE, '#exr-body') == []
    assert pg.locator('#view-examen-result .pc-btn.primary').count() == 1  # une seule action principale
    assert pg.inner_text('#exr-terminer') == 'Terminer'
    assert pg.inner_text('#exr-refaire') == 'Refaire ce sujet'
    assert pg.locator('#exr-cta #exr-refaire').count() == 0  # refaire reste sous la correction
    # « Terminer » visible dès le haut de l'écran, au-dessus du bas de page
    assert pg.evaluate("window.scrollY") == 0 and pg.is_visible('#exr-cta #exr-terminer')
    # SPEC 74 : c'est « Terminer » (bandeau fixe) qui est dans l'écran dès le haut ; « Refaire ce sujet » est en fin de correction.
    r = pg.evaluate("(() => { const b = document.getElementById('exr-terminer').getBoundingClientRect(); return [b.top, b.bottom, innerHeight]; })()")
    assert 0 < r[0] and r[1] <= r[2], r
    pg.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    lien = pg.evaluate("(() => { const a = document.getElementById('exr-refaire').getBoundingClientRect(), c = document.getElementById('exr-cta').getBoundingClientRect(); return [a.bottom, c.top]; })()")
    assert lien[0] <= lien[1] + 1, ('« Refaire ce sujet » caché sous le bandeau', lien)
    pg.evaluate("window.scrollTo(0, 0)")
    ok('résultat : anneau et mention « %s » par classe, une seule action principale, pas de couleur inline' % classe)

    # ── Spec 49 : « ← Sujets » en haut, destination fixe ──
    assert pg.inner_text('#exr-retour').strip() == '← Sujets'
    assert pg.get_attribute('#exr-retour', 'aria-label') == "Retour aux sujets d'examen"
    pg.click('#exr-body .exr-filter button >> nth=1')  # Mes erreurs
    pg.click('#exr-retour')
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-examens'
    assert pg.locator('#examens-list .ex-carte >> nth=0').locator('.ex-carte-score.' + classe).count() == 1
    ok('« ← Sujets » (après « Mes erreurs ») → liste avec le meilleur score à jour')

    # ── Autre annale A1.2 : « Terminer » ──
    pg.click('#examens-list .ex-carte >> nth=1')
    pg.evaluate("""() => { exam.parties.forEach((part, k) => { examItems(part).forEach((it, i) => { examAnswers[k][i] = it.reponse; }); examChecked[k] = true; });
        examPart = exam.parties.length - 1; renderExamPart(); examNext(); }""")
    assert pg.evaluate("exam.niveau") == 'A1.2' and pg.inner_text('#exr-retour').strip() == '← Sujets'
    pg.click('#exr-terminer')
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-examens' and pg.evaluate("niveauActif") == 'A1.2'
    assert pg.locator('#examens-list .ex-carte-score').count() == 2
    ok('2e annale A1.2 : « Terminer » → sujets A1.2, deux meilleurs scores')

    # ── Retour du téléphone depuis le résultat : sujets, puis accueil (pas de boucle) ──
    pg.click('#examens-list .ex-carte >> nth=0')
    pg.evaluate("""() => { exam.parties.forEach((part, k) => { examItems(part).forEach((it, i) => { examAnswers[k][i] = it.reponse; }); examChecked[k] = true; });
        examPart = exam.parties.length - 1; renderExamPart(); examNext(); }""")
    pg.go_back(); pg.wait_for_timeout(200)
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-examens'
    pg.go_back(); pg.wait_for_timeout(200)
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-dashboard'
    ok('Retour du téléphone : résultat → sujets → accueil, sans boucle')

    # ── Historique incomplet (résultat seul dans la pile) : toujours les sujets ──
    pg.click('#view-dashboard .ac-btn.exa'); pg.click('#examens-list .ex-carte >> nth=0')
    pg.evaluate("""() => { exam.parties.forEach((part, k) => { examItems(part).forEach((it, i) => { examAnswers[k][i] = it.reponse; }); examChecked[k] = true; });
        examPart = exam.parties.length - 1; renderExamPart(); examNext(); pileNav = pileNav.slice(-1); }""")
    pg.evaluate("retour()")
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-examens'
    ok('historique incomplet : Retour depuis le résultat → sujets')

    # ── Examen inachevé : la confirmation d'abandon reste ──
    pg.click('#examens-list .ex-carte >> nth=0')
    pg.evaluate(REMPLIR, [0, 0])
    # SPEC 66 : dialogue LuxApp (plus de fenêtre native). « Rester » et Retour gardent l'examen.
    pg.click('#view-examen .back-btn')
    assert 'Quitter ce sujet' in pg.inner_text('.dlg h2')
    pg.click('.dlg-annuler')
    assert not pg.evaluate('dialogueEstOuvert()') and pg.evaluate("document.querySelector('.view.active').id") == 'view-examen'
    pg.click('#view-examen .back-btn')
    pg.go_back(); pg.wait_for_timeout(300)  # Retour du téléphone : ferme seulement le dialogue
    assert not pg.evaluate('dialogueEstOuvert()') and pg.evaluate("document.querySelector('.view.active').id") == 'view-examen'
    ok('examen inachevé : confirmation d\'abandon dans un dialogue LuxApp ; Rester et Retour gardent l\'examen')
    pg.evaluate("examAnswers = examAnswers.map(p => p.map(() => null)); quitExamen()")
    pg.evaluate("goDashboard()")

    # ── Questions aléatoires : Retour vers les sujets ──
    pg.click('#view-dashboard .ac-btn.exa')
    pg.click('#examens-list .ex-carte >> nth=-1')
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-session'
    # Lettre d'un choix (A, B, C…) : neutre tant que rien n'est choisi (pas d'or décoratif)
    lettre, action = pg.evaluate("""() => { const box = document.createElement('div'); box.className = 'choices';
        box.innerHTML = '<button class="choice">x</button><span style="color: var(--couleur-action)"></span>';
        document.body.appendChild(box);
        const r = [getComputedStyle(box.firstChild, '::before').color, getComputedStyle(box.lastChild).color];
        box.remove(); return r; }""")
    assert lettre != action, (lettre, action)
    pg.click('#view-session .back-btn')
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-examens'
    ok('questions aléatoires : lettres des choix neutres ; Retour → sujets')

    print('\nErreurs JavaScript :', erreurs or 'aucune')
    assert not erreurs
    b.close()
