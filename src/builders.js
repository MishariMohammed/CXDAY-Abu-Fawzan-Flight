/* ===================== BUILDERS: PHONE & APP SCREENS ===================== */
function phoneEl(x = 60, y = 0) {
  return h(`<div class="phone" style="left:${x}px;top:${y}px"><div class="island"></div>
    <div class="screen"><div class="status"><span class="st-time">${fmtClock(hud.clock).t}</span><span>5G <b class="batt"><i style="width:${Math.round(24 * .71)}px"></i></b></span></div>
    <div class="app"></div><div class="tabbar" aria-hidden="true"><span class="on">${ICON('home')}</span><span>${ICON('ticket')}</span><span>${ICON('bag')}</span><span>${ICON('user')}</span></div><div class="toast" role="status"></div><i class="homebar"></i></div></div>`);
}
function toast(ph, t) {
  const el = $('.toast', ph); el.textContent = t; el.classList.add('on'); sfx('toast'); announce(t);
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600);
}
const BISHT_PATH = 'M180 30 C120 30 70 60 40 120 L10 400 L150 400 L170 140 L190 140 L210 400 L350 400 L320 120 C290 60 240 30 180 30 Z';
const BISHT = (size) => `<svg viewBox="0 0 360 420" width="${size}" height="${Math.round(size * 420 / 360)}" aria-hidden="true"><path d="${BISHT_PATH}" fill="#14100E"/><path d="M180 30 C140 34 120 60 150 400 M180 30 C220 34 240 60 210 400" fill="none" stroke="#D4A017" stroke-width="16" stroke-linecap="round"/><path d="M150 400 L10 400 M210 400 L350 400" fill="none" stroke="#D4A017" stroke-width="12"/></svg>`;
function goalCard(extra = '') {
  return `<div class="panel goal"><span class="sq" style="background:#14100E14">${BISHT(46)}</span><div><div class="gl">Abu Fawzan needs</div><div class="gv">Jeddah by 9 PM</div><div class="gc"><span>SH 1043</span><span>Seat 12A</span><span><i></i>1 bag · the bisht</span>${extra}</div></div></div>`;
}

/* ===================== BUILDERS: MAP HELPERS ===================== */
function setPin(svg, id, st) {
  const g = $(`.pin[data-b="${id}"]`, svg); if (!g) return;
  g.classList.remove('x', 'ok', 'hot'); if (st) g.classList.add(st);
}
function routePrep(svg, sel = '.r-main', cls) {
  const g = $(sel, svg), ps = $$('path', g), p = $('.route', g), L = p.getTotalLength();
  g.style.opacity = 1;
  ps.forEach(q => { q.style.strokeDasharray = L; q.style.strokeDashoffset = L; if (cls) q.classList.add(cls); });
  return { p, L, draw: (f) => { ps.forEach(q => { q.style.strokeDashoffset = L * (1 - f); }); } };
}
function walk(c, el, frames, ms) { return c.anim(el, frames, { duration: ms, easing: 'linear' }); }

/* ===================== SAHAB VISUAL BUILDERS (use the reference's h, $, $$, c.anim, c.tween, c.wait, EASE, CFG, sfx, announce) ===================== */
const KSA = 'M125 180 L150 75 L250 40 L400 95 L535 190 L625 195 L685 225 L720 250 L775 315 L810 340 L840 410 L880 440 L930 505 L1060 515 L1080 550 L1050 650 L900 700 L750 720 L650 795 L525 780 L465 775 L440 830 L375 700 L310 635 L255 575 L225 475 L160 400 L125 350 L65 260 L45 245 L50 180 Z';
const CITY = { RUH: [635, 415], JED: [260, 575], AHB: [425, 740], MED: [280, 425], DMM: [805, 330] };
const ARC = 'M635 415 Q 470 300 260 575';            // RUH -> JED, bows north like a real great-circle sketch
const PLANE = '<path d="M30 0 C30 -3 26 -5 20 -5 L6 -5 L-8 -26 L-15 -26 L-7 -5 L-20 -5 L-27 -14 L-32 -14 L-28 0 L-32 14 L-27 14 L-20 5 L-7 5 L-15 26 L-8 26 L6 5 L20 5 C26 5 30 3 30 0 Z"/><path class="tail" d="M-27 -14 L-32 -14 L-28 0 L-24 0 Z"/>';

