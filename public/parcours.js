// ─── PARCOURS EN UNITÉS (leçons v2) ─────────────────────────────────────────
// Une leçon "v2" possède un tableau "unites". Chaque exercice porte "unite": n.
// Une leçon SANS "unites" garde l'ancien affichage en onglets (rien ne change).
//
// Une unité se joue en 4 étapes, toujours dans cet ordre :
//   Mot caché -> Quiz -> Trous -> Écriture
//
// Règle commune à toutes les étapes :
//   - une erreur ne bloque pas : l'item revient à la fin de l'étape ;
//   - on avance seulement quand c'est juste ;
//   - le score ne compte que le PREMIER passage de chaque item.
//
// L'unité en cours est sauvegardée après chaque réponse (clé luxParcours),
// pour reprendre exactement là où on s'est arrêté.

const ETAPES = [
  { type: 'flashcards', stat: 'motcache', label: 'Mot caché' },
  { type: 'quiz',       stat: 'quiz',     label: 'Quiz' },
  { type: 'trous',      stat: 'trous',    label: 'Trous' },
  { type: 'ecriture',   stat: 'ecriture', label: 'Écriture' }
];
const RUN_KEY = 'luxParcours';
const ESSAIS_AVANT_REPONSE = 3; // "Voir la réponse" apparaît après 3 essais ratés

let pLecon = null;      // leçon v2 affichée
let run = null;         // unité en cours
let mc = null;          // état du mot affiché dans l'étape Mot caché
let pAttente = false;   // true quand un message attend le bouton "Continuer"
let pSuite = null;      // fonction lancée par "Continuer"
let pTimer = null;      // passage automatique à l'item suivant
let pCoursUnite = null; // unité affichée dans le panneau Cours (null = toute la leçon)
let pResultat = null;   // résultat de la dernière unité terminée

// ─── OUTILS ─────────────────────────────────────────────────────────────────
function isParcoursLecon(l) {
  return !!(l && Array.isArray(l.unites) && l.unites.length > 0);
}

function etapeInfo(type) {
  return ETAPES.find(e => e.type === type);
}

// Items d'une unité pour un type d'exercice.
function itemsUnite(lecon, type, uniteId) {
  return (lecon[type] || []).filter(x => x.unite === uniteId);
}

function trouverItem(lecon, type, id) {
  return (lecon[type] || []).find(x => x.id === id);
}

function trouverUnite(lecon, uniteId) {
  return lecon.unites.find(u => u.id === uniteId);
}

function melanger(tableau) {
  return tableau.slice().sort(() => Math.random() - 0.5);
}

function etoiles(percent) {
  if (percent >= 90) return 3;
  if (percent >= 70) return 2;
  if (percent >= 50) return 1;
  return 0;
}

// HTML des 3 étoiles : pleines en or, vides en gris.
function etoilesHtml(nb) {
  return '<span class="pc-star on">' + '★'.repeat(nb) + '</span>' +
         '<span class="pc-star">' + '★'.repeat(3 - nb) + '</span>';
}

// Texte luxembourgeois d'un mot caché, avec son article s'il en a un.
function motComplet(card) {
  return (card.article ? card.article + ' ' : '') + card.lu;
}

// ─── SAUVEGARDE DE L'UNITÉ EN COURS ─────────────────────────────────────────
function saveRun() {
  try { localStorage.setItem(storageKey(RUN_KEY), JSON.stringify(run)); } catch (e) { /* ignore */ }
}

function loadRun() {
  try { return JSON.parse(localStorage.getItem(storageKey(RUN_KEY))); } catch (e) { return null; }
}

function clearRun() {
  try { localStorage.removeItem(storageKey(RUN_KEY)); } catch (e) { /* ignore */ }
}

// ─── RÉSUMÉ D'UNE LEÇON (liste des leçons) ──────────────────────────────────
// Étoiles de la leçon = moyenne des meilleurs scores (unité non faite = 0).
function resumeLecon(l) {
  let done = 0, somme = 0;
  l.unites.forEach(u => {
    const best = getUnitBest(l.id, u.id);
    if (best != null) { done++; somme += best; }
  });
  const percent = Math.round(somme / l.unites.length);
  return { done, total: l.unites.length, stars: etoiles(percent) };
}

// Pastilles affichées sous le titre d'une leçon v2 dans la liste.
function carteLeconV2Html(l) {
  const r = resumeLecon(l);
  let html = '<span class="lecon-pill">' + r.done + ' / ' + r.total + ' unités</span>';
  if (r.done > 0) html += '<span class="lecon-pill pc-pill-stars">' + etoilesHtml(r.stars) + '</span>';
  if (leconHasActiveErrors(l.id)) html += '<span class="lecon-pill pc-pill-revoir">À revoir</span>';
  return html;
}

