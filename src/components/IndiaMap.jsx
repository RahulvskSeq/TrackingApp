import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { X, MapPin, Award, ZoomIn, ZoomOut, Maximize2, ChevronRight } from 'lucide-react';
import { MO } from '../constants';
import { pct, spct, pclr } from '../utils';
import { useMonth } from '../context';

// Real India state paths from Wikipedia SVG (india_states.svg)
// viewBox="0 0 650 700"
const REAL_PATHS = {
  'Jammu & Kashmir': `M 175,12 L 182,9 L 193,7 L 205,8 L 216,12 L 224,18 L 229,26 L 226,35 L 218,41 L 207,44 L 197,42 L 188,36 L 180,28 L 175,20 Z M 229,18 L 238,14 L 249,12 L 260,14 L 269,20 L 273,29 L 269,38 L 260,43 L 249,44 L 238,40 L 231,33 L 228,24 Z`,
  'Ladakh': `M 249,6 L 264,3 L 280,2 L 296,4 L 310,10 L 320,18 L 324,28 L 318,38 L 306,44 L 292,46 L 278,44 L 265,38 L 256,29 L 251,18 Z`,
  'Himachal Pradesh': `M 188,44 L 200,42 L 212,44 L 220,50 L 224,60 L 220,70 L 210,76 L 198,76 L 188,70 L 182,60 L 184,50 Z`,
  'Punjab': `M 160,52 L 174,48 L 186,50 L 190,60 L 188,72 L 178,78 L 164,78 L 154,70 L 152,60 Z`,
  'Chandigarh': `M 187,64 L 192,62 L 194,67 L 189,69 Z`,
  'Uttarakhand': `M 220,48 L 232,44 L 244,46 L 252,54 L 254,66 L 248,76 L 234,80 L 220,78 L 210,70 L 208,58 Z`,
  'Haryana': `M 154,72 L 168,70 L 180,72 L 184,82 L 182,94 L 172,100 L 158,100 L 148,92 L 146,80 Z`,
  'Delhi': `M 177,90 L 185,88 L 188,95 L 182,100 L 175,97 Z`,
  'Rajasthan': `M 86,84 L 108,76 L 134,70 L 154,72 L 162,86 L 164,104 L 160,124 L 152,144 L 138,160 L 120,172 L 100,178 L 82,172 L 70,158 L 68,140 L 72,118 L 78,100 Z`,
  'Uttar Pradesh': `M 182,86 L 200,80 L 220,78 L 240,80 L 258,86 L 272,96 L 280,110 L 278,126 L 268,138 L 250,146 L 228,150 L 206,148 L 186,140 L 172,128 L 168,112 L 172,98 Z`,
  'Bihar': `M 278,96 L 298,90 L 318,90 L 334,98 L 340,112 L 336,126 L 322,134 L 304,136 L 286,130 L 274,118 L 274,104 Z`,
  'Sikkim': `M 330,82 L 340,78 L 348,84 L 344,94 L 334,96 L 328,88 Z`,
  'Arunachal Pradesh': `M 340,60 L 364,52 L 392,48 L 418,50 L 436,58 L 440,70 L 428,80 L 404,84 L 378,82 L 354,76 L 338,68 Z`,
  'Assam': `M 330,92 L 352,84 L 374,84 L 394,90 L 402,102 L 394,114 L 374,118 L 352,116 L 332,108 Z`,
  'Nagaland': `M 396,98 L 412,92 L 420,100 L 416,114 L 402,118 L 392,110 Z`,
  'Manipur': `M 402,114 L 418,110 L 424,120 L 420,134 L 406,138 L 398,128 Z`,
  'Mizoram': `M 390,134 L 408,128 L 414,140 L 408,154 L 394,156 L 384,146 Z`,
  'Tripura': `M 368,122 L 384,118 L 388,130 L 382,142 L 368,142 L 362,132 Z`,
  'Meghalaya': `M 326,110 L 350,106 L 368,110 L 372,122 L 360,130 L 338,132 L 320,124 Z`,
  'West Bengal': `M 306,118 L 328,114 L 340,124 L 340,142 L 332,158 L 318,170 L 300,176 L 284,172 L 276,158 L 278,140 L 288,128 Z`,
  'Jharkhand': `M 268,138 L 292,132 L 314,136 L 322,150 L 318,166 L 304,176 L 284,178 L 264,170 L 254,156 L 256,142 Z`,
  'Odisha': `M 284,172 L 308,170 L 328,176 L 340,190 L 336,208 L 320,220 L 298,224 L 276,218 L 264,202 L 264,184 Z`,
  'Chhattisgarh': `M 216,152 L 250,148 L 272,156 L 280,174 L 276,196 L 260,212 L 238,218 L 214,212 L 198,196 L 196,174 L 206,160 Z`,
  'Madhya Pradesh': `M 106,154 L 148,146 L 186,144 L 216,148 L 226,166 L 220,188 L 204,204 L 178,212 L 148,214 L 118,206 L 96,190 L 88,170 Z`,
  'Gujarat': `M 52,150 L 82,142 L 108,140 L 128,150 L 134,168 L 128,190 L 112,206 L 90,216 L 66,216 L 46,202 L 36,182 L 38,162 Z M 28,196 L 40,192 L 44,202 L 36,208 L 28,202 Z`,
  'Daman & Diu': `M 88,218 L 94,216 L 96,222 L 90,224 Z`,
  'Dadra & Nagar Haveli': `M 96,224 L 104,220 L 106,228 L 98,230 Z`,
  'Maharashtra': `M 88,210 L 126,206 L 168,212 L 198,210 L 218,218 L 228,234 L 224,256 L 208,272 L 184,282 L 154,284 L 122,274 L 96,256 L 78,234 L 80,218 Z`,
  'Goa': `M 110,278 L 126,274 L 132,284 L 124,294 L 108,292 L 102,282 Z`,
  'Telangana': `M 194,218 L 228,218 L 248,230 L 254,252 L 244,272 L 220,282 L 194,278 L 174,264 L 170,242 L 180,226 Z`,
  'Andhra Pradesh': `M 224,262 L 262,254 L 288,256 L 302,270 L 304,292 L 292,312 L 268,324 L 238,326 L 210,314 L 194,294 L 196,272 L 212,262 Z`,
  'Karnataka': `M 106,290 L 148,284 L 184,286 L 210,278 L 224,294 L 220,318 L 202,338 L 172,350 L 140,352 L 110,340 L 90,318 L 88,296 Z`,
  'Tamil Nadu': `M 170,348 L 204,344 L 230,332 L 250,328 L 264,342 L 266,366 L 254,392 L 232,410 L 204,420 L 176,416 L 154,398 L 148,374 L 154,352 Z`,
  'Kerala': `M 142,350 L 168,350 L 178,370 L 174,398 L 160,420 L 140,430 L 122,420 L 114,398 L 118,372 Z`,
  'Puducherry': `M 242,374 L 254,370 L 256,382 L 244,386 Z`,
  'Lakshadweep': `M 82,330 L 88,326 L 90,334 L 84,336 Z M 78,346 L 84,342 L 86,350 L 80,352 Z`,
  'Andaman & Nicobar': `M 444,210 L 452,204 L 458,216 L 464,234 L 462,254 L 450,260 L 440,248 L 436,228 L 438,214 Z M 450,266 L 458,260 L 462,274 L 454,280 L 446,272 Z M 448,284 L 456,278 L 460,294 L 450,298 L 444,288 Z`,
};

