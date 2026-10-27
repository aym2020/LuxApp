/* SPEC 109 — Lux Match : interface (DÉMO).
   Téléphone + écrans en HTML (lisibles et accessibles), scène 3D chargée à la demande
   (lux-match-3d.js), règles dans lux-match-core.js.
   Parcours : swipe → match → (enquête Pix / Pro / Amis) → look → rendez-vous 3D → résultats.
   Les répliques luxembourgeoises viennent de data/jeux/lux-match/ (brouillons à auditer) :
   la démo l'indique à l'écran. Aucune progression des leçons n'est modifiée. */
'use strict';

const LM_STYLES = [
  { id: 'sportif', nom: 'Sportif' }, { id: 'casual', nom: 'Casual' }, { id: 'loose', nom: 'Loose' },
  { id: 'bcbg', nom: 'BCBG' }, { id: 'creatif', nom: 'Créatif' }
];
const LM_COULEURS = [
  { id: 'schwaarz', fr: 'noir', hex: '#1c1b20' }, { id: 'wäiss', fr: 'blanc', hex: '#f2f0ea' },
  { id: 'blo', fr: 'bleu', hex: '#2f6fd6' }, { id: 'gréng', fr: 'vert', hex: '#2fa35a' },
  { id: 'rout', fr: 'rouge', hex: '#d8343c' }, { id: 'beige', fr: 'beige', hex: '#d9c3a0' }
];
// Fond des « photos » Pix selon la scène décrite dans la bible (le personnage est rendu en 3D).
const LM_SCENES = {
  parc: '#8ec8e8', foot: '#1c2b4a', reception: '#2a1a22', ville_nuit: '#141a30',
  carnet: '#3a2a24', atelier: '#c9b8a2', lisbonne: '#9fd0f0', train: '#4a4458'
};
const LM_FONDS = { carte: '#3a2a55', pro: '#2a3550', amis: '#2d4a3a', alex: '#2a3550' };
// Titres de la bible (UI_RESULT_*) et textes génériques quand aucun fait personnalisé ne colle.
const LM_ISSUES = {
  nouveau_rdv: { titre: 'NOUVEAU RDV !', texte: 'Elle veut te revoir. Le courant passe… et ton histoire tient la route.' },
  gene_drole: { titre: 'GÊNANT… MAIS DRÔLE', texte: 'Tes inventions t’ont rattrapé, mais vous avez bien ri.' },
  pas_colle: { titre: 'ÇA NE COLLE PAS', texte: 'Sympa, sans plus. Une autre personne, un autre style ?' },
  malaise: { titre: 'MALAISE TOTAL', texte: 'Trop de contradictions : elle a préféré partir. Tes mensonges avaient une suite !' }
};
// Réaction 3D selon le visuel renvoyé par le moteur.
// Gestes sobres par défaut ; grands effets (scratch, zoom) réservés aux gags rares.
const LM_VISUELS = {
  parle: 'parle', hoche: 'hoche', sourire: 'sourire', sourcil: 'sourcil', rire: 'rire', froid: 'froid',
  gene: 'gene', scratch: 'scratch', zoom: 'zoom', joie: 'joie'
};

const lm = {
  donnees: null, partie: null, ecran: null, app: null,
  rendu3d: null, promesse3d: null, portraits: {},
  aideFr: false, attente: null, boucleBatterie: null, feedbackTimer: null
};

// ─── Utilitaires ────────────────────────────────────────────────────────────

function lmEchapper(texte) {
  return String(texte == null ? '' : texte).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function lmCle(nom) { return typeof storageKey === 'function' ? storageKey(nom) : nom; }
function lmLire(nom, defaut) {
  try { const v = localStorage.getItem(lmCle(nom)); return v == null ? defaut : JSON.parse(v); } catch (_) { return defaut; }
}
function lmEcrire(nom, valeur) {
  try { localStorage.setItem(lmCle(nom), JSON.stringify(valeur)); } catch (_) { /* facultatif */ }
}
function lmBox() { return document.getElementById('lm-jeu'); }
function lmVueActive() {
  const vue = document.getElementById('view-luxmatch');
  return !!vue && vue.classList.contains('active');
}
function lmIcone(nom) {
  const d = {
    retour: '<path d="M15 5l-7 7 7 7"/>', coeur: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    croix: '<path d="M6 6l12 12M18 6L6 18"/>', oeil: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
    tel: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', moi: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4"/>',
    son: '<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>', muet: '<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M17 9l4 6M21 9l-4 6"/>',
    cadenas: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    menu: '<path d="M5 7h14M5 12h14M5 17h14"/>', fermer: '<path d="M6 6l12 12M18 6L6 18"/>',
    dossier: '<path d="M4 6h6l2 2h8v10H4z"/><path d="M9 13h6"/>'
  }[nom] || '';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
}

// Pictogrammes originaux du faux téléphone et du dressing (SVG en ligne, aucun fichier).
const LM_PICTOS = {
  pix: '<rect x="4" y="8" width="24" height="17" rx="3"/><path d="M11 8l2-3h6l2 3"/><circle cx="16" cy="16.5" r="5"/><path d="M24 12h1"/>',
  pro: '<rect x="4" y="10" width="24" height="15" rx="2"/><path d="M12 10V7h8v3M4 16h24"/><path d="M15 16v2h2v-2"/>',
  amis: '<circle cx="11" cy="12" r="4"/><circle cx="21" cy="12" r="4"/><path d="M4 25c1-4 4-6 7-6s6 2 7 6M14 25c1-4 4-6 7-6s6 2 7 6"/>',
  sportif: '<path d="M4 21l3-9 6 2 2-3 4 1 1 4 7 2 1 3H4z"/><path d="M9 16l2 1M12 15l2 1"/>',
  casual: '<path d="M11 5l-6 3 2 6 3-1v13h12V13l3 1 2-6-6-3c-1 2-3 3-5 3s-4-1-5-3z"/>',
  loose: '<path d="M10 7c1-3 3-4 6-4s5 1 6 4l6 4-2 6-3-1v11H9V16l-3 1-2-6 6-4z"/><path d="M13 7c1 2 2 3 3 3s2-1 3-3M14 20h4"/>',
  bcbg: '<path d="M11 4l5 6 5-6 6 4v18H5V8z"/><path d="M16 10l-2 3 2 9 2-9z"/><path d="M11 4l-1 8 4 3M21 4l1 8-4 3"/>',
  creatif: '<path d="M16 4C9 4 4 9 4 15s5 11 11 11c2 0 2-2 1-3s-1-3 1-3h4c3 0 6-2 6-6 0-6-5-10-11-10z"/><circle cx="10" cy="14" r="1.5"/><circle cx="14" cy="9" r="1.5"/><circle cx="20" cy="9" r="1.5"/><circle cx="23" cy="14" r="1.5"/>'
};
// Signes « manga » originaux au-dessus de la scène 3D (SPEC §15) : gros traits sombres,
// lisibles sur le café néon et sur le portrait de repli.
const LM_SIGNES = {
  awkward: '<path class="lm-s-trait" d="M32 6C40 22 50 31 50 42a18 18 0 0 1-36 0c0-11 10-20 18-36z"/><path fill="#6ec6ff" d="M32 6C40 22 50 31 50 42a18 18 0 0 1-36 0c0-11 10-20 18-36z"/><ellipse fill="#fff" cx="25" cy="40" rx="3.5" ry="6"/>',
  annoyed: '<g class="lm-s-trait lm-s-ligne"><path d="M27 8c1 9-4 15-14 16M37 8c-1 9 4 15 14 16M27 56c1-9-4-15-14-16M37 56c-1-9 4-15 14-16"/></g><g fill="none" stroke="#ff3b4e" stroke-width="6" stroke-linecap="round"><path d="M27 8c1 9-4 15-14 16M37 8c-1 9 4 15 14 16M27 56c1-9-4-15-14-16M37 56c-1-9 4-15 14-16"/></g>',
  doubt: '<g class="lm-s-trait lm-s-ligne"><path d="M21 22a11 11 0 1 1 16 9c-4 3-5 5-5 10"/><circle cx="32" cy="52" r="4"/></g><g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M21 22a11 11 0 1 1 16 9c-4 3-5 5-5 10"/></g><circle fill="#fff" cx="32" cy="52" r="4.5"/>',
  delighted: '<g class="lm-s-trait"><path d="M22 6Q22 20 36 20Q22 20 22 34Q22 20 8 20Q22 20 22 6z"/><path d="M46 26Q46 36 56 36Q46 36 46 46Q46 36 36 36Q46 36 46 26z"/><path d="M26 42Q26 49 33 49Q26 49 26 56Q26 49 19 49Q26 49 26 42z"/></g><path fill="#ffd84a" d="M22 6Q22 20 36 20Q22 20 22 34Q22 20 8 20Q22 20 22 6z"/><path fill="#ff8ae6" d="M46 26Q46 36 56 36Q46 36 46 46Q46 36 36 36Q46 36 46 26z"/><path fill="#fff4b0" d="M26 42Q26 49 33 49Q26 49 26 56Q26 49 19 49Q26 49 26 42z"/>',
  charmed: '<path class="lm-s-trait" d="M32 54C10 38 6 26 14 18c6-6 14-4 18 4 4-8 12-10 18-4 8 8 4 20-18 36z"/><path fill="#ff5fb7" d="M32 54C10 38 6 26 14 18c6-6 14-4 18 4 4-8 12-10 18-4 8 8 4 20-18 36z"/><path fill="#ffd1ec" d="M18 22c3-3 7-3 9 0-3 0-6 2-7 5-2-1-3-3-2-5z"/>',
  stunned: '<g class="lm-s-trait lm-s-ligne"><path d="M24 10l2 30M40 10l-2 30M6 14l8 6M58 14l-8 6M4 34h8M60 34h-8"/><circle cx="26.5" cy="51" r="4"/><circle cx="37.5" cy="51" r="4"/></g><g fill="none" stroke="#ffd84a" stroke-width="7" stroke-linecap="round"><path d="M24 10l2 30M40 10l-2 30"/></g><g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M6 14l8 6M58 14l-8 6M4 34h8M60 34h-8"/></g><circle fill="#ffd84a" cx="26.5" cy="51" r="4.5"/><circle fill="#ffd84a" cx="37.5" cy="51" r="4.5"/>'
};
// Affiche UN signe près de la tête de la partenaire (le précédent est annulé).
function lmEmotion(e) {
  lmEffacerEmotion();
  if (!e || !LM_SIGNES[e.type]) return;
  const calque = document.getElementById('lm-emotion');
  if (!calque) return;
  const afficher = () => {
    const point = (lm.rendu3d && lm.rendu3d.pointTete && lm.rendu3d.pointTete()) || { x: 0.6, y: 0.3 };
    calque.style.left = (Math.max(0.12, Math.min(0.88, point.x)) * 100) + '%';
    calque.style.top = (Math.max(0.12, Math.min(0.46, point.y)) * 100) + '%';
    calque.className = 'lm-emotion lm-emotion-' + e.type + ' lm-emotion-' + (e.intensite || 'subtle');
    calque.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true">' + LM_SIGNES[e.type] + '</svg>';
    lm.emotionTimer = setTimeout(lmEffacerEmotion, e.intensite === 'big' ? 1700 : 1300);
  };
  // Petit silence avant la goutte de gêne : le « poker face » fait partie du gag.
  if (e.delai) lm.emotionTimer = setTimeout(afficher, e.delai); else afficher();
}
function lmEffacerEmotion() {
  clearTimeout(lm.emotionTimer); lm.emotionTimer = null;
  const calque = document.getElementById('lm-emotion');
  if (calque) { calque.className = 'lm-emotion'; calque.innerHTML = ''; }
}

function lmPicto(nom) {
  return '<svg class="lm-picto" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (LM_PICTOS[nom] || '') + '</svg>';
}

// ─── Sons (Web Audio, propres au jeu) ───────────────────────────────────────

const LuxMatchSon = (function () {
  let audio = null;
  const actif = () => lmLire('luxMatchSon', true);
  function preparer() {
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; } }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }
  function note(f, debut, duree, volume, forme, fin) {
    const a = audio, o = a.createOscillator(), g = a.createGain(), t = a.currentTime + debut;
    o.type = forme || 'square'; o.frequency.setValueAtTime(f, t);
    if (fin) o.frequency.exponentialRampToValueAtTime(fin, t + duree);
    g.gain.setValueAtTime(volume, t); g.gain.linearRampToValueAtTime(0, t + duree);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + duree + 0.02);
  }
  const sons = {
    swipe: () => note(500, 0, 0.08, 0.05, 'triangle', 260),
    like: () => { note(660, 0, 0.06, 0.06); note(990, 0.06, 0.12, 0.06); },
    match: () => [523, 659, 784, 1046, 1318].forEach((f, i) => note(f, i * 0.08, 0.14, 0.07)),
    bien: () => { note(988, 0, 0.06, 0.06); note(1319, 0.06, 0.2, 0.06); },
    bof: () => note(330, 0, 0.18, 0.06, 'triangle'),
    faux: () => { note(260, 0, 0.12, 0.08); note(196, 0.12, 0.22, 0.08); },
    scratch: () => note(1400, 0, 0.32, 0.08, 'sawtooth', 90),
    tel: () => { note(1760, 0, 0.04, 0.04); note(2349, 0.05, 0.05, 0.04); },
    vide: () => note(440, 0, 0.5, 0.07, 'square', 60),
    fin: () => [784, 659, 784, 1046].forEach((f, i) => note(f, i * 0.12, 0.16, 0.07))
  };
  function jouer(nom) {
    if (!actif() || !preparer() || !sons[nom]) return;
    try { sons[nom](); } catch (_) { /* le son est un bonus */ }
  }
  return { jouer, preparer, actif };
})();

