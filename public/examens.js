// ─── EXAMENS : SUJETS COMPLETS ──────────────────────────────────────────────
// Un sujet = un fichier JSON dans data/examens/<niveau>/ (ex : A1.2/examen-01.json).
// Ajouter un sujet = ajouter un fichier. Rien à changer dans le code.
// La liste est triée par titre : « Annale 1 », « Annale 2 »… puis « Sujet 1 »…
//
// Structure d'un sujet :
// {
//   "id": "a12-01", "titre": "Annale 1", "titre_fr": "2023 - 1", "couleur": "#6fb0f2",
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
//    - "lignes": [] s'il n'y a pas de texte à lire (questions seules).
//    - "questions" : [{ "question", "choix": [...], "reponse", "note" }, …]
//    - vrai/faux = un qcm avec les choix ["richteg", "falsch"].
//
// Traductions (facultatives, visibles seulement dans la correction, bouton FR) :
//    - ligne : 3e élément = traduction française  ["Client", "Et ass u mir!", "C'est à moi !"]
//    - "chapeau_fr", et dans une question "question_fr" et "choix_fr" (même ordre que "choix").
//
// Explication d'une question (dans la correction, toujours visible) :
//    - "preuve" : [passage exact du texte, sa traduction]  puis "note" : pourquoi c'est vrai / faux.

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
let examChecked = [];        // examChecked[partie] = true une fois la partie corrigée
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
  examens.forEach(ex => localStorage.removeItem(storageKey('luxExamRedaction:' + ex.id)));
}

// État d'un score (spec 48) : 'ok' = réussi (60 % et plus, vert), 'ko' = à
// retravailler (rouge). L'or reste réservé à l'action. La couleur vient du CSS.
function examClasse(pct) {
  return pct >= 60 ? 'ok' : 'ko';
}

// ─── ÉCRAN 1 : LISTE DES SUJETS ─────────────────────────────────────────────
function openExamens() {
  renderExamens();
  showView('view-examens');
}

// Fin d'examen → liste des sujets (spec 49). Destination unique, partagée par
// « ← Sujets », « Autres sujets » et le Retour du téléphone : elle ne dépend pas
// de l'historique (qui peut être incomplet, ex. mode recette). Le niveau de
// l'annale est conservé et la liste recalculée (meilleurs scores à jour).
// openExamens() retire le résultat de l'historique : pas de boucle au Retour.
function retourSujets() {
  if (exam && exam.niveau && exam.niveau !== niveauActif) choisirNiveau(exam.niveau);
  openExamens();
}

// Liste des sujets (aussi réaffichée au Retour : le meilleur score est à jour).
function renderExamens() {
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
    // Spec 48 : surface neutre, informations sur une ligne de texte (pas de
    // pastilles) ; le meilleur score seulement si le sujet a été fait.
    let scoreHtml = '';
    if (best) {
      const classe = examClasse(Math.round(best.best / best.total * 100));
      scoreHtml = '<span class="ex-carte-score ' + classe + '">Meilleur score ' + best.best + ' / ' + best.total + '</span>';
    }

    html +=
      '<button class="ex-carte" onclick="startExamen(\'' + ex.id + '\')">' +
        '<span class="ex-carte-texte">' +
          '<span class="ex-carte-num">' + escHtml(ex.titre) + '</span>' +
          '<span class="ex-carte-titre">' + escHtml(ex.titre_fr) + '</span>' +
          '<span class="ex-carte-info">' + ex.parties.length + ' parties · ' + total + ' points' + (best ? '' : ' · Pas encore fait') + '</span>' +
          scoreHtml +
        '</span>' +
        '<span class="chevron-l">' + ICONES.droite + '</span>' +
      '</button>';
  });

  // L'ancien examen (questions tirées au hasard dans les leçons) reste disponible.
  html +=
    '<button class="ex-carte" onclick="startSession(\'exam\')">' +
      '<span class="ex-carte-texte">' +
        '<span class="ex-carte-num">Entraînement</span>' +
        '<span class="ex-carte-titre">Questions aléatoires</span>' +
        '<span class="ex-carte-info">50 questions tirées des leçons du niveau</span>' +
      '</span>' +
      '<span class="chevron-l">' + ICONES.droite + '</span>' +
    '</button>';

  document.getElementById('examens-list').innerHTML = html;
}

