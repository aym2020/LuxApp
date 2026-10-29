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
  // Versions d'assets : on vérifie le chargement, pas le numéro (il change à chaque livraison).
  assert.match(html,/href="exercices-v21\.css\?v=[^"]+"/);
  // SPEC 94 : le style du bandeau de correction est commun, chargé après exercices-v21.css.
  assert.match(html,/href="exercices-v21\.css\?v=[^"]+" \/>\s*<link rel="stylesheet" href="feedback-unifie\.css\?v=[^"]+"/);
  assert.match(css,/#view-session \.question-card/);
  assert.match(css,/#view-parcours #pc-choix\.pc-choix-grille/);
  assert.doesNotMatch(css,/#view-dashboard|#view-lessons|#view-examen\b/);
});
test('ordre conservé, sans écran flashcards supplémentaire',()=>{
  for(const label of ["Mot caché","Quiz","Trous","Écriture"])assert.ok(parcours.includes("label: '"+label+"'"));
});
test('correction accessible et passage manuel',()=>{
  // SPEC 94/95 : un seul rendu (renderFeedbackCommun) dans les deux vues ;
  // le bouton manuel est dans le pied d'action (renderActionExercice), jamais dans la correction.
  assert.match(app,/renderFeedbackCommun\(feedback, \{/);
  assert.match(app,/renderActionExercice\(document\.getElementById\('session-action-dock'\), actionSuivante\(\)\)/);
  assert.match(parcours,/renderFeedbackCommun\(feedback, fb\)/);
  assert.match(parcours,/renderActionExercice\(document\.getElementById\('pc-action-dock'\),\s*\{ id: 'pc-continuer', label: 'Continuer', onClick: continuerParcours \}\)/);
  assert.match(html,/id="pc-feedback" role="status" aria-live="polite"/);
  assert.doesNotMatch(parcours.slice(parcours.indexOf('function choisirP('),parcours.indexOf('let ecrEssais')),/setTimeout\(reussir/);
});
test('écriture : champ libellé, validation inchangée',()=>{
  assert.match(html,/for="session-input">Ta réponse<\/label>/);
  assert.match(html,/id="session-feedback"[\s\S]*aria-live="polite"/);
  // SPEC 95 : « Valider » est le bouton du pied d'action, même action validateSessionInput.
  assert.match(app,/renderActionExercice\(dock, \{ id: 'session-input-btn', label: 'Valider', onClick: validateSessionInput \}\)/);
  assert.match(html,/id="session-action-dock" class=|class="exo-action-dock" id="session-action-dock"/);
});

// Recette statique du clavier : un seul mécanisme, celui de ui.js (SPEC 87).
test('écriture compacte, auto-extensible, sans clavier imposé sur tactile',()=>{
  const ui=read('ui.js');
  assert.match(html,/id="session-input"[\s\S]*rows="1"/);
  assert.match(css,/min-height:70px;height:70px;max-height:150px/);
  assert.match(html,/src="app\.js\?v=\d+"/);
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
  assert.match(css,/#view-session \.lecon-header \{width:100%;max-width:var\(--layout-focus\);margin-inline:auto;flex-shrink:0\}/);
  assert.match(html,/<div id="view-session" class="view exo-shell">[\s\S]*?class="back-btn" data-retour onclick="retour\(\)"/);
});

test('Mot caché : bandeau court, bottom sheet et touches visibles',()=>{
 const s=read('exercices-v21.css'),code=read('parcours.js');
 assert.match(code,/id="mc-aide-dialog" class="mc-aide-dialog"/);
 assert.match(code,/id="mc-erreur" role="status" aria-live="polite"/);
 assert.match(code,/function mcOuvrirAide\(\)/);
 assert.match(code,/d\.showModal\(\)/);
 assert.match(code,/Voir l’aide/);
 assert.match(code,/Score des lettres/);
 assert.match(code,/mc-aide-detail[\s\S]*id="mc-btn-voir"/);
 // SPEC 95 : un seul défilement (.exo-scroll) ; Effacer, Indice, Valider dans le pied.
 assert.match(code,/id: 'mc-btn-valider', label: 'Valider', onClick: mcValider/);
 assert.match(code,/id: 'mc-btn-effacer'[\s\S]*id: 'mc-btn-indice'/);
 assert.match(s,/\.mc-aide-dialog\[open\] \{display:flex;flex-direction:column/);
 assert.match(html,/src="parcours\.js\?v=\d+"/);
});
