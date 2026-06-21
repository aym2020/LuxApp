// ─── STATE ────────────────────────────────────────────────────────────────────
let lecons = [];
let currentLecon = null;

// flashcard
let fcCards = [];
let fcIndex = 0;
let fcDirLuFr = false;

// quiz
let qCards    = [];
let qIndex    = 0;
let qScore    = 0;
let qAnswered = false;

// trous
let tCards    = [];
let tIndex    = 0;
let tScore    = 0;
let tAnswered = false;

// ─── BOOT ─────────────────────────────────────────────────────────────────────
async function init() {
  lecons = await fetch('/api/lecons').then(r => r.json()); // 1. leçons
  // 2. la progression locale est déjà lue à la demande depuis localStorage
  initSupabase();          // 3. init Supabase (sans effet si non configuré)
  await bootAuthAndSync(); // 4-6. si connecté : charge + fusionne cloud + local
  renderLessons();
  renderDashboard();       // 7. rendu (inclut l'état de connexion)
  await updateAuthUI();    // mise à jour zone connexion (après bootAuthAndSync)
  setupTabs();
  setupCardInteraction(); // BUG 1 fix : remplace setupSwipe()
  setupKeyboard();
}

// ─── LISTE DES LEÇONS ───────────────────────────────────────────────────────
function renderLessons() {
  const list = document.getElementById('lecon-list');
  list.innerHTML = '';
  lecons.forEach(l => {
    const el = document.createElement('div');
    el.className = 'lecon-card';
    el.style.setProperty('--lc', l.couleur);
    el.innerHTML = `
      <div class="lecon-card-accent" style="background:${l.couleur}"></div>
      <div class="lecon-card-body">
        <div class="lecon-card-num">
          LEÇON ${l.id}
          <span class="lecon-progress" data-lecon="${l.id}"></span>
        </div>
        <div class="lecon-card-titre">${l.titre}</div>
        <div class="lecon-card-sous">${l.titre_fr}</div>
        <div class="lecon-card-counts">
          <span class="lecon-pill">📖 ${l.flashcards.length} cartes</span>
          <span class="lecon-pill">❓ ${l.quiz.length} quiz</span>
          <span class="lecon-pill">✏️ ${l.trous.length} trous</span>
          <span class="lecon-pill">${l.ecriture ? '✍️ ' + l.ecriture.length + ' écriture' : ''}</span>
        </div>
      </div>
      <div class="lecon-arrow">›</div>`;
    el.addEventListener('click', () => openLecon(l));
    list.appendChild(el);
  });
  renderLessonsProgress();
}

function openLecon(l) {
  currentLecon = l;

  document.getElementById('lecon-num').textContent = `LEÇON ${l.id}`;
  document.getElementById('lecon-titre').textContent = l.titre;
  document.getElementById('lecon-header').style.borderBottomColor = l.couleur + '44';

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="cours"]').classList.add('active');
  document.getElementById('tab-cours').classList.add('active');

  renderCours();

  fcCards = [...l.flashcards];
  fcIndex = 0;
  fcDirLuFr = false;
  document.getElementById('fc-dir-btn').textContent = '🇫🇷→🇱🇺';
  renderFC();

  showView('view-lecon');
}

// ─── COURS ────────────────────────────────────────────────────────────────────
function renderCours() {
  const container = document.getElementById('cours-content');
  const accent = currentLecon.couleur;

  if (!currentLecon.cours) {
    container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">Cours indisponible pour cette leçon.</p>';
    return;
  }

  let html = `<div class="cours-intro" style="border-color:${accent}55">
    <div class="cours-intro-titre" style="color:${accent}">${currentLecon.titre}</div>
    <div class="cours-intro-sous">${currentLecon.titre_fr}</div>
  </div>`;

  html += renderLessonProgress();

  currentLecon.cours.forEach(sec => {
    if (sec.type === 'texte') {
      html += `<p class="cours-texte">${sec.contenu}</p>`;
    }
    else if (sec.type === 'regle') {
      html += `<div class="cours-regle" style="border-left-color:${accent}">
        <div class="cours-regle-titre" style="color:${accent}">${sec.titre}</div>
        <ul>${sec.lignes.map(l => `<li>${l}</li>`).join('')}</ul>
      </div>`;
    }
    else if (sec.type === 'vocab') {
      html += `<div class="cours-bloc" style="border-left:3px solid ${accent}">
        <div class="cours-bloc-titre" style="color:${accent}">${sec.titre}</div>
        <table class="cours-vocab">${
          sec.items.map(([lu, fr]) =>
            `<tr><td class="cours-lu">${lu}</td><td class="cours-fr">${fr}</td></tr>`
          ).join('')
        }</table>
      </div>`;
    }
    else if (sec.type === 'dialogue') {
      html += `<div class="cours-bloc" style="border-left:3px solid ${accent}">
        <div class="cours-bloc-titre" style="color:${accent}">${sec.titre}</div>${
          sec.echanges.map(([lu, fr]) =>
            `<div class="cours-dialogue">
              <div class="cours-dialogue-lu" style="color:${accent}">${lu}</div>
              <div class="cours-dialogue-fr">${fr}</div>
            </div>`
          ).join('')
        }</div>`;
    }
    // Encadré coloré : variant = astuce | attention | info | retenir
    else if (sec.type === 'callout') {
      const v = sec.variant || 'info';
      html += `<div class="cours-callout cc-${v}">
        <div class="cours-callout-titre">${sec.titre}</div>
        <ul>${sec.lignes.map(l => `<li>${l}</li>`).join('')}</ul>
      </div>`;
    }
    // Exemples mis en avant : paires luxembourgeois / français
    else if (sec.type === 'exemple') {
      html += `<div class="cours-bloc cours-exemple" style="border-left:3px solid ${accent}">
        <div class="cours-bloc-titre" style="color:${accent}">${sec.titre}</div>${
          sec.items.map(([lu, fr]) =>
            `<div class="cours-ex-row">
              <div class="cours-ex-lu" style="color:${accent}">${lu}</div>
              <div class="cours-ex-fr">${fr}</div>
            </div>`
          ).join('')
        }</div>`;
    }
    // Tableau générique : entetes = en-têtes, lignes = tableau de cellules
    else if (sec.type === 'tableau') {
      html += `<div class="cours-bloc" style="border-left:3px solid ${accent}">
        <div class="cours-bloc-titre" style="color:${accent}">${sec.titre}</div>
        <div class="cours-table-wrap">
          <table class="cours-table">
            <thead><tr>${sec.entetes.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${
              sec.lignes.map(row =>
                `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`
              ).join('')
            }</tbody>
          </table>
        </div>
      </div>`;
    }
  });

  container.innerHTML = html;
}

