// ─── EXAMENS : SUJETS COMPLETS ──────────────────────────────────────────────
// Un sujet = un fichier JSON dans data/examens/<niveau>/ (ex : A1.2/examen-01.json).
// Ajouter un sujet = ajouter un fichier. Rien à changer dans le code.
//
// Structure d'un sujet :
// {
//   "id": "a12-01", "titre": "Annale 01", "titre_fr": "...", "couleur": "#6fb0f2",
//   "parties": [ ... ]
// }
//
// Deux types de partie (1 point par réponse) :
//
// 1) "trous" : un texte avec des trous numérotés {1}, {2}…
//    - "lignes" : [[étiquette, texte], …]  (étiquette = personnage, heure, "•" ou "")
//    - "trous"  : [{ "reponse": "...", "note": "..." }, …]   ({1} = premier élément)
//    - soit "banque" (liste de mots commune, chaque mot sert une fois),
//      soit "choix" dans chaque trou (3 propositions).
//
// 2) "qcm" : un texte à lire ("lignes", "chapeau" facultatif) puis des questions
//    - "questions" : [{ "question", "choix": [...], "reponse", "note" }, …]
//    - vrai/faux = un qcm avec les choix ["richteg", "falsch"].

const EXAM_KEY = 'luxExamens'; // meilleurs scores, par sujet

// Traduction des noms de section affichée dans le résultat.
const EXAM_SECTIONS_FR = {
  'Sproochgebrauch': 'Usage de la langue',
  'Liesverstoen': 'Compréhension écrite'
};

// ─── STATE ──────────────────────────────────────────────────────────────────
let examens = [];            // tous les sujets (tous niveaux)
let exam = null;             // sujet en cours
let examAnswers = [];        // examAnswers[partie][numéro] = réponse choisie, ou null
let examPart = 0;            // partie affichée
let examBlank = 0;           // trou sélectionné (parties "trous")
let examRes = null;          // résultat calculé à la fin
let examOnlyErrors = false;  // correction : tout afficher ou seulement les erreurs

// ─── CHARGEMENT ─────────────────────────────────────────────────────────────
async function loadExamens() {
  try {
    examens = await fetch('/api/examens').then(r => r.json());
  } catch (e) {
    examens = []; // serveur pas à jour : l'app marche quand même, sans sujets
  }
}

// Sujets du niveau actif (A1.1, A1.2…).
function examensActifs() {
  return examens.filter(e => e.niveau === niveauActif);
}

// Éléments notés d'une partie (les trous ou les questions).
function examItems(part) {
  return part.type === 'trous' ? part.trous : part.questions;
}

// Nombre total de points d'un sujet.
function examTotal(ex) {
  let total = 0;
  ex.parties.forEach(p => total += examItems(p).length);
  return total;
}

// ─── MEILLEURS SCORES (localStorage, par profil) ────────────────────────────
function getExamScores() {
  try {
    return JSON.parse(localStorage.getItem(storageKey(EXAM_KEY))) || {};
  } catch (e) {
    return {};
  }
}

function saveExamScore(examId, score, total) {
  const scores = getExamScores();
  const old = scores[examId];
  if (!old || score > old.best) {
    scores[examId] = { best: score, total: total };
    localStorage.setItem(storageKey(EXAM_KEY), JSON.stringify(scores));
  }
}

function resetExamScores() {
  localStorage.removeItem(storageKey(EXAM_KEY));
}

// Couleur selon le pourcentage : vert, or ou rouge.
function examColor(pct) {
  if (pct >= 80) return 'var(--correct)';
  if (pct >= 60) return 'var(--accent)';
  return 'var(--wrong)';
}

