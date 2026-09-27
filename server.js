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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅  http://localhost:${PORT}`));