function goDashboard() {
  renderDashboard();
  showView('view-dashboard');
}

function goLessons() {
  renderLessonsProgress();
  showView('view-lessons');
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
function renderDashboard() {
  const stats = calculateGlobalStats();
  const streak = getStreak();

  document.getElementById('dash-streak').textContent =
    '🔥 ' + streak.count + ' jour' + (streak.count > 1 ? 's' : '');
  document.getElementById('dash-global').textContent = stats.percent + '%';
  document.getElementById('dash-global-fill').style.width = stats.percent + '%';
  document.getElementById('dash-mastered').textContent =
    stats.masteredQuestions + ' / ' + stats.totalQuestions;
  document.getElementById('dash-lessons').textContent =
    stats.lessonsMastered + ' / ' + stats.totalLessons;
  document.getElementById('dash-review').textContent =
    'À revoir : ' + stats.toReview + ' question' + (stats.toReview > 1 ? 's' : '');
}

// Réinitialise TOUTE la progression, après confirmation.
async function confirmResetAll() {
  const user = isCloudEnabled() ? await getCurrentUser() : null;
  const message = user
    ? 'Effacer TOUTE ta progression, en local ET dans le cloud ? Cette action est irréversible.'
    : 'Effacer toute la progression locale ? Cette action est irréversible.';
  if (!confirm(message)) return;

  resetProgress();                 // local
  if (user) await deleteCloudProgress(); // cloud
  renderDashboard();
  renderLessonsProgress();
}

// ─── UI : ZONE DE CONNEXION SUR LE DASHBOARD ────────────────────────────────
async function updateAuthUI() {
  const zone = document.getElementById('dash-auth');
  if (!zone) return;

  // Cloud non configuré -> mention discrète, rien d'autre.
  if (!isCloudEnabled()) {
    zone.innerHTML = '<div class="auth-state">Progression locale uniquement</div>';
    return;
  }

  const user = await getCurrentUser();
  if (user) {
    zone.innerHTML =
      '<div class="auth-state ok">Sauvegarde cloud activée</div>' +
      '<div class="auth-email">' + escHtml(user.email) + '</div>' +
      '<div class="auth-actions">' +
        '<button class="auth-btn" id="sync-btn" onclick="handleSync(this)">Synchroniser</button>' +
        '<button class="auth-btn" onclick="handleSignOut()">Déconnexion</button>' +
      '</div>';
  } else {
    zone.innerHTML =
      '<div class="auth-state">Progression locale uniquement</div>' +
      '<div class="auth-actions">' +
        '<button class="auth-btn" onclick="showAuthForm(\'signin\')">Connexion</button>' +
        '<button class="auth-btn" onclick="showAuthForm(\'signup\')">Créer un compte</button>' +
      '</div>' +
      '<div id="auth-form" class="auth-form hidden"></div>';
  }
}

function showAuthForm(mode) {
  const f = document.getElementById('auth-form');
  if (!f) return;
  f.classList.remove('hidden');
  f.innerHTML =
    '<input id="auth-email" type="email" class="auth-input" placeholder="Email" autocomplete="email">' +
    '<input id="auth-pass" type="password" class="auth-input" placeholder="Mot de passe" autocomplete="current-password">' +
    '<button class="auth-btn primary" onclick="handleAuth(\'' + mode + '\')">' +
      (mode === 'signup' ? 'Créer le compte' : 'Se connecter') +
    '</button>' +
    '<div id="auth-msg" class="auth-msg"></div>';
}

// Messages d'erreur clairs (jamais d'erreur technique brute).
function friendlyAuthError(error) {
  const m = ((error && error.message) || '').toLowerCase();
  if (m.includes('invalid login')) return 'Email ou mot de passe incorrect.';
  if (m.includes('already')) return 'Un compte existe déjà avec cet email.';
  if (m.includes('password')) return 'Mot de passe trop court (6 caractères minimum).';
  if (m.includes('email')) return 'Email invalide.';
  return 'Une erreur est survenue. Réessaie.';
}

async function handleAuth(mode) {
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  const msg = document.getElementById('auth-msg');
  if (!email || !pass) { msg.textContent = 'Email et mot de passe requis.'; return; }
  msg.textContent = '…';

  const fn = mode === 'signup' ? signUp : signIn;
  const { data, error } = await fn(email, pass);
  if (error) { msg.textContent = friendlyAuthError(error); return; }

  // Inscription : pas de session ouverte immédiatement.
  if (mode === 'signup' && data && data.user && !data.session) {
    // identities vide = email déjà utilisé (Supabase masque l'erreur pour la sécurité).
    const isDuplicate = !data.user.identities || data.user.identities.length === 0;
    const form = document.getElementById('auth-form');
    if (form) {
      form.innerHTML = '<div class="auth-msg ' + (isDuplicate ? '' : 'ok') + '">' +
        escHtml(isDuplicate
          ? 'Un compte existe déjà avec cet email.'
          : 'Compte créé. Vérifie ton email pour confirmer ton inscription.') +
        '</div>';
    }
    return;
  }

  // Connecté : profil isolé pour ce compte, puis fusion local + cloud.
  const user = await getCurrentUser();
  if (user) setStorageProfile('user:' + user.id);
  await syncProgress();
  await updateAuthUI();
  renderDashboard();
  renderLessonsProgress();
}

function handleSignOut() {
  // 1. Efface immédiatement la session Supabase stockée en localStorage.
  //    (les clés Supabase commencent par "sb-"). Synchrone => garanti avant reload.
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('sb-'))
      .forEach(k => localStorage.removeItem(k));
  } catch (e) { /* ignore */ }

  // 2. Déconnexion serveur en arrière-plan (sans bloquer).
  try { signOut(); } catch (e) { /* ignore */ }

  // 3. Recharge : au boot, aucun user détecté -> profil "anonymous".
  window.location.reload();
}

