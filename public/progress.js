// ─── PROGRESSION DURABLE ────────────────────────────────────────────────────
// Système de score et de niveau par leçon / par type d'exercice / par question.
// Tout est stocké dans localStorage pour survivre au refresh.
//
// Structure stockée :
// {
//   "1": {                              // id de leçon
//     "quiz":     { "1": 2, "2": 3 },   // id de question -> niveau (1, 2 ou 3)
//     "trous":    { "1": 1 },
//     "ecriture": { "0": 2, "1": 3 }    // pour l'écriture, l'id = index dans le tableau
//   }
// }

const STORAGE_KEY = 'luxProgress';

// Poids d'apparition selon le niveau (niveau bas = revient plus souvent).
const LEVEL_WEIGHTS = { 1: 5, 2: 3, 3: 1 };

// ─── LECTURE / ÉCRITURE DU STOCKAGE ─────────────────────────────────────────
function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ─── NIVEAU D'UNE QUESTION ──────────────────────────────────────────────────
// Retourne 1, 2 ou 3. Par défaut 1 (nouveau / fragile).
function getQuestionLevel(leconId, type, questionId) {
  const progress = getProgress();
  if (progress[leconId] && progress[leconId][type] && progress[leconId][type][questionId]) {
    return progress[leconId][type][questionId];
  }
  return 1;
}

// Fait évoluer le niveau après une réponse.
// bonne réponse -> +1 (max 3) | mauvaise réponse -> -1 (min 1)
function updateQuestionLevel(leconId, type, questionId, correct) {
  const progress = getProgress();
  if (!progress[leconId]) progress[leconId] = {};
  if (!progress[leconId][type]) progress[leconId][type] = {};

  let level = progress[leconId][type][questionId] || 1;
  if (correct) {
    level = Math.min(3, level + 1);
  } else {
    level = Math.max(1, level - 1);
  }

  progress[leconId][type][questionId] = level;
  saveProgress(progress);
}

// ─── IDENTIFIANT STABLE D'UNE QUESTION ──────────────────────────────────────
// quiz et trous ont un champ "id". L'écriture n'en a pas -> on utilise l'index.
function getQuestionId(type, question, index) {
  if (type === 'ecriture') return index;
  return question.id;
}

// ─── ORDRE PONDÉRÉ DES QUESTIONS ────────────────────────────────────────────
// Retourne une copie du tableau de questions, mélangée selon le niveau.
// Chaque question reçoit un champ "_qid" (son identifiant stable).
// Les questions de niveau bas (poids élevé) ont tendance à apparaître en premier.
// Aucune question ne disparaît jamais : elles sont toutes présentes.
function getWeightedQuestions(leconId, type, questions) {
  return questions
    .map((q, index) => {
      const qid = getQuestionId(type, q, index);
      const level = getQuestionLevel(leconId, type, qid);
      const weight = LEVEL_WEIGHTS[level];
      // Clé de tri pondérée : plus le poids est grand, plus la clé est petite,
      // donc la question remonte vers le début de la liste.
      const sortKey = Math.random() / weight;
      return { ...q, _qid: qid, _sortKey: sortKey };
    })
    .sort((a, b) => a._sortKey - b._sortKey);
}

// ─── POURCENTAGE PAR TYPE ───────────────────────────────────────────────────
// niveau 1 -> 0%, niveau 2 -> 50%, niveau 3 -> 100%. Moyenne sur les questions.
function typePercent(leconId, type, questions) {
  if (!questions || !questions.length) return 0;
  let sum = 0;
  questions.forEach((q, index) => {
    const qid = getQuestionId(type, q, index);
    const level = getQuestionLevel(leconId, type, qid);
    sum += (level - 1) / 2;
  });
  return Math.round((sum / questions.length) * 100);
}

// ─── PROGRESSION GLOBALE D'UNE LEÇON ────────────────────────────────────────
function calculateLessonProgress(leconId) {
  const lecon = lecons.find(l => l.id === leconId);
  if (!lecon) return { quiz: 0, trous: 0, ecriture: 0, global: 0 };

  const quiz = typePercent(leconId, 'quiz', lecon.quiz);
  const trous = typePercent(leconId, 'trous', lecon.trous);
  const ecriture = typePercent(leconId, 'ecriture', lecon.ecriture || []);
  const global = Math.round((quiz + trous + ecriture) / 3);

  return { quiz, trous, ecriture, global };
}

// ─── BADGE (label + couleur) SELON LE POURCENTAGE GLOBAL ────────────────────
function progressBadge(percent) {
  if (percent >= 90) return { label: 'maîtrisé', color: '#5ad4a8' };
  if (percent >= 70) return { label: 'bien', color: '#8fd98f' };
  if (percent >= 40) return { label: 'en cours', color: '#e8c547' };
  return { label: 'début', color: '#e8857a' };
}

// ─── AFFICHAGE : POINTS DE NIVEAU (1, 2 ou 3 points) ────────────────────────
function renderLevelDots(el, level) {
  if (!el) return;
  el.innerHTML = '';
  el.title = 'Niveau ' + level + '/3';
  for (let i = 1; i <= 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'level-dot' + (i <= level ? ' on' : '');
    el.appendChild(dot);
  }
}

// ─── AFFICHAGE : ZONE PROGRESSION DANS LA LEÇON ─────────────────────────────
// Retourne le HTML du bloc "Progression" affiché en haut du cours.
function renderLessonProgress() {
  const p = calculateLessonProgress(currentLecon.id);
  const row = (nom, val) => `
    <div class="lp-row">
      <span class="lp-nom">${nom}</span>
      <div class="lp-bar"><div style="width:${val}%"></div></div>
      <b class="lp-val">${val}%</b>
    </div>`;

  return `
    <div class="lesson-progress">
      <div class="lesson-progress-titre">Progression</div>
      ${row('Quiz', p.quiz)}
      ${row('À trou', p.trous)}
      ${row('Écriture', p.ecriture)}
      <div class="lp-row lp-global">
        <span class="lp-nom">Global</span>
        <div class="lp-bar"><div style="width:${p.global}%"></div></div>
        <b class="lp-val">${p.global}%</b>
      </div>
    </div>`;
}

// ─── AFFICHAGE : POURCENTAGE SUR LES CARTES DE L'ACCUEIL ────────────────────
function renderHomeProgress() {
  document.querySelectorAll('.lecon-progress').forEach(el => {
    const id = Number(el.dataset.lecon);
    const percent = calculateLessonProgress(id).global;
    const badge = progressBadge(percent);
    el.textContent = percent + '% · ' + badge.label;
    el.style.color = badge.color;
    el.style.borderColor = badge.color + '55';
  });
}
