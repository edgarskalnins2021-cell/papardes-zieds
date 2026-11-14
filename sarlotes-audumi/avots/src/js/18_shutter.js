/* ================= 8. iesprūdušie rullo vārti ================= */
scene('shutter', {
  hints: ['sh_hint'],
  enter() {
    setMin(9 * 60 + 38); this.ph = 'key'; this.open = 0; this.target = 0; this.ok = 0; this.miss = 0; this.cur = 0; this.shake = 0; this.spd = .55;
    ui.task('Atslēdz vārtu slēdzeni — pieskaries slēdzenei 🔑');
  },
  unlock() {
    if (this.ph !== 'key') return; this.ph = 'jam'; sfx('key'); progress(); this.target = .12;
    setTimeout(() => { sfx('rattle'); this.shake = .5; ui.say('sh_jam', () => { chat('sh_dace', .1); this.force(); }); }, 800);
  },
  force() {
    this.ph = 'force';
    ui.task('Spied «Hop!», kad rādītājs ir zaļajā zonā. Vajag trīs reizes!', 'Var pieskarties arī ekrānam.');
    ui.btns([{ t: '💪 Hop!', id: 'hopBtn', fn: () => this.hop() }]);
  },
  hop() {
    if (this.ph !== 'force') return;
    if (Math.abs(this.cur) < .17) {
      this.ok++; this.target = .12 + this.ok * .3; sfx('rattle'); floater(300, 250, 'Hop! 💪', '#1e8449'); progress(); this.spd += .18;
      if (this.ok >= 3) { this.ph = 'up'; this.target = 1; ui.btns([]); setTimeout(() => { sfx('win'); ui.say('sh_ok', () => { award(Math.max(5, 15 - this.miss * 2), 300, 300); addMin(1); ui.task('Vārti augšā. Iekšā ir tumšs…'); ui.btns([{ t: '🔦 Ieiet tumsā', id: 'goBtn', fn: () => go('dark') }]); }); }, 900); }
    } else { this.miss++; this.shake = .3; sfx('thud'); floater(300, 250, 'Vēl!', '#c0392b'); }
  },
  update(dt) {
    this.open += (this.target - this.open) * Math.min(1, dt * 3);
    if (this.shake > 0) this.shake -= dt;
    if (this.ph === 'force') { const p = (this.t * this.spd) % 1; this.cur = 2 * Math.abs(2 * p - 1) - 1; }
  },
  down(x, y) { if (this.ph === 'key' && dist(x, y, 572, 330) < 40) this.unlock(); else if (this.ph === 'force') this.hop(); },
  hot(x, y) { return (this.ph === 'key' && dist(x, y, 572, 330) < 40) || this.ph === 'force'; },
  key(k, d) { if (d && (k === ' ' || k === 'Enter')) { if (this.ph === 'force') this.hop(); return true; } },
  draw() {
    g.save(); if (this.shake > 0) g.translate(Math.sin(TT * 80) * 4, 0);
    drawCorridor(this.open, true);
    g.restore();
    // slēdzene
    box(556, 300, 32, 60, '#7f8c8d', 6); circ(572, 322, 9, '#d4ac0d'); box(569, 322, 6, 18, '#2b2420', 2);
    if (this.ph === 'key') { ring(572, 330, 30 + Math.sin(TT * 6) * 5, '#fff', 4); arrow(520, 330, 0, '#c2410c', 1); }
    if (this.ph === 'force' || this.ph === 'up') {
      box(110, 520, 380, 40, 'rgba(255,255,255,.9)', 20);
      box(300 - 32, 520, 64, 40, '#58d68d', 10);
      const nx = 300 + this.cur * 175; poly([nx - 12, 512, nx + 12, 512, nx, 532], '#c2410c'); box(nx - 3, 520, 6, 40, '#c2410c', 3);
      for (let i = 0; i < 3; i++) circ(250 + i * 50, 586, 10, i < this.ok ? '#27ae60' : 'rgba(0,0,0,.25)');
    }
  },
  auto() {
    const b = $('#goBtn'); if (b) { b.click(); return; }
    if (ui.sayOpen) return;
    if (this.ph === 'key') this.unlock();
    else if (this.ph === 'force' && Math.abs(this.cur) < .1) this.hop();
  }
});
