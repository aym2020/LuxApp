// SPEC 73 — node tests/test_audit_correspondances.js
// Tests ciblés de l'audit des correspondances LOD, sur un extrait XML minimal (hors ligne, sans les exports de 100 Mo).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const a = require('../tools/lod/audit-correspondances');

const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'lod73-'));
const entree = (id, corps) => `<entry id="${id}">${corps}</entry>`;
const fr = t => `<targetLanguage lang="fr">${t.map(x => `<translation>${x}</translation>`).join('')}</targetLanguage>`;
const articles = `<lod>
${entree('KAND1', '<lemma>Kand</lemma><ipa>kɑnt</ipa><microStructure><partOfSpeech gen="N">SUBST</partOfSpeech><inflection type="plural"><form nRuleForm="Kanner">Kanner</form></inflection><grammaticalUnit><meaning id="K1">' + fr(['enfant']) + '<examples count="1"><example id="aaaa1111aaaa1111aaaa1111aaaa1111"><text><word>d\'</word><inflectedHeadword>Kanner</inflectedHeadword><word>spillen</word></text></example></examples></meaning></grammaticalUnit></microStructure>')}
${entree('STULL1', '<lemma>Stull</lemma><ipa>ʃtul</ipa><microStructure><partOfSpeech gen="M">SUBST</partOfSpeech><inflection type="plural"><form>Still</form></inflection><grammaticalUnit><meaning id="S1">' + fr(['chaise']) + '</meaning></grammaticalUnit></microStructure>')}
${entree('STILL1', '<lemma>still</lemma><ipa>ʃtil</ipa><microStructure><partOfSpeech>ADJ</partOfSpeech><grammaticalUnit><meaning id="S2">' + fr(['calme', 'silencieux']) + '</meaning></grammaticalUnit></microStructure>')}
${entree('GOEN1', '<lemma nRuleForm="goe">goen</lemma><ipa>ɡˈoːən</ipa><microStructure><partOfSpeech>VRB</partOfSpeech><auxiliaryVerb>sinn</auxiliaryVerb><pastParticiple>gaangen</pastParticiple><pastParticiple>gaang</pastParticiple><grammaticalUnit><meaning id="G1">' + fr(['aller', 'marcher']) + '</meaning></grammaticalUnit></microStructure>')}
${entree('SCHREIWEN1', '<lemma>schreiwen</lemma><ipa>x</ipa><microStructure><partOfSpeech>VRB</partOfSpeech><pastParticiple>geschriwwen</pastParticiple><grammaticalUnit><meaning id="W1">' + fr(['écrire']) + '</meaning></grammaticalUnit></microStructure>')}
${entree('ZWEE2', '<lemma>zwee</lemma><ipa>tsveː</ipa><microStructure><partOfSpeech>NB</partOfSpeech><grammaticalUnit><meaning id="Z1">' + fr(['deux']) + '</meaning></grammaticalUnit></microStructure>')}
${entree('KEEN1', '<lemma nRuleForm="kee">keen</lemma><ipa>keːn</ipa><microStructure><partOfSpeech>PRON</partOfSpeech><grammaticalUnit><meaning id="N1">' + fr(['aucun', 'pas de']) + '</meaning></grammaticalUnit></microStructure>')}
${entree('AWAR1', '<lemma>Awar</lemma><ipa>ɑvˈaː</ipa><microStructure><partOfSpeech gen="M">SUBST</partOfSpeech><grammaticalUnit><meaning id="A1">' + fr(['au revoir']) + '</meaning></grammaticalUnit></microStructure>')}
${entree('AWUER1', '<lemma>Awuer</lemma><ipa>ɑvˈuːɐ̯</ipa><microStructure><partOfSpeech gen="M">SUBST</partOfSpeech><internalLink idRef="AWAR1" relation="Variant">Awar</internalLink></microStructure>')}
${entree('EISCHT1', '<lemma>éischt</lemma><ipa>x</ipa><microStructure><partOfSpeech>NB</partOfSpeech><grammaticalUnit><meaning id="E1">' + fr(['premier']) + '</meaning></grammaticalUnit></microStructure>')}
${entree('FRANSOUS1', '<lemma>Fransous</lemma><ipa>x</ipa><microStructure><partOfSpeech gen="M">SUBST</partOfSpeech><grammaticalUnit><meaning id="F1">' + fr(['Français']) + '</meaning></grammaticalUnit></microStructure>')}
${entree('ACHTZEG1', '<lemma>achtzeg</lemma><ipa>x</ipa><microStructure><partOfSpeech>NB</partOfSpeech><grammaticalUnit><meaning id="H1">' + fr(['quatre-vingt(s)']) + '</meaning></grammaticalUnit></microStructure>')}
${entree('KANNE1', '<lemma>Känn</lemma><ipa>x</ipa><microStructure><partOfSpeech gen="F">SUBST</partOfSpeech><grammaticalUnit><meaning id="X1">' + fr(['menton']) + '</meaning></grammaticalUnit></microStructure>')}
</lod>`;
const tables = `<tables>
<inflection><adjDeclension id="ZWEE2"><basicForms><positive>zwee</positive></basicForms><declension><positive><singular><feminine><nominative>zwou</nominative></feminine></singular></positive></declension></adjDeclension></inflection>
<inflection><adjDeclension id="EISCHT1"><basicForms><positive>éischt</positive></basicForms><declension><positive><singular><masculine><nominative>éischten</nominative></masculine></singular></positive></declension></adjDeclension></inflection>
<inflection><verbConjugation id="GOEN1"><infinitive>goen</infinitive><pastParticiple>gaangen / gaang</pastParticiple><auxiliaryVerb>sinn</auxiliaryVerb><indicative><present><p2>gees</p2><p3>geet (sech)</p3></present><presentPerfect><p1>si gaangen / gaang</p1></presentPerfect></indicative></verbConjugation></inflection>
</tables>`;
fs.writeFileSync(path.join(dossier, 'art.xml'), articles);
fs.writeFileSync(path.join(dossier, 'tab.xml'), tables);

