/* Kiem tra sau khi tach: moi `this.X` trong module phai co dinh nghia o chinh
 * module hoac o shared/core.js. Bat dung cai loi "quen chuyen 1 ham sang".
 *
 * Chay:  node build/check.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'app');

/* Ten thanh vien khai bao trong 1 file: `  ten(...)`, `  ten = ...`,
   `  async ten(...)`, `  get ten()`, va ca `ten:'...'` trong MOD.pages. */
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
  // ref / co noi bo gan trong constructor, khong phai thanh vien khai bao
  'scrollRef', 'panelRef', 'dailyRef']);

function refs(code) {
  const out = new Map();
  const lines = code.split(/\r?\n/);
  lines.forEach((l, i) => {
    const re = /this\.([A-Za-z_$][\w$]*)/g; let m;
    while ((m = re.exec(l))) {
      const n = m[1];
      if (SKIP.has(n) || n[0] === '_') continue;
      if (!out.has(n)) out.set(n, i + 1);
    }
  });
  return out;
}
/* Ten ham duoc goi gian tiep qua MOD.pages / bang du lieu -> coi nhu da dung. */
function indirect(code) {
  const out = new Set();
  const re = /'(render[A-Z][\w$]*)'/g; let m;
  while ((m = re.exec(code))) out.add(m[1]);
  return out;
}

const core = fs.readFileSync(path.join(APP, 'shared/core.js'), 'utf8');
const coreDefs = defs(core);
let bad = 0;

['sewing', 'finishing'].forEach(mod => {
  const p = path.join(APP, mod, 'script.js');
  const code = fs.readFileSync(p, 'utf8');
  const d = defs(code);
  const have = new Set([...coreDefs, ...d]);
  const missing = [];
  refs(code).forEach((line, n) => { if (!have.has(n)) missing.push(n + ' (dong ' + line + ')'); });
  // ham ve than trang duoc goi qua MOD.pages
  indirect(code).forEach(n => { if (!have.has(n)) missing.push(n + ' (MOD.pages)'); });
  if (missing.length) { bad += missing.length;
    console.log('\n[' + mod + '] THIEU ' + missing.length + ':');
    console.log('  ' + missing.join('\n  '));
  } else {
    console.log('[' + mod + '] ok — ' + d.size + ' thanh vien rieng, ' + coreDefs.size + ' tu core');
  }
});

/* core khong duoc goi ham chi co trong module (tru cac hook co ban mac dinh) */
const HOOK = new Set(['migrate', 'onMount', 'onUnmount', 'onUpdate', 'onEsc', 'onPage', 'renderOverlays',
  'renderPageBody', 'snapPutIdb', 'snapCollect', 'snapExport']);
const coreMissing = [];
refs(core).forEach((line, n) => { if (!coreDefs.has(n) && !HOOK.has(n)) coreMissing.push(n + ' (dong ' + line + ')'); });
if (coreMissing.length) { bad += coreMissing.length;
  console.log('\n[core] THIEU ' + coreMissing.length + ':\n  ' + coreMissing.join('\n  '));
} else console.log('[core] ok — ' + coreDefs.size + ' thanh vien');

/* Khoa state: moi `state.X` phai duoc constructor cua module (hoac coreState)
   khoi tao. Bo sot 1 khoa thuong khong no ngay, chi lang le thanh undefined. */
const coreState = (core.match(/coreState\(\)\s*\{[\s\S]*?\n  \}/) || [''])[0];
['sewing', 'finishing'].forEach(mod => {
  const code = fs.readFileSync(path.join(APP, mod, 'script.js'), 'utf8');
  const ctor = (code.match(/\n  constructor\(props\)[\s\S]*?\n  \}\n/) || [''])[0];
  const init = new Set();
  const seed = ctor + coreState;
  seed.replace(/([A-Za-z_$][\w$]*)\s*:/g, (_, k) => init.add(k));       // `key: value`
  seed.replace(/[\n{,]\s*([A-Za-z_$][\w$]*)\s*[,\n]/g, (_, k) => init.add(k)); // `key,` viet tat
  const used = new Set();
  // bo qua `st.getDate()` cua bien Date noi bo — khoa state khong bao gio la ham
  code.replace(/\bst(?:ate)?\.([A-Za-z_$][\w$]*)(?![\w$])\s*(?!\()/g, (_, k) => used.add(k));
  const miss = [...used].filter(k => !init.has(k) && k[0] !== '_').sort();
  if (miss.length) { bad += miss.length;
    console.log('\n[' + mod + '] state CHUA KHOI TAO ' + miss.length + ': ' + miss.join(' '));
  } else console.log('[' + mod + '] state ok — ' + used.size + ' khoa');
});

/* Khoa dich: moi `t('x')` phai giai duoc o LMOD cua module hoac o L cua core,
   khong thi giao dien hien ra dung ten khoa. */
function dictKeys(code, name) {
  const i = code.indexOf('  ' + name + ' = {');
  if (i < 0) return new Set();
  let d = 0, j = code.indexOf('{', i), end = j;
  for (; end < code.length; end++) {
    if (code[end] === '{') d++; else if (code[end] === '}') { d--; if (!d) break; }
  }
  const out = new Set();
  code.slice(j, end).replace(/[\n{,]\s*([A-Za-z_$][\w$]*)\s*:/g, (_, k) => out.add(k));
  return out;
}
const coreKeys = dictKeys(core, 'L');
['sewing', 'finishing'].forEach(mod => {
  const code = fs.readFileSync(path.join(APP, mod, 'script.js'), 'utf8');
  const have = new Set([...coreKeys, ...dictKeys(code, 'LMOD')]);
  const used = new Set();
  code.replace(/\.t\(\s*'([A-Za-z_$][\w$]*)'/g, (_, k) => used.add(k));
  const miss = [...used].filter(k => !have.has(k)).sort();
  if (miss.length) { bad += miss.length;
    console.log('\n[' + mod + '] KHOA DICH THIEU ' + miss.length + ': ' + miss.join(' '));
  } else console.log('[' + mod + '] dich ok — ' + used.size + ' khoa goi truc tiep, ' + have.size + ' khoa co san');
});

/* cu phap */
['shared/core.js', 'sewing/script.js', 'finishing/script.js'].forEach(f => {
  try { new Function(fs.readFileSync(path.join(APP, f), 'utf8')); }
  catch (e) { bad++; console.log('\n[cu phap] ' + f + ': ' + e.message); }
});

process.exit(bad ? 1 : 0);
