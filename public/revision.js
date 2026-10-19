// ─── AUJOURD'HUI, SÉANCE DU JOUR, LEXIQUE, MES PIÈGES ───────────────────────
// Deux couches qui ne se mélangent jamais :
//   - ce qui est ACQUIS (étoiles, Terminée, Sans faute, total de jours) : en or,
//     ne baisse jamais ;
//   - ce qui BOUGE (mots à réviser, fraîcheur, série) : en turquoise, se recharge
//     en révisant.
// Rien n'est verrouillé : la séance du jour fait 20 questions, puis on propose
// « Encore 20 ». « Réviser → Tout » reste disponible pour tout faire d'un coup.

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

// Texte « 6 questions à réviser » (vide si rien à réviser, spec 48).
function rafraichirHtml(nbDus) {
  if (!nbDus) return '';
  return '<span class="lecon-pill pc-pill-fraicheur">' + texteAReviser(nbDus) + '</span>';
}

// ─── PROCHAIN PAS (S1, S2) ──────────────────────────────────────────────────
// Une seule réponse à « que faire maintenant » côté leçons :
//   1. une partie d'unité en cours à reprendre ;
//   2. sinon, dans l'ordre des leçons (v1 et v2 mélangées), la première pas faite :
//        - leçon v1 : faite au statut « bien » (70 % et plus) ;
//        - leçon v2 : faite quand toutes ses unités du fil sont terminées ;
//   3. sinon, la mission d'une leçon v2 jamais jouée.
// La 1re fois dans une leçon v2, on ouvre l'écran de la leçon (mission en haut),
// pas l'intro de l'unité.
function prochainPas() {
  const saved = loadRun();
  if (saved) {
    const l = leconsActives().find(x => x.id === saved.leconId);
    // Une partie d'une leçon déjà acquise (validée par la mission) n'est plus le prochain pas (spec 32).
    if (isParcoursLecon(l) && !leconTerminee(l)) {
      return { titre: 'Reprendre', texte: 'Leçon ' + numLecon(l) + ' · ' + nomPartie(saved.uniteId, saved.mode), lecon: l, type: 'reprise', reprise: true, fn: reprendreRun };
    }
  }
  for (const l of leconsActives()) {
    if (!isParcoursLecon(l)) {
      if (leconV1Faite(l)) continue;
      return { titre: 'Prochaine leçon', texte: 'Leçon ' + numLecon(l) + ' · ' + l.titre_fr, lecon: l, type: 'v1', fn: () => openLecon(l) };
    }
    if (leconTerminee(l)) continue; // acquise (unités + mission réussie, raccourci par la mission, ancienne version)
    const u = unitesCoeur(l).find(x => getUnitBest(l.id, x.id) == null);
    if (u) {
      return {
        titre: 'Prochaine unité',
        texte: 'Leçon ' + numLecon(l) + ' · ' + u.titre,
        lecon: l,
        type: 'unite',
        unite: u,
        fn: () => {
          // Introduction de mission pas encore confirmée : on la montre d'abord.
          const dejaVue = getLeconVue(l.id) && !introMissionAVoir(l);
          openParcoursLecon(l);
          if (dejaVue) openIntro(u.id);
        }
      };
    }
    if (l.mission && l.scene) { // unités faites, mission pas encore réussie
      return {
        titre: 'Mission',
        texte: 'Leçon ' + numLecon(l) + ' · ' + l.mission.titre,
        lecon: l,
        type: 'mission',
        fn: () => { openParcoursLecon(l); openMission(); }
      };
    }
  }
  return null;
}

// ─── SÉANCE DU JOUR ─────────────────────────────────────────────────────────
// Une séance = TAILLE_SEANCE questions au plus (les plus urgentes d'abord).
// À la fin, on propose d'en faire encore autant : c'est l'utilisateur qui
// décide de continuer, sans limite, mais on ne lui montre jamais une montagne.
const TAILLE_SEANCE = 20;

// ─── SÉANCE EN COURS (pour la reprendre) ────────────────────────────────────
// On garde sur l'appareil la liste des questions de la séance du jour, la
// position et le score. Quitter la séance (« Accueil ») ne la perd plus :
// « Reprendre ma séance » repart à la question où on s'est arrêté.
//   luxSeance = { date: "2026-10-16", questions: [{ leconId, type, qid }], index: 7, score: 5 }
// Une séance d'un autre jour est oubliée.
const SEANCE_KEY = 'luxSeance';

