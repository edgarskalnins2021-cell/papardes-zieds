/* ================= kopīgās minispēles: sūkšana, griešana, pasūtījums, atlikums, kafija, nauda, printeris ================= */

/* ---------- putekļu sūcējs (kā PowerWash: tīrs tur, kur velc) ---------- */
function makeVac(amount = 1) {
  const n = 12, cell = W / n, grid = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const d = r < 2 ? 0 : clamp(amount * (.55 + fr() * .6), 0, 1); grid.push({ c, r, d, d0: d, fx: fr(), fy: fr(), k: Math.floor(fr() * 4) }); }
  const v = {
    grid, cell, x: W / 2, y: 420, on: false, done: false, cleanT: 0, dingN: 0, t: 0,
    total() { return grid.reduce((a, q) => a + q.d0, 0) || 1; },
    pct() { return 1 - grid.reduce((a, q) => a + q.d, 0) / this.total(); },
    update(dt) { this.t += dt; },
    down(x, y) { this.on = true; this.x = x; this.y = y; loop('vac', true); },
    move(x, y, d) {
      if (!d || !this.on || this.done) return;
      const md = dist(x, y, this.x, this.y); this.x = x; this.y = y;
      for (const q of grid) { if (q.d <= 0) continue; const cx = q.c * cell + cell / 2, cy = q.r * cell + cell / 2; if (dist(cx, cy, x, y) < 52) { q.d = Math.max(0, q.d - (.05 + md * .012)); if (q.d === 0) { this.dingN++; if (this.dingN % 5 === 0) sfx('ding'); progress(); } } }
      if (this.pct() >= .92) { this.done = true; this.on = false; loop('vac', false); for (const q of grid) q.d = 0; sfx('sparkle'); burst(W / 2, H / 2, ['#fff', '#aed6f1'], 20); }
    },
    up() { this.on = false; loop('vac', false); },
    draw() {
      tiles(0, 0, W, H, 50);
      for (const q of grid) {
        if (q.d <= .01) continue; g.globalAlpha = q.d; const x = q.c * cell, y = q.r * cell;
        for (let i = 0; i < 3; i++) {
          const px = x + ((q.fx + i * .37) % 1) * cell, py = y + ((q.fy + i * .53) % 1) * cell;
          if ((q.k + i) % 3 === 0) { g.strokeStyle = ['#c0392b', '#1a9aa0', '#c9961a', '#8e44ad'][(q.k + i) % 4]; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + 10, py - 8, px + 20, py + 4); g.stroke(); }
          else { circ(px, py, 4 + i, 'rgba(140,130,120,.8)'); circ(px + 5, py + 2, 3, 'rgba(170,160,150,.8)'); }
        }
        g.globalAlpha = 1;
      }
      // sūcēja galva
      g.strokeStyle = '#555'; g.lineWidth = 6; g.beginPath(); g.moveTo(this.x, this.y); g.quadraticCurveTo(this.x + 80, this.y + 90, W + 20, H - 40); g.stroke();
      box(this.x - 46, this.y - 14, 92, 28, '#c0392b', 10); box(this.x - 40, this.y + 6, 80, 8, '#2b2420', 3);
      if (this.on) for (let i = 0; i < 3; i++) circ(this.x - 30 + i * 30 + fr() * 6, this.y + 18 + fr() * 6, 2, 'rgba(255,255,255,.6)');
      const p = Math.round(this.pct() * 100); box(150, 14, 300, 34, 'rgba(255,255,255,.9)', 17); box(150, 14, 300 * Math.min(1, p / 92), 34, '#58d68d', 17); txt('Tīrs: ' + p + '%', 300, 32, 22, '#1b4f72', 'center', 800);
    },
    auto() { this.down(25, 140); for (let r = 2; r < 12 && !this.done; r++) for (let c = 0; c < 12 && !this.done; c++) this.move(c * cell + cell / 2, r * cell + cell / 2, true); this.up(); }
  };
  return v;
}