async function handleSync(btn) {
  if (!btn) btn = document.getElementById('sync-btn');
  const origText = btn ? btn.textContent : 'Synchroniser';

  if (btn) { btn.disabled = true; btn.textContent = 'Synchronisation...'; }

  await syncProgress();
  await updateAuthUI();
  renderDashboard();
  renderLessonsProgress();

  // Feedback de succès fugace
  if (btn) {
    btn.textContent = '✓ Synchronisé';
    setTimeout(() => {
      btn.textContent = origText;
      btn.disabled = false;
    }, 1500);
  }
}

// Réinitialise la progression de la leçon affichée, après confirmation.
function confirmResetLesson() {
  if (confirm('Réinitialiser toute la progression de cette leçon ?')) {
    resetLessonProgress(currentLecon.id);
    renderCours();
  }
}

// ─── SESSION UNIFIÉE (révision / examen / erreurs) ──────────────────────────
let session = { mode: null, questions: [], index: 0, score: 0, answered: false };

function typeLabel(type) {
  if (type === 'quiz') return 'Quiz';
  if (type === 'trous') return 'À trou';
  return 'Écriture';
}

function startSession(mode) {
  let questions, titre;
  if (mode === 'review') { questions = getReviewQuestions(20); titre = 'Révision'; }
  else if (mode === 'exam') { questions = getExamQuestions(50); titre = 'Examen'; }
  else { questions = getFrequentErrors(10); titre = 'Erreurs fréquentes'; }

  if (!questions.length) {
    alert(mode === 'errors'
      ? 'Aucune erreur enregistrée pour le moment.'
      : 'Aucune question disponible.');
    return;
  }

  session = { mode, questions, index: 0, score: 0, answered: false };
  document.getElementById('session-num').textContent = titre.toUpperCase();
  document.getElementById('session-titre').textContent = questions.length + ' questions';
  document.getElementById('session-result').classList.add('hidden');
  document.getElementById('session-q').classList.remove('hidden');
  showView('view-session');
  renderSessionQ();
}

// ─── RÉVISION CONFIGURÉE ────────────────────────────────────────────────────
let reviewListenerAttached = false;

function openReviewSetup() {
  // Une case par leçon, toutes cochées au départ.
  const box = document.getElementById('rs-lecons');
  box.innerHTML = '';
  lecons.forEach(l => {
    const label = document.createElement('label');
    label.className = 'rs-check';
    label.innerHTML =
      '<input type="checkbox" value="' + l.id + '" checked> Leçon ' + l.id + ' · ' + escHtml(l.titre);
    box.appendChild(label);
  });

  // Recalcule les compteurs dès qu'une case change (leçons, types, focus).
  if (!reviewListenerAttached) {
    document.getElementById('view-review-setup')
      .addEventListener('change', scheduleReviewRefresh);
    reviewListenerAttached = true;
  }

  // Au départ : focus Aléatoire (jamais connu/difficile auto-sélectionné).
  document.querySelector('input[name="rs-focus"][value="aleatoire"]').checked = true;

  // Au départ : tous les niveaux cochés.
  document.querySelectorAll('#rs-niveaux input').forEach(b => b.checked = true);

  refreshReviewAvailability();
  showView('view-review-setup');
}

// Lit les sélections courantes (leçons + types + niveaux).
function readReviewSelection() {
  return {
    leconIds: [...document.querySelectorAll('#rs-lecons input:checked')].map(b => Number(b.value)),
    types: [...document.querySelectorAll('#rs-types input:checked')].map(b => b.value),
    niveaux: [...document.querySelectorAll('#rs-niveaux input:checked')].map(b => Number(b.value))
  };
}

// Met à jour le compteur affiché et l'état (actif/désactivé) d'un focus.
function setFocusAvailability(focus, count, total, emptyHint) {
  const input = document.querySelector('input[name="rs-focus"][value="' + focus + '"]');
  const row = input.closest('.rs-check');
  const countEl = document.getElementById('rs-count-' + focus);
  const empty = count === 0;

  input.disabled = empty;
  row.classList.toggle('disabled', empty);
  countEl.textContent = empty
    ? emptyHint
    : count + ' / ' + total + ' disponible' + (count > 1 ? 's' : '');
}

