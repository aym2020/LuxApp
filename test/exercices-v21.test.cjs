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
  assert.match(html,/href="exercices-v21\.css\?v=7"/);
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
  assert.match(parcours,/showFeedback\(true, 'Juste !', note/);
  assert.doesNotMatch(parcours.slice(parcours.indexOf('function choisirP('),parcours.indexOf('let ecrEssais')),/setTimeout\(reussir/);
});
test('écriture : champ libellé, validation inchangée',()=>{
  assert.match(html,/for="session-input">Ta réponse<\/label>/);
  assert.match(html,/id="session-feedback"[\s\S]*aria-live="polite"/);
  assert.match(html,/id="session-input-btn" onclick="validateSessionInput\(\)">Valider<\/button>/);
});

// Recette statique du clavier : un seul mécanisme, celui de ui.js (SPEC 87).
test('écriture compacte, auto-extensible, sans clavier imposé sur tactile',()=>{
  const ui=read('ui.js');
  assert.match(html,/id="session-input"[\s\S]*rows="1"/);
  assert.match(css,/min-height:70px;height:70px;max-height:150px/);
  assert.match(html,/src="app\.js\?v=6"/);
  assert.match(html,/src="ui\.js\?v=\d+"/);
  assert.match(css,/#view-session \.ecr-input-wrap \{gap:12px;margin-top:26px\}/);
  assert.match(app,/window\.matchMedia\('\(hover: hover\) and \(pointer: fine\)'\)\.matches/);
  assert.match(parcours,/Math\.min\(150, Math\.max\(70, input\.scrollHeight\)\)/);
  // Le champ d'entraînement passe par body.clavier-actif comme le parcours…
  assert.match(ui,/CHAMPS_EXERCICE = '[^']*#session-input[^']*'/);
  assert.match(ui,/#view-session\.active/);
  assert.match(ui,/#view-examen\.active/);
  assert.match(css,/body\.clavier-actif #view-session\.active \{/);
  // …et l'ancien mécanisme concurrent a disparu.
  assert.doesNotMatch(app,/cadrerSaisieSession/);
  assert.doesNotMatch(css,/session-body:focus-within/);
});

test('une phrase complète reçoit un corps réduit, sans changer le texte',()=>{
  assert.match(app,/\(q\.fr \|\| ''\)\.length > 42/);
  assert.match(css,/#view-session\[data-type="ecriture"\] \.question-word\.question-longue/);
});

test('retour de S’entraîner collé au bord gauche comme les autres vues',()=>{
  assert.match(css,/#view-session \.lecon-header \{width:100%;max-width:500px;margin-inline:auto;flex-shrink:0\}/);
  assert.match(html,/<div id="view-session" class="view">[\s\S]*?class="back-btn" data-retour onclick="retour\(\)"/);
});
