/* ===================== DATA ===================== */
const bg = (p) => { if (p && p.catch) p.catch(() => {}); return p; };
const FIXES = [
  { t: 'One live flight truth', p: 'Ops, app, SMS, gates and bag drop share one live status. Everything stands on it.', pins: [0, 1], r: 'Step one: the truth. One status, everywhere, live.' },
  { t: 'Tell me early, tell me straight', p: 'An alert within 5 minutes: why, until when, what it means for me.', pins: [2], r: 'Then tell me. Why, and until when.' },
  { t: 'Rebook me before I ask', p: 'Auto-rebook onto the best next flight, one-tap alternatives. Only possible once status is live.', pins: [3], r: 'Now move me. Before the queue even forms.' },
  { t: 'My bag follows me', p: 'When I’m rebooked, my bag is rebooked too. Same step, automatically.', pins: [1, 4], r: 'Where I go, the bisht goes.' },
  { t: 'Make it right, no forms', p: 'Compensation worked out from the disruption data, paid automatically. One named owner.', pins: [5], r: 'Recovery goes last. It needs the other four.' },
];
const ENHANCEMENTS = [
  { id: 'A', ic: 'plane', t: 'Partner-airline seats', s: 'An earlier partner flight if it lands sooner', r: 'Earlier than my own airline? Yes, please.' },
  { id: 'B', ic: 'coffee', t: 'Lounge while you wait', s: 'Lounge + meal when we change your flight', r: 'Gahwa and dates, not a plastic chair.' },
  { id: 'C', ic: 'chat', t: 'WhatsApp updates', s: 'Flight, gate and bag status in my chat', r: 'WhatsApp is where my whole family lives.' },
  { id: 'D', ic: 'tag', t: 'Live bag tracker', s: 'See my bag move, scan by scan', r: 'I can watch the bisht? Ma sha Allah.' },
  { id: 'E', ic: 'heart', t: 'Big-day flag', s: 'Tell us why you’re flying. We’ll prioritise you.', r: 'They ask why I’m flying? … And they care?' },
  { id: 'F', ic: 'home', t: 'Bag collected from home', s: 'We pick up your bag at your door', r: 'My bag leaves before I do. Even better.' },
];
const ROOT = [
  { t: 'Ops knew. I didn’t.', p: 'Ops grounded the plane at 12:41. My app said ‘On time’ at 3:05.', pins: [0, 1], r: 'They knew at 12:41. They texted me at 4:58.' },
  { t: '“Delayed” isn’t an answer.', p: 'No reason, no real time, three rolling delays. Staff saw what I saw.', pins: [2], r: 'Delayed until when? Why?' },
  { t: 'Cancelled, then left to queue.', p: 'No auto-rebooking. One desk, 97 minutes in line, an app saying ‘contact us’.', pins: [3], r: '140 people. One desk.' },
  { t: 'My bag wasn’t rebooked with me.', p: 'I moved to SH 1057. My bag stayed on a cancelled flight’s cart.', pins: [1, 4], r: 'I flew. The bisht didn’t.' },
  { t: 'Nobody owned the recovery.', p: 'A paper form, a midnight survey, a SAR 150 voucher on day 9.', pins: [3, 4, 5], r: 'Nobody made it right.' },
];
const TL = [['mobile', 'Flight status', 'said “On time”'], ['tag', 'Bag drop', 'no warning'], ['gate', 'Gate 23', 'no new time'], ['desk', 'Rebooking', '52-min hold'], ['bag', 'Baggage', 'bag left behind'], ['clipboard', 'Claim', '30 working days']];
const NOTES = {
  0: 'Let Abu Fawzan introduce himself. Everyone here has flown for something that mattered. The flight wasn’t the product; the wedding was.',
  1: '12:41 witness and bag drop. At 12:41 our Ops room knew the aircraft was grounded. The customer feed still said “On time” because notification waits for a “final decision”. Reem at bag drop saw the same stale status.',
  2: 'The gate: rolling delays. Khalid isn’t a villain; he saw the same thin feed. Note the board still said 5:30 after the system cancelled the flight at 4:20. “Please wait for the announcement” is what our process sounds like out loud.',
  3: '160 passengers, one desk, an app that says “contact us”, a 52-minute hold. Every channel led to the same wall, and the bag never moved.',
  4: 'Nobody decided to make a father miss his son’s zaffa. A schedule-based feed, a “final decision” rule, agent-only rebooking, bags not tied to rebooking, claim-only compensation: each was reasonable on its own.',
  5: 'Five fixes in build order. Live truth comes first; everything else is built on it. The extras are what make a customer tell the wedding hall.',
  6: 'Same fault, same plane, same 4:46. Gate 23 is empty because everyone was moved at 12:46.',
  7: 'One Abu Fawzan costs a fare and a voucher. 160 of them on one flight cost us the brand, at 160 family occasions.',
  8: 'Customers should never learn about a disruption after our Ops room does. Certainty is the product.',
};
function recommend() {
  let r = 8; const e = STATE.enh;
  const ae = e.has('A') || e.has('E'); if (ae) r += 1;
  r += .5 * (e.size - (ae ? 1 : 0));
  return clamp(Math.round(r), 5, 10);
}
const SPENT = (st, n) => n - (st.enh.has('F') ? 4 : 0);
const G5HUD = st => ({ clock: T(16, 46), lost: SPENT(st, 16), stress: 5 });
const G6HUD = st => ({ clock: st.fly === 'p' ? T(17, 27) : T(19, 37), lost: SPENT(st, 28), stress: 5 });
const G7HUD = st => ({ clock: T(22, 30), lost: SPENT(st, 28), stress: 5 });

