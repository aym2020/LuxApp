'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','public');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'), css=read('exercices-v21.css');
const app=read('app.js'), parcours=read('parcours.js');
test('couleurs et UI partagées seulement entre les deux vues d’exercices',()=>{
  assert.match(html,/href="exercices-v21\.css\?v=1"/);
  assert.match(css,/#view-session \.question-card/);
  assert.match(css,/#view-parcours #pc-choix\.pc-choix-grille/);
  assert.doesNotMatch(css,/#view-dashboard|#view-lessons|#view-examen\b/);
});
test('ordre conservé, sans écran flashcards supplémentaire',()=>{
  for(const label of ["Mot caché","Quiz","Trous","Écriture"])assert.ok(parcours.includes("label: '"+label+"'"));
});
test('correction accessible et passage manuel',()=>{
  assert.match(app,/ajouterBoutonSuivante\(feedback\)/);
  assert.match(app,/session-fb-title/);
  assert.match(parcours,/showFeedback\(true, 'Bien vu\.', note/);
  assert.doesNotMatch(parcours.slice(parcours.indexOf('function choisirP('),parcours.indexOf('let ecrEssais')),/setTimeout\(reussir/);
});
test('écriture : champ libellé, validation inchangée',()=>{
  assert.match(html,/for="session-input">Ta réponse<\/label>/);
  assert.match(html,/id="session-feedback"[\s\S]*aria-live="polite"/);
  assert.match(html,/id="session-input-btn" onclick="validateSessionInput\(\)">Valider<\/button>/);
});
