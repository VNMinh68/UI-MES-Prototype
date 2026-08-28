  // ==========================================================================
  // Hop dong voi module
  // --------------------------------------------------------------------------
  // Module ghi de MOD trong class cua no. `pages` la ban do trang -> TEN ham ve
  // than trang; core goi this[ten]() nen module chi can khai bao ham binh thuong.
  // ==========================================================================
  MOD = { id: 'core', key: 'yic.mes.core', seedVar: 'MES_SEED_DATA',
          bcRoot: 'bcRoot', nav: [], pages: {}, bc: {} };
  LMOD = { vi: {}, en: {} };
  NAVVI = {};
  PERSIST_MOD = [];
  PERSIST_CORE = ['lang', 'page', 'navOpen'];

  get SKEY() { return this.MOD.key; }
  // Co "da xoa sach, dung nap lai anh chup" — rieng tung module.
  get NOSEED() { return this.MOD.key + '.noseed'; }
  get PERSIST() { return this.PERSIST_CORE.concat(this.PERSIST_MOD || []); }
  get PAGE_BC() { return this.MOD.bc || {}; }
  get NAVGROUPS() { return this.MOD.nav || []; }

  // Bang dich cua module duoc tra truoc, thieu thi lui ve bang dung chung.
  t(k) {
    const lg = this.state.lang || 'vi';
    const m = this.LMOD[lg] || this.LMOD.vi || {};
    if (m[k] !== undefined) return m[k];
    const d = this.L[lg] || this.L.vi;
    if (d[k] !== undefined) return d[k];
    return (this.LMOD.en && this.LMOD.en[k]) || this.L.en[k] || k;
  }
  tn(s) { return (this.state.lang === 'vi' && this.NAVVI[s]) ? this.NAVVI[s] : s; }

  // ---- state chung ---------------------------------------------------------
  // Module goi coreState() roi tron state rieng cua no vao.
  coreState() {
    return { page: this.navPages()[0] || '', lang: 'vi',
      sidebarOpen: false, navOpen: this.navOpenAll(), snapMsg: '',
      // tuan dang xem: cac ham ngay/tuan cua core (weekDates, psWeekRange) doc
      // khoa nay, nen core phai dat mac dinh du module co dung hay khong
      week: this.CURWK,
      dsoHandAsk: null, dsoHandWho: {}, dsoSlips: [], dsoSlipSeq: {} };
  }
  navOpenAll() { const o = {}; (this.MOD.nav || []).forEach(([title]) => { o[title] = true; }); return o; }

  // ---- luu / khoi phuc ----------------------------------------------------
  // Moi thay doi du lieu duoc luu lai — refresh van giu nguyen.
  restore() {
    const defPage = this.state.page; let saved = null;
    try {
      const raw = window.localStorage.getItem(this.SKEY); if (!raw) return;
      const o = JSON.parse(raw) || {}; saved = o;
      this.PERSIST.forEach(k => { if (o[k] !== undefined && o[k] !== null) this.state[k] = o[k]; });
    } catch (e) {}
    if (this.migrate) this.migrate(saved);
    // Ban luu cu co the dang o trang da bo khoi menu -> ve trang dau con trong menu
    const pgs = this.navPages();
    if (pgs.length && pgs.indexOf(this.state.page) < 0)
      this.state.page = (pgs.indexOf(defPage) >= 0 ? defPage : pgs[0]);
  }

  // ---- khung trang --------------------------------------------------------
  renderVals() {
    const primary = this.props.primaryColor ?? '#7CB518';
    const density = this.props.density ?? 'Comfortable';
    this.C = { primary, dark: '#4A7A0B', leaf: '#A7D129', tint: '#f0f8de', tint2: '#f7fcea',
      ink: '#20262f', sub: '#69707a', faint: '#9aa2ad', border: '#e4e7de', line: '#edefe9',
      bg: '#f3f6ec', white: '#fff', off: '#b3b8b0', offBg: '#fafbf9', badge: '#e4f4c4',
      shadow: '0 1px 2px rgba(40,60,10,.04), 0 10px 28px -14px rgba(40,60,10,.14)' };
    this.dense = density === 'Compact';
    return { noop: () => {}, toggleSidebar: () => this.set({ sidebarOpen: !this.state.sidebarOpen }),
      sidebarEl: this.state.sidebarOpen ? this.renderAside() : null, langEl: this.renderLang(),
      bcRoot: this.t(this.MOD.bcRoot || 'bcRoot'),
      bcPage: this.t(this.PAGE_BC[this.state.page] || 'bcPage'),
      bodyEl: this.renderPageBody(), overlays: this.renderOverlays() };
  }
  // Than trang: 1 cho duy nhat, doc tu MOD.pages. Them trang moi chi sua MOD.
  renderPageBody() {
    const fn = (this.MOD.pages || {})[this.state.page];
    return (fn && this[fn]) ? this[fn]() : null;
  }
  // Hop thoai / modal cua module — ve o goc cay nen khong bi cat boi overflow.
  renderOverlays() { return []; }

  // ---- sidebar ------------------------------------------------------------
  renderSideNav() {
    const h = React.createElement, C = this.C;
    const dot = active => h('span', { style: { width: 7, height: 7, flex: 'none', borderRadius: 99,
      background: active ? C.primary : '#d3d8cb', display: 'block', transition: 'background .12s' } });
    const badge = () => h('span', { style: { fontSize: 9.5, fontWeight: 600, color: C.primary,
      background: C.tint, padding: '2px 6px', borderRadius: 4, letterSpacing: '.2px', flex: 'none' } }, 'UI Proto');
    const navOpen = this.state.navOpen || {};
    return h('nav', { style: { padding: '0 10px' } },
      this.NAVGROUPS.map(([title, items]) => { const open = !!navOpen[title];
        return h('div', { key: title, style: { marginTop: 6 } },
          h('div', { onClick: () => this.set({ navOpen: { ...navOpen, [title]: !open } }),
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 8px', borderRadius: 8, cursor: 'pointer', color: open ? '#69707a' : '#a7ada4',
              fontSize: 10.5, fontWeight: 700, letterSpacing: '.6px', userSelect: 'none' },
            'style-hover': { background: '#f4f6f0' } },
            this.tn(title),
            h('svg', { width: 11, height: 11, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
              strokeWidth: 2.5, style: { transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' } },
              h('path', { d: 'M6 9l6 6 6-6' }))),
          open ? items.map(([name, proto, pg], i) => { const active = !!pg && this.state.page === pg;
            return h('div', { key: i, onClick: () => { if (!pg) return;
                this.set(pg !== this.state.page ? { page: pg, edit: null, bedit: null, sidebarOpen: false }
                                                : { sidebarOpen: false });
                if (this.onPage) this.onPage(pg); },
              style: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', margin: '1px 0',
                borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? C.dark : '#454b52', background: active ? C.tint : 'transparent',
                transition: 'background .12s' } },
              dot(active),
              h('span', { style: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                this.tn(name)),
              proto ? badge() : null); }) : null); }));
  }

  renderAside() {
    const h = React.createElement, C = this.C;
    return h('div', { style: { position: 'fixed', inset: 0, zIndex: 120 } },
      h('div', { onClick: () => this.set({ sidebarOpen: false }),
        style: { position: 'absolute', inset: 0, background: 'rgba(32,38,47,.28)' } }),
      h('aside', { className: 'yscroll', style: { position: 'absolute', left: 0, top: 0, width: 248,
          background: '#fff', borderRight: '1px solid ' + C.border, height: '100vh', overflowY: 'auto',
          padding: '0 0 30px', boxShadow: '0 10px 40px rgba(32,38,47,.18)' } },
        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 16px 12px' } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            h('div', { style: { width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg,#A7D129,' + C.dark + ')', color: '#fff', fontWeight: 700,
              fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
              letterSpacing: '.5px', boxShadow: '0 2px 6px rgba(47,82,20,.25)', flex: 'none' } }, 'Y'),
            h('div', null,
              h('div', { style: { fontSize: 16, fontWeight: 700, letterSpacing: '.3px', lineHeight: 1.1 } },
                h('span', { style: { color: C.primary } }, 'YIC'), ' ', h('span', { style: { color: C.ink } }, 'MES')),
              h('div', { style: { fontSize: 10, color: C.faint, marginTop: 2, letterSpacing: '.2px' } },
                this.t(this.MOD.bcRoot || 'mes')))),
          h('div', { onClick: () => this.set({ sidebarOpen: false }), title: 'Hide sidebar',
            style: { width: 22, height: 22, border: '1px solid #e2e4de', borderRadius: 6, display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: C.faint, cursor: 'pointer' } },
            h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
              strokeWidth: 2.5 }, h('path', { d: 'M15 6l-6 6 6 6' })))),
        this.renderSideNav(),
        this.renderSnapBar(),
        h('div', { style: { padding: '14px 18px 0', marginTop: 10, borderTop: '1px solid #eff0ec',
          color: C.faint, fontSize: 11, fontWeight: 600, letterSpacing: '.3px' } }, 'YIC Hanam MES')));
  }

  // ---- vong doi -----------------------------------------------------------
  componentDidMount() {
    this._mounted = true;
    this._esc = e => { if (e.key !== 'Escape') return; if (this.onEsc) this.onEsc(e); };
    document.addEventListener('keydown', this._esc);
    // May moi (localStorage rong) da duoc nap localStorage o seedStorage();
    // blob trong IndexedDB la bat dong bo nen nap o day.
    if (window.MES_SEED_FIRST && window.MES_SEED) this.snapPutIdb(window.MES_SEED, true).catch(() => {});
    if (this.onMount) this.onMount();
  }
  // Moi thay doi state deu duoc luu lai (dồn 250ms) — refresh van giu nguyen.
  componentDidUpdate() {
    this.queuePersist();
    if (this.onUpdate) this.onUpdate();
  }
  componentWillUnmount() {
    this._mounted = false;
    clearTimeout(this._pt); clearTimeout(this._snT);
    if (this.onUnmount) this.onUnmount();
    this.persist();
    if (this._esc) document.removeEventListener('keydown', this._esc);
    document.body.classList.remove('bg-slip-open');
  }

  // ---- phieu ban giao: mac dinh cho module khong phat hanh phieu ----------
  // MAY ghi de ba ham nay; HOAN THIEN chi xem / in lai nen giu ban mac dinh.
  dsoHandedTot() { return 0; }
  brandForStyle() { return ''; }
  dsoSlipCommit() {}

  // ---- anh chup du lieu ---------------------------------------------------
  // Xuat ra dung file seed.js cua module: giu nguyen phan du lieu nghiep vu cua
  // seed dang chay, thay phan `snapshot` bang anh chup vua thu. Chep de len
  // file cu trong cung thu muc la may khac mo len thay dung du lieu nay.
  async snapExport() {
    this.snapSay(this.t('snapWork'));
    try {
      const s = await this.snapCollect();
      const data = Object.assign({}, window.MES_SEED_DATA || {}, { snapshot: s });
      const js = '/* YIC MES · ' + this.MOD.id + ' — seed cua module.\n'
        + ' * Sinh tu chinh ung dung — ' + s.stamp + '\n'
        + ' * ' + Object.keys(s.ls).length + ' khoa localStorage · '
        + this.snapCount(s) + ' file trong IndexedDB\n'
        + ' *\n'
        + ' * Chep de file nay len seed.js trong thu muc ' + this.MOD.id + '/. May nao\n'
        + ' * mo module lan dau (localStorage con trong) se duoc nap du lieu trong day.\n'
        + ' */\n'
        + 'window.' + this.MOD.seedVar + ' = ' + JSON.stringify(data) + ';\n';
      this.snapDownload('seed.js', js, 'text/javascript;charset=utf-8');
      this.snapSay(this.t('snapOk') + ' · ' + this.kb(js.length));
    } catch (e) { this.snapSay(this.t('snapErr')); }
  }
