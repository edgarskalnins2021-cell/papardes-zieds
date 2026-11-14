/* ================= sākuma ekrāns ================= */
scene('title', {
  enter() {
    this.L = leavesNew(26);
    $('#clock').textContent = '⏰ --:--';
    ui.task('Visi ir saslimuši, un veikals šodien ir tavs!', 'Izturi līdz 14:00. Spēle saglabājas pati.');
    const b = [];
    const cont = S.day && S.day.date === today() && S.day.scene && S.day.scene !== 'close' && SCENES[S.day.scene];
    if (cont) b.push({ t: '▶ Turpināt: ' + SC_NAME[S.day.scene], cls: 'teal', fn: () => { D = S.day; go(D.scene); } });
    b.push({ t: cont ? 'Sākt dienu no jauna' : '▶ Sākt dienu', cls: cont ? 'alt' : '', id: 'startBtn', fn: () => startDay('full') });
    if (S.days > 0 || S.reached.open) b.push({ t: '🏪 Tikai veikala darbs (10–14)', cls: 'alt', fn: () => startDay('shop') });
    b.push({ t: '🧶 Uzlabojumi (' + S.coins + ')', cls: 'alt', fn: () => shopModal() });
    if (Object.keys(S.reached).length > 1) b.push({ t: '🎬 Pārspēlēt ainu', cls: 'alt', fn: () => scenesModal() });
    ui.btns(b);
    if (!$('#msgs').children.length) chat({ spk: 'sys', text: 'Šeit būs komandas čats. Kolēģes rakstīs padomus, ja iestrēgsi.' });
  },
  update(dt) { leavesUpd(this.L, dt, 25); },
  draw() {
    drawBuilding();
    box(0, 0, W, 170, 'rgba(40,28,20,.35)');
    txtO('Šarlotes audumi', W / 2, 60, 52, '#fff8ec', '#5d2e14');
    txtO('Viena diena veikalā', W / 2, 112, 26, '#ffe0b2', '#5d2e14');
    leavesDraw(this.L);
    if (S.days > 0) txtO('Nostrādātas dienas: ' + S.days, W / 2, 575, 20, '#fff', '#3b2f2a');
  }
});
function startDay(mode) {
  const begin = () => {
    newDay(mode); chatClear();
    if (mode === 'shop') { D.min = 600; D.openAt = 600; go('open'); }
    else go('call');
  };
  if (!S.name) nameModal(() => tempoModal(begin)); else begin();
}

/* jebkuras sasniegtās ainas pārspēlēšana */
const SC_MIN = { call: 520, morning: 522, bike: 531, cafe: 543, run: 550, keys: 575, alarm: 577, shutter: 578, dark: 579, prep: 581, orders: 590, locker: 594, open: 600, close: 840 };
function scenesModal() {
  const list = ORDER.filter(id => S.reached[id] && id !== 'close');
  ui.modal('<h2>🎬 Pārspēlēt ainu</h2><p>Izvēlies ainu. Tā sāksies no jauna, un kamoliņus nopelnīsi arī šoreiz.</p>',
    list.map(id => ({ t: (ORDER.indexOf(id) + 1) + '. ' + SC_NAME[id], cls: 'choice', fn: () => {
      const go2 = () => { newDay('practice'); D.min = SC_MIN[id]; if (id === 'open') D.openAt = 600; chatClear(); go(id); };
      if (!S.name) nameModal(go2); else go2();
    } })).concat([{ t: 'Atpakaļ', cls: 'alt' }]));
}
