/* Tirer pour actualiser.
   L'app installée (PWA « standalone ») n'a pas le geste natif d'Android, et sur
   l'accueil le défilement interne le bloque aussi dans le navigateur. Ce fichier
   ajoute le geste : en haut d'une page, tirer vers le bas puis relâcher recharge
   l'app. Après le rechargement, navigation.js (spec 44) rouvre le même écran.
   Jamais pendant un exercice, une mission, un examen ou un jeu : on ne recharge
   que les pages de consultation. */
'use strict';

// Pages où le geste est proposé quand l'app est installée.
const ACTUALISER_PAGES = [
  'view-dashboard', 'view-lessons', 'view-plecon', 'view-msintro', 'view-jeux', 'view-examens',
  'view-plus', 'view-reglages', 'view-lexique', 'view-pieges', 'view-review-setup'
];
const ACTUALISER_SEUIL = 70;    // px de descente de l'indicateur pour déclencher
const ACTUALISER_FREIN = 0.5;   // l'indicateur descend deux fois moins vite que le doigt
const ACTUALISER_MAX = 110;     // descente maximale de l'indicateur

let actualiserDepart = null;    // { x, y } du doigt au début du geste
let actualiserDescente = 0;     // descente actuelle de l'indicateur
let actualiserEnCours = false;
let actualiserIndicateur = null;

function actualiserAppInstallee() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Dans le navigateur, le geste natif existe déjà sauf sur l'accueil.
function actualiserPermis() {
  const vue = document.querySelector('.view.active');
  if (!vue || actualiserEnCours) return false;
  if (document.querySelector('dialog[open]')) return false;
  if (typeof superpositionOuverte === 'function' && superpositionOuverte()) return false;
  if (vue.id === 'view-dashboard') return true;
  return actualiserAppInstallee() && ACTUALISER_PAGES.includes(vue.id);
}

// La page est-elle tout en haut ? (l'accueil défile dans sa propre vue)
function actualiserEnHaut(cible) {
  const vue = document.querySelector('.view.active');
  if (vue.id === 'view-dashboard' ? vue.scrollTop > 0 : window.scrollY > 0) return false;
  // Une zone qui défile elle-même (liste, panneau) et qui n'est pas en haut : on la laisse défiler.
  for (let e = cible; e && e !== vue; e = e.parentElement) {
    if (e.scrollTop > 0) return false;
  }
  return true;
}

function actualiserCreerIndicateur() {
  if (actualiserIndicateur) return actualiserIndicateur;
  const el = document.createElement('div');
  el.className = 'actualiser-indicateur';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<svg class="ic" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>' +
    '<path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>';
  document.body.appendChild(el);
  actualiserIndicateur = el;
  return el;
}

function actualiserAfficher(descente) {
  const el = actualiserCreerIndicateur();
  el.style.transform = 'translate(-50%, ' + (descente - 48) + 'px) rotate(' + (descente * 3) + 'deg)';
  el.style.opacity = Math.min(1, descente / ACTUALISER_SEUIL);
  el.classList.toggle('pret', descente >= ACTUALISER_SEUIL);
}

function actualiserCacher() {
  if (!actualiserIndicateur) return;
  actualiserIndicateur.classList.remove('pret');
  actualiserIndicateur.style.transform = 'translate(-50%, -48px)';
  actualiserIndicateur.style.opacity = 0;
}

// Recharge l'app. Si une nouvelle version est déjà prête (service worker en attente),
// elle est activée d'abord : l'actualisation affiche alors la dernière version publiée.
async function actualiserApp() {
  actualiserEnCours = true;
  const el = actualiserCreerIndicateur();
  el.classList.add('tourne');
  el.style.transform = 'translate(-50%, ' + (ACTUALISER_SEUIL - 48) + 'px)';
  el.style.opacity = 1;
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (reg) {
      await Promise.race([reg.update(), new Promise(r => setTimeout(r, 2500))]);
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'activer' });
        await new Promise(r => setTimeout(r, 300));
      }
    }
  } catch (e) { /* pas de réseau : on recharge la copie installée */ }
  location.reload();
}

document.addEventListener('touchstart', e => {
  actualiserDepart = null;
  actualiserDescente = 0;
  if (e.touches.length !== 1 || !actualiserPermis() || !actualiserEnHaut(e.target)) return;
  actualiserDepart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  // Écouteur non passif seulement pendant ce geste : le défilement et les jeux restent fluides.
  document.addEventListener('touchmove', actualiserGeste, { passive: false });
}, { passive: true });

// Pendant le geste, on empêche la page de rebondir et l'indicateur suit le doigt.
function actualiserGeste(e) {
  if (!actualiserDepart) return;
  const dy = e.touches[0].clientY - actualiserDepart.y;
  const dx = e.touches[0].clientX - actualiserDepart.x;
  if (actualiserDescente === 0) {
    // Geste vers le haut ou horizontal : ce n'est pas une actualisation.
    if (dy < -4 || Math.abs(dx) > Math.max(dy, 8)) { actualiserArreter(); return; }
    if (dy < 6) return; // pas encore assez net pour décider
  }
  actualiserDescente = Math.min(ACTUALISER_MAX, Math.max(0, dy * ACTUALISER_FREIN));
  if (e.cancelable) e.preventDefault();
  actualiserAfficher(actualiserDescente);
}

function actualiserArreter() {
  actualiserDepart = null;
  document.removeEventListener('touchmove', actualiserGeste, { passive: false });
}

function actualiserFin() {
  if (!actualiserDepart) return;
  const descente = actualiserDescente;
  actualiserArreter();
  actualiserDescente = 0;
  if (descente >= ACTUALISER_SEUIL) actualiserApp();
  else actualiserCacher();
}
document.addEventListener('touchend', actualiserFin);
document.addEventListener('touchcancel', actualiserFin);