const entrees = a.lireArticles(path.join(dossier, 'art.xml'));
const tab = a.lireTables(path.join(dossier, 'tab.xml'));
const ctx = { entrees, formes: a.indexFormes(entrees, tab), recherche: null, textes: {}, phrasesDispo: new Set(), horsLigne: true };
const c = (lu, fr) => a.classer({ lu, fr, lecons: new Set(['T']), sections: new Set(['cartes']) }, ctx);

// Kanner / Kand : pluriel validé, jamais le son du lemme « Kand ».
let r = c('Kanner', 'des enfants');
assert.equal(r.correspondance, 'FORME_FLECHIE_VALIDEE');
assert.equal(r.id, 'KAND1');
assert.equal(r.audio, 'ENTREE_SANS_AUDIO_EXACT', 'le MP3 de KAND1 prononce « Kand », pas « Kanner »');
assert.equal(r.son, null);
ok('Kanner → pluriel de Kand, sans son direct');

// Still / Stull : la casse départage le pluriel du nom et l'adjectif « still ».
r = c('Still', 'des chaises');
assert.equal(r.correspondance, 'FORME_FLECHIE_VALIDEE');
assert.equal(r.id, 'STULL1');
r = c('still', 'calme');
assert.equal(r.correspondance, 'LEMME_EXACT');
assert.equal(r.id, 'STILL1');
ok('Still (des chaises) → STULL1 ; still (calme) → STILL1');

// gaangen / goen, geschriwwen / schreiwen : participes rattachés, auxiliaire « si » jamais pris pour une forme du verbe.
r = c('gaangen', 'allé à pied');
assert.equal(r.correspondance, 'FORME_FLECHIE_VALIDEE');
assert.equal(r.id, 'GOEN1');
assert.equal(r.audio, 'ENTREE_SANS_AUDIO_EXACT');
assert.equal(c('geschriwwen', 'écrit').id, 'SCHREIWEN1');
assert.ok(!(tab.GOEN1 || []).some(f => f.forme === 'si'), 'auxiliaire des temps composés exclu');
assert.ok(tab.GOEN1.some(f => f.forme === 'geet'), '« geet (sech) » → « geet »');
ok('gaangen → goen, geschriwwen → schreiwen ; « si » exclu des formes de goen');

