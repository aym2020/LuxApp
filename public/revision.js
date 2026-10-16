// ─── AUJOURD'HUI, SÉANCE DU JOUR, LEXIQUE, MES PIÈGES ───────────────────────
// Deux couches qui ne se mélangent jamais :
//   - ce qui est ACQUIS (étoiles, Terminée, Sans faute, total de jours) : en or,
//     ne baisse jamais ;
//   - ce qui BOUGE (mots à réviser, fraîcheur, série) : en turquoise, se recharge
//     en révisant.
// Rien n'est verrouillé : la séance du jour est une proposition, pas une limite.

// ─── ANNEAU DE FRAÎCHEUR (autour du numéro d'une leçon) ─────────────────────
// f = fraîcheur de 0 à 1, ou null si rien n'a encore été vu (anneau vide).
function anneauHtml(numero, f, couleur) {
  const rayon = 17;
  const tour = 2 * Math.PI * rayon;
  const arc = f == null ? 0 : Math.round(f * tour * 10) / 10;
  return '<div class="anneau" style="--lc:' + couleur + '">' +
    '<svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">' +
      '<circle cx="22" cy="22" r="' + rayon + '" class="anneau-fond"></circle>' +
      (arc > 0 ? '<circle cx="22" cy="22" r="' + rayon + '" class="anneau-arc" stroke-dasharray="' +
        arc + ' ' + tour + '" transform="rotate(-90 22 22)"></circle>' : '') +
    '</svg><span>' + numero + '</span></div>';
}

// Texte « À rafraîchir · 6 » (vide si rien à réviser).
function rafraichirHtml(nbDus) {
  if (!nbDus) return '';
  return '<span class="lecon-pill pc-pill-fraicheur">À rafraîchir · ' + nbDus + '</span>';
}

// ─── PROCHAINE ÉTAPE CONSEILLÉE ─────────────────────────────────────────────
// Unité en cours à reprendre, sinon première unité jamais terminée du niveau.
function prochaineEtape() {
  const saved = loadRun();
  if (saved) {
    const l = leconsActives().find(x => x.id === saved.leconId);
    if (isParcoursLecon(l)) {
      const quoi = saved.uniteId === 'all' ? 'leçon complète' : 'unité ' + saved.uniteId;
      return { titre: 'Reprendre', texte: 'Leçon ' + l.id + ' · ' + quoi, fn: reprendreRun };
    }
  }
  for (const l of leconsActives()) {
    if (!isParcoursLecon(l)) continue;
    const u = l.unites.find(x => getUnitBest(l.id, x.id) == null);
    if (u) {
      return {
        titre: 'Prochaine unité',
        texte: 'Leçon ' + l.id + ' · ' + u.titre,
        fn: () => { openParcoursLecon(l); openIntro(u.id); }
      };
    }
  }
  return null;
}

// ─── BLOC « AUJOURD'HUI » DE L'ACCUEIL ──────────────────────────────────────
function renderAujourdhui() {
  const box = document.getElementById('today');
  if (!box) return;

  const nbDus = resumeRevision(leconsActives()).dus.length;
  const minutes = Math.max(1, Math.round(nbDus * 10 / 60)); // ~10 s par question
  const suite = prochaineEtape();
  const objectifAtteint = getJours()[dayString(0)] === 2;
  const serie = serieActuelle();

  const semaine = semaineEnCours().map(j => {
    let classe = 'td-jour';
    if (j.valeur === 2) classe += ' objectif';
    else if (j.valeur === 1) classe += ' pratique';
    if (j.aujourdhui) classe += ' auj';
    if (j.futur) classe += ' futur';
    return '<div class="' + classe + '"><span>' + j.lettre + '</span><i></i></div>';
  }).join('');

  let objectif;
  if (objectifAtteint) objectif = '<div class="td-objectif ok">Objectif du jour atteint</div>';
  else if (nbDus) objectif = '<div class="td-objectif">Objectif : ta révision du jour, ou une unité</div>';
  else objectif = '<div class="td-objectif">Objectif : finir une unité</div>';

  box.innerHTML =
    '<div class="td-head">' +
      '<div><div class="pc-mini-label pc-gold">AUJOURD\'HUI</div>' +
      '<div class="td-serie">' + (serie ? 'Série : ' + serie + (serie > 1 ? ' jours' : ' jour') : 'Commence ta série aujourd\'hui') + '</div></div>' +
    '</div>' +
    '<div class="td-semaine">' + semaine + '</div>' +
    '<div class="td-lignes">' +
      '<div class="td-ligne">' + (nbDus
        ? '<b>' + nbDus + (nbDus > 1 ? ' questions' : ' question') + ' à réviser</b> · environ ' + minutes + ' min'
        : 'Rien à réviser aujourd\'hui') + '</div>' +
      '<div class="td-ligne">' + (suite
        ? '<span class="td-muted">' + suite.titre + ' :</span> ' + escHtml(suite.texte)
        : '<span class="td-muted">Toutes les unités sont terminées</span>') + '</div>' +
    '</div>' +
    objectif +
    '<button class="pc-btn primary wide big" onclick="lancerSeance()">Ma séance</button>';
}

