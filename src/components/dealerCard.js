import { MO, CURRENT_MONTH_IDX } from '../constants';
import { trendPct, forecast } from '../utils';

const downloadDealerCard=(dealer,users,selectedMonthIdx)=>{
  const sm=users[dealer.salesman];
  const viewAchieved=dealer.months[selectedMonthIdx]||0;
  const viewTarget=dealer.monthTargets?.[selectedMonthIdx]??dealer.target;
  const p=viewTarget?Math.round((viewAchieved/viewTarget)*100):null;
  const tp=trendPct(dealer.months);
  const fc=forecast(dealer.months);
  const total=dealer.months.reduce((a,b)=>a+b,0);

  const canvas=document.createElement('canvas');
  canvas.width=1000; canvas.height=700;
  const ctx=canvas.getContext('2d');

  ctx.fillStyle='#080810'; ctx.fillRect(0,0,1000,700);
  const grad=ctx.createLinearGradient(0,0,1000,0);
  grad.addColorStop(0,'#6366f1'); grad.addColorStop(1,'#a78bfa');
  ctx.fillStyle=grad; ctx.fillRect(0,0,1000,4);

  ctx.fillStyle='#6366f1'; ctx.font='600 11px monospace';
  ctx.fillText('▸ SALES TRACKER PRO',36,36);
  ctx.fillStyle='#e2e0f0'; ctx.font='bold 26px system-ui';
  ctx.fillText(dealer.name,36,70);

  const statusColors={'ACTIVE':'#34d399','ACHIVERS':'#34d399','KEY ACCOUNT':'#a78bfa','INACTIVE':'#fbbf24','DEAD':'#f87171'};
  const sc=statusColors[(dealer.status||'').toUpperCase()]||'#9492a8';
  ctx.fillStyle=sc+'22'; ctx.beginPath(); ctx.roundRect(36,82,(dealer.status||'').length*8+20,22,4); ctx.fill();
  ctx.fillStyle=sc; ctx.font='600 11px system-ui';
  ctx.fillText(dealer.status||'—',46,97);

  let xOff=36+(dealer.status||'').length*8+30;
  if(dealer.zone){ctx.fillStyle='#55546a';ctx.font='12px system-ui';ctx.fillText(dealer.zone,xOff,97);xOff+=dealer.zone.length*8+10;}
  if(dealer.city||dealer.state){ctx.fillStyle='#55546a';ctx.fillText([dealer.city,dealer.state].filter(Boolean).join(', '),xOff,97);}
  if(dealer.category){xOff+=120;ctx.fillStyle='#818cf8';ctx.fillText('Cat: '+dealer.category+(dealer.categoryType?' / '+dealer.categoryType:''),xOff,97);}

  ctx.fillStyle='#1e1e30'; ctx.fillRect(36,110,928,1);

  // KPIs 4x2
  const kpis=[
    {label:MO[selectedMonthIdx]+' Target',value:String(viewTarget||'—'),color:'#e2e0f0'},
    {label:MO[selectedMonthIdx]+' Achieved',value:String(viewAchieved),color:'#34d399'},
    {label:'Achievement',value:p!==null?p+'%':'N/T',color:p===null?'#6b7280':p>=100?'#34d399':p>=60?'#fbbf24':'#f87171'},
    {label:'6-mo Avg',value:String(dealer.avg6m||0),color:'#e2e0f0'},
    {label:'Forecast',value:String(fc),color:'#6366f1'},
    {label:'Trend (3m)',value:(tp>0?'+':'')+tp+'%',color:tp>0?'#34d399':tp<0?'#f87171':'#9492a8'},
    {label:'11mo Total',value:String(total),color:'#e2e0f0'},
    {label:'Credit Days',value:dealer.creditDays?dealer.creditDays+'d':'—',color:'#e2e0f0'},
    {label:'Credit Limit',value:dealer.creditLimit?'₹'+dealer.creditLimit.toLocaleString('en-IN'):'—',color:'#e2e0f0'},
    {label:'Category',value:dealer.category||'—',color:'#818cf8'},
    {label:'Cat Type',value:dealer.categoryType||'—',color:'#818cf8'},
    {label:'Salesman',value:sm?.name||dealer.salesman,color:'#fbbf24'},
  ];
  kpis.forEach((k,i)=>{
    const col=i%4,row=Math.floor(i/4);
    const x=36+col*237,y=126+row*90;
    ctx.fillStyle='#141422'; ctx.beginPath(); ctx.roundRect(x,y,222,74,8); ctx.fill();
    ctx.fillStyle='#55546a'; ctx.font='10px system-ui';
    ctx.fillText(k.label.toUpperCase(),x+12,y+20);
    ctx.fillStyle=k.color; ctx.font='bold 20px system-ui';
    ctx.fillText(k.value,x+12,y+50);
  });

  // Month bar chart
  const chartY=406,chartH=120,chartW=928;
  const barW=Math.floor(chartW/MO.length)-4;
  const maxVal=Math.max(...dealer.months,1);
  ctx.fillStyle='#9492a8'; ctx.font='600 12px system-ui';
  ctx.fillText('11-Month Performance',36,chartY-10);
  dealer.months.forEach((v,i)=>{
    const bh=Math.max((v/maxVal)*(chartH-20),v>0?3:0);
    const bx=36+i*(barW+4),by=chartY+chartH-bh;
    const mt=dealer.monthTargets?.[i]??dealer.target;
    ctx.fillStyle=i===selectedMonthIdx?'#6366f1':'#252538';
    ctx.beginPath(); ctx.roundRect(bx,by,barW,bh,2); ctx.fill();
    if(mt>0){
      const th=Math.max((mt/maxVal)*(chartH-20),2);
      ctx.strokeStyle='#34d39966'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.setLineDash([3,3]);
      ctx.moveTo(bx,chartY+chartH-th); ctx.lineTo(bx+barW,chartY+chartH-th);
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle=i===selectedMonthIdx?'#6366f1':'#55546a';
    ctx.font=i===selectedMonthIdx?'bold 9px system-ui':'9px system-ui';
    ctx.fillText(MO[i].slice(0,3),bx,chartY+chartH+14);
    if(v>0){ctx.fillStyle=i===selectedMonthIdx?'#fff':'#9492a8';ctx.font='9px system-ui';ctx.fillText(v,bx+2,by-4);}
  });

  // Month targets row
  ctx.fillStyle='#55546a'; ctx.font='10px system-ui';
  ctx.fillText('Targets:',36,chartY+chartH+32);
  dealer.months.forEach((v,i)=>{
    const mt=dealer.monthTargets?.[i]??dealer.target;
    const bx=36+i*(barW+4);
    ctx.fillStyle=i===selectedMonthIdx?'var(--acc)':'#55546a';
    ctx.fillText(mt||'—',bx,chartY+chartH+32);
  });

  ctx.fillStyle='#55546a'; ctx.font='11px monospace';
  ctx.fillText(`Generated: ${new Date().toLocaleString('en-IN')} · Salesman: ${sm?.name||dealer.salesman}`,36,680);
  const link=document.createElement('a');
  link.download=`${dealer.name.replace(/[^a-z0-9]/gi,'_')}_${MO[selectedMonthIdx]}.png`;
  link.href=canvas.toDataURL('image/png'); link.click();
};

const shareDealerCard=async(dealer,users,selectedMonthIdx)=>{
  // Build the same canvas as download
  const sm=users[dealer.salesman];
  const viewAchieved=dealer.months[selectedMonthIdx]||0;
  const viewTarget=dealer.monthTargets?.[selectedMonthIdx]??dealer.target;
  const p=viewTarget?Math.round((viewAchieved/viewTarget)*100):null;
  const tp=trendPct(dealer.months);
  const fc=forecast(dealer.months);
  const total=dealer.months.reduce((a,b)=>a+b,0);

  const canvas=document.createElement('canvas');
  canvas.width=1000; canvas.height=700;
  const ctx=canvas.getContext('2d');

  ctx.fillStyle='#080810'; ctx.fillRect(0,0,1000,700);
  const grad=ctx.createLinearGradient(0,0,1000,0);
  grad.addColorStop(0,'#6366f1'); grad.addColorStop(1,'#a78bfa');
  ctx.fillStyle=grad; ctx.fillRect(0,0,1000,4);

  ctx.fillStyle='#6366f1'; ctx.font='600 11px monospace';
  ctx.fillText('▸ SALES TRACKER PRO',36,36);
  ctx.fillStyle='#e2e0f0'; ctx.font='bold 26px system-ui';
  ctx.fillText(dealer.name,36,70);

  const statusColors={'ACTIVE':'#34d399','ACHIVERS':'#34d399','KEY ACCOUNT':'#a78bfa','INACTIVE':'#fbbf24','DEAD':'#f87171'};
  const sc=statusColors[(dealer.status||'').toUpperCase()]||'#9492a8';
  ctx.fillStyle=sc+'22'; ctx.beginPath(); ctx.roundRect(36,82,(dealer.status||'').length*8+20,22,4); ctx.fill();
  ctx.fillStyle=sc; ctx.font='600 11px system-ui';
  ctx.fillText(dealer.status||'—',46,97);

  let xOff=36+(dealer.status||'').length*8+30;
  if(dealer.zone){ctx.fillStyle='#55546a';ctx.font='12px system-ui';ctx.fillText(dealer.zone,xOff,97);xOff+=dealer.zone.length*8+10;}
  if(dealer.city||dealer.state){ctx.fillStyle='#55546a';ctx.fillText([dealer.city,dealer.state].filter(Boolean).join(', '),xOff,97);}
  if(dealer.category){xOff+=120;ctx.fillStyle='#818cf8';ctx.fillText('Cat: '+dealer.category+(dealer.categoryType?' / '+dealer.categoryType:''),xOff,97);}

  ctx.fillStyle='#1e1e30'; ctx.fillRect(36,110,928,1);

  const kpis=[
    {label:MO[selectedMonthIdx]+' Target',value:String(viewTarget||'—'),color:'#e2e0f0'},
    {label:MO[selectedMonthIdx]+' Achieved',value:String(viewAchieved),color:'#34d399'},
    {label:'Achievement',value:p!==null?p+'%':'N/T',color:p===null?'#6b7280':p>=100?'#34d399':p>=60?'#fbbf24':'#f87171'},
    {label:'6-mo Avg',value:String(dealer.avg6m||0),color:'#e2e0f0'},
    {label:'Forecast',value:String(fc),color:'#6366f1'},
    {label:'Trend (3m)',value:(tp>0?'+':'')+tp+'%',color:tp>0?'#34d399':tp<0?'#f87171':'#9492a8'},
    {label:'11mo Total',value:String(total),color:'#e2e0f0'},
    {label:'Credit Days',value:dealer.creditDays?dealer.creditDays+'d':'—',color:'#e2e0f0'},
    {label:'Credit Limit',value:dealer.creditLimit?'₹'+dealer.creditLimit.toLocaleString('en-IN'):'—',color:'#e2e0f0'},
    {label:'Category',value:dealer.category||'—',color:'#818cf8'},
    {label:'Cat Type',value:dealer.categoryType||'—',color:'#818cf8'},
    {label:'Salesman',value:sm?.name||dealer.salesman,color:'#fbbf24'},
  ];
  kpis.forEach((k,i)=>{
    const col=i%4,row=Math.floor(i/4);
    const x=36+col*237,y=126+row*90;
    ctx.fillStyle='#141422'; ctx.beginPath(); ctx.roundRect(x,y,222,74,8); ctx.fill();
    ctx.fillStyle='#55546a'; ctx.font='10px system-ui';
    ctx.fillText(k.label.toUpperCase(),x+12,y+20);
    ctx.fillStyle=k.color; ctx.font='bold 20px system-ui';
    ctx.fillText(k.value,x+12,y+50);
  });

  const chartY=406,chartH=120,chartW=928;
  const barW=Math.floor(chartW/MO.length)-4;
  const maxVal=Math.max(...dealer.months,1);
  ctx.fillStyle='#9492a8'; ctx.font='600 12px system-ui';
  ctx.fillText('11-Month Performance',36,chartY-10);
  dealer.months.forEach((v,i)=>{
    const bh=Math.max((v/maxVal)*(chartH-20),v>0?3:0);
    const bx=36+i*(barW+4),by=chartY+chartH-bh;
    const mt=dealer.monthTargets?.[i]??dealer.target;
    ctx.fillStyle=i===selectedMonthIdx?'#6366f1':'#252538';
    ctx.beginPath(); ctx.roundRect(bx,by,barW,bh,2); ctx.fill();
    if(mt>0){
      const th=Math.max((mt/maxVal)*(chartH-20),2);
      ctx.strokeStyle='#34d39966'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.setLineDash([3,3]);
      ctx.moveTo(bx,chartY+chartH-th); ctx.lineTo(bx+barW,chartY+chartH-th);
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle=i===selectedMonthIdx?'#6366f1':'#55546a';
    ctx.font=i===selectedMonthIdx?'bold 9px system-ui':'9px system-ui';
    ctx.fillText(MO[i].slice(0,3),bx,chartY+chartH+14);
    if(v>0){ctx.fillStyle=i===selectedMonthIdx?'#fff':'#9492a8';ctx.font='9px system-ui';ctx.fillText(v,bx+2,by-4);}
  });

  ctx.fillStyle='#55546a'; ctx.font='11px monospace';
  ctx.fillText(`Generated: ${new Date().toLocaleString('en-IN')} · Salesman: ${sm?.name||dealer.salesman}`,36,680);

  const filename=`${dealer.name.replace(/[^a-z0-9]/gi,'_')}_${MO[selectedMonthIdx]}.png`;

  // Try to share as image file
  if(navigator.share && navigator.canShare){
    try{
      // Convert canvas to Blob then File
      const blob = await new Promise(res=>canvas.toBlob(res,'image/png'));
      const file = new File([blob], filename, {type:'image/png'});
      if(navigator.canShare({files:[file]})){
        await navigator.share({
          title:`${dealer.name} — Sales Report`,
          text:`${dealer.name} · ${MO[selectedMonthIdx]} · Achieved: ${viewAchieved} / ${viewTarget||'—'} · ${p!==null?p+'%':'N/T'}`,
          files:[file],
        });
        return;
      }
    }catch(e){
      if(e.name==='AbortError') return; // user cancelled — don't fallback
    }
  }

  // Fallback: if Web Share API not available or files not supported — download instead
  const link=document.createElement('a');
  link.download=filename;
  link.href=canvas.toDataURL('image/png');
  link.click();
  alert('Image saved! (Web Share not supported on this device/browser)');
};

export { downloadDealerCard, shareDealerCard };