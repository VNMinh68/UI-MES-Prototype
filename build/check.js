/* Kiem tra hai thu muc module sau khi sinh.
 *
 * Chay:  node build/check.js
 *
 * Bat 6 lop loi ma mat thuong de bo qua khi chia file:
 *   1. thu muc thieu file  -> gui di la nguoi khac mo khong len
 *   2. index.html tro ra ngoai thu muc (src="../…") -> het doc lap
 *   3. `this.X` goi mot ham khong co trong file
 *   4. `state.X` doc mot khoa ma constructor chua khoi tao
 *   5. `t('x')` goi mot khoa dich khong co trong LMOD lan L
 *   6. nen dung chung / style.css cua hai module lech nhau
 *   + loi cu phap
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'app');
const ASSETS = path.join(__dirname, 'assets');

const MODULES = [
  { id: 'sewing', vendor: ['react.js', 'react-dom.js', 'anime.js', 'xlsx.js', 'xlsx-style.js'] },
  { id: 'finishing', vendor: ['react.js', 'react-dom.js', 'xlsx.js'] },
];
let bad = 0;
const fail = (m, msg) => { bad++; console.log('\n[' + m + '] ' + msg); };

/* ---- 1. thu muc du file, 2. khong tro ra ngoai --------------------------- */
MODULES.forEach(m => {
  const dir = path.join(APP, m.id);
  const need = ['index.html', 'script.js', 'seed.js', 'style.css']
    .concat(m.vendor.map(f => 'vendor/' + f));
  const miss = need.filter(f => !fs.existsSync(path.join(dir, f)));
  if (miss.length) return fail(m.id, 'THIEU FILE: ' + miss.join(' '));

  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const out = [];
  html.replace(/(?:src|href)\s*=\s*"([^"]+)"/g, (_, u) => {
    if (/^(https?:)?\/\//.test(u) || u.indexOf('..') === 0) out.push(u);
  });
  if (out.length) return fail(m.id, 'index.html tro RA NGOAI thu muc: ' + out.join(' '));
  // moi file index.html nap phai co that
  const missSrc = [];
  html.replace(/src\s*=\s*"([^"]+)"/g, (_, u) => {
    if (!fs.existsSync(path.join(dir, u))) missSrc.push(u);
  });
  if (missSrc.length) return fail(m.id, 'index.html nap file khong co: ' + missSrc.join(' '));
  console.log('[' + m.id + '] thu muc ok — ' + need.length + ' file, khong tro ra ngoai');
});

