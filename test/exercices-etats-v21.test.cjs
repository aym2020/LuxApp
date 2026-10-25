'use strict';
// LuxApp 2.1 — états des corrections d'exercices (régression du 21/10/2026).
// On exécute les vraies fonctions de parcours.js et app.js sur un faux DOM :
// le test vérifie ce qui est affiché, pas seulement que le code existe.
// node --test test/exercices-etats-v21.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'public');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const parcours = read('parcours.js'), app = read('app.js'), css = read('exercices-v21.css');

// Extrait le texte d'une fonction : de « function nom( » jusqu'à la fonction suivante.
function fonction(source, nom) {
  const debut = source.indexOf('function ' + nom + '(');
  assert.ok(debut >= 0, nom + ' introuvable');
  const fin = source.indexOf('\nfunction ', debut + 10);
  return source.slice(debut, fin);
}

// Faux élément DOM minimal.
function element(id) {
  const el = { id, className: '', innerHTML: '', textContent: '', style: {}, dataset: {}, disabled: false, enfants: [] };
  el.classList = {
    add(...cs) { cs.forEach(c => { if (!this.contains(c)) el.className = (el.className + ' ' + c).trim(); }); },
    remove(...cs) { el.className = el.className.split(/\s+/).filter(x => !cs.includes(x)).join(' '); },
    contains(c) { return el.className.split(/\s+/).includes(c); }
  };
  el.addEventListener = () => {};
  // Le bouton ajouté au bandeau apparaît dans innerHTML, comme dans un vrai DOM.
  el.appendChild = enfant => { el.enfants.push(enfant); el.innerHTML += '<button>' + enfant.textContent + '</button>'; };
  return el;
}

function fauxDom() {
  const ids = {};
  const get = id => ids[id] || (ids[id] = element(id));
  const erreurs = [get('mc-erreur'), get('pc-ecr-erreur')];
  erreurs.forEach(e => { e.className = 'mc-erreur'; e.innerHTML = '<b>Pas encore</b>'; });
  return {
    ids, get, erreurs,
    document: {
      getElementById: get,
      querySelector: () => null,
      createElement: () => element(''),
      querySelectorAll: sel => sel.includes('mc-erreur') ? erreurs : (ids.__choix || [])
    }
  };
}

const escHtml = fonction(app, 'escHtml');
const noteHtml = fonction(app, 'noteHtml');
// SPEC 94 : le bandeau commun est rendu par feedback-unifie.js (vraies fonctions).
const unifie = read('feedback-unifie.js');
const renderFeedbackCommun = fonction(unifie, 'renderFeedbackCommun');
// Pied d'action (SPEC 95) : on enregistre la configuration demandée par le moteur.
function piedEspion(dom) {
  return (dock, config) => { dom.pied = { dock: dock && dock.id, config }; return element(config ? config.id : ''); };
}
const fbAttentionHtml = fonction(unifie, 'fbAttentionHtml');

// Texte visible du bandeau : sans la phrase réservée au lecteur d'écran.
const visible = html => html.replace(/<span class="sr-only">[^<]*<\/span>/, '');

function parcoursAvec(dom, sons) {
  const code = [escHtml, noteHtml, renderFeedbackCommun, fbAttentionHtml,
    fonction(parcours, 'etatExercice'), fonction(parcours, 'showFeedback'),
    fonction(parcours, 'choisirP'),
    'return { showFeedback, choisirP };'].join('\n');
  return new Function('document', 'fermerClavier', 'focusApresClavier', 'enregistrer',
    'attentionItem', 'rappelHtml', 'reussir', 'echouer', 'pAttente', 'pSuite',
    'continuerParcours', 'afficherVerdictChoix', 'jouerFeedbackSon', 'renderActionExercice', 'cadrerFeedback', code)(
    dom.document, () => {}, () => {}, () => {}, item => item.attention || '',
    () => '', () => {}, () => {}, false, null, () => {}, () => {},
    evenement => (sons || []).push(evenement), piedEspion(dom), () => {});
}

