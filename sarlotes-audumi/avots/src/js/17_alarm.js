/* ================= 7. signalizācija: 1-2-3-4 ================= */
const KPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
const kpadR = i => R(195 + (i % 3) * 74, 222 + Math.floor(i / 3) * 70, 64, 60);
scene('alarm', {
  hints: ['a_hint_idle'],
  enter() {
    setMin(9 * 60 + 37); this.code = ''; this.wrong = 0; this.time = 30 * TK(); this.left = this.time; this.done = false; this.flash = 0; this.msg = ''; this.press = -1;
    loop('siren', true); sfx('beep');
    ui.say('a_nar1', () => ui.task('Ievadi kodu, lai apklusinātu sirēnu!', 'Ieskaties pogās cieši 🔍'));
  },
  key(k, d) { if (d && KPAD.includes(k)) { this.pressKey(KPAD.indexOf(k)); return true; } },
  pressKey(i) {
    if (this.done || this.code.length >= 4 || ui.sayOpen) return;
    this.code += KPAD[i]; this.press = i; this.pt = .15; sfx('beep'); progress();
    if (this.code.length === 4) setTimeout(() => this.check(), 350);
  },
  check() {
    if (this.code === '1234') return this.success(false);
    this.wrong++; sfx('bad'); this.msg = 'KĻŪDA'; this.code = '';
    setTimeout(() => this.msg = '', 900);
    if (this.wrong === 1) chat('a_dace_hint'); if (this.wrong === 2) chat('a_ieva_hint');
  },
  success(byGuard) {
    this.done = true; this.code = '1234'; loop('siren', false); sfx('win'); this.msg = 'ATSLĒGTS ✔';
    ui.btns([]);
    const n = byGuard ? 2 : Math.max(4, 6 + Math.floor(this.left / 3) - this.wrong * 3);
    ui.say(byGuard ? 'a_guard_ok' : 'a_ok', () => {
      award(n, 300, 160); addMin(1);
      ui.task('Klusums. Tagad veikala vārti!');
      ui.btns([{ t: 'Uz veikalu ➜', id: 'goBtn', fn: () => go('shutter') }]);
    });
  },
  update(dt) {
    this.flash += dt; if (this.pt > 0) this.pt -= dt;
    if (this.done || ui.busy()) return;
    this.left -= dt;
    if (this.left <= 0) { this.done = true; ui.say('a_guard', () => this.success(true)); }
  },
  down(x, y) { for (let i = 0; i < 12; i++) if (inR(x, y, kpadR(i))) { this.pressKey(i); return; } },
  hot(x, y) { return KPAD.some((k, i) => inR(x, y, kpadR(i))); },
  draw() {
    box(0, 0, W, H, '#2d2a28'); box(0, 470, W, 130, '#3a3532');
    if (!this.done && Math.sin(this.flash * 10) > 0) { g.fillStyle = 'rgba(231,76,60,.18)'; g.fillRect(0, 0, W, H); }
    circ(300, 40, 18, !this.done && Math.sin(this.flash * 10) > 0 ? '#ff5e57' : '#7b241c');
    box(170, 80, 260, 470, '#d0d3d4', 18); box(178, 88, 244, 454, '#e5e8e8', 14);
    box(196, 104, 208, 92, '#1b2631', 8);
    const disp = this.msg || (this.code.split('').map(() => '•').join(' ') + ' _ _ _ _'.slice(this.code.length * 2, 8));
    txt(disp.trim() || '_ _ _ _', 300, 140, this.msg ? 28 : 36, this.msg === 'KĻŪDA' ? '#ff6b6b' : '#7dcea0', 'center', 800);
    txt('SIGNALIZĀCIJA', 300, 178, 13, '#85929e', 'center', 700);
    for (let i = 0; i < 12; i++) {
      const r = kpadR(i), shiny = i < 4, pressed = this.press === i && this.pt > 0;
      box(r.x, r.y + 4, r.w, r.h, '#909497', 10);
      box(r.x, r.y + (pressed ? 4 : 0), r.w, r.h, shiny ? '#fbfcfc' : '#bfc9ca', 10);
      if (shiny) { g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(r.x + 20, r.y + 14, 14, 6, -.4, 0, 6.28); g.fill(); const s = (TT * 1.3 + i * .3) % 1; star(r.x + r.w - 10, r.y + 10, 3 + s * 5, 'rgba(255,255,255,' + (1 - s) + ')'); }
      else { box(r.x + 6, r.y + 6, r.w - 12, r.h - 12, 'rgba(0,0,0,.04)', 8); }
      txt(KPAD[i], r.x + r.w / 2, r.y + r.h / 2 + (pressed ? 4 : 0) + 1, 28, shiny ? '#1b2631' : '#566573', 'center', 800);
    }
    if (!this.done) { const k = clamp(this.left / this.time, 0, 1); box(150, 560, 300, 16, 'rgba(255,255,255,.2)', 8); box(150, 560, 300 * k, 16, '#e74c3c', 8); txtO(Math.ceil(Math.max(0, this.left)) + ' s', 300, 585, 18, '#fff', '#2d2a28'); }
  },
  auto() {
    const b = $('#goBtn'); if (b) { b.click(); return; }
    if (ui.sayOpen || this.done) return;
    const nextDigit = '1234'[this.code.length]; if (nextDigit) this.pressKey(KPAD.indexOf(nextDigit));
  }
});
