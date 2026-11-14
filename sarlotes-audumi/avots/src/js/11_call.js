/* ================= 1. rīta zvans ================= */
scene('call', {
  hints: ['c_hint'],
  enter() {
    setMin(8 * 60 + 40); this.ph = 'ring'; this.callT = 0; this.done = false;
    loop('ring', true);
    ui.task('Telefons zvana! Atbildi — pieskaries zaļajai pogai.');
    this.btnOk = R(330, 400, 74, 74); this.btnNo = R(196, 400, 74, 74);
  },
  answer() {
    if (this.ph !== 'ring') return;
    loop('ring', false); sfx('ok'); progress(); this.ph = 'talk'; ui.task('');
    ui.seq(['c_ieva1', 'c_ieva2'], () => {
      ui.say('c_q', null, {
        choices: [
          { t: 'Es tikšu galā! 💪', fn: () => this.talk2('c_ieva3a') },
          { t: 'Ak vai… labi, mēģināšu 😅', fn: () => this.talk2('c_ieva3b') }]
      });
    });
  },
  talk2(id) {
    ui.seq([id, 'c_ieva4', 'c_ieva5'], () => {
      this.ph = 'after'; sfx('click');
      ui.say('c_nar1', () => this.chatPart());
    });
  },
  chatPart() {
    ui.task('Kolēģes tev raksta čatā 👇');
    chat('c_sys1', .2); chat('c_dace1', .4); chat('c_zane1', .3); chat('c_ieva6', .3, () => {
      ui.replies([
        { t: 'Sveikas! Turieties! ❤️', fn: () => chat('c_dace2', 0, () => this.ready()) },
        { t: 'Bez panikas, tieku galā 💪', fn: () => chat('c_zane2', 0, () => this.ready()) },
        { t: 'Kur ir kafija? ☕', fn: () => chat('c_ieva7', 0, () => this.ready()) }]);
    });
  },
  ready() {
    if (this.done) return; this.done = true;
    ui.task('Laiks celties! Veikals jāatver 10:00.');
    ui.btns([{ t: '🛏 Lēkt no gultas!', id: 'goBtn', fn: () => go('morning') }]);
  },
  down(x, y) {
    if (this.ph !== 'ring') return;
    if (dist(x, y, this.btnOk.x + 37, this.btnOk.y + 37) < 48) this.answer();
    else if (dist(x, y, this.btnNo.x + 37, this.btnNo.y + 37) < 48) { sfx('bad'); ui.toast('Labāk atbildi 😉 Tā ir vadītāja!'); }
  },
  hot(x, y) { return this.ph === 'ring' && (dist(x, y, 367, 437) < 48 || dist(x, y, 233, 437) < 48); },
  update(dt) { if (this.ph === 'talk') this.callT += dt; },
  draw() {
    drawBedroom();
    // sega ar guļošo
    box(46, 352, 262, 120, '#d98880', 18); for (let i = 0; i < 6; i++) box(60 + i * 42, 360, 30, 100, 'rgba(255,255,255,.12)', 6);
    circ(92, 340, 20, '#f1c7a5'); g.fillStyle = '#8a3b1c'; g.beginPath(); g.arc(92, 336, 21, Math.PI * .9, Math.PI * 2.1); g.fill();
    // modinātājs
    box(380, 344, 36, 36, '#ecf0f1', 8); txt(fmtMin(D ? D.min : 520), 398, 362, 11, '#c0392b', 'center', 800);
    const shake = this.ph === 'ring' ? Math.sin(TT * 60) * 2 : 0;
    box(330 + shake, 366, 40, 14, '#2b2420', 4);
    if (this.ph === 'ring' || this.ph === 'talk') {
      // liels telefons
      const x = 180, y = 70;
      box(x, y, 240, 440, '#1c1c1e', 32); box(x + 10, y + 12, 220, 416, lgrad(0, y, 0, y + 420, ['#34495e', '#1a5276', '#0e6655']), 24);
      txt(this.ph === 'ring' ? 'Ienākošais zvans' : 'Saruna · 0:' + String(Math.floor(this.callT)).padStart(2, '0'), x + 120, y + 52, 15, '#d6eaf8', 'center', 600);
      circ(x + 120, y + 140, 46, '#f5cba7'); txt('I', x + 120, y + 142, 42, '#a04000', 'center', 800);
      txt('Ieva', x + 120, y + 212, 30, '#fff', 'center', 800); txt('vadītāja', x + 120, y + 240, 17, '#d6eaf8', 'center', 600);
      if (this.ph === 'ring') {
        const p = (TT * 2) % 1;
        ring(x + 120, y + 140, 46 + p * 30, 'rgba(255,255,255,' + (1 - p) * .5 + ')', 3);
        circ(this.btnNo.x + 37, this.btnNo.y + 37, 34, '#e74c3c'); txt('✕', this.btnNo.x + 37, this.btnNo.y + 38, 30, '#fff');
        const bob = Math.sin(TT * 8) * 3;
        circ(this.btnOk.x + 37, this.btnOk.y + 37 + bob, 34, '#2ecc71'); txt('✆', this.btnOk.x + 37, this.btnOk.y + 39 + bob, 34, '#fff');
        txt('Atbildēt', this.btnOk.x + 37, this.btnOk.y + 92, 15, '#fff', 'center', 700);
      } else { circ(x + 120, y + 360, 32, '#e74c3c'); txt('✆', x + 120, y + 362, 30, '#fff'); for (let i = 0; i < 5; i++) box(x + 70 + i * 22, y + 290 - Math.abs(Math.sin(TT * 9 + i)) * 18, 10, 6 + Math.abs(Math.sin(TT * 9 + i)) * 18, '#76d7c4', 3); }
    }
  },
  auto() {
    if (this.ph === 'ring') { this.down(367, 437); return; }
    const c = document.querySelector('#sayBtns .btn'); if (c) { c.click(); return; }
    const r = document.querySelector('#replies .chip'); if (r) { r.click(); return; }
    const b = $('#goBtn'); if (b) b.click();
  }
});