// ─── Entrée / sortie ────────────────────────────────────────────────────────

async function lmChargerDonnees() {
  if (lm.donnees) return lm.donnees;
  const r = await fetch('/api/jeux/lux-match');
  if (!r.ok) throw new Error('donnees');
  const json = await r.json();
  if (!json.contenus) throw new Error('donnees');
  lm.donnees = json;
  return lm.donnees;
}
// Le moteur 3D est créé une seule fois (préchargé dès l'ouverture du jeu).
function lmObtenir3D() {
  if (!lm.promesse3d) {
    lm.promesse3d = import('./lux-match-3d.js?v=7').then(() => window.LuxMatch3D.creer());
    lm.promesse3d.then(r => { lm.rendu3d = r; }).catch(() => { lm.promesse3d = null; });
  }
  return lm.promesse3d;
}

// Écran de chargement sobre : logo, barre en paliers, étape en cours.
function lmEcranChargement(progres, etape) {
  const box = lmBox();
  if (!box) return;
  if (!box.querySelector('.lm-lancement')) {
    box.innerHTML = '<div class="lm-lancement" role="status" aria-live="polite">' +
      '<div class="lm-lancement-logo">LUX <i>♥</i> MATCH</div>' +
      '<div class="lm-lancement-barre"><i id="lm-lancement-progres"></i></div>' +
      '<p id="lm-lancement-etape"></p></div>';
  }
  const barre = document.getElementById('lm-lancement-progres');
  const texte = document.getElementById('lm-lancement-etape');
  if (barre) barre.style.width = progres + '%';
  if (texte) texte.textContent = etape;
}
async function ouvrirLuxMatch() {
  luxMatchArreter();
  LuxMatchSon.preparer();
  showView('view-luxmatch');
  const debut = performance.now();
  lmEcranChargement(10, 'Connexion au réseau…');
  try { await lmChargerDonnees(); } catch (_) {
    const box = lmBox();
    if (box) box.innerHTML = lmEntete() + '<p class="lm-chargement">Impossible de charger Lux Match. Vérifie ta connexion.</p>';
    return;
  }
  lm.aideFr = lmLire('luxMatchAideFr', true);
  const partie = LuxMatchCore.nouvellePartie(lm.donnees, { parties: lmLire('luxMatchParties', 0) });
  lm.partie = partie;
  lmEcranChargement(40, 'Recherche de profils à proximité…');
  // On attend la 3D et les deux premières photos, 6 s au plus (sinon les initiales s'affichent).
  const premieres = [['alex', 'Idle', LM_FONDS.alex]].concat(partie.paquet.slice(0, 2).map(id => [LuxMatchCore.profilParId(partie, id), 'Idle', LM_FONDS.carte]));
  const pret = lmObtenir3D().then(() => { lmEcranChargement(75, 'Préparation des photos…'); return lmPreparerImages(premieres); });
  await Promise.race([pret.catch(() => {}), new Promise(r => setTimeout(r, 6000))]);
  if (lm.partie !== partie || !lmVueActive()) return; // l'utilisateur est reparti
  lmEcranChargement(100, 'C’est parti !');
  // Durée minimale courte : l'écran ne clignote pas quand tout est déjà en cache.
  await new Promise(r => setTimeout(r, Math.max(250, 700 - (performance.now() - debut))));
  if (lm.partie !== partie || !lmVueActive()) return;
  lm.app = null;
  lmRendre();
}
function lmNouvellePartie() {
  lm.lookEnCours = null;
  lm.partie = LuxMatchCore.nouvellePartie(lm.donnees, { parties: lmLire('luxMatchParties', 0) });
  lm.app = null;
  lmRendre();
}
function luxMatchArreter() {
  lmArreterBatterie();
  lmEffacerEmotion();
  lmFermerCalque('lm-menu'); lmFermerCalque('lm-moi');
  lm.lookEnCours = null;
  clearTimeout(lm.feedbackTimer);
  if (lm.rendu3d) lm.rendu3d.detacher();
  lm.partie = null;
  lm.ecran = null;
}

// ─── Rendu par phase ───────────────────────────────────────────────────────