// 1. Route map. o: {x, y, w, aog:true (bad: Abha AOG beacon), calm:true (good: green route)}
function routeMapEl(o = {}) {
  const w = o.w || 1100, x = o.x ?? 30, y = o.y ?? 0;
  const pin = (k, cls = '') => `<g class="pin ${cls}" data-b="${k}" transform="translate(${CITY[k][0]},${CITY[k][1]})"><ellipse class="shadow" cx="0" cy="22" rx="18" ry="5"/><circle class="ring" r="20"/><circle class="core" r="8"/></g>`;
  return h(`<svg class="map rmap" viewBox="0 0 1100 860" style="left:${x}px;top:${y}px;width:${w}px;height:${w * 860 / 1100}px" role="img" aria-label="Map of Saudi Arabia. Flight from Riyadh west to Jeddah, about 850 kilometres.">
    <path class="land" d="${KSA}"/>
    <text class="sea" x="170" y="770" transform="rotate(50 170 770)">Red Sea</text>
    <text class="sea" x="905" y="380">Arabian Gulf</text>
    <circle class="city" cx="${CITY.MED[0]}" cy="${CITY.MED[1]}" r="6"/><text class="dist" x="${CITY.MED[0] - 14}" y="${CITY.MED[1] + 8}" text-anchor="end" opacity=".7">Madinah</text>
    <circle class="city" cx="${CITY.DMM[0]}" cy="${CITY.DMM[1]}" r="6"/><text class="dist" x="${CITY.DMM[0] - 16}" y="${CITY.DMM[1] + 8}" text-anchor="end" opacity=".7">Dammam</text>
    <path class="plan" d="${ARC}"/>
    <text class="km" x="470" y="340" text-anchor="middle">≈ 850 KM · 1 H 45</text>
    <g class="rt r-main" style="opacity:0"><path class="route-glow ${o.calm ? 'calm' : ''}" d="${ARC}"/><path class="route ${o.calm ? 'calm' : ''}" d="${ARC}"/><path class="route-core" d="${ARC}"/></g>
    ${o.aog ? `<g class="aog" transform="translate(${CITY.AHB[0]},${CITY.AHB[1]})"><circle class="ring" r="18"/><circle class="ring b" r="18"/><circle class="core" r="9"/><text x="24" y="-14">HZ-SHB · AOG</text></g>
      <text class="dist" x="${CITY.AHB[0] + 24}" y="${CITY.AHB[1] + 30}">Abha</text>` : ''}
    ${pin('RUH', 'hot')}<text class="dist key" x="${CITY.RUH[0] + 30}" y="${CITY.RUH[1] + 10}">Riyadh · RUH</text>
    ${pin('JED')}<text class="dist key" x="${CITY.JED[0] - 30}" y="${CITY.JED[1] + 10}" text-anchor="end">Jeddah · JED</text>
    <g class="plane" style="opacity:0"><g class="pb">${PLANE}</g></g>
  </svg>`);
}
// Fly the plane along the arc. f: 0..1. Same easing/smoothing trick as the reference carAt().
function planeAt(svg, path, f) {
  const pl = $('.plane', svg); pl.style.opacity = 1;
  const L = path.getTotalLength(), ff = clamp(f, 0, 1), pt = path.getPointAtLength(ff * L);
  const a = path.getPointAtLength(clamp(ff - .01, 0, 1) * L), b = path.getPointAtLength(clamp(ff + .01, 0, 1) * L);
  const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  const s = 1 + .35 * Math.sin(Math.PI * ff);               // "climbs" (bigger) mid-flight, shrinks on approach
  pl.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
  $('.pb', pl).setAttribute('transform', `rotate(${ang.toFixed(1)}) scale(${s.toFixed(3)})`);
}
/* G6 usage:
  const map = routeMapEl({ calm: true }); ct.appendChild(map);
  const r = routePrep(map);                                          // reference helper: dasharray draw
  await c.tween(1400, f => r.draw(f), eio);                          // 1.4 s draw RUH->JED
  await Promise.all([ c.tween(4200, f => planeAt(map, r.p, f), eio), c.hud({ clock: T(19, 25) }, 4200) ]);
  setPin(map, 'JED', 'ok'); sfx('ok');
  c.anim($('.pin[data-b=JED]', map), [{ transform: 'translate(260px,575px) scale(1.5)' }, { transform: 'translate(260px,575px) scale(1)' }], { duration: 320, easing: EASE.over });
  Reduced motion: c.tween resolves at f=1, so the route is drawn and the plane parks at JED in one frame. */

