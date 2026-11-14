/* ================= 13. veikals atvērts 10:00–14:00 ================= */
const WHERE = [['w_zip', 'sup'], ['w_buttons', 'sup'], ['w_thread', 'sup'], ['w_mneedle', 'sup'], ['w_mohair', 'dz'], ['w_merino', 'dz'], ['w_cotyarn', 'dz'], ['w_sockyarn', 'dz'],
  ['w_lining', 'oder'], ['w_lining2', 'oder'], ['w_fleece', 'aud'], ['w_velvet', 'aud'], ['w_linen', 'aud'], ['w_jersey', 'aud'], ['w_hooks', 'ada'], ['w_needles', 'ada'], ['w_circular', 'ada'], ['w_markers', 'ada']];
const CUTREQ = [['cut_linen', 'f_linen', 1.5], ['cut_fleece', 'f_fleece', 2], ['cut_velvet', 'f_velvet', .8], ['cut_flower', 'f_flower', 1.2], ['cut_lining', 'f_lining', .5], ['cut_leaves', 'f_leaves', 3], ['cut_stars', 'f_stars', .7], ['cut_stripe', 'f_stripe', 1.1]];
const QN = 36;
const SLOTX = [244, 304, 364], DOOR = 588, FEET = 446;
const CNAMES_F = ['Biruta', 'Vija', 'Anita', 'Ilga', 'Silvija', 'Mārīte', 'Gunta', 'Dzintra', 'Velta', 'Ināra', 'Aija', 'Skaidrīte', 'Ligita', 'Daiga', 'Austra', 'Sarmīte'];
const CNAMES_M = ['Jānis', 'Aivars', 'Pēteris', 'Andris'];
const OPEN_DUR = { mierigi: 540, parasti: 480, sestdiena: 420 };
scene('open', {
  hints: ['op_hint1', 'op_hint2'],
  enter() {
    if (D.openAt == null) D.openAt = Math.round(D.min);
    this.start = 600; setMin(Math.max(600, D.min)); this.gm = D.min; this.rate = 240 / (OPEN_DUR[S.tempo] || 480);
    this.cust = []; this.comp = null; this.compKind = ''; this.point = null; this.ordersQ = []; this.boxN = 0; this.courier = null; this.ending = false; this.cid = 0; this.secT = 0;
    // grafiks
    const n = { mierigi: 13, parasti: 16, sestdiena: 19 }[S.tempo] || 16;
    this.sched = []; for (let i = 0; i < n; i++) this.sched.push(Math.round(this.gm + 4 + i * (224 - (this.gm - 600)) / n + ri(-3, 3)));
    const kinds = []; for (let i = 0; i < n; i++) kinds.push(i % 5 === 4 ? 'cut' : i % 5 === 3 ? 'buy' : i % 2 ? 'quiz' : 'where');
    this.kinds = shuffle(kinds); this.kinds[0] = 'where';
    this.qBag = shuffle(Array.from({ length: QN }, (_, i) => 'q' + String(i + 1).padStart(2, '0')));
    this.wBag = shuffle(WHERE.slice()); this.cBag = shuffle(CUTREQ.slice());
    this.orderAt = [625, 668, 712, 760, 802].filter(t => t > this.gm + 2);
    this.courAt = [722, 831].filter(t => t > this.gm);
    this.chatAt = [[640, 'op_agrita_tea'], [700, 'op_kitija_selfie'], [722, 'op_sniedze_lunch'], [780, 'op_agrita_photo'], [826, 'op_sniedze_almost']].filter(c => c[0] > this.gm);
    this.flags = {};
    sfx('bell');
    ui.say('op_open', () => { chat('op_sniedze_open', .2); this.statusUI(); });
  },
  /* ---------- palīgi ---------- */
  patience() { const u = S.up || {}; return 52 * TK() * (u.flowers ? 1.1 : 1) * (u.coffee ? 1.25 : 1) * (D.dust > 55 ? .75 : 1); },
  freeSlot() { for (let i = 0; i < 3; i++) if (!this.cust.some(c => c.slot === i && c.state !== 'gone')) return i; return -1; },
  spawn() {
    const slot = this.freeSlot(); if (slot < 0) return false;
    const male = rnd() < .14; let kind = this.kinds.shift() || 'where'; if (male) { this.kinds.push(kind); kind = 'buy'; }
    const c = { id: ++this.cid, look: makeLook(male), male, name: male ? pick(CNAMES_M) : pick(CNAMES_F), x: DOOR, y: FEET, tx: SLOTX[slot], ty: FEET, slot, state: 'enter', hearts: 5, wt: 0, ph: 0, kind, say: null, served: false, tip: 0 };
    if (kind === 'where') { const w = this.wBag.shift() || pick(WHERE); this.wBag.push(w); c.req = { id: w[0], zone: w[1], tries: 0 }; }
    if (kind === 'quiz') { const q = this.qBag.shift(); this.qBag.push(q); c.req = { id: q }; }
    if (kind === 'cut') { const k = this.cBag.shift(); this.cBag.push(k); c.req = { id: k[0], item: k[1], len: k[2] }; }
    const tot = Math.round((ri(250, 2890)) / 10) * 10; let giv = [500, 1000, 2000, 5000].find(v => v > tot) || 5000;
    c.pay = { total: tot, given: giv, card: rnd() < .55 };
    this.cust.push(c); D.cust++; D.dust = Math.min(100, D.dust + 1.5); sfx('bell'); return true;
  },
  bubble(c, id, t = 2.6) { c.say = { text: T(id), t }; voice(id); },
  statusUI() {
    if (this.comp || this.point || ui.busy() || this.ending) return;
    const waiting = this.cust.filter(c => c.state === 'wait' || c.state === 'pay').length;
    const sig = waiting + '/' + this.ordersQ.length + '/' + this.boxN + '/' + Math.round(D.dust / 5);
    if (sig === this.lastSig && $('#vacBtn')) return; this.lastSig = sig;
    ui.task('Veikals atvērts līdz 14:00. Pieskaries klientei, lai apkalpotu!', 'Gaida: ' + waiting + ' · Pasūtījumi: ' + this.ordersQ.length + ' · Kastē: ' + this.boxN + ' · Putekļi: ' + Math.round(D.dust) + '%');
    ui.btns([{ t: '🧹 Sūkt' + (D.dust > 50 ? ' ❗' : ''), cls: 'alt', id: 'vacBtn', fn: () => this.openVac() }, { t: '📦 Pasūtījums (' + this.ordersQ.length + ')', cls: 'alt', id: 'ordBtn', dis: !this.ordersQ.length, fn: () => this.openOrder() }]);
  },
  /* ---------- darbības ---------- */
  serve(c) {
    if (this.comp || this.point || ui.busy()) return;
    progress(); sfx('tap');
    if (c.state === 'pay') return this.startPay(c);
    if (c.state !== 'wait') return;
    c.served = true; c.state = 'talk';
    const k = c.kind, o = { who: c.name, spk: c.male ? 'klv' : 'kl' };
    if (k === 'where') { ui.say(c.req.id, () => { this.point = c; ui.task('Parādi, kur tas ir: pieskaries pareizajam plauktam!', T(c.req.id)); ui.btns([{ t: 'Vēlāk', cls: 'alt', fn: () => { this.point = null; c.state = 'wait'; c.served = false; this.statusUI(); } }]); }, o); }
    else if (k === 'quiz') {
      const q = c.req.id, ans = shuffle(['a', 'b', 'c']);
      ui.say(q, null, Object.assign({}, o, { choices: ans.map(a => ({ t: T(q + a), fn: () => this.answer(c, a === 'a') })) }));
    }
    else if (k === 'cut') { ui.say(c.req.id, () => this.startCut(c), o); }
    else { c.state = 'pay'; this.startPay(c); }
  },
  answer(c, ok) {
    D.quizN++; const o = { who: c.name, spk: c.male ? 'klv' : 'kl' };
    if (ok) { D.quizOk++; c.hearts = Math.min(5, c.hearts + 1); award(5, c.x, c.y - 180); sfx('win'); if (!this.flags.quiz) { this.flags.quiz = 1; chat('op_kitija_smart', .5); } ui.say(pick(['qa_ok1', 'qa_ok2', 'qa_ok3']), () => this.afterTalk(c, .7), o); }
    else { c.hearts = Math.max(0, c.hearts - 1); sfx('bad'); ui.say(c.req.id + 'x', () => this.afterTalk(c, .45), o); }
  },
  afterTalk(c, buyP) { if (rnd() < buyP) this.goShop(c, null); else this.finishCust(c); this.statusUI(); },
  pointZone(z) {
    const c = this.point; if (!c) return;
    if (z.id === c.req.zone) { this.point = null; sfx('ok'); award(4, z.r.x + z.r.w / 2, 200); c.hearts = Math.min(5, c.hearts + 1); this.bubble(c, pick(['w_ok1', 'w_ok2', 'w_ok3'])); this.goShop(c, z); this.statusUI(); }
    else {
      c.req.tries++; c.hearts = Math.max(0, c.hearts - 1); sfx('bad'); ui.toast('Tur ir ' + z.n.toLowerCase() + '. Mēģini vēlreiz!');
      if (c.req.tries >= 2) { this.point = null; this.bubble(c, 'w_self'); this.goShop(c, ZONE(c.req.zone)); this.statusUI(); }
    }
  },
  goShop(c, z) { z = z || pick(ZONES); c.state = 'shop'; c.tx = z.r.x + z.r.w / 2 + ri(-10, 10); c.ty = 376; c.shopT = 3 + rnd() * 3; },
  leave(c) { c.state = 'leave'; c.tx = DOOR; c.ty = FEET; c.slot = -1; },
  startCut(c) {
    this.comp = makeCut(c.req.item, c.req.len); this.compKind = 'cut'; this.compCust = c;
    ui.task('Nogriez ' + m2(c.req.len) + ': velc audumu līdz zaļajai līnijai un spied «Griezt».'); ui.btns([{ t: '✂ Griezt', id: 'cutBtn', fn: () => this.comp && this.comp.doCut && this.comp.doCut() }]);
  },
  startPay(c) {
    const o = { who: c.name, spk: c.male ? 'klv' : 'kl' };
    if (c.pay.card) { ui.say(c.male ? 'pay_card_m' : 'pay_card', () => { this.comp = makeCard(c.pay.total); this.compKind = 'card'; this.compCust = c; ui.task('Kliente maksā ar karti: pieskaries terminālim.'); ui.btns([]); }, o); }
    else { ui.say(c.male ? 'pay_cash_m' : 'pay_cash', () => { this.comp = makePay(c.pay.total, c.pay.given); this.compKind = 'cash'; this.compCust = c; ui.task('Izdod atlikumu: spied naudu, līdz sakrīt, un tad «Atdot».'); ui.btns([]); }, o); }
  },
  compDone() {
    const k = this.compKind, c = this.compCust, cp = this.comp; this.comp = null; this.compKind = ''; this.compCust = null;
    if (k === 'cut') { D.cuts.push(cp.err); award(cp.err <= 2 ? 8 : cp.err <= 6 ? 5 : 2, 300, 300); c.hearts = Math.min(5, c.hearts + (cp.err <= 6 ? 1 : -1)); c.state = 'pay'; c.wt = 0; this.bubble(c, cp.err <= 6 ? 'cut_ok' : 'cut_meh'); }
    else if (k === 'card' || k === 'cash') {
      if (k === 'card') D.card += c.pay.total / 100; else D.cash += c.pay.total / 100;
      award(k === 'cash' ? (cp.tray.length <= optimalCount(cp.due) ? 4 : 2) : 1, 300, 300);
      this.finishCust(c);
    }
    else if (k === 'vac') { D.dust = 0; award(6, 300, 300); chat(pick(['op_vac1', 'op_vac2']), .2); }
    else if (k === 'order') { const n = orderCoins(cp); award(n, 300, 300); this.boxN++; D.ordersDone++; if (cp.left <= 0) D.ordersLate++; sfx('klunk'); }
    this.statusUI();
  },
  finishCust(c) {
    const h = c.hearts, u = S.up || {};
    let n = h + (h >= 4 ? 2 : 0) + (u.candy && h >= 3 ? 1 : 0); award(n, c.x, c.y - 200);
    D.hearts.push(h); if (h >= 3) D.custHappy++;
    this.bubble(c, c.male ? 'leave_m' : h >= 4 ? pick(['leave_happy1', 'leave_happy2', 'leave_happy3']) : 'leave_ok');
    this.leave(c);
  },
  openVac() { if (this.comp || this.point || ui.busy()) return; this.comp = makeVac(Math.max(.25, D.dust / 100)); this.compKind = 'vac'; ui.task('Izsūc putekļus — velc sūcēju pa grīdu!'); ui.btns([]); },
  openOrder() { if (this.comp || this.point || ui.busy() || !this.ordersQ.length) return; const o = this.ordersQ.shift(); o.time *= .85; this.comp = makeOrderFlow(o); this.compKind = 'order'; this.comp.onStep = () => this.orderTask(); this.orderTask(); },
  orderTask() { const f = this.comp; if (!f || this.compKind !== 'order') return; ui.task('Interneta pasūtījums Nr. ' + f.order.no + ': ' + { pick: 'savāc preces.', cut: 'nogriez audumu.', pack: 'sapako (pieskaries kastei).', label: f.label.stuck ? 'ieliec pelēkajā kastē.' : 'uzlīmē uzlīmi.', drop: '' }[f.step]); ui.btns(f.step === 'cut' ? [{ t: '✂ Griezt', id: 'cutBtn', fn: () => f.cutC && f.cutC.doCut() }] : []); },
  /* ---------- laiks ---------- */
  update(dt) {
    if (this.comp) { this.comp.update(dt); if (this.comp.done) this.compDone(); return; }
    for (const c of this.cust) if (c.say) { c.say.t -= dt; if (c.say.t <= 0) c.say = null; }
    if (ui.busy() || this.ending) return;
    this.gm += dt * this.rate; setMin(Math.min(840, this.gm));
    this.secT += dt; if (this.secT >= 1) { this.secT = 0; D.cleanSum += 100 - D.dust; D.cleanN++; this.statusUI(); }
    D.dust = Math.min(100, D.dust + dt * .12 / TK());
    if (D.dust > 60 && !this.flags.dust) { this.flags.dust = 1; chat('op_kitija_dust'); }
    if (this.sched.length && this.gm >= this.sched[0] && this.gm < 832) { if (this.spawn()) this.sched.shift(); }
    if (this.orderAt.length && this.gm >= this.orderAt[0]) { this.orderAt.shift(); const tpl = pick(ORDER_POOL); this.ordersQ.push(makeOrder(tpl)); D.ordersTotal++; sfx('print'); floater(490, 400, '🖨 Jauns pasūtījums!', '#2471a3'); if (!this.flags.ord) { this.flags.ord = 1; chat('op_sniedze_order', .3); } }
    if (this.chatAt.length && this.gm >= this.chatAt[0][0]) { const [, id] = this.chatAt.shift(); chat(id); if (id === 'op_agrita_tea') setTimeout(() => ui.replies([{ t: 'Turies! 🍵', fn: () => chat('op_agrita_tea2') }, { t: 'Te viss kārtībā 😎', fn: () => chat('op_kitija_cool') }]), 1500); }
    if (this.courAt.length && this.gm >= this.courAt[0] && !this.courier) { this.courAt.shift(); this.courier = { x: DOOR, y: FEET, tx: 488, state: 'in', t: 0, ph: 0, look: { coat: '#e67e22', hair: '#5a3825', skin: '#e8b48f', style: 'mshort', glasses: false, hat: '#2b2420', bag: null, scarf: null, male: true } }; sfx('bell'); }
    // klientes
    for (const c of this.cust) {
      if (c.state === 'gone') continue;
      const sp = 150 * dt, d = dist(c.x, c.y, c.tx, c.ty);
      if (d > 1) { c.x += (c.tx - c.x) / d * Math.min(d, sp); c.y += (c.ty - c.y) / d * Math.min(d, sp); c.ph += dt * 10; }
      else if (c.state === 'enter') { c.state = c.kind === 'buy' ? 'pay' : 'wait'; c.wt = 0; if (c.male) this.bubble(c, 'm_hello', 3); }
      else if (c.state === 'shop') { c.shopT -= dt; if (c.shopT <= 0) { const s = this.freeSlotFor(c); if (s >= 0) { c.slot = s; c.state = 'back'; c.tx = SLOTX[s]; c.ty = FEET; } } }
      else if (c.state === 'back') { c.state = 'pay'; c.wt = 0; }
      else if (c.state === 'leave') { c.state = 'gone'; }
      if (c.state === 'wait' || c.state === 'pay') {
        if (this.point === c) continue;
        c.wt += dt; const step = this.patience() / 5;
        if (c.wt >= step) { c.wt = 0; c.hearts--; if (c.hearts === 1 && S.up && S.up.choco && !D.chocoUsed) { D.chocoUsed = true; c.hearts += 2; floater(c.x, c.y - 200, '🍫 +2 ❤', '#6e2c00'); } }
        if (c.hearts <= 0) { D.custAngry++; D.hearts.push(0); this.bubble(c, c.male ? 'leave_angry_m' : 'leave_angry'); sfx('bad'); this.leave(c); if (!this.flags.angry) { this.flags.angry = 1; chat('op_agrita_angry', .3); } }
      }
    }
    this.cust = this.cust.filter(c => c.state !== 'gone' || c.say);
    // kurjers
    const k = this.courier;
    if (k) {
      const d = k.tx - k.x; if (Math.abs(d) > 2) { k.x += Math.sign(d) * Math.min(Math.abs(d), 160 * dt); k.ph += dt * 10; }
      else if (k.state === 'in') { k.state = 'take'; k.t = 0; k.took = this.boxN; this.boxN = 0; sfx('klunk'); k.say = { text: T(k.took ? 'cour_hi' : 'cour_empty'), t: 2.4 }; voice(k.took ? 'cour_hi' : 'cour_empty'); }
      else if (k.state === 'take') { k.t += dt; if (k.t > 1.4) { k.state = 'out'; k.tx = DOOR + 40; if (k.took) chat('op_sniedze_courier', .2); } }
      else if (k.state === 'out') { this.courier = null; }
      if (k.say) { k.say.t -= dt; if (k.say.t <= 0) k.say = null; }
    }
    if (this.gm >= 840 && !this.ending) this.close();
  },
  freeSlotFor(c) { for (let i = 0; i < 3; i++) if (!this.cust.some(o => o !== c && o.slot === i && o.state !== 'gone' && o.state !== 'leave')) return i; return -1; },
  close() {
    this.ending = true; setMin(840); this.point = null;
    D.ordersLate += this.ordersQ.length;
    for (const c of this.cust) if (c.state !== 'gone' && c.state !== 'leave') { if (c.served || c.state === 'pay') D.hearts.push(c.hearts); this.leave(c); }
    ui.btns([]); sfx('bell');
    ui.say('op_close', () => go('close'));
  },
  /* ---------- ievade ---------- */
  down(x, y) {
    if (this.comp) return this.comp.down(x, y);
    if (ui.busy() || this.ending) return;
    if (this.point) { for (const z of ZONES) if (inR(x, y, z.r)) return this.pointZone(z); return; }
    const cs = this.cust.filter(c => (c.state === 'wait' || c.state === 'pay')).sort((a, b) => b.y - a.y);
    for (const c of cs) if (inR(x, y, R(c.x - 32, c.y - 196, 64, 200))) return this.serve(c);
    if (inR(x, y, R(10, 470, 100, 125))) return this.openVac();
    if (this.ordersQ.length && inR(x, y, R(436, 400, 104, 90))) return this.openOrder();
  },
  move(x, y, d) { if (this.comp && this.comp.move) this.comp.move(x, y, d); },
  up(x, y) { if (this.comp && this.comp.up) this.comp.up(x, y); },
  hot(x, y) { if (this.comp || this.point) return true; return this.cust.some(c => (c.state === 'wait' || c.state === 'pay') && inR(x, y, R(c.x - 32, c.y - 196, 64, 200))) || inR(x, y, R(10, 470, 100, 125)) || (this.ordersQ.length && inR(x, y, R(436, 400, 104, 90))); },
  /* ---------- zīmēšana ---------- */
  drawC(c) {
    const s = lerp(.8, 1, clamp((c.y - 376) / (FEET - 376), 0, 1)) * .92;
    const mood = c.hearts >= 4 ? 2 : c.hearts >= 2 ? 1 : 0;
    drawCust(c.x, c.y, s, c.look, Math.abs(c.tx - c.x) > 1 ? c.ph : 0, c.state === 'leave' && c.hearts <= 0 ? 0 : mood);
  },
  drawUI(c) {
    const s = lerp(.8, 1, clamp((c.y - 376) / (FEET - 376), 0, 1)) * .92, top = c.y - 175 * s;
    if (c.state === 'wait' || c.state === 'pay') {
      const ic = c.state === 'pay' ? (c.pay.card ? '💳' : '💶') : { where: '📍', quiz: '❓', cut: '✂️', buy: '💶' }[c.kind];
      const bob = Math.sin(TT * 4 + c.id) * 3, flash = this.point === c;
      box(c.x - 24, top - 52 + bob, 48, 40, flash ? '#fff3e0' : '#fff', 12); poly([c.x - 6, top - 13 + bob, c.x + 6, top - 13 + bob, c.x, top - 4 + bob], '#fff'); txt(ic, c.x, top - 31 + bob, 24);
      for (let i = 0; i < 5; i++) heart(c.x - 24 + i * 12, top - 60 + bob, 5.5, i < c.hearts ? '#e74c3c' : 'rgba(0,0,0,.2)');
    }
    if (c.say) { const w = 230; g.font = '700 17px ' + FONT; const tw = Math.min(w, g.measureText(c.say.text).width + 24); const bx = clamp(c.x - tw / 2, 6, W - tw - 6), by = top - 104; box(bx, by, tw, 52, 'rgba(255,255,255,.96)', 12); wrapTxt(c.say.text, bx + tw / 2, by + 15, tw - 14, 16, 19, '#2b2420', 'center', 700); }
  },
  draw() {
    if (this.comp) { this.comp.draw(); return; }
    const back = this.cust.filter(c => c.state !== 'gone').sort((a, b) => a.y - b.y);
    drawStore({ under: () => { dustDraw(D.dust); back.forEach(c => this.drawC(c)); if (this.courier) drawCust(this.courier.x, this.courier.y, .92, this.courier.look, this.courier.ph, 2); } });
    // pasūtījumu biļetes
    if (this.ordersQ.length) { for (let i = 0; i < Math.min(3, this.ordersQ.length); i++) box(448 + i * 6, 410 + i * 4, 70, 56, '#fffdf8', 4); box(448, 410, 70, 12, '#2471a3', 4); txt('🖨', 483, 446, 22); circ(530, 412, 14, '#e74c3c'); txt(String(this.ordersQ.length), 530, 413, 15, '#fff', 'center', 800); }
    if (this.boxN) { circ(526, 492, 13, '#27ae60'); txt(String(this.boxN), 526, 493, 14, '#fff', 'center', 800); }
    // putekļu rādītājs
    box(8, 470, 110, 24, 'rgba(255,255,255,.88)', 10); box(8, 470, 110 * D.dust / 100, 24, D.dust > 55 ? '#e67e22' : '#95a5a6', 10); txt('putekļi', 63, 483, 15, '#2b2420', 'center', 800);
    back.forEach(c => this.drawUI(c));
    if (this.courier && this.courier.say) { const k = this.courier; box(k.x - 110, 230, 180, 40, '#fff', 12); txt(k.say.text, k.x - 20, 250, 13.5, '#2b2420', 'center', 700); }
    if (this.point) {
      g.fillStyle = 'rgba(30,20,15,.35)'; g.fillRect(0, 300, W, 300);
      for (const z of ZONES) { const a = .55 + Math.sin(TT * 5) * .35; g.strokeStyle = 'rgba(255,255,255,' + a + ')'; g.lineWidth = 5; rr(z.r.x, z.r.y, z.r.w, z.r.h, 10); g.stroke(); }
      txtO('Kur tas ir? Pieskaries plauktam 👆', 300, 330, 22, '#fff', '#3b2f2a');
    }
  },
  auto() {
    if (ui.sayOpen) { const ch = document.querySelectorAll('#sayBtns .btn.choice'); if (ch.length) { const want = this.lastQ ? T(this.lastQ + 'a') : null; for (const b of ch) if (b.textContent === want) { b.click(); return; } ch[0].click(); } return; }
    if (this.comp) { this.comp.auto(); return; }
    if (this.point) { this.pointZone(ZONE(this.point.req.zone)); return; }
    if (D.dust > 70) return this.openVac();
    const c = this.cust.find(c => c.state === 'wait' || c.state === 'pay');
    if (c) { if (c.kind === 'quiz') this.lastQ = c.req.id; this.serve(c); return; }
    if (this.ordersQ.length) this.openOrder();
  }
});
/* karšu terminālis */
function makeCard(totalC) {
  return {
    ok: false, t: 0, done: false,
    down(x, y) { if (!this.ok && inR(x, y, R(200, 160, 200, 300))) { this.ok = true; sfx('beep'); setTimeout(() => sfx('cash'), 300); progress(); } },
    update(dt) { if (this.ok) { this.t += dt; if (this.t > 1) this.done = true; } },
    draw() {
      box(0, 0, W, H, '#e8dccb'); txt('Summa: ' + eur(totalC / 100), 300, 80, 30, '#2b2420', 'center', 800);
      box(200, 160, 200, 300, '#2b2420', 24); box(220, 186, 160, 90, this.ok ? '#58d68d' : '#85c1e9', 8); txt(this.ok ? 'APSTIPRINĀTS' : 'Pielieciet karti', 300, 231, 16, '#1b2631', 'center', 800);
      for (let i = 0; i < 9; i++) box(232 + (i % 3) * 48, 296 + Math.floor(i / 3) * 44, 40, 34, '#566573', 6);
      if (!this.ok) { const y = 330 + Math.sin(TT * 3) * 20; box(260, y - 120, 120, 76, '#2471a3', 8); box(270, y - 104, 26, 18, '#d4ac0d', 3); txtO('Pieskaries terminālim', 300, 520, 24, '#fff', '#2471a3'); }
      else txtO('Paldies! 💳', 300, 520, 30, '#fff', '#1e8449');
    },
    auto() { this.down(300, 300); }
  };
}
