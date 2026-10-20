'use strict';
// Vérifie la collecte, la priorité LOD et la stabilité des identifiants (sans réseau).
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {textList,outputFile,plan}=require('../tools/audio-mia');
const list=textList();
assert.ok(list.length>500,'Le contenu des leçons doit être collecté');
assert.ok(list.includes('Moien!'),'Premier mot connu');
assert.ok(list.some(t=>t.includes('Wéi geet et')),'Les phrases sont collectées');
// SPEC 87 : le cours du passé composé et les annales doivent être couverts.
assert.ok(list.includes('Gëschter sinn ech um sechs Auer erwächt.'),'exemple de cours A1.2');
assert.ok(list.includes('Fir wéini, wgl.?'),'annales A1.1');
assert.ok(list.includes('Dat ass en Auto.'),'phrase de cours leçon 0');
assert.ok(list.includes('Gudde Moien, Anna!'),'variante d’écriture de la leçon 1');
assert.ok(list.some(t => t.toLowerCase() === "d'faarf"),'article élidé conservé, casse indifférente');

assert.equal(outputFile('Moien!'),outputFile('moien.'));
assert.match(outputFile('Wéi geet et?'),/^mia\/[a-f0-9]{24}\.mp3$/);
assert.notEqual(outputFile('Moien!','mia'),outputFile('Moien!','mil'));
const p=plan();
assert.ok(p.original>300,'Le LOD reste prioritaire');
assert.equal(p.total,p.original+p.generated+p.items.length);
for(const [t,file] of Object.entries(p.index)){
 assert.equal(file,outputFile(t));
 assert.ok(fs.statSync(path.join(__dirname,'../public/audio',file)).size>500);
}
if (process.argv.includes('--strict'))
 assert.equal(p.items.length,0,'La couverture audio doit être à 100 % après génération Mia');
console.log('MP3 Mia : '+p.total+' textes ; '+p.original+' LOD ; '+p.generated+' créés ; '+p.items.length+' manquants.');
