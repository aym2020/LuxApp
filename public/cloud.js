// ─── SYNCHRO CLOUD (Firebase) ───────────────────────────────────────────────
// Optionnel. Le localStorage reste la base : si Firebase n'est pas configuré,
// pas connecté, ou indisponible, l'application fonctionne normalement en local.
//
// Données synchronisées (jamais les leçons) :
//   - progress.levels  = niveaux des questions (luxProgress)
//   - progress.wrong   = compteurs d'erreurs actives (luxWrong)
//   - progress.stats   = historique durable par question (luxQuestionStats)
//   - streak           = série quotidienne (luxStreak)
//
// Stockage Firestore : collection "user_progress", 1 document par utilisateur
// (id du document = uid). Le contenu est stocké en texte JSON dans le champ
// "payload" : évite la limite Firestore sur le nombre de champs indexés.

let fbAuth = null;        // Firebase Auth (null = mode local uniquement)
let fbDb = null;          // Firestore
let authReadyPromise = null;
let cloudSaveTimer = null;

const CLOUD_COLLECTION = 'user_progress';
const CLOUD_TIMEOUT_MS = 8000;

// ─── INITIALISATION ─────────────────────────────────────────────────────────
function initFirebase() {
  const cfg = window.APP_CONFIG && window.APP_CONFIG.FIREBASE;
  // Pas de config valide, ou librairie non chargée -> mode local.
  if (!cfg || !cfg.apiKey || !cfg.projectId) return null;
  if (cfg.apiKey.includes('xxxx') || !window.firebase) return null;

  try {
    firebase.initializeApp(cfg);
    fbAuth = firebase.auth();
    fbDb = firebase.firestore();
  } catch (e) {
    fbAuth = null;
    fbDb = null;
  }
  return fbAuth;
}

function isCloudEnabled() {
  return fbAuth !== null;
}

// Coupe une requête cloud trop longue (réseau lent / hors ligne).
function withTimeout(promise) {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('timeout')), CLOUD_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]);
}

// ─── AUTHENTIFICATION ───────────────────────────────────────────────────────
// Au chargement, Firebase restaure la session de façon asynchrone :
// currentUser vaut null tant que le premier onAuthStateChanged n'est pas passé.
function waitForAuthReady() {
  if (!authReadyPromise) {
    authReadyPromise = new Promise(resolve => {
      const unsubscribe = fbAuth.onAuthStateChanged(() => {
        unsubscribe();
        resolve();
      });
    });
  }
  return authReadyPromise;
}

async function getCurrentUser() {
  if (!fbAuth) return null;
  try {
    await waitForAuthReady();
    return fbAuth.currentUser;
  } catch (e) {
    return null;
  }
}

