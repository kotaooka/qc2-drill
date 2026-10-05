# 生成問題の正解をscipyで独立に再計算して照合する
# 使い方（リポジトリ直下で）: python tests/verify.py
import json,re,math
from scipy import stats
import pathlib;S=json.load(open(pathlib.Path(__file__).resolve().parent/'samples.json',encoding='utf8'))
num=lambda s:[float(x) for x in re.findall(r'-?\d+(?:\.\d+)?',s)]
ng=0;n=0
for o in S:
    q,a,i=o['q'],o['a'],o['id'];n+=1
    try:
        if i=='g_cross':
            v=list(map(int,re.findall(r'適合 (\d+)、不適合 (\d+)',q)[0]+re.findall(r'適合 (\d+)、不適合 (\d+)',q)[1]))
            chi,p,_,_=stats.chi2_contingency([[v[0],v[1]],[v[2],v[3]]],correction=False)
            got=float(re.search(r'χ0²＝([\d.]+)',a).group(1));ok=abs(got-chi)<0.006 and (('有意（' in a)==(p<0.05))
        elif i=='g_t2':
            m=re.search(r'A：n＝(\d+)、x̄＝([\d.]+)、S＝([\d.]+)。B：n＝(\d+)、x̄＝([\d.]+)、S＝([\d.]+)',q);n1,x1,S1,n2,x2,S2=[float(x) for x in m.groups()]
            V=(S1+S2)/(n1+n2-2);t=(x1-x2)/math.sqrt(V*(1/n1+1/n2));ok=abs(float(a)-t)<0.006
        elif i=='g_paired':
            m=re.search(r'同じ (\d+) 個.*d̄＝([\d.]+)、Sd＝([\d.]+)',q);k,db,Sd=[float(x) for x in m.groups()]
            t=db/math.sqrt(Sd/(k-1)/k);ok=abs(float(a)-t)<0.006
        elif i=='g_chiCI':
            m=re.search(r'n＝(\d+) 個.*S＝([\d.]+)',q);k,Sv=float(m.group(1)),float(m.group(2))
            lo,hi=Sv/stats.chi2.isf(0.025,k-1),Sv/stats.chi2.isf(0.975,k-1);g=num(a);ok=all(abs(a-b)<=max(0.0011,b*0.001) for a,b in ((g[0],lo),(g[1],hi)))
        elif i=='g_normInv':
            m=re.search(r'μ＝([\d.]+)、上限規格 ([\d.]+)。.*率を ([\d.]+)% 以下',q);mu,su,pp=[float(x) for x in m.groups()]
            ok=abs(float(a)-(su-mu)/stats.norm.isf(pp/100))<0.002
        elif i=='g_doeCI':
            m=re.search(r'(\d)水準・繰返し (\d) 回.*平均が ([\d.]+)、誤差分散 Ve＝([\d.]+)',q);A,r,mm,Ve=[float(x) for x in m.groups()]
            h=stats.t.isf(0.025,A*(r-1))*math.sqrt(Ve/r);g=num(a);ok=abs(g[0]-(mm-h))<0.006 and abs(g[1]-(mm+h))<0.006
        elif i=='g_t0':
            m=re.search(r'μ0＝([\d.]+) から.*n＝(\d+)、x̄＝([\d.]+)、V＝([\d.]+)',q);mu,k,xb,V=[float(x) for x in m.groups()]
            t=(xb-mu)/math.sqrt(V/k);c=stats.t.isf(0.025,k-1);g=float(re.search(r't0＝(-?[\d.]+)',a).group(1))
            ok=abs(g-t)<0.006 and (('有意でない' not in a)==(abs(t)>=c))
        elif i=='g_mtbf':
            m=re.search(r'(\d+) 台.*それぞれ (\d+) 時間.*合計 (\d+) 回',q);u,h,k=[float(x) for x in m.groups()]
            if 'MTBF' in q: ok=abs(float(a.split()[0])-u*h/k)<0.6
            else:
                mant,ex=re.search(r'([\d.]+)×10\^−(\d+)',a).groups();ok=abs(float(mant)*10**-int(ex)-k/(u*h))/(k/(u*h))<0.01
        elif i=='g_cpR':
            m=re.search(r'規格幅（SU−SL）が ([\d.]+) .*n＝(\d) .*R̄＝([\d.]+)',q);W,k,R=[float(x) for x in m.groups()]
            from scipy import integrate
            d2=2*integrate.quad(lambda x:1-stats.norm.cdf(x)**k-(1-stats.norm.cdf(x))**k,0,math.inf)[0]
            ok=abs(float(a)-W/(6*R/d2))<0.011
        elif i=='g_rs':
            d=[float(x) for x in q.split('\n')[1].split('、')];rb=sum(abs(d[j+1]-d[j]) for j in range(5))/5;ok=abs(float(a)-rb/1.128)<0.002
        if not ok: ng+=1;print('NG',i,q,a)
    except Exception as e: ng+=1;print('ERR',i,e,q,a)
print('checked',n,'NG',ng)
import sys
sys.exit(1 if ng else 0)
