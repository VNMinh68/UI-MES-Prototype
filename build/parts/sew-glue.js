  // ==========================================================================
  // Khai bao module
  // ==========================================================================
  MOD = {
    id: 'sewing', key: 'yic.mes.sewing', seedVar: 'SEWING_SEED', bcRoot: 'modSew',
    nav: [['SEWING', [['Sewing Schedule', 1, 'sewing'], ['Daily Sewing Output', 1, 'dso']]]],
    pages: { sewing: 'renderSewBody', dso: 'renderDsoBody' },
    bc: { sewing: 'bcPage', dso: 'dsoBc' },
  };
  PERSIST_MOD = ['weeks', 'week', 'openMonth', 'tab', 'cutTab', 'dsoTab', 'dsoSub', 'dsoLine',
    'mlvLine', 'mlvFs', 'dsoDone', 'dsoPassLog', 'dsoDoneV', 'dsoHand', 'dsoHandQ', 'dsoSlips',
    'dsoSlipSeq', 'dsoHandWho', 'bqNo', 'bqSeq', 'bqLock', 'cap', 'capTurns', 'capOrder', 'multPlain',
    'multEmb', 'bundle', 'bundleV', 'recvLog', 'wip', 'daily', 'files', 'freq', 'wsc', 'dsoAlerts',
    'lset', 'dsoMtypeRows', 'dsoMtypeDet', 'mtSel', 'dsoDefects', 'dsoDefLog', 'dsoDefTime',
    'dsoDefWho', 'dsoSel', 'dsoPhoto', 'dsoPhotoI', 'dsoGen', 'dsoOp', 'dsoHistOpen'];

  // ==========================================================================
  // Du lieu tu seed.js — thay cho window.PSCHED / window.KHC cua ban 1 file
  // --------------------------------------------------------------------------
  // Ke hoach san xuat va tac nghiep cat khong con la MAN HINH rieng nua; chung
  // la BANG THAM CHIEU dong bang trong seed cua module. Chin ham duoi day la moi
  // duong module doc du lieu do.
  // ==========================================================================
  ORDERS = (SEED.orders || []).map(o => ({ ...o }));
  PLANS = SEED.plans || [];
  SEEDLINES = SEED.lines || [];

  psAllOrders() { return this.ORDERS; }
  // Chi don con chay trong tuan dang chon — tranh chon nham don da ket thuc
  psActiveOrders(key) {
    const R = this.psWeekRange(key || (this.state && this.state.week) || this.CURWK);
    return this.ORDERS.filter(o => this.pd(o.start) <= R[1] && this.pd(o.end) >= R[0]);
  }
  brandOf(o) { const b = (o && o.brand) || ''; return b === 'OTHER' ? '' : b; }
  kcPlans() { return this.PLANS; }
  khcPlansFor(style) { const k = this.sKey(style);
    return this.PLANS.filter(p => p.style === style || p.style === k || 'FG-' + p.style === k); }
  psPlan(o) { return (o && o.planId) ? (this.PLANS.find(p => p.id === o.planId) || null) : null; }
  // PO cua 1 don: uu tien PO ghi tren tac nghiep cat roi moi den PO cua don.
  orderPo(o, pl) { if (pl === undefined) pl = this.psPlan(o);
    return String((pl && pl.po) || (o && o.po) || '').replace(/^PO\s*/i, '').trim() || '—'; }
  // Danh sach chuyen bam theo seed — khong tu sinh Line 4/13
  psLines() { if (this._psLines && this._psLines.length) return this._psLines;
    const out = this.SEEDLINES.map(x => x.line).filter(Boolean);
    this.ORDERS.forEach(o => { const n = this.normName(o.line); if (out.indexOf(n) < 0) out.push(n); });
    this._psLines = out; return out; }
  // Tong SL cua don theo ke hoach — dung khi chua co file tac nghiep cat
  psOrderQty(r) {
    const ln = this.normName(r.line), st = String(r.style || '').toUpperCase().replace(/\s+/g, '');
    if (!st) return 0; let q = 0;
    this.ORDERS.forEach(o => { if (this.normName(o.line) !== ln) return;
      if (String(o.code || '').toUpperCase().replace(/\s+/g, '') === st) q = Math.max(q, o.qty || 0); });
    return q;
  }
  // Chuyen + thuong hieu + ma hang lay thang tu don hang trong seed. LAY MOI don
  // chay trong tuan; 1 dong = 1 chuyen + 1 ma hang, don cung ma tren 1 chuyen
  // duoc gop SL theo ngay.
  psPlanRows(key) {
    const [ws, we] = this.psWeekRange(key); const out = [], at = {}; let n = 0;
    this.ORDERS.forEach(o => {
      const line = String(o.line).replace(/LINE/i, 'Line');
      const s = this.pd(o.start), e = this.pd(o.end); if (s > we || e < ws) return;
      const span = Math.max(1, Math.round((e - s) / 86400000) + 1);
      const rate = Math.max(5, Math.round((o.qty / Math.max(1, span * 6 / 7)) / 5) * 5);
      const style = this.psCode(o.code), brand = this.brandOf(o), k = line + '|' + style;
      let row = at[k];
      if (!row) { const days = {}; this.DAYS.forEach(d => days[d] = null);
        row = { id: 'r' + (++n), line, brand, style, days }; at[k] = row; out.push(row); }
      else if (!row.brand && brand) row.brand = brand;
      this.DAYS.forEach((d, i) => { const dt = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + i);
        if (dt >= s && dt <= e) row.days[d] = (row.days[d] || 0) + rate; });
    });
    return this.sortPlan(out);
  }

  // ==========================================================================
  constructor(props) {
    super(props);
    this.scrollRef = React.createRef(); this.panelRef = React.createRef(); this.dailyRef = React.createRef();
    const weeks = this.seed();
    this.state = { ...this.coreState(),
      page: 'sewing', cutTab: 'capacity', dsoTab: 'sprod', dsoSub: 'line', dsoLineTab: 'perf', spTab: 'gen', lset: {}, lsEdit: null,
      dsoLine: null, mlvLine: null, mlvFs: false, dsoDone: {}, dsoDoneV: 2, dsoHand: {}, dsoHandQ: {},
      dsoSlips: [], dsoSlipSeq: {}, dsoHandWho: {}, dsoHandAsk: null,
      cap: {}, capTurns: {}, capOrder: null, dragRow: null, multPlain: 3, multEmb: 6,
      tab: 'weekly', openMonth: this.CURWK.split(' · ')[0], week: this.CURWK,
      weeks,
      edit: null, bedit: null, bform: null, bslip: null, wslip: null, bqNo: {}, bqSeq: {}, bqLock: {},
      dragOver: false, dayOpen: null, daily: {}, freq: {}, wsc: {}, recvLog: [],
      bundle: this.initBundle((weeks[this.CURWK] || { rows: [] }).rows), bundleV: 3, wip: {},
      dsoAlerts: this.initAlerts(), dsoAlEdit: false, dsoAlHit: null,
      dsoMtypeRows: null, dsoMtypeDet: {}, mtSel: null, mtEdit: null, mtMsg: '',
      dsoDefects: this.initDefects(), dsoDefLog: {}, dsoDefTime: {}, dfEdit: null, dfQ: '', dfMsg: '',
      dsoTap: null, dsoTapQ: '', dsoTapSel: {}, lnRecv: null, lnOpen: {},
      dsoPassLog: {},
      dsoHistQ: '', dsoDefQ: '', dsoHandBulk: null,
      // Ban tablet cua trang chi tiet chuyen: o dang chon, ngay cua bang Top 3,
      // anh ky thuat / gioi tinh theo ma hang, cong nhan gan voi tung hang loi.
      dsoSel: {}, dsoDayV: null, dsoPhoto: {}, dsoPhotoI: {}, dsoGen: {}, dsoDefWho: {}, dsoOp: {},
      dsoHistOpen: false, dsoInfo: null,
      files: [{ name: 'KH cắt-199-PO10848-CHOT.xlsx', sheets: 2 },
        { name: 'KH cắt-199-PO10502-HANAM.xlsx', sheets: 2 },
        { name: 'KH cắt-VW5159-M2-BLK-PO4446+4841.xlsx', sheets: 8 },
        { name: 'KH cắt-1003117-PO10130.xlsx', sheets: 6 },
        { name: 'KH cắt-VW5159-M11-CHOT.xlsx', sheets: 8 }],
    };
    this.state.capTurns = this.allocTurns();
    this.restore();
    this.reconcileWeeks();
  }

  // Nang cap ban luu cu — goi tu restore() cua core, `saved` la chinh ban JSON.
  migrate(saved) {
    const sv = saved ? (Number(saved.bundleV) || 0) : 0;
    // v<2: rule sinh san da bo -> xoa nhung o da duoc sinh va luu tu truoc
    if (sv < 2) this.state.bundle = {};
    // v<3: khoa theo r.id (khong co tuan) -> chuyen sang khoa tuan+chuyen+ma hang
    if (sv < 3) this.state.bundle = this.migrateBundle(this.state.bundle);
    this.state.bundleV = 3;
    // Khoa dsoDone cu chua co doan NGAY -> gan vao hom nay, giu nguyen so luong.
    if ((saved ? (Number(saved.dsoDoneV) || 0) : 0) < 2) {
      const dm = this.state.dsoDone || {}, dn = {}, td = this.dsoToday();
      Object.keys(dm).forEach(k => { dn[k.split('|').length === 6 ? k : (td + '|' + k)] = dm[k]; });
      this.state.dsoDone = dn;
    }
    this.state.dsoDoneV = 2;
    // Ban luu cu chi danh dau CA DONG da giao; gio giao theo so luong ->
    // coi nhu da giao dung bang so da lam cua dong do.
    if (Object.keys(this.state.dsoHand || {}).length && !Object.keys(this.state.dsoHandQ || {}).length) {
      const dn = this.state.dsoDone || {}, hd = this.state.dsoHand || {}, hq = {};
      Object.keys(dn).forEach(k => { const rk = k.slice(0, k.lastIndexOf('|')); if (hd[rk]) hq[k] = dn[k]; });
      this.state.dsoHandQ = hq;
    }
  }

  // ---- than trang + hop thoai ---------------------------------------------
  // Ke hoach may: 3 tab dung chung 1 trang
  renderSewBody() {
    const t = this.state.tab;
    return t === 'weekly' ? this.renderBody()
      : (t === 'trim' ? this.renderBundleBody() : this.renderDemandBody());
  }
  renderOverlays() { return [this.renderBForm()]; }

  onEsc(e) {
    if (this.state.dsoTap) this.dsoTapClose();
    if (this.state.mlvFs) this.set({ mlvFs: false });
    if (this.state.bslip) this.bSlipClose();
    if (this.state.wslip) this.wSlipClose();
    if (this.state.dsoHandBulk) this.set({ dsoHandBulk: null });
    if (this.state.dsoHandAsk) this.dsoSlipClose();
  }
  onMount() { this.reconcileWeeks(); }
  onUnmount() { clearTimeout(this._tblT); this.mlvClockOff(); this.mlvFsOff(); }