/* ---------- auduma griešana pie mērlentes ---------- */
function makeCut(itemId, target) {
  const it = ITEMS[itemId], maxM = Math.ceil((target + .45) * 2) / 2, x0 = 60, x1 = 560, ppm = (x1 - x0) / maxM;
  const c = {
    it, target, maxM, len: 0, drag: false, cut: false, cutT: 0, done: false, err: 0,
    lenPx() { return this.len * ppm; },
    down(x, y) { if (this.cut) return; if (y > 200 && y < 470) { this.drag = true; this.move(x, y, true); } },
    move(x, y, d) { if (!d || !this.drag || this.cut) return; this.len = clamp(Math.round((x - x0) / ppm * 100) / 100, 0, maxM); progress(); },
    up() { if (this.drag) { this.drag = false; } },
    doCut() { if (this.cut || this.len < .05) return; this.cut = true; this.err = Math.round(Math.abs(this.len - target) * 100); sfx('scissors'); setTimeout(() => sfx('scissors'), 260); },
    update(dt) { if (this.cut) { this.cutT += dt; if (this.cutT > 1.3 && !this.done) this.done = true; } },
    draw() {
      box(0, 0, W, H, '#e8dccb'); box(20, 150, 560, 340, '#fbfcfc', 10); box(20, 476, 560, 14, '#d5d8dc', 6);
      // mērlente
      box(x0 - 6, 160, x1 - x0 + 12, 34, '#f7dc6f', 4);
      for (let cm = 0; cm <= maxM * 100; cm += 5) { const x = x0 + cm / 100 * ppm, big = cm % 50 === 0; ln(x, 160, x, 160 + (big ? 14 : cm % 10 === 0 ? 10 : 6), '#7d6608', big ? 2 : 1); if (big) txt(String(cm / 100).replace('.', ','), x, 184, 17, '#7d6608', 'center', 800); }
      const tx = x0 + target * ppm; g.setLineDash([8, 6]); ln(tx, 196, tx, 470, 'rgba(39,174,96,.9)', 3); g.setLineDash([]); txt('vajag ' + m2(target), tx, 212, 18, '#1e8449', 'center', 800);
      // rullis un audums
      const L = this.lenPx();
      g.save(); g.beginPath(); g.rect(x0, 230, Math.max(0, L), 210); g.clip(); pattern(x0, 230, W, 210, it.p, it.c, it.c2); g.restore();
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(x0, 230, Math.max(0, L), 210);
      box(24, 222, 40, 226, it.c, 10); pattern(26, 224, 36, 222, it.p, it.c, it.c2); ell(44, 222, 20, 8, 'rgba(0,0,0,.18)');
      if (!this.cut) { circ(x0 + L, 335, 24, '#c2410c'); txt('↔', x0 + L, 336, 24, '#fff', 'center', 800); }
      else { const k = Math.min(1, this.cutT / .8); ln(x0 + L, 230, x0 + L, 230 + 210 * k, '#2b2420', 3); g.save(); g.translate(x0 + L, 230 + 210 * k); accIcon('scissors', 0, 0, .9); g.restore(); }
      // rādījums
      box(70, 34, 460, 104, '#fff', 16); txt('Nogriezts: ' + m2(this.len), 300, 68, 34, '#2b2420', 'center', 800); txt('Vajag: ' + m2(target) + ' · ' + it.n, 300, 110, 19, '#6b5e55', 'center', 700);
      if (this.cut && this.cutT > .8) txtO(this.err <= 2 ? 'Precīzi! ✨' : this.err <= 6 ? 'Labi!' : 'Mazliet greizi…', 300, 540, 30, '#fff', this.err <= 6 ? '#1e8449' : '#c0392b');
      if (!this.cut && this.len === 0) txtO('Velc audumu pa labi →', 300, 540, 24, '#fff', '#c2410c');
    },
    auto() { if (!this.cut) { this.len = target; this.doCut(); } }
  };
  return c;
}