// ─── ÉCRAN 1 : LISTE DES SUJETS ─────────────────────────────────────────────
function openExamens() {
  document.getElementById('examens-niveau').textContent = niveauActif;

  const sujets = examensActifs();
  const scores = getExamScores();
  let html = '';

  if (!sujets.length) {
    html += '<div class="ex-empty">Pas encore de sujet complet pour le niveau ' +
      escHtml(niveauActif) + '.</div>';
  }

  sujets.forEach(ex => {
    const total = examTotal(ex);
    const best = scores[ex.id];
    let bestHtml = '<span class="lecon-pill">Pas encore fait</span>';
    if (best) {
      const color = examColor(Math.round(best.best / best.total * 100));
      bestHtml = '<span class="lecon-pill" style="color:' + color + ';border-color:' + color + '">' +
        'Meilleur score ' + best.best + ' / ' + best.total + '</span>';
    }

    html +=
      '<div class="lecon-card" style="--lc:' + ex.couleur + '" onclick="startExamen(\'' + ex.id + '\')">' +
        '<div class="lecon-card-accent" style="background:' + ex.couleur + '"></div>' +
        '<div class="lecon-card-body">' +
          '<div class="lecon-card-num">' + escHtml(ex.titre.toUpperCase()) + '</div>' +
          '<div class="lecon-card-titre">' + escHtml(ex.titre_fr) + '</div>' +
          '<div class="lecon-card-counts">' +
            '<span class="lecon-pill">' + ex.parties.length + ' parties</span>' +
            '<span class="lecon-pill">' + total + ' points</span>' +
            bestHtml +
          '</div>' +
        '</div>' +
        '<div class="lecon-arrow">›</div>' +
      '</div>';
  });

  // L'ancien examen (questions tirées au hasard dans les leçons) reste disponible.
  html +=
    '<div class="lecon-card" onclick="startSession(\'exam\')">' +
      '<div class="lecon-card-accent" style="background:var(--muted)"></div>' +
      '<div class="lecon-card-body">' +
        '<div class="lecon-card-num">ENTRAÎNEMENT</div>' +
        '<div class="lecon-card-titre">Questions aléatoires</div>' +
        '<div class="lecon-card-sous">50 questions tirées des leçons du niveau</div>' +
      '</div>' +
      '<div class="lecon-arrow">›</div>' +
    '</div>';

  document.getElementById('examens-list').innerHTML = html;
  showView('view-examens');
}

// ─── ÉCRAN 2 : PASSAGE DU SUJET ─────────────────────────────────────────────
function startExamen(examId) {
  exam = examens.find(e => e.id === examId);
  if (!exam) return;

  // Une case vide (null) par réponse attendue.
  examAnswers = exam.parties.map(p => examItems(p).map(() => null));
  examPart = 0;
  examBlank = 0;
  examOnlyErrors = false;

  document.getElementById('ex-num').textContent = exam.titre.toUpperCase();
  showView('view-examen');
  renderExamPart();
}

// Quitter en cours de route : on prévient si des réponses seraient perdues.
function quitExamen() {
  const started = examAnswers.some(part => part.some(a => a !== null));
  if (started && !confirm('Quitter ce sujet ? Tes réponses seront perdues.')) return;
  openExamens();
}

// Affiche la partie courante (texte, questions, barre du bas).
function renderExamPart() {
  const part = exam.parties[examPart];
  const nb = examItems(part).length;

  document.getElementById('ex-titre').textContent =
    'Partie ' + (examPart + 1) + ' / ' + exam.parties.length;
  renderExamSteps();

  let html =
    '<div class="ex-head">' +
      '<div class="ex-section">' + escHtml(part.section) + ' · ' + nb + ' points</div>' +
      '<div class="ex-part-titre">' + escHtml(part.titre) + '</div>' +
      '<div class="ex-consigne">' + escHtml(part.consigne) + '</div>' +
    '</div>';

  if (part.type === 'trous') {
    html += '<div class="ex-text">' + examLinesHtml(part, examBlankHtml) + '</div>';
  } else {
    html += '<div class="ex-text read">' + examLinesHtml(part) + '</div>';
    part.questions.forEach((q, i) => html += examQuestionHtml(q, i));
  }

  document.getElementById('ex-body').innerHTML = html;
  renderExamTray();

  document.getElementById('ex-prev').disabled = examPart === 0;
  document.getElementById('ex-next').textContent =
    examPart === exam.parties.length - 1 ? 'Terminer' : 'Suivant';
}

// Une case par partie : montre où on en est et permet de sauter à une partie.
function renderExamSteps() {
  let html = '';
  exam.parties.forEach((p, i) => {
    const answers = examAnswers[i];
    let cls = 'ex-step';
    if (answers.every(a => a !== null)) cls += ' done';
    else if (answers.some(a => a !== null)) cls += ' started';
    if (i === examPart) cls += ' current';
    html += '<button class="' + cls + '" onclick="examGoTo(' + i + ')">' + (i + 1) + '</button>';
  });
  document.getElementById('ex-steps').innerHTML = html;
}

