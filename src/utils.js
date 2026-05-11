import { MO, CURRENT_MONTH_IDX } from './constants';

export const pct   = (t,a) => (!t?(a>0?null:0):Math.round((a/t)*100));
export const spct  = (t,a) => { const p=pct(t,a); return p===null?'N/T':p+'%'; };
export const pclr  = (p)   => (p===null||p===undefined)?'#6b7280':p>=100?'#34d399':p>=60?'#fbbf24':'#f87171';
export const fcash = (v)   => v?'₹'+Number(v).toLocaleString('en-IN'):'—';
export const num   = (v)   => { if(!v&&v!==0)return 0; const x=parseFloat(String(v).replace(/[^0-9.-]/g,'')); return isNaN(x)?0:Math.round(x); };
export const uid   = ()    => Date.now()+'_'+Math.random().toString(36).slice(2);
export const isoNow= ()    => new Date().toISOString();
export const trendPct = (months) => {
  const recent=months.slice(-3).reduce((a,b)=>a+b,0);
  const prior=months.slice(-6,-3).reduce((a,b)=>a+b,0);
  if(!prior) return recent>0?100:0;
  return Math.round(((recent-prior)/prior)*100);
};
export const forecast = (months) => Math.round(months.slice(-3).reduce((a,b)=>a+b,0)/3);

export const storage = {
  async get(key,fallback=null){
    try{ if(typeof window!=='undefined'&&window.storage){ const r=await window.storage.get(key); return r?JSON.parse(r.value):fallback; } }catch(e){}
    return fallback;
  },
  async set(key,value){
    try{ if(typeof window!=='undefined'&&window.storage) await window.storage.set(key,JSON.stringify(value)); }catch(e){}
  },
};

function parseRow(line){
  const r=[];let c='',q=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"')q=!q;
    else if(ch===','&&!q){r.push(c);c='';}
    else c+=ch;
  }
  r.push(c);
  return r.map(s=>s.trim().replace(/^"+|"+$/g,''));
}

export function parseCSV(txt,smId){
  const lines=txt.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
  let hi=0;
  for(let i=0;i<Math.min(lines.length,10);i++){
    const l=lines[i].toLowerCase();
    if(l.includes('dealer')||(l.includes('name')&&l.includes('target'))){hi=i;break;}
  }
  const rawH=parseRow(lines[hi]);
  const hc=rawH.map(h=>h.toLowerCase().replace(/[^a-z0-9]/g,' ').trim());
  const ci=(...ks)=>{ for(const k of ks){ const i=hc.findIndex(h=>h.includes(k)); if(i!==-1)return i; } return -1; };

  const CN=ci('dealer','name'), CT=ci('target'), CZ=ci('zone'), CS=ci('status'), CA=ci('avg','average');
  const CD=ci('credit day','credit d'), CL=ci('credit lim','limit');
  const CCITY=ci('city'), CSTATE=ci('state');

  // Sub category (col AN) — find specific first
  const CCATTYPE=(()=>{
    for(const k of ['sub category','sub cat','subcat','sub-cat','category type','cat type','cattype','product type','sub type','thickness']){
      const i=hc.findIndex(h=>h===k||h.startsWith(k)); if(i!==-1)return i;
    }
    const i=hc.findIndex(h=>h.includes('sub')&&h.includes('cat')); if(i!==-1)return i;
    const catCols=[]; hc.forEach((h,i)=>{ if(h.includes('category'))catCols.push(i); });
    return catCols.length>=2?catCols[1]:-1;
  })();
  // Main category (col AM) — any "category" col that isn't CCATTYPE
  const CCAT=(()=>{
    for(const k of ['main category','main cat']){
      const i=hc.findIndex(h=>h===k||h.startsWith(k)); if(i!==-1)return i;
    }
    return hc.findIndex((h,idx)=>h.includes('category')&&idx!==CCATTYPE);
  })();

  console.log('[CSV] cols 38-41:', rawH.slice(38,42));
  console.log('[CSV] CCAT='+CCAT+'("'+(rawH[CCAT]||'?')+'") CCATTYPE='+CCATTYPE+'("'+(rawH[CCATTYPE]||'?')+'")');

  const monthTargetCols={};
  MO.forEach((m,idx)=>{
    const mKey=m.toLowerCase().replace('-',' ').replace('-','');
    hc.forEach((h,i)=>{ if((h.includes(m.toLowerCase())||h.includes(mKey))&&h.includes('target'))monthTargetCols[idx]=i; });
  });

  const ac=[]; hc.forEach((h,i)=>{ if(h.includes('achiev')||h.includes('ach'))ac.push(i); });
  const CAp=ac[0]!==undefined?ac[0]:ci('achiev');
  const hist=[...ac.slice(1)].reverse();

  const out=[];
  for(let i=hi+1;i<lines.length;i++){
    if(!lines[i].trim())continue;
    const c=parseRow(lines[i]);
    const nm=(c[CN>=0?CN:0]||'').trim();
    if(!nm||nm.length<2)continue;
    if(/^[\d,. ]+$/.test(nm))continue;
    if(nm.toLowerCase().includes('total')||nm.toLowerCase()==='name'||nm.toLowerCase().includes('dealer'))continue;
    const may=CAp>=0?num(c[CAp]):0;
    const mo=[];
    for(let m=0;m<10;m++)mo.push(hist[m]!==undefined?num(c[hist[m]]):0);
    mo.push(may);
    const monthTargets={};
    Object.entries(monthTargetCols).forEach(([idx,col])=>{ monthTargets[Number(idx)]=num(c[col]); });
    out.push({
      id:smId+'_'+i, name:nm, salesman:smId,
      zone:(CZ>=0?c[CZ]:'').trim(),
      city:(CCITY>=0?c[CCITY]:'').trim(),
      state:(CSTATE>=0?c[CSTATE]:'').trim(),
      status:(CS>=0?c[CS]:'ACTIVE').trim()||'ACTIVE',
      category:(CCAT>=0?c[CCAT]:'').trim(),
      categoryType:(CCATTYPE>=0?c[CCATTYPE]:'').trim(),
      target:CT>=0?num(c[CT]):0, achieved:may,
      avg6m:CA>=0?num(c[CA]):0, months:mo, monthTargets,
      creditDays:CD>=0?num(c[CD]):0,
      creditLimit:CL>=0?num(c[CL]):0,
    });
  }
  return out;
}

export async function fetchCSV(url){
  const proxies=[url,`https://corsproxy.io/?${encodeURIComponent(url)}`,`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`];
  for(const u of proxies){
    try{
      const r=await fetch(u,{signal:AbortSignal.timeout(14000)});
      if(!r.ok)continue;
      const t=await r.text();
      if(!t||t.length<20||t.trim().startsWith('<'))continue;
      return t;
    }catch(e){continue;}
  }
  throw new Error('Could not fetch');
}
