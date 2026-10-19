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
    assert pg.locator('#exr-body .pc-btn.primary').count() == 1  # une seule action principale
    ok('résultat : anneau et mention « %s » par classe, une seule action principale, pas de couleur inline' % classe)

    # ── « Autres sujets » : retour à la liste, meilleur score affiché ──
    pg.click('#exr-body .lien-or')
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-examens'
    assert pg.locator('#examens-list .ex-carte >> nth=0').locator('.ex-carte-score.' + classe).count() == 1
    pg.click('#view-examens .back-btn')
    assert pg.evaluate("document.querySelector('.view.active').id") == 'view-dashboard'
    ok('« Autres sujets » → liste avec le meilleur score à jour ; Retour → accueil')

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