// Carte "Reprendre" en haut de la liste des leçons (ou null).
function carteReprendre() {
  const saved = loadRun();
  if (!saved) return null;
  const l = leconsActives().find(x => x.id === saved.leconId);
  if (!isParcoursLecon(l)) return null;
  const u = trouverUnite(l, saved.uniteId);
  const step = saved.steps[saved.stepIdx];
  if (!u || !step) return null;

  const el = document.createElement('div');
  el.className = 'pc-reprendre';
  el.innerHTML =
    '<div class="pc-mini-label">REPRENDRE</div>' +
    '<div class="pc-reprendre-row">' +
      '<div class="pc-reprendre-txt">' +
        '<div class="pc-reprendre-titre">' + escHtml(l.titre) + '</div>' +
        '<div class="pc-reprendre-sous">Unité ' + u.id + ' · étape ' + (saved.stepIdx + 1) +
          ' sur ' + saved.steps.length + ' · ' + etapeInfo(step.type).label + '</div>' +
      '</div>' +
      '<button class="pc-btn primary" onclick="reprendreRun()">Continuer</button>' +
    '</div>' +
    '<div class="pc-steps">' + segmentsHtml(saved) + '</div>';
  return el;
}

// ─── ÉCRAN DE LA LEÇON (liste des unités) ───────────────────────────────────
function openParcoursLecon(l) {
  pLecon = l;
  currentLecon = l;
  renderParcoursLecon();
  showView('view-plecon');
}

function renderParcoursLecon() {
  const l = pLecon;
  const saved = loadRun();
  document.getElementById('pl-num').textContent = 'LEÇON ' + l.id;
  document.getElementById('pl-titre').textContent = l.titre;
  document.getElementById('pl-sous').textContent =
    l.titre_fr + ' · ' + l.unites.length + ' unités';
  document.getElementById('view-plecon').style.setProperty('--lc', l.couleur);

  let html = '';
  let toutesFaites = true;

  // Seule la prochaine unité à faire a le bouton principal (jaune).
  const runIci = saved && saved.leconId === l.id;
  const prochaine = runIci ? null : l.unites.find(u => getUnitBest(l.id, u.id) == null);

  l.unites.forEach(u => {
    const best = getUnitBest(l.id, u.id);
    if (best == null) toutesFaites = false;
    const enCours = saved && saved.leconId === l.id && saved.uniteId === u.id;

    const mots = itemsUnite(l, 'flashcards', u.id);
    let apercu = mots.slice(0, 4).map(c => escHtml(c.lu)).join(' · ');
    if (mots.length > 4) apercu += ' · +' + (mots.length - 4);

    html += '<div class="pl-unit' + (enCours ? ' en-cours' : '') + '">';
    html += '<div class="pl-unit-top"><div>' +
      '<div class="pc-mini-label">UNITÉ ' + u.id + (enCours ? ' · EN COURS' : '') + '</div>' +
      '<div class="pl-unit-titre">' + escHtml(u.titre) + '</div></div>' +
      (best != null ? '<div class="pl-unit-stars">' + etoilesHtml(etoiles(best)) + '</div>' : '') +
      '</div>';
    html += '<div class="pl-unit-mots">' + apercu + '</div>';

    if (enCours) {
      html += '<div class="pc-steps">' + segmentsHtml(saved) + '</div>';
      html += '<button class="pc-btn primary wide" onclick="reprendreRun()">Continuer</button>';
    } else if (best == null) {
      const classe = prochaine && prochaine.id === u.id ? 'pc-btn primary wide' : 'pc-btn wide';
      html += '<button class="' + classe + '" onclick="openIntro(' + u.id + ')">Commencer</button>';
    } else {
      // Unité terminée : on peut tout refaire, ou une seule étape.
      html += '<div class="pl-unit-actions">' +
        '<button class="pc-btn" onclick="openIntro(' + u.id + ')">Refaire l\'unité</button>';
      ETAPES.forEach(e => {
        if (!itemsUnite(l, e.type, u.id).length) return;
        html += '<button class="pc-chip" onclick="startEtapeSeule(' + u.id + ', \'' + e.type + '\')">' +
          e.label + '</button>';
      });
      html += '</div>';
    }
    html += '</div>';
  });

  // Bilan : 10 questions mélangées de toute la leçon, une fois les unités faites.
  if (toutesFaites) {
    html += '<div class="pl-unit pl-bilan">' +
      '<div class="pl-unit-titre">Bilan de la leçon</div>' +
      '<div class="pl-unit-mots">10 questions mélangées sur toutes les unités</div>' +
      '<button class="pc-btn primary wide" onclick="lancerBilan()">Lancer le bilan</button></div>';
  } else {
    html += '<div class="pl-unit pl-bilan locked">' +
      '<div class="pl-unit-titre">Bilan de la leçon</div>' +
      '<div class="pl-unit-mots">10 questions mélangées · après les ' + l.unites.length + ' unités</div></div>';
  }

  document.getElementById('pl-units').innerHTML = html;
}

