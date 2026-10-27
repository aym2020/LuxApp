"""SPEC 110 lot D5 — Lux Démasque : parcours complets dans le vrai navigateur.
0, 1, 2 puis 3 disquettes trouvées (scores, record, « Rejouer »), précision indispensable,
précision répétée, objection sur une phrase déjà démasquée, pièces jamais ouvertes au bilan,
effet OBJECTION ! (passé par un appui ou par Retour, boutons bloqués pendant l'effet,
mouvement réduit), Retour Android et Échap dans l'ordre des fenêtres, accessibilité
(dialogues, focus, noms accessibles, lang="lb"), rendu WebGL (basse résolution, arrêt en
quittant) et passage de Lux Match à Lux Démasque sur le même canvas."""
from playwright.sync_api import sync_playwright
from helpers import ok, ouvrir, vue

# Tout entendre et tout consulter d'un coup (le parcours pièce par pièce est dans test_lux_demasque.py).
TOUT_VOIR = """(() => { const p = ld.partie;
  p.dossier.declarations.forEach((d, i) => LuxDemasqueCore.allerA(p, i));
  p.dossier.pieces.forEach(id => LuxDemasqueCore.consulter(p, id));
  LuxDemasqueCore.allerA(p, 0); ldMajDeposition(); })()"""
DESSINS = """(() => { const c = document.querySelector('#ld-jeu canvas'); if (!c) return false;
  const gl = c.getContext('webgl2') || c.getContext('webgl'); if (!gl || gl.__espion) return !!gl;
  window.__dessins = 0; gl.__espion = true;
  ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced'].forEach(n => {
    const f = gl[n]; if (f) gl[n] = function () { window.__dessins++; return f.apply(this, arguments); }; });
  return true; })()"""


def commencer(pg, nom):
    pg.wait_for_selector('.ld-rencontre')
    assert nom in pg.inner_text('.ld-fiche'), pg.inner_text('.ld-fiche')
    pg.click('.ld-rencontre .ld-btn-or')
    pg.wait_for_selector('#ld-declaration')


def objecter(pg, index, piece, fermer=True):
    pg.evaluate(f"LuxDemasqueCore.allerA(ld.partie, {index}); ldMajDeposition()")
    pg.click('#ld-objecter')
    pg.click(f"#ld-objection .ld-carnet-el:has-text('{piece}')")
    pg.wait_for_selector('#ld-verdict')
    texte = pg.inner_text('#ld-verdict')
    if fermer:
        pg.click('#ld-verdict .ld-btn')
    return texte


def conclure(pg):
    pg.click('.ld-top [aria-label="Menu"]')
    pg.click("#ld-menu .ld-btn:has-text('Conclure le dossier')")
    if pg.locator('#ld-conclure').count():
        pg.click("#ld-conclure .ld-btn:has-text('Conclure le dossier')")
    pg.wait_for_selector('.ld-bilan')
    return pg.evaluate("ld.partie.fin")


def lire(pg, cle):
    return pg.evaluate(f"ldLire('{cle}', null)")


