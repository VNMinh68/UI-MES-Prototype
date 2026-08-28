/* Dung hai thu muc module CHAY DOC LAP tu build/legacy/script.js (ban 1 file cu):
 *
 *     app/sewing/     index.html  script.js  seed.js  style.css  vendor/
 *     app/finishing/  index.html  script.js  seed.js  style.css  vendor/
 *
 * Gui MOT thu muc cho nguoi khac la ho mo duoc ngay, khong can file nao ben ngoai.
 *
 * Chay:  node build/emit.js      (seed.js do build/seeds.js sinh rieng)
 *
 * Cach lam: KHONG go lai code. Doc build/members.json (ban do tung thanh vien cua
 * class Component, sinh boi build/members.js) roi CAT nguyen van tung khoi sang file
 * dich theo bang phan nhom ben duoi. Nhung thanh vien phai viet lai (constructor,
 * restore, cac ham doc du lieu tu PSCHED/KHC...) nam trong build/parts/*.js.
 *
 * Nen dung chung (build/parts/core-*.js) duoc chen vao CA HAI script.js, giua cac
 * moc ---8<---. Hai ban phai giong nhau tung byte — build/check.js kiem dieu do.
 * index.html cua tung module la file viet tay, khong sinh ra o day.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'legacy', 'script.js');
const MAP = path.join(__dirname, 'members.json');
const PARTS = path.join(__dirname, 'parts');

const lines = fs.readFileSync(SRC, 'utf8').split(/\r?\n/);
const map = JSON.parse(fs.readFileSync(MAP, 'utf8'));
const byName = {};
map.mem.forEach(m => { byName[m.name] = m; });

const part = f => fs.readFileSync(path.join(PARTS, f), 'utf8').replace(/\s*$/, '');
const slice = m => lines.slice(m.line - 1, m.end).join('\n');

/* ---- phan nhom ------------------------------------------------------------
   core = dung chung, sew = MAY, fin = HOAN THIEN, both = nhan doi vao ca 2 module,
   drop = bo (Dashboard, Ke hoach san xuat/Gantt, tac nghiep cat, QR),
   glue = viet lai trong build/parts/*.js                                     */
const CORE = `
MN3 MONTHS DAYS SORDER CURWK
persist queuePersist resetSaved
pd psWeekRange psFmtD fmt fmtn parseNums normName weekDates prevWeekKey set
dayLabel renderLang
navPages renderTitle todayStamp tabBar
IDB_NAME idb idbTx sndPut sndGet sndDel sndClear mlvPut mlvDel mlvClear kb
recvTime dfFold dsoCard mtStyles mtBtn dfSearchBox
dsoToday dsoDay dsoHM dsoSizeList dsoSizeText
dsoSlipDay dsoSlipWhen dsoSlipList dsoSlipSeqAt dsoSlipNo dsoSlipCum
dsoWho dsoWhoSet dsoSlipOpen dsoSlipClose dsoSlipBack renderDsoHandAsk
SNAP_V snapB64 snapBlob idbAll snapStores snapCount snapDownload
snapReset snapSay snapSize renderSnapBar
btn ic
`.trim().split(/\s+/);

/* Viet lai — dinh nghia trong build/parts, khong cat tu ban goc. */
const GLUE = `
constructor SKEY PERSIST NOSEED restore renderVals PAGE_BC renderPageBody NAVGROUPS
componentDidMount componentWillUnmount awaitData componentDidUpdate
t tn renderSideNav renderAside
L NAVVI
khcPlansFor kcPlans psPlan psActiveOrders psAllOrders brandOf
psPlanRows psLines psOrderQty
ftSeed fgSeed finOrderedMap ML
`.trim().split(/\s+/);

