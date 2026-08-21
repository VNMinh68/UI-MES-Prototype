/* QR generator — byte mode, EC level M, versions 1-9 (max 180 bytes). window.QRSvgUrl(text,dark) -> data URL */
(function(){
var EXP=new Array(256),LOG=new Array(256);
(function(){var x=1;for(var i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11d;}EXP[255]=EXP[0];})();
function gmul(a,b){if(!a||!b)return 0;return EXP[(LOG[a]+LOG[b])%255];}
/* Generator polynomial in DESCENDING degree order (monic, g[0]===1) — rsEC divides assuming that. */
function genPoly(n){var p=[1];for(var i=0;i<n;i++){var q=new Array(p.length+1).fill(0);
  for(var j=0;j<p.length;j++){q[j]^=gmul(p[j],EXP[i]);q[j+1]^=p[j];}p=q;}return p.reverse();}
function rsEC(data,n){var g=genPoly(n),res=data.concat(new Array(n).fill(0));
  for(var i=0;i<data.length;i++){var c=res[i];if(c)for(var j=0;j<g.length;j++)res[i+j]^=gmul(g[j],c);}
  return res.slice(data.length);}
/* EC level M: [totalCodewordsPerBlock, dataCodewordsPerBlock] per block, shorter group first */
var BLOCKS={1:[[26,16]],2:[[44,28]],3:[[70,44]],4:[[50,32],[50,32]],5:[[67,43],[67,43]],
 6:[[43,27],[43,27],[43,27],[43,27]],
 7:[[49,31],[49,31],[49,31],[49,31]],
 8:[[60,38],[60,38],[61,39],[61,39]],
 9:[[58,36],[58,36],[58,36],[59,37],[59,37]]};
var ALIGN={1:[],2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],9:[6,26,46]};
var MAXVER=9;
function bch(data){var d=data<<10;function deg(x){var n=0;while(x){x>>=1;n++;}return n;}
  var g=0x537;while(deg(d)>=deg(g))d^=g<<(deg(d)-deg(g));return((data<<10)|d)^0x5412;}
function verBits(ver){var rem=ver;for(var i=0;i<12;i++)rem=(rem<<1)^((rem>>>11)*0x1F25);return(ver<<12)|rem;}
function dataCap(ver){return BLOCKS[ver].reduce(function(a,b){return a+b[1];},0);}
function build(text){
  var bytes=[];for(var i=0;i<text.length;i++){var c=text.charCodeAt(i);bytes.push(c>255?63:c);}
  var ver=0;for(var v=1;v<=MAXVER;v++){if(bytes.length<=dataCap(v)-2){ver=v;break;}}
  if(!ver)throw new Error('QR too long');
  var blocks=BLOCKS[ver],totalData=dataCap(ver);
  var bits=[],push=function(val,len){for(var i=len-1;i>=0;i--)bits.push((val>>i)&1);};
  push(4,4);push(bytes.length,8);bytes.forEach(function(b){push(b,8);});
  var maxBits=totalData*8;push(0,Math.min(4,maxBits-bits.length));
  while(bits.length%8)bits.push(0);
  var data=[];for(i=0;i<bits.length;i+=8){var b8=0;for(var j=0;j<8;j++)b8=(b8<<1)|bits[i+j];data.push(b8);}
  var pads=[0xEC,0x11],pi=0;while(data.length<totalData)data.push(pads[pi++%2]);
  var dcs=[],ecs=[],off=0;
  blocks.forEach(function(bl){var dc=data.slice(off,off+bl[1]);off+=bl[1];dcs.push(dc);ecs.push(rsEC(dc,bl[0]-bl[1]));});
  var out=[],maxD=Math.max.apply(null,dcs.map(function(d){return d.length;}));
  for(i=0;i<maxD;i++)dcs.forEach(function(d){if(i<d.length)out.push(d[i]);});
  var maxE=Math.max.apply(null,ecs.map(function(e){return e.length;}));
  for(i=0;i<maxE;i++)ecs.forEach(function(e){if(i<e.length)out.push(e[i]);});
  return{ver:ver,data:out};
}
var MASKS=[function(r,c){return (r+c)%2===0;},function(r){return r%2===0;},function(r,c){return c%3===0;},function(r,c){return (r+c)%3===0;},
 function(r,c){return (Math.floor(r/2)+Math.floor(c/3))%2===0;},function(r,c){return (r*c)%2+(r*c)%3===0;},
 function(r,c){return ((r*c)%2+(r*c)%3)%2===0;},function(r,c){return ((r+c)%2+(r*c)%3)%2===0;}];
function matrix(text){
  var enc=build(text),ver=enc.ver,N=17+ver*4;
  var m=[];for(var r=0;r<N;r++)m.push(new Array(N).fill(null));
  function set(r,c,v){if(r<0||c<0||r>=N||c>=N)return;m[r][c]=v;}
  function finder(r,c){for(var i=-1;i<=7;i++)for(var j=-1;j<=7;j++){
    var d=(i>=0&&i<=6&&j>=0&&j<=6)&&(i===0||i===6||j===0||j===6||(i>=2&&i<=4&&j>=2&&j<=4));set(r+i,c+j,!!d);}}
  finder(0,0);finder(0,N-7);finder(N-7,0);
  var al=ALIGN[ver];
  for(var a=0;a<al.length;a++)for(var b=0;b<al.length;b++){var cr=al[a],cc2=al[b];
    if(m[cr][cc2]!==null)continue;
    for(var i2=-2;i2<=2;i2++)for(var j2=-2;j2<=2;j2++)set(cr+i2,cc2+j2,Math.max(Math.abs(i2),Math.abs(j2))!==1);}
  for(var t=8;t<N-8;t++){if(m[6][t]===null)set(6,t,t%2===0);if(m[t][6]===null)set(t,6,t%2===0);}
  set(N-8,8,true);
  if(ver>=7){var vb=verBits(ver);
    for(var vi=0;vi<18;vi++){var vbit=((vb>>vi)&1)===1,va=N-11+vi%3,vbb=Math.floor(vi/3);
      set(vbb,va,vbit);set(va,vbb,vbit);}}
  for(var fi=0;fi<15;fi++){ // reserve format areas
    var rr2=fi<6?fi:fi<8?fi+1:N-15+fi; if(m[rr2][8]===null)set(rr2,8,false);
    var cc3=fi<8?N-fi-1:fi<9?15-fi:14-fi; if(m[8][cc3]===null)set(8,cc3,false);}
  var best=null,bestPen=1e9;
  for(var mk=0;mk<8;mk++){
    var mm=m.map(function(row){return row.slice();});
    var inc=-1,row=N-1,bitI=7,byteI=0,dataArr=enc.data;
    for(var col=N-1;col>0;col-=2){ if(col===6)col--;
      for(;;){ for(var c2=0;c2<2;c2++){ var cx=col-c2;
          if(mm[row][cx]===null){ var dark=false;
            if(byteI<dataArr.length)dark=((dataArr[byteI]>>>bitI)&1)===1;
            if(MASKS[mk](row,cx))dark=!dark;
            mm[row][cx]=dark; bitI--; if(bitI===-1){byteI++;bitI=7;} } }
        row+=inc; if(row<0||row>=N){row-=inc;inc=-inc;break;} } }
    var fmt=bch(mk); // EC M = 00 -> data=(0<<3)|mask
    for(fi=0;fi<15;fi++){var bit=((fmt>>fi)&1)===1;
      var r3=fi<6?fi:fi<8?fi+1:N-15+fi; mm[r3][8]=bit;
      var c3=fi<8?N-fi-1:fi<9?15-fi:14-fi; mm[8][c3]=bit;}
    mm[N-8][8]=true;
    var pen=penalty(mm,N);
    if(pen<bestPen){bestPen=pen;best=mm;}
  }
  return{size:N,ver:ver,m:best};
}
function penalty(mm,N){var p=0,r,c;
  for(var dir=0;dir<2;dir++)for(r=0;r<N;r++){var run=1;for(c=1;c<N;c++){var cur=dir?mm[c][r]:mm[r][c],prev=dir?mm[c-1][r]:mm[r][c-1];
    if(cur===prev)run++;else{if(run>=5)p+=3+run-5;run=1;}}if(run>=5)p+=3+run-5;}
  for(r=0;r<N-1;r++)for(c=0;c<N-1;c++){var v=mm[r][c];if(mm[r][c+1]===v&&mm[r+1][c]===v&&mm[r+1][c+1]===v)p+=3;}
  var pat1=[true,false,true,true,true,false,true,false,false,false,false],pat2=pat1.slice().reverse();
  for(dir=0;dir<2;dir++)for(r=0;r<N;r++)for(c=0;c<=N-11;c++){var ok1=true,ok2=true;
    for(var k=0;k<11;k++){var vv=dir?mm[c+k][r]:mm[r][c+k];if(vv!==pat1[k])ok1=false;if(vv!==pat2[k])ok2=false;}
    if(ok1)p+=40;if(ok2)p+=40;}
  var dark=0;for(r=0;r<N;r++)for(c=0;c<N;c++)if(mm[r][c])dark++;
  p+=Math.floor(Math.abs(dark*100/(N*N)-50)/5)*10;
  return p;}
window.QRMatrix=matrix;
window.QRSvgUrl=function(text,darkColor){
  var q=matrix(text),N=q.size,Q=4,T=N+Q*2,s='';
  for(var r=0;r<N;r++)for(var c=0;c<N;c++)if(q.m[r][c])s+='M'+(c+Q)+' '+(r+Q)+'h1v1h-1z';
  var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+T+'" height="'+T+'" viewBox="0 0 '+T+' '+T+'" shape-rendering="crispEdges">'
    +'<rect width="'+T+'" height="'+T+'" fill="#fff"/><path d="'+s+'" fill="'+(darkColor||'#111')+'"/></svg>';
  return 'data:image/svg+xml,'+encodeURIComponent(svg);
};
})();
