  // ==========================================================================
  // Khai bao module
  // ==========================================================================
  MOD = {
    id: 'material-out', key: 'yic.mes.material', seedVar: 'MATERIAL_SEED', bcRoot: 'modMat',
    nav: [['MATERIAL OUT', [['Fabric Out', 1, 'fabOut'], ['Trims Out', 1, 'trimOut']]]],
    pages: { fabOut: 'renderMofBody', trimOut: 'renderMotBody' },
    bc: { fabOut: 'mofBc', trimOut: 'motBc' },
  };
  PERSIST_MOD = ['moFab', 'moHand', 'moIssue', 'moWho', 'mofQ', 'motQ'];

  // ==========================================================================
  // Du lieu tu seed.js
  // --------------------------------------------------------------------------
  // Hai bang deu la du lieu CHI DOC; phan nguoi dung sinh ra nam rieng trong
  // state, va hai man ghi so theo hai kieu khac nhau:
  //
  //   VAI    so cap vai — 1 dong = 1 LUOT CAT trong 1 NGAY. Kho ghi thang len
  //          dong (thuc cap / lot / so cay), ban ghi de nam o state.moFab:
  //              { <id dong>: {act, lot, rolls} }
  //          Khong co khoa nao thi o do lay so cua seed. Bam "Cap vai" thi hop
  //          chon cuon dien ba o do, va ghi lai da lay cuon nao o state.moHand:
  //              { <id dong>: [ {roll, no, lot, qty, ts} ] }
  //          -> so con lai (Balance) cua tung cuon tru theo.
  //
  //   PHU LIEU  cung the: kho xuat tung KIEN, moi lan xac nhan mot to phieu
  //          WS-yyyymmdd-index. Cot DA XUAT = `out` da chot trong seed cong
  //          tong cac lan xuat trong state.moHand.
  // ==========================================================================
  SEEDFAB = SEED.fabric || [];
  SEEDROLL = SEED.rolls || [];
  SEEDTRIM = SEED.trims || [];
  SEEDPACK = SEED.packs || [];

  // ==========================================================================
  constructor(props) {
    super(props);
    this.scrollRef = React.createRef();
    this.state = { ...this.coreState(),
      page: 'fabOut', edit: null, bedit: null,
      // Fabric Out — kho ghi thang len dong + so cuon da lay cho tung luot cat
      moFab: {}, moHand: {}, mofQ: '',
      // hop chon cuon vai: luot cat dang mo + cac cuon dang tick
      moPick: null, moPickSel: {}, moPickQ: '',
      // to phieu giao nhan (buoc xac nhan): luot cat dang mo + cac o dien tay
      moSheet: null, moSheetRec: {},
      // Trims Out — xuat theo kien, cung khuon voi ben vai
      motQ: '',
      // hop chon kien phu lieu + to phieu giao nhan phu lieu.
      // moTPickQty = so luong muon xuat go cho tung kien (chuoi tho nguoi go)
      moTPick: null, moTPickSel: {}, moTPickQty: {}, moTPickQ: '',
      moTSheet: null, moTSheetRec: {},
    };
    this.restore();
  }

  // ---- vong doi -----------------------------------------------------------
  // Doi man thi dong hop lai: hop dang mo la cua dong ben man cu.
  onPage() {
    this.moPickClose(); this.moSheetClose();
    this.moTPickClose(); this.moTSheetClose();
  }
  // Dong lop tren cung truoc: to phieu -> hop chon
  onEsc() {
    if (this.state.moSheet) return this.moSheetClose();
    if (this.state.moTSheet) return this.moTSheetClose();
    if (this.state.moPick) return this.moPickClose();
    if (this.state.moTPick) return this.moTPickClose();
  }

  // ==========================================================================
  // Dung chung
  // ==========================================================================
  moNum(v) { const n = parseFloat(String(v == null ? '' : v).replace(/[^\d.]/g, '')); return isFinite(n) ? n : 0; }
  // Dinh muc cua chi / keo dan xuong toi 0.006 don vi cho 1 san pham -> fmtn (1
  // so le) lam tron thanh 0. Rieng cot do in 3 so le.
  moN3(n) { n = Number(n) || 0;
    return n % 1 === 0 ? this.fmt(n) : n.toLocaleString('en-US', { maximumFractionDigits: 3 }); }

  moPage(label, titleKey, code) {
    const h = React.createElement, kids = Array.prototype.slice.call(arguments, 3);
    return h.apply(null, [
      'div', { ref: this.scrollRef, className: 'yscroll', 'data-screen-label': label,
        style: { flex: 1, overflow: 'auto', padding: '24px 30px 40px' } },
      this.renderTitle(titleKey, code)].concat(kids));
  }
  moKpis(cards) {
    const h = React.createElement, C = this.C, mono = "'IBM Plex Mono',monospace";
    return h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + cards.length + ',minmax(0,1fr))',
        gap: 12, marginBottom: 16 } },
      cards.map(([label, val, sub, warn], i) => h('div', { key: i, title: sub || '',
        style: { background: C.white, border: '1px solid ' + C.border, borderRadius: 13, padding: '10px 14px',
          boxShadow: C.shadow, display: 'flex', alignItems: 'center', gap: 10 } },
        h('div', { style: { width: 26, height: 26, borderRadius: 8, background: warn ? '#fbf3df' : C.tint,
          color: warn ? '#b0791b' : C.dark, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flex: 'none' } }, this.moIc(i)),
        h('div', { style: { flex: 1, minWidth: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '.5px',
          color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, label),
        h('div', { style: { fontSize: 19, fontWeight: 700, letterSpacing: '-.4px', lineHeight: 1,
          fontVariantNumeric: 'tabular-nums', flex: 'none', fontFamily: mono,
          color: warn ? '#b0791b' : C.ink } }, val))));
  }
  moIc(i) {
    const h = React.createElement;
    const p = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 };
    const d = [['M21 8v13H3V8', 'M1 3h22v5H1z', 'M10 12h4'],
               ['M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z', 'M12 9v4', 'M12 17h.01'],
               ['M3 5h18v16H3z', 'M8 3v4', 'M16 3v4', 'M3 11h18'],
               ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M9 13h6', 'M9 17h6']][i] || [];
    return h('svg', p, d.map((x, k) => h('path', { key: k, d: x })));
  }
  // ---- manh ghep dung chung cua cac hop chon / to phieu giao nhan --------
  // Hai luong (vai xuong nha cat, phu lieu xuong chuyen may) cung mot khuon nen
  // phan vo hop, o tick, o nhan-gia tri va khoi chu ky viet mot lan o day.
  moTick(on, sz) {
    const h = React.createElement, C = this.C, s = sz || 16;
    return h('span', { style: { width: s, height: s, borderRadius: s > 15 ? 5 : 4, flex: 'none',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid ' + (on ? C.primary : '#c8ccc2'), background: on ? C.primary : C.white,
        color: '#fff' } },
      on ? h('svg', { width: s - 6, height: s - 6, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 3.5 }, h('path', { d: 'M20 6 9 17l-5-5' })) : null);
  }
  moMdShell(close, width, z, kids) {
    const h = React.createElement, C = this.C;
    return h('div', { onClick: close, style: { position: 'fixed', inset: 0,
        background: 'rgba(24,28,22,.5)', backdropFilter: 'blur(2px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: z, padding: 24 } },
      h.apply(null, [
        'div', { onClick: ev => ev.stopPropagation(), style: { width, maxHeight: '92vh',
          display: 'flex', flexDirection: 'column', background: C.white,
          borderRadius: z > 90 ? 14 : 18, boxShadow: '0 30px 70px rgba(0,0,0,.36)',
          overflow: 'hidden' } }].concat(kids)));
  }
  moMdHead(titleKey, subKey, paths, close) {
    const h = React.createElement, C = this.C;
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '15px 20px',
        flex: 'none', borderBottom: '1px solid ' + C.line } },
      h('div', { style: { width: 36, height: 36, borderRadius: 10, background: C.tint, color: C.dark,
          flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        h.apply(null, ['svg', { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none',
          stroke: 'currentColor', strokeWidth: 2 }].concat(
          paths.map((d, i) => h('path', { key: i, d }))))),
      h('div', { style: { minWidth: 0, marginRight: 'auto' } },
        h('div', { style: { fontSize: 16, fontWeight: 700 } }, this.t(titleKey)),
        h('div', { style: { fontSize: 11.5, color: C.faint, marginTop: 2 } }, this.t(subKey))),
      h('button', { title: this.t('dsoClose'), onClick: close,
        style: { border: '1px solid ' + C.border, background: C.white, color: C.sub, borderRadius: 9,
          width: 30, height: 30, flex: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1,
          padding: 0, fontFamily: 'inherit' }, 'style-hover': { background: C.tint } }, '×'));
  }
  // Nhan nho + gia tri, dung o dai dau hop chon
  moFld(lb, v, ex) {
    const h = React.createElement, C = this.C;
    return h('div', { key: lb, style: { minWidth: 0 } },
      h('div', { style: { fontSize: 9.5, fontWeight: 700, letterSpacing: '.5px', color: C.faint,
        whiteSpace: 'nowrap' } }, lb),
      h('div', { style: { fontSize: 13.5, fontWeight: 700, color: C.ink, marginTop: 2,
        wordBreak: 'break-word', ...(ex || {}) } }, v || '—'));
  }
  // Nhan nho + gia tri mono, dung o dau TO PHIEU (chi doc)
  moFld2(lb, v, ex, tip) {
    const h = React.createElement, C = this.C, S = this.mtStyles();
    return h('div', { key: lb, style: { minWidth: 0 } },
      h('div', { style: { fontSize: 9, fontWeight: 700, letterSpacing: '.5px', color: C.faint,
        whiteSpace: 'nowrap', marginBottom: 3 } }, lb),
      h('div', { title: tip || undefined, style: { fontSize: 13.5, fontWeight: 700, color: C.dark,
        fontFamily: S.mono, padding: '2px 0', wordBreak: 'break-all', ...(ex || {}) } }, v || '—'));
  }
  // O so lon o dai dau hop chon
  moBox(lb, v, fg, unit) {
    const h = React.createElement, C = this.C, S = this.mtStyles();
    return h('div', { key: lb, style: { flex: 'none', minWidth: 96, background: C.white,
        border: '1px solid ' + C.border, borderRadius: 10, padding: '7px 12px' } },
      h('div', { style: { fontSize: 9, fontWeight: 700, letterSpacing: '.5px', color: C.faint,
        whiteSpace: 'nowrap' } }, lb),
      h('div', { style: { fontSize: 17, fontWeight: 700, fontFamily: S.mono, color: fg, marginTop: 2,
        lineHeight: 1 } }, v + ' ',
        h('span', { style: { fontSize: 10, fontWeight: 600, color: C.faint } }, unit || '')));
  }
  // O go so luong xuat cua tung kien phu lieu
  moQtyInp(val, onCh, off) {
    const h = React.createElement, C = this.C, S = this.mtStyles();
    return h('input', { value: val, placeholder: '\u2014', disabled: !!off, inputMode: 'decimal',
      title: this.t('mptTakeTip'), onChange: e => onCh(e.target.value.replace(/[^\d.]/g, '')),
      style: { width: '100%', border: 'none', background: 'none', padding: '2px 0',
        borderBottom: '1px dashed ' + (off ? 'transparent' : (val === '' ? '#c8ccc2' : C.primary)),
        textAlign: 'right', fontFamily: S.mono, fontSize: 12.5, fontWeight: 700,
        color: off ? C.faint : C.dark, outline: 'none', cursor: off ? 'default' : 'text' } });
  }
  // O dien ho ten tren khoi chu ky
  moSgInp(val, onCh) {
    const h = React.createElement, C = this.C;
    return h('input', { value: val, placeholder: this.t('msNamePh'),
      onChange: e => onCh(e.target.value),
      style: { width: '100%', border: 'none', borderBottom: '1px solid ' + C.border,
        background: 'none', padding: '3px 2px', fontSize: 12.5, fontWeight: 600, color: C.ink,
        outline: 'none', boxSizing: 'border-box', textAlign: 'center', marginTop: 8 } });
  }
  // Mot cot trong khoi chu ky: da dang nhap thi in ten, con lai la o dien
  moSg(lb, name, cap, el) {
    const h = React.createElement, C = this.C, S = this.mtStyles();
    return h('div', { key: lb, style: { flex: '1 1 150px', minWidth: 0, textAlign: 'center',
        padding: '0 8px' } },
      h('div', { style: { fontSize: 9, fontWeight: 700, letterSpacing: '.5px', color: C.faint,
        whiteSpace: 'nowrap' } }, lb),
      el || h('div', { style: { fontSize: 13.5, fontWeight: 700, color: C.dark, marginTop: 8,
        paddingBottom: 4, borderBottom: '1px solid ' + C.border, fontFamily: S.mono } }, name),
      h('div', { style: { fontSize: 9.5, color: C.faint, marginTop: 4, lineHeight: 1.35 } }, cap));
  }

  // ==========================================================================
  // Fabric Out — so cap vai cho nha cat
  // --------------------------------------------------------------------------
  // 1 dong = 1 luot cat. CA 11 COT DEU CHI DOC:
  //   SO YARD CAN CAP  do tac nghiep cat quyet dinh (dong bang trong seed)
  //   THUC CAP / LOT VAI / SO CAY  do to phieu giao nhan dien vao — bam nut
  //   Cap vai o cot cuoi, chon cuon roi xac nhan; ba o do va Balance cua tung
  //   cuon trong kho vi the luon khop nhau.
  // ==========================================================================
  moY1(n) { return Math.round((Number(n) || 0) * 10) / 10; }

  // Uu tien ban nguoi dung go, khong co thi lay so cua seed. Rong = chua ghi.
  moFabRaw(r, k) {
    const o = (this.state.moFab || {})[r.id] || {};
    const v = o[k] !== undefined ? o[k] : r[k];
    return (v === undefined || v === null || v === '' || v === 0) ? '' : String(v);
  }
  moFabN(r, k) { return this.moNum(this.moFabRaw(r, k)); }
  // Cap chua du so can -> to mau. Cap VUOT thi khong bao gi: moi cuon ra ca cuon
  // nen du mot phan cuon cuoi la binh thuong.
  moFabOff(r) { const need = Number(r.need) || 0, act = this.moFabN(r, 'act');
    return act > 0 && need > 0 && act < need - 0.05; }
  moFabLeft(r) { return this.moY1(Math.max(0, (Number(r.need) || 0) - this.moFabN(r, 'act'))); }
  moDow(day) {
    const i = this.pd(day).getDay();
    return (this.state.lang === 'vi' ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
                                     : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'])[i];
  }
  moFabList() {
    const q = this.dfFold(this.state.mofQ || ''); if (!q) return this.SEEDFAB;
    return this.SEEDFAB.filter(r => this.dfFold([this.moDow(r.day), this.dsoDay(r.day), r.day,
      r.item, r.desc, r.style, r.po, r.color, r.turn, this.moFabRaw(r, 'lot')]
      .join(' ')).indexOf(q) >= 0);
  }

  renderMofBody() {
    return this.moPage('Fabric Out', 'mofTitle', 'S-07-MATOUT-FAB · UI Proto',
      this.renderMofKpis(), this.renderMofTable(), this.renderMofPick(), this.renderMofSheet());
  }
  renderMofKpis() {
    const rows = this.SEEDFAB;
    const wait = rows.filter(r => this.moFabN(r, 'act') <= 0).length;
    const need = rows.reduce((a, r) => a + (Number(r.need) || 0), 0);
    const act = rows.reduce((a, r) => a + this.moFabN(r, 'act'), 0);
    return this.moKpis([
      [this.t('mofK1'), this.fmt(rows.length), this.t('mofK1s')],
      [this.t('mofK2'), this.fmt(wait), this.t('mofK2s'), wait > 0],
      [this.t('mofK3'), this.fmt(Math.round(need)), this.t('mofK3s')],
      [this.t('mofK4'), this.fmt(Math.round(act)), this.t('mofK4s')]]);
  }
  renderMofTable() {
    const h = React.createElement, C = this.C, S = this.mtStyles();
    const q = this.state.mofQ || '', rows = this.moFabList();
    const action = h('div', { style: { display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' } },
      h('span', { style: { fontSize: 11.5, fontWeight: 700, fontFamily: S.mono, color: C.dark,
        background: C.tint, border: '1px solid ' + C.border, borderRadius: 999, padding: '4px 10px',
        whiteSpace: 'nowrap' } }, this.fmt(rows.length) + ' ' + this.t('mofCount')),
      this.dfSearchBox(q, v => this.set({ mofQ: v }), false, 'mofSearch'));
    // Cot THU / NGAY chi in o dong dau cua ngay; ca ngay la mot khoi, ke vach
    // dam o dau khoi va doi mau nen theo NGAY chu khong theo dong.
    let dayN = -1, last = '';
    const body = rows.map((r, i) => {
      const head = r.day !== last; if (head) { dayN++; last = r.day; }
      const bg = dayN % 2 ? '#f7f9f3' : C.white;
      const top = (head && i) ? { borderTop: '2px solid ' + C.border } : null;
      const td = (v, ex) => h('td', { style: { ...S.td, background: bg, ...(top || {}), ...(ex || {}) } }, v);
      const off = this.moFabOff(r), act = this.moFabRaw(r, 'act');
      const lot = this.moFabRaw(r, 'lot'), rolls = this.moFabRaw(r, 'rolls');
      const lyTip = this.fmt(r.ly) + ' ' + this.t('mofLyTip') + ' · ' + this.fmt(r.pcs) + ' '
        + this.t('mofPcsTip') + ' · ' + this.moN3(r.cons) + ' ' + this.t('mofConsTip');
      return h('tr', { key: r.id },
        td(head ? this.moDow(r.day) : '', { textAlign: 'center', fontWeight: 700,
          color: head ? C.primary : 'transparent', whiteSpace: 'nowrap' }),
        td(head ? this.dsoDay(r.day) : '', { fontFamily: S.mono, fontWeight: 600,
          color: head ? C.ink : 'transparent', whiteSpace: 'nowrap' }),
        h('td', { title: [r.desc, r.width, r.sup].filter(Boolean).join(' · '),
          style: { ...S.td, background: bg, ...(top || {}), fontFamily: S.mono, fontWeight: 700,
            color: C.primary, wordBreak: 'break-all' } }, r.item),
        h('td', { title: this.t('moPo') + ' ' + r.po,
          style: { ...S.td, background: bg, ...(top || {}), fontFamily: S.mono, fontWeight: 700,
            wordBreak: 'break-all' } }, r.style),
        td(r.color || '—', { fontWeight: 600, color: C.dark, wordBreak: 'break-word' }),
        h('td', { title: lyTip, style: { ...S.td, background: bg, ...(top || {}), fontFamily: S.mono,
          fontWeight: 700, color: C.dark, whiteSpace: 'nowrap', textAlign: 'center' } }, r.turn),
        h('td', { title: this.t('mofNeedTip'), style: { ...S.td, background: bg, ...(top || {}),
          textAlign: 'right', fontFamily: S.mono, fontWeight: 700, whiteSpace: 'nowrap' } },
          this.fmtn(r.need)),
        // Ba o duoi day CHI DOC: chung do to phieu giao nhan dien vao (nut Cap
        // vai -> chon cuon -> xac nhan). Go tay duoc thi so trong so lech ngay
        // voi Balance cua tung cuon trong kho.
        h('td', { title: this.t(off ? 'mofDiffTip' : 'mofActTip'),
          style: { ...S.td, background: bg, ...(top || {}), textAlign: 'right',
            fontFamily: S.mono, fontWeight: 700, whiteSpace: 'nowrap',
            color: act ? (off ? '#b0791b' : '#2f7d32') : C.faint } },
          act ? this.fmtn(this.moFabN(r, 'act')) : '\u2014'),
        h('td', { title: this.t('mofLotTip'),
          style: { ...S.td, background: bg, ...(top || {}), fontFamily: S.mono,
            color: lot ? C.ink : C.faint, wordBreak: 'break-word' } }, lot || '\u2014'),
        h('td', { title: this.t('mofRollsTip'),
          style: { ...S.td, background: bg, ...(top || {}), textAlign: 'right',
            fontFamily: S.mono, fontWeight: 700, whiteSpace: 'nowrap',
            color: rolls ? C.ink : C.faint } }, rolls || '\u2014'),
        td(this.mtBtn(this.t('mofIssue'), () => this.moPickOpen(r),
          { border: '1px solid ' + C.primary, background: C.tint }),
          { borderRight: 'none', whiteSpace: 'nowrap' }));
    });
    /* Chia cot theo PHAN TRAM, khong de cot nao 'auto': de 'auto' thi mot cot
       hut het cho trong con lai cua man hinh (MA HANG rong gap doi cac cot khac
       trong khi chu chi chiem mot nua). Man rong bao nhieu thi ca 11 cot gian
       ra deu nhau; min-width giu cho LOT VAI du cho hai lo tren mot dong. */
    const wid = ['4%', '7%', '9%', '14%', '11%', '6%', '9%', '9%', '14%', '7%', '10%'];
    const rt = { ...S.th, textAlign: 'right' }, two = { ...rt, whiteSpace: 'pre-line', lineHeight: 1.25 };
    const tbl = h('div', { className: 'yscroll', style: { overflowX: 'auto' } },
      h('table', { style: { width: '100%', minWidth: '1280px', borderCollapse: 'collapse' } },
        h('colgroup', null, wid.map((w, i) => h('col', { key: i, style: { width: w } }))),
        h('thead', null, h('tr', null,
          h('th', { style: { ...S.th, textAlign: 'center' } }, this.t('mofDow')),
          ...['mofDay', 'mofItem', 'moStyle', 'moColor']
            .map(k => h('th', { key: k, style: S.th }, this.t(k))),
          h('th', { style: { ...S.th, textAlign: 'center' } }, this.t('mofTurn')),
          h('th', { style: two }, this.t('mofNeed')),
          h('th', { style: two }, this.t('mofAct')),
          h('th', { style: S.th }, this.t('mofLot')),
          h('th', { style: rt }, this.t('mofRolls')),
          h('th', { style: { ...S.th, borderRight: 'none' } }, this.t('mtAct')))),
        h('tbody', null, rows.length ? body : h('tr', null, h('td', { colSpan: wid.length,
          style: { ...S.td, textAlign: 'center', color: C.faint, padding: '44px 16px',
            borderRight: 'none' } }, this.t(this.SEEDFAB.length ? 'mofNoHit' : 'mofEmpty'))))));
    return this.dsoCard('mofPanel', 'mofSub', 'Fabric Out', tbl, { action });
  }

  // ==========================================================================
  // Hop chon cuon vai de cap
  // --------------------------------------------------------------------------
  // Kho vai trong seed la TUNG CUON mot. Cuon nao cung co Length (so yard cua ca
  // cuon) va Issued (so yard da cat ra khoi cuon); Balance = Length - Issued la
  // phan con lai tren ke.
  //
  // Tick chon ca dong = chon ca cuon do, va cuon nao da chon la CAP CA CUON:
  // khong cat le mot phan cuon roi tra ve ke. Vay nen so thuc cap thuong nhieu
  // hon so can cap mot chut (phan du cua cuon cuoi) — dung nhu kho lam viec.
  //
  // Phan da cap nam o state.moHand = { <id luot cat>: [ {roll, no, lot, qty, ts} ] }
  // vua la so cai cua tung cuon, vua la nguon dien 3 cot kho ghi ngoai bang.
  // ==========================================================================
  moRollsFor(r) {
    const k = [r.style, r.item, r.color].join('|');
    if (this._moRF && this._moRF.k === k) return this._moRF.list;
    const list = this.SEEDROLL.filter(x => x.style === r.style && x.item === r.item
      && x.color === r.color);
    this._moRF = { k, list };
    return list;
  }
  // So da lay khoi tung cuon / kien trong phien nay (ngoai phan da co trong seed)
  moUsed() {
    const m = this.state.moHand || {};
    if (this._moU && this._moU.m === m) return this._moU.map;
    const map = {};
    // Dong cua ben vai ghi `roll`, ben phu lieu ghi `pack` — cung mot so tay nen
    // nhan ca hai, id cuon / kien khac tien to (R… / K…) khong lan nhau.
    Object.keys(m).forEach(k => (m[k] || []).forEach(x => { const id = x.roll || x.pack;
      if (id) map[id] = (map[id] || 0) + (Number(x.qty) || 0); }));
    this._moU = { m, map };
    return map;
  }
  moRollOut(x) { return this.moY1((Number(x.issued) || 0) + (this.moUsed()[x.id] || 0)); }
  moRollBal(x) { return this.moY1((Number(x.length) || 0) - this.moRollOut(x)); }
  // Thu tu lam viec cua ke vai: cuon con vai len truoc (theo lo roi den so cuon,
  // cap het mot lo moi sang lo khac), cuon da het xuong duoi cung. Ca bang trong
  // hop, nut "chon du so can" va luc cap that deu chay theo dung thu tu nay.
  moRollSorted(r) {
    const list = this.moRollsFor(r), m = this.state.moHand || {};
    if (this._moRS && this._moRS.list === list && this._moRS.m === m) return this._moRS.out;
    const out = list.slice().sort((a, b) => (this.moRollBal(b) > 0) - (this.moRollBal(a) > 0)
      || a.lot.localeCompare(b.lot) || a.no.localeCompare(b.no));
    this._moRS = { list, m, out };
    return out;
  }
  // Cuon nao da cap cho DUNG luot cat dang mo
  moHandMap(r) { const m = {};
    ((this.state.moHand || {})[r.id] || []).forEach(x => { m[x.roll] = (m[x.roll] || 0) + x.qty; });
    return m; }

  moPickOpen(r) { this.set({ moPick: r.id, moPickSel: {}, moPickQ: '' }); }
  moPickClose() { this.set({ moPick: null, moPickSel: {} }); }
  moPickTog(x) {
    if (this.moRollBal(x) <= 0) return;
    this.setState(st => { const s = { ...(st.moPickSel || {}) };
      if (s[x.id]) delete s[x.id]; else s[x.id] = 1; return { moPickSel: s }; });
  }
  moPickList(r) {
    const all = this.moRollSorted(r), q = this.dfFold(this.state.moPickQ || '');
    if (!q) return all;
    return all.filter(x => this.dfFold([x.no, x.lot, x.loc, x.style, x.item, x.color]
      .join(' ')).indexOf(q) >= 0);
  }
  // Tick san SO CUON IT NHAT phu duoc phan con thieu, lay lan luot tu dau ke.
  // Vi moi cuon ra ca cuon nen tong se hoi vuot — cuon cuoi khong cat le duoc.
  moPickAuto(r) {
    let want = this.moFabLeft(r); const s = {};
    this.moRollSorted(r).forEach(x => {
      if (want <= 0) return;
      const bal = this.moRollBal(x); if (bal <= 0) return;
      s[x.id] = 1; want = this.moY1(want - bal);
    });
    this.set({ moPickSel: s });
  }
  // Cuon nao duoc chon thi ra CA CUON — khong co chuyen cap le nua cuon.
  moPickPlan(r) {
    const sel = this.state.moPickSel || {}, out = [];
    this.moRollSorted(r).forEach(x => {
      if (!sel[x.id]) return;
      const take = this.moRollBal(x); if (take <= 0) return;
      out.push({ roll: x, take });
    });
    return out;
  }
  renderMofPick() {
    const h = React.createElement, C = this.C, S = this.mtStyles();
    const id = this.state.moPick; if (!id) return null;
    const r = this.SEEDFAB.find(x => x.id === id); if (!r) return null;
    const all = this.moRollSorted(r), rows = this.moPickList(r);
    const sel = this.state.moPickSel || {}, mine = this.moHandMap(r);
    const plan = this.moPickPlan(r);
    const nSel = plan.length;
    const selYd = this.moY1(plan.reduce((a, p) => a + p.take, 0));
    const left = this.moFabLeft(r), close = () => this.moPickClose();
    const fld = (lb, v, ex) => h('div', { key: lb, style: { minWidth: 0 } },
      h('div', { style: { fontSize: 9.5, fontWeight: 700, letterSpacing: '.5px', color: C.faint,
        whiteSpace: 'nowrap' } }, lb),
      h('div', { style: { fontSize: 13.5, fontWeight: 700, color: C.ink, marginTop: 2,
        wordBreak: 'break-word', ...(ex || {}) } }, v || '—'));
    const head = h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '15px 20px',
        flex: 'none', borderBottom: '1px solid ' + C.line } },
      h('div', { style: { width: 36, height: 36, borderRadius: 10, background: C.tint, color: C.dark,
          flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        h('svg', { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
          strokeWidth: 2 }, h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 2 }),
          h('path', { d: 'M8 4v16M16 4v16' }))),
      h('div', { style: { minWidth: 0, marginRight: 'auto' } },
        h('div', { style: { fontSize: 16, fontWeight: 700 } }, this.t('mrTitle')),
        h('div', { style: { fontSize: 11.5, color: C.faint, marginTop: 2 } }, this.t('mrSub'))),
      h('button', { title: this.t('dsoClose'), onClick: close,
        style: { border: '1px solid ' + C.border, background: C.white, color: C.sub, borderRadius: 9,
          width: 30, height: 30, flex: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1, padding: 0,
          fontFamily: 'inherit' }, 'style-hover': { background: C.tint } }, '×'));
    const info = h('div', { style: { display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
        flex: 'none', padding: '13px 20px', background: C.tint2, borderBottom: '1px solid ' + C.line } },
      h('div', { style: { flex: '1 1 280px', minWidth: 0, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(96px,1fr))', gap: 14 } },
        fld(this.t('mofDay'), this.moDow(r.day) + ' · ' + this.dsoDay(r.day), { fontFamily: S.mono }),
        fld(this.t('moStyle'), r.style, { fontFamily: S.mono }),
        fld(this.t('moColor'), r.color, { color: C.dark }),
        fld(this.t('mofTurn'), r.turn, { fontFamily: S.mono, color: C.dark }),
        fld(this.t('mofItem'), r.item, { fontFamily: S.mono, color: C.primary }),
        fld(this.t('mrWidth'), r.width, { fontFamily: S.mono, fontSize: 12.5 })),
      h('div', { style: { flex: 'none', display: 'flex', gap: 9, flexWrap: 'wrap' } },
        [[this.t('mrNeed'), r.need, C.ink], [this.t('mrDone'), this.moFabN(r, 'act'), '#2f7d32'],
         [this.t('mrLeft'), left, left ? '#b0791b' : C.faint]]
          .map(([lb, v, fg]) => h('div', { key: lb, style: { flex: 'none', minWidth: 96, background: C.white,
              border: '1px solid ' + C.border, borderRadius: 10, padding: '7px 12px' } },
            h('div', { style: { fontSize: 9, fontWeight: 700, letterSpacing: '.5px', color: C.faint,
              whiteSpace: 'nowrap' } }, lb),
            h('div', { style: { fontSize: 17, fontWeight: 700, fontFamily: S.mono, color: fg, marginTop: 2,
              lineHeight: 1 } }, this.fmtn(v) + ' ',
              h('span', { style: { fontSize: 10, fontWeight: 600, color: C.faint } }, 'YD'))))));
    const bar = h('div', { style: { display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap',
        flex: 'none', padding: '11px 20px', borderBottom: '1px solid ' + C.line } },
      h('span', { style: { fontSize: 11.5, fontWeight: 700, fontFamily: S.mono, color: C.dark,
        background: C.tint, border: '1px solid ' + C.border, borderRadius: 999, padding: '4px 10px',
        whiteSpace: 'nowrap' } }, this.fmt(rows.length) + ' ' + this.t('mrCount')),
      this.dfSearchBox(this.state.moPickQ || '', v => this.set({ moPickQ: v }), false, 'mrSearch'),
      h('div', { style: { flex: 1, minWidth: 8 } }),
      left > 0 ? this.mtBtn(this.t('mrAuto'), () => this.moPickAuto(r),
        { padding: '6px 12px', fontSize: 12 }) : null);
    const tick = on => h('span', { style: { width: 16, height: 16, borderRadius: 5, flex: 'none',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid ' + (on ? C.primary : '#c8ccc2'), background: on ? C.primary : C.white,
        color: '#fff' } },
      on ? h('svg', { width: 10, height: 10, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 3.5 }, h('path', { d: 'M20 6 9 17l-5-5' })) : null);
    const body = rows.map((x, i) => {
      const bal = this.moRollBal(x), on = !!sel[x.id], gone = bal <= 0;
      const bg = on ? C.tint : (i % 2 ? '#f7f9f3' : C.white);
      const c = (v, ex) => h('td', { style: { ...S.td, background: bg,
        opacity: gone ? .55 : 1, ...(ex || {}) } }, v || '—');
      return h('tr', { key: x.id, onClick: () => this.moPickTog(x),
          title: gone ? this.t('mrOutTip') : this.t('mrRowTip'),
          style: { cursor: gone ? 'default' : 'pointer', background: bg },
          'style-hover': gone ? {} : { background: C.tint } },
        h('td', { style: { ...S.td, background: bg, textAlign: 'center' } }, gone ? null : tick(on)),
        c(h('span', null, x.no, mine[x.id] ? h('span', { title: this.t('mrHereTip'),
          style: { marginLeft: 6, fontSize: 9.5, fontWeight: 700, color: C.dark, background: C.badge,
            borderRadius: 999, padding: '1px 6px' } }, this.t('mrHere')) : null),
          { fontFamily: S.mono, fontWeight: 700, whiteSpace: 'nowrap' }),
        c(x.lot, { fontFamily: S.mono, whiteSpace: 'nowrap' }),
        c(x.style, { fontFamily: S.mono, wordBreak: 'break-all' }),
        c(x.item, { fontFamily: S.mono, fontWeight: 700, color: C.primary, whiteSpace: 'nowrap' }),
        c(x.color, { fontWeight: 600, color: C.dark, wordBreak: 'break-word' }),
        c(x.width, { fontFamily: S.mono, fontSize: 11.5, color: C.sub, whiteSpace: 'nowrap' }),
        c(x.loc, { fontFamily: S.mono, fontSize: 11.5, color: C.sub, whiteSpace: 'nowrap' }),
        c(this.fmtn(x.length), { textAlign: 'right', fontFamily: S.mono, fontWeight: 700 }),
        c(this.fmtn(this.moRollOut(x)), { textAlign: 'right', fontFamily: S.mono, fontWeight: 700,
          color: this.moRollOut(x) ? C.sub : C.faint }),
        h('td', { style: { ...S.td, background: bg, borderRight: 'none', textAlign: 'right',
          fontFamily: S.mono, fontWeight: 700, opacity: gone ? .55 : 1,
          color: gone ? C.faint : '#2f7d32' } }, gone ? this.t('mrOut') : this.fmtn(bal)));
    });
    const wid = ['44px', '150px', '124px', 'auto', '122px', '116px', '86px', '110px', '96px',
                 '104px', '104px'];
    const tbl = h('div', { className: 'yscroll', style: { overflow: 'auto', flex: 1, minHeight: 160 } },
      h('table', { style: { width: '100%', minWidth: '1080px', borderCollapse: 'collapse' } },
        h('colgroup', null, wid.map((w, i) => h('col', { key: i, style: { width: w } }))),
        h('thead', null, h('tr', null,
          h('th', { style: { ...S.th, position: 'sticky', top: 0, zIndex: 1 } }, ''),
          ...['mrNo', 'mrLot', 'mrStyle', 'mrItem', 'mrColor', 'mrWidth', 'mrLoc']
            .map(k => h('th', { key: k, style: { ...S.th, position: 'sticky', top: 0, zIndex: 1 } },
              this.t(k))),
          ...['mrLen', 'mrIssued'].map(k => h('th', { key: k,
            style: { ...S.th, textAlign: 'right', position: 'sticky', top: 0, zIndex: 1 } }, this.t(k))),
          h('th', { style: { ...S.th, textAlign: 'right', borderRight: 'none', position: 'sticky',
            top: 0, zIndex: 1 } }, this.t('mrBal')))),
        h('tbody', null, rows.length ? body : h('tr', null, h('td', { colSpan: wid.length,
          style: { ...S.td, textAlign: 'center', color: C.faint, padding: '44px 16px',
            borderRight: 'none' } }, this.t(all.length ? 'mrNoHit' : 'mrEmpty'))))));
    const foot = h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
        flex: 'none', borderTop: '1px solid ' + C.line, background: '#f8faf3', flexWrap: 'wrap' } },
      h('span', { style: { fontSize: 12, fontWeight: 700, color: nSel ? C.ink : C.faint,
        fontFamily: S.mono, whiteSpace: 'nowrap' } },
        this.t('mrPicked') + ' ' + this.fmt(nSel) + ' ' + this.t('mrCount')
        + ' · ' + this.fmtn(selYd) + ' YD'),
      // Chon du roi ma con vuot -> noi ro vuot bao nhieu, vi khong the cap it hon
      (nSel && selYd > left && left > 0)
        ? h('span', { title: this.t('mrOverTip'), style: { fontSize: 11.5, fontWeight: 700,
            color: C.dark, background: C.tint, border: '1px solid ' + C.border, borderRadius: 999,
            padding: '3px 10px', whiteSpace: 'nowrap' } },
          '+' + this.fmtn(this.moY1(selYd - left)) + ' YD ' + this.t('mrOverLab'))
        : null,
      h('div', { style: { flex: 1, minWidth: 8 } }),
      h('button', { onClick: close, style: this.btn('ghost') }, this.t('dsoClose')),
      h('button', { onClick: () => this.moSheetOpen(r), disabled: !plan.length,
        style: { ...this.btn('primary'), opacity: plan.length ? 1 : .5,
          cursor: plan.length ? 'pointer' : 'not-allowed' } },
        h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
          strokeWidth: 2 }, h('path', { d: 'M5 12h14M13 6l6 6-6 6' })),
        this.t('mrDo')));
    return h('div', { onClick: close, style: { position: 'fixed', inset: 0, background: 'rgba(24,28,22,.5)',
        backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 86, padding: 24 } },
      h('div', { onClick: ev => ev.stopPropagation(), style: { width: 'min(1180px,96vw)', maxHeight: '92vh',
          display: 'flex', flexDirection: 'column', background: C.white, borderRadius: 18,
          boxShadow: '0 30px 70px rgba(0,0,0,.34)', overflow: 'hidden' } },
        head, info, bar, tbl, foot));
  }

  // ==========================================================================
  // To phieu giao nhan xe vai — buoc xac nhan truoc khi ghi so
  // --------------------------------------------------------------------------
  // Bam "cap cho luot cat" trong hop chon cuon KHONG ghi gi ngay: no mo to phieu
  // nay len de hai ben doi chieu. Bam Xac nhan moi ghi so va tru Balance cua cac
  // cuon; bam Quay lai thi ve hop chon cuon, lua chon con nguyen.
  //
  // Ba o ten quan ly + ngay/gio xa vai la truong cua TO PHIEU (in ra roi ky
  // tay), khong luu vao du lieu; thu duoc luu la phan cap that.
  // ==========================================================================
  MOF_ISSUER = 'Trần Văn Hải';      // nguoi dang dang nhap ben kho vai
  MOF_RECV = 'Lê Thị Hồng';         // nguoi dang dang nhap ben nha cat

  // Roll # tren to phieu la so cuon TRONG LO (R01, R02...), khong phai ma day du
  moRollNo(x) { const p = String(x.no || '').split('-'); return 'R' + p[p.length - 1]; }

  // Ma to phieu: <tien to>-yyyymmdd-index, so thu tu chay theo NGAY va rieng cho
  // tung tien to — WC = warehouse -> cutting (vai), WS = warehouse -> sewing
  // (phu lieu). Mot lan bam Xac nhan = MOT to phieu; ma do duoc dong len tung
  // dong trong state.moHand nen tu cuon / kien tra nguoc ve to phieu duoc.
  moNextSlip(ts, pre) {
    const d = new Date(ts), p = n => String(n).padStart(2, '0');
    const dk = String(d.getFullYear()) + p(d.getMonth() + 1) + p(d.getDate());
    const m = this.state.moHand || {}; let mx = 0;
    Object.keys(m).forEach(k => (m[k] || []).forEach(x => { const c = String(x.slip || '');
      if (c.slice(0, 2) === pre && c.slice(3, 11) === dk)
        mx = Math.max(mx, parseInt(c.slice(12), 10) || 0); }));
    return pre + '-' + dk + '-' + String(mx + 1).padStart(3, '0');
  }

  moSheetOpen(r) {
    if (!this.moPickPlan(r).length) return;
    const d = new Date(), p = n => String(n).padStart(2, '0');
    this.set({ moSheet: r.id,
      // Ngay / gio CAP la chinh luc nay; ngay xa vai de kho dien
      moSheetRec: { slip: this.moNextSlip(d.getTime(), 'WC'),
        issueOn: p(d.getDate()) + '/' + p(d.getMonth() + 1), issueAt: this.dsoHM(d),
        whMgr: '', cutMgr: '', dir: '' } });
  }
  moSheetClose() { this.set({ moSheet: null }); }
  moSheetSet(k, v) { this.setState(st => ({ moSheetRec: { ...(st.moSheetRec || {}), [k]: v } })); }
  // Ghi so. Ba cot kho ghi ngoai bang duoc dien tu day, va state.moHand giu lai
  // da lay cuon nao -> Balance cua cuon tru theo.
  moSheetApply(r) {
    const plan = this.moPickPlan(r); if (!plan.length) return;
    const ts = Date.now(), slip = (this.state.moSheetRec || {}).slip || this.moNextSlip(ts, 'WC');
    const got = this.moY1(plan.reduce((a, p) => a + p.take, 0));
    const act = this.moY1(this.moFabN(r, 'act') + got);
    const n = this.moNum(this.moFabRaw(r, 'rolls')) + plan.length;
    const lots = this.moFabRaw(r, 'lot').split(/,\s*/).filter(Boolean);
    plan.forEach(p => { if (lots.indexOf(p.roll.lot) < 0) lots.push(p.roll.lot); });
    this.setState(st => {
      const hand = { ...(st.moHand || {}) };
      hand[r.id] = [...(hand[r.id] || []), ...plan.map(p => ({ slip, roll: p.roll.id,
        no: p.roll.no, lot: p.roll.lot, qty: p.take, ts }))];
      const fab = { ...(st.moFab || {}) };
      fab[r.id] = { ...(fab[r.id] || {}), act: String(act), lot: lots.join(', '), rolls: String(n) };
      return { moHand: hand, moFab: fab, moSheet: null, moPick: null, moPickSel: {} };
    });
  }

  renderMofSheet() {
    const h = React.createElement, C = this.C, S = this.mtStyles();
    const id = this.state.moSheet; if (!id) return null;
    const r = this.SEEDFAB.find(x => x.id === id); if (!r) return null;
    const rows = this.moPickPlan(r); if (!rows.length) return null;
    const rec = this.state.moSheetRec || {};
    const yd = this.moY1(rows.reduce((a, p) => a + p.take, 0));
    const close = () => this.moSheetClose();
    const th = { ...S.th, background: '#f4f7ee' };
    // O dien tay cua to phieu: chi mot net gach chan, chu mo khi con trong
    const inp = (k, ph, ex) => h('input', { value: rec[k] || '', placeholder: ph,
      onChange: e => this.moSheetSet(k, e.target.value),
      style: { width: '100%', border: 'none', borderBottom: '1px solid ' + C.border,
        background: 'none', padding: '3px 2px', fontSize: 12.5, fontFamily: S.mono, fontWeight: 600,
        color: C.ink, outline: 'none', boxSizing: 'border-box', ...(ex || {}) } });
    const fld = (lb, el) => h('div', { key: lb, style: { minWidth: 0 } },
      h('div', { style: { fontSize: 9, fontWeight: 700, letterSpacing: '.5px', color: C.faint,
        whiteSpace: 'nowrap', marginBottom: 3 } }, lb),
      el);
    const val = (v, ex, tip) => h('div', { title: tip || undefined,
      style: { fontSize: 13.5, fontWeight: 700, color: C.dark, fontFamily: S.mono, padding: '2px 0',
        wordBreak: 'break-all', ...(ex || {}) } }, v || '—');

    const head = h('div', { style: { display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 20px', flex: 'none', background: C.tint2,
        borderBottom: '1px solid ' + C.border } },
      h('div', { style: { fontSize: 13.5, fontWeight: 700, color: C.dark, marginRight: 'auto' } },
        this.t('msTitle')),
      h('button', { title: this.t('dsoClose'), onClick: close,
        style: { border: '1px solid ' + C.border, background: C.white, color: C.sub, borderRadius: 8,
          width: 26, height: 26, flex: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1,
          padding: 0, fontFamily: 'inherit' }, 'style-hover': { background: C.tint } }, '×'));
    // 8 o chia DUNG 4 cot -> hai dong deu nhau: dong tren la to phieu nao / cho
    // lo cat nao, dong duoi la moc thoi gian. minmax(0,1fr) cho o co lai duoc
    // tren man hep, khong pha the luoi.
    //
    // Ca 8 o deu CHI DOC: so phieu / ma hang / item vai / luot cap la du lieu cua
    // luot cat, ngay-gio cap la chinh luc mo phieu. Ngay-gio xa vai he thong
    // khong biet -> in dau gach, ghi tay tren to in nhu cot -/+ SAU CAT.
    const form = h('div', { style: { flex: 'none', padding: '13px 20px 15px', display: 'grid',
        gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '13px 22px',
        borderBottom: '1px solid ' + C.line } },
      fld(this.t('moNo'), val(rec.slip, { color: C.primary })),
      fld(this.t('moStyle'), val(r.style)),
      fld(this.t('mofItem'), val(r.item)),
      fld(this.t('msOrder'), val(r.turn)),
      fld(this.t('msRelaxOn'), val('', { color: C.faint }, this.t('msByHand'))),
      fld(this.t('msRelaxAt'), val('', { color: C.faint }, this.t('msByHand'))),
      fld(this.t('msIssueOn'), val(rec.issueOn)),
      fld(this.t('msIssueAt'), val(rec.issueAt)));

    const body = rows.map(p => {
      const x = p.roll, c = (v, ex) => h('td', { style: { ...S.td, ...(ex || {}) } }, v);
      return h('tr', { key: x.id },
        c(x.color || '—', { fontWeight: 600 }),
        c(this.moRollNo(x), { fontFamily: S.mono, fontWeight: 700, color: C.primary }),
        c(x.lot, { fontFamily: S.mono, whiteSpace: 'nowrap' }),
        c(this.fmtn(this.moRollBal(x)), { textAlign: 'right', fontFamily: S.mono, fontWeight: 700 }),
        c(this.fmtn(p.take), { textAlign: 'right', fontFamily: S.mono, fontWeight: 700,
          color: C.dark, background: C.tint2 }),
        h('td', { style: { ...S.td, borderRight: 'none', textAlign: 'center', color: C.faint,
          fontFamily: S.mono } }, '–'));
    });
    const wid = ['18%', '14%', '20%', '17%', '17%', '14%'];
    const tbl = h('div', { className: 'yscroll', style: { overflow: 'auto', flex: 1, minHeight: 140 } },
      h('table', { style: { width: '100%', minWidth: '760px', borderCollapse: 'collapse' } },
        h('colgroup', null, wid.map((w, i) => h('col', { key: i, style: { width: w } }))),
        h('thead', null, h('tr', null,
          h('th', { style: { ...th, position: 'sticky', top: 0, zIndex: 1 } }, this.t('moColor')),
          h('th', { style: { ...th, position: 'sticky', top: 0, zIndex: 1 } }, this.t('msRoll')),
          h('th', { style: { ...th, position: 'sticky', top: 0, zIndex: 1 } }, this.t('mrLot')),
          h('th', { title: this.t('msRelaxQTip'),
            style: { ...th, textAlign: 'right', position: 'sticky', top: 0, zIndex: 1 } },
            this.t('msRelaxQ')),
          h('th', { title: this.t('msIssueQTip'),
            style: { ...th, textAlign: 'right', position: 'sticky', top: 0, zIndex: 1 } },
            this.t('msIssueQ')),
          h('th', { title: this.t('msAfterTip'),
            style: { ...th, borderRight: 'none', textAlign: 'center', position: 'sticky',
              top: 0, zIndex: 1 } }, this.t('msAfter')))),
        h('tbody', null, body)));

    const sg = (lb, name, cap, k) => h('div', { key: lb, style: { flex: '1 1 150px', minWidth: 0,
        textAlign: 'center', padding: '0 8px' } },
      h('div', { style: { fontSize: 9, fontWeight: 700, letterSpacing: '.5px', color: C.faint,
        whiteSpace: 'nowrap' } }, lb),
      k ? inp(k, this.t('msNamePh'), { textAlign: 'center', fontFamily: 'inherit', marginTop: 8 })
        : h('div', { style: { fontSize: 13.5, fontWeight: 700, color: C.dark, marginTop: 8,
            paddingBottom: 4, borderBottom: '1px solid ' + C.border,
            fontFamily: "'IBM Plex Mono',monospace" } }, name),
      h('div', { style: { fontSize: 9.5, color: C.faint, marginTop: 4, lineHeight: 1.35 } }, cap));
    const signs = h('div', { style: { flex: 'none', display: 'flex', flexWrap: 'wrap', rowGap: 14,
        padding: '15px 14px 16px', borderTop: '1px solid ' + C.line, background: '#fbfcf8' } },
      sg(this.t('msIssuer'), this.MOF_ISSUER, this.t('msIssuerCap')),
      sg(this.t('msRecv'), this.MOF_RECV, this.t('msRecvCap')),
      sg(this.t('msWhMgr'), '', this.t('msNameCap'), 'whMgr'),
      sg(this.t('msCutMgr'), '', this.t('msNameCap'), 'cutMgr'),
      sg(this.t('msDir'), '', this.t('msNameCap'), 'dir'));

    const foot = h('div', { style: { display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 20px', flex: 'none', borderTop: '1px solid ' + C.line, flexWrap: 'wrap' } },
      h('span', { style: { fontSize: 12, fontWeight: 700, fontFamily: S.mono, color: C.ink,
        whiteSpace: 'nowrap' } },
        this.fmt(rows.length) + ' ' + this.t('mrCount') + ' · ' + this.fmtn(yd) + ' YD'),
      h('div', { style: { flex: 1, minWidth: 8 } }),
      h('button', { onClick: close, style: this.btn('ghost') }, this.t('msBack')),
      h('button', { onClick: () => this.moSheetApply(r), style: this.btn('primary') },
        h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
          strokeWidth: 2 }, h('path', { d: 'M20 6 9 17l-5-5' })),
        this.t('msOk')));

    return h('div', { onClick: close, style: { position: 'fixed', inset: 0,
        background: 'rgba(24,28,22,.5)', backdropFilter: 'blur(2px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 92, padding: 24 } },
      h('div', { onClick: ev => ev.stopPropagation(), style: { width: 'min(1060px,96vw)',
          maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: C.white,
          borderRadius: 14, boxShadow: '0 30px 70px rgba(0,0,0,.4)', overflow: 'hidden' } },
        head, form, tbl, signs, foot));
  }

  // ==========================================================================
  // Trims Out — xuat phu lieu xuong chuyen may
  // --------------------------------------------------------------------------
  // Cung mot khuon voi Xuat vai: bang chi doc -> nut Xuat kho -> hop chon KIEN
  // -> to phieu giao nhan de xac nhan -> ghi so.
  //
  //   SL CAN    dinh muc x SL san pham x hao (dong bang trong seed)
  //   TON KHO   tong so luong cac kien cua dong do trong kho
  //   DA XUAT   `out` da chot trong seed + tong cac lan xuat o state.moHand
  //   CON LAI   SL CAN - DA XUAT
  //
  // Khac ben vai mot cho: phu lieu DEM RA duoc khoi kien, nen moi kien duoc chon
  // co mot o go SO LUONG MUON XUAT — khong buoc phai lay het kien.
  // ==========================================================================
  moFrac(r) { return r.unit === 'MT' || r.unit === 'YD'; }
  moRound(r, n) { n = Number(n) || 0; return this.moFrac(r) ? Math.round(n * 10) / 10 : Math.round(n); }

  // Cong so da xuat cua tung dong tu so tay (state.moHand) — dung chung mot so
  // voi ben vai, id dong khac tien to (MF… / MT…) nen khong lan nhau.
  moHandSum() {
    const m = this.state.moHand || {};
    if (this._moHS && this._moHS.m === m) return this._moHS.sum;
    const sum = {};
    Object.keys(m).forEach(k => { sum[k] = (m[k] || []).reduce((a, x) => a + (Number(x.qty) || 0), 0); });
    this._moHS = { m, sum };
    return sum;
  }
  // So TO PHIEU da phat hanh cho mot dong (mot lan xac nhan = mot to)
  moSlipsOf(id) {
    const s = {};
    ((this.state.moHand || {})[id] || []).forEach(x => { if (x.slip) s[x.slip] = 1; });
    return Object.keys(s);
  }
  moTrimRows() {
    const m = this.state.moHand || {};
    if (this._moT && this._moT.m === m) return this._moT.rows;
    const sum = this.moHandSum();
    const rows = this.SEEDTRIM.map(r => {
      const out = this.moRound(r, (Number(r.out) || 0) + (sum[r.id] || 0));
      return { ...r, out, slips: this.moSlipsOf(r.id).length,
        left: this.moRound(r, Math.max(0, (Number(r.need) || 0) - out)) };
    });
    this._moT = { m, rows };
    return rows;
  }
  moTrimList() {
    const rows = this.moTrimRows(), q = this.dfFold(this.state.motQ || '');
    if (!q) return rows;
    return rows.filter(r => this.dfFold([r.brand, r.style, r.po, r.item, r.desc, r.color, r.pos, r.sup]
      .join(' ')).indexOf(q) >= 0);
  }
  moStat(r) { const need = Number(r.need) || 0;
    return r.out <= 0 ? 'new' : (r.out + 1e-9 >= need ? 'done' : 'part'); }
  moShort(r) { return (Number(r.stock) || 0) < (Number(r.need) || 0); }
  moTrimLeft(r) { return this.moRound(r, Math.max(0, (Number(r.need) || 0) - r.out)); }
  // Phieu xuat phu lieu phat hanh HOM NAY, dem theo ma phieu chu khong theo dong
  moTodayN() {
    const t = this.dsoToday(), m = this.state.moHand || {}, s = {};
    this.SEEDTRIM.forEach(r => (m[r.id] || []).forEach(x => {
      if (x.slip && this.psFmtD(new Date(x.ts || 0)) === t) s[x.slip] = 1; }));
    return Object.keys(s).length;
  }
  moTrimSlips() {
    const m = this.state.moHand || {}, s = {};
    this.SEEDTRIM.forEach(r => (m[r.id] || []).forEach(x => { if (x.slip) s[x.slip] = 1; }));
    return Object.keys(s).length;
  }

  // ---- kho phu lieu: tung kien -------------------------------------------
  moPacksFor(r) {
    if (this._moPF && this._moPF.id === r.id) return this._moPF.list;
    const list = this.SEEDPACK.filter(x => x.row === r.id);
    this._moPF = { id: r.id, list };
    return list;
  }
  moPackOut(x) { return this.moRound(x, (Number(x.issued) || 0) + (this.moUsed()[x.id] || 0)); }
  moPackBal(x) { return this.moRound(x, (Number(x.qty) || 0) - this.moPackOut(x)); }
  // Kien con hang len truoc (theo lo roi den so kien), kien het xuong duoi cung
  moPackSorted(r) {
    const list = this.moPacksFor(r), m = this.state.moHand || {};
    if (this._moPS && this._moPS.list === list && this._moPS.m === m) return this._moPS.out;
    const out = list.slice().sort((a, b) => (this.moPackBal(b) > 0) - (this.moPackBal(a) > 0)
      || a.lot.localeCompare(b.lot) || a.no.localeCompare(b.no));
    this._moPS = { list, m, out };
    return out;
  }

  renderMotBody() {
    return this.moPage('Trims Out', 'motTitle', 'S-08-MATOUT-TRIM · UI Proto',
      this.renderMotKpis(), this.renderMotTable(), this.renderMotPick(), this.renderMotSheet());
  }
  renderMotKpis() {
    const rows = this.moTrimRows();
    const wait = rows.filter(r => this.moStat(r) !== 'done').length;
    const short = rows.filter(r => this.moShort(r)).length;
    return this.moKpis([
      [this.t('motK1'), this.fmt(wait), this.t('motK1s'), wait > 0],
      [this.t('motK2'), this.fmt(short), this.t('motK2s'), short > 0],
      [this.t('motK3'), this.fmt(this.moTodayN()), this.t('motK3s')],
      [this.t('motK4'), this.fmt(this.moTrimSlips()), this.t('motK4s')]]);
  }
  moChip(r) {
    const h = React.createElement, C = this.C, s = this.moStat(r);
    const c = s === 'done' ? { fg: '#2f7d32', bg: '#eaf5e4', bd: '#cfe3a6' }
      : s === 'part' ? { fg: '#b0791b', bg: '#fbf3df', bd: '#ecdcb4' }
      : { fg: C.sub, bg: '#f2f4ee', bd: C.border };
    return h('span', { style: { fontSize: 11, fontWeight: 700, color: c.fg, background: c.bg,
      border: '1px solid ' + c.bd, borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' } },
      this.t(s === 'done' ? 'moStDone' : (s === 'part' ? 'moStPart' : 'moStNew')));
  }
  renderMotTable() {
    const h = React.createElement, C = this.C, S = this.mtStyles();
    const all = this.moTrimRows(), rows = this.moTrimList(), q = this.state.motQ || '';
    const action = h('div', { style: { display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' } },
      h('span', { style: { fontSize: 11.5, fontWeight: 700, fontFamily: S.mono, color: C.dark,
        background: C.tint, border: '1px solid ' + C.border, borderRadius: 999, padding: '4px 10px',
        whiteSpace: 'nowrap' } }, this.fmt(rows.length) + ' ' + this.t('moCount')),
      this.dfSearchBox(q, v => this.set({ motQ: v }), false, 'moSearch'));
    const num = (v, bg, col, tip) => h('td', { title: tip || undefined,
      style: { ...S.td, background: bg, textAlign: 'right', fontFamily: S.mono, fontWeight: 700,
        color: col || C.ink, whiteSpace: 'nowrap' } }, v);
    const body = rows.map((r, i) => {
      const bg = i % 2 ? '#f7f9f3' : C.white;
      const short = this.moShort(r);
      const c = (v, ex) => h('td', { style: { ...S.td, background: bg, ...(ex || {}) } }, v || '—');
      return h('tr', { key: r.id },
        h('td', { style: { ...S.td, background: bg, textAlign: 'center', fontFamily: S.mono,
          color: C.faint, fontWeight: 600 } }, i + 1),
        c(r.brand, { wordBreak: 'break-word' }),
        c(r.style, { fontFamily: S.mono, fontWeight: 700, wordBreak: 'break-all' }),
        c(r.po, { fontFamily: S.mono, whiteSpace: 'nowrap' }),
        c(r.item, { fontFamily: S.mono, fontWeight: 700, color: C.primary, wordBreak: 'break-all' }),
        c(r.desc, { fontSize: 11.5, color: C.sub, wordBreak: 'break-word' }),
        c(r.pos, { fontFamily: S.mono, fontSize: 11.5, color: C.sub, whiteSpace: 'nowrap' }),
        num(this.moN3(r.cons), bg, C.sub, this.t('moConsTip')),
        num(this.fmtn(r.need), bg, C.ink, this.t('moNeedTip')),
        num(this.fmtn(r.stock), bg, short ? '#c0392b' : C.sub, this.t(short ? 'moShortTip' : 'moStockTip')),
        num(r.out ? this.fmtn(r.out) : '—', bg, r.out ? '#2f7d32' : C.faint, this.t('moOutTip')),
        num(r.left ? this.fmtn(r.left) : '—', bg, r.left ? '#b0791b' : '#2f7d32', this.t('moLeftTip')),
        h('td', { style: { ...S.td, background: bg, whiteSpace: 'nowrap' } }, this.moChip(r)),
        h('td', { style: { ...S.td, background: bg, borderRight: 'none', whiteSpace: 'nowrap' } },
          this.mtBtn(this.t('moIssueBtn'), () => this.moTPickOpen(r),
            { border: '1px solid ' + C.primary, background: C.tint })));
    });
    const wid = ['46px', '104px', '132px', '116px', '136px', 'auto', '108px',
                 '92px', '104px', '104px', '104px', '104px', '124px', '112px'];
    const tbl = h('div', { className: 'yscroll', style: { overflowX: 'auto' } },
      h('table', { style: { width: '100%', minWidth: '1260px', borderCollapse: 'collapse' } },
        h('colgroup', null, wid.map((w, i) => h('col', { key: i, style: { width: w } }))),
        h('thead', null, h('tr', null,
          h('th', { style: { ...S.th, textAlign: 'center', paddingLeft: 8 } }, this.t('mtNo')),
          ...['moBrand', 'moStyle', 'moPo', 'moTrimCode', 'moDesc', 'moSpec']
            .map(k => h('th', { key: k, style: S.th }, this.t(k))),
          ...['moCons', 'moNeed', 'moStock', 'moOut', 'moLeft']
            .map(k => h('th', { key: k, style: { ...S.th, textAlign: 'right' } }, this.t(k))),
          h('th', { style: S.th }, this.t('moSt')),
          h('th', { style: { ...S.th, borderRight: 'none' } }, this.t('mtAct')))),
        h('tbody', null, rows.length ? body : h('tr', null, h('td', { colSpan: wid.length,
          style: { ...S.td, textAlign: 'center', color: C.faint, padding: '44px 16px',
            borderRight: 'none' } }, this.t(all.length ? 'moNoHit' : 'moEmpty'))))));
    return this.dsoCard('motPanel', 'motSub', 'Trims Out', tbl, { action });
  }

  // ==========================================================================
  // Hop chon kien phu lieu de xuat — song song voi hop chon cuon vai
  // ==========================================================================
  moTPickOpen(r) { this.set({ moTPick: r.id, moTPickSel: {}, moTPickQty: {}, moTPickQ: '' }); }
  moTPickClose() { this.set({ moTPick: null, moTPickSel: {}, moTPickQty: {} }); }
  // Tick chon mot kien -> o so luong hien ra, dien san DUNG PHAN CON THIEU cua
  // dong (khong qua so con lai trong kien); dong da du thi dien ca kien.
  moTPickTog(x) {
    const bal = this.moPackBal(x); if (bal <= 0) return;
    const r = this.moTrimRows().find(y => y.id === x.row); if (!r) return;
    this.setState(st => {
      const s = { ...(st.moTPickSel || {}) }, q = { ...(st.moTPickQty || {}) };
      if (s[x.id]) { delete s[x.id]; delete q[x.id]; return { moTPickSel: s, moTPickQty: q }; }
      s[x.id] = 1;
      let want = this.moTrimLeft(r);
      this.moPacksFor(r).forEach(y => { if (y.id === x.id || !s[y.id]) return;
        want = this.moRound(r, want - Math.min(this.moPackBal(y), this.moNum(q[y.id]))); });
      const take = this.moRound(r, Math.min(bal, Math.max(0, want)));
      q[x.id] = String(take > 0 ? take : bal);
      return { moTPickSel: s, moTPickQty: q };
    });
  }
  moTPickQtySet(x, v) {
    this.setState(st => { const q = { ...(st.moTPickQty || {}) };
      q[x.id] = v; return { moTPickQty: q }; });
  }
  moTPickList(r) {
    const all = this.moPackSorted(r), q = this.dfFold(this.state.moTPickQ || '');
    if (!q) return all;
    return all.filter(x => this.dfFold([x.no, x.lot, x.loc, x.item, x.color]
      .join(' ')).indexOf(q) >= 0);
  }
  // Tick san so kien it nhat va dien so luong VUA DU phan con thieu — kien cuoi
  // chi lay dung phan con lai, tra ve ke.
  moTPickAuto(r) {
    let want = this.moTrimLeft(r); const s = {}, q = {};
    this.moPackSorted(r).forEach(x => {
      if (want <= 0) return;
      const bal = this.moPackBal(x); if (bal <= 0) return;
      const take = this.moRound(r, Math.min(bal, want));
      s[x.id] = 1; q[x.id] = String(take); want = this.moRound(r, want - take);
    });
    this.set({ moTPickSel: s, moTPickQty: q });
  }
  // Lay dung so nguoi go, khong bao gio qua so con lai trong kien.
  moTPickPlan(r) {
    const sel = this.state.moTPickSel || {}, q = this.state.moTPickQty || {}, out = [];
    this.moPackSorted(r).forEach(x => {
      if (!sel[x.id]) return;
      const bal = this.moPackBal(x); if (bal <= 0) return;
      const take = this.moRound(r, Math.min(bal, this.moNum(q[x.id])));
      if (take <= 0) return;
      out.push({ pack: x, take });
    });
    return out;
  }

  renderMotPick() {
    const h = React.createElement, C = this.C, S = this.mtStyles();
    const id = this.state.moTPick; if (!id) return null;
    const r = this.moTrimRows().find(x => x.id === id); if (!r) return null;
    const all = this.moPackSorted(r), rows = this.moTPickList(r);
    const sel = this.state.moTPickSel || {}, mine = {};
    ((this.state.moHand || {})[r.id] || []).forEach(x => { mine[x.pack] = 1; });
    const plan = this.moTPickPlan(r);
    const nSel = plan.length, selQ = this.moRound(r, plan.reduce((a, p) => a + p.take, 0));
    const left = this.moTrimLeft(r), close = () => this.moTPickClose();
    const head = this.moMdHead('mptTitle', 'mptSub',
      ['M3 8h18v12H3z', 'M3 8l3-4h12l3 4', 'M12 8v12'], close);
    const info = h('div', { style: { display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
        flex: 'none', padding: '13px 20px', background: C.tint2, borderBottom: '1px solid ' + C.line } },
      h('div', { style: { flex: '1 1 280px', minWidth: 0, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(96px,1fr))', gap: 14 } },
        this.moFld(this.t('moStyle'), r.style, { fontFamily: S.mono }),
        this.moFld(this.t('moPo'), r.po, { fontFamily: S.mono }),
        this.moFld(this.t('moTrimCode'), r.item, { fontFamily: S.mono, color: C.primary }),
        this.moFld(this.t('moColor'), r.color, { color: C.dark }),
        this.moFld(this.t('moSpec'), r.pos, { fontFamily: S.mono, fontSize: 12.5 }),
        this.moFld(this.t('moDesc'), r.desc, { fontSize: 12, fontWeight: 600, color: C.sub })),
      h('div', { style: { flex: 'none', display: 'flex', gap: 9, flexWrap: 'wrap' } },
        [[this.t('moNeed'), r.need, C.ink], [this.t('moOut'), r.out, '#2f7d32'],
         [this.t('moLeft'), left, left ? '#b0791b' : C.faint]]
          .map(([lb, v, fg]) => this.moBox(lb, this.fmtn(v), fg, r.unit || ''))));
    const bar = h('div', { style: { display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap',
        flex: 'none', padding: '11px 20px', borderBottom: '1px solid ' + C.line } },
      h('span', { style: { fontSize: 11.5, fontWeight: 700, fontFamily: S.mono, color: C.dark,
        background: C.tint, border: '1px solid ' + C.border, borderRadius: 999, padding: '4px 10px',
        whiteSpace: 'nowrap' } }, this.fmt(rows.length) + ' ' + this.t('mptCount')),
      this.dfSearchBox(this.state.moTPickQ || '', v => this.set({ moTPickQ: v }), false, 'mptSearch'),
      h('div', { style: { flex: 1, minWidth: 8 } }),
      left > 0 ? this.mtBtn(this.t('mrAuto'), () => this.moTPickAuto(r),
        { padding: '6px 12px', fontSize: 12 }) : null);
    const qty = this.state.moTPickQty || {};
    const body = rows.map((x, i) => {
      const bal = this.moPackBal(x), on = !!sel[x.id], gone = bal <= 0;
      const bg = on ? C.tint : (i % 2 ? '#f7f9f3' : C.white);
      const c = (v, ex) => h('td', { style: { ...S.td, background: bg, opacity: gone ? .55 : 1,
        ...(ex || {}) } }, v || '—');
      return h('tr', { key: x.id, onClick: () => this.moTPickTog(x),
          title: gone ? this.t('mptOutTip') : this.t('mrRowTip'),
          style: { cursor: gone ? 'default' : 'pointer', background: bg },
          'style-hover': gone ? {} : { background: C.tint } },
        h('td', { style: { ...S.td, background: bg, textAlign: 'center' } },
          gone ? null : this.moTick(on, 16)),
        c(h('span', null, x.no, mine[x.id] ? h('span', { title: this.t('mptHereTip'),
          style: { marginLeft: 6, fontSize: 9.5, fontWeight: 700, color: C.dark, background: C.badge,
            borderRadius: 999, padding: '1px 6px' } }, this.t('mrHere')) : null),
          { fontFamily: S.mono, fontWeight: 700, whiteSpace: 'nowrap' }),
        c(x.lot, { fontFamily: S.mono, whiteSpace: 'nowrap' }),
        c(x.style, { fontFamily: S.mono, wordBreak: 'break-all' }),
        c(x.item, { fontFamily: S.mono, fontWeight: 700, color: C.primary, wordBreak: 'break-all' }),
        c(x.color, { fontWeight: 600, color: C.dark, wordBreak: 'break-word' }),
        c(x.unit, { textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.sub }),
        c(x.loc, { fontFamily: S.mono, fontSize: 11.5, color: C.sub, whiteSpace: 'nowrap' }),
        c(this.fmtn(x.qty), { textAlign: 'right', fontFamily: S.mono, fontWeight: 700 }),
        c(this.fmtn(this.moPackOut(x)), { textAlign: 'right', fontFamily: S.mono, fontWeight: 700,
          color: this.moPackOut(x) ? C.sub : C.faint }),
        h('td', { style: { ...S.td, background: bg, textAlign: 'right', fontFamily: S.mono,
          fontWeight: 700, opacity: gone ? .55 : 1,
          color: gone ? C.faint : '#2f7d32' } }, gone ? this.t('mrOut') : this.fmtn(bal)),
        h('td', { onClick: e => e.stopPropagation(),
            style: { ...S.td, background: bg, borderRight: 'none', textAlign: 'right' } },
          gone ? h('span', { style: { color: C.faint, fontFamily: S.mono } }, '\u2014')
               : this.moQtyInp(on ? (qty[x.id] || '') : '',
                   v => this.moTPickQtySet(x, v), !on)));
    });
    const wid = ['44px', '138px', '118px', 'auto', '132px', '106px', '54px', '100px', '92px',
                 '96px', '96px', '108px'];
    const tbl = h('div', { className: 'yscroll', style: { overflow: 'auto', flex: 1, minHeight: 160 } },
      h('table', { style: { width: '100%', minWidth: '1180px', borderCollapse: 'collapse' } },
        h('colgroup', null, wid.map((w, i) => h('col', { key: i, style: { width: w } }))),
        h('thead', null, h('tr', null,
          h('th', { style: { ...S.th, position: 'sticky', top: 0, zIndex: 1 } }, ''),
          ...['mptNo', 'mrLot', 'mrStyle', 'mptItem', 'mrColor', 'mptUnit', 'mrLoc']
            .map(k => h('th', { key: k, style: { ...S.th, position: 'sticky', top: 0, zIndex: 1 } },
              this.t(k))),
          ...['mptQty', 'mptIssued'].map(k => h('th', { key: k,
            style: { ...S.th, textAlign: 'right', position: 'sticky', top: 0, zIndex: 1 } }, this.t(k))),
          h('th', { style: { ...S.th, textAlign: 'right', position: 'sticky', top: 0, zIndex: 1 } },
            this.t('mrBal')),
          h('th', { title: this.t('mptTakeTip'),
            style: { ...S.th, textAlign: 'right', borderRight: 'none', position: 'sticky',
              top: 0, zIndex: 1 } }, this.t('mptTake')))),
        h('tbody', null, rows.length ? body : h('tr', null, h('td', { colSpan: wid.length,
          style: { ...S.td, textAlign: 'center', color: C.faint, padding: '44px 16px',
            borderRight: 'none' } }, this.t(all.length ? 'mptNoHit' : 'mptEmpty'))))));
    const foot = h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
        flex: 'none', borderTop: '1px solid ' + C.line, background: '#f8faf3', flexWrap: 'wrap' } },
      h('span', { style: { fontSize: 12, fontWeight: 700, color: nSel ? C.ink : C.faint,
        fontFamily: S.mono, whiteSpace: 'nowrap' } },
        this.t('mrPicked') + ' ' + this.fmt(nSel) + ' ' + this.t('mptCount')
        + ' · ' + this.fmtn(selQ) + ' ' + (r.unit || '')),
      (nSel && selQ > left && left > 0)
        ? h('span', { title: this.t('mptOverTip'), style: { fontSize: 11.5, fontWeight: 700,
            color: C.dark, background: C.tint, border: '1px solid ' + C.border, borderRadius: 999,
            padding: '3px 10px', whiteSpace: 'nowrap' } },
          '+' + this.fmtn(this.moRound(r, selQ - left)) + ' ' + (r.unit || '') + ' '
            + this.t('mrOverLab'))
        : null,
      h('div', { style: { flex: 1, minWidth: 8 } }),
      h('button', { onClick: close, style: this.btn('ghost') }, this.t('dsoClose')),
      h('button', { onClick: () => this.moTSheetOpen(r), disabled: !plan.length,
        style: { ...this.btn('primary'), opacity: plan.length ? 1 : .5,
          cursor: plan.length ? 'pointer' : 'not-allowed' } },
        h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
          strokeWidth: 2 }, h('path', { d: 'M5 12h14M13 6l6 6-6 6' })),
        this.t('mptDo')));
    return this.moMdShell(close, 'min(1180px,96vw)', 86, [head, info, bar, tbl, foot]);
  }

  // ==========================================================================
  // To phieu giao nhan phu lieu — kho <-> chuyen may
  // --------------------------------------------------------------------------
  // Cung khuon voi to phieu giao nhan xe vai: ma phieu WS-yyyymmdd-index, dau
  // phieu 8 o chi doc chia 2 dong, bang cac kien, khoi 5 chu ky.
  // ==========================================================================
  MOT_ISSUER = 'Ngô Thị Lan';        // nguoi dang dang nhap ben kho phu lieu
  MOT_RECV = 'Bùi Văn Khoa';         // nguoi dang dang nhap ben chuyen may

  moPackNo(x) { const p = String(x.no || '').split('-'); return 'K' + p[p.length - 1]; }

  moTSheetOpen(r) {
    if (!this.moTPickPlan(r).length) return;
    const d = new Date(), p = n => String(n).padStart(2, '0');
    this.set({ moTSheet: r.id,
      moTSheetRec: { slip: this.moNextSlip(d.getTime(), 'WS'),
        outOn: p(d.getDate()) + '/' + p(d.getMonth() + 1), outAt: this.dsoHM(d),
        whMgr: '', prodMgr: '', dir: '' } });
  }
  moTSheetClose() { this.set({ moTSheet: null }); }
  moTSheetSet(k, v) { this.setState(st => ({ moTSheetRec: { ...(st.moTSheetRec || {}), [k]: v } })); }
  moTSheetApply(r) {
    const plan = this.moTPickPlan(r); if (!plan.length) return;
    const ts = Date.now(), slip = (this.state.moTSheetRec || {}).slip || this.moNextSlip(ts, 'WS');
    this.setState(st => {
      const hand = { ...(st.moHand || {}) };
      hand[r.id] = [...(hand[r.id] || []), ...plan.map(p => ({ slip, pack: p.pack.id,
        no: p.pack.no, lot: p.pack.lot, qty: p.take, ts }))];
      return { moHand: hand, moTSheet: null, moTPick: null, moTPickSel: {} };
    });
  }

  renderMotSheet() {
    const h = React.createElement, C = this.C, S = this.mtStyles();
    const id = this.state.moTSheet; if (!id) return null;
    const r = this.moTrimRows().find(x => x.id === id); if (!r) return null;
    const rows = this.moTPickPlan(r); if (!rows.length) return null;
    const rec = this.state.moTSheetRec || {};
    const qty = this.moRound(r, rows.reduce((a, p) => a + p.take, 0));
    const close = () => this.moTSheetClose();
    const th = { ...S.th, background: '#f4f7ee' };
    const head = h('div', { style: { display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 20px', flex: 'none', background: C.tint2,
        borderBottom: '1px solid ' + C.border } },
      h('div', { style: { fontSize: 13.5, fontWeight: 700, color: C.dark, marginRight: 'auto' } },
        this.t('mtsTitle')),
      h('button', { title: this.t('dsoClose'), onClick: close,
        style: { border: '1px solid ' + C.border, background: C.white, color: C.sub, borderRadius: 8,
          width: 26, height: 26, flex: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1,
          padding: 0, fontFamily: 'inherit' }, 'style-hover': { background: C.tint } }, '×'));
    const form = h('div', { style: { flex: 'none', padding: '13px 20px 15px', display: 'grid',
        gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '13px 22px',
        borderBottom: '1px solid ' + C.line } },
      this.moFld2(this.t('moNo'), rec.slip, { color: C.primary }),
      this.moFld2(this.t('moStyle'), r.style),
      this.moFld2(this.t('moPo'), r.po),
      this.moFld2(this.t('moTrimCode'), r.item),
      this.moFld2(this.t('moSpec'), r.pos),
      this.moFld2(this.t('moColor'), r.color),
      this.moFld2(this.t('mtsOutOn'), rec.outOn),
      this.moFld2(this.t('mtsOutAt'), rec.outAt));
    const body = rows.map(p => {
      const x = p.pack, c = (v, ex) => h('td', { style: { ...S.td, ...(ex || {}) } }, v);
      return h('tr', { key: x.id },
        c(x.color || '—', { fontWeight: 600 }),
        c(this.moPackNo(x), { fontFamily: S.mono, fontWeight: 700, color: C.primary }),
        c(x.lot, { fontFamily: S.mono, whiteSpace: 'nowrap' }),
        c(x.unit || '—', { textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.sub }),
        c(this.fmtn(this.moPackBal(x)), { textAlign: 'right', fontFamily: S.mono, fontWeight: 700 }),
        c(this.fmtn(p.take), { textAlign: 'right', fontFamily: S.mono, fontWeight: 700,
          color: C.dark, background: C.tint2 }),
        h('td', { style: { ...S.td, borderRight: 'none', textAlign: 'center', color: C.faint,
          fontFamily: S.mono } }, '–'));
    });
    const wid = ['16%', '13%', '18%', '9%', '15%', '15%', '14%'];
    const tbl = h('div', { className: 'yscroll', style: { overflow: 'auto', flex: 1, minHeight: 140 } },
      h('table', { style: { width: '100%', minWidth: '760px', borderCollapse: 'collapse' } },
        h('colgroup', null, wid.map((w, i) => h('col', { key: i, style: { width: w } }))),
        h('thead', null, h('tr', null,
          h('th', { style: { ...th, position: 'sticky', top: 0, zIndex: 1 } }, this.t('moColor')),
          h('th', { style: { ...th, position: 'sticky', top: 0, zIndex: 1 } }, this.t('mptNo')),
          h('th', { style: { ...th, position: 'sticky', top: 0, zIndex: 1 } }, this.t('mrLot')),
          h('th', { style: { ...th, textAlign: 'center', position: 'sticky', top: 0, zIndex: 1 } },
            this.t('mptUnit')),
          h('th', { title: this.t('mtsPackQTip'),
            style: { ...th, textAlign: 'right', position: 'sticky', top: 0, zIndex: 1 } },
            this.t('mptQty')),
          h('th', { title: this.t('mtsOutQTip'),
            style: { ...th, textAlign: 'right', position: 'sticky', top: 0, zIndex: 1 } },
            this.t('mtsOutQ')),
          h('th', { title: this.t('mtsAfterTip'),
            style: { ...th, borderRight: 'none', textAlign: 'center', position: 'sticky',
              top: 0, zIndex: 1 } }, this.t('mtsAfter')))),
        h('tbody', null, body)));
    const nm = k => this.moSgInp(rec[k] || '', v => this.moTSheetSet(k, v));
    const signs = h('div', { style: { flex: 'none', display: 'flex', flexWrap: 'wrap', rowGap: 14,
        padding: '15px 14px 16px', borderTop: '1px solid ' + C.line, background: '#fbfcf8' } },
      this.moSg(this.t('mtsIssuer'), this.MOT_ISSUER, this.t('mtsIssuerCap'), null),
      this.moSg(this.t('mtsRecv'), this.MOT_RECV, this.t('mtsRecvCap'), null),
      this.moSg(this.t('mtsWhMgr'), '', this.t('msNameCap'), nm('whMgr')),
      this.moSg(this.t('mtsProdMgr'), '', this.t('msNameCap'), nm('prodMgr')),
      this.moSg(this.t('msDir'), '', this.t('msNameCap'), nm('dir')));
    const foot = h('div', { style: { display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 20px', flex: 'none', borderTop: '1px solid ' + C.line, flexWrap: 'wrap' } },
      h('span', { style: { fontSize: 12, fontWeight: 700, fontFamily: S.mono, color: C.ink,
        whiteSpace: 'nowrap' } },
        this.fmt(rows.length) + ' ' + this.t('mptCount') + ' · ' + this.fmtn(qty)
          + ' ' + (r.unit || '')),
      h('div', { style: { flex: 1, minWidth: 8 } }),
      h('button', { onClick: close, style: this.btn('ghost') }, this.t('msBack')),
      h('button', { onClick: () => this.moTSheetApply(r), style: this.btn('primary') },
        h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
          strokeWidth: 2 }, h('path', { d: 'M20 6 9 17l-5-5' })),
        this.t('mtsOk')));
    return this.moMdShell(close, 'min(1060px,96vw)', 92, [head, form, tbl, signs, foot]);
  }
