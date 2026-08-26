/* YIC MES - application logic.
 *
 * Migrated out of the single-file design-canvas bundle. The component class below is
 * carried over unchanged; what the canvas runtime used to provide is reproduced here:
 *
 *   DCLogic     -> a React.Component base whose render() draws the app shell that used
 *                  to live in the <x-dc> markup, filled from renderVals().
 *   style-hover -> a createElement wrapper that turns the prop into a real :hover class.
 *
 * Load order (see index.html): react, react-dom, anime, xlsx, qr, data, then this file.
 */
(function () {
  'use strict';

  var R = window.React, RD = window.ReactDOM;
  if (!R || !RD) { throw new Error('React / ReactDOM must load before script.js'); }

  /* ---- style-hover ------------------------------------------------------------
     The canvas runtime accepted a `style-hover` prop and compiled it to CSS. The
     values depend on the theme colour, so the rule is minted on first use and
     cached by its serialised form. */
  var UNITLESS = { opacity: 1, zIndex: 1, fontWeight: 1, lineHeight: 1, flex: 1, flexGrow: 1,
                   flexShrink: 1, order: 1, zoom: 1 };
  var sheet = null, seq = 0, cache = {};
  function dashed(k) { return k.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }); }
  function val(k, v) { return (typeof v === 'number' && !UNITLESS[k]) ? v + 'px' : v; }
  function hoverClass(spec) {
    var key = JSON.stringify(spec);
    if (cache[key]) return cache[key];
    if (!sheet) {
      var el = document.createElement('style');
      el.setAttribute('data-style-hover', '');
      document.head.appendChild(el);
      sheet = el.sheet;
    }
    var cls = 'sh' + (++seq);
    var body = Object.keys(spec).map(function (k) { return dashed(k) + ':' + val(k, spec[k]); }).join(';');
    try { sheet.insertRule('.' + cls + ':hover{' + body + '}', sheet.cssRules.length); } catch (e) {}
    cache[key] = cls;
    return cls;
  }

  /* `const h = React.createElement` inside the class picks this up. */
  var React = Object.create(R);
  React.createElement = function (type, props) {
    var kids = Array.prototype.slice.call(arguments, 2);
    if (props && props['style-hover']) {
      var p = {}, k;
      for (k in props) if (k !== 'style-hover') p[k] = props[k];
      var cls = hoverClass(props['style-hover']);
      p.className = p.className ? p.className + ' ' + cls : cls;
      props = p;
    }
    return R.createElement.apply(null, [type, props].concat(kids));
  };

  /* ---- app shell -------------------------------------------------------------
     Was the <x-dc> markup; `{{ name }}` placeholders came from renderVals(). */
  function icon(size, sw, paths) {
    return React.createElement('svg',
      { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: sw },
      paths.map(function (d, i) { return React.createElement('path', { key: i, d: d }); }));
  }

  function shell(v) {
    var h = React.createElement;
    return h('div', { 'data-kc-root': '', style: { display: 'flex', minHeight: '100vh', width: '100%' } },
      v.sidebarEl, v.modalEl, v.addLineEl, v.confEl, v.qrModalEl,
      h('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' } },
        h('header', { style: { height: 60, flex: 'none', background: '#fff', borderBottom: '1px solid #e4e7de',
                               display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14 } },
          h('button', { onClick: v.toggleSidebar,
                        style: { border: 'none', background: 'none', padding: 6, cursor: 'pointer',
                                 color: '#3a4048', display: 'flex' } },
            icon(20, 2, ['M3 6h18M3 12h18M3 18h18'])),
          h('div', { style: { fontSize: 13.5, color: '#8a9098' } },
            v.bcRoot, ' ',
            h('span', { style: { margin: '0 7px', color: '#c9cdc6' } }, '/'), ' ',
            h('span', { style: { color: '#20262f', fontWeight: 600 } }, v.bcPage)),
          h('div', { style: { flex: 1 } }),
          v.langEl,
          h('div', { style: { position: 'relative', width: 36, height: 36, border: '1px solid #e4e7de',
                              borderRadius: 10, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', color: '#4a7c2f', background: '#fff' } },
            icon(17, 2, ['M9 11l3 3L22 4', 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11']),
            h('span', { style: { position: 'absolute', top: -6, right: -6, background: '#e5484d', color: '#fff',
                                 fontSize: 10, fontWeight: 700, minWidth: 17, height: 17, borderRadius: 9,
                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 padding: '0 4px' } }, '3')),
          h('div', { style: { width: 34, height: 34, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', color: '#6b727b' } },
            icon(19, 1.8, ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.7 21a2 2 0 0 1-3.4 0'])),
          h('div', { style: { width: 36, height: 36, borderRadius: '50%',
                              background: 'linear-gradient(135deg,#A7D129,#5d8f12)', color: '#fff',
                              fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', boxShadow: '0 2px 6px rgba(47,82,20,.3)' } }, 'U')),
        v.bodyEl));
  }

  /* ---- DCLogic ---------------------------------------------------------------
     The canvas base class: props + state + lifecycle, and a render() that drew the
     template against renderVals(). Everything else it had was editor plumbing. */
  var DCLogic = class extends R.Component {
    constructor(props) { super(props); this.state = {}; }
    renderVals() { return {}; }
    render() { return shell(this.renderVals() || {}); }
  };

  /* ---- the component, carried over verbatim -------------------------------- */

class Component extends DCLogic {
  MES = {
    'VUORI':['VW5159-M11','VW5202-M5','VW3310-W2','VW4408-K1','V237','VW5160'],
    'KSK':['JWJJW26311'],
    'KSC':['LHVT6WN185'],
    'FILA CHINA':['A11M645932F'],
    'FIGS':['FG-1000199','FG-1003117','FG-ISABEL-52','FG-OLIVE-60'],
    'DESCENTE':['D6432SPT51','D6432SPT50','D7118WVN22'],
    'COTOPAXI':['F25471M1691','CT-ABRZ-88'],
    'LULULEMON':['LL-ABC-2024','LL-PACE-778'],
    'PATAGONIA':['PT-4471-CAP','PT-NANO-33'],
    'NIKE':['NK-DF-8890','NK-TECH-201'],
    'ON RUNNING':['ON-CLOUD-5','ON-CORE-12'],
  };
  SIZES = {
    'VW5159-M11':['XXS','XS','S','M','L','XL','2XL'],
    'VW5202-M5':['XS','S','M','L','XL'],
    'VW3310-W2':['XS','S','M','L'],
    'FG-1000199':['XS','S','M','L','XL','2XL','3XL','4XL','5XL','6XL'],
    'FG-1003117':['XXS','XS','S','M','L','XL','2XL'],
    'VW5159-M2':['XXS','XS','S','M','L','XL','2XL'],
    'D6432SPT51':['S','M','L','XL','2XL'],
    _def:['XS','S','M','L','XL','2XL'],
  };
  CUTCOLORS = {
    'VW5159-M11':['WHITE','Black','Marshmallow','Bourbon','Washed Boysenberry'],
    'VW5202-M5':['Black','Charcoal','Heather Grey'],
    'VW3310-W2':['Dusk','Fig','Onyx'],
    'VW4408-K1':['Storm','Sand','Ink'],
    'FG-1000199':['Navy','Black','Wine'],
    'FG-1003117':['Olive','Graphite','Ceil Blue'],
    'FG-ISABEL-52':['Navy','Black','Ciel'],
    'FG-OLIVE-60':['Olive','Graphite','Navy'],
    'D6432SPT51':['Black','Navy','Ceil Blue'],
    'D6432SPT50':['Olive','Graphite','Navy'],
    'D7118WVN22':['Slate','Black','Sage'],
    'F25471M1691':['Midnight','Volt','White'],
    'CT-ABRZ-88':['Cinnamon','Maritime','Black'],
    'LL-ABC-2024':['True Navy','Black','Graphite Grey'],
    'LL-PACE-778':['White','Black','Pigment'],
    'PT-4471-CAP':['Forge Grey','Black','Tidepool'],
    'PT-NANO-33':['Classic Navy','Black','Ember'],
    'NK-DF-8890':['Midnight','White','Volt'],
    'NK-TECH-201':['Obsidian','Grey','Crimson'],
    'ON-CLOUD-5':['All Black','Glacier','Rock'],
    'ON-CORE-12':['Ink','Fog','Flame'],
  };
  MN3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  // Kỳ = tháng trước · tháng này · tháng sau — theo ngày hệ thống, tuần bắt đầu thứ 2 trong tháng
  MONTHS = (()=>{ const t=new Date(), out={};
    for(let k=-1;k<=1;k++){ const d=new Date(t.getFullYear(),t.getMonth()+k,1);
      const key=this.MN3[d.getMonth()]+' '+d.getFullYear();
      const dim=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
      const off=(8-d.getDay())%7, n=Math.floor((dim-1-off)/7)+1;
      out[key]=[]; for(let i=1;i<=n;i++) out[key].push(key+' · W'+i); }
    return out; })();
  DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat'];
  SORDER = ['XXS','XS','S','M','L','XL','2XL','3XL','4XL','5XL','6XL'];
  CUTTURNS = {
    'VW5159-M11':[
      {id:'C1',marker:'XS+S/3+M/3+L',layers:121},
      {id:'C2',marker:'XS+S/3+M/3+L',layers:121},
      {id:'C3',marker:'XS+S/3+M/3+L',layers:121},
      {id:'C4',marker:'XS+S/3+M/3+L',layers:123},
      {id:'C5',marker:'S+M+L/3+XL/3',layers:123},
      {id:'C6',marker:'XS/3+M/3+L/2',layers:102},
      {id:'C7',marker:'XS/2+S/5+M',layers:104},
      {id:'C8',marker:'S+XL+2XL',layers:59},
      {id:'C9',marker:'XXS+XS',layers:34},
      {id:'C10',marker:'XS',layers:14},
      {id:'C11',marker:'XS+S/3+M/3+L',layers:116},
      {id:'C12',marker:'XS+S/3+M/3+L',layers:116},
      {id:'C13',marker:'M+L/3+XL/2',layers:90},
      {id:'C14',marker:'M+L',layers:35},
      {id:'C15',marker:'M+XL+2XL',layers:25},
      {id:'C16',marker:'S',layers:22},
    ],
  };
  DEMAND = {
    'VW5159-M11':{XXS:34,XS:1280,S:2878,M:2837,L:1596,XL:633,'2XL':84},
    'VW5159-M2':{XXS:327,XS:1295,S:2333,M:2175,L:1085,XL:411,'2XL':70},
    'FG-1000199':{XS:880,S:3105,M:7776,L:6440,XL:3980,'2XL':2235,'3XL':556,'4XL':385,'5XL':170,'6XL':15},
    'FG-1003117':{XXS:945,XS:4191,S:7217,M:6391,L:3339,XL:1620,'2XL':750},
  };

  CAP = [
    {n:1,brand:'FIGS',style:'1000199',emb:'KHÔNG',line:'Line 8',cut:9840,iss:8520,turns:'C1–C52',po:'10848',days:[0,0,0,0,0,0]},
    {n:2,brand:'FIGS',style:'1000199',emb:'KHÔNG',line:'Line 9',cut:7260,iss:6180,turns:'C1–C28',po:'10502',days:[0,0,0,0,0,0]},
    {n:3,brand:'VUORI',style:'VW5159-M2',emb:'KHÔNG',line:'Line 5',cut:4180,iss:3520,turns:'C1–C14',po:'4446, 4841',days:[0,0,0,0,0,0]},
    {n:4,brand:'FIGS',style:'1003117',emb:'THÊU',line:'Line 10',cut:14600,iss:12150,turns:'C1–C62',po:'10130',days:[0,0,0,0,0,0]},
    {n:5,brand:'VUORI',style:'VW5159-M11',emb:'KHÔNG',line:'Line 6',cut:5940,iss:5100,turns:'C1–C16',po:'Multi (6)',days:[0,0,0,0,0,0]},
  ];
  CUTPLAN = [];
  MACH = {A:['1','2'],B:['3','4'],C:['5','6'],T:['1','2','3','4','5','6']};
  CURWK = (()=>{ const t=new Date(), d=new Date(t.getFullYear(),t.getMonth(),t.getDate()), all=[];
    Object.values(this.MONTHS).forEach(ws=>ws.forEach(w=>all.push(w)));
    const hit=all.find(k=>{ const r=this.psWeekRange(k); return d>=r[0]&&d<=new Date(r[1].getFullYear(),r[1].getMonth(),r[1].getDate()+1); });
    return hit||all[Math.floor(all.length/2)]; })();
  FAB = {
    'VW5159-M11':[{vl:'AL7121Q',tot:2439},{vl:'AL7121R',tot:1698},{vl:'AL7088B',tot:812}],
    'VW5160':[{vl:'AL7121Q',tot:1698},{vl:'AL7095C',tot:940}],
    'JWJJW26311':[{vl:'KJ4400N',tot:1120},{vl:'KJ4400B',tot:760}],
    'V237':[{vl:'VRT2100',tot:640},{vl:'VRT2101',tot:415}],
    'FG-1003117':[{vl:'FS1180C',tot:2210},{vl:'FS1180N',tot:1830},{vl:'FS1180G',tot:905}],
    'LHVT6WN185':[{vl:'KC7702',tot:1985},{vl:'KC7703',tot:1120}],
    'A11M645932F':[{vl:'FL3308',tot:820},{vl:'FL3309',tot:505}],
    'D6432SPT51':[{vl:'DS6600Q',tot:1390},{vl:'DS6601Q',tot:980}],
    'D6432SPT50':[{vl:'DS6600Q',tot:3214},{vl:'DS6602B',tot:1240}],
    'F25471M1691':[{vl:'CX2190',tot:2188},{vl:'CX2191',tot:1345}],
    'FG-1000199':[{vl:'FS1020B',tot:7420},{vl:'FS1020N',tot:3115},{vl:'FS1020G',tot:1480}],
  };
  fabOf(style){ const plans=this.khcPlansFor(style);
    if(plans.length){ const out=[],seen={};
      plans.forEach(p=>p.sections.forEach(s=>{ if(s.grp!=='aux'&&!seen[s.fab]){ seen[s.fab]=1; out.push({vl:s.fab,tot:s.total}); } }));
      if(out.length) return out; }
    return this.FAB[this.sKey(style)]||[{vl:'—',tot:0}]; }
  khcPlansFor(style){ const k=this.sKey(style); return ((window.KHC||{}).plans||[]).filter(p=>p.style===style||p.style===k||'FG-'+p.style===k); }
  khcTurns(style,po){ const plans=this.khcPlansFor(style); if(!plans.length) return null;
    let pl=plans[0];
    if(plans.length>1&&po!=null&&po!==''){ const pd=String(po).replace(/\D/g,''); const hit=plans.find(p=>{ const q=p.qrPo.replace(/\D/g,''); return q&&pd&&(q===pd||pd.indexOf(q)>=0||q.indexOf(pd)>=0); }); if(hit) pl=hit; }
    this._kt=this._kt||{};
    if(!this._kt[pl.id]) this._kt[pl.id]=pl.sections.filter(s=>s.grp!=='aux').reduce((a,s)=>a.concat(s.tables.map(t=>({id:t.tb,marker:t.sz.map(([n,r])=>r>1?n+'/'+r:n).join('+'),layers:t.ly}))),[]);
    return this._kt[pl.id]; }

  constructor(props){
    super(props);
    this.scrollRef=React.createRef(); this.panelRef=React.createRef(); this.dailyRef=React.createRef();
    this.psSeedPlans();
    const weeks=this.seed();
    this.state = {
      page:'gantt', cutTab:'capacity', dsoTab:'cfg', dsoSub:'line', lset:{}, lsEdit:null, dsoLine:null, mlvLine:null, mlvFs:false, dsoDone:{}, dsoDoneV:2, dsoHand:{}, dsoHandQ:{}, dsoSlips:[], dsoSlipSeq:{}, dsoHandWho:{}, dsoHandAsk:null, gsel:null, gz:1, gopen:{}, cap:{}, capTurns:{}, capOrder:null, dragRow:null, multPlain:3, multEmb:6,
      tab:'weekly', openMonth:this.CURWK.split(' · ')[0], week:this.CURWK, lang:'vi',
      weeks,
      edit:null, bedit:null, bform:null, bslip:null, bqNo:{}, bqSeq:{}, addLine:null, khcPlan:null, qrOpen:null, ps:this.psClone(window.PSCHED), psTrash:[], recvLog:[], conf:null, psAdd:null, psTrashOpen:false, sidebarOpen:false, navOpen:{'PRODUCTION PLAN':true,'DASHBOARD':true,'SEWING':true,'FINISHING':true}, dragOver:false, dayOpen:null, daily:{}, freq:{}, wsc:{}, whOpen:null, whQ:'', whErr:'',
      bundle:this.initBundle((weeks[this.CURWK]||{rows:[]}).rows), bundleV:3, wip:{},
      dsoAlerts:this.initAlerts(), dsoAlEdit:false, dsoAlHit:null,
      dsoMtypeRows:null, dsoMtypeDet:{}, mtSel:null, mtEdit:null, mtMsg:'',
      dsoDefects:this.initDefects(), dsoDefLog:{}, dsoDefTime:{}, dfEdit:null, dfQ:'', dfMsg:'', dsoTap:null, dsoTapQ:'',
      dsoPassLog:{},
      dsoHistQ:'', dsoDefQ:'', dsoHandBulk:null,
      finRecv:{}, finStage:{}, finQ:'', fsQ:'', fsRemark:{}, fsPackD:{}, fsCtnO:{}, fsCtnD:{},
      fsScan:{}, fsScanAt:null, fsScanQ:'', fsScanMsg:null,
      finTab:'gmt', ftRows:[], ftSeeded:0, ftQ:'', ftEdit:null,
      ftSel:{}, ftPick:null, ftPickQ:'', ftPickKind:'', ftPickDraft:null,
      fgRows:[], fgSeeded:0, fgQ:'', fgEdit:null, fgMsg:'', fgPk:{}, fgBc:{}, snapMsg:'',
      files:[{name:'KH cắt-199-PO10848-CHOT.xlsx',sheets:2},{name:'KH cắt-199-PO10502-HANAM.xlsx',sheets:2},{name:'KH cắt-VW5159-M2-BLK-PO4446+4841.xlsx',sheets:8},{name:'KH cắt-1003117-PO10130.xlsx',sheets:6},{name:'KH cắt-VW5159-M11-CHOT.xlsx',sheets:8}],
    };
    this.state.capTurns=this.allocTurns();
    this.restore();
    this.reconcileWeeks();
  }

  SKEY='yic.sewplan.v2';
  PERSIST=['weeks','week','openMonth','tab','page','cutTab','dsoTab','dsoSub','dsoLine','mlvLine','mlvFs','dsoDone','dsoPassLog','dsoDoneV','dsoHand','dsoHandQ','dsoSlips','dsoSlipSeq','dsoHandWho','bqNo','bqSeq','lang','cap','capTurns','capOrder','multPlain','multEmb','bundle','bundleV','recvLog','wip','daily','files','ps','psTrash','navOpen','gz','gopen','khcPlan','freq','wsc','dsoAlerts','lset','dsoMtypeRows','dsoMtypeDet','mtSel','dsoDefects','dsoDefLog','dsoDefTime','finRecv','finStage','fsRemark','fsPackD','fsCtnO','fsCtnD','fsScan','finTab','ftRows','ftSeeded','ftSel','fgRows','fgSeeded','fgPk','fgBc'];
  // Mọi thay đổi dữ liệu được lưu lại — refresh vẫn giữ nguyên
  restore(){ const defPage=this.state.page; let saved=null;
    try{ const raw=window.localStorage.getItem(this.SKEY); if(!raw) return; const o=JSON.parse(raw)||{}; saved=o;
      this.PERSIST.forEach(k=>{ if(o[k]!==undefined&&o[k]!==null) this.state[k]=o[k]; }); }catch(e){}
    // Doc version tu chinh ban luu, khong tu state -- state luon co mac dinh nen khong phan biet duoc
    const sv=saved?(Number(saved.bundleV)||0):0;
    // v<2: rule sinh san da bo -> xoa nhung o da duoc sinh va luu tu truoc
    if(sv<2) this.state.bundle={};
    // v<3: khoa theo r.id (khong co tuan) -> chuyen sang khoa tuan+chuyen+ma hang
    if(sv<3) this.state.bundle=this.migrateBundle(this.state.bundle);
    this.state.bundleV=3;
    // Khoa dsoDone cu chua co doan NGAY -> gan vao hom nay, giu nguyen so luong.
    // Doc version tu ban luu (giong bundleV) vi state luon co mac dinh.
    if((saved?(Number(saved.dsoDoneV)||0):0)<2){ const dm=this.state.dsoDone||{}, dn={}, td=this.dsoToday();
      Object.keys(dm).forEach(k=>{ dn[k.split('|').length===6?k:(td+'|'+k)]=dm[k]; });
      this.state.dsoDone=dn; }
    this.state.dsoDoneV=2;
    // Ban luu cu chi danh dau CA DONG da giao; gio giao theo so luong ->
    // coi nhu da giao dung bang so da lam cua dong do.
    if(Object.keys(this.state.dsoHand||{}).length&&!Object.keys(this.state.dsoHandQ||{}).length){
      const dn=this.state.dsoDone||{}, hd=this.state.dsoHand||{}, hq={};
      Object.keys(dn).forEach(k=>{ const rk=k.slice(0,k.lastIndexOf('|')); if(hd[rk]) hq[k]=dn[k]; });
      this.state.dsoHandQ=hq; }
    // Bản lưu cũ giữ thay đổi kế hoạch dạng overlay -> bỏ, lấy lại hạt giống từ data/psched.js
    if(!this.state.ps||!this.state.ps.groups) this.state.ps=this.psClone(window.PSCHED);
    // Ban luu cu co the dang o trang da bo khoi menu -> ve trang dau tien con trong menu
    const pgs=this.navPages();
    if(pgs.length&&pgs.indexOf(this.state.page)<0) this.state.page=(pgs.indexOf(defPage)>=0?defPage:pgs[0]); }
  // _wiping: dang nap anh chup / dang xoa sach va cho reload. Khong duoc ghi
  // de localStorage bang state CU nua, khong thi ban vua nap bi de mat.
  persist(){ if(this._wiping) return;
    try{ const o={}; this.PERSIST.forEach(k=>{ o[k]=this.state[k]; }); window.localStorage.setItem(this.SKEY,JSON.stringify(o)); }catch(e){} }
  queuePersist(){ clearTimeout(this._pt); this._pt=setTimeout(()=>this.persist(),250); }
  resetSaved(){ if(!window.confirm(this.t('resetAsk'))) return;
    this._wiping=true; clearTimeout(this._pt);
    // Co NOSEED -> lan mo sau khong nap lai data/state-seed.js nua; bam
    // 'Ve anh chup goc' se xoa co nay va nap lai anh chup.
    try{ window.localStorage.removeItem(this.SKEY); window.localStorage.setItem(this.NOSEED,'1'); }catch(e){}
    // xoa luon file am thanh trong IndexedDB, khong thi con blob mo coi
    const go=()=>window.location.reload();
    Promise.all([this.sndClear(),this.mlvClear()]).then(go,go); }

  SALIAS = {'VW5159':'VW5159-M11','1000199':'FG-1000199','1003117':'FG-1003117'};
  sKey(style){ return this.SALIAS[style]||style; }
  cutColors(style){ return this.CUTCOLORS[this.sKey(style)]||['Black','Navy','Grey']; }
  parseMarker(m){ const o={}; String(m).split('+').forEach(tok=>{ const p=tok.split('/'); const name=(p[0]||'').trim(); if(!name) return; o[name]=(o[name]||0)+(p[1]?(parseInt(p[1],10)||1):1); }); return o; }
  turnSizes(t){ const r=this.parseMarker(t.marker); const o={}; Object.keys(r).forEach(s=>o[s]=r[s]*t.layers); return o; }
  cutTurns(style,po){ const kt=this.khcTurns(style,po); if(kt) return kt; style=this.sKey(style); if(this.CUTTURNS[style]) return this.CUTTURNS[style]; this._gt=this._gt||{}; if(!this._gt[style]) this._gt[style]=this.buildTurns(style); return this._gt[style]; }
  buildTurns(style){ const sz=this.sizesFor(style); const combos=[sz.slice(1,4),sz.slice(2,5),sz.slice(0,3),sz.slice(3),[sz[Math.floor(sz.length/2)]]].filter(c=>c&&c.length); const lay=[120,118,104,72,40]; return combos.map((cs,i)=>({id:'C'+(i+1),marker:cs.map((s,k)=>k===1?s+'/3':(k===2?s+'/2':s)).join('+'),layers:lay[i]||30})); }
  sumTurns(ids,style){ const cat=this.cutTurns(style); const m={}; (ids||[]).forEach(id=>{ const t=cat.find(x=>x.id===id); if(t){ const ts=this.turnSizes(t); Object.keys(ts).forEach(s=>m[s]=(m[s]||0)+ts[s]); } }); return m; }
  cellFrom(style,ids,sizes,qty){ const ss=this.SORDER.filter(s=>sizes.includes(s)); return {turns:[...ids],sizes:ss,qty:{...qty},turn:ids.join(', '),size:ss.join(', '),supply:ss.map(s=>String(qty[s]||0)).join(', ')}; }
  demandTarget(style){ const d=this.DEMAND[this.sKey(style)]; if(d) return {...d}; const sz=this.sizesFor(style); const w=[1,4,7,7,4,2,1]; const t={}; sz.forEach((s,i)=>t[s]=(w[i]||1)*180); return t; }
  // Bo rule sinh san du lieu tuan -- moi o ngay bat dau trong, nhap tay.
  initBundle(rows){ return {}; }
  // 3 cot dau van tu dong: chuyen + ma hang tu Ke hoach may, mau cat theo tac nghiep cat
  autoColor(r,ri){ const cols=this.cutColors(r.style); return cols[ri%cols.length]||''; }
  // Bundle khoa theo danh tinh on dinh: tuan + chuyen + ma hang.
  // Truoc day khoa theo r.id, ma psPlanRows cap lai r1..rN cho tung tuan
  // -> o cua tuan nay hien sang tuan khac, va deo sang ca ma hang khac.
  bKey(r){ return r?(this.state.week+'|'+this.normName(r.line)+'|'+String(r.style||'')):''; }
  bKeyOf(id){ return this.bKey(this.getWeek().rows.find(r=>r.id===id)); }
  bAt(id){ const k=this.bKeyOf(id); return k?this.state.bundle[k]:null; }
  // Ban luu cu khong co tuan trong khoa -> gan vao dung tuan dang chon, la tuan nguoi dung
  // dang xem cac o do. Cac ban sao ao o tuan khac bien mat.
  migrateBundle(old){ if(!old||!Object.keys(old).length) return {};
    const wk=(this.state.weeks||{})[this.state.week]; const rows=(wk&&wk.rows)||[];
    const out={}; rows.forEach(r=>{ const v=old[r.id]; if(v) out[this.bKey(r)]=v; }); return out; }
  bundleColor(r,ri){ const b=this.state.bundle[this.bKey(r)]; return (b&&b.color)||this.autoColor(r,ri); }
  // 1 bang luot cat cho moi ma hang + mau cat. Cac dong cung scope dung chung 1 bo luot,
  // moi luot chi duoc cap 1 lan -> quet ca tuan xem luot nao da bi o khac giu.
  turnScope(style,color){ return this.sKey(style)+'|'+String(color||'').toLowerCase().trim(); }

  // ==== Chon theo TUNG VI TRI SIZE tren so do cat (khong con chon ca luot) ====
  // key = '<luot>|<size>|<so thu tu>'. 1 lenh cap co the lay vi tri cua nhieu luot khac nhau.
  posKey(tid,s,k){ return tid+'|'+s+'|'+k; }
  turnPos(t){ const r=this.parseMarker(t.marker), out=[], ly=Number(t.layers)||0;
    this.SORDER.forEach(s=>{ const n=Number(r[s])||0;
      for(let k=1;k<=n;k++) out.push({tid:t.id,s:s,k:k,ly:ly,key:this.posKey(t.id,s,k)}); });
    return out; }
  posTq(style,pos){ const cat=this.cutTurns(style), tq={};
    (pos||[]).forEach(pk=>{ const a=String(pk).split('|'); const t=cat.find(x=>x.id===a[0]); if(!t) return;
      tq[t.id]=tq[t.id]||{}; tq[t.id][a[1]]=(tq[t.id][a[1]]||0)+(Number(t.layers)||0); });
    return tq; }
  posTurns(style,pos){ const tq=this.posTq(style,pos); return this.cutTurns(style).filter(t=>tq[t.id]).map(t=>t.id); }
  // Ban luu cu chi co 'turns' -> coi nhu o do giu toan bo vi tri cua cac luot da chon
  cellPos(style,c){ if(!c) return [];
    if(c.pos) return c.pos;
    const cat=this.cutTurns(style), out=[];
    (c.turns||[]).forEach(tid=>{ const t=cat.find(x=>x.id===tid); if(t) this.turnPos(t).forEach(p=>out.push(p.key)); });
    return out; }
  usedPos(style,color,skipId,skipDay){ const key=this.turnScope(style,color), used={};
    this.getWeek().rows.forEach((r,i)=>{ if(this.turnScope(r.style,this.bundleColor(r,i))!==key) return;
      const b=this.state.bundle[this.bKey(r)]; if(!b||!b.days) return;
      this.DAYS.forEach(d=>{ if(r.id===skipId&&d===skipDay) return;
        this.cellPos(style,b.days[d]).forEach(pk=>{ if(!used[pk]) used[pk]={line:this.normName(r.line),day:d}; }); }); });
    return used; }
  bformUsedPos(){ const f=this.state.bform; if(!f) return {};
    const rows=this.getWeek().rows, i=rows.findIndex(r=>r.id===f.id); if(i<0) return {};
    return this.usedPos(rows[i].style,this.bundleColor(rows[i],i),f.id,f.day); }
  togglePos(pk){ const f=this.state.bform; if(!f) return;
    if(!(f.pos||[]).includes(pk)&&this.bformUsedPos()[pk]) return;   // vi tri da cap o o khac
    this.setState(st=>{ const p=[...((st.bform||{}).pos||[])]; const i=p.indexOf(pk);
      if(i>=0) p.splice(i,1); else p.push(pk);
      return {bform:{...st.bform,pos:p}}; }); }
  // Checkbox tren dong luot cat: chon het vi tri con trong, hoac bo het vi tri cua luot do
  toggleTurnAll(tid){ const f=this.state.bform; if(!f) return;
    const r=this.getWeek().rows.find(x=>x.id===f.id); if(!r) return;
    const t=this.cutTurns(r.style).find(x=>x.id===tid); if(!t) return;
    const used=this.bformUsedPos();
    const free=this.turnPos(t).filter(p=>!used[p.key]).map(p=>p.key);
    const cur=f.pos||[], allOn=free.length>0&&free.every(k=>cur.includes(k));
    this.setState(st=>{ let p=[...((st.bform||{}).pos||[])];
      if(allOn) p=p.filter(k=>free.indexOf(k)<0);
      else free.forEach(k=>{ if(p.indexOf(k)<0) p.push(k); });
      return {bform:{...st.bform,pos:p}}; }); }
  pickColor(id,color){ const row=this.getWeek().rows.find(r=>r.id===id); if(!row) return;
    const k=this.bKeyOf(id); if(!k) return;
    this.setState(s=>{ const prev=s.bundle[k]; const days=(prev&&prev.color)?prev.days:{}; return {bundle:{...s.bundle,[k]:{color,days}}}; }); }
  bundleTotal(id){ const b=this.bAt(id); if(!b||!b.days||!Object.keys(b.days).length) return null; let t=0; Object.values(b.days).forEach(c=>{ (String(c.supply||'').match(/\d+/g)||[]).forEach(n=>t+=Number(n)); }); return t; }
  sizesFor(style){ return this.SIZES[this.sKey(style)]||this.SIZES._def; }
  openBForm(id,day){ const row=this.getWeek().rows.find(r=>r.id===id); if(!row) return;
    const b=this.bAt(id)||{days:{}};
    // chot luon khoa luu tai thoi diem mo -> doi tuan giua luc dang mo cung khong ghi lech o
    this.setState({bform:{id,day,bk:this.bKeyOf(id),pos:this.cellPos(row.style,(b.days&&b.days[day])||null)},bedit:null,edit:null}); }
  turnCap(style,tid,sz){ const t=this.cutTurns(style).find(x=>x.id===tid); if(!t) return {cap:0,step:1}; const r=this.parseMarker(t.marker)[sz]||0; return {cap:r*t.layers,step:t.layers||1}; }
  tqTotals(tq){ const o={}; Object.keys(tq||{}).forEach(tid=>{ const m=tq[tid]||{}; Object.keys(m).forEach(s=>o[s]=(o[s]||0)+(Number(m[s])||0)); }); return o; }
  togglePickSize(tid,sz){ this.setState(s=>{ const f={...s.bform}; const row=this.getWeek().rows.find(r=>r.id===f.id); const tq={...(f.tq||{})}; const m={...(tq[tid]||{})}; if(Object.prototype.hasOwnProperty.call(m,sz)) delete m[sz]; else { const {step}=this.turnCap(row.style,tid,sz); m[sz]=step; } tq[tid]=m; return {bform:{...f,tq}}; }); }
  setSizeQty(tid,sz,v){ this.setState(s=>{ const f={...s.bform}; const row=this.getWeek().rows.find(r=>r.id===f.id); const {cap,step}=this.turnCap(row.style,tid,sz); let val=Math.max(0,parseInt(v,10)||0); val=Math.round(val/step)*step; val=Math.min(val,Math.floor(cap/step)*step); const tq={...(f.tq||{})}; tq[tid]={...(tq[tid]||{}),[sz]:val}; return {bform:{...f,tq}}; }); }
  adjSize(tid,sz,dir){ this.setState(s=>{ const f={...s.bform}; const row=this.getWeek().rows.find(r=>r.id===f.id); const {cap,step}=this.turnCap(row.style,tid,sz); const capM=Math.floor(cap/step)*step; const tq={...(f.tq||{})}; const cur=Number((tq[tid]||{})[sz])||0; let val=Math.max(0,Math.min(cur+dir*step,capM)); tq[tid]={...(tq[tid]||{}),[sz]:val}; return {bform:{...f,tq}}; }); }
  // Trang thai cap BTP cua 1 o: ban luu cu khong co truong status -> coi la 'waiting'
  cellStatus(cell){ const v=cell&&cell.status;
    return this.STORDER.indexOf(v)>=0?v:'waiting'; }
  bcellAt(id,day){ const b=this.bAt(id); return (b&&b.days&&b.days[day])||null; }
  // Nut Received trong modal: luu luon phan dang sua roi doi trang thai (bam lai -> tra ve Waiting)
  // So sanh theo tap hop -- doi thu tu chon lai cung 1 bo luot cat thi khong tinh la doi
  turnsKey(a){ return [...(a||[])].sort().join(','); }
  // Trang thai se duoc luu neu bam Cap nhat ngay bay gio.
  // Tao moi HOAC doi luot cat -> ve DAU chu ky = 'requested' (STORDER[0]), khong phai
  // 'waiting'; nhay thang sang waiting la bo mat trang thai dau va lam 1 request vua
  // tao ra da trong nhu da qua mot buoc xu ly.
  bformStatus(){ const NEW=this.STORDER[0];
    const f=this.state.bform; if(!f) return NEW;
    const prev=this.bcellAt(f.id,f.day); if(!prev) return NEW;
    const row=this.getWeek().rows.find(r=>r.id===f.id); if(!row) return NEW;
    if(this.turnsKey(this.cellPos(row.style,prev))!==this.turnsKey(f.pos)) return NEW;
    return this.cellStatus(prev); }
  receiveBForm(){ const f=this.state.bform; if(!f) return;
    const next=this.bformStatus()==='received'?'waiting':'received';
    this.logReceive(f,next==='waiting');
    this.saveBForm(next); }
  // Moi lan bam Received deu ghi 1 dong. undo=true la lan bam tra ve Waiting.
  logReceive(f,undo){ const rows=this.getWeek().rows; const idx=rows.findIndex(x=>x.id===f.id);
    const r=rows[idx]; if(!r) return;
    const tq=this.posTq(r.style,f.pos);
    const turns=Object.keys(tq).map(t=>({id:t,
      qty:Object.keys(tq[t]||{}).reduce((a,s)=>a+(Number((tq[t]||{})[s])||0),0)}));
    const e={ts:Date.now(),line:this.normName(r.line),style:r.style||'\u2014',
      color:this.bundleColor(r,idx)||'\u2014',turns,undo:!!undo};
    this.setState(s=>({recvLog:[...(s.recvLog||[]),e]})); }
  recvTime(ts){ const d=new Date(ts), p=n=>String(n).padStart(2,'0');
    return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+String(d.getFullYear()).slice(-2)+' '+p(d.getHours())+':'+p(d.getMinutes()); }
  recvTurnText(e){ return (e.turns||[]).map(t=>t.id+' - '+this.fmt(t.qty)).join(', ')||'\u2014'; }
  saveBForm(status){ const f=this.state.bform; const row=this.getWeek().rows.find(r=>r.id===f.id);
    const tq=this.posTq(row.style,f.pos); const tot=this.tqTotals(tq);
    const sizes=this.SORDER.filter(s=>(tot[s]||0)>0);
    const cell=this.cellFrom(row.style,this.posTurns(row.style,f.pos),sizes,tot);
    cell.tq=tq; cell.pos=[...(f.pos||[])];
    // tao moi / doi luot cat -> Requested; con lai giu nguyen. Nut Received truyen thang status vao day
    cell.status=status||this.bformStatus();
    const k=f.bk||this.bKeyOf(f.id); if(!k){ this.set({bform:null}); return; }
    this.setState(s=>{ const bundle={...s.bundle}; const bb={...(bundle[k]||{color:'',days:{}})}; const days={...bb.days}; days[f.day]=cell; bb.days=days; bundle[k]=bb; return {bundle,bform:null}; }); }
  clearBForm(){ const f=this.state.bform; const k=f.bk||this.bKeyOf(f.id); if(!k){ this.set({bform:null}); return; }
    this.setState(s=>{ const bundle={...s.bundle}; const bb={...(bundle[k]||{days:{}})}; const days={...bb.days}; delete days[f.day]; bb.days=days; bundle[k]=bb; return {bundle,bform:null}; }); }

  seed(){
    const D=(vals)=>{ const o={}; this.DAYS.forEach((d,i)=>o[d]=(vals[i]!=null?vals[i]:null)); return o; };
    let n=0;
    const R=(line,brand,style,vals)=>({id:'r'+(++n),line,brand,style,days:D(vals)});
    // Seed từ tác nghiệp cắt (SL/ngày ≈ tổng đơn ÷ 30) — sửa tay thoải mái
    const wk=()=>[
      R('Line 5','VUORI','VW5159-M2',[255,255,255,255,255,255]),
      R('Line 6','VUORI','VW5159-M11',[310,310,310,310,310,310]),
      R('Line 8','FIGS','1000199',[420,420,420,420,420,420]),
      R('Line 9','FIGS','1000199',[430,430,430,430,430,430]),
      R('Line 10','FIGS','1003117',[815,815,815,815,815,815]),
    ];
    const keys=[]; Object.values(this.MONTHS).forEach(ws=>ws.forEach(w=>keys.push(w)));
    const out={}; let any=false;
    keys.forEach(k=>{ const rows=this.psPlanRows(k); if(rows.length) any=true; out[k]={rows,auto:true}; });
    // Chua co du lieu KHSX (file nap sau khi component dung) -> gieo tam va DANH DAU demo
    // de reconcileWeeks() thay lai bang du lieu that. Khong danh dau thi tuan hien tai
    // se dinh vinh vien 5 dong mau nay.
    if(!any&&!window.PSCHED) out[this.CURWK]={rows:wk(),demo:true};
    return out;
  }
  pd(s){ const p=String(s).split('-').map(Number); return new Date(p[0],(p[1]||1)-1,p[2]||1); }
  psWeekRange(key){ const parts=String(key).split(' · '); const seg=parts[0].split(' ');
    const mi={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}[seg[0]]||0;
    const y=parseInt(seg[1],10)||2026; const wn=parseInt((parts[1]||'W1').replace('W',''),10)||1;
    const first=new Date(y,mi,1), off=(8-first.getDay())%7;
    const s=new Date(y,mi,1+off+(wn-1)*7); return [s,new Date(y,mi,1+off+(wn-1)*7+5)]; }
  // Chuyền + thương hiệu + mã hàng lấy thẳng từ Kế hoạch sản xuất — LẤY MỌI đơn chạy trong
  // tuần (trước đây chỉ lấy đơn đầu tiên nên chuyền đổi mã giữa tuần bị mất dữ liệu).
  // 1 dòng = 1 chuyền + 1 mã hàng; các đơn cùng mã trên 1 chuyền được gộp SL theo ngày.
  psPlanRows(key){
    const [ws,we]=this.psWeekRange(key); const out=[], at={}; let n=0;
    (this.PS().groups||[]).forEach((g,gi)=>(g.rows||[]).forEach((r,ri)=>{
      const line=String(r.line).replace(/LINE/i,'Line');
      this.psRowItems(gi,ri,r).filter(it=>!it.del).map(it=>it.o).forEach(o=>{
        const s=this.pd(o.start), e=this.pd(o.end); if(s>we||e<ws) return;
        const span=Math.max(1,Math.round((e-s)/86400000)+1);
        const rate=Math.max(5,Math.round((o.qty/Math.max(1,span*6/7))/5)*5);
        const style=this.psCode(o.code), brand=this.brandOf(o), k=line+'|'+style;
        let row=at[k];
        if(!row){ const days={}; this.DAYS.forEach(d=>days[d]=null);
          row={id:'r'+(++n),line,brand,style,days}; at[k]=row; out.push(row); }
        else if(!row.brand&&brand) row.brand=brand;
        this.DAYS.forEach((d,i)=>{ const dt=new Date(ws.getFullYear(),ws.getMonth(),ws.getDate()+i);
          if(dt>=s&&dt<=e) row.days[d]=(row.days[d]||0)+rate; });
      });
    }));
    return this.sortPlan(out);
  }
  sortPlan(rows){ return rows.map((r,i)=>[r,i]).sort((a,b)=>{
    const na=this.parseNums(a[0].line), nb=this.parseNums(b[0].line);
    return ((na.length?na[0]:1e9)-(nb.length?nb[0]:1e9))||(a[1]-b[1]); }).map(x=>x[0]); }

  fmt(n){ return (n||0).toLocaleString('en-US'); }
  getWeek(key){ return this.state.weeks[key || this.state.week] || {rows:[]}; }
  rowTotal(r){ return this.DAYS.reduce((a,d)=>a+(Number(r.days[d])||0),0); }
  colTotal(rows,d){ return rows.reduce((a,r)=>a+(Number(r.days[d])||0),0); }
  grand(rows){ return rows.reduce((a,r)=>a+this.rowTotal(r),0); }
  weekTotal(key){ return this.grand(this.getWeek(key).rows); }
  parseNums(name){ return (String(name).match(/\d+/g)||[]).map(Number); }
  normName(s){ const nums=(String(s||'').match(/\d+/g)||[]); if(!nums.length) return String(s||'').toUpperCase().replace(/\s+/g,' ').trim(); return 'LINE '+nums.join('+'); }

  // Ngày của tuần — dùng chung psWeekRange để mọi màn khớp nhau
  weekDates(key){
    const start=this.psWeekRange(key||this.state.week)[0];
    const mnames=this.MN3;
    return this.DAYS.map((d,i)=>{ const dt=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i); return dt.getDate()+'-'+mnames[dt.getMonth()]; });
  }

  prevWeekKey(){ const all=[]; Object.values(this.MONTHS).forEach(ws=>ws.forEach(w=>all.push(w))); const i=all.indexOf(this.state.week); return i>0?all[i-1]:null; }
  set(patch){ this.setState(patch); }

  // 3 cot dau cua bang Ke hoach may tuan do Ke hoach san xuat quyet dinh (psPlanRows).
  // Sua tay o day se lech voi plan, nen khoa lai -- chi SL theo ngay la nhap tay.
  PLANCOLS = ['line','brand','style','wa'];   // 'wa' = cot A (TOTAL ORDER CUT) o bang Nhu Cau BTP
  startEdit(id,col){ if(this.PLANCOLS.includes(col)&&this.planColLocked(id,col)) return;
    this._chainBrand=null;
    const empty=(this.getWeek().rows||[]).filter(r=>r.id!==id&&!r.brand&&!r.style&&!this.rowHasData(r)).map(r=>r.id);
    if(empty.length) this.mutateRows(rows=>rows.filter(r=>!empty.includes(r.id)));
    this.setState({edit:{id,col},bedit:null}); }
  planColLocked(id,col){ const rows=this.getWeek().rows; const r=rows.find(x=>x.id===id); if(!r) return true;
    return this.PLANCOLS.includes(col); }
  rowHasData(r){ return this.DAYS.some(d=>r.days[d]!=null); }
  clearRowLinks(id){ const bk=this.bKeyOf(id); this.setState(s=>{ const bundle={...s.bundle}; if(bk) delete bundle[bk]; const wip={...s.wip}; Object.keys(wip).forEach(k=>{ if(k.endsWith('|'+id)) delete wip[k]; }); return {bundle,wip}; }); }
  dayTaken(r,d){ const ln=this.normName(r.line); const o=this.getWeek().rows.find(x=>x.id!==r.id&&this.normName(x.line)===ln&&x.days[d]!=null); return o||null; }
  stopEdit(){
    if(this._chainBrand){ const id=this._chainBrand; this._chainBrand=null; this.setState({edit:{id,col:'brand'},bedit:null}); return; }
    const empty=(this.getWeek().rows||[]).filter(r=>!r.brand&&!r.style&&!this.rowHasData(r)).map(r=>r.id);
    if(empty.length) this.mutateRows(rows=>rows.filter(r=>!empty.includes(r.id)));
    this.setState({edit:null,bedit:null}); }
  mutateRows(fn){ this.setState(s=>{ const weeks={...s.weeks}; const key=s.week; const wk={...(weeks[key]||{rows:[]})}; wk.rows=this.sortPlan(fn(wk.rows)); delete wk.demo; delete wk.auto; weeks[key]=wk; return {weeks}; }); }
  setDay(id,day,val){ const v=(val===''||val==null)?null:(Number(val)||0); const r=this.getWeek().rows.find(x=>x.id===id); const ln=r&&this.normName(r.line);
    this.mutateRows(rows=>rows.map(x=>{ if(x.id===id) return {...x,days:{...x.days,[day]:v}};
      if(v!=null&&this.normName(x.line)===ln&&x.days[day]!=null) return {...x,days:{...x.days,[day]:null}};
      return x; })); }
  setBrand(id,v){ const r=this.getWeek().rows.find(x=>x.id===id); if(r&&r.brand===v) return; const wipe=r&&this.rowHasData(r); const blank={}; this.DAYS.forEach(d=>blank[d]=null);
    this.mutateRows(rows=>rows.map(r=>r.id===id?{...r,brand:v,style:'',...(wipe?{days:blank}:{})}:r)); if(wipe) this.clearRowLinks(id); }
  setStyle(id,v){ const r=this.getWeek().rows.find(x=>x.id===id); if(r&&r.style===v) return; const wipe=r&&this.rowHasData(r); const blank={}; this.DAYS.forEach(d=>blank[d]=null);
    const nb=this.brandForStyle(v);
    this.mutateRows(rows=>rows.map(r=>r.id===id?{...r,style:v,...((!r.brand&&nb)?{brand:nb}:{}),...(wipe?{days:blank}:{})}:r)); if(wipe) this.clearRowLinks(id); }
  MAXL = 12;
  // Danh sách chuyền bám theo Kế hoạch sản xuất — không tự sinh Line 4/13, có Line 14
  psLines(){ if(this._psLines&&this._psLines.length) return this._psLines;
    const out=[]; (this.PS().groups||[]).forEach(g=>(g.rows||[]).forEach(r=>{ const n=this.normName(r.line); if(out.indexOf(n)<0) out.push(n); }));
    this._psLines=out; return out; }
  planLineNums(){ const s=new Set(); this.psLines().forEach(n=>this.parseNums(n).forEach(x=>s.add(x)));
    const a=Array.from(s).sort((x,y)=>x-y); return a.length?a:Array.from({length:this.MAXL},(_,i)=>i+1); }
  addRowSame(line){ const id='r'+Date.now(); const days={}; this.DAYS.forEach(d=>days[d]=null);
    this.mutateRows(rows=>[...rows,{id,line,brand:'',style:'',days}]); this.setState({edit:{id,col:'brand'},bedit:null}); }
  capDays(r){ const key=this.bdKey(r.line,r.brand,r.style); const out=this.DAYS.map(()=>0); let hit=false;
    this.getWeek().rows.forEach(x=>{ if(this.bdKey(x.line,x.brand,x.style)!==key) return; hit=true; this.DAYS.forEach((d,i)=>{ out[i]+=Number(x.days[d])||0; }); });
    return hit?out:(r.days||[]).map(x=>Number(x)||0); }
  renameGroup(ids,name){ const nm=this.normName(name); const ok=this.planLineNums(); if(this.parseNums(nm).some(n=>ok.indexOf(n)<0)){ window.alert(this.t('maxLines')); return; }
    const ns=this.parseNums(nm); if(ns.length>2||(ns.length===2&&Math.abs(ns[0]-ns[1])!==1)){ window.alert(this.t('lineMergeErr')); return; }
    const others=this.getWeek().rows.filter(r=>!ids.includes(r.id));
    if(ns.some(n=>others.some(x=>this.parseNums(x.line).includes(n)))){ window.alert(this.t('lineDupErr')); return; }
    const fresh=this.getWeek().rows.find(r2=>ids.includes(r2.id)&&!r2.brand&&!r2.style&&!this.rowHasData(r2)); if(fresh) this._chainBrand=fresh.id; this.mutateRows(rows=>rows.map(r=>ids.includes(r.id)?{...r,line:nm}:r)); }
  removeGroup(ids){ this.mutateRows(rows=>rows.filter(r=>!ids.includes(r.id))); }
  removeGroupSafe(ids){ const rows=this.getWeek().rows.filter(r=>ids.includes(r.id));
    const hasData=rows.some(r=>this.DAYS.some(d=>r.days[d]!=null));
    if(hasData && !window.confirm(this.t('confirmDel'))) return;
    this.removeGroup(ids); this.stopEdit(); }
  lineSpans(rows){ const norm=r=>this.normName(r.line); const info=[]; let i=0;
    while(i<rows.length){ let j=i; while(j+1<rows.length && norm(rows[j+1])===norm(rows[i])) j++; const ids=rows.slice(i,j+1).map(r=>r.id); const span=j-i+1;
      for(let k=i;k<=j;k++) info[k]={first:k===i,span,ids}; i=j+1; } return info; }
  fieldSpans(rows,field){ const norm=r=>this.normName(r.line); const info=[]; let i=0;
    while(i<rows.length){ let lend=i; while(lend+1<rows.length && norm(rows[lend+1])===norm(rows[i])) lend++;
      let k=i; while(k<=lend){ const v=rows[k][field]; let m=k; while(m+1<=lend && rows[m+1][field]===v && (v!=null&&v!=='')) m++; const span=m-k+1; for(let x=k;x<=m;x++) info[x]={first:x===k,span}; k=m+1; }
      i=lend+1; } return info; }
  copyLastWeek(){ const prev=this.prevWeekKey(); if(!prev) return; const src=this.getWeek(prev);
    this.setState(s=>{ const weeks={...s.weeks}; weeks[s.week]={rows:JSON.parse(JSON.stringify(src.rows)).map((r,i)=>({...r,id:'r'+Date.now()+'_'+i}))}; return {weeks}; }); }
  // Tải file ngay tại panel tác nghiệp cắt — không nhảy sang trang khác
  addFilesHere(list){ const arr=Array.from(list||[]).map(f=>({name:f.name,size:(Math.max(1,Math.round(f.size/1024)))+' KB'})); if(!arr.length) return; this.setState(s=>({files:[...s.files,...arr]})); }
  selectWeek(w){ this.setState({week:w,edit:null,bedit:null},()=>{ setTimeout(()=>{ const sc=this.scrollRef.current, el=this.panelRef.current; if(sc&&el){ const top=el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 16; sc.scrollTo({top,behavior:'smooth'}); } },60); }); }

  L = {
    vi:{ bcRoot:'Kế hoạch', bcPage:'Kế hoạch may', upload:'Tải tác nghiệp cắt', mes:'Hệ thống điều hành sản xuất',
      pageTitle:'Kế Hoạch May / Lắp Ráp', help:'Trợ giúp',
      dsoBc:'Sản lượng may hàng ngày', dsoTitle:'Sản Lượng May Hàng Ngày', dsoSoon:'Bảng sẽ được thiết kế ở bước sau — đang chờ spec chi tiết.',
      dsoOvw:'Tổng hợp theo ngày · chuyền', dsoOvwSub:'Sản lượng hoàn thành và số đã giao sang hoàn thiện',
      dsoOvwDone:'HOÀN THÀNH', dsoOvwHanded:'ĐÃ GIAO', dsoOvwLeft:'CHƯA GIAO',
      dsoLines:'Chuyền may', dsoLinesSub:'Bấm 1 chuyền để đếm sản lượng theo size',
      dsoHist:'Lịch sử hoàn thành theo ngày', dsoHistSub:'Tổng hợp số hàng đã hoàn thành mỗi ngày', dsoHistEmpty:'Chưa ghi sản lượng nào — bấm vào card size ở trên để đếm.',
      dsoColDay:'NGÀY', dsoColPo:'PO', dsoColColor:'MÀU', dsoColQty:'SỐ LƯỢNG HOÀN THÀNH',
      dsoAskOk:'Xác nhận giao',
      bgTitle:'PHIẾU BÀN GIAO — May → Hoàn thiện', bgStyle:'Mã hàng', bgPo:'PO',
      bgColor:'Màu', bgLine:'Chuyền', bgFrom:'Người giao', bgTo:'Người nhận', bgName:'Nhập tên…',
      bgProdDay:'Ngày sản xuất', bgStatus:'Trạng thái', bgPending:'Chờ xác nhận',
      bgSize:'Cỡ', bgQty:'Số lượng giao', bgTotal:'Tổng nhận', bgCum:'Lũy kế đến phiếu này',
      bgCumTip:'Tổng đã giao sang hoàn thiện của mã hàng · PO · màu này, tính đến phiếu này',
      bqTitle:'PHIẾU GIAO NHẬN BÁN THÀNH PHẨM',
      bqDay:'Ngày giao:', bqCust:'Khách hàng:', bqLine:'Cho chuyền may:', bqStyle:'Mã hàng:',
      bqC1:'Mẫu', bqC2:'Bàn', bqC3:'Cỡ', bqC4:'Số lượng', bqC5:'Số PO #',
      bqNote:'Ghi chú:', bqSign1:'Người giao', bqSign2:'Người nhận',
      bqOk:'Xác nhận đã nhận', bqOpenTip:'Bấm để mở phiếu giao nhận bán thành phẩm',
      bgSignFrom:'Người giao (May)', bgSignTo:'Người nhận (Hoàn thiện)',
      bgPrint:'In / Lưu PDF', bgView:'Xem / in phiếu bàn giao',
      dsoHandOver:'Giao sang hoàn thiện', dsoHanded:'Đã giao', dsoUndoHand:'Hủy phiếu bàn giao gần nhất của dòng này',
      dsoReq:'CẦN LÀM', dsoHistSearch:'Tìm ngày, style, PO, màu, size…',
      dsoFailOvw:'Tổng hợp hàng lỗi theo chuyền',
      dsoFailOvwSub:'Số hàng lỗi và lỗi hay gặp nhất của từng chuyền — bấm 1 dòng để mở chuyền',
      dsoFailRate:'TỈ LỆ LỖI', dsoTopDef:'LỖI NHIỀU NHẤT',
      dsoFailOvwEmpty:'Chưa ghi sản lượng hay hàng lỗi ở chuyền nào.',
      dsoHandAllSub:'Tổng hợp theo size — điền số lượng muốn giao cho từng size',
      bkDays:'Ngày', bkPend:'CHƯA BÀN GIAO THEO SIZE',
      bkGive:'SỐ LƯỢNG GIAO', bkLeft:'CHƯA GIAO', bkTot:'TỔNG',
      bkAll:'Giao hết', bkNone:'Xóa số', bkSel:'sẽ giao', bkNext:'Tiếp tục',
      bgBack:'Quay lại', bgReq:'Bắt buộc',
      bgNeedWho:'Nhập người giao và người nhận trước khi xác nhận',
      dsoNoUnhanded:'Không còn hàng nào chờ giao — tất cả đã giao sang hoàn thiện.',
      dsoDefHist:'Lịch sử hàng lỗi theo ngày', dsoDefHistSub:'Mỗi lần bấm LỖI được ghi lại kèm giờ và lý do',
      dsoDefHistEmpty:'Chưa ghi hàng lỗi nào — bấm LỖI ở card size để ghi.',
      dsoDefExpTip:'Xuất .xlsx đúng những dòng đang hiện', dsoDefAllLines:'TẤT CẢ CHUYỀN',
      dsoColSize:'SIZE', dsoColReason:'LÝ DO', dsoColDefQty:'SỐ LƯỢNG LỖI', dsoColTime:'GIỜ',
      mlvIncTip:'Thu nhập / 1 người theo giờ làm của chuyền',
      mlvSwitch:'Đổi chuyền', mlvTeam:'TỔ', mlvPerHour:'SẢN LƯỢNG / GIỜ', mlvQual:'CHẤT LƯỢNG',
      mlvFull:'Toàn màn hình', mlvExitFull:'Thoát toàn màn hình',
      mlvHourTip:'Số lần bấm ĐẠT trong giờ này',
      mlvRate:'Tỉ lệ lỗi', mlvTop3:'Top 3 lỗi nhiều nhất', mlvPick:'Chọn 1 chuyền để mở bảng điện tử M-level', mlvOpen:'Mở bảng M-level của chuyền này',
      dsoOpenLine:'Bấm để xem chi tiết theo size', dsoBack:'← Danh sách chuyền', dsoDoneNeed:'ĐÃ LÀM / CẦN LÀM',
      dsoTapAdd:'Bấm để ghi kết quả kiểm (ĐẠT / LỖI)', dsoTapSub:'Trủ 1 (bấm nhầm)', dsoNoCut:'Chuyền này chưa có tác nghiệp cắt',
      dsoTapTitle:'Ghi Kết Quả Kiểm', dsoTapTip:'Bấm ĐẠT để +1 thành phẩm, hoặc LỖI để chọn lý do',
      dsoPass:'ĐẠT', dsoPassSub:'+1 sản phẩm đã làm', dsoFail:'LỖI', dsoFailSub:'Chọn lý do lỗi',
      dsoPick:'Chọn Lý Do Lỗi', dsoPickSub:'Bấm 1 dòng để ghi hàng lỗi cho size này', dsoPickBack:'← Quay lại',
      dsoDefEmpty:'Thư viện lỗi đang trống — vào Cài Đặt · Thư Viện Lỗi để thêm.',
      dsoDefLogged:'lỗi đã ghi', dsoClose:'Đóng',
      dfPanel:'Thư Viện Lỗi', dfSub:'Danh mục lỗi dùng khi ghi hàng lỗi ở chuyền may',
      dfCode:'Mã lỗi', dfName:'Tên lỗi', dfCat:'Nhóm lỗi', dfSev:'Mức độ', dfLoc:'Vị trí lỗi', dfCause:'Nguyên nhân gốc',
      dfAdd:'Thêm lỗi', dfEmpty:'Chưa có lỗi nào — bấm Thêm lỗi hoặc nhập từ Excel.',
      dfSearch:'Tìm mã lỗi, tên lỗi, nhóm, vị trí…', dfNoHit:'Không có dòng nào khớp từ khóa',
      dfImportTip:'Nhập .xlsx/.xls/.csv — cột: Mã lỗi · Tên lỗi · Nhóm lỗi · Mức độ · Vị trí lỗi · Nguyên nhân gốc',
      dfCount:'lỗi trong thư viện',
      lsCol1:'CHUYỀN', lsCol2:'STYLE', lsCol3:'CÔNG NHÂN', lsCol4:'GIỜ LÀM', lsCol5:'NGÀY (DD/MM/YYYY)', lsCol6:'SMV', lsCol7:'LOẠI', lsCol8:'%TARGET', lsCol9:'FILE M-LEVEL ĐÃ NHẬP', lsCol10:'HÀNH ĐỘNG',
      lsEdit:'Sửa', lsDone:'Xong', lsImport:'Nhập file', lsImportTip:'Chọn file M-level (.xlsx/.csv) — lưu trong IndexedDB', lsFileDel:'Xóa file', lsFileErr:'Không lưu được file vào IndexedDB', lsPctTip:'Số nguyên 0–100, không âm, không thập phân', lsDec1Tip:'Không âm, tối đa 1 chữ số thập phân', lsTypeTip:'Tự động theo SMV — không sửa tay: SMV > 100 → loại 1, 60 < SMV ≤ 100 → loại 2, SMV ≤ 60 → loại 3',
      dsotab1:'Cài Đặt', dsotab2:'Sản Xuất', dsotab3:'Cảnh Báo', dsotab4:'M-level', dsosub1:'Cấu Hình Chuyền', dsosub2:'Cấu Hình Loại M-level', dsosub3:'Thư Viện Lỗi',
      dsoLinePanel:'Cấu Hình Chuyền', dsoLineSub:'Danh sách chuyền may — nhóm chuyền, định mức, ca làm việc',
      mtPanel:'Loại M-level', mtSub:'Danh mục loại — bấm 1 dòng để xem chi tiết',
      mtdPanel:'Chi Tiết Loại M-level', mtdSub:'Định mức và thu nhập theo từng bậc',
      mtName:'Tên', mtDesc:'Mô tả', mtAct:'Hành động', mtNo:'No', mtTgt:'%Target',
      mtTgtTip:'Số nguyên, không âm — bậc M cao được vượt 100%',
      mtInc:'Thu nhập / 1 người (9.5h)(VND)',
      mtAdd:'Thêm', mtDel:'Xóa', mtImport:'Nhập file', mtImportTip:'Nhập .xlsx/.xls/.csv — thêm vào cuối danh sách chi tiết',
      mtImportOk:'Đã nhập', mtImportRows:'dòng', mtImportNone:'Không tìm thấy dòng nào có tên hợp lệ.',
      mtImportErr:'Không đọc được file.', mtNoXlsx:'Thư viện Excel chưa tải xong — thử lại sau vài giây.',
      mtEmpty:'Chưa có loại M-level nào', mtdEmpty:'Loại này chưa có dòng chi tiết nào',
      mtPickType:'Chọn một loại M-level ở bảng bên trái',
      alEdit:'Sửa', alDone:'Xong', alAdd:'Thêm cảnh báo', alDel:'Xóa cảnh báo', alName:'Tên cảnh báo',
      alPick:'Chọn âm thanh', alPlay:'Nghe thử', alClrSnd:'Bỏ âm thanh', alHasSnd:'Có âm thanh', alNoSnd:'Chưa có âm thanh',
      alEmpty:'Chưa có cảnh báo nào — bấm Sửa để thêm', alSndBig:'File âm thanh quá lớn (tối đa 20 MB).', alSndErr:'Không lưu được file âm thanh.',
      dsoProdPanel:'Sản Lượng May Theo Ngày', dsoProdSub:'Sản lượng thực tế theo chuyền — nhập / theo giờ', dsoAlertPanel:'Cảnh Báo Sản Lượng', dsoAlertSub:'Bấm để phát cảnh báo — âm thanh lưu trên máy này', dsoMlvPanel:'Theo Dõi M-level', dsoMlvSub:'Sản lượng theo loại M-level',
      kcTb:'LƯỢT CẮT', kcLy:'SỐ LỚP',  kcPcs:'TỔNG PCS', kcTagN:'TEM', kcAux:'VẢI PHỤ — LÓT · MEX · BÔNG · DỰNG', kcAuxN:'VẢI PHỤ',
      kcGb:'GB — ghép bàn (cắt chung vải khác)', kcModal:'TEM QR — LƯỢT', kcPrint:'IN TEM', kcClose:'ĐÓNG', kcLop:'LỚP', kcTem:'TEM',
      kcSrcL:'NGUỒN', kcSrcGen:'DỮ LIỆU MẪU', kcSrcFile:'FILE UPLOAD',
      kcBuyer:'KHÁCH', kcStyleL:'MÃ HÀNG', kcTotal:'TỔNG SL', kcTables:'SỐ LƯỢT CẮT', kcTags:'TEM QR', kcGbS:'GHÉP BÀN',
       lgPull:'Lấy từ Nhu Cầu BTP / Kế Hoạch May',
        dpMcOpt:'Máy', dpTbOpt:'Bàn',
       cpTurnU:'lượt',
      psBc:'Kế hoạch sản xuất', psTitle:'Kế Hoạch Sản Xuất',
      psK1:'ĐƠN HÀNG',  psK2:'TỔNG SẢN LƯỢNG',
      psK3:'CHUYỀN CÓ ĐƠN',  psK4:'KHOẢNG THỜI GIAN',
      psLine:'CHUYỀN', psIn:'NỘI BỘ', psSub:'GIA CÔNG NGOÀI', psOrdU:'đơn', psToday:'HÔM NAY', psGoToday:'Về hôm nay',
      psZa:'Gọn', psZb:'Vừa', psZc:'Rộng',
      psLanes:'làn',
      planFromPs:'Chuyền & mã hàng đồng bộ từ Kế hoạch sản xuất. Cần thêm dòng cho chuyền (đơn giao nhau / làm trùng) thì bấm dấu + ở ô chuyền.',
      kcPiece:'VỊ TRÍ CẮT (PIECE)',
       psUpload:'Tải tác nghiệp cắt cho đơn này', psClose:'Đóng',
      psMaster:'ĐƠN GỐC — MASTER ORDER', psOrderL:'ĐƠN HÀNG', psRatioL:'TỶ LỆ CẮT THEO MÃ', psMatL:'DANH MỤC VẢI', psStartL:'BẮT ĐẦU', psEndL:'KẾT THÚC', psDateHint:'Sửa được — thanh Gantt chạy theo',
      psDelOrd:'Xóa đơn', psRestore:'Đã xóa — bấm để hoàn tác', psTrash:'Thùng rác', psUndoTip:'Xóa đơn — hoàn tác bằng Ctrl+Z hoặc thùng rác', psUndo:'Hoàn tác',
      psUpPlan:'Tải kế hoạch sản xuất', psAddLine:'Chuyền', psAddLineTip:'Thêm chuyền vào kế hoạch sản xuất', psDelLineTip:'Xóa chuyền trống này', psAddTip:'Thêm đơn / tác nghiệp cắt cho chuyền này', psAddTitle:'Thêm tác nghiệp cắt',
      psFStyle:'MÃ HÀNG', psFBrand:'THƯƠNG HIỆU', psFPo:'PO', psFQty:'SỐ LƯỢNG (pcs)', psFStart:'NGÀY BẮT ĐẦU', psFEnd:'NGÀY KẾT THÚC', psFFile:'FILE TÁC NGHIỆP CẮT (.xlsx)',
      psPick:'Chọn file…', psSave:'Lưu đơn', psCancel:'Hủy', psQty:'SẢN LƯỢNG', psCutD:'NGÀY CẮT', psEx:'NGÀY XUẤT (EX)',
      psModeFile:'Chọn file', psModeMan:'Nhập tay',
      psManSz:'CHỌN SIZE', psManAdd:'+ Thêm bàn', psManDel:'Xóa bàn', psManTitle:'TÁC NGHIỆP CẮT — NHẬP TAY', psManTot:'TỔNG',
      psManCp:'MÃ MÀU / PO', psManAddCp:'+ mã màu', psManDelCp:'Xóa mã màu', psManColorPh:'mã màu', psManPoPh:'PO',
      psManCpHint:'Mỗi lượt cắt phải có mã màu — 1 lượt có thể ghép tối đa 2 mã màu, mỗi mã màu 1 PO riêng.',
      cfTitle:'Trùng dữ liệu kế hoạch sản xuất', cfSub:'đơn đã có trong kế hoạch — chọn bản muốn giữ',
      cfCur:'ĐANG DÙNG', cfNew:'TỪ FILE', cfKeepAll:'Giữ hết bản đang dùng', cfTakeAll:'Lấy hết từ file', cfApply:'Áp dụng',
      cfFrom:'Đã cập nhật theo file kế hoạch',
      resetSaved:'Đặt lại', resetTip:'Xóa dữ liệu đã lưu trên máy này và tải lại trang', resetAsk:'Xóa toàn bộ thay đổi đã lưu và tải lại trang?',
      kcSumCut:'Σ ĐÃ XẾP', kcNeedRow:'NHU CẦU',
      psRaw:'DÒNG GỐC TRONG FILE',  psCombine:'GHÉP',
      psSum:'BẢNG TỔNG THEO MÀU', psSumC:'MÀU / VẢI',   psSumQ:'SỐ LƯỢNG', psSumT:'LƯỢT CẮT', psSumTot:'TỔNG',
      psNoPlan:'Chưa có tác nghiệp cắt cho đơn này — tải file KH cắt (.xlsx) để nạp bàn cắt & tem QR.',
      dashBc:'Dashboard sản xuất', dashTitle:'Dashboard Sản Xuất',
      dashK1:'KH MAY TUẦN', dashK1s:'pcs kế hoạch tuần', dashK2:'SL CẮT CẦN', dashK2s:'pcs phải cắt tuần',
      dashK3:'LƯỢT CẮT', dashK3s:'đã xếp / đã đặt', dashK4:'HOÀN THÀNH MAY', dashK4s:'% so với kế hoạch tuần',
      dashSew:'TIẾN ĐỘ MAY THEO CHUYỀN', dashCut:'TIẾN ĐỘ CẮT THEO CHUYỀN — LƯỢT ĐÃ XẾP / ĐÃ ĐẶT', dashTb:'TẢI BÀN CẮT',
      kpiPlan:'KẾ HOẠCH MAY', kpiPlanSub:'pcs kế hoạch tuần', kpiDemand:'NHU CẦU BTP', kpiDemandSub:'pcs cần cấp tuần sau', kpiReq:'LỆNH CẤP BTP', kpiReqSub:'pcs đã cấp BTP',
      tab1:'Kế Hoạch May Tuần', tab2:'Nhu Cầu BTP Tuần', tab3:'Lệnh Cấp BTP Tuần', period:'KỲ',
      copyWeek:'Chép tuần trước', downloadTpl:'Tải file mẫu', exportXls:'Xuất Excel', exportTip:'Xuất 1 file .xlsx gồm 3 sheet',
      activeRows:'Dòng có dữ liệu', rowsN:'Số dòng', linesN:'Số chuyền', totalQty:'Tổng SL',
      planEmpty:'Tuần này chưa có dòng nào. Chép tuần trước hoặc thêm chuyền bên dưới.', addLine:'Thêm chuyền',
      colLine:'CHUYỀN', colBrand:'THƯƠNG HIỆU', colStyle:'MÃ HÀNG', colTotal:'TỔNG',
      addBrand:'+ Thương hiệu', addStyle:'+ Mã hàng',
      tipLine:'Bấm để sửa / xóa chuyền', tipPlanCol:'Lấy từ Kế hoạch sản xuất — sửa ở trang Kế hoạch sản xuất', tipBrand:'Chọn thương hiệu', tipStyle:'Chọn mã hàng', tipDay:'Bấm để nhập số', tipDelLine:'Xóa chuyền',
      phLine:'Chuyền…', phBrand:'Thương hiệu…', phStyle:'Mã hàng…', phStyleFirst:'Chọn thương hiệu trước',
      confirmDel:'Chuyền này đang có dữ liệu — xóa toàn bộ dòng của chuyền?',
      maxLines:'Chuyền này không có trong Kế hoạch sản xuất', dayConflict:'Ngày này đang có mã khác chạy — nhập vào đây sẽ xóa số của mã kia (1 chuyền 1 mã/ngày)',
      tipRepick:'Chọn lại — số liệu ngày của dòng này sẽ bị xóa',
      addStyleRow:'Thêm mã thứ 2 cho chuyền này trong tuần — không cần tạo lại chuyền',
      lineMergeErr:'Chỉ được gộp 2 chuyền liền kề — VD Line 1+2. Không gộp chuyền cách nhau (Line 1+3) hoặc 3 chuyền trở lên.',
      lineDupErr:'Không gộp được: chuyền này đang có dòng riêng trong bảng — xóa hoặc đổi tên dòng đó trước.',
      demandTitle:'Nhu Cầu Sản Lượng Cắt Hàng Tuần', demandSub:'Weekly Cutting Bundle Demand', factory:'NHÀ MÁY',
      grpWip:'TÌNH TRẠNG WIP', grpNext:'NHU CẦU TUẦN TIẾP THEO',
      dA:'TỔNG CẮT CỦA ĐƠN', dB:'TỔNG WIP ĐÃ CẤP', dC:'OUTPUT RA CHUYỀN', dBC:'WIP TỒN CUỐI TUẦN', dD:'1 NGÀY WIP', dE:'WIP CẦN GỐI', dF:'SL DỰ KIẾN TUẦN SAU', dNeed:'SỐ LƯỢNG CẦN CẤP', remark:'GHI CHÚ',
      tipA:'Tổng yêu cầu cắt — lấy từ tác nghiệp cắt (khớp thương hiệu + mã hàng), không sửa ở đây', tipB:'Tổng WIP đã cấp — nhập tay', tipC:'Tổng output ra chuyền — nhập tay', tipD:'Sản lượng 1 ngày WIP — nhập tay',
      tipManual:'Nhập tay — bấm để sửa', tipBC:'B − C', tipE:'E = MAX(0, D − B + C). Nếu tồn > 1 ngày WIP thì không cần cấp gối.',
      tipF:'SUMIFS từ Kế Hoạch May tuần này — khớp chuyền + thương hiệu + mã hàng', tipFEst:'Kế Hoạch May chưa có dòng khớp chuyền + thương hiệu + mã hàng', tipNeed:'IF(E+F > A−B, A−B, E+F)',
      demandEmpty:'Tuần này chưa có chuyền nào trong Kế Hoạch May.',
      reqSub:'Lệnh Cấp BTP Cắt Theo Tuần',
      colColor:'MÀU CẮT', recvTitle:'Lịch sử nhận bán thành phẩm', recvSub:'Mọi lần bấm Received đều được ghi lại', recvEmpty:'Chưa có lượt nhận nào', recvDT:'THỜI ĐIỂM', recvTurn:'LƯỢT CẮT', recvRows:'lượt', recvUndo:'Hủy nhận', colReqPlan:'ĐÃ CẤP / DEMAND', tipReqPlan:'Số lượng đã lên đơn yêu cầu / Số lượng demand trên kế hoạch', tipAutoCol:'Tự động theo tác nghiệp cắt — không sửa ở đây', pickColor:'Chọn màu…', pickColorFirst:'chọn màu trước', issue:'Cấp BTP', planShort:'KH ', tipIssue:'Cấp BTP cho ô này', tipIssueEdit:'Sửa cấp BTP',
      mTitle:'Cấp BTP theo bàn', mColor:'MÀU CẮT', mPlan:'KẾ HOẠCH (pcs)',
       cCutTurn:'Lượt cắt:', mIssueRow:'ĐANG CẤP', mPickPos:'Bấm để chọn / bỏ cỡ này',   mBySize:'TỔNG THEO SIZE', mNeeded:'Cần cấp', mCuttable2:'Cắt được',
      mClear:'Xóa ô', mCancel:'Hủy', mSave:'Lưu cấp BTP', mUpdate:'Cập nhật', mIssue:'Cấp', mNoTurnSel:'Chưa chọn lượt cắt', mTurns:'lượt', mSizes:'size',  plies:'lớp lá', left:'còn ',
      stRequested:'Đã yêu cầu', stWaiting:'Chờ nhận', stReceived:'Đã nhận', stCycleTip:'Bấm để đổi trạng thái: Đã yêu cầu → Chờ nhận → Đã nhận', mReceived:'Đã nhận',
      mTurnPool:'Bảng lượt cắt dùng chung cho mã hàng + màu cắt này — mỗi lượt chỉ cấp được 1 lần trong tuần',
      mTakenTip:'Lượt này đã cấp ở ô khác — bỏ ở đó trước nếu muốn dùng lại',
      fiBc:'Nhận hàng hoàn thiện', fiTitle:'Nhận Hàng Sang Hoàn Thiện',
      fiPanel:'Phiếu Bàn Giao Từ May', fiSub:'Mỗi phiếu bàn giao phát hành ở Sản lượng may hàng ngày về đây để hoàn thiện xác nhận đã nhận hàng',
      fiK1:'CHỜ NHẬN', fiK1s:'phiếu bàn giao chưa xác nhận', fiK2:'SL CHỜ NHẬN', fiK2s:'pcs đang trên đường sang hoàn thiện',
      fiK3:'NHẬN HÔM NAY', fiK3s:'pcs đã nhận trong ngày', fiK4:'TỔNG ĐÃ NHẬN', fiK4s:'pcs đã vào hoàn thiện',
      fiNo:'SỐ PHIẾU', fiWhen:'PHÁT HÀNH LÚC', fiLine:'CHUYỀN', fiStyle:'MÃ HÀNG', fiPo:'PO', fiColor:'MÀU',
      fiSizes:'SIZE', fiQty:'SL (PCS)', fiSt:'TRẠNG THÁI', fiBy:'NGƯỜI NHẬN', fiAct:'HÀNH ĐỘNG',
      fiWait:'Chờ nhận', fiDone:'Đã nhận', fiRecv:'Nhận', fiUnrecv:'Bỏ nhận', fiView:'Xem phiếu',
      fiRecvAll:'Nhận tất cả', fiByTip:'Lấy từ ô "Người nhận (Hoàn thiện)" trên phiếu bàn giao', fiCount:'phiếu bàn giao',
      fiSearch:'Tìm số phiếu, chuyền, mã hàng, PO, màu…', fiNoHit:'Không có phiếu nào khớp từ khóa',
      fiEmpty:'Chưa có phiếu bàn giao nào — sang MAY · Sản lượng may hàng ngày để phát hành phiếu.',
      fiTab1:'Hàng may', fiTab2:'Phụ liệu hoàn thiện',
      ftPanel:'Phụ Liệu Hoàn Thiện Nhận Vào', ftSub:'Một dòng cho mỗi mã hàng · PO — SL đơn hàng lấy từ Kế hoạch sản xuất, SL thực nhận nhập tay khi phụ liệu về kho',
      ftK1:'SL ĐƠN HÀNG', ftK1s:'pcs phụ liệu theo đơn', ftK2:'THỰC NHẬN', ftK2s:'pcs phụ liệu đã nhận',
      ftK3:'CÒN THIẾU', ftK3s:'pcs chưa nhận đủ', ftK4:'ĐỦ HÀNG', ftK4s:'dòng đã nhận đủ SL đơn',
      ftBrand:'THƯƠNG HIỆU', ftStyle:'MÃ HÀNG', ftPo:'PO#', ftQtyO:'SL ĐƠN HÀNG', ftQtyA:'SL THỰC NHẬN',
      ftCount:'dòng phụ liệu', ftSearch:'Tìm thương hiệu, mã hàng, PO…', ftNoHit:'Không có dòng nào khớp từ khóa',
      ftEmpty:'Chưa có dòng phụ liệu nào — bấm Gieo lại từ kế hoạch để lấy đơn hàng về.',
      ftReseed:'Gieo lại từ kế hoạch',
      ftReseedAsk:'Gieo lại bảng phụ liệu từ Kế hoạch sản xuất? Mọi SL thực nhận đã nhập sẽ mất.',
      ftShortTip:'Còn thiếu so với SL đơn hàng', ftOverTip:'Nhận vượt SL đơn hàng',
      ftPickTip:'Bấm để chọn phụ liệu đã về kho từ danh mục phụ liệu',
      ftPickLn:'dòng', ftPickFoot:'Đã chọn',
      ftPickT:'Chọn Phụ Liệu Nhận Vào',
      ftPickRowTip:'Bấm để tích / bỏ tích dòng phụ liệu này',
      ftPickSel:'ĐÃ CHỌN', ftPickSelS:'dòng trong danh mục phụ liệu',
      ftPickQty:'TỔNG SL NHẬN', ftPickQtyS:'sẽ vào ô SL THỰC NHẬN',
      ftPickOrd:'SL ĐƠN HÀNG', ftPickOrdS:'lấy từ Kế hoạch sản xuất',
      ftPickDif:'CHÊNH LỆCH', ftPickDifS:'so với SL đơn hàng',
      ftPickAll:'TẤT CẢ', ftPickPick:'Tích hết', ftPickNone:'Bỏ tích hết',
      ftPickMix:'Đang gộp nhiều đơn vị:',
      ftPickSearch:'Tìm item#, mô tả, khổ, màu, NCC…',
      ftPickNoHit:'Không có phụ liệu nào khớp từ khóa',
      ftPickEmpty:'Chưa nạp được danh mục phụ liệu — kiểm tra data/mlist.js.',
      ftPickOk:'Xác nhận', ftPickSrc:'Nguồn:',
      mlKind:'LOẠI', mlItem:'ITEM#', mlDesc:'MÔ TẢ PHỤ LIỆU', mlSize:'KHỔ / SIZE',
      mlColor:'MÀU PHỤ LIỆU', mlUnit:'ĐVỊ', mlNeed:'SL CẦN', mlShipQ:'ĐÃ GỬI',
      mlArr:'NGÀY VỀ KHO', mlSup:'NCC', mlRecv:'SL NHẬN', mlBal:'CHÊNH LỆCH',
      fsBc:'Tình trạng hoàn thiện', fsTitle:'Tình Trạng Hoàn Thiện',
      fsPanel:'Tình Trạng Đóng Gói · Xuất Hàng', fsSub:'Hàng đã nhận vào hoàn thiện — đã đóng gói, chưa đóng gói, đã xuất và tồn kho. SL đơn · Đã xuất · Tồn kho lọc theo đúng mã hàng · PO · màu bên Kế hoạch xuất hàng',
      fsK1:'ĐÃ NHẬN', fsK1s:'pcs hoàn thiện đã nhận', fsK2:'CHƯA ĐÓNG GÓI', fsK2s:'pcs đã nhận nhưng chưa đóng gói',
      fsK3:'ĐÃ ĐÓNG GÓI', fsK3s:'pcs qua công đoạn đóng gói', fsK4:'TỒN KHO', fsK4s:'pcs đã đóng gói chưa xuất',
      fsCLine:'CHUYỀN', fsCBrand:'KHÁCH HÀNG', fsCStyle:'MÃ HÀNG', fsCPo:'PO#', fsCColor:'MÀU',
      fsCOrder:'SL ĐƠN', fsCPacked:'ĐÃ ĐÓNG GÓI', fsCUnpack:'CHƯA ĐÓNG GÓI',
      fsCPackY:'HÔM QUA', fsCPackT:'HÔM NAY', fsCPackC:'TỔNG LŨY KẾ',
      fsCOrderC:'SL THÙNG ĐƠN HÀNG', fsCPackedC:'THÙNG ĐÃ ĐÓNG', fsCUnpackC:'THÙNG CHƯA ĐÓNG',
      fsCShip:'ĐÃ XUẤT', fsCStock:'TỒN KHO', fsCRemark:'GHI CHÚ',
      fsPoTip:'Lấy ở dòng Kế hoạch xuất hàng khớp cả mã hàng · PO · màu — mấy màu dùng chung một dòng thì chỉ hiện ở dòng đầu',
      fsNoFgTip:'Chưa có dòng Kế hoạch xuất hàng nào khớp mã hàng · PO · màu này — sang Kế hoạch xuất hàng thêm dòng, hoặc bấm Nạp lại từ KHSX',
      fsPackAuto:'Tự sinh từ số thùng đã đóng —', fsPcsCtn:'cái/thùng (tỷ lệ tạm)',
      fsPackYTip:'Tự sinh từ số thùng đóng hôm qua — ngày đã chốt',
      fsPackCTip:'Tự sinh từ tổng số thùng đã đóng',
      fsPackOverTip:'Vượt số đã nhận về hoàn thiện — tỷ lệ cái/thùng đang sai, hoặc số thùng ghi nhầm',
      fsCtnOrdTip:'Số thùng theo đơn hàng của mã hàng · PO · màu này — nhập tay, không suy ra được từ dữ liệu nào khác',
      fsCtnTip:'Số thùng đóng hôm nay — sửa được',
      fsCtnCap:'còn',
      fsCtnYTip:'Số thùng đóng hôm qua — ngày đã chốt, không sửa ở đây',
      fsCtnCTip:'Cộng số thùng của mọi ngày đã ghi',
      fsCtnUTip:'SL thùng đơn hàng trừ số thùng đã đóng — chưa nhập SL thùng đơn hàng thì để trống',
      fsCtnOverTip:'Đã đóng vượt SL thùng đơn hàng — sửa lại SL thùng đơn hàng hoặc số thùng của từng ngày',
      fsCAct:'HÀNH ĐỘNG', fsScanBtn:'Quét mã',
      fsScanTip:'Quét mã vạch từng thùng — đối chiếu với danh sách barcode đã nhập ở Kế hoạch xuất hàng',
      fsScanNoBc:'Lô xuất của dòng này chưa có danh sách barcode — sang Kế hoạch xuất hàng nhập packing list rồi nhập barcode',
      fsScanTitle:'QUÉT MÃ VẠCH ĐÓNG THÙNG', fsScanPh:'Quét hoặc gõ mã vạch rồi Enter…',
      fsScanDone:'thùng đã quét', fsScanOk:'Đã ghi', fsScanDup:'Mã này đã quét lúc',
      fsScanBad:'Mã không có trong danh sách barcode của lô xuất này',
      fsScanLogL:'Đã quét ở dòng này', fsScanNone:'Chưa quét mã nào',
      fsScanUndo:'Bỏ lần quét này', fsScanHint:'Máy quét gõ xong tự Enter — cứ quét liên tục, ô nhập tự xóa sau mỗi mã',
      fsCtnScanT:'thùng từ quét mã', fsCtnManT:'thùng gõ tay',
      fsRemarkPh:'Ghi chú…',
      fsIn:'ĐÃ NHẬN', fsIron:'ỦI', fsQc:'KIỂM CUỐI', fsPack:'ĐÓNG GÓI', fsFg:'NHẬP KHO TP',
      fsWip:'ĐANG LÀM', fsPct:'TIẾN ĐỘ', fsAll:'Đẩy hết', fsClr:'Xóa số', fsCount:'nhóm hàng',
      fsCapTip:'Tối đa theo công đoạn trước:',
      fsSearch:'Tìm mã hàng, PO, màu, chuyền…', fsNoHit:'Không có dòng nào khớp từ khóa',
      fsEmpty:'Chưa nhận hàng nào — sang Nhận hàng hoàn thiện để xác nhận phiếu bàn giao.',
      fgBc:'Kế hoạch xuất hàng', fgTitle:'Kế Hoạch Xuất Hàng Thành Phẩm',
      fgPanel:'Lô Xuất Theo Mã Hàng · PO', fgSub:'1 dòng cho mỗi mã hàng · PO — cột MÀU gom mọi màu của lô, lấy ở BẢNG TỔNG THEO MÀU của tác nghiệp cắt; SL đã xuất, ngày đóng hàng, phương thức, điểm đến và CBM nhập tay',
      fgK1:'TỔNG ĐƠN', fgK1s:'pcs theo kế hoạch xuất', fgK2:'SẴN SÀNG', fgK2s:'pcs thành phẩm đã nhập kho',
      fgK3:'ĐÃ XUẤT', fgK3s:'pcs đã lên container', fgK4:'TRỄ ETD', fgK4s:'lô đã quá ngày xuất dự kiến',
      fgNo:'STT', fgBrand:'THƯƠNG HIỆU', fgSeason:'MÙA', fgFactory:'NHÀ MÁY', fgStyle:'MÃ HÀNG',
      fgPo:'PO#', fgColor:'MÀU', fgQty:'SL ĐƠN HÀNG', fgShipped:'SL ĐÃ XUẤT', fgBal:'SL CÂN ĐỐI',
      fgLoad:'NGÀY ĐÓNG HÀNG', fgEtd:'ETD', fgMode:'PHƯƠNG THỨC', fgDest:'ĐIỂM ĐẾN', fgCbm:'CBM', fgNote:'GHI CHÚ',
      fgAdd:'Thêm lô xuất', fgCount:'lô xuất', fgReseed:'Nạp lại từ KHSX',
      fgReseedAsk:'Nạp lại toàn bộ lô xuất từ Kế hoạch sản xuất? Mọi chỉnh sửa tay ở bảng này sẽ mất.',
      fgPkImp:'Packing list', fgPkTip:'Nhập packing list (.xlsx/.xls/.csv) của lô này — lấy tổng số thùng, đổ sang cột SL THÙNG ĐƠN HÀNG ở Tình trạng hoàn thiện',
      fgPkHas:'Đã có packing list — bấm để nhập file khác', fgPkClr:'Bỏ packing list (bỏ luôn barcode của lô này)',
      fgPkOk:'Đã nhập packing list —', fgPkCtn:'thùng',
      fgPkNone:'Không tìm thấy số thùng trong file. Cần có cột SỐ THÙNG / CARTON NO, hoặc cột SL THÙNG, hoặc ô TỔNG SỐ THÙNG.',
      fgBcImp:'Barcode', fgBcTip:'Nhập file barcode đóng thùng (.xlsx/.xls/.csv) — danh sách mã lưu lại cho bảng Tình trạng hoàn thiện',
      fgBcHas:'Đã có barcode — bấm để nhập file khác', fgBcClr:'Bỏ danh sách barcode của lô này',
      fgBcNeed:'Phải nhập packing list trước rồi mới nhập được barcode',
      fgBcOk:'Đã nhập barcode —', fgBcN:'mã', fgBcCut:'mã (đã cắt bớt phần vượt)',
      fgBcNone:'Không tìm thấy mã barcode nào trong file. Cần có cột BARCODE / MÃ VẠCH / UPC / EAN.',
      fsCtnOrdPk:'Lấy từ packing list', fsCtnBcTip:'Số barcode đã nhập cho lô xuất này',
      fgSearch:'Tìm thương hiệu, mã hàng, PO, màu, điểm đến, ETD…', fgNoHit:'Không có lô nào khớp từ khóa',
      fgEmpty:'Chưa có lô xuất nào — bấm Nạp lại từ KHSX hoặc Thêm lô xuất.',
      snapTitle:'DỮ LIỆU LOCAL', snapExport:'Xuất ảnh chụp', snapImport:'Nhập ảnh chụp',
      snapExportTip:'Tải về state-seed.js gồm TOÀN BỘ localStorage + file trong IndexedDB. Chép vào app/data/ rồi gửi cả thư mục đi.',
      snapImportTip:'Chọn 1 file state-seed.js (hoặc .json) để nạp đè dữ liệu hiện tại',
      snapReset:'Về ảnh chụp gốc', snapResetTip:'Nạp lại đúng dữ liệu trong app/data/state-seed.js',
      snapWipe:'Xóa sạch', snapWipeTip:'Xóa dữ liệu đã lưu và không nạp lại ảnh chụp nữa',
      snapWork:'Đang gói dữ liệu…', snapOk:'Đã tải state-seed.js — chép vào app/data/',
      snapErr:'Không gói được dữ liệu', snapBad:'File không phải ảnh chụp hợp lệ',
      snapAsk:'Nạp ảnh chụp này sẽ GHI ĐÈ toàn bộ dữ liệu đang có trên máy. Tiếp tục?',
      snapNow:'Đang lưu:', snapSeed:'Ảnh chụp gốc:', snapNone:'Chưa có ảnh chụp gốc',
      tipReceive:'Lưu ô này và đánh dấu đã nhận BTP', tipUnreceive:'Đã nhận — bấm để trả về Chờ nhận' },
    en:{ bcRoot:'Planning', bcPage:'Sewing Schedule', upload:'Upload cutting order', mes:'Manufacturing Execution System',
      pageTitle:'Sewing / Assemble Schedule', help:'Help',
      dsoBc:'Daily Sewing Output', dsoTitle:'Daily Sewing Output', dsoSoon:'Table to be designed next — spec pending.',
      dsoOvw:'Summary by day · line', dsoOvwSub:'Completed output and how much was handed over to finishing',
      dsoOvwDone:'COMPLETED', dsoOvwHanded:'HANDED OVER', dsoOvwLeft:'NOT HANDED',
      dsoLines:'Sewing lines', dsoLinesSub:'Tap a line to count output by size',
      dsoHist:'Daily completion history', dsoHistSub:'Completed pieces aggregated per day', dsoHistEmpty:'No output recorded yet — tap a size card above to count.',
      dsoColDay:'DATE', dsoColPo:'PO', dsoColColor:'COLOUR', dsoColQty:'COMPLETED QTY',
      dsoAskOk:'Confirm hand-over',
      bgTitle:'HANDOVER SLIP — Sewing → Finishing', bgStyle:'Style', bgPo:'PO',
      bgColor:'Colour', bgLine:'Line', bgFrom:'Handed by', bgTo:'Received by', bgName:'Enter name…',
      bgProdDay:'Production date', bgStatus:'Status', bgPending:'Awaiting confirmation',
      bgSize:'Size', bgQty:'Qty handed', bgTotal:'Total received', bgCum:'Cumulative incl. this slip',
      bgCumTip:'Total handed to finishing for this style · PO · colour, up to and including this slip',
      bqTitle:'SEMI-FINISHED GOODS HANDOVER SLIP',
      bqDay:'Delivery date:', bqCust:'Customer:', bqLine:'To sewing line:', bqStyle:'Style:',
      bqC1:'Colour', bqC2:'Table', bqC3:'Size', bqC4:'Quantity', bqC5:'PO #',
      bqNote:'Note:', bqSign1:'Handed by', bqSign2:'Received by',
      bqOk:'Confirm received', bqOpenTip:'Click to open the semi-finished goods handover slip',
      bgSignFrom:'Handed by (Sewing)', bgSignTo:'Received by (Finishing)',
      bgPrint:'Print / Save PDF', bgView:'View / print handover slip',
      dsoHandOver:'Hand over to finishing', dsoHanded:'Handed over', dsoUndoHand:'Void the latest handover slip of this row',
      dsoReq:'REQUIRED', dsoHistSearch:'Search date, style, PO, colour, size…',
      dsoFailOvw:'Defect summary by line',
      dsoFailOvwSub:'Defect count and most frequent defect per line — tap a row to open the line',
      dsoFailRate:'DEFECT RATE', dsoTopDef:'TOP DEFECT',
      dsoFailOvwEmpty:'No output or defect recorded on any line yet.',
      dsoHandAllSub:'Aggregated by size — enter the qty to hand over for each size',
      bkDays:'Dates', bkPend:'PENDING BY SIZE',
      bkGive:'QTY TO HAND OVER', bkLeft:'PENDING', bkTot:'TOTAL',
      bkAll:'All', bkNone:'Clear', bkSel:'to hand over', bkNext:'Next',
      bgBack:'Back', bgReq:'Required',
      bgNeedWho:'Enter both names before confirming',
      dsoNoUnhanded:'Nothing left to hand over — everything has gone to finishing.',
      dsoDefHist:'Daily defecting history', dsoDefHistSub:'Every FAIL tap is recorded with its time and reason',
      dsoDefHistEmpty:'No defect recorded yet — tap FAIL on a size card to log one.',
      dsoDefExpTip:'Exports a .xlsx with exactly the rows shown', dsoDefAllLines:'ALL LINES',
      dsoColSize:'SIZE', dsoColReason:'REASON', dsoColDefQty:'DEFECT QTY', dsoColTime:'TIME',
      mlvIncTip:'Income per person at this line\u2019s work hours',
      mlvSwitch:'Switch line', mlvTeam:'TEAM', mlvPerHour:'OUTPUT / HOUR', mlvQual:'QUALITY',
      mlvFull:'Full screen', mlvExitFull:'Exit full screen',
      mlvHourTip:'PASS taps recorded in this hour',
      mlvRate:'Defect rate', mlvTop3:'Top 3 defects', mlvPick:'Pick a line to open its M-level board', mlvOpen:'Open this line\u2019s M-level board',
      dsoOpenLine:'Open size detail', dsoBack:'← All lines', dsoDoneNeed:'DONE / REQUIRED',
      dsoTapAdd:'Tap to record inspection (PASS / FAIL)', dsoTapSub:'Subtract 1 (mis-tap)', dsoNoCut:'No cutting plan for this line yet',
      dsoTapTitle:'Record Inspection', dsoTapTip:'Tap PASS to add 1 finished piece, or FAIL to pick a reason',
      dsoPass:'PASS', dsoPassSub:'+1 piece done', dsoFail:'FAIL', dsoFailSub:'Pick a defect reason',
      dsoPick:'Select Defect Reason', dsoPickSub:'Tap a row to log the failed piece for this size', dsoPickBack:'← Back',
      dsoDefEmpty:'Defect library is empty — add rows in Settings · Defect Library.',
      dsoDefLogged:'defects logged', dsoClose:'Close',
      dfPanel:'Defect Library', dfSub:'Defect master used when logging failed pieces on the sewing line',
      dfCode:'Defect Code', dfName:'Defect Name', dfCat:'Category', dfSev:'Severity', dfLoc:'Defect Location', dfCause:'Root Cause',
      dfAdd:'Add defect', dfEmpty:'No defect yet — add one or import from Excel.',
      dfSearch:'Search code, name, category, location…', dfNoHit:'No row matches the search',
      dfImportTip:'Import .xlsx/.xls/.csv — columns: Defect Code · Defect Name · Category · Severity · Defect Location · Root Cause',
      dfCount:'defects in library',
      lsCol1:'LINE', lsCol2:'STYLE', lsCol3:'WORKERS', lsCol4:'WORK HOURS', lsCol5:'DATE (DD/MM/YYYY)', lsCol6:'SMV', lsCol7:'TYPE', lsCol8:'%TARGET', lsCol9:'M-LEVEL FILE IMPORTED', lsCol10:'ACTIONS',
      lsEdit:'Edit', lsDone:'Done', lsImport:'Import file', lsImportTip:'Pick an M-level file (.xlsx/.csv) — stored in IndexedDB', lsFileDel:'Remove file', lsFileErr:'Could not store the file in IndexedDB', lsPctTip:'Whole number 0–100, no negatives, no decimals', lsDec1Tip:'No negatives, at most 1 decimal place', lsTypeTip:'Derived from SMV — not editable: SMV > 100 → type 1, 60 < SMV ≤ 100 → type 2, SMV ≤ 60 → type 3',
      dsotab1:'Settings', dsotab2:'Production', dsotab3:'Alerts', dsotab4:'M-level', dsosub1:'Line Setting', dsosub2:'M-level Type Setting', dsosub3:'Defect Library',
      dsoLinePanel:'Line Setting', dsoLineSub:'Sewing line master — line group, target, shift',
      mtPanel:'M-level Type', mtSub:'Type master — click a row to see its detail',
      mtdPanel:'M-level Type Detail', mtdSub:'Target and income per step',
      mtName:'Name', mtDesc:'Description', mtAct:'Action', mtNo:'No', mtTgt:'%Target',
      mtTgtTip:'Whole number, no negatives — high M levels may exceed 100%',
      mtInc:'Income / person (9.5h)(VND)',
      mtAdd:'Add', mtDel:'Delete', mtImport:'Import', mtImportTip:'Import .xlsx/.xls/.csv — appended to the detail list',
      mtImportOk:'Imported', mtImportRows:'rows', mtImportNone:'No row with a usable name was found.',
      mtImportErr:'Could not read the file.', mtNoXlsx:'Excel library still loading — try again in a moment.',
      mtEmpty:'No M-level type yet', mtdEmpty:'This type has no detail rows yet',
      mtPickType:'Pick an M-level type on the left',
      alEdit:'Edit', alDone:'Done', alAdd:'Add alert', alDel:'Delete alert', alName:'Alert name',
      alPick:'Pick sound', alPlay:'Preview', alClrSnd:'Remove sound', alHasSnd:'Sound set', alNoSnd:'No sound yet',
      alEmpty:'No alerts yet — press Edit to add', alSndBig:'Sound file too large (20 MB max).', alSndErr:'Could not save the sound file.',
      dsoProdPanel:'Daily Sewing Output', dsoProdSub:'Actual output by line — entry / hourly', dsoAlertPanel:'Output Alerts', dsoAlertSub:'Tap to sound an alert — audio stored on this machine', dsoMlvPanel:'M-level Tracking', dsoMlvSub:'Output by M-level type',
      kcTb:'CUT TURN', kcLy:'LAYERS',  kcPcs:'TOTAL PCS', kcTagN:'TAGS', kcAux:'AUX MATERIALS — LINING · MEX · QUILT · FUSIBLE', kcAuxN:'AUX CUTS',
      kcGb:'GB — combined table (plied with another fabric)', kcModal:'QR TAGS — TURN', kcPrint:'PRINT TAGS', kcClose:'CLOSE', kcLop:'LAYERS', kcTem:'TAGS',
      kcSrcL:'SOURCE', kcSrcGen:'SEEDED', kcSrcFile:'UPLOADED',
      kcBuyer:'BUYER', kcStyleL:'STYLE', kcTotal:'TOTAL QTY', kcTables:'CUT TURNS', kcTags:'QR TAGS', kcGbS:'COMBINED',
       lgPull:'Pulled from Bundle Demand / Sewing Schedule',
        dpMcOpt:'Mach.', dpTbOpt:'Table',
       cpTurnU:'turns',
      psBc:'Production Plan', psTitle:'Production Plan',
      psK1:'ORDERS',  psK2:'TOTAL OUTPUT',
      psK3:'ACTIVE LINES',  psK4:'PLAN WINDOW',
      psLine:'LINE', psIn:'IN-HOUSE', psSub:'SUBCONTRACT', psOrdU:'orders', psToday:'TODAY', psGoToday:'Jump to today',
      psZa:'Compact', psZb:'Medium', psZc:'Wide',
      psLanes:'lanes',
      planFromPs:'Lines & styles sync from the Production Plan. Need an extra row for a line (overlapping / duplicated orders)? Use the + on the line cell.',
      kcPiece:'CUT PIECE',
       psUpload:'Upload cutting plan for this order', psClose:'Close',
      psMaster:'MASTER ORDER', psOrderL:'ORDER', psRatioL:'STYLE CUTTING RATIO', psMatL:'MATERIAL LIST', psStartL:'START', psEndL:'END', psDateHint:'Editable — the Gantt bar follows',
      psDelOrd:'Delete order', psRestore:'Deleted — click to restore', psTrash:'Trash', psUndoTip:'Delete order — undo with Ctrl+Z or the trash', psUndo:'Restore',
      psUpPlan:'Upload production plan', psAddLine:'Line', psAddLineTip:'Add a line to the production plan', psDelLineTip:'Remove this empty line', psAddTip:'Add an order / cutting plan for this line', psAddTitle:'Add cutting plan',
      psFStyle:'STYLE', psFBrand:'BRAND', psFPo:'PO', psFQty:'QUANTITY (pcs)', psFStart:'START DATE', psFEnd:'END DATE', psFFile:'CUTTING PLAN FILE (.xlsx)',
      psPick:'Choose file…', psSave:'Save order', psCancel:'Cancel', psQty:'QUANTITY', psCutD:'CUT DATE', psEx:'EX DATE',
      psModeFile:'Pick a file', psModeMan:'Type it in',
      psManSz:'PICK SIZES', psManAdd:'+ Add turn', psManDel:'Remove turn', psManTitle:'CUTTING PLAN — ENTERED BY HAND', psManTot:'TOTAL',
      psManCp:'COLOUR / PO', psManAddCp:'+ colour', psManDelCp:'Remove colour', psManColorPh:'colour code', psManPoPh:'PO',
      psManCpHint:'Every cut turn needs a colour code — a turn may combine up to 2 colour codes, each with its own PO.',
      cfTitle:'Production plan conflicts', cfSub:'orders already in the plan — pick which one to keep',
      cfCur:'IN USE', cfNew:'FROM FILE', cfKeepAll:'Keep all current', cfTakeAll:'Take all from file', cfApply:'Apply',
      cfFrom:'Updated from the uploaded plan',
      resetSaved:'Reset', resetTip:'Clear data saved on this machine and reload', resetAsk:'Clear all saved changes and reload the page?',
      kcSumCut:'Σ PLANNED', kcNeedRow:'DEMAND',
      psRaw:'SOURCE ROW IN FILE',  psCombine:'COMB',
      psSum:'SUMMARY BY COLOUR', psSumC:'COLOUR / FABRIC',   psSumQ:'QUANTITY', psSumT:'CUT TURNS', psSumTot:'TOTAL',
      psNoPlan:'No cutting plan for this order yet — upload the KH cắt (.xlsx) file to load cut tables & QR tags.',
      dashBc:'Production Dashboard', dashTitle:'Production Dashboard',
      dashK1:'SEWING PLAN', dashK1s:'pcs planned this week', dashK2:'CUTTING NEEDED', dashK2s:'pcs to cut this week',
      dashK3:'CUT TURNS', dashK3s:'scheduled / ordered', dashK4:'SEWING DONE', dashK4s:'% of weekly plan',
      dashSew:'SEWING PROGRESS BY LINE', dashCut:'CUTTING PROGRESS BY LINE — SCHEDULED / ORDERED', dashTb:'CUTTING TABLE LOAD',
      kpiPlan:'SEWING PLAN', kpiPlanSub:'pcs planned this week', kpiDemand:'BUNDLE DEMAND', kpiDemandSub:'pcs to supply next week', kpiReq:'BUNDLE REQUEST', kpiReqSub:'pcs bundles requested',
      tab1:'Weekly Sewing Schedule', tab2:'Weekly Bundle Demand', tab3:'Weekly Bundle Request', period:'PERIOD',
      copyWeek:'Copy Last Week', downloadTpl:'Download Template', exportXls:'Export Excel', exportTip:'Exports one .xlsx with 3 sheets',
      activeRows:'Active Rows', rowsN:'Rows', linesN:'Lines', totalQty:'Total Qty',
      planEmpty:'No rows yet for this week. Copy last week or add a line below.', addLine:'Add Line',
      colLine:'LINE #', colBrand:'BRAND', colStyle:'STYLE #', colTotal:'TOTAL',
      addBrand:'+ Brand', addStyle:'+ Style',
      tipLine:'Click to rename / delete line', tipPlanCol:'From the Production Plan — edit it on the Production Plan screen', tipBrand:'Pick a brand', tipStyle:'Pick a style', tipDay:'Click to enter a number', tipDelLine:'Delete line',
      maxLines:'This line is not in the Production Plan', dayConflict:'Another style runs this day — entering a number here clears that one (1 line, 1 style per day)',
      tipRepick:'Re-pick — this row\u2019s day numbers will be cleared',
      addStyleRow:'Add a 2nd style for this line this week — no need to re-create the line',
      lineMergeErr:'Only two adjacent lines can be merged — e.g. Line 1+2. Not gapped lines (Line 1+3) or 3+ lines.',
      lineDupErr:'Cannot merge: that line still has its own row(s) — delete or rename them first.',
      phLine:'Line…', phBrand:'Brand…', phStyle:'Style…', phStyleFirst:'Pick a brand first',
      confirmDel:'This line has data — delete all of its rows?',
      demandTitle:'Weekly Cutting Bundle Demand', demandSub:'Nhu Cầu Sản Lượng Cắt Hàng Tuần', factory:'FACTORY',
      grpWip:'WIP STATUS', grpNext:'NEXT WEEK DEMAND',
      dA:'TOTAL ORDER CUT', dB:'TOTAL WIP SUPPLIED', dC:'OUTPUT TO LINE', dBC:'WIP LEFT AT WEEK END', dD:'1 DAY WIP', dE:'WIP BUFFER NEEDED', dF:'NEXT WEEK OUTPUT', dNeed:'QTY TO SUPPLY', remark:'REMARK',
      tipA:'Total cut of the order — from the cutting order (brand + style match), not editable here', tipB:'Total WIP already supplied — manual', tipC:'Total output to the line — manual', tipD:'One day of WIP output — manual',
      tipManual:'Manual entry — click to edit', tipBC:'B − C', tipE:'E = MAX(0, D − B + C). If WIP left exceeds one day, no buffer is needed.',
      tipF:'SUMIFS over this week\'s Sewing Schedule — matching line + brand + style', tipFEst:'No matching line + brand + style in the Sewing Schedule', tipNeed:'IF(E+F > A−B, A−B, E+F)',
      demandEmpty:'No line planned for this week in the Sewing Schedule.',
      reqSub:'Weekly cut bundle issue order',
      colColor:'CUT COLOUR', recvTitle:'Bundle receiving history', recvSub:'Every Received click is logged', recvEmpty:'No receipts yet', recvDT:'DATE / TIME', recvTurn:'CUT TURN', recvRows:'entries', recvUndo:'Un-received', colReqPlan:'REQUESTED / DEMAND', tipReqPlan:'Quantity already requested / demand on the plan', tipAutoCol:'Automatic from the cutting plan — not editable here', pickColor:'Pick a colour…', pickColorFirst:'pick a colour first', issue:'Issue', planShort:'PLN ', tipIssue:'Issue bundles for this cell', tipIssueEdit:'Edit this issue',
      mTitle:'Issue bundles by cut turn', mColor:'CUT COLOUR', mPlan:'PLAN (pcs)',
       cCutTurn:'Cut turn:', mIssueRow:'ISSUING', mPickPos:'Click to pick / drop this size',   mBySize:'TOTAL BY SIZE', mNeeded:'To supply', mCuttable2:'Cuttable',
      mClear:'Clear cell', mCancel:'Cancel', mSave:'Save issue', mUpdate:'Update', mIssue:'Issue', mNoTurnSel:'No cut turn selected', mTurns:'turns', mSizes:'sizes',  plies:'plies', left:'left ',
      stRequested:'Requested', stWaiting:'Waiting', stReceived:'Received', stCycleTip:'Click to change status: Requested → Waiting → Received', mReceived:'Received',
      mTurnPool:'One cut-turn table shared by this style + cut colour — each turn can be issued once per week',
      mTakenTip:'Already issued in another cell — release it there first to reuse',
      fiBc:'Finishing In', fiTitle:'Finishing In — Receiving',
      fiPanel:'Handover Slips From Sewing', fiSub:'Every handover slip issued in Daily Sewing Output lands here for finishing to confirm receipt',
      fiK1:'AWAITING', fiK1s:'slips not confirmed yet', fiK2:'QTY AWAITING', fiK2s:'pcs on the way to finishing',
      fiK3:'RECEIVED TODAY', fiK3s:'pcs received today', fiK4:'TOTAL RECEIVED', fiK4s:'pcs taken into finishing',
      fiNo:'SLIP NO.', fiWhen:'ISSUED AT', fiLine:'LINE', fiStyle:'STYLE #', fiPo:'PO', fiColor:'COLOUR',
      fiSizes:'SIZES', fiQty:'QTY (PCS)', fiSt:'STATUS', fiBy:'RECEIVED BY', fiAct:'ACTIONS',
      fiWait:'Awaiting', fiDone:'Received', fiRecv:'Receive', fiUnrecv:'Un-receive', fiView:'View slip',
      fiRecvAll:'Receive all', fiByTip:'Taken from the "Received by (Finishing)" field on the handover slip', fiCount:'handover slips',
      fiSearch:'Search slip no., line, style, PO, colour…', fiNoHit:'No slip matches the search',
      fiEmpty:'No handover slip yet — go to SEWING · Daily Sewing Output to issue one.',
      fiTab1:'Garment', fiTab2:'Finishing trims',
      ftPanel:'Finishing Trims Received', ftSub:'One row per style · PO — order quantity comes from the Production Plan, actual quantity is keyed in as the trims arrive',
      ftK1:'ORDER QTY', ftK1s:'pcs of trims on order', ftK2:'ACTUAL QTY', ftK2s:'pcs of trims received',
      ftK3:'SHORT', ftK3s:'pcs still outstanding', ftK4:'COMPLETE', ftK4s:'rows received in full',
      ftBrand:'BRAND', ftStyle:'STYLE', ftPo:'PO#', ftQtyO:'ORDER QTY', ftQtyA:'ACTUAL QTY',
      ftCount:'trim rows', ftSearch:'Search brand, style, PO…', ftNoHit:'No row matches the search',
      ftEmpty:'No trim row yet — hit Reseed from plan to pull the orders in.',
      ftReseed:'Reseed from plan',
      ftReseedAsk:'Reseed the trims table from the Production Plan? Every actual quantity keyed in will be lost.',
      ftShortTip:'Short against the order quantity', ftOverTip:'Received over the order quantity',
      ftPickTip:'Click to pick the trims that have arrived from the materials list',
      ftPickLn:'rows', ftPickFoot:'Selected',
      ftPickT:'Pick Trims Received',
      ftPickRowTip:'Click to tick / untick this material row',
      ftPickSel:'SELECTED', ftPickSelS:'rows on the materials list',
      ftPickQty:'TOTAL RECEIVED', ftPickQtyS:'goes into the ACTUAL QTY cell',
      ftPickOrd:'ORDER QTY', ftPickOrdS:'from the Production Plan',
      ftPickDif:'DIFFERENCE', ftPickDifS:'against the order quantity',
      ftPickAll:'ALL', ftPickPick:'Tick all', ftPickNone:'Untick all',
      ftPickMix:'Mixing units:',
      ftPickSearch:'Search item#, description, width, colour, supplier…',
      ftPickNoHit:'No material matches the search',
      ftPickEmpty:'Materials list not loaded — check data/mlist.js.',
      ftPickOk:'Confirm', ftPickSrc:'Source:',
      mlKind:'TYPE', mlItem:'ITEM#', mlDesc:'ITEM DESCRIPTION', mlSize:'WIDTH / SIZE',
      mlColor:'MATERIALS COLOR', mlUnit:'UNIT', mlNeed:'TOTAL NEED', mlShipQ:'SHIPPED',
      mlArr:'ARRIVED W/H', mlSup:'SUPPLIER', mlRecv:'RECEIVED QTY', mlBal:'BALANCE',
      fsBc:'Finishing Status', fsTitle:'Finishing Status',
      fsPanel:'Packing · Shipment Status', fsSub:'Goods received into finishing — packed, un-packed, shipped and in stock. Order / Shipped / Stock are filtered on the matching style · PO · colour in the F.G Shipment Plan',
      fsK1:'RECEIVED', fsK1s:'pcs received into finishing', fsK2:'UN-PACKED', fsK2s:'pcs received but not packed',
      fsK3:'PACKED', fsK3s:'pcs through the packing stage', fsK4:'STOCK', fsK4s:'pcs packed but not shipped',
      fsCLine:'Line', fsCBrand:'Brand', fsCStyle:'Style', fsCPo:'PO#', fsCColor:'Color',
      fsCOrder:'Order Qty', fsCPacked:'Packed Qty', fsCUnpack:'Un-Packed Qty',
      fsCPackY:'Yesterday', fsCPackT:'Today', fsCPackC:'Cumulative',
      fsCOrderC:'Ordered Carton Qty', fsCPackedC:'Packed Carton Qty', fsCUnpackC:'Un-Packed Carton Qty',
      fsCShip:'Shipped Qty', fsCStock:'Stock Qty', fsCRemark:'Remark',
      fsPoTip:'From the F.G Shipment row matching style · PO · colour — when several colours share one row the figure shows on the first of them',
      fsNoFgTip:'No F.G Shipment row matches this style · PO · colour — add one there, or hit Reseed from plan',
      fsPackAuto:'Auto from packed cartons —', fsPcsCtn:'pcs per carton (placeholder ratio)',
      fsPackYTip:'Auto from the cartons packed yesterday — that day is closed',
      fsPackCTip:'Auto from every packed carton',
      fsPackOverTip:'More than was received into finishing — the pcs-per-carton ratio is off, or a carton count is wrong',
      fsCtnOrdTip:'Cartons ordered for this style · PO · colour — keyed in, nothing in the app derives it',
      fsCtnTip:'Cartons packed today — editable',
      fsCtnCap:'remaining',
      fsCtnYTip:'Cartons packed on the previous calendar day — that day is closed, not editable here',
      fsCtnCTip:'Every logged day of cartons added up',
      fsCtnUTip:'Ordered cartons minus packed cartons — blank until an ordered carton qty is keyed in',
      fsCtnOverTip:'Packed beyond the ordered carton qty — fix the ordered qty or a daily carton count',
      fsCAct:'ACTIONS', fsScanBtn:'Scan',
      fsScanTip:'Scan each carton barcode — checked against the barcode list imported in the F.G Shipment Plan',
      fsScanNoBc:'This row’s shipment has no barcode list yet — import a packing list then the barcodes in the F.G Shipment Plan',
      fsScanTitle:'CARTON BARCODE SCAN', fsScanPh:'Scan or type a barcode, then Enter…',
      fsScanDone:'cartons scanned', fsScanOk:'Recorded', fsScanDup:'Already scanned at',
      fsScanBad:'That code is not in this shipment’s barcode list',
      fsScanLogL:'Scanned on this row', fsScanNone:'Nothing scanned yet',
      fsScanUndo:'Undo this scan', fsScanHint:'A wedge scanner sends Enter itself — keep scanning, the box clears after each code',
      fsCtnScanT:'cartons from scans', fsCtnManT:'cartons keyed in',
      fsRemarkPh:'Remark…',
      fsIn:'RECEIVED', fsIron:'IRON', fsQc:'FINAL QC', fsPack:'PACK', fsFg:'FG WAREHOUSE',
      fsWip:'IN PROGRESS', fsPct:'PROGRESS', fsAll:'Push all', fsClr:'Clear', fsCount:'groups',
      fsCapTip:'Capped by the previous stage:',
      fsSearch:'Search style, PO, colour, line…', fsNoHit:'No row matches the search',
      fsEmpty:'Nothing received yet — go to Finishing In and confirm a handover slip.',
      fgBc:'F.G Shipment Plan', fgTitle:'Finished Goods Shipment Plan',
      fgPanel:'Shipments By Style · PO', fgSub:'One row per style · PO — the COLOR cell lists every colour of the shipment, read from the cutting plan SUMMARY BY COLOUR (matched on style · PO); shipped quantity, loading date, ship mode, destination and CBM are keyed in',
      fgK1:'ORDERED', fgK1s:'pcs on the shipment plan', fgK2:'READY', fgK2s:'pcs booked into finished goods',
      fgK3:'SHIPPED', fgK3s:'pcs already loaded', fgK4:'LATE', fgK4s:'shipments past their ETD',
      fgNo:'NO#', fgBrand:'BRAND', fgSeason:'SEASON', fgFactory:'FACTORY', fgStyle:'STYLE NO#',
      fgPo:'PO#', fgColor:'COLOR', fgQty:'ORDER QUANTITY', fgShipped:'SHIPPED QUANTITY', fgBal:'BALANCE QUANTITY',
      fgLoad:'LOADING DATE', fgEtd:'ETD', fgMode:'SHIP MODE', fgDest:'DESTINATION', fgCbm:'CBM', fgNote:'RE-MARK',
      fgAdd:'Add shipment', fgCount:'shipments', fgReseed:'Reseed from plan',
      fgReseedAsk:'Reseed every shipment from the Production Plan? Manual edits in this table will be lost.',
      fgPkImp:'Packing list', fgPkTip:'Import this shipment’s packing list (.xlsx/.xls/.csv) — takes the total carton qty and feeds Ordered Carton Qty on Finishing Status',
      fgPkHas:'Packing list imported — click to import a different file', fgPkClr:'Drop the packing list (drops this shipment’s barcodes too)',
      fgPkOk:'Packing list imported —', fgPkCtn:'ctn',
      fgPkNone:'No carton count found in the file. It needs a CARTON NO column, a carton-qty column, or a TOTAL CARTONS cell.',
      fgBcImp:'Barcode', fgBcTip:'Import the carton barcode file (.xlsx/.xls/.csv) — the list is stored for the Finishing Status table',
      fgBcHas:'Barcodes imported — click to import a different file', fgBcClr:'Drop this shipment’s barcode list',
      fgBcNeed:'Import the packing list first — barcodes need it',
      fgBcOk:'Barcodes imported —', fgBcN:'codes', fgBcCut:'codes (the overflow was dropped)',
      fgBcNone:'No barcode found in the file. It needs a BARCODE / UPC / EAN column.',
      fsCtnOrdPk:'From the packing list', fsCtnBcTip:'Barcodes imported for this shipment',
      fgSearch:'Search brand, style, PO, colour, destination, ETD…', fgNoHit:'No shipment matches the search',
      fgEmpty:'No shipment yet — hit Reseed from plan or Add shipment.',
      snapTitle:'LOCAL DATA', snapExport:'Export snapshot', snapImport:'Import snapshot',
      snapExportTip:'Download state-seed.js with ALL of localStorage plus the IndexedDB files. Drop it into app/data/ and ship the whole folder.',
      snapImportTip:'Pick a state-seed.js (or .json) file to overwrite the current data',
      snapReset:'Back to snapshot', snapResetTip:'Reload exactly the data in app/data/state-seed.js',
      snapWipe:'Wipe', snapWipeTip:'Clear saved data and stop reloading the bundled snapshot',
      snapWork:'Packing data…', snapOk:'state-seed.js downloaded — copy it into app/data/',
      snapErr:'Could not pack the data', snapBad:'That file is not a valid snapshot',
      snapAsk:'Loading this snapshot OVERWRITES all data currently on this machine. Continue?',
      snapNow:'Stored now:', snapSeed:'Bundled snapshot:', snapNone:'No bundled snapshot',
      tipReceive:'Save this cell and mark bundles received', tipUnreceive:'Received — click to set back to Waiting' }
  };
  NAVVI = {'PRODUCTION PLAN':'KẾ HOẠCH SẢN XUẤT','DASHBOARD':'TỔNG QUAN','Production Dashboard':'Dashboard sản xuất','SEWING':'MAY',
    'Fabric':'Vải',
    'Cutting':'Cắt','Sewing Output':'Sản lượng may',
    'Production Plan':'Kế hoạch sản xuất','Sewing Schedule':'Kế hoạch may','Daily Sewing Output':'Sản lượng may hàng ngày',
    'FINISHING':'HOÀN THIỆN','Finishing In':'Nhận hàng hoàn thiện','Finishing Status':'Tình trạng hoàn thiện',
    'F.G Shipment Plan':'Kế hoạch xuất hàng',};
  t(k){ const d=this.L[this.state.lang]||this.L.vi; return d[k]!==undefined?d[k]:(this.L.en[k]||k); }
  tn(s){ return (this.state.lang==='vi'&&this.NAVVI[s])?this.NAVVI[s]:s; }
  dayLabel(d,i){ return this.state.lang==='vi'?['T2','T3','T4','T5','T6','T7'][i]:d.toUpperCase(); }
  lineOptions(){ const pl=this.psLines(); const seen=pl.length?[...pl]:this.planLineNums().map(n=>'LINE '+n);
    this.getWeek().rows.forEach(r=>{ const n=this.normName(r.line); if(!seen.includes(n)) seen.push(n); });
    return seen; }
  renderLang(){ const h=React.createElement, C=this.C; const langs=[['vi','VI'],['en','EN']];
    return h('div',{style:{display:'inline-flex',border:'1px solid '+C.border,borderRadius:10,overflow:'hidden',height:34}},
      langs.map(([id,label],i)=>{ const on=this.state.lang===id;
        return h('button',{key:id,onClick:()=>this.set({lang:id,edit:null}),title:id==='vi'?'Tiếng Việt':'English',
          style:{border:'none',borderLeft:i?'1px solid '+C.border:'none',padding:'0 12px',fontSize:12.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',background:on?C.primary:C.white,color:on?'#fff':C.sub}},label); })); }

  renderVals(){
    const primary=this.props.primaryColor ?? '#7CB518'; const density=this.props.density ?? 'Comfortable';
    this.C={ primary, dark:'#4A7A0B', leaf:'#A7D129', tint:'#f0f8de', tint2:'#f7fcea', ink:'#20262f', sub:'#69707a', faint:'#9aa2ad', border:'#e4e7de', line:'#edefe9', bg:'#f3f6ec', white:'#fff', off:'#b3b8b0', offBg:'#fafbf9', badge:'#e4f4c4', shadow:'0 1px 2px rgba(40,60,10,.04), 0 10px 28px -14px rgba(40,60,10,.14)' };
    this.dense = density==='Compact';
    return { noop:()=>{}, toggleSidebar:()=>this.set({sidebarOpen:!this.state.sidebarOpen}),
      sidebarEl:this.state.sidebarOpen?this.renderAside():null, langEl:this.renderLang(),
      bcRoot:this.t('bcRoot'), bcPage:this.t(this.PAGE_BC[this.state.page]||'bcPage'),
      bodyEl:this.renderPageBody(),
      modalEl:this.renderBForm(), addLineEl:this.renderPsAdd(), confEl:this.renderConflict(), qrModalEl:this.renderQrModal() };
  }

  // Mot cho cho ca breadcrumb lan than trang -- them trang moi chi sua 2 bang nay.
  PAGE_BC={gantt:'psBc',dash:'dashBc',dso:'dsoBc',finIn:'fiBc',finSt:'fsBc',fgShip:'fgBc'};
  renderPageBody(){ const p=this.state.page;
    if(p==='gantt') return this.renderGanttBody();
    if(p==='dash') return this.renderDashBody();
    if(p==='dso') return this.renderDsoBody();
    if(p==='finIn') return this.renderFinInBody();
    if(p==='finSt') return this.renderFinStBody();
    if(p==='fgShip') return this.renderFgBody();
    return this.state.tab==='weekly'?this.renderBody()
      :(this.state.tab==='trim'?this.renderBundleBody():this.renderDemandBody()); }

  // Nguon duy nhat cho sidebar + guard trang khi khoi dong. Bo 1 nhom o day la bo khoi menu.
  NAVGROUPS=[
    ['DASHBOARD',[['Production Dashboard',1,'dash']]],
    ['PRODUCTION PLAN',[['Production Plan',1,'gantt']]],
    ['SEWING',[['Sewing Schedule',1,'sewing'],['Daily Sewing Output',1,'dso']]],
    ['FINISHING',[['Finishing In',1,'finIn'],['Finishing Status',1,'finSt'],['F.G Shipment Plan',1,'fgShip']]],
  ];
  navPages(){ const out=[]; this.NAVGROUPS.forEach(([,items])=>items.forEach(([,,pg])=>{ if(pg) out.push(pg); })); return out; }

  renderSideNav(){
    const h=React.createElement, C=this.C;
    const groups=this.NAVGROUPS;
    const icon=(active)=>h('span',{style:{width:7,height:7,flex:'none',borderRadius:99,background:active?C.primary:'#d3d8cb',display:'block',transition:'background .12s'}});
    const badge=()=>h('span',{style:{fontSize:9.5,fontWeight:600,color:C.primary,background:C.tint,padding:'2px 6px',borderRadius:4,letterSpacing:'.2px',flex:'none'}},'UI Proto');
    const navOpen=this.state.navOpen||{};
    return h('nav',{style:{padding:'0 10px'}},
      groups.map(([title,items])=>{ const open=!!navOpen[title];
        return h('div',{key:title,style:{marginTop:6}},
        h('div',{onClick:()=>this.set({navOpen:{...navOpen,[title]:!open}}),
          style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 8px',borderRadius:8,cursor:'pointer',color:open?'#69707a':'#a7ada4',fontSize:10.5,fontWeight:700,letterSpacing:'.6px',userSelect:'none'},
          'style-hover':{background:'#f4f6f0'}},
          this.tn(title), h('svg',{width:11,height:11,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2.5,style:{transform:open?'none':'rotate(-90deg)',transition:'transform .15s'}},h('path',{d:'M6 9l6 6 6-6'}))),
        open?items.map(([name,proto,pg],i)=>{ const active=!!pg&&this.state.page===pg;
          return h('div',{key:i,onClick:()=>{ if(!pg) return; this.set(pg!==this.state.page?{page:pg,edit:null,bedit:null,sidebarOpen:false}:{sidebarOpen:false});
            if(pg==='gantt') setTimeout(()=>this.psGoToday(),120); },
            style:{display:'flex',alignItems:'center',gap:10,padding:'7px 10px',margin:'1px 0',borderRadius:9,cursor:'pointer',fontSize:13,fontWeight:active?600:500,color:active?C.dark:'#454b52',background:active?C.tint:'transparent',transition:'background .12s'}},
            icon(active), h('span',{style:{flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},this.tn(name)), proto?badge():null); }):null
      );}));
  }

  renderAside(){
    const h=React.createElement, C=this.C;
    return h('div',{style:{position:'fixed',inset:0,zIndex:120}},
      h('div',{onClick:()=>this.set({sidebarOpen:false}),style:{position:'absolute',inset:0,background:'rgba(32,38,47,.28)'}}),
      h('aside',{className:'yscroll',style:{position:'absolute',left:0,top:0,width:248,background:'#fff',borderRight:'1px solid '+C.border,height:'100vh',overflowY:'auto',padding:'0 0 30px',boxShadow:'0 10px 40px rgba(32,38,47,.18)'}},
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 16px 12px'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:10}},
          h('div',{style:{width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#A7D129,'+C.dark+')',color:'#fff',fontWeight:700,fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',letterSpacing:'.5px',boxShadow:'0 2px 6px rgba(47,82,20,.25)',flex:'none'}},'Y'),
          h('div',null,
            h('div',{style:{fontSize:16,fontWeight:700,letterSpacing:'.3px',lineHeight:1.1}},h('span',{style:{color:C.primary}},'YIC'),' ',h('span',{style:{color:C.ink}},'MES')),
            h('div',{style:{fontSize:10,color:C.faint,marginTop:2,letterSpacing:'.2px'}},this.t('mes')))),
        h('div',{onClick:()=>this.set({sidebarOpen:false}),title:'Hide sidebar',style:{width:22,height:22,border:'1px solid #e2e4de',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',color:C.faint,cursor:'pointer'}},
          h('svg',{width:12,height:12,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2.5},h('path',{d:'M15 6l-6 6 6 6'})))),
      this.renderSideNav(),
      this.renderSnapBar(),
      h('div',{style:{padding:'14px 18px 0',marginTop:10,borderTop:'1px solid #eff0ec',color:C.faint,fontSize:11,fontWeight:600,letterSpacing:'.3px'}},'YIC Hanam MES')));
  }

  renderBody(){
    const h=React.createElement;
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px',position:'relative'}},
      this.renderTitle(), this.renderKpis(), this.renderTabs(), this.renderPanel());
  }

  renderTitle(key,code){
    const h=React.createElement, C=this.C;
    return h('div',{style:{display:'flex',alignItems:'center',gap:14,marginBottom:20}},
      h('h1',{style:{margin:0,fontSize:23,fontWeight:700,letterSpacing:'-.4px'}},this.t(key||'pageTitle')),
      h('span',{style:{fontSize:11,fontWeight:700,color:C.dark,background:C.tint,padding:'5px 12px',borderRadius:999,letterSpacing:'.3px'}},code||'S-01-PRODPLAN-MONITOR · UI Proto'),
      h('div',{style:{flex:1}}),
      h('button',{style:{...this.btn('ghost'),gap:6},onClick:()=>{}},
        h('svg',{width:15,height:15,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('circle',{cx:12,cy:12,r:9}),h('path',{d:'M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.4 1-1.4 1.9'}),h('path',{d:'M12 17h.01'})),this.t('help')),
      h('span',{style:{fontSize:11.5,color:C.sub,fontFamily:"'IBM Plex Mono',monospace",marginLeft:4,background:C.white,border:'1px solid '+C.border,padding:'6px 12px',borderRadius:999}},'PLN-YHN · '+this.todayStamp()));
  }
  todayStamp(){ const d=new Date(), p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate()); }

  renderTabs(){
    const h=React.createElement, C=this.C;
    const tabs=[['weekly',this.t('tab1')],['daily',this.t('tab2')],['trim',this.t('tab3')]];
    return h('div',{style:{display:'inline-flex',gap:3,background:'#e7eadf',padding:4,borderRadius:12,marginBottom:20}},
      tabs.map(([id,label])=>{ const a=this.state.tab===id;
        return h('button',{key:id,onClick:()=>this.set({tab:id}),style:{border:'none',cursor:'pointer',padding:'8px 18px',fontSize:13.5,fontWeight:600,color:a?C.dark:C.sub,background:a?'#fff':'transparent',borderRadius:9,fontFamily:'inherit',boxShadow:a?'0 1px 3px rgba(24,36,14,.14)':'none',transition:'background .15s,color .15s'}},label); }));
  }

  renderKpis(){
    const h=React.createElement, C=this.C; const rows=this.getWeek().rows;
    const lineSet=new Set(); rows.forEach(r=>{ if(this.DAYS.some(d=>r.days[d]!=null)) this.parseNums(r.line).forEach(n=>lineSet.add(n)); });
    // chi cong cac dong cua tuan dang xem -- bundle gio chua ca cac tuan khac
    let reqTotal=0; this.getWeek().rows.forEach(r=>{ const t=this.bundleTotal(r.id); if(t) reqTotal+=t; });
    const cards=[
      [this.t('kpiPlan'),this.fmt(this.weekTotal()),this.t('kpiPlanSub')],
      [this.t('kpiDemand'),this.fmt(this.needTotal()),this.t('kpiDemandSub')],
      [this.t('kpiReq'),this.fmt(reqTotal),this.t('kpiReqSub')]];
    const icons=[
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('rect',{x:3,y:4,width:18,height:17,rx:3}),h('path',{d:'M8 2v4M16 2v4M3 9h18'})),
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('path',{d:'M12 2 2 7l10 5 10-5-10-5z'}),h('path',{d:'M2 12l10 5 10-5'}),h('path',{d:'M2 17l10 5 10-5'})),
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('path',{d:'M21 8 12 3 3 8v8l9 5 9-5V8z'}),h('path',{d:'M3 8l9 5 9-5M12 13v8'}))];
    return h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}},
      cards.map(([label,val,sub],i)=>h('div',{key:i,style:{background:C.white,border:'1px solid '+C.border,borderRadius:13,padding:'10px 14px',boxShadow:C.shadow,display:'flex',alignItems:'center',gap:10}},
        h('div',{style:{width:26,height:26,borderRadius:8,background:C.tint,color:C.dark,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},icons[i]),
        h('div',{style:{flex:1,minWidth:0,fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.sub,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},label),
        h('div',{style:{fontSize:19,fontWeight:700,letterSpacing:'-.4px',lineHeight:1,fontVariantNumeric:'tabular-nums',flex:'none'}},val))));
  }

  renderPeriodBar(noWeeks){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const months=Object.keys(this.MONTHS); const om=this.state.openMonth||months[0]; const weeks=this.MONTHS[om]||[];
    return h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:10,padding:'9px 14px',borderBottom:'1px solid '+C.line,background:C.offBg}},
      h('span',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.6px',color:C.faint}},this.t('period')),
      h('div',{style:{display:'inline-flex',gap:3,background:'#e9ece1',padding:3,borderRadius:10}},
        months.map((m)=>{ const on=om===m;
          return h('button',{key:m,onClick:()=>this.set({openMonth:m}),style:{border:'none',padding:'5px 13px',fontSize:12.5,fontWeight:600,fontFamily:'inherit',cursor:'pointer',background:on?'#fff':'transparent',color:on?C.dark:C.sub,borderRadius:8,boxShadow:on?'0 1px 2px rgba(24,36,14,.15)':'none'}},m); })),
      noWeeks?null:h('div',{style:{width:1,height:20,background:C.border}}),
      noWeeks?null:h('div',{style:{display:'flex',flexWrap:'wrap',gap:6}},
        weeks.map(w=>{ const sel=this.state.week===w; const wn=w.split('· ')[1]; const tot=this.weekTotal(w);
          return h('button',{key:w,onClick:()=>this.selectWeek(w),style:{cursor:'pointer',fontFamily:'inherit',fontSize:12.5,fontWeight:600,padding:'6px 13px',borderRadius:999,border:'1px solid '+(sel?C.primary:C.border),background:sel?C.primary:C.white,color:sel?'#fff':C.sub,display:'inline-flex',alignItems:'center',gap:7,transition:'background .15s,color .15s,border-color .15s'}},
            wn, h('span',{style:{fontSize:10.5,fontWeight:600,color:sel?'rgba(255,255,255,.8)':C.faint,fontFamily:mono}},tot?this.fmt(tot):'—')); })));
  }

  renderPanel(){
    const h=React.createElement, C=this.C; const rows=this.getWeek().rows;
    const active=rows.filter(r=>this.DAYS.some(d=>r.days[d]!=null)).length;
    const lineSet=new Set(); rows.forEach(r=>this.parseNums(r.line).forEach(n=>lineSet.add(n)));
    return h('div',{ref:this.panelRef,style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow,scrollMarginTop:16}},
      this.renderPeriodBar(),
      h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'16px 22px 14px',borderBottom:'1px solid '+C.line}},
        h('div',{style:{marginRight:'auto'}},
          h('div',{style:{fontSize:16,fontWeight:700}},this.t('tab1')),
          h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.state.week)),
        h('div',{style:{display:'flex',flexWrap:'wrap',gap:9,justifyContent:'flex-end'}},
          h('button',{style:this.btn('ghost'),onClick:()=>this.copyLastWeek()},this.ic('copy'),this.t('copyWeek')),
          h('button',{style:this.btn('ghost'),onClick:()=>{}},this.ic('doc'),this.t('downloadTpl')),
          h('button',{style:this.btn('ghost'),title:this.t('exportTip'),onClick:()=>this.exportExcel()},this.ic('grid'),this.t('exportXls')))),
      h('div',{style:{display:'flex',flexWrap:'wrap',gap:'6px 26px',padding:'11px 20px',borderBottom:'1px solid '+C.line,fontSize:13,color:C.sub,whiteSpace:'nowrap'}},
        h('span',null,this.t('activeRows')+': ',h('b',{style:{color:C.ink}},active)),
        h('span',null,this.t('rowsN')+': ',h('b',{style:{color:C.ink}},rows.length)),
        h('span',null,this.t('linesN')+': ',h('b',{style:{color:C.ink}},lineSet.size)),
        h('span',null,this.t('totalQty')+': ',h('b',{style:{color:C.ink}},this.fmt(this.grand(rows))))),
      h('div',{style:{padding:'16px 16px 8px'}},
        rows.length? this.renderGrid() : h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('planEmpty')),
        h('div',{style:{padding:'12px 4px 10px',fontSize:11.5,color:C.faint,lineHeight:1.5}},this.t('planFromPs'))));
  }

  renderGrid(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows; const dates=this.weekDates(); const pad=this.dense?'7px 6px':'10px 8px';
    const th={padding:'8px 6px',fontSize:11,fontWeight:700,letterSpacing:'.3px',textTransform:'uppercase',color:C.sub,textAlign:'center',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,background:'#f8faf3'};
    return h('div',{style:{border:'1px solid '+C.border,borderRadius:12,overflow:'hidden'}},
      h('table',{style:{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('colgroup',null,
          h('col',{style:{width:'112px'}}), h('col',{style:{width:'118px'}}), h('col',{style:{width:'150px'}}),
          ...this.DAYS.map((d,i)=>h('col',{key:i})), h('col',{style:{width:'86px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...th,textAlign:'left',paddingLeft:12}},this.t('colLine')),
          h('th',{style:{...th,textAlign:'left',paddingLeft:10}},this.t('colBrand')),
          h('th',{style:{...th,textAlign:'left',paddingLeft:10}},this.t('colStyle')),
          ...this.DAYS.map((d,i)=>h('th',{key:d,style:{...th,background:'#fbfcfa'}},
            h('div',{style:{fontWeight:700,fontSize:13,color:C.ink}},this.dayLabel(d,i)),
            h('div',{style:{fontSize:10.5,color:C.faint,marginTop:2,fontFamily:mono,fontWeight:500}},dates[i]))),
          h('th',{style:{...th,color:'#fff',background:C.dark,borderRight:'none',borderBottom:'2px solid '+C.dark}},this.t('colTotal')))),
        h('tbody',null, (()=>{ const info=this.lineSpans(rows); const bi=this.fieldSpans(rows,'brand'); const si=this.fieldSpans(rows,'style'); let grp=-1; return rows.map((r,idx)=>{ if(info[idx].first) grp++; return this.renderRow(r,pad,mono,info[idx],bi[idx],si[idx],grp%2===1); }); })()),
        h('tfoot',null,h('tr',null,
          h('td',{colSpan:3,style:{padding:'12px',fontSize:12,fontWeight:700,letterSpacing:'.5px',color:'#cfe0be',background:C.dark}},this.t('colTotal')),
          ...this.DAYS.map(d=>h('td',{key:d,style:{padding:'12px 6px',textAlign:'center',fontSize:13.5,fontWeight:700,color:'#fff',background:C.dark}},this.fmt(this.colTotal(rows,d)))),
          h('td',{style:{padding:'12px 6px',textAlign:'center',fontSize:15,fontWeight:700,color:'#fff',background:C.dark}},this.fmt(this.grand(rows)))))));
  }

  renderRow(r,pad,mono,linfo,binfo,sinfo,stripe){
    linfo=linfo||{first:true,span:1,ids:[r.id]}; binfo=binfo||{first:true,span:1}; sinfo=sinfo||{first:true,span:1};
    const h=React.createElement, C=this.C; const e=this.state.edit; const ed=(col)=>e&&e.id===r.id&&e.col===col;
    const rbg=stripe?'#f7f9f3':C.white;
    const cb={borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'middle'};
    const inp={width:'100%',border:'2px solid '+C.primary,padding:pad,fontSize:13,fontFamily:'inherit',color:C.ink,background:C.white};
    const brands=this.psBrands(); const styleOpts=this.psStyles(r.brand);
    const lineLk=this.planColLocked(r.id,'line'), colLk=this.planColLocked(r.id,'brand');
    const sel=(opts,ph,apply)=>h('select',{autoFocus:true,defaultValue:'',style:{...inp,fontWeight:600,cursor:'pointer',borderRadius:6,appearance:'auto'},
      onChange:ev=>{ const v=ev.target.value; if(v) apply(v); this.stopEdit(); },
      onBlur:()=>{ this._chainBrand=null; this.stopEdit(); },
      onKeyDown:ev=>{ if(ev.key==='Escape'){ this._chainBrand=null; this.stopEdit(); } }},
      [h('option',{key:'',value:'',disabled:true},ph),...opts.map(o=>h('option',{key:o,value:o},o))]);
    const commit=(fn)=>({ onBlur:ev=>{ fn(ev.target.value); this.stopEdit(); }, onKeyDown:ev=>{ if(ev.key==='Enter'){ fn(ev.target.value); this.stopEdit(); } else if(ev.key==='Escape') this.stopEdit(); } });
    // LINE #
    const lineCell = ed('line')
      ? h('td',{key:'line',rowSpan:linfo.span,style:{...cb,padding:6,background:C.tint,verticalAlign:'middle'}},
          h('div',{style:{display:'flex',alignItems:'center',gap:6}},
            h('input',Object.assign({autoFocus:true,list:'dl-line',defaultValue:this.normName(r.line),placeholder:this.t('phLine'),style:{...inp,flex:1,minWidth:0,fontWeight:700,background:C.white,borderRadius:6}},commit(v=>this.renameGroup(linfo.ids,v)))),
            h('datalist',{id:'dl-line'}, this.lineOptions().map(n=>h('option',{key:n,value:n}))),
            h('button',{title:this.t('tipDelLine'),onMouseDown:ev=>ev.preventDefault(),onClick:()=>this.removeGroupSafe(linfo.ids),style:{border:'none',background:'none',cursor:'pointer',color:'#c0392b',display:'flex',padding:2,flex:'none'}},
              h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14'})))))
      : h('td',{key:'line',class:'lncell',rowSpan:linfo.span,onClick:lineLk?undefined:()=>this.startEdit(r.id,'line'),title:lineLk?this.t('tipPlanCol'):this.t('tipLine'),style:{...cb,padding:pad,paddingLeft:12,background:C.tint,opacity:lineLk?.7:1,color:'#666',cursor:lineLk?'default':'pointer',verticalAlign:'middle',position:'relative'}},
          h('span',{style:{fontSize:12.5,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},this.normName(r.line)),
          lineLk?null:h('button',{class:'lnadd',title:this.t('addStyleRow'),onClick:ev=>{ev.stopPropagation();this.addRowSame(r.line);},
            style:{position:'absolute',left:-11,top:'50%',marginTop:-10,zIndex:40,width:20,height:20,borderRadius:'50%',border:'1px solid '+C.border,background:'#fff',color:C.primary,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(24,36,14,.2)',padding:0},
            'style-hover':{background:C.tint}},
            h('svg',{width:11,height:11,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:3,strokeLinecap:'round'},h('path',{d:'M12 5v14M5 12h14'}))));
    // BRAND
    const brandCell = ed('brand')
      ? h('td',{key:'brand',rowSpan:binfo.span,style:{...cb,padding:0,verticalAlign:'middle'}}, sel(brands,this.t('phBrand'),v=>this.setBrand(r.id,v)))
      : h('td',{key:'brand',rowSpan:binfo.span,onClick:colLk?undefined:()=>this.startEdit(r.id,'brand'),title:colLk?this.t('tipPlanCol'):(this.rowHasData(r)?this.t('tipRepick'):this.t('tipBrand')),style:{...cb,padding:pad,paddingLeft:10,fontSize:12.5,fontWeight:600,color:(r.brand||this.brandForStyle(r.style))?C.ink:C.primary,cursor:colLk?'default':'pointer',opacity:colLk?.7:1,background:rbg,verticalAlign:'middle'}}, r.brand||this.brandForStyle(r.style)||(colLk?'—':this.t('addBrand')));
    // STYLE #
    const styleCell = ed('style')
      ? h('td',{key:'style',rowSpan:sinfo.span,style:{...cb,padding:0,verticalAlign:'middle'}}, r.brand?sel(styleOpts,this.t('phStyle'),v=>this.setStyle(r.id,v)):h('div',{style:{padding:pad,fontSize:12,color:C.faint}},this.t('phStyleFirst')))
      : h('td',{key:'style',rowSpan:sinfo.span,onClick:colLk?undefined:()=>this.startEdit(r.id,'style'),title:colLk?this.t('tipPlanCol'):(this.rowHasData(r)?this.t('tipRepick'):this.t('tipStyle')),style:{...cb,padding:pad,paddingLeft:10,fontSize:12.5,fontFamily:mono,color:r.style?C.ink:C.primary,fontWeight:r.style?400:600,cursor:colLk?'default':'pointer',opacity:colLk?.7:1,background:rbg,verticalAlign:'middle'}}, r.style||(colLk?'—':this.t('addStyle')));
    // DAYS
    const dayCells=this.DAYS.map(d=>{ const val=r.days[d]; const taken=val==null&&this.dayTaken(r,d);
      if(ed(d)) return h('td',{key:d,style:{...cb,padding:0}}, h('input',Object.assign({type:'number',autoFocus:true,defaultValue:val!=null?val:'',style:{...inp,textAlign:'center',fontWeight:700}},commit(v=>this.setDay(r.id,d,v)))));
      if(taken) return h('td',{key:d,onClick:()=>this.startEdit(r.id,d),title:this.t('dayConflict'),style:{...cb,padding:pad,textAlign:'center',fontSize:13.5,fontFamily:mono,color:'#d8dcd2',background:stripe?'#f2f4ee':'#fafbf8',cursor:'pointer'}},'×');
      return h('td',{key:d,onClick:()=>this.startEdit(r.id,d),title:this.t('tipDay'),style:{...cb,padding:pad,textAlign:'center',fontSize:13.5,cursor:'pointer',fontFamily:mono,fontWeight:val!=null?700:400,color:val!=null?C.ink:'#c3c8bf',background:rbg}}, val!=null?this.fmt(val):'–'); });
    // TOTAL
    const totalCell=h('td',{key:'tot',style:{...cb,borderRight:'none',padding:pad,textAlign:'center',fontSize:14,fontWeight:700,color:C.ink,background:C.tint2}},this.fmt(this.rowTotal(r)));
    return h('tr',{key:r.id}, [...(linfo.first?[lineCell]:[]),...(binfo.first?[brandCell]:[]),...(sinfo.first?[styleCell]:[]),...dayCells,totalCell]);
  }

  renderBundleBody(){
    const h=React.createElement, C=this.C;
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle(), this.renderKpis(), this.renderTabs(),
      h('div',{style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow}},
        this.renderPeriodBar(),
        h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'16px 22px 14px',borderBottom:'1px solid '+C.line}},
          h('div',{style:{marginRight:'auto'}},
            h('div',{style:{fontSize:16,fontWeight:700}},this.t('tab3')),
            h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('reqSub')+' · '+this.state.week)),
          h('button',{style:this.btn('ghost'),title:this.t('exportTip'),onClick:()=>this.exportExcel()},this.ic('grid'),this.t('exportXls'))),
        h('div',{style:{padding:'16px 16px 8px'}}, this.getWeek().rows.length? this.renderBundleGrid() : h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty')))),
      this.renderRecvLog(), this.renderBqSlip());
  }

  // ================= Phieu giao nhan ban thanh pham =====================
  // Dung khuon to phieu giay QT.GRSBM11-09, da rut bot cho ban dien tu: 5 cot
  // (bo Xuat di nuoc / Ngay giao hang -- app khong co du lieu nay), Ghi chu,
  // 2 o ky (bo To truong Bo phan cat).
  BQ_ROWS=10;          // so dong ke san tren to phieu
  renderBqSlip(){
    const d=this.bSlipData(); if(!d) return null;
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    // Mau lay tu theme he thong (this.C), khong con khung do nhu to giay goc:
    //   net ke  -> C.border (cung token voi vien bang cua app)
    //   so lieu -> C.dark   (xanh dam, giong cot so cua cac bang khac)
    //   dau bang-> nen '#f8faf3' + chu C.sub, dung nhu S.th cua app
    const INK=C.ink, LN=C.border, VAL=C.dark, HEAD='#f8faf3';
    const close=()=>this.bSlipClose();
    // 1 truong: nhan + gia tri tren net gach roi
    const fld=(label,val)=>h('div',{key:label,style:{display:'flex',alignItems:'baseline',gap:7,minWidth:0}},
      h('span',{style:{flex:'none',fontSize:13,fontWeight:700,color:C.sub}},label),
      h('span',{style:{flex:1,minWidth:0,borderBottom:'1px dotted '+LN,paddingBottom:1,
        fontSize:14,fontWeight:700,color:VAL,fontFamily:mono,whiteSpace:'nowrap',
        overflow:'hidden',textOverflow:'ellipsis'}},val||'\u00a0'));
    const cols=[['bqC1','24%'],['bqC2','16%'],['bqC3','14%'],['bqC4','20%'],['bqC5','26%']];
    const cbase={border:'1px solid '+LN,padding:'6px 7px',fontSize:12.5,verticalAlign:'middle'};
    const th=h('tr',null,cols.map(([k,w])=>h('th',{key:k,style:{...cbase,width:w,background:HEAD,
      fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'center',lineHeight:1.3}},this.t(k))));
    const cell=(v,o)=>h('td',{key:(o&&o.k)||v,style:{...cbase,textAlign:(o&&o.al)||'center',
      fontFamily:(o&&o.mono)?mono:'inherit',fontWeight:(o&&o.b)?700:600,
      color:(o&&o.b)?VAL:INK,height:26}},
      v==null||v===''?'\u00a0':v);
    const body=[];
    d.lines.forEach((x,i)=>body.push(h('tr',{key:'r'+i},
      cell(i?'':d.color,{k:'c',al:'left'}), cell(x.tb,{k:'tb',mono:true}),
      cell(x.size,{k:'sz',b:true}), cell(this.fmt(x.qty),{k:'q',mono:true,b:true}),
      cell(i?'':d.po,{k:'po',mono:true}))));
    for(let i=d.lines.length;i<this.BQ_ROWS;i++)
      body.push(h('tr',{key:'e'+i},cols.map(([k])=>cell('',{k:k}))));
    // Khoi ky: dung khuon giong phieu ban giao cua Daily Sewing Output
    const sign=h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,
        maxWidth:560,margin:'24px auto 0',padding:'0 6px'}},
      ['bqSign1','bqSign2'].map(k=>h('div',{key:k,style:{textAlign:'center'}},
        h('div',{style:{height:40}}),
        h('div',{style:{borderTop:'1px solid '+LN,paddingTop:7,fontSize:12,fontWeight:600,
          color:C.faint}},this.t(k)))));
    const frame=h('div',{style:{border:'1px solid '+LN,borderRadius:12,background:C.white,
        padding:'14px 16px 16px'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:12}},
        h('span',{style:{flex:'none',background:C.primary,color:'#fff',fontSize:14,fontWeight:800,
          letterSpacing:'.5px',padding:'3px 9px',borderRadius:7,lineHeight:1.3}},'YIC'),
        h('div',{style:{flex:1}}),
        h('span',{style:{flex:'none',fontSize:12.5,fontWeight:700,color:C.dark,fontFamily:mono}},
          d.no||'\u2014')),
      h('div',{style:{fontSize:18,fontWeight:800,color:INK,letterSpacing:'.2px',margin:'9px 0 11px'}},
        this.t('bqTitle')),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',columnGap:30,rowGap:8,
        marginBottom:13}},
        fld(this.t('bqDay'),d.day), fld(this.t('bqCust'),d.brand),
        fld(this.t('bqLine'),d.line), fld(this.t('bqStyle'),d.style)),
      h('table',{style:{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('thead',null,th), h('tbody',null,body)),
      h('div',{style:{display:'flex',alignItems:'baseline',gap:8,marginTop:12}},
        h('span',{style:{flex:'none',fontSize:13,fontWeight:700,color:C.sub}},this.t('bqNote')),
        h('span',{style:{flex:1,borderBottom:'1px dotted '+LN,height:15}})));
    const foot=h('div',{'data-noprint':'',style:{display:'flex',alignItems:'center',gap:10,
        marginTop:22,paddingTop:16,borderTop:'1px solid '+C.line,flexWrap:'wrap'}},
      h('div',{style:{flex:1,minWidth:8}}),
      h('button',{onClick:close,style:this.btn('ghost')},this.t('dsoClose')),
      h('button',{onClick:()=>window.print(),style:this.btn('ghost')},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9},
          h('path',{d:'M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z'})),this.t('bgPrint')),
      h('button',{onClick:()=>this.bSlipReceive(),style:this.btn('primary')},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M5 12l4 4 10-10'})),this.t('bqOk')));
    const panel=h('div',{'data-bg-panel':'',className:'yscroll',onClick:ev=>ev.stopPropagation(),
        style:{width:'min(880px,96vw)',maxHeight:'94vh',overflow:'auto',background:C.white,
          borderRadius:14,boxShadow:'0 30px 70px rgba(0,0,0,.32)',padding:'20px 22px 18px'}},
      frame,sign,foot);
    const over=h('div',{'data-bg-overlay':'',onClick:close,style:{position:'fixed',inset:0,
        background:'rgba(24,28,22,.5)',backdropFilter:'blur(2px)',display:'flex',
        alignItems:'center',justifyContent:'center',zIndex:88,padding:20}},panel);
    return (RD&&RD.createPortal)?RD.createPortal(over,document.body):over;
  }

  renderRecvLog(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const log=[...(this.state.recvLog||[])].reverse();
    const th={padding:'10px 10px',fontSize:11,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,background:'#f8faf3',whiteSpace:'nowrap'};
    const td={padding:'9px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,verticalAlign:'middle'};
    const rows=log.map((e,i)=>{ const stripe=i%2===1; const bg=stripe?'#f7f9f3':C.white;
      return h('tr',{key:e.ts+'-'+i},
        h('td',{style:{...td,paddingLeft:22,background:bg,fontFamily:mono,fontWeight:600,color:e.undo?C.faint:C.ink}},
          h('span',{style:{whiteSpace:'nowrap'}},this.recvTime(e.ts)),
          e.undo?h('span',{style:{marginLeft:8,fontSize:10,fontWeight:700,color:'#946200',background:'#fbf1d5',
            border:'1px solid #efdfb0',borderRadius:4,padding:'1px 5px',fontFamily:'inherit',whiteSpace:'nowrap'}},this.t('recvUndo')):null),
        h('td',{style:{...td,background:bg,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},e.line),
        h('td',{style:{...td,background:bg,fontFamily:mono,color:C.ink,wordBreak:'break-all'}},e.style),
        h('td',{style:{...td,background:bg,color:C.ink}},
          h('span',{style:{display:'inline-flex',alignItems:'center',gap:7}},
            h('span',{style:{flex:'none',width:10,height:10,borderRadius:'50%',background:this.colorHex(e.color),border:'1px solid rgba(0,0,0,.18)'}}),
            h('span',{style:{fontWeight:600,whiteSpace:'nowrap'}},e.color))),
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:700,color:C.dark}},this.recvTurnText(e)));
    });
    return h('div',{style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow,marginTop:18}},
      h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'16px 22px 14px',borderBottom:'1px solid '+C.line}},
        h('div',{style:{marginRight:'auto'}},
          h('div',{style:{fontSize:16,fontWeight:700}},this.t('recvTitle')),
          h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('recvSub'))),
        h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:C.dark,background:C.tint,borderRadius:999,padding:'5px 12px'}},
          this.fmt(log.length)+' '+this.t('recvRows'))),
      log.length
        ? h('div',{className:'yscroll',style:{overflowX:'auto'}},
            h('table',{style:{width:'100%',minWidth:'1000px',borderCollapse:'collapse',tableLayout:'fixed'}},
              h('colgroup',null, ...Array.from({length:5},(_,i)=>h('col',{key:i,style:{width:'20%'}}))),
              h('thead',null,h('tr',null,
                h('th',{style:{...th,paddingLeft:22}},this.t('recvDT')),
                h('th',{style:{...th}},this.t('colLine')),
                h('th',{style:{...th}},this.t('colStyle')),
                h('th',{style:{...th}},this.t('colColor')),
                h('th',{style:{...th}},this.t('recvTurn')))),
              h('tbody',null,rows)))
        : h('div',{style:{padding:'44px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('recvEmpty')));
  }

  renderBundleGrid(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows; const dates=this.weekDates();
    const th={padding:'11px 8px',fontSize:11.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',color:C.sub,textAlign:'center',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,background:'#f8faf3'};
    const spans=this.lineSpans(rows); const sstyle=this.fieldSpans(rows,'style');
    let grp=-1;
    const body=rows.map((r,idx)=>{ const linfo=spans[idx]; const sinfo=sstyle[idx];
      if(linfo.first) grp++; const stripe=grp%2===1;
      const b=this.state.bundle[this.bKey(r)]; const color=this.bundleColor(r,idx); const chosen=!!color;
      const cells=[];
      if(linfo.first) cells.push(h('td',{key:'ln',rowSpan:linfo.span,style:{borderRight:'1px solid '+C.border,borderTop:'1px solid '+C.line,background:C.tint,verticalAlign:'middle',textAlign:'center',padding:'8px 4px',fontSize:12.5,fontWeight:700,color:C.primary,lineHeight:1.25}},this.normName(r.line)));
      if(sinfo.first) cells.push(h('td',{key:'st',rowSpan:sinfo.span,style:{borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'middle',padding:'8px 9px',fontSize:11.5,fontFamily:mono,color:C.ink,wordBreak:'break-all',lineHeight:1.3,background:stripe?'#f7f9f3':C.white}},r.style));
      cells.push(this.reqColorCell(r,color,stripe));
      this.DAYS.forEach((d,i)=>cells.push(this.reqDayCell(r,d,b,chosen,stripe,i===5)));
      // SL da len don yeu cau / SL demand theo Ke hoach may tuan cua chinh dong nay
      const tot=this.bundleTotal(r.id), need=this.rowTotal(r), done=tot||0;
      const dcol=!done?'#c3c8bf':(need>0&&done>=need?'#2f7d32':C.ink);
      cells.push(h('td',{key:'tot',title:this.t('tipReqPlan'),style:{borderTop:'1px solid '+C.line,textAlign:'center',verticalAlign:'middle',background:C.tint2,padding:'6px 5px'}},
        h('span',{style:{fontSize:14.5,fontWeight:700,fontFamily:mono,color:dcol}},this.fmt(done)),
        h('span',{style:{fontSize:11.5,fontWeight:600,fontFamily:mono,color:C.faint}},' / '+this.fmt(need))));
      return h('tr',{key:r.id},cells);
    });
    return h('div',{style:{border:'1px solid '+C.border,borderRadius:12,overflow:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1180px',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('colgroup',null, h('col',{style:{width:'72px'}}), h('col',{style:{width:'98px'}}), h('col',{style:{width:'128px'}}),
          ...this.DAYS.map((d,i)=>h('col',{key:i,style:{width:'152px'}})), h('col',{style:{width:'122px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...th,textAlign:'left',paddingLeft:12}},this.t('colLine')),
          h('th',{style:{...th,textAlign:'left',paddingLeft:10}},this.t('colStyle')),
          h('th',{style:{...th,textAlign:'left',paddingLeft:10}},this.t('colColor')),
          ...this.DAYS.map((d,i)=>h('th',{key:d,style:{...th,background:'#fbfcfa'}},
            h('div',{style:{fontWeight:700,fontSize:13,color:C.ink}},this.dayLabel(d,i)),
            h('div',{style:{fontSize:10.5,color:C.faint,marginTop:2,fontFamily:mono,fontWeight:500}},dates[i]))),
          h('th',{title:this.t('tipReqPlan'),style:{...th,color:'#fff',background:C.dark,borderRight:'none',borderBottom:'2px solid '+C.dark}},this.t('colReqPlan')))),
        h('tbody',null, body)));
  }

  colorHex(name){ if(!name) return '#c9cdc6'; const k=String(name).toLowerCase().trim();
    const map={'white':'#f2f2ec','marshmallow':'#efe9dc','bourbon':'#8a5a2b','black':'#23262b','all black':'#191b1e','onyx':'#2a2d33','obsidian':'#23262b','ink':'#20242c','pigment':'#373c43','midnight':'#1c2a44',
      'charcoal':'#3a3f47','graphite':'#4a4f57','graphite grey':'#4a4f57','forge grey':'#5c6169','heather grey':'#b7bcc2','grey':'#9aa0a8','gray':'#9aa0a8','fog':'#c3c8ce','glacier':'#dde6ea','rock':'#8b9099','slate':'#586572','storm':'#6b7784',
      'navy':'#243a63','true navy':'#20365c','classic navy':'#22345a','maritime':'#26456d','ceil blue':'#8fb0d6','ciel':'#9cbbdd','tidepool':'#2f6f7e','dusk':'#586a86',
      'olive':'#5f6a3a','sage':'#8a9a76','sand':'#d8c39a','cinnamon':'#9c5a34','ember':'#b8452e','flame':'#d1502f','volt':'#c8d63f','crimson':'#a02334','wine':'#6e2233','washed boysenberry':'#7a4a5e','fig':'#5c4658'};
    if(map[k]) return map[k]; const has=w=>k.indexOf(w)>=0;
    if(has('white')) return '#f2f2ec'; if(has('black')) return '#23262b'; if(has('navy')) return '#243a63'; if(has('blue')) return '#3f6bb0'; if(has('grey')||has('gray')) return '#9aa0a8'; if(has('olive')) return '#5f6a3a'; if(has('green')||has('sage')) return '#5f7a4a'; if(has('red')||has('crimson')) return '#a02334'; if(has('sand')||has('tan')) return '#d8c39a'; return '#8a9099'; }

  reqColorCell(r,color,stripe){
    const h=React.createElement, C=this.C;
    return h('td',{key:'cl',title:this.t('tipAutoCol'),style:{borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'middle',padding:7,background:stripe?'#f7f9f3':C.white}},
      h('div',{style:{display:'flex',alignItems:'center',gap:8,padding:'4px 2px 4px 4px',opacity:.7,cursor:'default'}},
        h('span',{style:{flex:'none',width:10,height:10,borderRadius:'50%',background:color?this.colorHex(color):'#dcb9b5',border:'1px solid rgba(0,0,0,.18)'}}),
        h('span',{style:{fontSize:12,fontWeight:600,color:C.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},color||'—')));
  }

  // Mau trang thai cap BTP -- Waiting = cam, Received = xanh la
  STC={ requested:{fg:'#2f5d8a',bg:'#e9f1f8',bd:'#c4d7e9',dot:'#3f7cb0'},
        waiting:{fg:'#a35a00',bg:'#fdf0e0',bd:'#f0d5ae',dot:'#e2891d'},
        received:{fg:'#2f7d32',bg:'#e6f2e2',bd:'#c3ddbe',dot:'#3f9142'} };
  // Bam tag de dao vong theo dung chieu: Requested -> Waiting -> Received -> Requested
  STORDER=['requested','waiting','received'];
  STKEY={requested:'stRequested',waiting:'stWaiting',received:'stReceived'};
  nextStatus(st){ const i=this.STORDER.indexOf(st); return this.STORDER[(i<0?0:i+1)%this.STORDER.length]; }
  // Dao trang thai ngay tren o, khong mo modal
  cycleStatus(r,d,ev){ if(ev){ ev.stopPropagation(); ev.preventDefault(); }
    const k=this.bKey(r); if(!k) return;
    this.setState(st=>{ const bb=st.bundle[k]; if(!bb||!bb.days||!bb.days[d]) return null;
      const days={...bb.days}; days[d]={...days[d],status:this.nextStatus(this.cellStatus(days[d]))};
      return {bundle:{...st.bundle,[k]:{...bb,days:days}}}; }); }
  // Bam tag trang thai: dang CHO NHAN thi mo phieu giao nhan BTP (o day moi xac
  // nhan da nhan). Cac trang thai khac van dao vong ngay tren o nhu truoc.
  bStatusTap(r,d,ev){ if(ev){ ev.stopPropagation(); ev.preventDefault(); }
    const cell=this.bcellAt(r.id,d);
    if(cell&&this.cellStatus(cell)==='waiting') return this.bSlipOpen(r,d);
    this.cycleStatus(r,d); }
  // Ma phieu giao nhan BTP: CS-yyyymmdd-nnn, nnn la so thu tu trong NGAY PHAT
  // HANH (khong phai ngay giao -- ngay giao la 1 o rieng tren phieu).
  //
  // Ma thuoc ve TO GIAY, khong thuoc ve o luoi. O co the bi xoa rong roi dung
  // lai, hoac doi luot cat / size / so luong / mau -- luc do chinh app coi la
  // yeu cau moi (bformStatus tra ve 'requested'). To in ra khac han to truoc,
  // nen phai mang so khac. Vi vay ma duoc luu kem CHU KY NOI DUNG: chu ky lech
  // la cap so moi. Mo lai / in lai to dang cho thi chu ky trung -> giu so cu.
  bqNoKey(r,day){ return this.bKey(r)+'|'+day; }
  bqSig(r,day){ const c=this.bcellAt(r.id,day); if(!c) return '';
    const ri=this.getWeek().rows.findIndex(x=>x.id===r.id);
    return [c.turn||'',c.size||'',c.supply||'',this.bundleColor(r,ri)].join('|'); }
  bqNoOf(r,day){ const v=(this.state.bqNo||{})[this.bqNoKey(r,day)];
    if(!v||!v.no) return '';
    return v.sig===this.bqSig(r,day)?v.no:''; }
  // Moc phat hanh to phieu -- dung lam gio o truong 'Ngay giao'. Ban luu cu
  // (truoc khi co truong nay) khong co ts: to phieu chi hien ngay, khong gio.
  bqTsOf(r,day){ const v=(this.state.bqNo||{})[this.bqNoKey(r,day)];
    if(!v||!v.no||v.sig!==this.bqSig(r,day)) return 0;
    return Number(v.ts)||0; }
  // So thu tu trong ngay CHI TANG. Khong dem so ban ghi dang co: tra 1 so ve
  // (doi noi dung, xac nhan xong) roi dem lai se cap trung so da in.
  bqSeqAt(st,day){ const pre='CS-'+day+'-';
    let n=Number((st.bqSeq||{})[day])||0;
    const m=st.bqNo||{};
    // Ban luu dau tien luu thang chuoi ma (chua co chu ky) -- van phai tinh
    // vao day, khong thi bo dem tut lai va cap trung so da in.
    Object.keys(m).forEach(k=>{ const v=m[k], s=String((v&&v.no)||v||'');
      if(s.indexOf(pre)===0) n=Math.max(n,Number(s.slice(pre.length))||0); });
    return n; }
  // Cap so luc mo phieu. Khong tra ve gia tri: setState la bat dong bo, ben
  // goi doc lai bang bqNoOf sau khi state da cap nhat.
  bqNoIssue(r,day){ if(this.bqNoOf(r,day)) return;
    const k=this.bqNoKey(r,day), ts=Date.now(), day8=this.dsoSlipDay(ts), sig=this.bqSig(r,day);
    this.setState(st=>{ const n=this.bqSeqAt(st,day8)+1;
      return {bqSeq:{...(st.bqSeq||{}),[day8]:n},
        bqNo:{...(st.bqNo||{}),[k]:{no:'CS-'+day8+'-'+String(n).padStart(3,'0'),sig:sig,ts:ts}}}; }); }
  // Xac nhan da nhan = to giay do khep lai. Lan giao sau cua cung o phai la to
  // moi, nen tra ma ve; bo dem chi tang nen so cu khong bao gio duoc dung lai.
  bqNoRelease(r,day){ const k=this.bqNoKey(r,day);
    this.setState(st=>{ const m={...(st.bqNo||{})}; delete m[k]; return {bqNo:m}; }); }
  // Class tren <body> de @media print chi in ra to phieu -- dung chung voi
  // phieu ban giao cua Daily Sewing Output (xem style.css, bg-slip-open)
  bSlipOpen(r,d){ this.bqNoIssue(r,d); this.set({bslip:{rid:r.id,day:d}});
    document.body.classList.add('bg-slip-open'); }
  bSlipClose(){ this.set({bslip:null}); document.body.classList.remove('bg-slip-open'); }
  // Xac nhan tren phieu = dao trang thai Cho nhan -> Da nhan roi dong phieu
  bSlipReceive(){ const s=this.state.bslip; if(!s) return;
    const r=this.getWeek().rows.find(x=>x.id===s.rid);
    if(r){ this.bqNoRelease(r,s.day); this.cycleStatus(r,s.day); }
    this.bSlipClose(); }
  // 'DD/MM/YYYY HH:mm' -- NGAY lay tu dung ngay trong tuan dang xem, GIO lay
  // tu moc phat hanh to phieu (ts). Khong co ts thi chi tra ve ngay.
  bSlipDate(day,ts){ const st=this.psWeekRange(this.state.week)[0], i=this.DAYS.indexOf(day);
    const d=new Date(st.getFullYear(),st.getMonth(),st.getDate()+(i<0?0:i));
    const p=n=>String(n).padStart(2,'0');
    const s=p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear();
    if(!ts) return s;
    const t=new Date(ts);
    return s+' '+p(t.getHours())+':'+p(t.getMinutes()); }
  // PO lay tu tac nghiep cat cua ma hang; nhieu PO thi ghep lai
  bSlipPo(style){ const ps=(this.khcPlansFor(style)||[]).map(p=>String(p.qrPo||'').trim()).filter(Boolean);
    return [...new Set(ps)].join(' / '); }
  bSlipData(){ const s=this.state.bslip; if(!s) return null;
    const rows=this.getWeek().rows, ri=rows.findIndex(x=>x.id===s.rid), r=rows[ri];
    if(!r) return null;
    const cell=this.bcellAt(s.rid,s.day); if(!cell) return null;
    const cat=this.cutTurns(r.style);
    const turns=(cell.turns||[]).map(id=>cat.find(t=>t.id===id)).filter(Boolean);
    const qty=cell.qty||{};
    // 1 dong / 1 co. Cot BAN = cac luot cat co cat co do (khop cach ghi tay
    // tren phieu giay: ban 3 - S - 121, ban 4 - XS - 121).
    const lines=this.SORDER.filter(z=>(Number(qty[z])||0)>0).map(z=>({
      size:z, qty:Number(qty[z])||0,
      tb:turns.filter(t=>(this.turnSizes(t)[z]||0)>0).map(t=>t.id).join(', ')
         ||(cell.turns||[]).join(', ')}));
    return {row:r,cell:cell,lines:lines,no:this.bqNoOf(r,s.day),
      color:this.bundleColor(r,ri), day:this.bSlipDate(s.day,this.bqTsOf(r,s.day)),
      brand:r.brand||'', line:String(r.line||'').replace(/^Line\s*/i,''),
      style:r.style||'', po:this.bSlipPo(r.style)}; }

  statusTag(st,o){ const h=React.createElement; o=o||{}; const c=this.STC[st]||this.STC.waiting;
    const style={display:'inline-flex',alignItems:'center',gap:o.sm?4:5,flex:'none',border:'1px solid '+c.bd,
      background:c.bg,color:c.fg,borderRadius:99,padding:o.lg?'4px 11px':(o.sm?'2px 7px 2px 5px':'2px 8px 2px 6px'),
      fontSize:o.lg?11.5:(o.sm?9:9.5),fontWeight:700,letterSpacing:o.sm?'0':'.3px',textTransform:'uppercase',
      lineHeight:1.3,whiteSpace:'nowrap',fontFamily:'inherit'};
    const kids=[h('span',{key:'d',style:{width:o.lg?7:(o.sm?5:6),height:o.lg?7:(o.sm?5:6),borderRadius:'50%',background:c.dot,flex:'none'}}),
      this.t(this.STKEY[st]||'stWaiting')];
    if(!o.onClick) return h('span',{style:style},kids);
    return h('button',{onClick:o.onClick,title:o.title||this.t('stCycleTip'),
      style:{...style,cursor:'pointer',transition:'background .12s,border-color .12s'}},kids); }

  reqDayCell(r,d,b,chosen,stripe,weekend){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const plan=r.days[d]; const hasPlan=plan!=null;
    const base={borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'top',padding:0};
    const restBg=stripe?'#f7f9f3':(weekend?'#fcfdfa':C.white);
    if(!hasPlan) return h('td',{key:d,style:{...base,background:'#f2f3f0'}});
    if(!chosen) return h('td',{key:d,style:{...base,background:restBg}},
      h('div',{style:{padding:'16px 8px',textAlign:'center',fontSize:10.5,color:'#b7bcb2',fontStyle:'italic'}},this.t('pickColorFirst')));
    const cell=b&&b.days&&b.days[d];
    const filled=cell&&cell.turns&&cell.turns.length&&(cell.sizes||[]).some(s=>(Number((cell.qty||{})[s])||0)>0);
    if(!filled) return h('td',{key:d,onClick:()=>this.openBForm(r.id,d),title:this.t('tipIssue'),style:{...base,cursor:'pointer',background:restBg}},
      h('div',{style:{margin:9,border:'1.5px dashed '+C.border,borderRadius:9,padding:'12px 6px',textAlign:'center',color:C.primary}},
        h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,style:{display:'block',margin:'0 auto'}},h('path',{d:'M12 5v14M5 12h14'})),
        h('div',{style:{fontSize:11,fontWeight:600,marginTop:4}},this.t('issue')),
        h('div',{style:{fontSize:9.5,color:C.faint,marginTop:2,fontFamily:mono}},this.t('planShort')+this.fmt(plan))));
    const sizes=(cell.sizes||[]).filter(s=>(Number((cell.qty||{})[s])||0)>0); const qty=cell.qty||{}; const turns=cell.turns||[];
    const tot=sizes.reduce((a,s)=>a+(Number(qty[s])||0),0);
    // Card an het o (full-bleed): vien cua o lam ranh, ben trong chia 2 dai 55/45
    // va can giua theo chieu doc de khong bi don cuc len tren.
    return h('td',{key:d,onClick:()=>this.openBForm(r.id,d),title:this.t('tipIssueEdit'),
      style:{...base,cursor:'pointer',background:C.white,height:1,verticalAlign:'top'}},
      h('div',{style:{height:'100%',minHeight:74,boxSizing:'border-box',display:'flex',flexDirection:'column'}},
        // dai 1 (55%): trang thai (bam de dao vong) + tong so luong
        h('div',{style:{flex:'55 1 0',minHeight:0,display:'flex',alignItems:'center',justifyContent:'space-between',
          gap:6,padding:'0 10px'}},
          this.statusTag(this.cellStatus(cell),{sm:true,onClick:ev=>this.bStatusTap(r,d,ev),
            title:this.cellStatus(cell)==='waiting'?this.t('bqOpenTip'):undefined}),
          h('span',{style:{fontSize:19,fontWeight:700,fontFamily:mono,color:C.ink,lineHeight:1,flex:'none',
            letterSpacing:'-.4px'}},this.fmt(tot))),
        // dai 2 (45%): Cut turn: C1 C2
        h('div',{style:{flex:'45 1 0',minHeight:0,display:'flex',alignItems:'center',flexWrap:'wrap',gap:4,
          padding:'0 10px',borderTop:'1px solid '+C.line,background:'#fbfcf8'}},
          h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.3px',color:C.faint,flex:'none'}},this.t('cCutTurn')),
          turns.map(t=>h('span',{key:t,style:{fontSize:11.5,fontWeight:700,color:'#fff',background:C.primary,
            borderRadius:5,padding:'1px 7px',lineHeight:1.35,flex:'none'}},t)))));
  }

  renderBForm(){
    const f=this.state.bform; if(!f) return null;
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const row=this.getWeek().rows.find(r=>r.id===f.id); if(!row) return null;
    const b=this.bAt(f.id)||{color:''};
    const dates=this.weekDates(); const di=this.DAYS.indexOf(f.day);
    const quantity=Number(row.days[f.day])||0; const style=row.style;
    const pos=f.pos||[]; const posSet={}; pos.forEach(k=>posSet[k]=1);
    const tq=this.posTq(row.style,pos); const selIds=this.posTurns(row.style,pos);
    const cat=this.cutTurns(style);
    const tcols=this.SORDER.filter(s=> cat.some(t=>this.turnSizes(t)[s]));
    // Cot size tach theo tung vi tri tren so do cat: size co ti le 2 -> 2 cot (S1, S2),
    // moi cot hien SO LOP. VD 28 lop, S ti le 2 -> S1 28 + S2 28 = 56 pcs.
    const ratMax={};
    cat.forEach(t=>{ const r=this.parseMarker(t.marker);
      this.SORDER.forEach(s=>{ const v=Number(r[s])||0; if(v>(ratMax[s]||0)) ratMax[s]=v; }); });
    const scols=[]; this.SORDER.forEach(s=>{ const m=ratMax[s]||0;
      for(let k=1;k<=m;k++) scols.push({s:s,k:k,label:m>1?(s+k):s}); });
    const scolLy=(t,c)=>((Number(this.parseMarker(t.marker)[c.s])||0)>=c.k)?(Number(t.layers)||0):0;
    const avail=this.sumTurns(selIds,style);
    const grand=this.tqTotals(tq);
    const hasTurns=selIds.length>0;
    const needTotal=this.SORDER.reduce((a,s)=>a+(grand[s]||0),0);
    const availTotal=this.SORDER.reduce((a,s)=>a+(avail[s]||0),0);
    const sizeCount=this.SORDER.filter(s=>(grand[s]||0)>0).length;
    const canSave=hasTurns&&needTotal>0; const editing=!!(b.days&&b.days[f.day]);
    const curSt=this.bformStatus(); const RC=this.STC.received; const WC=this.STC.waiting;
    const used=this.bformUsedPos();
    // Mau cat hieu luc (ke ca mau tu dong) -- no quyet dinh scope cua bang luot cat
    const effColor=this.bundleColor(row,this.getWeek().rows.findIndex(r=>r.id===f.id));
    const check=(on,sz)=>h('span',{style:{width:(sz||16),height:(sz||16),borderRadius:5,flex:'none',border:'1.5px solid '+(on?C.primary:'#c7ccc2'),background:on?C.primary:C.white,display:'flex',alignItems:'center',justifyContent:'center'}}, on?h('svg',{width:(sz?sz-6:11),height:(sz?sz-6:11),viewBox:'0 0 24 24',fill:'none',stroke:'#fff',strokeWidth:3.5},h('path',{d:'M5 12l4 4 10-10'})):null);
    const info=(label,val,o)=>{ o=o||{}; return h('div',{style:{flex:o.hl?'1.15 1 0':'1 1 0',minWidth:0,border:'1px solid '+(o.hl?C.primary:C.border),borderRadius:10,padding:'9px 14px',background:o.hl?C.tint:C.white}},
      h('div',{style:{fontSize:10,fontWeight:700,letterSpacing:'.5px',color:o.hl?C.dark:C.faint,marginBottom:4}},label),
      h('div',{style:{display:'flex',alignItems:'center',gap:7,fontSize:16,fontWeight:700,color:o.hl?C.dark:C.ink,fontFamily:o.mono?mono:'inherit',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},
        o.dot?h('span',{style:{width:11,height:11,borderRadius:'50%',background:C.primary,flex:'none',border:'1px solid rgba(0,0,0,.1)'}}):null, val)); };
    const stepHead=(n,title,hint)=>h('div',{style:{display:'flex',alignItems:'center',gap:10,margin:'0 0 12px'}},
      h('span',{style:{width:25,height:25,borderRadius:'50%',background:C.primary,color:'#fff',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},n),
      h('span',{style:{fontSize:15,fontWeight:700,color:C.ink}},title),
      hint?h('span',{style:{fontSize:12,color:C.faint}},'· '+hint):null);
    const tTh={padding:'9px 6px',textAlign:'center',fontSize:11.5,fontWeight:700,letterSpacing:'.3px',textTransform:'uppercase',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line};
    const tTd={padding:'9px 6px',textAlign:'center',fontSize:12.5,fontFamily:mono,borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line};
    // Bang luot cat trinh bay giong panel tac nghiep cat: LUOT CAT / SO LOP / cac size / TONG PCS / TEM
    const sgc='150px 70px repeat('+(scols.length||1)+',minmax(46px,1fr)) 92px 56px';
    const turnHead=h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:8,padding:'9px 16px',
      borderBottom:'1px solid '+C.line,borderLeft:'3px solid transparent',background:'#f8faf3',fontSize:10,fontWeight:700,letterSpacing:'.6px',color:C.faint,alignItems:'end'}},
      h('div',null,this.t('kcTb')), h('div',null,this.t('kcLy')),
      scols.map(c=>h('div',{key:c.s+'-'+c.k,style:{textAlign:'center',fontFamily:mono,fontSize:11,color:C.sub}},c.label)),
      h('div',{style:{textAlign:'right'}},this.t('kcPcs')),
      h('div',{style:{textAlign:'right'}},this.t('kcTagN')));
    const turnRows=cat.map((t,ti)=>{
      const tpos=this.turnPos(t);
      const nOn=tpos.filter(p=>posSet[p.key]).length, on=nOn>0;
      const held=tpos.filter(p=>used[p.key]);
      // ca luot chi coi la het khi MOI vi tri da bi o khac giu
      // held[] la cac VI TRI; chu (line/day) nam trong map used[] theo key vi tri
      const tk=(!on&&tpos.length>0&&held.length===tpos.length)?used[held[0].key]:null;
      const ts=this.turnSizes(t), rat=this.parseMarker(t.marker);
      const tags=Object.keys(rat).reduce((a,s)=>a+(Number(rat[s])||0),0);
      // TONG PCS / TEM tinh theo phan DANG CHON cua luot nay, chua chon thi hien ca luot
      const pcs=on?nOn*(Number(t.layers)||0):this.SORDER.reduce((a,s)=>a+(Number(ts[s])||0),0);
      const tagsShown=on?nOn:tags;
      const dim=tk?'#c3c8bf':null;
      return h('div',{key:t.id,className:tk?'':'turn-pick',title:tk?this.t('mTakenTip'):'',
        onClick:tk?null:()=>this.toggleTurnAll(t.id),
        style:{display:'grid',gridTemplateColumns:sgc,gap:8,alignItems:'center',padding:'10px 16px',
          borderBottom:ti<cat.length-1?'1px solid '+C.line:'none',
          borderLeft:'3px solid '+(on?C.primary:'transparent'),
          background:on?C.tint:(tk?'#f6f7f4':C.white),
          cursor:tk?'not-allowed':'pointer',transition:'background .1s'},
        'style-hover':tk?{}:{background:on?C.tint:C.tint2}},
        h('div',{style:{display:'flex',alignItems:'center',gap:9,minWidth:0}},
          tk? h('span',{style:{width:16,height:16,borderRadius:5,flex:'none',border:'1.5px dashed #cfd3c9',background:'#f1f2ef'}}) : check(on),
          h('span',{style:{fontSize:15.5,fontWeight:700,fontFamily:mono,color:dim||(on?C.primary:C.dark)}},t.id),
          tk? h('span',{style:{fontSize:9,fontWeight:700,letterSpacing:'.2px',color:WC.fg,background:WC.bg,
            border:'1px solid '+WC.bd,borderRadius:99,padding:'1px 7px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},
            String(tk.line||'')+' \u00b7 '+String(tk.day||'').toUpperCase()):null),
        h('div',{style:{fontSize:14,fontFamily:mono,fontWeight:600,color:dim||C.ink}},t.layers),
        scols.map(c=>{ const ly=scolLy(t,c);
          if(!ly) return h('div',{key:c.s+'-'+c.k,style:{textAlign:'center',fontSize:13,fontFamily:mono,color:'#e0e4da'}},'\u00b7');
          const pk=this.posKey(t.id,c.s,c.k), on=!!posSet[pk], hold=used[pk];
          const bg=on?C.primary:(hold?'#f1f2ef':C.white);
          return h('button',{key:c.s+'-'+c.k,
            title:hold?(this.t('mTakenTip')+' \u2014 '+hold.line+' \u00b7 '+hold.day.toUpperCase()):this.t('mPickPos'),
            onClick:ev=>{ ev.stopPropagation(); if(!hold) this.togglePos(pk); },
            style:{width:'100%',padding:'6px 0',borderRadius:8,fontFamily:mono,fontSize:12.5,fontWeight:700,
              border:'1px solid '+(on?C.primary:(hold?'#e2e5dd':C.border)),background:bg,
              color:on?'#fff':(hold?'#b9bfb2':C.ink),cursor:hold?'not-allowed':'pointer',
              transition:'background .12s,border-color .12s'}},
            hold?'\u00d7':this.fmtn(ly)); }),
        h('div',{style:{textAlign:'right',fontSize:14.5,fontFamily:mono,fontWeight:700,color:dim||C.dark}},this.fmtn(pcs)),
        h('div',{style:{textAlign:'right',fontSize:13,fontFamily:mono,fontWeight:700,color:dim||C.primary}},tagsShown));
    });
    // Dong tong nam cuoi, thang cot size -- chi tinh cac luot dang chon
    const turnSum=h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:8,padding:'10px 16px',
      alignItems:'center',background:C.dark,borderTop:'1px solid '+C.line,borderLeft:'3px solid transparent'}},
      h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:'#dcefad',whiteSpace:'nowrap'}},this.t('mIssueRow')),
      h('div',null,''),
      scols.map(c=>{ let v=0; cat.forEach(t2=>{ if(posSet[this.posKey(t2.id,c.s,c.k)]) v+=Number(t2.layers)||0; });
        return h('div',{key:c.s+'-'+c.k,style:{textAlign:'center',fontSize:13,fontFamily:mono,fontWeight:700,
          color:v?'#fff':'rgba(255,255,255,.35)'}},v?this.fmtn(v):'-'); }),
      h('div',{style:{textAlign:'right',fontSize:14.5,fontFamily:mono,fontWeight:700,color:'#fff'}},this.fmtn(needTotal)),
      h('div',null,''));
    const turnTable = h('div',{style:{border:'1px solid '+C.border,borderRadius:10,overflow:'hidden'}},
      h('div',{style:{overflowX:'auto'}},
        h('div',{style:{minWidth:(408+(scols.length*50))+'px'}},
          turnHead, ...turnRows, turnSum)));
    const qtyUnit=(tid,sz)=>{ const {cap,step}=this.turnCap(style,tid,sz); const capM=Math.floor(cap/step)*step;
      const m=tq[tid]||{}; const picked=Object.prototype.hasOwnProperty.call(m,sz); const need=Number(m[sz])||0; const full=need>=capM&&capM>0; const ratio=capM>0?Math.min(1,need/capM):0;
      const stc= ratio>=1?C.primary : ratio>0?'#c99a1e':'#cfd3c9';
      const btn=(lbl,dir,dis)=>h('button',{onClick:e=>{e.stopPropagation();this.adjSize(tid,sz,dir);},disabled:dis,style:{width:34,border:'none',background:dis?'#f1f2ef':C.tint2,color:dis?'#c7cabf':C.primary,cursor:dis?'default':'pointer',fontSize:19,fontWeight:700,fontFamily:'inherit',padding:'7px 0',lineHeight:1}},lbl);
      return h('div',{key:sz,style:{width:140,border:'1.5px solid '+(picked?C.primary:C.border),borderRadius:11,overflow:'hidden',background:picked?C.white:'#fbfcfa'}},
        h('button',{onClick:()=>this.togglePickSize(tid,sz),style:{display:'flex',width:'100%',alignItems:'center',justifyContent:'space-between',padding:'7px 10px',background:picked?C.tint:'#f4f6f0',border:'none',cursor:'pointer',fontFamily:'inherit'}},
          h('span',{style:{display:'flex',alignItems:'center',gap:7}}, check(picked,15), h('span',{style:{fontSize:13.5,fontWeight:700,color:C.ink}},sz)),
          h('span',{style:{fontSize:10,fontWeight:600,color:C.faint,fontFamily:mono}},'+'+this.fmt(step))),
        picked? h('div',null,
          h('div',{style:{display:'flex',alignItems:'center',borderTop:'1px solid '+C.line}},
            btn('−',-1,need<=0),
            h('input',{type:'number',min:0,max:capM,step:step,value:need,onClick:e=>e.stopPropagation(),onChange:e=>this.setSizeQty(tid,sz,e.target.value),style:{flex:1,minWidth:0,width:'100%',border:'none',borderLeft:'1px solid '+C.line,borderRight:'1px solid '+C.line,textAlign:'center',fontSize:16,fontWeight:700,fontFamily:mono,color:C.ink,padding:'7px 0',background:C.white}}),
            btn('+',1,full)),
          h('div',{style:{padding:'7px 10px 8px',background:C.offBg,borderTop:'1px solid '+C.line}},
            h('div',{style:{height:5,borderRadius:3,background:'#e6e9e1',overflow:'hidden'}}, h('div',{style:{height:'100%',width:(ratio*100)+'%',background:stc,borderRadius:3,transition:'width .25s ease'}})),
            h('div',{style:{fontSize:10,fontWeight:700,fontFamily:mono,textAlign:'center',marginTop:5,color:C.sub}}, this.fmt(need)+' / '+this.fmt(cap))))
        : h('div',{onClick:()=>this.togglePickSize(tid,sz),style:{fontSize:10.5,fontWeight:600,textAlign:'center',padding:'13px 0',color:'#9aa093',cursor:'pointer'}}, this.t('left')+this.fmt(cap))); };
    const turnRow=(tid)=>{ const t=cat.find(x=>x.id===tid); if(!t) return null; const rs=this.parseMarker(t.marker); const sizes=this.SORDER.filter(s=>rs[s]);
      const sub=Object.keys(tq[tid]||{}).reduce((a,s)=>a+(Number((tq[tid]||{})[s])||0),0);
      return h('div',{key:tid,style:{border:'1px solid '+C.border,borderRadius:12,padding:'13px 15px 15px',marginBottom:12,background:C.white}},
        h('div',{style:{display:'flex',alignItems:'center',gap:11,marginBottom:12,flexWrap:'wrap'}},
          h('span',{style:{fontSize:14,fontWeight:700,color:'#fff',background:C.primary,borderRadius:8,padding:'4px 13px'}},tid),
          h('span',{style:{fontSize:13.5,fontWeight:600,fontFamily:mono,color:C.ink}},t.marker),
          h('span',{style:{fontSize:13,fontWeight:600,color:C.sub}},t.layers+' '+this.t('plies')),
          h('div',{style:{flex:1}}),
          h('span',{style:{fontSize:12.5,fontWeight:700,fontFamily:mono,color:sub>0?C.primary:C.faint}},'Σ '+this.fmt(sub))),
        h('div',{style:{display:'flex',flexWrap:'wrap',gap:10}}, sizes.map(sz=>qtyUnit(tid,sz)))); };
    const gcols=this.SORDER.filter(s=>avail[s]>0);
    const totalsBar = h('div',{style:{border:'1px solid '+C.border,borderRadius:10,overflow:'hidden',marginTop:6}},
      h('table',{style:{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('colgroup',null, h('col',{style:{width:'150px'}}), ...gcols.map((s,i)=>h('col',{key:i})), h('col',{style:{width:'62px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...tTh,textAlign:'left',paddingLeft:14,color:C.sub,background:'#f8faf3'}},this.t('mBySize')),
          gcols.map(s=>h('th',{key:s,style:{...tTh,color:C.dark,background:'#f8faf3'}},s)),
          h('th',{style:{...tTh,color:'#fff',background:C.dark,borderRight:'none'}},'\u03a3'))),
        h('tbody',null,
          h('tr',null,
            h('td',{style:{padding:'9px 14px',borderRight:'1px solid '+C.line,fontSize:11.5,fontWeight:700,color:C.dark}},this.t('mNeeded')),
            gcols.map(s=>h('td',{key:s,style:{...tTd,fontWeight:700,color:grand[s]?C.dark:'#d3d7cd'}}, this.fmt(grand[s]||0))),
            h('td',{style:{...tTd,fontWeight:700,borderRight:'none',color:C.primary}},this.fmt(needTotal))),
          h('tr',null,
            h('td',{style:{padding:'9px 14px',borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line,fontSize:11.5,fontWeight:700,color:C.sub}},this.t('mCuttable2')),
            gcols.map(s=>h('td',{key:s,style:{...tTd,color:avail[s]?C.sub:'#d3d7cd'}}, this.fmt(avail[s]||0))),
            h('td',{style:{...tTd,borderRight:'none',color:C.sub}},this.fmt(availTotal))))));
    return h('div',{onClick:()=>this.set({bform:null}),ref:el=>{ if(el&&window.anime&&el.dataset.a!=='1'){el.dataset.a='1';window.anime({targets:el,opacity:[0,1],duration:200,easing:'easeOutQuad'});} },style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:60,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),ref:el=>{ if(el&&window.anime&&el.dataset.a!=='1'){el.dataset.a='1';window.anime({targets:el,opacity:[0,1],translateY:[16,0],scale:[.98,1],duration:340,easing:'easeOutCubic'});} },style:{width:'min(1480px,96vw)',height:'min(960px,93vh)',display:'flex',flexDirection:'column',overflow:'hidden',background:C.white,borderRadius:16,boxShadow:'0 30px 70px rgba(0,0,0,.32)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:13,padding:'17px 24px',borderBottom:'1px solid '+C.line,flex:'none'}},
          h('div',{style:{width:38,height:38,borderRadius:10,background:C.tint,color:C.primary,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},
            h('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9},h('rect',{x:3,y:3,width:18,height:18,rx:2}),h('path',{d:'M3 9h18M9 21V9'}))),
          h('div',{style:{flex:1,minWidth:0}},h('div',{style:{fontSize:18,fontWeight:700}},this.t('mTitle')),
            h('div',{style:{fontSize:12.5,color:C.faint,marginTop:2}},this.normName(row.line)+' · '+f.day.toUpperCase()+' '+dates[di]+' · '+this.state.week)),
          editing? this.statusTag(curSt,{lg:true}) : null,
          h('button',{onClick:()=>this.set({bform:null}),style:{border:'1px solid '+C.border,background:C.white,cursor:'pointer',color:C.sub,padding:8,borderRadius:9,display:'flex'}},h('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M18 6 6 18M6 6l12 12'})))),
        h('div',{className:'yscroll',style:{flex:1,overflow:'auto',padding:'18px 24px 20px'}},
          h('div',{style:{display:'flex',gap:11,marginBottom:20}},
            info(this.t('colBrand'),row.brand),info(this.t('colStyle'),row.style,{mono:true}),info(this.t('mColor'),effColor||'—',{dot:!!effColor}),info(this.t('mPlan'),this.fmt(quantity),{hl:true,mono:true})),
          h('div',{style:{display:'flex',alignItems:'center',gap:7,margin:'0 0 9px',fontSize:11.5,color:C.faint}},
            h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,style:{flex:'none'}},h('circle',{cx:12,cy:12,r:9}),h('path',{d:'M12 8h.01M11 12h1v4h1'})),
            this.t('mTurnPool')),
          turnTable),
        h('div',{style:{display:'flex',alignItems:'center',gap:14,padding:'14px 24px',borderTop:'1px solid '+C.line,background:'#f8faf3',flex:'none'}},
          editing? h('button',{onClick:()=>this.clearBForm(),style:{...this.btn('ghost'),color:'#c0392b',borderColor:'#eccfca'}},this.t('mClear')):null,
          h('div',{style:{display:'flex',flexDirection:'column',gap:1}},
            h('span',{style:{fontSize:13.5,fontWeight:700,color:canSave?C.ink:C.faint}}, hasTurns? (this.t('mIssue')+' '+this.fmt(needTotal)+' / '+this.fmt(availTotal)+' pcs') : this.t('mNoTurnSel')),
            hasTurns? h('span',{style:{fontSize:11.5,color:C.faint}}, selIds.length+' '+this.t('mTurns')+' · '+sizeCount+' '+this.t('mSizes')):null),
          h('div',{style:{flex:1}}),
          h('button',{onClick:()=>this.set({bform:null}),style:this.btn('ghost')},this.t('mCancel')),
          editing? h('button',{onClick:()=>this.receiveBForm(),disabled:!canSave,title:this.t(curSt==='received'?'tipUnreceive':'tipReceive'),
            style:{...this.btn('ghost'),background:curSt==='received'?RC.bg:C.white,color:RC.fg,borderColor:curSt==='received'?RC.dot:RC.bd,opacity:canSave?1:.5,cursor:canSave?'pointer':'not-allowed'}},
            h('span',{style:{width:7,height:7,borderRadius:'50%',background:RC.dot,flex:'none'}}), this.t('mReceived')):null,
          h('button',{onClick:()=>this.saveBForm(),disabled:!canSave,style:{...this.btn('primary'),opacity:canSave?1:.5,cursor:canSave?'pointer':'not-allowed'}}, editing?this.t('mUpdate'):this.t('mSave')))));
  }

  WIPSEED = {}; // không dùng số liệu giả — A lấy tổng tác nghiệp thật, còn lại nhập tay

  wipKey(r){ return this.state.week+'|'+r.id; }
  orderTotalFor(r){ const ln=this.normName(r.line);
    const cap=this.CAP.find(c=>this.normName(c.line)===ln&&c.brand===r.brand&&c.style===r.style);
    const plans=this.khcPlansFor(r.style); if(!plans.length) return 0;
    let pl=plans[0];
    if(plans.length>1&&cap){ const pd=String(cap.po).replace(/\D/g,'');
      const hit=plans.find(p=>{ const q=p.qrPo.replace(/\D/g,''); return q&&pd&&(q===pd||pd.indexOf(q)>=0||q.indexOf(pd)>=0); }); if(hit) pl=hit; }
    return pl.sections.filter(s=>s.grp!=='aux').reduce((a,s)=>a+s.total,0); }
  planNext(r){
    // SUMIFS: tổng cột TOTAL của Kế Hoạch May tuần này, khớp LINE + BRAND + STYLE
    const ln=this.normName(r.line);
    const q=this.getWeek().rows
      .filter(x=>this.normName(x.line)===ln && (x.brand||'')===(r.brand||'') && (x.style||'')===(r.style||''))
      .reduce((a,x)=>a+this.rowTotal(x),0);
    return {qty:Math.round(q),est:q===0}; }
  wipVals(r,idx){
    const ov=(this.state.wip||{})[this.wipKey(r)]||{}; const seed=this.WIPSEED[this.bdKey(r.line,r.brand,r.style)]; let base;
    if(seed) base={a:seed[0],b:seed[1],c:seed[2],d:seed[3],remark:seed[4]||''};
    else { const nd=this.DAYS.filter(d=>r.days[d]!=null).length||1; const daily=Math.round(this.rowTotal(r)/nd)||0;
      base={a:this.orderTotalFor(r)||0,b:daily*2,c:Math.round(daily*1.8),d:daily,remark:''}; }
    const v={...base,...ov};
    const planTot=this.orderTotalFor(r)||this.psOrderQty(r)||0;
    const a=planTot||(Number(v.a)||0), b=Number(v.b)||0, c=Number(v.c)||0, d=Number(v.d)||0;
    const f=this.planNext(r); const e=Math.max(0,d-b+c);
    const left=Math.max(0,a-b);
    return {a,b,c,d,wip:b-c,e,f:f.qty,fEst:f.est,need:Math.max(0,(e+f.qty)>left?left:(e+f.qty)),remark:v.remark||''};
  }
  setWip(r,field,val){ const k=this.wipKey(r); const v=field==='remark'?val:Math.max(0,parseInt(String(val).replace(/[^0-9-]/g,''),10)||0);
    this.setState(s=>({wip:{...s.wip,[k]:{...((s.wip||{})[k]||{}),[field]:v}}})); }
  needTotal(){ return this.getWeek().rows.reduce((a,r,i)=>a+this.wipVals(r,i).need,0); }
  wkRange(){ const M={Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
    const ds=this.weekDates(); const yr=(this.state.week.split(' · ')[0].split(' ')[1])||'2026';
    const f=s=>{ const p=String(s).split('-'); return String(p[0]).padStart(2,'0')+'/'+(M[p[1]]||'07'); };
    return f(ds[0])+' – '+f(ds[ds.length-1])+'/'+yr; }

  exportExcel(){
    const X=window.XLSX;
    if(!X){ window.alert('Thư viện Excel chưa tải xong — thử lại sau vài giây.'); return; }
    const rows=this.getWeek().rows, dates=this.weekDates(), wk=this.state.week;
    const fac=['Nhà máy (Factory)','YIC Hà Nam'], wkr=['Tuần (Week)',this.wkRange()];
    const dayHead=this.DAYS.map((d,i)=>d.toUpperCase()+' '+dates[i]);
    const wb=X.utils.book_new();
    const add=(name,aoa,cols)=>{ const ws=X.utils.aoa_to_sheet(aoa); ws['!cols']=cols.map(w=>({wch:w})); X.utils.book_append_sheet(wb,ws,name); };

    const a1=[['WEEKLY SEWING SCHEDULE'],fac,wkr,[],['LINE','BRAND','STYLE #',...dayHead,'TOTAL']];
    rows.forEach(r=>a1.push([this.normName(r.line),r.brand,r.style,...this.DAYS.map(d=>r.days[d]!=null?Number(r.days[d]):null),this.rowTotal(r)]));
    a1.push(['TOTAL','','',...this.DAYS.map(d=>this.colTotal(rows,d)),this.grand(rows)]);
    add('Sewing Schedule',a1,[12,12,16,...this.DAYS.map(()=>11),11]);

    const V=rows.map((r,i)=>this.wipVals(r,i)); const S=f=>V.reduce((a,v)=>a+v[f],0);
    const a2=[['WEEKLY CUTTING BUNDLE DEMAND'],fac,wkr,[],
      ['LINE','BRAND','STYLE #','A · TỔNG CẮT CỦA ĐƠN','B · TỔNG WIP ĐÃ CẤP','C · OUTPUT RA CHUYỀN','B−C · WIP TỒN CUỐI TUẦN','D · 1 NGÀY WIP','E · WIP CẦN GỐI','F · SL DỰ KIẾN TUẦN SAU','SỐ LƯỢNG CẦN CẤP']];
    rows.forEach((r,i)=>{ const v=V[i]; a2.push([this.normName(r.line),r.brand,r.style,v.a,v.b,v.c,v.wip,v.d,v.e,v.f,v.need]); });
    a2.push(['TOTAL','','',S('a'),S('b'),S('c'),S('wip'),'',S('e'),S('f'),S('need')]);
    add('Bundle Demand',a2,[12,12,16,15,14,14,15,12,13,15,15]);

    const a3=[['WEEKLY BUNDLE REQUEST'],fac,wkr,[],['LINE','STYLE #','MÀU CẮT',...dayHead,'TỔNG']];
    rows.forEach(r=>{ const b=this.state.bundle[this.bKey(r)]||{};
      a3.push([this.normName(r.line),r.style,b.color||'',
        ...this.DAYS.map(d=>{ const c=b.days&&b.days[d]; if(!c||!(c.sizes||[]).length) return ''; const q=c.qty||{};
          return (c.turns||[]).join('+')+' | '+c.sizes.map(s=>s+' '+(Number(q[s])||0)).join(' · '); }),
        this.bundleTotal(r.id)||0]); });
    add('Bundle Request',a3,[12,16,18,...this.DAYS.map(()=>26),10]);

    X.writeFile(wb,('YIC-HaNam_'+wk).replace(/[^0-9A-Za-z]+/g,'-').replace(/-+$/,'')+'.xlsx');
  }

  renderDemandBody(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows;
    const pill=(label,val)=>h('div',{style:{border:'1px solid '+C.border,borderRadius:9,padding:'6px 13px',background:C.white}},
      h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},label),
      h('div',{style:{fontSize:13,fontWeight:700,color:C.ink,fontFamily:mono,marginTop:2,whiteSpace:'nowrap'}},val));
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle(), this.renderKpis(), this.renderTabs(),
      h('div',{ref:this.panelRef,style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow}},
        this.renderPeriodBar(),
        h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'16px 22px 14px',borderBottom:'1px solid '+C.line}},
          h('div',{style:{marginRight:'auto'}},
            h('div',{style:{fontSize:16,fontWeight:700}},this.t('demandTitle')),
            h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('demandSub')+' · '+this.state.week)),
          pill(this.t('factory'),'YIC Hà Nam'),
          h('button',{style:this.btn('ghost'),title:this.t('exportTip'),onClick:()=>this.exportExcel()},this.ic('grid'),this.t('exportXls'))),
        h('div',{style:{padding:'16px 16px 18px'}},
          rows.length? this.renderDemandGrid() : h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty')))));
  }

  renderDemandGrid(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows; const spans=this.lineSpans(rows); const pad=this.dense?'7px 5px':'9px 5px';
    const e=this.state.edit; const ed=(id,col)=>e&&e.id===id&&e.col===col;
    const commit=fn=>({onBlur:ev=>{fn(ev.target.value);this.stopEdit();},onKeyDown:ev=>{if(ev.key==='Enter'){fn(ev.target.value);this.stopEdit();}else if(ev.key==='Escape')this.stopEdit();}});
    const inp={width:'100%',border:'2px solid '+C.primary,padding:pad,fontSize:13,fontFamily:mono,fontWeight:700,color:C.ink,background:C.white,textAlign:'center'};
    const cb={borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'middle'};
    const gh={padding:'7px 8px',fontSize:10.5,fontWeight:700,letterSpacing:'.7px',textTransform:'uppercase',textAlign:'center',color:'#fff',background:C.dark,borderRight:'1px solid rgba(255,255,255,.22)'};
    const th={padding:'7px 5px',fontSize:10,fontWeight:700,letterSpacing:'.3px',textTransform:'uppercase',color:C.sub,textAlign:'center',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,background:'#f8faf3',verticalAlign:'middle',lineHeight:1.3};
    const hc=(label,o)=>{ o=o||{}; return h('th',{key:label,title:o.title,style:{...th,...(o.style||{})}},label); };
    const T=f=>rows.reduce((a,r,i)=>a+this.wipVals(r,i)[f],0);
    let grp=-1;
    const body=rows.map((r,idx)=>{
      const li=spans[idx]; if(li.first) grp++; const stripe=grp%2===1; const rbg=stripe?'#f7f9f3':C.white; const calcBg=stripe?'#f0f2ec':'#fafbf7';
      const v=this.wipVals(r,idx);
      const man=(field,val,warn)=>{ const col='w'+field;
        if(ed(r.id,col)) return h('td',{key:field,style:{...cb,padding:0,background:C.tint}},
          h('input',Object.assign({type:'number',autoFocus:true,defaultValue:val,style:inp},commit(x=>this.setWip(r,field,x)))));
        return h('td',{key:field,onClick:()=>this.startEdit(r.id,col),title:this.t('tipManual'),
          style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:13,fontWeight:600,cursor:'pointer',color:warn?'#c0392b':C.ink,background:warn?'#fdeceb':rbg}},this.fmt(val)); };
      const calc=(k,val,title)=>h('td',{key:k,title:title,style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:12.5,fontWeight:val?600:400,color:val?C.sub:'#c3c8bf',background:calcBg}},this.fmt(val));
      // Chi doc: gia tri lay tu tac nghiep cat / ke hoach, khong nhap tay
      const lock=(k,val,title)=>h('td',{key:k,title:title,style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:13,fontWeight:600,cursor:'default',opacity:.7,color:C.ink,background:calcBg}},this.fmt(val));
      const cells=[];
      if(li.first) cells.push(ed(r.id,'line')
        ? h('td',{key:'ln',rowSpan:li.span,style:{...cb,padding:0,background:C.tint}},
            h('input',Object.assign({list:'dl-line',autoFocus:true,defaultValue:this.normName(r.line),placeholder:this.t('phLine'),style:{...inp,fontSize:12}},commit(v=>this.renameGroup(li.ids,v)))),
            h('datalist',{id:'dl-line'}, this.lineOptions().map(n=>h('option',{key:n,value:n}))))
        : h('td',{key:'ln',rowSpan:li.span,title:this.t('tipPlanCol'),style:{...cb,padding:'8px 4px',textAlign:'center',verticalAlign:'middle',fontSize:12,fontWeight:700,cursor:'default',opacity:.7,color:C.primary,background:C.tint,lineHeight:1.25}},this.normName(r.line)));
      cells.push(h('td',{key:'br',title:this.t('lgPull'),style:{...cb,padding:pad,paddingLeft:9,textAlign:'left',fontSize:11.5,fontWeight:600,color:r.brand?C.ink:'#c3c8bf',background:rbg}},r.brand||'—'));
      cells.push(h('td',{key:'st',title:this.t('lgPull'),style:{...cb,padding:pad,paddingLeft:9,textAlign:'left',fontSize:11,fontFamily:mono,color:r.style?C.ink:'#c3c8bf',background:rbg,wordBreak:'break-all',lineHeight:1.3}},r.style||'—'));
      cells.push(lock('a',v.a,this.t('tipA'))); cells.push(man('b',v.b)); cells.push(man('c',v.c));
      cells.push(calc('wip',v.wip,this.t('tipBC')));
      cells.push(man('d',v.d,v.d===0));
      cells.push(calc('e',v.e,this.t('tipE')));
      cells.push(h('td',{key:'f',title:v.fEst?this.t('tipFEst'):this.t('tipF')+' · '+this.state.week,
        style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:13,fontWeight:600,color:C.primary,background:stripe?'#eef3e6':'#f5f9f0'}},this.fmt(v.f)));
      cells.push(h('td',{key:'need',title:this.t('dNeed')+' = '+this.t('tipNeed'),
        style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:15,fontWeight:700,color:v.need?C.dark:'#c3c8bf',background:v.need?C.tint:'#f4f5f2'}},this.fmt(v.need)));
      return h('tr',{key:r.id},cells);
    });
    return h('div',{style:{border:'1px solid '+C.border,borderRadius:12,overflow:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1070px',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('colgroup',null,
          h('col',{style:{width:'86px'}}),h('col',{style:{width:'88px'}}),h('col',{style:{width:'112px'}}),
          h('col',{style:{width:'96px'}}),h('col',{style:{width:'88px'}}),h('col',{style:{width:'92px'}}),h('col',{style:{width:'90px'}}),h('col',{style:{width:'78px'}}),
          h('col',{style:{width:'92px'}}),h('col',{style:{width:'98px'}}),h('col',{style:{width:'106px'}})),
        h('thead',null,
          h('tr',null,
            h('th',{colSpan:3,style:{...gh,background:'#f8faf3',borderRight:'1px solid '+C.line}},''),
            h('th',{colSpan:5,style:gh},this.t('grpWip')),
            h('th',{colSpan:3,style:gh},this.t('grpNext'))),
          h('tr',null,
            hc(this.t('colLine'),{style:{fontSize:11}}),
            hc(this.t('colBrand'),{style:{fontSize:11,textAlign:'left',paddingLeft:9}}),
            hc(this.t('colStyle'),{style:{fontSize:11,textAlign:'left',paddingLeft:9}}),
            hc(this.t('dA'),{title:'A · '+this.t('tipA')}),
            hc(this.t('dB'),{title:'B · '+this.t('tipB')}),
            hc(this.t('dC'),{title:'C · '+this.t('tipC')}),
            hc(this.t('dBC'),{title:this.t('tipBC')}),
            hc(this.t('dD'),{title:'D · '+this.t('tipD')}),
            hc(this.t('dE'),{title:this.t('tipE')}),
            hc(this.t('dF'),{title:'F · '+this.t('tipF')}),
            hc(this.t('dNeed'),{title:this.t('tipNeed'),style:{background:C.dark,color:'#fff',borderBottom:'2px solid '+C.dark}}))),
        h('tbody',null,body),
        h('tfoot',null,h('tr',null,
          h('td',{colSpan:3,style:{padding:'11px 12px',fontSize:11,fontWeight:700,letterSpacing:'.5px',color:'#cfe0be',background:C.dark}},this.t('colTotal')),
          ['a','b','c','wip','d','e','f'].map(f=>h('td',{key:f,style:{padding:'11px 5px',textAlign:'center',fontFamily:mono,fontSize:12.5,fontWeight:700,color:'#e6efdb',background:C.dark}},this.fmt(T(f)))),
          h('td',{style:{padding:'11px 5px',textAlign:'center',fontFamily:mono,fontSize:15,fontWeight:700,color:'#fff',background:C.dark}},this.fmt(T('need')))))));
  }

  // Dòng đặt năng lực cắt lấy trực tiếp từ Nhu Cầu BTP / Kế Hoạch May (chuyền + thương hiệu + mã hàng)
  capRows(){ const o=this.state.cap||{}; const seen={}, list=[];
    this.getWeek().rows.forEach(r=>{ if(!r.brand&&!r.style) return;
      const key=this.bdKey(r.line,r.brand,r.style); if(seen[key]) return; seen[key]=1;
      const sd=this.CAP.find(c=>this.bdKey(c.line,c.brand,c.style)===key)||{}; const id='cap:'+key;
      const bd=this.bundleIndex()[key]||{}; const base=Math.round(bd.need||0)||Math.round((bd.d||0)*3)||0;
      const r10=x=>Math.round(x/10)*10;
      list.push({...sd,id,brand:r.brand,style:r.style,line:this.normName(r.line),emb:sd.emb||'KHÔNG',
        cut:sd.cut||r10(base*1.3),iss:sd.iss||r10(base*1.05),turns:sd.turns||'',days:sd.days||[0,0,0,0,0,0],...(o[id]||{})}); });
    const ord=(this.state&&this.state.capOrder)||null; if(!ord) return list;
    const by={}; list.forEach(r=>{ by[r.id]=r; });
    const out=[]; ord.forEach(id=>{ if(by[id]){ out.push(by[id]); delete by[id]; } });
    list.forEach(r=>{ if(by[r.id]) out.push(r); });
    return out; }
  // PO lấy từ tác nghiệp cắt — khớp lượt cắt đã đặt cho dòng
  multFor(emb){ const s=this.state||{}; const v=emb?s.multEmb:s.multPlain; return v==null?(emb?6:3):v; }
  isOoo(r){ return /^out of order$/i.test(String(r.turns||'').trim()); }
  turnQty(style,k,po){ const cat=this.cutTurns(style,po)||[]; if(!cat.length) return 400;
    const t=cat[k%cat.length]; const ts=this.turnSizes(t);
    return Object.keys(ts).reduce((a,s)=>a+ts[s],0)||400; }
  allocTurns(){ const m={}; let n=1;
    this.capRows().forEach(r=>{ if(this.isOoo(r)){ m[r.id]=[]; return; }
      const need=Math.max(0,Math.round(this.capVals(r).out));
      const arr=[]; let sum=0,k=0;
      const cat=this.khcTurns(r.style,r.po);
      if(cat&&cat.length){ while(sum<need && k<cat.length){ const t=cat[k]; const q=Object.values(this.turnSizes(t)).reduce((a,x)=>a+x,0); arr.push({c:t.id,q:q}); sum+=q; k++; } }
      else { while(sum<need && k<40){ const q=this.turnQty(r.style,k,r.po); arr.push({c:'C'+(n++),q:q}); sum+=q; k++; } }
      m[r.id]=arr; });
    return m; }
  bdKey(line,brand,style){ const u=s=>String(s||'').toUpperCase().replace(/\s+/g,' ').trim();
    return this.normName(line)+'|'+u(brand)+'|'+u(style); }
  bundleIndex(){
    if(!this.state) return {};
    const sig=this.state.week+'|'+JSON.stringify(this.state.wip||{});
    if(this._bdSig===sig) return this._bd;
    const m={};
    this.getWeek().rows.forEach((r,i)=>{ const v=this.wipVals(r,i); const k=this.bdKey(r.line,r.brand,r.style);
      const c=m[k]||{d:0,need:0}; c.d+=v.d; c.need+=v.need; m[k]=c; });
    this._bdSig=sig; this._bd=m; return m;
  }
  capVals(r){
    const bd=this.bundleIndex()[this.bdKey(r.line,r.brand,r.style)];
    const wip1=bd?bd.d:(Number(r.wip1)||0);
    const sew=bd?bd.need:(Number(r.sew)||0);
    const rem=(Number(r.cut)||0)-(Number(r.iss)||0);
    const mult=this.multFor(r.emb==='THÊU');
    const ahead=wip1*mult;
    const ooo=this.isOoo(r);
    return {rem,mult,wip1,sew,linked:!!bd,ahead,out:Math.max(0,sew+ahead-rem),
      wk:this.capDays(r).reduce((a,x)=>a+(Number(x)||0),0),
      list:ooo?[]:(((this.state&&this.state.capTurns)||{})[r.id]||[]), ooo};
  }
  fmtn(n){ n=Number(n)||0; return n%1===0?n.toLocaleString('en-US'):n.toLocaleString('en-US',{maximumFractionDigits:1}); }
  capTotals(){ const T={cut:0,iss:0,rem:0,wip1:0,ahead:0,sew:0,out:0,tc:0,days:[0,0,0,0,0,0],wk:0};
    this.capRows().forEach(r=>{ const v=this.capVals(r);
      T.cut+=Number(r.cut)||0; T.iss+=Number(r.iss)||0; T.rem+=v.rem; T.wip1+=v.wip1;
      T.ahead+=v.ahead; T.sew+=v.sew; T.out+=v.out; T.tc+=v.list.length; T.wk+=v.wk;
      this.capDays(r).forEach((x,i)=>{ T.days[i]+=Number(x)||0; }); });
    return T; }

  DSO_TABS=[['cfg','dsotab1'],['prod','dsotab2'],['alert','dsotab3'],['mlv','dsotab4']];
  // Bang lich su chi cao toi da DSO_HIST_ROWS dong roi cuon TRONG bang, khong keo
  // dai trang. Tieu de dinh o tren nen cuon van doc duoc ten cot.
  // Chieu cao 1 dong KHAC nhau giua 2 bang (do thuc te tren Chrome): bang hoan thanh
  // co nut Giao sang hoan thien nen dong cao hon, bang loi chi co chip ly do.
  DSO_HIST_ROWS=6;
  DSO_ROW_H={done:45,def:37};
  dsoHistH(kind){ return this.DSO_HIST_ROWS*(this.DSO_ROW_H[kind]||38)+35; }
  DSO_SUBS=[['line','dsosub1'],['mtype','dsosub2'],['defect','dsosub3']];
  // Nhan KEY dich (khong nhan nhan da resolve) de nhan tu doi khi bam VI/EN.
  // sub=true -> preset nhe hon, giong segmented control trong renderPeriodBar.
  tabBar(items,cur,pick,sub){
    const h=React.createElement, C=this.C;
    const wrap=sub?{display:'inline-flex',gap:3,background:'#e9ece1',padding:3,borderRadius:10,marginBottom:16}
                  :{display:'inline-flex',gap:3,background:'#e7eadf',padding:4,borderRadius:12,marginBottom:20};
    return h('div',{style:wrap},
      items.map(([id,key])=>{ const a=cur===id;
        const st=sub?{border:'none',cursor:'pointer',padding:'5px 13px',fontSize:12.5,fontWeight:600,fontFamily:'inherit',color:a?C.dark:C.sub,background:a?'#fff':'transparent',borderRadius:8,boxShadow:a?'0 1px 2px rgba(24,36,14,.15)':'none',transition:'background .15s,color .15s'}
                    :{border:'none',cursor:'pointer',padding:'8px 18px',fontSize:13.5,fontWeight:600,fontFamily:'inherit',color:a?C.dark:C.sub,background:a?'#fff':'transparent',borderRadius:9,boxShadow:a?'0 1px 3px rgba(24,36,14,.14)':'none',transition:'background .15s,color .15s'};
        return h('button',{key:id,onClick:()=>pick(id),style:st},this.t(key)); }));
  }
  // ==== Cảnh báo (andon) của Daily Sewing Output ====
  // Ten cua tung canh bao la DU LIEU nguoi dung sua duoc, nen khong dua vao bang dich.
  DSO_ALERTS=['Máy hỏng','Mất điện nước','Lỗi kĩ thuật','Lỗi chất lượng','Cần cơ động','Đào tạo',
              'Trợ giúp chất lượng','Quản lý','Kim gãy','Lỗi khác','Lỗi phụ liệu','Phôi lỗi'];
  initAlerts(){ return this.DSO_ALERTS.map((n,i)=>({id:'a'+(i+1),name:n,snd:null})); }
  SND_MAX=20*1024*1024;

  // File am thanh nam trong IndexedDB (localStorage chi giu ten/kich co) -- blob am thanh
  // vuot xa gioi han ~5MB cua localStorage.
  IDB_NAME='yic.mes'; IDB_STORE='alertSound'; IDB_STORE2='mlvFile'; IDB_VER=2;
  idb(){ if(this._idbP) return this._idbP;
    this._idbP=new Promise((res,rej)=>{ const rq=window.indexedDB.open(this.IDB_NAME,this.IDB_VER);
      rq.onupgradeneeded=()=>{ const db=rq.result;
        if(!db.objectStoreNames.contains(this.IDB_STORE)) db.createObjectStore(this.IDB_STORE);
        if(!db.objectStoreNames.contains(this.IDB_STORE2)) db.createObjectStore(this.IDB_STORE2); };
      rq.onsuccess=()=>res(rq.result); rq.onerror=()=>rej(rq.error); });
    return this._idbP; }
  idbTx(mode,fn,store){ store=store||this.IDB_STORE;
    return this.idb().then(db=>new Promise((res,rej)=>{
    const tx=db.transaction(store,mode); const rq=fn(tx.objectStore(store));
    tx.oncomplete=()=>res(rq?rq.result:undefined); tx.onerror=()=>rej(tx.error); tx.onabort=()=>rej(tx.error); })); }
  sndPut(id,blob){ return this.idbTx('readwrite',st=>st.put(blob,id)); }
  sndGet(id){ return this.idbTx('readonly',st=>st.get(id)); }
  sndDel(id){ return this.idbTx('readwrite',st=>st.delete(id)); }
  sndClear(){ return this.idbTx('readwrite',st=>st.clear()).catch(()=>{}); }
  // File M-level: blob nam trong IndexedDB, localStorage chi giu ten/kich co
  mlvPut(k,blob){ return this.idbTx('readwrite',st=>st.put(blob,k),this.IDB_STORE2); }
  mlvDel(k){ return this.idbTx('readwrite',st=>st.delete(k),this.IDB_STORE2); }
  mlvClear(){ return this.idbTx('readwrite',st=>st.clear(),this.IDB_STORE2).catch(()=>{}); }

  alerts(){ return this.state.dsoAlerts||[]; }
  setAlerts(fn){ this.setState(s=>({dsoAlerts:fn(s.dsoAlerts||[])})); }
  // Bam 1 canh bao -> phat am thanh + nhay sang de biet da nhan
  fireAlert(a){ this.playAlert(a);
    clearTimeout(this._alT); this.set({dsoAlHit:a.id});
    this._alT=setTimeout(()=>{ if(this._mounted) this.set({dsoAlHit:null}); },900); }
  playAlert(a){ if(!a||!a.snd) return;
    this.sndGet(a.id).then(blob=>{ if(!blob) return;
      if(this._sndUrl) URL.revokeObjectURL(this._sndUrl);
      this._sndUrl=URL.createObjectURL(blob);
      this._snd=this._snd||new window.Audio();
      this._snd.src=this._sndUrl; const p=this._snd.play(); if(p&&p.catch) p.catch(()=>{}); }).catch(()=>{}); }
  pickAlertSound(id,file){ if(!file) return;
    if(file.size>this.SND_MAX){ window.alert(this.t('alSndBig')); return; }
    this.sndPut(id,file).then(()=>this.setAlerts(l=>l.map(a=>a.id===id?{...a,snd:{name:file.name,size:file.size,type:file.type||''}}:a)))
      .catch(()=>window.alert(this.t('alSndErr'))); }
  clearAlertSound(id){ this.sndDel(id).catch(()=>{});
    this.setAlerts(l=>l.map(a=>a.id===id?{...a,snd:null}:a)); }
  renameAlert(id,name){ this.setAlerts(l=>l.map(a=>a.id===id?{...a,name}:a)); }
  delAlert(id){ this.sndDel(id).catch(()=>{}); this.setAlerts(l=>l.filter(a=>a.id!==id)); }
  addAlert(){ const l=this.alerts();
    let n=0; l.forEach(a=>{ const m=String(a.id).match(/(\d+)$/); if(m) n=Math.max(n,Number(m[1])); });
    this.setAlerts(x=>[...x,{id:'a'+(n+1),name:'',snd:null}]); }
  kb(n){ n=Number(n)||0; return n>=1048576?((n/1048576).toFixed(1)+' MB'):(Math.max(1,Math.round(n/1024))+' KB'); }
  icSnd(on){ const h=React.createElement;
    return h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,style:{flex:'none'}},
      h('path',{d:'M11 5 6 9H3v6h3l5 4z'}),
      on?h('path',{d:'M16 8a5 5 0 0 1 0 8'}):h('path',{d:'M22 9l-6 6M16 9l6 6'})); }

  // Mot the trong dung chung cho ca 5 man -- sau nay chi truyen body that vao la xong
  // opts.full = bo tran max-width; opts.action = phan tu ghim goc tren ben phai
  dsoCard(titleKey,subKey,label,body,opts){
    const h=React.createElement, C=this.C; opts=opts||{};
    return h('div',{'data-screen-label':label,style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow}},
      h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'14px 22px 12px',borderBottom:'1px solid '+C.line}},
        h('div',{style:{marginRight:'auto',minWidth:0}},
          h('div',{style:{fontSize:16,fontWeight:700}},this.t(titleKey)),
          h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t(subKey))),
        opts.action||null),
      body||h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('dsoSoon')));
  }
  renderDsoAlerts(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const list=this.alerts(); const ed=!!this.state.dsoAlEdit; const hit=this.state.dsoAlHit;
    const grid={display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax('+(ed?258:206)+'px,1fr))',gap:12,padding:'18px 22px 22px',alignItems:'stretch'};
    const iconBtn=(title,onClick,col,bd,bg)=>h('button',{title,onClick,
      style:{border:'1px solid '+bd,background:bg,color:col,borderRadius:9,padding:'6px 9px',cursor:'pointer',display:'inline-flex',alignItems:'center',flex:'none',fontFamily:'inherit',fontSize:12,fontWeight:700,lineHeight:1}},title);
    const body = !list.length
      ? h('div',{style:{padding:'52px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('alEmpty'))
      : h('div',{style:grid},
          list.map(a=>{
            if(!ed){ const on=hit===a.id;
              return h('button',{key:a.id,onClick:()=>this.fireAlert(a),
                style:{display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'space-between',gap:10,minHeight:98,
                  border:'1px solid '+(on?'#c0392b':C.border),background:on?'#fdecea':C.white,color:C.ink,borderRadius:14,
                  padding:'14px 15px',cursor:'pointer',fontFamily:'inherit',textAlign:'left',
                  boxShadow:on?'0 0 0 3px rgba(192,57,43,.13)':'0 1px 2px rgba(40,60,10,.05)',transition:'background .12s,border-color .12s,box-shadow .12s'}},
                h('span',{style:{fontSize:15,fontWeight:700,lineHeight:1.3,wordBreak:'break-word'}},a.name||'—'),
                h('span',{style:{display:'inline-flex',alignItems:'center',gap:6,fontSize:10.5,fontWeight:600,color:a.snd?C.primary:C.faint}},
                  this.icSnd(!!a.snd), a.snd?this.t('alHasSnd'):this.t('alNoSnd')));
            }
            return h('div',{key:a.id,style:{border:'1px solid '+C.border,borderRadius:14,padding:'12px 13px 13px',background:C.white,display:'flex',flexDirection:'column',gap:9}},
              h('div',{style:{display:'flex',gap:8,alignItems:'center'}},
                h('input',{value:a.name,placeholder:this.t('alName'),onChange:e=>this.renameAlert(a.id,e.target.value),
                  style:{flex:1,minWidth:0,border:'1px solid '+C.border,borderRadius:9,padding:'8px 10px',fontSize:13.5,fontWeight:600,fontFamily:'inherit',color:C.ink,background:C.white}}),
                h('button',{title:this.t('alDel'),onClick:()=>this.delAlert(a.id),
                  style:{border:'1px solid #eccfca',background:C.white,color:'#c0392b',borderRadius:9,padding:'7px 8px',cursor:'pointer',display:'flex',flex:'none'}},
                  h('svg',{width:15,height:15,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14'})))),
              h('div',{style:{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}},
                h('label',{style:{...this.btn('ghost'),padding:'6px 10px',fontSize:12,cursor:'pointer'}},
                  this.icSnd(true), this.t('alPick'),
                  h('input',{type:'file',accept:'audio/*',style:{display:'none'},
                    onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; this.pickAlertSound(a.id,f); }})),
                a.snd?iconBtn(this.t('alPlay'),()=>this.playAlert(a),C.primary,C.border,C.tint2):null,
                a.snd?iconBtn(this.t('alClrSnd'),()=>this.clearAlertSound(a.id),'#c0392b','#eccfca',C.white):null),
              h('div',{style:{fontSize:10.5,fontFamily:mono,color:a.snd?C.sub:C.faint,wordBreak:'break-all'}},
                a.snd?(a.snd.name+' · '+this.kb(a.snd.size)):this.t('alNoSnd')));
          }),
          ed?h('button',{key:'__add',onClick:()=>this.addAlert(),
            style:{minHeight:112,border:'1.5px dashed '+C.border,borderRadius:14,background:'#fbfcfa',color:C.primary,
              cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:700,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:7}},
            h('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M12 5v14M5 12h14'})),
            this.t('alAdd')):null);
    const action=h('button',{onClick:()=>this.set({dsoAlEdit:!ed,dsoAlHit:null}),
      style:ed?this.btn('primary'):this.btn('ghost')},
      ed?null:h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M12 20h9'}),h('path',{d:'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z'})),
      ed?this.t('alDone'):this.t('alEdit'));
    return this.dsoCard('dsoAlertPanel','dsoAlertSub','DSO Alerts',body,{full:true,action});
  }

  // Style dung chung cho 2 bang cua M-level Type Setting
  mtStyles(){ const C=this.C, mono="'IBM Plex Mono',monospace";
    return {
      th:{padding:'10px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',color:C.sub,
          textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,background:'#f8faf3',whiteSpace:'nowrap'},
      td:{padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line,verticalAlign:'middle'},
      inp:{width:'100%',border:'1.5px solid '+C.primary,borderRadius:7,padding:'5px 7px',fontSize:12.5,fontFamily:mono,
           fontWeight:600,color:C.ink,background:C.white,boxSizing:'border-box'},
      mono };
  }
  mtBtn(label,on,extra){ const h=React.createElement, C=this.C;
    return h('button',{onClick:on,style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:8,
      padding:'4px 10px',fontSize:11.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap',...(extra||{})},
      'style-hover':{background:C.tint}},label); }

  // ---- Bảng 1 (tỉ lệ 3): danh mục loại M-level ----
  renderMtypeTable(){
    const h=React.createElement, C=this.C; const S=this.mtStyles();
    const list=this.mtypes(), sel=this.mtSelId();
    const body=list.map((m,i)=>{
      const ed=this.state.mtEdit==='t:'+m.id, on=sel===m.id, bg=on?C.tint:(i%2?'#f7f9f3':C.white);
      return h('tr',{key:m.id,onClick:()=>{ if(!ed) this.set({mtSel:m.id}); },style:{cursor:ed?'default':'pointer'}},
        h('td',{style:{...S.td,background:bg,fontWeight:700,color:on?C.primary:C.ink,
          borderLeft:'3px solid '+(on?C.primary:'transparent')}},
          ed?h('input',{autoFocus:true,value:m.name,placeholder:this.t('mtName'),onClick:e=>e.stopPropagation(),
              onChange:e=>this.mtSetType(m.id,{name:e.target.value}),style:S.inp})
            :(String(m.name||'').trim()||'—')),
        h('td',{style:{...S.td,background:bg,color:m.desc?C.ink:C.faint,wordBreak:'break-word'}},
          ed?h('input',{value:m.desc||'',placeholder:this.t('mtDesc'),onClick:e=>e.stopPropagation(),
              onChange:e=>this.mtSetType(m.id,{desc:e.target.value}),style:{...S.inp,fontFamily:'inherit'}})
            :(m.desc||'—')),
        h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6}},
            ed?this.mtBtn(this.t('lsDone'),e=>{ e.stopPropagation(); this.set({mtEdit:null}); },{border:'1px solid '+C.primary,background:C.tint})
              :this.mtBtn(this.t('lsEdit'),e=>{ e.stopPropagation(); this.set({mtEdit:'t:'+m.id,mtSel:m.id}); }),
            this.mtBtn(this.t('mtDel'),e=>{ e.stopPropagation(); this.mtDelType(m.id); },{color:'#c0392b',borderColor:'#eccfca'}))));
    });
    const tbl=h('div',{style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'320px',borderCollapse:'collapse'}},
        h('colgroup',null,h('col',{style:{width:'30%'}}),h('col',{style:{width:'40%'}}),h('col',{style:{width:'30%'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...S.th,paddingLeft:13}},this.t('mtName')),
          h('th',{style:S.th},this.t('mtDesc')),
          h('th',{style:{...S.th,borderRight:'none'}},this.t('mtAct')))),
        h('tbody',null, list.length?body:h('tr',null,h('td',{colSpan:3,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'38px 16px',borderRight:'none'}},this.t('mtEmpty'))))));
    const bodyEl=h('div',null, tbl,
      h('div',{style:{padding:'11px 13px',borderTop:'1px solid '+C.line}},
        this.mtBtn('+ '+this.t('mtAdd'),()=>this.mtAddType(),{color:C.primary,borderColor:C.border})));
    return this.dsoCard('mtPanel','mtSub','DSO M-level Type',bodyEl,{full:true});
  }

  // ---- Bảng 2 (tỉ lệ 7): chi tiết của loại đang chọn ----
  renderMtypeDetail(){
    const h=React.createElement, C=this.C; const S=this.mtStyles();
    const tid=this.mtSelId(); const rows=tid?this.mtDet(tid):[];
    const imp=h('div',{style:{display:'flex',alignItems:'center',gap:9}},
      this.state.mtMsg?h('span',{style:{fontSize:11.5,fontWeight:600,color:C.primary,background:C.tint,
        border:'1px solid '+C.border,borderRadius:99,padding:'4px 10px',whiteSpace:'nowrap'}},this.state.mtMsg):null,
      h('label',{title:this.t('mtImportTip'),style:{...this.btn('ghost'),padding:'6px 12px',fontSize:12,cursor:tid?'pointer':'not-allowed',opacity:tid?1:.5}},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M12 3v12M8 11l4 4 4-4'}),h('path',{d:'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'})),
        this.t('mtImport'),
        h('input',{type:'file',accept:'.xlsx,.xls,.csv',disabled:!tid,style:{display:'none'},
          onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(f) this.mtImport(f); }})));
    let bodyEl;
    if(!tid) bodyEl=h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('mtPickType'));
    else {
      const body=rows.map((r,i)=>{
        const ed=this.state.mtEdit==='d:'+tid+':'+r.id, bg=i%2?'#f7f9f3':C.white;
        const cell=(field,fn,ph,align)=>ed
          ? h('input',{value:r[field]==null?'':r[field],placeholder:ph,inputMode:field==='inc'?'decimal':'numeric',
              onChange:e=>this.mtSetDet(tid,r.id,{[field]:fn?this[fn](e.target.value):e.target.value}),
              style:{...S.inp,textAlign:align||'left',...(fn?{}:{fontFamily:'inherit'})}})
          : (field==='inc'?this.mtMoneyFmt(r.inc)
             :(r[field]===''||r[field]==null?'—'
               :(field==='tgt'?r.tgt+'%':String(r[field]))));
        return h('tr',{key:r.id},
          h('td',{style:{...S.td,background:bg,textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}},i+1),
          h('td',{style:{...S.td,background:bg,fontWeight:600,wordBreak:'break-word'}},cell('name',null,this.t('mtName'))),
          h('td',{style:{...S.td,background:bg,textAlign:'center',fontFamily:S.mono,fontWeight:700}},cell('tgt','mtPct','0','center')),
          h('td',{style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,fontWeight:700}},cell('inc','mtMoney','0','right')),
          h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
            h('div',{style:{display:'flex',gap:6}},
              ed?this.mtBtn(this.t('lsDone'),()=>this.mtDetDone(tid,r.id),{border:'1px solid '+C.primary,background:C.tint})
                :this.mtBtn(this.t('lsEdit'),()=>this.set({mtEdit:'d:'+tid+':'+r.id})),
              this.mtBtn(this.t('mtDel'),()=>this.mtDelDet(tid,r.id),{color:'#c0392b',borderColor:'#eccfca'}))));
      });
      const tbl=h('div',{style:{overflowX:'auto'}},
        h('table',{style:{width:'100%',minWidth:'640px',borderCollapse:'collapse'}},
          h('colgroup',null,h('col',{style:{width:'56px'}}),h('col',{style:{width:'26%'}}),
            h('col',{style:{width:'15%'}}),h('col',{style:{width:'30%'}}),h('col',{style:{width:'160px'}})),
          h('thead',null,h('tr',null,
            h('th',{style:{...S.th,textAlign:'center',paddingLeft:8}},this.t('mtNo')),
            h('th',{style:S.th},this.t('mtName')),
            h('th',{title:this.t('mtTgtTip'),style:{...S.th,textAlign:'center'}},this.t('mtTgt')),
            h('th',{style:{...S.th,textAlign:'right'}},this.t('mtInc')),
            h('th',{style:{...S.th,borderRight:'none'}},this.t('mtAct')))),
          h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:5,
            style:{...S.td,textAlign:'center',color:C.faint,padding:'38px 16px',borderRight:'none'}},this.t('mtdEmpty'))))));
      bodyEl=h('div',null, tbl,
        h('div',{style:{padding:'11px 13px',borderTop:'1px solid '+C.line}},
          this.mtBtn('+ '+this.t('mtAdd'),()=>this.mtAddDet(tid),{color:C.primary,borderColor:C.border})));
    }
    return this.dsoCard('mtdPanel','mtdSub','DSO M-level Type Detail',bodyEl,{full:true,action:imp});
  }

  // ==== Thu vien loi (Defect Library) =====================================
  // Danh muc loi dung khi cong nhan bam FAIL o card size. Ca 6 cot deu la CHU
  // tu do -- moi nha may co bo ma / nhom / muc do rieng, nen khong validate gi
  // ngoai viec don khoang trang khi bam Xong.
  DEFECT_DEF=[
    {code:'SW-001',name:'Bỏ mũi chỉ',              cat:'May',        sev:'Major',    loc:'Đường sườn',    cause:'Kim mòn · chỉ căng'},
    {code:'SW-002',name:'Đường may nhăn',          cat:'May',        sev:'Major',    loc:'Nẹp áo',        cause:'Áp lực chân vịt sai'},
    {code:'SW-003',name:'Đường may lệch',          cat:'May',        sev:'Critical', loc:'Cổ áo',         cause:'Canh sai dấu bấm'},
    {code:'SW-004',name:'Tuột chỉ · nhảy chỉ',     cat:'May',        sev:'Major',    loc:'Gấu áo',        cause:'Máy chưa hiệu chỉnh'},
    {code:'SW-005',name:'Chỉ thừa chưa cắt',       cat:'Vệ sinh',    sev:'Minor',    loc:'Toàn sản phẩm', cause:'Bỏ sót khâu cắt chỉ'},
    {code:'FB-001',name:'Vải lỗi sợi · sợi thô',   cat:'Vải',        sev:'Major',    loc:'Thân trước',    cause:'Nguyên liệu đầu vào'},
    {code:'FB-002',name:'Vải khác màu',            cat:'Vải',        sev:'Critical', loc:'Tay áo',        cause:'Trộn lô nhuộm'},
    {code:'FB-003',name:'Vải bị lỗ · xước',        cat:'Vải',        sev:'Critical', loc:'Thân sau',      cause:'Nguyên liệu đầu vào'},
    {code:'CT-001',name:'Cắt sai thông số',        cat:'Cắt',        sev:'Critical', loc:'Chi tiết thân', cause:'Sơ đồ cắt sai'},
    {code:'CT-002',name:'Chi tiết không đối xứng', cat:'Cắt',        sev:'Major',    loc:'Tay áo',        cause:'Xô lệch khi cắt'},
    {code:'AC-001',name:'Khóa kéo không êm',       cat:'Phụ liệu',   sev:'Major',    loc:'Nẹp khóa',      cause:'Phụ liệu lỗi'},
    {code:'AC-002',name:'Cúc lệch · thiếu cúc',    cat:'Phụ liệu',   sev:'Major',    loc:'Nẹp áo',        cause:'Đóng cúc sai vị trí'},
    {code:'AC-003',name:'Nhãn sai · thiếu nhãn',   cat:'Phụ liệu',   sev:'Critical', loc:'Cổ trong',      cause:'Cấp sai nhãn'},
    {code:'PR-001',name:'In · thêu lệch vị trí',   cat:'In thêu',    sev:'Major',    loc:'Ngực trái',     cause:'Định vị khuôn sai'},
    {code:'PR-002',name:'Thêu thiếu mũi',          cat:'In thêu',    sev:'Minor',    loc:'Ngực trái',     cause:'Chương trình thêu'},
    {code:'IR-001',name:'Vết bẩn dầu máy',         cat:'Vệ sinh',    sev:'Major',    loc:'Toàn sản phẩm', cause:'Máy rỉ dầu'},
    {code:'IR-002',name:'Là ép bị bóng',           cat:'Hoàn thiện', sev:'Major',    loc:'Thân trước',    cause:'Nhiệt là quá cao'},
    {code:'SZ-001',name:'Sai thông số kích cỡ',    cat:'Đo lường',   sev:'Critical', loc:'Vòng ngực',     cause:'Rập · cắt sai'},
  ];
  // [ten truong, khoa dich] -- dung chung cho bang Cai Dat va bang chon ly do loi
  DEFECT_COLS=[['code','dfCode'],['name','dfName'],['cat','dfCat'],['sev','dfSev'],['loc','dfLoc'],['cause','dfCause']];
  initDefects(){ return this.DEFECT_DEF.map((r,i)=>({id:'f'+(i+1),...r})); }
  // Array.isArray (khong phai l&&l.length) -- xoa het dong phai GIU bang rong,
  // khong duoc hoi sinh danh muc mac dinh.
  defects(){ const l=this.state.dsoDefects; return Array.isArray(l)?l:this.initDefects(); }
  setDefects(fn){ this.setState(s=>({dsoDefects:fn(Array.isArray(s.dsoDefects)?s.dsoDefects:this.initDefects())})); }
  dfSet(id,patch){ this.setDefects(l=>l.map(r=>r.id===id?{...r,...patch}:r)); }
  dfAddRow(){ this.setDefects(l=>{ const id=this.mtNextId(l,'f'); this._dfNew=id;
      return [...l,{id,code:'',name:'',cat:'',sev:'',loc:'',cause:''}]; });
    // xoa tu khoa tim: dong rong khong khop tu khoa nao nen se bi an mat
    setTimeout(()=>{ if(this._mounted&&this._dfNew) this.set({dfEdit:this._dfNew,dfQ:''}); },0); }
  dfDelRow(id){ this.setDefects(l=>l.filter(r=>r.id!==id));
    this.setState(s=>({dfEdit:s.dfEdit===id?null:s.dfEdit})); }
  dfDone(id){ const r=this.defects().find(x=>x.id===id);
    if(r){ const p={}; this.DEFECT_COLS.forEach(([f])=>{ p[f]=String(r[f]||'').replace(/\s+/g,' ').trim(); });
      this.dfSet(id,p); }
    this.set({dfEdit:null}); }
  // Tim khong dau: go 'loi chi' van khop 'Lỗi chỉ'. Moi tu deu phai khop (AND).
  dfFold(s){ return String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim(); }
  dfMatch(r,q){ const k=this.dfFold(q); if(!k) return true;
    const hay=this.dfFold(this.DEFECT_COLS.map(([f])=>r[f]||'').join(' '));
    return k.split(/\s+/).every(w=>hay.indexOf(w)>=0); }
  dfList(q){ return this.defects().filter(r=>this.dfMatch(r,q)); }
  // Muc do la chu tu do -> bat ca tieng Viet lan tieng Anh; khong khop thi chip xam
  dfSevChip(sev){ const C=this.C, s=this.dfFold(sev);
    if(!s) return null;
    if(/critical|nghiem|nang/.test(s)) return {fg:'#a3271b',bg:'#fdecea',bd:'#eccfca'};
    if(/major|lon|trung/.test(s))      return {fg:'#946200',bg:'#fdf5e3',bd:'#ecdcb4'};
    if(/minor|nhe|thap/.test(s))       return {fg:'#2f7d32',bg:'#e6f2e2',bd:'#cfe3b4'};
    return {fg:C.sub,bg:'#f2f4ee',bd:C.border}; }
  // Thong bao inline (khong dung window.alert -- dialog cua browser chan het tuong tac)
  dfSay(msg){ clearTimeout(this._dfT); this.set({dfMsg:msg});
    this._dfT=setTimeout(()=>{ if(this._mounted) this.set({dfMsg:''}); },4000); }
  // Doc header linh dong (VI hoac EN). Khong thay header -> doc 6 cot dau theo dung thu tu.
  dfParse(aoa){
    const n=s=>this.dfFold(s).replace(/\s+/g,' ');
    const PAT=[['code',/(ma loi|defect code|\bcode\b|\bma\b)/],['name',/(ten loi|defect name|\bname\b|\bten\b)/],
      ['cat',/(nhom|phan loai|category|\btype\b)/],['sev',/(muc do|nghiem trong|severity|\blevel\b)/],
      ['loc',/(vi tri|defect location|location|position)/],['cause',/(nguyen nhan|root cause|\bcause\b|reason)/]];
    let hi=-1, map={};
    for(let i=0;i<Math.min((aoa||[]).length,10);i++){ const r=aoa[i]||[], m={};
      r.forEach((c,j)=>{ const v=n(c); if(!v) return;
        PAT.forEach(([f,re])=>{ if(m[f]==null&&re.test(v)) m[f]=j; }); });
      if(m.code!=null||m.name!=null){ hi=i; map=m; break; } }
    const out=[], start=hi>=0?hi+1:0;
    const txt=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
    for(let i=start;i<(aoa||[]).length;i++){ const r=aoa[i]||[];
      const g=(f,pos)=>txt(hi>=0?(map[f]!=null?r[map[f]]:''):r[pos]);
      const row={code:g('code',0),name:g('name',1),cat:g('cat',2),sev:g('sev',3),loc:g('loc',4),cause:g('cause',5)};
      if(!row.code&&!row.name) continue;      // dong trong / dong ke chan
      out.push(row); }
    return out; }
  async dfImport(file){
    if(!file) return;
    const X=window.XLSX; if(!X||!X.read){ this.dfSay(this.t('mtNoXlsx')); return; }
    try{
      const buf=await file.arrayBuffer();
      const wb=X.read(new Uint8Array(buf),{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const got=this.dfParse(X.utils.sheet_to_json(ws,{header:1,blankrows:false}));
      if(!got.length){ this.dfSay(this.t('mtImportNone')); return; }
      this.setDefects(l=>{ let n=0; l.forEach(x=>{ const m=String(x.id).match(/(\d+)$/); if(m) n=Math.max(n,Number(m[1])); });
        return [...l,...got.map((g,i)=>({...g,id:'f'+(n+1+i)}))]; });
      this.set({dfQ:''});                     // dong vua nhap phai nhin thay ngay
      this.dfSay(this.t('mtImportOk')+' '+got.length+' '+this.t('mtImportRows'));
    }catch(e){ this.dfSay(this.t('mtImportErr')); } }

  // O tim dung chung: bang Cai Dat (nho) va hop chon ly do loi (to, tu focus)
  dfSearchBox(q,onChange,big,phKey){
    const h=React.createElement, C=this.C;
    return h('div',{style:{position:'relative',flex:big?1:'none',minWidth:0}},
      h('svg',{width:big?15:14,height:big?15:14,viewBox:'0 0 24 24',fill:'none',stroke:C.faint,strokeWidth:2,
        style:{position:'absolute',left:big?12:10,top:big?11:9,pointerEvents:'none'}},
        h('circle',{cx:11,cy:11,r:7}),h('path',{d:'M20 20l-4.5-4.5'})),
      h('input',{autoFocus:!!big,value:q,placeholder:this.t(phKey||'dfSearch'),onChange:e=>onChange(e.target.value),
        style:{width:big?'100%':240,border:'1px solid '+C.border,borderRadius:big?10:9,
          padding:big?'9px 32px 9px 36px':'7px 26px 7px 30px',fontSize:big?13.5:12.5,
          fontFamily:'inherit',color:C.ink,background:C.white,boxSizing:'border-box'}}),
      q?h('button',{title:this.t('dsoClose'),onClick:()=>onChange(''),
        style:{position:'absolute',right:big?8:5,top:big?6:4,border:'none',background:'none',color:C.faint,
          cursor:'pointer',fontSize:big?17:15,lineHeight:1,padding:4,fontFamily:'inherit'}},'\u00d7'):null);
  }

  // ---- Bang thu vien loi trong Cai Dat: CRUD + nhap Excel + tim ----------
  renderDefectLib(){
    const h=React.createElement, C=this.C; const S=this.mtStyles();
    const q=this.state.dfQ||'', all=this.defects(), rows=this.dfList(q);
    const action=h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
      this.state.dfMsg?h('span',{style:{fontSize:11.5,fontWeight:600,color:C.primary,background:C.tint,
        border:'1px solid '+C.border,borderRadius:99,padding:'4px 10px',whiteSpace:'nowrap'}},this.state.dfMsg):null,
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
        border:'1px solid '+C.border,borderRadius:999,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.fmt(all.length)+' '+this.t('dfCount')),
      this.dfSearchBox(q,v=>this.set({dfQ:v}),false),
      h('label',{title:this.t('dfImportTip'),style:{...this.btn('ghost'),padding:'6px 12px',fontSize:12,cursor:'pointer'}},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M12 3v12M8 11l4 4 4-4'}),h('path',{d:'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'})),
        this.t('mtImport'),
        h('input',{type:'file',accept:'.xlsx,.xls,.csv',style:{display:'none'},
          onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(f) this.dfImport(f); }})));
    const body=rows.map((r,i)=>{
      const ed=this.state.dfEdit===r.id, bg=i%2?'#f7f9f3':C.white;
      const cell=(f,useMono)=>{ const k=(this.DEFECT_COLS.find(x=>x[0]===f)||[])[1];
        return ed
          ? h('input',{value:r[f]==null?'':r[f],placeholder:this.t(k),
              onChange:e=>this.dfSet(r.id,{[f]:e.target.value}),
              style:{...S.inp,...(useMono?{}:{fontFamily:'inherit'})}})
          : (String(r[f]||'').trim()||'\u2014'); };
      const sv=this.dfSevChip(r.sev);
      return h('tr',{key:r.id},
        h('td',{style:{...S.td,background:bg,textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}},i+1),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono,fontWeight:700,color:C.primary,
          whiteSpace:ed?'normal':'nowrap'}},cell('code',true)),
        h('td',{style:{...S.td,background:bg,fontWeight:600,wordBreak:'break-word'}},cell('name')),
        h('td',{style:{...S.td,background:bg,wordBreak:'break-word'}},cell('cat')),
        h('td',{style:{...S.td,background:bg}}, ed?cell('sev')
          :(sv?h('span',{style:{fontSize:11,fontWeight:700,color:sv.fg,background:sv.bg,border:'1px solid '+sv.bd,
                borderRadius:999,padding:'3px 9px',whiteSpace:'nowrap'}},String(r.sev).trim())
             :h('span',{style:{color:C.faint}},'\u2014'))),
        h('td',{style:{...S.td,background:bg,wordBreak:'break-word'}},cell('loc')),
        h('td',{style:{...S.td,background:bg,color:C.sub,wordBreak:'break-word'}},cell('cause')),
        h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6}},
            ed?this.mtBtn(this.t('lsDone'),()=>this.dfDone(r.id),{border:'1px solid '+C.primary,background:C.tint})
              :this.mtBtn(this.t('lsEdit'),()=>this.set({dfEdit:r.id})),
            this.mtBtn(this.t('mtDel'),()=>this.dfDelRow(r.id),{color:'#c0392b',borderColor:'#eccfca'}))));
    });
    const tbl=h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1140px',borderCollapse:'collapse'}},
        h('colgroup',null,h('col',{style:{width:'52px'}}),h('col',{style:{width:'11%'}}),
          h('col',{style:{width:'19%'}}),h('col',{style:{width:'12%'}}),h('col',{style:{width:'10%'}}),
          h('col',{style:{width:'15%'}}),h('col',{style:{width:'19%'}}),h('col',{style:{width:'130px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...S.th,textAlign:'center',paddingLeft:8}},this.t('mtNo')),
          ...this.DEFECT_COLS.map(([f,k])=>h('th',{key:f,style:S.th},this.t(k))),
          h('th',{style:{...S.th,borderRight:'none'}},this.t('mtAct')))),
        h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:8,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'38px 16px',borderRight:'none'}},
          this.t(all.length?'dfNoHit':'dfEmpty'))))));
    const bodyEl=h('div',null, tbl,
      h('div',{style:{padding:'11px 13px',borderTop:'1px solid '+C.line}},
        this.mtBtn('+ '+this.t('dfAdd'),()=>this.dfAddRow(),{color:C.primary,borderColor:C.border})));
    return this.dsoCard('dfPanel','dfSub','DSO Defect Library',bodyEl,{full:true,action});
  }

  // ==== Bam 1 card size -> hop lon PASS / FAIL ============================
  // Card khong con +1 truc tiep nua: moi san pham deu di qua 1 lan xac nhan.
  dsoTapOpen(c){ this.set({dsoTap:{c,stage:'ask'},dsoTapQ:''}); }
  dsoTapClose(){ this.set({dsoTap:null,dsoTapQ:''}); }
  dsoTapPass(){ const t=this.state.dsoTap; if(!t) return; this.dsoBump(t.c,1); this.dsoTapClose(); }
  dsoTapFail(){ this.setState(st=>st.dsoTap?{dsoTap:{...st.dsoTap,stage:'fail'},dsoTapQ:''}:null); }
  // Hang loi ghi theo (ngay, chuyen, style, PO, mau, size) + ma loi -> dem duoc
  // ca so luong loi va loi nao hay gap. KHONG cong vao san luong hoan thanh.
  // Doc new Date() MOT lan roi dung chung cho ca khoa ngay lan moc gio: doc 2
  // lan, bam dung luc doi ngay -> so luong vao ngay nay ma moc gio vao ngay kia.
  // Moc HH:MM ghi song song sang dsoDefTime theo khoa (o size + ma loi) --
  // dsoDefLog GIU NGUYEN hinh dang so dem nen may dang co du lieu cu van doc duoc.
  dsoDefTake(c,d){ const now=new Date(), k=this.dsoDoneKey(c,this.psFmtD(now)), at=this.dsoHM(now);
    const code=String(d.code||'').trim()||String(d.name||'').trim()||'?';
    this.setState(st=>{ const m={...(st.dsoDefLog||{})}, cur={...(m[k]||{})};
      cur[code]=(Number(cur[code])||0)+1; m[k]=cur;
      const tm={...(st.dsoDefTime||{})}, tk=k+'|'+code;
      tm[tk]=(tm[tk]||[]).concat(at);
      return {dsoDefLog:m,dsoDefTime:tm,dsoTap:null,dsoTapQ:''}; }); }
  // Tong luy ke moi ngay, giong dsoDoneOf
  dsoDefOf(c){ const m=this.state.dsoDefLog||{};
    const tail='|'+c.line+'|'+c.style+'|'+c.po+'|'+c.color+'|'+c.size;
    let n=0; Object.keys(m).forEach(k=>{ if(k.slice(-tail.length)!==tail) return;
      const o=m[k]||{}; Object.keys(o).forEach(x=>{ n+=Number(o[x])||0; }); });
    return n; }

  // Buoc 1: 2 nut lon PASS / FAIL. Buoc 2: bang ly do loi lay tu Thu Vien Loi
  // (Cai Dat · Thu Vien Loi) kem o tim. Ve tu renderDsoLineDetail nen khong
  // phai them slot moi vao shell(), giong renderDsoHandAsk.
  renderDsoTap(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const t=this.state.dsoTap; if(!t||!t.c) return null;
    const c=t.c, fail=t.stage==='fail', S=this.mtStyles();
    const close=()=>this.dsoTapClose();
    const done=this.dsoDoneOf(c), nf=this.dsoDefOf(c);
    const chip=(label,val,col)=>h('div',{key:label,style:{minWidth:0}},
      h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,whiteSpace:'nowrap'}},label),
      h('div',{style:{fontSize:13,fontWeight:700,fontFamily:mono,color:col||C.ink,marginTop:2,
        wordBreak:'break-word'}},val||'\u2014'));
    // Dai thong tin: size to ben trai, cac truong con lai xep ngang -- cong nhan
    // phai thay ro dang dem cho size / PO / mau nao truoc khi bam.
    const info=h('div',{style:{display:'flex',alignItems:'center',gap:18,flexWrap:'wrap',flex:'none',
        padding:'14px 22px',background:C.tint2,borderBottom:'1px solid '+C.line}},
      h('div',{style:{flex:'none',display:'flex',alignItems:'baseline',gap:9}},
        h('span',{style:{fontSize:42,fontWeight:700,lineHeight:.95,letterSpacing:'-1.5px',color:C.ink}},c.size),
        h('span',{style:{fontSize:15,fontWeight:700,fontFamily:mono,
          color:c.need&&done>=c.need?'#2f7d32':C.sub}},this.fmt(done)+'/'+this.fmt(c.need))),
      h('div',{style:{flex:1,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(88px,1fr))',
          gap:14,minWidth:0}},
        chip(this.t('lsCol1'),c.line,C.primary),
        chip(this.t('lsCol2'),c.style),
        chip(this.t('dsoColPo'),c.po),
        chip(this.t('dsoColColor'),c.color,C.dark),
        nf?chip(this.t('dsoFail'),this.fmt(nf),'#a3271b'):null));
    const head=(titleKey,subKey,back)=>h('div',{style:{display:'flex',alignItems:'center',gap:12,flex:'none',
        padding:'15px 20px',borderBottom:'1px solid '+C.line}},
      back
        ? h('button',{onClick:()=>this.set({dsoTap:{c,stage:'ask'},dsoTapQ:''}),
            style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:9,padding:'6px 12px',
              fontSize:12.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',flex:'none'},
            'style-hover':{background:C.tint}},this.t('dsoPickBack'))
        : h('div',{style:{width:36,height:36,borderRadius:10,background:C.tint,color:C.dark,flex:'none',
              display:'flex',alignItems:'center',justifyContent:'center'}},
            h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
              h('path',{d:'M9 11l3 3 8-8'}),
              h('path',{d:'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'}))),
      h('div',{style:{minWidth:0,marginRight:'auto'}},
        h('div',{style:{fontSize:16,fontWeight:700}},this.t(titleKey)),
        h('div',{style:{fontSize:11.5,color:C.faint,marginTop:2}},this.t(subKey))),
      h('button',{title:this.t('dsoClose'),onClick:close,
        style:{border:'1px solid '+C.border,background:C.white,color:C.sub,borderRadius:9,width:30,height:30,
          flex:'none',cursor:'pointer',fontSize:17,lineHeight:1,padding:0,fontFamily:'inherit'},
        'style-hover':{background:C.tint}},'\u00d7'));
    // ---- Buoc 1: 2 nut lon, bam duoc bang ngon tay tren tablet o chuyen ----
    const big=(label,sub,tone,on)=>h('button',{onClick:on,
      style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:9,
        minHeight:168,border:'2px solid '+tone.bd,background:tone.bg,color:tone.fg,borderRadius:16,
        cursor:'pointer',fontFamily:'inherit',padding:'20px 16px',
        transition:'background .12s,border-color .12s,box-shadow .12s'},
      'style-hover':{background:tone.hv,borderColor:tone.fg}},
      h('svg',{width:40,height:40,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2.4},tone.ic),
      h('span',{style:{fontSize:29,fontWeight:700,letterSpacing:'1px',lineHeight:1}},label),
      h('span',{style:{fontSize:12.5,fontWeight:600,opacity:.82}},sub));
    const PASS={fg:'#2f7d32',bg:'#eff7e9',bd:'#a9cf94',hv:'#e3f2d9',ic:h('path',{d:'M4 12.6l5.2 5.2L20 6.9'})};
    const FAIL={fg:'#b3271b',bg:'#fdeeec',bd:'#e6b0a8',hv:'#fbe0dd',ic:h('path',{d:'M6 6l12 12M18 6L6 18'})};
    const ask=h('div',null, head('dsoTapTitle','dsoTapTip',false), info,
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(215px,1fr))',
          gap:14,padding:'20px 22px 22px'}},
        big(this.t('dsoPass'),this.t('dsoPassSub'),PASS,()=>this.dsoTapPass()),
        big(this.t('dsoFail'),this.t('dsoFailSub'),FAIL,()=>this.dsoTapFail())));
    // ---- Buoc 2: bang ly do loi + o tim -----------------------------------
    // Mau nen dat o <tr> (khong o <td>) de :hover cua ca dong hien duoc.
    const q=this.state.dsoTapQ||'', all=this.defects(), rows=this.dfList(q);
    const sth={...S.th,position:'sticky',top:0,zIndex:1};
    const ctd={padding:'9px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,
      borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    const txt=v=>String(v==null?'':v).trim()||'\u2014';
    const tblRows=rows.map((r,i)=>{ const sv=this.dfSevChip(r.sev);
      return h('tr',{key:r.id,onClick:()=>this.dsoDefTake(c,r),title:this.t('dsoPickSub'),
          style:{cursor:'pointer',background:i%2?'#f7f9f3':C.white},'style-hover':{background:C.tint}},
        h('td',{style:{...ctd,paddingLeft:20,fontFamily:mono,fontWeight:700,color:C.primary,
          whiteSpace:'nowrap'}},txt(r.code)),
        h('td',{style:{...ctd,fontWeight:600,wordBreak:'break-word'}},txt(r.name)),
        h('td',{style:{...ctd,wordBreak:'break-word'}},txt(r.cat)),
        h('td',{style:ctd}, sv
          ? h('span',{style:{fontSize:11,fontWeight:700,color:sv.fg,background:sv.bg,border:'1px solid '+sv.bd,
              borderRadius:999,padding:'3px 9px',whiteSpace:'nowrap'}},String(r.sev).trim())
          : h('span',{style:{color:C.faint}},'\u2014')),
        h('td',{style:{...ctd,wordBreak:'break-word'}},txt(r.loc)),
        h('td',{style:{...ctd,borderRight:'none',paddingRight:20,color:C.sub,
          wordBreak:'break-word'}},txt(r.cause))); });
    const search=h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'12px 20px',flex:'none',
        borderBottom:'1px solid '+C.line,background:'#fbfcf8'}},
      this.dfSearchBox(q,v=>this.set({dsoTapQ:v}),true),
      h('span',{style:{flex:'none',fontSize:11.5,fontWeight:700,fontFamily:mono,color:C.faint,
        whiteSpace:'nowrap'}},this.fmt(rows.length)+' / '+this.fmt(all.length)));
    const table=h('div',{className:'yscroll',style:{overflow:'auto',flex:1,minHeight:130}},
      h('table',{style:{width:'100%',minWidth:'820px',borderCollapse:'collapse'}},
        h('thead',null,h('tr',null,
          h('th',{style:{...sth,paddingLeft:20}},this.t('dfCode')),
          h('th',{style:sth},this.t('dfName')),
          h('th',{style:sth},this.t('dfCat')),
          h('th',{style:sth},this.t('dfSev')),
          h('th',{style:sth},this.t('dfLoc')),
          h('th',{style:{...sth,borderRight:'none',paddingRight:20}},this.t('dfCause')))),
        h('tbody',null, rows.length?tblRows:h('tr',null,h('td',{colSpan:6,
          style:{...ctd,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none'}},
          this.t(all.length?'dfNoHit':'dsoDefEmpty'))))));
    const pick=h('div',{style:{display:'flex',flexDirection:'column',minHeight:0,flex:1}},
      head('dsoPick','dsoPickSub',true), info, search, table,
      h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'12px 20px',flex:'none',
          borderTop:'1px solid '+C.line,background:'#f8faf3'}},
        h('div',{style:{flex:1}}),
        h('button',{onClick:close,style:this.btn('ghost')},this.t('psCancel'))));
    return h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:85,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),style:{width:fail?'min(960px,96vw)':'min(620px,96vw)',
          maxHeight:'92vh',display:'flex',flexDirection:'column',background:C.white,borderRadius:18,
          boxShadow:'0 30px 70px rgba(0,0,0,.34)',overflow:'hidden'}},
        fail?pick:ask));
  }

  renderDsoSettings(){
    const h=React.createElement; const sub=this.state.dsoSub||'line';
    // 3:7 theo chieu ngang -- flex-basis 0 nen ti le dung chinh xac, bang tu cuon ngang khi hep
    const mtype=h('div',{style:{display:'flex',gap:16,alignItems:'flex-start'}},
      h('div',{style:{flex:'3 1 0',minWidth:0}},this.renderMtypeTable()),
      h('div',{style:{flex:'7 1 0',minWidth:0}},this.renderMtypeDetail()));
    return h('div',null,
      this.tabBar(this.DSO_SUBS,sub,id=>this.set({dsoSub:id,edit:null,mtEdit:null,dfEdit:null,dfQ:''}),true),
      sub==='mtype'?mtype
      :sub==='defect'?this.renderDefectLib()
                   :this.dsoCard('dsoLinePanel','dsoLineSub','DSO Line Setting',this.renderLineSetting()));
  }
  // ---- Line Setting -------------------------------------------------------
  // Chuyen + Style sinh tu Ke hoach san xuat (qua Ke hoach may tuan) -> chi doc.
  // Cac gia tri cau hinh khoa theo chuyen+style, KHONG theo tuan (day la bang master).
  // ==== Loại M-level: bảng danh mục (trái) + bảng chi tiết theo loại (phải) ====
  MTYPE_DEF=[{id:'m1',name:'1',desc:''},{id:'m2',name:'2',desc:''},{id:'m3',name:'3',desc:''}];
  mtypes(){ const t=this.state.dsoMtypeRows; return (t&&t.length)?t:this.MTYPE_DEF; }
  mtSelId(){ const l=this.mtypes(), s=this.state.mtSel;
    return (s&&l.some(m=>m.id===s))?s:(l.length?l[0].id:null); }
  mtDet(id){ return ((this.state.dsoMtypeDet||{})[id])||[]; }
  mtNextId(list,pre){ let n=0; (list||[]).forEach(x=>{ const m=String(x.id).match(/(\d+)$/); if(m) n=Math.max(n,Number(m[1])); }); return pre+(n+1); }
  setMtypes(fn){ this.setState(s=>{ const cur=(s.dsoMtypeRows&&s.dsoMtypeRows.length)?s.dsoMtypeRows:this.MTYPE_DEF;
    return {dsoMtypeRows:fn(cur)}; }); }
  setMtDet(id,fn){ this.setState(s=>{ const d={...(s.dsoMtypeDet||{})}; d[id]=fn(d[id]||[]); return {dsoMtypeDet:d}; }); }
  mtSetType(id,patch){ this.setMtypes(l=>l.map(m=>m.id===id?{...m,...patch}:m)); }
  mtAddType(){ this.setMtypes(l=>{ const id=this.mtNextId(l,'m');
    this._mtNew=id; return [...l,{id,name:'',desc:''}]; });
    setTimeout(()=>{ if(this._mounted&&this._mtNew) this.set({mtEdit:'t:'+this._mtNew,mtSel:this._mtNew}); },0); }
  mtDelType(id){ this.setState(s=>{ const d={...(s.dsoMtypeDet||{})}; delete d[id];
    const cur=(s.dsoMtypeRows&&s.dsoMtypeRows.length)?s.dsoMtypeRows:this.MTYPE_DEF;
    return {dsoMtypeRows:cur.filter(m=>m.id!==id),dsoMtypeDet:d,mtEdit:null,mtSel:s.mtSel===id?null:s.mtSel}; }); }
  mtSetDet(tid,did,patch){ this.setMtDet(tid,l=>l.map(x=>x.id===did?{...x,...patch}:x)); }
  mtAddDet(tid){ const id=this.mtNextId(this.mtDet(tid),'d');
    this.setMtDet(tid,l=>[...l,{id,name:'',tgt:'',inc:''}]);
    setTimeout(()=>{ if(this._mounted) this.set({mtEdit:'d:'+tid+':'+id}); },0); }
  mtDelDet(tid,did){ this.setMtDet(tid,l=>l.filter(x=>x.id!==did)); this.set({mtEdit:null}); }
  // Thu nhap: khong am (dau '-' bi loai luon vi khong nam trong [0-9.]), toi da 3 chu so thap phan.
  // Giu nguyen dang chuoi khi dang nhap de con go duoc dau '.' o giua -- giong lsDec1.
  mtMoney(v){ const s=String(v==null?'':v).replace(/[^0-9.]/g,''); const p=s.split('.');
    return p.length>1?p[0]+'.'+p.slice(1).join('').slice(0,3):p[0]; }
  // Bam Xong: don '.' bi bo lung ('4500.' -> '4500') va '.5' -> '0.5'
  mtMoneyFix(v){ let s=this.mtMoney(v);
    if(!/[0-9]/.test(s)) return '';              // chi co dau '.' hoac rong -> de trong
    if(s.charAt(0)==='.') s='0'+s;
    if(s.charAt(s.length-1)==='.') s=s.slice(0,-1);
    return s; }
  // Import: o Excel dang SO -> lay dung gia tri (lam tron 3 chu so thap phan).
  // O dang CHU -> '.'/',' coi la phan cach nghin (3.200.000), giu nguyen hanh vi cu.
  mtMoneyImp(v){ if(typeof v==='number'){ if(!isFinite(v)||v<0) return '';
      return String(Math.round(v*1000)/1000); }
    const n=parseInt(String(v==null?'':v).replace(/[^0-9]/g,''),10); return isNaN(n)?'':String(Math.max(0,n)); }
  // Import %Target cua BAC M. O Excel/CSV dinh dang PHAN TRAM tra ve PHAN SO:
  // 120% -> so 1.2, 60% -> 0.6. Truoc day dung lsPct: dau '.' bi XOA (1.2 -> 12)
  // roi con bi kep tran 100 -> target tren board M-level sai dung 10 lan.
  // disp = chuoi hien thi cua dung o do (raw:false), vd '120%' hay '130'.
  // Tran 999 theo mtPct, KHONG kep 100 -- bac M cao thuong vuot 100%.
  mtPctImp(v,disp){
    if(typeof v==='number'){ if(!isFinite(v)||v<0) return '';
      // Co '%' -> chac chan la phan so. So le nho (0.85) cung la phan so:
      // khong bac M nao dat muc 0.85%, con 85% thi rat thuong.
      const fr=/%/.test(String(disp==null?'':disp))||(v>0&&v<5&&v!==Math.floor(v));
      return this.mtPct(String(Math.round(fr?v*100:v))); }
    // O dang CHU: '120%' da la phan tram san, chi '0.85' moi phai nhan 100.
    const s=String(v==null?'':v), n=parseFloat(s.replace(/,/g,'.').replace(/[^0-9.]/g,''));
    if(!isFinite(n)||n<0) return '';
    const fr=!/%/.test(s)&&n>0&&n<5&&n!==Math.floor(n);
    return this.mtPct(String(Math.round(fr?n*100:n))); }
  mtMoneyFmt(v){ if(v===''||v==null) return '—';
    const s=String(v), i=s.indexOf('.');
    const g=(Number(i>=0?s.slice(0,i):s)||0).toLocaleString('en-US');
    const dec=i>=0?s.slice(i+1):'';
    return dec?g+'.'+dec:g; }
  mtDetDone(tid,did){ const r=this.mtDet(tid).find(x=>x.id===did);
    if(r) this.mtSetDet(tid,did,{inc:this.mtMoneyFix(r.inc)});
    this.set({mtEdit:null}); }
  // Thong bao inline, khong dung window.alert (dialog cua browser chan het tuong tac)
  mtSay(msg){ clearTimeout(this._mtT); this.set({mtMsg:msg});
    this._mtT=setTimeout(()=>{ if(this._mounted) this.set({mtMsg:''}); },4000); }
  // Doc header linh dong; khong co header thi doc theo vi tri No / Ten / %Target / Thu nhap
  // dsp = CUNG sheet do nhung doc dang chuoi hien thi (raw:false). Chi dung de
  // biet o %Target co dinh dang phan tram hay khong -- xem mtPctImp.
  mtParse(aoa,dsp){
    const norm=s=>String(s==null?'':s).toLowerCase().replace(/\s+/g,' ').trim();
    let hi=-1, map={};
    for(let i=0;i<Math.min((aoa||[]).length,10);i++){ const r=aoa[i]||[], m={};
      r.forEach((c,j)=>{ const v=norm(c); if(!v) return;
        if(m.name==null&&/\b(tên|ten|name)\b/.test(v)) m.name=j;
        else if(m.tgt==null&&/target/.test(v)) m.tgt=j;
        else if(m.inc==null&&/(thu nhập|thu nhap|income|vnd)/.test(v)) m.inc=j; });
      if(m.name!=null){ hi=i; map=m; break; } }
    const out=[], start=hi>=0?hi+1:0, useMap=hi>=0;
    // Giu CHI SO COT (tj/ij) chu khong giu gia tri: con phai doc dung o do trong dsp.
    for(let i=start;i<(aoa||[]).length;i++){ const r=aoa[i]||[], dr=((dsp||[])[i])||[];
      let name,tj,ij;
      if(useMap){ name=r[map.name]; tj=map.tgt!=null?map.tgt:-1; ij=map.inc!=null?map.inc:-1; }
      else if(r.length>=4){ name=r[1]; tj=2; ij=3; }
      else { name=r[0]; tj=1; ij=2; }
      const nm=String(name==null?'':name).trim();
      if(!nm) continue;
      out.push({name:nm,tgt:this.mtPctImp(tj>=0?r[tj]:'',tj>=0?dr[tj]:''),
        inc:this.mtMoneyImp(ij>=0?r[ij]:'')}); }
    return out; }
  async mtImport(file){
    const tid=this.mtSelId(); if(!tid||!file) return;
    const X=window.XLSX; if(!X||!X.read){ this.mtSay(this.t('mtNoXlsx')); return; }
    try{
      const buf=await file.arrayBuffer();
      const wb=X.read(new Uint8Array(buf),{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      // Doc 2 lan cung 1 sheet: gia tri thuc (raw) + chuoi hien thi (raw:false).
      // O %Target dinh dang phan tram cho ra 1.2 chu khong phai 120, phai co
      // chuoi '120%' moi biet duong ma nhan lai 100 (mtPctImp).
      const jopt={header:1,blankrows:false};
      const got=this.mtParse(X.utils.sheet_to_json(ws,jopt),
        X.utils.sheet_to_json(ws,{...jopt,raw:false}));
      if(!got.length){ this.mtSay(this.t('mtImportNone')); return; }
      this.setMtDet(tid,l=>{ let n=0; l.forEach(x=>{ const m=String(x.id).match(/(\d+)$/); if(m) n=Math.max(n,Number(m[1])); });
        return [...l,...got.map((g,i)=>({...g,id:'d'+(n+1+i)}))]; });
      this.mtSay(this.t('mtImportOk')+' '+got.length+' '+this.t('mtImportRows'));
    }catch(e){ this.mtSay(this.t('mtImportErr')); } }
  lsKey(r){ return this.normName(r.line)+'|'+String(r.style||''); }
  LS_DEF={w:26,hrs:'9.5',tgt:100};
  // SMV mac dinh: "random" 50..120 nhung SUY RA TU KHOA DONG, khong dung Math.random().
  // Random that se cho so khac nhau moi lan re-render, keo Type nhay theo -> khong dung duoc.
  lsSeedSmv(k){ let h=2166136261;
    for(let i=0;i<k.length;i++){ h^=k.charCodeAt(i); h=Math.imul(h,16777619); }
    return 50+(Math.abs(h)%71); }
  lsGet(r){ const k=this.lsKey(r);
    return {...this.LS_DEF,smv:this.lsSeedSmv(k),...((this.state.lset||{})[k]||{})}; }
  // Type suy ra tu SMV, khong sua tay: >100 -> loai 1, 60<smv<=100 -> loai 2, <=60 -> loai 3.
  lsTypeIdx(smv){ if(smv===''||smv==null) return 0; const n=Number(smv);
    if(!isFinite(n)) return 0; return n>100?1:(n>60?2:3); }
  // Tra ve dung '1'/'2'/'3' theo rule (bac suy tu SMV, khong phai vi tri dong).
  lsType(r){ const i=this.lsTypeIdx(this.lsGet(r).smv); return i?String(i):''; }
  // Dong trong DANH MUC M-level ung voi chuyen. Ba buoc, tu chac den lo:
  //   ten dung bang '1'/'2'/'3'  ->  ten co chua chu so do ('M1','Loai 1')  ->  vi tri.
  // Chi khop ten tuyet doi la doi ten danh muc mot cai board trong tron ngay.
  mtypeOf(r){ const i=this.lsTypeIdx(this.lsGet(r).smv); if(!i) return null;
    const list=this.mtypes()||[]; if(!list.length) return null;
    const s=String(i), dg=x=>String(x==null?'':x).replace(/[^0-9]/g,'');
    return list.find(m=>String(m.name||'').trim()===s)
        || list.find(m=>dg(m.name)===s)
        || list[i-1] || null; }
  // Nhan hien o cot LOAI: TEN trong danh muc, de doi chieu duoc voi man M-level.
  lsTypeLabel(r){ const m=this.mtypeOf(r);
    const nm=m?String(m.name||'').trim():''; return nm||this.lsType(r); }
  lsSet(r,patch){ const k=this.lsKey(r);
    this.setState(st=>({lset:{...(st.lset||{}),[k]:{...((st.lset||{})[k]||{}),...patch}}})); }
  // %Target cua BAC M-level: KHONG kep 100 nhu cot %Target cua chuyen -- bac M
  // cao thuong vuot 100% hieu suat. Van la so nguyen khong am, tran 999.
  mtPct(v){ const n=parseInt(String(v).replace(/[^0-9]/g,''),10);
    return isNaN(n)?'':Math.max(0,Math.min(999,n)); }
  // %target: so nguyen 0..100, khong am, khong thap phan
  lsPct(v){ const n=parseInt(String(v).replace(/[^0-9]/g,''),10); return isNaN(n)?'':Math.max(0,Math.min(100,n)); }
  lsNum(v){ const n=parseInt(String(v).replace(/[^0-9]/g,''),10); return isNaN(n)?'':Math.max(0,n); }
  // Khong am, toi da 1 chu so thap phan -- dung cho ca Gio lam va SMV.
  // Bo dau '-' va ky tu la (khong nam trong [0-9.]), giu dau '.' dau tien.
  // Tra ve CHUOI de con go duoc trang thai trung gian '9.'
  // Doi ',' -> '.' truoc khi loc: ban go tieng Viet hay dung dau phay lam dau
  // thap phan; khong doi thi '95,5' thanh '955' (nhay han sang loai 1) khong ai biet.
  lsDec1(v){ const s=String(v==null?'':v).replace(/,/g,'.').replace(/[^0-9.]/g,''); const p=s.split('.');
    return p.length>1?p[0]+'.'+p.slice(1).join('').slice(0,1):p[0]; }
  // Don dau vao con do dang: '9.' -> '9', '.5' -> '0.5', chi co '.' -> de trong
  lsDec1Fix(v){ let s=this.lsDec1(v);
    if(!/[0-9]/.test(s)) return '';
    if(s.charAt(0)==='.') s='0'+s;
    if(s.charAt(s.length-1)==='.') s=s.slice(0,-1);
    return s; }
  // Bam Xong: don ca 2 cot thap phan. Chi sua o da go tay (kieu string) --
  // SMV chua sua la SO tu lsSeedSmv, khong duoc bien thanh chuoi o day.
  lsDone(r){ const v=this.lsGet(r), p={};
    ['hrs','smv'].forEach(f=>{ if(typeof v[f]!=='string') return;
      const s=this.lsDec1Fix(v[f]); if(s!==v[f]) p[f]=s; });
    if(Object.keys(p).length) this.lsSet(r,p);
    this.set({lsEdit:null}); }
  lsFileSize(n){ n=Number(n)||0; return n<1024?n+' B':(n<1048576?(n/1024).toFixed(0)+' KB':(n/1048576).toFixed(1)+' MB'); }
  async lsImport(r,file){ if(!file) return;
    const k=this.lsKey(r);
    try{ await this.mlvPut(k,file);
      this.lsSet(r,{file:{name:file.name,size:file.size,at:Date.now()}}); }
    catch(e){ window.alert(this.t('lsFileErr')); } }
  async lsFileDel(r){ const k=this.lsKey(r);
    try{ await this.mlvDel(k); }catch(e){}
    this.lsSet(r,{file:null}); }

  // 1 card / 1 CHUYEN. Mot chuyen chay nhieu style -> Line Setting co nhieu dong
  // nhung van chi 1 card; uu tien dong da duoc cau hinh that.
  prodLines(){ const by={}, order=[], stored=this.state.lset||{};
    this.getWeek().rows.forEach(r=>{ const n=this.normName(r.line);
      if(!by[n]){ by[n]=[]; order.push(n); } by[n].push(r); });
    return order.map(n=>{ const rows=by[n];
      const pick=rows.find(r=>stored[this.lsKey(r)])||rows[0];
      return {line:n,cfg:this.lsGet(pick)}; }); }

  // ---- Detail 1 chuyen: 1 card / (Size x PO x Mau) ----------------------
  // Nguon: don dang chay cua chuyen trong Ke hoach san xuat -> psPlan(o) ra
  // tac nghiep cat -> section (mau vai, bo 'aux') -> demand theo size.
  dsoSizeCards(line){ const out=[];
    this.psActiveOrders().forEach(o=>{
      if(this.normName(o.line)!==line) return;
      const pl=this.psPlan(o); if(!pl) return;
      const style=this.psCode(o.code);
      const po=this.orderPo(o,pl);
      (pl.sections||[]).forEach(sec=>{ if(sec.grp==='aux') return;
        (sec.demand||[]).forEach(([sz,qty])=>{ if(!(Number(qty)>0)) return;
          out.push({line,style,size:sz,need:Number(qty),po,color:sec.fab||'\u2014'}); }); }); });
    // xep theo thu tu size chuan roi den mau, dung thu tu trong file
    const oi=z=>{ const i=this.SORDER.indexOf(z); return i<0?99:i; };
    return out.sort((a,b)=>oi(a.size)-oi(b.size)||String(a.po).localeCompare(String(b.po))||String(a.color).localeCompare(String(b.color)));
  }
  dsoStyles(line){ const out=[];
    this.getWeek().rows.forEach(r=>{ if(this.normName(r.line)!==line) return;
      const st=r.style||''; if(st&&out.indexOf(st)<0) out.push(st); });
    return out; }
  dsoToday(){ return this.psFmtD(new Date()); }
  dsoDay(d){ const p=String(d||'').split('-'); return p.length>2?(p[2]+'/'+p[1]+'/'+p[0]):String(d||''); }
  dsoRowKey(c,day){ return [day||this.dsoToday(),c.line,c.style,c.po,c.color].join('|'); }
  dsoDoneKey(c,day){ return this.dsoRowKey(c,day)+'|'+c.size; }
  // Card size hien TONG luy ke -> cong het moi ngay
  dsoDoneOf(c){ const m=this.state.dsoDone||{}; const tail='|'+c.line+'|'+c.style+'|'+c.po+'|'+c.color+'|'+c.size;
    let n=0; Object.keys(m).forEach(k=>{ if(k.slice(-tail.length)===tail) n+=Number(m[k])||0; }); return n; }
  // 'HH:MM' -- NGAY da nam trong khoa nen moc chi can gio/phut
  dsoHM(d){ const t=d||new Date(), p=n=>String(n).padStart(2,'0');
    return p(t.getHours())+':'+p(t.getMinutes()); }
  // Gio PASS cua tung san pham, theo dung thu tu bam. Bo trong 'day' -> gop MOI
  // ngay cua o size do, sap tang dan. CO Y KHONG ve o bang Daily completion
  // history -- bang do chi tong hop so luong; day la du lieu de truy nguoc.
  dsoPassTimes(c,day){ const m=this.state.dsoPassLog||{}, out=[];
    const push=k=>(m[k]||[]).forEach(t=>out.push({day:k.split('|')[0],at:t}));
    if(day){ push(this.dsoDoneKey(c,day)); return out; }
    const tail='|'+c.line+'|'+c.style+'|'+c.po+'|'+c.color+'|'+c.size;
    Object.keys(m).sort().forEach(k=>{ if(k.slice(-tail.length)===tail) push(k); });
    return out; }
  // Chi ghi/sua san luong cua HOM NAY; so cua ngay truoc giu nguyen trong lich su
  // 1 lan bam ghi vao 2 so tay dung CHUNG mot khoa: so luong ngay (dsoDone) va
  // moc gio PASS tung san pham (dsoPassLog). Bang M-level lay SAN LUONG / GIO
  // tu chinh dsoPassLog -- khong con so tay thu ba de co the lech voi lich su.
  // Doc new Date() MOT lan roi dung chung: doc 2 lan, bam dung luc doi ngay ->
  // so luong vao ngay nay ma moc gio vao ngay kia.
  dsoBump(c,d){ const now=new Date(), day=this.psFmtD(now);
    const k=this.dsoDoneKey(c,day), at=this.dsoHM(now);
    this.setState(st=>{ const m={...(st.dsoDone||{})};
      const pv=Number(m[k])||0, nx=Math.max(0,pv+d), dd=nx-pv;
      m[k]=nx; if(!m[k]) delete m[k];
      // dd>0: moi san pham PASS them 1 moc HH:MM. dd<0 (bam nham): bo bot tu
      // cuoi -- moc bi xoa la lan bam gan nhat, dung voi y nghia 'tru 1 vua bam'.
      // Vi tru dung moc do nen cot gio cua no giam theo, khong phai cot gio hien tai.
      const pm={...(st.dsoPassLog||{})}, ls=(pm[k]||[]).slice();
      if(dd>0){ for(let i=0;i<dd;i++) ls.push(at); }
      else if(dd<0){ ls.length=Math.max(0,ls.length+dd); }
      if(ls.length) pm[k]=ls; else delete pm[k];
      return {dsoDone:m,dsoPassLog:pm}; }); }
  // Tong hop theo (ngay, style, PO, mau). Bo trong 'line' -> lay MOI chuyen,
  // day la duong dung cho bang tong hop o cap Daily Sewing Output sau nay.
  dsoHistory(line){ const m=this.state.dsoDone||{}, at={}, out=[];
    Object.keys(m).forEach(k=>{ const q=Number(m[k])||0; if(q<=0) return;
      const p=k.split('|'); if(p.length!==6) return;
      if(line&&p[1]!==line) return;
      const rk=p.slice(0,5).join('|');
      if(!at[rk]){ at[rk]={key:rk,day:p[0],line:p[1],style:p[2],po:p[3],color:p[4],qty:0,sizes:{}}; out.push(at[rk]); }
      at[rk].qty+=q; at[rk].sizes[p[5]]=(at[rk].sizes[p[5]]||0)+q; });
    return out.sort((a,b)=>String(b.day).localeCompare(String(a.day))
      ||String(a.line).localeCompare(String(b.line))||String(a.style).localeCompare(String(b.style))
      ||String(a.po).localeCompare(String(b.po))||String(a.color).localeCompare(String(b.color))); }
  // ==== Da giao sang hoan thien =========================================
  // Giao theo SO LUONG chu khong con la co bat/tat:
  //   dsoHandQ  cung khoa voi dsoDone (ngay|chuyen|style|PO|mau|size) -> da giao bao nhieu
  //   dsoHand   moc gio 1 DONG duoc giao XONG (bang lich su van hien 'Da giao ...')
  //   dsoSlips  cac to phieu da phat hanh, de mo xem / in lai
  dsoHandQOf(k){ return Number((this.state.dsoHandQ||{})[k])||0; }
  // Con lai chua giao cua 1 dong lich su
  dsoRemain(row){ const o=row.sizes||{}, out={}; let n=0;
    Object.keys(o).forEach(z=>{ const q=(Number(o[z])||0)-this.dsoHandQOf(row.key+'|'+z);
      if(q>0){ out[z]=q; n+=q; } });
    return {sizes:out,qty:n}; }
  dsoHandedQty(row){ return Math.max(0,row.qty-this.dsoRemain(row).qty); }
  dsoHandAt(row){ return (this.state.dsoHand||{})[row.key]||0; }
  // Da DAT nhung chua giao het -- TAT CA cac ngay, khong chi hom nay
  dsoUnhanded(line){ return this.dsoHistory(line).filter(r=>this.dsoRemain(r).qty>0); }
  // Tat ca hang con cho giao trong pham vi dang xem, gop LAM MOT theo size.
  // Khong tach theo ma hang -- 1 lan nhap so luong la giao chung; ma hang \u00b7 PO \u00b7
  // mau nao thuc su di theo phieu thi doc ra tu phan bo ben duoi.
  dsoHandPool(line){ const rows=[], sizes={}; let qty=0;
    this.dsoUnhanded(line).forEach(r=>{ const rem=this.dsoRemain(r);
      rows.push({row:r,rem:rem.sizes});
      Object.keys(rem.sizes).forEach(z=>{ sizes[z]=(sizes[z]||0)+rem.sizes[z]; });
      qty+=rem.qty; });
    // ngay cu di truoc, cung ngay thi theo chuyen roi ma hang
    rows.sort((a,b)=>String(a.row.day).localeCompare(String(b.row.day))
      ||String(a.row.line).localeCompare(String(b.row.line))
      ||String(a.row.style).localeCompare(String(b.row.style)));
    const uniq=f=>{ const o=[]; rows.forEach(x=>{ const v=f(x.row); if(o.indexOf(v)<0) o.push(v); }); return o; };
    return {rows:rows,sizes:sizes,qty:qty,lines:uniq(r=>r.line).sort(),days:uniq(r=>r.day).sort()}; }
  // Chia so luong muon giao ve tung dong lich su: ngay cu di truoc (FIFO)
  dsoAlloc(pool,want){ const out=[], left={...(want||{})};
    (pool.rows||[]).forEach(({row,rem})=>{ const take={}; let n=0;
      Object.keys(rem).forEach(z=>{ const w=Math.max(0,Math.min(Number(left[z])||0,rem[z]));
        if(w>0){ take[z]=w; left[z]=(Number(left[z])||0)-w; n+=w; } });
      if(n) out.push({key:row.key,day:row.day,line:row.line,style:row.style,po:row.po,color:row.color,
        sizes:take,qty:n}); });
    return out; }

  // ---- To phieu ban giao (BG-YYYYMMDD-NNN) ------------------------------
  // So phieu chay theo ngay phat hanh; phieu chua chot lay so ke tiep cua hom nay.
  dsoSlipDay(ts){ const d=new Date(ts), p=n=>String(n).padStart(2,'0');
    return String(d.getFullYear())+p(d.getMonth()+1)+p(d.getDate()); }
  dsoSlipWhen(ts){ const d=new Date(ts), p=n=>String(n).padStart(2,'0');
    return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()
      +' \u00b7 '+p(d.getHours())+':'+p(d.getMinutes()); }
  dsoSlipList(){ return this.state.dsoSlips||[]; }
  // So thu tu trong ngay CHI TANG, khong bao gio quay dau.
  // Truoc day dem so phieu con song (list.length+1): huy 1 phieu la so tut lai,
  // to sau in trung so cua to da phat hanh. Doc them so lon nhat da dong dau
  // tren cac phieu con luu, de ban luu co san khong dung lai so.
  dsoSlipSeqAt(st,day){ const pre='SF-'+day+'-';
    let n=Number((st.dsoSlipSeq||{})[day])||0;
    (st.dsoSlips||[]).forEach(x=>{ const s=String(x.no||'');
      if(s.indexOf(pre)===0) n=Math.max(n,Number(s.slice(pre.length))||0); });
    return n; }
  // Ma phieu ban giao May -> Hoan thien: SF-yyyymmdd-nnn.
  //   da chot  -> tra dung 'no' da dong dau (so chung tu khong doi)
  //   ban nhap -> xem truoc so ke tiep cua hom nay
  //   da chot ma KHONG co so (ban luu doi cu, hoac dong 'da giao' khong co
  //   phieu) -> '—'. Tuyet doi khong bia so moi cho mot to sap in.
  dsoSlipNo(s){ if(s.no) return s.no;
    if(s.ts) return '\u2014';
    const day=this.dsoSlipDay(Date.now());
    return 'SF-'+day+'-'+String(this.dsoSlipSeqAt(this.state,day)+1).padStart(3,'0'); }
  // Tong da giao (moi chuyen, moi ngay) cua 1 ma hang \u00b7 PO \u00b7 mau
  dsoHandedTot(style,po,color){ let n=0;
    this.dsoHistory(null).forEach(r=>{ if(r.style===style&&r.po===po&&r.color===color)
      n+=this.dsoHandedQty(r); });
    return n; }
  // Luy ke den to phieu nay -- chot lai luc phat hanh, phieu sau khong lam doi
  dsoSlipCum(s){ return s.cum!=null?s.cum
    :(this.dsoHandedTot(s.style,s.po,s.color)+(s.ts?0:s.qty)); }
  // Phieu moi cho 1 dong lich su: giao het phan con lai cua dong do
  dsoRowSlipNew(row){ const rem=this.dsoRemain(row);
    return {id:'row|'+row.key,ts:0,style:row.style,po:row.po,color:row.color,line:row.line,
      dayTxt:this.dsoDay(row.day),sizes:rem.sizes,qty:rem.qty,
      alloc:[{key:row.key,day:row.day,line:row.line,sizes:rem.sizes,qty:rem.qty}]}; }
  // To phieu gan nhat da di qua dong nay -- bam badge 'Da giao' de xem / in lai.
  // Ban luu cu chi co moc gio, khong co phieu -> dung tam so lieu cua dong.
  dsoRowSlipLast(row){ const hit=this.dsoSlipList().filter(s=>(s.alloc||[]).some(a=>a.key===row.key));
    if(hit.length) return hit[hit.length-1];
    const at=this.dsoHandAt(row); if(!at) return null;
    return {id:'row|'+row.key,ts:at,style:row.style,po:row.po,color:row.color,line:row.line,
      dayTxt:this.dsoDay(row.day),sizes:row.sizes,qty:row.qty,
      alloc:[{key:row.key,day:row.day,line:row.line,sizes:row.sizes,qty:row.qty}]}; }
  // Phat hanh phieu: ghi so da giao vao so, danh dau dong nao da giao xong,
  // luu phieu lai roi mo chinh to phieu do ra.
  dsoSlipCommit(slip){ const ts=Date.now(), id='BG'+ts, day=this.dsoSlipDay(ts);
    const base={...slip,id:id,ts:ts,
      cum:slip.cum!=null?slip.cum:(this.dsoHandedTot(slip.style,slip.po,slip.color)+slip.qty)};
    delete base.back;
    this.setState(st=>{ const q={...(st.dsoHandQ||{})}, hd={...(st.dsoHand||{})}, done=st.dsoDone||{};
      // Cap so NGAY TRONG updater roi tang bo dem trong cung mot lan ghi:
      // hai lan phat hanh khong the ra cung so, va huy phieu khong tra so lai.
      const seq=this.dsoSlipSeqAt(st,day)+1;
      const rec={...base,no:'SF-'+day+'-'+String(seq).padStart(3,'0')};
      (rec.alloc||[]).forEach(a=>Object.keys(a.sizes||{}).forEach(z=>{
        const k=a.key+'|'+z; q[k]=(Number(q[k])||0)+(Number(a.sizes[z])||0); }));
      (rec.alloc||[]).forEach(a=>{ let full=true;
        Object.keys(done).forEach(k=>{ if(k.indexOf(a.key+'|')!==0) return;
          if((Number(q[k])||0)<(Number(done[k])||0)) full=false; });
        if(full&&!hd[a.key]) hd[a.key]=ts; });
      // ten da go o ban nhap chuyen sang so phieu chinh thuc
      const who={...(st.dsoHandWho||{})};
      if(slip.id&&slip.id!==id){ if(who[slip.id]) who[id]=who[slip.id]; delete who[slip.id]; }
      return {dsoHandQ:q,dsoHand:hd,dsoSlips:[...(st.dsoSlips||[]),rec],dsoHandWho:who,
        dsoSlipSeq:{...(st.dsoSlipSeq||{}),[day]:seq},
        dsoHandAsk:rec,dsoHandBulk:null}; });
    document.body.classList.add('bg-slip-open'); }
  // Huy 1 to phieu: tra lai so luong cho tat ca cac dong tren phieu
  dsoSlipVoid(id){ this.setState(st=>{ const list=st.dsoSlips||[];
    const s=list.find(x=>x.id===id); if(!s) return null;
    const q={...(st.dsoHandQ||{})}, hd={...(st.dsoHand||{})};
    (s.alloc||[]).forEach(a=>{ Object.keys(a.sizes||{}).forEach(z=>{ const k=a.key+'|'+z;
        const n=(Number(q[k])||0)-(Number(a.sizes[z])||0); if(n>0) q[k]=n; else delete q[k]; });
      delete hd[a.key]; });
    return {dsoHandQ:q,dsoHand:hd,dsoSlips:list.filter(x=>x.id!==id),dsoHandAsk:null}; });
    document.body.classList.remove('bg-slip-open'); }
  // Bo danh dau da giao o 1 dong: huy to phieu da di qua dong do
  dsoRowUndo(row){ const s=this.dsoRowSlipLast(row);
    if(s&&this.dsoSlipList().some(x=>x.id===s.id)) return this.dsoSlipVoid(s.id);
    this.setState(st=>{ const q={...(st.dsoHandQ||{})}, hd={...(st.dsoHand||{})};
      Object.keys(st.dsoDone||{}).forEach(k=>{ if(k.indexOf(row.key+'|')===0) delete q[k]; });
      delete hd[row.key]; return {dsoHandQ:q,dsoHand:hd}; }); }
  // Ten nguoi giao / nguoi nhan go tay tren phieu, luu theo tung to phieu
  dsoWho(s){ return (this.state.dsoHandWho||{})[s.id]||{}; }
  dsoWhoSet(s,patch){ this.setState(st=>{ const m={...(st.dsoHandWho||{})};
    m[s.id]={...(m[s.id]||{}),...patch}; return {dsoHandWho:m}; }); }
  // Class tren <body> de @media print chi in ra to phieu (xem style.css)
  dsoSlipOpen(slip){ if(!slip) return; this.set({dsoHandAsk:slip});
    document.body.classList.add('bg-slip-open'); }
  // Tro ve hop chon so luong, giu nguyen so vua go
  dsoSlipBack(slip){ this.set({dsoHandAsk:null,dsoHandBulk:(slip&&slip.back)||null});
    document.body.classList.remove('bg-slip-open'); }
  dsoSlipClose(){ this.set({dsoHandAsk:null}); document.body.classList.remove('bg-slip-open'); }
  // [size, so luong] theo thu tu size chuan (XXS..6XL), size la xep cuoi
  dsoSizeList(sizes){ const o=sizes||{}, zs=this.SORDER.filter(z=>o[z]);
    Object.keys(o).forEach(z=>{ if(zs.indexOf(z)<0) zs.push(z); });
    return zs.map(z=>[z,o[z]]); }

  // 'XS 3 \u00b7 M 5' theo thu tu size chuan
  dsoSizeText(sizes){ return this.dsoSizeList(sizes)
    .map(([z,q])=>z+' '+this.fmt(q)).join(' \u00b7 '); }
  // Tim khong dau tren dung nhung truong dang hien tren bang. Ngay khop ca 2 dang
  // ('22/08/2026' va '2026-08-22') nen go kieu nao cung ra.
  dsoRowHit(r,q,extra){ const k=this.dfFold(q); if(!k) return true;
    const parts=[this.dsoDay(r.day),r.day,r.line,r.style,r.po,r.color];
    if(r.sizes) parts.push(Object.keys(r.sizes).join(' '));
    if(r.size) parts.push(r.size);
    if(extra) parts.push(extra);
    const hay=this.dfFold(parts.join(' '));
    return k.split(/\s+/).every(w=>hay.indexOf(w)>=0); }
  // Ten loi tra ve tu Thu Vien Loi theo ma. Sua ten trong thu vien thi lich su
  // doi theo -- thu vien la nguon su that duy nhat cho danh muc loi.
  dsoDefName(code){ const c=String(code||'').trim();
    const d=this.defects().find(x=>String(x.code||'').trim()===c);
    return d?String(d.name||'').trim():''; }
  // 1 dong = 1 (ngay, GIO, chuyen, style, PO, mau, size, ma loi). Bam nhieu lan
  // trong CUNG mot phut cho cung ma loi thi gop lai 1 dong voi so luong -- bang
  // van gon ma khong mat moc gio nao.
  // Ban ghi cu (truoc khi co dsoDefTime) khong co moc gio: phan con thieu do vao
  // 1 dong at:'' de tong so luong luon khop voi dsoDefLog.
  // Bo trong 'line' -> moi chuyen.
  dsoDefHistory(line){ const m=this.state.dsoDefLog||{}, tm=this.state.dsoDefTime||{}, out=[];
    const oi=z=>{ const i=this.SORDER.indexOf(z); return i<0?99:i; };
    Object.keys(m).forEach(k=>{ const p=k.split('|'); if(p.length!==6) return;
      if(line&&p[1]!==line) return;
      const o=m[k]||{};
      Object.keys(o).forEach(code=>{ let q=Number(o[code])||0; if(q<=0) return;
        const base={day:p[0],line:p[1],style:p[2],po:p[3],color:p[4],size:p[5],code:code};
        const ls=(tm[k+'|'+code]||[]).slice(0,q), by={}, ord=[];
        ls.forEach(at=>{ if(by[at]===undefined){ by[at]=0; ord.push(at); } by[at]++; });
        ord.forEach(at=>{ out.push({...base,key:k+'|'+code+'|'+at,at:at,qty:by[at]}); });
        q-=ls.length;
        if(q>0) out.push({...base,key:k+'|'+code+'|-',at:'',qty:q}); }); });
    return out.sort((a,b)=>String(b.day).localeCompare(String(a.day))
      ||String(b.at).localeCompare(String(a.at))
      ||String(a.line).localeCompare(String(b.line))||String(a.style).localeCompare(String(b.style))
      ||String(a.po).localeCompare(String(b.po))||String(a.color).localeCompare(String(b.color))
      ||oi(a.size)-oi(b.size)||String(a.code).localeCompare(String(b.code))); }

  // ---- Xuat Excel bang lich su hang loi ------------------------------------
  // Xuat DUNG nhung dong dang thay: cung bo loc chuyen, cung tu khoa tim, cung
  // thu tu sap xep -- nguoi dung loc gi tren man hinh thi file ra dung the.
  // Cot LY DO tren bang gop ma+ten trong 1 o; ra Excel tach lam 2 cot cho de
  // loc va pivot. Cot CHUYEN chi co khi dang xem tat ca chuyen, giong bang.
  dsoDefExport(line){
    const X=window.XLSX;
    if(!X||!X.utils){ window.alert(this.t('mtNoXlsx')); return; }
    const q=this.state.dsoDefQ||'';
    const rows=this.dsoDefHistory(line)
      .filter(r=>this.dsoRowHit(r,q,r.at+' '+r.code+' '+this.dsoDefName(r.code)));
    if(!rows.length){ window.alert(this.t(this.dsoDefHistory(line).length?'dfNoHit':'dsoDefHistEmpty')); return; }
    const head=[this.t('dsoColDay'),this.t('dsoColTime')];
    if(!line) head.push(this.t('lsCol1'));
    head.push(this.t('lsCol2'),this.t('dsoColPo'),this.t('dsoColColor'),this.t('dsoColSize'),
      this.t('dfCode'),this.t('dfName'),this.t('dsoColDefQty'));
    const who=line||this.t('dsoDefAllLines');
    const aoa=[[this.t('dsoDefHist')],['YIC HÀ NAM · '+who+' · '+this.todayStamp()],[],head];
    rows.forEach(r=>{ const a=[this.dsoDay(r.day),r.at||''];
      if(!line) a.push(r.line||'');
      a.push(r.style||'',r.po||'',r.color||'',r.size||'',r.code||'',this.dsoDefName(r.code),Number(r.qty)||0);
      aoa.push(a); });
    const tot=new Array(head.length).fill('');
    tot[0]=this.t('bkTot'); tot[head.length-1]=rows.reduce((a,r)=>a+(Number(r.qty)||0),0);
    aoa.push(tot);
    const ws=X.utils.aoa_to_sheet(aoa);
    ws['!cols']=(line?[13,8]:[13,8,12]).concat([18,13,15,9,12,30,15]).map(w=>({wch:w}));
    const wb=X.utils.book_new(); X.utils.book_append_sheet(wb,ws,'Defect History');
    X.writeFile(wb,('YIC-HaNam_Defect-History_'+(line||'ALL')+'_'+this.todayStamp())
      .replace(/[^0-9A-Za-z]+/g,'-').replace(/-+$/,'')+'.xlsx'); }

  // ---- Hop chon so luong giao (mo tu nut 'Giao sang hoan thien (n)') ----
  dsoBulkOpen(line){ const p=this.dsoHandPool(line||null);
    this.set({dsoHandBulk:{line:line||'',qty:{...p.sizes}}}); }
  dsoBulkPool(){ const b=this.state.dsoHandBulk; if(!b) return null;
    return this.dsoHandPool(b.line||null); }
  // Go so: chi nhan so nguyen 0..con lai
  dsoBulkSet(z,v,max){ const n=Math.max(0,Math.min(Number(String(v).replace(/[^\d]/g,''))||0,max||0));
    this.setState(st=>{ const b=st.dsoHandBulk; if(!b) return null;
      const q={...(b.qty||{})}; q[z]=n; return {dsoHandBulk:{...b,qty:q}}; }); }
  dsoBulkFill(on){ this.setState(st=>{ const b=st.dsoHandBulk; if(!b) return null;
    const p=this.dsoHandPool(b.line||null);
    return {dsoHandBulk:{...b,qty:on?{...p.sizes}:{}}}; }); }
  dsoBulkQty(){ const b=this.state.dsoHandBulk, p=this.dsoBulkPool(); if(!b||!p) return 0;
    return Object.keys(p.sizes).reduce((a,z)=>a+Math.min(Number((b.qty||{})[z])||0,p.sizes[z]),0); }
  // Chot: chia so luong ve cac dong roi phat hanh phieu. Ma hang \u00b7 PO \u00b7 mau \u00b7
  // chuyen \u00b7 ngay tren phieu lay tu dung nhung dong da bi tru.
  dsoBulkOk(){ const b=this.state.dsoHandBulk, p=this.dsoBulkPool(); if(!b||!p) return;
    const want={}; let n=0;
    Object.keys(p.sizes).forEach(z=>{ const v=Math.max(0,Math.min(Number((b.qty||{})[z])||0,p.sizes[z]));
      if(v>0){ want[z]=v; n+=v; } });
    if(!n) return;
    const alloc=this.dsoAlloc(p,want);
    const pick=f=>{ const o=[]; alloc.forEach(a=>{ const v=f(a); if(o.indexOf(v)<0) o.push(v); }); return o; };
    const days=pick(a=>a.day).sort(), seen={};
    // Luy ke: cong don cua tung ma hang \u00b7 PO \u00b7 mau co mat tren phieu
    const cum=alloc.reduce((s,a)=>{ const k=a.style+'|'+a.po+'|'+a.color;
      if(seen[k]) return s; seen[k]=1; return s+this.dsoHandedTot(a.style,a.po,a.color); },0)+n;
    this.set({dsoHandBulk:null});
    this.dsoSlipOpen({id:'draft|'+(b.line||''),ts:0,back:{line:b.line||'',qty:{...(b.qty||{})}},
      style:pick(a=>a.style).join(' + '),po:pick(a=>a.po).join(' + '),
      color:pick(a=>a.color).join(' + '),line:pick(a=>a.line).sort().join(' + '),
      dayTxt:days.length>1?(this.dsoDay(days[0])+' \u2192 '+this.dsoDay(days[days.length-1]))
        :this.dsoDay(days[0]),
      sizes:want,qty:n,cum:cum,alloc:alloc}); }

  renderDsoLineDetail(line){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const cards=this.dsoSizeCards(line), styles=this.dsoStyles(line);
    const need=cards.reduce((a,c)=>a+c.need,0), done=cards.reduce((a,c)=>a+this.dsoDoneOf(c),0);
    const fail=cards.reduce((a,c)=>a+this.dsoDefOf(c),0);
    const back=h('button',{onClick:()=>this.set({dsoLine:null}),
      style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:9,padding:'6px 13px',
        fontSize:12.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',marginBottom:14},
      'style-hover':{background:C.tint}},this.t('dsoBack'));
    // Card summary full size: ten chuyen + style (+ tong da lam/can lam)
    const summary=h('div',{style:{border:'1px solid '+C.border,borderRadius:14,background:C.tint2,
        boxShadow:C.shadow,padding:'16px 20px',marginBottom:16,display:'flex',alignItems:'center',
        flexWrap:'wrap',gap:16}},
      h('div',{style:{minWidth:0,flex:1}},
        h('div',{style:{fontSize:22,fontWeight:700,color:C.primary,fontFamily:mono,lineHeight:1.1}},line),
        h('div',{style:{fontSize:13,color:C.sub,marginTop:4,wordBreak:'break-all'}},
          styles.length?styles.join(' \u00b7 '):'\u2014')),
      // 3 o rieng: DAT / LOI / CAN LAM -- truoc day gop 'da lam / can lam' vao 1 o
      h('div',{style:{flex:'none',display:'flex',gap:10,flexWrap:'wrap'}},
        [[this.t('dsoPass'),done,'#2f7d32','#eff7e9','#cfe3b4'],
         [this.t('dsoFail'),fail,'#a3271b','#fdeeec','#eccfca'],
         [this.t('dsoReq'),need,C.ink,C.white,C.border]].map(([lb,v,fg,bg,bd])=>
          h('div',{key:lb,style:{flex:'none',minWidth:96,border:'1px solid '+bd,background:bg,
              borderRadius:12,padding:'9px 14px'}},
            h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,
              whiteSpace:'nowrap'}},lb),
            h('div',{style:{fontSize:21,fontWeight:700,fontFamily:mono,color:fg,marginTop:3,
              lineHeight:1}},this.fmt(v))))));
    if(!cards.length) return h('div',{style:{padding:'18px 20px 24px'}},back,summary,
      h('div',{style:{padding:'48px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('dsoNoCut')));
    // ---- Ma tran: 1 dong = 1 mau (theo tung PO), cot = size tang dan --------
    // Cot lay hop cac size cua ca chuyen roi xep theo SORDER (XXS..6XL), nen moi
    // dong deu co du o; mau nao khong co size do thi o de TRONG cho thang hang.
    const known=this.SORDER.filter(z=>cards.some(c=>c.size===z));
    const other=[]; cards.forEach(c=>{ if(this.SORDER.indexOf(c.size)<0&&other.indexOf(c.size)<0) other.push(c.size); });
    const cols=known.concat(other);
    const rmap={}, rows=[];
    cards.forEach(c=>{ const rk=c.po+'|'+c.color;
      if(!rmap[rk]){ rmap[rk]={k:rk,po:c.po,color:c.color,by:{}}; rows.push(rmap[rk]); }
      rmap[rk].by[c.size]=c; });
    rows.sort((a,b)=>String(a.po).localeCompare(String(b.po))||String(a.color).localeCompare(String(b.color)));
    const gt='repeat('+(cols.length||1)+',minmax(150px,1fr))';
    const cell=(c)=>{ const d=this.dsoDoneOf(c), ok=d>=c.need, nf=this.dsoDefOf(c);
        return h('div',{key:this.dsoDoneKey(c),onClick:()=>this.dsoTapOpen(c),title:this.t('dsoTapAdd'),
          style:{border:'1px solid '+(ok?'#cfe3b4':C.border),borderRadius:13,background:ok?'#f4f9ec':C.white,
            boxShadow:C.shadow,cursor:'pointer',overflow:'hidden',userSelect:'none'},
          'style-hover':{borderColor:C.primary}},
          h('div',{style:{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:8,padding:'11px 13px 9px'}},
            h('span',{style:{fontSize:26,fontWeight:700,lineHeight:1,color:C.ink,letterSpacing:'-.5px'}},c.size),
            h('span',{style:{display:'inline-flex',alignItems:'center',gap:6,flex:'none'}},
              nf?h('span',{title:this.fmt(nf)+' '+this.t('dsoDefLogged'),
                style:{fontSize:10.5,fontWeight:700,fontFamily:mono,color:'#a3271b',background:'#fdecea',
                  border:'1px solid #eccfca',borderRadius:999,padding:'1px 6px',whiteSpace:'nowrap'}},
                '✕ '+this.fmt(nf)):null,
              h('span',{style:{fontSize:14,fontWeight:700,fontFamily:mono,color:ok?'#2f7d32':C.ink,whiteSpace:'nowrap'}},
                this.fmt(d)+'/'+this.fmt(c.need)),
              h('button',{title:this.t('dsoTapSub'),onClick:e=>{ e.stopPropagation(); this.dsoBump(c,-1); },
                style:{flex:'none',width:19,height:19,lineHeight:1,border:'1px solid '+C.border,background:C.white,
                  color:C.sub,borderRadius:6,cursor:'pointer',padding:0,fontSize:13,fontFamily:'inherit'}},'\u2212'))),
          h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,
              padding:'7px 13px 9px',borderTop:'1px solid '+C.line,background:ok?'rgba(255,255,255,.5)':'#fbfcf8'}},
            h('span',{style:{fontSize:11.5,fontWeight:600,fontFamily:mono,color:C.sub,whiteSpace:'nowrap'}},c.po),
            h('span',{style:{fontSize:11.5,fontWeight:700,color:C.dark,whiteSpace:'nowrap'}},c.color))); };
    // hang tieu de size -- de doc duoc cot nao la size nao khi o bi bo trong
    const head=h('div',{key:'hd',style:{display:'grid',gridTemplateColumns:gt,gap:10,marginBottom:7}},
      cols.map(z=>h('div',{key:z,style:{fontSize:11,fontWeight:700,letterSpacing:'.5px',color:C.sub,
        textAlign:'center',textTransform:'uppercase'}},z)));
    const grid=h('div',null,head,
      rows.map(r=>h('div',{key:r.k,style:{display:'grid',gridTemplateColumns:gt,gap:10,marginBottom:10}},
        cols.map(z=>{ const c=r.by[z];
          // khong co size nay -> o trong, van chiem 1 cot
          return c?cell(c):h('div',{key:'e'+z}); }))));
    return h('div',{style:{padding:'18px 20px 24px'}},back,summary,
      h('div',{className:'yscroll',style:{overflowX:'auto',paddingBottom:4}},
        h('div',{style:{minWidth:(cols.length*160)+'px'}},grid)),
      this.renderDsoHistory(line),
      this.renderDsoDefHistory(line),
      this.renderDsoTap());
  }
  // ==== PHIEU BAN GIAO: May -> Hoan thien ==================================
  // Nhan 1 'slip': {id, no, ts, style, po, color, line, dayTxt, sizes, qty, alloc}.
  // ts = 0 -> phieu chua chot, nut la 'Xac nhan giao'; da chot -> in / luu PDF.
  // Portal ra <body> nen khi in chi con to phieu tren giay, va khong phai
  // them slot moi vao shell().
  renderDsoHandAsk(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const s=this.state.dsoHandAsk; if(!s) return null;
    const close=()=>this.dsoSlipClose();
    const at=s.ts||0, who=this.dsoWho(s), brand=this.brandForStyle(s.style);
    const sizes=this.dsoSizeList(s.sizes);
    // Phieu chua chot: phai co ten nguoi giao VA nguoi nhan moi xac nhan duoc
    const need=!at&&!(String(who.from||'').trim()&&String(who.to||'').trim());
    // 'Nhan: gia tri' -- khoi thong tin dau phieu
    const fld=(lb,v,ex)=>h('div',{key:lb,style:{display:'flex',alignItems:'baseline',gap:7,minWidth:0}},
      h('span',{style:{flex:'none',fontSize:12.5,color:C.sub}},lb+':'),
      h('span',{style:{minWidth:0,fontSize:13.5,fontWeight:700,color:C.ink,wordBreak:'break-word',...(ex||{})}},v));
    // Ten nguoi giao / nguoi nhan: go truc tiep tren phieu, bat buoc khi chua chot
    const nameFld=(lb,k)=>{ const v=String(who[k]||''), miss=!at&&!v.trim();
      return h('div',{key:k,style:{display:'flex',alignItems:'baseline',gap:7,minWidth:0}},
        h('span',{style:{flex:'none',fontSize:12.5,color:C.sub}},lb,
          at?null:h('span',{key:'r',title:this.t('bgReq'),style:{color:'#c0392b'}},' *'),':'),
        h('input',{type:'text',value:v,placeholder:this.t('bgName'),
          onChange:e=>this.dsoWhoSet(s,{[k]:e.target.value}),
          style:{flex:1,minWidth:0,width:'100%',border:'none',background:'none',padding:'0 0 2px',
            borderBottom:'1px dashed '+(v?'transparent':(miss?'#d99b93':'#c8ccc2')),fontFamily:'inherit',
            fontSize:13.5,fontWeight:700,color:C.ink}})); };
    const head=h('div',{style:{padding:'21px 26px 15px',borderBottom:'1px solid '+C.line}},
      h('div',{style:{display:'flex',alignItems:'baseline',gap:14}},
        h('div',{style:{flex:1,minWidth:0,fontSize:16,fontWeight:700,letterSpacing:'.2px',lineHeight:1.3,
          color:C.ink}},this.t('bgTitle')),
        h('div',{style:{flex:'none',fontSize:12.5,fontWeight:700,fontFamily:mono,letterSpacing:'.2px',
          color:C.dark}},this.dsoSlipNo(s))),
      h('div',{style:{display:'flex',alignItems:'baseline',gap:14,marginTop:5}},
        h('div',{style:{flex:1,minWidth:0,fontSize:12,color:C.faint}},
          'YIC Hà Nam'+(brand?' \u00b7 '+brand:'')),
        h('div',{style:{flex:'none',fontSize:12,fontFamily:mono,color:C.faint}},
          this.dsoSlipWhen(at||Date.now()))));
    const meta=h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',columnGap:26,rowGap:10,
        padding:'16px 26px 0'}},
      fld(this.t('bgStyle'),s.style,{fontFamily:mono}),
      fld(this.t('bgPo'),s.po,{fontFamily:mono}),
      fld(this.t('bgColor'),s.color),
      fld(this.t('bgLine'),s.line,{color:C.dark}),
      nameFld(this.t('bgFrom'),'from'),
      nameFld(this.t('bgTo'),'to'),
      fld(this.t('bgProdDay'),s.dayTxt||'\u2014',{fontFamily:mono}),
      fld(this.t('bgStatus'),at?(this.t('dsoHanded')+' \u00b7 '+this.recvTime(at)):this.t('bgPending'),
        {color:at?'#2f7d32':C.sub,fontWeight:at?700:600,fontSize:12.5}));
    // Bang giao: 1 dong = 1 size, roi Tong nhan va Luy ke den phieu nay
    const tdC={padding:'9px 12px',fontSize:13,textAlign:'center',borderTop:'1px solid '+C.line};
    const th={padding:'9px 12px',fontSize:11.5,fontWeight:700,letterSpacing:'.3px',color:C.sub,
      textAlign:'center',background:'#f8faf3',borderBottom:'1px solid '+C.border};
    const table=h('div',{style:{margin:'18px 26px 0',border:'1px solid '+C.border,borderRadius:11,
        overflow:'hidden'}},
      h('table',{style:{width:'100%',borderCollapse:'collapse'}},
        h('thead',null,h('tr',null,
          h('th',{style:{...th,borderRight:'1px solid '+C.border}},this.t('bgSize')),
          h('th',{style:th},this.t('bgQty')))),
        h('tbody',null,
          sizes.map(([z,q],i)=>h('tr',{key:'z'+z},
            h('td',{style:{...tdC,...(i?{}:{borderTop:'none'}),borderRight:'1px solid '+C.line,
              fontWeight:600}},z),
            h('td',{style:{...tdC,...(i?{}:{borderTop:'none'}),fontFamily:mono}},this.fmt(q)))),
          h('tr',{key:'tot'},
            h('td',{style:{...tdC,borderTop:'1px solid '+C.border,borderRight:'1px solid '+C.line,
              background:C.tint,fontWeight:700}},this.t('bgTotal')),
            h('td',{style:{...tdC,borderTop:'1px solid '+C.border,background:C.tint,fontFamily:mono,
              fontWeight:700,fontSize:15}},this.fmt(s.qty))),
          h('tr',{key:'cum',title:this.t('bgCumTip')},
            h('td',{style:{...tdC,borderRight:'1px solid '+C.line,fontSize:12.5,color:C.sub}},
              this.t('bgCum')),
            h('td',{style:{...tdC,fontFamily:mono,color:C.sub}},this.fmt(this.dsoSlipCum(s)))))));
    // Cho ky tay khi in ra giay
    const sign=h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:26,padding:'0 26px',
        marginTop:30}},
      ['bgSignFrom','bgSignTo'].map(k=>h('div',{key:k,style:{textAlign:'center'}},
        h('div',{style:{height:42}}),
        h('div',{style:{borderTop:'1px solid '+C.border,paddingTop:7,fontSize:12,color:C.faint}},
          this.t(k)))));
    const foot=h('div',{'data-noprint':'',style:{display:'flex',alignItems:'center',gap:10,marginTop:24,
        padding:'13px 20px',borderTop:'1px solid '+C.line,background:'#f8faf3',flexWrap:'wrap'}},
      need?h('span',{style:{fontSize:11.5,color:'#a3271b',whiteSpace:'nowrap'}},this.t('bgNeedWho')):null,
      h('div',{style:{flex:1,minWidth:8}}),
      // Di ra tu hop chon so luong -> nut trai la 'Quay lai' de sua so
      h('button',{onClick:s.back?()=>this.dsoSlipBack(s):close,style:this.btn('ghost')},
        s.back?this.t('bgBack'):this.t('dsoClose')),
      at
        ? h('button',{onClick:()=>window.print(),style:this.btn('primary')},
            h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9},
              h('path',{d:'M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z'})),this.t('bgPrint'))
        : h('button',{disabled:need,onClick:()=>{ if(!need) this.dsoSlipCommit(s); },
            style:{...this.btn('primary'),...(need?{opacity:.45,cursor:'not-allowed'}:{})}},
            h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
              h('path',{d:'M5 12h14M13 6l6 6-6 6'})),this.t('dsoAskOk')));
    const panel=h('div',{'data-bg-panel':'',className:'yscroll',onClick:ev=>ev.stopPropagation(),
        style:{width:'min(560px,94vw)',maxHeight:'92vh',overflow:'auto',background:C.white,borderRadius:16,
          boxShadow:'0 30px 70px rgba(0,0,0,.32)'}},
      head,meta,table,sign,foot);
    const over=h('div',{'data-bg-overlay':'',onClick:close,style:{position:'fixed',inset:0,
        background:'rgba(24,28,22,.5)',backdropFilter:'blur(2px)',display:'flex',alignItems:'center',
        justifyContent:'center',zIndex:88,padding:24}},panel);
    return (RD&&RD.createPortal)?RD.createPortal(over,document.body):over;
  }

  // Bang lich su: 1 dong = 1 (ngay, style, PO, mau) da hoan thanh bao nhieu.
  renderDsoHistory(line){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    // dsoHistory tra ve MOI ngay (khong loc hom nay); o tim loc them tren client
    const all=this.dsoHistory(line), q=this.state.dsoHistQ||'';
    const rows=all.filter(r=>this.dsoRowHit(r,q));
    const un=all.filter(r=>this.dsoRemain(r).qty>0);
    const th={padding:'9px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,
      background:'#f8faf3',whiteSpace:'nowrap',position:'sticky',top:0,zIndex:1};
    const td={padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    // Nut giao TONG: chi hien khi con dong chua giao, kem so dong dang cho
    const bulk=un.length?h('button',{onClick:()=>this.dsoBulkOpen(line),
      style:{...this.btn('primary'),padding:'7px 13px',fontSize:12.5},title:this.t('dsoHandAllSub')},
      h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
        h('path',{d:'M5 12h14M13 6l6 6-6 6'})),
      this.t('dsoHandOver')+' ('+this.fmt(un.length)+')'):null;
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:10,marginTop:22,
        flexWrap:'wrap'}},
      h('div',{style:{minWidth:0}},
        h('div',{style:{fontSize:15,fontWeight:700}},this.t('dsoHist')),
        h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('dsoHistSub'))),
      h('div',{style:{flex:1,minWidth:8}}),
      this.dfSearchBox(q,v=>this.set({dsoHistQ:v}),false,'dsoHistSearch'),
      h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:C.dark,background:C.tint,borderRadius:999,padding:'4px 11px',whiteSpace:'nowrap'}},
        this.fmt(rows.reduce((a,r)=>a+r.qty,0))+' pcs'),
      bulk);
    const note=t=>h('div',{style:{border:'1px solid '+C.border,borderRadius:13,background:C.white,
      padding:'34px 20px',textAlign:'center',color:C.faint,fontSize:13}},this.t(t));
    if(!all.length) return h('div',null,head,note('dsoHistEmpty'),
      this.renderDsoHandAsk(),this.renderDsoHandBulk());
    if(!rows.length) return h('div',null,head,note('dfNoHit'),
      this.renderDsoHandAsk(),this.renderDsoHandBulk());
    // Cot size = hop cac size co trong bang, xep theo SORDER; size la xep cuoi.
    const zs=this.SORDER.filter(z=>rows.some(r=>r.sizes&&r.sizes[z]));
    rows.forEach(r=>Object.keys(r.sizes||{}).forEach(z=>{ if(zs.indexOf(z)<0) zs.push(z); }));
    const body=rows.map((r,i)=>{ const bg=i%2?'#f7f9f3':C.white, at=this.dsoHandAt(r);
      const hq=this.dsoHandedQty(r), rem=r.qty-hq;
      return h('tr',{key:r.key},
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:600,whiteSpace:'nowrap'}},this.dsoDay(r.day)),
        line?null:h('td',{style:{...td,background:bg,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},r.line),
        h('td',{style:{...td,background:bg,fontFamily:mono,wordBreak:'break-all'}},r.style),
        h('td',{style:{...td,background:bg,fontFamily:mono,whiteSpace:'nowrap'}},r.po),
        h('td',{style:{...td,background:bg,fontWeight:700,color:C.dark,whiteSpace:'nowrap'}},r.color),
        ...zs.map(z=>h('td',{key:'z'+z,style:{...td,background:bg,textAlign:'right',fontFamily:mono,
          color:r.sizes[z]?C.ink:'#dfe3da',whiteSpace:'nowrap'}}, r.sizes[z]?this.fmt(r.sizes[z]):'')),
        h('td',{style:{...td,background:bg,textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:14,whiteSpace:'nowrap'}},this.fmt(r.qty)),
        // Chua giao -> nut giao; giao mot phan -> the vang + nut giao not; giao xong -> the xanh
        h('td',{style:{...td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('span',{style:{display:'inline-flex',alignItems:'center',gap:7}},
            hq?h('button',{title:this.t('bgView'),onClick:()=>this.dsoSlipOpen(this.dsoRowSlipLast(r)),
              style:{fontSize:11,fontWeight:700,borderRadius:999,padding:'3px 9px',whiteSpace:'nowrap',
                cursor:'pointer',fontFamily:'inherit',color:at?'#2f7d32':'#8a6d1f',
                background:at?'#e6f2e2':'#fdf6e8',border:'1px solid '+(at?'#cfe3b4':'#f0e3c8')},
              'style-hover':{background:at?'#d9ecd2':'#f8eed6'}},
              at?(this.t('dsoHanded')+' \u00b7 '+this.recvTime(at))
                :(this.t('dsoHanded')+' '+this.fmt(hq)+'/'+this.fmt(r.qty))):null,
            rem?h('button',{onClick:()=>this.dsoSlipOpen(this.dsoRowSlipNew(r)),
              style:{border:'1px solid '+C.primary,background:C.white,color:C.dark,borderRadius:8,padding:'5px 11px',
                fontSize:11.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap'},
              'style-hover':{background:C.tint}},
              hq?(this.t('dsoHandOver')+' \u00b7 '+this.fmt(rem)):this.t('dsoHandOver')):null,
            hq?h('button',{title:this.t('dsoUndoHand'),onClick:()=>this.dsoRowUndo(r),
              style:{border:'none',background:'none',color:'#c0392b',cursor:'pointer',padding:0,fontSize:14,
                lineHeight:1,fontFamily:'inherit'}},'\u00d7'):null))); });
    return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,overflow:'hidden'}},
        h('div',{className:'yscroll',style:{overflow:'auto',maxHeight:this.dsoHistH('done')}},
          h('table',{style:{width:'100%',minWidth:((line?760:860)+zs.length*54)+'px',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              h('th',{style:{...th,paddingLeft:14}},this.t('dsoColDay')),
              line?null:h('th',{style:th},this.t('lsCol1')),
              h('th',{style:th},this.t('lsCol2')),
              h('th',{style:th},this.t('dsoColPo')),
              h('th',{style:th},this.t('dsoColColor')),
              ...zs.map(z=>h('th',{key:'z'+z,style:{...th,textAlign:'right',padding:'9px 8px'}},z)),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoColQty')),
              h('th',{style:{...th,borderRight:'none'}},this.t('lsCol10')))),
            h('tbody',null,body)))),
      this.renderDsoHandAsk(),this.renderDsoHandBulk());
  }

  // ==== Chon so luong giao sang hoan thien ==================================
  // Tren: con lai CHUA GIAO gop theo SIZE (moi ngay, moi ma hang trong pham vi
  // dang xem). Duoi: dien so luong muon giao cho tung size -> Xac nhan -> phieu.
  renderDsoHandBulk(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const b=this.state.dsoHandBulk; if(!b) return null;
    const close=()=>this.set({dsoHandBulk:null});
    const p=this.dsoBulkPool(), has=!!(p&&p.qty);
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'15px 20px',flex:'none',
        borderBottom:'1px solid '+C.line}},
      h('div',{style:{width:36,height:36,borderRadius:10,background:C.tint,color:C.dark,flex:'none',
          display:'flex',alignItems:'center',justifyContent:'center'}},
        h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M5 12h14M13 6l6 6-6 6'}))),
      h('div',{style:{minWidth:0,marginRight:'auto'}},
        h('div',{style:{fontSize:16,fontWeight:700}},this.t('dsoHandOver')),
        h('div',{style:{fontSize:11.5,color:C.faint,marginTop:2}},this.t('dsoHandAllSub'))),
      h('button',{title:this.t('dsoClose'),onClick:close,
        style:{border:'1px solid '+C.border,background:C.white,color:C.sub,borderRadius:9,width:30,height:30,
          flex:'none',cursor:'pointer',fontSize:17,lineHeight:1,padding:0,fontFamily:'inherit'},
        'style-hover':{background:C.tint}},'\u00d7'));
    let bodyEl;
    if(!has) bodyEl=h('div',{style:{padding:'52px 24px',textAlign:'center',color:C.faint,
      fontSize:13.5}},this.t('dsoNoUnhanded'));
    else {
      const zs=this.dsoSizeList(p.sizes), gTot=this.dsoBulkQty();
      const got=z=>{ const v=(b.qty||{})[z]; return v==null?'':String(v); };
      // Con lai theo size + pham vi dang gom (chuyen / ngay)
      const cards=h('div',{style:{padding:'18px 20px 0'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:9,flexWrap:'wrap'}},
          h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},this.t('bkPend')),
          h('div',{style:{flex:1,minWidth:8}}),
          h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:C.dark,background:C.tint,
            borderRadius:999,padding:'4px 11px',whiteSpace:'nowrap'}},this.fmt(p.qty)+' pcs')),
        h('div',{style:{display:'flex',gap:9,flexWrap:'wrap'}},
          zs.map(([z,q])=>h('div',{key:'c'+z,style:{flex:'none',minWidth:66,border:'1px solid '+C.border,
              borderRadius:11,background:C.white,padding:'8px 12px',textAlign:'center'}},
            h('div',{style:{fontSize:11,fontWeight:700,letterSpacing:'.4px',color:C.sub}},z),
            h('div',{style:{fontSize:19,fontWeight:700,fontFamily:mono,color:C.ink,marginTop:2,
              lineHeight:1}},this.fmt(q))))),
        h('div',{style:{fontSize:11.5,color:C.faint,marginTop:10}},
          this.t('bgLine')+': '+p.lines.join(' + ')+'  \u00b7  '+this.t('bkDays')+': '
          +(p.days.length>1?(this.dsoDay(p.days[0])+' \u2192 '+this.dsoDay(p.days[p.days.length-1]))
            :this.dsoDay(p.days[0]))));
      // Bang nhap so luong giao
      const th={padding:'9px 12px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',color:C.sub,
        textAlign:'center',background:'#f8faf3',borderBottom:'1px solid '+C.border,whiteSpace:'nowrap'};
      const td={padding:'7px 12px',fontSize:13,textAlign:'center',borderTop:'1px solid '+C.line};
      const inp={width:92,padding:'6px 8px',textAlign:'center',fontFamily:mono,fontSize:13.5,fontWeight:700,
        color:C.ink,border:'1px solid '+C.border,borderRadius:8,background:C.white};
      const grid=h('div',{style:{padding:'18px 20px 4px'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:9}},
          h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},this.t('bkGive')),
          h('div',{style:{flex:1,minWidth:8}}),
          h('button',{onClick:()=>this.dsoBulkFill(true),
            style:{...this.btn('ghost'),padding:'5px 10px',fontSize:11.5},
            'style-hover':{background:C.tint}},this.t('bkAll')),
          h('button',{onClick:()=>this.dsoBulkFill(false),
            style:{...this.btn('ghost'),padding:'5px 10px',fontSize:11.5},
            'style-hover':{background:C.tint}},this.t('bkNone'))),
        h('div',{style:{border:'1px solid '+C.border,borderRadius:12,overflow:'hidden'}},
          h('table',{style:{width:'100%',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              h('th',{style:{...th,borderRight:'1px solid '+C.border,width:'34%'}},this.t('dsoColSize')),
              h('th',{style:{...th,borderRight:'1px solid '+C.border,width:'33%'}},this.t('bkLeft')),
              h('th',{style:th},this.t('bkGive')))),
            h('tbody',null,
              zs.map(([z,q],i)=>h('tr',{key:'r'+z},
                h('td',{style:{...td,...(i?{}:{borderTop:'none'}),borderRight:'1px solid '+C.line,
                  fontWeight:700,fontSize:14}},z),
                h('td',{style:{...td,...(i?{}:{borderTop:'none'}),borderRight:'1px solid '+C.line,
                  fontFamily:mono,color:C.sub}},this.fmt(q)),
                h('td',{style:{...td,...(i?{}:{borderTop:'none'})}},
                  h('input',{type:'text',inputMode:'numeric',value:got(z),placeholder:'0',
                    onChange:e=>this.dsoBulkSet(z,e.target.value,q),style:inp})))),
              h('tr',{key:'tot'},
                h('td',{style:{...td,borderTop:'1px solid '+C.border,borderRight:'1px solid '+C.line,
                  background:C.tint,fontWeight:700,fontSize:12.5}},this.t('bkTot')),
                h('td',{style:{...td,borderTop:'1px solid '+C.border,borderRight:'1px solid '+C.line,
                  background:C.tint,fontFamily:mono,color:C.sub}},this.fmt(p.qty)),
                h('td',{style:{...td,borderTop:'1px solid '+C.border,background:C.tint,fontFamily:mono,
                  fontWeight:700,fontSize:15,color:gTot?C.dark:C.faint}},this.fmt(gTot)))))));
      bodyEl=h('div',{className:'yscroll',style:{overflow:'auto',flex:1,minHeight:130}},cards,grid);
    }
    const sel=has?this.dsoBulkQty():0;
    const foot=h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'12px 20px',flex:'none',
        borderTop:'1px solid '+C.line,background:'#f8faf3',flexWrap:'wrap'}},
      has?h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:sel?C.dark:C.faint,
        whiteSpace:'nowrap'}},this.fmt(sel)+' pcs '+this.t('bkSel')):null,
      h('div',{style:{flex:1,minWidth:8}}),
      h('button',{onClick:close,style:this.btn('ghost')},this.t('psCancel')),
      has?h('button',{disabled:!sel,onClick:()=>this.dsoBulkOk(),
        style:{...this.btn('primary'),...(sel?{}:{opacity:.45,cursor:'not-allowed'})}},
        this.t('bkNext'),
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M9 6l6 6-6 6'}))):null);
    return h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',
        zIndex:86,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),style:{width:'min(680px,96vw)',maxHeight:'92vh',
          display:'flex',flexDirection:'column',background:C.white,borderRadius:18,
          boxShadow:'0 30px 70px rgba(0,0,0,.34)',overflow:'hidden'}},
        head,bodyEl,foot));
  }

  // ==== Bang lich su hang loi: 1 dong = 1 lan ghi (ngay/size/ma loi) ====
  // Size la 1 COT rieng (khong bung ra nhieu cot nhu bang hoan thanh) vi con
  // phai cho cot Ly do -- bung size ra nua thi bang qua rong.
  renderDsoDefHistory(line){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const all=this.dsoDefHistory(line), q=this.state.dsoDefQ||'';
    const rows=all.filter(r=>this.dsoRowHit(r,q,r.at+' '+r.code+' '+this.dsoDefName(r.code)));
    const th={padding:'9px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,
      background:'#f8faf3',whiteSpace:'nowrap',position:'sticky',top:0,zIndex:1};
    const td={padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,
      borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:10,marginTop:26,
        flexWrap:'wrap'}},
      h('div',{style:{minWidth:0}},
        h('div',{style:{fontSize:15,fontWeight:700}},this.t('dsoDefHist')),
        h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('dsoDefHistSub'))),
      h('div',{style:{flex:1,minWidth:8}}),
      all.length?this.dfSearchBox(q,v=>this.set({dsoDefQ:v}),false,'dsoHistSearch'):null,
      rows.length?h('button',{title:this.t('dsoDefExpTip'),onClick:()=>this.dsoDefExport(line),
        style:{border:'1px solid '+C.border,background:C.white,color:C.primary,borderRadius:8,
          padding:'6px 12px',fontSize:12,fontWeight:700,fontFamily:'inherit',cursor:'pointer',
          whiteSpace:'nowrap'},'style-hover':{background:C.tint}},this.t('exportXls')):null,
      h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:'#a3271b',background:'#fdecea',
        border:'1px solid #eccfca',borderRadius:999,padding:'4px 11px',whiteSpace:'nowrap'}},
        this.fmt(rows.reduce((a,r)=>a+r.qty,0))+' pcs'));
    const note=t=>h('div',{style:{border:'1px solid '+C.border,borderRadius:13,background:C.white,
      padding:'34px 20px',textAlign:'center',color:C.faint,fontSize:13}},this.t(t));
    if(!all.length) return h('div',null,head,note('dsoDefHistEmpty'));
    if(!rows.length) return h('div',null,head,note('dfNoHit'));
    const body=rows.map((r,i)=>{ const bg=i%2?'#f7f9f3':C.white, nm=this.dsoDefName(r.code);
      return h('tr',{key:r.key},
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:600,whiteSpace:'nowrap'}},this.dsoDay(r.day)),
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:700,whiteSpace:'nowrap',
          color:r.at?C.dark:C.faint}},r.at||'\u2014'),
        line?null:h('td',{style:{...td,background:bg,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},r.line),
        h('td',{style:{...td,background:bg,fontFamily:mono,wordBreak:'break-all'}},r.style),
        h('td',{style:{...td,background:bg,fontFamily:mono,whiteSpace:'nowrap'}},r.po),
        h('td',{style:{...td,background:bg,fontWeight:700,color:C.dark,whiteSpace:'nowrap'}},r.color),
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:700,whiteSpace:'nowrap'}},r.size),
        h('td',{style:{...td,background:bg}},
          h('span',{style:{display:'inline-flex',alignItems:'center',gap:8,flexWrap:'wrap'}},
            h('span',{style:{fontSize:11,fontWeight:700,fontFamily:mono,color:'#a3271b',background:'#fdecea',
              border:'1px solid #eccfca',borderRadius:999,padding:'2px 8px',whiteSpace:'nowrap'}},r.code),
            h('span',{style:{fontWeight:600,wordBreak:'break-word'}},nm||'\u2014'))),
        h('td',{style:{...td,background:bg,borderRight:'none',textAlign:'right',fontFamily:mono,
          fontWeight:700,fontSize:14,whiteSpace:'nowrap'}},this.fmt(r.qty))); });
    return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,overflow:'hidden'}},
        h('div',{className:'yscroll',style:{overflow:'auto',maxHeight:this.dsoHistH('def')}},
          h('table',{style:{width:'100%',minWidth:(line?910:1010)+'px',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              h('th',{style:{...th,paddingLeft:14}},this.t('dsoColDay')),
              h('th',{style:th},this.t('dsoColTime')),
              line?null:h('th',{style:th},this.t('lsCol1')),
              h('th',{style:th},this.t('lsCol2')),
              h('th',{style:th},this.t('dsoColPo')),
              h('th',{style:th},this.t('dsoColColor')),
              h('th',{style:th},this.t('dsoColSize')),
              h('th',{style:th},this.t('dsoColReason')),
              h('th',{style:{...th,borderRight:'none',textAlign:'right'}},this.t('dsoColDefQty')))),
            h('tbody',null,body)))));
  }

  dsoSummary(){ const at={}, out=[];
    this.dsoHistory().forEach(r=>{ const k=r.day+'|'+r.line;
      if(!at[k]){ at[k]={key:k,day:r.day,line:r.line,done:0,handed:0}; out.push(at[k]); }
      at[k].done+=r.qty;
      at[k].handed+=this.dsoHandedQty(r); });
    return out; }   // dsoHistory da sap ngay giam dan, chuyen tang dan

  // Bang tong hop o cap Daily Sewing Output (truoc khi chon chuyen)
  // ==== Bang tong hop: chi hien 5 dong, con lai cuon ====================
  // Chieu cao 1 dong KHONG doan theo padding duoc: bang hang loi co chip ma loi
  // nen dong cao hon bang san luong, lai con doi theo font/zoom cua may. Nen do
  // that 5 dong dau + dau bang + dong TONG tu DOM.
  // Do xong nho vao _tblH roi ve lai dung 1 lan; lan sau do ra so cu -> dung,
  // khong lap vo han. Bo qua chenh lech <= 1px cho khoi rung khi hien thanh cuon.
  DSO_MAXROWS=5;
  _tblH={};
  // ref gan TRUOC componentDidMount -> _mounted van false, goi forceUpdate thang
  // se bi bo qua va so do vua do khong bao gio duoc dung. Hoan 1 tick, tien the
  // gop ca 2 bang vao chung mot lan ve lai.
  tblSync(){ clearTimeout(this._tblT);
    this._tblT=setTimeout(()=>{ if(this._mounted) this.forceUpdate(); },0); }
  dsoTblRef(key,nRows){ return el=>{
    if(!el) return;
    const cur=this._tblH[key];
    if(nRows<=this.DSO_MAXROWS){            // it dong -> bo gioi han, hien het
      if(cur!==undefined){ delete this._tblH[key]; this.tblSync(); }
      return; }
    const hd=el.querySelector('thead tr'), ft=el.querySelector('tfoot tr'), tb=el.querySelector('tbody');
    if(!hd||!ft||!tb) return;
    const rows=[].slice.call(tb.children,0,this.DSO_MAXROWS);
    if(rows.length<this.DSO_MAXROWS) return;
    const H=Math.ceil(hd.getBoundingClientRect().height+ft.getBoundingClientRect().height
      +rows.reduce((a,r)=>a+r.getBoundingClientRect().height,0));
    if(H>0&&(cur===undefined||Math.abs(cur-H)>1)){
      this._tblH[key]=H; this.tblSync(); } }; }

  renderDsoOverview(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const sum=this.dsoSummary();
    const th={padding:'9px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,
      background:'#f8faf3',whiteSpace:'nowrap',position:'sticky',top:0,zIndex:2};
    // Dong TONG ghim day khung: cuon giua bang van doc duoc tong so
    const tf={position:'sticky',bottom:0,zIndex:2};
    const td={padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    const tDone=sum.reduce((a,r)=>a+r.done,0), tHand=sum.reduce((a,r)=>a+r.handed,0);
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:10}},
      h('div',{style:{minWidth:0}},
        h('div',{style:{fontSize:15,fontWeight:700}},this.t('dsoOvw')),
        h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('dsoOvwSub'))),
      h('div',{style:{flex:1}}),
      h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:'#2f7d32',background:'#e6f2e2',
        border:'1px solid #cfe3b4',borderRadius:999,padding:'4px 11px',whiteSpace:'nowrap'}},
        this.t('dsoHanded')+' '+this.fmt(tHand)+' / '+this.fmt(tDone)+' pcs'));
    if(!sum.length) return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,background:C.white,padding:'30px 20px',
        textAlign:'center',color:C.faint,fontSize:13}},this.t('dsoHistEmpty')));
    const body=sum.map((r,i)=>{ const bg=i%2?'#f7f9f3':C.white, left=r.done-r.handed;
      return h('tr',{key:r.key},
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:600,whiteSpace:'nowrap'}},this.dsoDay(r.day)),
        h('td',{style:{...td,background:bg,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},r.line),
        h('td',{style:{...td,background:bg,textAlign:'right',fontFamily:mono,fontWeight:600,whiteSpace:'nowrap'}},this.fmt(r.done)),
        h('td',{style:{...td,background:bg,textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:14,
          color:r.handed?'#2f7d32':'#c3c8bf',whiteSpace:'nowrap'}},this.fmt(r.handed)),
        h('td',{style:{...td,background:bg,borderRight:'none',textAlign:'right',fontFamily:mono,fontWeight:600,
          color:left?'#946200':C.faint,whiteSpace:'nowrap'}},this.fmt(left))); });
    const foot=h('tr',null,
      h('td',{colSpan:2,style:{padding:'10px 12px',fontSize:11,fontWeight:700,letterSpacing:'.4px',
        color:'#cfe0be',background:C.dark,whiteSpace:'nowrap',...tf}},this.t('colTotal')),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:12.5,color:'#e6efdb',background:C.dark,...tf}},this.fmt(tDone)),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:14,color:'#fff',background:C.dark,...tf}},this.fmt(tHand)),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:12.5,color:'#e6efdb',background:C.dark,...tf}},this.fmt(tDone-tHand)));
    return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,overflow:'hidden'}},
        h('div',{className:'yscroll',ref:this.dsoTblRef('ovw',body.length),
            style:{overflowX:'auto',overflowY:'auto',maxHeight:this._tblH['ovw']}},
          h('table',{style:{width:'100%',minWidth:'620px',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              h('th',{style:{...th,paddingLeft:14}},this.t('dsoColDay')),
              h('th',{style:th},this.t('lsCol1')),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoOvwDone')),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoOvwHanded')),
              h('th',{style:{...th,borderRight:'none',textAlign:'right'}},this.t('dsoOvwLeft')))),
            h('tbody',null,body),
            h('tfoot',null,foot)))));
  }

  // ================= M-level board (andon toan man hinh) =================
  // target = gio lam * 60 * cong nhan / SMV * %Target cua bac M
  MLV_SLOTS=5;          // man hinh luon danh 5 o, bac hien tai o giua
  // Cung quy tac chon dong nhu prodLines(): uu tien dong DA co cau hinh trong
  // Line Setting. Lay dong dau vo dieu kien thi chuyen 2 style se doc cfg mac
  // dinh trong khi nguoi dung sua dong thu hai -> board lech han Line Setting.
  mlvRowOf(line){ const rows=this.getWeek().rows.filter(r=>this.normName(r.line)===line);
    if(!rows.length) return null; const st=this.state.lset||{};
    return rows.find(r=>st[this.lsKey(r)])||rows[0]; }
  // Cong thuc chinh; tra null khi thieu du lieu de o hien ': ()'
  mlvTarget(cfg,pct){ const hrs=parseFloat(cfg.hrs), w=Number(cfg.w), smv=parseFloat(cfg.smv);
    if(!(hrs>0)||!(w>0)||!(smv>0)||!(pct>0)) return null;
    return Math.floor(hrs*60*w/smv*(pct/100)); }
  mlvNum(v){ const n=parseFloat(String(v==null?'':v).replace(/[^0-9.]/g,'')); return isNaN(n)?0:n; }
  // Tong da lam cua ca chuyen (dung de xac dinh bac dang dat duoc)
  mlvDone(line){ let n=0; this.dsoSizeCards(line).forEach(c=>{ n+=this.dsoDoneOf(c); }); return n; }
  // K = (thu nhap 1 nguoi 9.5h / 9.5) * WORK HOURS cua line. Hien theo nghin.
  mlvK(inc,hrs){ const i=this.mlvNum(inc), h=this.mlvNum(hrs);
    return (i>0&&h>0)?(i/9.5*h):0; }
  // 5 o quanh bac dang dat duoc; thieu bac thi o do hien ': ()'.
  mlvSlots(line){ const r=this.mlvRowOf(line); if(!r) return {cfg:{},slots:[],cur:null};
    const cfg=this.lsGet(r);
    // Loai M cua chuyen = cot LOAI trong Line Setting (lsType suy tu SMV).
    // Cac BAC (Ms/M1/M2...) la cac dong chi tiet cua loai do: moi dong co %Target
    // rieng + thu nhap/1 nguoi (9.5h). Khong tim thay loai thi de trong, o hien
    // ': ()' -- tot hon la lay bua loai dau danh muc roi bao ra so sai.
    const ty=this.mtypeOf(r);
    const det=ty?this.mtDet(ty.id):[];
    let tiers=det.map(dd=>{ const nm=String(dd.name||'').trim();
      return {key:dd.id,name:nm?(/^m/i.test(nm)?nm:'M'+nm):'\u2014',
        pct:this.mlvNum(dd.tgt),inc:this.mlvNum(dd.inc),
        target:this.mlvTarget(cfg,this.mlvNum(dd.tgt)),kraw:this.mlvK(dd.inc,cfg.hrs)}; });
    // Sap tang dan theo %Target: no luon la so, con target co the null khi thieu
    // SMV/cong nhan -- sap theo target se day cac bac thieu du lieu len dau thang.
    tiers.sort((a,b)=>a.pct-b.pct);
    const done=this.mlvDone(line);
    let ci=-1; tiers.forEach((t,i)=>{ if(t.target!=null&&done>=t.target) ci=i; });
    if(ci<0) ci=0;                       // chua vuot bac nao -> dang o bac thap nhat
    const half=Math.floor(this.MLV_SLOTS/2), out=[];
    // tren xuong duoi: bac cao nhat truoc (giong anh: M2 tren, Ms duoi)
    for(let d=half;d>=-half;d--){ const t=tiers[ci+d];
      if(!t){ out.push({empty:true,key:'e'+d}); continue; }
      out.push({...t,cur:d===0}); }
    const cu=out.find(x=>x.cur)||null;
    return {cfg:cfg,row:r,type:ty,tiers:tiers,slots:out,cur:cu,done:done}; }
  // Chat luong tu dsoDefLog: don vi dat = da lam, loi = so lan ghi loi
  mlvQuality(line){ let def=0; const done=this.mlvDone(line), top={};
    const m=this.state.dsoDefLog||{};
    Object.keys(m).forEach(k=>{ const p=k.split('|'); if(p.length!==6||p[1]!==line) return;
      const o=m[k]||{}; Object.keys(o).forEach(code=>{ const n=Number(o[code])||0;
        def+=n; top[code]=(top[code]||0)+n; }); });
    const units=done+def;
    const t3=Object.keys(top).map(c=>({code:c,n:top[c]})).sort((a,b)=>b.n-a.n).slice(0,3);
    return {done:done,def:def,
      rate:units?(def/units*100):0,        // ti le loi tren tong don vi da kiem
      dhu:done?(def/done*100):0,           // loi tren 100 san pham dat
      top3:t3}; }
  // SAN LUONG / GIO lay thang tu LICH SU HOAN THANH cua chuyen: moi ban ghi
  // hoan thanh (ngay|chuyen|style|PO|mau|size) deu kem danh sach moc gio PASS
  // trong dsoPassLog, gom lai theo gio la ra bieu do. Cung nguon voi bang lich
  // su va voi so DA LAM -> khong bao gio lech nhau.
  // Loc chuyen giong mlvQuality: khoa 6 doan, doan[1] la ten chuyen.
  mlvHoursMap(line){ const m=this.state.dsoPassLog||{}, at={};
    Object.keys(m).forEach(key=>{ const p=key.split('|');
      if(p.length!==6||p[1]!==line) return;
      (m[key]||[]).forEach(t=>{ const b=p[0]+'|'+String(t).slice(0,2);   // 'YYYY-MM-DD|HH'
        at[b]=(at[b]||0)+1; }); });
    return at; }
  // 5 gio gan nhat, ke ca gio dang chay. Lui theo MOC THOI GIAN chu khong tru
  // so gio: qua nua dem van tra ve dung ngay cua gio do.
  mlvHours(line,n){ const at=this.mlvHoursMap(line), out=[], now=new Date();
    const k=n||this.MLV_SLOTS;
    for(let i=k-1;i>=0;i--){ const d=new Date(now.getTime()-i*3600000);
      const hh=String(d.getHours()).padStart(2,'0');
      out.push({h:d.getHours(),label:hh+':00',n:at[this.psFmtD(d)+'|'+hh]||0}); }
    return out; }
  // Roi khoi board thi PHAI tat: dong ho goi forceUpdate ca app moi giay, de chay
  // tiep thi moi trang khac cua app cung bi ve lai 1 lan/giay.
  mlvClockOff(){ if(this._mlvT){ clearInterval(this._mlvT); this._mlvT=null; } }
  mlvClock(){ if(!this._mlvT) this._mlvT=setInterval(()=>{ if(this._mounted) this.forceUpdate(); },1000);
    const d=new Date(), p=n=>String(n).padStart(2,'0');
    return {t:p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds()),
      d:p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()}; }
  // ---- Che do TV (toan man hinh) ----
  // Khong dua vao Fullscreen API mot minh: no bi chan trong kha nhieu tinh huong
  // (iframe khong co allow=fullscreen, cua so khong duoc focus, policy cua may) va
  // khi chan thi nem 'TypeError: not granted' -> bam nut khong ra gi ca.
  // Nen: che do TV la CSS phu kin viewport (luon chay duoc), con Fullscreen API
  // chi la them -- duoc thi an luon thanh dia chi cua trinh duyet.
  mlvIsFs(){ return !!this.state.mlvFs; }
  mlvNativeFs(){ const d=document; return !!(d.fullscreenElement||d.webkitFullscreenElement); }
  // Thoat fullscreen bang Esc/F11 -> tat luon che do TV cho khop trang thai
  mlvFsWatch(){ if(this._mlvFsH) return;
    this._mlvFsH=()=>{ if(!this._mounted) return;
      if(!this.mlvNativeFs()&&this.state.mlvFs) this.set({mlvFs:false});
      else this.forceUpdate(); };
    document.addEventListener('fullscreenchange',this._mlvFsH);
    document.addEventListener('webkitfullscreenchange',this._mlvFsH); }
  mlvFsOff(){ if(!this._mlvFsH) return;
    document.removeEventListener('fullscreenchange',this._mlvFsH);
    document.removeEventListener('webkitfullscreenchange',this._mlvFsH);
    this._mlvFsH=null; }
  mlvFsToggle(){ const on=!this.state.mlvFs, d=document, el=this._mlvEl;
    try{
      if(on){ const rq=el&&(el.requestFullscreen||el.webkitRequestFullscreen);
        if(rq){ const p=rq.call(el); if(p&&p.catch) p.catch(()=>{}); } }
      else if(this.mlvNativeFs()){ const ex=d.exitFullscreen||d.webkitExitFullscreen;
        if(ex){ const p=ex.call(d); if(p&&p.catch) p.catch(()=>{}); } }
    }catch(e){}
    this.set({mlvFs:on}); }
  mlvExit(){ this.mlvClockOff();
    if(this.mlvNativeFs()) this.mlvFsToggle();
    this.mlvFsOff(); this.set({mlvLine:null,mlvFs:false}); }

  // ================= Bang andon M-level =================
  // Bo cuc va TI LE lay theo anh mau 1690x887: moi co chu / khoang cach ben duoi
  // deu la so do trong anh, roi nhan he so k = be rong that / 1690. Nho vay ti le
  // giu nguyen du treo TV 4K hay xem trong cua so, khong phai keo gian cho day man.
  MLV_REF_W=1690; MLV_REF_H=887;
  // Khung noi dung luon dung ti le anh mau.
  //  - Toan man hinh: vua khit trong viewport, thua ra thanh vien den tren/duoi.
  //  - Trong cua so: an het be rong, cao suy ra tu ti le -> khong co vien den hai ben.
  mlvBox(fs){ const W0=this.MLV_REF_W, R=this.MLV_REF_H/W0, PADX=fs?0:14;
    const outer=(this._mlvEl&&this._mlvEl.clientWidth)||(fs?(window.innerWidth||W0):W0);
    const wMax=Math.max(520,outer-PADX*2);
    const w=fs?Math.min(wMax,Math.round((window.innerHeight||Math.round(W0*R))/R)):wMax;
    return {w:w,h:Math.round(w*R),k:w/W0,pad:PADX}; }
  renderMlvBoard(line){
    const h=React.createElement, mono="'IBM Plex Mono',monospace";
    const Y='#f5c518', R='#ff2d2d', W='#fff', G='#8b9099';
    const {cfg,row,slots,cur}=this.mlvSlots(line);
    const q=this.mlvQuality(line), ck=this.mlvClock();
    const fs=this.mlvIsFs(); this.mlvFsWatch();
    const B=this.mlvBox(fs), k=B.k;
    const px=n=>Math.max(9,Math.round(n*k));   // co chu
    const sp=n=>Math.max(1,Math.round(n*k));   // khoang cach
    const tgt=cur&&cur.target!=null?cur.target:null;
    const big=(v,c,sz)=>h('span',{style:{fontSize:px(sz),fontWeight:800,color:c,lineHeight:.92,
      letterSpacing:'-0.03em',fontFamily:'inherit'}},v);
    const btn=(label,fn)=>h('button',{key:label,onClick:fn,
      style:{background:'#1b1b1b',color:W,border:'1px solid #4a4a4a',borderRadius:sp(9),
        padding:sp(7)+'px '+sp(15)+'px',fontSize:px(20),fontWeight:700,fontFamily:'inherit',
        cursor:'pointer',whiteSpace:'nowrap'}},label);
    // ---- SAN LUONG / GIO ----
    // Khong ve vach dinh muc nua, nhung dinh muc/gio VAN dung de:
    //   - to mau cot: vang = dat nhip gio, do = duoi nhip
    //   - lam thang do: cot duoi dinh muc thi phai thap that, khong phong len cho day
    const wh=this.mlvNum(cfg.hrs), pace=(tgt!=null&&wh>0)?Math.round(tgt/wh):null;
    const bars=this.mlvHours(line);
    const peak=Math.max(pace||0,...bars.map(x=>x.n),1);
    const BODY=sp(292), NUM=px(20), AVAIL=BODY-NUM-sp(6), GAP=sp(14);
    const chart=h('div',{style:{flex:'1 1 0',minWidth:0}},
      h('div',{style:{fontSize:px(27),fontWeight:800,letterSpacing:'2px',color:G,
        marginBottom:sp(16)}},this.t('mlvPerHour')),
      h('div',{style:{display:'flex',gap:GAP,alignItems:'flex-end',height:BODY}},
        bars.map(x=>{ const ok=pace!=null?x.n>=pace:x.n>0;
          return h('div',{key:x.label,title:this.t('mlvHourTip'),
              style:{flex:1,minWidth:0,display:'flex',flexDirection:'column',
                justifyContent:'flex-end',gap:sp(6)}},
            h('div',{style:{fontSize:NUM,fontWeight:800,fontFamily:mono,textAlign:'center',
              lineHeight:1,color:x.n?(ok?Y:R):W}},this.fmt(x.n)),
            h('div',{style:{height:x.n?Math.max(3,Math.round(x.n/peak*AVAIL)):0,
              background:ok?Y:R,borderRadius:sp(3)+'px '+sp(3)+'px 0 0'}})); })),
      h('div',{style:{height:2,background:'#e8e8e8',margin:'0 0 '+sp(6)+'px'}}),
      h('div',{style:{display:'flex',gap:GAP}},
        bars.map(x=>h('div',{key:x.label,style:{flex:1,minWidth:0,textAlign:'center',
          fontSize:px(19),fontWeight:700,color:W,fontFamily:mono}},x.label))));
    // ---- CHAT LUONG ----
    const qRow=(label,val,mb)=>h('div',{key:label,style:{display:'flex',
        justifyContent:'space-between',alignItems:'baseline',gap:sp(12),marginBottom:sp(mb)}},
      h('span',{style:{fontSize:px(28),fontWeight:700,color:W}},label),
      h('span',{style:{fontSize:px(36),fontWeight:800,color:Y,fontFamily:mono}},val));
    const qual=h('div',{style:{flex:'1 1 0',minWidth:0}},
      h('div',{style:{fontSize:px(27),fontWeight:800,letterSpacing:'2px',color:G,
        marginBottom:sp(16)}},this.t('mlvQual')),
      qRow(this.t('mlvRate'),q.rate.toFixed(1)+'%',14),
      qRow('DHU',q.dhu.toFixed(1),18),
      h('div',{style:{fontSize:px(27),fontWeight:800,color:W,marginBottom:sp(8)}},this.t('mlvTop3')),
      q.top3.length
        ? q.top3.map((x,i)=>h('div',{key:x.code,style:{fontSize:px(27),fontWeight:800,color:Y,
            fontFamily:mono,lineHeight:1.45}},(i+1)+'. '+x.code+' ('+this.fmt(x.n)+')'))
        : h('div',{style:{fontSize:px(27),color:G}},'\u2014'));
    // ---- khung noi dung: header + hero ben trai, target + bac M ben phai, day la 2 o duoi ----
    const box=h('div',{style:{width:B.w,height:B.h,margin:'0 auto',position:'relative',
        display:'flex',flexDirection:'column',padding:sp(20)+'px '+sp(30)+'px '+sp(18)+'px'}},
      h('div',{style:{position:'absolute',top:0,right:0,zIndex:2,display:'flex',gap:sp(8)}},
        btn(this.t(fs?'mlvExitFull':'mlvFull'),()=>this.mlvFsToggle()),
        btn(this.t('mlvSwitch'),()=>this.mlvExit())),
      h('div',{style:{display:'flex',alignItems:'flex-start',gap:sp(24)}},
        // cot trai: gio / to+style / DA LAM - TARGET
        h('div',{style:{flex:'1 1 0',minWidth:0}},
          h('div',{style:{display:'flex',alignItems:'baseline',gap:sp(16)}},
            h('span',{style:{fontSize:px(44),fontWeight:800,color:Y,fontFamily:mono}},ck.t),
            h('span',{style:{fontSize:px(34),fontWeight:700,color:W,fontFamily:mono}},ck.d)),
          h('div',{style:{display:'flex',alignItems:'baseline',gap:sp(22),marginTop:sp(10),
              flexWrap:'wrap'}},
            h('span',{style:{fontSize:px(46),fontWeight:800,color:Y}},
              this.t('mlvTeam')+' '+String(line).replace(/^LINE\s*/i,'')+' / '+line),
            h('span',{style:{fontSize:px(44),fontWeight:800,color:Y,fontFamily:mono}},
              (row&&row.style)||'\u2014')),
          // DA LAM / TARGET la so quan trong nhat cua bang -> to nhat, to hon
          // ca so target do ben phai. 168 la muc con du cho ca truong hop
          // 4 chu so ca 2 ben ('1,234 / 1,234') ma khong dam vao cot bac M.
          h('div',{style:{textAlign:'center',marginTop:sp(52)}},
            h('span',{style:{display:'inline-flex',alignItems:'baseline',gap:sp(30),
                whiteSpace:'nowrap'}},
              big(this.fmt(q.done),R,168), big('/',W,112),
              big(tgt==null?'\u2014':this.fmt(tgt),W,168)))),
        // cot phai: target lon + 5 bac M
        h('div',{style:{flex:'0 0 auto',textAlign:'right',marginTop:sp(56)}},
          h('div',null,big(tgt==null?'\u2014':this.fmt(tgt),R,132)),
          h('div',{style:{marginTop:sp(14)}},
            slots.map(sl=>sl.empty
              ? h('div',{key:sl.key,style:{fontSize:px(32),fontWeight:800,color:W,
                  fontFamily:mono,lineHeight:1.4}},': ()')
              : h('div',{key:sl.key,
                  title:sl.kraw?(this.t('mlvIncTip')+': '+this.fmt(Math.round(sl.kraw))+' VND'):undefined,
                  style:{fontSize:px(32),fontWeight:800,fontFamily:mono,lineHeight:1.4,
                    color:sl.cur?W:R}},
                  (sl.cur?(this.fmt(Number(cfg.w)||0)+'\u00a0\u00a0'):'')+sl.name+' : '
                    // chua khai bao thu nhap -> '\u2014', khong phai 'K' tro tron
                    +(sl.kraw?(this.fmt(Math.round(sl.kraw/1000))+'K'):'\u2014')
                    +' ('+(sl.target==null?'':this.fmt(sl.target))+')'))))),
      // KHONG ep chieu cao hang duoi: ep 440 thi noi dung chi cao ~362, phan
      // thua nam BEN TRONG hang -> hut mot dai den ngay duoi chart. De hang tu
      // co theo noi dung, marginTop:'auto' day no xuong sat day khung.
      h('div',{style:{display:'flex',gap:sp(30),marginTop:'auto'}},chart,qual));
    return h('div',{ref:el=>{ this._mlvEl=el; },'data-screen-label':'DSO M-level Board',
      style:{background:'#000',color:W,overflow:'hidden',
        ...(fs
          ? {position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9999,borderRadius:0,
             display:'flex',alignItems:'center',justifyContent:'center',padding:0}
          : {position:'relative',borderRadius:14,padding:B.pad})}},
      box);
  }

  // Chia theo tung line giong man Production
  renderDsoMlv(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const list=this.prodLines();
    if(this.state.mlvLine&&list.some(x=>x.line===this.state.mlvLine)) return this.renderMlvBoard(this.state.mlvLine);
    this.mlvClockOff();
    if(!list.length) return h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty'));
    return h('div',{style:{padding:'16px 18px 20px'}},
      h('div',{style:{fontSize:12,color:C.faint,marginBottom:11}},this.t('mlvPick')),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(238px,1fr))',gap:12}},
        list.map(x=>{ const {cfg,cur}=this.mlvSlots(x.line);
          const tg=cur&&cur.target!=null?cur.target:null;
          return h('div',{key:x.line,onClick:()=>this.set({mlvLine:x.line}),title:this.t('mlvOpen'),
            style:{border:'1px solid '+C.border,borderRadius:14,background:'#101010',color:'#fff',cursor:'pointer',
              padding:'13px 15px',minHeight:104,display:'flex',flexDirection:'column',justifyContent:'space-between',gap:12},
            'style-hover':{borderColor:C.primary}},
            h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}},
              h('div',{style:{fontSize:16,fontWeight:800,color:'#f5c518',fontFamily:mono}},x.line),
              h('div',{style:{fontSize:11,fontWeight:700,color:'#8b9099'}},cur?cur.name:'\u2014')),
            h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:10}},
              h('div',{style:{fontSize:22,fontWeight:800,color:'#ff2d2d',fontFamily:mono}},
                this.fmt(this.mlvQuality(x.line).done)),
              h('div',{style:{fontSize:15,fontWeight:700,color:'#fff',fontFamily:mono}},
                '/ '+(tg==null?'\u2014':this.fmt(tg))))); })));
  }

  // ==== Tong hop hang loi theo CHUYEN -- cho trang Daily Sewing Output ====
  // Gop MOI ngay lai. 'Da kiem' = pass + fail, ti le loi tinh tren tong da kiem.
  dsoFailByLine(){ const at={}, out=[];
    const get=n=>{ if(!at[n]){ at[n]={line:n,pass:0,fail:0,by:{}}; out.push(at[n]); } return at[n]; };
    const dm=this.state.dsoDone||{};
    Object.keys(dm).forEach(k=>{ const q=Number(dm[k])||0; if(q<=0) return;
      const p=k.split('|'); if(p.length===6) get(p[1]).pass+=q; });
    const fm=this.state.dsoDefLog||{};
    Object.keys(fm).forEach(k=>{ const p=k.split('|'); if(p.length!==6) return;
      const a=get(p[1]), o=fm[k]||{};
      Object.keys(o).forEach(c=>{ const q=Number(o[c])||0; if(q<=0) return;
        a.fail+=q; a.by[c]=(a.by[c]||0)+q; }); });
    out.forEach(a=>{ const u=a.pass+a.fail; a.rate=u?(a.fail/u*100):0;
      a.top=Object.keys(a.by).map(c=>({code:c,n:a.by[c]}))
        .sort((x,y)=>y.n-x.n||String(x.code).localeCompare(String(y.code)))[0]||null; });
    // Chuyen loi NHIEU NHAT len dau -- bang nay de soi chat luong, khong phai tra cuu
    return out.sort((a,b)=>b.fail-a.fail||String(a.line).localeCompare(String(b.line))); }
  dsoPct1(v){ return (Math.round((Number(v)||0)*10)/10).toFixed(1)+'%'; }

  renderDsoFailOverview(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.dsoFailByLine();
    const th={padding:'9px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,
      background:'#f8faf3',whiteSpace:'nowrap',position:'sticky',top:0,zIndex:2};
    // Dong TONG ghim day khung: cuon giua bang van doc duoc tong so
    const tf={position:'sticky',bottom:0,zIndex:2};
    // Mau nen dat o <tr> de :hover ca dong hien duoc (bam 1 dong -> mo chuyen)
    const td={padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,
      borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    const tPass=rows.reduce((a,r)=>a+r.pass,0), tFail=rows.reduce((a,r)=>a+r.fail,0);
    const tRate=(tPass+tFail)?(tFail/(tPass+tFail)*100):0;
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:10,marginTop:26}},
      h('div',{style:{minWidth:0}},
        h('div',{style:{fontSize:15,fontWeight:700}},this.t('dsoFailOvw')),
        h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('dsoFailOvwSub'))),
      h('div',{style:{flex:1}}),
      h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:'#a3271b',background:'#fdecea',
        border:'1px solid #eccfca',borderRadius:999,padding:'4px 11px',whiteSpace:'nowrap'}},
        this.t('dsoFail')+' '+this.fmt(tFail)+' \u00b7 '+this.dsoPct1(tRate)));
    if(!rows.length) return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,background:C.white,padding:'30px 20px',
        textAlign:'center',color:C.faint,fontSize:13}},this.t('dsoFailOvwEmpty')));
    const body=rows.map((r,i)=>{ const bg=i%2?'#f7f9f3':C.white, nm=r.top?this.dsoDefName(r.top.code):'';
      return h('tr',{key:r.line,onClick:()=>this.set({dsoLine:r.line}),title:this.t('dsoOpenLine'),
          style:{cursor:'pointer',background:bg},'style-hover':{background:C.tint}},
        h('td',{style:{...td,paddingLeft:14,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},r.line),
        h('td',{style:{...td,textAlign:'right',fontFamily:mono,fontWeight:600,whiteSpace:'nowrap'}},this.fmt(r.pass)),
        h('td',{style:{...td,textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:14,
          color:r.fail?'#a3271b':'#c3c8bf',whiteSpace:'nowrap'}},this.fmt(r.fail)),
        h('td',{style:{...td,textAlign:'right',fontFamily:mono,fontWeight:700,
          color:r.rate?'#946200':C.faint,whiteSpace:'nowrap'}},this.dsoPct1(r.rate)),
        h('td',{style:{...td,borderRight:'none'}}, r.top
          ? h('span',{style:{display:'inline-flex',alignItems:'center',gap:8,flexWrap:'wrap'}},
              h('span',{style:{fontSize:11,fontWeight:700,fontFamily:mono,color:'#a3271b',background:'#fdecea',
                border:'1px solid #eccfca',borderRadius:999,padding:'2px 8px',whiteSpace:'nowrap'}},r.top.code),
              h('span',{style:{fontWeight:600,wordBreak:'break-word'}},nm||'\u2014'),
              h('span',{style:{fontSize:11.5,fontFamily:mono,color:C.faint,whiteSpace:'nowrap'}},
                '\u00d7'+this.fmt(r.top.n)))
          : h('span',{style:{color:C.faint}},'\u2014'))); });
    const foot=h('tr',null,
      h('td',{style:{padding:'10px 12px',fontSize:11,fontWeight:700,letterSpacing:'.4px',
        color:'#cfe0be',background:C.dark,whiteSpace:'nowrap',...tf}},this.t('colTotal')),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:12.5,
        color:'#e6efdb',background:C.dark,...tf}},this.fmt(tPass)),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:14,
        color:'#fff',background:C.dark,...tf}},this.fmt(tFail)),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:12.5,
        color:'#e6efdb',background:C.dark,...tf}},this.dsoPct1(tRate)),
      h('td',{style:{background:C.dark,...tf}}));
    return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,overflow:'hidden'}},
        h('div',{className:'yscroll',ref:this.dsoTblRef('fail',body.length),
            style:{overflowX:'auto',overflowY:'auto',maxHeight:this._tblH['fail']}},
          h('table',{style:{width:'100%',minWidth:'660px',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              h('th',{style:{...th,paddingLeft:14}},this.t('lsCol1')),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoPass')),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoFail')),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoFailRate')),
              h('th',{style:{...th,borderRight:'none'}},this.t('dsoTopDef')))),
            h('tbody',null,body),
            h('tfoot',null,foot)))));
  }

  renderDsoProd(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const list=this.prodLines();
    if(this.state.dsoLine&&list.some(x=>x.line===this.state.dsoLine)) return this.renderDsoLineDetail(this.state.dsoLine);
    if(!list.length) return h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty'));
    const show=v=>(v===''||v==null)?'\u2014':String(v);
    // 1 goc = nhan nho + so; align phai cho 2 goc ben phai
    const corner=(label,val,right)=>h('div',{style:{minWidth:0,textAlign:right?'right':'left'}},
      h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,whiteSpace:'nowrap'}},label),
      h('div',{style:{fontSize:15,fontWeight:700,fontFamily:mono,color:C.ink,marginTop:2,whiteSpace:'nowrap'}},val));
    const cardGrid=h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(238px,1fr))',gap:12}},
      list.map(x=>h('div',{key:x.line,onClick:()=>this.set({dsoLine:x.line}),title:this.t('dsoOpenLine'),
        style:{border:'1px solid '+C.border,borderRadius:14,background:C.white,boxShadow:C.shadow,cursor:'pointer',
          padding:'13px 15px',minHeight:116,display:'flex',flexDirection:'column',justifyContent:'space-between',gap:14},
        'style-hover':{borderColor:C.primary}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}},
          h('div',{style:{fontSize:16,fontWeight:700,color:C.primary,fontFamily:mono,whiteSpace:'nowrap'}},x.line),
          corner(this.t('lsCol3'),show(x.cfg.w),true)),
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:10}},
          corner(this.t('lsCol4'),show(x.cfg.hrs),false),
          corner(this.t('lsCol6'),show(x.cfg.smv),true)))));
    return h('div',{style:{padding:'16px 18px 20px'}},
      this.renderDsoOverview(),
      this.renderDsoFailOverview(),
      h('div',{style:{fontSize:15,fontWeight:700,margin:'24px 0 4px'}},this.t('dsoLines')),
      h('div',{style:{fontSize:12,color:C.faint,marginBottom:11}},this.t('dsoLinesSub')),
      cardGrid);
  }

  renderLineSetting(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows;
    if(!rows.length) return h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty'));
    const th={padding:'10px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,background:'#f8faf3',whiteSpace:'nowrap'};
    const td={padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    const lock={...td,opacity:.7,cursor:'default'};
    const inp={width:'100%',border:'1.5px solid '+C.primary,borderRadius:7,padding:'5px 7px',fontSize:12.5,fontFamily:mono,fontWeight:600,color:C.ink,background:C.white,boxSizing:'border-box'};
    const gbtn=(label,on,extra)=>h('button',{onClick:on,style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:8,padding:'4px 10px',fontSize:11.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap',...(extra||{})},'style-hover':{background:C.tint}},label);
    const body=rows.map((r,i)=>{
      const k=this.lsKey(r), v=this.lsGet(r), ed=this.state.lsEdit===k, bg=i%2?'#f7f9f3':C.white;
      const num=(field,ph,fn)=>ed
        ? h('input',{type:'text',inputMode:'decimal',value:v[field]==null?'':v[field],placeholder:ph,
            onChange:e=>this.lsSet(r,{[field]:this[fn||'lsNum'](e.target.value)}),style:{...inp,textAlign:'center'}})
        : (v[field]===''||v[field]==null?'\u2014':String(v[field]));
      return h('tr',{key:k},
        h('td',{title:this.t('tipPlanCol'),style:{...lock,background:C.tint,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},this.normName(r.line)),
        h('td',{title:this.t('tipPlanCol'),style:{...lock,background:bg,fontFamily:mono,wordBreak:'break-all'}},r.style||'\u2014'),
        h('td',{style:{...td,background:bg,textAlign:'center',fontFamily:mono}},num('w','0')),
        h('td',{style:{...td,background:bg,textAlign:'center',fontFamily:mono}},num('hrs','9.5','lsDec1')),
        h('td',{style:{...td,background:bg,textAlign:'center',color:C.faint,fontFamily:mono}},v.date||'\u2014'),
        h('td',{title:this.t('lsDec1Tip'),style:{...td,background:bg,textAlign:'center',fontFamily:mono}},num('smv','0','lsDec1')),
        h('td',{title:this.t('lsTypeTip'),style:{...td,background:bg,textAlign:'center'}}, ed
          ? h('select',{value:this.lsTypeLabel(r),disabled:true,onChange:()=>{},
              style:{...inp,border:'1px solid '+C.border,color:C.sub,background:'#f1f2ef',cursor:'not-allowed',appearance:'auto'}},
              h('option',{value:this.lsTypeLabel(r)},this.lsTypeLabel(r)||'\u2014'))
          : (this.lsTypeLabel(r)||'\u2014')),
        h('td',{style:{...td,background:bg,textAlign:'center',fontFamily:mono,fontWeight:700}}, ed
          ? h('input',{type:'text',inputMode:'numeric',value:v.tgt==null?'':v.tgt,placeholder:'0',
              title:this.t('lsPctTip'),onChange:e=>this.lsSet(r,{tgt:this.lsPct(e.target.value)}),style:{...inp,textAlign:'center'}})
          : (v.tgt===''||v.tgt==null?'\u2014':v.tgt+'%')),
        h('td',{style:{...td,background:bg}}, v.file
          ? h('span',{style:{display:'inline-flex',alignItems:'center',gap:7,minWidth:0}},
              h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:C.primary,strokeWidth:2,style:{flex:'none'}},h('path',{d:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'}),h('path',{d:'M14 2v6h6'})),
              h('span',{style:{fontWeight:600,wordBreak:'break-all'}},v.file.name),
              h('span',{style:{flex:'none',fontSize:10.5,color:C.faint,fontFamily:mono}},this.lsFileSize(v.file.size)),
              h('button',{title:this.t('lsFileDel'),onClick:()=>this.lsFileDel(r),style:{flex:'none',border:'none',background:'none',color:'#c0392b',cursor:'pointer',padding:0,fontSize:14,lineHeight:1,fontFamily:'inherit'}},'\u00d7'))
          : h('span',{style:{color:C.faint}},'\u2014')),
        h('td',{style:{...td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6,alignItems:'center'}},
            ed?gbtn(this.t('lsDone'),()=>this.lsDone(r),{border:'1px solid '+C.primary,background:C.tint})
              :gbtn(this.t('lsEdit'),()=>this.set({lsEdit:k})),
            h('label',{title:this.t('lsImportTip'),style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:8,padding:'4px 10px',fontSize:11.5,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'},'style-hover':{background:C.tint}},
              this.t('lsImport'),
              h('input',{type:'file',accept:'.xlsx,.xls,.csv',style:{display:'none'},
                onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(f) this.lsImport(r,f); }})))));
    });
    return h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1180px',borderCollapse:'collapse'}},
        h('thead',null,h('tr',null,
          h('th',{style:{...th,paddingLeft:22}},this.t('lsCol1')),
          h('th',{style:th},this.t('lsCol2')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol3')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol4')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol5')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol6')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol7')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol8')),
          h('th',{style:th},this.t('lsCol9')),
          h('th',{style:{...th,borderRight:'none'}},this.t('lsCol10')))),
        h('tbody',null,body)));
  }

  renderDsoBody(){
    const h=React.createElement; const tab=this.state.dsoTab||'cfg';
    if(tab!=='mlv') this.mlvClockOff();
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('dsoTitle','S-05-SEWOUT-DAILY · UI Proto'),
      this.tabBar(this.DSO_TABS,tab,id=>this.set({dsoTab:id,edit:null}),false),
      tab==='prod'?this.dsoCard('dsoProdPanel','dsoProdSub','DSO Production',this.renderDsoProd())
      :tab==='alert'?this.renderDsoAlerts()
      :tab==='mlv'?this.renderDsoMlv()
      :this.renderDsoSettings());
  }

  renderDashBody(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const wk=this.CURWK, caps=this.capRows();
    const wkRows=((this.state.weeks||{})[wk]||{rows:[]}).rows;
    const agg={}; wkRows.forEach(r=>{ const p=this.DAYS.reduce((a,d)=>a+(Number(r.days[d])||0),0); if(!p&&!r.style) return;
      const key=this.normName(r.line); const o=agg[key]=agg[key]||{plan:0,styles:[]}; o.plan+=p; if(r.style&&!o.styles.includes(r.style)) o.styles.push(r.style); });
    const sewRows=Object.keys(agg).map((k,i)=>{ const o=agg[k]; const pct=o.plan?(45+(i*17)%50):0;
      return {line:k,styles:o.styles.join(', '),plan:o.plan,done:Math.round(o.plan*pct/100),pct}; }).filter(x=>x.plan>0);
    const totPlan=sewRows.reduce((a,x)=>a+x.plan,0), totDone=sewRows.reduce((a,x)=>a+x.done,0);
    const sewPct=totPlan?Math.round(totDone/totPlan*100):0;
    const T=this.capTotals();
    let ordered=0; caps.forEach(r=>{ ordered+=this.capVals(r).list.length; });
    let placed=0; this.CUTPLAN.forEach(b=>{ placed+=Object.keys(b.days).length; });
    const cutRows=caps.map((r,i)=>({r,v:this.capVals(r),i})).filter(x=>!x.v.ooo&&x.v.list.length>0).map(({r,v,i})=>{
      const b=this.CUTPLAN.find(x=>x.row===i); const sc=b?Object.keys(b.days).length:0;
      return {line:r.line,name:r.brand+' · '+r.style,sc,tot:v.list.length,pct:Math.round(sc/v.list.length*100)}; });
    const tbStat={}; ['1','2','3','4','5','6'].forEach(t2=>tbStat[t2]={turns:0,qty:0});
    this.DAYS.forEach(d=>{ const drows=(this.state.daily||{})[wk+'|'+d];
      if(drows){ drows.filter(r=>r.k).forEach(r=>{ const t2=(((this.state.capTurns||{})[r.k])||[]).find(x=>x.c===r.tc); const o=tbStat[r.tb]; if(o){ o.turns++; o.qty+=t2?Number(t2.q)||0:0; } }); }
      else{ let n=0; this.CUTPLAN.forEach(b=>{ const s=b.days[d]; if(!s) return; const src=caps[b.row]; if(!src) return;
        const mc='ABC'[n%3]; const o=tbStat[this.MACH[mc][0]]; const t2=((this.state.capTurns||{})[src.id]||[])[s.slot];
        if(o){ o.turns++; o.qty+=(t2&&Number(t2.q))||Number(s.qty)||0; } n++; }); } });
    const maxT=Math.max(1,...Object.values(tbStat).map(o=>o.turns));
    const TBM={'1':'A','2':'A','3':'B','4':'B','5':'C','6':'C'};
    const icons=[
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('path',{d:'M22 12h-4l-3 9L9 3l-3 9H2'})),
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('circle',{cx:6,cy:6,r:3}),h('circle',{cx:6,cy:18,r:3}),h('path',{d:'M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12'})),
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('path',{d:'M12 2 2 7l10 5 10-5-10-5z'}),h('path',{d:'M2 17l10 5 10-5M2 12l10 5 10-5'})),
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('path',{d:'M20 6 9 17l-5-5'}))];
    const kcards=[[this.t('dashK1'),this.fmtn(totPlan),this.t('dashK1s')],[this.t('dashK2'),this.fmtn(Math.round(T.out)),this.t('dashK2s')],
      [this.t('dashK3'),placed+' / '+ordered,this.t('dashK3s')],[this.t('dashK4'),sewPct+'%',this.t('dashK4s')]];
    const kpis=h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}},
      kcards.map(([label,val,sub],i)=>h('div',{key:i,title:sub,style:{background:C.white,border:'1px solid '+C.border,borderRadius:13,padding:'10px 14px',boxShadow:C.shadow,display:'flex',alignItems:'center',gap:10}},
        h('div',{style:{width:26,height:26,borderRadius:8,background:i===3?'#fbf3df':C.tint,color:i===3?'#b0791b':C.dark,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},icons[i]),
        h('div',{style:{flex:1,minWidth:0,fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.sub,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},label),
        h('div',{style:{fontSize:19,fontWeight:700,letterSpacing:'-.4px',lineHeight:1,fontVariantNumeric:'tabular-nums',flex:'none',fontFamily:mono}},val))));
    const panel=(title,children)=>h('div',{style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow}},
      h('div',{style:{padding:'11px 16px',borderBottom:'1px solid '+C.line,fontSize:11,fontWeight:700,letterSpacing:'.5px',color:C.sub,background:'#f8faf3'}},title),
      h('div',{style:{padding:'4px 16px 10px'}},children));
    const bar=(pct,color)=>h('div',{style:{flex:'1 1 70px',height:6,borderRadius:99,background:'#edefe9',overflow:'hidden',minWidth:60}},
      h('div',{style:{height:'100%',width:Math.min(100,pct)+'%',background:color,borderRadius:99}}));
    const prow=(a,b,mid,pct,color,i)=>h('div',{key:i,style:{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderTop:i?'1px solid '+C.line:'none'}},
      h('span',{style:{width:66,fontSize:11.5,fontWeight:700,color:C.dark,flex:'none',whiteSpace:'nowrap'}},a),
      h('span',{style:{flex:'1 1 90px',minWidth:0,fontSize:10,fontFamily:mono,color:C.faint,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},b),
      h('span',{style:{fontSize:10.5,fontFamily:mono,fontWeight:600,color:C.sub,whiteSpace:'nowrap',flex:'none'}},mid),
      bar(pct,color),
      h('span',{style:{width:40,textAlign:'right',fontSize:11.5,fontFamily:mono,fontWeight:700,color:pct>=100?C.primary:C.ink,flex:'none'}},pct+'%'));
    const sewPanel=panel(this.t('dashSew'),sewRows.map((x,i)=>prow(x.line,x.styles,this.fmtn(x.done)+' / '+this.fmtn(x.plan),x.pct,x.pct>=80?C.primary:(x.pct>=60?'#8fb35e':'#d9a13c'),i)));
    const cutPanel=panel(this.t('dashCut'),cutRows.map((x,i)=>prow(x.line,x.name,x.sc+' / '+x.tot+' '+this.t('cpTurnU'),x.pct,x.pct>=100?C.primary:'#b0791b',i)));
    const tbPanel=h('div',{style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow,marginTop:16}},
      h('div',{style:{padding:'11px 16px',borderBottom:'1px solid '+C.line,fontSize:11,fontWeight:700,letterSpacing:'.5px',color:C.sub,background:'#f8faf3'}},this.t('dashTb')+' · '+this.wkRange()),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10,padding:'14px 16px'}},
        ['1','2','3','4','5','6'].map(t2=>{ const o=tbStat[t2]; const pct=Math.round(o.turns/maxT*100);
          return h('div',{key:t2,style:{border:'1px solid '+C.border,borderRadius:10,padding:'9px 11px',background:o.turns?C.white:'#fafbf7'}},
            h('div',{style:{display:'flex',alignItems:'baseline',gap:6}},
              h('span',{style:{fontSize:12,fontWeight:700,color:C.dark}},this.t('dpTbOpt')+' '+t2),
              h('span',{style:{fontSize:9,fontWeight:700,color:C.faint,background:'#f2f4ee',borderRadius:4,padding:'1px 5px'}},this.t('dpMcOpt')+' '+TBM[t2]),
              h('span',{style:{marginLeft:'auto',fontSize:10.5,fontFamily:mono,fontWeight:700,color:o.turns?C.ink:C.faint}},o.turns+' '+this.t('cpTurnU'))),
            h('div',{style:{height:5,borderRadius:99,background:'#edefe9',margin:'7px 0 5px',overflow:'hidden'}},
              h('div',{style:{height:'100%',width:(o.turns?Math.max(pct,8):0)+'%',background:C.primary,borderRadius:99}})),
            h('div',{style:{fontSize:9.5,fontFamily:mono,color:C.faint}},this.fmtn(o.qty)+' pcs')); })));
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('dashTitle','S-00-DASHBOARD · UI Proto'),
      kpis,
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(380px,1fr))',gap:16}},sewPanel,cutPanel),
      tbPanel);
  }

  psClone(o){ return o?JSON.parse(JSON.stringify(o)):{groups:[],start:'2026-01-01',days:1}; }
  PS(){ this.ensureSeed(); return (this.state&&this.state.ps)||window.PSCHED||{groups:[],start:'2026-01-01',days:1}; }
  // Mọi thay đổi kế hoạch đi qua đây: sửa bản sao rồi setState -> tự động lưu
  psSet(fn){ this._psLines=null;
    this.setState(st=>{ const ps=this.psClone(st.ps||window.PSCHED); if(fn(ps)===false) return {}; return {ps}; });
    this.psTouch(); }
  ensureSeed(){ if(this._seeding||!window.PSCHED||!window.KHC) return;
    const cur=(this.state&&this.state.ps)||window.PSCHED;
    if(window.KHC.__seed&&cur.__seed) return;
    this._seeding=true; try{ this.psSeedPlans(); }catch(e){} this._seeding=false;
    if(this._mounted){ clearTimeout(this._seedT); this._seedT=setTimeout(()=>this.reconcileWeeks(),0); } }
  psS(){ const p=String(this.PS().start).split('-').map(Number); return new Date(p[0],(p[1]||1)-1,p[2]||1); }
  psD(off){ const d=this.psS(); d.setDate(d.getDate()+off); return d; }
  psOff(v){ const p=String(v).split('-').map(Number); return Math.round((new Date(p[0],(p[1]||1)-1,p[2]||1)-this.psS())/86400000); }
  psPlan(o){ return o.planId?(this.kcPlans().find(p=>p.id===o.planId)||null):null; }
  // Tỷ lệ cắt theo mã + danh mục vải của đơn — lấy từ tác nghiệp cắt
  psRatio(o){ const p=this.psPlan(o);
    if(p){ const sec=(p.sections||[]).find(s=>s.grp!=='aux'); const t=sec&&sec.tables&&sec.tables[0];
      if(t) return this.kcNote(t)+' · '+t.ly+' '+this.t('kcLop'); }
    return '—'; }
  psMats(o){ const p=this.psPlan(o); const out=[];
    if(p){ (p.sections||[]).forEach(s=>{ if(s.grp!=='aux'&&out.indexOf(s.fab)<0) out.push(s.fab); }); if(out.length) return out; }
    return (this.fabOf(this.psCode(o.code))||[]).map(f=>f.vl).filter(v=>v&&v!=='—'); }
  psSetDate(field,val){ const k=this.state.gsel; if(!k||!val) return;
    this.psSet(ps=>{ const o=(((((ps.groups||[])[k.g]||{}).rows||[])[k.r]||{}).orders||[])[k.i];
      if(!o) return false; o[field]=val; }); }
  psShortD(v){ const p=String(v||'').split('-'); return p.length>2?p[2]+'/'+p[1]:''; }
  // Tuần của kỳ hiện tại luôn có dòng — bù lại sau khi khôi phục bản lưu / dữ liệu về muộn
  reconcileWeeks(){
    const keys=[]; Object.values(this.MONTHS).forEach(ws=>ws.forEach(w=>keys.push(w)));
    const w={...(this.state.weeks||{})}; let ch=false;
    // Bản lưu cũ còn mã hàng dính mô tả từ file KHSX — làm sạch cả dữ liệu đã lưu
    const fix={};
    Object.keys(w).forEach(k=>{ const rows=(w[k]&&w[k].rows)||[]; let dirty=false;
      const nr=rows.map(r=>{ const c=this.psCode(r.style); if(c===r.style) return r; fix[r.style]=c; dirty=true; return {...r,style:c}; });
      if(dirty){ w[k]={...w[k],rows:nr}; ch=true; } });
    if(Object.keys(fix).length){
      const sub=s=>{ let v=String(s==null?'':s); Object.keys(fix).forEach(bad=>{ if(v.indexOf(bad)>=0) v=v.split(bad).join(fix[bad]); }); return v; };
      const remap=o=>{ if(!o) return o; const out={}; Object.keys(o).forEach(k2=>{ out[sub(k2)]=o[k2]; }); return out; };
      this.state.cap=remap(this.state.cap);
      const daily={...(this.state.daily||{})};
      Object.keys(daily).forEach(dk=>{ daily[dk]=(daily[dk]||[]).map(r=>(r&&r.k&&sub(r.k)!==r.k)?{...r,k:sub(r.k)}:r); });
      this.state.daily=daily; }
    let reseed=false;
    keys.forEach(k=>{ const cur=w[k];
      if(cur&&cur.rows&&cur.rows.length&&!cur.demo&&!cur.auto) return;   // tuần đã sửa tay -> giữ nguyên
      const rows=this.psPlanRows(k); if(!rows.length&&cur) return;
      if(cur&&cur.demo) reseed=true;
      if(cur&&cur.auto&&JSON.stringify(cur.rows)===JSON.stringify(rows)) return;
      w[k]={rows,auto:true}; ch=true; });
    if(ch) this.state.weeks=w;
    const ci=keys.indexOf(this.CURWK), wi=keys.indexOf(this.state.week);
    if(wi<0||(ci>=0&&wi<ci)){ this.state.week=this.CURWK; ch=true; }
    if(this.state.openMonth!==String(this.state.week).split(' · ')[0]){ this.state.openMonth=String(this.state.week).split(' · ')[0]; ch=true; }
    if(ch){ if(this.state.capTurns) this.state.capTurns=this.allocTurns();
      if(reseed||!Object.keys(this.state.bundle||{}).length) this.state.bundle=this.initBundle((this.state.weeks[this.CURWK]||{rows:[]}).rows); }
    if(this._mounted&&ch) this.forceUpdate(); }
  // ==== Tác nghiệp cắt cho đơn chưa upload file — sinh 1 lần, dùng chung mọi màn ====
  genStyleKey(code){ return this.psCode(code).toUpperCase(); }
  genPlanKey(o){ const po=String(o.po||'').trim(); return this.genStyleKey(o.code)+'|'+(po||o.start); }
  genSection(style,sizes,dem,total,nextId){
    const ss=this.SORDER.filter(s=>(sizes||[]).includes(s)); if(!ss.length||total<=0) return null;
    const tot=ss.reduce((a,s)=>a+(dem[s]||0),0)||1, r10=total>=1000, need={};
    ss.forEach(s=>{ const v=total*(dem[s]||0)/tot; need[s]=r10?Math.round(v/10)*10:Math.round(v); });
    if(!ss.some(s=>need[s]>0)) need[ss[Math.floor(ss.length/2)]]=total;
    const tables=[]; let guard=0;
    while(guard++<16){
      const rank=ss.filter(s=>need[s]>0).sort((a,b)=>need[b]-need[a]); if(!rank.length) break;
      const pick=rank.slice(0,3), base=need[pick[0]];
      const sz=pick.map(s=>[s,Math.max(1,Math.min(3,Math.round(need[s]/Math.max(1,base/3))))]);
      const ly=Math.max(4,Math.min(122,Math.round(base/(sz[0][1]||1))));
      sz.forEach(p=>{ need[p[0]]=Math.max(0,need[p[0]]-p[1]*ly); });
      tables.push({tb:nextId(),ly,gb:0,sz}); }
    if(!tables.length) return null;
    const acc={}; tables.forEach(t=>t.sz.forEach(p=>{ acc[p[0]]=(acc[p[0]]||0)+p[1]*t.ly; }));
    const demand=ss.filter(s=>acc[s]).map(s=>[s,acc[s]]);
    return {fab:'',grp:'main',demand,total:demand.reduce((a,d)=>a+d[1],0),tables}; }
  genPlan(o,id){
    const style=this.genStyleKey(o.code)||String(o.code||'—'), qty=Math.max(30,Number(o.qty)||0);
    const sizes=this.sizesFor(style), dem=this.demandTarget(style), cols=this.cutColors(style);
    const nC=Math.min(cols.length, qty>=3000?3:qty>=900?2:1);
    const w=[0.5,0.3,0.2].slice(0,nC), wsum=w.reduce((a,x)=>a+x,0);
    const sections=[]; let left=qty, n=0;
    for(let ci=0;ci<nC;ci++){
      const share=ci===nC-1?left:Math.round(qty*w[ci]/wsum/10)*10; left-=share;
      const sec=this.genSection(style,sizes,dem,share,()=>'C'+(++n)); if(!sec) continue;
      sec.fab=String(cols[ci]||'MAIN').toUpperCase(); sections.push(sec); }
    if(!sections.length) return null;
    const po=String(o.po||'').trim();
    return {id,gen:true,style,buyer:this.brandOf(o)||'—',po:po?('PO '+po):'',qrPo:po.replace(/\s+/g,''),
      label:style+(po?' · PO '+po:' · '+String(o.start||'').slice(5)),sections}; }
  psSeedPlans(){
    if(!window.PSCHED||!window.KHC) return false;
    const wasSeeding=this._seeding; this._seeding=true;
    const KH=window.KHC; KH.plans=KH.plans||[];
    const have={}; KH.plans.forEach(p=>have[p.id]=1);
    const t=this.psToday(), b=(t==null?0:t), w0=this.psD(b-84), w1=this.psD(b+140);
    let made=0;
    (this.PS().groups||[]).forEach(g=>{ if(g.kind==='sub') return;
      (g.rows||[]).forEach(r=>(r.orders||[]).forEach(o=>{
        if(o.planId||!o.code||!o.qty) return;
        const s=this.pd(o.start), e=this.pd(o.end); if(e<w0||s>w1) return;
        const style=this.genStyleKey(o.code);
        const up=this.khcPlansFor(style).filter(p=>!p.gen), pd=String(o.po||'').replace(/\D/g,'');
        if(up.length&&pd){ const hit=up.find(p=>{ const q=String(p.qrPo||'').replace(/\D/g,''); return q&&(q===pd||q.indexOf(pd)>=0||pd.indexOf(q)>=0); });
          if(hit){ o.planId=hit.id; return; } }
        const id='gen-'+this.genPlanKey(o).replace(/[^A-Za-z0-9]+/g,'').slice(0,30);
        if(!have[id]){ const p=this.genPlan(o,id); if(!p) return; have[id]=1; KH.plans.push(p); made++; }
        o.planId=id; })); });
    KH.__seed=1; const _ps=(this.state&&this.state.ps)||window.PSCHED; if(_ps) _ps.__seed=1; this._kt={}; this._seeding=wasSeeding; return made>0; }
  psQty(o){ if(o.qty) return o.qty; const pl=this.psPlan(o); return pl?this.kcStat(pl).pcs:0; }
  psGeom(o){ const s=o.start?this.psOff(o.start):(o.s||0); const n=o.end?(this.psOff(o.end)-s+1):(o.n||1); return {s,n:Math.max(1,n)}; }
  psDayW(){ return [5,8.4,13.5][this.state.gz==null?1:this.state.gz]; }
  psMonName(){ return this.state.lang==='vi'?['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12']:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; }
  psMonths(){ const T=this.PS().days, out=[]; let off=0;
    while(off<T&&out.length<48){ const d=this.psD(off), dim=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
      const len=Math.min(dim-d.getDate()+1,T-off); out.push({off,len,m:d.getMonth(),y:d.getFullYear()}); off+=len; }
    return out; }
  psToday(){ const t=new Date(), off=Math.round((new Date(t.getFullYear(),t.getMonth(),t.getDate())-this.psS())/86400000);
    return (off>=0&&off<this.PS().days)?off:null; }
  psTotals(){ let n=0,pcs=0,ln=0; (this.PS().groups||[]).forEach((g,gi)=>(g.rows||[]).forEach((r,ri)=>{
    const it=this.psRowItems(gi,ri,r).filter(x=>!x.del); if(!it.length) return; ln++;
    it.forEach(x=>{ n++; pcs+=this.psQty(x.o); }); })); return {n,pcs,ln}; }
  psSel(){ const k=this.state.gsel; if(!k) return null; const g=(this.PS().groups||[])[k.g]; if(!g) return null;
    const r=(g.rows||[])[k.r]; if(!r) return null;
    const o=this.psOrderAt(k.g,k.r,k.i);
    if(!o) return null;
    return {g,r,o,ov:!!o.src}; }
  // Don con nam tren bieu do (bo don da xoa) -- dung cho ve, xep lane va dem
  psLiveItems(gi,ri,r){ return this.psRowItems(gi,ri,r).filter(it=>!it.del); }
  // Không còn overlay: đơn nào cũng nằm thẳng trong r.orders
  psRowItems(gi,ri,r){ return (r.orders||[]).map((o,oi)=>({o,i:oi,key:gi+'|'+ri+'|'+oi,del:false,ov:!!o.src})); }
  // Sửa kế hoạch sản xuất -> gieo lại các tuần chưa sửa tay của Kế hoạch may
  psLineNo(name){ const n=this.parseNums(name); return n.length?n[0]:9999; }
  psFreeLineNo(g){ const used=new Set(); ((g&&g.rows)||[]).forEach(r=>this.parseNums(r.line).forEach(n=>used.add(n)));
    let n=1; while(used.has(n)) n++; return n; }
  // Chuyền nằm thẳng trong state.ps -> thêm/xóa là sửa mảng rows, không cần phát lại gì.
  // gsel bỏ về null vì chỉ số dòng đổi sau khi sắp lại.
  psAddLine(gi){ const g=(this.PS().groups||[])[gi]; if(!g) return;
    const nm='LINE '+this.psFreeLineNo(g);
    this.psSet(ps=>{ const gg=(ps.groups||[])[gi]; if(!gg) return false;
      gg.rows=[...(gg.rows||[]),{line:nm,cap:'',orders:[]}];
      gg.rows.sort((a,b)=>this.psLineNo(a.line)-this.psLineNo(b.line)); });
    this.setState({gsel:null}); }
  psDelLine(gi,ri){ const g=(this.PS().groups||[])[gi]; if(!g) return;
    const r=(g.rows||[])[ri]; if(!r||(r.orders||[]).length) return;   // còn đơn thì không xóa
    this.psSet(ps=>{ const gg=(ps.groups||[])[gi]; if(!gg) return false;
      gg.rows=(gg.rows||[]).filter((x,i)=>i!==ri); });
    this.setState({gsel:null}); }
  psTouch(){ clearTimeout(this._rcT); this._rcT=setTimeout(()=>this.reconcileWeeks(),0); }
  // Xóa thật: cắt khỏi r.orders. Thùng rác giữ cả nội dung đơn + tên chuyền để hoàn tác
  // (giữ tên chuyền chứ không giữ chỉ số dòng, để thêm/xóa chuyền sau đó không làm lệch).
  psDelOrder(){ const k=this.state.gsel, s=this.psSel(); if(!k||!s) return;
    const label=this.normName(s.r.line)+' · '+this.psLabel(s.o);
    const key='del'+Date.now()+'-'+k.g+'-'+k.r+'-'+k.i;
    const o=this.psClone(s.o), line=this.normName(s.r.line);
    this.psSet(ps=>{ const rr=(((ps.groups||[])[k.g]||{}).rows||[])[k.r];
      if(!rr||!rr.orders||!rr.orders[k.i]) return false;
      rr.orders=rr.orders.filter((x,i)=>i!==k.i); });
    this.setState(st=>({psTrash:[...(st.psTrash||[]),{key,label,g:k.g,line,i:k.i,o}],gsel:null})); }
  psRestore(key){ const tr=(this.state.psTrash||[]).find(x=>x.key===key); if(!tr) return;
    if(tr.o){ this.psSet(ps=>{ const g=(ps.groups||[])[tr.g]; if(!g) return false;
        const rr=(g.rows||[]).find(x=>this.normName(x.line)===tr.line)||(g.rows||[])[tr.i];
        if(!rr) return false;
        const arr=[...(rr.orders||[])]; arr.splice(Math.min(tr.i==null?arr.length:tr.i,arr.length),0,tr.o);
        rr.orders=arr; }); }
    this.setState(st=>{ const t=(st.psTrash||[]).filter(x=>x.key!==key);
      return {psTrash:t,psTrashOpen:t.length?st.psTrashOpen:false}; }); }
  psUndo(){ const t=this.state.psTrash||[]; if(t.length) this.psRestore(t[t.length-1].key); }
  psFmtD(d){ const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }
  psOpenAdd(g,r){ const t=this.psToday(); const b=t==null?0:t;
    this.setState({psAdd:{g,r,code:'',brand:'',po:'',qty:'',start:this.psFmtD(this.psD(b)),end:this.psFmtD(this.psD(b+6)),file:'',mode:'file',msz:['XS','S','M','L','XL','2XL'],mtb:[{tb:'C1',ly:100,r:{},cp:[{c:'',po:''}]}]},gsel:null,psTrashOpen:false}); }
  manTotal(f){ const sz=(f&&f.msz)||[]; return ((f&&f.mtb)||[]).reduce((a,t)=>a+sz.reduce((b,n)=>b+(Number(t.r[n])||0),0)*(Number(t.ly)||0),0); }
  manBySize(f){ const o={}; ((f&&f.mtb)||[]).forEach(t=>((f&&f.msz)||[]).forEach(n=>{ const r=Number(t.r[n])||0; if(r) o[n]=(o[n]||0)+r*(Number(t.ly)||0); })); return o; }
  setManTb(i,patch){ this.setState(s=>{ const f={...(s.psAdd||{})}; f.mtb=(f.mtb||[]).map((t,x)=>x===i?{...t,...patch}:t); return {psAdd:f}; }); }
  setManR(i,sz,v){ this.setState(s=>{ const f={...(s.psAdd||{})}; f.mtb=(f.mtb||[]).map((t,x)=>x===i?{...t,r:{...t.r,[sz]:Math.max(0,parseInt(v,10)||0)}}:t); return {psAdd:f}; }); }
  manCp(t){ const a=(t&&t.cp)||[]; return a.length?a:[{c:'',po:''}]; }
  setManCp(i,j,patch){ this.setState(s=>{ const f={...(s.psAdd||{})};
    f.mtb=(f.mtb||[]).map((t,x)=>{ if(x!==i) return t; const cp=this.manCp(t).map((p,y)=>y===j?{...p,...patch}:p); return {...t,cp}; }); return {psAdd:f}; }); }
  addManCp(i){ this.setState(s=>{ const f={...(s.psAdd||{})};
    f.mtb=(f.mtb||[]).map((t,x)=>{ if(x!==i) return t; const cp=this.manCp(t); if(cp.length>=2) return t; return {...t,cp:[...cp,{c:'',po:''}]}; }); return {psAdd:f}; }); }
  delManCp(i,j){ this.setState(s=>{ const f={...(s.psAdd||{})};
    f.mtb=(f.mtb||[]).map((t,x)=>{ if(x!==i) return t; const cp=this.manCp(t).filter((p,y)=>y!==j); return {...t,cp:cp.length?cp:[{c:'',po:''}]}; }); return {psAdd:f}; }); }
  manCpList(f){ const out=[]; ((f&&f.mtb)||[]).forEach(t=>this.manCp(t).forEach(p=>{ const c=String(p.c||'').trim(); const po=String(p.po||'').trim(); if(!c&&!po) return;
    if(!out.some(x=>x.c===c&&x.po===po)) out.push({c,po}); })); return out; }
  addManTb(){ this.setState(s=>{ const f={...(s.psAdd||{})}; const tb=[...(f.mtb||[])]; tb.push({tb:'C'+(tb.length+1),ly:100,r:{},cp:[{c:'',po:String((f.po||'')).trim()}]}); f.mtb=tb; return {psAdd:f}; }); }
  delManTb(i){ this.setState(s=>{ const f={...(s.psAdd||{})}; const tb=(f.mtb||[]).filter((t,x)=>x!==i); f.mtb=tb.length?tb:[{tb:'C1',ly:100,r:{},cp:[{c:'',po:''}]}]; return {psAdd:f}; }); }
  toggleManSz(n){ this.setState(s=>{ const f={...(s.psAdd||{})}; const cur=(f.msz||[]).slice();
    const i=cur.indexOf(n); if(i>=0) cur.splice(i,1); else cur.push(n);
    f.msz=this.SORDER.filter(x=>cur.indexOf(x)>=0);
    f.mtb=(f.mtb||[]).map(t=>{ const r={...t.r}; if(i>=0) delete r[n]; return {...t,r}; });
    return {psAdd:f}; }); }
  setPsAdd(patch){ this.setState(s=>({psAdd:{...(s.psAdd||{}),...patch}})); }
  savePsAdd(){ const f=this.state.psAdd; if(!f) return; const code=String(f.code||'').trim(); if(!code) return;
    const sz=(f.msz||[]);
    const man=f.mode==='manual'?{sizes:sz.slice(),tables:(f.mtb||[]).filter(t=>sz.some(n=>Number(t.r[n])>0)).map(t=>({tb:String(t.tb||'').trim()||'B',ly:Number(t.ly)||0,r:{...t.r},
      cp:this.manCp(t).map(p=>({c:String(p.c||'').trim(),po:String(p.po||'').trim()})).filter(p=>p.c||p.po)}))}:null;
    const mq=man?this.manTotal(f):0;
    const mpo=man?this.manCpList(f).map(p=>p.po).filter(Boolean).filter((p,i,a)=>a.indexOf(p)===i).join(' · '):'';
    const brand=String(f.brand||'').trim().toUpperCase();
    const o={code,po:mpo||String(f.po||'').trim(),qty:mq||Math.max(0,parseInt(String(f.qty).replace(/[^0-9]/g,''),10)||0),
      start:f.start,end:f.end,brand:brand||undefined,color:((this.PS().brands)||{})[brand]||'#e3ecd4',man:man,
      txt:code+(brand?(' · '+brand):'')+((mpo||f.po)?(' · PO '+(mpo||f.po)):'')};
    const at=((((this.PS().groups||[])[f.g]||{}).rows||[])[f.r]||{}).orders||[];
    const idx=at.length;
    this.psSet(ps=>{ const rr=(((ps.groups||[])[f.g]||{}).rows||[])[f.r]; if(!rr) return false;
      rr.orders=[...(rr.orders||[]),o]; });
    this.setState(s=>({psAdd:null,files:f.file?[...s.files,{name:f.file}]:s.files,gsel:{g:f.g,r:f.r,i:idx}}));
    setTimeout(()=>this.psScrollToCut(),200); }
  // Xếp làn (lane) cho từng chuyền: đơn chồng thời gian nằm làn riêng
  psLaneMap(gi,g,rows){
    const info=rows.map(()=>({lanes:1,place:{}}));
    const fits=(arr,s,e)=>!arr.some(x=>x.s<e&&x.e>s);
    rows.forEach((r,ri)=>{
      const items=this.psLiveItems(gi,(g.rows||[]).indexOf(r),r), lanes=[[]];
      items.map(it=>({it,g:this.psGeom(it.o)})).sort((a,b)=>a.g.s-b.g.s).forEach(({it,g:gm})=>{
        const s=gm.s, e=gm.s+gm.n; let li=0;
        while(li<lanes.length&&!fits(lanes[li],s,e)) li++;
        if(li===lanes.length) lanes.push([]);
        lanes[li].push({s,e}); info[ri].place[it.key]=li; });
      info[ri].lanes=lanes.length; });
    return info; }
  // Mã hàng trong file KHSX bị dính cả mô tả công đoạn — chỉ giữ phần mã, mô tả nằm ở DÒNG GỐC
  psCode(code){ let s=String(code||'').trim();
    s=s.split('(')[0].trim();
    s=s.replace(/\s*\/\s*PO[-\s]*[\d,\s]*$/i,'');
    const m=s.match(/^(.*?[A-Z0-9&])(?=[A-Z][a-z])/); if(m&&m[1].length>=4) s=m[1];
    return s.replace(/[\s&\/+-]+$/,'').trim()||String(code||''); }
  psLabel(o){ const q=this.psQty(o); return this.psCode(o.code)+(o.po?' · PO '+o.po:'')+(q?' · '+this.fmtn(q)+' pcs':''); }
  // Chỉ lấy đơn còn chạy trong tuần đang chọn — tránh chọn nhầm đơn đã kết thúc
  psActiveOrders(key){ const R=this.psWeekRange(key||(this.state&&this.state.week)||this.CURWK); const out=[];
    (this.PS().groups||[]).forEach(g=>(g.rows||[]).forEach(r=>(r.orders||[]).forEach(o=>{
      if(this.pd(o.start)<=R[1]&&this.pd(o.end)>=R[0]) out.push(Object.assign({line:r.line},o)); }))); return out; }
  // Tổng SL của đơn theo kế hoạch sản xuất — dùng khi chưa có file tác nghiệp cắt
  psOrderQty(r){ const ln=this.normName(r.line), st=String(r.style||'').toUpperCase().replace(/\s+/g,'');
    if(!st) return 0; let q=0;
    (this.PS().groups||[]).forEach(g=>(g.rows||[]).forEach(row=>{ if(this.normName(row.line)!==ln) return;
      (row.orders||[]).forEach(o=>{ if(String(o.code||'').toUpperCase().replace(/\s+/g,'')===st) q=Math.max(q,o.qty||0); }); }));
    return q; }
  KBRANDS=['VUORI','FIGS','KOLON','HELINOX','AETHER','DESCENTE','DISCOVERY','COTOPAXI','SANMAR','FILA CHINA','RIDESTORE','LULULEMON','PATAGONIA','NIKE','ON RUNNING','KSK','KSC'];
  // Không có mã hàng nào mà không có thương hiệu — thiếu thì suy ra từ ghi chú trong file kế hoạch
  brandOf(o){ if(!o) return ''; if(o.brand&&o.brand!=='OTHER') return o.brand;
    this._bo=this._bo||{}; const ck=(o.note||'')+'|'+(o.code||''); if(this._bo[ck]) return this._bo[ck];
    const hay=((o.note||'')+' '+(o.txt||'')).toUpperCase(); let v='';
    for(let i=0;i<this.KBRANDS.length;i++){ if(hay.indexOf(this.KBRANDS[i])>=0){ v=this.KBRANDS[i]; break; } }
    if(!v){ const t=String(o.note||'').replace(/^(FW|SS|AW|SP)\d{2}(>(FW|SS|AW|SP)\d{2})?\s*/i,'').replace(/^\d{2}Q\d\s*/i,'');
      const m=t.match(/^[A-Z][A-Z&./ ]{2,24}/); if(m) v=m[0].replace(/\s+(M|MAT|DEL|D)$/,'').trim(); }
    this._bo[ck]=v||'OTHER'; return this._bo[ck]; }
  brandForStyle(code){ const st=String(code||'').toUpperCase().replace(/\s+/g,''); if(!st) return '';
    let b=''; this.psActiveOrders().forEach(o=>{ if(!b&&String(o.code||'').toUpperCase().replace(/\s+/g,'')===st) b=this.brandOf(o); });
    if(!b) Object.keys(this.MES).forEach(k=>{ if(!b&&(this.MES[k]||[]).some(x=>String(x).toUpperCase().replace(/\s+/g,'')===st)) b=k; });
    return b==='OTHER'?'':b; }
  // Gợi ý thương hiệu cho form thêm đơn tay — đơn đã có trong kế hoạch + bảng màu thương hiệu
  psBrandOpts(){ const s=this.psBrands().slice();
    Object.keys((this.PS().brands)||{}).forEach(b=>{ if(s.indexOf(b)<0) s.push(b); }); return s; }
  psAllOrders(){ const out=[]; (this.PS().groups||[]).forEach(g=>(g.rows||[]).forEach(r=>(r.orders||[]).forEach(o=>out.push(o)))); return out; }
  // Chỉ gợi ý thương hiệu / mã hàng có thật trong Kế hoạch sản xuất — tuần đang chọn trước, rồi toàn bộ kế hoạch
  psBrands(){ const s=[]; const add=o=>{ const b=this.brandOf(o); if(b&&b!=='OTHER'&&s.indexOf(b)<0) s.push(b); };
    this.psActiveOrders().forEach(add); this.psAllOrders().forEach(add); return s; }
  psStyles(brand){ const s=[]; const add=o=>{ const c=this.psCode(o.code); if(c&&(!brand||this.brandOf(o)===brand)&&s.indexOf(c)<0) s.push(c); };
    this.psActiveOrders().forEach(add); this.psAllOrders().forEach(add); return s; }
  psOrderAt(g,r,i){ const gg=(this.PS().groups||[])[g]; if(!gg) return null;
    const rr=(gg.rows||[])[r]; if(!rr) return null;
    return (rr.orders||[])[i]||null; }
  psPick(g,r,i){ const o=this.psOrderAt(g,r,i); const patch={gsel:{g,r,i},qrOpen:null};
    if(o&&o.planId) patch.khcPlan=o.planId;
    this._psScroll=true; this.setState(patch);
    setTimeout(()=>this.psScrollToCut(),140); setTimeout(()=>this.psScrollToCut(),420); }
  psScrollToCut(){ const gb=document.querySelector('[data-screen-label="Production Plan"]'); if(!gb) return;
    const sc=gb.classList.contains('yscroll')?gb:gb.closest('.yscroll'); const el=gb.lastElementChild; if(!sc||!el) return;
    const top=el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-14;
    sc.scrollTop=top; }
  componentDidUpdate(){ this.queuePersist();
    if(this._psScroll&&this.state.page==='gantt'&&this.state.gsel){ this._psScroll=false;
      requestAnimationFrame(()=>requestAnimationFrame(()=>this.psScrollToCut())); } }
  psGoToday(){ const el=document.querySelector('[data-ps-track]'), t=this.psToday();
    if(el&&t!=null) el.scrollLeft=Math.max(0,t*this.psDayW()-260); }

  renderGanttBody(){
    const h=React.createElement;
    return h('div',{ref:this.scrollRef,className:'yscroll','data-screen-label':'Production Plan',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('psTitle','S-00-PRODSCHED-GANTT · UI Proto'), this.renderPsKpis(), this.renderPsChart(), this.renderPsCut());
  }

  renderPsKpis(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace"; const T=this.psTotals(), M=this.psMonths(), MN=this.psMonName();
    const span=M.length?(MN[M[0].m]+' '+M[0].y+' → '+MN[M[M.length-1].m]+' '+M[M.length-1].y):'—';
    const card=(l,v,i)=>h('div',{key:l,style:{display:'flex',alignItems:'baseline',gap:8,padding:'0 14px',borderLeft:i?'1px solid '+C.line:'none',whiteSpace:'nowrap',flex:'none'}},
      h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},l),
      h('div',{style:{fontSize:16.5,fontWeight:700,fontFamily:mono,color:C.ink,letterSpacing:'-.3px'}},v));
    return h('div',{className:'yscroll',style:{display:'flex',alignItems:'center',flexWrap:'nowrap',overflowX:'auto',border:'1px solid '+C.border,borderRadius:14,background:C.white,padding:'13px 2px',boxShadow:C.shadow,marginBottom:18}},
      card(this.t('psK1'),T.n,0), card(this.t('psK2'),this.fmtn(T.pcs),1),
      card(this.t('psK3'),T.ln,2), card(this.t('psK4'),span,3));
  }

  renderPsChart(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const PS=this.PS(), dw=this.psDayW(), T=PS.days, W=Math.round(T*dw), LW=196, rowH=this.dense?36:42;
    const months=this.psMonths(), MN=this.psMonName(), today=this.psToday();
    const sel=this.state.gsel||{}, open=this.state.gopen||{};
    this._ghRef=this._ghRef||React.createRef();
    const wknd='repeating-linear-gradient(90deg,rgba(32,38,47,.05) 0 '+(2*dw)+'px,transparent '+(2*dw)+'px '+(7*dw)+'px)';
    const mlines=()=>months.map((m,i)=>[
      i?h('div',{key:'ml'+m.off,style:{position:'absolute',left:Math.round(m.off*dw),top:0,bottom:0,width:1,background:'#cfd6c6'}}):null,
      i%2?h('div',{key:'mb'+m.off,style:{position:'absolute',left:Math.round(m.off*dw),width:Math.round(m.len*dw),top:0,bottom:0,background:'rgba(74,122,11,.035)',pointerEvents:'none'}}):null]);
    const tline=(strong)=>today==null?null:h('div',{key:'td',style:{position:'absolute',left:Math.round(today*dw),top:0,bottom:0,width:strong?2:1.5,background:'#cf5a4e',opacity:strong?.9:.5}});
    const lcell=(content,extra)=>h('div',{style:Object.assign({width:LW,flex:'none',position:'sticky',left:0,zIndex:2,background:C.white,borderRight:'1px solid '+C.border,padding:'0 12px',display:'flex',alignItems:'center'},extra||{})},content);
    const years=(()=>{ const out=[]; months.forEach(m=>{ const l=out[out.length-1];
      if(l&&l.y===m.y) l.len+=m.len; else out.push({y:m.y,off:m.off,len:m.len}); }); return out; })();
    const weeks=(()=>{ const out=[]; for(let i=0;i<T;i++){ const d=this.psD(i); if(d.getDay()!==1) continue;
      out.push(h('div',{key:'wk'+i,style:{position:'absolute',left:Math.round(i*dw),top:40,bottom:0,width:1,background:'#eef0e9'}}));
      const nearToday=today!=null&&Math.abs((i-today)*dw)<44;
      if(dw>=5.4&&!nearToday) out.push(h('div',{key:'wl'+i,style:{position:'absolute',left:Math.round(i*dw)+3,top:42,fontSize:10,fontFamily:mono,color:C.faint,whiteSpace:'nowrap'}},d.getDate()));
    } return out; })();
    const head=h('div',{style:{display:'flex',borderBottom:'2px solid '+C.border,background:C.white}},
      lcell(h('span',{style:{fontSize:11.5,fontWeight:700,letterSpacing:'.6px',color:C.faint}},this.t('psLine')),{height:60}),
      h('div',{style:{width:W,flex:'none',position:'relative',height:60}},
        years.map((y,i)=>h('div',{key:'yh'+y.off,style:{position:'absolute',left:Math.round(y.off*dw),top:0,width:Math.round(y.len*dw),height:18,borderLeft:i?'1px solid #cfd6c6':'none',
          background:'#f6f9f0',borderBottom:'1px solid '+C.line,display:'flex',alignItems:'center',justifyContent:'flex-start',padding:'0 9px',overflow:'hidden'}},
          h('span',{style:{fontSize:11,fontWeight:700,letterSpacing:'1px',color:C.sub,fontFamily:mono,whiteSpace:'nowrap'}},y.len*dw>34?String(y.y):''))),
        months.map((m,i)=>h('div',{key:'mh'+m.off,style:{position:'absolute',left:Math.round(m.off*dw),top:18,width:Math.round(m.len*dw),height:21,borderLeft:i?'1px solid #cfd6c6':'none',
          background:i%2?'#f2f7e8':'#fbfdf6',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}},
          h('span',{style:{fontSize:12,fontWeight:700,letterSpacing:'.2px',color:C.dark,whiteSpace:'nowrap'}},m.len*dw>26?MN[m.m]:''))),
        weeks, tline(true),
        today==null?null:h('div',{style:{position:'absolute',left:Math.round(today*dw)+4,top:42,fontSize:10,fontWeight:700,letterSpacing:'.4px',color:'#b0432f',background:'rgba(255,255,255,.92)',borderRadius:4,padding:'1px 5px',fontFamily:mono,whiteSpace:'nowrap',zIndex:3}},this.t('psToday'))));
    const body=[];
    (PS.groups||[]).forEach((g,gi)=>{
      const exp=open[g.fac]!==false;
      // LUÔN hiện mọi chuyền, kể cả chuyền trống — nếu lọc bỏ thì thêm đơn cho Line 1 xong
      // là Line 2 mất luôn nút "+", không còn chỗ nhập.
      const rows=(g.rows||[]);
      const gItems=rows.map((r,i)=>this.psRowItems(gi,i,r).filter(it=>!it.del));
      const cnt=gItems.reduce((a,x)=>a+x.length,0), pcs=gItems.reduce((a,x)=>a+x.reduce((b,it)=>b+this.psQty(it.o),0),0);
      body.push(h('div',{key:'g'+gi,onClick:()=>this.set({gopen:Object.assign({},open,{[g.fac]:!exp})}),
        style:{display:'flex',borderBottom:'1px solid '+C.border,background:'#f6f9f0',cursor:'pointer'}},
        lcell(h('div',{style:{display:'flex',alignItems:'center',gap:7,minWidth:0}},
          h('svg',{width:12,height:12,viewBox:'0 0 24 24',fill:'none',stroke:C.sub,strokeWidth:3,style:{flex:'none',transform:exp?'none':'rotate(-90deg)',transition:'transform .15s'}},h('path',{d:'M6 9l6 6 6-6'})),
          h('span',{style:{fontSize:13,fontWeight:700,color:C.dark,letterSpacing:'.2px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},g.fac)),{background:'#f6f9f0',height:44}),
        h('div',{style:{width:W,flex:'none',height:44,display:'flex',alignItems:'center',gap:10,padding:'0 14px',minWidth:0,overflow:'hidden'}},
          h('span',{style:{flex:'none',fontSize:11,fontWeight:700,letterSpacing:'.4px',color:g.kind==='in'?C.primary:'#8a6d1f',background:g.kind==='in'?C.tint:'#fdf6e8',border:'1px solid '+(g.kind==='in'?'#dbe7cb':'#f0e3c8'),borderRadius:6,padding:'4px 9px',whiteSpace:'nowrap'}},g.kind==='in'?this.t('psIn'):this.t('psSub')),
          h('span',{style:{flex:'none',fontSize:12.5,fontFamily:mono,color:C.sub,whiteSpace:'nowrap'}},cnt+' '+this.t('psOrdU')+' · '+this.fmtn(pcs)+' pcs'),
          h('span',{style:{flex:1,fontSize:12,color:C.faint,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},g.note||''),
          h('button',{title:this.t('psAddLineTip'),onClick:ev=>{ ev.stopPropagation(); this.psAddLine(gi); },
            style:{flex:'none',border:'1px solid '+C.primary,background:C.white,color:C.dark,cursor:'pointer',borderRadius:8,
              padding:'5px 11px',fontSize:11.5,fontWeight:700,fontFamily:'inherit',letterSpacing:'.2px',display:'flex',alignItems:'center',gap:5},
            'style-hover':{background:C.tint}},
            h('svg',{width:12,height:12,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:3,strokeLinecap:'round'},h('path',{d:'M12 5v14M5 12h14'})),
            this.t('psAddLine')))));
      if(!exp) return;
      const lm=this.psLaneMap(gi,g,rows);
      rows.forEach((r,ri)=>{ const realRi=(g.rows||[]).indexOf(r);
        const items=this.psLiveItems(gi,realRi,r);
        const LI=lm[ri]||{lanes:1,place:{}}, RH=rowH*Math.max(1,LI.lanes);
        const laneTop=k=>k*rowH;
        const lastEnd=items.reduce((a,it)=>{ const gm=this.psGeom(it.o); return Math.max(a,gm.s+gm.n); },0);
        body.push(h('div',{key:'g'+gi+'r'+ri,style:{display:'flex',borderBottom:'1px solid '+C.line}},
          lcell(h('div',{style:{display:'flex',alignItems:'center',gap:8,width:'100%',minWidth:0}},
            h('div',{style:{display:'flex',flexDirection:'column',gap:2,flex:1,minWidth:0}},
              h('span',{style:{fontSize:14.5,fontWeight:700,fontFamily:mono,color:C.primary,whiteSpace:'nowrap'}},r.line),
              LI.lanes>1?h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.4px',color:C.faint,whiteSpace:'nowrap'}},LI.lanes+' '+this.t('psLanes')):null),
            items.length?null:h('button',{title:this.t('psDelLineTip'),onClick:ev=>{ ev.stopPropagation(); this.psDelLine(gi,realRi); },
              style:{flex:'none',width:20,height:20,border:'1px solid '+C.border,background:C.white,color:C.faint,borderRadius:6,cursor:'pointer',
                padding:0,display:'flex',alignItems:'center',justifyContent:'center'},'style-hover':{borderColor:'#e0b4ad',color:'#c0392b'}},
              h('svg',{width:11,height:11,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2.6},h('path',{d:'M18 6 6 18M6 6l12 12'})))),
            {height:RH,alignItems:'center',transition:'height .3s cubic-bezier(.34,.69,.1,1)'}),
          h('div',{style:{width:W,flex:'none',position:'relative',height:RH,backgroundImage:wknd,transition:'height .3s cubic-bezier(.34,.69,.1,1)'}}, mlines(), tline(false),
            items.map(it=>{ const o=it.o, pl=!!o.planId;
              const gm=this.psGeom(o);
              const w=Math.max(6,Math.round(gm.n*dw)-2);
              const lane=Math.max(0,LI.place[it.key]||0), ltop=laneTop(lane)+4;
              const on=sel.g===gi&&sel.r===realRi&&sel.i===it.i;
              const bh=rowH-12;
              const brand=this.brandOf(o);
              // Chữ to hết mức mà vẫn đủ tên — còn chỗ trống mới hiện ngày
              const avail=w-(w<28?2:12);
              const bMax=Math.max(11,Math.min(Math.round(bh*0.62),18));
              const bSz=Math.max(9,Math.min(bMax,Math.floor(avail/Math.max(1,String(brand||'').length*0.62))));
              const bW=Math.ceil(String(brand||'').length*bSz*0.62);
              const showD=!!(o.start&&o.end)&&(avail-bW)>=84;
              const tip=[o.txt||this.psLabel(o),o.combine?('⤿ '+o.combine):'',it.ov?this.t('cfFrom'):''].filter(Boolean).join('\n');
              const ring=on?('0 0 0 2px '+C.primary+', 0 4px 12px rgba(24,36,14,.2)'):'0 1px 2px rgba(24,36,14,.05)';
              return h('div',{key:it.key,className:'ps-bar',title:tip,onClick:()=>this.psPick(gi,realRi,it.i),
                style:{position:'absolute',boxSizing:'border-box',left:Math.round(gm.s*dw),width:w,top:ltop,height:bh,borderRadius:6,cursor:'pointer',overflow:'hidden',
                  zIndex:on?6:1,
                  background:o.color||'#e9ebe4',border:'1px solid '+(on?C.dark:'rgba(32,38,47,.14)'),
                  borderBottom:pl?'3px solid '+C.primary:('1px solid '+(on?C.dark:'rgba(32,38,47,.14)')),
                  boxShadow:ring,display:'flex',alignItems:'center',gap:w<28?1:5,
                  padding:w<28?'0 1px':'0 6px',
                  transition:'top .3s cubic-bezier(.34,.69,.1,1), height .3s cubic-bezier(.34,.69,.1,1), box-shadow .2s cubic-bezier(.34,.69,.1,1)'}},
                (it.ov&&w>44)?h('span',{style:{flex:'none',fontSize:9,fontWeight:700,letterSpacing:'.3px',color:'#8a6d1f',background:'#fdf3d6',border:'1px solid #efdfb0',borderRadius:4,padding:'1px 4px'}},'FILE'):null,
                (o.combine&&w>56)?h('span',{style:{flex:'none',fontSize:9.5,fontWeight:700,letterSpacing:'.3px',color:'#8a6d1f',background:'#fdf3d6',border:'1px solid #efdfb0',borderRadius:4,padding:'1px 5px'}},this.t('psCombine')):null,
                (w>40&&brand)?h('span',{style:{fontSize:bSz,fontWeight:700,letterSpacing:'.2px',color:'#22282f',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',lineHeight:1.05}},brand):null,
                showD?h('span',{style:{marginLeft:'auto',flex:'none',fontSize:10,fontFamily:mono,fontWeight:600,color:'rgba(24,30,38,.62)',whiteSpace:'nowrap'}},this.psShortD(o.start)+' → '+this.psShortD(o.end)):null); }),
            h('button',{key:'add',className:'ps-fab',title:this.t('psAddTip'),onClick:()=>this.psOpenAdd(gi,realRi),
              style:{position:'absolute',left:Math.min(Math.round(lastEnd*dw)+9,W-36),top:Math.round((rowH-28)/2),zIndex:2,width:28,height:28,borderRadius:'50%',border:'2px solid '+C.white,
                background:C.primary,color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,fontFamily:'inherit',
                boxShadow:'0 2px 8px rgba(38,71,15,.36)'}},
              h('svg',{width:15,height:15,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:3.2,strokeLinecap:'round'},h('path',{d:'M12 5v14M5 12h14'}))))));
      });
    });
    const zbtn=(i,lb)=>{ const a=(this.state.gz==null?1:this.state.gz)===i;
      return h('button',{key:i,onClick:()=>this.set({gz:i}),style:{border:'none',cursor:'pointer',padding:'6px 13px',fontSize:12,fontWeight:600,fontFamily:'inherit',color:a?C.dark:C.sub,background:a?'#fff':'transparent',borderRadius:8,boxShadow:a?'0 1px 3px rgba(24,36,14,.14)':'none'}},lb); };
    const toolbar=h('div',{style:{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',padding:'11px 16px',borderBottom:'1px solid '+C.border,background:'#fcfdfa'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:10,flex:'none'}},
        h('div',{style:{display:'inline-flex',gap:3,background:'#e7eadf',padding:3,borderRadius:10}},zbtn(0,this.t('psZa')),zbtn(1,this.t('psZb')),zbtn(2,this.t('psZc'))),
        h('button',{className:'ps-ghost',onClick:()=>this.psGoToday(),style:{cursor:'pointer',border:'1px solid '+C.border,background:C.white,color:C.ink,borderRadius:9,padding:'7px 13px',fontSize:12,fontWeight:600,fontFamily:'inherit',whiteSpace:'nowrap',transition:'border-color .18s,color .18s,background .18s'}},this.t('psGoToday'))),
      h('div',{style:{flex:1,minWidth:0}}),
      h('label',{className:'ps-ghost',title:this.t('psUpPlan'),style:{display:'inline-flex',alignItems:'center',gap:7,cursor:'pointer',border:'1px solid '+C.border,background:C.white,color:C.ink,borderRadius:9,padding:'7px 13px',fontSize:12,fontWeight:600,whiteSpace:'nowrap',flex:'none',transition:'border-color .18s,color .18s,background .18s'}},
        this.ic('up'),this.t('psUpPlan'),
        h('input',{type:'file',accept:'.xlsx,.csv',multiple:true,style:{display:'none'},onChange:e=>this.uploadPlan(e.target.files)})),
      h('button',{className:'ps-ghost',title:this.t('resetTip'),onClick:()=>this.resetSaved(),style:{display:'inline-flex',alignItems:'center',gap:6,cursor:'pointer',border:'1px solid '+C.border,background:C.white,color:C.sub,borderRadius:9,padding:'7px 11px',fontSize:12,fontWeight:600,fontFamily:'inherit',whiteSpace:'nowrap',flex:'none',transition:'border-color .18s,color .18s,background .18s'}},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M3 12a9 9 0 1 0 3-6.7'}),h('path',{d:'M3 4v5h5'})),this.t('resetSaved')),
      (this.state.psTrash||[]).length?h('button',{title:this.t('psUndoTip'),onClick:()=>this.set({psTrashOpen:!this.state.psTrashOpen}),
        style:{display:'inline-flex',alignItems:'center',gap:7,cursor:'pointer',border:'1px solid #eccfca',background:'#fdf3f1',color:'#b0432f',borderRadius:9,padding:'7px 12px',fontSize:12,fontWeight:700,whiteSpace:'nowrap',flex:'none',fontFamily:'inherit'}},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14'})),
        this.t('psTrash')+' '+this.state.psTrash.length):null);
    const trash=(this.state.psTrashOpen&&(this.state.psTrash||[]).length)?h('div',{style:{display:'flex',flexDirection:'column',gap:7,padding:'12px 16px',borderBottom:'1px solid '+C.border,background:'#fdf9f8'}},
      (this.state.psTrash||[]).slice().reverse().map(x=>h('div',{key:x.key,style:{display:'flex',alignItems:'center',gap:12}},
        h('span',{style:{flex:1,minWidth:0,fontSize:12,fontFamily:mono,color:C.sub,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},x.label),
        h('button',{onClick:()=>this.psRestore(x.key),style:{cursor:'pointer',border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:8,padding:'5px 11px',fontSize:11.5,fontWeight:700,fontFamily:'inherit',flex:'none'},'style-hover':{borderColor:C.primary}},this.t('psUndo'))))):null;
    return h('div',{style:{border:'1px solid '+C.border,borderRadius:16,background:C.white,overflow:'hidden',boxShadow:C.shadow}},
      toolbar, trash,
      h('div',{'data-ps-track':'1',className:'yscroll',style:{overflowX:'auto',overflowY:'hidden'}},
        h('div',{style:{minWidth:LW+W}},head,body)));
  }

  renderPsAdd(){
    const f=this.state.psAdd; if(!f) return null;
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const g=(this.PS().groups||[])[f.g]||{}, row=((g.rows||[])[f.r])||{};
    const fld=(label,key,type,ph,list)=>h('div',{key:key,style:{display:'flex',flexDirection:'column',gap:6,flex:'1 1 190px',minWidth:0}},
      h('div',{style:{fontSize:10,fontWeight:700,letterSpacing:'.5px',color:C.faint}},label),
      h('input',{type:type||'text',value:f[key]||'',placeholder:ph||'',list:list||undefined,onChange:e=>this.setPsAdd({[key]:e.target.value}),
        style:{border:'1px solid '+C.border,borderRadius:9,padding:'10px 12px',fontSize:13.5,fontFamily:mono,fontWeight:600,color:C.ink,background:C.white,minWidth:0,width:'100%',boxSizing:'border-box'}}));
    const manual=f.mode==='manual';
    const modeBtn=(id,label)=>{ const a=(f.mode||'file')===id;
      return h('button',{key:id,onClick:()=>this.setPsAdd({mode:id}),style:{border:'none',cursor:'pointer',padding:'7px 15px',fontSize:12,fontWeight:600,fontFamily:'inherit',color:a?C.dark:C.sub,background:a?'#fff':'transparent',borderRadius:8,boxShadow:a?'0 1px 3px rgba(24,36,14,.14)':'none'}},label); };
    const canSave=!!String(f.code||'').trim()&&(!manual||this.manTotal(f)>0);
    return h('div',{onClick:()=>this.set({psAdd:null}),style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:60,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),style:{width:manual?'min(960px,96vw)':'min(640px,94vw)',maxHeight:'92vh',background:C.white,borderRadius:16,boxShadow:'0 30px 70px rgba(0,0,0,.32)',overflow:'hidden',display:'flex',flexDirection:'column'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:13,padding:'17px 22px',borderBottom:'1px solid '+C.line}},
          h('div',{style:{width:38,height:38,borderRadius:10,background:C.tint,color:C.primary,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},
            h('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M12 5v14M5 12h14'}))),
          h('div',{style:{flex:1,minWidth:0}},
            h('div',{style:{fontSize:17,fontWeight:700}},this.t('psAddTitle')),
            h('div',{style:{fontSize:12.5,color:C.faint,marginTop:2}},(g.fac||'')+' · '+(row.line||''))),
          h('button',{onClick:()=>this.set({psAdd:null}),style:{border:'1px solid '+C.border,background:C.white,cursor:'pointer',color:C.sub,padding:8,borderRadius:9,display:'flex'}},
            h('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M18 6 6 18M6 6l12 12'})))),
        h('div',{className:'yscroll',style:{padding:'18px 22px 20px',display:'flex',flexDirection:'column',gap:14,overflowY:'auto'}},
          h('div',{style:{display:'flex',gap:12,flexWrap:'wrap'}},fld(this.t('psFStyle'),'code','text','VW5159-M2'),fld(this.t('psFPo'),'po','text','10848')),
          h('div',{style:{display:'flex',gap:12,flexWrap:'wrap'}},fld(this.t('psFBrand'),'brand','text','VUORI','dl-psbrand'),
            h('datalist',{id:'dl-psbrand'},this.psBrandOpts().map(n=>h('option',{key:n,value:n})))),
          h('div',{style:{display:'flex',gap:12,flexWrap:'wrap'}},manual?null:fld(this.t('psFQty'),'qty','text','3200'),fld(this.t('psFStart'),'start','date'),fld(this.t('psFEnd'),'end','date')),
          h('div',{style:{display:'inline-flex',gap:3,background:'#e7eadf',padding:3,borderRadius:10,alignSelf:'flex-start'}},modeBtn('file',this.t('psModeFile')),modeBtn('manual',this.t('psModeMan'))),
          manual?this.renderManForm(f):h('div',{style:{display:'flex',flexDirection:'column',gap:6}},
            h('div',{style:{fontSize:10,fontWeight:700,letterSpacing:'.5px',color:C.faint}},this.t('psFFile')),
            h('label',{style:{display:'flex',alignItems:'center',gap:9,cursor:'pointer',border:'1.5px dashed '+C.border,borderRadius:10,padding:'12px 14px',background:'#fbfcf8',fontSize:12.5,fontWeight:600,color:f.file?C.dark:C.sub},'style-hover':{borderColor:C.primary}},
              this.ic('up'),f.file||this.t('psPick'),
              h('input',{type:'file',accept:'.xlsx,.csv',style:{display:'none'},onChange:e=>{ const x=e.target.files&&e.target.files[0]; if(x) this.setPsAdd({file:x.name}); }})))),
        h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'14px 22px',borderTop:'1px solid '+C.line,background:'#f8faf3'}},
          h('div',{style:{flex:1}}),
          h('button',{onClick:()=>this.set({psAdd:null}),style:this.btn('ghost')},this.t('psCancel')),
          h('button',{onClick:()=>this.savePsAdd(),disabled:!canSave,style:{...this.btn('primary'),opacity:canSave?1:.5,cursor:canSave?'pointer':'not-allowed'}},this.t('psSave')))));
  }

  renderManForm(f){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const sizes=f.msz||[], tbs=f.mtb||[];
    const sgc='minmax(80px,1fr) 70px repeat('+Math.max(1,sizes.length)+',minmax(44px,1fr)) 88px 30px';
    const hd={fontSize:9.5,fontWeight:700,letterSpacing:'.4px',color:C.faint,textAlign:'center',whiteSpace:'nowrap',overflow:'hidden'};
    const ci={width:'100%',border:'1px solid '+C.border,borderRadius:7,padding:'6px 3px',fontSize:12,fontFamily:mono,fontWeight:600,color:C.ink,background:C.white,textAlign:'center',minWidth:0,boxSizing:'border-box'};
    const by=this.manBySize(f), tot=this.manTotal(f);
    const rowPcs=t=>sizes.reduce((a,n)=>a+(Number(t.r[n])||0),0)*(Number(t.ly)||0);
    return h('div',{style:{display:'flex',flexDirection:'column',gap:11}},
      h('div',{style:{display:'flex',flexDirection:'column',gap:7}},
        h('div',{style:{fontSize:10,fontWeight:700,letterSpacing:'.5px',color:C.faint}},this.t('psManSz')),
        h('div',{style:{display:'flex',flexWrap:'wrap',gap:6}},
          this.SORDER.map(n=>{ const on=sizes.indexOf(n)>=0;
            return h('button',{key:n,onClick:()=>this.toggleManSz(n),
              style:{cursor:'pointer',fontFamily:mono,fontSize:12,fontWeight:700,letterSpacing:'.3px',borderRadius:8,padding:'6px 12px',minWidth:46,
                border:on?'1.5px solid '+C.primary:'1px solid '+C.border,background:on?C.tint:C.white,color:on?C.dark:C.sub},
              'style-hover':on?{}:{borderColor:C.primary,color:C.dark}},n); }))),
      h('div',{style:{border:'1px solid '+C.border,borderRadius:12,overflow:'hidden'}},
        h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:6,padding:'8px 12px',background:'#f8faf3',borderBottom:'1px solid '+C.line,alignItems:'end'}},
          h('div',{style:{...hd,textAlign:'left'}},this.t('kcTb')),h('div',{style:hd},this.t('kcLy')),
          sizes.map(n=>h('div',{key:n,style:{...hd,fontFamily:mono,fontSize:10.5,color:C.sub}},n)),
          h('div',{style:{...hd,textAlign:'right'}},this.t('kcPcs')),h('div',null,'')),
        tbs.map((t,i)=>{ const cp=this.manCp(t);
          return h('div',{key:i,style:{borderBottom:'1px solid '+C.line}},
          h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:6,padding:'7px 12px 5px',alignItems:'center'}},
            h('input',{value:t.tb||'',onChange:e=>this.setManTb(i,{tb:e.target.value}),style:{...ci,textAlign:'left',fontWeight:700}}),
            h('input',{type:'number',min:0,value:t.ly||'',onChange:e=>this.setManTb(i,{ly:Math.max(0,parseInt(e.target.value,10)||0)}),style:ci}),
            sizes.map(n=>h('input',{key:n,type:'number',min:0,value:t.r[n]||'',placeholder:'·',onChange:e=>this.setManR(i,n,e.target.value),style:ci})),
            h('div',{style:{textAlign:'right',fontSize:13,fontFamily:mono,fontWeight:700,color:rowPcs(t)?C.dark:'#c3c8bf'}},this.fmtn(rowPcs(t))),
            h('button',{title:this.t('psManDel'),onClick:()=>this.delManTb(i),style:{border:'none',background:'none',cursor:'pointer',color:'#c0392b',display:'flex',padding:2,justifySelf:'center'}},
              h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14'})))),
          h('div',{style:{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',padding:'0 12px 9px 12px'}},
            h('span',{style:{fontSize:9,fontWeight:700,letterSpacing:'.4px',color:C.faint,flex:'none'}},this.t('psManCp')),
            cp.map((p,j)=>h('div',{key:j,style:{display:'flex',alignItems:'center',gap:4,border:'1px solid '+(String(p.c||'').trim()?C.border:'#e9c9c2'),background:String(p.c||'').trim()?C.tint2:'#fdf6f4',borderRadius:8,padding:'3px 4px 3px 7px'}},
              h('span',{style:{width:8,height:8,borderRadius:'50%',flex:'none',background:String(p.c||'').trim()?C.primary:'#e0b3a8'}}),
              h('input',{list:'mancol-'+i,value:p.c||'',placeholder:this.t('psManColorPh'),onChange:e=>this.setManCp(i,j,{c:e.target.value}),
                style:{width:104,border:'none',outline:'none',background:'none',fontSize:11.5,fontFamily:'inherit',fontWeight:600,color:C.ink,minWidth:0}}),
              h('span',{style:{fontSize:10,color:'#c6cbc0'}},'/'),
              h('input',{value:p.po||'',placeholder:this.t('psManPoPh'),onChange:e=>this.setManCp(i,j,{po:e.target.value}),
                style:{width:62,border:'none',outline:'none',background:'none',fontSize:11.5,fontFamily:mono,fontWeight:600,color:C.sub,minWidth:0}}),
              cp.length>1?h('button',{title:this.t('psManDelCp'),onClick:()=>this.delManCp(i,j),style:{border:'none',background:'none',cursor:'pointer',color:C.faint,display:'flex',padding:2}},
                h('svg',{width:11,height:11,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2.4},h('path',{d:'M18 6 6 18M6 6l12 12'}))):null)),
            h('datalist',{id:'mancol-'+i},this.cutColors(f.code||'').map(c=>h('option',{key:c,value:c}))),
            cp.length<2?h('button',{onClick:()=>this.addManCp(i),style:{cursor:'pointer',border:'1px dashed '+C.border,background:C.white,color:C.primary,borderRadius:8,padding:'4px 9px',fontSize:10.5,fontWeight:700,fontFamily:'inherit'},'style-hover':{borderColor:C.primary,background:C.tint}},this.t('psManAddCp')):null)); }),
        h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:6,padding:'9px 12px',background:C.dark,alignItems:'center'}},
          h('div',{style:{fontSize:10,fontWeight:700,letterSpacing:'.5px',color:'#dcefad'}},this.t('psManTot')),
          h('div',{style:{textAlign:'center',fontSize:12,fontFamily:mono,fontWeight:700,color:'#e6efdb'}},this.fmtn(tbs.reduce((a,t)=>a+(Number(t.ly)||0),0))),
          sizes.map(n=>h('div',{key:n,style:{textAlign:'center',fontSize:12,fontFamily:mono,fontWeight:700,color:'#fff'}},this.fmtn(by[n]||0))),
          h('div',{style:{textAlign:'right',fontSize:14,fontFamily:mono,fontWeight:700,color:'#fff'}},this.fmtn(tot)),
          h('div',null,''))),
      h('div',{style:{fontSize:11,color:C.faint,lineHeight:1.45}},this.t('psManCpHint')),
      h('button',{onClick:()=>this.addManTb(),style:{alignSelf:'flex-start',cursor:'pointer',border:'1.5px dashed '+C.border,background:C.white,color:C.primary,borderRadius:9,padding:'8px 14px',fontSize:12,fontWeight:700,fontFamily:'inherit'},'style-hover':{borderColor:C.primary,background:C.tint}},this.t('psManAdd')));
  }

  renderManPlan(o){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const m=o.man||{}, sizes=m.sizes||[], tbs=m.tables||[];
    const sgc='96px 76px repeat('+Math.max(1,sizes.length)+',minmax(54px,1fr)) 100px 56px';
    const by={}; tbs.forEach(t=>sizes.forEach(n=>{ const r=Number(t.r[n])||0; if(r) by[n]=(by[n]||0)+r*(Number(t.ly)||0); }));
    const tot=sizes.reduce((a,n)=>a+(by[n]||0),0);
    const totLy=tbs.reduce((a,t)=>a+(Number(t.ly)||0),0);
    const totTag=tbs.reduce((a,t)=>a+sizes.reduce((b,n)=>b+(Number(t.r[n])||0),0),0);
    const hc={fontSize:10,fontWeight:700,letterSpacing:'.6px',color:C.faint};
    return h('div',{style:{border:'1px solid '+C.border,borderRadius:14,overflow:'hidden',background:C.white}},
      h('div',{style:{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',padding:'12px 20px',borderBottom:'1px solid '+C.line,background:'#f8faf3'}},
        h('span',{style:{fontSize:11,fontWeight:700,letterSpacing:'.5px',color:'#fff',background:C.dark,borderRadius:8,padding:'5px 12px',whiteSpace:'nowrap'}},this.t('psManTitle')),
        h('span',{style:{fontSize:12,fontFamily:mono,color:C.sub}},tbs.length+' '+this.t('cpTurnU')),
        h('span',{style:{marginLeft:'auto',fontSize:19,fontWeight:700,fontFamily:mono,color:C.dark}},this.fmtn(tot),h('span',{style:{fontSize:10.5,color:C.faint,marginLeft:4,fontWeight:600}},'pcs'))),
      h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:8,padding:'9px 20px',borderBottom:'1px solid '+C.line,alignItems:'end'}},
        h('div',{style:hc},this.t('kcTb')),h('div',{style:hc},this.t('kcLy')),
        sizes.map(n=>h('div',{key:n,style:{textAlign:'center',fontFamily:mono,fontSize:11,fontWeight:700,color:C.sub}},n)),
        h('div',{style:{...hc,textAlign:'right'}},this.t('kcPcs')),h('div',{style:{...hc,textAlign:'right'}},this.t('kcTagN'))),
      tbs.map((t,i)=>h('div',{key:i,style:{display:'grid',gridTemplateColumns:sgc,gap:8,padding:'10px 20px',borderBottom:'1px solid '+C.line,alignItems:'center'}},
        h('div',null,
          h('div',{style:{fontSize:15,fontWeight:700,fontFamily:mono,color:C.dark}},t.tb),
          ((t.cp||[]).length?h('div',{style:{display:'flex',flexDirection:'column',gap:2,marginTop:3}},
            (t.cp||[]).map((p,j)=>h('div',{key:j,style:{display:'flex',alignItems:'baseline',gap:5,minWidth:0}},
              h('span',{style:{fontSize:10.5,fontWeight:700,color:C.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},p.c||'—'),
              p.po?h('span',{style:{fontSize:9.5,fontFamily:mono,color:C.faint,flex:'none'}},'PO '+p.po):null))):null)),
        h('div',{style:{fontSize:14,fontFamily:mono,fontWeight:600,color:C.ink}},this.fmtn(t.ly)),
        sizes.map(n=>{ const r=Number(t.r[n])||0;
          return h('div',{key:n,style:{textAlign:'center',fontSize:13,fontFamily:mono,fontWeight:r?700:400,color:r?C.ink:'#d4d8cd'}},r?this.fmtn(r*(Number(t.ly)||0)):'·'); }),
        h('div',{style:{textAlign:'right',fontSize:14.5,fontWeight:700,fontFamily:mono,color:C.dark}},this.fmtn(sizes.reduce((a,n)=>a+(Number(t.r[n])||0),0)*(Number(t.ly)||0))),
        h('div',{style:{textAlign:'right',fontSize:13,fontWeight:700,fontFamily:mono,color:C.primary}},sizes.reduce((a,n)=>a+(Number(t.r[n])||0),0)))),
      h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:8,padding:'10px 20px',background:C.dark,alignItems:'center'}},
        h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:'#dcefad'}},this.t('kcSumCut')),
        h('div',{style:{fontSize:12.5,fontFamily:mono,fontWeight:700,color:'#e6efdb'}},this.fmtn(totLy)),
        sizes.map(n=>h('div',{key:n,style:{textAlign:'center',fontSize:13,fontFamily:mono,fontWeight:700,color:'#fff'}},this.fmtn(by[n]||0))),
        h('div',{style:{textAlign:'right',fontSize:14.5,fontFamily:mono,fontWeight:700,color:'#fff'}},this.fmtn(tot)),
        h('div',{style:{textAlign:'right',fontSize:13,fontFamily:mono,fontWeight:700,color:'#dcefad'}},totTag)));
  }

  // Tải kế hoạch sản xuất: file trùng đơn đang chạy thì hỏi giữ bản nào
  uploadPlan(list){ const arr=Array.from(list||[]); if(!arr.length) return; this.addFilesHere(list);
    const items=this.planConflicts(arr[0].name);
    if(items.length) this.setState({conf:{file:arr[0].name,items,pick:items.map(()=>'inc')},gsel:null,psTrashOpen:false}); }
  planConflicts(file){
    const hash=s=>{ let n=7; s=String(s); for(let i=0;i<s.length;i++) n=(n*31+s.charCodeAt(i))%99991; return n; };
    const base=hash(file), t=this.psToday(), b=t==null?0:t;
    const w0=this.psD(b-3), w1=this.psD(b+30), out=[];
    (this.PS().groups||[]).forEach((g,gi)=>(g.rows||[]).forEach((r,ri)=>(r.orders||[]).forEach((o,oi)=>{
      if(out.length>=4) return; const key=gi+'|'+ri+'|'+oi;
      if(o.src) return;                                  // đơn đã nhận số từ file trước đó
      const s=this.pd(o.start), e=this.pd(o.end); if(!(s<=w1&&e>=w0)) return;
      const cq=this.psQty(o); if(cq<=0) return;
      const k=(hash(key+'|'+o.code)+base)%97, up=k%2===0, step=(k%4)+1;
      const nq=Math.max(60,Math.round(cq*(1+(up?1:-1)*((k%7)+2)/100)/5)*5);
      let ne=new Date(e.getFullYear(),e.getMonth(),e.getDate()+(up?step:-step));
      if(ne<s) ne=new Date(e.getFullYear(),e.getMonth(),e.getDate()+step);
      const nes=this.psFmtD(ne);
      if(nq===cq&&nes===o.end) return;
      out.push({key,line:this.normName(r.line),fac:g.fac,code:o.code,po:o.po,cur:{qty:cq,start:o.start,end:o.end},inc:{qty:nq,start:o.start,end:nes}});
    })));
    return out; }
  applyConflict(){ const f=this.state.conf; if(!f) return;
    this.psSet(ps=>{ (f.items||[]).forEach((it,i)=>{ if((f.pick||[])[i]!=='inc') return;
      const p=String(it.key).split('|');
      const o=(((((ps.groups||[])[+p[0]]||{}).rows||[])[+p[1]]||{}).orders||[])[+p[2]];
      if(o){ o.qty=it.inc.qty; o.start=it.inc.start; o.end=it.inc.end; o.src=f.file; } }); });
    this.setState({conf:null}); }
  renderConflict(){
    const f=this.state.conf; if(!f) return null;
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const items=f.items||[], pick=f.pick||[];
    const setPick=(i,v)=>this.setState(s=>{ const c={...(s.conf||{})}; const p=[...(c.pick||[])]; p[i]=v; c.pick=p; return {conf:c}; });
    const allPick=v=>this.setState(s=>({conf:{...(s.conf||{}),pick:((s.conf||{}).items||[]).map(()=>v)}}));
    const opt=(it,i,kind)=>{ const on=pick[i]===kind, d=kind==='cur'?it.cur:it.inc, dq=it.inc.qty-it.cur.qty, dd=it.inc.end!==it.cur.end;
      return h('button',{key:kind,onClick:()=>setPick(i,kind),
        style:{flex:'1 1 190px',minWidth:0,textAlign:'left',cursor:'pointer',fontFamily:'inherit',borderRadius:11,padding:'10px 13px',
          border:on?'2px solid '+C.primary:'1px solid '+C.border,background:on?C.tint2:C.white},
        'style-hover':on?{}:{borderColor:C.primary}},
        h('div',{style:{display:'flex',alignItems:'center',gap:7,marginBottom:6}},
          h('span',{style:{width:12,height:12,borderRadius:'50%',flex:'none',border:on?'4px solid '+C.primary:'1.5px solid #cdd2c8',background:C.white,boxSizing:'border-box'}}),
          h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:on?C.dark:C.faint}},kind==='cur'?this.t('cfCur'):this.t('cfNew'))),
        h('div',{style:{fontSize:14.5,fontWeight:700,fontFamily:mono,color:C.ink}},this.fmtn(d.qty)+' pcs',
          (kind==='inc'&&dq)?h('span',{style:{fontSize:10.5,fontWeight:700,marginLeft:7,color:dq>0?'#5d8f12':'#c0392b'}},(dq>0?'+':'−')+this.fmtn(Math.abs(dq))):null),
        h('div',{style:{fontSize:11,fontFamily:mono,marginTop:4,color:(kind==='inc'&&dd)?'#b0432f':C.sub}},d.start+' → '+d.end)); };
    return h('div',{onClick:()=>this.set({conf:null}),style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:70,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),style:{width:'min(760px,96vw)',maxHeight:'90vh',background:C.white,borderRadius:16,boxShadow:'0 30px 70px rgba(0,0,0,.32)',overflow:'hidden',display:'flex',flexDirection:'column'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:13,padding:'17px 22px',borderBottom:'1px solid '+C.line}},
          h('div',{style:{width:38,height:38,borderRadius:10,background:'#fdf3d6',color:'#8a6d1f',display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},
            h('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'}))),
          h('div',{style:{flex:1,minWidth:0}},
            h('div',{style:{fontSize:17,fontWeight:700}},this.t('cfTitle')),
            h('div',{style:{fontSize:12.5,color:C.faint,marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},items.length+' '+this.t('cfSub')+' · '+f.file)),
          h('button',{onClick:()=>this.set({conf:null}),style:{border:'1px solid '+C.border,background:C.white,cursor:'pointer',color:C.sub,padding:8,borderRadius:9,display:'flex',flex:'none'}},
            h('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M18 6 6 18M6 6l12 12'})))),
        h('div',{style:{display:'flex',gap:9,padding:'11px 22px',borderBottom:'1px solid '+C.line,background:C.offBg,flexWrap:'wrap'}},
          h('button',{onClick:()=>allPick('cur'),style:this.btn('ghost')},this.t('cfKeepAll')),
          h('button',{onClick:()=>allPick('inc'),style:this.btn('ghost')},this.t('cfTakeAll'))),
        h('div',{className:'yscroll',style:{overflowY:'auto',padding:'4px 22px 12px'}},
          items.map((it,i)=>h('div',{key:it.key,style:{padding:'13px 0',borderBottom:i<items.length-1?'1px solid '+C.line:'none'}},
            h('div',{style:{display:'flex',alignItems:'baseline',gap:9,marginBottom:9,flexWrap:'wrap'}},
              h('span',{style:{fontSize:13,fontWeight:700,fontFamily:mono,color:C.primary}},it.line),
              h('span',{style:{fontSize:12.5,fontFamily:mono,color:C.ink,wordBreak:'break-all'}},it.code+(it.po?' · PO '+it.po:'')),
              h('span',{style:{fontSize:11,color:C.faint}},it.fac)),
            h('div',{style:{display:'flex',gap:10,flexWrap:'wrap'}},opt(it,i,'cur'),opt(it,i,'inc'))))),
        h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'14px 22px',borderTop:'1px solid '+C.line,background:'#f8faf3'}},
          h('div',{style:{flex:1,fontSize:11.5,color:C.faint}},pick.filter(x=>x==='inc').length+' / '+items.length+' '+this.t('cfNew').toLowerCase()),
          h('button',{onClick:()=>this.set({conf:null}),style:this.btn('ghost')},this.t('psCancel')),
          h('button',{onClick:()=>this.applyConflict(),style:this.btn('primary')},this.t('cfApply')))));
  }

  renderPsCut(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    this._psRef=this._psRef||React.createRef();
    const s=this.psSel();
    if(!s) return null;
    const o=s.o, q=this.psQty(o), pl=this.psPlan(o);
    const chip=(l,v)=>h('div',{key:l,style:{display:'flex',flexDirection:'column',gap:3,minWidth:0}},
      h('span',{style:{fontSize:9,fontWeight:700,letterSpacing:'.5px',color:'#dcefad'}},l),
      h('span',{style:{fontSize:12.5,fontWeight:700,fontFamily:mono,color:'#fff',whiteSpace:'nowrap'}},v));
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:24,flexWrap:'wrap',padding:'14px 20px',background:C.dark}},
      h('div',{style:{minWidth:0}},
        h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.7px',color:'#dcefad'}},this.t('psMaster')),
        h('div',{style:{fontSize:16,fontWeight:700,color:'#fff',fontFamily:mono,marginTop:3,whiteSpace:'nowrap'}},this.psCode(o.code)+(o.po?' · PO '+o.po:''))),
      chip(this.t('psLine'),s.g.fac+' · '+s.r.line),
      q?chip(this.t('psQty'),this.fmtn(q)+' pcs'):null,
      o.cut?chip(this.t('psCutD'),o.cut):null,
      o.ex?chip(this.t('psEx'),o.ex):null,
      h('div',{style:{flex:1,minWidth:8}}),
      h('button',{onClick:()=>this.psDelOrder(),title:this.t('psUndoTip'),style:{cursor:'pointer',border:'1px solid #c0392b',background:'#c0392b',color:'#fff',fontWeight:700,fontSize:11.5,letterSpacing:'.5px',borderRadius:9,padding:'9px 14px',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:7},'style-hover':{background:'#a5301f',borderColor:'#a5301f'}},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14'})),this.t('psDelOrd')),
      h('button',{onClick:()=>this.set({gsel:null,qrOpen:null}),style:{cursor:'pointer',border:'1px solid rgba(255,255,255,.35)',background:'transparent',color:'#fff',fontWeight:700,fontSize:11.5,letterSpacing:'.5px',borderRadius:9,padding:'9px 16px',fontFamily:'inherit'},'style-hover':{background:'rgba(255,255,255,.12)'}},this.t('psClose')));
    const mats=this.psMats(o);
    const dInput=(field,val)=>h('input',{type:'date',value:val||'',onChange:e=>this.psSetDate(field,e.target.value),
      style:{border:'1px solid '+C.border,borderRadius:8,padding:'6px 8px',fontSize:12,fontFamily:mono,fontWeight:700,color:C.ink,background:C.white}});
    const block=(label,child,grow)=>h('div',{key:label,style:{display:'flex',flexDirection:'column',gap:5,minWidth:0,flex:grow?'1 1 220px':'none'}},
      h('span',{style:{fontSize:9,fontWeight:700,letterSpacing:'.5px',color:C.faint}},label), child);
    const master=h('div',{style:{display:'flex',alignItems:'flex-start',gap:26,flexWrap:'wrap',padding:'13px 20px',background:'#fbfcf8',borderBottom:'1px solid '+C.border}},
      block(this.t('psOrderL'),h('div',{style:{display:'flex',alignItems:'baseline',gap:8,minWidth:0}},
        h('span',{style:{fontSize:13.5,fontWeight:700,fontFamily:mono,color:C.ink,whiteSpace:'nowrap'}},this.psCode(o.code)),
        o.po?h('span',{style:{fontSize:11,fontFamily:mono,color:C.faint,whiteSpace:'nowrap'}},'PO '+o.po):null)),
      block(this.t('psRatioL'),h('span',{style:{fontSize:12.5,fontWeight:700,fontFamily:mono,color:C.dark,whiteSpace:'nowrap'}},this.psRatio(o))),
      block(this.t('psStartL')+' → '+this.t('psEndL'),h('div',null,
        h('div',{style:{display:'flex',alignItems:'center',gap:7}},dInput('start',o.start),h('span',{style:{color:C.faint,fontSize:12}},'→'),dInput('end',o.end)),
        h('div',{style:{fontSize:9.5,color:C.faint,marginTop:4}},this.t('psDateHint')))),
      block(this.t('psMatL'),mats.length?h('div',{style:{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}},
        mats.slice(0,4).map(m=>h('span',{key:m,style:{fontSize:11,fontWeight:700,fontFamily:mono,color:C.dark,background:C.tint,border:'1px solid #dbe7cb',borderRadius:6,padding:'3px 8px',whiteSpace:'nowrap'}},m)),
        mats.length>4?h('span',{style:{fontSize:10.5,fontWeight:700,color:C.faint}},'+'+(mats.length-4)):null)
        :h('span',{style:{fontSize:12,color:C.faint}},'—'),true));
    const inner=pl?h('div',{style:{padding:'20px 20px 4px'}},this.renderKhcBody(true))
      :o.man?h('div',{style:{padding:'20px'}},this.renderManPlan(o))
      :h('div',{style:{padding:'20px'}},
        h('div',{style:{fontSize:12.5,color:C.sub,marginBottom:14,maxWidth:720,lineHeight:1.55}},this.t('psNoPlan')),
        o.combine?h('div',{style:{fontSize:12,fontWeight:600,color:'#8a6d1f',background:'#fdf6e8',border:'1px solid #f0e3c8',borderRadius:10,padding:'9px 13px',marginBottom:14,display:'inline-block'}},'⤿ '+o.combine):null,
        h('div',{style:{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:16}},
          h('label',{style:{display:'inline-flex',alignItems:'center',gap:8,cursor:'pointer',background:C.primary,color:'#fff',borderRadius:10,padding:'11px 18px',fontSize:13,fontWeight:700,whiteSpace:'nowrap'},'style-hover':{background:C.dark}},
            this.ic('up'),this.t('psUpload'),
            h('input',{type:'file',accept:'.xlsx,.csv',multiple:true,style:{display:'none'},onChange:e=>this.addFilesHere(e.target.files)})),
          this.state.files.length?h('span',{style:{fontSize:11.5,color:C.faint,fontFamily:mono}},this.state.files.length+' file'):null),
        h('div',{style:{border:'1px solid '+C.border,borderRadius:12,background:'#fbfcf8',padding:'13px 16px'}},
          h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,marginBottom:6}},this.t('psRaw')),
          h('div',{style:{fontSize:12.5,fontFamily:mono,color:C.ink,lineHeight:1.6,wordBreak:'break-word'}},o.txt||this.psLabel(o))));
    return h('div',{'data-ps-cut':'1',style:{marginTop:20,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',background:C.white,boxShadow:C.shadow}},head,master,inner);
  }

  kcPlans(){ this.ensureSeed(); return (window.KHC&&window.KHC.plans)||[]; }
  kcPlan(){ const ps=this.kcPlans(); return ps.find(p=>p.id===this.state.khcPlan)||ps[0]; }
  kcNote(t){ return t.sz.map(([n,r])=>r>1?n+'/'+r:n).join('+'); }
  kcTagList(t){ const o=[]; t.sz.forEach(([n,r])=>{ for(let i=1;i<=r;i++) o.push(n+i); }); return o; }
  kcPcs(t){ return t.sz.reduce((a,[,r])=>a+r,0)*t.ly; }
  kcStat(p){ let pcs=0,tb=0,tg=0,atb=0; p.sections.forEach(s=>{ if(s.grp==='aux'){ atb+=s.tables.length; return; } pcs+=s.total; tb+=s.tables.length; s.tables.forEach(t=>tg+=t.sz.reduce((a,[,r])=>a+r,0)); }); return {pcs,tb,tg,atb}; }
  PIECES=[['front','THÂN TRƯỚC','FRONT BODY'],['back','THÂN SAU','BACK BODY'],['sleeve','TAY','SLEEVE'],['legL','CHÂN TRÁI','LEFT LEG'],['legR','CHÂN PHẢI','RIGHT LEG'],
    ['collar','CỔ','COLLAR'],['pocket','TÚI','POCKET'],['lining','LÓT','LINING'],['mex','MEX','FUSING'],['wad','BÔNG','WADDING'],['band','DỰNG VIỀN','BINDING']];
  // Vị trí cắt của lượt: vải phụ lấy theo nhóm trong tác nghiệp cắt, vải chính mặc định thân trước
  piecesFor(){ return this.PIECES.map(p=>({id:p[0],vi:p[1],en:p[2]})); }
  pieceLabel(id){ const p=this.PIECES.find(x=>x[0]===id); if(!p) return String(id||''); return this.state.lang==='vi'?p[1]:p[2]; }
  defaultPiece(sec){ const tag=String((sec&&sec.qrTag)||'').toUpperCase();
    if(tag.indexOf('LOT')===0) return 'lining';
    if(tag.indexOf('MEX')===0) return 'mex';
    if(tag.charAt(0)==='B') return 'wad';
    if(tag.indexOf('DV')===0) return 'band';
    if(tag.indexOf('FOI')===0) return 'lining';
    return 'front'; }
  qrAscii(s){ return String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[^\x20-\x7E]/g,'').toUpperCase(); }
  QR_MAX=180;
  // Tem QR quét ra đúng các trường in bên cạnh nó — text có nhãn, mỗi trường 1 dòng
  qrPayload(f){ const A=x=>this.qrAscii(x);
    const rows=[['PIECE',A(f.piece)],['STYLE',A(f.style)],['PO#',A(f.po)],['TURN',A(f.tb)],
      ['COLOR',A(f.color)],['SIZE',A(f.size)],['LAYERS',f.ly==null?'':String(f.ly)]].filter(r=>r[1]!=='');
    const join=()=>rows.map(r=>r[0]+': '+r[1]).join('\n');
    // quá sức chứa thì rút ngắn dần giá trị dài nhất — không bỏ mất trường nào
    while(join().length>this.QR_MAX){
      let k=0; rows.forEach((r,i)=>{ if(r[1].length>rows[k][1].length) k=i; });
      const v=rows[k][1].replace(/\.\.$/,'');
      if(v.length<=8) break;
      rows[k][1]=v.slice(0,v.length-6).replace(/[\s\/,-]+$/,'')+'..';
    }
    return join(); }
  openQr(s,t){ const P=this.kcPlan(); const sec=P&&P.sections[s];
    this.set({qrOpen:{s,t,piece:this.defaultPiece(sec)}}); document.body.classList.add('kc-qr-open'); }
  setQrPiece(id){ this.setState(st=>({qrOpen:{...(st.qrOpen||{}),piece:id}})); }
  closeQr(){ this.set({qrOpen:null}); document.body.classList.remove('kc-qr-open'); }
  componentDidMount(){ this._mounted=true; this._esc=e=>{ if(e.key==='Escape'&&this.state.qrOpen) this.closeQr();
      if(e.key==='Escape'&&this.state.whOpen) this.set({whOpen:null,whErr:''});
      if(e.key==='Escape'&&this.state.psAdd) this.set({psAdd:null});
      if(e.key==='Escape'&&this.state.conf) this.set({conf:null});
      if(e.key==='Escape'&&this.state.dsoTap) this.dsoTapClose();
      if(e.key==='Escape'&&this.state.mlvFs) this.set({mlvFs:false});
      if(e.key==='Escape'&&this.state.bslip) this.bSlipClose();
      if(e.key==='Escape'&&this.state.dsoHandBulk) this.set({dsoHandBulk:null});
      if(e.key==='Escape'&&this.state.dsoHandAsk) this.dsoSlipClose();
      if(e.key==='Escape'&&this.state.fsScanAt) this.fsScanClose();
      if((e.ctrlKey||e.metaKey)&&(e.key==='z'||e.key==='Z')&&(this.state.psTrash||[]).length){ e.preventDefault(); this.psUndo(); } };
    document.addEventListener('keydown',this._esc);
    // May moi (localStorage rong) da duoc nap localStorage o seedStorage();
    // blob trong IndexedDB la bat dong bo nen nap o day.
    if(window.MES_SEED_FIRST&&window.MES_SEED) this.snapPutIdb(window.MES_SEED,true).catch(()=>{});
    this.awaitData();
    setTimeout(()=>this.psGoToday(),160); }
  // Bản HTML rời nạp data/psched.js & data/khc.js không đồng bộ — chờ có dữ liệu rồi vẽ lại
  awaitData(){ this.ensureSeed(); this.reconcileWeeks(); this.fgEnsure(); this.ftEnsure(); let n=0;
    this._dataT=setInterval(()=>{ n++;
      const ready=window.PSCHED&&window.KHC&&window.KHC.__seed&&window.PSCHED.__seed;
      if(window.PSCHED&&window.KHC) this.ensureSeed();
      if(ready){ clearInterval(this._dataT); this._dataT=null; this.reconcileWeeks(); this.fgEnsure(); this.ftEnsure(); this.psGoToday(); }
      else if(n>240){ clearInterval(this._dataT); this._dataT=null; } },50); }
  componentWillUnmount(){ clearTimeout(this._pt); clearTimeout(this._tblT); clearTimeout(this._snT); clearTimeout(this._fgT); clearInterval(this._dataT); this.mlvClockOff(); this.mlvFsOff(); this.persist(); if(this._esc) document.removeEventListener('keydown',this._esc); document.body.classList.remove('kc-qr-open'); document.body.classList.remove('bg-slip-open'); }

  renderKhcBody(hidePicker){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const plans=this.kcPlans(), P=this.kcPlan();
    if(!P) return h('div',{style:{padding:40,color:C.faint,fontSize:14}},'Chưa có dữ liệu tác nghiệp cắt');
    const st=this.kcStat(P);
    const picker=h('div',{style:{display:'flex',flexWrap:'wrap',gap:12,marginBottom:20}},
      plans.filter(p=>!p.gen||p.id===P.id).map(p=>{ const a=p.id===P.id; const s2=this.kcStat(p);
        return h('button',{key:p.id,onClick:()=>this.set({khcPlan:p.id,qrOpen:null}),
          style:{textAlign:'left',cursor:'pointer',fontFamily:'inherit',border:a?'2px solid '+C.primary:'1px solid '+C.border,background:a?C.tint2:'#fff',borderRadius:14,padding:a?'13px 17px':'14px 18px',minWidth:225,boxShadow:a?'0 3px 10px rgba(46,82,20,.14)':'0 1px 3px rgba(24,36,14,.05)'},
          'style-hover':a?{}:{borderColor:C.primary}},
          h('div',{style:{fontSize:14.5,fontWeight:700,color:a?C.dark:C.ink}},p.label),
          h('div',{style:{fontSize:11,fontFamily:mono,color:C.faint,marginTop:4}},p.buyer)); }));
    const pill=(label,val)=>h('div',{key:label,style:{border:'1px solid '+C.border,borderRadius:11,padding:'9px 16px',background:C.white}},
      h('div',{style:{fontSize:10,fontWeight:700,letterSpacing:'.5px',color:C.faint}},label),
      h('div',{style:{fontSize:16,fontWeight:700,color:C.ink,fontFamily:mono,marginTop:3,whiteSpace:'nowrap'}},val));
    const meta=h('div',{style:{display:'flex',flexWrap:'wrap',gap:10,alignItems:'stretch',marginBottom:22}},
      pill(this.t('kcBuyer'),P.buyer), pill(this.t('kcStyleL'),P.style), pill('PO',String(P.po).replace('PO ','')),
      pill(this.t('kcTotal'),this.fmtn(st.pcs)), pill(this.t('kcTables'),st.tb), pill(this.t('kcTags'),st.tg),
      st.atb?pill(this.t('kcAuxN'),st.atb+' '+this.t('cpTurnU')):null,
      pill(this.t('kcSrcL'),P.gen?this.t('kcSrcGen'):this.t('kcSrcFile')));
    const sumRows=P.sections.filter(s=>s.grp!=='aux').map(s=>({fab:s.fab,po:(s.qrPo||P.qrPo||'').replace('PO ',''),style:P.style,qty:s.total,tb:s.tables.length}));
    const sumTot=sumRows.reduce((a,r)=>({qty:a.qty+r.qty,tb:a.tb+r.tb}),{qty:0,tb:0});
    const sgc2='minmax(150px,1.4fr) 110px 92px';
    const sumCell=(v,al,b)=>h('div',{style:{fontSize:12.5,fontFamily:b?mono:'inherit',fontWeight:b?700:500,color:b?C.ink:C.sub,textAlign:al||'left',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},v);
    const summary=h('div',{style:{border:'1px solid '+C.border,borderRadius:14,background:C.white,overflow:'hidden',marginBottom:20,boxShadow:'0 1px 3px rgba(24,36,14,.05)'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'11px 18px',borderBottom:'1px solid '+C.line,background:'#f6faee'}},
        h('span',{style:{fontSize:11,fontWeight:700,letterSpacing:'.6px',color:C.dark}},this.t('psSum')),
        h('span',{style:{fontSize:11,color:C.faint}},sumRows.length+' '+this.t('psSumC').toLowerCase())),
      h('div',{style:{display:'grid',gridTemplateColumns:sgc2,gap:10,padding:'9px 18px',borderBottom:'1px solid '+C.line,fontSize:10,fontWeight:700,letterSpacing:'.5px',color:C.faint}},
        h('div',null,this.t('psSumC')),
        h('div',{style:{textAlign:'right'}},this.t('psSumQ')),h('div',{style:{textAlign:'right'}},this.t('psSumT'))),
      sumRows.map((r,i)=>h('div',{key:r.fab+i,style:{display:'grid',gridTemplateColumns:sgc2,gap:10,padding:'9px 18px',borderBottom:'1px solid '+C.line,alignItems:'center'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:8,minWidth:0}},
          h('span',{style:{width:9,height:9,borderRadius:3,flex:'none',background:C.leaf||C.primary,opacity:1-(i%4)*0.18}}),
          sumCell(r.fab,'left',true)),
        sumCell(this.fmtn(r.qty),'right',true),sumCell(r.tb,'right',true))),
      h('div',{style:{display:'grid',gridTemplateColumns:sgc2,gap:10,padding:'10px 18px',background:'#f6faee',alignItems:'center'}},
        h('div',{style:{fontSize:11,fontWeight:700,letterSpacing:'.4px',color:C.sub}},this.t('psSumTot')),
        sumCell(this.fmtn(sumTot.qty),'right',true),sumCell(sumTot.tb,'right',true)));
    const gcols='110px 96px minmax(300px,1fr) 118px 64px 96px';
    const secCard=(s,si)=>{
      const hd=h('div',{style:{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',padding:'13px 20px',borderBottom:'1px solid '+C.line,background:'#f8faf3'}},
        h('span',{style:{fontSize:13,fontWeight:700,letterSpacing:'.5px',color:'#fff',background:C.dark,borderRadius:8,padding:'6px 14px',fontFamily:mono,whiteSpace:'nowrap'}},s.fab),
        s.sheet?h('span',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.4px',color:'#9a6b15',background:'#fdf6e8',border:'1px solid #f0e3c8',borderRadius:7,padding:'4px 9px',whiteSpace:'nowrap'}},s.sheet):null,
        h('div',{style:{flex:1,minWidth:0}}),
        h('span',{style:{marginLeft:'auto',fontSize:20,fontWeight:700,fontFamily:mono,letterSpacing:'-.3px',color:C.dark,whiteSpace:'nowrap'}},this.fmtn(s.total),h('span',{style:{fontSize:10.5,color:C.faint,marginLeft:4,fontWeight:600}},'pcs')));
      const sizes=s.demand.map(([n])=>n);
      const sgc='96px 76px repeat('+sizes.length+',minmax(54px,1fr)) 100px 56px 88px';
      const cols=h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:8,padding:'9px 20px',borderBottom:'1px solid '+C.line,fontSize:10,fontWeight:700,letterSpacing:'.6px',color:C.faint,alignItems:'end'}},
        h('div',null,this.t('kcTb')),h('div',null,this.t('kcLy')),
        sizes.map(n=>h('div',{key:n,style:{textAlign:'center',fontFamily:mono,fontSize:11,color:C.sub}},n)),
        h('div',{style:{textAlign:'right'}},this.t('kcPcs')),h('div',{style:{textAlign:'right'}},this.t('kcTagN')),h('div',null,''));
      const rows=s.tables.map((t2,ti)=>{ const bySz={}; t2.sz.forEach(([n,r])=>bySz[n]=r);
        return h('div',{key:t2.tb,onClick:()=>this.openQr(si,ti),
        style:{display:'grid',gridTemplateColumns:sgc,gap:8,alignItems:'center',padding:'10px 20px',borderBottom:ti<s.tables.length-1?'1px solid '+C.line:'none',cursor:'pointer',transition:'background .1s'},
        'style-hover':{background:C.tint2}},
        h('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:3}},
          h('span',{style:{fontSize:15.5,fontWeight:700,fontFamily:mono,color:C.dark}},t2.tb),
          t2.gb?h('span',{title:this.t('kcGb'),style:{fontSize:8.5,fontWeight:700,letterSpacing:'.3px',color:'#9a6b15',background:'#fdf6e8',border:'1px solid #f0e3c8',borderRadius:5,padding:'2px 6px',whiteSpace:'nowrap'}},this.t('kcGbS')):null),
        h('div',{style:{fontSize:14,fontFamily:mono,fontWeight:600,color:C.ink}},t2.ly),
        sizes.map(n=>{ const r=bySz[n];
          return h('div',{key:n,style:{textAlign:'center',fontSize:13,fontFamily:mono,fontWeight:r?700:400,color:r?C.ink:'#d4d8cd'}},r?this.fmtn(r*t2.ly):'·'); }),
        h('div',{style:{textAlign:'right',fontSize:14.5,fontWeight:700,fontFamily:mono,color:C.dark}},this.fmtn(this.kcPcs(t2))),
        h('div',{style:{textAlign:'right',fontSize:13,fontWeight:700,fontFamily:mono,color:C.primary}},t2.sz.reduce((a,[,r])=>a+r,0)),
        h('button',{onClick:e=>{e.stopPropagation();this.openQr(si,ti);},
          style:{cursor:'pointer',border:'1.5px solid '+C.primary,color:C.primary,background:'#fff',borderRadius:9,padding:'7px 0',fontSize:11,fontWeight:700,letterSpacing:'.5px',fontFamily:'inherit',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:5},
          'style-hover':{background:C.tint}},
          h('svg',{width:12,height:12,viewBox:'0 0 24 24',fill:'currentColor'},h('path',{d:'M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v3h-3v-3zm-5 0h3v3h-3v-3zm5 5h3v3h-3v-3zm-5 0h3v3h-3v-3z'})),
          'QR')); });
      const cutBy={}; s.tables.forEach(t2=>t2.sz.forEach(([n,r])=>cutBy[n]=(cutBy[n]||0)+r*t2.ly));
      const demBy={}; s.demand.forEach(([n,q])=>demBy[n]=q);
      const totLy=s.tables.reduce((a,t2)=>a+t2.ly,0), totPcs=s.tables.reduce((a,t2)=>a+this.kcPcs(t2),0);
      const totTag=s.tables.reduce((a,t2)=>a+t2.sz.reduce((b,[,r])=>b+r,0),0);
      const totDem=s.demand.reduce((a,[,q])=>a+q,0);
      // Tổng nằm cuối bảng, thẳng cột size cho dễ soát
      const sumRow=h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:8,padding:'10px 20px',alignItems:'center',background:C.dark,borderTop:'1px solid '+C.line}},
        h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:'#dcefad',whiteSpace:'nowrap'}},this.t('kcSumCut')),
        h('div',{style:{fontSize:12.5,fontFamily:mono,fontWeight:700,color:'#e6efdb'}},this.fmtn(totLy)),
        sizes.map(n=>h('div',{key:n,style:{textAlign:'center',fontSize:13,fontFamily:mono,fontWeight:700,color:'#fff'}},this.fmtn(cutBy[n]||0))),
        h('div',{style:{textAlign:'right',fontSize:14.5,fontFamily:mono,fontWeight:700,color:'#fff'}},this.fmtn(totPcs)),
        h('div',{style:{textAlign:'right',fontSize:13,fontFamily:mono,fontWeight:700,color:'#dcefad'}},totTag),
        h('div',null,''));
      const demRow=h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:8,padding:'8px 20px',alignItems:'center',background:'#f8faf3'}},
        h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,whiteSpace:'nowrap'}},this.t('kcNeedRow')),
        h('div',null,''),
        sizes.map(n=>{ const d=(cutBy[n]||0)-(demBy[n]||0);
          return h('div',{key:n,style:{textAlign:'center',lineHeight:1.2}},
            h('div',{style:{fontSize:12.5,fontFamily:mono,fontWeight:600,color:C.sub}},this.fmtn(demBy[n]||0)),
            h('div',{style:{fontSize:9.5,fontFamily:mono,fontWeight:700,color:d<0?'#c0392b':(d>0?'#8a6d1f':'#5d8f12')}},d>0?'+'+this.fmtn(d):(d<0?'−'+this.fmtn(-d):'✓'))); }),
        h('div',{style:{textAlign:'right',fontSize:12.5,fontFamily:mono,fontWeight:600,color:C.sub}},this.fmtn(totDem)),
        h('div',null,''),h('div',null,''));
      return h('div',{key:si,style:{border:'1px solid '+C.border,borderRadius:16,background:'#fff',overflow:'hidden',marginBottom:18,boxShadow:'0 1px 4px rgba(24,36,14,.06)'}},hd,cols,rows,sumRow,s.demand.length?demRow:null);
    };
    const mains=[], auxs=[];
    P.sections.forEach((s,si)=>{ (s.grp==='aux'?auxs:mains).push(secCard(s,si)); });
    const auxHead=auxs.length?h('div',{style:{display:'flex',alignItems:'center',gap:12,margin:'28px 0 16px'}},
      h('span',{style:{fontSize:12.5,fontWeight:700,letterSpacing:'.8px',color:C.sub}},this.t('kcAux')),
      h('span',{style:{flex:1,height:1,background:C.border}})):null;
    return h('div',{'data-screen-label':'Cutting Plan',style:{maxWidth:1280}},hidePicker?null:picker,meta,summary,mains,auxHead,auxs);
  }

  renderQrModal(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const q=this.state.qrOpen; if(!q||this.state.page!=='gantt'||!this.state.gsel) return null;
    const P=this.kcPlan(); if(!P) return null;
    const s=P.sections[q.s], t2=s&&s.tables[q.t]; if(!t2) return null;
    const tags=this.kcTagList(t2), codeTb=t2.tb.replace('+','T'), poC=s.qrPo||P.qrPo;
    const sub=(s.sheet?s.sheet+' · ':'')+s.fab+' · PO '+poC+' · '+t2.ly+' '+this.t('kcLop')+' · '+tags.length+' '+this.t('kcTem')+' · '+this.kcNote(t2);
    const field=(label,val,ex)=>h('div',{key:label,style:{display:'flex',alignItems:'baseline',gap:8,minHeight:17}},
      h('span',{style:{width:84,flex:'none',fontSize:10.5,fontFamily:mono,color:C.faint}},label),
      val===null?h('span',{style:{flex:1,borderBottom:'1px dashed #c3c8bf',height:12}}):h('span',{style:Object.assign({fontSize:11.5,fontFamily:mono,fontWeight:600,color:C.ink,whiteSpace:'nowrap'},ex||{})},val));
    const piece=this.pieceLabel(q.piece||this.defaultPiece(s));
    const cards=tags.map(sz=>{
      const code=this.qrPayload({style:P.style,po:poC,tb:t2.tb,size:sz,ly:t2.ly,piece:piece,color:s.fab});
      let src=null; try{ src=window.QRSvgUrl?window.QRSvgUrl(code,'#2b3d10'):null; }catch(e){}
      return h('div',{key:sz,'data-qr-card':'',style:{background:'#fff',border:'1px solid #dfe3d8',borderRadius:10,padding:14,display:'flex',gap:13}},
        h('div',{style:{width:150,flex:'none'}},
          src?h('img',{src,alt:code,style:{width:150,height:150,display:'block'}}):h('div',{style:{width:150,height:150,background:'#f2f4ee'}}),
          h('div',{style:{fontSize:7.5,fontFamily:mono,color:C.sub,textAlign:'left',marginTop:5,wordBreak:'break-all',lineHeight:1.45}},code)),
        h('div',{style:{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:3,paddingTop:2}},
          field('Piece:',piece,{fontWeight:700,color:C.dark,whiteSpace:'normal'}),field('Style:',P.style),field('PO#:',poC),field('Turn:',t2.tb,{color:C.primary,fontWeight:700}),
          field('Color:',s.fab),field('Size:',sz,{fontWeight:700,fontSize:12.5}),field('Fabric Lot:',null),field('Fabric Roll:',null),
          field('Layers:',this.fmtn(t2.ly))));});
    return h('div',{'data-qr-overlay':'',onClick:e=>{if(e.target===e.currentTarget)this.closeQr();},
      style:{position:'fixed',inset:0,zIndex:420,background:'rgba(24,36,14,.55)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'28px 20px',overflowY:'auto'}},
      h('div',{'data-qr-panel':'',style:{width:'min(1150px,100%)',background:'#eef0ea',borderRadius:14,overflow:'hidden',boxShadow:'0 18px 60px rgba(20,30,10,.35)'}},
        h('div',{'data-noprint':'',style:{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',padding:'15px 20px',background:C.dark}},
          h('div',{style:{minWidth:0}},
            h('div',{style:{fontSize:15,fontWeight:700,letterSpacing:'.8px',color:'#fff',fontFamily:mono}},this.t('kcModal')+' '+t2.tb),
            h('div',{style:{fontSize:10.5,fontFamily:mono,color:'#dcefad',marginTop:4,letterSpacing:'.4px'}},sub)),
          h('div',{'data-noprint':'',style:{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',maxWidth:430}},
            h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:'#dcefad',width:'100%'}},this.t('kcPiece')),
            this.piecesFor().map(p=>{ const on=(q.piece||this.defaultPiece(s))===p.id;
              return h('button',{key:p.id,onClick:()=>this.setQrPiece(p.id),
                style:{cursor:'pointer',fontFamily:'inherit',fontSize:10.5,fontWeight:700,letterSpacing:'.2px',borderRadius:7,padding:'4px 9px',whiteSpace:'nowrap',
                  border:'1px solid '+(on?C.leaf:'rgba(255,255,255,.28)'),background:on?C.leaf:'transparent',color:on?'#22300c':'#e6efdb'}},
                this.state.lang==='vi'?p.vi:p.en); })),
          h('div',{style:{marginLeft:'auto',display:'flex',gap:8}},
            h('button',{onClick:()=>window.print(),style:{cursor:'pointer',border:'none',background:C.primary,color:'#fff',fontWeight:700,fontSize:11.5,letterSpacing:'.6px',borderRadius:9,padding:'10px 18px',fontFamily:'inherit'},'style-hover':{background:'#5d8f12'}},this.t('kcPrint')),
            h('button',{onClick:()=>this.closeQr(),style:{cursor:'pointer',border:'1px solid rgba(255,255,255,.35)',background:'transparent',color:'#fff',fontWeight:700,fontSize:11.5,letterSpacing:'.6px',borderRadius:9,padding:'10px 18px',fontFamily:'inherit'},'style-hover':{background:'rgba(255,255,255,.1)'}},this.t('kcClose')))),
        h('div',{'data-printonly':'',style:{padding:'0 0 12px',fontSize:12,fontWeight:700,fontFamily:mono,color:'#111'}},this.t('kcModal')+' '+t2.tb+' — '+P.style+' · '+sub),
        h('div',{'data-qr-grid':'',style:{padding:18,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))',gap:13,maxHeight:'calc(100vh - 175px)',overflowY:'auto'}},cards)));
  }

  // ==========================================================================
  // HOÀN THIỆN (FINISHING)
  // --------------------------------------------------------------------------
  // Đầu vào duy nhất: tờ phiếu bàn giao BG-… phát hành ở MAY · Sản lượng may
  // hàng ngày (state.dsoSlips). Hoàn thiện XÁC NHẬN NHẬN từng tờ phiếu; số lượng
  // đã nhận chảy tiếp qua 4 công đoạn rồi lên Kế hoạch xuất hàng thành phẩm.
  //
  //   Finishing In     -> nhận phiếu bàn giao   (state.finRecv)
  //   Finishing Status -> Ủi → Kiểm cuối → Đóng gói → Nhập kho TP (state.finStage)
  //   F.G Shipment     -> lô xuất theo mã hàng · PO (state.fgRows)
  //
  // Không có bảng dữ liệu riêng: mọi con số đều dẫn ngược được về phiếu bàn giao.
  // ==========================================================================
  FIN_STAGES=[['iron','fsIron'],['qc','fsQc'],['pack','fsPack'],['fg','fsFg']];
  // PO cua 1 don, doc DUY NHAT o day: uu tien PO ghi tren tac nghiep cat roi moi
  // den PO cua don. dsoSizeCards (phia may) va fgSeed (ke hoach xuat) cung goi
  // ham nay -> khoa (ma hang | PO) cua 2 ben luon khop, cot SAN SANG chay dung.
  orderPo(o,pl){ if(pl===undefined) pl=this.psPlan(o);
    return String((pl&&pl.po)||(o&&o.po)||'').replace(/^PO\s*/i,'').trim()||'\u2014'; }

  // Dải KPI dùng chung cho cả 3 màn Hoàn thiện — cùng ngôn ngữ với Dashboard
  finKpis(cards){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    return h('div',{style:{display:'grid',gridTemplateColumns:'repeat('+cards.length+',minmax(0,1fr))',gap:12,marginBottom:16}},
      cards.map(([label,val,sub,warn],i)=>h('div',{key:i,title:sub||'',
        style:{background:C.white,border:'1px solid '+C.border,borderRadius:13,padding:'10px 14px',
          boxShadow:C.shadow,display:'flex',alignItems:'center',gap:10}},
        h('div',{style:{width:26,height:26,borderRadius:8,background:warn?'#fbf3df':C.tint,
          color:warn?'#b0791b':C.dark,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},this.finIc(i)),
        h('div',{style:{flex:1,minWidth:0,fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.sub,
          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},label),
        h('div',{style:{fontSize:19,fontWeight:700,letterSpacing:'-.4px',lineHeight:1,
          fontVariantNumeric:'tabular-nums',flex:'none',fontFamily:mono,color:warn?'#b0791b':C.ink}},val))));
  }
  finIc(i){ const h=React.createElement, p={width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8};
    const d=[['M3 7h18v13H3z','M8 7V4h8v3'],
             ['M12 2 2 7l10 5 10-5-10-5z','M2 17l10 5 10-5M2 12l10 5 10-5'],
             ['M20 6 9 17l-5-5'],
             ['M22 12h-4l-3 9L9 3l-3 9H2']];
    return h('svg',p,d[i%4].map((x,j)=>h('path',{key:j,d:x}))); }
  // 'XS:12  S:30  M:44' — theo đúng thứ tự size chuẩn, size lạ xếp cuối
  finSizeTxt(sizes){ const o=sizes||{};
    const std=this.SORDER.filter(z=>Number(o[z])>0);
    const rest=Object.keys(o).filter(z=>this.SORDER.indexOf(z)<0&&Number(o[z])>0).sort();
    return std.concat(rest).map(z=>z+':'+this.fmt(o[z])).join('  '); }
  finChip(on){ const h=React.createElement, C=this.C;
    const c=on?{fg:C.dark,bg:C.tint,bd:'#cfe3a6'}:{fg:'#b0791b',bg:'#fbf3df',bd:'#ecdcb4'};
    return h('span',{style:{fontSize:11,fontWeight:700,color:c.fg,background:c.bg,border:'1px solid '+c.bd,
      borderRadius:999,padding:'3px 9px',whiteSpace:'nowrap'}},this.t(on?'fiDone':'fiWait')); }

  // ---- Finishing In: sổ nhận phiếu bàn giao --------------------------------
  finRecvMap(){ return this.state.finRecv||{}; }
  // Chỉ phiếu ĐÃ CHỐT (có ts) mới về hoàn thiện — bản nháp chưa phát hành thì không
  finSlips(){ return this.dsoSlipList().filter(s=>s&&s.id&&s.ts); }
  // 1 dong cua to phieu -> (ma hang | PO | mau) THAT. Uu tien a.key vi do la
  // dung khoa lich su may (ngay|chuyen|ma hang|PO|mau); phieu cu khong co alloc
  // thi lui ve chinh cac truong cua to phieu.
  finPart(a,s){ const p=String((a&&a.key)||'').split('|'), k5=p.length===5;
    const g=(i,alt,sv)=>{ const v=(k5?p[i]:'')||alt||sv; return (v==null||v==='')?'—':String(v); };
    return {style:g(2,a&&a.style,s.style), po:g(3,a&&a.po,s.po), color:g(4,a&&a.color,s.color),
      line:String((k5?p[1]:'')||(a&&a.line)||s.line||'').trim(),
      qty:Number(a&&a.qty)||0, sizes:(a&&a.sizes)||{}}; }
  finParts(s){ const al=(s.alloc||[]).filter(a=>a&&(Number(a.qty)||0)>0);
    return al.length?al.map(a=>this.finPart(a,s))
      :[{style:s.style||'—',po:s.po||'—',color:s.color||'—',line:s.line||'',
         qty:Number(s.qty)||0,sizes:s.sizes||{}}]; }
  finList(q){ const list=this.finSlips().slice().sort((a,b)=>(b.ts||0)-(a.ts||0));
    q=String(q||'').trim().toLowerCase(); if(!q) return list;
    return list.filter(s=>[this.dsoSlipNo(s),s.line,s.style,s.po,s.color].join(' ').toLowerCase().indexOf(q)>=0); }
  // Ten nguoi nhan KHONG go lai o day: doc thang o 'Nguoi nhan (Hoan thien)'
  // da ky tren to phieu (state.dsoHandWho). Ban ghi cu con go tay thi giu lai
  // lam du phong, va to phieu luon duoc uu tien -- sua ten tren phieu la cot
  // NGUOI NHAN doi theo.
  finWhoTo(who,id){ return String(((who||{})[id]||{}).to||'').trim(); }
  finRecvBy(s){ const r=this.finRecvMap()[s.id];
    return this.finWhoTo(this.state.dsoHandWho,s.id)||String((r&&r.by)||'').trim(); }
  finRecvSet(s,on){ const id=s&&s.id; if(!id) return;
    this.setState(st=>{ const m={...(st.finRecv||{})};
      if(on) m[id]={ts:Date.now(),by:this.finWhoTo(st.dsoHandWho,id)||(m[id]&&m[id].by)||''};
      else delete m[id];
      return {finRecv:m}; }); }
  finRecvAll(){ const ids=this.finSlips().map(s=>s.id);
    this.setState(st=>{ const m={...(st.finRecv||{})}, ts=Date.now();
      ids.forEach(id=>{ if(!m[id]) m[id]={ts,by:this.finWhoTo(st.dsoHandWho,id)}; });
      return {finRecv:m}; }); }

  // ---- Finishing In · Phụ liệu hoàn thiện ----------------------------------
  // Cung nguon voi bang Ke hoach xuat hang: 1 dong / (ma hang | PO) cua Ke hoach
  // san xuat, khoa PO doc qua orderPo() nen khop voi ca 2 ben May va Hoan thien.
  // SL DON HANG gieo tu ke hoach; SL THUC NHAN la so nguoi dung go khi hang ve.
  FIN_IN_TABS=[['gmt','fiTab1'],['trim','fiTab2']];
  ftSeed(){ const out=[], seen={};
    (this.PS().groups||[]).forEach(g=>(g.rows||[]).forEach(r=>(r.orders||[]).forEach(o=>{
      const style=this.psCode(o.code); if(!style) return;
      const po=this.orderPo(o), k=style+'|'+po; if(seen[k]) return; seen[k]=1;
      out.push({id:'ft'+(out.length+1),brand:this.brandOf(o)||'',style,po,
        qty:this.psQty(o)||0,act:0}); })));
    return out.sort((a,b)=>String(a.brand).localeCompare(String(b.brand))
      ||String(a.style).localeCompare(String(b.style))||String(a.po).localeCompare(String(b.po))); }
  // Gieo 1 lan khi da co Ke hoach san xuat; sau do bang la du lieu nguoi dung sua duoc.
  ftEnsure(){ if(this.state.ftSeeded||(this.state.ftRows||[]).length) return false;
    const rows=this.ftSeed(); if(!rows.length) return false;
    this.set({ftRows:rows,ftSeeded:1}); return true; }
  ftReseed(){ if(!window.confirm(this.t('ftReseedAsk'))) return;
    this.set({ftRows:this.ftSeed(),ftSeeded:1,ftEdit:null,ftQ:'',ftSel:{},ftPick:null}); }
  ftAll(){ return this.state.ftRows||[]; }
  ftList(q){ const l=this.ftAll(); q=String(q||'').trim().toLowerCase(); if(!q) return l;
    return l.filter(r=>[r.brand,r.style,r.po].join(' ').toLowerCase().indexOf(q)>=0); }
  ftSet(id,patch){ this.setState(s=>({ftRows:(s.ftRows||[]).map(r=>r.id===id?{...r,...patch}:r)})); }
  ftDel(id){ this.setState(s=>{ const sel={...(s.ftSel||{})}; delete sel[id];
    return {ftRows:(s.ftRows||[]).filter(r=>r.id!==id),ftSel:sel,
      ftEdit:s.ftEdit===id?null:s.ftEdit,ftPick:s.ftPick===id?null:s.ftPick}; }); }
  // Am = con thieu, duong = nhan vuot, 0 = dung bang don hang.
  ftBal(r){ return (Number(r.act)||0)-(Number(r.qty)||0); }

  // ---- O SL THUC NHAN -> hop chon phu lieu --------------------------------
  // Bang trong hop la Danh muc phu lieu (data/mlist.js), sinh tu file Excel
  // "MATERIALS LIST ... -FORM - update.xlsx". Moi dong = 1 phu lieu: tich chon
  // roi go SL nhan; Xac nhan thi TONG bay vao o SL THUC NHAN ngoai bang.
  // ftSel[dong].{id phu lieu} = SL nhan -> giu lai de mo lai van thay da chon gi.
  ML(){ return window.MLIST||{rows:[]}; }
  mlRows(){ return this.ML().rows||[]; }
  mlKinds(){ const out=[]; this.mlRows().forEach(m=>{ const k=m.kind||'';
    if(k&&out.indexOf(k)<0) out.push(k); }); return out; }
  mlList(q,kind){ let l=this.mlRows();
    if(kind) l=l.filter(m=>(m.kind||'')===kind);
    q=String(q||'').trim().toLowerCase(); if(!q) return l;
    return l.filter(m=>[m.item,m.desc,m.pos,m.size,m.mcolor,m.color,m.unit,m.sup,m.arr,m.ship]
      .join(' ').toLowerCase().indexOf(q)>=0); }
  mlSize(m){ return String(m.size||m.pos||'').trim(); }
  // SL goi y khi tich 1 dong: uu tien SL DA GUI, khong co thi lay SL CAN.
  mlDefQty(m){ const v=Number(m.rcvd)||0, n=Number(m.need)||0;
    return Math.round(v>0?v:n); }
  // Duong = ve vuot so can, am = con thieu. Chua tich thi soi theo SL da gui.
  mlDiff(m,q){ return (q==null?(Number(m.rcvd)||0):(Number(q)||0))-(Number(m.need)||0); }

  ftPickOpen(id){ if(!this.ftAll().some(r=>r.id===id)) return;
    this.set({ftPick:id,ftPickQ:'',ftPickKind:'',
      ftPickDraft:{...((this.state.ftSel||{})[id]||{})}}); }
  ftPickClose(){ this.set({ftPick:null,ftPickQ:'',ftPickKind:'',ftPickDraft:null}); }
  ftDraft(){ return this.state.ftPickDraft||{}; }
  ftPickHas(mid){ return this.ftDraft()[mid]!=null; }
  ftPickToggle(m){ this.setState(s=>{ const d={...(s.ftPickDraft||{})};
    if(d[m.id]!=null) delete d[m.id]; else d[m.id]=this.mlDefQty(m);
    return {ftPickDraft:d}; }); }
  ftPickQty(mid,v){ this.setState(s=>({ftPickDraft:{...(s.ftPickDraft||{}),[mid]:this.fgNum(v)}})); }
  // Chon/bo het -- chi tac dong len nhung dong dang hien (theo o tim + loc loai)
  ftPickFill(on){ const list=this.mlList(this.state.ftPickQ,this.state.ftPickKind);
    this.setState(s=>{ const d={...(s.ftPickDraft||{})};
      list.forEach(m=>{ if(on){ if(d[m.id]==null) d[m.id]=this.mlDefQty(m); }
        else delete d[m.id]; });
      return {ftPickDraft:d}; }); }
  // units = cac don vi dang gop lai (MT / YD / EA / SET / CONE). Gop nhieu don vi
  // vao 1 con so thi hop se noi ro ra, khong lang le cong don.
  ftPickSum(){ const d=this.ftDraft(), by={}; let n=0, qty=0;
    this.mlRows().forEach(m=>{ if(d[m.id]==null) return;
      n++; qty+=Number(d[m.id])||0; const u=String(m.unit||'').trim(); if(u) by[u]=1; });
    return {n,qty,units:Object.keys(by)}; }
  ftPickOk(){ const id=this.state.ftPick; if(!id) return;
    const sum=this.ftPickSum(), d={...this.ftDraft()};
    this.setState(s=>({ftSel:{...(s.ftSel||{}),[id]:d},
      ftRows:(s.ftRows||[]).map(r=>r.id===id?{...r,act:sum.qty}:r),
      ftPick:null,ftPickQ:'',ftPickKind:'',ftPickDraft:null})); }
  ftSelN(id){ const d=(this.state.ftSel||{})[id]; return d?Object.keys(d).length:0; }

  renderFinInBody(){
    const h=React.createElement, tab=this.state.finTab||'gmt';
    return h('div',{ref:this.scrollRef,className:'yscroll','data-screen-label':'Finishing In',
      style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('fiTitle','S-06-FINISH-IN · UI Proto'),
      this.tabBar(this.FIN_IN_TABS,tab,id=>this.set({finTab:id,ftEdit:null}),false),
      tab==='trim'
        ? h('div',null,this.renderFinTrimKpis(),this.renderFinTrimTable())
        : h('div',null,this.renderFinInKpis(),this.renderFinInTable()),
      this.renderDsoHandAsk(),
      this.renderFtPick());
  }
  renderFinInKpis(){
    const rec=this.finRecvMap(), today=this.dsoToday();
    let waitN=0, waitQ=0, todayQ=0, allQ=0;
    this.finSlips().forEach(s=>{ const q=Number(s.qty)||0, r=rec[s.id];
      if(r){ allQ+=q; if(this.psFmtD(new Date(r.ts||0))===today) todayQ+=q; }
      else { waitN++; waitQ+=q; } });
    return this.finKpis([
      [this.t('fiK1'),this.fmtn(waitN),this.t('fiK1s'),waitN>0],
      [this.t('fiK2'),this.fmtn(waitQ),this.t('fiK2s'),waitQ>0],
      [this.t('fiK3'),this.fmtn(todayQ),this.t('fiK3s')],
      [this.t('fiK4'),this.fmtn(allQ),this.t('fiK4s')]]);
  }
  renderFinInTable(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const q=this.state.finQ||'', all=this.finSlips(), rows=this.finList(q), rec=this.finRecvMap();
    const wait=all.filter(s=>!rec[s.id]).length;
    const action=h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
        border:'1px solid '+C.border,borderRadius:999,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.fmt(all.length)+' '+this.t('fiCount')),
      this.dfSearchBox(q,v=>this.set({finQ:v}),false,'fiSearch'),
      wait?this.mtBtn(this.t('fiRecvAll'),()=>this.finRecvAll(),
        {color:C.primary,borderColor:C.border,padding:'6px 12px',fontSize:12}):null);
    const body=rows.map((s,i)=>{
      const on=!!rec[s.id], bg=i%2?'#f7f9f3':C.white;
      return h('tr',{key:s.id},
        h('td',{style:{...S.td,background:bg,textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}},i+1),
        h('td',{style:{...S.td,background:bg,whiteSpace:'nowrap'}},
          h('span',{title:this.t('fiView'),onClick:()=>this.dsoSlipOpen(s),
            style:{fontFamily:S.mono,fontWeight:700,color:C.primary,cursor:'pointer',borderBottom:'1px dotted '+C.primary}},
            this.dsoSlipNo(s))),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono,fontSize:11.5,color:C.sub,whiteSpace:'nowrap'}},this.dsoSlipWhen(s.ts)),
        h('td',{style:{...S.td,background:bg,fontWeight:600,whiteSpace:'nowrap'}},s.line||'—'),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono,fontWeight:700}},s.style||'—'),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono}},s.po||'—'),
        h('td',{style:{...S.td,background:bg,wordBreak:'break-word'}},s.color||'—'),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono,fontSize:11,color:C.sub,wordBreak:'break-word'}},
          this.finSizeTxt(s.sizes)||'—'),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono,fontWeight:700,textAlign:'right'}},this.fmt(s.qty)),
        h('td',{style:{...S.td,background:bg,whiteSpace:'nowrap'}},this.finChip(on)),
        h('td',{style:{...S.td,background:bg,wordBreak:'break-word'}},
          on?h('span',{title:this.t('fiByTip'),style:{fontWeight:600,color:C.ink}},this.finRecvBy(s)||'—')
            :h('span',{style:{color:C.faint}},'—')),
        h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6}},
            on?this.mtBtn(this.t('fiUnrecv'),()=>this.finRecvSet(s,false),{color:'#c0392b',borderColor:'#eccfca'})
              :this.mtBtn(this.t('fiRecv'),()=>this.finRecvSet(s,true),{border:'1px solid '+C.primary,background:C.tint}),
            this.mtBtn(this.t('fiView'),()=>this.dsoSlipOpen(s)))));
    });
    const tbl=h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1240px',borderCollapse:'collapse'}},
        h('colgroup',null,h('col',{style:{width:'46px'}}),h('col',{style:{width:'132px'}}),
          h('col',{style:{width:'126px'}}),h('col',{style:{width:'82px'}}),h('col',{style:{width:'118px'}}),
          h('col',{style:{width:'82px'}}),h('col',{style:{width:'120px'}}),h('col',{style:{width:'auto'}}),
          h('col',{style:{width:'84px'}}),h('col',{style:{width:'92px'}}),h('col',{style:{width:'132px'}}),
          h('col',{style:{width:'150px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...S.th,textAlign:'center',paddingLeft:8}},this.t('mtNo')),
          ...['fiNo','fiWhen','fiLine','fiStyle','fiPo','fiColor','fiSizes'].map(k=>h('th',{key:k,style:S.th},this.t(k))),
          h('th',{style:{...S.th,textAlign:'right'}},this.t('fiQty')),
          h('th',{style:S.th},this.t('fiSt')), h('th',{style:S.th},this.t('fiBy')),
          h('th',{style:{...S.th,borderRight:'none'}},this.t('fiAct')))),
        h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:12,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none'}},
          this.t(all.length?'fiNoHit':'fiEmpty'))))));
    return this.dsoCard('fiPanel','fiSub','Finishing In',tbl,{full:true,action});
  }

  renderFinTrimKpis(){
    const l=this.ftAll(); let qty=0, act=0, short=0, done=0;
    l.forEach(r=>{ const q=Number(r.qty)||0, a=Number(r.act)||0;
      qty+=q; act+=a; if(a<q) short+=q-a; else if(q>0) done++; });
    return this.finKpis([
      [this.t('ftK1'),this.fmtn(qty),this.t('ftK1s')],
      [this.t('ftK2'),this.fmtn(act),this.t('ftK2s')],
      [this.t('ftK3'),this.fmtn(short),this.t('ftK3s'),short>0],
      [this.t('ftK4'),this.fmtn(done),this.t('ftK4s')]]);
  }
  renderFinTrimTable(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const q=this.state.ftQ||'', all=this.ftAll(), rows=this.ftList(q);
    const action=h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
        border:'1px solid '+C.border,borderRadius:999,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.fmt(all.length)+' '+this.t('ftCount')),
      this.dfSearchBox(q,v=>this.set({ftQ:v}),false,'ftSearch'),
      this.mtBtn(this.t('ftReseed'),()=>this.ftReseed(),{padding:'6px 12px',fontSize:12}));
    const body=rows.map((r,i)=>{
      const ed=this.state.ftEdit===r.id, bg=i%2?'#f7f9f3':C.white, bal=this.ftBal(r);
      const selN=this.ftSelN(r.id);
      // THUONG HIEU · MA HANG · PO# la khoa dong, do Ke hoach san xuat quyet dinh
      // -> chi doc ca khi dang sua. Sua o trang Ke hoach san xuat roi Gieo lai.
      const ro=f=>String(r[f]||'').trim()||'—';
      const num=f=>ed
        ? h('input',{value:r[f]||'',inputMode:'numeric',
            onChange:e=>this.ftSet(r.id,{[f]:this.fgNum(e.target.value)}),
            style:{...S.inp,textAlign:'right'}})
        : this.fmt(r[f]);
      const cell=(el,extra)=>h('td',{style:{...S.td,background:bg,...(extra||{})}},el);
      const lock=(el,extra)=>h('td',{title:this.t('tipPlanCol'),
        style:{...S.td,background:bg,color:ed?C.sub:undefined,...(extra||{})}},el);
      return h('tr',{key:r.id},
        cell(i+1,{textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}),
        lock(ro('brand'),{fontWeight:600}),
        lock(ro('style'),{fontFamily:S.mono,fontWeight:700,color:ed?C.sub:C.primary}),
        lock(ro('po'),{fontFamily:S.mono}),
        cell(num('qty'),{textAlign:'right',fontFamily:S.mono,fontWeight:700}),
        // O SL THUC NHAN khong go tay: bam vao la mo hop chon phu lieu (renderFtPick).
        // The nho ben canh = so dong phu lieu dang gop lai thanh con so nay.
        h('td',{onClick:()=>this.ftPickOpen(r.id),
          title:this.t('ftPickTip')+(bal<0?' · '+this.t('ftShortTip')
            :(bal>0?' · '+this.t('ftOverTip'):'')),
          style:{...S.td,background:bg,padding:0,cursor:'pointer'}},
          h('div',{style:{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:7,
              padding:'8px 10px'},'style-hover':{background:C.tint}},
            selN?h('span',{style:{fontSize:10,fontWeight:700,fontFamily:S.mono,color:C.dark,
              background:C.tint,border:'1px solid '+C.border,borderRadius:999,padding:'1px 7px',
              whiteSpace:'nowrap'}},this.fmt(selN)+' '+this.t('ftPickLn')):null,
            h('span',{style:{fontFamily:S.mono,fontWeight:700,
              color:bal<0?'#c0392b':(bal>0?C.primary:C.ink)}},this.fmt(r.act)),
            h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:C.faint,strokeWidth:2,
              style:{flex:'none'}},h('path',{d:'M6 9l6 6 6-6'})))),
        h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6}},
            ed?this.mtBtn(this.t('lsDone'),()=>this.set({ftEdit:null}),{border:'1px solid '+C.primary,background:C.tint})
              :this.mtBtn(this.t('lsEdit'),()=>this.set({ftEdit:r.id})),
            this.mtBtn(this.t('mtDel'),()=>this.ftDel(r.id),{color:'#c0392b',borderColor:'#eccfca'}))));
    });
    const cols=[['mtNo',0],['ftBrand',0],['ftStyle',0],['ftPo',0],['ftQtyO',1],['ftQtyA',1],['mtAct',0]];
    const tbl=h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'880px',borderCollapse:'collapse'}},
        h('colgroup',null,h('col',{style:{width:'46px'}}),h('col',{style:{width:'auto'}}),
          h('col',{style:{width:'auto'}}),h('col',{style:{width:'130px'}}),
          h('col',{style:{width:'140px'}}),h('col',{style:{width:'150px'}}),
          h('col',{style:{width:'150px'}})),
        h('thead',null,h('tr',null,
          cols.map(([k,rt],ci)=>h('th',{key:k,style:{...S.th,
            ...(rt?{textAlign:'right'}:{}),
            ...(ci===0?{textAlign:'center',paddingLeft:8}:{}),
            ...(ci===cols.length-1?{borderRight:'none'}:{})}},this.t(k))))),
        h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:cols.length,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none'}},
          this.t(all.length?'ftNoHit':'ftEmpty'))))));
    return this.dsoCard('ftPanel','ftSub','Finishing Trims',tbl,{full:true,action});
  }

  // ---- Hop chon phu lieu nhan vao ------------------------------------------
  // Mo tu o SL THUC NHAN. Ban chon nam trong ftPickDraft (nhap nhay tuy y, chua
  // dinh gi den bang ngoai); chi Xac nhan moi ghi vao ftSel + act. Bam ra ngoai
  // hay Huy la mat ban nhap -- co y nhu vay, gio o ngoai khong the sua nham.
  renderFtPick(){
    const h=React.createElement, C=this.C, S=this.mtStyles(), mono=S.mono;
    const id=this.state.ftPick; if(!id) return null;
    const r=this.ftAll().find(x=>x.id===id); if(!r) return null;
    const ML=this.ML(), all=this.mlRows(), close=()=>this.ftPickClose();
    const q=this.state.ftPickQ||'', kind=this.state.ftPickKind||'';
    const rows=this.mlList(q,kind), d=this.ftDraft(), sum=this.ftPickSum();
    const order=Number(r.qty)||0, diff=sum.qty-order, dash='—';
    // --- dau hop: dong nao dang duoc nhan phu lieu ---
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'15px 20px',
        flex:'none',borderBottom:'1px solid '+C.line}},
      h('div',{style:{width:36,height:36,borderRadius:10,background:C.tint,color:C.dark,flex:'none',
          display:'flex',alignItems:'center',justifyContent:'center'}},
        h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M20 7l-8-4-8 4 8 4 8-4zM4 7v10l8 4 8-4V7'}))),
      h('div',{style:{minWidth:0,marginRight:'auto'}},
        h('div',{style:{fontSize:16,fontWeight:700}},this.t('ftPickT')),
        h('div',{style:{fontSize:11.5,color:C.faint,marginTop:2,display:'flex',gap:7,
            flexWrap:'wrap',alignItems:'center'}},
          h('span',{style:{fontWeight:700,color:C.sub}},String(r.brand||'').trim()||dash),
          h('span',{style:{color:C.border}},'·'),
          h('span',{style:{fontFamily:mono,fontWeight:700,color:C.primary}},String(r.style||'').trim()||dash),
          h('span',{style:{color:C.border}},'·'),
          h('span',{style:{fontFamily:mono}},String(r.po||'').trim()||dash))),
      h('button',{title:this.t('dsoClose'),onClick:close,
        style:{border:'1px solid '+C.border,background:C.white,color:C.sub,borderRadius:9,width:30,
          height:30,flex:'none',cursor:'pointer',fontSize:17,lineHeight:1,padding:0,fontFamily:'inherit'},
        'style-hover':{background:C.tint}},'×'));
    // --- tong hop tren dau: dang chon bao nhieu, so voi SL don hang ---
    const card=(label,value,sub,tone)=>h('div',{key:label,
      style:{flex:'1 1 150px',minWidth:132,border:'1px solid '+C.border,borderRadius:12,
        background:C.white,padding:'10px 13px'}},
      h('div',{style:{fontSize:10,fontWeight:700,letterSpacing:'.5px',color:C.faint,
        whiteSpace:'nowrap'}},label),
      h('div',{style:{fontSize:21,fontWeight:700,fontFamily:mono,lineHeight:1.15,marginTop:3,
        color:tone||C.ink}},value),
      h('div',{style:{fontSize:10.5,color:C.faint,marginTop:3}},sub));
    const pct=order>0?Math.min(100,Math.round(sum.qty/order*100)):0;
    const tone=diff<0?'#c0392b':(diff>0?C.primary:C.ink);
    const recap=h('div',{style:{padding:'16px 20px 0',flex:'none'}},
      h('div',{style:{display:'flex',gap:10,flexWrap:'wrap'}},
        card(this.t('ftPickSel'),this.fmt(sum.n)+'/'+this.fmt(all.length),
          this.t('ftPickSelS'),sum.n?C.dark:C.faint),
        card(this.t('ftPickQty'),this.fmtn(sum.qty),
          sum.units.length>1?this.t('ftPickMix')+' '+sum.units.join(' + ')
            :(sum.units[0]?this.t('ftPickQtyS')+' · '+sum.units[0]:this.t('ftPickQtyS')),
          sum.qty?C.ink:C.faint),
        card(this.t('ftPickOrd'),this.fmt(order),this.t('ftPickOrdS')),
        card(this.t('ftPickDif'),(diff>0?'+':'')+this.fmtn(diff),this.t('ftPickDifS'),tone)),
      // thanh do: dang chon duoc bao nhieu phan so voi SL don hang
      order>0?h('div',{style:{marginTop:11}},
        h('div',{style:{height:6,borderRadius:99,background:C.line,overflow:'hidden'}},
          h('div',{style:{width:pct+'%',height:'100%',borderRadius:99,
            background:diff<0?'#e6a19a':C.primary,transition:'width .18s'}})),
        h('div',{style:{fontSize:10.5,color:C.faint,marginTop:5,fontFamily:mono}},
          this.fmtn(sum.qty)+' / '+this.fmt(order)+'  ·  '+pct+'%')):null);
    // --- thanh cong cu: loc theo loai + o tim + chon/bo het ---
    const chip=(label,val)=>{ const on=kind===val;
      return h('button',{key:'k'+val,onClick:()=>this.set({ftPickKind:val}),
        style:{border:'1px solid '+(on?C.primary:C.border),background:on?C.tint:C.white,
          color:on?C.dark:C.sub,borderRadius:999,padding:'5px 12px',fontSize:11.5,fontWeight:700,
          fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap'},
        'style-hover':{background:C.tint}},label); };
    const bar=h('div',{style:{display:'flex',alignItems:'center',gap:8,padding:'14px 20px 10px',
        flexWrap:'wrap',flex:'none'}},
      chip(this.t('ftPickAll'),''),
      ...this.mlKinds().map(k=>chip(k,k)),
      h('div',{style:{flex:1,minWidth:8}}),
      this.dfSearchBox(q,v=>this.set({ftPickQ:v}),false,'ftPickSearch'),
      this.mtBtn(this.t('ftPickPick'),()=>this.ftPickFill(true),{padding:'6px 11px',fontSize:11.5}),
      this.mtBtn(this.t('ftPickNone'),()=>this.ftPickFill(false),{padding:'6px 11px',fontSize:11.5}));
    // --- bang danh muc phu lieu ---
    const sth={...S.th,position:'sticky',top:0,zIndex:1};
    const ctd={padding:'7px 9px',fontSize:12,borderTop:'1px solid '+C.line,
      borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    // 2 cot cuoi ghim phai (SL nhan + chenh lech) — keo ngang van thay o nhap.
    const PINW=[112,108];
    const pin=(i,z)=>({position:'sticky',right:i?0:PINW[1],zIndex:z,
      ...(i?{}:{borderLeft:'1px solid '+C.border})});
    const txt=v=>String(v==null?'':v).trim()||dash;
    const cols=[['','c'],['mtNo','c'],['mlKind','l'],['mlItem','l'],['mlDesc','l'],['mlSize','l'],
      ['mlColor','l'],['mlUnit','c'],['mlNeed','r'],['mlShipQ','r'],['mlArr','l'],['mlSup','l'],
      ['mlRecv','r'],['mlBal','r']];
    const body=rows.map((m,i)=>{ const on=d[m.id]!=null, dq=on?d[m.id]:null;
      const dv=this.mlDiff(m,dq);
      const rbg=on?C.tint:(i%2?'#f7f9f3':C.white);
      return h('tr',{key:m.id,onClick:()=>this.ftPickToggle(m),title:this.t('ftPickRowTip'),
          style:{cursor:'pointer',background:rbg},
          'style-hover':{background:on?C.badge:C.tint2}},
        // o tich ve tay: bam bat cu dau tren dong cung an
        h('td',{style:{...ctd,textAlign:'center',paddingLeft:14,width:34}},
          h('span',{style:{display:'inline-flex',alignItems:'center',justifyContent:'center',
              width:16,height:16,borderRadius:5,border:'1.5px solid '+(on?C.primary:C.border),
              background:on?C.primary:C.white,color:'#fff'}},
            on?h('svg',{width:11,height:11,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',
              strokeWidth:3.2},h('path',{d:'M5 13l4 4L19 7'})):null)),
        h('td',{style:{...ctd,textAlign:'center',fontFamily:mono,color:C.faint,fontWeight:600}},i+1),
        h('td',{style:{...ctd,whiteSpace:'nowrap'}},
          h('span',{style:{fontSize:10,fontWeight:700,fontFamily:mono,letterSpacing:'.3px',
            color:C.sub,background:C.white,border:'1px solid '+C.border,borderRadius:999,
            padding:'1px 7px'}},txt(m.kind))),
        h('td',{style:{...ctd,fontFamily:mono,fontWeight:700,color:C.dark,whiteSpace:'nowrap'}},txt(m.item)),
        h('td',{style:{...ctd,fontWeight:600,minWidth:180,wordBreak:'break-word'}},txt(m.desc)),
        h('td',{style:{...ctd,fontFamily:mono,whiteSpace:'nowrap'}},txt(this.mlSize(m))),
        h('td',{style:{...ctd,whiteSpace:'nowrap'}},txt(m.mcolor||m.color)),
        h('td',{style:{...ctd,textAlign:'center',fontFamily:mono,color:C.sub,whiteSpace:'nowrap'}},txt(m.unit)),
        h('td',{style:{...ctd,textAlign:'right',fontFamily:mono,whiteSpace:'nowrap'}},this.fmtn(m.need)),
        h('td',{style:{...ctd,textAlign:'right',fontFamily:mono,color:C.sub,whiteSpace:'nowrap'}},
          Number(m.rcvd)?this.fmtn(m.rcvd):dash),
        h('td',{style:{...ctd,fontFamily:mono,fontSize:11.5,color:C.sub,minWidth:92}},txt(m.arr)),
        h('td',{style:{...ctd,color:C.sub,minWidth:80,wordBreak:'break-word'}},txt(m.sup)),
        // go SL nhan: chan noi bam len <tr> de khong bo tich khi dang sua so
        h('td',{onClick:e=>e.stopPropagation(),style:{...ctd,textAlign:'right',
          width:PINW[0],minWidth:PINW[0],background:rbg,...pin(0,2)}},
          on?h('input',{value:dq==null?'':String(dq),inputMode:'numeric',
              onChange:e=>this.ftPickQty(m.id,e.target.value),
              style:{...S.inp,textAlign:'right'}})
            :h('span',{style:{fontFamily:mono,color:C.faint}},dash)),
        h('td',{style:{...ctd,borderRight:'none',textAlign:'right',fontFamily:mono,fontWeight:700,
          whiteSpace:'nowrap',width:PINW[1],minWidth:PINW[1],background:rbg,...pin(1,2),
          color:dv<0?'#c0392b':(dv>0?C.primary:C.faint)}},
          (dv>0?'+':'')+this.fmtn(dv))); });
    const note=k=>h('div',{style:{padding:'46px 20px',textAlign:'center',color:C.faint,
      fontSize:13}},this.t(k));
    const table=!all.length?h('div',{style:{flex:1,minHeight:150}},note('ftPickEmpty'))
      :(rows.length
        ? h('div',{className:'yscroll',style:{overflow:'auto',flex:1,minHeight:150,
            borderTop:'1px solid '+C.line}},
            h('table',{style:{width:'100%',minWidth:'1240px',borderCollapse:'collapse'}},
              h('thead',null,h('tr',null,
                cols.map(([k,a],ci)=>{ const pi=ci-(cols.length-2);
                  return h('th',{key:'h'+ci,style:{...sth,
                    ...(a==='r'?{textAlign:'right'}:(a==='c'?{textAlign:'center'}:{})),
                    ...(ci===0?{paddingLeft:14}:{}),
                    ...(ci===cols.length-1?{borderRight:'none'}:{}),
                    ...(pi>=0?{width:PINW[pi],minWidth:PINW[pi],...pin(pi,3)}:{})}},
                    k?this.t(k):''); }))),
              h('tbody',null,body)))
        : h('div',{style:{flex:1,minHeight:150}},note('ftPickNoHit')));
    // --- chan hop: dang chon bao nhieu + Huy / Xac nhan ---
    const foot=h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'12px 20px',
        flex:'none',borderTop:'1px solid '+C.line,background:'#f8faf3',flexWrap:'wrap'}},
      h('span',{style:{fontSize:12,fontWeight:700,whiteSpace:'nowrap',
        color:sum.n?C.dark:C.faint}},this.t('ftPickFoot')+': ',
        h('span',{style:{fontFamily:mono}},
          this.fmt(sum.n)+' '+this.t('ftPickLn')+' · '+this.fmtn(sum.qty))),
      ML.src?h('span',{title:ML.src,style:{fontSize:10.5,color:C.faint,minWidth:0,overflow:'hidden',
        textOverflow:'ellipsis',whiteSpace:'nowrap'}},this.t('ftPickSrc')+' '+ML.src):null,
      h('div',{style:{flex:1,minWidth:8}}),
      h('button',{onClick:close,style:this.btn('ghost')},this.t('psCancel')),
      h('button',{onClick:()=>this.ftPickOk(),style:this.btn('primary')},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M5 13l4 4L19 7'})),this.t('ftPickOk')));
    const over=h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',
        zIndex:87,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),style:{width:'min(1340px,96vw)',maxHeight:'92vh',
          display:'flex',flexDirection:'column',background:C.white,borderRadius:18,
          boxShadow:'0 30px 70px rgba(0,0,0,.34)',overflow:'hidden'}},
        head,recap,bar,table,foot));
    return (RD&&RD.createPortal)?RD.createPortal(over,document.body):over;
  }

  // ---- Finishing Status: WIP qua 4 công đoạn -------------------------------
  // Gom hàng ĐÃ NHẬN theo (mã hàng | PO | màu) — đúng cấp mà tờ phiếu mang theo.
  // Nho lai theo dung 2 mieng state ma ham nay doc — fgReadyQty goi lai cho
  // tung lo xuat nen khong the tinh lai moi lan.
  finGroups(){ const rec=this.finRecvMap(), sl=this.state.dsoSlips;
    const c=this._finGC; if(c&&c.rec===rec&&c.sl===sl) return c.out;
    const at={}, out=[];
    this.finSlips().forEach(s=>{ const r=rec[s.id]; if(!r) return;
      this.finParts(s).forEach(p=>{
        const k=[p.style,p.po,p.color].join('|'); let g=at[k];
        if(!g){ g=at[k]={key:k,style:p.style,po:p.po,color:p.color,
          in:0,sizes:{},lines:[],at:0}; out.push(g); }
        g.in+=p.qty; g.at=Math.max(g.at,r.ts||0);
        Object.keys(p.sizes||{}).forEach(z=>{ g.sizes[z]=(g.sizes[z]||0)+(Number(p.sizes[z])||0); });
        const ln=String(p.line||'').trim(); if(ln&&g.lines.indexOf(ln)<0) g.lines.push(ln); }); });
    out.sort((a,b)=>String(a.style).localeCompare(String(b.style))
      ||String(a.po).localeCompare(String(b.po))||String(a.color).localeCompare(String(b.color)));
    this._finGC={rec,sl,out}; return out; }
  finGroupList(q){ const list=this.finGroups(); q=String(q||'').trim().toLowerCase();
    if(!q) return list;
    return list.filter(g=>[g.style,g.po,g.color,g.lines.join(' '),
      this.fsBrand(g),this.fsRemark(g)].join(' ').toLowerCase().indexOf(q)>=0); }
  // So THO da go, chua kep tran
  finRawQ(key,st){ return Math.max(0,Number((this.state.finStage||{})[key+'|'+st])||0); }
  // So HIEN THI cua cong doan i: khong vuot duoc DA NHAN, cung khong vuot duoc
  // bat ky cong doan nao truoc no. Kep luc doc nen so da go khong bi pha, va
  // khi DA NHAN tut xuong thi cac cong doan tu dung theo.
  finStageQ(g,i){ let v=g.in;
    for(let j=0;j<=i;j++) v=Math.min(v,this.finRawQ(g.key,this.FIN_STAGES[j][0]));
    return Math.max(0,v); }
  finStageId(g,id){ const i=this.FIN_STAGES.findIndex(x=>x[0]===id); return i<0?0:this.finStageQ(g,i); }
  finLast(g){ return this.finStageQ(g,this.FIN_STAGES.length-1); }
  // Trần của 1 công đoạn = số của công đoạn liền trước (công đoạn đầu = đã nhận)
  finCap(g,i){ return i<=0?g.in:this.finStageQ(g,i-1); }
  finWip(g){ return Math.max(0,g.in-this.finLast(g)); }
  finPct(g){ return g.in?Math.min(100,Math.round(this.finLast(g)/g.in*100)):0; }
  // Sửa 1 công đoạn: chỉ ghi đúng ô đó, không đụng vào các công đoạn sau
  finStageSet(g,i,v){
    const n=Math.max(0,Math.min(g.in,parseInt(String(v).replace(/[^0-9]/g,''),10)||0));
    this.setState(s=>{ const m={...(s.finStage||{})}; m[g.key+'|'+this.FIN_STAGES[i][0]]=n;
      return {finStage:m}; }); }
  finPushAll(g){ this.setState(s=>{ const m={...(s.finStage||{})};
    this.FIN_STAGES.forEach(([id])=>{ m[g.key+'|'+id]=g.in; }); return {finStage:m}; }); }
  finClear(g){ this.setState(s=>{ const m={...(s.finStage||{})};
    this.FIN_STAGES.forEach(([id])=>{ delete m[g.key+'|'+id]; }); return {finStage:m}; }); }
  // ---- Finishing Status: dong goi / da xuat / ton kho ---------------------
  // Bang chi con cot DONG GOI go tay, nen doc SO THO roi kep theo DA NHAN.
  // KHONG dung finStageQ: ham do kep theo ca Ui / Kiem cuoi, ma hai cong doan
  // do khong con cot nao de go -> pack se dung 0 mai.
  // So dong goi go theo TUNG NGAY: fsPackD['ma hang|PO|mau|YYYY-MM-DD'].
  // Bang chi mo o HOM NAY; hom qua da chot chi doc, tong luy ke la so cong lai.
  fsYesterday(){ const d=new Date(); d.setDate(d.getDate()-1); return this.psFmtD(d); }
  // ---- PCS DA DONG GOI: SINH TU SO THUNG ---------------------------------
  // Cot DA DONG GOI khong go tay nua -- moi con so deu la SO THUNG x ti le.
  // Packing list moi cho TONG SO THUNG, chua tach duoc 1 thung bao nhieu cai,
  // nen ti le tam khoa cung o day. Co du lieu that (cot pcs/carton trong
  // packing list, hay ti le theo ma hang) thi doi DUNG 1 CHO NAY.
  //
  // Chuoi day du:  quet ma vach -> so thung -> pcs -> CHUA DONG GOI / TON KHO
  //
  // state.fsPackD (so pcs go tay cua ban truoc) khong con duoc doc, nhung van
  // giu trong PERSIST -- bo ti le tu sinh nay di la du lieu cu con nguyen.
  FS_PCS_CTN=9;
  fsPcs(ctn){ return Math.max(0,Math.round((Number(ctn)||0)*this.FS_PCS_CTN)); }
  fsPackDay(g,day){ return this.fsPcs(this.fsCtnDay(g,day)); }
  fsPackRaw(g){ return this.fsPcs(this.fsCtnRaw(g)); }
  fsPacked(g){ return this.fsPackRaw(g); }
  // Vuot so DA NHAN = ti le tam dang sai (hoac so thung go nham) -> to do o cot
  // TONG LUY KE. Khong kep lai: 3 o cua khoi pcs deu la so thung x ti le, kep
  // mot o thi cong doc khong khop, nhin nhu bang tinh sai.
  fsPackOver(g){ return Math.max(0,this.fsPackRaw(g)-g.in); }
  fsUnpacked(g){ return Math.max(0,g.in-this.fsPacked(g)); }
  // ---- SO THUNG: y het khoi pcs o tren, chi khac cai tran --------------------
  // fsCtnO['ma hang|PO|mau']            SL thung don hang, go tay
  // fsCtnD['ma hang|PO|mau|YYYY-MM-DD'] so thung dong trong ngay do
  // Khong co du lieu nao trong app suy ra duoc so thung (khong co ti le
  // pcs/thung o dau ca) nen SL thung don hang phai go. Chua go thi coi nhu
  // chua biet tran: khong kep so thung dong, va cot THUNG CHUA DONG de trong.
  fsInt(v){ return Math.max(0,parseInt(String(v).replace(/[^0-9]/g,''),10)||0); }
  // Packing list nhap o Ke hoach xuat FG la nguon uu tien cho SL THUNG DON HANG.
  // Do nguoc ve dung 1 dong (ma hang | PO | mau) qua fsFgRow(g). Chua nhap
  // packing list thi van go tay nhu cu -> khong lam hong du lieu da co.
  fsCtnPk(g){ const r=this.fsFgRow(g); return r?this.fgPkCtn(r):0; }
  fsCtnBc(g){ const r=this.fsFgRow(g); const b=r?this.fgBcOf(r):null;
    return b?((b.list||[]).length):0; }
  fsCtnOrd(g){ return this.fsCtnPk(g)
    ||Math.max(0,Number((this.state.fsCtnO||{})[g.key])||0); }
  fsCtnOrdSet(g,v){ if(this.fsCtnPk(g)) return;   // dang do packing list lai -> khoa
    const n=this.fsInt(v);
    this.setState(s=>{ const m={...(s.fsCtnO||{})};
      if(n>0) m[g.key]=n; else delete m[g.key]; return {fsCtnO:m}; }); }
  // GO TAY va QUET MA la 2 nguon rieng, cong lai moi ra so thung cua 1 ngay.
  // Tach ra vi o HOM NAY chi sua duoc phan go tay -- phan quet duoc thi phai
  // bo mot lan quet moi giam di.
  fsCtnMan(g,day){ return Math.max(0,Number((this.state.fsCtnD||{})[g.key+'|'+day])||0); }
  fsCtnDay(g,day){ return this.fsCtnMan(g,day)+this.fsScanDay(g,day); }
  fsCtnSums(){ const m=this.state.fsCtnD||{};
    const c=this._fsCS; if(c&&c.m===m) return c.out;
    const out={}; Object.keys(m).forEach(k=>{ const i=k.lastIndexOf('|'); if(i<0) return;
      const gk=k.slice(0,i); out[gk]=(out[gk]||0)+Math.max(0,Number(m[k])||0); });
    this._fsCS={m,out}; return out; }
  fsCtnRaw(g){ return (this.fsCtnSums()[g.key]||0)+this.fsScanN(g); }
  fsCtnPacked(g){ return this.fsCtnRaw(g); }
  // Packing list la so cua CA PO (1 dong Ke hoach xuat = 1 ma hang · PO, gop
  // moi mau) nen tran / con lai cung phai tinh o cap PO: cong so thung da dong
  // cua moi mau cung tro ve 1 dong Ke hoach xuat. Khong co packing list thi giu
  // nguyen cach cu -- go tay tung mau, tran tinh trong pham vi mau do.
  fsCtnPackedFg(g){ const k=this.fsFgKey(g); let n=0;
    this.finGroups().forEach(x=>{ if(this.fsFgKey(x)===k) n+=this.fsCtnRaw(x); });
    return n; }
  fsCtnOver(g){ const pk=this.fsCtnPk(g);
    if(pk) return Math.max(0,this.fsCtnPackedFg(g)-pk);
    const o=this.fsCtnOrd(g); return o?Math.max(0,this.fsCtnRaw(g)-o):0; }
  // null = chua co SL thung don hang -> chua co tran de kep
  // Chi tru phan GO TAY cua ngay do: phan quet duoc cua chinh ngay do van
  // chiem cho, khong duoc go de lan len.
  fsCtnCap(g,day){ const pk=this.fsCtnPk(g);
    if(pk) return Math.max(0,pk-(this.fsCtnPackedFg(g)-this.fsCtnMan(g,day)));
    const o=this.fsCtnOrd(g); if(!o) return null;
    return Math.max(0,o-(this.fsCtnRaw(g)-this.fsCtnMan(g,day))); }
  fsCtnUnpacked(g){ const pk=this.fsCtnPk(g);
    if(pk) return Math.max(0,pk-this.fsCtnPackedFg(g));
    const o=this.fsCtnOrd(g); return o?Math.max(0,o-this.fsCtnRaw(g)):null; }
  fsCtnSet(g,day,v){ const cap=this.fsCtnCap(g,day);
    let n=this.fsInt(v); if(cap!=null) n=Math.min(cap,n);
    this.setState(s=>{ const m={...(s.fsCtnD||{})}, k=g.key+'|'+day;
      if(n>0) m[k]=n; else delete m[k]; return {fsCtnD:m}; }); }
  // ---- QUET MA VACH DONG THUNG -------------------------------------------
  // Danh sach ma vach nhap o bang Ke hoach xuat (state.fgBc[fgRowId].list), do
  // nguoc ve dung 1 dong qua fsFgRow(g). Quet trung 1 ma -> ghi lai moc
  // dd/mm/yyyy HH:mm; so thung dong duoc cua 1 ngay CHINH LA so ma quet trong
  // ngay do, khong phai con so go tay nua.
  //
  //   fsScan['MA VACH'] = {ts, key}   key = 'ma hang|PO|mau' cua dong da quet
  //
  // Khoa theo MA VACH nen 1 thung khong the dem 2 lan: quet lai ma cu thi bao
  // 'da quet luc ...' chu khong cong them. Ghi ca key vi may mau co the dung
  // chung 1 dong Ke hoach xuat -> phai biet ma nay duoc quet o dong nao.
  fsBcNorm(v){ return String(v==null?'':v).trim().toUpperCase(); }
  fsWhen(ts){ const d=new Date(ts), p=n=>String(n).padStart(2,'0');
    return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()
      +' '+p(d.getHours())+':'+p(d.getMinutes()); }
  fsBcOf(g){ const r=this.fsFgRow(g), b=r?this.fgBcOf(r):null; return (b&&b.list)||[]; }
  // Set de tra ma trong O(1) -- danh sach co the toi 20.000 ma (FG_BC_MAX).
  // Nho theo chinh mang list nen nhap file khac la tu dung lai.
  fsBcSet(g){ const list=this.fsBcOf(g); if(!list.length) return null;
    this._fsBS=this._fsBS||new WeakMap();
    let s=this._fsBS.get(list);
    if(!s){ s=new Set(list.map(x=>this.fsBcNorm(x))); this._fsBS.set(list,s); }
    return s; }
  // Dem theo nhom + theo ngay, cong 1 lan cho ca bang roi nho lai
  fsScanSums(){ const m=this.state.fsScan||{};
    const c=this._fsSS; if(c&&c.m===m) return c.out;
    const out={};
    Object.keys(m).forEach(k=>{ const v=m[k]; if(!v||!v.key) return;
      const o=out[v.key]||(out[v.key]={n:0,day:{}});
      o.n++; const d=this.psFmtD(new Date(v.ts||0)); o.day[d]=(o.day[d]||0)+1; });
    this._fsSS={m,out}; return out; }
  fsScanN(g){ const o=this.fsScanSums()[g.key]; return o?o.n:0; }
  fsScanDay(g,day){ const o=this.fsScanSums()[g.key]; return (o&&o.day[day])||0; }
  fsScanLog(g){ const m=this.state.fsScan||{};
    return Object.keys(m).filter(k=>m[k]&&m[k].key===g.key)
      .map(k=>({code:k,ts:m[k].ts||0})).sort((a,b)=>b.ts-a.ts); }
  fsScanShow(g){ this.set({fsScanAt:g.key,fsScanQ:'',fsScanMsg:null}); }
  fsScanClose(){ this.set({fsScanAt:null,fsScanQ:'',fsScanMsg:null}); }
  fsScanGroup(){ const k=this.state.fsScanAt;
    return k?(this.finGroups().find(x=>x.key===k)||null):null; }
  // 3 ket qua: khong co trong danh sach / da quet roi / khop va con moi
  fsScanTake(g,raw){ const code=this.fsBcNorm(raw); if(!code) return;
    const set=this.fsBcSet(g);
    if(!set||!set.has(code)){ this.set({fsScanMsg:{t:'bad',code},fsScanQ:''}); return; }
    const old=(this.state.fsScan||{})[code];
    if(old){ this.set({fsScanMsg:{t:'dup',code,ts:old.ts},fsScanQ:''}); return; }
    const ts=Date.now();
    this.setState(s=>({fsScan:{...(s.fsScan||{}),[code]:{ts,key:g.key}},
      fsScanMsg:{t:'ok',code,ts},fsScanQ:''})); }
  fsScanDrop(code){ this.setState(s=>{ const m={...(s.fsScan||{})}; delete m[code];
    return {fsScan:m,fsScanMsg:null}; }); }
  // ---- Do dong Ke hoach xuat FG cho 1 nhom hoan thien ---------------------
  // Ke hoach xuat FG gio moi dong la 1 (ma hang | PO | MAU) nen phai loc DU CA
  // BA truong -- vi du '0131M&W Kirin pants' | 'PO0131M&W' | 'BLACK'. Cong ca
  // PO lai (nhu ban truoc) thi cot SL DON cua tung mau deu ra tong ca don.
  //
  // Mau 2 ben khong cung mot bo chu: ben may lay o CUTCOLORS ('Black'), ben cat
  // lay ma vai cua tac nghiep ('BLK'), va o COLOR ben Ke hoach xuat thi go tay.
  // Nen do theo bac: dung het -> chua nhau -> don CHUA tach mau (1 dong, va 1
  // trong 2 ben de trong). Khong ra dong nao thi tra null, cot de '—' chu khong
  // muon so cua mau khac.
  fsNorm(v){ return String(v==null?'':v).trim().toLowerCase(); }
  // Danh so 1 lan theo (ma hang | PO) roi nho lai: fsFgRow bi goi lai theo
  // O(nhom^2) qua fsPackedFg, quet ca bang Ke hoach xuat moi lan thi rat ky.
  fsFgIndex(){ const rows=this.fgAll();
    const c=this._fsFGI; if(c&&c.rows===rows) return c.out;
    const out={}; rows.forEach(r=>{ const k=this.fsNorm(r.style)+'|'+this.fsNorm(r.po);
      (out[k]=out[k]||[]).push(r); });
    this._fsFGI={rows,out}; return out; }
  fsFgRow(g){ const same=this.fsFgIndex()[this.fsNorm(g.style)+'|'+this.fsNorm(g.po)];
    if(!same||!same.length) return null;
    const co=this.fsNorm(g.color);
    const hit=same.find(r=>this.fsNorm(r.color)===co); if(hit) return hit;
    if(co){ const near=same.find(r=>{ const rc=this.fsNorm(r.color);
      return rc&&(rc.indexOf(co)>=0||co.indexOf(rc)>=0); }); if(near) return near; }
    const only=same.length===1?same[0]:null;
    return (only&&(!co||!this.fsNorm(only.color)))?only:null; }
  fsOrderQ(g){ const r=this.fsFgRow(g); return r?(Number(r.qty)||0):0; }
  // brandForStyle chi quet don DANG CHAY -> don da qua tuan se ra rong.
  // Dong Ke hoach xuat FG khoa theo (ma hang | PO) va mang san khach hang.
  fsBrand(g){ const r=this.fsFgRow(g); return (r&&r.brand)||this.brandForStyle(g.style)||''; }
  fsShippedQ(g){ const r=this.fsFgRow(g); return r?(Number(r.ship)||0):0; }
  // Cum cac mau dang dung CHUNG mot dong Ke hoach xuat. Moi mau co dong rieng
  // -> cum chi 1 dong. Don chua tach mau -> ca may mau chung 1 dong.
  fsFgKey(g){ const r=this.fsFgRow(g);
    return r?('#'+r.id):('?|'+this.fsNorm(g.style)+'|'+this.fsNorm(g.po)); }
  fsPackedFg(g){ const k=this.fsFgKey(g); let n=0;
    this.finGroups().forEach(x=>{ if(this.fsFgKey(x)===k) n+=this.fsPacked(x); });
    return n; }
  // Ton kho = da dong goi cua cum - da xuat cua chinh dong do
  fsStockQ(g){ return Math.max(0,this.fsPackedFg(g)-this.fsShippedQ(g)); }
  // In so o dong dau cua cum thoi, khong thi may mau chung 1 dong Ke hoach xuat
  // se cong doc theo cot ra gap doi. finGroups() da sap theo ma hang -> PO ->
  // mau nen cac dong cung cum luon lien nhau.
  fsFgHead(rows,i){ const p=rows[i-1];
    return !p||this.fsFgKey(rows[i])!==this.fsFgKey(p); }
  fsRemark(g){ return (this.state.fsRemark||{})[g.key]||''; }
  fsRemarkSet(g,v){ this.setState(s=>({fsRemark:{...(s.fsRemark||{}),[g.key]:v}})); }
  // Thành phẩm sẵn sàng xuất của 1 mã hàng · PO (cộng mọi màu) — nguồn cho F.G Shipment.
  // Truoc doc cong doan 'fg'; bang Finishing Status khong con cot go cho Ui /
  // Kiem cuoi / Nhap kho nen so do se dung 0 mai. Dong goi la moc cuoi con go
  // duoc, va hang da dong goi dung la hang san sang xuat.
  finFgQty(style,po){ let n=0;
    this.finGroups().forEach(g=>{ if(g.style===style&&g.po===po) n+=this.fsPacked(g); });
    return n; }

  renderFinStBody(){
    const h=React.createElement;
    return h('div',{ref:this.scrollRef,className:'yscroll','data-screen-label':'Finishing Status',
      style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('fsTitle','S-07-FINISH-STATUS · UI Proto'),
      this.renderFinStKpis(),
      this.renderFinStTable(),
      this.renderFsScan());
  }
  bcIc(){ const h=React.createElement;
    return h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'currentColor'},
      h('path',{d:'M2 4h2v16H2V4zm3 0h1v16H5V4zm2 0h2v16H7V4zm3 0h1v16h-1V4zm2 0h2v16h-2V4zm3 0h1v16h-1V4zm2 0h2v16h-2V4zm3 0h1v16h-1V4z'})); }
  // Hop thoai quet: o nhap tu focus, may quet go xong tu Enter -> quet lien tuc
  // duoc, moi ma xong thi xoa o nhap va bao ket qua ngay ben duoi.
  renderFsScan(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const g=this.fsScanGroup(); if(!g) return null;
    const close=()=>this.fsScanClose();
    const tot=this.fsBcOf(g).length, done=this.fsScanN(g);
    const pct=tot?Math.min(100,Math.round(done/tot*100)):0;
    const log=this.fsScanLog(g), msg=this.state.fsScanMsg;
    const MC={ok:['#2f7d32','#e6f2e2','#c3ddbe'],
              dup:['#b0791b','#fbf3df','#ecdcb4'],
              bad:['#c0392b','#fdecea','#eccfca']};
    const head=h('div',{style:{padding:'20px 24px 14px',borderBottom:'1px solid '+C.line}},
      h('div',{style:{fontSize:15,fontWeight:700,letterSpacing:'.2px',color:C.ink}},
        this.t('fsScanTitle')),
      h('div',{style:{marginTop:5,fontSize:12.5,color:C.sub,wordBreak:'break-word'}},
        [g.style,g.po,g.color].filter(Boolean).join(' \u00b7 ')),
      h('div',{style:{marginTop:12,display:'flex',alignItems:'baseline',gap:8}},
        h('span',{style:{fontFamily:S.mono,fontSize:19,fontWeight:700,color:C.ink}},
          this.fmt(done)+' / '+this.fmt(tot)),
        h('span',{style:{fontSize:12,color:C.sub}},this.t('fsScanDone'))),
      h('div',{style:{marginTop:8,height:6,borderRadius:3,background:'#e6e9e1',overflow:'hidden'}},
        h('div',{style:{height:'100%',width:pct+'%',background:C.primary,borderRadius:3,
          transition:'width .2s ease'}})));
    const box=h('div',{style:{padding:'16px 24px 0'}},
      h('input',{autoFocus:true,value:this.state.fsScanQ||'',placeholder:this.t('fsScanPh'),
        onChange:e=>this.set({fsScanQ:e.target.value}),
        onKeyDown:e=>{ if(e.key==='Enter'){ e.preventDefault(); this.fsScanTake(g,this.state.fsScanQ); } },
        style:{width:'100%',boxSizing:'border-box',border:'1.5px solid '+C.primary,borderRadius:10,
          padding:'11px 13px',fontSize:15,fontFamily:S.mono,fontWeight:700,letterSpacing:'.5px',
          color:C.ink,background:C.white,outline:'none'}}),
      h('div',{style:{marginTop:6,fontSize:11,color:C.faint}},this.t('fsScanHint')),
      msg?h('div',{style:{marginTop:11,display:'flex',alignItems:'center',gap:8,borderRadius:9,
          padding:'9px 12px',fontSize:12.5,fontWeight:600,
          color:MC[msg.t][0],background:MC[msg.t][1],border:'1px solid '+MC[msg.t][2]}},
        h('span',{style:{fontFamily:S.mono,fontWeight:700}},msg.code),
        h('span',{style:{flex:1,minWidth:0,textAlign:'right'}},
          msg.t==='ok'?(this.t('fsScanOk')+' '+this.fsWhen(msg.ts))
          :msg.t==='dup'?(this.t('fsScanDup')+' '+this.fsWhen(msg.ts))
          :this.t('fsScanBad'))):null);
    const rows=log.map(x=>h('div',{key:x.code,
      style:{display:'flex',alignItems:'center',gap:10,padding:'7px 0',
        borderTop:'1px solid '+C.line}},
      h('span',{style:{flex:1,minWidth:0,fontFamily:S.mono,fontSize:12,fontWeight:700,
        color:C.ink,wordBreak:'break-all'}},x.code),
      h('span',{style:{flex:'none',fontFamily:S.mono,fontSize:11.5,color:C.sub}},
        this.fsWhen(x.ts)),
      h('button',{title:this.t('fsScanUndo'),onClick:()=>this.fsScanDrop(x.code),
        style:{flex:'none',border:'1px solid '+C.border,background:C.white,color:'#c0392b',
          borderRadius:7,padding:'2px 8px',fontSize:11,fontWeight:700,fontFamily:'inherit',
          cursor:'pointer'}},'\u00d7')));
    const list=h('div',{style:{padding:'16px 24px 0'}},
      h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
        color:C.sub}},this.t('fsScanLogL')),
      h('div',{className:'yscroll',style:{marginTop:4,maxHeight:210,overflow:'auto'}},
        log.length?rows:h('div',{style:{padding:'22px 0',textAlign:'center',fontSize:12.5,
          color:C.faint}},this.t('fsScanNone'))));
    const foot=h('div',{style:{display:'flex',justifyContent:'flex-end',marginTop:18,
      padding:'13px 20px',borderTop:'1px solid '+C.line,background:'#f8faf3'}},
      h('button',{onClick:close,style:this.btn('ghost')},this.t('dsoClose')));
    return h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',
        zIndex:60,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),className:'yscroll',
        style:{width:'min(560px,96vw)',maxHeight:'92vh',overflow:'auto',background:C.white,
          borderRadius:16,boxShadow:'0 30px 70px rgba(0,0,0,.32)'}},
        head, box, list, foot));
  }
  renderFinStKpis(){
    const list=this.finGroups(); let inQ=0,packQ=0,shipQ=0; const seen={};
    list.forEach(g=>{ inQ+=g.in; packQ+=this.fsPacked(g);
      // Da xuat la so cua PO -> chi cong 1 lan cho moi (ma hang | PO)
      const k=g.style+'|'+g.po; if(!seen[k]){ seen[k]=1; shipQ+=this.fsShippedQ(g); } });
    const unpack=Math.max(0,inQ-packQ), stock=Math.max(0,packQ-shipQ);
    return this.finKpis([
      [this.t('fsK1'),this.fmtn(inQ),this.t('fsK1s')],
      [this.t('fsK2'),this.fmtn(unpack),this.t('fsK2s'),unpack>0],
      [this.t('fsK3'),this.fmtn(packQ),this.t('fsK3s')],
      [this.t('fsK4'),this.fmtn(stock),this.t('fsK4s')]]);
  }
  // Bang tinh trang hoan thien: 1 dong = 1 (ma hang | PO | mau) da nhan.
  // Cot go tay: DA DONG GOI va GHI CHU -- o nhap luon mo, khong co che do sua
  // rieng, vi bang khong con cot hanh dong.
  // SL DON / DA XUAT / TON KHO la so cua CA PO (Ke hoach xuat FG chi co den
  // cap ma hang | PO, khong tach mau) -> chi in o dong dau cua moi PO.
  renderFinStTable(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const q=this.state.fsQ||'', all=this.finGroups(), rows=this.finGroupList(q);
    const action=h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
        border:'1px solid '+C.border,borderRadius:999,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.fmt(all.length)+' '+this.t('fsCount')),
      this.dfSearchBox(q,v=>this.set({fsQ:v}),false,'fsSearch'));
    // O nhap gon: khong vien, chi gach chan net roi -- giong o ky tren phieu
    const inp=(val,onCh,o)=>h('input',{value:val,placeholder:(o&&o.ph)||'',
      inputMode:(o&&o.num)?'numeric':undefined,size:(o&&o.num)?5:undefined,
      title:(o&&o.title)||undefined,
      onChange:e=>onCh(e.target.value),
      style:{width:'100%',border:'none',background:'none',padding:'2px 0',
        borderBottom:'1px dashed '+((val===''||val==null)?'#c8ccc2':'transparent'),
        textAlign:(o&&o.num)?'right':'left',fontFamily:(o&&o.num)?S.mono:'inherit',
        fontSize:(o&&o.num)?12.5:12,fontWeight:(o&&o.num)?700:500,color:C.ink,outline:'none'}});
    const num=(v,bg,col)=>h('td',{style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,
      fontWeight:700,color:col||C.ink}},v);
    const yday=this.fsYesterday(), today=this.dsoToday();
    const autoTip=this.t('fsPackAuto')+' '+this.FS_PCS_CTN+' '+this.t('fsPcsCtn');
    const body=rows.map((g,i)=>{
      const bg=i%2?'#f7f9f3':C.white, head=this.fsFgHead(rows,i), fg=this.fsFgRow(g);
      const packed=this.fsPacked(g), unpack=this.fsUnpacked(g), packOver=this.fsPackOver(g);
      const packY=this.fsPackDay(g,yday), packT=this.fsPackDay(g,today);
      const ctnO=this.fsCtnOrd(g), ctnP=this.fsCtnPacked(g), ctnU=this.fsCtnUnpacked(g);
      const ctnPk=this.fsCtnPk(g), ctnBc=this.fsCtnBc(g);
      const ctnY=this.fsCtnDay(g,yday), ctnT=this.fsCtnDay(g,today);
      const ctnCap=this.fsCtnCap(g,today), ctnOver=this.fsCtnOver(g);
      const scanT=this.fsScanDay(g,today), scanN=this.fsScanN(g), bcN=this.fsCtnBc(g);
      const ctnTip=this.t('fsCtnTip')
        +(ctnCap!=null?(' \u00b7 '+this.t('fsCtnCap')+' '+this.fmt(ctnCap)):'');
      // Da quet hom nay thi o nay thanh so chi doc: bay 2 con so (o nhap hien
      // phan go tay, cot tong hien ca quet) thi nhin nhu bang tinh sai.
      const ctnMixTip=this.fmt(scanT)+' '+this.t('fsCtnScanT')
        +' + '+this.fmt(this.fsCtnMan(g,today))+' '+this.t('fsCtnManT');
      const order=this.fsOrderQ(g), ship=this.fsShippedQ(g), stock=this.fsStockQ(g);
      // O lay tu Ke hoach xuat FG: in o dong dau cua cum, cac dong sau de trong.
      // Chua do ra dong nao khop ca 3 truong thi de '—' kem chu thich, chu khong
      // in 0 -- 0 la 'co dong, so bang khong', khac han 'chua co dong nao'.
      const po=(v,col)=>h('td',{title:head?this.t(fg?'fsPoTip':'fsNoFgTip'):undefined,
        style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,fontWeight:700,
          color:head?((fg&&v)?(col||C.ink):C.faint):'transparent'}},
        head?(fg?this.fmt(v):'\u2014'):'\u00a0');
      return h('tr',{key:g.key},
        h('td',{style:{...S.td,background:bg,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},
          g.lines.join(', ')||'\u2014'),
        h('td',{style:{...S.td,background:bg,wordBreak:'break-word'}},
          this.fsBrand(g)||'\u2014'),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono,fontWeight:700}},g.style),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono}},g.po),
        h('td',{style:{...S.td,background:bg,wordBreak:'break-word'}},g.color),
        po(order),
        h('td',{title:this.t('fsPackYTip'),style:{...S.td,background:bg,textAlign:'right',
          fontFamily:S.mono,fontWeight:700,color:packY?C.ink:C.faint}},this.fmt(packY)),
        h('td',{title:autoTip,style:{...S.td,background:bg,textAlign:'right',
          fontFamily:S.mono,fontWeight:700,color:packT?C.ink:C.faint}},this.fmt(packT)),
        h('td',{title:this.t(packOver?'fsPackOverTip':'fsPackCTip'),
          style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,fontWeight:700,
            color:packOver?'#c0392b':(packed?C.dark:C.faint)}},this.fmt(packed)),
        num(this.fmt(unpack),bg,unpack?'#b0791b':C.faint),
        ctnPk
          // Packing list la so cua ca PO -> in o dong dau cua cum thoi, y het
          // cot SL DON / DA XUAT / TON KHO. Chip nho ben trai la so barcode.
          ? h('td',{title:head?(this.t('fsCtnOrdPk')
              +(ctnBc?(' · '+this.fmt(ctnBc)+' '+this.t('fgBcN')):'')):undefined,
              style:{...S.td,background:bg,textAlign:'right'}},
              head?h('div',{style:{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:5}},
                ctnBc?h('span',{title:this.t('fsCtnBcTip'),
                  style:{fontSize:9.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
                    border:'1px solid '+C.border,borderRadius:999,padding:'1px 5px'}},
                  this.fmt(ctnBc)):null,
                h('span',{style:{fontFamily:S.mono,fontWeight:700,color:C.dark}},this.fmt(ctnPk)))
              :' ')
          : h('td',{style:{...S.td,background:bg,textAlign:'right'}},
              inp(ctnO?String(ctnO):'',v=>this.fsCtnOrdSet(g,v),
                {num:true,ph:'0',title:this.t('fsCtnOrdTip')})),
        h('td',{title:this.t('fsCtnYTip'),style:{...S.td,background:bg,textAlign:'right',
          fontFamily:S.mono,fontWeight:700,color:ctnY?C.ink:C.faint}},this.fmt(ctnY)),
        scanT
          ? h('td',{title:ctnMixTip,style:{...S.td,background:bg,textAlign:'right',
              fontFamily:S.mono,fontWeight:700,color:C.dark}},this.fmt(ctnT))
          : h('td',{style:{...S.td,background:bg,textAlign:'right'}},
              inp(ctnT?String(ctnT):'',v=>this.fsCtnSet(g,today,v),
                {num:true,ph:'0',title:ctnTip})),
        h('td',{title:this.t(ctnOver?'fsCtnOverTip':'fsCtnCTip'),
          style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,fontWeight:700,
            color:ctnOver?'#c0392b':(ctnP?C.dark:C.faint)}},this.fmt(ctnP)),
        // Con lai cung o cap PO khi so thung do packing list -> chi in dong dau.
        h('td',{title:(!ctnPk||head)?this.t('fsCtnUTip'):undefined,
          style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,fontWeight:700,
            color:(ctnPk&&!head)?'transparent':(ctnU?'#b0791b':C.faint)}},
          (ctnPk&&!head)?'\u00a0':(ctnU==null?'\u2014':this.fmt(ctnU))),
        po(ship,'#1c6b52'),
        po(stock,C.dark),
        h('td',{style:{...S.td,background:bg,minWidth:150}},
          inp(this.fsRemark(g),v=>this.fsRemarkSet(g,v),{ph:this.t('fsRemarkPh')})),
        h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('button',{disabled:!bcN,title:this.t(bcN?'fsScanTip':'fsScanNoBc'),
            onClick:()=>{ if(bcN) this.fsScanShow(g); },
            style:{display:'inline-flex',alignItems:'center',gap:6,borderRadius:8,
              padding:'4px 10px',fontSize:11.5,fontWeight:700,fontFamily:'inherit',
              border:'1px solid '+(bcN?C.primary:C.border),background:bcN?C.tint:C.white,
              color:bcN?C.dark:C.faint,cursor:bcN?'pointer':'not-allowed'}},
            this.bcIc(), this.t('fsScanBtn'),
            bcN?h('span',{style:{fontFamily:S.mono,fontSize:10.5,color:C.sub}},
              this.fmt(scanN)+'/'+this.fmt(bcN)):null)));
    });
    // Tieu de 2 hang. {g,sub} = 1 o om 3 cot con (DA DONG GOI pcs va THUNG DA
    // DONG); cot thuong keo cao ca 2 hang. Thu tu: khoi pcs xong roi den khoi
    // thung, cuoi cung la DA XUAT / TON KHO / GHI CHU.
    // tip la CHUOI da dung san, khong phai khoa i18n -- o HOM NAY cua khoi pcs
    // can chen ca ti le vao chu thich.
    const SUBP=[['fsCPackY',this.t('fsPackYTip')],['fsCPackT',autoTip],
                ['fsCPackC',this.t('fsPackCTip')]];
    const SUBC=[['fsCPackY',this.t('fsCtnYTip')],['fsCPackT',this.t('fsCtnTip')],
                ['fsCPackC',this.t('fsCtnCTip')]];
    const spec=[{k:'fsCLine'},{k:'fsCBrand'},{k:'fsCStyle'},{k:'fsCPo'},{k:'fsCColor'},
      {k:'fsCOrder',r:1},{g:'fsCPacked',gt:autoTip,sub:SUBP},{k:'fsCUnpack',r:1},
      {k:'fsCOrderC',r:1},{g:'fsCPackedC',sub:SUBC},{k:'fsCUnpackC',r:1},
      {k:'fsCShip',r:1},{k:'fsCStock',r:1},{k:'fsCRemark'},{k:'fsCAct'}];
    const nCol=spec.reduce((a,c)=>a+(c.sub?c.sub.length:1),0);
    // Hang 2 phai la 1 mang phang, moi o 1 key rieng -- long mang vao nhau thi
    // React canh bao trung key giua 2 nhom.
    const sub2=[]; spec.forEach(c=>{ if(c.sub) c.sub.forEach(([k,tip],j)=>
      sub2.push([c.g+'-'+j,k,tip])); });
    const tbl=h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'2080px',borderCollapse:'collapse'}},
        h('thead',null,
          h('tr',null, spec.map((c,ci)=>c.sub
            ? h('th',{key:'g'+ci,colSpan:c.sub.length,title:c.gt||undefined,
                style:{...S.th,textAlign:'center',borderBottom:'1px solid '+C.line}},this.t(c.g))
            : h('th',{key:c.k,rowSpan:2,style:{...S.th,...(c.r?{textAlign:'right'}:{}),
                ...(ci===spec.length-1?{borderRight:'none'}:{})}},this.t(c.k)))),
          h('tr',null, sub2.map(([key,k,tip])=>h('th',{key,title:tip,
            style:{...S.th,textAlign:'right',fontSize:10,letterSpacing:'.3px',width:104}},this.t(k))))),
        h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:nCol,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none'}},
          this.t(all.length?'fsNoHit':'fsEmpty'))))));
    return this.dsoCard('fsPanel','fsSub','Finishing Status',tbl,{full:true,action});
  }

  // ---- F.G Shipment Plan ---------------------------------------------------
  // Hạt giống lấy thẳng từ Kế hoạch sản xuất: mỗi (mã hàng · PO) = 1 lô xuất.
  // Cột COLOR gom mọi màu của lô: khóa (mã hàng | PO) dò ra tác nghiệp cắt rồi
  // lấy danh sách màu ở BẢNG TỔNG THEO MÀU, xem fgColors().
  // ETD = ngày kết thúc chuyền + FG_LEAD ngày cho hoàn thiện + kiểm + đóng cont.
  FG_LEAD=7;
  FG_LOAD_LEAD=2;                       // ngày đóng hàng = ETD - 2 ngày
  FG_FACTORY='YIC Hà Nam';
  FG_MODES=['SEA','AIR','EXPRESS','TRUCK'];
  // BẢNG TỔNG THEO MÀU: danh sách màu của tác nghiệp cắt (bỏ nhóm phụ liệu 'aux')
  fgColors(pl){ const out=[];
    ((pl&&pl.sections)||[]).forEach(sec=>{ if(sec.grp==='aux') return;
      const c=String(sec.fab||'').trim(); if(c&&out.indexOf(c)<0) out.push(c); });
    return out; }
  // Dò tác nghiệp cắt của (mã hàng | PO) — cùng cách khớp PO như khcTurns()
  fgPlanFor(style,po){ const plans=this.khcPlansFor(this.genStyleKey(style));
    if(!plans.length) return null;
    const pd=String(po||'').replace(/\D/g,'');
    if(pd){ const hit=plans.find(pl=>{ const q=String(pl.qrPo||pl.po||'').replace(/\D/g,'');
      return q&&(q===pd||q.indexOf(pd)>=0||pd.indexOf(q)>=0); }); if(hit) return hit; }
    return plans[0]; }
  fgSeed(){ const out=[], seen={};
    (this.PS().groups||[]).forEach(g=>(g.rows||[]).forEach(r=>(r.orders||[]).forEach(o=>{
      const style=this.psCode(o.code); if(!style) return;
      const po=this.orderPo(o);
      const k=style+'|'+po; if(seen[k]) return; seen[k]=1;
      const e=this.pd(o.end), etd=new Date(e.getFullYear(),e.getMonth(),e.getDate()+this.FG_LEAD);
      const ld=new Date(etd.getFullYear(),etd.getMonth(),etd.getDate()-this.FG_LOAD_LEAD);
      const cs=this.fgColors(this.psPlan(o)||this.fgPlanFor(style,po));
      out.push({id:'fg'+(out.length+1),brand:this.brandOf(o)||'',season:this.fgSeason(etd),
        factory:this.FG_FACTORY,style,po,color:cs.join(' + '),qty:this.psQty(o)||0,ship:0,
        load:this.psFmtD(ld),etd:this.psFmtD(etd),mode:'SEA',dest:'',cbm:'',note:''}); })));
    return out.sort((a,b)=>String(a.etd).localeCompare(String(b.etd))
      ||String(a.style).localeCompare(String(b.style))||String(a.po).localeCompare(String(b.po))); }
  // Gieo 1 lần khi có Kế hoạch sản xuất; sau đó bảng là dữ liệu người dùng sửa được.
  // Gọi ngoài render (componentDidMount / awaitData) nên setState ở đây là an toàn.
  fgEnsure(){ if(this.state.fgSeeded||(this.state.fgRows||[]).length) return false;
    const rows=this.fgSeed(); if(!rows.length) return false;
    this.set({fgRows:rows,fgSeeded:1}); return true; }
  fgReseed(){ if(!window.confirm(this.t('fgReseedAsk'))) return;
    const rows=this.fgSeed(); this.set({fgRows:rows,fgSeeded:1,fgEdit:null,fgQ:''}); }
  fgAll(){ return this.state.fgRows||[]; }
  // ETD go vao duoc ca 2 dang: '2026-09-10' (trong state) va '10/09/2026' (tren bang)
  fgList(q){ const l=this.fgAll(); q=String(q||'').trim().toLowerCase(); if(!q) return l;
    return l.filter(r=>[r.brand,r.season,r.factory,r.style,r.po,r.color,r.mode,r.dest,
      r.load,this.dsoDay(r.load),r.etd,this.dsoDay(r.etd),r.note]
      .join(' ').toLowerCase().indexOf(q)>=0); }
  fgSet(id,patch){ this.setState(s=>({fgRows:(s.fgRows||[]).map(r=>r.id===id?{...r,...patch}:r)})); }
  fgDel(id){ this.setState(s=>({fgRows:(s.fgRows||[]).filter(r=>r.id!==id),
    fgEdit:s.fgEdit===id?null:s.fgEdit})); }
  fgAdd(){ this.setState(s=>{ const l=s.fgRows||[]; let n=0;
      l.forEach(r=>{ const m=String(r.id).match(/(\d+)$/); if(m) n=Math.max(n,Number(m[1])); });
      const id='fg'+(n+1); this._fgNew=id;
      return {fgRows:[...l,{id,brand:'',season:'',factory:this.FG_FACTORY,style:'',po:'',color:'',
        qty:0,ship:0,load:this.dsoToday(),etd:this.dsoToday(),mode:'SEA',dest:'',cbm:'',note:''}],fgSeeded:1}; });
    setTimeout(()=>{ if(this._mounted&&this._fgNew) this.set({fgEdit:this._fgNew,fgQ:''}); },0); }
  fgNum(v){ return Math.max(0,parseInt(String(v).replace(/[^0-9]/g,''),10)||0); }
  // CBM giữ nguyên chuỗi khi đang gõ (cho phép '1.', '0.05') — chỉ chặn ký tự lạ.
  fgDec(v){ return String(v).replace(/[^0-9.]/g,'').replace(/^\./,'0.').replace(/(\..*)\./g,'$1'); }
  fgCbmTxt(v){ const n=Number(v); return n>0?n.toFixed(2):'—'; }
  fgSeason(d){ const m=d.getMonth()+1;
    return (m<=6?'SS':'AW')+String(d.getFullYear()).slice(-2); }
  fgReadyQty(r){ return this.finFgQty(r.style,r.po); }
  // SL CÂN ĐỐI = SL đã xuất − SL đơn hàng: âm = còn thiếu, dương = xuất vượt.
  fgBal(r){ return (Number(r.ship)||0)-(Number(r.qty)||0); }
  // Tre ETD: con hang chua xuat ma da qua ngay ETD.
  fgLate(r){ return !!(r.etd&&String(r.etd)<this.dsoToday()
    &&(Number(r.ship)||0)<(Number(r.qty)||0)); }
  fgExport(){ const X=window.XLSX; if(!X||!X.utils){ this.fgSay(this.t('mtNoXlsx')); return; }
    const rows=this.fgList(this.state.fgQ||'');
    const head=['fgBrand','fgSeason','fgFactory','fgStyle','fgPo','fgColor','fgQty','fgShipped','fgBal',
      'fgLoad','fgEtd','fgMode','fgDest','fgCbm','fgNote'];
    const aoa=[[this.t('fgTitle')],['YIC HÀ NAM · '+this.todayStamp()],[],head.map(k=>this.t(k))];
    rows.forEach(r=>aoa.push([r.brand||'',r.season||'',r.factory||'',r.style||'',r.po||'',r.color||'',
      Number(r.qty)||0,Number(r.ship)||0,this.fgBal(r),r.load||'',r.etd||'',r.mode||'',r.dest||'',
      Number(r.cbm)||0,r.note||'']));
    const ws=X.utils.aoa_to_sheet(aoa);
    ws['!cols']=[14,10,14,18,12,14,15,16,16,13,13,11,16,8,26].map(w=>({wch:w}));
    const wb=X.utils.book_new(); X.utils.book_append_sheet(wb,ws,'FG Shipment');
    X.writeFile(wb,'YIC-HaNam_FG-Shipment-Plan.xlsx'); }
  fgSay(m){ this.set({fgMsg:m}); clearTimeout(this._fgT);
    this._fgT=setTimeout(()=>{ if(this._mounted) this.set({fgMsg:''}); },4000); }

  // ==========================================================================
  // PACKING LIST + BARCODE cua 1 lo xuat
  // --------------------------------------------------------------------------
  // Khoa theo id dong Ke hoach xuat (ma hang | PO | mau) chu khong theo PO tran:
  // bang Tinh trang hoan thien do nguoc ve dung 1 dong qua fsFgRow(g), nen so
  // thung cua packing list chay thang vao cot SL THUNG DON HANG cua dong do.
  //
  //   fgPk[fgRowId] = {name,at,ctn,rows}   packing list -> TONG SO THUNG
  //   fgBc[fgRowId] = {name,at,list:[...]} danh sach barcode dong thung
  //
  // Barcode phai co packing list truoc: barcode la ma cua tung thung, khong co
  // packing list thi khong biet lo nay dang co bao nhieu thung de doi chieu.
  FG_BC_MAX=20000;                       // tran de khong lam vo localStorage
  fgPkOf(r){ return (this.state.fgPk||{})[r&&r.id]||null; }
  fgBcOf(r){ return (this.state.fgBc||{})[r&&r.id]||null; }
  fgPkCtn(r){ const p=this.fgPkOf(r); return p?(Number(p.ctn)||0):0; }
  // Header do khach hang dat ten, moi noi mot kieu -> quet 12 dong dau tim hang
  // tieu de, khong khop thi tra ve -1 va ben goi tu quyet dinh.
  fgHdr(aoa,PAT){ const n=s=>this.dfFold(s).replace(/\s+/g,' ');
    for(let i=0;i<Math.min((aoa||[]).length,12);i++){ const r=aoa[i]||[], m={};
      r.forEach((c,j)=>{ const v=n(c); if(!v) return;
        PAT.forEach(([f,re])=>{ if(m[f]==null&&re.test(v)) m[f]=j; }); });
      if(Object.keys(m).length) return {hi:i,map:m}; }
    return {hi:-1,map:{}}; }
  // TONG SO THUNG, theo do tin cay giam dan:
  //   1. o ghi ro 'TONG SO THUNG / TOTAL CARTON' -> lay so ben canh
  //   2. cot SO THUNG (carton no) -> dem so thung KHAC NHAU (1 thung nhieu dong size)
  //   3. cot SL THUNG (ctn qty)   -> cong lai
  fgPkParse(aoa){
    const n=s=>this.dfFold(s).replace(/\s+/g,' ');
    const num=v=>{ const s=String(v==null?'':v).replace(/[^0-9.]/g,''); const x=parseFloat(s);
      return isFinite(x)?Math.round(x):0; };
    const TOT=/(tong (so )?(thung|carton|ctn)|total (no of )?(carton|ctn)s?|carton (qty|total)|grand total ctns?)/;
    for(let i=0;i<(aoa||[]).length;i++){ const r=aoa[i]||[];
      for(let j=0;j<r.length;j++){ if(!TOT.test(n(r[j]))) continue;
        for(let k=j+1;k<Math.min(j+5,r.length);k++){ const v=num(r[k]); if(v>0) return {ctn:v,rows:0}; } } }
    const PAT=[['no',/(so thung|carton no|ctn no|carton ?#|ctn ?#|carton number|^carton$|^ctn$)/],
               ['qty',/(sl thung|so luong thung|ctn qty|carton qty|qty ?\/ ?ctn|total ctn|no ?of ?ctn|box qty)/]];
    const {hi,map}=this.fgHdr(aoa,PAT);
    if(hi<0) return {ctn:0,rows:0};
    let rows=0; const seen={}; let sum=0;
    for(let i=hi+1;i<(aoa||[]).length;i++){ const r=aoa[i]||[];
      if(map.no!=null){ const v=String(r[map.no]==null?'':r[map.no]).trim();
        if(v&&!TOT.test(n(v))&&!seen[v]){ seen[v]=1; } }
      if(map.qty!=null){ const q=num(r[map.qty]); if(q>0) sum+=q; }
      if((r||[]).some(c=>String(c==null?'':c).trim()!=='')) rows++; }
    const dis=Object.keys(seen).length;
    return {ctn:dis||sum,rows};
  }
  // Barcode: uu tien cot co tieu de barcode; khong co tieu de thi khong doan bua.
  fgBcParse(aoa){
    const PAT=[['bc',/(barcode|bar code|ma vach|ma so thung|upc|ean|gtin|sscc|scan ?code)/]];
    const {hi,map}=this.fgHdr(aoa,PAT);
    if(hi<0||map.bc==null) return [];
    const out=[], seen={};
    for(let i=hi+1;i<(aoa||[]).length;i++){ const r=aoa[i]||[];
      const v=String(r[map.bc]==null?'':r[map.bc]).trim();
      if(!v||v.length<4||seen[v]) continue; seen[v]=1; out.push(v);
      if(out.length>=this.FG_BC_MAX) break; }
    return out; }
  async fgSheet(file){ const X=window.XLSX;
    if(!X||!X.read){ this.fgSay(this.t('mtNoXlsx')); return null; }
    const buf=await file.arrayBuffer();
    const wb=X.read(new Uint8Array(buf),{type:'array'});
    const ws=wb.Sheets[wb.SheetNames[0]];
    return X.utils.sheet_to_json(ws,{header:1,blankrows:false}); }
  async fgPkImport(r,file){ if(!r||!file) return;
    try{ const aoa=await this.fgSheet(file); if(!aoa) return;
      const got=this.fgPkParse(aoa);
      if(!got.ctn){ this.fgSay(this.t('fgPkNone')); return; }
      this.setState(s=>({fgPk:{...(s.fgPk||{}),
        [r.id]:{name:file.name,at:Date.now(),ctn:got.ctn,rows:got.rows}}}));
      this.fgSay(this.t('fgPkOk')+' '+this.fmt(got.ctn)+' '+this.t('fgPkCtn'));
    }catch(e){ this.fgSay(this.t('mtImportErr')); } }
  async fgBcImport(r,file){ if(!r||!file) return;
    if(!this.fgPkOf(r)){ this.fgSay(this.t('fgBcNeed')); return; }
    try{ const aoa=await this.fgSheet(file); if(!aoa) return;
      const list=this.fgBcParse(aoa);
      if(!list.length){ this.fgSay(this.t('fgBcNone')); return; }
      this.setState(s=>({fgBc:{...(s.fgBc||{}),
        [r.id]:{name:file.name,at:Date.now(),list}}}));
      const cut=list.length>=this.FG_BC_MAX;
      this.fgSay(this.t('fgBcOk')+' '+this.fmt(list.length)+' '+this.t(cut?'fgBcCut':'fgBcN'));
    }catch(e){ this.fgSay(this.t('mtImportErr')); } }
  // Bo packing list thi bo luon barcode -- barcode khong dung mot minh duoc.
  fgPkClear(r){ this.setState(s=>{ const p={...(s.fgPk||{})}, b={...(s.fgBc||{})};
    delete p[r.id]; delete b[r.id]; return {fgPk:p,fgBc:b}; }); }
  fgBcClear(r){ this.setState(s=>{ const b={...(s.fgBc||{})}; delete b[r.id]; return {fgBc:b}; }); }
  // Nut nhap file: label boc input type=file an di -- cung kieu voi Line Setting.
  fgImpBtn(label,title,onFile,on,extra){ const h=React.createElement, C=this.C;
    const st={border:'1px solid '+(on?C.primary:C.border),background:on?C.tint:C.white,
      color:on?C.dark:C.sub,borderRadius:8,padding:'4px 10px',fontSize:11.5,fontWeight:700,
      cursor:'pointer',whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:5,...(extra||{})};
    return h('label',{title,style:st,'style-hover':{background:C.tint}}, label,
      h('input',{type:'file',accept:'.xlsx,.xls,.csv',style:{display:'none'},
        onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(f) onFile(f); }})); }

  // 2 nut nhap file cua 1 lo xuat + so lieu da nhap. Barcode chi mo khi da co
  // packing list; chua co thi hien nut mo nhat, khong bam duoc.
  fgImpCell(r){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const pk=this.fgPkOf(r), bc=this.fgBcOf(r);
    const chip=(txt,title,onX,clrTip)=>h('span',{title,
      style:{display:'inline-flex',alignItems:'center',gap:4,fontSize:10.5,fontWeight:700,
        fontFamily:S.mono,color:C.dark,background:C.tint,border:'1px solid '+C.border,
        borderRadius:999,padding:'2px 4px 2px 8px',whiteSpace:'nowrap'}}, txt,
      h('button',{title:clrTip,onClick:onX,style:{border:'none',background:'none',color:'#c0392b',
        cursor:'pointer',fontSize:13,lineHeight:1,padding:'0 3px',fontFamily:'inherit'}},'×'));
    return h('div',{style:{display:'inline-flex',gap:6,flexWrap:'wrap',alignItems:'center'}},
      this.fgImpBtn(this.t('fgPkImp'),this.t(pk?'fgPkHas':'fgPkTip'),
        f=>this.fgPkImport(r,f),!!pk),
      pk?chip(this.fmt(pk.ctn)+' '+this.t('fgPkCtn'),
        pk.name+' · '+this.dsoSlipWhen(pk.at),()=>this.fgPkClear(r),this.t('fgPkClr')):null,
      pk?this.fgImpBtn(this.t('fgBcImp'),this.t(bc?'fgBcHas':'fgBcTip'),
          f=>this.fgBcImport(r,f),!!bc)
        :h('span',{title:this.t('fgBcNeed'),
            style:{border:'1px dashed '+C.border,background:'none',color:C.faint,borderRadius:8,
              padding:'4px 10px',fontSize:11.5,fontWeight:700,whiteSpace:'nowrap',cursor:'not-allowed'}},
            this.t('fgBcImp')),
      bc?chip(this.fmt((bc.list||[]).length)+' '+this.t('fgBcN'),
        bc.name+' · '+this.dsoSlipWhen(bc.at),()=>this.fgBcClear(r),this.t('fgBcClr')):null);
  }

  renderFgBody(){
    const h=React.createElement;
    return h('div',{ref:this.scrollRef,className:'yscroll','data-screen-label':'F.G Shipment Plan',
      style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('fgTitle','S-08-FG-SHIPMENT · UI Proto'),
      this.renderFgKpis(),
      this.renderFgTable());
  }
  renderFgKpis(){
    const l=this.fgAll(); let qty=0,ship=0,ready=0,late=0;
    l.forEach(r=>{ qty+=Number(r.qty)||0; ship+=Number(r.ship)||0; ready+=this.fgReadyQty(r);
      if(this.fgLate(r)) late++; });
    return this.finKpis([
      [this.t('fgK1'),this.fmtn(qty),this.t('fgK1s')],
      [this.t('fgK2'),this.fmtn(ready),this.t('fgK2s')],
      [this.t('fgK3'),this.fmtn(ship),this.t('fgK3s')],
      [this.t('fgK4'),this.fmtn(late),this.t('fgK4s'),late>0]]);
  }
  renderFgTable(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const q=this.state.fgQ||'', all=this.fgAll(), rows=this.fgList(q);
    const action=h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
      this.state.fgMsg?h('span',{style:{fontSize:11.5,fontWeight:600,color:C.primary,background:C.tint,
        border:'1px solid '+C.border,borderRadius:99,padding:'4px 10px',whiteSpace:'nowrap'}},this.state.fgMsg):null,
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
        border:'1px solid '+C.border,borderRadius:999,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.fmt(all.length)+' '+this.t('fgCount')),
      this.dfSearchBox(q,v=>this.set({fgQ:v}),false,'fgSearch'),
      this.mtBtn(this.t('fgReseed'),()=>this.fgReseed(),{padding:'6px 12px',fontSize:12}),
      this.mtBtn(this.t('exportXls'),()=>this.fgExport(),{color:C.primary,borderColor:C.border,padding:'6px 12px',fontSize:12}));
    const body=rows.map((r,i)=>{
      const ed=this.state.fgEdit===r.id, bg=i%2?'#f7f9f3':C.white;
      const txt=(f,mono)=>ed
        ? h('input',{value:r[f]==null?'':r[f],onChange:e=>this.fgSet(r.id,{[f]:e.target.value}),
            style:{...S.inp,...(mono?{}:{fontFamily:'inherit'})}})
        : (String(r[f]||'').trim()||'—');
      const num=(f)=>ed
        ? h('input',{value:r[f]||'',inputMode:'numeric',onChange:e=>this.fgSet(r.id,{[f]:this.fgNum(e.target.value)}),
            style:{...S.inp,textAlign:'right'}})
        : this.fmt(r[f]);
      const day=(f)=>ed
        ? h('input',{type:'date',value:r[f]||'',onChange:e=>this.fgSet(r.id,{[f]:e.target.value}),style:{...S.inp}})
        : (r[f]?this.dsoDay(r[f]):'—');
      const mode=()=>ed
        ? h('select',{value:r.mode||'',onChange:e=>this.fgSet(r.id,{mode:e.target.value}),
            style:{...S.inp,padding:'4px 6px',cursor:'pointer'}},
            [''].concat(this.FG_MODES).map(m=>h('option',{key:m||'blank',value:m},m||'—')))
        : (String(r.mode||'').trim()||'—');
      const cbm=()=>ed
        ? h('input',{value:r.cbm==null?'':r.cbm,inputMode:'decimal',
            onChange:e=>this.fgSet(r.id,{cbm:this.fgDec(e.target.value)}),style:{...S.inp,textAlign:'right'}})
        : this.fgCbmTxt(r.cbm);
      const cell=(el,extra)=>h('td',{style:{...S.td,background:bg,...(extra||{})}},el);
      return h('tr',{key:r.id},
        cell(i+1,{textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}),
        cell(txt('brand'),{fontWeight:600}),
        cell(txt('season',true),{fontFamily:S.mono,whiteSpace:'nowrap'}),
        cell(txt('factory')),
        cell(txt('style',true),{fontFamily:S.mono,fontWeight:700,color:C.primary}),
        cell(txt('po',true),{fontFamily:S.mono}),
        cell(txt('color')),
        cell(num('qty'),{textAlign:'right',fontFamily:S.mono,fontWeight:700}),
        cell(num('ship'),{textAlign:'right',fontFamily:S.mono,fontWeight:700}),
        cell(this.fmt(this.fgBal(r)),{textAlign:'right',fontFamily:S.mono,fontWeight:600,
          color:this.fgBal(r)<0?'#c0392b':(this.fgBal(r)>0?C.primary:C.faint)}),
        cell(day('load'),{fontFamily:S.mono,whiteSpace:'nowrap'}),
        cell(day('etd'),{fontFamily:S.mono,whiteSpace:'nowrap'}),
        cell(mode(),{fontFamily:S.mono,fontWeight:600,whiteSpace:'nowrap'}),
        cell(txt('dest')),
        cell(cbm(),{textAlign:'right',fontFamily:S.mono}),
        cell(txt('note'),{color:C.sub,wordBreak:'break-word'}),
        h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}},
            ed?this.mtBtn(this.t('lsDone'),()=>this.set({fgEdit:null}),{border:'1px solid '+C.primary,background:C.tint})
              :this.mtBtn(this.t('lsEdit'),()=>this.set({fgEdit:r.id})),
            this.mtBtn(this.t('mtDel'),()=>this.fgDel(r.id),{color:'#c0392b',borderColor:'#eccfca'}),
            this.fgImpCell(r))));
    });
    const cols=[['fgNo',0],['fgBrand',0],['fgSeason',0],['fgFactory',0],['fgStyle',0],['fgPo',0],
      ['fgColor',0],['fgQty',1],['fgShipped',1],['fgBal',1],['fgLoad',0],['fgEtd',0],['fgMode',0],
      ['fgDest',0],['fgCbm',1],['fgNote',0],['mtAct',0]];
    const tbl=h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'2560px',borderCollapse:'collapse'}},
        h('thead',null,h('tr',null,
          cols.map(([k,rt],ci)=>h('th',{key:k,style:{...S.th,
            ...(rt?{textAlign:'right'}:{}),
            ...(ci===0?{textAlign:'center',paddingLeft:8,width:46}:{}),
            ...(ci===cols.length-1?{borderRight:'none'}:{})}},this.t(k))))),
        h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:cols.length,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none'}},
          this.t(all.length?'fgNoHit':'fgEmpty'))))));
    const bodyEl=h('div',null, tbl,
      h('div',{style:{padding:'11px 13px',borderTop:'1px solid '+C.line}},
        this.mtBtn('+ '+this.t('fgAdd'),()=>this.fgAdd(),{color:C.primary,borderColor:C.border})));
    return this.dsoCard('fgPanel','fgSub','F.G Shipment Plan',bodyEl,{full:true,action});
  }

  // ==========================================================================
  // ẢNH CHỤP DỮ LIỆU (localStorage + IndexedDB)
  // --------------------------------------------------------------------------
  // Toàn bộ dữ liệu người dùng của bản prototype nằm ở đúng 2 chỗ:
  //   localStorage['yic.sewplan.v2'] — mọi field trong PERSIST, 1 chuỗi JSON
  //   IndexedDB 'yic.mes'            — store 'alertSound' + 'mlvFile' (Blob/File)
  // snapExport() gói CẢ HAI thành 1 file data/state-seed.js. Thả file đó vào
  // app/data/ rồi gửi nguyên thư mục đi: máy khác mở lên lần đầu sẽ được nạp
  // đúng dữ liệu này (xem seedStorage() ở cuối script.js).
  // ==========================================================================
  SNAP_V=1;
  NOSEED='yic.mes.noseed';
  snapB64(blob){ return new Promise(res=>{ try{ const r=new FileReader();
      r.onload=()=>res(String(r.result||'').split(',')[1]||''); r.onerror=()=>res('');
      r.readAsDataURL(blob); }catch(e){ res(''); } }); }
  snapBlob(b64,type){ try{ const bin=window.atob(b64||'');
      const a=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i);
      return new Blob([a],{type:type||''}); }catch(e){ return new Blob([]); } }
  idbAll(store){ return Promise.all([
      this.idbTx('readonly',st=>st.getAllKeys(),store),
      this.idbTx('readonly',st=>st.getAll(),store)])
    .then(([ks,vs])=>(ks||[]).map((k,i)=>({k,v:(vs||[])[i]}))).catch(()=>[]); }
  snapStores(){ return [this.IDB_STORE,this.IDB_STORE2]; }
  // Đọc SẠCH localStorage (mọi khóa, không chỉ SKEY) + mọi bản ghi trong 2 store
  async snapCollect(){
    const ls={};
    try{ for(let i=0;i<window.localStorage.length;i++){ const k=window.localStorage.key(i);
      if(k!=null&&k!==this.NOSEED) ls[k]=window.localStorage.getItem(k); } }catch(e){}
    const idb={}; const stores=this.snapStores();
    for(let si=0;si<stores.length;si++){ const store=stores[si];
      const list=await this.idbAll(store), out=[];
      for(let i=0;i<list.length;i++){ const it=list[i], b=it.v;
        if(b&&typeof b.arrayBuffer==='function')
          out.push({k:String(it.k),name:b.name||'',type:b.type||'',size:b.size||0,b64:await this.snapB64(b)});
        else out.push({k:String(it.k),json:1,val:it.v===undefined?null:it.v}); }
      idb[store]=out; }
    return {v:this.SNAP_V,stamp:new Date().toISOString(),app:'YIC MES',
      key:this.SKEY,db:this.IDB_NAME,dbv:this.IDB_VER,ls,idb};
  }
  snapCount(s){ let n=0; this.snapStores().forEach(st=>{ n+=(((s&&s.idb)||{})[st]||[]).length; }); return n; }
  snapDownload(name,text,mime){
    try{ const b=new Blob([text],{type:mime||'text/plain;charset=utf-8'});
      const u=URL.createObjectURL(b), a=document.createElement('a');
      a.href=u; a.download=name; document.body.appendChild(a); a.click();
      setTimeout(()=>{ try{ document.body.removeChild(a); }catch(e){} URL.revokeObjectURL(u); },0);
      return true; }catch(e){ return false; } }
  async snapExport(){
    this.snapSay(this.t('snapWork'));
    try{ const s=await this.snapCollect();
      const js='/* YIC MES — ảnh chụp dữ liệu (localStorage + IndexedDB).\n'
        +' * Sinh tự động từ chính ứng dụng — '+s.stamp+'\n'
        +' * '+Object.keys(s.ls).length+' khóa localStorage · '+this.snapCount(s)+' file trong IndexedDB\n'
        +' *\n'
        +' * Đặt file này ở app/data/state-seed.js. Máy nào mở app lần đầu (localStorage\n'
        +' * chưa có dữ liệu) sẽ được nạp đúng dữ liệu trong file này.\n'
        +' */\n'
        +'window.MES_SEED = '+JSON.stringify(s)+';\n';
      this.snapDownload('state-seed.js',js,'text/javascript;charset=utf-8');
      this.snapSay(this.t('snapOk')+' · '+this.kb(js.length));
    }catch(e){ this.snapSay(this.t('snapErr')); } }
  async snapPutIdb(s,wipe){
    const idb=(s&&s.idb)||{}, stores=this.snapStores();
    for(let si=0;si<stores.length;si++){ const store=stores[si], list=idb[store];
      if(!list) continue;
      try{ if(wipe) await this.idbTx('readwrite',st=>st.clear(),store);
        for(let i=0;i<list.length;i++){ const it=list[i];
          const val=it.json?it.val:this.snapBlob(it.b64,it.type);
          await this.idbTx('readwrite',st=>st.put(val,it.k),store); }
      }catch(e){} } }
  async snapApply(s){
    if(!s||!s.ls) return false;
    // Ghi de xong moi reload; chan persist() cua ban cu chen vao giua
    this._wiping=true; clearTimeout(this._pt);
    try{ window.localStorage.clear(); }catch(e){}
    try{ Object.keys(s.ls).forEach(k=>window.localStorage.setItem(k,s.ls[k])); }catch(e){}
    await this.snapPutIdb(s,true);
    window.location.reload(); return true; }
  async snapImport(file){ if(!file) return;
    try{ const txt=await file.text();
      const i=txt.indexOf('{'), j=txt.lastIndexOf('}');
      if(i<0||j<i){ this.snapSay(this.t('snapBad')); return; }
      const s=JSON.parse(txt.slice(i,j+1));
      if(!s||!s.ls){ this.snapSay(this.t('snapBad')); return; }
      if(!window.confirm(this.t('snapAsk'))) return;
      this.snapSay(this.t('snapWork'));
      await this.snapApply(s);
    }catch(e){ this.snapSay(this.t('snapBad')); } }
  snapReset(){ const s=window.MES_SEED;
    if(!s||!s.ls){ this.snapSay(this.t('snapNone')); return; }
    if(!window.confirm(this.t('snapAsk'))) return;
    this.snapApply(s); }
  snapSay(m){ this.set({snapMsg:m}); clearTimeout(this._snT);
    this._snT=setTimeout(()=>{ if(this._mounted) this.set({snapMsg:''}); },6000); }
  snapSize(){ let n=0;
    try{ for(let i=0;i<window.localStorage.length;i++){ const k=window.localStorage.key(i);
      n+=(k||'').length+((window.localStorage.getItem(k)||'').length); } }catch(e){}
    return n; }
  // Khối cuối sidebar: xuất / nhập / về ảnh chụp gốc / xóa sạch
  renderSnapBar(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const seed=window.MES_SEED;
    const b=(label,on,title,extra)=>h('button',{onClick:on,title:title||'',
      style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:8,padding:'5px 9px',
        fontSize:11,fontWeight:700,fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap',...(extra||{})},
      'style-hover':{background:C.tint}},label);
    return h('div',{style:{padding:'13px 16px 0',marginTop:10,borderTop:'1px solid #eff0ec'}},
      h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.6px',color:'#a7ada4',marginBottom:7}},this.t('snapTitle')),
      h('div',{style:{display:'flex',flexWrap:'wrap',gap:6}},
        b(this.t('snapExport'),()=>this.snapExport(),this.t('snapExportTip'),{color:C.primary}),
        h('label',{title:this.t('snapImportTip'),
          style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:8,padding:'5px 9px',
            fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'},'style-hover':{background:C.tint}},
          this.t('snapImport'),
          h('input',{type:'file',accept:'.js,.json,.txt',style:{display:'none'},
            onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(f) this.snapImport(f); }})),
        seed?b(this.t('snapReset'),()=>this.snapReset(),this.t('snapResetTip')):null,
        b(this.t('snapWipe'),()=>this.resetSaved(),this.t('snapWipeTip'),{color:'#c0392b',borderColor:'#eccfca'})),
      h('div',{style:{marginTop:8,fontSize:9.5,fontFamily:mono,color:'#a7ada4',lineHeight:1.6,wordBreak:'break-word'}},
        this.t('snapNow')+' '+this.kb(this.snapSize()),
        h('br'),
        seed?(this.t('snapSeed')+' '+String(seed.stamp||'').slice(0,10)):this.t('snapNone')),
      this.state.snapMsg?h('div',{style:{marginTop:8,fontSize:10.5,fontWeight:600,color:C.dark,
        background:C.tint,border:'1px solid '+C.border,borderRadius:8,padding:'5px 8px',lineHeight:1.4}},this.state.snapMsg):null);
  }

  btn(kind){ const C=this.C; const base={display:'inline-flex',alignItems:'center',gap:7,padding:'9px 14px',borderRadius:10,transition:'background .12s,border-color .12s,box-shadow .12s',fontSize:13,fontWeight:600,fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap'};
    if(kind==='primary') return {...base,background:C.primary,color:'#fff',border:'1px solid '+C.primary};
    return {...base,background:C.white,color:C.ink,border:'1px solid '+C.border}; }
  ic(name){ const h=React.createElement; const p={width:15,height:15,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9};
    if(name==='copy') return h('svg',p,h('rect',{x:9,y:9,width:12,height:12,rx:2}),h('path',{d:'M5 15V5a2 2 0 0 1 2-2h10'}));
    if(name==='doc') return h('svg',p,h('path',{d:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'}),h('path',{d:'M14 2v6h6'}));
    if(name==='up') return h('svg',p,h('path',{d:'M12 15V4M7 9l5-5 5 5'}),h('path',{d:'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'}));
    if(name==='grid') return h('svg',p,h('rect',{x:3,y:3,width:18,height:18,rx:2}),h('path',{d:'M3 9h18M3 15h18M9 3v18M15 3v18'}));
    if(name==='qr') return h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'currentColor'},h('path',{d:'M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v3h-3v-3zm-5 0h3v3h-3v-3zm5 5h3v3h-3v-3zm-5 0h3v3h-3v-3z'}));
    return null;
  }

}

  /* ---- mount ---------------------------------------------------------------- */
  /* Defaults are the ones the canvas fed in through data-props, so the migrated app
     renders identically to the bundle. */
  var PROPS = { primaryColor: '#8FC93A', density: 'Comfortable' };

  /* ---- ảnh chụp dữ liệu ------------------------------------------------------
     data/state-seed.js (nếu có) đặt window.MES_SEED = {ls, idb, …}. Máy nào mở app
     mà localStorage còn trống thì nạp thẳng phần `ls` vào trước khi React dựng
     component — restore() sau đó đọc như dữ liệu người dùng bình thường. Phần blob
     trong IndexedDB nạp bất đồng bộ ở componentDidMount. */
  function seedStorage() {
    var S = window.MES_SEED;
    if (!S || !S.ls) return false;
    try {
      if (window.localStorage.getItem('yic.mes.noseed')) return false;
      if (window.localStorage.getItem(S.key || 'yic.sewplan.v2') != null) return false;
      Object.keys(S.ls).forEach(function (k) { window.localStorage.setItem(k, S.ls[k]); });
      return true;
    } catch (e) { return false; }
  }

  function mount() {
    window.MES_SEED_FIRST = seedStorage();
    var el = document.getElementById('root');
    if (!el) { throw new Error('#root missing from index.html'); }
    var node = React.createElement(Component, PROPS);
    if (RD.createRoot) { RD.createRoot(el).render(node); } else { RD.render(node, el); }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
