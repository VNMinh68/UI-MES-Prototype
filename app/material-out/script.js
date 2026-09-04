  /* ---8<--- NEN DUNG CHUNG 1/2 ---8<--- */

/* Nen dung chung cua ca hai module.
 *
 * Doan giua cac moc ---8<--- la BAN COPY giong nhau tung byte trong ca
 * app/sewing/script.js va app/finishing/script.js. Muon sua thi sua
 * build/parts/core-*.js roi chay:
 *
 *     node build/emit.js
 *
 * Sua tay o day thi hai module lech nhau — build/check.js se bao loi.
 *
 * Trong doan nay khong co gi thuoc nghiep vu, chi nhung thu ca hai module deu can:
 *
 *   style-hover, icon(), shell(), DCLogic   khung trang
 *   MESCore                                 lop co so: mau sac, dich VI/EN,
 *                                           sidebar, luu localStorage, anh chup
 *                                           du lieu, phieu ban giao
 *
 * Module (class o duoi) thua ke MESCore va tu khai:
 *   MOD          {id, key, title, nav, pages}  — ten module, khoa localStorage,
 *                nhom menu, ham ve than tung trang
 *   LMOD         bang dich rieng cua module
 *   PERSIST_MOD  danh sach field cua module can luu lai
 */
(function () {
  'use strict';

  var R = window.React, RD = window.ReactDOM;
  if (!R || !RD) { throw new Error('vendor/react.js + vendor/react-dom.js must load before script.js'); }

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

  /* `const h = React.createElement` trong class lay ban boc nay. */
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
      tipPlanCol:'Lấy từ đơn hàng trong seed của module — sửa ở seed.js cùng thư mục',
      left:'còn ',
      fiBc:'Nhận hàng hoàn thiện',
      fsBc:'Tình trạng hoàn thiện',
      fivBc:'Tồn kho hoàn thiện',
      fgBc:'Kế hoạch xuất hàng',
      snapTitle:'DỮ LIỆU LOCAL',
      snapExport:'Xuất ảnh chụp',
      snapImport:'Nhập ảnh chụp',
      snapExportTip:'Tải về seed.js của module — gồm toàn bộ localStorage + file trong IndexedDB. Chép đè lên seed.js cùng thư mục rồi gửi cả thư mục đi.',
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
      tipPlanCol:'From the orders in the module seed — edit seed.js in the same folder',
      left:'left ',
      fiBc:'Finishing In',
      fsBc:'Finishing Status',
      fivBc:'Finishing Inventory',
      fgBc:'F.G Shipment Plan',
      snapTitle:'LOCAL DATA',
      snapExport:'Export snapshot',
      snapImport:'Import snapshot',
      snapExportTip:'Download the module seed.js — all of localStorage plus every file in IndexedDB. Copy it over seed.js in the same folder and ship that folder.',
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

  /* ---8<--- HET NEN DUNG CHUNG 1/2 ---8<--- */

}

  /* ==========================================================================
     XUAT NPL (MATERIAL OUT) — logic rieng cua module
     --------------------------------------------------------------------------
     Hai man hinh, cung mot khung:
       Fabric Out  (page 'fabOut')   — xuat VAI xuong nha cat
       Trims Out   (page 'trimOut')  — xuat PHU LIEU xuong chuyen may

     Du lieu vao: seed.js (window.MATERIAL_SEED) trong cung thu muc.

       fabric / trims -> 1 dong = 1 ma nguyen lieu cua (ma hang | PO)
                         SL CAN sinh tu dinh muc x so san pham cua tac nghiep cat
       issues         -> phieu xuat kho MO-YYYYMMDD-NNN da phat hanh
                         cong lai thanh cot DA XUAT; CON LAI = SL CAN - DA XUAT

     Bam vao 1 dong la mo so phieu xuat cua chinh dong do: xem lai tung to, phat
     hanh to moi, hoac go bo to vua phat nham. Module KHONG doc du lieu cua MAY
     hay HOAN THIEN — moi so lieu deu dong bang trong seed cua chinh no.
     ========================================================================== */
  var SEED = window.MATERIAL_SEED || {};
  window.MES_SEED_DATA = SEED;                 // nguon cho nut "Xuat anh chup"
  window.MES_SEED = SEED.snapshot || null;     // anh chup du lieu nguoi dung (co the null)

class MaterialOut extends MESCore {

  /* Bang dich rieng cua XUAT NPL.
     Hai module cu tach bang dich ra tu ban 1 file (build/emit.js lam viec do);
     module nay khong cat gi tu ban goc nen bang dich cua no viet thang o day.

       mo…   dung chung / bang phu lieu
       mof…  rieng man Fabric Out (so cap vai)
       mr…   rieng hop chon cuon vai de cap
       ms…   rieng to phieu giao nhan xe vai (buoc xac nhan)
       mot…  rieng man Trims Out
       mpt…  rieng hop chon kien phu lieu de xuat
       mts…  rieng to phieu giao nhan phu lieu (buoc xac nhan)                 */
  LMOD = {
    vi:{
      modMat:'Xuất NPL',
      mofBc:'Xuất vải', motBc:'Xuất phụ liệu',
      mofTitle:'Sổ Cấp Vải Cho Nhà Cắt', motTitle:'Xuất Phụ Liệu Xuống Chuyền',
      mofPanel:'Cấp Vải Theo Ngày · Lượt Cắt',
      mofSub:'Mỗi dòng là một lượt cắt. Số yard cần cấp tính từ tác nghiệp cắt — ba cột cuối là kho ghi khi cấp thật.',
      motPanel:'Phụ Liệu Theo Mã Hàng · PO',
      motSub:'Định mức lấy từ danh mục phụ liệu trong seed. Bấm Xuất kho để chọn kiện và phát hành phiếu giao nhận.',
      mofDow:'THỨ', mofDay:'NGÀY', mofItem:'ITEM VẢI', mofTurn:'LƯỢT CẮT',
      mofNeed:'SỐ YARD\nCẦN CẤP', mofAct:'SỐ YARD\nTHỰC CẤP', mofLot:'LOT VẢI', mofRolls:'SỐ CÂY',
      mofNeedTip:'Số sản phẩm của lượt × định mức, cộng đầu bàn — lấy từ tác nghiệp cắt',
      mofActTip:'Số yard kho cấp thật — do phiếu giao nhận ghi vào, bấm Cấp vải để cấp thêm',
      mofLotTip:'Lô vải kho xuất cho lượt cắt này',
      mofRollsTip:'Số cây vải đã cấp',
      mofDiffTip:'Cấp chưa đủ số cần',
      mofLyTip:'lá', mofPcsTip:'sản phẩm', mofConsTip:'yard/sản phẩm',
      mofIssue:'Cấp vải',
      mofCount:'lượt cắt', mofSearch:'Tìm ngày, item vải, mã hàng, màu, lô…',
      mofEmpty:'Chưa có lượt cắt nào — seed của module chưa có tác nghiệp cắt.',
      mofNoHit:'Không có lượt cắt nào khớp từ khóa.',
      mofK1:'LƯỢT CẮT', mofK1s:'Tổng số lượt cắt trong sổ',
      mofK2:'CHỜ CẤP', mofK2s:'Số lượt cắt chưa ghi số thực cấp',
      mofK3:'YARD CẦN CẤP', mofK3s:'Tổng số yard phải cấp cho cả sổ',
      mofK4:'YARD THỰC CẤP', mofK4s:'Tổng số yard đã ghi là cấp thật',
      mrTitle:'Chọn Cuộn Vải Để Cấp',
      mrSub:'Kho vải của đúng mã hàng · item vải · màu này — tick cả dòng là chọn cả cuộn, và cuộn nào đã chọn thì cấp cả cuộn',
      mrNo:'ROLL NO', mrLot:'LOT', mrStyle:'STYLE', mrItem:'FABRIC ITEM', mrColor:'COLOR',
      mrWidth:'WIDTH', mrLoc:'LOCATION', mrLen:'LENGTH', mrIssued:'ISSUED (YARDS)', mrBal:'BALANCE',
      mrCount:'cuộn', mrSearch:'Tìm roll no, lô, vị trí…',
      mrEmpty:'Kho chưa có cuộn nào của mã hàng · item vải · màu này.',
      mrNoHit:'Không có cuộn nào khớp từ khóa.',
      mrRowTip:'Bấm để chọn / bỏ chọn cuộn này',
      mrOut:'Hết', mrOutTip:'Cuộn đã cấp hết, không còn yard nào',
      mrHere:'đã cấp', mrHereTip:'Cuộn này đã cấp cho chính lượt cắt đang mở',
      mrNeed:'CẦN CẤP', mrDone:'ĐÃ CẤP', mrLeft:'CÒN THIẾU',
      mrPicked:'Đã chọn', mrWill:'sẽ cấp',
      mrOverLab:'so với số cần',
      mrOverTip:'Mỗi cuộn được chọn phải cấp cả cuộn, nên tổng vượt số còn thiếu bấy nhiêu yard',
      mrAuto:'Chọn đủ số cần', mrDo:'Cấp cho lượt cắt',
      msTitle:'Phiếu giao nhận xe vải — kho ↔ nhà cắt',
      msOrder:'LƯỢT CẤP', msRelaxOn:'NGÀY XẢ VẢI', msRelaxAt:'GIỜ XẢ',
      msIssueOn:'NGÀY CẤP', msIssueAt:'GIỜ CẤP', msPhD:'dd/mm', msPhT:'hh:mm',
      msRoll:'ROLL #', msRelaxQ:'SL XẢ RA', msIssueQ:'SL THỰC CẤP',
      msAfter:'-/+ SAU CẮT',
      msByHand:'Hệ thống không có số này — ghi tay trên tờ in khi xả vải',
      msRelaxQTip:'Số yard mang ra khỏi kệ để xả vải',
      msIssueQTip:'Số yard thực giao cho nhà cắt — cả cuộn, ghi vào sổ khi xác nhận',
      msAfterTip:'Thừa / thiếu ghi lại sau khi cắt xong, ký tay trên tờ in',
      msIssuer:'NGƯỜI CẤP VẢI', msRecv:'BỘ PHẬN CẮT', msWhMgr:'QL KHO VẢI',
      msCutMgr:'QL NHÀ CẮT', msDir:'GIÁM ĐỐC NHÀ MÁY',
      msIssuerCap:'(người cấp — đã đăng nhập) · Kho vải · ca 1',
      msRecvCap:'(người nhận — đã đăng nhập) · Nhà cắt · ca 1',
      msNameCap:'(họ và tên)', msNamePh:'họ tên',
      msBack:'Quay lại', msOk:'Xác nhận cấp',
      moBrand:'THƯƠNG HIỆU', moStyle:'MÃ HÀNG', moPo:'PO', moColor:'MÀU',
      moTrimCode:'MÃ PHỤ LIỆU', moDesc:'TÊN NGUYÊN LIỆU', moSpec:'QUY CÁCH',
      moCons:'ĐỊNH MỨC', moNeed:'SL CẦN', moStock:'TỒN KHO',
      moOut:'ĐÃ XUẤT', moLeft:'CÒN LẠI', moSt:'TRẠNG THÁI', moSup:'NHÀ CUNG CẤP',
      moPcs:'SL SẢN PHẨM',
      moConsTip:'Định mức nguyên liệu cho 1 sản phẩm',
      moNeedTip:'Định mức × SL sản phẩm × hao — số phải xuất đủ cho lô này',
      moStockTip:'Số đã nhập kho',
      moShortTip:'Tồn kho ít hơn SL cần — kho chưa xuất đủ được',
      moOutTip:'Tổng số lượng trên các phiếu xuất đã phát hành',
      moLeftTip:'SL cần − đã xuất',
      moOverTip:'Đã xuất vượt SL cần',
      moStNew:'Chưa xuất', moStPart:'Xuất một phần', moStDone:'Đã xuất đủ',
      motK1:'DÒNG CHỜ XUẤT', motK1s:'Số dòng chưa xuất đủ SL cần',
      motK2:'THIẾU TỒN KHO', motK2s:'Số dòng có tồn kho ít hơn SL cần',
      motK3:'PHIẾU HÔM NAY', motK3s:'Số phiếu giao nhận phụ liệu phát hành hôm nay',
      motK4:'TỔNG PHIẾU XUẤT', motK4s:'Số phiếu giao nhận phụ liệu đã phát hành',
      moCount:'dòng', moSearch:'Tìm mã hàng, PO, mã NPL, màu…',
      moEmpty:'Chưa có dòng nào — seed của module chưa có nguyên liệu nào.',
      moNoHit:'Không có dòng nào khớp từ khóa.',
      moRowTip:'Bấm để mở sổ phiếu xuất kho của dòng này',
      moIssueBtn:'Xuất kho', moNo:'SỐ PHIẾU',
      mptTitle:'Chọn Kiện Phụ Liệu Để Xuất',
      mptSub:'Kho phụ liệu của đúng dòng này — tick chọn kiện rồi gõ số lượng muốn xuất từ kiện đó',
      mptNo:'PACK #', mptItem:'TRIM ITEM', mptUnit:'UOM', mptQty:'PACK QTY', mptIssued:'ISSUED',
      mptCount:'kiện', mptSearch:'Tìm kiện #, lô, vị trí…',
      mptEmpty:'Kho chưa có kiện nào của dòng phụ liệu này.',
      mptNoHit:'Không có kiện nào khớp từ khóa.',
      mptTake:'SL XUẤT',
      mptTakeTip:'Số lượng muốn xuất từ kiện này — không quá số còn lại trong kiện',
      mptOutTip:'Kiện đã xuất hết, không còn gì trong kiện',
      mptHereTip:'Kiện này đã xuất cho chính dòng đang mở',
      mptOverTip:'Số đang gõ nhiều hơn số dòng này còn cần bấy nhiêu',
      mptDo:'Xuất cho chuyền',
      mtsTitle:'Phiếu giao nhận phụ liệu — kho ↔ chuyền may',
      mtsOutOn:'NGÀY XUẤT', mtsOutAt:'GIỜ XUẤT',
      mtsOutQ:'SL THỰC XUẤT', mtsAfter:'-/+ SAU MAY',
      mtsPackQTip:'Số lượng còn lại trong kiện, mang ra khỏi kệ',
      mtsOutQTip:'Số thực giao cho chuyền may — ghi vào sổ khi xác nhận',
      mtsAfterTip:'Thừa / thiếu ghi lại sau khi may xong, ký tay trên tờ in',
      mtsIssuer:'NGƯỜI XUẤT KHO', mtsRecv:'BỘ PHẬN MAY',
      mtsWhMgr:'QL KHO NPL', mtsProdMgr:'QL SẢN XUẤT',
      mtsIssuerCap:'(người xuất — đã đăng nhập) · Kho phụ liệu · ca 1',
      mtsRecvCap:'(người nhận — đã đăng nhập) · Chuyền may · ca 1',
      mtsOk:'Xác nhận xuất',
    },
    en:{
      modMat:'Material Out',
      mofBc:'Fabric Out', motBc:'Trims Out',
      mofTitle:'Fabric Issue To Cutting', motTitle:'Trims Issue To Sewing',
      mofPanel:'Fabric Issued By Day · Cut Turn',
      mofSub:'One row per cut turn. Yards required come from the cutting plan — the last three columns are what the store actually issued.',
      motPanel:'Trims By Style · PO',
      motSub:'Consumption comes from the materials list in the seed. Hit Issue to pick packs and release a handover record.',
      mofDow:'DAY', mofDay:'DATE', mofItem:'FABRIC ITEM', mofTurn:'CUT TURN',
      mofNeed:'YARDS\nREQUIRED', mofAct:'YARDS\nISSUED', mofLot:'FABRIC LOT', mofRolls:'ROLLS',
      mofNeedTip:'Garments in the turn × consumption, plus end allowance — from the cutting plan',
      mofActTip:'Yards the store actually issued — written by the handover record; hit Issue to add more',
      mofLotTip:'Fabric lot the store issued for this cut turn',
      mofRollsTip:'Rolls issued',
      mofDiffTip:'Less than what was required',
      mofLyTip:'plies', mofPcsTip:'garments', mofConsTip:'yd/garment',
      mofIssue:'Issue',
      mofCount:'cut turns', mofSearch:'Search date, fabric item, style, colour, lot…',
      mofEmpty:'No cut turn yet — the module seed has no cutting plan.',
      mofNoHit:'No cut turn matches the search.',
      mofK1:'CUT TURNS', mofK1s:'Cut turns in the book',
      mofK2:'TO ISSUE', mofK2s:'Cut turns with no issued quantity yet',
      mofK3:'YARDS REQUIRED', mofK3s:'Total yards the book has to issue',
      mofK4:'YARDS ISSUED', mofK4s:'Total yards recorded as issued',
      mrTitle:'Pick Rolls To Issue',
      mrSub:'Rolls in store for this style · fabric item · colour — ticking a row picks the whole roll, and a picked roll is issued whole',
      mrNo:'ROLL NO', mrLot:'LOT', mrStyle:'STYLE', mrItem:'FABRIC ITEM', mrColor:'COLOR',
      mrWidth:'WIDTH', mrLoc:'LOCATION', mrLen:'LENGTH', mrIssued:'ISSUED (YARDS)', mrBal:'BALANCE',
      mrCount:'rolls', mrSearch:'Search roll no, lot, location…',
      mrEmpty:'No roll in store for this style · fabric item · colour.',
      mrNoHit:'No roll matches the search.',
      mrRowTip:'Click to select / deselect this roll',
      mrOut:'Empty', mrOutTip:'This roll is fully issued, nothing left on it',
      mrHere:'issued', mrHereTip:'This roll was already issued to the cut turn you have open',
      mrNeed:'REQUIRED', mrDone:'ISSUED', mrLeft:'STILL SHORT',
      mrPicked:'Selected', mrWill:'will issue',
      mrOverLab:'over what is required',
      mrOverTip:'Every roll picked has to be issued whole, so the total runs over by this many yards',
      mrAuto:'Select enough', mrDo:'Issue to this turn',
      msTitle:'Fabric trolley handover record — warehouse ↔ cutting',
      msOrder:'ISSUE ORDER', msRelaxOn:'RELAXED ON', msRelaxAt:'RELAX TIME',
      msIssueOn:'ISSUED ON', msIssueAt:'ISSUE TIME', msPhD:'dd/mm', msPhT:'hh:mm',
      msRoll:'ROLL #', msRelaxQ:'RELAXED Q.TY', msIssueQ:'ISSUED Q.TY',
      msAfter:'-/+ AFTER CUT',
      msByHand:'Not held by the system — filled in by hand on the printout when the fabric is relaxed',
      msRelaxQTip:'Yards taken off the shelf to relax',
      msIssueQTip:'Yards actually handed to cutting — the whole roll, written to the book on confirm',
      msAfterTip:'Over / short recorded after cutting, signed by hand on the printout',
      msIssuer:'FABRIC ISSUER', msRecv:'CUTTING DEPT.', msWhMgr:'WAREHOUSE MGR.',
      msCutMgr:'CUTTING MGR.', msDir:'FACTORY DIRECTOR',
      msIssuerCap:'(issuer — signed in) · Fabric warehouse · shift 1',
      msRecvCap:'(receiver — signed in) · Cutting · shift 1',
      msNameCap:'(full name)', msNamePh:'name',
      msBack:'Back', msOk:'Confirm issue',
      moBrand:'BRAND', moStyle:'STYLE', moPo:'PO', moColor:'COLOUR',
      moTrimCode:'TRIM CODE', moDesc:'DESCRIPTION', moSpec:'SPEC',
      moCons:'CONS.', moNeed:'REQUIRED', moStock:'IN STOCK',
      moOut:'ISSUED', moLeft:'REMAINING', moSt:'STATUS', moSup:'SUPPLIER',
      moPcs:'GARMENTS',
      moConsTip:'Material consumption for one garment',
      moNeedTip:'Consumption × garments × loss — what this order has to be issued',
      moStockTip:'Quantity received into the store',
      moShortTip:'Stock is below what is required — the store cannot issue it all',
      moOutTip:'Total quantity on the issue slips released so far',
      moLeftTip:'Required − issued',
      moOverTip:'Issued more than required',
      moStNew:'Not issued', moStPart:'Partly issued', moStDone:'Issued',
      motK1:'ROWS TO ISSUE', motK1s:'Rows not yet issued in full',
      motK2:'SHORT ON STOCK', motK2s:'Rows whose stock is below what is required',
      motK3:'SLIPS TODAY', motK3s:'Trims handover records released today',
      motK4:'SLIPS RELEASED', motK4s:'Trims handover records released',
      moCount:'rows', moSearch:'Search style, PO, code, colour…',
      moEmpty:'No row yet — the module seed has no material.',
      moNoHit:'No row matches the search.',
      moRowTip:'Click to open the issue log for this row',
      moIssueBtn:'Issue', moNo:'SLIP NO',
      mptTitle:'Pick Trim Packs To Issue',
      mptSub:'Packs in store for this row — tick a pack, then type how much to issue out of it',
      mptNo:'PACK #', mptItem:'TRIM ITEM', mptUnit:'UOM', mptQty:'PACK QTY', mptIssued:'ISSUED',
      mptCount:'packs', mptSearch:'Search pack #, lot, location…',
      mptEmpty:'No pack in store for this trim row.',
      mptNoHit:'No pack matches the search.',
      mptTake:'QTY TO ISSUE',
      mptTakeTip:'How much to issue out of this pack — never more than it has left',
      mptOutTip:'This pack is fully issued, nothing left in it',
      mptHereTip:'This pack was already issued to the row you have open',
      mptOverTip:'What you typed is this much more than the row still needs',
      mptDo:'Issue to sewing',
      mtsTitle:'Trims handover record — warehouse ↔ sewing',
      mtsOutOn:'ISSUED ON', mtsOutAt:'ISSUE TIME',
      mtsOutQ:'ISSUED Q.TY', mtsAfter:'-/+ AFTER SEWING',
      mtsPackQTip:'Quantity left in the pack, taken off the shelf',
      mtsOutQTip:'Quantity actually handed to sewing — written to the book on confirm',
      mtsAfterTip:'Over / short recorded after sewing, signed by hand on the printout',
      mtsIssuer:'TRIMS ISSUER', mtsRecv:'SEWING DEPT.',
      mtsWhMgr:'TRIMS STORE MGR.', mtsProdMgr:'PRODUCTION MGR.',
      mtsIssuerCap:'(issuer — signed in) · Trims warehouse · shift 1',
      mtsRecvCap:'(receiver — signed in) · Sewing · shift 1',
      mtsOk:'Confirm issue',
    },
  };

  NAVVI = {'MATERIAL OUT':'XUẤT NPL','Fabric Out':'Xuất vải','Trims Out':'Xuất phụ liệu'};

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

  /* ---8<--- NEN DUNG CHUNG 2/2 ---8<--- */

}

  /* ---- anh chup du lieu ------------------------------------------------------
     seed.js dat window.<SEEDVAR> = {..., snapshot:{ls, idb, ...}}. Module nhat phan
     `snapshot` ra window.MES_SEED. May nao mo module ma localStorage con trong thi
     nap thang phan `ls` vao truoc khi React dung component — restore() sau do doc
     nhu du lieu nguoi dung binh thuong. Phan blob trong IndexedDB nap bat dong bo
     o componentDidMount. */
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

  /* ---8<--- HET NEN DUNG CHUNG 2/2 ---8<--- */

  boot(MaterialOut, { primaryColor: '#8FC93A', density: 'Comfortable' }, 'yic.mes.material');
})();