/* ===================== SCENE HELPERS ===================== */
function phoneLayout(el, screen) {
  const content = h(`<div class="content"><div class="side" style="position:absolute;left:560px;top:0;width:600px;bottom:0"></div></div>`);
  el.appendChild(content);
  const ph = phoneEl(60, 0); $('.app', ph).innerHTML = screen; content.prepend(ph);
  return { content, ph, side: $('.side', content) };
}
// HERO bridge: the host speaks the lines, the text column shows the chapter title.
function bridge(o) {
  return async (c, el) => {
    el.innerHTML = `<div class="herobox"><div class="eyebrow bl">${o.eyebrow || ''}</div><div class="h1 bl" style="margin-top:16px;max-width:1000px">${o.title}</div></div>`;
    for (const b of $$('.bl', el)) bg(fadeIn(c, b, { d: 600 }));
    for (const [i, l] of o.lines.entries()) await c.say(l, { pose: (o.poses || [])[i] });
    await c.cont(o.btn, { auto: true, host: $('.herobox', el), style: 'position:relative;right:auto;bottom:auto;margin-top:36px;display:inline-flex' });
  };
}
function choiceCard(o, i) {
  return h(`<button class="choice"><span class="top">${SQ(o.ic)}<small>OPTION ${'ABC'[i]}</small></span><h3>${o.t}</h3><p>${o.p}</p></button>`);
}
const xr = (cls, html, style = '') => h(`<div class="xr ${cls}" style="position:relative;margin-top:16px;${style}">${html}</div>`);
async function xrStack(c, host, items, slam = 1) {
  for (const [i, x] of items.entries()) {
    host.appendChild(x);
    if (i === slam) await c.anim(x, [{ opacity: 0, transform: 'scale(2.4)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: EASE.over });
    else await fadeIn(c, x, { d: 400 });
    await c.wait(450);
  }
}
const pop = (c, el) => c.anim(el, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: EASE.over });
const FIDS_ROWS = (st, cls) => [['15:25', 'SH 1121', 'DAMMAM', '21', 'BOARDING', 'ok'], ['16:10', 'SH 1043', 'JEDDAH', '23', st, cls, 1], ['17:40', 'SH 1049', 'JEDDAH', '25', 'ON TIME', 'ok']];
const fmtMin = (m) => `${Math.floor(m / 60)}:${pad(Math.floor(m % 60))}`;

/* ===================== SCENES ===================== */
SCENES = [
/* ---------- CHAPTER 1: ON TIME ---------- */
{ id: 'B0', ch: 1, zone: 'bad', mode: 'hero', pose: 'intro', noHud: true, run: async (c, el) => {
  el.innerHTML = `<div class="herobox"><div class="eyebrow l0">CX Day · a story in six chapters</div>
    <div class="idcard" style="margin-top:22px">
      <div class="g2 l1">${SQ('user')}<div><small>Who</small><b>Abu Fawzan, 61 · retired school principal</b></div></div>
      <div class="g2 l1">${SQ('pin')}<div><small>Home</small><b>Al‑Malqa, north Riyadh</b></div></div>
      <div class="g2 l2">${SQ('calendar')}<div><small>Tonight</small><b>Fawzan’s wedding · Jeddah · zaffa 10:30 PM</b></div></div>
      <div class="g2 l2"><span class="sq" style="background:#D4A01722">${BISHT(40)}</span><div><small>In his suitcase</small><b>The groom’s bisht · <em>gold zari, hand-finished</em></b></div></div>
    </div></div>`;
  $$('.l0,.l1,.l2', el).forEach(e => e.style.opacity = 0);
  bg(fadeIn(c, $('.l0', el), { d: 600 }));
  await c.say('السلام عليكم! أنا أبو فوزان. Abu Fawzan. Retired principal, Al‑Malqa, north Riyadh.', { pose: 'intro', fx: ['hop'] });
  $$('.l1', el).forEach((e, i) => bg(fadeIn(c, e, { delay: i * 120 })));
  await c.say('Tonight my son Fawzan marries in Jeddah. I carry his bisht, ready only this morning.', { pose: 'happy', fx: ['sparkle'] });
  $$('.l2', el).forEach((e, i) => bg(fadeIn(c, e, { delay: i * 120 })));
  await c.say('One flight. 4:10 PM. Let me show you the day I flew.', { pose: 'intro' });
  await c.cont('Start my day', { auto: true, pause: 4000, host: $('.herobox', el), style: 'position:relative;right:auto;bottom:auto;margin-top:34px;display:inline-flex' });
} },
{ id: 'B1', ch: 1, zone: 'bad', mode: 'stage', pose: 'intro', narr: '12:30 PM · Al‑Malqa · Wedding day', hud: { clock: T(12, 30), lost: 0, stress: 10 }, run: async (c, el) => {
  const { ph, side } = phoneLayout(el, scrTrip({ src: 'Updated 9:00 AM', btn: 'Check in' }));
  side.innerHTML = goalCard();
  bg(fadeIn(c, ph, { y: 80, d: 700 })); bg(fadeIn(c, side.firstChild, { delay: 200 }));
  await c.say('12:30. I check in on the Sahab app. Seat 12A, window.', { pose: 'intro' });
  const btn = $('.pbtn', ph);
  await c.act(btn);
  toast(ph, 'You’re checked in. Drop your bag by 3:10 PM.');
  btn.textContent = 'Boarding pass ✓'; btn.style.background = '#16A34A';
  await c.think('On time. Alhamdulillah. Lands 5:55. Plenty of time.', { pose: 'think' });
  await c.think('I’ll dress Fawzan myself. Like my father dressed me.', { pose: 'happy' });
} },
{ id: 'B2', ch: 1, zone: 'bad', mode: 'witness', pose: 'think', narr: '12:41 PM · Sahab Ops Control · What I couldn’t see', hud: { clock: T(12, 41), lost: 0, stress: 10 }, run: async (c, el) => {
  el.innerHTML = `<div class="splithead"><div class="eyebrow" style="color:#FF4D6A">● Meanwhile · What I couldn’t see</div><h2 class="h2" style="margin-top:10px;font-size:56px">Same minute. Two places.</h2></div>
    <div class="split"><div class="seam"></div><div class="l" style="position:relative;display:grid"><div class="ptag">Me · Al‑Malqa</div>
      <div class="calmcard">${BISHT(110)}<div class="h3" style="color:#1E1216">Ironing my thobe</div><p class="body" style="color:#7A4A2C;margin:0">Bisht box on the bed.</p><span class="chip pill" style="color:#15803D">SH 1043 · On time</span></div></div>
    <div class="r" style="position:relative;display:grid"><div class="ptag" style="background:#B91C1C">Sahab Ops Control · Riyadh</div></div></div>`;
  const pane = occPane(); $('.split .r', el).appendChild(pane);
  const cap = $('.cap', pane), cc = $('.cc', pane), pill = $('.pill', el), occ = $('.occ', pane);
  let secs = 0;
  const iv = setInterval(() => { secs++; cc.textContent = `12:${pad(41 + Math.floor(secs / 60))}:${pad(secs % 60)} PM`; }, 1000);
  c.cleanups.push(() => clearInterval(iv));
  await Promise.all([fadeIn(c, $('.split .l', el), { y: 0 }), fadeIn(c, $('.split .r', el), { y: 0 })]);
  c.think('I only found this out later. Here’s Sahab’s Ops room at 12:41.', { bg: true, pose: 'think' });
  bg(c.hud({ clock: T(12, 41) }, 6000));
  await c.wait(600);
  const row = $('.row.key', occ);
  await c.anim(row, [{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }], { duration: 350 });
  cap.innerHTML = 'An engineer in Abha reports a hydraulic leak.';
  $$('.row.ln:not(.key)', occ).forEach(r => r.style.opacity = 1);
  await c.wait(2200);
  const s = $('.s', row);
  await c.anim(s, [{ transform: 'rotateX(0)' }, { transform: 'rotateX(90deg)' }], { duration: 180 });
  row.classList.add('aog'); s.textContent = 'AOG · HYDRAULIC LEAK'; $('.tgt', occ).classList.add('x');
  await c.anim(s, [{ transform: 'rotateX(-90deg)' }, { transform: 'rotateX(0)' }], { duration: 220 });
  sfx('bad');
  cap.innerHTML = 'Ops marks the aircraft grounded.';
  await c.wait(1200);
  for (const k of ['.k1', '.k2']) { await c.anim($(k, occ), [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }); await c.wait(250); }
  await c.wait(1100);
  bg(c.anim(pill, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 400 }));
  await c.anim($('.k3', occ), [{ opacity: 0, transform: 'scale(1.8)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EASE.over });
  sfx('bad');
  cap.innerHTML = '<b>12:41 PM</b> · Customer message: <b>NOT SENT</b> · awaiting decision';
  announce('Ops grounded the aircraft at 12:41. Customer notification not sent.');
  await c.think('They knew. At 12:41. And I was ironing my thobe.', { pose: 'disappointed' });
  await c.cont('Next', { auto: true, small: true, style: 'left:840px;right:auto;bottom:auto;top:230px' });
} },
{ id: 'B3', ch: 1, zone: 'bad', mode: 'stage', pose: 'intro', narr: '1:50 PM · Terminal 2 · Bag drop · 2 of 6 counters open', hud: { clock: T(14, 25), lost: 35, stress: 25 }, run: async (c, el) => {
  hudSet({ clock: T(13, 50) });
  el.innerHTML = `<div class="content"><div class="dlg tight" style="top:420px;bottom:0"></div></div>`;
  const ct = $('.content', el), dlg = $('.dlg', el);
  const q = queuePane({ sign: 'BAG DROP · COUNTERS 14–19', n: 6, step: 180, cw: 150, open: [2, 3], q: 9, qx: 120, w: 1168, h: 400, chip: '<small>Queue</small><span class="qv">0</span> min' });
  ct.prepend(q.el);
  bg(fadeIn(c, q.el, { y: 20 }));
  await c.say('1:50. Two counters open out of six. Thirty-five minutes in line.', { pose: 'intro' });
  c.say('Watch my meter up there: time lost, zaffa countdown, stress.', { bg: true, pose: 'intro' });
  bg(c.anim($('#hud'), [{ boxShadow: 'var(--hi),var(--e2)' }, { boxShadow: '0 0 0 4px var(--accent),0 0 40px var(--accent)' }, { boxShadow: 'var(--hi),var(--e2)' }], { duration: 1600, fill: 'none' }));
  const qv = $('.qv', q.el);
  await Promise.all([
    c.tween(3500, p => { qv.textContent = Math.round(35 * p); }, lin),
    c.hud({ clock: T(14, 25), lost: 35, stress: 25 }, 3500),
    q.shuffle(c, 2, 1200),
  ]);
  await c.wait(800);
  const R = 'Reem · Bag drop';
  await dlgBub(c, dlg, R, 'Jeddah, SH 1043? All good, uncle. Gate 23, boarding 3:40.', false, 900, 3);
  await dlgBub(c, dlg, 'Abu Fawzan', 'Careful with it, ya binti. There’s a bisht inside.', true, 900, 3);
  await dlgBub(c, dlg, R, 'Don’t worry. Have a good flight.', false, 700, 3);
  const tag = h(`<div class="bagtag" style="left:760px;top:250px">RUH → JED · SH 1043<br>SH 447731<span class="bc"></span></div>`); ct.appendChild(tag);
  sfx('tap'); setTimeout(() => sfx('tap'), 300); setTimeout(() => sfx('tap'), 600);
  await c.anim(tag, [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 900, easing: 'steps(12)' });
  announce('Bag tagged SH 447731 to SH 1043.');
  await c.think('Bag tagged. The bisht flies at 4:10. Inshallah.', { pose: 'think' });
  await c.cont('Through security', { auto: true, small: true });
} },
{ id: 'B4', ch: 1, zone: 'bad', mode: 'stage', pose: 'think', narr: '3:05 PM · After security · One quick check', hud: { clock: T(15, 5), lost: 35, stress: 30 }, run: async (c, el) => {
  const { ph, side } = phoneLayout(el, scrTrip({ src: 'Updated 9:00 AM', btn: `${ICON('refresh')} Refresh` }));
  $('.pg', ph).insertAdjacentHTML('beforeend', '<div class="spinbox" style="height:50px;margin-top:20px"></div>');
  side.innerHTML = `<div class="panel goal">${SQ('clock')}<div><div class="gl">After security · Terminal 2</div><div class="gv" style="white-space:normal">One quick check before the gate.</div></div></div>`;
  bg(fadeIn(c, ph, { y: 30 }));
  c.say('3:05. Through security. One quick check on the app.', { bg: true, pose: 'intro' });
  await c.hud({ clock: T(15, 5) }, 1200);
  await c.wait(900);
  await c.act($('.pbtn', ph));
  $('.spinbox', ph).innerHTML = '<div class="spin"></div>'; await c.wait(1200); $('.spinbox', ph).innerHTML = '';
  const sbar = $('.sbar', ph);
  bg(c.anim(sbar, [{ transform: 'scale(1.06)' }, { transform: 'none' }], { duration: 400, easing: EASE.over }));
  await c.think('Still on time. Okay. Breathe.', { pose: 'happy', fx: ['sparkle'] });
  ph.classList.add('frozen'); sbar.style.outline = '5px solid #EF4444'; sfx('bad');
  await xrStack(c, side, [
    xr('red', `${ICON('warn')} This status isn’t live.`, 'margin-top:24px'),
    xr('mono', 'Last status push: 9:00 AM · 6 hours ago', 'font-size:26px'),
    xr('note', '<span class="strike">On time</span><br>Actually: no aircraft since 12:41 PM'),
  ]);
  announce('The app says On time, but its status was last pushed at 9 AM. The aircraft was grounded at 12:41 PM.');
  bg(c.hud({ stress: 30 }, 600));
  await c.say('‘On time.’ Their own Ops grounded the plane over two hours ago.', { pose: 'frustrated', fx: ['puff'] });
  await c.cont('To the gate', { auto: true, small: true });
} },
/* ---------- CHAPTER 2: THE GATE ---------- */
{ id: 'B5', ch: 2, zone: 'bad', mode: 'stage', pose: 'think', narr: '3:40 PM · Gate 23 · Boarding should start now', hud: { clock: T(16, 25), lost: 80, stress: 60 }, run: async (c, el) => {
  el.innerHTML = `<div class="content"><div class="dlg tight" style="top:410px;bottom:0"></div></div>`;
  const ct = $('.content', el), dlg = $('.dlg', el);
  const f = fidsEl(FIDS_ROWS('ON TIME', 'ok'), { x: 0, y: 0, clock: '15:40' }); ct.prepend(f);
  const st = $('.fr.hl .st', f), fc = $('.fc', f);
  bg(fadeIn(c, f, { y: 20 }));
  await c.hud({ clock: T(15, 40), lost: 35, stress: 35 }, 1000);
  await flapTo(c, st, 'DELAYED', 'warn'); sfx('bad');
  await c.think('Delayed. No time. No reason. Just ‘delayed’.', { pose: 'think' });
  fc.textContent = '15:55';
  await Promise.all([flapTo(c, st, 'NEW 17:00', 'warn'), c.hud({ clock: T(15, 55), lost: 50, stress: 45 }, 800)]);
  await c.wait(900);
  fc.textContent = '16:25';
  await Promise.all([flapTo(c, st, 'NEW 17:30', 'warn'), c.hud({ clock: T(16, 25), lost: 80, stress: 60 }, 800)]);
  await c.think('5:00. Then 5:30. Every half hour they push it again.', { pose: 'think', fx: ['sweat'] });
  const K = 'Khalid · Gate 23';
  await dlgBub(c, dlg, 'Abu Fawzan', 'Son, what’s the new time?', true, 700, 3);
  await dlgBub(c, dlg, K, 'No information yet, sir. Please wait for the announcement.', false, 900, 3);
  M.pose('frustrated');
  await dlgBub(c, dlg, 'Abu Fawzan', 'Is it the plane? The weather? Anything?', true, 700, 3);
  await dlgBub(c, dlg, K, 'I’m sorry, sir. My screen says what yours says.', false, 900, 3);
  await c.say('Khalid wasn’t hiding anything. He didn’t know either.', { pose: 'disappointed', fx: [] });
} },
{ id: 'B6', ch: 2, zone: 'bad', mode: 'stage', pose: 'think', narr: '4:30 PM · Gate 23 · Third delay · Zaffa in 6 hours', hud: { clock: T(16, 30), lost: 85, stress: 55 }, run: async (c, el) => {
  el.innerHTML = `<div class="content"><div class="eyebrow">You pick</div><h2 class="h2" style="margin:12px 0 10px">What would you have done?</h2>
    <p class="body" style="margin-bottom:34px;max-width:1100px">Third delay. No reason, no real time. The groom’s bisht is on board.</p><div class="choices"></div></div>`;
  const opts = [
    { ic: 'seat', t: 'Stay at the gate', p: 'Keep my bag and my seat.', v: 'Same as me. The bisht was on that plane. I stayed.' },
    { ic: 'desk', t: 'Ask the transfer desk', p: 'Ask them to move me now.', v: 'I tried. ‘Only delayed, uncle. Can’t change it.’', no: 'Not cancelled yet. Nothing to change.' },
    { ic: 'ticket', t: 'Fly another airline', p: '4:55 PM · SAR 1,890 one-way', v: 'SAR 1,890, and the bisht stays in Riyadh? No.', no: 'His bag stays on this flight.' },
  ];
  const box = $('.choices', el);
  const cards = opts.map((o, i) => { const b = choiceCard(o, i); box.appendChild(b); return b; });
  await Promise.all(cards.map((b, i) => fadeIn(c, b, { delay: i * 120 })));
  bg(c.hud({ clock: T(16, 30), lost: 85, stress: 55 }, 800));
  await c.say('Three delays. No answers. The bisht is on this plane. What would you do?', { pose: 'think' });
  for (;;) {
    const live = cards.filter(b => !b.disabled);
    const { i: li, auto } = await c.choose(live, { timeout: 12000, autoIdx: live.indexOf(cards[0]) });
    const i = cards.indexOf(live[li]);
    if (auto) { await c.say('I didn’t wait for a vote. I sat back down.', { pose: 'intro' }); break; }
    if (i === 0) { cards[0].classList.add('pick'); sfx('ok'); await c.say(opts[0].v, { pose: 'intro', fx: ['bounce'] }); break; }
    cards[i].disabled = true; cards[i].classList.add('no'); cards[i].insertAdjacentHTML('beforeend', `<span class="why">${opts[i].no}</span>`); sfx('bad');
    await c.say(opts[i].v, { pose: 'disappointed' });
  }
} },
{ id: 'B7', ch: 2, zone: 'bad', mode: 'stage', pose: 'think', narr: '4:46 PM · Gate 23 · The announcement', hud: { clock: T(16, 58), lost: 113, stress: 100 }, run: async (c, el) => {
  el.innerHTML = `<div class="content"><div class="grp" style="position:absolute;inset:0"></div></div>`;
  const ct = $('.content', el), grp = $('.grp', el);
  const ticker = '<bdi dir="rtl" lang="ar">نأسف لإبلاغكم بإلغاء رحلة سحاب 1043 المتجهة إلى جدة</bdi> · We regret to announce that Sahab flight SH 1043 to Jeddah is cancelled. Please proceed to the transfer desk.';
  const f = fidsEl(FIDS_ROWS('NEW 17:30', 'warn'), { x: 0, y: 0, clock: '16:46', ticker }); grp.appendChild(f);
  const st = $('.fr.hl .st', f);
  bg(fadeIn(c, f, { y: 20 }));
  sfx('pa');
  announce('We regret to announce that Sahab flight SH 1043 to Jeddah is cancelled. Please proceed to the transfer desk.');
  await c.hud({ clock: T(16, 46), lost: 101, stress: 70 }, 1500);
  await c.wait(1500);
  const bo = h(`<div class="blackout"></div>`); el.appendChild(bo);
  await c.anim(bo, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
  BUB.hide(true);
  await c.wait(400);
  flapSet(st, 'CANCELLED', 'bad');
  await c.anim(bo, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
  bo.remove();
  $('.fr.hl', f).classList.add('blink');
  const stamp = h(`<div class="stamp cxl" style="left:60px;top:170px;font-size:130px">CANCELLED</div>`); grp.appendChild(stamp);
  sfx('thud'); bg(c.hud({ stress: 100 }, 200));
  M.pose('frustrated', { instant: true, fx: ['shake', 'puff', 'vein', 'grey'] });
  bg(c.anim($('#scene'), [{ transform: 'scale(1)' }, { transform: 'scale(1.06)', offset: .12 }, { transform: 'scale(1.03)' }], { duration: 1000, easing: EASE.out, fill: 'forwards' }));
  await c.anim(stamp, [{ opacity: 0, transform: 'rotate(-8deg) scale(2.6)' }, { opacity: 1, transform: 'rotate(-8deg) scale(1)' }], { duration: 260, easing: EASE.over });
  announce('Flight SH 1043 cancelled.');
  await shake(c);
  await c.wait(900);
  await c.think('Cancelled. A hundred and sixty of us. One announcement.', { pose: 'frustrated' });
  // phase 2: the text that finally arrives
  await c.anim(grp, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
  grp.remove();
  $('#scene').getAnimations().forEach(a => a.cancel()); $('#scene').style.transform = '';
  narr('4:58 PM · Gate 23 · The first text from Sahab');
  const ph = phoneEl(60, 0); ct.appendChild(ph);
  $('.screen', ph).appendChild(lockAlert({ time: '4:58', date: 'Thursday', bad: true, title: 'SH 1043 cancelled', body: 'We regret your flight SH 1043 is cancelled. Please contact our call centre on 9200 XXXXX.' }));
  const side = h(`<div class="side" style="position:absolute;left:560px;top:0;width:600px"></div>`); ct.appendChild(side);
  await c.anim(ph, [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: EASE.out });
  ph.classList.add('buzz'); sfx('buzz');
  announce('Text from Sahab, 4:58 PM: We regret your flight SH 1043 is cancelled. Please contact our call centre.');
  bg(c.hud({ clock: T(16, 58), lost: 113, stress: 100 }, 1000));
  await xrStack(c, side, [
    xr('note', 'Ops knew: 12:41 PM', 'margin-top:0'),
    xr('note', 'Cancelled in system: 4:20 PM'),
    xr('red', `${ICON('warn')} First text to me: 4:58 PM`),
  ], 2);
  announce('Ops knew at 12:41 PM. Cancelled in the system at 4:20 PM. First text to the customer at 4:58 PM.');
  await c.say('Ops knew at 12:41. Sahab texted me at 4:58.', { pose: 'frustrated', fx: ['vein'] });
} },
/* ---------- CHAPTER 3: MISSED ---------- */
{ id: 'B8', ch: 3, zone: 'bad', mode: 'stage', pose: 'think', narr: '4:58 PM · On hold and in the queue · 1 desk, 140 people', hud: { clock: T(17, 50), lost: 165, stress: 85 }, run: async (c, el) => {
  const { ph, side } = phoneLayout(el, scrTrip({ tag: 'Manage booking', st: 'Cancelled', cls: 'bad', src: 'Updated 4:58 PM', btn: 'Change flight' }));
  const q = queuePane({ sign: '<span style="font-size:22px">TRANSFER DESK · 1 OPEN</span>', n: 1, step: 0, cw: 220, open: [0], first: 7, q: 8, qx: 40, w: 600, h: 480, chip: '<small>You are</small>#<span class="qv">63</span>' });
  side.appendChild(q.el);
  side.insertAdjacentHTML('beforeend', `<div class="panel capx" style="position:absolute;top:510px;left:0;right:0;padding:22px 26px;display:flex;gap:16px;align-items:center;font:600 28px var(--f-body);color:var(--muted)">${SQ('note')}<span class="cp">Calling Sahab Care…</span></div>`);
  const cap = $('.capx .cp', side);
  bg(fadeIn(c, ph, { y: 30 })); bg(fadeIn(c, q.el, { y: 20 }));
  await c.wait(600);
  await c.act($('.pbtn', ph));
  toast(ph, 'This booking can’t be changed online. Please contact us.');
  await c.think('Change flight. Of course… ‘Please contact us.’', { pose: 'think' });
  $('.app', ph).innerHTML = `<div class="callscr"><div class="av">${LOGO}</div><div class="cn">Sahab Care</div><div class="cs">Calling…</div><div class="ct num">0:00</div><div class="cm"></div><div class="end">${ICON('phone')}</div></div>`;
  const cs = $('.cs', ph), ct = $('.ct', ph), cm = $('.cm', ph), scr = $('.callscr', ph), qv = $('.qv', q.el);
  sfx('ring'); await c.wait(900);
  cs.textContent = 'On hold'; cap.textContent = 'Hold music'; const stop = holdMusic(c);
  cm.textContent = '“Your call is important to us. Expected wait: more than 30 minutes.”';
  announce('Recorded message: Your call is important to us. Expected wait: more than 30 minutes.');
  await Promise.all([
    c.tween(6000, p => { ct.textContent = `${Math.floor(p * 52)}:${pad(Math.floor(p * 52 * 60) % 60)}`; qv.textContent = Math.round(63 - 34 * p); }, lin),
    c.hud({ clock: T(17, 50), lost: 165, stress: 85 }, 6000),
    q.shuffle(c, 4, 1300),
    (async () => { await c.wait(1200); c.think('Same music. Fifth time. I know the words now.', { bg: true, pose: 'think', fx: ['sweat'] }); })(),
  ]);
  stop(); sfx('drop'); scr.classList.add('dropped'); ct.textContent = '52:00'; cs.textContent = 'Call ended'; cm.textContent = ''; cap.textContent = 'Call dropped at 52 minutes';
  await c.think('Fifty-two minutes. Then it hung up. Wallah.', { pose: 'frustrated', fx: ['tint'] });
} },
{ id: 'B9', ch: 3, zone: 'bad', mode: 'stage', pose: 'think', narr: '6:35 PM · Transfer desk · 1 h 37 min in line', hud: { clock: T(18, 35), lost: 210, stress: 90 }, run: async (c, el) => {
  el.innerHTML = `<div class="content"><div class="dlg" style="top:90px"></div></div>`;
  const ct = $('.content', el), dlg = $('.dlg', el);
  const MJ = 'Majed · Transfer desk';
  bg(c.hud({ clock: T(18, 35), lost: 210, stress: 80 }, 800));
  await dlgBub(c, dlg, MJ, 'Next available seat is tomorrow, 7:10 AM, uncle.', false, 900);
  await dlgBub(c, dlg, 'Abu Fawzan', 'My son’s wedding is tonight. Tonight, ya waladi.', true, 700);
  await c.say('One desk. 140 people. All with a reason to be in Jeddah tonight.', { pose: 'frustrated', fx: ['tint'] });
  bg(c.hud({ stress: 90 }, 600));
  const chip = h(`<div class="seatchip">${ICON('plane')} SH 1057 · 8:20 PM · Seat 38E · last row</div>`);
  const b = dlgBub(c, dlg, MJ, 'Let me look… SH 1057, 8:20 PM. Middle seat, 38E.', false, 900);
  ct.appendChild(chip); await pop(c, chip);
  await b;
  await dlgBub(c, dlg, 'Abu Fawzan', 'I’ll take it. And my bag?', true, 700);
  await dlgBub(c, dlg, MJ, 'It will follow you automatically, sir.', false, 900);
  await c.think('‘Automatically.’ He sounded sure. I wanted to believe him.', { pose: 'think', fx: ['-tint'] });
  await c.cont('Board SH 1057', { auto: true, small: true });
} },
{ id: 'B10', ch: 3, zone: 'bad', mode: 'stage', pose: 'think', narr: '10:15 PM · Jeddah · Belt 6', hud: { clock: T(22, 56), lost: 371, stress: 95 }, run: async (c, el) => {
  hudSet({ clock: T(22, 15), lost: 330, stress: 80 });
  el.innerHTML = `<div class="content"><div class="cctv frame" style="position:absolute;left:0;top:0;width:700px;height:480px"></div><div class="dlg tight" style="left:0;width:700px;right:auto;top:500px;bottom:0"></div></div>`;
  const ct = $('.content', el), frame = $('.frame', el), dlg = $('.dlg', el);
  const belt = beltEl({ sign: 'BELT 6', sub: 'SH 1057 · Riyadh', cnt: '0 min' }); frame.appendChild(belt);
  const ph = phoneEl(748, 0); ph.style.opacity = 0; ct.appendChild(ph);
  $('.app', ph).innerHTML = `<div class="wa"><div class="wh"><i>${ICON('user')}</i>Umm Fawzan</div><div class="wb"><span dir="rtl" lang="ar">وينك؟ الزفة بدأت</span><br><i style="font:italic 500 17px var(--f-body);color:#64748B">Where are you? The zaffa started.</i><small>10:30 PM</small></div></div>`;
  bg(fadeIn(c, frame, { y: 20 }));
  const cv = $('.cv', belt);
  let shown = false;
  const bags = ['', 'b2', 'b3', '', 'b2', 'b3'].map((cls, i) => bagRun(c, belt, cls, 6500, i * 1000));
  const from = { ...hud }, to = { clock: T(22, 56), lost: 371, stress: 95 };
  await c.tween(8000, p => {
    for (const k in to) hud[k] = from[k] + (to[k] - from[k]) * p; renderHud();
    cv.textContent = Math.round(41 * p) + ' min';
    if (!shown && hud.clock >= T(22, 30)) {
      shown = true; bg(fadeIn(c, ph, { y: 30 })); ph.classList.add('buzz'); sfx('buzz');
      announce('Umm Fawzan: Where are you? The zaffa started.');
      c.think('10:30. The zaffa starts now. I’m watching a belt.', { bg: true, pose: 'think' });
    }
  }, lin);
  await Promise.all(bags);
  belt.classList.add('stop');
  const sign = $('.sign', belt);
  await c.anim(sign, [{ opacity: 1 }, { opacity: 0 }], { duration: 150 });
  sign.innerHTML = 'ALL BAGS DELIVERED <small>SH 1057</small>'; bg(c.anim(sign, [{ opacity: 0 }, { opacity: 1 }], { duration: 150 }));
  $('.cnt', belt).classList.add('hot');
  M.pose('disappointed', { fx: ['grey', 'slump'] });
  const SM = 'Sami · Baggage services';
  await dlgBub(c, dlg, SM, 'Your bag is still in Riyadh, uncle. It never left.', false, 900, 3);
  await dlgBub(c, dlg, 'Abu Fawzan', 'There’s a bisht in that bag. My son’s. For tonight.', true, 700, 3);
  await dlgBub(c, dlg, SM, 'I’m sorry. Fill this form, please. Three to five days.', false, 700, 3);
  const paper = h(`<div class="xr note paper" style="left:250px;top:300px;z-index:8;font-size:22px">Mishandled baggage report<br>Ref JEDSH 47731 · Est. 3–5 days<small>Left on SH 1043’s cart</small></div>`); ct.appendChild(paper);
  await c.anim(paper, [{ opacity: 0, transform: 'rotate(-2deg) translateY(30px)' }, { opacity: 1, transform: 'rotate(-2deg)' }], { duration: 450, easing: EASE.out });
  await c.say('‘It will follow you automatically.’ It didn’t follow anyone.', { pose: 'disappointed' });
} },
{ id: 'B11', ch: 3, zone: 'bad', mode: 'stage', pose: 'disappointed', fx: ['grey'], narr: '11:20 PM · Qasr Al‑Lulu Hall · After the zaffa', hud: { clock: T(23, 20), lost: 375, stress: 95 }, run: async (c, el) => {
  const wins = [0, 1, 2, 3].map(i => `<rect class="hallwin" x="${70 + i * 90}" y="250" width="50" height="80" rx="25" fill="#F5B301" style="animation-delay:${i * .7}s"/>`).join('');
  el.innerHTML = `<div class="content">
    <div class="panel hall" style="left:0;top:20px;width:480px;height:600px;padding:0">
      <svg viewBox="0 0 480 560" width="480" height="560" aria-hidden="true"><rect width="480" height="560" fill="#0B1020"/>
        <path d="M30 560 V200 Q240 40 450 200 V560 Z" fill="#1B2238"/>${wins}
        <g transform="translate(240 380)"><circle cy="-80" r="22" fill="#C89A6A"/><path d="M-40 -64 Q0 -110 40 -64 L52 -20 Q0 -36 -52 -20 Z" fill="#FBFAF6"/><path d="M-60 -50 L-80 180 L80 180 L60 -50 Q0 -70 -60 -50 Z" fill="#2B2F3A"/></g></svg>
      <div class="ill" style="padding:0 22px">Fawzan at the zaffa, in his uncle’s bisht.</div></div>
    <div class="stats" style="position:absolute;left:520px;top:30px;width:648px"></div></div>`;
  bg(fadeIn(c, $('.hall', el), { y: 20 }));
  await c.hud({ clock: T(23, 20), lost: 375, stress: 95 }, 1500);
  const lines = ['6 h 15 min lost.', '3 queues.', '52 min on hold.', '1 bag, wrong city.', '0 zaffa.'];
  const stats = $('.stats', el);
  for (const [i, l] of lines.entries()) {
    const d = h(`<div class="h1" style="font-size:60px;white-space:nowrap;${i === 4 ? 'color:var(--danger)' : ''}">${l}</div>`); stats.appendChild(d);
    await fadeIn(c, d, { d: 400 }); if (i === 4) sfx('thud'); await c.wait(220);
  }
  const n = h(`<div class="xr note" style="position:relative;margin-top:18px">Day 9: SAR 150 voucher. After a 14-field claim.</div>`); stats.appendChild(n); await fadeIn(c, n);
  announce(lines.join(' ') + ' Day 9: SAR 150 voucher, after a 14-field claim.');
  await c.say('Fawzan wore his uncle’s bisht. He hugged me: ‘Never mind, yuba.’', { pose: 'disappointed' });
  await c.say('They didn’t lose a passenger. They lost my son’s night.', { pose: 'frustrated' });
  await c.think('11:58 PM, a text: ‘Rate your Sahab flight, 1 to 5.’', { pose: 'disappointed', fx: ['rain'] });
  await c.cont('What went wrong?', { auto: true });
} },
/* ---------- CHAPTER 4: DIAGNOSIS ---------- */
{ id: 'D0', ch: 4, zone: 'bad', mode: 'hero', pose: 'think', noHud: true, hud: HUD0, run: async (c, el) => {
  narr('');
  const rw = h(`<div class="rewind" aria-label="Rewind">${ICON('rewind')}&nbsp;REWIND</div>`); el.appendChild(rw);
  const tears = [120, 330, 520, 700, 880].map(t => { const d = h(`<div class="tear" style="top:${t}px;height:${30 + Math.random() * 50}px"></div>`); el.appendChild(d); return d; });
  sfx('rewind');
  tears.forEach((t, i) => bg(c.anim(t, [{ transform: 'translateX(-60px)' }, { transform: 'translateX(80px)' }, { transform: 'translateX(-30px)' }], { duration: 1400, delay: i * 40, easing: 'linear' })));
  bg(c.anim(rw, [{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-4px)' }, { transform: 'none' }], { duration: 1400 }));
  if (!CFG.reduced && !c.skip) { const seq = ['disappointed', 'frustrated', 'think', 'intro']; for (const [k, p] of seq.entries()) setTimeout(() => { if (!c.dead) M.pose(p, { instant: true }); }, k * 300 * CFG.speed); }
  bg(c.anim($('#abu .shk'), [0, -6, 5, -4, 6, 0].map(x => ({ transform: `translateX(${x}px)`, filter: 'drop-shadow(-4px 0 #f0f8) drop-shadow(4px 0 #0ff8)' })), { duration: 1400, fill: 'none' }));
  await c.hud({ ...HUD0 }, 1400, eio);
  el.innerHTML = '';
  setZone('diag'); hudShow(false); $('#vignette').style.opacity = 0;
  M.pose('think', { instant: true });
  await bridge({ eyebrow: 'Chapter 4 · Diagnosis', title: 'What broke?', lines: ['Okay. Deep breath. Let’s rewind.', 'Nobody planned this. Every gap was a reasonable decision on its own.'], poses: ['think', 'intro'], btn: 'See what broke' })(c, el);
} },
{ id: 'D1', ch: 4, zone: 'diag', mode: 'guide', pose: 'think', narr: 'Diagnosis · 6 touchpoints · 5 root causes', run: async (c, el) => {
  el.innerHTML = `<div class="full guide"><div class="eyebrow">Diagnosis</div><h2 class="h2" style="margin-top:8px">Five gaps broke my wedding day.</h2>
    <div class="tl">${TL.map(p => `<div class="tlp"><i aria-hidden="true">${ICON(p[0])}</i>${p[1]}<small>${p[2]}</small></div>`).join('')}</div>
    <div class="rcs">${ROOT.map((r, i) => `<div class="rc g2"><div class="n">0${i + 1}</div><h3>${r.t}</h3><p>${r.p}</p></div>`).join('')}<div class="rc ctacell"></div></div></div>`;
  const pins = $$('.tlp', el), cards = $$('.rc:not(.ctacell)', el);
  await Promise.all(pins.map((p, i) => fadeIn(c, p, { delay: i * 90, y: 10 })));
  await c.say('Six touchpoints. Five gaps. Watch where my day broke.', { pose: 'think' });
  for (const [i, r] of ROOT.entries()) {
    pins.forEach((p, k) => p.classList.toggle('lit', r.pins.includes(k)));
    announce(r.t + ' ' + r.p);
    c.say(r.r, { bg: true, pose: i === 4 ? 'disappointed' : i === 0 || i === 3 ? 'frustrated' : 'think', fx: [] });
    await fadeIn(c, cards[i], { d: 450 });
    await c.wait(2600);
  }
  pins.forEach(p => p.classList.add('lit'));
  await c.cont('Fix it', { host: $('.ctacell', el), style: 'position:static' });
} },
/* ---------- CHAPTER 5: FIX IT ---------- */
{ id: 'F0', ch: 5, zone: 'diag', mode: 'hero', pose: 'disappointed', run: bridge({ eyebrow: 'Chapter 5 · Fix It', title: 'How Sahab fixes it.', lines: ['Five gaps. One missed zaffa. Mine.', 'Five fixes, in the right order. Let me walk you through it.'], poses: ['disappointed', 'intro'], btn: 'Show me' }) },
{ id: 'F1', ch: 5, zone: 'diag', mode: 'guide', pose: 'intro', run: (c, el) => fixTour(c, el) },
{ id: 'F2', ch: 5, zone: 'diag', mode: 'hero', pose: 'happy', run: bridge({ eyebrow: 'Make it memorable', title: 'Go further.', lines: ['Sahab tells the truth now. Go further: make me feel looked after.'], poses: ['happy'], btn: 'Choose extras' }) },
{ id: 'F3', ch: 5, zone: 'diag', mode: 'guide', pose: 'intro', run: (c, el) => enhancementPicker(c, el) },
/* ---------- CHAPTER 6: THE BETTER WAY ---------- */
{ id: 'G0', ch: 6, zone: 'good', mode: 'hero', pose: 'intro', noHud: true, hud: { clock: T(12, 30), lost: 0, stress: 10 }, run: async (c, el) => {
  STATE.goodPeak = 10;
  await bridge({ eyebrow: 'Chapter 6 · The Better Way', title: 'Same day. A better Sahab.', lines: ['Same me. Same day. Same flight. Same 12:41 PM.', 'This time, Sahab is ready. Watch.'], poses: ['intro', 'happy'], btn: 'Replay my day' })(c, el);
} },
{ id: 'G1', ch: 6, zone: 'good', mode: 'stage', pose: 'intro', narr: '12:30 PM · Same day · Sahab has been fixed', hud: { clock: T(12, 30), lost: 0, stress: 10 }, run: async (c, el) => {
  const F = STATE.enh.has('F');
  const { ph, side } = phoneLayout(el, scrTrip({ src: '<span class="live">Live from Ops</span>', btn: 'Check in' }));
  side.innerHTML = goalCard(F ? '<span>Bag pickup</span>' : '');
  bg(fadeIn(c, ph, { y: 80, d: 700 })); bg(fadeIn(c, side.firstChild, { delay: 200 }));
  c.say('12:30 again. Your version.', { bg: true, pose: 'intro' });
  await c.wait(1400);
  const btn = $('.pbtn', ph);
  await c.act(btn);
  toast(ph, 'You’re checked in. Drop your bag by 3:10 PM.');
  btn.textContent = 'Boarding pass ✓'; btn.style.background = '#16A34A';
  await c.think('On time, and it says ‘live from Ops’. That’s new.', { pose: 'happy' });
  if (F) {
    const pk = h(`<button class="pbtn sec pickup">${ICON('home')} Book bag pickup · 1:00 PM</button>`); $('.pg', ph).appendChild(pk);
    await fadeIn(c, pk, { y: 10, d: 300 });
    await c.act(pk);
    toast(ph, 'Courier booked · 1:00 PM');
    await c.think('And my bag leaves from my door. Bisht first, me later.', { pose: 'happy' });
  }
} },
{ id: 'G2', ch: 6, zone: 'good', mode: 'stage', pose: 'think', narr: '12:46 PM · 5 minutes after Ops knew · The truth, first', hud: { clock: T(12, 46), lost: 0, stress: 10 }, run: async (c, el) => {
  const C = STATE.enh.has('C'), E = STATE.enh.has('E');
  const { ph, side } = phoneLayout(el, scrTrip({ src: '<span class="live">Live from Ops</span>', btn: 'Boarding pass ✓' }));
  side.innerHTML = goalCard() + `<div class="panel tk" style="margin-top:24px;padding:20px 24px;display:flex;gap:12px;align-items:center;opacity:0"><span class="chip">Ops knew · <b>12:41 PM</b></span>${ICON('chev')}<span class="chip">Told me · <b>12:46 PM</b></span></div>`;
  bg(fadeIn(c, ph, { y: 30 }));
  await c.hud({ clock: T(12, 46), stress: 15 }, 800);
  const T1 = 'SH 1043 can’t fly today', B1 = 'Technical fault. You’re on SH 1049, 5:40 PM, seat 14A. Your bag moves too.', MB = 'We saw it’s a wedding. Mabrook! You’re first in line.';
  let msg;
  if (C) {
    msg = h(`<div class="wa"><div class="wh"><i>${LOGO}</i>Sahab Airways</div><div class="wb"><b>${T1}</b><br>${B1}<small>12:46 PM</small></div></div>`);
    $('.screen', ph).appendChild(msg);
    await c.anim(msg, [{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: EASE.out });
  } else {
    msg = lockAlert({ time: '12:46', date: 'Thursday', title: T1, body: B1, actions: ['See options'] });
    $('.screen', ph).appendChild(msg);
    await c.anim(msg, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
  }
  ph.classList.add('buzz'); sfx('buzz');
  announce(`Sahab, 12:46 PM: ${T1}. ${B1}`);
  bg(fadeIn(c, $('.tk', side), { delay: 400 }));
  if (E) {
    await c.wait(600);
    const m2 = C ? h(`<div class="wb">${MB}<small>12:46 PM</small></div>`) : h(`<div class="notif sh" style="margin-top:14px"><span class="ni">${LOGO}</span><div style="flex:1;min-width:0"><div class="nh"><span>Sahab</span><span>now</span></div><span>${MB}</span></div></div>`);
    (C ? msg : $('.lock', ph)).appendChild(m2); sfx('toast'); announce(MB);
    await fadeIn(c, m2, { y: -20, d: 400 });
  }
  await c.think('12:46. Five minutes after Ops knew. Same fault, same plane.', { pose: 'think' });
  await c.say('They told me the truth, and fixed it. Jeddah by 7:25. Wedding at 9.', { pose: 'happy', fx: ['sparkle'] });
  bg(c.hud({ stress: 10 }, 800));
} },
{ id: 'G3', ch: 6, zone: 'good', mode: 'stage', pose: 'think', narr: '12:47 PM · Choosing my flight', hud: { clock: T(12, 47), lost: 0, stress: 10 }, run: async (c, el) => {
  const A = STATE.enh.has('A');
  const opts = [{ k: 's', ic: 'plane', t: 'Keep SH 1049 · 5:40 PM', p: 'Window 14A · lands 7:25 PM', v: 'Window seat, Jeddah by 7:25. Done.' }];
  if (A) opts.push({ k: 'p', ic: 'transfer', t: 'Partner flight · 3:30 PM', p: 'Lands 5:15 PM · bag goes with me', v: 'Earlier than planned. I’ll help set up the hall!' });
  opts.push({ k: null, ic: 'calendar', t: 'Tomorrow, 7:10 AM', p: 'Free change, or full refund', no: 'The wedding is tonight.', v: 'Free, yes. But the zaffa is tonight.' });
  el.innerHTML = `<div class="content"><div class="eyebrow">You pick</div><h2 class="h2" style="margin:12px 0 38px">Which flight should I take?</h2><div class="choices"></div></div>`;
  const box = $('.choices', el);
  const cards = opts.map((o, i) => { const b = choiceCard(o, i); box.appendChild(b); return b; });
  await Promise.all(cards.map((b, i) => fadeIn(c, b, { delay: i * 120 })));
  c.think(A ? 'Three options, one tap each. You pick.' : 'Two options, one tap each. You pick.', { bg: true, pose: 'think' });
  const autoCard = cards[A ? 1 : 0];
  for (;;) {
    const live = cards.filter(b => !b.disabled);
    const { i: li, auto } = await c.choose(live, { timeout: 12000, autoIdx: live.indexOf(autoCard) });
    const i = cards.indexOf(live[li]), o = opts[i];
    if (o.k) {
      STATE.fly = o.k; cards[i].classList.add('pick'); sfx('ok');
      await c.say(auto ? (o.k === 'p' ? 'Nobody picked? I’ll take the earlier flight.' : 'Nobody picked? I’ll take the window seat.') : o.v, { pose: 'happy', fx: ['bounce'] });
      break;
    }
    cards[i].disabled = true; cards[i].classList.add('no'); cards[i].insertAdjacentHTML('beforeend', `<span class="why">${o.no}</span>`); sfx('bad');
    await c.say(o.v, { pose: 'disappointed' });
  }
} },
{ id: 'G4', ch: 6, zone: 'good', mode: 'stage', pose: 'intro', narr: '12:48 PM · Rebooked · Bag re-tagged · Done in 2 taps', hud: { clock: T(12, 48), lost: 0, stress: 8 }, run: async (c, el) => {
  const p = STATE.fly === 'p', C = STATE.enh.has('C');
  const { ph, side } = phoneLayout(el, scrTrip(p
    ? { flt: 'Partner flight', dep: '3:30 PM', arr: '5:15 PM', seat: '9C', gate: '31', board: '2:50 PM', bag: 'Moved ✓', src: '<span class="live">Live from Ops</span>', btn: 'Boarding pass' }
    : { flt: 'SH 1049', dep: '5:40 PM', arr: '7:25 PM', seat: '14A', gate: '25', board: '5:10 PM', bag: 'Moved ✓', src: '<span class="live">Live from Ops</span>', btn: 'Boarding pass' }));
  bg(fadeIn(c, ph, { y: 20 }));
  bg(c.hud({ clock: T(12, 48), stress: 8 }, 600));
  sfx('chime');
  const stamp = h(`<div class="stamp good rebook" style="position:relative;display:inline-block;left:auto;top:auto;margin:40px 0 0 30px;font-size:84px;padding:14px 40px 6px;border-width:8px">REBOOKED</div>`); side.appendChild(stamp);
  await c.anim(stamp, [{ opacity: 0, transform: 'rotate(-6deg) scale(1.8)' }, { opacity: 1, transform: 'rotate(-6deg) scale(1)' }], { duration: 320, easing: EASE.over });
  M.fx('bounce');
  const bag = h(`<div class="panel goal" style="margin-top:40px">${SQ('tag')}<div><div class="gl">Bag SH 447731</div><div class="gv" style="font-size:26px"><s class="old">SH 1043</s> → <b class="nt" style="display:inline-block;color:var(--ok)">${p ? 'Partner 3:30 PM' : 'SH 1049'}</b></div></div></div>`);
  side.appendChild(bag); await fadeIn(c, bag, { d: 400 });
  await c.anim($('.nt', bag), [{ transform: 'rotateX(90deg)' }, { transform: 'none' }], { duration: 300 });
  const txt = p ? 'Hi Abu Fawzan, you’re on the 3:30 PM partner flight. Your bag too. Anything changes, I message first. Hessa, Sahab Care'
    : 'Hi Abu Fawzan, you’re on SH 1049, 5:40 PM, seat 14A. Your bag too. Anything changes, I message first. Hessa, Sahab Care';
  const msg = C
    ? h(`<div class="wa"><div class="wh"><i>${LOGO}</i>Sahab Airways</div><div class="wb">${txt}<small>12:48 PM · read</small></div><div class="wb">Live status: on time. Bag: checked in, moved ✓<small>12:48 PM · read</small></div></div>`)
    : h(`<div class="msg"><b>Messages · Sahab Care</b>${txt}</div>`);
  $('.screen', ph).appendChild(msg); sfx('toast'); announce(txt);
  await c.anim(msg, [{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: EASE.out });
  await c.say(C ? 'Rebooked. Bag moved. Hessa wrote on WhatsApp. A real name, a real promise.' : 'Rebooked. Bag moved. And Hessa signed it. A real name, a real promise.', { pose: 'intro' });
  await c.think(p ? 'No lunch today. Yalla, to the airport.' : 'I have three free hours. Lunch with my brother, then the airport.', { pose: 'happy' });
  await c.cont('Next', { auto: true, small: true });
} },
{ id: 'G5', ch: 6, zone: 'good', mode: 'witness', pose: 'think', narr: '4:46 PM · Same minute · This time nobody is stranded', hud: G5HUD, run: async (c, el) => {
  const p = STATE.fly === 'p', B = STATE.enh.has('B'), D = STATE.enh.has('D');
  const card = p ? { tag: 'Me · On board', art: SQ('plane'), h: 'Landing 5:15 PM.', b: 'The bisht is below me.', chip: 'Partner flight · 3:30 PM' }
    : B ? { tag: 'Me · Sahab lounge', art: SQ('coffee'), h: 'Gahwa and dates.', b: 'Boarding at 5:10.', chip: 'SH 1049 · 14A' }
    : { tag: 'Me · Gate 25', art: BISHT(110), h: 'Boarding at 5:10.', b: 'No queue. No hold music.', chip: 'SH 1049 · 14A' };
  el.innerHTML = `<div class="splithead"><div class="eyebrow" style="color:#15803D">● Meanwhile · Same airport, same minute</div><h2 class="h2" style="margin-top:10px;font-size:56px">4:46 PM. Gate 23, this time.</h2></div>
    <div class="split calm"><div class="seam"></div><div class="l" style="position:relative;display:grid"><div class="ptag">${card.tag}</div>
      <div class="calmcard">${card.art}<div class="h3" style="color:#1E1216">${card.h}</div><p class="body" style="color:#7A4A2C;margin:0">${card.b}</p><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><div class="chip">${card.chip}</div>${D ? `<div class="chip" style="color:#15803D">${ICON('tag')} Bag: loaded ✓</div>` : ''}</div></div></div>
    <div class="r" style="position:relative;display:grid"><div class="ptag" style="background:#15803D">Gate 23 · CAM 03</div></div></div>`;
  const pane = gatePane(); $('.split .r', el).appendChild(pane);
  const cap = $('.cap', pane), cc = $('.cc', pane);
  await Promise.all([fadeIn(c, $('.split .l', el), { y: 0 }), fadeIn(c, $('.split .r', el), { y: 0 })]);
  c.think('4:46 again. Last time, this is when they cancelled. Watch.', { bg: true, pose: 'think' });
  await Promise.all([c.hud(G5HUD(STATE), 3000), c.tween(3000, () => { cc.textContent = fmtClock(hud.clock).t + ' PM'; }, lin)]);
  for (const t of ['SH 1043 is cancelled. Same fault, same plane.', 'Nobody is waiting. 148 of 160 moved at 12:46.', '<b>4:46 PM</b> · 0 people at the desk ✓']) {
    cap.innerHTML = t; announce(cap.textContent); await c.wait(2400);
  }
  await c.say('Last time, 140 people queued here. This time, nobody.', { pose: 'happy', fx: ['sparkle'] });
  await c.cont('Next', { auto: true, small: true, style: 'left:840px;right:auto;bottom:auto;top:230px' });
} },
{ id: 'G6', ch: 6, zone: 'good', mode: 'stage', pose: 'intro', hud: G6HUD, run: async (c, el) => {
  const p = STATE.fly === 'p', D = STATE.enh.has('D'), E = STATE.enh.has('E');
  narr(p ? '3:30 → 5:15 PM · Partner flight · Riyadh to Jeddah' : '5:40 → 7:25 PM · SH 1049 · Riyadh to Jeddah');
  el.innerHTML = `<div class="content"></div>`; const ct = $('.content', el);
  const map = routeMapEl({ calm: true, w: 1100, x: 30, y: 0 }); ct.appendChild(map);
  bg(fadeIn(c, map, { y: 0, d: 500 }));
  const r = routePrep(map, '.r-main', 'calm');
  await c.tween(1400, f => r.draw(f));
  const note = h(`<div class="mapnote green g2" style="left:20px;top:600px;opacity:0">${SQ('check')}On time · live from Ops</div>`); ct.appendChild(note);
  const crew = E ? h(`<div class="bub staff" style="position:absolute;left:420px;top:120px;opacity:0"><span class="who">${p ? 'Crew' : 'Crew · SH 1049'}</span>Mabrook to the groom’s father!</div>`) : null;
  if (crew) ct.appendChild(crew);
  c.think(p ? 'A calm flight. Early, too. I even slept.' : 'A calm flight. Window seat. I even slept.', { bg: true, pose: 'intro' });
  const f0 = p ? .72 : 0, dur = p ? 2400 : 4200;
  if (!p) hudSet({ clock: T(17, 40) });
  let nShown = false, cShown = false, cGone = false;
  await Promise.all([
    c.tween(dur, f => {
      const ff = f0 + (1 - f0) * f; planeAt(map, r.p, ff);
      if (!nShown && f >= .3) { nShown = true; bg(fadeIn(c, note)); }
      if (crew && !cShown && f >= .5) { cShown = true; bg(pop(c, crew)); }
      if (crew && !cGone && f >= .8 && f < 1) { cGone = true; bg(c.anim(crew, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 })); }
    }, eio),
    c.hud({ clock: p ? T(17, 15) : T(19, 25) }, dur),
  ]);
  if (crew) crew.style.opacity = 0;
  setPin(map, 'JED', 'ok'); sfx('ok');
  await c.wait(900);
  // part 2: Belt 6
  await c.anim(ct, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
  ct.innerHTML = `<div class="cctv live frame" style="position:absolute;left:0;top:0;width:1100px;height:520px"></div>`;
  bg(c.anim(ct, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 }));
  narr(p ? '5:15 PM · Jeddah · Belt 6' : '7:25 PM · Jeddah · Belt 6');
  const belt = beltEl({ lit: true, sign: 'BELT 6', sub: p ? 'Partner · Riyadh' : 'SH 1049 · Riyadh', cnt: '0 min' }); $('.frame', ct).appendChild(belt);
  const cv = $('.cv', belt);
  ['', 'b2', 'b3'].forEach((cls, i) => bg(bagRun(c, belt, cls, 6000, i * 700)));
  await Promise.all([c.tween(2500, f => { cv.textContent = Math.round(12 * f) + ' min'; }, lin), c.hud(G6HUD(STATE), 2500)]);
  if (D) {
    const dn = h(`<div class="xr note" style="left:0;top:556px"><span class="live">Sahab · now</span> Your bag is on Belt 6, coming out now.</div>`); ct.appendChild(dn);
    sfx('toast'); announce('Sahab: Your bag is on Belt 6, coming out now.'); await fadeIn(c, dn); await c.wait(700);
  }
  const W = belt.clientWidth;
  const hb = h(`<div class="bag hero"><i class="btag"></i></div>`); belt.appendChild(hb);
  await c.anim(hb, [{ transform: 'translateX(-160px)' }, { transform: `translateX(${W / 2 - 65}px)` }], { duration: 2000, easing: EASE.out });
  belt.classList.add('stop'); sfx('ok');
  await c.say('Twelve minutes at Belt 6. There it is. The bisht.', { pose: 'happy', fx: ['bounce'] });
  const cr = h(`<div class="xr note" style="left:0;top:${D ? 640 : 556}px">Sorry for changing your day. <b>SAR 300 credit added.</b> No form needed.</div>`); ct.appendChild(cr);
  sfx('chime'); announce(cr.textContent);
  await c.anim(cr, [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: EASE.out });
  await c.think('And SAR 300 credit, before I even asked. For a flight change.', { pose: 'think' });
  await c.cont('Next', { auto: true, small: true });
} },
{ id: 'G7', ch: 6, zone: 'good', mode: 'stage', pose: 'happy', narr: '10:30 PM · Qasr Al‑Lulu Hall · The zaffa', hud: G7HUD, run: async (c, el) => {
  const E = STATE.enh.has('E');
  el.innerHTML = `<div class="content">
    <div class="gl" style="position:absolute;left:0;top:0;width:520px;height:840px;display:grid;place-items:center">
      <div style="position:absolute;width:560px;height:560px;border-radius:50%;background:radial-gradient(closest-side,rgba(212,160,23,.45),transparent)"></div>
      <span class="swatch swok sw" style="position:absolute;width:160px;height:160px"></span></div>
    <div style="position:absolute;left:560px;top:60px;width:600px">
      <div class="eyebrow">It’s tonight</div>
      <h1 class="h2" style="margin:12px 0 30px;font-size:66px">The bisht. On my son. On time.</h1>
      <div class="bub staff gb" style="opacity:0"><span class="who">Fawzan · the groom</span>Yuba, you made it. Put it on me yourself.</div>
      ${E ? `<div class="chip" style="margin-top:24px">${ICON('heart')} Big-day flag · crew sent a card: Mabrook</div>` : ''}
    </div></div>`;
  const gr = groomEl(); $('.gl', el).appendChild(gr);
  await c.hud({ clock: T(22, 30) }, 1200);
  const sw = $('.sw', el);
  await c.anim(sw, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(3)', opacity: 0 }], { duration: 700, easing: EASE.io });
  sfx('arp'); confetti(c); M.fx('bounce');
  await c.anim(gr, [{ opacity: 0, transform: 'translateY(-40px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: EASE.out });
  await Promise.all($$('.zari', gr).map(z => c.anim(z, [{ strokeDashoffset: z.getAttribute('stroke-dashoffset') }, { strokeDashoffset: 0 }], { duration: 1200, easing: EASE.io })));
  $$('.zari', gr).forEach(z => z.style.strokeDashoffset = 0);
  await fadeIn(c, $('.gb', el), { y: 16, d: 350 });
  announce('Fawzan: Yuba, you made it. Put it on me yourself.');
  await c.think('I dressed him myself. Like my father dressed me. مبروك يا فوزان.', { pose: 'happy', fx: ['sparkle'] });
  await c.cont('Next', { auto: true, small: true });
} },
{ id: 'G8', ch: 6, zone: 'good', mode: 'stage', pose: 'happy', hud: G7HUD, run: async (c, el) => {
  el.innerHTML = `<div class="content"><div class="eyebrow">In the rollout…</div><h2 class="h2" style="margin:12px 0 34px">Clean rollout. Nothing got in my way.</h2><div class="bl"></div></div>`;
  const b = h(`<div class="fbeat clean g2">${SQ('check')}<div><b>Every fix landed in the right order.</b><span>Live truth first, then the honest alert, then the rebooking, then the bag, then the recovery.</span></div></div>`);
  $('.bl', el).appendChild(b); await fadeIn(c, b);
  await c.say('Clean rollout. Nothing got in my way.', { pose: 'happy' });
  await c.think('They had my back. From 12:46.', { pose: 'happy' });
  await c.cont('See the impact', { auto: true });
} },
{ id: 'I0', ch: 6, zone: 'good', mode: 'hero', pose: 'intro', noHud: true, run: bridge({ eyebrow: 'Impact', title: 'One customer. Two airlines.', lines: ['One father. Two versions of Sahab. Now multiply me by 160 passengers on one cancelled flight.'], poses: ['intro'], btn: 'Show the numbers' }) },
{ id: 'I1', ch: 6, zone: 'good', mode: 'guide', pose: 'intro', noHud: true, run: (c, el) => impact(c, el) },
{ id: 'E1', ch: 6, zone: 'good', mode: 'hero', pose: 'intro', noHud: true, run: async (c, el) => {
  el.innerHTML = `<div class="herobox"><div class="eyebrow e0">The takeaway</div>
    <div class="h2 e1" style="margin-top:14px;max-width:1000px">Tell me the minute you know. Make certainty the&nbsp;product.</div>
    <div style="display:flex;gap:18px;align-items:center;margin-top:30px" class="e2"></div></div>`;
  $$('.e0,.e1,.e2', el).forEach((e, i) => bg(fadeIn(c, e, { delay: i * 200 })));
  await c.say('Last time, I found out four hours after Ops did.', { pose: 'disappointed' });
  await c.say('Shukran for fixing my son’s wedding day. Yalla, tell the next person!', { pose: 'happy', fx: ['sparkle'] });
  const row = $('.e2', el);
  const btn = h(`<button class="btn">Play again <span class="arr">${ICON('tradein')}</span></button>`); row.appendChild(btn);
  const tapP = c.tap(btn);
  if (CFG.mode === 'kiosk') await Promise.race([tapP, c.wait(45000)]); else await tapP;
  M.fx('wave'); c.say('مع السلامة! Ma’a salama!', { bg: true, pose: 'intro' });
  await c.wait(1200);
  showAttract();
} },
];

/* ===================== FIX TOUR (the host explains the build order) ===================== */
async function fixTour(c, el) {
  el.innerHTML = `<div class="full guide"><div class="eyebrow">Fix It · the build order</div><h2 class="h2" style="margin-top:8px">Five fixes. This order. Here’s why.</h2>
    <div class="tl">${TL.map(p => `<div class="tlp"><i aria-hidden="true">${ICON(p[0])}</i>${p[1]}<small>${p[2]}</small></div>`).join('')}</div>
    <div class="rcs">${FIXES.map((f, i) => `<div class="rc fix g2"><div class="n">0${i + 1}</div><h3>${f.t}</h3><p>${f.p}</p></div>`).join('')}<div class="rc ctacell"></div></div></div>`;
  const pins = $$('.tlp', el), cards = $$('.rc.fix', el);
  await Promise.all(pins.map((p, i) => fadeIn(c, p, { delay: i * 90, y: 10 })));
  await c.say('Five fixes. Order matters. Watch the gaps close.', { pose: 'intro' });
  for (const [i, f] of FIXES.entries()) {
    announce(`Fix ${i + 1}: ${f.t}. ${f.p}`);
    bg(fadeIn(c, cards[i], { d: 450 }));
    f.pins.forEach(k => { pins[k].classList.add('ok'); $('small', pins[k]).textContent = 'fixed'; });
    await c.say(f.r, { pose: i === 4 ? 'happy' : 'intro' });
  }
  await c.say('Not on the list: more call staff, bigger vouchers. Same late truth.', { pose: 'think' });
  await c.cont('Next', { auto: true, host: $('.ctacell', el), style: 'position:static' });
}

/* ===================== ENHANCEMENT PICKER ===================== */
async function enhancementPicker(c, el) {
  STATE.enh = new Set(); STATE.fly = 's';
  el.innerHTML = `<div class="full guide"><div class="eyebrow">Make it memorable</div><h2 class="h2" style="margin-top:8px;font-size:56px">Add 1 to 3 extras to my journey.</h2>
    <p class="body" style="margin-top:6px;font-size:26px">Each one changes what happens to me in the replay.</p>
    <div class="eg"></div><div class="cta"><span class="chip cnt" aria-live="polite"></span></div></div>`;
  const grid = $('.eg', el), cnt = $('.cnt', el), cta = $('.cta', el);
  const go = h(`<button class="btn" disabled>Build my better day <span class="arr">${ICON('chev')}</span></button>`); cta.appendChild(go);
  const cards = ENHANCEMENTS.map(e => { const b = h(`<button class="ec" aria-pressed="false" data-id="${e.id}">${SQ(e.ic)}<b>${e.t}</b><span>${e.s}</span></button>`); grid.appendChild(b); return b; });
  await Promise.all(cards.map((b, i) => fadeIn(c, b, { delay: i * 70, y: 16 })));
  c.say('Pick up to three. Each one changes my replay.', { bg: true, pose: 'intro' }).catch(() => {});
  const upd = () => { const n = STATE.enh.size; cnt.innerHTML = `<span class="pips">${[0, 1, 2].map(i => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>${n} of 3 chosen`; go.disabled = !n; if (n) ring(go); else unring(); };
  upd();
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.ec'); if (!b) return;
    const id = b.dataset.id, E = ENHANCEMENTS.find(x => x.id === id);
    if (STATE.enh.has(id)) { STATE.enh.delete(id); b.animate([{ transform: 'scale(.97)' }, { transform: 'none' }], { duration: 160 }); c.say('Changed your mind? Fine.', { bg: true, pose: 'think' }).catch(() => {}); }
    else if (STATE.enh.size >= 3) { sfx('bad'); cnt.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], { duration: 280 }); c.say('Three’s the limit. Swap one out.', { bg: true, pose: 'frustrated' }).catch(() => {}); return; }
    else { STATE.enh.add(id); if (!CFG.reduced) { b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 300, easing: EASE.over }); $('.sq', b).animate([{ transform: 'scale(1.4) rotate(-10deg)' }, { transform: 'none' }], { duration: 300, easing: EASE.over }); } c.say(E.r, { bg: true, pose: id === 'E' ? 'think' : 'happy' }).catch(() => {}); }
    b.setAttribute('aria-pressed', STATE.enh.has(id)); sfx('tap'); upd();
  });
  await c.tap(go, { ring: false, primary: go });
  unring(); sfx('ok');
  await c.say('Right. Let’s replay my day. Your Sahab this time.', { pose: 'happy', fx: ['sparkle'] });
}

/* ===================== IMPACT DASHBOARD ===================== */
async function impact(c, el) {
  const p = STATE.fly === 'p', e = STATE.enh, F = e.has('F'), D = e.has('D'), r = recommend();
  const rows = [
    ['First message', '4 h 17 min after Ops', '5 min after Ops'],
    ['Time at the airport', '6 h 45 min', p ? (F ? '1 h' : '1 h 15 min') : (F ? '1 h 10 min' : '1 h 30 min')],
    ['Queues & holds', '3 h 45 min', F ? 'none' : '4 min'],
    ['Landed in Jeddah', '10:15 PM', p ? '5:15 PM' : '7:25 PM'],
    ['The bag', '3 days late', D ? 'tracked · 12 min' : 'Belt 6 · 12 min'],
    ['Compensation*', 'SAR 150 · day 9', 'SAR 300 · same day'],
    ['Stress peak', '100', String(Math.round(STATE.goodPeak))],
    ['The zaffa', `${ICON('x')} Missed`, `${ICON('check')} Front row`],
    ['Extras added', '—', [...e].map(id => ENHANCEMENTS.find(x => x.id === id).t).join(', ') || 'none'],
  ];
  el.innerHTML = `<div class="full guide"><div class="eyebrow">Impact</div><h2 class="h2" style="margin-top:8px;font-size:56px">Same customer. Same day. Two companies.</h2>
    <table class="itab"><thead><tr><th></th><th class="b"><span>Before · Sahab today</span></th><th class="a"><span>After · your build</span></th></tr></thead><tbody>
    ${rows.map(rw => `<tr><td>${rw[0]}</td><td class="bf"><s>${rw[1]}</s></td><td class="af" style="${rw[0] === 'Extras added' ? 'font-size:19px;line-height:1.25' : ''}">${rw[2]}</td></tr>`).join('')}</tbody></table>
    <div class="ill" style="position:absolute;left:0;bottom:0">*Prices, compensation and business figures are illustrative.</div>
    <div class="gaugebox g3">
      <div class="eyebrow" style="color:var(--muted)">Would recommend · 0–10</div>
      <svg viewBox="0 0 400 230" style="width:360px;margin-top:10px" role="img" aria-label="Would recommend: from 1 to ${r}">
        <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#DC2626"/><stop offset=".5" stop-color="#F59E0B"/><stop offset="1" stop-color="#16A34A"/></linearGradient></defs>
        <path d="M40 200 A160 160 0 0 1 360 200" fill="none" stroke="url(#gg)" stroke-width="26" stroke-linecap="round"/>
        ${Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (1 - i / 10); return `<line x1="${200 + Math.cos(a) * 128}" y1="${200 - Math.sin(a) * 128}" x2="${200 + Math.cos(a) * 138}" y2="${200 - Math.sin(a) * 138}" stroke="#7A4A2C" stroke-width="2" opacity=".5"/>`; }).join('')}
        <g class="needle" transform="rotate(${-90 + 18 * 1} 200 200)"><line x1="200" y1="200" x2="200" y2="70" stroke="#1E1216" stroke-width="8" stroke-linecap="round"/><circle cx="200" cy="200" r="18" fill="#FFF9F2" stroke="#1E1216" stroke-width="3"/></g></svg>
      <div class="gv"><span class="gnum">1</span><span style="font-size:40px;color:var(--muted)"> / 10</span></div>
      <div class="biz"><b>Before:</b> 160 passengers, 1 desk, ~SAR 110,000 in refunds and claims, 160 retold stories.<br><b>After:</b> 148 of 160 rebooked in 5 minutes, paid the same day, and a father who recommends us.</div>
    </div><div class="cta" style="right:552px"></div></div>`;
  const trs = $$('.itab tbody tr', el);
  trs.forEach(tr => tr.style.opacity = 0);
  bg(fadeIn(c, $('.gaugebox', el), { y: 20 }));
  c.say('Left column is my first wedding day. Right column is yours.', { bg: true, pose: 'intro' });
  for (const tr of trs) { await fadeIn(c, tr, { y: 10, d: 300 }); $('s', tr).style.setProperty('--k', 1); await c.wait(140); }
  const nd = $('.needle', el), num = $('.gnum', el);
  sfx('arp');
  const back = (q) => { const s = 1.70158 * 1.2; return 1 + (s + 1) * Math.pow(q - 1, 3) + s * Math.pow(q - 1, 2); };
  await c.tween(1600, q => { const v = 1 + (r - 1) * q; nd.setAttribute('transform', `rotate(${-90 + 18 * v} 200 200)`); num.textContent = Math.round(clamp(v, 0, 10)); }, back);
  announce(`Would recommend: from 1 to ${r} out of 10.`);
  M.fx('bounce');
  await c.say(r >= 9 ? `${r} out of 10. Would I recommend them now? Wallah, yes.` : r >= 7 ? `${r} out of 10. Up from 1. I’d tell my family.` : `${r} out of 10. Better. Still room to win me.`, { pose: r >= 7 ? 'happy' : 'intro', fx: r >= 9 ? ['sparkle'] : [] });
  await c.cont('Finish', { host: $('.full', el), style: 'right:552px;bottom:0' });
}
