/* ================= saskarne: uzdevums, pogas, dialogs, čats, logi ================= */
const ui = {
  sayOpen: false, sayCanTap: false, ovOpen: false, _sayCb: null, _seq: null,
  reset() { this.task(''); this.btns([]); this.hideSay(); this.replies(null); },
  task(h, small) { const e = $('#task'); e.innerHTML = h + (small ? '<small>' + small + '</small>' : ''); e.classList.toggle('hide', !h); },
  btns(list) {
    const b = $('#btns'); b.innerHTML = '';
    for (const it of list || []) {
      const e = document.createElement('button'); e.className = 'btn ' + (it.cls || ''); e.innerHTML = it.t;
      if (it.id) e.id = it.id; if (it.dis) e.disabled = true;
      if (it.hold) { // turamā poga
        e.addEventListener('pointerdown', ev => { ev.preventDefault(); audioUnlock(); it.hold(true); });
        const up = () => it.hold(false); e.addEventListener('pointerup', up); e.addEventListener('pointerleave', up); e.addEventListener('pointercancel', up);
      } else e.onclick = () => { audioUnlock(); sfx('tap'); it.fn && it.fn(); };
      b.appendChild(e);
    }
  },
  /* dialogs: say(id, cb, {who, choices:[{t, fn}]}) */
  say(id, cb, o = {}) {
    const spk = o.spk || WHO(id), sp = SPK[spk] || SPK.nar;
    const who = o.who != null ? o.who : sp[0];
    $('#sayWho').textContent = who; $('#sayWho').style.color = sp[1];
    $('#sayTxt').textContent = o.text || T(id);
    $('#sayTxt').style.fontStyle = (spk === 'nar' || spk === 'sys') ? 'italic' : 'normal';
    const bb = $('#sayBtns'); bb.innerHTML = '';
    this._sayCb = cb; this.sayOpen = true;
    if (o.choices) {
      this.sayCanTap = false;
      o.choices.forEach(c => {
        const e = document.createElement('button'); e.className = 'btn choice'; e.innerHTML = c.t;
        e.onclick = () => { audioUnlock(); sfx('tap'); this.hideSay(); c.fn && c.fn(); }; bb.appendChild(e);
      });
    } else {
      this.sayCanTap = true;
      const e = document.createElement('button'); e.className = 'btn teal'; e.id = 'sayNext'; e.textContent = o.btn || 'Tālāk ▶';
      e.onclick = () => { audioUnlock(); this.sayNext(); }; bb.appendChild(e);
    }
    $('#say').classList.remove('hide');
    if (!o.text) voice(id);
    if (this.auto) setTimeout(() => { if (this.sayOpen && this.sayCanTap) this.sayNext(); }, 30);
  },
  sayNext() { const cb = this._sayCb; this.hideSay(); sfx('tap'); cb && cb(); },
  hideSay() { $('#say').classList.add('hide'); $('#sayBtns').innerHTML = ''; this.sayOpen = false; this.sayCanTap = false; this._sayCb = null; },
  seq(ids, cb, o = {}) { const step = i => i >= ids.length ? (cb && cb()) : this.say(ids[i], () => step(i + 1), o); step(0); },
  busy() { return this.sayOpen || this.ovOpen; },
  coins() { $('#coins').textContent = '🧶 ' + S.coins; },
  toast(s, ms = 2200) { const t = $('#toast'); t.textContent = s; t.classList.add('on'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('on'), ms); },
  /* logs pāri visam */
  modal(html, btns, o = {}) {
    const box = $('#ovBox'); box.innerHTML = html;
    const wrap = document.createElement('div'); wrap.className = 'ovBtns';
    (btns || []).forEach(b => {
      const e = document.createElement('button'); e.className = 'btn ' + (b.cls || ''); e.innerHTML = b.t; if (b.id) e.id = b.id;
      e.onclick = () => { audioUnlock(); sfx('tap'); if (!b.keep) this.closeModal(); b.fn && b.fn(); }; wrap.appendChild(e);
    });
    box.appendChild(wrap); $('#ov').classList.remove('hide'); this.ovOpen = true; box.scrollTop = 0;
    return box;
  },
  closeModal() { $('#ov').classList.add('hide'); this.ovOpen = false; },
  replies(list) {
    const r = $('#replies'); r.innerHTML = '';
    r.classList.toggle('hide', !list || !list.length);
    (list || []).forEach(c => {
      const e = document.createElement('button'); e.className = 'chip'; e.textContent = c.t;
      e.onclick = () => { audioUnlock(); sfx('tap'); this.replies(null); chatMe(c.t); c.fn && setTimeout(c.fn, 500); };
      r.appendChild(e);
    });
    if (list && list.length) scrollChat();
  }
};