test('le titre transmis par le moteur est affiché, dans le bandeau commun (SPEC 94)', () => {
  const dom = fauxDom();
  const p = parcoursAvec(dom);
  p.showFeedback({ etat: 'success', titre: 'Juste, au 2e essai', annonce: 'Juste, au 2e essai.', corpsHtml: '<b>Moien!</b>' }, () => {});
  const fb = dom.get('pc-feedback');
  assert.match(fb.innerHTML, /class="fb-titre"[^>]*>Juste, au 2e essai</);
  assert.doesNotMatch(fb.innerHTML, /Bien vu\.|À retenir/);
  assert.ok(fb.classList.contains('ok') && fb.classList.contains('exo-feedback'));
  // SPEC 95 : aucun bouton dans la correction ; « Continuer » est dans le pied.
  assert.doesNotMatch(fb.innerHTML, /<button/);
  assert.equal(dom.pied.dock, 'pc-action-dock');
  assert.equal(dom.pied.config.id, 'pc-continuer');
  assert.equal(dom.pied.config.label, 'Continuer');
  p.showFeedback({ etat: 'reveal', titre: 'Réponse dévoilée', annonce: 'Réponse dévoilée : Stull', corpsHtml: '<b>Stull</b>' }, () => {});
  assert.match(fb.innerHTML, /Réponse dévoilée/);
  assert.ok(fb.classList.contains('ko') && fb.classList.contains('reveal'));
});

test('la correction finale masque le « Pas encore » du premier essai', () => {
  const dom = fauxDom();
  parcoursAvec(dom).showFeedback({ etat: 'success', titre: '', annonce: 'Bien joué !' }, () => {});
  dom.erreurs.forEach(e => assert.ok(e.classList.contains('hidden'), e.id + ' doit être masqué'));
});

