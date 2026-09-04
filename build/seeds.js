/* Sinh app/sewing/seed.js + app/finishing/seed.js — moi module 1 file seed.
 *
 * Chay:  node build/seeds.js
 *
 * Nguon (deu sinh tu file Excel goc, sua bang goc thi sinh lai 3 file nay):
 *   build/data/psched.js   ke hoach san xuat  -> don hang tren tung chuyen
 *   build/data/khc.js      tac nghiep cat da upload
 *   build/data/mlist.js    danh muc phu lieu (MATERIALS LIST)
 *
 * Cac ham o duoi la ban COPY nguyen van cua build/legacy/script.js (ban 1 file cu),
 * nen so lieu dong bang o day trung khop voi so lieu ban do dang hien.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

global.window = {};
require(path.join(__dirname, 'data/psched.js'));
require(path.join(__dirname, 'data/khc.js'));
require(path.join(__dirname, 'data/mlist.js'));
const PSCHED = window.PSCHED, KHC = window.KHC, MLIST = window.MLIST;

/* ---- copy nguyen van tu build/legacy/script.js --------------------------- */
const SORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];
const SALIAS = { 'VW5159': 'VW5159-M11', '1000199': 'FG-1000199', '1003117': 'FG-1003117' };
const sKey = s => SALIAS[s] || s;
const SIZES = {
  'VW5159-M11': ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
  'VW5202-M5': ['XS', 'S', 'M', 'L', 'XL'],
  'VW3310-W2': ['XS', 'S', 'M', 'L'],
  'FG-1000199': ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'],
  'FG-1003117': ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
  'VW5159-M2': ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
  'D6432SPT51': ['S', 'M', 'L', 'XL', '2XL'],
  _def: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
};
const CUTCOLORS = {
  'VW5159-M11': ['WHITE', 'Black', 'Marshmallow', 'Bourbon', 'Washed Boysenberry'],
  'VW5202-M5': ['Black', 'Charcoal', 'Heather Grey'],
  'VW3310-W2': ['Dusk', 'Fig', 'Onyx'],
  'VW4408-K1': ['Storm', 'Sand', 'Ink'],
  'FG-1000199': ['Navy', 'Black', 'Wine'],
  'FG-1003117': ['Olive', 'Graphite', 'Ceil Blue'],
  'FG-ISABEL-52': ['Navy', 'Black', 'Ciel'],
  'FG-OLIVE-60': ['Olive', 'Graphite', 'Navy'],
  'D6432SPT51': ['Black', 'Navy', 'Ceil Blue'],
  'D6432SPT50': ['Olive', 'Graphite', 'Navy'],
  'D7118WVN22': ['Slate', 'Black', 'Sage'],
  'F25471M1691': ['Midnight', 'Volt', 'White'],
  'CT-ABRZ-88': ['Cinnamon', 'Maritime', 'Black'],
  'LL-ABC-2024': ['True Navy', 'Black', 'Graphite Grey'],
  'LL-PACE-778': ['White', 'Black', 'Pigment'],
  'PT-4471-CAP': ['Forge Grey', 'Black', 'Tidepool'],
  'PT-NANO-33': ['Classic Navy', 'Black', 'Ember'],
  'NK-DF-8890': ['Midnight', 'White', 'Volt'],
  'NK-TECH-201': ['Obsidian', 'Grey', 'Crimson'],
  'ON-CLOUD-5': ['All Black', 'Glacier', 'Rock'],
  'ON-CORE-12': ['Ink', 'Fog', 'Flame'],
};
const DEMAND = {
  'VW5159-M11': { XXS: 34, XS: 1280, S: 2878, M: 2837, L: 1596, XL: 633, '2XL': 84 },
  'VW5159-M2': { XXS: 327, XS: 1295, S: 2333, M: 2175, L: 1085, XL: 411, '2XL': 70 },
  'FG-1000199': { XS: 880, S: 3105, M: 7776, L: 6440, XL: 3980, '2XL': 2235, '3XL': 556, '4XL': 385, '5XL': 170, '6XL': 15 },
  'FG-1003117': { XXS: 945, XS: 4191, S: 7217, M: 6391, L: 3339, XL: 1620, '2XL': 750 },
};
const cutColors = s => CUTCOLORS[sKey(s)] || ['Black', 'Navy', 'Grey'];
const sizesFor = s => SIZES[sKey(s)] || SIZES._def;
function demandTarget(style) {
  const d = DEMAND[sKey(style)]; if (d) return { ...d };
  const sz = sizesFor(style), w = [1, 4, 7, 7, 4, 2, 1], t = {};
  sz.forEach((s, i) => t[s] = (w[i] || 1) * 180);
  return t;
}
function psCode(code) {
  let s = String(code || '').trim();
  s = s.split('(')[0].trim();
  s = s.replace(/\s*\/\s*PO[-\s]*[\d,\s]*$/i, '');
  const m = s.match(/^(.*?[A-Z0-9&])(?=[A-Z][a-z])/); if (m && m[1].length >= 4) s = m[1];
  return s.replace(/[\s&\/+-]+$/, '').trim() || String(code || '');
}
const KBRANDS = ['VUORI', 'FIGS', 'KOLON', 'HELINOX', 'AETHER', 'DESCENTE', 'DISCOVERY', 'COTOPAXI',
  'SANMAR', 'FILA CHINA', 'RIDESTORE', 'LULULEMON', 'PATAGONIA', 'NIKE', 'ON RUNNING', 'KSK', 'KSC'];
