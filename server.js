const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static('public'));
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
app.listen(PORT, () => console.log(`✅  http://localhost:${PORT}`));
