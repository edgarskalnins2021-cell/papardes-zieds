/* ================= skaņas (radītas pārlūkā, bez failiem) ================= */
let AC = null, MASTER = null, NOISE = null;
function audioUnlock() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = .55; MASTER.connect(AC.destination); } catch (e) { AC = null; }
}
function tone(f, d = .12, type = 'sine', v = .25, when = 0, slide = 0) {
  if (!AC || !S.sound) return;
  const t = AC.currentTime + when, o = AC.createOscillator(), gn = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
  gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(v, t + .01); gn.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(gn); gn.connect(MASTER); o.start(t); o.stop(t + d + .05);
}
function noiseBuf() {
  if (NOISE) return NOISE;
  const b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return NOISE = b;
}
function noise(d = .2, v = .2, f = 1000, q = 1, type = 'bandpass', when = 0) {
  if (!AC || !S.sound) return;
  const t = AC.currentTime + when, s = AC.createBufferSource(); s.buffer = noiseBuf();
  const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const gn = AC.createGain(); gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(.001, t + d);
  s.connect(fl); fl.connect(gn); gn.connect(MASTER); s.start(t, Math.random()); s.stop(t + d + .05);
}
const SFX = {
  tap: () => tone(700, .05, 'triangle', .12),
  ok: () => { tone(660, .1, 'triangle', .22); tone(990, .16, 'triangle', .22, .08); },
  bad: () => { tone(230, .16, 'square', .1); tone(170, .22, 'square', .09, .1); },
  ding: () => tone(1320, .3, 'sine', .18),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .28, 'triangle', .2, i * .09)),
  whoosh: () => noise(.35, .25, 700, .6),
  splash: () => { noise(.45, .35, 500, .5, 'lowpass'); noise(.3, .18, 2600, 1, 'bandpass', .05); },
  brush: () => noise(.07, .1, 3200, 2),
  click: () => tone(1800, .03, 'square', .1),
  beep: () => tone(1000, .12, 'square', .1),
  coin: () => { tone(1500, .07, 'triangle', .14); tone(2250, .12, 'triangle', .11, .05); },
  cash: () => { noise(.12, .22, 1500, 1); tone(1700, .3, 'triangle', .18, .1); tone(2600, .45, 'triangle', .13, .14); },
  paper: () => noise(.22, .14, 4200, .7, 'highpass'),
  print: () => { for (let i = 0; i < 7; i++) noise(.05, .12, 2100, 3, 'bandpass', i * .07); },
  klunk: () => { tone(130, .16, 'sine', .4, 0, -60); noise(.1, .2, 380, 1, 'lowpass'); },
  rattle: () => { for (let i = 0; i < 9; i++) noise(.04, .2, 1100 + Math.random() * 900, 4, 'bandpass', i * .045); },
  bell: () => { tone(1250, .5, 'sine', .12); tone(940, .6, 'sine', .12, .18); },
  step: () => noise(.05, .08, 300, 1, 'lowpass'),
  chat: () => { tone(880, .07, 'sine', .12); tone(1175, .1, 'sine', .12, .07); },
  sparkle: () => [2000, 2500, 3100].forEach((f, i) => tone(f, .12, 'sine', .07, i * .05)),
  flick: () => noise(.06, .3, 5200, 1, 'highpass'),
  jump: () => tone(380, .16, 'triangle', .16, 0, 420),
  duck: () => tone(500, .12, 'triangle', .12, 0, -250),
  pop: () => tone(480, .08, 'sine', .2, 0, 320),
  scissors: () => { noise(.06, .22, 5200, 3); noise(.06, .22, 4600, 3, 'bandpass', .13); },
  hiss: () => noise(1.1, .25, 5000, .7, 'highpass'),
  thud: () => { tone(90, .2, 'sine', .45, 0, -40); noise(.12, .25, 250, 1, 'lowpass'); },
  ow: () => { tone(520, .18, 'sawtooth', .07, 0, -260); },
  spit: () => noise(.18, .2, 1800, 1),
  key: () => { tone(2400, .05, 'square', .06); tone(2900, .05, 'square', .05, .06); noise(.08, .1, 3000, 4, 'bandpass', .1); },
  hum: () => { tone(110, .6, 'sawtooth', .04); },
  zip: () => noise(.3, .15, 3500, 2, 'bandpass'),
  stamp: () => { noise(.06, .3, 800, 1, 'lowpass'); tone(160, .1, 'sine', .25); },
};
function sfx(n) { try { SFX[n] && SFX[n](); } catch (e) { } }

/* ---------- cilpas: zvans, sirēna, putekļu sūcējs, liešana, skalošana ---------- */
const LOOPS = {};
const LOOPDEF = {
  ring: () => { const f = () => { for (let i = 0; i < 9; i++) { tone(1320, .05, 'square', .06, i * .1); tone(1660, .05, 'square', .06, i * .1 + .05); } }; f(); const id = setInterval(f, 1900); return { stop: () => clearInterval(id) }; },
  siren: () => {
    const o = AC.createOscillator(), gn = AC.createGain(), lfo = AC.createOscillator(), lg = AC.createGain();
    o.type = 'sawtooth'; o.frequency.value = 760; lfo.frequency.value = 1.6; lg.gain.value = 260;
    lfo.connect(lg); lg.connect(o.frequency); gn.gain.value = .05; o.connect(gn); gn.connect(MASTER); o.start(); lfo.start();
    return { stop: () => { try { o.stop(); lfo.stop(); } catch (e) { } } };
  },
  vac: () => {
    const s = AC.createBufferSource(); s.buffer = noiseBuf(); s.loop = true;
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 850;
    const gn = AC.createGain(); gn.gain.value = .1; const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 175;
    const og = AC.createGain(); og.gain.value = .025; s.connect(f); f.connect(gn); gn.connect(MASTER); o.connect(og); og.connect(MASTER); s.start(); o.start();
    return { stop: () => { try { s.stop(); o.stop(); } catch (e) { } } };
  },
  pour: () => {
    const s = AC.createBufferSource(); s.buffer = noiseBuf(); s.loop = true;
    const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = .9;
    const gn = AC.createGain(); gn.gain.value = .09; s.connect(f); f.connect(gn); gn.connect(MASTER); s.start();
    return { stop: () => { try { s.stop(); } catch (e) { } } };
  },
  gargle: () => {
    const s = AC.createBufferSource(); s.buffer = noiseBuf(); s.loop = true;
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520;
    const gn = AC.createGain(); gn.gain.value = .0; const lfo = AC.createOscillator(), lg = AC.createGain();
    lfo.frequency.value = 13; lg.gain.value = .16; lfo.connect(lg); lg.connect(gn.gain);
    s.connect(f); f.connect(gn); gn.connect(MASTER); s.start(); lfo.start();
    return { stop: () => { try { s.stop(); lfo.stop(); } catch (e) { } } };
  },
};
function loop(n, on) {
  if (!on) { if (LOOPS[n]) { LOOPS[n].stop(); delete LOOPS[n]; } return; }
  if (LOOPS[n] || !AC || !S.sound) return;
  try { LOOPS[n] = LOOPDEF[n](); } catch (e) { }
}
function stopLoops() { for (const k in LOOPS) loop(k, false); }
