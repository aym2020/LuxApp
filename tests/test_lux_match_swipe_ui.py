"""SPEC111 : composition responsive et conservation des interactions du swipe Lux Match."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from helpers import URL, ok

DIR=Path('artifacts/lux-match-swipe')
DIR.mkdir(parents=True,exist_ok=True)
def ouvrir_carte(browser,width,height,fr=False,motion='no-preference'):
    ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=True,has_touch=True,reduced_motion=motion)
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.route('**/fonts.googleapis.com/**',lambda route:route.abort())
    page.route('**/*gstatic*/**',lambda route:route.abort())
    page.goto(URL)
    page.wait_for_selector('#today')
    page.evaluate('''() => { JEUX_DISPONIBLES.luxMatch = true; ouvrirLuxMatch(); }''')
    page.wait_for_selector('.lm-profil',timeout=45000)
    page.evaluate('''() => {
      lmCommencerSwipes();
      lm.partie.paquet=['lena_r01','claire_r01','noemie_r01','maya_r01','sofia_r01','emma_r01'];
      lm.partie.indexCarte=0;lm.partie.aimes=[];lm.partie.likesAvantMatch=99;
      lm.aideFr=false;lmRendre();
    }''')
    page.wait_for_selector('#lm-carte')
    if fr:
        page.evaluate('lmBasculerAide()')
    return ctx,page,errors

with sync_playwright() as p:
    browser=p.chromium.launch()
    for width,height in [(320,600),(360,740),(393,852),(430,932),(720,900)]:
        ctx,page,errors=ouvrir_carte(browser,width,height)
        measures=page.evaluate('''() => {
          const q=s=>document.querySelector(s),a=q('#lm-carte').getBoundingClientRect(),
          pass=q('.lm-swipe-boutons .lm-non').getBoundingClientRect(),
          like=q('.lm-swipe-boutons .lm-oui').getBoundingClientRect();
          return {overflow:document.documentElement.scrollWidth-innerWidth,
            cardWidth:a.width,cardHeight:a.height,
            passW:pass.width,passH:pass.height,likeW:like.width,likeH:like.height,
            buttonsEnd:Math.max(pass.bottom,like.bottom),viewH:innerHeight,
            logos:q('.lm-top .lm-logo')?1:0,duplicate:document.querySelectorAll('.lm-app-titre').length,
            image:!!q('.lm-carte-visuel .lm-carte-photo'),
            lu:!!q('.lm-carte-infos .lm-lu'),
            tags:document.querySelectorAll('.lm-carte-infos .lm-tags span').length,
            pile:!!q('.lm-carte-pile-suivante'),
            text:q('.lm-swipe-progression').textContent};
        }''')
        assert measures['overflow']<=1,(width,measures)
        assert measures['cardWidth']>=250 and measures['cardHeight']>220,(width,measures)
        assert min(measures['passW'],measures['likeW'])>=44 and min(measures['passH'],measures['likeH'])>=44,measures
        assert measures['logos']==1 and measures['duplicate']==0,measures
        assert measures['image'] and measures['lu'] and measures['tags']==3 and measures['pile'],measures
        assert measures['text']=='PROFIL 1 / 6',measures
        if width==360 and height==740:
            # FR off : commandes attendues visibles sans scroll au format principal.
            assert measures['buttonsEnd']<=height+3,measures
        if width in (360,393):
            page.screenshot(path=str(DIR/f'after-{width}x{height}-fr-off.png'),full_page=True)
        assert not errors,(width,errors)
        ok(f'{width}×{height} : géométrie, portrait et boutons')
        ctx.close()

    ctx,page,errors=ouvrir_carte(browser,360,740,fr=True)
    assert page.locator('.lm-carte-infos .lm-fr').count()>=2
    assert page.locator('.lm-carte-infos .lm-tags small').count()>=1
    # Le contenu FR occupe la place nécessaire mais ne doit pas repousser
    # les commandes sous le premier écran 360×740 en taille de texte normale.
    fr_buttons_end=page.evaluate("Math.max(...[...document.querySelectorAll('.lm-swipe-boutons button')].map(e=>e.getBoundingClientRect().bottom))")
    assert fr_buttons_end<=740+3,fr_buttons_end
    page.screenshot(path=str(DIR/'after-360x740-fr-on.png'),full_page=True)
    before=page.evaluate('lm.partie.indexCarte')
    page.evaluate('lmBasculerAide()')
    assert page.evaluate('lm.partie.indexCarte')==before
    assert page.locator('.lm-carte-infos .lm-fr').count()==0
    page.locator('.lm-swipe-boutons .lm-non').click()
    page.wait_for_function('lm.partie.indexCarte === 1')
    assert page.locator('.lm-swipe-progression').inner_text()=='PROFIL 2 / 6'
    assert not errors,errors
    ok('FR on/off, données conservées, bouton PASSER, progression')
    ctx.close()

    ctx,page,errors=ouvrir_carte(browser,320,600,fr=True)
    page.locator('.lm-swipe-boutons .lm-oui').scroll_into_view_if_needed()
    assert page.locator('.lm-swipe-boutons .lm-oui').is_visible()
    assert not errors,errors
    ok('petit viewport + FR : actions accessibles sans découpe')
    ctx.close()

    ctx,page,errors=ouvrir_carte(browser,360,740,motion='reduce')
    assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    assert not errors,errors
    ok('mouvement réduit : profil fonctionnel')
    ctx.close()
    browser.close()
