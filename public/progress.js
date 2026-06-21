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
const WRONG_KEY = 'luxWrong';   // erreurs ACTIVES (compteur qui descend), par question
const STREAK_KEY = 'luxStreak'; // série quotidienne
const STATS_KEY = 'luxQuestionStats'; // historique durable, par question (jamais effacé au succès)

// ─── PROFIL DE STOCKAGE (isolation par utilisateur) ─────────────────────────
// Chaque profil a ses propres clés localStorage, pour éviter qu'un compte
// connecté contamine la progression anonyme ou celle d'un autre compte.
//   - non connecté -> "anonymous"
//   - connecté     -> "user:<user_id>"
let currentStorageProfile = 'anonymous';

function setStorageProfile(profile) {
  currentStorageProfile = profile || 'anonymous';
  console.log('Storage profile:', currentStorageProfile);
  console.log('Progress key:', storageKey('luxProgress'));
}

// Construit la clé localStorage propre au profil courant.
function storageKey(baseKey) {
  return baseKey + ':' + currentStorageProfile;
}

// Poids d'apparition selon le niveau (niveau bas = revient plus souvent).
const LEVEL_WEIGHTS = { 1: 5, 2: 3, 3: 1 };

// ─── LECTURE / ÉCRITURE DU STOCKAGE ─────────────────────────────────────────
function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(storageKey(STORAGE_KEY))) || {};
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(progress));
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

// ─── RÉINITIALISATION ───────────────────────────────────────────────────────
// Efface toute la progression d'une leçon (niveaux + erreurs + historique).
function resetLessonProgress(leconId) {
  const progress = getProgress();
  delete progress[leconId];
  saveProgress(progress);

  const wrong = getWrongStore();
  delete wrong[leconId];
  saveWrongStore(wrong);

  const stats = getStatsStore();
  delete stats[leconId];
  saveStatsStore(stats);
}

// Efface TOUTE la progression (toutes les leçons + série + historique).
function resetProgress() {
  localStorage.removeItem(storageKey(STORAGE_KEY));
  localStorage.removeItem(storageKey(WRONG_KEY));
  localStorage.removeItem(storageKey(STREAK_KEY));
  localStorage.removeItem(storageKey(STATS_KEY));
}

// ─── ERREURS : COMPTEUR PAR QUESTION ────────────────────────────────────────
function getWrongStore() {
  try {
    return JSON.parse(localStorage.getItem(storageKey(WRONG_KEY))) || {};
  } catch (e) {
    return {};
  }
}

function saveWrongStore(store) {
  localStorage.setItem(storageKey(WRONG_KEY), JSON.stringify(store));
}

function getWrongCount(leconId, type, questionId) {
  const store = getWrongStore();
  if (store[leconId] && store[leconId][type] && store[leconId][type][questionId]) {
    return store[leconId][type][questionId];
  }
  return 0;
}

function incrementWrongCount(leconId, type, questionId) {
  const store = getWrongStore();
  if (!store[leconId]) store[leconId] = {};
  if (!store[leconId][type]) store[leconId][type] = {};
  store[leconId][type][questionId] = (store[leconId][type][questionId] || 0) + 1;
  saveWrongStore(store);
}

function decrementWrongCount(leconId, type, questionId) {
  const store = getWrongStore();
  if (!store[leconId] || !store[leconId][type] || !store[leconId][type][questionId]) return;
  store[leconId][type][questionId] = Math.max(0, store[leconId][type][questionId] - 2);
  // Si le compteur tombe à 0, on supprime l'entrée pour garder le store propre
  if (store[leconId][type][questionId] === 0) {
    delete store[leconId][type][questionId];
  }
  saveWrongStore(store);
}

// ─── STATISTIQUES HISTORIQUES (DURABLES) ────────────────────────────────────
// Contrairement aux erreurs actives (luxWrong), cet historique n'est jamais
// effacé quand l'utilisateur réussit. Il alimente le focus "Difficile".
function getStatsStore() {
  try {
    return JSON.parse(localStorage.getItem(storageKey(STATS_KEY))) || {};
  } catch (e) {
    return {};
  }
}

function saveStatsStore(store) {
  localStorage.setItem(storageKey(STATS_KEY), JSON.stringify(store));
}