// Met à jour le compteur affiché à côté d'un niveau.
function setNiveauCount(level, count) {
  const el = document.getElementById('rs-niv-count-' + level);
  if (el) el.textContent = count + ' question' + (count > 1 ? 's' : '');
}

// Recalcule les 3 compteurs et empêche de rester sur un focus vide.
function refreshReviewAvailability() {
  const { leconIds, types, niveaux } = readReviewSelection();

  // 1 seule passe ET 1 seule lecture du localStorage (voir getReviewCounts).
  const { total, connu, difficile, niv } = getReviewCounts(leconIds, types, niveaux);

  setNiveauCount(1, niv[1]);
  setNiveauCount(2, niv[2]);
  setNiveauCount(3, niv[3]);

  setFocusAvailability('aleatoire', total,     total, 'Aucune question');
  setFocusAvailability('connu',     connu,     total, 'Disponible après tes premières réponses.');
  setFocusAvailability('difficile', difficile, total, 'Disponible après tes premières erreurs.');

  // Si le focus coché est devenu indisponible, on revient à Aléatoire.
  const checked = document.querySelector('input[name="rs-focus"]:checked');
  if (checked && checked.disabled) {
    document.querySelector('input[name="rs-focus"][value="aleatoire"]').checked = true;
  }
}

// Débounce : un clic rapide sur plusieurs cases ne déclenche qu'un recalcul.
let reviewRefreshTimer = null;
function scheduleReviewRefresh() {
  clearTimeout(reviewRefreshTimer);
  reviewRefreshTimer = setTimeout(refreshReviewAvailability, 80);
}

// Coche / décoche toutes les cases d'un conteneur.
function toggleAllChecks(containerId) {
  const boxes = document.querySelectorAll('#' + containerId + ' input[type="checkbox"]');
  const allChecked = [...boxes].every(b => b.checked);
  boxes.forEach(b => b.checked = !allChecked);
  refreshReviewAvailability(); // .checked programmatique ne déclenche pas 'change'
}

// Lit les choix, construit la liste et lance la session existante.
function startConfiguredReview() {
  const { leconIds, types, niveaux } = readReviewSelection();
  const focus = document.querySelector('input[name="rs-focus"]:checked').value;
  const countInput = document.querySelector('input[name="rs-count"]:checked');
  let count = countInput ? parseInt(countInput.value, 10) : 20;
  if (!count || count < 1) count = 20;
  count = Math.min(count, 20); // plafond strict à 20

  if (!leconIds.length) { alert('Choisis au moins une leçon.'); return; }
  if (!types.length) { alert('Choisis au moins un type d\'exercice.'); return; }
  if (!niveaux.length) { alert('Choisis au moins un niveau.'); return; }

  // Feedback immédiat : le bouton confirme l'appui et indique que ça arrive.
  const btn = document.querySelector('#view-review-setup .dash-btn.primary');
  let originalLabel = '';
  if (btn) {
    originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Préparation…';
    btn.style.opacity = '.8';
    btn.style.cursor = 'progress';
  }

  // On laisse le navigateur afficher l'état "chargement" AVANT le calcul bloquant.
  setTimeout(() => {
    const questions = getConfiguredReview(leconIds, types, focus, count, niveaux);

    // Remet le bouton à l'état normal (pour la prochaine visite de l'écran).
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalLabel || 'Commencer la révision';
      btn.style.opacity = '';
      btn.style.cursor = '';
    }

    if (!questions.length) {
      // Message adapté au focus choisi (jamais de session vide ni de remplissage).
      if (focus === 'connu') {
        alert('Aucune question à consolider pour le moment.\nFais d\'abord une révision aléatoire ou une leçon pour créer ton historique.');
      } else if (focus === 'difficile') {
        alert('Aucune question difficile pour le moment.\nLes questions difficiles apparaîtront après tes premières erreurs.');
      } else {
        alert('Aucune question disponible pour ces critères.');
      }
      return;
    }

    // Réutilise le moteur de session (mode 'review' = les niveaux évoluent).
    // Le titre affiche le nombre RÉEL de questions, pas le nombre demandé.
    session = { mode: 'review', questions, index: 0, score: 0, answered: false };
    document.getElementById('session-num').textContent = 'RÉVISION';
    document.getElementById('session-titre').textContent = questions.length + ' questions';
    document.getElementById('session-result').classList.add('hidden');
    document.getElementById('session-q').classList.remove('hidden');
    showView('view-session');
    renderSessionQ();
  }, 20);
}

