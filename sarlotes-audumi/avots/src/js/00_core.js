'use strict';
/* ================= Šarlotes audumi — kodols ================= */
const W = 600, H = 600;
const $ = s => document.querySelector(s);
const cv = $('#cv'); let g = cv.getContext('2d');
let SC = 1, DPR = 1, TIMESCALE = 1;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIO = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
const inR = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
const R = (x, y, w, h) => ({ x, y, w, h });
const eur = v => (Math.round(v * 100) / 100).toFixed(2).replace('.', ',') + ' €';
const m2 = v => (Math.round(v * 100) / 100).toString().replace('.', ',') + ' m';

/* ---------- nejaušība (dienas izaicinājums: viena diena visām) ---------- */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function seedFor(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
let rnd = mulberry32(1);
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = a => a[Math.floor(rnd() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fr = Math.random; // efektiem (neietekmē dienas sēklu)

/* ---------- saglabāšana ---------- */
const SAVE_KEY = 'sarlotes_audumi_v1';
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; } }
const S = Object.assign({ name: '', tempo: 'parasti', coins: 0, up: {}, days: 0, sound: true, voice: true, hist: [], best: 0, day: null, reached: {} }, loadSave());
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
const TEMPO = { mierigi: { k: 1.45, name: 'Mierīgi', hint: 15 }, parasti: { k: 1, name: 'Parasti', hint: 20 }, sestdiena: { k: .78, name: 'Sestdiena', hint: 26 } };
const TK = () => (TEMPO[S.tempo] || TEMPO.parasti).k;

/* ---------- dienas stāvoklis ---------- */
let D = null;
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function newDay(mode) {
  D = {
    mode, date: today(), n: S.days + 1, min: 8 * 60 + 40, coins: 0, scene: null, drink: null,
    coffee: 100, openAt: null, ordersDone: 0, ordersLate: 0, ordersTotal: 0, cust: 0, custHappy: 0, custAngry: 0,
    hearts: [], quizOk: 0, quizN: 0, cuts: [], dust: 0, cleanSum: 0, cleanN: 0, cash: 0, card: 0, float: 137,
    cashOk: null, morningOk: 0, chocoUsed: false, sc: {}
  };
  S.day = D; save();
}
function fmtMin(m) { m = Math.round(m); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
function setMin(m) { if (!D) return; D.min = m; $('#clock').textContent = '⏰ ' + fmtMin(m); }
function addMin(dm) { if (D) setMin(D.min + dm); }

/* ---------- teksti un balsis ---------- */
let LINES = {};
const SPK = {
  sniedze: ['Sniedze (vadītāja)', '#b45309'], agrita: ['Agrita', '#0f766e'], kitija: ['Kitija', '#7c3aed'], me: ['Tu', '#2563eb'],
  nar: ['', '#6b5e55'], sys: ['', '#6b5e55'], barista: ['Bārists Toms', '#92400e'], kl: ['Kliente', '#be185d'],
  klv: ['Klients', '#1d4ed8'], kurjers: ['Kurjers', '#ea580c'], apsargs: ['Apsardze', '#475569']
};
function T(id) { const l = LINES[id]; if (!l) { console.error('Trūkst teksta: ' + id); return id; } return l[1].replace(/\{name\}/g, S.name || 'kolēģe'); }
function WHO(id) { return LINES[id] ? LINES[id][0] : 'nar'; }
let VO = null;
function voice(id) {
  if (VO) { try { VO.pause(); } catch (e) { } VO = null; }
  if (!S.voice || !window.SA_VOICES || !SA_VOICES.includes(id)) return;
  try { VO = new Audio('voice/' + id + '.mp3'); VO.play().catch(() => { }); } catch (e) { }
}

/* ---------- ainas ---------- */
const SCENES = {}; let SC_ID = null, SCN = null;
const ORDER = ['call', 'morning', 'bike', 'cafe', 'run', 'keys', 'alarm', 'shutter', 'dark', 'prep', 'orders', 'locker', 'open', 'close'];
const SC_NAME = { call: 'Rīta zvans', morning: 'Rīta steiga', bike: 'Ar riteni', cafe: 'Kafejnīca', run: 'Skrējiens', keys: 'Atslēgas', alarm: 'Signalizācija', shutter: 'Rullo vārti', dark: 'Tumšais veikals', prep: 'Pirms atvēršanas', orders: 'Interneta pasūtījumi', locker: 'Pakomāts', open: 'Veikals atvērts', close: 'Slēgšana' };
function scene(id, def) { def.id = id; SCENES[id] = def; }
const fade = { a: 0, dir: 0, next: null };
function go(id, arg) { if (fade.dir === 1) return; fade.next = [id, arg]; fade.dir = 1; }
function enterNow(id, arg) {
  if (SCN && SCN.exit) SCN.exit();
  stopLoops(); voice(null); ui.reset(); FX.length = 0;
  SC_ID = id; SCN = SCENES[id];
  if (D && ORDER.includes(id)) { D.scene = id; S.day = D; S.reached[id] = 1; save(); }
  rnd = mulberry32(seedFor((D ? D.date : 'x') + '/' + id));
  idle = 0; hintIx = 0; SCN.t = 0;
  $('#topTitle').textContent = SC_NAME[id] ? (ORDER.indexOf(id) + 1) + '/14 · ' + SC_NAME[id] : 'Šarlotes audumi';
  SCN.enter && SCN.enter(arg);
}

/* ---------- padomi čatā, ja iestrēgst ---------- */
let idle = 0, hintIx = 0;
function progress() { idle = 0; }
function hintTick(dt) {
  if (!SCN || !SCN.hints || ui.busy() || fade.dir) return;
  idle += dt;
  const lim = (TEMPO[S.tempo] || TEMPO.parasti).hint;
  if (idle > lim && hintIx < SCN.hints.length) { chat(SCN.hints[hintIx++]); idle = 0; }
}

/* ---------- efekti ---------- */
const FX = [];
function burst(x, y, col, n = 12, sp = 160) { for (let i = 0; i < n; i++) { const a = fr() * 6.283, s = sp * (.4 + fr() * .8); FX.push({ k: 'p', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, l: .8, c: Array.isArray(col) ? col[i % col.length] : col, r: 3 + fr() * 3 }); } }
function floater(x, y, s, col = '#c2410c') { FX.push({ k: 'f', x, y, s, l: 1.3, c: col }); }
function updFx(dt) {
  for (let i = FX.length - 1; i >= 0; i--) {
    const f = FX[i]; f.l -= dt;
    if (f.k === 'p') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 420 * dt; } else f.y -= 40 * dt;
    if (f.l <= 0) FX.splice(i, 1);
  }
}
function drawFx() {
  for (const f of FX) {
    g.globalAlpha = clamp(f.l * 1.5, 0, 1);
    if (f.k === 'p') { g.fillStyle = f.c; g.beginPath(); g.arc(f.x, f.y, f.r, 0, 7); g.fill(); }
    else { txtO(f.s, f.x, f.y, 26, f.c, '#fff'); }
  }
  g.globalAlpha = 1;
}

/* ---------- kamoliņi ---------- */
function award(n, x = W / 2, y = H / 2) {
  n = Math.round(n); if (n <= 0) return;
  S.coins += n; if (D) { D.coins += n; D.sc[SC_ID] = (D.sc[SC_ID] || 0) + n; }
  floater(x, y, '+' + n + ' 🧶'); sfx('coin'); ui.coins(); save();
}

/* ---------- ievade ---------- */
let PD = false;
function lp(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; }
cv.addEventListener('pointerdown', e => {
  audioUnlock(); if (fade.dir || ui.ovOpen) return;
  if (ui.sayOpen && ui.sayCanTap) { ui.sayNext(); return; }
  try { cv.setPointerCapture(e.pointerId); } catch (er) { }
  PD = true; const [x, y] = lp(e); SCN && SCN.down && SCN.down(x, y);
});
cv.addEventListener('pointermove', e => { const [x, y] = lp(e); if (SCN && SCN.move) SCN.move(x, y, PD); if (SCN && SCN.hot) cv.style.cursor = SCN.hot(x, y) ? 'pointer' : 'default'; });
cv.addEventListener('pointerup', e => { if (!PD) return; PD = false; const [x, y] = lp(e); SCN && SCN.up && SCN.up(x, y); });
cv.addEventListener('pointercancel', () => { if (!PD) return; PD = false; SCN && SCN.up && SCN.up(-99, -99); });
addEventListener('keydown', e => {
  audioUnlock(); if (ui.ovOpen) return;
  if (ui.sayOpen && ui.sayCanTap && (e.key === 'Enter' || e.key === ' ')) { ui.sayNext(); e.preventDefault(); return; }
  if (SCN && SCN.key && SCN.key(e.key, true) === true) e.preventDefault();
});
addEventListener('keyup', e => { if (SCN && SCN.key) SCN.key(e.key, false); });

/* ---------- izkārtojums ---------- */
function layout() {
  const vw = innerWidth, vh = innerHeight, top = $('#top').offsetHeight || 48;
  const wide = vw > vh * 1.05 && vw >= 640;
  document.body.classList.toggle('wide', wide);
  let s;
  if (wide) s = Math.min(vh - top, vw - Math.max(320, vw * .32));
  else s = Math.min(vw, (vh - top) * .56);
  s = Math.max(200, Math.floor(s));
  const st = $('#stage'); st.style.width = s + 'px'; st.style.height = s + 'px';
  DPR = Math.min(2.5, window.devicePixelRatio || 1); SC = s / W;
  cv.width = Math.round(s * DPR); cv.height = Math.round(s * DPR);
}
addEventListener('resize', layout);

/* ---------- galvenais cikls ---------- */
let last = 0, TT = 0;
function frame(ts) {
  let dt = Math.min(.05, ((ts - last) / 1000) || 0); last = ts; dt *= TIMESCALE; TT += dt;
  try {
    if (SCN && fade.dir !== 1) { SCN.t += dt; SCN.update && SCN.update(dt); }
    updFx(dt); hintTick(dt);
    g.setTransform(DPR * SC, 0, 0, DPR * SC, 0, 0);
    g.clearRect(0, 0, W, H);
    if (SCN && SCN.draw) SCN.draw();
    drawFx();
    if (fade.dir === 1) { fade.a += dt * 3.2; if (fade.a >= 1) { fade.a = 1; const [id, arg] = fade.next; fade.dir = -1; enterNow(id, arg); } }
    else if (fade.dir === -1) { fade.a -= dt * 3.2; if (fade.a <= 0) { fade.a = 0; fade.dir = 0; } }
    if (fade.a > 0) { g.fillStyle = 'rgba(25,18,14,' + fade.a + ')'; g.fillRect(0, 0, W, H); }
  } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}