/* ---------- interneta pasūtījums: savākt → nogriezt → sapakot → uzlīme → kastē ---------- */
const ORDER_POOL = [
  [['f_leaves', 1.5], ['a_thread_o', 1]], [['y_mustard', 3], ['a_needles', 1]], [['y_white', 2], ['a_hook', 1]], [['f_linen', 2], ['a_buttons', 1]],
  [['f_lining', .75], ['a_zip', 1]], [['f_fleece', 1.2], ['a_thread_w', 1]], [['y_teal', 4]], [['f_stars', 1], ['a_tape', 1]], [['y_pink', 2], ['y_grey', 2], ['a_needles', 1]],
  [['f_velvet', .8], ['a_scissors', 1]], [['y_red', 3], ['a_hook', 1]], [['f_stripe', 1.4], ['a_thread_w', 1]], [['y_navy', 2], ['y_green', 1]], [['f_flower', .5], ['a_buttons', 1]]
];
const NAMES = ['Ilze K.', 'Daina S.', 'Rūta B.', 'Inese L.', 'Marika V.', 'Aija Z.', 'Sandra P.', 'Liga M.', 'Gunta R.', 'Agnese T.', 'Baiba O.', 'Evita D.'];
function makeOrder(tpl) {
  const lines = tpl.map(([id, q]) => ({ id, q, got: 0 }));
  const fab = lines.filter(l => ITEMS[l.id].cat === 'aud').length;
  return { no: ri(1040, 1999), who: pick(NAMES), lines, time: (44 + lines.length * 12 + fab * 14) * TK() };
}
function itemsInCat(cat, need) {
  const all = Object.keys(ITEMS).filter(k => ITEMS[k].cat === cat);
  return all.slice(0, 8);
}
function makeOrderFlow(order) {
  const f = {
    order, step: 'pick', tab: 'aud', left: order.time, wrong: 0, cuts: [], cutIx: 0, cutC: null, packT: 0, label: { x: 510, y: 150, drag: false, stuck: false }, dropT: 0, done: false, msg: '', msgT: 0,
    need(id) { const l = order.lines.find(l => l.id === id); return l && l.got < (ITEMS[id].cat === 'dz' ? l.q : 1); },
    allGot() { return order.lines.every(l => l.got >= (ITEMS[l.id].cat === 'dz' ? l.q : 1)); },
    flash(s) { this.msg = s; this.msgT = 1.6; },
    cellR(i) { return R(14 + (i % 4) * 144, 240 + Math.floor(i / 4) * 164, 136, 156); },
    tapItem(id) {
      if (this.need(id)) { order.lines.find(l => l.id === id).got++; sfx('pop'); progress(); burst(300, 560, ITEMS[id].c || '#c2410c', 6, 90); if (this.allGot()) setTimeout(() => this.afterPick(), 350); }
      else { this.wrong++; this.left -= 3; sfx('bad'); this.flash(order.lines.some(l => l.id === id) ? 'Tā jau ir grozā!' : 'Tas nav pasūtījumā!'); }
    },
    afterPick() {
      this.cuts = order.lines.filter(l => ITEMS[l.id].cat === 'aud');
      if (this.cuts.length) { this.step = 'cut'; this.cutIx = 0; this.cutC = makeCut(this.cuts[0].id, this.cuts[0].q); this.onStep && this.onStep(); }
      else { this.step = 'pack'; this.onStep && this.onStep(); }
    },
    nextCut() {
      this.cuts[this.cutIx].err = this.cutC.err; D.cuts.push(this.cutC.err); this.cutIx++;
      if (this.cutIx < this.cuts.length) { this.cutC = makeCut(this.cuts[this.cutIx].id, this.cuts[this.cutIx].q); }
      else { this.step = 'pack'; this.cutC = null; }
      this.onStep && this.onStep();
    },
    pack() { if (this.step !== 'pack' || this.packT) return; this.packT = .01; sfx('paper'); progress(); },
    update(dt) {
      if (this.done) return;
      if (!ui.busy()) this.left -= dt;
      if (this.msgT > 0) this.msgT -= dt;
      if (this.step === 'cut' && this.cutC) { this.cutC.update(dt); if (this.cutC.done) this.nextCut(); }
      if (this.step === 'pack' && this.packT) { this.packT += dt; if (this.packT > 1.1) { this.step = 'label'; this.onStep && this.onStep(); } }
      if (this.step === 'drop') { this.dropT += dt; if (this.dropT > .9) { this.done = true; } }
    },
    toBox() { if (this.step !== 'label' || !this.label.stuck) return; this.step = 'drop'; this.dropT = 0; sfx('klunk'); },
    down(x, y) {
      if (this.step === 'pick') {
        CATS.forEach(([k], i) => { if (inR(x, y, R(14 + i * 192, 186, 184, 48))) { this.tab = k; sfx('tap'); } });
        itemsInCat(this.tab).forEach((id, i) => { if (inR(x, y, this.cellR(i))) this.tapItem(id); });
      } else if (this.step === 'cut') this.cutC.down(x, y);
      else if (this.step === 'pack') { if (inR(x, y, R(170, 230, 260, 220))) this.pack(); }
      else if (this.step === 'label' && !this.label.stuck) { if (dist(x, y, this.label.x, this.label.y) < 70) { this.label.drag = true; this.ldx = x - this.label.x; this.ldy = y - this.label.y; sfx('paper'); } }
      else if (this.step === 'label' && this.label.stuck) { if (inR(x, y, R(170, 230, 260, 220))) this.toBox(); }
    },
    move(x, y, d) {
      if (this.step === 'cut') this.cutC.move(x, y, d);
      if (this.step === 'label' && this.label.drag) { this.label.x = x - this.ldx; this.label.y = y - this.ldy; }
    },
    up(x, y) {
      if (this.step === 'cut') this.cutC.up(x, y);
      if (this.step === 'label' && this.label.drag) {
        this.label.drag = false;
        if (inR(this.label.x, this.label.y, R(180, 250, 240, 190))) { this.label.stuck = true; this.label.x = 300; this.label.y = 330; sfx('stamp'); progress(); this.onStep && this.onStep(); }
        else { this.label.x = 510; this.label.y = 150; }
      }
    },
    drawTicket(y0) {
      box(14, y0, 572, 168, '#fffdf8', 10); for (let i = 0; i < 29; i++) poly([14 + i * 20, y0 + 168, 24 + i * 20, y0 + 178, 34 + i * 20, y0 + 168], '#fffdf8');
      txt('Pasūtījums Nr. ' + order.no, 30, y0 + 24, 23, '#2b2420', 'left', 800); txt(order.who + ' · pakomāts', 30, y0 + 50, 17, '#6b5e55', 'left', 600);
      order.lines.forEach((l, i) => {
        const it = ITEMS[l.id], y = y0 + 82 + i * 30, ok = l.got >= (it.cat === 'dz' ? l.q : 1);
        txt((ok ? '✅ ' : '◻️ ') + it.n + '  ·  ' + (it.cat === 'aud' ? m2(l.q) : it.cat === 'dz' ? l.got + '/' + l.q + ' gab.' : '1 gab.'), 26, y, 20, ok ? '#1e8449' : '#2b2420', 'left', 700);
      });
      const k = clamp(this.left / order.time, 0, 1), cx = 540, cy = y0 + 42;
      circ(cx, cy, 30, '#eaecee'); g.fillStyle = k > .3 ? '#27ae60' : '#e67e22'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 30, -Math.PI / 2, -Math.PI / 2 + k * 6.283); g.closePath(); g.fill();
      txt(this.left > 0 ? Math.ceil(this.left) : '!', cx, cy + 1, 20, '#2b2420', 'center', 800);
    },
    draw() {
      if (this.step === 'cut') { this.cutC.draw(); txtO('Pasūtījums Nr. ' + order.no + ' · ' + (this.cutIx + 1) + '/' + this.cuts.length + ' audums', 300, 18, 16, '#fff', '#3b2f2a'); this.drawMsg(); return; }
      box(0, 0, W, H, '#efe4d4');
      if (this.step === 'pick') {
        this.drawTicket(8);
        CATS.forEach(([k, n], i) => { const r = R(14 + i * 192, 186, 184, 48), on = this.tab === k; box(r.x, r.y, r.w, r.h, on ? '#c2410c' : '#fff', 12); txt(n, r.x + r.w / 2, r.y + 25, 22, on ? '#fff' : '#2b2420', 'center', 800); });
        itemsInCat(this.tab).forEach((id, i) => {
          const r = this.cellR(i), it = ITEMS[id], l = order.lines.find(q => q.id === id);
          box(r.x, r.y, r.w, r.h, '#fff', 12); if (l && l.got) { g.strokeStyle = '#27ae60'; g.lineWidth = 4; rr(r.x + 2, r.y + 2, r.w - 4, r.h - 4, 12); g.stroke(); }
          drawItem(id, r.x + r.w / 2, r.y + 50, .82);
          wrapTxt(it.n, r.x + r.w / 2, r.y + 104, r.w - 8, 18, 21, '#2b2420', 'center', 700);
          if (l && l.got) { circ(r.x + r.w - 18, r.y + 18, 13, '#27ae60'); txt(String(l.got), r.x + r.w - 18, r.y + 19, 14, '#fff', 'center', 800); }
        });
      } else {
        this.drawTicket(-200 + (this.step === 'pack' ? 0 : 0));
        // kaste
        const shut = this.step !== 'pack' || this.packT > .7, dy = this.step === 'drop' ? easeOut(Math.min(1, this.dropT)) * 330 : 0, sc = 1 - (this.step === 'drop' ? Math.min(1, this.dropT) * .5 : 0);
        g.save(); g.translate(300, 340 + dy); g.scale(sc, sc);
        box(-120, -70, 240, 150, '#c49a6c', 8); box(-120, -70, 240, 18, '#a77b4f', 6);
        if (!shut) { poly([-120, -70, -150, -120, -10, -120, 0, -70], '#d6b48a'); poly([120, -70, 150, -120, 10, -120, 0, -70], '#d6b48a'); }
        else { box(-120, -78, 240, 16, '#b08455', 6); box(-14, -78, 28, 158, 'rgba(240,230,200,.7)'); }
        if (this.step === 'pack' && !shut) { order.lines.forEach((l, i) => { const k = this.packT ? Math.min(1, this.packT * 1.8) : 0; drawItem(l.id, lerp(-150 + i * 150, -40 + i * 40, k), lerp(-170, -30, k), .55); }); }
        if (this.label.stuck) { box(-70, -30, 140, 70, '#fff', 4); box(-70, -30, 140, 16, '#e67e22', 4); txt('PAKOMĀTS', 0, -22, 11, '#fff', 'center', 800); txt('Nr. ' + order.no, 0, 2, 15, '#2b2420', 'center', 800); for (let i = 0; i < 18; i++) box(-58 + i * 6.5, 18, i % 3 ? 2 : 4, 16, '#2b2420'); }
        g.restore();
        if (this.step === 'label' && !this.label.stuck) {
          const L = this.label; box(L.x - 70, L.y - 35, 140, 70, '#fff', 4); box(L.x - 70, L.y - 35, 140, 16, '#e67e22', 4); txt('PAKOMĀTS', L.x, L.y - 27, 11, '#fff', 'center', 800); txt('Nr. ' + order.no, L.x, L.y - 3, 15, '#2b2420', 'center', 800); for (let i = 0; i < 18; i++) box(L.x - 58 + i * 6.5, L.y + 13, i % 3 ? 2 : 4, 16, '#2b2420');
          if (!L.drag) arrow(L.x - 110, L.y + 60, 2.5, '#c2410c', 1);
        }
        box(150, 548, 300, 50, '#95a5a6', 8); txt('Pelēkā kaste', 300, 573, 17, '#fff', 'center', 800);
        const hint = this.step === 'pack' ? (this.packT ? 'Pako…' : 'Pieskaries kastei, lai sapakotu 📦') : this.step === 'label' ? (this.label.stuck ? 'Pieskaries pakai — ieliec pelēkajā kastē!' : 'Uzlīmē uzlīmi: velc to uz pakas 🏷') : 'Gatavs! ✔';
        txtO(hint, 300, 40, 22, '#fff', '#3b2f2a');
        txt('Pasūtījums Nr. ' + order.no + '  ·  ' + (this.left > 0 ? Math.ceil(this.left) + ' s' : 'kavējas'), 300, 76, 16, '#6b5e55', 'center', 700);
      }
      this.drawMsg();
    },
    drawMsg() { if (this.msgT > 0) { g.globalAlpha = Math.min(1, this.msgT * 2); box(150, 520, 300, 44, '#c0392b', 12); txt(this.msg, 300, 542, 19, '#fff', 'center', 800); g.globalAlpha = 1; } },
    auto() {
      if (this.step === 'pick') { const l = order.lines.find(l => l.got < (ITEMS[l.id].cat === 'dz' ? l.q : 1)); if (l) { this.tab = ITEMS[l.id].cat; this.tapItem(l.id); } }
      else if (this.step === 'cut' && this.cutC && !this.cutC.cut) this.cutC.auto();
      else if (this.step === 'pack') this.pack();
      else if (this.step === 'label') { if (!this.label.stuck) { this.down(this.label.x, this.label.y); this.move(300, 330, true); this.up(300, 330); } else this.toBox(); }
    }
  };
  return f;
}
function orderCoins(f) {
  const cutBonus = f.cuts.reduce((a, l) => a + (l.err <= 2 ? 4 : l.err <= 6 ? 2 : 0), 0);
  return Math.max(3, 8 + (f.left > 0 ? 4 : 0) + cutBonus - f.wrong);
}