/* ---------- čats ---------- */
const CHATQ = []; let chatBusy = false;
function scrollChat() { const m = $('#msgs'); m.scrollTop = m.scrollHeight; }
function chatEl(cls, who, text, col) {
  const e = document.createElement('div'); e.className = 'm ' + cls;
  if (who) { const b = document.createElement('b'); b.textContent = who; b.style.color = col; e.appendChild(b); }
  e.appendChild(document.createTextNode(text)); $('#msgs').appendChild(e);
  while ($('#msgs').children.length > 60) $('#msgs').firstChild.remove();
  scrollChat(); return e;
}
/* chat(teksta ID) vai chat({spk, text}); delay sekundēs */
function chat(x, delay = 0, cb) { CHATQ.push({ x, delay, cb }); if (!chatBusy) chatNext(); }
function chatNext() {
  const it = CHATQ.shift(); if (!it) { chatBusy = false; return; }
  chatBusy = true;
  const spk = typeof it.x === 'string' ? WHO(it.x) : it.x.spk;
  const text = typeof it.x === 'string' ? T(it.x) : it.x.text;
  const sp = SPK[spk] || SPK.nar;
  setTimeout(() => {
    if (spk === 'sys') { chatEl('sys', '', text); sfx('tap'); setTimeout(() => { it.cb && it.cb(); chatNext(); }, 250); return; }
    const ty = chatEl('typing', '', sp[0].split(' ')[0] + ' raksta…');
    const wait = ui.auto ? 10 : Math.min(1700, 500 + text.length * 18);
    setTimeout(() => { ty.remove(); chatEl('', sp[0], text, sp[1]); sfx('chat'); it.cb && it.cb(); chatNext(); }, wait);
  }, ui.auto ? 0 : it.delay * 1000);
}
function chatMe(text) { chatEl('me', '', text); }
function chatClear() { $('#msgs').innerHTML = ''; CHATQ.length = 0; }

/* ---------- augšējā josla ---------- */
$('#sndBtn').onclick = () => { audioUnlock(); S.sound = !S.sound; S.voice = S.sound; if (!S.sound) { stopLoops(); voice(null); } $('#sndBtn').textContent = S.sound ? '🔊' : '🔇'; save(); };
$('#menuBtn').onclick = () => { audioUnlock(); openMenu(); };
function openMenu() {
  const inDay = D && ORDER.includes(SC_ID);
  ui.modal(`<h2>Izvēlne</h2>
    <p>Temps: <b>${TEMPO[S.tempo].name}</b></p>
    <p style="color:#6b5e55;font-size:16px">${inDay ? 'Diena saglabājas automātiski. Vari turpināt vēlāk no tās pašas ainas sākuma.' : ''}</p>`,
    [{ t: 'Turpināt', cls: 'teal' },
    { t: 'Mainīt tempu', cls: 'alt', fn: () => tempoModal(() => { }) },
    { t: 'Uz sākumu', cls: 'alt', fn: () => go('title') }]);
}
function tempoModal(cb) {
  ui.modal(`<h2>Kādā tempā strādāsi?</h2><p>Var mainīt jebkurā brīdī izvēlnē ☰.</p>`,
    [{ t: '🌿 Mierīgi — vairāk laika visam', cls: 'choice', fn: () => { S.tempo = 'mierigi'; save(); cb(); } },
    { t: '🧵 Parasti', cls: 'choice', fn: () => { S.tempo = 'parasti'; save(); cb(); } },
    { t: '⚡ Sestdiena — ātri un jautri', cls: 'choice', fn: () => { S.tempo = 'sestdiena'; save(); cb(); } }]);
}
function nameModal(cb) {
  const box = ui.modal(`<h2>Sveika! 👋</h2><p>Kā tevi sauc? Kolēģes tevi tā uzrunās čatā.</p><input id="nameIn" maxlength="18" placeholder="Tavs vārds" autocomplete="off">`,
    [{ t: 'Gatavs ✔', cls: 'teal', id: 'nameOk', keep: true, fn: done }]);
  const inp = box.querySelector('#nameIn'); inp.value = S.name || '';
  setTimeout(() => { try { inp.focus(); } catch (e) { } }, 50);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') done(); });
  function done() { const v = inp.value.trim().replace(/[<>]/g, ''); S.name = v || 'Jaunā kolēģe'; save(); ui.closeModal(); cb(); }
}