// 2. Departures board. rows: [time, flight, to, gate, status, cls, hl?]
function fidsEl(rows, o = {}) {
  const cells = (t) => [...t].map(ch => ch === ' ' ? '<i class="ch sp"> </i>' : `<i class="ch">${ch}</i>`).join('');
  return h(`<div class="fids" style="left:${o.x ?? 30}px;top:${o.y ?? 0}px" role="table" aria-label="Departures board">
    <div class="fh"><span class="fl"><svg viewBox="0 0 24 24"><path d="M2 16l20-6-3-2-7 2-6-6-2 1 3 7-4 1-2-2-1 1z"/></svg>Departures <span class="ar" lang="ar">المغادرة</span></span><span class="fc">${o.clock || '15:40'}</span></div>
    <div class="fr hd"><span>Time</span><span>Flight</span><span>To</span><span>Gate</span><span>Status</span></div>
    ${rows.map(r => `<div class="fr ${r[6] ? 'hl' : 'dim'}" role="row"><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span><span>${r[3]}</span><span class="st ${r[5] || ''}" aria-live="${r[6] ? 'polite' : 'off'}">${cells(r[4].padEnd(12))}</span></div>`).join('')}
    ${o.ticker ? `<div class="tick"><span>${o.ticker}</span></div>` : ''}
  </div>`);
}
// Split-flap a status cell to new text. 3 scramble frames per char, 35 ms stagger, ~0.6 s total.
async function flapTo(c, st, text, cls) {
  const chs = $$('.ch', st), TX = text.toUpperCase().padEnd(chs.length), AZ = 'ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789:';
  st.className = 'st ' + (cls || ''); st.setAttribute('aria-label', text);
  if (CFG.reduced || c.skip) { chs.forEach((e, i) => { e.textContent = TX[i]; e.className = TX[i] === ' ' ? 'ch sp' : 'ch'; }); return; }
  sfx('flap');                                                       // optional: short click, reuse 'tap' if no flap sfx
  await Promise.all(chs.map(async (e, i) => {
    await c.wait(i * 35);
    for (let k = 0; k < 3; k++) { e.className = 'ch'; e.textContent = AZ[(Math.random() * AZ.length) | 0]; void e.offsetWidth; e.classList.add('flip'); await c.wait(60); }
    e.textContent = TX[i]; e.className = TX[i] === ' ' ? 'ch sp' : 'ch flip';
  }));
}
/* B4 usage:
  const f = fidsEl([['15:25','SH 1121','DAMMAM','21','BOARDING','ok'],['16:10','SH 1043','JEDDAH','23','ON TIME','ok',1],['16:35','SH 1137','ABHA','27','ON TIME','ok'],['17:40','SH 1049','JEDDAH','25','ON TIME','ok']]);
  const st = $('.fr.hl .st', f);
  await flapTo(c, st, 'DELAYED', 'warn');            // 3:40
  await flapTo(c, st, 'NEW 17:00', 'warn');          // 3:55
  await flapTo(c, st, 'NEW 17:30', 'warn');          // 4:25
  B6: await flapTo(c, st, 'CANCELLED', 'bad'); $('.fr.hl', f).classList.add('blink'); */

