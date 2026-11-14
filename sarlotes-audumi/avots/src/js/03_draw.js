/* ================= zīmēšanas palīgi un kopīgā grafika ================= */
const FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
function rr(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function box(x, y, w, h, c, r = 0) { g.fillStyle = c; if (r) { rr(x, y, w, h, r); g.fill(); } else g.fillRect(x, y, w, h); }
function boxS(x, y, w, h, c, r, sc, lw = 2) { box(x, y, w, h, c, r); g.strokeStyle = sc; g.lineWidth = lw; if (r) { rr(x, y, w, h, r); g.stroke(); } else g.strokeRect(x, y, w, h); }
function circ(x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, Math.max(0, r), 0, 6.2832); g.fill(); }
function ring(x, y, r, c, lw = 2) { g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.stroke(); }
function ell(x, y, rx, ry, c, rot = 0) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, 6.2832); g.fill(); }
function ln(x1, y1, x2, y2, c, w = 2) { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
function poly(pts, c) { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); }
function txt(s, x, y, size = 20, c = '#2b2420', al = 'center', wt = 700, base = 'middle') { g.font = wt + ' ' + size + 'px ' + FONT; g.fillStyle = c; g.textAlign = al; g.textBaseline = base; g.fillText(s, x, y); }
function txtO(s, x, y, size = 22, c = '#fff', oc = '#2b2420', al = 'center', wt = 800) { g.font = wt + ' ' + size + 'px ' + FONT; g.textAlign = al; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size / 5; g.strokeStyle = oc; g.strokeText(s, x, y); g.fillStyle = c; g.fillText(s, x, y); }
function wrapTxt(s, x, y, maxW, size, lh, c = '#2b2420', al = 'center', wt = 700) {
  g.font = wt + ' ' + size + 'px ' + FONT; const words = String(s).split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  lines.forEach((l, i) => txt(l, x, y + i * lh, size, c, al, wt));
  return lines.length;
}
function lgrad(x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => gr.addColorStop(i / (stops.length - 1), s)); return gr; }
function shadow(x, y, rx, ry, a = .18) { ell(x, y, rx, ry, 'rgba(0,0,0,' + a + ')'); }
function star(x, y, r, c) { g.fillStyle = c; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); g.fill(); }
function heart(x, y, s, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x, y + s * .35); g.bezierCurveTo(x - s, y - s * .4, x - s * .45, y - s, x, y - s * .45); g.bezierCurveTo(x + s * .45, y - s, x + s, y - s * .4, x, y + s * .35); g.fill(); }
function arrow(x, y, dir, c = '#c2410c', s = 1) { g.save(); g.translate(x, y); g.rotate(dir); g.scale(s, s); poly([-14, -10, 6, -10, 6, -20, 22, 0, 6, 20, 6, 10, -14, 10], c); g.restore(); }
/* kešatmiņa smagajiem fona zīmējumiem */
const CACHE = {};
function cached(key, w, h, fn) {
  if (CACHE[key]) return CACHE[key];
  const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2;
  const old = g; g = c.getContext('2d'); g.scale(2, 2);
  try { fn(); } finally { g = old; }
  return CACHE[key] = c;
}
function blit(key, x, y, w, h, fn) { g.drawImage(cached(key, w, h, fn), x, y, w, h); }

/* ---------- rudens lapas ---------- */
const LEAFC = ['#e67e22', '#d35400', '#f1c40f', '#c0392b', '#b9770e', '#e59866'];
function leaf(x, y, s, rot, c) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = c; g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * .9, 0, 0, s); g.quadraticCurveTo(-s * .9, 0, 0, -s); g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -s); g.lineTo(0, s); g.stroke(); g.restore(); }
function leavesNew(n) { const a = []; for (let i = 0; i < n; i++) a.push({ x: fr() * W, y: fr() * H, s: 5 + fr() * 6, r: fr() * 6, vr: fr() * 2 - 1, c: LEAFC[i % LEAFC.length], ph: fr() * 6 }); return a; }
function leavesUpd(L, dt, wind = 30) { for (const l of L) { l.ph += dt * 2; l.x += (wind + Math.sin(l.ph) * 25) * dt; l.y += (40 + l.s * 3) * dt; l.r += l.vr * dt * 2; if (l.y > H + 10) { l.y = -10; l.x = fr() * W; } if (l.x > W + 10) l.x = -10; if (l.x < -10) l.x = W + 10; } }
function leavesDraw(L) { for (const l of L) leaf(l.x, l.y, l.s, l.r, l.c); }

