import React from 'react';
export default function Styles({theme}){
  return(
    <style>{`
    :root,[data-theme="dark"]{--bg:#080810;--bg1:#0e0e1a;--bg2:#141422;--bg3:#1a1a2e;--b1:#1e1e30;--b2:#252538;--t1:#e2e0f0;--t2:#9492a8;--t3:#55546a;--acc:#6366f1;--accL:rgba(99,102,241,0.15);--grn:#34d399;--yel:#fbbf24;--red:#f87171;--pur:#a78bfa;}
    [data-theme="light"]{--bg:#f0f2f8;--bg1:#ffffff;--bg2:#f5f7fc;--bg3:#eef0f8;--b1:#e2e4f0;--b2:#d4d7e8;--t1:#1a1a2e;--t2:#4a4a6a;--t3:#8888aa;--acc:#4f52d8;--accL:rgba(79,82,216,0.1);--grn:#059669;--yel:#d97706;--red:#dc2626;--pur:#7c3aed;}
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:var(--bg);color:var(--t1);font-family:Inter,system-ui,sans-serif;font-size:14px;transition:background .2s,color .2s}
    ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:var(--bg1)}::-webkit-scrollbar-thumb{background:var(--b2);border-radius:3px}
    button{cursor:pointer;font-family:inherit}input,select,textarea,button{font-family:inherit;font-size:13px}input,select,textarea{outline:none}
    @keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:scale(.94)}100%{opacity:1;transform:scale(1)}}
    .fade{animation:fadeIn .25s ease}.spin{animation:spin .7s linear infinite}
    #topbar{height:50px;background:var(--bg1);border-bottom:1px solid var(--b1);display:flex;align-items:center;padding:0 14px;gap:10px;flex-shrink:0;z-index:100}
    #body{display:flex;flex:1;overflow:hidden}
    #sidebar{width:200px;background:var(--bg1);border-right:1px solid var(--b1);display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto;transition:width .25s,transform .25s}
    #sidebar.closed{width:0;overflow:hidden;border:none}
    #main{flex:1;overflow-y:auto;padding:22px;min-width:0}
    #sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:50}#sb-overlay.open{display:block}
    @media(max-width:768px){#sidebar{position:fixed;left:0;top:50px;bottom:0;width:240px;z-index:60;transform:translateX(0);box-shadow:4px 0 20px rgba(0,0,0,.3)}#sidebar.closed{transform:translateX(-100%);width:240px;border-right:1px solid var(--b1)}}
    .nav-item{padding:9px 16px;font-size:13px;cursor:pointer;color:var(--t3);border-left:2px solid transparent;display:flex;align-items:center;gap:9px;transition:all .15s;user-select:none}
    .nav-item:hover{color:var(--t2);background:rgba(255,255,255,.03)}.nav-item.active{color:var(--acc);border-left-color:var(--acc);background:var(--accL)}
    .nav-sec{padding:14px 16px 6px;font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.15em}
    .card{background:var(--bg1);border:1px solid var(--b1);border-radius:12px;padding:18px 20px}
    .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
    .stat-card{background:var(--bg1);border:1px solid var(--b1);border-radius:10px;padding:14px 16px;transition:transform .15s,box-shadow .15s}.stat-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.3)}
    .prog-bar{height:3px;background:var(--b1);border-radius:2px;margin-top:8px;overflow:hidden}.prog-fill{height:100%;border-radius:2px;transition:width .8s cubic-bezier(.4,0,.2,1)}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{padding:9px 11px;text-align:left;color:var(--t3);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--b1);white-space:nowrap;background:var(--bg1);position:sticky;top:0;z-index:2}
    th.sort{cursor:pointer}th.sort:hover{color:var(--acc)}
    td{padding:8px 11px;border-bottom:1px solid var(--b2);color:var(--t2);vertical-align:middle;white-space:nowrap}
    tr:hover td{background:var(--bg2)}tfoot td{background:var(--bg2);font-weight:700}
    .inp{background:var(--bg2);border:1px solid var(--b2);border-radius:7px;padding:8px 12px;color:var(--t1);width:100%}.inp:focus{border-color:var(--acc);box-shadow:0 0 0 3px var(--accL)}
    .sel{background:var(--bg2);border:1px solid var(--b2);border-radius:7px;padding:7px 10px;color:var(--t1);cursor:pointer}.sel:focus{border-color:var(--acc)}
    .btn{background:var(--bg2);border:1px solid var(--b2);border-radius:7px;padding:7px 14px;color:var(--t2);transition:all .15s}.btn:hover:not(:disabled){background:var(--bg3);color:var(--t1)}.btn:disabled{opacity:.5;cursor:not-allowed}
    .btnp{background:var(--acc);border:1px solid var(--acc);border-radius:7px;padding:8px 18px;color:#fff;font-weight:500;transition:all .15s;display:inline-flex;align-items:center;gap:5px}.btnp:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px)}
    .btnd{background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,.25);border-radius:6px;padding:5px 10px;color:var(--red);font-size:12px;display:inline-flex;align-items:center;gap:4px}
    .btne{background:var(--accL);border:1px solid rgba(99,102,241,.3);border-radius:6px;padding:5px 10px;color:var(--pur);font-size:12px}
    .theme-toggle{width:38px;height:20px;border-radius:10px;background:var(--bg3);border:1px solid var(--b2);position:relative;cursor:pointer;flex-shrink:0;transition:background .3s}.theme-toggle::after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--acc);transition:transform .3s}[data-theme="light"] .theme-toggle::after{transform:translateX(18px)}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(3px);padding:20px}
    .modal{background:var(--bg1);border:1px solid var(--b2);border-radius:14px;padding:26px;max-height:92vh;overflow-y:auto;width:100%;animation:popIn .2s ease}
    .field{margin-bottom:12px}.field label{display:block;font-size:11px;color:var(--t3);margin-bottom:4px;text-transform:uppercase;letter-spacing:.07em}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.full{grid-column:1/-1}.row{display:flex;align-items:center;gap:8px}.spacer{flex:1}
    .tabs{display:flex;gap:2px;border-bottom:1px solid var(--b1);margin-bottom:18px;overflow-x:auto}
    .tab{padding:9px 16px;font-size:13px;cursor:pointer;background:none;border:none;border-bottom:2px solid transparent;color:var(--t3);margin-bottom:-1px;transition:all .15s;white-space:nowrap}.tab.active{color:var(--acc);border-bottom-color:var(--acc);font-weight:600}
    .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
    .chip{background:var(--bg3);border:1px solid var(--b2);border-radius:4px;padding:2px 7px;font-size:11px;color:var(--t3)}
    .insight-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:14px;font-size:12px;font-weight:500;border:1px solid currentColor;opacity:.9}
    .skel{background:linear-gradient(90deg,var(--bg2) 0%,var(--bg3) 50%,var(--bg2) 100%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:6px;display:block}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @media(max-width:768px){.stat-grid{grid-template-columns:1fr 1fr}#main{padding:12px}.hmob{display:none}}
    @media(max-width:480px){.stat-grid{grid-template-columns:1fr}}
    `}</style>
  );
}