// zwou / zwee : forme féminine du numéral (table), sens par la catégorie NB.
r = c('zwou', '2 (féminin)');
assert.equal(r.correspondance, 'FORME_FLECHIE_VALIDEE');
assert.equal(r.id, 'ZWEE2');
// kee / keen : variante règle du n de l'article.
r = c('kee', 'pas un (après e)');
assert.equal(r.correspondance, 'FORME_FLECHIE_VALIDEE');
assert.equal(r.id, 'KEEN1');
ok('zwou → zwee (féminin), kee → keen (règle du n)');

// Variante sans traduction : le sens vient de l'entrée liée ; son du lemme exact (hors ligne : non vérifié).
r = c('Awuer!', 'Au revoir');
assert.equal(r.correspondance, 'LEMME_EXACT');
assert.equal(r.id, 'AWUER1');
assert.match(r.justification, /variante de « Awar »/);
assert.match(r.son, /hors ligne/, 'hors ligne : jamais « inexistant » sans requête');
ok('Awuer → variante de Awar ; mode hors ligne sans conclusion sur le son');

// Formes générées : règle du n dérivée = graphie à vérifier ; graphie proche = à vérifier, jamais validée.
r = c('éischte', 'le 1er (ordinal)');
assert.equal(r.correspondance, 'GRAPHIE_A_VERIFIER');
r = c('aachtzeg', '80');
assert.equal(r.correspondance, 'GRAPHIE_A_VERIFIER');
assert.match(r.graphie, /achtzeg/);
assert.equal(r.audio, 'AUCUN', 'aucun son tant que la graphie n\'est pas validée');
ok('éischte (règle du n dérivée) et aachtzeg (≈ achtzeg) : graphies à vérifier, sans son');

// Féminin absent, sans graphie proche de même sens : pas d'entrée.
r = c('Fransousin', 'Française');
assert.equal(r.correspondance, 'PAS_D_ENTREE');
assert.match(r.justification, /Fransous/);
ok('Fransousin : pas d\'entrée, entrée voisine Fransous signalée');

// Accents conservés : « Kann » ne doit pas rejoindre « Känn ».
assert.equal(a.norm('Känn'), 'känn');
assert.notEqual(a.norm('Kann'), a.norm('Känn'));
r = c('Kann', 'menton');
assert.notEqual(r.id, 'KANNE1', 'pas d\'identité lexicale en retirant un accent');
ok('accents luxembourgeois conservés');

// Sens différent : forme connue mais sens LuxApp sans rapport → ambigu, pas d'association.
r = c('Awar', 'chaise');
assert.equal(r.correspondance, 'SENS_AMBIGU');
assert.equal(r.audio, 'AUCUN');
ok('sens différent : relecture humaine, aucune association');

// Rapport réel (s'il a été généré) : statuts valides, aucune association audio écrite.
const json = path.join(__dirname, '../docs/audit-correspondances-lod.json');
if (fs.existsSync(json)) {
  const inv = JSON.parse(fs.readFileSync(json, 'utf8'));
  const ST = ['LEMME_EXACT', 'FORME_FLECHIE_VALIDEE', 'GRAPHIE_A_VERIFIER', 'SENS_AMBIGU', 'PAS_D_ENTREE'];
  const AU = ['SON_EXACT_DISPONIBLE', 'ENTREE_SANS_AUDIO_EXACT', 'AUDIO_INDISPONIBLE', 'AUCUN'];
  for (const x of inv.inventaire) {
    assert.ok(ST.includes(x.correspondance), x.lu);
    assert.ok(AU.includes(x.audio), x.lu);
    if (x.correspondance === 'FORME_FLECHIE_VALIDEE') assert.notEqual(x.audio, 'SON_EXACT_DISPONIBLE', x.lu + ' : forme fléchie sans son du lemme');
  }
  const sons = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/audio/lod.json'), 'utf8'));
  assert.ok(Object.keys(sons).length >= 442, 'les 442 associations approuvées sont conservées');
  ok('rapport : ' + inv.inventaire.length + ' éléments, statuts valides, ' + Object.keys(sons).length + ' associations conservées');
}
fs.rmSync(dossier, { recursive: true });
console.log('Audit des correspondances (SPEC 73) : OK');

function ok(m) { console.log('  ok  ', m); }