// 3. Ops control panel. Put inside the reference .cctv frame (keeps .rec/.cam/.scan/.lb/.cap).
function occEl() {
  const mini = `<svg viewBox="0 0 1100 860" aria-hidden="true"><path class="land" d="${KSA}"/>
    <circle class="ac" cx="635" cy="415" r="16"/><circle class="ac" cx="260" cy="575" r="16"/><circle class="ac" cx="805" cy="330" r="16"/>
    <circle class="ac tgt" cx="${CITY.AHB[0]}" cy="${CITY.AHB[1]}" r="20"/></svg>`;
  const row = (t, f, s, st, cls = '') => `<div class="row ${cls}"><span>${t}</span><span>${f}</span><span>${s}</span><span class="s">${st}</span></div>`;
  return h(`<div class="occ" aria-label="Sahab Ops Control screen">
        <div class="mini">${mini}</div>
    <div class="tbl">
      <div class="row hd"><span>Tail</span><span>Flight</span><span>Stn</span><span>Status</span></div>
      ${row('HZ-SHA', 'SH 1021', 'RUH', 'SERVICEABLE')}
      ${row('HZ-SHB', 'SH 1043', 'ABHA', 'SERVICEABLE', 'key ln')}
      ${row('HZ-SHC', 'SH 1035', 'DMM', 'SERVICEABLE')}
      ${row('HZ-SHD', 'SH 1049', 'JED', 'SERVICEABLE')}
      <div class="kv ln k1"><span>Part ETA</span><b>from JED · ~7:00 PM</b></div>
      <div class="kv ln k2"><span>Spare aircraft</span><b>none until 8:00 PM</b></div>
      <div class="kv notify ln k3"><span>12:41 PM · Customer notification</span><b>NOT SENT</b></div>
    </div></div>`);
}
/* B2 timeline (inside the right .split pane):
  t0      fadeIn panes (reference fadeIn, 400 ms each, both at once)
  +600    row HZ-SHB ticks in: c.anim(row,[{opacity:0,transform:'translateX(-24px)'},{opacity:1,transform:'none'}],{duration:350})
          cap: 'An engineer in Abha reports a hydraulic leak.'
  +2200   status flip (same rotateX trick as the reference shelf tag, 180 + 220 ms):
            await c.anim(s,[{transform:'rotateX(0)'},{transform:'rotateX(90deg)'}],{duration:180});
            row.classList.add('aog'); s.textContent='AOG · HYDRAULIC LEAK'; $('.tgt',occ).classList.add('x');
            await c.anim(s,[{transform:'rotateX(-90deg)'},{transform:'rotateX(0)'}],{duration:220}); sfx('bad');
          cap: 'Ops marks the aircraft grounded.'
  +1200   .k1 then .k2 fade in, 300 ms each, 250 ms stagger
  +1400   .k3 slams in: [{opacity:0,transform:'scale(1.8)'},{opacity:1,transform:'none'}] 420 ms EASE.over; NOT SENT starts blinking
          cap: '<b>12:41 PM</b> · Customer notification: <b>NOT SENT</b> · awaiting final decision'
  The left pane phone's "On time" pill pulses once (scale 1.06, 400 ms) at the same instant: same minute, two truths. */

