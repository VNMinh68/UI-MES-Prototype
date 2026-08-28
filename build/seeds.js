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
orders.forEach(o => {
  const style = psCode(o.code); if (!style) return;
  const po = orderPo(o), k = style + '|' + po; if (seenSP[k]) return; seenSP[k] = 1;
  const pl = psPlan(o), cs = [];
  ((pl && pl.sections) || []).forEach(sec => { if (sec.grp === 'aux') return;
    const c = String(sec.fab || '').trim(); if (c && cs.indexOf(c) < 0) cs.push(c); });
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
console.log('\nplans: %d upload + %d sinh them', KHC.plans.length, plans.length - KHC.plans.length);
console.log('slips: %d to, tong %d pcs', slips.length, slips.reduce((a, s) => a + s.qty, 0));
