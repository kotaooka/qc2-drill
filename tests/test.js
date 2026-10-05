// 生成問題の自己検査＋独立検算用サンプル出力
const fs=require('fs');
const T=JSON.parse(fs.readFileSync(__dirname+'/../src/tables.json'));
eval(['bank.js','bank2.js','bank3.js','bank4.js','bank5.js','bank6.js','bank7.js','gen.js','gen2.js','gen3.js'].map(f=>fs.readFileSync(__dirname+'/../src/'+f,'utf8')).join('\n')+';globalThis.G=G;globalThis.KB=KB;globalThis.CATS=CATS;');
let bad=0,short=0;
for(const [id,g] of Object.entries(G)){for(let i=0;i<3000;i++){const r=g.f();
  if(new Set(r.ch).size!==r.ch.length||r.ch.some(c=>/NaN|undefined|Infinity/.test(c))||/NaN|undefined/.test(r.q+r.ex)){bad++;if(bad<6)console.log(id,r.ch,r.q);}
  if(r.ch.length<4){short++;if(short<4)console.log('short',id,r.ch);}}}
const hashq=s=>{let h=5381;for(const c of s)h=(h*33+c.charCodeAt(0))>>>0;return 'k'+h.toString(36);};const ids=new Set();
for(const k of KB){const id=k[4]||hashq(k[1]);if(ids.has(id)){console.log('ID重複',id,k[1]);bad++;}ids.add(id);}
const qs=new Set();for(const k of KB){if(!CATS[k[0]])console.log('cat?',k[0]);if(new Set(k[2]).size!==4)console.log('dup',k[1]);if(qs.has(k[1])){console.log('sameQ（IDが衝突）',k[1]);bad++;}qs.add(k[1]);}
const cnt={};for(const k of KB)cnt[k[0]]=(cnt[k[0]]||0)+1;for(const g of Object.values(G))cnt[g.cat+'(計算)']=(cnt[g.cat+'(計算)']||0)+1;
console.log('bad',bad,'short',short,'KB',KB.length,'G',Object.keys(G).length);console.log(JSON.stringify(cnt));
const out=[];for(const id of ['g_cross','g_t2','g_paired','g_chiCI','g_normInv','g_doeCI','g_t0','g_mtbf','g_cpR','g_rs','g_Fci','g_t2ci','g_welch','g_pairedCI','g_p2','g_c1','g_cCI','g_c2','g_xbars','g_uchart','g_varsamp','g_two_nr','g_serial','g_regF','g_msa','g_statdist','g_oc2','g_relT'])for(let i=0;i<30;i++){const r=G[id].f();out.push({id,q:r.q,a:r.ch[0]});}
fs.writeFileSync(__dirname+'/samples.json',JSON.stringify(out));
// 本試験形式セットの整合性検査
eval(fs.readFileSync(__dirname+'/../src/dai.js','utf8')+fs.readFileSync(__dirname+'/../src/dai2.js','utf8')+fs.readFileSync(__dirname+'/../src/dai3.js','utf8')+';globalThis.DAI=DAI;');
let dbad=0;const KANA='アイウエオカキクケコサシスセソタチツテト';const seen=new Set();
for(const s of DAI){
  if(seen.has(s.id)){dbad++;console.log('id重複',s.id);}seen.add(s.id);
  if(!CATS[s.cat]){dbad++;console.log('cat?',s.id);}
  if(s.type==='ox'){for(const it of s.items){if(typeof it[1]!=='boolean'||!it[2]||(it[3]&&!CATS[it[3]])||(it[3]&&CATS[it[3]].field!==CATS[s.cat].field)){dbad++;console.log('ox不備',s.id,it[0]);}}continue;}
  const nums=[...new Set((s.stem.match(/\{(\d+)\}/g)||[]).map(x=>+x.slice(1,-1)))].sort((a,b)=>a-b);
  if(nums.length!==s.ans.length||nums.some((n,i)=>n!==i+1)){dbad++;console.log('空欄数不一致',s.id,nums,s.ans.length);}
  if(s.ex.length!==s.ans.length){dbad++;console.log('解説数不一致',s.id);}
  if(new Set(s.opts).size!==s.opts.length){dbad++;console.log('選択肢重複',s.id);}
  if(s.opts.length>KANA.length||s.ans.some(a=>a<0||a>=s.opts.length)){dbad++;console.log('正解範囲外',s.id);}
}
const nx=DAI.reduce((a,s)=>a+(s.type==='ox'?s.items.length:s.ans.length),0);
console.log('DAI sets',DAI.length,'items',nx,'bad',dbad);
// 出題範囲（レベル表）の全項目に問題が割り当てられているか
eval(fs.readFileSync(__dirname+'/../src/syllabus.js','utf8')+';globalThis.SYL=SYL;');
const txt=[];KB.forEach(k=>txt.push({cat:k[0],t:k[1]+' '+k[2].join(' ')+' '+k[3]}));
DAI.forEach(d=>{if(d.type==='ox')d.items.forEach(i=>txt.push({cat:i[3]||d.cat,t:i[0]+' '+i[2]}));else d.ans.forEach((a,k)=>txt.push({cat:d.cat,t:d.stem+' '+d.opts[a]+' '+d.ex[k]}));});
let sbad=0,nitems=0;
for(const g of SYL)for(const [name,lv,re,gens] of g.items){nitems++;
  const ng=(gens||[]).filter(id=>{if(!G[id]){console.log('未定義のジェネレータ',id);sbad++;}return G[id]&&CATS[G[id].cat].field===g.f;}).length;
  const nk=txt.filter(x=>CATS[x.cat].field===g.f&&re.test(x.t)).length;
  if(ng+nk===0){sbad++;console.log('問題なし:',g.f,g.h,name);}
  if(process.env.SHOW)console.log(String(nk).padStart(3),String(ng).padStart(2),g.f,name);}
console.log('SYL items',nitems,'uncovered',sbad);
if(dbad||sbad)process.exit(1);