// En-tête compacte (SPEC §17.5) : retour, logo, aide FR là où il y a du luxembourgeois,
// et un menu (dossier d'Alex, son, quitter). Plus d'icône son permanente.
function lmEntete(options) {
  const avecFr = !options || options.fr !== false;
  return '<div class="lm-top"><button type="button" class="lm-icone-btn lm-retour" onclick="lmQuitter()" aria-label="Retour aux jeux">' + lmIcone('retour') + '</button>' +
    '<span class="lm-logo"><span>LUX <i>♥</i> MATCH</span> <small>DÉMO</small></span>' +
    '<div class="lm-top-outils">' +
      (avecFr ? '<button type="button" class="lm-icone-btn lm-fr-btn' + (lm.aideFr ? ' lm-actif' : '') + '" onclick="lmBasculerAide()" aria-pressed="' + lm.aideFr + '" aria-label="' + (lm.aideFr ? 'Aide FR activée' : 'Aide FR désactivée') + '">FR</button>' : '') +
      '<button type="button" class="lm-icone-btn" onclick="lmMenu(true)" aria-label="Menu" aria-haspopup="dialog">' + lmIcone('menu') + '</button>' +
    '</div></div>';
}
function lmQuitter() { luxMatchArreter(); if (typeof ouvrirJeux === 'function') ouvrirJeux(); }
function lmBasculerSon() { lmEcrire('luxMatchSon', !LuxMatchSon.actif()); lmMajMenu(); }

// ─── Menu (pause) et superpositions ────────────────────────────────────────
// Un seul calque à la fois au-dessus du jeu : menu ou dossier. Fermeture par le bouton,
// la touche Échap ou le retour Android (navigation.js appelle luxMatchFermerSuperposition).
function lmCalque(id, classe, titre) {
  let calque = document.getElementById(id);
  if (!calque) {
    calque = document.createElement('div');
    calque.id = id; calque.className = 'lm-calque ' + classe;
    calque.setAttribute('role', 'dialog'); calque.setAttribute('aria-modal', 'true'); calque.setAttribute('aria-label', titre);
    calque.addEventListener('click', e => { if (e.target === calque) luxMatchFermerSuperposition(); });
    const box = lmBox(); if (!box) return null;
    box.appendChild(calque);
    lm.focusAvantCalque = document.activeElement;
  }
  return calque;
}
function lmFermerCalque(id) {
  const calque = document.getElementById(id);
  if (!calque) return false;
  calque.remove();
  if (lm.focusAvantCalque && document.contains(lm.focusAvantCalque)) lm.focusAvantCalque.focus();
  lm.focusAvantCalque = null;
  if (typeof programmerGarde === 'function') programmerGarde();
  return true;
}
function lmMenu(ouvrir) {
  if (!ouvrir) return lmFermerCalque('lm-menu');
  lmFermerCalque('lm-moi');
  if (!lmCalque('lm-menu', 'lm-menu', 'Menu')) return;
  lmMajMenu();
  const premier = document.querySelector('#lm-menu button'); if (premier) premier.focus();
  if (typeof programmerGarde === 'function') programmerGarde();
}
function lmMajMenu() {
  const menu = document.getElementById('lm-menu');
  if (!menu || !lm.partie) return;
  const son = LuxMatchSon.actif();
  menu.innerHTML = '<div class="lm-menu-carte"><div class="lm-calque-tete"><h2>PAUSE</h2>' +
      '<button type="button" class="lm-icone-btn" onclick="lmMenu(false)" aria-label="Fermer">' + lmIcone('fermer') + '</button></div>' +
    (lm.partie.phase !== 'profil' ? '<button type="button" class="lm-menu-ligne" onclick="lmMoi(true)">' + lmIcone('dossier') + '<span>Dossier Alex</span></button>' : '') +
    '<button type="button" class="lm-menu-ligne" onclick="lmBasculerSon()" aria-pressed="' + son + '">' + lmIcone(son ? 'son' : 'muet') + '<span>Son</span><b>' + (son ? 'OUI' : 'NON') + '</b></button>' +
    '<button type="button" class="lm-menu-ligne lm-menu-quitter" onclick="lmQuitter()">' + lmIcone('retour') + '<span>Quitter Lux Match</span></button>' +
    '<button type="button" class="lm-btn lm-btn-or" onclick="lmMenu(false)">Reprendre</button></div>';
}
// Appelé par navigation.js : y a-t-il un calque Lux Match à fermer avant de quitter la vue ?
function luxMatchSuperposition() {
  if (!lmVueActive()) return false;
  return !!(document.getElementById('lm-menu') || document.getElementById('lm-moi') ||
    (lm.ecran === 'date' && lm.partie && lm.partie.telephoneOuvert) || (lm.ecran === 'reseaux' && lm.app));
}
function luxMatchFermerSuperposition() {
  if (!lmVueActive()) return false;
  if (lmFermerCalque('lm-menu') || lmFermerCalque('lm-moi')) return true;
  if (lm.ecran === 'date' && lm.partie && lm.partie.telephoneOuvert) { lmFermerTelephoneDate(); return true; }
  if (lm.ecran === 'reseaux' && lm.app) { lmOuvrirApp(null); return true; }
  return false;
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') luxMatchFermerSuperposition(); });
// Traduction française : seulement si l'aide est activée (jamais dans le flux luxembourgeois).
function lmFr(texte, classe) {
  return lm.aideFr && texte ? '<p class="lm-fr' + (classe ? ' ' + classe : '') + '">' + lmEchapper(texte) + '</p>' : '';
}
function lmLu(texte, classe) {
  return '<p class="lm-lu' + (classe ? ' ' + classe : '') + '" lang="lb">' + lmEchapper(texte) + '</p>';
}

function lmRendre() {
  const p = lm.partie, box = lmBox();
  if (!p || !box) return;
  if (lm.ecran !== p.phase) window.scrollTo(0, 0); // nouvel écran : on repart du haut
  lm.ecran = p.phase;
  if (p.phase !== 'date' && lm.rendu3d && p.phase !== 'look') lm.rendu3d.detacher();
  if (p.phase === 'profil') lmRendreProfil(box);
  else if (p.phase === 'swipe') lmRendreSwipe(box);
  else if (p.phase === 'match') lmRendreMatch(box);
  else if (p.phase === 'reseaux') lmRendreReseaux(box);
  else if (p.phase === 'look') lmRendreLook(box);
  else if (p.phase === 'date') lmRendreDate(box);
  else lmRendreResultats(box);
}

// Coque de téléphone (décor CSS) autour d'un contenu HTML lisible : faux OS « LUXNET ».
function lmTelephone(contenu, classe, batterie) {
  const niveau = batterie == null ? 100 : batterie;
  return '<div class="lm-tel ' + (classe || '') + '"><div class="lm-tel-ecran">' +
    '<div class="lm-tel-statut"><span>21:30</span><span class="lm-tel-reseau">LUX<i>♥</i>NET</span>' +
      '<span class="lm-tel-batt" aria-label="Batterie ' + Math.ceil(niveau) + ' %"><i style="width:' + Math.max(0, Math.min(100, niveau)) + '%"></i></span></div>' +
    contenu + '</div></div>';
}
// Portraits rendus en 3D (mis en cache) ; repli : initiale sur dégradé.
function lmCleImage(profil, pose, fond) { return (profil === 'alex' ? 'alex' : profil.id) + ':' + (pose || 'Idle') + ':' + (fond || ''); }
function lmImage(profil, pose, fond, classe) {
  const cle = lmCleImage(profil, pose, fond);
  const url = lm.portraits[cle];
  const nom = profil === 'alex' ? 'Alex' : profil.name;
  if (url) return '<img class="' + classe + '" src="' + url + '" alt="">';
  return '<div class="' + classe + ' lm-image-attente" data-image="' + lmEchapper(cle) + '"><span>' + lmEchapper(nom[0]) + '</span></div>';
}
// Prépare une liste d'images puis remplace les emplacements en attente.
async function lmPreparerImages(liste) {
  let moteur;
  try { moteur = await lmObtenir3D(); } catch (_) { return; }
  for (const [profil, pose, fond, nomScene] of liste) {
    // Plus de portraits une fois l'aperçu 3D ou le rendez-vous affiché (même modèles).
    if (!lm.partie || ['profil', 'swipe', 'match', 'reseaux', 'resultats'].indexOf(lm.partie.phase) < 0) return;
    const cle = lmCleImage(profil, pose, fond);
    if (lm.portraits[cle]) continue;
    try {
      lm.portraits[cle] = await moteur.portrait(profil, pose === 'Idle' ? 'Idle' : pose, fond, nomScene ? 320 : 240, nomScene ? 400 : 300, nomScene);
    } catch (_) { continue; }
    document.querySelectorAll('#lm-jeu [data-image="' + cle.replace(/"/g, '') + '"]').forEach(el => {
      const img = document.createElement('img');
      img.className = el.className.replace('lm-image-attente', '').trim();
      img.src = lm.portraits[cle]; img.alt = '';
      el.replaceWith(img);
    });
  }
}

