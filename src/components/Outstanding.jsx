// import React, { useState, useMemo } from 'react';
// import { AlertTriangle, RefreshCw, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
// import { MO } from '../constants';
// import { fetchCSV, parseOutstandingCSV } from '../utils';
// import { useMonth } from '../context';
// import { Avatar, MultiSelect } from './UI';

// const fmt = v => v > 0 ? '₹' + Number(v).toLocaleString('en-IN') : '—';

// export default function Outstanding({ dealers, users, onOpenDealer, currentUser, outstandingData=[], setOutstandingData }) {
//   const { selectedMonthIdx } = useMonth();
//   const isAdmin = currentUser?.role === 'admin';
//   const [loading, setLoading]   = useState(false);
//   const [error, setError]       = useState('');
//   const [search, setSearch]     = useState('');
//   const [smFilter, setSmFilter] = useState([]);
//   const [tab, setTab]           = useState('outstanding');
//   const [expanded, setExpanded] = useState({});

//   const loadOutstanding = async () => {
//     setLoading(true); setError('');
//     try {
//       const allUsers = Object.values(users);
//       const source = allUsers.find(u => u.role==='admin' && u.url_outstanding)
//                   || allUsers.find(u => u.url_outstanding);
//       if(!source){ setError('No outstanding URL set. Add url_outstanding in constants.js'); setLoading(false); return; }
//       const csv  = await fetchCSV(source.url_outstanding);
//       const rows = parseOutstandingCSV(csv, source.id);
//       if(setOutstandingData) setOutstandingData(rows);
//       setLoading(false);
//     } catch(e) { setError('Failed: '+e.message); setLoading(false); }
//   };

//   const allMonthCols = useMemo(()=>{
//     const cols=new Set();
//     outstandingData.forEach(d=>d.monthCols?.forEach(m=>cols.add(m)));
//     return [...cols];
//   },[outstandingData]);

//   const filtered = useMemo(()=>{
//     let d = outstandingData;
//     if(tab==='outstanding') d=d.filter(x=>x.latestOutstanding>0);
//     if(tab==='cleared')     d=d.filter(x=>x.latestOutstanding===0);
//     if(search) d=d.filter(x=>x.name.toLowerCase().includes(search.toLowerCase()));
//     if(isAdmin&&smFilter.length>0) d=d.filter(x=>smFilter.includes(x.salesman));
//     return d;
//   },[outstandingData,tab,search,smFilter,isAdmin]);

//   const totalOut     = filtered.reduce((s,d)=>s+d.latestOutstanding,0);
//   const countOut     = outstandingData.filter(d=>d.latestOutstanding>0).length;
//   const countCleared = outstandingData.filter(d=>d.latestOutstanding===0).length;
//   const hasUrl       = Object.values(users).some(u=>u.url_outstanding);
//   const smOptions    = Object.values(users).filter(u=>u.role==='salesman').map(s=>s.id);
//   const toggle       = id => setExpanded(e=>({...e,[id]:!e[id]}));

//   return (
//     <div className="fade">
//       <div style={{marginBottom:16}}>
//         <div style={{fontSize:11,color:'var(--acc)',textTransform:'uppercase',letterSpacing:'.15em',marginBottom:4}}>Payments</div>
//         <div style={{fontSize:22,fontWeight:700}}>Outstanding</div>
//       </div>

//       {/* Setup notice */}
//       {!hasUrl && outstandingData.length===0 && (
//         <div className="card" style={{marginBottom:14,background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.2)'}}>
//           <div style={{fontSize:13,fontWeight:600,color:'var(--acc)',marginBottom:8}}>📋 Setup Outstanding Sheet</div>
//           <div style={{fontSize:12,color:'var(--t2)',marginBottom:10}}>Create a Google Sheet with dealer outstanding amounts:</div>
//           <div style={{background:'var(--bg2)',borderRadius:8,padding:12,fontFamily:'monospace',fontSize:11,color:'#34d399',marginBottom:10}}>
//             Dealer Name | FEB | MAR | APR | MAY<br/>
//             AADINATH PLYWOOD | 36000 | 100625 | 169650 | 200000
//           </div>
//           <div style={{fontSize:12,color:'var(--t3)'}}>
//             Publish as CSV → add URL to <code style={{background:'var(--bg2)',padding:'1px 5px',borderRadius:3}}>url_outstanding</code> in <code style={{background:'var(--bg2)',padding:'1px 5px',borderRadius:3}}>constants.js</code> under admin user.
//           </div>
//         </div>
//       )}

