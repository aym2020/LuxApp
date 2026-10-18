"""Spec 47 : leçon repliée avec « À rafraîchir · N ». Le titre garde la
1re ligne (2 lignes max, jamais écrasé) ; la pastille passe dessous. Sans
pastille, la carte reste compacte. Toutes les leçons, 320 à 430 px, texte
normal et agrandi (125 %), leçons terminées ou non."""
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
    const t = carte.querySelector('.titre'), p = carte.querySelector('.pastille-fraicheur');
    const ct = carte.getBoundingClientRect(), rt = t.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(t).lineHeight);
    const rn = carte.querySelector('.num').getBoundingClientRect();
    const r = { id: li.id, titre: t.textContent, largeurTitre: rt.width, largeurCarte: ct.width, memeLigne: Math.abs((rn.top + rn.bottom) / 2 - (rt.top + rt.bottom) / 2) < lh,
        lignes: Math.round(rt.height / lh), hauteur: ct.height, deborde: t.scrollWidth > t.clientWidth + 1 };
    if (p) { const rp = p.getBoundingClientRect();
        Object.assign(r, { pastilleSous: rp.top >= rt.bottom - 1 || rp.top >= rt.top + rt.height - 1, pastilleDedans: rp.right <= ct.right + 0.5 && rp.left >= ct.left - 0.5 }); }
    return r;
}).filter(Boolean)"""


with sync_playwright() as p:
    b = p.chromium.launch()
    erreurs = []
    for zoom in (1.0, 1.25):
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
                    assert m['lignes'] <= 2, ('titre sur plus de 2 lignes', m['lignes'], contexte)
                    # Le titre a de la place : au moins 40 % de la carte (avant : quelques caractères)
                    assert m['largeurTitre'] >= 0.4 * m['largeurCarte'], ('titre écrasé', m['largeurTitre'], m['largeurCarte'], contexte)
                    if 'pastilleSous' in m:
                        assert m['pastilleSous'] and m['pastilleDedans'], ('pastille mal placée', m, contexte)
                    elif m['id'] in sans:
                        # Carte sans pastille : même hauteur qu'avant (pas de ligne vide)
                        assert abs(m['hauteur'] - sans[m['id']]['hauteur']) < 1.5 or 'acquise' in m['titre'], ('hauteur changée', m, sans[m['id']], contexte)
                if zoom == 1.0 and largeur >= 390:
                    # Écran courant : la carte reste compacte (numéro et titre sur la même ligne)
                    assert all(m['memeLigne'] for m in avec), [m for m in avec if not m['memeLigne']]
                if largeur == 360 and niveau == 'A1.1':
                    pg.screenshot(path=OUT + 'spec47-chemin-%d.png' % int(zoom * 100))
                ctx.close()
        ok('zoom %d %% : 320 / 360 / 390 / 430 px, A1.1 et A1.2 — titres lisibles (2 lignes max, jamais écrasés), '
           'pastille « À rafraîchir » sous le titre et dans la carte, cartes sans pastille inchangées' % int(zoom * 100))
    b.close()

print()
print('Erreurs JavaScript :', erreurs or 'aucune')
if erreurs:
    raise SystemExit(1)
