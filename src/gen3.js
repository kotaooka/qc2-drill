// ===== 計算問題ジェネレータ（v1.2.0：レベル表との差分を埋める追加分） =====
// X̄−s 管理図の係数（c4 から算出。n≦5 は B3 なし）
const CS={2:{A3:2.659,B3:null,B4:3.267},3:{A3:1.954,B3:null,B4:2.568},4:{A3:1.628,B3:null,B4:2.266},5:{A3:1.427,B3:null,B4:2.089},6:{A3:1.287,B3:0.030,B4:1.970},7:{A3:1.182,B3:0.118,B4:1.882},8:{A3:1.099,B3:0.185,B4:1.815},9:{A3:1.032,B3:0.239,B4:1.761},10:{A3:0.975,B3:0.284,B4:1.716}};
// 符号検定表（両側）：N に対する判定個数。少ないほうの個数がこれ以下なら有意
function signVal(N,a){const i=T.sign.n.indexOf(N);return a===0.01?T.sign.v01[i]:T.sign.v05[i];}
const CI=(c,h,d)=>`${fx(c-h,d)} 〜 ${fx(c+h,d)}`;
Object.assign(G,{
g_statdist:{cat:'dist',f(){
  const ty=pick(['t','chiU','chiL','F']);
  if(ty==='t'){const df=rnd(5,20),P=pick([0.10,0.05,0.01]);const v=tVal(df,P);
    return{q:`自由度 φ＝${df} の t 分布で、|t| がある値以上となる確率（両側確率）が ${P} となる値はいくらか。`,
      ch:mc(v,[tVal(df,P===0.10?0.05:0.10),tVal(df+1,P),tVal(df-1,P),P===0.01?tVal(df,0.02):tVal(df,0.02)],x=>x.toFixed(3)),
      ex:`t 表の行 φ＝${df}、列 P＝${P}（両側）を読むと t(${df}, ${P})＝${v.toFixed(3)}。片側 ${P/2} の値でもある。`};}
  if(ty==='chiU'){const df=rnd(4,20),P=pick([0.05,0.025,0.01]);const v=chiVal(df,P);
    return{q:`自由度 φ＝${df} の χ² 分布で、上側確率が ${P} となる値 χ²(${df}, ${P}) はいくらか。`,
      ch:mc(v,[chiVal(df,1-P),chiVal(df+1,P),chiVal(df-1,P),chiVal(df,P===0.05?0.025:0.05)],x=>x.toFixed(3)),
      ex:`χ² 表の行 φ＝${df}、列 P＝${P} を読む。χ² 分布の期待値は φ（＝${df}）なので、上側の値は ${df} より大きい。`};}
  if(ty==='chiL'){const df=rnd(4,20);const v=chiVal(df,0.975);
    return{q:`自由度 φ＝${df} の χ² 分布で、下側確率が 0.025 となる値はいくらか。`,
      ch:mc(v,[chiVal(df,0.025),chiVal(df,0.95),chiVal(df+1,0.975),chiVal(df,0.99)],x=>x.toFixed(3)),
      ex:`下側確率 0.025 は上側確率 0.975 と同じなので、χ² 表の列 P＝0.975 を読み χ²(${df}, 0.975)＝${v.toFixed(3)}。`};}
  const f1=pick([3,4,5,6,8,10]),f2=pick([6,8,10,12,15,20]);const v=fVal(f1,f2,0.05),inv=1/fVal(f2,f1,0.05);
  const isL=Math.random()<.5;
  if(!isL)return{q:`F 分布で、上側確率 0.05 の値 F(${f1}, ${f2}; 0.05) はいくらか（φ1＝${f1} が分子の自由度）。`,
    ch:mc(v,[fVal(f2,f1,0.05),fVal(f1,f2,0.025),inv],x=>x.toFixed(2)),ex:`F 表（5%）で列 φ1＝${f1}、行 φ2＝${f2} を読む。φ1 と φ2 を入れ替えた ${fVal(f2,f1,0.05).toFixed(2)} と取り違えやすい。`};
  return{q:`F 分布で、下側確率 0.05 の値 F(${f1}, ${f2}; 0.95) はいくらか。`,
    ch:mc(inv,[v,fVal(f2,f1,0.05),1/v],x=>x.toFixed(3)),
    ex:`F(φ1, φ2; 1−α)＝1／F(φ2, φ1; α) の関係を使う。1／F(${f2}, ${f1}; 0.05)＝1／${fVal(f2,f1,0.05).toFixed(2)}＝${fx(inv,3)}。`};}},
g_Fci:{cat:'test',f(){
  const n1=rnd(5,11),n2=rnd(5,11),V1=pick([2.4,3.0,3.6,4.8]),V2=pick([1.2,1.5,2.0]);const r=V1/V2,f1=n1-1,f2=n2-1;
  const lo=r/fVal(f1,f2,0.025),hi=r*fVal(f2,f1,0.025);const F=([a,b])=>`${fx(a,2)} 〜 ${fx(b,2)}`;
  return{q:`機械A（n＝${n1}、V＝${V1}）と機械B（n＝${n2}、V＝${V2}）がある。母分散の比 σA²／σB² の信頼率95%の信頼区間はどれか。`,
  ch:combo(F([lo,hi]),[F([r/fVal(f1,f2,0.05),r*fVal(f2,f1,0.05)]),F([r/fVal(f2,f1,0.025),r*fVal(f1,f2,0.025)]),F([lo,r*fVal(f1,f2,0.025)]),F([r/fVal(f2,f1,0.025),hi]),F([lo*0.8,hi*1.25]),F([r-1,r+1])]),
  ex:`F0＝VA／VB＝${fx(r,2)}。下限＝F0／F(${f1}, ${f2}; 0.025)＝${fx(r,2)}／${fVal(f1,f2,0.025).toFixed(2)}＝${fx(lo,2)}、上限＝F0×F(${f2}, ${f1}; 0.025)＝${fx(r,2)}×${fVal(f2,f1,0.025).toFixed(2)}＝${fx(hi,2)}。上限では自由度の順序が入れ替わる。`};}},
g_t2ci:{cat:'test',f(){
  const n1=rnd(5,9),n2=rnd(5,9),V=pick([0.64,1.00,1.44,2.25]),x1=rnd(220,260)/10,x2=+(x1-rnd(5,25)/10).toFixed(1);const d=x1-x2,phi=n1+n2-2,t=tVal(phi,0.05),h=t*sq(V*(1/n1+1/n2));
  return{q:`A（n＝${n1}、x̄＝${x1.toFixed(1)}）と B（n＝${n2}、x̄＝${x2.toFixed(1)}）で、等分散と見なせる合併した不偏分散は V＝${V} であった。母平均の差 μA−μB の信頼率95%の信頼区間はどれか。`,
  ch:mc(h,[1.960*sq(V*(1/n1+1/n2)),tVal(phi,0.10)*sq(V*(1/n1+1/n2)),t*sq(V/(n1+n2)),t*sq(V)],v=>CI(d,v,2)),
  ex:`(x̄A−x̄B) ± t(${phi}, 0.05)√(V(1／nA＋1／nB))＝${fx(d,1)} ± ${t}×√(${V}×${fx(1/n1+1/n2,3)})＝${fx(d,1)} ± ${fx(h,2)}。自由度は nA＋nB−2＝${phi}。`};}},
g_welch:{cat:'test',f(){
  const n1=rnd(5,10),n2=rnd(5,10),V1=pick([0.5,1.0,1.5]),V2=pick([4.0,6.0,8.0]);const x1=rnd(200,220)/10,x2=+(x1+rnd(10,30)/10).toFixed(1);
  const se=sq(V1/n1+V2/n2),t0=(x1-x2)/se;const phi=(V1/n1+V2/n2)**2/((V1/n1)**2/(n1-1)+(V2/n2)**2/(n2-1));
  return{q:`2つの母分散が等しいとは見なせない。A：n＝${n1}、x̄＝${x1.toFixed(1)}、V＝${V1}。B：n＝${n2}、x̄＝${x2.toFixed(1)}、V＝${V2}。ウェルチの検定の検定統計量 t0 はいくらか。`,
  ch:mc(t0,[(x1-x2)/sq(((n1-1)*V1+(n2-1)*V2)/(n1+n2-2)*(1/n1+1/n2))*1.07,(x1-x2)/sq(V1+V2),(x1-x2)/sq((V1+V2)/(n1+n2)),(x1-x2)/sq(V1/n2+V2/n1)],v=>fx(v,2)),
  ex:`t0＝(x̄A−x̄B)／√(VA／nA＋VB／nB)＝${fx(x1-x2,1)}／√(${V1}／${n1}＋${V2}／${n2})＝${fx(t0,2)}。自由度は等価自由度 φ*＝(VA／nA＋VB／nB)²／{(VA／nA)²／(nA−1)＋(VB／nB)²／(nB−1)}＝${fx(phi,1)}。`};}},
g_pairedCI:{cat:'test',f(){
  const n=rnd(6,12),Vd=pick([0.04,0.09,0.16,0.25]),db=+(rnd(2,30)/100).toFixed(2);const t=tVal(n-1,0.05),h=t*sq(Vd/n);
  return{q:`同じ ${n} 個の試料を2つの方法で測り、差 d の平均 d̄＝${db}、不偏分散 Vd＝${Vd} を得た。差の母平均の信頼率95%の信頼区間はどれか。`,
  ch:mc(h,[1.960*sq(Vd/n),tVal(n,0.05)*sq(Vd/n),t*sq(Vd),t*sq(2*Vd/n)],v=>CI(db,v,3)),
  ex:`d̄ ± t(${n-1}, 0.05)√(Vd／n)＝${db} ± ${t}×√(${Vd}／${n})＝${db} ± ${fx(h,3)}。差を1標本として扱うので自由度は n−1。`};}},
g_p2:{cat:'test',f(){
  let n1,n2,x1,x2;do{n1=pick([200,250,300,400]);n2=pick([200,250,300,400]);x1=rnd(Math.round(n1*.06),Math.round(n1*.12));x2=rnd(Math.round(n2*.02),Math.round(n2*.06));}while(x1/n1-x2/n2<0.015);
  const p1=x1/n1,p2=x2/n2,pb=(x1+x2)/(n1+n2),u0=(p1-p2)/sq(pb*(1-pb)*(1/n1+1/n2));const sig=Math.abs(u0)>=1.960;
  const L=(u,g)=>`u0＝${fx(u,2)}、${g?'有意（不適合品率に差がある）':'有意でない'}`;
  const w1=(p1-p2)/sq(p1*(1-p1)/n1+p2*(1-p2)/n2);
  return{q:`ラインA は ${n1} 個中 ${x1} 個、ラインB は ${n2} 個中 ${x2} 個が不適合品であった。母不適合品率に差があるかを有意水準5%（両側）で検定する。正しいものはどれか（正規近似）。`,
  ch:combo(L(u0,sig),[L(u0,!sig),L((p1-p2)/sq(pb*(1-pb)/(n1+n2)),Math.abs((p1-p2)/sq(pb*(1-pb)/(n1+n2)))>=1.96),L((p1-p2)/sq(pb*(1-pb)),false),L(u0*0.8,!sig),L(w1*1.3,!sig),L(u0*1.5,sig)]),
  ex:`pA＝${fx(p1,3)}、pB＝${fx(p2,3)}、合わせた p̄＝(${x1}＋${x2})／(${n1}＋${n2})＝${fx(pb,4)}。u0＝(pA−pB)／√(p̄(1−p̄)(1／nA＋1／nB))＝${fx(u0,2)}。|u0|${sig?'≧':'＜'}1.960。`};}},
g_c1:{cat:'test',f(){
  const l0=pick([2.0,3.0,4.0,5.0]),n=pick([10,20,25,40]);let x,lh,u0;do{x=Math.round(l0*n*rnd(70,135)/100);lh=x/n;u0=(lh-l0)/sq(l0/n);}while(Math.abs(u0)<0.4);
  return{q:`従来、製品1台あたりの不適合数（欠点数）は平均 λ0＝${l0} であった。工程変更後に ${n} 台を調べたところ、不適合数は合計 ${x} 個であった。母不適合数が変化したかを検定するときの u0 はいくらか（正規近似）。`,
  ch:mc(u0,[(lh-l0)/sq(l0),(lh-l0)/sq(lh/n),(x-l0)/sq(l0*n),(lh-l0)/(l0/n)],v=>fx(v,2)),
  ex:`λ̂＝${x}／${n}＝${fx(lh,3)}。ポアソン分布の分散は平均に等しいので、u0＝(λ̂−λ0)／√(λ0／n)＝(${fx(lh,3)}−${l0})／√(${l0}／${n})＝${fx(u0,2)}。両側5%なら |u0| を 1.960 と比較する。`};}},
g_cCI:{cat:'test',f(){
  const n=pick([10,20,25,50]),x=rnd(n*2,n*6);const lh=x/n,h=1.960*sq(lh/n);
  return{q:`${n} 枚の鋼板を調べたところ、キズ（不適合）が合計 ${x} 個あった。1枚あたりの母不適合数の信頼率95%の信頼区間はどれか（正規近似）。`,
  ch:mc(h,[1.960*sq(lh),1.645*sq(lh/n),1.960*lh/sq(n)*0.5],v=>CI(lh,v,2)),
  ex:`λ̂＝${x}／${n}＝${fx(lh,2)}。λ̂ ± 1.960√(λ̂／n)＝${fx(lh,2)} ± 1.960×√(${fx(lh,2)}／${n})＝${fx(lh,2)} ± ${fx(h,2)}。`};}},
g_c2:{cat:'test',f(){
  let n1,n2,x1,x2;do{n1=pick([10,20,25]);n2=pick([10,20,25]);x1=rnd(n1*3,n1*5);x2=rnd(n2*2,n2*3);}while(x1/n1-x2/n2<0.3);const l1=x1/n1,l2=x2/n2,lb=(x1+x2)/(n1+n2),u0=(l1-l2)/sq(lb*(1/n1+1/n2));
  return{q:`塗装工程A では ${n1} 台で不適合数が合計 ${x1} 個、工程B では ${n2} 台で合計 ${x2} 個であった。2つの母不適合数に差があるかを検定するときの u0 はいくらか（正規近似）。`,
  ch:mc(u0,[(l1-l2)/sq(l1/n1+l2/n2)*0.93,(l1-l2)/sq(lb),(x1-x2)/sq(x1+x2),(l1-l2)/sq(lb/(n1+n2)),(l1-l2)/lb,(l1-l2)/sq(lb*(1/n1+1/n2))*1.4],v=>fx(v,2)),
  ex:`λ̂A＝${fx(l1,2)}、λ̂B＝${fx(l2,2)}、合わせた λ̄＝(${x1}＋${x2})／(${n1}＋${n2})＝${fx(lb,3)}。u0＝(λ̂A−λ̂B)／√(λ̄(1／nA＋1／nB))＝${fx(u0,2)}。`};}},
g_xbars:{cat:'cc',f(){
  const n=rnd(5,10),X=rnd(400,600)/10,s=rnd(5,25)/10;const c=CS[n];const isX=Math.random()<.5;
  if(isX){const u=X+c.A3*s;return{q:`群の大きさ n＝${n} の X̄−s 管理図で、X̿＝${X.toFixed(1)}、s̄＝${s.toFixed(1)} であった。X̄管理図の UCL はいくらか（A3＝${c.A3}）。`,
    ch:mc(u,[X+3*s/sq(n),X+c.B4*s,X+c.A3*s/sq(n),X+3*s],v=>fx(v,2)),
    ex:`UCL＝X̿＋A3 s̄＝${X.toFixed(1)}＋${c.A3}×${s.toFixed(1)}＝${fx(u,2)}。A3＝3／(c4√n)。群の大きさが大きい（10程度以上）ときは R より s のほうがばらつきを効率よく推定できる。`};}
  const u=c.B4*s;return{q:`群の大きさ n＝${n} の X̄−s 管理図で s̄＝${s.toFixed(1)} であった。s 管理図の UCL はいくらか（B4＝${c.B4}${c.B3?`、B3＝${c.B3}`:''}）。`,
    ch:mc(u,[c.A3*s,s+3*s/sq(n),2*s,c.B4*s/sq(n)],v=>fx(v,2)),
    ex:`UCL＝B4 s̄＝${c.B4}×${s.toFixed(1)}＝${fx(u,2)}。${c.B3?`LCL＝B3 s̄＝${c.B3}×${s.toFixed(1)}＝${fx(c.B3*s,2)}。`:'n≦5 では B3 がないので LCL は示さない。'}`};}},
g_uchart:{cat:'cc',f(){
  const ub=pick([0.5,0.8,1.2,2.0,2.5]),n=pick([2,4,5,8,10]);const u=ub+3*sq(ub/n);
  return{q:`u 管理図で、単位あたりの平均不適合数 ū＝${ub} であった。大きさ n＝${n}（単位数）の群の上側管理限界 UCL はいくらか。`,
  ch:mc(u,[ub+3*sq(ub),ub+3*ub/sq(n),ub+3*sq(ub*n),ub+2*sq(ub/n)],v=>fx(v,3)),
  ex:`UCL＝ū＋3√(ū／n)＝${ub}＋3√(${ub}／${n})＝${fx(u,3)}。n が群ごとに変わると管理限界も変わる。`};}},
g_varsamp:{cat:'samp',f(){
  const SU=pick([10.0,25.0,50.0]),s=pick([0.2,0.3,0.4,0.5]),n=rnd(4,10),k=rnd(150,200)/100;const XU=SU-k*s;const xb=+(XU+pick([-1,1])*rnd(1,8)/100*s*3).toFixed(3);const ok=xb<=XU;
  const L=(v,g)=>`X̄U＝${fx(v,3)}、ロットは${g?'合格':'不合格'}`;
  return{q:`上限規格 SU＝${SU} が定められた特性について、σ＝${s}（既知）の計量規準型一回抜取検査（JIS Z 9003）を行う。表から n＝${n}、k＝${k.toFixed(2)} を得た。サンプルの平均が x̄＝${xb} のとき、正しいものはどれか。`,
  ch:combo(L(XU,ok),[L(XU,!ok),L(SU+k*s,xb<=SU+k*s),L(SU-k*s/sq(n),xb<=SU-k*s/sq(n)),L(SU-k*s*sq(n)/3,xb<=SU-k*s*sq(n)/3)]),
  ex:`上限合格判定値 X̄U＝SU−kσ＝${SU}−${k.toFixed(2)}×${s}＝${fx(XU,3)}。x̄＝${xb}${ok?'≦':'＞'}X̄U なので${ok?'合格':'不合格'}。下限規格の場合は X̄L＝SL＋kσ で、x̄≧X̄L なら合格。`};}},
g_two_nr:{cat:'doe',f(){
  let a,b,SA,SB,Se,fA,fe,F0,c;do{a=rnd(3,4);b=rnd(3,5);SA=rnd(20,80)/2;SB=rnd(10,50)/2;Se=rnd(6,24)/2;fA=a-1;fe=(a-1)*(b-1);F0=(SA/fA)/(Se/fe);c=fVal(fA,fe,0.05);}while(Math.abs(F0-c)<0.05);
  const ST=SA+SB+Se;const sig=F0>=c;
  const L=(v,g)=>`F0＝${fx(v,2)}、因子Aは${g?'有意':'有意でない'}`;
  return{q:`因子A ${a}水準、因子B ${b}水準で、繰返しのない二元配置実験を行った。ST＝${ST}、SA＝${SA}、SB＝${SB} である。因子Aの分散比と判定（有意水準5%）として正しいものはどれか。`,
  ch:combo(L(F0,sig),[L(F0,!sig),L((SA/fA)/(Se/(a*b-1)),(SA/fA)/(Se/(a*b-1))>=c),L(SA/Se,SA/Se>=c),L((SA/fA)/((Se+SB)/(fe+b-1)),false)]),
  ex:`Se＝ST−SA−SB＝${fx(Se,1)}、φA＝${fA}、φe＝(${a}−1)(${b}−1)＝${fe}。VA＝${fx(SA/fA,2)}、Ve＝${fx(Se/fe,3)}、F0＝${fx(F0,2)}。F(${fA}, ${fe}; 0.05)＝${c} と比べて${sig?'有意':'有意でない'}。`};}},
g_serial:{cat:'reg',f(){
  const wave=pick(['大波','小波']);let N;do{N=rnd(15,40);}while(T.sign.n.indexOf(N)<0);const minor=rnd(Math.max(0,signVal(N,0.05)-3),signVal(N,0.05)+4);const major=N-minor;const pos=Math.random()<.6;
  const nP=pos?major:minor,nM=N-nP;const cv=signVal(N,0.05),sig=Math.min(nP,nM)<=cv;
  const O=[`有意でない（${wave}の相関があるとはいえない）`,`有意。正の${wave}の相関がある`,`有意。負の${wave}の相関がある`,'判定できない（データ数が足りない）'];
  const ans=sig?(nP>nM?O[1]:O[2]):O[0];
  return{q:`2つの時系列データ x、y について${wave==='大波'?'それぞれの中央値で区切り、中央値上の点を除いて':'それぞれ前の値との差をとり、差が0の組を除いて'}、符号が一致した組が ${nP}、一致しなかった組が ${nM} であった。符号検定表（両側5%）を用いた判定として正しいものはどれか。`,
  ch:combo(ans,O),
  ex:`判定に使う個数 N＝${nP}＋${nM}＝${N}。少ないほうの個数 ${Math.min(nP,nM)} を符号検定表の N＝${N} の値 ${cv}（5%）と比べ、${Math.min(nP,nM)}${sig?'≦':'＞'}${cv} なので${sig?'有意':'有意でない'}。${sig?`一致が${nP>nM?'多い':'少ない'}ので${nP>nM?'正':'負'}の相関。`:''}${wave==='大波'?'大波の相関は傾向的な変化の関連を、':'小波の相関は短期的な変動の関連を、'}調べる方法。`};}},
g_regF:{cat:'reg',f(){
  const n=rnd(10,22),Sxx=pick([20,40,50,80]),Syy=pick([30,50,60,90]),r=rnd(40,92)/100;const Sxy=+(r*sq(Sxx*Syy)).toFixed(1);
  const SR=Sxy*Sxy/Sxx,Se=Syy-SR,fe=n-2,F0=SR/(Se/fe),c=fVal(1,fe,0.05),sig=F0>=c;
  const L=(v,g)=>`F0＝${fx(v,2)}、回帰は${g?'有意':'有意でない'}`;
  return{q:`n＝${n} 組のデータで Sxx＝${Sxx}、Syy＝${Syy}、Sxy＝${Sxy} を得た。回帰の分散分析を行ったときの分散比と判定（有意水準5%）として正しいものはどれか。`,
  ch:combo(L(F0,sig),[L(F0,!sig),L(SR/(Se/(n-1)),SR/(Se/(n-1))>=c),L(SR/Se,SR/Se>=c),L((SR/2)/(Se/fe),(SR/2)/(Se/fe)>=c)]),
  ex:`SR＝Sxy²／Sxx＝${fx(SR,2)}（φR＝1）、Se＝Syy−SR＝${fx(Se,2)}（φe＝n−2＝${fe}）。F0＝(SR／1)／(Se／${fe})＝${fx(F0,2)}。F(1, ${fe}; 0.05)＝${c} と比べて${sig?'有意':'有意でない'}。`};}},
g_msa:{cat:'data',f(){
  const sm=pick([0.3,0.5,0.6,0.8]),sp=pick([0.4,0.8,1.2,1.5]);const so=sq(sp*sp+sm*sm);const sot=+so.toFixed(2);const ans=sq(sot*sot-sm*sm);
  return{q:`ある特性を測定したところ、測定値全体の標準偏差は ${sot} であった。測定誤差の標準偏差は ${sm} と分かっている（両者は独立）。製品そのもののばらつき（標準偏差）はいくらか。`,
  ch:mc(ans,[sot-sm,sq(sot*sot+sm*sm),sot*sot-sm*sm,sot/sm],v=>fx(v,2)),
  ex:`分散の加法性より σ測定値²＝σ製品²＋σ測定²。σ製品＝√(${sot}²−${sm}²)＝√(${fx(sot*sot,4)}−${fx(sm*sm,2)})＝${fx(ans,2)}。標準偏差どうしの引き算（${fx(sot-sm,2)}）は誤り。`};}},
g_oc2:{cat:'samp',f(){
  // gen.js の g_oc（合格確率）と対になる問題：p0 での不合格確率＝生産者危険 α を求める
  const n=pick([5,8,10,15,20]),c=pick([0,1,2]),p=pick([0.02,0.05,0.10]);
  let L=0;for(let k=0;k<=c;k++)L+=binP(n,k,p);
  const terms=[...Array(c+1)].map((_,k)=>k===0?`${fx(1-p,2)}^${n}`:`${fx(comb(n,k),0)}×${p}${k>1?'^'+k:''}×${fx(1-p,2)}^${n-k}`).join('＋');
  return{q:`n＝${n}、c＝${c} の計数一回抜取検査で、合格としたい品質の上限を p0＝${p} とする。生産者危険 α（p0 のロットが不合格になる確率）はいくらか（二項分布で計算する）。`,
  ch:mc(1-L,[L,1-binP(n,c,p),1-(1-p)**n,binP(n,c+1,p)],v=>fx(v,3)),
  ex:`L(p0)＝${terms}＝${fx(L,3)}。α＝1−L(p0)＝${fx(1-L,3)}。L(p0) そのもの（${fx(L,3)}）は合格する確率。`};}},
g_relT:{cat:'rel',f(){
  const T=pick([2000,4000,5000,8000,10000]),r=pick([2,4,5,8]),t=pick([50,100,200,400]);
  const M=T/r,R=Math.exp(-t/M);
  return{q:`ある部品（修理系）を総動作時間 ${T} 時間にわたって使用したところ、故障が ${r} 回発生した。故障率が一定であると仮定すると、${t} 時間連続して故障しない確率（信頼度）はいくらか。`,
  ch:mc(R,[1-t/M,t/M,Math.exp(-t*r/(T*2)),Math.exp(-M/(t*10))],v=>fx(v,3)),
  ex:`MTBF＝総動作時間／故障数＝${T}／${r}＝${fx(M,0)} 時間、λ＝1／MTBF。R(t)＝exp(−t／MTBF)＝exp(−${t}／${fx(M,0)})＝exp(−${fx(t/M,3)})＝${fx(R,3)}。1−t／MTBF＝${fx(1-t/M,3)} は近似式で、t が MTBF に比べて十分小さいときだけ近い値になる。`};}},
});