// 4. Baggage belt. o: {lit:true (good CAM 04), sign, sub, gate:true (scanner arch), cnt:'0 min'}
function beltEl(o = {}) {
  return h(`<div class="belt ${o.lit ? 'lit' : ''}">
    <div class="sign">${o.sign || 'BELT 6'} <small>${o.sub || 'SH 1057 · Riyadh'}</small></div>
    ${o.cnt != null ? `<div class="cnt"><small>Waiting</small><span class="cv">${o.cnt}</span></div>` : ''}
    <div class="track"><div class="slats"></div></div>
    ${o.gate ? '<div class="gate"><div class="lbl">SORTER 3 · SCAN</div><div class="lz"></div></div>' : ''}
  </div>`);
}
// Send one bag across. ms = crossing time (belt speed is 100 px/s: keep ms ~= distance*10 so bags don't skate).
function bagRun(c, belt, cls = '', ms = 9000, delay = 0) {
  const b = h(`<div class="bag ${cls}">${cls.includes('hero') ? '<i class="btag"></i>' : ''}</div>`); belt.appendChild(b);
  const W = belt.clientWidth;
  return c.anim(b, [{ transform: 'translateX(-160px)' }, { transform: `translateX(${W + 40}px)` }], { duration: ms, delay, easing: 'linear' }).then(() => b.remove());
}
/* B8 (bad, Belt 6): beltEl({ sign:'BELT 6', sub:'SH 1057 · Riyadh', cnt:'0 min' }) in a plain .cctv frame (not live).
   Loop: 7 plain bags, staggered 1.3 s, 9 s crossing (cls '', 'b2', 'b3' cycled). Counter tween 0 -> 41 min over 6 s with the HUD clock 10:15 -> 10:56.
   At HUD 10:30 the zaffa cell flips MISSED. After the last bag: belt.classList.add('stop'); sign text -> 'ALL BAGS FROM SH 1057 DELIVERED' (fade 300 ms); .cnt.hot.
   No gold bag ever appears; that absence is the point.
   G5 (good, CAM 04): beltEl({ lit:true, sign:'SORTER 3', sub:'Hold loading · T2', gate:true }) inside .cctv.live.
   Hero bag (cls 'hero') runs to the gate centre (3.2 s), pauses: gate.classList.add('scan') (1.8 s, laser x2), then gate.classList.add('ok') + sfx('ok'),
   cap 2 ('re-routed from SH 1043 to SH 1049 at 12:48 PM'), then continues off-right (3 s); cap 3 '4:46 PM · Loaded · SH 1049 · Hold 2 ✓'. */

// Bag tracker list (phone or side panel). steps: [label, time, cls]
const bagTrack = (steps) => `<ol class="btrk">${steps.map(s => `<li class="${s[2] || ''}">${s[0]}<small>${s[1]}</small></li>`).join('')}</ol>`;
/* G5/G6 (extra D): steps = [['Checked in · Riyadh T2','4:10 PM'],['Re-routed to SH 1049','12:48 PM','re'],['Sorted · Sorter 3','4:31 PM'],['Loaded · SH 1049 · Hold 2','4:46 PM'],['On Belt 6 · Jeddah','7:37 PM']]
   Reveal: add .on to each li, 450 ms stagger; the current one also gets .now. */