/* ---------- koki, debesis ---------- */
function tree(x, y, s, k = 0) {
  box(x - 6 * s, y - 70 * s, 12 * s, 72 * s, '#5d4037');
  ln(x, y - 50 * s, x - 22 * s, y - 78 * s, '#5d4037', 5 * s); ln(x, y - 56 * s, x + 20 * s, y - 84 * s, '#5d4037', 5 * s);
  const cs = [LEAFC[k % 6], LEAFC[(k + 2) % 6], LEAFC[(k + 4) % 6]];
  [[0, -110, 42], [-30, -92, 30], [30, -92, 32], [-16, -128, 28], [18, -126, 30], [0, -86, 26]].forEach((b, i) => circ(x + b[0] * s, y + b[1] * s, b[2] * s, cs[i % 3]));
}
function skyMorning(y1 = 400) { box(0, 0, W, y1, lgrad(0, 0, 0, y1, ['#9ec5e8', '#f6d7b0', '#f4b183'])); }

/* ---------- spēlētāja (sānskats, skatās pa labi) ---------- */
function drawWoman(x, y, s, pose, ph, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const coat = o.coat || '#c8901e', skin = '#f1c7a5', hair = '#8a3b1c', jeans = '#33456a', shoe = '#3a2a22';
  let hipY = -46, lean = .08;
  if (pose === 'duck') { hipY = -28; lean = .75; }
  if (pose === 'bike') { hipY = -44; lean = .35; }
  if (pose === 'stumble') { lean = -.25; }
  shadow(0, 2, 22, 5, pose === 'jump' ? .08 : .18);
  const leg = (a1, a2, col) => {
    const kx = Math.sin(a1) * 22, ky = hipY + Math.cos(a1) * 22, fx = kx + Math.sin(a2) * 23, fy = ky + Math.cos(a2) * 23;
    g.strokeStyle = col; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(0, hipY); g.lineTo(kx, ky); g.lineTo(fx, fy); g.stroke(); ell(fx + 4, fy + 1, 8, 4, shoe);
  };
  const legs = i => {
    const p = ph + i * Math.PI;
    if (pose === 'run' || pose === 'stumble') { const a = Math.sin(p) * .85; leg(a, a - (Math.cos(p) < 0 ? 1.05 : .15), i ? '#2a3a5a' : jeans); }
    else if (pose === 'jump') leg(-.7 + i * .25, .5, i ? '#2a3a5a' : jeans);
    else if (pose === 'duck') leg(-1.25, .55, i ? '#2a3a5a' : jeans);
    else if (pose === 'bike') { leg(-1.0 + Math.sin(p) * .38, .2 + Math.cos(p) * .45, i ? '#2a3a5a' : jeans); }
    else leg(i ? .06 : -.06, 0, i ? '#2a3a5a' : jeans);
  };
  legs(1);
  g.save(); g.translate(0, hipY); g.rotate(lean);
  // aizmugurējā roka
  const sw = (pose === 'run' ? Math.sin(ph) * .7 : 0);
  if (!o.cup) ln(0, -30, Math.sin(-sw) * 20, -12, '#a8781a', 8);
  poly([-14, 12, 14, 12, 9, -34, -9, -34], coat);
  circ(4, -20, 1.6, '#6d4c11'); circ(4, -8, 1.6, '#6d4c11');
  // šalle
  const fl = Math.sin(TT * 9 + ph) * 4;
  ell(1, -34, 11, 5, '#0f8a80'); poly([-6, -34, -22, -30 + fl, -24, -24 + fl, -6, -28], '#0f8a80');
  // galva
  circ(3, -46, 11.5, skin);
  g.fillStyle = hair; g.beginPath(); g.arc(1, -48, 12.5, Math.PI * .95, Math.PI * 2.05); g.fill();
  circ(-9, -54, 6.5, hair);
  circ(9, -47, 1.6, '#2b2420'); g.strokeStyle = '#b5574b'; g.lineWidth = 1.4; g.beginPath(); g.arc(9, -42, 3, .2, 1.4); g.stroke();
  // priekšējā roka
  if (o.cup) {
    ln(2, -30, 14, -16, '#b88720', 8); ln(14, -16, 22, -22, skin, 6);
    if (o.cup > 0) { box(19, -34, 11, 14, '#fff', 2); box(18, -36, 13, 4, '#6d4c41', 2); box(19, -28, 11, 5, '#c8a27a'); }
  } else if (pose === 'bike') { ln(2, -30, 26, -22, '#b88720', 8); }
  else ln(2, -30, Math.sin(sw) * 20 + 4, -12, '#b88720', 8);
  g.restore();
  legs(0);
  g.restore();
}
function drawBike(x, y, s, ph, flat) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const wheel = (cx, f) => { ring(cx, -22, 22, '#2b2420', 4); ring(cx, -22, 3, '#888', 3); for (let i = 0; i < 6; i++) { const a = ph + i * 1.047; ln(cx, -22, cx + Math.cos(a) * 20, -22 + Math.sin(a) * 20, '#999', 1); } if (f) ell(cx, -2, 22, 4, '#2b2420'); };
  wheel(-34, false); wheel(34, flat);
  g.strokeStyle = '#0f766e'; g.lineWidth = 4; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-34, -22); g.lineTo(-6, -22); g.lineTo(20, -52); g.lineTo(-14, -52); g.lineTo(-6, -22); g.moveTo(-14, -52); g.lineTo(-34, -22); g.moveTo(20, -52); g.lineTo(34, -22); g.moveTo(20, -52); g.lineTo(24, -64); g.stroke();
  ln(18, -66, 30, -64, '#2b2420', 4); box(-22, -60, 18, 5, '#3a2a22', 2);
  const px = Math.cos(ph) * 9, py = Math.sin(ph) * 9; ln(-6 + px, -22 + py, -6 - px, -22 - py, '#555', 3);
  box(24, -60, 12, 9, '#a0522d', 2); // grozs
  g.restore();
}