/* ---------- atlikuma izdošana (kā Supermarket Simulator) ---------- */
const DENOM = [1000, 500, 200, 100, 50, 20, 10];
function optimalCount(c) { let n = 0; for (const d of DENOM) { n += Math.floor(c / d); c %= d; } return n; }
function makePay(totalC, givenC) {
  const p = {
    total: totalC, given: givenC, due: givenC - totalC, tray: [], done: false, err: false, ok: false, t: 0,
    sum() { return this.tray.reduce((a, b) => a + b, 0); },
    slotR(i) { return i < 2 ? R(24 + i * 186, 168, 176, 104) : R(24 + ((i - 2) % 5) * 112, 290, 104, 104); },
    down(x, y) {
      if (this.ok) return;
      DENOM.forEach((d, i) => { if (inR(x, y, this.slotR(i))) { this.tray.push(d); sfx('coin'); progress(); if (this.sum() > this.due) { this.err = true; sfx('bad'); } } });
      if (inR(x, y, R(24, 540, 240, 50))) { this.tray = []; this.err = false; sfx('paper'); }
      if (inR(x, y, R(336, 540, 240, 50)) && this.sum() === this.due) { this.ok = true; sfx('cash'); }
    },
    update(dt) { this.t += dt; if (this.ok) { this.okT = (this.okT || 0) + dt; if (this.okT > .8) this.done = true; } },
    draw() {
      box(0, 0, W, H, '#e8dccb');
      box(24, 14, 552, 136, '#fffdf8', 10);
      txt('Pirkums: ' + eur(this.total / 100), 44, 40, 23, '#2b2420', 'left', 700); txt('Iedeva: ' + eur(this.given / 100), 44, 72, 23, '#2b2420', 'left', 700);
      txt('Jāizdod: ' + eur(this.due / 100), 44, 116, 34, '#c2410c', 'left', 800);
      DENOM.forEach((d, i) => {
        const r = this.slotR(i); box(r.x, r.y, r.w, r.h, '#6d4c41', 10); box(r.x + 6, r.y + 6, r.w - 12, r.h - 12, '#8d6e63', 8);
        if (d >= 500) { const col = d === 1000 ? '#e59866' : '#a9cce3'; for (let k = 0; k < 3; k++) box(r.x + 16 + k * 3, r.y + 18 + k * 3, r.w - 40, r.h - 44, col, 4); txt((d / 100) + ' €', r.x + r.w / 2 + 3, r.y + r.h / 2 + 3, 30, '#2b2420', 'center', 800); }
        else { const gold = d >= 100 || d === 50 || d === 20 || d === 10; const col = d >= 100 ? '#d4ac0d' : '#ca6f1e'; circ(r.x + r.w / 2, r.y + r.h / 2, d >= 100 ? 36 : 32, col); ring(r.x + r.w / 2, r.y + r.h / 2, d >= 100 ? 28 : 25, 'rgba(255,255,255,.4)', 2); txt(d >= 100 ? (d / 100) + ' €' : d + ' c', r.x + r.w / 2, r.y + r.h / 2 + 1, 23, '#2b2420', 'center', 800); }
      });
      box(24, 410, 552, 116, this.err ? '#fadbd8' : '#fffdf8', 10);
      txt('Izdots: ' + eur(this.sum() / 100), 44, 438, 26, this.err ? '#c0392b' : '#2b2420', 'left', 800);
      this.tray.slice(-14).forEach((d, i) => { const x = 60 + i * 37, y = 488; if (d >= 500) box(x - 16, y - 20, 34, 40, d === 1000 ? '#e59866' : '#a9cce3', 4); else circ(x, y, 15, d >= 100 ? '#d4ac0d' : '#ca6f1e'); txt(d >= 100 ? String(d / 100) : String(d), x, y + 1, 12, '#2b2420', 'center', 800); });
      if (this.err) txt('Par daudz! «No jauna»', 556, 438, 20, '#c0392b', 'right', 800);
      box(24, 540, 240, 52, '#fff', 12); txt('↺ No jauna', 144, 567, 24, '#2b2420', 'center', 800);
      const can = this.sum() === this.due; box(336, 540, 240, 52, can ? '#27ae60' : '#bdc3c7', 12); txt('✔ Atdot', 456, 567, 26, '#fff', 'center', 800);
      if (this.ok) txtO('Paldies! 💶', 300, 300, 40, '#fff', '#1e8449');
    },
    auto() { if (this.ok) return; if (this.err) { this.tray = []; this.err = false; return; } let r = this.due - this.sum(); const d = DENOM.find(d => d <= r); if (d) { const i = DENOM.indexOf(d), q = this.slotR(i); this.down(q.x + 10, q.y + 10); } else this.down(400, 560); }
  };
  return p;
}

