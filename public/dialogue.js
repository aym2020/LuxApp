// ─── SPEC 66 : DIALOGUES, MESSAGES ET SONS DE L'APPLICATION ─────────────────
// Remplacent les fenêtres natives (confirm, alert) par des composants LuxApp :
//   confirmer({ titre, texte, ok, annuler, danger }) → Promise<true|false>
//   notifier(texte)                                    → message bref en bas
//   jouerAudio(fichier, bouton)                        → prononciation (une à la fois)
// Le bouton Retour du téléphone ferme le dialogue (navigation.js).

let dialogueOuvert = null; // { resoudre, el, focusAvant }

function confirmer(options) {
  fermerDialogue(false); // jamais deux dialogues à la fois
  const o = Object.assign({ titre: '', texte: '', ok: 'Confirmer', annuler: 'Annuler', danger: false }, options);
  return new Promise(resoudre => {
    const el = document.createElement('div');
    el.className = 'dlg';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'dlg-titre');
    el.innerHTML =
      '<div class="dlg-voile"></div>' +
      '<section class="dlg-carte">' +
        '<button type="button" class="dlg-fermer" aria-label="Fermer">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
        '<h2 id="dlg-titre">' + escHtml(o.titre || o.texte) + '</h2>' +
        (o.titre && o.texte ? '<p>' + escHtml(o.texte) + '</p>' : '') +
        '<div class="dlg-actions">' +
          '<button type="button" class="dlg-ok' + (o.danger ? ' danger' : '') + '">' + escHtml(o.ok) + '</button>' +
          '<button type="button" class="dlg-annuler">' + escHtml(o.annuler) + '</button>' +
        '</div>' +
      '</section>';
    el.querySelector('.dlg-voile').onclick = () => fermerDialogue(false);
    el.querySelector('.dlg-fermer').onclick = () => fermerDialogue(false);
    el.querySelector('.dlg-annuler').onclick = () => fermerDialogue(false);
    el.querySelector('.dlg-ok').onclick = () => fermerDialogue(true);
    document.body.appendChild(el);
    dialogueOuvert = { resoudre, el, focusAvant: document.activeElement };
    requestAnimationFrame(() => el.classList.add('ouvert'));
    el.querySelector('.dlg-ok').focus();
    if (typeof programmerGarde === 'function') programmerGarde();
  });
}

function dialogueEstOuvert() {
  return !!dialogueOuvert;
}

// Ferme le dialogue avec la réponse donnée. Renvoie true si un dialogue était ouvert.
function fermerDialogue(valeur) {
  if (!dialogueOuvert) return false;
  const d = dialogueOuvert;
  dialogueOuvert = null;
  d.el.classList.remove('ouvert');
  setTimeout(() => d.el.remove(), 220); // laisse finir l'animation de sortie
  if (d.focusAvant && d.focusAvant.focus) d.focusAvant.focus();
  d.resoudre(valeur);
  if (typeof programmerGarde === 'function') programmerGarde();
  return true;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && dialogueOuvert) { e.preventDefault(); fermerDialogue(false); }
});