//       {/* Load button */}
//       {hasUrl && (
//         <div style={{marginBottom:14,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
//           <button onClick={loadOutstanding} disabled={loading} className="btnp" style={{display:'flex',alignItems:'center',gap:6}}>
//             <RefreshCw size={13} className={loading?'spin':''}/>{loading?'Loading...':'Load Outstanding Data'}
//           </button>
//           {outstandingData.length>0&&<span style={{fontSize:12,color:'var(--t3)'}}>{outstandingData.length} dealers loaded</span>}
//           {error&&<span style={{fontSize:11,color:'var(--red)'}}>{error}</span>}
//         </div>
//       )}

//       {/* KPI cards */}
//       {outstandingData.length>0&&(
//         <div className="stat-grid" style={{marginBottom:14}}>
//           {[
//             {l:'Total Outstanding',v:fmt(totalOut),c:'#f87171'},
//             {l:'Dealers with Due',v:countOut,c:'#fbbf24'},
//             {l:'Cleared',v:countCleared,c:'#34d399'},
//             {l:'Avg Outstanding',v:fmt(countOut?Math.round(totalOut/countOut):0),c:'var(--acc)'},
//           ].map(k=>(
//             <div key={k.l} className="stat-card">
//               <div style={{fontSize:10,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>{k.l}</div>
//               <div style={{fontSize:22,fontWeight:700,color:k.c}}>{k.v}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Month-wise summary table */}
//       {allMonthCols.length>0&&(
//         <div className="card" style={{marginBottom:14,padding:0,overflow:'hidden'}}>
//           <div style={{padding:'12px 14px',borderBottom:'1px solid var(--b1)',fontSize:12,fontWeight:600,color:'var(--t2)'}}>Month-wise Summary</div>
//           <div style={{overflowX:'auto'}}>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Month</th>
//                   <th style={{textAlign:'right'}}>Total Outstanding</th>
//                   <th style={{textAlign:'right'}}>Dealers with Due</th>
//                   <th style={{textAlign:'right'}}>Highest</th>
//                   <th style={{textAlign:'right'}}>Change</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {allMonthCols.map((month,mi)=>{
//                   const vals=outstandingData.map(d=>d.monthlyOutstanding[month]||0);
//                   const total=vals.reduce((a,b)=>a+b,0);
//                   const withDue=vals.filter(v=>v>0).length;
//                   const highest=Math.max(...vals,0);
//                   const prev=mi>0?outstandingData.map(d=>d.monthlyOutstanding[allMonthCols[mi-1]]||0).reduce((a,b)=>a+b,0):0;
//                   const change=mi>0?total-prev:0;
//                   return(
//                     <tr key={month}>
//                       <td style={{fontWeight:600,color:'var(--t1)'}}>{month}</td>
//                       <td style={{textAlign:'right',fontWeight:700,color:total>0?'#f87171':'#34d399'}}>{fmt(total)}</td>
//                       <td style={{textAlign:'right',color:'var(--t2)'}}>{withDue}</td>
//                       <td style={{textAlign:'right',color:'#fbbf24'}}>{fmt(highest)}</td>
//                       <td style={{textAlign:'right',color:change>0?'#f87171':change<0?'#34d399':'var(--t3)',fontWeight:600}}>
//                         {change!==0?(change>0?'▲':'▼')+'₹'+Number(Math.abs(change)).toLocaleString('en-IN'):'—'}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Dealer list */}
//       {outstandingData.length>0&&(
//         <>
//           <div className="tabs">
//             {[
//               {id:'outstanding',label:`Outstanding (${countOut})`},
//               {id:'cleared',    label:`Cleared (${countCleared})`},
//               {id:'all',        label:`All (${outstandingData.length})`},
//             ].map(t=>(
//               <button key={t.id} className={`tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
//             ))}
//           </div>

