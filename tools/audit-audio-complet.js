#!/usr/bin/env node
'use strict';
// SPEC 87 : couverture exacte LOD puis Mia de tous les textes pédagogiques
// ACTIFS, hors brouillons de missions et textes français.
const fs = require('node:fs');
const path = require('node:path');
const {plan, textList} = require('./audio-mia');
const strict = process.argv.includes('--strict');
const write = process.argv.includes('--write');
const state = plan('mia');
const rate = state.total ? (100 * (state.original + state.generated) / state.total).toFixed(2) : '100.00';
const missing = state.items.map(({t, file}) => ({texte:t, fichier:file}));
const report = {
  version:'SPEC 87', date:new Date().toISOString(),
  perimetre:'26 leçons et 8 examens actifs (correction uniquement), pas les missions brouillons',
  textesUniques:state.total,
  lodExact:state.original,
  miaDisponibles:state.generated,
  manquants:state.items.length,
  couverturePourcent:Number(rate),
  manquantsDetail:missing
};
console.log('Audio LOD exact + MIA : '+(state.original+state.generated)+'/'+state.total+
  ' ('+rate+' %) ; '+state.original+' LOD, '+state.generated+' MIA, '+state.items.length+' manquants.');
if (write) {
  const dest=path.join(__dirname, '../docs/audit-audio-complet.json');
  fs.writeFileSync(dest, JSON.stringify(report, null, 2)+'\n');
  console.log('Rapport : '+dest);
}
if (strict && missing.length) {
  console.error('Il manque '+missing.length+' MP3. Relancer le workflow Mia.');
  for (const x of missing.slice(0,15)) console.error('  - '+x.texte);
  process.exitCode = 1;
}