// Message bref, sans bouton : il disparaît seul.
let minuterieNotif = null;
function notifier(texte) {
  let el = document.getElementById('notif');
  if (!el) {
    el = document.createElement('div');
    el.id = 'notif';
    el.className = 'notif';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = texte;
  el.classList.add('visible');
  clearTimeout(minuterieNotif);
  minuterieNotif = setTimeout(() => el.classList.remove('visible'), 3200);
}

// ─── AUDIO ──────────────────────────────────────────────────────────────────
// Un seul lecteur : une nouvelle lecture arrête la précédente.
// Jamais de lecture automatique : appelé seulement après un appui.
let lecteurAudio = null;
let boutonAudio = null;

// SPEC 81 : chemin absolu, indépendant de l'URL de la PWA. Si un MP3
// local LOD est inaccessible, le miroir d'origine du téléchargement est
// une seconde source du MÊME enregistrement (pas de voix artificielle).
const MIROIR_AUDIO_LOD = 'https://raw.githubusercontent.com/robertoentringer/lod-mp3-mirror/master/2020-12-18-lod-opendata/';
function sourcesAudio(fichier) {
  // Fichier d'accueil autorisé explicitement, en plus des sons indexés ; jamais de ../.
  if (!/^(?:moien\.mp3|lod\/[A-Za-z0-9_-]+\.mp3|lod-phrases\/[A-Za-z0-9_-]+\.m4a|mia\/[a-f0-9]{24}\.mp3)$/.test(fichier)) return [];
  const sources = ['/audio/' + fichier];
  const lod = /^lod\/([A-Za-z0-9_-]+)\.mp3$/.exec(fichier);
  if (lod) sources.push(MIROIR_AUDIO_LOD + lod[1] + '.mp3');
  return sources;
}

function jouerAudio(fichier, bouton) {
  arreterAudio();
  const sources = sourcesAudio(fichier);
  if (!sources.length) return;
  boutonAudio = bouton || null;
  if (boutonAudio) boutonAudio.classList.add('joue');

  let tentative = 0;
  function essayer() {
    const url = sources[tentative++];
    const audio = new Audio(url);
    lecteurAudio = audio;
    let dejaEchoue = false;

    function erreur(cause, autorisation) {
      // Sur un changement d'écran, une annulation ou un deuxième clic,
      // les erreurs de l'ancien lecteur ne doivent jamais déclencher un toast.
      if (lecteurAudio !== audio || dejaEchoue) return;
      dejaEchoue = true;
      console.warn('[LuxApp audio]', { fichier, source: tentative, cause });
      audio.onerror = null;
      audio.onended = null;
      if (autorisation) {
        arreterAudio();
        notifier('Lecture bloquée par le navigateur. Appuie à nouveau sur le son.');
      } else if (tentative < sources.length) {
        essayer();
      } else {
        arreterAudio();
        notifier('Audio indisponible. Vérifie ta connexion et réessaie.');
      }
    }
    audio.onended = () => { if (lecteurAudio === audio) arreterAudio(); };
    audio.onerror = () => erreur('media:' + (audio.error ? audio.error.code : 'inconnu'), false);
    try {
      const lecture = audio.play();
      if (lecture && typeof lecture.catch === 'function') {
        lecture.catch(e => erreur(e && e.name || 'play', !!(e && e.name === 'NotAllowedError')));
      }
    } catch (e) {
      erreur(e && e.name || 'play', !!(e && e.name === 'NotAllowedError'));
    }
  }
  essayer();
}

// Sons LOD des mots des leçons (tools/audio-lod.js) : { "mot de la carte": "lod/ID.mp3" }.
let sonsLod = {};
let sonsLodSimples = {}; // SPEC 68 : même table, clés simplifiées (sans article ni ponctuation)
let sonsPhrases = {}; // SPEC 69 : phrases enregistrées par le LOD, clé = phrase simplifiée
let sonsMia = {}; // Synthèse exacte pour les entrées manquantes
let sonsContexte = {}; // SPEC 70 : { phrase simplifiée: { son, phrase, fr } } — l'expression dite dans une phrase LOD
function cleePhrase(texte) {
  return String(texte).replace(/<[^>]*>/g, ' ').toLowerCase().replace(/[’`]/g, "'")
    .replace(/[.,!?;:«»"…()\u2013\u2014]/g, ' ').replace(/\s+/g, ' ').trim();
}
function chargerSonsLod() {
  fetch('audio/mia.json').then(r => (r.ok ? r.json() : {})).then(data => {
    sonsMia = {};
    Object.keys(data || {}).forEach(t => { sonsMia[cleePhrase(t)] = data[t]; });
  }, () => {});
  fetch('audio/lod-contexte.json').then(r => (r.ok ? r.json() : {})).then(d => {
    sonsContexte = {};
    Object.keys(d || {}).forEach(p => { sonsContexte[cleePhrase(p)] = d[p]; });
  }, () => {});
  fetch('audio/lod-phrases.json').then(r => (r.ok ? r.json() : {})).then(d => {
    sonsPhrases = {};
    Object.keys(d || {}).forEach(p => { sonsPhrases[cleePhrase(p)] = d[p]; });
  }, () => {});
  return fetch('audio/lod.json').then(r => (r.ok ? r.json() : {})).then(d => {
    sonsLod = d || {};
    sonsLodSimples = {};
    Object.keys(sonsLod).forEach(mot => {
      const cle = cleSon(mot);
      // Deux mots différents pour la même clé : on ne devine pas.
      sonsLodSimples[cle] = (cle in sonsLodSimples && sonsLodSimples[cle] !== sonsLod[mot]) ? null : sonsLod[mot];
    });
  }, () => {});
}
// « de Stull », « Stull », « Moien! » → « stull », « moien »
// SPEC 73 : une note entre parenthèses (« de Brudder (pl. d'Bridder) », « d'Meedchen (neutre) ») n'est pas prononcée.
function sansParentheses(texte) {
  return String(texte).replace(/\s*\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
}
function cleSon(texte) {
  let t = sansParentheses(String(texte).replace(/<[^>]*>/g, '')).replace(/[!?.,;:«»"]/g, ' ').replace(/’/g, "'").trim().toLowerCase();
  for (const article of ['den ', 'de ', 'déi ', 'dat ', 'en ', 'eng ', 'e ', "d'"]) {
    if (t.startsWith(article)) { t = t.slice(article.length); break; }
  }
  return t.trim().replace(/\s+/g, ' ');
}
function sonDuMot(lu) {
  if (!lu) return null;
  return sonsLod[lu] || sonsLodSimples[cleSon(lu)] || sonsPhrases[cleePhrase(lu)] || sonsMia[cleePhrase(lu)] || null;
}
// Bouton « Écouter » : prononciation exacte (or), sinon prononciation dans une phrase LOD (gris sable, SPEC 72).
// Rien si le LOD n'a aucun son validé. compact : icône seule (listes, tableaux), le nom accessible cite le mot.
const ICONE_ECOUTER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M11 5 6 9H3v6h3l5 4z"/><path class="onde1" d="M15.5 8.5a5 5 0 0 1 0 7"/><path class="onde2" d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const FICHIER_SON = /^[A-Za-z0-9/._-]+\.(mp3|m4a)$/;
function boutonEcouterHtml(lu, compact) {
  if (!lu) return '';
  // Nom accessible : seulement ce qui est prononcé (sans la note entre parenthèses).
  const mot = escHtml(sansParentheses(String(lu).replace(/<[^>]*>/g, '')));
  const fichier = sonDuMot(lu);
  if (fichier && FICHIER_SON.test(fichier)) {
    return '<button type="button" class="bouton-ecouter' + (compact ? ' compact' : '') + '" ' +
      'onclick="event.stopPropagation(); jouerAudio(\'' + fichier + '\', this)" aria-label="Écouter « ' + mot + ' »">' +
      ICONE_ECOUTER + (compact ? '' : '<span>Écouter</span>') + '</button>';
  }
  const c = sonsContexte[cleePhrase(lu)];
  if (!c || !FICHIER_SON.test(c.son)) return '';
  return '<button type="button" class="bouton-ecouter contexte' + (compact ? ' compact' : '') + '" data-cle="' + escHtml(cleePhrase(lu)) + '" data-lu="' + mot + '" aria-expanded="false" ' +
    'onclick="event.stopPropagation(); ecouterContexte(this)" aria-label="Écouter « ' + mot + ' » dans une phrase : « ' + escHtml(c.phrase) + ' »">' +
    ICONE_ECOUTER + (compact ? '' : '<span>Dans une phrase</span>') + '</button>';
}
// Au clic sur le bouton gris sable : ecouterContexte (contexte.js, SPEC 71) joue la phrase et ouvre la bulle.

function arreterAudio() {
  if (lecteurAudio) {
    lecteurAudio.onended = null;
    lecteurAudio.onerror = null;
    lecteurAudio.pause();
    lecteurAudio = null;
  }
  if (boutonAudio) boutonAudio.classList.remove('joue');
  boutonAudio = null;
}
