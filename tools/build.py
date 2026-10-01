#!/usr/bin/env python3
"""Assemble index.html from src/ + assets/ and run static checks. Stdlib only."""
import json, base64, re, subprocess, sys, pathlib
R = pathlib.Path(__file__).resolve().parents[1]; src = R / 'src'
tpl = (src / 'app.html').read_text('utf-8')
meta = json.loads((R / 'assets/poses.json').read_text())
poses = {k: {'src': 'data:image/webp;base64,' + base64.b64encode((R / 'assets' / v['file']).read_bytes()).decode(),
             **{f: v[f] for f in ('w', 'h', 'feet', 'top', 'fc', 'fr')}} for k, v in meta.items()}
parts = {'<!--@FONTS@-->': (src / 'fonts.css').read_text('utf-8'),
         '/*@SAHAB_CSS@*/': (src / 'sahab.css').read_text('utf-8'),
         '/*@ASSETS@*/null': json.dumps({'poses': poses}, separators=(',', ':')),
         '/*@BUILDERS@*/': (src / 'builders.js').read_text('utf-8'),
         '/*@STORY@*/': (src / 'story.js').read_text('utf-8')}
for k, v in parts.items():
    assert tpl.count(k) == 1, k
    tpl = tpl.replace(k, v)
(R / 'index.html').write_text(tpl, 'utf-8')
# checks
txt = re.sub(r'data:[a-z/+-]+;base64,[A-Za-z0-9+/=]+', '', tpl)
BAN = r'Musaad|Jawalli|JAWALLI|Burgundy|Lulwa|iPhone|Al.Shifa|Narjis|Faisal|\bNora\b|shemagh|أحمد|Saudia|flynas|flyadeal|Riyadh Air|DATAURI|#iphone|href="#star"'
bad = [m.group(0) for m in re.finditer(BAN, txt, re.I)]
bad += re.findall(r"pose:\s*'(?:talk|angry|sad)'|\['(?:talk|angry|sad)'", txt)
js = max(re.findall(r'<script>\n(.*?)</script>', tpl, re.S), key=len)
subprocess.run(['node', '-e', "new Function(require('fs').readFileSync(0,'utf8'))"], input=js.encode(), check=True)
n_webp = tpl.count('data:image/webp')
size = len(tpl.encode()); print('index.html', size, 'bytes,', n_webp, 'poses')
if bad or size > 750_000 or n_webp != 5: sys.exit(f'FAIL {bad[:10]} size={size} webp={n_webp}')
