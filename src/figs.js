// ===== 解説の図（SVG） =====
// 問題文・解説の言葉から図を1つ選んで、解説の下に表示する。色はテーマの色（CSS 変数）に従う
const FIG={
 norm(o){const K=o.k!=null?Math.min(3.2,Math.max(0.2,o.k)):1.96,two=o.two;
  const X=z=>20+(z+3.6)/7.2*280,Y=z=>132-112*Math.exp(-z*z/2),pts=[];for(let z=-3.6;z<=3.6001;z+=0.08)pts.push(`${X(z).toFixed(1)},${Y(z).toFixed(1)}`);
  const area=(a,b)=>{const p=[`${X(a).toFixed(1)},132`];for(let z=a;z<=b+1e-9;z+=0.04)p.push(`${X(z).toFixed(1)},${Y(z).toFixed(1)}`);p.push(`${X(b).toFixed(1)},132`);return `<polygon class="f-hl" points="${p.join(' ')}"/>`;};
  return {svg:`${area(K,3.6)}${two?area(-3.6,-K):''}<polyline class="f-line" points="${pts.join(' ')}"/><line class="f-axis" x1="16" y1="132" x2="304" y2="132"/>
   <line class="f-dash" x1="${X(0)}" y1="20" x2="${X(0)}" y2="132"/><text x="${X(0)}" y="148" text-anchor="middle">0（平均）</text>
   <line class="f-mark" x1="${X(K)}" y1="${Y(K)-8}" x2="${X(K)}" y2="136"/><text class="f-hlt" x="${X(K)}" y="148" text-anchor="middle">${two?'+':''}${K.toFixed(2)}</text>
   ${two?`<line class="f-mark" x1="${X(-K)}" y1="${Y(K)-8}" x2="${X(-K)}" y2="136"/><text class="f-hlt" x="${X(-K)}" y="148" text-anchor="middle">−${K.toFixed(2)}</text>`:''}
   <text class="f-hlt" x="${X(Math.min(K+0.9,3.1))}" y="${Y(K)-14}" text-anchor="middle">${two?'α/2':'P'}</text>${two?`<text class="f-hlt" x="${X(-Math.min(K+0.9,3.1))}" y="${Y(K)-14}" text-anchor="middle">α/2</text>`:''}`,
   cap:two?'両側検定の棄却域：|検定統計量| が棄却限界値以上なら有意（赤い部分の面積が α）':`標準正規分布で K＝${K.toFixed(2)} より右側の面積（赤）が上側確率 P。正規分布表で読む値`};},
 cap(){const X=x=>20+x*28,Y=(x,m)=>128-100*Math.exp(-((x-m)**2)/2),pts=[];for(let x=0;x<=10.001;x+=0.1)pts.push(`${X(x).toFixed(1)},${Y(x,5.8).toFixed(1)}`);
  const sh=[`${X(8.5)},128`];for(let x=8.5;x<=10.001;x+=0.05)sh.push(`${X(x).toFixed(1)},${Y(x,5.8).toFixed(1)}`);sh.push(`${X(10)},128`);
  return {svg:`<polygon class="f-hl" points="${sh.join(' ')}"/><polyline class="f-line" points="${pts.join(' ')}"/><line class="f-axis" x1="16" y1="128" x2="304" y2="128"/>
   <line class="f-mark" x1="${X(1.5)}" y1="18" x2="${X(1.5)}" y2="132"/><text x="${X(1.5)}" y="146" text-anchor="middle">SL</text>
   <line class="f-mark" x1="${X(8.5)}" y1="18" x2="${X(8.5)}" y2="132"/><text x="${X(8.5)}" y="146" text-anchor="middle">SU</text>
   <line class="f-dash" x1="${X(5)}" y1="18" x2="${X(5)}" y2="128"/><text x="${X(5)}" y="146" text-anchor="middle">中心</text>
   <line class="f-dash2" x1="${X(5.8)}" y1="28" x2="${X(5.8)}" y2="128"/><text class="f-pri" x="${X(5.8)}" y="22" text-anchor="middle">μ</text>
   <text class="f-hlt" x="${X(9.3)}" y="112" text-anchor="middle">不適合</text>`,
   cap:'Cp＝(SU−SL)／6σ は規格幅とばらつきの比。平均 μ が中心からずれると、近いほうの規格までの距離で決まる Cpk は Cp より小さくなる'};},
 cc(){const v=[0.2,-0.4,0.6,0.1,-0.8,0.5,-0.2,0.9,0.3,-0.6,0.4,1.1,0.0,-0.3,3.4,0.7,-0.5,0.2,0.8,-0.1],X=i=>30+i*14,Y=z=>78-z*16;
  return {svg:`<line class="f-ucl" x1="24" y1="${Y(3)}" x2="300" y2="${Y(3)}"/><line class="f-ucl" x1="24" y1="${Y(-3)}" x2="300" y2="${Y(-3)}"/><line class="f-cl" x1="24" y1="${Y(0)}" x2="300" y2="${Y(0)}"/>
   <text class="f-hlt" x="302" y="${Y(3)+4}" text-anchor="end" dy="-6">UCL</text><text class="f-pri" x="302" y="${Y(0)-6}" text-anchor="end">CL</text><text class="f-hlt" x="302" y="${Y(-3)+14}" text-anchor="end">LCL</text>
   <polyline class="f-line thin" points="${v.map((z,i)=>`${X(i)},${Y(z)}`).join(' ')}"/>${v.map((z,i)=>`<circle class="${Math.abs(z)>3?'f-out':'f-pt'}" cx="${X(i)}" cy="${Y(z)}" r="${Math.abs(z)>3?5:3.2}"/>`).join('')}
   <text class="f-hlt" x="${X(14)}" y="${Y(3.4)-10}" text-anchor="middle">管理外れ</text>`,
   cap:'管理限界（UCL・LCL）は中心線 CL から ±3σ。点が限界の外に出るか、並び方にくせ（連・傾向・周期）があれば異常と判断する'};},
 oc(){const L=p=>{let s=0;for(let k=0;k<=1;k++){let c=1;for(let i=1;i<=k;i++)c=c*(20-k+i)/i;s+=c*p**k*(1-p)**(20-k);}return s;};
  const X=p=>30+p/0.3*270,Y=l=>130-l*110,pts=[];for(let p=0;p<=0.3001;p+=0.005)pts.push(`${X(p).toFixed(1)},${Y(L(p)).toFixed(1)}`);
  const p0=0.02,p1=0.15;
  return {svg:`<line class="f-axis" x1="30" y1="130" x2="304" y2="130"/><line class="f-axis" x1="30" y1="16" x2="30" y2="130"/>
   <text x="24" y="${Y(1)+4}" text-anchor="end">1</text><text x="24" y="134" text-anchor="end">0</text>
   <polyline class="f-line" points="${pts.join(' ')}"/>
   <line class="f-dash" x1="${X(p0)}" y1="${Y(L(p0))}" x2="${X(p0)}" y2="130"/><line class="f-dash" x1="${X(p1)}" y1="${Y(L(p1))}" x2="${X(p1)}" y2="130"/>
   <text x="${X(p0)}" y="146" text-anchor="middle">p0</text><text x="${X(p1)}" y="146" text-anchor="middle">p1</text>
   <line class="f-mark" x1="${X(p0)+3}" y1="${Y(1)}" x2="${X(p0)+3}" y2="${Y(L(p0))}"/><text class="f-hlt" x="${X(p0)+10}" y="${Y(1)+12}">α</text>
   <line class="f-mark2" x1="${X(p1)+3}" y1="${Y(L(p1))}" x2="${X(p1)+3}" y2="130"/><text class="f-okt" x="${X(p1)+10}" y="${Y(L(p1))+18}">β</text>
   <text x="300" y="146" text-anchor="end">ロットの不適合品率 p</text><text x="36" y="14">合格確率 L(p)</text>`,
   cap:'OC 曲線：p0（良いロット）で不合格になる確率が生産者危険 α、p1（悪いロット）で合格になる確率が消費者危険 β（図は n＝20、c＝1）'};},
 bathtub(){const X=t=>24+t*2.76,Y=l=>120-l,pts=[];for(let t=0;t<=100;t+=1){const l=t<25?70*Math.exp(-t/7)+18:t<70?18:18+(t-70)**2/12;pts.push(`${X(t).toFixed(1)},${Y(Math.min(l,100)).toFixed(1)}`);}
  return {svg:`<line class="f-axis" x1="24" y1="120" x2="304" y2="120"/><line class="f-axis" x1="24" y1="14" x2="24" y2="120"/><polyline class="f-line" points="${pts.join(' ')}"/>
   <line class="f-dash" x1="${X(25)}" y1="20" x2="${X(25)}" y2="120"/><line class="f-dash" x1="${X(70)}" y1="20" x2="${X(70)}" y2="120"/>
   <text x="${X(12)}" y="138" text-anchor="middle">初期故障期</text><text x="${X(47)}" y="138" text-anchor="middle">偶発故障期</text><text x="${X(86)}" y="138" text-anchor="middle">摩耗故障期</text>
   <text class="f-pri" x="${X(12)}" y="152" text-anchor="middle">減少型</text><text class="f-pri" x="${X(47)}" y="152" text-anchor="middle">一定型（指数分布）</text><text class="f-pri" x="${X(86)}" y="152" text-anchor="middle">増加型</text>
   <text x="30" y="12">故障率</text>`,
   cap:'バスタブ曲線：初期故障はデバッギング・スクリーニングで除き、摩耗故障は予防保全（交換）で防ぐ。偶発故障期は故障率がほぼ一定'};},
 rel(){const b=(x,y,t)=>`<rect class="f-box" x="${x}" y="${y}" width="56" height="30" rx="6"/><text x="${x+28}" y="${y+20}" text-anchor="middle">${t}</text>`;
  return {svg:`<line class="f-line thin" x1="10" y1="76" x2="40" y2="76"/>${b(40,61,'A')}<line class="f-line thin" x1="96" y1="76" x2="130" y2="76"/>
   <line class="f-line thin" x1="130" y1="40" x2="130" y2="112"/><line class="f-line thin" x1="130" y1="40" x2="150" y2="40"/><line class="f-line thin" x1="130" y1="112" x2="150" y2="112"/>
   ${b(150,25,'B')}${b(150,97,'C')}<line class="f-line thin" x1="206" y1="40" x2="226" y2="40"/><line class="f-line thin" x1="206" y1="112" x2="226" y2="112"/><line class="f-line thin" x1="226" y1="40" x2="226" y2="112"/><line class="f-line thin" x1="226" y1="76" x2="290" y2="76"/>
   <text class="f-pri" x="68" y="54" text-anchor="middle">直列</text><text class="f-pri" x="178" y="84" text-anchor="middle">並列</text>
   <text class="f-pri" x="160" y="150" text-anchor="middle">R＝RA×{1−(1−RB)(1−RC)}</text>`,
   cap:'直列は信頼度の積（どれか1つ壊れると止まる）、並列は「全部壊れる確率」を1から引く（1つ動けば動く）'};},
 pareto(){const v=[45,25,15,8,7],X=i=>40+i*48,H=x=>x*1.0,cum=[];let c=0;v.forEach(x=>{c+=x;cum.push(c);});
  return {svg:`<line class="f-axis" x1="34" y1="128" x2="290" y2="128"/>${v.map((x,i)=>`<rect class="f-bar" x="${X(i)}" y="${128-H(x)*2.2}" width="40" height="${H(x)*2.2}" rx="3"/>`).join('')}
   <polyline class="f-line" points="${cum.map((x,i)=>`${X(i)+20},${128-x*1.1}`).join(' ')}"/>${cum.map((x,i)=>`<circle class="f-pt" cx="${X(i)+20}" cy="${128-x*1.1}" r="3"/>`).join('')}
   <text class="f-pri" x="${X(1)+24}" y="${128-70*1.1+16}">70%</text>${['キズ','寸法','打痕','汚れ','その他'].map((t,i)=>`<text x="${X(i)+20}" y="144" text-anchor="middle">${t}</text>`).join('')}`,
   cap:'パレート図：件数（または損失金額）の多い順に並べ、累積比率の折れ線を重ねる。上位の少数の項目に重点を置く。「その他」は最後'};},
 scatter(){const P=[[1,2.1],[1.5,2.0],[2,3.2],[2.4,2.9],[3,3.9],[3.3,4.4],[3.8,4.1],[4.2,5.2],[4.6,5.0],[5,6.1],[5.5,5.8],[6,6.9]],X=x=>30+x*42,Y=y=>132-y*16;
  return {svg:`<line class="f-axis" x1="30" y1="132" x2="300" y2="132"/><line class="f-axis" x1="30" y1="14" x2="30" y2="132"/>
   <line class="f-mark2" x1="${X(0.6)}" y1="${Y(1.4)}" x2="${X(6.3)}" y2="${Y(7.1)}"/>${P.map(([x,y])=>`<circle class="f-pt" cx="${X(x)}" cy="${Y(y)}" r="3.5"/>`).join('')}
   <line class="f-dash" x1="${X(3.8)}" y1="${Y(4.6)}" x2="${X(3.8)}" y2="${Y(4.1)}"/><text x="${X(3.8)+4}" y="${Y(3.6)+12}">残差</text>
   <text class="f-okt" x="${X(3.6)}" y="${Y(6.4)}" text-anchor="end">ŷ＝a＋bx</text><text x="300" y="146" text-anchor="end">x</text><text x="36" y="14">y</text>`,
   cap:'散布図と回帰直線：最小二乗法は y 方向の残差の平方和を最小にする。相関係数 r は直線的な関係の強さ（−1〜1）'};},
};
// 文章から図を選ぶ（上から優先）
const FIGRULES=[['oc',/OC曲線|OC 曲線|生産者危険|消費者危険|合格確率|合格する確率/],['bathtub',/バスタブ|初期故障|摩耗故障|偶発故障/],['rel',/直列系|並列系|並列に|直列に|冗長|並列部分|並列ブロック/],
 ['cap',/工程能力|Cpk|Cp[＝ は]/],['cc',/管理図|管理限界|UCL|LCL/],['pareto',/パレート/],['scatter',/相関係数|散布図|回帰直線|回帰係数|寄与率/],
 ['norm',/正規分布|上側確率|標準正規|K＝\d/],['two',/棄却域|両側検定|有意水準|棄却限界/]];
function figFor(text){
  for(const [k,re] of FIGRULES)if(re.test(text)){
    if(k==='norm'){const m=text.match(/K＝(\d+(?:\.\d+)?)/);return figHTML(FIG.norm({k:m?+m[1]:null,two:!m&&/両側|α\/2|1\.96/.test(text)}));}
    if(k==='two')return figHTML(FIG.norm({k:1.96,two:true}));
    return figHTML(FIG[k]());}
  return '';
}
function figHTML(f){return `<figure class="qfig"><svg viewBox="0 0 320 156" role="img" aria-label="${esc(f.cap)}">${f.svg}</svg><figcaption>${esc(f.cap)}</figcaption></figure>`;}