function renderSessionQ() {
  if (session.index >= session.questions.length) { showSessionResult(); return; }
  session.answered = false;

  const item = session.questions[session.index];
  const { type, q, leconId, qid } = item;

  setProgress('session', session.index, session.questions.length);
  renderLevelDots(document.getElementById('session-level'),
    getQuestionLevel(leconId, type, qid));

  // Réinitialise les zones d'affichage
  const choicesEl = document.getElementById('session-choices');
  const inputWrap = document.getElementById('session-input-wrap');
  const sentenceEl = document.getElementById('session-sentence');
  const feedback = document.getElementById('session-feedback');
  choicesEl.innerHTML = '';
  choicesEl.classList.add('hidden');
  inputWrap.classList.add('hidden');
  sentenceEl.classList.add('hidden');
  feedback.className = 'ecr-feedback hidden';
  document.querySelectorAll('#view-session .ecr-next-btn').forEach(b => b.remove());

  document.getElementById('session-label').textContent = typeLabel(type);
  const wordEl = document.getElementById('session-word');

  if (type === 'quiz') {
    wordEl.textContent = q.question;
    const answer = q.reponse;
    const safe = q.distracteurs.map(d => d === answer ? '—' : d);
    const choices = [...safe, answer].sort(() => Math.random() - .5);
    buildSessionChoices(choices, answer);
  }
  else if (type === 'trous') {
    wordEl.textContent = q.fr;
    const avant = q.avant ? escHtml(q.avant) + ' ' : '';
    const apres = q.apres ? ' ' + escHtml(q.apres) : '';
    sentenceEl.innerHTML = avant + '<span class="trou-blank" id="session-blank">___</span>' + apres;
    sentenceEl.classList.remove('hidden');
    const choices = [...q.choix].sort(() => Math.random() - .5);
    buildSessionChoices(choices, q.trou);
  }
  else { // ecriture
    wordEl.textContent = q.fr;
    inputWrap.classList.remove('hidden');
    const input = document.getElementById('session-input');
    input.value = '';
    input.style.height = 'auto';
    input.className = 'ecr-input';
    input.disabled = false;
    input.focus();
    const btn = document.getElementById('session-input-btn');
    btn.disabled = false;
  }
}

function buildSessionChoices(choices, correctText) {
  const container = document.getElementById('session-choices');
  container.classList.remove('hidden');
  container.innerHTML = '';
  choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = ch;
    btn.addEventListener('click', () => handleSessionChoice(btn, ch === correctText, correctText));
    container.appendChild(btn);
  });
}

function handleSessionChoice(btn, ok, correctText) {
  if (session.answered) return;
  session.answered = true;
  const item = session.questions[session.index];
  recordSessionAnswer(ok);

  if (ok) { btn.classList.add('correct'); }
  else {
    btn.classList.add('wrong');
    document.querySelectorAll('#session-choices .choice').forEach(b => {
      if (b.textContent === correctText) b.classList.add('correct');
    });
  }

  if (item.type === 'trous') {
    const blank = document.getElementById('session-blank');
    if (blank) {
      blank.textContent = item.q.trou;
      blank.style.color = ok ? 'var(--correct)' : 'var(--wrong)';
    }
  }

  document.querySelectorAll('#session-choices .choice').forEach(b => b.disabled = true);
  setTimeout(nextSessionQ, item.type === 'trous' ? 1400 : 1100);
}

function validateSessionInput() {
  if (session.answered) return;
  const input = document.getElementById('session-input');
  const val = input.value.trim();
  if (!val) return;

  session.answered = true;
  const item = session.questions[session.index];
  const target = item.q.lu;
  const ok = normalize(val) === normalize(target);
  recordSessionAnswer(ok);

  input.disabled = true;
  input.className = 'ecr-input ' + (ok ? 'correct' : 'wrong');
  document.getElementById('session-input-btn').disabled = true;

  const feedback = document.getElementById('session-feedback');
  feedback.classList.remove('hidden');
  if (ok) {
    feedback.className = 'ecr-feedback ok';
    feedback.innerHTML = '✅ Correct !';
  } else {
    feedback.className = 'ecr-feedback ko';
    feedback.innerHTML = '❌ Réponse :<span class="ecr-correct-answer">' + escHtml(target) + '</span>';
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'ecr-next-btn';
  nextBtn.textContent = session.index < session.questions.length - 1 ? 'Suivante →' : 'Voir le score →';
  nextBtn.addEventListener('click', () => { nextBtn.remove(); nextSessionQ(); });
  feedback.after(nextBtn);
}

function recordSessionAnswer(ok) {
  const item = session.questions[session.index];
  if (ok) session.score++;
  // En mode examen, on ne modifie pas les niveaux (changeLevel = false).
  const changeLevel = session.mode !== 'exam';
  updateQuestionProgress(item.leconId, item.type, item.qid, ok, changeLevel);
}

function nextSessionQ() {
  document.querySelectorAll('#view-session .ecr-next-btn').forEach(b => b.remove());
  session.index++;
  renderSessionQ();
}

function showSessionResult() {
  document.getElementById('session-q').classList.add('hidden');
  document.getElementById('session-choices').classList.add('hidden');
  document.getElementById('session-input-wrap').classList.add('hidden');
  document.getElementById('session-feedback').classList.add('hidden');
  document.querySelectorAll('#view-session .ecr-next-btn').forEach(b => b.remove());

  const total = session.questions.length;
  const pct = total ? Math.round(session.score / total * 100) : 0;
  document.getElementById('session-result').classList.remove('hidden');
  document.getElementById('session-score').textContent =
    `${pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}  ${session.score} / ${total}  (${pct}%)`;
}

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      window.scrollTo(0, 0); // BUG 6 fix : scroll haut au changement d'onglet
      if (btn.dataset.tab === 'cours')    renderCours();
      if (btn.dataset.tab === 'quiz')     startQuiz();
      if (btn.dataset.tab === 'trous')    startTrous();
      if (btn.dataset.tab === 'ecriture') startEcriture();
    });
  });
}

