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

function jouerAudio(fichier, bouton) {
  arreterAudio();
  lecteurAudio = new Audio('audio/' + fichier);
  boutonAudio = bouton || null;
  if (boutonAudio) boutonAudio.classList.add('joue');
  lecteurAudio.onended = arreterAudio;
  lecteurAudio.onerror = () => { arreterAudio(); notifier('Audio indisponible pour le moment.'); };
  const lecture = lecteurAudio.play();
  if (lecture && lecture.catch) lecture.catch(() => { arreterAudio(); notifier('Audio indisponible pour le moment.'); });
}

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