// "Tout revoir" : l'écran Réviser, avec seulement cette leçon cochée.
function toutRevoir() {
  openReviewSetup(pLecon.id);
}

function lancerBilan() {
  const pool = [];
  ['quiz', 'trous', 'ecriture'].forEach(type => {
    (pLecon[type] || []).forEach((q, i) => {
      const qid = type === 'ecriture' ? ecritureId(q, i) : q.id;
      pool.push({ leconId: pLecon.id, type, qid, q });
    });
  });
  demarrerSession('review', 'BILAN · LEÇON ' + pLecon.id, melanger(pool).slice(0, 10), pLecon.id);
}

// ─── ÉCRAN "AVANT DE COMMENCER" ─────────────────────────────────────────────
function openIntro(uniteId) {
  const u = trouverUnite(pLecon, uniteId);
  const mots = itemsUnite(pLecon, 'flashcards', uniteId).slice(0, 6);

  let nb = 0;
  ETAPES.forEach(e => { nb += itemsUnite(pLecon, e.type, uniteId).length; });
  const minutes = Math.max(1, Math.round(nb * 12 / 60)); // ~12 s par item

  let html = '<div class="pc-mini-label pc-accent">UNITÉ ' + u.id + ' · CE QUE TU VAS APPRENDRE</div>' +
    '<h1 class="pi-titre">' + escHtml(u.titre) + '</h1>';

  if (u.regle) {
    html += '<div class="pi-regle"><div class="pc-mini-label pc-gold">LA RÈGLE</div>' +
      '<div class="pi-regle-txt">' + u.regle + '</div>' +
      (u.exemple ? '<div class="pi-regle-ex">' + u.exemple + '</div>' : '') + '</div>';
  }

  if (mots.length) {
    html += '<div class="pc-mini-label">LES MOTS</div><div class="pi-mots">' +
      mots.map(c => '<div class="pi-mot"><b>' + escHtml(motComplet(c)) + '</b><span>' +
        escHtml(c.fr) + '</span></div>').join('') + '</div>';
  }

  if (u.phrases && u.phrases.length) {
    html += '<div class="pc-mini-label">LA PHRASE</div><div class="pi-phrases">' +
      u.phrases.map(p => '<div><b>' + escHtml(p[0]) + '</b> <span>· ' + escHtml(p[1]) + '</span></div>').join('') +
      '</div>';
  }

  html += '<div class="pi-bas"><div class="pi-duree">4 étapes · environ ' + minutes + ' min</div>' +
    '<button class="pc-btn primary wide big" onclick="startUnite(' + u.id + ')">Commencer</button></div>';

  document.getElementById('pi-content').innerHTML = html;
  showView('view-pintro');
}

// ─── DÉMARRER / REPRENDRE UNE UNITÉ ─────────────────────────────────────────
// mode   : 'unite' (unité complète, compte pour les étoiles),
//          'erreurs' (refaire ses erreurs), 'etape' (une seule étape)
// filtre : liste de clés "type:id" à garder (null = tout)
function startUnite(uniteId, mode, filtre) {
  mode = mode || 'unite';
  const steps = [];
  ETAPES.forEach(e => {
    let items = itemsUnite(pLecon, e.type, uniteId);
    if (filtre) items = items.filter(x => filtre.includes(e.type + ':' + x.id));
    if (!items.length) return;
    steps.push({
      type: e.type,
      queue: melanger(items).map(x => x.id), // ids restants, le 1er est affiché
      total: items.length,
      scores: {},  // id -> score du premier passage (0 à 1)
      details: {}  // id -> { ok, indices, essais, revele }
    });
  });
  if (!steps.length) return;

  run = { leconId: pLecon.id, uniteId, mode, steps, stepIdx: 0 };
  saveRun();
  showView('view-parcours');
  renderItem();
}

function startEtapeSeule(uniteId, type) {
  const cles = itemsUnite(pLecon, type, uniteId).map(x => type + ':' + x.id);
  startUnite(uniteId, 'etape', cles);
}

function reprendreRun() {
  const saved = loadRun();
  if (!saved) return;
  const l = lecons.find(x => x.id === saved.leconId);
  if (!isParcoursLecon(l)) { clearRun(); return; }
  pLecon = l;
  currentLecon = l;
  run = saved;
  showView('view-parcours');
  renderItem();
}

