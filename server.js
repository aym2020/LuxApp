const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// ─── MODE RECETTE VISUELLE (spec 43) ────────────────────────────────────────
// Uniquement sur une instance dédiée lancée avec RECETTE=1 (autre service ou
// autre port : autre origine, donc stockage local séparé de l'app réelle).
//   - tout le site est protégé par mot de passe (RECETTE_USER / RECETTE_PASS) ;
//   - Firebase est coupé côté serveur : aucune écriture cloud possible ;
//   - le panneau « Outils de test » (dossier recette/) est injecté dans la page.
// Sans RECETTE=1, rien de tout cela n'existe : le dossier recette/ n'est pas servi.
const RECETTE = process.env.RECETTE === '1';
if (RECETTE) {
  // Éviter que les captures de recette mélangent anciens HTML, JS et CSS.
  // Même après un git pull, un onglet déjà ouvert doit être actualisé manuellement.
  app.use((req,res,next) => { res.set('Cache-Control','no-store, max-age=0'); next(); });
  // PWA installable sur Android : Chromium/WebAPK doit pouvoir lire
  // manifeste et icônes hors du contexte HTTP Basic. Ces ressources sont
  // uniquement des métadonnées/images publiques ; le HTML, les scripts,
  // les données et les API restent TOUS derrière le mot de passe.
  app.get('/manifest.json', (req, res) => {
    const manifeste = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/manifest.json'), 'utf8'));
    manifeste.name = 'LuxApp · TEST';
    manifeste.short_name = 'LuxApp TEST';
    res.set('Content-Type', 'application/manifest+json').send(JSON.stringify(manifeste));
  });
  const iconesInstall = [
    'icon-192.png', 'icon-512.png',
    'icon-maskable-192.png', 'icon-maskable-512.png',
    'apple-touch-icon.png'
  ];
  for (const fichier of iconesInstall) {
    app.get('/icons/' + fichier, (req, res) =>
      res.sendFile(path.join(__dirname, 'public/icons', fichier)));
  }
  app.get('/favicon.ico', (req, res) =>
    res.sendFile(path.join(__dirname, 'public/favicon.ico')));
  const utilisateur = process.env.RECETTE_USER || '';
  const motDePasse = process.env.RECETTE_PASS || '';
  app.use((req, res, next) => {
    res.set('X-Robots-Tag', 'noindex, nofollow');
    if (!utilisateur || !motDePasse) return res.status(503).send('Recette non configurée : définir RECETTE_USER et RECETTE_PASS.');
    const attendu = 'Basic ' + Buffer.from(utilisateur + ':' + motDePasse).toString('base64');
    if (req.headers.authorization !== attendu) {
      res.set('WWW-Authenticate', 'Basic realm="LuxApp recette", charset="UTF-8"');
      return res.status(401).send('Accès réservé à la recette.');
    }
    next();
  });
  // Pas de configuration Firebase : l'app reste en mode local (cloud.js).
  app.get('/config.js', (req, res) => {
    // LUXAPP_URL : vraie app, pour le bouton Retour.
    const retour = /^https:\/\/[^\s"'<>]+$/.test(process.env.LUXAPP_URL || '') ? process.env.LUXAPP_URL : null;
    res.type('application/javascript').send('window.APP_CONFIG = { FIREBASE: null, RECETTE: true, RETOUR_LUXAPP: ' + JSON.stringify(retour) + ' };');
  });
  // La vraie page, sans les scripts Firebase, avec le panneau de recette en plus.
  const pageRecette = (req, res) => {
    const html = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8')
      .replace(/\s*<script src="https:\/\/www\.gstatic\.com\/firebasejs[^"]*"><\/script>/g, '')
      .replace('</head>', '  <link rel="stylesheet" href="/recette/recette.css" />\n</head>')
      .replace('</body>', '  <script src="/recette/recette.js"></script>\n</body>');
    res.type('html').send(html);
  };
  app.get(['/', '/index.html'], pageRecette);
  app.use('/recette', express.static(path.join(__dirname, 'recette'), {
    setHeaders(res) { res.set('Cache-Control', 'no-store, max-age=0'); }
  }));
}

// Tests navigateur (tools/critique.sh) : LUX_TESTS=1 masque le portail d'entrée
// (SPEC 63). L'app publique ne publie plus de lien, URL ou UID de recette.
if (!RECETTE && process.env.LUX_TESTS === '1') {
  app.get('/config.js', (req, res) => {
    const config = fs.readFileSync(path.join(__dirname, 'public/config.js'), 'utf8');
    res.type('application/javascript').send(config + '\nwindow.APP_CONFIG.TESTS = true;\n');
  });
}

// ─── HORS LIGNE (SPEC 93) ───────────────────────────────────────────────────
// /offline-manifest.json : liste des fichiers de l'app (mis en cache à
// l'installation du Service Worker) et liste des audios (téléchargement complet
// à la demande, depuis Réglages). La version change dès qu'un fichier de l'app
// ou une donnée de leçon change : le Service Worker se met alors à jour.
const crypto = require('crypto');
const AUDIO_EXT = /\.(mp3|m4a|ogg|wav)$/i;
function listerFichiers(dossier, base) {
  let liste = [];
  for (const nom of fs.readdirSync(dossier).sort()) {
    if (nom.startsWith('.')) continue;
    const complet = path.join(dossier, nom);
    const relatif = base ? base + '/' + nom : nom;
    if (fs.statSync(complet).isDirectory()) liste = liste.concat(listerFichiers(complet, relatif));
    else liste.push(relatif);
  }
  return liste;
}
let manifesteHorsLigne = null;
function construireManifeste() {
  const tous = listerFichiers(path.join(__dirname, 'public'), '');
  const app = tous.filter(f => !AUDIO_EXT.test(f) && f !== 'sw.js' && !f.endsWith('.map'));
  const audios = tous.filter(f => AUDIO_EXT.test(f));
  const empreinte = crypto.createHash('sha1');
  // Empreinte par fichier : le Service Worker ne retélécharge que ce qui a changé.
  const hachage = contenu => crypto.createHash('sha1').update(contenu).digest('hex').slice(0, 12);
  const fichiers = [];
  for (const f of app) {
    const contenu = fs.readFileSync(path.join(__dirname, 'public', f));
    empreinte.update(f).update(contenu);
    fichiers.push({ u: f === 'index.html' ? '/' : '/' + f, h: hachage(contenu) });
  }
  const donnees = crypto.createHash('sha1');
  for (const f of listerFichiers(path.join(__dirname, 'data'), '')) {
    const contenu = fs.readFileSync(path.join(__dirname, 'data', f));
    empreinte.update(f).update(contenu); donnees.update(f).update(contenu);
  }
  const hDonnees = donnees.digest('hex').slice(0, 12);
  // API publiques des contenus pédagogiques (même empreinte que data/).
  ['/api/lecons', '/api/examens', '/api/ecriture', '/api/jeux/lux-match'].forEach(u => fichiers.push({ u, h: hDonnees }));
  const fichiersAudio = audios.map(f => ({ u: '/' + f, t: fs.statSync(path.join(__dirname, 'public', f)).size }));
  const empreinteAudio = crypto.createHash('sha1').update(audios.join('\n')).digest('hex').slice(0, 12);
  // Scripts et feuilles externes de la page (SDK Firebase, polices Google).
  const page = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
  const externes = [...page.matchAll(/(?:src|href)="(https:\/\/(?:www\.gstatic\.com\/firebasejs|fonts\.googleapis\.com\/css)[^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&'));
  return {
    version: empreinte.digest('hex').slice(0, 12),
    externes,
    fichiers,
    audio: { version: empreinteAudio, total: fichiersAudio.reduce((s, a) => s + a.t, 0), fichiers: fichiersAudio }
  };
}
if (!RECETTE) {
  app.get('/offline-manifest.json', (req, res) => {
    if (!manifesteHorsLigne) manifesteHorsLigne = construireManifeste();
    res.set('Cache-Control', 'no-store').json(manifesteHorsLigne);
  });
  app.get('/sw.js', (req, res) => {
    if (!manifesteHorsLigne) manifesteHorsLigne = construireManifeste();
    const code = fs.readFileSync(path.join(__dirname, 'public/sw.js'), 'utf8').replace('__VERSION__', manifesteHorsLigne.version);
    res.set('Cache-Control', 'no-cache').type('application/javascript').send(code);
  });
} else {
  // Recette : jamais de cache hors ligne. Un ancien Service Worker éventuel se désinstalle.
  app.get('/sw.js', (req, res) => {
    res.set('Cache-Control', 'no-store').type('application/javascript').send(
      "self.addEventListener('install',()=>self.skipWaiting());" +
      "self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('luxapp-')).map(n=>caches.delete(n))))" +
      ".then(()=>self.registration.unregister()).then(()=>self.clients.matchAll()).then(c=>c.forEach(x=>x.navigate(x.url)))));");
  });
}

// express.static pose son propre Cache-Control ; en recette le surcharger dans
// setHeaders pour que les JS/CSS soient réellement rechargés après un refresh.
app.use(express.static('public', RECETTE ? {
  setHeaders(res) { res.set('Cache-Control', 'no-store, max-age=0'); }
} : {}));
app.use(express.json());

app.get('/api/ecriture', (req, res) => {
  const raw = fs.readFileSync(path.join(__dirname, 'data/ecriture.json'), 'utf8');
  res.json(JSON.parse(raw));
});

app.get('/api/lecons', (req, res) => {
  const baseDir = path.join(__dirname, 'data/lecons');
  const niveaux = fs.readdirSync(baseDir).sort(); // ['A1.1', 'A1.2']
  const lecons = [];

  niveaux.forEach(niveau => {
    const dir = path.join(baseDir, niveau);
    if (!fs.statSync(dir).isDirectory()) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
    files.forEach(f => {
      const lecon = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      lecon.niveau = niveau;
      lecons.push(lecon);
    });
  });

  // Ordre du parcours : « numero » (numéro affiché) s'il existe, sinon l'id (spec 42).
  // L'id ne change jamais : toute la progression y est attachée.
  const rangNiveau = n => niveaux.indexOf(n);
  lecons.sort((a, b) => rangNiveau(a.niveau) - rangNiveau(b.niveau) || (a.numero || a.id) - (b.numero || b.id));

  res.json(lecons);
});

// SPEC 109 — Lux Match (démo) : profils et dialogues (brouillons signalés dans le jeu).
app.get('/api/jeux/lux-match', (req, res) => {
  const lire = f => JSON.parse(fs.readFileSync(path.join(__dirname, 'data/jeux/lux-match', f), 'utf8'));
  res.json({ archetypes: lire('archetypes-v01.json'), dialogues: lire('dialogues-a11-v01.json') });
});

// Sujets d'examen : même principe que les leçons, un dossier par niveau.
// data/examens/A1.2/examen-01.json -> { ..., niveau: 'A1.2' }
app.get('/api/examens', (req, res) => {
  const baseDir = path.join(__dirname, 'data/examens');
  const examens = [];
  if (!fs.existsSync(baseDir)) return res.json(examens);

  fs.readdirSync(baseDir).sort().forEach(niveau => {
    const dir = path.join(baseDir, niveau);
    if (!fs.statSync(dir).isDirectory()) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
    files.forEach(f => {
      const examen = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      examen.niveau = niveau;
      examens.push(examen);
    });
  });

  // Tri par titre : « Annale 1 », « Annale 2 »… puis « Sujet 1 », « Sujet 2 »…
  // numeric: true pour que « Sujet 10 » passe après « Sujet 2 ».
  examens.sort((a, b) => a.titre.localeCompare(b.titre, 'fr', { numeric: true }));

  res.json(examens);
});

const PORT = process.env.PORT || 3000;
if (RECETTE) console.log('MODE RECETTE actif (progression fictive, sans cloud).');
app.listen(PORT, () => console.log(`✅  http://localhost:${PORT}`));