// ─── SÉANCE DU JOUR ─────────────────────────────────────────────────────────
// 1. Toutes les questions à réviser (les plus en retard d'abord, sans plafond).
// 2. Puis la suite : prochaine unité, ou les plus fragiles.
function lancerSeance() {
  const dus = resumeRevision(leconsActives()).dus;
  const suite = prochaineEtape();

  if (!dus.length) {
    if (suite) suite.fn();
    else lancerPlusFragiles();
    return;
  }

  const actions = [];
  if (suite) actions.push({ label: 'Continuer : ' + suite.texte, primary: true, fn: suite.fn });
  actions.push({ label: 'Continuer avec les plus fragiles', primary: !suite, fn: lancerPlusFragiles });
  actions.push({ label: 'Accueil', fn: goDashboard });

  demarrerSession('review', 'SÉANCE DU JOUR', dus, {
    apresFin: () => marquerJour(2), // révision du jour faite = objectif atteint
    actions
  });
}

// Questions déjà vues qui ont posé problème, les plus fragiles d'abord.
// Aucune limite : on peut tout enchaîner.
function plusFragiles(listeLecons) {
  const store = getStatsStore(); // lu UNE fois
  const liste = [];
  listeLecons.forEach(l => {
    itemsRevision(l).forEach(item => {
      const byLecon = store[item.leconId];
      const s = byLecon && byLecon[item.type] && byLecon[item.type][item.qid];
      if (!s || !s.attempts) return;
      if (!(s.wrongTotal > 0 || s.difficultyScore > 0)) return;
      const prio = s.difficultyScore * 5 + Math.min(s.wrongTotal, 10) * 2 - s.correctStreak * 1.5;
      liste.push({ item, prio });
    });
  });
  liste.sort((a, b) => b.prio - a.prio);
  return liste.map(x => x.item);
}

function lancerPlusFragiles() {
  const items = plusFragiles(leconsActives());
  if (!items.length) {
    alert('Rien de fragile pour l\'instant : tout ce que tu as vu est solide.');
    goDashboard();
    return;
  }
  demarrerSession('review', 'LES PLUS FRAGILES', items, {
    actions: [{ label: 'Accueil', primary: true, fn: goDashboard }]
  });
}

// ─── LEXIQUE ────────────────────────────────────────────────────────────────
function openLexique() {
  document.getElementById('lexique-niveau').textContent = niveauActif;
  renderLexique();
  showView('view-lexique');
}

// Mots d'une leçon pour le lexique (mot caché v2 ou cartes v1).
function motsLexique(l) {
  // noteHtml : le point d'attention est du HTML écrit dans la leçon (<b>…</b>),
  // la note d'une ancienne carte est du texte simple (échappé).
  return (l.flashcards || []).map(c => ({
    lu: isParcoursLecon(l) ? motComplet(c) : c.lu,
    fr: c.fr,
    noteHtml: c.attention ? c.attention : escHtml(c.note || '')
  }));
}