// Croix en haut : on garde la sauvegarde et on revient à la leçon.
function quitterParcours() {
  clearTimeout(pTimer);
  pAttente = false;
  openParcoursLecon(pLecon);
}

// ─── AFFICHAGE D'UN ITEM ────────────────────────────────────────────────────
// HTML des segments de progression (un par étape).
function segmentsHtml(r) {
  return r.steps.map((s, i) => {
    let largeur = 0;
    if (i < r.stepIdx) largeur = 100;
    else if (i === r.stepIdx) largeur = Math.round((s.total - s.queue.length) / s.total * 100);
    const fini = i < r.stepIdx ? ' fini' : '';
    return '<div class="pc-seg' + fini + '"><div style="width:' + largeur + '%"></div></div>';
  }).join('');
}

function etapeCourante() {
  return run.steps[run.stepIdx];
}

function renderItem() {
  clearTimeout(pTimer);
  pAttente = false;
  pSuite = null;

  const step = etapeCourante();
  if (!step) { finirRun(); return; }

  // Étape terminée -> étape suivante.
  if (!step.queue.length) {
    run.stepIdx++;
    saveRun();
    renderItem();
    return;
  }

  // Item supprimé du fichier depuis la sauvegarde -> on le saute.
  const item = trouverItem(pLecon, step.type, step.queue[0]);
  if (!item) {
    step.queue.shift();
    saveRun();
    renderItem();
    return;
  }

  // En-tête : segments, nom de l'étape, compteur.
  document.getElementById('pc-steps').innerHTML = segmentsHtml(run);
  const resolus = step.total - step.queue.length;
  const aRefaire = step.queue.filter(id => step.scores[id] !== undefined).length;
  document.getElementById('pc-etape').textContent =
    'Étape ' + (run.stepIdx + 1) + ' · ' + etapeInfo(step.type).label;
  document.getElementById('pc-compteur').innerHTML =
    Math.min(resolus + 1, step.total) + ' / ' + step.total +
    (aRefaire ? ' <span class="pc-refaire">· +' + aRefaire + ' à refaire</span>' : '');

  document.getElementById('pc-feedback').className = 'pc-feedback hidden';

  if (step.type === 'flashcards') renderMotCache(item);
  else if (step.type === 'quiz') renderQuizP(item);
  else if (step.type === 'trous') renderTrouP(item);
  else renderEcriturePc(item);
  window.scrollTo(0, 0);
}

// ─── RÉPONSES : ENREGISTRER, RÉUSSIR, ÉCHOUER ───────────────────────────────
// Enregistre le score du PREMIER passage seulement.
// ok = réussi du premier coup, sans aide (alimente niveaux et stats).
function enregistrer(item, score, ok, details) {
  const step = etapeCourante();
  if (step.scores[item.id] !== undefined) return; // déjà noté (item qui revient)
  step.scores[item.id] = score;
  step.details[item.id] = Object.assign({ ok }, details || {});
  updateQuestionProgress(run.leconId, etapeInfo(step.type).stat, item.id, ok);
  saveRun();
}

// Juste : l'item sort de la file.
function reussir() {
  etapeCourante().queue.shift();
  saveRun();
  renderItem();
}

// Faux : l'item repart à la fin de la file.
function echouer() {
  const step = etapeCourante();
  step.queue.push(step.queue.shift());
  saveRun();
  renderItem();
}

// Bandeau du bas : "Juste !" ou "Pas encore", avec un bouton Continuer.
function showFeedback(ok, titre, texteHtml, suite) {
  pAttente = true;
  pSuite = suite;
  const fb = document.getElementById('pc-feedback');
  fb.className = 'pc-feedback ' + (ok ? 'ok' : 'ko');
  fb.innerHTML =
    '<div class="pc-fb-titre">' + titre + '</div>' +
    (texteHtml ? '<div class="pc-fb-txt">' + texteHtml + '</div>' : '') +
    '<button class="pc-btn wide ' + (ok ? 'ok' : 'ko') + '" id="pc-continuer" onclick="continuerParcours()">Continuer</button>';
  document.getElementById('pc-continuer').focus();
}

function continuerParcours() {
  if (!pAttente || !pSuite) return;
  const suite = pSuite;
  pAttente = false;
  pSuite = null;
  suite();
}

// ─── ÉTAPE 1 : MOT CACHÉ ────────────────────────────────────────────────────
function estLettre(ch) {
  return /[a-z0-9]/.test(normalize(ch));
}