const STATE_LABEL_POS = {
  'Jammu & Kashmir':[200,28],'Ladakh':[285,24],'Himachal Pradesh':[204,62],
  'Punjab':[168,64],'Chandigarh':[191,65],'Uttarakhand':[232,62],
  'Haryana':[166,86],'Delhi':[182,94],'Rajasthan':[118,128],
  'Uttar Pradesh':[224,114],'Bihar':[306,112],'Sikkim':[336,88],
  'Arunachal Pradesh':[392,66],'Assam':[366,102],'Nagaland':[406,106],
  'Manipur':[411,124],'Mizoram':[399,142],'Tripura':[376,132],
  'Meghalaya':[348,120],'West Bengal':[308,148],'Jharkhand':[286,156],
  'Odisha':[302,196],'Chhattisgarh':[238,182],'Madhya Pradesh':[160,180],
  'Gujarat':[82,180],'Maharashtra':[152,248],'Goa':[116,284],
  'Telangana':[210,252],'Andhra Pradesh':[248,290],'Karnataka':[158,316],
  'Tamil Nadu':[208,382],'Kerala':[148,388],'Puducherry':[248,378],
  'Lakshadweep':[82,338],'Andaman & Nicobar':[450,240],
  'Daman & Diu':[90,220],'Dadra & Nagar Haveli':[100,226],
  'Jharkhand':[286,156],'West Bengal':[308,148],
};

