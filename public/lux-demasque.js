/* SPEC 110 — Lux Démasque : interface (HTML/CSS par-dessus la scène).
   Règles du jeu : public/lux-demasque-core.js (moteur pur). Contenus :
   data/jeux/lux-demasque/contenus-v01.json (servi par /api/jeux/lux-demasque).
   Écrans : rencontre → déposition (déclarations, précisions, réseaux, carnet, objection)
   → bilan. Les fenêtres (réseaux, pièce, carnet, objection, verdict, menu) se ferment
   avec le bouton Retour d'Android avant de quitter le jeu. */
'use strict';

const ld = {
  donnees: null,
  partie: null,
  aideFr: true,
  verdict: null,          // dernier résultat d'objection affiché
  focusAvant: null,       // élément à refocaliser à la fermeture d'une fenêtre
  app: 'pix',             // onglet ouvert dans les réseaux
  promesse3d: null,       // moteur 3D partagé avec Lux Match (un seul WebGLRenderer)
  rendu3d: null,
  images: {},             // portraits et photos de preuves déjà rendus (dataURL)
  preparation: null,      // promesse de rendu des images du dossier
  emotionTimer: null,
  fxTimer: null,
  fxFin: null   // fin de l’effet OBJECTION ! en cours (appui ou Retour pour le passer)
};
const LD_APPS = { pix: 'Pix', pro: 'Pro', amis: 'Amis' };
const LD_THEMES_FR = { travail: 'Travail', logement: 'Logement', sport: 'Sport', voyage: 'Voyage', cuisine: 'Cuisine', animal: 'Animal', famille: 'Famille', loisir: 'Loisir' };