function renderMotCache(card) {
  // Une case par caractère. Espaces, apostrophes et tirets sont déjà affichés.
  mc = {
    card,
    cases: card.lu.split('').map(ch => ({ ch, lettre: estLettre(ch), etat: '' })),
    indices: 0,   // lettres révélées avec le bouton Indice (coûtent des points)
    essais: 0,    // essais ratés
    revele: false // "Voir la réponse" utilisé
  };
  const nbLettres = mc.cases.filter(c => c.lettre).length;

  document.getElementById('pc-body').innerHTML =
    '<div class="mc-top">' +
      '<div class="pc-mini-label">TRADUIS</div>' +
      '<div class="mc-fr">' + escHtml(card.fr) + '</div>' +
      (card.indice ? '<div class="mc-indice">' + escHtml(card.indice) + '</div>' : '') +
    '</div>' +
    '<div class="mc-mot">' +
      (card.article ? '<span class="mc-article">' + escHtml(card.article) + '</span>' : '') +
      '<div class="mc-cases" id="mc-cases"></div>' +
    '</div>' +
    '<div class="mc-legende hidden" id="mc-legende">' +
      '<span><i class="mc-dot vert"></i>bien placée · gratuit</span>' +
      '<span><i class="mc-dot indice"></i>indice · coûte des points</span>' +
    '</div>' +
    '<div class="mc-info" id="mc-info">' + nbLettres + ' lettres</div>' +
    '<div class="mc-erreur hidden" id="mc-erreur"></div>' +
    '<label class="pc-input-label" for="mc-input">Ta réponse</label>' +
    '<input id="mc-input" class="ecr-input mc-input" type="text" placeholder="Écris en luxembourgeois"' +
      ' autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">' +
    '<div class="mc-score">Score du mot : <b id="mc-score">100 %</b></div>' +
    '<div class="pc-actions">' +
      '<button class="pc-btn" id="mc-btn-indice" onclick="mcIndice()">Indice</button>' +
      '<button class="pc-btn primary" id="mc-btn-valider" onclick="mcValider()">Valider</button>' +
    '</div>' +
    '<button class="pc-btn ghost wide hidden" id="mc-btn-voir" onclick="mcVoirReponse()">Voir la réponse</button>';

  renderCases();
  const input = document.getElementById('mc-input');
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation(); // évite que le listener global relance "Continuer"
    if (pAttente) continuerParcours();
    else mcValider();
  });
  input.focus();
}

function renderCases() {
  const nbLettres = mc.cases.filter(c => c.lettre).length;
  const taille = nbLettres > 12 ? ' xs' : nbLettres > 9 ? ' sm' : '';
  let html = '';
  mc.cases.forEach(c => {
    if (!c.lettre) {
      html += c.ch === ' ' ? '<span class="mc-espace"></span>' : '<span class="mc-sep">' + escHtml(c.ch) + '</span>';
    } else {
      const visible = c.etat !== '';
      html += '<span class="mc-case ' + c.etat + taille + '">' + (visible ? escHtml(c.ch) : '') + '</span>';
    }
  });
  document.getElementById('mc-cases').innerHTML = html;
}

// Score du mot = lettres non révélées par indice / nombre de lettres.
// Les lettres vertes (trouvées en tapant) restent gratuites.
function mcScore() {
  if (mc.revele) return 0;
  const nb = mc.cases.filter(c => c.lettre).length;
  return (nb - mc.indices) / nb;
}

function mcMajScore() {
  document.getElementById('mc-score').textContent = Math.round(mcScore() * 100) + ' %';
}

function mcIndice() {
  if (pAttente) return;
  const cachees = [];
  mc.cases.forEach((c, i) => { if (c.lettre && c.etat === '') cachees.push(i); });
  if (!cachees.length) return;

  const i = cachees[Math.floor(Math.random() * cachees.length)];
  mc.cases[i].etat = 'indice';
  mc.indices++;
  renderCases();
  mcMajScore();
  document.getElementById('mc-legende').classList.remove('hidden');
  if (cachees.length === 1) document.getElementById('mc-btn-indice').disabled = true;
  document.getElementById('mc-input').focus();
}

