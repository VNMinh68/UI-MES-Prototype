  // ==========================================================================
  // Khai bao module
  // ==========================================================================
  MOD = {
    id: 'finishing', key: 'yic.mes.finishing', seedVar: 'FINISHING_SEED', bcRoot: 'modFin',
    nav: [['FINISHING', [['Finishing In', 1, 'finIn'], ['Finishing Status', 1, 'finSt'],
                         ['F.G Shipment Plan', 1, 'fgShip']]]],
    pages: { finIn: 'renderFinInBody', finSt: 'renderFinStBody', fgShip: 'renderFgBody' },
    bc: { finIn: 'fiBc', finSt: 'fsBc', fgShip: 'fgBc' },
  };
  PERSIST_MOD = ['finRecv', 'finStage', 'fsRemark', 'fsPackD', 'fsCtnO', 'fsCtnD', 'fsScan',
    'finTab', 'ftRows', 'ftSeeded', 'ftSel', 'fgRows', 'fgSeeded', 'fgPk', 'fgBc', 'dsoHandWho'];

  // ==========================================================================
  // Du lieu tu seed.js — thay cho window.PSCHED / window.KHC / window.MLIST
  // --------------------------------------------------------------------------
  // Truoc khi tach module, ba bang duoi day duoc suy ra tai cho tu Ke hoach san
  // xuat + tac nghiep cat + state cua man San luong may. Gio chung dong bang
  // trong seed, nen HOAN THIEN chay doc lap hoan toan.
  // ==========================================================================
  SEEDORD = SEED.ordered || {};        // (chuyen|ma hang|PO|mau) -> SL don hang
  SEEDROWS = SEED.orders || [];        // (ma hang|PO) -> {brand, qty, end, colors}

  // SL don hang theo (chuyen | ma hang | PO | mau) — cot SL DON HANG cua bang nhan
  finOrderedMap() { return this.SEEDORD; }
  // Danh muc phu lieu (MATERIALS LIST)
  ML() { return SEED.mlist || { rows: [] }; }
  // Chua co dong nao trong Ke hoach xuat hang thi doan thuong hieu tu seed
  brandForStyle(style) {
    const s = String(style || '').toUpperCase().replace(/\s+/g, '');
    const hit = this.SEEDROWS.find(o => String(o.style).toUpperCase().replace(/\s+/g, '') === s);
    return (hit && hit.brand) || '';
  }

  // Phu lieu hoan thien: 1 dong / (ma hang | PO). SL DON HANG gieo tu seed,
  // SL THUC NHAN la so nguoi dung go khi hang ve.
  ftSeed() {
    return this.SEEDROWS.map((o, i) => ({ id: 'ft' + (i + 1), brand: o.brand || '',
      style: o.style, po: o.po, qty: o.qty || 0, act: 0 }))
      .sort((a, b) => String(a.brand).localeCompare(String(b.brand))
        || String(a.style).localeCompare(String(b.style))
        || String(a.po).localeCompare(String(b.po)));
  }

  // Ke hoach xuat hang: 1 dong / (ma hang | PO). ETD = ngay ket thuc san xuat
  // cong FG_LEAD; ngay dong container lui truoc FG_LOAD_LEAD ngay.
  fgSeed() {
    return this.SEEDROWS.map((o, i) => {
      const e = this.pd(o.end);
      const etd = new Date(e.getFullYear(), e.getMonth(), e.getDate() + this.FG_LEAD);
      const ld = new Date(etd.getFullYear(), etd.getMonth(), etd.getDate() - this.FG_LOAD_LEAD);
      return { id: 'fg' + (i + 1), brand: o.brand || '', season: this.fgSeason(etd),
        factory: this.FG_FACTORY, style: o.style, po: o.po, color: (o.colors || []).join(' + '),
        qty: o.qty || 0, ship: 0, load: this.psFmtD(ld), etd: this.psFmtD(etd),
        mode: 'SEA', dest: '', cbm: '', note: '' };
    }).sort((a, b) => String(a.etd).localeCompare(String(b.etd))
      || String(a.style).localeCompare(String(b.style))
      || String(a.po).localeCompare(String(b.po)));
  }

  // ==========================================================================
  constructor(props) {
    super(props);
    this.scrollRef = React.createRef();
    this.state = { ...this.coreState(),
      page: 'finIn', edit: null, bedit: null,
      // Phieu ban giao tu seed — dau vao duy nhat cua module
      dsoSlips: (SEED.slips || []).map(s => ({ ...s })), dsoSlipSeq: {}, dsoHandWho: {}, dsoHandAsk: null,
      finRecv: {}, finStage: {}, finQ: '', fiSel: null,
      fsQ: '', fsRemark: {}, fsPackD: {}, fsCtnO: {}, fsCtnD: {},
      fsScan: {}, fsScanAt: null, fsScanQ: '', fsScanMsg: null,
      finTab: 'gmt', ftRows: [], ftSeeded: 0, ftQ: '', ftSel: {}, ftPick: null, ftPickDraft: null,
      fgRows: [], fgSeeded: 0, fgQ: '', fgEdit: null, fgMsg: '', fgPk: {}, fgBc: {},
      fgSel: null, fgPg: 1, fgPp: 100,
    };
    this.restore();
  }

  // ---- vong doi -----------------------------------------------------------
  // Gieo 1 lan; sau do hai bang la du lieu nguoi dung sua duoc.
  onMount() { this.fgEnsure(); this.ftEnsure(); }
  onUnmount() { clearTimeout(this._fgT); }
  onEsc() {
    if (this.state.fsScanAt) this.fsScanClose();
    if (this.state.ftPick) this.ftPickClose();
    if (this.state.fgSel) this.fgClose();
    if (this.state.dsoHandAsk) this.dsoSlipClose();
  }