/* ---------- sava stiprā kafija (automāts) ---------- */
function makeBrew() {
  const b = {
    beans: 0, run: false, level: 0, stopped: false, done: false, res: '', t: 0, n: 0,
    down(x, y) {
      if (this.beans < 3) { if (inR(x, y, R(30, 300, 150, 190))) { this.beans++; sfx('rattle'); progress(); burst(250, 150, '#5d4037', 8, 80); } return; }
      if (!this.run && !this.stopped) { if (dist(x, y, 430, 150) < 50 || inR(x, y, R(200, 60, 300, 400))) { this.run = true; loop('pour', true); sfx('hum'); } return; }
      if (this.run) this.stop();
    },
    stop() { if (!this.run) return; this.run = false; this.stopped = true; loop('pour', false); const l = this.level; this.n = l >= .72 && l <= .86 ? 12 : l > 1 ? 3 : 7; this.res = l >= .72 && l <= .86 ? 'Ideāla stipra kafija! ☕✨' : l > 1 ? 'Ups, pāri malām!' : 'Kafija ir! Ahh…'; sfx(this.n >= 12 ? 'win' : 'ok'); setTimeout(() => this.done = true, 1100); },
    update(dt) { this.t += dt; if (this.run) { this.level += dt * .3; progress(); if (this.level > 1.05) this.stop(); } },
    draw() {
      box(0, 0, W, H, '#efe2cf'); box(0, 470, W, 130, '#a1887f');
      box(200, 40, 300, 440, '#424949', 20); box(220, 60, 260, 70, '#1b2631', 10);
      txt(this.beans < 3 ? 'Kafija: ' + this.beans + '/3' : this.run ? 'Gatavo…' : this.stopped ? 'Gatavs' : 'Spied ▶', 340, 95, 22, '#7dcea0', 'center', 800);
      circ(430, 150, 30, this.run ? '#e74c3c' : '#27ae60'); txt(this.run ? '■' : '▶', 430, 152, 26, '#fff');
      box(300, 180, 80, 40, '#2c3e50', 6); box(330, 220, 20, 20, '#566573');
      const x = 270, y = 300, w = 140, h = 160; box(x - 10, y + h, w + 20, 14, '#2b2420', 6);
      g.save(); rr(x, y, w, h, 16); g.clip(); box(x, y, w, h, '#fdfefe'); box(x, y + h - h * Math.min(1, this.level), w, h * Math.min(1, this.level), '#3e2723'); g.restore();
      g.strokeStyle = '#bdc3c7'; g.lineWidth = 4; rr(x, y, w, h, 16); g.stroke();
      const yA = y + h - h * .86, yB = y + h - h * .72; box(x - 26, yA, 18, yB - yA, '#58d68d', 4); box(x + w + 8, yA, 18, yB - yA, '#58d68d', 4);
      if (this.run) box(336, 240, 8, y + h - h * Math.min(1, this.level) - 240, '#3e2723', 3);
      // kafijas maiss
      box(40, 300, 130, 180, '#8d6e63', 18); box(56, 330, 98, 60, '#f5cba7', 8); txt('KAFIJA', 105, 360, 18, '#5d4037', 'center', 800);
      if (this.beans < 3) { ring(105, 390, 80 + Math.sin(TT * 6) * 6, 'rgba(255,255,255,.7)', 4); txtO('Pieskaries maisam 3×', 300, 540, 22, '#fff', '#5d4037'); }
      else if (!this.run && !this.stopped) txtO('Spied zaļo ▶ pogu!', 300, 540, 22, '#fff', '#1e8449');
      else if (this.run) txtO('Pieskaries, lai apturētu pie svītras!', 300, 540, 22, '#fff', '#c2410c');
      if (this.res) txtO(this.res, 300, 260, 26, '#fff', '#5d4037');
    },
    auto() { if (this.beans < 3) this.down(100, 380); else if (!this.run && !this.stopped) this.down(430, 150); else if (this.run && this.level > .78) this.stop(); }
  };
  return b;
}

