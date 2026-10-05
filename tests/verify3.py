# v1.2.0 で追加した計算問題の正解を scipy で独立に再計算して照合する（先に node test.js を実行）
# 使い方（リポジトリ直下で）: python tests/verify3.py
import json, re, math, pathlib
from scipy import stats
from scipy.special import gammaln
S=json.load(open(pathlib.Path(__file__).resolve().parent/'samples.json',encoding='utf8'))
nums=lambda s:[float(x) for x in re.findall(r'-?\d+(?:\.\d+)?',re.sub(r'[ut]0＝|F0＝|X̄U＝','＝',s))]
def close(a,b,d,tbl=0.002): return abs(a-b)<=0.5*10**-d+abs(b)*tbl+1e-9   # 表示桁の丸め＋数値表の丸めを許容
# F表（小数2桁）や係数（小数3桁）を介する値は、表の丸めの影響が大きいので相対0.6%まで許容
TF=0.006
def g(p,s): m=re.search(p,s); return [float(x) for x in m.groups()]
def c4(n): return math.sqrt(2/(n-1))*math.exp(gammaln(n/2)-gammaln((n-1)/2))
ng=n=0
for o in S:
    i,q,a=o['id'],o['q'],o['a']
    if i not in ('g_Fci','g_t2ci','g_welch','g_pairedCI','g_p2','g_c1','g_cCI','g_c2','g_xbars','g_uchart','g_varsamp','g_two_nr','g_serial','g_regF','g_msa','g_statdist','g_oc2','g_relT'): continue
    n+=1
    try:
        if i=='g_Fci':
            n1,V1,n2,V2=g(r'n＝(\d+)、V＝([\d.]+)）と.*n＝(\d+)、V＝([\d.]+)',q);r=V1/V2
            lo=r/stats.f.isf(.025,n1-1,n2-1);hi=r*stats.f.isf(.025,n2-1,n1-1);x=nums(a);ok=close(x[0],lo,2,TF) and close(x[1],hi,2,TF)
        elif i=='g_t2ci':
            n1,x1,n2,x2,V=g(r'n＝(\d+)、x̄＝([\d.]+)）と B（n＝(\d+)、x̄＝([\d.]+)）.*V＝([\d.]+)',q);h=stats.t.isf(.025,n1+n2-2)*math.sqrt(V*(1/n1+1/n2));x=nums(a)
            ok=close(x[0],x1-x2-h,2) and close(x[1],x1-x2+h,2)
        elif i=='g_welch':
            n1,x1,V1,n2,x2,V2=g(r'A：n＝(\d+)、x̄＝([\d.]+)、V＝([\d.]+)。B：n＝(\d+)、x̄＝([\d.]+)、V＝([\d.]+)',q)
            ok=close(float(a),(x1-x2)/math.sqrt(V1/n1+V2/n2),2)
        elif i=='g_pairedCI':
            k,db,Vd=g(r'同じ (\d+) 個.*d̄＝([\d.]+)、不偏分散 Vd＝([\d.]+)',q);h=stats.t.isf(.025,k-1)*math.sqrt(Vd/k);x=nums(a)
            ok=close(x[0],db-h,3) and close(x[1],db+h,3)
        elif i=='g_oc2':
            n_,c_,p_=g(r'n＝(\d+)、c＝(\d+) .*p0＝([\d.]+)',q);ok=close(float(a),stats.binom.sf(int(c_),int(n_),p_),3)
        elif i=='g_relT':
            T_,r_,t_=g(r'総動作時間 (\d+) 時間.*故障が (\d+) 回.*、(\d+) 時間連続',q);ok=close(float(a),math.exp(-t_*r_/T_),3)
        elif i=='g_p2':
            n1,x1,n2,x2=g(r'A は (\d+) 個中 (\d+) 個、ラインB は (\d+) 個中 (\d+) 個',q);pb=(x1+x2)/(n1+n2);u=(x1/n1-x2/n2)/math.sqrt(pb*(1-pb)*(1/n1+1/n2))
            ok=close(nums(a)[0],u,2) and (('有意でない' in a)==(abs(u)<stats.norm.isf(.025)))
        elif i=='g_c1':
            l0,k,x=g(r'λ0＝([\d.]+) であった。工程変更後に (\d+) 台.*合計 (\d+) 個',q);ok=close(float(a),(x/k-l0)/math.sqrt(l0/k),2)
        elif i=='g_cCI':
            k,x=g(r'(\d+) 枚の鋼板.*合計 (\d+) 個',q);lh=x/k;h=1.959964*math.sqrt(lh/k);v=nums(a);ok=close(v[0],lh-h,2) and close(v[1],lh+h,2)
        elif i=='g_c2':
            n1,x1,n2,x2=g(r'A では (\d+) 台で不適合数が合計 (\d+) 個、工程B では (\d+) 台で合計 (\d+) 個',q);lb=(x1+x2)/(n1+n2)
            ok=close(float(a),(x1/n1-x2/n2)/math.sqrt(lb*(1/n1+1/n2)),2)
        elif i=='g_xbars':
            k=int(g(r'n＝(\d+)',q)[0]);c=c4(k)
            if 'X̄管理図' in q: X,s=g(r'X̿＝([\d.]+)、s̄＝([\d.]+)',q);ok=close(float(a),X+3/(c*math.sqrt(k))*s,2,TF)
            else: s=g(r's̄＝([\d.]+)',q)[0];ok=close(float(a),(1+3*math.sqrt(1-c*c)/c)*s,2,TF)
        elif i=='g_uchart':
            ub,k=g(r'ū＝([\d.]+) であった。大きさ n＝(\d+)',q);ok=close(float(a),ub+3*math.sqrt(ub/k),3)
        elif i=='g_varsamp':
            SU,s,k,xb=g(r'SU＝([\d.]+) が.*σ＝([\d.]+)（既知）.*k＝([\d.]+) を得た。サンプルの平均が x̄＝([\d.]+)',q);XU=SU-k*s
            ok=close(nums(a)[0],XU,3) and (('合格' in a and '不合格' not in a)==(xb<=XU))
        elif i=='g_two_nr':
            A,B,ST,SA,SB=g(r'因子A (\d)水準、因子B (\d)水準.*ST＝([\d.]+)、SA＝([\d.]+)、SB＝([\d.]+)',q);fe=(A-1)*(B-1);F0=(SA/(A-1))/((ST-SA-SB)/fe)
            ok=close(nums(a)[0],F0,2) and (('有意でない' in a)==(F0<stats.f.isf(.05,A-1,fe)))
        elif i=='g_serial':
            p_,m_=g(r'一致した組が (\d+)、一致しなかった組が (\d+)',q);N=int(p_+m_);cv=max(r for r in range(N) if stats.binom.cdf(r,N,.5)<=.025);sig=min(p_,m_)<=cv
            exp=('有意。正の' if p_>m_ else '有意。負の') if sig else '有意でない';ok=a.startswith(exp)
        elif i=='g_regF':
            k,Sxx,Syy,Sxy=g(r'n＝(\d+) 組のデータで Sxx＝([\d.]+)、Syy＝([\d.]+)、Sxy＝([\d.]+)',q);SR=Sxy**2/Sxx;F0=SR/((Syy-SR)/(k-2))
            ok=close(nums(a)[0],F0,2) and (('有意でない' in a)==(F0<stats.f.isf(.05,1,k-2)))
        elif i=='g_msa':
            so,sm=g(r'標準偏差は ([\d.]+) であった。測定誤差の標準偏差は ([\d.]+)',q);ok=close(float(a),math.sqrt(so*so-sm*sm),2)
        elif i=='g_statdist':
            v=float(a)
            if 't 分布' in q: df,P=g(r'φ＝(\d+) の t 分布.*確率（両側確率）が ([\d.]+)',q);ok=close(v,stats.t.isf(P/2,df),3)
            elif '下側確率が 0.025' in q: df=g(r'φ＝(\d+)',q)[0];ok=close(v,stats.chi2.ppf(.025,df),3)
            elif 'χ² 分布' in q: df,P=g(r'φ＝(\d+) の χ² 分布で、上側確率が ([\d.]+)',q);ok=close(v,stats.chi2.isf(P,df),3)
            elif '0.95)' in q: f1,f2=g(r'F\((\d+), (\d+); 0.95\)',q);ok=close(v,stats.f.ppf(.05,f1,f2),3,TF)
            else: f1,f2=g(r'F\((\d+), (\d+); 0.05\)',q);ok=close(v,stats.f.isf(.05,f1,f2),2)
        if not ok: ng+=1;print('NG',i,q[:120],'|',a)
    except Exception as e: ng+=1;print('ERR',i,repr(e),q[:100],'|',a)
print('checked',n,'NG',ng)
import sys; sys.exit(1 if ng else 0)