/* ---------- klientes (priekšskats) ---------- */
const CUST_LOOK = {
  coats: ['#8e3b46', '#2f5d62', '#6b4f8a', '#b5651d', '#3d5a80', '#7a8450', '#a23e48', '#4a4e69', '#c08552', '#5b8e7d'],
  hairs: ['#d9d4cc', '#b8b0a6', '#5a3825', '#2b2b2b', '#a0522d', '#c9a227', '#8c8c8c', '#e8e2d6'],
  skins: ['#f1c7a5', '#e8b48f', '#f5d0b5', '#d9a07a'],
  styles: ['bun', 'short', 'bob', 'curly', 'short', 'bob']
};
function makeLook(male) {
  return { coat: pick(CUST_LOOK.coats), hair: pick(CUST_LOOK.hairs), skin: pick(CUST_LOOK.skins), style: male ? pick(['mshort', 'bald']) : pick(CUST_LOOK.styles), glasses: rnd() < .45, hat: !male && rnd() < .25 ? pick(['#2b2420', '#7b2d26', '#3d5a80']) : null, bag: !male && rnd() < .6 ? pick(['#5d4037', '#2b2420', '#8e2d2d', '#c08552']) : null, scarf: rnd() < .5 ? pick(['#e9c46a', '#e76f51', '#f4f1de', '#2a9d8f']) : null, male };
}
function drawCust(x, y, s, c, ph = 0, mood = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  shadow(0, 0, 30, 7);
  const step = Math.sin(ph) * 3;
  box(-15, -44, 11, 44 + step, c.male ? '#3b3b44' : '#4a3b35', 3); box(4, -44, 11, 44 - step, c.male ? '#3b3b44' : '#4a3b35', 3);
  ell(-10, 0 + step, 9, 4, '#2b2420'); ell(10, 0 - step, 9, 4, '#2b2420');
  if (c.bag) { ln(-24, -98, -32, -60, c.bag, 3); box(-42, -64, 20, 18, c.bag, 4); }
  rr(-27, -104, 54, 66, 14); g.fillStyle = c.coat; g.fill();
  box(-29, -100, 11, 46, c.coat, 6); box(18, -100, 11, 46, c.coat, 6);
  circ(-23, -52, 5.5, c.skin); circ(23, -52, 5.5, c.skin);
  ln(0, -100, 0, -40, 'rgba(0,0,0,.15)', 2); circ(4, -86, 2, 'rgba(0,0,0,.3)'); circ(4, -70, 2, 'rgba(0,0,0,.3)'); circ(4, -54, 2, 'rgba(0,0,0,.3)');
  if (c.scarf) { ell(0, -104, 18, 7, c.scarf); box(4, -104, 8, 26, c.scarf, 3); }
  box(-5, -112, 10, 9, c.skin);
  // galva
  const hy = -126;
  if (c.style === 'bob' || c.style === 'curly') ell(0, hy + 2, 22, 21, c.hair);
  circ(0, hy, 17, c.skin);
  g.fillStyle = c.hair;
  if (c.style === 'bun') { g.beginPath(); g.arc(0, hy - 2, 18, Math.PI * 1.03, Math.PI * 1.97); g.fill(); circ(0, hy - 21, 8, c.hair); }
  else if (c.style === 'short') { g.beginPath(); g.arc(0, hy - 2, 18.5, Math.PI * .95, Math.PI * 2.05); g.fill(); }
  else if (c.style === 'bob') { g.beginPath(); g.arc(0, hy - 3, 19, Math.PI, Math.PI * 2); g.fill(); }
  else if (c.style === 'curly') { for (let i = 0; i < 7; i++) circ(-17 + i * 5.6, hy - 14 + Math.abs(i - 3) * 2.4, 6.5, c.hair); }
  else if (c.style === 'mshort') { g.beginPath(); g.arc(0, hy - 3, 18, Math.PI * 1.05, Math.PI * 1.95); g.fill(); }
  else if (c.style === 'bald') { circ(-16, hy + 2, 5, c.hair); circ(16, hy + 2, 5, c.hair); }
  if (c.hat) { ell(0, hy - 15, 22, 7, c.hat); circ(0, hy - 19, 12, c.hat); }
  // seja
  circ(-6, hy, 2, '#2b2420'); circ(6, hy, 2, '#2b2420');
  if (c.glasses) { ring(-6, hy, 5.5, '#3b2f2a', 1.6); ring(6, hy, 5.5, '#3b2f2a', 1.6); ln(-.5, hy, .5, hy, '#3b2f2a', 1.6); }
  g.strokeStyle = '#8d4a3c'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath();
  if (mood >= 2) { g.arc(0, hy + 5, 6, .25, Math.PI - .25); circ(-11, hy + 6, 3, 'rgba(230,120,120,.35)'); circ(11, hy + 6, 3, 'rgba(230,120,120,.35)'); g.beginPath(); g.arc(0, hy + 5, 6, .25, Math.PI - .25); }
  else if (mood === 1) { g.moveTo(-4, hy + 9); g.lineTo(4, hy + 9); }
  else { g.arc(0, hy + 13, 5, Math.PI + .35, Math.PI * 2 - .35); }
  g.stroke();
  if (mood <= 0) { ln(-10, hy - 7, -3, hy - 5, '#3b2f2a', 2); ln(10, hy - 7, 3, hy - 5, '#3b2f2a', 2); }
  g.restore();
}

