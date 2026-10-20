'use strict';
// SPEC 75 : migration pure, déterministe et conservatrice des cours existants.
// Seul l'objet "cours" peut changer. On ne corrige pas le luxembourgeois ici :
// chaque paire LOD/exercice reste textuellement inchangée.
const LEX_TABLES = {
  4: /^(Neuf, vieux|Rapide, lent|Mince, épais|Le prix et l'état|Plein, vide)/,
  5: /^Centaines et milliers$/,
  6: /^Pluriel en|^Plus de pluriels$/,
  7: /^Tous les autres pays/,
  8: /nationalités/i,
  10: /^(Les pays de la leçon|Villes, ville et quartiers)$/,
  11: /^Les métiers de la leçon$/,
  12: /^Les lieux avec (an|op)$/,
  13: /^(Les statuts familiaux|Relations, enfants et animaux)$/,
  14: /^(Les mois|Jours ordinaux utiles)$/,
  15: /^Moments de la journée$/,
  16: /^Verbes de la leçon$/,
  17: /^Les expressions clés$/,
  21: /^Les pluriels à retenir$/,
  22: /^Où est-ce que je vais \?$/,
  23: /^Les membres de la famille/,
  24: /^Verbes avec (sinn|hunn)$/,
  25: /^(Les quantités et les emballages|Les produits de l'examen)$/,
};
const PHRASE_TABLES = {
  4: /^Exemples : décrire un objet$/,
  15: /^Exemples à mémoriser$/,
  16: /^La journée de Carla$/,
};
function isPhrase(lu) {
  if (typeof lu !== 'string') return false;
  const s=lu.trim();
  if (/[.!?]$/.test(s)) return true;
  return /^(?:ech|du|hien|hatt|mir|dir|si|hatt|déi|d'|den|de|et|hien|wéi|wat|wou|wien)\b/i.test(s) &&
    s.split(/\s+/).length >= 3 && !s.includes(' / ');
}
function isPairTable(b) {
  return b.type === 'tableau' && Array.isArray(b.entetes) &&
    b.entetes[0] === 'Luxembourgeois' && b.entetes[1] === 'Français' &&
    b.lignes.every(row => Array.isArray(row) && row.length === 2 &&
      row.every(t=>typeof t === 'string' && t.trim()));
}
function normalizeKey(lu) {
  return lu.toLowerCase().replace(/[.,!?;:]/g,'').replace(/\s+/g,' ').trim();
}
function migrant(l) {
  if (!Array.isArray(l.cours) || !Array.isArray(l.unites)) throw Error('Leçon non structurée '+l.id);
  // 1–3 déjà migrées et validées par l'utilisateur. Ne pas les réécrire.
  if (l.cours.every(b=>['regles','lexique','phrases'].includes(b.rubrique))) return JSON.parse(JSON.stringify(l));
  const result=JSON.parse(JSON.stringify(l)); const out=[];
  for (const original of l.cours) {
    const b={...original};
    if (b.type === 'vocab') b.rubrique='lexique';
    else if (b.type === 'dialogue') b.rubrique='phrases';
    else if (b.type === 'exemple') {
      b.type='phrases';b.rubrique='phrases';
    } else if (b.type === 'callout' || b.type === 'texte' || b.type === 'regle') {
      b.rubrique='regles';
    } else if (b.type === 'tableau') {
      const phraseTable = (isPairTable(b) && /^Phrases? à (?:savoir produire|produire)|^À écrire$/.test(b.titre || '')) ||
        (PHRASE_TABLES[l.id] && PHRASE_TABLES[l.id].test(b.titre || ''));
      if (phraseTable && isPairTable(b)) {
        const mots=[],phrases=[];
        for (const row of b.lignes) (isPhrase(row[0]) ? phrases : mots).push(row);
        if (mots.length) out.push({type:'vocab',rubrique:'lexique',unite:b.unite,
          titre:'Mots et expressions à retenir',items:mots});
        if (phrases.length) out.push({type:'phrases',rubrique:'phrases',unite:b.unite,
          titre:'Phrases à connaître',items:phrases});
        continue;
      }
      b.rubrique=LEX_TABLES[l.id] && LEX_TABLES[l.id].test(b.titre || '')
        ? 'lexique' : 'regles';
      if (PHRASE_TABLES[l.id] && PHRASE_TABLES[l.id].test(b.titre || ''))
        b.rubrique='phrases'; // tableaux à colonnes non LU/FR : structure préservée
    } else throw Error('Type de cours inconnu : '+l.id+' / '+b.type);
    out.push(b);
  }
  // Construire des modèles uniquement si les unités n'en ont pas déjà assez :
  // mêmes textes FR/LU que dans les supports existants (unités/scènes).
  for (const unit of l.unites) {
    const already=out.filter(b=>b.rubrique==='phrases' && b.unite===unit.id)
      .flatMap(b=>b.type==='phrases'?(b.items||[]):[]);
    const seen=new Set(already.map(p=>normalizeKey(p[0]))),fresh=[];
    function add(lu,fr) {
      if(typeof lu!=='string'||typeof fr!=='string'||!lu.trim()||!fr.trim())return;
      const k=normalizeKey(lu);
      if(seen.has(k))return;
      seen.add(k);fresh.push([lu,fr]);
    }
    if (already.length < 3) {
      if (Array.isArray(unit.phrase) && unit.phrase.length===2) add(unit.phrase[0],unit.phrase[1]);
      for (const p of unit.phrases || []) {
        if (fresh.length+already.length>=4)break;
        if (Array.isArray(p) && p.length===2)add(p[0],p[1]);
      }
      for (const row of l.scene || []) {
        if (fresh.length+already.length>=4)break;
        if (row.unite!==unit.id || !row.lu || !row.fr || row.lu.length>85)continue;
        if (/[()]/.test(row.fr) || !isPhrase(row.lu))continue;
        add(row.lu,row.fr);
      }
      // Certaines unités bonus n'ont pas de scène : réutiliser une phrase d'écriture déjà validée.
      if (fresh.length+already.length===0) for(const row of l.ecriture||[]){
        if(fresh.length>=2)break;
        if(row.unite===unit.id && isPhrase(row.lu) && row.fr) add(row.lu,row.fr);
      }
    }
    if(fresh.length)out.push({type:'phrases',rubrique:'phrases',unite:unit.id,
      titre:'Phrases à connaître',items:fresh});
  }
  // Une unité bonus peut avoir ses règles dans l'en-tête d'unité et non dans cours.
  // On les reprend à l'identique, avec le même nom et le même exemple.
  for(const unit of l.unites){
    if(!out.some(b=>b.unite===unit.id&&b.rubrique==='regles') && unit.regle){
      out.push({type:'callout',rubrique:'regles',unite:unit.id,titre:unit.titre,
        variant:'retenir',lignes:[unit.regle,...(unit.exemple?[unit.exemple]:[])]});
    }
  }
  result.cours=out;
  return result;
}
function categories(l) {
  const count={regles:0,lexique:0,phrases:0};
  for(const b of l.cours) {
    if(!Object.prototype.hasOwnProperty.call(count,b.rubrique))throw Error('Rubrique invalide : '+l.id);
    count[b.rubrique]++;
    if(b.unite!=null && b.unite!==0 && !l.unites.some(u=>u.id===b.unite))throw Error('Unité inconnue : '+l.id);
  }
  if(Object.values(count).some(x=>x===0))throw Error('Rubrique absente dans la leçon '+l.id+': '+JSON.stringify(count));
  for(const u of l.unites) {
    if(!l.cours.some(b=>b.rubrique==='phrases' && b.unite===u.id))
      throw Error('Phrases absentes unité '+l.id+'/'+u.id);
  }
  return count;
}
module.exports={migrant,categories,isPhrase,isPairTable};
if(require.main===module){
  const fs=require('node:fs'),path=require('node:path');
  const root=path.resolve(__dirname,'../data/lecons');
  let total=0,anomalies=[];
  for(const level of ['A1.1','A1.2']){
    for(const name of fs.readdirSync(path.join(root,level)).filter(x=>/^lecon-\d+\.json$/.test(x))){
      const file=path.join(root,level,name),lesson=JSON.parse(fs.readFileSync(file,'utf8'));
      try {
        categories(lesson);
        const remigre=migrant(lesson);
        if(JSON.stringify(remigre)!==JSON.stringify(lesson))anomalies.push(level+'/'+name+' : non idempotent');
        total++;
      }catch(e){anomalies.push(level+'/'+name+' : '+e.message)}
    }
  }
  if(anomalies.length){console.error(anomalies.join('\n'));process.exit(1)}
  console.log('SPEC 75 : '+total+' cours complets (Règles/Lexique/Phrases), migration idempotente.');
}