// Même format de retour qu'avant : { data: { user }, error }.
async function signUp(email, password) {
  if (!fbAuth) return { error: { code: 'cloud-disabled' } };
  try {
    const cred = await fbAuth.createUserWithEmailAndPassword(email, password);
    return { data: { user: cred.user }, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function signIn(email, password) {
  if (!fbAuth) return { error: { code: 'cloud-disabled' } };
  try {
    const cred = await fbAuth.signInWithEmailAndPassword(email, password);
    return { data: { user: cred.user }, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function signOut() {
  if (!fbAuth) return;
  try { await fbAuth.signOut(); } catch (e) { /* ignore */ }
}

// ─── PAYLOAD : assemble / applique la progression locale ────────────────────
function getProgressPayload() {
  return {
    progress: { levels: getProgress(), wrong: getWrongStore(), stats: getStatsStore() },
    streak: getStreak()
  };
}

function applyProgressPayload(payload) {
  if (!payload) return;
  if (payload.progress) {
    if (payload.progress.levels) saveProgress(payload.progress.levels);
    if (payload.progress.wrong) saveWrongStore(payload.progress.wrong);
    if (payload.progress.stats) saveStatsStore(payload.progress.stats);
  }
  if (payload.streak) saveStreak(payload.streak);
}

// Alias demandés : lecture/écriture de la progression locale complète.
function loadLocalProgress() { return getProgressPayload(); }
function saveLocalProgress(payload) { applyProgressPayload(payload); }

// ─── LECTURE / ÉCRITURE CLOUD ───────────────────────────────────────────────
function cloudDoc(user) {
  return fbDb.collection(CLOUD_COLLECTION).doc(user.uid);
}

// Retourne les données cloud, ou null si aucun document n'existe encore.
// LÈVE UNE ERREUR si le cloud est injoignable : l'appelant ne doit alors
// surtout pas écraser le cloud avec la seule progression locale.
async function loadCloudProgress() {
  const user = await getCurrentUser();
  if (!fbDb || !user) return null;
  const snap = await withTimeout(cloudDoc(user).get());
  if (!snap.exists) return null;
  const data = JSON.parse(snap.data().payload || '{}');
  return { progress: data.progress || {}, streak: data.streak || {} };
}

async function saveCloudProgress() {
  const user = await getCurrentUser();
  if (!fbDb || !user) return;
  try {
    await withTimeout(cloudDoc(user).set({
      payload: JSON.stringify(getProgressPayload()),
      updated_at: new Date().toISOString()
    }));
  } catch (e) {
    // Échec silencieux : la progression reste sauvegardée en local.
  }
}

async function deleteCloudProgress() {
  const user = await getCurrentUser();
  if (!fbDb || !user) return;
  try { await withTimeout(cloudDoc(user).delete()); } catch (e) { /* ignore */ }
}

// ─── FUSION OPTIMISTE (ne perd jamais de progression) ───────────────────────
// Garde la valeur la plus avancée pour chaque question. Ne fait jamais baisser.
function mergeMaxNested(local, cloud) {
  const out = {};
  const lessons = new Set(Object.keys(local || {}).concat(Object.keys(cloud || {})));
  lessons.forEach(lid => {
    const lt = (local && local[lid]) || {};
    const ct = (cloud && cloud[lid]) || {};
    out[lid] = {};
    const types = new Set(Object.keys(lt).concat(Object.keys(ct)));
    types.forEach(type => {
      const lq = lt[type] || {};
      const cq = ct[type] || {};
      out[lid][type] = {};
      const qids = new Set(Object.keys(lq).concat(Object.keys(cq)));
      qids.forEach(qid => {
        out[lid][type][qid] = Math.max(lq[qid] || 0, cq[qid] || 0);
      });
    });
  });
  return out;
}

// Stats : par question, on garde le record le plus riche (le plus d'essais).
// À égalité d'essais, le plus récent (lastSeenAt) l'emporte. Évite de
// fabriquer un record incohérent en mélangeant les champs.
function pickRicherStat(a, b) {
  if (!a) return b;
  if (!b) return a;
  const aa = a.attempts || 0, ba = b.attempts || 0;
  if (aa !== ba) return aa > ba ? a : b;
  return (a.lastSeenAt || '') >= (b.lastSeenAt || '') ? a : b;
}

function mergeStatsNested(local, cloud) {
  const out = {};
  const lessons = new Set(Object.keys(local || {}).concat(Object.keys(cloud || {})));
  lessons.forEach(lid => {
    const lt = (local && local[lid]) || {};
    const ct = (cloud && cloud[lid]) || {};
    out[lid] = {};
    const types = new Set(Object.keys(lt).concat(Object.keys(ct)));
    types.forEach(type => {
      const lq = lt[type] || {};
      const cq = ct[type] || {};
      out[lid][type] = {};
      const qids = new Set(Object.keys(lq).concat(Object.keys(cq)));
      qids.forEach(qid => {
        out[lid][type][qid] = pickRicherStat(lq[qid], cq[qid]);
      });
    });
  });
  return out;
}

// Streak : la date la plus récente l'emporte ; à égalité, le compteur le plus élevé.
function mergeStreak(local, cloud) {
  local = local || { count: 0, lastActive: null };
  cloud = cloud || { count: 0, lastActive: null };
  if (!cloud.lastActive) return local;
  if (!local.lastActive) return cloud;
  if (local.lastActive > cloud.lastActive) return local;
  if (cloud.lastActive > local.lastActive) return cloud;
  return { lastActive: local.lastActive, count: Math.max(local.count || 0, cloud.count || 0) };
}

function mergeLocalAndCloudProgress(localData, cloudData) {
  const l = localData || {};
  const c = cloudData || {};
  const lp = l.progress || {};
  const cp = c.progress || {};
  return {
    progress: {
      levels: mergeMaxNested(lp.levels || {}, cp.levels || {}),
      wrong: mergeMaxNested(lp.wrong || {}, cp.wrong || {}),
      stats: mergeStatsNested(lp.stats || {}, cp.stats || {})
    },
    streak: mergeStreak(l.streak, c.streak)
  };
}

// ─── MIGRATION : ancienne progression Supabase restée en local ──────────────
// Les anciens profils locaux s'appellent "user:<uuid Supabase>" (avec des
// tirets). Un uid Firebase n'en contient jamais. À la première connexion
// Firebase sur cet appareil, on fusionne ces anciens profils dans le nouveau.
function readLegacyPayload(profileId) {
  function read(baseKey) {
    try {
      return JSON.parse(localStorage.getItem(baseKey + ':user:' + profileId));
    } catch (e) {
      return null;
    }
  }
  return {
    progress: {
      levels: read(STORAGE_KEY) || {},
      wrong: read(WRONG_KEY) || {},
      stats: read(STATS_KEY) || {}
    },
    streak: read(STREAK_KEY)
  };
}

function migrateLegacyProfiles(user) {
  const flagKey = 'luxLegacyMigrated:' + user.uid;
  if (localStorage.getItem(flagKey)) return;

  const prefix = STORAGE_KEY + ':user:';
  const legacyIds = Object.keys(localStorage)
    .filter(k => k.startsWith(prefix))
    .map(k => k.slice(prefix.length))
    .filter(id => id.includes('-'));

  legacyIds.forEach(id => {
    const merged = mergeLocalAndCloudProgress(getProgressPayload(), readLegacyPayload(id));
    applyProgressPayload(merged);
  });

  localStorage.setItem(flagKey, '1');
}

// ─── SYNCHRONISATION COMPLÈTE ───────────────────────────────────────────────
async function syncProgress() {
  const user = await getCurrentUser();
  if (!fbDb || !user) return;
  migrateLegacyProfiles(user);

  let cloud;
  try {
    cloud = await loadCloudProgress();
  } catch (e) {
    return; // cloud injoignable : on ne touche à rien, on reste en local
  }
  const local = getProgressPayload();
  const merged = mergeLocalAndCloudProgress(local, cloud);
  applyProgressPayload(merged); // écrit le fusionné en local
  await saveCloudProgress();    // renvoie le fusionné au cloud
}

// Sauvegarde cloud différée (évite trop de requêtes pendant une session).
function debounceCloudSave() {
  if (!fbAuth) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(saveCloudProgress, 800);
}

// ─── BOOT : appelé au démarrage de l'application ────────────────────────────
async function bootAuthAndSync() {
  if (!fbAuth) return;
  try {
    const user = await getCurrentUser();
    if (user) {
      // Profil isolé pour ce compte AVANT toute lecture/écriture locale.
      setStorageProfile('user:' + user.uid);
      await syncProgress(); // charge ce profil + cloud, fusionne, réécrit les deux
    }
    // Sinon : on reste sur le profil "anonymous" (valeur par défaut).
  } catch (e) {
    // Firebase indisponible : on continue en local.
  }
}