/* ---------- kases ieslēgšana un naudas skaitīšana ---------- */
const DRAWER = [[2000, 2], [1000, 5], [500, 3], [200, 6], [100, 8], [50, 4]];
function makeCash() {
  const c = {
    ph: 'power', counted: [], found: false, done: false, t: 0, float: 13200, countT: 0,
    sum() { return this.counted.reduce((a, i) => a + DRAWER[i][0] * DRAWER[i][1], 0) + (this.found ? 500 : 0); },
    slotR(i) { return R(30 + (i % 3) * 184, 250 + Math.floor(i / 3) * 120, 172, 108); },
    down(x, y) {
      if (this.ph === 'power') { if (dist(x, y, 520, 90) < 46) { this.ph = 'count'; sfx('beep'); sfx('cash'); progress(); } return; }
      if (this.ph === 'count') { DRAWER.forEach((d, i) => { if (!this.counted.includes(i) && inR(x, y, this.slotR(i))) { this.counted.push(i); sfx('paper'); setTimeout(() => sfx('coin'), 150); progress(); if (this.counted.length === DRAWER.length) { this.ph = 'missing'; setTimeout(() => { sfx('bad'); chat('p_zane_5'); }, 400); } } }); return; }
      if (this.ph === 'missing') { if (inR(x, y, R(30, 500, 540, 70))) { this.found = true; this.ph = 'ok'; sfx('win'); burst(300, 530, ['#a9cce3', '#fff'], 14); progress(); setTimeout(() => this.done = true, 1300); } }
    },
    update(dt) { this.t += dt; },
    draw() {
      box(0, 0, W, H, '#e8dccb');
      // kase un čeks
      box(330, 20, 250, 140, '#2c3e50', 10); box(345, 34, 140, 70, this.ph === 'power' ? '#1b2631' : '#58d68d', 6);
      txt(this.ph === 'power' ? '' : 'LABRĪT!', 415, 70, 20, '#145a32', 'center', 800);
      circ(520, 90, 30, this.ph === 'power' ? '#27ae60' : '#7f8c8d'); txt('⏻', 520, 92, 28, '#fff');
      box(30, 20, 280, 190, '#fffdf8', 6); txt('Vakardienas čeks', 170, 44, 17, '#6b5e55', 'center', 700);
      txt('Kases atlikums:', 170, 84, 20, '#2b2420', 'center', 700); txt(eur(this.float / 100), 170, 120, 34, '#2b2420', 'center', 800);
      for (let i = 0; i < 14; i++) poly([30 + i * 20, 210, 40 + i * 20, 220, 50 + i * 20, 210], '#fffdf8');
      if (this.ph === 'power') { txtO('Ieslēdz kasi — spied zaļo pogu!', 300, 400, 24, '#fff', '#1e8449'); ring(520, 90, 40 + Math.sin(TT * 6) * 6, '#fff', 4); return; }
      // atvilktne
      box(20, 236, 560, 256, '#6d4c41', 12);
      DRAWER.forEach(([d, n], i) => {
        const r = this.slotR(i), on = this.counted.includes(i); box(r.x, r.y, r.w, r.h, '#8d6e63', 8);
        if (d >= 500) for (let k = 0; k < Math.min(n, 5); k++) box(r.x + 14 + k * (on ? 24 : 4), r.y + 14 + k * 3, 70, 50, d === 2000 ? '#82e0aa' : d === 1000 ? '#e59866' : '#a9cce3', 4);
        else for (let k = 0; k < n; k++) circ(r.x + 26 + (k % 4) * (on ? 38 : 30), r.y + 30 + Math.floor(k / 4) * 34, 15, d >= 100 ? '#d4ac0d' : '#ca6f1e');
        txt(on ? n + ' × ' + (d / 100) + ' € = ' + (d * n / 100) + ' €' : (d / 100) + ' € · pieskaries', r.x + r.w / 2, r.y + r.h - 14, 17, '#fff', 'center', 800);
      });
      box(30, 500, 540, 70, this.ph === 'missing' ? 'rgba(255,255,255,' + (.35 + Math.sin(TT * 6) * .2) + ')' : 'rgba(255,255,255,.15)', 10);
      const s = this.sum();
      txt('Saskaitīts: ' + eur(s / 100), 300, 586, 25, s === this.float ? '#1e8449' : '#2b2420', 'center', 800);
      if (this.ph === 'missing') { txt('Trūkst ' + eur((this.float - s) / 100) + '! Pameklē zem atvilktnes 👇', 300, 535, 21, '#c0392b', 'center', 800); }
      if (this.ph === 'ok') { box(250, 512, 70, 44, '#a9cce3', 4); txt('5 €', 285, 534, 18, '#2b2420', 'center', 800); txtO('Sakrīt! ✔', 420, 534, 26, '#fff', '#1e8449'); }
    },
    auto() { if (this.ph === 'power') this.down(520, 90); else if (this.ph === 'count') { const i = DRAWER.findIndex((d, i) => !this.counted.includes(i)); const r = this.slotR(i); this.down(r.x + 20, r.y + 20); } else if (this.ph === 'missing') this.down(300, 530); }
  };
  return c;
}