// 5. Phone: Sahab trip card and lock-screen alert (inject into the reference phoneEl() .app)
const appbarSH = (tag = '') => `<div class="appbar sahab"><svg viewBox="0 0 34 34" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M9 22a6 6 0 0 1 1-12 8 8 0 0 1 15 3 4.5 4.5 0 0 1-1 9z"/></svg><b>SAHAB</b><span>Airways</span>${tag ? `<em>${tag}</em>` : ''}</div>`;
function scrTrip(o = {}) {   // o: {flt, dep, arr, seat, gate, st:'On time', cls:'' | 'warn' | 'bad', src:'Last update 9:00 AM' | 'Live from Ops · just now'}
  return `${appbarSH(o.tag)}<div class="pg"><div style="font:700 26px var(--f-display);margin:4px 0 14px">Good afternoon, Abu Fawzan</div>
    <div class="trip"><div class="tt"><span>${o.flt || 'SH 1043'} · THU</span><span>Seat ${o.seat || '12A'}</span></div>
      <div class="od"><b>RUH<small>${o.dep || '4:10 PM'}</small></b><svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 13l20-2-3-3h-4L9 3H7l3 5H5L3 6H1l1 5z"/></svg><b>JED<small>${o.arr || '5:55 PM'}</small></b></div>
      <div class="meta"><span>Gate<b>${o.gate || '23'}</b></span><span>Boarding<b>${o.board || '3:40 PM'}</b></span><span>Bag<b>${o.bag || '1 bag'}</b></span></div>
      <div class="sbar ${o.cls || ''}"><span class="sv">${o.st || 'On time'}</span><span class="src">${o.src || 'Updated 9:00 AM'}</span></div></div>
    <button class="pbtn sh-btn" style="background:var(--sh-teal)">${o.btn || 'Check in'}</button></div>`;
}
function lockAlert(o = {}) {  // o: {time:'12:46', date:'Thursday 2 October', title, body, actions:[...], bad:false}
  return h(`<div class="lock"><div class="lt">${o.time || '12:46'}</div><div class="ld">${o.date || 'Thursday'}</div>
    <div class="notif sh ${o.bad ? 'bad' : ''}" role="status"><span class="ni"><svg viewBox="0 0 34 34" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M9 22a6 6 0 0 1 1-12 8 8 0 0 1 15 3 4.5 4.5 0 0 1-1 9z"/></svg></span>
      <div style="flex:1;min-width:0"><div class="nh"><span>Sahab</span><span>now</span></div><b>${o.title || ''}</b><span>${o.body || ''}</span>
      ${(o.actions || []).length ? `<div class="na">${o.actions.map(a => `<i>${a}</i>`).join('')}</div>` : ''}</div></div></div>`);
}
/* G2 timeline: phone already on screen with scrTrip (live). At t0: append lockAlert(...) with opacity:0, fade lock bg 250 ms,
   then ph.classList.add('buzz') + sfx('toast'); notif slides down via CSS notifIn (550 ms overshoot). Side tag card
   "Ops knew 12:41 · Told me 12:46" fades in +400 ms. Reduced: no buzz, notif appears with the reference's 150 ms fade.
   B6 SMS (bad, 4:58 PM): lockAlert({ bad:true, title:'SH 1043 cancelled', body:'We regret your flight SH 1043 is cancelled. Please contact our call centre on 9200 XXXXX.' }) */


/* ===================== BUILDERS: SAHAB SCENES ===================== */
const bishtBig = () => `<svg viewBox="0 0 360 420" class="bisht" aria-label="Fawzan’s bisht, black with gold zari edging">
  <path d="${BISHT_PATH}" fill="#14100E"/>
  <path class="zari" d="M180 30 C140 34 120 60 150 400 M180 30 C220 34 240 60 210 400" fill="none" stroke="#D4A017" stroke-width="10" stroke-linecap="round" stroke-dasharray="900" stroke-dashoffset="900"/>
  <path class="zari" d="M150 400 L10 400 M210 400 L350 400" fill="none" stroke="#D4A017" stroke-width="6" stroke-dasharray="400" stroke-dashoffset="400"/></svg>`;
// Fawzan, the groom: a faceless sand silhouette in white ghutra + black agal, bisht layered on the shoulders.
function groomEl() {
  return h(`<div class="groom" style="position:relative;width:380px;height:560px;opacity:0">
    <svg viewBox="0 0 380 560" width="380" height="560" style="position:absolute;inset:0" aria-hidden="true">
      <path d="M120 200 L90 560 L290 560 L260 200 Z" fill="#FBFAF6" stroke="#1E1216" stroke-width="3"/>
      <path d="M120 98 Q190 20 260 98 L292 230 Q190 196 88 230 Z" fill="#FBFAF6" stroke="#1E1216" stroke-width="3"/>
      <ellipse cx="190" cy="122" rx="40" ry="48" fill="#C89A6A"/>
      <path d="M156 140 Q190 182 224 140 Q222 168 190 172 Q158 168 156 140 Z" fill="#2A1A12"/>
      <ellipse cx="190" cy="76" rx="66" ry="14" fill="none" stroke="#14100E" stroke-width="10"/>
    </svg>
    <div class="bw" style="position:absolute;left:10px;top:150px;width:360px;height:420px">${bishtBig()}</div></div>`);
}
function flapSet(st, text, cls) {
  const chs = $$('.ch', st), TX = text.toUpperCase().padEnd(chs.length);
  st.className = 'st ' + (cls || ''); st.setAttribute('aria-label', text);
  chs.forEach((e, i) => { e.textContent = TX[i]; e.className = TX[i] === ' ' ? 'ch sp' : 'ch'; });
}
const camChrome = (cam, clock) => `<div class="scan"></div><div class="lb" style="top:0"></div><div class="lb" style="bottom:0"></div>
  <div class="rec"><i></i>REC <span class="cc">${clock}</span></div><div class="cam">${cam}</div><div class="cap"></div>`;
