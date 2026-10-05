# ビルド：src/ の数値表・問題バンク・ジェネレータを埋め込み、単体で動く docs/index.html を生成する
# 使い方（リポジトリ直下で）: python tools/build.py
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
r = lambda name: (SRC / name).read_text(encoding="utf-8")

body = r("template.html")
# <title> は head に移す（検索エンジンが確実に読めるように）
import re
m = re.search(r"<title>.*?</title>", body)
TITLE = m.group(0) if m else ""
body = body.replace(TITLE, "", 1)
body = body.replace("/*TABLES*/", r("tables.json"))
body = body.replace("/*BANK*/", "".join(r(f) for f in ["bank.js","bank2.js","bank3.js","bank4.js","bank5.js","bank6.js","bank7.js","dai.js","dai2.js","dai3.js","res.js","syllabus.js","path.js","figs.js","formulas.js"]))
body = body.replace("/*GEN*/", "".join(r(f) for f in ["gen.js","gen2.js","gen3.js"]))

# 検索結果・SNS 共有で表示される説明（GitHub Pages 用）
URL = "https://kotaooka.github.io/qc2-drill/"
DESC = ("QC検定®2級の出題範囲（レベル表164項目）を網羅した無料・広告なしの問題集。"
        "計算問題は毎回数値が変わり、本試験形式の大問、模擬試験、間隔反復の復習つき。Web版とAndroid版（非公式）。")
OGIMG = "https://raw.githubusercontent.com/kotaooka/qc2-drill/main/screenshots/og.png"
META = (
    f'<meta name="description" content="{DESC}">'
    f'<link rel="canonical" href="{URL}">'
    '<meta name="theme-color" content="#1D5C7A">'
    # ホーム画面に追加（PWA）用：manifest・アイコン。Service Worker の登録は画面側（template.html）で行う
    '<link rel="manifest" href="manifest.webmanifest">'
    '<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">'
    '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">'
    '<meta name="apple-mobile-web-app-capable" content="yes">'
    '<meta name="mobile-web-app-capable" content="yes">'
    '<meta name="apple-mobile-web-app-title" content="QC2級ドリル">'
    '<meta name="apple-mobile-web-app-status-bar-style" content="default">'
    # Google Search Console の所有権確認
    '<meta name="google-site-verification" content="xLVjdnAB_uJxX1D1qEyI_qkFT_PrQzqFOiInbc6AcJU">'
    '<meta property="og:type" content="website">'
    '<meta property="og:site_name" content="QC2級ドリル">'
    '<meta property="og:title" content="QC2級ドリル｜QC検定®2級の無料問題集・模擬試験">'
    f'<meta property="og:description" content="{DESC}">'
    f'<meta property="og:url" content="{URL}">'
    f'<meta property="og:image" content="{OGIMG}">'
    '<meta name="twitter:card" content="summary_large_image">'
)
NOSCRIPT = (
    "<noscript><h1>QC2級ドリル</h1><p>" + DESC + "</p>"
    "<p>このアプリを使うには JavaScript を有効にしてください。</p></noscript>"
)

# GitHub Pages などで単体表示するための最小限の骨格
head = (
    '<!doctype html><html lang="ja"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    "<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);"
    "padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}"
    "[hidden]{display:none!important}</style>"
    + TITLE + META + "</head><body>" + NOSCRIPT
)
out = ROOT / "docs" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(head + body + "</body></html>", encoding="utf-8")
print(f"生成しました: {out.relative_to(ROOT)} ({out.stat().st_size:,} bytes)")