//           <div className="row" style={{marginBottom:12,flexWrap:'wrap',gap:8}}>
//             <div style={{position:'relative'}}>
//               <Search size={13} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'var(--t3)'}}/>
//               <input className="inp" style={{width:200,paddingLeft:30,fontSize:12}} placeholder="Search dealer..." value={search} onChange={e=>setSearch(e.target.value)}/>
//             </div>
//             {isAdmin&&<MultiSelect options={smOptions} selected={smFilter} onChange={setSmFilter} placeholder="All Salesmen"
//               renderOption={id=>{const s=users[id];return s?<div style={{display:'flex',alignItems:'center',gap:6}}><Avatar user={s} size={16}/><span style={{fontSize:12}}>{s.name}</span></div>:<span>{id}</span>;}}/>}
//             {(search||smFilter.length>0)&&<button onClick={()=>{setSearch('');setSmFilter([]);}} className="btn" style={{fontSize:11,color:'var(--red)'}}><X size={11}/> Clear</button>}
//             <div style={{flex:1}}/>
//             <span style={{fontSize:12,color:'var(--t3)'}}>{filtered.length} dealers · {fmt(totalOut)}</span>
//           </div>

//           <div className="card" style={{padding:0,overflow:'hidden'}}>
//             <div style={{overflowX:'auto',maxHeight:'60vh',overflowY:'auto'}}>
//               <table>
//                 <thead>
//                   <tr>
//                     <th style={{width:30}}>#</th>
//                     <th>Dealer Name</th>
//                     {isAdmin&&<th>Salesman</th>}
//                     {allMonthCols.map(m=><th key={m} style={{textAlign:'right'}}>{m}</th>)}
//                     <th style={{textAlign:'right'}}>Latest</th>
//                     <th style={{textAlign:'right'}}>Trend</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.map((d,i)=>{
//                     const sm=users[d.salesman];
//                     const isOpen=expanded[d.id];
//                     const cleared=d.latestOutstanding===0;
//                     return(
//                       <React.Fragment key={d.id}>
//                         <tr style={{cursor:'pointer',background:cleared?'rgba(52,211,153,0.04)':'transparent'}}
//                           onClick={()=>toggle(d.id)}>
//                           <td style={{color:'var(--t3)',fontSize:11}}>{i+1}</td>
//                           <td>
//                             <div style={{fontWeight:600,color:'var(--t1)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div>
//                             {cleared&&<span style={{fontSize:9,background:'rgba(52,211,153,0.15)',color:'#34d399',padding:'1px 5px',borderRadius:3}}>CLEARED</span>}
//                           </td>
//                           {isAdmin&&<td>{sm?<div style={{display:'flex',alignItems:'center',gap:4}}><Avatar user={sm} size={16}/><span style={{fontSize:11}}>{sm.name}</span></div>:'—'}</td>}
//                           {allMonthCols.map(m=>{
//                             const v=d.monthlyOutstanding[m]||0;
//                             const mi2=allMonthCols.indexOf(m);
//                             const prev=mi2>0?d.monthlyOutstanding[allMonthCols[mi2-1]]||0:v;
//                             return(
//                               <td key={m} style={{textAlign:'right',color:v===0?'#34d399':v>prev&&mi2>0?'#f87171':'#fbbf24',fontWeight:v>0?600:400,fontSize:12}}>
//                                 {v>0?fmt(v):'—'}
//                               </td>
//                             );
//                           })}
//                           <td style={{textAlign:'right',fontWeight:700,color:cleared?'#34d399':'#f87171',fontSize:13}}>
//                             {cleared?'✓ Nil':fmt(d.latestOutstanding)}
//                           </td>
//                           <td style={{textAlign:'right'}}>
//                             {d.trend>0?<span style={{color:'#f87171',fontSize:11}}>▲{fmt(d.trend)}</span>
//                             :d.trend<0?<span style={{color:'#34d399',fontSize:11}}>▼{fmt(Math.abs(d.trend))}</span>
//                             :<span style={{color:'var(--t3)',fontSize:11}}>—</span>}
//                           </td>
//                         </tr>
//                         {isOpen&&(
//                           <tr>
//                             <td colSpan={99} style={{background:'var(--bg2)',padding:'10px 14px'}}>
//                               <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
//                                 <div style={{fontSize:11,color:'var(--t3)'}}>Outstanding trend:</div>
//                                 <div style={{display:'flex',gap:3,alignItems:'flex-end',height:30}}>
//                                   {allMonthCols.map(m=>{
//                                     const v=d.monthlyOutstanding[m]||0;
//                                     const mx=Math.max(...allMonthCols.map(mc=>d.monthlyOutstanding[mc]||0),1);
//                                     return(<div key={m} style={{width:18,display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
//                                       <div style={{width:'100%',height:Math.max((v/mx)*26,v>0?3:1),background:v===0?'var(--b1)':'#f87171',borderRadius:'2px 2px 0 0'}}/>
//                                       <div style={{fontSize:6,color:'var(--t3)'}}>{m.slice(0,3)}</div>
//                                     </div>);
//                                   })}
//                                 </div>
//                                 <button className="btnp" style={{fontSize:11,padding:'5px 12px',marginLeft:8}}
//                                   onClick={()=>{
//                                     const dealer=dealers.find(x=>x.name.toUpperCase().trim()===d.name.toUpperCase().trim());
//                                     if(dealer) onOpenDealer(dealer.id);
//                                   }}>View Dealer</button>
//                               </div>
//                             </td>
//                           </tr>
//                         )}
//                       </React.Fragment>
//                     );
//                   })}
//                   {filtered.length===0&&<tr><td colSpan={99} style={{textAlign:'center',padding:30,color:'var(--t3)'}}>No records</td></tr>}
//                 </tbody>
//                 <tfoot>
//                   <tr>
//                     <td colSpan={isAdmin?3:2} style={{fontWeight:700}}>TOTAL</td>
//                     {allMonthCols.map(m=>{
//                       const t=filtered.reduce((s,d)=>s+(d.monthlyOutstanding[m]||0),0);
//                       return<td key={m} style={{textAlign:'right',fontWeight:700,color:'#f87171'}}>{t>0?fmt(t):'—'}</td>;
//                     })}
//                     <td style={{textAlign:'right',fontWeight:700,color:'#f87171'}}>{fmt(filtered.reduce((s,d)=>s+d.latestOutstanding,0))}</td>
//                     <td/>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import React, { useState, useMemo } from 'react';
import { AlertTriangle, RefreshCw, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { MO } from '../constants';
import { fetchCSV, parseOutstandingCSV } from '../utils';
import { useMonth } from '../context';
import { Avatar, MultiSelect } from './UI';

const fmt = v => v > 0 ? '₹' + Number(v).toLocaleString('en-IN') : '—';

export default function Outstanding({ dealers, users, onOpenDealer, currentUser, outstandingData=[], setOutstandingData }) {
  const { selectedMonthIdx } = useMonth();
  const isAdmin = currentUser?.role === 'admin';
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [smFilter, setSmFilter] = useState([]);
  const [tab, setTab]           = useState('outstanding');
  const [expanded, setExpanded] = useState({});

  const loadOutstanding = async () => {
    setLoading(true); setError('');
    try {
      const allUsers = Object.values(users);
      const source = allUsers.find(u => u.role==='admin' && u.url_outstanding)
                  || allUsers.find(u => u.url_outstanding);
      if(!source){ setError('No outstanding URL set. Add url_outstanding in constants.js'); setLoading(false); return; }
      const csv  = await fetchCSV(source.url_outstanding);
      const rows = parseOutstandingCSV(csv, source.id);
      if(setOutstandingData) setOutstandingData(rows);
      setLoading(false);
    } catch(e) { setError('Failed: '+e.message); setLoading(false); }
  };

  const allMonthCols = useMemo(()=>{
    const cols=new Set();
    outstandingData.forEach(d=>d.monthCols?.forEach(m=>cols.add(m)));
    return [...cols];
  },[outstandingData]);

  // Build name→salesman lookup from dealers data
  const dealerSmMap = useMemo(()=>{
    const map = {};
    dealers.forEach(d => {
      const key = d.name.toLowerCase().trim();
      if(d.salesman && users[d.salesman]) map[key] = users[d.salesman];
    });
    return map;
  }, [dealers, users]);

  const filtered = useMemo(()=>{
    let d = outstandingData.map(x => ({
      ...x,
      matchedSalesman: dealerSmMap[x.name.toLowerCase().trim()] || null,
    }));
    if(tab==='outstanding') d=d.filter(x=>x.latestOutstanding>0);
    if(tab==='cleared')     d=d.filter(x=>x.latestOutstanding===0);
    if(search) d=d.filter(x=>x.name.toLowerCase().includes(search.toLowerCase()));
    if(isAdmin&&smFilter.length>0) d=d.filter(x=>x.matchedSalesman&&smFilter.includes(x.matchedSalesman.id));
    return d;
  },[outstandingData,dealerSmMap,tab,search,smFilter,isAdmin]);

  const totalOut     = filtered.reduce((s,d)=>s+d.latestOutstanding,0);
  const countOut     = outstandingData.filter(d=>d.latestOutstanding>0).length;
  const countCleared = outstandingData.filter(d=>d.latestOutstanding===0).length;
  const hasUrl       = Object.values(users).some(u=>u.url_outstanding);
  const smOptions    = Object.values(users).filter(u=>u.role==='salesman').map(s=>s.id);
  const toggle       = id => setExpanded(e=>({...e,[id]:!e[id]}));

  return (
    <div className="fade">
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:'var(--acc)',textTransform:'uppercase',letterSpacing:'.15em',marginBottom:4}}>Payments</div>
        <div style={{fontSize:22,fontWeight:700}}>Outstanding</div>
      </div>

      {/* Setup notice */}
      {!hasUrl && outstandingData.length===0 && (
        <div className="card" style={{marginBottom:14,background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.2)'}}>
          <div style={{fontSize:13,fontWeight:600,color:'var(--acc)',marginBottom:8}}>📋 Setup Outstanding Sheet</div>
          <div style={{fontSize:12,color:'var(--t2)',marginBottom:10}}>Create a Google Sheet with dealer outstanding amounts:</div>
          <div style={{background:'var(--bg2)',borderRadius:8,padding:12,fontFamily:'monospace',fontSize:11,color:'#34d399',marginBottom:10}}>
            Dealer Name | FEB | MAR | APR | MAY<br/>
            AADINATH PLYWOOD | 36000 | 100625 | 169650 | 200000
          </div>
          <div style={{fontSize:12,color:'var(--t3)'}}>
            Publish as CSV → add URL to <code style={{background:'var(--bg2)',padding:'1px 5px',borderRadius:3}}>url_outstanding</code> in <code style={{background:'var(--bg2)',padding:'1px 5px',borderRadius:3}}>constants.js</code> under admin user.
          </div>
        </div>
      )}

      {/* Load button */}
      {hasUrl && (
        <div style={{marginBottom:14,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <button onClick={loadOutstanding} disabled={loading} className="btnp" style={{display:'flex',alignItems:'center',gap:6}}>
            <RefreshCw size={13} className={loading?'spin':''}/>{loading?'Loading...':'Load Outstanding Data'}
          </button>
          {outstandingData.length>0&&<span style={{fontSize:12,color:'var(--t3)'}}>{outstandingData.length} dealers loaded</span>}
          {error&&<span style={{fontSize:11,color:'var(--red)'}}>{error}</span>}
        </div>
      )}

      {/* KPI cards */}
      {outstandingData.length>0&&(
        <div className="stat-grid" style={{marginBottom:14}}>
          {[
            {l:'Total Outstanding',v:fmt(totalOut),c:'#f87171'},
            {l:'Dealers with Due',v:countOut,c:'#fbbf24'},
            {l:'Cleared',v:countCleared,c:'#34d399'},
            {l:'Avg Outstanding',v:fmt(countOut?Math.round(totalOut/countOut):0),c:'var(--acc)'},
          ].map(k=>(
            <div key={k.l} className="stat-card">
              <div style={{fontSize:10,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>{k.l}</div>
              <div style={{fontSize:22,fontWeight:700,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Month-wise summary table */}
      {allMonthCols.length>0&&(
        <div className="card" style={{marginBottom:14,padding:0,overflow:'hidden'}}>
          <div style={{padding:'12px 14px',borderBottom:'1px solid var(--b1)',fontSize:12,fontWeight:600,color:'var(--t2)'}}>Month-wise Summary</div>
          <div style={{overflowX:'auto'}}>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th style={{textAlign:'right'}}>Total Outstanding</th>
                  <th style={{textAlign:'right'}}>Dealers with Due</th>
                  <th style={{textAlign:'right'}}>Highest</th>
                  <th style={{textAlign:'right'}}>Change</th>
                </tr>
              </thead>
              <tbody>
                {allMonthCols.map((month,mi)=>{
                  const vals=outstandingData.map(d=>d.monthlyOutstanding[month]||0);
                  const total=vals.reduce((a,b)=>a+b,0);
                  const withDue=vals.filter(v=>v>0).length;
                  const highest=Math.max(...vals,0);
                  const prev=mi>0?outstandingData.map(d=>d.monthlyOutstanding[allMonthCols[mi-1]]||0).reduce((a,b)=>a+b,0):0;
                  const change=mi>0?total-prev:0;
                  return(
                    <tr key={month}>
                      <td style={{fontWeight:600,color:'var(--t1)'}}>{month}</td>
                      <td style={{textAlign:'right',fontWeight:700,color:total>0?'#f87171':'#34d399'}}>{fmt(total)}</td>
                      <td style={{textAlign:'right',color:'var(--t2)'}}>{withDue}</td>
                      <td style={{textAlign:'right',color:'#fbbf24'}}>{fmt(highest)}</td>
                      <td style={{textAlign:'right',color:change>0?'#f87171':change<0?'#34d399':'var(--t3)',fontWeight:600}}>
                        {change!==0?(change>0?'▲':'▼')+'₹'+Number(Math.abs(change)).toLocaleString('en-IN'):'—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dealer list */}
      {outstandingData.length>0&&(
        <>
          <div className="tabs">
            {[
              {id:'outstanding',label:`Outstanding (${countOut})`},
              {id:'cleared',    label:`Cleared (${countCleared})`},
              {id:'all',        label:`All (${outstandingData.length})`},
            ].map(t=>(
              <button key={t.id} className={`tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
            ))}
          </div>

          <div className="row" style={{marginBottom:12,flexWrap:'wrap',gap:8}}>
            <div style={{position:'relative'}}>
              <Search size={13} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'var(--t3)'}}/>
              <input className="inp" style={{width:200,paddingLeft:30,fontSize:12}} placeholder="Search dealer..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            {isAdmin&&<MultiSelect options={smOptions} selected={smFilter} onChange={setSmFilter} placeholder="All Salesmen"
              renderOption={id=>{const s=users[id];return s?<div style={{display:'flex',alignItems:'center',gap:6}}><Avatar user={s} size={16}/><span style={{fontSize:12}}>{s.name}</span></div>:<span>{id}</span>;}}/>}
            {(search||smFilter.length>0)&&<button onClick={()=>{setSearch('');setSmFilter([]);}} className="btn" style={{fontSize:11,color:'var(--red)'}}><X size={11}/> Clear</button>}
            <div style={{flex:1}}/>
            <span style={{fontSize:12,color:'var(--t3)'}}>{filtered.length} dealers · {fmt(totalOut)}</span>
          </div>

          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div style={{overflowX:'auto',maxHeight:'60vh',overflowY:'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th style={{width:30}}>#</th>
                    <th>Dealer Name</th>
                    {allMonthCols.map(m=><th key={m} style={{textAlign:'right'}}>{m}</th>)}
                    <th style={{textAlign:'right'}}>Latest</th>
                    <th style={{textAlign:'right'}}>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d,i)=>{
                    const sm=users[d.salesman];
                    const isOpen=expanded[d.id];
                    const cleared=d.latestOutstanding===0;
                    return(
                      <React.Fragment key={d.id}>
                        <tr style={{cursor:'pointer',background:cleared?'rgba(52,211,153,0.04)':'transparent'}}
                          onClick={()=>toggle(d.id)}>
                          <td style={{color:'var(--t3)',fontSize:11}}>{i+1}</td>
                          <td>
                            <div style={{fontWeight:600,color:'var(--t1)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div>
                            <div style={{display:'flex',gap:4,marginTop:2,flexWrap:'wrap',alignItems:'center'}}>
                              {cleared&&<span style={{fontSize:9,background:'rgba(52,211,153,0.15)',color:'#34d399',padding:'1px 5px',borderRadius:3}}>CLEARED</span>}
                              {d.matchedSalesman&&<div style={{display:'flex',alignItems:'center',gap:3}}>
                                <Avatar user={d.matchedSalesman} size={14}/>
                                <span style={{fontSize:9,color:d.matchedSalesman.color}}>{d.matchedSalesman.name}</span>
                              </div>}
                              {!d.matchedSalesman&&<span style={{fontSize:9,color:'var(--t3)'}}>—</span>}
                            </div>
                          </td>
                          {allMonthCols.map(m=>{
                            const v=d.monthlyOutstanding[m]||0;
                            const mi2=allMonthCols.indexOf(m);
                            const prev=mi2>0?d.monthlyOutstanding[allMonthCols[mi2-1]]||0:v;
                            return(
                              <td key={m} style={{textAlign:'right',color:v===0?'#34d399':v>prev&&mi2>0?'#f87171':'#fbbf24',fontWeight:v>0?600:400,fontSize:12}}>
                                {v>0?fmt(v):'—'}
                              </td>
                            );
                          })}
                          <td style={{textAlign:'right',fontWeight:700,color:cleared?'#34d399':'#f87171',fontSize:13}}>
                            {cleared?'✓ Nil':fmt(d.latestOutstanding)}
                          </td>
                          <td style={{textAlign:'right'}}>
                            {d.trend>0?<span style={{color:'#f87171',fontSize:11}}>▲{fmt(d.trend)}</span>
                            :d.trend<0?<span style={{color:'#34d399',fontSize:11}}>▼{fmt(Math.abs(d.trend))}</span>
                            :<span style={{color:'var(--t3)',fontSize:11}}>—</span>}
                          </td>
                        </tr>
                        {isOpen&&(
                          <tr>
                            <td colSpan={99} style={{background:'var(--bg2)',padding:'10px 14px'}}>
                              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                                <div style={{fontSize:11,color:'var(--t3)'}}>Outstanding trend:</div>
                                <div style={{display:'flex',gap:3,alignItems:'flex-end',height:30}}>
                                  {allMonthCols.map(m=>{
                                    const v=d.monthlyOutstanding[m]||0;
                                    const mx=Math.max(...allMonthCols.map(mc=>d.monthlyOutstanding[mc]||0),1);
                                    return(<div key={m} style={{width:18,display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                                      <div style={{width:'100%',height:Math.max((v/mx)*26,v>0?3:1),background:v===0?'var(--b1)':'#f87171',borderRadius:'2px 2px 0 0'}}/>
                                      <div style={{fontSize:6,color:'var(--t3)'}}>{m.slice(0,3)}</div>
                                    </div>);
                                  })}
                                </div>
                                <button className="btnp" style={{fontSize:11,padding:'5px 12px',marginLeft:8}}
                                  onClick={()=>{
                                    const dealer=dealers.find(x=>x.name.toUpperCase().trim()===d.name.toUpperCase().trim());
                                    if(dealer) onOpenDealer(dealer.id);
                                  }}>View Dealer</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {filtered.length===0&&<tr><td colSpan={99} style={{textAlign:'center',padding:30,color:'var(--t3)'}}>No records</td></tr>}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} style={{fontWeight:700}}>TOTAL</td>
                    {allMonthCols.map(m=>{
                      const t=filtered.reduce((s,d)=>s+(d.monthlyOutstanding[m]||0),0);
                      return<td key={m} style={{textAlign:'right',fontWeight:700,color:'#f87171'}}>{t>0?fmt(t):'—'}</td>;
                    })}
                    <td style={{textAlign:'right',fontWeight:700,color:'#f87171'}}>{fmt(filtered.reduce((s,d)=>s+d.latestOutstanding,0))}</td>
                    <td/>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}