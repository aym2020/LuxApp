"""SPEC 114 : vraies entrées des 24 vues et panneaux, sans HTML de substitution."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LECON = "const l=lecons.find(x=>x.id===1);"
PREPARER = LECON + "openParcoursLecon(l,null,true);"
VUES = {
    'dashboard': 'goDashboard()',
    'lessons': 'goLessons()',
    'plecon': PREPARER,
    'lecon': LECON + 'openLecon(l)',
    'msintro': LECON + 'ouvrirIntroMission(l)',
    'pintro': PREPARER + 'openIntro(1)',
    'decouverte': 'pLecon=lecons.find(x=>x.id===0);demarrerDecouverte(1)',
    'parcours': PREPARER + 'startEtapeSeule(1,"quiz")',
    'mission': PREPARER + 'marquerIntroMissionVue(l.id);openMission(true)',
    'pfin': 'await recLancer({lecon:1,ecran:"etape",scenario:"sans-faute"})',
    'review-setup': 'openReviewSetup()',
    'session': 'marquerLeconVue(1);startSession("review")',
    'lexique': 'openLexique()',
    'pieges': 'openPieges()',
    'plus': 'ouvrirPlus()',
    'reglages': 'openReglages()',
    'examens': 'choisirNiveau("A1.2");openExamens()',
    'examen': 'choisirNiveau("A1.2");openExamens();startExamen(examens.find(x=>x.niveau==="A1.2").id)',
    'examen-result': 'recJouerExamen(examens.find(x=>x.niveau==="A1.2"),{taux:.7})',
    'jeux': 'marquerLeconVue(1);marquerLeconVue(2);ouvrirJeux()',
    'survie': 'marquerLeconVue(1);demarrerSurvie()',
    'runner': 'marquerLeconVue(2);ouvrirRunner()',
    'luxmatch': 'JEUX_DISPONIBLES.luxMatch=true;await ouvrirLuxMatch()',
    'luxdemasque': 'await ldOuvrirSelection()',
}
AUTRES = {
    'cours': ('parcours', PREPARER + 'startEtapeSeule(1,"quiz");ouvrirCoursExercice()', '.cp-feuille'),
    'selection-lecons': ('review-setup', 'openReviewSetup();ouvrirSelectionLecons()', '.rs-v21-sheet'),
    'scenario-mission': ('plecon', PREPARER + 'voirScenario()', '.ms-v21-dialogue'),
    'survie-resultat': ('survie', LECON + 'recJouerSurvie(l,{temps:true})', '.survie-fin'),
    'redflag-rencontre': ('luxdemasque', 'await ouvrirLuxDemasque("MILO_001")', '.ld-rencontre'),
    'redflag-deposition': ('luxdemasque', 'await ouvrirLuxDemasque("MILO_001");ldCommencer()', '.ld-depo'),
    'redflag-reseaux': ('luxdemasque', 'await ouvrirLuxDemasque("MILO_001");ldCommencer();ldReseaux("pix")', '#ld-reseaux'),
    'redflag-carnet': ('luxdemasque', 'await ouvrirLuxDemasque("MILO_001");ldCommencer();ldCarnet()', '#ld-carnet'),
    'redflag-bilan': ('luxdemasque', 'await ouvrirLuxDemasque("MILO_001");ldCommencer();ldConclure(true)', '.ld-bilan'),
}
SONDES = ['.accueil','.chemin-page','.pl-page','.pc-topbar','.lecon-header',
    '.session-body','.pc-body','.exo-action-dock','.cta-fixe','.nav-bas',
    '.jeux-hub','.survie-jeu','.runner-jeu','.lm-jeu','.ld-jeu','.ld-selection',
    '.ld-top','.ld-depo','.ld-fenetre','.panneau','.cp-feuille','.rs-v21-sheet',
    '.ms-v21-dialogue','.msi-page','.pi-page','.ms-body','.ms-saisie','.plus-page']


def preparer(page, url):
    page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    page.route('**/*gstatic*/**', lambda r: r.abort())
    page.goto(url)
    page.wait_for_selector('#today')
    page.wait_for_function('typeof examens!=="undefined" && examens.length>0')
    # Réutilise uniquement les fonctions de préparation, pas l'habillage MODE TEST.
    source = (ROOT/'recette/recette.js').read_text().split('// ─── BADGE « MODE TEST »')[0]
    page.add_script_tag(content=source)
    page.evaluate('recRepartirDeZero(lecons.find(x=>x.id===1))')


def ouvrir(page, nom, extras=False):
    vue, action, cible = AUTRES[nom] if extras else (nom, VUES[nom], None)
    page.evaluate('fermerPanneau();fermerCours();fermerSelectionLecons(false);fermerClavier();ouvrirJeux();goDashboard();finAppuiNavigation()')
    page.evaluate('async () => {' + action + '}')
    page.wait_for_selector('#view-'+vue+'.active', timeout=15000)
    if cible:
        page.locator(cible).last.wait_for(state='visible', timeout=10000)
    page.evaluate('document.fonts.ready')
    if nom == 'luxdemasque':
        # La photographie est composée de façon asynchrone : le placeholder M
        # n'est pas un comparatif visuel suffisant du téléphone approuvé.
        page.locator('#ld-selection-carte .ld-selection-image.ld-image-prete').wait_for(timeout=20000)
    # Les classes d'arrivée de l'accueil ont un délai : deux frames seules
    # peuvent photographier le hero encore transparent. Attendre les animations
    # finies sans bloquer sur les boucles décoratives ou le canvas des jeux.
    page.evaluate("""() => Promise.all(document.querySelector('.view.active')
        .getAnimations({subtree:true}).filter(a=>a.effect.getTiming().iterations!==Infinity)
        .map(a=>a.finished.catch(()=>{})))""")
    # Attend deux frames de layout sans imposer de délai de jeu ou d'animation.
    page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')


def mesurer(page, nom):
    return page.evaluate("""([nom,sondes]) => {
        const rect=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {
            x:+r.x.toFixed(2),y:+r.y.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2),
            bottom:+r.bottom.toFixed(2),maxWidth:s.maxWidth,padding:s.padding,position:s.position,
            overflowX:s.overflowX,overflowY:s.overflowY,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth};};
        const vue=document.querySelector('.view.active'), visibles=sel=>[...document.querySelectorAll(sel)]
            .filter(e=>e.getClientRects().length && getComputedStyle(e).visibility!=='hidden');
        const elements={};for(const s of sondes){const es=visibles(s);if(es.length)elements[s]=es.map(rect);}
        return {nom,vue:vue.id,viewport:[innerWidth,innerHeight],shell:rect(vue),elements,
            overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
            boutons:visibles('.view.active button,.cp:not(.hidden) button,.panneau button').map(e=>({
                label:e.getAttribute('aria-label')||e.innerText, ...rect(e)})),
            texte:vue.innerText.slice(0,160)};
    }""", [nom, SONDES])