// ─── FLASHCARD ────────────────────────────────────────────────────────────────
function renderFC() {
  if (!fcCards.length) return;
  const c = fcCards[fcIndex];

  // BUG 4 fix : désactive la transition via classe plutôt que style inline + timeout court
  const cardEl = document.getElementById('card');
  cardEl.classList.add('no-transition');
  cardEl.classList.remove('flipped');
  // forcer le reflow pour que le remove soit effectif avant de réactiver la transition
  void cardEl.offsetHeight;
  cardEl.classList.remove('no-transition');

  const fWord  = fcDirLuFr ? c.lu : c.fr;
  const bWord  = fcDirLuFr ? c.fr : c.lu;
  const fLabel = fcDirLuFr ? 'Lëtzebuergesch' : 'Français';
  const bLabel = fcDirLuFr ? 'Français' : 'Lëtzebuergesch';

  // Couleur par langue : bleu = français, or = luxembourgeois (suit la langue, pas la face).
  const frontFace = cardEl.querySelector('.card-front');
  const backFace  = cardEl.querySelector('.card-back');
  frontFace.classList.toggle('face-lu', fcDirLuFr);
  frontFace.classList.toggle('face-fr', !fcDirLuFr);
  backFace.classList.toggle('face-lu', !fcDirLuFr);
  backFace.classList.toggle('face-fr', fcDirLuFr);

  document.getElementById('fc-front-label').textContent = fLabel;
  document.getElementById('fc-front-word').textContent  = fWord;
  document.getElementById('fc-back-label').textContent  = bLabel;
  document.getElementById('fc-back-word').textContent   = bWord;
  document.getElementById('fc-note').textContent        = c.note || '';

  setProgress('fc', fcIndex, fcCards.length);
  document.getElementById('btn-prev').disabled = fcIndex === 0;
  document.getElementById('btn-next').disabled = fcIndex === fcCards.length - 1;
}

function flipCard()    { document.getElementById('card').classList.toggle('flipped'); }
function nextCard()    { if (fcIndex < fcCards.length - 1) { fcIndex++; renderFC(); } }
function prevCard()    { if (fcIndex > 0) { fcIndex--; renderFC(); } }
function shuffleCards(){ fcCards.sort(() => Math.random() - .5); fcIndex = 0; renderFC(); }
function toggleFcDir() {
  fcDirLuFr = !fcDirLuFr;
  document.getElementById('fc-dir-btn').textContent = fcDirLuFr ? '🇱🇺→🇫🇷' : '🇫🇷→🇱🇺';
  renderFC();
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
function startQuiz() {
  if (!currentLecon) return;
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('quiz-choices').classList.remove('hidden');
  document.getElementById('quiz-question-wrap').classList.remove('hidden');

  qCards = getWeightedQuestions(currentLecon.id, 'quiz', currentLecon.quiz);
  qIndex = 0; qScore = 0; qAnswered = false;
  renderQuizQ();
}

function renderQuizQ() {
  if (qIndex >= qCards.length) { showQuizResult(); return; }
  qAnswered = false;
  const q = qCards[qIndex];

  document.getElementById('quiz-label').textContent = q.label || '';
  document.getElementById('quiz-word').textContent  = q.question;
  renderLevelDots(document.getElementById('quiz-level'),
    getQuestionLevel(currentLecon.id, 'quiz', q._qid));
  setProgress('quiz', qIndex, qCards.length);

  const answerText = q.reponse;

  // BUG 7 fix : ne pas dédupliquer — si distracteur == réponse, remplacer ce distracteur
  const safeDistracteurs = q.distracteurs.map(d =>
    d === answerText ? '—' : d
  );
  const choices = [...safeDistracteurs, answerText].sort(() => Math.random() - .5);

  const container = document.getElementById('quiz-choices');
  container.innerHTML = '';
  choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = ch;
    btn.addEventListener('click', () => handleQuizAnswer(btn, ch === answerText, answerText));
    container.appendChild(btn);
  });
}

function handleQuizAnswer(btn, ok, answer) {
  if (qAnswered) return;
  qAnswered = true;
  updateQuestionProgress(currentLecon.id, 'quiz', qCards[qIndex]._qid, ok);
  if (ok) { btn.classList.add('correct'); qScore++; }
  else {
    btn.classList.add('wrong');
    document.querySelectorAll('#quiz-choices .choice').forEach(b => {
      if (b.textContent === answer) b.classList.add('correct');
    });
  }
  document.querySelectorAll('#quiz-choices .choice').forEach(b => b.disabled = true);
  setTimeout(() => { qIndex++; renderQuizQ(); }, 1200);
}

function showQuizResult() {
  document.getElementById('quiz-choices').classList.add('hidden');
  document.getElementById('quiz-question-wrap').classList.add('hidden');
  document.getElementById('quiz-result').classList.remove('hidden');
  const pct = Math.round(qScore / qCards.length * 100);
  document.getElementById('quiz-score').textContent =
    `${pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}  ${qScore} / ${qCards.length}  (${pct}%)`;
}

// ─── À TROU ───────────────────────────────────────────────────────────────────
function startTrous() {
  if (!currentLecon) return;
  document.getElementById('trou-result').classList.add('hidden');
  document.getElementById('trou-choices').classList.remove('hidden');
  document.getElementById('trou-card').classList.remove('hidden');

  tCards = getWeightedQuestions(currentLecon.id, 'trous', currentLecon.trous);
  tIndex = 0; tScore = 0; tAnswered = false;

  if (!tCards.length) {
    document.getElementById('trou-card').innerHTML =
      '<div style="color:var(--muted);text-align:center;padding:1rem">Aucun exercice pour cette leçon.</div>';
    document.getElementById('trou-choices').innerHTML = '';
    return;
  }
  renderTrou();
}

