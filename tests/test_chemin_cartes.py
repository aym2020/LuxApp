"""Specs 47 et 48 : leçon repliée en grille commune. Ligne 1 : numéro, titre
(plusieurs lignes possibles, jamais écrasé ni coupé), chevron en haut à droite ;
ligne 2 (statut, « N questions à réviser ») seulement si utile, sous le titre et
dans la carte. Sans 2e ligne, la carte reste compacte. Surfaces neutres (pas de
couleur propre à la leçon). Toutes les leçons, 320 à 430 px, texte 100, 130 et
200 %, leçons terminées ou non."""
import os
from playwright.sync_api import sync_playwright
from helpers import ok, URL, masquer_regles_vies

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'captures') + '/'
os.makedirs(OUT, exist_ok=True)

# Des questions vues il y a 40 jours et ratées : à rafraîchir tout de suite.
DUS = """ids => ids.forEach(id => {
    const l = lecons.find(x => x.id === id);
    const vieux = new Date(Date.now() - 40 * 86400000).toISOString();
    const qs = (l.quiz || []).slice(0, 4);
    qs.forEach(q => updateQuestionStats(id, 'quiz', q.id, true));
    const store = getStatsStore(), wrong = getWrongStore();
    wrong[id] = { quiz: {} };
    qs.forEach(q => { store[id].quiz[q.id].lastSeenAt = vieux; wrong[id].quiz[q.id] = 1; });
    saveStatsStore(store); saveWrongStore(wrong);
})"""

MESURES = """() => [...document.querySelectorAll('#lecon-list li.replie, #lecon-list li.futur')].map(li => {
    const carte = li.querySelector('.carte-lecon.compacte');
    if (!carte) return null;
    const t = carte.querySelector('.titre'), p = carte.querySelector('.carte-ligne2'), ch = carte.querySelector('.chevron-l');
    const ct = carte.getBoundingClientRect(), rt = t.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(t).lineHeight);
    const rn = carte.querySelector('.num').getBoundingClientRect();
    const r = { id: li.id, titre: t.textContent, largeurTitre: rt.width, largeurCarte: ct.width, memeLigne: Math.abs((rn.top + rn.bottom) / 2 - (rt.top + rt.bottom) / 2) < lh,
        lignes: Math.round(rt.height / lh), hauteur: ct.height, deborde: t.scrollWidth > t.clientWidth + 1,
        fond: getComputedStyle(carte).backgroundImage, couleur: getComputedStyle(carte).backgroundColor };
    const rc = ch.getBoundingClientRect();
    Object.assign(r, { chevronHaut: Math.abs(rc.top - rt.top) < lh, chevronDroite: rc.right <= ct.right && rc.left >= rt.right - 1 });
    if (p) { const rp = p.getBoundingClientRect();
        Object.assign(r, { pastilleSous: rp.top >= rt.bottom - 1, pastilleDedans: rp.right <= ct.right + 0.5 && rp.left >= ct.left - 0.5 && p.scrollWidth <= p.clientWidth + 1 }); }
    return r;
}).filter(Boolean)"""


