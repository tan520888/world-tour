// sector-flow-board.js - V1.7 独立类目：主力板块资金流向实时刷新，海报风格
(function(){
  const API='/api/sector-flow';
  let timer=null;
  function $(id){return document.getElementById(id)}
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function yi(v){v=Number(v)||0;const n=v/100000000;return (n>=0?'+':'')+n.toFixed(Math.abs(n)>=100?0:1)+'亿'}
  function pct(v){v=Number(v)||0;return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function today(){const d=new Date();return `${String(d.getMonth()+1).padStart(2,'0')}月${String(d.getDate()).padStart(2,'0')}日`}
  function ensure(){
    const root=$('sectorFlowRoot')||$('dash');if(!root)return null;
    let box=$('sectorFlowBoard');
    if(!box){box=document.createElement('div');box.id='sectorFlowBoard';box.className='sector-flow-board';root.insertBefore(box,root.firstChild)}
    return box;
  }
  function mainIndex(indices){const x=(indices||[]).find(i=>i.code==='000001')||(indices||[])[0]||{};return `<div class="sf-index-card"><span>${esc(x.name||'上证指数')}</span><b>${Number(x.price||0).toFixed(2)}</b><em class="${Number(x.pct)>=0?'sf-red':'sf-green'}">${pct(x.pct)}</em></div>`}
  function rows(list,type){
    const max=Math.max(...(list||[]).map(x=>Math.abs(Number(x.main)||0)),1);
    return (list||[]).map((x,i)=>{const w=Math.max(5,Math.min(100,Math.abs(Number(x.main)||0)/max*100));return `<div class="sf-row ${type}"><div class="sf-rank">${i+1}</div><div class="sf-name"><strong>${esc(x.name)}</strong><small>${pct(x.pct)}｜主力占比 ${pct(x.mainPct)}</small></div><div class="sf-bar"><i style="width:${w}%"></i></div><div class="sf-money">${yi(x.main)}</div></div>`}).join('')||'<div class="sf-empty">暂无数据</div>';
  }
  function renderLoading(){const box=ensure();if(!box)return;box.innerHTML=`<div class="sf-poster"><div class="sf-poster-head"><div><div class="sf-date">${today()}</div><h2>主力板块资金流向</h2><p>实时浮动刷新中，正在读取盘中板块资金。</p></div><span class="sf-live">加载中</span></div><div class="sf-panel"><div class="sf-empty">正在读取板块资金流……</div></div></div>`}
  function renderData(d){const box=ensure();if(!box)return;box.innerHTML=`<div class="sf-poster"><div class="sf-poster-head"><div><div class="sf-date">${today()}</div><h2>主力板块资金流向</h2><p>净流入 / 净流出 TOP10，约 30 秒自动刷新。</p></div>${mainIndex(d.indices)}</div><div class="sf-legend"><span class="dot red"></span>主力净流入 <span class="dot green"></span>主力净流出 <em>${esc(d.updated_at||'--')}</em></div><div class="sf-panel"><div class="sf-panel-title"><b>主力板块资金流向</b><span>TOP10 + TOP10</span></div><div class="sf-grid"><section><div class="sf-title in">净流入 TOP10</div>${rows(d.inflow||[],'in')}</section><section><div class="sf-title out">净流出 TOP10</div>${rows(d.outflow||[],'out')}</section></div></div><div class="sf-howto"><b>怎么看：</b>先看指数是否配合，再看流入榜是否集中在同一主线。若高位科技流出、低位电力/算力/机器人流入，通常代表高低切换正在发生。</div><p class="sf-disclaimer">仅作资金热度观察，不构成投资建议；第三方接口可能延迟或短暂不可用。</p></div>`}
  function renderError(msg){const box=ensure();if(!box)return;box.innerHTML=`<div class="sf-poster"><div class="sf-poster-head"><div><div class="sf-date">${today()}</div><h2>主力板块资金流向</h2><p>实时浮动刷新暂不可用。</p></div><button class="btn2" onclick="refreshSectorFlowBoard()">重试</button></div><div class="sf-panel"><div class="sf-empty">${esc(msg||'板块资金流接口暂时不可用')}</div></div></div>`}
  async function refresh(){const box=ensure();if(!box)return;if(!box.dataset.ready){renderLoading();box.dataset.ready='1'}try{const r=await fetch(API+'?t='+Date.now(),{cache:'no-store'});const d=await r.json();if(!d.ok){renderError(d.msg);return}renderData(d)}catch(e){renderError('网络或接口异常，稍后自动重试')}}
  function boot(){refresh();if(timer)clearInterval(timer);timer=setInterval(()=>{if(!document.hidden)refresh()},30000)}
  window.refreshSectorFlowBoard=refresh;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,500);
})();