test('parcours : après une erreur, le trou montre la bonne réponse en vert, sans la répéter dans le bandeau', () => {
  const dom = fauxDom();
  dom.ids.__choix = [];
  const sons = [];
  const choisi = element('b');
  choisi.textContent = 'Monsieur';
  parcoursAvec(dom, sons).choisirP(choisi, false, 'Madamm', { attention: 'Madame = <b>Madamm</b>' }, 'trous');
  const fb = dom.get('pc-feedback').innerHTML;
  assert.equal(dom.get('pc-blank').textContent, 'Madamm');
  assert.equal(dom.get('pc-blank').style.color, 'var(--correct)');
  assert.match(fb, /Madame = <b>Madamm<\/b>/);
  // SPEC 95 : ni « Pas encore » ni « Bonne réponse » visibles (choix rouge/vert) ; le verdict est annoncé.
  assert.doesNotMatch(visible(fb), /Bonne réponse|Pas encore|<button/);
  assert.equal(dom.pied.config.label, 'Continuer');
  assert.match(fb, /sr-only">Pas encore\. Ton choix : Monsieur\. Bonne réponse : Madamm\./);
  assert.deepEqual(sons, ['finalFailure']);
});

test('entraînement : trou vert, même bandeau, gras rendu (pas de <b> littéral)', () => {
  const dom = fauxDom();
  const fb = dom.get('session-feedback');
  const code = [escHtml, noteHtml, renderFeedbackCommun, fbAttentionHtml, fonction(app, 'attentionDe'),
    fonction(app, 'handleSessionChoice'), fonction(app, 'actionSuivante'), 'return handleSessionChoice;'].join('\n');
  dom.ids['session-action-dock'] = element('session-action-dock');
  const session = { answered: false, index: 0, questions: [{
    type: 'trous', q: { trou: 'Madamm', attention: 'Madame = <b>Madamm</b>' } }] };
  const sons = [];
  const handle = new Function('document', 'session', 'recordSessionAnswer', 'nextSessionQ',
    'montrerFeedbackSession', 'afficherVerdictChoix', 'jouerFeedbackSon', 'renderActionExercice', code)(
    dom.document, session, () => {}, () => {}, () => {}, () => {}, e => sons.push(e), piedEspion(dom));
  const choisi = element('b');
  choisi.textContent = 'Monsieur';
  handle(choisi, false, 'Madamm');
  assert.equal(dom.get('session-blank').style.color, 'var(--correct)');
  assert.ok(fb.classList.contains('exo-feedback') && fb.classList.contains('ko'));
  assert.doesNotMatch(visible(fb.innerHTML), /Bonne réponse|Pas encore|<button/);
  assert.match(fb.innerHTML, /sr-only">Pas encore\. Ton choix : Monsieur\. Bonne réponse : Madamm\./);
  assert.match(fb.innerHTML, /Madame = <b>Madamm<\/b>/);
  assert.doesNotMatch(fb.innerHTML, /&lt;b&gt;/);
  // SPEC 95 : « Voir le score » est le bouton du pied, même composant qu'en Leçon.
  assert.equal(dom.pied.dock, 'session-action-dock');
  assert.equal(dom.pied.config.id, 'session-suivante');
  assert.equal(dom.pied.config.label, 'Voir le score →');
  assert.deepEqual(sons, ['finalFailure'], 'un seul son, joué par le moteur');
});

test('noteHtml garde le gras mais échappe toute autre balise', () => {
  const f = new Function(escHtml + '\n' + noteHtml + '\nreturn noteHtml;')();
  assert.equal(f('a <b>x</b> <i>y</i>'), 'a <b>x</b> &lt;i&gt;y&lt;/i&gt;');
});

test('styles : écran à trois zones, correction légère, pied d\'action, cases du mot caché conservées', () => {
  const regle = (source, sel) => (source.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}')) || [])[1] || '';
  const commun = read('feedback-unifie.css');
  const composants = read('components.css');
  // SPEC 95 : seul le contenu défile ; le pied est dans le flux (pas position:fixed).
  assert.match(regle(commun, '.exo-shell > .exo-scroll'), /overflow-y: auto/);
  assert.match(commun, /#view-session\.exo-shell\.active \{ height: 100dvh/);
  assert.match(regle(composants, '.exo-action-dock'), /flex: none/);
  assert.doesNotMatch(regle(composants, '.exo-action-dock'), /position: ?fixed/);
  // Correction légère : ni fond, ni bordure, ni ombre (pas de carte ni de bandeau coloré).
  assert.match(regle(commun, '.exo-feedback'), /background: none; border: 0; box-shadow: none/);
  assert.doesNotMatch(css + commun, /position:\s*sticky/, 'plus de correction collée en bas');
  assert.match(css, /#view-parcours \.choice\.wrong, #view-session \.choice\.wrong \{\s*border-color:var\(--wrong\)/);
  // #view-parcours .mc-case est plus spécifique que .mc-case.vert : l'état doit être redéclaré.
  assert.match(regle(css, '#view-parcours .mc-case.vert'), /var\(--correct\)/);
  assert.match(regle(css, '#view-parcours .mc-case.indice'), /var\(--accent\)/);
});

// Sons des mots mélangés : mêmes notes que Survie, sans affecter la logique de reconstruction.
test('Mot caché : une note de Survie par tuile valide, jamais en double ou sur désactivation', () => {
  const sons = [], input = {disabled:false, value:''};
  const mc = {choix:[], tuiles:[{ch:'m'}, {ch:'o'}]};
  let reconstructions=0;
  const code = fonction(parcours,'mcSonLettre') + '\n' + fonction(parcours,'mcPoserLettre') +
    '\nreturn mcPoserLettre;';
  const jouer = new Function('SurvieFx','document','mc','pAttente','tuilesUtilisees',
    'mcCasesLettres','mcSynchroniserChamp','renderCases',code)(
    {lettre:n=>sons.push(n)}, {getElementById:()=>input}, mc, false,
    ()=>mc.tuiles.map((_,i)=>mc.choix.includes(i)),
    ()=>({libres:[0,1]}),
    ()=>{input.value=mc.choix.map(i=>mc.tuiles[i].ch).join('');},
    ()=>{reconstructions++;});
  jouer(0);
  jouer(0); // tuile déjà choisie
  jouer(1);
  jouer(8); // hors limites : déjà complet, aucun son
  assert.deepEqual(sons,[0,1]);
  assert.equal(reconstructions,2);
  assert.equal(input.value,'mo');
  input.disabled=true;
  jouer(0);
  assert.deepEqual(sons,[0,1],'aucun son après désactivation du champ');
});
test('Mot caché : dégradation silencieuse si module son absent ou erreur AudioContext', () => {
  const code = fonction(parcours,'mcSonLettre') + '\nreturn mcSonLettre;';
  const sansModule = new Function('SurvieFx',code)(undefined);
  assert.doesNotThrow(()=>sansModule(0));
  const enErreur = new Function('SurvieFx',code)({lettre(){throw Error('Audio bloqué')}});
  assert.doesNotThrow(()=>enErreur(1));
});
test('Mot caché : au clavier une note par frappe valide, aucune lors du collage ou effacement', () => {
  const sons=[],mc={choix:[],tuiles:[{ch:'m'},{ch:'o'}]},
    input={value:'',disabled:false},document={getElementById:()=>input};
  let redraw=0;
  const code=fonction(parcours,'mcSonLettre')+'\n'+fonction(parcours,'mcSaisie')+
    '\nreturn mcSaisie;';
  const frappe=new Function('SurvieFx','document','mc','pAttente',
    'mcLettresTapees','mcCasesLettres','tuilePourLettre','mcSynchroniserChamp',
    'renderCases','estLettre','mcValider','continuerParcours',code)(
    {lettre:n=>sons.push(n)},document,mc,false,
    ()=>mc.choix.map(i=>mc.tuiles[i].ch),
    ()=>({toutes:[0,1],libres:[0,1]}),
    ch=>mc.tuiles.findIndex((t,i)=>t.ch===ch&&!mc.choix.includes(i)),
    ()=>{input.value=mc.choix.map(i=>mc.tuiles[i].ch).join('')},
    ()=>{redraw++},ch=>/^[a-z]$/i.test(ch),()=>{},()=>{});
  input.value='m';frappe({inputType:'insertText'});
  input.value='mo';frappe({inputType:'insertText'});
  assert.deepEqual(sons,[0,1]);
  input.value='mo';frappe({inputType:'insertText'}); // rien ajouté
  input.value='mox';frappe({inputType:'insertText'}); // lettre inconnue
  input.value='';frappe({inputType:'deleteContentBackward'});
  input.value='mo';frappe({inputType:'insertFromPaste'});
  assert.deepEqual(sons,[0,1],'collage, touche invalide et suppression muets');
  assert.equal(redraw,6,'le rendu mot caché continue à fonctionner');
});
test('Mot caché : le son de lettre est réutilisé sans nouvel asset ni dépendance en cas d’absence', () => {
  const html = read('index.html');
  const vfx = read('survie-vfx.js');
  assert.match(vfx,/lettre: lettre/);
  assert.match(vfx,/function lettre\(position\)/);
  assert.match(vfx,/localStorage\.getItem\(cleSon\(\)\) !== '0'/);
  // Versions d'assets : seulement l'ordre de chargement (les numéros changent à chaque livraison).
  assert.match(html,/src="survie-vfx\.js\?v=\d+"[\s\S]*src="jeux-v21\.js\?v=\d+"/);
  assert.match(html,/src="parcours\.js\?v=\d+"/);
});

test('écriture parcours : première erreur dans le bandeau inférieur, 2e essai non verrouillé', () => {
  const extrait = fonction(parcours, 'ecrValiderPc');
  const styles = read('exercices-v21.css');
  // SPEC 94/95 : état « retry » ; le même bouton du pied devient « Réessayer », sans déplacement.
  assert.match(extrait, /etat: 'retry', titre: 'Pas encore · réessaie'/);
  assert.match(extrait, /getElementById\('pc-ecr-valider'\)\.textContent = 'Réessayer'/);
  assert.doesNotMatch(extrait, /appendChild/);
  assert.match(extrait, /jouerFeedbackSon\('retry'\)/);
  assert.match(fonction(parcours, 'renderEcriturePc'), /\{ id: 'pc-ecr-valider', label: 'Valider', onClick: ecrValiderPc \}/);
  assert.doesNotMatch(extrait.split("if (ecrEssais === 1) {")[1].split("input.disabled = true;")[0], /^\s*showFeedback\(/m);
});

test('SPEC 95 : renderFeedbackCommun ne crée aucun bouton (G24)', () => {
  assert.doesNotMatch(renderFeedbackCommun, /appendChild|createElement|o\.action/);
  const pied = fonction(unifie, 'renderActionExercice');
  assert.match(pied, /principal\.onclick = /, 'une action remplace la précédente (pas d\'écouteur en double)');
});
