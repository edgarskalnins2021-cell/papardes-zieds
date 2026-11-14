/* ================= 11. pieci interneta pasūtījumi ================= */
scene('orders', {
  hints: ['o_hint1', 'o_hint2'],
  enter() {
    setMin(Math.max(D.min, 9 * 60 + 50)); this.ix = 0; this.list = shuffle(ORDER_POOL.slice()).slice(0, 5).map(makeOrder); this.flow = null; this.fin = false; this.parcels = [];
    D.ordersTotal += 5;
    ui.say('o_intro', () => this.start());
  },
  start() {
    this.flow = makeOrderFlow(this.list[this.ix]); this.flow.onStep = () => this.taskFor();
    this.taskFor();
  },
  taskFor() {
    const f = this.flow; if (!f) return;
    const t = { pick: 'Savāc preces no plauktiem (cilnes: Audumi, Dzija, Piederumi).', cut: 'Nogriez audumu pareizā garumā un spied «Griezt».', pack: 'Sapako: pieskaries kastei.', label: f.label.stuck ? 'Ieliec paku pelēkajā kastē: pieskaries tai.' : 'Uzlīmē pakomāta uzlīmi: velc to uz pakas.', drop: '' }[f.step];
    ui.task('Pasūtījums ' + (this.ix + 1) + '/5: ' + t);
    ui.btns(f.step === 'cut' ? [{ t: '✂ Griezt', id: 'cutBtn', fn: () => f.cutC && f.cutC.doCut() }] : []);
  },
  next() {
    const f = this.flow, n = orderCoins(f); award(n, 300, 300);
    D.ordersDone++; if (f.left <= 0) D.ordersLate++;
    this.parcels.push({ no: f.order.no, size: f.order.lines.some(l => ITEMS[l.id].cat === 'aud' && l.q >= 1.4) ? 3 : f.order.lines.length >= 3 || f.order.lines.some(l => ITEMS[l.id].cat === 'aud') ? 2 : 1 });
    if (this.ix === 0) chat('o_kitija_first', .2); else if (f.left > f.order.time * .5) chat(pick(['o_fast1', 'o_fast2']), .2);
    this.ix++; addMin(1.2);
    if (this.ix >= this.list.length) { this.flow = null; D.parcels = this.parcels; this.finish(); }
    else this.start();
  },
  finish() {
    if (this.fin) return; this.fin = true; ui.btns([]);
    ui.say('o_done', () => { ui.task('Pieci pasūtījumi ir pelēkajā kastē. Uz pakomātu!'); ui.btns([{ t: '🟧 Uz oranžo pakomātu', id: 'goBtn', fn: () => go('locker') }]); });
  },
  update(dt) {
    if (this.flow) { this.flow.update(dt); if (this.flow.done) this.next(); }
    addMin(dt / 25 / TK());
  },
  down(x, y) { if (this.flow) this.flow.down(x, y); },
  move(x, y, d) { if (this.flow) this.flow.move(x, y, d); },
  up(x, y) { if (this.flow) this.flow.up(x, y); },
  draw() {
    if (this.flow) { this.flow.draw(); return; }
    drawStore({}); box(0, 0, W, H, 'rgba(0,0,0,.25)');
    box(150, 250, 300, 120, '#95a5a6', 10); txt('📦 × ' + Math.min(this.ix, 5), 300, 310, 40, '#fff', 'center', 800);
  },
  auto() {
    const b = $('#goBtn'); if (b) { b.click(); return; }
    if (ui.sayOpen) return;
    if (this.flow) this.flow.auto();
  }
});
