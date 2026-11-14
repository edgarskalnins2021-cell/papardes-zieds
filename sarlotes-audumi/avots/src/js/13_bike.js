/* ================= 3. ar riteni caur rudeni ================= */
scene('bike', {
  hints: ['b_hint'],
  enter() {
    setMin(8 * 60 + 51); this.x = 0; this.v = 130; this.goal = 3400; this.good = 0; this.taps = 0; this.cur = 0; this.done = false; this.flat = 0; this.ph = 0; this.L = leavesNew(18);
    ui.task('Mīn pedāļus! Spied, kad punkts ir zaļajā joslā.', 'Pieskaries ekrānam vai pogai «Mīt».');
    ui.btns([{ t: '🚲 Mīt!', id: 'pedal', fn: () => this.tap() }]);
  },
  tap() {
    if (this.done) return; this.taps++;
    if (Math.abs(this.cur) < .2) { this.v = Math.min(440, this.v + 75); this.good++; floater(210, 330, 'Labi!', '#1e8449'); sfx('ok'); progress(); }
    else { this.v = Math.min(440, this.v + 10); floater(210, 330, 'Ups', '#ca6f1e'); sfx('tap'); }
  },
  update(dt) {
    leavesUpd(this.L, dt, -50);
    if (this.done) { this.flat += dt; return; }
    const ph = (this.t * .62) % 1; this.cur = 2 * Math.abs(2 * ph - 1) - 1;
    this.v = Math.max(95, this.v - 42 * dt); this.x += this.v * dt; this.ph += this.v * dt / 22;
    setMin(lerp(531, 545, Math.min(1, this.x / this.goal)));
    if (this.x >= this.goal) this.finish();
  },
  finish() {
    this.done = true; this.x = this.goal; sfx('hiss'); ui.btns([]); ui.task('');
    award(5 + Math.min(15, this.good), 300, 250);
    setTimeout(() => ui.say('b_flat', () => { chat('b_agrita', .2); ui.task('Riepa pagalam. Bet kafejnīca ir tepat!'); ui.btns([{ t: '☕ Iet iekšā', id: 'goBtn', fn: () => go('cafe') }]); }), 900);
  },
  down() { this.tap(); },
  key(k, d) { if (d && (k === ' ' || k === 'ArrowUp' || k === 'Enter')) { this.tap(); return true; } },
  draw() {
    drawStreet(this.x);
    // kafejnīca tuvojas
    const cx = 200 + (this.goal - this.x) + 160;
    if (cx < W + 200) {
      box(cx - 120, 200, 260, 230, '#8d6e63'); box(cx - 110, 250, 110, 120, '#f8e5b9'); box(cx + 20, 260, 70, 170, '#5d4037');
      for (let i = 0; i < 8; i++) poly([cx - 130 + i * 34, 220, cx - 96 + i * 34, 220, cx - 96 + i * 34, 246, cx - 113 + i * 34, 256, cx - 130 + i * 34, 246], i % 2 ? '#fdfefe' : '#c0392b');
      boxS(cx - 90, 172, 200, 40, '#fdf2e9', 8, '#5d4037', 3); txt('☕ Kafejnīca', cx + 10, 193, 22, '#5d4037', 'center', 800);
    }
    // braucēja
    const bob = this.done ? 0 : Math.sin(this.ph * 2) * 1.5;
    drawBike(200, 512, 1.15, this.ph, this.done);
    if (this.done) drawWoman(150, 510, 1.1, 'stand', 0); else drawWoman(196, 470 + bob, 1.1, 'bike', this.ph);
    leavesDraw(this.L);
    if (this.done) { if (this.flat < 1.4) txtO('PŠŠŠŠ!', 260, 420 - this.flat * 20, 34, '#fff', '#c0392b'); return; }
    // ritma josla
    box(100, 552, 400, 30, 'rgba(255,255,255,.85)', 15); box(260, 552, 80, 30, '#58d68d', 10);
    circ(300 + this.cur * 190, 567, 14, '#c2410c'); ring(300 + this.cur * 190, 567, 14, '#fff', 3);
    // ceļš līdz kafejnīcai
    const k = this.x / this.goal; box(100, 18, 400, 14, 'rgba(0,0,0,.2)', 7); box(100, 18, 400 * k, 14, '#0f766e', 7); txtO('🚲', 100 + 400 * k, 25, 20, '#fff', '#fff'); txtO('☕', 512, 25, 22, '#fff', '#fff');
  },
  auto() {
    if (this.done) { const b = $('#goBtn'); if (b) b.click(); return; }
    if (Math.abs(this.cur) < .15) this.tap();
  }
});