function brandOf(o) {
  if (!o) return '';
  if (o.brand && o.brand !== 'OTHER') return o.brand;
  const hay = ((o.note || '') + ' ' + (o.txt || '')).toUpperCase();
  for (let i = 0; i < KBRANDS.length; i++) if (hay.indexOf(KBRANDS[i]) >= 0) return KBRANDS[i];
  const t = String(o.note || '').replace(/^(FW|SS|AW|SP)\d{2}(>(FW|SS|AW|SP)\d{2})?\s*/i, '').replace(/^\d{2}Q\d\s*/i, '');
  const m = t.match(/^[A-Z][A-Z&./ ]{2,24}/);
  return m ? m[0].replace(/\s+(M|MAT|DEL|D)$/, '').trim() : 'OTHER';
}
const genStyleKey = code => psCode(code).toUpperCase();
const genPlanKey = o => genStyleKey(o.code) + '|' + (String(o.po || '').trim() || o.start);
function khcPlansFor(style, plans) {
  const k = sKey(style);
  return plans.filter(p => p.style === style || p.style === k || 'FG-' + p.style === k);
}
function genSection(style, sizes, dem, total, nextId) {
  const ss = SORDER.filter(s => (sizes || []).includes(s)); if (!ss.length || total <= 0) return null;
  const tot = ss.reduce((a, s) => a + (dem[s] || 0), 0) || 1, r10 = total >= 1000, need = {};
  ss.forEach(s => { const v = total * (dem[s] || 0) / tot; need[s] = r10 ? Math.round(v / 10) * 10 : Math.round(v); });
  if (!ss.some(s => need[s] > 0)) need[ss[Math.floor(ss.length / 2)]] = total;
  const tables = []; let guard = 0;
  while (guard++ < 16) {
    const rank = ss.filter(s => need[s] > 0).sort((a, b) => need[b] - need[a]); if (!rank.length) break;
    const pick = rank.slice(0, 3), base = need[pick[0]];
    const sz = pick.map(s => [s, Math.max(1, Math.min(3, Math.round(need[s] / Math.max(1, base / 3))))]);
    const ly = Math.max(4, Math.min(122, Math.round(base / (sz[0][1] || 1))));
    sz.forEach(p => { need[p[0]] = Math.max(0, need[p[0]] - p[1] * ly); });
    tables.push({ tb: nextId(), ly, gb: 0, sz });
  }
  if (!tables.length) return null;
  const acc = {}; tables.forEach(t => t.sz.forEach(p => { acc[p[0]] = (acc[p[0]] || 0) + p[1] * t.ly; }));
  const demand = ss.filter(s => acc[s]).map(s => [s, acc[s]]);
  return { fab: '', grp: 'main', demand, total: demand.reduce((a, d) => a + d[1], 0), tables };
}
function genPlan(o, id) {
  const style = genStyleKey(o.code) || String(o.code || '—'), qty = Math.max(30, Number(o.qty) || 0);
  const sizes = sizesFor(style), dem = demandTarget(style), cols = cutColors(style);
  const nC = Math.min(cols.length, qty >= 3000 ? 3 : qty >= 900 ? 2 : 1);
  const w = [0.5, 0.3, 0.2].slice(0, nC), wsum = w.reduce((a, x) => a + x, 0);
  const sections = []; let left = qty, n = 0;
  for (let ci = 0; ci < nC; ci++) {
    const share = ci === nC - 1 ? left : Math.round(qty * w[ci] / wsum / 10) * 10; left -= share;
    const sec = genSection(style, sizes, dem, share, () => 'C' + (++n)); if (!sec) continue;
    sec.fab = String(cols[ci] || 'MAIN').toUpperCase(); sections.push(sec);
  }
  if (!sections.length) return null;
  const po = String(o.po || '').trim();
  return { id, gen: true, style, buyer: brandOf(o) || '—', po: po ? ('PO ' + po) : '', qrPo: po.replace(/\s+/g, ''),
    label: style + (po ? ' · PO ' + po : ' · ' + String(o.start || '').slice(5)), sections };
}

