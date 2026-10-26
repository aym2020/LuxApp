/* SPEC 93 — Service Worker de LuxApp : l'app s'ouvre et fonctionne hors ligne.
   Servi par server.js (route /sw.js) avec la version de l'app injectée :
   dès qu'un fichier change, le navigateur installe la nouvelle version.

   Caches :
   - luxapp-app-<version> : code, styles, images, leçons (remplacé à chaque version) ;
   - luxapp-donnees       : dernières réponses valides des API de contenu ;
   - luxapp-audio         : audios (téléchargement complet depuis Réglages, ou au fil de l'écoute) ;
   - luxapp-externe       : SDK Firebase et polices Google (fichiers publics versionnés).
   Jamais mis en cache : requêtes non GET, authentification, Firestore, données personnelles. */
'use strict';

const VERSION = '__VERSION__';
const CACHE_APP = 'luxapp-app-' + VERSION;
const CACHE_DONNEES = 'luxapp-donnees';
const CACHE_AUDIO = 'luxapp-audio';
const CACHE_EXTERNE = 'luxapp-externe';
const EXTERNES = ['https://www.gstatic.com/firebasejs/', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];
const AUDIO = /\.(mp3|m4a|ogg|wav)$/i;

// ─── Installation : copie de toute l'app (hors audios) ─────────────────────
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const reponse = await fetch('/offline-manifest.json', { cache: 'no-store' });
    const manifeste = await reponse.json();
    const cache = await caches.open(CACHE_APP);
    // Par paquets : un échec réseau fait échouer l'installation (nouvel essai plus tard).
    const liste = manifeste.fichiers;
    for (let i = 0; i < liste.length; i += 12) {
      await cache.addAll(liste.slice(i, i + 12).map(u => new Request(u, { cache: 'reload' })));
    }
    // SDK Firebase et polices : facultatif (copie opaque, sans faire échouer l'installation).
    const externe = await caches.open(CACHE_EXTERNE);
    await Promise.all((manifeste.externes || []).map(async u => {
      try {
        if (await externe.match(u)) return;
        const r = await fetch(new Request(u, { mode: 'no-cors' }));
        if (r.ok || r.type === 'opaque') await externe.put(u, r);
      } catch (_) { /* réessayé au prochain chargement en ligne */ }
    }));
    await self.skipWaiting();
  })());
});

// ─── Activation : suppression des anciennes versions de l'app ──────────────
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(noms.filter(n => n.startsWith('luxapp-app-') && n !== CACHE_APP).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

// ─── Requêtes ───────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const requete = event.request;
  if (requete.method !== 'GET') return;
  const url = new URL(requete.url);

  if (url.origin !== self.location.origin) {
    if (EXTERNES.some(prefixe => requete.url.startsWith(prefixe))) event.respondWith(cacheDabord(requete, CACHE_EXTERNE));
    return; // Firestore, authentification… : toujours le réseau
  }
  if (url.pathname === '/sw.js' || url.pathname === '/offline-manifest.json') return;
  if (url.pathname.startsWith('/recette')) return;

  if (requete.mode === 'navigate') { event.respondWith(page(requete)); return; }
  if (url.pathname.startsWith('/api/')) { event.respondWith(reseauDabord(requete)); return; }
  if (AUDIO.test(url.pathname)) { event.respondWith(audio(requete, url)); return; }
  event.respondWith(fichier(requete, url));
});

// Réseau d'abord avec délai : en ligne, toujours la dernière version ; réseau absent
// ou trop lent (plus de 4 s) et copie disponible : la copie, mise à jour en arrière-plan.
async function reseauPuisCopie(requete, cache, cle, copieSecours) {
  const reseau = fetch(requete).then(reponse => {
    if (reponse.ok) cache.put(cle, reponse.clone());
    return reponse;
  });
  reseau.catch(() => {});
  const copie = await copieSecours();
  if (!copie) return reseau;
  const delai = new Promise(resolve => setTimeout(() => resolve(null), 4000));
  try {
    return (await Promise.race([reseau, delai])) || copie;
  } catch (_) {
    return copie;
  }
}

