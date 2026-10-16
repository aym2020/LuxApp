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
// quiz et trous ont un champ "id". L'écriture des anciennes leçons n'en a pas
// -> on utilise l'index. Les leçons en unités (v2) ont un "id" partout.
function getQuestionId(type, question, index) {
  if (type === 'ecriture') return ecritureId(question, index);
  return question.id;
}

// Identifiant d'une phrase d'écriture : son "id" s'il existe, sinon son index.
function ecritureId(question, index) {
  if (question && question.id != null) return question.id;
  return index;
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
  localStorage.removeItem(storageKey('luxParcours')); // unité en cours (leçons v2)
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
  marquerJour(1); // a pratiqué aujourd'hui
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// ─── MEILLEUR SCORE PAR UNITÉ (leçons en unités) ────────────────────────────
// Rangé dans la même structure que les niveaux, sous la clé "unites" :
//   progress["8"].unites = { "1": 84, "2": 100 }   (pourcentage, 0 à 100)
// Pourquoi ici : la fusion cloud garde déjà la valeur MAX de chaque clé.
// Le meilleur score ne peut donc jamais baisser, et l'ancienne version de
// l'app conserve ces valeurs sans les lire.
function getUnitBest(leconId, uniteId) {
  const progress = getProgress();
  const byLecon = progress[leconId];
  if (byLecon && byLecon.unites && byLecon.unites[uniteId] != null) {
    return byLecon.unites[uniteId];
  }
  return null; // unité jamais terminée
}

function saveUnitBest(leconId, uniteId, percent) {
  const progress = getProgress();
  if (!progress[leconId]) progress[leconId] = {};
  if (!progress[leconId].unites) progress[leconId].unites = {};
  const old = progress[leconId].unites[uniteId];
  progress[leconId].unites[uniteId] = old == null ? percent : Math.max(old, percent);
  saveProgress(progress);
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// ─── SANS FAUTE (leçons en unités) ──────────────────────────────────────────
// Unité réussie au moins une fois en entier, tout juste du premier coup.
// Rangé comme les meilleurs scores : progress["8"].sansfaute = { "1": 1 }.
// Une fois gagné, ne se perd jamais (la fusion cloud garde le max).
function getSansFaute(leconId, uniteId) {
  const byLecon = getProgress()[leconId];
  return !!(byLecon && byLecon.sansfaute && byLecon.sansfaute[uniteId]);
}

function saveSansFaute(leconId, uniteId) {
  const progress = getProgress();
  if (!progress[leconId]) progress[leconId] = {};
  if (!progress[leconId].sansfaute) progress[leconId].sansfaute = {};
  progress[leconId].sansfaute[uniteId] = 1;
  saveProgress(progress);
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// ─── « + » ET MISSION (leçons en unités) ────────────────────────────────────
// Rangés comme les meilleurs scores, sur 3 niveaux (leçon -> clé -> valeur),
// pour que la fusion cloud (max) les garde et que la v1 les ignore :
//   progress["8"].plus    = { "1": 1 }     -> le « + » de l'unité 1 est fait
//   progress["8"].mission = { "score": 80 } -> meilleur score de la scène finale
function getPlusFait(leconId, uniteId) {
  const byLecon = getProgress()[leconId];
  return !!(byLecon && byLecon.plus && byLecon.plus[uniteId]);
}

function savePlusFait(leconId, uniteId) {
  const progress = getProgress();
  if (!progress[leconId]) progress[leconId] = {};
  if (!progress[leconId].plus) progress[leconId].plus = {};
  progress[leconId].plus[uniteId] = 1;
  saveProgress(progress);
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// Meilleur score de la mission (0-100), ou null si jamais jouée.
function getMissionBest(leconId) {
  const byLecon = getProgress()[leconId];
  if (byLecon && byLecon.mission && byLecon.mission.score != null) return byLecon.mission.score;
  return null;
}

function saveMissionBest(leconId, percent) {
  const progress = getProgress();
  if (!progress[leconId]) progress[leconId] = {};
  if (!progress[leconId].mission) progress[leconId].mission = {};
  const old = progress[leconId].mission.score;
  progress[leconId].mission.score = old == null ? percent : Math.max(old, percent);
  saveProgress(progress);
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// ─── JOURNAL DES JOURS (série, total, semaine) ──────────────────────────────
// progress.jours.actif = { "2026-10-16": 2, ... }
//   1 = l'utilisateur a pratiqué ce jour-là
//   2 = objectif du jour atteint (révision du jour faite, ou une unité finie)
// Rangé dans la progression pour être synchronisé (fusion cloud = max).
function getJours() {
  const p = getProgress();
  return (p.jours && p.jours.actif) || {};
}

function marquerJour(valeur) {
  const progress = getProgress();
  if (!progress.jours) progress.jours = {};
  if (!progress.jours.actif) progress.jours.actif = {};
  const today = dayString(0);
  const old = progress.jours.actif[today] || 0;
  if (valeur <= old) return; // rien de nouveau
  progress.jours.actif[today] = valeur;
  saveProgress(progress);
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// Série = jours d'affilée avec l'objectif atteint.
// Si l'objectif n'est pas encore atteint aujourd'hui, la série d'hier compte encore.
function serieActuelle() {
  const jours = getJours();
  let offset = jours[dayString(0)] === 2 ? 0 : -1;
  let serie = 0;
  while (jours[dayString(offset)] === 2) { serie++; offset--; }
  return serie;
}

// Nombre total de jours de pratique : ne baisse jamais.
function totalJours() {
  return Object.keys(getJours()).length;
}

// Les 7 jours de la semaine en cours (lundi -> dimanche).
function semaineEnCours() {
  const jours = getJours();
  const d = new Date();
  const lundi = -((d.getDay() + 6) % 7); // décalage vers le lundi
  const lettres = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const out = [];
  for (let i = 0; i < 7; i++) {
    const offset = lundi + i;
    out.push({ lettre: lettres[i], valeur: jours[dayString(offset)] || 0, aujourdhui: offset === 0, futur: offset > 0 });
  }
  return out;
}

// ─── RÉVISION ESPACÉE ───────────────────────────────────────────────────────
// Aucune donnée en plus : la date de révision se calcule à partir des stats
// déjà enregistrées (lastSeenAt + bonnes réponses d'affilée).
//   0 ou 1 bonne réponse d'affilée -> revient le lendemain (J+1)
//   2 -> J+3 · 3 -> J+7 · 4 -> J+14 · 5 et plus -> J+30
// Une erreur remet la série à 0 : la question revient le lendemain.
const INTERVALLES = [1, 1, 3, 7, 14, 30];

// Date (AAAA-MM-JJ) d'une date ISO décalée de n jours.
function ajouterJours(dateIso, n) {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + j;
}

// Date (AAAA-MM-JJ) à laquelle une question revient.
function dateRevision(stats) {
  const jours = INTERVALLES[Math.min(stats.correctStreak || 0, INTERVALLES.length - 1)];
  return ajouterJours(stats.lastSeenAt, jours);
}

// ─── ÉTALEMENT DE L'HISTORIQUE V1 ───────────────────────────────────────────
// Le jour où la v2 arrive, tout l'historique de la v1 serait « à réviser » d'un
// coup (des centaines de questions). On étale ces anciennes questions sur les
// 30 jours qui suivent DEBUT_V2. Le jour choisi pour une question est toujours
// le même (calculé à partir de son identifiant) : rien à stocker.
// Les questions avec une erreur active ne sont pas étalées : elles restent dues.
const DEBUT_V2 = '2026-10-16';

// Petit nombre entre 0 et 29, toujours le même pour un même texte.
function numeroDeJour(texte) {
  let total = 0;
  for (let i = 0; i < texte.length; i++) total = (total * 31 + texte.charCodeAt(i)) % 1000003;
  return total % 30;
}

// Date de révision d'un item, avec l'étalement de l'historique v1.
function dateRevisionItem(item, stats, erreurActive) {
  const date = dateRevision(stats);
  const avantV2 = stats.lastSeenAt.slice(0, 10) < DEBUT_V2;
  if (!avantV2 || erreurActive) return date;
  const etalee = ajouterJours(DEBUT_V2, numeroDeJour(item.leconId + '-' + item.type + '-' + item.qid));
  return date > etalee ? date : etalee; // la plus tardive des deux
}

// Tous les items révisables d'une leçon, mot caché compris (type "motcache").
function itemsRevision(l) {
  const items = [];
  if (Array.isArray(l.unites)) {
    (l.flashcards || []).forEach(q => items.push({ leconId: l.id, type: 'motcache', qid: q.id, q }));
  }
  (l.quiz || []).forEach(q => items.push({ leconId: l.id, type: 'quiz', qid: q.id, q }));
  (l.trous || []).forEach(q => items.push({ leconId: l.id, type: 'trous', qid: q.id, q }));
  (l.ecriture || []).forEach((q, i) => items.push({ leconId: l.id, type: 'ecriture', qid: ecritureId(q, i), q }));
  return items;
}

// Fait le point sur une liste de leçons, en UNE lecture des stats :
//   - dus     : questions à réviser aujourd'hui, dans l'ordre de priorité :
//               1. erreurs actives  2. les plus en retard  3. les plus fragiles
//   - parLecon: { id: { vus, dus } } pour la fraîcheur de chaque leçon
function resumeRevision(listeLecons) {
  const store = getStatsStore();
  const wrong = getWrongStore();
  const today = dayString(0);
  const dus = [];
  const parLecon = {};

  listeLecons.forEach(l => {
    const r = { vus: 0, dus: 0, dusParUnite: {} };
    itemsRevision(l).forEach(item => {
      const byLecon = store[item.leconId];
      const s = byLecon && byLecon[item.type] && byLecon[item.type][item.qid];
      if (!s || !s.attempts || !s.lastSeenAt) return; // jamais vue
      r.vus++;
      const w = wrong[item.leconId] && wrong[item.leconId][item.type] && wrong[item.leconId][item.type][item.qid];
      const erreur = w > 0 ? 1 : 0;
      const date = dateRevisionItem(item, s, erreur);
      if (date <= today) {
        r.dus++;
        if (item.q.unite != null) r.dusParUnite[item.q.unite] = (r.dusParUnite[item.q.unite] || 0) + 1;
        dus.push({ item, date, erreur, serie: s.correctStreak || 0 });
      }
    });
    parLecon[l.id] = r;
  });

  dus.sort((a, b) => {
    if (a.erreur !== b.erreur) return b.erreur - a.erreur;  // erreurs d'abord
    if (a.date !== b.date) return a.date < b.date ? -1 : 1; // puis les plus en retard
    return a.serie - b.serie;                               // puis les plus fragiles
  });
  return { dus: dus.map(d => d.item), parLecon };
}

// Fraîcheur d'une leçon, de 0 (tout est à revoir) à 1 (tout est frais).
// null si aucune question n'a encore été vue.
function fraicheur(r) {
  if (!r || !r.vus) return null;
  return 1 - r.dus / r.vus;
}

// Vrai si la leçon a au moins une erreur active (compteur luxWrong > 0).
function leconHasActiveErrors(leconId) {
  const byLecon = getWrongStore()[leconId];
  if (!byLecon) return false;
  return Object.keys(byLecon).some(type =>
    Object.keys(byLecon[type]).some(qid => byLecon[type][qid] > 0)
  );
}

// ─── NIVEAU ACTIF (A1.1, A1.2…) ─────────────────────────────────────────────
// Le niveau choisi est mémorisé dans le navigateur.
let niveauActif = localStorage.getItem('luxNiveau') || 'A1.1';

// Leçons du niveau actif uniquement.
// Une leçon sans champ "niveau" est considérée comme A1.1.
function leconsActives() {
  return lecons.filter(l => (l.niveau || 'A1.1') === niveauActif);
}

// Liste des niveaux présents dans les leçons, triée (ex : ['A1.1', 'A1.2']).
function listeNiveaux() {
  const niveaux = [];
  lecons.forEach(l => {
    const n = l.niveau || 'A1.1';
    if (!niveaux.includes(n)) niveaux.push(n);
  });
  return niveaux.sort();
}

// ─── TOUTES LES QUESTIONS (à plat, tous types, leçons du niveau actif) ──────
function getAllQuestions() {
  const all = [];
  leconsActives().forEach(l => {
    (l.quiz || []).forEach(q => all.push({ leconId: l.id, type: 'quiz', qid: q.id, q }));
    (l.trous || []).forEach(q => all.push({ leconId: l.id, type: 'trous', qid: q.id, q }));
    (l.ecriture || []).forEach((q, i) => all.push({ leconId: l.id, type: 'ecriture', qid: ecritureId(q, i), q }));
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
// limit    : nombre max de questions (0 = toutes, aucun plafond)

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

// Niveau d'une question à partir d'un objet progress déjà lu (pas de relecture
// du localStorage par question : évite les ralentissements).
function levelFromStore(progress, item) {
  const byLecon = progress[item.leconId];
  const lv = byLecon && byLecon[item.type] && byLecon[item.type][item.qid];
  return lv || 1;
}

// Normalise le filtre niveau : undefined => tous les niveaux ; [] => aucun.
function levelFilter(niveaux) {
  return niveaux == null ? [1, 2, 3] : niveaux;
}

// Construit le pool brut (leçons + types + niveaux), sans tri ni coupe.
function buildReviewPool(leconIds, types, niveaux) {
  const progress = getProgress();       // lu UNE fois pour tout le pool
  const sel = levelFilter(niveaux);
  return getAllQuestions()
    .filter(item => leconIds.includes(item.leconId))
    .filter(item => types.includes(item.type))
    .filter(item => sel.includes(levelFromStore(progress, item)));
}

function getConfiguredReview(leconIds, types, focus, limit, niveaux) {
  let all = buildReviewPool(leconIds, types, niveaux);

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

  // Jamais de répétition, jamais de remplissage aléatoire.
  // limit = 0 -> toutes les questions disponibles.
  return limit ? all.slice(0, limit) : all;
}

// Nombre de questions disponibles pour un focus (non plafonné, pour l'affichage).
function getAvailableReviewCount(leconIds, types, focus, niveaux) {
  let all = buildReviewPool(leconIds, types, niveaux);
  if (focus === 'connu') all = all.filter(hasSeenQuestion);
  else if (focus === 'difficile') all = all.filter(isDifficultQuestion);
  return all.length;
}

// Compte les focus ET les niveaux EN UNE SEULE PASSE (1 lecture du localStorage).
// Utilisé par l'écran de configuration : évite de relire les stats des
// milliers de fois à chaque case cochée (le calcul était trop lent).
// - niv 1/2/3 : nombre de questions par niveau (leçons + types, sans filtre niveau)
// - total/connu/difficile : après application du filtre niveau
function getReviewCounts(leconIds, types, niveaux) {
  const pool = getAllQuestions()
    .filter(item => leconIds.includes(item.leconId))
    .filter(item => types.includes(item.type));

  const progress = getProgress();    // niveaux, lu UNE fois
  const store = getStatsStore();     // historique, lu UNE fois
  const sel = levelFilter(niveaux);

  const niv = { 1: 0, 2: 0, 3: 0 };
  let total = 0, connu = 0, difficile = 0;

  for (const item of pool) {
    const level = levelFromStore(progress, item);
    niv[level]++;

    if (!sel.includes(level)) continue; // filtre niveau

    total++;
    const byLecon = store[item.leconId];
    const s = byLecon && byLecon[item.type] && byLecon[item.type][item.qid];
    if (s && s.attempts > 0) {
      connu++;
      if (s.wrongTotal > 0 || s.difficultyScore > 0 || s.lastWrongAt !== null) difficile++;
    }
  }
  return { total, connu, difficile, niv };
}

// ─── STATISTIQUES D'UNE LEÇON ───────────────────────────────────────────────
// Maîtrisée seulement si TOUTES les questions sont au niveau 3.
function calculateLessonStats(leconId) {
  const lecon = lecons.find(l => l.id === leconId);
  if (!lecon) return { percent: 0, n1: 0, n2: 0, n3: 0, total: 0, status: 'début', mastered: false };

  const levels = [];
  (lecon.quiz || []).forEach(q => levels.push(getQuestionLevel(leconId, 'quiz', q.id)));
  (lecon.trous || []).forEach(q => levels.push(getQuestionLevel(leconId, 'trous', q.id)));
  (lecon.ecriture || []).forEach((q, i) => levels.push(getQuestionLevel(leconId, 'ecriture', ecritureId(q, i))));

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

  const leconsNiveau = leconsActives();
  let lessonsMastered = 0;
  leconsNiveau.forEach(l => { if (calculateLessonStats(l.id).mastered) lessonsMastered++; });

  const total = all.length;
  return {
    percent: total ? Math.round((sum / total) * 100) : 0,
    masteredQuestions: mastered,
    totalQuestions: total,
    lessonsMastered,
    totalLessons: leconsNiveau.length,
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
