#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {spawn} = require('child_process');
const {lecons,elementsLecon,phraseCle,tableDirecte} = require('./lod/commun');
const root = path.resolve(__dirname, '..');
const audioDir = path.join(root, 'public/audio');
const urlTts = 'https://accessibility-luxembourg.github.io/rhvoice-emscripten-lb/';

function read(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
}
function textList() {
  const found = new Map();
  function add(t) {
    if (typeof t !== 'string') return;
    const cleaned = t.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const key = phraseCle(cleaned);
    if (key && /[a-zà-ÿ]/i.test(cleaned) && !found.has(key)) found.set(key, cleaned);
  }
  for (const {lecon:l} of lecons()) {
    for (const x of elementsLecon(l)) add(x.lu);
    for (const u of l.unites || []) {
      if (Array.isArray(u.phrase)) add(u.phrase[0]);
      for (const pair of u.phrases || []) if (Array.isArray(pair)) add(pair[0]);
    }
    for (const c of l.cours || []) if (c.type === 'tableau') {
      for (const pair of c.lignes || []) if (Array.isArray(pair)) add(pair[0]);
    }
  }
  return [...found.values()];
}
function outputFile(t, voice='mia') {
  if (!['mia','mil'].includes(voice)) throw new Error('Voix inconnue');
  return voice + '/' + crypto.createHash('sha256')
    .update(voice + String.fromCharCode(0) + phraseCle(t)).digest('hex').slice(0,24) + '.mp3';
}
function plan(voice='mia') {
  if (!['mia','mil'].includes(voice)) throw new Error('Voix inconnue');
  const lod = tableDirecte(read(path.join(audioDir, 'lod.json')));
  const phrases = new Set(Object.keys(read(path.join(audioDir, 'lod-phrases.json'))).map(phraseCle));
  const items = [], index = {};
  let original = 0, generated = 0;
  for (const t of textList()) {
    if (lod(t) || phrases.has(phraseCle(t))) {original++; continue;}
    const file = outputFile(t, voice), abs = path.join(audioDir, file);
    if (fs.existsSync(abs) && fs.statSync(abs).size > 500) {index[t] = file; generated++;}
    else items.push({t,file});
  }
  return {items,index,original,generated,total:items.length+original+generated};
}
function save(voice, index) {
  fs.mkdirSync(audioDir,{recursive:true});
  const file = path.join(audioDir,voice+'.json');
  fs.writeFileSync(file+'.tmp', JSON.stringify(Object.fromEntries(Object.entries(index).sort()), null, 2) + '\n');
  fs.renameSync(file+'.tmp', file);
}
async function toMp3(wav, destination) {
  fs.mkdirSync(path.dirname(destination), {recursive:true});
  const tmp = destination+'.tmp.mp3';
  const ff = spawn('ffmpeg', ['-hide_banner','-loglevel','error','-nostdin','-y',
    '-f','wav','-i','pipe:0','-ac','1','-ar','24000','-c:a','libmp3lame','-b:a','64k',tmp]);
  let err = '';
  ff.stderr.on('data', x => {err += x.toString();});
  ff.stdin.on('error', () => {});
  ff.stdin.end(wav);
  const exitCode = await new Promise((resolve,reject) => {ff.on('close',resolve);ff.on('error',reject);});
  if (exitCode !== 0 || !fs.existsSync(tmp) || fs.statSync(tmp).size < 500) {
    fs.rmSync(tmp,{force:true}); throw new Error('Encodage MP3 : '+(err||exitCode));
  }
  fs.renameSync(tmp,destination);
}
async function main() {
  const args = process.argv.slice(2);
  if (args.some(x => !/^--(?:voice=(mia|mil)|limit=\d+|dry-run)$/.test(x))) throw new Error('Option invalide');
  const voice = (args.find(x => x.startsWith('--voice=')) || '--voice=mia').split('=')[1];
  const limit = Number((args.find(x => x.startsWith('--limit=')) || '--limit=0').split('=')[1]);
  const state = plan(voice);
  console.log(state.total+' textes ; '+state.original+' LOD conservés ; '+state.generated+
    ' déjà synthétisés ; '+state.items.length+' MP3 restants.');
  if (args.includes('--dry-run') || !state.items.length) return;
  const {chromium} = require('playwright');
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  let ok = 0, errors = 0;
  try {
    const page = await browser.newPage();
    await page.route(urlTts, route => route.fulfill({status:200,contentType:'text/html',
      body:'<!doctype html><html lang="lb"><meta charset="utf-8"></html>'}));
    await page.goto(urlTts,{waitUntil:'domcontentloaded',timeout:90000});
    await page.evaluate(async () => {
      window.luxAppTts = await import('./src/rhvoice-tts.js');
      await window.luxAppTts.init();
    });
    const batch = state.items.slice(0, limit || undefined);
    for (const item of batch) {
      try {
        const b64 = await page.evaluate(async ({text,voice}) => {
          const sound = await window.luxAppTts.synthesize(text,voice);
          if (!sound || !sound.samples) throw new Error('Aucun échantillon');
          const wav = new Uint8Array(await window.luxAppTts.toWav(sound).arrayBuffer());
          const blocks = [];
          for (let i=0;i<wav.length;i+=16384) blocks.push(String.fromCharCode(...wav.subarray(i,i+16384)));
          return btoa(blocks.join(''));
        },{text:item.t,voice});
        await toMp3(Buffer.from(b64,'base64'), path.join(audioDir,item.file));
        state.index[item.t] = item.file;
        save(voice,state.index);
        ok++;
        if (ok%25===0 || ok===batch.length) console.log('MP3 '+ok+'/'+batch.length);
      } catch (e) {errors++;console.error(item.t+': '+e.message);}
    }
  } finally {await browser.close();}
  console.log(ok+' générés ; '+errors+' échecs');
  if (errors) process.exitCode=2;
}
if (require.main===module) main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
module.exports={textList,outputFile,plan};
