"""SPEC 107 — Défis et Chemin, vrai DOM Chromium 320 / 390 / 430 px."""
from playwright.sync_api import sync_playwright
from helpers import URL, masquer_regles_vies

with sync_playwright() as p:
    browser=p.chromium.launch()
    for width in (320,390,430):
        context=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
        pg=context.new_page()
        errors=[]
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.route('**/*gstatic*/**',lambda route:route.abort())
        pg.route('**/fonts.googleapis.com/**',lambda route:route.abort())
        pg.goto(URL)
        pg.wait_for_selector('#today')
        masquer_regles_vies(pg)
        pg.evaluate("""() => {
          choisirNiveau('A1.2');
          [1,2,3].forEach((u,i) => saveUnitBest(27,u,i===2?88:95));
          saveValideeMission(27);
          marquerIntroMissionVue(27);
          cheminLeconOuverte=27;
          goLessons();renderLessons();
        }""")
        s='#chemin-lecon-27'
        assert pg.locator(s+' .unites li.bilan').count()==0
        assert '12 nouveaux défis' in pg.locator(s+' .chemin-defis-info').inner_text()
        assert pg.locator(s+' .btn-jaune').inner_text().strip()=='Découvrir les défis'
        assert pg.locator(s+' .chemin-ameliorer').count()==1
        assert pg.evaluate('document.documentElement.scrollWidth')<=width
        saved=pg.evaluate('JSON.stringify(getProgress()[27].unites)')
        pg.locator(s+' .btn-jaune').click()
        assert pg.locator('#view-session.active').count()==1
        assert pg.evaluate('session.questions.length')==4
        assert pg.evaluate('session.questions.every(x => x.q.defiInedit)')
        for _ in range(4):
            pg.evaluate("""() => {
              const q=session.questions[session.index].q;
              [...document.querySelectorAll('#session-choices .choice')]
                .find(x=>x.textContent===q.reponse).click();
            }""")
            pg.click('#session-suivante')
        assert pg.locator('#session-result').is_visible()
        pg.locator('#session-actions button').filter(has_text='Mon chemin').click()
        assert '8 nouveaux défis' in pg.locator(s+' .chemin-defis-info').inner_text()
        assert pg.evaluate('JSON.stringify(getProgress()[27].unites)')==saved
        pg.evaluate("""() => {
          const l=lecons.find(x=>x.id===27);
          const store=getStatsStore();
          (store[27] ||= {});
          (store[27].quiz ||= {});
          poolDefisLecon(l).forEach(i=>{
            store[27].quiz[i.qid] ||= {
              attempts:1,correct:1,wrongTotal:0,correctStreak:1,
              lastSeenAt:new Date().toISOString()
            };
          });
          saveStatsStore(store);
          cheminLeconOuverte=27;goLessons();renderLessons();
        }""")
        assert 'Tous les défis découverts' in pg.locator(s+' .chemin-defis-info').inner_text()
        assert pg.locator(s+' .btn-jaune').inner_text().strip()=='Réviser mes acquis'
        pg.locator(s+' .btn-jaune').click()
        assert pg.locator('#view-session.active').count()==1
        assert pg.evaluate('session.questions.every(x => x.leconId===27)')
        pg.evaluate('cheminLeconOuverte=27;goLessons();renderLessons()')
        pg.locator(s+' .lien-or').click()
        assert pg.locator('#view-plecon.active').count()==1
        assert pg.locator('#pl-units .pl-bilan').count()==1
        assert pg.evaluate('JSON.stringify(getProgress()[27].unites)')==saved
        assert not errors,errors
        print('OK SPEC 107 '+str(width)+'px : compteur, révision directe, étoiles intactes, bilan')
        context.close()
    browser.close()