function renderLexique() {
  const recherche = normalize(document.getElementById('lexique-input').value || '');
  let html = '';
  let total = 0;

  leconsActives().forEach(l => {
    const mots = motsLexique(l).filter(m => !recherche || normalize(m.lu + ' ' + m.fr).includes(recherche));
    if (!mots.length) return;
    total += mots.length;
    html += '<div class="lx-groupe">' +
      '<button class="lx-lecon" style="--lc:' + l.couleur + '" onclick="ouvrirLeconDepuisListe(' + l.id + ')">' +
        'Leçon ' + l.id + ' · ' + escHtml(l.titre) + '</button>' +
      mots.map(m => '<div class="lx-mot"><div><b>' + escHtml(m.lu) + '</b>' +
        (m.noteHtml ? '<em>' + m.noteHtml + '</em>' : '') + '</div><span>' + escHtml(m.fr) + '</span></div>').join('') +
      '</div>';
  });

  document.getElementById('lexique-compte').textContent = total + (total > 1 ? ' mots' : ' mot');
  document.getElementById('lexique-liste').innerHTML = html ||
    '<p class="lx-vide">Aucun mot ne correspond à ta recherche.</p>';
}

function ouvrirLeconDepuisListe(id) {
  const l = lecons.find(x => x.id === id);
  if (isParcoursLecon(l)) openParcoursLecon(l);
  else openLecon(l);
}

// ─── MES PIÈGES ─────────────────────────────────────────────────────────────
// Calculé à partir des stats : les questions qui ont un point d'attention
// (champ "attention", ou note d'un trou) et sur lesquelles on s'est déjà trompé.
// Les questions qui partagent le même point d'attention sont regroupées.
function texteItem(item) {
  const q = item.q;
  if (item.type === 'motcache') return motComplet(q) + ' = ' + q.fr;
  if (item.type === 'quiz') return q.question + ' → ' + q.reponse;
  if (item.type === 'trous') return [q.avant, q.trou, q.apres].filter(Boolean).join(' ');
  return q.lu;
}

function calculerPieges() {
  const store = getStatsStore(); // lu UNE fois
  const parTexte = {};
  leconsActives().forEach(l => {
    itemsRevision(l).forEach(item => {
      const texte = attentionDe(item);
      if (!texte) return;
      const byLecon = store[item.leconId];
      const s = byLecon && byLecon[item.type] && byLecon[item.type][item.qid];
      if (!s || !s.wrongTotal) return;
      if (!parTexte[texte]) parTexte[texte] = { texte, erreurs: 0, lecons: [], items: [] };
      const p = parTexte[texte];
      p.erreurs += s.wrongTotal;
      if (!p.lecons.includes(l.id)) p.lecons.push(l.id);
      p.items.push(item);
    });
  });
  return Object.values(parTexte).sort((a, b) => b.erreurs - a.erreurs);
}

function openPieges() {
  document.getElementById('pieges-niveau').textContent = niveauActif;
  renderPieges();
  showView('view-pieges');
}

function renderPieges() {
  const pieges = calculerPieges();
  const box = document.getElementById('pieges-content');

  if (!pieges.length) {
    box.innerHTML = '<p class="lx-vide">Aucun piège pour l\'instant. Quand tu te trompes sur un point ' +
      'd\'attention (genre, article, règle…), il arrive ici pour que tu le relises.</p>';
    return;
  }

  const nbQuestions = pieges.reduce((a, p) => a + p.items.length, 0);
  box.innerHTML =
    '<button class="pc-btn primary wide big" onclick="reviserPieges()">Réviser ces pièges · ' +
      nbQuestions + (nbQuestions > 1 ? ' questions' : ' question') + '</button>' +
    pieges.map(p => '<div class="pg-carte">' +
      '<div class="pg-texte">' + p.texte + '</div>' +
      '<div class="pg-meta">Leçon ' + p.lecons.join(', ') + ' · ' + p.erreurs +
        (p.erreurs > 1 ? ' erreurs' : ' erreur') + '</div>' +
      '<div class="pg-exemples">' + p.items.slice(0, 2).map(i => escHtml(texteItem(i))).join('<br>') + '</div>' +
      '</div>').join('');
}

function reviserPieges() {
  const items = [];
  calculerPieges().forEach(p => p.items.forEach(i => items.push(i)));
  demarrerSession('review', 'MES PIÈGES', melanger(items), {
    actions: [
      { label: 'Revoir mes pièges', primary: true, fn: openPieges },
      { label: 'Accueil', fn: goDashboard }
    ]
  });
}
