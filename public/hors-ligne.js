/* SPEC 93 — LuxApp hors ligne.
   1. Enregistre le Service Worker (sw.js) : l'app entière est copiée sur
      l'appareil et s'ouvre ensuite sans Internet.
   2. Réglages › Hors ligne : bouton « Télécharger tous les audios » (≈ 35 Mo),
      avec progression, reprise si le réseau coupe et vérification finale.
   Jamais en recette (RECETTE) ni pendant les tests navigateur (TESTS). */
'use strict';

const HORS_LIGNE_CACHE_AUDIO = 'luxapp-audio';
const HORS_LIGNE_CLE = 'luxHorsLigneAudio'; // état de l'appareil, commun à tous les profils
const HORS_LIGNE_PARALLELE = 6;              // téléchargements simultanés

let horsLigneEnCours = null; // { annule, fait, total, octets, octetsTotal }

function horsLignePossible() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof caches !== 'undefined';
}

// Actualisation autonome, sans interruption des écrans de travail.
let horsLigneMajRegistration = null;
let horsLigneMajDemandee = false;
let horsLigneMajControleur = false;
let horsLigneDerniereVerification = 0;
let horsLigneVerificationEnCours = false;
function horsLignePointSur() {
  // Refuser tout écran autre que l'accueil : aucun exercice, formulaire ou jeu interrompu.
  const actif = document.querySelector('.view.active, .view.visible, .view:not([hidden]).actif');
  return !!actif && actif.id === 'view-accueil' && !document.querySelector('input:focus,textarea:focus,[contenteditable="true"]:focus');
}
function horsLigneActivationSecurisee() {
  if (!horsLigneMajRegistration || !horsLigneMajRegistration.waiting || horsLigneMajDemandee) return;
  if (!horsLignePointSur()) return;
  horsLigneMajDemandee = true;
  horsLigneMajRegistration.waiting.postMessage({type:'activer'});
}
function horsLigneVerifierMaj() {
  if (!horsLigneMajRegistration || horsLigneVerificationEnCours || navigator.onLine === false) return;
  const now = Date.now();
  if (now - horsLigneDerniereVerification < 30000) return;
  horsLigneDerniereVerification = now;
  horsLigneVerificationEnCours = true;
  Promise.resolve(horsLigneMajRegistration.update()).catch(() => {}).finally(() => {
    horsLigneVerificationEnCours = false;
    horsLigneActivationSecurisee();
  });
}
function horsLigneEnregistrer() {
  if (!horsLignePossible()) return;
  const cfg = window.APP_CONFIG || {};
  if (cfg.TESTS) return;
  if (cfg.RECETTE) {
    navigator.serviceWorker.getRegistrations().then(liste => liste.forEach(r => r.unregister())).catch(() => {});
    return;
  }
  const enregistrer = () => navigator.serviceWorker.register('/sw.js', {updateViaCache:'none'}).then(reg => {
    horsLigneMajRegistration = reg;
    horsLigneRendre();
    horsLigneActivationSecurisee();
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      if (worker) worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') horsLigneActivationSecurisee();
      });
    });
    horsLigneVerifierMaj();
  }).catch(() => {});
  if (document.readyState === 'complete') enregistrer();
  else window.addEventListener('load', enregistrer);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (horsLigneMajDemandee && horsLignePointSur() && !horsLigneMajControleur) {
      horsLigneMajControleur = true;
      location.reload();
      return;
    }
    horsLigneRendre();
  });
  window.addEventListener('online', () => { horsLigneDerniereVerification = 0; horsLigneVerifierMaj(); });
  window.addEventListener('pageshow', horsLigneVerifierMaj);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { horsLigneVerifierMaj(); horsLigneActivationSecurisee(); }
  });
  // Navigation au retour accueil : vérifie le point sûr sans surveiller les exercices.
  window.setInterval(() => {
    if (!document.hidden) { horsLigneVerifierMaj(); horsLigneActivationSecurisee(); }
  }, 60000);
}
// Compatibilité du bouton de diagnostic ancien : pas de rechargement sans contrôle.
function horsLigneAppliquerMaj() { horsLigneActivationSecurisee(); }
function horsLigneBandeauMaj(reg) { horsLigneMajRegistration = reg; horsLigneActivationSecurisee(); }

function horsLigneLireEtat() {
  try { return JSON.parse(localStorage.getItem(HORS_LIGNE_CLE)) || null; } catch (_) { return null; }
}
function horsLigneEcrireEtat(etat) {
  try { localStorage.setItem(HORS_LIGNE_CLE, JSON.stringify(etat)); } catch (_) { /* facultatif */ }
}

function horsLigneMo(octets) {
  return (octets / 1048576).toLocaleString('fr-FR', { maximumFractionDigits: octets < 10485760 ? 1 : 0 }) + ' Mo';
}

