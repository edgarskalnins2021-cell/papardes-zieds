/* ================= 6. kur ir atslēgas? ================= */
const KOBJ = { pot: R(70, 330, 120, 150), bin: R(426, 352, 108, 128), mat: R(222, 470, 156, 52) };
scene('keys', {
  hints: ['k_hint'],
  enter() {
    setMin(9 * 60 + 35); this.sel = null; this.tries = 0; this.searched = {}; this.anim = null; this.found = false;
    chat('k_zane1', .6);
    this.idleTask();
  },
  idleTask() { ui.task('Kur Zane noslēpa atslēgas? Pieskaries priekšmetam, lai to apskatītu.', 'Izlasi Zanes ziņu čatā 👇'); ui.btns([]); },
  pickObj(id) {
    if (this.anim || this.found) return;
    this.sel = id; sfx('tap'); progress();
    ui.task(T('k_obs_' + id));
    ui.btns([{ t: '🔍 Meklēt šeit', id: 'searchBtn', fn: () => this.search(id) }, { t: 'Apskatīt citu', cls: 'alt', fn: () => { this.sel = null; this.idleTask(); } }]);
  },
  search(id) {
    if (this.searched[id]) { ui.toast('Tur jau meklēji!'); return; }
    this.searched[id] = 1; this.tries++; this.anim = { k: id, t: 0 }; ui.btns([]); ui.task('');
    if (id === 'pot') sfx('thud'); if (id === 'bin') sfx('klunk'); if (id === 'mat') sfx('whoosh');
    addMin(1);
    setTimeout(() => {
      if (id === 'mat') {
        this.found = true; sfx('win'); burst(330, 490, ['#f1c40f', '#fff'], 18);
        ui.seq(['k_mat_yes', 'k_time'], () => {
          award([0, 20, 10, 5][this.tries] || 5, 300, 420);
          if (this.tries === 1) chat('k_zane_good', .2);
          ui.task('Atslēgas ir! 🔑', 'Veikals jāatver 10:00.');
          ui.btns([{ t: '🔑 Atslēgt durvis', id: 'goBtn', fn: () => go('alarm') }]);
        });
      } else {
        sfx('bad');
        ui.say(id === 'pot' ? 'k_pot_no' : 'k_bin_no', () => { chat(id === 'pot' ? 'k_dace_pot' : 'k_zane_bin', .1); this.anim = null; this.sel = null; this.idleTask(); });
      }
    }, 900);
  },
  down(x, y) { for (const id in KOBJ) if (inR(x, y, KOBJ[id])) { this.pickObj(id); return; } },
  hot(x, y) { return Object.values(KOBJ).some(r => inR(x, y, r)); },
  update(dt) { if (this.anim) this.anim.t += dt; },
  draw() {
    drawBuilding();
    const a = this.anim, at = a ? a.t : 0;
    // puķu pods
    const lift = a && a.k === 'pot' ? Math.sin(Math.min(1, at) * Math.PI) * 34 : 0;
    if (lift > 2) { ell(130, 478, 40, 8, '#4e342e'); txt('🪱', 130, 470, 22); }
    g.save(); g.translate(0, -lift);
    poly([86, 400, 174, 400, 162, 478, 98, 478], '#c0603a'); box(80, 392, 100, 16, '#a84f2c', 4);
    for (let i = 0; i < 9; i++) { const fx = 96 + (i % 5) * 17, fy = 368 - Math.floor(i / 5) * 18 - (i % 2) * 6; ln(fx, fy + 10, fx, 394, '#27ae60', 3); circ(fx, fy, 11, i % 2 ? '#e67e22' : '#f4d03f'); circ(fx, fy, 4, '#a04000'); }
    g.restore();
    // miskaste
    box(434, 386, 92, 94, '#7f8c8d', 8); for (let i = 0; i < 4; i++) box(446 + i * 20, 398, 8, 72, 'rgba(0,0,0,.12)', 3);
    g.save(); g.translate(430, 384); if (a && a.k === 'bin') g.rotate(-Math.min(1, at * 2) * 1.1); box(0, -12, 100, 16, '#566573', 6); box(40, -20, 20, 10, '#566573', 3); g.restore();
    if (a && a.k === 'bin' && at > .4) { for (let i = 0; i < 3; i++) { const yy = 370 - ((TT * 30 + i * 12) % 40); g.strokeStyle = 'rgba(120,160,60,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(460 + i * 16, yy); g.quadraticCurveTo(468 + i * 16, yy - 10, 460 + i * 16, yy - 20); g.stroke(); } txt('🍌', 478, 376, 22); }
    // kājslauķis
    const fold = a && a.k === 'mat' ? Math.min(1, at * 1.6) : (this.found ? 1 : 0);
    if (fold > .2) { txt('🔑', 340, 496, 30); if (this.found) { const s = (TT * 3) % 1; star(356, 484, 6 + s * 4, 'rgba(255,255,255,' + (1 - s) + ')'); } }
    const mx = 226, my = 474, mw = 148, mh = 44, cx = mx + mw - fold * 70;
    poly([mx, my, cx, my, cx + fold * 10, my + mh, mx, my + mh], '#a0522d');
    g.strokeStyle = '#6e3b1d'; g.lineWidth = 4; g.beginPath(); g.moveTo(mx + 6, my + 5); g.lineTo(cx - 4, my + 5); g.lineTo(cx + fold * 10 - 4, my + mh - 5); g.lineTo(mx + 6, my + mh - 5); g.closePath(); g.stroke();
    for (let i = mx + 14; i < cx - 6; i += 9) ln(i, my + 10, i, my + mh - 10, 'rgba(70,35,15,.35)', 2);
    if (fold > 0) poly([cx, my, mx + mw, my - fold * 30, cx + fold * 10, my + mh], '#c26a3a');
    else ell(mx + mw - 6, my + 4, 10, 4, '#b5652f');
    // izvēle
    if (this.sel && !this.anim) { const r = KOBJ[this.sel]; g.strokeStyle = 'rgba(255,255,255,' + (.6 + Math.sin(TT * 6) * .4) + ')'; g.lineWidth = 5; rr(r.x - 6, r.y - 6, r.w + 12, r.h + 12, 14); g.stroke(); }
    else if (!this.anim && !this.found) for (const id in KOBJ) { const r = KOBJ[id]; txtO('?', r.x + r.w / 2, r.y - 14 + Math.sin(TT * 3 + r.x) * 4, 26, '#fff', '#c2410c'); }
  },
  auto() {
    const b = $('#goBtn'); if (b) { b.click(); return; }
    if (ui.sayOpen) return;
    if (!this.anim && !this.found) { this.pickObj('mat'); const s = $('#searchBtn'); if (s) s.click(); }
  }
});