/* ---- gom don hang + tac nghiep cat --------------------------------------- */
const orders = [];
(PSCHED.groups || []).forEach(g => (g.rows || []).forEach(r => (r.orders || []).forEach(o => {
  orders.push({ line: String(r.line).replace(/LINE/i, 'Line'), code: o.code, po: o.po || '',
    qty: Number(o.qty) || 0, start: o.start, end: o.end, brand: brandOf(o), note: o.note || '' });
})));

/* Tac nghiep cat: uu tien file da upload (khc.js), thieu thi sinh nhu psSeedPlans().
   O day sinh cho TAT CA don (khong gioi han cua so ngay) -> seed dong bang, khong
   phu thuoc ngay chay. */
const plans = KHC.plans.map(p => ({ ...p }));
const have = {}; plans.forEach(p => have[p.id] = 1);
orders.forEach(o => {
  if (!o.code || !o.qty) return;
  const style = genStyleKey(o.code);
  const up = khcPlansFor(style, plans).filter(p => !p.gen), pd = String(o.po || '').replace(/\D/g, '');
  if (up.length && pd) {
    const hit = up.find(p => { const q = String(p.qrPo || '').replace(/\D/g, ''); return q && (q === pd || q.indexOf(pd) >= 0 || pd.indexOf(q) >= 0); });
    if (hit) { o.planId = hit.id; return; }
  }
  const id = 'gen-' + genPlanKey(o).replace(/[^A-Za-z0-9]+/g, '').slice(0, 30);
  if (!have[id]) { const p = genPlan(o, id); if (!p) return; have[id] = 1; plans.push(p); }
  o.planId = id;
});
const planById = {}; plans.forEach(p => planById[p.id] = p);
const psPlan = o => (o.planId && planById[o.planId]) || null;
const orderPo = (o) => { const pl = psPlan(o);
  return String((pl && pl.po) || o.po || '').replace(/^PO\s*/i, '').trim() || '—'; };
const normName = s => { const n = (String(s || '').match(/\d+/g) || []);
  return n.length ? 'LINE ' + n.join('+') : String(s || '').toUpperCase().replace(/\s+/g, ' ').trim(); };

/* ==== seed cua MAY ======================================================== */
/* Danh sach chuyen, dung thu tu trong ke hoach san xuat — ke ca chuyen chua co don. */
const lines = [];
(PSCHED.groups || []).forEach(g => (g.rows || []).forEach(r => {
  const n = normName(r.line);
  if (n && !lines.some(x => x.line === n)) lines.push({ line: n, cap: r.cap || '' });
}));

const sewSeed = {
  src: PSCHED.src,
  lines,
  orders,
  plans,
  snapshot: null,
};

/* ==== seed cua HOAN THIEN ================================================= */
/* SL don hang theo (chuyen | ma hang | PO | mau) — thay cho finOrderedMap() cu
   doc thang tu ke hoach san xuat + tac nghiep cat. */
const ordered = {};
orders.forEach(o => {
  const pl = psPlan(o); if (!pl) return;
  const line = normName(o.line), style = psCode(o.code); if (!line || !style) return;
  const po = orderPo(o);
  (pl.sections || []).forEach(sec => { if (sec.grp === 'aux') return;
    const color = sec.fab || '—';
    (sec.demand || []).forEach(d => { const q = Number(d && d[1]) || 0; if (q <= 0) return;
      const k = [line, style, po, color].join('|'); ordered[k] = (ordered[k] || 0) + q; }); });
});

/* 1 dong / (ma hang | PO) — nguon cua Phu lieu hoan thien va Ke hoach xuat hang. */
const finOrders = []; const seenSP = {};
/* Tac nghiep cat + ngay vao chuyen cua don DAU TIEN mang khoa do — seed cua
   XUAT NPL doc lai o duoi de rai lich cat va tinh so yard cua tung luot. */
const finPlan = {}; const finStart = {};
orders.forEach(o => {
  const style = psCode(o.code); if (!style) return;
  const po = orderPo(o), k = style + '|' + po; if (seenSP[k]) return; seenSP[k] = 1;
  const pl = psPlan(o), cs = [];
  ((pl && pl.sections) || []).forEach(sec => { if (sec.grp === 'aux') return;
    const c = String(sec.fab || '').trim(); if (c && cs.indexOf(c) < 0) cs.push(c); });
  finPlan[k] = pl; finStart[k] = o.start;
  finOrders.push({ brand: o.brand === 'OTHER' ? '' : o.brand, style, po, qty: o.qty, end: o.end, colors: cs });
});