// ─── ÉCRAN 2 : PASSAGE DU SUJET ─────────────────────────────────────────────
function startExamen(examId) {
  exam = examens.find(e => e.id === examId);
  if (!exam) return;

  // Une case vide (null) par réponse attendue.
  examAnswers = exam.parties.map(p => examItems(p).map(() => null));
  examChecked = exam.parties.map(() => false); // aucune partie corrigée au départ
  examPart = 0;
  examBlank = 0;
  examOnlyErrors = false;

  document.getElementById('ex-num').textContent = exam.titre.toUpperCase();
  showView('view-examen');
  renderExamPart();
}

// Quitter en cours de route : on prévient si des réponses seraient perdues.
async function quitExamen() {
  const started = examAnswers.some(part => part.some(a => a !== null));
  if (started && !(await confirmer({ titre: 'Quitter ce sujet ?', texte: 'Tes réponses seront perdues.', ok: 'Quitter', annuler: 'Rester', danger: true }))) return;
  retour(); // l'écran réellement précédent (spec 15), en général la liste des sujets
}

// Affiche la partie courante. Chaque partie se corrige avant de passer à la
// suivante : tant qu'elle n'est pas corrigée on affiche l'exercice, ensuite sa correction.
function renderExamPart() {
  const part = exam.parties[examPart];
  const corrigee = examChecked[examPart];

  document.getElementById('ex-titre').textContent =
    'Partie ' + (examPart + 1) + ' / ' + exam.parties.length;
  renderExamSteps();

  if (corrigee) {
    // Partie corrigée : les réponses ne sont plus modifiables.
    document.getElementById('ex-body').innerHTML =
      examCorrectionHtml(part, examPart, examPartScore(examPart));
    document.getElementById('ex-tray').classList.add('hidden');
  } else {
    document.getElementById('ex-body').innerHTML = examExerciseHtml(part);
    renderExamTray();
  }

  // Bouton principal : Corriger, puis Suivant (ou Voir le score à la fin).
  let label = 'Corriger';
  if (corrigee) {
    const derniere = examPart === exam.parties.length - 1;
    const toutCorrige = examChecked.every(c => c);
    label = derniere && toutCorrige ? 'Voir le score' : 'Suivant';
  }
  document.getElementById('ex-next').textContent = label;
  document.getElementById('ex-prev').disabled = examPart === 0;
}

// L'exercice à faire : consigne, puis texte à trous ou questions.
function examExerciseHtml(part) {
  const nb = examItems(part).length;

  let html =
    '<div class="ex-head">' +
      '<div class="ex-section">' + escHtml(part.section) + ' · ' + nb + ' points</div>' +
      '<div class="ex-part-titre">' + escHtml(part.titre) + '</div>' +
      '<div class="ex-consigne">' + escHtml(part.consigne) + '</div>' +
    '</div>';

  if (part.type === 'trous') {
    html += '<div class="ex-text">' + examLinesHtml(part, examBlankHtml) + '</div>';
  } else {
    const texte = examLinesHtml(part);
    if (texte) html += '<div class="ex-text read">' + texte + '</div>'; // pas de cadre vide
    part.questions.forEach((q, i) => html += examQuestionHtml(q, i));
  }
  return html;
}

// Score d'une partie : nombre de bonnes réponses sur le nombre de points.
function examPartScore(p) {
  const items = examItems(exam.parties[p]);
  let ok = 0;
  items.forEach((item, i) => { if (examAnswers[p][i] === item.reponse) ok++; });
  return { score: ok, total: items.length };
}

