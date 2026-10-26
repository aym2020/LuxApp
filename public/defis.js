// SPEC 107 — Variantes inédites après validation d'une leçon (Chemin).
// Les quiz publiés servent de sources vérifiées : on inverse la direction
// FR↔LU sans inventer de traduction ni recycler une question déjà inversée.
// Les cas non bijectifs, questions audio et consignes sont exclus.
const NB_DEFIS_PAR_LECON = 12;
const NB_DEFIS_INEDITS_SESSION = 4;
const NB_RAPPELS_SESSION = 3;
const PREFIXE_DEFI = 'defi-inverse-v1-';

function poolDefisLecon(l) {
  if (!l || !Array.isArray(l.unites) || !Array.isArray(l.quiz)) return [];
  const qzs = l.quiz;
  const paires = new Set(qzs.map(q => String(q.question || '').trim() + '\u0000' + String(q.reponse || '').trim()));
  const inverses = new Map();
  qzs.forEach(q => {
    const cle = String(q.reponse || '').trim();
    if (!inverses.has(cle)) inverses.set(cle, new Set());
    inverses.get(cle).add(String(q.question || '').trim());
  });
  const propres = qzs.filter(q => {
    if (q.id == null || q.plus || typeof q.question !== 'string' || typeof q.reponse !== 'string') return false;
    if (q.unite != null && l.unites.some(u => u.id === q.unite && u.bonus)) return false;
    const a = q.question.trim(), b = q.reponse.trim();
    if (!a || !b || a === b || a.length > 95 || b.length > 95) return false;
    if (/[?？！]/.test(a) || /^(écoute|choisis|quelle?s? |quels? |complète|traduis|associe|comment |pourquoi )/i.test(a)) return false;
    if (/<[^>]+>/.test(a + b)) return false;
    if ((inverses.get(b) || new Set()).size !== 1) return false;
    if (paires.has(b + '\u0000' + a)) return false;
    return true;
  });
  const ret = [];
  for (const q of propres) {
    const bonne = q.question.trim();
    const estPhrase = /[.!…]$/.test(bonne);
    const candidats = propres.filter(x => {
      const txt = x.question.trim();
      if (x.id === q.id || txt === bonne || x.reponse.trim() === q.reponse.trim()) return false;
      if (/[.!…]$/.test(txt) !== estPhrase) return false;
      const ratio = txt.length / bonne.length;
      return ratio >= 0.45 && ratio <= 2.3;
    }).sort((a, b) =>
      (Number(b.unite === q.unite) - Number(a.unite === q.unite)) ||
      Math.abs(a.question.length - bonne.length) - Math.abs(b.question.length - bonne.length) ||
      String(a.id).localeCompare(String(b.id))
    );
    const distracteurs = [...new Set(candidats.map(x => x.question.trim()))].slice(0, 3);
    if (distracteurs.length !== 3 || distracteurs.includes(bonne)) continue;
    const id = PREFIXE_DEFI + q.id;
    const question = {
      id, unite: q.unite, label: 'CHOISIS LA CORRESPONDANCE',
      question: q.reponse.trim(), reponse: bonne, distracteurs,
      defiInedit: true
    };
    ret.push({ leconId: l.id, type: 'quiz', qid: id, q: question });
    if (ret.length >= NB_DEFIS_PAR_LECON) break;
  }
  return ret;
}

// « Découvert » = au moins une réponse enregistrée (bonne ou mauvaise).
// Les stats sont déjà isolées par profil et synchronisées dans Firebase.
function defisIneditsRestants(l, stats) {
  const store = stats || getStatsStore();
  const vus = (store[l.id] && store[l.id].quiz) || {};
  return poolDefisLecon(l).filter(i => !vus[i.qid] || !vus[i.qid].attempts);
}
function itemsDefisDecouverts(l, stats) {
  const store = stats || getStatsStore();
  const vus = (store[l.id] && store[l.id].quiz) || {};
  return poolDefisLecon(l).filter(i => vus[i.qid] && vus[i.qid].attempts > 0);
}
function retournerAuDefis(lid) {
  cheminLeconOuverte = lid;
  goLessons();
}

// Maximum quatre nouveaux + trois rappels ciblés. Une partie interrompue
// ne consomme que les questions auxquelles on a effectivement répondu.
function lancerDefisLecon(lid) {
  const l = lecons.find(x => x.id === lid);
  if (!l || !leconTerminee(l)) return;
  const store = getStatsStore();
  const nouveaux = defisIneditsRestants(l, store);
  if (!nouveaux.length) { lancerRevisionAcquisLecon(lid); return; }
  const inedits = melanger(nouveaux).slice(0, NB_DEFIS_INEDITS_SESSION);
  const base = itemsRevision(l, store).filter(i => !i.q.defiInedit &&
    store[l.id] && store[l.id][i.type] && store[l.id][i.type][i.qid] &&
    store[l.id][i.type][i.qid].attempts > 0);
  const dues = resumeRevision([l]).dus.filter(i => !i.q.defiInedit);
  const rappel = [...dues, ...melanger(base).filter(i =>
    !dues.some(d => d.type === i.type && d.qid === i.qid))]
    .slice(0, NB_RAPPELS_SESSION);
  demarrerSession('review', 'NOUVEAUX DÉFIS · LEÇON ' + numLecon(l),
    melanger([...inedits, ...rappel]), {
      actions: () => [
        { label: defisIneditsRestants(l).length ? 'Encore des défis' : 'Réviser mes acquis',
          primary: true, fn: () => lancerDefisLecon(lid) },
        { label: 'Mon chemin', fn: () => retournerAuDefis(lid) }
      ]
    });
}

// Pool épuisé : révision directe, due en premier, sinon questions déjà vues.
// Ne passe pas par l'écran de configuration S'entraîner.
function lancerRevisionAcquisLecon(lid) {
  const l = lecons.find(x => x.id === lid);
  if (!l || !leconTerminee(l)) return;
  const dues = resumeRevision([l]).dus;
  const store = getStatsStore();
  const deja = itemsRevision(l, store).filter(i => {
    const s = store[l.id] && store[l.id][i.type] && store[l.id][i.type][i.qid];
    return s && s.attempts > 0;
  });
  const candidats = dues.length ? dues : deja.length ? melanger(deja) : melanger(itemsRevision(l, store));
  demarrerSession('review', 'RÉVISER MES ACQUIS · LEÇON ' + numLecon(l),
    candidats.slice(0, 20), {
      actions: [
        { label: 'Mon chemin', primary: true, fn: () => retournerAuDefis(lid) },
        { label: 'Réviser encore', fn: () => lancerRevisionAcquisLecon(lid) }
      ]
    });
}
