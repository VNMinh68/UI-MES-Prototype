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
      v.sidebarEl, v.modalEl, v.addLineEl, v.confEl, v.qrModalEl, v.whModalEl,
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
  SHIFTS = (()=>{ const t=['07:30','08:30','09:30','10:30','11:30','12:30','13:30','14:30','15:30','16:30','17:30','18:30']; return t.slice(0,-1).map((x,i)=>x+' – '+t[i+1]); })();
  LUNCH = 4;
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
      page:'gantt', cutTab:'capacity', gsel:null, gz:1, gopen:{}, cap:{}, capTurns:{}, capOrder:null, dragRow:null, multPlain:3, multEmb:6,
      tab:'weekly', openMonth:this.CURWK.split(' · ')[0], week:this.CURWK, lang:'vi',
      weeks,
      edit:null, bedit:null, bform:null, addLine:null, khcPlan:null, qrOpen:null, psDel:{}, psTrash:[], psExtra:{}, psOver:{}, psXL:{}, psXD:{}, conf:null, psAdd:null, psTrashOpen:false, sidebarOpen:false, navOpen:{'PRODUCTION PLAN':true,'DASHBOARD':true,'SEWING':true,'SPREADING / CUTTING':true,'WAREHOUSE':true}, dragOver:false, dayOpen:null, daily:{}, freq:{}, wsc:{}, whOpen:null, whQ:'', whErr:'',
      bundle:this.initBundle((weeks[this.CURWK]||{rows:[]}).rows), wip:{},
      files:[{name:'KH cắt-199-PO10848-CHOT.xlsx',sheets:2},{name:'KH cắt-199-PO10502-HANAM.xlsx',sheets:2},{name:'KH cắt-VW5159-M2-BLK-PO4446+4841.xlsx',sheets:8},{name:'KH cắt-1003117-PO10130.xlsx',sheets:6},{name:'KH cắt-VW5159-M11-CHOT.xlsx',sheets:8}],
    };
    this.state.capTurns=this.allocTurns();
    this.restore();
    this.reconcileWeeks();
  }

  SKEY='yic.sewplan.v2';
  PERSIST=['weeks','week','openMonth','tab','page','cutTab','lang','cap','capTurns','capOrder','multPlain','multEmb','bundle','wip','daily','files','psDel','psTrash','psExtra','psOver','psXL','psXD','navOpen','gz','gopen','khcPlan','freq','wsc'];
  // Mọi thay đổi dữ liệu được lưu lại — refresh vẫn giữ nguyên
  restore(){ try{ const raw=window.localStorage.getItem(this.SKEY); if(!raw) return; const o=JSON.parse(raw)||{};
      this.PERSIST.forEach(k=>{ if(o[k]!==undefined&&o[k]!==null) this.state[k]=o[k]; }); }catch(e){} }
  persist(){ try{ const o={}; this.PERSIST.forEach(k=>{ o[k]=this.state[k]; }); window.localStorage.setItem(this.SKEY,JSON.stringify(o)); }catch(e){} }
  queuePersist(){ clearTimeout(this._pt); this._pt=setTimeout(()=>this.persist(),250); }
  resetSaved(){ if(!window.confirm(this.t('resetAsk'))) return; try{ window.localStorage.removeItem(this.SKEY); }catch(e){} window.location.reload(); }

  SALIAS = {'VW5159':'VW5159-M11','1000199':'FG-1000199','1003117':'FG-1003117'};
  sKey(style){ return this.SALIAS[style]||style; }
  cutColors(style){ return this.CUTCOLORS[this.sKey(style)]||['Black','Navy','Grey']; }
  parseMarker(m){ const o={}; String(m).split('+').forEach(tok=>{ const p=tok.split('/'); const name=(p[0]||'').trim(); if(!name) return; o[name]=(o[name]||0)+(p[1]?(parseInt(p[1],10)||1):1); }); return o; }
  turnSizes(t){ const r=this.parseMarker(t.marker); const o={}; Object.keys(r).forEach(s=>o[s]=r[s]*t.layers); return o; }
  gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; }
  sizeStep(style,ids,s){ const cat=this.cutTurns(style); let g=0; (ids||[]).forEach(id=>{ const t=cat.find(x=>x.id===id); if(!t) return; const r=this.parseMarker(t.marker)[s]||0; if(r>0) g=g?this.gcd(g,t.layers):t.layers; }); return g||1; }
  cutTurns(style,po){ const kt=this.khcTurns(style,po); if(kt) return kt; style=this.sKey(style); if(this.CUTTURNS[style]) return this.CUTTURNS[style]; this._gt=this._gt||{}; if(!this._gt[style]) this._gt[style]=this.buildTurns(style); return this._gt[style]; }
  buildTurns(style){ const sz=this.sizesFor(style); const combos=[sz.slice(1,4),sz.slice(2,5),sz.slice(0,3),sz.slice(3),[sz[Math.floor(sz.length/2)]]].filter(c=>c&&c.length); const lay=[120,118,104,72,40]; return combos.map((cs,i)=>({id:'C'+(i+1),marker:cs.map((s,k)=>k===1?s+'/3':(k===2?s+'/2':s)).join('+'),layers:lay[i]||30})); }
  sumTurns(ids,style){ const cat=this.cutTurns(style); const m={}; (ids||[]).forEach(id=>{ const t=cat.find(x=>x.id===id); if(t){ const ts=this.turnSizes(t); Object.keys(ts).forEach(s=>m[s]=(m[s]||0)+ts[s]); } }); return m; }
  cellFrom(style,ids,sizes,qty){ const ss=this.SORDER.filter(s=>sizes.includes(s)); return {turns:[...ids],sizes:ss,qty:{...qty},turn:ids.join(', '),size:ss.join(', '),supply:ss.map(s=>String(qty[s]||0)).join(', ')}; }
  turnsForSizes(style,sizes){ const cat=this.cutTurns(style); if(!sizes||!sizes.length) return []; const set=new Set(sizes); return cat.filter(t=>{ const ts=this.turnSizes(t); return Object.keys(ts).some(s=>set.has(s)); }); }
  guessQty(style,sz,planQty){ const d=this.demandTarget(style); const tot=Object.values(d).reduce((a,x)=>a+x,0)||1; return Math.max(0,Math.round((planQty||0)*(d[sz]||0)/tot)); }
  demandTarget(style){ const d=this.DEMAND[this.sKey(style)]; if(d) return {...d}; const sz=this.sizesFor(style); const w=[1,4,7,7,4,2,1]; const t={}; sz.forEach((s,i)=>t[s]=(w[i]||1)*180); return t; }
  suggestTurns(style,sizes,qty){ const cat=this.turnsForSizes(style,sizes); if(!cat.length) return [];
    const need={}; (sizes||[]).forEach(s=>need[s]=Number(qty[s])||0); const req=(sizes||[]).filter(s=>need[s]>0);
    if(!req.length) return []; const cur={}; const chosen=[]; let guard=0;
    const belowYellow=()=>req.filter(s=>((cur[s]||0)/need[s])<0.5);
    while(guard++<cat.length){ if(!belowYellow().length) break; let best=null,bestScore=-Infinity;
      cat.forEach(t=>{ if(chosen.includes(t.id)) return; const ts=this.turnSizes(t); let gain=0,waste=0;
        Object.keys(ts).forEach(s=>{ const add=ts[s];
          if(need[s]>0){ const before=cur[s]||0, after=before+add; const bc=Math.min(before/need[s],1), ac=Math.min(after/need[s],1); const w=(before/need[s]<0.5)?3:1; gain+=(ac-bc)*need[s]*w; if(after>need[s]) waste+=Math.min(add,after-need[s])*0.25; }
          else waste+=add; });
        const score=gain-waste; if(score>bestScore){ bestScore=score; best=t; } });
      if(!best||bestScore<=0) break; chosen.push(best.id); const ts=this.turnSizes(best); Object.keys(ts).forEach(s=>cur[s]=(cur[s]||0)+ts[s]); }
    return chosen; }
  genBundle(style,i,planQty){ const cat=this.cutTurns(style); if(!cat.length) return {turns:[],sizes:[],qty:{},turn:'',size:'',supply:''}; const t=cat[i%cat.length]; const ts=this.turnSizes(t); const sizes=this.SORDER.filter(s=>ts[s]); const tot=sizes.reduce((a,s)=>a+ts[s],0)||1; const pq=planQty||tot; const qty={}; sizes.forEach(s=>qty[s]=Math.round(pq*ts[s]/tot)); return this.cellFrom(style,[t.id],sizes,this.effQty(sizes,qty,pq)); }
  initBundle(rows){ const map={}; (rows||[]).slice(0,5).forEach((r,ri)=>{ const cols=this.cutColors(r.style); const col=cols[ri%cols.length]; const days={}; this.DAYS.forEach((d,i)=>{ if(r.days[d]!=null) days[d]=this.genBundle(r.style,i,Number(r.days[d])||0); }); map[r.id]={color:col,days}; }); return map; }
  pickColor(id,color){ const row=this.getWeek().rows.find(r=>r.id===id); if(!row) return;
    this.setState(s=>{ const prev=s.bundle[id]; const days=(prev&&prev.color)?prev.days:{}; return {bundle:{...s.bundle,[id]:{color,days}}}; }); }
  setBundleField(id,day,field,val){ this.setState(s=>{ const bundle={...s.bundle}; const b={...(bundle[id]||{color:'',days:{}})}; const days={...b.days}; const cell={...(days[day]||{turn:'',size:'',supply:''})}; cell[field]=val; days[day]=cell; b.days=days; bundle[id]=b; return {bundle}; }); }
  bundleTotal(id){ const b=this.state.bundle[id]; if(!b||!b.color) return null; let t=0; Object.values(b.days).forEach(c=>{ (String(c.supply||'').match(/\d+/g)||[]).forEach(n=>t+=Number(n)); }); return t; }
  startBEdit(id,day,field){ this.setState({bedit:{id,day,field},edit:null}); }
  sizesFor(style){ return this.SIZES[this.sKey(style)]||this.SIZES._def; }
  effQty(sizes,qty,planQty){ const ss=this.SORDER.filter(s=>(sizes||[]).includes(s)); const out={}; if(!ss.length) return out; let sum=0; for(let i=0;i<ss.length-1;i++){ const q=Math.max(0,Number(qty[ss[i]])||0); out[ss[i]]=q; sum+=q; } out[ss[ss.length-1]]=Math.max(0,(planQty||0)-sum); return out; }
  pruneSizes(sizes,qty,planQty){ let ss=this.SORDER.filter(s=>(sizes||[]).includes(s)); let guard=0; while(guard++<ss.length+1){ const eff=this.effQty(ss,qty,planQty); const keep=ss.filter(s=>(eff[s]||0)>0); if(keep.length===ss.length) break; ss=keep; } return ss; }
  sizeStatus(prod,need,isSel){ if(!isSel) return {fg:'#9aa093',bg:'transparent'}; if((need||0)<=0) return {fg:'#2f7d32',bg:'#e6f2e2'}; const r=(prod||0)/need; if(r>=1) return {fg:'#2f7d32',bg:'#e6f2e2'}; if(r>=0.5) return {fg:'#946200',bg:'#fbf1d5'}; return {fg:'#c0392b',bg:'#fae7e4'}; }
  openBForm(id,day){ const row=this.getWeek().rows.find(r=>r.id===id); const b=this.state.bundle[id]; if(!row||!b||!b.color) return;
    const cell=(b.days&&b.days[day])||{}; let tq, turns;
    if(cell.tq){ tq=JSON.parse(JSON.stringify(cell.tq)); turns=cell.turns?[...cell.turns]:Object.keys(tq); }
    else if(cell.turns&&cell.turns.length&&cell.qty){ turns=[...cell.turns]; tq={}; turns.forEach(tid=>tq[tid]={});
      (cell.sizes||[]).forEach(s=>{ let remain=Number(cell.qty[s])||0; turns.forEach(tid=>{ const {cap,step}=this.turnCap(row.style,tid,s); if(cap<=0||remain<=0) return; const capM=Math.floor(cap/step)*step; let take=Math.round(Math.min(remain,capM)/step)*step; if(take>0){ tq[tid][s]=take; remain-=take; } }); }); }
    else { tq={}; turns=cell.turns?[...cell.turns]:[]; }
    this.setState({bform:{id,day,tq,turns},bedit:null,edit:null}); }
  availFromTurns(style,turns){ return this.sumTurns(turns||[],style); }
  turnCap(style,tid,sz){ const t=this.cutTurns(style).find(x=>x.id===tid); if(!t) return {cap:0,step:1}; const r=this.parseMarker(t.marker)[sz]||0; return {cap:r*t.layers,step:t.layers||1}; }
  tqTotals(tq){ const o={}; Object.keys(tq||{}).forEach(tid=>{ const m=tq[tid]||{}; Object.keys(m).forEach(s=>o[s]=(o[s]||0)+(Number(m[s])||0)); }); return o; }
  toggleTurn(tid){ this.setState(s=>{ const f={...s.bform}; const row=this.getWeek().rows.find(r=>r.id===f.id); const turns=[...(f.turns||[])]; const tq={...(f.tq||{})}; const i=turns.indexOf(tid);
    if(i>=0){ turns.splice(i,1); delete tq[tid]; }
    else { turns.push(tid); const t=row?this.cutTurns(row.style).find(x=>x.id===tid):null; const m={};
      if(t){ const ts=this.turnSizes(t); Object.keys(ts).forEach(sz=>{ const v=Number(ts[sz])||0; if(v>0) m[sz]=v; }); }
      tq[tid]=m; }
    return {bform:{...f,turns,tq}}; }); }
  togglePickSize(tid,sz){ this.setState(s=>{ const f={...s.bform}; const row=this.getWeek().rows.find(r=>r.id===f.id); const tq={...(f.tq||{})}; const m={...(tq[tid]||{})}; if(Object.prototype.hasOwnProperty.call(m,sz)) delete m[sz]; else { const {step}=this.turnCap(row.style,tid,sz); m[sz]=step; } tq[tid]=m; return {bform:{...f,tq}}; }); }
  setSizeQty(tid,sz,v){ this.setState(s=>{ const f={...s.bform}; const row=this.getWeek().rows.find(r=>r.id===f.id); const {cap,step}=this.turnCap(row.style,tid,sz); let val=Math.max(0,parseInt(v,10)||0); val=Math.round(val/step)*step; val=Math.min(val,Math.floor(cap/step)*step); const tq={...(f.tq||{})}; tq[tid]={...(tq[tid]||{}),[sz]:val}; return {bform:{...f,tq}}; }); }
  adjSize(tid,sz,dir){ this.setState(s=>{ const f={...s.bform}; const row=this.getWeek().rows.find(r=>r.id===f.id); const {cap,step}=this.turnCap(row.style,tid,sz); const capM=Math.floor(cap/step)*step; const tq={...(f.tq||{})}; const cur=Number((tq[tid]||{})[sz])||0; let val=Math.max(0,Math.min(cur+dir*step,capM)); tq[tid]={...(tq[tid]||{}),[sz]:val}; return {bform:{...f,tq}}; }); }
  saveBForm(){ const f=this.state.bform; const row=this.getWeek().rows.find(r=>r.id===f.id); const tot=this.tqTotals(f.tq); const sizes=this.SORDER.filter(s=>(tot[s]||0)>0); const cell=this.cellFrom(row.style,f.turns||[],sizes,tot); cell.tq=JSON.parse(JSON.stringify(f.tq||{}));
    this.setState(s=>{ const bundle={...s.bundle}; const bb={...(bundle[f.id]||{color:'',days:{}})}; const days={...bb.days}; days[f.day]=cell; bb.days=days; bundle[f.id]=bb; return {bundle,bform:null}; }); }
  clearBForm(){ const f=this.state.bform; this.setState(s=>{ const bundle={...s.bundle}; const bb={...(bundle[f.id]||{days:{}})}; const days={...bb.days}; delete days[f.day]; bb.days=days; bundle[f.id]=bb; return {bundle,bform:null}; }); }

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
  nextFreeLine(){ const used=new Set(); this.getWeek().rows.forEach(r=>this.parseNums(r.line).forEach(n=>used.add(n)));
    const nums=this.planLineNums(); for(let i=0;i<nums.length;i++) if(!used.has(nums[i])) return nums[i];
    return null; }

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
  PLANCOLS = ['line','brand','style'];
  startEdit(id,col){ if(this.PLANCOLS.includes(col)&&this.planColLocked(id,col)) return;
    this._chainBrand=null;
    const empty=(this.getWeek().rows||[]).filter(r=>r.id!==id&&!r.brand&&!r.style&&!this.rowHasData(r)).map(r=>r.id);
    if(empty.length) this.mutateRows(rows=>rows.filter(r=>!empty.includes(r.id)));
    this.setState({edit:{id,col},bedit:null}); }
  planColLocked(id,col){ const rows=this.getWeek().rows; const r=rows.find(x=>x.id===id); if(!r) return true;
    return this.PLANCOLS.includes(col); }
  rowHasData(r){ return this.DAYS.some(d=>r.days[d]!=null); }
  clearRowLinks(id){ this.setState(s=>{ const bundle={...s.bundle}; delete bundle[id]; const wip={...s.wip}; Object.keys(wip).forEach(k=>{ if(k.endsWith('|'+id)) delete wip[k]; }); return {bundle,wip}; }); }
  dayTaken(r,d){ const ln=this.normName(r.line); const o=this.getWeek().rows.find(x=>x.id!==r.id&&this.normName(x.line)===ln&&x.days[d]!=null); return o||null; }
  stopEdit(){
    if(this._chainBrand){ const id=this._chainBrand; this._chainBrand=null; this.setState({edit:{id,col:'brand'},bedit:null}); return; }
    const empty=(this.getWeek().rows||[]).filter(r=>!r.brand&&!r.style&&!this.rowHasData(r)).map(r=>r.id);
    if(empty.length) this.mutateRows(rows=>rows.filter(r=>!empty.includes(r.id)));
    this.setState({edit:null,bedit:null}); }
  mutateRows(fn){ this.setState(s=>{ const weeks={...s.weeks}; const key=s.week; const wk={...(weeks[key]||{rows:[]})}; wk.rows=this.sortPlan(fn(wk.rows)); delete wk.demo; delete wk.auto; weeks[key]=wk; return {weeks}; }); }
  updateRow(id,patch){ this.mutateRows(rows=>rows.map(r=>r.id===id?{...r,...patch}:r)); }
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
  maxLine(){ const a=this.planLineNums(); return a[a.length-1]; }
  lineCount(){ const s=new Set(); this.getWeek().rows.forEach(r=>this.parseNums(r.line).forEach(n=>s.add(n))); return s.size; }
  addRow(){ const nl=this.nextFreeLine(); if(nl==null) return; const line='Line '+nl; const days={}; this.DAYS.forEach(d=>days[d]=null);
    const id='r'+Date.now(); this.mutateRows(rows=>[...rows,{id,line,brand:'',style:'',days}]); this.setState({edit:{id,col:'line'},bedit:null}); }
  removeRow(id){ this.mutateRows(rows=>rows.filter(r=>r.id!==id)); }
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
  addFiles(list){ const arr=Array.from(list||[]).map(f=>({name:f.name,size:(Math.max(1,Math.round(f.size/1024)))+' KB'})); if(!arr.length) return; this.setState(s=>({files:[...s.files,...arr],page:'cutting',cutTab:'khc'})); }
  // Tải file ngay tại panel tác nghiệp cắt — không nhảy sang trang khác
  addFilesHere(list){ const arr=Array.from(list||[]).map(f=>({name:f.name,size:(Math.max(1,Math.round(f.size/1024)))+' KB'})); if(!arr.length) return; this.setState(s=>({files:[...s.files,...arr]})); }
  removeFile(i){ this.setState(s=>({files:s.files.filter((_,idx)=>idx!==i)})); }
  selectWeek(w){ this.setState({week:w,edit:null,bedit:null},()=>{ setTimeout(()=>{ const sc=this.scrollRef.current, el=this.panelRef.current; if(sc&&el){ const top=el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 16; sc.scrollTo({top,behavior:'smooth'}); } },60); }); }

  L = {
    vi:{ bcRoot:'Kế hoạch', bcPage:'Kế hoạch may', upload:'Tải tác nghiệp cắt', mes:'Hệ thống điều hành sản xuất',
      pageTitle:'Kế Hoạch May / Lắp Ráp', help:'Trợ giúp',
      cutBcPage:'Kế hoạch trải/cắt', cutPageTitle:'Kế Hoạch Trải / Cắt',
      ctab1:'Đơn Đặt Năng Lực Cắt Tuần', ctab2:'Kế Hoạch Cắt Tuần', ctab3:'Tác Nghiệp Cắt',
      kcTb:'LƯỢT CẮT', kcLy:'SỐ LỚP', kcMarker:'SƠ ĐỒ SIZE — SL / LÁ', kcPcs:'TỔNG PCS', kcTagN:'TEM', kcAux:'VẢI PHỤ — LÓT · MEX · BÔNG · DỰNG', kcAuxN:'VẢI PHỤ',
      kcGb:'GB — ghép bàn (cắt chung vải khác)', kcModal:'TEM QR — LƯỢT', kcPrint:'IN TEM', kcClose:'ĐÓNG', kcLop:'LỚP', kcTem:'TEM',
      kcSrcL:'NGUỒN', kcSrcGen:'DỮ LIỆU MẪU', kcSrcFile:'FILE UPLOAD',
      kcBuyer:'KHÁCH', kcStyleL:'MÃ HÀNG', kcTotal:'TỔNG SL', kcTables:'SỐ LƯỢT CẮT', kcTags:'TEM QR', kcGbS:'GHÉP BÀN',
      kcHint:'Bấm vào 1 lượt cắt (bàn) để xem & in tem QR theo từng lớp size — VD bàn có M/3 sẽ ra tem M1 · M2 · M3.',
      capTitle:'Đơn Đặt Năng Lực Cắt Hàng Tuần', capSub:'Weekly Cutting Capacity',
      capK1:'SẢN LƯỢNG CẮT CẦN', capK1s:'pcs phải cắt trong tuần', capK2:'LƯỢT CẮT ĐẶT', capK2s:'bàn cắt đặt cho xưởng cắt',
      capK3:'WIP TỒN Ở CẮT', capK3s:'pcs đang nằm tại cắt', capK4:'TỔNG MAY CẦN', capK4s:'pcs BTP các chuyền cần',
      capLead:'Hàng không in thêu cắt trước 3 ngày · hàng in thêu cắt trước 6 ngày.',
      capX3:'KHÔNG → WIP 1 ngày ×', capX7:'THÊU → WIP 1 ngày ×', capX7tip:'Số ngày cắt trước — sửa trực tiếp', cStt:'STT', cEmb2:'IN THÊU',
      gInfo:'ĐƠN HÀNG', gLine2:'CHUYỀN', gWip:'TÌNH TRẠNG WIP CUTTING', gCalc:'TÍNH SẢN LƯỢNG CẮT', gOrder:'ĐẶT NĂNG LỰC CẮT', gPlan:'KẾ HOẠCH MAY TUẦN (nguồn)',
      cEmb:'THÊU / KHÔNG IN THÊU', cCut:'WIP ĐÃ CẮT', cIss:'ĐÃ CẤP CHUYỀN', cRem:'WIP TỒN CUỐI TUẦN',
      cWip1:'WIP 1 NGÀY', cAhead:'WIP CẦN CẮT TRƯỚC', cSew:'TỔNG MAY CẦN', cOut:'SẢN LƯỢNG CẮT', cTurns:'LƯỢT CẮT', cPo:'PO',
      tCut:'Nhập tay — tổng WIP đã cắt', tIss:'Nhập tay — tổng đã cấp cho chuyền', tRem:'WIP tồn = Tổng WIP đã cắt − Tổng đã cấp cho chuyền',
      tWip1:'SUMIFS ← Nhu Cầu BTP Tuần, cột D “1 NGÀY WIP” · khớp Thương hiệu + Mã hàng + Chuyền',
      tNoBd:'Chưa có dòng khớp bên Nhu Cầu BTP Tuần — đang dùng số gốc của file',
      tAhead:'WIP 1 ngày × số ngày cắt trước (đặt ở thanh ngay trên bảng: KHÔNG / THÊU)',
      tSew:'SUMIFS ← Nhu Cầu BTP Tuần, cột “SỐ LƯỢNG CẦN CẤP” = IF(E+F > A−B; A−B; E+F) · khớp Thương hiệu + Mã hàng + Chuyền',
      tOut:'Sản lượng cắt = Tổng may cần + Tổng WIP cần cắt trước − WIP tồn',
      tTurns:'Lấy từ tác nghiệp cắt. Mã bàn cố định theo dòng — kéo đổi thứ tự không đánh số lại (tránh lệnh cấp BTP trỏ sai bàn).',
      tStt:'Ấn giữ dòng để nhấc lên, kéo lên/xuống để đổi thứ tự cắt — mã bàn giữ nguyên theo dòng', dragHint:'Ấn giữ dòng rồi kéo để đổi thứ tự cắt',
      renumber:'Xếp lại lượt cắt', renumberTip:'Chạy lại thuật toán: lấy lượt cắt từ trên xuống, mỗi chuyền lấy đủ lượt để phủ Sản lượng cắt rồi mới sang chuyền tiếp theo.',
      tCover:'Tổng sản lượng của các lượt cắt (lấy từ tác nghiệp cắt) phải ≥ Sản lượng cắt của dòng.',
      tPo:'Lấy từ tác nghiệp cắt — theo lượt cắt của dòng', tDay:'SUMIFS ← Kế Hoạch May tuần này · khớp Thương hiệu + Mã hàng + Chuyền',
      tEmb:'Bật/tắt THÊU — tính lại số ngày cắt trước', tTotTurns:'Đếm mã bàn cắt trong cột LƯỢT CẮT, bỏ ô trống và "Out of order"',
      capOoo:'Ngừng cắt', capAddTurn:'+ lượt cắt',
      lgMan:'Nhập tay', lgPull:'Lấy từ Nhu Cầu BTP / Kế Hoạch May', lgCalc:'Tự tính',
      cutPlanTitle:'Kế Hoạch Cắt Tuần', cutPlanSub:'Weekly Cutting Schedule',
      cpStyle:'Mã hàng', cpTurn:'Lượt cắt', cpQty:'SL cắt', cpSummary:'TỔNG TUẦN',
      cpR1:'Style', cpR2:'PO', cpR3:'Cutting turn', cpR4:'Total quantity',
      cpOrdered:'LƯỢT ĐÃ ĐẶT', cpSched:'LƯỢT ĐÃ XẾP LỊCH', cpLeftHint:'Lượt đã đặt lấy từ cột LƯỢT CẮT ở tab Đơn Đặt Năng Lực Cắt; phần chưa xếp lịch sẽ được xếp ngày ở bước sau.',
      capExportTip:'Xuất 1 file .xlsx gồm 2 sheet',
      dpTitle:'Kế Hoạch Cắt Ngày', dpSub:'Daily Cutting Plan', dpHeadHint:'Bấm vào cột ngày để mở kế hoạch cắt của ngày đó',
      dpMc:'MÁY CẮT', dpTb:'BÀN TRẢI', dpSeq:'TT CẮT', dpStylePo:'MÃ HÀNG & PO', dpFab:'FABRIC ITEM', dpLay:'LƯỢT CẮT',
      dpAdd:'Xếp lịch cắt', dpJobs:'LỆNH CẮT', dpMach:'MÁY SỬ DỤNG',
      dpDup:'Trùng thứ tự cắt trên cùng máy / bàn', dpDupShort:'Trùng!',
      dpPick:'Chọn mã hàng — PO…', dpPickTurn:'Chọn lượt…', dpHand:'Cắt tay',
      dpMap:'Máy A → Bàn 1·2 · Máy B → Bàn 3·4 · Máy C → Bàn 5·6 · Cắt tay → mọi bàn',
      dpSeqTip:'Nhập tay — thứ tự cắt, không được trùng trên cùng máy/bàn',
      dpFabTip:'Tự điền từ tác nghiệp cắt — ô Tổng của mã hàng', dpLayTip:'Chọn lượt cắt của mã hàng — lấy từ tác nghiệp cắt', dpTot:'Tổng',
      dpDel:'Xóa lệnh cắt', dpClose:'Đóng', dpMcOpt:'Máy', dpTbOpt:'Bàn',
      dpNote:'TT CẮT nhập tay · MÃ HÀNG & PO + LƯỢT CẮT chọn từ tác nghiệp cắt · FABRIC ITEM tự điền theo mã hàng',
      cpNoJobs:'Chưa có lượt cắt trong ngày này', cpTurnU:'lượt',
      cpThis:'TUẦN NÀY', cpNext:'TUẦN TỚI', cpPast:'ĐÃ QUA', cpLines:'CHUYỀN ĐANG HOẠT ĐỘNG', cpTbU:'bàn', cpStyleU:'mã',
      psBc:'Kế hoạch sản xuất', psTitle:'Kế Hoạch Sản Xuất',
      psK1:'ĐƠN HÀNG', psK1s:'đơn trong kế hoạch', psK2:'TỔNG SẢN LƯỢNG', psK2s:'pcs theo kế hoạch',
      psK3:'CHUYỀN CÓ ĐƠN', psK3s:'nội bộ + gia công ngoài', psK4:'KHOẢNG THỜI GIAN', psK4s:'theo file kế hoạch',
      psLine:'CHUYỀN', psIn:'NỘI BỘ', psSub:'GIA CÔNG NGOÀI', psOrdU:'đơn', psToday:'HÔM NAY', psGoToday:'Về hôm nay',
      psZa:'Gọn', psZb:'Vừa', psZc:'Rộng', psLegIn:'Có tác nghiệp cắt',
      psLanes:'làn',
      planFromPs:'Chuyền & mã hàng đồng bộ từ Kế hoạch sản xuất. Cần thêm dòng cho chuyền (đơn giao nhau / làm trùng) thì bấm dấu + ở ô chuyền.',
      kcPiece:'VỊ TRÍ CẮT (PIECE)',
      psHint:'Bấm vào một đơn hàng trên biểu đồ để mở tác nghiệp cắt của đơn đó.',
      psCut:'TỶ LỆ CẮT VẢI THEO MẪU THIẾT KẾ', psUpload:'Tải tác nghiệp cắt cho đơn này', psClose:'Đóng',
      psMaster:'ĐƠN GỐC — MASTER ORDER', psOrderL:'ĐƠN HÀNG', psRatioL:'TỶ LỆ CẮT THEO MÃ', psMatL:'DANH MỤC VẢI', psStartL:'BẮT ĐẦU', psEndL:'KẾT THÚC', psDateHint:'Sửa được — thanh Gantt chạy theo',
      psDelOrd:'Xóa đơn', psRestore:'Đã xóa — bấm để hoàn tác', psTrash:'Thùng rác', psUndoTip:'Xóa đơn — hoàn tác bằng Ctrl+Z hoặc thùng rác', psUndo:'Hoàn tác',
      psUpPlan:'Tải kế hoạch sản xuất', psAddLine:'Chuyền', psAddLineTip:'Thêm chuyền vào kế hoạch sản xuất', psDelLineTip:'Xóa chuyền trống này', psAddTip:'Thêm đơn / tác nghiệp cắt cho chuyền này', psAddTitle:'Thêm tác nghiệp cắt',
      psFStyle:'MÃ HÀNG', psFBrand:'THƯƠNG HIỆU', psFPo:'PO', psFQty:'SỐ LƯỢNG (pcs)', psFStart:'NGÀY BẮT ĐẦU', psFEnd:'NGÀY KẾT THÚC', psFFile:'FILE TÁC NGHIỆP CẮT (.xlsx)',
      psPick:'Chọn file…', psSave:'Lưu đơn', psCancel:'Hủy', psQty:'SẢN LƯỢNG', psCutD:'NGÀY CẮT', psEx:'NGÀY XUẤT (EX)',
      psModeFile:'Chọn file', psModeMan:'Nhập tay',
      psManHint:'Nhập bàn cắt như trong tác nghiệp cắt — mã bàn, số lớp, số lá theo từng size. Số lượng của đơn tính từ bảng này.',
      psManSz:'CHỌN SIZE', psManAdd:'+ Thêm bàn', psManDel:'Xóa bàn', psManTitle:'TÁC NGHIỆP CẮT — NHẬP TAY', psManTot:'TỔNG',
      psManCp:'MÃ MÀU / PO', psManAddCp:'+ mã màu', psManDelCp:'Xóa mã màu', psManColorPh:'mã màu', psManPoPh:'PO',
      psManCpHint:'Mỗi lượt cắt phải có mã màu — 1 lượt có thể ghép tối đa 2 mã màu, mỗi mã màu 1 PO riêng.',
      cfTitle:'Trùng dữ liệu kế hoạch sản xuất', cfSub:'đơn đã có trong kế hoạch — chọn bản muốn giữ',
      cfCur:'ĐANG DÙNG', cfNew:'TỪ FILE', cfKeepAll:'Giữ hết bản đang dùng', cfTakeAll:'Lấy hết từ file', cfApply:'Áp dụng',
      cfFrom:'Đã cập nhật theo file kế hoạch',
      resetSaved:'Đặt lại', resetTip:'Xóa dữ liệu đã lưu trên máy này và tải lại trang', resetAsk:'Xóa toàn bộ thay đổi đã lưu và tải lại trang?',
      kcSumCut:'Σ ĐÃ XẾP', kcNeedRow:'NHU CẦU',
      psNoCut:'Đơn gia công ngoài — tác nghiệp cắt do nhà máy gia công lập, không có bàn cắt nội bộ.',
      psRaw:'DÒNG GỐC TRONG FILE', psSrc:'Nguồn dữ liệu', psCombine:'GHÉP',
      psSum:'BẢNG TỔNG THEO MÀU', psSumC:'MÀU / VẢI', psSumPo:'PO', psSumSt:'MÃ HÀNG', psSumQ:'SỐ LƯỢNG', psSumT:'LƯỢT CẮT', psSumTot:'TỔNG',
      psNoPlan:'Chưa có tác nghiệp cắt cho đơn này — tải file KH cắt (.xlsx) để nạp bàn cắt & tem QR.',
      frBc:'Kế hoạch cấp vải tuần', frTitle:'Kế Hoạch Cấp Vải Tuần', frPanel:'Lệnh Cấp Vải Theo Ngày',
      frSub:'Lấy từ kế hoạch cắt — một ngày có thể cấp cho nhiều lượt cắt',
      frCut:'NGÀY CẮT', frTurn:'LƯỢT CẮT', frStyle:'MÃ HÀNG', frPo:'PO', frColor:'MÀU VẢI', frItem:'ITEM VẢI', frTypeC:'LOẠI VẢI', frNeed:'SỐ YARD CẦN CẤP', frSt:'TRẠNG THÁI',
      frHand:'nhập tay', frAuto:'tự điền', frAdd:'Thêm lượt cấp', frPick:'— Chọn lượt cắt —', frSched:'ĐÃ XẾP LỊCH CẮT', frOrd:'ĐÃ ĐẶT — CHƯA XẾP LỊCH',
      frEmpty:'Chưa có lượt cấp vải trong ngày này', frDel:'Xóa dòng cấp vải', frWait:'CHỜ CẤP', frDone:'ĐỦ',
      frNote:'LƯỢT CẮT sổ xuống chọn từ kế hoạch cắt · MÃ HÀNG · PO · MÀU · ITEM · LOẠI VẢI tự điền theo lượt cắt · SỐ YARD CẦN CẤP điền tay · TRẠNG THÁI lấy từ Kế Hoạch Làm Việc Kho',
      frK1:'LƯỢT CẤP VẢI', frK1s:'lượt cắt trong tuần', frK2:'TỔNG CẦN CẤP', frK2s:'yard', frK3:'ĐÃ CẤP', frK3s:'yard đã quét', frK4:'CÒN THIẾU', frK4s:'yard',
      whBc:'Kế hoạch làm việc kho', whTitle:'Kế Hoạch Làm Việc Kho', whPanel:'Cấp Vải Theo Cây — Quét QR',
      whSub:'Lấy từ Kế Hoạch Cấp Vải Tuần — 3 cột cuối sinh ra từ quét tem QR trên cây vải',
      whReal:'SỐ YARD THỰC CẤP', whLotC:'LOT VẢI', whRollC:'SỐ CÂY', whScan:'QUÉT QR', whScanS:'Quét',
      whStockB:'XEM KHO VẢI', whStockT:'KHO VẢI', whNeedL:'CẦN CẤP', whGotL:'ĐÃ QUÉT', whShortL:'CÒN THIẾU', whOverL:'CẤP THÊM',
      whRollU:'cây', whLotU:'lot', whAvail:'CÒN', whOut:'ĐÃ XUẤT', whMine:'ĐÃ QUÉT', whRollN:'CÂY', whBin:'VỊ TRÍ',
      whAutoB:'Quét tự động đến khi đủ', whInput:'Quét tem QR trên cây vải…', whErrM:'Không tìm thấy cây vải, hoặc cây đã xuất',
      whHint:'Bấm vào cây vải để quét — mỗi cây một tem QR có đủ số Y và số Lot',
      whEmpty:'Chưa có dòng nào từ Kế Hoạch Cấp Vải Tuần', whTotR:'TỔNG TUẦN',
      whNote:'SỐ YARD THỰC CẤP · LOT VẢI · SỐ CÂY sinh ra từ quét QR — mỗi cây rút ra là một dòng bên dưới',
      whK1:'DÒNG CẤP VẢI', whK1s:'dòng trong tuần', whK2:'Y CẦN CẤP', whK2s:'yard', whK3:'Y THỰC CẤP', whK3s:'yard đã quét', whK4:'SỐ CÂY ĐÃ RÚT', whK4s:'cây vải',
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
      addBrand:'+ Thương hiệu', addStyle:'+ Mã hàng', addLineCell:'+ Chuyền',
      tipLine:'Bấm để sửa / xóa chuyền', tipPlanCol:'Lấy từ Kế hoạch sản xuất — sửa ở trang Kế hoạch sản xuất', tipBrand:'Chọn thương hiệu', tipStyle:'Chọn mã hàng', tipDay:'Bấm để nhập số', tipDelLine:'Xóa chuyền',
      phLine:'Chuyền…', phBrand:'Thương hiệu…', phStyle:'Mã hàng…', phStyleFirst:'Chọn thương hiệu trước',
      confirmDel:'Chuyền này đang có dữ liệu — xóa toàn bộ dòng của chuyền?',
      maxLines:'Chuyền này không có trong Kế hoạch sản xuất', dayConflict:'Ngày này đang có mã khác chạy — nhập vào đây sẽ xóa số của mã kia (1 chuyền 1 mã/ngày)',
      tipRepick:'Chọn lại — số liệu ngày của dòng này sẽ bị xóa',
      addStyleRow:'Thêm mã thứ 2 cho chuyền này trong tuần — không cần tạo lại chuyền', addStyleRowS:'+ Mã',
      lineMergeErr:'Chỉ được gộp 2 chuyền liền kề — VD Line 1+2. Không gộp chuyền cách nhau (Line 1+3) hoặc 3 chuyền trở lên.',
      lineDupErr:'Không gộp được: chuyền này đang có dòng riêng trong bảng — xóa hoặc đổi tên dòng đó trước.',
      demandTitle:'Nhu Cầu Sản Lượng Cắt Hàng Tuần', demandSub:'Weekly Cutting Bundle Demand', factory:'NHÀ MÁY',
      grpWip:'TÌNH TRẠNG WIP', grpNext:'NHU CẦU TUẦN TIẾP THEO',
      dA:'TỔNG CẮT CỦA ĐƠN', dB:'TỔNG WIP ĐÃ CẤP', dC:'OUTPUT RA CHUYỀN', dBC:'WIP TỒN CUỐI TUẦN', dD:'1 NGÀY WIP', dE:'WIP CẦN GỐI', dF:'SL DỰ KIẾN TUẦN SAU', dNeed:'SỐ LƯỢNG CẦN CẤP', remark:'GHI CHÚ', addNote:'+ ghi chú',
      tipA:'Tổng yêu cầu cắt — lấy từ tác nghiệp cắt (khớp thương hiệu + mã hàng)', tipB:'Tổng WIP đã cấp — nhập tay', tipC:'Tổng output ra chuyền — nhập tay', tipD:'Sản lượng 1 ngày WIP — nhập tay',
      tipManual:'Nhập tay — bấm để sửa', tipBC:'B − C', tipE:'E = MAX(0, D − B + C). Nếu tồn > 1 ngày WIP thì không cần cấp gối.',
      tipF:'SUMIFS từ Kế Hoạch May tuần này — khớp chuyền + thương hiệu + mã hàng', tipFEst:'Kế Hoạch May chưa có dòng khớp chuyền + thương hiệu + mã hàng', tipNeed:'IF(E+F > A−B, A−B, E+F)', tipNote:'Bấm để ghi chú',
      demandEmpty:'Tuần này chưa có chuyền nào trong Kế Hoạch May.',
      reqSub:'Lệnh Cấp BTP Cắt Theo Tuần', reqNote:'Chuyền & mã hàng đồng bộ từ Kế Hoạch May. Chọn màu (từ tác nghiệp cắt) để mở các ô của dòng.',
      colColor:'MÀU CẮT', pickColor:'Chọn màu…', pickColorFirst:'chọn màu trước', issue:'Cấp BTP', planShort:'KH ', tipIssue:'Cấp BTP cho ô này', tipIssueEdit:'Sửa cấp BTP',
      mTitle:'Cấp BTP theo bàn', mColor:'MÀU CẮT', mPlan:'KẾ HOẠCH (pcs)',
      mStep1:'Chọn lượt cắt (bàn)', mStep1Hint:'có thể chọn nhiều', mStep2:'Chọn size & số lượng cần', mStep2Hint:'mỗi bước = 1 lớp lá · tối đa = số mẫu × lớp',
      mTurn:'LƯỢT CẮT / BÀN', mCuttable:'TỔNG CẮT ĐƯỢC', mBySize:'TỔNG THEO SIZE', mNeeded:'Cần cấp', mCuttable2:'Cắt được',
      mNoTurn:'Chọn ít nhất một lượt cắt ở bước 1 để nhập số lượng theo size.',
      mClear:'Xóa ô', mCancel:'Hủy', mSave:'Lưu cấp BTP', mUpdate:'Cập nhật', mIssue:'Cấp', mNoTurnSel:'Chưa chọn lượt cắt', mTurns:'lượt', mSizes:'size', ply:'lá', plies:'lớp lá', left:'còn ' },
    en:{ bcRoot:'Planning', bcPage:'Sewing Schedule', upload:'Upload cutting order', mes:'Manufacturing Execution System',
      pageTitle:'Sewing / Assemble Schedule', help:'Help',
      cutBcPage:'Spreading / Cutting Schedule', cutPageTitle:'Spreading / Cutting Schedule',
      ctab1:'Weekly Cutting Capacity', ctab2:'Weekly Cutting Schedule', ctab3:'Cutting Plan',
      kcTb:'CUT TURN', kcLy:'LAYERS', kcMarker:'SIZE MARKER — QTY / PLY', kcPcs:'TOTAL PCS', kcTagN:'TAGS', kcAux:'AUX MATERIALS — LINING · MEX · QUILT · FUSIBLE', kcAuxN:'AUX CUTS',
      kcGb:'GB — combined table (plied with another fabric)', kcModal:'QR TAGS — TURN', kcPrint:'PRINT TAGS', kcClose:'CLOSE', kcLop:'LAYERS', kcTem:'TAGS',
      kcSrcL:'SOURCE', kcSrcGen:'SEEDED', kcSrcFile:'UPLOADED',
      kcBuyer:'BUYER', kcStyleL:'STYLE', kcTotal:'TOTAL QTY', kcTables:'CUT TURNS', kcTags:'QR TAGS', kcGbS:'COMBINED',
      kcHint:'Click a cut turn (table) to view & print per-size QR tags — e.g. M/3 yields tags M1 · M2 · M3.',
      capTitle:'Weekly Cutting Capacity', capSub:'Đơn Đặt Năng Lực Cắt Hàng Tuần',
      capK1:'CUTTING OUTPUT NEEDED', capK1s:'pcs to cut this week', capK2:'CUT TURNS ORDERED', capK2s:'cutting tables ordered',
      capK3:'WIP HELD AT CUTTING', capK3s:'pcs sitting in cutting', capK4:'TOTAL SEWING NEED', capK4s:'pcs of bundles lines need',
      capLead:'Plain styles are cut 3 days ahead · embroidered styles 6 days ahead.',
      capX3:'PLAIN → 1-day WIP ×', capX7:'EMBROIDERED → 1-day WIP ×', capX7tip:'Cut-ahead days — editable', cStt:'#', cEmb2:'EMB.',
      gInfo:'ORDER', gLine2:'LINE', gWip:'CUTTING WIP STATUS', gCalc:'CUTTING OUTPUT CALC', gOrder:'CAPACITY ORDER', gPlan:'WEEKLY SEWING SCHEDULE (source)',
      cEmb:'EMBROIDERY / PLAIN', cCut:'WIP CUT', cIss:'ISSUED TO LINE', cRem:'WIP LEFT AT WEEK END',
      cWip1:'1 DAY WIP', cAhead:'WIP TO CUT AHEAD', cSew:'SEWING NEED', cOut:'CUTTING OUTPUT', cTurns:'CUT TURNS', cPo:'PO',
      tCut:'Manual — total WIP already cut', tIss:'Manual — total already issued to the line', tRem:'WIP left = Total WIP cut − Total issued to line',
      tWip1:'SUMIFS ← Weekly Cutting Bundle Demand, column D “1 DAY WIP” · match Brand + Style + Line',
      tNoBd:'No matching row in Weekly Cutting Bundle Demand — showing the file\'s original figure',
      tAhead:'1-day WIP × cut-ahead days (set on the bar just above the table: PLAIN / EMBROIDERED)',
      tSew:'SUMIFS ← Weekly Cutting Bundle Demand, “QTY TO SUPPLY” = IF(E+F > A−B, A−B, E+F) · match Brand + Style + Line',
      tOut:'Cutting output = Total sewing need + WIP to cut ahead − WIP left',
      tTurns:'Taken from the cutting operation list. Board codes stay with their row — dragging never renumbers (so bundle requests keep pointing at the right board).',
      tStt:'Press and hold a row to lift it, drag up/down to change the cutting order — board codes stay with the row', dragHint:'Press and hold a row, then drag to reorder',
      renumber:'Re-allocate turns', renumberTip:'Re-run the allocation: take cut turns top to bottom, filling each line until its cutting output is covered before moving to the next.',
      tCover:'The turns assigned (quantities from the cutting operation) must add up to at least the row cutting output.',
      tPo:'From the cutting operation — by the row\'s cut turns', tDay:'SUMIFS ← this week Sewing Schedule · match Brand + Style + Line',
      tEmb:'Toggle EMBROIDERED — recalculates the cut-ahead days', tTotTurns:'Counts cut table codes in CUT TURNS, skipping blanks and "Out of order"',
      capOoo:'Out of order', capAddTurn:'+ cut turn',
      lgMan:'Manual entry', lgPull:'Pulled from Bundle Demand / Sewing Schedule', lgCalc:'Auto-calculated',
      cutPlanTitle:'Weekly Cutting Schedule', cutPlanSub:'Kế Hoạch Cắt Tuần',
      cpStyle:'Style', cpTurn:'Turn', cpQty:'Qty', cpSummary:'WEEK TOTAL',
      cpR1:'Style', cpR2:'PO', cpR3:'Cutting turn', cpR4:'Total quantity',
      cpOrdered:'TURNS ORDERED', cpSched:'TURNS SCHEDULED', cpLeftHint:'Turns ordered comes from the CUT TURNS column on the Capacity Order tab; the remaining turns get their day assigned in a later step.',
      capExportTip:'Exports one .xlsx with 2 sheets',
      dpTitle:'Daily Cutting Plan', dpSub:'Kế Hoạch Cắt Ngày', dpHeadHint:'Click a day column to open that day\'s cutting plan',
      dpMc:'CUTTING MACHINE', dpTb:'SPREADING TABLE', dpSeq:'SEQ', dpStylePo:'STYLE & PO', dpFab:'FABRIC ITEM', dpLay:'CUT TURN',
      dpAdd:'Schedule a cut', dpJobs:'CUT JOBS', dpMach:'MACHINES USED',
      dpDup:'Duplicate cutting sequence on the same machine / table', dpDupShort:'Dup!',
      dpPick:'Pick style — PO…', dpPickTurn:'Pick turn…', dpHand:'Hand cut',
      dpMap:'Machine A → Table 1·2 · Machine B → Table 3·4 · Machine C → Table 5·6 · Hand cut → any table',
      dpSeqTip:'Manual — cutting sequence, must be unique per machine/table',
      dpFabTip:'Auto-filled from the cutting order — the style\'s “Tổng” cell', dpLayTip:'Pick the style\'s cut turn — from the cutting order', dpTot:'Total',
      dpDel:'Remove cut job', dpClose:'Close', dpMcOpt:'Mach.', dpTbOpt:'Table',
      dpNote:'SEQ typed manually · STYLE & PO + CUT TURN picked from the cutting order · FABRIC ITEM auto-fills from the style',
      cpNoJobs:'No cut turns this day', cpTurnU:'turns',
      cpThis:'THIS WEEK', cpNext:'NEXT WEEK', cpPast:'PAST', cpLines:'ACTIVE LINES', cpTbU:'tables', cpStyleU:'styles',
      psBc:'Production Plan', psTitle:'Production Plan',
      psK1:'ORDERS', psK1s:'orders in the plan', psK2:'TOTAL OUTPUT', psK2s:'pcs planned',
      psK3:'ACTIVE LINES', psK3s:'in-house + subcontract', psK4:'PLAN WINDOW', psK4s:'from schedule file',
      psLine:'LINE', psIn:'IN-HOUSE', psSub:'SUBCONTRACT', psOrdU:'orders', psToday:'TODAY', psGoToday:'Jump to today',
      psZa:'Compact', psZb:'Medium', psZc:'Wide', psLegIn:'In-house — has cutting plan',
      psLanes:'lanes',
      planFromPs:'Lines & styles sync from the Production Plan. Need an extra row for a line (overlapping / duplicated orders)? Use the + on the line cell.',
      kcPiece:'CUT PIECE',
      psHint:'Click an order bar to open its cutting plan.',
      psCut:'STYLE CUTTING RATIO', psUpload:'Upload cutting plan for this order', psClose:'Close',
      psMaster:'MASTER ORDER', psOrderL:'ORDER', psRatioL:'STYLE CUTTING RATIO', psMatL:'MATERIAL LIST', psStartL:'START', psEndL:'END', psDateHint:'Editable — the Gantt bar follows',
      psDelOrd:'Delete order', psRestore:'Deleted — click to restore', psTrash:'Trash', psUndoTip:'Delete order — undo with Ctrl+Z or the trash', psUndo:'Restore',
      psUpPlan:'Upload production plan', psAddLine:'Line', psAddLineTip:'Add a line to the production plan', psDelLineTip:'Remove this empty line', psAddTip:'Add an order / cutting plan for this line', psAddTitle:'Add cutting plan',
      psFStyle:'STYLE', psFBrand:'BRAND', psFPo:'PO', psFQty:'QUANTITY (pcs)', psFStart:'START DATE', psFEnd:'END DATE', psFFile:'CUTTING PLAN FILE (.xlsx)',
      psPick:'Choose file…', psSave:'Save order', psCancel:'Cancel', psQty:'QUANTITY', psCutD:'CUT DATE', psEx:'EX DATE',
      psModeFile:'Pick a file', psModeMan:'Type it in',
      psManHint:'Enter cut turns just like the cutting plan — table code, layers, plies per size. The order quantity comes from this table.',
      psManSz:'PICK SIZES', psManAdd:'+ Add turn', psManDel:'Remove turn', psManTitle:'CUTTING PLAN — ENTERED BY HAND', psManTot:'TOTAL',
      psManCp:'COLOUR / PO', psManAddCp:'+ colour', psManDelCp:'Remove colour', psManColorPh:'colour code', psManPoPh:'PO',
      psManCpHint:'Every cut turn needs a colour code — a turn may combine up to 2 colour codes, each with its own PO.',
      cfTitle:'Production plan conflicts', cfSub:'orders already in the plan — pick which one to keep',
      cfCur:'IN USE', cfNew:'FROM FILE', cfKeepAll:'Keep all current', cfTakeAll:'Take all from file', cfApply:'Apply',
      cfFrom:'Updated from the uploaded plan',
      resetSaved:'Reset', resetTip:'Clear data saved on this machine and reload', resetAsk:'Clear all saved changes and reload the page?',
      kcSumCut:'Σ PLANNED', kcNeedRow:'DEMAND',
      psNoCut:'Subcontracted order — the cutting plan is issued by the subcontractor, no in-house cut tables.',
      psRaw:'SOURCE ROW IN FILE', psSrc:'Data source', psCombine:'COMB',
      psSum:'SUMMARY BY COLOUR', psSumC:'COLOUR / FABRIC', psSumPo:'PO', psSumSt:'STYLE', psSumQ:'QUANTITY', psSumT:'CUT TURNS', psSumTot:'TOTAL',
      psNoPlan:'No cutting plan for this order yet — upload the KH cắt (.xlsx) file to load cut tables & QR tags.',
      frBc:'Weekly Fabric Request', frTitle:'Weekly Fabric Request', frPanel:'Fabric Issue Orders By Day',
      frSub:'Pulled from the cutting plan — one day can serve several cut turns',
      frCut:'CUT DATE', frTurn:'CUT TURN', frStyle:'STYLE', frPo:'PO', frColor:'FABRIC COLOUR', frItem:'FABRIC ITEM', frTypeC:'FABRIC TYPE', frNeed:'YARDS REQUIRED', frSt:'STATUS',
      frHand:'typed in', frAuto:'auto', frAdd:'Add request line', frPick:'— Pick a cut turn —', frSched:'SCHEDULED FOR CUTTING', frOrd:'ORDERED — NOT SCHEDULED',
      frEmpty:'No fabric request on this day', frDel:'Remove request line', frWait:'PENDING', frDone:'COVERED',
      frNote:'CUT TURN picked from the cutting plan · STYLE · PO · COLOUR · ITEM · TYPE auto-fill from the turn · YARDS REQUIRED typed in · STATUS comes from Weekly Working Warehouse',
      frK1:'REQUEST LINES', frK1s:'cut turns this week', frK2:'TOTAL REQUIRED', frK2s:'yards', frK3:'ISSUED', frK3s:'yards scanned', frK4:'SHORT', frK4s:'yards',
      whBc:'Weekly Working Warehouse', whTitle:'Weekly Working Warehouse', whPanel:'Roll-Level Issuing — QR Scan',
      whSub:'Pulled from Weekly Fabric Request — the last 3 columns come from scanning roll QR tags',
      whReal:'YARDS ISSUED', whLotC:'FABRIC LOT', whRollC:'ROLLS', whScan:'SCAN QR', whScanS:'Scan',
      whStockB:'FABRIC WAREHOUSE', whStockT:'FABRIC WAREHOUSE', whNeedL:'REQUIRED', whGotL:'SCANNED', whShortL:'SHORT', whOverL:'OVER',
      whRollU:'rolls', whLotU:'lots', whAvail:'IN STOCK', whOut:'ISSUED', whMine:'SCANNED', whRollN:'ROLL', whBin:'BIN',
      whAutoB:'Auto-scan until covered', whInput:'Scan the roll QR tag…', whErrM:'Roll not found, or already issued',
      whHint:'Click a roll to scan it — each roll carries one QR tag with its yardage and lot',
      whEmpty:'Nothing pulled from Weekly Fabric Request yet', whTotR:'WEEK TOTAL',
      whNote:'YARDS ISSUED · FABRIC LOT · ROLLS are produced by QR scanning — every roll pulled is one line below',
      whK1:'ISSUE LINES', whK1s:'lines this week', whK2:'YARDS REQUIRED', whK2s:'yards', whK3:'YARDS ISSUED', whK3s:'yards scanned', whK4:'ROLLS PULLED', whK4s:'fabric rolls',
      dashBc:'Production Dashboard', dashTitle:'Production Dashboard',
      dashK1:'SEWING PLAN', dashK1s:'pcs planned this week', dashK2:'CUTTING NEEDED', dashK2s:'pcs to cut this week',
      dashK3:'CUT TURNS', dashK3s:'scheduled / ordered', dashK4:'SEWING DONE', dashK4s:'% of weekly plan',
      dashSew:'SEWING PROGRESS BY LINE', dashCut:'CUTTING PROGRESS BY LINE — SCHEDULED / ORDERED', dashTb:'CUTTING TABLE LOAD',
      kpiPlan:'SEWING PLAN', kpiPlanSub:'pcs planned this week', kpiDemand:'BUNDLE DEMAND', kpiDemandSub:'pcs to supply next week', kpiReq:'BUNDLE REQUEST', kpiReqSub:'pcs bundles issued',
      tab1:'Weekly Sewing Schedule', tab2:'Weekly Bundle Demand', tab3:'Weekly Bundle Request', period:'PERIOD',
      copyWeek:'Copy Last Week', downloadTpl:'Download Template', exportXls:'Export Excel', exportTip:'Exports one .xlsx with 3 sheets',
      activeRows:'Active Rows', rowsN:'Rows', linesN:'Lines', totalQty:'Total Qty',
      planEmpty:'No rows yet for this week. Copy last week or add a line below.', addLine:'Add Line',
      colLine:'LINE #', colBrand:'BRAND', colStyle:'STYLE #', colTotal:'TOTAL',
      addBrand:'+ Brand', addStyle:'+ Style', addLineCell:'+ Line',
      tipLine:'Click to rename / delete line', tipPlanCol:'From the Production Plan — edit it on the Production Plan screen', tipBrand:'Pick a brand', tipStyle:'Pick a style', tipDay:'Click to enter a number', tipDelLine:'Delete line',
      maxLines:'This line is not in the Production Plan', dayConflict:'Another style runs this day — entering a number here clears that one (1 line, 1 style per day)',
      tipRepick:'Re-pick — this row\u2019s day numbers will be cleared',
      addStyleRow:'Add a 2nd style for this line this week — no need to re-create the line', addStyleRowS:'+ Style',
      lineMergeErr:'Only two adjacent lines can be merged — e.g. Line 1+2. Not gapped lines (Line 1+3) or 3+ lines.',
      lineDupErr:'Cannot merge: that line still has its own row(s) — delete or rename them first.',
      phLine:'Line…', phBrand:'Brand…', phStyle:'Style…', phStyleFirst:'Pick a brand first',
      confirmDel:'This line has data — delete all of its rows?',
      demandTitle:'Weekly Cutting Bundle Demand', demandSub:'Nhu Cầu Sản Lượng Cắt Hàng Tuần', factory:'FACTORY',
      grpWip:'WIP STATUS', grpNext:'NEXT WEEK DEMAND',
      dA:'TOTAL ORDER CUT', dB:'TOTAL WIP SUPPLIED', dC:'OUTPUT TO LINE', dBC:'WIP LEFT AT WEEK END', dD:'1 DAY WIP', dE:'WIP BUFFER NEEDED', dF:'NEXT WEEK OUTPUT', dNeed:'QTY TO SUPPLY', remark:'REMARK', addNote:'+ note',
      tipA:'Total cut of the order (operation) — manual', tipB:'Total WIP already supplied — manual', tipC:'Total output to the line — manual', tipD:'One day of WIP output — manual',
      tipManual:'Manual entry — click to edit', tipBC:'B − C', tipE:'E = MAX(0, D − B + C). If WIP left exceeds one day, no buffer is needed.',
      tipF:'SUMIFS over this week\'s Sewing Schedule — matching line + brand + style', tipFEst:'No matching line + brand + style in the Sewing Schedule', tipNeed:'IF(E+F > A−B, A−B, E+F)', tipNote:'Click to add a note',
      demandEmpty:'No line planned for this week in the Sewing Schedule.',
      reqSub:'Weekly cut bundle issue order', reqNote:'Line & style sync from the Sewing Schedule. Pick a cut colour to open the row.',
      colColor:'CUT COLOUR', pickColor:'Pick a colour…', pickColorFirst:'pick a colour first', issue:'Issue', planShort:'PLN ', tipIssue:'Issue bundles for this cell', tipIssueEdit:'Edit this issue',
      mTitle:'Issue bundles by cut turn', mColor:'CUT COLOUR', mPlan:'PLAN (pcs)',
      mStep1:'Select cut turns', mStep1Hint:'multiple allowed', mStep2:'Select sizes & quantities', mStep2Hint:'each step = 1 ply · max = ratio × plies',
      mTurn:'CUT TURN / TABLE', mCuttable:'TOTAL CUTTABLE', mBySize:'TOTAL BY SIZE', mNeeded:'To supply', mCuttable2:'Cuttable',
      mNoTurn:'Pick at least one cut turn in step 1 to enter quantities by size.',
      mClear:'Clear cell', mCancel:'Cancel', mSave:'Save issue', mUpdate:'Update', mIssue:'Issue', mNoTurnSel:'No cut turn selected', mTurns:'turns', mSizes:'sizes', ply:'ply', plies:'plies', left:'left ' }
  };
  NAVVI = {'PRODUCTION PLAN':'KẾ HOẠCH SẢN XUẤT','DASHBOARD':'TỔNG QUAN','Production Dashboard':'Dashboard sản xuất','WAREHOUSE':'KHO','SPREADING / CUTTING':'TRẢI / CẮT','SEWING':'MAY','FINISHING / PACKING':'HOÀN THIỆN / ĐÓNG GÓI','GARMENT LOADING':'XUẤT HÀNG','QUALITY CONTROL':'KIỂM SOÁT CHẤT LƯỢNG','PLANNING':'KẾ HOẠCH',
    'Weekly Fabric Request':'Kế hoạch cấp vải tuần','Weekly Working Warehouse':'Kế hoạch làm việc kho','Fabric':'Vải','Trim':'Phụ liệu','WH Location Map':'Sơ đồ kho','Material WH Shipment':'Xuất nhập NPL','Stock Adjustment':'Điều chỉnh tồn','Inventory & Reconciliation':'Kiểm kê & đối chiếu',
    'Fabric In (W/H Out)':'Nhập vải (xuất kho)','Spreading':'Trải vải','Cutting':'Cắt','Cutting-Out':'Xuất cắt','Sewing Output':'Sản lượng may',
    'Garment In':'Nhập thành phẩm','MFZ':'MFZ','Carton Packing':'Đóng thùng','Loading':'Xếp hàng','End-line Inspection':'Kiểm cuối chuyền','Final Inspection':'Kiểm final',
    'Production Plan':'Kế hoạch sản xuất','Spreading/Cutting Schedule':'Kế hoạch trải/cắt','Sewing Schedule':'Kế hoạch may','Weekly Shipment Plan':'Kế hoạch xuất hàng tuần'};
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
      bcRoot:this.t('bcRoot'), bcPage:this.state.page==='gantt'?this.t('psBc'):this.state.page==='dash'?this.t('dashBc'):this.state.page==='cutting'?this.t('cutBcPage'):this.state.page==='fabreq'?this.t('frBc'):this.state.page==='whplan'?this.t('whBc'):this.t('bcPage'),
      bodyEl:this.state.page==='gantt'?this.renderGanttBody():this.state.page==='dash'?this.renderDashBody():this.state.page==='cutting'?this.renderCutBody():this.state.page==='fabreq'?this.renderFabReqBody():this.state.page==='whplan'?this.renderWhBody():(this.state.tab==='weekly'?this.renderBody():(this.state.tab==='trim'?this.renderBundleBody():this.renderDemandBody())),
      modalEl:this.renderBForm(), addLineEl:this.renderPsAdd(), confEl:this.renderConflict(), qrModalEl:this.renderQrModal(), whModalEl:this.renderWhModal() };
  }

  renderSideNav(){
    const h=React.createElement, C=this.C;
    const groups=[
      ['DASHBOARD',[['Production Dashboard',1,'dash']]],
      ['PRODUCTION PLAN',[['Production Plan',1,'gantt']]],
      ['SEWING',[['Sewing Schedule',1,'sewing']]],
      ['SPREADING / CUTTING',[['Spreading/Cutting Schedule',1,'cutting']]],
      ['WAREHOUSE',[['Weekly Fabric Request',1,'fabreq'],['Weekly Working Warehouse',1,'whplan']]],
    ];
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
    let reqTotal=0; Object.keys(this.state.bundle||{}).forEach(id=>{ const t=this.bundleTotal(id); if(t) reqTotal+=t; });
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

  renderDataSource(){
    const h=React.createElement, C=this.C; const d=this.state.dragOver;
    return h('div',{
      onDragOver:e=>{e.preventDefault(); if(!this.state.dragOver) this.set({dragOver:true});},
      onDragLeave:()=>this.set({dragOver:false}),
      onDrop:e=>{e.preventDefault(); this.set({dragOver:false}); this.addFiles(e.dataTransfer.files);},
      style:{display:'flex',alignItems:'center',gap:14,background:C.white,border:'1px solid '+(d?C.primary:C.border),borderRadius:10,padding:'12px 16px',marginBottom:20,transition:'border-color .15s'}},
      h('div',{style:{width:36,height:36,borderRadius:9,background:C.tint,color:C.primary,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},
        h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('path',{d:'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1'}),h('path',{d:'M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1'}))),
      h('div',{style:{flex:1,minWidth:0}},
        h('div',{style:{fontSize:13.5,fontWeight:600,color:C.ink,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}},'Production data syncs from ERP',
          h('span',{style:{fontSize:10.5,fontWeight:600,color:'#b0791b',background:'#fbf3df',border:'1px solid #f0e3c0',padding:'2px 7px',borderRadius:5}},'ERP · pending')),
        h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},'Each row is one line + brand + style; type a target into any day cell. Colour / size / cut-turn detail is captured in Daily Confirmation. Manual Excel import stays available while in UI Proto.')),
      h('div',{style:{display:'flex',flexWrap:'wrap',gap:7,justifyContent:'flex-end',maxWidth:'40%'}},
        this.state.files.length?null:h('span',{style:{fontSize:12,color:C.faint,fontStyle:'italic'}},'No file — upload a workbook'),
        this.state.files.map((f,i)=>h('span',{key:i,style:{display:'inline-flex',alignItems:'center',gap:7,background:C.tint2,border:'1px solid '+C.border,borderRadius:16,padding:'4px 6px 4px 10px',fontSize:11.5}},
          h('span',{style:{width:6,height:6,borderRadius:2,background:C.primary}}),h('span',{style:{fontWeight:500,color:C.ink}},f.name), f.sheets?h('span',{style:{color:C.faint}},f.sheets+' sheets'):null,
          h('button',{title:'Remove file',onClick:e=>{e.stopPropagation(); this.removeFile(i);},style:{border:'none',background:'none',cursor:'pointer',color:C.faint,display:'flex',alignItems:'center',padding:2,borderRadius:8}},
            h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2.2},h('path',{d:'M18 6 6 18M6 6l12 12'})))))),
      h('label',{style:{...this.btn('ghost'),cursor:'pointer',flex:'none'}},this.ic('up'),'Upload Excel',
        h('input',{type:'file',accept:'.xlsx,.csv',multiple:true,style:{display:'none'},onChange:e=>this.addFiles(e.target.files)})));
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

  combo(orig,apply){ return {
    onFocus:ev=>{ ev.target.value=''; },
    onBlur:ev=>{ const v=ev.target.value.trim(); if(v) apply(v); this.stopEdit(); },
    onKeyDown:ev=>{ if(ev.key==='Enter'){ const v=ev.target.value.trim(); if(v) apply(v); this.stopEdit(); } else if(ev.key==='Escape') this.stopEdit(); }
  }; }

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
        h('div',{style:{padding:'16px 16px 8px'}}, this.getWeek().rows.length? this.renderBundleGrid() : h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty')))));
  }

  renderBundleGrid(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows; const dates=this.weekDates();
    const th={padding:'11px 8px',fontSize:11.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',color:C.sub,textAlign:'center',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,background:'#f8faf3'};
    const spans=this.lineSpans(rows); const sstyle=this.fieldSpans(rows,'style');
    let grp=-1;
    const body=rows.map((r,idx)=>{ const linfo=spans[idx]; const sinfo=sstyle[idx];
      if(linfo.first) grp++; const stripe=grp%2===1;
      const b=this.state.bundle[r.id]; const chosen=!!(b&&b.color);
      const cells=[];
      if(linfo.first) cells.push(h('td',{key:'ln',rowSpan:linfo.span,style:{borderRight:'1px solid '+C.border,borderTop:'1px solid '+C.line,background:C.tint,verticalAlign:'middle',textAlign:'center',padding:'8px 4px',fontSize:12.5,fontWeight:700,color:C.primary,lineHeight:1.25}},this.normName(r.line)));
      if(sinfo.first) cells.push(h('td',{key:'st',rowSpan:sinfo.span,style:{borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'middle',padding:'8px 9px',fontSize:11.5,fontFamily:mono,color:C.ink,wordBreak:'break-all',lineHeight:1.3,background:stripe?'#f7f9f3':C.white}},r.style));
      cells.push(this.reqColorCell(r,b,chosen,stripe));
      this.DAYS.forEach((d,i)=>cells.push(this.reqDayCell(r,d,b,chosen,stripe,i===5)));
      const tot=this.bundleTotal(r.id);
      cells.push(h('td',{key:'tot',style:{borderTop:'1px solid '+C.line,textAlign:'center',verticalAlign:'middle',fontSize:15.5,fontWeight:700,fontFamily:mono,color:tot!=null?C.ink:'#c3c8bf',background:C.tint2}}, tot!=null?this.fmt(tot):'—'));
      return h('tr',{key:r.id},cells);
    });
    return h('div',{style:{border:'1px solid '+C.border,borderRadius:12,overflow:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1180px',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('colgroup',null, h('col',{style:{width:'72px'}}), h('col',{style:{width:'98px'}}), h('col',{style:{width:'128px'}}),
          ...this.DAYS.map((d,i)=>h('col',{key:i,style:{width:'152px'}})), h('col',{style:{width:'74px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...th,textAlign:'left',paddingLeft:12}},this.t('colLine')),
          h('th',{style:{...th,textAlign:'left',paddingLeft:10}},this.t('colStyle')),
          h('th',{style:{...th,textAlign:'left',paddingLeft:10}},this.t('colColor')),
          ...this.DAYS.map((d,i)=>h('th',{key:d,style:{...th,background:'#fbfcfa'}},
            h('div',{style:{fontWeight:700,fontSize:13,color:C.ink}},this.dayLabel(d,i)),
            h('div',{style:{fontSize:10.5,color:C.faint,marginTop:2,fontFamily:mono,fontWeight:500}},dates[i]))),
          h('th',{style:{...th,color:'#fff',background:C.dark,borderRight:'none',borderBottom:'2px solid '+C.dark}},this.t('colTotal')))),
        h('tbody',null, body)));
  }

  colorHex(name){ if(!name) return '#c9cdc6'; const k=String(name).toLowerCase().trim();
    const map={'white':'#f2f2ec','marshmallow':'#efe9dc','bourbon':'#8a5a2b','black':'#23262b','all black':'#191b1e','onyx':'#2a2d33','obsidian':'#23262b','ink':'#20242c','pigment':'#373c43','midnight':'#1c2a44',
      'charcoal':'#3a3f47','graphite':'#4a4f57','graphite grey':'#4a4f57','forge grey':'#5c6169','heather grey':'#b7bcc2','grey':'#9aa0a8','gray':'#9aa0a8','fog':'#c3c8ce','glacier':'#dde6ea','rock':'#8b9099','slate':'#586572','storm':'#6b7784',
      'navy':'#243a63','true navy':'#20365c','classic navy':'#22345a','maritime':'#26456d','ceil blue':'#8fb0d6','ciel':'#9cbbdd','tidepool':'#2f6f7e','dusk':'#586a86',
      'olive':'#5f6a3a','sage':'#8a9a76','sand':'#d8c39a','cinnamon':'#9c5a34','ember':'#b8452e','flame':'#d1502f','volt':'#c8d63f','crimson':'#a02334','wine':'#6e2233','washed boysenberry':'#7a4a5e','fig':'#5c4658'};
    if(map[k]) return map[k]; const has=w=>k.indexOf(w)>=0;
    if(has('white')) return '#f2f2ec'; if(has('black')) return '#23262b'; if(has('navy')) return '#243a63'; if(has('blue')) return '#3f6bb0'; if(has('grey')||has('gray')) return '#9aa0a8'; if(has('olive')) return '#5f6a3a'; if(has('green')||has('sage')) return '#5f7a4a'; if(has('red')||has('crimson')) return '#a02334'; if(has('sand')||has('tan')) return '#d8c39a'; return '#8a9099'; }

  reqColorCell(r,b,chosen,stripe){
    const h=React.createElement, C=this.C;
    return h('td',{key:'cl',style:{borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'middle',padding:7,background:stripe?'#f7f9f3':C.white}},
      h('div',{style:{position:'relative'}},
        h('span',{style:{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:10,height:10,borderRadius:'50%',background:chosen?this.colorHex(b.color):'#dcb9b5',border:'1px solid rgba(0,0,0,.18)',pointerEvents:'none'}}),
        h('input',{list:'dl-color-'+r.id,defaultValue:b?b.color:'',placeholder:this.t('pickColor'),
          onFocus:ev=>{ ev.target.value=''; },
          onChange:ev=>{ const v=ev.target.value; if(this.cutColors(r.style).includes(v)) this.pickColor(r.id,v); },
          onBlur:ev=>{ const v=ev.target.value.trim(); if(v && (!b||b.color!==v)) this.pickColor(r.id,v); },
          style:{width:'100%',border:'1px solid '+(chosen?C.border:'#e0bdb9'),borderRadius:7,padding:'8px 8px 8px 28px',fontSize:12,fontFamily:'inherit',fontWeight:600,color:chosen?C.ink:C.primary,background:chosen?C.white:'#fdf6f5'}}),
        h('datalist',{id:'dl-color-'+r.id}, this.cutColors(r.style).map(c=>h('option',{key:c,value:c})))));
  }

  reqDayCell(r,d,b,chosen,stripe,weekend){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const plan=r.days[d]; const hasPlan=plan!=null;
    const base={borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'top',padding:0};
    const restBg=stripe?'#f7f9f3':(weekend?'#fcfdfa':C.white);
    if(!hasPlan) return h('td',{key:d,style:{...base,background:'#f2f3f0'}});
    if(!chosen) return h('td',{key:d,style:{...base,background:restBg}},
      h('div',{style:{padding:'16px 8px',textAlign:'center',fontSize:10.5,color:'#b7bcb2',fontStyle:'italic'}},this.t('pickColorFirst')));
    const cell=b.days&&b.days[d];
    const filled=cell&&cell.turns&&cell.turns.length&&(cell.sizes||[]).some(s=>(Number((cell.qty||{})[s])||0)>0);
    if(!filled) return h('td',{key:d,onClick:()=>this.openBForm(r.id,d),title:this.t('tipIssue'),style:{...base,cursor:'pointer',background:restBg}},
      h('div',{style:{margin:9,border:'1.5px dashed '+C.border,borderRadius:9,padding:'12px 6px',textAlign:'center',color:C.primary}},
        h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,style:{display:'block',margin:'0 auto'}},h('path',{d:'M12 5v14M5 12h14'})),
        h('div',{style:{fontSize:11,fontWeight:600,marginTop:4}},this.t('issue')),
        h('div',{style:{fontSize:9.5,color:C.faint,marginTop:2,fontFamily:mono}},this.t('planShort')+this.fmt(plan))));
    const sizes=(cell.sizes||[]).filter(s=>(Number((cell.qty||{})[s])||0)>0); const qty=cell.qty||{}; const turns=cell.turns||[];
    const tot=sizes.reduce((a,s)=>a+(Number(qty[s])||0),0);
    const n=sizes.length||1; const cols='repeat('+n+',minmax(0,1fr))';
    return h('td',{key:d,onClick:()=>this.openBForm(r.id,d),title:this.t('tipIssueEdit'),style:{...base,cursor:'pointer',background:restBg}},
      h('div',{style:{padding:'9px 8px 10px'}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:6,marginBottom:8}},
          h('div',{style:{display:'flex',flexWrap:'wrap',gap:4}},
            turns.map(t=>h('span',{key:t,style:{fontSize:15,fontWeight:700,color:'#fff',background:C.primary,borderRadius:7,padding:'3px 11px',lineHeight:1.2}},t))),
          h('span',{style:{fontSize:15,fontWeight:700,fontFamily:mono,color:C.ink,lineHeight:1.2,flex:'none'}},this.fmt(tot))),
        h('div',{style:{border:'1px solid '+C.line,borderRadius:7,overflow:'hidden'}},
          h('div',{style:{display:'grid',gridTemplateColumns:cols,background:'#eef3e7'}},
            sizes.map((s,i)=>h('div',{key:s,style:{fontSize:9.5,fontWeight:700,letterSpacing:'.2px',color:C.sub,textAlign:'center',padding:'3px 1px',borderLeft:i?'1px solid #e0e6d8':'none',whiteSpace:'nowrap',overflow:'hidden'}},s))),
          h('div',{style:{display:'grid',gridTemplateColumns:cols,borderTop:'1px solid '+C.line}},
            sizes.map((s,i)=>h('div',{key:s,style:{fontSize:12,fontWeight:700,fontFamily:mono,color:C.ink,textAlign:'center',padding:'4px 1px',borderLeft:i?'1px solid '+C.line:'none',whiteSpace:'nowrap',overflow:'hidden'}},this.fmt(qty[s])))))));
  }

  renderBForm(){
    const f=this.state.bform; if(!f) return null;
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const row=this.getWeek().rows.find(r=>r.id===f.id); if(!row) return null;
    const b=this.state.bundle[f.id]||{color:''};
    const dates=this.weekDates(); const di=this.DAYS.indexOf(f.day);
    const quantity=Number(row.days[f.day])||0; const style=row.style;
    const tq=f.tq||{}; const selIds=f.turns||[];
    const cat=this.cutTurns(style);
    const tcols=this.SORDER.filter(s=> cat.some(t=>this.turnSizes(t)[s]));
    const avail=this.sumTurns(selIds,style);
    const grand=this.tqTotals(tq);
    const hasTurns=selIds.length>0;
    const needTotal=this.SORDER.reduce((a,s)=>a+(grand[s]||0),0);
    const availTotal=this.SORDER.reduce((a,s)=>a+(avail[s]||0),0);
    const sizeCount=this.SORDER.filter(s=>(grand[s]||0)>0).length;
    const canSave=hasTurns&&needTotal>0; const editing=!!(b.days&&b.days[f.day]);
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
    const turnTable = h('div',{style:{border:'1px solid '+C.border,borderRadius:10,overflow:'hidden'}},
      h('table',{style:{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('colgroup',null, h('col',{style:{width:'160px'}}), ...tcols.map((s,i)=>h('col',{key:i})), h('col',{style:{width:'60px'}})),
        h('thead',null, h('tr',null,
          h('th',{style:{...tTh,textAlign:'left',paddingLeft:14,color:C.sub,background:'#f8faf3'}},this.t('mTurn')),
          tcols.map(s=>h('th',{key:s,style:{...tTh,color:C.dark,background:'#f8faf3'}},s)),
          h('th',{style:{...tTh,color:'#fff',background:C.dark,borderRight:'none'}},'\u03a3'))),
        h('tbody',null,
          cat.map(t=>{ const on=selIds.includes(t.id); const ts=this.turnSizes(t); const tot=Object.values(ts).reduce((a,x)=>a+x,0);
            return h('tr',{key:t.id,className:'turn-pick',onClick:()=>this.toggleTurn(t.id),style:{cursor:'pointer',background:on?C.tint:C.white}},
              h('td',{style:{padding:'9px 12px',borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line,borderLeft:'3px solid '+(on?C.primary:'transparent'),display:'flex',alignItems:'center',gap:9}}, check(on),
                h('span',{style:{fontSize:13.5,fontWeight:700,color:on?C.dark:C.ink}},t.id),
                h('span',{style:{fontSize:10.5,fontFamily:mono,color:C.faint,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},t.layers+this.t('ply'))),
              tcols.map(s=>h('td',{key:s,style:{...tTd,color:ts[s]?C.ink:'#d3d7cd',fontWeight:ts[s]&&on?700:500,background:on&&ts[s]?'#eef5e8':'transparent'}}, ts[s]?this.fmt(ts[s]):'·')),
              h('td',{style:{...tTd,fontWeight:700,borderRight:'none',color:on?C.primary:C.faint}},this.fmt(tot))); }),
          h('tr',{style:{background:'#f7f9f3'}},
            h('td',{style:{padding:'9px 14px',borderTop:'2px solid '+C.border,borderRight:'1px solid '+C.line,fontSize:11,fontWeight:700,letterSpacing:'.2px',color:C.sub}},this.t('mCuttable')),
            tcols.map(s=>h('td',{key:s,style:{padding:'9px 6px',textAlign:'center',fontSize:13,fontWeight:700,fontFamily:mono,borderTop:'2px solid '+C.border,borderRight:'1px solid '+C.line,color:avail[s]?C.dark:'#d3d7cd'}}, this.fmt(avail[s]||0))),
            h('td',{style:{padding:'9px 6px',textAlign:'center',fontSize:13,fontWeight:700,fontFamily:mono,borderTop:'2px solid '+C.border,color:C.dark}},this.fmt(availTotal))))));
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
      h('div',{onClick:ev=>ev.stopPropagation(),ref:el=>{ if(el&&window.anime&&el.dataset.a!=='1'){el.dataset.a='1';window.anime({targets:el,opacity:[0,1],translateY:[16,0],scale:[.98,1],duration:340,easing:'easeOutCubic'});} },style:{width:'min(1060px,94vw)',height:'min(880px,90vh)',display:'flex',flexDirection:'column',overflow:'hidden',background:C.white,borderRadius:16,boxShadow:'0 30px 70px rgba(0,0,0,.32)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:13,padding:'17px 24px',borderBottom:'1px solid '+C.line,flex:'none'}},
          h('div',{style:{width:38,height:38,borderRadius:10,background:C.tint,color:C.primary,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},
            h('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9},h('rect',{x:3,y:3,width:18,height:18,rx:2}),h('path',{d:'M3 9h18M9 21V9'}))),
          h('div',{style:{flex:1,minWidth:0}},h('div',{style:{fontSize:18,fontWeight:700}},this.t('mTitle')),
            h('div',{style:{fontSize:12.5,color:C.faint,marginTop:2}},this.normName(row.line)+' · '+f.day.toUpperCase()+' '+dates[di]+' · '+this.state.week)),
          h('button',{onClick:()=>this.set({bform:null}),style:{border:'1px solid '+C.border,background:C.white,cursor:'pointer',color:C.sub,padding:8,borderRadius:9,display:'flex'}},h('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M18 6 6 18M6 6l12 12'})))),
        h('div',{className:'yscroll',style:{flex:1,overflow:'auto',padding:'18px 24px 20px'}},
          h('div',{style:{display:'flex',gap:11,marginBottom:20}},
            info(this.t('colBrand'),row.brand),info(this.t('colStyle'),row.style,{mono:true}),info(this.t('mColor'),b.color||'—',{dot:!!b.color}),info(this.t('mPlan'),this.fmt(quantity),{hl:true,mono:true})),
          turnTable),
        h('div',{style:{display:'flex',alignItems:'center',gap:14,padding:'14px 24px',borderTop:'1px solid '+C.line,background:'#f8faf3',flex:'none'}},
          editing? h('button',{onClick:()=>this.clearBForm(),style:{...this.btn('ghost'),color:'#c0392b',borderColor:'#eccfca'}},this.t('mClear')):null,
          h('div',{style:{display:'flex',flexDirection:'column',gap:1}},
            h('span',{style:{fontSize:13.5,fontWeight:700,color:canSave?C.ink:C.faint}}, hasTurns? (this.t('mIssue')+' '+this.fmt(needTotal)+' / '+this.fmt(availTotal)+' pcs') : this.t('mNoTurnSel')),
            hasTurns? h('span',{style:{fontSize:11.5,color:C.faint}}, selIds.length+' '+this.t('mTurns')+' · '+sizeCount+' '+this.t('mSizes')):null),
          h('div',{style:{flex:1}}),
          h('button',{onClick:()=>this.set({bform:null}),style:this.btn('ghost')},this.t('mCancel')),
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
  nextWeekKey(){ const all=[]; Object.values(this.MONTHS).forEach(ws=>ws.forEach(w=>all.push(w))); const i=all.indexOf(this.state.week); return (i>=0&&i<all.length-1)?all[i+1]:null; }
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
    rows.forEach(r=>{ const b=this.state.bundle[r.id]||{};
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
      const cells=[];
      if(li.first) cells.push(ed(r.id,'line')
        ? h('td',{key:'ln',rowSpan:li.span,style:{...cb,padding:0,background:C.tint}},
            h('input',Object.assign({list:'dl-line',autoFocus:true,defaultValue:this.normName(r.line),placeholder:this.t('phLine'),style:{...inp,fontSize:12}},commit(v=>this.renameGroup(li.ids,v)))),
            h('datalist',{id:'dl-line'}, this.lineOptions().map(n=>h('option',{key:n,value:n}))))
        : h('td',{key:'ln',rowSpan:li.span,title:this.t('tipPlanCol'),style:{...cb,padding:'8px 4px',textAlign:'center',verticalAlign:'middle',fontSize:12,fontWeight:700,cursor:'default',opacity:.7,color:C.primary,background:C.tint,lineHeight:1.25}},this.normName(r.line)));
      cells.push(h('td',{key:'br',title:this.t('lgPull'),style:{...cb,padding:pad,paddingLeft:9,textAlign:'left',fontSize:11.5,fontWeight:600,color:r.brand?C.ink:'#c3c8bf',background:rbg}},r.brand||'—'));
      cells.push(h('td',{key:'st',title:this.t('lgPull'),style:{...cb,padding:pad,paddingLeft:9,textAlign:'left',fontSize:11,fontFamily:mono,color:r.style?C.ink:'#c3c8bf',background:rbg,wordBreak:'break-all',lineHeight:1.3}},r.style||'—'));
      cells.push(man('a',v.a)); cells.push(man('b',v.b)); cells.push(man('c',v.c));
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

  renderOtherTab(){
    const h=React.createElement, C=this.C;
    const label=this.state.tab==='daily'?'Weekly Bundle Demand':'Weekly Bundle Request';
    return h('div',{className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px'}},
      this.renderTitle(), this.renderKpis(), this.renderTabs(),
      h('div',{style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,boxShadow:C.shadow,padding:'70px 24px',textAlign:'center'}},
        h('div',{style:{width:56,height:56,borderRadius:14,background:C.tint,color:C.primary,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}},
          h('svg',{width:26,height:26,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('rect',{x:3,y:4,width:18,height:16,rx:2}),h('path',{d:'M3 9h18M8 4v16'}))),
        h('div',{style:{fontSize:18,fontWeight:700}},label),
        h('div',{style:{fontSize:13.5,color:C.faint,marginTop:6}},this.state.tab==='daily'?'UI Proto — chi tiết mỗi lượt cắt (bàn): target theo màu / size sẽ được bóc tách ở đây. Ở bảng tuần mỗi ô chỉ nhập một con số target.':'UI Proto — this tab is scaffolded. The Weekly Sewing Schedule is the active view.'),
        h('button',{onClick:()=>this.set({tab:'weekly'}),style:{...this.btn('primary'),margin:'18px auto 0'}},'Back to Weekly Sewing Schedule')));
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
  capPo(r){ const plans=this.khcPlansFor(r.style); if(!plans.length) return '';
    const codes=(((this.state&&this.state.capTurns)||{})[r.id]||[]).map(t=>t.c);
    let best=plans[0];
    if(codes.length){ let top=-1;
      plans.forEach(p=>{ const set={}; (p.sections||[]).forEach(s=>(s.tables||[]).forEach(t=>{ set[t.tb]=1; }));
        const n=codes.reduce((a,c)=>a+(set[c]?1:0),0); if(n>top){ top=n; best=p; } });
      if(top<=0) return ''; }
    return (best&&best.qrPo)||''; }
  multFor(emb){ const s=this.state||{}; const v=emb?s.multEmb:s.multPlain; return v==null?(emb?6:3):v; }
  setMult(key,val){ const n=Math.max(0,Math.min(60,parseInt(String(val).replace(/[^0-9]/g,''),10)||0)); this.setState({[key]:n}); }
  rowPress(ev,id,idx){
    if(ev.button!=null&&ev.button!==0) return;
    const tg=ev.target; if(tg&&tg.closest&&tg.closest('input,button,select,textarea')) return;
    const rows=this.capRows(); this.rowEls=this.rowEls||{};
    const rects=rows.map(r=>{ const el=this.rowEls[r.id]; return el?el.getBoundingClientRect():null; });
    const self=rects[idx]; const rh=self?self.height:34; const y0=ev.clientY;
    let live=false;
    const lift=on=>{ const el=(this.rowEls||{})[id]; if(!el) return;
      if(on){ el.classList.add('lift'); el.style.position='relative'; el.style.zIndex='9'; el.style.opacity='1';
        el.style.transition='none'; el.style.transform='translateY(0px)'; el.style.cursor='grabbing';
        el.style.boxShadow='0 14px 30px rgba(20,26,20,.24)'; }
      else { el.classList.remove('lift'); el.style.position=''; el.style.zIndex=''; el.style.boxShadow=''; el.style.cursor=''; el.style.transform=''; el.style.transition=''; } };
    const cleanup=()=>{ document.body.style.userSelect=''; lift(false);
      window.removeEventListener('pointermove',move,true); window.removeEventListener('pointerup',up,true); window.removeEventListener('pointercancel',up,true); };
    const move=e=>{
      const dy=e.clientY-y0;
      if(!live){ if(Math.abs(dy)>7){ clearTimeout(timer); cleanup(); } return; }
      const center=(self?self.top+self.height/2:0)+dy;
      let to=idx;
      for(let j=0;j<rects.length;j++){ const rc=rects[j]; if(!rc||j===idx) continue; const c=rc.top+rc.height/2;
        if(j<idx&&center<c) to=Math.min(to,j); else if(j>idx&&center>c) to=Math.max(to,j); }
      this.setState(s=>s.dragRow?{dragRow:{...s.dragRow,dy:dy,to:to}}:null);
    };
    const up=()=>{ clearTimeout(timer); const d=this.state.dragRow; cleanup();
      if(d){ this._noClick=true; setTimeout(()=>{ this._noClick=false; },250); this.commitRowMove(d.from,d.to); } };
    const timer=setTimeout(()=>{ live=true; document.body.style.userSelect='none';
      try{ if(navigator.vibrate) navigator.vibrate(8); }catch(err){}
      lift(true);
      this.setState(s=>({dragRow:{id:id,from:idx,to:idx,dy:0,h:rh},edit:null}),()=>this.forceUpdate());
    },240);
    window.addEventListener('pointermove',move,true);
    window.addEventListener('pointerup',up,true);
    window.addEventListener('pointercancel',up,true);
  }
  commitRowMove(from,to){ this.setState(s=>{
    const ids=this.capRows().map(r=>r.id);
    if(from!==to&&to>=0&&to<ids.length){ const mv=ids.splice(from,1)[0]; ids.splice(to,0,mv); }
    return {capOrder:ids,dragRow:null}; }); }
  // SL của 1 lượt theo mã lượt — dùng khi lượt đã xếp lịch không còn trong bảng phân bổ hiện tại
  codeQty(style,code,po){ const t=(this.cutTurns(style,po)||[]).find(x=>x.id===code); if(!t) return 0;
    const ts=this.turnSizes(t); return Object.keys(ts).reduce((a,s)=>a+ts[s],0); }
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
  turnCatalog(){ const m=(this.state&&this.state.capTurns)||{}; const out=[];
    this.capRows().forEach(r=>{ (m[r.id]||[]).forEach((t,i)=>out.push({code:t.c,qty:t.q,rowId:r.id,idx:i,line:r.line,brand:r.brand,style:r.style})); });
    out.sort((a,b)=>(parseInt(a.code.slice(1),10)||0)-(parseInt(b.code.slice(1),10)||0)); return out; }
  cloneTurns(s){ const m={}; Object.keys(s.capTurns||{}).forEach(k=>{ m[k]=s.capTurns[k].map(t=>({...t})); }); return m; }
  renumberTurns(){ this.setState({capTurns:this.allocTurns(),dragRow:null}); }
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
  setCap(id,field,val){
    const v=(field==='cut'||field==='iss')?Math.max(0,parseInt(String(val).replace(/[^0-9]/g,''),10)||0):String(val).trim();
    this.setState(s=>({cap:{...(s.cap||{}),[id]:{...((s.cap||{})[id]||{}),[field]:v}}}));
  }
  fmtn(n){ n=Number(n)||0; return n%1===0?n.toLocaleString('en-US'):n.toLocaleString('en-US',{maximumFractionDigits:1}); }
  capTotals(){ const T={cut:0,iss:0,rem:0,wip1:0,ahead:0,sew:0,out:0,tc:0,days:[0,0,0,0,0,0],wk:0};
    this.capRows().forEach(r=>{ const v=this.capVals(r);
      T.cut+=Number(r.cut)||0; T.iss+=Number(r.iss)||0; T.rem+=v.rem; T.wip1+=v.wip1;
      T.ahead+=v.ahead; T.sew+=v.sew; T.out+=v.out; T.tc+=v.list.length; T.wk+=v.wk;
      this.capDays(r).forEach((x,i)=>{ T.days[i]+=Number(x)||0; }); });
    return T; }
  schedTurns(){ const s=new Set(); this.CUTPLAN.forEach(b=>Object.keys(b.cells).forEach(d=>{ const c=b.cells[d]; if(c&&c.turn) s.add(c.turn); })); return s; }

  renderCutBody(){
    const h=React.createElement;
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('cutPageTitle','S-02-CUTPLAN-MONITOR · UI Proto'), this.renderCapKpis(), this.renderCutTabs(),
      this.state.cutTab==='plan'?this.renderCutPlanPanel():this.renderCapPanel());
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

  renderCapKpis(){
    const h=React.createElement, C=this.C; const T=this.capTotals();
    const cards=[[this.t('capK1'),this.fmtn(Math.round(T.out)),this.t('capK1s')],
      [this.t('capK2'),String(T.tc),this.t('capK2s')],
      [this.t('capK3'),this.fmtn(T.rem),this.t('capK3s')],
      [this.t('capK4'),this.fmtn(Math.round(T.sew)),this.t('capK4s')]];
    const icons=[
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('path',{d:'M22 12h-4l-3 9L9 3l-3 9H2'})),
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('circle',{cx:6,cy:6,r:3}),h('circle',{cx:6,cy:18,r:3}),h('path',{d:'M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12'})),
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('circle',{cx:12,cy:12,r:9}),h('path',{d:'M12 7v5l3 3'})),
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('path',{d:'M12 2 2 7l10 5 10-5-10-5z'}),h('path',{d:'M2 17l10 5 10-5M2 12l10 5 10-5'}))];
    return h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}},
      cards.map(([label,val,sub],i)=>h('div',{key:i,style:{background:C.white,border:'1px solid '+C.border,borderRadius:13,padding:'10px 14px',boxShadow:C.shadow,display:'flex',alignItems:'center',gap:10}},
        h('div',{style:{width:26,height:26,borderRadius:8,background:i===1?'#fbf3df':C.tint,color:i===1?'#b0791b':C.dark,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},icons[i]),
        h('div',{style:{flex:1,minWidth:0,fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.sub,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},label),
        h('div',{style:{fontSize:19,fontWeight:700,letterSpacing:'-.4px',lineHeight:1,fontVariantNumeric:'tabular-nums',flex:'none'}},val))));
  }

  PS(){ this.ensureSeed(); return window.PSCHED||{groups:[],start:'2026-01-01',days:1}; }
  // File dữ liệu nạp sau khi component dựng xong sẽ gán lại window.* — gieo lại khi mất dấu
  ensureSeed(){ if(this._seeding||!window.PSCHED||!window.KHC) return;
    if(window.KHC.__seed&&window.PSCHED.__seed) return;
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
  psSetDate(field,val){ const k=this.state.gsel; if(!k||!val) return; const key=k.g+'|'+k.r+'|'+k.i;
    this.setState(st=>{ const ov={...(st.psOver||{})}; ov[key]={...(ov[key]||{}),[field]:val}; return {psOver:ov}; }); this.psTouch(); }
  psShortD(v){ const p=String(v||'').split('-'); return p.length>2?p[2]+'/'+p[1]:''; }
  // Tuần của kỳ hiện tại luôn có dòng — bù lại sau khi khôi phục bản lưu / dữ liệu về muộn
  reconcileWeeks(){ this.psApplyLines();
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
    KH.__seed=1; window.PSCHED.__seed=1; this._kt={}; this._seeding=wasSeeding; return made>0; }
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
    if(!o) return null; const p=(this.state.psOver||{})[k.g+'|'+k.r+'|'+k.i];
    return {g,r,o:p?Object.assign({},o,p):o,ov:!!p}; }
  psRowItems(gi,ri,r){ const st=this.state||{}; const del=st.psDel||{}, ov=st.psOver||{}, ex=(st.psExtra||{})[gi+'|'+ri]||[];
    const out=(r.orders||[]).map((o,oi)=>({o,i:oi,key:gi+'|'+ri+'|'+oi}));
    ex.forEach((o,n)=>out.push({o,i:'x'+n,key:gi+'|'+ri+'|x'+n}));
    out.forEach(it=>{ it.del=!!del[it.key]; const p=ov[it.key]; if(p){ it.o=Object.assign({},it.o,p); it.ov=!!p.src; } }); return out; }
  // Sửa kế hoạch sản xuất -> gieo lại các tuần chưa sửa tay của Kế hoạch may
  psLineNo(name){ const n=this.parseNums(name); return n.length?n[0]:9999; }
  // psExtra/psDel/psOver khóa theo 'nhóm|dòng' nên đổi thứ tự dòng phải map lại khóa,
  // f(oldRowIndex) -> newRowIndex, hoặc null nếu dòng bị xóa.
  psReindex(gi,f){ const st=this.state||{};
    const rk=o=>{ const out={}; Object.keys(o||{}).forEach(k=>{ const p=String(k).split('|');
      if(Number(p[0])!==gi){ out[k]=o[k]; return; }
      const nr=f(Number(p[1])); if(nr==null) return; p[1]=String(nr); out[p.join('|')]=o[k]; }); return out; };
    const tr=(st.psTrash||[]).filter(t=>{ const p=String(t.key).split('|'); return Number(p[0])!==gi||f(Number(p[1]))!=null; })
      .map(t=>{ const p=String(t.key).split('|'); if(Number(p[0])===gi) p[1]=String(f(Number(p[1]))); return {...t,key:p.join('|')}; });
    let gs=st.gsel; if(gs&&gs.g===gi){ const nr=f(gs.r); gs=(nr==null)?null:{...gs,r:nr}; }
    this.setState({psExtra:rk(st.psExtra),psDel:rk(st.psDel),psOver:rk(st.psOver),psTrash:tr,gsel:gs}); }
  psSortGroup(gi){ const g=((window.PSCHED||{}).groups||[])[gi]; if(!g||!g.rows) return;
    const idx=g.rows.map((r,i)=>i).sort((a,b)=>(this.psLineNo(g.rows[a].line)-this.psLineNo(g.rows[b].line))||(a-b));
    if(idx.every((o,i)=>o===i)) return;
    const map={}; idx.forEach((o,nw)=>{ map[o]=nw; });
    g.rows=idx.map(i=>g.rows[i]); this._psLines=null; this.psReindex(gi,o=>(map[o]==null?o:map[o])); }
  psFreeLineNo(g){ const used=new Set(); ((g&&g.rows)||[]).forEach(r=>this.parseNums(r.line).forEach(n=>used.add(n)));
    let n=1; while(used.has(n)) n++; return n; }
  psAddLine(gi){ const g=((window.PSCHED||{}).groups||[])[gi]; if(!g) return;
    const nm='LINE '+this.psFreeLineNo(g);
    g.rows=[...(g.rows||[]),{line:nm,cap:'',orders:[]}]; this._psLines=null;
    const xl={...(this.state.psXL||{})}; xl[gi]=[...(xl[gi]||[]),nm];
    const xd={...(this.state.psXD||{})}; xd[gi]=(xd[gi]||[]).filter(x=>x!==nm);
    this.setState({psXL:xl,psXD:xd});
    this.psSortGroup(gi); this.psTouch(); }
  psDelLine(gi,ri){ const g=((window.PSCHED||{}).groups||[])[gi]; if(!g) return;
    const r=(g.rows||[])[ri]; if(!r) return;
    if(this.psRowItems(gi,ri,r).length) return;             // còn đơn thì không xóa
    const nm=this.normName(r.line);
    g.rows=(g.rows||[]).filter((x,i)=>i!==ri); this._psLines=null;
    const xl={...(this.state.psXL||{})}; xl[gi]=(xl[gi]||[]).filter(x=>this.normName(x)!==nm);
    const xd={...(this.state.psXD||{})}; xd[gi]=[...(xd[gi]||[]),nm];
    this.setState({psXL:xl,psXD:xd});
    this.psReindex(gi,o=>(o===ri?null:(o>ri?o-1:o))); this.psTouch(); }
  // window.PSCHED được nạp lại từ file mỗi lần mở trang -> phát lại chuyền đã thêm/xóa
  psApplyLines(){ const ps=window.PSCHED; if(!ps||!ps.groups) return false;
    const xl=this.state.psXL||{}, xd=this.state.psXD||{}; let ch=false;
    ps.groups.forEach((g,gi)=>{ g.rows=g.rows||[];
      (xd[gi]||[]).forEach(nm=>{ const i=g.rows.findIndex(r=>this.normName(r.line)===this.normName(nm));
        if(i>=0&&!(g.rows[i].orders||[]).length){ g.rows.splice(i,1); ch=true; } });
      (xl[gi]||[]).forEach(nm=>{ if(!g.rows.some(r=>this.normName(r.line)===this.normName(nm))){
        g.rows.push({line:nm,cap:'',orders:[]}); ch=true; } });
      if(ch){ g.rows.sort((a,b)=>this.psLineNo(a.line)-this.psLineNo(b.line)); } });
    if(ch) this._psLines=null;
    return ch; }
  psTouch(){ clearTimeout(this._rcT); this._rcT=setTimeout(()=>this.reconcileWeeks(),0); }
  psDelOrder(){ const k=this.state.gsel, s=this.psSel(); if(!k||!s) return;
    const key=k.g+'|'+k.r+'|'+k.i, label=this.normName(s.r.line)+' · '+this.psLabel(s.o);
    if(String(k.i).charAt(0)==='x'){                     // don them tay -> xoa han
      const ek=k.g+'|'+k.r, n=Number(String(k.i).slice(1));
      this.setState(st=>{ const ex={...(st.psExtra||{})}; const arr=[...(ex[ek]||[])]; const o=arr[n];
        if(o==null) return {gsel:null};
        arr.splice(n,1); ex[ek]=arr;
        // cac don them tay phia sau tut 1 chi so -> don lai khoa psDel/psOver
        const shift=mp=>{ const out={}; Object.keys(mp||{}).forEach(kk=>{ const p=String(kk).split('|');
          if(p[0]===String(k.g)&&p[1]===String(k.r)&&String(p[2]).charAt(0)==='x'){
            const j=Number(String(p[2]).slice(1)); if(j===n) return; if(j>n) p[2]='x'+(j-1); }
          out[p.join('|')]=mp[kk]; }); return out; };
        return {psExtra:ex,psDel:shift(st.psDel),psOver:shift(st.psOver),
                psTrash:[...(st.psTrash||[]),{key,label,g:k.g,r:k.r,o}],gsel:null}; });
      this.psTouch(); return; }
    this.setState(st=>({psDel:{...(st.psDel||{}),[key]:true},psTrash:[...(st.psTrash||[]),{key,label}],gsel:null})); this.psTouch(); }
  psRestore(key){ const tr=(this.state.psTrash||[]).find(x=>x.key===key);
    if(tr&&tr.o){ this.setState(st=>{ const ex={...(st.psExtra||{})}; const ek=tr.g+'|'+tr.r;
        ex[ek]=[...(ex[ek]||[]),tr.o];
        const t=(st.psTrash||[]).filter(x=>x.key!==key);
        return {psExtra:ex,psTrash:t,psTrashOpen:t.length?st.psTrashOpen:false}; }); this.psTouch(); return; }
    this.setState(st=>{ const d={...(st.psDel||{})}; delete d[key];
    const t=(st.psTrash||[]).filter(x=>x.key!==key); return {psDel:d,psTrash:t,psTrashOpen:t.length?st.psTrashOpen:false}; }); this.psTouch(); }
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
    const k=f.g+'|'+f.r;
    this.setState(s=>{ const ex={...(s.psExtra||{})}; const arr=[...(ex[k]||[]),o]; ex[k]=arr;
      return {psExtra:ex,psAdd:null,files:f.file?[...s.files,{name:f.file}]:s.files,gsel:{g:f.g,r:f.r,i:'x'+(arr.length-1)}}; });
    this.psTouch(); setTimeout(()=>this.psScrollToCut(),200); }
  // Xếp làn (lane) cho từng chuyền: đơn chồng thời gian nằm làn riêng
  psLaneMap(gi,g,rows){
    const info=rows.map(()=>({lanes:1,place:{}}));
    const fits=(arr,s,e)=>!arr.some(x=>x.s<e&&x.e>s);
    rows.forEach((r,ri)=>{
      const items=this.psRowItems(gi,(g.rows||[]).indexOf(r),r), lanes=[[]];
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
  // i = so nguyen -> don tu file KHSX; i = 'x<n>' -> don them tay (nam trong psExtra)
  psOrderAt(g,r,i){ const gg=(this.PS().groups||[])[g]; if(!gg) return null;
    const rr=(gg.rows||[])[r]; if(!rr) return null;
    return (String(i).charAt(0)==='x'
      ? (((this.state.psExtra||{})[g+'|'+r])||[])[Number(String(i).slice(1))]
      : (rr.orders||[])[i])||null; }
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
        const items=this.psRowItems(gi,realRi,r);
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
              if(it.del) return h('div',{key:it.key,className:'ps-stub',title:this.t('psRestore'),onClick:()=>this.psRestore(it.key),
                style:{position:'absolute',boxSizing:'border-box',left:Math.round(gm.s*dw),width:Math.max(18,w),top:ltop,height:rowH-12,borderRadius:6,cursor:'pointer',border:'1.5px dashed #c6cdba',
                  background:'repeating-linear-gradient(45deg,#f5f7f0 0 5px,#eaeee1 5px 10px)',display:'flex',alignItems:'center',justifyContent:'center',color:C.primary,fontSize:15,fontWeight:700,lineHeight:1}},'+');
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
      if((this.state.psDel||{})[key]||(this.state.psOver||{})[key]) return;
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
    this.setState(s=>{ const ov={...(s.psOver||{})};
      (f.items||[]).forEach((it,i)=>{ if((f.pick||[])[i]==='inc') ov[it.key]={qty:it.inc.qty,start:it.inc.start,end:it.inc.end,src:f.file}; });
      return {psOver:ov,conf:null}; }); }
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
      if((e.ctrlKey||e.metaKey)&&(e.key==='z'||e.key==='Z')&&(this.state.psTrash||[]).length){ e.preventDefault(); this.psUndo(); } };
    document.addEventListener('keydown',this._esc);
    this.awaitData();
    setTimeout(()=>this.psGoToday(),160); }
  // Bản HTML rời nạp data/psched.js & data/khc.js không đồng bộ — chờ có dữ liệu rồi vẽ lại
  awaitData(){ this.ensureSeed(); this.reconcileWeeks(); let n=0;
    this._dataT=setInterval(()=>{ n++;
      const ready=window.PSCHED&&window.KHC&&window.KHC.__seed&&window.PSCHED.__seed;
      if(window.PSCHED&&window.KHC) this.ensureSeed();
      if(ready){ clearInterval(this._dataT); this._dataT=null; this.reconcileWeeks(); this.psGoToday(); }
      else if(n>240){ clearInterval(this._dataT); this._dataT=null; } },50); }
  componentWillUnmount(){ clearTimeout(this._pt); clearInterval(this._dataT); this.persist(); if(this._esc) document.removeEventListener('keydown',this._esc); document.body.classList.remove('kc-qr-open'); }

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

  renderCutTabs(){
    const h=React.createElement, C=this.C;
    const tabs=[['capacity',this.t('ctab1')],['plan',this.t('ctab2')]];
    return h('div',{style:{display:'inline-flex',gap:3,background:'#e7eadf',padding:4,borderRadius:12,marginBottom:20}},
      tabs.map(([id,label])=>{ const a=this.state.cutTab===id;
        return h('button',{key:id,onClick:()=>this.set({cutTab:id,edit:null}),style:{border:'none',cursor:'pointer',padding:'8px 18px',fontSize:13.5,fontWeight:600,color:a?C.dark:C.sub,background:a?'#fff':'transparent',borderRadius:9,fontFamily:'inherit',boxShadow:a?'0 1px 3px rgba(24,36,14,.14)':'none',transition:'background .15s,color .15s'}},label); }));
  }

  capPill(label,val){ const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    return h('div',{style:{border:'1px solid '+C.border,borderRadius:9,padding:'6px 13px',background:C.white}},
      h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},label),
      h('div',{style:{fontSize:13,fontWeight:700,color:C.ink,fontFamily:mono,marginTop:2,whiteSpace:'nowrap'}},val)); }

  renderCapPanel(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const multChip=(text,key,green)=>{ const col=green?C.primary:'#6b726a', bg=green?C.tint:'#eceee9', bd=green?'#dbe7cb':'#dcdfd8';
      return h('label',{title:this.t('capX7tip'),style:{display:'inline-flex',alignItems:'center',gap:7,fontSize:11,fontWeight:700,letterSpacing:'.2px',borderRadius:6,padding:'3px 5px 3px 10px',whiteSpace:'nowrap',color:col,background:bg,border:'1px solid '+bd}},
        text,
        h('input',{type:'number',min:0,max:60,value:this.multFor(!!green),onChange:ev=>this.setMult(key,ev.target.value),
          style:{width:40,border:'1px solid '+bd,borderRadius:5,background:C.white,color:col,fontFamily:mono,fontSize:12,fontWeight:700,textAlign:'center',padding:'2px 0'}})); };
    return h('div',{ref:this.panelRef,style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow}},
      this.renderPeriodBar(),
      h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'16px 22px 14px',borderBottom:'1px solid '+C.line}},
        h('div',{style:{marginRight:'auto'}},
          h('div',{style:{fontSize:16,fontWeight:700}},this.t('capTitle')),
          h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('capSub')+' · '+this.state.week)),
        this.capPill(this.t('factory'),'YIC Hà Nam'),
        h('button',{style:this.btn('ghost'),title:this.t('renumberTip'),onClick:()=>this.renumberTurns()},this.ic('copy'),this.t('renumber')),
        h('button',{style:this.btn('ghost'),title:this.t('capExportTip'),onClick:()=>this.exportCut()},this.ic('grid'),this.t('exportXls'))),
      h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:9,padding:'10px 20px',borderBottom:'1px solid '+C.line,background:C.offBg}},
        h('div',{style:{marginRight:'auto',display:'flex',alignItems:'center',gap:7,fontSize:11.5,color:C.faint}},
          h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'currentColor'},
            [[9,5],[15,5],[9,12],[15,12],[9,19],[15,19]].map(([cx,cy],i)=>h('circle',{key:i,cx:cx,cy:cy,r:1.9}))),
          this.t('dragHint')),
        multChip(this.t('capX3'),'multPlain',false), multChip(this.t('capX7'),'multEmb',true)),
      h('div',{style:{padding:'16px 12px 8px'}}, this.renderCapGrid()));
  }

  renderCapLegend(){
    const h=React.createElement, C=this.C;
    const sw=(bg,bd)=>h('span',{style:{width:13,height:13,borderRadius:3,background:bg,border:'1px solid '+bd,flex:'none'}});
    const item=(el,label)=>h('span',{style:{display:'inline-flex',alignItems:'center',gap:7,fontSize:11.5,color:C.sub}},el,label);
    return h('div',{style:{display:'flex',flexWrap:'wrap',gap:20,padding:'0 20px 16px'}},
      item(sw(C.white,'#cdd2c8'),this.t('lgMan')),
      item(sw('#f2f5f8','#d3dde5'),this.t('lgPull')),
      item(sw('#eef1ea','#d8ddd2'),this.t('lgCalc')));
  }

  renderCapGrid(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.capRows(), T=this.capTotals();
    const pad=this.dense?'6px 4px':'8px 4px';
    const e=this.state.edit; const ed=(id,col)=>e&&e.id===id&&e.col===col;
    const commit=fn=>({onBlur:ev=>{fn(ev.target.value);this.stopEdit();},onKeyDown:ev=>{if(ev.key==='Enter'){fn(ev.target.value);this.stopEdit();}else if(ev.key==='Escape')this.stopEdit();}});
    const inp={width:'100%',border:'2px solid '+C.primary,padding:pad,fontSize:12,fontFamily:mono,fontWeight:700,color:C.ink,background:C.white,textAlign:'center'};
    const W={stt:46,brand:72,style:150,emb:56,line:60,cut:72,iss:76,rem:76,wip1:60,ahead:78,sew:76,out:84,turns:118,po:72};
    const F0=0, F1=W.stt, F2=W.stt+W.brand;
    const dg=this.state.dragRow; this.rowEls=this.rowEls||{};
    const cb={borderRight:'1px solid '+C.line,borderBottom:'1px solid '+C.line,verticalAlign:'middle'};
    const gh={padding:'7px 6px',fontSize:10,fontWeight:700,letterSpacing:'.5px',textTransform:'uppercase',textAlign:'center',color:C.dark,background:'#eef2e6',borderRight:'1px solid '+C.line,borderBottom:'1px solid '+C.line,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'};
    const th={padding:'8px 4px',fontSize:10,fontWeight:700,letterSpacing:'.3px',textTransform:'uppercase',color:C.sub,textAlign:'center',background:'#f8faf3',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,verticalAlign:'middle',lineHeight:1.25};
    const stick=(left,z,bg,last)=>({position:'sticky',left:left,zIndex:z,background:bg,...(last?{borderRight:'2px solid #ced3c8'}:{})});
    const totalW=W.stt+W.brand+W.style+W.emb+W.line+W.cut+W.iss+W.rem+W.wip1+W.ahead+W.sew+W.out+W.turns+W.po;

    const groups=[[this.t('gInfo'),4,true],[this.t('gLine2'),1],[this.t('gWip'),3],[this.t('gCalc'),4],[this.t('gOrder'),2]];
    const groupRow=h('tr',null, groups.map(([label,span,frozen],i)=>
      h('th',{key:i,colSpan:span,title:label,style:{...gh,...(frozen?{position:'sticky',left:0,zIndex:6}:{})}},label)));

    const headRow=h('tr',null,
      h('th',{key:'stt',title:this.t('tStt'),style:{...th,...stick(F0,5,'#fbfcfa')}},this.t('cStt')),
      h('th',{key:'brand',style:{...th,...stick(F1,5,'#fbfcfa')}},this.t('colBrand')),
      h('th',{key:'style',style:{...th,...stick(F2,5,'#fbfcfa',true)}},this.t('colStyle')),
      h('th',{key:'emb',title:this.t('tEmb'),style:th},this.t('cEmb2')),
      h('th',{key:'line',style:th},this.t('colLine')),
      h('th',{key:'cut',title:this.t('tCut'),style:th},this.t('cCut')),
      h('th',{key:'iss',title:this.t('tIss'),style:th},this.t('cIss')),
      h('th',{key:'rem',title:this.t('tRem'),style:th},this.t('cRem')),
      h('th',{key:'wip1',title:this.t('tWip1'),style:th},this.t('cWip1')),
      h('th',{key:'ahead',title:this.t('tAhead'),style:th},this.t('cAhead')),
      h('th',{key:'sew',title:this.t('tSew'),style:th},this.t('cSew')),
      h('th',{key:'out',title:this.t('tOut'),style:{...th,color:C.dark,background:C.tint}},this.t('cOut')),
      h('th',{key:'turns',title:this.t('tTurns'),style:th},this.t('cTurns')),
      h('th',{key:'po',title:this.t('tPo'),style:{...th,borderRight:'none'}},this.t('cPo')));

    const body=rows.map((r,idx)=>{
      const v=this.capVals(r); const stripe=idx%2===1;
      const isDrag=!!dg&&dg.id===r.id;
      let shift=0;
      if(dg&&!isDrag){ if(dg.from<dg.to&&idx>dg.from&&idx<=dg.to) shift=-dg.h; else if(dg.from>dg.to&&idx>=dg.to&&idx<dg.from) shift=dg.h; }
      const dispIdx=dg?(isDrag?dg.to:(shift<0?idx-1:(shift>0?idx+1:idx))):idx;
      const rbg=stripe?'#f7f9f3':C.white, pbg=stripe?'#ecf0f4':'#f2f5f8', cbg=stripe?'#e9ede4':'#eef1ea';
      const num=(field,val,tip)=>ed(r.id,field)
        ? h('td',{key:field,style:{...cb,padding:0,background:C.tint}},h('input',Object.assign({type:'number',autoFocus:true,defaultValue:val,style:inp},commit(x=>this.setCap(r.id,field,x)))))
        : h('td',{key:field,onClick:()=>this.startEdit(r.id,field),title:tip,style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:11.5,fontWeight:600,color:val?C.ink:'#c3c8bf',cursor:'pointer',background:rbg}},this.fmtn(val));
      const pull=(key,val,tip)=>h('td',{key:key,title:tip,style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:11.5,fontWeight:val?600:400,color:val?'#41627e':'#b6c2cc',background:pbg}},this.fmtn(val));
      const calc=(key,val,tip,hero)=>h('td',{key:key,title:tip,style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:hero?12.5:11.5,fontWeight:hero?700:600,
        color:val?(hero?C.dark:C.sub):'#c3c8bf',background:hero?(stripe?'#e7f0dc':C.tint):cbg}},this.fmtn(val));
      const emb=r.emb==='THÊU';
      const cells=[
        h('td',{key:'stt',title:this.t('tStt'),style:{...cb,...stick(F0,2,rbg),padding:'0 4px',textAlign:'center',cursor:isDrag?'grabbing':'grab'}},
          h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:4}},
            h('svg',{className:'grip',width:9,height:14,viewBox:'0 0 9 14',fill:'currentColor',style:{color:isDrag?C.primary:C.faint,flex:'none'}},
              [[2,3],[7,3],[2,7],[7,7],[2,11],[7,11]].map(([cx,cy],i)=>h('circle',{key:i,cx:cx,cy:cy,r:1.3}))),
            h('span',{style:{fontFamily:mono,fontSize:11,fontWeight:700,color:isDrag?C.primary:C.sub}},dispIdx+1))),
        h('td',{key:'brand',style:{...cb,...stick(F1,2,rbg),padding:pad,fontSize:11,fontWeight:600,color:C.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},r.brand),
        h('td',{key:'style',style:{...cb,...stick(F2,2,rbg,true),padding:pad,fontSize:11,fontFamily:mono,color:C.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},r.style),
        h('td',{key:'emb',style:{...cb,padding:pad,textAlign:'center',background:rbg}},
          h('button',{role:'checkbox','aria-checked':emb,onClick:()=>this.setCap(r.id,'emb',emb?'KHÔNG':'THÊU'),title:this.t('tEmb'),
            style:{display:'inline-flex',alignItems:'center',justifyContent:'center',width:22,height:22,borderRadius:'50%',border:emb?'none':'1.5px solid #cdd2c8',background:emb?C.primary:'#fff',color:emb?'#fff':'#b9bfb4',padding:0,cursor:'pointer',verticalAlign:'middle',transition:'background .15s,border-color .15s'}},
            emb
              ? h('svg',{width:12,height:12,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:3.2,strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M20 6 9 17l-5-5'}))
              : h('svg',{width:11,height:11,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2.6,strokeLinecap:'round'},h('path',{d:'M18 6 6 18M6 6l12 12'})))),
        h('td',{key:'line',style:{...cb,padding:pad,textAlign:'center',fontSize:11,fontWeight:600,color:C.sub,background:rbg,whiteSpace:'nowrap'}},r.line),
        num('cut',r.cut,this.t('tCut')),
        num('iss',r.iss,this.t('tIss')),
        calc('rem',v.rem,this.t('tRem')),
        pull('wip1',v.wip1,this.t('tWip1')+(v.linked?'':'  ·  '+this.t('tNoBd'))),
        calc('ahead',v.ahead,this.t('tAhead')+'  ·  '+this.fmtn(v.wip1)+' × '+v.mult),
        pull('sew',v.sew,this.t('tSew')+(v.linked?'':'  ·  '+this.t('tNoBd'))),
        calc('out',v.out,this.t('tOut')+'  ·  '+this.fmtn(v.sew)+' + '+this.fmtn(v.ahead)+' − '+this.fmtn(v.rem),true),
        (()=>{ const sum=v.list.reduce((a,x)=>a+(Number(x.q)||0),0);
          return h('td',{key:'turns',style:{...cb,padding:'5px 5px',background:rbg}},
            v.ooo
              ? h('div',{style:{textAlign:'center'}},h('span',{style:{display:'inline-block',fontSize:9.5,fontWeight:700,color:'#c0392b',background:'#fdeceb',border:'1px solid #f6d6d3',borderRadius:5,padding:'2px 5px'}},this.t('capOoo')))
              : h('div',{title:this.t('tTurns')+'  ·  Σ '+this.fmtn(sum)+' pcs',
                  className:'yscroll',style:{display:'flex',flexWrap:'wrap',gap:3,justifyContent:'center',maxHeight:58,overflowY:'auto',borderRadius:6,padding:'2px 0'}},
                  v.list.length? v.list.map((s,i)=>h('span',{key:i,
                    style:{fontSize:10,fontWeight:700,fontFamily:mono,color:C.primary,background:C.tint,border:'1px solid #dbe7cb',borderRadius:4,padding:'2px 5px'}},s.c))
                    : h('span',{style:{fontSize:11,color:'#b9bfb4'}},'—'))); })(),
        (()=>{ const po=this.capPo(r);
          return h('td',{key:'po',title:this.t('tPo'),style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:10.5,fontWeight:po?600:400,color:po?'#41627e':'#b6c2cc',background:pbg,borderRight:'none',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},po||'—'); })()
      ];
      const trStyle=isDrag
        ? {transform:'translateY('+dg.dy+'px)',position:'relative',zIndex:9,boxShadow:'0 14px 30px rgba(20,26,20,.24)',cursor:'grabbing'}
        : {opacity:v.ooo?.62:1,transform:shift?'translateY('+shift+'px)':'none',transition:dg?'transform .16s ease':'none'};
      return h('tr',{key:r.id,ref:el=>{ this.rowEls=this.rowEls||{}; this.rowEls[r.id]=el; },
        className:'cap-row'+(isDrag?' lift':''),onPointerDown:ev=>this.rowPress(ev,r.id,idx),style:trStyle},cells);
    });

    const tf={padding:pad,textAlign:'center',fontFamily:mono,fontSize:11.5,fontWeight:700,color:'#fff',background:C.dark,borderRight:'1px solid rgba(255,255,255,.18)'};
    const totalRow=h('tr',null,
      h('th',{key:'n',colSpan:4,style:{...tf,textAlign:'left',paddingLeft:12,letterSpacing:'.5px',position:'sticky',left:0,zIndex:2}},'TOTAL'),
      h('td',{key:'line',style:tf},''),
      h('td',{key:'cut',style:tf},this.fmtn(T.cut)), h('td',{key:'iss',style:tf},this.fmtn(T.iss)), h('td',{key:'rem',style:tf},this.fmtn(T.rem)),
      h('td',{key:'wip1',style:tf},this.fmtn(T.wip1)), h('td',{key:'ahead',style:tf},this.fmtn(T.ahead)), h('td',{key:'sew',style:tf},this.fmtn(Math.round(T.sew))),
      h('td',{key:'out',style:{...tf,fontSize:14}},this.fmtn(Math.round(T.out))),
      h('td',{key:'turns',title:this.t('tTotTurns'),style:tf},T.tc+' '+(this.state.lang==='vi'?'lượt':'turns')),
      h('td',{key:'po',style:{...tf,borderRight:'none'}},''));

    return h('div',{className:'yscroll',style:{border:'1px solid '+C.border,borderRadius:12,overflow:'auto'}},
      h('table',{onClickCapture:ev=>{ if(this._noClick){ ev.stopPropagation(); ev.preventDefault(); } },style:{width:'100%',minWidth:totalW+'px',borderCollapse:'separate',borderSpacing:0,tableLayout:'fixed'}},
        h('colgroup',null,
          h('col',{style:{width:W.stt+'px'}}),
          h('col',{style:{width:W.brand+'px'}}),h('col',{style:{width:W.style+'px'}}),
          h('col',{style:{width:W.emb+'px'}}),
          h('col',{style:{width:W.line+'px'}}),
          h('col',{style:{width:W.cut+'px'}}),h('col',{style:{width:W.iss+'px'}}),h('col',{style:{width:W.rem+'px'}}),
          h('col',{style:{width:W.wip1+'px'}}),h('col',{style:{width:W.ahead+'px'}}),h('col',{style:{width:W.sew+'px'}}),h('col',{style:{width:W.out+'px'}}),
          h('col',{style:{width:W.turns+'px'}}),h('col',{style:{width:W.po+'px'}})),
        h('thead',null,groupRow,headRow),
        h('tbody',null,body,totalRow)));
  }

  renderCutPlanPanel(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const dates=this.weekDates(), caps=this.capRows();
    let ordered=0; caps.forEach(r=>{ ordered+=this.capVals(r).list.length; });
    let placed=0; this.DAYS.forEach(d=>{ const dr=(this.state.daily||{})[this.state.week+'|'+d];
      if(dr) placed+=dr.filter(r=>r.k&&r.tc).length;
      else this.CUTPLAN.forEach(b=>{ if(b.days[d]) placed++; }); });
    const stat=(label,val,tone)=>h('div',{style:{display:'inline-flex',alignItems:'baseline',gap:8,border:'1px solid '+C.border,borderRadius:9,padding:'7px 13px',background:C.white}},
      h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},label),
      h('span',{style:{fontSize:16,fontWeight:700,fontFamily:mono,color:tone||C.ink}},val));
    const dayJobs=d=>{ const out=[]; this.CUTPLAN.forEach(b=>{ const s=b.days[d]; if(!s) return; const src=caps[b.row]; if(!src) return;
      const t=((this.state.capTurns||{})[src.id]||[])[s.slot]; out.push({src,code:t?t.c:'',qty:(t&&Number(t.q))||Number(s.qty)||0}); }); return out; };
    const allWks=[]; Object.values(this.MONTHS).forEach(ws=>ws.forEach(w=>allWks.push(w)));
    const wi=allWks.indexOf(this.state.week), ci2=allWks.indexOf(this.CURWK), maxI=Math.min(ci2+1,allWks.length-1);
    const goWk=j=>{ if(j<0||j>maxI) return; this.set({week:allWks[j],openMonth:allWks[j].split(' · ')[0],dayOpen:null}); };
    const navBtn=(dir,dis)=>h('button',{onClick:()=>goWk(wi+dir),disabled:dis,
      style:{width:28,height:28,border:'1px solid '+C.border,borderRadius:8,background:dis?'#f2f3ef':C.white,color:dis?'#c3c8bf':C.ink,cursor:dis?'default':'pointer',fontSize:15,fontFamily:'inherit',lineHeight:1,padding:0}},dir<0?'‹':'›');
    const tone=wi<ci2?{bg:'#eef0ea',fg:C.sub,label:this.t('cpPast')}:(wi===ci2?{bg:C.tint,fg:C.dark,label:this.t('cpThis')}:{bg:'#fdf6e8',fg:'#9a6b15',label:this.t('cpNext')});
    const weekBar=h('div',null,this.renderPeriodBar(),
      h('div',{style:{display:'flex',alignItems:'center',gap:9,padding:'7px 14px',borderBottom:'1px solid '+C.line,background:C.offBg}},
        h('span',{style:{fontSize:11,fontFamily:mono,fontWeight:600,color:C.faint}},this.wkRange()),
        h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',background:tone.bg,color:tone.fg,borderRadius:6,padding:'3px 8px'}},tone.label),
        h('div',{style:{flex:1}}), navBtn(-1,wi<=0), navBtn(1,wi>=maxI)));
    const today=new Date(); const isCurWk=this.state.week===this.CURWK;
    const todayIdx=isCurWk?[1,2,3,4,5,6].indexOf(today.getDay()):-1;
    const hd=h('div',{style:{display:'grid',gridTemplateColumns:'repeat(6,1fr)',borderBottom:'2px solid '+C.border,background:'#f8faf3'}},
      this.DAYS.map((d,i)=>{ const isToday=i===todayIdx;
        return h('div',{key:d,style:{padding:'7px 10px 8px',textAlign:'center',borderRight:i<5?'1px solid '+C.line:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:isToday?C.tint:'transparent'}},
          h('span',{style:{fontSize:10,fontWeight:700,letterSpacing:'.6px',textTransform:'uppercase',color:isToday?C.dark:C.sub}},this.dayLabel(d,i)),
          h('span',{style:{width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,fontFamily:mono,background:isToday?C.primary:'transparent',color:isToday?'#fff':C.ink}},String(dates[i]).split('-')[0])); }));
    const openD=this.state.dayOpen;
    const calRow=h('div',{style:{display:'grid',gridTemplateColumns:'repeat(6,1fr)'}},
      this.DAYS.map((d,i)=>{
        const jobs=dayJobs(d);
        const drows=(this.state.daily||{})[this.state.week+'|'+d];
        const sched=drows?drows.filter(r=>r.k):null;
        const items=sched?sched.map(r=>{ const c=caps.find(x=>x.id===r.k)||{}; const t2=(((this.state.capTurns||{})[r.k])||[]).find(x=>x.c===r.tc); return {code:r.tc,style:c.style||'',qty:t2?Number(t2.q)||0:this.codeQty(c.style,r.tc,c.po)}; }):jobs.map(j=>({code:j.code,style:j.src.style,qty:j.qty}));
        const tbs=sched?new Set(sched.map(r=>r.tb)).size:jobs.length;
        const tot=items.reduce((a,x)=>a+x.qty,0);
        const isSel=openD===d; const dim=!!openD&&!isSel; const isToday=i===todayIdx;
        return h('div',{key:d,onClick:()=>this.openDay(d,this.state.week),title:this.t('dpHeadHint'),
          style:{minHeight:150,padding:'10px 8px',borderRight:i<5?'1px solid '+C.line:'none',cursor:'pointer',background:isSel?C.tint2:(isToday?'#fdfef9':C.white),boxShadow:isSel?'inset 0 0 0 2px '+C.primary:'none',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,opacity:dim?.38:1,transition:'background .12s,opacity .15s,box-shadow .12s'},'style-hover':isSel?{}:{background:C.tint2,boxShadow:'inset 0 0 0 2px '+C.primary}},
          h('span',{style:{fontSize:items.length?54:38,fontWeight:700,fontFamily:mono,letterSpacing:'-2px',lineHeight:1,color:items.length?(isSel?C.dark:C.primary):'#d7dbd1'}},items.length||'0'),
          h('span',{style:{fontSize:11,fontWeight:700,letterSpacing:'.6px',textTransform:'uppercase',color:items.length?C.sub:'#c3c8bf'}},this.t('cpTurnU')));
      }));
    const di2=openD?this.DAYS.indexOf(openD):-1;
    const detail=openD?h('div',{ref:this.dailyRef,style:{borderTop:'2px solid '+C.primary,background:'#fbfcf9',padding:'12px 14px'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:8}},
        h('span',{style:{background:C.dark,color:'#fff',borderRadius:7,padding:'3px 10px',fontSize:11,fontWeight:700,fontFamily:mono}},this.dayLabel(openD,di2)+' · '+dates[di2]),
        h('span',{style:{fontSize:11.5,fontWeight:700,color:C.ink}},this.t('dpTitle')),
        h('button',{onClick:()=>this.set({dayOpen:null}),title:this.t('dpClose'),
          style:{marginLeft:'auto',width:24,height:24,border:'1px solid '+C.border,borderRadius:7,background:C.white,color:C.sub,fontSize:14,cursor:'pointer',fontFamily:'inherit',lineHeight:1,padding:0}},'×')),
      this.renderDailyPanel()):null;
    return h('div',{ref:this.panelRef,style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow}},
      weekBar,
      h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'14px 22px 12px',borderBottom:'1px solid '+C.line}},
        h('div',{style:{marginRight:'auto'}},
          h('div',{style:{fontSize:16,fontWeight:700}},this.t('cutPlanTitle')),
          h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('cutPlanSub')+' · '+this.state.week)),
        stat(this.t('cpOrdered'),String(ordered)),
        stat(this.t('cpSched'),String(placed),C.primary)),
      h('div',null,hd,calRow,detail));
  }

  seedDaily(day){ const caps=this.capRows(); const rows=[]; let n=0;
    this.CUTPLAN.forEach(b=>{ const s=b.days[day]; if(!s) return; const src=caps[b.row]; if(!src) return;
      const mc='ABC'[n%3]; rows.push({id:'dj'+day+'-'+n,mc,tb:this.MACH[mc][0],seq:String(Math.floor(n/3)+1),k:src.id,tc:this.dTurn(src,day).code,fi:this.fabOf(src.style)[0].vl}); n++; });
    return rows; }
  openDay(d,wk){ this.setState(s=>{ const week=wk||s.week; const key=week+'|'+d;
    const daily=s.daily[key]?s.daily:{...s.daily,[key]:this.seedDaily(d)};
    const same=s.dayOpen===d&&s.week===week;
    return {week,dayOpen:same?null:d,daily}; },()=>{ if(!this.state.dayOpen) return;
    setTimeout(()=>{ const el=this.dailyRef.current, sc=this.scrollRef.current; if(!el||!sc) return;
      const top=el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-16;
      sc.scrollTo({top,behavior:'smooth'}); },60); }); }
  dRows(){ return this.state.daily[this.state.week+'|'+this.state.dayOpen]||[]; }
  mutD(fn){ this.setState(s=>{ const key=s.week+'|'+s.dayOpen; const daily={...s.daily}; daily[key]=fn([...(daily[key]||[])]); return {daily}; }); }
  addD(){ this.mutD(rows=>[...rows,{id:'dj'+Date.now(),mc:'A',tb:'1',seq:'',k:'',tc:'',fi:''}]); }
  setD(id,patch){ this.mutD(rows=>rows.map(r=>r.id===id?{...r,...patch}:r)); }
  delD(id){ this.mutD(rows=>rows.filter(r=>r.id!==id)); }
  dTurn(r,day){ const caps=this.capRows(); const ci=caps.findIndex(x=>x.id===r.id);
    const b=this.CUTPLAN.find(x=>x.row===ci&&x.days[day]); const cat=this.cutTurns(r.style,r.po)||[];
    let code='',k=0;
    if(b){ k=b.days[day].slot; const t=((this.state.capTurns||{})[r.id]||[])[k]; if(t) code=t.c; }
    const ct=cat.length?cat[k%cat.length]:null;
    return {code,layers:ct?ct.layers:0,marker:ct?ct.marker:''}; }

  renderDailyPanel(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const day=this.state.dayOpen, caps=this.capRows(), rows=this.dRows();
    const th={padding:'8px 8px',fontSize:10,fontWeight:700,letterSpacing:'.3px',textTransform:'uppercase',color:C.sub,textAlign:'center',background:'#f8faf3',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,lineHeight:1.3};
    const td={borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,padding:'5px 6px',textAlign:'center',verticalAlign:'middle',background:C.white};
    const sel={width:'100%',border:'1px solid '+C.border,borderRadius:7,padding:'6px 5px',fontSize:11.5,fontFamily:'inherit',fontWeight:600,color:C.ink,background:C.white,cursor:'pointer'};
    const body=rows.map(e=>{
      const r=caps.find(x=>x.id===e.k)||null;
      const seqV=String(e.seq||'').trim();
      const dup=!!seqV&&rows.some(o=>o.id!==e.id&&String(o.seq||'').trim()===seqV&&((e.mc!=='T'&&o.mc===e.mc)||o.tb===e.tb));
      const codes=r?(((this.state.capTurns||{})[r.id])||[]):[];
      const fb=r?this.fabOf(r.style):null;
      return h('tr',{key:e.id},
        h('td',{style:td},h('select',{value:e.mc,onChange:ev=>{ const v=ev.target.value; this.setD(e.id,{mc:v,tb:this.MACH[v].includes(e.tb)?e.tb:this.MACH[v][0]}); },style:{...sel,fontFamily:mono,fontWeight:700}},
          ['A','B','C'].map(m=>h('option',{key:m,value:m},this.t('dpMcOpt')+' '+m)),
          h('option',{value:'T'},this.t('dpHand')))),
        h('td',{style:td},h('select',{value:e.tb,onChange:ev=>this.setD(e.id,{tb:ev.target.value}),style:{...sel,fontFamily:mono,fontWeight:700}},
          this.MACH[e.mc].map(b2=>h('option',{key:b2,value:b2},this.t('dpTbOpt')+' '+b2)))),
        h('td',{style:td},
          h('input',{type:'number',min:1,max:99,step:1,value:e.seq,onChange:ev=>this.setD(e.id,{seq:ev.target.value.replace(/[^0-9]/g,'').slice(0,2)}),title:dup?this.t('dpDup'):this.t('dpSeqTip'),
            style:{width:'100%',border:'1px solid '+(dup?'#d64545':C.border),background:dup?'#fdf1f1':C.white,color:dup?'#b02a2a':C.ink,borderRadius:7,padding:'6px 4px',fontSize:12,fontWeight:700,fontFamily:mono,textAlign:'center'}}),
          dup?h('div',{style:{fontSize:8.5,color:'#c03535',fontWeight:700,marginTop:2,lineHeight:1.2}},this.t('dpDupShort')):null),
        h('td',{style:{...td,textAlign:'left'}},h('select',{value:e.k,onChange:ev=>{ const k=ev.target.value; const c=caps.find(x=>x.id===k); this.setD(e.id,{k,tc:c?this.dTurn(c,day).code:'',fi:c?this.fabOf(c.style)[0].vl:''}); },style:{...sel,color:e.k?C.ink:C.faint}},
          h('option',{value:''},this.t('dpPick')),
          caps.map(c=>h('option',{key:c.id,value:c.id},c.brand+' · '+c.style+(c.po?' · PO '+c.po:''))))),
        h('td',{style:td,title:this.t('dpFabTip')},r?h('select',{value:e.fi||'',onChange:ev=>this.setD(e.id,{fi:ev.target.value}),
          style:{...sel,fontFamily:mono,fontWeight:700}},
          fb.map(f=>h('option',{key:f.vl,value:f.vl},f.vl+' · '+this.fmtn(f.tot)))):h('span',{style:{color:C.faint}},'—')),
        h('td',{style:td,title:this.t('dpLayTip')},r&&codes.length?h('select',{value:e.tc||'',onChange:ev=>this.setD(e.id,{tc:ev.target.value}),
          style:{...sel,fontFamily:mono,fontWeight:700,color:e.tc?C.primary:C.faint}},
          h('option',{value:''},this.t('dpPickTurn')),
          codes.map(t2=>h('option',{key:t2.c,value:t2.c},t2.c+' · '+this.fmtn(t2.q)))):h('span',{style:{color:C.faint}},'—')),
        h('td',{style:{...td,borderRight:'none'}},h('button',{onClick:()=>this.delD(e.id),title:this.t('dpDel'),
          style:{width:22,height:22,border:'1px solid '+C.border,borderRadius:6,background:C.white,color:C.faint,fontSize:13,lineHeight:1,cursor:'pointer',fontFamily:'inherit',padding:0}},'×')));
    });
    body.push(h('tr',{key:'add'},h('td',{colSpan:7,style:{...td,borderRight:'none',padding:'6px 8px'}},
      h('button',{onClick:()=>this.addD(),style:{width:'100%',border:'1px dashed '+C.border,borderRadius:7,background:'transparent',color:C.faint,fontSize:11,fontWeight:600,fontFamily:'inherit',padding:'7px',cursor:'pointer'}},'+ '+this.t('dpAdd')))));
    return h('div',{className:'yscroll',style:{overflow:'auto',border:'1px solid '+C.border,borderRadius:10,background:C.white}},
      h('table',{style:{width:'100%',minWidth:'880px',borderCollapse:'separate',borderSpacing:0,tableLayout:'fixed'}},
        h('colgroup',null,[100,96,64,null,150,150,36].map((w,i)=>h('col',{key:i,style:w?{width:w+'px'}:null}))),
        h('thead',null,h('tr',null,['dpMc','dpTb','dpSeq','dpStylePo','dpFab','dpLay',''].map((k,i)=>
          h('th',{key:i,style:{...th,textAlign:i===3?'left':'center',borderRight:i===6?'none':th.borderRight}},k?this.t(k):'')))),
        h('tbody',null,body)));
  }

  exportCut(){
    const X=window.XLSX;
    if(!X){ window.alert('Thư viện Excel chưa tải xong — thử lại sau vài giây.'); return; }
    const rows=this.capRows(), T=this.capTotals(), wk=this.state.week, dates=this.weekDates();
    const wb=X.utils.book_new();
    const add=(name,aoa,cols)=>{ const ws=X.utils.aoa_to_sheet(aoa); ws['!cols']=cols.map(w=>({wch:w})); X.utils.book_append_sheet(wb,ws,name); };
    const dayHead=this.DAYS.map((d,i)=>d.toUpperCase()+' '+dates[i]);
    const a1=[['WEEKLY CUTTING CAPACITY'],['(Đơn Đặt Năng Lực Cắt Hàng Tuần)'],
      ['Nhà máy (Factory)','YIC Hà Nam'],['Tuần (Week)',this.wkRange()],
      ['Hàng ko in thêu là cắt trước 3 ngày, hàng in thêu cắt trước 6 ngày'],[],
      ['#','NHÀ MÁY','BRAND','STYLE #','THÊU/KHÔNG IN THÊU','LINE','TỔNG WIP ĐÃ CẮT','TỔNG ĐÃ CẤP CHO CHUYỀN','WIP TỒN ĐẾN CUỐI TUẦN','WIP 1 NGÀY','TỔNG WIP CẦN CẮT TRƯỚC','TỔNG MAY CẦN','SẢN LƯỢNG CẮT','LƯỢT CẮT','PO']];
    rows.forEach(r=>{ const v=this.capVals(r);
      a1.push([r.n,'YIC Hà Nam',r.brand,r.style,r.emb,r.line,Number(r.cut)||0,Number(r.iss)||0,v.rem,v.wip1,v.ahead,v.sew,v.out,v.ooo?'Out of order':v.list.map(x=>x.c).join(', '),r.po||'']); });
    a1.push(['TOTAL','','','','','',T.cut,T.iss,T.rem,T.wip1,T.ahead,T.sew,T.out,T.tc,'']);
    add('Cutting Capacity',a1,[5,12,12,16,15,13,14,16,16,11,17,13,13,20,17]);
    const a2=[['WEEKLY CUTTING SCHEDULE'],['(Kế Hoạch Cắt Tuần)'],[],['BRAND','',...dayHead,'SUMMARY']];
    this.CUTPLAN.forEach(b=>{
      const src=rows[b.row]||{}; const codes=(this.state.capTurns||{})[src.id]||[];
      const g=fn=>this.DAYS.map(d=>{ const s=b.days[d]; return s?fn(s):''; });
      const turns=this.DAYS.map(d=>{ const s=b.days[d]; const t=s&&codes[s.slot]; return t?t.c:''; }).filter(Boolean);
      const qtyOf=s=>{ const t=codes[s.slot]; return (t&&Number(t.q))||Number(s.qty)||0; };
      const tot=this.DAYS.reduce((a,d)=>a+(b.days[d]?qtyOf(b.days[d]):0),0);
      a2.push([src.brand,'Style',...g(()=>src.style),'']);
      a2.push(['','PO',...g(()=>src.po),'']);
      a2.push(['','Cutting turn',...g(s=>{ const t=codes[s.slot]; return t?t.c:''; }),turns.join(', ')]);
      a2.push(['','Total quantity',...g(qtyOf),tot]);
    });
    add('Cutting Plan',a2,[14,14,...this.DAYS.map(()=>15),18]);
    X.writeFile(wb,('YIC-HaNam_Cutting_'+wk).replace(/[^0-9A-Za-z]+/g,'-').replace(/-+$/,'')+'.xlsx');
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

  // ============== F · KẾ HOẠCH CẤP VẢI TUẦN / G · KẾ HOẠCH LÀM VIỆC KHO ==============
  FTYPES=[['Dệt thoi (Woven)','Woven'],['Thun Single Jersey','Single Jersey'],['Thun Rib / Interlock','Rib / Interlock'],['Thun Spandex','Spandex'],['Vải lót (Lining)','Lining']];
  frHash(s){ let n=2166136261; String(s).split('').forEach(c=>{ n^=c.charCodeAt(0); n=Math.imul(n,16777619); }); return Math.abs(n); }
  frType(item){ const t=this.FTYPES[this.frHash(item)%this.FTYPES.length]; return this.state.lang==='vi'?t[0]:t[1]; }
  frEst(qty,item){ const f=1.15+(this.frHash(String(item)+'y')%60)/100; return Math.round((Number(qty)||0)*f*10)/10; }
  frDayName(i){ return (this.state.lang==='vi'?['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7']:['Mon','Tue','Wed','Thu','Fri','Sat'])[i]||''; }
  // Lượt cắt sổ xuống lấy từ kế hoạch cắt — đã xếp lịch ngày thì mang theo ngày cắt
  frPool(){ const sched={};
    this.DAYS.forEach((d,i)=>{ (((this.state.daily||{})[this.state.week+'|'+d])||[]).forEach(r=>{ if(r.k&&r.tc) sched[r.k+'|'+r.tc]=i; }); });
    return this.frPoolBase().map(t=>({...t,day:sched[t.rowId+'|'+t.code]})); }
  frPoolBase(){ return this.turnCatalog(); }
  frInfo(rowId,code){ if(!rowId||!code) return null;
    this._frC=this._frC||{}; const ck=rowId+'|'+code+'|'+this.state.lang;
    if(this._frC[ck]) return this._frC[ck];
    const r=this.capRows().find(x=>x.id===rowId); if(!r) return null;
    let sec=null,pl=null,tb=null,sIdx=0;
    this.khcPlansFor(r.style).forEach(p=>{ let n=0; (p.sections||[]).forEach(s=>{ if(s.grp==='aux') return;
      const t=(s.tables||[]).find(x=>x.tb===code); if(t){ sec=s; pl=p; tb=t; sIdx=n; } n++; }); });
    const fabs=this.fabOf(r.style);
    const cols=this.cutColors(r.style);
    const label=(sec&&sec.fab)||((fabs[0]||{}).vl)||'—'; const up=String(label).toUpperCase();
    let color=cols.find(c=>up.indexOf(String(c).toUpperCase().slice(0,4))>=0);
    if(!color){ let ix=fabs.findIndex(f=>f.vl===label); if(ix<0) ix=0; color=cols[ix%cols.length]; }
    // Item vải: mã item của mã hàng — ưu tiên danh mục vải, nếu chưa có thì lấy nhãn màu/vải của tác nghiệp cắt
    const cds=this.FAB[this.sKey(r.style)]||[];
    const item=cds.length?cds[sIdx%cds.length].vl:label;
    const po=(sec&&sec.qrPo)||(pl&&pl.qrPo)||this.capPo(r)||r.po||'';
    const hit=(((this.state.capTurns||{})[rowId])||[]).find(x=>x.c===code);
    const o={style:r.style,brand:r.brand,line:r.line,po:String(po).replace('PO ',''),item:item,color:color,
      type:this.frType(item),qty:hit?Number(hit.q)||0:(tb?this.kcPcs(tb):0),ly:tb?tb.ly:0};
    this._frC[ck]=o; return o; }
  frRows(){ const st=(this.state.freq||{})[this.state.week]; if(st) return st;
    const out=[], seen={};
    this.frPool().filter(t=>{ const k=t.style+'|'+t.code; if(seen[k]) return false; seen[k]=1; return true; })
      .slice(0,11).forEach((t,i)=>{
      const ci=t.day!=null?t.day:Math.min(5,1+Math.floor(i/2));
      const info=this.frInfo(t.rowId,t.code);
      out.push({id:'fr-'+t.rowId+'-'+t.code,di:Math.max(0,ci-1),ci:ci,rowId:t.rowId,code:t.code,
        y:info?this.frEst(t.qty,info.item):''}); });
    return out; }
  frMut(fn){ this.setState(s=>{ const cur=(((s.freq||{})[s.week])||this.frRows()).map(r=>({...r}));
    return {freq:{...(s.freq||{}),[s.week]:fn(cur)}}; }); }
  frAdd(di){ const id='fr'+Date.now().toString(36)+Math.floor(Math.random()*900+100);
    this.frMut(rows=>rows.concat([{id:id,di:di,ci:Math.min(5,di+1),rowId:'',code:'',y:''}])); }
  frSet(id,patch){ this.frMut(rows=>rows.map(r=>r.id===id?{...r,...patch}:r)); }
  frDel(id){ this.frMut(rows=>rows.filter(r=>r.id!==id)); }
  frStat(r){ const C=this.C, need=Number(r.y)||0, got=this.whTot(r.id);
    if(!got) return {label:this.t('frWait'),fg:'#69707a',bg:'#eef0ea',bd:'#e0e3dc'};
    if(got+0.05>=need) return {label:this.t('frDone')+' · '+this.fmtn(got)+' Y',fg:'#3d6b12',bg:C.tint,bd:'#d5e6b6'};
    return {label:'−'+this.fmtn(Math.round((need-got)*10)/10)+' Y',fg:'#b02a2a',bg:'#fdf1f1',bd:'#f0d6d6'}; }

  // Kho vải: mỗi item có nhiều Lot, mỗi Lot nhiều cây, mỗi cây một tem QR (số Y + Lot)
  whStock(item){ this._whS=this._whS||{}; if(this._whS[item]) return this._whS[item];
    const H=this.frHash(item), n=3+H%3, lots=[];
    for(let k=0;k<n;k++){ const h2=this.frHash(item+'#'+k), rn=6+h2%9, rolls=[];
      for(let j=0;j<rn;j++){ const h3=this.frHash(item+'#'+k+'#'+j);
        rolls.push({no:'R'+String(j+1).padStart(2,'0'),y:Math.round((44+h3%35+(h3%10)/10)*10)/10,
          bin:'A'+(1+h2%6)+'-'+String(1+h3%18).padStart(2,'0')}); }
      lots.push({id:'L'+(2600+(H%40)+k*3),rolls:rolls}); }
    this._whS[item]=lots; return lots; }
  whRollQr(item,lot,r){ return 'ITEM: '+this.qrAscii(item)+'\nLOT: '+lot+'\nROLL: '+r.no+'\nYARD: '+r.y+'\nBIN: '+r.bin; }
  whQr(text){ this._qrc=this._qrc||{}; if(this._qrc[text]!==undefined) return this._qrc[text];
    let src=null; try{ src=window.QRSvgUrl?window.QRSvgUrl(text,'#2b3d10'):null; }catch(e){ src=null; }
    this._qrc[text]=src; return src; }
  whKey(id){ return this.state.week+'|'+id; }
  whScans(id){ return (((this.state.wsc||{})[this.whKey(id)])||[]); }
  whTot(id){ return Math.round(this.whScans(id).reduce((a,r)=>a+(Number(r.y)||0),0)*10)/10; }
  whUsed(){ const m={}, w=this.state.wsc||{};
    Object.keys(w).forEach(k=>(w[k]||[]).forEach(r=>{ m[r.item+'|'+r.lot+'|'+r.no]=k; })); return m; }
  whAdd(id,item,lot,roll){ const used=this.whUsed(); if(used[item+'|'+lot+'|'+roll.no]) return false;
    const key=this.whKey(id);
    this.setState(s=>({wsc:{...(s.wsc||{}),[key]:(((s.wsc||{})[key])||[]).concat([{item:item,lot:lot,no:roll.no,y:roll.y,bin:roll.bin}])},whErr:''}));
    return true; }
  whRm(id,i){ const key=this.whKey(id);
    this.setState(s=>{ const cur=(((s.wsc||{})[key])||[]).slice(); cur.splice(i,1); return {wsc:{...(s.wsc||{}),[key]:cur}}; }); }
  whAuto(id,item,need){ const used=this.whUsed(); let tot=this.whTot(id); const add=[];
    this.whStock(item).forEach(L=>L.rolls.forEach(r=>{ if(tot>=need-0.05) return;
      if(used[item+'|'+L.id+'|'+r.no]) return;
      add.push({item:item,lot:L.id,no:r.no,y:r.y,bin:r.bin}); tot+=r.y; }));
    if(!add.length) return; const key=this.whKey(id);
    this.setState(s=>({wsc:{...(s.wsc||{}),[key]:(((s.wsc||{})[key])||[]).concat(add)},whErr:''})); }
  whFind(item,txt){ const s=String(txt||'').toUpperCase().replace(/\s+/g,' ');
    const rm=s.match(/R\s*0?(\d{1,2})/), lm=s.match(/L\s*(\d{3,5})/);
    if(!rm) return null;
    const no='R'+String(parseInt(rm[1],10)).padStart(2,'0'); const lots=this.whStock(item);
    const L=lm?lots.find(x=>x.id==='L'+lm[1]):null; const pool=L?[L]:lots; const used=this.whUsed();
    for(let i=0;i<pool.length;i++){ const r=pool[i].rolls.find(y=>y.no===no);
      if(r&&!used[item+'|'+pool[i].id+'|'+r.no]) return {lot:pool[i].id,roll:r}; }
    return null; }
  whItems(){ const out=[]; this.frRows().forEach(r=>{ const i=this.frInfo(r.rowId,r.code);
    if(i&&i.item&&out.indexOf(i.item)<0) out.push(i.item); }); return out; }
  openScan(r){ const i=this.frInfo(r.rowId,r.code)||{};
    this.set({whOpen:{id:r.id,item:i.item||'—',need:Number(r.y)||0,style:i.style||'',code:r.code,color:i.color||''},whQ:'',whErr:''}); }
  openStock(item){ this.set({whOpen:{item:item||(this.whItems()[0]||'—')},whQ:'',whErr:''}); }

  fgCards(cards){ const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    return h('div',{style:{display:'grid',gridTemplateColumns:'repeat('+cards.length+',1fr)',gap:12,marginBottom:16,maxWidth:1320}},
      cards.map((c,i)=>h('div',{key:i,style:{background:C.white,border:'1px solid '+C.border,borderRadius:13,padding:'11px 15px',boxShadow:C.shadow}},
        h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},c[0]),
        h('div',{style:{display:'flex',alignItems:'baseline',gap:7,marginTop:4}},
          h('span',{style:{fontSize:20,fontWeight:700,fontFamily:mono,letterSpacing:'-.4px',color:c[3]||C.ink}},c[1]),
          h('span',{style:{fontSize:10.5,color:C.faint,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},c[2]))))); }
  fgWeekBar(){ const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const all=[]; Object.values(this.MONTHS).forEach(ws=>ws.forEach(w=>all.push(w)));
    const wi=all.indexOf(this.state.week), ci=all.indexOf(this.CURWK), maxI=Math.min(ci+1,all.length-1);
    const go=j=>{ if(j<0||j>maxI) return; this.set({week:all[j],openMonth:all[j].split(' · ')[0]}); };
    const nav=(dir,dis)=>h('button',{key:dir,onClick:()=>go(wi+dir),disabled:dis,
      style:{width:28,height:28,border:'1px solid '+C.border,borderRadius:8,background:dis?'#f2f3ef':C.white,color:dis?'#c3c8bf':C.ink,cursor:dis?'default':'pointer',fontSize:15,fontFamily:'inherit',lineHeight:1,padding:0}},dir<0?'‹':'›');
    const tone=wi<ci?{bg:'#eef0ea',fg:C.sub,label:this.t('cpPast')}:(wi===ci?{bg:C.tint,fg:C.dark,label:this.t('cpThis')}:{bg:'#fdf6e8',fg:'#9a6b15',label:this.t('cpNext')});
    return h('div',null,this.renderPeriodBar(),
      h('div',{style:{display:'flex',alignItems:'center',gap:9,padding:'7px 14px',borderBottom:'1px solid '+C.line,background:C.offBg}},
        h('span',{style:{fontSize:11,fontFamily:mono,fontWeight:600,color:C.faint}},this.wkRange()),
        h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',background:tone.bg,color:tone.fg,borderRadius:6,padding:'3px 8px'}},tone.label),
        h('div',{style:{flex:1}}), nav(-1,wi<=0), nav(1,wi>=maxI))); }

  renderFabReqBody(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const dates=this.weekDates(), rows=this.frRows(), pool=this.frPool();
    const need=Math.round(rows.reduce((a,r)=>a+(Number(r.y)||0),0)*10)/10;
    const got=Math.round(rows.reduce((a,r)=>a+this.whTot(r.id),0)*10)/10;
    const short=Math.max(0,Math.round((need-got)*10)/10);
    const th={padding:'8px 8px',fontSize:9.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',color:C.sub,textAlign:'center',background:'#f8faf3',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,lineHeight:1.35};
    const td={borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,padding:'6px 8px',textAlign:'center',verticalAlign:'middle',background:C.white};
    const sel={width:'100%',border:'1px solid '+C.border,borderRadius:7,padding:'6px 5px',fontSize:11.5,fontFamily:'inherit',fontWeight:600,color:C.ink,background:C.white,cursor:'pointer'};
    const dash=h('span',{style:{color:'#c3c8bf'}},'—');
    const schedT=pool.filter(t=>t.day!=null), restT=pool.filter(t=>t.day==null);
    const optOf=t=>h('option',{key:t.rowId+'|'+t.code,value:t.rowId+'|'+t.code},t.code+' · '+t.style+' · '+this.fmtn(t.qty)+' pcs');
    const baseOpts=[h('option',{key:'_',value:''},this.t('frPick'))]
      .concat(schedT.length?[h('optgroup',{key:'g1',label:this.t('frSched')},schedT.map(optOf))]:[])
      .concat(restT.length?[h('optgroup',{key:'g2',label:this.t('frOrd')},restT.map(optOf))]:[]);
    const dayOpts=this.DAYS.map((d,k)=>h('option',{key:d,value:String(k)},this.frDayName(k)+' · '+dates[k]));
    const body=[];
    this.DAYS.forEach((d,i)=>{
      const lines=rows.filter(r=>r.di===i);
      const dn=Math.round(lines.reduce((a,r)=>a+(Number(r.y)||0),0)*10)/10;
      body.push(h('tr',{key:'g'+i},h('td',{colSpan:10,style:{background:'#f4f7ec',borderTop:'1px solid '+C.border,borderBottom:'1px solid '+C.line,padding:'7px 12px'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}},
          h('span',{style:{background:C.dark,color:'#fff',borderRadius:7,padding:'4px 11px',fontSize:11.5,fontWeight:700,fontFamily:mono,letterSpacing:'.3px'}},this.frDayName(i)+' · '+dates[i]),
          h('span',{style:{fontSize:11.5,fontWeight:600,color:C.sub}},lines.length+' '+this.t('cpTurnU')),
          dn?h('span',{style:{fontSize:12.5,fontFamily:mono,fontWeight:700,color:C.dark}},this.fmtn(dn)+' Y'):null,
          h('div',{style:{flex:1}}),
          h('button',{onClick:()=>this.frAdd(i),
            style:{border:'1px solid '+C.border,background:C.white,color:C.primary,borderRadius:8,padding:'5px 11px',fontSize:11,fontWeight:700,fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap'},
            'style-hover':{background:C.tint,borderColor:C.primary}},'+ '+this.t('frAdd'))))));
      if(!lines.length){ body.push(h('tr',{key:'e'+i},h('td',{colSpan:10,style:{...td,borderRight:'none',color:'#b9beb4',fontSize:11.5,padding:'9px 14px',textAlign:'left'}},this.t('frEmpty')))); return; }
      lines.forEach(r=>{
        const info=this.frInfo(r.rowId,r.code), st=this.frStat(r);
        const has=pool.some(t=>t.rowId===r.rowId&&t.code===r.code);
        const opts=(!has&&r.code)?[h('option',{key:'cur',value:r.rowId+'|'+r.code},r.code)].concat(baseOpts):baseOpts;
        body.push(h('tr',{key:r.id},
          h('td',{style:td},h('select',{value:String(r.ci),onChange:ev=>this.frSet(r.id,{ci:parseInt(ev.target.value,10)||0}),
            style:{...sel,fontFamily:mono,fontWeight:700}},dayOpts)),
          h('td',{style:{...td,textAlign:'left'}},h('select',{value:r.rowId&&r.code?r.rowId+'|'+r.code:'',
            onChange:ev=>{ const v=ev.target.value, p=v?v.split('|'):['','']; const t=pool.find(x=>x.rowId===p[0]&&x.code===p[1]);
              const patch={rowId:p[0],code:p[1]}; if(t&&t.day!=null) patch.ci=t.day; this.frSet(r.id,patch); },
            style:{...sel,fontWeight:700,color:r.code?C.ink:C.faint}},opts)),
          h('td',{style:td},info?h('div',null,
            h('div',{style:{fontSize:12,fontWeight:700,color:C.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},info.style),
            h('div',{style:{fontSize:9,color:C.faint,letterSpacing:'.4px'}},info.brand)):dash),
          h('td',{style:td},info?h('span',{style:{fontSize:11.5,fontFamily:mono,color:C.sub}},info.po||'—'):dash),
          h('td',{style:td},info?h('div',{style:{display:'flex',alignItems:'center',gap:7,justifyContent:'center',minWidth:0}},
            h('span',{style:{width:11,height:11,borderRadius:'50%',background:this.colorHex(info.color),border:'1px solid rgba(0,0,0,.12)',flex:'none'}}),
            h('span',{style:{fontSize:11.5,fontWeight:600,color:C.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},info.color)):dash),
          h('td',{style:td},info?h('span',{style:{fontSize:11.5,fontFamily:mono,fontWeight:700,color:C.dark}},info.item):dash),
          h('td',{style:{...td,textAlign:'left'}},info?h('span',{style:{fontSize:11,color:C.sub}},info.type):dash),
          h('td',{style:{...td,background:'#fcfdf7'}},h('input',{type:'number',min:0,step:'0.1',value:r.y===''?'':r.y,placeholder:'0.0',
            onChange:ev=>this.frSet(r.id,{y:ev.target.value===''?'':Math.max(0,parseFloat(ev.target.value)||0)}),
            style:{width:'100%',border:'1px solid '+C.primary,borderRadius:7,padding:'6px 7px',fontSize:12.5,fontWeight:700,fontFamily:mono,textAlign:'right',color:C.ink,background:C.white}})),
          h('td',{style:td},h('span',{style:{display:'inline-block',fontSize:9.5,fontWeight:700,letterSpacing:'.4px',color:st.fg,background:st.bg,border:'1px solid '+st.bd,borderRadius:6,padding:'4px 8px',whiteSpace:'nowrap'}},st.label)),
          h('td',{style:{...td,borderRight:'none'}},h('button',{onClick:()=>this.frDel(r.id),title:this.t('frDel'),
            style:{width:22,height:22,border:'1px solid '+C.border,borderRadius:6,background:C.white,color:C.faint,fontSize:13,lineHeight:1,cursor:'pointer',fontFamily:'inherit',padding:0}},'×'))));
      });
    });
    const heads=[['frCut'],['frTurn'],['frStyle'],['frPo'],['frColor'],['frItem'],['frTypeC'],['frNeed','frHand'],['frSt'],['']];
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('frTitle','S-03-FABREQ-WEEKLY · UI Proto'),
      this.fgCards([[this.t('frK1'),String(rows.length),this.t('frK1s')],[this.t('frK2'),this.fmtn(need),this.t('frK2s')],
        [this.t('frK3'),this.fmtn(got),this.t('frK3s'),C.primary],[this.t('frK4'),this.fmtn(short),this.t('frK4s'),short?'#b02a2a':C.ink]]),
      h('div',{'data-screen-label':'Weekly Fabric Request',style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow,maxWidth:1320}},
        this.fgWeekBar(),
        h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'14px 22px 12px',borderBottom:'1px solid '+C.line}},
          h('div',{style:{marginRight:'auto'}},
            h('div',{style:{fontSize:16,fontWeight:700}},this.t('frPanel')),
            h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('frSub'))),
          h('button',{onClick:()=>this.set({page:'whplan'}),style:this.btn('ghost')},this.t('whBc'),' →')),
        h('div',{style:{padding:'8px 22px',fontSize:10.5,color:C.faint,borderBottom:'1px solid '+C.line,background:'#fbfcf8',lineHeight:1.5}},this.t('frNote')),
        h('div',{className:'yscroll',style:{overflow:'auto'}},
          h('table',{style:{width:'100%',minWidth:'1120px',borderCollapse:'separate',borderSpacing:0,tableLayout:'fixed'}},
            h('colgroup',null,[104,178,124,80,112,104,138,116,124,34].map((w,i)=>h('col',{key:i,style:{width:w+'px'}}))),
            h('thead',null,h('tr',null,heads.map((k,i)=>h('th',{key:i,style:{...th,textAlign:i===1||i===6?'left':'center',borderRight:i===9?'none':th.borderRight}},
              k[0]?this.t(k[0]):'', k[1]?h('div',{style:{fontSize:8.5,fontWeight:700,color:C.primary,marginTop:2,letterSpacing:'.2px'}},'· '+this.t(k[1])+' ·'):null)))),
            h('tbody',null,body)))));
  }

  renderWhBody(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const dates=this.weekDates();
    const rows=this.frRows().filter(r=>r.rowId&&r.code).slice()
      .sort((a,b)=>(a.di-b.di)||String(a.code).localeCompare(String(b.code)));
    let needT=0,gotT=0,rollT=0;
    rows.forEach(r=>{ needT+=Number(r.y)||0; gotT+=this.whTot(r.id); rollT+=this.whScans(r.id).length; });
    needT=Math.round(needT*10)/10; gotT=Math.round(gotT*10)/10;
    const th={padding:'8px 8px',fontSize:9.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',color:C.sub,textAlign:'center',background:'#f8faf3',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,lineHeight:1.35};
    const td={borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,padding:'7px 8px',textAlign:'center',verticalAlign:'middle',background:C.white};
    const scanTd={...td,background:'#fbfdf6'};
    const body=[];
    rows.forEach(r=>{
      const info=this.frInfo(r.rowId,r.code)||{}, scans=this.whScans(r.id);
      const need=Number(r.y)||0, got=this.whTot(r.id), d=Math.round((got-need)*10)/10;
      const lots=[]; scans.forEach(s=>{ if(lots.indexOf(s.lot)<0) lots.push(s.lot); });
      const ok=got>0&&d>=-0.05;
      body.push(h('tr',{key:r.id},
        h('td',{style:td},h('span',{style:{fontSize:11.5,fontWeight:700,color:C.dark}},this.frDayName(r.di))),
        h('td',{style:td},h('span',{style:{fontSize:11.5,fontFamily:mono,color:C.sub}},dates[r.di])),
        h('td',{style:td},h('span',{style:{fontSize:11.5,fontFamily:mono,fontWeight:700,color:C.dark}},info.item||'—')),
        h('td',{style:td},h('div',null,
          h('div',{style:{fontSize:12,fontWeight:700,color:C.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},info.style||'—'),
          h('div',{style:{fontSize:9,color:C.faint,letterSpacing:'.4px'}},info.po?'PO '+info.po:''))),
        h('td',{style:td},h('div',{style:{display:'flex',alignItems:'center',gap:6,justifyContent:'center',minWidth:0}},
          h('span',{style:{width:10,height:10,borderRadius:'50%',background:this.colorHex(info.color),border:'1px solid rgba(0,0,0,.12)',flex:'none'}}),
          h('span',{style:{fontSize:11,fontWeight:600,color:C.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},info.color||'—'))),
        h('td',{style:td},h('span',{style:{fontSize:13,fontFamily:mono,fontWeight:700,color:C.primary}},r.code)),
        h('td',{style:td},h('span',{style:{fontSize:13,fontFamily:mono,fontWeight:700,color:C.ink}},this.fmtn(need))),
        h('td',{style:scanTd},h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:3}},
          h('span',{style:{fontSize:13.5,fontFamily:mono,fontWeight:700,color:got?C.dark:'#c3c8bf'}},got?this.fmtn(got):'—'),
          got?h('span',{style:{fontSize:9.5,fontWeight:700,fontFamily:mono,letterSpacing:'.2px',color:ok?'#3d6b12':'#b02a2a',background:ok?C.tint:'#fdf1f1',border:'1px solid '+(ok?'#d5e6b6':'#f0d6d6'),borderRadius:5,padding:'2px 6px',whiteSpace:'nowrap'}},
            d>0.05?'+'+this.fmtn(d):(d<-0.05?'−'+this.fmtn(-d):'✓ '+this.t('frDone'))):null)),
        h('td',{style:scanTd},lots.length?h('span',{style:{fontSize:11,fontFamily:mono,fontWeight:700,color:C.dark}},lots.join(' · ')):h('span',{style:{color:'#c3c8bf'}},'—')),
        h('td',{style:scanTd},h('span',{style:{fontSize:13,fontFamily:mono,fontWeight:700,color:scans.length?C.ink:'#c3c8bf'}},scans.length||'—')),
        h('td',{style:{...td,borderRight:'none'}},h('button',{onClick:()=>this.openScan(r),
          style:{display:'inline-flex',alignItems:'center',gap:5,border:'1.5px solid '+C.primary,background:C.white,color:C.primary,borderRadius:8,padding:'6px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.3px',fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap'},
          'style-hover':{background:C.tint}},this.ic('qr'),this.t('whScan')))));
      scans.forEach((s,si)=>{
        body.push(h('tr',{key:r.id+'-s'+si},
          h('td',{colSpan:6,style:{...td,textAlign:'left',paddingLeft:26,background:'#fcfdfa'}},
            h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
              h('span',{style:{width:18,height:18,borderRadius:5,background:C.tint,color:C.dark,fontSize:9.5,fontWeight:700,fontFamily:mono,display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'none'}},si+1),
              this.ic('qr'),
              h('span',{style:{fontSize:11.5,fontFamily:mono,fontWeight:700,color:C.dark}},'LOT '+s.lot),
              h('span',{style:{fontSize:11.5,fontFamily:mono,color:C.sub}},this.t('whRollN')+' '+s.no),
              h('span',{style:{fontSize:10.5,fontFamily:mono,color:C.faint}},this.t('whBin')+' '+s.bin))),
          h('td',{style:{...td,background:'#fcfdfa'}},''),
          h('td',{style:{...scanTd,background:'#fcfdfa'}},h('span',{style:{fontSize:12,fontFamily:mono,fontWeight:600,color:C.ink}},this.fmtn(s.y))),
          h('td',{style:{...scanTd,background:'#fcfdfa'}},h('span',{style:{fontSize:11,fontFamily:mono,color:C.sub}},s.lot)),
          h('td',{style:{...scanTd,background:'#fcfdfa'}},h('span',{style:{fontSize:11.5,fontFamily:mono,color:C.sub}},'1')),
          h('td',{style:{...td,borderRight:'none',background:'#fcfdfa'}},h('button',{onClick:()=>this.whRm(r.id,si),title:this.t('frDel'),
            style:{width:20,height:20,border:'1px solid '+C.border,borderRadius:6,background:C.white,color:C.faint,fontSize:12,lineHeight:1,cursor:'pointer',fontFamily:'inherit',padding:0}},'×'))));
      });
    });
    if(!rows.length) body.push(h('tr',{key:'empty'},h('td',{colSpan:11,style:{...td,borderRight:'none',color:'#b9beb4',fontSize:12.5,padding:'22px 16px'}},this.t('whEmpty'))));
    else body.push(h('tr',{key:'tot'},
      h('td',{colSpan:6,style:{...td,textAlign:'left',background:'#f4f7ec',fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.sub}},this.t('whTotR')),
      h('td',{style:{...td,background:'#f4f7ec'}},h('span',{style:{fontSize:13,fontFamily:mono,fontWeight:700,color:C.ink}},this.fmtn(needT))),
      h('td',{style:{...td,background:'#f4f7ec'}},h('span',{style:{fontSize:13,fontFamily:mono,fontWeight:700,color:C.dark}},this.fmtn(gotT))),
      h('td',{style:{...td,background:'#f4f7ec'}},''),
      h('td',{style:{...td,background:'#f4f7ec'}},h('span',{style:{fontSize:13,fontFamily:mono,fontWeight:700,color:C.ink}},rollT)),
      h('td',{style:{...td,borderRight:'none',background:'#f4f7ec'}},'')));
    const heads=[['whD'],['whDate'],['frItem'],['frStyle'],['frColor'],['frTurn'],['frNeed'],['whReal','qr'],['whLotC','qr'],['whRollC','qr'],['']];
    const hLabel=k=>k==='whD'?(this.state.lang==='vi'?'THỨ':'DAY'):(k==='whDate'?(this.state.lang==='vi'?'NGÀY':'DATE'):this.t(k));
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('whTitle','S-04-WHWORK-WEEKLY · UI Proto'),
      this.fgCards([[this.t('whK1'),String(rows.length),this.t('whK1s')],[this.t('whK2'),this.fmtn(needT),this.t('whK2s')],
        [this.t('whK3'),this.fmtn(gotT),this.t('whK3s'),C.primary],[this.t('whK4'),String(rollT),this.t('whK4s')]]),
      h('div',{'data-screen-label':'Weekly Working Warehouse',style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow,maxWidth:1320}},
        this.fgWeekBar(),
        h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'14px 22px 12px',borderBottom:'1px solid '+C.line}},
          h('div',{style:{marginRight:'auto'}},
            h('div',{style:{fontSize:16,fontWeight:700}},this.t('whPanel')),
            h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('whSub'))),
          h('button',{onClick:()=>this.set({page:'fabreq'}),style:this.btn('ghost')},'← ',this.t('frBc')),
          h('button',{onClick:()=>this.openStock(),style:{...this.btn('primary'),gap:6}},this.ic('qr'),this.t('whStockB'))),
        h('div',{style:{padding:'8px 22px',fontSize:10.5,color:C.faint,borderBottom:'1px solid '+C.line,background:'#fbfcf8',lineHeight:1.5}},this.t('whNote')),
        h('div',{className:'yscroll',style:{overflow:'auto'}},
          h('table',{style:{width:'100%',minWidth:'1160px',borderCollapse:'separate',borderSpacing:0,tableLayout:'fixed'}},
            h('colgroup',null,[80,88,116,132,104,90,110,124,116,72,104].map((w,i)=>h('col',{key:i,style:{width:w+'px'}}))),
            h('thead',null,h('tr',null,heads.map((k,i)=>h('th',{key:i,style:{...th,background:i>=7&&i<=9?'#eef6e0':th.background,borderRight:i===10?'none':th.borderRight}},
              k[0]?hLabel(k[0]):'',
              k[1]==='qr'?h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:3,color:C.primary}},this.ic('qr'),h('span',{style:{fontSize:8.5,fontWeight:700}},'QR')):null)))),
            h('tbody',null,body)))));
  }

  renderWhModal(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const o=this.state.whOpen; if(!o) return null;
    const item=o.item||'—', lots=this.whStock(item), used=this.whUsed();
    const rowId=o.id||null, key=rowId?this.whKey(rowId):null;
    const scans=rowId?this.whScans(rowId):[];
    const need=Number(o.need)||0, got=rowId?this.whTot(rowId):0, d=Math.round((got-need)*10)/10;
    let avR=0,avY=0,totR=0,totY=0;
    lots.forEach(L=>L.rolls.forEach(r=>{ totR++; totY+=r.y; if(!used[item+'|'+L.id+'|'+r.no]){ avR++; avY+=r.y; } }));
    const items=this.whItems();
    const pill=(l,v,tone)=>h('div',{key:l,style:{border:'1px solid rgba(255,255,255,.22)',borderRadius:9,padding:'6px 12px',background:'rgba(255,255,255,.08)'}},
      h('div',{style:{fontSize:9,fontWeight:700,letterSpacing:'.5px',color:'#dcefad'}},l),
      h('div',{style:{fontSize:14.5,fontWeight:700,fontFamily:mono,color:tone||'#fff',marginTop:2,whiteSpace:'nowrap'}},v));
    const tile=(L,r)=>{ const k=item+'|'+L.id+'|'+r.no, taken=used[k], mine=taken&&taken===key;
      const dis=!rowId||(taken&&!mine);
      const src=this.whQr(this.whRollQr(item,L.id,r));
      return h('div',{key:r.no,onClick:dis?undefined:()=>this.whAdd(rowId,item,L.id,r),
        title:dis?(taken?this.t('whOut'):this.t('whHint')):this.t('whScanS')+' '+L.id+' · '+r.no,
        style:{display:'flex',alignItems:'center',gap:9,border:'1px solid '+(mine?C.primary:(taken?'#e2e4de':C.border)),
          background:mine?C.tint2:(taken?'#f4f5f1':'#fff'),borderRadius:10,padding:'7px 9px',cursor:dis?'default':'pointer',opacity:taken&&!mine?.5:1,transition:'background .12s,border-color .12s'},
        'style-hover':dis?{}:{borderColor:C.primary,background:C.tint2}},
        src?h('img',{src:src,alt:r.no,style:{width:42,height:42,display:'block',flex:'none'}})
          :h('div',{style:{width:42,height:42,background:'#f2f4ee',flex:'none'}}),
        h('div',{style:{minWidth:0,flex:1}},
          h('div',{style:{fontSize:12,fontFamily:mono,fontWeight:700,color:C.ink}},r.no),
          h('div',{style:{fontSize:13,fontFamily:mono,fontWeight:700,color:mine?C.dark:C.primary}},this.fmtn(r.y),h('span',{style:{fontSize:9,color:C.faint,marginLeft:3}},'Y')),
          h('div',{style:{fontSize:9,fontFamily:mono,color:C.faint}},r.bin)),
        mine?h('span',{style:{fontSize:8.5,fontWeight:700,letterSpacing:'.3px',color:'#3d6b12',background:C.tint,border:'1px solid #d5e6b6',borderRadius:5,padding:'2px 5px',flex:'none'}},this.t('whMine'))
          :(taken?h('span',{style:{fontSize:8.5,fontWeight:700,letterSpacing:'.3px',color:'#8a8f86',background:'#eceee9',borderRadius:5,padding:'2px 5px',flex:'none'}},this.t('whOut')):null)); };
    const lotCard=L=>{ const free=L.rolls.filter(r=>!used[item+'|'+L.id+'|'+r.no]);
      const fy=Math.round(free.reduce((a,r)=>a+r.y,0)*10)/10;
      return h('div',{key:L.id,style:{border:'1px solid '+C.border,borderRadius:13,background:'#fff',overflow:'hidden'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:9,padding:'9px 13px',background:'#f6faee',borderBottom:'1px solid '+C.line,flexWrap:'wrap'}},
          h('span',{style:{fontSize:12.5,fontWeight:700,fontFamily:mono,letterSpacing:'.4px',color:'#fff',background:C.dark,borderRadius:7,padding:'4px 10px'}},'LOT '+L.id),
          h('span',{style:{fontSize:10.5,fontWeight:600,color:C.sub}},free.length+' / '+L.rolls.length+' '+this.t('whRollU')),
          h('span',{style:{marginLeft:'auto',fontSize:12,fontFamily:mono,fontWeight:700,color:C.dark,whiteSpace:'nowrap'}},this.fmtn(fy)+' Y')),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(158px,1fr))',gap:8,padding:11}},L.rolls.map(r=>tile(L,r)))); };
    const scanStrip=rowId?h('div',{style:{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',padding:'13px 20px',background:'#fff',borderBottom:'1px solid '+C.border}},
      h('div',{style:{minWidth:0}},
        h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},this.t('frTurn')+' · '+this.t('frStyle')),
        h('div',{style:{fontSize:13.5,fontWeight:700,color:C.ink,marginTop:2,whiteSpace:'nowrap'}},
          h('span',{style:{fontFamily:mono,color:C.primary}},o.code),' · ',o.style)),
      h('div',{style:{display:'flex',alignItems:'baseline',gap:7,border:'1px solid '+C.border,borderRadius:10,padding:'7px 13px'}},
        h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},this.t('whNeedL')),
        h('span',{style:{fontSize:15,fontFamily:mono,fontWeight:700,color:C.ink}},this.fmtn(need)),
        h('span',{style:{fontSize:9.5,color:C.faint}},'Y')),
      h('div',{style:{display:'flex',alignItems:'baseline',gap:7,border:'1px solid '+(got?C.primary:C.border),borderRadius:10,padding:'7px 13px',background:got?C.tint2:'#fff'}},
        h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},this.t('whGotL')),
        h('span',{style:{fontSize:15,fontFamily:mono,fontWeight:700,color:C.dark}},this.fmtn(got)),
        h('span',{style:{fontSize:9.5,color:C.faint}},'Y · '+scans.length+' '+this.t('whRollU'))),
      h('div',{style:{display:'flex',alignItems:'baseline',gap:7,borderRadius:10,padding:'7px 13px',
        background:d>=-0.05?C.tint:'#fdf1f1',border:'1px solid '+(d>=-0.05?'#d5e6b6':'#f0d6d6')}},
        h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:d>=-0.05?'#3d6b12':'#b02a2a'}},d>=-0.05?this.t('whOverL'):this.t('whShortL')),
        h('span',{style:{fontSize:15,fontFamily:mono,fontWeight:700,color:d>=-0.05?'#3d6b12':'#b02a2a'}},d>=-0.05?'+'+this.fmtn(d):this.fmtn(-d))),
      h('div',{style:{flex:1,minWidth:180}},
        h('input',{value:this.state.whQ||'',autoFocus:true,placeholder:this.t('whInput'),
          onChange:e=>this.setState({whQ:e.target.value,whErr:''}),
          onKeyDown:e=>{ if(e.key!=='Enter') return; const f=this.whFind(item,this.state.whQ);
            if(f&&this.whAdd(rowId,item,f.lot,f.roll)) this.setState({whQ:'',whErr:''});
            else this.setState({whErr:this.t('whErrM')}); },
          style:{width:'100%',border:'1.5px solid '+(this.state.whErr?'#d64545':C.primary),borderRadius:10,padding:'10px 13px',fontSize:12.5,fontFamily:mono,fontWeight:600,color:C.ink,background:this.state.whErr?'#fdf1f1':'#fff'}}),
        this.state.whErr?h('div',{style:{fontSize:10,fontWeight:700,color:'#b02a2a',marginTop:4}},this.state.whErr)
          :h('div',{style:{fontSize:10,color:C.faint,marginTop:4}},this.t('whHint'))),
      h('button',{onClick:()=>this.whAuto(rowId,item,need),
        style:{border:'1px solid '+C.border,background:'#fff',color:C.dark,borderRadius:10,padding:'10px 14px',fontSize:11.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap'},
        'style-hover':{background:C.tint,borderColor:C.primary}},this.t('whAutoB'))):null;
    const itemBar=(!rowId&&items.length)?h('div',{style:{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',padding:'11px 20px',background:'#fff',borderBottom:'1px solid '+C.border}},
      h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},this.t('frItem')),
      items.map(it=>{ const on=it===item;
        return h('button',{key:it,onClick:()=>this.setState({whOpen:{item:it}}),
          style:{border:'1px solid '+(on?C.primary:C.border),background:on?C.tint:'#fff',color:on?C.dark:C.sub,borderRadius:8,padding:'5px 11px',fontSize:11.5,fontWeight:700,fontFamily:mono,cursor:'pointer'}},it); })):null;
    return h('div',{onClick:e=>{ if(e.target===e.currentTarget) this.set({whOpen:null,whErr:''}); },
      style:{position:'fixed',inset:0,zIndex:430,background:'rgba(24,36,14,.55)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'26px 20px',overflowY:'auto'}},
      h('div',{style:{width:'min(1120px,100%)',background:'#eef0ea',borderRadius:14,overflow:'hidden',boxShadow:'0 18px 60px rgba(20,30,10,.35)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',padding:'15px 20px',background:C.dark}},
          h('div',{style:{minWidth:0}},
            h('div',{style:{fontSize:14.5,fontWeight:700,letterSpacing:'.7px',color:'#fff',fontFamily:mono}},this.t('whStockT')+' · '+item),
            h('div',{style:{fontSize:10.5,fontFamily:mono,color:'#dcefad',marginTop:4,letterSpacing:'.3px'}},
              lots.length+' '+this.t('whLotU')+' · '+totR+' '+this.t('whRollU')+' · '+this.fmtn(Math.round(totY*10)/10)+' Y')),
          h('div',{style:{display:'flex',gap:8,marginLeft:'auto',alignItems:'center',flexWrap:'wrap'}},
            pill(this.t('whAvail'),avR+' '+this.t('whRollU')+' · '+this.fmtn(Math.round(avY*10)/10)+' Y','#dcefad'),
            h('button',{onClick:()=>this.set({whOpen:null,whErr:''}),
              style:{cursor:'pointer',border:'1px solid rgba(255,255,255,.35)',background:'transparent',color:'#fff',fontWeight:700,fontSize:11.5,letterSpacing:'.6px',borderRadius:9,padding:'10px 18px',fontFamily:'inherit'},
              'style-hover':{background:'rgba(255,255,255,.12)'}},this.t('kcClose')))),
        scanStrip, itemBar,
        h('div',{className:'yscroll',style:{padding:16,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(330px,1fr))',gap:13,maxHeight:'calc(100vh - 230px)',overflowY:'auto'}},
          lots.map(lotCard))));
  }
}

  /* ---- mount ---------------------------------------------------------------- */
  /* Defaults are the ones the canvas fed in through data-props, so the migrated app
     renders identically to the bundle. */
  var PROPS = { primaryColor: '#8FC93A', density: 'Comfortable' };

  function mount() {
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