/* Bo hoan toan: Dashboard + Ke hoach san xuat (Gantt) + tac nghiep cat + QR. */
const DROP = `
renderDashBody
psClone PS psSet ensureSeed psS psD psOff psRatio psMats psSetDate psShortD
genPlanKey genSection genPlan psSeedPlans psQty psGeom psDayW psMonName psMonths
psToday psTotals psSel psLiveItems psRowItems psLineNo psFreeLineNo psAddLine
psDelLine psTouch psDelOrder psRestore psUndo psOpenAdd
manTotal manBySize setManTb setManR manCp setManCp addManCp delManCp manCpList
addManTb delManTb toggleManSz setPsAdd savePsAdd psLaneMap psLabel
KBRANDS psBrandOpts psOrderAt psPick psScrollToCut psGoToday
renderGanttBody renderPsKpis renderPsChart renderPsAdd renderManForm renderManPlan
uploadPlan planConflicts applyConflict renderConflict renderPsCut
kcPlan kcNote kcTagList kcPcs kcStat
PIECES piecesFor pieceLabel defaultPiece qrAscii QR_MAX qrPayload openQr
setQrPiece closeQr renderKhcBody renderQrModal
CUTPLAN MACH
orderPo fgColors fgPlanFor genStyleKey
`.trim().split(/\s+/);

/* Chi HOAN THIEN — moi thu tu FIN_STAGES den renderFgTable trong ban goc. */
const FIN_FROM = 'FIN_STAGES', FIN_TO = 'renderFgTable';

const bucket = {};
CORE.forEach(n => bucket[n] = 'core');
GLUE.forEach(n => bucket[n] = 'glue');
DROP.forEach(n => bucket[n] = 'drop');
const fi = map.mem.findIndex(m => m.name === FIN_FROM);
const fj = map.mem.findIndex(m => m.name === FIN_TO);
map.mem.slice(fi, fj + 1).forEach(m => { if (!bucket[m.name]) bucket[m.name] = 'fin'; });
/* con lai = MAY */
map.mem.forEach(m => { if (!bucket[m.name]) bucket[m.name] = 'sew'; });

const unknown = [].concat(CORE, GLUE, DROP).filter(n => !byName[n]);
if (unknown.length) { console.error('KHONG CO trong ban do:', unknown.join(' ')); process.exit(1); }

/* ---- gom code theo nhom, giu dung thu tu ban goc -------------------------- */
function collect(tag) {
  return map.mem.filter(m => bucket[m.name] === tag).map(slice).join('\n');
}
const coreBody = collect('core');
const sewBody = collect('sew');
const finBody = collect('fin');

/* ---- tach bang dich L ----------------------------------------------------
   Khoa nao duoc dung trong code cua module thi di theo module do; khoa dung o
   nhieu noi (hoac trong core) nam lai core. Quet MOI chuoi trong code roi doi
   chieu voi bang goc — thua vai khoa thi vo hai, thieu thi mat chu.          */
const Lm = byName['L'];
const Lsrc = slice(Lm);
function dictOf(langTag) {
  // 'vi:{' ... hoac 'en:{' ... den dau khoi con lai
  const i = Lsrc.indexOf(langTag + ':{');
  if (i < 0) throw new Error('khong thay ' + langTag + ' trong L');
  let d = 0, j = i + langTag.length + 1;
  for (; j < Lsrc.length; j++) {
    const c = Lsrc[j];
    if (c === '{') d++; else if (c === '}') { d--; if (!d) break; }
  }
  return Lsrc.slice(i, j + 1);
}
const VI = dictOf('vi'), EN = dictOf('en');
/* [khoa, ca doan khai bao]. Quet tung ky tu: bo qua chuoi (gia tri co the chua
   dau ':' nhu 'Ngay giao:') va chi nhan `ten:` o dung muc ngoai cung. */