/* ---------- printeris: drukā, iestrēgst, izvelc ---------- */
function makePrinter() {
  const p = {
    ph: 'idle', t: 0, out: 0, jamY: 0, drag: false, sheets: 0, done: false,
    down(x, y) {
      if (this.ph === 'idle' && inR(x, y, R(160, 140, 280, 200))) { this.ph = 'print'; this.t = 0; sfx('print'); progress(); }
      else if (this.ph === 'jam' && inR(x, y, R(200, 60, 200, 140))) { this.drag = true; this.y0 = y; }
    },
    move(x, y, d) { if (this.drag && d) { this.jamY = Math.max(0, this.y0 - y); if (this.jamY > 90) { this.drag = false; this.ph = 'go'; this.t = 0; sfx('paper'); progress(); } } },
    up() { this.drag = false; if (this.ph === 'jam') this.jamY = 0; },
    update(dt) {
      this.t += dt;
      if (this.ph === 'print') { this.out = Math.min(.45, this.t * .6); if (this.t > .9) { this.ph = 'jam'; sfx('rattle'); sfx('bad'); } }
      if (this.ph === 'go') { const n = Math.floor(this.t / .32); if (n > this.sheets && this.sheets < 10) { this.sheets = n; sfx('print'); } if (this.sheets >= 10 && this.t > 3.6) { this.done = true; } }
    },
    draw() {
      box(0, 0, W, H, '#e8dccb'); box(0, 420, W, 180, '#d5c4a1');
      box(150, 200, 300, 200, '#d5d8dc', 18); box(170, 220, 260, 40, '#aab7b8', 8); box(190, 330, 220, 16, '#566573', 6); circ(410, 300, 10, this.ph === 'jam' ? '#e74c3c' : '#27ae60');
      if (this.ph === 'print' || this.ph === 'jam') {
        const top = 220 - this.out * 200 - this.jamY;
        g.save(); g.translate(300, top + 60); if (this.ph === 'jam') g.rotate(Math.sin(TT * 20) * .02);
        box(-80, -60, 160, 120, '#fdfefe', 3); for (let i = 0; i < 5; i++) ln(-60, -40 + i * 18, 40, -40 + i * 18, '#bdc3c7', 2); if (this.ph === 'jam') { ln(-80, 40, 80, 20, 'rgba(0,0,0,.2)', 2); ln(-80, 10, 80, 50, 'rgba(0,0,0,.15)', 2); }
        g.restore();
      }
      for (let i = 0; i < this.sheets; i++) { const lab = i % 2; box(470 + (i % 2) * 8, 400 - i * 6, 100, 70, lab ? '#fff' : '#fdfefe', 3); if (lab) box(470 + 8, 400 - i * 6, 100, 12, '#e67e22', 3); }
      if (this.ph === 'idle') { txtO('Spied printeri — drukāt pasūtījumus! 🖨', 300, 120, 24, '#fff', '#2b2420'); ring(300, 300, 160 + Math.sin(TT * 5) * 6, 'rgba(255,255,255,.6)', 4); }
      if (this.ph === 'jam') { txtO('Papīrs iestrēga! Velc to uz augšu ⬆', 300, 40, 24, '#fff', '#c0392b'); arrow(300, 120 - this.jamY + Math.sin(TT * 6) * 6, -Math.PI / 2, '#c2410c', 1.3); }
      if (this.ph === 'go') txtO('Drukā: ' + Math.min(10, this.sheets) + '/10 (5 pasūtījumi + 5 uzlīmes)', 300, 60, 21, '#fff', '#2b2420');
    },
    auto() { if (this.ph === 'idle') this.down(300, 300); else if (this.ph === 'jam') { this.down(300, 150); this.move(300, 20, true); } }
  };
  return p;
}
