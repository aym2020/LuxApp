// ─── SYNCHRO CLOUD (Supabase) ───────────────────────────────────────────────
// Optionnel. Le localStorage reste la base : si Supabase n'est pas configuré,
// pas connecté, ou indisponible, l'application fonctionne normalement en local.
//
// Données synchronisées (jamais les leçons) :
//   - progress.levels  = niveaux des questions (luxProgress)
//   - progress.wrong   = compteurs d'erreurs actives (luxWrong)
//   - progress.stats   = historique durable par question (luxQuestionStats)
//   - streak           = série quotidienne (luxStreak)

let sb = null;            // client Supabase (null = mode local uniquement)
let cloudSaveTimer = null;

// ─── INITIALISATION ─────────────────────────────────────────────────────────
function initSupabase() {
  const cfg = window.APP_CONFIG;
  // Pas de config valide, ou librairie non chargée -> mode local.
  if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return null;
  if (cfg.SUPABASE_URL.includes('xxxx') || !window.supabase) return null;

  sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  return sb;
}

function isCloudEnabled() {
  return sb !== null;
}

// ─── AUTHENTIFICATION ───────────────────────────────────────────────────────
// getSession lit la session locale (rapide, fonctionne hors ligne).
async function getCurrentUser() {
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return (data && data.session && data.session.user) || null;
  } catch (e) {
    return null;
  }
}

async function signUp(email, password) {
  if (!sb) return { error: { message: 'cloud indisponible' } };
  return await sb.auth.signUp({ email, password });
}

async function signIn(email, password) {
  if (!sb) return { error: { message: 'cloud indisponible' } };
  return await sb.auth.signInWithPassword({ email, password });
}

async function signOut() {
  if (!sb) return;
  try { await sb.auth.signOut(); } catch (e) { /* ignore */ }
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
async function loadCloudProgress() {
  const user = await getCurrentUser();
  if (!sb || !user) return null;
  try {
    const { data, error } = await sb
      .from('user_progress')
      .select('progress, streak')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error || !data) return null;
    return { progress: data.progress || {}, streak: data.streak || {} };
  } catch (e) {
    return null;
  }
}

async function saveCloudProgress() {
  const user = await getCurrentUser();
  if (!sb || !user) return;
  const payload = getProgressPayload();
  try {
    await sb.from('user_progress').upsert({
      user_id: user.id,
      progress: payload.progress,
      streak: payload.streak,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch (e) {
    // Échec silencieux : la progression reste sauvegardée en local.
  }
}

async function deleteCloudProgress() {
  const user = await getCurrentUser();
  if (!sb || !user) return;
  try { await sb.from('user_progress').delete().eq('user_id', user.id); } catch (e) { /* ignore */ }
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

// ─── SYNCHRONISATION COMPLÈTE ───────────────────────────────────────────────
async function syncProgress() {
  const user = await getCurrentUser();
  if (!sb || !user) return;
  const cloud = await loadCloudProgress();
  const local = getProgressPayload();
  const merged = mergeLocalAndCloudProgress(local, cloud);
  applyProgressPayload(merged); // écrit le fusionné en local
  await saveCloudProgress();    // renvoie le fusionné au cloud
}

// Sauvegarde cloud différée (évite trop de requêtes pendant une session).
function debounceCloudSave() {
  if (!sb) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(saveCloudProgress, 800);
}

// ─── BOOT : appelé au démarrage de l'application ────────────────────────────
async function bootAuthAndSync() {
  if (!sb) return;
  try {
    const user = await getCurrentUser();
    if (user) {
      // Profil isolé pour ce compte AVANT toute lecture/écriture locale.
      setStorageProfile('user:' + user.id);
      await syncProgress(); // charge ce profil + cloud, fusionne, réécrit les deux
    }
    // Sinon : on reste sur le profil "anonymous" (valeur par défaut).
  } catch (e) {
    // Supabase indisponible : on continue en local.
  }
  if (sb) {
    sb.auth.onAuthStateChange(() => updateAuthUI());
  }
}