function entries(dict) {
  const inner = dict.slice(dict.indexOf('{') + 1, dict.lastIndexOf('}'));
  const starts = [];
  let d = 0, q = null, i = 0;
  while (i < inner.length) {
    const c = inner[i];
    if (q) { if (c === '\\') { i += 2; continue; } if (c === q) q = null; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; i++; continue; }
    if ('{(['.indexOf(c) >= 0) { d++; i++; continue; }
    if ('})]'.indexOf(c) >= 0) { d--; i++; continue; }
    if (d === 0 && /[A-Za-z_$]/.test(c)) {
      const m = inner.slice(i).match(/^([A-Za-z_$][\w$]*)\s*:/);
      if (m) { starts.push({ key: m[1], at: i }); i += m[0].length; continue; }
    }
    i++;
  }
  return starts.map((s, k) => ({ key: s.key,
    text: inner.slice(s.at, k + 1 < starts.length ? starts[k + 1].at : inner.length)
      .replace(/[,\s]+$/, '') }));
}
const viE = entries(VI), enE = entries(EN);
const keys = viE.map(e => e.key);

function strings(code) {
  const found = new Set();
  const re = /'([A-Za-z_$][\w$]*)'|"([A-Za-z_$][\w$]*)"/g;
  let m; while ((m = re.exec(code))) found.add(m[1] || m[2]);
  return found;
}
const glueAll = fs.readdirSync(PARTS).map(f => part(f)).join('\n');
const sSew = strings(sewBody + '\n' + glueAll);
const sFin = strings(finBody + '\n' + glueAll);
const sCore = strings(coreBody + '\n' + glueAll);

/* Khoa khong con code nao dung (Dashboard, Ke hoach san xuat, QR...) -> 'dead',
   khong ghi vao file nao. */
const owner = {};
keys.forEach(k => {
  const inS = sSew.has(k), inF = sFin.has(k), inC = sCore.has(k);
  owner[k] = (inC || (inS && inF)) ? 'core' : (inS ? 'sew' : (inF ? 'fin' : 'dead'));
});

/* Cau chu con nhac den man hinh da bo (Ke hoach san xuat / KHSX): doi lai cho
   dung — gio nguon la seed cua module. */
const REWORD = {
  vi: {
    planFromPs: "'Chuyền & mã hàng đồng bộ từ đơn hàng trong seed của module. Cần thêm dòng cho chuyền (đơn giao nhau / làm trùng) thì bấm dấu + ở ô chuyền.'",
    maxLines: "'Chuyền này không có trong danh sách chuyền của seed'",
    tipPlanCol: "'Lấy từ đơn hàng trong seed của module — sửa ở seed.js cùng thư mục'",
    fiGEmpty: "'Chưa có dòng nào — seed của module chưa có phiếu bàn giao nào.'",
    ftReseed: "'Gieo lại từ seed'",
    ftReseedAsk: "'Gieo lại bảng phụ liệu từ seed của module? Mọi SL thực nhận đã nhập sẽ mất.'",
    fgReseed: "'Nạp lại từ seed'",
    fgReseedAsk: "'Nạp lại toàn bộ lô xuất từ seed của module? Mọi chỉnh sửa tay ở bảng này sẽ mất.'",
    fgEmpty: "'Chưa có lô xuất nào — bấm Nạp lại từ seed hoặc Thêm lô xuất.'",
    fsNoFgTip: "'Chưa có dòng Kế hoạch xuất hàng nào khớp mã hàng · PO · màu này — sang Kế hoạch xuất hàng thêm dòng, hoặc bấm Nạp lại từ seed'",
    snapExportTip: "'Tải về seed.js của module — gồm toàn bộ localStorage + file trong IndexedDB. Chép đè lên seed.js cùng thư mục rồi gửi cả thư mục đi.'",
    snapImportTip: "'Chọn 1 file seed.js (hoặc .json) để nạp đè dữ liệu hiện tại'",
  },
  en: {
    planFromPs: "'Lines & styles sync from the orders in the module seed. Need an extra row for a line (overlapping / duplicated orders)? Use the + on the line cell.'",
    maxLines: "'This line is not in the seed line list'",
    tipPlanCol: "'From the orders in the module seed — edit seed.js in the same folder'",
    fiGEmpty: "'No row yet — the module seed has no handover slip.'",
    ftReseed: "'Reseed from seed'",
    ftReseedAsk: "'Reseed the trims table from the module seed? Every actual quantity keyed in will be lost.'",
    fgReseed: "'Reseed from seed'",
    fgReseedAsk: "'Reseed every shipment from the module seed? Manual edits in this table will be lost.'",
    snapExportTip: "'Download the module seed.js — all of localStorage plus every file in IndexedDB. Copy it over seed.js in the same folder and ship that folder.'",
    snapImportTip: "'Pick a seed.js (or .json) file to overwrite the current data'",
  },
};
/* Khoa moi sinh ra khi tach module (ten module hien duoi logo o sidebar). */
const EXTRA = {
  core: { vi: { modSew: "'May'", modFin: "'Hoàn thiện'" },
          en: { modSew: "'Sewing'", modFin: "'Finishing'" } },
  // dsoBrand: ban 1 file goi t('dsoBrand') ma bang dich khong he co khoa nay ->
  // man chi tiet chuyen in ra dung chu 'dsoBrand' khi don khong ro thuong hieu.
  sew: { vi: { dsoBrand: "'\\u2014'" }, en: { dsoBrand: "'\\u2014'" } },
};
function dictFor(tag, es, lang) {
  const rw = REWORD[lang] || {};
  const keep = es.filter(e => owner[e.key] === tag)
    .map(e => '      ' + (rw[e.key] !== undefined ? e.key + ':' + rw[e.key]
                                                  : e.text.replace(/\n\s+/g, ' ')));
  const ex = (EXTRA[tag] || {})[lang] || {};
  Object.keys(ex).forEach(k => keep.push('      ' + k + ':' + ex[k]));
  return keep.join(',\n');
}
function LFor(tag, name) {
  return '  ' + name + ' = {\n    vi:{\n' + dictFor(tag, viE, 'vi') + ' },\n'
    + '    en:{\n' + dictFor(tag, enE, 'en') + ' },\n  };';
}

