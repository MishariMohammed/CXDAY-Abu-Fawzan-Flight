#!/usr/bin/env python3
"""Headless walkthrough of index.html. Usage: python3 tools/verify.py [scenes|kiosk|rm|all] [IDS...]
Screenshots go to $OUT (default: ./.shots, git-ignored)."""
import os, sys, json, re
from playwright.sync_api import sync_playwright
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXE = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
URL = 'file://' + R + '/index.html'
OUT = os.environ.get('OUT', os.path.join(R, '.shots')); os.makedirs(OUT, exist_ok=True)
LIM = {'stage': 14, 'hero': 15, 'guide': 12, 'witness': 12}
EXTRA = {'B0': 19, 'I0': 16}
OVL = '.sc .phone,.sc .fids,.sc .cctv,.sc .xr,.sc .bub,.sc .choice,.sc .rc,.sc .ec,.sc .panel,.sc .stamp,.sc .itab,.sc .gaugebox,.sc .map'
fails = []

def collect(pg, tag, meta):
    errs = pg.evaluate('__cx.errors.slice()')
    if errs: fails.append(f'{tag}: cx.errors {errs}')
    mode = {m['id']: m['mode'] for m in meta}
    for e in pg.evaluate('__cx.sayLog.slice()'):
        n = len(e['text'].split()); lim = EXTRA.get(e['id'], LIM.get(mode.get(e['id']), 14))
        if n > lim: fails.append(f"{tag}: {e['id']} line {n}w > {lim}: {e['text']}")
    for t in pg.evaluate('window.__narrs || []'):
        if len(t) > 70: fails.append(f'{tag}: narr {len(t)} chars: {t}')

def overlap(pg, tag, mode):
    if mode not in ('stage', 'guide'): return
    res = pg.evaluate("""([sel, lim]) => { const host = __cx.host().rect; const out = [];
      document.querySelectorAll(sel).forEach(e => { const r = e.getBoundingClientRect(); if (!r.width) return;
        const vr = document.querySelector('#viewport').getBoundingClientRect(), s = vr.width / 1920;
        const x = (r.left - vr.left) / s, y = (r.top - vr.top) / s, w = r.width / s, h = r.height / s;
        if (getComputedStyle(e).opacity === '0') return;
        const ix = Math.min(x + w, host.x + host.w) - Math.max(x, host.x), iy = Math.min(y + h, host.y + host.h) - Math.max(y, host.y);
        if (x + w > lim || (ix > 24 && iy > 24)) out.push(e.className + ' right=' + Math.round(x + w)); });
      return out; }""", [OVL, 1500 if mode == 'guide' else 1300])
    if res: fails.append(f'{tag}: overlap/right-edge {res[:4]}')

def mkpage(b, reduced=False):
    ctx = b.new_context(viewport={'width': 1920, 'height': 1080}, reduced_motion='reduce' if reduced else 'no-preference')
    ctx.add_init_script("""window.__narrs=[];document.addEventListener('DOMContentLoaded',()=>{const t=document.querySelector('#narr .txt');
      new MutationObserver(()=>{const s=t.textContent.trim(); if(s) window.__narrs.push(s);}).observe(t,{childList:true,subtree:true,characterData:true});});""")
    pg = ctx.new_page(); pe = []
    pg.on('pageerror', lambda e: pe.append(str(e)))
    pg.on('console', lambda m: pe.append(m.text) if m.type == 'error' else None)
    return pg, pe

def scenes(b, ids, variants, reduced=False):
    pg, pe = mkpage(b, reduced)
    pg.goto(URL + '?mode=present&sound=off'); pg.wait_for_timeout(800)
    meta = pg.evaluate('__cx.meta()'); mode = {m['id']: m['mode'] for m in meta}
    for sid in ids or [m['id'] for m in meta]:
        for v in (variants if sid.startswith('G') else ['']):
            tag = sid + (re.sub(r'\W', '', v) or '') + ('-rm' if reduced else '')
            pe.clear()
            pg.goto(URL + f'?mode=present&sound=off&speed=0.35&scene={sid}{v}' + ('&motion=off' if reduced else ''))
            try: pg.wait_for_function(f"() => window.__cx && __cx.cur() === '{sid}' && !__cx.autoplay()", timeout=40000)
            except Exception: fails.append(f'{tag}: still autoplaying after 40s')
            pg.wait_for_timeout(700)
            pg.screenshot(path=f'{OUT}/{tag}.png')
            collect(pg, tag, meta); overlap(pg, tag, mode.get(sid))
            if pe: fails.append(f'{tag}: page errors {pe[:3]}')
            if sid == 'B10' and not pg.evaluate("!!document.querySelector('#hud .zaffa.missed')"): fails.append(f'{tag}: zaffa not MISSED')
            if sid == 'G7' and not pg.evaluate("!!document.querySelector('#hud .zaffa.done')"): fails.append(f'{tag}: zaffa not done')
            print('ok' if not any(f.startswith(tag + ':') for f in fails) else 'FAIL', tag, flush=True)

def kiosk(b, enh, pick_s=False):
    pg, pe = mkpage(b)
    pg.goto(URL + '?mode=kiosk&fast=1&sound=off'); pg.wait_for_timeout(800)
    pg.click('#attract'); pg.wait_for_timeout(300)
    import time; t0 = time.time(); pend = None; picked = False; seen = set()
    while time.time() - t0 < 300:
        cur = pg.evaluate('__cx.cur()'); seen.add(cur)
        if pg.evaluate('__cx.attract()') and 'E1' in seen: break
        if cur == 'F3' and not picked and pg.evaluate('!__cx.autoplay()'):
            for e in enh: pg.click(f'.ec[data-id="{e}"]'); pg.wait_for_timeout(120)
            picked = True
        if cur == 'G3' and pick_s and pg.evaluate('!__cx.autoplay()'):
            pg.click('.choice >> nth=0'); pick_s = False
        if not pg.evaluate('__cx.autoplay()') and pg.evaluate('!!__cx.primary()'):
            pend = pend or time.time()
            if time.time() - pend > 1.5: pg.evaluate('__cx.primary().click()'); pend = None
        else: pend = None
        pg.wait_for_timeout(100)
    tag = f'kiosk-{enh}' + ('-s' if pick_s is False and 'A' in enh else '')
    ids = pg.evaluate('__cx.scenes()')
    missing = [i for i in ids if i not in seen]
    if missing: fails.append(f'{tag}: never reached {missing}')
    collect(pg, tag, pg.evaluate('__cx.meta()'))
    if pe: fails.append(f'{tag}: page errors {pe[:3]}')
    print(tag, 'elapsed', round(time.time() - t0, 1), 's (~x10 real)', 'fly', pg.evaluate('__cx.state.fly'), flush=True)

if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'; ids = sys.argv[2:]
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=EXE)
        if what in ('scenes', 'all'): scenes(b, ids, ['', '&enh=ACE&fly=p', '&enh=BDF', '&enh=C'])
        if what in ('rm', 'all'): scenes(b, ids or ['B2', 'B7', 'B10', 'G6', 'G7'], [''], reduced=True)
        if what in ('kiosk', 'all'):
            kiosk(b, 'ACE'); kiosk(b, 'BDF'); kiosk(b, 'A', pick_s=True)
        b.close()
    print('\n'.join(fails) or 'ALL CHECKS PASSED')
    sys.exit(1 if fails else 0)
