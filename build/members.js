/* Ban do tung thanh vien cua class Component trong build/legacy/script.js.
 * Chay:  node build/members.js   ->  build/members.json
 *
 * Dem dau ngoac de biet dong nao la khai bao o cap class, dong nao la than ham.
 * Phai bo qua chuoi / chu thich / regex, khong thi mot dong nhu
 *   .replace(/"/g,'&quot;')
 * lam lech het cac dong sau.
 */
const fs=require('fs');
const BS=String.fromCharCode(92), DQ=String.fromCharCode(34);
const path=require('path');
const P=path.join(__dirname,'legacy','script.js');
const lines=fs.readFileSync(P,'utf8').split(/\r?\n/);
const REGOK='(,=:[!&|?{;+~^*<>';
function strip(l){
  let out='',i=0,q=null;
  while(i<l.length){
    const c=l[i];
    if(q){ if(c===BS){i+=2;continue;} if(c===q){q=null;} i++; continue; }
    if(c===DQ||c==="'"||c==='`'){ q=c; i++; continue; }
    if(c==='/'&&l[i+1]==='/') break;
    if(c==='/'&&l[i+1]==='*'){ const e=l.indexOf('*/',i+2); if(e<0) break; i=e+2; continue; }
    if(c==='/'){
      // regex literal? look back at last non-space emitted char
      const prev=out.replace(/\s+$/,'').slice(-1);
      if(prev===''||REGOK.includes(prev)){
        let j=i+1, cls=false;
        while(j<l.length){ const d=l[j];
          if(d===BS){ j+=2; continue; }
          if(d==='[') cls=true; else if(d===']') cls=false;
          else if(d==='/'&&!cls) break;
          j++; }
        if(j<l.length){ i=j+1; while(i<l.length&&/[a-z]/.test(l[i])) i++; continue; }
      }
    }
    out+=c; i++;
  }
  return out;
}
const cs=lines.findIndex(l=>/^class Component extends DCLogic \{/.test(l));
let ce=-1; for(let i=lines.length-1;i>0;i--) if(lines[i]==='}'){ce=i;break;}
let d=0; const mem=[];
for(let i=cs+1;i<ce;i++){
  const s=strip(lines[i]);
  const m=lines[i].match(/^  ([A-Za-z_$][\w$]*)\s*[({=]/);
  if(d===0&&m) mem.push({name:m[1],line:i+1});
  for(const ch of s){ if('{(['.includes(ch)) d++; else if('})]'.includes(ch)) d--; }
  if(d<0){ console.log('NEG depth at',i+1,JSON.stringify(lines[i].slice(0,100))); d=0; }
}
mem.forEach((m,i)=>{ m.end=(i+1<mem.length?mem[i+1].line-1:ce); });
fs.writeFileSync(path.join(__dirname,'members.json'),JSON.stringify({classStart:cs+1,classEnd:ce+1,mem}));
console.log('members',mem.length,'finalDepth',d);
console.log(mem.slice(-12).map(m=>m.name+':'+m.line).join(' '));