with sync_playwright() as p:
    b = p.chromium.launch()
    erreurs = []
    for zoom in (1.0, 1.3, 2.0):
        for largeur in (320, 360, 390, 430):
            for niveau in ('A1.1', 'A1.2'):
                ctx = b.new_context(viewport={'width': largeur, 'height': 900}, is_mobile=True, has_touch=True)
                pg = ctx.new_page()
                pg.on('pageerror', lambda e: erreurs.append(str(e)))
                pg.route('**/*gstatic*/**', lambda r: r.abort())
                pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
                pg.goto(URL)
                pg.wait_for_selector('#today')
                masquer_regles_vies(pg)
                pg.evaluate("z => { document.documentElement.style.fontSize = (z * 100) + '%'; }", zoom)
                pg.evaluate("n => { choisirNiveau(n); cheminLeconOuverte = null; }", niveau)

                # Sans pastille : référence
                pg.evaluate("goLessons()")
                sans = {m['id']: m for m in pg.evaluate(MESURES)}
                # Avec pastille sur une leçon sur deux, dont la 2e (cas réel) et une terminée
                ids = pg.evaluate("n => leconsDuNiveau(n).map(l => l.id)", niveau)
                avec_ids = ids[1::2]
                pg.evaluate("ids => { saveUnitBest(ids[0], 1, 100); }", ids)
                pg.evaluate(DUS, avec_ids + [ids[0]])
                pg.evaluate("goLessons()")
                avec = pg.evaluate(MESURES)

                for m in avec:
                    contexte = (m['id'], largeur, zoom, m['titre'])
                    assert not m['deborde'], ('mot coupé faute de largeur', contexte)
                    if zoom < 2:
                        # Le titre a de la place : au moins 40 % de la carte (avant : quelques caractères)
                        assert m['largeurTitre'] >= 0.4 * m['largeurCarte'], ('titre écrasé', m['largeurTitre'], m['largeurCarte'], contexte)
                    assert m['chevronHaut'] and m['chevronDroite'], ('chevron déplacé', m, contexte)
                    assert m['fond'] == 'none', ('teinte propre à la leçon', m, contexte)
                    if 'pastilleSous' in m:
                        assert m['pastilleSous'] and m['pastilleDedans'], ('pastille mal placée', m, contexte)
                    elif m['id'] in sans and 'pastilleSous' not in sans[m['id']]:
                        # Carte sans 2e ligne : même hauteur qu'avant (pas de ligne vide)
                        assert abs(m['hauteur'] - sans[m['id']]['hauteur']) < 1.5, ('hauteur changée', m, sans[m['id']], contexte)
                # Toutes les cartes : même surface neutre
                assert len({m['couleur'] for m in avec}) == 1, {m['couleur'] for m in avec}
                if zoom == 1.0 and largeur >= 390:
                    # Écran courant : la carte reste compacte (numéro et titre sur la même ligne)
                    assert all(m['memeLigne'] for m in avec), [m for m in avec if not m['memeLigne']]
                assert pg.evaluate('document.documentElement.scrollWidth') <= largeur, ('défilement horizontal', largeur, zoom)
                textes = pg.inner_text('#lecon-list')
                assert 'À rafraîchir' not in textes and 'v1' not in textes and 'questions à réviser' in textes, textes[:300]
                if largeur == 360 and niveau == 'A1.1':
                    pg.screenshot(path=OUT + 'spec48-chemin-%d.png' % int(zoom * 100))
                if largeur == 390 and zoom == 1.0:
                    # Navigation pure (déplier, replier, examens) : aucune donnée de progression modifiée
                    avant = pg.evaluate("JSON.stringify([getProgress(), getStatsStore(), getWrongStore()])")
                    for lid in ids[:3]:
                        pg.evaluate("id => basculerLeconChemin(id)", lid)
                    # Sujets d'examen : surfaces neutres, sans pastille ni couleur codée dans la page
                    pg.evaluate("openExamens()")
                    assert pg.locator('#examens-list .ex-carte').count() >= 1
                    assert pg.locator('#examens-list [style], #examens-list .lecon-pill').count() == 0
                    assert pg.evaluate("examColor(70) === examColor(100) && examColor(59) !== examColor(60)")  # vert dès 60 %, rouge en dessous
                    pg.evaluate("goLessons()")
                    assert pg.evaluate("JSON.stringify([getProgress(), getStatsStore(), getWrongStore()])") == avant, 'progression modifiée'
                ctx.close()
        ok('texte %d %% : 320 / 360 / 390 / 430 px, A1.1 et A1.2 — titres entiers, chevron en haut à droite, '
           '2e ligne sous le titre et dans la carte, cartes sans 2e ligne compactes, surfaces neutres, '
           'sujets d\'examen neutres, progression intacte après navigation' % int(zoom * 100))
    b.close()

print()
print('Erreurs JavaScript :', erreurs or 'aucune')
if erreurs:
    raise SystemExit(1)
