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
  lecons = await fetch('/api/lecons').then(r => r.json());
  renderHome();
  setupTabs();
  setupCardInteraction(); // BUG 1 fix : remplace setupSwipe()
  setupKeyboard();
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function renderHome() {
  const list = document.getElementById('lecon-list');
  list.innerHTML = '';
  lecons.forEach(l => {
    const el = document.createElement('div');
    el.className = 'lecon-card';
    el.innerHTML = `
      <div class="lecon-card-accent" style="background:${l.couleur}"></div>
      <div class="lecon-card-body">
        <div class="lecon-card-num">LEÇON ${l.id}</div>
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
}

function openLecon(l) {
  currentLecon = l;

  document.getElementById('lecon-num').textContent = `LEÇON ${l.id}`;
  document.getElementById('lecon-titre').textContent = l.titre;
  document.getElementById('lecon-header').style.borderBottomColor = l.couleur + '44';

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="flashcards"]').classList.add('active');
  document.getElementById('tab-flashcards').classList.add('active');

  fcCards = [...l.flashcards];
  fcIndex = 0;
  fcDirLuFr = false;
  document.getElementById('fc-dir-btn').textContent = '🇫🇷→🇱🇺';
  renderFC();

  showView('view-lecon');
}

function goHome() {
  showView('view-home');
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
      if (btn.dataset.tab === 'quiz')  startQuiz();
      if (btn.dataset.tab === 'trous') startTrous();
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

  qCards = [...currentLecon.quiz].sort(() => Math.random() - .5);
  qIndex = 0; qScore = 0; qAnswered = false;
  renderQuizQ();
}

function renderQuizQ() {
  if (qIndex >= qCards.length) { showQuizResult(); return; }
  qAnswered = false;
  const q = qCards[qIndex];

  document.getElementById('quiz-label').textContent = q.label || '';
  document.getElementById('quiz-word').textContent  = q.question;
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

  tCards = [...currentLecon.trous].sort(() => Math.random() - .5);
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
  });
}

init();

// ─── ÉCRITURE ─────────────────────────────────────────────────────────────────
let ecrCards  = [];
let ecrIndex  = 0;
let ecrScore  = 0;
let ecrAnswered = false;

// Normalise : retire accents et diacritiques, lowercase, trim espaces multiples
function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // supprime les diacritiques
    .replace(/ë/gi, 'e').replace(/ä/gi, 'a').replace(/ö/gi, 'o').replace(/ü/gi, 'u')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function startEcriture() {
  if (!currentLecon || !currentLecon.ecriture) return;

  document.getElementById('ecr-result').classList.add('hidden');
  document.getElementById('ecr-card').classList.remove('hidden');
  document.querySelector('.ecr-input-wrap').classList.remove('hidden');
  document.getElementById('ecr-feedback').classList.add('hidden');

  ecrCards = [...currentLecon.ecriture].sort(() => Math.random() - .5);
  ecrIndex = 0; ecrScore = 0; ecrAnswered = false;
  renderEcriture();
}

function renderEcriture() {
  if (ecrIndex >= ecrCards.length) { showEcritureResult(); return; }
  ecrAnswered = false;

  const q = ecrCards[ecrIndex];
  document.getElementById('ecr-question').textContent = q.fr;
  document.getElementById('ecr-feedback').classList.add('hidden');
  document.getElementById('ecr-feedback').className = 'ecr-feedback hidden';

  const input = document.getElementById('ecr-input');
  input.value = '';
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
  const ok = normalize(userVal) === normalize(q.lu);

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
      escHtml(q.lu) + '</span>';
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

// Valider avec Entrée
document.getElementById('ecr-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') validateEcriture();
});
