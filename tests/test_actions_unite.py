"""SPEC 108 — Actions d'unité tactiles, accessibles et sans régression de scores."""
from playwright.sync_api import sync_playwright
from helpers import URL, masquer_regles_vies

PREPARER = """() => {
  choisirNiveau('A1.2');
  saveUnitBest(20, 1, 95);
  saveUnitBest(20, 2, 88);
  const l=lecons.find(x=>x.id===20);
  const q=l.quiz.find(x=>x.unite===1);
  if (!q) throw Error('Quiz de l unité 1 absent');
  incrementWrongCount(20, 'quiz', q.id);
  openParcoursLecon(l);
}"""

with sync_playwright() as playwright:
  browser=playwright.chromium.launch()
  for width,percent in ((320,100),(360,100),(390,100),(430,100),(720,100),(360,130),(390,200)):
    ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=(width<720),has_touch=(width<720))
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.route('**/*gstatic*/**',lambda route:route.abort())
    page.route('**/fonts.googleapis.com/**',lambda route:route.abort())
    page.goto(URL)
    page.wait_for_selector('#today')
    masquer_regles_vies(page)
    if percent != 100:
      page.add_style_tag(content='html {font-size: %d%%}' % percent)
    page.evaluate(PREPARER)
    a=page.locator('#pl-unite-1 .pl-revoir-erreurs.pl-action-unite')
    b=page.locator('#pl-unite-2 .pl-gagner-etoile.pl-action-unite')
    assert a.count()==1 and b.count()==1, (width,percent,'buttons missing')
    assert 'Questions difficiles · étoiles conservées' in a.inner_text()
    assert '88 % → 90 % · Défi ciblé' in b.inner_text()
    assert a.get_attribute('onclick')=='lancerRevisionErreursUnite(1)'
    assert b.get_attribute('onclick')=='lancerRattrapageEtoile(2)'
    checks=page.evaluate("""() => [...document.querySelectorAll('#pl-unite-1 .pl-action-unite, #pl-unite-2 .pl-action-unite')].map(el=>{
      const rect=s=>el.querySelector(s).getBoundingClientRect(),b=el.getBoundingClientRect();
      return {width:b.width,height:b.height,left:b.left,right:b.right,
        icon:rect('.pl-action-icone').toJSON(),
        title:rect('.pl-action-titre').toJSON(),
        desc:rect('.pl-action-sous-texte').toJSON(),
        chevron:rect('.pl-action-chevron').toJSON(),
        style:getComputedStyle(el).flexDirection,
        border:getComputedStyle(el).borderColor
      };
    })""")
    for i in checks:
      assert i['height']>=75.5,(width,percent,i)
      assert i['left']>=0 and i['right']<=width+1,(width,percent,i)
      assert i['style']=='row',(width,percent,i)
      assert i['icon']['right']<=i['title']['left']+1,(width,percent,i)
      assert i['title']['right']<=i['chevron']['left']+1,(width,percent,i)
      assert i['desc']['right']<=i['chevron']['left']+1,(width,percent,i)
    assert page.evaluate('document.documentElement.scrollWidth')<=width,(width,percent)
    if width==390 and percent==100:
      first=page.evaluate('JSON.stringify(getProgress()[20].unites)')
      b.click()
      assert page.evaluate('loadRun(true).mode')=='rattrapage'
      assert page.evaluate('JSON.stringify(getProgress()[20].unites)')==first
      page.evaluate("""() => {clearRun(true);openParcoursLecon(lecons.find(x=>x.id===20))}""")
      page.locator('#pl-unite-1 .pl-revoir-erreurs.pl-action-unite').click()
      assert page.evaluate('loadRun(true).mode')=='erreurs'
      assert page.evaluate('JSON.stringify(getProgress()[20].unites)')==first
    assert not errors,errors
    print('OK SPEC 108: %d px, texte %d%%' % (width,percent),flush=True)
    ctx.close()
  browser.close()
