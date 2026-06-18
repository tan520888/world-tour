// sector-flow-board.js - V1.7 主力板块资金流向实时刷新卡片
(function(){
  const API='/api/sector-flow';
  let timer=null;
  function $(id){return document.getElementById(id)}
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function yi(v){v=Number(v)||0;const n=v/100000000;return (n>=0?'+':'')+n.toFixed(Math.abs(n)>=100?0:1)+'亿'}
  function pct(v){v=Number(v)||0;return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function ensure(){
    const dash=$('dash');if(!dash)return null;
    let box=$('sectorFlowBoard');
    if(!box){
      box=document.createElement('div');box.id='sectorFlowBoard';box.className='card sector-flow-board';
      dash.insertBefore(box,dash.firstChild);
    }
    return box;
  }
  function indexLine(indices){
    if(!indices||!indices.length)return '<div class="sector-index-pill">指数数据加载中</div>';
    return indices.slice(0,4).map(x=>`<div class="sector-index-pill"><b>${esc(x.name)}</b> <span class="${Number(x.pct)>=0?'sf-red':'sf-green'}">${Number(x.price||0).toFixed(2)} ${pct(x.pct)}</span></div>`).join('');
  }
  function rows(list,type){
    const max=Math.max(...(list||[]).map(x=>Math.abs(Number(x.main)||0)),1);
    return (list||[]).map((x,i)=>{const w=Math.max(5,Math.min(100,Math.abs(Number(x.main)||0)/max*100));return `<div class="sf-row ${type}"><div class="sf-rank">${i+1}</div><div class="sf-name"><span>${esc(x.name)}</span><em>${pct(x.pct)}｜占比 ${pct(x.mainPct)}</em></div><div class="sf-bar"><i style="width:${w}%"></i></div><div class="sf-money">${yi(x.main)}</div></div>`}).join('')||'<div class="sf-empty">暂无数据</div>';
  }
  function renderLoading(){const box=ensure();if(!box)return;box.innerHTML='<div class="sf-head"><div><h2>主力板块资金流向</h2><p class="note">实时浮动刷新中，适合观察资金高低切换。</p></div><span class="sf-badge">加载中</span></div><div class="sf-empty">正在读取板块资金流……</div>'}
  function renderData(d){const box=ensure();if(!box)return;box.innerHTML=`<div class="sf-head"><div><h2>主力板块资金流向</h2><p class="note">板块主力净流入 / 净流出 TOP10，约 30 秒自动刷新。</p></div><span class="sf-badge">${esc(d.updated_at||'--')}</span></div><div class="sf-indexes">${indexLine(d.indices)}</div><div class="sf-grid"><div><div class="sf-title in">净流入 TOP10</div>${rows(d.inflow||[],'in')}</div><div><div class="sf-title out">净流出 TOP10</div>${rows(d.outflow||[],'out')}</div></div><p class="sf-disclaimer">仅作资金热度观察，不构成投资建议；第三方接口可能延迟或短暂不可用。</p>`}
  function renderError(msg){const box=ensure();if(!box)return;box.innerHTML=`<div class="sf-head"><div><h2>主力板块资金流向</h2><p class="note">实时浮动刷新暂不可用。</p></div><button class="btn2" onclick="refreshSectorFlowBoard()">重试</button></div><div class="sf-empty">${esc(msg||'板块资金流接口暂时不可用')}</div>`}
  async function refresh(){
    const box=ensure();if(!box)return;if(!box.dataset.ready){renderLoading();box.dataset.ready='1'}
    try{const r=await fetch(API+'?t='+Date.now(),{cache:'no-store'});const d=await r.json();if(!d.ok){renderError(d.msg);return}renderData(d)}catch(e){renderError('网络或接口异常，稍后自动重试')}
  }
  function boot(){refresh();if(timer)clearInterval(timer);timer=setInterval(()=>{if(!document.hidden)refresh()},30000)}
  window.refreshSectorFlowBoard=refresh;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,500);
})();
