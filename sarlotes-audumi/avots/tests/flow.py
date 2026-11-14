#!/usr/bin/env python3
"""Robots izspēlē dienu: python3 tests/flow.py [w h] [līdz_ainai]"""
import sys, os, time, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'file://' + os.path.join(ROOT, 'dist', 'index.html')
w, h = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (390, 844)
stop_at = sys.argv[3] if len(sys.argv) > 3 else 'close'
SHOTS = os.path.join(ROOT, 'tests', 'shots'); os.makedirs(SHOTS, exist_ok=True)
ORDER = ['call', 'morning', 'bike', 'cafe', 'run', 'keys', 'alarm', 'shutter', 'dark', 'prep', 'orders', 'locker', 'open', 'close']

errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.screenshot(path=f'{SHOTS}/{w}x{h}_00_title.png')
    pg.click('#startBtn'); pg.wait_for_timeout(200)
    pg.fill('#nameIn', 'Anita'); pg.click('#nameOk'); pg.wait_for_timeout(200)
    pg.click('#ovBox .btn >> nth=1'); pg.wait_for_timeout(600)
    pg.evaluate('SA.ui.auto = true')
    for i, sc in enumerate(ORDER):
        t0 = time.time(); shot = False
        while True:
            cur = pg.evaluate('SA.scene')
            if cur != sc: break
            if not shot and time.time() - t0 > 1.2:
                pg.screenshot(path=f'{SHOTS}/{w}x{h}_{i+1:02d}_{sc}.png'); shot = True
            pg.evaluate('SA.auto()'); pg.wait_for_timeout(60)
            if time.time() - t0 > (240 if sc == 'open' else 60):
                print('IESPRŪDA:', sc, pg.evaluate('JSON.stringify({s:SA.scene, t:document.querySelector("#task").innerText, say:document.querySelector("#sayTxt").innerText})'))
                pg.screenshot(path=f'{SHOTS}/{w}x{h}_STUCK_{sc}.png'); errs.append('stuck ' + sc); break
        print(f'{sc:8s} OK  {time.time()-t0:5.1f}s  → {pg.evaluate("SA.scene")}  coins={pg.evaluate("SA.S.coins")}')
        if sc == stop_at or (errs and errs[-1].startswith('stuck')): break
        if sc == 'open': pg.evaluate('SA.speed(1)')
        if ORDER[i+1:i+2] == ['open']: pg.evaluate('SA.speed(4)')
    pg.wait_for_timeout(800)
    pg.screenshot(path=f'{SHOTS}/{w}x{h}_99_end.png')
    b.close()
print('KĻŪDAS:' if errs else 'Kļūdu nav.', *errs[:20], sep='\n  ')
