# 数値表（正規分布・t・χ²・F）を scipy で生成し src/tables.json に書き出す。
# 使い方（リポジトリ直下で）: python tools/gen_tables.py
# 数値表を生成してJSONで出力
import json, numpy as np
from scipy import stats, integrate
T={}
# 正規分布 上側確率 u=0.00..3.09
T['norm']=[[round(float(stats.norm.sf(r/10+c/100)),4) for c in range(10)] for r in range(31)]
# t表（両側確率）
tdf=list(range(1,31))+[40,60,120,'inf']
tP=[0.10,0.05,0.02,0.01]
T['t']={'df':tdf,'P':tP,'v':[[round(float(stats.t.isf(p/2, 1e9 if d=='inf' else d)),3) for p in tP] for d in tdf]}
cdf=list(range(1,31))+[40,50,60]
cP=[0.995,0.99,0.975,0.95,0.05,0.025,0.01,0.005]
T['chi2']={'df':cdf,'P':cP,'v':[[round(float(stats.chi2.isf(p,d)),3) for p in cP] for d in cdf]}
f1=[1,2,3,4,5,6,7,8,9,10,12,15,20]
f2=list(range(1,21))+[24,30,40,60,120]
T['F']={'f1':f1,'f2':f2}
for a in [0.05,0.025]:
    T['F'][str(a)]=[[round(float(stats.f.isf(a,n1,n2)),2) for n1 in f1] for n2 in f2]
# 管理図係数 d2,d3を数値積分で検算
def d2(n):
    f=lambda x: 1-(stats.norm.cdf(x))**n-(1-stats.norm.cdf(x))**n
    return 2*integrate.quad(f,0,np.inf)[0]
print({n:round(d2(n),3) for n in range(2,11)})
# 符号検定表（両側）：少ないほうの個数がこの値以下なら有意
sg=lambda n,a: max([r for r in range(n) if stats.binom.cdf(r,n,0.5)<=a/2],default=None)
T['sign']={'n':list(range(9,61)),'v05':[sg(n,0.05) for n in range(9,61)],'v01':[sg(n,0.01) for n in range(9,61)]}
import pathlib;json.dump(T,open(pathlib.Path(__file__).resolve().parent.parent/'src'/'tables.json','w'))
print(T['t']['v'][9], T['chi2']['v'][9], T['F']['0.05'][9][:5])