function saveSeance() {
  const data = {
    date: dayString(0),
    questions: session.questions.map(x => ({ leconId: x.leconId, type: x.type, qid: x.qid })),
    index: session.index + 1, // la question en cours vient d'être répondue
    score: session.score,
    maj: Date.now()           // pour la synchronisation : le plus récent gagne (S8)
  };
  try { localStorage.setItem(storageKey(SEANCE_KEY), JSON.stringify(data)); } catch (e) { /* ignore */ }
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// Séance finie ou abandonnée : on garde une marque « finie » datée, pour qu'un
// autre appareil ne propose plus de reprendre l'ancienne version (S8).
function clearSeance() {
  try { localStorage.setItem(storageKey(SEANCE_KEY), JSON.stringify({ fini: true, maj: Date.now() })); } catch (e) { /* ignore */ }
  if (typeof debounceCloudSave === 'function') debounceCloudSave();
}

// Séance commencée aujourd'hui et pas finie, sinon null.
function loadSeance() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(storageKey(SEANCE_KEY))); } catch (e) { data = null; }
  if (!data || data.fini || !data.questions || data.date !== dayString(0) || data.index >= data.questions.length) return null;
  return data;
}

// Retrouve les questions de la séance sauvegardée dans les leçons.
// Une question qui n'existe plus (leçon modifiée) est simplement sautée.
function questionsSeance(data) {
  const toutes = {};
  lecons.forEach(l => { // tous les niveaux : la révision n'est jamais filtrée (S13)
    itemsRevision(l).forEach(item => { toutes[item.leconId + '-' + item.type + '-' + item.qid] = item; });
  });
  const liste = [];
  let index = data.index;
  data.questions.forEach((x, i) => {
    const item = toutes[x.leconId + '-' + x.type + '-' + x.qid];
    if (item) liste.push(item);
    else if (i < data.index) index--; // question déjà faite qui a disparu
  });
  return { liste, index };
}

// Bouton « Ma séance » : reprend la séance en cours, sinon en lance une nouvelle.
function lancerSeance() {
  const enCours = loadSeance();
  if (enCours) {
    const q = questionsSeance(enCours);
    if (q.index < q.liste.length) {
      jouerSeance(q.liste, { index: q.index, score: enCours.score });
      return;
    }
    clearSeance();
  }
  nouvelleSeance();
}

function nouvelleSeance() {
  clearSeance();
  const dus = resumeRevision(lecons).dus; // tous les niveaux (S13)
  const suite = prochainPas();

  if (!dus.length) {
    if (suite) suite.fn();
    else lancerPlusFragiles();
    return;
  }
  jouerSeance(dus.slice(0, TAILLE_SEANCE), { index: 0, score: 0 });
}

function jouerSeance(questions, depart) {
  demarrerSession('review', 'SÉANCE DU JOUR', questions, {
    depart: depart,
    apresReponse: saveSeance, // sauvée après chaque réponse
    apresFin: () => {
      clearSeance();
      marquerRevisionFaite(); // révision du jour faite (S7)
    },
    // Calculé à la fin de la séance : ce qui reste dépend des réponses données.
    actions: () => {
      const reste = resumeRevision(lecons).dus.length;
      const suiteFin = prochainPas();
      const actions = [];
      // La révision du jour est faite : la suite conseillée est la leçon (S7).
      // « Réviser encore » reste possible, mais n'est plus le bouton principal.
      if (suiteFin) actions.push({ label: 'Continuer : ' + suiteFin.texte, primary: true, fn: suiteFin.fn });
      if (reste) actions.push({ label: 'Réviser encore · ' + Math.min(reste, TAILLE_SEANCE) + ' questions', primary: !suiteFin, fn: nouvelleSeance });
      actions.push({ label: 'Accueil', fn: goDashboard });
      return actions;
    }
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
  const items = plusFragiles(lecons);
  if (!items.length) {
    notifier('Rien de fragile pour l\'instant : tout ce que tu as vu est solide.');
    goDashboard();
    return;
  }
  demarrerSession('review', 'LES PLUS FRAGILES', items.slice(0, TAILLE_SEANCE), {
    actions: [
      { label: 'Encore ' + TAILLE_SEANCE + ' questions', primary: true, fn: lancerPlusFragiles },
      { label: 'Terminer', fn: goDashboard }
    ]
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
    motSeul: c.lu, // SPEC 68 : pour retrouver le son LOD
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
        'Leçon ' + numLecon(l) + ' · ' + escHtml(l.titre) + '</button>' +
      mots.map(m => '<div class="lx-mot"><div><b>' + escHtml(m.lu) + '</b>' + boutonEcouterHtml(m.motSeul, true) +
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
      '<div class="pg-meta">Leçon ' + p.lecons.map(numLecon).join(', ') + ' · ' + p.erreurs +
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
