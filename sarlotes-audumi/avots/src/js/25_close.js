/* ================= 14. slēgšana, atskaite, kopīgošana, uzlabojumi ================= */
const UPGRADES = [
  { id: 'flowers', ic: '💐', n: 'Ziedi uz letes', d: 'Klientes gaida par 10% pacietīgāk.', p: 30 },
  { id: 'candy', ic: '🍬', n: 'Konfekšu trauks', d: 'Katra priecīga kliente atstāj +1 kamoliņu.', p: 50 },
  { id: 'garland', ic: '🎏', n: 'Karodziņu vītne', d: 'Krāsaināks veikals un +2 kamoliņi katras dienas beigās.', p: 80 },
  { id: 'poster', ic: '🖼️', n: 'Rudens plakāts', d: 'Plakāts pie durvīm un +2 kamoliņi katras dienas beigās.', p: 100 },
  { id: 'choco', ic: '🍫', n: 'Šokolādes konfektes', d: 'Reizi dienā dusmīgai klientei atgriež 2 sirsniņas.', p: 120 },
  { id: 'lights', ic: '✨', n: 'Spuldzīšu virtene', d: 'Mirdzums un +2 kamoliņi katras dienas beigās.', p: 150 },
  { id: 'coffee', ic: '☕', n: 'Kafijas automāts klientēm', d: 'Klientes gaida par 25% pacietīgāk, un smaržo pēc kafijas.', p: 250 },
];
function shopModal(after) {
  const html = '<h2>🧶 Uzlabojumi</h2><p>Tev ir <b>' + S.coins + ' kamoliņi</b>. Nopirktais paliek uz visām nākamajām dienām.</p>' +
    UPGRADES.map(u => '<div class="shopItem"><div class="ic">' + u.ic + '</div><div class="tx"><b>' + u.n + '</b><br>' + u.d + '</div>' +
      (S.up[u.id] ? '<button class="btn alt" disabled>✔ Ir</button>' : '<button class="btn" data-up="' + u.id + '"' + (S.coins < u.p ? ' disabled' : '') + '>' + u.p + ' 🧶</button>') + '</div>').join('');
  const box2 = ui.modal(html, [{ t: 'Aizvērt', cls: 'teal', fn: () => { after && after(); if (SC_ID === 'title') enterNow('title'); } }]);
  box2.querySelectorAll('[data-up]').forEach(b => b.onclick = () => {
    const u = UPGRADES.find(q => q.id === b.dataset.up); if (!u || S.coins < u.p) return;
    S.coins -= u.p; S.up[u.id] = 1; save(); ui.coins(); sfx('win'); ui.toast(u.ic + ' ' + u.n + ' — nopirkts!'); shopModal(after);
  });
}
function decoCount() { return ['garland', 'poster', 'lights'].filter(k => S.up[k]).length; }
function dayTitle(st) {
  if (st.coins >= 230) return 'Audumu karaliene 👑';
  const c = [];
  if (st.quizN >= 3) c.push([st.quizOk / st.quizN, 'Dzijas burve 🧶']);
  if (st.cutN >= 2) c.push([1 - Math.min(1, st.cutAvg / 10), 'Šķēru meistare ✂️']);
  c.push([st.clean / 100 - .05, 'Tīrības feja 🧹']);
  if (st.cust >= 4) c.push([st.happy / st.cust, 'Klientu mīlule 💐']);
  if (st.ordTot >= 5) c.push([st.ordOk / st.ordTot - (st.late ? .3 : 0), 'Pakomātu karaliene 📦']);
  c.sort((a, b) => b[0] - a[0]);
  return c.length && c[0][0] >= .8 ? c[0][1] : 'Pirmās dienas varone ⭐';
}
function dayStats() {
  const served = D.hearts.length, happy = D.hearts.filter(h => h >= 3).length;
  const cutAvg = D.cuts.length ? D.cuts.reduce((a, b) => a + b, 0) / D.cuts.length : 0;
  const clean = D.cleanN ? Math.round(D.cleanSum / D.cleanN) : 100;
  return { coins: D.coins, quizOk: D.quizOk, quizN: D.quizN, cutN: D.cuts.length, cutAvg, clean, cust: served, happy, ordTot: D.ordersTotal, ordOk: D.ordersDone, late: D.ordersLate, open: D.openAt };
}
function shareText(st, title) {
  const url = (typeof SHARE_URL === 'string' && SHARE_URL) || (location.protocol.startsWith('http') && !/claude|claudeusercontent/.test(location.host) ? location.href.split('#')[0].split('?')[0] : '');
  return '🧵 Šarlotes audumi — mana ' + D.n + '. diena\n' +
    '⏰ Atvēru ' + (st.open ? fmtMin(st.open) : '10:00') + ' | 📦 ' + st.ordOk + '/' + st.ordTot + ' | 😊 ' + st.happy + '/' + st.cust + ' klientes\n' +
    '🧹 Tīrība ' + st.clean + '% | 💶 Kase ' + (D.cashOk ? 'sakrīt ✔' : 'nesakrīt ✘') + '\n' +
    '🧶 ' + st.coins + ' kamoliņi | 🏆 ' + title + '\n' +
    'Vai tu tiktu galā? 👉 ' + (url || 'Šarlotes audumi spēle');
}
scene('close', {
  enter() {
    setMin(840); this.flip = 0; this.ph = 'sign'; sfx('bell');
    ui.say('cl_1', () => this.cashQ());
  },
  cashQ() {
    this.ph = 'cash';
    const cash = Math.round(D.cash * 100) / 100, card = Math.round(D.card * 100) / 100, fl = D.float, right = Math.round((fl + cash) * 100) / 100;
    let wrong1 = Math.round((fl + cash + card) * 100) / 100; if (wrong1 === right) wrong1 = Math.round((right + 10) * 100) / 100;
    let wrong2 = cash; if (wrong2 === right || wrong2 === wrong1) wrong2 = Math.max(0, Math.round((right - 20) * 100) / 100);
    const opts = shuffle([[right, true], [wrong1, false], [wrong2, false]]);
    ui.say('cl_cashq', null, {
      text: 'Kasē no rīta bija ' + eur(fl) + '. Šodien samaksāja skaidrā naudā ' + eur(cash) + ' un ar karti ' + eur(card) + '. Cik naudas tagad jābūt kases atvilktnē?',
      choices: opts.map(([v, ok]) => ({ t: eur(v), fn: () => this.cashA(ok) }))
    });
  },
  cashA(ok) {
    D.cashOk = ok;
    if (ok) { sfx('win'); award(10, 300, 300); } else sfx('bad');
    ui.say(ok ? 'cl_cash_ok' : 'cl_cash_no', () => this.results());
  },
  results() {
    this.ph = 'res';
    const deco = decoCount(); if (deco) award(deco * 2, 300, 300);
    const st = dayStats(), title = dayTitle(st);
    S.days++; S.best = Math.max(S.best || 0, st.coins); S.hist.push({ d: D.date, c: st.coins, t: title }); if (S.hist.length > 30) S.hist.shift();
    S.day = null; save();
    chat('cl_sniedze', .4); chat('cl_agrita', .3); chat('cl_kitija', .3);
    const text = shareText(st, title); this.text = text;
    const row = (a, b) => '<div class="row"><span>' + a + '</span><b>' + b + '</b></div>';
    const html = '<h2>Diena galā! 🎉</h2><p style="font-size:22px;margin:4px 0 10px">🏆 <b>' + title + '</b></p>' +
      row('⏰ Veikalu atvēri', st.open ? fmtMin(st.open) : '—') +
      row('📦 Interneta pasūtījumi', st.ordOk + ' no ' + st.ordTot + (st.late ? ' (' + st.late + ' kavējās)' : '')) +
      row('😊 Priecīgas klientes', st.happy + ' no ' + st.cust) +
      row('❓ Pareizas atbildes', st.quizOk + ' no ' + st.quizN) +
      row('✂️ Griešanas precizitāte', st.cutN ? '± ' + Math.round(st.cutAvg) + ' cm' : '—') +
      row('🧹 Tīrība', st.clean + '%') +
      row('💶 Kase', D.cashOk ? 'sakrīt ✔' : 'nesakrīt ✘') +
      row('🧶 Kamoliņi šodien', st.coins) +
      '<p style="margin-top:12px">Nosūti rezultātu draudzenēm — vai viņas tiktu galā?</p><div class="shareBox">' + text.replace(/</g, '&lt;') + '</div>';
    const b = [
      { t: '📲 Sūtīt WhatsApp', cls: 'teal', id: 'waBtn', keep: true, fn: () => { open('https://wa.me/?text=' + encodeURIComponent(text), '_blank'); } },
      { t: '📋 Kopēt', cls: 'alt', keep: true, fn: () => { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => ui.toast('Nokopēts! Ielīmē čatā 🙂')).catch(() => ui.toast('Neizdevās nokopēt — iezīmē tekstu ar pirkstu.')); } },
    ];
    if (navigator.share) b.push({ t: '↗ Dalīties…', cls: 'alt', keep: true, fn: () => navigator.share({ text }).catch(() => { }) });
    b.push({ t: '🧶 Uzlabojumi', cls: 'alt', fn: () => shopModal(() => this.endBtns()) });
    b.push({ t: '🏠 Uz sākumu', fn: () => go('title') });
    ui.modal(html, b);
    this.endBtns();
  },
  endBtns() {
    ui.task('Diena galā! Kamoliņi: ' + S.coins + ' 🧶');
    ui.btns([{ t: '📊 Rezultāts', cls: 'alt', fn: () => this.results2() }, { t: '🏠 Uz sākumu', id: 'goBtn', fn: () => go('title') }]);
  },
  results2() { ui.modal('<h2>Tavs rezultāts</h2><div class="shareBox">' + (this.text || '').replace(/</g, '&lt;') + '</div>', [{ t: '📲 Sūtīt WhatsApp', cls: 'teal', keep: true, fn: () => open('https://wa.me/?text=' + encodeURIComponent(this.text), '_blank') }, { t: 'Aizvērt', cls: 'alt' }]); },
  update(dt) { this.flip = Math.min(1, this.flip + dt * 1.5); },
  draw() {
    drawStore({});
    box(0, 0, W, H, 'rgba(30,20,15,' + (.25 * this.flip) + ')');
    // zīme uz durvīm
    g.save(); g.translate(300, 250); g.scale(Math.cos(this.flip * Math.PI) || .01, 1);
    const back = this.flip > .5; box(-110, -60, 220, 120, back ? '#c0392b' : '#27ae60', 14); ln(-60, -60, 0, -100, '#7f8c8d', 3); ln(60, -60, 0, -100, '#7f8c8d', 3);
    g.scale(back ? -1 : 1, 1); txt(back ? 'SLĒGTS' : 'ATVĒRTS', 0, 2, 38, '#fff', 'center', 800);
    g.restore();
    txtO('14:00 — diena galā!', 300, 420, 30, '#fff', '#3b2f2a');
  },
  auto() {
    if (ui.ovOpen) { const b = [...document.querySelectorAll('#ovBox .btn')].find(e => e.textContent.includes('Uz sākumu')); if (b) b.click(); return; }
    if (ui.sayOpen) { const ch = document.querySelectorAll('#sayBtns .btn.choice'); if (ch.length) ch[0].click(); return; }
    const b = $('#goBtn'); if (b) b.click();
  }
});