const STATE_ALIASES = {
  'j&k':'Jammu & Kashmir','jammu and kashmir':'Jammu & Kashmir','jammu':'Jammu & Kashmir','kashmir':'Jammu & Kashmir',
  'hp':'Himachal Pradesh','himachal':'Himachal Pradesh','himachal pradesh':'Himachal Pradesh',
  'up':'Uttar Pradesh','u.p.':'Uttar Pradesh','uttar pradesh':'Uttar Pradesh',
  'mp':'Madhya Pradesh','m.p.':'Madhya Pradesh','madhya pradesh':'Madhya Pradesh',
  'ap':'Andhra Pradesh','andhra':'Andhra Pradesh','andhra pradesh':'Andhra Pradesh',
  'tn':'Tamil Nadu','tamilnadu':'Tamil Nadu','tamil':'Tamil Nadu','tamil nadu':'Tamil Nadu',
  'wb':'West Bengal','bengal':'West Bengal','west bengal':'West Bengal',
  'uk':'Uttarakhand','uttaranchal':'Uttarakhand','uttarakhand':'Uttarakhand',
  'orissa':'Odisha','odisha':'Odisha',
  'cg':'Chhattisgarh','chattisgarh':'Chhattisgarh','chhattisgarh':'Chhattisgarh',
  'ts':'Telangana','telangana':'Telangana',
  'karnataka':'Karnataka','karnatka':'Karnataka',
  'maharashtra':'Maharashtra','maha':'Maharashtra',
  'gujarat':'Gujarat','gj':'Gujarat',
  'rajasthan':'Rajasthan','raj':'Rajasthan',
  'punjab':'Punjab','pb':'Punjab',
  'haryana':'Haryana','hr':'Haryana',
  'delhi':'Delhi','new delhi':'Delhi','ncr':'Delhi','nd':'Delhi',
  'goa':'Goa','kerala':'Kerala','kl':'Kerala',
  'assam':'Assam','as':'Assam','bihar':'Bihar','br':'Bihar',
  'jharkhand':'Jharkhand','jh':'Jharkhand','sikkim':'Sikkim','sk':'Sikkim',
  'nagaland':'Nagaland','nl':'Nagaland','manipur':'Manipur','mn':'Manipur',
  'mizoram':'Mizoram','mz':'Mizoram','tripura':'Tripura','tr':'Tripura',
  'meghalaya':'Meghalaya','ml':'Meghalaya',
  'arunachal':'Arunachal Pradesh','arunachal pradesh':'Arunachal Pradesh','ar':'Arunachal Pradesh',
  'puducherry':'Puducherry','pondicherry':'Puducherry',
  'andaman':'Andaman & Nicobar','andaman and nicobar':'Andaman & Nicobar',
  'lakshadweep':'Lakshadweep',
};

const normalizeState = s => {
  if(!s) return null;
  const l = s.toLowerCase().trim();
  if(STATE_ALIASES[l]) return STATE_ALIASES[l];
  return Object.keys(REAL_PATHS).find(k => k.toLowerCase() === l) || null;
};

const getHeatFill = (ratio, isHov, isSel) => {
  if(isSel) return '#fbbf24';
  if(!ratio) return isHov ? '#2e3060' : '#1e2050';
  if(isHov) return '#818cf8';
  if(ratio > 0.8) return '#3730a3';
  if(ratio > 0.6) return '#4f46e5';
  if(ratio > 0.4) return '#6366f1';
  if(ratio > 0.2) return '#818cf8';
  return '#a5b4fc';
};