/* Phieu ban giao May -> Hoan thien. Truoc khi tach module, day la state.dsoSlips
   cua man San luong may hang ngay. Gio HOAN THIEN co ban seed rieng: sinh tu chinh
   SL don hang o tren, moi (chuyen|ma hang|PO|mau) giao dan trong SLIP_DAYS ngay
   gan nhat, moi ngay ~SLIP_RATE cua ke hoach. */
const SLIP_DAYS = 4, SLIP_RATE = 0.16, SLIP_BASE = Date.parse('2026-08-24T07:30:00');
const DAY = 86400000;
const p2 = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
const dmy = d => p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear();

/* sizes theo ty le demand cua tac nghiep cat, tong = qty */
function splitSizes(sections, color, qty) {
  const sec = (sections || []).find(s => s.grp !== 'aux' && (s.fab || '—') === color);
  const dem = (sec && sec.demand) || [];
  const tot = dem.reduce((a, d) => a + (Number(d[1]) || 0), 0);
  if (!tot || qty <= 0) return {};
  const out = {}; let left = qty;
  dem.forEach((d, i) => { const n = i === dem.length - 1 ? left : Math.round(qty * d[1] / tot);
    if (n > 0) { out[d[0]] = n; left -= n; } });
  Object.keys(out).forEach(z => { if (out[z] <= 0) delete out[z]; });
  return out;
}
const slips = []; const cum = {}; const seqAt = {};
const groupKeys = Object.keys(ordered).sort();
for (let day = SLIP_DAYS - 1; day >= 0; day--) {
  const ts = SLIP_BASE + (SLIP_DAYS - 1 - day) * DAY + (day % 2) * 5400000;
  const d = new Date(ts), dk = String(d.getFullYear()) + p2(d.getMonth() + 1) + p2(d.getDate());
  groupKeys.forEach(k => {
    const [line, style, po, color] = k.split('|');
    const plan = ordered[k];
    const qty = Math.round(plan * SLIP_RATE / 10) * 10;
    if (qty <= 0) return;
    const o = orders.find(x => normName(x.line) === line && psCode(x.code) === style && orderPo(x) === po);
    const sizes = splitSizes((psPlan(o) || {}).sections, color, qty);
    const q = Object.values(sizes).reduce((a, n) => a + n, 0); if (!q) return;
    const ck = [style, po, color].join('|');
    cum[ck] = (cum[ck] || 0) + q;
    const seq = (seqAt[dk] = (seqAt[dk] || 0) + 1);
    const rowKey = [ymd(d), line, style, po, color].join('|');
    slips.push({ id: 'BG' + ts + '-' + seq, no: 'SF-' + dk + '-' + p2(seq).padStart(3, '0'), ts,
      style, po, color, line, dayTxt: dmy(d), sizes, qty: q, cum: cum[ck],
      alloc: [{ key: rowKey, day: ymd(d), line, sizes, qty: q }] });
  });
}

const finSeed = {
  src: PSCHED.src,
  ordered,
  orders: finOrders,
  slips,
  mlist: MLIST,
  snapshot: null,
};

/* ==== seed cua XUAT NPL ===================================================
   Kho xuat nguyen phu lieu xuong san xuat: VAI sang nha cat, PHU LIEU sang
   chuyen may. Van la don hang + tac nghiep cat o tren, nen ba module cung noi
   ve MOT ke hoach san xuat ma khong module nao doc du lieu cua module khac.

     fabric  so cap vai cho nha cat — 1 dong / 1 LUOT CAT trong 1 NGAY
     rolls   kho vai, tung cuon mot — bang trong hop "chon cuon vai de cap"
     trims   1 dong / (ma hang | PO | ma phu lieu)
     packs   kho phu lieu, tung kien mot — bang trong hop "chon kien de xuat"

   Moi thu deu sinh tu ban bam cua khoa dong -> chay lai bao nhieu lan cung ra
   dung mot file.                                                            */