function mcValider() {
  if (pAttente) return;
  const input = document.getElementById('mc-input');
  const val = input.value.trim();
  if (!val) return;
  const card = mc.card;

  // Juste (même comparaison que l'écriture : accents et ponctuation ignorés).
  if (normalize(val) === normalize(card.lu)) {
    mc.cases.forEach(c => { if (c.lettre) c.etat = 'vert'; });
    renderCases();
    const ok = !mc.revele && mc.indices === 0 && mc.essais === 0;
    enregistrer(card, mcScore(), ok, { indices: mc.indices, essais: mc.essais, revele: mc.revele });
    input.disabled = true;
    input.className = 'ecr-input mc-input correct';
    showFeedback(true, 'Juste !', '<b>' + escHtml(motComplet(card)) + '</b>' +
      (card.note ? '<br>' + escHtml(card.note) : ''), reussir);
    return;
  }

  // Faux : les lettres bien placées passent en vert, gratuitement.
  mc.essais++;
  mc.cases.forEach((c, i) => {
    if (c.lettre && c.etat === '' && i < val.length && normalize(val[i]) === normalize(c.ch)) {
      c.etat = 'vert';
    }
  });
  renderCases();
  document.getElementById('mc-legende').classList.remove('hidden');

  const err = document.getElementById('mc-erreur');
  err.classList.remove('hidden');
  err.innerHTML = '<b>Pas encore</b> · Ton essai : ' + escHtml(val) + ' · essai ' + mc.essais;

  if (mc.essais >= ESSAIS_AVANT_REPONSE) {
    document.getElementById('mc-btn-voir').classList.remove('hidden');
  }

  // Petite secousse pour signaler l'erreur.
  const cases = document.getElementById('mc-cases');
  cases.classList.remove('shake');
  void cases.offsetWidth;
  cases.classList.add('shake');

  input.value = '';
  input.focus();
}

function mcVoirReponse() {
  if (pAttente) return;
  mc.revele = true;
  mc.cases.forEach(c => { if (c.lettre && c.etat === '') c.etat = 'indice'; });
  renderCases();
  mcMajScore();
  enregistrer(mc.card, 0, false, { indices: mc.indices, essais: mc.essais, revele: true });
  document.getElementById('mc-input').disabled = true;
  showFeedback(false, 'La réponse : ' + escHtml(motComplet(mc.card)),
    'Ce mot reviendra à la fin de l\'étape.', echouer);
}

// ─── ÉTAPES 2 ET 3 : QUIZ ET TROUS (choix multiples) ────────────────────────
function renderQuizP(q) {
  // Si un distracteur est identique à la réponse, on le remplace (comme le quiz v1).
  const choix = melanger(q.distracteurs.map(d => d === q.reponse ? '—' : d).concat([q.reponse]));
  document.getElementById('pc-body').innerHTML =
    '<div class="pc-question">' +
      '<div class="pc-mini-label">' + escHtml(q.label || 'CHOISIS') + '</div>' +
      '<div class="pc-question-mot">' + escHtml(q.question) + '</div>' +
    '</div>' +
    '<div class="choices" id="pc-choix"></div>';
  construireChoix(choix, q.reponse, q, '');
}

function renderTrouP(t) {
  const avant = t.avant ? escHtml(t.avant) + ' ' : '';
  const apres = t.apres ? ' ' + escHtml(t.apres) : '';
  document.getElementById('pc-body').innerHTML =
    '<div class="pc-question">' +
      '<div class="pc-mini-label">COMPLÈTE</div>' +
      '<div class="pc-trou-fr">' + escHtml(t.fr) + '</div>' +
      '<div class="pc-trou-phrase">' + avant + '<span class="trou-blank" id="pc-blank">___</span>' + apres + '</div>' +
    '</div>' +
    '<div class="choices pc-choix-grille" id="pc-choix"></div>';
  construireChoix(melanger(t.choix), t.trou, t, t.note || '');
}

function construireChoix(choix, bonne, item, note) {
  const box = document.getElementById('pc-choix');
  choix.forEach(texte => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = texte;
    btn.addEventListener('click', () => choisirP(btn, texte === bonne, bonne, item, note));
    box.appendChild(btn);
  });
}

function choisirP(btn, ok, bonne, item, note) {
  if (pAttente) return;
  pAttente = true;
  document.querySelectorAll('#pc-choix .choice').forEach(b => {
    b.disabled = true;
    if (b.textContent === bonne) b.classList.add('correct');
  });
  if (!ok) btn.classList.add('wrong');

  const blank = document.getElementById('pc-blank');
  if (blank) {
    blank.textContent = bonne;
    blank.style.color = ok ? 'var(--correct)' : 'var(--wrong)';
  }

  enregistrer(item, ok ? 1 : 0, ok);

  if (ok) {
    pTimer = setTimeout(reussir, note ? 1500 : 900);
    if (note) {
      const fb = document.getElementById('pc-feedback');
      fb.className = 'pc-feedback ok discret';
      fb.innerHTML = '<div class="pc-fb-txt">' + escHtml(note) + '</div>';
    }
  } else {
    showFeedback(false, 'Pas encore',
      'La bonne réponse : <b>' + escHtml(bonne) + '</b>' +
      (note ? '<br>' + escHtml(note) : '') +
      '<br>Cette question reviendra à la fin de l\'étape.', echouer);
  }
}

