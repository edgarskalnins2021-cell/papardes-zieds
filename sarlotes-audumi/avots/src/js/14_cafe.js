/* ================= 4. kafejnīca: izvēle un liešana ================= */
const DRINKS = { black: ['Melnā kafija', '#3e2723', 'cf_r_black'], capp: ['Kapučīno', '#c8a27a', 'cf_r_capp'], latte: ['Latte ar karameli', '#d7b48a', 'cf_r_latte'], cocoa: ['Kakao', '#6d4c41', 'cf_r_cocoa'] };
scene('cafe', {
  hints: ['cf_hint'],
  enter() {
    setMin(9 * 60 + 3); this.ph = 'talk'; this.level = 0; this.hold = false; this.res = null; this.talk = true;
    ui.say('cf_bar1', null, { choices: Object.keys(DRINKS).map(k => ({ t: DRINKS[k][0], fn: () => this.choose(k) })) });
  },
  choose(k) {
    D.drink = k; progress();
    ui.say(DRINKS[k][2], () => this.startPour());
  },
  startPour() {
    this.talk = false; this.ph = 'pour';
    ui.task('Pielej līdz zaļajai svītrai!', 'Turi pogu (vai pirkstu uz krūzes) un atlaid īstajā brīdī.');
    ui.btns([{ t: '⬇ Turi, lai lietu', id: 'pourBtn', hold: on => this.setHold(on) }]);
  },
  setHold(on) {
    if (this.ph !== 'pour') return;
    if (on && !this.hold) { this.hold = true; loop('pour', true); }
    else if (!on && this.hold) { this.hold = false; loop('pour', false); if (this.level >= .5) this.judge(); }
  },
  judge() {
    this.ph = 'done'; ui.btns([]);
    const l = this.level; let n, msg;
    if (l >= .74 && l <= .86) { n = 12; msg = 'Perfekti! ✨'; sfx('win'); burst(300, 380, ['#fff', '#f5cba7'], 16); }
    else if (l < .74) { n = 6; msg = 'Mazliet par maz, bet garšo!'; sfx('ok'); }
    else if (l <= 1) { n = 6; msg = 'Pilna līdz malām!'; sfx('ok'); }
    else { n = 2; msg = 'Ups, pāri malām! 😅'; sfx('splash'); }
    this.res = msg; award(n, 300, 330); this.talk = true;
    ui.say('cf_bar_bye', () => { ui.task('Kafija rokā. Tagad ātri uz veikalu!'); ui.btns([{ t: '🏃‍♀️ Skriet!', id: 'goBtn', fn: () => go('run') }]); });
  },
  update(dt) {
    if (this.ph === 'pour' && this.hold) { this.level += dt * .36; progress(); if (this.level > 1.06) { this.hold = false; loop('pour', false); this.judge(); } }
  },
  down(x, y) { if (this.ph === 'pour') this.setHold(true); },
  up() { if (this.ph === 'pour') this.setHold(false); },
  key(k, d) { if (k === ' ' || k === 'ArrowDown') { this.setHold(d); return true; } },
  draw() {
    blit('cafeBack', 0, 0, W, H, cafeStatic);
    drawBarista(272, 352, this.talk && ui.sayOpen);
    box(0, 350, W, 24, '#6d4c41');
    if (this.ph === 'talk') return;
    // krūze
    const dr = DRINKS[D.drink || 'capp'];
    const x = 230, y = 380, w = 140, h = 170;
    box(x - 4, y + h - 6, w + 8, 14, '#ecf0f1', 7);
    g.save(); rr(x, y, w, h, 18); g.clip(); box(x, y, w, h, '#fdfefe');
    const lv = Math.min(1, this.level); box(x, y + h - h * lv, w, h * lv, dr[1]);
    if (lv > .05 && D.drink !== 'black') box(x, y + h - h * lv, w, 10, '#fdf2e9');
    g.restore(); g.strokeStyle = '#bdc3c7'; g.lineWidth = 4; rr(x, y, w, h, 18); g.stroke();
    g.strokeStyle = '#bdc3c7'; g.lineWidth = 12; g.beginPath(); g.arc(x + w + 6, y + 70, 30, -1.2, 1.2); g.stroke();
    // atzīmes
    const yA = y + h - h * .86, yB = y + h - h * .74;
    box(x - 30, yA, 22, yB - yA, '#58d68d', 4); box(x + w + 44, yA, 22, yB - yA, '#58d68d', 4);
    ln(x, yA, x + w, yA, 'rgba(39,174,96,.6)', 2); ln(x, yB, x + w, yB, 'rgba(39,174,96,.6)', 2);
    // krūka
    if (this.ph === 'pour') {
      g.save(); g.translate(330, 300); g.rotate(this.hold ? .7 : .2); box(-30, -60, 60, 80, '#d5d8dc', 10); box(-36, -64, 72, 10, '#aab7b8', 4); g.restore();
      if (this.hold) box(298, 318, 10, y + h - h * lv - 318, D.drink === 'black' ? '#3e2723' : '#fdf2e9', 4);
      if (this.level > 1) for (let i = 0; i < 6; i++) circ(x + 10 + i * 24, y + 4, 8, dr[1]);
    }
    if (this.res) txtO(this.res, 300, 270, 30, '#fff', '#5d4037');
  },
  auto() {
    if (this.ph === 'pour') { if (!this.hold && this.level < .5) this.setHold(true); else if (this.hold && this.level > .78) this.setHold(false); return; }
    const c = document.querySelector('#sayBtns .btn.choice'); if (c) { c.click(); return; }
    const b = $('#goBtn'); if (b) b.click();
  }
});
/* kafejnīcas fons bez letes priekšas */
