/* ================= 5. skrējiens ar kafiju: peļķes, grāvītis, zari ================= */
scene('run', {
  hints: ['r_hint'],
  enter() {
    setMin(9 * 60 + 10); this.x = 0; this.speed = 270 / Math.sqrt(TK()); this.len = 7400; this.py = 0; this.vy = 0; this.air = false; this.duckT = 0; this.stum = 0; this.ph = 0; this.hits = 0; this.cleared = 0; this.done = false; this.doneT = 0; this.L = leavesNew(14); this.stepT = 0;
    D.coffee = 100;
    const types = ['puddle', 'puddle', 'branch'].concat(shuffle(['ditch', 'puddle', 'branch', 'ditch', 'puddle', 'branch', 'puddle', 'branch']));
    this.obs = []; let ox = 800;
    for (const k of types) { const w = k === 'puddle' ? ri(70, 105) : k === 'ditch' ? 118 : 70; this.obs.push({ k, x: ox, w, done: false, hit: false, fall: 0 }); ox += 470 + ri(0, 220); }
    this.len = ox + 300;
    ui.task('Skrien! ⬆ lēc pār peļķēm un grāvīti, ⬇ pieliecies zem zariem.', 'Pieskaries ekrāna augšai vai apakšai, vai spied pogas.');
    ui.btns([{ t: '⬆ Lēkt', id: 'jumpBtn', fn: () => this.jump() }, { t: '⬇ Pieliekties', id: 'duckBtn', cls: 'teal', fn: () => this.duck() }]);
  },
  jump() { if (this.done || this.air || this.stum > 0) return; this.air = true; this.vy = -640; this.duckT = 0; sfx('jump'); },
  duck() { if (this.done || this.air) return; this.duckT = .8; sfx('duck'); },
  hit(o, k) {
    o.hit = true; o.done = true; this.hits++; this.stum = .55; D.coffee = Math.max(0, D.coffee - 25);
    if (k === 'branch') { sfx('thud'); sfx('ow'); floater(170, 330, 'Au!', '#c0392b'); }
    else { sfx('splash'); floater(170, 380, k === 'ditch' ? 'Klupiens!' : 'Plunkš!', '#2471a3'); }
    burst(172, 400, ['#6d4c41', '#a1887f'], 10, 120);
  },
  update(dt) {
    leavesUpd(this.L, dt, -70);
    if (this.done) { this.doneT += dt; return; }
    const sp = this.stum > 0 ? this.speed * .45 : this.speed;
    this.x += sp * dt; this.ph += sp * dt / 26; this.stepT += dt;
    if (this.stum > 0) this.stum -= dt;
    if (this.air) { this.vy += 1750 * dt; this.py += this.vy * dt; if (this.py >= 0) { this.py = 0; this.air = false; this.vy = 0; sfx('step'); } }
    else if (this.stepT > .28) { this.stepT = 0; sfx('step'); }
    if (this.duckT > 0) this.duckT -= dt;
    const px = this.x + 150;
    for (const o of this.obs) {
      if (o.done) continue;
      if (o.k === 'branch') {
        if (!o.fall && o.x - px < 330) { o.fall = .001; sfx('rattle'); }
        if (o.fall) o.fall += dt;
        const hang = o.fall > .55;
        if (hang && px > o.x - 6 && px < o.x + o.w) { if (this.duckT <= 0 || this.air) this.hit(o, 'branch'); }
        if (px > o.x + o.w) { o.done = true; this.cleared++; progress(); floater(150, 300, '👍', '#1e8449'); }
      } else {
        if (!this.air && this.py > -6 && px > o.x + 12 && px < o.x + o.w - 12) this.hit(o, o.k);
        if (px > o.x + o.w) { o.done = true; this.cleared++; progress(); }
      }
    }
    setMin(lerp(9 * 60 + 10, 9 * 60 + 34, Math.min(1, this.x / this.len)));
    if (this.x >= this.len) this.finish();
  },
  finish() {
    this.done = true; setMin(9 * 60 + 35); ui.btns([]);
    award(4 * this.cleared + Math.round(D.coffee / 10), 300, 250);
    ui.task(D.coffee >= 100 ? 'Ne pilītes neizlieti! ☕✨' : 'Kafija mazliet izlija, bet tu esi klāt!', 'Pulkstenis: 9:35. Veikals jāatver 10:00.');
    chat(D.coffee >= 100 ? 'r_zane_dry' : 'r_dace_wet', .4);
    ui.btns([{ t: '🔑 Pie durvīm', id: 'goBtn', fn: () => go('keys') }]);
  },
  down(x, y) { if (y < 330) this.jump(); else this.duck(); },
  key(k, d) { if (!d) return; if (k === 'ArrowUp' || k === ' ') { this.jump(); return true; } if (k === 'ArrowDown') { this.duck(); return true; } },
  draw() {
    drawStreet(this.x);
    const ox = -this.x;
    // galamērķis: akmens ēka
    const bx = this.len + 210 + ox;
    if (bx < W + 40) { g.save(); g.beginPath(); g.rect(bx, 120, 600, 352); g.clip(); stoneWall(bx, 120, 600, 352, 3); g.restore(); box(bx, 96, 600, 30, '#4d5656'); box(bx + 60, 240, 110, 230, '#3f4a4a'); box(bx + 70, 252, 90, 214, '#a9cce3'); boxS(bx + 190, 260, 120, 56, '#fffaf2', 6, '#8d5a2b', 3); txt('Šarlotes', bx + 250, 279, 16, '#8d3b1c', 'center', 800); txt('audumi', bx + 250, 298, 16, '#8d3b1c', 'center', 800); }
    for (const o of this.obs) {
      const sx = o.x + ox; if (sx < -200 || sx > W + 100) continue;
      if (o.k === 'puddle') { ell(sx + o.w / 2, 458, o.w / 2, 11, '#5d8aa8'); ell(sx + o.w / 2 - 8, 455, o.w / 4, 4, 'rgba(255,255,255,.45)'); }
      else if (o.k === 'ditch') { box(sx, 446, o.w, 26, '#4e3b31', 4); box(sx + 6, 458, o.w - 12, 12, '#5d8aa8', 3); txt('grāvītis', sx + o.w / 2, 492, 14, '#fff', 'center', 700); }
      else {
        tree(sx + o.w / 2 + 40, 432, .9, 2);
        const f = clamp(o.fall / .55, 0, 1), yy = lerp(250, 392, easeOut(f)), sw = f >= 1 ? Math.sin(TT * 6) * .08 : 0;
        if (!o.hit) { g.save(); g.translate(sx + o.w / 2, yy); g.rotate(-.25 + sw); box(-o.w / 2 - 10, -6, o.w + 20, 12, '#6d4c41', 6); ln(-20, 0, -34, -16, '#6d4c41', 5); ln(14, 0, 26, -18, '#6d4c41', 5); circ(-34, -18, 9, '#e67e22'); circ(26, -20, 9, '#d35400'); circ(0, -8, 8, '#f1c40f'); g.restore(); }
        if (o.fall && f < 1) txtO('Krak!', sx + o.w / 2, 230, 20, '#fff', '#6d4c41');
      }
    }
    const pose = this.done ? 'stand' : this.air ? 'jump' : this.duckT > 0 ? 'duck' : this.stum > 0 ? 'stumble' : 'run';
    drawWoman(150, 466 + this.py, 1.15, pose, this.ph, { cup: D.coffee > 0 ? 1 : -1 });
    leavesDraw(this.L);
    // kafija un ceļš
    box(16, 14, 150, 34, 'rgba(255,255,255,.85)', 12); txt('☕ ' + D.coffee + '%', 91, 31, 20, D.coffee >= 75 ? '#1e8449' : '#c0392b', 'center', 800);
    const k = Math.min(1, this.x / this.len); box(190, 22, 330, 14, 'rgba(0,0,0,.2)', 7); box(190, 22, 330 * k, 14, '#0f766e', 7); txtO('🏪', 532, 29, 22, '#fff', '#fff');
    if (this.t < 2.5 && !this.done) { txtO('⬆ augša = lēkt', 300, 200, 22, '#fff', '#3b2f2a'); txtO('⬇ apakša = pieliekties', 300, 560, 22, '#fff', '#3b2f2a'); }
  },
  auto() {
    if (this.done) { const b = $('#goBtn'); if (b) b.click(); return; }
    const px = this.x + 150, o = this.obs.find(o => !o.done);
    if (!o) return;
    const d = o.x - px;
    if (o.k === 'branch') { if (d < 70 && this.duckT <= .1) this.duck(); }
    else if (d < 70 && d > 5) this.jump();
  }
});
