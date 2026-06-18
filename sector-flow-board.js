// sector-flow-board.js - V1.8 仿图片级UI（主力板块资金流向）
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
    if(!box){
      box=document.createElement('div');
      box.id='sectorFlowBoard';
      box.className='sector-flow-board';
      root.insertBefore(box,root.firstChild);
    }
    return box;
  }

  function mainIndex(indices){
    const x=(indices||[]).find(i=>i.code==='000001')||(indices||[])[0]||{};
    return `<div class="sf-index-card"><span>${esc(x.name||'上证指数')}</span><b>${Number(x.price||0).toFixed(2)}</b><em class="${Number(x.pct)>=0?'sf-red':'sf-green'}">${pct(x.pct)}</em></div>`;
  }

  function rows(list,type){
    const max=Math.max(...(list||[]).map(x=>Math.abs(Number(x.main)||0)),1);
    return (list||[]).map((x,i)=>{
      const w=Math.max(5,Math.min(100,Math.abs(Number(x.main)||0)/max*100));
      return `<div class="sf-row ${type}"><div class="sf-rank">${i+1}</div><div class="sf-name"><strong>${esc(x.name)}</strong><small>${pct(x.pct)}｜占比 ${pct(x.mainPct)}</small></div><div class="sf-bar"><i style="width:${w}%"></i></div><div class="sf-money">${yi(x.main)}</div></div>`;
    }).join('')||'<div class="sf-empty">暂无数据</div>';
  }

  function renderLoading(){
    const box=ensure();if(!box)return;
    box.innerHTML=`
      <div class="sf-head">
        <div class="left">
          <div class="date">${today()} <span class="tag">收盘</span></div>
          <div class="title">主力板块资金流向</div>
        </div>
        <div class="right">加载中</div>
      </div>
      <div class="sf-empty">正在读取资金流数据...</div>
    `;
  }

  function renderData(d){
    const box=ensure();if(!box)return;
    box.innerHTML=`
      <div class="sf-head">
        <div class="left">
          <div class="date">${today()} <span class="tag">收盘</span></div>
          <div class="title">主力板块资金流向</div>
        </div>
        <div class="right">${mainIndex(d.indices)}</div>
      </div>

      <div class="sf-legend">
        <span class="red">● 主力净流入</span>
        <span class="green">● 主力净流出</span>
        <span class="time">${esc(d.updated_at||'--')}</span>
      </div>

      <div class="sf-grid">
        <div>
          <div class="sf-title in">净流入 TOP10</div>
          ${rows(d.inflow||[],'in')}
        </div>
        <div>
          <div class="sf-title out">净流出 TOP10</div>
          ${rows(d.outflow||[],'out')}
        </div>
      </div>

      <div class="sf-tip">高位科技流出、低位算力/电力/机器人流入 → 风格切换信号</div>
      <div class="sf-foot">仅供资金热度观察，不构成投资建议</div>
    `;
  }

  function renderError(msg){
    const box=ensure();if(!box)return;
    box.innerHTML=`
      <div class="sf-head">
        <div class="left">
          <div class="date">${today()} <span class="tag">收盘</span></div>
          <div class="title">主力板块资金流向</div>
        </div>
        <button onclick="refreshSectorFlowBoard()">重试</button>
      </div>
      <div class="sf-empty">${esc(msg||'接口异常')}</div>
    `;
  }

  async function refresh(){
    const box=ensure();if(!box)return;
    if(!box.dataset.ready){renderLoading();box.dataset.ready='1'}
    try{
      const r=await fetch(API+'?t='+Date.now(),{cache:'no-store'});
      const d=await r.json();
      if(!d.ok){renderError(d.msg);return}
      renderData(d);
    }catch(e){renderError('网络异常')}
  }

  function boot(){
    refresh();
    if(timer)clearInterval(timer);
    timer=setInterval(()=>{if(!document.hidden)refresh()},30000);
  }

  window.refreshSectorFlowBoard=refresh;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else setTimeout(boot,300);
})();