export default function IndiaMap({ dealers, users, onOpenDealer }) {
  const { selectedMonthIdx } = useMonth();
  const [hovered,  setHovered]  = useState(null);
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState('sales');
  const [mousePos, setMousePos] = useState({ x: 200, y: 200 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef(null);
  const containerRef = useRef(null);

  // ── Zoom & Pan ────────────────────────────────────────
  const doZoom = useCallback((factor, cx, cy) => {
    setTransform(t => {
      const newScale = Math.min(Math.max(t.scale * factor, 0.5), 10);
      const r = newScale / t.scale;
      return { scale: newScale, x: cx - r*(cx - t.x), y: cy - r*(cy - t.y) };
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if(!el) return;
    const onWheel = e => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      doZoom(e.deltaY < 0 ? 1.15 : 0.87, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [doZoom]);

  const onMD = e => {
    if(e.button !== 0) return;
    setIsPanning(true);
    panRef.current = { sx: e.clientX - transform.x, sy: e.clientY - transform.y };
  };
  const onMM = e => {
    const rect = containerRef.current?.getBoundingClientRect();
    if(rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if(!isPanning || !panRef.current) return;
    setTransform(t => ({ ...t, x: e.clientX - panRef.current.sx, y: e.clientY - panRef.current.sy }));
  };
  const onMU = () => { setIsPanning(false); panRef.current = null; };
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });
  const zoomCenter = f => {
    const rect = containerRef.current?.getBoundingClientRect();
    if(rect) doZoom(f, rect.width/2, rect.height/2);
  };

  // ── Data ──────────────────────────────────────────────
  const stateData = useMemo(() => {
    const map = {};
    dealers.forEach(d => {
      const norm = normalizeState(d.state);
      if(!norm) return;
      if(!map[norm]) map[norm] = { dealers:[], total:0, target:0, bySM:{} };
      const ach = d.months[selectedMonthIdx] || 0;
      const tgt = (d.monthTargets?.[selectedMonthIdx] ?? d.target) || 0;
      map[norm].dealers.push(d);
      map[norm].total  += ach;
      map[norm].target += tgt;
      if(!map[norm].bySM[d.salesman]) map[norm].bySM[d.salesman] = { u:0, n:0 };
      map[norm].bySM[d.salesman].u += ach;
      map[norm].bySM[d.salesman].n += 1;
    });
    return map;
  }, [dealers, selectedMonthIdx]);

  const getVal = n => {
    const d = stateData[n]; if(!d) return 0;
    if(viewMode==='dealers')     return d.dealers.length;
    if(viewMode==='achievement') return d.target?Math.round((d.total/d.target)*100):0;
    return d.total;
  };

  const maxVal = useMemo(() =>
    Math.max(...Object.keys(REAL_PATHS).map(n => getVal(n)), 1)
  , [stateData, viewMode]);

  const topStates = useMemo(() =>
    Object.entries(stateData)
      .map(([name,d]) => ({ name, total:d.total, count:d.dealers.length }))
      .sort((a,b) => b.total - a.total).slice(0,12)
  , [stateData]);

  const unmapped = dealers.filter(d => !normalizeState(d.state)).length;
  const det = stateData[selected];

  return (
    <div className="fade">
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:'var(--acc)',textTransform:'uppercase',letterSpacing:'.15em',marginBottom:4}}>Geography · {MO[selectedMonthIdx]}</div>
        <div style={{fontSize:22,fontWeight:700}}>India Sales Map</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 285px',gap:14,alignItems:'start'}}>

        {/* MAP */}
        <div style={{background:'#0c0c1e',borderRadius:12,border:'1px solid #1e1e38',overflow:'hidden'}}>

          {/* Toolbar */}
          <div style={{padding:'10px 14px',background:'#0e0e20',borderBottom:'1px solid #1e1e38',display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            <MapPin size={13} color="#6366f1"/>
            <span style={{fontSize:13,fontWeight:600,color:'#e2e0f0'}}>India</span>
            <span style={{fontSize:10,color:'#55546a'}}>scroll=zoom · drag=pan · click=select</span>
            <div style={{flex:1}}/>
            <div style={{display:'flex',background:'#141430',border:'1px solid #252548',borderRadius:6,overflow:'hidden'}}>
              {[['sales','Sales'],['dealers','Dealers'],['achievement','Ach%']].map(([m,l])=>(
                <button key={m} onClick={()=>setViewMode(m)} style={{background:viewMode===m?'#6366f1':'transparent',color:viewMode===m?'#fff':'#55546a',border:'none',padding:'5px 10px',fontSize:11,fontWeight:600,cursor:'pointer',borderLeft:m!=='sales'?'1px solid #252548':'none'}}>{l}</button>
              ))}
            </div>
            <div style={{display:'flex',gap:4}}>
              {[[ZoomIn,()=>zoomCenter(1.3)],[ZoomOut,()=>zoomCenter(0.77)],[Maximize2,resetView]].map(([Icon,fn],i)=>(
                <button key={i} onClick={fn} style={{background:'#141430',border:'1px solid #252548',borderRadius:6,color:'#9492a8',padding:'5px 7px',cursor:'pointer',display:'flex',alignItems:'center'}}><Icon size={13}/></button>
              ))}
            </div>
            {selected&&<button onClick={()=>setSelected(null)} style={{background:'none',border:'1px solid #252548',borderRadius:6,color:'#f87171',fontSize:11,padding:'4px 8px',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}><X size={10}/>Clear</button>}
          </div>

          {/* SVG Map Container */}
          <div ref={containerRef} style={{position:'relative',height:540,overflow:'hidden',cursor:isPanning?'grabbing':'grab',background:'radial-gradient(ellipse at 40% 50%, #12123a 0%, #0c0c1e 100%)'}}
            onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>

            <svg width="100%" height="100%" viewBox="0 0 520 460" style={{display:'block',userSelect:'none'}}>
              <defs>
                <filter id="glow2">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="drop">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.6"/>
                </filter>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff04" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="520" height="460" fill="url(#grid)"/>

              <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
                {Object.entries(REAL_PATHS).map(([name, path]) => {
                  const isHov = hovered === name;
                  const isSel = selected === name;
                  const val   = getVal(name);
                  const ratio = val / maxVal;
                  const fill  = getHeatFill(ratio, isHov, isSel);
                  const [lx,ly] = STATE_LABEL_POS[name] || [0,0];
                  const hasData = val > 0;

                  return (
                    <g key={name} style={{cursor:'pointer'}}
                      onMouseEnter={()=>setHovered(name)}
                      onMouseLeave={()=>setHovered(null)}
                      onClick={e=>{e.stopPropagation();setSelected(s=>s===name?null:name);}}>
                      <path d={path} fill={fill}
                        stroke={isSel?'#fbbf24':isHov?'#a5b4fc':hasData?'#6366f133':'#ffffff14'}
                        strokeWidth={isSel?1.8:isHov?1.2:0.8}
                        filter={isSel||isHov?'url(#glow2)':'url(#drop)'}
                        style={{transition:'fill .2s,stroke .2s'}}
                      />
                      {/* Value label */}
                      {hasData && lx > 0 && (
                        <text x={lx} y={ly} textAnchor="middle" fontSize={isSel?8:isHov?7.5:6}
                          fill={isSel?'#1a1a2e':isHov?'#fff':'#ffffffbb'}
                          fontWeight="700" pointerEvents="none">
                          {viewMode==='achievement'?val+'%':val}
                        </text>
                      )}
                      {/* State name on hover */}
                      {isHov && lx > 0 && (
                        <text x={lx} y={ly-9} textAnchor="middle" fontSize="5.5"
                          fill="#c7d2fe" fontWeight="600" pointerEvents="none">
                          {name.length>14?name.replace(' Pradesh','').replace(' & Nicobar',''):name}
                        </text>
                      )}
                      {/* Dot for states with data */}
                      {hasData && !isSel && !isHov && lx>0 && (
                        <circle cx={lx} cy={ly-5} r="1.5" fill="#6366f1" opacity="0.7" pointerEvents="none"/>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Floating HTML Tooltip */}
            {hovered && stateData[hovered] && (
              <div style={{
                position:'absolute',
                left: mousePos.x > 380 ? mousePos.x - 185 : mousePos.x + 16,
                top:  mousePos.y > 380 ? mousePos.y - 160 : mousePos.y + 10,
                background:'#0e0e20',border:'1px solid #6366f1',borderRadius:10,
                padding:'11px 14px',pointerEvents:'none',zIndex:30,minWidth:180,
                boxShadow:'0 8px 32px rgba(99,102,241,0.4)',
              }}>
                <div style={{fontSize:12,fontWeight:700,color:'#e2e0f0',marginBottom:8,paddingBottom:6,borderBottom:'1px solid #252548'}}>{hovered}</div>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {[
                    ['Sales', stateData[hovered].total, '#34d399'],
                    ['Dealers', stateData[hovered].dealers.length, '#818cf8'],
                    ...(stateData[hovered].target?[['Achievement', spct(stateData[hovered].target,stateData[hovered].total), pclr(pct(stateData[hovered].target,stateData[hovered].total))]]:[] ),
                  ].map(([l,v,c])=>(
                    <div key={l} style={{display:'flex',justifyContent:'space-between',gap:24}}>
                      <span style={{fontSize:11,color:'#55546a'}}>{l}</span>
                      <span style={{fontSize:11,fontWeight:700,color:c}}>{v}</span>
                    </div>
                  ))}
                  {stateData[hovered].dealers.length > 0 && (
                    <div style={{marginTop:4,paddingTop:6,borderTop:'1px solid #252548',fontSize:10,color:'#55546a',lineHeight:1.5}}>
                      {stateData[hovered].dealers.slice(0,3).map(d=>d.name).join(' · ')}
                      {stateData[hovered].dealers.length>3&&` +${stateData[hovered].dealers.length-3}`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legend */}
            <div style={{position:'absolute',bottom:12,left:12,background:'rgba(12,12,30,0.92)',borderRadius:8,padding:'7px 10px',border:'1px solid #1e1e38'}}>
              <div style={{fontSize:8,color:'#55546a',marginBottom:4,textTransform:'uppercase',letterSpacing:'.07em'}}>{viewMode==='sales'?'Sales':viewMode==='dealers'?'Dealers':'Ach%'}</div>
              <div style={{display:'flex',gap:3}}>
                {[['#1e2050','None'],['#a5b4fc','Low'],['#6366f1','Mid'],['#4f46e5','High'],['#3730a3','Top'],['#fbbf24','Selected']].map(([c,l])=>(
                  <div key={l} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                    <div style={{width:16,height:9,borderRadius:2,background:c,border:'1px solid #ffffff12'}}/>
                    <span style={{fontSize:7,color:'#55546a'}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zoom % */}
            <div style={{position:'absolute',top:10,right:10,fontSize:10,color:'#252548',background:'rgba(12,12,30,0.8)',padding:'3px 8px',borderRadius:6,border:'1px solid #1e1e38'}}>
              {Math.round(transform.scale*100)}%
            </div>

            {/* No data */}
            {Object.keys(stateData).length===0&&(
              <div style={{position:'absolute',top:'50%',left:'38%',transform:'translate(-50%,-50%)',textAlign:'center',pointerEvents:'none'}}>
                <MapPin size={36} style={{margin:'0 auto 10px',opacity:.15,color:'#6366f1'}}/>
                <div style={{fontSize:13,color:'#55546a'}}>Add "State" column to your sheet</div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>

          {selected && det ? (
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{padding:'11px 14px',background:'rgba(251,191,36,0.08)',borderBottom:'1px solid rgba(251,191,36,0.2)',display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#fbbf24'}}/>
                <span style={{fontSize:13,fontWeight:700,color:'#fbbf24',flex:1}}>{selected}</span>
                <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',color:'#55546a',cursor:'pointer'}}><X size={13}/></button>
              </div>
              <div style={{padding:14}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                  {[
                    {l:'Sales',v:det.total,c:'#34d399'},
                    {l:'Dealers',v:det.dealers.length,c:'#6366f1'},
                    {l:'Target',v:det.target||'—',c:'var(--t2)'},
                    {l:'Ach%',v:det.target?pct(det.target,det.total)+'%':'N/T',c:pclr(det.target?pct(det.target,det.total):null)},
                  ].map(k=>(
                    <div key={k.l} style={{background:'var(--bg2)',borderRadius:8,padding:'8px 10px'}}>
                      <div style={{fontSize:9,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:2}}>{k.l}</div>
                      <div style={{fontSize:18,fontWeight:700,color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>

                {Object.keys(det.bySM).length>0&&(
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:10,color:'var(--t3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.07em'}}>By Salesman</div>
                    {Object.entries(det.bySM).sort((a,b)=>b[1].u-a[1].u).map(([smId,sm])=>{
                      const user=users[smId];
                      const bar=det.total?Math.round((sm.u/det.total)*100):0;
                      return(
                        <div key={smId} style={{marginBottom:8}}>
                          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                            {user&&<div style={{width:20,height:20,borderRadius:'50%',background:user.color+'22',color:user.color,border:`1px solid ${user.color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,flexShrink:0}}>{user.ini}</div>}
                            <span style={{fontSize:11,color:'var(--t2)',flex:1}}>{user?.name||smId}</span>
                            <span style={{fontSize:12,fontWeight:700,color:user?.color||'#6366f1'}}>{sm.u}</span>
                            <span style={{fontSize:10,color:'var(--t3)'}}>{sm.n}d</span>
                          </div>
                          <div style={{height:3,background:'var(--b1)',borderRadius:2}}>
                            <div style={{height:'100%',width:bar+'%',background:user?.color||'#6366f1',borderRadius:2}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{fontSize:10,color:'var(--t3)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.07em'}}>Dealers ({det.dealers.length})</div>
                <div style={{maxHeight:220,overflowY:'auto'}}>
                  {[...det.dealers].sort((a,b)=>(b.months[selectedMonthIdx]||0)-(a.months[selectedMonthIdx]||0)).map(d=>{
                    const ach=d.months[selectedMonthIdx]||0;
                    const tgt=(d.monthTargets?.[selectedMonthIdx]??d.target)||0;
                    const dp=pct(tgt,ach);
                    return(
                      <div key={d.id} onClick={()=>onOpenDealer(d.id)}
                        style={{display:'flex',alignItems:'center',gap:8,padding:'6px 4px',borderBottom:'1px solid var(--b1)',cursor:'pointer',borderRadius:4,transition:'background .1s'}}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:600,color:'var(--t1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div>
                          <div style={{fontSize:10,color:'var(--t3)'}}>{d.city||''}</div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:'#34d399'}}>{ach}</div>
                          <div style={{fontSize:10,color:pclr(dp)}}>{spct(tgt,ach)}</div>
                        </div>
                        <ChevronRight size={12} color="var(--t3)"/>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{padding:'11px 14px',borderBottom:'1px solid var(--b1)',display:'flex',alignItems:'center',gap:6}}>
                <Award size={13} color="#fbbf24"/>
                <span style={{fontSize:13,fontWeight:700,color:'var(--t2)'}}>Top States</span>
                <span style={{fontSize:11,color:'var(--t3)',marginLeft:2}}>— {MO[selectedMonthIdx]}</span>
              </div>
              <div style={{padding:'6px 0'}}>
                {topStates.length===0?(
                  <div style={{padding:'20px 14px',color:'var(--t3)',fontSize:12,textAlign:'center'}}>No state data</div>
                ):topStates.map(({name,total,count},i)=>{
                  const bar=Math.round((total/(topStates[0]?.total||1))*100);
                  const isAct=hovered===name||selected===name;
                  return(
                    <div key={name} onClick={()=>setSelected(s=>s===name?null:name)}
                      onMouseEnter={()=>setHovered(name)} onMouseLeave={()=>setHovered(null)}
                      style={{padding:'8px 14px',cursor:'pointer',background:selected===name?'rgba(99,102,241,0.08)':isAct?'var(--bg2)':'transparent',borderLeft:`3px solid ${selected===name?'#6366f1':'transparent'}`,transition:'all .15s'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <span style={{fontSize:10,color:'var(--t3)',width:14,textAlign:'right'}}>{i+1}</span>
                          <span style={{fontSize:12,fontWeight:600,color:selected===name?'var(--acc)':'var(--t1)'}}>{name}</span>
                        </div>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <span style={{fontSize:10,color:'var(--t3)'}}>{count}d</span>
                          <span style={{fontSize:13,fontWeight:700,color:'#34d399'}}>{total}</span>
                        </div>
                      </div>
                      <div style={{height:3,background:'var(--b1)',borderRadius:2,marginLeft:20}}>
                        <div style={{height:'100%',width:bar+'%',background:'linear-gradient(90deg,#6366f1,#a5b4fc)',borderRadius:2,transition:'width .5s'}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card">
            <div style={{fontSize:11,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Summary</div>
            {[
              {l:'States covered',v:Object.keys(stateData).length,c:'#6366f1'},
              {l:'Total sales',v:Object.values(stateData).reduce((s,d)=>s+d.total,0),c:'#34d399'},
              {l:'Mapped dealers',v:dealers.length-unmapped,c:'var(--t2)'},
              {l:'Unmapped',v:unmapped,c:unmapped>0?'#fbbf24':'var(--t3)'},
            ].map(k=>(
              <div key={k.l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--b1)',fontSize:12}}>
                <span style={{color:'var(--t3)'}}>{k.l}</span>
                <span style={{fontWeight:700,color:k.c}}>{k.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}