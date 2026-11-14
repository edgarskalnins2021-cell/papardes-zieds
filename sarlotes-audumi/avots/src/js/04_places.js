/* ================= vietas: veikals, ēka, gaitenis, kafejnīca, guļamistaba, iela ================= */
const ZONES = [
  { id: 'aud', n: 'Audumi', s: ['Audumi'], r: R(8, 40, 132, 262) },
  { id: 'oder', n: 'Oderes audumi', s: ['Oderes', 'audumi'], r: R(144, 40, 88, 262) },
  { id: 'dz', n: 'Dzija', s: ['Dzija'], r: R(236, 40, 160, 262) },
  { id: 'ada', n: 'Adīšanai un tamborēšanai', s: ['Adīšana,', 'tamborēš.'], r: R(400, 40, 76, 262) },
  { id: 'sup', n: 'Šūšanas piederumi', s: ['Šūšanas', 'piederumi'], r: R(480, 40, 72, 262) },
];
const ZONE = id => ZONES.find(z => z.id === id);
function storeStatic() {
  // siena un griesti
  box(0, 0, W, 312, '#f3e6d3'); box(0, 0, W, 22, '#fbf5ec');
  for (let i = 0; i < 4; i++) { box(40 + i * 150, 6, 100, 9, '#ffffff', 4); box(40 + i * 150, 13, 100, 3, '#e3d6c3'); }
  // plaukti
  for (const z of ZONES) { const r = z.r; box(r.x - 2, r.y + 26, r.w + 4, r.h - 24, '#c9a06a'); }
  // audumi: salocīti krāvumi
  { const r = ZONE('aud').r; shelfFrame(r.x, r.y + 28, r.w, r.h - 28, 5); const cols = ['#c0392b', '#2e86c1', '#f5cba7', '#27ae60', '#8e44ad', '#f4d03f', '#e67e22', '#34495e', '#e8daef', '#a3e4d7', '#d35400', '#5d6d7e'];
    for (let row = 0; row < 5; row++) for (let k = 0; k < 4; k++) { const x = r.x + 10 + k * 30, y = r.y + 34 + row * 46; for (let l = 0; l < 4; l++) box(x, y + 8 + l * 8, 26, 7, cols[(row * 4 + k * 3 + l) % cols.length], 2); } }
  // oderes audumi
  { const r = ZONE('oder').r; shelfFrame(r.x, r.y + 28, r.w, r.h - 28, 5); const cols = ['#1f3a5f', '#7f8c8d', '#d5c4a1', '#2b2420', '#7b241c', '#abb2b9', '#5b2c6f', '#e5e7e9'];
    for (let row = 0; row < 5; row++) for (let k = 0; k < 2; k++) { const x = r.x + 10 + k * 36, y = r.y + 34 + row * 46; for (let l = 0; l < 4; l++) { box(x, y + 8 + l * 8, 32, 7, cols[(row * 2 + k + l) % cols.length], 2); box(x + 2, y + 9 + l * 8, 28, 2, 'rgba(255,255,255,.25)'); } } }
  // dzijas siena
  { const r = ZONE('dz').r; shelfFrame(r.x, r.y + 28, r.w, r.h - 28, 5); const cols = ['#1a9aa0', '#f2a7c3', '#c9961a', '#9aa0a6', '#f2eee6', '#c0392b', '#2c3e70', '#5a9a4a', '#e67e22', '#8e44ad', '#d98880', '#76d7c4', '#5d4037', '#f7dc6f'];
    for (let row = 0; row < 5; row++) for (let k = 0; k < 5; k++) { const x = r.x + 20 + k * 30, y = r.y + 58 + row * 46; const c = cols[(row * 5 + k * 2) % cols.length]; yarnBall(x - 6, y, 10, c); yarnBall(x + 6, y + 2, 10, c); yarnBall(x, y - 9, 10, c); } }
  // adīšana un tamborēšana: burkas ar adatām un āķiem
  { const r = ZONE('ada').r; shelfFrame(r.x, r.y + 28, r.w, r.h - 28, 5);
    for (let row = 0; row < 5; row++) { const y = r.y + 40 + row * 46; for (let k = 0; k < 2; k++) { const x = r.x + 10 + k * 32; box(x, y + 14, 24, 24, 'rgba(200,230,240,.6)', 4); for (let n = 0; n < 5; n++) ln(x + 4 + n * 4, y + 34, x + 2 + n * 5, y + 2 + (n % 2) * 4, n % 2 ? '#d4af37' : '#b0b7bf', 2.5); circ(x + 4, y + 2, 2.5, '#c0392b'); circ(x + 14, y + 4, 2.5, '#1a9aa0'); } } }
  // šūšanas piederumi: perforēts dēlis
  { const r = ZONE('sup').r; box(r.x, r.y + 28, r.w, r.h - 28, '#fdfdfb'); g.fillStyle = '#d5d8dc'; for (let x = r.x + 6; x < r.x + r.w; x += 9) for (let y = r.y + 34; y < r.y + r.h; y += 9) g.fillRect(x, y, 2, 2);
    for (let row = 0; row < 5; row++) for (let k = 0; k < 3; k++) { const x = r.x + 6 + k * 22, y = r.y + 40 + row * 50; const c = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'][(row + k) % 5]; box(x, y, 18, 30, '#fff', 2); g.strokeStyle = '#bbb'; g.lineWidth = 1; g.strokeRect(x, y, 18, 30); if (row % 2) { box(x + 7, y + 6, 4, 20, c, 2); } else { circ(x + 6, y + 12, 3, c); circ(x + 12, y + 12, 3, c); circ(x + 9, y + 21, 3, c); } } }
  // zīmes
  for (const z of ZONES) {
    const r = z.r; boxS(r.x + 4, r.y, r.w - 8, z.s.length > 1 ? 36 : 26, '#8d5a2b', 6, '#5d3a1a', 2);
    z.s.forEach((s, i) => txt(s, r.x + r.w / 2, r.y + 13 + i * 15 - (z.s.length > 1 ? 0 : 0), z.s.length > 1 ? 12.5 : 15, '#fff8ec', 'center', 800));
  }
  // durvis labajā pusē
  box(556, 150, 44, 290, '#d9cdb9'); box(560, 196, 40, 236, '#5d6d7e'); box(565, 204, 30, 140, '#a9cce3'); box(565, 204, 30, 140, 'rgba(255,255,255,.25)');
  box(566, 300, 6, 30, '#2b2420', 2); circ(578, 186, 7, '#d4af37'); ln(578, 150, 578, 179, '#7f8c8d', 2);
  // grīda
  tiles(0, 312, W, 288, 48);
  box(0, 312, W, 6, 'rgba(0,0,0,.08)');
}
function storeFront() {
  // griešanas galds
  box(18, 404, 8, 66, '#bfc4c9'); box(170, 404, 8, 66, '#bfc4c9');
  box(10, 388, 176, 22, '#f8f9f9', 4); box(10, 404, 176, 6, '#d5d8dc');
  for (let i = 0; i < 17; i++) ln(16 + i * 10, 388, 16 + i * 10, 388 + (i % 5 ? 4 : 8), '#7f8c8d', 1);
  box(30, 372, 110, 20, '#d4a017', 8); ell(140, 382, 7, 10, '#b7950b');
  // kases galds
  box(196, 440, 212, 124, '#fbfcfc', 6); box(196, 440, 212, 14, '#e5e8e8', 6);
  box(206, 470, 92, 40, '#f2f3f4', 4); box(306, 470, 92, 40, '#f2f3f4', 4); box(206, 516, 192, 40, '#f2f3f4', 4);
  [[252, 490], [352, 490], [302, 536]].forEach(p => box(p[0] - 12, p[1] - 3, 24, 6, '#aab7b8', 3));
  // kase uz galda
  box(318, 404, 70, 38, '#2c3e50', 4); box(324, 410, 58, 22, '#58d68d', 3); txt('LABDIEN', 353, 421, 11, '#145a32', 'center', 800);
  box(300, 432, 104, 10, '#566573', 3);
  box(272, 420, 24, 22, '#2b2420', 4); box(275, 423, 18, 9, '#85c1e9', 2); // karšu terminālis
  // pelēkā kaste
  box(442, 486, 92, 70, '#95a5a6', 6); box(442, 486, 92, 12, '#7f8c8d', 6); box(462, 512, 52, 22, '#ecf0f1', 3); txt('PAKAS', 488, 523, 12, '#566573', 'center', 800);
  // putekļu sūcējs
  ell(46, 572, 30, 16, '#c0392b'); box(22, 556, 48, 20, '#e74c3c', 10); g.strokeStyle = '#555'; g.lineWidth = 4; g.beginPath(); g.moveTo(66, 562); g.quadraticCurveTo(96, 520, 84, 470); g.stroke(); ln(84, 470, 92, 420, '#7f8c8d', 4);
}
function drawStore(o = {}) {
  blit('store', 0, 0, W, H, storeStatic);
  // uzlabojumi uz sienas
  const up = S.up || {};
  if (up.garland) { for (let i = 0; i < 18; i++) poly([10 + i * 30, 26, 40 + i * 30, 26, 25 + i * 30, 42 + (i % 2) * 3], ['#e74c3c', '#f1c40f', '#1a9aa0', '#8e44ad'][i % 4]); ln(10, 26, 552, 26, '#7f8c8d', 1.5); }
  if (up.lights) { for (let i = 0; i < 22; i++) { const on = Math.sin(TT * 3 + i) > -.3; circ(16 + i * 25, 36 + Math.sin(i) * 2, 3.5, on ? ['#ffe082', '#ffab91', '#80deea'][i % 3] : '#9e9e9e'); } }
  if (up.poster) { box(560, 40, 36, 98, '#fdebd0', 4); g.save(); g.translate(578, 89); g.rotate(-Math.PI / 2); txt('Rudens', -10, -6, 12, '#a04000', 'center', 800); txt('= adīšana', 0, 8, 10, '#a04000', 'center', 700); g.restore(); yarnBall(578, 124, 8, '#e67e22'); }
  if (up.coffee) { box(494, 340, 58, 8, '#8d6e63', 2); box(500, 348, 6, 50, '#6d4c41'); box(540, 348, 6, 50, '#6d4c41'); box(504, 300, 34, 40, '#424949', 5); box(510, 306, 22, 10, '#85c1e9', 2); box(514, 326, 14, 12, '#fff', 2); for (let i = 0; i < 3; i++) { const yy = 296 - ((TT * 18 + i * 9) % 26); ln(518 + i * 4, yy, 520 + i * 4 + Math.sin(TT * 3 + i) * 3, yy - 7, 'rgba(255,255,255,.7)', 2); } txt('Kafija 🙂', 523, 290 - 0, 11, '#5d4037', 'center', 800); }
  if (o.under) o.under();
  blitFront();
  if (up.flowers) { box(206, 414, 18, 28, '#5dade2', 5); ln(212, 414, 206, 396, '#27ae60', 2); ln(216, 414, 220, 392, '#27ae60', 2); ln(214, 414, 214, 388, '#27ae60', 2); circ(206, 394, 7, '#e74c3c'); circ(220, 390, 7, '#f39c12'); circ(214, 384, 7, '#f1948a'); }
  if (up.candy) { ell(246, 436, 20, 7, '#d6eaf8'); ['#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22'].forEach((c, i) => circ(232 + i * 7, 432 - (i % 2) * 3, 4, c)); }
  if (up.choco) { box(148, 372, 32, 16, '#6e2c00', 3); box(162, 372, 4, 16, '#d4ac0d'); box(148, 378, 32, 4, '#d4ac0d'); heart(164, 370, 6, '#c0392b'); }
}
function blitFront() { blit('storeFront', 0, 0, W, H, storeFront); }
function dustDraw(d) {
  if (d < 4) return;
  const n = Math.floor(d * .9);
  for (let i = 0; i < n; i++) {
    const x = (i * 157 % 590) + 5, y = 330 + (i * 97 % 260);
    g.strokeStyle = i % 3 ? 'rgba(120,110,100,.55)' : ['rgba(231,76,60,.6)', 'rgba(26,154,160,.6)', 'rgba(201,150,26,.6)'][i % 3 === 0 ? (i / 3) % 3 | 0 : 0];
    g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y - 5, x + 12, y + (i % 4) - 2); g.stroke();
    if (i % 2) circ(x + 4, y + 3, 2.5, 'rgba(150,140,130,.5)');
  }
  if (d > 40) { g.fillStyle = 'rgba(160,150,140,' + ((d - 40) / 300) + ')'; g.fillRect(0, 312, W, 288); }
}

/* ---------- ēka no ārpuses (atslēgu aina) ---------- */
function stoneWall(x, y, w, h, seed) {
  box(x, y, w, h, '#d8cfc1');
  const rr2 = mulberry32(seed);
  const cols = ['#b9a68c', '#a39079', '#c8b79e', '#8f8172', '#bfb3a3', '#9c8a73', '#d1c2a8', '#a79b8b'];
  for (let j = 0; j < h; j += 26) for (let i = -(j / 26 % 2) * 20; i < w; i += 40) {
    const sw = 30 + rr2() * 16, sh = 18 + rr2() * 8;
    ell(x + i + sw / 2, y + j + 13, sw / 2, sh / 2, cols[Math.floor(rr2() * cols.length)], (rr2() - .5) * .3);
    ell(x + i + sw / 2 - 4, y + j + 10, sw / 4, sh / 5, 'rgba(255,255,255,.12)');
  }
}
function buildingStatic() {
  box(0, 0, W, 90, lgrad(0, 0, 0, 90, ['#a9cce3', '#f8d9b0']));
  box(0, 60, W, 70, '#4d5656'); for (let i = 0; i < 6; i++) { box(20 + i * 100, 70, 80, 50, '#85929e', 3); box(24 + i * 100, 74, 72, 42, 'rgba(255,255,255,.2)', 2); }
  stoneWall(0, 130, W, 345, 7);
  box(0, 128, W, 6, '#3d4545');
  // portāls
  box(204, 150, 192, 330, '#3f4a4a'); box(222, 172, 156, 300, '#2c3434');
  box(230, 180, 68, 286, '#a9cce3'); box(302, 180, 68, 286, '#a9cce3');
  box(230, 180, 68, 286, 'rgba(255,255,255,.18)'); box(302, 180, 68, 286, 'rgba(255,255,255,.12)');
  box(286, 300, 6, 60, '#d5d8dc', 2); box(308, 300, 6, 60, '#d5d8dc', 2);
  // zīme
  boxS(46, 190, 140, 70, '#fffaf2', 8, '#8d5a2b', 3); txt('Šarlotes', 116, 212, 19, '#8d3b1c', 'center', 800); txt('audumi', 116, 236, 19, '#8d3b1c', 'center', 800); yarnBall(64, 246, 7, '#1a9aa0');
  // pulkstenis virs durvīm
  circ(300, 108, 24, '#fdfefe'); ring(300, 108, 24, '#2b2420', 3);
  // bruģis
  box(0, 475, W, 125, '#b3a89a');
  for (let j = 475; j < 600; j += 18) for (let i = ((j - 475) / 18 % 2) * 14; i < W; i += 28) boxS(i, j, 26, 16, '#bdb2a4', 2, 'rgba(90,80,70,.35)', 1);
}
function drawBuilding() {
  blit('building', 0, 0, W, H, buildingStatic);
  // pulksteņa rādītāji 9:35
  const mm = D ? D.min % 60 : 35, hh = D ? (D.min / 60) % 12 : 9.5;
  const am = mm / 60 * 6.283 - Math.PI / 2, ah = hh / 12 * 6.283 - Math.PI / 2;
  ln(300, 108, 300 + Math.cos(ah) * 12, 108 + Math.sin(ah) * 12, '#2b2420', 3); ln(300, 108, 300 + Math.cos(am) * 18, 108 + Math.sin(am) * 18, '#2b2420', 2);
}

/* ---------- tirdzniecības centra gaitenis (rullo vārti) ---------- */
function corridorStatic() {
  box(0, 0, W, 470, '#e9dfcf'); box(0, 0, W, 40, '#f6f1e8');
  for (let i = 0; i < 3; i++) { box(60 + i * 200, 12, 110, 10, '#fff', 4); }
  box(0, 470, W, 130, '#c8c3bb'); for (let i = 0; i < W; i += 60) ln(i, 470, i - 40, 600, 'rgba(0,0,0,.08)', 2); ln(0, 520, W, 520, 'rgba(0,0,0,.08)', 2);
  box(40, 88, 520, 56, '#8d5a2b', 8); box(46, 94, 508, 44, '#a0693a', 6); txt('Šarlotes audumi', 300, 117, 30, '#fff8ec', 'center', 800); yarnBall(78, 116, 12, '#c9961a'); yarnBall(522, 116, 12, '#1a9aa0');
  box(40, 150, 20, 330, '#bdb3a3'); box(540, 150, 20, 330, '#bdb3a3');
}
function drawCorridor(open, dark = true) {
  blit('corridor', 0, 0, W, H, corridorStatic);
  // iekšpuse
  box(60, 150, 480, 330, dark ? '#16110e' : '#f3e6d3');
  if (dark) { for (let i = 0; i < 5; i++) box(90 + i * 92, 200, 60, 260, 'rgba(255,255,255,.035)', 4); }
  // vārti
  const top = 150, bot = 480, hgt = (bot - top) * (1 - open);
  if (hgt > 2) {
    g.save(); g.beginPath(); g.rect(60, top, 480, hgt); g.clip();
    box(60, top, 480, hgt, 'rgba(160,165,170,.25)');
    g.strokeStyle = '#9aa1a8'; g.lineWidth = 3;
    const off = hgt % 26;
    for (let i = -400; i < 900; i += 26) { g.beginPath(); g.moveTo(60 + i, top + hgt + 40 - off); g.lineTo(60 + i + 400, top - 400 + hgt - off); g.stroke(); g.beginPath(); g.moveTo(60 + i, top - 400 + hgt - off); g.lineTo(60 + i + 400, top + hgt + 40 - off); g.stroke(); }
    for (let y = top + hgt - 4; y > top; y -= 52) box(60, y - 3, 480, 6, '#b3b9bf');
    g.restore();
    box(60, top + hgt - 12, 480, 12, '#7f8c8d'); box(280, top + hgt - 10, 40, 8, '#566573', 3);
  }
  box(56, 140, 488, 22 + open * 10, '#6c7a89', 10); box(56, 146, 488, 6, 'rgba(255,255,255,.25)');
}

/* ---------- kafejnīca ---------- */
function cafeStatic() {
  box(0, 0, W, 360, '#efe2cf'); box(0, 0, W, 30, '#5d4037');
  // logs ar rudeni
  box(30, 60, 200, 170, '#8d6e63'); box(40, 70, 180, 150, lgrad(0, 70, 0, 220, ['#a9cce3', '#f8c471']));
  tree(90, 220, .6, 1); tree(170, 225, .55, 3); ln(130, 70, 130, 220, '#8d6e63', 6); ln(40, 145, 220, 145, '#8d6e63', 6);
  // tāfele ar ēdienkarti
  boxS(320, 50, 250, 170, '#2d3a32', 6, '#8d6e63', 8); txt('KAFIJA', 445, 76, 24, '#fdfefe', 'center', 800);
  ['Melnā kafija   2,20', 'Kapučīno        2,90', 'Latte ar karameli 3,40', 'Kakao             2,80'].forEach((s, i) => txt(s, 340, 108 + i * 28, 16, '#f4f6f6', 'left', 600));
  // lete
  box(0, 360, W, 240, '#a1887f'); box(0, 350, W, 24, '#6d4c41'); for (let i = 0; i < W; i += 50) box(i, 380, 4, 220, 'rgba(0,0,0,.08)');
  // kafijas aparāts
  box(380, 250, 150, 100, '#bdc3c7', 8); box(392, 262, 126, 30, '#85929e', 4); box(420, 300, 20, 24, '#566573'); box(470, 300, 20, 24, '#566573'); circ(504, 276, 7, '#e74c3c');
  // kūkas
  box(40, 300, 140, 50, 'rgba(255,255,255,.5)', 6); [[70, 330, '#d35400'], [110, 330, '#f5cba7'], [150, 330, '#922b21']].forEach(p => { ell(p[0], p[1], 16, 9, p[2]); ell(p[0], p[1] - 6, 14, 6, '#fdebd0'); });
}
function drawBarista(x, y, talk) {
  // vīrietis ar priekšautu un bārdu, priekšskats
  box(x - 32, y - 120, 64, 120, '#34495e', 14); box(x - 22, y - 110, 44, 110, '#d35400', 6); ln(x - 18, y - 110, x - 26, y - 128, '#d35400', 3); ln(x + 18, y - 110, x + 26, y - 128, '#d35400', 3);
  box(x - 6, y - 138, 12, 12, '#f1c7a5'); circ(x, y - 158, 22, '#f1c7a5');
  g.fillStyle = '#5d4037'; g.beginPath(); g.arc(x, y - 162, 23, Math.PI, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(x, y - 150, 20, .1, Math.PI - .1); g.fill();
  circ(x - 8, y - 160, 2.5, '#2b2420'); circ(x + 8, y - 160, 2.5, '#2b2420');
  box(x - 8, y - 148 + (talk ? Math.abs(Math.sin(TT * 12)) * 3 : 0), 16, 3, '#f1c7a5', 2);
}

/* ---------- guļamistaba ---------- */
function bedroomStatic() {
  box(0, 0, W, H, '#3d4f6b'); box(0, 380, W, 220, '#6d5847');
  for (let i = 0; i < W; i += 60) ln(i, 380, i, 600, 'rgba(0,0,0,.12)', 2);
  // logs ar ausmu
  box(330, 60, 210, 200, '#2c3e50'); box(340, 70, 190, 180, lgrad(0, 70, 0, 250, ['#5d6d7e', '#f5b041', '#f8c471']));
  circ(470, 230, 26, '#fdebd0'); ln(435, 70, 435, 250, '#2c3e50', 6); ln(340, 160, 530, 160, '#2c3e50', 6);
  box(320, 50, 30, 230, '#a93226', 4); box(522, 50, 30, 230, '#a93226', 4);
  // gulta
  box(20, 330, 290, 150, '#8d6e63', 8); box(20, 300, 30, 180, '#6d4c41', 6);
  box(54, 316, 70, 40, '#ecf0f1', 12);
  // naktsgaldiņš
  box(318, 380, 90, 100, '#a1887f', 6); box(318, 380, 90, 12, '#8d6e63', 6); box(345, 420, 36, 6, '#5d4037', 3);
}
function drawBedroom() { blit('bedroom', 0, 0, W, H, bedroomStatic); }

/* ---------- iela (ritenis, skrējiens) ar paralaksi ---------- */
function streetFar() {
  box(0, 0, 1200, 300, lgrad(0, 0, 0, 300, ['#8fb8de', '#f6d7b0', '#f5b583']));
  const hs = [[0, 150, 120, '#b7a99a'], [130, 120, 100, '#a3907c'], [240, 160, 140, '#c4b6a6'], [390, 130, 90, '#9c8a77'], [490, 170, 150, '#b9a796'], [650, 120, 110, '#a8957f'], [770, 150, 130, '#c0b2a2'], [910, 140, 120, '#a1907d'], [1040, 160, 160, '#b6a593']];
  for (const h of hs) { box(h[0], 300 - h[1], h[2], h[1], h[3]); poly([h[0] - 6, 300 - h[1], h[0] + h[2] / 2, 300 - h[1] - 34, h[0] + h[2] + 6, 300 - h[1]], '#8e5b47'); for (let i = h[0] + 14; i < h[0] + h[2] - 20; i += 34) for (let j = 300 - h[1] + 20; j < 280; j += 40) box(i, j, 18, 22, '#f8e5b9'); }
}
function streetNear() {
  for (let i = 0; i < 4; i++) tree(80 + i * 300, 430, 1.1, i);
  box(0, 430, 1200, 40, '#b7aea2'); for (let i = 0; i < 1200; i += 40) ln(i, 430, i, 470, 'rgba(0,0,0,.1)', 2);
  box(0, 470, 1200, 130, '#6e6a66'); for (let i = 20; i < 1200; i += 120) box(i, 530, 60, 6, '#e8e3d9');
}
function drawStreet(off, farK = .2) {
  const f = cached('streetFar', 1200, 300, streetFar), n = cached('streetNear', 1200, 600, streetNear);
  const fx = -((off * farK) % 1200); g.drawImage(f, fx, 0, 1200, 300); g.drawImage(f, fx + 1200, 0, 1200, 300);
  circ(470, 120 - Math.min(40, off * .004), 34, 'rgba(255,236,179,.9)');
  const nx = -(off % 1200); g.drawImage(n, nx, 0, 1200, 600); g.drawImage(n, nx + 1200, 0, 1200, 600);
}
