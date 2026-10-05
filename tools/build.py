# ビルド：src/ の数値表・問題バンク・ジェネレータを埋め込み、単体で動く docs/index.html を生成する
# 使い方（リポジトリ直下で）: python tools/build.py
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
r = lambda name: (SRC / name).read_text(encoding="utf-8")

body = r("template.html")
body = body.replace("/*TABLES*/", r("tables.json"))
body = body.replace("/*BANK*/", "".join(r(f) for f in ["bank.js","bank2.js","bank3.js","bank4.js","bank5.js","bank6.js","bank7.js","dai.js","dai2.js","dai3.js","res.js","syllabus.js","path.js","figs.js"]))
body = body.replace("/*GEN*/", "".join(r(f) for f in ["gen.js","gen2.js","gen3.js"]))

# GitHub Pages などで単体表示するための最小限の骨格
head = (
    '<!doctype html><html lang="ja"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    "<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);"
    "padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}"
    "[hidden]{display:none!important}</style></head><body>"
)
out = ROOT / "docs" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(head + body + "</body></html>", encoding="utf-8")
print(f"生成しました: {out.relative_to(ROOT)} ({out.stat().st_size:,} bytes)")