// ─── TEXTE D'UNE PARTIE ─────────────────────────────────────────────────────
// renderBlank(i) fabrique le HTML du trou n° i. Il n'est pas le même pendant
// l'examen (bouton à remplir) et dans la correction (réponse corrigée).
function examLinesHtml(part, renderBlank) {
  let html = '';
  if (part.chapeau) html += '<div class="ex-chapeau">' + escHtml(part.chapeau) + '</div>';

  part.lignes.forEach(ligne => {
    const label = ligne[0];
    const texte = examFillBlanks(ligne[1], renderBlank);
    if (label === '•') {
      html += '<div class="ex-line ex-bullet">' + texte + '</div>';
    } else if (label) {
      html += '<div class="ex-line"><span class="ex-label">' + escHtml(label) + '</span>' + texte + '</div>';
    } else {
      html += '<div class="ex-line">' + texte + '</div>';
    }
  });
  return html;
}

// Remplace chaque {n} du texte par le HTML du trou correspondant.
function examFillBlanks(texte, renderBlank) {
  // "Wat {1} Dir?" -> ['Wat ', '1', ' Dir?'] : les numéros sont aux positions impaires.
  const morceaux = texte.split(/\{(\d+)\}/);
  let html = '';
  morceaux.forEach((m, i) => {
    if (i % 2 === 0) html += escHtml(m);
    else html += renderBlank(Number(m) - 1);
  });
  return html;
}

// Trou pendant l'examen : un bouton. On appuie dessus pour le sélectionner.
function examBlankHtml(i) {
  const val = examAnswers[examPart][i];
  let cls = 'ex-blank';
  if (i === examBlank) cls += ' active';
  if (val) cls += ' filled';
  return '<button class="' + cls + '" id="ex-blank-' + i + '" onclick="examSelectBlank(' + i + ')">' +
    '<span class="ex-blank-num">' + (i + 1) + '</span>' + (val ? escHtml(val) : '') +
    '</button>';
}

// Question à choix pendant l'examen.
function examQuestionHtml(q, i) {
  const val = examAnswers[examPart][i];
  // Réponses longues : une par ligne. Réponses courtes : côte à côte.
  const longues = q.choix.some(c => c.length > 20);

  let html =
    '<div class="ex-q">' +
      '<div class="ex-q-text"><span class="ex-q-num">' + (i + 1) + '</span>' + escHtml(q.question) + '</div>' +
      '<div class="ex-opts' + (longues ? ' stack' : '') + '">';
  q.choix.forEach((c, k) => {
    html += '<button class="ex-opt' + (val === c ? ' selected' : '') + '" ' +
      'onclick="examAnswer(' + i + ',' + k + ')">' + escHtml(c) + '</button>';
  });
  return html + '</div></div>';
}

// ─── BARRE DU BAS : MOTS À PLACER ───────────────────────────────────────────
// Liste commune (banque) ou les 3 propositions du trou sélectionné.
function examOptions(part) {
  return part.banque || part.trous[examBlank].choix;
}

function renderExamTray() {
  const tray = document.getElementById('ex-tray');
  const part = exam.parties[examPart];
  if (part.type !== 'trous') { tray.classList.add('hidden'); return; }

  const answers = examAnswers[examPart];
  let html = '<div class="ex-tray-titre">Trou ' + (examBlank + 1) + ' sur ' + answers.length + '</div>' +
    '<div class="ex-chips">';

  examOptions(part).forEach((mot, k) => {
    let cls = 'ex-chip';
    if (answers[examBlank] === mot) cls += ' selected';        // mot du trou sélectionné
    else if (part.banque && answers.includes(mot)) cls += ' used'; // déjà placé ailleurs
    html += '<button class="' + cls + '" onclick="examPick(' + k + ')">' + escHtml(mot) + '</button>';
  });

  tray.innerHTML = html + '</div>';
  tray.classList.remove('hidden');
}

// ─── ACTIONS PENDANT L'EXAMEN ───────────────────────────────────────────────
function examSelectBlank(i) {
  examBlank = i;
  renderExamPart();
}

// Place un mot dans le trou sélectionné, puis passe au trou vide suivant.
function examPick(k) {
  const part = exam.parties[examPart];
  const answers = examAnswers[examPart];
  const mot = examOptions(part)[k];

  if (answers[examBlank] === mot) {
    answers[examBlank] = null; // deuxième appui sur le même mot = on le retire
  } else {
    // Banque : un mot ne sert qu'une fois, on le retire de son ancien trou.
    if (part.banque) {
      const ancien = answers.indexOf(mot);
      if (ancien !== -1) answers[ancien] = null;
    }
    answers[examBlank] = mot;

    const suivant = examNextEmpty(answers, examBlank);
    if (suivant !== -1) examBlank = suivant;
  }

  renderExamPart();
  examShowBlank();
}

// Cherche le prochain trou vide après "depuis" (en repartant du début si besoin).
function examNextEmpty(answers, depuis) {
  for (let pas = 1; pas <= answers.length; pas++) {
    const i = (depuis + pas) % answers.length;
    if (answers[i] === null) return i;
  }
  return -1; // tout est rempli
}