function renderTrou() {
  if (tIndex >= tCards.length) { showTrouResult(); return; }
  tAnswered = false;
  const t = tCards[tIndex];

  document.getElementById('trou-fr').textContent = t.fr;
  document.getElementById('trou-note').classList.add('hidden');
  renderLevelDots(document.getElementById('trou-level'),
    getQuestionLevel(currentLecon.id, 'trous', t._qid));

  // BUG 5 fix : trim pour éviter l'espace parasite quand avant = ""
  const avant = t.avant ? escHtml(t.avant) + ' ' : '';
  const apres = t.apres ? ' ' + escHtml(t.apres) : '';
  document.getElementById('trou-sentence').innerHTML =
    avant + '<span class="trou-blank" id="trou-blank">___</span>' + apres;

  setProgress('trou', tIndex, tCards.length);

  const choices = [...t.choix].sort(() => Math.random() - .5);
  const container = document.getElementById('trou-choices');
  container.innerHTML = '';
  choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = ch;
    btn.addEventListener('click', () => handleTrouAnswer(btn, ch === t.trou, t));
    container.appendChild(btn);
  });
}

function handleTrouAnswer(btn, ok, t) {
  if (tAnswered) return;
  tAnswered = true;
  updateQuestionProgress(currentLecon.id, 'trous', t._qid, ok);
  const blank = document.getElementById('trou-blank');
  blank.textContent = t.trou;
  blank.style.color = ok ? 'var(--correct)' : 'var(--wrong)';
  if (ok) { btn.classList.add('correct'); tScore++; }
  else {
    btn.classList.add('wrong');
    document.querySelectorAll('#trou-choices .choice').forEach(b => {
      if (b.textContent === t.trou) b.classList.add('correct');
    });
  }
  if (t.note) {
    const el = document.getElementById('trou-note');
    el.textContent = '💡 ' + t.note;
    el.classList.remove('hidden');
  }
  document.querySelectorAll('#trou-choices .choice').forEach(b => b.disabled = true);
  setTimeout(() => { tIndex++; renderTrou(); }, 1600);
}

function showTrouResult() {
  document.getElementById('trou-choices').classList.add('hidden');
  document.getElementById('trou-card').classList.add('hidden');
  document.getElementById('trou-result').classList.remove('hidden');
  const pct = Math.round(tScore / tCards.length * 100);
  document.getElementById('trou-score').textContent =
    `${pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}  ${tScore} / ${tCards.length}  (${pct}%)`;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function setProgress(prefix, index, total) {
  document.getElementById(prefix + '-progress-text').textContent = `${index + 1} / ${total}`;
  document.getElementById(prefix + '-progress-fill').style.width = ((index + 1) / total * 100) + '%';
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── BUG 1 + 2 FIX : interaction carte unifiée, sans onclick HTML ─────────────
function setupCardInteraction() {
  const cardEl = document.getElementById('card');
  let startX = 0;
  let startY = 0;
  let didMove = false;

  // Touch : swipe ou tap immédiat sans délai 300ms
  cardEl.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    didMove = false;
  }, { passive: true });

  cardEl.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > 8 || dy > 8) didMove = true;
  }, { passive: true });

  cardEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) {
      // swipe
      dx < 0 ? nextCard() : prevCard();
    } else if (!didMove) {
      // tap propre → flip immédiat, pas de délai
      flipCard();
    }
    // preventDefault bloque le click synthétique Android (délai 300ms)
    e.preventDefault();
  }, { passive: false });

  // Click pour desktop (souris)
  cardEl.addEventListener('click', flipCard);
}

function setupKeyboard() {
  document.addEventListener('keydown', e => {
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
    if (activeTab === 'flashcards') {
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === 'ArrowLeft')  prevCard();
      if (e.key === ' ') { e.preventDefault(); flipCard(); }
    }
    if (e.key === 'Enter') {
      const nextBtn = document.querySelector('.ecr-next-btn');
      if (nextBtn) { e.preventDefault(); nextBtn.click(); }
    }
  });
}

init();

// ─── ÉCRITURE ─────────────────────────────────────────────────────────────────
let ecrCards    = [];
let ecrIndex    = 0;
let ecrScore    = 0;
let ecrAnswered = false;
let ecrDirLuFr  = false; // false = fr→lu (défaut), true = lu→fr

// Normalise : retire accents, diacritiques, et toute ponctuation (insensible à virgule, point, etc.)
function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // diacritiques
    .replace(/ë/gi, 'e').replace(/ä/gi, 'a').replace(/ö/gi, 'o').replace(/ü/gi, 'u')
    .toLowerCase()
    .replace(/[.!?,;:]+/g, '')        // supprime toute ponctuation partout
    .replace(/\s+/g, ' ')
    .trim();
}

function startEcriture() {
  if (!currentLecon || !currentLecon.ecriture) {
    document.getElementById('ecr-card').classList.remove('hidden');
    document.getElementById('ecr-question').textContent = '⚠️ Données manquantes — rechargez la page.';
    return;
  }

  // Nettoie tous les boutons 'suivante' résiduels
  document.querySelectorAll('.ecr-next-btn').forEach(b => b.remove());
  document.getElementById('ecr-result').classList.add('hidden');
  document.getElementById('ecr-card').classList.remove('hidden');
  document.querySelector('.ecr-input-wrap').classList.remove('hidden');
  document.getElementById('ecr-feedback').classList.add('hidden');

  ecrCards = getWeightedQuestions(currentLecon.id, 'ecriture', currentLecon.ecriture);
  ecrIndex = 0; ecrScore = 0; ecrAnswered = false;
  document.getElementById('ecr-dir-btn').textContent = ecrDirLuFr ? '🇱🇺→🇫🇷' : '🇫🇷→🇱🇺';
  renderEcriture();
}

