/* ================= 9. tumšais veikals: labirints līdz zilajai gaismiņai ================= */
const DCS = 40, DCOLS = 45, DROWS = 17, DSW = { c: 4, r: 14 }, DMAN = { c: 10, r: 13 };
function darkGrid() {
  const m = []; for (let r = 0; r < DROWS; r++) m.push(new Array(DCOLS).fill(1));
  const fill = (c0, r0, c1, r1, k) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) m[r][c] = k; };
  fill(4, 6, 43, 14, 0); fill(37, 0, 38, 5, 0); fill(20, 1, 28, 5, 0); fill(42, 1, 43, 5, 0);
  fill(4, 6, 15, 7, 2); fill(20, 6, 24, 7, 4); fill(22, 2, 26, 4, 5); fill(27, 8, 27, 8, 6); fill(31, 8, 31, 8, 6);
  fill(5, 10, 21, 12, 8); fill(24, 10, 42, 12, 3); fill(12, 8, 12, 9, 7); fill(29, 1, 36, 5, 1);
  m[DMAN.r][DMAN.c] = 9;
  return m;
}
function darkMapDraw(m) {
  box(0, 0, DCOLS * DCS, DROWS * DCS, '#241c17');
  const cols = ['#c0392b', '#2e86c1', '#f4d03f', '#27ae60', '#8e44ad', '#e67e22', '#1a9aa0', '#f2a7c3', '#ecf0f1'];
  for (let r = 0; r < DROWS; r++) for (let c = 0; c < DCOLS; c++) {
    const x = c * DCS, y = r * DCS, k = m[r][c];
    if (k === 0 || k === 9) { box(x, y, DCS, DCS, (r + c) % 2 ? '#d9a679' : '#cf9a6c'); continue; }
    if (k === 1) { box(x, y, DCS, DCS, '#3b302a'); continue; }
    if (k === 2 || k === 8) { box(x, y, DCS, DCS, '#c9a06a'); box(x + 2, y + 2, DCS - 4, DCS - 4, '#e8c99a'); for (let i = 0; i < 3; i++) box(x + 5 + i * 11, y + 6, 9, DCS - 12, cols[(r * 7 + c * 3 + i) % cols.length], 2); continue; }
    if (k === 3) { box(x, y, DCS, DCS, '#c9a06a'); box(x + 2, y + 2, DCS - 4, DCS - 4, '#e8c99a'); for (let i = 0; i < 4; i++) circ(x + 11 + (i % 2) * 18, y + 11 + Math.floor(i / 2) * 18, 8, cols[(r * 5 + c * 2 + i) % cols.length]); continue; }
    if (k === 4) { box(x, y, DCS, DCS, '#fbfcfc'); box(x, y + DCS - 6, DCS, 6, '#d5d8dc'); continue; }
    if (k === 5) { box(x, y, DCS, DCS, '#f8f9f9'); ln(x, y + 2, x + DCS, y + 2, '#95a5a6', 2); continue; }
    if (k === 6) { box(x, y, DCS, DCS, '#d9a679'); box(x + 6, y + 6, DCS - 12, DCS - 12, '#95a5a6', 4); continue; }
    if (k === 7) { box(x, y, DCS, DCS, '#d9a679'); box(x + 3, y + 3, DCS - 6, DCS - 6, '#c49a6c', 3); box(x + 3, y + DCS / 2 - 3, DCS - 6, 6, '#a77b4f'); continue; }
  }
  // slēdža plāksnīte pie kreisās sienas
  box(DSW.c * DCS - 12, DSW.r * DCS + 8, 14, 24, '#ecf0f1', 3);
}
scene('dark', {
  hints: ['d_hint1', 'd_hint2'],
  enter() {
    setMin(9 * 60 + 39); this.m = darkGrid(); this.px = 37 * DCS + 20; this.py = 1 * DCS + 20; this.path = []; this.lit = false; this.litT = 0; this.face = Math.PI / 2; this.walkT = 0; this.manSeen = false; this.cam = { x: 0, y: 0 };
    this.mapImg = cached('darkMap', DCOLS * DCS, DROWS * DCS, () => darkMapDraw(this.m));
    ui.task('Tumsa! Atrod gaismas slēdzi ar mazo zilo gaismiņu.', 'Pieskaries vietai, kur iet. Lukturītis spīd ap tevi.');
    this.updCam();
  },
  cellAt(x, y) { return { c: Math.floor(x / DCS), r: Math.floor(y / DCS) }; },
  walk(c, r) { return c >= 0 && r >= 0 && c < DCOLS && r < DROWS && this.m[r][c] === 0; },
  bfs(sc, sr, tc, tr) {
    const key = (c, r) => r * DCOLS + c, prev = new Map(); const q = [[sc, sr]]; prev.set(key(sc, sr), null);
    while (q.length) {
      const [c, r] = q.shift(); if (c === tc && r === tr) break;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dc, nr = r + dr; if (this.walk(nc, nr) && !prev.has(key(nc, nr))) { prev.set(key(nc, nr), [c, r]); q.push([nc, nr]); } }
    }
    if (!prev.has(key(tc, tr))) return null;
    const path = []; let cur = [tc, tr]; while (cur) { path.unshift(cur); cur = prev.get(key(cur[0], cur[1])); }
    return path.slice(1);
  },
  updCam() { this.cam.x = clamp(this.px - W / 2, -40, DCOLS * DCS - W + 40); this.cam.y = clamp(this.py - H / 2, -40, DROWS * DCS - H + 40); },
  down(x, y) {
    if (this.lit) return;
    const wx = x + this.cam.x, wy = y + this.cam.y;
    const swx = DSW.c * DCS - 5, swy = DSW.r * DCS + 20;
    let t = this.cellAt(wx, wy);
    if (dist(wx, wy, swx, swy) < 50) t = { c: DSW.c, r: DSW.r };
    if (!this.walk(t.c, t.r)) {
      const k = this.m[t.r] ? this.m[t.r][t.c] : 1;
      if (k === 9) { sfx('ow'); ui.toast('Ak! Manekens! 😱 Es domāju, ka te kāds stāv!'); this.manSeen = true; return; }
      sfx('thud'); ui.toast(k === 7 ? 'Tur ir kastes ar dziju 📦' : k === 1 ? 'Tur ir siena' : k === 4 ? 'Tā ir kase' : k === 5 ? 'Griešanas galds' : 'Tur ir plaukts'); return;
    }
    const s = this.cellAt(this.px, this.py), p = this.bfs(s.c, s.r, t.c, t.r);
    if (p) { this.path = p; sfx('tap'); progress(); }
  },
  update(dt) {
    if (this.lit) { this.litT += dt; return; }
    if (this.path.length) {
      const [c, r] = this.path[0], tx = c * DCS + 20, ty = r * DCS + 20, d = dist(this.px, this.py, tx, ty), sp = 190 * dt;
      this.face = Math.atan2(ty - this.py, tx - this.px);
      if (d <= sp) { this.px = tx; this.py = ty; this.path.shift(); } else { this.px += (tx - this.px) / d * sp; this.py += (ty - this.py) / d * sp; }
      this.walkT += dt; if (this.walkT > .3) { this.walkT = 0; sfx('step'); }
      if (!this.manSeen && dist(this.px, this.py, DMAN.c * DCS + 20, DMAN.r * DCS + 20) < 80) { this.manSeen = true; sfx('ow'); floater(W / 2, H / 2 - 50, '😱 Manekens!', '#fff'); }
      if (!this.path.length) { const c2 = this.cellAt(this.px, this.py); if (c2.c === DSW.c && c2.r === DSW.r) this.lightsOn(); }
    }
    setMin(lerp(9 * 60 + 39, 9 * 60 + 41, Math.min(1, this.t / 60)));
    this.updCam();
  },
  lightsOn() {
    this.lit = true; this.litT = 0; this.path = []; sfx('click'); progress();
    setTimeout(() => sfx('flick'), 150); setTimeout(() => sfx('flick'), 450); setTimeout(() => sfx('hum'), 700);
    setTimeout(() => ui.say('d_light', () => {
      award(Math.max(6, 20 - Math.floor(this.t / 12)), 300, 300); chat('d_zane_light', .2); setMin(9 * 60 + 41);
      ui.task('Gaisma ir! Tagad jāsagatavo veikals līdz 10:00.');
      ui.btns([{ t: '☕ Sākt darbu', id: 'goBtn', fn: () => go('prep') }]);
    }), 1500);
  },
  draw() {
    if (this.lit && this.litT > 1.2) {
      box(0, 0, W, H, '#2b2420'); const s = W / (DCOLS * DCS), hh = DROWS * DCS * s;
      g.drawImage(this.mapImg, 0, (H - hh) / 2, W, hh);
      txtO('Tavs veikals šodien ✨', W / 2, 110, 30, '#fff', '#5d2e14');
      circ(this.px * s, (H - hh) / 2 + this.py * s, 6, '#c2410c');
      return;
    }
    g.save(); g.translate(-this.cam.x, -this.cam.y);
    g.drawImage(this.mapImg, 0, 0, DCOLS * DCS, DROWS * DCS);
    // manekens
    const mx = DMAN.c * DCS + 20, my = DMAN.r * DCS + 20; ell(mx, my, 17, 10, '#e8dcc8'); circ(mx, my, 8, '#d5c4a1'); ln(mx, my + 10, mx, my + 18, '#7f8c8d', 3);
    // spēlētāja no augšas
    ell(this.px, this.py, 15, 12, '#c8901e', this.face + Math.PI / 2); circ(this.px, this.py, 8, '#8a3b1c');
    // zilā gaismiņa
    const lx = DSW.c * DCS - 5, ly = DSW.r * DCS + 16;
    g.restore();
    // tumsa ar lukturīti
    const sx = this.px - this.cam.x, sy = this.py - this.cam.y;
    const flick = this.lit ? (Math.sin(this.litT * 40) > 0 ? 0 : 1) : 1;
    if (flick) {
      g.save(); g.beginPath(); g.rect(0, 0, W, H); g.moveTo(sx + 135, sy);
      g.arc(sx, sy, 135, 0, 6.2832, true); g.fillStyle = 'rgba(8,6,5,.965)'; g.fill('evenodd');
      const gr = g.createRadialGradient(sx, sy, 60, sx, sy, 136); gr.addColorStop(0, 'rgba(8,6,5,0)'); gr.addColorStop(1, 'rgba(8,6,5,.965)');
      g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, 136, 0, 6.2832); g.fill();
      const fx = sx + Math.cos(this.face) * 30, fy = sy + Math.sin(this.face) * 30; const lg = g.createRadialGradient(fx, fy, 5, fx, fy, 90); lg.addColorStop(0, 'rgba(255,240,200,.18)'); lg.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = lg; g.beginPath(); g.arc(fx, fy, 90, 0, 6.2832); g.fill();
      g.restore();
    }
    const bx = lx - this.cam.x, by = ly - this.cam.y, pul = .6 + Math.sin(TT * 3) * .4;
    const bg = g.createRadialGradient(bx, by, 1, bx, by, 26); bg.addColorStop(0, 'rgba(80,170,255,' + .9 * pul + ')'); bg.addColorStop(1, 'rgba(80,170,255,0)'); g.fillStyle = bg; g.beginPath(); g.arc(bx, by, 26, 0, 6.2832); g.fill();
    circ(bx, by, 3.5, '#bfe3ff');
    // virziena mājiens pēc otrā padoma
    if (hintIx >= 2 && !this.lit && (bx < 0 || bx > W || by < 0 || by > H)) { const a = Math.atan2(by - sy, bx - sx); arrow(clamp(sx + Math.cos(a) * 200, 40, W - 40), clamp(sy + Math.sin(a) * 200, 40, H - 40), a, 'rgba(80,170,255,.85)', 1); }
    if (this.path.length) { const [c, r] = this.path[this.path.length - 1]; ring(c * DCS + 20 - this.cam.x, r * DCS + 20 - this.cam.y, 12, 'rgba(255,255,255,.6)', 2); }
  },
  auto() {
    const b = $('#goBtn'); if (b) { b.click(); return; }
    if (this.lit || this.path.length) return;
    const s = this.cellAt(this.px, this.py), p = this.bfs(s.c, s.r, DSW.c, DSW.r); if (p) this.path = p;
  }
});