/* ---------- preces: audumi, dzija, piederumi ---------- */
const ITEMS = {
  f_leaves: { cat: 'aud', n: 'Kokvilna «Rudens lapas»', c: '#d4a017', p: 'leaves' },
  f_linen: { cat: 'aud', n: 'Lins, dabīgs', c: '#d9c9a6', p: 'weave' },
  f_fleece: { cat: 'aud', n: 'Flīss, rozā', c: '#f0a3bd', p: 'plain' },
  f_lining: { cat: 'aud', n: 'Oderes audums, zils', c: '#2f4f8f', p: 'shine' },
  f_stripe: { cat: 'aud', n: 'Trikotāža ar strīpām', c: '#f5f0e6', p: 'stripes', c2: '#1f3a5f' },
  f_velvet: { cat: 'aud', n: 'Velūrs, zaļš', c: '#2e6b4f', p: 'shine' },
  f_stars: { cat: 'aud', n: 'Kokvilna ar zvaigznītēm', c: '#22305a', p: 'stars' },
  f_flower: { cat: 'aud', n: 'Kokvilna ar puķītēm', c: '#f3e1e7', p: 'flowers' },
  y_mustard: { cat: 'dz', n: 'Merino, sinepju', c: '#c9961a' },
  y_teal: { cat: 'dz', n: 'Merino, tirkīza', c: '#1a9aa0' },
  y_grey: { cat: 'dz', n: 'Alpaka, pelēka', c: '#9aa0a6' },
  y_white: { cat: 'dz', n: 'Kokvilnas dzija, balta', c: '#f2eee6' },
  y_pink: { cat: 'dz', n: 'Mohēra, rozā', c: '#f2a7c3', fz: 1 },
  y_red: { cat: 'dz', n: 'Vilna, sarkana', c: '#c0392b' },
  y_navy: { cat: 'dz', n: 'Vilna, tumši zila', c: '#2c3e70' },
  y_green: { cat: 'dz', n: 'Kokvilna, zaļa', c: '#5a9a4a' },
  a_needles: { cat: 'pied', n: 'Adāmadatas Nr. 4', ic: 'needles' },
  a_hook: { cat: 'pied', n: 'Tamborēšanas āķis 3,5', ic: 'hook' },
  a_thread_w: { cat: 'pied', n: 'Šujamdiegs, balts', ic: 'spool', c: '#f2eee6' },
  a_thread_o: { cat: 'pied', n: 'Šujamdiegs, oranžs', ic: 'spool', c: '#e67e22' },
  a_zip: { cat: 'pied', n: 'Rāvējslēdzējs 20 cm', ic: 'zip' },
  a_buttons: { cat: 'pied', n: 'Koka pogas, 6 gab.', ic: 'buttons' },
  a_scissors: { cat: 'pied', n: 'Auduma šķēres', ic: 'scissors' },
  a_tape: { cat: 'pied', n: 'Mērlente', ic: 'tape' },
};
const CATS = [['aud', 'Audumi'], ['dz', 'Dzija'], ['pied', 'Piederumi']];
function pattern(x, y, w, h, p, c, c2) {
  box(x, y, w, h, c);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  if (p === 'stripes') { g.fillStyle = c2 || '#1f3a5f'; for (let i = y + 3; i < y + h; i += 11) g.fillRect(x, i, w, 4); }
  else if (p === 'stars') { for (let i = 0; i < 40; i++) star(x + (i * 37 % 97) / 97 * w, y + (i * 53 % 89) / 89 * h, 3.4, '#f5d76e'); }
  else if (p === 'flowers') { for (let i = 0; i < 30; i++) { const fx = x + (i * 41 % 97) / 97 * w, fy = y + (i * 29 % 83) / 83 * h; for (let k = 0; k < 5; k++) circ(fx + Math.cos(k * 1.256) * 3, fy + Math.sin(k * 1.256) * 3, 2.2, i % 2 ? '#e05d7a' : '#c2185b'); circ(fx, fy, 1.6, '#f4d03f'); } }
  else if (p === 'leaves') { for (let i = 0; i < 26; i++) leaf(x + (i * 43 % 97) / 97 * w, y + (i * 31 % 89) / 89 * h, 4.5, i, LEAFC[(i + 1) % 6]); }
  else if (p === 'weave') { g.strokeStyle = 'rgba(120,90,50,.18)'; g.lineWidth = 1; for (let i = 0; i < w + h; i += 5) { g.beginPath(); g.moveTo(x + i, y); g.lineTo(x + i - h, y + h); g.stroke(); } }
  else if (p === 'shine') { g.fillStyle = lgrad(x, y, x + w, y + h, ['rgba(255,255,255,0)', 'rgba(255,255,255,.28)', 'rgba(255,255,255,0)']); g.fillRect(x, y, w, h); }
  g.restore();
}
function yarnBall(x, y, r, c, fz) {
  if (fz) { g.strokeStyle = c; g.lineWidth = 1.2; for (let i = 0; i < 26; i++) { const a = i * .2417 * 6.28; ln(x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9, x + Math.cos(a) * r * 1.18, y + Math.sin(a) * r * 1.18, c, 1.2); } }
  circ(x, y, r, c);
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.clip();
  g.strokeStyle = 'rgba(0,0,0,.17)'; g.lineWidth = Math.max(1, r * .1);
  for (let k = -2; k <= 2; k++) { g.beginPath(); g.ellipse(x + k * r * .34, y, r * .28, r * 1.05, .55, 0, 6.283); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,.22)'; for (let k = -1; k <= 1; k++) { g.beginPath(); g.ellipse(x, y + k * r * .4, r * 1.05, r * .22, -.25, 0, 6.283); g.stroke(); }
  g.restore();
  circ(x - r * .35, y - r * .4, r * .18, 'rgba(255,255,255,.35)');
}
function fabricPiece(x, y, w, h, it) {
  g.save(); rr(x, y, w, h, 7); g.clip(); pattern(x, y, w, h, it.p, it.c, it.c2);
  g.fillStyle = 'rgba(0,0,0,.13)'; g.fillRect(x, y + h * .34, w, 3); g.fillRect(x, y + h * .67, w, 3);
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x, y + h * .34 + 3, w, 3); g.fillRect(x, y + h * .67 + 3, w, 3);
  g.restore(); g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1.5; rr(x, y, w, h, 7); g.stroke();
}
function accIcon(ic, x, y, s, c) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (ic === 'needles') { g.rotate(-.5); box(-3, -38, 6, 72, '#b0b7bf', 3); circ(0, -40, 6, '#c0392b'); g.rotate(.9); box(-3, -38, 6, 72, '#c9ced4', 3); circ(0, -40, 6, '#c0392b'); }
  else if (ic === 'hook') { g.rotate(-.6); box(-3, -36, 6, 66, '#d4af37', 3); box(-6, -6, 12, 34, '#1a9aa0', 5); g.strokeStyle = '#d4af37'; g.lineWidth = 5; g.beginPath(); g.arc(4, -36, 5, Math.PI, Math.PI * 2.3); g.stroke(); }
  else if (ic === 'spool') { box(-20, -32, 40, 9, '#c69c6d', 3); box(-20, 23, 40, 9, '#c69c6d', 3); box(-15, -24, 30, 48, c || '#fff', 3); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 1; for (let i = -20; i < 24; i += 4) { g.beginPath(); g.moveTo(-15, i); g.lineTo(15, i + 3); g.stroke(); } }
  else if (ic === 'zip') { box(-9, -36, 18, 72, '#2f4f8f', 3); for (let i = -32; i < 34; i += 6) { box(-4, i, 4, 3, '#d4af37'); box(0, i + 3, 4, 3, '#d4af37'); } box(-7, -10, 14, 18, '#c0c0c0', 3); box(-3, 6, 6, 14, '#a9a9a9', 2); }
  else if (ic === 'buttons') { [[-14, -12], [14, -12], [0, 14]].forEach(p => { circ(p[0], p[1], 13, '#b07a48'); ring(p[0], p[1], 10, '#8b5a2b', 1.5); [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(q => circ(p[0] + q[0], p[1] + q[1], 1.6, '#5d3a1a')); }); }
  else if (ic === 'scissors') { ring(-12, 18, 10, '#c0392b', 6); ring(12, 18, 10, '#c0392b', 6); g.save(); g.rotate(.2); poly([-3, 10, 3, 10, 2, -38, -1, -40], '#b0b7bf'); g.restore(); g.save(); g.rotate(-.2); poly([-3, 10, 3, 10, 1, -40, -2, -38], '#c9ced4'); g.restore(); circ(0, 6, 3, '#666'); }
  else if (ic === 'tape') { circ(0, 0, 26, '#f1c40f'); circ(0, 0, 10, '#d4ac0d'); box(18, -6, 26, 12, '#f7dc6f', 2); for (let i = 22; i < 44; i += 5) ln(i, -6, i, 0, '#7d6608', 1); txt('150', 0, 0, 10, '#7d6608'); }
  g.restore();
}
/* preces ikona izmērā s (aptuveni 90×90 pie s=1) */
function drawItem(id, x, y, s = 1) {
  const it = ITEMS[id]; if (!it) return;
  if (it.cat === 'aud') fabricPiece(x - 40 * s, y - 32 * s, 80 * s, 64 * s, it);
  else if (it.cat === 'dz') yarnBall(x, y, 30 * s, it.c, it.fz);
  else accIcon(it.ic, x, y, s * .95, it.c);
}

/* ---------- grīdas flīzes (kā veikalā) ---------- */
function tiles(x, y, w, h, sz = 50, c1 = '#d9a679', c2 = '#cf9a6c') {
  box(x, y, w, h, c1);
  for (let i = 0; i * sz < w; i++) for (let j = 0; j * sz < h; j++) if ((i + j) % 2) box(x + i * sz, y + j * sz, sz, sz, c2);
  g.strokeStyle = 'rgba(120,70,40,.25)'; g.lineWidth = 1.5;
  for (let i = 0; i <= w; i += sz) ln(x + i, y, x + i, y + h, 'rgba(120,70,40,.22)', 1.5);
  for (let j = 0; j <= h; j += sz) ln(x, y + j, x + w, y + j, 'rgba(120,70,40,.22)', 1.5);
}
/* koka plaukts */
function shelfFrame(x, y, w, h, rows) {
  box(x, y, w, h, '#e8c99a'); box(x, y, 7, h, '#c9a06a'); box(x + w - 7, y, 7, h, '#c9a06a');
  for (let i = 0; i <= rows; i++) box(x, y + i * (h - 6) / rows, w, 6, '#c9a06a');
}