with sync_playwright() as p:
    b, pg, erreurs_js = ouvrir(p, mobile=True)
    pg.evaluate("ouvrirJeux()")
    pg.click('.ld-jouer-hub')

    # ── 0 / 3 : conclure tout de suite ──────────────────────────────────────
    commencer(pg, 'Milo, 30 ans')
    pg.click('.ld-top [aria-label="Menu"]')
    pg.click("#ld-menu .ld-btn:has-text('Conclure le dossier')")
    pg.wait_for_selector('#ld-conclure')
    assert 'Il reste au moins une disquette' in pg.inner_text('#ld-conclure')
    pg.evaluate("history.back()")                                  # Retour = « Continuer l'enquête »
    pg.wait_for_function("!document.getElementById('ld-conclure')")
    assert vue(pg) == 'view-luxdemasque' and pg.evaluate("ld.partie.phase") == 'deposition'
    fin = conclure(pg)
    assert [fin['trouvees'], fin['total'], fin['score'], fin['erreurs']] == [0, 3, 0, 0], fin
    rates = pg.locator('.ld-bilan .ld-liste-bilan li.ld-rate')
    assert rates.count() == 3
    assert all('jamais ouverte' in rates.nth(k).inner_text() for k in range(3))
    assert 'Profil Pro de Milo' in pg.inner_text('.ld-bilan')       # le bilan dit où était la preuve
    assert pg.locator(".ld-bilan .ld-btn:has-text('Rejouer ce dossier')").count() == 1
    assert lire(pg, 'luxDemasqueResolus') in (None, [])
    ok('0/3 : confirmation (Retour = continuer), score 0, 3 preuves « jamais ouvertes » au bilan, Rejouer proposé')

    # ── 1 / 3 : précision répétée, phrase démasquée, focus, Échap ───────────
    pg.click(".ld-bilan .ld-btn:has-text('Rejouer ce dossier')")
    commencer(pg, 'Milo, 30 ans')
    assert pg.evaluate("[ld.partie.erreurs, ld.partie.demasquees.length, ld.partie.precisions.length]") == [0, 0, 0]
    pg.evaluate(TOUT_VOIR)
    pg.click('#ld-preciser')
    assert pg.is_disabled('#ld-preciser') and 'Déjà précisé' in pg.inner_text('#ld-preciser')
    pg.evaluate("ldPreciser(); ldPreciser()")                       # appels répétés : sans effet
    assert pg.evaluate("ld.partie.precisions.length") == 1
    assert pg.evaluate("ld.partie.journal.filter(j => j.type === 'precision').length") == 1
    ok('précision : une seule fois, bouton « Déjà précisé », appels répétés sans effet')

    # Accessibilité des fenêtres : dialogue modal nommé, focus dedans, Échap, focus rendu.
    pg.focus('.ld-outil:has-text("Réseaux")')
    pg.click('.ld-outil:has-text("Réseaux")')
    a11y = pg.evaluate("""(() => { const c = document.getElementById('ld-reseaux');
      return [c.getAttribute('role'), c.getAttribute('aria-modal'), !!c.getAttribute('aria-label'), c.contains(document.activeElement)]; })()""")
    assert a11y == ['dialog', 'true', True, True], a11y
    pg.keyboard.press('Escape')
    pg.wait_for_function("!document.getElementById('ld-reseaux')")
    assert pg.evaluate("document.activeElement.classList.contains('ld-outil')")
    sans_nom = pg.evaluate("""[...document.querySelectorAll('#ld-jeu button')].filter(b => b.offsetParent &&
      !(b.getAttribute('aria-label') || b.textContent).trim()).length""")
    assert sans_nom == 0
    assert pg.locator('#ld-declaration [lang="lb"]').count() >= 2     # phrase + précision en LU balisées
    assert pg.get_attribute('#ld-compteur', 'aria-live') == 'polite'
    ok('accessibilité : dialogue modal nommé, focus dedans puis rendu, Échap, boutons nommés, lang="lb"')

    assert 'démasquée' in objecter(pg, 1, 'Profil de Sami')
    assert pg.is_disabled('#ld-objecter')
    pg.evaluate("ldObjection()")                                    # déjà démasquée : rien ne s'ouvre
    assert pg.locator('#ld-objection').count() == 0
    assert pg.evaluate("LuxDemasqueCore.objecter(ld.partie, 'MILO_FLAT', 'AMIS_SAMI').resultat") == 'deja'
    assert pg.evaluate("ld.partie.erreurs") == 0
    fin = conclure(pg)
    assert [fin['trouvees'], fin['score']] == [1, 300], fin
    assert lire(pg, 'luxDemasqueRecord') == 300 and 'nouveau record' in pg.inner_text('.ld-stats').lower()
    assert pg.locator('.ld-bilan .ld-liste-bilan li.ld-ok').count() == 1
    assert all('tu l’avais ouverte' in t for t in pg.locator('.ld-bilan .ld-liste-bilan li.ld-rate').all_inner_texts())
    ok('1/3 : phrase démasquée verrouillée (« déjà », 0 erreur), score 300, nouveau record, pièces « ouvertes » au bilan')

    # ── 2 / 3 : précision indispensable, objections ratées ──────────────────
    pg.click(".ld-bilan .ld-btn:has-text('Rejouer ce dossier')")
    commencer(pg, 'Milo, 30 ans')
    pg.evaluate(TOUT_VOIR)
    texte = objecter(pg, 0, 'Profil Pro de Milo')                   # bonne pièce, mais pas de précision
    assert 'rejetée' in texte and 'fais-lui d’abord préciser' in texte, texte
    pg.evaluate("LuxDemasqueCore.allerA(ld.partie, 0); ldMajDeposition()")
    pg.click('#ld-preciser')
    assert 'démasquée' in objecter(pg, 0, 'Profil Pro de Milo')
    assert 'rejetée' in objecter(pg, 5, 'Photo : Pixel')            # vérité : objection ratée
    assert 'démasquée' in objecter(pg, 3, 'LuxRun')
    fin = conclure(pg)
    assert [fin['trouvees'], fin['erreurs'], fin['score'], fin['sansFaute']] == [2, 2, 500, False], fin
    assert lire(pg, 'luxDemasqueRecord') == 500
    ok('2/3 : précision indispensable (refus + indice puis preuve), 2 ratées, score 500, record mis à jour')

    # ── 3 / 3 : effet OBJECTION ! bloquant, passé par appui ou Retour ───────
    pg.click(".ld-bilan .ld-btn:has-text('Rejouer ce dossier')")
    commencer(pg, 'Milo, 30 ans')
    pg.evaluate(TOUT_VOIR)
    pg.evaluate("LuxDemasqueCore.allerA(ld.partie, 1); ldMajDeposition()")
    pg.click('#ld-objecter')
    pg.click("#ld-objection .ld-carnet-el:has-text('Profil de Sami')")
    pg.wait_for_selector('.ld-fx-ok')
    menu = pg.locator('.ld-top [aria-label="Menu"]').bounding_box()
    pg.mouse.click(menu['x'] + menu['width'] / 2, menu['y'] + menu['height'] / 2)   # tombe sur l'effet
    pg.wait_for_selector('#ld-verdict', timeout=600)                # verdict tout de suite, pas après 1,3 s
    assert pg.locator('#ld-menu').count() == 0 and pg.locator('.ld-fx').count() == 0
    pg.click('#ld-verdict .ld-btn')
    ok('pendant OBJECTION ! les boutons sont bloqués ; un appui passe l’effet et montre le verdict')

    pg.emulate_media(reduced_motion='reduce')
    pg.evaluate("LuxDemasqueCore.allerA(ld.partie, 3); ldMajDeposition()")
    pg.click('#ld-objecter')
    pg.click("#ld-objection .ld-carnet-el:has-text('LuxRun')")
    pg.wait_for_selector('.ld-fx-ok')
    anim = pg.evaluate("[getComputedStyle(document.querySelector('.ld-fx-cri')).animationName, document.querySelector('.ld-depo').classList.contains('ld-secousse') ? getComputedStyle(document.querySelector('.ld-depo')).animationName : 'none']")
    assert anim == ['ld-fondu', 'none'], anim
    pg.evaluate("history.back()")                                   # Retour pendant l'effet : verdict, pas de sortie
    pg.wait_for_selector('#ld-verdict', timeout=600)
    assert vue(pg) == 'view-luxdemasque'
    pg.evaluate("history.back()")                                   # Retour sur le verdict : le ferme
    pg.wait_for_function("!document.getElementById('ld-verdict')")
    pg.emulate_media(reduced_motion='no-preference')
    ok('mouvement réduit : fondu sans secousse ; Retour passe l’effet puis ferme le verdict')

    # Rendu WebGL : basse résolution volontaire, images dessinées pendant la déposition.
    assert pg.evaluate(DESSINS)
    pg.wait_for_timeout(1000)
    dessins = pg.evaluate("window.__dessins")
    taille = pg.evaluate("""(() => { const c = document.querySelector('#ld-jeu canvas');
      return [c.width, c.clientWidth, devicePixelRatio, document.querySelectorAll('canvas').length]; })()""")
    assert dessins > 0, dessins
    assert taille[0] <= round(taille[1] * min(taille[2], 2) * 0.5) + 1 and taille[3] == 1, taille
    ok(f'WebGL : un seul canvas, rendu à {taille[0]} px pour {taille[1]} px affichés, {dessins} appels de dessin/s (SwiftShader)')

    texte = objecter(pg, 0, 'Profil Pro de Milo', fermer=False)     # sans précision : refusé
    assert 'rejetée' in texte
    pg.click('#ld-verdict .ld-btn')
    pg.evaluate("LuxDemasqueCore.allerA(ld.partie, 0); ldMajDeposition()")
    pg.click('#ld-preciser')
    assert 'Voir le bilan' in objecter(pg, 0, 'Profil Pro de Milo', fermer=False)
    pg.click('#ld-verdict .ld-btn')
    pg.wait_for_selector('.ld-bilan')
    fin = pg.evaluate("ld.partie.fin")
    assert [fin['trouvees'], fin['erreurs'], fin['score'], fin['complet']] == [3, 1, 850, True], fin
    assert pg.locator(".ld-bilan .ld-btn:has-text('Rejouer ce dossier')").count() == 0
    assert lire(pg, 'luxDemasqueResolus') == ['MILO_001'] and lire(pg, 'luxDemasqueRecord') == 850
    assert pg.evaluate("document.querySelectorAll('#ld-jeu canvas').length") == 0   # 3D détachée au bilan
    ok('3/3 : bilan direct après le dernier verdict, score 850, Milo résolu, record 850, 3D détachée')

    # ── Quitter : plus aucun dessin WebGL ───────────────────────────────────
    pg.evaluate("window.__dessins = 0")
    pg.wait_for_timeout(800)
    assert pg.evaluate("window.__dessins") == 0
    pg.evaluate("history.back()")
    pg.wait_for_function("document.getElementById('view-jeux').classList.contains('active')")
    assert pg.evaluate("ld.partie") is None
    ok('bilan : zéro dessin WebGL ; Retour → hub Jeux, partie arrêtée')

    # ── Lux Match (réactivé pour le test) puis Lux Démasque : même canvas ───
    pg.evaluate("JEUX_DISPONIBLES.luxMatch = true; ouvrirLuxMatch(); 0")
    pg.wait_for_selector('.lm-profil', timeout=40000)
    pg.wait_for_function("!!lm.rendu3d", timeout=20000)             # moteur 3D de Lux Match prêt
    pg.evaluate("ouvrirLuxDemasque()")
    commencer(pg, 'Noah, 32 ans')                                  # Milo résolu → Noah
    pg.wait_for_function("document.querySelector('#ld-jeu canvas')", timeout=20000)
    assert pg.evaluate("document.querySelectorAll('canvas').length") == 1
    assert pg.evaluate("document.getElementById('view-luxmatch').classList.contains('active')") is False
    assert pg.evaluate("lm.rendu3d === ld.rendu3d")                # même instance, donc même WebGLRenderer
    pg.evaluate("ldQuitter(); JEUX_DISPONIBLES.luxMatch = false")
    assert pg.evaluate("document.querySelectorAll('canvas').length") == 0
    ok('Lux Match → Lux Démasque : même instance 3D (un seul WebGLRenderer), un seul canvas, Lux Match inactif ; quitter retire le canvas')

    assert not erreurs_js, erreurs_js
    b.close()
