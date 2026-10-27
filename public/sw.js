/* SPEC 93 — Service Worker de LuxApp : l'app s'ouvre vite et fonctionne hors ligne.
   Servi par server.js (route /sw.js) avec la version de l'app injectée.

   V2 (27/10/2026) — démarrage instantané :
   - l'app (page, code, styles, images, leçons) est servie depuis une copie COHÉRENTE
     installée sur l'appareil : plus aucune attente du réseau au lancement ;
   - une nouvelle version publiée s'installe en arrière-plan, en ne téléchargeant que les
     fichiers modifiés (empreintes du manifeste) ; elle est appliquée au prochain lancement
     ou tout de suite via le bandeau « Mettre à jour » (hors-ligne.js).

   Caches :
   - luxapp-app-<version> : copie complète de l'app pour cette version ;
   - luxapp-audio         : audios (téléchargement complet depuis Réglages, ou au fil de l'écoute) ;
   - luxapp-externe       : SDK Firebase et polices Google (fichiers publics versionnés).
   Jamais mis en cache : requêtes non GET, authentification, Firestore, données personnelles. */
'use strict';

const VERSION = '__VERSION__';
const CACHE_APP = 'luxapp-app-' + VERSION;
const CACHE_AUDIO = 'luxapp-audio';
const CACHE_EXTERNE = 'luxapp-externe';
const INDEX = '/__luxapp-index.json'; // empreintes des fichiers de la copie
const EXTERNES = ['https://www.gstatic.com/firebasejs/', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];
const AUDIO = /\.(mp3|m4a|ogg|wav)$/i;
const PARALLELE = 4; // téléchargements simultanés : la page garde de la bande passante

// ─── Installation : copie de l'app, en ne téléchargeant que ce qui a changé ──
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const manifeste = await (await fetch('/offline-manifest.json', { cache: 'no-store' })).json();
    const cache = await caches.open(CACHE_APP);
    // Copie précédente (version active) et ses empreintes.
    const noms = (await caches.keys()).filter(n => n.startsWith('luxapp-app-') && n !== CACHE_APP);
    let ancienCache = null, anciennes = {};
    for (const nom of noms) {
      const c = await caches.open(nom);
      const index = await c.match(INDEX);
      if (index) { ancienCache = c; anciennes = await index.json(); break; }
    }
    const liste = manifeste.fichiers.map(f => (typeof f === 'string' ? { u: f, h: null } : f));
    let prochain = 0;
    async function ouvrier() {
      while (prochain < liste.length) {
        const f = liste[prochain++];
        if (f.h && anciennes[f.u] === f.h && ancienCache) {
          const copie = await ancienCache.match(f.u);
          if (copie) { await cache.put(f.u, copie); continue; } // inchangé : copie locale
        }
        const r = await fetch(new Request(f.u, { cache: 'reload' }));
        if (!r.ok) throw new Error('installation : ' + f.u);
        await cache.put(f.u, r);
      }
    }
    await Promise.all(Array.from({ length: PARALLELE }, ouvrier));
    const index = {};
    liste.forEach(f => { index[f.u] = f.h; });
    await cache.put(INDEX, new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } }));
    // SDK Firebase et polices : facultatif (copie opaque, sans faire échouer l'installation).
    const externe = await caches.open(CACHE_EXTERNE);
    await Promise.all((manifeste.externes || []).map(async u => {
      try {
        if (await externe.match(u)) return;
        const r = await fetch(new Request(u, { mode: 'no-cors' }));
        if (r.ok || r.type === 'opaque') await externe.put(u, r);
      } catch (_) { /* réessayé au prochain chargement en ligne */ }
    }));
    // Première installation : active tout de suite. Mise à jour : attend le prochain
    // lancement (ou le bouton « Mettre à jour »), pour ne jamais mélanger deux versions.
    // Exception : l'ancienne version 1 (sans empreintes) attendait le réseau au lancement ;
    // on la remplace tout de suite pour supprimer l'écran noir.
    if (!self.registration.active || !ancienCache) await self.skipWaiting();
  })());
});

// Bouton « Mettre à jour » de la page.
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'activer') self.skipWaiting();
});

// ─── Activation : suppression des anciennes versions de l'app ──────────────
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(noms.filter(n => (n.startsWith('luxapp-app-') && n !== CACHE_APP) || n === 'luxapp-donnees').map(n => caches.delete(n)));
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

  if (AUDIO.test(url.pathname)) { event.respondWith(audio(requete, url)); return; }
  event.respondWith(copieDabord(requete, url));
});

// Page, code, styles, images et API de contenu : la copie de la version active,
// sans attendre le réseau. Les « ?v= » des URL désignent la même version de fichier.
async function copieDabord(requete, url) {
  const cache = await caches.open(CACHE_APP);
  const cle = requete.mode === 'navigate' ? '/' : requete;
  const copie = (await cache.match(cle)) || (await cache.match(cle, { ignoreSearch: true }));
  if (copie) return copie;
  // Pas encore dans la copie (premier lancement, fichier ajouté) : réseau, puis copie.
  try {
    const reponse = await fetch(requete);
    if (reponse.ok && reponse.type === 'basic' && !url.pathname.startsWith('/api/')) cache.put(requete, reponse.clone());
    return reponse;
  } catch (_) {
    if (requete.mode === 'navigate') {
      return new Response('LuxApp est hors ligne et pas encore installée sur cet appareil.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
    return url.pathname.startsWith('/api/')
      ? new Response('[]', { status: 503, headers: { 'Content-Type': 'application/json' } })
      : new Response('', { status: 504 });
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
