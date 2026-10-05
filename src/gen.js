// ===== 計算問題ジェネレータ（数値は毎回ランダム） =====
// 数値表 T（tables.json）を参照して正解を計算する。表と答えの値が必ず一致するようにするため。
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const fx=(v,d)=>{const s=(Math.round(v*10**d)/10**d).toFixed(d);return Number(s)===0?s.replace('-',''):s;};
const sq=Math.sqrt;
// 正規分布の上側確率（K は小数2桁に丸めて表を引く）
function normUp(K){K=Math.round(K*100)/100;if(K<0)return 1-normUp(-K);if(K>3.09)return 0.001;const r=Math.floor(K*10+1e-9),c=Math.round(K*100)-r*10;return T.norm[r][c];}
function tVal(df,P){const i=T.t.df.indexOf(df);return T.t.v[i][T.t.P.indexOf(P)];}
function chiVal(df,P){const i=T.chi2.df.indexOf(df);return T.chi2.v[i][T.chi2.P.indexOf(P)];}
function fVal(f1,f2,a){return T.F[String(a)][T.F.f2.indexOf(f2)][T.F.f1.indexOf(f1)];}
const CC={2:{A2:1.880,D3:null,D4:3.267,d2:1.128},3:{A2:1.023,D3:null,D4:2.574,d2:1.693},4:{A2:0.729,D3:null,D4:2.282,d2:2.059},5:{A2:0.577,D3:null,D4:2.114,d2:2.326},6:{A2:0.483,D3:null,D4:2.004,d2:2.534},7:{A2:0.419,D3:0.076,D4:1.924,d2:2.704},8:{A2:0.373,D3:0.136,D4:1.864,d2:2.847},9:{A2:0.337,D3:0.184,D4:1.816,d2:2.970},10:{A2:0.308,D3:0.223,D4:1.777,d2:3.078}};
const comb=(n,k)=>{let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return r;};
const binP=(n,k,p)=>comb(n,k)*p**k*(1-p)**(n-k);
// 選択肢を作る：正解の大小順位（最小〜最大）を毎回ランダムに決め、その順位になるように誤答を選ぶ。
// 誤答は「よくある計算ミス」の候補を優先し、足りない側は正解から8〜50%ずらした近傍値で補う。
function mc(ans,wrong,fmt){
  const A=fmt(ans),set=new Set([A]);
  const dec=(String(A).match(/\.(\d+)/)||['',''])[1].length,step=10**-dec;
  const lo=[],hi=[];
  for(const w of wrong){if(w==null||!isFinite(w))continue;const s=fmt(w);if(set.has(s))continue;set.add(s);(w<ans?lo:hi).push([w,s]);}
  // 値域の推定：正解と誤答候補がすべて0〜1なら確率とみなし、近傍値も0〜1に収める
  const all=[ans,...lo.map(x=>x[0]),...hi.map(x=>x[0])];
  const prob=all.every(v=>v>=0&&v<=1),pos=ans>0;
  const near=(side,base=ans)=>{for(let t=0;t<40;t++){
      const d=0.08+Math.random()*0.42;let v=base*(1+side*d);
      if(Math.abs(v-ans)<step)v=ans+side*step*(1+Math.floor(Math.random()*3));
      if(prob&&v>=1)v=base+(1-base)*(0.2+Math.random()*0.7);if(pos&&v<=0)v=base*(0.2+Math.random()*0.6);
      if(Math.abs(v-ans)<step*0.5)continue;
      const s=fmt(v);if(!set.has(s)){set.add(s);return[v,s];}}
    return null;};
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  shuffle(lo);shuffle(hi);
  // 目標の順位 r：正解より小さい誤答の数（0〜3）
  const order=shuffle([0,1,2,3]);
  for(const r of order){
    const L=lo.slice(0,r),H=hi.slice(0,3-r);
    // 近傍値は外側へ連ねて作る（正解のまわりに誤答が集まり、真ん中の値が正解だと見抜かれるのを防ぐ）
    while(L.length<r){const b=Math.min(ans,...L.map(x=>x[0]));const x=near(-1,b);if(!x)break;L.push(x);}
    while(H.length<3-r){const b=Math.max(ans,...H.map(x=>x[0]));const x=near(1,b);if(!x)break;H.push(x);}
    if(L.length===r&&H.length===3-r)return[A,...L.map(x=>x[1]),...H.map(x=>x[1])];
  }
  // どの順位でも作れない場合（値域が狭いなど）は、作れたものから4つにする
  const out=[A,...lo.map(x=>x[1]),...hi.map(x=>x[1])];
  while(out.length<4){const x=near(out.length%2?1:-1)||near(1)||near(-1);if(!x)break;out.push(x[1]);}
  return out.slice(0,4);
}
const G = {
g_norm1:{cat:'dist',f(){
  const mu=pick([10.0,25.0,50.0,100.0]),s=pick([0.2,0.5,1.0,2.0]),K=rnd(80,280)/100;const su=mu+K*s;
  const P=normUp(K);
  return{q:`ある部品の寸法は正規分布 N(${mu}, ${s}²)［mm］に従う。上限規格 ${+su.toFixed(3)} mm を超える不適合品の割合はいくらか。`,
  ch:mc(P,[1-P,2*P,normUp(K*s/(s*s)),normUp(K/2)],v=>fx(v,4)),
  ex:`K＝(${+su.toFixed(3)}−${mu})／${s}＝${fx(K,2)}。正規分布表で K＝${fx(K,2)} の上側確率を読むと P＝${fx(P,4)}（${fx(P*100,2)}%）。`};}},
g_norm2:{cat:'dist',f(){
  const s=pick([0.5,1.0,2.0]);const mu=50.0;const KU=rnd(150,280)/100,KL=rnd(150,280)/100;
  const su=mu+KU*s,sl=mu-KL*s;const PU=normUp(KU),PL=normUp(KL),P=PU+PL;
  return{q:`特性値は N(${mu}, ${s}²) に従う。規格は ${+sl.toFixed(2)}〜${+su.toFixed(2)} である。規格外となる割合（上下合計）はいくらか。`,
  ch:mc(P,[PU,PL,1-P,2*Math.max(PU,PL)],v=>fx(v,4)),
  ex:`上側：KU＝(${+su.toFixed(2)}−${mu})／${s}＝${fx(KU,2)} → ${fx(PU,4)}。下側：KL＝(${mu}−${+sl.toFixed(2)})／${s}＝${fx(KL,2)} → ${fx(PL,4)}。合計 ${fx(P,4)}。`};}},
g_var:{cat:'dist',f(){
  const [a,b,c]=pick([[0.03,0.04,0.05],[0.06,0.08,0.10],[0.05,0.12,0.13],[0.09,0.12,0.15],[0.12,0.16,0.20],[0.15,0.20,0.25]]);
  const [x,y]=Math.random()<.5?[a,b]:[b,a];
  return{q:`穴径 X の標準偏差は ${x} mm、軸径 Y の標準偏差は ${y} mm で、互いに独立である。すきま X−Y の標準偏差はいくらか。`,
  ch:mc(c,[a+b,Math.abs(x-y),sq(Math.abs(b*b-a*a)),c*c],v=>fx(v,v<0.01?4:3)),
  ex:`独立なら V(X−Y)＝V(X)＋V(Y)＝${x}²＋${y}²＝${fx(c*c,4)}。標準偏差は √${fx(c*c,4)}＝${c} mm。差でも分散は足し算。`};}},
g_binom:{cat:'dist',f(){
  const n=pick([5,6,8,10]),p=pick([0.05,0.1,0.2]),k=pick([0,1,2]);const P=binP(n,k,p);
  return{q:`不適合品率 ${p*100}% の工程から ${n} 個を無作為に抜き取る。不適合品がちょうど ${k} 個である確率はいくらか（二項分布）。`,
  ch:mc(P,[p**k*(1-p)**(n-k),binP(n,k+1,p),k>0?binP(n,k-1,p):1-P,1-P],v=>fx(v,4)),
  ex:`P(x＝${k})＝${n}C${k} × ${p}^${k} × ${fx(1-p,2)}^${n-k}＝${comb(n,k)} × ${fx(p**k,6)} × ${fx((1-p)**(n-k),4)}＝${fx(P,4)}。`};}},
g_pois:{cat:'dist',f(){
  const l=pick([0.5,1.0,1.5,2.0,3.0]),k=pick([0,1,2]);const f=k=>Math.exp(-l)*l**k/[1,1,2,6][k];const P=f(k);
  return{q:`1台あたりのキズの数は平均 ${l} 個のポアソン分布に従う。1台のキズがちょうど ${k} 個である確率はいくらか。`,
  ch:mc(P,[f(k+1),1-P,k>0?f(0)+f(1):Math.exp(-1/l),l**k/[1,1,2,6][k]*Math.exp(-l/2)],v=>fx(v,4)),
  ex:`P(x＝${k})＝e^(−${l}) × ${l}^${k}／${k}!＝${fx(Math.exp(-l),4)} × ${fx(l**k,3)}／${[1,1,2,6][k]}＝${fx(P,4)}。`};}},
g_stats:{cat:'data',f(){
  let d,S;do{d=Array.from({length:5},()=>rnd(10,30)/10+10);const m=d.reduce((a,b)=>a+b)/5;S=d.reduce((a,b)=>a+(b-m)**2,0);}while(S<0.2);
  const m=d.reduce((a,b)=>a+b)/5,V=S/4;
  return{q:`次の5個のデータの不偏分散 V を求めよ。\n${d.map(v=>v.toFixed(1)).join('、')}`,
  ch:mc(V,[S,S/5,sq(V)],v=>fx(v,3)),
  ex:`平均 x̄＝${fx(m,2)}。偏差平方和 S＝Σ(x−x̄)²＝${fx(S,3)}。V＝S／(n−1)＝${fx(S,3)}／4＝${fx(V,3)}。標準偏差 s＝√V＝${fx(sq(V),3)}。`};}},
g_ci1:{cat:'test',f(){
  const n=pick([4,9,16,25,36]),s=pick([0.5,1.0,2.0,3.0]),xb=rnd(500,600)/10;const h=1.960*s/sq(n);
  const F=v=>`${fx(xb-v,2)} 〜 ${fx(xb+v,2)}`;
  const opts=[h,1.645*s/sq(n),1.960*s,1.960*s/n];
  return{q:`母標準偏差 σ＝${s} が既知の工程から n＝${n} 個を測定し、x̄＝${xb.toFixed(1)} を得た。母平均の信頼率95%の信頼区間はどれか。`,
  ch:mc(h,opts.slice(1),F),
  ex:`x̄ ± 1.960 × σ／√n＝${xb.toFixed(1)} ± 1.960 × ${s}／√${n}＝${xb.toFixed(1)} ± ${fx(h,2)}。σ既知なので t ではなく正規分布の 1.960 を使う。`};}},
g_ci2:{cat:'test',f(){
  const n=rnd(5,12),V=pick([0.25,0.36,0.64,1.00,1.44,2.25]),xb=rnd(200,300)/10;const t=tVal(n-1,0.05);const h=t*sq(V/n);
  const F=v=>`${fx(xb-v,2)} 〜 ${fx(xb+v,2)}`;
  return{q:`母分散が未知の工程から n＝${n} 個を測定し、x̄＝${xb.toFixed(1)}、V＝${V} を得た。母平均の信頼率95%の信頼区間はどれか。`,
  ch:mc(h,[1.960*sq(V/n),tVal(n,0.05)*sq(V/n),t*sq(V)],F),
  ex:`x̄ ± t(${n-1}, 0.05) × √(V／n)＝${xb.toFixed(1)} ± ${t} × √(${V}／${n})＝${xb.toFixed(1)} ± ${fx(h,2)}。自由度は n−1＝${n-1}。t表は両側確率0.05の列。`};}},
g_u0:{cat:'test',f(){
  const n=pick([4,9,16,25]),s=pick([1.0,2.0,4.0]),mu0=50,diff=rnd(2,14)/10*s/sq(n)*1.5;const xb=+(mu0+diff).toFixed(2);
  const u0=(xb-mu0)/(s/sq(n));const two=Math.random()<.5;const crit=two?1.960:1.645;const sig=Math.abs(u0)>=crit;
  const L=(u,g)=>`u0＝${fx(u,2)}、${g?'有意である（H0を棄却）':'有意でない（H0を棄却できない）'}`;
  const ans=L(u0,sig);const set=[ans,L(u0,!sig),L((xb-mu0)/s,(xb-mu0)/s>=crit),L((xb-mu0)/(s/n),(xb-mu0)/(s/n)>=crit)];
  const ch=[...new Set(set)];for(let i=0;ch.length<4&&i<6;i++){const c2=L(u0*(1.4+i*0.3),i%2===0);if(!ch.includes(c2))ch.push(c2);}
  return{q:`母標準偏差 σ＝${s} は既知。母平均が μ0＝${mu0} から${two?'変化した':'大きくなった'}かを有意水準5%で検定する。n＝${n}、x̄＝${xb} のとき、検定統計量と判定の組合せとして正しいものはどれか。`,
  ch:ch.slice(0,4),
  ex:`u0＝(x̄−μ0)／(σ／√n)＝(${xb}−${mu0})／(${s}／√${n})＝${fx(u0,2)}。${two?'両側検定なので棄却限界は 1.960':'右片側検定なので棄却限界は 1.645'}。|u0|${sig?'≧':'＜'}${crit} より${sig?'有意':'有意でない'}。`};}},
g_chi:{cat:'test',f(){
  const n=rnd(6,15),s02=pick([0.04,0.25,1.00,4.00]),S=+(s02*(n-1)*rnd(50,220)/100).toFixed(2);const chi=S/s02;
  const up=chiVal(n-1,0.025),lo=chiVal(n-1,0.975);
  return{q:`母分散が σ0²＝${s02} から変化したかを検定する。n＝${n} 個のデータから偏差平方和 S＝${S} を得た。検定統計量 χ0² の値はいくらか。`,
  ch:mc(chi,[S/(n-1)/s02,S/sq(s02),S/n/s02],v=>fx(v,2)),
  ex:`χ0²＝S／σ0²＝${S}／${s02}＝${fx(chi,2)}。自由度 ${n-1}、両側5%の棄却域は χ0²≦${lo} または χ0²≧${up}。この例は${(chi<=lo||chi>=up)?'有意（母分散は変化した）':'有意でない'}。`};}},
g_F:{cat:'test',f(){
  const n1=rnd(5,11),n2=rnd(5,11);let V1=pick([2.4,3.6,4.8,6.0,7.2]),V2=pick([1.0,1.2,1.5,2.0]);const F0=V1/V2;const c=fVal(n1-1,n2-1,0.025);const sig=F0>=c;
  const L=(f,cv,g)=>`F0＝${fx(f,2)}、棄却限界 ${fx(cv,2)}、${g?'有意（等分散でない）':'有意でない'}`;
  const ans=L(F0,c,sig);const alt=[L(F0,fVal(n1-1,n2-1,0.05),F0>=fVal(n1-1,n2-1,0.05)),L(F0,fVal(n2-1,n1-1,0.025),F0>=fVal(n2-1,n1-1,0.025)),L(F0,c,!sig),L(sq(F0),c,sq(F0)>=c)];
  const ch=[ans];for(const a of alt)if(!ch.includes(a)&&ch.length<4)ch.push(a);
  return{q:`2台の機械の分散が等しいかを有意水準5%（両側）で検定する。機械A：n＝${n1}、V＝${V1}。機械B：n＝${n2}、V＝${V2}。正しいものはどれか。`,
  ch,
  ex:`F0＝VA／VB＝${V1}／${V2}＝${fx(F0,2)}。大きいほうを分子にして、上側 α／2＝0.025 の F(${n1-1}, ${n2-1}; 0.025)＝${fx(c,2)} と比較する（φ1は分子の自由度）。`};}},
g_pt:{cat:'test',f(){
  const n=pick([100,200,400,500]),P0=pick([0.05,0.08,0.10]),x=Math.round(n*P0*rnd(120,200)/100);const p=x/n;const u0=(p-P0)/sq(P0*(1-P0)/n);
  return{q:`従来の不適合品率は P0＝${P0} であった。工程変更後に ${n} 個を調べたところ不適合品が ${x} 個あった。不適合品率が増えたかを正規近似で検定するときの u0 はいくらか。`,
  ch:mc(u0,[(p-P0)/sq(p*(1-p)/n),(p-P0)/sq(P0*(1-P0)),(p-P0)/(P0*(1-P0)/n)/10],v=>fx(v,2)),
  ex:`p＝${x}／${n}＝${fx(p,3)}。u0＝(p−P0)／√(P0(1−P0)／n)＝(${fx(p,3)}−${P0})／√(${P0}×${fx(1-P0,2)}／${n})＝${fx(u0,2)}。分母は帰無仮説の P0 で計算する。右片側5%なら 1.645 と比較。`};}},
g_xbarR:{cat:'cc',f(){
  const n=rnd(3,6),X=rnd(400,600)/10,R=rnd(10,40)/10;const c=CC[n];const ucl=X+c.A2*R;const isX=Math.random()<.6;
  if(isX)return{q:`群の大きさ n＝${n} の X̄−R 管理図で、総平均 X̿＝${X.toFixed(1)}、R̄＝${R.toFixed(1)} であった。X̄管理図の上側管理限界 UCL はいくらか。`,
  ch:mc(ucl,[X+c.D4*R,X+CC[n+1].A2*R,X+3*R/sq(n),X+c.A2*R/sq(n)],v=>fx(v,2)),
  ex:`UCL＝X̿＋A2R̄＝${X.toFixed(1)}＋${c.A2}×${R.toFixed(1)}＝${fx(ucl,2)}。A2＝3／(d2√n)。n＝${n} の係数は数値表を参照。`};
  const u=c.D4*R;return{q:`群の大きさ n＝${n} の X̄−R 管理図で R̄＝${R.toFixed(1)} であった。R管理図の上側管理限界 UCL はいくらか。`,
  ch:mc(u,[c.A2*R+R,CC[n+1].D4*R,3*R,R+3*R/c.d2],v=>fx(v,2)),
  ex:`UCL＝D4R̄＝${c.D4}×${R.toFixed(1)}＝${fx(u,2)}。n≦6 では D3 が存在しないので LCL は示さない。`};}},
g_cp:{cat:'cc',f(){
  const s=pick([0.5,1.0,2.0]),w=rnd(8,12),SL=50-w*s/2,SU=50+w*s/2;const mu=50+pick([-1,1])*rnd(3,12)/10*s;const Cp=(SU-SL)/(6*s),Cpk=Math.min(SU-mu,mu-SL)/(3*s);
  return{q:`規格 ${SL.toFixed(1)}〜${SU.toFixed(1)}、工程平均 μ＝${mu.toFixed(2)}、標準偏差 σ＝${s} の工程の Cpk はいくらか。`,
  ch:mc(Cpk,[Cp,Math.max(SU-mu,mu-SL)/(3*s),Math.min(SU-mu,mu-SL)/(6*s),(SU-SL)/(3*s)],v=>fx(v,2)),
  ex:`Cp＝(SU−SL)／6σ＝${fx(Cp,2)}。かたよりがあるので Cpk＝min(SU−μ, μ−SL)／3σ＝${fx(Math.min(SU-mu,mu-SL),2)}／${fx(3*s,1)}＝${fx(Cpk,2)}。`};}},
g_np:{cat:'cc',f(){
  const n=pick([50,100,200]),p=pick([0.02,0.04,0.05,0.08]);const np=n*p,u=np+3*sq(np*(1-p));
  return{q:`群の大きさ n＝${n} 一定で np管理図を作成する。平均不適合品率 p̄＝${p} のとき、上側管理限界 UCL はいくらか。`,
  ch:mc(u,[np+3*sq(np),np+3*sq(p*(1-p)/n),np+2*sq(np*(1-p)),p+3*sq(p*(1-p)/n)],v=>fx(v,2)),
  ex:`UCL＝np̄＋3√(np̄(1−p̄))＝${fx(np,1)}＋3√(${fx(np,1)}×${fx(1-p,2)})＝${fx(u,2)}。`};}},
g_r:{cat:'reg',f(){
  const Sxx=pick([40,50,80,100,160]),Syy=pick([20,30,45,60,90]),r0=rnd(55,95)/100*pick([1,-1]);const Sxy=Math.round(r0*sq(Sxx*Syy)*10)/10;const r=Sxy/sq(Sxx*Syy);
  return{q:`n＝20 組のデータで Sxx＝${Sxx}、Syy＝${Syy}、Sxy＝${Sxy} を得た。相関係数 r はいくらか。`,
  ch:mc(r,[r*r,Sxy/Sxx,Sxy/Syy,Sxy/(Sxx+Syy)],v=>fx(v,3)),
  ex:`r＝Sxy／√(Sxx・Syy)＝${Sxy}／√(${Sxx}×${Syy})＝${fx(r,3)}。寄与率は r²＝${fx(r*r,3)}。`};}},
g_b:{cat:'reg',f(){
  const Sxx=pick([10,20,25,40,50]),b=pick([0.4,0.5,0.8,1.2,1.5,2.0]),Sxy=Sxx*b,xb=rnd(20,60)/10,yb=+(b*xb+rnd(5,40)/10).toFixed(2);const a=yb-b*xb;
  const E=(A,B)=>`ŷ＝${fx(A,2)}＋${fx(B,2)}x`.replace('＋-','−');
  const ans=E(a,b);const alt=[E(xb-b*yb,b),E(yb-xb/b,1/b),E(yb,b),E(a,Sxx/Sxy*b*b+0.1)];
  const ch=[ans];for(const x of alt)if(!ch.includes(x)&&ch.length<4)ch.push(x);
  return{q:`x̄＝${xb}、ȳ＝${yb}、Sxx＝${Sxx}、Sxy＝${fx(Sxy,1)} のとき、y の x への回帰式はどれか。`,
  ch,
  ex:`b＝Sxy／Sxx＝${fx(Sxy,1)}／${Sxx}＝${fx(b,2)}。a＝ȳ−b x̄＝${yb}−${fx(b,2)}×${xb}＝${fx(a,2)}。回帰直線は(x̄, ȳ)を通る。`};}},
g_anova1:{cat:'doe',f(){
  const a=rnd(3,5),r=rnd(3,5),SA=rnd(30,120)/2,Se=rnd(20,80)/2;const ST=SA+Se;const fA=a-1,fe=a*(r-1);const F=(SA/fA)/(Se/fe);const c=fVal(fA,fe,0.05);
  return{q:`因子A（${a}水準）、繰返し ${r} 回の一元配置実験を行った。総平方和 ST＝${ST}、Aの平方和 SA＝${SA} である。分散比 F0 はいくらか。`,
  ch:mc(F,[SA/Se,(SA/fA)/(Se/(a*r-1)),(SA/a)/(Se/(a*r-a+1)),(SA/fA)/(ST/(a*r-1))],v=>fx(v,2)),
  ex:`Se＝ST−SA＝${Se}。φA＝${fA}、φe＝${a}×(${r}−1)＝${fe}。VA＝${fx(SA/fA,2)}、Ve＝${fx(Se/fe,3)}。F0＝VA／Ve＝${fx(F,2)}。F(${fA}, ${fe}; 0.05)＝${c} なので${F>=c?'有意':'有意でない'}。`};}},
g_df2:{cat:'doe',f(){
  const a=rnd(2,4),b=rnd(3,4),r=rnd(2,3);const fe=a*b*(r-1);
  return{q:`因子A ${a}水準、因子B ${b}水準、繰返し ${r} 回の二元配置実験を行った。誤差の自由度 φe はいくらか。`,
  ch:mc(fe,[(a-1)*(b-1),a*b*r-1,a*b*r-a-b+1,(a-1)*(b-1)*r],v=>String(Math.round(v))),
  ex:`φT＝abr−1＝${a*b*r-1}、φA＝${a-1}、φB＝${b-1}、φA×B＝${(a-1)*(b-1)}。φe＝φT−φA−φB−φA×B＝ab(r−1)＝${fe}。`};}},
g_rel:{cat:'rel',f(){
  const R1=pick([0.95,0.98,0.99]),R2=pick([0.8,0.85,0.9]),R3=pick([0.8,0.9]);const Rs=R1*(1-(1-R2)*(1-R3));
  return{q:`部品1（信頼度 ${R1}）に、部品2（${R2}）と部品3（${R3}）を並列にしたブロックが直列につながっている。系の信頼度はいくらか。部品は互いに独立とする。`,
  ch:mc(Rs,[R1*R2*R3,R1*(R2+R3)/2,1-(1-R1)*(1-R2*R3),R1*(1-(1-R2)*(1-R3))**2],v=>fx(v,4)),
  ex:`並列部分：1−(1−${R2})(1−${R3})＝${fx(1-(1-R2)*(1-R3),4)}。直列なので積：${R1}×${fx(1-(1-R2)*(1-R3),4)}＝${fx(Rs,4)}。`};}},
g_exp:{cat:'rel',f(){
  const M=pick([500,1000,2000,4000]),t=M*pick([0.2,0.3,0.5]);const R=Math.exp(-t/M);
  return{q:`故障時間が指数分布に従い、MTBF＝${M} 時間の装置がある。${t} 時間故障しない確率（信頼度）はいくらか。`,
  ch:mc(R,[1-t/M,t/M,1-R,Math.exp(-M/t)],v=>fx(v,4)),
  ex:`故障率 λ＝1／MTBF＝${fx(1/M,5)}／h。R(t)＝e^(−λt)＝e^(−${fx(t/M,2)})＝${fx(R,4)}。`};}},
g_avail:{cat:'rel',f(){
  const M=pick([90,180,240,480]),R=pick([10,20,30,60]);const A=M/(M+R);
  return{q:`MTBF＝${M} 時間、MTTR＝${R} 時間の設備のアベイラビリティはいくらか。`,
  ch:mc(A,[R/(M+R),1-R/M,M/(M+2*R)],v=>fx(v,3)),
  ex:`A＝MTBF／(MTBF＋MTTR)＝${M}／${M+R}＝${fx(A,3)}。`};}},
g_oc:{cat:'samp',f(){
  const n=pick([10,20]),c=pick([0,1]),p=pick([0.02,0.05,0.1]);let L=0;for(let k=0;k<=c;k++)L+=binP(n,k,p);
  return{q:`サンプルの大きさ n＝${n}、合格判定個数 c＝${c} の一回抜取検査を行う。ロットの不適合品率が ${p*100}% のとき、ロットが合格する確率 L(p) はいくらか（二項分布）。`,
  ch:mc(L,[binP(n,c,p),1-L,c?binP(n,0,p)*0.9:1-p*n,c?(1-p)**n*0.5+0.5:(1-p)**(n/2)],v=>fx(v,4)),
  ex:`L(p)＝Σ(x＝0〜${c}) nCx p^x (1−p)^(n−x)${c?`＝${fx(binP(n,0,p),4)}＋${fx(binP(n,1,p),4)}`:''}＝${fx(L,4)}。この値がOC曲線上の1点になる。`};}},
};