// ── DOSSIER ALEX : fiche de personnage (faits canoniques + phrases LU de référence).
function lmFicheAlex() {
  const a = lm.partie.persona;
  return '<div class="lm-dossier">' +
    '<div class="lm-dossier-tete">' + lmImage('alex', 'Idle', LM_FONDS.alex, 'lm-dossier-photo') +
      '<div><p class="lm-dossier-nom">' + lmEchapper(a.name.toUpperCase()) + '</p>' +
      '<dl class="lm-dossier-stats">' + a.ficheFr.map(([k, v]) => '<div><dt>' + lmEchapper(k) + '</dt><dd>' + lmEchapper(v) + '</dd></div>').join('') + '</dl></div></div>' +
    '<p class="lm-dossier-sous">HABITUDES</p><ul class="lm-dossier-habitudes">' +
      a.habitudesFr.map(([k, oui]) => '<li class="' + (oui ? 'lm-oui-h' : 'lm-non-h') + '"><span>' + lmEchapper(k) + '</span><b>' + (oui ? 'OUI' : 'NON') + '</b></li>').join('') + '</ul>' +
    '<p class="lm-dossier-sous">EN LUXEMBOURGEOIS</p><ul class="lm-dossier-lu">' +
      a.lignes.map(l => '<li><span lang="lb">' + lmEchapper(l.lu) + '</span>' + (lm.aideFr ? '<small>' + lmEchapper(l.fr) + '</small>' : '') + '</li>').join('') + '</ul>' +
    '</div>';
}
function lmRendreProfil(box) {
  box.innerHTML = lmEntete() +
    '<div class="lm-profil"><h1 class="lm-titre-pixel">TON PROFIL</h1>' +
    lmFicheAlex() +
    '<div class="lm-actions lm-actions-bas"><button type="button" class="lm-btn lm-btn-or" onclick="lmCommencerSwipes()">Commencer les swipes</button></div></div>';
  lmPreparerImages([['alex', 'Idle', LM_FONDS.alex]].concat(lm.partie.paquet.slice(0, 2).map(id => [LuxMatchCore.profilParId(lm.partie, id), 'Idle', LM_FONDS.carte])));
}
function lmCommencerSwipes() {
  LuxMatchCore.commencerSwipes(lm.partie);
  LuxMatchSon.jouer('like');
  lmRendre();
}

// ── SWIPE
function lmRendreSwipe(box) {
  const p = lm.partie, profil = LuxMatchCore.carteCourante(p);
  const reste = p.paquet.length - p.indexCarte;
  const t = profil.tinder;
  const carte = '<div class="lm-carte" id="lm-carte">' +
      lmImage(profil, 'Idle', LM_FONDS.carte, 'lm-carte-photo') +
      '<div class="lm-carte-infos"><h2>' + lmEchapper(profil.name) + ', <span>' + profil.age + '</span></h2>' +
      lmLu(t.lu) + lmFr(t.fr) +
      (profil.ton ? '<p class="lm-lu lm-ton" lang="lb">' + lmEchapper(profil.ton.lu) + '</p>' + lmFr(profil.ton.fr) : '') +
      '<div class="lm-tags">' + t.tags.map(tag => '<span><b lang="lb">' + lmEchapper(tag.lu) + '</b>' + (lm.aideFr && tag.fr !== tag.lu ? '<small>' + lmEchapper(tag.fr) + '</small>' : '') + '</span>').join('') + '</div>' +
      '</div><div class="lm-tampon lm-tampon-oui">OUI</div><div class="lm-tampon lm-tampon-non">NON</div></div>';
  box.innerHTML = lmEntete() +
    '<p class="lm-consigne lm-consigne-mini">' + (p.indexCarte === 0 && !p.aimes.length ? 'Glisse à droite pour aimer, à gauche pour passer.' : reste + ' profil' + (reste > 1 ? 's' : '') + ' à proximité') + '</p>' +
    lmTelephone('<div class="lm-app-match"><div class="lm-app-titre">lux<b>♥</b>match</div>' + carte +
      '<div class="lm-swipe-boutons"><button type="button" class="lm-rond lm-non" onclick="lmSwiper(false)" aria-label="Passer">' + lmIcone('croix') + '</button>' +
      '<button type="button" class="lm-rond lm-oui" onclick="lmSwiper(true)" aria-label="J’aime">' + lmIcone('coeur') + '</button></div></div>');
  lmBrancherSwipe(document.getElementById('lm-carte'));
  lmPreparerImages(p.paquet.slice(p.indexCarte).map(id => [LuxMatchCore.profilParId(p, id), 'Idle', LM_FONDS.carte]));
}
function lmBoutonAide() {
  return '<button type="button" class="lm-aide-fr' + (lm.aideFr ? ' lm-actif' : '') + '" onclick="lmBasculerAide()" aria-pressed="' + lm.aideFr + '">Aide FR ' + (lm.aideFr ? 'activée' : 'désactivée') + '</button>';
}
// Le changement d'aide ne fait jamais perdre l'état affiché (lecture en cours, téléphone ouvert).
function lmBasculerAide() {
  lm.aideFr = !lm.aideFr; lmEcrire('luxMatchAideFr', lm.aideFr);
  if (lm.ecran !== 'date') { const moiOuvert = !!document.getElementById('lm-moi'); lmRendre(); if (moiOuvert) lmMoi(true); return; }
  document.querySelectorAll('#lm-jeu .lm-aide-fr').forEach(b => { b.outerHTML = lmBoutonAide(); });
  if (lm.attente === 'lecture' && lm.dernierResultat) lmAfficherResultat(lm.dernierResultat);
  else if (!lm.attente) lmMajDialogue();
  lmMajTelephoneDate();
  lmMajMoi();
}
// Glisser la carte : au-delà de 90 px, la décision est prise.
function lmBrancherSwipe(carte) {
  if (!carte) return;
  let depart = null;
  carte.addEventListener('pointerdown', e => { depart = e.clientX; carte.setPointerCapture(e.pointerId); carte.classList.add('lm-tire'); });
  carte.addEventListener('pointermove', e => {
    if (depart === null) return;
    const dx = e.clientX - depart;
    carte.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 14 + 'deg)';
    carte.classList.toggle('lm-penche-oui', dx > 40); carte.classList.toggle('lm-penche-non', dx < -40);
  });
  const fin = e => {
    if (depart === null) return;
    const dx = e.clientX - depart; depart = null;
    carte.classList.remove('lm-tire');
    if (Math.abs(dx) > 90) lmSwiper(dx > 0);
    else { carte.style.transform = ''; carte.classList.remove('lm-penche-oui', 'lm-penche-non'); }
  };
  carte.addEventListener('pointerup', fin); carte.addEventListener('pointercancel', fin);
}
function lmSwiper(aime) {
  const carte = document.getElementById('lm-carte');
  if (!lm.partie || lm.partie.phase !== 'swipe' || (carte && carte.classList.contains('lm-sortie'))) return;
  LuxMatchSon.jouer(aime ? 'like' : 'swipe');
  if (carte) { carte.classList.add('lm-sortie', aime ? 'lm-sortie-oui' : 'lm-sortie-non'); }
  setTimeout(() => {
    const resultat = LuxMatchCore.swiper(lm.partie, aime);
    if (resultat === 'match') LuxMatchSon.jouer('match');
    lmRendre();
    if (resultat === 'recommence') lmToast('Personne ne te plaît ? Une nouvelle série arrive.');
  }, 260);
}

// ── MATCH
function lmRendreMatch(box) {
  const p = lm.partie, profil = p.profil;
  box.innerHTML = lmEntete({ fr: false }) +
    '<div class="lm-match"><div class="lm-match-titre" aria-live="polite">IT’S A<br>MATCH!</div>' +
    '<div class="lm-match-duo">' + lmImage('alex', 'Idle', LM_FONDS.alex, 'lm-match-photo lm-g') + '<span class="lm-match-coeur">♥</span>' +
      lmImage(profil, 'Idle', LM_FONDS.carte, 'lm-match-photo lm-d') + '</div>' +
    '<p class="lm-match-texte">Toi et <b>' + lmEchapper(profil.name) + '</b> : vous allez vous retrouver au café ce soir.</p>' +
    '<p class="lm-match-astuce">Tu peux y aller direct, ou d’abord jeter un œil à ses réseaux…</p>' +
    '<div class="lm-actions"><button type="button" class="lm-btn lm-btn-or" onclick="lmApresMatch(\'date\')">Aller au date</button>' +
    '<button type="button" class="lm-btn lm-btn-violet" onclick="lmApresMatch(\'enqueter\')">Enquêter</button></div></div>';
  lmPreparerImages([['alex', 'Idle', LM_FONDS.alex], [profil, 'Idle', LM_FONDS.carte]].concat(lmListePhotos(profil)));
}
// Images d'une enquête : avatars des trois apps et photos Pix (si le compte est public).
function lmListePhotos(profil) {
  const photos = profil.pix.private ? [] : profil.pix.photos.map(ph => [profil, ph.pose, LM_SCENES[ph.scene] || LM_FONDS.carte, ph.scene]);
  return [[profil, 'Idle', LM_FONDS.carte], [profil, 'Idle', LM_FONDS.pro], [profil, 'Idle', LM_FONDS.amis]].concat(photos);
}
function lmApresMatch(choix) {
  LuxMatchCore.apresMatch(lm.partie, choix);
  lm.app = null;
  lmRendre();
}