/* ---- NAVVI: nhan sidebar tieng Viet, tach theo module -------------------- */
const NAVVIsrc = slice(byName['NAVVI']);
function navviFor(labels) {
  const out = [];
  const re = /'([^']+)'\s*:\s*'([^']*)'/g; let m;
  while ((m = re.exec(NAVVIsrc))) if (labels.indexOf(m[1]) >= 0) out.push("'" + m[1] + "':'" + m[2] + "'");
  return '  NAVVI = {' + out.join(',') + '};';
}

/* ---- ghi file -------------------------------------------------------------
   Moi module la MOT THU MUC CHAY DOC LAP: gui thu muc do di la mo duoc, khong
   can file nao ben ngoai. Nen dung chung duoc CHEN vao ca hai script.js, giua
   cac moc ---8<---, va build/check.js kiem hai ban con giong nhau tung byte. */
const MARK = n => '  /* ---8<--- NEN DUNG CHUNG ' + n + '/2 ---8<--- */';
const MARKEND = n => '  /* ---8<--- HET NEN DUNG CHUNG ' + n + '/2 ---8<--- */';

/* Chunk 1: runtime + mo class MESCore + than MESCore. Chunk 2: dong class cua
   module + seedStorage/mount/boot. Giua hai chunk la code rieng cua module. */
const CORE_1 = [MARK(1), part('core-head.js'), LFor('core', 'L'), coreBody,
                part('core-glue.js'), MARKEND(1)].join('\n\n');
const CORE_2 = [MARK(2), part('core-foot.js'), MARKEND(2)].join('\n\n');

function out(rel, text) {
  const p = path.join(ROOT, 'app', rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text.replace(/\r?\n/g, '\n').replace(/\s*$/, '') + '\n');
  console.log(rel.padEnd(26), text.split('\n').length + ' dong');
}

const MODULES = [
  { id: 'sewing', head: 'sew-head.js', glue: 'sew-glue.js', foot: 'sew-foot.js',
    tag: 'sew', body: sewBody,
    nav: ['SEWING', 'Sewing Schedule', 'Daily Sewing Output', 'Fabric', 'Cutting', 'Sewing Output'],
    vendor: ['react.js', 'react-dom.js', 'anime.js', 'xlsx.js', 'xlsx-style.js'] },
  { id: 'finishing', head: 'fin-head.js', glue: 'fin-glue.js', foot: 'fin-foot.js',
    tag: 'fin', body: finBody,
    nav: ['FINISHING', 'Finishing In', 'Finishing Status', 'F.G Shipment Plan'],
    vendor: ['react.js', 'react-dom.js', 'xlsx.js'] },
];

MODULES.forEach(m => {
  out(m.id + '/script.js', [
    CORE_1,
    part(m.head),
    LFor(m.tag, 'LMOD'),
    navviFor(m.nav),
    part(m.glue),
    m.body,
    CORE_2,
    part(m.foot),
  ].join('\n\n'));
});

/* ---- tai san tinh: style.css + vendor, moi thu muc mot ban -----------------
   Nguon la build/assets/. Ban trong app/<module>/ la BAN COPY — sua thi sua o
   build/assets roi chay lai; build/check.js kiem hai ban khop nhau.           */
const ASSETS = path.join(__dirname, 'assets');
function copy(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}
MODULES.forEach(m => {
  const dir = path.join(ROOT, 'app', m.id);
  copy(path.join(ASSETS, 'style.css'), path.join(dir, 'style.css'));
  m.vendor.forEach(f => copy(path.join(ASSETS, 'vendor', f), path.join(dir, 'vendor', f)));
  // vendor cu con sot lai (module bo bot thu vien) thi don di
  const vdir = path.join(dir, 'vendor');
  fs.readdirSync(vdir).forEach(f => {
    if (m.vendor.indexOf(f) < 0) { fs.unlinkSync(path.join(vdir, f)); console.log('  bo', m.id + '/vendor/' + f); }
  });
  const kb = n => (fs.statSync(n).size / 1024).toFixed(0) + ' KB';
  console.log((m.id + '/ tai san').padEnd(26),
    'style.css ' + kb(path.join(dir, 'style.css')) + ' · vendor ' + m.vendor.length + ' file');
});

/* Moi khoa phai duoc phan nhom (ke ca 'dead'), va REWORD khong duoc go sai ten khoa. */
const emitted = ['core', 'sew', 'fin', 'dead'].reduce((a, t) => a + keys.filter(k => owner[k] === t).length, 0);
if (emitted !== keys.length) { console.error('MAT KHOA DICH: %d/%d', emitted, keys.length); process.exit(1); }
const badRw = [...new Set([].concat(Object.keys(REWORD.vi), Object.keys(REWORD.en)))]
  .filter(k => keys.indexOf(k) < 0 || owner[k] === 'dead');
if (badRw.length) { console.error('REWORD tro vao khoa khong dung:', badRw.join(' ')); process.exit(1); }
const enKeys = new Set(enE.map(e => e.key));
const onlyVi = keys.filter(k => !enKeys.has(k));
const onlyEn = enE.map(e => e.key).filter(k => keys.indexOf(k) < 0);
if (onlyVi.length) console.warn('chi co ban vi:', onlyVi.join(' '));
if (onlyEn.length) console.warn('chi co ban en:', onlyEn.join(' '));

const n = t => map.mem.filter(m => bucket[m.name] === t).length;
console.log('\nthanh vien: core=%d sew=%d fin=%d glue=%d drop=%d',
  n('core'), n('sew'), n('fin'), n('glue'), n('drop'));
console.log('khoa dich: core=%d sew=%d fin=%d (bo %d khoa cua man da xoa)',
  keys.filter(k => owner[k] === 'core').length,
  keys.filter(k => owner[k] === 'sew').length,
  keys.filter(k => owner[k] === 'fin').length,
  keys.filter(k => owner[k] === 'dead').length);