const hashOf = s => { let x = 0; for (let i = 0; i < String(s).length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; };
const r1 = n => Math.round(n * 10) / 10;

/* Vai: MOT ma vai cho moi (ma hang | mau) — mot ban cat la mot lop vai, khong
   tron ma. `cons` la so YARD cho 1 san pham, `yprl` la so yard cua 1 cay vai. */
const FABPOOL = [
  { item: 'CHB072', desc: '92% NY 8% SP 218G/M2 ±10G', width: '142CM', cons: 1.37, sup: 'CHORI', yprl: 88 },
  { item: 'KTF5510', desc: '88% POLY 12% SP TRICOT 195G/M2', width: '150CM', cons: 1.29, sup: 'HYOSUNG', yprl: 92 },
  { item: 'TXR8840', desc: '100% POLY RIPSTOP 132G/M2 DWR', width: '148CM', cons: 1.55, sup: 'TORAY', yprl: 105 },
  { item: 'NYS2210', desc: '100% NYLON TASLAN 160G/M2', width: '145CM', cons: 1.47, sup: 'SHINWON', yprl: 96 },
  { item: 'CVC3300', desc: '60% CO 40% POLY FRENCH TERRY 280G/M2', width: '180CM', cons: 1.77, sup: 'ECLAT', yprl: 70 },
];

/* Phu lieu: danh muc rut gon tu MATERIALS LIST, bo trung (ma | quy cach | mau).
   Trong file goc hai cot POSITION va SIZE luon bang nhau ("38MM", "13.5CM") nen
   o day chi giu MOT cot `pos` = quy cach. Cot NGUON con lan cong thuc cua Excel
   ("20.5cm=2507+146") -> chi giu nhung gia tri trong nhu ten nha cung cap. */
const supOk = s => { s = String(s || '').trim();
  return (s && s.indexOf('=') < 0 && !/^[\d.]+$/.test(s)) ? s : ''; };
const TRIMCAT = []; const seenTrim = {};
MLIST.rows.forEach(r => {
  if (r.kind !== 'TRIMS') return;
  const k = [r.item, r.pos, r.color].join('|'); if (seenTrim[k]) return; seenTrim[k] = 1;
  TRIMCAT.push({ item: r.item, desc: r.desc, pos: r.pos, color: r.color,
    unit: r.unit || 'EA', cons: Number(r.fcon) || 1, loss: Number(r.loss) || 1.02,
    sup: supOk(r.sup) });
});

/* Ton kho phu lieu: so da nhap kho, quanh muc can dung -> co dong du, co dong thieu. */
const stockOf = (key, need) => Math.max(0, r1(need * (0.82 + (hashOf('S' + key) % 45) / 100)));

/* ---- so cap vai cho nha cat ----------------------------------------------
   1 DONG = 1 LUOT CAT (mot ban cat trong tac nghiep cat) trong 1 NGAY.

   Lich cat: cac luot cua mot don duoc RAI DEU trong khung tu CUT_LEAD ngay truoc
   khi vao chuyen den truoc ngay ket thuc CUT_TAIL ngay, bo Chu nhat — cat cuon
   chieu theo tien do chuyen, khong don het vao mot ngay dau.

   So yard can cap cua 1 luot = so san pham cua luot (so la x so co tren 1 la)
   nhan dinh muc, cong dau ban CUT_END yard moi la.                           */
const CUT_LEAD = 6, CUT_TAIL = 2, CUT_END = 0.06;
const MAT_ASOF = '2026-08-31';
const pdate = s => { const p = String(s).split('-').map(Number); return new Date(p[0], (p[1] || 1) - 1, p[2] || 1); };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const nextWorkday = d => (d.getDay() === 0 ? addDays(d, 1) : d);

const fabric = []; const trims = [];
finOrders.forEach(o => {
  const pl = finPlan[o.style + '|' + o.po];
  const secs = ((pl && pl.sections) || []).filter(s => s.grp !== 'aux');

  /* Moi luot cat cua don, dung thu tu trong tac nghiep cat */
  const lays = [];
  secs.forEach(sec => {
    const color = sec.fab || '—';
    (sec.tables || []).forEach(tb => {
      const ly = Number(tb.ly) || 0;
      const perLay = (tb.sz || []).reduce((a, x) => a + (Number(x[1]) || 0), 0);
      const pcs = ly * perLay; if (pcs <= 0) return;
      lays.push({ color, turn: tb.tb, ly, pcs });
    });
  });
  if (!lays.length) return;

  /* ngay cat co the co cua don — bo Chu nhat */
  const d0 = nextWorkday(addDays(pdate(finStart[o.style + '|' + o.po] || o.end), -CUT_LEAD));
  const d1 = addDays(pdate(o.end), -CUT_TAIL);
  const days = [];
  for (let d = d0; d <= d1 && days.length < 120; d = addDays(d, 1)) if (d.getDay() !== 0) days.push(d);
  if (!days.length) days.push(d0);

  lays.forEach((L, i) => {
    const day = days[Math.min(days.length - 1, Math.floor(i * days.length / lays.length))];
    const c = FABPOOL[hashOf(o.style + '|' + L.color) % FABPOOL.length];
    fabric.push({ id: 'MF' + String(fabric.length + 1).padStart(4, '0'),
      day: ymd(day), brand: o.brand, style: o.style, po: o.po, color: L.color, turn: L.turn,
      item: c.item, desc: c.desc, width: c.width, sup: c.sup, yprl: c.yprl,
      cons: c.cons, ly: L.ly, pcs: L.pcs, need: r1(L.pcs * c.cons + L.ly * CUT_END),
      // kho ghi so — dien o buoc phan cuon ben duoi; bo trong = chua cap
      act: 0, lot: '', rolls: 0 });
  });
});
fabric.sort((a, b) => a.day.localeCompare(b.day) || String(a.style).localeCompare(String(b.style))
  || String(a.color).localeCompare(String(b.color))
  || String(a.turn).localeCompare(String(b.turn)));

/* ---- kho vai: tung CUON mot -----------------------------------------------
   Moi (ma hang | item vai | mau) mot ke rieng, du cho tat ca luot cat cua nhom
   do cong ROLL_SLACK. Cuon dai quanh muc yprl cua ma vai, nam o mot vi tri
   trong kho, mang mot trong ROLL_LOTS lo cua nhom.

   Day la bang hien trong hop "chon cuon vai de cap": Length / Issued / Balance
   cua tung cuon, Balance = Length - Issued.                                  */
const ROLL_SLACK = 1.15, ROLL_LOTS = 3;
const BAY = 'ABCDEFGH';
const rollNeed = {};
fabric.forEach(r => { const k = [r.style, r.item, r.color].join('|');
  rollNeed[k] = r1((rollNeed[k] || 0) + r.need); });

const rolls = []; const rollPool = {};
let lotSeq = 0;
Object.keys(rollNeed).sort().forEach(k => {
  const [style, item, color] = k.split('|');
  const spec = FABPOOL.find(f => f.item === item) || FABPOOL[0];
  /* So lo chay lien tuc tren ca kho -> khong lo nao trung, nen Roll No cung khong. */
  const lots = [];
  for (let i = 0; i < ROLL_LOTS; i++) {
    lotSeq++;
    lots.push('L26' + p2(7 + hashOf('LOT' + k + i) % 2) + '-' + String(100 + lotSeq));
  }
  const list = rollPool[k] = [];
  const nLot = {};
  let left = rollNeed[k] * ROLL_SLACK, i = 0;
  while (left > 0 && list.length < 400) {
    const h = hashOf('R' + i + '|' + k);
    const len = r1(spec.yprl - 8 + h % 17);
    const lot = lots[i % lots.length];
    const n = (nLot[lot] = (nLot[lot] || 0) + 1);
    list.push({ id: 'R' + String(rolls.length + list.length + 1).padStart(4, '0'),
      no: lot.slice(1) + '-' + p2(n), lot, style, item, color, width: spec.width,
      loc: 'K' + (1 + h % 2) + '-' + BAY[(h >>> 3) % BAY.length] + p2(1 + (h >>> 6) % 12)
        + '-' + (1 + (h >>> 10) % 4),
      length: len, issued: 0 });
    left -= len; i++;
  }
  /* Xep theo LO roi den so cuon: cap lien tuc trong mot lo, het lo moi sang lo
     khac — dung nhu nha cat muon (mot ban cat cang it lo cang tot). */
  list.sort((a, b) => a.lot.localeCompare(b.lot) || a.no.localeCompare(b.no));
  list.forEach(x => rolls.push(x));
});

/* ---- phan cuon cho nhung luot da cap --------------------------------------
   Luot nao cat truoc MAT_ASOF thi kho da cap (tru mot phan de lai lam viec ton).
   So o day la so DA CHOT sau khi nha cat tra cuon du ve ke (cot -/+ SAU CAT cua
   to phieu), nen act ~ need va cuon cuoi con lai mot phan tren ke. Luc CAP thi
   app cap ca cuon — xem moPickPlan trong build/parts/mat-glue.js.            */
fabric.forEach(r => {
  if (!(r.day <= MAT_ASOF && hashOf('A' + r.style + r.turn + r.color) % 100 >= 12)) return;
  const list = rollPool[[r.style, r.item, r.color].join('|')] || [];
  let want = r.need, got = 0, n = 0; const lots = [];
  for (let i = 0; i < list.length && want > 0.05; i++) {
    const x = list[i], bal = r1(x.length - x.issued); if (bal <= 0) continue;
    const take = want >= bal * 0.85 ? bal : r1(want);
    x.issued = r1(x.issued + take);
    got = r1(got + take); want = r1(want - take); n++;
    if (lots.indexOf(x.lot) < 0) lots.push(x.lot);
  }
  r.act = got; r.lot = lots.join(', '); r.rolls = n;
});

/* ---- so xuat phu lieu cho chuyen may -------------------------------------- */
finOrders.forEach(o => {
  /* 8–11 ma phu lieu / don, rai deu tren danh muc de moi don mot bo khac nhau. */
  const n = 8 + hashOf('N' + o.style + o.po) % 4, step = Math.max(1, Math.floor(TRIMCAT.length / n));
  const from = hashOf('T' + o.style + o.po) % TRIMCAT.length;
  for (let i = 0; i < n; i++) {
    const c = TRIMCAT[(from + i * step) % TRIMCAT.length];
    const key = [o.style, o.po, c.item, c.pos].join('|');
    const need = Math.ceil(c.cons * (o.qty || 0) * c.loss);
    if (need <= 0) continue;
    trims.push({ id: 'MT' + String(trims.length + 1).padStart(3, '0'),
      brand: o.brand, style: o.style, po: o.po,
      item: c.item, desc: c.desc, pos: c.pos, unit: c.unit, sup: c.sup,
      color: o.colors.length ? o.colors[hashOf(key) % o.colors.length] : c.color,
      cons: c.cons, pcs: o.qty || 0, need, stock: Math.round(stockOf(key, need)) });
  }
});

/* ---- kho phu lieu: tung KIEN mot -----------------------------------------
   Moi dong phu lieu duoc chia thanh cac kien theo PACK_SIZE cua don vi tinh;
   tong so luong cac kien cua mot dong = TON KHO cua dong do, nen bang ngoai va
   hop "chon kien phu lieu de xuat" luon khop nhau.

   Kien nao duoc chon thi xuat CA KIEN — dung mot luat voi cuon vai ben Xuat vai.
   Dong nao da xuat truoc MAT_ASOF thi kho da tru san o day (pack.issued) va so
   da xuat cua dong nam o truong `out`.                                      */
const PACK_SIZE = { EA: 2500, MT: 100, YD: 200, CONE: 6, SET: 500 };
const packs = []; let packLot = 0;
trims.forEach(t => {
  const size = PACK_SIZE[t.unit] || 500;
  const n = Math.max(1, Math.ceil((Number(t.stock) || 0) / size));
  /* So lo chay lien tuc tren ca kho -> khong lo nao trung, Kien # cung khong. */
  const lot = 'T26' + p2(7 + hashOf('TL' + t.id) % 2) + '-' + String(100 + (++packLot));
  let left = Number(t.stock) || 0;
  for (let i = 0; i < n && left > 0; i++) {
    const qty = i === n - 1 ? r1(left) : size; left = r1(left - qty);
    if (qty <= 0) break;
    const h = hashOf('PK' + i + '|' + t.id);
    packs.push({ id: 'K' + String(packs.length + 1).padStart(4, '0'),
      no: lot.slice(1) + '-' + p2(i + 1), lot, row: t.id,
      style: t.style, po: t.po, item: t.item, color: t.color, unit: t.unit,
      loc: 'P' + (1 + h % 2) + '-' + BAY[(h >>> 3) % BAY.length] + p2(1 + (h >>> 6) % 12)
        + '-' + (1 + (h >>> 10) % 4),
      qty, issued: 0 });
  }
});

/* ---- xuat san mot phan: kho da giao cho chuyen truoc MAT_ASOF -------------
   Khoang 1/3 dong da xuat du, 1/4 moi xuat mot phan, con lai chua xuat — de man
   hinh mo len la co du ba trang thai.

   Phu lieu DEM RA duoc khoi kien nen lay lan luot tung kien va chi lay dung so
   can: kien cuoi con lai mot phan tren ke. Day dung la luat ma hop "chon kien
   phu lieu de xuat" trong app dung (co o go so luong tung kien).            */
const packBy = {};
packs.forEach(x => { (packBy[x.row] = packBy[x.row] || []).push(x); });
trims.forEach(t => {
  const roll = hashOf('I' + t.id) % 100;
  const part = roll < 33 ? 1 : (roll < 58 ? (0.4 + (roll % 30) / 100) : 0);
  t.out = 0;
  if (part <= 0) return;
  let want = r1((Number(t.need) || 0) * part), got = 0;
  (packBy[t.id] || []).forEach(x => {
    if (want <= 0.05) return;
    const bal = r1(x.qty - x.issued); if (bal <= 0) return;
    const take = r1(Math.min(bal, want));
    x.issued = r1(x.issued + take);
    got = r1(got + take); want = r1(want - take);
  });
  t.out = got;
});

const matSeed = {
  src: PSCHED.src,
  fabric,
  rolls,
  trims,
  packs,
  snapshot: null,
};

/* ---- ghi file ------------------------------------------------------------- */
function write(rel, varName, obj, head) {
  const p = path.join(ROOT, 'app', rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, head + 'window.' + varName + ' = ' + JSON.stringify(obj) + ';\n');
  console.log(rel.padEnd(24), (fs.statSync(p).size / 1024).toFixed(1) + ' KB');
}

write('sewing/seed.js', 'SEWING_SEED', sewSeed,
`/* YIC MES · MAY — seed cua module.
 * ---------------------------------------------------------------------------
 * Nguon duy nhat cua module MAY. Sinh boi \`node build/seeds.js\` tu
 * "${PSCHED.src}" + tac nghiep cat da upload.
 *
 *   lines     ${lines.length} chuyen may, dung thu tu ke hoach san xuat
 *   orders    ${orders.length} don hang tren cac chuyen: {line, code, po, qty, start, end, brand, planId}
 *             -> Ke hoach may rai SL theo ngay tu day (chuyen / thuong hieu / ma hang)
 *   plans     ${plans.length} tac nghiep cat, khoa qua order.planId
 *             -> San luong may hang ngay lay mau vai + demand theo size tu day
 *   snapshot  anh chup du lieu nguoi dung (nut "Xuat anh chup" trong sidebar),
 *             null = chay bang du lieu goc
 *
 * Module HOAN THIEN co seed rieng (app/finishing/seed.js) — hai ben khong doc
 * du lieu cua nhau nua.
 */
`);

write('finishing/seed.js', 'FINISHING_SEED', finSeed,
`/* YIC MES · HOAN THIEN — seed cua module.
 * ---------------------------------------------------------------------------
 * Nguon duy nhat cua module HOAN THIEN. Sinh boi \`node build/seeds.js\`.
 *
 *   ordered   ${Object.keys(ordered).length} muc "SL don hang" theo (chuyen | ma hang | PO | mau)
 *             -> cot SL DON HANG cua Nhan hang hoan thien
 *   orders    ${finOrders.length} dong (ma hang | PO): {brand, style, po, qty, end, colors}
 *             -> Phu lieu hoan thien + Ke hoach xuat hang thanh pham
 *   slips     ${slips.length} phieu ban giao May -> Hoan thien (dau vao duy nhat cua module)
 *             -> Nhan hang hoan thien xac nhan tung to, so da nhan chay tiep qua
 *                Ui / Kiem cuoi / Dong goi / Nhap kho TP
 *   mlist     danh muc phu lieu (MATERIALS LIST), truoc day la app/data/mlist.js
 *   snapshot  anh chup du lieu nguoi dung, null = chay bang du lieu goc
 *
 * Truoc khi tach module, \`slips\` la state.dsoSlips do man San luong may hang ngay
 * phat hanh. Gio hai module doc lap, nen phieu duoc dong bang o day.
 */
`);

write('material-out/seed.js', 'MATERIAL_SEED', matSeed,
`/* YIC MES · XUAT NPL — seed cua module.
 * ---------------------------------------------------------------------------
 * Nguon duy nhat cua module XUAT NPL. Sinh boi \`node build/seeds.js\` tu
 * "${PSCHED.src}" + tac nghiep cat + "${MLIST.src}".
 *
 *   fabric    ${fabric.length} luot cat, moi luot mot dong trong so cap vai
 *             {day, style, color, turn, item, ly, pcs, cons, need, act, lot, rolls}
 *             -> man Fabric Out: THU · NGAY · ITEM VAI · MA HANG · MAU · LUOT CAT ·
 *                SO YARD CAN CAP · SO YARD THUC CAP · LOT VAI · SO CAY
 *   rolls     ${rolls.length} cuon vai trong kho
 *             {no, lot, style, item, color, width, loc, length, issued}
 *             -> hop "chon cuon vai de cap": Balance = length - issued.
 *                So da cap cua tung luot o tren chinh la tong phan lay tu cac
 *                cuon nay, nen hai bang luon khop nhau.
 *   trims     ${trims.length} dong phu lieu theo (ma hang | PO | ma phu lieu)
 *             -> man Trims Out; \`out\` = so da xuat da chot
 *   packs     ${packs.length} kien phu lieu trong kho
 *             {no, lot, row, style, po, item, color, unit, loc, qty, issued}
 *             -> hop "chon kien phu lieu de xuat": Con lai = qty - issued.
 *                Tong \`out\` cua trims = tong \`issued\` cua packs, hai bang khop.
 *   snapshot  anh chup du lieu nguoi dung, null = chay bang du lieu goc
 *
 * Module nay khong doc state cua MAY hay HOAN THIEN: so lieu tren deu dong bang
 * o day, dung nhu \`slips\` cua HOAN THIEN.
 */
`);
console.log('\nplans: %d upload + %d sinh them', KHC.plans.length, plans.length - KHC.plans.length);
console.log('slips: %d to, tong %d pcs', slips.length, slips.reduce((a, s) => a + s.qty, 0));
console.log('npl: %d luot cat (%s -> %s) + %d cuon vai · %d dong phu lieu + %d kien',
  fabric.length, fabric[0].day, fabric[fabric.length - 1].day, rolls.length,
  trims.length, packs.length);
