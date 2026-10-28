// Leçon 0 — mission « Le studio radio » : huit défis sans traduction ni saisie.
// Utilise les mêmes scores, vies et écrans que les missions normales.
'use strict';

function studioActif(l) {
  return !!(l && l.mission && l.mission.type === 'studio-radio' && Array.isArray(l.mission.defis));
}
function studioDefis(l) { return studioActif(l) ? l.mission.defis : []; }

function studioMissionHtml(l, conseillee) {
  const best = getMissionBest(l.id);
  const faites = unitesCoeur(l).filter(u => getUnitBest(l.id, u.id) != null).length;
  return '<div class="ms-carte compacte" id="pl-mission">' +
    '<div class="ms-carte-haut"><div class="pc-mini-label pc-gold">' + etiquetteMission(l) +
    '</div><span class="ms-etat">' + escHtml(etatPreparationMission(l)) + '</span></div>' +
    '<div class="ms-titre">' + escHtml(l.mission.titre) + '</div>' +
    '<div class="ms-bas">' + faites + ' / ' + unitesCoeur(l).length + ' unités préparées · 8 défis : 3 sons, 3 scripts, 2 formes à compléter</div>' +
    '<div class="ms-actions"><button class="pc-chip" onclick="voirScenario()">Voir les défis</button>' +
    '<button class="pc-chip ms-jouer' + (conseillee && best == null ? ' conseille' : '') +
    '" onclick="openMission()">' + (best != null ? 'Rejouer la mission' : 'Jouer la mission') +
    '</button></div></div>';
}

function studioVoirScenario() {
  const l = pLecon;
  const html = '<div class="poignee"></div><div class="pc-mini-label pc-gold">MISSION · LES BASES</div>' +
    '<h2 class="ms-titre">Le studio radio</h2>' +
    '<div class="ms-contexte">' + escHtml(l.mission.contexte) + '</div>' +
    '<div class="ms-objectif"><span>Objectif :</span> ' + escHtml(l.mission.objectif) + '</div>' +
    '<div class="studio-apercu"><b>3 écoutes LOD</b><b>3 vérifications de script</b><b>2 corrections de forme</b></div>' +
    '<p class="studio-explication">Aucune traduction ni mémorisation de vocabulaire. Tu peux réécouter les sons.</p>' +
    '<div class="ms-panneau-bas"><button class="pc-btn primary wide" onclick="fermerPanneau();openMission()">Jouer les 8 défis</button>' +
    '<button class="pc-btn ghost wide" onclick="fermerPanneau()">Fermer</button></div>';
  ouvrirPanneau(html, 'Les huit défis du studio radio');
}

function studioRenderIntroMission() {
  const l = pLecon;
  document.getElementById('msi-content').innerHTML =
    '<div class="msi-haut"><div class="pc-mini-label pc-gold msi-in">MISSION · LEÇON 0</div>' +
    '<h1 class="msi-titre msi-in">Le studio radio</h1>' +
    '<p class="msi-contexte msi-in">' + escHtml(l.mission.contexte) + '</p></div>' +
    '<div class="msi-objectif msi-in"><div class="msi-objectif-titre">À la fin, tu sauras :</div>' +
    '<div class="msi-objectif-txt">' + ICONES.coche + '<span>' + escHtml(l.mission.objectif) + '</span></div></div>' +
    '<div class="msi-bas msi-in"><div class="msi-info">3 activités pour te préparer : ' +
    'prononciation, United Zoha et pronoms personnels. Ensuite 8 défis en studio radio.</div>' +
    '<button class="pc-btn primary wide big" onclick="confirmerIntroMission()">Compris · Commencer →</button>' +
    '<button class="pc-btn ghost wide" onclick="voirUnitesDepuisIntro()">Voir les unités</button>' +
    '<button class="pc-btn ghost wide msi-tenter" onclick="tenterDepuisIntro()">Tenter directement les 8 défis</button></div>';
}

function studioOpenMission(tentative) {
  const q = studioDefis(pLecon);
  if (q.length !== 8) return;
  ms = {radio:true, idx:0, essais:0, dernierEssai:'', resultats:[], formesValidees:[],
    tentative:!!tentative && peutTenterSaChance(pLecon), vies:VIES_MISSION, coquille:false,
    enBas:true, vues:0};
  fermerClavier();
  renderEnteteMission();
  majVies(false);
  document.getElementById('ms-reponse').classList.remove('hidden');
  showView('view-mission');
  studioRenderMission();
}

