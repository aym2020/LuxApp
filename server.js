const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.get('/api/lecons', (req, res) => {
  const dir = path.join(__dirname, 'data/lecons');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const lecons = files.map(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    return JSON.parse(raw);
  });
  res.json(lecons);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅  http://localhost:${PORT}`));
