/* YIC MES — nen dung chung cho moi module.
 * ---------------------------------------------------------------------------
 * File nay KHONG biet gi ve nghiep vu. No chi lo phan ma ca hai module deu can:
 *
 *   MESRuntime   style-hover, icon(), shell(), DCLogic, mount()
 *   MESCore      lop co so: mau sac, dich VI/EN, sidebar, luu localStorage,
 *                anh chup du lieu, cac ham dinh dang ngay/size, phieu ban giao
 *
 * Module (app/sewing, app/finishing) thua ke MESCore va tu khai:
 *   MOD          {id, key, title, nav, pages}  — ten module, khoa localStorage,
 *                nhom menu, ham ve than tung trang
 *   LMOD         bang dich rieng cua module
 *   PERSIST_MOD  danh sach field cua module can luu lai
 *
 * Nap truoc script.js cua module (xem <module>/index.html).
 */
(function () {
  'use strict';

  var R = window.React, RD = window.ReactDOM;
  if (!R || !RD) { throw new Error('React / ReactDOM must load before core.js'); }

  /* ---- style-hover ------------------------------------------------------------
     Prop `style-hover` duoc bien thanh mot class :hover that. Gia tri phu thuoc
     mau chu de nen rule chi sinh khi dung lan dau, roi cache theo dang chuoi. */
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

  /* `const h = React.createElement` trong cac module lay ban boc nay. */
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

  /* ---- khung trang ---------------------------------------------------------- */
  function icon(size, sw, paths) {
    return React.createElement('svg',
      { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: sw },
      paths.map(function (d, i) { return React.createElement('path', { key: i, d: d }); }));
  }

  /* v.overlays = cac hop thoai / modal cua module, ve truoc phan con lai. */
  function shell(v) {
    var h = React.createElement;
    return h('div', { 'data-kc-root': '', style: { display: 'flex', minHeight: '100vh', width: '100%' } },
      v.sidebarEl, (v.overlays || []),
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

  var DCLogic = class extends R.Component {
    constructor(props) { super(props); this.state = {}; }
    renderVals() { return {}; }
    render() { return shell(this.renderVals() || {}); }
  };

  /* ==========================================================================
     MESCore — phan than cua ca hai module
     ========================================================================== */
  class MESCore extends DCLogic {

  L = {
    vi:{
      bcRoot:'Kế hoạch',
      bcPage:'Kế hoạch may',
      mes:'Hệ thống điều hành sản xuất',
      pageTitle:'Kế Hoạch May / Lắp Ráp',
      help:'Trợ giúp',
      dsoBc:'Sản lượng may hàng ngày',
      dsoSoon:'Bảng sẽ được thiết kế ở bước sau — đang chờ spec chi tiết.',
      dsoAskOk:'Xác nhận giao',
      bgTitle:'PHIẾU BÀN GIAO — May → Hoàn thiện',
      bgStyle:'Mã hàng',
      bgPo:'PO',
      bgColor:'Màu',
      bgLine:'Chuyền',
      bgFrom:'Người giao',
      bgTo:'Người nhận',
      bgName:'Nhập tên…',
      bgProdDay:'Ngày sản xuất',
      bgStatus:'Trạng thái',
      bgPending:'Chờ xác nhận',
      bgSize:'Cỡ',
      bgQty:'Số lượng giao',
      bgTotal:'Tổng nhận',
      bgCum:'Lũy kế đến phiếu này',
      bgCumTip:'Tổng đã giao sang hoàn thiện của mã hàng · PO · màu này, tính đến phiếu này',
      bgSignFrom:'Người giao (May)',
      bgSignTo:'Người nhận (Hoàn thiện)',
      bgPrint:'In / Lưu PDF',
      dsoHanded:'Đã giao',
      bgBack:'Quay lại',
      bgReq:'Bắt buộc',
      bgNeedWho:'Nhập người giao và người nhận trước khi xác nhận',
      dsoClose:'Đóng',
      dfSearch:'Tìm mã lỗi, tên lỗi, nhóm, vị trí…',
      lsEdit:'Sửa',
      lsDone:'Xong',
      mtAct:'Hành động',
      mtNo:'No',
      mtDel:'Xóa',
      mtImportErr:'Không đọc được file.',
      mtNoXlsx:'Thư viện Excel chưa tải xong — thử lại sau vài giây.',
      psCancel:'Hủy',
      resetAsk:'Xóa toàn bộ thay đổi đã lưu và tải lại trang?',
      exportXls:'Xuất Excel',
      tipPlanCol:'Lấy từ đơn hàng trong seed của module — sửa ở sewing/seed.js',
      factory:'NHÀ MÁY',
      left:'còn ',
      fiBc:'Nhận hàng hoàn thiện',
      fsBc:'Tình trạng hoàn thiện',
      fgBc:'Kế hoạch xuất hàng',
      snapTitle:'DỮ LIỆU LOCAL',
      snapExport:'Xuất ảnh chụp',
      snapImport:'Nhập ảnh chụp',
      snapExportTip:'Tải về seed.js của module — gồm toàn bộ localStorage + file trong IndexedDB. Chép đè vào app/<module>/seed.js rồi gửi cả thư mục đi.',
      snapImportTip:'Chọn 1 file seed.js (hoặc .json) để nạp đè dữ liệu hiện tại',
      snapReset:'Về ảnh chụp gốc',
      snapResetTip:'Nạp lại đúng dữ liệu trong app/data/state-seed.js',
      snapWipe:'Xóa sạch',
      snapWipeTip:'Xóa dữ liệu đã lưu và không nạp lại ảnh chụp nữa',
      snapWork:'Đang gói dữ liệu…',
      snapOk:'Đã tải state-seed.js — chép vào app/data/',
      snapErr:'Không gói được dữ liệu',
      snapBad:'File không phải ảnh chụp hợp lệ',
      snapAsk:'Nạp ảnh chụp này sẽ GHI ĐÈ toàn bộ dữ liệu đang có trên máy. Tiếp tục?',
      snapNow:'Đang lưu:',
      snapSeed:'Ảnh chụp gốc:',
      snapNone:'Chưa có ảnh chụp gốc',
      modBack:'Chọn module',
      modSew:'May',
      modFin:'Hoàn thiện' },
    en:{
      bcRoot:'Planning',
      bcPage:'Sewing Schedule',
      mes:'Manufacturing Execution System',
      pageTitle:'Sewing / Assemble Schedule',
      help:'Help',
      dsoBc:'Daily Sewing Output',
      dsoSoon:'Table to be designed next — spec pending.',
      dsoAskOk:'Confirm hand-over',
      bgTitle:'HANDOVER SLIP — Sewing → Finishing',
      bgStyle:'Style',
      bgPo:'PO',
      bgColor:'Colour',
      bgLine:'Line',
      bgFrom:'Handed by',
      bgTo:'Received by',
      bgName:'Enter name…',
      bgProdDay:'Production date',
      bgStatus:'Status',
      bgPending:'Awaiting confirmation',
      bgSize:'Size',
      bgQty:'Qty handed',
      bgTotal:'Total received',
      bgCum:'Cumulative incl. this slip',
      bgCumTip:'Total handed to finishing for this style · PO · colour, up to and including this slip',
      bgSignFrom:'Handed by (Sewing)',
      bgSignTo:'Received by (Finishing)',
      bgPrint:'Print / Save PDF',
      dsoHanded:'Handed over',
      bgBack:'Back',
      bgReq:'Required',
      bgNeedWho:'Enter both names before confirming',
      dsoClose:'Close',
      dfSearch:'Search code, name, category, location…',
      lsEdit:'Edit',
      lsDone:'Done',
      mtAct:'Action',
      mtNo:'No',
      mtDel:'Delete',
      mtImportErr:'Could not read the file.',
      mtNoXlsx:'Excel library still loading — try again in a moment.',
      psCancel:'Cancel',
      resetAsk:'Clear all saved changes and reload the page?',
      exportXls:'Export Excel',
      tipPlanCol:'From the orders in the module seed — edit it in sewing/seed.js',
      factory:'FACTORY',
      left:'left ',
      fiBc:'Finishing In',
      fsBc:'Finishing Status',
      fgBc:'F.G Shipment Plan',
      snapTitle:'LOCAL DATA',
      snapExport:'Export snapshot',
      snapImport:'Import snapshot',
      snapExportTip:'Download the module seed.js — all of localStorage plus every file in IndexedDB. Copy it over app/<module>/seed.js and ship the folder.',
      snapImportTip:'Pick a seed.js (or .json) file to overwrite the current data',
      snapReset:'Back to snapshot',
      snapResetTip:'Reload exactly the data in app/data/state-seed.js',
      snapWipe:'Wipe',
      snapWipeTip:'Clear saved data and stop reloading the bundled snapshot',
      snapWork:'Packing data…',
      snapOk:'state-seed.js downloaded — copy it into app/data/',
      snapErr:'Could not pack the data',
      snapBad:'That file is not a valid snapshot',
      snapAsk:'Loading this snapshot OVERWRITES all data currently on this machine. Continue?',
      snapNow:'Stored now:',
      snapSeed:'Bundled snapshot:',
      snapNone:'No bundled snapshot',
      modBack:'Switch module',
      modSew:'Sewing',
      modFin:'Finishing' },
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
  CURWK = (()=>{ const t=new Date(), d=new Date(t.getFullYear(),t.getMonth(),t.getDate()), all=[];
    Object.values(this.MONTHS).forEach(ws=>ws.forEach(w=>all.push(w)));
    const hit=all.find(k=>{ const r=this.psWeekRange(k); return d>=r[0]&&d<=new Date(r[1].getFullYear(),r[1].getMonth(),r[1].getDate()+1); });
    return hit||all[Math.floor(all.length/2)]; })();
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

  recvTime(ts){ const d=new Date(ts), p=n=>String(n).padStart(2,'0');
    return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+String(d.getFullYear()).slice(-2)+' '+p(d.getHours())+':'+p(d.getMinutes()); }
  pd(s){ const p=String(s).split('-').map(Number); return new Date(p[0],(p[1]||1)-1,p[2]||1); }
  psWeekRange(key){ const parts=String(key).split(' · '); const seg=parts[0].split(' ');
    const mi={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}[seg[0]]||0;
    const y=parseInt(seg[1],10)||2026; const wn=parseInt((parts[1]||'W1').replace('W',''),10)||1;
    const first=new Date(y,mi,1), off=(8-first.getDay())%7;
    const s=new Date(y,mi,1+off+(wn-1)*7); return [s,new Date(y,mi,1+off+(wn-1)*7+5)]; }
  // Chuyền + thương hiệu + mã hàng lấy thẳng từ Kế hoạch sản xuất — LẤY MỌI đơn chạy trong
  // tuần (trước đây chỉ lấy đơn đầu tiên nên chuyền đổi mã giữa tuần bị mất dữ liệu).
  // 1 dòng = 1 chuyền + 1 mã hàng; các đơn cùng mã trên 1 chuyền được gộp SL theo ngày.
  fmt(n){ return (n||0).toLocaleString('en-US'); }
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
  dayLabel(d,i){ return this.state.lang==='vi'?['T2','T3','T4','T5','T6','T7'][i]:d.toUpperCase(); }
  renderLang(){ const h=React.createElement, C=this.C; const langs=[['vi','VI'],['en','EN']];
    return h('div',{style:{display:'inline-flex',border:'1px solid '+C.border,borderRadius:10,overflow:'hidden',height:34}},
      langs.map(([id,label],i)=>{ const on=this.state.lang===id;
        return h('button',{key:id,onClick:()=>this.set({lang:id,edit:null}),title:id==='vi'?'Tiếng Việt':'English',
          style:{border:'none',borderLeft:i?'1px solid '+C.border:'none',padding:'0 12px',fontSize:12.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',background:on?C.primary:C.white,color:on?'#fff':C.sub}},label); })); }

  navPages(){ const out=[]; this.NAVGROUPS.forEach(([,items])=>items.forEach(([,,pg])=>{ if(pg) out.push(pg); })); return out; }

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

  fmtn(n){ n=Number(n)||0; return n%1===0?n.toLocaleString('en-US'):n.toLocaleString('en-US',{maximumFractionDigits:1}); }
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

  kb(n){ n=Number(n)||0; return n>=1048576?((n/1048576).toFixed(1)+' MB'):(Math.max(1,Math.round(n/1024))+' KB'); }
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
  dfFold(s){ return String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim(); }
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
  dsoToday(){ return this.psFmtD(new Date()); }
  dsoDay(d){ const p=String(d||'').split('-'); return p.length>2?(p[2]+'/'+p[1]+'/'+p[0]):String(d||''); }
  dsoHM(d){ const t=d||new Date(), p=n=>String(n).padStart(2,'0');
    return p(t.getHours())+':'+p(t.getMinutes()); }
  // Gio PASS cua tung san pham, theo dung thu tu bam. Bo trong 'day' -> gop MOI
  // ngay cua o size do, sap tang dan. CO Y KHONG ve o bang Daily completion
  // history -- bang do chi tong hop so luong; day la du lieu de truy nguoc.
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
  dsoSlipCum(s){ return s.cum!=null?s.cum
    :(this.dsoHandedTot(s.style,s.po,s.color)+(s.ts?0:s.qty)); }
  // Phieu moi cho 1 dong lich su: giao het phan con lai cua dong do
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
  psFmtD(d){ const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }
  SNAP_V=1;
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
        // Duong ve trang chon module — 2 module la 2 trang roi, 2 kho du lieu roi.
        h('a', { href: '../index.html', style: { display: 'flex', alignItems: 'center', gap: 8,
            margin: '12px 10px 0', padding: '7px 10px', borderRadius: 9, fontSize: 12, fontWeight: 600,
            color: C.sub, textDecoration: 'none' }, 'style-hover': { background: '#f4f6f0' } },
          h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
            strokeWidth: 2 }, h('path', { d: 'M15 18l-6-6 6-6' })), this.t('modBack')),
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
  // Xuat ra dung file <module>/seed.js: giu nguyen phan du lieu nghiep vu cua
  // seed dang chay, thay phan `snapshot` bang anh chup vua thu. Chep de len
  // file cu la may khac mo len thay dung du lieu nay.
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
        + ' * Chep de file nay len app/' + this.MOD.id + '/seed.js. May nao mo module\n'
        + ' * lan dau (localStorage con trong) se duoc nap dung du lieu trong day.\n'
        + ' */\n'
        + 'window.' + this.MOD.seedVar + ' = ' + JSON.stringify(data) + ';\n';
      this.snapDownload('seed.js', js, 'text/javascript;charset=utf-8');
      this.snapSay(this.t('snapOk') + ' · ' + this.kb(js.length));
    } catch (e) { this.snapSay(this.t('snapErr')); }
  }

}

  /* ---- anh chup du lieu ------------------------------------------------------
     <module>/seed.js dat window.<SEEDVAR> = {..., snapshot:{ls, idb, ...}}. Module
     nhat phan `snapshot` ra window.MES_SEED. May nao mo module ma localStorage con
     trong thi nap thang phan `ls` vao truoc khi React dung component — restore()
     sau do doc nhu du lieu nguoi dung binh thuong. Phan blob trong IndexedDB nap
     bat dong bo o componentDidMount. */
  function seedStorage(key) {
    var S = window.MES_SEED;
    if (!S || !S.ls) return false;
    try {
      if (window.localStorage.getItem(key + '.noseed')) return false;
      if (window.localStorage.getItem(S.key || key) != null) return false;
      Object.keys(S.ls).forEach(function (k) { window.localStorage.setItem(k, S.ls[k]); });
      return true;
    } catch (e) { return false; }
  }

  function mount(Cls, props, key) {
    window.MES_SEED_FIRST = seedStorage(key);
    var el = document.getElementById('root');
    if (!el) { throw new Error('#root missing from index.html'); }
    var node = React.createElement(Cls, props);
    if (RD.createRoot) { RD.createRoot(el).render(node); } else { RD.render(node, el); }
  }

  function boot(Cls, props, key) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { mount(Cls, props, key); });
    } else {
      mount(Cls, props, key);
    }
  }

  window.MESRuntime = { React: React, RD: RD, icon: icon, shell: shell, DCLogic: DCLogic, boot: boot };
  window.MESCore = MESCore;
})();