function studioReprendreMission(note) {
  studioOpenMission(note.tentative);
  if (!ms) return;
  ms.resultats = Array.isArray(note.resultats) ? note.resultats.slice(0, 8) : [];
  ms.vies = Math.max(0, Math.min(VIES_MISSION, Number(note.vies) || 0));
  ms.idx = Math.max(0, Math.min(8, Number(note.idx) || 0));
  // Une réponse déjà enregistrée ne doit jamais coûter une seconde vie.
  if (ms.resultats[ms.idx]) ms.idx++;
  ms.tentative = !!note.tentative;
  majVies(false);
  studioRenderMission();
}

function studioRenderMission() {
  if (!ms || !ms.radio) return;
  const questions = studioDefis(pLecon);
  if (ms.idx >= questions.length) { studioFinirMission(); return; }
  const q = questions[ms.idx];
  document.getElementById('ms-compteur').textContent = (ms.idx + 1) + ' / ' + questions.length;
  document.getElementById('ms-piste').style.width = Math.round(ms.idx / questions.length * 100) + '%';
  const tag = q.type === 'audio' ? 'RECONNAISSANCE AUDIO' : q.type === 'verification' ? 'CONTRÔLE DU SCRIPT' : 'APPLICATION DU N';
  const numero = '<div class="pc-mini-label pc-gold">DÉFI ' + (ms.idx + 1) + ' · ' + tag + '</div>';
  const son = q.type === 'audio' ? '<button type="button" class="studio-son bouton-ecouter" ' +
    'onclick="studioEcouter(this)" aria-label="Écouter le mot à reconnaître">' +
    '<span aria-hidden="true">🔊</span><b>Écouter le mot</b><small>Réécoute libre · LOD</small></button>' : '';
  const script = q.script ? '<div class="studio-script"><small>' +
    escHtml(q.indice || 'SCRIPT À VÉRIFIER') + '</small><strong>' + escHtml(q.script) + '</strong></div>' : '';
  const avance = '<div class="studio-instructions">' +
    (q.type === 'audio' ? 'Reconnais uniquement le son : tu n’as pas besoin de traduire.' :
      q.type === 'verification' ? 'Vérifie si le N convient à la lettre suivante.' :
      'L’article et la première lettre sont indiqués ; choisis la forme du N.') + '</div>';
  document.getElementById('ms-body').innerHTML =
    '<div class="studio-question">' + numero + '<h2>' + escHtml(q.titre) + '</h2>' +
    son + script + avance + '</div>';
  document.getElementById('ms-reponse').innerHTML =
    '<div class="studio-choix">' + q.choix.map((rep, i) =>
      '<button type="button" class="studio-option" onclick="studioChoisir(' + i + ')">' +
      escHtml(rep) + '</button>').join('') + '</div>';
  document.getElementById('ms-reponse').classList.remove('hidden');
  // Chaque défi commence sur sa question, pas au scroll de la correction précédente.
  document.getElementById('ms-body').scrollTop = 0;
}

function studioEcouter(bouton) {
  if (!ms || !ms.radio || ms.resultats[ms.idx]) return;
  const q = studioDefis(pLecon)[ms.idx];
  if (!q || q.type !== 'audio') return;
  const fichier = q.audioFichier || sonsLod[q.audioMot];
  // Pas de TTS de substitution. Signaler une entrée manquante sans dévoiler la solution.
  if (!fichier) { notifier('Enregistrement LOD indisponible.'); return; }
  jouerAudio(fichier, bouton);
}

