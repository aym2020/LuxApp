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
    rattrapage: getRattrapageStore(), // SPEC 58 : derniers scores détaillés
    streak: getStreak(),
    // S8, S13 : le choix du niveau et ce qui est en cours (séance du jour,
    // partie d'unité). Fusionnés par « le plus récent gagne » (mergeDernier).
    choix: getChoix(),
    // Spec 22 : partie principale et entraînement libre, synchronisés séparément
    // (chacun fusionné par « le plus récent gagne »).
    enCours: { seance: lireEnCours(SEANCE_KEY), partie: lireEnCours(RUN_KEY), partieLibre: lireEnCours(RUN_LIBRE_KEY) }
  };
}

// ─── CE QUI EST EN COURS (S8) ───────────────────────────────────────────────
// Séance du jour et partie d'unité, telles qu'enregistrées sur l'appareil.
// Chacune porte sa date de mise à jour (maj). Une séance ou une partie finie
// est gardée sous la forme { fini: true, maj } : ainsi, un autre appareil qui a
// encore l'ancienne version sait qu'elle est terminée.
function lireEnCours(cle) {
  try { return JSON.parse(localStorage.getItem(storageKey(cle))); } catch (e) { return null; }
}

function ecrireEnCours(cle, valeur) {
  try {
    if (valeur) localStorage.setItem(storageKey(cle), JSON.stringify(valeur));
  } catch (e) { /* ignore */ }
}

function applyProgressPayload(payload) {
  if (!payload) return;
  if (payload.progress) {
    if (payload.progress.levels) saveProgress(payload.progress.levels);
    if (payload.progress.wrong) saveWrongStore(payload.progress.wrong);
    if (payload.progress.stats) saveStatsStore(payload.progress.stats);
  }
  if (payload.rattrapage) saveRattrapageStore(payload.rattrapage);
  if (payload.streak) saveStreak(payload.streak);
  if (payload.choix) saveChoix(payload.choix);
  if (payload.enCours) {
    ecrireEnCours(SEANCE_KEY, payload.enCours.seance);
    ecrireEnCours(RUN_KEY, payload.enCours.partie);
    ecrireEnCours(RUN_LIBRE_KEY, payload.enCours.partieLibre); // absent des anciens payloads : ignoré
    if (typeof migrerParties === 'function') migrerParties();
  }
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
  return { progress: data.progress || {}, streak: data.streak || {}, choix: data.choix || {}, enCours: data.enCours || {} };
}

async function saveCloudProgress() {
  const user = await getCurrentUser();
  if (!fbDb || !user) return;
  try {
    await withTimeout(cloudDoc(user).set({
      payload: JSON.stringify(getProgressPayload()),
      updated_at: new Date().toISOString()
    }));
    noterSynchro(true);
  } catch (e) {
    // La progression reste sauvegardée en local ; l'indicateur dit « en attente ».
    noterSynchro(false);
  }
}

// ─── INDICATEUR DE SYNCHRONISATION (S8) ─────────────────────────────────────
// luxDerniereSynchro = date (ms) de la dernière synchronisation réussie.
let synchroEnAttente = false;

function noterSynchro(ok) {
  synchroEnAttente = !ok;
  if (ok) {
    try { localStorage.setItem('luxDerniereSynchro', String(Date.now())); } catch (e) { /* ignore */ }
  }
  // SPEC 52 : rafraîchir le point de l'accueil et le statut des réglages
  // sans reconstruire l'écran ni perturber le focus.
  if (typeof actualiserStatutSynchro === 'function') actualiserStatutSynchro();
}

// Texte de l'indicateur, ou null si l'utilisateur n'est pas connecté.
//   { ok: true,  texte: 'Synchronisé il y a 2 min' }
//   { ok: false, texte: 'En attente · hors ligne' }
function etatSynchro() {
  if (!fbAuth || !fbAuth.currentUser) return null;
  if (synchroEnAttente || !navigator.onLine) return { ok: false, texte: 'En attente · hors ligne' };
  const derniere = Number(localStorage.getItem('luxDerniereSynchro') || 0);
  if (!derniere) return { ok: true, texte: 'Sauvegarde cloud activée' };
  const minutes = Math.floor((Date.now() - derniere) / 60000);
  if (minutes < 1) return { ok: true, texte: 'Synchronisé à l\'instant' };
  if (minutes < 60) return { ok: true, texte: 'Synchronisé il y a ' + minutes + ' min' };
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return { ok: true, texte: 'Synchronisé il y a ' + heures + ' h' };
  return { ok: true, texte: 'Synchronisé il y a ' + Math.floor(heures / 24) + ' j' };
}

async function deleteCloudProgress() {
  const user = await getCurrentUser();
  if (!fbDb || !user) return;
  try { await withTimeout(cloudDoc(user).delete()); } catch (e) { /* ignore */ }
}

// SPEC 58 : chaque unité a un seul meilleur passage de référence.
// On privilégie un meilleur score ; à égalité le détail le plus récent gagne.
// Cette fusion est séparée des valeurs numériques de luxProgress.
function mergeRattrapage(local, cloud) {
  const out = {};
  const lids = new Set(Object.keys(local || {}).concat(Object.keys(cloud || {})));
  lids.forEach(lid => {
    out[lid] = {};
    const a = local && local[lid] || {};
    const b = cloud && cloud[lid] || {};
    const units = new Set(Object.keys(a).concat(Object.keys(b)));
    units.forEach(uid => {
      const left = a[uid], right = b[uid];
      if (!left) { out[lid][uid] = right; return; }
      if (!right) { out[lid][uid] = left; return; }
      if (left.basePercent !== right.basePercent) {
        out[lid][uid] = left.basePercent > right.basePercent ? left : right;
      } else {
        out[lid][uid] = (left.maj || 0) >= (right.maj || 0) ? left : right;
      }
    });
  });
  return out;
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

// « Le plus récent gagne » : pour chaque clé, on garde l'objet dont la date
// de mise à jour (maj) est la plus grande. Sert au choix du niveau (S13) et à
// ce qui est en cours (S8). Un objet sans maj compte comme le plus ancien.
function mergeDernier(local, cloud) {
  const out = {};
  const cles = new Set(Object.keys(local || {}).concat(Object.keys(cloud || {})));
  cles.forEach(cle => {
    const a = local && local[cle];
    const b = cloud && cloud[cle];
    if (!a) { out[cle] = b || null; return; }
    if (!b) { out[cle] = a; return; }
    out[cle] = (a.maj || 0) >= (b.maj || 0) ? a : b;
  });
  return out;
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
    rattrapage: mergeRattrapage(l.rattrapage || {}, c.rattrapage || {}),
    streak: mergeStreak(l.streak, c.streak),
    choix: mergeDernier(l.choix, c.choix),
    enCours: mergeDernier(l.enCours, c.enCours)
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
    rattrapage: read(RATTRAPAGE_KEY) || {},
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
    noterSynchro(false);
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

// Retour sur l'app (téléphone déverrouillé, onglet réaffiché) ou réseau revenu :
// on resynchronise, pour reprendre ici ce qui a été commencé ailleurs (S8).
async function resynchroniser() {
  if (!fbAuth || !fbAuth.currentUser) return;
  await syncProgress();
  if (typeof apresSynchro === 'function') apresSynchro();
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') resynchroniser();
});
window.addEventListener('online', resynchroniser);
window.addEventListener('online', () => {
  if (typeof actualiserStatutSynchro === 'function') actualiserStatutSynchro();
});
window.addEventListener('offline', () => {
  if (typeof actualiserStatutSynchro === 'function') actualiserStatutSynchro();
});

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
