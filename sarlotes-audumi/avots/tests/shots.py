#!/usr/bin/env python3
"""Ekrānuzņēmumi konkrētos brīžos (vizuālai pārbaudei)."""
import sys, os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'file://' + os.path.join(ROOT, 'dist', 'index.html')
OUT = os.path.join(ROOT, 'tests', 'shots'); os.makedirs(OUT, exist_ok=True)
errs = []
def run(w, h, tag):
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': w, 'height': h})
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(400)
        pg.evaluate("SA.S.up = {flowers:1,candy:1,garland:1,lights:1,coffee:1,poster:1,choco:1}; SA.start('shop'); SA.speed(3)")
        pg.wait_for_timeout(1500)
        pg.evaluate("SA.ui.sayNext && SA.ui.sayOpen && SA.ui.sayNext()")
        pg.wait_for_timeout(5500); pg.evaluate('SA.speed(1)')
        pg.screenshot(path=f'{OUT}/{tag}_open_world.png')
        # apkalpo klienti ar jautājumu
        pg.evaluate("(()=>{const s=SA.scn; const c=s.cust.find(c=>c.state==='wait'); if(c){c.kind='quiz'; c.req={id:'q06'}; s.serve(c);} })()")
        pg.wait_for_timeout(400); pg.screenshot(path=f'{OUT}/{tag}_open_quiz.png')
        pg.evaluate("document.querySelector('#sayBtns .btn') && document.querySelector('#sayBtns .btn').click()")
        pg.wait_for_timeout(300); pg.evaluate("SA.ui.sayOpen && SA.ui.sayNext()")
        # samaksa ar skaidru naudu
        pg.evaluate("(()=>{const s=SA.scn; const c=s.cust.find(c=>c.state==='wait'||c.state==='pay')||s.cust[0]; if(c){c.pay={total:1240,given:2000,card:false}; s.startPay(c);} })()")
        pg.wait_for_timeout(300); pg.evaluate("SA.ui.sayOpen && SA.ui.sayNext()"); pg.wait_for_timeout(300)
        pg.evaluate("(()=>{const p=SA.scn.comp; if(p){p.down(40,180); p.down(250,300);} })()")
        pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/{tag}_pay.png')
        pg.evaluate("(()=>{const s=SA.scn; s.comp=null; const o=makeOrder(ORDER_POOL[8]); s.ordersQ.push(o); s.openOrder(); s.comp.tapItem('y_pink'); })()")
        pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/{tag}_order_pick.png')
        pg.evaluate("(()=>{const s=SA.scn; s.comp=null; s.point=s.cust[0]||null; if(s.point){s.point.req={id:'w_zip',zone:'sup',tries:0}} })()")
        pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/{tag}_point.png')
        # atskaite
        pg.evaluate("(()=>{SA.scn.point=null; const D=SA.D; Object.assign(D,{cash:84.5,card:126.3,quizOk:5,quizN:6,ordersTotal:10,ordersDone:9,ordersLate:1,hearts:[5,4,4,3,5,2,0,5,4,4,5,3],cuts:[2,4,1,7],cleanSum:8800,cleanN:100,openAt:598,coins:214}); SA.go('close'); })()")
        pg.wait_for_timeout(600); pg.evaluate("SA.ui.sayOpen && SA.ui.sayNext()"); pg.wait_for_timeout(300)
        pg.screenshot(path=f'{OUT}/{tag}_cashq.png')
        pg.evaluate("[...document.querySelectorAll('#sayBtns .btn')][0].click()"); pg.wait_for_timeout(300)
        pg.evaluate("SA.ui.sayOpen && SA.ui.sayNext()"); pg.wait_for_timeout(700)
        pg.screenshot(path=f'{OUT}/{tag}_results.png')
        pg.evaluate("document.querySelectorAll('#ovBox .btn').forEach(b=>{if(b.textContent.includes('Uzlabojumi'))b.click()})"); pg.wait_for_timeout(300)
        pg.screenshot(path=f'{OUT}/{tag}_shop.png')
        b.close()
run(390, 844, 'p'); run(1280, 800, 'd')
print('KĻŪDAS:' if errs else 'Kļūdu nav.', *errs[:12], sep='\n  ')