// Une case par partie : montre où on en est et permet de sauter à une partie.
// Partie corrigée : verte si réussie, rouge sinon ; entamée ou remplie : or
// (activité en cours) ; partie affichée : entourée.
function renderExamSteps() {
  let html = '';
  exam.parties.forEach((p, i) => {
    const answers = examAnswers[i];
    let cls = 'ex-step';
    let etat = 'à faire';
    if (examChecked[i]) {
      const r = examPartScore(i);
      cls += ' checked ' + examClasse(Math.round(r.score / r.total * 100));
      etat = 'corrigée, ' + r.score + ' sur ' + r.total;
    } else if (answers.every(a => a !== null)) {
      cls += ' done';
    } else if (answers.some(a => a !== null)) {
      cls += ' started';
    }
    if (i === examPart) cls += ' current';
    if (!examChecked[i] && answers.every(a => a !== null)) etat = 'remplie';
    else if (!examChecked[i] && answers.some(a => a !== null)) etat = 'commencée';
    html += '<button class="' + cls + '" aria-label="Partie ' + (i + 1) + ', ' + etat + '"' +
      (i === examPart ? ' aria-current="step"' : '') + ' onclick="examGoTo(' + i + ')">' + (i + 1) + '</button>';
  });
  document.getElementById('ex-steps').innerHTML = html;
}