// Stats d'une question. Si rien n'existe encore, on reconstruit depuis les
// erreurs actives déjà enregistrées (migration douce, sans bug).
function getQuestionStats(leconId, type, questionId) {
  const store = getStatsStore();
  const existing = store[leconId] && store[leconId][type] && store[leconId][type][questionId];
  if (existing) return existing;

  const wrong = getWrongCount(leconId, type, questionId);
  return {
    attempts: 0,
    correct: 0,
    wrongTotal: wrong,
    correctStreak: 0,
    difficultyScore: wrong * 3,
    lastSeenAt: null,
    lastWrongAt: null
  };
}

// Met à jour l'historique après une réponse.
function updateQuestionStats(leconId, type, questionId, correct) {
  const store = getStatsStore();
  if (!store[leconId]) store[leconId] = {};
  if (!store[leconId][type]) store[leconId][type] = {};

  const s = store[leconId][type][questionId] || getQuestionStats(leconId, type, questionId);
  const now = new Date().toISOString();

  s.attempts += 1;
  s.lastSeenAt = now;
  if (correct) {
    s.correct += 1;
    s.correctStreak += 1;
    s.difficultyScore = Math.max(0, s.difficultyScore - 1);
  } else {
    s.wrongTotal += 1;
    s.correctStreak = 0;
    s.difficultyScore += 3;
    s.lastWrongAt = now;
  }

  store[leconId][type][questionId] = s;
  saveStatsStore(store);
}

// ─── SÉRIE QUOTIDIENNE (STREAK) ─────────────────────────────────────────────
function getStreak() {
  try {
    return JSON.parse(localStorage.getItem(storageKey(STREAK_KEY))) || { count: 0, lastActive: null };
  } catch (e) {
    return { count: 0, lastActive: null };
  }
}

function saveStreak(data) {
  localStorage.setItem(storageKey(STREAK_KEY), JSON.stringify(data));
}

