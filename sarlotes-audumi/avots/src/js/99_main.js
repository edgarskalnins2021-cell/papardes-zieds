/* ================= starts ================= */
(function main() {
  layout(); ui.coins();
  $('#sndBtn').textContent = S.sound ? '🔊' : '🔇';
  $('#chatHead').onclick = () => scrollChat();
  enterNow('title');
  requestAnimationFrame(frame);
  // automātiskais tests var izmantot šo
  window.SA = {
    go: (id, arg) => enterNow(id, arg), get D() { return D; }, S, get scene() { return SC_ID; }, get scn() { return SCN; },
    cover: () => {
      const c = document.createElement('canvas'); c.width = 1200; c.height = 630; const old = g; g = c.getContext('2d');
      try {
        box(0, 0, 1200, 630, '#f7f0e6'); g.save(); g.scale(1.05, 1.05); drawStore({ under: () => { drawCust(300, 446, .92, { coat: '#8e3b46', hair: '#d9d4cc', skin: '#f1c7a5', style: 'bun', glasses: true, hat: null, bag: '#5d4037', scarf: '#e9c46a' }, 0, 2); drawCust(364, 446, .92, { coat: '#2f5d62', hair: '#a0522d', skin: '#e8b48f', style: 'bob', glasses: false, hat: '#7b2d26', bag: null, scarf: null }, 0, 2); } }); g.restore();
        g.fillStyle = lgrad(560, 0, 660, 0, ['rgba(247,240,230,0)', '#f7f0e6']); g.fillRect(560, 0, 100, 630); box(660, 0, 540, 630, '#f7f0e6');
        txt('Šarlotes', 900, 150, 92, '#8d3b1c', 'center', 800); txt('audumi', 900, 250, 92, '#8d3b1c', 'center', 800);
        txt('Viena diena veikalā', 900, 340, 40, '#2b2420', 'center', 700);
        txt('Visi ir saslimuši — izturi līdz 14:00!', 900, 400, 30, '#6b5e55', 'center', 600);
        [['#1a9aa0', 760], ['#c9961a', 840], ['#f2a7c3', 920], ['#c0392b', 1000], ['#5a9a4a', 1080]].forEach(([col, x]) => yarnBall(x - 40, 486, 30, col));
        box(700, 548, 400, 56, '#c2410c', 16); txt('▶ Spēlē telefonā vai datorā', 900, 577, 26, '#fff', 'center', 800);
      } finally { g = old; }
      return c.toDataURL('image/jpeg', .88);
    },
    auto: () => SCN && SCN.auto && SCN.auto(), speed: k => { TIMESCALE = k; }, ui,
    start: (mode = 'full') => { if (!S.name) S.name = 'Tests'; newDay(mode); if (mode === 'shop') { D.min = 600; D.openAt = 600; } chatClear(); enterNow(mode === 'shop' ? 'open' : 'call'); }
  };
})();