function studioChoisir(index) {
  if (!ms || !ms.radio || ms.resultats[ms.idx]) return;
  const q = studioDefis(pLecon)[ms.idx];
  if (!q || !Number.isInteger(index) || index < 0 || index >= q.choix.length) return;
  const correcte = q.choix[index] === q.reponse;
  ms.resultats[ms.idx] = correcte ? 'ok' : 'erreur';
  if (!correcte) perdreVie();
  arreterAudio();
  // Après la réponse, les choix ne restent pas devant l'explication :
  // le pied d'écran accueille uniquement l'action « Continuer ».
  // Le choix de l'apprenant reste visible dans la correction.
  const correction = q.correction ? '<div class="studio-correction"><b>Forme correcte : </b>' +
    escHtml(q.correction) + '</div>' : '';
  const choix = '<div class="studio-recap">Ton choix : <strong>' +
    escHtml(q.choix[index]) + '</strong></div>';
  const attendu = correcte ? '' : '<div class="studio-recap">Réponse attendue : <strong>' +
    escHtml(q.reponse) + '</strong></div>';
  const corps = document.getElementById('ms-body');
  corps.insertAdjacentHTML('beforeend',
    '<div class="studio-feedback ' + (correcte ? 'ok' : 'ko') + '"><b>' +
    (correcte ? '✓ Exact !' : '✕ Pas encore') + '</b>' +
    choix + attendu + '<p>' + escHtml(q.explication) +
    '</p>' + correction + '</div>');
  document.getElementById('ms-reponse').innerHTML =
    '<button type="button" class="pc-btn primary wide big studio-suivant" onclick="studioSuivant()">' +
      (ms.idx === 7 ? 'Voir mon résultat' : 'Continuer →') + '</button>';

  // Cadrer le DÉBUT de la correction dans la zone défilante de la mission.
  // Pas de scrollIntoView sur la page : le CTA et l'en-tête restent immobiles.
  const montrerCorrection = () => {
    const retour = corps.querySelector('.studio-feedback');
    if (!retour) return; // « Continuer » a pu être pressé entre-temps.
    corps.scrollTop += retour.getBoundingClientRect().top -
      corps.getBoundingClientRect().top - 10;
  };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(montrerCorrection);
  else montrerCorrection();
}

function studioSuivant() {
  if (!ms || !ms.radio || !ms.resultats[ms.idx]) return;
  ms.idx++;
  studioRenderMission();
}

function studioFinirMission() {
  const questions = studioDefis(pLecon);
  const ok = ms.resultats.filter(x => x === 'ok').length;
  const total = questions.length;
  const percent = Math.round(ok / total * 100);
  const reussie = ms.vies > 0;
  const premiere = getMissionBest(pLecon.id) == null;
  ms.bilan = {ok, total, erreurs:total-ok, reveles:0, vies:ms.vies};
  figerAcquisMission(pLecon);
  saveMissionBest(pLecon.id, percent, missionVersion(pLecon));
  if (reussie) {
    validerLeconParMission(pLecon.id);
    marquerMissionReussie(pLecon.id, missionVersion(pLecon));
    oublierIntroMission(pLecon.id);
    majBoutonsRetour('view-mission');
    majGarde();
  }
  marquerUniteFaite();
  dernierFini = {leconId:pLecon.id, uniteId:'mission'};
  const etoiles = percent >= 90 ? '★★★' : percent >= 70 ? '★★☆' : percent >= 50 ? '★☆☆' : '☆☆☆';
  document.getElementById('ms-compteur').textContent = '8 / 8';
  document.getElementById('ms-piste').style.width = '100%';
  document.getElementById('ms-reponse').classList.add('hidden');
  document.getElementById('ms-body').innerHTML = '<div class="studio-fin"><div class="studio-trophee">🏆</div>' +
    '<h2>' + (reussie ? 'Mission réussie !' : 'Mission à rejouer') + '</h2>' +
    '<div class="studio-score">' + ok + ' / ' + total + '</div>' +
    '<div class="studio-etoiles">' + etoiles + '</div>' +
    '<p>' + (reussie ? 'Tous les défis sont terminés : la leçon est validée.' :
    'Tu as perdu tes trois vies ; tu peux réessayer pour valider la mission.') +
    ' · ' + ms.vies + ' vie(s) restante(s).</p>' +
    '<div class="pf-boutons">' +
    (reussie ? '<button class="pc-btn primary wide big" onclick="suivreProchainPas()">' +
      libelleApresMission() + '</button>' : '') +
    '<button class="pc-btn wide" onclick="openMission()">Rejouer les huit défis</button>' +
    '<button class="pc-btn ghost wide" onclick="cheminSurLecon(pLecon.id)">Mon chemin</button></div></div>';
  document.getElementById('ms-body').scrollTop = 0;
  if (reussie) confettis();
}