function renderEcriture() {
  if (ecrIndex >= ecrCards.length) { showEcritureResult(); return; }
  ecrAnswered = false;

  const q = ecrCards[ecrIndex];
  document.getElementById('ecr-question').textContent = ecrDirLuFr ? q.lu : q.fr;
  document.getElementById('ecr-dir-label').textContent = ecrDirLuFr ? 'Écrivez en français' : 'Écrivez en luxembourgeois';
  renderLevelDots(document.getElementById('ecr-level'),
    getQuestionLevel(currentLecon.id, 'ecriture', q._qid));
  document.querySelectorAll('.ecr-next-btn').forEach(b => b.remove());
  document.getElementById('ecr-feedback').classList.add('hidden');
  document.getElementById('ecr-feedback').className = 'ecr-feedback hidden';

  const input = document.getElementById('ecr-input');
  input.value = '';
  input.style.height = 'auto'; // reset auto-resize
  input.className = 'ecr-input';
  input.disabled = false;
  input.focus();

  const btn = document.getElementById('ecr-btn');
  btn.disabled = false;
  btn.textContent = 'Valider ✓';

  setProgress('ecr', ecrIndex, ecrCards.length);
}

function validateEcriture() {
  if (ecrAnswered) return;
  const input = document.getElementById('ecr-input');
  const userVal = input.value.trim();
  if (!userVal) return;

  ecrAnswered = true;
  const q = ecrCards[ecrIndex];
  const target = ecrDirLuFr ? q.fr : q.lu;
  const ok = normalize(userVal) === normalize(target);
  updateQuestionProgress(currentLecon.id, 'ecriture', q._qid, ok);

  input.disabled = true;
  input.className = 'ecr-input ' + (ok ? 'correct' : 'wrong');

  const feedback = document.getElementById('ecr-feedback');
  feedback.classList.remove('hidden');

  if (ok) {
    ecrScore++;
    feedback.className = 'ecr-feedback ok';
    feedback.innerHTML = '✅ Correct !';
  } else {
    feedback.className = 'ecr-feedback ko';
    feedback.innerHTML = '❌ Pas tout à fait…<span class="ecr-correct-answer">' +
      escHtml(target) + '</span>';
  }

  // Bouton suivant
  const btn = document.getElementById('ecr-btn');
  btn.disabled = true;
  btn.textContent = 'Valider ✓';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'ecr-next-btn';
  nextBtn.textContent = ecrIndex < ecrCards.length - 1 ? 'Question suivante →' : 'Voir le score →';
  nextBtn.addEventListener('click', () => {
    nextBtn.remove();
    ecrIndex++;
    renderEcriture();
  });
  feedback.after(nextBtn);
}

function showEcritureResult() {
  document.getElementById('ecr-card').classList.add('hidden');
  document.querySelector('.ecr-input-wrap').classList.add('hidden');
  document.getElementById('ecr-feedback').classList.add('hidden');
  // remove any leftover next btn
  document.querySelectorAll('.ecr-next-btn').forEach(b => b.remove());

  document.getElementById('ecr-result').classList.remove('hidden');
  const pct = Math.round(ecrScore / ecrCards.length * 100);
  document.getElementById('ecr-score').textContent =
    `${pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}  ${ecrScore} / ${ecrCards.length}  (${pct}%)`;
}

function toggleEcritureDir() {
  ecrDirLuFr = !ecrDirLuFr;
  document.getElementById('ecr-dir-btn').textContent = ecrDirLuFr ? '🇱🇺→🇫🇷' : '🇫🇷→🇱🇺';
  ecrCards = getWeightedQuestions(currentLecon.id, 'ecriture', currentLecon.ecriture);
  ecrIndex = 0; ecrScore = 0; ecrAnswered = false;
  document.querySelectorAll('.ecr-next-btn').forEach(b => b.remove());
  document.getElementById('ecr-feedback').className = 'ecr-feedback hidden';
  document.getElementById('ecr-result').classList.add('hidden');
  document.getElementById('ecr-card').classList.remove('hidden');
  document.querySelector('.ecr-input-wrap').classList.remove('hidden');
  renderEcriture();
}

// Textarea : auto-resize + Entrée pour valider (Shift+Entrée = saut de ligne)
const ecrInput = document.getElementById('ecr-input');

function autoResize() {
  ecrInput.style.height = 'auto';
  ecrInput.style.height = ecrInput.scrollHeight + 'px';
}

ecrInput.addEventListener('input', autoResize);

ecrInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();   // ← empêche le listener global de re-traiter le même appui
    const nextBtn = document.querySelector('.ecr-next-btn');
    if (nextBtn) {
      nextBtn.click();
    } else {
      validateEcriture();
    }
  }
});

// Textarea de session : même comportement (auto-resize + Entrée pour valider)
const sessionInput = document.getElementById('session-input');
if (sessionInput) {
  sessionInput.addEventListener('input', () => {
    sessionInput.style.height = 'auto';
    sessionInput.style.height = sessionInput.scrollHeight + 'px';
  });
  sessionInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();   // ← idem
      const nextBtn = document.querySelector('.ecr-next-btn');
      if (nextBtn) {
        nextBtn.click();
      } else {
        validateSessionInput();
      }
    }
  });
}
