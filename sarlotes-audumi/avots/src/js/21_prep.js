/* ================= 10. pirms atvēršanas: kafija, grīda, kase, printeris ================= */
const PREP = [
  { id: 'coffee', n: 'Stipra kafija', ic: '☕', x: 96, y: 330, make: () => makeBrew() },
  { id: 'vac', n: 'Izsūkt grīdu', ic: '🧹', x: 70, y: 500, make: () => makeVac(1) },
  { id: 'cash', n: 'Kase un nauda', ic: '💶', x: 352, y: 380, make: () => makeCash() },
  { id: 'print', n: 'Drukāt pasūtījumus', ic: '🖨', x: 236, y: 400, make: () => makePrinter() },
];
scene('prep', {
  hints: ['p_hint'],
  enter() {
    setMin(9 * 60 + 41); this.done = {}; this.comp = null; this.cur = null; this.fin = false;
    D.dust = 60; chat('p_agrita1', .5); this.hub();
  },
  hub() {
    this.comp = null; this.cur = null;
    const left = PREP.filter(p => !this.done[p.id]);
    if (!left.length) return this.finish();
    ui.task('Pirms atvēršanas: ' + (4 - left.length) + '/4 darbi gatavi', 'Pieskaries apaļajai zīmei veikalā vai pogai.');
    ui.btns(PREP.map(p => ({ t: (this.done[p.id] ? '✅ ' : p.ic + ' ') + p.n, cls: this.done[p.id] ? 'alt' : '', dis: !!this.done[p.id], id: 'prep_' + p.id, fn: () => this.open(p) })));
  },
  open(p) {
    if (this.done[p.id] || this.comp) return;
    this.cur = p; this.comp = p.make(); progress(); sfx('pop');
    ui.task({ coffee: 'Stipra kafija sev: iebēr kafiju, spied ▶ un aptur pie svītras.', vac: 'Izsūc grīdu: velc sūcēju pa visiem putekļiem!', cash: 'Ieslēdz kasi un saskaiti naudu. Vai sakrīt ar čeku?', print: 'Izdrukā interneta pasūtījumus un pakomāta uzlīmes.' }[p.id]);
    ui.btns([]);
  },
  closeComp() {
    const p = this.cur; this.done[p.id] = 1; addMin(3);
    const n = { coffee: this.comp.n || 8, vac: 10, cash: 10, print: 6 }[p.id];
    award(n, p.x, p.y);
    if (p.id === 'cash') D.float = 132;
    if (p.id === 'vac') D.dust = 0;
    chat({ coffee: 'p_sniedze_coffee', vac: 'p_agrita_vac', cash: 'p_kitija_cash', print: 'p_sniedze_print' }[p.id], .3);
    this.hub();
  },
  finish() {
    if (this.fin) return; this.fin = true;
    ui.say('p_done', () => { ui.task('Viss gatavs! Tagad interneta pasūtījumi.'); ui.btns([{ t: '📦 Pie pasūtījumiem', id: 'goBtn', fn: () => go('orders') }]); });
  },
  update(dt) {
    if (this.comp) { this.comp.update(dt); if (this.comp.done) this.closeComp(); }
    addMin(dt / 25 / TK());
  },
  down(x, y) {
    if (this.comp) return this.comp.down(x, y);
    for (const p of PREP) if (!this.done[p.id] && dist(x, y, p.x, p.y) < 44) return this.open(p);
  },
  move(x, y, d) { if (this.comp && this.comp.move) this.comp.move(x, y, d); },
  up(x, y) { if (this.comp && this.comp.up) this.comp.up(x, y); },
  hot(x, y) { return !!this.comp || PREP.some(p => !this.done[p.id] && dist(x, y, p.x, p.y) < 44); },
  draw() {
    if (this.comp) { this.comp.draw(); return; }
    drawStore({}); dustDraw(D.dust);
    for (const p of PREP) {
      const ok = this.done[p.id], s = ok ? 1 : 1 + Math.sin(TT * 4 + p.x) * .06;
      circ(p.x, p.y, 36 * s, ok ? '#27ae60' : '#fff'); ring(p.x, p.y, 36 * s, ok ? '#1e8449' : '#c2410c', 4);
      txt(ok ? '✔' : p.ic, p.x, p.y + 2, 30, ok ? '#fff' : '#2b2420');
      box(p.x - 82, p.y + 40, 164, 30, 'rgba(43,36,32,.85)', 8); txt(p.n, p.x, p.y + 55, 17, '#fff', 'center', 700);
    }
  },
  auto() {
    const b = $('#goBtn'); if (b) { b.click(); return; }
    if (ui.sayOpen) return;
    if (this.comp) { this.comp.auto(); return; }
    const p = PREP.find(p => !this.done[p.id]); if (p) this.open(p);
  }
});
