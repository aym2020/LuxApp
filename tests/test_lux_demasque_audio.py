"""SPEC 110 lot D3 — Lux Démasque : musique et accents. Web Audio instrumenté : un seul
contexte pour le jeu, au plus une boucle active, la bonne piste selon l'écran (enquête /
déposition / silence au bilan), accents aux bons moments, réglages Son et Musique, arrêt en
quittant ou en arrière-plan, Lux Match puis Lux Démasque sans double boucle, fichiers absents
sans plantage."""
from playwright.sync_api import sync_playwright
from helpers import ok, URL

ESPION = """
(() => {
  const Origine = window.AudioContext || window.webkitAudioContext;
  window.__audio = { contextes: 0, sources: [] };
  function Espion() {
    const ctx = new Origine(); window.__audio.contextes++;
    const creer = ctx.createBufferSource.bind(ctx);
    ctx.createBufferSource = () => {
      const s = creer(), info = { boucle: false, duree: 0, debut: false, fin: false };
      const start = s.start.bind(s), stop = s.stop.bind(s);
      s.start = (...a) => { info.debut = true; info.boucle = s.loop; info.duree = s.buffer ? s.buffer.duration : 0; return start(...a); };
      s.stop = (...a) => { info.fin = true; return stop(...a); };
      s.addEventListener('ended', () => { info.fin = true; });
      window.__audio.sources.push(info);
      return s;
    };
    return ctx;
  }
  window.AudioContext = Espion; window.webkitAudioContext = Espion;
})();
"""
ACTIVES = "window.__audio.sources.filter(s => s.debut && s.boucle && !s.fin).length"


def attendre_piste(pg, nom):
    pg.wait_for_function(f"LuxDemasqueSon.pisteEnCours() === {('null' if nom is None else repr(nom))}", timeout=15000)