// ── RÉSEAUX (préparation : consultation libre)
// Petits chiffres d'ambiance stables (même post = mêmes réactions), sans hasard.
function lmChiffre(texte, min, max) {
  let h = 7;
  for (let i = 0; i < texte.length; i++) h = (h * 31 + texte.charCodeAt(i)) % 9973;
  return min + h % (max - min + 1);
}
function lmIlYa(jours) { return jours <= 0 ? 'aujourd’hui' : 'il y a ' + jours + ' j'; }
function lmPseudo(profil) { return '@' + profil.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') + '.' + profil.city.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '').slice(0, 4); }
function lmPostsAmis(profil) {
  // Posts de base + posts ajoutés par le scénario (variantes et préférences, lot 4).
  return profil.amis.posts.concat((lm.partie && lm.partie.postsScenario) || []);
}
function lmEtatApp(profil, id) {
  if (id === 'pix') return profil.pix.private ? 'Privé' : profil.pix.photos.length + ' photos';
  if (id === 'pro') return profil.pro.poste;
  return lmPostsAmis(profil).length + ' posts';
}
const LM_APPS = [['pix', 'Pix', 'Photos'], ['pro', 'Pro', 'Carrière'], ['amis', 'Amis', 'Vie perso']];
function lmContenuApps(profil, depuisDate) {
  if (!lm.app) {
    return '<div class="lm-os"><div class="lm-os-tete">' + lmImage(profil, 'Idle', LM_FONDS.carte, 'lm-avatar lm-os-avatar') +
        '<div><p class="lm-os-titre">Réseaux de ' + lmEchapper(profil.name) + '</p><p class="lm-os-pseudo">' + lmEchapper(lmPseudo(profil)) + '</p></div></div>' +
      '<div class="lm-os-apps">' + LM_APPS.map(([id, nom, sous]) =>
        '<button type="button" class="lm-os-app lm-os-' + id + '" onclick="lmOuvrirApp(\'' + id + '\')" aria-label="' + nom + ' · ' + sous + '">' +
          '<span class="lm-os-icone">' + lmPicto(id) + (lm.partie.appsVues.indexOf(id) >= 0 ? '<em class="lm-vu" aria-label="déjà vu">✓</em>' : '') + '</span>' +
          '<b>' + nom + '</b><small>' + lmEchapper(lmEtatApp(profil, id)) + '</small></button>').join('') +
      '</div></div>';
  }
  const [, nomApp] = LM_APPS.find(a => a[0] === lm.app);
  const retour = '<div class="lm-app-barre lm-app-barre-' + lm.app + '"><button type="button" class="lm-app-retour" onclick="lmOuvrirApp(null)" aria-label="Retour aux apps">' + lmIcone('retour') + '</button>' +
    '<span class="lm-os-icone lm-os-icone-mini">' + lmPicto(lm.app) + '</span><b>' + nomApp + '</b></div>';
  if (lm.app === 'pix') {
    const pix = profil.pix;
    const tete = '<div class="lm-pix-tete">' + lmImage(profil, 'Idle', LM_FONDS.carte, 'lm-avatar') +
      '<div><b>' + lmEchapper(lmPseudo(profil)) + '</b>' +
      '<div class="lm-pix-compteurs"><span><b>' + (pix.private ? '—' : pix.photos.length) + '</b> posts</span><span><b>' + (pix.private ? '—' : pix.followers) + '</b> abonnés</span></div>' +
      lmLu(pix.bio.lu) + lmFr(pix.bio.fr) + '</div></div>';
    if (pix.private) {
      return retour + '<div class="lm-pix">' + tete + '<div class="lm-prive">' + lmIcone('cadenas') + '<b>Compte privé</b><span>Ses photos ne sont pas accessibles.</span></div></div>';
    }
    return retour + '<div class="lm-pix">' + tete + '<div class="lm-pix-fil">' + pix.photos.map(ph =>
      '<figure class="lm-pix-post">' + lmImage(profil, ph.pose, LM_SCENES[ph.scene] || LM_FONDS.carte, 'lm-pix-photo') +
        '<figcaption><div class="lm-pix-meta"><span>♥ ' + ph.likes + '</span><span>' + lmIlYa(ph.jours) + '</span></div>' +
        lmLu(ph.lu) + lmFr(ph.fr) + '</figcaption></figure>').join('') +
      '<p class="lm-fin-fil">Fin des publications.</p></div></div>';
  }
  if (lm.app === 'pro') {
    const pro = profil.pro;
    return retour + '<div class="lm-pro"><div class="lm-pro-banniere"></div>' + lmImage(profil, 'Idle', LM_FONDS.pro, 'lm-avatar lm-pro-avatar') +
      '<h3>' + lmEchapper(profil.name) + '</h3><p class="lm-pro-poste">' + lmEchapper(pro.poste) + ' · ' + lmEchapper(pro.ville) + '</p>' +
      '<section class="lm-pro-bloc"><h4>À propos</h4>' + lmLu(pro.texte.lu) + lmFr(pro.texte.fr) + '</section>' +
      '<dl><dt>Formation</dt><dd>' + lmEchapper(pro.formation) + '</dd><dt>Langues</dt><dd>' + lmEchapper(pro.langues) + '</dd></dl></div>';
  }
  const amis = profil.amis;
  return retour + '<div class="lm-amis"><div class="lm-pix-tete">' + lmImage(profil, 'Idle', LM_FONDS.amis, 'lm-avatar') +
    '<div><b>' + lmEchapper(profil.name) + '</b>' + lmLu(amis.bio.lu) + lmFr(amis.bio.fr) + '</div></div>' +
    lmPostsAmis(profil).map((post, i) => '<article class="lm-post"><div class="lm-post-tete">' + lmImage(profil, 'Idle', LM_FONDS.amis, 'lm-avatar lm-avatar-mini') +
      '<span><b>' + lmEchapper(profil.name) + '</b><small>' + lmIlYa(1 + i * 2) + '</small></span></div>' +
      lmLu(post.lu) + lmFr(post.fr) +
      '<div class="lm-post-pied"><span>♥ ' + lmChiffre(post.id, 3, 48) + '</span><span>' + lmChiffre(post.id + 'c', 1, 9) + ' commentaires</span></div></article>').join('') +
    '<p class="lm-fin-fil">Fin des publications.</p></div>';
}
function lmOuvrirApp(app) {
  lm.app = app;
  if (app) LuxMatchCore.noterApp(lm.partie, app);
  LuxMatchSon.jouer('tel');
  if (lm.ecran === 'date') lmMajTelephoneDate();
  else lmRendre();
}
function lmRendreReseaux(box) {
  const profil = lm.partie.profil;
  box.innerHTML = lmEntete() +
    lmTelephone('<div class="lm-tel-defile">' + lmContenuApps(profil, false) + '</div>', lm.app ? 'lm-tel-app' : 'lm-tel-hub') +
    '<div class="lm-actions lm-actions-tel"><button type="button" class="lm-btn lm-btn-or" onclick="lmAllerAuLook()">Choisir mon look →</button></div>';
  lmPreparerImages(lmListePhotos(profil));
}
function lmAllerAuLook() { lm.partie.phase = 'look'; lm.app = null; lmRendre(); }

// ── LOOK : mini-dressing arcade. Sans choix, on part avec la tenue par défaut.
function lmEtiquetteLook(look) {
  const style = LM_STYLES.find(s => s.id === look.style), couleur = LM_COULEURS.find(c => c.id === look.couleur);
  if (!style && !couleur) return 'TENUE ACTUELLE';
  return (style ? style.nom : 'Casual').toUpperCase() + (couleur ? ' · ' + couleur.id.toUpperCase() : '');
}
function lmNomCouleur(look) {
  const c = LM_COULEURS.find(x => x.id === look.couleur);
  return c ? '<b lang="lb">' + lmEchapper(c.id) + '</b>' + (lm.aideFr ? ' · ' + c.fr : '') : '';
}
function lmRendreLook(box) {
  const look = lm.lookEnCours || { style: null, couleur: null };
  lm.lookEnCours = look;
  box.innerHTML = lmEntete() +
    '<div class="lm-dressing"><h1 class="lm-titre-pixel">PRÉPARE TON LOOK</h1>' +
    '<div class="lm-cabine"><div class="lm-apercu" id="lm-apercu"><span class="lm-apercu-attente">Alex se prépare…</span></div>' +
      '<div class="lm-cabine-etiquette" id="lm-look-etiquette" aria-live="polite">' + lmEtiquetteLook(look) + '</div></div>' +
    '<p class="lm-dressing-sous">STYLE</p>' +
    '<div class="lm-styles" role="radiogroup" aria-label="Style">' + LM_STYLES.map(s =>
      '<button type="button" role="radio" aria-checked="' + (look.style === s.id) + '" class="lm-style' + (look.style === s.id ? ' lm-choisi' : '') + '" onclick="lmChoisirStyle(\'' + s.id + '\')">' +
      lmPicto(s.id) + '<span>' + s.nom + '</span></button>').join('') + '</div>' +
    '<p class="lm-dressing-sous">COULEUR <span id="lm-couleur-nom">' + lmNomCouleur(look) + '</span></p>' +
    '<div class="lm-couleurs" role="radiogroup" aria-label="Couleur">' + LM_COULEURS.map(c =>
      '<button type="button" role="radio" aria-checked="' + (look.couleur === c.id) + '" aria-label="' + c.id + ' (' + c.fr + ')" class="lm-pastille' + (look.couleur === c.id ? ' lm-choisi' : '') + '" onclick="lmChoisirCouleur(\'' + c.id + '\')">' +
      '<i style="background:' + c.hex + '"></i></button>').join('') + '</div>' +
    '<div class="lm-actions lm-actions-bas"><button type="button" class="lm-btn lm-btn-or" onclick="lmCommencerDate()">Aller au rendez-vous</button>' +
    '<button type="button" class="lm-btn lm-btn-lien lm-revoir" onclick="lmRevoirReseaux()">' + lmIcone('tel') + ' Revoir ses réseaux</button></div></div>';
  lmObtenir3D().then(m => m.apercu(document.getElementById('lm-apercu'), lmLookAffiche(look))).then(() => {
    const t = document.querySelector('#lm-apercu .lm-apercu-attente'); if (t) t.remove();
  }).catch(() => {
    const t = document.querySelector('#lm-apercu .lm-apercu-attente'); if (t) t.textContent = 'Aperçu 3D indisponible';
  });
}
// Tenue montrée : la sélection, ou la tenue par défaut (casual) pour ce qui n'est pas choisi.
function lmLookAffiche(look) { return { style: look.style || 'casual', couleur: look.couleur || null }; }
function lmRevoirReseaux() { lm.partie.phase = 'reseaux'; lm.partie.enquete = true; lm.app = null; lmRendre(); }
function lmChoisirStyle(id) { if (!lm.lookEnCours) return; lm.lookEnCours.style = id; lmMajLook(); }
function lmChoisirCouleur(id) { if (!lm.lookEnCours) return; lm.lookEnCours.couleur = id; lmMajLook(); }
function lmMajLook() {
  LuxMatchSon.jouer('like');
  const look = lm.lookEnCours;
  document.querySelectorAll('#lm-jeu .lm-styles .lm-style').forEach((b, i) => {
    const oui = LM_STYLES[i].id === look.style; b.classList.toggle('lm-choisi', oui); b.setAttribute('aria-checked', oui);
  });
  document.querySelectorAll('#lm-jeu .lm-couleurs .lm-pastille').forEach((b, i) => {
    const oui = LM_COULEURS[i].id === look.couleur; b.classList.toggle('lm-choisi', oui); b.setAttribute('aria-checked', oui);
  });
  const nom = document.getElementById('lm-couleur-nom'); if (nom) nom.innerHTML = lmNomCouleur(look);
  // Feedback court : étiquette qui « clignote » et petit saut d'Alex.
  const etiquette = document.getElementById('lm-look-etiquette');
  if (etiquette) { etiquette.textContent = lmEtiquetteLook(look); etiquette.classList.remove('lm-flash'); void etiquette.offsetWidth; etiquette.classList.add('lm-flash'); }
  if (lm.rendu3d) lm.rendu3d.apercu(document.getElementById('lm-apercu'), lmLookAffiche(look)).then(() => lm.rendu3d.saluerApercu()).catch(() => {});
}
// Un seul bouton : la tenue affichée est celle qui part au rendez-vous.
function lmCommencerDate() {
  const p = lm.partie, look = lm.lookEnCours || {};
  const choisi = !!(look.style || look.couleur);
  const effet = choisi ? LuxMatchCore.choisirLook(p, look.style || 'casual', look.couleur) : LuxMatchCore.choisirLook(p, null, null);
  p.lookChoisi = choisi ? lmLookAffiche(look) : null;
  lm.lookEnCours = null;
  LuxMatchCore.commencerDate(p);
  lm.effetLookAAnnoncer = choisi ? effet : null;
  lm.impressionAAfficher = p.impression;
  lmRendre();
}

// ── RENDEZ-VOUS
function lmRendreDate(box) {
  const p = lm.partie;
  box.innerHTML =
    '<div class="lm-date">' +
      '<div class="lm-scene" id="lm-scene"><div class="lm-scene-attente">Le café ouvre ses portes…</div></div>' +
      '<div class="lm-hud">' +
        '<button type="button" class="lm-icone-btn" onclick="lmMenu(true)" aria-label="Menu" aria-haspopup="dialog">' + lmIcone('menu') + '</button>' +
        '<div class="lm-jauges">' +
          '<div class="lm-jauge lm-jauge-aff"><span>' + lmIcone('coeur') + 'Affinité</span><b id="lm-aff-val">' + p.affinity + '</b><i><em id="lm-aff" style="width:' + p.affinity + '%"></em></i></div>' +
          '<div class="lm-jauge lm-jauge-sus"><span>' + lmIcone('oeil') + 'Suspicion</span><b id="lm-sus-val">' + p.suspicion + '</b><i><em id="lm-sus" style="width:' + p.suspicion + '%"></em></i></div>' +
        '</div>' +
        '<button type="button" class="lm-icone-btn lm-moi-btn" onclick="lmMoi(true)" aria-label="Dossier Alex">' + lmIcone('moi') + '<span>Moi</span></button>' +
        '<button type="button" class="lm-tel-btn" id="lm-tel-btn" onclick="lmOuvrirTelephoneDate()" aria-label="Ouvrir le téléphone">' + lmIcone('tel') + '<span id="lm-batterie">' + Math.ceil(p.battery) + '%</span></button>' +
      '</div>' +
      '<div class="lm-emotion" id="lm-emotion" aria-hidden="true"></div>' +
      '<div class="lm-feedback" id="lm-feedback" aria-live="polite"></div>' +
      '<div class="lm-bas">' +
        '<div class="lm-bulle" id="lm-bulle"></div>' +
        '<div class="lm-reponses" id="lm-reponses"></div>' +
        '<div class="lm-bas-pied">' + lmBoutonAide() + '<span class="lm-demo">DÉMO · textes LU en relecture</span></div>' +
      '</div>' +
      '<div class="lm-panneau" id="lm-tel-date" hidden></div>' +
    '</div>';
  const scene = document.getElementById('lm-scene');
  lmObtenir3D().then(m => m.date(scene, p.profil, p.lookChoisi)).then(() => {
    const t = scene.querySelector('.lm-scene-attente'); if (t) t.remove();
    if (lm.rendu3d) lm.rendu3d.reagir('parle');
  }).catch(() => {
    scene.classList.add('lm-scene-2d');
    const t = scene.querySelector('.lm-scene-attente');
    if (t) t.innerHTML = lmImage(p.profil, 'Idle', LM_FONDS.carte, 'lm-scene-portrait');
  });
  lmMajDialogue();
  if (lm.effetLookAAnnoncer) {
    const e = lm.effetLookAAnnoncer; lm.effetLookAAnnoncer = null;
    lmFeedback([{ texte: 'LOOK ' + (e > 0 ? '+' : '') + e + ' ♥', classe: e > 0 ? 'lm-plus' : 'lm-moins' }]);
  }
}
function lmNomSpeaker() { return lm.partie.profil.name; }
const LM_ETIQUETTES = { evenement: 'imprévu !', rappel: 'elle vérifie…', demande: 'à toi !' };
// Texte d'un choix : luxembourgeois (ou portugais pour le gag de Sofia), traduction si aide.
function lmTexteChoix(c) {
  if (c.lu) return '<span class="lm-lu" lang="lb">' + lmEchapper(c.lu) + '</span>' + (lm.aideFr && c.fr ? '<span class="lm-fr">' + lmEchapper(c.fr) + '</span>' : '');
  if (c.texte) return '<span class="lm-lu" lang="' + (c.langue || 'pt') + '">' + lmEchapper(c.texte) + '</span>' + (lm.aideFr ? '<span class="lm-fr">' + lmEchapper(c.fr.replace(/^[^(]*\(|\)$/g, '')) + '</span>' : '');
  return '<span class="lm-fr">' + lmEchapper(c.fr) + '</span>';
}
function lmMajDialogue() {
  const p = lm.partie, bulle = document.getElementById('lm-bulle'), rep = document.getElementById('lm-reponses');
  if (!bulle || !rep) return;
  const e = p.courant;
  if (!e) { bulle.innerHTML = ''; rep.innerHTML = ''; return; }
  // Expressions hors A1.1 (B24, B25) : traduction toujours visible (bible §6.28).
  const traduire = lm.aideFr || e.source.traductionVisible;
  const impression = lm.impressionAAfficher;
  lm.impressionAAfficher = null;
  bulle.innerHTML = (impression ? '<p class="lm-impression' + (impression.positive ? ' lm-positive' : '') + '">« ' + lmEchapper(impression.fr) + ' »</p>' : '') +
    '<span class="lm-speaker">' + lmEchapper(lmNomSpeaker()) + (LM_ETIQUETTES[e.type] ? ' <em>· ' + LM_ETIQUETTES[e.type] + '</em>' : '') + '</span>' +
    (e.prompt.lu ? lmLu(e.prompt.lu) : '') + (traduire || !e.prompt.lu ? '<p class="lm-fr">' + lmEchapper(e.prompt.fr) + '</p>' : '');
  rep.innerHTML = e.choix.map(c => '<button type="button" class="lm-reponse" onclick="lmRepondre(\'' + lmEchapper(c.id) + '\')">' +
    (e.source.traductionVisible && !lm.aideFr && c.lu ? lmTexteChoix(c) + '<span class="lm-fr">' + lmEchapper(c.fr) + '</span>' : lmTexteChoix(c)) + '</button>').join('');
}
function lmMajJauges() {
  const p = lm.partie;
  const maj = (id, v) => { const b = document.getElementById(id); const t = document.getElementById(id + '-val'); if (b) b.style.width = v + '%'; if (t) t.textContent = v; };
  maj('lm-aff', p.affinity); maj('lm-sus', p.suspicion);
}
// Messages arcade (police pixel) au-dessus de la scène.
function lmFeedback(lignes) {
  const box = document.getElementById('lm-feedback');
  if (!box) return;
  box.innerHTML = lignes.map(l => '<b class="' + l.classe + '">' + lmEchapper(l.texte) + '</b>').join('');
  box.classList.remove('lm-visible'); void box.offsetWidth; box.classList.add('lm-visible');
}
function lmToast(texte) {
  const t = document.createElement('div');
  t.className = 'lm-toast'; t.textContent = texte;
  const box = lmBox(); if (!box) return;
  box.appendChild(t); setTimeout(() => t.remove(), 2600);
}

function lmRepondre(choixId) {
  const p = lm.partie;
  if (!p || p.phase !== 'date' || !p.courant || lm.attente) return;
  const r = LuxMatchCore.repondre(p, choixId);
  if (!r) return;
  lmMajJauges();
  // Messages arcade (textes UI_FEED_* de la bible) puis jauges.
  const lignes = [];
  if (r.contradiction) lignes.push({ texte: 'CONTRADICTION !', classe: 'lm-alerte' });
  else if (r.aveu) lignes.push({ texte: 'SAUVÉ… DE JUSTESSE !', classe: 'lm-plus' });
  else if (r.bluff) lignes.push({ texte: 'BLUFF !', classe: 'lm-sus' });
  else if (!r.emotion && (r.langue === false || r.visuel === 'gene' || r.visuel === 'froid')) lignes.push({ texte: 'GÊNANT…', classe: 'lm-moins' }); // le signe suffit
  else if (r.reaction && r.reaction.cle === 'RAPPEL') lignes.push({ texte: 'ELLE S’EN SOUVIENT…', classe: 'lm-plus' });
  if (r.affinity) lignes.push({ texte: (r.affinity > 0 ? '+' : '') + r.affinity + ' ♥', classe: r.affinity > 0 ? 'lm-plus' : 'lm-moins' });
  if (r.suspicion > 0) lignes.push({ texte: 'SUSPICION +' + r.suspicion, classe: 'lm-sus' });
  if (r.suspicion < 0) lignes.push({ texte: 'SUSPICION ' + r.suspicion, classe: 'lm-plus' });
  if (lignes.length) lmFeedback(lignes);
  // Réaction 3D, signe manga (même décision sociale) et son.
  const reaction = LM_VISUELS[r.visuel] || null;
  if (lm.rendu3d && reaction) lm.rendu3d.reagir(reaction);
  lmEmotion(r.emotion);
  LuxMatchSon.jouer(r.visuel === 'scratch' || r.contradiction ? 'scratch' : r.langue === false ? 'faux' : r.affinity > 0 ? 'bien' : 'bof');
  // Panneau à lire (correction de langue, réaction d'imprévu, contradiction) ou suite automatique.
  const aLire = r.correction || r.reaction || r.reponseElle || r.finAnticipee;
  lm.dernierResultat = r;
  lm.attente = aLire ? 'lecture' : 'auto';
  lmAfficherResultat(r);
  if (!aLire) lm.feedbackTimer = setTimeout(lmContinuer, 1300);
}
// Réponse d'Alex dans la bulle, puis panneau de lecture si nécessaire (réaffiché si l'aide FR change).
function lmAfficherResultat(r) {
  const rep = document.getElementById('lm-reponses'), bulle = document.getElementById('lm-bulle');
  if (bulle) bulle.innerHTML = '<span class="lm-speaker">Toi</span><p class="lm-toi">' + lmTexteChoix(r.choix) + '</p>';
  if (rep) rep.innerHTML = lm.attente === 'lecture' ? lmHtmlLecture(r) : '';
}
function lmHtmlLecture(r) {
  let html = '<div class="lm-lecture">';
  if (r.correction) {
    html += '<p class="lm-correction-titre">Expression à retenir</p>' +
      '<p class="lm-faux" lang="lb">✗ ' + lmEchapper(r.choix.lu) + '</p>' +
      (r.correction.lu ? '<p class="lm-juste" lang="lb">✓ ' + lmEchapper(r.correction.lu) + '</p>' : '') +
      '<p class="lm-fr">' + lmEchapper(r.correction.fr) + '</p>';
  }
  if (r.reponseElle) {
    // Sa réponse canonique (même information que sur ses réseaux).
    html += '<div class="lm-reponse-elle"><span class="lm-speaker">' + lmEchapper(lm.partie.profil.name) + '</span>' + lmLu(r.reponseElle.lu) + lmFr(r.reponseElle.fr) + '</div>';
  }
  if (r.reaction && r.reaction.fr) html += '<p class="lm-reaction"><span class="lm-fr">' + lmEchapper(r.reaction.fr) + '</span></p>';
  if (r.finAnticipee) html += '<p class="lm-reaction"><span class="lm-fr">' + lmEchapper(lm.partie.profil.name) + ' se lève et prend son manteau…</span></p>';
  return html + '<button type="button" class="lm-btn lm-btn-or" onclick="lmContinuer()">Continuer ▸</button></div>';
}
function lmContinuer() {
  clearTimeout(lm.feedbackTimer);
  lmEffacerEmotion();
  lm.attente = null;
  lm.dernierResultat = null;
  const p = lm.partie;
  if (!p || !lmVueActive()) return;
  LuxMatchCore.continuer(p);
  if (p.phase !== 'date') { lmFermerPanneaux(); lmTerminer(); return; }
  lmMajDialogue();
  if (lm.rendu3d) lm.rendu3d.reagir('parle');
}

// Téléphone pendant le date : -5 % par seconde ouverte (temps actif uniquement).
function lmOuvrirTelephoneDate() {
  const p = lm.partie;
  if (!p || p.phase !== 'date') return;
  const evenement = LuxMatchCore.ouvrirTelephone(p);
  if (evenement === 'batterie_vide') { lmToast('Batterie à plat. Maintenant, improvise.'); LuxMatchSon.jouer('vide'); return; }
  LuxMatchSon.jouer('tel');
  if (evenement === 'piege_telephone') lmToast(p.profil.name + ' a remarqué ton téléphone…');
  lmEffacerEmotion();
  if (evenement === 'malus_telephone') { lmFeedback([{ texte: '-5 ♥', classe: 'lm-moins' }]); lmMajJauges(); if (lm.rendu3d) lm.rendu3d.reagir('froid'); }
  lm.app = null;
  const panneau = document.getElementById('lm-tel-date');
  if (panneau) panneau.hidden = false;
  lmMajTelephoneDate();
  lmDemarrerBatterie();
}
function lmMajTelephoneDate() {
  const p = lm.partie, panneau = document.getElementById('lm-tel-date');
  if (!panneau || panneau.hidden) return;
  const niveau = Math.ceil(p.battery);
  panneau.innerHTML = '<div class="lm-tel-date-barre' + (niveau < 20 ? ' lm-faible' : '') + '"><span>Batterie <b id="lm-batterie-tel">' + niveau + '%</b></span><i><em id="lm-batterie-jauge" style="width:' + niveau + '%"></em></i></div>' +
    lmTelephone('<div class="lm-tel-defile">' + lmContenuApps(p.profil, true) + '</div>', (niveau < 20 ? 'lm-tel-faible ' : '') + (lm.app ? 'lm-tel-app' : 'lm-tel-hub'), p.battery) +
    '<button type="button" class="lm-btn lm-btn-or" onclick="lmFermerTelephoneDate()">Revenir au rendez-vous</button>';
}
function lmFermerTelephoneDate() {
  const p = lm.partie;
  if (p) LuxMatchCore.fermerTelephone(p);
  lmArreterBatterie();
  const panneau = document.getElementById('lm-tel-date');
  if (panneau) panneau.hidden = true;
  lmMajBatterie();
}
function lmDemarrerBatterie() {
  lmArreterBatterie();
  let dernier = performance.now();
  const image = maintenant => {
    const p = lm.partie;
    if (!p || p.phase !== 'date' || !p.telephoneOuvert || !lmVueActive()) { lm.boucleBatterie = null; return; }
    lm.boucleBatterie = requestAnimationFrame(image);
    const dt = (maintenant - dernier) / 1000; dernier = maintenant;
    if (document.hidden) return; // appli masquée : aucune décharge
    if (LuxMatchCore.avancerTemps(p, dt) === 'batterie_vide') {
      LuxMatchSon.jouer('vide');
      lmFermerTelephoneDate();
      lmToast('Batterie à plat. Maintenant, improvise.');
      return;
    }
    // Alerte une seule fois par partie quand la batterie passe sous 20 %.
    if (p.battery < 20 && !p.alerteBatterie) { p.alerteBatterie = true; lmToast('20 % ! Fais vite.'); LuxMatchSon.jouer('tel'); }
    lmMajBatterie();
  };
  lm.boucleBatterie = requestAnimationFrame(image);
}
function lmArreterBatterie() { if (lm.boucleBatterie) cancelAnimationFrame(lm.boucleBatterie); lm.boucleBatterie = null; }
function lmMajBatterie() {
  const p = lm.partie; if (!p) return;
  const niveau = Math.ceil(p.battery);
  const b = document.getElementById('lm-batterie'); if (b) b.textContent = niveau + '%';
  const bt = document.getElementById('lm-batterie-tel'); if (bt) bt.textContent = niveau + '%';
  const j = document.getElementById('lm-batterie-jauge'); if (j) j.style.width = niveau + '%';
  document.querySelectorAll('#lm-tel-date .lm-tel-batt i').forEach(i => { i.style.width = Math.max(0, niveau) + '%'; });
  const btn = document.getElementById('lm-tel-btn'); if (btn) { btn.classList.toggle('lm-faible', niveau < 20); btn.classList.toggle('lm-vide', niveau <= 0); }
  const barre = document.querySelector('#lm-tel-date .lm-tel-date-barre'); if (barre) barre.classList.toggle('lm-faible', niveau < 20);
}
// Dossier d'Alex (sans batterie), depuis le menu ou le HUD du rendez-vous.
function lmMoi(ouvrir) {
  if (!ouvrir) return lmFermerCalque('lm-moi');
  lmFermerCalque('lm-menu');
  if (!lmCalque('lm-moi', 'lm-moi', 'Dossier Alex')) return;
  lmMajMoi();
  const fermer = document.querySelector('#lm-moi .lm-calque-tete button'); if (fermer) fermer.focus();
  lmPreparerImages([['alex', 'Idle', LM_FONDS.alex]]);
  if (typeof programmerGarde === 'function') programmerGarde();
}
function lmMajMoi() {
  const panneau = document.getElementById('lm-moi');
  if (!panneau || !lm.partie) return;
  panneau.innerHTML = '<div class="lm-moi-carte"><div class="lm-calque-tete"><h2>DOSSIER ALEX</h2>' +
    '<button type="button" class="lm-icone-btn" onclick="lmMoi(false)" aria-label="Fermer le dossier">' + lmIcone('fermer') + '</button></div>' +
    lmFicheAlex() + '</div>';
}
function lmFermerPanneaux() { lmFermerTelephoneDate(); lmMoi(false); lmMenu(false); }

// ── RÉSULTATS
function lmTerminer() {
  const p = lm.partie;
  lmEcrire('luxMatchParties', lmLire('luxMatchParties', 0) + 1);
  const record = lmLire('luxMatchRecord', 0);
  p.nouveauRecord = p.fin.score > record;
  if (p.nouveauRecord) lmEcrire('luxMatchRecord', p.fin.score);
  LuxMatchSon.jouer(p.fin.issue === 'nouveau_rdv' ? 'fin' : 'bof');
  // Seuls moments « animation complète » : la fin heureuse (Victory) et le malaise (Defeat).
  if (lm.rendu3d) lm.rendu3d.reagir(p.fin.issue === 'nouveau_rdv' ? 'joie' : p.fin.issue === 'malaise' ? 'deception' : 'hoche');
  setTimeout(() => { if (lm.partie === p && lmVueActive()) lmRendre(); }, 900);
}
function lmRendreResultats(box) {
  const p = lm.partie, issue = LM_ISSUES[p.fin.issue];
  const expressions = LuxMatchCore.expressionsTravaillees(p);
  box.innerHTML = lmEntete({ fr: false }) +
    '<div class="lm-resultats">' +
      '<div class="lm-res-titre lm-res-' + p.fin.issue + '">' + issue.titre + '</div>' +
      lmImage(p.profil, p.fin.issue === 'nouveau_rdv' ? 'Victory' : 'Idle', p.fin.issue === 'nouveau_rdv' ? '#5a2a55' : '#2a2438', 'lm-res-photo') +
      // Conclusion de la bible si son fait a vraiment eu lieu, sinon texte générique.
      (p.fin.texte ? '<blockquote class="lm-res-citation"><p>« ' + lmEchapper(p.fin.texte.fr) + ' »</p><cite>— ' + lmEchapper(p.profil.name) + '</cite></blockquote>'
        : '<p class="lm-res-texte">' + lmEchapper(issue.texte) + '</p>') +
      '<div class="lm-res-stats">' +
        '<div><span>Affinité</span><b>' + p.affinity + '</b></div><div><span>Suspicion</span><b>' + p.suspicion + '</b></div>' +
        '<div><span>Luxembourgeois</span><b>' + p.fin.langue + ' %</b></div></div>' +
      '<div class="lm-res-score"><span>SCORE</span><b>' + p.fin.score + '</b>' + (p.nouveauRecord ? '<em>NOUVEAU RECORD</em>' : '<small>Record ' + lmLire('luxMatchRecord', 0) + '</small>') + '</div>' +
      '<h2 class="lm-section">Ce qui s’est passé</h2><ul class="lm-resume">' +
        p.fin.resume.map(l => '<li class="lm-resume-' + l.type + '">' + lmEchapper(l.fr) + '</li>').join('') + '</ul>' +
      (expressions.length ? '<h2 class="lm-section">Tes expressions en luxembourgeois</h2><ul class="lm-expressions">' +
        expressions.map(e => '<li' + (e.faute ? ' class="lm-a-revoir"' : '') + '><span class="lm-q" lang="lb">' + lmEchapper(e.question.lu) + '</span>' +
          '<b lang="lb">' + lmEchapper(e.reponse.lu) + '</b><span>' + lmEchapper(e.reponse.fr) + (e.faute ? ' · <em>à revoir</em>' : '') + '</span></li>').join('') + '</ul>' : '') +
      '<div class="lm-actions"><button type="button" class="lm-btn lm-btn-or" onclick="lmNouvellePartie()">Nouveau match</button>' +
      '<button type="button" class="lm-btn lm-btn-lien" onclick="lmQuitter()">Retour aux jeux</button></div>' +
      '<p class="lm-demo-note">Démo : les répliques luxembourgeoises sont des brouillons en cours de vérification (LOD). Ta progression des leçons n’est pas modifiée.<br>Scénario ' + lmEchapper(p.plan.id) + ' · graine ' + p.graine + '</p>' +
    '</div>';
  lmPreparerImages([[p.profil, p.fin.issue === 'nouveau_rdv' ? 'Victory' : 'Idle', p.fin.issue === 'nouveau_rdv' ? '#5a2a55' : '#2a2438']]);
}

// ─── Carte du hub Jeux ─────────────────────────────────────────────────────

// Préchargement discret depuis le hub : code 3D, animations et modèles des profils.
let lmPrechargeLance = false;
function lmPrecharger() {
  if (lmPrechargeLance) return;
  lmPrechargeLance = true;
  const lancer = () => import('./lux-match-3d.js?v=7')
    .then(() => window.LuxMatch3D.precharger(['Casual_Female', 'Casual2_Female', 'Casual3_Female', 'Suit_Female', 'Doctor_Female_Young', 'Casual_Male']))
    .catch(() => { lmPrechargeLance = false; });
  if (typeof requestIdleCallback === 'function') requestIdleCallback(lancer, { timeout: 2500 });
  else setTimeout(lancer, 800);
}
function luxMatchCarteHub() {
  lmPrecharger();
  return '<section class="jeux-carte lm-carte-hub" aria-labelledby="jeux-lm-titre">' +
    '<div class="jeux-decor lm-decor" aria-hidden="true"><span class="lm-decor-tel"></span><span class="lm-decor-coeur">♥</span></div>' +
    '<div class="jeux-carte-titre"><h2 id="jeux-lm-titre">Lux Match</h2><span class="jeux-etat lm-etat-demo">DÉMO</span></div>' +
    '<p>Swipe, enquête et rendez-vous en luxembourgeois. Assume tes mensonges !</p>' +
    '<div class="jeux-meta"><span><strong>≈ 4 min</strong> · A1.1</span><span>Record <b>' + lmLire('luxMatchRecord', 0) + '</b></span></div>' +
    '<button class="jeux-jouer lm-jouer-hub" type="button" onclick="ouvrirLuxMatch()">Jouer <span aria-hidden="true">→</span></button>' +
    '</section>';
}