// ─── ÉTAPE 4 : ÉCRITURE ─────────────────────────────────────────────────────
function renderEcriturePc(e) {
  document.getElementById('pc-body').innerHTML =
    '<div class="pc-question">' +
      '<div class="pc-mini-label">ÉCRIS EN LUXEMBOURGEOIS</div>' +
      '<div class="pc-question-mot">' + escHtml(e.fr) + '</div>' +
    '</div>' +
    '<label class="pc-input-label" for="pc-ecr-input">Ta réponse</label>' +
    '<textarea id="pc-ecr-input" class="ecr-input" rows="2" placeholder="Tape ta réponse…"' +
      ' autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"></textarea>' +
    '<div class="pc-actions"><button class="pc-btn primary wide" onclick="ecrValiderPc()">Valider</button></div>';

  const input = document.getElementById('pc-ecr-input');
  input.addEventListener('keydown', ev => {
    if (ev.key !== 'Enter' || ev.shiftKey) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (pAttente) continuerParcours();
    else ecrValiderPc();
  });
  input.focus();
}

function ecrValiderPc() {
  if (pAttente) return;
  const input = document.getElementById('pc-ecr-input');
  const val = input.value.trim();
  if (!val) return;

  const e = trouverItem(pLecon, 'ecriture', etapeCourante().queue[0]);
  const ok = normalize(val) === normalize(e.lu);
  enregistrer(e, ok ? 1 : 0, ok);

  input.disabled = true;
  input.className = 'ecr-input ' + (ok ? 'correct' : 'wrong');

  if (ok) {
    showFeedback(true, 'Juste !', '<b>' + escHtml(e.lu) + '</b>', reussir);
  } else {
    showFeedback(false, 'Pas encore',
      'Réponse attendue : <b>' + escHtml(e.lu) + '</b><br>Cette phrase reviendra à la fin de l\'étape.', echouer);
  }
}

// ─── FIN D'UNITÉ ────────────────────────────────────────────────────────────
// Texte affiché pour un item dans la liste "À retravailler".
function ligneErreur(type, item, d) {
  let lu, fr, raison;
  if (type === 'flashcards') { lu = motComplet(item); fr = item.fr; }
  else if (type === 'quiz') { lu = item.question; fr = item.reponse; }
  else if (type === 'trous') { lu = [item.avant, item.trou, item.apres].filter(Boolean).join(' '); fr = item.fr; }
  else { lu = item.lu; fr = item.fr; }

  if (d.revele) raison = 'réponse vue';
  else if (d.indices) raison = d.indices + (d.indices > 1 ? ' indices' : ' indice');
  else if (d.essais) raison = (d.essais + 1) + ' essais';
  else raison = etapeInfo(type).label + ' · raté';
  return { lu, fr, raison };
}

function finirRun() {
  const etapes = run.steps.map(s => {
    const vals = Object.values(s.scores);
    const somme = vals.reduce((a, b) => a + b, 0);
    return { label: etapeInfo(s.type).label, percent: vals.length ? Math.round(somme / vals.length * 100) : 100 };
  });
  const total = Math.round(etapes.reduce((a, e) => a + e.percent, 0) / etapes.length);

  // Seule une unité complète compte pour les étoiles.
  if (run.mode === 'unite') saveUnitBest(run.leconId, run.uniteId, total);

  const erreurs = [];  // clés "type:id" pour "Refaire mes erreurs"
  const lignes = [];
  run.steps.forEach(s => {
    Object.keys(s.details).forEach(id => {
      const d = s.details[id];
      if (d.ok) return;
      const item = trouverItem(pLecon, s.type, Number(id));
      if (!item) return;
      erreurs.push(s.type + ':' + item.id);
      lignes.push(ligneErreur(s.type, item, d));
    });
  });

  pResultat = { leconId: run.leconId, uniteId: run.uniteId, mode: run.mode, total, etapes, erreurs, lignes };
  run = null;
  clearRun();
  renderFin();
  showView('view-pfin');
}