with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(viewport={'width': 360, 'height': 740}, is_mobile=True, has_touch=True)
    ctx.add_init_script(ESPION)
    pg = ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/*gstatic*/**', lambda r: r.abort()); pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL); pg.wait_for_selector('#today')
    pg.evaluate("ouvrirJeux()"); pg.click('.ld-jouer-hub'); pg.wait_for_selector('#ld-selection-carte')
    pg.click('.ld-selection-actions .ld-btn-or'); pg.wait_for_selector('.ld-rencontre')
    attendre_piste(pg, 'enquete')
    pg.click('.ld-rencontre .ld-btn-or'); pg.wait_for_selector('#ld-declaration')
    attendre_piste(pg, 'deposition')
    pg.wait_for_timeout(1200)
    assert pg.evaluate(ACTIVES) == 1, pg.evaluate("window.__audio")
    ok('fiche → boucle « enquête », déposition → boucle « déposition », une seule à la fois')
    pg.click('.ld-outil:has-text("Réseaux")'); attendre_piste(pg, 'enquete')
    pg.click('#ld-reseaux .ld-vignette >> nth=0'); pg.wait_for_selector('#ld-piece')
    pg.evaluate("history.back()"); pg.evaluate("history.back()")
    attendre_piste(pg, 'deposition')
    pg.wait_for_timeout(1200)
    assert pg.evaluate(ACTIVES) == 1
    ok('réseaux ouverts → enquête, refermés → déposition (fondu, jamais deux boucles)')
    # Accents : précision (indice), objection ratée, objection réussie (objection + percée).
    avant = pg.evaluate("window.__audio.sources.length")
    pg.click('#ld-preciser'); pg.wait_for_timeout(500)
    pg.evaluate("ld.partie.dossier.pieces.forEach(x => LuxDemasqueCore.consulter(ld.partie, x)); for (let i = 0; i < 6; i++) LuxDemasqueCore.allerA(ld.partie, i); LuxDemasqueCore.allerA(ld.partie, 3); ldMajDeposition()")
    pg.evaluate("ldPresenter('PIX_KYOTO')"); pg.wait_for_selector('#ld-verdict'); pg.click('#ld-verdict .ld-btn')
    pg.evaluate("ldPresenter('LUXRUN_AOUT')"); pg.wait_for_selector('#ld-verdict'); pg.wait_for_timeout(600)
    # Comparer les durées réelles avec tolérance : 0,75 s s'arrondit à 0,8 s
    # en Python, donc une égalité à 0,7 s produit un faux négatif.
    durees = sorted(s['duree'] for s in pg.evaluate("window.__audio.sources")[avant:] if not s['boucle'])
    for d in (0.75, 0.9, 1.7, 5.5):  # indice, raté, objection, percée
        assert any(abs(mesuree - d) <= 0.06 for mesuree in durees), (d, durees)
    assert pg.evaluate(ACTIVES) == 1
    ok('accents : indice (précision), raté, objection + percée ; la boucle continue dessous')
    pg.click('#ld-verdict .ld-btn')
    # Réglages : Musique coupée = plus de boucle, effets gardés ; rétablie = boucle de retour.
    pg.evaluate("ldMenu()"); pg.click('.ld-reglage:has-text("Musique")')
    attendre_piste(pg, None)
    pg.click('.ld-reglage:has-text("Musique")'); attendre_piste(pg, 'deposition')
    pg.evaluate("ldFermerCalque('ld-menu')")
    ok('réglage Musique : coupe puis relance la boucle, mémorisé')
    # Arrière-plan : contexte suspendu ; retour : repris.
    pg.evaluate("Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'))")
    pg.wait_for_function("LuxDemasqueSon.contexte().state === 'suspended'")
    pg.evaluate("Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange'))")
    pg.wait_for_function("LuxDemasqueSon.contexte().state === 'running'")
    ok('arrière-plan : son suspendu, repris au retour')
    # Fin du dossier : silence + jingle.
    pg.evaluate("LuxDemasqueCore.allerA(ld.partie, 0); ldMajDeposition(); ldPresenter('PRO_PROFIL')"); pg.wait_for_selector('#ld-verdict'); pg.click('#ld-verdict .ld-btn')
    pg.evaluate("LuxDemasqueCore.allerA(ld.partie, 1); ldMajDeposition(); ldPresenter('AMIS_SAMI')"); pg.wait_for_selector('#ld-verdict'); pg.click('#ld-verdict .ld-btn')
    pg.wait_for_selector('.ld-bilan'); attendre_piste(pg, None)
    pg.wait_for_timeout(600)
    assert 3.4 in [round(s['duree'], 1) for s in pg.evaluate("window.__audio.sources") if not s['boucle']]
    ok('bilan : musique arrêtée, jingle « dossier résolu »')
    # Quitter, Lux Match puis Lux Démasque : jamais deux boucles.
    pg.evaluate("ldQuitter()"); pg.wait_for_timeout(700)
    assert pg.evaluate(ACTIVES) == 0
    pg.evaluate("JEUX_DISPONIBLES.luxMatch = true; ouvrirLuxMatch(); 0"); pg.wait_for_selector('.lm-profil', timeout=40000)
    pg.wait_for_function("LuxMatchSon.pistEnCours() === 'pre'", timeout=15000); pg.wait_for_timeout(1200)
    pg.evaluate("ouvrirJeux()"); pg.evaluate("ouvrirLuxDemasque()"); pg.wait_for_selector('.ld-rencontre')
    attendre_piste(pg, 'enquete'); pg.wait_for_timeout(1500)
    assert pg.evaluate("LuxMatchSon.pistEnCours()") is None
    assert pg.evaluate(ACTIVES) == 1, pg.evaluate("window.__audio.sources.filter(s => s.boucle)")
    assert pg.evaluate("window.__audio.contextes") <= 2  # un pour chaque jeu, jamais recréé
    ok('Lux Match puis Lux Démasque : une seule boucle, contextes jamais recréés')
    assert not erreurs, erreurs
    b.close()

    # Fichiers audio absents : aucun plantage, le jeu reste jouable.
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg = b.new_context(viewport={'width': 360, 'height': 740}).new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/audio/lux-demasque/**', lambda r: r.abort())
    pg.route('**/*gstatic*/**', lambda r: r.abort()); pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(URL); pg.wait_for_selector('#today')
    pg.evaluate("ouvrirLuxDemasque()"); pg.wait_for_selector('.ld-rencontre')
    pg.click('.ld-rencontre .ld-btn-or'); pg.wait_for_selector('#ld-declaration')
    pg.click('#ld-preciser'); pg.wait_for_timeout(800)
    assert pg.evaluate("LuxDemasqueSon.pisteEnCours()") is None and not erreurs, erreurs
    ok('audio indisponible : silence, aucune erreur, jeu jouable')
    b.close()