// Page d'accueil (toutes les navigations ouvrent la même page).
async function page(requete) {
  const cache = await caches.open(CACHE_APP);
  try {
    return await reseauPuisCopie(requete, cache, '/', async () => (await cache.match('/')) || (await caches.match('/')));
  } catch (_) {
    return new Response('LuxApp est hors ligne et pas encore installée sur cet appareil.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

// API de contenu (leçons, examens, écriture) : dernière copie valide hors ligne.
async function reseauDabord(requete) {
  const cache = await caches.open(CACHE_DONNEES);
  const secours = async () => (await cache.match(requete)) || (await caches.match(requete));
  try {
    const reseau = fetch(requete).then(reponse => {
      if (reponse.ok && (reponse.headers.get('content-type') || '').includes('json')) cache.put(requete, reponse.clone());
      return reponse;
    });
    reseau.catch(() => {});
    const copie = await secours();
    if (!copie) return await reseau;
    const delai = new Promise(resolve => setTimeout(() => resolve(null), 4000));
    return (await Promise.race([reseau, delai])) || copie;
  } catch (_) {
    return (await secours()) || new Response('[]', { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

// Fichiers de l'app. Avec « ?v= » (version dans l'URL) : la copie suffit.
// Sans version : réseau d'abord (jamais un vieux fichier avec une page récente).
async function fichier(requete, url) {
  const cache = await caches.open(CACHE_APP);
  if (url.search) {
    const exacte = await cache.match(requete);
    if (exacte) return exacte;
  }
  // Hors ligne avec une autre version dans l'URL : la copie installée du même fichier.
  const secours = async () => (await cache.match(requete)) ||
    (await cache.match(requete, { ignoreSearch: true })) || (await caches.match(requete, { ignoreSearch: true }));
  try {
    return await reseauPuisCopie(requete, cache, requete, secours);
  } catch (_) {
    return (await secours()) || new Response('', { status: 504 });
  }
}

// SDK Firebase et polices : adresses versionnées, la copie suffit.
async function cacheDabord(requete, nom) {
  const cache = await caches.open(nom);
  const copie = await cache.match(requete);
  if (copie) return copie;
  const reponse = await fetch(requete);
  if (reponse.ok || reponse.type === 'opaque') cache.put(requete, reponse.clone());
  return reponse;
}

// Audios : copie d'abord. Sinon on télécharge le fichier entier (sans « Range »),
// on le garde, puis on répond (avec un extrait 206 si le lecteur l'a demandé).
async function audio(requete, url) {
  const cache = await caches.open(CACHE_AUDIO);
  const cle = url.origin + url.pathname;
  let copie = await cache.match(cle);
  if (!copie) {
    try {
      const reponse = await fetch(cle);
      if (!reponse.ok) return reponse;
      await cache.put(cle, reponse.clone());
      copie = reponse;
    } catch (_) {
      return new Response('', { status: 504 });
    }
  }
  return extrait(requete, copie);
}
async function extrait(requete, reponse) {
  const plage = requete.headers.get('range');
  const m = plage && /bytes=(\d*)-(\d*)/.exec(plage);
  if (!m) return reponse;
  const donnees = await reponse.arrayBuffer();
  const debut = m[1] ? Number(m[1]) : 0;
  const fin = m[2] ? Math.min(Number(m[2]), donnees.byteLength - 1) : donnees.byteLength - 1;
  return new Response(donnees.slice(debut, fin + 1), {
    status: 206,
    headers: {
      'Content-Type': reponse.headers.get('content-type') || 'audio/mpeg',
      'Content-Range': 'bytes ' + debut + '-' + fin + '/' + donnees.byteLength,
      'Content-Length': String(fin - debut + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}
