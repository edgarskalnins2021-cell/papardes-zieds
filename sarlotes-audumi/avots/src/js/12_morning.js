/* ================= 2. rīta steiga: sega, drēbes, zobi, skalošana, mētelis ================= */
const MSTEPS = ['blanket', 'dress', 'teeth', 'rinse', 'coat'];
const MTASK = {
  blanket: 'Nost segu! Velc to uz labo pusi 👉',
  dress: 'Saģērbies: ievelc bikses un kreklu uz silueta!',
  teeth: 'Tīri zobus! Velc birsti šurpu turpu pa zobiem.',
  rinse: 'Izskalo muti: turi pirkstu uz ekrāna, kamēr burbuļo!',
  coat: 'Aizpogā mēteli: spied pogas pēc kārtas no augšas.'
};
scene('morning', {
  hints: ['m_hint1', 'm_hint2'],
  enter() {
    setMin(8 * 60 + 42); this.si = 0; this.time = 90 * TK(); this.left = this.time; this.over = false; this.finished = false;
    this.setStep();
  },
  setStep() {
    this.step = MSTEPS[this.si]; this.st = 0; progress();
    ui.task(MTASK[this.step], 'Jāpaspēj divās minūtēs! ⏱');
    if (this.step === 'blanket') { this.bx = 0; this.fly = 0; }
    if (this.step === 'dress') { this.items = [{ k: 'shirt', x: 110, y: 250, hx: 110, hy: 250, ok: false, zone: R(240, 140, 160, 160) }, { k: 'pants', x: 110, y: 420, hx: 110, hy: 420, ok: false, zone: R(250, 300, 140, 200) }]; this.drag = null; }
    if (this.step === 'teeth') { this.teeth = []; for (let i = 0; i < 6; i++) { this.teeth.push({ x: 196 + i * 36, y: 268, w: 32, h: 38, d: 1 }); this.teeth.push({ x: 196 + i * 36, y: 314, w: 32, h: 34, d: 1 }); } this.brush = { x: 470, y: 470, on: false }; this.bubbles = []; this.bt = 0; }
    if (this.step === 'rinse') { this.hold = false; this.rv = 0; this.spit = 0; }
    if (this.step === 'coat') { this.btn = 0; this.btnPos = [[300, 190], [300, 260], [300, 330], [300, 400]]; this.scarf = 0; }
  },
  next() {
    sfx('ok'); burst(300, 300, LEAFC, 14); this.si++; addMin(1.6);
    if (this.si >= MSTEPS.length) this.finish(); else this.setStep();
  },
  finish() {
    this.finished = true; loop('gargle', false); setMin(8 * 60 + 50);
    const fast = this.left > 0; D.morningOk = fast ? 1 : 0;
    award(10 + Math.min(20, Math.floor(Math.max(0, this.left) / 3)), 300, 250);
    ui.task(fast ? 'Gatava! Un vēl laiks palika. 👏' : 'Gatava! Mazliet ilgāk, bet nekas.');
    chat(fast ? 'm_kitija_fast' : 'm_agrita_slow', .3);
    ui.btns([{ t: '🚲 Uz riteni!', id: 'goBtn', fn: () => go('bike') }]);
  },
  update(dt) {
    if (this.finished) return;
    this.st += dt;
    if (!ui.busy()) { this.left -= dt; if (this.left <= 0 && !this.over) { this.over = true; ui.toast('Laiks gan pāri, bet nekas — ātrāk, ātrāk! 🏃‍♀️'); } }
    if (this.step === 'blanket' && this.fly) { this.fly += dt * 2; this.bx += 900 * dt; if (this.fly > 1.6) this.next(); }
    if (this.step === 'rinse') {
      if (this.spit) { this.spit += dt; if (this.spit > .8) { this.next(); } }
      else if (this.hold) { this.rv += dt / 1.7; if (this.rv >= 1) { this.hold = false; loop('gargle', false); sfx('spit'); this.spit = .01; } }
      else this.rv = Math.max(0, this.rv - dt * .4);
    }
    if (this.step === 'teeth') { for (const b of this.bubbles) { b.l -= dt; b.y -= 10 * dt; } this.bubbles = this.bubbles.filter(b => b.l > 0); }
    if (this.step === 'coat' && this.scarf) { this.scarf += dt; if (this.scarf > .9) this.next(); }
  },
  down(x, y) {
    if (this.finished) return;
    const s = this.step;
    if (s === 'blanket' && !this.fly) { this.drag = { x0: x - this.bx }; }
    if (s === 'dress') { for (const it of this.items) if (!it.ok && dist(x, y, it.x, it.y) < 75) { this.drag = it; it.dx = x - it.x; it.dy = y - it.y; sfx('pop'); break; } }
    if (s === 'teeth') { this.brush.on = true; this.brush.x = x; this.brush.y = y; }
    if (s === 'rinse' && !this.spit) { this.hold = true; loop('gargle', true); }
    if (s === 'coat' && !this.scarf) {
      const p = this.btnPos[this.btn];
      if (dist(x, y, p[0], p[1]) < 34) { this.btn++; sfx('click'); progress(); burst(p[0], p[1], '#fff', 6, 80); if (this.btn >= 4) { this.scarf = .01; sfx('whoosh'); } }
      else if (this.btnPos.some((q, i) => i > this.btn && dist(x, y, q[0], q[1]) < 34)) { sfx('bad'); ui.toast('Pēc kārtas — no augšas uz leju!'); }
    }
  },
  move(x, y, down) {
    if (!down) return;
    const s = this.step;
    if (s === 'blanket' && this.drag && !this.fly) { this.bx = Math.max(0, x - this.drag.x0); if (this.bx > 170) { this.fly = .01; this.drag = null; sfx('whoosh'); } }
    if (s === 'dress' && this.drag) { this.drag.x = x - this.drag.dx; this.drag.y = y - this.drag.dy; }
    if (s === 'teeth' && this.brush.on) {
      const d = dist(x, y, this.brush.x, this.brush.y); this.brush.x = x; this.brush.y = y;
      if (d > 2) {
        this.bt += d;
        if (this.bt > 40) { this.bt = 0; sfx('brush'); }
        for (const t of this.teeth) if (x > t.x - 14 && x < t.x + t.w + 14 && y > t.y - 20 && y < t.y + t.h + 20 && t.d > 0) { t.d = Math.max(0, t.d - d * .006); progress(); if (fr() < .3) this.bubbles.push({ x: x + fr() * 30 - 15, y: y + fr() * 20 - 10, r: 3 + fr() * 6, l: 1 }); }
        if (this.teeth.every(t => t.d <= .04)) { this.brush.on = false; sfx('sparkle'); this.next(); }
      }
    }
  },
  up(x, y) {
    const s = this.step;
    if (s === 'blanket' && this.drag) { this.drag = null; if (!this.fly) this.bx = 0; }
    if (s === 'dress' && this.drag) {
      const it = this.drag; this.drag = null;
      const zone = this.items.find(o => inR(it.x, it.y, o.zone));
      if (zone === it) { it.ok = true; it.x = it.zone.x + it.zone.w / 2; it.y = it.zone.y + it.zone.h / 2; sfx('ok'); progress(); if (this.items.every(o => o.ok)) setTimeout(() => this.next(), 350); }
      else { if (zone) { ui.toast(it.k === 'pants' ? 'Bikses uz pleciem? 😄 Mēģini vēlreiz!' : 'Krekls kājās? 😄 Mēģini vēlreiz!'); sfx('bad'); } it.x = it.hx; it.y = it.hy; }
    }
    if (s === 'teeth') this.brush.on = false;
    if (s === 'rinse' && this.hold) { this.hold = false; loop('gargle', false); }
  },
  key(k, d) { if ((k === ' ' || k === 'Enter') && this.step === 'rinse') { if (d) this.down(300, 300); else this.up(300, 300); return true; } },
  draw() {
    const s = this.step;
    box(0, 0, W, H, s === 'teeth' || s === 'rinse' ? '#d6eaf8' : '#e8dccb');
    if (s === 'blanket') {
      box(70, 90, 460, 490, '#8d6e63', 18); box(86, 104, 428, 462, '#f4ecf7', 12); box(150, 120, 300, 90, '#fdfefe', 30);
      circ(300, 190, 40, '#f1c7a5'); g.fillStyle = '#8a3b1c'; g.beginPath(); g.arc(300, 180, 44, Math.PI * .95, Math.PI * 2.05); g.fill();
      circ(286, 196, 3, '#2b2420'); circ(314, 196, 3, '#2b2420'); g.strokeStyle = '#2b2420'; g.lineWidth = 2; g.beginPath(); g.arc(300, 212, 8, .3, Math.PI - .3); g.stroke();
      g.save(); g.translate(this.bx, 0); if (this.fly) { g.translate(300, 400); g.rotate(this.fly * 1.4); g.translate(-300, -400); }
      box(96, 236, 408, 330, '#d98880', 16); for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) box(110 + i * 80, 250 + j * 78, 64, 62, (i + j) % 2 ? '#f5b7b1' : '#fadbd8', 8);
      g.restore();
      if (!this.fly && this.bx < 10) arrow(300 + Math.sin(TT * 5) * 20, 420, 0, '#c2410c', 1.6);
    }
    if (s === 'dress') {
      box(40, 180, 150, 20, '#a1887f', 6); box(50, 200, 14, 200, '#8d6e63'); box(166, 200, 14, 200, '#8d6e63'); box(40, 330, 150, 16, '#a1887f', 6);
      g.setLineDash([10, 8]); g.strokeStyle = '#b08b6e'; g.lineWidth = 4;
      g.beginPath(); g.arc(320, 110, 34, 0, 6.28); g.stroke(); rr(262, 150, 116, 150, 30); g.stroke(); rr(272, 300, 46, 190, 16); g.stroke(); rr(322, 300, 46, 190, 16); g.stroke();
      g.setLineDash([]);
      const sh = this.items[0], pa = this.items[1];
      if (sh.ok) { box(262, 150, 116, 150, '#5dade2', 26); for (let i = 0; i < 6; i++) box(262, 160 + i * 24, 116, 8, 'rgba(255,255,255,.5)'); }
      if (pa.ok) { box(272, 300, 46, 190, '#33456a', 14); box(322, 300, 46, 190, '#33456a', 14); box(272, 300, 96, 20, '#2a3a5a', 6); }
      for (const it of this.items) if (!it.ok) {
        if (it.k === 'shirt') { box(it.x - 55, it.y - 45, 110, 90, '#5dade2', 16); for (let i = 0; i < 4; i++) box(it.x - 55, it.y - 36 + i * 22, 110, 7, 'rgba(255,255,255,.5)'); }
        else { box(it.x - 40, it.y - 60, 36, 120, '#33456a', 10); box(it.x + 4, it.y - 60, 36, 120, '#33456a', 10); box(it.x - 40, it.y - 60, 80, 18, '#2a3a5a', 5); }
      }
      txt('krēsls', 115, 440, 16, '#6b5e55', 'center', 600);
    }
    if (s === 'teeth') {
      ell(300, 300, 250, 230, '#aab7b8'); ell(300, 300, 236, 216, '#eaf2f8');
      ell(300, 308, 190, 110, '#e8a0a0'); ell(300, 308, 170, 90, '#7b241c');
      for (const t of this.teeth) { box(t.x, t.y, t.w, t.h, '#fdfefe', 8); if (t.d > .02) { g.globalAlpha = t.d * .85; box(t.x + 4, t.y + 6, t.w - 8, t.h - 12, '#d4ac0d', 6); circ(t.x + t.w / 2, t.y + t.h / 2, 5, '#b7950b'); g.globalAlpha = 1; } }
      for (const b of this.bubbles) { g.globalAlpha = b.l; circ(b.x, b.y, b.r, '#fff'); ring(b.x, b.y, b.r, 'rgba(150,180,200,.8)', 1); } g.globalAlpha = 1;
      const bx = this.brush.x, by = this.brush.y;
      box(bx - 20, by - 10, 40, 20, '#fdfefe', 6); for (let i = 0; i < 6; i++) ln(bx - 16 + i * 6.4, by - 10, bx - 16 + i * 6.4, by - 22, '#5dade2', 3);
      g.save(); g.translate(bx, by); g.rotate(.15); box(14, -6, 150, 12, '#16a085', 6); g.restore();
      const cl = this.teeth.filter(t => t.d <= .04).length; txt('Tīri: ' + cl + '/12', 300, 560, 20, '#2b2420');
    }
    if (s === 'rinse') {
      box(120, 430, 360, 100, '#fdfefe', 20); ell(300, 450, 130, 30, '#d6eaf8');
      box(250, 220, 100, 170, 'rgba(174,214,241,.6)', 10); box(254, 260 + this.rv * 80, 92, 126 - this.rv * 80, 'rgba(93,173,226,.75)', 8);
      if (this.hold || this.rv > 0) { for (let i = 0; i < 8; i++) circ(200 + i * 28 + Math.sin(TT * 9 + i) * 6, 150 + Math.sin(TT * 12 + i * 2) * 14, 6 + (i % 3) * 3, 'rgba(255,255,255,.85)'); }
      g.strokeStyle = '#0f766e'; g.lineWidth = 12; g.beginPath(); g.arc(300, 110, 46, -Math.PI / 2, -Math.PI / 2 + this.rv * 6.283); g.stroke(); ring(300, 110, 46, 'rgba(0,0,0,.1)', 12);
      txt(this.spit ? 'Pššš!' : 'Gulp-gulp…', 300, 112, 20, '#0f766e', 'center', 800);
      if (!this.hold && !this.spit) txt('Turi pirkstu šeit 👆', 300, 570, 22, '#c2410c', 'center', 800);
    }
    if (s === 'coat') {
      poly([180, 120, 420, 120, 470, 520, 130, 520], '#c8901e'); poly([300, 120, 330, 520, 300, 520, 270, 520], '#b07d14');
      poly([180, 120, 240, 120, 300, 190, 250, 210], '#a8781a'); poly([420, 120, 360, 120, 300, 190, 350, 210], '#a8781a');
      box(110, 140, 70, 300, '#b88720', 30); box(420, 140, 70, 300, '#b88720', 30);
      this.btnPos.forEach((p, i) => { const done = i < this.btn, nxt = i === this.btn; if (nxt) ring(p[0], p[1], 24 + Math.sin(TT * 7) * 4, '#fff', 4); circ(p[0], p[1], 17, done ? '#5d4037' : '#8d6e63'); [[-4, -4], [4, -4], [-4, 4], [4, 4]].forEach(q => circ(p[0] + q[0], p[1] + q[1], 2, '#3e2723')); if (done) ln(p[0] - 26, p[1], p[0] + 26, p[1], '#6d4c11', 3); });
      if (this.scarf) { g.globalAlpha = Math.min(1, this.scarf * 2); ell(300, 128, 90, 26, '#0f8a80'); box(330, 128, 30, 140, '#0f8a80', 8); g.globalAlpha = 1; }
    }
    // laiks
    const k = clamp(this.left / this.time, 0, 1);
    box(20, 16, 560, 18, 'rgba(0,0,0,.12)', 9); box(20, 16, 560 * k, 18, k > .3 ? '#27ae60' : '#e67e22', 9);
    txtO('⏱ ' + Math.max(0, Math.ceil(this.left)) + ' s   ·   ' + (this.si + 1 > 5 ? 5 : this.si + 1) + '/5', 300, 50, 20, '#fff', '#3b2f2a');
  },
  auto() {
    if (this.finished) { const b = $('#goBtn'); if (b) b.click(); return; }
    const s = this.step;
    if (s === 'blanket' && !this.fly) { this.down(200, 400); this.move(420, 400, true); this.up(420, 400); }
    if (s === 'dress') { for (const it of this.items) if (!it.ok) { this.down(it.x, it.y); this.move(it.zone.x + it.zone.w / 2, it.zone.y + it.zone.h / 2, true); this.up(0, 0); } }
    if (s === 'teeth') { this.down(190, 290); for (let k = 0; k < 40 && this.step === 'teeth'; k++) for (const t of this.teeth) this.move(t.x + t.w / 2 + (k % 2 ? 12 : -12), t.y + t.h / 2, true); this.up(0, 0); }
    if (s === 'rinse' && !this.hold && !this.spit) this.down(300, 300);
    if (s === 'coat' && !this.scarf) { const p = this.btnPos[this.btn]; this.down(p[0], p[1]); }
  }
});