// ─── Utilitaires ────────────────────────────────────────────────────────────
function ldCle(nom) { return typeof storageKey === 'function' ? storageKey(nom) : nom; }
function ldLire(nom, defaut) {
  try { const v = localStorage.getItem(ldCle(nom)); return v == null ? defaut : JSON.parse(v); } catch (_) { return defaut; }
}
function ldEcrire(nom, valeur) {
  try { localStorage.setItem(ldCle(nom), JSON.stringify(valeur)); } catch (_) { /* facultatif */ }
}
function ldEchapper(t) {
  return String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function ldBox() { return document.getElementById('ld-jeu'); }
function ldVueActive() {
  const vue = document.getElementById('view-luxdemasque');
  return !!vue && vue.classList.contains('active');
}
function luxDemasqueDisponible() { return typeof jeuDisponible !== 'function' || jeuDisponible('luxDemasque'); }
// Réplique LU, avec sa traduction seulement si l'aide FR est activée.
function ldReplique(r, classe) {
  if (!r) return '';
  return '<p class="ld-lu' + (classe ? ' ' + classe : '') + '" lang="lb">' + ldEchapper(r.lu) + '</p>' +
    (ld.aideFr ? '<p class="ld-fr">' + ldEchapper(r.fr) + (r.noteFr ? ' <em>(' + ldEchapper(r.noteFr) + ')</em>' : '') + '</p>' : '');
}
function ldIcone(nom) {
  const d = {
    retour: '<path d="M15 5l-7 7 7 7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    reseaux: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
    carnet: '<path d="M6 4h11a1 1 0 0 1 1 1v15H7a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1z"/><path d="M8 8h7M8 12h7"/>',
    precedent: '<path d="M15 5l-7 7 7 7"/>', suivant: '<path d="M9 5l7 7-7 7"/>',
    loupe: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    disquette: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>'
  }[nom] || '';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
}

// ─── 3D, images des preuves, émotions (lot D2) ─────────────────────────────
// Moteur de Lux Match (public/lux-match-3d.js), chargé à la demande, instance partagée.
function ldObtenir3D() {
  if (!ld.promesse3d) {
    ld.promesse3d = import('./lux-match-3d.js?v=12').then(() => window.LuxMatch3D.partage());
    ld.promesse3d.then(m => { ld.rendu3d = m; }).catch(() => { ld.promesse3d = null; });
  }
  return ld.promesse3d;
}
function ldPersonne(qui) {
  const c = ld.donnees;
  return (c.personnages && c.personnages[qui]) || (c.figurants && c.figurants[qui]) || null;
}
// Toutes les images du dossier, une par une (le moteur n'a qu'un canvas).
function ldPreparerImages() {
  const p = ld.partie;
  if (!p) return Promise.resolve();
  const dossier = p.dossier, npc = p.npc, pieces = LuxDemasqueCore.pieces(p);
  ld.preparation = ldObtenir3D().then(async m => {
    const taches = [['portrait:' + npc.id, () => m.portrait(npc, 'Idle', '#3a2a55', 240, 300)],
      ['portrait-defaite:' + npc.id, () => m.portrait(npc, 'Defeat', '#2a2438', 240, 300)]];
    dossier.pieces.forEach(id => {
      const v = pieces[id].visuel;
      if (!v.scene) return;
      const personnes = (v.personnes || []).map(x => Object.assign({}, x, { profil: ldPersonne(x.qui) })).filter(x => x.profil);
      taches.push([ldClePiece(id), () => m.photo(v.scene, personnes, 320, 240)]);
    });
    for (const [cle, faire] of taches) {
      if (ld.images[cle]) continue;
      try { ld.images[cle] = await faire(); ldPoserImage(cle); } catch (_) { /* repli : vignette CSS */ }
    }
  }).catch(() => {});
  return ld.preparation;
}
// Une même affaire peut servir à plusieurs prétendants : l'image dépend aussi de lui.
function ldClePiece(id) { return 'piece:' + (ld.partie ? ld.partie.npc.id : '') + ':' + id; }
// Remplace les emplacements en attente par l'image prête.
function ldPoserImage(cle) {
  document.querySelectorAll('#ld-jeu [data-ld-image="' + cle + '"]').forEach(el => {
    el.style.backgroundImage = 'url(' + ld.images[cle] + ')';
    el.classList.add('ld-image-prete');
  });
}
function ldImage(cle, classe, alt) {
  const url = ld.images[cle];
  return '<span class="' + classe + (url ? ' ld-image-prete' : '') + '" data-ld-image="' + ldEchapper(cle) + '"' +
    (url ? ' style="background-image:url(' + url + ')"' : '') + (alt ? ' role="img" aria-label="' + ldEchapper(alt) + '"' : ' aria-hidden="true"') + '></span>';
}
// Le prétendant en 3D derrière la déposition (repli : portrait 2D).
function ldAttacherScene() {
  const scene = document.getElementById('ld-scene');
  if (!scene || !ld.partie) return;
  const partie = ld.partie;
  ldObtenir3D().then(m => {
    if (ld.partie !== partie || !document.contains(scene)) return null;
    return m.interrogatoire(scene, partie.npc);
  }).then(ok => {
    if (ok) { scene.classList.add('ld-scene-3d'); ldReagir('parle'); }
  }).catch(() => { scene.classList.add('ld-scene-2d'); });
}
function ldReagir(type) { if (ld.rendu3d && ld.partie && ld.partie.phase === 'deposition') ld.rendu3d.reagir(type); }
// Signe manga à côté de la tête (mêmes dessins que Lux Match : LM_SIGNES), jamais sur le visage.
function ldEmotion(type, intensite) {
  ldEffacerEmotion();
  const calque = document.getElementById('ld-emotion');
  if (!calque || typeof LM_SIGNES === 'undefined' || !LM_SIGNES[type]) return;
  const point = (ld.rendu3d && ld.rendu3d.pointTete && ld.rendu3d.pointTete()) || { x: 0.66, y: 0.2 };
  calque.style.left = (Math.max(0.12, Math.min(0.88, point.x)) * 100) + '%';
  calque.style.top = (Math.max(0.1, Math.min(0.42, point.y)) * 100) + '%';
  calque.className = 'ld-emotion ld-emotion-' + type + ' ld-emotion-' + (intensite || 'subtle');
  calque.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true">' + LM_SIGNES[type] + '</svg>';
  ld.emotionTimer = setTimeout(ldEffacerEmotion, intensite === 'big' ? 1800 : 1300);
}
function ldEffacerEmotion() {
  clearTimeout(ld.emotionTimer); ld.emotionTimer = null;
  const calque = document.getElementById('ld-emotion');
  if (calque) { calque.className = 'ld-emotion'; calque.innerHTML = ''; }
}
// « OBJECTION ! » plein écran : lignes de vitesse, cri, flash et secousse (réduit si
// prefers-reduced-motion). Ne bloque rien : le verdict s'affiche à la fin.
function ldEffetObjection(reussi, ensuite, pieceId) {
  const depo = document.querySelector('#ld-jeu .ld-depo');
  if (!depo) { ensuite(); return; }
  clearTimeout(ld.fxTimer);
  const ancien = depo.querySelector('.ld-fx'); if (ancien) ancien.remove();
  const fx = document.createElement('div');
  fx.className = 'ld-fx ' + (reussi ? 'ld-fx-ok' : 'ld-fx-non');
  fx.setAttribute('aria-hidden', 'true');
  // La pièce présentée est brandie sous le cri.
  const piece = pieceId && ld.partie ? LuxDemasqueCore.pieces(ld.partie)[pieceId] : null;
  const brandie = piece ? '<div class="ld-fx-piece">' + ldVisuel(piece, true) + '<span><small>' + LD_APPS[piece.source] + '</small><b>' + ldEchapper(piece.titre) + '</b></span></div>' : '';
  fx.innerHTML = '<i class="ld-fx-lignes"></i><div class="ld-fx-centre"><b class="ld-fx-cri">OBJECTION !</b>' + brandie + '</div>' + (reussi ? '<i class="ld-fx-flash"></i>' : '');
  depo.appendChild(fx);
  depo.classList.remove('ld-secousse'); void depo.offsetWidth;
  if (reussi) depo.classList.add('ld-secousse');
  // L'effet bloque les autres boutons ; un appui (ou Retour) le passe et montre le verdict.
  const finir = () => {
    if (ld.fxFin !== finir) return;
    ld.fxFin = null; clearTimeout(ld.fxTimer);
    fx.remove(); depo.classList.remove('ld-secousse'); ensuite();
  };
  ld.fxFin = finir;
  fx.addEventListener('click', finir);
  ld.fxTimer = setTimeout(finir, reussi ? 1300 : 700);
}

// ─── Carte du hub Jeux ─────────────────────────────────────────────────────
function luxDemasqueCarteHub() {
  if (!luxDemasqueDisponible()) return '';
  return '<section class="jeux-carte ld-carte-hub" aria-labelledby="jeux-ld-titre">' +
    '<div class="jeux-decor ld-decor" aria-hidden="true"><span class="ld-decor-dossier"></span><span class="ld-decor-cri">!</span></div>' +
    '<div class="jeux-carte-titre"><h2 id="jeux-ld-titre">Lux Démasque</h2><span class="jeux-etat ld-etat-demo">NOUVEAU</span></div>' +
    '<p>Il te raconte sa vie en luxembourgeois. Fouille ses réseaux et démasque ses disquettes !</p>' +
    '<div class="jeux-meta"><span><strong>≈ 5 min</strong> · A1.1–A1.2</span><span>Record <b>' + ldLire('luxDemasqueRecord', 0) + '</b></span></div>' +
    '<button class="jeux-jouer ld-jouer-hub" type="button" onclick="ouvrirLuxDemasque()">Jouer <span aria-hidden="true">→</span></button>' +
    '</section>';
}

// ─── Ouverture / fermeture ─────────────────────────────────────────────────
async function ldChargerDonnees() {
  if (ld.donnees) return ld.donnees;
  const r = await fetch('/api/jeux/lux-demasque');
  if (!r.ok) throw new Error('donnees');
  const json = await r.json();
  if (!json.contenus) throw new Error('donnees');
  ld.donnees = json.contenus;
  return ld.donnees;
}
async function ouvrirLuxDemasque(dossierId) {
  if (!luxDemasqueDisponible()) { if (typeof ouvrirJeux === 'function') ouvrirJeux(); return; }
  luxDemasqueArreter();
  // Geste de l'utilisateur : le son peut démarrer (autoplay mobile) ; Lux Match se tait.
  if (typeof LuxMatchSon !== 'undefined') LuxMatchSon.musique(null);
  if (typeof LuxDemasqueSon !== 'undefined') { LuxDemasqueSon.preparer(); LuxDemasqueSon.precharger(); }
  showView('view-luxdemasque');
  const box = ldBox();
  if (box) box.innerHTML = '<p class="ld-chargement">Ouverture du dossier…</p>';
  try { await ldChargerDonnees(); } catch (_) {
    if (box) box.innerHTML = ldEntete() + '<p class="ld-chargement">Impossible de charger Lux Démasque. Vérifie ta connexion.</p>';
    return;
  }
  if (!ldVueActive()) return; // l'utilisateur est reparti pendant le chargement
  ld.aideFr = ldLire('luxDemasqueAideFr', true);
  ld.partie = LuxDemasqueCore.nouvellePartie(ld.donnees, ldChoisirDossier(dossierId));
  ldRendre();
  ldPreparerImages(); // portrait 3D et photos des preuves, pendant que le joueur lit la fiche
}
function luxDemasqueArreter() {
  const partie = ld.partie;
  ld.partie = null; // d'abord : fermer les fenêtres ne relance aucune musique
  if (typeof LuxDemasqueSon !== 'undefined') LuxDemasqueSon.musique(null);
  ldFermerToutesFenetres();
  ldEffacerEmotion();
  clearTimeout(ld.fxTimer);
  ld.fxFin = null;
  if (ld.rendu3d && partie && document.querySelector('#ld-jeu .ld-scene-3d')) ld.rendu3d.detacher();
  ld.verdict = null;
}
// Jeu quitté par la navigation de l'appli (retour, barre du bas) : la partie s'arrête,
// rien ne reste ouvert (fenêtres, plus tard 3D et musique).
(function () {
  const vue = document.getElementById('view-luxdemasque');
  if (!vue || typeof MutationObserver === 'undefined') return;
  new MutationObserver(() => { if (!vue.classList.contains('active') && ld.partie) luxDemasqueArreter(); })
    .observe(vue, { attributes: true, attributeFilter: ['class'] });
})();
function ldQuitter() { luxDemasqueArreter(); if (typeof ouvrirJeux === 'function') ouvrirJeux(); }
// Rotation des dossiers : d'abord les dossiers rédigés pas encore résolus (Milo, Noah, Tom),
// puis des dossiers générés (graine aléatoire, rejouable telle quelle depuis le diagnostic).
function ldDossiersRediges() { return ld.donnees.dossiers.map(d => d.id).concat((ld.donnees.dossiersRediges || []).map(d => d.id)); }
function ldChoisirDossier(dossierId) {
  if (typeof dossierId === 'number') return { dossier: LuxDemasqueCore.composerDossier(ld.donnees, { graine: dossierId }) };
  if (dossierId) return { dossierId };
  const resolus = ldLire('luxDemasqueResolus', []);
  const suivant = ldDossiersRediges().find(id => resolus.indexOf(id) < 0);
  if (suivant) return { dossierId: suivant };
  const dossier = LuxDemasqueCore.composerDossier(ld.donnees, { graine: 1 + Math.floor(Math.random() * 999999) });
  return dossier ? { dossier } : { dossierId: ld.donnees.dossiers[0].id };
}
// « Nouveau dossier » avance dans la rotation, même si le dossier courant est incomplet.
// Les dossiers partiellement résolus restent accessibles via « Rejouer » et à la
// prochaine entrée par le hub : on ne modifie jamais luxDemasqueResolus ici.
function ldNouveauDossier() {
  const actuel = ld.partie && ld.partie.dossier;
  if (!actuel) { ouvrirLuxDemasque(); return; }
  const ids = ldDossiersRediges();
  const position = ids.indexOf(actuel.id);
  if (position >= 0) {
    const resolus = ldLire('luxDemasqueResolus', []);
    const suivant = ids.slice(position + 1).find(id => !resolus.includes(id));
    if (suivant) { ouvrirLuxDemasque(suivant); return; }
  }
  // Après le dernier dossier rédigé (ou depuis un dossier généré), créer
  // une nouvelle graine, différente de l'actuelle même en cas de collision.
  const maxGraine = 999999;
  let graine = 1 + Math.floor(Math.random() * maxGraine);
  if (actuel.genere && graine === actuel.graine) graine = (graine % maxGraine) + 1;
  ouvrirLuxDemasque(graine);
}
function ldRejouer() { const d = ld.partie && ld.partie.dossier; ouvrirLuxDemasque(d && d.genere ? d.graine : d && d.id); }

// ─── Rendu par écran ───────────────────────────────────────────────────────
function ldEntete(options) {
  const o = options || {};
  return '<div class="ld-top"><button type="button" class="ld-icone-btn" onclick="ldQuitter()" aria-label="Retour aux jeux">' + ldIcone('retour') + '</button>' +
    '<span class="ld-logo">LUX <i>DÉMASQUE</i></span>' +
    '<div class="ld-top-outils">' +
      (o.fr === false ? '' : '<button type="button" class="ld-icone-btn ld-fr-btn' + (ld.aideFr ? ' ld-actif' : '') + '" onclick="ldBasculerAide()" aria-pressed="' + ld.aideFr + '" aria-label="' + (ld.aideFr ? 'Aide FR activée' : 'Aide FR désactivée') + '">FR</button>') +
      (o.menu === false ? '' : '<button type="button" class="ld-icone-btn" onclick="ldMenu()" aria-label="Menu" aria-haspopup="dialog">' + ldIcone('menu') + '</button>') +
    '</div></div>';
}
// Musique selon l'écran : enquête (fiche, réseaux, carnet), déposition, silence au bilan.
function ldSynchroMusique() {
  if (typeof LuxDemasqueSon === 'undefined') return;
  const p = ld.partie;
  if (!p || !ldVueActive() || p.phase === 'bilan') { LuxDemasqueSon.musique(null); return; }
  const fouille = !!document.querySelector('#ld-reseaux, #ld-carnet, #ld-piece');
  LuxDemasqueSon.musique(p.phase === 'rencontre' || fouille ? 'enquete' : 'deposition');
}
function ldSon(nom, options) {
  if (typeof LuxDemasqueSon === 'undefined') return;
  if (nom === 'nav' || nom === 'page' || nom === 'ouvrir') LuxDemasqueSon.clic(nom); else LuxDemasqueSon.accent(nom, options);
}
function ldRendre() {
  const p = ld.partie, box = ldBox();
  if (!p || !box) return;
  if (box.dataset.ecran !== p.phase) window.scrollTo(0, 0);
  box.dataset.ecran = p.phase;
  if (p.phase === 'rencontre') ldRendreRencontre(box);
  else if (p.phase === 'deposition') ldRendreDeposition(box);
  else ldRendreBilan(box);
  ldSynchroMusique();
}
function ldPortrait(classe, pose) {
  const n = ld.partie.npc;
  return '<div class="ld-portrait ' + (classe || '') + '" aria-hidden="true"><span>' + ldEchapper(n.nom[0]) + '</span>' +
    ldImage((pose === 'Defeat' ? 'portrait-defaite:' : 'portrait:') + n.id, 'ld-portrait-image') + '</div>';
}
function ldRendreRencontre(box) {
  const p = ld.partie, n = p.npc, d = p.dossier;
  box.innerHTML = ldEntete({ menu: false }) +
    '<div class="ld-rencontre">' +
      '<div class="ld-rencontre-entete">' +
        '<p class="ld-tampon">DOSSIER N°' + ldEchapper(d.numero) + (d.genere ? ' · INÉDIT' : '') + '</p>' +
        '<span class="ld-rencontre-statut">RENDEZ-VOUS</span>' +
      '</div>' +
      '<section class="ld-fiche" aria-label="Profil de ' + ldEchapper(n.nom) + '">' +
        ldPortrait('ld-portrait-fiche') +
        '<div class="ld-fiche-texte">' +
          '<p class="ld-fiche-kicker">À INTERROGER</p>' +
          '<h1>' + ldEchapper(n.nom) + ', ' + n.age + ' ans</h1>' +
          '<p class="ld-fiche-ville">' + ldEchapper(n.villeFr) + '</p>' +
          '<p class="ld-fiche-accroche">« ' + ldEchapper(n.accrocheFr) + ' »</p>' +
        '</div>' +
      '</section>' +
      (n.salut ? '<div class="ld-salut"><span class="ld-locuteur">' + ldEchapper(n.nom) + '</span>' + ldReplique(n.salut) + '</div>' : '') +
      '<p class="ld-rdv"><span>RENCONTRE</span> ' + ldEchapper(d.lieuFr) + ' <b>' + ldEchapper(d.dateFr) + '</b></p>' +
      '<section class="ld-briefing" aria-label="Règles de l’enquête">' +
        '<h2>TA MISSION</h2>' +
        '<p>Il ment pour t’impressionner… mais pas sur tout.</p>' +
        '<p>Écoute, fais-le préciser, fouille ses réseaux. Pour une <b>OBJECTION !</b>, choisis une preuve.</p>' +
      '</section>' +
      '<div class="ld-actions"><button type="button" class="ld-btn ld-btn-or" onclick="ldCommencer()">Commencer le rendez-vous</button>' +
      '<button type="button" class="ld-btn ld-btn-lien" onclick="ldReseaux(\'pix\')">' + ldIcone('reseaux') + ' Voir ses réseaux d’abord</button></div>' +
    '</div>';
}
function ldCommencer() {
  LuxDemasqueCore.commencer(ld.partie);
  ldRendre();
}

// Déposition : une déclaration à la fois, navigation libre, deux actions en bas.
function ldRendreDeposition(box) {
  const p = ld.partie;
  box.innerHTML =
    '<div class="ld-depo">' +
      ldEntete() +
      '<div class="ld-hud">' +
        '<span class="ld-compteur" id="ld-compteur" aria-live="polite"></span>' +
        '<button type="button" class="ld-outil" onclick="ldReseaux()">' + ldIcone('reseaux') + '<span>Réseaux</span></button>' +
        '<button type="button" class="ld-outil" onclick="ldCarnet()">' + ldIcone('carnet') + '<span>Carnet</span><b id="ld-carnet-nb"></b></button>' +
      '</div>' +
      '<div class="ld-scene" id="ld-scene">' + ldPortrait('ld-portrait-scene') + '</div>' +
      '<div class="ld-emotion" id="ld-emotion" aria-hidden="true"></div>' +
      '<div class="ld-bas">' +
        '<div class="ld-declaration" id="ld-declaration"></div>' +
        '<div class="ld-dock">' +
          '<button type="button" class="ld-btn ld-btn-preciser" id="ld-preciser" onclick="ldPreciser()">' + ldIcone('loupe') + ' Faire préciser</button>' +
          '<button type="button" class="ld-btn ld-btn-objection" id="ld-objecter" onclick="ldObjection()">OBJECTION !</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  ldMajDeposition();
  ldAttacherScene();
}
function ldMajDeposition() {
  const p = ld.partie, zone = document.getElementById('ld-declaration');
  if (!p || !zone) return;
  const d = LuxDemasqueCore.courante(p), n = p.dossier.declarations.length;
  const demasquee = LuxDemasqueCore.estDemasquee(p, d.id);
  const precisee = p.precisions.indexOf(d.id) >= 0;
  zone.className = 'ld-declaration' + (demasquee ? ' ld-demasquee' : '');
  zone.innerHTML =
    '<div class="ld-decl-tete">' +
      '<button type="button" class="ld-nav" onclick="ldNaviguer(-1)" aria-label="Déclaration précédente"' + (p.index === 0 ? ' disabled' : '') + '>' + ldIcone('precedent') + '</button>' +
      '<span class="ld-decl-num">' + ldEchapper(p.npc.nom) + ' · ' + (p.index + 1) + ' / ' + n + '</span>' +
      '<button type="button" class="ld-nav" onclick="ldNaviguer(1)" aria-label="Déclaration suivante"' + (p.index === n - 1 ? ' disabled' : '') + '>' + ldIcone('suivant') + '</button>' +
    '</div>' +
    '<div class="ld-points" aria-hidden="true">' + p.dossier.declarations.map((x, i) =>
      '<i class="' + (i === p.index ? 'ld-ici ' : '') + (LuxDemasqueCore.estDemasquee(p, x.id) ? 'ld-point-demasque' : p.entendues.indexOf(x.id) >= 0 ? 'ld-point-entendu' : '') + '"></i>').join('') + '</div>' +
    ldReplique(d.base, 'ld-lu-base') +
    (precisee ? '<div class="ld-precision"><p class="ld-question" lang="lb"><span>Toi :</span> ' + ldEchapper(d.press.question.lu) + '</p>' +
      (ld.aideFr ? '<p class="ld-fr">' + ldEchapper(d.press.question.fr) + '</p>' : '') + ldReplique(d.press.reponse) + '</div>' : '') +
    (demasquee ? '<span class="ld-tampon-demasque">DÉMASQUÉE</span>' : '');
  const preciser = document.getElementById('ld-preciser'), objecter = document.getElementById('ld-objecter');
  if (preciser) { preciser.disabled = precisee; preciser.innerHTML = ldIcone('loupe') + (precisee ? ' Déjà précisé' : ' Faire préciser'); }
  if (objecter) objecter.disabled = demasquee;
  const compteur = document.getElementById('ld-compteur');
  if (compteur) {
    compteur.innerHTML = ldIcone('disquette') + '<b>' + p.demasquees.length + '/' + LuxDemasqueCore.totalMensonges(p) + '</b><span>disquettes</span>';
    compteur.setAttribute('aria-label', p.demasquees.length + ' disquettes démasquées sur ' + LuxDemasqueCore.totalMensonges(p));
  }
  const nb = document.getElementById('ld-carnet-nb');
  if (nb) nb.textContent = LuxDemasqueCore.carnet(p).filter(c => c.genre === 'piece').length || '';
}
function ldNaviguer(sens) {
  const p = ld.partie;
  if (!p || p.phase !== 'deposition') return;
  const avant = p.index;
  LuxDemasqueCore.allerA(p, p.index + sens);
  ldMajDeposition();
  if (p.index !== avant) { ldReagir('parle'); ldSon('nav'); }
}
function ldPreciser() {
  const p = ld.partie;
  if (!p || p.phase !== 'deposition') return;
  const r = LuxDemasqueCore.preciser(p);
  if (r && r.nouvelle) { ldToast('Précision ajoutée au carnet'); ldReagir('parle'); ldSon('indice'); }
  ldMajDeposition();
}

// ─── Fenêtres (calques) ────────────────────────────────────────────────────
function ldCalque(id, classe, titre, html) {
  let calque = document.getElementById(id);
  const nouveau = !calque;
  if (!calque) {
    calque = document.createElement('div');
    calque.id = id;
    calque.className = 'ld-calque ' + (classe || '');
    calque.setAttribute('role', 'dialog');
    calque.setAttribute('aria-modal', 'true');
    calque.setAttribute('aria-label', titre);
    calque.addEventListener('click', e => { if (e.target === calque) ldFermerCalque(id); });
    const box = ldBox(); if (!box) return null;
    if (!document.querySelector('#ld-jeu .ld-calque')) ld.focusAvant = document.activeElement;
    box.appendChild(calque);
  }
  calque.innerHTML = '<div class="ld-fenetre">' + html + '</div>';
  if (nouveau) ldSynchroMusique();
  // Focus dans la fenêtre à son ouverture (pas à chaque mise à jour de son contenu).
  const premier = calque.querySelector('button, [tabindex]');
  if (nouveau && premier) premier.focus({ preventScroll: true });
  return calque;
}
function ldFermerCalque(id) {
  const calque = document.getElementById(id);
  if (!calque) return false;
  calque.remove();
  ldSynchroMusique();
  if (!document.querySelector('#ld-jeu .ld-calque') && ld.focusAvant && document.contains(ld.focusAvant)) ld.focusAvant.focus();
  if (typeof programmerGarde === 'function') programmerGarde();
  return true;
}
function ldFermerToutesFenetres() { document.querySelectorAll('#ld-jeu .ld-calque').forEach(c => c.remove()); ldSynchroMusique(); }
function ldFermerBouton(id) { return '<button type="button" class="ld-fermer" onclick="ldFermerCalque(\'' + id + '\')" aria-label="Fermer">✕</button>'; }
// Android Retour / Échap : la fenêtre du dessus se ferme d'abord.
function luxDemasqueSuperposition() { return ldVueActive() && (!!ld.fxFin || !!document.querySelector('#ld-jeu .ld-calque')); }
function luxDemasqueFermerSuperposition() {
  if (!ldVueActive()) return false;
  if (ld.fxFin) { ld.fxFin(); return true; }   // OBJECTION ! en cours : on passe directement au verdict
  const calques = document.querySelectorAll('#ld-jeu .ld-calque');
  if (!calques.length) return false;
  const dessus = calques[calques.length - 1];
  if (dessus.id === 'ld-verdict') { ldFermerVerdict(); return true; }
  return ldFermerCalque(dessus.id);
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') luxDemasqueFermerSuperposition(); });
function ldToast(texte) {
  const box = ldBox(); if (!box) return;
  const t = document.createElement('div');
  t.className = 'ld-toast'; t.setAttribute('role', 'status'); t.textContent = texte;
  box.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// Réseaux (FR) : Pix, Pro, Amis. Ouvrir une pièce l'ajoute au carnet.
function ldReseaux(app) {
  const p = ld.partie; if (!p) return;
  if (app) ld.app = app;
  const r = LuxDemasqueCore.reseaux(p)[ld.app] || { pseudo: p.npc.nom, bioFr: '', pieces: [] }, pieces = LuxDemasqueCore.pieces(p);
  const html = ldFermerBouton('ld-reseaux') +
    '<h2 class="ld-fen-titre">Réseaux de ' + ldEchapper(p.npc.nom) + '</h2>' +
    '<div class="ld-onglets" role="tablist">' + Object.keys(LD_APPS).map(a =>
      '<button type="button" role="tab" aria-selected="' + (a === ld.app) + '" class="ld-onglet' + (a === ld.app ? ' ld-actif' : '') + '" onclick="ldReseaux(\'' + a + '\')">' + LD_APPS[a] + '</button>').join('') + '</div>' +
    '<div class="ld-app ld-app-' + ld.app + '">' +
      '<div class="ld-app-tete"><b>' + ldEchapper(r.pseudo) + '</b><span>' + ldEchapper(r.bioFr) + '</span></div>' +
      '<div class="ld-flux">' + r.pieces.map(id => ldVignette(pieces[id], p.consultees.indexOf(id) >= 0)).join('') + '</div>' +
    '</div>';
  ldCalque('ld-reseaux', 'ld-calque-reseaux', 'Réseaux de ' + p.npc.nom, html);
}
function ldVignette(piece, vue) {
  return '<button type="button" class="ld-vignette' + (vue ? ' ld-vue' : '') + '" onclick="ldOuvrirPiece(\'' + piece.id + '\')">' +
    ldVisuel(piece, true) +
    '<span class="ld-vignette-texte"><b>' + ldEchapper(piece.titre) + '</b>' + (piece.dateFr ? '<small>' + ldEchapper(piece.dateFr) + '</small>' : '') + '</span>' +
    (vue ? '<span class="ld-vue-badge">au carnet</span>' : '') + '</button>';
}
// Visuel d'une pièce (le texte décisif est toujours aussi dans la transcription).
function ldVisuel(piece, mini) {
  const v = piece.visuel, classe = 'ld-visuel ld-visuel-' + v.type + (mini ? ' ld-mini' : '');
  if (v.type === 'photo' || v.type === 'post') {
    const fond = v.type === 'photo' ? ' ld-photo-' + v.scene : ' ld-post-' + v.image;
    return '<span class="' + classe + fond + '"' + (mini ? ' aria-hidden="true"' : ' role="img" aria-label="' + ldEchapper(piece.transcription) + '"') + '>' +
      ldImage(ldClePiece(piece.id), 'ld-photo-image') + '</span>';
  }
  const lignes = (v.lignes || []).map(l => '<span><b>' + ldEchapper(l[0]) + '</b>' + (l[1] ? '<em>' + ldEchapper(l[1]) + '</em>' : '') + '</span>').join('');
  return '<span class="' + classe + '"' + (mini ? ' aria-hidden="true"' : '') + '>' + (mini ? '<span><b>' + ldEchapper(piece.auteur) + '</b></span>' : lignes) + '</span>';
}
function ldOuvrirPiece(id) {
  const p = ld.partie; if (!p) return;
  const piece = LuxDemasqueCore.pieces(p)[id];
  const nouvelle = LuxDemasqueCore.consulter(p, id);
  ldSon(nouvelle ? 'indice' : 'page');
  ldCalque('ld-piece', 'ld-calque-piece', piece.titre,
    ldFermerBouton('ld-piece') +
    '<p class="ld-piece-source">' + LD_APPS[piece.source] + ' · ' + ldEchapper(piece.auteur) + (piece.dateFr ? ' · ' + ldEchapper(piece.dateFr) : '') + '</p>' +
    '<h2 class="ld-fen-titre">' + ldEchapper(piece.titre) + '</h2>' +
    ldVisuel(piece, false) +
    '<p class="ld-transcription">' + ldEchapper(piece.transcription) + '</p>' +
    '<p class="ld-piece-note">' + (nouvelle ? 'Ajoutée à ton carnet.' : 'Déjà dans ton carnet.') + '</p>' +
    '<button type="button" class="ld-btn ld-btn-or" onclick="ldFermerCalque(\'ld-piece\')">Retour</button>');
  if (document.getElementById('ld-reseaux')) ldReseaux();
  ldMajDeposition();
}

// Carnet : déclarations entendues, précisions obtenues, pièces consultées.
function ldElementCarnet(c, action) {
  const ouvrir = action ? ' onclick="' + action + '"' : '';
  const balise = action ? 'button type="button"' : 'div';
  const fin = action ? 'button' : 'div';
  if (c.genre === 'piece') {
    return '<' + balise + ' class="ld-carnet-el ld-carnet-piece"' + ouvrir + '>' + ldVisuel(c.piece, true) +
      '<span><small>' + LD_APPS[c.piece.source] + (c.piece.dateFr ? ' · ' + ldEchapper(c.piece.dateFr) : '') + '</small><b>' + ldEchapper(c.piece.titre) + '</b>' +
      '<em>' + ldEchapper(c.piece.transcription) + '</em></span></' + fin + '>';
  }
  return '<' + balise + ' class="ld-carnet-el ld-carnet-parole"' + ouvrir + '><span><small>' + (c.genre === 'precision' ? 'Précision de ' : 'Déclaration de ') + ldEchapper(ld.partie.npc.nom) + '</small>' +
    '<b lang="lb">' + ldEchapper(c.texte.lu) + '</b>' + (ld.aideFr ? '<em>' + ldEchapper(c.texte.fr) + '</em>' : '') + '</span></' + fin + '>';
}
function ldCarnet() {
  const p = ld.partie; if (!p) return;
  const liste = LuxDemasqueCore.carnet(p);
  const pieces = liste.filter(c => c.genre === 'piece'), paroles = liste.filter(c => c.genre !== 'piece');
  ldCalque('ld-carnet', 'ld-calque-carnet', 'Carnet', ldFermerBouton('ld-carnet') +
    '<h2 class="ld-fen-titre">Carnet d’enquête</h2>' +
    '<h3 class="ld-sous-titre">Pièces (' + pieces.length + ')</h3>' +
    (pieces.length ? '<div class="ld-carnet-liste">' + pieces.map(c => ldElementCarnet(c, 'ldOuvrirPiece(\'' + c.id + '\')')).join('') + '</div>'
      : '<p class="ld-vide">Aucune pièce : ouvre ses réseaux.</p>') +
    '<h3 class="ld-sous-titre">Ce qu’il t’a dit (' + paroles.length + ')</h3>' +
    '<div class="ld-carnet-liste">' + paroles.map(c => ldElementCarnet(c, null)).join('') + '</div>');
}

// Objection : la déclaration affichée + une pièce du carnet.
function ldObjection() {
  const p = ld.partie; if (!p || p.phase !== 'deposition') return;
  const d = LuxDemasqueCore.courante(p);
  if (LuxDemasqueCore.estDemasquee(p, d.id)) return;
  const liste = LuxDemasqueCore.carnet(p).filter(c => c.id !== 'DEP:' + d.id && c.id !== 'PRE:' + d.id);
  const pieces = liste.filter(c => c.genre === 'piece'), paroles = liste.filter(c => c.genre !== 'piece');
  const choix = c => ldElementCarnet(c, 'ldPresenter(\'' + c.id + '\')');
  ldCalque('ld-objection', 'ld-calque-objection', 'Objection', ldFermerBouton('ld-objection') +
    '<p class="ld-objection-kicker">OBJECTION ! contre</p>' +
    '<blockquote class="ld-cible">' + ldReplique(d.base) + '</blockquote>' +
    '<h2 class="ld-fen-titre">Quelle pièce le contredit ?</h2>' +
    (pieces.length ? '<div class="ld-carnet-liste">' + pieces.map(choix).join('') + '</div>' : '<p class="ld-vide">Ton carnet est vide : ouvre ses réseaux pour trouver des pièces.</p>') +
    (paroles.length ? '<h3 class="ld-sous-titre">Ou une autre de ses phrases</h3><div class="ld-carnet-liste">' + paroles.map(choix).join('') + '</div>' : '') +
    (pieces.length ? '' : '<button type="button" class="ld-btn ld-btn-or" onclick="ldFermerCalque(\'ld-objection\'); ldReseaux()">Ouvrir ses réseaux</button>'));
}
function ldPresenter(pieceId) {
  const p = ld.partie; if (!p) return;
  const d = LuxDemasqueCore.courante(p);
  const r = LuxDemasqueCore.objecter(p, d.id, pieceId);
  if (r.resultat === 'invalide' || r.resultat === 'deja') return;
  ldFermerCalque('ld-objection');
  ld.verdict = r;
  ldMajDeposition();
  const reussi = r.resultat === 'demasque';
  ldSon(reussi ? 'objection' : 'rate', { baisse: reussi });
  ldEffetObjection(reussi, () => {
    if (!ld.partie || ld.partie.phase !== 'deposition' || ld.verdict !== r) return;
    if (reussi) { ldReagir('zoom'); ldEmotion('stunned', 'big'); ldSon('percee', { baisse: true }); }
    else { ldReagir('rire'); ldEmotion('delighted', 'subtle'); }
    ldAfficherVerdict(r);
  }, r.piece && r.piece.indexOf(':') < 0 ? r.piece : null);
}
function ldAfficherVerdict(r) {
  const p = ld.partie, reussi = r.resultat === 'demasque';
  ldCalque('ld-verdict', 'ld-calque-verdict ' + (reussi ? 'ld-verdict-ok' : 'ld-verdict-non'), reussi ? 'Objection retenue' : 'Objection rejetée',
    (reussi ? '<p class="ld-cri" aria-hidden="true">OBJECTION !</p><p class="ld-verdict-titre">Disquette démasquée ! <b>' + r.trouvees + ' / ' + r.total + '</b></p>'
            : '<p class="ld-verdict-titre ld-rate">Objection rejetée <b>−' + LuxDemasqueCore.PENALITE_ERREUR + '</b></p>') +
    '<div class="ld-verdict-parole"><span class="ld-locuteur">' + ldEchapper(p.npc.nom) + '</span>' + ldReplique(r.reponse) + '</div>' +
    (reussi ? ldRevelation(r) : '') +
    (reussi && r.aveuFr ? '<p class="ld-aveu">' + ldEchapper(r.aveuFr) + '</p>' : '') +
    (!reussi && r.raison === 'precision_manquante' ? '<p class="ld-indice">Il joue sur les mots : fais-lui d’abord préciser sa phrase.</p>' : '') +
    '<button type="button" class="ld-btn ld-btn-or" onclick="ldFermerVerdict()">' + (reussi && r.complet ? 'Voir le bilan' : 'Continuer') + '</button>');
}
// Révélation éventuelle, après la preuve (le montage de la photo « Kyoto »).
function ldRevelation(r) {
  const pieces = LuxDemasqueCore.pieces(ld.partie);
  if (!r.revelation || !pieces[r.revelation.piece]) return '';
  return '<div class="ld-revelation"><span class="ld-revelation-photo">' + ldVisuel(pieces[r.revelation.piece], false) + '<b>MONTAGE</b></span>' +
    '<p>' + ldEchapper(r.revelation.fr) + '</p></div>';
}
function ldFermerVerdict() {
  const r = ld.verdict;
  ldFermerCalque('ld-verdict');
  ld.verdict = null;
  if (r && r.resultat === 'demasque') { ldReagir('deception'); setTimeout(() => ldEmotion('awkward', 'medium'), 250); }
  if (r && r.complet) ldConclure(true);
}

// Menu et fin de dossier.
function ldMenu() {
  ldCalque('ld-menu', 'ld-calque-menu', 'Menu', ldFermerBouton('ld-menu') +
    '<h2 class="ld-fen-titre">Pause</h2>' +
    '<div class="ld-actions">' +
      (ld.partie && ld.partie.phase === 'deposition' ? '<button type="button" class="ld-btn ld-btn-or" onclick="ldFermerCalque(\'ld-menu\'); ldDemanderConclusion()">Conclure le dossier</button>' : '') +
      '<button type="button" class="ld-btn ld-btn-sombre" onclick="ldFermerCalque(\'ld-menu\')">Reprendre</button>' +
      ldReglage('Son', 'luxDemasqueSon', true) + ldReglage('Musique', 'luxDemasqueMusique', true) +
      '<button type="button" class="ld-btn ld-btn-lien" onclick="ldQuitter()">Quitter Lux Démasque</button></div>');
}
// Interrupteurs du menu : Son (tout) et Musique (garde les effets). Mémorisés.
function ldReglage(libelle, cle, defaut) {
  const actif = ldLire(cle, defaut);
  return '<button type="button" class="ld-reglage" role="switch" aria-checked="' + actif + '" onclick="ldBasculerReglage(\'' + cle + '\')">' +
    '<span>' + libelle + '</span><b>' + (actif ? 'Activé' : 'Coupé') + '</b></button>';
}
function ldBasculerReglage(cle) {
  ldEcrire(cle, !ldLire(cle, true));
  if (typeof LuxDemasqueSon !== 'undefined') { LuxDemasqueSon.musique(null); ldSynchroMusique(); }
  ldMenu();
}
function ldDemanderConclusion() {
  const p = ld.partie; if (!p || p.phase !== 'deposition') return;
  const reste = LuxDemasqueCore.totalMensonges(p) - p.demasquees.length;
  if (!reste) { ldConclure(true); return; }
  ldCalque('ld-conclure', 'ld-calque-menu', 'Conclure', '<h2 class="ld-fen-titre">Conclure maintenant ?</h2>' +
    '<p class="ld-texte">Il reste au moins une disquette à démasquer. Tu ne pourras plus objecter.</p>' +
    '<div class="ld-actions"><button type="button" class="ld-btn ld-btn-sombre" onclick="ldFermerCalque(\'ld-conclure\')">Continuer l’enquête</button>' +
    '<button type="button" class="ld-btn ld-btn-lien" onclick="ldFermerCalque(\'ld-conclure\'); ldConclure(true)">Conclure le dossier</button></div>');
}
function ldConclure(confirme) {
  const p = ld.partie; if (!p || !confirme) return;
  const fin = LuxDemasqueCore.conclure(p);
  if (fin.score > ldLire('luxDemasqueRecord', 0)) { ldEcrire('luxDemasqueRecord', fin.score); p.nouveauRecord = true; }
  ldSon(fin.complet ? 'resolu' : 'clos');
  if (fin.complet && !p.dossier.genere) {
    const resolus = ldLire('luxDemasqueResolus', []);
    if (resolus.indexOf(p.dossier.id) < 0) ldEcrire('luxDemasqueResolus', resolus.concat(p.dossier.id));
  }
  ldFermerToutesFenetres();
  ldEffacerEmotion();
  if (ld.rendu3d) ld.rendu3d.detacher();
  ldRendre();
}

// Bilan : résultat et action principale d'abord, détails repliables ensuite.
function ldRendreBilan(box) {
  const p = ld.partie, fin = p.fin, lignes = LuxDemasqueCore.bilan(p);
  const mensonges = lignes.filter(l => !l.vrai), vraies = lignes.filter(l => l.vrai);
  box.innerHTML = ldEntete({ menu: false }) +
    '<div class="ld-bilan">' +
      '<p class="ld-bilan-titre' + (fin.complet ? ' ld-complet' : '') + '">' + fin.trouvees + ' / ' + fin.total + '<span>' + (fin.total > 1 ? 'disquettes démasquées' : 'disquette démasquée') + '</span></p>' +
      '<div class="ld-bilan-tete">' + ldPortrait('ld-portrait-bilan', fin.complet ? 'Defeat' : 'Idle') +
        '<div class="ld-verdict-parole"><span class="ld-locuteur">' + ldEchapper(p.npc.nom) + '</span>' + ldReplique(fin.replique) + '</div></div>' +
      '<div class="ld-stats"><div><span>Objections ratées</span><b>' + fin.erreurs + '</b></div>' +
        '<div><span>Score</span><b>' + fin.score + '</b></div>' +
        '<div><span>' + (p.nouveauRecord ? 'Nouveau record' : 'Record') + '</span><b>' + ldLire('luxDemasqueRecord', 0) + '</b></div></div>' +
      (fin.sansFaute ? '<p class="ld-sans-faute">SANS FAUTE !</p>' : '') +
      '<div class="ld-actions"><button type="button" class="ld-btn ld-btn-or" onclick="ldNouveauDossier()">Nouveau dossier</button>' +
        (fin.complet ? '' : '<button type="button" class="ld-btn ld-btn-sombre" onclick="ldRejouer()">Rejouer ce dossier</button>') +
        '<button type="button" class="ld-btn ld-btn-lien" onclick="ldQuitter()">Retour aux jeux</button></div>' +
      '<details class="ld-details" open><summary>Comment il a essayé de t’embobiner</summary><ul class="ld-liste-bilan">' +
        mensonges.map(l => '<li class="' + (l.demasquee ? 'ld-ok' : 'ld-rate') + '"><small>' + (l.demasquee ? 'Démasquée' : 'Pas démasquée') + ' · ' + ldEchapper(LD_THEMES_FR[l.theme] || l.theme) + '</small>' +
          '<b lang="lb">' + ldEchapper(l.base.lu) + '</b><span>' + ldEchapper(l.base.fr) + '</span>' +
          '<span class="ld-motif">Pourquoi : ' + ldEchapper(l.motivationFr) + '</span>' +
          '<span class="ld-preuve">Preuve : ' + ldEchapper(l.explicationFr) + '</span>' +
          // Disquette manquée : où était la pièce, et l'avait-il ouverte ?
          (!l.demasquee && l.preuve ? '<span class="ld-piece-cle">Pièce : ' + ldEchapper(LD_APPS[l.preuve.source] + ' · ' + l.preuve.titre) + (l.preuveVue ? ' — tu l’avais ouverte' : ' — jamais ouverte') + '</span>' : '') +
          '</li>').join('') + '</ul></details>' +
      '<details class="ld-details"><summary>Ce qui était vrai</summary><ul class="ld-liste-bilan">' +
        vraies.map(l => '<li><b lang="lb">' + ldEchapper(l.base.lu) + '</b><span>' + ldEchapper(l.base.fr) + '</span></li>').join('') + '</ul></details>' +
      '<details class="ld-details ld-diag"><summary>Diagnostic</summary><p class="ld-texte">Dossier <b>' + ldEchapper(p.dossier.id) + '</b>' + (p.dossier.genere ? ' · graine <b>' + p.dossier.graine + '</b> · affaires ' + ldEchapper(p.dossier.affaires.join(', ')) : '') + ' · contenu ' + ldEchapper(p.contenus.contentVersion) + ' · ' + p.journal.length + ' actions</p></details>' +
      '<p class="ld-demo-note">Répliques luxembourgeoises en relecture · progression des leçons inchangée</p>' +
    '</div>';
}

// Aide FR : seulement la traduction ; l'enquête reste identique.
function ldBasculerAide() {
  ld.aideFr = !ld.aideFr;
  ldEcrire('luxDemasqueAideFr', ld.aideFr);
  document.querySelectorAll('#ld-jeu .ld-fr-btn').forEach(b => {
    b.classList.toggle('ld-actif', ld.aideFr); b.setAttribute('aria-pressed', ld.aideFr);
    b.setAttribute('aria-label', ld.aideFr ? 'Aide FR activée' : 'Aide FR désactivée');
  });
  const ouverts = [...document.querySelectorAll('#ld-jeu .ld-calque')].map(c => c.id);
  if (ld.partie && ld.partie.phase === 'deposition') ldMajDeposition(); else ldRendre();
  if (ouverts.indexOf('ld-carnet') >= 0) ldCarnet();
  if (ouverts.indexOf('ld-objection') >= 0) ldObjection();
  if (ouverts.indexOf('ld-verdict') >= 0 && ld.verdict) ldAfficherVerdict(ld.verdict);
}