function occPane() {
  const el = h(`<div class="cctv"></div>`);
  el.appendChild(occEl());
  el.insertAdjacentHTML('beforeend', camChrome('CAM · OCC', '12:41:00 PM'));
  return el;
}
// Queue camera: counters (open/closed), a line of people, the visitor's own figure last, a queue chip.
function queuePane(o) {
  const counters = Array.from({ length: o.n }, (_, i) => {
    const open = o.open.includes(i);
    return `<div class="counter" style="left:${40 + o.step * i}px;right:auto;bottom:46%;width:${o.cw}px;height:60px;${open ? '' : 'opacity:.35'}"><span class="cl ${open ? 'open' : 'closed'}">${open ? 'OPEN' : 'CLOSED'}</span><span class="cn">${(o.first || 14) + i}</span></div>`;
  }).join('');
  const people = Array.from({ length: o.q }, (_, i) => `<div class="person${i === o.q - 1 ? ' me' : ''}" style="left:${o.qx + 70 * i}px"><div class="hd"></div><div class="bd"></div></div>`).join('');
  const el = h(`<div class="cctv live q" style="position:absolute;left:${o.x ?? 0}px;top:${o.y ?? 0}px;width:${o.w}px;height:${o.h}px">
    <div class="wall"></div><div class="floor"></div><div class="sign" style="left:40px;right:auto;top:60px">${o.sign}</div>
    ${counters}${people}<div class="qchip">${o.chip}</div></div>`);
  const shuffle = async (c, steps, every = 1200) => {
    for (let k = 0; k < steps; k++) {
      const ps = $$('.person:not(.gone)', el); if (ps.length < 2) return;
      const front = ps[0]; front.classList.add('gone');
      bg(c.anim(front, [{ opacity: 1 }, { opacity: 0, transform: 'translateX(-60px)' }], { duration: 400 }));
      ps.slice(1).forEach(p => { p.style.left = (parseFloat(p.style.left) - 70) + 'px'; bg(c.anim(p, [{ transform: 'translateX(70px)' }, { transform: 'none' }], { duration: 500, easing: EASE.std })); });
      await c.wait(every);
    }
  };
  return { el, shuffle };
}
// Gate 23, good path at 4:46: empty seats, one calm agent, the cancelled sign.
function gatePane() {
  const seats = [12, 22].map(b => Array.from({ length: 8 }, (_, i) => `<div class="seat" style="left:${50 + i * 62}px;bottom:${b}%"></div>`).join('')).join('');
  const el = h(`<div class="cctv live">
    <div class="wall"></div><div class="floor"></div>
    <div class="sign" style="left:40px;right:auto;top:100px">GATE 23</div>
    <div class="sign" style="right:40px;top:100px;color:#B91C1C;font-size:22px">SH 1043 · CANCELLED</div>
    ${seats}
    <div class="counter" style="bottom:22%;width:200px;height:110px"></div>
    <div class="person staff" style="right:96px;bottom:30%"><div class="hd"></div><div class="bd"></div></div>
    ${camChrome('CAM 03 · GATE 23', '4:46 PM')}</div>`);
  return el;
}
// One chat bubble in a dialogue column; keeps at most `max` visible.
async function dlgBub(c, dlg, who, txt, me, hold = 1100, max = 4) {
  const b = h(`<div class="bub ${me ? 'me' : 'staff'}"><span class="who">${who}</span>${txt}</div>`);
  dlg.appendChild(b); while (dlg.children.length > max) dlg.firstChild.remove();
  announce(who + ': ' + b.textContent.slice(who.length));
  await fadeIn(c, b, { y: 16, d: 350 }); await c.wait(hold);
  return b;
}