// Fait défiler la page si le trou sélectionné est caché (en haut ou sous la barre).
function examShowBlank() {
  const el = document.getElementById('ex-blank-' + examBlank);
  if (!el) return;
  const box = el.getBoundingClientRect();
  const barre = document.querySelector('.ex-bottom').offsetHeight;
  if (box.top < 60 || box.bottom > window.innerHeight - barre - 10) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

// Choisit une réponse à une question (un 2e appui sur la même réponse l'enlève).
function examAnswer(i, k) {
  const answers = examAnswers[examPart];
  const choix = exam.parties[examPart].questions[i].choix[k];
  answers[i] = answers[i] === choix ? null : choix;
  renderExamPart();
}

function examGoTo(i) {
  examPart = i;
  examBlank = 0;
  // On se place directement sur le premier trou vide de la partie.
  const answers = examAnswers[i];
  if (answers[0] !== null) {
    const vide = examNextEmpty(answers, 0);
    if (vide !== -1) examBlank = vide;
  }
  renderExamPart();
  window.scrollTo(0, 0);
}

function examPrev() {
  if (examPart > 0) examGoTo(examPart - 1);
}

function examNext() {
  if (examPart < exam.parties.length - 1) examGoTo(examPart + 1);
  else examFinish();
}

// ─── FIN : CALCUL DU SCORE ──────────────────────────────────────────────────
function examFinish() {
  let vides = 0;
  examAnswers.forEach(part => part.forEach(a => { if (a === null) vides++; }));
  if (vides > 0) {
    const msg = vides === 1
      ? 'Il reste 1 réponse vide. Terminer quand même ?'
      : 'Il reste ' + vides + ' réponses vides. Terminer quand même ?';
    if (!confirm(msg)) return;
  }

  examRes = examComputeResult();
  saveExamScore(exam.id, examRes.score, examRes.total);
  examOnlyErrors = false;
  document.getElementById('exr-titre').textContent = exam.titre;
  renderExamResult();
  showView('view-examen-result');
}

// Compte les points : au total, par partie et par section.
function examComputeResult() {
  const res = { score: 0, total: 0, parties: [], sections: [] };

  exam.parties.forEach((part, p) => {
    const items = examItems(part);
    let ok = 0;
    items.forEach((item, i) => { if (examAnswers[p][i] === item.reponse) ok++; });

    res.parties.push({ score: ok, total: items.length });
    res.score += ok;
    res.total += items.length;

    let section = res.sections.find(s => s.nom === part.section);
    if (!section) {
      section = { nom: part.section, score: 0, total: 0 };
      res.sections.push(section);
    }
    section.score += ok;
    section.total += items.length;
  });

  return res;
}

// ─── ÉCRAN 3 : SCORE + CORRECTION ───────────────────────────────────────────
function renderExamResult() {
  const pct = Math.round(examRes.score / examRes.total * 100);
  const erreurs = examRes.total - examRes.score;
  const color = examColor(pct);
  const mention = pct >= 80 ? 'Très bien' : pct >= 60 ? 'Réussi' : 'À retravailler';

  // Score global : anneau qui se remplit selon le pourcentage.
  let html =
    '<div class="exr-hero">' +
      '<div class="exr-ring" style="--pct:' + pct + ';--ring:' + color + '">' +
        '<div class="exr-ring-in"><b>' + examRes.score + '</b><span>sur ' + examRes.total + '</span></div>' +
      '</div>' +
      '<div class="exr-mention" style="color:' + color + '">' + mention + ' · ' + pct + ' %</div>' +
      '<div class="exr-sub">Score sans l\'expression écrite ni l\'oral</div>' +
    '</div>';

  // Score par section.
  html += '<div class="exr-sections">';
  examRes.sections.forEach(s => {
    const p = Math.round(s.score / s.total * 100);
    html +=
      '<div class="exr-row">' +
        '<div class="exr-row-top">' +
          '<span>' + escHtml(s.nom) + '<small>' + escHtml(EXAM_SECTIONS_FR[s.nom] || '') + '</small></span>' +
          '<b>' + s.score + ' / ' + s.total + '</b>' +
        '</div>' +
        '<div class="exr-bar"><div style="width:' + p + '%;background:' + examColor(p) + '"></div></div>' +
      '</div>';
  });
  html += '</div>';

  // Filtre de la correction.
  html +=
    '<div class="exr-filter">' +
      '<button class="' + (examOnlyErrors ? '' : 'active') + '" onclick="examSetFilter(false)">Toute la correction</button>' +
      '<button class="' + (examOnlyErrors ? 'active' : '') + '" onclick="examSetFilter(true)">Mes erreurs (' + erreurs + ')</button>' +
    '</div>';

  if (examOnlyErrors && erreurs === 0) {
    html += '<div class="ex-empty">Aucune erreur sur ce sujet.</div>';
  }

  exam.parties.forEach((part, p) => {
    const r = examRes.parties[p];
    if (examOnlyErrors && r.score === r.total) return; // partie sans erreur : masquée
    html += examCorrectionHtml(part, p, r);
  });

  html +=
    '<button class="dash-btn primary" onclick="startExamen(\'' + exam.id + '\')">Refaire ce sujet</button>' +
    '<button class="dash-btn" onclick="openExamens()">Autres sujets</button>';

  document.getElementById('exr-body').innerHTML = html;
}

function examSetFilter(onlyErrors) {
  examOnlyErrors = onlyErrors;
  renderExamResult();
}

// Correction d'une partie : ta réponse en rouge si fausse, la bonne en vert.
function examCorrectionHtml(part, p, r) {
  const answers = examAnswers[p];
  const pct = Math.round(r.score / r.total * 100);

  let html =
    '<div class="exr-part">' +
      '<div class="exr-part-head">' +
        '<div><small>Partie ' + (p + 1) + ' · ' + escHtml(part.section) + '</small>' + escHtml(part.titre) + '</div>' +
        '<span class="exr-badge" style="color:' + examColor(pct) + ';border-color:' + examColor(pct) + '">' +
          r.score + ' / ' + r.total + '</span>' +
      '</div>';

  if (part.type === 'trous') {
    // Le texte complet, avec chaque trou corrigé à sa place.
    html += '<div class="ex-text">' + examLinesHtml(part, i => examFixedBlankHtml(part, answers, i)) + '</div>';

    // Sous le texte : le détail de chaque erreur, avec l'explication.
    part.trous.forEach((trou, i) => {
      if (answers[i] === trou.reponse) return;
      html +=
        '<div class="exr-err">' +
          '<span class="ex-q-num">' + (i + 1) + '</span>' +
          '<div>' +
            '<div>' + (answers[i]
              ? '<s class="exr-ko">' + escHtml(answers[i]) + '</s>'
              : '<span class="exr-ko">Pas de réponse</span>') +
            ' → <span class="exr-ok">' + escHtml(trou.reponse) + '</span></div>' +
            (trou.note ? '<div class="exr-note">' + escHtml(trou.note) + '</div>' : '') +
          '</div>' +
        '</div>';
    });
  } else {
    // Le texte est replié pour garder la correction courte.
    html += '<details class="exr-details"><summary>Revoir le texte</summary>' +
      '<div class="ex-text read">' + examLinesHtml(part) + '</div></details>';

    part.questions.forEach((q, i) => {
      const juste = answers[i] === q.reponse;
      if (examOnlyErrors && juste) return;

      html += '<div class="ex-q"><div class="ex-q-text"><span class="ex-q-num">' + (i + 1) + '</span>' +
        escHtml(q.question) + '</div><div class="ex-opts stack">';
      q.choix.forEach(c => {
        let cls = 'ex-opt fixed';
        let marque = '';
        if (c === q.reponse) { cls += ' ok'; marque = 'Bonne réponse'; }
        else if (c === answers[i]) { cls += ' ko'; marque = 'Ta réponse'; }
        if (c === q.reponse && juste) marque = 'Ta réponse, correcte';
        html += '<div class="' + cls + '"><span>' + escHtml(c) + '</span><small>' + marque + '</small></div>';
      });
      html += '</div>';
      if (answers[i] === null) html += '<div class="exr-note exr-ko">Pas de réponse</div>';
      if (q.note) html += '<div class="exr-note">' + escHtml(q.note) + '</div>';
      html += '</div>';
    });
  }

  return html + '</div>';
}

// Trou dans la correction : vert si juste, sinon réponse barrée + bonne réponse.
function examFixedBlankHtml(part, answers, i) {
  const bonne = part.trous[i].reponse;
  const num = '<span class="ex-blank-num">' + (i + 1) + '</span>';
  if (answers[i] === bonne) {
    return '<span class="ex-fix ok">' + num + escHtml(bonne) + '</span>';
  }
  return '<span class="ex-fix ko">' + num + '<s>' + escHtml(answers[i] || '…') + '</s></span>' +
    '<span class="ex-fix ok">' + escHtml(bonne) + '</span>';
}