/* ---- 3/4/5. doc code ------------------------------------------------------ */
function defs(code) {
  const out = new Set();
  code.split(/\r?\n/).forEach(l => {
    const m = l.match(/^  (?:async\s+|get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*[({=]/);
    if (!m) return;
    out.add(m[1]);
    // nhieu khai bao tren 1 dong: `IDB_NAME='a'; IDB_STORE='b'; IDB_VER=2;`
    const re = /;\s*([A-Za-z_$][\w$]*)\s*=/g; let x;
    while ((x = re.exec(l))) out.add(x[1]);
  });
  return out;
}
/* React state / props / ref / bien noi bo: khong phai thanh vien class. */
const SKIP = new Set(['state', 'props', 'setState', 'forceUpdate', 'render', 'C', 'dense',
  'L', 'LMOD', 'NAVVI', 'MOD', 'refs', 'context',
  // ref gan trong constructor, khong phai thanh vien khai bao
  'scrollRef', 'panelRef', 'dailyRef',
  // hook tuy chon cua core: goi qua `if (this.onX) this.onX()`, module khong
  // bat buoc phai co (finishing khong can migrate() chang han)
  'migrate', 'onMount', 'onUnmount', 'onUpdate', 'onEsc', 'onPage']);
function refs(code) {
  const out = new Map();
  code.split(/\r?\n/).forEach((l, i) => {
    const re = /this\.([A-Za-z_$][\w$]*)/g; let m;
    while ((m = re.exec(l))) {
      const n = m[1];
      if (SKIP.has(n) || n[0] === '_') continue;
      if (!out.has(n)) out.set(n, i + 1);
    }
  });
  return out;
}
/* Gop MOI lan khai bao `  <name> = {`: core co ban mac dinh `LMOD = {vi:{},en:{}}`
   roi module ghi de bang bang that, nen chi doc lan dau la thay bang rong. */
function dictKeys(code, name) {
  const out = new Set();
  const head = '  ' + name + ' = {';
  for (let i = code.indexOf(head); i >= 0; i = code.indexOf(head, i + 1)) {
    let d = 0, q = null, j = code.indexOf('{', i), end = j;
    for (; end < code.length; end++) {
      const ch = code[end];
      if (q) { if (ch === '\\') end++; else if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { q = ch; continue; }
      if (ch === '{') d++; else if (ch === '}') { d--; if (!d) break; }
    }
    code.slice(j, end).replace(/[\n{,]\s*([A-Za-z_$][\w$]*)\s*:/g, (_, k) => out.add(k));
  }
  return out;
}

const code = {};
MODULES.forEach(m => { code[m.id] = fs.readFileSync(path.join(APP, m.id, 'script.js'), 'utf8'); });

MODULES.forEach(m => {
  const c = code[m.id], have = defs(c);
  const miss = [];
  refs(c).forEach((line, n) => { if (!have.has(n)) miss.push(n + ' (dong ' + line + ')'); });
  // ham ve than trang duoc goi gian tiep qua MOD.pages
  const re = /'(render[A-Z][\w$]*)'/g; let x;
  while ((x = re.exec(c))) if (!have.has(x[1])) miss.push(x[1] + ' (MOD.pages)');
  if (miss.length) fail(m.id, 'HAM THIEU ' + miss.length + ':\n  ' + miss.join('\n  '));
  else console.log('[' + m.id + '] ham ok — ' + have.size + ' thanh vien');
});

MODULES.forEach(m => {
  const c = code[m.id];
  const seed = (c.match(/\n  coreState\(\)[\s\S]*?\n  \}/) || [''])[0]
    + (c.match(/\n  constructor\(props\)[\s\S]*?\n  \}\n/) || [''])[0];
  const init = new Set();
  seed.replace(/([A-Za-z_$][\w$]*)\s*:/g, (_, k) => init.add(k));            // `key: value`
  seed.replace(/[\n{,]\s*([A-Za-z_$][\w$]*)\s*[,\n]/g, (_, k) => init.add(k)); // `key,` viet tat
  const used = new Set();
  // bo qua `st.getDate()` cua bien Date noi bo — khoa state khong bao gio la ham
  c.replace(/\bst(?:ate)?\.([A-Za-z_$][\w$]*)(?![\w$])\s*(?!\()/g, (_, k) => used.add(k));
  const miss = [...used].filter(k => !init.has(k) && k[0] !== '_').sort();
  if (miss.length) fail(m.id, 'state CHUA KHOI TAO ' + miss.length + ': ' + miss.join(' '));
  else console.log('[' + m.id + '] state ok — ' + used.size + ' khoa');
});

MODULES.forEach(m => {
  const c = code[m.id];
  const have = new Set([...dictKeys(c, 'L'), ...dictKeys(c, 'LMOD')]);
  const used = new Set();
  c.replace(/\.t\(\s*'([A-Za-z_$][\w$]*)'/g, (_, k) => used.add(k));
  const miss = [...used].filter(k => !have.has(k)).sort();
  if (miss.length) fail(m.id, 'KHOA DICH THIEU ' + miss.length + ': ' + miss.join(' '));
  else console.log('[' + m.id + '] dich ok — ' + used.size + ' khoa goi truc tiep, ' + have.size + ' co san');
});

/* ---- 6. hai ban copy phai khop ------------------------------------------- */
/* nen dung chung: 2 doan giua cac moc ---8<--- */
function coreOf(c, n) {
  const a = c.indexOf('/* ---8<--- NEN DUNG CHUNG ' + n + '/2 ---8<--- */');
  const b = c.indexOf('/* ---8<--- HET NEN DUNG CHUNG ' + n + '/2 ---8<--- */');
  return (a < 0 || b < a) ? null : c.slice(a, b);
}
[1, 2].forEach(n => {
  const parts = MODULES.map(m => coreOf(code[m.id], n));
  if (parts.some(p => p === null)) return fail('core', 'khong thay moc ---8<--- ' + n + '/2');
  if (parts[0] !== parts[1]) {
    const A = parts[0].split('\n'), B = parts[1].split('\n');
    const i = A.findIndex((l, k) => l !== B[k]);
    return fail('core', 'NEN DUNG CHUNG ' + n + '/2 LECH NHAU o dong ' + (i + 1)
      + ' cua doan:\n  sewing:    ' + JSON.stringify((A[i] || '').slice(0, 90))
      + '\n  finishing: ' + JSON.stringify((B[i] || '').slice(0, 90))
      + '\n  -> chay lai: node build/emit.js');
  }
  console.log('[core] doan ' + n + '/2 khop — ' + parts[0].split('\n').length + ' dong');
});
/* style.css + vendor phai dung bang ban trong build/assets */
MODULES.forEach(m => {
  const dir = path.join(APP, m.id);
  const diff = [];
  const same = (a, b) => fs.existsSync(a) && fs.existsSync(b)
    && fs.readFileSync(a).equals(fs.readFileSync(b));
  if (!same(path.join(dir, 'style.css'), path.join(ASSETS, 'style.css'))) diff.push('style.css');
  m.vendor.forEach(f => {
    if (!same(path.join(dir, 'vendor', f), path.join(ASSETS, 'vendor', f))) diff.push('vendor/' + f);
  });
  if (diff.length) fail(m.id, 'LECH voi build/assets: ' + diff.join(' ') + '\n  -> chay lai: node build/emit.js');
  else console.log('[' + m.id + '] tai san khop build/assets');
});

/* ---- cu phap ------------------------------------------------------------- */
MODULES.forEach(m => {
  try { new Function(code[m.id]); }
  catch (e) { fail(m.id, 'CU PHAP script.js: ' + e.message); }
});

process.exit(bad ? 1 : 0);