// Télécharge les audios manquants. maj() est appelée à chaque fichier terminé.
async function horsLigneTelechargerAudios(maj) {
  const manifeste = await fetch('/offline-manifest.json', { cache: 'no-store' }).then(r => {
    if (!r.ok) throw new Error('manifeste');
    return r.json();
  });
  const liste = manifeste.audio.fichiers;
  const cache = await caches.open(HORS_LIGNE_CACHE_AUDIO);
  const presents = new Set((await cache.keys()).map(r => new URL(r.url).pathname));
  const suivi = { annule: false, fait: 0, total: liste.length, octets: 0, octetsTotal: manifeste.audio.total, erreurs: 0, plein: false };
  horsLigneEnCours = suivi;
  const manquants = [];
  liste.forEach(a => {
    if (presents.has(a.u)) { suivi.fait++; suivi.octets += a.t; } else manquants.push(a);
  });
  maj(suivi);
  // Demande au navigateur de ne pas effacer ces fichiers pour libérer de la place.
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  let prochain = 0;
  async function ouvrier() {
    while (prochain < manquants.length && !suivi.annule && !suivi.plein) {
      const a = manquants[prochain++];
      let ok = false;
      for (let essai = 0; essai < 3 && !ok && !suivi.annule; essai++) {
        try {
          const r = await fetch(a.u, { cache: 'no-store' });
          if (r.ok) { await cache.put(location.origin + a.u, r); ok = true; }
        } catch (e) {
          if (e && e.name === 'QuotaExceededError') { suivi.plein = true; break; }
        }
      }
      if (ok) { suivi.fait++; suivi.octets += a.t; } else suivi.erreurs++;
      maj(suivi);
    }
  }
  await Promise.all(Array.from({ length: HORS_LIGNE_PARALLELE }, ouvrier));
  // Vérification finale : chaque fichier de la liste est bien dans le cache.
  const finaux = new Set((await cache.keys()).map(r => new URL(r.url).pathname));
  const complet = liste.every(a => finaux.has(a.u));
  horsLigneEcrireEtat({ version: manifeste.audio.version, complet, octets: manifeste.audio.total, nombre: liste.length, date: Date.now() });
  horsLigneEnCours = null;
  return { complet, annule: suivi.annule, plein: suivi.plein };
}

// ─── Carte « Hors ligne » des Réglages ──────────────────────────────────────

let horsLigneVersionAudio = null; // version audio publiée (connue si en ligne)
let horsLigneTaille = 0;          // poids total des audios publiés

async function horsLigneRendre() {
  const etat = document.getElementById('hl-etat');
  const bouton = document.getElementById('hl-bouton');
  const barre = document.getElementById('hl-barre');
  if (!etat || !bouton || !barre) return;
  if (!horsLignePossible()) {
    etat.textContent = 'Ce navigateur ne permet pas d’utiliser LuxApp hors ligne.';
    bouton.hidden = true; barre.hidden = true;
    return;
  }
  const suivi = horsLigneEnCours;
  if (suivi) {
    barre.hidden = false;
    barre.firstElementChild.style.width = Math.round(100 * suivi.octets / Math.max(1, suivi.octetsTotal)) + '%';
    etat.textContent = 'Téléchargement… ' + suivi.fait + ' / ' + suivi.total + ' · ' +
      horsLigneMo(suivi.octets) + ' sur ' + horsLigneMo(suivi.octetsTotal) + '. Garde l’app ouverte.';
    bouton.hidden = false; bouton.disabled = false; bouton.textContent = 'Annuler';
    return;
  }
  barre.hidden = true;
  const appPrete = !!navigator.serviceWorker.controller;
  const audio = horsLigneLireEtat();
  const enLigne = navigator.onLine !== false;
  if (enLigne && horsLigneVersionAudio === null) {
    fetch('/offline-manifest.json', { cache: 'no-store' }).then(r => r.json())
      .then(m => { horsLigneVersionAudio = m.audio.version; horsLigneTaille = m.audio.total; horsLigneRendre(); })
      .catch(() => {});
  }
  const nouveaux = audio && audio.complet && horsLigneVersionAudio && audio.version !== horsLigneVersionAudio;
  const lignes = [appPrete ? 'L’app s’ouvre sans Internet sur cet appareil.' : 'Préparation de l’app hors ligne…'];
  if (audio && audio.complet && !nouveaux) lignes.push('Tous les audios sont disponibles hors ligne (' + horsLigneMo(audio.octets) + ').');
  else if (nouveaux) lignes.push('De nouveaux audios sont disponibles.');
  else lignes.push('Audios : non téléchargés. Sans Internet, seuls les audios déjà écoutés sont disponibles.');
  etat.textContent = lignes.join(' ');
  const taille = horsLigneTaille ? ' (' + horsLigneMo(horsLigneTaille) + ')' : '';
  bouton.hidden = !!(audio && audio.complet && !nouveaux);
  bouton.disabled = !enLigne;
  bouton.textContent = !enLigne ? 'Connecte-toi à Internet pour télécharger'
    : nouveaux ? 'Mettre à jour les audios'
    : audio && !audio.complet ? 'Reprendre le téléchargement' + taille
    : 'Télécharger tous les audios' + taille;
}

async function horsLigneAction() {
  if (horsLigneEnCours) { horsLigneEnCours.annule = true; return; }
  const etat = document.getElementById('hl-etat');
  try {
    const resultat = await horsLigneTelechargerAudios(() => horsLigneRendre());
    horsLigneVersionAudio = null; // relire la version publiée
    await horsLigneRendre();
    if (etat && resultat.plein) etat.textContent = 'Plus assez de place sur l’appareil. Libère de l’espace puis reprends le téléchargement.';
    else if (etat && !resultat.complet && !resultat.annule) etat.textContent = 'Téléchargement interrompu (réseau). Appuie sur « Reprendre » : les fichiers déjà reçus sont gardés.';
  } catch (_) {
    horsLigneEnCours = null;
    await horsLigneRendre();
    if (etat) etat.textContent = 'Impossible de joindre le serveur. Vérifie ta connexion puis réessaie.';
  }
}

window.addEventListener('online', () => horsLigneRendre());
window.addEventListener('offline', () => horsLigneRendre());
horsLigneEnregistrer();
