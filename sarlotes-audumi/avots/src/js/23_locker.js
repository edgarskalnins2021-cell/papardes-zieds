/* ================= 12. oranžais pakomāts ================= */
const LK = { x: 172, y: 100, cw: 64, uh: 52 };
const LK_COLS = [[1, 1, 2, 2], [3, 1, 2], [2, 1, 1, 2], [1, 3, 2]];
scene('locker', {
  hints: ['l_hint'],
  enter() {
    setMin(Math.max(D.min, 9 * 60 + 54));
    const ps = (D.parcels && D.parcels.length) ? D.parcels : [{ no: 1101, size: 1 }, { no: 1102, size: 2 }, { no: 1103, size: 3 }, { no: 1104, size: 1 }, { no: 1105, size: 2 }];
    let nL = 0; this.par = ps.map((p, i) => { let size = p.size; if (size === 3 && ++nL > 2) size = 2; return { ...p, size, i, slot: null, x: 0, y: 0, drag: false }; });
    this.slots = []; LK_COLS.forEach((col, c) => { let r = 0; col.forEach(h => { this.slots.push({ c, r, h, occ: true, par: null }); r += h; }); });
    // brīvas: tieši vajadzīgie izmēri + divas liekas
    const need = this.par.map(p => p.size).concat([1, 2]);
    for (const s of shuffle(this.slots.slice())) { const k = need.indexOf(s.h); if (k >= 0) { s.occ = false; need.splice(k, 1); } }
    this.layoutGround(); this.drag = null; this.fin = false; this.closeT = 0; this.waste = 0;
    ui.task('Ieliec katru paku brīvā nodalījumā, kurā tā ietilpst.', 'Velc paku uz atvērtu durtiņu. Lielai pakai vajag lielu nodalījumu!');
  },
  slotR(s) { return R(LK.x + s.c * LK.cw + 3, LK.y + s.r * LK.uh + 3, LK.cw - 6, s.h * LK.uh - 6); },
  pSize(p) { return { w: LK.cw - 14, h: p.size * LK.uh - 14 }; },
  layoutGround() { let x = 40; this.par.forEach(p => { if (p.slot) return; const sz = this.pSize(p); if (!p.drag) { p.x = x + sz.w / 2; p.y = 590 - sz.h / 2; } x += 98; }); },
  down(x, y) {
    if (this.fin) return;
    for (const p of this.par) {
      const sz = this.pSize(p);
      if (Math.abs(x - p.x) < sz.w / 2 + 6 && Math.abs(y - p.y) < sz.h / 2 + 6) {
        if (p.slot) { p.slot.par = null; p.slot = null; sfx('paper'); }
        this.drag = p; p.drag = true; p.dx = x - p.x; p.dy = y - p.y; sfx('pop'); progress(); return;
      }
    }
  },
  move(x, y, d) { if (this.drag && d) { this.drag.x = x - this.drag.dx; this.drag.y = y - this.drag.dy; } },
  up() {
    const p = this.drag; if (!p) return; this.drag = null; p.drag = false;
    const s = this.slots.find(s => inR(p.x, p.y, this.slotR(s)));
    if (s && !s.occ && !s.par) {
      if (p.size > s.h) { sfx('bad'); ui.toast('Nelien iekšā! Vajag lielāku nodalījumu.'); }
      else { s.par = p; p.slot = s; const r = this.slotR(s); p.x = r.x + r.w / 2; p.y = r.y + r.h / 2; sfx('klunk'); progress(); if (p.size < s.h) ui.toast('Ietilpst, bet vieta mazliet izšķiesta 🙂'); }
    } else if (s && (s.occ || s.par)) { sfx('bad'); ui.toast(s.occ ? 'Šis nodalījums ir aizņemts.' : 'Tur jau ir paka.'); }
    this.layoutGround();
    if (this.par.every(q => q.slot)) this.finish();
  },
  finish() {
    if (this.fin) return; this.fin = true; this.waste = this.par.filter(p => p.size < p.slot.h).length;
    for (let i = 0; i < this.par.length; i++) setTimeout(() => sfx('klunk'), 200 + i * 220);
    setTimeout(() => { sfx('win'); ui.say('l_done', () => {
      award(10 + (this.waste ? 0 : 6), 300, 260); addMin(2); D.openAt = null;
      chat(this.waste ? 'l_dace' : 'l_zane_tetris', .2);
      ui.task('Pakas nosūtītas! Ātri atpakaļ — klientes jau gaida pie durvīm.');
      ui.btns([{ t: '🏪 Atvērt veikalu!', id: 'goBtn', fn: () => go('open') }]);
    }); }, 1400);
  },
  update(dt) { if (this.fin) this.closeT += dt; addMin(dt / 25 / TK()); },
  draw() {
    box(0, 0, W, 90, lgrad(0, 0, 0, 90, ['#a9cce3', '#f8d9b0'])); box(0, 90, W, 360, '#d7c4a3');
    for (let j = 90; j < 450; j += 22) for (let i = (j / 22 % 2) * 24; i < W; i += 48) boxS(i, j, 46, 20, '#d9c6a5', 2, 'rgba(120,90,60,.25)', 1);
    box(0, 450, W, 150, '#b3a89a');
    // pakomāts
    box(LK.x - 20, LK.y - 30, LK.cw * 4 + 40, LK.uh * 6 + 56, '#e67e22', 12); box(LK.x - 20, LK.y - 30, LK.cw * 4 + 40, 22, '#d35400', 12);
    txt('PAKOMĀTS', LK.x + LK.cw * 2, LK.y - 19, 14, '#fff', 'center', 800);
    box(LK.x + LK.cw * 4 + 26, LK.y + 40, 60, 120, '#d35400', 8); box(LK.x + LK.cw * 4 + 34, LK.y + 50, 44, 34, '#1b2631', 4); for (let i = 0; i < 9; i++) box(LK.x + LK.cw * 4 + 36 + (i % 3) * 14, LK.y + 92 + Math.floor(i / 3) * 18, 11, 13, '#fdebd0', 2);
    for (const s of this.slots) {
      const r = this.slotR(s);
      if (s.occ) { box(r.x, r.y, r.w, r.h, '#f0b27a', 4); circ(r.x + r.w - 10, r.y + r.h / 2, 3, '#a04000'); }
      else { box(r.x, r.y, r.w, r.h, '#4d3b2f', 4); box(r.x + 3, r.y + 3, r.w - 6, r.h - 6, '#5d4a3c', 3); if (!s.par) txt(['', 'S', 'M', 'L'][s.h], r.x + r.w / 2, r.y + r.h / 2, 18, 'rgba(255,255,255,.55)', 'center', 800); }
    }
    for (const p of this.par) {
      if (this.drag === p) continue; this.drawParcel(p);
    }
    if (this.drag) this.drawParcel(this.drag);
    if (this.fin) for (const s of this.slots) if (s.par) { const r = this.slotR(s), k = clamp((this.closeT - s.par.i * .22) * 3, 0, 1); box(r.x, r.y, r.w * k, r.h, '#f0b27a', 4); }
    if (!this.fin) box(20, 470, 560, 4, 'rgba(0,0,0,.08)');
  },
  drawParcel(p) {
    const sz = this.pSize(p);
    box(p.x - sz.w / 2, p.y - sz.h / 2, sz.w, sz.h, '#c49a6c', 5); box(p.x - 5, p.y - sz.h / 2, 10, sz.h, 'rgba(240,230,200,.75)');
    box(p.x - sz.w / 2 + 6, p.y - 10, sz.w - 12, 18, '#fff', 2); box(p.x - sz.w / 2 + 6, p.y - 10, sz.w - 12, 5, '#e67e22', 2);
    txt(['', 'S', 'M', 'L'][p.size], p.x, p.y + 3, 12, '#2b2420', 'center', 800);
  },
  auto() {
    const b = $('#goBtn'); if (b) { b.click(); return; }
    if (ui.sayOpen || this.fin) return;
    const p = this.par.filter(p => !p.slot).sort((a, b) => b.size - a.size)[0]; if (!p) return;
    const s = this.slots.filter(s => !s.occ && !s.par && s.h >= p.size).sort((a, b) => a.h - b.h)[0]; if (!s) return;
    const r = this.slotR(s); this.down(p.x, p.y); this.move(r.x + r.w / 2 + (p.x - this.drag.x), r.y + r.h / 2, true);
    this.drag.x = r.x + r.w / 2; this.drag.y = r.y + r.h / 2; this.up();
  }
});