// ─── TEXTE D'UNE PARTIE ─────────────────────────────────────────────────────
// renderBlank(i) fabrique le HTML du trou n° i. Il n'est pas le même pendant
// l'examen (bouton à remplir) et dans la correction (réponse corrigée).
// traduire = true : on ajoute la traduction sous chaque ligne (cachée tant
// qu'on n'appuie pas sur le bouton FR). Jamais pendant l'examen.
function examLinesHtml(part, renderBlank, traduire) {
  let html = '';
  if (part.chapeau) {
    html += '<div class="ex-chapeau">' + escHtml(part.chapeau) +
      (traduire ? examFrBtn(part.chapeau_fr) + examFrHtml(part.chapeau_fr) : '') + '</div>';
  }

  part.lignes.forEach(ligne => {
    const label = ligne[0];
    let texte = examFillBlanks(ligne[1], renderBlank);
    if (traduire) texte += examFrBtn(ligne[2]) + examFrHtml(ligne[2]);

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

// Traduction française (cachée par défaut, voir le bouton FR). Rien si elle manque.
function examFrHtml(fr) {
  return fr ? '<em class="ex-fr">' + escHtml(fr) + '</em>' : '';
}

// Petit bouton FR au bout d'une ligne ou d'une question (rien s'il n'y a pas de traduction).
function examFrBtn(fr) {
  return fr ? '<button class="ex-fr-mini" onclick="examToggleLine(this)">FR</button>' : '';
}

// Petit bouton FR : affiche ou cache la traduction de cette ligne / question seulement.
function examToggleLine(btn) {
  const bloc = btn.closest('.ex-q, .ex-line, .ex-chapeau');
  const visible = bloc.classList.toggle('open');
  btn.classList.toggle('active', visible);
}

// La partie a-t-elle au moins une traduction ? (sinon pas de bouton FR)
function examHasFr(part) {
  if (part.chapeau_fr) return true;
  if (part.lignes.some(l => l[2])) return true;
  return (part.questions || []).some(q => q.question_fr || q.choix_fr);
}

// Grand bouton FR (en-tête de la partie) : affiche ou cache toutes les traductions de la partie.
function examToggleFr(btn) {
  const bloc = btn.closest('.exr-part');
  const visible = bloc.classList.toggle('show-fr');
  btn.classList.toggle('active', visible);
  // Le texte des questions est replié : on l'ouvre pour voir sa traduction.
  const details = bloc.querySelector('details');
  if (visible && details) details.open = true;
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
  // Deux images cliquables lorsqu'une illustration SVG est fournie.
  const illustrees = examHasIllustrations(q);
  const longues = !illustrees && q.choix.some(c => c.length > 20);

  let html =
    '<div class="ex-q">' +
      (q.horloge ? examClockHtml(q.horloge) : '') +
      '<div class="ex-q-text"><span class="ex-q-num">' + (i + 1) + '</span>' + escHtml(q.question) + '</div>' +
      '<div class="ex-opts' + (illustrees ? ' pictures' : longues ? ' stack' : '') + '">';
  q.choix.forEach((c, k) => {
    if (illustrees) {
      html += '<button type="button" class="ex-opt ex-image-choice' + (val === c ? ' selected' : '') + '" ' +
        'aria-label="Image ' + (k + 1) + ' : ' + escHtml(c) + '" aria-pressed="' + (val === c) + '" ' +
        'onclick="examAnswer(' + i + ',' + k + ')">' +
        '<span class="ex-image-num" aria-hidden="true">' + (k + 1) + '</span>' +
        examIllustrationSvg(q.illustrations[k]) + '</button>';
    } else {
      html += '<button class="ex-opt' + (val === c ? ' selected' : '') + '" ' +
        'onclick="examAnswer(' + i + ',' + k + ')">' + escHtml(c) + '</button>';
    }
  });
  return html + '</div></div>';
}

// Horloges SVG optionnelles (annales contenant "horloge": "09:45").
function examClockHtml(time) {
  const m = /^(\d{2}):(\d{2})$/.exec(time || '');
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return '';
  const h = Number(m[1]), min = Number(m[2]);
  const x = (deg, r) => (60 + r * Math.sin(deg * Math.PI / 180)).toFixed(2);
  const y = (deg, r) => (60 - r * Math.cos(deg * Math.PI / 180)).toFixed(2);
  let svg = '<svg viewBox="0 0 120 120" role="img" aria-label="Horloge à lire" ' +
    'style="display:block;width:160px;max-width:100%;margin:0 auto 1rem" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="60" cy="60" r="56" fill="#222120" stroke="#f5cf4d" stroke-width="2"/>';
  for (let i = 1; i <= 12; i++) {
    const a = i * 30;
    svg += '<text x="' + x(a, 43) + '" y="' + (Number(y(a, 43)) + 3) +
      '" fill="#f6f1e9" font-size="10" font-family="sans-serif" text-anchor="middle">' + i + '</text>';
  }
  const hAngle = ((h % 12) + min / 60) * 30, mAngle = min * 6;
  svg += '<line x1="60" y1="60" x2="' + x(hAngle, 26) + '" y2="' + y(hAngle, 26) +
    '" stroke="#f6f1e9" stroke-width="3.6" stroke-linecap="round"/>' +
    '<line x1="60" y1="60" x2="' + x(mAngle, 36) + '" y2="' + y(mAngle, 36) +
    '" stroke="#f6f1e9" stroke-width="2.5" stroke-linecap="round"/>' +
    '<circle cx="60" cy="60" r="3" fill="#f5cf4d"/></svg>';
  return svg;
}


// Illustrations SVG natives des propositions (sans images externes).
// Les identifiants autorisés sont fixes ; les textes du JSON ne deviennent pas du HTML.
function examIllustrationSvg(id) {
  const box = (x,y,w,h,c,rx=3) => '<rect x="' + x + '" y="' + y + '" width="' + w +
    '" height="' + h + '" rx="' + rx + '" fill="' + c + '" stroke="#6f726c" stroke-width="1.6"/>';
  const line = (d,c='#77818a',w=2) => '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"/>';
  const bag = x => box(x,108,30,42,'#b9734d',6) +
    line('M'+(x+7)+' 110v-7q8-15 16 0v7','#79533e',4);
  const sofa = box(64,74,136,68,'#9bb7c5',12) +
    box(77,94,110,42,'#c1d2d7',9) + box(58,101,27,42,'#8ba7b8',9) +
    box(180,101,27,42,'#8ba7b8',9) +
    line('M130 95v40M77 144v8M184 144v8','#657e8b',4);
  const paper = '<g transform="rotate(-5 111 103)">' +
    box(42,62,139,82,'#fffdf8',3) + box(50,71,62,8,'#a4b1b8',1) +
    line('M50 87h119M50 96h119M50 105h119M50 114h52M50 123h52M115 114h55M115 123h55','#b2bdc4') + '</g>';
  const glasses = (x,y) => '<g transform="translate('+x+' '+y+')" stroke="#43515c" stroke-width="3.5" fill="none">' +
    '<rect x="0" y="0" width="25" height="22" rx="10"/><rect x="35" y="0" width="25" height="22" rx="10"/>' +
    '<path d="M25 7q5-7 10 0M0 5l-8-4M60 5l8-4"/></g>';
  const closet = box(79,44,111,120,'#c88f59',1) + box(74,39,122,9,'#ad7443',1) +
    box(86,52,46,103,'#dfac78',2) + box(137,52,46,103,'#dfac78',2) +
    '<circle cx="128" cy="103" r="2.8" fill="#81573f"/><circle cx="141" cy="103" r="2.8" fill="#81573f"/>';
  const cat = (x,y,s) => '<g transform="translate('+x+' '+y+') scale('+s+')">' +
    line('M-15 71C-53 94-48 47-27 48','#798890',11) +
    '<ellipse cx="0" cy="54" rx="23" ry="27" fill="#8c9ca4"/>' +
    '<path d="M-22 19L-18 0L-5 13L6 13L19 0L23 19" fill="#8c9ca4" stroke="#5f727c" stroke-width="2"/>' +
    '<ellipse cx="0" cy="25" rx="24" ry="20" fill="#a5b1b6"/>' +
    line('M-12 54v26M12 54v26','#637783',5) +
    '<circle cx="-9" cy="24" r="4" fill="#f0c660"/><circle cx="9" cy="24" r="4" fill="#f0c660"/>' +
    '<path d="M-4 35l4 4l4-4z" fill="#d4928b"/></g>';
  const night = box(84,72,94,89,'#c48c60',3) +
    box(78,67,106,9,'#ae7346',2) + box(92,86,78,38,'#e4b98e',3) +
    '<circle cx="131" cy="108" r="3" fill="#875d3b"/>' + line('M92 131h78','#a97750');
  const pen = (x,y) => '<g transform="translate('+x+' '+y+') rotate(-15)">' +
    box(0,0,48,9,'#458fa8',2) + '<path d="M48 1l13 3.5L48 8z" fill="#c69c71"/>' + '</g>';
  const building = x => box(x,31,105,127,'#b4c5cb',1) + box(x-5,26,115,9,'#8ba5ae',1) +
    box(x+41,115,23,43,'#78949c',1) +
    [12,71].map(a=>[45,82].map(b=>box(x+a,b,21,25,'#e6f2f2',1)).join('')).join('');
  const car = (x,y) => '<g transform="translate('+x+' '+y+')">' +
    box(0,17,65,23,'#63a8bc',8) +
    '<path d="M10 18l13-16h26l12 16z" fill="#7bb9c9" stroke="#496773" stroke-width="2"/>' +
    box(25,4,16,12,'#e6f5f5',1) +
    '<circle cx="15" cy="40" r="7" fill="#364d58"/><circle cx="52" cy="40" r="7" fill="#364d58"/>' +
    '</g>';
  const sign = x => line('M'+x+' 108v50','#657882',3) + box(x-13,82,27,30,'#408db7',3) +
    '<text x="'+x+'" y="104" font-size="22" font-family="Arial,sans-serif" fill="#fff" font-weight="bold" text-anchor="middle">P</text>';
  let art;
  switch(id) {
    case 'sac-gauche': art=sofa+bag(21); break;
    case 'sac-droite': art=sofa+bag(211); break;
    case 'lunettes-sur': art=paper+glasses(80,93); break;
    case 'lunettes-cote': art=paper+glasses(192,99); break;
    case 'chat-devant': art=closet+cat(131,110,.67); break;
    case 'chat-dessus': art=closet+cat(131,-12,.64); break;
    case 'stylo-dessus': art=night+pen(107,33); break;
    case 'stylo-dans': art=night+box(91,88,80,43,'#af7953',2)+box(96,93,70,31,'#ebcda8',2)+pen(107,104); break;
    case 'parking-devant': art=building(79)+car(99,121)+sign(226); break;
    case 'parking-cote': art=building(48)+car(176,121)+sign(239); break;
    default: return '';
  }
  return '<svg viewBox="0 0 260 180" class="ex-image-svg" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="260" height="180" rx="12" fill="#f2efe7"/>' +
    box(0,159,260,22,'#e8e0d2',0) + art + '</svg>';
}
function examHasIllustrations(q) {
  return Array.isArray(q.illustrations) && q.illustrations.length === q.choix.length &&
    q.illustrations.every(id => !!examIllustrationSvg(id));
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

// Bouton principal : corrige la partie, puis passe à la suivante.
function examNext() {
  if (!examChecked[examPart]) { examCheck(); return; }

  if (examPart < exam.parties.length - 1) { examGoTo(examPart + 1); return; }

  // Dernière partie : s'il reste une partie non corrigée, on y retourne.
  const reste = examChecked.indexOf(false);
  if (reste !== -1) examGoTo(reste);
  else examFinish();
}

// Corrige la partie courante. Ensuite ses réponses ne peuvent plus changer.
async function examCheck() {
  let vides = 0;
  examAnswers[examPart].forEach(a => { if (a === null) vides++; });
  if (vides > 0) {
    const msg = vides === 1
      ? 'Il reste 1 réponse vide. Corriger quand même ?'
      : 'Il reste ' + vides + ' réponses vides. Corriger quand même ?';
    if (!(await confirmer({ titre: msg, ok: 'Corriger', annuler: 'Compléter' }))) return;
  }

  examChecked[examPart] = true;
  renderExamPart();
  window.scrollTo(0, 0);
}

// ─── FIN : CALCUL DU SCORE ──────────────────────────────────────────────────
// Appelée quand toutes les parties sont corrigées.
function examFinish() {
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
    const r = examPartScore(p);
    const ok = r.score;
    const items = examItems(part);

    res.parties.push(r);
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

// Exercice de rédaction conservé hors du score automatique (correction humaine).
// Brouillon local et isolé par profil, comme les meilleurs scores.
function examRedactionHtml() {
  if (!exam.redaction) return '';
  const r = exam.redaction;
  const texte = localStorage.getItem(storageKey('luxExamRedaction:' + exam.id)) || '';
  const mots = texte.trim() ? texte.trim().split(/\s+/).length : 0;
  const bareme = (r.bareme || []).map(x => escHtml(x[0]) + ' (' + x[1] + ')').join(' · ');
  return '<section class="exr-part">' +
    '<div class="exr-part-head"><div><small>Schrëftlechen Ausdrock · ' + (r.points || 10) +
    ' points (correction humaine)</small>' + escHtml(r.titre) + '</div></div>' +
    '<div style="padding:1rem">' +
    '<p class="ex-consigne">' + escHtml(r.consigne) + '</p>' +
    '<p class="exr-note">' + escHtml(r.consigne_fr || '') + '</p>' +
    '<textarea class="ecr-input" style="width:100%;min-height:175px;margin-top:1rem" ' +
    'oninput="examSaveRedaction(this)" placeholder="Votre rédaction en luxembourgeois…">' +
    escHtml(texte) + '</textarea>' +
    '<div class="exr-note" id="exr-redaction-count">' + mots + ' / ' + (r.min_mots || 70) +
    ' mots · Brouillon enregistré sur cet appareil</div>' +
    '<div class="exr-note">Barème : ' + bareme + '</div>' +
    '<div class="exr-note">Les 10 points de rédaction ne sont pas attribués automatiquement.</div>' +
    '</div></section>';
}
function examSaveRedaction(el) {
  const texte = el.value;
  localStorage.setItem(storageKey('luxExamRedaction:' + exam.id), texte);
  const mots = texte.trim() ? texte.trim().split(/\s+/).length : 0;
  document.getElementById('exr-redaction-count').textContent =
    mots + ' / ' + (exam.redaction.min_mots || 70) + ' mots · Brouillon enregistré sur cet appareil';
}

// ─── ÉCRAN 3 : SCORE + CORRECTION ───────────────────────────────────────────
function renderExamResult() {
  const pct = Math.round(examRes.score / examRes.total * 100);
  const erreurs = examRes.total - examRes.score;
  const classe = examClasse(pct);
  const mention = pct >= 80 ? 'Très bien' : pct >= 60 ? 'Réussi' : 'À retravailler';

  // Score global : anneau qui se remplit selon le pourcentage.
  let html =
    '<div class="exr-hero">' +
      '<div class="exr-ring ' + classe + '" style="--pct:' + pct + '">' +
        '<div class="exr-ring-in"><b>' + examRes.score + '</b><span>sur ' + examRes.total + '</span></div>' +
      '</div>' +
      '<div class="exr-mention ' + classe + '">' + mention + ' · ' + pct + ' %</div>' +
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
        '<div class="exr-bar ' + examClasse(p) + '"><div style="width:' + p + '%"></div></div>' +
      '</div>';
  });
  html += '</div>';

  html += examRedactionHtml();

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
    '<div class="exr-actions">' +
      '<button class="lien-or" id="exr-autres" onclick="retourSujets()">Autres sujets</button>' +
    '</div>';

  document.getElementById('exr-body').innerHTML = html;
  // Action principale toujours visible en bas, dès le haut de l'écran (.cta-fixe)
  document.getElementById('exr-cta').innerHTML =
    '<button class="pc-btn primary wide big" id="exr-refaire" onclick="startExamen(\'' + exam.id + '\')">Refaire ce sujet</button>';
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
        '<div class="exr-head-right">' +
          (examHasFr(part) ? '<button class="exr-fr-btn" onclick="examToggleFr(this)">FR</button>' : '') +
          '<span class="exr-badge ' + examClasse(pct) + '">' +
            r.score + ' / ' + r.total + '</span>' +
        '</div>' +
      '</div>';

  if (part.type === 'trous') {
    // Le texte complet, avec chaque trou corrigé à sa place.
    html += '<div class="ex-text">' + examLinesHtml(part, i => examFixedBlankHtml(part, answers, i), true) + '</div>';

    // Sous le texte : l'explication de chaque trou, en vert si juste, en rouge si faux.
    part.trous.forEach((trou, i) => {
      const juste = answers[i] === trou.reponse;
      if (examOnlyErrors && juste) return; // « Mes erreurs » : on n'affiche que les fautes

      let reponse;
      if (juste) {
        reponse = '<span class="exr-ok">' + escHtml(trou.reponse) + '</span>';
      } else {
        const tienne = answers[i]
          ? '<s class="exr-ko">' + escHtml(answers[i]) + '</s>'
          : '<span class="exr-ko">Pas de réponse</span>';
        reponse = tienne + ' → <span class="exr-ok">' + escHtml(trou.reponse) + '</span>';
      }

      html +=
        '<div class="exr-item ' + (juste ? 'ok' : 'ko') + '">' +
          '<span class="ex-q-num">' + (i + 1) + '</span>' +
          '<div>' +
            '<div>' + reponse + '</div>' +
            (trou.note ? '<div class="exr-note">' + escHtml(trou.note) + '</div>' : '') +
          '</div>' +
        '</div>';
    });
  } else {
    // Le texte est replié pour garder la correction courte.
    const texte = examLinesHtml(part, null, true);
    if (texte) {
      html += '<details class="exr-details"><summary>Revoir le texte</summary>' +
        '<div class="ex-text read">' + texte + '</div></details>';
    }

    part.questions.forEach((q, i) => {
      const juste = answers[i] === q.reponse;
      if (examOnlyErrors && juste) return;

      const illustrees = examHasIllustrations(q);
      html += '<div class="ex-q">' + (q.horloge ? examClockHtml(q.horloge) : '') +
        '<div class="ex-q-text"><span class="ex-q-num">' + (i + 1) + '</span>' +
        '<div>' + escHtml(q.question) + examFrBtn(q.question_fr) +
        examFrHtml(q.question_fr) + '</div></div><div class="ex-opts' + (illustrees ? ' pictures' : ' stack') + '">';
      q.choix.forEach((c, k) => {
        let cls = 'ex-opt fixed';
        let marque = '';
        if (c === q.reponse) { cls += ' ok'; marque = 'Bonne réponse'; }
        else if (c === answers[i]) { cls += ' ko'; marque = 'Ta réponse'; }
        if (c === q.reponse && juste) marque = 'Ta réponse, correcte';
        const fr = q.choix_fr ? examFrHtml(q.choix_fr[k]) : '';
        if (illustrees) cls += ' ex-image-choice';
        html += '<div class="' + cls + '"><div class="ex-opt-txt">' +
          (illustrees ? examIllustrationSvg(q.illustrations[k]) + '<span class="ex-image-answer">' + escHtml(c) + '</span>' : '<span>' + escHtml(c) + '</span>') +
          fr + '</div><small>' + marque + '</small></div>';
      });
      html += '</div>';
      if (answers[i] === null) html += '<div class="exr-note exr-ko">Pas de réponse</div>';
      // Le passage du texte qui donne la réponse, avec sa traduction.
      if (q.preuve) {
        html += '<div class="exr-preuve">' +
          '<span class="exr-preuve-lu">« ' + escHtml(q.preuve[0]) + ' »</span>' +
          '<span class="exr-preuve-fr">' + escHtml(q.preuve[1]) + '</span>' +
        '</div>';
      }
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
