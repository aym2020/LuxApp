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
