# 本試験形式の計算セット（m01〜m16 の計算セットと c01〜c07、p16、p17）の正解を scipy で独立に再計算して照合する
# 使い方（リポジトリ直下で）: python tests/verify_dai.py
import json, math, re, subprocess
from scipy import stats
import pathlib; _src=pathlib.Path(__file__).resolve().parent.parent/'src'; src=''.join((_src/f).read_text(encoding='utf8') for f in ('dai.js','dai2.js','dai3.js'))
D = json.loads(subprocess.run(['node','-e',src+';process.stdout.write(JSON.stringify(DAI))'],capture_output=True,text=True).stdout)
S = {d['id']:d for d in D}
def ans(i,k): d=S[i]; return d['opts'][d['ans'][k-1]]
from decimal import Decimal, ROUND_HALF_UP
f=lambda v,n: str(Decimal(str(round(float(v),10))).quantize(Decimal(1).scaleb(-n),rounding=ROUND_HALF_UP))
exp = {}
x=[12.3,12.8,11.9,12.5,12.0]; m=sum(x)/5; Sx=sum((a-m)**2 for a in x); V=Sx/4
exp['m01']=[f(m,2),f(Sx,2),f(V,3),f(math.sqrt(V),3),f(max(x)-min(x),2)]
cp=2.0/2.4; cpk=min(51-50.1,50.1-49)/1.2; K=(51-50.1)/0.4
exp['m02']=[f(cp,2),f(cpk,2),f(K,2),f(stats.norm.sf(K),4),'不足している']
Xb=1002/20; Rb=46/20
exp['m04']=[f(Xb,2),f(Rb,2),f(Xb+0.577*Rb,2),f(Xb-0.577*Rb,2),f(2.114*Rb,2),f(Rb/2.326,3)]
t0=0.9/math.sqrt(1.44/10)
exp['m06']=['H1：μ＞20.0','t0＝(x̄−μ0)／√(V／n)',f(t0,2),f(stats.t.isf(0.05,9),3),'有意である（強度は大きくなった）']
r=54/math.sqrt(40*90); b=54/40; a=25-b*10
exp['m07']=[f(r,3),f(r*r,3),f(b,2),f(a,1),f(a+b*12,1)]
Se=26; VA=36/3; Ve=Se/16; F0=VA/Ve; Fc=stats.f.isf(0.05,3,16)
exp['m08']=[f(Se,1),'16',f(VA,1),f(Ve,2),f(F0,2),'有意である' if F0>=Fc else '有意でない']
par=1-0.1*0.1; sysR=0.95*par
exp['m10']=[f(par,2),f(sysR,3),'800','1.25×10⁻³',f(math.exp(-100/800),3)]
B=stats.binom(20,0.05)
exp['m12']=[f(B.mean(),2),f(B.var(),2),f(B.pmf(0),3),f(B.cdf(1),3),f(math.exp(-1),3)]
Se2=69.0-30.0-18.0-9.0; Ve2=Se2/12
exp['m15']=[f(Se2,1),'6','12',f(Ve2,2),f((9.0/6)/Ve2,2),'有意でない' if (9.0/6)/Ve2<stats.f.isf(0.05,6,12) else '有意である',f((30.0/2)/Ve2,1)]
N=21+6; cv=max(r for r in range(N) if stats.binom.cdf(r,N,0.5)<=0.025)
exp['m16']=['中央値','除く',str(N),str(cv),'有意であり、正の大波の相関がある' if 6<=cv else '有意でない','差の符号']

# ---- v1.4.0 複合大問 ----
tc=stats.t.isf(0.025,9); h=tc*math.sqrt(0.4); t0=2.4/math.sqrt(0.4)
lo2=36/stats.chi2.isf(0.025,9); hi2=36/stats.chi2.isf(0.975,9)
exp['c01']=['H1：μ≠50.0',f(t0,2),'有意である' if abs(t0)>=tc else '有意でない',f(52.4-h,2)+' 〜 '+f(52.4+h,2),f(lo2,2)+' 〜 '+f(hi2,2)]
Xb=1252.5/25; Rb=51.5/25; sg=float(f(Rb/2.059,2)); K=(53-Xb)/sg
exp['c02']=[f(Xb,2),f(Xb+0.729*Rb,2),f(Xb-0.729*Rb,2),f(2.282*Rb,2),f(sg,2),f(6/(6*sg),2),f(min(53-Xb,Xb-47)/(3*sg),2),f(K,2),f(stats.norm.sf(K),4)]
Sxx,Syy,Sxy=40.0,250.0,90.0; b=Sxy/Sxx; SR=Sxy**2/Sxx; Se=Syy-SR; F0=SR/(Se/8)
exp['c03']=[f(Sxy/math.sqrt(Sxx*Syy),3),f(b,2),f(20-b*5,2),f(SR,1),f(Se,1),f(F0,1),'有意である' if F0>=stats.f.isf(0.05,1,8) else '有意でない',f(SR/Syy,2),f(20-b*5+b*8,2)]
Se=48-24-10-2; Vp=(Se+2)/8; FA=12/Vp; FB=10/Vp
exp['c04']=[f(Se,1),'6',f((2/2)/(Se/6),2),f(Se+2,1),'8',f(Vp,2),f(FA,2),'有意である' if FA>=stats.f.isf(0.05,2,8) else '有意でない',f(FB,2),'有意である' if FB>=stats.f.isf(0.05,1,8) else '有意でない']
import numpy as np
from scipy.stats import chi2_contingency
p=28/500; u=(16/200-12/300)/math.sqrt(p*(1-p)*(1/200+1/300)); c2=chi2_contingency([[16,184],[12,288]],correction=False)[0]
assert abs(c2-u*u)<1e-9
exp['c05']=[f(p,3),f(u,2),'有意である' if abs(u)>=1.96 else '有意でない',f(c2,2),f(stats.chi2.isf(0.05,1),2),'u0²']
par=1-0.2**2
exp['c06']=[f(par,2),f(0.9*par,3),'5000',f(math.exp(-2e-4*500),3),f(950/(950+50),2)]
L=lambda p,c:stats.binom.cdf(c,10,p)
exp['c07']=[f(L(.05,1),3),f(L(.1,1),3),f(L(.2,1),3),f(1-L(.05,1),3),f(L(.2,1),3),f(L(.05,0),3),'左（不適合品率の小さい側）へ移り、αが大きくなる']
exp['p16']=[f(90/200*100,1)+'%',f(140/200*100,1)+'%','キズ','特性要因図','層別',str(90-30),f(60/200*100,1)+'%','標準化']
exp['p17']=[str(8*4*6),str(8*2*6),'ボトムアップ型','FTA','デザインレビュー','初期流動管理']
ng=0
for i,e in exp.items():
    got=[ans(i,k+1) for k in range(len(S[i]['ans']))]
    if got!=e: ng+=1; print('NG',i,'\n got',got,'\n exp',e)
print('F(3,16;0.05)=',round(Fc,2),' t(9,両側0.10)=',round(stats.t.isf(0.05,9),3))
print('sets checked',len(exp),'NG',ng)