function renderFin() {
  const r = pResultat;
  const u = trouverUnite(pLecon, r.uniteId);
  const titre = r.mode === 'unite' ? 'UNITÉ ' + u.id + ' TERMINÉE'
    : r.mode === 'erreurs' ? 'ERREURS REFAITES' : 'ÉTAPE TERMINÉE';

  let html = '<div class="pf-haut">' +
    '<div class="pc-mini-label pc-accent">' + titre + '</div>' +
    (r.mode === 'unite' ? '<div class="pf-stars">' + etoilesHtml(etoiles(r.total)) + '</div>' : '') +
    '<div class="pf-score">' + r.total + ' %</div>' +
    (r.mode === 'unite' ? '<div class="pf-sous">3 étoiles à partir de 90 %</div>'
                        : '<div class="pf-sous">Ce passage ne change pas les étoiles de l\'unité</div>') +
    '</div>';

  if (r.etapes.length > 1) {
    html += '<div class="pf-etapes">' + r.etapes.map(e =>
      '<div class="pf-etape"><span>' + e.label + '</span>' +
      '<div class="pf-bar"><div style="width:' + e.percent + '%"></div></div>' +
      '<b>' + e.percent + ' %</b></div>').join('') + '</div>';
  }

  if (r.lignes.length) {
    html += '<div class="pf-titre-liste"><span class="pc-mini-label">À RETRAVAILLER</span>' +
      '<span class="pf-note">ajoutés à « À consolider »</span></div><div class="pf-liste">' +
      r.lignes.map(l => '<div class="pf-ligne"><div><b>' + escHtml(l.lu) + '</b><span>' + escHtml(l.fr) +
        '</span></div><em>' + escHtml(l.raison) + '</em></div>').join('') + '</div>';
  } else {
    html += '<div class="pf-parfait">Aucune erreur, tout était juste du premier coup.</div>';
  }

  // Boutons : refaire ses erreurs, puis unité suivante ou retour.
  html += '<div class="pf-boutons">';
  if (r.erreurs.length) {
    html += '<button class="pc-btn wide" onclick="refaireErreurs()">Refaire mes erreurs</button>';
  }
  const idx = pLecon.unites.findIndex(x => x.id === r.uniteId);
  const suivante = pLecon.unites[idx + 1];
  if (r.mode === 'unite' && suivante) {
    html += '<button class="pc-btn primary wide big" onclick="openIntro(' + suivante.id + ')">Unité suivante</button>';
    html += '<button class="pc-btn ghost wide" onclick="openParcoursLecon(pLecon)">Retour à la leçon</button>';
  } else {
    html += '<button class="pc-btn primary wide big" onclick="openParcoursLecon(pLecon)">Retour à la leçon</button>';
  }
  html += '</div>';

  document.getElementById('pf-content').innerHTML = html;
}

function refaireErreurs() {
  startUnite(pResultat.uniteId, 'erreurs', pResultat.erreurs);
}

// ─── PANNEAU COURS ──────────────────────────────────────────────────────────
// uniteId = null -> toute la leçon. Pendant un exercice, on ouvre sur l'unité.
function ouvrirCours(uniteId) {
  pCoursUnite = uniteId == null ? null : uniteId;
  renderCoursPanel();
  document.getElementById('cours-panel').classList.remove('hidden');
  document.body.classList.add('no-scroll');
}

function ouvrirCoursExercice() {
  ouvrirCours(run ? run.uniteId : null);
}

function fermerCours() {
  document.getElementById('cours-panel').classList.add('hidden');
  document.body.classList.remove('no-scroll');
  const input = document.querySelector('#view-parcours.active #mc-input, #view-parcours.active #pc-ecr-input');
  if (input && !input.disabled) input.focus();
}

function coursChoisir(uniteId) {
  pCoursUnite = uniteId;
  renderCoursPanel();
}

function renderCoursPanel() {
  const l = pLecon;
  document.getElementById('cp-titre').textContent = l.titre;

  // Onglets : l'unité de l'exercice (s'il y en a un) + toute la leçon.
  const uniteExo = run ? run.uniteId : null;
  let onglets = '';
  if (uniteExo != null) {
    onglets += '<button class="pc-chip' + (pCoursUnite === uniteExo ? ' active' : '') +
      '" onclick="coursChoisir(' + uniteExo + ')">Unité ' + uniteExo + '</button>';
  }
  onglets += '<button class="pc-chip' + (pCoursUnite == null ? ' active' : '') +
    '" onclick="coursChoisir(null)">Toute la leçon</button>';
  document.getElementById('cp-onglets').innerHTML = onglets;

  // Un bloc sans "unite" est général : il apparaît partout.
  const blocs = (l.cours || []).filter(b => pCoursUnite == null || b.unite == null || b.unite === pCoursUnite);
  document.getElementById('cp-content').innerHTML = coursBlocsHtml(blocs, l.couleur);
  document.getElementById('cp-content').scrollTop = 0;
}

// ─── CLAVIER ────────────────────────────────────────────────────────────────
// Entrée = Continuer quand un message est affiché (hors champs de saisie,
// qui gèrent eux-mêmes Entrée).
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !document.getElementById('cours-panel').classList.contains('hidden')) {
    fermerCours();
    return;
  }
  if (e.key !== 'Enter' || !pAttente) return;
  if (!document.getElementById('view-parcours').classList.contains('active')) return;
  if (e.target && e.target.id === 'pc-continuer') return; // le bouton se clique tout seul
  e.preventDefault();
  continuerParcours();
});