// Renvoie une date locale au format AAAA-MM-JJ (offset en jours).
function dayString(offset) {
  const d = new Date();
  d.setDate(d.getDate() + (offset || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

// Appelé à chaque réponse. Valide le jour et met à jour la série.
function updateStreak() {
  const today = dayString(0);
  const data = getStreak();

  if (data.lastActive === today) return;            // déjà actif aujourd'hui

  if (data.lastActive === dayString(-1)) data.count += 1; // actif hier -> +1
  else data.count = 1;                                    // trou -> repart à 1

  data.lastActive = today;
  saveStreak(data);
}

// ─── PROGRESSION D'UNE QUESTION (niveau + erreurs réunis) ───────────────────
function getQuestionProgress(leconId, type, questionId) {
  return {
    level: getQuestionLevel(leconId, type, questionId),
    wrong: getWrongCount(leconId, type, questionId)
  };
}

// Met à jour la progression après une réponse.
// changeLevel = false en mode examen (on ne touche pas aux niveaux).
function updateQuestionProgress(leconId, type, questionId, correct, changeLevel) {
  if (changeLevel !== false) {
    updateQuestionLevel(leconId, type, questionId, correct);
  }
  // Historique d'abord : la migration lit getWrongCount AVANT qu'il ne change,
  // sinon la 1ère erreur d'une question serait comptée deux fois.
  updateQuestionStats(leconId, type, questionId, correct);
  if (!correct) {
    incrementWrongCount(leconId, type, questionId);
  } else {
    decrementWrongCount(leconId, type, questionId);
  }
  updateStreak();
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// ─── TOUTES LES QUESTIONS (à plat, tous types et toutes leçons) ─────────────
function getAllQuestions() {
  const all = [];
  lecons.forEach(l => {
    (l.quiz || []).forEach(q => all.push({ leconId: l.id, type: 'quiz', qid: q.id, q }));
    (l.trous || []).forEach(q => all.push({ leconId: l.id, type: 'trous', qid: q.id, q }));
    (l.ecriture || []).forEach((q, i) => all.push({ leconId: l.id, type: 'ecriture', qid: i, q }));
  });
  return all;
}

// ─── SÉLECTION : RÉVISION (pondérée par niveau) ─────────────────────────────
function getReviewQuestions(limit) {
  const all = getAllQuestions();
  const weighted = all.map(item => {
    const level = getQuestionLevel(item.leconId, item.type, item.qid);
    const weight = LEVEL_WEIGHTS[level];
    return { item, sortKey: Math.random() / weight };
  });
  weighted.sort((a, b) => a.sortKey - b.sortKey);
  return weighted.slice(0, limit || 20).map(w => w.item);
}

// ─── SÉLECTION : EXAMEN (aléatoire équilibré) ───────────────────────────────
function getExamQuestions(limit) {
  const all = getAllQuestions();
  const shuffled = all.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit || 50);
}

// ─── SÉLECTION : ERREURS FRÉQUENTES (les plus ratées) ───────────────────────
function getFrequentErrors(limit) {
  const all = getAllQuestions();
  return all
    .map(item => ({ item, wrong: getWrongCount(item.leconId, item.type, item.qid) }))
    .filter(x => x.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, limit || 10)
    .map(x => x.item);
}

// ─── SÉLECTION : RÉVISION CONFIGURÉE PAR L'UTILISATEUR ──────────────────────
// leconIds : ids des leçons à inclure
// types    : parmi 'quiz', 'trous', 'ecriture'
// focus    : 'aleatoire' | 'connu' (à consolider) | 'difficile'
// limit    : nombre max de questions (plafonné à 20)

// Une question est "déjà vue" UNIQUEMENT si elle a un historique réel.
// On n'utilise jamais le niveau seul : toutes les questions démarrent au niveau 1.
function hasSeenQuestion(item) {
  const stats = getQuestionStats(item.leconId, item.type, item.qid);
  return stats.attempts > 0;
}

// Une question est "difficile" seulement si elle a déjà été vue ET a posé problème.
function isDifficultQuestion(item) {
  const stats = getQuestionStats(item.leconId, item.type, item.qid);
  return stats.attempts > 0 && (
    stats.wrongTotal > 0 ||
    stats.difficultyScore > 0 ||
    stats.lastWrongAt !== null
  );
}

// Erreur "récente" = moins de 7 jours.
function isRecentWrong(lastWrongAt) {
  if (!lastWrongAt) return false;
  const days = (Date.now() - new Date(lastWrongAt).getTime()) / 86400000;
  return days <= 7;
}

// Priorité de difficulté (plus c'est haut, plus la question remonte).
function getDifficultyPriority(item) {
  const s = getQuestionStats(item.leconId, item.type, item.qid);
  const level = getQuestionLevel(item.leconId, item.type, item.qid);

  const lowLevelBonus = level === 1 ? 6 : level === 2 ? 3 : 0;
  const recentWrongBonus = isRecentWrong(s.lastWrongAt) ? 4 : 0;

  return s.difficultyScore * 5
    + Math.min(s.wrongTotal, 10) * 2
    + recentWrongBonus
    + lowLevelBonus
    - s.correctStreak * 1.5;
}

// Priorité de consolidation (focus "à consolider").
// Vise les notions encore fragiles : niveau 2 d'abord, puis niveau 1 déjà vu,
// puis niveau 3 ancien. Bonus léger d'ancienneté.
function getConsolidationPriority(item) {
  const s = getQuestionStats(item.leconId, item.type, item.qid);
  const level = getQuestionLevel(item.leconId, item.type, item.qid);

  let p = level === 2 ? 10 : level === 1 ? 5 : 2;
  if (level < 3) p += 3;                 // pas encore maîtrisée -> remonte
  if (s.lastSeenAt) {                     // vue il y a longtemps -> remonte un peu
    const days = (Date.now() - new Date(s.lastSeenAt).getTime()) / 86400000;
    p += Math.min(days, 30) * 0.1;
  }
  return p;
}

// Construit le pool brut (leçons + types), sans tri ni coupe.
function buildReviewPool(leconIds, types) {
  return getAllQuestions()
    .filter(item => leconIds.includes(item.leconId))
    .filter(item => types.includes(item.type));
}

function getConfiguredReview(leconIds, types, focus, limit) {
  limit = Math.min(limit || 20, 20);
  let all = buildReviewPool(leconIds, types);

  if (focus === 'difficile') {
    // On calcule la priorité UNE fois par question, puis on trie.
    // (Avant, le tri recalculait la priorité — et relisait le localStorage —
    //  à chaque comparaison, d'où plusieurs secondes d'attente.)
    all = all.filter(isDifficultQuestion)
      .map(item => ({ item, prio: getDifficultyPriority(item) }))
      .sort((a, b) => b.prio - a.prio)
      .map(d => d.item);
  }
  else if (focus === 'connu') {
    all = all.filter(hasSeenQuestion)
      .map(item => ({ item, prio: getConsolidationPriority(item) }))
      .sort((a, b) => b.prio - a.prio)
      .map(d => d.item);
  }
  else {
    all = all.slice().sort(() => Math.random() - 0.5); // aléatoire
  }

  // Jamais de répétition, jamais de remplissage aléatoire : on coupe au max.
  return all.slice(0, limit);
}

// Nombre de questions disponibles pour un focus (non plafonné, pour l'affichage).
function getAvailableReviewCount(leconIds, types, focus) {
  let all = buildReviewPool(leconIds, types);
  if (focus === 'connu') all = all.filter(hasSeenQuestion);
  else if (focus === 'difficile') all = all.filter(isDifficultQuestion);
  return all.length;
}

// Compte les 3 focus EN UNE SEULE PASSE (1 seule lecture du localStorage).
// Utilisé par l'écran de configuration : évite de relire les stats des
// milliers de fois à chaque case cochée (le calcul était trop lent).
function getReviewCounts(leconIds, types) {
  const pool = buildReviewPool(leconIds, types);
  const store = getStatsStore(); // lu UNE fois, pas par question
  let connu = 0, difficile = 0;
  for (const item of pool) {
    const byLecon = store[item.leconId];
    const s = byLecon && byLecon[item.type] && byLecon[item.type][item.qid];
    if (s && s.attempts > 0) {
      connu++;
      if (s.wrongTotal > 0 || s.difficultyScore > 0 || s.lastWrongAt !== null) difficile++;
    }
  }
  return { total: pool.length, connu, difficile };
}

// ─── STATISTIQUES D'UNE LEÇON ───────────────────────────────────────────────
// Maîtrisée seulement si TOUTES les questions sont au niveau 3.
function calculateLessonStats(leconId) {
  const lecon = lecons.find(l => l.id === leconId);
  if (!lecon) return { percent: 0, n1: 0, n2: 0, n3: 0, total: 0, status: 'début', mastered: false };

  const levels = [];
  (lecon.quiz || []).forEach(q => levels.push(getQuestionLevel(leconId, 'quiz', q.id)));
  (lecon.trous || []).forEach(q => levels.push(getQuestionLevel(leconId, 'trous', q.id)));
  (lecon.ecriture || []).forEach((q, i) => levels.push(getQuestionLevel(leconId, 'ecriture', i)));

  let n1 = 0, n2 = 0, n3 = 0;
  levels.forEach(lv => {
    if (lv === 1) n1++;
    else if (lv === 2) n2++;
    else n3++;
  });

  const total = levels.length;
  const percent = calculateLessonProgress(leconId).global;

  const mastered = total > 0 && n3 === total;

  let status;
  if (mastered) status = 'maîtrisé';
  else if (percent >= 70) status = 'bien';
  else if (percent >= 40) status = 'en cours';
  else status = 'début';

  return { percent, n1, n2, n3, total, status, mastered };
}

// ─── STATISTIQUES GLOBALES ──────────────────────────────────────────────────
function calculateGlobalStats() {
  const all = getAllQuestions();
  let sum = 0, mastered = 0, toReview = 0;

  all.forEach(item => {
    const lv = getQuestionLevel(item.leconId, item.type, item.qid);
    sum += (lv - 1) / 2;
    if (lv === 3) mastered++;
    if (lv === 1) toReview++;
  });

  let lessonsMastered = 0;
  lecons.forEach(l => { if (calculateLessonStats(l.id).mastered) lessonsMastered++; });

  const total = all.length;
  return {
    percent: total ? Math.round((sum / total) * 100) : 0,
    masteredQuestions: mastered,
    totalQuestions: total,
    lessonsMastered,
    totalLessons: lecons.length,
    toReview
  };
}

// ─── COULEUR SELON LE STATUT ────────────────────────────────────────────────
function statusColor(status) {
  if (status === 'maîtrisé') return '#5ad4a8';
  if (status === 'bien') return '#8fd98f';
  if (status === 'en cours') return '#e8c547';
  return '#e8857a';
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
      <button class="lp-reset" onclick="confirmResetLesson()">Réinitialiser cette leçon</button>
    </div>`;
}

// ─── AFFICHAGE : POURCENTAGE SUR LES CARTES DE LA LISTE DES LEÇONS ──────────
function renderLessonsProgress() {
  document.querySelectorAll('.lecon-progress').forEach(el => {
    const id = Number(el.dataset.lecon);
    const stats = calculateLessonStats(id);
    const color = statusColor(stats.status);
    el.textContent = stats.percent + '% · ' + stats.status;
    el.style.color = color;
    el.style.borderColor = color + '55';
  });
}
