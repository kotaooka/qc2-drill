// ===== 計算問題ジェネレータ（追加分） =====
// 判定付きの選択肢を作る補助：値と判定文の組合せで4択にする
function combo(ans,alts){const ch=[ans];for(const a of alts)if(a&&!ch.includes(a)&&ch.length<4)ch.push(a);return ch;}
Object.assign(G,{
g_normInv:{cat:'dist',f(){
  const [p,K]=pick([[0.05,1.645],[0.025,1.960],[0.01,2.326],[0.005,2.576],[0.001,3.090]]);const mu=pick([20.0,50.0,100.0]),d=pick([2.0,3.0,5.0,6.0]);const su=mu+d;const s=d/K;
  return{q:`工程平均 μ＝${mu}、上限規格 ${su}。上限を超える不適合品率を ${p*100}% 以下にするには、標準偏差σをいくら以下にする必要があるか。`,
  ch:mc(s,[d/[1.645,1.960,2.326,2.576,3.090].find(k=>k!==K&&Math.abs(k-K)<0.4),d*K/10,d/(2*K),d/3],v=>fx(v,3)),
  ex:`上側確率 ${p} に対応する K${p}＝${K.toFixed(3)}（正規分布表を逆に読む）。(SU−μ)／σ≧K より σ≦${d}／${K.toFixed(3)}＝${fx(s,3)}。`};}},
g_lin:{cat:'dist',f(){
  const a=pick([2,3]),b=pick([1,2,4]),sx=pick([0.1,0.2,0.3]),sy=pick([0.1,0.2,0.4]);const v=a*a*sx*sx+b*b*sy*sy;const s=sq(v);
  return{q:`互いに独立な X（標準偏差 ${sx}）と Y（標準偏差 ${sy}）がある。Z＝${a}X＋${b}Y の標準偏差はいくらか。`,
  ch:mc(s,[a*sx+b*sy,sq(a*sx*sx+b*sy*sy),v,sq(sx*sx+sy*sy)],v=>fx(v,3)),
  ex:`V(Z)＝${a}²V(X)＋${b}²V(Y)＝${a*a}×${fx(sx*sx,2)}＋${b*b}×${fx(sy*sy,2)}＝${fx(v,4)}。標準偏差＝√${fx(v,4)}＝${fx(s,3)}。係数は2乗で効く。`};}},
g_sum_n:{cat:'dist',f(){
  const n=pick([4,9,16,25]),s=pick([0.2,0.5,1.0,2.0]),mu=pick([5.0,10.0,20.0]);const st=s*sq(n);
  return{q:`1枚の厚さが平均 ${mu} mm、標準偏差 ${s} mm の板（互いに独立）を ${n} 枚重ねた。全体の厚さの標準偏差はいくらか。`,
  ch:mc(st,[s*n,s/sq(n),s*s*n,s],v=>fx(v,2)),
  ex:`V(合計)＝n×σ²＝${n}×${fx(s*s,2)}＝${fx(n*s*s,2)}。標準偏差＝√${fx(n*s*s,2)}＝${fx(st,2)} mm（σ√n）。平均は ${fx(mu*n,1)} mm。`};}},
g_median:{cat:'data',f(){
  const d=Array.from({length:7},()=>rnd(100,160)/10);const so=[...d].sort((a,b)=>a-b);const med=so[3],R=so[6]-so[0],mean=d.reduce((a,b)=>a+b)/7;
  const isMed=Math.random()<.5;
  if(isMed)return{q:`次の7個のデータの中央値（メディアン）はいくらか。\n${d.map(v=>v.toFixed(1)).join('、')}`,ch:mc(med,[d[3],mean,(so[2]+so[3])/2,(so[0]+so[6])/2],v=>fx(v,1)),
    ex:`大きさの順に並べると ${so.map(v=>v.toFixed(1)).join('、')}。7個の中央（4番目）は ${med.toFixed(1)}。並べ替えずに4番目を取るのはよくある誤り。`};
  return{q:`次の7個のデータの範囲 R はいくらか。\n${d.map(v=>v.toFixed(1)).join('、')}`,ch:mc(R,[Math.abs(d[6]-d[0]),so[5]-so[1],R/2,so[6]-mean],v=>fx(v,1)),
    ex:`R＝最大値−最小値＝${so[6].toFixed(1)}−${so[0].toFixed(1)}＝${fx(R,1)}。`};}},
g_cv:{cat:'data',f(){
  const m=pick([20,40,50,80]),s=+(m*rnd(2,10)/100).toFixed(1);const cv=s/m*100;
  return{q:`平均値 ${m}、標準偏差 ${s} のデータの変動係数 CV はいくらか。`,
  ch:mc(cv,[s*s/m*100,m/s,cv/10,cv*2],v=>fx(v,2)+'%'),
  ex:`CV＝s／x̄×100＝${s}／${m}×100＝${fx(cv,2)}%。`};}},
g_t0:{cat:'test',f(){
  const n=rnd(6,12),V=pick([0.16,0.25,0.36,0.64,1.00]),mu0=pick([10.0,25.0,50.0]);const xb=+(mu0+pick([1,-1])*rnd(2,12)/10*sq(V/n)*2).toFixed(2);
  const t0=(xb-mu0)/sq(V/n);const c=tVal(n-1,0.05);const sig=Math.abs(t0)>=c;
  const L=(t,cv,g)=>`t0＝${fx(t,2)}、棄却限界 ${cv.toFixed(3)}、${g?'有意':'有意でない'}`;
  return{q:`母平均が μ0＝${mu0} から変化したかを有意水準5%（両側）で検定する。n＝${n}、x̄＝${xb}、V＝${V}（母分散未知）。正しいものはどれか。`,
  ch:combo(L(t0,c,sig),[L(t0,c,!sig),L(t0,tVal(n,0.05),Math.abs(t0)>=tVal(n,0.05)),L((xb-mu0)/sq(V),c,Math.abs((xb-mu0)/sq(V))>=c),L(t0,1.960,Math.abs(t0)>=1.96),L(t0,tVal(n-1,0.10),Math.abs(t0)>=tVal(n-1,0.10))]),
  ex:`t0＝(x̄−μ0)／√(V／n)＝(${xb}−${mu0})／√(${V}／${n})＝${fx(t0,2)}。t(${n-1}, 0.05)＝${c}。|t0|${sig?'≧':'＜'}${c} より${sig?'有意（母平均は変化した）':'有意でない'}。`};}},
g_t2:{cat:'test',f(){
  const n1=rnd(5,9),n2=rnd(5,9),S1=+(rnd(20,60)/10*(n1-1)/4).toFixed(2),S2=+(rnd(20,60)/10*(n2-1)/4).toFixed(2);const V=(S1+S2)/(n1+n2-2);
  const d=+(rnd(5,25)/10*sq(V)).toFixed(2);const x1=+(20+d).toFixed(2),x2=20.0;const t0=d/sq(V*(1/n1+1/n2));
  return{q:`2つの方法でデータを取った。A：n＝${n1}、x̄＝${x1}、S＝${S1}。B：n＝${n2}、x̄＝${x2.toFixed(1)}、S＝${S2}（Sは偏差平方和）。等分散を仮定して母平均の差を検定するときの t0 はいくらか。`,
  ch:mc(t0,[d/sq((S1+S2)/(n1+n2)*(1/n1+1/n2)),d/sq(S1/(n1-1)/n1+S2/(n2-1)/n2)*1.15,d/sq(V),d/sq(V/(n1+n2))],v=>fx(v,2)),
  ex:`合併した分散 V＝(S1＋S2)／(n1＋n2−2)＝${fx(S1+S2,2)}／${n1+n2-2}＝${fx(V,3)}。t0＝(x̄A−x̄B)／√(V(1／n1＋1／n2))＝${fx(d,2)}／√(${fx(V,3)}×${fx(1/n1+1/n2,3)})＝${fx(t0,2)}。自由度 ${n1+n2-2} の t 表で判定する（両側5%：${tVal(n1+n2-2,0.05)}）。`};}},
g_paired:{cat:'test',f(){
  const n=rnd(6,10),Vd=pick([0.04,0.09,0.16,0.25]),db=+(rnd(5,30)/10*sq(Vd/n)).toFixed(2);const Sd=+(Vd*(n-1)).toFixed(3);const t0=db/sq(Vd/n);const c=tVal(n-1,0.05);
  return{q:`同じ ${n} 個の試料を2台の測定器で測り、差 d を求めたところ d̄＝${db}、Sd＝${Sd}（dの偏差平方和）であった。検定統計量 t0 はいくらか。`,
  ch:mc(t0,[db/sq(Sd/n/n),db/sq(Vd),db/sq(Sd/(n-1)/(2*n)),db/sq(Sd/n)],v=>fx(v,2)),
  ex:`Vd＝Sd／(n−1)＝${Sd}／${n-1}＝${fx(Vd,3)}。t0＝d̄／√(Vd／n)＝${db}／√(${fx(Vd,3)}／${n})＝${fx(t0,2)}。自由度 ${n-1}、両側5%の t＝${c} なので${Math.abs(t0)>=c?'有意（測定器間に差がある）':'有意でない'}。`};}},
g_chiCI:{cat:'test',f(){
  const n=rnd(6,15),S=+(rnd(20,80)/10*(n-1)/5).toFixed(2);const up=chiVal(n-1,0.025),lo=chiVal(n-1,0.975);const L=S/up,U=S/lo;
  const F=([a,b])=>`${fx(a,3)} 〜 ${fx(b,3)}`;const ans=F([L,U]);
  return{q:`n＝${n} 個のデータの偏差平方和が S＝${S} であった。母分散 σ² の信頼率95%の信頼区間はどれか。`,
  ch:combo(ans,[F([S/lo,S/up].sort((a,b)=>a-b)),F([S/chiVal(n,0.025),S/chiVal(n,0.975)]),F([S/chiVal(n-1,0.05),S/chiVal(n-1,0.95)]),F([L/(n-1)*n,U/(n-1)*n])]),
  ex:`下限＝S／χ²(${n-1}, 0.025)＝${S}／${up}＝${fx(L,3)}、上限＝S／χ²(${n-1}, 0.975)＝${S}／${lo}＝${fx(U,3)}。分母が大きいほうが下限になる点に注意。`};}},
g_ptCI:{cat:'test',f(){
  const n=pick([100,200,400,500]),x=rnd(Math.round(n*0.03),Math.round(n*0.12));const p=x/n;const h=1.960*sq(p*(1-p)/n);const F=v=>`${fx(p-v,3)} 〜 ${fx(p+v,3)}`;
  return{q:`${n} 個を調べたところ不適合品が ${x} 個あった。母不適合品率の信頼率95%の信頼区間（正規近似）はどれか。`,
  ch:mc(h,[1.645*sq(p*(1-p)/n),1.960*sq(p*(1-p)),1.960*sq(p/n)],F),
  ex:`p＝${x}／${n}＝${fx(p,3)}。p ± 1.960√(p(1−p)／n)＝${fx(p,3)} ± 1.960×√(${fx(p,3)}×${fx(1-p,3)}／${n})＝${fx(p,3)} ± ${fx(h,3)}。`};}},
g_cross:{cat:'test',f(){
  // 2×2分割表のχ²（補正なし）
  let a,b,c,d;do{a=rnd(30,60);b=rnd(3,15);c=rnd(30,60);d=rnd(3,20);}while(Math.abs(b/(a+b)-d/(c+d))<0.04);
  const N=a+b+c+d,r1=a+b,r2=c+d,k1=a+c,k2=b+d;const E=[r1*k1/N,r1*k2/N,r2*k1/N,r2*k2/N],O=[a,b,c,d];const chi=O.reduce((s,o,i)=>s+(o-E[i])**2/E[i],0);const sig=chi>=3.841;
  const L=(v,g)=>`χ0²＝${fx(v,2)}、${g?'有意（ラインと不適合の発生は関連がある）':'有意でない'}`;
  return{q:`2つのラインの製品を調べた。\nラインA：適合 ${a}、不適合 ${b}\nラインB：適合 ${c}、不適合 ${d}\n分割表による検定（有意水準5%、補正なし）の結果として正しいものはどれか。`,
  ch:combo(L(chi,sig),[L(chi,!sig),L(O.reduce((s,o,i)=>s+(o-E[i])**2/o,0),O.reduce((s,o,i)=>s+(o-E[i])**2/o,0)>=3.841),L(chi/2,chi/2>=3.841),L(chi*2,chi*2>=3.841),L(chi,chi>=5.991)]),
  ex:`期待度数＝行計×列計／総計：${E.map(e=>fx(e,1)).join('、')}。χ0²＝Σ(観測−期待)²／期待＝${fx(chi,2)}。自由度 (2−1)(2−1)＝1、χ²(1, 0.05)＝3.841 と比較して${sig?'有意':'有意でない'}。`};}},
g_xbarLCL:{cat:'cc',f(){
  const n=rnd(3,6),X=rnd(400,600)/10,R=rnd(10,40)/10;const c=CC[n];const lcl=X-c.A2*R;
  return{q:`群の大きさ n＝${n} の X̄−R 管理図で、X̿＝${X.toFixed(1)}、R̄＝${R.toFixed(1)} であった。X̄管理図の下側管理限界 LCL はいくらか。`,
  ch:mc(lcl,[X-c.D4*R*0.5,X-CC[n+1].A2*R,X-3*R/sq(n),X-c.A2*R*2],v=>fx(v,2)),
  ex:`LCL＝X̿−A2R̄＝${X.toFixed(1)}−${c.A2}×${R.toFixed(1)}＝${fx(lcl,2)}。`};}},
g_sigmaR:{cat:'cc',f(){
  const n=rnd(2,6),R=rnd(10,60)/10;const c=CC[n];const s=R/c.d2;
  return{q:`群の大きさ n＝${n} の X̄−R 管理図が管理状態にあり、R̄＝${R.toFixed(1)} であった。工程の標準偏差 σ の推定値はいくらか。`,
  ch:mc(s,[R/sq(n),R*c.d2,R/CC[n+1].d2,R/6],v=>fx(v,3)),
  ex:`σ̂＝R̄／d2＝${R.toFixed(1)}／${c.d2}＝${fx(s,3)}。工程能力指数の計算に使う。`};}},
g_cpR:{cat:'cc',f(){
  const n=pick([4,5]),R=rnd(10,30)/10;const c=CC[n];const s=R/c.d2;const W=+(s*6*rnd(100,160)/100).toFixed(1);const cp=W/(6*s);
  return{q:`規格幅（SU−SL）が ${W} の特性について、n＝${n} の X̄−R 管理図が管理状態で R̄＝${R.toFixed(1)} であった。Cp はいくらか。`,
  ch:mc(cp,[W/(6*R),W/(3*s),W/(6*R/sq(n)),W/(6*s*sq(n))],v=>fx(v,2)),
  ex:`σ̂＝R̄／d2＝${R.toFixed(1)}／${c.d2}＝${fx(s,3)}。Cp＝(SU−SL)／6σ̂＝${W}／${fx(6*s,3)}＝${fx(cp,2)}。`};}},
g_pchart:{cat:'cc',f(){
  const n=pick([50,100,200,400]),p=pick([0.02,0.03,0.05,0.08]);const u=p+3*sq(p*(1-p)/n);
  return{q:`p管理図で平均不適合品率 p̄＝${p} であった。群の大きさ n＝${n} の群の上側管理限界 UCL はいくらか。`,
  ch:mc(u,[p+3*sq(p*(1-p)),p+3*sq(p/n),p+2*sq(p*(1-p)/n),p+3*p*(1-p)/sq(n)],v=>fx(v,4)),
  ex:`UCL＝p̄＋3√(p̄(1−p̄)／n)＝${p}＋3√(${p}×${fx(1-p,2)}／${n})＝${fx(u,4)}。`};}},
g_cchart:{cat:'cc',f(){
  const c=pick([4,6.25,9,12,16]);const u=c+3*sq(c),l=c-3*sq(c);
  return{q:`一定面積あたりのキズの数を c 管理図で管理する。平均 c̄＝${c} のとき、上側管理限界 UCL はいくらか。`,
  ch:mc(u,[c+3*c,c+2*sq(c),c+sq(c),c*3],v=>fx(v,2)),
  ex:`ポアソン分布の分散＝平均なので、UCL＝c̄＋3√c̄＝${c}＋3×${fx(sq(c),2)}＝${fx(u,2)}。LCL＝c̄−3√c̄＝${fx(l,2)}${l<0?'（負なので示さない）':''}。`};}},
g_rs:{cat:'cc',f(){
  const d=Array.from({length:6},()=>rnd(100,130)/10);const rs=d.slice(1).map((v,i)=>Math.abs(v-d[i]));const rb=rs.reduce((a,b)=>a+b)/5;const s=rb/1.128;
  return{q:`X−Rs 管理図用に6個のデータを得た。移動範囲の平均 R̄s から推定した σ はいくらか（d2＝1.128）。\n${d.map(v=>v.toFixed(1)).join('、')}`,
  ch:mc(s,[rb,rb/sq(2),rb/1.693,rs.reduce((a,b)=>a+b)/6/1.128],v=>fx(v,3)),
  ex:`移動範囲：${rs.map(v=>fx(v,1)).join('、')}（5個）。R̄s＝${fx(rb,3)}。σ̂＝R̄s／1.128＝${fx(s,3)}。移動範囲は隣り合う2個の範囲なので n＝2 の d2 を使う。`};}},
g_regSe:{cat:'reg',f(){
  const Sxx=pick([10,20,25,40]),Syy=pick([30,50,60,80]),r=rnd(60,95)/100;const Sxy=+(r*sq(Sxx*Syy)).toFixed(1);const SR=Sxy*Sxy/Sxx,Se=Syy-SR;
  return{q:`Sxx＝${Sxx}、Syy＝${Syy}、Sxy＝${Sxy} のとき、単回帰分析の残差平方和 Se はいくらか。`,
  ch:mc(Se,[SR,Syy-Sxy*Sxy/Syy,Syy-Sxy,Syy-Sxy/Sxx],v=>fx(v,2)),
  ex:`回帰による平方和 SR＝Sxy²／Sxx＝${Sxy}²／${Sxx}＝${fx(SR,2)}。Se＝Syy−SR＝${Syy}−${fx(SR,2)}＝${fx(Se,2)}。寄与率＝SR／Syy＝${fx(SR/Syy,3)}。`};}},
g_doeCI:{cat:'doe',f(){
  const a=rnd(3,4),r=rnd(3,5),Ve=pick([0.5,0.8,1.2,2.0]),m=rnd(200,300)/10;const fe=a*(r-1);const t=tVal(fe,0.05);const h=t*sq(Ve/r);const F=v=>`${fx(m-v,2)} 〜 ${fx(m+v,2)}`;
  return{q:`${a}水準・繰返し ${r} 回の一元配置実験で、最適水準のデータの平均が ${m.toFixed(1)}、誤差分散 Ve＝${Ve} であった。最適水準の母平均の95%信頼区間はどれか。`,
  ch:mc(h,[t*sq(Ve/(a*r)),tVal(a*r-1,0.05)*sq(Ve/r),1.960*sq(Ve/r),t*sq(Ve)],F),
  ex:`φe＝${a}×(${r}−1)＝${fe}、t(${fe}, 0.05)＝${t}。平均 ± t√(Ve／r)＝${m.toFixed(1)} ± ${t}×√(${Ve}／${r})＝${m.toFixed(1)} ± ${fx(h,2)}。`};}},
g_doeDf:{cat:'doe',f(){
  const a=rnd(3,5),b=rnd(3,4);const fe=(a-1)*(b-1);
  return{q:`因子A ${a}水準、因子B ${b}水準で繰返しのない二元配置実験を行った。誤差の自由度 φe はいくらか。`,
  ch:mc(fe,[a*b-1,a*b-a-b,a*(b-1),(a-1)+(b-1)],v=>String(Math.round(v))),
  ex:`φT＝ab−1＝${a*b-1}、φA＝${a-1}、φB＝${b-1}。φe＝φT−φA−φB＝(a−1)(b−1)＝${fe}。交互作用は誤差と分離できない。`};}},
g_parN:{cat:'rel',f(){
  const R=pick([0.7,0.8,0.9]),n=pick([2,3]);const Rs=1-(1-R)**n;
  return{q:`信頼度 ${R} の同じ要素を ${n} 個並列につないだ系の信頼度はいくらか（要素は互いに独立）。`,
  ch:mc(Rs,[R**n,1-(1-R)*n,R*n>1?1-(1-R)/n:R*n,1-R**n],v=>fx(v,4)),
  ex:`並列系は「全部が故障したときだけ系が故障」なので、R＝1−(1−${R})^${n}＝1−${fx((1-R)**n,4)}＝${fx(Rs,4)}。`};}},
g_mtbf:{cat:'rel',f(){
  const units=pick([10,20,50]),hrs=pick([500,1000,2000]),k=rnd(2,8);const T2=units*hrs;const lam=k/T2,M=T2/k;
  const isM=Math.random()<.5;
  return{q:`${units} 台の装置をそれぞれ ${hrs} 時間稼働させたところ、合計 ${k} 回故障した（故障はすぐに修理）。${isM?'MTBF':'故障率 λ（/時間）'}はいくらか。`,
  ch:isM?mc(M,[hrs/k,T2/(k+1),units*k,hrs],v=>fx(v,0)+' 時間'):mc(lam,[k/hrs,k/units/1e3,1/hrs,k/(T2*2)],v=>v.toExponential(2).replace('e-','×10^−').replace('e+','×10^')),
  ex:`総稼働時間＝${units}×${hrs}＝${T2} 時間。MTBF＝総稼働時間／故障数＝${T2}／${k}＝${fx(M,0)} 時間。λ＝1／MTBF＝${lam.toExponential(2).replace('e-','×10^−')}／時間。`};}},
g_aoq:{cat:'samp',f(){
  const n=pick([10,20]),p=pick([0.02,0.05,0.1]);const L=binP(n,0,p);
  return{q:`n＝${n}、c＝0 の一回抜取検査で、不適合品率 ${p*100}% のロットが不合格になる確率はいくらか（二項分布）。`,
  ch:mc(1-L,[L,n*p,1-(1-p)**(n/2),p],v=>fx(v,4)),
  ex:`合格確率 L(p)＝(1−p)^n＝${fx(1-p,2)}^${n}＝${fx(L,4)}。不合格になる確率＝1−L(p)＝${fx(1-L,4)}。`};}},
});
